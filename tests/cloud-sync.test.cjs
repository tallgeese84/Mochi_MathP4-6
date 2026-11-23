const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = name => fs.readFileSync(require.resolve('../'+name), 'utf8');
const initial = () => ({done:0,coins:0,learning:{version:1,attempts:[],notes:[],benchmarks:[]},mastery:{}});

function database(record=null){
  let version = record ? 1 : 0;
  const db = {record, requests:[], beforeWrite:null, offline:false};
  db.fetch = async (url, options={})=>{
    if(db.offline) throw Error('offline');
    const method = options.method || 'GET';
    const silent = url.endsWith('?print=silent');
    const reply = (status,body)=>new Response(body===undefined ? null : JSON.stringify(body), {
      status,headers:{ETag:version ? '"v'+version+'"' : 'null_etag'}
    });
    db.requests.push({method,silent});
    if(method==='GET') return silent ? reply(204) : reply(200,db.record);
    assert.equal(method,'PUT');
    const before = db.beforeWrite;
    db.beforeWrite=null;
    if(before) await before();
    if(url.includes('/mochiBackup/latest.json')){
      assert.ok(silent);
      db.backup=JSON.parse(options.body);
      return reply(204);
    }
    assert.ok(!silent,'RTDB rejects If-Match with print=silent');
    if(options.headers['If-Match'] !== (version ? '"v'+version+'"' : 'null_etag')) return reply(412,db.record);
    db.record=JSON.parse(options.body);
    version++;
    return reply(200,db.record);
  };
  return db;
}

function tablet(db, {state=initial(), stored=new Map(), classroom=false}={}){
  const listeners={}, timers=new Map(), elements=new Map();
  let id=0, now=1000000;
  const field = key=>{
    if(!elements.has(key)) elements.set(key,{dataset:{},value:'',textContent:'',insertAdjacentElement(){},appendChild(){},addEventListener(){}});
    return elements.get(key);
  };
  const on = (type,fn)=>(listeners[type] ||= []).push(fn);
  const emit = type=>Promise.all((listeners[type]||[]).map(fn=>fn({type})));
  const document = {
    visibilityState:'visible',addEventListener:on,dispatchEvent:event=>emit(event.type),
    getElementById:key=>key==='cloudSyncDetails'&&!elements.has(key) ? null : field(key),
    querySelector:()=>null,createElement:()=>field('cloudSyncDetails')
  };
  const KEY='mochi-tutor-v1';
  const context = vm.createContext({
    document,console,Date:class extends Date {static now(){return now;}},Event,CustomEvent,
    URL,AbortController,queueMicrotask,addEventListener:on,TextEncoder,crypto:require('node:crypto').webcrypto,
    setTimeout:(fn,ms)=>{timers.set(++id,{at:now+ms,fn});return id;},
    clearTimeout:id=>timers.delete(id),fetch:db.fetch,
    localStorage:{getItem:k=>stored.get(k)??null,setItem:(k,v)=>stored.set(k,v)},
    S:structuredClone(state),KEY,save:async obj=>{stored.set(KEY,JSON.stringify(obj));}
  });
  context.window=context;
  if(classroom) context.MochiCourse=require('../course-core.js');
  context.MochiReady=false;
  stored.set('cubs_sync',JSON.stringify({url:'https://test.firebaseio.com',code:'a-family'}));
  vm.runInContext(source('network.js'),context);
  vm.runInContext(source('cloud-sync.js'),context);
  context.MochiReady=true;
  const ready=listeners['mochi:ready'][0]();
  return {context,stored,emit,ready,sync:()=>field('cloudSyncNow').onclick(),run:js=>vm.runInContext(js,context),
    async advance(ms){
      now+=ms;
      for(const [key,timer] of [...timers]) if(timer.at<=now){timers.delete(key);await timer.fn();}
    }};
}

test('two tablets inherit a legacy save, keep credentials local and pull only changed records',async()=>{
  const db=database({schema:1,app:'mochi-math-p4-6',student:'Euna',updatedAt:900000,state:{...initial(),done:329,coins:85}});
  const first=tablet(db), second=tablet(db);
  await Promise.all([first.ready,second.ready]);
  assert.equal(first.context.S.done,329);
  assert.equal(second.context.S.coins,85);
  assert.equal(db.requests.filter(r=>r.method==='PUT').length,0);
  await second.sync();
  assert.deepEqual(db.requests.at(-1),{method:'GET',silent:true});
  await first.run("S.keys={ai:'only-on-this-device'};S.done++;S.learning.attempts.push({id:'q1',at:1000001});save(S)");
  await first.sync();
  assert.equal(db.record.state.keys,undefined);
  await second.sync();
  assert.equal(second.context.S.done,330);
  assert.equal(second.context.S.learning.attempts[0].id,'q1');
  assert.equal(db.requests.filter(r=>r.method==='PUT').length,1,'pulling a change must not write it back');
});

