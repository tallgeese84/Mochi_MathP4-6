const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const C=require('../course-core.js'),D=C.data,V=require('../course-visuals.js'),T=Date.UTC(2026,8,22),DAY=86400000;
function taught(id='m-number'){const c=C.fresh();C.unit(id).pages.forEach((_,i)=>C.visit(c,id,i,T));assert.ok(C.complete(c,id,T));return c;}
function answer(c,q,extra={}){return C.record(c,{id:q.id+'-'+(c.attempts.length+1),at:T+c.attempts.length+1,question:q.id,responses:[q.answer],...extra});}
const questions=id=>D.questions.filter(q=>q.unit===id);
test('curriculum has substantial teaching, valid prerequisites, illustrations and checks for all 42 units',()=>{
 assert.equal(D.units.length,42);assert.equal(D.units.filter(u=>u.subject==='science').length,19);
 assert.equal(D.units.filter(u=>u.subject==='maths').length,23);
 assert.equal(new Set(D.units.map(u=>u.id)).size,D.units.length);assert.equal(new Set(D.questions.map(q=>q.id)).size,D.questions.length);
 for(const u of D.units){assert.equal(u.pages.length,7,u.id);assert.ok(u.pages.map(p=>p.text).join(' ').split(/\s+/).length>430,u.id);assert.ok(D.sources[u.source]?.url.startsWith('https://'));assert.ok(fs.existsSync(path.join(__dirname,'../course/assets',u.art+'.webp')));
  for(const p of u.prerequisites)assert.ok(D.units.findIndex(v=>v.id===p)<D.units.indexOf(u)&&C.unit(p),u.id+' prerequisite '+p);
  const qs=questions(u.id);assert.equal(qs.length,6);for(let level=1;level<=3;level++)assert.equal(qs.filter(q=>q.level===level).length,2);
  for(const q of qs){assert.equal(new Set(q.choices).size,q.choices.length);assert.ok(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<q.choices.length);assert.ok(q.why.length>25);}
 }
 assert.ok(D.units.flatMap(u=>u.pages).map(p=>p.text).join(' ').split(/\s+/).length>25000);
});
test('stable choice reordering preserves every authored answer without exposing a repeating answer pattern',()=>{
 const raw=JSON.parse(fs.readFileSync(path.join(__dirname,'../course/questions.json')));
 for(const q of D.questions){const src=raw.find(x=>x.id===q.id);assert.equal(q.choices[q.answer],src.choices[src.answer],q.id);assert.deepEqual([...q.choices].sort(),[...src.choices].sort());}
 const science=D.questions.filter(q=>q.unit.startsWith('s-'));for(const pos of [0,1,2])assert.ok(science.filter(q=>q.answer===pos).length>20);
});
test('untaught units cannot start checks and completion records exposure only',()=>{
 const c=C.fresh();assert.equal(C.choose(c,'m-number').kind,'teach');C.visit(c,'m-number',6,T);assert.equal(C.complete(c,'m-number',T),false);
 const done=taught();assert.equal(C.choose(done,'m-number').kind,'question');assert.equal(C.evidence(done,'m-number').status,'Not checked');assert.equal(C.evidence(done,'m-number').newIndependent,0);
});
test('two distinct first independent answers increase each difficulty tier by one',()=>{
 const c=taught();for(let level=1;level<=3;level++){
  const qs=questions('m-number').filter(q=>q.level===level);assert.equal(C.evidence(c,'m-number').level,level);
  answer(c,qs[0]);assert.equal(C.evidence(c,'m-number').level,level);answer(c,qs[1]);assert.equal(C.evidence(c,'m-number').level,Math.min(3,level+1));
 }
 assert.equal(C.evidence(c,'m-number').newIndependent,6);assert.equal(C.evidence(c,'m-number').independentDays,1);
 assert.notEqual(C.evidence(c,'m-number').status,'Some delayed and transfer evidence');
});
test('wrong answers stay one attempt, retain support and cannot become independent on revision',()=>{
 const c=taught(),q=questions('m-number')[0];const wrong=answer(c,q,{id:'same',responses:[(q.answer+1)%q.choices.length]});
 const revised=C.record(c,{...wrong,responses:[...wrong.responses,q.answer],helped:true});assert.equal(c.attempts.length,1);assert.equal(revised.correct,true);assert.equal(revised.independent,false);
 C.record(c,{...revised,responses:[q.answer],helped:false});assert.equal(c.attempts[0].firstCorrect,false,'rewriting the first response is rejected');
});
test('help, guessing and immediate repeated checks do not promote the learner',()=>{
 const c=taught(),qs=questions('m-number');answer(c,qs[0],{helped:true});answer(c,qs[1],{guess:true});assert.equal(C.evidence(c,'m-number').level,1);
 answer(c,qs[0]);answer(c,qs[1]);assert.equal(C.evidence(c,'m-number').level,1,'immediate familiarity cannot justify promotion');
 assert.equal(C.choose(c,'m-number',T+100).kind,'review');assert.equal(C.evidence(c,'m-number').newIndependent,0);
});
test('delayed retrieval supports recovery but remains distinct from novel transfer',()=>{
 const c=taught(),qs=questions('m-number');answer(c,qs[0],{responses:[(qs[0].answer+1)%3]});answer(c,qs[1],{responses:[(qs[1].answer+1)%3]});
 assert.equal(C.evidence(c,'m-number').needsTeaching,true);assert.equal(C.choose(c,'m-number',T+DAY+100).repeated,true);
 answer(c,qs[0],{at:T+DAY+100});answer(c,qs[1],{at:T+DAY+200});const e=C.evidence(c,'m-number',T+DAY+201);
 assert.equal(e.level,2);assert.equal(e.newIndependent,0);assert.equal(e.familiarIndependent,2);
});
test('two misses at the reached tier lower difficulty, while a saved unfinished question resumes',()=>{
 const c=taught(),qs=questions('m-number');answer(c,qs[0]);answer(c,qs[1]);assert.equal(C.evidence(c,'m-number').level,2);
 for(const q of qs.filter(q=>q.level===2))answer(c,q,{responses:[(q.answer+1)%3]});assert.equal(C.evidence(c,'m-number').level,1);
 C.lesson(c,'m-number').draft={id:'saved',at:T+20,question:qs[2].id,helped:true};assert.equal(C.choose(c,'m-number').draft.id,'saved');
});
test('classroom backup preserves notebooks and attempts, recomputes flags, and rejects invalid records',()=>{
 const c=taught(),l=C.lesson(c,'m-number');l.notes='My explanation';l.strokes=[[[.1,.2],[.3,.4]]];l.draft={id:'draft',at:T,question:questions('m-number')[0].id,helped:true,guess:false,notes:'Draft reason',strokes:l.strokes};
 answer(c,questions('m-number')[0],{helped:true,explanation:'I used the hint',strokes:l.strokes});c.attempts[0].independent=true;
 const round=C.validate(JSON.parse(JSON.stringify(c)));assert.equal(round.lessons['m-number'].notes,l.notes);assert.equal(round.lessons['m-number'].draft.notes,'Draft reason');assert.deepEqual(round.lessons['m-number'].strokes,l.strokes);assert.equal(round.attempts[0].independent,false);
 assert.throws(()=>C.validate({version:2,attempts:[]}));assert.equal(C.validate({version:1,attempts:[{question:'invented'}]}).attempts.length,0);
});
test('merging devices preserves both histories, unions teaching sections and does not discard help',()=>{
 const a=taught(),b=C.fresh(),q=questions('m-number')[0];C.visit(b,'s-inquiry',0,T+100);C.lesson(b,'s-inquiry').notes='A fair test controls other factors.';
 answer(a,q,{id:'same',helped:true});answer(b,q,{id:'same',responses:[q.answer]});answer(b,questions('s-inquiry')[0]);
 const m=C.merge(a,b);assert.equal(m.attempts.length,2);assert.equal(m.attempts.find(x=>x.id==='same').independent,false);assert.ok(m.lessons['m-number'].completedAt);assert.equal(m.lessons['s-inquiry'].notes,C.lesson(b,'s-inquiry').notes);
});
test('learning mirror contains classroom evidence, question context and handwriting without settings',()=>{
 const ctx={MochiLearning:require('../learning.js'),MochiScience:require('../science-core.js'),MochiCourse:C,Intl};vm.runInNewContext(fs.readFileSync(require.resolve('../learning-review.js'),'utf8'),ctx);
 const c=taught('s-inquiry');answer(c,questions('s-inquiry')[0],{explanation:'Measured height differs from a causal explanation.',strokes:[[[.1,.2],[.2,.3]]]});
 const backup=ctx.MochiReview.build({course:c,keys:{key:'DO_NOT_EXPORT'},mirrorSecret:'DO_NOT_EXPORT'},'5.0.0');assert.equal(backup.course.attempts.length,1);assert.equal(backup.courseQuestions.length,1);assert.equal(backup.course.attempts[0].strokes.length,1);assert.equal(backup.courseReview.units.length,42);assert.doesNotMatch(JSON.stringify(backup),/DO_NOT_EXPORT/);
});
test('every configured teaching model renders and exact examples agree with independent calculations',()=>{
 for(const type of new Set(D.units.map(u=>u.visual).filter(Boolean))){const m=V.model(type);assert.ok(m.picture.length>20,type);assert.ok(m.explanation.length>30,type);assert.doesNotMatch(m.picture,/NaN|undefined/);}
 for(let n=1;n<=8;n++)for(let b=1;b<=8;b++){assert.ok(V.model('area',{n,b}).explanation.includes('area '+n*b+' cm²'));assert.ok(V.model('volume',{n,b}).explanation.includes('volume '+n*b*3+' cm³'));}
 for(let n=1;n<=10;n++)assert.ok(V.model('percent',{n}).explanation.includes(n*10+'%'));
 assert.match(V.model('balance',{n:4}).explanation,/satisfies/);assert.match(V.model('circuit',{closed:false}).explanation,/breaks/);assert.match(V.model('circuit',{closed:true}).explanation,/lights/);
});
test('the drawn cube net folds to six distinct face directions',()=>{
 const cells=[[0,1],[1,1],[2,1],[3,1],[1,0],[1,2]],seen=new Map(),queue=[[1,1,[1,0,0],[0,1,0],[0,0,1]]],neg=v=>v.map(x=>-x);
 while(queue.length){const [x,y,u,v,n]=queue.shift(),key=x+','+y;if(seen.has(key))continue;seen.set(key,n);
  for(const [dx,dy,nu,nv,nn]of [[1,0,neg(n),v,u],[-1,0,n,v,neg(u)],[0,1,u,neg(n),v],[0,-1,u,n,neg(v)]])if(cells.some(c=>c[0]===x+dx&&c[1]===y+dy))queue.push([x+dx,y+dy,nu,nv,nn]);
 }
 assert.equal(seen.size,6);assert.equal(new Set([...seen.values()].map(v=>v.join(','))).size,6);
 assert.equal((V.model('net').picture.match(/<rect /g)||[]).length,6);
});
test('device merge retains help requested before the first answer and the newer notebook',()=>{
 const a=taught(),b=taught(),q=questions('m-number')[0];
 Object.assign(a.lessons['m-number'],{updatedAt:T,draft:{id:'pending',at:T,question:q.id,helped:true,guess:false,notes:'old'}});
 Object.assign(b.lessons['m-number'],{updatedAt:T+100,draft:{id:'pending',at:T,question:q.id,helped:false,guess:false,notes:'new'}});
 const m=C.merge(a,b);assert.equal(m.lessons['m-number'].draft.helped,true);assert.equal(m.lessons['m-number'].draft.notes,'new');
});
