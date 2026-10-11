const test=require('node:test'),assert=require('node:assert/strict');
const P=require('../planner-core.js'),T=require('../today-core.js'),M=require('../entrance-core.js'),S=require('../science-path-core.js'),Q=require('../quest-core.js');
const now=new Date(2026,8,25,12).getTime();
function fresh(){return {planner:P.fresh(),entrance:M.fresh(),sciencePath:S.fresh(),coins:40};}
function finishLesson(d,E,id){for(let p=0;p<3;p++)E.visit(d,id,p,now-5000);E.concept(d,id,E.unit(id).check[2],now-4000);E.complete(d,id,now-3000);}
function finishDay(s){for(const subject of ['maths','science']){const min=P.minutes(s.planner,subject,now);s.planner.sessions.push({id:'done-'+subject,subject,day:P.localDay(now),start:now-(subject==='maths'?4000000:2000000),end:now-(subject==='maths'?4000000:2000000)+min*60000});}}
function attempt(s,subject,id,at,patch={}){const list=subject==='maths'?s.entrance.attempts:s.sciencePath.attempts;list.push({id,answeredAt:at,at,unit:subject==='maths'?'relationships':'matter',form:1,phase:'apply',correct:true,firstCorrect:true,independent:true,seenBefore:false,responses:[{answer:'x',at}],...patch});}

test('bonus quests stay locked until planned maths and science time is complete',()=>{
 const s=fresh();finishLesson(s.entrance,M,'relationships');finishLesson(s.sciencePath,S,'matter');
 assert.equal(T.model(s,now).finished,false);assert.equal(Q.status(s,now).unlocked,false);assert.equal(Q.bonusTask(s,now),null);
 finishDay(s);assert.equal(T.model(s,now).finished,true);assert.equal(Q.status(s,now).unlocked,true);assert.equal(Q.bonusTask(s,now).subject,'maths');
});

test('optional Maths unlocks after Maths alone and chooses fresh learned practice without new rewards',()=>{
 const s=fresh();finishLesson(s.entrance,M,'relationships');assert.equal(Q.mathsExtensionTask(s,now),null);
 const min=P.minutes(s.planner,'maths',now);s.planner.sessions.push({id:'maths-done',subject:'maths',day:P.localDay(now),start:now-4000000,end:now-4000000+min*60000});
 const before=JSON.stringify(s),task=Q.mathsExtensionTask(s,now);
 assert.equal(task.subject,'maths');assert.equal(task.unit,'relationships');assert.equal(task.phase,'apply');
 assert.equal(T.model(s,now).completed,1);assert.equal(T.model(s,now).next.subject,'science');
 assert.equal(JSON.stringify(s),before,'offering optional practice changes no record, mastery or reward');
 assert.equal(s.questRewards,undefined);
 M.startPractice(s.entrance,'relationships',{now:now+1,seed:17});M.touchDraft(s.entrance,{answer:'saved working'},now+2);
 const resumed=Q.mathsExtensionTask(s,now+3);assert.equal(resumed.kind,'question');assert.equal(resumed.resume,true);assert.equal(s.entrance.draft.answer,'saved working');
});

test('optional Maths preserves delayed retrieval and never opens a reserved paper',()=>{
 const s=fresh(),old=now-8*86400000;finishDay(s);
 for(let p=0;p<3;p++)M.visit(s.entrance,'relationships',p,old);M.concept(s.entrance,'relationships',M.unit('relationships').check[2],old);M.complete(s.entrance,'relationships',old);
 for(const [i,phase] of ['apply','apply','transfer'].entries()){
  M.startPractice(s.entrance,'relationships',{now:old+1000+i*1000,phase,seed:31+i});M.touchDraft(s.entrance,{answer:M.question(s.entrance.draft).answerLabel,working:'My plan for this one'},old+1001+i*1000);M.respond(s.entrance,old+1002+i*1000);M.finishPractice(s.entrance);
 }
 const task=Q.mathsExtensionTask(s,now);assert.equal(task.kind,'recall');assert.equal(task.unit,'relationships');assert.equal(Object.keys(s.entrance.papers).length,0);
 M.startPaper(s.entrance,'mixed-a',now);assert.equal(Q.mathsExtensionTask(s,now+1),null);
});

test('fresh first-try independent answers earn one coin and bonus questions balance subjects',()=>{
 const s=fresh();finishLesson(s.entrance,M,'relationships');finishLesson(s.sciencePath,S,'matter');finishDay(s);
 let task=Q.bonusTask(s,now);assert.equal(task.subject,'maths');assert.equal(Q.start(s,'maths',now+10),true);
 attempt(s,'maths','m1',now+20);let r=Q.settle(s,now+30);assert.deepEqual({coins:r.coins,success:r.success,chest:r.chest},{coins:1,success:true,chest:false});
 assert.equal(Q.status(s,now+40).success.length,1);assert.equal(Q.bonusTask(s,now+40).subject,'science');
 assert.equal(s.coins,40,'reward core never changes the wallet itself');
});

