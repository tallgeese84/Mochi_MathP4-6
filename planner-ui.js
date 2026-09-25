/* One compact daily surface. The full week and evidence stay behind disclosure controls. */
(function(root){
'use strict';
const P=root.MochiPlanner,C=root.MochiCourse,$=id=>document.getElementById(id),clock=P.clock();
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const label=s=>s==='maths'?'Maths':'Science',data=()=>P.init(S),uid=()=>crypto.randomUUID?.()||Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
let message='Start a subject when you are ready. Take a break between subjects.',lastSave=0,renderTimer=null;
function visibleSubject(){
 if($('ov').classList.contains('show')||!$('sessionPanel').hidden)return null;
 if(root.MochiEntranceUI?.visible())return 'maths';
 if(!$('viewCourse').hidden)return root.courseCurrent().subject;
 if(!$('viewScience').hidden)return 'science';
 if($('viewMaths').style.display!=='none')return 'maths';return null;
}
function tick(persist=false){
 const was=clock.subject,r=clock.tick(data(),Date.now(),performance.now(),document.visibilityState==='visible',visibleSubject());
 if(r.reason){message=r.reason;$('plannerStatus').textContent=message;}
 if(was&&(persist||!r.running||Date.now()-lastSave>15000)){lastSave=Date.now();save(S);}paintClocks();
}
function pause(note='Clock paused. Your work is saved.'){
 if(clock.subject)tick(true);clock.stop();message=note;$('plannerStatus').textContent=message;paintClocks();
}
function start(subject){
 if(clock.subject===subject){pause();return;}pause('');
 if(!P.minutes(data(),subject)){message='This is a rest day for '+label(subject)+'. You can still explore, or edit the weekly plan.';$('plannerStatus').textContent=message;return;}
 if(P.elapsed(data())[subject]>=P.minutes(data(),subject)*60000){message='Today’s '+label(subject)+' time goal is complete. You can finish your checks without restarting the clock.';$('plannerStatus').textContent=message;return;}
 const d=P.day(data(),subject);d.unit=d.unit||P.recommend(S,subject).unit;
 if(visibleSubject()!==subject){if(subject==='maths'&&root.MochiEntranceUI)root.MochiEntranceUI.open();else root.courseOpen(subject,d.unit);}
 clock.start(subject,data(),uid(),Date.now(),performance.now());lastSave=Date.now();save(S);
 message=label(subject)+' time is running. Reading and working count; the clock is not a speed test.';$('plannerStatus').textContent=message;paintClocks();
}
function paintClocks(){
 if(!$('dailyPlan'))return;const elapsed=P.elapsed(data());
 for(const s of P.subjects){const seconds=Math.floor(elapsed[s]/1000),target=P.minutes(data(),s),b=$('clock-'+s);$('time-'+s).textContent=`${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')} / ${target}m`;b.textContent=clock.subject===s?'Pause':seconds>0?'Resume':'Start';b.setAttribute('aria-label',b.textContent+' '+label(s)+' clock');b.setAttribute('aria-pressed',String(clock.subject===s));b.disabled=!target||seconds>=target*60;$('timer-'+s).dataset.running=String(clock.subject===s);}
}
function route(subject,action){
 if(subject==='maths'&&root.MochiEntranceUI?.visible()){
  const r=root.MochiEntrance.recommend(S),id=root.MochiEntranceUI.currentUnit()||r.unit||'relationships';
  if(action==='learn')root.MochiEntranceUI.next();else root.MochiEntranceUI.practice(id,action==='check'?'guided':undefined);paint();return;
 }
 const d=P.day(data(),subject),r=P.recommend(S,subject),current=root.courseCurrent();
 d.unit=action==='learn'?r.unit:current.subject===subject?current.unit:d.unit||r.unit;d.updatedAt=Date.now();
 root.courseOpen(subject,d.unit);save(S);
 if(action==='practice')root.coursePractice();
 if(action==='check'){
  const attempt=root.courseStartCheck();
  if(attempt){const key='course:'+attempt;d.exitIds=[...new Set([...d.exitIds,key])].slice(-8);save(S);message='Exit check: try it without reopening help, and explain your reasoning in the notebook. A mistake tells us what to revisit.';}
  else message='Finish this topic’s teaching first. If its fresh checks are used up, return for delayed retrieval or review the working with an adult.';
  $('plannerStatus').textContent=message;
 }
 paint();
}
function paint(){
 if(!$('dailyPlan'))return;const p=data(),pet=P.pet(p);
 $('plannerDay').textContent=new Date().toLocaleDateString(undefined,{weekday:'long',month:'short',day:'numeric'});
 for(const s of P.subjects){const g=P.goals(S,s),r=P.recommend(S,s),u=C.unit(r.unit),d=p.days[P.localDay()]?.[s];
  const current=root.courseCurrent(),focus=current.subject===s?current.unit:d?.unit||r.unit;
  $('focus-'+s).textContent=C.unit(focus).title;$('reason-'+s).textContent='Next study focus: '+u.title+'. '+r.reason;
  if(s==='maths'&&root.MochiEntranceUI?.visible()){const next=root.MochiEntrance.recommend(S),id=root.MochiEntranceUI.currentUnit()||next.unit;$('focus-'+s).textContent=id?root.MochiEntrance.unit(id).title:'Entrance reasoning';$('reason-'+s).textContent=next.reason;}
  $('goal-'+s).textContent=g.minutes===0?'Rest day · no catch-up debt.':`${g.practice}/${g.target} practice answers · ${g.exit?'exit answer recorded':'1 exit check'} · ${g.reflected?'reflection saved':'reflect on your approach'}`;
  $('learned-'+s).checked=g.learned;
  if(document.activeElement!==$('reflection-'+s))$('reflection-'+s).value=d?.reflection||'';
  $('result-'+s).textContent=g.exit?(g.exitIndependent?'Exit answer correct without recorded help. Discuss the explanation too.':'Exit answer recorded. Revisit the idea and explain what you would change.'):'A short authored check guides the next lesson; it is not an exam score.';
  $('plan-notes-'+s).textContent=(P.observations(S,s).signals[0]?.action||'Before you answer, choose a representation. Afterwards, explain why it works and how you checked.');
 }
 $('plannerPetName').textContent=pet.name;$('plannerPet').setAttribute('aria-label','Visit Mochi · '+pet.name);
 const room=$('mochiGrowth');room.dataset.level=pet.level;room.querySelector('[data-growth-summary]').innerHTML=`<p class="plan-eyebrow">GROWING TOGETHER · STAGE ${pet.level+1}/5</p><h2>${esc(pet.name)}</h2><p>In 3D: ${esc(pet.appearance)}</p><p>${pet.maths} Maths ideas · ${pet.science} Science ideas · ${pet.retained} revisited after three days</p><p>${esc(pet.next)}</p>`;
 room.querySelectorAll('[data-growth-step]').forEach(el=>{if(Number(el.dataset.growthStep)===pet.level)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current');});
 $('stage').dataset.growth=pet.level;$('stage').style.setProperty('--growth-scale',String(.76+pet.level*.06));
 $('plannerPetImage').src=$('stage').dataset.portrait==='flat'?MOCHI_AVATAR:$('roomImg').src;
 paintClocks();if($('plannerEvidence').open)paintEvidence();
}
function paintEvidence(){
 const report=P.report(S);$('plannerEvidenceBody').innerHTML=P.subjects.map(s=>{const o=report.thinking[s],r=report.next[s];return `<h3>${label(s)}</h3><p>Last ${o.sample} recorded answers: ${o.independent} correct without recorded support and eligible for fresh or spaced evidence.</p><p><strong>Next: ${esc(C.unit(r.unit).title)}</strong> — ${esc(r.reason)}</p>`+(o.signals.length?o.signals.map(x=>`<p><strong>${esc(x.title)}</strong> (${x.count}/${x.sample}). ${esc(x.action)}<br><small>Examples: ${x.evidence.map(esc).join(', ')}</small></p>`).join(''):'<p>Not enough repeated evidence for a pattern yet. Ask Euna to talk through one answer.</p>');}).join('')+'<p>These observations guide questions to ask. Written and drawn explanations still need review. The learning mirror includes the plan, active-time estimates, daily reflections, evidence IDs and next steps.</p>';
}
function schedulePaint(){
 for(let i=0;i<7;i++)for(const s of P.subjects)$(`week-${i}-${s}`).value=data().schedule.week[i][s];
}
function init(){
 P.init(S);P.grow(S);
 const host=document.createElement('section');host.id='dailyPlan';host.className='daily-plan';host.setAttribute('aria-label','Today’s learning plan');
 host.innerHTML=`<div class="plan-heading"><span id="plannerDay" class="plan-eyebrow"></span><button id="plannerPet" class="plan-pet"><img id="plannerPetImage" data-mochi-avatar src="${MOCHI_AVATAR}" width="42" height="42" alt=""><span>Mochi <small id="plannerPetName"></small></span></button></div><div class="plan-clocks">${P.subjects.map(s=>`<div class="plan-clock" id="timer-${s}"><strong>${label(s)}</strong><span id="time-${s}" class="plan-time"></span><button id="clock-${s}" type="button">Start</button></div>`).join('')}</div><p id="plannerStatus" class="plan-status" role="status">${message}</p><details id="dailyGoals"><summary>Today’s goals & next steps</summary><p class="plan-intro">Study an idea → practise → exit check → reflect. Take a five-minute break between subjects. Stop at the time goal even if a topic needs another day.</p><div class="plan-goals">${P.subjects.map(s=>`<section><h2>${label(s)} · <span id="focus-${s}"></span></h2><p id="reason-${s}"></p><p id="goal-${s}" class="plan-goal-count"></p><div class="plan-actions"><button data-route="learn" data-subject="${s}">Next study focus</button><button data-route="practice" data-subject="${s}">Practice</button><button data-route="check" data-subject="${s}">Exit check</button></div><label class="plan-learned"><input type="checkbox" id="learned-${s}"> I studied or reviewed one idea (my record)</label><p id="result-${s}" class="plan-note"></p><p id="plan-notes-${s}" class="plan-strategy"></p><label for="reflection-${s}">What changed in my thinking? How did I check?</label><textarea id="reflection-${s}" maxlength="1500" rows="2" placeholder="You can also write or draw in the lesson notebook."></textarea><button id="reflect-${s}">Save reflection</button></section>`).join('')}</div></details>`;
 document.querySelector('#studioSurface .topbar').after(host);
 const week=document.createElement('details');week.id='mochiFocusHome';week.className='plan-schedule';
 week.innerHTML='<summary>My Monday–Sunday plan</summary><p>An editable starting routine around school, not a prescribed dose. Set 0 for a rest day; missed work does not accumulate.</p><form id="weeklyPlanForm"><div class="plan-week-heading"><span>Day</span><span>Maths min</span><span>Science min</span></div>'+P.days.map((d,i)=>`<div class="plan-week-row"><strong>${d}</strong>${P.subjects.map(s=>`<label class="sr-only" for="week-${i}-${s}">${d} ${label(s)} minutes</label><input type="number" id="week-${i}-${s}" min="0" max="90" step="1" required inputmode="numeric">`).join('')}</div>`).join('')+'<button type="submit">Save weekly plan</button><p id="weeklyPlanStatus" role="status"></p></form><p>Two separate clocks; one runs at a time. Hiding the app, changing subject, or three minutes without interaction pauses timing. Reading may need a tap on Resume. Reloading never starts a clock automatically. This measures foreground time, not learning quality.</p>';
 $('sessionPanel').appendChild(week);schedulePaint();
 $('weeklyPlanForm').onsubmit=e=>{e.preventDefault();try{const next=P.validate({...data(),schedule:{updatedAt:Date.now(),week:P.days.map((_,i)=>Object.fromEntries(P.subjects.map(s=>[s,Number($(`week-${i}-${s}`).value)])))}});pause('Plan updated. Start a clock when ready.');S.planner.schedule=next.schedule;save(S);$('weeklyPlanStatus').textContent='Weekly plan saved. Past time and learning records are kept.';}catch(err){$('weeklyPlanStatus').textContent=err.message;}};
 for(const s of P.subjects){$('clock-'+s).onclick=()=>start(s);$('learned-'+s).onchange=()=>{const d=P.day(data(),s);d.learnedAt=$('learned-'+s).checked?Date.now():0;d.updatedAt=Date.now();save(S);};$('reflect-'+s).onclick=()=>{const d=P.day(data(),s);d.reflection=$('reflection-'+s).value.trim();d.updatedAt=Date.now();save(S);$('plannerStatus').textContent=d.reflection?'Reflection saved for your next learning review.':'Add a thought first, or use your lesson notebook.';};}
 for(const b of host.querySelectorAll('[data-route]'))b.onclick=()=>route(b.dataset.subject,b.dataset.route);
 $('plannerPet').onclick=()=>{pause('Time for a break with Mochi.');studioShow('room');$('mochiGrowth').scrollIntoView({block:'nearest'});};
 const growth=document.createElement('section');growth.id='mochiGrowth';growth.className='mochi-growth';growth.setAttribute('aria-label','Mochi’s learning milestones');
 growth.innerHTML='<div data-growth-summary></div><details class="mochi-growth-guide"><summary>How Mochi grows</summary><p>His body and eyes grow a little at each stage. Each milestone builds on the previous one, and he keeps his friendly kitten face.</p><ol>'+P.growthStages.map((s,i)=>`<li data-growth-step="${i}"><strong>${esc(s.name)}</strong><span>${esc(s.unlock)}</span><small>${esc(s.appearance)}</small></li>`).join('')+'</ol><p>Revisited ideas count across both subjects together. An independent answer is correct without recorded help or retries.</p><small>Independent answers, different question forms and delayed retrieval earn milestones. Time, speed and repeated guesses do not. Rest days and mistakes never shrink Mochi.</small></details>';
 $('viewRoom').prepend(growth);
 const evidence=document.createElement('details');evidence.id='plannerEvidence';evidence.className='study-details';evidence.innerHTML='<summary>Thinking patterns & next learning steps</summary><div id="plannerEvidenceBody"></div>';$('parentEvidence').after(evidence);evidence.ontoggle=()=>{if(evidence.open)paintEvidence();};
 for(const ev of ['pointerdown','keydown','input','scroll'])document.addEventListener(ev,()=>clock.touch(performance.now()),{passive:true,capture:true});
 document.addEventListener('mochi:state-saved',()=>{clearTimeout(renderTimer);renderTimer=setTimeout(paint,80);});
 document.addEventListener('mochi:cloud-merged',()=>{pause('Progress merged. Resume a subject when ready.');schedulePaint();paint();});
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')pause('Paused while the app is hidden.');else paint();});
 document.addEventListener('mochi:activity',()=>{if(clock.subject&&clock.subject!==visibleSubject())pause('Paused when you changed activity.');clearTimeout(renderTimer);renderTimer=setTimeout(paint,80);});
 window.addEventListener('pagehide',()=>pause());window.addEventListener('blur',()=>pause('Paused while this window is inactive.'));
 const reset=$('resetBtn').onclick;$('resetBtn').onclick=()=>{const before=S.learning;reset();if(before!==S.learning){clock.stop();S.planner=P.fresh();save(S);schedulePaint();paint();}};
 root.MochiPlanUI={pause,flush:()=>tick(true),refresh:()=>{clock.stop();schedulePaint();paint();}};
 setInterval(()=>tick(),1000);paint();
}
if(root.MochiReady)init();else document.addEventListener('mochi:ready',init,{once:true});
})(window);
