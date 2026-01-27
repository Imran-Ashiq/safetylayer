// SafetyLayer - CLEANUP MODE
// This service worker explicitly unregisters existing workers and deletes all caches.
// Version: CLEANUP-v1

self.addEventListener('install', (event) => {
  // Activate immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW Cleanup] Activating cleanup...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          console.log('[SW Cleanup] Deleting cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      console.log('[SW Cleanup] All caches deleted.');
      // Take control of all clients immediately so they stop using the old cache
      return self.clients.claim();
    }).then(() => {
       console.log('[SW Cleanup] Unregistering self...');
       // Finally, unregister this service worker so the browser stops treating it as a PWA
       return self.registration.unregister();
    })
  );
});
