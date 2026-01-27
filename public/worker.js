// SafetyLayer PWA Service Worker (New Filename)
// File: worker.js
// Version: v5 (Filename Cache Bust)
// Strategy: Network-First for Pages, Cache-First for hashed assets
const CACHE_NAME = 'safetylayer-mobile-v5-worker';

// 1. Assets that MUST be available immediately
const PRECACHE_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/web-app-manifest-192x192.png',
  '/web-app-manifest-512x512.png',
  '/SafetyLayer.png',
];

self.addEventListener('install', (event) => {
  console.log('[Worker] Installing v5:', CACHE_NAME);
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Force fresh fetch for all precached assets using a timestamp
      // This ensures we NEVER retrieve the old Green UI from a stale HTTP cache
      const cachePromises = PRECACHE_ASSETS.map((url) => {
        return fetch(url + '?v=' + Date.now().toString(), { cache: 'no-store' })
          .then((response) => {
            if (response.ok) {
              // Store using the CLEAN url (without query param)
              return cache.put(url, response);
            }
          })
          .catch((err) => console.warn('[Worker] Cache fail:', url, err));
      });
      return Promise.all(cachePromises);
    })
  );
});

self.addEventListener('activate', (event) => {
  console.log('[Worker] Activated v5');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete ALL caches that don't match exactly the new name
          // This includes 'safetylayer-mobile-v4', 'sl-v8', etc.
          if (cacheName !== CACHE_NAME) {
            console.log('[Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const isNavigate = event.request.mode === 'navigate';
  const isNextStatic = url.pathname.startsWith('/_next/static/');
  const isPublicAsset = PRECACHE_ASSETS.some(asset => url.pathname.endsWith(asset));

  // A. Navigation: Network First -> Cache Fallback -> Offline Page
  if (isNavigate) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => {
          // 1. Try Exact URL
          return caches.match(event.request, { ignoreSearch: true, ignoreVary: true })
            .then((res) => {
               if (res) return res;
               
               // 2. Try Root '/'
               return caches.match('/', { ignoreSearch: true, ignoreVary: true });
            })
            .then((res) => {
              if (res) return res;
              
              // 3. Try Offline HTML
              return caches.match('/offline.html');
            });
        })
    );
    return;
  }

  // B. Next.js Static: Cache First
  if (isNextStatic) {
    event.respondWith(
      caches.match(event.request, { ignoreSearch: true, ignoreVary: true })
        .then((cached) => {
          return cached || fetch(event.request).then((res) => {
            if (res.ok) {
              const clone = res.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
            }
            return res;
          });
        })
    );
    return;
  }

  // C. Public Assets: Stale-While-Revalidate
  if (isPublicAsset) {
    event.respondWith(
      caches.match(event.request, { ignoreSearch: true, ignoreVary: true })
        .then((cached) => {
          const fetchPromise = fetch(event.request).then((res) => {
             if (res.ok) {
               caches.open(CACHE_NAME).then((cache) => cache.put(event.request, res.clone()));
             }
             return res;
          });
          return cached || fetchPromise;
        })
    );
    return;
  }
});
