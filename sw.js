/* Release-scoped offline shell. Updates never navigate an open learning session. */
const VERSION = '6.3.0';
const PREFIX = 'mochi:' + self.registration.scope + ':';
const CACHE = PREFIX + VERSION;
const CORE = ["./index.html","./manifest.webmanifest","./euna-avatar.webp","./mochi-room-scene.js?v=6.3.0","./vendor/three-r180/three.module.js","./vendor/three-r180/three.core.js","./science-body.webp","./science-cart.webp","./science-heat.webp","./science-plant.webp","./science-pond.webp","./course/assets/inquiry-workbench.webp","./course/assets/living-world.webp","./course/assets/maths-workbench.webp","./course/assets/plant-study.webp","./course/assets/science-bench.webp","./course/assets/water-landscape.webp","./apple-touch-icon.png?v=6.3.0","./favicon.png?v=6.3.0","./tutor.css?v=6.3.0","./studio.css?v=6.3.0","./science.css?v=6.3.0","./responsive.css?v=6.3.0","./lesson-layout.css?v=6.3.0","./course.css?v=6.3.0","./entrance.css?v=6.3.0","./science-path.css?v=6.3.0","./today.css?v=6.3.0","./teaching.css?v=6.3.0","./planner.css?v=6.3.0","./mochi-room.css?v=6.3.0","./cat-friends.css?v=6.3.0","./course-data.js?v=6.3.0","./teaching-core.js?v=6.3.0","./course-core.js?v=6.3.0","./entrance-data.js?v=6.3.0","./entrance-figures.js?v=6.3.0","./entrance-bank.js?v=6.3.0","./path-core.js?v=6.3.0","./entrance-core.js?v=6.3.0","./science-path-data.js?v=6.3.0","./science-path-figures.js?v=6.3.0","./science-path-bank.js?v=6.3.0","./science-path-core.js?v=6.3.0","./planner-core.js?v=6.3.0","./cat-friends-core.js?v=6.3.0","./cat-friends-scene.js?v=6.3.0","./course-visuals.js?v=6.3.0","./reasoning.js?v=6.3.0","./learning.js?v=6.3.0","./question-bank.js?v=6.3.0","./challenge-bank.js?v=6.3.0","./transfer-bank.js?v=6.3.0","./adaptive-repair.js?v=6.3.0","./app.js?v=6.3.0","./input-mode.js?v=6.3.0","./study-ui.js?v=6.3.0","./science-core.js?v=6.3.0","./science-scenes.js?v=6.3.0","./science-ui.js?v=6.3.0","./learning-review.js?v=6.3.0","./studio.js?v=6.3.0","./responsive.js?v=6.3.0","./review-ui.js?v=6.3.0","./network.js?v=6.3.0","./cloud-sync.js?v=6.3.0","./cloud-backup.js?v=6.3.0","./drive-mirror.js?v=6.3.0","./course-ui.js?v=6.3.0","./teaching-ui.js?v=6.3.0","./planner-ui.js?v=6.3.0","./mochi-room.js?v=6.3.0","./cat-friends-ui.js?v=6.3.0","./entrance-ui.js?v=6.3.0","./science-path-ui.js?v=6.3.0","./today-core.js?v=6.3.0","./quest-core.js?v=6.3.0","./today-ui.js?v=6.3.0","./mochi-flat-avatar.svg?v=6.3.0","./mochi-flat.svg?v=6.3.0"]; // Generated from index.html.
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
