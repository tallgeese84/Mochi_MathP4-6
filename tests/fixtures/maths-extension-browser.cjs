/* Local synthetic profile only. Run with Playwright available on NODE_PATH. */
const assert=require('node:assert/strict'),http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright'),root=path.resolve(__dirname,'../..');
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png'};
const server=http.createServer((req,res)=>{
 const file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);
 if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
 try{res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));}catch(_){res.writeHead(404);res.end();}
});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});
  const context=await browser.newContext({viewport:{width:390,height:844},timezoneId:'America/Chicago',serviceWorkers:'block',reducedMotion:'reduce'});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
  await page.clock.install({time:new Date('2026-10-11T17:00:00Z')});
  const url=`http://127.0.0.1:${server.address().port}/index.html`;
  await page.goto(url);await page.waitForFunction(()=>window.MochiTodayUI&&window.MochiPlanUI);
  await page.clock.pauseAt(new Date('2026-10-11T17:05:00Z'));
  await page.evaluate(async()=>{
   S.entrance=MochiEntrance.fresh();S.sciencePath=MochiSciencePath.fresh();S.planner=MochiPlanner.fresh();S.questRewards=MochiQuestRewards.fresh();
   const now=Date.now();for(let i=0;i<3;i++)MochiEntrance.visit(S.entrance,'relationships',i,now-10000);
   MochiEntrance.concept(S.entrance,'relationships',MochiEntrance.unit('relationships').check[2],now-9000);MochiEntrance.complete(S.entrance,'relationships',now-8000);
   await save(S);MochiTodayUI.open();
  });
  assert.equal(await page.locator('#todayMathsExtension').isVisible(),false,'extra remains hidden before required Maths finishes');
  const baseline=await page.evaluate(async()=>{
   const now=Date.now(),target=MochiPlanner.minutes(S.planner,'maths');
   S.planner.sessions.push({id:'synthetic-required-maths',subject:'maths',day:MochiPlanner.localDay(),start:now-7200000,end:now-7200000+target*60000});
   await save(S);MochiTodayUI.open();return {schedule:JSON.stringify(S.planner.schedule),coins:S.coins,progress:MochiToday.model(S).completed};
  });
  assert.equal(await page.locator('#todayMathsExtension').isVisible(),true);
  assert.equal(await page.locator('#todayStart').getAttribute('data-subject'),'science','required Science remains the main action');
  if(process.env.BROWSER_SCREENSHOT){await page.locator('#todayMathsExtension').evaluate(el=>el.scrollIntoView({block:'center'}));await page.screenshot({path:process.env.BROWSER_SCREENSHOT});}
  await page.locator('#todayMathsExtensionStart').click();
  assert.equal(await page.evaluate(()=>MochiPlanUI.running()),'maths');
  assert.match(await page.locator('#todayFocusTime').innerText(),/optional min left/);
  const draft=await page.evaluate(()=>S.entrance.draft.id);
  await page.locator('#epAnswer').fill('17');await page.locator('#epWorkPanel summary').click();await page.locator('#epKeyboard').click();await page.locator('#epWorking').fill('My saved reasoning.');
  await page.clock.runFor(120000);await page.locator('#todayTimer').click();
  const paused=await page.evaluate(()=>MochiPlanner.mathsExtension(S.planner).spent);
  await page.clock.runFor(30000);assert.equal(await page.evaluate(()=>MochiPlanner.mathsExtension(S.planner).spent),paused,'paused time never spends the extra budget');
  await page.locator('#todayTimer').click();await page.clock.runFor(60000);
  await page.evaluate(()=>window.dispatchEvent(new Event('blur')));
  const background=await page.evaluate(()=>MochiPlanner.mathsExtension(S.planner).spent);
  await page.clock.runFor(30000);assert.equal(await page.evaluate(()=>MochiPlanner.mathsExtension(S.planner).spent),background,'inactive window pauses the same foreground clock');
  await page.evaluate(()=>MochiTodayUI.open());
  await page.reload();await page.waitForFunction(()=>window.MochiTodayUI&&window.MochiPlanUI);
  assert.equal(await page.evaluate(()=>MochiPlanUI.running()),null,'reload never resumes time automatically');
  assert.equal(await page.evaluate(()=>MochiPlanner.mathsExtension(S.planner).spent),background,'reload keeps the remaining daily budget');
  assert.match(await page.locator('#todayMathsExtensionStart').innerText(),/Resume optional/);
  await page.locator('#todayMathsExtensionStart').click();
  assert.equal(await page.evaluate(()=>S.entrance.draft.id),draft);assert.equal(await page.locator('#epAnswer').inputValue(),'17');
  assert.equal(await page.locator('#epWorking').inputValue(),'My saved reasoning.');
  await page.clock.runFor(121000);
  assert.equal(await page.evaluate(()=>MochiPlanUI.running()),null);
  assert.equal(await page.evaluate(()=>MochiPlanner.mathsExtension(S.planner).spent),300000,'five minutes is an exact cap');
  assert.equal(await page.evaluate(()=>MochiEntranceUI.view().kind),'practice','time cannot abandon or submit a question');
  assert.equal(await page.locator('#epAnswer').inputValue(),'17');
  assert.equal(await page.evaluate(()=>S.entrance.attempts.length),0,'clock never manufactures an answer');
  await page.evaluate(()=>MochiEntranceUI.next());
  assert.equal(await page.evaluate(()=>MochiTodayUI.visible()),true,'next question boundary returns to Today');
  assert.equal(await page.locator('#todayMathsExtension').isVisible(),false,'there is no second daily five-minute budget');
  assert.equal(await page.evaluate(()=>JSON.stringify(S.planner.schedule)),baseline.schedule);
  assert.equal(await page.evaluate(()=>MochiToday.model(S).completed),baseline.progress);
  assert.equal(await page.evaluate(()=>S.coins),baseline.coins);assert.equal(await page.evaluate(()=>Object.keys(S.planner.milestones).length),0);
  const report=await page.evaluate(()=>MochiReview.build(S,APP_VERSION));
  assert.equal(report.learningPlanReview.mathsExtension.spent,300000);assert.equal(report.planner.sessions.filter(s=>s.kind==='maths-extension').length,3);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'390px layout has no horizontal overflow');
  assert.deepEqual(errors,[]);console.log('Maths extension browser: passed (real foreground clock, pause, blur, reload, exact 5m, safe boundary, progress/rewards preserved, mobile layout).');
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
