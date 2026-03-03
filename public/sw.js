const CACHE_NAME    = 'jaborandi-transp-v3'   // corrigido: 'transpp' → 'transp'
const DATA_CACHE    = 'jaborandi-data-v3'      // cache separado para dados do Supabase
const FONT_CACHE    = 'jaborandi-fonts-v3'     // cache separado para fontes

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
]

// ─── INSTALL ────────────────────────────────────────────────────────────────
// skipWaiting() agora está dentro da chain do waitUntil,
// garantindo que o cache esteja completo antes de ativar o SW.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  )
})

// ─── ACTIVATE ───────────────────────────────────────────────────────────────
// clients.claim() agora está dentro da chain do waitUntil,
// garantindo que caches antigos sejam deletados antes de assumir controle.
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

// ─── FETCH ──────────────────────────────────────────────────────────────────
self.addEventListener('fetch', event => {
  const url = event.request.url

  // 1. Dados do Supabase — Network-first com fallback para cache.
  //    Se tiver rede: busca, salva no DATA_CACHE e retorna.
  //    Se offline: serve o cache da última requisição bem-sucedida.
  if (url.includes('supabase.co')) {
    event.respondWith(
      fetch(event.request.clone())
        .then(response => {
          if (response.ok) {
            const clone = response.clone()
            caches.open(DATA_CACHE).then(cache => cache.put(event.request, clone))
          }
          return response
        })
        .catch(() => caches.match(event.request))
    )
    return
  }

  // 2. Fontes do Google — Stale-While-Revalidate.
  //    Serve do cache imediatamente (rápido), atualiza em background.
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

  // 3. Assets estáticos (incluindo JS/CSS com hash do Vite) — Cache-first.
  //    Se não estiver em cache, busca na rede e armazena para próxima vez.
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
            // clone() deve ser chamado ANTES do return response,
            // pois após o browser consumir o body original o clone falha
            const toCache = response.clone()
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, toCache))
          }
          return response
        })
        .catch(() => {
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html')
          }
          return new Response('', { status: 503, statusText: 'Service Unavailable' })
        })
    })
  )
})
