/* Synthetic-only browser regression shared by the localhost CI page and offline DOM tests. */
async function runSciencePathChecks(w){
 const d=w.document,sleep=ms=>new Promise(r=>w.setTimeout(r,ms)),check=(v,m)=>{if(!v)throw Error(m);},click=id=>{const e=d.getElementById(id);check(!!e,'Missing '+id);e.click();},query=s=>{const e=d.querySelector(s);check(!!e,'Missing '+s);return e;};
 const E=w.MochiSciencePath,errors=[];w.addEventListener('error',e=>errors.push(e.message));w.confirm=()=>true;
 const unchanged=()=>w.eval('JSON.stringify({math: S.entrance, oldMath: S.learning.attempts, oldScience: S.science.attempts, coins: S.coins, worn:S.worn})');
 const original=unchanged();
 check(w.MochiEntranceUI.visible(),'Maths remains the default home');click('subjectScience');check(w.MochiSciencePathUI.visible(),'Science pathway is visible');
 check(d.getElementById('spTitle').textContent==='Ask questions. Follow the evidence.','Science title');
 click('spLessons');check(d.querySelectorAll('#viewSciencePath [data-lesson]').length===24,'24 science lessons');
 query('#viewSciencePath [data-lesson="measurement"]').click();
 click('spLessonNext');check(!!query('#viewSciencePath .sp-question-sheet'),'Worked example');
 query('#spExample').value='1';query('#spExample').dispatchEvent(new w.Event('change'));check(!!query('#viewSciencePath table'),'Worked data table');
 click('spLessonNext');query('#viewSciencePath [data-concept="'+E.unit('measurement').check[2]+'"]').click();click('spCompleteLesson');
 check(w.eval('S.sciencePath.draft.phase')==='guided','Guided comes first');
 function respond(q,incorrectReason=false){const[c,r]=q.answer.split(':');
  if(q.statements)for(let i=0;i<3;i++)query(`#viewSciencePath [data-sp-statement="${i}"][data-sp-truth="${c[i+1]}"]`).click();
  else query('#viewSciencePath [data-sp-claim="'+c+'"]').click();
  query('#viewSciencePath [data-sp-reason="'+(incorrectReason?'r'+((+r.slice(1)+1)%3):r)+'"]').click();
 }
 let q=E.question(w.eval('S.sciencePath.draft'));
 click('spCheckAnswer');check(w.eval('S.sciencePath.attempts.length')===0,'Blank is not an error');
 query('[data-sp-reason="'+q.answer.split(':')[1]+'"]').click();click('spCheckAnswer');check(w.eval('S.sciencePath.attempts.length')===0,'Partial pair not recorded');
 respond(q);query('#spWorking').value='I subtract the zero offset from the observed mass. The reference distinguishes consistent bias from scatter.';query('#spWorking').dispatchEvent(new w.Event('input'));click('spCheckAnswer');
 check(w.eval('S.sciencePath.attempts.at(-1).correct')===true,'Correct pair');check(w.eval('S.sciencePath.attempts.at(-1).independent')===false,'Guided not independent');
 click('spNextPractice');q=E.question(w.eval('S.sciencePath.draft'));respond(q,true);click('spCheckAnswer');
 check(w.eval('S.sciencePath.attempts.at(-1).components.claim')===true,'Right conclusion');check(w.eval('S.sciencePath.attempts.at(-1).components.reason')===false,'Wrong reason remains wrong');
 check(d.getElementById('spFeedback').textContent.includes('reason'),'Reason-specific feedback');respond(q);click('spCheckAnswer');
 check(w.eval('S.sciencePath.attempts.at(-1).independent')===false,'Revision stays supported');
 click('spMorePractice');query('#spWorking').value='Saved explanation across subject changes.';query('#spWorking').dispatchEvent(new w.Event('input'));click('spStylus');
 const cv=query('#spCanvas');cv.getContext('2d');
 const saved=w.eval('S.sciencePath.draft.id');click('subjectMaths');check(w.MochiEntranceUI.visible(),'Math tab works');click('subjectScience');click('spContinue');
 check(w.eval('S.sciencePath.draft.id')===saved,'Same science draft');check(query('#spWorking').value==='Saved explanation across subject changes.','Working retained');
 q=E.question(w.eval('S.sciencePath.draft'));respond(q);click('spCheckAnswer');
 check(w.eval('S.sciencePath.attempts.at(-1).independent')===true,'Fresh first-pair independence');
 const backup=w.MochiReviewDownload.make();check(backup.sciencePath.attempts.length===3,'New history in backup');check(!!backup.sciencePathReview,'Separate science review');check(unchanged()===original,'Maths, old science, coins and wardrobe unchanged');
 click('spLabs');check(!d.getElementById('viewScience').hidden,'Original labs remain reachable');click('subjectScience');click('spFoundations');check(w.courseCurrent().subject==='science','Foundation science remains reachable');click('subjectScience');
 // True/false inputs are real controls and cannot submit an incomplete row.
 w.eval("MochiSciencePath.finishPractice(S.sciencePath)");w.MochiSciencePathUI.practice('earth','transfer');q=E.question(w.eval('S.sciencePath.draft'));
 // Transfer form earth is a single choice; reserve form has three statements, exercised in the paper below.
 respond(q);click('spCheckAnswer');check(w.eval('S.sciencePath.attempts.at(-1).correct'),'Enrichment reasoning selection works');
 click('spHome');click('spPapers');query('[data-start-paper="mixed-a"]').click();
 const qs=E.paperQuestions('mixed-a'),idx=qs.findIndex(q=>!!q.statements);check(idx>=0,'Paper includes statements');query('[data-paper-index="'+idx+'"]').click();q=qs[idx];
 check(!d.getElementById('spHint')&&!d.getElementById('spReveal')&&!d.getElementById('spFeedback'),'No immediate paper support');
 respond(q,true);click('spPaperNext');query('[data-paper-index="'+idx+'"]').click();respond(q);query('#spWorking').value='My saved paper explanation cites the given condition.';query('#spWorking').dispatchEvent(new w.Event('input'));
 check(E.scorePaper(w.eval('S.sciencePath'),'mixed-a')===null,'Scores withheld until submit');
 check(w.eval('S.sciencePath.papers["mixed-a"].deadline-S.sciencePath.papers["mixed-a"].startedAt')===3600000,'60 minute original practice format');
 click('spSubmitPaper');check(E.scorePaper(w.eval('S.sciencePath'),'mixed-a').correct===1,'Edited statement pair counted once');
 const frozen=w.eval('JSON.stringify(S.sciencePath.papers["mixed-a"].answers)');check(!E.savePaperAnswer(w.eval('S.sciencePath'),'mixed-a',idx,{answer:'c0:r0'}),'Frozen answers');check(w.eval('JSON.stringify(S.sciencePath.papers["mixed-a"].answers)')===frozen,'Submitted paper immutable');
 check(d.getElementById('viewSciencePath').textContent.includes('Written explanations are not automatically scored.'),'Score qualification is visible');
 // Show a substantial original investigation example for the screenshot and label checks.
 w.MochiSciencePathUI.open('lesson','fairtest');click('spLessonNext');query('#spExample').value='1';query('#spExample').dispatchEvent(new w.Event('change'));
 const table=query('#viewSciencePath .sp-data-table');check(table.querySelectorAll('tbody tr').length===4,'Four actual test setups');
 check(errors.length===0,'Page errors: '+errors.join('; '));
 return {result:'passed',lessons:24,dualReasonMarking:true,partialAnswerProtection:true,savedWork:true,legacyPreserved:true,scienceMathNavigation:true,paperFeedbackWithheld:true,frozenSubmission:true,pageErrors:errors};
}
if(typeof module!=='undefined')module.exports=runSciencePathChecks;
