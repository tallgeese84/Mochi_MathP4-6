/* Release-scoped offline shell. Updates never navigate an open learning session. */
const VERSION = '7.7.7';
const PREFIX = 'mochi:' + self.registration.scope + ':';
const CACHE = PREFIX + VERSION;
const CORE = ["./index.html","./manifest.webmanifest","./euna-avatar.webp","./mochi-home-scene.js?v=7.7.7","./mochi-home-cat.js?v=7.7.7","./mochi-greet.js?v=7.7.7","./vendor/three-r180/three.module.js","./vendor/three-r180/three.core.js","./science-body.webp","./science-cart.webp","./science-heat.webp","./science-plant.webp","./science-pond.webp","./course/assets/inquiry-workbench.webp","./course/assets/living-world.webp","./course/assets/maths-workbench.webp","./course/assets/plant-study.webp","./course/assets/science-bench.webp","./course/assets/water-landscape.webp","./apple-touch-icon.png?v=7.7.7","./favicon.png?v=7.7.7","./tutor.css?v=7.7.7","./studio.css?v=7.7.7","./science.css?v=7.7.7","./responsive.css?v=7.7.7","./lesson-layout.css?v=7.7.7","./course.css?v=7.7.7","./geometry.css?v=7.7.7","./entrance.css?v=7.7.7","./science-path.css?v=7.7.7","./today.css?v=7.7.7","./teaching.css?v=7.7.7","./planner.css?v=7.7.7","./mochi-home.css?v=7.7.7","./cat-friends.css?v=7.7.7","./mochi-ux.css?v=7.7.7","./ux.css?v=7.7.7","./grownup-gate.js?v=7.7.7","./course-data.js?v=7.7.7","./teaching-core.js?v=7.7.7","./course-core.js?v=7.7.7","./geometry-bridge.js?v=7.7.7","./geometry-visuals.js?v=7.7.7","./geometry-lab.js?v=7.7.7","./dsa-extension.js?v=7.7.7","./dsa-numbers.js?v=7.7.7","./dsa-puzzles.js?v=7.7.7","./paper-practice.js?v=7.7.7","./entrance-data.js?v=7.7.7","./entrance-figures.js?v=7.7.7","./entrance-bank.js?v=7.7.7","./path-core.js?v=7.7.7","./entrance-core.js?v=7.7.7","./science-path-data.js?v=7.7.7","./science-discovery-data.js?v=7.7.7","./science-path-figures.js?v=7.7.7","./science-path-rev2.js?v=7.7.7","./science-path-sx.js?v=7.7.7","./science-practice.js?v=7.7.7","./science-writing.js?v=7.7.7","./science-path-bank.js?v=7.7.7","./science-path-core.js?v=7.7.7","./quick-checks.js?v=7.7.7","./wide-reading.js?v=7.7.7","./bar-models.js?v=7.7.7","./mochi-buddy.js?v=7.7.7","./path-coach.js?v=7.7.7","./planner-core.js?v=7.7.7","./cat-friends-core.js?v=7.7.7","./course-visuals.js?v=7.7.7","./reasoning.js?v=7.7.7","./learning.js?v=7.7.7","./question-bank.js?v=7.7.7","./challenge-bank.js?v=7.7.7","./transfer-bank.js?v=7.7.7","./adaptive-repair.js?v=7.7.7","./app.js?v=7.7.7","./input-mode.js?v=7.7.7","./study-ui.js?v=7.7.7","./science-core.js?v=7.7.7","./science-scenes.js?v=7.7.7","./science-ui.js?v=7.7.7","./learning-review.js?v=7.7.7","./studio.js?v=7.7.7","./responsive.js?v=7.7.7","./review-ui.js?v=7.7.7","./network.js?v=7.7.7","./cloud-sync.js?v=7.7.7","./cloud-backup.js?v=7.7.7","./drive-mirror.js?v=7.7.7","./course-ui.js?v=7.7.7","./teaching-ui.js?v=7.7.7","./planner-ui.js?v=7.7.7","./mochi-home-core.js?v=7.7.7","./mochi-home-ui.js?v=7.7.7","./mochi-room.js?v=7.7.7","./cat-friends-ui.js?v=7.7.7","./ux-kit.js?v=7.7.7","./ux-celebrate.js?v=7.7.7","./readiness-ui.js?v=7.7.7","./entrance-ui.js?v=7.7.7","./science-path-ui.js?v=7.7.7","./nightly-plan-core.js?v=7.7.7","./today-core.js?v=7.7.7","./quest-core.js?v=7.7.7","./today-ui.js?v=7.7.7","./nightly-plan.js?v=7.7.7","./ux-shell.js?v=7.7.7","./mochi-flat-avatar.svg?v=7.7.7","./mochi-flat.svg?v=7.7.7"]; // Generated from index.html.
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
