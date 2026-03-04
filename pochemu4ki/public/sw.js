// Minimal service worker — required for PWA install prompt on Android/Chrome
const CACHE = 'pochemu4ki-v1';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

// Network-first: serve from network, fall back to cache for navigation
self.addEventListener('fetch', (e) => {
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).catch(() => caches.match('/') )
    );
  }
});
