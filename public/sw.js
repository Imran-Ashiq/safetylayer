// SafetyLayer Service Worker - Offline Support for Privacy
// IMPORTANT: Increment version to bust cache on updates
const CACHE_VERSION = 'v3';
const CACHE_NAME = `safetylayer-${CACHE_VERSION}`;

// Pages to pre-cache for offline access
const PAGES_TO_CACHE = [
  '/',
  '/settings',
  '/blog',
];

// Static assets to pre-cache
const STATIC_ASSETS = [
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/SafetyLayer.png',
];

// All assets to pre-cache during install
const ALL_PRECACHE = [...PAGES_TO_CACHE, ...STATIC_ASSETS];

// Install event - cache all critical assets including pages
self.addEventListener('install', (event) => {
  console.log(`SafetyLayer SW: Installing ${CACHE_VERSION}`);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('SafetyLayer SW: Pre-caching pages and assets');
        // Cache all assets - if any fail, continue with others
        return Promise.allSettled(
          ALL_PRECACHE.map(url => 
            cache.add(url).catch(err => {
              console.warn(`SafetyLayer SW: Failed to cache ${url}:`, err);
            })
          )
        );
      })
      .then(() => {
        console.log('SafetyLayer SW: Skip waiting, activating immediately');
        return self.skipWaiting();
      })
  );
});

// Activate event - delete ALL old caches and claim clients immediately
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
    }).then(() => {
      // Force refresh all open tabs to get new content
      return self.clients.matchAll({ type: 'window' }).then((clients) => {
        clients.forEach((client) => {
          console.log('SafetyLayer SW: Notifying client to refresh');
          client.postMessage({ type: 'SW_UPDATED', version: CACHE_VERSION });
        });
      });
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
    // NETWORK-FIRST for HTML pages - always get latest, cache for offline
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Always cache successful page responses for offline use
          if (response.ok) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
              console.log(`SafetyLayer SW: Cached page ${url.pathname}`);
            });
          }
          return response;
        })
        .catch(() => {
          console.log(`SafetyLayer SW: Offline, serving cached ${url.pathname}`);
          // Network failed - serve cached version, fallback to homepage
          return caches.match(event.request)
            .then((cached) => {
              if (cached) return cached;
              // If specific page not cached, serve homepage
              return caches.match('/');
            });
        })
    );
  } else if (isStaticAsset) {
    // CACHE-FIRST for static assets (icons, fonts, images)
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
    // STALE-WHILE-REVALIDATE for JS/CSS - serve cached immediately, update in background
    event.respondWith(
      caches.match(event.request).then((cached) => {
        const fetchPromise = fetch(event.request).then((response) => {
          if (response.ok) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        }).catch(() => cached);

        // Return cached immediately if available, otherwise wait for network
        return cached || fetchPromise;
      })
    );
  }
});

// Message event - handle skip waiting
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
