const test=require('node:test'),assert=require('node:assert/strict');
const R=require('../reasoning.js'),L=require('../learning.js'),harness=require('./harness.cjs');
const at=Date.UTC(2026,8,12);
function a(extra={}){return {id:'a',at,skill:'fraction',generator:'fractionSum',kind:'daily',correct:true,firstCorrect:true,hints:0,model:false,revealed:false,confidence:'sure',plan:'Equal-size parts of the same whole',...extra};}
function studio(){const h=harness(true);h.run('studyInit();studioInit();renderQuestion();');return h;}
test('difficulty rises one tier with varied independent work, and falls after repeated misses',()=>{
 const l=L.fresh();for(let i=0;i<4;i++)L.record(l,a({id:String(i),difficulty:1,generator:'same',seconds:1}));assert.equal(R.band(l,'fraction').target,1);
 L.record(l,a({id:'other',difficulty:1,generator:'other',seconds:900}));assert.equal(R.band(l,'fraction').target,2);
 for(let i=0;i<2;i++)L.record(l,a({id:'level2-'+i,difficulty:2,generator:'form'+i,seconds:900}));assert.equal(R.band(l,'fraction').target,3);
 for(let i=0;i<2;i++)L.record(l,a({id:'miss-'+i,difficulty:3,firstCorrect:false,correct:false,seconds:1}));assert.equal(R.band(l,'fraction').target,2);
 const assisted=L.fresh();for(let i=0;i<4;i++)L.record(assisted,a({id:String(i),difficulty:2,generator:'form'+i,hints:1}));assert.equal(R.band(assisted,'fraction').target,1);
 const legacy=L.fresh();for(let i=0;i<4;i++)L.record(legacy,a({id:String(i),generator:'form'+i}));assert.equal(R.band(legacy,'fraction').target,1,'historical records without difficulty cannot justify a tier jump');
});
test('concept-probe evidence keeps repair on the tested skill; passing it does not prove mastery',()=>{
 const h=harness(),l=L.fresh();L.start(l,'daily');l.session.done=2;
 L.record(l,a({skill:'fractionProblem',firstCorrect:false,correct:false,probe:{skill:'fractionProblem',choice:0,correct:false,checks:'the changing reference whole'}}));
 const selected=L.choose(l,h.run('BANK'));assert.equal(selected.skill,'fractionProblem');assert.match(selected.reason,/concept check/);
 assert.notEqual(L.evidence(l,'fractionProblem').level,'Retained in practice');
});
test('a focus session stays on the chosen core skill, while extension stays separate',()=>{
 const h=harness(),l=L.fresh();L.start(l,'daily');l.session.focusSkill='algebra';
 for(let i=0;i<20;i++){const q=L.choose(l,h.run('BANK'));assert.equal(q.skill,'algebra');assert.equal(q.stretch,false);}
 L.start(l,'stretch');l.session.focusSkill='inquiry';for(let i=0;i<20;i++)assert.equal(L.choose(l,h.run('BANK')).skill,'inquiry');
});
test('fresh numbers or a scheduled review alone do not become transfer evidence',()=>{
 const l=L.fresh();assert.equal(R.transferEvidence(l,{transfer:true},'fractionCompare','fraction'),false);
 L.record(l,a());assert.equal(R.transferEvidence(l,{},'fractionCompare','fraction'),false);
 assert.equal(R.transferEvidence(l,{transfer:true},'fractionCompare','fraction'),true);
 assert.equal(R.transferEvidence(l,{transfer:true},'fractionSum','fraction'),false);
});
test('skipping a question is not a wrong answer or a sampled skill diagnosis',()=>{
 const l=L.fresh();L.record(l,a({skipped:true,correct:false,firstCorrect:false}));assert.equal(L.evidence(l,'fraction').attempts,0);assert.equal(R.profile(l,'fraction').sample,0);
});
test('reasoning stages retain earlier ideas and revisions; tutor sees their order',()=>{
 const h=studio();h.run("$('studyPlan').value='I know the total but not the equal unit.';studioStageGo('connect');$('studyPlan').value='Divide the total into equal parts.';studioStageGo('understand');");
 assert.equal(h.run("$('studyPlan').value"),'I know the total but not the equal unit.');
 h.run("$('studyPlan').value='The total represents five equal units.';studioStageGo('verify');$('studyPlan').value='Multiply back to recover the total.';studioCapture();");
 const prompt=h.run('systemPrompt()');assert.match(prompt,/total represents five/);assert.match(prompt,/Divide the total/);assert.match(prompt,/Multiply back/);assert.match(prompt,/revisionHistory/);assert.match(prompt,/not a fixed learning style/);
 assert.equal(h.run('studyAttempt.reasoningHistory.length'),4);
});
test('following a concept probe logs its actual choice and excludes assisted independence',()=>{
 const h=studio();h.run("current={topic:'Fractions',skill:'fraction',text:'A fraction question',answer:0.5,steps:['Half']};studyNewQuestion();studioProbe();");
 h.nodes.get('probeChoices').children[0].onclick();
 assert.equal(h.run('studyAttempt.probe.correct'),false);assert.match(h.nodes.get('probeFeedback').textContent,/One third contains two sixths/);
 h.run("$('answerInput').value='1/2';submit();");assert.equal(h.run('learning().attempts[0].independent'),false);assert.equal(h.run('learning().attempts[0].probe.choice'),0);
});
test('lab interactions calculate exact relationships and preserve observations',()=>{
 const h=studio();h.run("studioOpenLab();studioLab={tool:'area',w:3,h:4};studioRenderLab();$('labPrediction').value='Area stays 12 when the shape changes';$('labFinding').value='1 by 12 and 3 by 4 have equal areas but different boundaries';studioKeepLab();");
 assert.match(h.run('studioLabMeasurement()'),/area = 12 square units; perimeter = 14 units/);
 assert.equal(h.run('studyAttempt.model'),true);assert.match(h.run('studyAttempt.toolNotes'),/equal areas/);assert.equal(h.run('learning().notes.length'),1);
 h.run('renderQuestion();');assert.equal(h.run('studyAttempt.toolNotes'),'');assert.equal(h.nodes.get('visualLab').hidden,true);
});
test('lab mathematics hold across every selectable fraction, ratio and rectangle',()=>{
 for(let d=2;d<=12;d++)for(let n=0;n<=d;n++)assert.equal(R.fractionState(d,n).value,n/d);
 for(let a=1;a<=8;a++)for(let b=1;b<=8;b++)for(let u=1;u<=12;u++){const r=R.ratioState(a,b,u);assert.equal(r.left*b,r.right*a);assert.equal(r.total,r.left+r.right);}
 for(let w=1;w<=12;w++)for(let h=1;h<=12;h++){const r=R.gridState(w,h);let perimeter=0;for(let x=0;x<w;x++)for(let y=0;y<h;y++)perimeter+=(x===0)+(y===0)+(x===w-1)+(y===h-1);assert.equal(r.perimeter,perimeter);assert.equal(r.area,w*h);}
});
test('backup round-trip preserves route, reasoning and external assessments but recomputes probe correctness',()=>{
 const l=L.fresh();L.record(l,a({route:'table',trace:{understand:'Known total',connect:'Equal groups'},probe:{skill:'fraction',choice:0,correct:true},reasoningHistory:[{stage:'connect',text:'My first model'}],working:['6 / 3 = 2'],toolNotes:'Two of six parts'}));
 l.benchmarks=[{name:'Teacher assessment',date:'2026-09-12',note:'Explain every step',percentile:98}];
 const backup=L.backup(l);backup.learning.attempts[0].secret='DO NOT RESTORE';const restored=L.restore(backup);
 assert.equal(restored.attempts[0].probe.correct,false);assert.equal(restored.attempts[0].route,'table');assert.equal(restored.attempts[0].secret,undefined);assert.equal(restored.benchmarks[0].percentile,98);
 assert.match(restored.attempts[0].trace.connect,/Equal groups/);
});
test('reasoning trace is persisted with an attempt and parent assessment never creates mastery',()=>{
 const h=studio();h.run("$('studyPlan').value='Use the relationship to represent the unknown.';studioCapture();$('answerInput').value=String(current.answer);submit();");
 assert.match(h.run('learning().attempts[0].trace.understand'),/represent the unknown/);
 const count=h.run('learning().attempts.length');h.run("$('benchmarkName').value='External paper';$('benchmarkDate').value='2026-09-12';$('benchmarkNote').value='Needs to explain the inverse check';$('benchmarkPercentile').value='99';$('benchmarkSave').onclick();");
 assert.equal(h.run('learning().attempts.length'),count);assert.equal(h.run('learning().benchmarks[0].percentile'),99);
});
test('learner map exposes prerequisites and launches a focused session',()=>{
 const h=studio();h.run("studioSelectedSkill='percent';studioShow('map');");assert.match(h.nodes.get('skillDetail').innerHTML,/Percentage/);assert.equal(h.nodes.get('prereqLinks').children.length,2);
 h.run("$('practiceSkill').onclick();");assert.equal(h.run('currentSkill()'),'percent');assert.equal(h.run('studioView'),'maths');
});
test('every core idea has a checked small-case probe and choices remain bounded',()=>{
 for(const [id,s] of Object.entries(L.skills)){if(s.stretch)continue;const p=R.probeFor(id);assert.ok(p.question&&p.explanation&&p.checks);assert.equal(p.choices.length,3);assert.ok(p.answer>=0&&p.answer<3);}
 // Independently reviewed expected choices, including common incorrect alternatives.
 const answers={number:'1,000',fraction:'2/6',fractionProblem:'$12',decimal:'Tenths',ratio:'5',percent:'$80',rate:'12 ÷ 3',algebra:'3x + 2',measure:'Larger than 2',time:'20 minutes',area:'3 × 5',circle:'The curved edge and a 14 cm line',volume:'Water volume',angle:'180°',spatial:'The two sides match exactly when folded',data:'No — the group sizes matter',model:'Represent the two quantities and label total and difference',inquiry:'It works in those 5 cases; a general argument is still needed'};
 for(const [id,answer] of Object.entries(answers))assert.equal(R.probes[id].choices[R.probes[id].answer],answer);
});
test('a completed session ends on the learning map instead of silently generating endless warm-ups',()=>{
 const h=studio();h.run("MochiLearning.start(learning(),'daily');learning().session.done=7;$('answerInput').value=String(current.answer);submit();");
 assert.equal(h.run('learning().session.finished'),true);
 const epoch=h.run('questionEpoch');h.run("$('nextBtn').onclick();");assert.equal(h.run('questionEpoch'),epoch);assert.equal(h.run('studioView'),'map');
});

