const test=require('node:test'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const E=require('../entrance-core.js'),G=require('../geometry-bridge.js'),V=require('../geometry-visuals.js'),T=require('../today-core.js'),F=require('../cat-friends-core.js');
const now=Date.UTC(2026,8,29,18),copy=x=>JSON.parse(JSON.stringify(x));
function teach(d,id,t=now){for(let p=0;p<3;p++)E.visit(d,id,p,t+p);E.concept(d,id,E.unit(id).check[2],t+3);E.complete(d,id,t+4);}
function answer(d,id,phase='apply',seed=10,t=now+100,wrong=false){E.finishPractice(d);const v=E.startPractice(d,id,{phase,seed,now:t}),q=E.question(v);E.touchDraft(d,{answer:wrong?'99999':q.answerLabel,working:'Synthetic method'},t+1);return E.respond(d,t+2).attempt;}
function pass(d,id,t=now){teach(d,id,t);answer(d,id,'apply',3,t+10);answer(d,id,'apply',2654435761,t+20);answer(d,id,'transfer',120,t+30);E.finishPractice(d);}

test('unit cubes, layer counts and surface faces agree with an independent coordinate enumeration',()=>{
 for(let a=1;a<=5;a++)for(let b=1;b<=5;b++)for(let c=1;c<=5;c++){
  const m=G.solid({across:a,deep:b,high:c}),cells=new Set(m.cells.map(p=>p.join(',')));let faces=0;
  for(const k of cells){const p=k.split(',').map(Number);for(let axis=0;axis<3;axis++)for(const step of [-1,1]){const q=p.slice();q[axis]+=step;if(!cells.has(q.join(',')))faces++;}}
  assert.equal(m.volume,cells.size);assert.equal(m.surface,faces);assert.equal(m.faces.length,faces);assert.equal(m.layer,a*b);
 }
 const m=G.solid({across:4,deep:4,high:4,layers:2});assert.equal(m.volume,32);assert.equal(m.layers,2);
});
test('joining cubes hides two faces per join, while changing the inspection gap changes no quantities',()=>{
 for(let n=1;n<=5;n++)for(let edge=1;edge<=4;edge++){
  const m=G.row(n,edge,0),exploded=G.row(n,edge,edge);assert.equal(m.hidden,2*(n-1));assert.equal(m.exposed,4*n+2);
  assert.equal(m.surface,2*(n*edge*edge+n*edge*edge+edge*edge));assert.equal(m.volume,n*edge**3);
  assert.equal(exploded.surface,m.surface);assert.equal(exploded.volume,m.volume);assert.equal(exploded.faces.filter(f=>f.internal).length,m.hidden);
 }
});
test('hinged cube net has six congruent faces and closes onto three correct opposite pairs',()=>{
 const lengths=f=>f.points.map((p,i)=>Math.hypot(...p.map((x,k)=>x-f.points[(i+1)%4][k])));
 for(const t of [0,.25,.5,.75,1])for(const f of G.foldNet(t))for(const x of lengths(f))assert.ok(Math.abs(x-1)<1e-9);
 const centre=f=>[0,1,2].map(i=>f.points.reduce((s,p)=>s+p[i],0)/4),net=G.foldNet(1),a=Object.fromEntries(net.map(f=>[f.label,centre(f)]));
 for(const [x,y]of [['A','F'],['B','C'],['D','E']])assert.ok(Math.abs(Math.hypot(...a[x].map((v,i)=>v-a[y][i]))-1)<1e-9);
 const unique=new Set(net.flatMap(f=>f.points).map(p=>p.map(x=>x.toFixed(5)).join(',')));assert.equal(unique.size,8);
});
test('rotating actual 3D points preserves lengths and produces finite SVG in all orthographic views',()=>{
 const m=G.solid({across:3,deep:3,high:3});for(const yaw of [-Math.PI,-.6,0,Math.PI/2])for(const pitch of [-Math.PI/2,0,.4,Math.PI/2]){
  const p=[2,3,4],q=G.rotate(p,yaw,pitch);assert.ok(Math.abs(Math.hypot(...p)-Math.hypot(...q))<1e-9);
  const svg=V.project(m.faces,m.centre,yaw,pitch);assert.ok(svg.includes('<polygon'));assert.doesNotMatch(svg,/NaN|Infinity|undefined/);
 }
});
test('new bridge lessons gate complex solids but do not reset proven existing skills',()=>{
 const d=E.fresh();assert.equal(E.prerequisite(d,'volume',now),'geo-measure');pass(d,'geo-measure');assert.equal(E.prerequisite(d,'volume',now+100),'geo-layers');pass(d,'geo-layers',now+1000);assert.equal(E.prerequisite(d,'volume',now+2000),'geo-surface');pass(d,'geo-surface',now+3000);assert.equal(E.prerequisite(d,'volume',now+4000),null);
 const proficient=E.fresh();pass(proficient,'volume');assert.equal(E.prerequisite(proficient,'volume',now+100),null);
});
test('a struggling saved volume question routes to a visual lesson without erasing that draft or its working',()=>{
 const d=E.fresh();answer(d,'volume','apply',7,now+10,true);const original=copy(d.draft);const s={entrance:d};const t=T.task(s,'maths',now+50);assert.equal(t.kind,'lesson');assert.equal(t.unit,'geo-measure');assert.deepEqual(d.draft,original);
});
test('targeted geometry blocks still include a taught algebra strength after three geometry questions',()=>{
 const d=E.fresh();pass(d,'rates');answer(d,'volume','apply',5,now+100,true);answer(d,'volume','apply',6,now+200,true);answer(d,'volume','apply',7,now+300,true);E.finishPractice(d);
 const r=E.recommend({entrance:d},now+400);assert.equal(r.strength,true);assert.equal(r.unit,'rates');
 answer(d,'rates','apply',101,now+500);E.finishPractice(d);assert.equal(E.recommend({entrance:d},now+600).unit,'geo-measure');
});
test('rapid identical submissions are not extra mistakes; a changed answer or changed working is preserved',()=>{
 const d=E.fresh();const a=answer(d,'angles','apply',1,now+10,true);for(let i=0;i<10;i++){const r=E.respond(d,now+20+i);assert.equal(r.duplicate,true);}assert.equal(a.responses.length,1);
 E.touchDraft(d,{working:'A different geometric argument'},now+50);assert.equal(E.respond(d,now+51).attempt.responses.length,2);
 E.touchDraft(d,{answer:E.question(d.draft).answerLabel},now+60);const r=E.respond(d,now+61);assert.equal(r.attempt.correct,true);assert.equal(r.attempt.firstCorrect,false);assert.equal(r.attempt.independent,false);
});
test('visual help uses existing support flags, which survive export, cloud merge and answer revision',()=>{
 const d=E.fresh();teach(d,'geo-layers');E.startPractice(d,'geo-layers',{phase:'apply',seed:51,now:now+50});E.help(d);E.touchDraft(d,{answer:E.question(d.draft).answerLabel});E.respond(d,now+100);
 const restored=E.merge(E.exportData(d),E.fresh());assert.equal(restored.attempts[0].correct,true);assert.equal(restored.attempts[0].independent,false);assert.equal(restored.attempts[0].helped,true);
});
test('bridge lesson completion celebrates learning exposure once without adding mastery or altering coins',()=>{
 const state={entrance:E.fresh(),coins:42};teach(state.entrance,'geo-layers');const r=F.report(state,now+100);assert.equal(r.studyPoints,1);assert.equal(r.points,1);assert.equal(state.coins,42);assert.equal(E.evidence(state.entrance,'geo-layers',now+100).independent,0);
 for(let i=0;i<5;i++)F.sync(state,now+100+i);assert.equal(F.report(state).studyPoints,1);const merged=F.merge(state.catFriends,state.catFriends);assert.equal(merged.studyAwards.length,1);
});
test('a corrected answer earns a recovery point only after a different fresh independent follow-up',()=>{
 const d=E.fresh(),state={entrance:d,coins:5};answer(d,'angles','apply',10,now+10,true);E.help(d,true);E.touchDraft(d,{answer:E.question(d.draft).answerLabel},now+20);E.respond(d,now+21);assert.equal(F.report(state).studyPoints,0);
 answer(d,'angles','apply',200,now+30);assert.equal(F.report(state).studyPoints,1);F.sync(state);assert.equal(F.report(state).studyPoints,1);assert.equal(state.coins,5);
});
test('reserved paper questions are byte-for-byte identical to the v6.6.0 blueprint',()=>{
 const digest=crypto.createHash('sha256').update(JSON.stringify(E.paperDefinitions.map(p=>E.paperQuestions(p.id)))).digest('hex');assert.equal(digest,'b771c2d33015cb17f5067d7735b09b478c20201fd6a79d5d72f83c400c661360');
 for(const p of E.paperDefinitions)assert.ok(p.units.every(id=>!id.startsWith('geo-')));
});
