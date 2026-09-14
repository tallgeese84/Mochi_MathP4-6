const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const version=require('../release.json').version;
const source=fs.readFileSync(require.resolve('../sw.js'),'utf8');
function worker(fetcher){
 const scope='https://mochi.test/app/',handlers={},buckets=new Map(),calls=[],deleted=[];
 const key=r=>typeof r==='string'?r:r.url;
 const cache=name=>{if(!buckets.has(name))buckets.set(name,new Map());const m=buckets.get(name);return{match:async r=>m.get(key(r))?.clone(),put:async(r,v)=>m.set(key(r),v),addAll:async rs=>{for(const r of rs)m.set(key(r),new Response('precache'));}};};
 const context=vm.createContext({URL,Request,Response,AbortController,console,setTimeout:(fn,ms)=>setTimeout(fn,Math.min(ms,25)),clearTimeout,
  self:{registration:{scope},addEventListener:(t,f)=>handlers[t]=f,skipWaiting:async()=>{},clients:{claim:async()=>{},matchAll(){throw Error('Must not navigate existing clients');}}},
  caches:{open:async n=>cache(n),keys:async()=>[...buckets.keys()],delete:async n=>{deleted.push(n);return buckets.delete(n);}},
  fetch:async(...args)=>{calls.push(args);return fetcher(...args);}
 });
 vm.runInContext(source,context);
 async function life(type){let p;handlers[type]({waitUntil:v=>p=v});await p;}
 async function request(url='https://mochi.test/app/',mode='navigate'){let p;handlers.fetch({request:{method:'GET',url,mode},respondWith:v=>p=v});return p;}
 return{scope,context,buckets,calls,deleted,cache,life,request,name:vm.runInContext('CACHE',context)};
}
test('worker update precaches the full release without navigating tabs or deleting sibling caches',async()=>{
 const w=worker(()=>{throw Error('Unexpected fetch')});w.cache('mochi:https://mochi.test/other/:1');w.cache('mochi:'+w.scope+':old');w.cache('mochi-static-v4.3.5');
 await w.life('install');await w.life('activate');
 assert.deepEqual(w.deleted,['mochi:'+w.scope+':old']);
 assert.ok(w.buckets.get(w.name).has(w.scope+'index.html'));
 assert.ok([...w.buckets.get(w.name).keys()].some(k=>k.includes('network.js?v='+version)));
});
test('warm static assets cause no background re-fetch',async()=>{
 const w=worker(()=>{throw Error('Unexpected network')});await w.cache(w.name).put(w.scope+'app.js?v='+version,new Response('cached code'));
 assert.equal(await(await w.request(w.scope+'app.js?v='+version,'cors')).text(),'cached code');assert.equal(w.calls.length,0);
});
test('successful navigation caches HTML and offline query-string navigation restores it',async()=>{
 let online=true;const w=worker(async()=>{if(!online)throw Error('offline');return new Response('<h1>Mochi</h1>',{headers:{'content-type':'text/html'}});});
 await w.request();online=false;
 assert.equal(await(await w.request(w.scope+'?old-version=4.3.5')).text(),'<h1>Mochi</h1>');
});
test('a stalled navigation falls back to the installed shell on a deadline',async()=>{
 const w=worker(()=>new Promise(()=>{}));await w.life('install');
 assert.equal(await(await w.request()).text(),'precache');assert.equal(w.calls[0][1].signal.aborted,true);
});
test('a failed first load returns an explicit offline response; sibling apps are untouched',async()=>{
 const w=worker(()=>{throw Error('offline')});assert.equal((await w.request()).status,503);
 assert.equal(await w.request('https://mochi.test/another/'),undefined);
});
test('cloud timeout covers both connection and response body and aborts the request',async()=>{
 for(const bodyHangs of [false,true]){
  let signal;
  const ctx={window:{},AbortController,setTimeout,clearTimeout,fetch:async(_,opts)=>{signal=opts.signal;return bodyHangs?{ok:true,json:()=>new Promise(()=>{})}:new Promise(()=>{});}};
  vm.runInNewContext(fs.readFileSync(require.resolve('../network.js'),'utf8'),ctx);
  await assert.rejects(ctx.window.MochiNetwork.request('https://example.test',{},true,25),/timed out/);
  assert.equal(signal.aborted,true);
 }
});
