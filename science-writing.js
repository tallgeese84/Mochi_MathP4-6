/* Conservative, local feedback for short explanations. This is not a semantic examiner.
   Old response marks stay versioned. New checks never certify written understanding. */
(function(root){
'use strict';
const normal=s=>String(s||'').toLowerCase().replace(/[‘’]/g,"'").replace(/\bcan't\b|\bcannot\b/g,'can not').replace(/\bwon't\b/g,'will not').replace(/n't\b/g,' not');
const clauses=s=>normal(s).split(/[.!?;\n]+|\bbut\b/).map(s=>s.trim()).filter(Boolean);
function affirmative(s,verb){
 // Do not accept a negated action, or the imperative quoted merely to reject it.
 const at=s.search(verb);if(at<0)return false;
 return !/\b(?:not|never|no need to|without|avoid|unnecessary to)\b(?:\s+\w+){0,4}\s*$/.test(s.slice(0,at));
}
function replication(answer,plants=false){
 return clauses(answer).some(s=>{
  const repeat=/\b(?:repeat\w*|repete\w*|repet\w*|replicat\w*|retest\w*)\b/;
  if(affirmative(s,repeat)&&/\b(?:test\w*|trial\w*|experiment\w*|measur\w*|reading\w*|each|every|temperature\w*|level\w*|it|procedure|process)\b/.test(s))return true;
  if(/\b(?:twice|three|four|five|several|multiple|many|[2-9])\s+(?:independent\s+)?(?:times|tests|trials|repeats|measurements|readings)\b/.test(s)&&!(/\b(?:not|never|no need)\b/.test(s)))return true;
  if(/\b(?:do|try|test|measure|run)\b/.test(s)&&affirmative(s,/\bagain\b/))return true;
  // An average only implies replication when several actual results/trials are named.
  if(/\b(?:mean|average)\b/.test(s)&&/\b(?:two|three|four|five|several|multiple|many|[2-9])\b/.test(s)&&/\b(?:trials|results|readings|measurements|times)\b/.test(s)&&affirmative(s,/\b(?:mean|average)\b/))return true;
  return plants&&/\b(?:several|multiple|many|three|four|five|[3-9])\s+(?:identical\s+|similar\s+|bean\s+)*(?:seedlings|plants)\b/.test(s)&&/\b(?:each|every|group|treatment)\b/.test(s)&&!(/\b(?:not|never)\b/.test(s));
 });
}
function dissolvingConflict(answer){
 return clauses(answer).some(s=>{
  // An explicitly negated melting explanation is a valid distinction, not a misconception.
  const pattern=/\b(?:melt\w*\s+(?:(?:the|this|that|some|solid)\s+){0,2}sugar|sugar\s+(?:(?:will|would|can|quickly|slowly|then|simply|just|also)\s+){0,3}melt\w*)\b/;
  return affirmative(s,pattern)&&!(/\bnot\b.{0,16}\bmelt\w*\b/.test(s));
 });
}
function assess(q,answer,base){
 const ideas=(base.ideas||q.ideas.map(()=>false)).slice(),conflicts=[...(base.contradictions||[])];
 q.ideas.forEach((item,i)=>{
  if(/repeat|reliab|several seedlings|multiple trials/i.test(item.label))ideas[i]=replication(answer,/plant|seedling/.test(q.writtenKey||''));
 });
 if((/dissolv/.test(q.writtenKey||'')||/sugar dissolv/.test(q.text||''))&&dissolvingConflict(answer))conflicts.push('Dissolving sugar in water is not melting: the sugar remains present in the solution.');
 const clean=!conflicts.length;
 return {...base,claim:!!ideas[0]&&clean,reason:ideas.every(Boolean)&&clean,ideas,contradictions:conflicts,reviewRequired:true,gradingVersion:2};
}
root.MochiScienceWriting={assess,replication,dissolvingConflict};
if(typeof module!=='undefined')module.exports=root.MochiScienceWriting;
})(typeof globalThis!=='undefined'?globalThis:this);
