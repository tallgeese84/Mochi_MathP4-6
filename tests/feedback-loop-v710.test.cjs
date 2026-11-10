// v7.10: the nightly feedback loop teaches, not just schedules. All learner data here is synthetic.
const test=require('node:test'),assert=require('node:assert/strict');
globalThis.window=globalThis;
const C=require('../nightly-plan-core.js'),M=require('../entrance-core.js'),S=require('../science-path-core.js'),T=require('../today-core.js'),P=require('../planner-core.js');
const Pilot=require('../tutor-pilot-core.js');require('../tutor-pilot-ui.js');const PUI=globalThis.MochiTutorPilotUI;
const W=require('../writing-review.js'),Bars=require('../bar-models.js'),Practice=require('../science-practice.js');
const DAY=86400000,now=Date.parse('2026-11-10T16:00:00Z'),engines={maths:M,science:S};
const copy=x=>JSON.parse(JSON.stringify(x));
const EA='pb3:ratios:equal-additions';
function teach(E,d,id,t=now-20*DAY){for(let i=0;i<3;i++)E.visit(d,id,i,t);E.concept(d,id,E.unit(id).check[2],t);E.complete(d,id,t);}
// A valid but wrong response: a number for Maths, a wrong conclusion/reason pair for Science choices.
function wrongAnswer(E,q){if(!q.options)return '999999';for(let c=0;c<q.options.length;c++)for(let r=0;r<(q.reasons?.length||1);r++){const a=q.reasons?`c${c}:r${r}`:`c${c}`;if(E.B.validAnswer(q,a)&&!E.B.mark(q,a))return a;}return '999999';}
// Record one attempt through the real engine: start, answer, finish.
function attempt(E,d,id,opts,correct,t,extra={}){E.finishPractice(d);const v=E.startPractice(d,id,{...opts,now:t});assert.ok(v,'question available');const q=E.question(v);
 E.touchDraft(d,{answer:correct?(typeof q.answer==='string'?q.answer:q.answerLabel):wrongAnswer(E,q),working:'one line of my thinking'},t+1);if(extra.help)E.help(d,!!extra.reveal,t+2);const r=E.respond(d,t+3);assert.ok(r.ok,r.reason);if(!extra.keep)E.finishPractice(d);return r.attempt;}
function plan(steps,sessionDate='2026-11-10'){return {schema:1,id:'synthetic-nightly-'+sessionDate,revision:1,student:'Euna',timeZone:'America/Chicago',reviewedDate:'2026-11-09',sessionDate,generatedAt:'2026-11-10T09:00:00Z',sourceExportedAt:'2026-11-09T23:00:00Z',subjects:{maths:{focus:'Keep the difference when the same amount is added.',steps},science:{focus:'Divide force by the contact area.',steps:[{kind:'practice',unit:'sx-pressure',phase:'apply',count:1}]}}};}
const state=()=>({entrance:M.fresh(),sciencePath:S.fresh(),planner:P.fresh()});

