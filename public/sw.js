// public/sw.js — Service Worker do JaborandiTransp
//
// O Service Worker é o responsável por habilitar o funcionamento offline do app
// e a instalação como PWA (Progressive Web App) na tela inicial do celular.
//
// Estratégias de cache implementadas:
//
//   1. Dados do Supabase → Network-first
//      Sempre tenta buscar horários atualizados da rede.
//      Se não houver internet, entrega a última versão salva no cache.
//      Garante que o usuário sempre veja os dados mais recentes quando online.
//
//   2. Fontes (Google Fonts) → Stale-While-Revalidate
//      Serve a fonte do cache imediatamente (app carrega rápido),
//      e atualiza a fonte em segundo plano para a próxima visita.
//
//   3. Assets estáticos (JS, CSS, imagens gerados pelo Vite) → Cache-first
//      Entrega do cache para máxima velocidade de carregamento.
//      Os nomes de arquivo com hash do Vite (ex: index-abc123.js) garantem
//      que versões desatualizadas nunca sejam entregues após um novo deploy.

const CACHE_NAME = 'jaborandi-transp-v3'
const DATA_CACHE = 'jaborandi-data-v3'   // cache separado para dados do Supabase
const FONT_CACHE = 'jaborandi-fonts-v3'  // cache separado para fontes

// Arquivos essenciais para o funcionamento offline do app
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
]

// ── INSTALL ─────────────────────────────────────────────────────────────────
// Ocorre quando o Service Worker é instalado pela primeira vez.
// Pré-carrega os assets estáticos no cache antes de ativar.
// skipWaiting() é chamado após o cache estar completo para ativar imediatamente.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  )
})

// ── ACTIVATE ─────────────────────────────────────────────────────────────────
// Ocorre após a instalação, quando o SW assume o controle das páginas abertas.
// Remove caches de versões anteriores do app para liberar espaço no dispositivo.
// clients.claim() é chamado após a limpeza para assumir controle imediatamente.
self.addEventListener('activate', event => {
  const validCaches = [CACHE_NAME, DATA_CACHE, FONT_CACHE]
  event.waitUntil(
    caches.keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(k => !validCaches.includes(k))
            .map(k => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  )
})

// ── FETCH ────────────────────────────────────────────────────────────────────
// Intercepta todas as requisições de rede e aplica a estratégia de cache
// adequada para cada tipo de recurso.
self.addEventListener('fetch', event => {
  const url = event.request.url

  // 1. Dados do Supabase — Network-first com fallback para cache.
  //    Apenas requisições GET são interceptadas: POST/PATCH/DELETE
  //    não devem ser cacheados pois alteram dados no servidor.
  if (url.includes('supabase.co') && event.request.method === 'GET') {
    event.respondWith(
      fetch(event.request.clone())
        .then(response => {
          if (response.ok) {
            const clone = response.clone()
            // Limita o DATA_CACHE a 30 entradas para evitar crescimento ilimitado
            // na memória do dispositivo do usuário.
            caches.open(DATA_CACHE).then(async cache => {
              await cache.put(event.request, clone)
              const keys = await cache.keys()
              if (keys.length > 30) {
                await Promise.all(keys.slice(0, keys.length - 30).map(k => cache.delete(k)))
              }
            })
          }
          return response
        })
        .catch(() => caches.match(event.request))
    )
    return
  }

  // 2. Fontes do Google — Stale-While-Revalidate.
  //    Serve do cache imediatamente para não bloquear a renderização,
  //    e atualiza a fonte em segundo plano para a próxima visita.
  if (url.includes('fonts.googleapis.com') || url.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.open(FONT_CACHE).then(cache =>
        cache.match(event.request).then(cached => {
          const networkFetch = fetch(event.request).then(response => {
            cache.put(event.request, response.clone())
            return response
          })
          return cached || networkFetch
        })
      )
    )
    return
  }

  // 3. Assets estáticos (JS, CSS, imagens) — Cache-first.
  //    Serve do cache para máxima velocidade. Se não estiver em cache,
  //    busca na rede e armazena para as próximas visitas.
  //    Nota: clone() deve ser chamado antes do return response,
  //    pois o corpo da resposta só pode ser consumido uma vez.
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached

      return fetch(event.request)
        .then(response => {
          if (
            response.ok &&
            (event.request.url.startsWith(self.location.origin) ||
              event.request.destination === 'script' ||
              event.request.destination === 'style')
          ) {
            const toCache = response.clone()
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, toCache))
          }
          return response
        })
        .catch(() => {
          // Se a navegação falhar (sem internet), entrega o index.html em cache
          // para que o React possa renderizar a tela de erro offline.
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html')
          }
          return new Response('', { status: 503, statusText: 'Service Unavailable' })
        })
    })
  )
})
