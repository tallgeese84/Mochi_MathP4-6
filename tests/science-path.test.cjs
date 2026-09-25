const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const E=require('../science-path-core'),B=E.B,D=E.D,M=require('../entrance-core'),C=require('../course-core');
const now=Date.UTC(2026,8,25,21),day=86400000;
const numbers=s=>(String(s).match(/-?\d+(?:\.\d+)?/g)||[]).map(Number);
const first=s=>numbers(s)[0];
function wrong(q){const [c,r]=q.answer.split(':');return c+':r'+((+r.slice(1)+1)%q.reasons.length);}
function taught(d,id,t=now){for(let i=0;i<3;i++)E.visit(d,id,i,t);E.concept(d,id,E.unit(id).check[2],t+1);assert.ok(E.complete(d,id,t+2));}
function answer(d,id='measurement',phase='apply',seed=21,t=now+10000,miss=false){E.finishPractice(d);const v=E.startPractice(d,id,{phase,seed,now:t}),q=E.question(v);E.touchDraft(d,{answer:miss?wrong(q):q.answer,working:'Synthetic explanation referring to the measured evidence.'},t+1);return E.respond(d,t+2).attempt;}
function fill(d,id,t=now){E.startPaper(d,id,t);E.paperQuestions(id).forEach((q,i)=>E.savePaperAnswer(d,id,i,{answer:q.answer,working:'Synthetic explanation for adult review'},t+10+i));return E.submitPaper(d,id,t+1000);}
test('science scope has 24 substantive lessons, four strands and valid prerequisite links',()=>{
 assert.equal(D.units.length,24);for(const s of Object.keys(D.strands))assert.equal(D.units.filter(u=>u.strand===s).length,6);
 for(const u of D.units){assert.ok(u.ideas.join(' ').split(/\s+/).length>=100,u.id);assert.equal(u.ideas.length,3);assert.ok(u.check[1][u.check[2]]);assert.equal(C.unit(u.foundation).subject,'science');assert.ok(u.prerequisites.every(id=>E.unit(id)));assert.ok(u.scope&&u.source);}
 function visit(id,ancestors=[]){assert.ok(!ancestors.includes(id),'cycle '+id);for(const p of E.unit(id).prerequisites)visit(p,[...ancestors,id]);}D.units.forEach(u=>visit(u.id));
 assert.match(D.scope,/not the DSA test/);assert.match(D.sources.find(x=>/SPSO sample/.test(x.name)).role,/NOT an entrance/);
});
for(const u of D.units)test(`${u.id}: all four forms over 100 distributed seeds have distinct options, complete reasons and safe marking`,()=>{
 for(let f=0;f<4;f++)for(let i=0;i<100;i++){
  const q=B.make(u.id,f,Math.imul(i+1,2654435761)>>>0);assert.ok(q.text.length>30&&q.steps.length>=2&&q.rubric.length===3);assert.equal(q.strand,u.strand);
  if(q.options)assert.equal(new Set(q.options).size,4,q.id);else assert.equal(new Set(q.statements).size,3,q.id);
  assert.equal(new Set(q.reasons).size,3);assert.ok(B.mark(q,q.answer));assert.equal(B.mark(q,wrong(q)),false);assert.equal(B.mark(q,'<script>alert(1)</script>'),false);
  assert.equal(B.validAnswer(q,''),false);assert.equal(B.validAnswer(q,q.answer.split(':')[0]+':r-1'),false);
  assert.ok(q.options||/^[s][01]{3}:r[0-2]$/.test(q.answer));assert.equal(B.parts(q,wrong(q)).claim,true);assert.equal(B.parts(q,wrong(q)).reason,false);
 }
});
test('quantitative conclusions are independently recalculated from visible givens, not stored solutions',()=>{
 for(let i=0;i<100;i++){
  const seed=Math.imul(i+11,2246822519)>>>0,get=(id,f)=>B.make(id,f,seed);
  let q=get('measurement',0),n=numbers(q.text);assert.equal(first(q.answerLabel),n[1]-n[0]);
  q=get('measurement',1);assert.equal(first(q.answerLabel),q.figure.rows.reduce((t,r)=>t+first(r[1]),0)/q.figure.rows.length);
  q=get('normalise',0);n=numbers(q.text);const a=n[0]/n[1],b=n[2]/n[3];assert.equal(q.answerLabel,a>b?'A':a===b?'Equal':'B');
  q=get('normalise',1);const rows=q.figure.rows;assert.equal(q.answerLabel,first(rows[0][2])/first(rows[0][1])>first(rows[1][2])/first(rows[1][1])?'A':'B');
  q=get('light',2);assert.equal(first(q.answerLabel),90-first(q.text));assert.equal(q.figure.angle,first(q.answerLabel));
  q=get('forces',1);n=numbers(q.text);assert.equal(first(q.answerLabel),n[0]-n[1]);assert.equal(q.figure.right-q.figure.left,first(q.answerLabel));
  q=get('forces',3);n=numbers(q.text);assert.equal(first(q.answerLabel),n[0]*n.at(-1)/n[1]);
  q=get('energy',1);n=numbers(q.text);assert.equal(first(q.answerLabel),n[0]-n[1]);assert.ok(first(q.answerLabel)>=0);
  q=get('energy',2);n=numbers(q.text);assert.equal(n[0]*n[1],n[2]*n[3]);assert.match(q.answerLabel,/equal/);
  q=get('energy',3);n=numbers(q.text);assert.equal(first(q.answerLabel),n[0]-n[1]-n[2]);assert.ok(first(q.answerLabel)>0);
  q=get('respiration',1);n=numbers(q.text);assert.equal(first(q.answerLabel),n[0]-n[1]);
  q=get('respiration',3);n=numbers(q.text);assert.equal(first(q.answerLabel),n[0]+n[1]);
  q=get('technology',3);n=numbers(q.text);const delivered=q.figure.rows.map(r=>r[1]*r[2].split('/').map(Number).reduce((a,b)=>a/b)*r[3].split('/').map(Number).reduce((a,b)=>a/b));assert.equal(q.answerLabel,delivered[0]>=n[0]?(delivered[1]>=n[0]?'Both':'A only'):(delivered[1]>=n[0]?'B only':'Neither'));
  q=get('density',0);n=numbers(q.text);assert.equal(first(q.answerLabel),n[0]/n[1]);
  q=get('density',3);n=numbers(q.text);assert.ok(n[0]/n[1]<1);assert.match(q.answerLabel,/float/);
  q=get('graphs',3);const {x,y}=q.figure;let best=0;for(let k=1;k<x.length-1;k++)if((y[k]-y[k+1])/(x[k+1]-x[k])>(y[best]-y[best+1])/(x[best+1]-x[best]))best=k;assert.equal(q.answerLabel,`${x[best]}–${x[best+1]} minutes`);assert.ok(y.every(v=>v>=20));
 }
});
test('circuit keys follow topology including a broken common return, not distance on the page',()=>{
 for(let i=0;i<150;i++)for(const f of [0,1,3]){const q=B.make('circuits',f,i),open=q.figure.open;assert.match(q.answerLabel,open==='common'?/Neither/:new RegExp('Only (?:bulb )?'+(open==='A'?'B':'A')));}
});
test('statement ordering and choice ordering vary but rearranging an identical prompt cannot create novelty',()=>{
 const keys=new Set(),repeats=new Map();for(let i=0;i<100;i++){const q=B.make('circuits',2,i);keys.add(q.answer.split(':')[0]);repeats.set(q.fingerprint,q.text);}
 assert.ok(keys.size>=3);assert.equal(repeats.size,1,'only option order changed');
});
test('scientific statements retain their truth when shuffled and eclipse variants depend on alignment',()=>{
 for(let i=0;i<100;i++){
  const q=B.make('earth',3,i),truth=q.answer.split(':')[0].slice(1);q.statements.forEach((s,k)=>{const expected=/configuration produces/.test(s)?q.figure.aligned:/Ordinary Moon phases/.test(s);assert.equal(truth[k],expected?'1':'0',s);});
  const ice=B.make('matter',3,i),mass=first(ice.text),bits=ice.answer.split(':')[0].slice(1);ice.statements.forEach((s,k)=>{const expected=/Total mass stays/.test(s)?first(s)===mass:/change in volume/.test(s);assert.equal(bits[k],expected?'1':'0');});
 }
});
test('separate science state is additive; earlier choice-only success cannot grant new evidence',()=>{
 const s={learning:{attempts:[{id:'math'}]},entrance:M.fresh(),science:{attempts:[{skill:'circuits',firstCorrect:false,at:now},{skill:'circuits',firstCorrect:false,at:now+1}]},coins:70,catFriends:{unlocked:['miso']}};const before=JSON.stringify(s);assert.equal(E.recommend(s,now+5).unit,'circuits');const {sciencePath,...rest}=s;assert.equal(JSON.stringify(rest),before);assert.equal(sciencePath.attempts.length,0);assert.equal(E.report(sciencePath).qualifyingPapers,0);
});
test('a right conclusion and wrong reason are recorded separately; correction cannot erase the first miss',()=>{
 const d=E.fresh();taught(d,'measurement');const a=answer(d,'measurement','apply',32,now+100,true);assert.equal(a.correct,false);assert.equal(a.firstComponents.claim,true);assert.equal(a.firstComponents.reason,false);
 E.touchDraft(d,{answer:E.question(d.draft).answer},now+110);const b=E.respond(d,now+111).attempt;assert.equal(b.correct,true);assert.equal(b.firstCorrect,false);assert.equal(b.independent,false);assert.equal(d.attempts.length,1);assert.equal(E.validate(d).attempts[0].firstComponents.reason,false);
});
test('incomplete selections and invalid packets do not become science mistakes',()=>{
 const d=E.fresh();E.startPractice(d,'circuits',{now});for(const s of ['','c1:r-1','s1--:r2','c9:r0','c0:r99','malformed']){E.touchDraft(d,{answer:s});assert.equal(E.respond(d,now+1).ok,false);}assert.equal(d.attempts.length,0);
});
test('guided help, guessing and solution reveal cannot certify independent performance',()=>{
 for(const kind of ['guided','guess','hint','reveal']){const d=E.fresh();taught(d,'measurement');E.startPractice(d,'measurement',{phase:kind==='guided'?'guided':'apply',seed:77,now:now+100});const q=E.question(d.draft);if(kind==='guess')E.touchDraft(d,{guess:true});if(kind==='hint'||kind==='reveal')E.help(d,kind==='reveal');E.touchDraft(d,{answer:q.answer});const a=E.respond(d,now+120).attempt;assert.equal(a.correct,true);assert.equal(a.independent,false);assert.equal(E.validate(d).attempts[0].independent,false);}
});
test('application progresses to changed-structure practice and recall requires a full week',()=>{
 const d=E.fresh();taught(d,'measurement');answer(d,'measurement','apply',2,now+100);answer(d,'measurement','apply',87,now+200);assert.equal(E.evidence(d,'measurement',now+1000).stage,'Connect');const a=answer(d,'measurement','transfer',97,now+300);E.finishPractice(d);assert.notEqual(E.recommend({sciencePath:d},a.answeredAt+7*day-1).kind,'recall');assert.equal(E.recommend({sciencePath:d},a.answeredAt+7*day+1).kind,'recall');answer(d,'measurement','recall',144,a.answeredAt+7*day+2);assert.equal(E.evidence(d,'measurement',now+8*day).delayed,1);
 E.visit(d,'measurement',0,now+20*day);answer(d,'measurement','recall',222,now+20*day+100);assert.equal(E.evidence(d,'measurement',now+21*day).delayed,1);
});
test('reserved science papers have 24 questions, six per strand and no overlap across five forms',()=>{
 const seen=new Set();for(const def of E.paperDefinitions){const qs=E.paperQuestions(def.id);assert.equal(qs.length,def.kind==='paper'?24:6);assert.equal(def.minutes,def.kind==='paper'?60:0);if(def.kind==='paper')for(const strand of Object.keys(D.strands))assert.equal(qs.filter(q=>q.strand===strand).length,6);for(const q of qs){assert.ok(!seen.has(q.fingerprint),q.id);seen.add(q.fingerprint);}assert.deepEqual(E.paperQuestions(def.id),qs);}
});
test('submitted papers are frozen; original deadlines survive backup and late edits are blocked',()=>{
 const d=E.fresh(),p=E.startPaper(d,'mixed-a',now),q=E.paperQuestions('mixed-a')[0];E.savePaperAnswer(d,p.id,0,{answer:wrong(q),working:'first'},now+2);E.savePaperAnswer(d,p.id,0,{answer:q.answer,working:'revised'},now+3);assert.equal(E.scorePaper(d,p.id),null);E.submitPaper(d,p.id,now+10);const score=E.scorePaper(d,p.id);assert.equal(score.correct,1);assert.equal(score.results[0].components.reason,true);assert.notEqual(score.results[0].answerDisplay,q.answer);assert.equal(E.savePaperAnswer(d,p.id,0,{answer:wrong(q)},now+20),false);
 const late=E.fresh(),l=E.startPaper(late,'mixed-a',now),v=E.validate(late);assert.equal(v.papers[l.id].deadline,now+60*60000);assert.equal(E.savePaperAnswer(v,l.id,0,{answer:q.answer},l.deadline+1),false);
});
test('three perfect structured papers still need adult-reviewed written explanations and external corroboration',()=>{
 const d=E.fresh();for(const [i,id]of ['mixed-a','mixed-b','mixed-c'].entries())assert.equal(fill(d,id,now+i*day).percent,100);assert.equal(E.report(d).internalTarget,false);for(const strand of Object.keys(D.strands)){const a=d.attempts.find(a=>E.unit(a.unit).strand===strand);E.review(d,a.id,'valid','Adult checked evidence and scientific link.',now+4*day);}assert.equal(E.report(d).internalTarget,true);assert.equal(E.report(d).externalReported,false);assert.match(E.report(d).limits.join(' '),/not an admissions cutoff/);
});
test('pausing, assistance, exposure and concurrent conflict prevent a qualifying paper score',()=>{for(const flag of ['interrupted','assisted','seenBefore','conflicted']){const d=E.fresh();E.startPaper(d,'mixed-a',now);d.papers['mixed-a'][flag]=true;assert.equal(fill(d,'mixed-a',now).qualifying,false,flag);}});
test('science merge preserves wrong-first reasoning, help and completed papers conservatively',()=>{
 const d=E.fresh();answer(d,'measurement','apply',14,now+100,true);const a=E.validate(d),b=E.validate(d);E.touchDraft(b,{answer:E.question(b.draft).answer},now+120);E.respond(b,now+121);E.help(a);const x=E.merge(a,b);assert.equal(x.attempts[0].correct,true);assert.equal(x.attempts[0].independent,false);assert.deepEqual(E.merge(a,b),E.merge(b,a));assert.deepEqual(E.merge(x,x),x);
 const p=E.fresh();E.startPaper(p,'mixed-a',now);const left=E.validate(p),right=E.validate(p);E.interruptPaper(left,'mixed-a',now+50);fill(right,'mixed-a',now);assert.equal(E.scorePaper(E.merge(left,right),'mixed-a').independent,false);
});
test('science export and cloud merge keep separate histories and local credentials',()=>{
 const d=E.fresh();answer(d);const ctx={window:{MochiSciencePath:E,MochiEntrance:M},MochiSciencePath:E,MochiEntrance:M,document:{addEventListener(){}},JSON};vm.runInNewContext(fs.readFileSync(require.resolve('../cloud-sync.js'),'utf8').replace('if(window.MochiReady)init();','window.testMerge=mergeState;if(window.MochiReady)init();'),ctx);
 const v=ctx.window.testMerge({sciencePath:d,entrance:M.fresh(),science:{attempts:[]},keys:{openai:'LOCAL'}},{keys:{openai:'REMOTE'}},true);assert.equal(v.sciencePath.attempts.length,1);assert.equal(v.entrance.attempts.length,0);assert.equal(v.keys.openai,'LOCAL');
 const R=require('../learning-review'),L=require('../learning');const backup=R.build({sciencePath:d,entrance:M.fresh(),science:{version:1,attempts:[]},learning:L.fresh(),keys:{openai:'PRIVATE_VALUE'}},'6.1.0');assert.equal(backup.sciencePath.attempts.length,1);assert.ok(backup.sciencePathReview);assert.equal(backup.entrance.attempts.length,0);assert.doesNotMatch(JSON.stringify(backup),/PRIVATE_VALUE/);
});
test('science figures cover each configured type with original safe markup and no powered-bulb answer cue',()=>{
 const F=require('../science-path-figures');for(const u of D.units)for(let form=0;form<4;form++){const q=B.make(u.id,form,8321),html=F.diagram(q.figure,q.id);if(q.figure)assert.match(html,/<svg|<table/);assert.doesNotMatch(html,/<script|undefined|NaN|onclick=/);}
 for(const open of ['A','B','common']){const h=F.diagram({type:'circuit',parallel:true,open},'test-'+open);assert.doesNotMatch(h,/H80 235H520|lit="true"|glow/);assert.match(h,/Bulb A/);assert.match(h,/Bulb B/);}
});
test('every new runtime dependency is included exactly once and versioned for offline use',()=>{
 const html=fs.readFileSync(require.resolve('../index.html'),'utf8'),sw=fs.readFileSync(require.resolve('../sw.js'),'utf8'),v=require('../release.json').version;
 for(const f of ['path-core.js','science-path-data.js','science-path-bank.js','science-path-core.js','science-path-figures.js','science-path-ui.js','science-path.css']){assert.equal(html.split('"'+f+'?v=').length-1,1,f);assert.ok(sw.includes(f+'?v='+v),f);}
 assert.ok(html.indexOf('path-core.js?')<html.indexOf('entrance-core.js?'));
});
