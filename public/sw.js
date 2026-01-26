// SafetyLayer Service Worker - Offline Support for Privacy
// BUILD TIMESTAMP: 2026-01-27T12:00:00Z
const CACHE_VERSION = 'v4';
const CACHE_NAME = 'safetylayer-' + CACHE_VERSION;
const BUILD_ID = Date.now();

console.log('[SW] SafetyLayer Service Worker ' + CACHE_VERSION + ' loading...');

// Core pages to pre-cache
const CORE_PAGES = ['/', '/settings', '/blog'];

// Static assets to pre-cache
const STATIC_ASSETS = ['/manifest.json', '/icon-192.png', '/icon-512.png', '/SafetyLayer.png'];

// Install event - aggressively cache everything needed for offline
self.addEventListener('install', function(event) {
  console.log('[SW] Installing ' + CACHE_VERSION + '...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('[SW] Caching static assets...');
        
        // Cache static assets first
        var staticPromises = STATIC_ASSETS.map(function(url) {
          return cache.add(url).catch(function(e) {
            console.warn('[SW] Failed to cache: ' + url, e);
          });
        });
        
        return Promise.allSettled(staticPromises).then(function() {
          console.log('[SW] Caching pages with resources...');
          
          // Cache each page and its resources
          var pagePromises = CORE_PAGES.map(function(page) {
            return fetch(page, { cache: 'reload' })
              .then(function(response) {
                if (!response.ok) return;
                
                return response.clone().text().then(function(html) {
                  // Cache the page itself
                  cache.put(page, response.clone());
                  console.log('[SW] Cached page: ' + page);
                  
                  // Extract and cache JS/CSS resources
                  var resources = extractResources(html);
                  console.log('[SW] Found ' + resources.length + ' resources in ' + page);
                  
                  var resourcePromises = resources.map(function(url) {
                    return fetch(url, { cache: 'reload' })
                      .then(function(res) {
                        if (res.ok) {
                          cache.put(url, res);
                          console.log('[SW] Cached: ' + url);
                        }
                      })
                      .catch(function(e) {
                        console.warn('[SW] Failed to cache: ' + url);
                      });
                  });
                  
                  return Promise.allSettled(resourcePromises);
                });
              })
              .catch(function(e) {
                console.warn('[SW] Failed to cache page: ' + page, e);
              });
          });
          
          return Promise.allSettled(pagePromises);
        });
      })
      .then(function() {
        console.log('[SW] Pre-caching complete, skipping waiting...');
        return self.skipWaiting();
      })
  );
});

// Extract JS and CSS resources from HTML
function extractResources(html) {
  var resources = [];
  var match;
  
  // Match script src for Next.js chunks
  var scriptRegex = /src=["'](\/_next\/static\/[^"']+)["']/g;
  while ((match = scriptRegex.exec(html)) !== null) {
    resources.push(match[1]);
  }
  
  // Match link href for CSS
  var linkRegex = /href=["'](\/_next\/static\/[^"']+\.css[^"']*)["']/g;
  while ((match = linkRegex.exec(html)) !== null) {
    resources.push(match[1]);
  }
  
  return resources;
}

// Activate event - delete ALL old caches immediately
self.addEventListener('activate', function(event) {
  console.log('[SW] Activating ' + CACHE_VERSION + '...');
  
  event.waitUntil(
    caches.keys()
      .then(function(cacheNames) {
        return Promise.all(
          cacheNames
            .filter(function(name) {
              return name.startsWith('safetylayer-') && name !== CACHE_NAME;
            })
            .map(function(name) {
              console.log('[SW] Deleting old cache: ' + name);
              return caches.delete(name);
            })
        );
      })
      .then(function() {
        console.log('[SW] Claiming clients...');
        return self.clients.claim();
      })
      .then(function() {
        return self.clients.matchAll({ type: 'window' });
      })
      .then(function(clients) {
        clients.forEach(function(client) {
          console.log('[SW] Notifying client of update');
          client.postMessage({ 
            type: 'SW_UPDATED', 
            version: CACHE_VERSION, 
            buildId: BUILD_ID 
          });
        });
      })
  );
});

// Fetch event - serve from cache for offline support
self.addEventListener('fetch', function(event) {
  var request = event.request;
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Skip external resources
  if (!request.url.startsWith(self.location.origin)) return;
  
  var url = new URL(request.url);
  
  // For navigation requests (HTML pages)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(function(response) {
          if (response.ok) {
            var clone = response.clone();
            caches.open(CACHE_NAME).then(function(cache) {
              cache.put(request, clone);
            });
          }
          return response;
        })
        .catch(function() {
          console.log('[SW] Serving cached: ' + url.pathname);
          return caches.match(request).then(function(cached) {
            return cached || caches.match('/');
          });
        })
    );
    return;
  }
  
  // For Next.js static assets (JS, CSS) - Cache First (they have hashed names)
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
  
  // For other resources - Network First with cache fallback
  event.respondWith(
    fetch(request)
      .then(function(response) {
        if (response.ok) {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(request, clone);
          });
        }
        return response;
      })
      .catch(function() {
        return caches.match(request);
      })
  );
});

// Handle messages from clients
self.addEventListener('message', function(event) {
  console.log('[SW] Received message:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] Skip waiting requested');
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_VERSION, buildId: BUILD_ID });
  }
});

console.log('[SW] SafetyLayer Service Worker ' + CACHE_VERSION + ' loaded');
