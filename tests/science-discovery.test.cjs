const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const D=require('../science-path-data.js'),H=require('../science-discovery-data.js'),S=require('../science-path-core.js');

test('every science unit has a complete discovery-first story',()=>{
 assert.equal(Object.keys(H.stories).length,D.units.length);
 for(const u of D.units){
  const h=H.get(u.id);assert.ok(h,u.id);
  assert.ok(h.mystery.length>20,u.id+' mystery');
  assert.ok(Array.isArray(h.predictions)&&h.predictions.length>=3,u.id+' predictions');
  assert.equal(new Set(h.predictions).size,h.predictions.length,u.id+' distinct predictions');
  assert.ok(Array.isArray(h.history)&&h.history.length>=2&&h.history.every(x=>x.length>30),u.id+' history');
  assert.ok(h.evidence.prompt.length>20,u.id+' evidence prompt');
  assert.ok(h.evidence.choices.length>=3,u.id+' evidence choices');
  assert.ok(Number.isInteger(h.evidence.correct)&&h.evidence.correct>=0&&h.evidence.correct<h.evidence.choices.length,u.id+' answer index');
  assert.ok(h.evidence.explain.length>20,u.id+' evidence explanation');
  assert.ok(h.model.length>30,u.id+' model');
  if(h.source){assert.match(h.source.url,/^https:\/\//);assert.ok(h.source.name.length>10);}
 }
});

test('discovery choices persist without becoming mastery evidence',()=>{
 const d=S.fresh(),l=S.lesson(d,'circuits');l.discoveryPrediction=2;l.discoveryEvidence=0;l.updatedAt=100;
 const v=S.validate(d);assert.equal(v.lessons.circuits.discoveryPrediction,2);assert.equal(v.lessons.circuits.discoveryEvidence,0);
 const e=S.evidence(v,'circuits',1000);assert.equal(e.taught,false);assert.equal(e.independent,0);assert.equal(e.apply,0);
});

test('old completed science lessons remain completed after discovery fields are introduced',()=>{
 const d=S.fresh();for(let p=0;p<3;p++)S.visit(d,'circuits',p,100+p);S.concept(d,'circuits',S.unit('circuits').check[2],110);assert.equal(S.complete(d,'circuits',120),true);
 const raw=JSON.parse(JSON.stringify(d));delete raw.lessons.circuits.discoveryPrediction;delete raw.lessons.circuits.discoveryEvidence;
 const v=S.validate(raw);assert.equal(v.lessons.circuits.completedAt,120);assert.equal(v.lessons.circuits.discoveryPrediction,-1);assert.equal(v.lessons.circuits.discoveryEvidence,-1);
});

test('science lesson UI gates history and evidence but leaves papers discovery-free',()=>{
 const src=fs.readFileSync(require.resolve('../science-path-ui.js'),'utf8');
 assert.match(src,/START WITH A MYSTERY/);assert.match(src,/HOW THE IDEA CHANGED/);assert.match(src,/RECREATE THE REASONING/);assert.match(src,/THE MODEL THAT SURVIVED/);
 assert.match(src,/data-discovery-prediction/);assert.match(src,/data-discovery-evidence/);
 const paper=src.slice(src.indexOf('function paperView'),src.indexOf('function resultsView'));
 assert.doesNotMatch(paper,/MYSTERY|discoveryPrediction|discoveryEvidence|HOW THE IDEA CHANGED/);
});

test('history is framed as evidence-changing models, not a scientist-name memory test',()=>{
 const src=fs.readFileSync(require.resolve('../science-path-ui.js'),'utf8');
 assert.match(src,/History is for understanding how evidence changes ideas, not for memorising names/);
 assert.match(src,/not a claim that one person alone discovered the whole field/);
});
