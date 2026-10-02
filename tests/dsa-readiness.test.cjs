// The learning path for the 2027 DSA preparation: history stays stable, reviews space out,
// stuck units never block the path, practice mixes topics, mistakes come back, and mocks follow the test date.
const test=require('node:test'),assert=require('node:assert/strict');
const E=require('../entrance-core.js'),S=require('../science-path-core.js'),B=E.B,DAY=E.DAY,now=Date.UTC(2026,9,5,9);
const taught=(d,id,t=now,X=E)=>{for(let p=0;p<3;p++)X.visit(d,id,p,t);X.concept(d,id,X.unit(id).check[2],t+1);assert.equal(X.complete(d,id,t+2),true);};
const answer=(d,id,phase,t,wrong=false,seed)=>{E.finishPractice(d);const v=E.startPractice(d,id,{phase,seed,now:t}),q=E.question(v);E.touchDraft(d,{answer:wrong?'999999':q.answerLabel,working:'My plan: reason it through'},t+1);return E.respond(d,t+2).attempt;};
const secure=(d,id,t)=>{taught(d,id,t);answer(d,id,'apply',t+10);answer(d,id,'apply',t+20);return answer(d,id,'transfer',t+30);};

test('past answers are re-marked against the question version she actually saw',()=>{
 const q1=B.make('invariants',0,77,1);assert.equal(q1.answer,'No');
 // An attempt saved before revisions existed has no rev field: it must keep revision 1 and its mark.
 const d=E.validate({version:1,lessons:{},attempts:[{id:'old',unit:'invariants',form:0,seed:77,at:now,mode:'practice',phase:'guided',responses:[{at:now+1,answer:'No'}]}],seen:{},papers:{},reviews:{},external:[]});
 assert.equal(d.attempts[0].rev,1);assert.equal(d.attempts[0].correct,true);assert.equal(d.attempts[0].question,q1.text);
 const v=E.startPractice(E.fresh(),'invariants',{phase:'apply',now});assert.equal(v.rev,E.REV);
});
test('the original checks and papers stay at revision 1; DSA-style mocks use the newest questions',()=>{
 for(const X of [E,S]){for(const p of X.paperDefinitions){if(p.kind==='mock')assert.equal(p.rev,X===E?2:X.REV);else assert.equal(p.rev,1);}}
 const d=E.fresh();E.startPaper(d,'mixed-a',now);E.paperQuestions('mixed-a').forEach((q,i)=>E.savePaperAnswer(d,'mixed-a',i,{answer:q.answerLabel},now+i));E.submitPaper(d,'mixed-a',now+60000);
 assert.ok(d.attempts.every(a=>a.rev===1));assert.equal(E.validate(d).attempts.filter(a=>a.correct).length,24);
});
test('reviews come back after growing gaps: 7, then 14, then 30 days',()=>{
 const d=E.fresh(),x=secure(d,'percent',now);let e=E.evidence(d,'percent',now+DAY);assert.equal(e.gap,7);assert.equal(Math.round((e.due-x.answeredAt)/DAY),7);
 let t=x.answeredAt+7*DAY+10;answer(d,'percent','recall',t);e=E.evidence(d,'percent',t+100);assert.equal(e.delayed,1);assert.equal(e.gap,14);
 t=e.due+10;answer(d,'percent','recall',t);e=E.evidence(d,'percent',t+100);assert.equal(e.delayed,2);assert.equal(e.gap,30);
});
test('a unit missed four times at the same step is set aside for three days so the path moves on',()=>{
 const d=E.fresh();taught(d,'relationships');for(let i=0;i<4;i++)answer(d,'relationships','apply',now+100+i*100,true);
 // A lesson revisit clears the teaching prompt; the unit is then parked rather than looping.
 E.finishPractice(d);E.visit(d,'relationships',0,now+600);let e=E.evidence(d,'relationships',now+700);assert.equal(e.parked,true);
 const r=E.recommend({entrance:d},now+700);assert.notEqual(r.unit,'relationships');
 assert.equal(E.evidence(d,'relationships',now+600+3*DAY+1000).parked,false);
});
test('independent answers on a starting check or paper count, so a known method is not re-taught',()=>{
 const d=E.fresh();E.startPaper(d,'baseline-a',now);E.paperQuestions('baseline-a').forEach((q,i)=>E.savePaperAnswer(d,'baseline-a',i,{answer:q.answerLabel},now+i));E.submitPaper(d,'baseline-a',now+1000);
 assert.equal(E.evidence(d,'percent',now+2000).apply,1);
 const m=E.fresh();E.startPaper(m,'mock-1',now);E.paperQuestions('mock-1').forEach((q,i)=>E.savePaperAnswer(m,'mock-1',i,{answer:q.answerLabel},now+i));E.submitPaper(m,'mock-1',now+60000);
 const unit=E.paperQuestions('mock-1')[0].unit,e=E.evidence(m,unit,now+70000);assert.equal(e.taught,true);assert.equal(e.transfer,1);
});
test('mixed sets show no topic, put due reviews first, and count as reviews',()=>{
 const d=E.fresh();let t=now;for(const id of ['percent','ratios','area'])t=secure(d,id,t+1000).answeredAt;
 E.finishPractice(d);const due=t+8*DAY,r=E.recommend({entrance:d},due);assert.equal(r.kind,'mixed-set');
 const m=E.startMixed(d,due);assert.equal(m.items.length,3);assert.ok(m.items.every(x=>x.recall));
 for(let i=0;i<m.items.length;i++){const v=E.startMixedItem(d,due+i*100);assert.equal(v.phase,'mixed');const q=E.question(v);E.touchDraft(d,{answer:q.answerLabel,working:'Which method? Ratio of parts.'},due+i*100+1);assert.equal(E.respond(d,due+i*100+2).ok,true);E.finishPractice(d);}
 assert.ok(d.mixed.completedAt);assert.equal(E.mixedNext(d),null);
 for(const id of ['percent','ratios','area'])assert.equal(E.evidence(d,id,due+DAY).delayed,1,id);
 assert.notEqual(E.recommend({entrance:d},due+1000).kind,'mixed-set','one mixed set a day');
});
test('maths asks for a one-line plan before checking a new-twist or mixed question; it is not a mistake',()=>{
 const d=E.fresh();taught(d,'percent');answer(d,'percent','apply',now+10);answer(d,'percent','apply',now+20);E.finishPractice(d);
 const v=E.startPractice(d,'percent',{phase:'transfer',now:now+30});E.touchDraft(d,{answer:E.question(v).answerLabel,working:''},now+31);
 const r=E.respond(d,now+32);assert.equal(r.ok,false);assert.equal(r.method,true);assert.equal(d.attempts.length,2);
 E.touchDraft(d,{working:'Find the whole first'},now+33);assert.equal(E.respond(d,now+34).ok,true);
});
test('mistakes are logged, can be tagged, and come back three days later until answered first time',()=>{
 const d=E.fresh();taught(d,'area');const a=answer(d,'area','apply',now+10,true);E.finishPractice(d);
 const log=E.errorLog(d,now+100);assert.equal(log.length,1);assert.equal(log[0].id,a.id);
 assert.equal(E.tagError(d,a.id,'calculation',now+200),true);assert.equal(E.tagError(d,a.id,'nonsense'),false);assert.equal(E.errorLog(d,now+300)[0].tag,'calculation');
 assert.equal(E.dueRedo(d,now+DAY),null);const due=E.dueRedo(d,now+3*DAY+100);assert.equal(due.id,a.id);
 const v=E.startRedo(d,a.id,now+3*DAY+200);assert.equal(v.seed,a.seed);assert.equal(v.form,a.form);E.touchDraft(d,{answer:E.question(v).answerLabel},now+3*DAY+201);E.respond(d,now+3*DAY+202);
 assert.ok(E.errorLog(d,now+4*DAY)[0].redoneAt);assert.equal(E.dueRedo(d,now+10*DAY),null);
 assert.equal(E.evidence(d,'area',now+4*DAY).apply,0,'a redo is not new evidence');
});
test('maths mocks: six papers of 24 questions and 55 marks, rising difficulty, no repeats',()=>{
 const mocks=E.paperDefinitions.filter(p=>p.kind==='mock');assert.equal(mocks.length,6);const seen=new Set();
 for(const p of E.paperDefinitions)for(const q of E.paperQuestions(p.id)){assert.ok(!seen.has(q.fingerprint),p.id+' '+q.id);seen.add(q.fingerprint);}
 for(const p of mocks){assert.equal(p.minutes,90);assert.equal(p.marks.reduce((a,b)=>a+b,0),55);assert.deepEqual([...p.marks].sort((a,b)=>a-b),p.marks);
  const qs=E.paperQuestions(p.id);assert.equal(qs.length,24);assert.ok(qs.slice(-9).every(q=>E.unit(q.unit).extension),'hardest questions come from the challenge units');}
 const d=E.fresh();E.startPaper(d,'mock-2',now);const qs=E.paperQuestions('mock-2');qs.forEach((q,i)=>{if(i>=20)E.savePaperAnswer(d,'mock-2',i,{answer:q.answerLabel},now+i);});const sc=E.submitPaper(d,'mock-2',now+30*60000);
 assert.equal(sc.marks,16);assert.equal(sc.markTotal,55);assert.equal(sc.timed,true);
});
test('science mocks cover every unit, including the new lower-secondary ones',()=>{
 const mocks=S.paperDefinitions.filter(p=>p.kind==='mock');assert.equal(mocks.length,4);
 for(const p of mocks){const units=new Set(S.paperQuestions(p.id).map(q=>q.unit));assert.ok(['sx-machines','sx-pressure','sx-waves','sx-chem','sx-cells','sx-life'].every(u=>units.has(u)));}
});
test('mocks are scheduled back from the test date, and the date can be changed',()=>{
 const d=E.fresh();let sch=E.mockSchedule(d,now);assert.equal(E.testDate(d),'2027-07-03');assert.equal(sch[0].date,'2027-01-09');assert.equal(sch.at(-1).date,'2027-06-05');assert.ok(sch.every(m=>m.status==='upcoming'));
 assert.equal(E.dueMock(d,Date.UTC(2027,0,2)),null);assert.equal(E.dueMock(d,Date.UTC(2027,0,10)).id,'mock-1');
 assert.equal(E.setTestDate(d,'2027-07-10',now+1),true);assert.equal(E.setTestDate(d,'next July'),false);assert.equal(E.mockSchedule(d,now)[0].date,'2027-01-16');
});
test('the plan reports weeks left, methods remaining and the pace needed',()=>{
 const d=E.fresh();secure(d,'percent',now);const p=E.plan(d,now+DAY);
 assert.equal(p.total,E.D.units.length);assert.equal(p.secure,1);assert.equal(p.remaining,E.D.units.length-1);assert.ok(p.weeksLeft>=38&&p.weeksLeft<=40);assert.ok(p.perWeek>1);assert.equal(p.status,'starting');
});
test('new records survive backup and merge between two tablets',()=>{
 const a=E.fresh();let t=now;for(const id of ['percent','ratios','area'])t=secure(a,id,t+1000).answeredAt;E.startMixed(a,t+8*DAY);E.setTestDate(a,'2027-07-10',t);
 const miss=answer(a,'circles','apply',t+100,true);E.tagError(a,miss.id,'method',t+200);E.answerFact(a,'wm21',0,true,t+300);E.finishInvestigation(a,'im02','We found 45 handshakes',t+400);
 const b=E.validate(JSON.parse(JSON.stringify(a)));assert.deepEqual(b.mixed,a.mixed);assert.equal(b.errors[miss.id].tag,'method');assert.equal(b.testDate,'2027-07-10');assert.equal(b.wide.facts.wm21.correct,true);assert.equal(b.wide.investigations.im02.note,'We found 45 handshakes');
 const other=E.fresh();E.answerFact(other,'ws03',2,false,t+500);const m=E.merge(a,other);assert.ok(m.wide.facts.wm21&&m.wide.facts.ws03);assert.equal(m.testDate,'2027-07-10');assert.equal(m.errors[miss.id].tag,'method');
});
test('questions never run out: a used-up pool reuses the oldest question and still counts',()=>{
 const d=E.fresh();taught(d,'digits');const seen=new Set();for(let i=0;i<12;i++){const a=answer(d,'digits','apply',now+i*1000);seen.add(a.fingerprint);}
 assert.ok(seen.size<12,'pool is small');assert.ok(E.evidence(d,'digits',now+DAY).apply>=2);
});
test('a learner with 30% first-try misses at four questions a day still reaches every unit',()=>{
 const real=Math.random;try{for(const ms0 of [6,7,8,11]){let ms=ms0;Math.random=()=>((ms=(ms*48271)%2147483647)/2147483647);
 let rs=11;const rnd=()=>((rs=(rs*16807)%2147483647)/2147483647);const s={entrance:E.fresh()},d=s.entrance;let t=now;
 for(let day=0;day<220;day++){for(let st=0;st<4;st++){const r=E.recommend(s,t);t+=60000;
  if(r.kind==='learn'){for(let p=0;p<3;p++)E.visit(d,r.unit,p,t);E.concept(d,r.unit,E.unit(r.unit).check[2],t);E.complete(d,r.unit,t);continue;}
  let v;if(r.kind==='mixed-set')v=E.startMixedItem(d,t);else if(r.kind==='redo')v=E.startRedo(d,r.attempt,t);else if(r.kind==='resume')v=d.draft;else if(r.unit){E.finishPractice(d);v=E.startPractice(d,r.unit,{now:t,phase:r.kind==='recall'?'recall':undefined});}
  if(!v)break;const q=E.question(v),wrong=rnd()<.3;E.touchDraft(d,{answer:wrong?'999999':q.answerLabel,working:'my plan here'},t);const res=E.respond(d,t+1);
  if(!res.attempt?.correct){E.touchDraft(d,{answer:rnd()<.3?'999998':q.answerLabel},t+2);E.respond(d,t+3);}E.finishPractice(d);}
  t+=DAY-4*60000;}
 const rows=E.D.units.map(u=>E.evidence(d,u.id,t));assert.equal(rows.filter(e=>e.taught).length,rows.length,'units reached, random seed '+ms0);assert.ok(rows.filter(e=>e.transfer).length>=rows.length-2);
 }}finally{Math.random=real;}
});
