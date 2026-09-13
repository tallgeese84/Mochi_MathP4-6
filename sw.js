/* Mochi Maths — service worker.
   Bump SHELL when you deploy, and always deploy this file alongside index.html. */
const SHELL = 'mochi-shell-v4.2.2';
const FONTS = 'mochi-fonts-v1';          // separate bucket: code deploys never evict fonts
const ASSETS = ['./baseline-week.js?v=4.2.2', './science-core.js?v=4.2.1', './science-scenes.js?v=4.2.1', './science-ui.js?v=4.2.1', './science.css?v=4.2.1', './transfer-bank.js?v=4.2.1', './science-plant.webp', './science-pond.webp', './science-body.webp', './science-heat.webp', './science-cart.webp', './', './index.html', './app.js?v=4.2.1', './input-mode.js?v=4.2.1', './learning.js?v=4.2.1', './question-bank.js?v=4.2.1', './study-ui.js?v=4.2.1', './tutor.css?v=4.2.1', './challenge-bank.js?v=4.2.1', './reasoning.js?v=4.2.1', './studio.js?v=4.2.1', './studio.css?v=4.2.1', './manifest.webmanifest?v=4.2.1', './mochi-watermark.webp', './euna-avatar.webp', './favicon.png?v=4.2.1',
                './icon-192.png?v=4.2.1', './icon-512.png?v=4.2.1', './icon-maskable-512.png?v=4.2.1', './apple-touch-icon.png?v=4.2.1'];

function withBaselineScript(response){
  if(!response || !response.ok) return response;
  const type=response.headers.get('content-type')||'';
  if(!type.includes('text/html')) return response;
  return response.text().then(html=>{
    if(!html.includes('baseline-week.js')){
      html=html.replace('</body>', '<script src="baseline-week.js?v=4.2.2"></script>\n</body>');
    }
    const headers=new Headers(response.headers);
    headers.delete('content-length');
    return new Response(html,{status:response.status,statusText:response.statusText,headers});
  });
}

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(SHELL).then(c => c.addAll(ASSETS)).catch(()=>{}));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('mochi-') && k !== SHELL && k !== FONTS).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (['api.anthropic.com','api.openai.com'].includes(url.hostname)) return;      // never cache the API
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

  // The page itself: network-first, then inject the small baseline-week module.
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then(async r => {
          const cp = r.clone();
          caches.open(SHELL).then(c => c.put('./index.html', cp));
          return withBaselineScript(r);
        })
        .catch(async () => {
          const r=await caches.match('./index.html') || await caches.match('./');
          return withBaselineScript(r);
        })
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
