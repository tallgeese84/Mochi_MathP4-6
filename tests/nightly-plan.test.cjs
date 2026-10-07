const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const C=require('../nightly-plan-core.js'),M=require('../entrance-core.js'),S=require('../science-path-core.js');
const engines={maths:M,science:S},now=Date.parse('2026-10-07T15:00:00Z');
const state=()=>({entrance:M.fresh(),sciencePath:S.fresh()});
const copy=x=>JSON.parse(JSON.stringify(x));
const plan=()=>({schema:1,id:'synthetic-nightly-2026-10-07',revision:1,student:'Euna',timeZone:'America/Chicago',reviewedDate:'2026-10-06',sessionDate:'2026-10-07',generatedAt:'2026-10-07T05:10:00Z',sourceExportedAt:'2026-10-07T01:00:00Z',subjects:{maths:{focus:'Compare one face with two matching faces.',steps:[{kind:'lesson',unit:'percent'},{kind:'practice',unit:'percent',phase:'guided',count:1},{kind:'practice',unit:'percent',phase:'apply',count:2}]},science:{focus:'Explain what the evidence can establish.',steps:[{kind:'lesson',unit:'fairtest'},{kind:'practice',unit:'fairtest',phase:'guided',count:1},{kind:'practice',unit:'fairtest',phase:'apply',count:2}]}}});
function teach(E,d,id){for(let i=0;i<3;i++)E.visit(d,id,i,now-10000);E.concept(d,id,E.unit(id).check[2],now-9000);E.complete(d,id,now-8000);}
for(const subject of ['maths','science'])test('nightly '+subject+' queue: lesson, supported practice, two real checks; no mastery edits',()=>{
 const E=engines[subject],key=subject==='maths'?'entrance':'sciencePath',s=state(),id=subject==='maths'?'percent':'fairtest',d=s[key],r=C.fresh(C.validate(plan(),engines,now),now);
 const untouched=JSON.stringify(s);let task=C.next(r,s,subject,engines,now);assert.equal(task.kind,'lesson');assert.equal(JSON.stringify(s),untouched,'read-only route');
 C.bind(r,task,{kind:'lesson',unit:id},null);assert.equal(C.lessonDone(r,subject,'wrong'),false);teach(E,d,id);assert(C.lessonDone(r,subject,id));assert.equal(C.lessonDone(r,subject,id),false,'no duplicate step credit');
 for(let i=0;i<3;i++){
  task=C.next(r,s,subject,engines,now);assert.equal(task.phase,i===0?'guided':'apply');
  const v=E.startPractice(d,id,{phase:task.phase,seed:7101+i*113,now});C.bind(r,task,{kind:'practice',unit:id},v);
  assert.equal(C.settle(r,s,subject),false,'opening is not doing');const q=E.question(v);E.touchDraft(d,{answer:E===M?q.answerLabel:q.answer},now+1);E.respond(d,now+2);
  assert.equal(C.settle(r,s,subject),false,'checking does not skip the feedback');const before=JSON.stringify(d.attempts);E.finishPractice(d);assert(C.settle(r,s,subject));assert.equal(JSON.stringify(d.attempts),before,'queue never writes marks');assert.equal(C.settle(r,s,subject),false);
 }
 assert.equal(C.next(r,s,subject,engines,now),null);assert.equal(r.progress[subject].index,3);
});
test('strict private plan schema rejects arbitrary questions, scripts, credentials, scores, time goals and forged dates',()=>{
 const changes=[p=>p.schema=2,p=>p.student='Other',p=>p.subjects.maths.steps[0].unit='not-a-unit',p=>p.subjects.maths.steps[0].kind='paper',p=>p.subjects.maths.steps[1].phase='baseline',p=>p.subjects.maths.steps[1].count=200,p=>p.subjects.maths.focus='<script>oops</script>',p=>p.secret='not-allowed',p=>p.subjects.maths.minutes=50,p=>p.revision=0,p=>p.reviewedDate='2026-10-09',p=>p.sessionDate='2026-02-30',p=>p.generatedAt='2026-10-08T15:00:00Z',p=>p.sourceExportedAt='2026-10-03T00:00:00Z',p=>p.subjects.science=null,p=>p.timeZone='invalid/zone'];
 for(const change of changes){const p=plan();change(p);assert.throws(()=>C.validate(p,engines,now));}
 const round=C.validate(plan(),engines,now);assert.deepEqual(round,plan());
});
test('plans expire by local calendar date, respecting Chicago daylight saving',()=>{
 const p=C.validate(plan(),engines,now);assert(C.usable(p,Date.parse('2026-10-08T04:59:59Z')));assert(!C.usable(p,Date.parse('2026-10-08T05:00:00Z')));
 assert.equal(C.day(Date.parse('2026-11-02T05:30:00Z'),'America/Chicago'),'2026-11-01');assert.equal(C.day(Date.parse('2026-11-02T06:00:00Z'),'America/Chicago'),'2026-11-02');
});
test('saved drafts, unfinished lessons, active papers and due recall take precedence',()=>{
 const r=C.fresh(C.validate(plan(),engines,now),now);
 for(const kind of ['draft','mixed','lesson','paper','recall']){
  const s=state(),d=s.entrance;
  if(kind==='draft')M.startPractice(d,'relationships',{phase:'apply',now});
  if(kind==='mixed')d.mixed={id:'synthetic-mix',at:now,completedAt:0,items:[{unit:'percent',form:1,seed:91,rev:3,recall:false}]};
  if(kind==='lesson')M.visit(d,'rates',0,now);
  if(kind==='paper')M.startPaper(d,'mixed-a',now);
  if(kind==='recall'){
   teach(M,d,'relationships');for(let i=0;i<3;i++){const v=M.startPractice(d,'relationships',{phase:i===2?'transfer':'apply',seed:91821+i,now:now-9*M.DAY});const q=M.question(v);M.touchDraft(d,{answer:q.answerLabel,working:'Use the two given relationships.'},now-9*M.DAY+1);M.respond(d,now-9*M.DAY+2);M.finishPractice(d);}
   assert(M.evidence(d,'relationships',now).overdue);
  }
  const before=JSON.stringify(s);assert.equal(C.next(r,s,'maths',engines,now),null,kind);assert.equal(JSON.stringify(s),before,kind+' preserved');
 }
});
test('unlearned topics become lessons and unsupported transfer becomes application',()=>{
 const p=plan();p.subjects.maths.steps=[{kind:'practice',unit:'percent',phase:'transfer',count:1}];const s=state(),r=C.fresh(C.validate(p,engines,now),now);const preteach=C.next(r,s,'maths',engines,now);assert.equal(preteach.kind,'lesson');C.bind(r,preteach,{kind:'lesson',unit:'percent'},null);teach(M,s.entrance,'percent');assert.equal(C.lessonDone(r,'maths','percent'),false,'prerequisite teaching must not consume the intended question');assert.equal(r.progress.maths.index,0);assert.equal(C.next(r,s,'maths',engines,now).phase,'apply');
});
test('queue survives reload; cache never confers independent mastery on help, incorrect or pending answers',()=>{
 const p=plan();p.subjects.science.steps=[{kind:'practice',unit:'fairtest',phase:'apply',count:1}];const s=state();teach(S,s.sciencePath,'fairtest');let r=C.fresh(C.validate(p,engines,now),now),t=C.next(r,s,'science',engines,now);const v=S.startPractice(s.sciencePath,'fairtest',{phase:t.phase,seed:87,now});C.bind(r,t,{kind:'practice',unit:'fairtest'},v);r=C.restore(copy(r),engines,now);assert.equal(r.progress.science.active.id,v.id);S.help(s.sciencePath);S.touchDraft(s.sciencePath,{answer:S.question(v).answer},now+1);S.respond(s.sciencePath,now+2);S.finishPractice(s.sciencePath);C.settle(r,s,'science');assert(!s.sciencePath.attempts[0].independent);assert.equal(r.progress.science.index,1);
});
function relay(overrides={}){
 const writes=[],props={MIRROR_SECRET:'synthetic-secret-24-characters',MIRROR_FOLDER_ID:'synthetic-folder',NIGHTLY_PLAN_DOC_ID:'synthetic-doc'},ctx={JSON,Date,Error,console,PropertiesService:{getScriptProperties:()=>({getProperty:k=>props[k]})},ContentService:{MimeType:{JSON:'JSON'},createTextOutput:text=>({text,setMimeType(){return this;}})},MimeType:{GOOGLE_DOCS:'doc'},DriveApp:{Access:{PRIVATE:'private'},getFileById:id=>({isTrashed:()=>false,getMimeType:()=> 'doc',getSharingAccess:()=> 'private'}),getFolderById:()=>{writes.push(1);throw Error('No write allowed during read');}},DocumentApp:{openById:id=>{assert.equal(id,'synthetic-doc');return {getBody:()=>({getText:()=>JSON.stringify(plan())})};}},...overrides};vm.createContext(ctx);vm.runInContext(fs.readFileSync(require.resolve('../tools/mochi-drive-mirror.gs'),'utf8'),ctx);return {ctx,writes,post:body=>JSON.parse(ctx.doPost({postData:{contents:JSON.stringify(body)}}).text)};
}
test('relay requires existing body secret and can only read the configured private plan',()=>{
 const {ctx,post,writes}=relay();assert.equal(post({action:'readNextSession'}).ok,false);const result=post({action:'readNextSession',secret:'synthetic-secret-24-characters',fileId:'untrusted-other'});assert(result.ok);assert.equal(result.plan.id,plan().id);assert.equal(writes.length,0);const health=JSON.parse(ctx.doGet().text);assert(!health.plan);assert.equal(health.planApi,1);
});
test('relay refuses public-plan and invalid JSON sources without returning private contents',()=>{
 const r=relay({DocumentApp:{openById:()=>({getBody:()=>({getText:()=> 'invalid private data'})})}});const x=r.post({action:'readNextSession',secret:'synthetic-secret-24-characters'});assert.equal(x.ok,false);assert(!JSON.stringify(x).includes('invalid private data'));
 const pub=relay({DriveApp:{Access:{PRIVATE:'private'},getFileById:()=>({isTrashed:()=>false,getMimeType:()=> 'doc',getSharingAccess:()=> 'anyone'})}});assert.equal(pub.post({action:'readNextSession',secret:'synthetic-secret-24-characters'}).ok,false);
});
test('transport uses body authentication, readable bounded requests, not JSONP or URL credentials',()=>{
 const src=fs.readFileSync(require.resolve('../nightly-plan.js'),'utf8');assert.match(src,/mode:'cors',credentials:'omit',redirect:'follow',cache:'no-store'/);assert.match(src,/JSON.stringify\(\{action:'readNextSession',secret:c.secret\}\)/);assert(!src.includes('no-cors'));assert(!src.includes('callback='));assert(!src.includes('innerHTML=plan'));assert.match(src,/MochiNetwork.request/);
});
