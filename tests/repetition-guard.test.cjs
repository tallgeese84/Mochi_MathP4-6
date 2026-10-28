'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const S=require('../science-path-core.js'),M=require('../entrance-core.js'),N=require('../nightly-plan-core.js');
const now=Date.parse('2026-10-27T15:00:00Z'),DAY=86400000;
function teach(E,d,id,t=now-1000){for(let i=0;i<3;i++)E.visit(d,id,i,t);E.concept(d,id,E.unit(id).check[2],t+1);E.complete(d,id,t+2);}
function answer(E,d,id,phase,seed,t=now){E.finishPractice(d);const v=E.startPractice(d,id,{phase,seed,now:t});assert(v,'a varied question must be available');const q=E.question(v);E.touchDraft(d,{answer:E===M?q.answerLabel:q.answer,working:'Use the stated relationship and compare the evidence.'},t+1);const out=E.respond(d,t+2);assert(out.ok);E.finishPractice(d);return out.attempt;}
function exhaust(d,t=now){for(const [i,seed] of [3668340011,2027808484,2654435769].entries())answer(S,d,'water','transfer',seed,t+i*3);return d;}
function setup(){const d=S.fresh();teach(S,d,'water');teach(S,d,'measurement');answer(S,d,'water','apply',11,now-20);answer(S,d,'water','apply',222,now-10);return d;}
test('mist: changing seed or shuffling options never produces an immediate duplicate',()=>{
 const d=exhaust(setup()),a=d.attempts.at(-1);assert.match(a.question,/visible mist/);const before=JSON.stringify(d);
 for(const seed of [9,10,100,103939,4294967295])assert.equal(S.startPractice(d,'water',{phase:'transfer',seed,now:now+20}),null);
 assert.equal(JSON.stringify(d),before,'refused generation must not create attempts, exposure, grades or a draft');
 const choice=S.practiceRoute({sciencePath:d},'water',undefined,now+21);assert.notEqual(choice.unit,'water');assert.equal(S.evidence(d,'water',now+21).transfer,3);
});
test('mist: Next recommendation and explicit Another cannot recycle the exhausted transfer',()=>{
 const d=exhaust(setup());const state={sciencePath:d};
 for(const phase of [undefined,'transfer']){const r=S.practiceRoute(state,'water',phase,now+20);assert(!(r.kind==='practice'&&r.unit==='water'&&r.phase==='transfer'));}
 const r=S.avoidRepeat(state,{kind:'practice',unit:'water',phase:'transfer'},now+20);assert.notEqual(r.unit,'water');
});
test('complete history prevents duplicates even when the seen cache is missing',()=>{
 const d=exhaust(setup());d.seen={};assert.equal(S.startPractice(d,'water',{phase:'transfer',seed:123,now:now+20}),null);
 const restored=S.validate(d);assert.equal(S.startPractice(restored,'water',{phase:'transfer',seed:234,now:now+20}),null);
});
test('fresh seed search changes semantic givens, not merely option positions',()=>{
 const d=S.fresh();teach(S,d,'measurement');const a=answer(S,d,'measurement','apply',1);
 const v=S.startPractice(d,'measurement',{phase:'apply',seed:1,now:now+10});assert(v);assert.notEqual(S.question(v).fingerprint,a.fingerprint);assert.equal(v.seenBefore,false);
});
test('legacy repeated successes stay in history but count once in variety and mastery',()=>{
 const d=setup(),a=answer(S,d,'water','transfer',9);for(let i=0;i<8;i++)S.record(d,{...a,id:'synthetic-repeat-'+i,at:now+10+i,updatedAt:now+11+i,seenBefore:true,exhausted:true,responses:[{...a.responses[0],at:now+11+i}]});
 const history=JSON.stringify(d),r=S.report(d,now+50);assert.equal(r.practice.recordedQuestions,11);assert.equal(r.practice.distinctQuestions,3);assert.equal(r.practice.repeatQuestions,8);assert.equal(r.practice.freshIndependent,3);assert.equal(S.evidence(d,'water',now+50).transfer,1);assert.equal(JSON.stringify(d),history);
});
test('Maths no longer grants extra mastery from an exhausted familiar copy',()=>{
 const d=M.fresh();teach(M,d,'percent');const a=answer(M,d,'percent','apply',801);for(let i=0;i<3;i++)M.record(d,{...a,id:'synthetic-math-repeat-'+i,at:now+10+i,seenBefore:true,exhausted:true,responses:[{...a.responses[0],at:now+11+i}]});
 assert.equal(M.evidence(d,'percent',now+50).apply,1);assert.equal(M.practiceCounts(d,now+50).repeatQuestions,3);
});
test('edits of one unanswered question stay available; no history, help or rewards are cleared',()=>{
 const d=setup(),v=S.startPractice(d,'water',{phase:'transfer',seed:9,now});S.touchDraft(d,{answer:'c0:r0',working:'Keep this note.'},now+1);S.help(d,true,now+2);const snapshot=JSON.stringify(v);
 assert.equal(S.startPractice(d,'measurement',{phase:'apply',seed:42,now:now+10}),v);assert.equal(JSON.stringify(v),snapshot);
 const state={sciencePath:d,coins:42,catFriends:{unlocked:['synthetic-cat']},planner:{schedule:{unchanged:true}}},before=JSON.stringify(state);
 assert.equal(S.avoidRepeat(state,{kind:'practice',unit:'water'},now+10).unit,'water');assert.equal(JSON.stringify(state),before);
});
test('one submitted single recall per day stops automatic recall loops even after a miss',()=>{
 const d=S.fresh();teach(S,d,'measurement',now-10*DAY);answer(S,d,'measurement','apply',2,now-9*DAY);answer(S,d,'measurement','apply',87,now-9*DAY+10);const a=answer(S,d,'measurement','transfer',97,now-9*DAY+20);
 const r=S.recommend({sciencePath:d},now);assert.equal(r.kind,'recall');const v=S.startPractice(d,r.unit,{phase:'recall',seed:144,now});const q=S.question(v),bad=q.answer.split(':')[0]+':r'+((+q.answer.split(':')[1].slice(1)+1)%q.reasons.length);
 S.touchDraft(d,{answer:bad,working:'Compare the supplied measurements.'},now+1);S.respond(d,now+2);S.finishPractice(d);
 assert.notEqual(S.recommend({sciencePath:d},now+3).kind,'recall');assert.equal(S.evidence(d,'measurement',now+3).delayed,0,'routing allowance is not mastery');assert(a.independent);
});
test('valid spaced retrieval advances its due date; immediate replay cannot multiply retrieval credit',()=>{
 const d=S.fresh();teach(S,d,'water',now-30*DAY);answer(S,d,'water','apply',1,now-29*DAY);answer(S,d,'water','apply',22,now-29*DAY+10);const a=answer(S,d,'water','transfer',9,now-29*DAY+20);
 const q=S.B.make('water',2,9);for(let i=0;i<4;i++)S.record(d,{...a,id:'synthetic-recall-'+i,phase:'recall',at:now+i*10,answeredAt:now+i*10+1,seenBefore:true,recallOf:a.id,lessonViewedAt:now-30*DAY,responses:[{at:now+i*10+1,answer:q.answer,working:'Compare liquid droplets with gas-phase water.'}]});
 const e=S.evidence(d,'water',now+100);assert.equal(e.delayed,1);assert(e.due>now+100);assert.equal(e.overdue,false);
});
test('exhausted nightly slot remains unfinished and reports NO_FRESH_QUESTION',()=>{
 const d=exhaust(setup());const state={sciencePath:d,entrance:M.fresh()},p={schema:1,id:'synthetic-nightly-2026-10-27',revision:1,student:'Euna',timeZone:'America/Chicago',reviewedDate:'2026-10-26',sessionDate:'2026-10-27',generatedAt:'2026-10-27T06:00:00Z',sourceExportedAt:'2026-10-27T01:00:00Z',subjects:{maths:{focus:'Compare the quantities.',steps:[{kind:'practice',unit:'percent',phase:'guided',count:1}]},science:{focus:'Distinguish liquid droplets and water vapour.',steps:[{kind:'practice',unit:'water',phase:'transfer',count:1}]}}},engines={maths:M,science:S},r=N.fresh(p,now),before=JSON.stringify(state);
 assert.equal(N.next(r,state,'science',engines,now+20),null);assert.equal(N.routing(r,state,'science',engines,now+20).reasonCode,'NO_FRESH_QUESTION');assert.equal(r.progress.science.index,0);assert.equal(r.startedAt,null);assert.equal(JSON.stringify(state),before);
});
test('provisional written responses are never fresh independent successes',()=>{
 const d=S.fresh();teach(S,d,'changes');const a=answer(S,d,'changes','transfer',37);assert(S.pendingWriting(d,a));assert.equal(S.practiceCounts(d,now+10).freshIndependent,0);assert.equal(S.report(d,now+10).writing.pending,1);
});
test('all-new small banks can finish without an unbounded same-question fallback',()=>{
 const d=exhaust(setup());const before=JSON.stringify(d);
 for(let i=0;i<20;i++)assert.equal(S.practiceAvailable(d,'water','transfer',now+i+20),false);
 assert.equal(JSON.stringify(d),before);
});
