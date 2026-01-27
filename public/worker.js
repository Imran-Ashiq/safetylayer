// SafetyLayer PWA Service Worker (Enhanced)
// Strategy: Network-First for Navigation, Stale-While-Revalidate for Assets
const CACHE_NAME = 'safetylayer-v7-nuclear'; // Incremented version to force update
const PRECACHE_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/SafetyLayer.png',
  '/web-app-manifest-192x192.png',
  '/web-app-manifest-512x512.png',
];

self.addEventListener('install', (event) => {
  console.log('[Worker] Installing:', CACHE_NAME);
  self.skipWaiting(); // Take control immediately

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      const cachePromises = PRECACHE_ASSETS.map((url) => {
        // Cache-busting fetch to ensure fresh assets on install
        return fetch(`${url}?v=${Date.now()}`, { cache: 'no-store' })
          .then((response) => {
            if (response.ok) {
              console.log('[Worker] Precaching:', url);
              return cache.put(url, response); // Store against clean URL
            }
          })
          .catch(err => console.error('[Worker] Precache failed:', url, err));
      });
      return Promise.all(cachePromises);
    })
  );
});

self.addEventListener('activate', (event) => {
  console.log('[Worker] Activated');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Control clients immediately
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[Worker] SKIP_WAITING received');
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const isNavigate = event.request.mode === 'navigate';
  const isStaticAsset = 
    url.pathname.startsWith('/_next/static/') || 
    url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|ico)$/);

  // 1. Navigation (HTML): Network First -> Cache (App Shell) -> Offline Page
  if (isNavigate) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // If online and valid, update cache
          if (response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => {
          console.log('[Worker] Offline navigation, trying cache...');
          return caches.match(event.request)
            .then((cachedRes) => {
              if (cachedRes) return cachedRes;
              
              // Fallback to App Shell logic:
              // Try to find '/', assuming it's the app shell
              return caches.match('/', { ignoreSearch: true, ignoreVary: true });
            })
            .then((finalRes) => {
              // If app shell missing, show offline page
              return finalRes || caches.match('/offline.html');
            });
        })
    );
    return;
  }

  // 2. Static Assets: Stale-While-Revalidate
  // Use Cache immediately, then update in background
  if (isStaticAsset) {
    event.respondWith(
      caches.match(event.request, { ignoreSearch: true }).then((cachedResponse) => {
        // Even if in cache, try to update it for next time
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return networkResponse;
        }).catch(() => {
          // Network failed, nothing to do. If we had cachedResponse, we're good.
        });

        // Return cache if available, otherwise wait for network
        return cachedResponse || fetchPromise;
      })
    );
    return;
  }
});
