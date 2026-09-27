const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const M=require('../entrance-core.js'),S=require('../science-path-core.js');

function section(src,start,end){
 const a=src.indexOf(start),b=src.indexOf(end,a+start.length);
 assert.ok(a>=0&&b>a,start+' section exists');
 return src.slice(a,b);
}
function taught(d,E,id){
 for(let p=0;p<3;p++)E.visit(d,id,p,100+p);
 E.concept(d,id,E.unit(id).check[2],104);E.complete(d,id,105);
}
function answerAndFinish(d,E,id,working){
 taught(d,E,id);E.startPractice(d,id,{phase:'apply',seed:11,now:200});
 const q=E.question(d.draft),answer=E===S?q.answer:(q.answerLabel||String(q.answer));E.touchDraft(d,{answer,working,strokes:[[[.1,.2],[.3,.4]]]},201);
 const a=E.respond(d,202).attempt;assert.equal(a.correct,true);E.finishPractice(d);
 E.startPractice(d,id,{phase:'apply',seed:12,now:203});return d.draft;
}

test('path engine always creates a genuinely new draft with blank answer, working and ink',()=>{
 for(const [E,id] of [[M,'relationships'],[S,'matter']]){
  const d=E.fresh(),next=answerAndFinish(d,E,id,'OLD WORK MUST NOT FOLLOW');
  assert.equal(next.answer,'');assert.equal(next.working,'');assert.deepEqual(next.strokes,[]);
 }
});

test('Maths and Science UI save the old screen before replacing a draft',()=>{
 for(const file of ['entrance-ui.js','science-path-ui.js']){
  const src=fs.readFileSync(require.resolve('../'+file),'utf8');
  const begin=section(src,'function beginPractice','function header');
  assert.ok(begin.indexOf('capture(true);')>=0,file+' captures old working');
  assert.ok(begin.indexOf('capture(true);')<begin.indexOf('E.finishPractice(d)'),file+' captures before clearing the old draft');
  assert.doesNotMatch(begin,/E\.startPractice\(d,id/,'beginPractice must not create a new draft while the old DOM is still mounted');
  assert.match(begin,/open\('practice',id,phase\)/,'open receives the requested practice phase');
  const open=section(src,"function open(kind='home',id,practicePhase)",'function nextRecommended');
  assert.match(open,/if\(kind==='practice'&&!data\(\)\.draft\)E\.startPractice\(data\(\),id,\{phase:practicePhase\}\)/,'new draft is created only after open has captured the old screen');
 }
});

test('same-question resume remains untouched by the fix',()=>{
 const d=M.fresh();taught(d,M,'relationships');M.startPractice(d,'relationships',{phase:'apply',seed:33,now:300});
 M.touchDraft(d,{answer:'17',working:'My unfinished reasoning',strokes:[[[.2,.2],[.4,.4]]]},301);
 const before=JSON.stringify(d.draft);
 M.startPractice(d,'relationships',{phase:'transfer',seed:44,now:302});
 assert.equal(JSON.stringify(d.draft),before,'startPractice returns the existing unfinished draft instead of blanking it');
});
