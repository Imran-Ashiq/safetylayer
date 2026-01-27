// SafetyLayer Service Worker v8 - The "Deep Clean" Edition
// BUILD TIMESTAMP: 20260127-v8
var BUILD_TIMESTAMP = '20260127-v8';
var CACHE_NAME = 'sl-' + BUILD_TIMESTAMP;

console.log('[SW] Loading v8: ' + CACHE_NAME);

// Core pages to cache immediately
var PRECACHE_PAGES = [
  '/',
  '/settings',
  '/blog'
];

// Static assets to cache immediately
var PRECACHE_ASSETS = [
  '/manifest.json',
  '/web-app-manifest-192x192.png',
  '/web-app-manifest-512x512.png',
  '/SafetyLayer.png'
];

// INSTALL: Cache Pages AND their Sub-Resources (JS/CSS)
self.addEventListener('install', function(event) {
  console.log('[SW] Installing ' + CACHE_NAME);
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME).then(async function(cache) {
      
      // 1. Cache Static Assets
      await Promise.allSettled(PRECACHE_ASSETS.map(function(url) {
        var bustUrl = url + '?v=' + BUILD_TIMESTAMP;
        return fetch(bustUrl, { cache: 'no-store' }).then(function(res) {
          if (res.ok) return cache.put(url, res);
        });
      }));

      // 2. Cache Pages AND Parse for JS/CSS
      for (var i = 0; i < PRECACHE_PAGES.length; i++) {
        var pageUrl = PRECACHE_PAGES[i];
        try {
          // Fetch Page with cache busting
          var pageRes = await fetch(pageUrl + '?v=' + BUILD_TIMESTAMP, { cache: 'no-store' });
          if (pageRes.ok) {
            // Cache the page
            await cache.put(pageUrl, pageRes.clone());
            console.log('[SW] Cached Page:', pageUrl);

            // Parse HTML to find JS/CSS
            var html = await pageRes.text();
            var resources = extractResources(html);
            console.log('[SW] Found ' + resources.length + ' resources for ' + pageUrl);
            
            // Cache resources
            await Promise.allSettled(resources.map(function(resUrl) {
               return fetch(resUrl).then(function(res) {
                 if (res.ok) return cache.put(resUrl, res);
               });
            }));
          }
        } catch (e) {
          console.warn('[SW] Failed to cache page ' + pageUrl, e);
        }
      }
    })
  );
});

// Helper to extract Next.js static resources
function extractResources(html) {
  var resources = [];
  // Match script src
  var scriptRegex = /src=["'](\/_next\/static\/[^"']+)["']/g;
  var match;
  while ((match = scriptRegex.exec(html)) !== null) {
    resources.push(match[1]);
  }
  // Match css href
  var linkRegex = /href=["'](\/_next\/static\/[^"']+\.css[^"']*)["']/g;
  while ((match = linkRegex.exec(html)) !== null) {
    resources.push(match[1]);
  }
  return resources;
}

// ACTIVATE: Cleanup old caches
self.addEventListener('activate', function(event) {
  console.log('[SW] Activating ' + CACHE_NAME);
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(name) {
          if (name !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          }
        })
      );
    }).then(function() {
      return self.clients.claim();
    }).then(function() {
      // Notify clients
      return self.clients.matchAll();
    }).then(function(clients) {
      clients.forEach(function(client) {
        client.postMessage({ type: 'SW_ACTIVATED', version: BUILD_TIMESTAMP });
      });
    })
  );
});

// FETCH: Network First -> Cache Fallback (Ignore parameters)
self.addEventListener('fetch', function(event) {
  var request = event.request;
  
  if (request.method !== 'GET') return;
  if (!request.url.startsWith(self.location.origin)) return;
  
  var url = new URL(request.url);

  // 1. Navigation
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).then(function(response) {
        if (response.ok) {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(request, clone);
          });
        }
        return response;
      }).catch(function() {
        console.log('[SW] Offline navigate: ' + url.pathname);
        // Try exact match with ignoreSearch/ignoreVary
        return caches.match(request, { ignoreSearch: true, ignoreVary: true }).then(function(cached) {
          if (cached) return cached;
          // Fallback to homepage
          return caches.match('/', { ignoreSearch: true, ignoreVary: true });
        });
      })
    );
    return;
  }

  // 2. Static Assets (JS/CSS)
  if (url.pathname.startsWith('/_next/')) {
    event.respondWith(
      caches.match(request, { ignoreSearch: true, ignoreVary: true }).then(function(cached) {
        if (cached) return cached;
        return fetch(request).then(function(res) {
          if (res.ok) {
            var clone = res.clone();
            caches.open(CACHE_NAME).then(function(cache) {
              cache.put(request, clone);
            });
          }
          return res;
        });
      })
    );
    return;
  }

  // 3. Default
  event.respondWith(
    fetch(request).then(function(response) {
       return response;
    }).catch(function() {
       return caches.match(request, { ignoreSearch: true, ignoreVary: true });
    })
  );
});
