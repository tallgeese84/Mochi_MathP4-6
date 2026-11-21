/* v7.12 Contest sprints: 25 original multiple-choice questions in 40 minutes, no calculator, in the
   AMC 8 format (never its problems). Questions come from the existing Maths bank and the contest
   module, slot by slot from easier to harder, weighted towards the three topics the Singapore primary
   syllabus leaves out. Five answer choices are built deterministically from each question's own worked
   steps (the intermediate numbers a slip produces) and nearby values, sorted like a contest paper.
   Sprint results are kept apart from the mastery evidence: a multiple-choice guess is not independent
   working. They sync, back up and appear in the nightly export for the reviewer. */
(function(root){
'use strict';
const Engine=()=>root.MochiEntrance||(typeof require==='function'?require('./entrance-core.js'):null);
const COUNT=25,MINUTES=40,OPT_REV=1,LETTERS='ABCDE',MIN=60000,DAY=864e5,MAX_SPRINTS=80;
const CONTEST={name:'AMC 8',date:'2027-01-26',label:'Tuesday 26 January 2027',achievement:15};
/* One slot per question number: a topic and the units/forms it may draw from (first usable wins). */
const S=(topic,...pool)=>({topic,pool});
const BLUEPRINT=[
 S('Arithmetic',['sums',[0]],['amc-coords',[0]],['digits',[0]]),
 S('Data',['hcis-statistics',[0,1,2]]),
 S('Geometry',['geo-surface',[1]],['geo-angles',[1,2]],['geo-layers',[1,2]],['geo-one-face',[1,2]]),
 S('Percent and fractions',['percent',[0]],['remainders',[0]]),
 S('Probability',['amc-chance',[0]]),
 S('Number theory',['factors',[0]],['cycles',[0]]),
 S('Counting',['counting',[0]],['patterns',[0]]),
 S('Right triangles',['amc-right',[0]]),
 S('Coordinates',['amc-coords',[1]]),
 S('Ratio and rate',['ratios',[0]],['rates',[0]],['motion',[0]]),
 S('Algebra',['relationships',[1]],['simultaneous',[0,1]]),
 S('Probability',['amc-chance',[1]]),
 S('Geometry',['area',[0]],['decomposition',[0]],['angles',[1]],['volume',[0,1]]),
 S('Number theory',['factors',[1]],['nx-digits',[0]],['digits',[1]]),
 S('Right triangles',['amc-right',[1]]),
 S('Ratio and rate',['motion',[1]],['rates',[1]],['nx-cycles',[0]]),
 S('Counting',['counting',[1]],['pz-count',[0]],['sums',[1]]),
 S('Logic',['cases',[1]],['bounds',[1]],['nx-extremes',[0]]),
 S('Percent and fractions',['percent',[1]],['ratios',[1]],['ch-totals',[0]]),
 S('Coordinates',['amc-coords',[2,3]]),
 S('Probability',['amc-chance',[2,3]]),
 S('Geometry',['amc-right',[2,3]],['ch-angles',[1]],['area',[1]]),
 S('Number theory',['nx-digits',[1]],['ch-number',[1]],['cycles',[1]]),
 S('Counting',['pz-count',[1]],['counting',[2]],['invariants',[1]]),
 S('Algebra',['ch-sequences',[1]],['patterns',[2]],['nx-extremes',[1]],['ch-motion',[1]],['bounds',[2]])
];
const TOPICS=[...new Set(BLUEPRINT.map(s=>s.topic))];
function hash32(s){let h=2166136261;for(const c of String(s))h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0;}
function rng(seed){let a=seed>>>0;return ()=>{a=(a+0x6D2B79F5)>>>0;let t=Math.imul(a^a>>>15,1|a);t=(t+Math.imul(t^t>>>7,61|t))^t;return ((t^t>>>14)>>>0)/4294967296;};}
const gcd=(a,b)=>{a=Math.abs(a);b=Math.abs(b);while(b)[a,b]=[b,a%b];return a;};

/* A question can be a sprint question when it has one numeric answer and no answer buttons of its own. */
function usable(q){
 if(!q||typeof q.answer!=='number'||!Number.isFinite(q.answer)||q.choices||/Monday = 1/.test(q.text)||q.text.length>900)return false;
 // Fractions only for probabilities; other answers are whole numbers or short decimals, as on a contest paper.
 const label=String(q.answerLabel??'');if(/\//.test(label))return /probability/i.test(q.text);
 return Number.isInteger(q.answer)||Number.isInteger(q.answer*100);
}
function question(item){const E=Engine();return E.B.make(item.unit,item.form,item.seed,item.rev);}
function build(number){
 const E=Engine(),units=new Set(E.D.units.map(u=>u.id)),used=new Set(),items=[];
 BLUEPRINT.forEach((slot,i)=>{
  let found=null;
  for(let t=0;t<80&&!found;t++){
   const strict=t<60,pool=slot.pool.filter(([u])=>units.has(u)&&(!strict||!used.has(u)));if(!pool.length)continue;
   const h=hash32(`amc8|${number}|${i}|${t}`),[unit,forms]=pool[h%pool.length],form=forms[(h>>>8)%forms.length],seed=hash32(`amc8-seed|${number}|${i}|${t}`);
   let q=null;try{q=E.B.make(unit,form,seed,E.REV);}catch(_){q=null;}
   if(usable(q))found={unit,form,seed,rev:E.REV,topic:slot.topic};
  }
  if(!found)throw Error('No sprint question for slot '+(i+1));
  used.add(found.unit);items.push(found);
 });
 return items;
}

/* ---------- answer choices ---------- */
const fmtInt=n=>(n<0?'−':'')+(Math.abs(n)>=10000?Math.abs(n).toLocaleString('en-GB'):String(Math.abs(n)));
function fmtDec(n,dp){const s=Math.abs(n).toFixed(dp).replace(/\.?0+$/,'');return (n<0?'−':'')+s;}
function fracLabel(n,d){const g=gcd(n,d);n/=g;d/=g;return d===1?String(n):`${n}/${d}`;}
const numbersIn=t=>[...String(t).replace(/−/g,'-').replace(/(\d),(?=\d{3}\b)/g,'$1').matchAll(/-?\d+(?:\.\d+)?/g)].map(m=>Number(m[0]));
const fractionsIn=t=>[...String(t).matchAll(/(\d+)\/(\d+)/g)].map(m=>[+m[1],+m[2]]).filter(([n,d])=>d>0);
/* Returns {labels:[5], correct:index}. Deterministic for a question and its seed. */
function options(q,seed){
 const rand=rng(hash32(`opt${OPT_REV}|${q.id}|${seed}`)),shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
 const A=q.answer,label=String(q.answerLabel??''),steps=q.steps.join(' '),probability=/probability/i.test(q.text);
 const fm=label.match(/^(\d+)\/(\d+)$/);
 const picked=[];const has=v=>Math.abs(v-A)<1e-9||picked.some(p=>Math.abs(p.v-v)<1e-9);
 const add=(v,l)=>{if(picked.length<4&&Number.isFinite(v)&&!has(v))picked.push({v,l});};
 if(fm){
  const n=+fm[1],d=+fm[2],ok=v=>v>0&&(probability?v<=1:v/A>=0.3&&v/A<=3.5);
  for(const [a,b] of shuffle(fractionsIn(steps)).slice(0,6)){const v=a/b;if(ok(v)&&picked.length<2)add(v,fracLabel(a,b));}
  const extra=(probability?[[d-n,d],[n+1,d],[n-1,d],[n,d+1],[n,d-1],[2*n,d],[n,2*d],[n+2,d],[n+1,d+1]]:[[n+d,d],[n-d,d],[2*n,d],[n,2*d],[n,d+1],[n,d-1],[n+2*d,d],[n-2*d,d],[3*n,2*d]]).filter(([a,b])=>a>0&&b>0);
  for(const [a,b] of shuffle(extra)){if(ok(a/b))add(a/b,fracLabel(a,b));}
  for(let k=1;picked.length<4&&k<40;k++)add((n+k)/(d+k+1),fracLabel(n+k,d+k+1));
  const all=[{v:A,l:fracLabel(n,d)},...picked];return finish(all,A);
 }
 const dp=Number.isInteger(A)?0:Math.min(2,(String(A).split('.')[1]||'').length),fmt=v=>dp?fmtDec(v,dp):fmtInt(v),round=v=>Number(v.toFixed(dp)),a=Math.abs(A);
 const digit=Number.isInteger(A)&&A>=0&&A<=9&&/digit/i.test(q.text),negOK=A<0||/temperature|coordinate of|sum of the two coordinates|Work out/i.test(q.text);
 const unit=dp?0.5:a<200?1:a<2000?10:100;
 // A wrong choice must look like a real slip: same kind of number, same sign (unless signs are the topic), similar size.
 const ok=v=>{
  if(digit)return Number.isInteger(v)&&v>=0&&v<=9;
  if(probability&&(v<=0||v>1))return false;
  if(dp===0&&!Number.isInteger(v))return false;
  if(v<0&&!negOK)return false;
  if(A>0&&v<=0&&!negOK)return false;
  if(a>=12){if(A*v<=0)return negOK&&Math.abs(v)===a;const ratio=v/A;return ratio>=0.3&&ratio<=3.5;}
  return Math.abs(v-A)<=12;
 };
 const given=new Set(numbersIn(q.text));
 const fromSteps=shuffle([...new Set(numbersIn(steps))].filter(v=>ok(v)&&!given.has(v)));
 for(const v of fromSteps.slice(0,2))add(round(v),fmt(round(v)));
 const offsets=digit?[1,-1,2,-2,3,-3,4,-4,5,-5]:[unit,-unit,2*unit,-2*unit,...(a>=20?[5*unit,-5*unit]:[]),...(a>=50?[10*unit,-10*unit]:[])];
 const scaled=digit?[]:[A*2,A/2,A*1.5,A*1.1,...(negOK?[-A]:[])].map(v=>dp?v:Math.round(v));
 for(const v of shuffle([...offsets.map(o=>round(A+o)),...scaled.map(round)]))if(ok(v))add(v,fmt(v));
 for(let k=3;picked.length<4&&k<80;k++)for(const v of [round(A+k*unit),round(A-k*unit)])if(ok(v)||(!digit&&v>0&&!(probability&&v>1)))add(v,fmt(v));
 return finish([{v:A,l:fmt(A)},...picked],A);
}
function finish(all,A){
 if(all.length!==5)throw Error('Could not build five choices');
 all.sort((a,b)=>a.v-b.v);return {labels:all.map(x=>x.l),values:all.map(x=>x.v),correct:all.findIndex(x=>Math.abs(x.v-A)<1e-9)};
}
function sheet(item){const q=question(item);return {q,...options(q,item.seed)};}

/* ---------- records ---------- */
function fresh(){return {version:1,sprints:{}};}
const isId=s=>typeof s==='string'&&/^amc8-\d{1,3}$/.test(s);
const stamp=t=>Number.isFinite(t)&&t>1e12&&t<4e12;
function validItem(x){const E=Engine();return !!x&&typeof x.unit==='string'&&!!E.unit(x.unit)&&Number.isInteger(x.form)&&x.form>=0&&x.form<=3&&Number.isSafeInteger(x.seed)&&x.seed>=0&&x.seed<=4294967295&&Number.isInteger(x.rev)&&x.rev>=1&&x.rev<=E.REV&&typeof x.topic==='string';}
function validate(c){
 const out=fresh();if(!c||typeof c!=='object'||!c.sprints||typeof c.sprints!=='object')return out;
 for(const [id,s] of Object.entries(c.sprints).slice(-MAX_SPRINTS)){
  if(!isId(id)||!s||s.id!==id||!Number.isInteger(s.number)||s.number<1||s.number>999||!stamp(s.startedAt)||!Array.isArray(s.items)||s.items.length!==COUNT||!s.items.every(validItem))continue;
  const answers=Array.from({length:COUNT},(_,i)=>Number.isInteger(s.answers?.[i])&&s.answers[i]>=0&&s.answers[i]<5?s.answers[i]:null);
  const flags=[...new Set((Array.isArray(s.flags)?s.flags:[]).filter(i=>Number.isInteger(i)&&i>=0&&i<COUNT))].sort((a,b)=>a-b);
  out.sprints[id]={id,number:s.number,startedAt:s.startedAt,deadline:s.startedAt+MINUTES*MIN,items:s.items.map(x=>({unit:x.unit,form:x.form,seed:x.seed,rev:x.rev,topic:x.topic.slice(0,40)})),answers,flags,at:Number.isInteger(s.at)&&s.at>=0&&s.at<COUNT?s.at:0,submittedAt:stamp(s.submittedAt)?Math.min(s.submittedAt,s.startedAt+MINUTES*MIN):null,auto:!!s.auto,updatedAt:stamp(s.updatedAt)?s.updatedAt:s.startedAt};
 }
 return out;
}
/* Validate once per record object, so every screen and the clock share one live copy. */
const checked=typeof WeakSet==='function'?new WeakSet():null;
function init(state){if(!state.contest||!checked?.has(state.contest)){state.contest=validate(state.contest);checked?.add(state.contest);}return state.contest;}
/* Union by sprint; a submitted copy beats a running one, otherwise the later update wins. */
function merge(a,b){
 const x=validate(a),y=validate(b),out=fresh();
 for(const id of new Set([...Object.keys(x.sprints),...Object.keys(y.sprints)])){const p=x.sprints[id],q=y.sprints[id];out.sprints[id]=!p?q:!q?p:(!!p.submittedAt!==!!q.submittedAt?(p.submittedAt?p:q):(q.updatedAt>p.updatedAt?q:p));}
 return out;
}
const list=c=>Object.values(c.sprints).sort((a,b)=>a.number-b.number);
function running(c,now=Date.now()){expire(c,now);return list(c).find(s=>!s.submittedAt)||null;}
function expire(c,now=Date.now()){let changed=false;for(const s of Object.values(c.sprints))if(!s.submittedAt&&now>=s.deadline){s.submittedAt=s.deadline;s.auto=true;s.updatedAt=now;changed=true;}return changed;}
function start(c,now=Date.now()){
 const open=running(c,now);if(open)return open;
 const number=list(c).reduce((m,s)=>Math.max(m,s.number),0)+1,id='amc8-'+number;
 c.sprints[id]={id,number,startedAt:now,deadline:now+MINUTES*MIN,items:build(number),answers:Array(COUNT).fill(null),flags:[],at:0,submittedAt:null,auto:false,updatedAt:now};
 const ids=Object.keys(c.sprints);if(ids.length>MAX_SPRINTS)for(const old of list(c).slice(0,ids.length-MAX_SPRINTS))delete c.sprints[old.id];
 return c.sprints[id];
}
function live(c,id,now){const s=c.sprints[id];if(!s||s.submittedAt)return null;if(now>=s.deadline){expire(c,now);return null;}return s;}
function answer(c,id,index,choice,now=Date.now()){const s=live(c,id,now);if(!s||!(index>=0&&index<COUNT))return false;s.answers[index]=choice===null||s.answers[index]===choice?null:choice;s.at=index;s.updatedAt=now;return true;}
function flag(c,id,index,now=Date.now()){const s=live(c,id,now);if(!s)return false;s.flags=s.flags.includes(index)?s.flags.filter(i=>i!==index):[...s.flags,index].sort((a,b)=>a-b);s.updatedAt=now;return true;}
function go(c,id,index,now=Date.now()){const s=live(c,id,now);if(!s)return false;s.at=Math.max(0,Math.min(COUNT-1,index));s.updatedAt=now;return true;}
function submit(c,id,now=Date.now()){const s=c.sprints[id];if(!s||s.submittedAt)return false;s.submittedAt=Math.min(now,s.deadline);s.auto=now>=s.deadline;s.updatedAt=now;return true;}
function score(s){
 const results=s.items.map((item,i)=>{const {q,labels,correct}=sheet(item),choice=s.answers[i];return {index:i,unit:item.unit,form:item.form,topic:item.topic,choice,correct:choice===correct,correctIndex:correct,answered:choice!==null,label:labels[correct],text:q.text};});
 const byTopic={};for(const r of results){const t=byTopic[r.topic]||(byTopic[r.topic]={correct:0,total:0});t.total++;if(r.correct)t.correct++;}
 const end=s.submittedAt||Math.min(Date.now(),s.deadline);
 return {id:s.id,number:s.number,correct:results.filter(r=>r.correct).length,answered:results.filter(r=>r.answered).length,total:COUNT,seconds:Math.max(0,Math.round((end-s.startedAt)/1000)),auto:s.auto,startedAt:s.startedAt,submittedAt:s.submittedAt,results,byTopic,firstHalf:results.slice(0,13).filter(r=>r.correct).length,secondHalf:results.slice(13).filter(r=>r.correct).length};
}
/* Local calendar helpers: the contest date is a local date. */
const localDay=t=>{const d=new Date(t);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
function daysLeft(now=Date.now()){const [y,m,d]=CONTEST.date.split('-').map(Number),t=new Date(y,m-1,d).getTime(),n=new Date(now);n.setHours(0,0,0,0);return Math.round((t-n.getTime())/DAY);}
/* A gentle suggestion only, never a requirement: weekly in December, twice weekly in January. */
function suggestion(c,now=Date.now()){
 const left=daysLeft(now);if(left<1)return null;
 const open=running(c,now);if(open)return {kind:'resume',id:open.id,number:open.number,daysLeft:left};
 const last=list(c).at(-1),gap=left<=26?3:6;
 if(last&&localDay(last.startedAt)===localDay(now))return null;
 if(last&&(now-last.startedAt)<gap*DAY)return null;
 return {kind:'start',number:(last?.number||0)+1,daysLeft:left};
}
function report(c,now=Date.now()){
 const done=list(c).filter(s=>s.submittedAt).map(score),topics={};
 for(const s of done)for(const [t,v] of Object.entries(s.byTopic)){const x=topics[t]||(topics[t]={correct:0,total:0});x.correct+=v.correct;x.total+=v.total;}
 return {contest:CONTEST.name,date:CONTEST.date,daysLeft:daysLeft(now),sprints:done.map(s=>({id:s.id,number:s.number,date:localDay(s.startedAt),correct:s.correct,answered:s.answered,total:s.total,minutes:Math.round(s.seconds/60),timedOut:s.auto,firstThirteen:s.firstHalf,lastTwelve:s.secondHalf,byTopic:s.byTopic})),topics,running:!!running(c,now),
  limits:'Original multiple-choice practice in the AMC 8 format, not past AMC problems and not a prediction of a contest score. Sprint answers are kept out of the mastery evidence because a correct choice may be a guess.'};
}
function exportData(c){
 const v=validate(c);
 return {...v,detail:list(v).filter(s=>s.submittedAt).map(s=>({id:s.id,questions:s.items.map((item,i)=>{const {q,labels,correct}=sheet(item);return {n:i+1,unit:item.unit,form:item.form,topic:item.topic,question:q.text.length>400?q.text.slice(0,397)+'…':q.text,choices:labels,correct:LETTERS[correct],chosen:s.answers[i]===null?null:LETTERS[s.answers[i]]};})}))};
}
/* Before the contest, suggest the three contest lessons (one new lesson a day, prerequisites learnt).
   Only replaces an ordinary "learn" or "practice" suggestion, never saved work, review or repair. */
const LESSONS=['amc-right','amc-chance','amc-coords'];
function recommend(E,d,r,now=Date.now()){
 const left=daysLeft(now);if(left<1||left>90||!r||!['learn','practice'].includes(r.kind)||r.repair||r.geometryBridge||r.unit&&LESSONS.includes(r.unit))return r;
 const today=E.dayKey(now);if(E.D.units.some(u=>u.extension&&d.lessons?.[u.id]?.lastViewedAt&&E.dayKey(d.lessons[u.id].lastViewedAt)===today))return r;
 for(const id of LESSONS){const u=E.unit(id);if(!u)continue;const e=E.evidence(d,id,now);if(e.taught||e.parked)continue;if(!u.prerequisites.every(p=>E.evidence(d,p,now).taught))continue;
  return {kind:'learn',unit:id,contestPrep:true,reason:`A topic for the ${CONTEST.name} on ${CONTEST.label}: ${u.title.replace('Contest · ','').toLowerCase()}. One new contest lesson a day.`};}
 return r;
}
const api={CONTEST,LESSONS,recommend,COUNT,MINUTES,LETTERS,BLUEPRINT,TOPICS,build,options,sheet,question,usable,fresh,validate,init,merge,running,expire,start,answer,flag,go,submit,score,report,exportData,suggestion,daysLeft,list};
root.MochiContest=api;
if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