// 1. Saved questions never block the plan.
test('a question from an earlier day, or with its solution opened, is set aside losslessly',()=>{
 const d=M.fresh();teach(M,d,'percent');const t=now-2*DAY;
 const v=M.startPractice(d,'percent',{phase:'apply',now:t});M.touchDraft(d,{answer:'12',working:'unsent work'},t+5);
 assert.equal(M.parkStale(d,t+60000),false,'same day, solution closed: kept open');
 assert.equal(M.parkStale(d,now),true,'next day: set aside');
 assert.equal(d.draft,null);const held=d.deferredDrafts.at(-1);assert.equal(held.id,v.id);assert.equal(held.working,'unsent work');assert.equal(held.auto,true);
 assert.equal(M.heldOffer(d,now),null,'an automatic set-aside waits three days');
 assert.equal(M.heldOffer(d,now+3*DAY+1)?.id,v.id,'unsent working returns after three days');
 const r=M.validate(copy(d));assert.equal(r.deferredDrafts.at(-1).auto,true,'survives backup and sync');assert.equal(r.deferredDrafts.at(-1).working,'unsent work');
 // A revealed solution on the same day also releases the route; a recorded miss returns as a second try.
 const w=M.startPractice(d,'percent',{phase:'apply',now});M.touchDraft(d,{answer:'1',working:'try'},now+1);M.respond(d,now+2);M.help(d,true,now+3);
 assert.equal(M.parkStale(d,now+4),true);assert.equal(M.heldOffer(d,now+5*DAY)?.id,v.id,'a held question with recorded answers is not re-offered; the second try brings it back');
 assert.ok(M.errorLog(d,now+5).some(e=>e.id===w.id),'the miss is in the second-try log');
 // Mixed sets and correct answers are never parked.
 const m=M.fresh();m.draft={...copy(w),phase:'mixed',mixedId:'x'};assert.equal(M.parkStale(m,now+9*DAY),false);
});
test('held questions are capped without dropping unsent working',()=>{
 const d=M.fresh();teach(M,d,'percent');
 for(let i=0;i<26;i++){const t=now-30*DAY+i*DAY;M.startPractice(d,'percent',{phase:i%2?'apply':'transfer',now:t});M.touchDraft(d,{answer:'',working:'draft '+i},t+1);if(i<12){M.touchDraft(d,{answer:'7'},t+2);M.respond(d,t+3);}M.deferDraft(d,t+4);}
 assert.ok(d.deferredDrafts.length<=20);const unsent=d.deferredDrafts.filter(x=>!d.attempts.some(a=>a.id===x.id));assert.equal(unsent.length,14,'every unsent draft is kept');
});
test('an old half-read lesson no longer blocks the plan; today’s lesson still does',()=>{
 const s=state(),d=s.entrance;teach(M,d,'ratios');M.visit(d,'percent',0,now-3*DAY);
 const r=C.fresh(C.validate(plan([{kind:'practice',unit:'ratios',phase:'apply',count:1}]),engines,now),now);
 assert.notEqual(C.routing(r,s,'maths',engines,now).reasonCode,'SAVED_LESSON');assert.ok(C.next(r,s,'maths',engines,now));
 M.visit(d,'percent',1,now-60000);assert.equal(C.routing(r,s,'maths',engines,now).reasonCode,'SAVED_LESSON');
 assert.equal(T.task(s,'maths',now).kind,'lesson','today’s lesson is resumed');
 d.lessons.percent.lastViewedAt=now-3*DAY;assert.notEqual(T.task(s,'maths',now).unit,'percent','yesterday’s is not');
});

// 2. Same-type microcycles.
function missedEqualAdditions(s){const d=s.entrance;teach(M,d,'ratios');
 attempt(M,d,'ratios',{phase:'apply'},true,now-6*DAY);attempt(M,d,'ratios',{phase:'apply'},true,now-5*DAY);
 const a=attempt(M,d,'ratios',{phase:'transfer',form:2,structure:EA,targeted:true},false,now-DAY);assert.equal(M.question(a).structure,EA);return a;}
