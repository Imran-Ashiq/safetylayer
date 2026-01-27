// SafetyLayer PWA Service Worker
// Version: v3 (Manifest Start URL Fix)
// Strategy: Network-First for Pages, Cache-First for hashed assets
const CACHE_NAME = 'safetylayer-mobile-v3';

// 1. Assets that MUST be available immediately
const PRECACHE_ASSETS = [
  '/', // Only cache root, let the start_url fall back to this or fetch fresh
  '/manifest.json',
  '/web-app-manifest-192x192.png',
  '/web-app-manifest-512x512.png',
  '/SafetyLayer.png',
];

self.addEventListener('install', (event) => {
  console.log('[SW] Installing v3:', CACHE_NAME);
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Force fresh fetch for all precached assets
      const cachePromises = PRECACHE_ASSETS.map((url) => {
        return fetch(url + '?v=' + Date.now(), { cache: 'no-store' })
          .then((response) => {
            if (response.ok) {
              return cache.put(url, response);
            }
          })
          .catch((err) => console.warn('[SW] Cache fail:', url, err));
      });
      return Promise.all(cachePromises);
    })
  );
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activated v3');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Claiming clients');
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const isNavigate = event.request.mode === 'navigate';
  const isNextStatic = url.pathname.startsWith('/_next/static/');
  const isPublicAsset = PRECACHE_ASSETS.some(asset => url.pathname.endsWith(asset));

  // A. Navigation: Network First -> Cache Fallback
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
          return caches.match(event.request, { ignoreSearch: true, ignoreVary: true })
            .then((res) => {
               if (res) return res;
               // Fallback to '/', even if they asked for '/?source=pwa_force_update'
               return caches.match('/', { ignoreSearch: true, ignoreVary: true });
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
