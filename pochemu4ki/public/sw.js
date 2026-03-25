// Service worker — PWA install + Web Share Target image handler
const CACHE = 'pochemu4ki-v2';
const SHARE_CACHE = 'pochemu4ki-share-v1';
const SHARE_KEY = '/shared-hero-image';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // ── Web Share Target: intercept POST from Android share sheet ──
  if (url.pathname === '/share-target' && e.request.method === 'POST') {
    e.respondWith((async () => {
      try {
        const data = await e.request.formData();
        const image = data.get('image');
        if (image instanceof File && image.size > 0) {
          const cache = await caches.open(SHARE_CACHE);
          await cache.put(SHARE_KEY, new Response(image, {
            headers: { 'Content-Type': image.type },
          }));
        }
      } catch (_) { /* ignore */ }
      // Redirect to the React route (GET)
      return Response.redirect('/share-target', 303);
    })());
    return;
  }

  // ── Network-first navigation fallback ──
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).catch(() => caches.match('/'))
    );
  }
});
