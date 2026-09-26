const test=require('node:test'),assert=require('node:assert/strict');
const C=require('../path-coach.js'),M=require('../entrance-core.js'),S=require('../science-path-core.js');
const now=new Date(2026,8,26,12).getTime(),DAY=86400000;
function teach(d,E,id,at=now-10000){for(let p=0;p<3;p++)E.visit(d,id,p,at+p);E.concept(d,id,E.unit(id).check[2],at+4);E.complete(d,id,at+5);}
function answer(d,E,id,phase,seed,at){E.finishPractice(d);E.startPractice(d,id,{phase,seed,now:at});const q=E.question(d.draft);E.touchDraft(d,{answer:q.answerLabel||q.answer},at+1);return E.respond(d,at+2).attempt;}

test('known Maths and Science weak areas get concise targeted diagnostic forks',()=>{
 const count=C.diagnostic('maths','counting',M);assert.match(count.prompt,/opposite order/);assert.equal(count.correct,0);assert.match(count.explain,/same pair|does not create/i);
 const area=C.diagnostic('maths','area',M);assert.match(area.prompt,/share the same height/);assert.match(area.explain,/proportional/i);
 const circuit=C.diagnostic('science','circuits',S);assert.match(circuit.prompt,/bulb to light/);assert.match(circuit.explain,/complete closed path/i);
 const matter=C.diagnostic('science','matter',S);assert.match(matter.prompt,/sealed container/);assert.equal(matter.correct,0);
});

test('units without a custom fork reuse the authored concept check instead of inventing a new fact',()=>{
 const d=C.diagnostic('maths','motion',M),u=M.unit('motion');assert.equal(d.prompt,u.check[0]);assert.deepEqual(d.choices,u.check[1]);assert.equal(d.correct,u.check[2]);assert.equal(d.explain,u.check[3]);
 const e=C.diagnostic('science','plants',S),v=S.unit('plants');assert.equal(e.prompt,v.check[0]);assert.equal(e.correct,v.check[2]);
});

test('mastery strip advances only through taught, apply, transfer, delayed and actual mixed-paper evidence',()=>{
 const d=M.fresh();let p=C.progress(M,d,'relationships',now);assert.equal(p.current,0);assert.equal(p.steps[0].done,false);
 teach(d,M,'relationships');p=C.progress(M,d,'relationships',now);assert.equal(p.current,1);
 answer(d,M,'relationships','apply',11,now+10);answer(d,M,'relationships','apply',22,now+20);p=C.progress(M,d,'relationships',now+30);assert.equal(p.current,2);
 const t=answer(d,M,'relationships','transfer',33,now+40);p=C.progress(M,d,'relationships',now+50);assert.equal(p.current,3);
 answer(d,M,'relationships','recall',44,t.answeredAt+7*DAY+1);p=C.progress(M,d,'relationships',t.answeredAt+7*DAY+10);assert.equal(p.current,4);assert.equal(p.steps[4].done,false);
 d.attempts.push({...d.attempts.at(-1),id:'paper-proof',mode:'paper',paperId:'mixed-a',phase:'paper',independent:true,answeredAt:t.answeredAt+8*DAY});
 p=C.progress(M,d,'relationships',t.answeredAt+8*DAY+1);assert.equal(p.steps[4].done,true);
});

test('bonus reward weighting favours transfer and week-later recall over repetition volume',()=>{
 assert.equal(C.reward('apply'),1);assert.equal(C.reward('transfer'),2);assert.equal(C.reward('recall'),2);
 assert.equal(C.rewardReason('apply'),'Fresh independent answer');assert.equal(C.rewardReason('transfer'),'Solved a changed problem');assert.equal(C.rewardReason('recall'),'Remembered later');
});

test('quest goals are short and specific for current gaps, with authored fallback elsewhere',()=>{
 assert.match(C.goal('maths','counting',M),/no duplicates/i);assert.match(C.goal('science','circuits',S),/complete electrical path/i);
 assert.equal(C.goal('maths','motion',M),M.unit('motion').why);
});


test('mastery coach is versioned offline and Quick checks stay out of reserved papers',()=>{
 const fs=require('node:fs'),v=require('../release.json').version,html=fs.readFileSync(require.resolve('../index.html'),'utf8'),sw=fs.readFileSync(require.resolve('../sw.js'),'utf8');
 assert.equal(html.split('path-coach.js?v=').length-1,1);assert.ok(sw.includes('path-coach.js?v='+v));
 assert.ok(html.indexOf('path-coach.js?')<html.indexOf('entrance-ui.js?'));assert.ok(html.indexOf('path-coach.js?')<html.indexOf('science-path-ui.js?'));
 for(const file of ['entrance-ui.js','science-path-ui.js']){const src=fs.readFileSync(require.resolve('../'+file),'utf8');assert.match(src,/QUICK CHECK/);assert.match(src,/wireDiagnostic\(\)/);}
});