test('help, repeats and wrong-first answers never earn bonus coins',()=>{
 for(const patch of [{helped:true,independent:false},{seenBefore:true},{firstCorrect:false,independent:false},{phase:'guided'},{correct:false,independent:false}]){
  const s=fresh();finishLesson(s.entrance,M,'relationships');finishLesson(s.sciencePath,S,'matter');finishDay(s);assert.ok(Q.start(s,'maths',now+10));
  attempt(s,'maths','bad',now+20,patch);const r=Q.settle(s,now+30);assert.equal(r.settled,true);assert.equal(r.coins,0);assert.equal(r.success,false);assert.equal(Q.status(s,now+30).success.length,0);
 }
});

test('three qualifying extra answers complete a capped five-coin daily chest',()=>{
 const s=fresh();finishLesson(s.entrance,M,'relationships');finishLesson(s.sciencePath,S,'matter');finishDay(s);let total=0;
 for(let i=0;i<3;i++){
  const task=Q.bonusTask(s,now+100*i),start=now+100*i+10;assert.ok(task);assert.ok(Q.start(s,task.subject,start));
  attempt(s,task.subject,'q'+i,start+10);const r=Q.settle(s,start+20);total+=r.coins;
  if(i<2)assert.equal(r.chest,false);else{assert.equal(r.chest,true);assert.equal(r.coins,3);}
 }
 const status=Q.status(s,now+1000);assert.equal(total,5);assert.equal(status.complete,true);assert.equal(status.earned,5);assert.equal(Q.bonusTask(s,now+1000),null);
});

test('an answered bonus settles once, survives validation and merges deterministically',()=>{
 const a=fresh(),b=fresh();for(const s of [a,b]){finishLesson(s.entrance,M,'relationships');finishLesson(s.sciencePath,S,'matter');finishDay(s);}
 Q.start(a,'maths',now+10);attempt(a,'maths','m1',now+20);Q.settle(a,now+30);
 Q.start(b,'maths',now+11);attempt(b,'maths','m2',now+21);Q.settle(b,now+31);
 const merged=Q.merge(a.questRewards,b.questRewards),state={...fresh(),questRewards:merged};assert.equal(Q.status(state,now+40).success.length,2);
 assert.deepEqual(Q.merge(merged,merged),Q.validate(merged));
});

test('older or malformed reward state cannot unlock unlimited coins',()=>{
 const bad={version:1,days:{'2026-09-25':{success:Array.from({length:20},(_,i)=>({id:'x'+i,subject:i%2?'science':'maths'})),attempts:[],chest:true,active:{subject:'spelling',startedAt:now}}}};
 const clean=Q.validate(bad);assert.equal(clean.days['2026-09-25'].success.length,3);assert.equal(clean.days['2026-09-25'].active,null);assert.equal(Q.MAX,3);assert.equal(Q.CHEST,2);
});


test('bonus quest prefers transfer or delayed retrieval and pays two coins for stronger evidence',()=>{
 const s=fresh();finishLesson(s.entrance,M,'relationships');finishLesson(s.sciencePath,S,'matter');finishDay(s);
 // Build two independent applications so the next Maths bonus is a transfer question.
 for(const seed of [11,22]){M.finishPractice(s.entrance);M.startPractice(s.entrance,'relationships',{phase:'apply',seed,now:now-1000+seed});const q=M.question(s.entrance.draft);M.touchDraft(s.entrance,{answer:q.answerLabel},now-900+seed);M.respond(s.entrance,now-800+seed);}
 M.finishPractice(s.entrance);
 const task=Q.bonusTask(s,now,'maths');assert.equal(task.subject,'maths');assert.equal(task.phase,'transfer');assert.equal(task.coins,2);
 assert.ok(Q.start(s,'maths',now+10));attempt(s,'maths','transfer-bonus',now+20,{phase:'transfer'});const r=Q.settle(s,now+30);
 assert.equal(r.success,true);assert.equal(r.coins,2);assert.equal(r.phase,'transfer');assert.equal(Q.status(s,now+40).earned,2);
});

test('bonus options offer a small post-plan choice without opening a question or changing mastery',()=>{
 const s=fresh();finishLesson(s.entrance,M,'relationships');finishLesson(s.sciencePath,S,'matter');finishDay(s);
 const before=JSON.stringify({entrance:s.entrance,sciencePath:s.sciencePath,coins:s.coins});
 const options=Q.bonusOptions(s,now);assert.deepEqual(options.map(x=>x.subject).sort(),['maths','science']);
 assert.equal(JSON.stringify({entrance:s.entrance,sciencePath:s.sciencePath,coins:s.coins}),before);
});


test('bonus choices stay hidden while an ordinary saved question still needs finishing',()=>{
 const s=fresh();finishLesson(s.entrance,M,'relationships');finishLesson(s.sciencePath,S,'matter');finishDay(s);
 M.startPractice(s.entrance,'relationships',{phase:'apply',seed:77,now:now-50});
 M.touchDraft(s.entrance,{answer:'not-finished'},now-40);
 assert.equal(Q.bonusTask(s,now),null);assert.deepEqual(Q.bonusOptions(s,now),[]);
});
