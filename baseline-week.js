/* Euna baseline week: a light scheduling layer over Mochi's existing evidence model.
   This is not a placement test or an NUS High admissions predictor. */
(function(){
'use strict';

const TOTAL = 17;
const CHECKPOINTS = [4,8,12,17];
const WEEK_LABEL = '14–20 September 2026';
const DAYS = [
  {
    date:'Mon 14 Sep', range:'Questions 1–4',
    focus:'Number sense · fractions · changing fractions · decimals',
    instruction:'First attempt independently. For one question, explain what the numbers represent before calculating.'
  },
  {
    date:'Tue 15 Sep', range:'Questions 5–8',
    focus:'Ratio · percentages · rates · algebraic relationships',
    instruction:'Do not name a method first. Build the relationship, then choose the operation.'
  },
  {
    date:'Wed 16 Sep', range:'Questions 9–12',
    focus:'Measurement · time · area/perimeter · circles',
    instruction:'Sketch when useful. Check units and decide what is actually being measured.'
  },
  {
    date:'Thu 17 Sep', range:'Questions 13–17',
    focus:'Volume · angles · spatial reasoning · data/averages · multi-step modelling',
    instruction:'Finish the baseline. For the hardest question, record a plan even if the final answer is wrong.'
  }
];

function learning(){
  try { return MochiLearning.init(S); } catch(err) { return null; }
}

function progress(l){
  if(!l) return {done:0,total:TOTAL,finished:false};
  if(l.session && l.session.mode==='diagnostic'){
    return {done:Math.min(TOTAL,Number(l.session.done)||0),total:TOTAL,finished:!!l.session.finished || l.session.done>=TOTAL};
  }
  const attempts=(l.attempts||[]).filter(a=>a.kind==='diagnostic'&&!a.skipped);
  const seen=new Set(attempts.map(a=>a.skill));
  return {done:Math.min(TOTAL,seen.size),total:TOTAL,finished:seen.size>=TOTAL};
}

function dayState(i,done){
  const before=i===0?0:CHECKPOINTS[i-1];
  const end=CHECKPOINTS[i];
  if(done>=end) return 'complete';
  if(done>=before && done<end) return 'current';
  return 'upcoming';
}

function style(){
  if(document.getElementById('mochiBaselineStyle')) return;
  const s=document.createElement('style');
  s.id='mochiBaselineStyle';
  s.textContent=`
    .mochi-baseline{margin:14px 0 18px;padding:14px 15px;border:1px solid rgba(56,33,79,.14);border-radius:18px;background:rgba(255,255,255,.72)}
    .mochi-baseline h3{margin:0 0 4px;font-size:1rem}
    .mochi-baseline .baseline-kicker{margin:0 0 10px;font-size:.8rem;font-weight:800;letter-spacing:.05em;text-transform:uppercase;opacity:.68}
    .mochi-baseline .baseline-target{margin:0 0 12px;line-height:1.45}
    .baseline-days{display:grid;gap:8px;margin:10px 0 12px}
    .baseline-day{padding:10px 11px;border-radius:14px;border:1px solid rgba(56,33,79,.10);background:rgba(255,255,255,.55)}
    .baseline-day.current{border-color:rgba(180,86,15,.38);box-shadow:0 0 0 2px rgba(180,86,15,.08) inset}
    .baseline-day.complete{opacity:.66}
    .baseline-day strong{display:block;margin-bottom:2px}
    .baseline-day small{display:block;line-height:1.4;margin-top:3px}
    .baseline-actions{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
    .baseline-progress{font-weight:800}
  `;
  document.head.appendChild(s);
}

function mount(){
  if(document.getElementById('mochiBaselineWeek')) return;
  const anchor=document.getElementById('studySession');
  if(!anchor) return;
  style();
  const box=document.createElement('section');
  box.id='mochiBaselineWeek';
  box.className='mochi-baseline';
  box.innerHTML=`
    <p class="baseline-kicker">Starting-point week · ${WEEK_LABEL}</p>
    <h3>Find how Euna thinks before we prescribe the curriculum.</h3>
    <p class="baseline-target">Earlier checkpoint: <b>NUS High readiness by June/July 2027</b>. The existing <b>September 2027 SPERS-Sec1</b> target remains the fallback. This week is evidence gathering, not score chasing.</p>
    <div class="baseline-days" id="baselineDays"></div>
    <div class="baseline-actions">
      <button type="button" class="btn quiet" id="baselineStart">Start / resume baseline</button>
      <button type="button" class="btn quiet" id="baselineFriday" hidden>Start Friday adaptive check</button>
      <span class="baseline-progress" id="baselineProgress"></span>
    </div>
    <p class="study-note" style="margin-bottom:0">Rule for the baseline: let her make a genuine first attempt before hints, worked solutions or Mochi explanations. A wrong answer with a good model is more informative than a correct answer copied from a procedure.</p>
  `;
  anchor.insertAdjacentElement('afterend',box);

  document.getElementById('baselineStart').onclick=()=>{
    const l=learning(); if(!l) return;
    if(!(l.session && l.session.mode==='diagnostic' && !l.session.finished)) MochiLearning.start(l,'diagnostic');
    if(typeof save==='function') save(S);
    if(typeof renderQuestion==='function') renderQuestion();
    setTimeout(paint,60);
  };
  document.getElementById('baselineFriday').onclick=()=>{
    const l=learning(); if(!l) return;
    const p=progress(l); if(!p.finished) return;
    MochiLearning.start(l,'daily');
    if(typeof save==='function') save(S);
    if(typeof renderQuestion==='function') renderQuestion();
    setTimeout(paint,60);
  };
  paint();
}

function paint(){
  const box=document.getElementById('mochiBaselineWeek');
  if(!box) return;
  const l=learning(), p=progress(l);
  const days=document.getElementById('baselineDays');
  days.innerHTML=DAYS.map((d,i)=>{
    const state=dayState(i,p.done);
    const marker=state==='complete'?'✓ ':state==='current'?'→ ':'';
    return `<div class="baseline-day ${state}"><strong>${marker}${d.date} · ${d.range}</strong><span>${d.focus}</span><small>${d.instruction}</small></div>`;
  }).join('') + `<div class="baseline-day ${p.finished?'current':'upcoming'}"><strong>${p.finished?'→ ':''}Fri 18 Sep · adaptive transfer check</strong><span>Eight-question “My daily practice” session chosen from the baseline evidence.</span><small>Look for transfer: can she solve a fresh form without being told which method to use? The session ends with an investigation.</small></div>` +
  `<div class="baseline-day upcoming"><strong>Weekend · grown-up review</strong><span>Review the learning map and 2–3 pieces of her actual working.</span><small>Classify errors as conceptual, procedural, representation/model-building, or attention. Do not infer ability from speed alone.</small></div>`;
  document.getElementById('baselineProgress').textContent=`Baseline ${p.done}/${p.total}`;
  document.getElementById('baselineFriday').hidden=!p.finished;
  document.getElementById('baselineStart').textContent=p.finished?'Baseline complete':'Start / resume baseline';
}

function install(){
  mount();
  paint();
  setInterval(paint,1500);
}

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>setTimeout(install,0),{once:true});
else setTimeout(install,0);

})();