test('timer saves immediately on device, checkpoints once per five minutes and flushes on pause',async()=>{
  const db=database(), t=tablet(db);
  await t.ready;
  db.requests.length=0;
  for(let i=0;i<20;i++){
    await t.run('S.time=(S.time||0)+15;save(S)');
    assert.equal(JSON.parse(t.stored.get('mochi-tutor-v1')).time,(i+1)*15);
    await t.advance(15000);
    assert.equal(db.requests.filter(r=>r.method==='PUT').length,i===19 ? 1 : 0);
  }
  await t.run('S.time++;save(S)');
  await t.emit('mochi:study-paused');
  assert.equal(db.record.state.time,301);
  await t.run('save(S)');
  await t.emit('pagehide');
  assert.equal(db.requests.filter(r=>r.method==='PUT').length,2);
});

test('an overlapping write merges both tablets and preserves edits made in flight',async()=>{
  const db=database(), a=tablet(db);
  await a.ready;
  const b=tablet(db);
  await b.ready;
  await a.run("S.learning.attempts.push({id:'a',at:1000002});save(S)");
  await b.run("S.learning.attempts.push({id:'b',at:1000001});save(S)");
  db.beforeWrite=async()=>{
    await b.sync();
    await a.run("S.learning.attempts.push({id:'a2',at:1000003});save(S)");
  };
  await a.sync();
  assert.deepEqual(db.record.state.learning.attempts.map(x=>x.id),['b','a','a2']);
  await b.sync();
  assert.equal(b.context.S.learning.attempts.length,3);
  // A successful request can still have a later local edit waiting behind it.
  await a.run('S.done=3;save(S)');
  db.beforeWrite=()=>a.run('S.done=4;save(S)');
  await a.sync();
  assert.equal(db.record.state.done,3);
  await a.advance(300000);
  assert.equal(db.record.state.done,4);
});

test('offline progress survives reload and is merged on reconnect',async()=>{
  const db=database(), a=tablet(db);
  await a.ready;
  db.offline=true;
  await a.run("S.learning.attempts.push({id:'offline',at:1000001});save(S)");
  await a.sync();
  const restored=tablet(db,{stored:a.stored,state:JSON.parse(a.stored.get('mochi-tutor-v1'))});
  await restored.ready;
  db.offline=false;
  await restored.emit('online');
  assert.equal(db.record.state.learning.attempts[0].id,'offline');
});

test('manual backup keeps its existing data format and returns no copy of the payload',async()=>{
  const db=database(), a=tablet(db);
  await a.ready;
  a.context.MochiReview={build:()=>({app:'Mochi learning',version:1})};
  a.context.APP_VERSION='test';
  vm.runInContext(source('cloud-backup.js'),a.context);
  assert.equal(await a.context.MochiCloudBackup.save(),true);
  assert.deepEqual(db.backup,{app:'Mochi learning',version:1});
});


test('a verified reload only reads the revision; a missing local record forces a full restore',async()=>{
  const db=database(), first=tablet(db);
  await first.ready;
  await first.run('S.done=12;save(S)');
  await first.sync();
  const disk=JSON.parse(first.stored.get('mochi-tutor-v1'));
  db.requests.length=0;
  await tablet(db,{state:disk,stored:first.stored}).ready;
  assert.deepEqual(db.requests,[{method:'GET',silent:true}]);
  // A missing/corrupt local record must never look like an up-to-date tablet.
  first.stored.delete('mochi-tutor-v1');
  db.requests.length=0;
  const restored=tablet(db,{stored:first.stored});
  await restored.ready;
  assert.equal(restored.context.S.done,12);
  assert.deepEqual(db.requests,[{method:'GET',silent:false}]);
});

test('an existing Firebase classroom record can omit the empty attempts collection',async()=>{
  const db=database({schema:1,app:'mochi-math-p4-6',student:'Euna',updatedAt:99,state:{...initial(),done:42,course:{version:1}}});
  const a=tablet(db,{classroom:true});
  await a.ready;
  assert.equal(a.context.S.done,42);
  assert.equal(a.context.S.course.attempts.length,0);
});

test('opening a verified save defers startup bookkeeping and later publishes it',async()=>{
  const db=database(), a=tablet(db);
  await a.ready;
  await a.run('S.done=12;save(S)');
  await a.sync();
  const disk=JSON.parse(a.stored.get('mochi-tutor-v1'));
  db.requests.length=0;
  const b=tablet(db,{state:disk,stored:a.stored});
  await b.run('S.home={at:123};save(S)');
  await b.ready;
  assert.deepEqual(db.requests,[{method:'GET',silent:true}]);
  await b.advance(300000);
  assert.equal(db.record.state.home.at,123);
});
