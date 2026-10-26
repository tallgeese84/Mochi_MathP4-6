/* A private, dated lesson queue. It never changes answers, evidence, rewards or time goals. */
(function(root){
'use strict';
const ZONE='America/Chicago',SUBJECTS=['maths','science'],KEY={maths:'entrance',science:'sciencePath'},DAY=86400000;
function day(at,zone){return new Intl.DateTimeFormat('en-CA',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(at));}
function date(s){return typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&Number.isFinite(Date.parse(s+'T12:00:00Z'))&&new Date(s+'T12:00:00Z').toISOString().slice(0,10)===s;}
function time(s){return typeof s==='string'&&/^\d{4}-\d\d-\d\dT.*Z$/.test(s)&&Number.isFinite(Date.parse(s));}
function plain(s,max){return typeof s==='string'&&s.length>0&&s.length<=max&&!/[<>\u0000-\u001f]/.test(s);}
function exact(x,keys){return x&&typeof x==='object'&&!Array.isArray(x)&&Object.keys(x).every(k=>keys.includes(k));}
function validate(raw,engines,now=Date.now()){
 if(!exact(raw,['schema','id','revision','student','timeZone','reviewedDate','sessionDate','generatedAt','sourceExportedAt','subjects'])||raw.schema!==1)throw Error('Unsupported plan format.');
 if(typeof raw.id!=='string'||!/^[a-zA-Z0-9_-]{8,100}$/.test(raw.id)||!Number.isInteger(raw.revision)||raw.revision<1||raw.revision>10000||raw.student!=='Euna')throw Error('Invalid plan identity.');
 try{day(now,raw.timeZone);}catch(_){throw Error('Invalid plan timezone.');}
 if(raw.timeZone!==ZONE||!date(raw.reviewedDate)||!date(raw.sessionDate)||raw.reviewedDate>=raw.sessionDate)throw Error('Invalid plan dates.');
 const gap=(Date.parse(raw.sessionDate)-Date.parse(raw.reviewedDate))/DAY;
 if(gap>3||!time(raw.generatedAt)||!time(raw.sourceExportedAt)||Date.parse(raw.sourceExportedAt)>Date.parse(raw.generatedAt)||Date.parse(raw.generatedAt)>now+300000||Date.parse(raw.generatedAt)-Date.parse(raw.sourceExportedAt)>3*DAY||day(Date.parse(raw.sourceExportedAt),raw.timeZone)<raw.reviewedDate)throw Error('Plan source is stale or inconsistent.');
 if(!exact(raw.subjects,SUBJECTS)||SUBJECTS.some(s=>!raw.subjects[s]))throw Error('Both subjects are required.');
 const subjects={};
 for(const subject of SUBJECTS){
  const block=raw.subjects[subject],E=engines[subject];
  if(!exact(block,['focus','steps'])||!plain(block.focus,160)||!Array.isArray(block.steps)||!block.steps.length||block.steps.length>5)throw Error('Invalid subject plan.');
  let total=0;
  const steps=block.steps.map(step=>{
   if(!exact(step,['kind','unit','phase','count'])||typeof step.unit!=='string'||!E?.unit(step.unit)||!['lesson','practice'].includes(step.kind))throw Error('Unknown lesson or action.');
   if(step.kind==='lesson'){if(step.phase!==undefined||step.count!==undefined)throw Error('Lessons cannot set question counts.');return {kind:'lesson',unit:step.unit};}
   if(!['guided','apply','transfer'].includes(step.phase)||!Number.isInteger(step.count)||step.count<1||step.count>2)throw Error('Invalid practice step.');
   total+=step.count;return {kind:'practice',unit:step.unit,phase:step.phase,count:step.count};
  });
  if(total>6)throw Error('Too many planned questions.');subjects[subject]={focus:block.focus,steps};
 }
 return {schema:1,id:raw.id,revision:raw.revision,student:raw.student,timeZone:raw.timeZone,reviewedDate:raw.reviewedDate,sessionDate:raw.sessionDate,generatedAt:raw.generatedAt,sourceExportedAt:raw.sourceExportedAt,subjects};
}
const signature=p=>JSON.stringify(p);
function usable(p,now=Date.now()){return !!p&&day(now,p.timeZone)===p.sessionDate&&Date.parse(p.generatedAt)<=now+300000;}
function fresh(plan,now=Date.now()){return {plan,receivedAt:now,adoptedAt:now,startedAt:null,progress:{maths:{index:0,count:0,active:null},science:{index:0,count:0,active:null}}};}
function restore(raw,engines,now=Date.now()){
 if(!raw)return null;const plan=validate(raw.plan,engines,now),out=fresh(plan,now);
 out.receivedAt=Number.isFinite(raw.receivedAt)?raw.receivedAt:now;out.adoptedAt=Number.isFinite(raw.adoptedAt)?raw.adoptedAt:now;
 out.startedAt=Number.isFinite(raw.startedAt)&&raw.startedAt>=out.adoptedAt&&raw.startedAt<=now?raw.startedAt:null;
 for(const s of SUBJECTS){const p=raw.progress?.[s],n=plan.subjects[s].steps.length;if(!p)continue;
  if(!Number.isInteger(p.index)||p.index<0||p.index>n||!Number.isInteger(p.count)||p.count<0||p.count>2)continue;
  out.progress[s]={index:p.index,count:p.count,active:p.active&&typeof p.active.id==='string'&&p.active.id.length<=150&&p.active.index===p.index?{id:p.active.id,index:p.index,unit:p.active.unit,kind:p.active.kind}:null};
 }
 return out;
}
// Waiting work needs a route, not only a veto. These helpers are read-only.
function pending(record,subject,now=Date.now()){
 return !!(record&&SUBJECTS.includes(subject)&&usable(record.plan,now)&&record.plan.subjects[subject].steps[record.progress[subject].index]);
}
function reviewedToday(d,plan){
 const today=at=>!!at&&day(at,plan.timeZone)===plan.sessionDate;
 // A submitted single recall satisfies the scheduling allowance, even after a
 // mistake. This is NOT delayed-recall mastery and does not change its evidence.
 return (d.mixedLog||[]).some(x=>today(x.completedAt))||(d.attempts||[]).some(a=>a.phase==='recall'&&!a.skipped&&a.responses?.some(x=>today(x.at))&&d.draft?.id!==a.id);
}
function routing(record,state,subject,engines,now=Date.now()){
 if(!record||!SUBJECTS.includes(subject)||!usable(record.plan,now))return {reasonCode:'NO_CURRENT_PLAN'};
 if(!pending(record,subject,now))return {reasonCode:'PLAN_COMPLETE'};
 const E=engines[subject],d=state[KEY[subject]]||E.fresh();
 if(Object.values(d.papers||{}).some(x=>!x.submittedAt))return {reasonCode:'SAVED_PAPER'};
 if(d.draft&&!d.attempts.find(a=>a.id===d.draft.id)?.correct)return {reasonCode:'SAVED_DRAFT'};
 if(Object.entries(d.lessons||{}).some(([id,l])=>E.unit(id)&&l.visited?.length&&!l.completedAt))return {reasonCode:'SAVED_LESSON'};
 if(d.mixed&&!d.mixed.completedAt&&E.mixedNext(d))return {reasonCode:'SAVED_MIXED'};
 if(!reviewedToday(d,record.plan)&&E.D.units.some(u=>E.evidence(d,u.id,now).overdue))return {reasonCode:'DUE_RECALL'};
 return {reasonCode:'READY'};
}
function prelude(record,state,subject,engines,now=Date.now()){
 const reasonCode=routing(record,state,subject,engines,now).reasonCode;
 if(!['SAVED_MIXED','DUE_RECALL'].includes(reasonCode))return null;
 const E=engines[subject],d=state[KEY[subject]]||E.fresh();
 const base={subject,nightlyPrelude:true,reasonCode,touched:0,resume:false};
 if(reasonCode==='SAVED_MIXED')return {...base,kind:'mixed',title:'Mixed practice',resume:true,touched:d.mixed.at,detail:'Finish your saved short set, then continue today’s focus.'};
 const rows=E.D.units.map(u=>E.evidence(d,u.id,now)),ready=rows.filter(e=>e.taught&&e.apply>=1&&!E.prerequisite?.(d,e.id,now));
 if(ready.length>=2)return {...base,kind:'mixed',title:'Mixed practice',detail:'One short review set, then today’s focus.'};
 const due=rows.filter(e=>e.overdue).sort((a,b)=>a.due-b.due)[0];
 return due?{...base,kind:'recall',unit:due.id,title:due.title,detail:'Try this review without the lesson, then continue today’s focus.'}:null;
}
function cycle(record,subject){
 if(!record||!SUBJECTS.includes(subject))return null;
 const steps=record.plan?.subjects?.[subject]?.steps||[],practice=steps.filter(x=>x.kind==='practice'),units=new Set(practice.map(x=>x.unit)),total=practice.reduce((n,x)=>n+(x.count||0),0);
 // A coherent three-question priority becomes one learning microcycle without
 // rewriting the private plan or its device-local queue positions.
 if(total!==3||units.size!==1)return null;
 const p=record.progress?.[subject]||{index:0,count:0};let done=0;
 for(let i=0;i<p.index;i++)if(steps[i]?.kind==='practice')done+=steps[i].count||0;
 if(steps[p.index]?.kind==='practice')done+=Math.min(p.count||0,steps[p.index].count||0);
 done=Math.max(0,Math.min(3,done));const current=Math.min(3,done+1),phase=['guided','apply','transfer'][current-1];
 return {unit:practice[0].unit,done,total:3,current,phase,complete:done>=3};
}
function next(record,state,subject,engines,now=Date.now()){
 if(!record||!SUBJECTS.includes(subject)||!usable(record.plan,now))return null;
 const E=engines[subject],d=state[KEY[subject]]||E.fresh(),p=record.progress[subject],step=record.plan.subjects[subject].steps[p.index],micro=cycle(record,subject);
 if(!step)return null;
 if(Object.values(d.papers||{}).some(x=>!x.submittedAt))return null;
 // An unfinished editor, mixed set or lesson is never discarded to impose a new plan.
 if(d.draft&&!d.attempts.find(a=>a.id===d.draft.id)?.correct)return null;
 if(d.mixed&&!d.mixed.completedAt&&E.mixedNext(d))return null;
 if(Object.entries(d.lessons||{}).some(([id,l])=>E.unit(id)&&l.visited?.length&&!l.completedAt))return null;
 if(!reviewedToday(d,record.plan)&&E.D.units.some(u=>E.evidence(d,u.id,now).overdue))return null;
 const bridge=E.prerequisite?.(d,step.unit,now),u=E.unit(bridge||step.unit),ev=E.evidence(d,u.id,now);
 const kind=(bridge?!ev.taught||ev.needsTeaching:step.kind==='lesson'||!ev.taught)?'lesson':'practice',requested=micro&&!bridge?micro.phase:step.phase;
 // The third slot remains conservative: if prerequisites do not yet support
 // transfer, it stays a changed application rather than forcing a leap.
 const phase=kind==='practice'?(bridge?'apply':requested==='transfer'&&ev.apply<2?'apply':requested):undefined;
 return {subject,kind,unit:u.id,title:u.title,resume:false,touched:0,detail:record.plan.subjects[subject].focus,nightly:true,planId:record.plan.id,stepIndex:p.index,...(phase?{phase}:{}),...(micro?{microcycle:true,challengeIndex:micro.current}:{}),prerequisite:!!bridge||(kind==='lesson'&&step.kind==='practice')};
}
function bind(record,task,view,draft,now=Date.now()){
 if(!record||!task.nightly||task.planId!==record.plan.id||task.prerequisite)return;
 const p=record.progress[task.subject];if(p.index!==task.stepIndex||view.unit!==task.unit)return;
 if(view.kind==='lesson')p.active={kind:'lesson',unit:view.unit,id:'lesson:'+view.unit,index:p.index};
 else if(view.kind==='practice'&&draft?.unit===task.unit)p.active={kind:'practice',unit:draft.unit,id:draft.id,index:p.index};
 if(p.active){record.startedAt=record.startedAt||now;if(p.active.kind==='practice'&&!draft.nightlyPlan&&!draft.nightlyConflict)draft.nightlyPlan={planId:record.plan.id,revision:record.plan.revision,sessionDate:record.plan.sessionDate};}
}
function lessonDone(record,subject,id){const p=record?.progress[subject];if(p?.active?.kind!=='lesson'||p.active.unit!==id)return false;p.index++;p.count=0;p.active=null;return true;}
function settle(record,state,subject){
 const p=record?.progress[subject];if(!p?.active||p.active.kind!=='practice')return false;
 const d=state[KEY[subject]],a=d?.attempts.find(a=>a.id===p.active.id);
 // Only the student's explicit next-step action after leaving a recorded answer consumes a slot.
 if(d?.draft?.id===p.active.id)return false;
 if(!a?.responses?.length){p.active=null;return true;}
 p.count++;p.active=null;const step=record.plan.subjects[subject].steps[p.index];
 if(p.count>=(step?.count||1)){p.index++;p.count=0;}return true;
}
root.MochiNightlyPlanCore={validate,usable,fresh,restore,pending,routing,prelude,cycle,next,bind,lessonDone,settle,signature,day};
if(typeof module!=='undefined')module.exports=root.MochiNightlyPlanCore;
})(typeof window!=='undefined'?window:globalThis);
