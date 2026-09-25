/* Synthetic integration checks. No learner backup or remote family configuration. */
async function runTodayChecks(w){
 const d=w.document,E=w.MochiEntrance,SC=w.MochiSciencePath,P=w.MochiPlanner;
 const delay=ms=>new Promise(r=>w.setTimeout(r,ms)),check=(v,m)=>{if(!v)throw Error(m);};
 const $=id=>d.getElementById(id),click=id=>{check(!!$(id),'Missing '+id);check(!$(id).disabled,'Disabled '+id);$(id).click();};
 const input=(id,value)=>{$(id).value=value;$(id).dispatchEvent(new w.Event('input',{bubbles:true}));};
 const menu=()=>click('todayMore');const navigate=(subject,view)=>{menu();d.querySelector(`[data-today-subject="${subject}"]${view?`[data-today-view="${view}"]`:''}`).click();};
 const errors=[];w.addEventListener('error',e=>errors.push(e.message));w.confirm=()=>true;
 check(w.MochiTodayUI.visible(),'Today is the initial screen');
 check($('viewEntrance').hidden&&$('viewSciencePath').hidden,'Old dashboards are not landing screens');
 check(w.MochiPlanUI.running()===null,'Opening home never starts a clock');
 check(d.querySelectorAll('#todayHome .today-primary').length===1,'Exactly one main action');
 check(w.getComputedStyle($('dailyPlan')).display==='none','No duplicated time dashboard');
 check(w.getComputedStyle(d.querySelector('.subject-switch')).display==='none','No competing subject tabs');
 const frozen=()=>w.eval('JSON.stringify({learning:S.learning.attempts,science:S.science.attempts,coins:S.coins,worn:S.worn,catFriends:S.catFriends})');
 const original=frozen(),before=w.eval('JSON.stringify({math:S.entrance,science:S.sciencePath})');
 for(let i=0;i<3;i++)w.MochiTodayUI.paint();
 check(w.eval('JSON.stringify({math:S.entrance,science:S.sciencePath})')===before,'Rendering has no question or mastery side effects');
 click('todayStart');check(w.MochiEntranceUI.view().kind==='lesson','One click starts the recommended lesson');
 check(w.MochiPlanUI.running()==='maths','Start explicitly begins maths time');
 check(w.getComputedStyle(d.querySelector('.ep-nav')).display==='none','Library navigation recedes during focused study');
 click('epLessonNext');input('epLessonNotes','My saved lesson note.');click('todayBack');
 check(w.MochiTodayUI.visible(),'Back goes to the single plan');check(w.MochiPlanUI.running()===null,'Home stops the clock');
 check($('todayStart').textContent==='Continue Maths','Resume is one action');click('todayStart');
 check(w.eval('S.entrance.lessons.relationships.page')===1,'The same lesson section resumes');
 check($('epLessonNotes').value==='My saved lesson note.','Lesson notes remain');
 click('epLessonNext');d.querySelector('#viewEntrance [data-concept="'+E.unit('relationships').check[2]+'"]').click();click('epCompleteLesson');
 check(w.MochiEntranceUI.view().kind==='practice','Teaching flows into guided practice');
 const id=w.eval('S.entrance.draft.id');input('epAnswer','17');input('epWorking','My unfinished reasoning.');click('epStylus');
 const cv=$('epCanvas'),rect=cv.getBoundingClientRect();
 if(rect.width&&typeof w.PointerEvent==='function'){
  // Synthetic pointer events have no OS pointer to capture; geometry and persistence remain real.
  const capture=cv.setPointerCapture;cv.setPointerCapture=()=>{};
  cv.dispatchEvent(new w.PointerEvent('pointerdown',{pointerId:7,pointerType:'pen',button:0,clientX:rect.x+20,clientY:rect.y+20,bubbles:true}));
  cv.dispatchEvent(new w.PointerEvent('pointermove',{pointerId:7,pointerType:'pen',clientX:rect.x+80,clientY:rect.y+40,bubbles:true}));
  cv.dispatchEvent(new w.PointerEvent('pointerup',{pointerId:7,pointerType:'pen',clientX:rect.x+80,clientY:rect.y+40,bubbles:true}));
  cv.setPointerCapture=capture;check(w.eval('S.entrance.draft.strokes.length')===1,'Handwriting is saved');
 }
 click('todayBack');click('todayStart');check(w.eval('S.entrance.draft.id')===id,'Same draft resumes');
 check($('epAnswer').value==='17'&&$('epWorking').value==='My unfinished reasoning.','Answer and working survive navigation');
 check(!w.eval('S.entrance.attempts.length'),'Navigation cannot submit a question');
 click('todayTimer');check(w.MochiPlanUI.running()===null,'Pause time is explicit');click('todayTimer');check(w.MochiPlanUI.running()==='maths','Resume time works');
 // A timer reaching its goal must not change the question or erase an answer.
 w.MochiPlanUI.pause();w.eval(`{const now=Date.now(),minutes=MochiPlanner.minutes(S.planner,'maths');S.planner.sessions.push({id:'synthetic-finished-maths',subject:'maths',day:MochiPlanner.localDay(),start:now-7200000,end:now-7200000+minutes*60000});save(S);}`);
 w.MochiTodayUI.paint();check(w.MochiEntranceUI.view().kind==='practice','Reaching time never jumps out of an answer');
 check($('epAnswer').value==='17','Answer still present at time goal');click('todayBack');
 check($('todayStart').dataset.subject==='science','Science is the next planned block');click('todayStart');
 check(w.MochiSciencePathUI.view().kind==='lesson','Science begins directly, not at a second dashboard');check(w.MochiPlanUI.running()==='science','Only science time runs now');
 click('todayBack');const dataBeforeMenus=w.eval('JSON.stringify({math:S.entrance,science:S.sciencePath})');
 menu();d.querySelector('[data-today-subject="maths"][data-today-view="papers"]').click();
 check(w.MochiEntranceUI.view().kind==='papers','Reserved papers remain findable');
 check(w.eval('JSON.stringify({math:S.entrance,science:S.sciencePath})')===dataBeforeMenus,'Listing papers does not expose or start one');
 click('epHome');check(w.MochiTodayUI.visible(),'Paper list returns to Today');
 navigate('maths','lessons');check(d.querySelectorAll('#viewEntrance [data-lesson]').length===24,'Math library retained');click('epHome');
 navigate('science','lessons');check(d.querySelectorAll('#viewSciencePath [data-lesson]').length===24,'Science library retained');click('spHome');
 menu();click('todayWeekly');check($('mochiFocusHome').open&&!$('sessionPanel').hidden,'Existing weekly plan accessible');w.eval('focusClose(false)');
 menu();click('todayParent');check($('ov').classList.contains('show'),'Parent evidence and settings accessible');click('ovClose');
 navigate('labs');check(!$('viewScience').hidden,'Original experiments reachable');w.MochiTodayUI.open();
 // Existing records still qualify under their old rules; no reward or scoring migration.
 check(frozen()===original,'Existing attempts, coins, wardrobe and cats preserved');
 const backup=w.MochiReviewDownload.make();check(backup.entrance.draft.id===id,'Backup contains same unfinished draft');check(backup.sciencePath,'Science export retained');
 // Readiness screens must not interrupt an already-open assessment on reload.
 w.MochiPlanUI.pause();E.startPaper(w.eval('S.entrance'),'mixed-a',Date.now());w.MochiTodayUI.open();
 const deadline=w.eval('S.entrance.papers["mixed-a"].deadline');click('todayStart');
 check(w.MochiEntranceUI.view().kind==='paper','Saved paper has priority');check(!w.eval('S.entrance.papers["mixed-a"].interrupted'),'Resuming itself is not an interruption');
 check(w.eval('S.entrance.papers["mixed-a"].deadline')===deadline,'Original deadline retained');
 input('epAnswer','42');w.confirm=()=>false;click('todayMore');
 check(!$('todayMenu').open&&w.MochiEntranceUI.view().kind==='paper','Declining navigation leaves the paper alone');
 check(!w.eval('S.entrance.papers["mixed-a"].interrupted'),'Declining does not mark support');
 w.confirm=()=>true;click('todayMore');check($('todayMenu').open,'Confirmed navigation opens menu');
 check(w.eval('S.entrance.papers["mixed-a"].interrupted'),'Confirmed navigation preserves conservative assessment rules');
 check(w.eval('S.entrance.papers["mixed-a"].answers[0].answer')==='42','Paper answer saved');click('todayMenuClose');
 check(w.MochiTodayUI.visible(),'Closing menu after leaving paper never leaves a blank page');
 // A clean synthetic reset is only for this test profile and preview, not an app migration.
 w.eval('S.entrance=MochiEntrance.fresh();S.sciencePath=MochiSciencePath.fresh();S.planner=MochiPlanner.fresh();');w.MochiTodayUI.open();
 check(!w.MochiPlanUI.running(),'Preview remains idle');
 await delay(150);check(errors.length===0,'Page errors: '+errors.join('; '));
 return {result:'passed',oneNextAction:true,resumeLesson:true,resumeDraft:true,notesAndWorking:true,timeBoundary:true,scienceHandoff:true,paperProtection:true,menus:true,backup:true,pageErrors:errors};
}
