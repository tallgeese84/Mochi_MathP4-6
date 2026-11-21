// v7.12 contest sprints: 25 multiple-choice questions in 40 minutes, kept apart from mastery evidence.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
globalThis.window=globalThis;
const E=require('../entrance-core.js'),C=require('../contest-core.js');
const read=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
const MIN=60000,DAY=864e5,local=(y,m,d,h=16)=>new Date(y,m-1,d,h).getTime();

test('a sprint is 25 usable questions in rising slots, with the AMC 8 topic mix and no repeated unit',()=>{
 assert.equal(C.BLUEPRINT.length,25);assert.equal(C.COUNT,25);assert.equal(C.MINUTES,40);assert.equal(C.CONTEST.date,'2027-01-26');
 for(let n=1;n<=40;n++){const items=C.build(n);assert.equal(items.length,25);assert.deepEqual(items,C.build(n),'deterministic');
  const others=items.filter(i=>!i.unit.startsWith('amc-'));assert.equal(new Set(others.map(i=>i.unit)).size,others.length,'no other unit twice');assert.equal(new Set(items.map(i=>i.unit+'/'+i.form)).size,25,'no unit and form twice');
  items.forEach((it,i)=>{assert.equal(it.topic,C.BLUEPRINT[i].topic);assert.ok(C.BLUEPRINT[i].pool.some(([u,forms])=>u===it.unit&&forms.includes(it.form)));if(!it.unit.startsWith('amc-'))assert.notEqual(it.form,3,'form 3 of the older units stays reserved for mocks');});
  const t=items.map(i=>i.topic);assert.equal(t.filter(x=>x==='Probability').length,3);assert.equal(t.filter(x=>x==='Right triangles').length,2);assert.equal(t.filter(x=>x==='Coordinates').length,2);
  // The contest units' hardest forms appear only in the last third.
  items.forEach((it,i)=>{if(it.unit.startsWith('amc-')&&it.form>=2)assert.ok(i>=19);});
 }
 assert.notDeepEqual(C.build(1),C.build(2));
});

