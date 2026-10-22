const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const C=require('../nightly-plan-core.js'),M=require('../entrance-core.js'),EScience=require('../science-path-core.js'),T=require('../today-core.js'),P=require('../planner-core.js');
const now=Date.parse('2026-10-07T15:00:00Z'),DAY=86400000,engines={maths:M,science:EScience};
const copy=x=>JSON.parse(JSON.stringify(x));
function state(){return {entrance:M.fresh(),sciencePath:EScience.fresh(),planner:P.fresh(),coins:42,catFriends:{unlocked:['synthetic-cat']},worn:{neck:'bell'}};}
function record(){return C.fresh({schema:1,id:'synthetic-nightly-2026-10-07',revision:1,student:'Euna',timeZone:'America/Chicago',reviewedDate:'2026-10-06',sessionDate:'2026-10-07',generatedAt:'2026-10-07T05:01:00Z',sourceExportedAt:'2026-10-07T01:00:00Z',subjects:{maths:{focus:'Name the whole.',steps:[{kind:'practice',unit:'percent',phase:'guided',count:1},{kind:'practice',unit:'percent',phase:'apply',count:2}]},science:{focus:'Compare one variable.',steps:[{kind:'practice',unit:'fairtest',phase:'guided',count:1},{kind:'practice',unit:'fairtest',phase:'apply',count:2}]}}},now);}
function teach(E,d,id,at=now-10000){for(let p=0;p<3;p++)E.visit(d,id,p,at);E.concept(d,id,E.unit(id).check[2],at+1);E.complete(d,id,at+2);}
function answer(E,d,id,phase,seed,at,correct=true){E.startPractice(d,id,{phase,seed,now:at});const q=E.question(d.draft);E.touchDraft(d,{answer:correct?(E===M?q.answerLabel:q.answer):'999999',working:'Use the given relationship.'},at+1);const out=E.respond(d,at+2);assert(out.ok);E.finishPractice(d);return out.attempt;}
function adapter(r){return {next:(s,u,t)=>C.next(r,s,u,engines,t),prelude:(s,u,t)=>C.prelude(r,s,u,engines,t),pending:(u,t)=>C.pending(r,u,t)};}
for(const [subject,key,E,target,saved] of [['maths','entrance',M,'percent','relationships'],['science','sciencePath',EScience,'fairtest','measurement']]){
 test(subject+': finish saved mixed work rather than let an adaptive repair starve the received plan',()=>{
  const s=state(),d=s[key],r=record();teach(E,d,target);teach(E,d,saved);
  d.mixed={id:'synthetic-saved-set',at:now-DAY,completedAt:0,items:[{unit:saved,form:1,seed:911,rev:E.B.REV,recall:false}]};
  d.mixedLog=[{id:d.mixed.id,at:d.mixed.at,completedAt:0}];
  const before=JSON.stringify(s);global.MochiNightlyPlan=adapter(r);
  try{const task=T.task(s,subject,now);assert.equal(task.kind,'mixed');assert.equal(task.reasonCode,'SAVED_MIXED');assert.equal(task.resume,true);assert.equal(task.nightlyPrelude,true);assert.equal(task.nightly,undefined);assert.equal(JSON.stringify(s),before);assert.equal(r.startedAt,null);
   const v=E.startMixedItem(d,now),q=E.question(v);E.touchDraft(d,{answer:E===M?q.answerLabel:q.answer,working:'Compare the measurements.'},now+1);const a=E.respond(d,now+2).attempt;assert(a.correct);assert(!a.nightlyPlan);E.finishPractice(d);
   const task2=T.task(s,subject,now+3);assert.equal(task2.nightly,true);assert.equal(task2.unit,target);assert.equal(r.progress[subject].index,0);assert.equal(s.coins,42);assert.deepEqual(s.catFriends,{unlocked:['synthetic-cat']});
  }finally{delete global.MochiNightlyPlan;}
 });
 test(subject+': unsent drafts, unfinished lessons and papers remain protected',()=>{
  for(const kind of ['draft','lesson','paper']){const s=state(),d=s[key],r=record();
   if(kind==='draft'){E.startPractice(d,saved,{phase:'apply',seed:14,now});E.touchDraft(d,{answer:'unfinished',working:'Keep this reasoning.'},now+1);}
   if(kind==='lesson')E.visit(d,saved,1,now);
   if(kind==='paper')E.startPaper(d,'baseline-a',now);
   const before=JSON.stringify(s);assert.equal(C.prelude(r,s,subject,engines,now+2),null);assert.equal(C.next(r,s,subject,engines,now+2),null);assert.equal(C.routing(r,s,subject,engines,now+2).reasonCode,kind==='draft'?'SAVED_DRAFT':kind==='lesson'?'SAVED_LESSON':'SAVED_PAPER');assert.equal(JSON.stringify(s),before);
  }
 });
}
test('one submitted singleton recall releases the routing allowance without declaring mastery or erasing a miss',()=>{
 const s=state(),d=s.entrance,r=record(),old=now-9*DAY;teach(M,d,'relationships',old-100);teach(M,d,'percent');
 for(let i=0;i<3;i++)answer(M,d,'relationships',i===2?'transfer':'apply',400+i,old+i*10);
 assert(M.evidence(d,'relationships',now).overdue);assert.equal(C.routing(r,s,'maths',engines,now).reasonCode,'DUE_RECALL');assert.equal(C.prelude(r,s,'maths',engines,now).kind,'recall');assert.equal(C.next(r,s,'maths',engines,now),null);
 const a=answer(M,d,'relationships','recall',515,now+1,false);const snapshot=JSON.stringify(d.attempts);
 assert.equal(a.correct,false);assert(M.evidence(d,'relationships',now+5).overdue);assert.equal(M.evidence(d,'relationships',now+5).delayed,0);
 assert.equal(C.next(r,s,'maths',engines,now+5).nightly,true);assert.equal(JSON.stringify(d.attempts),snapshot);
});
test('an unsubmitted recall, yesterday recall and expired plan do not satisfy today focus',()=>{
 const s=state(),r=record(),d=s.entrance;teach(M,d,'percent');M.startPractice(d,'relationships',{phase:'recall',seed:83,now});assert.equal(C.routing(r,s,'maths',engines,now).reasonCode,'SAVED_DRAFT');M.finishPractice(d);
 const expired=now+DAY;assert.equal(C.pending(r,'maths',expired),false);assert.equal(C.prelude(r,s,'maths',engines,expired),null);assert.equal(C.routing(r,s,'maths',engines,expired).reasonCode,'NO_CURRENT_PLAN');
 r.progress.maths.index=r.plan.subjects.maths.steps.length;assert.equal(C.routing(r,s,'maths',engines,now).reasonCode,'PLAN_COMPLETE');
});
function fn(file,name,next){const s=fs.readFileSync(require.resolve('../'+file),'utf8'),a=s.indexOf('function '+name+'('),b=s.indexOf('function '+next+'(',a);assert(a>=0&&b>a);return s.slice(a,b);}
test('Daily Quests explicit boundaries route saved work and focus, but never add time or intercept free choice',()=>{
 const source=fn('today-ui.js','routeNightly','launchBonus');
 for(const kind of ['focus','mixed','lesson','done','rest','manual','launching','extension','complete']){
  let launched=0,home=0;const task=kind==='mixed'?{nightlyPrelude:true,kind:'mixed'}:kind==='lesson'?{resume:true,kind:'lesson'}:{nightly:true,kind:'practice'};
  const ctx={guided:kind!=='manual',nightlyLaunching:kind==='launching',extensionDay:kind==='extension'?'today':'',S:{},root:{MochiNightlyPlan:{boundary(){},adoptAtBoundary(){},pending:()=>kind!=='complete'}},T:{model:()=>({blocks:[{subject:'maths',task,done:kind==='done',rest:kind==='rest'}]})},runTask(){launched++;},open(){home++;}};
  vm.createContext(ctx);vm.runInContext(source,ctx);const result=ctx.routeNightly('maths');
  if(['manual','launching','extension','complete'].includes(kind)){assert.equal(result,false,kind);assert.equal(launched+home,0,kind);}else if(['done','rest'].includes(kind)){assert(result);assert.equal(home,1);assert.equal(launched,0);}else{assert(result);assert.equal(launched,1);}
 }
});
for(const [file,subject] of [['entrance-ui.js','maths'],['science-path-ui.js','science']]){
 test(subject+': Another/similar question reaches the queue before creating a new draft',()=>{
  let routed=0;const ctx={data:()=>({draft:null}),root:{MochiTodayUI:{atBoundary:()=>false,routeNightly:s=>{assert.equal(s,subject);routed++;return true;}}},E:{practiceRoute(){throw Error('Must route focus first');},prerequisite(){throw Error('Must route focus first');}}};vm.createContext(ctx);vm.runInContext(fn(file,'beginPractice','header'),ctx);ctx.beginPractice('water');ctx.beginPractice('water','guided');assert.equal(routed,2);
 });
 test(subject+': end of mixed set hands off rather than generating a new set',()=>{
  let routed=0;const ctx={data:()=>({draft:null}),root:{MochiTodayUI:{atBoundary:()=>false,routeNightly:()=>{routed++;return true;}}},E:{mixedNext:()=>null,startMixedItem(){throw Error('Do not start another set');}}};vm.createContext(ctx);vm.runInContext(fn(file,'mixed','redo'),ctx);ctx.mixed();assert.equal(routed,1);
 });
 test(subject+': overview Continue uses the same time-bounded daily route',()=>{
  let routed=0;const ctx={view:{kind:'home'},root:{MochiTodayUI:{launchSubject:s=>{assert.equal(s,subject);routed++;return true;}}}};vm.createContext(ctx);vm.runInContext(fn(file,'nextRecommended','mixed'),ctx);ctx.nextRecommended();assert.equal(routed,1);
 });
}
test('new routing diagnostics are read-only and contain no plan text, answers or credentials',()=>{
 const s=state(),r=record();const before=JSON.stringify(s);assert.deepEqual(C.routing(r,s,'maths',engines,now),{reasonCode:'READY'});assert.equal(JSON.stringify(s),before);
});
