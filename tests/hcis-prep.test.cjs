const test=require('node:test'),assert=require('node:assert/strict');
const E=require('../entrance-core.js'),H=require('../hcis-prep.js'),C=require('../nightly-plan-core.js'),Sci=require('../science-path-core.js');
const at=Date.parse('2026-11-05T17:00:00Z'),DAY=86400000;
function teach(d,id){for(let i=0;i<3;i++)E.visit(d,id,i,at-2*DAY);E.concept(d,id,E.unit(id).check[2],at-2*DAY+1);assert(E.complete(d,id,at-2*DAY+2));}
function answer(d,id,phase,seed,t){E.finishPractice(d);const v=E.startPractice(d,id,{phase,seed,now:t}),q=E.question(v);E.touchDraft(d,{answer:q.answerLabel,working:'Add, divide and check the original context.'},t+1);const a=E.respond(d,t+2);assert(a.ok);assert(a.attempt.correct);return a.attempt;}
test('HCIS topic focus is additive to legacy NUS High preparation',()=>{
 const d=E.fresh();assert.equal(E.plan(d,at).total,42);assert.equal(E.hcisReport(d,at).total,15);
 assert(E.unit('hcis-statistics'));assert.equal(H.TOPICS.some(x=>x[0]==='hcis-statistics'),true);
 const p=H.papers();assert.equal(p.length,10);assert(p.every(x=>x.kind==='hcis'&&x.units.length===12&&x.minutes===45&&x.calculator));
 assert.equal(p[0].date,'2026-12-12');assert.equal(p.at(-1).date,'2027-09-11');
});
test('statistics offers original guided, applied, transfer and paper forms',()=>{
 for(let form=0;form<4;form++){const q=E.B.make('hcis-statistics',form,117+form);assert(E.B.mark(q,q.answerLabel));assert(q.text.length>20&&q.steps.length>=2);}
 const d=E.fresh();teach(d,'hcis-statistics');answer(d,'hcis-statistics','apply',22,at);
 assert.equal(E.evidence(d,'hcis-statistics',at+2000).mastered,false);
});
test('monthly papers do not become official or inflate DSA internal scores',()=>{
 const d=E.fresh(),p=H.papers()[0],questions=E.paperQuestions(p.id);
 assert.equal(questions.length,12);assert(questions.every(x=>[0,1,2].includes(x.form)));
 E.startPaper(d,p.id,at);
 questions.forEach((q,i)=>E.savePaperAnswer(d,p.id,i,{answer:q.answerLabel,working:'Independent paper reasoning'},at+100+i));
 const s=E.submitPaper(d,p.id,at+10000);
 assert.equal(s.correct,12);assert.equal(s.timed,true);assert.equal(s.independent,true);
 assert.equal(s.qualifying,false);assert.match(s.status,/not an official test/i);
 assert.equal(E.report(d,at+11000).qualifyingPapers,0);
 assert.equal(E.hcisReport(d,at+11000).papers.length,1);
});
test('draft deferral preserves working and survives backups and merge',()=>{
 const d=E.fresh();teach(d,'percent');const v=E.startPractice(d,'percent',{phase:'apply',seed:35,now:at});
 E.touchDraft(d,{answer:'600',working:'First I find the remaining fraction.',strokes:[[[0.2,0.3],[0.5,0.7]]]},at+1);
 assert(E.deferDraft(d,at+2));assert.equal(d.draft,null);assert.equal(d.deferredDrafts.length,1);
 assert.equal(d.attempts.length,0);const x=E.validate(d),y=E.validate(d);
 assert.equal(x.deferredDrafts[0].working,'First I find the remaining fraction.');
 const merged=E.merge(x,y);assert.equal(merged.deferredDrafts.length,1);
 assert(E.resumeDeferred(merged,v.id));assert.equal(merged.draft.id,v.id);
 assert.equal(merged.draft.working,'First I find the remaining fraction.');
 assert.deepEqual(merged.draft.strokes,[[[0.2,0.3],[0.5,0.7]]]);
});
test('saved work blocks a private plan only until learner deliberately parks it',()=>{
 const s={entrance:E.fresh(),sciencePath:Sci.fresh()},d=s.entrance;
 teach(d,'percent');E.startPractice(d,'percent',{phase:'apply',seed:19,now:at});
 E.touchDraft(d,{answer:'?',working:'In progress.'},at+1);
 const plan={schema:1,id:'hcis-nightly-example',revision:1,student:'Euna',timeZone:'America/Chicago',
 reviewedDate:'2026-11-04',sessionDate:'2026-11-05',generatedAt:'2026-11-05T08:00:00Z',sourceExportedAt:'2026-11-05T03:00:00Z',
 subjects:{maths:{focus:'Independent application of percentages',steps:[{kind:'practice',unit:'percent',phase:'guided',count:1}]},science:{focus:'Classify evidence',steps:[{kind:'practice',unit:'fairtest',phase:'guided',count:1}]}}};
 const rec=C.fresh(plan,at),engines={maths:E,science:Sci};
 assert.equal(C.routing(rec,s,'maths',engines,at).reasonCode,'SAVED_DRAFT');
 assert.equal(C.next(rec,s,'maths',engines,at),null);
 assert(E.deferDraft(d,at+2));assert(C.next(rec,s,'maths',engines,at));
 assert.equal(C.routing(rec,s,'maths',engines,at).reasonCode,'READY');
 assert.equal(d.deferredDrafts.length,1);
});
test('an unassisted answer alone never earns mastery without changed transfer and delayed recall',()=>{
 const d=E.fresh();teach(d,'percent');
 answer(d,'percent','apply',21,at);answer(d,'percent','apply',41,at+400);
 answer(d,'percent','transfer',91,at+800);
 assert.equal(E.evidence(d,'percent',at+900).mastered,false);
});
