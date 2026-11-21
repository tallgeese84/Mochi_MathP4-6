/* v7.12 Contest practice screens inside the Maths pathway: an overview, a running 40-minute sprint
   and the review with worked solutions. Rendered into the Maths host by entrance-ui.js (view 'contest').
   No hints or tutor during a sprint; the clock keeps running across reloads, like a timed paper. */
(function(root){
'use strict';
const C=root.MochiContest,$=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const L=C.LETTERS,NEW={Probability:'amc-chance','Right triangles':'amc-right',Coordinates:'amc-coords'};
let ctx=null,confirming=false;
const data=S=>C.init(S);
const day=t=>new Date(t).toLocaleDateString('en-GB',{day:'numeric',month:'short'});
const mmss=ms=>{const s=Math.max(0,Math.ceil(ms/1000));return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;};
const figure=q=>q.figure?root.MochiEntranceFigures?.diagram(q.figure,q.id)||'':'';
const header=(title,kicker)=>`<div class="ep-heading"><div><p class="ep-kicker">${esc(kicker)}</p><h1 id="epTitle" tabindex="-1">${esc(title)}</h1></div></div>`;
const countdown=(now=Date.now())=>{const left=C.daysLeft(now);return left>1?`${left} days to go`:left===1?'Tomorrow':left===0?'Today':'The contest date has passed';};
function taught(S,id){const E=root.MochiEntrance;try{return !!(E&&S&&E.evidence(E.init(S),id).taught);}catch(_){return false;}}

/* ---------- overview ---------- */
function overview(S){
 const c=data(S),now=Date.now(),open=C.running(c,now),done=C.list(c).filter(s=>s.submittedAt).reverse(),rep=C.report(c,now),next=(C.list(c).at(-1)?.number||0)+1;
 const topics=Object.entries(rep.topics).map(([t,v])=>({t,...v,p:v.correct/v.total})).sort((a,b)=>a.p-b.p||a.t.localeCompare(b.t));
 return header('Contest practice','AMC 8 STYLE · 25 QUESTIONS · 40 MINUTES')+
 `<section class="ep-card ct-date"><p><strong>${esc(C.CONTEST.name)}: ${esc(C.CONTEST.label)}</strong> · ${countdown(now)}</p>${open?`<p>Sprint ${open.number} is running: ${mmss(open.deadline-now)} left.</p>`:''}<button type="button" class="ep-primary" data-ct-start>${open?`Continue sprint ${open.number}`:`Start sprint ${next}`}</button></section>`+
 `<section class="ep-card ct-rules"><h2>How a sprint works</h2><ul><li>25 multiple-choice questions with choices A to E. They get harder as you go.</li><li>40 minutes. No calculator. Use scrap paper for your working.</li><li>A wrong answer costs nothing, so choose an answer for every question, even a best guess.</li><li>Stuck? Flag the question, move on and come back to it. Make sure of the early questions first.</li><li>The timer keeps running if you leave. Hints and Ask Mochi come back after you submit.</li></ul>`+
 `<details class="ct-tips"><summary>Contest tips and American words</summary><ul><li>Use the choices: estimate first, then cross out answers that are too big, too small or the wrong kind of number.</li><li>A “die” is one dice. A nickel is 5¢, a dime 10¢ and a quarter 25¢.</li><li>12 inches = 1 foot, 3 feet = 1 yard, 5,280 feet = 1 mile. A “trapezoid” is a trapezium.</li><li>An “integer” is a whole number, which can also be 0 or negative. “Positive integers” are 1, 2, 3, …</li></ul></details></section>`+
 `<section class="ep-card ct-new"><h2>Three topics for the contest</h2><p>These are not in the Singapore primary syllabus but often appear on the AMC 8.</p><div class="ct-new-list">${Object.entries(NEW).map(([t,id])=>`<button type="button" data-lesson="${id}">${esc(t)}${taught(S,id)?' · learnt ✓':' · start the lesson'}</button>`).join('')}</div></section>`+
 (done.length?`<section class="ep-card"><h2>Your sprints</h2><table class="ct-history"><thead><tr><th scope="col">Sprint</th><th scope="col">Date</th><th scope="col">Score</th><th scope="col">Time</th><th scope="col"><span class="ct-sr">Review</span></th></tr></thead><tbody>${done.map(s=>{const r=C.score(s);return `<tr><td>${r.number}</td><td>${day(r.startedAt)}</td><td><strong>${r.correct}</strong>/25</td><td>${Math.round(r.seconds/60)} min${r.auto?' (time ran out)':''}</td><td><button type="button" data-ct-review="${esc(s.id)}">Review</button></td></tr>`;}).join('')}</tbody></table>${topics.length?`<h3>By topic, all sprints</h3><ul class="ct-topics">${topics.map(x=>`<li><span>${esc(x.t)}</span><span>${x.correct}/${x.total}</span>${NEW[x.t]&&x.p<0.6?`<button type="button" data-lesson="${NEW[x.t]}">Revisit the lesson</button>`:''}</li>`).join('')}</ul>`:''}</section>`:'')+
 `<p class="ep-note ct-fine">Original questions in the contest format, not past AMC problems. Sprint answers are kept out of Mochi’s mastery records because a correct choice can be a guess.</p>`;
}

/* ---------- running sprint ---------- */
function sprint(S,s){
 const now=Date.now(),i=s.at,{q,labels}=C.sheet(s.items[i]),chosen=s.answers[i],flagged=s.flags.includes(i),answered=s.answers.filter(x=>x!==null).length,missing=C.COUNT-answered;
 return `<div class="ct-bar" role="group" aria-label="Sprint status"><span>Sprint ${s.number}</span><span class="ct-clock" id="ctClock" data-deadline="${s.deadline}" role="timer" aria-live="off">${mmss(s.deadline-now)}</span><span>${answered}/25 answered</span></div>`+
 `<nav class="ct-grid" aria-label="Questions">${s.items.map((_,j)=>`<button type="button" data-ct-go="${j}" class="${s.answers[j]!==null?'ct-done':''}${s.flags.includes(j)?' ct-flag':''}" ${j===i?'aria-current="step"':''} aria-label="Question ${j+1}${s.answers[j]!==null?', answered':''}${s.flags.includes(j)?', flagged':''}">${j+1}</button>`).join('')}</nav>`+
 `<article class="ep-card ct-question"><p class="ep-kicker">QUESTION ${i+1} OF 25</p><h1 id="epTitle" tabindex="-1" class="ct-sr">Sprint ${s.number}, question ${i+1}</h1>${figure(q)}<p class="ct-text">${esc(q.text)}</p>${q.suffix?`<p class="ep-note">Answer in ${esc(q.suffix==='°'?'degrees':q.suffix)}.</p>`:''}`+
 `<div class="ct-options" role="radiogroup" aria-label="Answer choices">${labels.map((l,j)=>`<button type="button" role="radio" aria-checked="${chosen===j}" data-ct-choice="${j}"><span class="ct-letter">${L[j]}</span><span>${esc(l)}</span></button>`).join('')}</div>`+
 `<div class="ct-actions"><button type="button" data-ct-go="${i-1}" ${i===0?'disabled':''}>← Previous</button><button type="button" data-ct-flag aria-pressed="${flagged}">${flagged?'⚑ Flagged':'Flag for later'}</button>${i<C.COUNT-1?`<button type="button" class="ep-primary" data-ct-go="${i+1}">Next →</button>`:''}</div></article>`+
 `<section class="ct-submit" aria-live="polite">${confirming?`<p>${missing?`${missing} ${missing===1?'question has':'questions have'} no answer yet. A guess costs nothing.`:'All 25 questions have an answer.'} Submit now?</p><button type="button" class="ep-primary" id="ctSubmitYes">Yes, submit</button> <button type="button" id="ctSubmitNo">Keep working</button>`:`<button type="button" id="ctSubmit">Finish and submit</button>`}</section>`;
}

/* ---------- review ---------- */
function review(S,s){
 const r=C.score(s),topics=Object.entries(r.byTopic).map(([t,v])=>({t,...v})).sort((a,b)=>a.correct/a.total-b.correct/b.total);
 return header(`Sprint ${r.number}: ${r.correct} out of 25`,'CONTEST PRACTICE · REVIEW')+
 `<section class="ep-card ct-summary"><p><strong>${r.correct} correct</strong> · ${r.answered} answered · ${Math.round(r.seconds/60)} minutes${r.auto?' (time ran out)':''}</p><p>Questions 1 to 13: ${r.firstHalf}/13 · Questions 14 to 25: ${r.secondHalf}/12</p><p class="ep-note">On the real AMC 8, a score of 15 or more earns the Achievement Roll for 6th grade and below. These are original practice questions, so this score is practice, not a prediction.</p></section>`+
 `<section class="ep-card"><h2>By topic</h2><ul class="ct-topics">${topics.map(x=>`<li><span>${esc(x.t)}</span><span>${x.correct}/${x.total}</span>${NEW[x.t]&&x.correct<x.total?`<button type="button" data-lesson="${NEW[x.t]}">Revisit the lesson</button>`:''}</li>`).join('')}</ul></section>`+
 `<section class="ep-card"><h2>Every question</h2><p class="ep-note">Open a question to see the worked solution. Try the missed ones again on paper before reading it.</p><ol class="ct-review">${r.results.map(x=>{const {q,labels}=C.sheet(s.items[x.index]);return `<li class="${x.correct?'ct-right':'ct-wrong'}"><details><summary><span class="ct-mark" aria-hidden="true">${x.correct?'✓':x.answered?'✗':'–'}</span> Question ${x.index+1} · ${esc(x.topic)} · ${x.answered?`you chose ${L[x.choice]} (${esc(labels[x.choice])})`:'no answer'}${x.correct?'':` · answer ${L[x.correctIndex]} (${esc(labels[x.correctIndex])})`}</summary>${figure(q)}<p class="ct-text">${esc(q.text)}</p><p class="ct-choices">${labels.map((l,j)=>`${L[j]}) ${esc(l)}`).join(' · ')}</p><ol class="ct-steps">${q.steps.map(t=>`<li>${esc(t)}</li>`).join('')}</ol>${!x.correct?`<button type="button" data-lesson="${esc(x.unit)}">Open the lesson for this topic</button>`:''}</details></li>`;}).join('')}</ol></section>`+
 `<div class="ct-actions"><button type="button" data-ct-home>Back to contest practice</button></div>`;
}

function html(S,id){
 const c=data(S);C.expire(c);const s=id&&c.sprints[id];
 if(!s){confirming=false;return overview(S);}
 return s.submittedAt?review(S,s):sprint(S,s);
}

/* ---------- cards elsewhere ---------- */
function paperCard(S){
 const c=data(S),open=C.running(c),last=C.list(c).filter(s=>s.submittedAt).at(-1),r=last&&C.score(last);
 return `<article class="ep-card ct-card"><h2>Contest practice · AMC 8 style</h2><p>25 multiple-choice questions · 40 min · no calculator</p><p>${open?`Sprint ${open.number} is running.`:r?`Last sprint: ${r.correct}/25.`:'No sprints yet.'} ${esc(C.CONTEST.name)} ${countdown()}.</p><button type="button" class="ep-primary" data-ct-open>${open?'Continue':'Open'}</button></article>`;
}
function homeCard(S){
 const g=C.suggestion(data(S));if(!g)return '';
 return `<section class="ep-card ct-card ct-home"><p class="ep-kicker">CONTEST PRACTICE</p><h2>${g.kind==='resume'?`Finish sprint ${g.number}`:`AMC 8 practice sprint ${g.number}`}</h2><p>${g.daysLeft} days to the ${esc(C.CONTEST.name)}. 25 questions, 40 minutes, no calculator.</p><button type="button" data-ct-open>${g.kind==='resume'?'Continue':'See the sprint'}</button></section>`;
}
function todayCard(S){
 const g=C.suggestion(data(S));if(!g)return '';
 return `<article class="today-wide-card today-mock"><p class="today-eyebrow">Contest practice</p><h3>${g.kind==='resume'?`Finish AMC 8 sprint ${g.number}`:`AMC 8 practice sprint ${g.number}`}</h3><p>25 multiple-choice questions in 40 minutes, no calculator. ${g.daysLeft} days to the contest. Original questions, not a prediction.</p><button type="button" id="todayContestOpen">${g.kind==='resume'?'Continue':'See the sprint'}</button></article>`;
}
function parent(S){
 const rep=C.report(data(S));
 return `<section class="ct-parent"><h4>AMC 8 contest practice</h4><p>${esc(C.CONTEST.label)} · ${countdown()}. ${rep.sprints.length?rep.sprints.slice(-5).map(s=>`Sprint ${s.number} (${s.date}): ${s.correct}/25 in ${s.minutes} min${s.timedOut?', time ran out':''}`).join('; ')+'.':'No sprints completed yet.'}</p>${Object.keys(rep.topics).length?`<p>By topic across sprints: ${Object.entries(rep.topics).map(([t,v])=>`${esc(t)} ${v.correct}/${v.total}`).join(', ')}.</p>`:''}<p>${esc(rep.limits)} The real contest’s Achievement Roll (6th grade and below) starts at 15/25.</p></section>`;
}
const signature=S=>{const c=S?.contest;return c?Object.values(c.sprints||{}).map(s=>s.id+':'+(s.submittedAt||0)).join('|'):'';};

/* ---------- events ---------- */
function wire(c){
 ctx=c;const {host,S,save,open,render}=c,cs=data(S),id=c.view?.paper,s=id&&cs.sprints[id];
 for(const b of host.querySelectorAll('[data-ct-open]'))b.onclick=()=>open('contest');
 for(const b of host.querySelectorAll('[data-ct-home]'))b.onclick=()=>open('contest');
 for(const b of host.querySelectorAll('[data-ct-review]'))b.onclick=()=>open('contest',b.dataset.ctReview);
 for(const b of host.querySelectorAll('[data-ct-start]'))b.onclick=()=>{const sp=C.start(cs);save();confirming=false;open('contest',sp.id);};
 if(!s||s.submittedAt)return;
 const act=fn=>{fn();save();render();};
 for(const b of host.querySelectorAll('[data-ct-choice]'))b.onclick=()=>act(()=>C.answer(cs,s.id,s.at,+b.dataset.ctChoice));
 for(const b of host.querySelectorAll('[data-ct-go]'))b.onclick=()=>act(()=>{C.go(cs,s.id,+b.dataset.ctGo);confirming=false;});
 for(const b of host.querySelectorAll('[data-ct-flag]'))b.onclick=()=>act(()=>C.flag(cs,s.id,s.at));
 if($('ctSubmit'))$('ctSubmit').onclick=()=>{confirming=true;render();$('ctSubmitYes')?.focus();};
 if($('ctSubmitNo'))$('ctSubmitNo').onclick=()=>{confirming=false;render();};
 if($('ctSubmitYes'))$('ctSubmitYes').onclick=()=>{C.submit(cs,s.id);confirming=false;save();render();$('epTitle')?.focus({preventScroll:false});};
}
/* Clock: once a second while a sprint is on screen; time-out submits and shows the review. */
function tick(){
 const el=$('ctClock');if(!el||!ctx)return;const left=+el.dataset.deadline-Date.now();el.textContent=mmss(left);el.classList.toggle('ct-low',left<5*60000);
 if(left<=0){C.expire(data(ctx.S));ctx.save();confirming=false;ctx.render();}
}
if(typeof setInterval==='function'&&typeof document!=='undefined')setInterval(tick,1000);
root.MochiContestUI={html,wire,paperCard,homeCard,todayCard,parent,signature,tick};
})(typeof window!=='undefined'?window:globalThis);
