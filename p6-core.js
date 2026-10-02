/* Private paper practice. Source packs stay on the device; only learner evidence is in S.p6.
   Practice is deliberately not an admission score or automatic DSA-path mastery. */
(function(root){
'use strict';
const ID=/^[a-z0-9][a-z0-9._-]{0,119}$/i, HASH=/^[a-f0-9]{64}$/, MAX_BYTES=24000000;
const str=(v,n=6000)=>typeof v==='string'?v.slice(0,n):'', cp=v=>JSON.parse(JSON.stringify(v));
const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k), safeId=v=>typeof v==='string'&&ID.test(v)&&!['__proto__','constructor','prototype'].includes(v);
const num=v=>Number.isFinite(v)&&v>=0?v:0;
function image(v){return typeof v==='string'&&v.length<3500000&&/^data:image\/(?:png|webp|jpeg);base64,[a-zA-Z0-9+/]+={0,2}$/.test(v);}
function pack(raw){
 if(!raw||raw.schema!=='mochi-private-p6-v1'||!safeId(raw.id)||!HASH.test(raw.digest||''))throw Error('Not a supported private P6 pack.');
 if(!Array.isArray(raw.questions)||!raw.questions.length||raw.questions.length>500)throw Error('The pack needs 1–500 questions.');
 if(JSON.stringify(raw).length>MAX_BYTES)throw Error('This pack is too large. Split it into smaller packs.');
 const ids=new Set(),questions=raw.questions.map(q=>{
  if(!q||!safeId(q.id)||ids.has(q.id)||!safeId(q.sourceId)||!HASH.test(q.contentHash||'')||!['maths','science'].includes(q.subject))throw Error('Invalid or duplicated question ID.');ids.add(q.id);
  if(!Array.isArray(q.images)||q.images.length<1||q.images.length>5||!q.images.every(image))throw Error('Question scans must be embedded PNG, JPEG or WebP images.');
  if(!Array.isArray(q.pages)||!q.pages.length||q.pages.some(p=>!Number.isInteger(p)||p<1||p>500))throw Error('Missing source page.');
  if(!Array.isArray(q.fields)||!q.fields.length||q.fields.length>12)throw Error('Missing answer fields.');
  const fields=q.fields.map(f=>{
   if(!f||!['number','ratio','choice','review'].includes(f.kind))throw Error('Unknown answer type.');
   const out={label:str(f.label,140),kind:f.kind,unit:str(f.unit,24)};
   if(f.kind==='choice'){if(!Number.isInteger(f.answer)||f.answer<1||f.answer>4)throw Error('Invalid choice key.');out.answer=f.answer;}
   if(f.kind==='number'){if(!Number.isFinite(f.answer)||Math.abs(f.answer)>1e12)throw Error('Invalid number key.');out.answer=f.answer;}
   if(f.kind==='ratio'){if(!Array.isArray(f.answer)||f.answer.length<2||f.answer.length>4||f.answer.some(x=>!Number.isFinite(x)||x<=0))throw Error('Invalid ratio key.');out.answer=f.answer.slice();}
   return out;
  });
  if(!Array.isArray(q.keyImages)||q.keyImages.length>4||!q.keyImages.every(image))throw Error('Invalid answer-key image.');
  return {id:q.id,sourceId:q.sourceId,contentHash:q.contentHash,subject:q.subject,title:str(q.title,160),source:str(q.source,200),reference:str(q.reference,80),pages:q.pages.slice(),keyPages:(q.keyPages||[]).filter(Number.isInteger),unitId:safeId(q.unitId)?q.unitId:'',topic:str(q.topic,100),images:q.images.slice(),fields,keyImages:q.keyImages.slice(),keyNote:str(q.keyNote,1500),hint:str(q.hint,1200),audit:str(q.audit,1400),alt:str(q.alt,6000)};
 });
 const catalogue=(Array.isArray(raw.catalogue)?raw.catalogue:[]).slice(0,100).map(x=>({title:str(x.title,180),included:!!x.included,url:/^https:\/\/drive\.google\.com\/file\/d\/[a-zA-Z0-9_-]+\/view$/.test(x.url||'')?x.url:'',note:str(x.note,300)}));
 return {schema:raw.schema,id:raw.id,digest:raw.digest,title:str(raw.title,180),description:str(raw.description,1500),questions,catalogue};
}
const units={cm:['cm','centimetres','centimeters'], 'cm²':['cm²','cm2','cm^2','square centimetres'], 'cm³':['cm³','cm3','cm^3','cubic centimetres'], min:['min','minutes','minute'], '°':['°','degrees','degree'], '$':['$','dollars','sgd'],g:['g','grams'],kg:['kg','kilograms']};
function value(input,unit=''){
 let s=str(input,180).trim().toLowerCase().replace(/[−–]/g,'-');if(!s)return null;
 if(unit==='$'){s=s.replace(/^\$\s*/,'').replace(/^sgd\s*/,'');}
 const aliases=units[unit]|| (unit?[unit.toLowerCase()]:[]);
 for(const u of [...aliases].sort((a,b)=>b.length-a.length)){if(s.endsWith(u)){s=s.slice(0,-u.length).trim();break;}}
 // Commas must form thousands groups; arbitrary punctuation/foreign units are never stripped.
 if(/,/.test(s)){if(!/^[+-]?\d{1,3}(?:,\d{3})+(?:\.\d+)?$/.test(s))return null;s=s.replace(/,/g,'');}
 let n;if(/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(s))n=Number(s);
 else{const m=s.match(/^([+-]?\d+)\s+(\d+)\s*\/\s*(\d+)$/),f=s.match(/^([+-]?\d+)\s*\/\s*(\d+)$/);if(m&&+m[3])n=+m[1]+(+m[1]<0?-1:1)*(+m[2]/+m[3]);else if(f&&+f[2])n=+f[1]/+f[2];else return null;}
 return Number.isFinite(n)?n:null;
}
const near=(a,b)=>Math.abs(a-b)<=1e-9*Math.max(1,Math.abs(b));
function checkField(f,a){
 if(f.kind==='review')return {valid:!!str(a).trim(),correct:null};
 if(f.kind==='choice'){const s=str(a).trim();return {valid:/^[1-4]$/.test(s),correct:s===String(f.answer)};}
 if(f.kind==='ratio'){const p=str(a,180).split(/\s*:\s*/).map(x=>value(x));const valid=p.length===f.answer.length&&p.every(x=>x!==null&&x>0);return {valid,correct:valid&&p.every((x,i)=>near(x*f.answer[0],p[0]*f.answer[i]))};}
 const n=value(a,f.unit);return {valid:n!==null,correct:n!==null&&near(n,f.answer)};
}
function canonical(v){if(Array.isArray(v))return v.map(canonical);if(v&&typeof v==='object')return Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonical(v[k])]));return v;}
function signable(q){const x=cp(q);delete x.contentHash;return JSON.stringify(canonical(x));}
function fresh(){return {version:1,attempts:[],draft:null,seen:{}};}
function ink(raw){return Array.isArray(raw)?raw.slice(0,120).map(s=>Array.isArray(s)?s.slice(0,700).filter(p=>Array.isArray(p)&&p.length===2&&p.every(n=>Number.isFinite(n)&&n>=0&&n<=1)).map(p=>p.slice()):[]).filter(s=>s.length):[];}
function draft(v){if(!v||!safeId(v.id)||!safeId(v.questionId)||!safeId(v.packId)||!HASH.test(v.contentHash||'')||!['maths','science'].includes(v.subject))return null;return {id:v.id,questionId:v.questionId,packId:v.packId,contentHash:v.contentHash,subject:v.subject,sourceId:str(v.sourceId,120),reference:str(v.reference,80),topic:str(v.topic,100),unitId:str(v.unitId,120),startedAt:num(v.startedAt),updatedAt:num(v.updatedAt),answers:Array.isArray(v.answers)?v.answers.slice(0,12).map(x=>str(x)):[],working:str(v.working),strokes:ink(v.strokes),helped:!!v.helped,guess:!!v.guess,revealed:!!v.revealed,seenBefore:!!v.seenBefore};}
function validate(raw){
 const out=fresh();if(!raw||raw.version!==1)return out;
 for(const [k,v] of Object.entries(raw.seen||{}).slice(0,10000))if(safeId(k)&&num(v))out.seen[k]=num(v);
 if(Array.isArray(raw.attempts))for(const a of raw.attempts.slice(-4000)){
  const d=draft(a);if(!d)continue;const responses=Array.isArray(a.responses)?a.responses.slice(0,100).filter(r=>r&&Array.isArray(r.answers)&&num(r.at)).map(r=>({at:num(r.at),answers:r.answers.slice(0,12).map(x=>str(x)),working:str(r.working),strokes:ink(r.strokes),correct:typeof r.correct==='boolean'?r.correct:null,fieldCorrect:(r.fieldCorrect||[]).slice(0,12).map(x=>typeof x==='boolean'?x:null),helped:!!r.helped,guess:!!r.guess,revealed:!!r.revealed})):[];
  const first=responses[0],last=responses.at(-1),helped=d.helped||d.guess||d.revealed||responses.some(r=>r.helped||r.guess||r.revealed);out.attempts.push({...d,responses,correct:last?.correct??null,firstCorrect:first?.correct===true,independent:!!first&&first.correct===true&&last?.correct===true&&!helped&&!d.seenBefore,pendingReview:responses.some(r=>r.correct===null)});
 }
 out.draft=draft(raw.draft);return out;
}
function init(state){if(!state.p6||state.p6.version!==1)state.p6=fresh();return state.p6;}
function start(data,p,q,now=Date.now(),id='p6-'+now.toString(36)+'-'+Math.random().toString(36).slice(2,9)){
 if(!safeId(id))throw Error('Invalid attempt ID');
 data.draft={id,packId:p.id,questionId:q.id,contentHash:q.contentHash,subject:q.subject,sourceId:q.sourceId,reference:q.reference,topic:q.topic,unitId:q.unitId,startedAt:now,updatedAt:now,answers:q.fields.map(()=>''),working:'',strokes:[],helped:false,guess:false,revealed:false,seenBefore:!!data.seen[q.id]||data.attempts.some(a=>a.questionId===q.id)};
 data.seen[q.id]=data.seen[q.id]||now;return data.draft;
}
function touch(data,patch,now=Date.now()){
 if(!data.draft)return null;const d=data.draft;if(patch.answers)d.answers=patch.answers.slice(0,12).map(x=>str(x));if(own(patch,'working'))d.working=str(patch.working);if(patch.strokes)d.strokes=ink(patch.strokes);
 if(own(patch,'guess'))d.guess=!!patch.guess;const solved=data.attempts.find(a=>a.id===d.id)?.correct===true;if(patch.helped&&!solved)d.helped=true;if(patch.revealed){d.revealed=true;if(!solved)d.helped=true;}d.updatedAt=now;
 const a=data.attempts.find(x=>x.id===d.id);if(a){Object.assign(a,{working:d.working,strokes:cp(d.strokes),helped:a.helped||d.helped,guess:a.guess||d.guess,revealed:a.revealed||(!solved&&d.revealed),updatedAt:now});if(a.helped||a.guess||a.revealed)a.independent=false;}
 return d;
}
function respond(data,q,now=Date.now()){
 const d=data.draft;if(!d||q.id!==d.questionId||q.contentHash!==d.contentHash)return {error:'This saved question needs its original source pack. Nothing has been marked.'};
 const settled=data.attempts.find(a=>a.id===d.id);if(settled?.correct===true)return {duplicate:true,attempt:settled};
 const parts=q.fields.map((f,i)=>checkField(f,d.answers[i]));if(parts.some(x=>!x.valid))return {error:'Complete each answer. For numerical fields, use the displayed unit or enter just the number. Incomplete input is not a mistake.'};
 let a=data.attempts.find(x=>x.id===d.id),prev=a?.responses.at(-1);
 if(prev&&JSON.stringify([prev.answers,prev.working,prev.strokes])===JSON.stringify([d.answers,d.working,d.strokes]))return {duplicate:true,attempt:a};
 const review=q.fields.some(f=>f.kind==='review'),correct=review?null:parts.every(x=>x.correct),response={at:now,answers:d.answers.slice(),working:d.working,strokes:cp(d.strokes),correct,fieldCorrect:parts.map(x=>x.correct),helped:d.helped,guess:d.guess,revealed:d.revealed};
 if(!a){a={...cp(d),responses:[],correct:null,firstCorrect:false,independent:false,pendingReview:review};data.attempts.push(a);}a.responses.push(response);Object.assign(a,{answers:d.answers.slice(),working:d.working,strokes:cp(d.strokes),updatedAt:now,correct,pendingReview:review,firstCorrect:a.responses[0].correct===true,helped:a.helped||d.helped,guess:a.guess||d.guess,revealed:a.revealed||d.revealed});a.independent=a.firstCorrect&&!a.helped&&!a.guess&&!a.revealed&&!a.seenBefore;return {attempt:a,parts};
}
function merge(left,right){
 const a=validate(left),b=validate(right),out=fresh(),map=new Map();
 for(const s of [a,b]){for(const [k,t] of Object.entries(s.seen))out.seen[k]=Math.min(out.seen[k]||Infinity,t);for(const x of s.attempts){const old=map.get(x.id);if(!old){map.set(x.id,cp(x));continue;}
  const next=cp(old.updatedAt>x.updatedAt?old:x),r=new Map();for(const z of [...old.responses,...x.responses])r.set(JSON.stringify(z),z);next.responses=[...r.values()].sort((x,y)=>x.at-y.at);next.helped=old.helped||x.helped;next.guess=old.guess||x.guess;next.revealed=old.revealed||x.revealed;next.seenBefore=old.seenBefore||x.seenBefore;const t=next.responses[0]?.at,same=next.responses.filter(z=>z.at===t);if(same.length>1)next.helped=true;map.set(x.id,next);
 }}
 out.attempts=[...map.values()].sort((x,y)=>x.startedAt-y.startedAt);out.draft=[a.draft,b.draft].filter(Boolean).sort((x,y)=>y.updatedAt-x.updatedAt)[0]||null;
 if(a.draft&&b.draft&&a.draft.id===b.draft.id){for(const k of ['helped','guess','revealed','seenBefore'])out.draft[k]=a.draft[k]||b.draft[k];}
 return validate(out);
}
function report(raw){const d=validate(raw);return {schema:1,scope:'Private P6 practice; not DSA mastery or an exam score',attempts:d.attempts.length,questions:new Set(d.attempts.map(a=>a.questionId)).size,firstCorrect:d.attempts.filter(a=>a.firstCorrect).length,independent:d.attempts.filter(a=>a.independent).length,pendingReview:d.attempts.filter(a=>a.pendingReview).map(a=>({id:a.id,questionId:a.questionId,sourceId:a.sourceId,reference:a.reference,subject:a.subject,answers:a.responses.at(-1)?.answers,working:a.working,strokes:a.strokes})),limit:'Written explanations and drawings require human review. MCQ correctness does not validate reasoning. Repeated or supported answers are not fresh independent evidence.'};}
root.MochiP6={pack,MAX_BYTES,canonical,signable,fresh,validate,init,start,touch,respond,merge,report,checkField,value,ink};if(typeof module!=='undefined')module.exports=root.MochiP6;
})(typeof globalThis!=='undefined'?globalThis:this);