test('a Maths microcycle teaches the type of her latest miss: example → first steps → on her own',()=>{
 const s=state(),d=s.entrance;missedEqualAdditions(s);
 const r=C.fresh(C.validate(plan([{kind:'practice',unit:'ratios',phase:'guided',count:1},{kind:'practice',unit:'ratios',phase:'apply',count:2}]),engines,now),now);
 const seen=[];
 for(let i=0;i<3;i++){
  const task=C.next(r,s,'maths',engines,now+i*1000);assert.deepEqual(task.target,{form:2,structure:EA});assert.equal(task.challengeIndex,i+1);
  assert.equal(task.phase,['guided','apply','transfer'][i]);assert.equal(task.scaffold,['example','steps',undefined][i]);assert.equal(!!task.modelled,i===2);
  const v=M.startPractice(d,'ratios',{phase:task.phase,form:task.target.form,structure:task.target.structure,targeted:true,scaffold:task.scaffold||'',modelled:!!task.modelled,now:now+i*1000});
  const q=M.question(v);assert.equal(q.structure,EA,'same problem type at every step');assert.ok(!seen.includes(q.fingerprint));seen.push(q.fingerprint);
  if(i===0){assert.ok(Number.isSafeInteger(v.exampleSeed));const x=M.B.make('ratios',2,v.exampleSeed,v.rev);assert.equal(x.structure,EA);assert.notEqual(x.fingerprint,q.fingerprint);assert.ok(d.seen[x.fingerprint],'the example is never served later as fresh');}
  assert.equal(v.helped,i<2,'example and first-steps questions are recorded as help');
  C.bind(r,task,{kind:'practice',unit:'ratios'},v);assert.deepEqual(r.progress.maths.target,{unit:'ratios',form:2,structure:EA},'type frozen at the first step');
  M.touchDraft(d,{answer:q.answerLabel,working:'keep the difference'},now+i*1000+1);M.respond(d,now+i*1000+2);M.finishPractice(d);C.settle(r,s,'maths');
 }
 assert.deepEqual(C.restore(copy(r),engines,now).progress.maths.target,{unit:'ratios',form:2,structure:EA},'restore keeps the frozen type');
 const last=d.attempts.at(-1);assert.equal(last.modelled,true);assert.equal(last.independent,true);
 const e=M.evidence(d,'ratios',now+5000);assert.equal(e.transfer,0,'a success straight after a model is not transfer');assert.equal(e.apply,3,'it counts as application');
});
test('a plan may name the problem type; the validator round-trips it and rejects unknown types',()=>{
 const steps=[{kind:'practice',unit:'ratios',phase:'guided',count:1,form:2,structure:EA},{kind:'practice',unit:'ratios',phase:'apply',count:2,form:2,structure:EA}];
 const p=plan(steps);assert.equal(JSON.stringify(C.validate(copy(p),engines,now)),JSON.stringify(p),'no keys added or dropped');
 for(const bad of [{form:3},{form:1,structure:EA},{form:2,structure:'pb3:ratios:made-up'},{structure:EA}])assert.throws(()=>C.validate(plan([{kind:'practice',unit:'ratios',phase:'apply',count:1,...bad}]),engines,now),/problem type/);
 assert.throws(()=>C.validate(plan([{kind:'lesson',unit:'ratios',form:2}]),engines,now));
 const s=state();teach(M,s.entrance,'ratios');const r=C.fresh(C.validate(p,engines,now),now);
 assert.deepEqual(C.next(r,s,'maths',engines,now).target,{form:2,structure:EA},'planned type wins even without a miss');
});
test('science microcycles are unchanged',()=>{
 const s=state();teach(S,s.sciencePath,'fairtest');const p=plan([{kind:'practice',unit:'ratios',phase:'apply',count:1}]);p.subjects.science.steps=[{kind:'practice',unit:'fairtest',phase:'guided',count:1},{kind:'practice',unit:'fairtest',phase:'apply',count:2}];
 const task=C.next(C.fresh(C.validate(p,engines,now),now),s,'science',engines,now);assert.equal(task.target,undefined);assert.equal(task.phase,'guided');
});

