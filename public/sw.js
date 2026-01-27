// SafetyLayer PWA Service Worker
// Version: v1 (Fresh Start)
// Strategy: Network-First for Pages, Cache-First for hashed assets
const CACHE_NAME = 'safetylayer-v1';

// 1. Assets that MUST be available immediately for the app to look "installed"
const PRECACHE_ASSETS = [
  '/',
  '/manifest.json',
  '/web-app-manifest-192x192.png',
  '/web-app-manifest-512x512.png',
  '/SafetyLayer.png',
  // We can add specific fonts or global CSS here if we extracted them, 
  // but Next.js usage makes that dynamic. '/' covers the critical HTML.
];

self.addEventListener('install', (event) => {
  console.log('[SW] Installing New Version:', CACHE_NAME);
  self.skipWaiting(); // Take over immediately

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Robust install: Use 'no-cache' to ensure we get fresh versions from server during install
      const cachePromises = PRECACHE_ASSETS.map((url) => {
        return fetch(url, { cache: 'no-cache' })
          .then((response) => {
            if (response.ok) {
              return cache.put(url, response);
            }
            console.warn('[SW] Failed to cache during install:', url);
          })
          .catch((err) => console.warn('[SW] Error caching during install:', url, err));
      });
      return Promise.all(cachePromises);
    })
  );
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activated:', CACHE_NAME);
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
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const isNavigate = event.request.mode === 'navigate';
  const isNextStatic = url.pathname.startsWith('/_next/static/');
  const isPublicAsset = PRECACHE_ASSETS.some(asset => url.pathname.endsWith(asset));

  // A. Navigation (Pages): Network First -> Cache Fallback -> Offline Page
  if (isNavigate) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // If valid network response, clone and cache it
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => {
          console.log('[SW] Offline Navigation, trying cache:', url.pathname);
          // Try to find the page in cache
          return caches.match(event.request, { ignoreSearch: true, ignoreVary: true })
            .then((response) => {
              if (response) return response;
              // Fallback to root '/' if specific page not cached
              return caches.match('/', { ignoreSearch: true, ignoreVary: true });
            });
        })
    );
    return;
  }

  // B. Next.js Static Assets (Hashed): Cache First -> Network
  // These files have hashes in filenames, so they never change. We can cache aggressively.
  if (isNextStatic) {
    event.respondWith(
      caches.match(event.request, { ignoreSearch: true, ignoreVary: true })
        .then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          return fetch(event.request).then((networkResponse) => {
            if (networkResponse.ok) {
              const clone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
            }
            return networkResponse;
          });
        })
    );
    return;
  }

  // C. Public Assets (Images, Manifest, etc.): Stale-While-Revalidate
  // Return cache immediately, but update in background.
  if (isPublicAsset || url.pathname.match(/\.(png|jpg|jpeg|svg|json|ico)$/)) {
    event.respondWith(
      caches.match(event.request, { ignoreSearch: true, ignoreVary: true })
        .then((cachedResponse) => {
          const fetchPromise = fetch(event.request).then((networkResponse) => {
             if (networkResponse.ok) {
               const clone = networkResponse.clone();
               caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
             }
             return networkResponse;
          });
          return cachedResponse || fetchPromise;
        })
    );
    return;
  }

  // D. Default: Just fetch (API routes etc)
  return; 
});
