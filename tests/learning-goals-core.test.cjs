const test=require('node:test'),assert=require('node:assert/strict');
const G=require('../learning-goals-core.js');
const t=Date.parse('2026-10-20T20:00:00Z'),review={explanationReviewed:true,checkReviewed:true};
const copy=x=>JSON.parse(JSON.stringify(x));
const key=subject=>subject==='maths'?'entrance':'sciencePath';
function state(){return {entrance:{attempts:[],deferredDrafts:[],lessons:{}},sciencePath:{attempts:[],deferredDrafts:[],lessons:{}}};}
function draft(s,subject,id,now=t,unit='fractions'){return s[key(subject)].draft={id,unit,at:now,phase:'apply',helped:false,revealed:false,guess:false};}
function answer(s,subject,id,now=t+1000,options={}){
 const d=s[key(subject)],v=[d.draft,...d.deferredDrafts].find(x=>x?.id===id),old=d.attempts.find(a=>a.id===id),a={...v,mode:'practice',correct:options.correct!==false,firstCorrect:!old&&options.correct!==false,answeredAt:now,...old,...options};
 a.answeredAt=now;a.responses=[...(old?.responses||[]),{at:now,answer:options.answer||'4',working:'I used equal-sized parts.'}];a.correct=options.correct!==false;
 d.attempts=d.attempts.filter(x=>x.id!==id);d.attempts.push(a);return a;
}
function begin(s,subject='maths',now=t,category=subject){const v=s[key(subject)].draft;return G.beginGoal(s,{category,subject,unit:v.unit,title:'Explain this relationship and check it',draftId:v.id},now);}
function finish(s,id,now=t+2000,options={}){return G.recordFinish(s,id,{kind:'finished',explanation:'I split the total into equal parts.',check:'I multiplied to check the original total.',...options},now);}
function earn(s,subject='maths',now=t,category=subject,id=subject+'-'+now){draft(s,subject,id,now);const b=begin(s,subject,now,category);assert(b.ok,b.reason);answer(s,subject,id,now+1000);assert(finish(s,b.goal.id,now+2000).ok);assert(G.approveGoal(s,b.goal.id,review,now+3000).ok);return b.goal.id;}

test('Chicago calendar days and a four-week inclusive trial are independent of device zone and DST',()=>{
 assert.equal(G.dayKey(Date.parse('2026-11-22T05:59:59Z')),'2026-11-21');
 assert.equal(G.dayKey(Date.parse('2026-11-22T06:00:00Z')),'2026-11-22');
 const s=state();draft(s,'maths','q');assert(begin(s).ok);
 assert.deepEqual(G.status(s,t).trial,{startedAt:t,startDay:'2026-10-20',endDay:'2026-11-16',started:true,active:true,ended:false,remainingDays:28});
 assert.equal(G.status(s,Date.parse('2026-11-17T05:59:59Z')).trial.active,true);
 assert.equal(G.status(s,Date.parse('2026-11-17T06:00:00Z')).trial.ended,true);
 assert.equal(G.weekKey('2026-11-22'),'2026-11-16');
});

test('a task earns points only after a new answer, explanation, check and parent verification',()=>{
 const s=state();draft(s,'maths','q');const {goal}=begin(s);
 assert.equal(G.status(s,t).points,0);assert.equal(finish(s,goal.id).ok,false);
 assert.equal(G.approveGoal(s,goal.id,review,t+2000).ok,false);
 answer(s,'maths','q',t+1000,{helped:true});assert(finish(s,goal.id).ok);
 assert.equal(G.status(s,t+2000).points,0);assert.equal(G.approveGoal(s,goal.id,{},t+3000).ok,false);
 assert.deepEqual(G.approveGoal(s,goal.id,review,t+3000).points,2);
 assert.equal(G.approveGoal(s,goal.id,review,t+4000).points,0);
 const sum=G.summary(s,t+5000);assert.equal(sum.points,2);assert.equal(sum.totals.cents,40);assert.equal(sum.pending.length,0);
 assert.equal(s.learningGoals.awards[goal.id].goal.finish.evidence.helped,true);
});

