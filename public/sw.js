const CACHE_NAME = 'radar-scout-v1'
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/icons.svg'
]

// Instalação: Pré-cache dos ativos estruturais
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[ServiceWorker] Falha ao pré-cachear alguns arquivos:', err)
      })
    })
  )
  self.skipWaiting()
})

// Ativação: Limpeza de caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    })
  )
  self.clients.claim()
})

// Interceptação de requisições
self.addEventListener('fetch', (event) => {
  const request = event.request
  const url = new URL(request.url)

  // Ignora requisições não-GET ou para APIs externas e Supabase
  if (request.method !== 'GET') return
  if (url.origin !== self.location.origin) return

  // Para navegações de página: Network first com fallback para /index.html em cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 200) {
            const clone = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          }
          return response
        })
        .catch(() => {
          return caches.match('/index.html') || caches.match('/')
        })
    )
    return
  }

  // Para scripts, css, fontes e imagens: Cache first com atualização em segundo plano (Stale-While-Revalidate)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          }
          return networkResponse
        })
        .catch(() => cachedResponse)

      return cachedResponse || fetchPromise
    })
  )
})
