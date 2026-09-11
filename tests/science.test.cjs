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

test('new illustrated explanations remain hidden until a supported trial and in independent checks',()=>{
 const h=studio();
 for(const skill of ['body','heat']){
  h.run(`SCI.skill='${skill}';SCI.state=MochiScience.copy(MochiScience.defaults[SCI.skill]);SCI.shown=false;scPaintVisual();`);
  const marker=skill==='body'?'class="sc-route"':'class="sc-chart-detail"';
  assert.equal(h.nodes.get('scVisual').innerHTML.includes(marker),false);
  h.nodes.get('scPrediction').value='I predict a connection and will test it.';h.run('scTest();');
  assert.equal(h.nodes.get('scVisual').innerHTML.includes(marker),true);assert.equal(h.run('SCI.helped'),true);
  h.run("SCI.mode='assessment';SCI.shown=true;scPaintVisual();scTest();");
  assert.equal(h.nodes.get('scVisual').innerHTML.includes(marker),false);
  h.run("SCI.mode='practice';");
 }
});
test('cart force arrows use equal scales for opposing forces and stay clear of the painted image',()=>{
 const h=studio();
 for(let push=0;push<=8;push++)for(let friction=0;friction<=5;friction++){
  const html=h.run(`MochiScienceScenes.figure('forces',{push:${push},friction:${friction}},false)`);
  const arrows=[...html.matchAll(/<path d="M(\d+) (\d+)h(-?\d+)"[^>]*opacity="(\d)"/g)];
  assert.equal(arrows.length,2);
  assert.equal(Number(arrows[0][3]),push*22);assert.equal(Number(arrows[1][3]),-friction*22);
  assert.equal(Number(arrows[0][4]),push?1:0);assert.equal(Number(arrows[1][4]),friction?1:0);
  assert.ok(Number(arrows[0][2])+7<86);assert.ok(Number(arrows[1][2])-7>266);
  assert.equal((html.match(/markerUnits="userSpaceOnUse"/g)||[]).length,3);
 }
});


test('water trials match starting states, heat direction and displayed final states',()=>{
 const h=studio();
 const cases=[['melting','solid','Liquid: water',/gains heat.*melts into liquid water/],['freezing','liquid','Solid: ice',/loses heat.*freezes into ice/],['evaporation','liquid','Gas: water vapour',/gains heat.*evaporates.*water vapour/],['condensation','gas','Liquid: water',/loses heat.*condenses into liquid water/]];
 for(const [process,state,finalLabel,explanation] of cases){
  h.run(`SCI.skill='matter';SCI.state={state:'${state}',process:'${process}'};SCI.shown=false;scPaintVisual();`);
  h.nodes.get('scPrediction').value='I predict a change of state when heat is transferred.';h.run('scTest();');
  assert.match(h.nodes.get('scObservation').textContent,explanation);
  assert.ok(h.nodes.get('scVisual').innerHTML.includes(finalLabel));
  assert.equal(h.run('SCI.trials.at(-1).state.state'),state);
 }
 h.run("SCI.state={state:'gas',process:'melting'};scTest();");
 assert.match(h.nodes.get('scObservation').textContent,/start with ice/);
 assert.ok(h.nodes.get('scVisual').innerHTML.includes('Gas: water vapour'));
});

test('unequal-temperature question supplies its actual initial conditions to the trial and graph',()=>{
 const h=studio();h.run("MochiScience.choose=()=>MochiScience.items.find(q=>q.id==='h-evidence');scNew();");
 assert.match(h.nodes.get('scVisual').innerHTML,/Start: 60°C/);assert.match(h.nodes.get('scVisual').innerHTML,/Start: 80°C/);
 h.nodes.get('scPrediction').value='The starting temperatures make this an unfair comparison.';h.run('scTest();');
 assert.equal(h.run('SCI.trials.at(-1).result.bare'),60);assert.equal(h.run('SCI.trials.at(-1).result.wrapped'),80);
 const chart=h.nodes.get('scVisual').innerHTML;
 assert.match(chart,/d="M70 168 /);assert.match(chart,/d="M70 106 /);
 h.run("scChange('minutes',10);scTest();");
 assert.match(h.nodes.get('scObservation').textContent,/Starting temperatures: bare cup 60°C; wrapped cup 80°C/);
 assert.ok(h.run('SCI.trials.at(-1).result.bare')<60);assert.ok(h.run('SCI.trials.at(-1).result.wrapped')<80);
});

test('water particle illustrations preserve particle count and show ice more open than liquid',()=>{
 const h=studio(),areas={};
 for(const state of ['solid','liquid','gas']){
  const html=h.run(`MochiScienceScenes.figure('matter',{state:'${state}',process:'melting'},false)`);
  const points=[...html.matchAll(/<circle cx="([\d.]+)" cy="([\d.]+)" r="9"/g)].map(m=>[Number(m[1]),Number(m[2])]);
  assert.equal(points.length,24);
  const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);
  areas[state]=(Math.max(...xs)-Math.min(...xs))*(Math.max(...ys)-Math.min(...ys));
 }
 assert.ok(areas.solid>areas.liquid);assert.ok(areas.gas>areas.solid);
});

test('maths and science tutor requests carry terminology and alternative-wording guidance',async()=>{
 const h=studio();h.run("studyInit();renderQuestion();netReady=()=>true;globalThis.sentPrompts=[];callModel=async opts=>{sentPrompts.push(opts.system);return 'Explain your reasoning.';};");
 await h.run("askMochi('free','Please explain this maths problem.')");
 await h.run('scAsk()');
 const prompts=JSON.parse(h.run('JSON.stringify(sentPrompts)'));assert.equal(prompts.length,2);
 assert.match(prompts[0],/equivalent fractions/);assert.match(prompts[0],/Accept correct alternative terminology/);
 assert.match(prompts[1],/an AI science tutor/);assert.match(prompts[1],/gullet/);assert.match(prompts[1],/accept it as another name/);assert.match(prompts[1],/water vapour loses heat/);
 assert.match(prompts[1],/not claim|never claim approval/);
});
