/* A private, dated lesson queue. It never changes answers, evidence, rewards or time goals. */
(function(root){
'use strict';
const SUBJECTS=['maths','science'],KEY={maths:'entrance',science:'sciencePath'},DAY=86400000;
function day(at,zone){return new Intl.DateTimeFormat('en-CA',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(at));}
function date(s){return typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&Number.isFinite(Date.parse(s+'T12:00:00Z'))&&new Date(s+'T12:00:00Z').toISOString().slice(0,10)===s;}
function time(s){return typeof s==='string'&&/^\d{4}-\d\d-\d\dT.*Z$/.test(s)&&Number.isFinite(Date.parse(s));}
function plain(s,max){return typeof s==='string'&&s.length>0&&s.length<=max&&!/[<>\u0000-\u001f]/.test(s);}
function exact(x,keys){return x&&typeof x==='object'&&!Array.isArray(x)&&Object.keys(x).every(k=>keys.includes(k));}
function validate(raw,engines,now=Date.now()){
 if(!exact(raw,['schema','id','revision','student','timeZone','reviewedDate','sessionDate','generatedAt','sourceExportedAt','subjects'])||raw.schema!==1)throw Error('Unsupported plan format.');
 if(typeof raw.id!=='string'||!/^[a-zA-Z0-9_-]{8,100}$/.test(raw.id)||!Number.isInteger(raw.revision)||raw.revision<1||raw.revision>10000||raw.student!=='Euna')throw Error('Invalid plan identity.');
 try{day(now,raw.timeZone);}catch(_){throw Error('Invalid plan timezone.');}
 if(typeof raw.timeZone!=='string'||raw.timeZone.length>60||!date(raw.reviewedDate)||!date(raw.sessionDate)||raw.reviewedDate>=raw.sessionDate)throw Error('Invalid plan dates.');
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
function fresh(plan,now=Date.now()){return {plan,receivedAt:now,adoptedAt:now,progress:{maths:{index:0,count:0,active:null},science:{index:0,count:0,active:null}}};}
function restore(raw,engines,now=Date.now()){
 if(!raw)return null;const plan=validate(raw.plan,engines,now),out=fresh(plan,now);
 out.receivedAt=Number.isFinite(raw.receivedAt)?raw.receivedAt:now;out.adoptedAt=Number.isFinite(raw.adoptedAt)?raw.adoptedAt:now;
 for(const s of SUBJECTS){const p=raw.progress?.[s],n=plan.subjects[s].steps.length;if(!p)continue;
  if(!Number.isInteger(p.index)||p.index<0||p.index>n||!Number.isInteger(p.count)||p.count<0||p.count>2)continue;
  out.progress[s]={index:p.index,count:p.count,active:p.active&&typeof p.active.id==='string'&&p.active.id.length<=150&&p.active.index===p.index?{id:p.active.id,index:p.index,unit:p.active.unit,kind:p.active.kind}:null};
 }
 return out;
}
function next(record,state,subject,engines,now=Date.now()){
 if(!record||!SUBJECTS.includes(subject)||!usable(record.plan,now))return null;
 const E=engines[subject],d=state[KEY[subject]]||E.fresh(),p=record.progress[subject],step=record.plan.subjects[subject].steps[p.index];
 if(!step)return null;
 if(Object.values(d.papers||{}).some(x=>!x.submittedAt))return null;
 // An unfinished editor, mixed set or lesson is never discarded to impose a new plan.
 if(d.draft&&!d.attempts.find(a=>a.id===d.draft.id)?.correct)return null;
 if(d.mixed&&!d.mixed.completedAt&&E.mixedNext(d))return null;
 if(Object.entries(d.lessons||{}).some(([id,l])=>E.unit(id)&&l.visited?.length&&!l.completedAt))return null;
 const reviewedToday=(d.mixedLog||[]).some(x=>x.completedAt&&day(x.completedAt,record.plan.timeZone)===record.plan.sessionDate);
 if(!reviewedToday&&E.D.units.some(u=>E.evidence(d,u.id,now).overdue))return null;
 const bridge=E.prerequisite?.(d,step.unit,now),u=E.unit(bridge||step.unit),ev=E.evidence(d,u.id,now);
 const kind=(bridge?!ev.taught||ev.needsTeaching:step.kind==='lesson'||!ev.taught)?'lesson':'practice';
 const phase=kind==='practice'?(bridge?'apply':step.phase==='transfer'&&ev.apply<2?'apply':step.phase):undefined;
 return {subject,kind,unit:u.id,title:u.title,resume:false,touched:0,detail:record.plan.subjects[subject].focus,nightly:true,planId:record.plan.id,stepIndex:p.index,...(phase?{phase}:{}),prerequisite:!!bridge||(kind==='lesson'&&step.kind==='practice')};
}
function bind(record,task,view,draft){
 if(!record||!task.nightly||task.planId!==record.plan.id||task.prerequisite)return;
 const p=record.progress[task.subject];if(p.index!==task.stepIndex||view.unit!==task.unit)return;
 if(view.kind==='lesson')p.active={kind:'lesson',unit:view.unit,id:'lesson:'+view.unit,index:p.index};
 else if(view.kind==='practice'&&draft?.unit===task.unit)p.active={kind:'practice',unit:draft.unit,id:draft.id,index:p.index};
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
root.MochiNightlyPlanCore={validate,usable,fresh,restore,next,bind,lessonDone,settle,signature,day};
if(typeof module!=='undefined')module.exports=root.MochiNightlyPlanCore;
})(typeof window!=='undefined'?window:globalThis);
