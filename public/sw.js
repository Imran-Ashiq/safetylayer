// SafetyLayer Service Worker v5 - Nuclear Cache Busting
// This timestamp MUST be updated on every deploy to bust caches
var BUILD_TIMESTAMP = '20260127-v5';
var CACHE_NAME = 'sl-' + BUILD_TIMESTAMP;

console.log('[SW] Loading SafetyLayer SW: ' + CACHE_NAME);

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

// INSTALL: Aggressively cache with cache-busting
self.addEventListener('install', function(event) {
  console.log('[SW] Installing: ' + CACHE_NAME);
  
  // Skip waiting immediately - take over right away
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      console.log('[SW] Pre-caching resources...');
      
      // Fetch with cache-busting query param
      var cachePromises = PRECACHE_URLS.map(function(url) {
        var bustUrl = url + (url.indexOf('?') >= 0 ? '&' : '?') + '_sw=' + BUILD_TIMESTAMP;
        
        return fetch(bustUrl, { cache: 'no-store' })
          .then(function(response) {
            if (!response.ok) {
              console.warn('[SW] Failed to fetch: ' + url);
              return;
            }
            
            // Store with original URL (without cache buster)
            cache.put(url, response.clone());
            console.log('[SW] Cached: ' + url);
            
            // For HTML pages, also cache their JS/CSS resources
            if (url === '/' || url === '/settings' || url === '/blog') {
              return response.text().then(function(html) {
                return cachePageResources(cache, html);
              });
            }
          })
          .catch(function(err) {
            console.warn('[SW] Cache failed for: ' + url, err);
          });
      });
      
      return Promise.all(cachePromises);
    }).then(function() {
      console.log('[SW] Install complete');
    })
  );
});

// Cache JS/CSS resources found in HTML
function cachePageResources(cache, html) {
  var resources = [];
  var match;
  
  // Find all /_next/static resources
  var regex = /["']((\/_next\/static\/[^"']+))['"]/g;
  while ((match = regex.exec(html)) !== null) {
    var url = match[1];
    if (resources.indexOf(url) === -1) {
      resources.push(url);
    }
  }
  
  console.log('[SW] Found ' + resources.length + ' page resources');
  
  var resourcePromises = resources.map(function(url) {
    return fetch(url, { cache: 'no-store' })
      .then(function(response) {
        if (response.ok) {
          cache.put(url, response);
          console.log('[SW] Cached resource: ' + url);
        }
      })
      .catch(function() {
        console.warn('[SW] Failed resource: ' + url);
      });
  });
  
  return Promise.all(resourcePromises);
}

// ACTIVATE: Delete ALL other caches - nuclear option
self.addEventListener('activate', function(event) {
  console.log('[SW] Activating: ' + CACHE_NAME);
  
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      console.log('[SW] Found caches: ' + cacheNames.join(', '));
      
      // Delete EVERY cache that isn't the current one
      var deletePromises = cacheNames.map(function(name) {
        if (name !== CACHE_NAME) {
          console.log('[SW] Deleting cache: ' + name);
          return caches.delete(name);
        }
      });
      
      return Promise.all(deletePromises);
    }).then(function() {
      console.log('[SW] Taking control of all clients...');
      return self.clients.claim();
    }).then(function() {
      // Notify all clients to refresh
      return self.clients.matchAll({ type: 'window' });
    }).then(function(clients) {
      console.log('[SW] Notifying ' + clients.length + ' clients');
      clients.forEach(function(client) {
        client.postMessage({
          type: 'SW_ACTIVATED',
          cache: CACHE_NAME
        });
      });
    })
  );
});

// FETCH: Network-first for pages, cache-first for static assets
self.addEventListener('fetch', function(event) {
  var request = event.request;
  
  if (request.method !== 'GET') return;
  if (!request.url.startsWith(self.location.origin)) return;
  
  var url = new URL(request.url);
  
  // Navigation (HTML pages) - Network first, cache fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).then(function(response) {
        // Cache fresh response
        if (response.ok) {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(request, clone);
          });
        }
        return response;
      }).catch(function() {
        console.log('[SW] Offline, serving cache: ' + url.pathname);
        return caches.match(request).then(function(cached) {
          if (cached) return cached;
          return caches.match('/');
        });
      })
    );
    return;
  }
  
  // Next.js static assets - Cache first (immutable hashed filenames)
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(request).then(function(cached) {
        if (cached) return cached;
        
        return fetch(request).then(function(response) {
          if (response.ok) {
            var clone = response.clone();
            caches.open(CACHE_NAME).then(function(cache) {
              cache.put(request, clone);
            });
          }
          return response;
        });
      })
    );
    return;
  }
  
  // Other resources - Network first
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

// MESSAGE: Handle commands from the app
self.addEventListener('message', function(event) {
  console.log('[SW] Message received:', event.data);
  
  if (event.data === 'SKIP_WAITING' || (event.data && event.data.type === 'SKIP_WAITING')) {
    self.skipWaiting();
  }
  
  // Nuclear option: unregister and clear everything
  if (event.data === 'NUKE_CACHE' || (event.data && event.data.type === 'NUKE_CACHE')) {
    console.log('[SW] NUKE_CACHE requested - clearing everything');
    caches.keys().then(function(names) {
      return Promise.all(names.map(function(name) {
        console.log('[SW] Nuking: ' + name);
        return caches.delete(name);
      }));
    }).then(function() {
      console.log('[SW] All caches nuked');
      if (event.ports && event.ports[0]) {
        event.ports[0].postMessage({ success: true });
      }
    });
  }
  
  // Get current version
  if (event.data === 'GET_VERSION' || (event.data && event.data.type === 'GET_VERSION')) {
    if (event.ports && event.ports[0]) {
      event.ports[0].postMessage({ cache: CACHE_NAME, timestamp: BUILD_TIMESTAMP });
    }
  }
});

console.log('[SW] SafetyLayer SW ' + CACHE_NAME + ' ready');
