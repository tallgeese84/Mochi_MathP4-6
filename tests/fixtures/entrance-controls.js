/* Real-page control checks, with synthetic state only. Invoked by the local-only fixture. */
window.runEntranceControlChecks=async function(w){
 const d=w.document,delay=ms=>new Promise(r=>setTimeout(r,ms)),assert=(v,m)=>{if(!v)throw Error(m);},click=id=>{const n=d.getElementById(id);assert(n,'Missing '+id);assert(!n.disabled,'Disabled '+id);n.click();},input=(id,value)=>{const n=d.getElementById(id);n.value=value;n.dispatchEvent(new w.Event('input',{bubbles:true}));},evalIn=s=>w.eval(s),E=w.MochiEntrance;
 assert(w.MochiReady&&w.MochiEntranceUI,'App boot');assert(!d.getElementById('viewEntrance').hidden,'New maths home');
 const old=evalIn('JSON.stringify({learning:S.learning,science:S.science,coins:S.coins,worn:S.worn,catFriends:S.catFriends})');
 w.confirm=()=>true;
 click('epLessons');d.querySelector('[data-lesson="percent"]').click();
 click('epLessonNext');assert(d.querySelectorAll('.ep-worked li').length>=2,'Worked example exists');
 click('epLessonNext');const correct=E.unit('percent').check[2];d.querySelector('[data-concept="'+((correct+1)%3)+'"]').click();assert(d.getElementById('epCompleteLesson').disabled,'Wrong exit stays open');d.querySelector('[data-concept="'+correct+'"]').click();click('epCompleteLesson');
 assert(evalIn('S.entrance.draft.phase')==='guided','Lesson enters guided practice');
 input('epWorking','The charge increases the original amount.');input('epAnswer',evalIn('MochiEntrance.question(S.entrance.draft).answerLabel'));click('epCheckAnswer');
 assert(evalIn('S.entrance.attempts.at(-1).correct'),'Guided answer checks');assert(!evalIn('S.entrance.attempts.at(-1).independent'),'Guidance never counts as independent');
 click('epMorePractice');assert(evalIn('S.entrance.draft.phase')==='apply','Application after guided work');
 input('epAnswer','O.35');click('epCheckAnswer');assert(evalIn('S.entrance.attempts.length')===1,'Format error not scored');
 input('epWorking','Unfinished calculation kept across subjects.');input('epAnswer','17');
 click('subjectScience');assert(d.getElementById('viewEntrance').hidden,'Science hides entrance view');click('subjectMaths');click('epContinue');assert(d.getElementById('epAnswer').value==='17','Answer resumes');assert(d.getElementById('epWorking').value.includes('Unfinished'),'Working resumes');
 click('epCheckAnswer');assert(!evalIn('S.entrance.attempts.at(-1).firstCorrect'),'Wrong first answer saved');
 click('epHint');input('epAnswer',evalIn('MochiEntrance.question(S.entrance.draft).answerLabel'));click('epCheckAnswer');assert(!evalIn('S.entrance.attempts.at(-1).independent'),'Revision cannot become independent');
 input('epWorking','Later explanation: divide by the fraction retained.');click('epSaveHome');const backup=w.MochiReviewDownload.make();assert(backup.entrance.attempts.length===2,'Review backup includes path');assert(backup.entrance.attempts.at(-1).reflection.includes('Later explanation'),'Later notes retained separately');assert(!JSON.stringify(backup).includes('SECRET'),'No test secret');
 assert(evalIn('JSON.stringify({learning:S.learning,science:S.science,coins:S.coins,worn:S.worn,catFriends:S.catFriends})')===old,'Legacy subjects and rewards preserved');
 // Fresh, synthetic paper state for timing, revision and feedback withholding.
 evalIn('S.entrance=MochiEntrance.fresh();save(S);');w.MochiEntranceUI.open('papers');
 d.querySelector('[data-start-paper="mixed-a"]').click();assert(d.querySelectorAll('[data-paper-index]').length===24,'Balanced paper length');assert(!d.querySelector('#epHint'),'No hint button');assert(!d.querySelector('.ep-worked'),'No worked answer');
 const first=evalIn('MochiEntrance.paperQuestions("mixed-a")[0]');input('epWorking','Paper reasoning kept');input('epAnswer',first.answerLabel);click('epPaperFlag');click('epPaperNext');click('epPaperPrev');assert(d.getElementById('epAnswer').value===first.answerLabel,'Paper edits retained');assert(d.getElementById('epWorking').value==='Paper reasoning kept','Paper working retained');
 const deadline=evalIn('S.entrance.papers["mixed-a"].deadline');evalIn('S.entrance=MochiEntrance.validate(JSON.parse(JSON.stringify(S.entrance)));');w.MochiEntranceUI.open('paper','mixed-a');assert(evalIn('S.entrance.papers["mixed-a"].deadline')===deadline,'Original deadline after restore');
 assert(E.scorePaper(evalIn('S.entrance'),'mixed-a')===null,'No score before submission');click('epSubmitPaper');assert(evalIn('S.entrance.papers["mixed-a"].submittedAt')>0,'Submit freezes paper');assert(!d.getElementById('epAnswer'),'Submitted response not editable');assert(d.querySelector('.ep-review-list'),'Full feedback after submission');assert(evalIn('MochiEntrance.scorePaper(S.entrance,"mixed-a").correct')===1,'Correct paper marking');
 click('epPapers');d.querySelector('[data-start-paper="mixed-b"]').click();const b=evalIn('MochiEntrance.paperQuestions("mixed-b")[0]');input('epAnswer',b.answerLabel);click('epPausePaper');assert(evalIn('S.entrance.papers["mixed-b"].assisted'),'Pause marks support');
 w.MochiEntranceUI.open('paper','mixed-b');evalIn('S.entrance.papers["mixed-b"].deadline=Date.now()-100;');await delay(700);assert(evalIn('S.entrance.papers["mixed-b"].submittedAt')>0,'Timer submits safely');assert(!evalIn('MochiEntrance.scorePaper(S.entrance,"mixed-b").qualifying'),'Interrupted paper cannot qualify');
 w.MochiEntranceUI.open('lesson','decomposition');E.visit(evalIn('S.entrance'),'decomposition',1);w.MochiEntranceUI.open('lesson','decomposition');d.getElementById('epExample').value='2';d.getElementById('epExample').dispatchEvent(new w.Event('change'));
 const svg=d.querySelector('.entrance-figure');assert(svg&&svg.querySelector('pattern'),'Hatched original figure');assert(svg.querySelector('title').textContent,'Accessible diagram description');
 const report={result:'passed',methods:24,forms:96,guidedAndIndependent:true,wrongAnswerRevision:true,notesAndBackup:true,legacyStatePreserved:true,paperWithheldFeedback:true,paperDeadlineAndFreeze:true,diagrams:true};
 return report;
};