// 3. Difficulty and review.
test('completion problems start below half unaided and fade after a supported success',()=>{
 const d=M.fresh();teach(M,d,'percent');for(let i=0;i<5;i++)attempt(M,d,'percent',{phase:'apply'},i===0,now-10*DAY+i*DAY);
 const st=M.supportStatus(d,'percent',now);assert.equal(st.low,true);assert.equal(st.unaided,1);
 M.finishPractice(d);const v=M.startPractice(d,'percent',{phase:'apply',now});assert.equal(v.scaffold,'steps');assert.equal(v.helped,true);
 const q=M.question(v);M.touchDraft(d,{answer:q.answerLabel,working:'finish the steps'},now+1);M.respond(d,now+2);M.finishPractice(d);
 assert.equal(M.startPractice(d,'percent',{phase:'apply',now:now+10}).scaffold,undefined,'probe without support after a supported success');
 M.finishPractice(d);
 const ok=M.fresh();teach(M,ok,'percent');for(let i=0;i<5;i++)attempt(M,ok,'percent',{phase:'apply'},true,now-10*DAY+i*DAY);assert.equal(M.startPractice(ok,'percent',{phase:'apply',now}).scaffold,undefined,'no support when she is succeeding');
});
test('small banks keep their unseen questions for independent evidence',()=>{
 const d=M.fresh();teach(M,d,'digits');assert.ok(M.freshCount(d,'digits',1,M.REV)<8);
 for(let i=0;i<4;i++){M.finishPractice(d);const v=M.startPractice(d,'digits',{phase:'apply',now:now+i*1000});if(!v)break;assert.equal(v.scaffold,undefined);const q=M.question(v);M.touchDraft(d,{answer:'999999',working:'w'},now+i*1000+1);M.respond(d,now+i*1000+2);}
});
test('review draws a harder type only once that type has been solved unaided',()=>{
 const d=M.fresh();teach(M,d,'ratios');attempt(M,d,'ratios',{phase:'apply'},true,now-30*DAY);
 for(let i=0;i<20;i++){const c=M.practiceChoice(d,'ratios',{phase:'mixed',form:2,now:now+i});assert.equal(c.form,1,'no form-2 success yet: standard method');}
 attempt(M,d,'ratios',{phase:'transfer',form:2,structure:EA,targeted:true},true,now-20*DAY);
 for(let i=0;i<20;i++){const c=M.practiceChoice(d,'ratios',{phase:'mixed',form:2,now:now+100+i});assert.equal(c.form,2);assert.equal(c.q.structure,EA,'only the solved type returns in review');}
});
test('equal-additions solutions use the difference method and always agree with the answer',()=>{
 let n=0;for(let i=0;i<3000;i++){const q=M.B.make('ratios',2,(i*2654435761+11)>>>0,M.REV);if(q.structure!==EA)continue;n++;
  const p=q.params,gcd=(x,y)=>y?gcd(y,x%y):x;assert.match(q.steps[0],/difference between blue and red stays the same/);
  const blue=+q.steps.find(s=>s.startsWith('Blue at first')).match(/= (\d+)\.$/)[1];assert.equal(blue,q.answer);
  const L=(p.b-p.a)*(p.d-p.c)/gcd(p.b-p.a,p.d-p.c),part=p.added/(p.c*L/(p.d-p.c)-p.a*L/(p.b-p.a));assert.ok(Number.isInteger(part));assert.equal(blue,p.b*L/(p.b-p.a)*part);
  const bar=Bars.model(q);assert.match(bar,/Before/);assert.match(bar,new RegExp(`So 1 part = ${part}\\.`));}
 assert.ok(n>500);
 assert.match(M.D.units.find(u=>u.id==='ratios').ideas[1],/same number is added to both colours, the difference stays unchanged/);
});
test('the path keeps moving for a learner who misses 60% of first tries',()=>{
 const real=Math.random;try{for(const ms0 of [6,7,8,11]){let ms=ms0;Math.random=()=>((ms=(ms*48271)%2147483647)/2147483647);
  let rs=11;const rnd=()=>((rs=(rs*16807)%2147483647)/2147483647);const st={entrance:M.fresh()},d=st.entrance;let t=Date.UTC(2026,8,1,9),supported=0,total=0;
  for(let day=0;day<220;day++){for(let k=0;k<4;k++){const r=M.recommend(st,t);t+=60000;
   if(r.kind==='learn'){for(let p=0;p<3;p++)M.visit(d,r.unit,p,t);M.concept(d,r.unit,M.unit(r.unit).check[2],t);M.complete(d,r.unit,t);continue;}
   let v;if(r.kind==='mixed-set')v=M.startMixedItem(d,t);else if(r.kind==='redo')v=M.startRedo(d,r.attempt,t);else if(r.kind==='resume')v=d.draft;else if(r.unit){M.finishPractice(d);v=M.startPractice(d,r.unit,{now:t,phase:r.kind==='recall'?'recall':r.phase});}
   if(!v)break;total++;if(v.scaffold)supported++;const q=M.question(v),wrong=rnd()<.6;M.touchDraft(d,{answer:wrong?'999999':q.answerLabel,working:'my plan here'},t);const res=M.respond(d,t+1);
   if(!res.attempt?.correct){M.touchDraft(d,{answer:rnd()<.6?'999998':q.answerLabel},t+2);M.respond(d,t+3);}M.finishPractice(d);}
   t+=DAY-4*60000;}
  const taught=M.D.units.filter(u=>!u.hcis).filter(u=>M.evidence(d,u.id,t).taught).length;
  assert.ok(taught>=16,`seed ${ms0}: ${taught} units reached`);assert.ok(supported>0&&supported<=total*.25,`seed ${ms0}: ${supported}/${total} supported`);
 }}finally{Math.random=real;}
});

