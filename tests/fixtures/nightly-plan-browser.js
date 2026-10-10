(async()=>{
 const sleep=ms=>new Promise(r=>setTimeout(r,ms)),ok=(v,m)=>{if(!v)throw Error(m)},frame=document.querySelector('iframe');
 try{
  ok(['localhost','127.0.0.1','[::1]'].includes(location.hostname),'Local test host only');
  ok(!localStorage.getItem('mochi-tutor-v1')&&!localStorage.getItem('cubs_sync')&&!localStorage.getItem('mochi_drive_mirror_secret_v1'),'Fresh synthetic profile required');
  localStorage.setItem('mochi-room-view-v1','picture');frame.src='../../index.html';
  for(let i=0;i<400&&!(frame.contentWindow.MochiNightlyPlan&&frame.contentWindow.MochiReady&&frame.contentWindow.MochiTodayUI);i++)await sleep(30);
  const w=frame.contentWindow,d=frame.contentDocument,N=w.MochiNightlyPlan,M=w.MochiEntrance,S=w.MochiSciencePath,C=w.MochiNightlyPlanCore,errors=[];ok(N&&M&&S,'App started');w.confirm=()=>true;
  w.addEventListener('error',e=>errors.push(e.message));w.addEventListener('unhandledrejection',e=>errors.push(String(e.reason)));
  const $=id=>d.getElementById(id),click=id=>{ok($(id),'Missing '+id);ok(!$(id).disabled,'Disabled '+id);$(id).click()},input=(id,v)=>{$(id).value=v;$(id).dispatchEvent(new w.Event('input',{bubbles:true}))},state=()=>w.eval('S');
  const t=Date.now(),date=C.day(t,'America/Chicago'),prior=C.day(t-86400000,'America/Chicago');
  const plan={schema:1,id:'synthetic-nightly-'+date,revision:1,student:'Euna',timeZone:'America/Chicago',sessionDate:date,reviewedDate:prior,generatedAt:new Date(t-1000).toISOString(),sourceExportedAt:new Date(t-3600000).toISOString(),subjects:{maths:{focus:'Identify the whole, then choose the calculation.',steps:[{kind:'lesson',unit:'percent'},{kind:'practice',unit:'percent',phase:'guided',count:1},{kind:'practice',unit:'percent',phase:'apply',count:2}]},science:{focus:'Choose one change and explain the evidence.',steps:[{kind:'lesson',unit:'fairtest'},{kind:'practice',unit:'fairtest',phase:'guided',count:1},{kind:'practice',unit:'fairtest',phase:'apply',count:2}]}}};
  let served=structuredClone(plan),mode='good',calls=0;
  w.MochiNetwork.request=async(url,options,readJSON)=>{
   if(JSON.parse(options.body||'{}').backup)return {ok:true,type:'opaque'};
   ok(/script\.google\.com\/macros\/s\/synthetic-test\/exec$/.test(url),'Only synthetic relay');ok(!url.includes('secret'),'No URL secret');ok(options.mode==='cors'&&options.credentials==='omit'&&readJSON===true,'Readable bounded request');const body=JSON.parse(options.body);ok(body.action==='readNextSession'&&body.secret==='synthetic-secret-for-tests-only','Body authentication only');ok(!body.backup,'No learning write in a plan read');calls++;if(mode==='error')throw Error('Simulated network failure');if(mode==='legacy')return {ok:false,error:'Invalid backup'};return {ok:true,service:'mochi-drive-mirror',planApi:1,plan:served};
  };
  w.eval('S.entrance=MochiEntrance.fresh();S.sciencePath=MochiSciencePath.fresh();S.planner=MochiPlanner.fresh();S.coins=37;');
  const savedRewards=JSON.stringify({coins:state().coins,catFriends:state().catFriends}),oldVersion=w.eval('APP_VERSION');
  localStorage.setItem('mochi_drive_mirror_url_v1','https://script.google.com/macros/s/synthetic-test/exec');localStorage.setItem('mochi_drive_mirror_secret_v1','synthetic-secret-for-tests-only');
  await N.refresh(true);ok(JSON.stringify({coins:state().coins,catFriends:state().catFriends})===savedRewards,'Receiving a plan cannot change rewards');w.MochiTodayUI.open();ok(N.report().planId===plan.id,'Private plan received');ok($('todayTaskDetail').textContent===plan.subjects.maths.focus,'Homepage uses private priority');ok(!$('todayNightlyStatus').hidden&&!$('todayNightlyStatus').textContent.includes(date),'Child sees a friendly plan line without plan dates');ok(N.label().includes(date),'Grown-up status keeps the plan date');
  click('todayStart');ok(w.MochiEntranceUI.view().unit==='percent','Launches planned Maths lesson');
  const teachAtScreen=(E,UI,key,id,prefix)=>{const data=state()[key];for(let i=0;i<3;i++)E.visit(data,id,i,Date.now());E.concept(data,id,E.unit(id).check[2]);UI.open('lesson',id);click(prefix+'CompleteLesson');};
  teachAtScreen(M,w.MochiEntranceUI,'entrance','percent','ep');ok(state().entrance.draft.phase==='guided','Finish lesson leads into planned guided question');
  for(let i=0;i<3;i++){
   const data=state().entrance,v=data.draft;ok(v.phase===(i===0?'guided':'apply'),'Planned phase '+i);const q=M.question(v);input('epAnswer',q.answerLabel);input('epWorking','Work backwards from the final proportion.');click('epCheckAnswer');ok(data.attempts.at(-1).correct,'Answer recorded '+i);click('epNextPractice');
  }
  ok(N.report().steps.maths.index===3,'Finite Maths queue is consumed');ok(state().entrance.attempts.length===3,'No phantom attempts');ok(state().entrance.attempts[0].helped,'Guided work remains supported');
  // A newer plan cannot replace an open editor. It is adopted only after a safe transition.
  w.MochiTodayUI.open();M.finishPractice(state().entrance);M.startPractice(state().entrance,'percent',{phase:'apply',seed:71193});w.MochiEntranceUI.open('practice','percent');input('epAnswer','123');input('epWorking','Keep this unfinished working.');
  served=structuredClone(plan);served.revision=2;served.generatedAt=new Date().toISOString();await N.refresh(true);ok($('epAnswer').value==='123'&&$('epWorking').value==='Keep this unfinished working.','Update does not alter active editor');ok(N.report().revision===1,'New revision waits at active screen');
  w.MochiTodayUI.open();ok(N.report().revision===2,'Queued revision adopted at Home');click('todayStart');ok($('epAnswer').value==='123','Unfinished question comes before nightly queue');
  // A failed refresh leaves the valid dated plan and learner records intact.
  const before=JSON.stringify(state().entrance);mode='error';await N.refresh(true);ok(N.report().revision===2,'Network failure retains valid saved plan');ok(before===JSON.stringify(state().entrance),'No data loss on failure');
  mode='legacy';await N.refresh(true);ok($('nightlyPlanStatus').textContent.includes('One-time relay upgrade'),'Old relay explicitly needs setup');mode='good';
  // Turn off the synthetic Maths schedule to exercise the full Science route within its existing budget.
  w.MochiTodayUI.open();M.finishPractice(state().entrance);w.eval('S.planner.schedule.week.forEach(x=>x.maths=0)');
  click('todayStart');ok(w.MochiSciencePathUI.view().unit==='fairtest','Planned Science lesson');teachAtScreen(S,w.MochiSciencePathUI,'sciencePath','fairtest','sp');ok(state().sciencePath.draft.phase==='guided','Science guided sequence');
  for(let i=0;i<3;i++){const data=state().sciencePath;ok(data.draft.phase===(i===0?'guided':'apply'),'Science phase '+i);input('spAnswer',S.question(data.draft).answer);click('spCheckAnswer');ok(data.attempts.at(-1).correct,'Science answer');click('spNextPractice');}
  ok(N.report().steps.science.index===3,'Finite Science queue is consumed');ok(Number.isFinite(state().coins)&&state().coins>=37,'Prior coins are preserved through normal learning');ok(w.eval('APP_VERSION')===oldVersion,'Data updates do not change app version');
  w.MochiTodayUI.open();w.eval('S.planner.schedule.week.forEach(x=>x.maths=25)');
  // Reserved paper and its deadline remain intact even after receiving priorities.
  w.MochiEntranceUI.open('paper','mixed-a');const deadline=state().entrance.papers['mixed-a'].deadline;served.revision=3;served.generatedAt=new Date().toISOString();await N.refresh(true);ok(state().entrance.papers['mixed-a'].deadline===deadline,'Paper deadline unchanged');ok(w.MochiToday.task(state(),'maths').kind==='paper','Paper has precedence');ok(!$('epTutorAsk'),'No private plan gives paper help');
  state().entrance.papers={};w.MochiTodayUI.open();
  // Final display: a new plan renders with no software release and no extra start buttons.
  await N.refresh(true);frame.style.width='375px';await sleep(100);ok(d.documentElement.scrollWidth<=375,'375px compact layout');const exported=w.MochiReview.build(state(),oldVersion);ok(exported.nightlyPlanReview?.planId===plan.id,'Mirror includes a receipt, not only a recommendation');ok(!JSON.stringify(exported).includes('synthetic-secret-for-tests-only'),'No secret in learning export');
  frame.style.width='100%';await sleep(200);ok(errors.length===0,errors.join(';'));document.body.dataset.result='passed';document.getElementById('result').textContent=JSON.stringify({result:'passed',calls,checks:['two subject queues','same version / revised plan','saved answer preservation','failed/legacy relay fallback','assistance flags unchanged','bounded completion','paper protection','375px layout','private read-back receipt'],errors});
 }catch(e){document.body.dataset.result='failed';document.getElementById('result').textContent=e.stack||String(e);}
})();
