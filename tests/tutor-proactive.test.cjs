'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const P=require('../tutor-pilot-core.js');
const today=Date.parse('2026-10-28T21:00:00Z');
const nextDay=Date.parse('2026-10-29T19:00:00Z');
const fake=(subject='maths',now=today,phase='apply')=>{
 const q=subject==='maths'?{unit:'motion',form:1,structure:'',fingerprint:`finger-${now}`,kind:'numeric'}:{unit:'light',form:2,structure:'',figure:{type:'mirror'},fingerprint:`finger-${now}`,kind:'numeric'};
 const v={id:`attempt-${subject}-${now}`,phase,unit:q.unit,form:q.form,seed:55,rev:3,updatedAt:now,revealed:false};
 const a={id:v.id,correct:false,helped:false,responses:[{answer:'42',working:'I added the time',at:now}],answeredAt:now};
 return {q,v,a,d:{attempts:[a]}};
};
for(const subject of ['maths','science'])test(`${subject}: first incorrect answer offers automatic coaching exactly once`,()=>{
 const {d,v,q,a}=fake(subject);
 assert.equal(P.autoGate(d,subject,v,q,a,today),'READY');
 const first=P.reserveAuto(d,subject,v,q,a,today);assert.ok(first);assert.equal(first.reasonCode,'AUTO_STARTED');
 assert.equal(P.autoGate(d,subject,v,q,a,today+10),'ALREADY_REQUESTED');
 assert.equal(P.reserveAuto(d,subject,v,q,a,today+10),null);
 const copy=P.validate(JSON.parse(JSON.stringify(d.tutorPilot)));
 assert.equal(P.autoGate({...d,tutorPilot:copy},subject,v,q,a,today+20),'ALREADY_REQUESTED');
});
test('never interrupt independent correct, recall, tests, writing, or already-helped answers',()=>{
 const {d,v,q,a}=fake();a.correct=true;assert.equal(P.autoGate(d,'maths',v,q,a,today),'NOT_FIRST_INCORRECT');a.correct=false;a.helped=true;assert.equal(P.autoGate(d,'maths',v,q,a,today),'NOT_FIRST_INCORRECT');a.helped=false;
 for(const phase of ['mixed','redo','paper','recall','mock'])assert.equal(P.autoGate(d,'maths',{...v,phase},q,a,today),'NOT_FIRST_INCORRECT');
 assert.equal(P.autoGate(d,'maths',v,{...q,kind:'written'},a,today),'NOT_FIRST_INCORRECT');
 assert.equal(P.autoGate(d,'maths',{...v,revealed:true},q,a,today),'NOT_FIRST_INCORRECT');
 assert.equal(P.autoGate(d,'maths',v,q,{...a,responses:[...a.responses,a.responses[0]]},today),'NOT_FIRST_INCORRECT');
 assert.equal(P.autoGate(d,'maths',v,{...q,unit:'percent'},a,today),'NOT_FIRST_INCORRECT');
});
test('three calls per subject per Chicago day, and next-day allowance resets',()=>{
 const d={attempts:[]};for(let i=0;i<P.AUTO_DAILY_LIMIT;i++){
  const {v,q,a}=fake('maths',today+i*40000);d.attempts.push(a);
  assert.equal(P.autoGate(d,'maths',v,q,a,today+i*40000),'READY');
  assert.ok(P.reserveAuto(d,'maths',v,q,a,today+i*40000));
 }
 const extra=fake('maths',today+P.AUTO_DAILY_LIMIT*40000);
 assert.equal(P.autoGate(d,'maths',extra.v,extra.q,extra.a,extra.a.answeredAt),'DAILY_LIMIT');
 const science=fake('science',extra.a.answeredAt);
 assert.equal(P.autoGate(d,'science',science.v,science.q,science.a,extra.a.answeredAt),'READY');
 const tomorrow=fake('maths',nextDay);
 assert.notEqual(P.day(today),P.day(nextDay));
 assert.equal(P.autoGate(d,'maths',tomorrow.v,tomorrow.q,tomorrow.a,nextDay),'READY');
});
test('parent pause is preserved through export/validation and newer settings win on merge',()=>{
 const d={attempts:[]},f=fake();
 P.setAuto(d,false,today);assert.equal(P.autoGate(d,'maths',f.v,f.q,f.a,today+1),'PAUSED_BY_PARENT');
 const fromDisk=P.validate(JSON.parse(JSON.stringify(d.tutorPilot)));assert.equal(fromDisk.autoEnabled,false);
 const newCopy=P.merge(fromDisk,{schema:1,autoEnabled:true,autoSettingAt:today+1000,events:[]});
 assert.equal(newCopy.autoEnabled,true);
 const olderCopy=P.merge(newCopy,fromDisk);assert.equal(olderCopy.autoEnabled,true);
 const freshPause=P.merge(newCopy,{schema:1,autoEnabled:false,autoSettingAt:today+2000,events:[]});assert.equal(freshPause.autoEnabled,false);
});
test('the auto note is separate, provisional and cannot change question scores',()=>{
 const {d,v,q,a}=fake();P.reserveAuto(d,'maths',v,q,a,today);
 const note=P.parseAI(JSON.stringify({reply:'You wrote “added the time”. Which quantities describe the same interval?',focus:'relationship',evidenceSource:'working',evidenceQuote:'added the time',nextAction:'clarify'}),{working:a.responses[0].working,message:''});
 const before=JSON.stringify(d.attempts),saved=P.aiNote(d,'maths',v,q,note,today+1,'automatic');
 assert.equal(saved.mode,'automatic');assert.equal(saved.provisional,true);
 assert.equal(JSON.stringify(d.attempts),before);assert.equal(P.events(d).filter(e=>e.kind==='ai-note').length,1);
 const merged=P.merge(d.tutorPilot,P.validate(d.tutorPilot));assert.equal(merged.events.filter(e=>e.kind==='ai-note').length,1);
 assert.throws(()=>P.parseAI(JSON.stringify({reply:'Guess 42',focus:'calculation',evidenceSource:'working',evidenceQuote:'I saw 42',nextAction:'clarify'}),{working:a.responses[0].working,message:''}),/AI_EVIDENCE_NOT_FOUND/);
});
