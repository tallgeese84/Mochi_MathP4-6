/* Original HCIS-topic practice alongside (not instead of) the existing DSA pathway. */
(function(root){
'use strict';
const TOPICS=[['remainders','Fractions'],['percent','Percentages'],['ratios','Ratios'],['rates','Rates'],['motion','Speed and time'],['relationships','Simple algebra'],['simultaneous','Two conditions'],['area','Area'],['angles','Angles'],['geo-surface','Surface area'],['geo-layers','Volume'],['factors','Factors'],['hcis-statistics','Statistics'],['capacity','Capacity'],['geo-face-pairs','Solids']];
const ids=TOPICS.map(x=>x[0]),NAMES=Object.fromEntries(TOPICS);
const dates=['2026-12-12','2027-01-16','2027-02-13','2027-03-13','2027-04-17','2027-05-15','2027-06-12','2027-07-17','2027-08-14','2027-09-11'];
function papers(){return dates.map((date,i)=>{const k=i%ids.length,units=[...ids.slice(k),...ids.slice(0,k)];return {id:'hcis-'+date.slice(0,7),kind:'hcis',date,rev:3,title:'HCIS-style Maths check · '+date.slice(0,7),minutes:45,calculator:true,units,forms:units.map((_,j)=>(i+j)%3===0?2:1)};});}
function recommend(E,d,now=Date.now()){
 const weekday=new Date(now).getDay();if(weekday===0||weekday===6||d.draft||Object.values(d.papers||{}).some(x=>!x.submittedAt))return null;
 const ranked=ids.map((id,i)=>{const e=E.evidence(d,id,now);return {id,i,e,score:(!e.taught?90:0)+(e.needsTeaching?80:0)+(e.apply<2?40:0)+(e.transfer<1?25:0)+(e.delayed<1&&e.transfer>0?15:0)+(e.confirmedErrors||0)*2};}).sort((a,b)=>b.score-a.score||a.e.last-b.e.last||a.i-b.i);
 for(const x of ranked){const e=x.e;if(e.parked||E.prerequisite?.(d,x.id,now))continue;
  if(!e.taught||e.needsTeaching)return {kind:'learn',unit:x.id,hcis:true,reason:'HCIS fundamentals: '+NAMES[x.id]+'. NUS High challenges remain available.'};
  const phase=e.apply<2?'apply':e.transfer<1?'transfer':e.overdue?'recall':null;
  if(phase&&E.practiceAvailable(d,x.id,phase,now))return {kind:'practice',unit:x.id,phase,hcis:true,reason:'HCIS fundamentals: changed numbers, help closed, show and verify your method.'};
 }return null;
}
function report(E,d,now=Date.now()){
 const units=TOPICS.map(([id,label])=>{const e=E.evidence(d,id,now);return {id,label,taught:e.taught,apply:e.apply,transfer:e.transfer,delayed:e.delayed,mastered:e.mastered};});
 const scores=papers().map(p=>{if(!d.papers?.[p.id]?.submittedAt)return null;const s=E.scorePaper(d,p.id);return {id:p.id,date:p.date,correct:s.correct,total:s.total,percent:s.percent,timed:s.timed,independent:s.independent};}).filter(Boolean);
 return {covered:units.filter(x=>x.taught).length,mastered:units.filter(x=>x.mastered).length,total:units.length,units,papers:scores,limits:'Original HCIS-topic practice, not an official paper. Independence, changed transfer and delayed recall establish training mastery, not admission odds.'};
}
root.MochiHCISPrep={TOPICS,dates,papers,recommend,report};
if(typeof module!=='undefined')module.exports=root.MochiHCISPrep;
})(typeof window!=='undefined'?window:globalThis);