// 4. Study time and Science repeats.
function rated(E,d,unit,n,ok,t0){for(let i=0;i<n;i++){d.attempts.push(null);d.attempts.pop();attempt(E,d,unit,{phase:'apply'},i<ok,t0+i*3600000);}}
test('five minutes move from Science to Maths only when Science is strong and Maths weak; the total is unchanged',()=>{
 const s=state();teach(M,s.entrance,'percent');teach(M,s.entrance,'rates');teach(S,s.sciencePath,'heat');teach(S,s.sciencePath,'graphs');
 const t0=now-6*DAY;rated(M,s.entrance,'percent',6,1,t0);rated(M,s.entrance,'rates',6,1,t0+DAY);
 for(const u of ['heat','graphs','matter','forces']){teach(S,s.sciencePath,u);rated(S,s.sciencePath,u,6,6,t0+2*DAY);}
 const b=T.balance(s,now);assert.ok(b.maths.n>=10&&b.maths.rate<.5,JSON.stringify(b.maths));assert.ok(b.science.n>=20&&b.science.rate>=.85,JSON.stringify(b.science));assert.equal(b.shift,5);
 const base={m:P.scheduled(s.planner,'maths',now),sc:P.scheduled(s.planner,'science',now)};
 assert.equal(T.settleBalance(s,now),true);assert.equal(T.settleBalance(s,now+1),false,'decided once a day');
 assert.equal(P.minutes(s.planner,'maths',now),base.m+5);assert.equal(P.minutes(s.planner,'science',now),base.sc-5);
 const back=P.merge(copy(s.planner),P.fresh());assert.equal(back.shifts[P.localDay(now)].minutes,5,'sync keeps the decision');
 P.setBalance(s.planner,false,now+2);assert.equal(P.minutes(s.planner,'maths',now),base.m,'a grown-up can switch it off');
 const quiet=state();assert.equal(T.settleBalance(quiet,now),true);assert.equal(P.minutes(quiet.planner,'maths',now),P.scheduled(quiet.planner,'maths',now),'no data: no change');
});
test('ordinary Science practice serves at most two of one unit and type a day',()=>{
 const s=state(),d=s.sciencePath;for(const u of ['heat','graphs','matter'])teach(S,d,u);
 // Misses keep the next Heat question at the same (form 1) type.
 attempt(S,d,'heat',{phase:'apply'},false,now-60000);attempt(S,d,'graphs',{phase:'apply'},true,now-50000);
 assert.equal(Practice.route(S,s,{kind:'practice',unit:'heat'},now,true).unit,'heat','one so far: allowed');
 attempt(S,d,'heat',{phase:'apply'},false,now-40000);
 const r=Practice.route(S,s,{kind:'practice',unit:'heat'},now,true);assert.notEqual(r.unit,'heat','a third of the same type moves on');
});

