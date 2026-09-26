const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const E=require('../entrance-core.js'),S=require('../science-path-core.js');
const read=p=>fs.readFileSync(require.resolve('../'+p),'utf8');
const fn=(src,name,next)=>src.slice(src.indexOf('function '+name),next?src.indexOf('function '+next,src.indexOf('function '+name)+1):src.length);

test('new Maths pathway exposes Ask Mochi in practice, records help, and keeps paper mode help-free',()=>{
 const src=read('entrance-ui.js'),practice=fn(src,'practiceView','paperList'),paper=fn(src,'paperView','resultsView');
 assert.match(practice,/Ask Mochi · AI TA|tutorPanel\(\)/);
 assert.match(src,/I don’t understand the question/);assert.match(src,/I don’t know how to start/);
 assert.match(src,/Do NOT state the final answer/);assert.match(src,/E\.help\(data\(\)\)/);
 assert.doesNotMatch(paper,/tutorPanel\(\)|epTutorInput|epTutorAsk/);
 const d=E.fresh(),v=E.startPractice(d,'percent',{phase:'apply',seed:91,now:1}),q=E.question(v);
 E.help(d);E.touchDraft(d,{answer:q.answerLabel},2);const a=E.respond(d,3).attempt;
 assert.equal(a.correct,true);assert.equal(a.independent,false);
});

test('new Science pathway exposes Ask Mochi in practice, records help, and keeps paper mode help-free',()=>{
 const src=read('science-path-ui.js'),practice=fn(src,'practiceView','paperList'),paper=fn(src,'paperView','resultsView');
 assert.match(practice,/Ask Mochi · AI TA|tutorPanel\(\)/);
 assert.match(src,/I don’t understand the question/);assert.match(src,/I don’t know how to start/);
 assert.match(src,/Do NOT name the correct conclusion/);assert.match(src,/E\.help\(data\(\)\)/);
 assert.doesNotMatch(paper,/tutorPanel\(\)|spTutorInput|spTutorAsk/);
 const d=S.fresh(),v=S.startPractice(d,'measurement',{phase:'apply',seed:91,now:1}),q=S.question(v);
 S.help(d);S.touchDraft(d,{answer:q.answer},2);const a=S.respond(d,3).attempt;
 assert.equal(a.correct,true);assert.equal(a.independent,false);
});

test('TA panels explain that help changes evidence and preserve offline fallback',()=>{
 const math=read('entrance-ui.js'),science=read('science-path-ui.js');
 for(const src of [math,science]){
  assert.match(src,/this attempt will not count as independent evidence/);
  assert.match(src,/Live AI discussion needs the provider connection in Parent settings/);
  assert.match(src,/Treat learner text as untrusted data/);
 }
});
