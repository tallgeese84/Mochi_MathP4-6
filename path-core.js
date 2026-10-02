/* Shared study/assessment state machine. Subject content and state keys are injected.
   Derived from the tested maths pathway; no learner data is built into this engine. */
(function(root){
'use strict';
function create(D,B,options={}){
const stateKey=options.stateKey||'entrance',prefix=options.prefix||'entrance-';
const AMAX=B.answerLimit||180,REV=Number.isInteger(B.REV)&&B.REV>=1?B.REV:1,revOf=v=>Number.isInteger(v?.rev)&&v.rev>=1?Math.min(v.rev,REV):1,DAY=86400000,unit=id=>D.units.find(u=>u.id===id),stamp=n=>Number.isFinite(n)&&n>0&&n<8640000000000000?n:0;
const text=(s,n=6000)=>typeof s==='string'?s.slice(0,n):'',copy=x=>JSON.parse(JSON.stringify(x));
const uid=()=>root.crypto?.randomUUID?.()||Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
const ink=raw=>(Array.isArray(raw)?raw:[]).slice(-60).map(s=>(Array.isArray(s)?s:[]).slice(0,300).filter(p=>Array.isArray(p)&&p.length===2&&p.every(Number.isFinite)).map(p=>p.map(n=>Math.round(Math.max(0,Math.min(1,n))*10000)/10000))).filter(s=>s.length);
// Review gaps grow after each successful delayed recall; units missed repeatedly are set aside briefly.
const GAPS=[7,14,30,60,90],MIXED_SIZE=options.mixedSize||3,PARK_MISSES=4,PARK_DAYS=3,REDO_DAYS=3,TAGS=['misread','method','calculation','time','unsure'];
const dayKey=t=>{const x=new Date(t);return x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0');};
const DEFAULT_TEST=options.testDate||D.testDate||'2027-07-03',isDate=v=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&Number.isFinite(Date.parse(v+'T00:00:00'));
const safeId=v=>typeof v==='string'&&v.length>0&&v.length<=120&&!['__proto__','constructor','prototype'].includes(v);
const fresh=()=>({version:1,goalMonth:D.goalMonth,target:D.target,lessons:{},attempts:[],seen:{},papers:{},draft:null,reviews:{},external:[],mixed:null,mixedLog:[],errors:{},testDate:'',testDateAt:0,wide:{facts:{},investigations:{}}});
function init(s){return s[stateKey]||(s[stateKey]=fresh());}
function identity(v){return !!(v&&unit(v.unit)&&Number.isInteger(v.form)&&v.form>=0&&v.form<=3&&Number.isSafeInteger(v.seed)&&v.seed>=0&&v.seed<=4294967295);}
function question(v){if(!identity(v))throw Error('Unknown entrance question');return B.make(v.unit,v.form,v.seed,revOf(v));}
function lesson(d,id){if(!unit(id))throw Error('Unknown teaching unit');return d.lessons[id]||(d.lessons[id]={visited:[],page:0,completedAt:0,lastViewedAt:0,updatedAt:0,conceptChoice:-1,conceptResponses:[],discoveryPrediction:-1,discoveryEvidence:-1,notes:''});}
function visit(d,id,page=0,now=Date.now()){const l=lesson(d,id);l.page=Math.max(0,Math.min(2,Math.trunc(page)||0));l.visited=[...new Set([...l.visited,l.page])];l.lastViewedAt=l.updatedAt=now;return l;}
function concept(d,id,choice,now=Date.now()){const l=lesson(d,id),c=unit(id).check;if(!Number.isInteger(choice)||choice<0||choice>=c[1].length)return false;l.conceptChoice=choice;l.conceptResponses.push({choice,at:now});l.conceptResponses=l.conceptResponses.slice(-12);l.updatedAt=now;return choice===c[2];}
function complete(d,id,now=Date.now()){const l=lesson(d,id);if(l.visited.length<3||l.conceptChoice!==unit(id).check[2])return false;l.completedAt=l.completedAt||now;l.updatedAt=now;return true;}
const PHASES=['guided','apply','transfer','recall','mixed','redo'];
function cleanDraft(v){if(!identity(v)||v.form===3&&v.phase!=='redo'||!text(v.id,120)||!stamp(v.at))return null;return {id:text(v.id,120),unit:v.unit,form:v.form,seed:v.seed,rev:revOf(v),exhausted:!!v.exhausted,mixedId:text(v.mixedId,120),redoOf:text(v.redoOf,120),at:v.at,updatedAt:stamp(v.updatedAt)||v.at,phase:PHASES.includes(v.phase)?v.phase:'apply',helped:!!v.helped,revealed:!!v.revealed,guess:!!v.guess,seenBefore:!!v.seenBefore,lessonViewedAt:stamp(v.lessonViewedAt),recallOf:text(v.recallOf,120),answer:text(v.answer,AMAX),working:text(v.working),strokes:ink(v.strokes)};}
function cleanAttempt(a){
 if(!identity(a)||!text(a.id,120)||!stamp(a.at))return null;const q=question(a),mode=['practice','baseline','paper','mock'].includes(a.mode)?a.mode:'practice';
 const responses=(Array.isArray(a.responses)?a.responses:[]).slice(0,12).filter(x=>stamp(x.at)).map(x=>({at:stamp(x.at),answer:text(x.answer,AMAX),working:text(x.working),strokes:ink(x.strokes)}));
 if(!responses.length)return null;const final=responses.at(-1),skipped=!final.answer.trim(),firstCorrect=B.mark(q,responses[0].answer)&&!a.conflicted,correct=B.mark(q,final.answer);
 const helped=!!a.helped||a.phase==='guided'||mode==='practice'&&a.form===0;
 return {id:text(a.id,120),unit:a.unit,form:a.form,seed:a.seed,rev:revOf(a),exhausted:!!a.exhausted,mixedId:text(a.mixedId,120),redoOf:text(a.redoOf,120),fingerprint:q.fingerprint,at:a.at,updatedAt:stamp(a.updatedAt)||final.at,answeredAt:final.at,mode,paperId:text(a.paperId,40),phase:[...PHASES,'paper','baseline','mock'].includes(a.phase)?a.phase:'apply',responses,helped,revealed:!!a.revealed,guess:!!a.guess,seenBefore:!!a.seenBefore,conflicted:!!a.conflicted,lessonViewedAt:stamp(a.lessonViewedAt),recallOf:text(a.recallOf,120),skipped,firstCorrect,correct,reflection:text(a.reflection),reflectionInk:ink(a.reflectionInk),reflectionAt:stamp(a.reflectionAt),independent:!!(correct&&firstCorrect&&!helped&&!a.revealed&&!a.guess&&!skipped&&!a.conflicted),question:q.text,...(B.parts?{components:B.parts(q,final.answer),firstComponents:B.parts(q,responses[0].answer)}:{})};
}
function combineAttempts(a,b){
 if(a.unit!==b.unit||a.form!==b.form||a.seed!==b.seed||revOf(a)!==revOf(b))return {...a,conflicted:true};
 const prefix=(x,y)=>x.responses.every((v,i)=>y.responses[i]?.answer===v.answer&&y.responses[i]?.at===v.at);
 const extendsA=prefix(a,b),extendsB=prefix(b,a),win=extendsA?b:extendsB?a:(b.updatedAt>a.updatedAt?b:b.updatedAt<a.updatedAt?a:JSON.stringify(b)>JSON.stringify(a)?b:a);
 const reflected=(b.reflectionAt||0)>(a.reflectionAt||0)?b:a;
 return {...win,reflection:reflected.reflection,reflectionInk:reflected.reflectionInk,reflectionAt:reflected.reflectionAt,helped:a.helped||b.helped,revealed:a.revealed||b.revealed,guess:a.guess||b.guess,seenBefore:a.seenBefore||b.seenBefore,exhausted:!!(a.exhausted&&b.exhausted),conflicted:a.conflicted||b.conflicted||!extendsA&&!extendsB,lessonViewedAt:Math.max(a.lessonViewedAt||0,b.lessonViewedAt||0)};
}
function record(d,raw){let a=cleanAttempt(raw);if(!a)return null;const index=d.attempts.findIndex(x=>x.id===a.id);if(index>=0)a=cleanAttempt(combineAttempts(d.attempts[index],a));else a.seenBefore=a.seenBefore||d.attempts.some(x=>x.fingerprint===a.fingerprint);if(index>=0)d.attempts[index]=a;else d.attempts.push(a);d.attempts=d.attempts.slice(-5000);return a;}
function evidence(d,id,now=Date.now()){
 const all=d.attempts.filter(a=>a.unit===id&&a.mode==='practice'&&a.answeredAt<=now),answered=all.filter(a=>!a.skipped),eligible=answered.filter(a=>a.independent&&(!a.seenBefore||a.exhausted)&&a.phase!=='redo'),last=answered.at(-1),forms=new Set(eligible.map(a=>a.form));
 // Independent, unassisted answers on starting checks and timed papers also count: a starting check
 // shows application; a paper or mock question (form 3) shows transfer, so a known method is not re-taught.
 const credit=d.attempts.filter(a=>a.unit===id&&['baseline','paper','mock'].includes(a.mode)&&a.independent&&a.answeredAt<=now),checkApply=credit.filter(a=>a.mode==='baseline'&&a.form===1),paperTransfer=credit.filter(a=>a.form===3);
 const apply=[...eligible.filter(a=>a.form===1),...checkApply],transfer=[...eligible.filter(a=>a.form===2),...paperTransfer];
 const recall=answered.filter(a=>(a.phase==='recall'||a.phase==='mixed')&&a.independent&&a.recallOf&&a.at>=(d.attempts.find(x=>x.id===a.recallOf)?.answeredAt||Infinity)+7*DAY&&a.at>=a.lessonViewedAt+7*DAY);
 const success=[...answered.filter(a=>a.independent&&a.form>=1&&a.phase!=='redo'),...credit].sort((a,b)=>a.answeredAt-b.answeredAt).at(-1),gap=GAPS[Math.min(recall.length,GAPS.length-1)],due=transfer.length&&success?success.answeredAt+gap*DAY:0;
 const recent=answered.filter(a=>a.phase!=='redo');
 const needsTeaching=recent.length>=2&&recent.slice(-2).every(a=>!a.firstCorrect)&&((d.lessons[id]?.lastViewedAt||0)<recent.at(-1).answeredAt);
 const taught=!!d.lessons[id]?.completedAt||paperTransfer.length>0;
 // Set a unit aside for a few days after repeated misses at its current step, so one stuck method never blocks the path.
 const need=apply.length<2?1:!transfer.length?2:0,lastWin=need?answered.filter(a=>a.form===need&&a.independent).at(-1)?.answeredAt||0:0,misses=need?recent.filter(a=>a.form===need&&a.phase!=='mixed'&&!a.firstCorrect&&a.answeredAt>lastWin):[];
 const parkedUntil=taught&&misses.length>=PARK_MISSES?misses.at(-1).answeredAt+PARK_DAYS*DAY:0;
 let stage=!taught?'Learn':apply.length<2?'Apply':!transfer.length?'Connect':!recall.length?'Revisit after a week':'Mixed-paper practice';
 const firstTransfer=transfer.map(a=>a.answeredAt).sort((a,b)=>a-b)[0]||0;
 return {id,title:unit(id).title,strand:unit(id).strand,stage,taught,attempts:answered.length,supported:answered.filter(a=>a.correct&&!a.independent).length,independent:eligible.length,apply:apply.length,transfer:transfer.length,credited:checkApply.length+paperTransfer.length,forms:forms.size,delayed:recall.length,due,gap,overdue:!!due&&now>=due,needsTeaching,parked:now<parkedUntil,parkedUntil,firstTransfer,last:last?.answeredAt||0,lastSuccess:success?.id||'',reviewed:answered.filter(a=>d.reviews[a.id]?.verdict==='valid').length};
}
const legacyMap={gst:'percent',percentWhole:'percent',repeatedRemainder:'remainders',workingBackwards:'remainders',cubeEdge:'volume',systematicCounting:'counting',rectanglesInGrid:'counting',factorsMultiples:'factors',constrainedDigits:'digits',areaTriangle:'area'};
function bridge(s,d){if(options.bridge)return options.bridge(s,d);const groups=new Map();for(const a of s.learning?.attempts||[]){const id=legacyMap[a.generator];if(!id||a.skipped||!a.tries)continue;if(!groups.has(a.generator))groups.set(a.generator,[]);groups.get(a.generator).push(a);}return [...groups.values()].filter(a=>a.length>=2&&a.slice(-2).every(x=>!x.firstCorrect)).map(a=>({unit:legacyMap[a[0].generator],at:a.at(-1).answeredAt||a.at(-1).at})).filter(x=>!d.lessons[x.unit]?.completedAt&&(!d.lessons[x.unit]?.lastViewedAt||d.lessons[x.unit].lastViewedAt<x.at)).sort((a,b)=>b.at-a.at)[0]||null;}
function setsToday(d,now){const k=dayKey(now);return (d.mixedLog||[]).filter(x=>x.completedAt&&dayKey(x.completedAt)===k).length;}
function setsRecently(d,now){const k=[dayKey(now),dayKey(now-DAY),dayKey(now-2*DAY)];return (d.mixedLog||[]).filter(x=>x.completedAt&&k.includes(dayKey(x.completedAt))).length;}
function redosToday(d,now){const k=dayKey(now);return d.attempts.filter(a=>a.phase==='redo'&&dayKey(a.answeredAt)===k).length;}
function recommend(s,now=Date.now()){
 const d=init(s),draft=d.draft,unfinished=Object.values(d.papers).find(p=>!p.submittedAt);
 if(unfinished)return {kind:'paper',paper:unfinished.id,reason:'Continue your paper. The time limit has not changed.'};
 if(draft)return {kind:'resume',unit:draft.unit,reason:'Continue your saved question.'};
 const rows=D.units.map(u=>evidence(d,u.id,now)),repair=rows.filter(e=>e.needsTeaching&&!e.parked).sort((a,b)=>b.last-a.last)[0];if(repair)return {kind:'learn',unit:repair.id,repair:true,reason:'Go through the lesson again before you try more questions.'};
 const old=bridge(s,d);if(old)return {kind:'learn',unit:old.unit,reason:'Go through this topic first. It will help with the questions that follow.'};
 if(d.mixed&&!d.mixed.completedAt&&mixedNext(d))return {kind:'mixed-set',reason:'Finish your mixed practice. Decide which method to use for each question.'};
 const ready=rows.filter(e=>e.taught&&e.apply>=1),due=rows.filter(e=>e.overdue),sets=setsToday(d,now);
 // Due reviews come back as one short unlabelled mixed set a day (due methods first), so new learning keeps moving.
 // On days with nothing due, a warm-up set runs every third day.
 if(due.length&&ready.length<2&&!sets)return {kind:'recall',unit:due.sort((a,b)=>a.due-b.due)[0].id,reason:'Revise this topic. Try the question without looking at the lesson.'};
 if(due.length&&ready.length>=2&&!sets)return {kind:'mixed-set',due:due.length,reason:'Revise topics you have learnt. The questions are from different topics, so decide which method to use.'};
 if(!setsRecently(d,now)&&ready.length>=3)return {kind:'mixed-set',reason:'Warm up with mixed practice. Decide which method to use for each question.'};
 const redo=dueRedo(d,now);if(redo&&!redosToday(d,now))return {kind:'redo',attempt:redo.id,unit:redo.unit,reason:'Try again a question you got wrong a few days ago.'};
 const started=rows.find(e=>e.taught&&!e.parked&&e.stage!=='Revisit after a week'&&e.stage!=='Mixed-paper practice');if(started)return {kind:'practice',unit:started.id,reason:started.stage==='Apply'?'Solve two questions on your own.':'Try a challenge question without help.'};
 const next=D.units.find(u=>!rows.find(e=>e.id===u.id).taught&&u.prerequisites.every(p=>evidence(d,p,now).apply>=1))||D.units.find(u=>!rows.find(e=>e.id===u.id).taught);
 if(next)return {kind:'learn',unit:next.id,reason:'Learn a new topic. Study the worked example, then try a question on your own.'};
 const parked=rows.filter(e=>e.parked).sort((a,b)=>a.parkedUntil-b.parkedUntil)[0];if(parked)return {kind:'practice',unit:parked.id,reason:'Try this topic again. It was put aside for a few days.'};
 return {kind:'mixed',reason:'You have learnt every topic. Try a paper, then go through your working with a grown-up.'};
}
function freshSeed(d,id,form,rev=REV){let value=Math.floor(Math.random()*4294967296),q=B.make(id,form,value,rev);for(let tries=0;tries<64&&d.seen[q.fingerprint];tries++){value=(value+1)>>>0;q=B.make(id,form,value,rev);}return value;}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
/* A mixed set: up to four questions from methods she has already learned, due reviews first,
   shown with no topic title or method hint. */
function startMixed(d,now=Date.now()){
 if(d.mixed&&!d.mixed.completedAt&&mixedNext(d))return d.mixed;
 const rows=D.units.map(u=>evidence(d,u.id,now)),ready=rows.filter(e=>e.taught&&e.apply>=1);if(ready.length<2)return null;
 // Two questions, or three when several methods are due: reviews stay about a third of a typical day.
 const overdue=ready.filter(e=>e.overdue),size=overdue.length>=2?MIXED_SIZE:Math.min(2,MIXED_SIZE),due=overdue.sort((a,b)=>a.due-b.due).slice(0,size),rest=shuffle(ready.filter(e=>!due.includes(e)).sort((a,b)=>a.last-b.last).slice(0,8));
 const chosen=[...due,...rest].slice(0,size),items=shuffle(chosen.map(e=>{const form=e.overdue?(e.delayed%2?2:1):(e.transfer?2:1);return {unit:e.id,form,seed:freshSeed(d,e.id,form),recall:!!e.overdue};}));
 d.mixed={id:prefix+'mix-'+uid(),at:now,items,completedAt:0};d.mixedLog=[...(d.mixedLog||[]),{id:d.mixed.id,at:now,completedAt:0}].slice(-120);return d.mixed;
}
function mixedNext(d){const m=d.mixed;if(!m)return null;for(const [index,it] of m.items.entries()){const done=d.attempts.some(a=>a.mixedId===m.id&&a.unit===it.unit&&a.seed===it.seed&&a.form===it.form&&(a.correct||a.responses.length>=2||a.revealed));if(!done)return {...it,index,total:m.items.length};}return null;}
function closeMixed(d,now=Date.now()){const m=d.mixed;if(!m||m.completedAt||mixedNext(d))return false;m.completedAt=now;const log=(d.mixedLog||[]).find(x=>x.id===m.id);if(log)log.completedAt=now;else d.mixedLog.push({id:m.id,at:m.at,completedAt:now});return true;}
function startMixedItem(d,now=Date.now()){
 const m=startMixed(d,now);if(!m)return null;const it=mixedNext(d);if(!it){closeMixed(d,now);return null;}
 if(d.draft&&d.draft.mixedId===m.id&&d.draft.unit===it.unit&&d.draft.seed===it.seed)return d.draft;
 return startPractice(d,it.unit,{phase:'mixed',form:it.form,seed:it.seed,mixedId:m.id,recall:it.recall,now,force:true});
}
/* Error log: every first-answer miss outside guided practice, with an optional reason tag.
   A missed question comes back unchanged a few days later; a first-try success clears it. */
function errorLog(d,now=Date.now(),days=120){
 return d.attempts.filter(a=>!a.skipped&&!a.firstCorrect&&!['redo','guided','baseline'].includes(a.phase)&&a.answeredAt>=now-days*DAY&&a.answeredAt<=now).map(a=>{const e=d.errors[a.id]||{};return {id:a.id,unit:a.unit,strand:unit(a.unit).strand,title:unit(a.unit).title,form:a.form,mode:a.mode,phase:a.phase,at:a.answeredAt,question:a.question,answer:a.responses[0].answer,correctLater:a.correct,tag:e.tag||'',redoneAt:e.redoneAt||0,lastTry:e.lastTry||0};}).reverse();
}
function tagError(d,id,tag,now=Date.now()){if(!safeId(id)||!d.attempts.some(a=>a.id===id)||!TAGS.includes(tag))return false;d.errors[id]={...(d.errors[id]||{}),tag,at:now};return true;}
function dueRedo(d,now=Date.now()){return errorLog(d,now,60).filter(e=>!e.redoneAt&&d.lessons[e.unit]?.completedAt&&now>=Math.max(e.at,e.lastTry)+REDO_DAYS*DAY).sort((a,b)=>a.at-b.at)[0]||null;}
function startRedo(d,id,now=Date.now()){const a=d.attempts.find(x=>x.id===id);if(!a)return null;return startPractice(d,a.unit,{phase:'redo',form:a.form,seed:a.seed,rev:revOf(a),redoOf:a.id,now,force:true});}
function startPractice(d,id,{phase,seed,form,rev,mixedId='',recall=false,redoOf='',now=Date.now(),force=false}={}){
 if(d.draft&&!force)return d.draft;const e=evidence(d,id,now),l=lesson(d,id);
 phase=phase||(!l.completedAt&&!e.taught?'guided':e.overdue?'recall':e.apply<2?'apply':'transfer');
 if(!PHASES.includes(phase))throw Error('Unsupported practice phase');
 if(!(phase==='mixed'||phase==='redo')||!Number.isInteger(form))form=phase==='guided'?0:phase==='apply'?1:phase==='transfer'?2:(e.delayed%2?2:1);
 rev=phase==='redo'&&Number.isInteger(rev)?Math.min(Math.max(rev,1),REV):REV;
 let value=seed??Math.floor(Math.random()*4294967296),q=B.make(id,form,value,rev),exhausted=false;
 if(d.seen[q.fingerprint]&&!['recall','mixed','redo'].includes(phase)){
  // Look further for an unseen variant. If this form's pool is used up, reuse the one seen longest ago and
  // let it count (flagged), so a small question pool can never trap the path.
  let best=value,bestAt=d.seen[q.fingerprint];
  for(let tries=0;tries<400&&d.seen[q.fingerprint];tries++){value=(value+1)>>>0;q=B.make(id,form,value,rev);if(d.seen[q.fingerprint]&&d.seen[q.fingerprint]<bestAt){best=value;bestAt=d.seen[q.fingerprint];}}
  if(d.seen[q.fingerprint]){value=best;q=B.make(id,form,value,rev);exhausted=true;}
 }
 const seenBefore=!!d.seen[q.fingerprint];d.seen[q.fingerprint]=d.seen[q.fingerprint]||now;
 const recallOf=phase==='recall'||phase==='mixed'&&recall?e.lastSuccess:'';
 d.draft={id:prefix+uid(),unit:id,form,seed:value,rev,exhausted,mixedId:phase==='mixed'?text(mixedId,120):'',redoOf:phase==='redo'?text(redoOf,120):'',at:now,updatedAt:now,phase,helped:phase==='guided',revealed:false,guess:false,seenBefore,lessonViewedAt:l.lastViewedAt||0,recallOf,answer:'',working:'',strokes:[]};return d.draft;
}
function touchDraft(d,fields,now=Date.now()){if(!d.draft)return;Object.assign(d.draft,{answer:text(fields.answer??d.draft.answer,AMAX),working:text(fields.working??d.draft.working),strokes:ink(fields.strokes??d.draft.strokes),guess:d.draft.guess||!!fields.guess,updatedAt:now});}
function help(d,reveal=false,now=Date.now()){if(!d.draft||d.attempts.find(a=>a.id===d.draft.id)?.correct)return;d.draft.helped=true;d.draft.revealed=d.draft.revealed||reveal;d.draft.updatedAt=now;const a=d.attempts.find(a=>a.id===d.draft.id);if(a)record(d,{...a,helped:true,revealed:a.revealed||reveal,updatedAt:now});}
function respond(d,now=Date.now()){
 const v=d.draft;if(!v)return {ok:false};const q=question(v),old=d.attempts.find(x=>x.id===v.id);if(old?.correct)return {ok:true,attempt:old,already:true};
 if(!v.answer.trim())return {ok:false,reason:'Enter an answer first.'};
 if(B.validAnswer&&!B.validAnswer(q,v.answer))return {ok:false,reason:B.invalidReason?.(q,v.answer)||'Select a conclusion (or every statement) and a reason before checking. This incomplete response has not been counted as an error.'};
 if(typeof q.answer!=='string'&&!B.parse(v.answer,q.suffix))return {ok:false,reason:'Check the format of your answer. Use a number, a fraction or an answer in terms of π. This is not counted as a mistake.'};
 // On new-twist and mixed questions, a one-line plan comes before the first check (not counted as a mistake).
 if(options.requireMethod&&['transfer','mixed'].includes(v.phase)&&!old&&v.working.trim().length<6&&!v.strokes.length)return {ok:false,method:true,reason:'Write your plan in one sentence before you check, for example “Work backwards from the end.” This is not counted as a mistake.'};
 const previous=old?.responses.at(-1);
 if(previous&&previous.answer.trim()===v.answer.trim()&&(previous.working||'')===v.working&&JSON.stringify(previous.strokes||[])===JSON.stringify(v.strokes))return {ok:false,duplicate:true,reason:'You have already given this answer. Change your answer or add a new step to your working. No extra mistake is counted.'};
 if(old?.responses.length>=12)return {ok:false,reason:'Study the worked example, then try a new question.'};
 const responses=[...(old?.responses||[]),{at:now,answer:v.answer,working:v.working,strokes:copy(v.strokes)}];
 const a=record(d,{...v,mode:'practice',updatedAt:now,responses});
 if(v.phase==='redo'&&safeId(v.redoOf)){const e=d.errors[v.redoOf]||{};d.errors[v.redoOf]={...e,lastTry:now,redoneAt:a.firstCorrect?now:e.redoneAt||0};}
 if(v.phase==='mixed'&&d.mixed?.id===v.mixedId)closeMixed(d,now);
 return {ok:true,attempt:a,needsLesson:!a.correct&&a.responses.length>=2&&v.phase!=='mixed'&&v.phase!=='redo',mixedNext:v.phase==='mixed'&&(a.correct||a.responses.length>=2)};
}
function finishPractice(d){d.draft=null;}
const paperDefinitions=options.paperDefinitions||[
 // The original checks and papers are frozen at bank revision 1 so past results never change.
 {id:'baseline-a',kind:'baseline',rev:1,title:'Starting-point check · A',minutes:0,units:['relationships','percent','area','volume','counting','factors']},
 {id:'baseline-b',kind:'baseline',rev:1,title:'Starting-point check · B',minutes:0,units:['remainders','simultaneous','motion','spatial','cycles','cases']},
 ...['A','B','C'].map(letter=>({id:'mixed-'+letter.toLowerCase(),kind:'paper',rev:1,title:'Mixed reasoning paper '+letter,minutes:75,units:D.units.filter(u=>!u.bridge&&!u.extension).map(u=>u.id)})),
 ...mathsMocks()
];
/* DSA-style mocks, modelled on reported formats: about 90 minutes, no calculator, whole-number answers,
   questions in rising order of difficulty worth 1–4 marks (55 marks). Each mock draws a different mix. */
function mathsMocks(){
 const core=D.units.filter(u=>!u.bridge&&!u.extension).map(u=>u.id),bridges=D.units.filter(u=>u.bridge).map(u=>u.id),ext=D.units.filter(u=>u.extension).map(u=>u.id);
 if(core.length<24||bridges.length<3||ext.length<9)return [];
 const perm=(list,salt)=>list.map(id=>[parseInt(B.hash(salt+':'+id),36),id]).sort((a,b)=>a[0]-b[0]||(a[1]<b[1]?-1:1)).map(x=>x[1]);
 return [25,21,17,12,8,4].map((weeks,k)=>{const c=perm(core,'mock-core-'+Math.floor(k/2)).slice((k%2)*12,(k%2)*12+12),b=perm(bridges,'mock-bridge-'+k).slice(0,3),x=perm(ext,'mock-ext-'+k).slice(0,9);
  const cAll=perm(core,'mock-core-'+Math.floor(k/2)),xAll=perm(ext,'mock-ext-'+k);
  return {id:'mock-'+(k+1),kind:'mock',rev:REV,title:'DSA-style mock '+(k+1),minutes:90,weeks,units:[...c,...b,...x],spares:[...Array(12).fill(cAll.filter(u=>!c.includes(u))),...Array(3).fill(perm(bridges,'mock-bridge-'+k).slice(3)),...Array(9).fill(xAll.slice(9))],marks:[...Array(6).fill(1),...Array(9).fill(2),...Array(5).fill(3),...Array(4).fill(4)]};});
}
const paperCache=new Map();
function paperQuestions(id){
 if(paperCache.has(id))return paperCache.get(id).map(copy);const def=paperDefinitions.find(p=>p.id===id);if(!def)throw Error('Unknown paper');
 // A fixed independent blueprint; prior paper values are excluded from later forms.
 const earlier=new Set();for(const prev of paperDefinitions){if(prev.id===id)break;for(const q of paperQuestions(prev.id))earlier.add(q.fingerprint);}
 const rev=def.rev||REV,used=new Set(def.units),attempt=(unit,form)=>{let seed=parseInt(B.hash((options.fingerprintPrefix||'ep-paper-v1:')+id+':'+unit),36)>>>0,q=B.make(unit,form,seed,rev);for(let k=0;k<200&&earlier.has(q.fingerprint);k++)q=B.make(unit,form,seed=(seed+1)>>>0,rev);return earlier.has(q.fingerprint)?null:q;};
 const list=def.units.map((unit,i)=>{const form=def.kind==='baseline'?1:3;let q=attempt(unit,form);
  // A mock never repeats an earlier question: if a method has run out of unseen variants, a spare method from the same group stands in.
  if(!q&&def.kind==='mock')for(const spare of def.spares?.[i]||[]){if(used.has(spare))continue;q=attempt(spare,form);if(q){used.add(spare);break;}}
  // Then a changed-structure (form 2) question of the same method; only as a last resort a repeat.
  if(!q&&def.kind==='mock')q=attempt(unit,2)||B.make(unit,form,parseInt(B.hash(id+':'+unit),36)>>>0,rev);
  if(!q)throw Error('Paper family has no unseen variant');earlier.add(q.fingerprint);return q;});
 // Mocks keep their rising-difficulty order, as in a real paper.
 if(def.kind==='mock'){paperCache.set(id,list);return list.map(copy);}
 // Mix the strands without exposing a chapter sequence or topic label.
 const order=randomOrder(list.length,parseInt(B.hash(id),36));const shuffled=order.map(i=>list[i]);paperCache.set(id,shuffled);return shuffled.map(copy);
}
function randomOrder(n,seed){const r=(function(){let s=seed>>>0;return ()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};})();const a=Array.from({length:n},(_,i)=>i);for(let i=n-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function startPaper(d,id,now=Date.now()){
 const def=paperDefinitions.find(p=>p.id===id);if(!def)throw Error('Unknown paper');if(d.papers[id])return d.papers[id];
 if(Object.values(d.papers).some(p=>!p.submittedAt))throw Error('Finish the current paper before starting another.');
 const qs=paperQuestions(id),seenBefore=qs.some(q=>!!d.seen[q.fingerprint]);for(const q of qs)d.seen[q.fingerprint]=d.seen[q.fingerprint]||now;
 const p={id,startedAt:now,updatedAt:now,deadline:def.minutes?now+def.minutes*60000:0,submittedAt:0,assisted:false,interrupted:false,conflicted:false,seenBefore,index:0,answers:{},flags:[]};d.papers[id]=p;return p;
}
function savePaperAnswer(d,id,index,fields,now=Date.now()){
 const p=d.papers[id],qs=paperQuestions(id);if(!p||p.submittedAt||index<0||index>=qs.length||!Number.isInteger(index))return false;
 if(p.deadline&&now>p.deadline)return false;
 p.answers[index]={answer:text(fields.answer,AMAX),working:text(fields.working),strokes:ink(fields.strokes),updatedAt:now};p.updatedAt=now;p.index=index;return true;
}
function interruptPaper(d,id,now=Date.now()){const p=d.papers[id];if(!p||p.submittedAt)return;p.interrupted=true;p.assisted=true;p.updatedAt=now;}
function submitPaper(d,id,now=Date.now()){
 const p=d.papers[id],def=paperDefinitions.find(p=>p.id===id);if(!p||!def)return null;if(p.submittedAt)return scorePaper(d,id);
 p.submittedAt=p.updatedAt=now;
 for(const [index,q]of paperQuestions(id).entries()){const v=p.answers[index]||{};record(d,{...q,rev:def.rev||REV,id:`paper:${id}:${index}`,mode:def.kind,paperId:id,phase:def.kind,at:p.startedAt,updatedAt:now,helped:p.assisted||p.interrupted,conflicted:p.conflicted,seenBefore:p.seenBefore,guess:false,responses:[{answer:v.answer||'',working:v.working||'',strokes:v.strokes||[],at:now}]});}
 return scorePaper(d,id);
}
function scorePaper(d,id){
 const p=d.papers[id],def=paperDefinitions.find(x=>x.id===id);if(!p?.submittedAt||!def)return null;const qs=paperQuestions(id),byStrand=Object.fromEntries(Object.keys(D.strands).map(k=>[k,{correct:0,total:0}]));
 let correct=0,marks=0,markTotal=0;const results=qs.map((q,i)=>{const v=p.answers[i]||{},ok=B.mark(q,v.answer||''),m=def.kind==='mock'&&def.marks?.[i]||1;byStrand[q.strand].total++;byStrand[q.strand].correct+=Number(ok);correct+=Number(ok);markTotal+=m;marks+=ok?m:0;return {index:i,unit:q.unit,marks:m,question:q.text,correct:ok,blank:!v.answer?.trim(),answer:v.answer||'',working:v.working||'',strokes:v.strokes||[],reference:q.answerLabel+(q.reasonLabel?' — '+q.reasonLabel:''),steps:q.steps,...(B.parts?{components:B.parts(q,v.answer||''),answerDisplay:B.describe(q,v.answer||''),figure:q.figure}:{})};});
 const percent=100*correct/qs.length,timed=['paper','mock'].includes(def.kind)&&!!p.deadline&&p.submittedAt<=p.deadline+1500,independent=!p.assisted&&!p.interrupted&&!p.conflicted,qualifying=def.kind==='paper'&&percent>=D.target&&timed&&independent&&!p.seenBefore;
 return {id,kind:def.kind,correct,total:qs.length,percent,marks,markTotal,markPercent:100*marks/markTotal,byStrand,timed,independent,unseen:!p.seenBefore,qualifying,results,seconds:Math.round((p.submittedAt-p.startedAt)/1000),status:def.kind==='baseline'?'Starting-point evidence, not a readiness score.':def.kind==='mock'?'DSA-style mock: compare marks over time. It is not an admissions score.':qualifying?'Internal paper target achieved. External calibration is still needed.':!independent?'Supported or interrupted practice paper.':!timed?'Untimed or overtime practice paper.':'Use the results to choose the next lessons.'};
}
function testDate(d){return isDate(d.testDate)?d.testDate:DEFAULT_TEST;}
function setTestDate(d,value,now=Date.now()){if(!isDate(value))return false;d.testDate=value;d.testDateAt=now;return true;}
function mockSchedule(d,now=Date.now()){
 const [y,m,dd]=testDate(d).split('-').map(Number);
 // Calendar arithmetic at local noon, so daylight-saving changes never shift a date.
 return paperDefinitions.filter(p=>p.kind==='mock').map(p=>{const at=new Date(y,m-1,dd-p.weeks*7,12).getTime()-12*3600000,saved=d.papers[p.id],score=saved?.submittedAt?scorePaper(d,p.id):null;return {id:p.id,title:p.title,minutes:p.minutes,date:dayKey(at),at,status:score?'done':saved?'started':now>=at?'due':'upcoming',score:score?{marks:score.marks,markTotal:score.markTotal,percent:score.markPercent,timed:score.timed,independent:score.independent}:null};});
}
function dueMock(d,now=Date.now()){return mockSchedule(d,now).find(m=>m.status==='due')||null;}
/* Pacing against the selection-test date. The last six weeks are kept for full papers and review. */
function plan(d,now=Date.now()){
 const date=testDate(d),t=Date.parse(date+'T00:00:00'),weeksLeft=Math.max(0,Math.ceil((t-now)/(7*DAY))),rows=D.units.map(u=>evidence(d,u.id,now));
 const secure=rows.filter(e=>e.transfer>0).length,remaining=rows.length-secure,studyWeeks=Math.max(1,weeksLeft-6),perWeek=remaining/studyWeeks;
 const recentRate=rows.filter(e=>e.firstTransfer&&e.firstTransfer>=now-28*DAY).length/4,started=d.attempts.some(a=>a.answeredAt<now-28*DAY);
 const status=!remaining?'covered':!started?'starting':recentRate>=perWeek*.9?'on-track':recentRate>=perWeek*.5?'a-little-behind':'behind';
 return {testDate:date,weeksLeft,total:rows.length,secure,remaining,perWeek:Math.round(perWeek*10)/10,recentRate:Math.round(recentRate*10)/10,status,parked:rows.filter(e=>e.parked).map(e=>e.id),due:rows.filter(e=>e.overdue).length,mocks:mockSchedule(d,now)};
}
/* "Did you know?" answers and weekend investigations, kept with the maths record so they sync. */
function answerFact(d,id,choice,correct,now=Date.now()){if(!/^[a-z0-9-]{1,24}$/.test(id)||!Number.isInteger(choice))return false;d.wide=d.wide||{facts:{},investigations:{}};if(!d.wide.facts[id])d.wide.facts[id]={choice,correct:!!correct,at:now};return true;}
function finishInvestigation(d,id,note='',now=Date.now()){if(!/^[a-z0-9-]{1,24}$/.test(id))return false;d.wide=d.wide||{facts:{},investigations:{}};d.wide.investigations[id]={doneAt:d.wide.investigations[id]?.doneAt||now,note:text(note,2000),at:now};return true;}
function review(d,id,verdict,note='',now=Date.now()){if(['__proto__','constructor','prototype'].includes(id)||!d.attempts.some(a=>a.id===id)||!['valid','needs-discussion','unreviewed'].includes(verdict))return false;d.reviews[id]={verdict,note:text(note,1500),at:now};return true;}
function addExternal(d,entry,now=Date.now()){if(!text(entry.name,150)||!Number.isFinite(entry.score)||!Number.isFinite(entry.total)||entry.total<=0||entry.score<0||entry.score>entry.total)throw Error('Enter a named paper and a valid score/total.');d.external.push({id:uid(),name:text(entry.name,150),score:entry.score,total:entry.total,unseen:!!entry.unseen,independent:!!entry.independent,timed:!!entry.timed,at:now});d.external=d.external.slice(-30);}
function report(d,now=Date.now()){
 const units=D.units.map(u=>evidence(d,u.id,now)),papers=paperDefinitions.map(p=>scorePaper(d,p.id)).filter(Boolean),qualifying=papers.filter(p=>p.qualifying),reviewed=d.attempts.filter(a=>d.reviews[a.id]?.verdict==='valid'&&a.independent),reviewedStrands=new Set(reviewed.map(a=>unit(a.unit).strand));
 const external=d.external.filter(x=>x.independent&&x.unseen&&x.timed&&100*x.score/x.total>=D.target),breadth=qualifying.length===3&&Object.keys(D.strands).every(k=>{const total=qualifying.reduce((n,p)=>n+p.byStrand[k].total,0),correct=qualifying.reduce((n,p)=>n+p.byStrand[k].correct,0);return total&&correct/total>=.75;});
 return {goalMonth:d.goalMonth,target:D.target,plan:plan(d,now),errors:errorLog(d,now).slice(0,40),units,papers,qualifyingPapers:qualifying.length,reviewedStrands:reviewedStrands.size,externalChecks:external.length,breadth,internalTarget:qualifying.length===3&&breadth&&reviewedStrands.size===Object.keys(D.strands).length,externalReported:external.length>0,limits:options.limits||['The commercial booklet is a working benchmark, not an official entrance paper.','These original items and time limits are not psychometrically calibrated.','85% on three reserved mixed papers is an internal training goal, not an admissions cutoff.','Independent correctness does not automatically validate written reasoning.','Parent-entered external results and explanation reviews are self-reported.','No school admission probability is calculated.']};
}
function validate(raw){
 const d=fresh();if(!raw)return d;if(raw.version!==1)throw Error('Unsupported entrance-path backup version.');
 for(const u of D.units){const x=raw.lessons?.[u.id];if(!x)continue;const l=lesson(d,u.id);l.page=Math.min(2,Math.max(0,Math.trunc(x.page)||0));l.visited=[...new Set((Array.isArray(x.visited)?x.visited:[]).filter(n=>Number.isInteger(n)&&n>=0&&n<=2))];l.lastViewedAt=stamp(x.lastViewedAt);l.updatedAt=stamp(x.updatedAt);l.notes=text(x.notes);l.discoveryPrediction=Number.isInteger(x.discoveryPrediction)&&x.discoveryPrediction>=-1&&x.discoveryPrediction<8?x.discoveryPrediction:-1;l.discoveryEvidence=Number.isInteger(x.discoveryEvidence)&&x.discoveryEvidence>=-1&&x.discoveryEvidence<8?x.discoveryEvidence:-1;l.conceptChoice=Number.isInteger(x.conceptChoice)&&x.conceptChoice>=0&&x.conceptChoice<3?x.conceptChoice:-1;l.conceptResponses=(Array.isArray(x.conceptResponses)?x.conceptResponses:[]).slice(-12).filter(v=>Number.isInteger(v.choice)&&v.choice>=0&&v.choice<3&&stamp(v.at));l.completedAt=l.visited.length===3?stamp(x.completedAt):0;}
 for(const [k,v] of Object.entries(raw.seen||{}).slice(-12000))if(/^[a-z0-9]{1,12}$/.test(k)&&stamp(v))d.seen[k]=v;
 for(const rawAttempt of (Array.isArray(raw.attempts)?raw.attempts:[]).slice(-5000).sort((a,b)=>(a?.at||0)-(b?.at||0))){const a=record(d,rawAttempt);if(a)d.seen[a.fingerprint]=Math.min(d.seen[a.fingerprint]||a.at,a.at);}
 d.draft=cleanDraft(raw.draft);
 for(const def of paperDefinitions){const x=raw.papers?.[def.id];if(!x||!stamp(x.startedAt))continue;const p={id:def.id,startedAt:x.startedAt,updatedAt:stamp(x.updatedAt)||x.startedAt,deadline:def.minutes?x.startedAt+def.minutes*60000:0,submittedAt:stamp(x.submittedAt),assisted:!!x.assisted,interrupted:!!x.interrupted,conflicted:!!x.conflicted,seenBefore:!!x.seenBefore,index:Math.max(0,Math.min(def.units.length-1,Math.trunc(x.index)||0)),answers:{},flags:[...new Set((Array.isArray(x.flags)?x.flags:[]).filter(i=>Number.isInteger(i)&&i>=0&&i<def.units.length))]};
  for(let i=0;i<def.units.length;i++){const a=x.answers?.[i];if(a)p.answers[i]={answer:text(a.answer,AMAX),working:text(a.working),strokes:ink(a.strokes),updatedAt:stamp(a.updatedAt)||x.startedAt};}if(p.submittedAt&&p.submittedAt<p.startedAt)p.conflicted=true;for(const a of Object.values(p.answers))if(a.updatedAt<p.startedAt||p.submittedAt&&a.updatedAt>p.submittedAt||p.deadline&&a.updatedAt>p.deadline)p.conflicted=true;
  d.papers[def.id]=p;for(const q of paperQuestions(def.id))d.seen[q.fingerprint]=Math.min(d.seen[q.fingerprint]||p.startedAt,p.startedAt);
 }
 for(const a of d.attempts){if(a.mode==='paper'||a.mode==='baseline'){const p=d.papers[a.paperId];if(!p?.submittedAt||p.assisted||p.interrupted||p.conflicted){a.helped=true;a.independent=false;}}}
 for(const [id,v]of Object.entries(raw.reviews||{}).slice(-5000))if(v)review(d,id,v.verdict,v.note,stamp(v.at));
 for(const x of (Array.isArray(raw.external)?raw.external:[]).slice(-30)){if(!text(x?.id,120)||!text(x?.name,150)||!stamp(x?.at)||!Number.isFinite(x.total)||x.total<=0||!Number.isFinite(x.score)||x.score<0||x.score>x.total)continue;d.external.push({id:text(x.id,120),name:text(x.name,150),score:x.score,total:x.total,unseen:!!x.unseen,independent:!!x.independent,timed:!!x.timed,at:x.at});}
 const m=raw.mixed;if(m&&text(m.id,120)&&stamp(m.at)&&Array.isArray(m.items)){const items=m.items.slice(0,8).filter(x=>identity(x)&&x.form>=1&&x.form<=2).map(x=>({unit:x.unit,form:x.form,seed:x.seed,recall:!!x.recall}));if(items.length)d.mixed={id:text(m.id,120),at:m.at,items,completedAt:stamp(m.completedAt)};}
 for(const x of (Array.isArray(raw.mixedLog)?raw.mixedLog:[]).slice(-120))if(text(x?.id,120)&&stamp(x.at))d.mixedLog.push({id:text(x.id,120),at:x.at,completedAt:stamp(x.completedAt)});
 for(const [id,e] of Object.entries(raw.errors||{}).slice(-3000)){if(!safeId(id)||!e||typeof e!=='object')continue;d.errors[id]={tag:TAGS.includes(e.tag)?e.tag:'',at:stamp(e.at),redoneAt:stamp(e.redoneAt),lastTry:stamp(e.lastTry)};}
 if(isDate(raw.testDate)){d.testDate=raw.testDate;d.testDateAt=stamp(raw.testDateAt);}
 for(const [id,f] of Object.entries(raw.wide?.facts||{}).slice(-500))if(/^[a-z0-9-]{1,24}$/.test(id)&&Number.isInteger(f?.choice)&&stamp(f.at))d.wide.facts[id]={choice:f.choice,correct:!!f.correct,at:f.at};
 for(const [id,v] of Object.entries(raw.wide?.investigations||{}).slice(-200))if(/^[a-z0-9-]{1,24}$/.test(id)&&stamp(v?.doneAt))d.wide.investigations[id]={doneAt:v.doneAt,note:text(v.note,2000),at:stamp(v.at)||v.doneAt};
 return d;
}
function merge(a,b){
 a=validate(a);b=validate(b);const d=fresh(),newest=(x,y,key='updatedAt')=>!x?y:!y?x:(y[key]||0)>(x[key]||0)?y:(y[key]||0)<(x[key]||0)?x:JSON.stringify(y)>JSON.stringify(x)?y:x;
 for(const u of D.units){const x=a.lessons[u.id],y=b.lessons[u.id],win=newest(x,y);if(!win)continue;d.lessons[u.id]={...copy(win),visited:[...new Set([...(x?.visited||[]),...(y?.visited||[])])].sort(),completedAt:Math.max(x?.completedAt||0,y?.completedAt||0),lastViewedAt:Math.max(x?.lastViewedAt||0,y?.lastViewedAt||0),conceptResponses:[...(x?.conceptResponses||[]),...(y?.conceptResponses||[])].filter((v,i,all)=>all.findIndex(w=>w.at===v.at&&w.choice===v.choice)===i).sort((x,y)=>x.at-y.at).slice(-12)};}
 for(const [k,v]of [...Object.entries(a.seen),...Object.entries(b.seen)])d.seen[k]=Math.min(d.seen[k]||v,v);
 const combined=new Map();for(const x of [...a.attempts,...b.attempts])combined.set(x.id,combined.has(x.id)?combineAttempts(combined.get(x.id),x):x);for(const x of [...combined.values()].sort((x,y)=>x.at-y.at||x.id.localeCompare(y.id)))record(d,x);
 d.draft=copy(newest(a.draft,b.draft)||null);if(d.draft&&d.attempts.find(x=>x.id===d.draft.id)?.correct)d.draft=null;
 if(a.draft&&b.draft&&a.draft.id===b.draft.id&&d.draft){d.draft.helped=a.draft.helped||b.draft.helped;d.draft.revealed=a.draft.revealed||b.draft.revealed;d.draft.guess=a.draft.guess||b.draft.guess;}
 for(const def of paperDefinitions){const x=a.papers[def.id],y=b.papers[def.id];if(!x&&!y)continue;let win;if(x?.submittedAt&&y?.submittedAt)win=x.submittedAt<y.submittedAt?x:y.submittedAt<x.submittedAt?y:newest(x,y);else win=x?.submittedAt?x:y?.submittedAt?y:newest(x,y);const p=copy(win);
  if(x&&y){p.assisted=x.assisted||y.assisted;p.interrupted=x.interrupted||y.interrupted;p.conflicted=x.conflicted||y.conflicted||x.startedAt!==y.startedAt;p.seenBefore=x.seenBefore||y.seenBefore;p.flags=[...new Set([...x.flags,...y.flags])].sort((x,y)=>x-y);
   if(!p.submittedAt)for(let i=0;i<def.units.length;i++){const ax=x.answers[i],ay=y.answers[i];if(ax&&ay&&ax.updatedAt===ay.updatedAt&&ax.answer!==ay.answer)p.conflicted=true;const answer=newest(ax,ay);if(answer)p.answers[i]=copy(answer);}
  }d.papers[def.id]=p;
 }
 for(const id of new Set([...Object.keys(a.reviews),...Object.keys(b.reviews)]))d.reviews[id]=copy(newest(a.reviews[id],b.reviews[id],'at'));
 const ext=new Map();for(const x of [...a.external,...b.external])ext.set(x.id,newest(ext.get(x.id),x,'at'));d.external=[...ext.values()].sort((x,y)=>x.at-y.at||x.id.localeCompare(y.id)).slice(-30);
 const ma=a.mixed,mb=b.mixed;if(ma||mb){const win=!ma?mb:!mb?ma:ma.id===mb.id?{...ma,completedAt:Math.max(ma.completedAt||0,mb.completedAt||0)}:(mb.at>ma.at?mb:ma);d.mixed=copy(win);}
 const logs=new Map();for(const x of [...a.mixedLog,...b.mixedLog]){const y=logs.get(x.id);logs.set(x.id,y?{...y,completedAt:Math.max(y.completedAt||0,x.completedAt||0)}:x);}d.mixedLog=[...logs.values()].sort((x,y)=>x.at-y.at).slice(-120);
 for(const id of new Set([...Object.keys(a.errors),...Object.keys(b.errors)])){const x=a.errors[id],y=b.errors[id];if(!x||!y){d.errors[id]=copy(x||y);continue;}const tag=(y.at||0)>(x.at||0)?y:x;d.errors[id]={tag:tag.tag,at:Math.max(x.at||0,y.at||0),redoneAt:Math.max(x.redoneAt||0,y.redoneAt||0),lastTry:Math.max(x.lastTry||0,y.lastTry||0)};}
 const td=(b.testDateAt||0)>(a.testDateAt||0)?b:a;if(td.testDate){d.testDate=td.testDate;d.testDateAt=td.testDateAt;}
 for(const id of new Set([...Object.keys(a.wide.facts),...Object.keys(b.wide.facts)])){const x=a.wide.facts[id],y=b.wide.facts[id];d.wide.facts[id]=copy(!x?y:!y?x:y.at<x.at?y:x);}
 for(const id of new Set([...Object.keys(a.wide.investigations),...Object.keys(b.wide.investigations)])){const x=a.wide.investigations[id],y=b.wide.investigations[id];const w=copy(newest(x,y,'at'));w.doneAt=Math.min(x?.doneAt||Infinity,y?.doneAt||Infinity);d.wide.investigations[id]=w;}
 return validate(d);
}
function exportData(d){return validate(d);}
return {D,B,DAY,REV,TAGS,uid,unit,question,fresh,init,lesson,visit,concept,complete,record,evidence,recommend,startPractice,startMixed,startMixedItem,mixedNext,closeMixed,errorLog,tagError,dueRedo,startRedo,testDate,setTestDate,mockSchedule,dueMock,plan,answerFact,finishInvestigation,dayKey,touchDraft,help,respond,finishPractice,paperDefinitions,paperQuestions,startPaper,savePaperAnswer,interruptPaper,submitPaper,scorePaper,review,addExternal,report,validate,merge,exportData,ink};
}
root.MochiPathCore={create};
if(typeof module!=='undefined')module.exports=root.MochiPathCore;
})(typeof globalThis!=='undefined'?globalThis:this);
