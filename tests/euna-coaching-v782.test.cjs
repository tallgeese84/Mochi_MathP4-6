/* Regression checks for the v7.8.2 proactive tutoring and plan-recovery path.
 * All examples here are synthetic. No learner exports or private plans. */
'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const P=require('../tutor-pilot-core.js'),M=require('../entrance-core.js'),S=require('../science-path-core.js'),N=require('../nightly-plan-core.js');
require('../tutor-pilot-ui.js');
const UI=globalThis.MochiTutorPilotUI;
const now=Date.parse('2026-11-01T14:00:00Z');
const engines={maths:M,science:S};
const state=()=>({entrance:M.fresh(),sciencePath:S.fresh()});
function plan(){return {schema:1,id:'synthetic-plan-2026-11-01',revision:1,student:'Euna',timeZone:'America/Chicago',reviewedDate:'2026-10-31',sessionDate:'2026-11-01',generatedAt:'2026-11-01T12:00:00Z',sourceExportedAt:'2026-11-01T10:00:00Z',subjects:{maths:{focus:'Synthetic Motion relationship.',steps:[{kind:'practice',unit:'motion',phase:'apply',count:1}]},science:{focus:'Synthetic Circuits relationship.',steps:[{kind:'practice',unit:'circuits',phase:'apply',count:1}]}}};}
function teach(E,d,id){for(let i=0;i<3;i++)E.visit(d,id,i,now-5000);E.concept(d,id,E.unit(id).check[2],now-4000);E.complete(d,id,now-3000);}
test('Circuits recognizes eligible illustrated questions without enabling unrelated Science',()=>{
 const keys=new Set();let sample;
 for(let seed=0;seed<100;seed++){
  const q=S.B.make('circuits',1,seed),sp=P.spec('science',q);
  if(sp){keys.add(sp.key);sample??=q;}
 }
 assert(sample,'an authored Circuits question must be eligible');
 assert([...keys].every(x=>['circuit-series','circuit-parallel','circuit-common'].includes(x)));
 assert.equal(P.spec('science',S.B.make('forces',1,2)),null);
 for(const key of ['circuit-series','circuit-parallel','circuit-common']){
  const html=UI.representation(key,'diagram',{params:{}});
  assert.match(html,/path|route|battery/i);assert.doesNotMatch(html,/\bcorrect answer\b/i);
 }
});
test('Circuits auto-coaching is one first-miss turn with a per-day budget',()=>{
 const d=S.fresh(),v=S.startPractice(d,'circuits',{phase:'apply',seed:16,now}),q=S.question(v);
 assert(P.spec('science',q));
 const a={id:v.id,correct:false,helped:false,responses:[{at:now+1,answer:'synthetic wrong'}]};
 assert.equal(P.autoGate(d,'science',v,q,a,now),'READY');
 const first=P.reserveAuto(d,'science',v,q,a,now);
 assert(first);assert.equal(first.reasonCode,'AUTO_STARTED');
 assert.equal(P.autoGate(d,'science',v,q,a,now+1),'ALREADY_REQUESTED');
 assert.equal(P.reserveAuto(d,'science',v,q,a,now+2),null);
 assert.equal(P.autoGate(d,'science',v,q,{...a,correct:true},now+3),'NOT_FIRST_INCORRECT');
 assert.equal(P.autoGate(d,'science',{...v,phase:'recall'},q,a,now+3),'NOT_FIRST_INCORRECT');
 assert.equal(P.autoGate(d,'science',v,{...q,kind:'written'},a,now+3),'NOT_FIRST_INCORRECT');
 const validated=S.validate(d);assert.equal(P.events(validated).length,1);
});
test('fenced JSON and a brief format preamble parse, but unsupported diagnoses do not',()=>{
 const obj={reply:'Draw the gap. Which quantity changes each minute?',focus:'uncertain',evidenceQuote:'',evidenceSource:'none',nextAction:'clarify'};
 assert.equal(P.parseAI('Here is the JSON:\n```json\n'+JSON.stringify(obj)+'\n```').reply,obj.reply);
 assert.throws(()=>P.parseAI(JSON.stringify({...obj,focus:'relationship'})),/AI_EVIDENCE_REQUIRED/);
 assert.throws(()=>P.parseAI(JSON.stringify({...obj,reply:'',secret:'not a field'})),/AI_REPLY_SCHEMA/);
});
test('Motion fresh search continues beyond 128 exhausted candidates without inventing new examples',()=>{
 const d=M.fresh(),phase='transfer',id='motion';
 let seed=(parseInt(M.B.hash(id+':'+phase+':0'),36)>>>0);
 const seen=new Set();
 for(let i=0;i<128;i++,seed=(seed+0x9e3779b9)>>>0){
  const q=M.B.make(id,2,seed);
  seen.add(q.fingerprint);d.seen[q.fingerprint]=now-100;
 }
 const next=M.practiceChoice(d,id,{phase,now});
 assert(next,'a later original unseen variant should be found');
 assert(!next.seenBefore,'a previously seen question must not be called new');
 assert(!seen.has(next.q.fingerprint));
});
test('a depleted plan reports NO_FRESH_QUESTION, keeps its step and never manufactures a completion',()=>{
 const s=state();teach(M,s.entrance,'motion');
 const r=N.fresh(N.validate(plan(),engines,now),now);
 const was=M.practiceAvailable;
 try{
  M.practiceAvailable=()=>false;
  assert.equal(N.routing(r,s,'maths',engines,now).reasonCode,'NO_FRESH_QUESTION');
  assert.equal(N.next(r,s,'maths',engines,now),null);
  assert.equal(r.progress.maths.index,0);
  assert.equal(s.entrance.attempts.length,0);
 }finally{M.practiceAvailable=was;}
});
test('the child receives a clear no-fresh message without extra daily study time',()=>{
 const text=fs.readFileSync(require.resolve('../nightly-plan.js'),'utf8');
 assert.match(text,/NO_FRESH_QUESTION/);assert.match(text,/no extra study time is owed/i);
 assert(!text.includes('addMinutes('));
});