test('an already correct question cannot become a retroactive cash claim, but a new correction can',()=>{
 const s=state();draft(s,'maths','correct',t-2000);answer(s,'maths','correct',t-1000);
 assert.equal(begin(s).ok,false);assert.equal(s.learningGoals.trial,null);
 draft(s,'maths','wrong',t-2000);answer(s,'maths','wrong',t-1000,{correct:false});const b=begin(s);assert(b.ok);
 assert.equal(finish(s,b.goal.id).ok,false);answer(s,'maths','wrong',t+1000,{helped:true});assert(finish(s,b.goal.id).ok);assert(G.approveGoal(s,b.goal.id,review,t+3000).ok);
 const next=t+86400000;assert.equal(begin(s,'maths',next).ok,false);
});

test('one agreed category per day cannot be replaced to farm another easier answer',()=>{
 const s=state();const id=earn(s);draft(s,'maths','different',t+4000);const r=begin(s,'maths',t+4000);
 assert(r.ok&&r.already);assert.equal(r.goal.id,id);assert.equal(r.goal.draftId,'maths-'+t);
 assert.equal(G.bindGoal(s,id,'different',t+5000).ok,false);assert.equal(G.summary(s,t+6000).totals.points,2);
});

test('a lesson or mixed task can be agreed before the first draft exists and binding survives stale merges',()=>{
 const s=state(),b=G.beginGoal(s,{category:'maths',subject:'maths',title:'The selected mixed review',taskKind:'mixed'},t);assert(b.ok);
 const unbound=copy(s.learningGoals);draft(s,'maths','mixed',t+1000,'ratio');assert(G.bindGoal(s,b.goal.id,'mixed',t+1000).ok);
 const bound=copy(s.learningGoals);assert.equal(G.merge(bound,unbound).goals[b.goal.id].draftId,'mixed');assert.deepEqual(G.merge(bound,unbound),G.merge(unbound,bound));
});

test('parking saves a concrete next step without awarding points and permits a later same-day finish',()=>{
 const s=state();draft(s,'maths','q');const {goal}=begin(s);
 assert.equal(G.recordFinish(s,goal.id,{kind:'parked',nextStep:'later'},t+1000).ok,false);
 assert(G.recordFinish(s,goal.id,{kind:'parked',nextStep:'Draw three equal bars before calculating.'},t+1000).ok);
 assert.equal(G.approveGoal(s,goal.id,review,t+2000).ok,false);
 answer(s,'maths','q',t+3000);assert(finish(s,goal.id,t+4000).ok);assert(G.approveGoal(s,goal.id,review,t+5000).ok);
});

test('prerequisite credit requires explicit selection, binding before its response, and saved original work',()=>{
 const s=state();draft(s,'maths','hard');const {goal}=begin(s);s.entrance.deferredDrafts.push(s.entrance.draft);draft(s,'maths','easy',t+1000,'parts');
 assert(G.choosePrerequisite(s,goal.id,{unit:'parts',title:'Equal parts',nextStep:'Return to the hard problem and label each part.'},t+1000).ok);
 const intent=copy(s.learningGoals);assert(G.bindPrerequisite(s,goal.id,'easy',{},t+1500).ok);
 assert.equal(G.merge(intent,s.learningGoals).goals[goal.id].prerequisite.draftId,'easy');
 answer(s,'maths','easy',t+2000,{helped:true});assert(finish(s,goal.id,t+3000,{kind:'prerequisite',prerequisiteId:'easy'}).ok);assert(G.approveGoal(s,goal.id,review,t+4000).ok);
 assert.equal(G.status(s,t+5000).points,2);assert.equal(s.entrance.deferredDrafts[0].id,'hard');
 const bad=state();draft(bad,'maths','hard');const b=begin(bad);bad.entrance.deferredDrafts.push(bad.entrance.draft);draft(bad,'maths','easy',t+1000,'parts');answer(bad,'maths','easy',t+2000);
 assert.equal(finish(bad,b.goal.id,t+3000,{kind:'prerequisite',prerequisiteId:'easy',nextStep:'Return to the hard problem later.'}).ok,false);
 assert.equal(G.bindPrerequisite(bad,b.goal.id,'easy',{nextStep:'Return to the hard problem later.'},t+3000).ok,false);
});

