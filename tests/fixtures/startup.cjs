// Runs in a separate process: a microtask loop must fail a deadline, not hang CI.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {JSDOM,requestInterceptor,VirtualConsole}=require('jsdom');
const root=path.resolve(__dirname,'../..');
const version=require('../../release.json').version;
const seed=require('../harness.cjs')(true,true);
const saved=seed.run('S.done=7;S.coins=42;JSON.stringify(S)');
const errors=[],requests=[],registrations=[];
const resources={interceptors:[requestInterceptor(async request=>{
 const u=new URL(request.url);
 if(u.origin!=='https://mochi.test')return new Response('',{headers:{'Content-Type':'text/css'}});
 const file=path.join(root,u.pathname.replace('/app/',''));
 requests.push(u.pathname);
 return new Response(fs.readFileSync(file),{headers:{'Content-Type':file.endsWith('.js')?'application/javascript':'text/css'}});
})]};
const vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
const dom=new JSDOM(fs.readFileSync(path.join(root,'index.html'),'utf8'),{
 url:'https://mochi.test/app/',runScripts:'dangerously',resources,pretendToBeVisual:true,virtualConsole:vc,
 beforeParse(w){
  w.HTMLCanvasElement.prototype.getContext=()=>null;
  w.HTMLElement.prototype.scrollIntoView=()=>{};
  w.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});
  w.storage={get:()=>new Promise(()=>{}),set:()=>new Promise(()=>{})};
  w.localStorage.setItem('mochi-tutor-v1',saved);
  w.fetch=()=>new Promise(()=>{}); // No real cloud/AI requests. Deliberately never resolves.
  w.localStorage.setItem('cubs_sync',JSON.stringify({url:'https://example.firebaseio.com',code:'test-family'}));
  Object.defineProperty(w.navigator,'serviceWorker',{value:{register:async(url)=>{registrations.push(url);return {};}}});
 }
});
const w=dom.window,delay=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 for(let i=0;i<40&&!w.MochiReady;i++)await delay(50);
 assert.equal(w.MochiReady,true,'full app becomes ready even while cloud hangs');
 assert.deepEqual(errors,[]);
 assert.equal(w.document.getElementById('qNum').textContent,'Q8','existing local progress is restored before startup');
 assert.equal(JSON.parse(w.localStorage.getItem('mochi-tutor-v1')).coins,42);
 assert.ok(w.document.getElementById('qText').textContent.trim(),'question renders');
 assert.ok(w.document.querySelector('.quest-scene'),'home illustration remains');
 const scripts=requests.filter(x=>x.endsWith('.js'));
 assert.equal(scripts.length,new Set(scripts).size,'no duplicate dynamic script loader');
 const ids=[...w.document.querySelectorAll('[id]')].map(n=>n.id);
 assert.equal(ids.length,new Set(ids).size,'no ambiguous duplicate controls');
 w.document.getElementById('focusStartTask').click();
 await delay(40);
 assert.ok(w.document.getElementById('qText').textContent.trim());
 w.document.getElementById('subjectScience').click();
 assert.equal(w.document.getElementById('subjectScience').getAttribute('aria-pressed'),'true');
 w.document.getElementById('subjectMaths').click();
 w.document.getElementById('inputStylus').click();
 assert.equal(w.document.body.dataset.inputMode,'stylus');
 w.document.getElementById('inputKeyboard').click();
 assert.equal(w.document.body.dataset.inputMode,'keyboard');
 assert.equal(registrations.length,1,'one worker registration after local hydration');
 await delay(1300); // Let all bounded setup timers finish.
 let releaseMutations=0;
 const observer=new w.MutationObserver(records=>releaseMutations+=records.length);
 observer.observe(w.document.getElementById('releaseNotes'),{childList:true,subtree:true,characterData:true});
 w.document.dispatchEvent(new w.CustomEvent('mochi:cloud-merged'));
 await delay(1700); // Exercises the former 1.5-second version writer too.
 assert.equal(releaseMutations,0,'version is static, never rewritten by background modules');
 assert.deepEqual([...w.document.querySelectorAll('[data-app-version]')].map(n=>n.textContent),['v'+version,'v'+version]);
 assert.deepEqual(errors,[]);
 observer.disconnect();dom.window.close();
 console.log('Full-page startup, question, home art, input toggle, stable release and stalled-cloud checks passed.');
})().catch(e=>{console.error(e);dom.window.close();process.exitCode=1;});
