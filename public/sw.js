// public/sw.js — Service Worker do JaborandiTransp v7
//
// Mudança principal: atualização AUTOMÁTICA para todos os usuários.
// Quando um novo deploy chega, o SW ativa imediatamente e recarrega
// todas as abas abertas — sem o usuário precisar fazer nada.
//
// Estratégias de cache:
//   1. Dados do Supabase → Network-first com fallback para cache
//   2. Fontes (Google Fonts) → Stale-While-Revalidate
//   3. Assets estáticos → Network-first (garante bundle novo sempre)

const CACHE_NAME = 'jaborandi-transp-v7'
const DATA_CACHE = 'jaborandi-data-v7'
const FONT_CACHE = 'jaborandi-fonts-v7'

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
]

// ── INSTALL ──────────────────────────────────────────────────────────────────
// skipWaiting() faz o novo SW ativar imediatamente, sem esperar
// que o usuário feche todas as abas.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  )
})

// ── ACTIVATE ─────────────────────────────────────────────────────────────────
// clients.claim() assume controle de todas as abas abertas imediatamente.
// Depois envia mensagem SW_UPDATED para cada aba recarregar sozinha.
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
      .then(() =>
        self.clients.matchAll({ type: 'window' }).then(clients =>
          clients.forEach(client => client.postMessage({ type: 'SW_UPDATED' }))
        )
      )
  )
})

// ── MESSAGE ───────────────────────────────────────────────────────────────────
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

// ── FETCH ────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', event => {
  const url = event.request.url

  // 1. Dados do Supabase — Network-first com fallback para cache
  if (url.includes('supabase.co') && event.request.method === 'GET') {
    event.respondWith(
      fetch(event.request.clone())
        .then(response => {
          if (response.ok && response.status === 200) {
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

  // 2. Fontes do Google — Stale-While-Revalidate
  if (url.includes('fonts.googleapis.com') || url.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.open(FONT_CACHE).then(cache =>
        cache.match(event.request).then(cached => {
          const networkFetch = fetch(event.request).then(response => {
            if (response.ok && response.type !== 'opaque') {
              cache.put(event.request, response.clone())
            }
            return response
          })
          return cached || networkFetch
        })
      )
    )
    return
  }

  // 3. Assets estáticos — Network-first
  // Sempre busca na rede primeiro para garantir o bundle mais novo.
  // Só usa cache se estiver offline.
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (
          response.ok &&
          response.status === 200 &&
          response.type !== 'opaque' &&
          event.request.url.startsWith(self.location.origin)
        ) {
          const toCache = response.clone()
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, toCache))
        }
        return response
      })
      .catch(() =>
        caches.match(event.request).then(cached => {
          if (cached) return cached
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html')
          }
          return new Response('', { status: 503, statusText: 'Service Unavailable' })
        })
      )
  )
})