test('return-and-remember rewards an initially wrong unaided attempt followed by supported correction',()=>{
 const s=state();draft(s,'maths','old',t-86400000);answer(s,'maths','old',t-86400000+1000);
 draft(s,'maths','recall',t);s.entrance.draft.phase='recall';const b=begin(s,'maths',t,'recall');assert(b.ok,b.reason);
 const math=begin(s,'maths',t);assert(math.ok);
 answer(s,'maths','recall',t+1000,{correct:false});assert(G.observe(s,t+1001));
 answer(s,'maths','recall',t+2000,{correct:true,helped:true});assert(finish(s,b.goal.id,t+3000).ok);assert(G.approveGoal(s,b.goal.id,review,t+4000).ok);
 assert(finish(s,math.goal.id,t+3000).ok);assert(G.approveGoal(s,math.goal.id,review,t+4000).ok);
 earn(s,'science',t+5000);assert.equal(G.status(s,t+9000).points,5);assert.equal(G.status(s,t+9000).cents,100);
 assert.equal(s.learningGoals.awards[b.goal.id].goal.firstAttempt.unaided,true);assert.equal(s.learningGoals.awards[b.goal.id].goal.finish.evidence.helped,true);
});

test('recall never infers an unaided first attempt after help or from a same-day new idea',()=>{
 const s=state();draft(s,'maths','fresh');assert.equal(begin(s,'maths',t,'recall').ok,false);
 s.entrance.lessons.fractions={completedAt:t-86400000};s.entrance.draft.helped=true;assert.equal(begin(s,'maths',t,'recall').ok,false);
 s.entrance.draft.helped=false;const b=begin(s,'maths',t,'recall');assert(b.ok);answer(s,'maths','fresh',t+1000,{correct:false});answer(s,'maths','fresh',t+2000,{helped:true});
 assert.equal(finish(s,b.goal.id,t+3000).ok,false);assert.equal(s.learningGoals.goals[b.goal.id].firstAttempt.unaided,false);
});

test('the final pilot day can be approved later, and later goals continue without adding cash',()=>{
 const s=state();earn(s);const last=Date.parse('2026-11-16T20:00:00Z');draft(s,'maths','last',last);const b=begin(s,'maths',last);answer(s,'maths','last',last+1000);assert(finish(s,b.goal.id,last+2000).ok);
 const after=Date.parse('2026-11-18T20:00:00Z');assert.equal(G.approveGoal(s,b.goal.id,review,after).points,2);
 draft(s,'maths','later',after);const later=begin(s,'maths',after);assert(later.ok);answer(s,'maths','later',after+1000);assert(finish(s,later.goal.id,after+2000).ok);assert.equal(G.approveGoal(s,later.goal.id,review,after+3000).points,0);
 assert.equal(G.summary(s,after+4000).totals.points,4);assert.equal(G.status(s,after+4000).trial.ended,true);
});

test('a saved unanswered problem may become tomorrow’s goal but yesterday cannot receive a backdated finish',()=>{
 const s=state();draft(s,'maths','saved');const a=begin(s);const next=t+86400000;assert.equal(finish(s,a.goal.id,next).ok,false);
 const b=begin(s,'maths',next);assert(b.ok);answer(s,'maths','saved',next+1000);assert(finish(s,b.goal.id,next+2000).ok);assert(G.approveGoal(s,b.goal.id,review,next+3000).ok);
 assert.equal(G.summary(s,next+4000).totals.points,2);
});

test('written Science explanations require adult verification rather than trusting preliminary automatic marking',()=>{
 const s=state();draft(s,'science','writing');const b=begin(s,'science');answer(s,'science','writing',t+1000,{correct:false,components:{kind:'written'}});
 assert(finish(s,b.goal.id,t+2000,{oral:true,explanation:'',check:''}).ok);assert.equal(G.approveGoal(s,b.goal.id,review,t+3000).ok,false);
 assert.equal(G.approveGoal(s,b.goal.id,{...review,writtenAnswerReviewed:true},t+4000).points,2);
 const old=state();draft(old,'science','reviewed',t-2000);answer(old,'science','reviewed',t-1000,{correct:false,components:{kind:'written'}});old.sciencePath.reviews={reviewed:{verdict:'valid',at:t-500}};
 assert.equal(begin(old,'science').ok,false);
});

test('draft explanation text and prerequisite intent survive validation and newer-copy merges',()=>{
 const s=state();draft(s,'maths','q');const {goal}=begin(s);const old=copy(s.learningGoals);
 assert(G.saveFinishDraft(s,goal.id,{explanation:'I divided the whole into parts',check:'Estimate first',nextStep:'Draw the relationship',oral:false},t+1000).ok);
 const merged=G.merge(old,s.learningGoals);assert.equal(merged.goals[goal.id].finishDraft.explanation,'I divided the whole into parts');assert.deepEqual(merged,G.merge(s.learningGoals,old));
});

