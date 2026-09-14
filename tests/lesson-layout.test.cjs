const test=require('node:test'),assert=require('node:assert/strict'),harness=require('./harness.cjs');
function app(){const h=harness(true,true);h.run('studyInit();studioInit();renderQuestion();scInit();scNew();');return h;}
test('an experiment retains the current question and records supported work with handwriting',()=>{
 const h=app();h.run("SCI.choice=SCI.q.answer;SCI.probeChoice=MochiScience.probeFor(SCI.q).answer;SCI.strokes=[[[.1,.2],[.3,.4]]];$('scPrediction').value='The closed path allows the bulb to light.';");
 const state=h.run('JSON.stringify({id:SCI.recordId,q:SCI.q,choice:SCI.choice,probe:SCI.probeChoice,strokes:SCI.strokes})');
 h.run("scShow('investigate');$('scExperiment').ontoggle();");
 assert.equal(h.run('SCI.view'),'science');assert.equal(h.nodes.get('scPractice').hidden,false);
 assert.equal(h.run('JSON.stringify({id:SCI.recordId,q:SCI.q,choice:SCI.choice,probe:SCI.probeChoice,strokes:SCI.strokes})'),state);
 h.run("$('scKeepExperiment').click();");
 assert.equal(h.run('scData().notes.length'),1);assert.equal(h.run('scData().notes[0].strokes.length'),1);
 assert.equal(h.run('scData().attempts.length'),0,'saving a notebook entry is not an answer submission');
 h.run("$('scCheck').click();");
 assert.equal(h.run('SCI.done'),true);assert.equal(h.run('scData().attempts[0].independent'),false);
 assert.equal(h.nodes.get('scCheck').textContent,'Continue');assert.equal(h.nodes.get('scNext').hidden,true);
 h.run("$('scCheck').click();");assert.equal(h.run('SCI.done'),false);assert.equal(h.run('scData().attempts.length'),1);
 assert.equal(h.nodes.get('scExperiment').open,false);assert.equal(h.nodes.get('scCheck').textContent,'Check my answer');
});
test('legacy experiment entry cannot expose model controls in an independent check',()=>{
 const h=app();h.run("SCI.mode='assessment';SCI.assessment={answers:[]};scNew();scShow('investigate');");
 assert.equal(h.run('SCI.mode'),'assessment');assert.equal(h.nodes.get('scExperiment').hidden,true);
 assert.equal(h.nodes.get('scExperiment').open,false);assert.equal(h.nodes.get('scConceptCheck').hidden,true);
 assert.equal(h.run('SCI.helped'),false);
});
test('the question counter stays on the same question through a wrong answer and revision',()=>{
 const h=app();h.run("$('answerInput').value='999999999';submit();");
 assert.match(h.nodes.get('challengeLabel').textContent,/^Question 1 of /);
 h.run("$('answerInput').value=String(current.answer);submit();");
 assert.match(h.nodes.get('challengeLabel').textContent,/^Question 1 of /);
 h.run("$('nextBtn').click();");assert.match(h.nodes.get('challengeLabel').textContent,/^Question 2 of /);
});
test('a finished session stays complete today and advances on a later day without erasing history',()=>{
 const h=app();h.run("learning().session.finished=true;learning().session.done=learning().session.total;studyInit();renderQuestion();");
 assert.equal(h.run('learning().session.finished'),true);
 assert.equal(h.nodes.get('problemCard').hidden,true);assert.equal(h.nodes.get('sessionFinish').hidden,false);
 h.run("learning().attempts=Object.keys(MochiLearning.skills).filter(id=>!MochiLearning.skills[id].stretch).map(skill=>({id:skill,skill,kind:'diagnostic',at:1,skipped:false}));learning().session.started=Date.now()-86400000;");
 const history=h.run('JSON.stringify(learning().attempts)');h.run('studyInit();renderQuestion();');
 assert.equal(h.run('learning().session.mode'),'review');assert.equal(h.run('learning().session.done'),0);
 assert.equal(h.nodes.get('problemCard').hidden,false);assert.equal(h.run('JSON.stringify(learning().attempts)'),history);
 h.run('learning().session.done=3;learning().session.started=Date.now()-86400000;');
 const session=h.run('JSON.stringify(learning().session)');h.run('studyInit();');
 assert.equal(h.run('JSON.stringify(learning().session)'),session,'unfinished sessions keep their place');
});
