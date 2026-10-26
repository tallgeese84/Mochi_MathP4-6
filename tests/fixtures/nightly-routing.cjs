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
 for(let i=0;i<80&&!w.MochiReady;i++)await delay(50);assert(w.MochiReady,'page ready');assert.deepEqual(errors,[]);
 w.MochiEntranceUI.leave();w.MochiSciencePathUI.leave();w.MochiPlanUI.pause();
 const state=w.eval('S'),C=w.MochiNightlyPlanCore,M=w.MochiEntrance,E=w.MochiSciencePath,engines={maths:M,science:E},now=Date.now(),day=C.day(now,'America/Chicago'),previous=new Date(Date.parse(day+'T12:00:00Z')-86400000).toISOString().slice(0,10);
 state.entrance=M.fresh();state.sciencePath=E.fresh();state.planner=w.MochiPlanner.fresh();state.coins=42;
 const p={schema:1,id:'synthetic-nightly-'+day,revision:1,student:'Euna',timeZone:'America/Chicago',reviewedDate:previous,sessionDate:day,generatedAt:new Date(now).toISOString(),sourceExportedAt:new Date(now).toISOString(),subjects:{maths:{focus:'Identify the whole.',steps:[{kind:'practice',unit:'percent',phase:'guided',count:1},{kind:'practice',unit:'percent',phase:'apply',count:2}]},science:{focus:'Compare one variable.',steps:[{kind:'practice',unit:'fairtest',phase:'guided',count:1},{kind:'practice',unit:'fairtest',phase:'apply',count:2}]}}};
 const r=C.fresh(C.validate(p,engines,now),now);
 w.MochiNightlyPlan={...w.MochiNightlyPlan,next:(s,u,t)=>C.next(r,s,u,engines,t),prelude:(s,u,t)=>C.prelude(r,s,u,engines,t),pending:(u,t)=>C.pending(r,u,t),active:()=>true,adopt(){},adoptAtBoundary(){},boundary:(s,u)=>C.settle(r,s,u),bind:(task,view,draft)=>C.bind(r,task,view,draft),lessonDone:(u,id)=>C.lessonDone(r,u,id)};
 const teach=(Engine,d,id)=>{for(let j=0;j<3;j++)Engine.visit(d,id,j,now-10000);Engine.concept(d,id,Engine.unit(id).check[2],now-9999);Engine.complete(d,id,now-9998);};
 const click=id=>{const b=w.document.getElementById(id);assert(b,'control '+id+' exists');b.click();};
 const check=(prefix,Engine,d)=>{const q=Engine.question(d.draft),input=w.document.getElementById(prefix+'Answer');input.value=Engine===M?q.answerLabel:q.answer;const working=w.document.getElementById(prefix+'Working');working.value='Compare the given quantities.';click(prefix+'CheckAnswer');assert(d.attempts.find(a=>a.id===d.draft.id)?.correct,'synthetic answer recorded');};
 const d=state.sciencePath;teach(E,d,'fairtest');teach(E,d,'measurement');teach(E,d,'water');
 // An unrelated repair must not starve the saved set that blocks the focus.
 for(let i=0;i<2;i++){const v=E.startPractice(d,'water',{phase:'apply',seed:701+i,now:now-500+i}),q=E.question(v),wrong=q.answer.replace(/r([0-2])/,(_,n)=>'r'+((+n+1)%3));E.touchDraft(d,{answer:wrong},now-498+i);E.respond(d,now-497+i);E.finishPractice(d);}
 const oldAnswers=JSON.stringify(d.attempts);
 d.mixed={id:'synthetic-saved-mixed',at:now-60000,completedAt:0,items:[{unit:'measurement',form:1,seed:197,rev:E.B.REV,recall:false}]};d.mixedLog=[{id:d.mixed.id,at:d.mixed.at,completedAt:0}];
 const schedule=JSON.stringify(state.planner.schedule);
 w.MochiTodayUI.open();w.MochiSciencePathUI.open('home');click('spContinue');
 assert.equal(d.draft.phase,'mixed','overview resumes the blocking set');assert.equal(d.draft.unit,'measurement');assert.equal(r.startedAt,null,'prelude is not a started plan');assert.equal(d.draft.nightlyPlan,undefined);
 check('sp',E,d);click('spNextMixed');
 assert.equal(d.draft.unit,'fairtest','finished mixed set hands off to the focus');assert.equal(d.draft.phase,'guided');assert.equal(d.draft.nightlyPlan.planId,p.id);assert(r.startedAt);
 check('sp',E,d);click('spMorePractice');
 assert.equal(r.progress.science.index,1,'Another question settles the actual planned slot');assert.equal(d.draft.phase,'apply');assert.equal(d.draft.nightlyPlan.planId,p.id);assert.equal(d.draft.working,'','old working cannot leak into new check');
 check('sp',E,d);click('spMorePractice');
 assert.equal(r.progress.science.count,1);assert.equal(d.draft.phase,'transfer');assert.equal(d.draft.nightlyPlan.planId,p.id);
 check('sp',E,d);click('spNextPractice');
 assert.equal(r.progress.science.index,2);const planned=d.attempts.filter(a=>a.nightlyPlan?.planId===p.id);assert.equal(planned.length,3);assert.equal(planned[0].helped,true);assert.equal(planned[0].independent,false);assert.equal(JSON.stringify(d.attempts.slice(0,2)),oldAnswers,'old errors retained');assert.equal(JSON.stringify(state.planner.schedule),schedule);assert.equal(state.coins,42);
 // Maths resumes an incomplete lesson, then enters the planned practice.
 w.MochiTodayUI.open();const md=state.entrance;teach(M,md,'percent');M.visit(md,'relationships',1,now-1000);M.lesson(md,'relationships').notes='Keep my synthetic notebook.';
 w.MochiEntranceUI.open('home');click('epContinue');assert.equal(w.MochiEntranceUI.view().kind,'lesson');assert.equal(w.MochiEntranceUI.view().unit,'relationships');
 for(let j=0;j<3;j++)M.visit(md,'relationships',j);M.concept(md,'relationships',M.unit('relationships').check[2]);w.MochiEntranceUI.open('lesson','relationships');click('epCompleteLesson');
 assert.equal(md.draft.unit,'percent');assert.equal(md.draft.nightlyPlan.planId,p.id);assert.equal(M.lesson(md,'relationships').notes,'Keep my synthetic notebook.');
 check('ep',M,md);w.MochiPlanUI.pause();const minutes=w.MochiPlanner.minutes(state.planner,'maths'),end=Date.now()-10000;state.planner.sessions.push({id:'synthetic-completed-time',subject:'maths',day:w.MochiPlanner.localDay(),start:end-minutes*60000,end});
 click('epNextPractice');assert.equal(w.MochiTodayUI.visible(),true,'time limit returns home');assert.equal(md.draft,null,'no extra compulsory question');assert.equal(r.progress.maths.index,1,'recorded answer settled without completing remaining steps');assert.equal(JSON.stringify(state.planner.schedule),schedule);assert.equal(w.MochiTodayUI.routeNightly('science'),false,'free choice is not intercepted');assert.deepEqual(errors,[]);
 console.log('Full-page routing: saved set and lesson -> focus -> guided + application + transfer; provenance, time limit and history preserved.');
 dom.window.close();
})().catch(e=>{console.error(e);dom.window.close();process.exitCode=1;});