test('settlement records only unpaid confirmed awards and late approval reopens the exact remaining balance',()=>{
 const s=state();earn(s);const week=G.weeks(s,t+5000)[0].week;assert.equal(G.settle(s,week,t+5000).cents,40);assert.equal(G.settle(s,week,t+6000).ok,false);
 earn(s,'science',t+7000);let w=G.weeks(s,t+11000)[0];assert.equal(w.cents,80);assert.equal(w.paidCents,40);assert.equal(w.dueCents,40);
 assert.equal(G.settle(s,week,t+12000).cents,40);w=G.weeks(s,t+13000)[0];assert.equal(w.paidCents,80);assert.equal(w.dueCents,0);
 assert.equal(G.summary(s,t+100*86400000).totals.paidCents,80);
});

test('merges preserve earned and paid balances and deduplicate concurrent same-category awards',()=>{
 const a=state();draft(a,'maths','one');const b=begin(a);const pending=copy(a.learningGoals);answer(a,'maths','one',t+1000);assert(finish(a,b.goal.id).ok);assert(G.approveGoal(a,b.goal.id,review,t+3000).ok);assert(G.settle(a,G.weeks(a,t+4000)[0].week,t+4000).ok);
 const other=state();earn(other,'maths',t+1,'maths','another');
 const merged=G.merge(a.learningGoals,other.learningGoals);assert.deepEqual(merged,G.merge(other.learningGoals,a.learningGoals));
 assert.equal(G.summary({learningGoals:merged},t+6000).totals.points,2);assert.equal(G.summary({learningGoals:G.merge(merged,pending)},t+6000).totals.paidCents,40);
 assert.deepEqual(G.merge(merged,merged),merged);
});

test('validation derives fixed values and unsupported records fail closed without destroying them',()=>{
 const s=state();const id=earn(s);s.learningGoals.awards[id].points=999;s.learningGoals.awards[id].cents=99999;
 const clean=G.validate(s.learningGoals);assert.equal(clean.awards[id].points,2);assert.equal(clean.awards[id].cents,40);
 const before=JSON.stringify({version:2,data:'future version',awards:{earned:'preserve'}}),future={learningGoals:JSON.parse(before)};
 assert.throws(()=>G.init(future),/Unsupported learning goals/);assert.equal(JSON.stringify(future.learningGoals),before);assert.throws(()=>G.merge(clean,future.learningGoals),/Unsupported/);
 assert.deepEqual(G.validate(null),G.fresh());
});

test('cash approval checks that the saved finish still matches the recorded answer',()=>{
 const s=state();draft(s,'maths','q');const {goal}=begin(s);answer(s,'maths','q',t+1000);assert(finish(s,goal.id).ok);
 answer(s,'maths','q',t+3000,{answer:'another result'});assert.equal(G.approveGoal(s,goal.id,review,t+4000).ok,false);
 assert(finish(s,goal.id,t+5000).ok);assert.equal(G.approveGoal(s,goal.id,review,t+6000).points,2);
});

test('different offline trial starts retain already approved money, disclose the conflict, and use the earliest expiry for new awards',()=>{
 const a=state(),b=state();earn(a);const later=t+40*86400000;earn(b,'science',later);assert(G.settle(b,G.weeks(b,later+4000)[0].week,later+4000).ok);
 const combined={...b,learningGoals:G.merge(a.learningGoals,b.learningGoals)},report=G.summary(combined,later+5000);
 assert.equal(report.totals.points,4);assert.equal(report.trial.startDay,'2026-10-20');assert.equal(report.trial.ended,true);assert.equal(report.trialConflict,true);assert.equal(report.retainedOutsideTrial.length,1);
 assert.equal(report.retainedOutsideTrial[0].points,2);assert.equal(report.totals.paidCents,40);
 draft(combined,'maths','new-after-merge',later+5000);const g=begin(combined,'maths',later+5000);assert(g.ok);answer(combined,'maths','new-after-merge',later+6000);assert(finish(combined,g.goal.id,later+7000).ok);assert.equal(G.approveGoal(combined,g.goal.id,review,later+8000).points,0);
 assert.equal(G.summary(combined,later+9000).totals.points,4);
});
