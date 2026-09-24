/* Release-scoped offline shell. Updates never navigate an open learning session. */
const VERSION = '5.3.1';
const PREFIX = 'mochi:' + self.registration.scope + ':';
const CACHE = PREFIX + VERSION;
const CORE = ["./index.html","./manifest.webmanifest","./mochi-builtin.webp","./mochi-watermark.webp","./euna-avatar.webp","./mochi-room-scene.js?v=5.3.1","./vendor/three-r180/three.module.js","./vendor/three-r180/three.core.js","./science-body.webp","./science-cart.webp","./science-heat.webp","./science-plant.webp","./science-pond.webp","./course/assets/inquiry-workbench.webp","./course/assets/living-world.webp","./course/assets/maths-workbench.webp","./course/assets/plant-study.webp","./course/assets/science-bench.webp","./course/assets/water-landscape.webp","./apple-touch-icon.png?v=5.3.1","./favicon.png?v=5.3.1","./tutor.css?v=5.3.1","./studio.css?v=5.3.1","./science.css?v=5.3.1","./responsive.css?v=5.3.1","./lesson-layout.css?v=5.3.1","./course.css?v=5.3.1","./planner.css?v=5.3.1","./mochi-room.css?v=5.3.1","./course-data.js?v=5.3.1","./course-core.js?v=5.3.1","./planner-core.js?v=5.3.1","./course-visuals.js?v=5.3.1","./reasoning.js?v=5.3.1","./learning.js?v=5.3.1","./question-bank.js?v=5.3.1","./challenge-bank.js?v=5.3.1","./transfer-bank.js?v=5.3.1","./adaptive-repair.js?v=5.3.1","./app.js?v=5.3.1","./input-mode.js?v=5.3.1","./study-ui.js?v=5.3.1","./science-core.js?v=5.3.1","./science-scenes.js?v=5.3.1","./science-ui.js?v=5.3.1","./learning-review.js?v=5.3.1","./studio.js?v=5.3.1","./responsive.js?v=5.3.1","./review-ui.js?v=5.3.1","./network.js?v=5.3.1","./cloud-sync.js?v=5.3.1","./cloud-backup.js?v=5.3.1","./drive-mirror.js?v=5.3.1","./course-ui.js?v=5.3.1","./planner-ui.js?v=5.3.1","./mochi-room.js?v=5.3.1","./icon-192.png?v=5.3.1"]; // Generated from index.html.
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
