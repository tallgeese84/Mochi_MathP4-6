/* Agreed learning finishes and a small, separate parent-verified cash trial.
   This module never changes mastery, cats, coins, timers or actual money. */
(function(root){
'use strict';
const TIME_ZONE='America/Chicago',CENTS_PER_POINT=20,TRIAL_DAYS=28,MAX_POINTS=5,POINTS={maths:2,science:2,recall:1},KEYS={maths:'entrance',science:'sciencePath'};
const fmt=new Intl.DateTimeFormat('en-CA',{timeZone:TIME_ZONE,year:'numeric',month:'2-digit',day:'2-digit'});
const copy=x=>x==null?null:JSON.parse(JSON.stringify(x)),text=(v,n=1500)=>typeof v==='string'?v.trim().slice(0,n):'',stamp=n=>Number.isFinite(n)&&n>0&&n<8640000000000000?n:0;
const validDay=v=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&Number.isFinite(Date.parse(v+'T12:00:00Z'))&&new Date(v+'T12:00:00Z').toISOString().slice(0,10)===v;
const safeId=v=>typeof v==='string'&&v.length>0&&v.length<=160&&!['__proto__','prototype','constructor'].includes(v);
const dayKey=(now=Date.now())=>{const p=Object.fromEntries(fmt.formatToParts(new Date(now)).map(p=>[p.type,p.value]));return `${p.year}-${p.month}-${p.day}`;};
const addDays=(day,n)=>new Date(Date.parse(day+'T12:00:00Z')+n*86400000).toISOString().slice(0,10);
const weekKey=day=>{const d=new Date(day+'T12:00:00Z');return addDays(day,-((d.getUTCDay()+6)%7));};
const fresh=()=>({version:1,trial:null,goals:{},awards:{},settlements:{}});
const fail=reason=>({ok:false,reason});
function cleanTrial(raw){const startedAt=stamp(raw?.startedAt);if(!startedAt)return null;const startDay=dayKey(startedAt);return {startedAt,startDay,endDay:addDays(startDay,TRIAL_DAYS-1)};}
function cleanFirst(raw,boundAt){if(!stamp(raw?.at)||raw.at<boundAt||!stamp(raw.capturedAt)||raw.capturedAt<raw.at||!Number.isInteger(raw.responseIndex)||raw.responseIndex<0||raw.responseIndex>11)return null;return {at:raw.at,capturedAt:raw.capturedAt,responseIndex:raw.responseIndex,unaided:raw.unaided===true,answer:text(raw.answer,4000)};}
function cleanEvidence(raw){if(!safeId(raw?.id)||!text(raw.unit,80)||!stamp(raw.at)||!stamp(raw.answeredAt)||raw.answeredAt<raw.at||!Number.isInteger(raw.responseCount)||raw.responseCount<1||raw.responseCount>12||!stamp(raw.firstResponseAt)||raw.firstResponseAt<raw.at||raw.firstResponseAt>raw.answeredAt)return null;return {id:raw.id,unit:text(raw.unit,80),at:raw.at,answeredAt:raw.answeredAt,firstResponseAt:raw.firstResponseAt,responseCount:raw.responseCount,correct:raw.correct===true,helped:raw.helped===true,revealed:raw.revealed===true,seenBefore:raw.seenBefore===true,written:raw.written===true,phase:text(raw.phase,20)};}
function cleanPrerequisite(raw,g){
 if(!text(raw?.unit,80)||!stamp(raw.selectedAt||raw.boundAt)||Number(raw.selectedAt||raw.boundAt)<g.startedAt||dayKey(raw.selectedAt||raw.boundAt)!==g.day||text(raw.nextStep).length<8)return null;
 const p={draftId:'',unit:text(raw.unit,80),title:text(raw.title,240),selectedAt:raw.selectedAt||raw.boundAt,boundAt:0,responseFloor:0,nextStep:text(raw.nextStep)};
 if(safeId(raw.draftId)&&raw.draftId!==g.draftId&&stamp(raw.boundAt)>=p.selectedAt&&dayKey(raw.boundAt)===g.day&&Number.isInteger(raw.responseFloor)&&raw.responseFloor>=0&&raw.responseFloor<12)Object.assign(p,{draftId:raw.draftId,boundAt:raw.boundAt,responseFloor:raw.responseFloor});
 return p;
}
function cleanFinishDraft(raw,g){return raw&&stamp(raw.updatedAt)>=g.startedAt&&dayKey(raw.updatedAt)===g.day?{kind:['finished','prerequisite','parked'].includes(raw.kind)?raw.kind:'finished',explanation:text(raw.explanation),check:text(raw.check),nextStep:text(raw.nextStep),oral:raw.oral===true,updatedAt:raw.updatedAt}:null;}
function cleanFinish(raw,g){
 if(!raw||!['finished','prerequisite','parked'].includes(raw.kind)||!stamp(raw.at)||raw.at<g.startedAt||dayKey(raw.at)!==g.day)return null;
 const out={kind:raw.kind,at:raw.at,explanation:text(raw.explanation),check:text(raw.check),nextStep:text(raw.nextStep),oral:raw.oral===true,evidence:null};
 if(out.kind==='parked')return out.nextStep.length>=8?out:null;
 out.evidence=cleanEvidence(raw.evidence);
 if(!out.evidence||(!out.oral&&(out.explanation.length<8||out.check.length<5))||out.evidence.answeredAt<g.boundAt||out.evidence.answeredAt>out.at)return null;
 if(out.kind==='finished'&&out.evidence.id!==g.draftId)return null;
 if(out.kind==='prerequisite'&&(!g.prerequisite||out.evidence.id!==g.prerequisite.draftId||out.evidence.answeredAt<g.prerequisite.boundAt||out.evidence.responseCount<=g.prerequisite.responseFloor||out.nextStep.length<8))return null;
 if(!out.evidence.correct&&!out.evidence.written)return null;
 return out;
}
function cleanGoal(raw){
 if(!raw||!Object.hasOwn(POINTS,raw.category)||!Object.hasOwn(KEYS,raw.subject)||raw.category!=='recall'&&raw.category!==raw.subject||!stamp(raw.startedAt))return null;
 const day=dayKey(raw.startedAt),id=day+':'+raw.category;if(raw.id!==id||raw.day!==day)return null;
 const g={id,day,category:raw.category,subject:raw.subject,unit:text(raw.unit,80),title:text(raw.title,240),taskKind:text(raw.taskKind,30),startedAt:raw.startedAt,draftId:safeId(raw.draftId)?raw.draftId:'',boundAt:stamp(raw.boundAt),responseFloor:Number.isInteger(raw.responseFloor)&&raw.responseFloor>=0&&raw.responseFloor<12?raw.responseFloor:0,firstAttempt:null,prerequisite:null,finishDraft:null,finish:null,review:null};
 if(!g.draftId||!g.boundAt||g.boundAt<g.startedAt){g.draftId='';g.boundAt=0;g.responseFloor=0;}
 if(g.draftId)g.firstAttempt=cleanFirst(raw.firstAttempt,g.boundAt);
 if(g.draftId)g.prerequisite=cleanPrerequisite(raw.prerequisite,g);
 g.finishDraft=cleanFinishDraft(raw.finishDraft,g);
 g.finish=cleanFinish(raw.finish,g);
 if(g.finish&&g.finish.kind!=='parked'&&stamp(raw.review?.at)>=g.finish.at&&raw.review?.explanationReviewed===true&&raw.review?.checkReviewed===true)g.review={at:raw.review.at,explanationReviewed:true,checkReviewed:true,writtenAnswerReviewed:raw.review.writtenAnswerReviewed===true};
 return g;
}
function cleanAward(raw,key){
 const g=cleanGoal(raw?.goal),trial=cleanTrial(raw?.trial);if(!g||key!==g.id||!trial||g.day<trial.startDay||g.day>trial.endDay||!g.finish||g.finish.kind==='parked'||!g.review||g.finish.evidence.written&&!g.review.writtenAnswerReviewed||g.category==='recall'&&!g.firstAttempt?.unaided)return null;
 return {id:g.id,day:g.day,category:g.category,subject:g.subject,points:POINTS[g.category],cents:POINTS[g.category]*CENTS_PER_POINT,approvedAt:g.review.at,goal:g,trial};
}
function validate(raw){
 const out=fresh();if(raw==null)return out;if(raw.version!==1)throw Error('Unsupported learning goals version. The saved reward record has been kept.');
 out.trial=cleanTrial(raw.trial);
 for(const [key,v] of Object.entries(raw.goals||{})){const g=cleanGoal(v);if(g&&key===g.id)out.goals[key]=g;}
 for(const [key,v] of Object.entries(raw.awards||{})){const a=cleanAward(v,key);if(a)out.awards[key]=a;}
 // Trial records embedded in paid/earned awards survive partial imports too.
 for(const a of Object.values(out.awards))if(!out.trial||a.trial.startedAt<out.trial.startedAt)out.trial=copy(a.trial);
 for(const [key,v] of Object.entries(raw.settlements||{})){
  if(!validDay(key)||weekKey(key)!==key||!stamp(v?.at))continue;
  const awardIds=[...new Set((Array.isArray(v.awardIds)?v.awardIds:[]).filter(id=>safeId(id)&&out.awards[id]&&weekKey(out.awards[id].day)===key&&out.awards[id].approvedAt<=v.at))].sort();
  if(awardIds.length)out.settlements[key]={week:key,awardIds,at:v.at};
 }
 return out;
}
function init(state){const d=validate(state.learningGoals);state.learningGoals=d;return d;}
function path(state,subject){return state[KEYS[subject]]||{attempts:[],deferredDrafts:[]};}
function findDraft(state,subject,id){const d=path(state,subject);return [d.draft,...(d.deferredDrafts||[])].find(x=>x?.id===id)||null;}
function findAttempt(state,subject,id){return (path(state,subject).attempts||[]).find(x=>x?.id===id)||null;}
function usableAttempt(a){return !!(a&&a.mode!=='paper'&&a.mode!=='mock'&&a.mode!=='baseline'&&a.mode!=='hcis'&&!a.paperId&&!a.skipped&&!a.conflicted&&Array.isArray(a.responses)&&a.responses.length&&stamp(a.answeredAt||a.responses.at(-1)?.at));}
function written(a){return a?.components?.kind==='written';}
function successful(a){return usableAttempt(a)&&(a.correct===true||written(a));}
function priorIdea(state,subject,draft,now){const d=path(state,subject),today=dayKey(now);return (d.attempts||[]).some(a=>a.id!==draft.id&&a.unit===draft.unit&&usableAttempt(a)&&dayKey(a.answeredAt||a.at)<today)||stamp(d.lessons?.[draft.unit]?.completedAt)&&dayKey(d.lessons[draft.unit].completedAt)<today;}
function bindCheck(state,g,draftId,now){
 const draft=findDraft(state,g.subject,draftId);if(!draft)return fail('Open the agreed practice question first.');
 if(g.unit&&draft.unit!==g.unit)return fail('This question belongs to a different agreed topic.');
 const a=findAttempt(state,g.subject,draftId),review=path(state,g.subject).reviews?.[draftId],reviewedWriting=written(a)&&review?.verdict==='valid'&&stamp(review.at)>=Number(a?.answeredAt||0);
 if(a?.correct&&!written(a)||reviewedWriting)return fail('This question was already finished. Agree the next task before answering it.');
 if(a?.responses?.length>=12)return fail('Save this question and choose a suitable prerequisite.');
 if(g.category==='recall'&&(a?.responses?.length||draft.helped||draft.revealed||draft.guess||draft.phase==='guided'||['example','steps'].includes(draft.scaffold)))return fail('Return-and-remember starts with a first attempt before opening help.');
 if(g.category==='recall'&&!priorIdea(state,g.subject,draft,now))return fail('Choose an idea from an earlier day for return-and-remember.');
 return {ok:true,draft,attempt:a};
}
function beginGoal(state,options={},now=Date.now()){
 if(!stamp(now)||!Object.hasOwn(POINTS,options.category)||!Object.hasOwn(KEYS,options.subject)||options.category!=='recall'&&options.category!==options.subject)return fail('Choose a Maths, Science or return-and-remember goal.');
 const d=init(state),day=dayKey(now),id=day+':'+options.category;if(d.goals[id])return {ok:true,goal:d.goals[id],already:true};
 const g={id,day,category:options.category,subject:options.subject,unit:text(options.unit,80),title:text(options.title,240)||'Finish, explain and check this learning task',taskKind:text(options.taskKind,30)||'practice',startedAt:now,draftId:'',boundAt:0,responseFloor:0,firstAttempt:null,prerequisite:null,finishDraft:null,finish:null,review:null};
 let bound;if(options.draftId){bound=bindCheck(state,g,options.draftId,now);if(!bound.ok)return bound;}
 if(d.trial&&now<d.trial.startedAt)return fail('The device date is earlier than this trial. Check its date before agreeing a goal.');
 d.trial??=cleanTrial({startedAt:now});d.goals[id]=g;
 if(bound){g.unit=bound.draft.unit;g.draftId=bound.draft.id;g.boundAt=now;g.responseFloor=bound.attempt?.responses?.length||0;}
 return {ok:true,goal:g};
}
function bindGoal(state,id,draftId,now=Date.now()){
 const d=init(state),g=d.goals[id];if(!g)return fail('Agree a learning goal first.');if(dayKey(now)!==g.day||now<g.startedAt)return fail('Agree today’s goal before continuing this saved question.');
 if(g.draftId)return g.draftId===draftId?{ok:true,goal:g,already:true}:fail('The agreed question is already selected. Finish it or save a next step.');
 const result=bindCheck(state,g,draftId,now);if(!result.ok)return result;
 g.unit=result.draft.unit;g.draftId=draftId;g.boundAt=now;g.responseFloor=result.attempt?.responses?.length||0;return {ok:true,goal:g};
}
function choosePrerequisite(state,id,options={},now=Date.now()){
 const d=init(state),g=d.goals[id];if(!g?.draftId||g.category==='recall'||g.review||d.awards[id])return fail('Choose the original Maths or Science goal first.');
 if(dayKey(now)!==g.day||now<g.startedAt)return fail('Agree today’s goal before choosing a prerequisite.');
 const unit=text(options.unit,80),nextStep=text(options.nextStep||g.finish?.nextStep||g.finishDraft?.nextStep);if(!unit||nextStep.length<8)return fail('Choose a prerequisite and save a specific next step for the original question.');
 if(g.prerequisite)return g.prerequisite.unit===unit?{ok:true,goal:g,already:true}:fail('This goal already has an agreed prerequisite.');
 g.prerequisite={draftId:'',unit,title:text(options.title,240),selectedAt:now,boundAt:0,responseFloor:0,nextStep};return {ok:true,goal:g};
}
function bindPrerequisite(state,id,draftId,options={},now=Date.now()){
 const d=init(state),g=d.goals[id];if(!g?.draftId||g.category==='recall'||g.review||d.awards[id])return fail('Choose the original Maths or Science goal first.');
 if(dayKey(now)!==g.day||now<g.startedAt)return fail('Agree today’s goal before choosing a prerequisite.');
 if(g.prerequisite?.draftId)return g.prerequisite.draftId===draftId?{ok:true,goal:g,already:true}:fail('This goal already has an agreed prerequisite.');
 if(draftId===g.draftId||!findDraft(state,g.subject,g.draftId))return fail('Save the original question so you can return to it.');
 const nextStep=text(options.nextStep||g.prerequisite?.nextStep||g.finish?.nextStep||g.finishDraft?.nextStep);if(nextStep.length<8)return fail('Save a specific next step for the original question.');
 const bound=bindCheck(state,{...g,unit:g.prerequisite?.unit||''},draftId,now);if(!bound.ok)return bound;
 g.prerequisite={draftId,unit:bound.draft.unit,title:text(options.title||g.prerequisite?.title,240),selectedAt:g.prerequisite?.selectedAt||now,boundAt:now,responseFloor:bound.attempt?.responses?.length||0,nextStep};return {ok:true,goal:g};
}
function saveFinishDraft(state,id,fields={},now=Date.now()){
 const d=init(state),g=d.goals[id];if(!g)return fail('Agree a learning goal first.');if(g.review||d.awards[id])return {ok:true,goal:g,already:true};
 if(dayKey(now)!==g.day||now<g.startedAt)return fail('Agree today’s goal before continuing.');
 g.finishDraft=cleanFinishDraft({...g.finishDraft,...fields,updatedAt:now},g);return {ok:true,goal:g};
}
function observe(state,now=Date.now()){
 const d=init(state);let changed=false;
 for(const g of Object.values(d.goals)){
  if(!g.draftId||g.firstAttempt||g.day!==dayKey(now))continue;
  const a=findAttempt(state,g.subject,g.draftId),r=a?.responses?.[g.responseFloor];if(!usableAttempt(a)||!r||!stamp(r.at)||r.at<g.boundAt||r.at>now)continue;
  g.firstAttempt={at:r.at,capturedAt:now,responseIndex:g.responseFloor,unaided:!a.helped&&!a.revealed&&!a.guess&&a.phase!=='guided'&&!['example','steps'].includes(a.scaffold),answer:text(r.answer,4000)};changed=true;
 }
 return changed;
}
function evidence(a){return cleanEvidence({id:a.id,unit:a.unit,at:a.at,answeredAt:a.answeredAt||a.responses.at(-1).at,firstResponseAt:a.responses[0].at,responseCount:a.responses.length,correct:a.correct,helped:a.helped,revealed:a.revealed,seenBefore:a.seenBefore,written:written(a),phase:a.phase});}
function recordFinish(state,id,options={},now=Date.now()){
 observe(state,now);const d=state.learningGoals,g=d.goals[id];if(!g)return fail('Agree a learning goal first.');if(g.review||d.awards[id])return {ok:true,goal:g,already:true};
 if(dayKey(now)!==g.day||now<g.startedAt)return fail('Agree today’s goal before finishing this saved question.');
 const kind=options.kind||'finished';if(!['finished','prerequisite','parked'].includes(kind))return fail('Choose a finished task, a prerequisite or a saved next step.');
 const f={kind,at:now,explanation:text(options.explanation),check:text(options.check),nextStep:text(options.nextStep||g.prerequisite?.nextStep),oral:options.oral===true,evidence:null};
 if(kind==='parked'){
  if(f.nextStep.length<8)return fail('Save a specific next step so it is easy to return.');
  g.finish=f;return {ok:true,goal:g,points:0};
 }
 if(!g.draftId||!g.boundAt)return fail('Open and attempt the agreed practice question before finishing.');
 if(!f.oral&&(f.explanation.length<8||f.check.length<5))return fail('Explain the key idea and how you checked it, or explain both aloud to your grown-up.');
 const aid=kind==='prerequisite'?options.prerequisiteId||g.prerequisite?.draftId:options.attemptId||g.draftId,a=findAttempt(state,g.subject,aid);
 if(kind==='finished'&&aid!==g.draftId)return fail('Finish the question agreed at the start.');
 if(!successful(a))return fail('Check or correct the answer first. A supported finish is welcome.');
 const after=(a.responses||[]).some((r,i)=>stamp(r.at)>=g.boundAt&&r.at<=now&&(aid!==g.draftId||i>=g.responseFloor));
 if(!after||Number(a.answeredAt||a.responses.at(-1).at)>now)return fail('The finish needs a new answer or correction after the goal was agreed.');
 if(kind==='prerequisite'){
  if(!g.prerequisite||aid!==g.prerequisite.draftId||!a.responses.some((r,i)=>i>=g.prerequisite.responseFloor&&r.at>=g.prerequisite.boundAt&&r.at<=now))return fail('Agree the prerequisite before answering or correcting it.');
  if(!findDraft(state,g.subject,g.draftId))return fail('Keep the original question saved so you can return to it.');
  if(f.nextStep.length<8)return fail('Save the specific next step for the original question.');
 }
 if(g.category==='recall'&&(kind!=='finished'||!g.firstAttempt?.unaided))return fail('Return-and-remember needs a first attempt with help closed, followed by checking or correcting it.');
 f.evidence=evidence(a);const clean=cleanFinish(f,g);if(!clean)return fail('The saved answer could not be linked to this learning finish.');
 g.finish=clean;return {ok:true,goal:g,points:0,pending:true};
}
function approveGoal(state,id,review={},now=Date.now()){
 const d=init(state),g=d.goals[id];if(d.awards[id])return {ok:true,already:true,goal:g||d.awards[id].goal,points:0,cents:0};
 if(!g?.finish||g.finish.kind==='parked')return fail('Finish and explain the agreed task before confirming points.');if(g.review)return {ok:true,already:true,goal:g,points:0,cents:0};
 if(!stamp(now)||now<g.finish.at||review.explanationReviewed!==true||review.checkReviewed!==true)return fail('A grown-up needs to review the explanation and the check or correction.');
 const a=findAttempt(state,g.subject,g.finish.evidence.id);if(!successful(a)||Number(a.answeredAt||a.responses.at(-1).at)>g.finish.at||a.responses.length!==g.finish.evidence.responseCount)return fail('The answer changed after this finish. Save the explanation and check again.');
 if(g.finish.evidence.written&&review.writtenAnswerReviewed!==true)return fail('A grown-up needs to verify the written Science answer; the automatic check is preliminary.');
 if(g.category==='recall'&&!g.firstAttempt?.unaided)return fail('The first retrieval attempt was not recorded with help closed.');
 g.finish.evidence=evidence(a);
 g.review={at:now,explanationReviewed:true,checkReviewed:true,writtenAnswerReviewed:review.writtenAnswerReviewed===true};
 const eligible=d.trial&&g.startedAt>=d.trial.startedAt&&g.day>=d.trial.startDay&&g.day<=d.trial.endDay;
 if(!eligible)return {ok:true,goal:g,points:0,cents:0,reason:'Learning finish confirmed. The cash trial has ended; earned points stay available.'};
 const award=cleanAward({goal:g,trial:d.trial},id);if(!award){g.review=null;return fail('This finish does not yet have the evidence needed for points.');}
 d.awards[id]=award;return {ok:true,goal:g,points:award.points,cents:award.cents};
}
function weeks(state,now=Date.now()){
 const d=validate(state.learningGoals),rows={};
 for(const a of Object.values(d.awards)){const week=weekKey(a.day);rows[week]??={week,endDay:addDays(week,6),points:0,cents:0,paidCents:0,dueCents:0,awardIds:[],unpaidAwardIds:[]};const row=rows[week];row.points+=a.points;row.cents+=a.cents;row.awardIds.push(a.id);if(d.settlements[week]?.awardIds.includes(a.id))row.paidCents+=a.cents;else{row.dueCents+=a.cents;row.unpaidAwardIds.push(a.id);}}
 return Object.values(rows).map(r=>({...r,awardIds:r.awardIds.sort(),unpaidAwardIds:r.unpaidAwardIds.sort(),current:r.week===weekKey(dayKey(now))})).sort((a,b)=>b.week.localeCompare(a.week));
}
function settle(state,week,now=Date.now()){
 const d=init(state),row=weeks(state,now).find(r=>r.week===week);if(!row||!row.unpaidAwardIds.length)return fail('There are no unpaid confirmed points in this week.');
 if(!stamp(now)||row.unpaidAwardIds.some(id=>d.awards[id].approvedAt>now))return fail('Check the device date before recording cash paid.');
 d.settlements[week]={week,awardIds:[...new Set([...(d.settlements[week]?.awardIds||[]),...row.unpaidAwardIds])].sort(),at:Math.max(now,d.settlements[week]?.at||0)};
 return {ok:true,week,points:row.dueCents/CENTS_PER_POINT,cents:row.dueCents,awardIds:row.unpaidAwardIds};
}
function status(state,now=Date.now()){
 const d=validate(state.learningGoals),day=dayKey(now),awards=Object.values(d.awards).filter(a=>a.day===day),trial=d.trial?{...d.trial,started:true,active:day>=d.trial.startDay&&day<=d.trial.endDay,ended:day>d.trial.endDay,remainingDays:Math.max(0,Math.min(TRIAL_DAYS,Math.round((Date.parse(d.trial.endDay+'T12:00:00Z')-Date.parse(day+'T12:00:00Z'))/86400000)+1))}:{started:false,active:false,ended:false,remainingDays:TRIAL_DAYS};
 return {supported:true,day,timeZone:TIME_ZONE,currency:'USD',centsPerPoint:CENTS_PER_POINT,maxPoints:MAX_POINTS,trial,goals:Object.values(d.goals).filter(g=>g.day===day).sort((a,b)=>a.startedAt-b.startedAt||a.id.localeCompare(b.id)),points:awards.reduce((n,a)=>n+a.points,0),cents:awards.reduce((n,a)=>n+a.cents,0),pending:Object.values(d.goals).filter(g=>g.finish&&g.finish.kind!=='parked'&&!g.review&&!d.awards[g.id]).sort((a,b)=>a.startedAt-b.startedAt||a.id.localeCompare(b.id))};
}
function summary(state,now=Date.now()){
 const d=validate(state.learningGoals),weekly=weeks(state,now),totals=weekly.reduce((r,w)=>({points:r.points+w.points,cents:r.cents+w.cents,paidCents:r.paidCents+w.paidCents,dueCents:r.dueCents+w.dueCents}),{points:0,cents:0,paidCents:0,dueCents:0});
 const trialStarts=[...new Set([...(d.trial?[d.trial.startDay]:[]),...Object.values(d.awards).map(a=>a.trial.startDay)])].sort(),trialConflict=trialStarts.length>1;
 const retainedOutsideTrial=Object.values(d.awards).filter(a=>d.trial&&(a.day<d.trial.startDay||a.day>d.trial.endDay)).map(a=>({id:a.id,day:a.day,points:a.points,cents:a.cents})).sort((a,b)=>a.id.localeCompare(b.id));
 return {...status(state,now),totals,weeks:weekly,awardedGoals:Object.keys(d.awards).length,trialConflict,trialStarts,retainedOutsideTrial,limits:['Points record parent-verified learning habits, not mastery or independent correctness.','Cash settlements are parent-entered records; the app does not transfer money.','Mistakes, missed days and trial expiry do not remove earned points.',...(trialConflict?['Devices began this trial on different days. The earliest start governs new awards; already approved points and payment records are retained.']:[])]};
}
const earliest=(a,b,field)=>!a?b:!b?a:a[field]<b[field]?a:b[field]<a[field]?b:JSON.stringify(a)<=JSON.stringify(b)?a:b;
const latest=(a,b,field)=>!a?b:!b?a:a[field]>b[field]?a:b[field]>a[field]?b:JSON.stringify(a)>=JSON.stringify(b)?a:b;
function merge(a,b){
 a=validate(a);b=validate(b);const out=fresh();out.trial=copy(earliest(a.trial,b.trial,'startedAt'));
 for(const id of [...new Set([...Object.keys(a.goals),...Object.keys(b.goals)])].sort()){
  const A=a.goals[id],B=b.goals[id];let g=copy(earliest(A,B,'startedAt'));
  if(A&&B&&A.startedAt===B.startedAt&&A.subject===B.subject&&(!A.unit||!B.unit||A.unit===B.unit)){
   const bound=earliest(A.draftId?A:null,B.draftId?B:null,'boundAt');if(bound){g={...g,...copy(bound)};}
   if(A.draftId===g.draftId&&B.draftId===g.draftId){g.firstAttempt=copy(earliest(A.firstAttempt,B.firstAttempt,'capturedAt'));g.prerequisite=copy(earliest(A.prerequisite,B.prerequisite,'selectedAt'));if(A.prerequisite&&B.prerequisite&&A.prerequisite.selectedAt===B.prerequisite.selectedAt&&A.prerequisite.unit===B.prerequisite.unit)g.prerequisite=copy(earliest(A.prerequisite.draftId?A.prerequisite:null,B.prerequisite.draftId?B.prerequisite:null,'boundAt')||g.prerequisite);g.finishDraft=copy(latest(A.finishDraft,B.finishDraft,'updatedAt'));g.finish=copy(latest(A.finish,B.finish,'at'));g.review=copy(earliest(A.review?.at>=g.finish?.at?A.review:null,B.review?.at>=g.finish?.at?B.review:null,'at'));}
  }
  out.goals[id]=g;
 }
 for(const id of [...new Set([...Object.keys(a.awards),...Object.keys(b.awards)])].sort())out.awards[id]=copy(earliest(a.awards[id],b.awards[id],'approvedAt'));
 for(const week of [...new Set([...Object.keys(a.settlements),...Object.keys(b.settlements)])].sort()){const A=a.settlements[week],B=b.settlements[week];out.settlements[week]={week,awardIds:[...new Set([...(A?.awardIds||[]),...(B?.awardIds||[])])].sort(),at:Math.max(A?.at||0,B?.at||0)};}
 return validate(out);
}
root.MochiLearningGoals={TIME_ZONE,CENTS_PER_POINT,TRIAL_DAYS,MAX_POINTS,POINTS,fresh,validate,init,merge,dayKey,weekKey,beginGoal,bindGoal,choosePrerequisite,bindPrerequisite,saveFinishDraft,observe,recordFinish,approveGoal,status,summary,weeks,settle};
if(typeof module!=='undefined')module.exports=root.MochiLearningGoals;
})(typeof window!=='undefined'?window:globalThis);
