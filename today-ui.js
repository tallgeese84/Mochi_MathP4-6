/* One next action for Euna. Libraries and parent controls remain secondary.
   This is a navigation layer, not another learning or reward engine. */
(function(root){
'use strict';
const T=root.MochiToday,Q=root.MochiQuestRewards,F=root.MochiCatFriends,P=root.MochiPlanner,$=id=>document.getElementById(id),names=T.names;
let home,bar,menu,guided=false,transition=false,lastHome='',queued=null,lastFocus=null,rewarding=false,rewardNote='';
const engines=()=>({maths:root.MochiEntrance,science:root.MochiSciencePath});
const U=subject=>subject==='maths'?root.MochiEntranceUI:root.MochiSciencePathUI;
const stateKey=subject=>subject==='maths'?'entrance':'sciencePath';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const current=()=>root.MochiEntranceUI?.visible()?{subject:'maths',...root.MochiEntranceUI.view()}:root.MochiSciencePathUI?.visible()?{subject:'science',...root.MochiSciencePathUI.view()}:null;
function permitNavigation(){
 const v=current();if(v?.kind!=='paper')return true;
 const p=S[stateKey(v.subject)]?.papers[v.paper];if(!p||p.submittedAt||p.interrupted&&p.assisted)return true;
 return root.confirm('Leave this paper? Your answers stay saved and its original deadline continues, but leaving for other activities records an interrupted, supported attempt.');
}
function closeMenu(){if(!menu?.open)return;if(typeof menu.close==='function')menu.close();else menu.removeAttribute('open');$('todayMore')?.setAttribute('aria-expanded','false');lastFocus?.focus?.({preventScroll:true});}
function openMenu(){
 // A paper must be explicitly left before any library or results can be opened.
 if(!permitNavigation())return;
 if(current()?.kind==='paper'){U(current().subject).leave();open();}
 root.MochiPlanUI?.pause('Paused while the menu is open.');
 lastFocus=document.activeElement;
 if(typeof menu.showModal==='function')menu.showModal();else menu.setAttribute('open','');
 $('todayMore').setAttribute('aria-expanded','true');$('todayMenuClose').focus();
}
function leave(){if(home)home.hidden=true;document.body.classList.remove('today-home');unmountGreeting();}
function open(){
 if(!home||transition||!permitNavigation())return;
 root.MochiP6UI?.leave();
 transition=true;closeMenu();root.MochiPlanUI?.pause('Your work is saved. Continue when you are ready.');
 U('maths')?.leave();U('science')?.leave();
 if(typeof courseLeave==='function')courseLeave();if(typeof scDraft==='function')scDraft();if(typeof scAbort==='function')scAbort();if(typeof focusClose==='function')focusClose(false);
 for(const id of ['viewMaths','viewRoom'])$(id).style.display='none';
 for(const id of ['viewScience','viewMap','viewCourse'])$(id).hidden=true;
 $('focusDock').hidden=true;$('courseReturn').hidden=true;
 document.body.classList.remove('science-active','course-active','entrance-active','science-path-active','entrance-paper','science-path-paper','today-guided');
 document.body.classList.add('today-home');guided=false;home.hidden=false;bar.hidden=true;lastHome='';paint();
 const skip=document.querySelector('.skip-link');if(skip){skip.href='#todayTitle';skip.textContent='Skip to today’s plan';}
 transition=false;document.dispatchEvent(new Event('mochi:activity'));$('todayTitle').focus({preventScroll:true});
 root.scrollTo?.({top:0,behavior:'instant'});
}
function launch(){
 const m=T.model(S),t=m.next;if(!t){leave();studioShow('room');return;}
 closeMenu();leave();guided=true;document.body.classList.add('today-guided');
 const ui=U(t.subject),E=engines()[t.subject],d=S[stateKey(t.subject)];
 if(t.kind==='paper')ui.open('paper',t.paper);
 else if(t.kind==='question')ui.open('practice',t.unit);
 else if(t.kind==='lesson')ui.open('lesson',t.unit);
 else if(t.kind==='mixed')ui.mixed();
 else if(t.kind==='redo')ui.redo(t.attempt);
 else {
  if(d?.draft&&d.attempts.find(a=>a.id===d.draft.id)?.correct)E.finishPractice(d);
  ui.practice(t.unit,t.kind==='recall'?'recall':undefined);
 }
 if(t.kind!=='paper')root.MochiPlanUI?.start(t.subject);
 paint();root.scrollTo?.({top:0,behavior:'instant'});
}
function launchBonus(subject=''){
 if(!Q)return;const task=Q.bonusTask(S,Date.now(),subject);if(!task)return;const status=Q.status(S);
 closeMenu();leave();guided=false;document.body.classList.remove('today-guided');document.body.classList.add('today-bonus-guided');
 const ui=U(task.subject),d=S[stateKey(task.subject)];
 if(!status.active){if(!Q.start(S,task.subject))return;save(S);}
 if(d?.draft&&d.draft.unit===task.unit&&!d.attempts.find(a=>a.id===d.draft.id)?.correct)ui.open('practice',task.unit);else ui.practice(task.unit,task.phase||'apply');
 root.MochiPlanUI?.startBonus?.(task.subject);paint();root.scrollTo?.({top:0,behavior:'instant'});
}
function rewardToast(text){
 let toast=$('todayRewardToast');if(!toast){toast=document.createElement('div');toast.id='todayRewardToast';toast.setAttribute('role','status');toast.setAttribute('aria-live','polite');document.body.append(toast);}
 toast.textContent=text;toast.hidden=false;clearTimeout(toast._timer);toast._timer=setTimeout(()=>toast.hidden=true,3200);
}
function collectBonus(){
 if(!Q||rewarding)return;const result=Q.settle(S);if(!result.settled)return;
 rewarding=true;
 if(result.coins){
  const why=result.phase==='recall'?'remembered later':result.phase==='transfer'?'changed problem solved':'fresh independent answer';
  rewardNote=result.chest?`+${result.coins} coins · Mochi purrs — bonus chest complete!`:`+${result.coins} coin${result.coins===1?'':'s'} · ${why}!`;
  if(typeof root.addCoins==='function')root.addCoins(result.coins);else{S.coins=(Number(S.coins)||0)+result.coins;save(S);}
  rewardToast(rewardNote);
 }else{
  rewardNote='Bonus coins need a fresh first-try answer without help. Try another when you want.';
  save(S);rewardToast(rewardNote);
 }
 lastHome='';setTimeout(()=>{rewarding=false;paint();},0);
}
function atBoundary(subject){
 if(!guided)return false;
 const b=T.model(S).blocks.find(b=>b.subject===subject);
 if(!b?.done)return false;
 open();return true;
}
function go(subject,kind){
 closeMenu();leave();guided=false;document.body.classList.remove('today-guided');
 if(subject==='room'){root.MochiPlanUI?.pause();studioShow('room');}
 else if(subject==='labs'){U('maths')?.leave();U('science')?.leave();scShow('science');}
 else U(subject).open(kind);
 paint();
}
function paintCompanion(m,cat){
 const t=m.next,says=$('todayMochiSays');
 const careWish=(m.finished||m.restDay)&&!t&&root.MochiHome&&S?.home?root.MochiHome.wish(root.MochiHome.advance(root.MochiHome.validate(S.home))):null;
 if(says)says.textContent=careWish?({tummy:'I’m a little peckish. Snack time?',energy:'Yawn… nap together?',clean:'Brush my fur?',fun:'Play with me?',love:'Cuddle time?'})[careWish.need]:m.restDay&&!t?'Rest day. I’m napping too.':m.finished&&!t?'You did it! Come and play?':m.completed>0?'Nice work. One more quest?':t?.resume?'Let’s pick up where we left off.':'Ready when you are.';
 if($('todayCoins'))$('todayCoins').textContent=String(Math.max(0,Math.floor(Number(S?.coins)||0)));
 if($('todayCatPoints'))$('todayCatPoints').textContent=String(cat?.points||0);
 const box=$('todayNextCat');if(!box)return;
 const next=cat?.nextCat,portrait=root.MochiCatFriendsUI?.portrait||root.MochiCatPortraits?.svg,key=next?next.id+':'+next.remaining:cat?'all':'';
 if(box.dataset.key===key)return;box.dataset.key=key;
 if(!next){box.innerHTML=cat?'<p class="today-next-done">Every cat friend has joined Mochi!</p>':'';return;}
 const have=Math.max(0,next.points-next.remaining),pct=next.points?Math.round(100*Math.min(1,have/next.points)):0;
 let art='';try{art=portrait?portrait(next):'';}catch(e){art='';}
 box.innerHTML=`<div class="today-next-art" aria-hidden="true">${art}</div><div class="today-next-info"><small>Next friend</small><strong>${esc(next.name)}</strong><span>${next.remaining===0?'Ready to join!':`${next.remaining} more Cat Point${next.remaining===1?'':'s'}`}</span><progress max="100" value="${pct}" aria-label="Progress to ${esc(next.name)}"></progress></div>`;
}
/* "Did you know?" each day, a camp-style investigation at weekends, and a nudge when a mock paper is ready.
   Answers are kept with the maths record so they sync; nothing here affects coins or mastery. */
let lastWide='',greet=null,greeting=false;
/* A 3D Mochi says hello on capable devices. Lighter tablets and reduced motion keep the picture. */
function mountGreeting(){
 const box=$('todayMochiGreet');if(!box||greet||greeting)return;
 let calm=false;try{calm=root.matchMedia?.('(prefers-reduced-motion: reduce)').matches;}catch(_){}
 if(calm||/Android/i.test(navigator.userAgent)||!root.WebGLRenderingContext)return;
 greeting=true;const v=document.querySelector('script[src*="today-ui.js"]')?.src.split('v=')[1]||'1';
 const growth=root.MochiPlanner?.pet?.(root.MochiPlanner.init(S))?.level||0;
 Promise.all([import('./mochi-greet.js?v='+v),import('./vendor/three-r180/three.module.js'),import('./mochi-home-cat.js?v='+v)]).then(([m,three,catModule])=>m.mountGreeting(box,{growth,three,catModule})).then(api=>{greet=api;greeting=false;if(home.hidden){greet.dispose();greet=null;}}).catch(()=>{greeting=false;greet=null;});
}
function unmountGreeting(){greet?.dispose();greet=null;}
function paintWide(){
 const box=$('todayWide'),W=root.MochiWideReading,M=root.MochiEntrance;if(!box||!W||!M)return;
 const d=M.init(S),today=P?P.localDay():M.dayKey(Date.now()),answered=Object.entries(d.wide?.facts||{}),todays=answered.find(([,f])=>M.dayKey(f.at)===today);
 const fact=todays?W.facts.find(f=>f.id===todays[0]):W.factForDay(today,answered.map(([id])=>id)),result=todays?.[1];
 const weekend=[0,6].includes(new Date().getDay()),inv=weekend?W.investigationForWeek(today,Object.keys(d.wide?.investigations||{})):null,invDone=inv&&d.wide?.investigations?.[inv.id];
 const mock=[['maths',M],['science',root.MochiSciencePath]].map(([subject,X])=>X&&S[subject==='maths'?'entrance':'sciencePath']?{subject,m:X.dueMock(X.init(S))}:null).find(x=>x?.m);
 const sig=JSON.stringify([fact?.id,result,inv?.id,!!invDone,mock?.m?.id]);if(sig===lastWide)return;lastWide=sig;
 box.innerHTML=(mock?`<article class="today-wide-card today-mock"><p class="today-eyebrow">Mock paper</p><h3>${esc(mock.m.title)}</h3><p>${mock.m.minutes} minutes, no calculator, no hints. Best at a quiet time with a grown-up nearby. It is for comparing with your next mock, not a prediction.</p><button type="button" id="todayMockOpen">See the paper</button></article>`:'')
 +(fact?`<article class="today-wide-card"><p class="today-eyebrow">Did you know? · ${fact.subject==='maths'?'Maths':'Science'}</p><h3>${esc(fact.question)}</h3><div class="today-wide-choices">${fact.choices.map((c,i)=>`<button type="button" data-wide-choice="${i}" ${result?'disabled':''} data-state="${result?(i===fact.answer?'right':i===result.choice?'picked':''):''}">${esc(c)}</button>`).join('')}</div>${result?`<p class="today-wide-explain">${result.correct?'Yes! ':'Good guess. '}${esc(fact.explain)}</p>`:'<p class="today-wide-hint">One tap. Reading widely in maths and science helps at the selection test.</p>'}</article>`:'')
 +(inv?`<article class="today-wide-card"><p class="today-eyebrow">Weekend investigation · ${inv.subject==='maths'?'Maths':'Science'}</p><h3>${esc(inv.title)}</h3><p>${esc(inv.question)}</p><details><summary>${invDone?'Done ✓ · see it again':'Open the investigation'}</summary><p><strong>You need:</strong> ${esc(inv.materials.join(', '))}</p><p><strong>Predict first:</strong> ${esc(inv.predict)}</p><ol>${inv.steps.map(x=>`<li>${esc(x)}</li>`).join('')}</ol><p><strong>Record:</strong> ${esc(inv.record)}</p><p><strong>Explain it to a grown-up:</strong></p><ul>${inv.explain.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>${inv.safety?`<p class="today-wide-safety">${esc(inv.safety)}</p>`:''}<details class="today-wide-grownup"><summary>For the grown-up</summary><p>${esc(inv.grownUp)}</p></details><label for="todayInvNote">What did you find out?</label><textarea id="todayInvNote" rows="2" maxlength="2000">${esc(invDone?.note||'')}</textarea><button type="button" id="todayInvDone">${invDone?'Save my notes':'We did it!'}</button></details></article>`:'');
 for(const b of box.querySelectorAll('[data-wide-choice]'))b.onclick=()=>{const choice=+b.dataset.wideChoice,r=W.check(fact.id,choice);M.answerFact(d,fact.id,choice,!!r?.correct);save(S);lastWide='';paintWide();};
 if($('todayInvDone'))$('todayInvDone').onclick=()=>{M.finishInvestigation(d,inv.id,$('todayInvNote').value);save(S);lastWide='';paintWide();};
 if($('todayMockOpen'))$('todayMockOpen').onclick=()=>{leave();U(mock.subject).open('papers');};
}
function paint(){
 if(!home)return;
 const m=T.model(S),v=current(),bonus=Q?.status(S),bonusOptions=Q?.bonusOptions?.(S)||[],bonusTask=bonusOptions[0]||Q?.bonusTask(S),cat=F?.report?.(S),study=P?P.elapsed(P.init(S)):null;
 // Existing modules can navigate by their own controls. Never leave two main views visible.
 if(v||!$('viewScience').hidden||!$('viewCourse').hidden||$('viewMaths').style.display!=='none'||$('viewRoom').style.display!=='none'||!$('viewMap').hidden)leave();
 if(!home.hidden){
  const signature=JSON.stringify([m,bonus,bonusOptions,rewardNote,cat?.points,cat?.timeBonusAwards,study]);if(signature!==lastHome){lastHome=signature;
   const t=m.next,first=m.order[0],isPaper=t?.kind==='paper';
   $('todayDate').textContent=new Date().toLocaleDateString(undefined,{weekday:'long',month:'short',day:'numeric'});
   $('todayTitle').textContent=m.restDay&&!t?'Rest day':m.finished&&!t?'Daily quests complete':'Today’s quests';
   $('todayIntro').textContent=isPaper?'Resume the saved paper first.':m.restDay&&!t?'No catch-up debt. Optional practice is still available.':m.finished&&!t?'Done for today. Bonus questions are optional.':'One quest at a time.';
   $('todayNowLabel').textContent=t?(isPaper?'SAVED PAPER':t.resume?'CONTINUE':'NEXT QUEST'):'DAILY QUESTS';
   $('todayTaskTitle').textContent=t?t.title:m.finished?'Nice work, Euna':'A break with Mochi';
   $('todayTaskSubject').textContent=t?names[t.subject]:m.restDay?'Rest day':'Maths + Science';
   $('todayTaskDetail').textContent=t?t.detail:m.finished?'Your planned study time is complete.':'Your learning and saved work will be here when you return.';
   $('todayStart').textContent=t?(t.resume?'Continue ':'Start ')+names[t.subject]+(isPaper?' paper':''):m.finished?'Visit Mochi':'Visit Mochi';
   $('todayStart').dataset.subject=t?.subject||'';
   $('todayQuestStrip').innerHTML=m.blocks.map(b=>`<div class="today-quest-chip" data-status="${b.done?'done':b.rest?'rest':t?.subject===b.subject?'now':'next'}"><span class="today-quest-icon" aria-hidden="true">${b.done?'✓':b.rest?'–':b.subject==='maths'?'M':'S'}</span><span><strong>${esc(b.name)}</strong><small>${b.rest?'Rest':b.done?'Done':Math.max(1,Math.ceil(b.remaining/60000))+' min left'}</small></span></div>`).join('');
   $('todayProgress').textContent=m.restDay?'Rest day':`${m.completed}/${m.planned} complete`;
   $('todayProgressBar').max=m.planned||1;$('todayProgressBar').value=m.completed;
   const bonusBox=$('todayBonus');bonusBox.hidden=!m.finished||m.restDay;
   if(!bonusBox.hidden){
    $('todayBonusCoins').textContent=`${bonus?.earned||0} bonus coin${bonus?.earned===1?'':'s'} today`;
    $('todayBonusText').textContent=bonus?.complete?'Three strong extra answers finished today’s chest.':`${bonus?.success.length||0}/3 complete · transfer or week-later recall earns 2 coins; fresh application earns 1`;
    if($('todayCatBonus')&&P&&cat){const p=P.init(S),bits=P.subjects.filter(x=>P.minutes(p,x)>0).map(x=>{const target=P.minutes(p,x),spent=Math.floor((study?.[x]||0)/60000);return `${x==='maths'?'M':'S'} ${Math.min(spent,target*2)}/${target*2}m`;});$('todayCatBonus').textContent=`Cat Points ${cat.points} · 2× time ${bits.join(' · ')} · +${F.DOUBLE_POINTS} each, capped at 2×`;}
    const choices=$('todayBonusChoices');choices.innerHTML=bonus?.complete?'':bonusOptions.map(x=>`<button type="button" data-bonus-subject="${x.subject}">${bonus?.active?'Continue':names[x.subject]} · +${x.coins} coin${x.coins===1?'':'s'}<small>${x.phase==='recall'?'Remember later':x.phase==='transfer'?'Transfer challenge':'Fresh application'}</small></button>`).join('');
    for(const b of choices.querySelectorAll('[data-bonus-subject]'))b.onclick=()=>launchBonus(b.dataset.bonusSubject);
   }
   $('todayNote').textContent=isPaper?'Paper time is separate from the daily clock.':rewardNote||(m.finished?'Bonus questions are optional. Coins never change mastery.':'Reading and thinking count. No speed bonus.');
  }
  const image=$('todayMochiImage'),pet=$('plannerPetImage')?.getAttribute('src')||root.MOCHI_AVATAR||'',src=!pet||/mochi-flat(-avatar)?\.svg/.test(pet)?(typeof MOCHI_AVATAR==='string'?MOCHI_AVATAR:'mochi-flat-avatar.svg').replace('mochi-flat-avatar.svg','mochi-flat.svg'):pet;if(image.getAttribute('src')!==src)image.src=src;paintCompanion(m,cat);try{paintWide();}catch(e){}try{mountGreeting();}catch(e){}
 }
 bar.hidden=!v||!['lesson','practice'].includes(v.kind)||!guided;
 if(!bar.hidden){
  const b=m.blocks.find(b=>b.subject===v.subject),running=root.MochiPlanUI?.running()===v.subject;
  $('todayFocusSubject').textContent=names[v.subject];
  $('todayFocusTime').textContent=b.rest?'Optional study':b.done?'Time goal reached':Math.max(1,Math.ceil(b.remaining/60000))+' min left';
  $('todayTimer').hidden=b.rest||b.done;$('todayTimer').textContent=running?'Pause time':'Resume time';$('todayTimer').setAttribute('aria-pressed',String(running));
  $('todayFocusNote').textContent=b.done?'Finish this thought, then return to your plan.':running?'Reading, thinking and paper work count.':(root.MochiPlanUI?.status?.()||'Time is paused. Your work is saved.');
  $('todayFinish').hidden=!b.done;$('todayFinish').textContent='Back to today’s plan';
 }
}
function init(){
 if(!T||!root.MochiPlanUI||!U('maths')||!U('science')||$('todayHome'))return;
 home=document.createElement('main');home.id='todayHome';home.hidden=true;
 home.innerHTML=`<div class="today-layout"><div class="today-main"><div class="today-greeting"><img src="euna-avatar.webp" width="44" height="44" alt=""><p id="todayDate"></p></div><h1 id="todayTitle" tabindex="-1"></h1><p id="todayIntro" class="today-intro"></p><section class="today-card" aria-label="Today’s study plan"><div class="today-card-top"><span id="todayNowLabel" class="today-eyebrow"></span><span id="todayTaskSubject" class="today-subject"></span></div><h2 id="todayTaskTitle"></h2><p id="todayTaskDetail"></p><button id="todayStart" class="today-primary" type="button">Start next quest</button><div id="todayQuestStrip" class="today-quest-strip" aria-label="Daily quest progress"></div><div class="today-progress"><span id="todayProgress"></span><progress id="todayProgressBar" max="2" value="0" aria-label="Daily study time goals reached"></progress></div></section><section id="todayBonus" class="today-bonus" hidden><div><strong>Bonus quest</strong><small id="todayBonusText"></small></div><span id="todayBonusCoins" class="today-bonus-coins"></span><p id="todayCatBonus" class="today-cat-bonus"></p><div id="todayBonusChoices" class="today-bonus-choices"></div></section><p id="todayNote" class="today-note"></p><section id="todayWide" class="today-wide" aria-label="Explore and wonder"></section></div><aside class="today-companion" aria-label="Mochi and rewards"><button id="todayMochi" class="today-mochi" type="button"><span class="today-mochi-says" id="todayMochiSays"></span><span class="mochi-greet" id="todayMochiGreet"><img id="todayMochiImage" src="mochi-flat-avatar.svg" width="150" height="150" alt=""></span><span class="today-mochi-visit">Visit Mochi’s room <span aria-hidden="true">→</span></span></button><div class="today-stats"><span class="today-stat"><span class="today-stat-icon" aria-hidden="true">🪙</span><strong id="todayCoins">0</strong><small>coins</small></span><span class="today-stat"><span class="today-stat-icon" aria-hidden="true">🐾</span><strong id="todayCatPoints">0</strong><small>Cat Points</small></span></div><div id="todayNextCat" class="today-next-cat"></div></aside></div>`;
 $('viewEntrance').before(home);
 bar=document.createElement('section');bar.id='todayFocusBar';bar.hidden=true;bar.setAttribute('aria-label','Current study time');bar.innerHTML='<button id="todayBack" type="button">← Today</button><div><strong id="todayFocusSubject"></strong><span id="todayFocusTime"></span><small id="todayFocusNote"></small></div><button id="todayTimer" type="button" aria-pressed="false">Pause time</button><button id="todayFinish" type="button" hidden>Back to today’s plan</button>';
 home.before(bar);
 const more=document.createElement('button');more.id='todayMore';more.type='button';more.setAttribute('aria-controls','todayMenu');more.setAttribute('aria-expanded','false');more.setAttribute('aria-haspopup','dialog');more.innerHTML='More <span aria-hidden="true">☰</span>';document.querySelector('#studioSurface .topbar').append(more);
 menu=document.createElement('dialog');menu.id='todayMenu';menu.setAttribute('aria-labelledby','todayMenuTitle');
 menu.innerHTML='<div class="today-menu-heading"><h2 id="todayMenuTitle">Everything else</h2><button id="todayMenuClose" type="button" aria-label="Close menu">×</button></div><p>Your daily plan already chooses the next step.</p><button data-today-home type="button">Today’s plan <span>Continue the guided route</span></button><button data-today-subject="maths" data-today-view="lessons" type="button">Maths lessons <span>Browse methods and worked examples</span></button><button data-today-subject="science" data-today-view="lessons" type="button">Science lessons <span>Explore ideas and evidence</span></button><button data-today-subject="labs" type="button">Experiment activities <span>Optional exploration</span></button><button data-today-subject="room" type="button">Mochi’s room <span>Cats, clothing and rewards</span></button><details><summary>Practice papers</summary><p>Keep reserved papers for planned assessments. Browsing this menu does not open their questions.</p><button data-today-subject="maths" data-today-view="papers" type="button">Maths papers and starting checks</button><button data-today-subject="science" data-today-view="papers" type="button">Science papers and starting checks</button></details><div class="today-adult"><button id="todayWeekly" type="button">Weekly time plan</button><button id="todayParent" type="button">Grown-up settings & progress</button></div>';
 document.body.append(menu);
 $('todayStart').onclick=launch;$('todayMochi').onclick=()=>go('room');$('todayBack').onclick=open;$('todayFinish').onclick=open;more.onclick=openMenu;$('todayMenuClose').onclick=closeMenu;
 menu.querySelector('[data-today-home]').onclick=open;
 for(const b of menu.querySelectorAll('[data-today-subject]'))b.onclick=()=>go(b.dataset.todaySubject,b.dataset.todayView);
 menu.addEventListener('close',()=>{more.setAttribute('aria-expanded','false');lastFocus?.focus?.({preventScroll:true});});
 menu.addEventListener('click',e=>{if(e.target===menu){const r=menu.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeMenu();}});
 $('todayTimer').onclick=()=>{const v=current();if(!v)return;if(root.MochiPlanUI.running()===v.subject)root.MochiPlanUI.pause();else root.MochiPlanUI.start(v.subject);paint();};
 $('todayParent').onclick=()=>{closeMenu();$('adultBtn').click();};
 $('todayWeekly').onclick=()=>{closeMenu();focusOpen('sessionPanel',$('todayMore'));$('mochiFocusHome').open=true;$('mochiFocusHome').scrollIntoView({block:'nearest'});};
 const bind=()=>{$('studioHome').onclick=e=>{e.preventDefault();open();};};bind();
 root.MochiTodayUI={open,leave,launch,atBoundary,paint,visible:()=>!home.hidden,refresh:()=>{bind();lastHome='';open();}};
 document.body.classList.add('today-enabled');
 document.addEventListener('mochi:activity',paint);
 document.addEventListener('mochi:state-saved',()=>{collectBonus();clearTimeout(queued);queued=setTimeout(paint,100);});
 document.addEventListener('mochi:cat-time-bonus',e=>{const s=e.detail?.subject,p=e.detail?.points||F?.DOUBLE_POINTS||2;rewardToast(`+${p} Cat Points · ${names[s]||'Study'} reached 2×!`);lastHome='';paint();});
 document.addEventListener('mochi:cloud-merged',()=>{bind();lastHome='';paint();});
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')paint();});
 const reset=$('resetBtn').onclick;$('resetBtn').onclick=()=>{const before=S.learning;reset();if(before!==S.learning){if(Q)S.questRewards=Q.fresh();open();}};
 setInterval(paint,1000);open();
}
if(root.MochiReady)init();else document.addEventListener('mochi:ready',init,{once:true});
})(window);
