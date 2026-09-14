/* Mochi Maths — fast offline shell. */
const SHELL='mochi-shell-v4.3.2';
const FONTS='mochi-fonts-v1';
const SHELL_PAGE='./__mochi_shell_v4.3.2';
const HOME_CRITICAL=[
  './baseline-week.js?v=4.3.2',
  './quest-observer-guard.js?v=4.3.2',
  './quest-visuals.js?v=4.3.2',
  './perf-hotfix.js?v=4.3.2',
  './cloud-sync.js?v=4.3.2',
  './cloud-backup.js?v=4.3.2',
  './drive-mirror.js?v=4.3.2',
  './motion-runtime.js?v=4.3.2',
  './release-marker.js?v=4.3.2',
  './euna-avatar.webp',
  './mochi-watermark.webp'
];

function injectFocusScripts(html){
  const scripts=[];
  if(!html.includes('baseline-week.js'))scripts.push('<script src="baseline-week.js?v=4.3.2"></script>');
  if(!html.includes('quest-observer-guard.js'))scripts.push('<script src="quest-observer-guard.js?v=4.3.2"></script>');
  if(!html.includes('quest-visuals.js'))scripts.push('<script src="quest-visuals.js?v=4.3.2"></script>');
  if(!html.includes('perf-hotfix.js'))scripts.push('<script src="perf-hotfix.js?v=4.3.2"></script>');
  if(!html.includes('cloud-sync.js'))scripts.push('<script src="cloud-sync.js?v=4.3.2"></script>');
  if(!html.includes('cloud-backup.js'))scripts.push('<script src="cloud-backup.js?v=4.3.2"></script>');
  if(!html.includes('drive-mirror.js'))scripts.push('<script src="drive-mirror.js?v=4.3.2"></script>');
  if(!html.includes('motion-runtime.js'))scripts.push('<script src="motion-runtime.js?v=4.3.2"></script>');
  if(!html.includes('release-marker.js'))scripts.push('<script src="release-marker.js?v=4.3.2"></script>');
  return scripts.length?html.replace('</body>',scripts.join('\n')+'\n</body>'):html;
}

async function buildShell(){
  const cache=await caches.open(SHELL);
  const raw=await fetch('./index.html',{cache:'no-store'});
  if(!raw.ok)throw new Error('index fetch failed');
  const html=injectFocusScripts(await raw.text());
  const headers=new Headers(raw.headers);
  headers.delete('content-length');
  headers.set('cache-control','no-store');
  const shell=new Response(html,{status:raw.status,statusText:raw.statusText,headers});
  await cache.put(SHELL_PAGE,shell.clone());
  return shell;
}

self.addEventListener('install',e=>{
  self.skipWaiting();
  e.waitUntil((async()=>{
    const cache=await caches.open(SHELL);
    await Promise.allSettled(HOME_CRITICAL.map(async url=>{
      const r=await fetch(url,{cache:'no-store'});
      if(r&&r.ok)await cache.put(url,r);
    }));
    try{await buildShell();}catch(err){}
  })());
});

self.addEventListener('activate',e=>{
  e.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k.startsWith('mochi-')&&k!==SHELL&&k!==FONTS).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch',e=>{
  const url=new URL(e.request.url);
  if(['api.anthropic.com','api.openai.com'].includes(url.hostname))return;
  if(e.request.method!=='GET')return;

  if(url.hostname.includes('fonts.g')){
    e.respondWith((async()=>{
      const cache=await caches.open(FONTS),hit=await cache.match(e.request);
      if(hit)return hit;
      try{const r=await fetch(e.request);if(r&&r.ok)await cache.put(e.request,r.clone());return r;}catch(err){return Response.error();}
    })());
    return;
  }

  if(e.request.mode==='navigate'){
    e.respondWith((async()=>{
      const cache=await caches.open(SHELL),shell=await cache.match(SHELL_PAGE);
      if(shell)return shell;
      try{return await buildShell();}
      catch(err){const fallback=await cache.match('./index.html')||await caches.match('./index.html')||await caches.match('./');return fallback||Response.error();}
    })());
    return;
  }

  if(url.origin===self.location.origin){
    e.respondWith((async()=>{
      const cache=await caches.open(SHELL),hit=await cache.match(e.request);
      if(hit)return hit;
      try{const r=await fetch(e.request);if(r&&r.ok)await cache.put(e.request,r.clone());return r;}catch(err){return Response.error();}
    })());
  }
});
