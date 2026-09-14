/* Mochi Maths — v4.3.3 self-healing service worker. */
const VERSION='4.3.3';
const SHELL='mochi-shell-v'+VERSION;
const FONTS='mochi-fonts-v1';
const CURRENT_SCRIPTS=[
  'baseline-week.js','quest-observer-guard.js','quest-visuals.js','perf-hotfix.js',
  'cloud-sync.js','cloud-backup.js','drive-mirror.js','motion-runtime.js','release-marker.js'
];
const HOME_CRITICAL=[
  ...CURRENT_SCRIPTS.map(x=>`./${x}?v=${VERSION}`),
  './euna-avatar.webp','./mochi-watermark.webp'
];

function injectCurrent(html){
  /* Remove any previously injected overlay scripts so only one release runs. */
  for(const name of CURRENT_SCRIPTS){
    const esc=name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    html=html.replace(new RegExp(`<script[^>]+src=["']${esc}\\?v=[^"']+["'][^>]*><\\/script>\\s*`,'gi'),'');
  }
  const scripts=CURRENT_SCRIPTS.map(name=>`<script src="${name}?v=${VERSION}"></script>`).join('\n');
  html=html.replace('</body>',scripts+'\n</body>');
  /* Make the visible parent version correct even before release-marker.js executes. */
  html=html.replace(/(<b\s+data-app-version[^>]*>)v[^<]*(<\/b>)/i,`$1v${VERSION}$2`);
  html=html.replace(/(<time\s+data-release-date[^>]*datetime=")[^"]*("[^>]*>)[^<]*(<\/time>)/i,'$12026-09-13$213 September 2026$3');
  return html;
}

async function networkPage(request){
  const raw=await fetch(request,{cache:'no-store'});
  if(!raw.ok)return raw;
  const type=raw.headers.get('content-type')||'';
  if(!type.includes('text/html'))return raw;
  const html=injectCurrent(await raw.text());
  const headers=new Headers(raw.headers);headers.delete('content-length');headers.set('cache-control','no-store');
  const out=new Response(html,{status:raw.status,statusText:raw.statusText,headers});
  const cache=await caches.open(SHELL);await cache.put('./latest.html',out.clone());
  return out;
}

self.addEventListener('install',e=>{
  self.skipWaiting();
  e.waitUntil((async()=>{
    const cache=await caches.open(SHELL);
    await Promise.allSettled(HOME_CRITICAL.map(async url=>{
      const r=await fetch(url,{cache:'no-store'});if(r&&r.ok)await cache.put(url,r);
    }));
  })());
});

self.addEventListener('activate',e=>{
  e.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k.startsWith('mochi-')&&k!==SHELL&&k!==FONTS).map(k=>caches.delete(k)));
    await self.clients.claim();
    /* Reload already-open Mochi pages exactly once onto the new worker. */
    const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true});
    for(const client of windows){
      try{
        const u=new URL(client.url);u.searchParams.set('mochi_version',VERSION);
        await client.navigate(u.href);
      }catch(err){}
    }
  })());
});

self.addEventListener('fetch',e=>{
  const url=new URL(e.request.url);
  if(['api.anthropic.com','api.openai.com'].includes(url.hostname))return;
  if(e.request.method!=='GET')return;

  if(url.hostname.includes('fonts.g')){
    e.respondWith((async()=>{
      const cache=await caches.open(FONTS),hit=await cache.match(e.request);if(hit)return hit;
      try{const r=await fetch(e.request);if(r&&r.ok)await cache.put(e.request,r.clone());return r;}catch(err){return hit||Response.error();}
    })());
    return;
  }

  if(e.request.mode==='navigate'){
    e.respondWith((async()=>{
      try{return await networkPage(e.request);}
      catch(err){const cache=await caches.open(SHELL);return await cache.match('./latest.html')||await caches.match('./index.html')||Response.error();}
    })());
    return;
  }

  if(url.origin===self.location.origin){
    const isVersioned=url.searchParams.has('v');
    e.respondWith((async()=>{
      const cache=await caches.open(SHELL);
      if(isVersioned){const hit=await cache.match(e.request);if(hit)return hit;}
      try{const r=await fetch(e.request);if(r&&r.ok)await cache.put(e.request,r.clone());return r;}
      catch(err){return await cache.match(e.request)||Response.error();}
    })());
  }
});
