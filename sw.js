/* Release-scoped offline shell. Updates never navigate an open learning session. */
const VERSION = '4.3.9';
const PREFIX = 'mochi:' + self.registration.scope + ':';
const CACHE = PREFIX + VERSION;
const CORE = ["./index.html","./manifest.webmanifest","./mochi-builtin.webp","./mochi-watermark.webp","./euna-avatar.webp","./science-body.webp","./science-cart.webp","./science-heat.webp","./science-plant.webp","./science-pond.webp","./apple-touch-icon.png?v=4.3.9","./favicon.png?v=4.3.9","./tutor.css?v=4.3.9","./studio.css?v=4.3.9","./science.css?v=4.3.9","./responsive.css?v=4.3.9","./reasoning.js?v=4.3.9","./learning.js?v=4.3.9","./question-bank.js?v=4.3.9","./challenge-bank.js?v=4.3.9","./transfer-bank.js?v=4.3.9","./adaptive-repair.js?v=4.3.9","./app.js?v=4.3.9","./input-mode.js?v=4.3.9","./study-ui.js?v=4.3.9","./science-core.js?v=4.3.9","./science-scenes.js?v=4.3.9","./science-ui.js?v=4.3.9","./learning-review.js?v=4.3.9","./studio.js?v=4.3.9","./baseline-week.js?v=4.3.9","./quest-visuals.js?v=4.3.9","./responsive.js?v=4.3.9","./review-ui.js?v=4.3.9","./network.js?v=4.3.9","./cloud-sync.js?v=4.3.9","./cloud-backup.js?v=4.3.9","./drive-mirror.js?v=4.3.9","./motion-runtime.js?v=4.3.9","./icon-192.png?v=4.3.9"]; // Generated from index.html.
const home = new URL('./index.html', self.registration.scope).href;
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(CORE.map(path => new Request(new URL(path, self.registration.scope), {cache:'reload'})));
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    // Never delete another app's caches on the shared github.io origin.
    await Promise.all((await caches.keys()).filter(key => key.startsWith(PREFIX) && key !== CACHE).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});
async function navigation(request) {
  const cache = await caches.open(CACHE);
  const controller = new AbortController();
  let timer;
  try {
    const response = await Promise.race([
      fetch(request, {cache:'no-cache', signal:controller.signal}),
      new Promise((_, reject) => { timer = setTimeout(() => { controller.abort(); reject(Error('Navigation timed out')); }, 4000); })
    ]);
    if (!response.ok) throw Error('Navigation unavailable');
    if (response.headers.get('content-type')?.includes('text/html')) {
      try { await cache.put(home, response.clone()); } catch (_) {}
    }
    return response;
  } catch (_) {
    return await cache.match(home) || new Response('Mochi is offline. Connect once to download this version.', {status:503,headers:{'Content-Type':'text/plain'}});
  } finally { clearTimeout(timer); }
}
self.addEventListener('fetch', event => {
  const request = event.request, url = new URL(request.url);
  if (request.method !== 'GET' || !url.href.startsWith(self.registration.scope)) return;
  if (request.mode === 'navigate') {
    // Old shell bookmarks must reach their redirect, not replace the offline home.
    if (url.pathname === new URL(self.registration.scope).pathname || url.pathname === new URL(home).pathname) event.respondWith(navigation(request));
    return;
  }
  if (!/\.(?:js|css|png|webp|svg|woff2?|webmanifest)$/.test(url.pathname)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE), hit = await cache.match(request);
    if (hit) return hit;
    const response = await fetch(request);
    if (response.ok) { try { await cache.put(request, response.clone()); } catch (_) {} }
    return response;
  })());
});
