const test=require('node:test'),assert=require('node:assert/strict'),harness=require('./harness.cjs');
function setup(){const h=harness(true,true);h.run("studyInit();MochiLearning.start(learning(),'review');learning().attempts=[];");return h;}
function seed(h,generator='repeatedRemainder',skill='fractionProblem') {h.run(`MochiLearning.record(learning(),{id:'miss',generator:'${generator}',skill:'${skill}',at:Date.now()-60000,firstCorrect:false,correct:false,kind:'daily'});`);}
test('previous session errors start a targeted concept check before ordinary review slots',()=>{
 const h=setup();seed(h);h.run('renderQuestion()');assert.equal(h.run('current.repair.key'),'changingWhole');assert.equal(h.run('current.repair.stage'),0);assert.equal(h.run('current.parts.length'),2);
 assert.match(h.nodes.get('studyQuestionNote').textContent,/Check the idea/);
});
test('follow-ups preserve stage through backup and require first-try unassisted success',()=>{
 const h=setup();seed(h,'fracDivWhole','fraction');
 h.run("const initial=MochiRepair.pending(learning())[0];MochiLearning.record(learning(),{id:'try1',generator:'repairDivisionCheck',skill:'fraction',at:Date.now(),firstCorrect:true,correct:true,hints:1,repair:{key:'fractionDivision',stage:0}});");
 assert.equal(h.run('MochiRepair.pending(learning())[0].stage'),0);
 h.run("MochiLearning.record(learning(),{id:'try2',generator:'repairDivisionCheck',skill:'fraction',at:Date.now()+1,firstCorrect:true,correct:true,repair:{key:'fractionDivision',stage:0}});");
 assert.equal(h.run('MochiRepair.pending(learning())[0].stage'),1);
 assert.equal(h.run('MochiLearning.restore(MochiLearning.backup(learning())).attempts.at(-1).repair.stage'),0);
});
test('short repair sequences mix practice and schedule a one-day recall check',()=>{
 const h=setup();seed(h,'percentWhole','percent');
 for(let stage=0;stage<3;stage++)h.run(`MochiLearning.record(learning(),{id:'stage${stage}',generator:MochiRepair.tracks.percentWhole.forms[${stage}],skill:'percent',at:Date.now()+${stage},firstCorrect:true,correct:true,repair:{key:'percentWhole',stage:${stage}}});`);
 assert.equal(h.run('MochiRepair.pending(learning())[0].stage'),3);
 assert.equal(h.run('MochiRepair.pending(learning())[0].ready'),false);
 assert.equal(h.run('MochiRepair.pending(learning(),Date.now()+86400010)[0].ready'),true);
 assert.equal(h.run("MochiLearning.choose(learning(),BANK).repair||null"),null,'mixed slot after two repair questions');
});
test('diagnostic and explicit skill choice are respected; normal pool excludes repair-only generators',()=>{
 const h=setup();seed(h);
 h.run("MochiLearning.start(learning(),'diagnostic');");assert.equal(h.run('MochiLearning.choose(learning(),BANK).repairOnly'),false);
 h.run("MochiLearning.start(learning(),'daily');learning().session.focusSkill='area';");assert.equal(h.run('MochiLearning.choose(learning(),BANK).skill'),'area');
});
test('maths avoids an exact recent repeated question when the generator has alternatives',()=>{
 const h=setup();h.run("let calls=0;const gen=()=>({topic:'Whole numbers',skill:'number',stars:1,text:++calls===1?'Already seen':'New problem',answer:2,steps:['2']});learning().attempts.push({question:'Already seen'});chooseGenerator=()=>gen;renderQuestion();");
 assert.equal(h.run('current.text'),'New problem');
});
test('science saves wrong reasoning immediately, retains revisions and does not certify free text',()=>{
 const h=setup();h.run("scInit();scNew(MochiScience.items.find(q=>q.id==='e-arrow'));SCI.choice=SCI.q.answer;SCI.probeChoice=0;");h.nodes.get('scExplanation').value='The algae eat the snail';h.run('scCheck();');
 assert.equal(h.run('SCI.done'),false);assert.equal(h.run('scData().attempts.length'),1);assert.equal(h.run('scData().attempts[0].correct'),true);assert.equal(h.run('scData().attempts[0].concept.correct'),false);
 h.run('SCI.probeChoice=MochiScience.probeFor(SCI.q).answer;');h.nodes.get('scExplanation').value='The snail eats the algae and obtains energy.';h.run('scCheck();');
 assert.equal(h.run('scData().attempts.length'),1);assert.equal(h.run('scData().attempts[0].responses.length'),2);assert.equal(h.run('scData().attempts[0].conceptIndependent'),false);assert.equal(h.run('SCI.done'),true);
 const restored=h.run('MochiScience.validate(scData())');assert.equal(restored.attempts[0].responses[0].explanation,'The algae eat the snail');
});
test('science requires the reasoning check and repeated questions cannot inflate independent counts',()=>{
 const h=setup();h.run('scInit();scNew();SCI.choice=SCI.q.answer;');h.nodes.get('scExplanation').value='T';h.run('scCheck();');assert.equal(h.run('scData().attempts.length'),0);
 h.run('SCI.probeChoice=MochiScience.probeFor(SCI.q).answer;scCheck();const previous=SCI.q;scNew(previous);SCI.choice=SCI.q.answer;SCI.probeChoice=MochiScience.probeFor(SCI.q).answer;');h.nodes.get('scExplanation').value='T';h.run('scCheck();');
 assert.equal(h.run('scData().attempts[1].repeated'),true);assert.equal(h.run('scData().attempts[1].independent'),false);assert.equal(h.run('scData().attempts[1].conceptIndependent'),false);
 assert.match(h.nodes.get('scFeedback').textContent,/explanation still needs discussion/);
});
test('science recommendation follows a missed concept with a different item and preserves held-out checks',()=>{
 const h=setup();h.run("scInit();scNew(MochiScience.items.find(q=>q.id==='e-arrow'));SCI.choice=SCI.q.answer;SCI.probeChoice=0;");h.nodes.get('scExplanation').value='I need to check the direction.';h.run('scCheck();scNew();');
 assert.equal(h.run('SCI.q.skill'),'ecosystems');assert.notEqual(h.run('SCI.q.id'),'e-arrow');assert.equal(h.run('!!SCI.q.assessment'),false);
});

test('legacy missed food-chain direction gets a fresh follow-up despite later correct repeats',()=>{
 const h=setup();h.run("S.science=MochiScience.validate({version:1,attempts:[{item:'e-arrow',at:1,choice:1,correct:true,firstCorrect:false},{item:'e-producer',at:2,choice:0,correct:true,firstCorrect:true},{item:'e-change',at:3,choice:0,correct:true,firstCorrect:true},{item:'e-arrow',at:4,choice:1,correct:true,firstCorrect:true},{item:'h-direction',at:5,choice:1,correct:true,firstCorrect:true}]});");
 assert.equal(h.run('MochiScience.choose(S.science).id'),'e-energy-route');
 assert.equal(h.run('S.science.attempts[3].independent'),false);
});
