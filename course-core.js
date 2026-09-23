/* Transparent classroom sequencing. Completion is exposure, never a mastery score. */
(function(root){
'use strict';
const D=root.MochiCourseData||(typeof require==='function'?require('./course-data.js'):null),DAY=86400000;
const unit=id=>D.units.find(u=>u.id===id),question=id=>D.questions.find(q=>q.id===id);
const fresh=()=>({version:1,lastUnit:{maths:'m-number',science:'s-inquiry'},lessons:{},attempts:[]});
const init=s=>s.course||(s.course=fresh());
const stamp=n=>Number.isFinite(n)&&n>=0&&n<=8640000000000000?n:0;
const ink=strokes=>(Array.isArray(strokes)?strokes:[]).slice(-120).map(s=>(Array.isArray(s)?s:[]).slice(0,500).filter(p=>Array.isArray(p)&&p.length===2&&p.every(Number.isFinite)).map(p=>p.map(n=>Math.round(Math.max(0,Math.min(1,n))*10000)/10000))).filter(s=>s.length);
function lesson(c,id){if(!unit(id))throw Error('Unknown lesson');return c.lessons[id]||(c.lessons[id]={page:0,visited:[],completedAt:0,updatedAt:0,notes:'',strokes:[],draft:null});}
function visit(c,id,page,now=Date.now()){
 const u=unit(id),l=lesson(c,id);l.page=Math.min(u.pages.length-1,Math.max(0,Math.trunc(page)||0));
 l.visited=[...new Set([...l.visited,l.page])];l.updatedAt=now;c.lastUnit[u.subject]=id;return l;
}
function complete(c,id,now=Date.now()){const u=unit(id),l=lesson(c,id);if(l.visited.length!==u.pages.length)return false;l.completedAt=l.completedAt||now;l.updatedAt=now;return true;}
function cleanAttempt(a){
 const q=question(a?.question);if(!q||typeof a.id!=='string'||!stamp(a.at))return null;
 const choices=(Array.isArray(a.responses)?a.responses:[]).filter(n=>Number.isInteger(n)&&n>=0&&n<q.choices.length).slice(0,20);if(!choices.length)return null;
 return {id:a.id.slice(0,120),at:stamp(a.at),answeredAt:stamp(a.answeredAt)||stamp(a.at),unit:q.unit,question:q.id,level:q.level,form:q.form,responses:choices,
  correct:choices[choices.length-1]===q.answer,firstCorrect:choices[0]===q.answer,helped:!!a.helped,guess:!!a.guess,repeated:!!a.repeated,
  explanation:String(a.explanation||'').slice(0,6000),strokes:ink(a.strokes)};
}
function record(c,a){
 const x=cleanAttempt(a);if(!x)return null;
 const old=c.attempts.find(v=>v.id===x.id);
 if(old&&(old.question!==x.question||old.responses.some((v,i)=>x.responses[i]!==v)||x.responses.length<old.responses.length))return old;
 x.helped=x.helped||!!old?.helped;x.guess=x.guess||!!old?.guess;
 x.repeated=x.repeated||!!old?.repeated||c.attempts.some(v=>v.question===x.question&&v.id!==x.id);
 // Once support or a wrong first answer is recorded, later edits cannot turn it into independence.
 x.independent=x.firstCorrect&&x.correct&&!x.helped&&!x.guess;
 if(old)c.attempts[c.attempts.indexOf(old)]=x;else c.attempts.push(x);
 c.attempts=c.attempts.slice(-3000);return x;
}
function validate(raw){
 const c=fresh();if(!raw)return c;if(raw.version!==1||!Array.isArray(raw.attempts)||raw.attempts.length>3000)throw Error('Invalid classroom backup');
 for(const u of D.units){const v=raw.lessons?.[u.id];if(!v)continue;const l=lesson(c,u.id);
  l.page=Math.min(u.pages.length-1,Math.max(0,Math.trunc(v.page)||0));l.visited=[...new Set((Array.isArray(v.visited)?v.visited:[]).filter(n=>Number.isInteger(n)&&n>=0&&n<u.pages.length))];
  l.completedAt=l.visited.length===u.pages.length?stamp(v.completedAt):0;l.updatedAt=stamp(v.updatedAt);l.notes=String(v.notes||'').slice(0,6000);l.strokes=ink(v.strokes);
  const q=question(v.draft?.question);if(q?.unit===u.id&&typeof v.draft.id==='string')l.draft={id:v.draft.id.slice(0,120),question:q.id,at:stamp(v.draft.at),helped:!!v.draft.helped,guess:!!v.draft.guess,notes:String(v.draft.notes||'').slice(0,6000),strokes:ink(v.draft.strokes)};
 }
 for(const a of raw.attempts.slice().sort((a,b)=>(a?.at||0)-(b?.at||0)))record(c,a);
 for(const s of ['maths','science'])if(unit(raw.lastUnit?.[s])?.subject===s)c.lastUnit[s]=raw.lastUnit[s];
 return c;
}
function merge(a,b){
 a=validate(a);b=validate(b);const c=fresh();
 for(const u of D.units){const x=a.lessons[u.id],y=b.lessons[u.id];if(!x&&!y)continue;
  const chosen=!x?y:!y?x:y.updatedAt>x.updatedAt?y:x;
  c.lessons[u.id]={...chosen,visited:[...new Set([...(x?.visited||[]),...(y?.visited||[])])].sort((a,b)=>a-b),completedAt:Math.max(x?.completedAt||0,y?.completedAt||0)};
  if(x?.draft&&y?.draft&&x.draft.id===y.draft.id)c.lessons[u.id].draft={...chosen.draft,helped:x.draft.helped||y.draft.helped,guess:x.draft.guess||y.draft.guess};
 }
 const map=new Map();for(const x of [...a.attempts,...b.attempts]){const p=map.get(x.id);if(!p)map.set(x.id,x);else {const selected=x.responses.length>p.responses.length?x:p;map.set(x.id,{...selected,helped:x.helped||p.helped,guess:x.guess||p.guess,repeated:x.repeated||p.repeated});}}
 for(const x of [...map.values()].sort((a,b)=>a.at-b.at))record(c,x);
 for(const s of ['maths','science'])c.lastUnit[s]=D.units.filter(u=>u.subject===s&&c.lessons[u.id]).sort((x,y)=>c.lessons[y.id].updatedAt-c.lessons[x.id].updatedAt)[0]?.id||c.lastUnit[s];
 return c;
}
function evidence(c,id,now=Date.now()){
 const all=c.attempts.filter(a=>a.unit===id),last=all.at(-1);let level=1,proof=new Set(),misses=0,lastLowered=0;
 for(const a of all){
  if(a.level!==level)continue;
  if(!a.firstCorrect){proof.clear();misses++;if(misses>=2){level=Math.max(1,level-1);misses=0;lastLowered=a.at;}continue;}
  if(!a.independent)continue;
  const previous=all.filter(x=>x.question===a.question&&x.at<a.at).at(-1);
  // Familiar retrieval is only usable after a full day and is never labelled novel transfer.
  const spaced=!previous||a.at-previous.at>=DAY;
  if(spaced&&a.at>=lastLowered){proof.add(a.form);misses=0;}
  if(proof.size>=2&&level<3){level++;proof.clear();}
 }
 const firstTime=all.filter(a=>a.independent&&!a.repeated),independentDays=new Set(all.filter(a=>a.independent).map(a=>new Date(a.at).toISOString().slice(0,10))).size;
 const lastDay=last?Math.floor(last.at/DAY):-1;
 const successfulDays=new Set(all.filter(a=>a.independent).map(a=>Math.floor(a.at/DAY))).size;
 const delay=last&&!last.independent?1:[1,1,3,7,14][Math.min(successfulDays,4)];
 const due=last?last.at+delay*DAY:0;
 return {unit:id,level,label:['','Understand','Apply','Connect'][level],taught:!!c.lessons[id]?.completedAt,attempts:all.length,newIndependent:firstTime.length,familiarIndependent:all.filter(a=>a.independent&&a.repeated).length,
  supported:all.filter(a=>!a.independent).length,independentDays,due,overdue:!!due&&now>=due,
  revisit:!!last&&!last.firstCorrect,needsTeaching:all.length>=2&&all.slice(-2).every(a=>!a.firstCorrect),lastDay,
  status:!all.length?'Not checked':all.slice(-2).some(a=>!a.firstCorrect)?'Revisit the explanation':firstTime.some(a=>a.level===3)&&independentDays>=2?'Some delayed and transfer evidence':'Building evidence'};
}
function choose(c,id,now=Date.now()){
 const l=lesson(c,id),e=evidence(c,id,now);if(!l.completedAt)return {kind:'teach',reason:'Explore the teaching sections before independent practice.'};
 if(l.draft){const a=c.attempts.find(a=>a.id===l.draft.id);if(!a?.correct)return {kind:'question',q:question(l.draft.question),draft:l.draft,reason:'Continue your saved attempt.'};}
 const bank=D.questions.filter(q=>q.unit===id&&q.level===e.level);
 const unseen=bank.filter(q=>!c.attempts.some(a=>a.question===q.id));
 if(unseen.length)return {kind:'question',q:unseen[0],reason:e.revisit?'A different check at this level after revisiting the teaching.':e.level>1?'Two different unassisted checks support this next level.':'Check the meaning before applying it.'};
 const eligible=bank.map(q=>({q,last:c.attempts.filter(a=>a.question===q.id).at(-1)})).filter(x=>x.last&&now-x.last.at>=DAY).sort((a,b)=>a.last.at-b.last.at);
 if(eligible.length)return {kind:'question',q:eligible[0].q,repeated:true,reason:'Delayed retrieval of a familiar question. Explain it without reopening the lesson; this is not a new transfer item.'};
 return {kind:'review',reason:'You have used the fresh checks at this level. Revisit the explanation and return tomorrow for retrieval. Use additional unfamiliar work with a parent or teacher to check transfer.'};
}
function recommend(c,subject,now=Date.now()){
 const list=D.units.filter(u=>u.subject===subject),due=list.filter(u=>evidence(c,u.id,now).overdue);
 if(due.length)return {unit:due.sort((a,b)=>evidence(c,a.id,now).due-evidence(c,b.id,now).due)[0],reason:'A short delayed review is due.'};
 const started=list.find(u=>c.lessons[u.id]&&!c.lessons[u.id].completedAt);
 const next=started||list.find(u=>!c.lessons[u.id]?.completedAt)||list[0];return {unit:next,reason:started?'Continue the lesson you started.':'Learn the next idea, then check your understanding.'};
}
function report(c,now=Date.now()){return {version:D.version,reviewedOn:D.reviewedOn,units:D.units.map(u=>({...evidence(c,u.id,now),title:u.title,subject:u.subject,pagesVisited:c.lessons[u.id]?.visited.length||0,pagesTotal:u.pages.length})),limits:['Lesson completion records exposure, not verified understanding.','Checks are original, uncalibrated and finite; question levels are teaching heuristics, not exam grades.','Familiar retrieval is separate from new independent answers. Free explanations and handwriting require human review.']};}
root.MochiCourse={data:D,unit,question,fresh,init,lesson,visit,complete,record,validate,merge,evidence,choose,recommend,report,ink};
if(typeof module!=='undefined')module.exports=root.MochiCourse;
})(typeof globalThis!=='undefined'?globalThis:this);
