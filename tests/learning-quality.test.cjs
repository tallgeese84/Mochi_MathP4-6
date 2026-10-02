const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const E=require('../entrance-core.js'),S=require('../science-path-core.js'),B=S.B,W=require('../science-writing.js'),P=require('../science-practice.js'),Cats=require('../cat-friends-core.js'),F=require('../entrance-figures.js');
const now=Date.UTC(2026,9,2,17),copy=x=>JSON.parse(JSON.stringify(x));
function teach(C,d,id,t=now-100000){for(let i=0;i<3;i++)C.visit(d,id,i,t+i);C.concept(d,id,C.unit(id).check[2],t+4);assert.ok(C.complete(d,id,t+5));}
function answer(C,d,id,form,seed,t,fields={}){C.finishPractice(d);const v=C.startPractice(d,id,{phase:form===0?'guided':form===2?'transfer':'apply',form,seed,now:t,rev:fields.rev||C.REV}),q=C.question(v);C.touchDraft(d,{answer:fields.answer??(C===S?q.answer:q.answerLabel),working:'Synthetic verification',...fields},t+1);if(fields.help)C.help(d);const a=C.respond(d,t+2).attempt;C.finishPractice(d);return a;}
function pass(C,d,id,t=now-30000){teach(C,d,id,t-1000);for(let i=0;i<3;i++)answer(C,d,id,i===2?2:1,101+i*7919,t+i*20);}
function dissolve(){for(let s=0;s<1000;s++){const q=B.make('fairtest',2,s,2);if(q.writtenKey==='fair-plan-dissolve')return q;}throw Error('Missing original dissolving plan');}
const partial="I change only the water temperature. I keep the mass of sugar, water volume and stirring the same. I measure the time until it dissolves. That doesn't mean the sugar is gone.";
test('contextual repetition check rejects unrelated meanings, single comparisons and negated repeats',()=>{
 for(const s of ["It doesn't mean the sugar is gone.",'Mean children disagree.','I will not repeat the experiment.','I never repeat the trials.','I use two temperatures.','I will average the results.','There is no need to repeat the test.'])assert.equal(W.replication(s),false,s);
 for(const s of ['Repeat the test at each temperature.','I would repeat it.','Test it three times.','Take the mean of three measurements.','Measure it again.','Use several similar seedlings in each group.'])assert.equal(W.replication(s,true),true,s);
});
test('strict feedback catches melting sugar but accepts explicitly distinguishing dissolving from melting',()=>{
 for(const s of ['Hot water will melt the sugar.','The sugar would quickly melt.'])assert.equal(W.dissolvingConflict(s),true,s);
 for(const s of ['Sugar dissolves; it does not melt.','Sugar will not melt.','Do not melt the sugar.'])assert.equal(W.dissolvingConflict(s),false,s);
});
test('a synthetic version of the reported mean false-positive stays historical but fails the new check',()=>{
 const q=dissolve();assert.equal(B.mark(q,partial,1),true);assert.equal(B.mark(q,partial,2),false);const p=B.ideaReport(q,partial);assert.ok(p.missing.some(x=>/Repeat/.test(x)));assert.ok(B.mark(q,partial+' I repeat the test at each temperature.',2));
 assert.equal(B.mark(q,partial+' Repeat the test. Hot water melts the sugar.',2),false);
});
test('new written responses are provisional; adult review can verify a fresh first response without changing its automatic mark',()=>{
 const d=S.fresh();teach(S,d,'circuits');const a=answer(S,d,'circuits',2,817,now);assert.equal(a.correct,true);assert.equal(a.independent,false);assert.equal(a.responses[0].gradingVersion,2);assert.equal(S.evidence(d,'circuits',now+5).transfer,0);assert.equal(S.report(d,now+5).writing.pending,1);
 S.review(d,a.id,'valid','Read the actual explanation.',now+10);assert.equal(S.independentFor(d,a),true);assert.equal(S.evidence(d,'circuits',now+11).transfer,1);assert.equal(a.independent,false);assert.equal(S.report(d,now+11).writing.pending,0);
 const restored=S.merge(S.exportData(d),S.fresh());assert.equal(S.independentFor(restored,restored.attempts[0]),true);assert.equal(restored.attempts[0].responses[0].gradingVersion,2);
});
test('human review can recognise valid alternative phrasing missed by the local checklist',()=>{
 const d=S.fresh();teach(S,d,'circuits');const a=answer(S,d,'circuits',2,817,now,{answer:'A short differently phrased explanation for an adult to judge.'});assert.equal(a.correct,false);assert.ok(S.pendingWriting(d,a));S.review(d,a.id,'valid','Synthetic valid-alternative review.',now+10);assert.equal(S.independentFor(d,a),true);assert.equal(a.correct,false);
});
test('review never erases support, revisions or a stale review timestamp',()=>{
 for(const helped of [false,true]){const d=S.fresh();teach(S,d,'circuits');const v=S.startPractice(d,'circuits',{phase:'transfer',seed:173,now});if(helped)S.help(d);S.touchDraft(d,{answer:S.question(v).answer},now+1);const a=S.respond(d,now+2).attempt;S.review(d,a.id,'valid','Synthetic',now+3);assert.equal(S.independentFor(d,a),!helped);
 S.touchDraft(d,{answer:S.question(v).answer+' This is a revision.'},now+4);const b=S.respond(d,now+5).attempt;assert.equal(S.independentFor(d,b),false);assert.ok(S.pendingWriting(d,b));S.review(d,b.id,'valid','Revised reasoning reviewed.',now+6);assert.equal(S.independentFor(d,b),false);}
});
test('old saved written scores, questions, rewards and response versions are not silently regraded',()=>{
 const d=S.fresh(),q=dissolve();const a=S.record(d,{...q,rev:2,id:'synthetic-old',mode:'practice',phase:'transfer',at:now-100,updatedAt:now-1,responses:[{at:now-1,answer:partial,working:'',strokes:[]}]});assert.equal(a.correct,true);assert.equal(a.independent,true);const restored=S.validate(copy(d));assert.deepEqual(restored.attempts[0],a);assert.equal(S.evidence(restored,'fairtest',now).transfer,0);assert.equal(B.ideaReport(q,partial).missing.length,1);
});
test('unreviewed writing does not become a conceptual-error redo loop or trigger repeat-failure teaching',()=>{
 const d=S.fresh();teach(S,d,'circuits');for(let i=0;i<5;i++)answer(S,d,'circuits',2,100+i*137,now+i*100,{answer:'An explanation requiring adult review.'});const e=S.evidence(d,'circuits',now+1000);assert.equal(e.needsTeaching,false);assert.equal(e.parked,false);assert.equal(S.errorLog(d,now+1000).length,0);assert.ok(S.report(d,now+1000).writing.pending);
});
test('new circuit questions include six distinct states and two representations, with matching reference answers',()=>{
 const outcomes=new Set,formats=new Set,writings=new Set;
 for(let i=0;i<600;i++){for(const f of [1,2]){const q=B.make('circuits',f,i*104729);assert.ok(B.mark(q,q.answer,2),q.text);assert.ok(q.answer.length<=600);if(f===1){outcomes.add(q.text);formats.add(q.figure.type||q.figure.kind);}else writings.add(q.writtenKey);}}
 assert.equal(outcomes.size,6);assert.equal(formats.size,2);assert.equal(writings.size,6);
});
test('fresh circuit representation selection is checked by explicit conducting-path enumeration',()=>{
 for(let i=0;i<200;i++){const q=B.make('circuits',1,i*104729),text=q.text;const series=/share one series path/.test(text),common=/common battery connection is open/.test(text),openA=/branch A is open/.test(text),openB=/branch B is open/.test(text);const lit=['A','B'].filter(x=>!common&&!(x==='A'?openA:openB));const expected=!lit.length?'Neither bulb lights.':lit.length===2?'Both bulbs light.':`Only ${lit[0]} lights.`;assert.equal(q.answerLabel,expected);if(series)assert.ok(lit.length===0||lit.length===2);}
});
test('new dissolving and repetition examples satisfy their strict rubric across 1000 generated cases',()=>{
 for(const [id,f] of [['changes',2],['fairtest',1]])for(let i=0;i<500;i++){const q=B.make(id,f,i*7919);assert.ok(B.mark(q,q.answer,2),q.id);assert.ok(q.steps.length>=3);assert.ok(q.answer.length<600);}
});
test('three circuit questions offer explanation, then leave the topic while review is pending',()=>{
 const d=S.fresh(),state={sciencePath:d};teach(S,d,'circuits');teach(S,d,'measurement');for(let i=0;i<3;i++)answer(S,d,'circuits',1,73+i*7919,now+i*100);
 let r=P.route(S,state,{kind:'practice',unit:'circuits'},now+1000,true);assert.equal(r.phase,'transfer');answer(S,d,'circuits',2,817,now+1100);r=P.route(S,state,{kind:'practice',unit:'circuits'},now+1200,true);assert.notEqual(r.unit,'circuits');assert.equal(r.unit,'measurement');
});
test('an exhausted science pool cannot turn a familiar repeat into fresh mastery',()=>{
 const d=S.fresh();teach(S,d,'circuits');let q=B.make('circuits',1,15,2);S.record(d,{...q,id:'synthetic-seen',rev:2,mode:'practice',phase:'apply',at:now-10,seenBefore:true,exhausted:true,responses:[{at:now-1,answer:q.answer}]});assert.equal(S.evidence(d,'circuits',now).apply,0);
});
test('active paper and unfinished question take priority over repetition safeguards',()=>{
 const state={sciencePath:S.fresh()},d=state.sciencePath;S.startPractice(d,'circuits',{seed:19,now});const keep={kind:'resume',unit:'circuits'};assert.deepEqual(P.route(S,state,keep,now),keep);S.finishPractice(d);S.startPaper(d,'mixed-a',now);assert.deepEqual(P.route(S,state,keep,now),keep);
});
test('a known missing replication step offers teaching without rewriting the historical answer',()=>{
 const d=S.fresh(),q=dissolve();teach(S,d,'fairtest',now-1000);const a=S.record(d,{...q,id:'synthetic-old-gap',rev:2,mode:'practice',phase:'transfer',at:now-10,responses:[{at:now-1,answer:partial}]});const before=copy(a),r=P.route(S,{sciencePath:d},{kind:'practice',unit:'circuits'},now);assert.equal(r.unit,'fairtest');assert.equal(r.kind,'learn');assert.deepEqual(a,before);S.visit(d,'fairtest',0,now+1);const next=P.route(S,{sciencePath:d},{kind:'practice',unit:'measurement'},now+2);assert.equal(next.unit,'measurement');
});
test('new geometry steps use named faces and pairs, finite drawings, and checked inverse edge lengths',()=>{
 for(const id of ['geo-one-face','geo-face-pairs'])for(let form=0;form<4;form++)for(let i=0;i<150;i++){const q=E.B.make(id,form,i*104729),p=q.params;let cells=0;for(let face=0;face<p.n;face++)for(let x=0;x<p.w;x++)for(let y=0;y<p.h;y++)cells++;assert.equal(q.answer,form<2?cells:cells/p.n/p.w);assert.ok(E.B.mark(q,q.answerLabel));assert.doesNotMatch(F.diagram(q.figure,q.id),/NaN|undefined|Infinity/);}
});
test('surface mistakes route to smaller face steps; advanced surface questions stay out of new mixed queues',()=>{
 const d=E.fresh();pass(E,d,'geo-measure');pass(E,d,'geo-layers');teach(E,d,'geo-surface');answer(E,d,'geo-surface',1,17,now-10,{answer:'99999'});assert.equal(E.recommend({entrance:d},now).unit,'geo-one-face');assert.equal(E.prerequisite(d,'geo-surface',now),'geo-one-face');
 // Give a single old surface answer credit: this is not enough to skip the missing bridge.
 answer(E,d,'geo-surface',1,81,now+10);pass(E,d,'percent',now+20);const m=E.startMixed(d,now+5000);assert.ok(m);assert.ok(m.items.every(x=>!['volume','geo-surface','geo-face-pairs'].includes(x.unit)));
});
test('new face-lesson rewards are additive, bounded and merge-safe',()=>{
 const state={entrance:E.fresh(),coins:42};teach(E,state.entrance,'geo-one-face');teach(E,state.entrance,'geo-face-pairs');Cats.sync(state,now);const x=Cats.report(state,now);assert.equal(x.studyPoints,2);Cats.sync(state,now+1);assert.equal(Cats.report(state,now+1).studyPoints,2);assert.equal(Cats.merge(state.catFriends,state.catFriends).studyAwards.length,2);assert.equal(state.coins,42);
});

test('opening a solution after a provisional written pass still records help and shows the solution',()=>{
 const d=S.fresh();teach(S,d,'circuits');const v=S.startPractice(d,'circuits',{phase:'transfer',seed:99,now});S.touchDraft(d,{answer:S.question(v).answer},now+1);S.respond(d,now+2);S.help(d,true,now+3);assert.ok(d.draft.revealed);assert.ok(d.attempts[0].revealed);S.review(d,d.attempts[0].id,'valid','Synthetic',now+4);assert.equal(S.independentFor(d,d.attempts[0]),false);
});