test('five distinct choices in order, exactly one equal to the checked answer, and of a believable kind',()=>{
 let fractions=0,negatives=0;
 for(let n=1;n<=80;n++)for(const it of C.build(n)){
  const {q,labels,values,correct}=C.sheet(it),A=q.answer;
  assert.equal(labels.length,5);assert.equal(new Set(labels).size,5);assert.equal(new Set(values).size,5);
  values.forEach((v,i)=>{if(i)assert.ok(v>values[i-1],'ascending');});
  assert.ok(Math.abs(values[correct]-A)<1e-9);assert.equal(values.filter(v=>Math.abs(v-A)<1e-9).length,1);
  assert.ok(E.B.mark(q,labels[correct]),'the correct choice is accepted by the marker: '+labels[correct]);
  for(let i=0;i<5;i++)if(i!==correct)assert.equal(E.B.mark(q,labels[i]),false,'a distractor is never also correct');
  if(/probability/i.test(q.text)){assert.ok(values.every(v=>v>0&&v<=1),'probabilities stay between 0 and 1');fractions++;}
  else{assert.ok(Number.isInteger(A)||Number.isInteger(A*100),'no awkward fractions outside probability');assert.doesNotMatch(labels.join(' '),/\//);}
  if(A>=0&&!/temperature|coordinate of|sum of the two coordinates|Work out/i.test(q.text))assert.ok(values.every(v=>v>=0),'no negative choices for a length, area or count');
  if(A>=12&&!/temperature|coordinate|Work out/i.test(q.text))assert.ok(values.every(v=>v/A>=0.3&&v/A<=3.5),`similar size: ${labels} for ${A}`);
  if(/digit/i.test(q.text)&&Number.isInteger(A)&&A<=9)assert.ok(values.every(v=>Number.isInteger(v)&&v>=0&&v<=9));
  if(A<0)negatives++;
  assert.deepEqual(C.options(q,it.seed),{labels,values,correct},'deterministic choices');
 }
 assert.ok(fractions>200&&negatives>0);
});

test('the clock, answers, flags and submission follow the paper rules',()=>{
 const S={},c=C.init(S),t0=local(2026,12,5);
 const s=C.start(c,t0);assert.equal(s.id,'amc8-1');assert.equal(s.deadline,t0+40*MIN);assert.equal(C.start(c,t0+MIN),s,'one sprint at a time');
 assert.ok(C.answer(c,s.id,0,2,t0+MIN));assert.equal(s.answers[0],2);assert.ok(C.answer(c,s.id,0,2,t0+MIN));assert.equal(s.answers[0],null,'tapping the chosen answer again clears it');
 C.answer(c,s.id,0,4,t0+MIN);C.flag(c,s.id,3,t0+MIN);assert.deepEqual(s.flags,[3]);C.flag(c,s.id,3,t0+MIN);assert.deepEqual(s.flags,[]);
 C.go(c,s.id,30,t0);assert.equal(s.at,24);C.go(c,s.id,-4,t0);assert.equal(s.at,0);
 assert.equal(C.answer(c,s.id,1,1,t0+41*MIN),false,'no answers after the time limit');assert.equal(s.submittedAt,t0+40*MIN);assert.equal(s.auto,true);
 const r=C.score(s);assert.equal(r.total,25);assert.equal(r.answered,1);assert.equal(r.seconds,2400);assert.equal(r.correct,C.sheet(s.items[0]).correct===4?1:0);
 const s2=C.start(c,t0+DAY);assert.equal(s2.number,2);s2.items.forEach((it,i)=>C.answer(c,s2.id,i,C.sheet(it).correct,t0+DAY+MIN));assert.ok(C.submit(c,s2.id,t0+DAY+20*MIN));assert.equal(C.submit(c,s2.id,t0+DAY+21*MIN),false);
 const r2=C.score(s2);assert.equal(r2.correct,25);assert.equal(r2.seconds,1200);assert.equal(r2.auto,false);assert.equal(r2.firstHalf+r2.secondHalf,25);
 assert.equal(C.running(c,t0+DAY+30*MIN),null);
});

test('records validate, survive a round trip and merge by sprint across devices',()=>{
 const S={},c=C.init(S),t0=local(2026,12,6);const s=C.start(c,t0);C.answer(c,s.id,5,1,t0+MIN);
 assert.deepEqual(C.validate(JSON.parse(JSON.stringify(c))),c);
 assert.deepEqual(C.validate({sprints:{'amc8-1':{...s,items:s.items.slice(0,3)}}}),C.fresh(),'a damaged sprint is dropped');
 assert.deepEqual(C.validate({sprints:{x:{}}}),C.fresh());assert.deepEqual(C.validate(null),C.fresh());assert.deepEqual(C.validate({sprints:{'amc8-1':{...s,items:s.items.map(i=>({...i,unit:'nope'}))}}}),C.fresh());
 const v=C.validate({sprints:{'amc8-1':{...s,answers:[9,-1,'2',...Array(22).fill(0)],flags:[1,1,99,2],deadline:1}}}).sprints['amc8-1'];
 assert.deepEqual(v.answers.slice(0,4),[null,null,null,0]);assert.deepEqual(v.flags,[1,2]);assert.equal(v.deadline,t0+40*MIN,'the deadline is always 40 minutes from the start');
 // Two tablets: one finished sprint 1, the other started sprint 2 from an older copy.
 const a=JSON.parse(JSON.stringify(c)),b=JSON.parse(JSON.stringify(c));C.submit(a,'amc8-1',t0+10*MIN);const s2=C.start(C.validate(b),t0+DAY);const bb=C.validate(b);bb.sprints['amc8-2']=s2;
 const m=C.merge(a,bb);assert.deepEqual(Object.keys(m.sprints).sort(),['amc8-1','amc8-2']);assert.ok(m.sprints['amc8-1'].submittedAt,'a submitted copy beats a running one');
 assert.deepEqual(C.merge(undefined,a),C.validate(a),'a tablet without contest data merges unchanged');assert.deepEqual(C.merge(a,{}),C.validate(a));
});

test('sync, backup, restore and the nightly export carry contest data; older states are untouched',()=>{
 const sync=read('cloud-sync.js'),review=read('learning-review.js'),restore=read('study-ui.js'),app=read('app.js');
 assert.match(sync,/out\.contest=MochiContest\.merge\(local\.contest,remote\.contest\)/);assert.match(sync,/s\.contest=MochiContest\.validate\(s\.contest\)/);
 assert.match(review,/data\.contest=root\.MochiContest\.exportData\(state\.contest\);data\.contestReview=root\.MochiContest\.report\(data\.contest\)/);
 assert.match(restore,/contestRestored=window\.MochiContest&&raw\.contest\?MochiContest\.validate\(raw\.contest\):null/);
 assert.match(app,/S\.contest=MochiContest\.validate\(S\.contest\)/);assert.match(app,/S\.contest=MochiContest\.fresh\(\)/);
 // Older tablets copy an unknown top-level key as a whole, so contest data is never dropped by them.
 assert.match(sync,/for\(const \[k,v\] of Object\.entries\(other\)\)if\(out\[k\]===undefined\)out\[k\]=cp\(v\)/);
 const c=C.fresh(),t0=local(2026,12,7),s=C.start(c,t0);s.items.forEach((it,i)=>C.answer(c,s.id,i,i%5,t0+MIN));C.submit(c,s.id,t0+30*MIN);
 const x=C.exportData(c),rep=C.report(c,t0+DAY);
 assert.equal(x.detail.length,1);assert.equal(x.detail[0].questions.length,25);assert.match(x.detail[0].questions[0].correct,/^[A-E]$/);assert.equal(x.detail[0].questions[3].chosen,'D');
 assert.equal(rep.sprints[0].total,25);assert.equal(rep.sprints[0].minutes,30);assert.ok(Object.values(rep.topics).reduce((n,t)=>n+t.total,0)===25);assert.match(rep.limits,/not a prediction/);
 assert.deepEqual(C.validate(x),c,'the export is a valid backup of the records');
});

test('sprints never touch mastery evidence, existing papers or the mock schedule',()=>{
 const S={entrance:E.fresh()},d=E.init(S),before=JSON.stringify(d),c=C.init(S),s=C.start(c,local(2026,12,8));C.answer(c,s.id,0,0);C.submit(c,s.id);
 assert.equal(JSON.stringify(E.init(S)),before);
 assert.ok(E.paperDefinitions.every(p=>p.units.every(u=>!u.startsWith('amc-'))),'contest units stay out of every reserved paper and mock');
 assert.ok(E.paperDefinitions.filter(p=>p.kind==='mock').every(p=>p.spares.flat().every(u=>!u.startsWith('amc-'))));
});

test('a gentle suggestion: weekly in December, every few days in January, never on or after the contest day',()=>{
 const c=C.fresh();
 assert.deepEqual(C.suggestion(c,local(2026,12,1)),{kind:'start',number:1,daysLeft:56});
 const s=C.start(c,local(2026,12,1));assert.equal(C.suggestion(c,local(2026,12,1,16)+20*MIN).kind,'resume');C.submit(c,s.id,local(2026,12,1,16)+30*MIN);
 assert.equal(C.suggestion(c,local(2026,12,1,20)),null,'not twice in one day');assert.equal(C.suggestion(c,local(2026,12,5)),null);assert.equal(C.suggestion(c,local(2026,12,7)).number,2);
 const j=C.start(c,local(2027,1,10));C.submit(c,j.id,local(2027,1,10)+MIN);assert.equal(C.suggestion(c,local(2027,1,12)),null);assert.equal(C.suggestion(c,local(2027,1,13)).kind,'start');
 assert.equal(C.suggestion(c,local(2027,1,26)),null);assert.equal(C.suggestion(c,local(2027,2,3)),null);assert.equal(C.daysLeft(local(2027,1,25,23)),1);
});

test('before the contest, one new contest lesson a day once its foundations are learnt',()=>{
 const now=local(2026,12,2),S={entrance:E.fresh()},d=E.init(S),taught=(id,t=now-30*DAY)=>{for(let i=0;i<3;i++)E.visit(d,id,i,t);E.concept(d,id,E.unit(id).check[2],t+1);E.complete(d,id,t+2);};
 const r0=C.recommend(E,d,{kind:'learn',unit:'percent'},now);assert.equal(r0.unit,'percent','foundations not learnt yet');
 for(const id of ['area','angles'])taught(id);
 const r1=C.recommend(E,d,{kind:'practice',unit:'percent'},now);assert.equal(r1.unit,'amc-right');assert.equal(r1.contestPrep,true);
 assert.equal(C.recommend(E,d,{kind:'practice',unit:'percent',repair:true},now).unit,'percent','repair is never replaced');
 assert.equal(C.recommend(E,d,{kind:'recall',unit:'percent'},now).kind,'recall');
 E.visit(d,'amc-right',0,now-1000);assert.equal(C.recommend(E,d,{kind:'learn',unit:'percent'},now).unit,'percent','one new contest lesson a day');
 assert.equal(C.recommend(E,E.init({entrance:E.fresh()}),{kind:'learn',unit:'percent'},local(2027,1,27)).unit,'percent','not after the contest');
 assert.match(read('entrance-core.js'),/CT\.recommend\(E,d,x,now\)/);
});

test('the screens: Maths papers, overview, Today and the grown-up panel; no help during a sprint',()=>{
 const ui=read('entrance-ui.js'),today=read('today-ui.js'),html=read('index.html'),ct=read('contest-ui.js');
 assert.match(ui,/view\.kind==='contest'\)html=root\.MochiContestUI\?\.html\(S,view\.paper\)/);assert.match(ui,/MochiContestUI\?\.paperCard\(S\)/);assert.match(ui,/MochiContestUI\?\.homeCard\(S\)/);assert.match(ui,/MochiContestUI\?\.parent\(S\)/);
 assert.match(today,/todayContestOpen'\)\.onclick=\(\)=>\{leave\(\);U\('maths'\)\.open\('contest'\);\}/);
 const at=n=>html.indexOf(n);assert.ok(at('dsa-contest.js')>0&&at('dsa-contest.js')<at('entrance-data.js'));assert.ok(at('contest-core.js')>at('entrance-core.js'));assert.ok(at('contest-ui.js')<at('entrance-ui.js'));assert.ok(at('contest.css')>0);
 globalThis.document=undefined;require('../entrance-figures.js');require('../contest-ui.js');const U=globalThis.MochiContestUI,S={entrance:E.fresh()};
 assert.match(U.html(S,null),/25 multiple-choice questions[\s\S]*No calculator[\s\S]*costs nothing/);
 const c=C.init(S),s=C.start(c),page=U.html(S,s.id);
 assert.match(page,/id="ctClock"/);assert.equal((page.match(/data-ct-choice=/g)||[]).length,5);assert.equal((page.match(/data-ct-go="\d+"/g)||[]).length>=25,true);
 assert.doesNotMatch(page,/Ask Mochi|hint|data-lesson/i,'no tutor, hints or lessons while the clock runs');assert.doesNotMatch(ct,/callModel/);
 C.submit(c,s.id);const rev=U.html(S,s.id);assert.match(rev,/Achievement Roll[\s\S]*not a prediction/);assert.equal((rev.match(/class="ct-steps"/g)||[]).length,25);
});
