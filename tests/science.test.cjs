const test=require('node:test'),assert=require('node:assert/strict'),harness=require('./harness.cjs');
const C=require('../science-core.js');
test('circuits preserve continuity and distinguish a broken series path from a parallel branch',()=>{
 for(const cells of [1,2])for(const bulbs of [1,2])for(const parallel of [false,true])for(const closed of [false,true])for(const broken of [false,true]){
  const m=C.circuit({cells,bulbs,parallel,closed,broken});
  assert.equal(m.lit,closed&&(!broken||parallel&&bulbs===2));
  assert.equal(m.active,m.lit?(broken?1:bulbs):0);
 }
 const s={cells:1,bulbs:2,closed:true,broken:false};assert.ok(C.circuit({...s,parallel:true}).power>C.circuit({...s,parallel:false}).power);
});
test('point-source shadow follows similar triangles at limits and intermediate positions',()=>{
 for(let object=25;object<=75;object+=5)for(let height=8;height<=24;height+=4){const m=C.shadow({object,height});assert.ok(Math.abs(m.shadow*object-90*height)<1e-9);}
 assert.ok(C.shadow({object:25,height:18}).shadow>C.shadow({object:75,height:18}).shadow);
});
test('cooling model shares initial conditions and approaches ambient without crossing it',()=>{
 assert.equal(C.cooling({minutes:0}).bare,80);assert.equal(C.cooling({minutes:0}).wrapped,80);
 let last=80;for(let t=1;t<=20;t++){const m=C.cooling({minutes:t});assert.ok(m.bare<last&&m.bare>20&&m.wrapped>m.bare&&m.wrapped<80);last=m.bare;}
});
test('balanced forces mean zero acceleration, opposing net force slows right-moving cart',()=>{
 assert.equal(C.force({push:3,friction:3}).acceleration,0);assert.equal(C.force({push:3,friction:5}).acceleration,-1);
});
test('authored science bank has valid unique questions and reserves one check per skill',()=>{
 assert.equal(new Set(C.items.map(q=>q.id)).size,C.items.length);assert.equal(C.items.length,32);
 for(const skill of Object.keys(C.skills)){const qs=C.items.filter(q=>q.skill===skill);assert.equal(qs.length,4);assert.equal(qs.filter(q=>q.assessment).length,1);}
 for(const q of C.items){assert.ok(q.why&&q.prompt);assert.ok(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<q.choices.length);assert.equal(new Set(q.choices).size,q.choices.length);}
});
test('practice never uses reserved questions; exposed assessment questions do not recycle',()=>{
 const d=C.fresh();for(let i=0;i<100;i++){const q=C.choose(d);assert.ok(!q.assessment);d.attempts.push({item:q.id,skill:q.skill,at:Date.now(),firstCorrect:true,correct:true,independent:true});}
 const ids=[];for(let i=0;i<8;i++){const q=C.choose(d,'assessment');assert.ok(q.assessment);ids.push(q.id);d.seenAssess.push(q.id);}assert.equal(new Set(ids).size,8);assert.equal(C.choose(d,'assessment'),null);
});
test('science backup recomputes independence and retains explanations, drafts and ink',()=>{
 const d=C.fresh();d.attempts.push({item:'c-path',skill:'plants',at:1,correct:true,firstCorrect:true,helped:true,independent:true,explanation:'My words',strokes:[[[.1,.2],[.3,.4]]]});d.drafts.circuits={prediction:'A prediction',explanation:'An explanation',strokes:[[[2,-1],[.5,.5]]]};
 const v=C.validate(JSON.parse(JSON.stringify(d)));assert.equal(v.attempts[0].independent,false);assert.equal(v.attempts[0].skill,'circuits');assert.equal(v.attempts[0].explanation,'My words');assert.deepEqual(v.attempts[0].strokes,[[[.1,.2],[.3,.4]]]);assert.deepEqual(v.drafts.circuits.strokes[0][0],[1,0]);
});
function studio(){const h=harness(true,true);h.run('scInit();scNew();');return h;}
test('science revision stays open and supported correct answers never become independent',()=>{
 const h=studio();h.nodes.get('scExplanation').value='A closed path connects both terminals.';
 h.run('SCI.choice=1;scCheck();');assert.equal(h.run('SCI.done'),false);assert.equal(h.run('SCI.tries'),1);
 h.run('SCI.choice=SCI.q.answer;SCI.helped=true;scCheck();');assert.equal(h.run('scData().attempts.at(-1).independent'),false);assert.equal(h.run('scData().attempts.at(-1).firstCorrect'),false);
});
test('trial requires prediction and records model state without submitting an answer',()=>{
 const h=studio();h.run('scTest();');assert.equal(h.run('SCI.trials.length'),0);
 h.nodes.get('scPrediction').value='Both bulbs will light with the switch closed.';h.run("scChange('closed',true);scTest();");assert.equal(h.run('SCI.trials.length'),1);assert.equal(h.run('SCI.trials[0].result.lit'),true);assert.equal(h.run('scData().attempts.length'),0);
});
test('eight-question independent check stores answers and withholds feedback until completion',()=>{
 const h=studio();h.run("SCI.mode='assessment';SCI.assessment={answers:[]};$('scTopic').value='';scNew();");
 for(let i=0;i<8;i++){h.nodes.get('scExplanation').value='I can justify this relationship.';h.run('SCI.choice=SCI.q.answer;scCheck();');if(i<7)assert.equal(h.nodes.get('scAssessmentResults').hidden,true);}
 assert.equal(h.run('scData().attempts.length'),8);assert.equal(h.run('scData().attempts.every(a=>a.independent)'),true);assert.equal(h.nodes.get('scAssessmentResults').hidden,false);
});
test('subject switching preserves maths answer and science notes',()=>{
 const h=studio();h.nodes.get('answerInput').value='42';h.nodes.get('scExplanation').value='My plant idea';h.run("scShow('science');scShow('maths');");assert.equal(h.nodes.get('answerInput').value,'42');assert.equal(h.run('scData().drafts.circuits.explanation'),'My plant idea');
});
test('assessment prevents experiment mutation and exposing the concept',()=>{
 const h=studio();h.run("SCI.mode='assessment';SCI.assessment={answers:[]};scNew();");const before=h.run('JSON.stringify(SCI.state)');h.run("scChange('closed',false);scTest();");assert.equal(h.run('JSON.stringify(SCI.state)'),before);assert.equal(h.nodes.get('scConcept').hidden,true);assert.equal(h.nodes.get('scControls').disabled,true);
});
test('guesses and restored inconsistent choices cannot claim independent understanding',()=>{
 const h=studio();h.nodes.get('scExplanation').value='This is my tentative explanation.';h.nodes.get('scGuess').checked=true;h.run('SCI.choice=SCI.q.answer;scCheck();');assert.equal(h.run('scData().attempts.at(-1).independent'),false);
 const d=C.fresh();d.attempts.push({item:'c-path',at:1,choice:2,correct:true,firstCorrect:true,independent:true});assert.equal(C.validate(d).attempts[0].correct,false);assert.equal(C.validate(d).attempts[0].independent,false);
});
test('a late science tutor reply cannot overwrite the next subject view',async()=>{
 const h=studio();h.run("netReady=()=>true;callModel=()=>new Promise(resolve=>globalThis.finishScienceReply=resolve);SCI.view='science';");
 const pending=h.run('scAsk()');h.run("scShow('maths');$('scReply').textContent='A different view';finishScienceReply('Late answer');");await pending;assert.equal(h.nodes.get('scReply').textContent,'A different view');
});
