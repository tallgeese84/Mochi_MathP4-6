/* Read-only daily routing. Existing subject engines remain the authority on learning.
   Study-time completion is never mastery; this module creates no answers or rewards. */
(function(root){
'use strict';
const P=root.MochiPlanner||(typeof require==='function'?require('./planner-core.js'):null);
const engines={maths:root.MochiEntrance||(typeof require==='function'?require('./entrance-core.js'):null),science:root.MochiSciencePath||(typeof require==='function'?require('./science-path-core.js'):null)};
const key={maths:'entrance',science:'sciencePath'},names={maths:'Maths',science:'Science'};
function task(state,subject,now=Date.now()){
 const E=engines[subject];if(!E)throw Error('Unknown study subject');
 const d=state[key[subject]]||E.fresh(),s={...state,[key[subject]]:d};
 const papers=Object.values(d.papers).filter(p=>!p.submittedAt).sort((a,b)=>(a.deadline||Infinity)-(b.deadline||Infinity)||a.startedAt-b.startedAt);
 if(papers.length){const p=papers[0];return {subject,kind:'paper',paper:p.id,title:E.paperDefinitions.find(x=>x.id===p.id)?.title||'Saved paper',resume:true,touched:p.updatedAt||p.startedAt,deadline:p.deadline||0,detail:p.deadline?'Continue with the original deadline. No new paper will be opened.':'Continue your saved starting-point check.'};}
 // A correct draft is a finished answer, not an unfinished task. Preserve it until
 // the learner deliberately continues; never discard an unsent or incorrect draft.
 const draft=d.draft,answer=draft&&d.attempts.find(a=>a.id===draft.id);
 const recent=Object.entries(d.lessons).filter(([id,l])=>E.unit(id)&&l.visited.length&&!l.completedAt).sort((a,b)=>b[1].lastViewedAt-a[1].lastViewedAt)[0];
 if(draft&&!answer?.correct&&draft.phase==='mixed')return {subject,kind:'mixed',title:'Mixed practice',resume:true,touched:draft.updatedAt||draft.at,detail:'Your question is saved. Decide which method to use.'};
 if(draft&&!answer?.correct&&draft.phase==='redo')return {subject,kind:'redo',attempt:draft.redoOf,unit:draft.unit,title:'Second try',resume:true,touched:draft.updatedAt||draft.at,detail:'Your saved question is waiting.'};
 if(draft&&!answer?.correct){
  const bridge=subject==='maths'&&answer?.responses.length&&E.prerequisite?.(d,draft.unit,now);
  if(bridge)return {subject,kind:'lesson',unit:bridge,title:E.unit(bridge).title,resume:true,touched:draft.updatedAt||draft.at,detail:'Build this idea visually first. Your earlier question and working stay saved.'};
  if(recent&&recent[0]===draft.unit&&recent[1].lastViewedAt>draft.updatedAt)return {subject,kind:'lesson',unit:recent[0],title:E.unit(recent[0]).title,resume:true,touched:recent[1].lastViewedAt,detail:'Continue your saved lesson, then try the idea.'};
  return {subject,kind:'question',unit:draft.unit,title:E.unit(draft.unit).title,resume:true,touched:draft.updatedAt||draft.at,detail:'Your answer and working are saved. Continue where you stopped.'};
 }
 if(recent)return {subject,kind:'lesson',unit:recent[0],title:E.unit(recent[0]).title,resume:true,touched:recent[1].lastViewedAt,detail:'Continue your saved lesson, then try the idea.'};
 const r=E.recommend({...s,[key[subject]]:{...d,draft:null}},now);
 if(r.kind==='mixed-set')return {subject,kind:'mixed',title:'Mixed practice',resume:!!(d.mixed&&!d.mixed.completedAt),touched:d.mixed&&!d.mixed.completedAt?d.mixed.at:0,detail:r.due?'Revise topics you have learnt. Decide which method to use for each question.':'Questions from different topics. Decide which method to use for each one.'};
 if(r.kind==='redo')return {subject,kind:'redo',attempt:r.attempt,unit:r.unit,title:'Second try',resume:false,touched:0,detail:'Try again a question you got wrong a few days ago.'};
 if(r.kind==='mixed'){
  // Home never opens or previews a reserved paper. When the course is explored,
  // choose existing unreserved practice with the least recent evidence instead.
  const u=E.D.units.map(u=>E.evidence(d,u.id,now)).sort((a,b)=>a.last-b.last)[0];
  return {subject,kind:'practice',unit:u.id,title:u.title,resume:false,touched:0,detail:'Apply a familiar method to a fresh practice question.'};
 }
 return {subject,kind:r.kind==='learn'?'lesson':r.kind==='recall'?'recall':'practice',unit:r.unit,title:E.unit(r.unit).title,resume:false,touched:0,detail:r.kind==='learn'?'Learn a new topic, study the worked example, then try a question.':r.kind==='recall'?'Revise this topic without looking at the lesson.':'Try the next question.'};
}
function model(state,now=Date.now()){
 const p=state.planner||P.fresh(),date=P.localDay(now),time=P.elapsed(p,date);
 const blocks=P.subjects.map(subject=>{const minutes=P.minutes(p,subject,now),spent=Math.max(0,time[subject]||0);return {subject,name:names[subject],minutes,spent,remaining:Math.max(0,minutes*60000-spent),rest:minutes===0,done:minutes>0&&spent>=minutes*60000,task:task(state,subject,now)};});
 const papers=blocks.filter(b=>b.task.kind==='paper').sort((a,b)=>(a.task.deadline||Infinity)-(b.task.deadline||Infinity)||a.task.touched-b.task.touched);
 const available=blocks.filter(b=>!b.rest&&!b.done);
 const resumed=available.filter(b=>b.task.resume).sort((a,b)=>b.task.touched-a.task.touched);
 const recall=available.find(b=>b.task.kind==='recall');
 const next=papers[0]||resumed[0]||recall||available[0]||null;
 const planned=blocks.filter(b=>!b.rest).length,completed=blocks.filter(b=>b.done).length;
 return {date,blocks,next:next?.task||null,subject:next?.subject||null,planned,completed,restDay:planned===0,finished:planned>0&&planned===completed,order:next?[next,...blocks.filter(b=>b!==next)]:blocks};
}
root.MochiToday={task,model,names};if(typeof module!=='undefined')module.exports=root.MochiToday;
})(typeof window!=='undefined'?window:globalThis);
