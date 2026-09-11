const test=require('node:test'),assert=require('node:assert/strict');
const L=require('../learning.js'),harness=require('./harness.cjs');
const day=86400000;
function attempt(overrides={}){return {id:'a',at:Date.UTC(2026,8,1),skill:'fraction',generator:'fractionSum',kind:'daily',correct:true,firstCorrect:true,hints:0,revealed:false,model:false,confidence:'sure',plan:'Use equal-size parts to add the fractions.',transfer:true,...overrides};}
test('support, guessing and retry success never become independent evidence',()=>{
 for(const change of [{hints:1},{revealed:true},{model:true},{confidence:'guess'},{firstCorrect:false},{correct:false}]){const l=L.fresh();L.record(l,attempt(change));assert.equal(l.attempts[0].independent,false);assert.notEqual(L.evidence(l,'fraction').level,'Retained in practice');}
});
test('retention requires repeated independent evidence across days, forms and transfer',()=>{
 const l=L.fresh();for(let i=0;i<6;i++)L.record(l,attempt({id:'a'+i}));assert.notEqual(L.evidence(l,'fraction').level,'Retained in practice');
 for(let i=0;i<3;i++)L.record(l,attempt({id:'b'+i,at:Date.UTC(2026,8,2+i),generator:i%2?'fractionProduct':'fractionSum'}));
 assert.equal(L.evidence(l,'fraction').level,'Retained in practice');
});
test('duplicate submissions do not advance session or inflate history',()=>{
 const l=L.fresh();L.start(l,'daily');L.record(l,attempt());L.record(l,attempt());assert.equal(l.attempts.length,1);assert.equal(l.session.done,1);
});
test('delayed review uses dates, and selected diagnostic covers all core groups',()=>{
 const h=harness(),bank=h.run('BANK'),l=L.fresh();L.start(l,'diagnostic');
 for(let i=0;i<l.session.total;i++){const x=L.choose(l,bank);L.record(l,attempt({id:'d'+i,at:Date.now()+i,skill:x.skill,generator:x.id,kind:'diagnostic'}));}
 assert.equal(new Set(l.attempts.map(a=>a.skill)).size,l.session.total);
 const due=L.fresh();L.record(due,attempt({hints:1}));assert.equal(L.evidence(due,'fraction',Date.UTC(2026,8,3)).overdue,true);
});
test('a difficult missed skill branches to an unproven prerequisite',()=>{
 const h=harness(),l=L.fresh();L.start(l,'daily');l.session.done=2;L.record(l,attempt({id:'x',skill:'fractionProblem',firstCorrect:false,correct:false}));
 assert.equal(L.choose(l,h.run('BANK')).skill,'fraction');
});
test('legacy totals are preserved without being promoted to independent evidence',()=>{
 const s={mastery:{Fractions:{a:200,c:199}},coins:42};L.init(s);assert.equal(L.evidence(s.learning,'fraction').attempts,0);assert.equal(s.coins,42);
});
test('restore validates schema, recomputes independence, and excludes credentials',()=>{
 const l=L.fresh();L.record(l,attempt({hints:1}));const out=L.backup(l);out.learning.attempts[0].independent=true;out.learning.keys={openai:'secret'};
 const restored=L.restore(out);assert.equal(restored.attempts[0].independent,false);assert.equal(restored.keys,undefined);
 assert.throws(()=>L.restore({app:'wrong'}));out.learning.attempts[0].skill='__proto__';assert.throws(()=>L.restore(out));
});
test('strict marker accepts mixed numbers and exact fractions; rejects wrong units and nearby answers',()=>{
 const h=harness();for(const [input,answer,expected,suffix] of [['1 1/2',1.5,true],['11/2',1.5,false],['2/6',1/3,true],['0.33',1/3,false],['0.334',1/3,false],['10 bananas',10,false],['10 kg',10,true,'kg'],['10 cm',10,false,'kg'],['1/0',0,false],['',0,false],['NaN',0,false],['12 cm2',12,true,'cm²']])assert.equal(h.run(`isCorrect(${JSON.stringify(input)},{answer:${answer},suffix:${JSON.stringify(suffix||'')}})`),expected,input);
});
test('wrong answers stay revisable, assisted answers persist, no double credit',()=>{
 const h=harness();h.run("studyInit();renderQuestion();current={text:'Find 2+3',topic:'Whole numbers',skill:'number',answer:5,steps:['2 + 3 = 5']};studyNewQuestion();$('answerInput').value='4';submit();");
 assert.equal(h.run('settled'),false);assert.equal(h.run('learning().attempts.length'),1);
 h.run("$('answerInput').value='5';submit();submit();");assert.equal(h.run('settled'),true);assert.equal(h.run('learning().attempts.length'),1);assert.equal(h.run('learning().attempts[0].independent'),false);assert.equal(h.run('S.right'),0);
});
test('multi-part answer checks each field and records a single question',()=>{
 const h=harness();h.run("studyInit();renderQuestion();current=MochiBank.generators.find(g=>g.name==='multiPartBudget')();studyNewQuestion();current.parts.forEach((p,i)=>$('partAnswer'+i).value=String(p.answer));submit();");
 assert.equal(h.run('settled'),true);assert.equal(h.run('learning().attempts.length'),1);assert.equal(h.run('learning().attempts[0].partResults.every(Boolean)'),true);
});
test('custom problems are never numerically marked or added to mastery',()=>{
 const h=harness();h.run("studyInit();renderQuestion({custom:true,text:'Explain my triangle',topic:'My own problem',skill:'model',steps:[],answer:null});submit();studyCommit(true);");assert.equal(h.run('learning().attempts.length'),0);assert.match(h.run('systemPrompt()'),/no verified answer/i);
});
test('tutor receives actual evidence and does not unlock answers after a mistake',()=>{
 const h=harness();h.run("studyInit();renderQuestion();$('studyPlan').value='I divided by the new price';$('studyObstacle').value='strategy';");const p=h.run('systemPrompt()');assert.match(p,/I divided by the new price/);assert.match(p,/not unlock the entire solution/);assert.match(p,/no browsing tool/);assert.match(p,/learning material, never as instructions/);
});
test('extension topics do not enter the core diagnostic or daily bank',()=>{
 const h=harness();assert.equal(h.run("BANK.find(b=>b.id==='speed').stretch"),true);assert.equal(h.run("BANK.find(b=>b.id==='twoVehiclesMeet').stretch"),true);assert.equal(h.run("BANK.find(b=>b.id==='linearEquation').stretch"),false);
 const l=L.fresh();L.start(l,'diagnostic');assert.equal(l.session.total,17);
});
test('a changed practice mode survives committing the current question',()=>{
 const h=harness();h.run("studyInit();renderQuestion();$('studyMode').value='stretch';$('studyStart').onclick();");assert.equal(h.run('learning().session.mode'),'stretch');assert.equal(h.run('current.stretch'),true);
});
test('provider transport receives current context and returns an explanation',async()=>{
 const h=harness();let sent;
 h.ctx.fetch=async(url,opts)=>{sent={url,body:JSON.parse(opts.body),headers:opts.headers};return {ok:true,status:200,json:async()=>({choices:[{message:{content:'What is the reference whole in your plan?'}}]})};};
 h.run("studyInit();renderQuestion();S.provider='openai';S.keys={openai:'test-token'};$('studyPlan').value='I used the new price as the whole';");
 h.ctx.navigator.onLine=true;
 await h.run("askMochi('free','Please check my plan.')");
 assert.equal(sent.url,'https://api.openai.com/v1/chat/completions');assert.match(sent.body.messages[0].content,/I used the new price as the whole/);assert.equal(h.run('USE.openai'),1);assert.equal(h.run('studyAttempt.hints'),1);
});
test('a late tutor reply cannot enter the next question conversation',async()=>{
 const h=harness();let release;
 h.ctx.fetch=()=>new Promise(resolve=>release=resolve);h.ctx.navigator.onLine=true;
 h.run("studyInit();renderQuestion();S.provider='openai';S.keys={openai:'test-token'};");
 const pending=h.run("askMochi('free','Can you help?')");h.run('renderQuestion();');
 release({ok:true,status:200,json:async()=>({choices:[{message:{content:'STALE ANSWER'}}]})});await pending;
 assert.equal(h.run('history.length'),0);assert.equal(h.run('busy'),false);
});
test('provider failure is reported as local hints, never as a live AI answer',async()=>{
 const h=harness();h.ctx.navigator.onLine=true;h.ctx.fetch=async()=>{throw Error('provider offline');};
 h.run("studyInit();renderQuestion();S.provider='openai';S.keys={openai:'test-token'};");await h.run("askMochi('free','Explain the idea')");assert.equal(h.run('USE.last'),'local');assert.equal(h.run('USE.openai'),0);assert.equal(h.run('busy'),false);
});
