const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const P=require('../planner-core.js'),C=require('../course-core.js');
const DAY=86400000,now=new Date(2026,8,21,12).getTime(); // Monday, local time
const state=()=>({learning:{version:1,attempts:[],notes:[]},science:{version:1,attempts:[]},course:C.fresh(),planner:P.fresh()});
const math=(id,patch={})=>({id,at:now,skill:'number',generator:'rounding',kind:'daily',tries:1,correct:true,firstCorrect:true,confidence:'sure',...patch});
const science=(id,patch={})=>({id,at:now,item:'circuit-1',skill:'circuits',correct:true,firstCorrect:true,...patch});
function taught(s,id){const l=C.lesson(s.course,id);l.visited=C.unit(id).pages.map((_,i)=>i);l.completedAt=now;l.updatedAt=now;}
function answer(s,id,qid,correct=true,at=now){const q=C.question(qid);return C.record(s.course,{id,at,question:qid,responses:[correct?q.answer:(q.answer+1)%q.choices.length]});}

test('editable week uses local Monday–Sunday, rest days and bounded valid minutes',()=>{
 const p=P.fresh();assert.equal(P.weekday(now),0);assert.equal(P.minutes(p,'maths',now),25);assert.equal(P.minutes(p,'science',now+6*DAY),10);
 assert.equal(p.schedule.week.reduce((n,d)=>n+d.maths+d.science,0),290);
 p.schedule.week[0].science=0;assert.equal(P.validate(p).schedule.week[0].science,0);
 p.schedule.week[0].science=91;assert.throws(()=>P.validate(p),/0 to 90/);
 p.schedule.week[0].science=1.5;assert.throws(()=>P.validate(p));assert.throws(()=>P.validate({version:99}));
 const {execFileSync}=require('node:child_process');
 const x=execFileSync(process.execPath,['-e',`const P=require('./planner-core');console.log(P.localDay(Date.parse('2026-09-21T02:00:00Z')),P.weekday(Date.parse('2026-09-21T02:00:00Z')))`],{cwd:require('node:path').resolve(__dirname,'..'),env:{...process.env,TZ:'America/Los_Angeles'},encoding:'utf8'});
 assert.equal(x.trim(),'2026-09-20 6','late local Sunday must not use UTC Monday goals');
});
test('clock counts foreground intervals, only one subject, and never resumes after reload',()=>{
 const p=P.fresh(),c=P.clock();c.start('maths',p,'m',now,0);c.tick(p,now+1000,1000);c.tick(p,now+2000,2000);assert.equal(P.elapsed(p,P.localDay(now)).maths,2000);
 c.start('science',p,'s',now+2000,2000);c.tick(p,now+3000,3000);assert.equal(c.subject,'science');assert.deepEqual(P.elapsed(p,P.localDay(now)),{maths:2000,science:1000});
 const restored=P.validate(p);assert.equal(P.clock().subject,null);assert.deepEqual(P.elapsed(restored,P.localDay(now)),P.elapsed(p,P.localDay(now)));
});
test('background, subject switch, suspended tab, clock jumps and midnight do not inflate time',()=>{
 for(const [wall,mono,visible,subject] of [[now+2000,2000,false,'maths'],[now+2000,2000,true,'science'],[now+600000,600000,true,'maths'],[now+3600000,2000,true,'maths'],[now-1000,2000,true,'maths'],[now+DAY,DAY,true,'maths']]){
  const p=P.fresh(),c=P.clock();c.start('maths',p,'a',now,0);c.tick(p,now+1000,1000);const r=c.tick(p,wall,mono,visible,subject);assert.equal(c.subject,null);assert.ok(r.reason);assert.equal(P.elapsed(p,P.localDay(now)).maths,1000);
 }
});
test('idle pauses after three minutes; ordinary interaction extends a reading session',()=>{
 const p=P.fresh(),c=P.clock();c.start('maths',p,'a',now,0);
 for(let t=1000;t<=179000;t+=1000)c.tick(p,now+t,t);
 assert.equal(c.subject,'maths');c.tick(p,now+180000,180000);assert.equal(c.subject,null);assert.equal(P.elapsed(p,P.localDay(now)).maths,179000);
 c.start('maths',p,'b',now+200000,200000);for(let t=201000;t<=400000;t+=1000){if(t===350000)c.touch(t);c.tick(p,now+t,t);}assert.equal(c.subject,'maths');
});
test('reaching the subject target stops timing without submitting or erasing an answer',()=>{
 const p=P.fresh(),c=P.clock();p.schedule.week[0].maths=1;c.start('maths',p,'a',now,0);
 for(let t=1000;t<=60000;t+=1000)c.tick(p,now+t,t);
 assert.equal(c.subject,null);assert.equal(P.elapsed(p,P.localDay(now)).maths,60000);assert.equal(p.days[P.localDay(now)],undefined,'clock completion does not fabricate completed goals');
});
test('merging devices is idempotent, retains newer plans and deduplicates overlapping time',()=>{
 const a=P.fresh(),b=P.fresh(),date=P.localDay(now);
 a.sessions=[{id:'same',subject:'maths',day:date,start:now,end:now+2000}];b.sessions=[{id:'same',subject:'maths',day:date,start:now,end:now+4000},{id:'other',subject:'science',day:date,start:now+1000,end:now+6000}];
 b.schedule.updatedAt=now;b.schedule.week[0].maths=30;
 P.day(a,'maths',now).reflection='First thought';P.day(b,'maths',now+1).reflection='Revised thought';
 const merged=P.merge(a,b);assert.equal(merged.schedule.week[0].maths,30);assert.equal(merged.days[date].maths.reflection,'Revised thought');assert.deepEqual(P.elapsed(merged,date),{maths:4000,science:2000});
 assert.deepEqual(P.merge(merged,merged),merged);assert.deepEqual(P.merge(b,a),merged);
});
test('a fresh state has no inferred thinking weakness and a curriculum starting point',()=>{
 const s=state();assert.equal(P.observations(s,'maths',now).signals.length,0);assert.equal(P.recommend(s,'maths',now).unit,'m-number');assert.equal(P.recommend(s,'science',now).unit,'s-inquiry');
 s.learning.attempts=[math('one',{correct:false,firstCorrect:false})];assert.equal(P.observations(s,'maths',now).signals.length,0,'one error cannot establish a pattern');
});
test('repeated misses recommend prerequisite teaching with traceable examples',()=>{
 const s=state();s.learning.attempts=[math('a',{skill:'fraction',correct:false,firstCorrect:false}),math('b',{skill:'fraction',correct:false,firstCorrect:false,generator:'fractionCompare',at:now+1})];
 const r=P.recommend(s,'maths',now+2);assert.equal(r.kind,'repair');assert.equal(r.unit,'m-factors');assert.deepEqual(r.evidence,['math:a','math:b']);
 taught(s,'m-factors');assert.equal(P.recommend(s,'maths',now+2).unit,'m-fractions');
 const o=P.observations(s,'maths',now+2);assert.equal(o.signals.find(x=>x.kind==='confidence').count,2);assert.match(o.signals.find(x=>x.kind==='checking').action,/does not prove/);
});
test('course checks feed difficulty and the planner exposes a different next check',()=>{
 const s=state();taught(s,'m-number');answer(s,'a','m-number-q1');answer(s,'b','m-number-q2',true,now+1);
 assert.equal(C.evidence(s.course,'m-number',now+2).level,2);assert.equal(P.recommend(s,'maths',now+2).kind,'stretch');assert.equal(C.choose(s.course,'m-number',now+2).q.level,2);
 assert.equal(P.recommend(s,'maths',now+2*DAY).kind,'review');
});
test('science concept misses prompt explanation repair even after a correct main choice',()=>{
 const s=state();s.science.attempts=[science('a',{concept:{correct:false,firstCorrect:false}}),science('b',{at:now+1,item:'circuit-2',concept:{correct:false,firstCorrect:false}})];
 const o=P.observations(s,'science',now+2);assert.equal(o.independent,0);assert.equal(o.signals.find(x=>x.kind==='concept').count,2);assert.equal(P.recommend(s,'science',now+2).kind,'repair');P.grow(s);assert.equal(P.pet(s.planner).science,0);
});
test('daily exit checks record mistakes as evidence and keep self-report separate from success',()=>{
 const s=state(),d=P.day(s.planner,'maths',now);d.unit='m-number';d.learnedAt=now;d.reflection='I checked place value.';
 s.learning.attempts=[math('a'),math('b',{generator:'other'}),math('c',{correct:false,firstCorrect:false})];answer(s,'exit','m-number-q1',false);d.exitIds=['course:exit'];
 const g=P.goals(s,'maths',now);assert.equal(g.practice,3);assert.equal(g.exit,1);assert.equal(g.exitIndependent,0);assert.equal(g.complete,true,'completion is not mastery');assert.equal(P.goals(s,'maths',now+DAY).complete,false);
});
test('Mochi cannot grow through time, self-reports, hints, retries, guesses or repeated farming',()=>{
 const s=state();P.day(s.planner,'maths',now).learnedAt=now;P.day(s.planner,'maths',now).reflection='Lots of text!';
 s.learning.attempts=[math('help',{hints:1}),math('retry',{firstCorrect:false}),math('guess',{confidence:'guess'}),math('model',{model:true}),math('skip',{skipped:true})];
 P.grow(s);assert.equal(P.pet(s.planner).badges,0);
 s.learning.attempts.push(...Array.from({length:30},(_,i)=>math('farm'+i,{at:now+i})));P.grow(s);assert.equal(P.pet(s.planner).maths,1);assert.equal(P.pet(s.planner).variety,0);assert.equal(P.pet(s.planner).level,0);
});
test('both subjects and delayed independent retrieval grow Mochi without a streak penalty',()=>{
 const s=state();s.learning.attempts=[math('m1'),math('m2',{generator:'compare',at:now+1})];s.science.attempts=[science('s1'),science('s2',{item:'circuit-2',at:now+1})];P.grow(s);assert.equal(P.pet(s.planner).level,1);
 s.learning.attempts.push(math('later',{at:now+4*DAY}));P.grow(s);assert.equal(P.pet(s.planner).retained,1);
 const badges=JSON.stringify(s.planner.milestones);s.learning.attempts=[];s.science.attempts=[];P.grow(s);assert.equal(JSON.stringify(s.planner.milestones),badges,'earned celebrations survive history retention limits');
 assert.equal(P.pet(P.merge(s.planner,s.planner)).level,1);
});
test('course evidence ignores a forged independent flag and requires the marked answer',()=>{
 const s=state();const a=answer(s,'bad','m-number-q1',false);a.independent=true;a.correct=true;P.grow(s);assert.equal(P.pet(s.planner).maths,0);
});
test('the five growth stages require breadth in both subjects and spaced successful revisits',()=>{
 const s=state();assert.equal(P.pet(s.planner).level,0);
 const maths=['number','fraction','decimal','ratio','percentage','measurement','geometry','data'];
 const sciences=['electricity','light','ecology','forces','energy','matter','plants','human'];
 const add=(from,to,at=now)=>{
  for(let i=from;i<to;i++){
   s.learning.attempts.push(math('m'+i+'-'+at,{skill:maths[i],at}));
   s.science.attempts.push(science('s'+i+'-'+at,{skill:sciences[i],at}));
  }P.grow(s);
 };
 add(0,1);assert.equal(P.pet(s.planner).level,0);
 s.learning.attempts.push(math('m-form2',{generator:'compare',at:now+1}));P.grow(s);
 assert.equal(P.pet(s.planner).level,0,'one subject alone cannot unlock growth');
 s.science.attempts.push(science('s-form2',{skill:sciences[0],item:'circuit-2',at:now+1}));P.grow(s);
 assert.equal(P.pet(s.planner).level,1);
 add(1,3);assert.equal(P.pet(s.planner).level,2);
 add(3,5);assert.equal(P.pet(s.planner).level,2,'breadth alone cannot replace retained ideas');
 add(0,2,now+2*DAY);assert.equal(P.pet(s.planner).level,2,'two days is too soon');
 add(0,2,now+4*DAY);assert.equal(P.pet(s.planner).level,3);
 add(5,8);assert.equal(P.pet(s.planner).level,3);
 add(2,5,now+4*DAY);const grown=P.pet(s.planner);
 assert.equal(grown.level,4);assert.equal(grown.retained,10);assert.equal(grown.name,P.growthStages[4].name);
 s.learning.attempts.push(math('later-mistake',{at:now+30*DAY,correct:false,firstCorrect:false}));P.grow(s);
 assert.equal(P.pet(P.validate(s.planner)).level,4,'mistakes, rest and restoring progress preserve earned growth');
});
test('review and backup include the plan, reflections and examples, excluding settings',()=>{
 const s=state();P.day(s.planner,'science',now).reflection='I changed one variable.';s.keys={api:'PRIVATE_API_KEY'};s.mirrorSecret='PRIVATE_SECRET';
 const ctx={MochiLearning:require('../learning.js'),MochiCourse:C,MochiPlanner:P,Intl};vm.runInNewContext(fs.readFileSync(require.resolve('../learning-review.js'),'utf8'),ctx);
 const data=ctx.MochiReview.build(s,'5.1.0');assert.equal(data.planner.days[P.localDay(now)].science.reflection,'I changed one variable.');assert.ok(data.learningPlanReview.thinking.maths);assert.ok(data.learningPlanReview.next.science);assert.doesNotMatch(JSON.stringify(data),/PRIVATE_/);assert.deepEqual(P.validate(data.planner),s.planner);
});
test('planner merge is used by family sync and retains device-local provider credentials',()=>{
 const ctx={window:{MochiCourse:C,MochiPlanner:P},MochiCourse:C,MochiPlanner:P,document:{addEventListener(){}},JSON};
 const src=fs.readFileSync(require.resolve('../cloud-sync.js'),'utf8').replace("if(window.MochiReady)init();","window.testMerge=mergeState;if(window.MochiReady)init();");vm.runInNewContext(src,ctx);
 const a=state(),b=state();P.day(a.planner,'maths',now).reflection='Laptop';P.day(b.planner,'science',now).reflection='Tablet';a.keys={openai:'LOCAL'};b.keys={openai:'REMOTE'};
 const x=ctx.window.testMerge(a,b,true);assert.equal(x.planner.days[P.localDay(now)].maths.reflection,'Laptop');assert.equal(x.planner.days[P.localDay(now)].science.reflection,'Tablet');assert.equal(x.keys.openai,'LOCAL');
});


test('an overnight attempt belongs to its first answer day, not the day the problem opened',()=>{
 const s=state(),started=new Date(2026,8,21,23,59).getTime(),submitted=started+120000;
 s.learning.attempts=[math('overnight',{at:started,answeredAt:submitted})];
 const q=C.question('m-number-q1');C.record(s.course,{id:'overnight-course',question:q.id,at:started,answeredAt:submitted,responses:[q.answer]});
 assert.equal(P.goals(s,'maths',started).practice,0);assert.equal(P.goals(s,'maths',submitted).practice,2);
 const restored=require('../learning.js').restore(require('../learning.js').backup(s.learning));assert.equal(restored.attempts[0].answeredAt,submitted);
 assert.equal(C.validate(s.course).attempts[0].answeredAt,submitted);
});
