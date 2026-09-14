/* Mochi v4.3.4 — simple network-first worker. No cached HTML version ladder. */
const VERSION='4.3.4';
const CACHE='mochi-static-v4.3.4';
self.addEventListener('install',event=>{self.skipWaiting();});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k.startsWith('mochi-')&&k!==CACHE).map(k=>caches.delete(k)));
    await self.clients.claim();
    const clients=await self.clients.matchAll({type:'window',includeUncontrolled:true});
    for(const client of clients){
      try{
        const u=new URL(client.url);
        if(u.searchParams.get('_mochi')!==VERSION){u.searchParams.set('_mochi',VERSION);client.navigate(u.href);}
      }catch(e){}
    }
  })());
});
self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET')return;
  const url=new URL(req.url);
  if(req.mode==='navigate'){
    event.respondWith(fetch(req,{cache:'no-store'}).catch(()=>caches.match('./index.html')));
    return;
  }
  if(url.origin!==self.location.origin)return;
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    const hit=await cache.match(req);
    const net=fetch(req).then(r=>{if(r&&r.ok)cache.put(req,r.clone());return r;}).catch(()=>null);
    return hit||await net||Response.error();
  })());
});
