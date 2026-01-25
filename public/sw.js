// SafetyLayer Service Worker - Offline Support for Privacy
// IMPORTANT: Increment version to bust cache on updates
const CACHE_VERSION = 'v2';
const CACHE_NAME = `safetylayer-${CACHE_VERSION}`;
const OFFLINE_URL = '/';

// Static assets to pre-cache (icons only - pages fetched fresh)
const STATIC_ASSETS = [
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/SafetyLayer.png',
];

// Install event - cache static assets and skip waiting immediately
self.addEventListener('install', (event) => {
  console.log(`SafetyLayer SW: Installing ${CACHE_VERSION}`);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('SafetyLayer SW: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('SafetyLayer SW: Skip waiting, activating immediately');
        return self.skipWaiting();
      })
  );
});

// Activate event - delete ALL old caches and claim clients
self.addEventListener('activate', (event) => {
  console.log(`SafetyLayer SW: Activating ${CACHE_VERSION}`);
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => {
            console.log(`SafetyLayer SW: Deleting old cache: ${cacheName}`);
            return caches.delete(cacheName);
          })
      );
    }).then(() => {
      console.log('SafetyLayer SW: Claiming all clients');
      return self.clients.claim();
    })
  );
});

// Fetch event - Network-First for pages, Cache-First for static assets
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip external resources
  if (!event.request.url.startsWith(self.location.origin)) return;

  const url = new URL(event.request.url);
  const isStaticAsset = STATIC_ASSETS.some(asset => url.pathname === asset) ||
                        url.pathname.match(/\.(png|jpg|jpeg|svg|ico|woff2?)$/);
  const isNavigationRequest = event.request.mode === 'navigate';

  if (isNavigationRequest) {
    // NETWORK-FIRST for HTML pages - always get latest
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache successful responses
          if (response.ok) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // Network failed - serve cached version or offline page
          return caches.match(event.request)
            .then((cached) => cached || caches.match(OFFLINE_URL));
        })
    );
  } else if (isStaticAsset) {
    // CACHE-FIRST for static assets (icons, fonts)
    event.respondWith(
      caches.match(event.request)
        .then((cached) => {
          if (cached) return cached;
          return fetch(event.request).then((response) => {
            if (response.ok) {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache);
              });
            }
            return response;
          });
        })
    );
  } else {
    // NETWORK-FIRST for everything else (JS, CSS, API)
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  }
});

// Message event - handle skip waiting
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
