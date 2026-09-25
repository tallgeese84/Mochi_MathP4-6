const test=require('node:test'),assert=require('node:assert/strict'),harness=require('./harness.cjs');
const C=require('../course-core.js'),P=require('../planner-core.js'),T=require('../teaching-core.js'),SC=require('../science-core.js');
const NOW=Date.UTC(2026,8,24,22),DAY=86400000;
function setup(){const h=harness(true,true);h.run("studyInit();MochiLearning.start(learning(),'daily');learning().attempts=[];");return h;}
function add(h,a){h.run(`MochiLearning.record(learning(),${JSON.stringify({kind:'daily',tries:1,hints:0,model:false,revealed:false,confidence:'unsure',...a})})`);}
function failPair(h,generator,skill){for(let i=0;i<2;i++)add(h,{id:'fail'+i,at:NOW+i,generator,skill,firstCorrect:false,correct:false,difficulty:2});}
function focus(h,skill){h.run(`learning().session.focusSkill='${skill}';`);}
for(const [generator,skill,key,unit]of [['gst','percent','gstDirection','m-percent'],['cubeEdge','volume','cubeEdge','m-volume']]){
 test(`${generator}: two misses start the matching lesson, never a third numeric variant`,()=>{
  const h=setup();focus(h,skill);add(h,{id:'one',at:NOW-1,generator,skill,firstCorrect:false,correct:false});
  assert.equal(h.run(`MochiRepair.pending(learning(),${NOW+5}).some(x=>x.key==='${key}')`),false);
  add(h,{id:'two',at:NOW,generator,skill,firstCorrect:false,correct:false});
  const next=h.run(`MochiLearning.choose(learning(),BANK,${NOW+5})`);
  assert.equal(next.repair.key,key);assert.equal(next.repair.stage,0);
  assert.equal(next.g().needsTeaching,true);assert.equal(T.lessons[key].unit,unit);
  assert.notEqual(next.id,generator);
  const state={learning:JSON.parse(h.run('JSON.stringify(learning())')),course:C.fresh()};
  assert.equal(P.recommend(state,'maths',NOW+5).unit,unit);
 });
 test(`${generator}: supported checks do not release the guard, and delayed review waits a full day`,()=>{
  const h=setup();focus(h,skill);failPair(h,generator,skill);
  add(h,{id:'helped',at:NOW+10,skill,generator:'repair',repair:{key,stage:0},firstCorrect:true,correct:true,hints:1});
  assert.equal(h.run('MochiTeaching.blocked(learning()).length'),1);
  for(let stage=0;stage<3;stage++)add(h,{id:'stage'+stage,at:NOW+20+stage,answeredAt:NOW+25+stage,skill,generator:h.run(`MochiRepair.tracks.${key}.forms[${stage}]`),repair:{key,stage},firstCorrect:true,correct:true});
  assert.equal(h.run('MochiTeaching.blocked(learning()).length'),0);
  assert.equal(h.run(`MochiRepair.pending(learning(),${NOW+DAY+26})[0].ready`),false);
  assert.equal(h.run(`MochiRepair.pending(learning(),${NOW+DAY+28})[0].ready`),true);
  const restored=h.run('MochiLearning.restore(MochiLearning.backup(learning()))');
  assert.equal(restored.attempts.length,6);
 });
}
test('two misses in another generator use a conceptual gate even during focused practice',()=>{
 const h=setup();focus(h,'area');failPair(h,'rectanglePerimeter','area');
 let next=h.run(`MochiLearning.choose(learning(),BANK,${NOW+10})`);
 assert.equal(next.id,'conceptGateCheck');assert.equal(next.g().teachingKey,'skill:area');
 const gate=next.conceptGate;
 add(h,{id:'gate-wrong',at:NOW+10,generator:next.id,skill:'area',conceptGate:gate,firstCorrect:false,correct:false});
 assert.equal(h.run('MochiTeaching.blocked(learning()).length'),1);
 add(h,{id:'gate-pass',at:NOW+20,generator:next.id,skill:'area',conceptGate:gate,firstCorrect:true,correct:true});
 assert.equal(h.run('MochiTeaching.blocked(learning()).length'),0);
 assert.equal(h.run('MochiLearning.restore(MochiLearning.backup(learning())).attempts.at(-1).conceptGate.generator'),'rectanglePerimeter');
});
test('existing fraction remediation can release the calculation guard',()=>{
 const h=setup();failPair(h,'fracDivWhole','fraction');
 add(h,{id:'foundation',at:NOW+5,skill:'fraction',generator:'repairDivisionCheck',repair:{key:'fractionDivision',stage:0},firstCorrect:true,correct:true});
 assert.equal(h.run('MochiTeaching.blocked(learning()).length'),0);
});
test('four distinct independent variants invite a higher different-form trial, not mastery',()=>{
 const h=setup();focus(h,'ratio');
 for(let i=0;i<4;i++)add(h,{id:'ratio'+i,at:NOW+i,skill:'ratio',generator:'ratioThreeParts',question:'Unique ratio variant '+i,difficulty:2,firstCorrect:true,correct:true});
 const band=h.run("MochiReasoning.band(learning(),'ratio')");
 assert.equal(band.provisional,true);assert.equal(band.target,3);assert.equal(band.confirmed,1);
 const next=h.run(`MochiLearning.choose(learning(),BANK,${NOW+100})`);
 assert.notEqual(next.id,'ratioThreeParts');assert.equal(next.difficulty,3);
 for(let i=4;i<12;i++)add(h,{id:'ratio'+i,at:NOW+i,skill:'ratio',generator:'ratioThreeParts',question:'Unique ratio variant '+i,difficulty:2,firstCorrect:true,correct:true});
 assert.equal(h.run("MochiReasoning.band(learning(),'ratio').confirmed"),1);
 add(h,{id:'transfer',at:NOW+30,skill:'ratio',generator:next.id,question:next.g().text,difficulty:3,firstCorrect:true,correct:true});
 assert.equal(h.run("MochiReasoning.band(learning(),'ratio').confirmed"),3);
 assert.equal(h.run("MochiReasoning.band(learning(),'ratio').provisional"),false);
});
test('identical repeats, guesses and assistance cannot earn a one-form invitation',()=>{
 for(const extra of [{question:'Same exact prompt'}, {hints:1}, {confidence:'guess'}]){
  const h=setup();for(let i=0;i<8;i++)add(h,{id:'a'+i,at:NOW+i,skill:'ratio',generator:'ratioThreeParts',difficulty:2,firstCorrect:true,correct:true,question:'Variant '+i,...extra});
  assert.equal(h.run("MochiReasoning.band(learning(),'ratio').provisional"),false);
 }
});
test('two failed trial questions cancel the provisional step',()=>{
 const h=setup();for(let i=0;i<4;i++)add(h,{id:'a'+i,at:NOW+i,skill:'ratio',generator:'ratioThreeParts',difficulty:2,firstCorrect:true,correct:true,question:'Variant '+i});
 for(let i=0;i<2;i++)add(h,{id:'b'+i,at:NOW+10+i,skill:'ratio',generator:'ratioReverseTotal',difficulty:3,firstCorrect:false,correct:false});
 const band=h.run("MochiReasoning.band(learning(),'ratio')");assert.equal(band.provisional,false);assert.equal(band.target,1);
});
test('new repair multipart answers are independently checked on random numerical samples',()=>{
 const h=setup();for(let i=0;i<100;i++){
  const q=h.run("MochiRepair.generators.find(g=>g.name==='repairGstPractice')()");const cost=+q.text.match(/\$(\d+)/)[1];
  assert.deepEqual(Array.from(q.parts,p=>p.answer),[cost*.09,cost*1.09].map(n=>Math.round(n*100)/100));
  const r=h.run("MochiRepair.generators.find(g=>g.name==='repairGstReview')()");const price=+r.text.match(/\$(\d+)/)[1];
  assert.deepEqual(Array.from(r.parts,p=>p.answer),[price*109/100,price*91/100]);
  const c=h.run("MochiRepair.generators.find(g=>g.name==='repairCubeReview')()");const volume=+c.text.match(/volume (\d+)/)[1],edge=Math.round(Math.cbrt(volume));
  assert.deepEqual(Array.from(c.parts,p=>p.answer),[edge,(edge+1)**3]);
 }
});
test('circuit contradiction flags are prompts, not an automatic free-text grade',()=>{
 for(const text of ['The current escapes through the gap.','The switch lets out energy.','The current will flood into the second bulb.'])assert.ok(SC.explanationSignal({skill:'circuits',explanation:text}));
 for(const text of ['Current does not escape through the gap.','It is not true that the current floods into the other bulb.','I need help explaining this.'])assert.equal(SC.explanationSignal({skill:'circuits',explanation:text}),'');
 assert.equal(SC.explanationSignal({skill:'heat',explanation:'Energy escapes from the hot water.'}),'');
});
test('correct circuit choices with a flagged explanation do not earn independence and route to electricity',()=>{
 const q=SC.items.find(q=>q.id==='c-return-wire'),p=SC.probeFor(q),data=SC.fresh();
 const a=SC.record(data,{id:'circuit',at:NOW,item:q.id,skill:q.skill,choice:q.answer,correct:true,firstCorrect:true,concept:{id:p.id,choice:p.answer,firstCorrect:true},explanation:'The current escapes through the gap.'});
 assert.equal(a.independent,false);assert.equal(a.conceptIndependent,false);
 const next=SC.choose(data,'practice','circuits',NOW+1);assert.equal(next.needsTeaching,true);assert.notEqual(next.id,q.id);assert.equal(!!next.assessment,false);
 assert.equal(P.recommend({science:data,course:C.fresh()},'science',NOW+2).unit,'s-electricity');
 assert.equal(P.records({science:data}).filter(a=>a.independent).length,0);
});
test('science legacy choice-only attempts stay intact but do not become concept mastery',()=>{
 const raw={version:1,attempts:[{id:'',item:'c-path',at:NOW,choice:0,correct:true,firstCorrect:true},{id:'',item:'c-series',at:NOW+1,choice:1,correct:true,firstCorrect:true}]};
 const s=SC.validate(raw);assert.equal(s.attempts.length,2);assert.ok(s.attempts.every(a=>!a.independent));
 const records=P.records({science:s});assert.equal(records.length,2);assert.ok(records.every(a=>!a.independent));
});
test('linked lesson outcomes survive restore and merge without doubling subject question totals',()=>{
 const c=C.fresh(),a={id:'original-1',at:NOW,answeredAt:NOW+10,skill:'percent',generator:'repairGstCheck',repair:{key:'gstDirection',stage:0},teachingKey:'gstDirection',question:'Synthetic GST concept question',correct:true,firstCorrect:true,tries:1,lessonCompletedAt:NOW-10};
 C.recordLinked(c,a,'maths');C.recordLinked(c,a,'maths');assert.equal(c.attempts.length,1);assert.equal(c.attempts[0].phase,'exit');
 const restored=C.validate(c);assert.equal(restored.attempts[0].originalId,a.id);assert.equal(restored.attempts[0].independent,true);
 assert.equal(P.records({learning:{attempts:[a]},course:restored}).length,1);
 const b=C.validate(c);Object.assign(b.attempts[0],{firstCorrect:false,helped:true,reasoningFlag:true,answeredAt:NOW+5});
 const merged=C.merge(c,b);assert.equal(merged.attempts.length,1);assert.equal(merged.attempts[0].independent,false);assert.equal(merged.attempts[0].firstCorrect,false);assert.equal(merged.attempts[0].reasoningFlag,true);
 assert.equal(C.report(merged).linkedPractice.recorded,1);assert.equal(C.evidence(merged,'m-percent').attempts,0);
});
test('opening a textbook does not falsely timestamp a completed mini-lesson',()=>{
 const c=C.fresh();C.startPractice(c,'m-number',NOW);
 C.recordLinked(c,{id:'number',at:NOW+10,skill:'number',generator:'placeValue',correct:true,firstCorrect:true},'maths');
 assert.equal(c.attempts[0].lessonCompletedAt,0);
});
test('already earned companion milestones are preserved under the stricter new evidence rules',()=>{
 const p=P.fresh();p.milestones['science:electricity:idea']={subject:'science',skill:'electricity',kind:'idea',earnedAt:NOW,evidence:['old-record']};
 const restored=P.validate(p);assert.deepEqual(restored.milestones,p.milestones);
});
