/* Shared study/assessment state machine. Subject content and state keys are injected.
   Derived from the tested maths pathway; no learner data is built into this engine. */
(function(root){
'use strict';
function create(D,B,options={}){
const stateKey=options.stateKey||'entrance',prefix=options.prefix||'entrance-';
const DAY=86400000,unit=id=>D.units.find(u=>u.id===id),stamp=n=>Number.isFinite(n)&&n>0&&n<8640000000000000?n:0;
const text=(s,n=6000)=>typeof s==='string'?s.slice(0,n):'',copy=x=>JSON.parse(JSON.stringify(x));
const uid=()=>root.crypto?.randomUUID?.()||Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
const ink=raw=>(Array.isArray(raw)?raw:[]).slice(-60).map(s=>(Array.isArray(s)?s:[]).slice(0,300).filter(p=>Array.isArray(p)&&p.length===2&&p.every(Number.isFinite)).map(p=>p.map(n=>Math.round(Math.max(0,Math.min(1,n))*10000)/10000))).filter(s=>s.length);
const fresh=()=>({version:1,goalMonth:D.goalMonth,target:D.target,lessons:{},attempts:[],seen:{},papers:{},draft:null,reviews:{},external:[]});
function init(s){return s[stateKey]||(s[stateKey]=fresh());}
function identity(v){return !!(v&&unit(v.unit)&&Number.isInteger(v.form)&&v.form>=0&&v.form<=3&&Number.isSafeInteger(v.seed)&&v.seed>=0&&v.seed<=4294967295);}
function question(v){if(!identity(v))throw Error('Unknown entrance question');return B.make(v.unit,v.form,v.seed);}
function lesson(d,id){if(!unit(id))throw Error('Unknown teaching unit');return d.lessons[id]||(d.lessons[id]={visited:[],page:0,completedAt:0,lastViewedAt:0,updatedAt:0,conceptChoice:-1,conceptResponses:[],notes:''});}
function visit(d,id,page=0,now=Date.now()){const l=lesson(d,id);l.page=Math.max(0,Math.min(2,Math.trunc(page)||0));l.visited=[...new Set([...l.visited,l.page])];l.lastViewedAt=l.updatedAt=now;return l;}
function concept(d,id,choice,now=Date.now()){const l=lesson(d,id),c=unit(id).check;if(!Number.isInteger(choice)||choice<0||choice>=c[1].length)return false;l.conceptChoice=choice;l.conceptResponses.push({choice,at:now});l.conceptResponses=l.conceptResponses.slice(-12);l.updatedAt=now;return choice===c[2];}
function complete(d,id,now=Date.now()){const l=lesson(d,id);if(l.visited.length<3||l.conceptChoice!==unit(id).check[2])return false;l.completedAt=l.completedAt||now;l.updatedAt=now;return true;}
function cleanDraft(v){if(!identity(v)||v.form===3||!text(v.id,120)||!stamp(v.at))return null;return {id:text(v.id,120),unit:v.unit,form:v.form,seed:v.seed,at:v.at,updatedAt:stamp(v.updatedAt)||v.at,phase:['guided','apply','transfer','recall'].includes(v.phase)?v.phase:'apply',helped:!!v.helped,revealed:!!v.revealed,guess:!!v.guess,seenBefore:!!v.seenBefore,lessonViewedAt:stamp(v.lessonViewedAt),recallOf:text(v.recallOf,120),answer:text(v.answer,180),working:text(v.working),strokes:ink(v.strokes)};}
function cleanAttempt(a){
 if(!identity(a)||!text(a.id,120)||!stamp(a.at))return null;const q=question(a),mode=['practice','baseline','paper'].includes(a.mode)?a.mode:'practice';
 const responses=(Array.isArray(a.responses)?a.responses:[]).slice(0,12).filter(x=>stamp(x.at)).map(x=>({at:stamp(x.at),answer:text(x.answer,180),working:text(x.working),strokes:ink(x.strokes)}));
 if(!responses.length)return null;const final=responses.at(-1),skipped=!final.answer.trim(),firstCorrect=B.mark(q,responses[0].answer)&&!a.conflicted,correct=B.mark(q,final.answer);
 const helped=!!a.helped||a.phase==='guided'||mode==='practice'&&a.form===0;
 return {id:text(a.id,120),unit:a.unit,form:a.form,seed:a.seed,fingerprint:q.fingerprint,at:a.at,updatedAt:stamp(a.updatedAt)||final.at,answeredAt:final.at,mode,paperId:text(a.paperId,40),phase:['guided','apply','transfer','recall','paper','baseline'].includes(a.phase)?a.phase:'apply',responses,helped,revealed:!!a.revealed,guess:!!a.guess,seenBefore:!!a.seenBefore,conflicted:!!a.conflicted,lessonViewedAt:stamp(a.lessonViewedAt),recallOf:text(a.recallOf,120),skipped,firstCorrect,correct,reflection:text(a.reflection),reflectionInk:ink(a.reflectionInk),reflectionAt:stamp(a.reflectionAt),independent:!!(correct&&firstCorrect&&!helped&&!a.revealed&&!a.guess&&!skipped&&!a.conflicted),question:q.text,...(B.parts?{components:B.parts(q,final.answer),firstComponents:B.parts(q,responses[0].answer)}:{})};
}
function combineAttempts(a,b){
 if(a.unit!==b.unit||a.form!==b.form||a.seed!==b.seed)return {...a,conflicted:true};
 const prefix=(x,y)=>x.responses.every((v,i)=>y.responses[i]?.answer===v.answer&&y.responses[i]?.at===v.at);
 const extendsA=prefix(a,b),extendsB=prefix(b,a),win=extendsA?b:extendsB?a:(b.updatedAt>a.updatedAt?b:b.updatedAt<a.updatedAt?a:JSON.stringify(b)>JSON.stringify(a)?b:a);
 const reflected=(b.reflectionAt||0)>(a.reflectionAt||0)?b:a;
 return {...win,reflection:reflected.reflection,reflectionInk:reflected.reflectionInk,reflectionAt:reflected.reflectionAt,helped:a.helped||b.helped,revealed:a.revealed||b.revealed,guess:a.guess||b.guess,seenBefore:a.seenBefore||b.seenBefore,conflicted:a.conflicted||b.conflicted||!extendsA&&!extendsB,lessonViewedAt:Math.max(a.lessonViewedAt||0,b.lessonViewedAt||0)};
}
function record(d,raw){let a=cleanAttempt(raw);if(!a)return null;const index=d.attempts.findIndex(x=>x.id===a.id);if(index>=0)a=cleanAttempt(combineAttempts(d.attempts[index],a));else a.seenBefore=a.seenBefore||d.attempts.some(x=>x.fingerprint===a.fingerprint);if(index>=0)d.attempts[index]=a;else d.attempts.push(a);d.attempts=d.attempts.slice(-5000);return a;}
function evidence(d,id,now=Date.now()){
 const all=d.attempts.filter(a=>a.unit===id&&a.mode==='practice'&&a.answeredAt<=now),answered=all.filter(a=>!a.skipped),eligible=answered.filter(a=>a.independent&&!a.seenBefore),apply=eligible.filter(a=>a.form===1),transfer=eligible.filter(a=>a.form===2),last=answered.at(-1),forms=new Set(eligible.map(a=>a.form));
 const recall=answered.filter(a=>a.phase==='recall'&&a.independent&&a.recallOf&&a.at>=(d.attempts.find(x=>x.id===a.recallOf)?.answeredAt||Infinity)+7*DAY&&a.at>=a.lessonViewedAt+7*DAY);
 const success=answered.filter(a=>a.independent&&a.form>=1).at(-1),due=transfer.length&&success?success.answeredAt+7*DAY:0;
 const needsTeaching=answered.length>=2&&answered.slice(-2).every(a=>!a.firstCorrect)&&((d.lessons[id]?.lastViewedAt||0)<answered.at(-1).answeredAt);
 let stage=!d.lessons[id]?.completedAt?'Learn':apply.length<2?'Apply':!transfer.length?'Connect':!recall.length?'Revisit after a week':'Mixed-paper practice';
 return {id,title:unit(id).title,strand:unit(id).strand,stage,taught:!!d.lessons[id]?.completedAt,attempts:answered.length,supported:answered.filter(a=>a.correct&&!a.independent).length,independent:eligible.length,apply:apply.length,transfer:transfer.length,forms:forms.size,delayed:recall.length,due,overdue:!!due&&now>=due,needsTeaching,last:last?.answeredAt||0,lastSuccess:success?.id||'',reviewed:answered.filter(a=>d.reviews[a.id]?.verdict==='valid').length};
}
const legacyMap={gst:'percent',percentWhole:'percent',repeatedRemainder:'remainders',workingBackwards:'remainders',cubeEdge:'volume',systematicCounting:'counting',rectanglesInGrid:'counting',factorsMultiples:'factors',constrainedDigits:'digits',areaTriangle:'area'};
function bridge(s,d){if(options.bridge)return options.bridge(s,d);const groups=new Map();for(const a of s.learning?.attempts||[]){const id=legacyMap[a.generator];if(!id||a.skipped||!a.tries)continue;if(!groups.has(a.generator))groups.set(a.generator,[]);groups.get(a.generator).push(a);}return [...groups.values()].filter(a=>a.length>=2&&a.slice(-2).every(x=>!x.firstCorrect)).map(a=>({unit:legacyMap[a[0].generator],at:a.at(-1).answeredAt||a.at(-1).at})).filter(x=>!d.lessons[x.unit]?.completedAt&&(!d.lessons[x.unit]?.lastViewedAt||d.lessons[x.unit].lastViewedAt<x.at)).sort((a,b)=>b.at-a.at)[0]||null;}
function recommend(s,now=Date.now()){
 const d=init(s),draft=d.draft,unfinished=Object.values(d.papers).find(p=>!p.submittedAt);
 if(unfinished)return {kind:'paper',paper:unfinished.id,reason:'Continue the saved paper. Its original deadline is retained.'};
 if(draft)return {kind:'resume',unit:draft.unit,reason:'Continue your saved question and working.'};
 const rows=D.units.map(u=>evidence(d,u.id,now)),repair=rows.filter(e=>e.needsTeaching).sort((a,b)=>b.last-a.last)[0];if(repair)return {kind:'learn',unit:repair.id,repair:true,reason:'Two first-answer misses suggest revisiting the method before more numerical variants.'};
 const old=bridge(s,d);if(old)return {kind:'learn',unit:old.unit,reason:'Recent foundation attempts suggest checking this relationship. They do not establish an ability level.'};
 const due=rows.filter(x=>x.overdue).sort((a,b)=>a.due-b.due)[0];if(due)return {kind:'recall',unit:due.id,reason:'Try a delayed question with the lesson closed. Familiar retrieval is not new transfer.'};
 const started=rows.find(e=>e.taught&&e.stage!=='Revisit after a week'&&e.stage!=='Mixed-paper practice');if(started)return {kind:'practice',unit:started.id,reason:started.stage==='Apply'?'Build two independent application examples.':'Try a different problem structure with the help closed.'};
 const next=D.units.find(u=>!d.lessons[u.id]?.completedAt&&u.prerequisites.every(p=>evidence(d,p,now).apply>=1))||D.units.find(u=>!d.lessons[u.id]?.completedAt);
 if(next)return {kind:'learn',unit:next.id,reason:'Explore the next method, see an example, then apply it yourself.'};
 return {kind:'mixed',reason:'Choose an unfamiliar mixed set or a reserved paper; review explanations with an adult.'};
}
function startPractice(d,id,{phase,seed,now=Date.now(),force=false}={}){
 if(d.draft&&!force)return d.draft;const e=evidence(d,id,now),l=lesson(d,id);
 phase=phase||(!l.completedAt?'guided':e.overdue?'recall':e.apply<2?'apply':'transfer');
 if(!['guided','apply','transfer','recall'].includes(phase))throw Error('Unsupported practice phase');
 const form=phase==='guided'?0:phase==='apply'?1:phase==='transfer'?2:(e.delayed%2?2:1);
 let value=seed??Math.floor(Math.random()*4294967296),q= B.make(id,form,value);
 for(let tries=0;tries<64&&d.seen[q.fingerprint]&&phase!=='recall';tries++){value=(value+1)>>>0;q=B.make(id,form,value);}
 const seenBefore=!!d.seen[q.fingerprint];d.seen[q.fingerprint]=d.seen[q.fingerprint]||now;
 d.draft={id:prefix+uid(),unit:id,form,seed:value,at:now,updatedAt:now,phase,helped:phase==='guided',revealed:false,guess:false,seenBefore,lessonViewedAt:l.lastViewedAt||0,recallOf:phase==='recall'?e.lastSuccess:'',answer:'',working:'',strokes:[]};return d.draft;
}
function touchDraft(d,fields,now=Date.now()){if(!d.draft)return;Object.assign(d.draft,{answer:text(fields.answer??d.draft.answer,180),working:text(fields.working??d.draft.working),strokes:ink(fields.strokes??d.draft.strokes),guess:d.draft.guess||!!fields.guess,updatedAt:now});}
function help(d,reveal=false,now=Date.now()){if(!d.draft||d.attempts.find(a=>a.id===d.draft.id)?.correct)return;d.draft.helped=true;d.draft.revealed=d.draft.revealed||reveal;d.draft.updatedAt=now;const a=d.attempts.find(a=>a.id===d.draft.id);if(a)record(d,{...a,helped:true,revealed:a.revealed||reveal,updatedAt:now});}
function respond(d,now=Date.now()){
 const v=d.draft;if(!v)return {ok:false};const q=question(v),old=d.attempts.find(x=>x.id===v.id);if(old?.correct)return {ok:true,attempt:old,already:true};
 if(!v.answer.trim())return {ok:false,reason:'Enter an answer first.'};
 if(B.validAnswer&&!B.validAnswer(q,v.answer))return {ok:false,reason:'Select a conclusion (or every statement) and a reason before checking. This incomplete response has not been counted as an error.'};
 if(typeof q.answer!=='string'&&!B.parse(v.answer,q.suffix))return {ok:false,reason:'Check the answer format. Use a number, fraction, or an exact expression with π. This has not been counted as a mathematical error.'};
 if(old?.responses.length>=12)return {ok:false,reason:'Revisit the worked example, then try a fresh question.'};
 const responses=[...(old?.responses||[]),{at:now,answer:v.answer,working:v.working,strokes:copy(v.strokes)}];
 const a=record(d,{...v,mode:'practice',updatedAt:now,responses});return {ok:true,attempt:a,needsLesson:!a.correct&&a.responses.length>=2};
}
function finishPractice(d){d.draft=null;}
const paperDefinitions=options.paperDefinitions||[
 {id:'baseline-a',kind:'baseline',title:'Starting-point check · A',minutes:0,units:['relationships','percent','area','volume','counting','factors']},
 {id:'baseline-b',kind:'baseline',title:'Starting-point check · B',minutes:0,units:['remainders','simultaneous','motion','spatial','cycles','cases']},
 ...['A','B','C'].map(letter=>({id:'mixed-'+letter.toLowerCase(),kind:'paper',title:'Mixed reasoning paper '+letter,minutes:75,units:D.units.map(u=>u.id)}))
];
const paperCache=new Map();
function paperQuestions(id){
 if(paperCache.has(id))return paperCache.get(id).map(copy);const def=paperDefinitions.find(p=>p.id===id);if(!def)throw Error('Unknown paper');
 // A fixed independent blueprint; prior paper values are excluded from later forms.
 const earlier=new Set();for(const prev of paperDefinitions){if(prev.id===id)break;for(const q of paperQuestions(prev.id))earlier.add(q.fingerprint);}
 const list=def.units.map((unit,i)=>{const form=def.kind==='baseline'?1:3;let seed=parseInt(B.hash((options.fingerprintPrefix||'ep-paper-v1:')+id+':'+unit),36)>>>0,q=B.make(unit,form,seed);for(let k=0;k<200&&earlier.has(q.fingerprint);k++)q=B.make(unit,form,seed=(seed+1)>>>0);if(earlier.has(q.fingerprint))throw Error('Paper family has no unseen variant');earlier.add(q.fingerprint);return q;});
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
 p.answers[index]={answer:text(fields.answer,180),working:text(fields.working),strokes:ink(fields.strokes),updatedAt:now};p.updatedAt=now;p.index=index;return true;
}
function interruptPaper(d,id,now=Date.now()){const p=d.papers[id];if(!p||p.submittedAt)return;p.interrupted=true;p.assisted=true;p.updatedAt=now;}
function submitPaper(d,id,now=Date.now()){
 const p=d.papers[id],def=paperDefinitions.find(p=>p.id===id);if(!p||!def)return null;if(p.submittedAt)return scorePaper(d,id);
 p.submittedAt=p.updatedAt=now;
 for(const [index,q]of paperQuestions(id).entries()){const v=p.answers[index]||{};record(d,{...q,id:`paper:${id}:${index}`,mode:def.kind,paperId:id,phase:def.kind,at:p.startedAt,updatedAt:now,helped:p.assisted||p.interrupted,conflicted:p.conflicted,seenBefore:p.seenBefore,guess:false,responses:[{answer:v.answer||'',working:v.working||'',strokes:v.strokes||[],at:now}]});}
 return scorePaper(d,id);
}
function scorePaper(d,id){
 const p=d.papers[id],def=paperDefinitions.find(x=>x.id===id);if(!p?.submittedAt||!def)return null;const qs=paperQuestions(id),byStrand=Object.fromEntries(Object.keys(D.strands).map(k=>[k,{correct:0,total:0}]));
 let correct=0;const results=qs.map((q,i)=>{const v=p.answers[i]||{},ok=B.mark(q,v.answer||'');byStrand[q.strand].total++;byStrand[q.strand].correct+=Number(ok);correct+=Number(ok);return {index:i,unit:q.unit,question:q.text,correct:ok,blank:!v.answer?.trim(),answer:v.answer||'',working:v.working||'',strokes:v.strokes||[],reference:q.answerLabel+(q.reasonLabel?' — '+q.reasonLabel:''),steps:q.steps,...(B.parts?{components:B.parts(q,v.answer||''),answerDisplay:B.describe(q,v.answer||''),figure:q.figure}:{})};});
 const percent=100*correct/qs.length,timed=def.kind==='paper'&&!!p.deadline&&p.submittedAt<=p.deadline+1500,independent=!p.assisted&&!p.interrupted&&!p.conflicted,qualifying=def.kind==='paper'&&percent>=D.target&&timed&&independent&&!p.seenBefore;
 return {id,kind:def.kind,correct,total:qs.length,percent,byStrand,timed,independent,unseen:!p.seenBefore,qualifying,results,seconds:Math.round((p.submittedAt-p.startedAt)/1000),status:def.kind==='baseline'?'Starting-point evidence, not a readiness score.':qualifying?'Internal paper target achieved. External calibration is still needed.':!independent?'Supported or interrupted practice paper.':!timed?'Untimed or overtime practice paper.':'Use the results to choose the next lessons.'};
}
function review(d,id,verdict,note='',now=Date.now()){if(['__proto__','constructor','prototype'].includes(id)||!d.attempts.some(a=>a.id===id)||!['valid','needs-discussion','unreviewed'].includes(verdict))return false;d.reviews[id]={verdict,note:text(note,1500),at:now};return true;}
function addExternal(d,entry,now=Date.now()){if(!text(entry.name,150)||!Number.isFinite(entry.score)||!Number.isFinite(entry.total)||entry.total<=0||entry.score<0||entry.score>entry.total)throw Error('Enter a named paper and a valid score/total.');d.external.push({id:uid(),name:text(entry.name,150),score:entry.score,total:entry.total,unseen:!!entry.unseen,independent:!!entry.independent,timed:!!entry.timed,at:now});d.external=d.external.slice(-30);}
function report(d,now=Date.now()){
 const units=D.units.map(u=>evidence(d,u.id,now)),papers=paperDefinitions.map(p=>scorePaper(d,p.id)).filter(Boolean),qualifying=papers.filter(p=>p.qualifying),reviewed=d.attempts.filter(a=>d.reviews[a.id]?.verdict==='valid'&&a.independent),reviewedStrands=new Set(reviewed.map(a=>unit(a.unit).strand));
 const external=d.external.filter(x=>x.independent&&x.unseen&&x.timed&&100*x.score/x.total>=D.target),breadth=qualifying.length===3&&Object.keys(D.strands).every(k=>{const total=qualifying.reduce((n,p)=>n+p.byStrand[k].total,0),correct=qualifying.reduce((n,p)=>n+p.byStrand[k].correct,0);return total&&correct/total>=.75;});
 return {goalMonth:d.goalMonth,target:D.target,units,papers,qualifyingPapers:qualifying.length,reviewedStrands:reviewedStrands.size,externalChecks:external.length,breadth,internalTarget:qualifying.length===3&&breadth&&reviewedStrands.size===Object.keys(D.strands).length,externalReported:external.length>0,limits:options.limits||['The commercial booklet is a working benchmark, not an official entrance paper.','These original items and time limits are not psychometrically calibrated.','85% on three reserved mixed papers is an internal training goal, not an admissions cutoff.','Independent correctness does not automatically validate written reasoning.','Parent-entered external results and explanation reviews are self-reported.','No school admission probability is calculated.']};
}
function validate(raw){
 const d=fresh();if(!raw)return d;if(raw.version!==1)throw Error('Unsupported entrance-path backup version.');
 for(const u of D.units){const x=raw.lessons?.[u.id];if(!x)continue;const l=lesson(d,u.id);l.page=Math.min(2,Math.max(0,Math.trunc(x.page)||0));l.visited=[...new Set((Array.isArray(x.visited)?x.visited:[]).filter(n=>Number.isInteger(n)&&n>=0&&n<=2))];l.lastViewedAt=stamp(x.lastViewedAt);l.updatedAt=stamp(x.updatedAt);l.notes=text(x.notes);l.conceptChoice=Number.isInteger(x.conceptChoice)&&x.conceptChoice>=0&&x.conceptChoice<3?x.conceptChoice:-1;l.conceptResponses=(Array.isArray(x.conceptResponses)?x.conceptResponses:[]).slice(-12).filter(v=>Number.isInteger(v.choice)&&v.choice>=0&&v.choice<3&&stamp(v.at));l.completedAt=l.visited.length===3?stamp(x.completedAt):0;}
 for(const [k,v] of Object.entries(raw.seen||{}).slice(-12000))if(/^[a-z0-9]{1,12}$/.test(k)&&stamp(v))d.seen[k]=v;
 for(const rawAttempt of (Array.isArray(raw.attempts)?raw.attempts:[]).slice(-5000).sort((a,b)=>(a?.at||0)-(b?.at||0))){const a=record(d,rawAttempt);if(a)d.seen[a.fingerprint]=Math.min(d.seen[a.fingerprint]||a.at,a.at);}
 d.draft=cleanDraft(raw.draft);
 for(const def of paperDefinitions){const x=raw.papers?.[def.id];if(!x||!stamp(x.startedAt))continue;const p={id:def.id,startedAt:x.startedAt,updatedAt:stamp(x.updatedAt)||x.startedAt,deadline:def.minutes?x.startedAt+def.minutes*60000:0,submittedAt:stamp(x.submittedAt),assisted:!!x.assisted,interrupted:!!x.interrupted,conflicted:!!x.conflicted,seenBefore:!!x.seenBefore,index:Math.max(0,Math.min(def.units.length-1,Math.trunc(x.index)||0)),answers:{},flags:[...new Set((Array.isArray(x.flags)?x.flags:[]).filter(i=>Number.isInteger(i)&&i>=0&&i<def.units.length))]};
  for(let i=0;i<def.units.length;i++){const a=x.answers?.[i];if(a)p.answers[i]={answer:text(a.answer,180),working:text(a.working),strokes:ink(a.strokes),updatedAt:stamp(a.updatedAt)||x.startedAt};}if(p.submittedAt&&p.submittedAt<p.startedAt)p.conflicted=true;for(const a of Object.values(p.answers))if(a.updatedAt<p.startedAt||p.submittedAt&&a.updatedAt>p.submittedAt||p.deadline&&a.updatedAt>p.deadline)p.conflicted=true;
  d.papers[def.id]=p;for(const q of paperQuestions(def.id))d.seen[q.fingerprint]=Math.min(d.seen[q.fingerprint]||p.startedAt,p.startedAt);
 }
 for(const a of d.attempts){if(a.mode==='paper'||a.mode==='baseline'){const p=d.papers[a.paperId];if(!p?.submittedAt||p.assisted||p.interrupted||p.conflicted){a.helped=true;a.independent=false;}}}
 for(const [id,v]of Object.entries(raw.reviews||{}).slice(-5000))if(v)review(d,id,v.verdict,v.note,stamp(v.at));
 for(const x of (Array.isArray(raw.external)?raw.external:[]).slice(-30)){if(!text(x?.id,120)||!text(x?.name,150)||!stamp(x?.at)||!Number.isFinite(x.total)||x.total<=0||!Number.isFinite(x.score)||x.score<0||x.score>x.total)continue;d.external.push({id:text(x.id,120),name:text(x.name,150),score:x.score,total:x.total,unseen:!!x.unseen,independent:!!x.independent,timed:!!x.timed,at:x.at});}
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
 return validate(d);
}
function exportData(d){return validate(d);}
return {D,B,DAY,uid,unit,question,fresh,init,lesson,visit,concept,complete,record,evidence,recommend,startPractice,touchDraft,help,respond,finishPractice,paperDefinitions,paperQuestions,startPaper,savePaperAnswer,interruptPaper,submitPaper,scorePaper,review,addExternal,report,validate,merge,exportData,ink};
}
root.MochiPathCore={create};
if(typeof module!=='undefined')module.exports=root.MochiPathCore;
})(typeof globalThis!=='undefined'?globalThis:this);
