const test=require('node:test'),assert=require('node:assert/strict');
globalThis.window=globalThis;
require('../entrance-data.js');require('../geometry-bridge.js');require('../science-path-data.js');
const Q=require('../quick-checks.js'),C=require('../path-coach.js');
const mathsUnits=()=>[...(globalThis.MochiEntranceData?.units||[])].map(u=>u.id);
const scienceUnits=()=>[...(globalThis.MochiSciencePathData?.units||[])].map(u=>u.id);

test('every maths and science question type has its own Quick check',()=>{
 const m=mathsUnits(),s=scienceUnits();
 assert.ok(m.length>=24&&s.length>=24);
 for(const [subject,ids] of [['maths',m],['science',s]])for(const id of ids)for(let form=0;form<4;form++){
  const d=C.diagnostic(subject,id,null,form);
  assert.ok(d,`${subject}/${id}/${form} has no check`);
  assert.equal(d,Q.check(subject,id,form),`${subject}/${id}/${form} should use the matched check`);
  assert.ok(Number.isInteger(d.correct)&&d.correct>=0&&d.correct<d.choices.length,`${subject}/${id}/${form} correct index`);
  assert.ok(d.prompt&&d.explain&&d.choices.length>=2);
  assert.equal(new Set(d.choices).size,d.choices.length,`${subject}/${id}/${form} duplicate choices`);
 }
});

test('the multiply-then-add question no longer gets a sum-and-difference Quick check',()=>{
 const linear=C.diagnostic('maths','relationships',null,0),sumDiff=C.diagnostic('maths','relationships',null,1);
 assert.doesNotMatch(linear.prompt,/difference/i);
 assert.match(linear.prompt,/multiply, then add/);
 assert.match(sumDiff.prompt,/difference/);
});

test('correct answers are not always in the first position',()=>{
 const pos=new Set();for(const set of [Q.maths,Q.science])for(const list of Object.values(set))for(const c of list)pos.add(c.correct);
 assert.ok(pos.size>=3);
});

test('an unknown form falls back to the previous unit-level behaviour',()=>{
 assert.match(C.diagnostic('maths','relationships',null,undefined).prompt,/difference/);
});
