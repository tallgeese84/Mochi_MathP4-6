/* Optional extra-question rewards after the planned day is complete.
   Rewards are separate from mastery: only fresh, first-try independent answers qualify. */
(function(root){
'use strict';
const P=root.MochiPlanner||(typeof require==='function'?require('./planner-core.js'):null);
const T=root.MochiToday||(typeof require==='function'?require('./today-core.js'):null);
const C=root.MochiPathCoach||(typeof require==='function'?require('./path-coach.js'):null);
const engines={
  maths:root.MochiEntrance||(typeof require==='function'?require('./entrance-core.js'):null),
  science:root.MochiSciencePath||(typeof require==='function'?require('./science-path-core.js'):null)
};
const keys={maths:'entrance',science:'sciencePath'},MAX=3,CHEST=2;
const fresh=()=>({version:1,days:{}});
const dayKey=now=>P.localDay(now);
const stamp=n=>Number.isFinite(n)&&n>=0&&n<8640000000000000?n:0;
const validSubject=s=>s==='maths'||s==='science';
function validate(raw){
 const out=fresh();if(!raw||raw.version!==1)return out;
 const days=Object.entries(raw.days||{}).filter(([k])=>/^\d{4}-\d{2}-\d{2}$/.test(k)).sort().slice(-60);
 for(const [k,v] of days){
  const attempts=[],seenA=new Set();for(const x of Array.isArray(v.attempts)?v.attempts:[]){const id=String(x?.id||'').slice(0,140),subject=x?.subject;if(!id||!validSubject(subject)||seenA.has(id))continue;seenA.add(id);attempts.push({id,subject});if(attempts.length>=20)break;}
  const success=[],seenS=new Set();for(const x of Array.isArray(v.success)?v.success:[]){const id=String(x?.id||'').slice(0,140),subject=x?.subject,phase=['apply','transfer','recall'].includes(x?.phase)?x.phase:'apply',coins=Number.isInteger(x?.coins)&&x.coins>=1&&x.coins<=2?x.coins:C.reward(phase);if(!id||!validSubject(subject)||seenS.has(id))continue;seenS.add(id);success.push({id,subject,phase,coins});if(success.length>=MAX)break;}
  const active=v.active&&validSubject(v.active.subject)&&stamp(v.active.startedAt)?{subject:v.active.subject,startedAt:v.active.startedAt,unit:engines[v.active.subject]?.unit?.(String(v.active.unit||''))?String(v.active.unit).slice(0,80):'',phase:['apply','transfer','recall'].includes(v.active.phase)?v.active.phase:'apply'}:null;
  out.days[k]={attempts,success,chest:v.chest===true&&success.length>=MAX,active};
 }
 return out;
}
function init(state){state.questRewards=validate(state.questRewards);return state.questRewards;}
function day(state,now=Date.now()){const d=init(state),k=dayKey(now);return d.days[k]??=( {attempts:[],success:[],chest:false,active:null} );}
function attempts(state,subject){const E=engines[subject],d=state[keys[subject]]||E.fresh();return Array.isArray(d.attempts)?d.attempts:[];}
function at(a){return Number(a?.answeredAt||a?.at)||0;}
function qualifying(a){return !!(a&&a.correct&&a.firstCorrect&&a.independent&&!a.seenBefore&&['apply','transfer','recall'].includes(a.phase)&&!a.paperId&&a.mode!=='paper'&&a.mode!=='baseline');}
function phaseFor(e){return e.overdue?'recall':e.apply>=2&&!e.transfer?'transfer':'apply';}
function candidateUnits(state,subject,now=Date.now()){
 const E=engines[subject],d=state[keys[subject]]||E.fresh();
 return E.D.units.map(u=>E.evidence(d,u.id,now)).filter(e=>e.taught&&!e.needsTeaching).sort((a,b)=>Number(b.overdue)-Number(a.overdue)||(phaseFor(a)==='transfer'?0:1)-(phaseFor(b)==='transfer'?0:1)||a.apply-b.apply||a.last-b.last);
}
function bonusTask(state,now=Date.now(),preferred=''){
 const s=status(state,now);if(!s.unlocked||s.complete)return null;
 if(s.active){const E=engines[s.active.subject],d=state[keys[s.active.subject]]||E.fresh(),unit=s.active.unit||d.draft?.unit||candidateUnits(state,s.active.subject,now)[0]?.id,phase=s.active.phase||'apply';if(unit&&E.unit(unit))return {subject:s.active.subject,unit,title:E.unit(unit).title,phase,coins:C.reward(phase),resume:!!d.draft};}
 const available=T.model(state,now).blocks.filter(b=>!b.rest).map(b=>b.subject),count=subject=>s.success.filter(x=>x.subject===subject).length;
 const ordered=[...available].sort((a,b)=>(a===preferred?-1:b===preferred?1:count(a)-count(b)||a.localeCompare(b)));
 for(const subject of ordered){const units=candidateUnits(state,subject,now);if(units.length){const phase=phaseFor(units[0]);return {subject,unit:units[0].id,title:units[0].title,phase,coins:C.reward(phase),resume:false};}}
 return null;
}
function bonusOptions(state,now=Date.now()){
 const s=status(state,now);if(!s.unlocked||s.complete)return[];if(s.active){const x=bonusTask(state,now);return x?[x]:[];}
 return ['maths','science'].map(subject=>bonusTask(state,now,subject)).filter((x,i,a)=>x&&a.findIndex(y=>y.subject===x.subject)===i);
}
function status(state,now=Date.now()){
 const d=day(state,now),m=T.model(state,now),success=d.success.slice(),base=success.length,chest=d.chest,earned=success.reduce((n,x)=>n+(x.coins||1),0)+(chest?CHEST:0);
 return {day:dayKey(now),unlocked:m.finished,complete:base>=MAX,success,max:MAX,earned,chest,active:d.active,attempted:d.attempts.length};
}
function start(state,subject,now=Date.now()){
 const s=status(state,now);if(!s.unlocked||s.complete||s.active||!validSubject(subject))return false;
 const task=bonusTask(state,now,subject);if(!task||task.subject!==subject)return false;
 const d=day(state,now);d.active={subject,startedAt:now,unit:task.unit,phase:task.phase};return true;
}
function settle(state,now=Date.now()){
 const d=day(state,now),active=d.active;if(!active)return {settled:false,coins:0};
 const used=new Set(d.attempts.map(x=>x.id));
 const found=attempts(state,active.subject).filter(a=>at(a)>=active.startedAt&&!used.has(String(a.id||''))).sort((a,b)=>at(a)-at(b))[0];
 if(!found)return {settled:false,coins:0};
 const id=String(found.id||'').slice(0,140);d.attempts.push({id,subject:active.subject});d.attempts=d.attempts.slice(-20);d.active=null;
 let coins=0,success=false,chest=false,phase=found.phase||active.phase||'apply';
 if(qualifying(found)&&d.success.length<MAX&&!d.success.some(x=>x.id===id)){
  const base=C.reward(phase);d.success.push({id,subject:active.subject,phase,coins:base});coins=base;success=true;
  if(d.success.length===MAX&&!d.chest){d.chest=true;coins+=CHEST;chest=true;}
 }
 return {settled:true,coins,success,chest,id,subject:active.subject,phase};
}
function merge(a,b){
 a=validate(a);b=validate(b);const out=fresh();
 for(const k of new Set([...Object.keys(a.days),...Object.keys(b.days)])){
  const A=a.days[k]||{attempts:[],success:[],chest:false,active:null},B=b.days[k]||{attempts:[],success:[],chest:false,active:null};
  const union=(x,y,max)=>{const m=new Map();for(const v of [...x,...y])if(!m.has(v.id))m.set(v.id,v);return [...m.values()].slice(-max);};
  const active=!A.active?B.active:!B.active?A.active:(A.active.startedAt>=B.active.startedAt?A.active:B.active);
  const success=union(A.success,B.success,MAX);
  out.days[k]={attempts:union(A.attempts,B.attempts,20),success,chest:success.length>=MAX,active};
 }
 return validate(out);
}
root.MochiQuestRewards={MAX,CHEST,fresh,validate,init,status,bonusTask,bonusOptions,start,settle,merge,qualifying,phaseFor};
if(typeof module!=='undefined')module.exports=root.MochiQuestRewards;
})(typeof window!=='undefined'?window:globalThis);
