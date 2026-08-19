/* Mochi Maths — service worker.
   Bump SHELL when you deploy, and always deploy this file alongside index.html. */
const SHELL = 'mochi-shell-v3';
const FONTS = 'mochi-fonts-v1';          // separate bucket: code deploys never evict fonts
const ASSETS = ['./', './index.html', './manifest.webmanifest',
                './icon-192.png', './icon-512.png', './icon-maskable-512.png'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(SHELL).then(c => c.addAll(ASSETS)).catch(()=>{}));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== SHELL && k !== FONTS).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.hostname.endsWith('anthropic.com')) return;      // never cache the API
  if (e.request.method !== 'GET') return;

  // Fonts: cache-first, in their own bucket.
  if (url.hostname.indexOf('fonts.g') === 0 || url.hostname.indexOf('fonts.g') > -1) {
    e.respondWith(caches.open(FONTS).then(async c => {
      const hit = await c.match(e.request);
      if (hit) return hit;
      try { const r = await fetch(e.request); if (r && r.ok) c.put(e.request, r.clone()); return r; }
      catch (err) { return hit || Response.error(); }
    }));
    return;
  }

  // The page itself: network-first, so a new deploy is never hidden by a stale cache.
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then(r => { const cp = r.clone(); caches.open(SHELL).then(c => c.put('./index.html', cp)); return r; })
        .catch(() => caches.match('./index.html').then(r => r || caches.match('./')))
    );
    return;
  }

  // Everything else on our own origin: cache-first with a quiet refresh.
  if (url.origin === self.location.origin) {
    e.respondWith(caches.open(SHELL).then(async c => {
      const hit = await c.match(e.request);
      const net = fetch(e.request).then(r => { if (r && r.ok) c.put(e.request, r.clone()); return r; }).catch(() => hit);
      return hit || net;
    }));
  }
});
