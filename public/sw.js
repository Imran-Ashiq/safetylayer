// SafetyLayer - KILL SWITCH
// This file exists to unregister the old 'sw.js' service worker.
// The new service worker is at 'worker.js'.

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[Old SW Cleanup] Unregistering self...');
  self.registration.unregister()
    .then(() => console.log('[Old SW Cleanup] Unregistered'))
    .catch((e) => console.error('[Old SW Cleanup] Failed', e));
});

