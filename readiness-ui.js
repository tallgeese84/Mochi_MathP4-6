/* Shared pieces for DSA readiness on the Maths and Science paths: the test-date countdown, the pacing
   plan, mistake tags, mock-paper cards and the grown-up summary. Presentation only; the path engines own
   every record. P is the screen prefix ('ep' for maths, 'sp' for science). */
(function(root){
'use strict';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const TAG_LABEL={misread:'I misread it',method:'Wrong method',calculation:'Calculation slip',time:'Rushed or ran out of time',unsure:'Not sure yet'};
const STATUS={covered:'Every method has been practised in a changed form.',starting:'Just getting started: the pace estimate appears after four weeks.','on-track':'On track for the test date.','a-little-behind':'A little behind the pace needed.',behind:'Behind the pace needed: consider more study days or fewer new lessons per day.'};
const DAY=86400000;
function niceDate(key){const [y,m,d]=String(key).split('-').map(Number);if(!y)return '';return new Date(y,m-1,d,12).toLocaleDateString(undefined,{day:'numeric',month:'short',year:'numeric'});}
/* Header badge: weeks to the selection test rather than a fixed month. */
function countdown(P,E,d,now=Date.now()){
 const p=E.plan(d,now);return `<span class="${P}-target">${p.weeksLeft} weeks<br><small>to the selection test · ${esc(niceDate(p.testDate))}</small></span>`;
}
/* One line for Euna: how much is left and the next mock. No "behind" judgement on her screen. */
function planStrip(P,E,d,now=Date.now()){
 const p=E.plan(d,now),next=p.mocks.find(m=>m.status!=='done');
 return `<div class="${P}-evidence-strip rd-plan"><span><strong>${p.remaining}</strong>methods still to try in a new twist · about ${Math.max(1,Math.ceil(p.perWeek))} a week</span>${next?`<span><strong>${esc(next.title)}</strong>${next.status==='due'?'ready now':next.status==='started'?'in progress':esc(niceDate(next.date))}</span>`:''}</div>`;
}
function mockCard(P,E,d,now=Date.now()){
 const m=E.dueMock(d,now);if(!m)return '';
 return `<section class="${P}-card rd-mock" aria-label="Mock paper ready"><p class="${P}-kicker">MOCK PAPER READY</p><h2>${esc(m.title)}</h2><p>${m.minutes} minutes, no calculator, no hints. Best on a weekend with a quiet table. The score is for comparing with your next mock, not a prediction.</p><button data-start-paper="${esc(m.id)}" class="${P}-primary">Start when ready</button></section>`;
}
/* Shown after a missed first try: Euna picks what went wrong. It shapes her redo and the grown-up view. */
function tagChips(P,E,d,attempt){
 if(!attempt||attempt.firstCorrect||attempt.skipped||attempt.phase==='guided'||attempt.phase==='redo')return '';const tag=d.errors?.[attempt.id]?.tag||'';
 return `<div class="rd-tags" data-rd-attempt="${esc(attempt.id)}"><p><strong>What went wrong the first time?</strong> It comes back in a few days for a second look.</p><div>${E.TAGS.map(t=>`<button type="button" data-rd-tag="${t}" aria-pressed="${t===tag}">${esc(TAG_LABEL[t])}</button>`).join('')}</div></div>`;
}
function wireTags(host,E,d,save){
 for(const box of host.querySelectorAll('[data-rd-attempt]'))for(const b of box.querySelectorAll('[data-rd-tag]'))b.onclick=()=>{if(E.tagError(d,box.dataset.rdAttempt,b.dataset.rdTag)){for(const x of box.querySelectorAll('[data-rd-tag]'))x.setAttribute('aria-pressed',String(x===b));save();}};
}
function paperMeta(P,E,d,p,now=Date.now()){
 if(p.kind!=='mock')return '';const m=E.mockSchedule(d,now).find(x=>x.id===p.id);if(!m)return '';
 return `<p class="${P}-note">${p.marks?p.marks.reduce((a,b)=>a+b,0)+' marks · ':''}${m.status==='upcoming'?'Planned for '+esc(niceDate(m.date)):m.status==='due'?'Ready now':m.status==='started'?'In progress':'Done'}</p>`;
}
/* First-try accuracy and help rate by strand, last four weeks against the four weeks before. */
function strandStats(E,d,now=Date.now()){
 const rows=Object.entries(E.D.strands).map(([k,title])=>({key:k,title,recent:{n:0,first:0,help:0},before:{n:0,first:0,help:0}}));
 for(const a of d.attempts){if(a.skipped||a.mode!=='practice'||a.phase==='guided'||a.phase==='redo')continue;const age=now-a.answeredAt,bucket=age<=28*DAY?'recent':age<=56*DAY?'before':null;if(!bucket)continue;const r=rows.find(x=>x.key===E.unit(a.unit)?.strand);if(!r)continue;r[bucket].n++;r[bucket].first+=a.firstCorrect?1:0;r[bucket].help+=a.helped||a.revealed?1:0;}
 return rows;
}
const pct=(a,b)=>b?Math.round(100*a/b)+'%':'–';
function parentSection(P,E,d,now=Date.now()){
 const p=E.plan(d,now),stats=strandStats(E,d,now),errors=E.errorLog(d,now,56),byTag={};for(const e of errors)byTag[e.tag||'untagged']=(byTag[e.tag||'untagged']||0)+1;
 const pending=errors.filter(e=>!e.redoneAt).length,mocks=p.mocks;
 return `<section class="rd-parent"><h3>Selection-test readiness</h3>
 <p><strong>${p.weeksLeft} weeks</strong> to ${esc(niceDate(p.testDate))}. ${p.secure}/${p.total} methods practised in a changed form; ${p.remaining} to go, about ${p.perWeek} a week (the last six weeks are kept for full papers). Recent pace: ${p.recentRate} a week. <strong>${esc(STATUS[p.status])}</strong>${p.parked.length?` Set aside for a few days after repeated misses: ${p.parked.map(id=>esc(E.unit(id).title)).join(', ')}.`:''}${p.due?` ${p.due} method${p.due===1?' is':'s are'} due for review.`:''}</p>
 <label>Selection-test date <input type="date" id="${P}TestDate" value="${esc(p.testDate)}"></label> <button id="${P}SaveTestDate">Save date</button><p class="${P}-note" id="${P}TestDateStatus" role="status">Last year's tests were on the first Saturday of July. Check the NUS High admissions page when the 2027 dates are announced.</p>
 <div class="${P}-table-wrap"><table><thead><tr><th>Strand</th><th>First-try correct (last 4 weeks)</th><th>Help used</th><th>Previous 4 weeks</th></tr></thead><tbody>${stats.map(r=>`<tr><td>${esc(r.title)}</td><td>${pct(r.recent.first,r.recent.n)} <small>(${r.recent.n})</small></td><td>${pct(r.recent.help,r.recent.n)}</td><td>${pct(r.before.first,r.before.n)} <small>(${r.before.n})</small></td></tr>`).join('')}</tbody></table></div>
 <p><strong>Mistakes (last 8 weeks):</strong> ${errors.length?Object.entries(byTag).map(([k,n])=>`${esc(TAG_LABEL[k]||'Not yet tagged')}: ${n}`).join(' · '):'none recorded'}. ${pending} waiting for a second look.</p>
 ${errors.length?`<details><summary>Recent mistakes</summary><ul>${errors.slice(0,12).map(e=>`<li>${esc(new Date(e.at).toLocaleDateString())} · ${esc(e.title)} · ${e.mode==='practice'?esc(e.phase):esc(e.mode)} · answered “${esc(e.answer)}”${e.tag?' · '+esc(TAG_LABEL[e.tag]):''}${e.redoneAt?' · fixed on a second look':''}</li>`).join('')}</ul></details>`:''}
 <p><strong>Mock papers:</strong></p><ul>${mocks.map(m=>`<li>${esc(m.title)} · ${esc(niceDate(m.date))} · ${m.score?`${m.score.marks}/${m.score.markTotal} (${Math.round(m.score.percent)}%)${m.score.timed&&m.score.independent?'':' · supported or overtime'}`:esc(m.status)}</li>`).join('')}</ul>
 <p class="${P}-note">Mocks are original practice in a reported format, not the school's paper. Compare them with each other over time; no admission chance is calculated.</p></section>`;
}
function wireParent(P,E,d,save,repaint){
 const b=document.getElementById(P+'SaveTestDate');if(!b)return;b.onclick=()=>{const v=document.getElementById(P+'TestDate').value;const state=typeof S!=='undefined'?S:null,other=P==='ep'?state?.sciencePath:state?.entrance,OE=P==='ep'?root.MochiSciencePath:root.MochiEntrance;
  if(!E.setTestDate(d,v)){document.getElementById(P+'TestDateStatus').textContent='Choose a valid date.';return;}
  // Keep both subjects on the same date.
  if(other&&OE)OE.setTestDate(other,v);save();repaint?.();};
}
root.MochiReadinessUI={countdown,planStrip,mockCard,tagChips,wireTags,paperMeta,strandStats,parentSection,wireParent,niceDate,TAG_LABEL};
if(typeof module!=='undefined')module.exports=root.MochiReadinessUI;
})(typeof window!=='undefined'?window:globalThis);