// 5. AI coaching for the weak Maths units.
test('automatic coaching covers Ratios, Two conditions and Percentages with checked offline aids',()=>{
 const keys=new Set();for(const u of ['ratios','simultaneous','percent'])for(let f=0;f<3;f++)for(let i=0;i<40;i++){const q=M.B.make(u,f,(i*2654435761)>>>0,M.REV),sp=Pilot.spec('maths',q);assert.ok(sp,u+' form '+f);keys.add(sp.key);
  const html=PUI.representation(sp.key,'table',q);assert.ok(html.length>40);assert.doesNotMatch(html,new RegExp(`>${q.answerLabel}<`),'the aid never shows the answer');}
 assert.ok(keys.has('ratio-equal-additions')&&keys.has('reverse-percent')&&keys.has('assume-all'));
 const d=M.fresh();teach(M,d,'ratios');const v=M.startPractice(d,'ratios',{phase:'apply',now}),q=M.question(v);M.touchDraft(d,{answer:'1',working:'w'},now+1);const a=M.respond(d,now+2).attempt;
 assert.equal(Pilot.autoGate(d,'maths',v,q,a,now+3),'READY');
 assert.equal(Pilot.validate({events:[{id:'x',at:now,subject:'maths',unit:'ratios',attemptId:'a1',subskill:'ratio-fixed-part',kind:'support',strategy:'table'}]}).events.length,1,'events in the new units survive sync');
 delete globalThis.keyReady;assert.match(PUI.parent('maths',M,d),/not connected/);globalThis.keyReady=()=>true;assert.match(PUI.parent('maths',M,d),/AI provider: connected/);delete globalThis.keyReady;
});

// 6. Written-answer review queue.
test('the review queue lists pending writing and only a grown-up tap records a verdict',async()=>{
 const {JSDOM}=require('jsdom');const s=state(),d=s.sciencePath;teach(S,d,'circuits');
 let v,q;for(let i=0;i<400&&!v;i++){M.finishPractice(d);S.finishPractice(d);const x=S.startPractice(d,'circuits',{phase:'transfer',form:2,seed:i*7919+3,now:Date.now()-2*DAY});if(S.question(x).kind==='written'){v=x;q=S.question(x);}else S.finishPractice(d);}
 assert.ok(v,'a written circuits question');const past=Date.now()-DAY;S.touchDraft(d,{answer:'Only B lights because B still has a complete path back to the battery.',working:''},past);assert.ok(S.respond(d,past+1).ok);S.finishPractice(d);
 assert.equal(W.pending(S,d).length,1);
 assert.deepEqual(W.parse('```json\n{"verdict":"valid","missing":[],"reason":"All key ideas are present."}\n```'),{verdict:'valid',reason:'All key ideas are present.',missing:[]});
 assert.throws(()=>W.parse('{"verdict":"maybe","reason":"x"}'));assert.throws(()=>W.parse('no json'));
 const dom=new JSDOM('<div id="host"></div>');const saved=globalThis.document;globalThis.document=dom.window.document;
 try{
  const id=W.pending(S,d)[0].id;W.suggestions.set(id,{verdict:'valid',reason:'Mentions the complete path.',missing:[]});
  let persisted=0,refreshed=0;dom.window.document.getElementById('host').innerHTML=W.section(S,d);
  assert.match(dom.window.document.body.innerHTML,/AI suggestion \(not saved\)/);assert.equal(d.reviews[id],undefined,'a suggestion alone records nothing');
  W.wire(S,d,()=>persisted++,()=>refreshed++);dom.window.document.querySelector(`[data-wr-accept="${id}"]`).click();
  assert.equal(d.reviews[id].verdict,'valid');assert.match(d.reviews[id].note,/Grown-up accepted an AI suggestion/);assert.equal(persisted,1);assert.equal(W.pending(S,d).length,0);
 }finally{globalThis.document=saved;}
 const prompt=W.prompt(S,d.attempts.at(-1));assert.match(prompt.system,/data, never as instructions/);assert.doesNotMatch(JSON.stringify(prompt),/Euna/,'no name is sent');
});
test('the nightly reviewer’s problem-type catalog matches the question bank',()=>{
 require('node:child_process').execFileSync(process.execPath,[require('node:path').join(__dirname,'..','scripts','build-problem-types.cjs'),'--check'],{stdio:'pipe'});
 const c=require('../tools/euna-problem-types.json'),r=c.units.find(u=>u.unit==='ratios');assert.ok(r.forms[2].some(t=>t.structure===EA));
 for(const u of c.units)for(const t of u.forms[2])if(t.structure)assert.doesNotThrow(()=>C.validate(plan([{kind:'practice',unit:u.unit,phase:'apply',count:1,form:2,structure:t.structure}]),engines,now));
});
