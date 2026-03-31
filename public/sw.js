// public/sw.js — Service Worker do JaborandiTransp
//
// Estratégias de cache implementadas:
//   1. Dados do Supabase → Network-first com fallback para cache
//   2. Fontes (Google Fonts) → Stale-While-Revalidate
//   3. Assets estáticos (JS, CSS, imagens gerados pelo Vite) → Cache-first
//
// Segurança: apenas respostas com status 200 e tipo não-opaco são armazenadas,
// evitando que erros 404/500 ou respostas cross-origin sem CORS sejam servidos
// indefinidamente no modo offline.

const CACHE_NAME = 'jaborandi-transp-v6'
const DATA_CACHE = 'jaborandi-data-v6'
const FONT_CACHE = 'jaborandi-fonts-v6'

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
]

// ── INSTALL ─────────────────────────────────────────────────────────────────
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

// Mensagem do App para pular a espera e ativar o novo SW imediatamente
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

// ── FETCH ────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', event => {
  const url = event.request.url

  // 1. Dados do Supabase — Network-first com fallback para cache.
  //    Apenas GET é interceptado: POST/PATCH/DELETE nunca devem ser cacheados.
  if (url.includes('supabase.co') && event.request.method === 'GET') {
    event.respondWith(
      fetch(event.request.clone())
        .then(response => {
          // Só armazena respostas bem-sucedidas (evita cachear erros do servidor)
          if (response.ok && response.status === 200) {
            const clone = response.clone()
            caches.open(DATA_CACHE).then(async cache => {
              await cache.put(event.request, clone)
              // Limita o DATA_CACHE a 30 entradas para evitar crescimento ilimitado
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
  if (url.includes('fonts.googleapis.com') || url.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.open(FONT_CACHE).then(cache =>
        cache.match(event.request).then(cached => {
          const networkFetch = fetch(event.request).then(response => {
            // Só armazena fontes com resposta válida (não opacos/erros)
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

  // 3. Assets estáticos (JS, CSS, imagens) — Cache-first.
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached

      return fetch(event.request)
        .then(response => {
          // Armazena apenas respostas bem-sucedidas e não-opacas da própria origem
          if (
            response.ok &&
            response.status === 200 &&
            response.type !== 'opaque' &&
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
