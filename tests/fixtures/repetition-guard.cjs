// Synthetic full-page interaction regression. No mirror, credentials or pupil records.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {JSDOM,requestInterceptor,VirtualConsole}=require('jsdom');
const dir=path.resolve(__dirname,'../..'),seed=require('../harness.cjs')(true,true),saved=seed.run('S.coins=42;JSON.stringify(S)'),errors=[];
const vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
const dom=new JSDOM(fs.readFileSync(path.join(dir,'index.html'),'utf8'),{url:'https://mochi.test/app/',runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:vc,resources:{interceptors:[requestInterceptor(async request=>{const u=new URL(request.url);if(u.origin!=='https://mochi.test')return new Response('',{headers:{'Content-Type':'text/css'}});const f=path.join(dir,u.pathname.replace('/app/',''));return new Response(fs.readFileSync(f),{headers:{'Content-Type':f.endsWith('.js')?'application/javascript':'text/css'}});})]},beforeParse(w){
 w.HTMLCanvasElement.prototype.getContext=()=>null;w.HTMLElement.prototype.scrollIntoView=()=>{};w.scrollTo=()=>{};w.confirm=()=>true;
 w.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});w.storage={get:()=>new Promise(()=>{}),set:()=>new Promise(()=>{})};w.localStorage.setItem('mochi-tutor-v1',saved);w.fetch=()=>new Promise(()=>{});
}});

const w=dom.window,delay=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 for(let i=0;i<80&&!w.MochiReady;i++)await delay(50);assert(w.MochiReady);assert.deepEqual(errors,[]);
 w.MochiEntranceUI.leave();w.MochiSciencePathUI.leave();w.MochiPlanUI.pause();
 const state=w.eval('S'),E=w.MochiSciencePath,now=Date.now();state.sciencePath=E.fresh();state.coins=42;
 // No private plan or learner records: test ordinary Next/Another independently.
 w.MochiNightlyPlan={...w.MochiNightlyPlan,pending:()=>false,next:()=>null,prelude:()=>null,active:()=>false,adopt(){},boundary(){},bind(){}};
 const teach=id=>{for(let i=0;i<3;i++)E.visit(state.sciencePath,id,i,now-1000);E.concept(state.sciencePath,id,E.unit(id).check[2],now-999);E.complete(state.sciencePath,id,now-998);};
 teach('water');teach('measurement');
 const click=id=>{const b=w.document.getElementById(id);assert(b,'control '+id);b.click();};
 const answer=()=>{const d=state.sciencePath,q=E.question(d.draft);w.document.getElementById('spAnswer').value=q.answer;w.document.getElementById('spWorking').value='Use the stated evidence and distinguish the physical states.';click('spCheckAnswer');assert(d.attempts.find(a=>a.id===d.draft.id).correct);return q.fingerprint;};
 const seedAnswer=(phase,seed)=>{const d=state.sciencePath;E.finishPractice(d);const v=E.startPractice(d,'water',{phase,seed,now:Date.now()});assert(v);w.MochiSciencePathUI.open('practice','water');return answer();};
 seedAnswer('apply',11);seedAnswer('apply',222);
 // Exhaust the two other transfer variants before the reported mist prompt.
 seedAnswer('transfer',3668340011);seedAnswer('transfer',2027808484);const mist=seedAnswer('transfer',2654435769);
 assert.match(E.question(state.sciencePath.draft).text,/visible mist/);
 const count=state.sciencePath.attempts.length,history=JSON.stringify(state.sciencePath.attempts),schedule=JSON.stringify(state.planner.schedule);
 click('spMorePractice');
 assert.equal(state.sciencePath.attempts.length,count,'Another is not another correct answer');
 if(state.sciencePath.draft)assert.notEqual(E.question(state.sciencePath.draft).fingerprint,mist,'Another must change the question');
 assert.equal(JSON.stringify(state.sciencePath.attempts),history);assert.equal(state.coins,42);assert.equal(JSON.stringify(state.planner.schedule),schedule);
 // A restored snapshot and explicit phase cannot bypass the same-question guard.
 E.finishPractice(state.sciencePath);state.sciencePath=E.validate(JSON.parse(JSON.stringify(state.sciencePath)));
 w.MochiSciencePathUI.practice('water','transfer');
 if(state.sciencePath.draft)assert.notEqual(E.question(state.sciencePath.draft).fingerprint,mist);
 assert.equal(state.sciencePath.attempts.length,count);
 // Direct opening of an exhausted topic ends safely on the overview, with a clear note.
 E.finishPractice(state.sciencePath);w.MochiSciencePathUI.open('practice','water','transfer');
 assert.equal(state.sciencePath.draft,null);assert.equal(w.MochiSciencePathUI.view().kind,'home');
 assert.match(w.document.getElementById('viewSciencePath').textContent,/already tackled/);
 assert.equal(JSON.stringify(state.planner.schedule),schedule);assert.equal(state.coins,42);assert.deepEqual(errors,[]);
 console.log('Repetition browser regression: exhausted mist form blocked; Another, restore and direct-open preserve history and rewards.');
 dom.window.close();
})().catch(e=>{console.error(e);dom.window.close();process.exitCode=1;});
