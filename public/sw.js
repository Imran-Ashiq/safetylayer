// SafetyLayer Service Worker v6 - The "Force Update" Edition
// BUILD TIMESTAMP: 20260127-v6
var BUILD_TIMESTAMP = '20260127-v6';
var CACHE_NAME = 'sl-' + BUILD_TIMESTAMP;

console.log('[SW] Loading v6: ' + CACHE_NAME);

// Pages and assets to cache
var PRECACHE_URLS = [
  '/',
  '/settings',
  '/blog',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/SafetyLayer.png'
];

// INSTALL: Cache essential resources
self.addEventListener('install', function(event) {
  console.log('[SW] Installing ' + CACHE_NAME);
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      // 1. Cache static assets (e.g. icons) - Cache First nature
      var staticPromises = PRECACHE_URLS.map(function(url) {
        // Add cache buster to FORCE network fetch
        var bustUrl = url + (url.indexOf('?') === -1 ? '?' : '&') + 'v=' + BUILD_TIMESTAMP;
        
        return fetch(bustUrl, { cache: 'no-store' })
          .then(function(response) {
            if (response.ok) {
              // Retrieve clean URL for storage
              return cache.put(url, response.clone());
            }
          })
          .catch(function(e) {
            console.warn('[SW] Failed to cache ' + url, e);
          });
      });

      return Promise.all(staticPromises);
    })
  );
});

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
      // Notify clients of the update
      return self.clients.matchAll();
    }).then(function(clients) {
      clients.forEach(function(client) {
        client.postMessage({ type: 'SW_ACTIVATED', version: BUILD_TIMESTAMP });
      });
    })
  );
});

// FETCH: Enhanced Network-First Strategy
self.addEventListener('fetch', function(event) {
  var request = event.request;
  
  if (request.method !== 'GET') return;
  if (!request.url.startsWith(self.location.origin)) return;
  
  var url = new URL(request.url);

  // 1. Navigation (HTML) -> Network First, Fallback to Cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).then(function(response) {
        if (response.ok) {
          // Update cache with fresh copy
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(request, clone);
            
            // Also attempt to cache sub-resources (CSS/JS) found in HTML
            // This is "best effort" parsing
            clone.text().then(function(html) {
              // Find all /_next/static/ URLs
              var regex = /(\/_next\/static\/[^\s"'<>]+)/g;
              var match;
              var resources = [];
              while ((match = regex.exec(html)) !== null) {
                 resources.push(match[1]);
              }
              // Deduplicate
              resources = resources.filter(function(item, pos) {
                return resources.indexOf(item) === pos;
              });
              
              if (resources.length > 0) {
                 // Fetch and cache them
                 resources.forEach(function(resUrl) {
                   fetch(resUrl).then(function(res) {
                     if (res.ok) {
                       cache.put(resUrl, res);
                     }
                   });
                 });
              }
            });
          });
        }
        return response;
      }).catch(function() {
        // Offline: Serve cached page
        return caches.match(request).then(function(cached) {
          return cached || caches.match('/');
        });
      })
    );
    return;
  }

  // 2. Static Assets (JS/CSS/Images) -> Stale-While-Revalidate
  // This ensures fast load (from cache) but updates in background
  if (url.pathname.startsWith('/_next/') || url.pathname.match(/\.(png|jpg|jpeg|svg|ico)$/)) {
     event.respondWith(
       caches.match(request).then(function(cached) {
         var networkFetch = fetch(request).then(function(response) {
           if (response.ok) {
             var clone = response.clone();
             caches.open(CACHE_NAME).then(function(cache) {
               cache.put(request, clone);
             });
           }
           return response;
         });
         
         // Return cached if available, else wait for network
         return cached || networkFetch;
       })
     );
     return;
  }
  
  // 3. Default -> Network First
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
      return caches.match(request);
    })
  );
});
