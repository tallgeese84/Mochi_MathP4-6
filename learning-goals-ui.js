/* Finish a learning task, explain it, and keep cash rewards separate from mastery. */
(function(root){
'use strict';
const L=root.MochiLearningGoals,$=id=>document.getElementById(id),names={maths:'Maths',science:'Science',recall:'Return & remember'};
let card,focus,dialog,parentDialog,agreement=null,last='',parentLast='',saving=false,previousFocus=null,editingGoal='';
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const key=s=>s==='maths'?'entrance':'sciencePath',engine=s=>s==='maths'?root.MochiEntrance:root.MochiSciencePath,ui=s=>s==='maths'?root.MochiEntranceUI:root.MochiSciencePathUI;
const state=()=>S,goals=()=>L.status(state()).goals,goal=category=>goals().find(g=>g.category===category),active=subject=>{const g=goal(subject);return g&&!g.finish?g:null;};
const money=n=>'US$'+((Number(n)||0)/100).toFixed(2),attempt=(g,id=g?.draftId)=>state()[key(g.subject)]?.attempts?.find(a=>a.id===id);
const persist=()=>{save(state());last='';parentLast='';paint();};
function show(d){previousFocus=document.activeElement;if(d.open)return;try{d.showModal();}catch(_){d.setAttribute('open','');d.classList.add('lg-dialog-fallback');}d.querySelector('h2')?.focus({preventScroll:true});}
function close(d){if(d===dialog){capture();editingGoal='';}try{d.close();}catch(_){d.removeAttribute('open');}d.classList.remove('lg-dialog-fallback');previousFocus?.focus?.({preventScroll:true});}
function formDialog(title,body){
 capture();editingGoal='';
 if(!dialog){dialog=document.createElement('dialog');dialog.id='learningGoalDialog';dialog.className='lg-dialog';dialog.setAttribute('aria-labelledby','lgDialogTitle');document.body.append(dialog);}
 dialog.innerHTML=`<form class="lg-dialog-body" novalidate><div class="lg-heading"><h2 id="lgDialogTitle" tabindex="-1">${esc(title)}</h2><button type="button" id="lgClose" class="lg-close" aria-label="Close">×</button></div>${body}<p id="lgError" class="lg-error" role="alert"></p></form>`;
 $('lgClose').onclick=()=>{agreement=null;close(dialog);};dialog.oncancel=()=>{capture();editingGoal='';agreement=null;};return dialog.querySelector('form');
}
function beforeTask(t,run){
 if(!L||!t||['paper','reflect','finish'].includes(t.kind)||goal(t.subject)||agreement?.subject===t.subject)return false;
 const status=L.status(state()),unit=t.kind==='lesson'?'':t.unit||'',subject=t.subject;
 root.MochiPlanUI?.pause('Choose a learning goal before starting.');
 const outcome=subject==='maths'?'Finish one problem, show or explain the key step, and check it.':'Finish one question, explain which evidence supports the answer, and check the feedback.';
 const form=formDialog('Your '+names[subject]+' goal',`<p class="lg-kicker">${esc(t.title||names[subject])}</p><p>${t.kind==='lesson'?'Study the lesson, then finish the first practice problem in today’s route. ':''}${outcome} Help is welcome.</p><p class="lg-small">If this is too hard, finish a suitable prerequisite and save a next step for the original. You can also stop and save a next step without earning points.</p><div class="lg-terms"><strong>${status.trial.ended?'Learning goals continue':'+2 points after a grown-up checks'}</strong><p>${status.trial.ended?'The four-week cash trial has ended. Your earned points stay safe.':'Maths 2 + Science 2 + return-and-remember 1 = up to 5 points a day. Each point is US$0.20; a grown-up settles weekly.'}</p>${!status.trial.started?'<p>Your four-week trial starts when you start this goal.</p>':''}<p>Regular recall can earn the extra point: try with hints closed first, then check or correct. No extra questions are required.</p></div><div class="lg-actions"><button id="lgAgree" class="lg-primary" type="submit">Agree & start</button><button id="lgNotNow" type="button">Not now</button></div>`);
 $('lgNotNow').onclick=()=>{agreement=null;close(dialog);};
 form.onsubmit=e=>{e.preventDefault();const d=state()[key(subject)]?.draft;const result=L.beginGoal(state(),{category:subject,subject,unit,title:t.title||names[subject]+' learning goal',taskKind:t.kind,draftId:d&&(!unit||d.unit===unit)&&!state()[key(subject)].attempts.some(a=>a.id===d.id&&a.correct)?d.id:''});if(!result.ok){$('lgError').textContent=result.reason||'Choose a task before starting.';return;}agreement={subject};persist();close(dialog);run();agreement=null;};
 show(dialog);return true;
}
function bind(subject){
 if(!L||saving||!['maths','science'].includes(subject))return;
 const d=state()[key(subject)]?.draft,g=goal(subject);if(!d)return;
 let changed=false;
 if(g&&!g.finish&&!g.draftId&&(!g.unit||g.unit===d.unit)){const r=L.bindGoal(state(),g.id,d.id);changed=!!r.ok&&!r.already;}
 // Recall is part of the existing route, never an extra daily assignment.
 if(g&&!goal('recall')&&(d.phase==='recall'||d.recallOf)&&!state()[key(subject)].attempts.some(a=>a.id===d.id)){
  const r=L.beginGoal(state(),{category:'recall',subject,unit:d.unit,taskKind:'recall',title:'Remember '+(engine(subject).unit(d.unit)?.title||'this idea'),draftId:d.id});if(r.ok&&!r.already)changed=true;
 }
 if(g?.prerequisite&&!g.prerequisite.draftId&&g.prerequisite.unit===d.unit){const r=L.bindPrerequisite(state(),g.id,d.id,{});if(r.ok&&!r.already)changed=true;}
 if(L.observe(state()))changed=true;
 if(changed){saving=true;save(state());saving=false;last='';}
 paint();
}
function observe(subject){if(subject)bind(subject);if(L?.observe(state()))persist();paint();}
function boundary(subject){
 const g=active(subject);if(!g)return false;
 const b=root.MochiToday.model(state()).blocks.find(x=>x.subject===subject);
 if(b.timeDone||b.remaining<=2*60000){finish(subject);return true;}return false;
}
function resume(subject){
 const g=goal(subject),d=state()[key(subject)],E=engine(subject);if(!g)return;
 close(dialog);
 if(!d.draft&&g.draftId)E.resumeDeferred(d,g.draftId);
 if(d.draft){ui(subject).open('practice',d.draft.unit);root.MochiLearningGoalsUI.bind(subject);}
 else if(g.unit)ui(subject).open('lesson',g.unit);
}
function finish(category){
 const g=goal(category);if(!g)return;const subject=g.subject;
 ui(subject)?.capture(true);root.MochiPlanUI?.pause('Finish, explain and check. Your work is saved.');bind(subject);
 const d=state()[key(subject)],a=attempt(g),candidates=(d?.attempts||[]).filter(a=>a.mode==='practice'&&a.id===g.prerequisite?.draftId&&a.at>=g.startedAt&&(a.correct||a.components?.kind==='written')),pref=a&&(a.correct||a.components?.kind==='written')?'finished':candidates.length?'prerequisite':'parked',old=g.finishDraft||g.finish||{},pendingCurrent=d?.draft&&d.draft.id!==g.draftId&&!d.attempts.find(x=>x.id===d.draft.id)?.correct?d.draft:null;
 const form=formDialog('Finish & check · '+names[category],`<p class="lg-kicker">${esc(g.title)}</p>${pendingCurrent?`<p class="lg-warning">Another question is still open: ${esc(engine(subject).unit(pendingCurrent.unit)?.title||pendingCurrent.unit)}. Finishing this goal will keep that question saved. Write its next step before you stop, or continue it now.</p>`:''}<label>Where did you get to?<select id="lgFinishKind"><option value="finished">I finished the agreed problem</option><option value="prerequisite">I finished a prerequisite instead</option><option value="parked">Save my next step and stop for now</option></select></label><label id="lgPrerequisiteLabel">Completed prerequisite<select id="lgPrerequisite">${candidates.length?candidates.map(x=>`<option value="${esc(x.id)}">${esc(engine(subject).unit(x.unit)?.title||x.unit)} · ${esc(x.question?.slice(0,90)||'completed question')}</option>`).join(''):'<option value="">No completed prerequisite recorded yet</option>'}</select></label><label id="lgExplanationLabel">${subject==='maths'?'What was the key step, and why did it work?':'Which evidence supports your answer, and why?'}<textarea id="lgExplanation" rows="3" maxlength="1500" placeholder="Explain in your own words">${esc(old.explanation||'')}</textarea></label><label id="lgCheckLabel">How did you check or correct it?<textarea id="lgCheck" rows="2" maxlength="1000" placeholder="What did you compare, substitute, test or fix?">${esc(old.check||'')}</textarea></label><label class="lg-checkbox" id="lgOralLabel"><input type="checkbox" id="lgOral" ${old.oral?'checked':''}> I will explain and show my check aloud to a grown-up.</label><label id="lgNextStepLabel">${pendingCurrent?'Next step for the question still open':'My specific next step'}<textarea id="lgNextStep" rows="2" maxlength="1000" placeholder="For example: draw equal time intervals, then compare the distances.">${esc(old.nextStep||'')}</textarea></label><p id="lgFinishHelp" class="lg-small"></p><div class="lg-actions"><button type="submit" class="lg-primary" id="lgSaveFinish">Save my finish</button><button type="button" id="lgContinue">Continue the problem</button>${subject==='maths'&&root.MochiPlanner.mathsExtension(state().planner).available?'<button type="button" id="lgExtendCurrent">Optional · 5 minutes to finish this problem</button>':''}</div><details class="lg-prerequisite"><summary>Need a smaller step?</summary><p>Your original question and working stay saved. Choose a prerequisite with a grown-up if you are unsure.</p><label>Prerequisite topic<select id="lgChoosePrerequisite">${engine(subject).D.units.filter(u=>u.id!==g.unit).map(u=>`<option value="${esc(u.id)}">${esc(u.title)}</option>`).join('')}</select></label><button type="button" id="lgTryPrerequisite">Save original & learn this idea</button><p class="lg-small">Stay within this study block. If time is up, save a next step and return another day.</p></details>`);
 editingGoal=g.id;
 $('lgFinishKind').value=old.kind||pref;
 for(const input of form.querySelectorAll('textarea,input,select'))input.addEventListener('input',()=>capture());
 const update=()=>{const k=$('lgFinishKind').value,parked=k==='parked';$('lgPrerequisiteLabel').hidden=k!=='prerequisite';$('lgNextStepLabel').hidden=k==='finished'&&!pendingCurrent;for(const id of ['lgExplanationLabel','lgCheckLabel','lgOralLabel'])$(id).hidden=parked;$('lgFinishHelp').textContent=parked?'Saving a next step closes today’s block without awarding points. There is no catch-up debt.':'Your explanation and check go to a grown-up. Using help is allowed; points do not mean independent mastery.';$('lgSaveFinish').textContent=parked?'Save next step & stop':'Send finish for review';};$('lgFinishKind').onchange=()=>{update();capture();};update();
 $('lgContinue').onclick=()=>resume(subject);
 if($('lgExtendCurrent'))$('lgExtendCurrent').onclick=()=>{resume(subject);root.MochiTodayUI?.extendCurrent();};
 $('lgTryPrerequisite').onclick=()=>{
  const b=root.MochiToday.model(state()).blocks.find(x=>x.subject===subject);if(b.timeDone||b.remaining<=2*60000){$('lgError').textContent='Use the remaining time to save your next step. Start the prerequisite in your next study block.';return;}
  const E=engine(subject),chosen=$('lgChoosePrerequisite').value;if(!chosen)return;
  const selected=L.choosePrerequisite(state(),g.id,{unit:chosen,title:E.unit(chosen)?.title,nextStep:$('lgNextStep').value});if(!selected.ok){$('lgError').textContent=selected.reason||'Write a specific next step for the original problem first.';return;}
  ui(subject)?.capture(true);if(d.draft&&!d.attempts.find(a=>a.id===d.draft.id)?.correct&&!E.deferDraft(d)){$('lgError').textContent='Your current question could not be safely set aside. Save and exit first.';return;}if(d.draft)E.finishPractice(d);persist();close(dialog);ui(subject).open('lesson',chosen);root.MochiPlanUI?.start(subject);
 };
 form.onsubmit=e=>{e.preventDefault();const k=$('lgFinishKind').value,fields={kind:k,attemptId:g.draftId,prerequisiteId:$('lgPrerequisite').value,explanation:$('lgExplanation').value,check:$('lgCheck').value,nextStep:$('lgNextStep').value,oral:$('lgOral').checked};
  if(pendingCurrent&&fields.nextStep.trim().length<8){$('lgError').textContent='Write a specific next step for the question still open before you stop.';$('lgNextStep').focus();return;}
  const r=L.recordFinish(state(),g.id,fields);if(!r.ok){$('lgError').textContent=r.reason||'Check your finish and try again.';return;}
  if(pendingCurrent&&d.draft?.id===pendingCurrent.id){const note='Next step: '+fields.nextStep.trim(),working=d.draft.working||'';if(!working.endsWith(note)){const value=(working?working+'\n':'')+note;engine(subject).touchDraft(d,{working:value});const box=$(subject==='maths'?'epWorking':'spWorking');if(ui(subject)?.visible()&&box)box.value=value;}}
  const recall=goal('recall');if(k==='finished'&&recall?.subject===subject&&recall.draftId===g.draftId&&!recall.finish)L.recordFinish(state(),recall.id,fields);
  // Only a deliberately finished, already checked answer can leave the editor. Unfinished work stays intact.
  if(d.draft&&d.attempts.find(x=>x.id===d.draft.id)?.correct)engine(subject).finishPractice(d);
  root.MochiNightlyPlan?.boundary(state(),subject);persist();close(dialog);root.MochiTodayUI?.open();
 };
 show(dialog);
}
function capture(persistNow=true){
 if(!editingGoal||!dialog?.open||!$('lgFinishKind')||saving)return false;
 const fields={kind:$('lgFinishKind').value,explanation:$('lgExplanation').value,check:$('lgCheck').value,nextStep:$('lgNextStep').value,oral:$('lgOral').checked};
 const old=state().learningGoals?.goals?.[editingGoal]?.finishDraft;
 if(old&&Object.keys(fields).every(k=>old[k]===fields[k]))return false;
 const r=L.saveFinishDraft(state(),editingGoal,fields);if(!r.ok)return false;
 if(persistNow){saving=true;save(state());saving=false;}return true;
}
function parentReviewBody(){
 const status=L.summary(state()),pending=L.status(state()).pending||[],weekRows=L.weeks(state());
 return `<div class="lg-heading"><h2 id="lgParentTitle" tabindex="-1">Learning points & weekly cash</h2><button type="button" id="lgParentClose" class="lg-close" aria-label="Close">×</button></div><p>2 Maths + 2 Science + 1 return-and-remember. Maximum 5 points (${money(100)}) a day; each point is ${money(20)}. Help is allowed. These points never change mastery, coins or Cat Points.</p><p class="lg-small">${status.trial?.started?'Four-week trial: '+esc(status.trial.startDay)+' through '+esc(status.trial.endDay)+'. Dates use America/Chicago.':'The four-week trial starts with the first agreed learning goal.'} ${status.trial?.ended?'New goals continue without new cash points. Earned points remain payable.':''}</p>${status.trialConflict?'<p class="lg-small">Devices started the trial on different dates. The earliest date now applies; earlier approved points and payments are kept.</p>':''}<section aria-label="Finishes to review"><h3>Ready for your review</h3>${pending.length?pending.map(g=>{const f=g.finish||{},a=attempt(g,f.evidence?.id||g.draftId);return `<article class="lg-review"><h4>${esc(names[g.category])} · ${esc(g.day)}</h4><p><strong>${esc(g.title)}</strong></p>${a?`<details><summary>Recorded problem and answer</summary><p>${esc(a.question||'')}</p><p>Answer: ${esc(a.responses?.at(-1)?.answer||'')}</p><p>Working: ${esc(a.responses?.at(-1)?.working||'(no typed working; ask to see paper or explain aloud)')}</p><p>${a.helped||a.revealed||a.scaffold?'Support was recorded.':'No support was recorded.'} ${a.correct?'Recorded answer correct.':'Requires your answer review.'}</p></details>`:''}<p><strong>Explanation:</strong> ${esc(f.explanation||'(oral explanation requested)')}</p><p><strong>Check:</strong> ${esc(f.check||'(oral check requested)')}</p>${f.nextStep?`<p><strong>Next step:</strong> ${esc(f.nextStep)}</p>`:''}<label class="lg-checkbox"><input type="checkbox" data-lg-explain="${esc(g.id)}"> I heard or read her own explanation, including the key step or evidence.</label><label class="lg-checkbox"><input type="checkbox" data-lg-check="${esc(g.id)}"> I checked the correction or verification${f.kind==='prerequisite'?' and this prerequisite is appropriate':''}.</label>${a?.components?.kind==='written'?`<label class="lg-checkbox"><input type="checkbox" data-lg-written="${esc(g.id)}"> I reviewed the written answer itself and it is valid.</label>`:''}<button type="button" data-lg-approve="${esc(g.id)}">${g.day>=status.trial.startDay&&g.day<=status.trial.endDay?'Confirm '+(g.category==='recall'?1:2)+' point'+(g.category==='recall'?'':'s'):'Confirm learning finish'}</button><p data-lg-result="${esc(g.id)}" class="lg-error" role="status"></p></article>`;}).join(''):'<p>No finishes are waiting. Starting a timer or submitting an answer does not automatically earn cash points.</p>'}</section><section aria-label="Weekly settlement"><h3>Weekly settlement</h3><p class="lg-small">Record cash only after you have actually paid it. This button does not transfer money.</p>${weekRows.length?weekRows.map(w=>`<article class="lg-week"><div><strong>Week of ${esc(w.week)}</strong><span>${w.points} points · ${money(w.cents)} earned</span><small>${money(w.paidCents)} recorded paid · ${money(w.dueCents)} remaining</small></div>${w.dueCents>0?`<button type="button" data-lg-pay="${esc(w.week)}">Record ${money(w.dueCents)} paid</button>`:'<span>Paid</span>'}</article>`).join(''):'<p>No points have been approved yet.</p>'}</section><p id="lgParentStatus" role="status"></p>`;
}
async function review(){
 root.MochiPlanUI?.pause('Paused for a grown-up review.');
 if(!root.grownupGate||!await root.grownupGate.ask())return;
 if(!parentDialog){parentDialog=document.createElement('dialog');parentDialog.id='learningPointsParent';parentDialog.className='lg-dialog lg-parent';parentDialog.setAttribute('aria-labelledby','lgParentTitle');document.body.append(parentDialog);}
 paintParent(true);show(parentDialog);
}
function paintParent(force=false){
 if(!parentDialog||!force&&!parentDialog.open)return;
 const signature=JSON.stringify(state().learningGoals);if(!force&&signature===parentLast)return;parentLast=signature;parentDialog.innerHTML=`<div class="lg-dialog-body">${parentReviewBody()}</div>`;
 $('lgParentClose').onclick=()=>close(parentDialog);
 for(const b of parentDialog.querySelectorAll('[data-lg-approve]'))b.onclick=async()=>{
  if(!await root.grownupGate.ask())return;const id=b.dataset.lgApprove,find=type=>[...parentDialog.querySelectorAll(`[data-lg-${type}]`)].find(e=>e.dataset['lg'+type[0].toUpperCase()+type.slice(1)]===id),r=L.approveGoal(state(),id,{explanationReviewed:!!find('explain')?.checked,checkReviewed:!!find('check')?.checked,writtenAnswerReviewed:!!find('written')?.checked});
  if(!r.ok){[...parentDialog.querySelectorAll('[data-lg-result]')].find(x=>x.dataset.lgResult===id).textContent=r.reason||'Review both the explanation and check first.';return;}persist();paintParent(true);$('lgParentStatus').textContent=r.points?`${r.points} point${r.points===1?'':'s'} approved.`:r.reason||'Learning finish confirmed.';
 };
 for(const b of parentDialog.querySelectorAll('[data-lg-pay]'))b.onclick=async()=>{
  if(!await root.grownupGate.ask())return;const w=L.weeks(state()).find(x=>x.week===b.dataset.lgPay);if(!w?.dueCents)return;
  if(!root.confirm(`Have you already paid ${money(w.dueCents)} for the week of ${w.week}? This only records that payment.`))return;
  const r=L.settle(state(),w.week);if(!r.ok){$('lgParentStatus').textContent=r.reason||'Payment could not be recorded.';return;}persist();paintParent(true);$('lgParentStatus').textContent=`Recorded ${money(r.cents)} as paid.`;
 };
}
function paint(){
 if(!card||!L)return;const s=L.status(state()),signature=JSON.stringify([s,state().learningGoals?.awards]);
 if(signature!==last){last=signature;card.innerHTML=`<div class="lg-card-heading"><div><p class="lg-kicker">Learning points</p><strong>${s.points}/5 today <span>· ${money(s.cents)}</span></strong></div><button type="button" id="lgReview">Grown-up review</button></div><p>${s.trial.ended?'Four-week trial complete. Keep finishing and explaining; earned points stay safe.':'Finish, explain, check. Help is welcome.'}</p><div class="lg-goal-list">${['maths','science','recall'].map(c=>{const g=s.goals.find(g=>g.category===c),award=state().learningGoals?.awards?.[g?.id],label=award?'Approved':g?.review?'Finish confirmed':g?.finish?.kind==='parked'?'Saved · no points':g?.finish?'Ready for review':g?'In progress':c==='recall'?'When recall is due':'Choose before starting';return `<div><span>${esc(names[c])}</span><small>${esc(label)} · ${c==='recall'?1:2} pt${c==='recall'?'':'s'}</small>${g&&!award&&!g.review?`<button type="button" data-lg-finish="${c}">${g.finish?.kind==='parked'?'Review saved step':g.finish?'Review finish':'Finish & check'}</button>`:''}</div>`;}).join('')}</div><p class="lg-small">${!s.trial.started?'Four-week cash trial starts with the first agreed goal.':s.trial.ended?'Points are kept separately from mastery and Mochi rewards.':`${s.trial.remainingDays} trial day${s.trial.remainingDays===1?'':'s'} remaining · US$0.20 per approved point · paid weekly.`} No streak or missed-day debt.</p>`;
 $('lgReview').onclick=review;for(const b of card.querySelectorAll('[data-lg-finish]'))b.onclick=()=>finish(b.dataset.lgFinish);
 }
 const subject=root.MochiEntranceUI?.visible()?'maths':root.MochiSciencePathUI?.visible()?'science':null,v=subject&&ui(subject).view(),g=subject&&goal(subject),r=goal('recall');focus.hidden=!g||!['lesson','practice'].includes(v?.kind);
 if(!focus.hidden){const b=root.MochiToday.model(state()).blocks.find(x=>x.subject===subject);focus.querySelector('strong').textContent=g.finish?'Learning goal saved':names[subject]+' goal · finish one problem, explain & check';focus.querySelector('p').textContent=r?.subject===subject&&!r.finish?'Return & remember: first try with hints closed, then check or correct.':b.timeDone?'Time is up for new work. Finish this problem or save a next step; your answer stays here.':b.remaining<=2*60000?'Use the last two minutes to explain and check, or save your next step.':'Help is allowed. Show the key step or evidence and why it works.';focus.querySelector('button').onclick=()=>finish(r?.subject===subject&&!r.finish&&g.finish?'recall':subject);}
 paintParent();
}
function init(){
 if(!L||$('learningGoalCard'))return;
 card=document.createElement('section');card.id='learningGoalCard';card.className='lg-card';card.setAttribute('aria-label','Learning goals and points');const main=$('todayHome')?.querySelector('.today-main');if(!main)return;main.querySelector('#todayNote')?.before(card);
 focus=document.createElement('section');focus.id='learningGoalFocus';focus.className='lg-focus';focus.hidden=true;focus.setAttribute('aria-label','Current learning goal');focus.innerHTML='<div><strong></strong><p></p></div><button type="button">Finish & check</button>';$('todayFocusBar')?.after(focus);
 const menu=$('todayMenu')?.querySelector('.today-adult');if(menu){const button=document.createElement('button');button.type='button';button.id='todayPointsParent';button.textContent='Learning points & weekly cash';button.onclick=()=>{const d=$('todayMenu');try{d.close();}catch(_){d.removeAttribute('open');}review();};menu.append(button);}
 document.addEventListener('mochi:activity',()=>{for(const subject of ['maths','science'])if(ui(subject)?.visible()&&ui(subject).view().kind==='practice')bind(subject);paint();});
 document.addEventListener('mochi:state-saved',()=>{if(!saving){if(L.observe(state())){saving=true;save(state());saving=false;}paint();}});
 document.addEventListener('mochi:cloud-merged',()=>{last='';parentLast='';paint();});document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')capture();});root.addEventListener('pagehide',()=>capture());paint();
}
root.MochiLearningGoalsUI={capture,beforeTask,bind,observe,boundary,finish,active,review,paint,refresh:()=>{last='';parentLast='';paint();}};
if(root.MochiReady)init();else document.addEventListener('mochi:ready',init,{once:true});
})(window);
