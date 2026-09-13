/* Mochi focus dashboard — learner-facing task funnel.
   Keeps the full studio available, but makes the next learning task unmistakable. */
(function(){
'use strict';

const BASELINE_TOTAL = 17;
const BASELINE_STAGES = [
  {end:4,  label:'Starting point · Part 1', short:'Number sense, fractions and decimals', detail:'4 questions · no timer · explain one idea before calculating'},
  {end:8,  label:'Starting point · Part 2', short:'Ratio, percentages, rates and algebra', detail:'4 questions · build the relationship before choosing an operation'},
  {end:12, label:'Starting point · Part 3', short:'Measurement, time and geometry', detail:'4 questions · sketch when useful and check units'},
  {end:17, label:'Starting point · Part 4', short:'Volume, angles, data and modelling', detail:'5 questions · record a plan for the hardest one'}
];
const PLAN_KEY='mochi-focus-plan-start-v1';
const VERSION='4.2.3';
const RELEASE_SUMMARY='Today-first dashboard: one clear task, a visible weekly checklist, and advanced choices moved behind More.';

function learning(){
  try{return MochiLearning.init(S);}catch(err){return null;}
}
function localDay(ts){
  const d=ts?new Date(ts):new Date();
  return new Date(d.getFullYear(),d.getMonth(),d.getDate());
}
function isoDay(d){
  const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
}
function planStart(){
  let raw='';
  try{raw=localStorage.getItem(PLAN_KEY)||'';}catch(e){}
  if(/^\d{4}-\d{2}-\d{2}$/.test(raw)){
    const [y,m,d]=raw.split('-').map(Number); return new Date(y,m-1,d);
  }
  const now=localDay();
  try{localStorage.setItem(PLAN_KEY,isoDay(now));}catch(e){}
  return now;
}
function addDays(d,n){const x=new Date(d);x.setDate(x.getDate()+n);return x;}
function sameDay(a,b){return a&&b&&a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate();}
function dateLabel(d){
  const today=localDay(),tomorrow=addDays(today,1);
  if(sameDay(d,today))return 'Today';
  if(sameDay(d,tomorrow))return 'Tomorrow';
  return d.toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric'});
}
function fullToday(){return new Date().toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'});}
function diagnosticStats(l){
  const all=(l?.attempts||[]).filter(a=>a.kind==='diagnostic'&&!a.skipped);
  const seen=new Set(all.map(a=>a.skill));
  const active=l?.session&&l.session.mode==='diagnostic'?Math.max(0,Number(l.session.done)||0):0;
  const done=Math.min(BASELINE_TOTAL,Math.max(seen.size,active));
  const last=all.reduce((m,a)=>Math.max(m,Number(a.at)||0),0);
  return {done,finished:done>=BASELINE_TOTAL,last};
}
function postBaselineAttempts(l,lastDiagnostic){
  return (l?.attempts||[]).filter(a=>a.kind==='daily'&&!a.skipped&&Number(a.at)>lastDiagnostic);
}
function stageFor(done){return BASELINE_STAGES.find((s)=>done<s.end)||null;}
function taskState(l){
  const d=diagnosticStats(l);
  if(!d.finished){
    const stage=stageFor(d.done),part=BASELINE_STAGES.indexOf(stage)+1;
    const remaining=Math.max(1,stage.end-d.done);
    return {
      phase:'baseline',
      eyebrow:`STARTING-POINT CHECK · PART ${part} OF 4`,
      title:d.done?'Continue today’s starting-point check':'Start your maths starting-point check',
      subtitle:`${remaining} question${remaining===1?'':'s'} left in today’s part · about ${Math.max(5,remaining*3)} min · no timer`,
      note:stage.short+'. '+stage.detail+'.',
      cta:d.done?'Continue today’s task':'Start today’s task',
      done:d.done,total:BASELINE_TOTAL
    };
  }
  const transfer=postBaselineAttempts(l,d.last);
  const activeDaily=l?.session&&l.session.mode==='daily'&&!l.session.finished;
  const dailyDone=activeDaily?Math.max(transfer.length,Number(l.session.done)||0):transfer.length;
  if(dailyDone<8){
    const remaining=Math.max(1,8-dailyDone);
    return {
      phase:'transfer',eyebrow:'TODAY · ADAPTIVE TRANSFER CHECK',
      title:'Use what you know in new-looking problems',
      subtitle:`${remaining} question${remaining===1?'':'s'} left · about ${Math.max(8,remaining*3)} min`,
      note:'Mochi chooses fresh forms from the baseline evidence. Do not ask which method to use first.',
      cta:dailyDone?'Continue today’s task':'Start today’s task',done:dailyDone,total:8
    };
  }
  const s=l?.session;
  const finishedToday=!!(s&&s.finished&&sameDay(localDay(s.started),localDay()));
  if(finishedToday){
    return {phase:'done',eyebrow:'TODAY · COMPLETE',title:'You finished today’s Mochi work',subtitle:'Nice work. Save one useful idea, then stop.',note:'Tomorrow Mochi will choose the next review from your evidence.',cta:'',done:1,total:1};
  }
  return {phase:'review',eyebrow:'TODAY · TARGETED REVIEW',title:'Strengthen one idea that needs another look',subtitle:'About 20 minutes · accuracy and explanation first',note:'Mochi will prioritise due or weaker evidence instead of giving random practice.',cta:'Start today’s task',done:0,total:8};
}
function weekRows(l){
  const start=planStart(),d=diagnosticStats(l),transfer=postBaselineAttempts(l,d.last);
  return [
    {date:addDays(start,0),title:'Starting point · Part 1',detail:'Number sense, fractions and decimals',done:d.done>=4,current:d.done<4},
    {date:addDays(start,1),title:'Starting point · Part 2',detail:'Ratio, percentages, rates and algebra',done:d.done>=8,current:d.done>=4&&d.done<8},
    {date:addDays(start,2),title:'Starting point · Part 3',detail:'Measurement, time and geometry',done:d.done>=12,current:d.done>=8&&d.done<12},
    {date:addDays(start,3),title:'Starting point · Part 4',detail:'Volume, angles, data and modelling',done:d.done>=17,current:d.done>=12&&d.done<17},
    {date:addDays(start,4),title:'Adaptive transfer check',detail:'8 fresh problems chosen from the baseline evidence',done:d.done>=17&&transfer.length>=8,current:d.done>=17&&transfer.length<8},
    {date:addDays(start,5),title:'Repair one weak idea',detail:'Short targeted review; no score chasing',done:false,current:d.done>=17&&transfer.length>=8},
    {date:addDays(start,6),title:'Review together + light challenge',detail:'Look at 2–3 pieces of working; then rest',done:false,current:false}
  ];
}
function startTask(){
  const l=learning();if(!l)return;
  const t=taskState(l);
  if(t.phase==='baseline'){
    if(!(l.session&&l.session.mode==='diagnostic'&&!l.session.finished))MochiLearning.start(l,'diagnostic');
  }else if(t.phase==='transfer'){
    if(!(l.session&&l.session.mode==='daily'&&!l.session.finished))MochiLearning.start(l,'daily');
  }else if(t.phase==='review'){
    if(!(l.session&&l.session.mode==='review'&&!l.session.finished))MochiLearning.start(l,'review');
  }else return;
  if(typeof save==='function')save(S);
  if(typeof renderQuestion==='function')renderQuestion();
  setTimeout(()=>{
    paint();
    const q=document.getElementById('qText')||document.querySelector('.qtext');
    q?.scrollIntoView({behavior:'smooth',block:'center'});
  },80);
}
function applyVersion(){
  document.querySelectorAll('[data-app-version]').forEach(el=>el.textContent='v'+VERSION);
  document.querySelectorAll('[data-release-date]').forEach(el=>{el.dateTime='2026-09-13';el.textContent='13 September 2026';});
  const rn=document.getElementById('releaseNotes');if(rn)rn.textContent=RELEASE_SUMMARY;
}
function simplifyAdvanced(){
  document.body.classList.add('mochi-focus-mode');
  const own=document.getElementById('ownProblemStart');
  if(own){const details=own.closest('details');if(details)details.classList.add('mochi-secondary-choice');}
  const mode=document.getElementById('studyMode');
  if(mode){const parent=mode.closest('label')||mode.parentElement;if(parent)parent.classList.add('mochi-secondary-choice');}
  const start=document.getElementById('studyStart');if(start)start.classList.add('mochi-secondary-choice');
  const labels=['think','explore','my map','euna’s session','euna\'s session','challenge','mochi’s room','mochi\'s room'];
  document.querySelectorAll('button').forEach(b=>{
    const txt=(b.textContent||'').trim().toLowerCase();
    if(labels.includes(txt))b.classList.add('mochi-secondary-choice');
  });
}
function style(){
  if(document.getElementById('mochiFocusStyle'))return;
  const s=document.createElement('style');s.id='mochiFocusStyle';
  s.textContent=`
    #mochiFocusHome{margin:4px 0 16px}
    .focus-today{position:relative;overflow:hidden;background:linear-gradient(145deg,var(--card),rgba(255,255,255,.82));border:2px solid var(--line);border-radius:24px;box-shadow:var(--shadow);padding:20px;margin-bottom:12px}
    .focus-today:before{content:'';position:absolute;width:150px;height:150px;border-radius:50%;right:-58px;top:-70px;background:var(--jade-soft);opacity:.75;pointer-events:none}
    .focus-kicker{font-family:var(--mono);font-size:.66rem;font-weight:800;letter-spacing:1.2px;color:var(--jade);margin:0 0 6px;text-transform:uppercase}
    .focus-date{font-size:.78rem;color:var(--slate);margin:0 0 14px;font-weight:700}
    .focus-title{position:relative;font-family:var(--disp);font-size:1.55rem;line-height:1.16;margin:0 0 7px;max-width:560px}
    .focus-sub{font-size:.96rem;font-weight:700;margin:0 0 6px;color:var(--ink)}
    .focus-note{font-size:.88rem;line-height:1.5;color:var(--slate);margin:0 0 15px;max-width:600px}
    .focus-progress{height:10px;background:var(--line);border-radius:99px;overflow:hidden;margin:12px 0 14px}
    .focus-progress>i{display:block;height:100%;background:var(--jade);border-radius:inherit;transition:width .3s ease}
    .focus-start{width:100%;font-size:1.08rem;padding:15px 20px}
    .focus-done{padding:12px 14px;border-radius:14px;background:var(--jade-soft);font-weight:800;color:var(--jade)}
    .focus-week{background:rgba(255,255,255,.72);border:2px solid var(--line);border-radius:20px;padding:16px 16px 12px;margin-bottom:10px}
    .focus-week-head{display:flex;align-items:end;justify-content:space-between;gap:12px;margin-bottom:10px}
    .focus-week h2{font-family:var(--disp);font-size:1.08rem;margin:0}.focus-week-head span{font-size:.75rem;color:var(--slate)}
    .focus-list{display:grid;gap:6px}.focus-row{display:grid;grid-template-columns:26px 72px 1fr;gap:8px;align-items:start;padding:8px 5px;border-radius:12px}
    .focus-row.current{background:var(--ginger-soft)}.focus-row.done{opacity:.62}.focus-check{width:22px;height:22px;border:2px solid var(--line);border-radius:50%;display:grid;place-items:center;font-size:.75rem;font-weight:900}.focus-row.done .focus-check{background:var(--jade);border-color:var(--jade);color:white}.focus-row.current .focus-check{border-color:var(--ginger);color:var(--ginger)}
    .focus-when{font-family:var(--mono);font-size:.68rem;font-weight:800;color:var(--slate);padding-top:3px}.focus-row b{display:block;font-size:.88rem}.focus-row small{display:block;color:var(--slate);line-height:1.35;margin-top:1px}
    .focus-more{margin:8px 0 14px}.focus-more>summary{cursor:pointer;text-align:center;color:var(--slate);font-weight:800;font-size:.86rem;padding:8px}
    body.mochi-focus-mode:not(.mochi-show-more) .tabs{display:none!important}
    body.mochi-focus-mode:not(.mochi-show-more) .mochi-secondary-choice{display:none!important}
    .focus-more-note{font-size:.8rem;color:var(--slate);text-align:center;margin:2px 0 8px}
    @media(max-width:560px){.focus-today{padding:17px}.focus-title{font-size:1.35rem}.focus-row{grid-template-columns:24px 64px 1fr;gap:6px}.focus-week{padding:14px 11px 10px}}
  `;
  document.head.appendChild(s);
}
function mount(){
  if(document.getElementById('mochiFocusHome'))return;
  style();simplifyAdvanced();applyVersion();
  const host=document.createElement('section');host.id='mochiFocusHome';host.setAttribute('aria-label','Euna’s learning plan');
  const top=document.querySelector('.topbar');
  if(top)top.insertAdjacentElement('afterend',host);else(document.querySelector('.wrap')||document.body).prepend(host);
  paint();
}
function paint(){
  const host=document.getElementById('mochiFocusHome');if(!host)return;
  const l=learning();if(!l)return;
  const t=taskState(l),rows=weekRows(l),pct=Math.max(0,Math.min(100,(t.done/t.total)*100));
  host.innerHTML=`
    <section class="focus-today">
      <p class="focus-kicker">${t.eyebrow}</p>
      <p class="focus-date">${fullToday()}</p>
      <h1 class="focus-title">${t.title}</h1>
      <p class="focus-sub">${t.subtitle}</p>
      <p class="focus-note">${t.note}</p>
      <div class="focus-progress" aria-label="Task progress"><i style="width:${pct}%"></i></div>
      ${t.cta?`<button type="button" class="btn focus-start" id="focusStartTask">${t.cta} →</button>`:`<div class="focus-done">✓ Today’s task is complete</div>`}
    </section>
    <section class="focus-week">
      <div class="focus-week-head"><h2>This week</h2><span>One main task at a time</span></div>
      <div class="focus-list">${rows.map(r=>`<div class="focus-row ${r.done?'done':''} ${r.current?'current':''}"><span class="focus-check">${r.done?'✓':r.current?'→':''}</span><span class="focus-when">${dateLabel(r.date)}</span><span><b>${r.title}</b><small>${r.detail}</small></span></div>`).join('')}</div>
    </section>
    <details class="focus-more" id="focusMore"><summary>More things I can do</summary><p class="focus-more-note">Science, learning map, challenges, Mochi’s room and other choices live here. Today’s task above should usually come first.</p></details>`;
  const start=document.getElementById('focusStartTask');if(start)start.onclick=startTask;
  const more=document.getElementById('focusMore');if(more)more.ontoggle=()=>document.body.classList.toggle('mochi-show-more',more.open);
  applyVersion();simplifyAdvanced();
}
function install(){mount();paint();setInterval(paint,1500);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(install,0),{once:true});
else setTimeout(install,0);
})();