test('focus layout starts closed and switches one panel at a time without losing reasoning',()=>{
 const h=studio();assert.equal(h.run('focusPanel'),null);
 assert.equal(h.run('FOCUS_PANELS.every(id=>$(id).hidden)'),true);
 h.run("focusOpen('thinkPanel');$('studyPlan').value='I will compare equal-size parts.';studioTutor();");
 assert.equal(h.run('focusPanel'),'coachCard');assert.equal(h.run("$('thinkPanel').hidden"),true);
 assert.equal(h.run('studyAttempt.trace.understand'),'I will compare equal-size parts.');
 h.run("focusOpen('thinkPanel');");assert.equal(h.run("$('studyPlan').value"),'I will compare equal-size parts.');
 assert.equal(h.run('FOCUS_PANELS.filter(id=>!$(id).hidden).length'),1);
});
test('closing a panel restores its opener and releases the small-screen question surface',()=>{
 const h=studio();h.run("window.innerWidth=390;let focusRestored=false;$('focusThink').focus=()=>{focusRestored=true;};focusOpen('thinkPanel',$('focusThink'));");
 assert.equal(h.run("$('studioSurface').inert"),true);
 h.run('focusClose();');assert.equal(h.run('focusRestored'),true);assert.equal(h.run("$('studioSurface').inert"),false);assert.equal(h.run("$('focusBackdrop').hidden"),true);
});
test('own thinking is independent work, while reopening a resource records support',()=>{
 const h=studio();h.run("focusOpen('thinkPanel');focusClose();");assert.equal(h.run('studyAttempt.model'),false);assert.equal(h.run('studyAttempt.hints'),0);
 h.run("$('resourceDetails').open=true;$('focusResources').onclick();");assert.equal(h.run('studyAttempt.hints'),1);
 assert.equal(h.run('focusPanel'),'resourcePanel');
 h.run('studioOpenLab();');assert.equal(h.run('studyAttempt.model'),true);assert.equal(h.run("$('resourcePanel').hidden"),true);
});
test('new questions close old tools and reflect shortcut opens the thinking panel after solving',()=>{
 const h=studio();h.run("studioOpenLab();renderQuestion();");assert.equal(h.run('focusPanel'),null);
 h.run("$('answerInput').value=String(current.answer);submit();");
 assert.equal(h.run('settled'),true);assert.match(h.run("$('focusQuestionMore').textContent"),/Reflect/);
 h.run("$('focusQuestionMore').onclick();");assert.equal(h.run('focusPanel'),'thinkPanel');
});
test('restoring UI wiring does not stack the session-start wrapper',()=>{
 const h=studio();h.run("studioInit();studioInit();$('focusSession').onclick();$('studyMode').value='daily';$('studyStart').onclick();");
 assert.equal(h.run('focusPanel'),null);assert.equal(h.run('learning().session.done'),0);assert.equal(h.run('learning().session.mode'),'daily');
});
