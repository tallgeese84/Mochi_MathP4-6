
const test=require('node:test'),assert=require('node:assert/strict');
const C=require('../nightly-plan-core.js'),M=require('../entrance-core.js'),S=require('../science-path-core.js');
const now=Date.parse('2026-10-17T14:00:00Z'),ref={planId:'nightly-2026-10-17',revision:1,sessionDate:'2026-10-17'};
const plan={schema:1,id:ref.planId,revision:1,student:'Euna',timeZone:'America/Chicago',reviewedDate:'2026-10-16',sessionDate:ref.sessionDate,generatedAt:'2026-10-17T08:00:00Z',sourceExportedAt:'2026-10-17T01:00:00Z',subjects:{maths:{focus:'Count once.',steps:[{kind:'practice',unit:'counting',phase:'guided',count:1}]},science:{focus:'Trace a circuit.',steps:[{kind:'practice',unit:'circuits',phase:'guided',count:1}]}}};
test('actual plan identity survives answers, reload, export and older-device merge without independent credit',()=>{
 const state=M.fresh(),r=C.fresh(plan,now),d=M.startPractice(state,'counting',{phase:'guided',seed:917,now});C.bind(r,{nightly:true,planId:plan.id,stepIndex:0,subject:'maths',unit:'counting'},{kind:'practice',unit:'counting'},d,now+1);
 assert.equal(r.startedAt,now+1);assert.deepEqual(d.nightlyPlan,ref);const restored=M.validate(state);assert.deepEqual(restored.draft.nightlyPlan,ref);
 M.touchDraft(restored,{answer:M.question(d).answerLabel},now+2);M.respond(restored,now+3);const a=restored.attempts[0];assert.deepEqual(a.nightlyPlan,ref);assert.equal(a.independent,false);
 const old=JSON.parse(JSON.stringify(restored));delete old.attempts[0].nightlyPlan;delete old.draft.nightlyPlan;
 for(const merged of [M.merge(old,restored),M.merge(restored,old)]){assert.deepEqual(merged.attempts[0].nightlyPlan,ref);assert.equal(merged.attempts[0].independent,false);}assert.deepEqual(M.exportData(restored).attempts[0].nightlyPlan,ref);
});
test('crossed provenance stays conflicted and cannot be laundered into another plan',()=>{
 const d=M.fresh(),q=M.startPractice(d,'counting',{phase:'guided',seed:717,now});q.nightlyPlan=ref;M.touchDraft(d,{answer:M.question(q).answerLabel},now+2);M.respond(d,now+3);
 const b=JSON.parse(JSON.stringify(d));b.attempts[0].nightlyPlan.revision=2;const m=M.merge(d,b);assert.equal(m.attempts[0].nightlyPlan,undefined);assert.equal(m.attempts[0].nightlyConflict,true);assert.equal(M.merge(m,d).attempts[0].nightlyPlan,undefined);assert.equal(m.attempts[0].independent,false);
});
test('an alternative valid timezone cannot change the family calendar',()=>{assert.throws(()=>C.validate({...plan,timeZone:'America/New_York'},{maths:M,science:S},now));});
