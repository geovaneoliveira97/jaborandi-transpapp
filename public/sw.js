/ public/sw.js — Service Worker do JaborandiTransp
//
// O Service Worker é o responsável por habilitar o funcionamento offline do app
// e a instalação como PWA (Progressive Web App) na tela inicial do celular.
//
// Estratégias de cache implementadas:
//
//   1. Navegação (index.html) → Network-first
//      Sempre tenta buscar o index.html atualizado da rede.
//      Garante que novos deploys sejam carregados sem hard refresh.
//
//   2. Dados do Supabase → Network-first
//      Sempre tenta buscar horários atualizados da rede.
//      Se não houver internet, entrega a última versão salva no cache.
//
//   3. Fontes (Google Fonts) → Stale-While-Revalidate
//      Serve a fonte do cache imediatamente (app carrega rápido),
//      e atualiza a fonte em segundo plano para a próxima visita.
//
//   4. Assets estáticos (JS, CSS, imagens gerados pelo Vite) → Cache-first
//      Entrega do cache para máxima velocidade de carregamento.
//      Os nomes de arquivo com hash do Vite (ex: index-abc123.js) garantem
//      que versões desatualizadas nunca sejam entregues após um novo deploy.

const CACHE_NAME = 'jaborandi-transp-v4'
const DATA_CACHE = 'jaborandi-data-v4'
const FONT_CACHE = 'jaborandi-fonts-v4'

// Arquivos essenciais para o funcionamento offline do app
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
]

// ── INSTALL ──────────────────────────────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  )
})

// ── ACTIVATE ─────────────────────────────────────────────────────────────────
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

// ── FETCH ─────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', event => {
  const url = event.request.url

  // 1. Navegação (index.html) — Network-first.
  //    Sempre busca o index.html atualizado da rede para garantir que
  //    novos deploys sejam carregados sem precisar de hard refresh.
  //    Usa o cache apenas como fallback quando não há internet.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clone = response.clone()
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone))
          return response
        })
        .catch(() => caches.match('/index.html'))
    )
    return
  }

  // 2. Dados do Supabase — Network-first com fallback para cache.
  //    Apenas requisições GET são interceptadas: POST/PATCH/DELETE
  //    não devem ser cacheados pois alteram dados no servidor.
  if (url.includes('supabase.co') && event.request.method === 'GET') {
    event.respondWith(
      fetch(event.request.clone())
        .then(response => {
          if (response.ok) {
            const clone = response.clone()
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

  // 3. Fontes do Google — Stale-While-Revalidate.
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

  // 4. Assets estáticos (JS, CSS, imagens) — Cache-first.
  //    Serve do cache para máxima velocidade. Se não estiver em cache,
  //    busca na rede e armazena para as próximas visitas.
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
          return new Response('', { status: 503, statusText: 'Service Unavailable' })
        })
    })
  )
})
