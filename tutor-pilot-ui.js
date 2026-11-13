/* Offline-safe tutoring branches for Motion, Ratios, Two conditions, Percentages, Light and Circuits. */
(function(root){
'use strict';
const P=root.MochiTutorPilot,esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const prefix=s=>s==='maths'?'ep':'sp';
function check(subject,E,v,q){return q.diagnostic||root.MochiPathCoach?.diagnostic(subject,v.unit,E,v.form);}
// v7.10 checked built-in aids for Ratios, Two conditions and Percentages. They name the relationship
// and a representation; they never give the answer. They work offline and without an AI key.
const MATHS_AIDS={
 'ratio-units':'Draw equal boxes for each part of the ratio. Point to the boxes the given number belongs to: one colour, the total or the difference. Then find what one box is worth.',
 'ratio-fixed-part':'Find the colour that does not change. Rename both ratios so that colour has the same number of parts. Then the change in the other colour, in parts, matches the counters added.',
 'ratio-equal-additions':'Both colours get the same number of counters, so the difference between them stays the same. Rename the ratios so the difference is the same number of parts. Then count how many parts red grew by.',
 'ratio-weighted-groups':'The two fractions belong to different groups, so do not average them. Make a table with members and non-members for each group, then add the columns.',
 'ratio-moving-total':'Moving counters from one box to the other keeps the total the same. Write each box as a fraction of the total, before and after.',
 'assume-all':'Suppose every one were the first kind. Work out the total that would give, and compare it with the real total. Each swap to the other kind changes the total by the same amount.',
 'compare-conditions':'Write each condition in its own row. Make one item appear the same number of times in both rows. Then compare the rows: the difference comes from the other item only.',
 'coin-replacement':'Undo the replacements first to find the value at the start. Then suppose every coin was the smaller coin and compare with that value.',
 'pair-totals':'Add all the pair totals. Every item has been counted twice, so half of that sum is all three together.',
 'age-difference':'Everyone gets older by the same number of years, so the difference in ages never changes. Draw that difference as units, before and after.',
 'percent-change':'Ask: a percentage of what? Find that part of the starting amount, then decide whether to add it or take it away.',
 'reverse-percent':'After the change, the amount you know is the remaining percentage, not 100%. Find 1% first, then 100%.',
 'successive-percent':'The second change acts on the new amount, not the original. Work backwards one change at a time.',
 'percent-two-wholes':'Each percentage belongs to its own group. Work out each group’s new number separately before adding them.',
 'percent-order':'Follow each shop step by step. When the discount comes after the voucher, how much of the voucher is really saved?'
};
function mathsAid(key,strategy,q){
 const p=q.params||{},t=(heads,rows)=>`<div class="tp-table-scroll"><table><thead><tr>${heads.map(x=>`<th>${esc(x)}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(x=>`<td>${esc(x)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
 if(strategy==='units')return '<p>Write what each number stands for (counters, dollars, years or parts) beside it. Keep parts and actual amounts apart until you know the value of one part.</p>';
 let extra='';
 if(key==='ratio-equal-additions'&&p.a&&p.c)extra=t(['','Red','Blue','Difference'],[['Before',p.a,p.b,p.b-p.a+' part(s)'],['After',p.c,p.d,p.d-p.c+' part(s)']])+'<p>Make the Difference column match first.</p>';
 else if(key==='ratio-weighted-groups')extra=t(['Group','Members','Non-members'],[['Group A','?','?'],['Group B','?','?'],['Both groups','add','add']]);
 else if(key==='reverse-percent'&&p.rate&&p.paid)extra=t(['Percentage','Amount'],[[(100-p.rate)+'%','$'+p.paid],['1%','?'],['100%','?']]);
 else if(key==='compare-conditions')extra=t(['Condition','First item','Second item','Total'],[['1','…','…','…'],['2','…','…','…']]);
 return `<p>${esc(MATHS_AIDS[key])}</p>${strategy==='table'||strategy==='diagram'?extra:''}`;
}
function representation(key,strategy,q){
 const p=q.params||{};
 if(MATHS_AIDS[key])return mathsAid(key,strategy,q);
 if(strategy==='units')return '<p>Write the units beside each quantity. Distance divided by time must give a speed. Convert minutes to hours only when the other quantities use hours. Keep the relationship you already chose.</p>';
 if(strategy==='check-step')return '<p>You selected the relevant relationship. That does not prove every later step is right. Keep your method and compare your written setup with the quantities in the question. Then check the units and one calculation at a time.</p>';
 const table=(heads,rows)=>`<div class="tp-table-scroll"><table><thead><tr>${heads.map(x=>`<th>${esc(x)}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(x=>`<td>${esc(x)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
 if(key==='catch-up-gaps')return '<p>Track the gaps, rather than trying to find all three runners’ speeds. The gain of C over A equals the gain of C over B plus the gain of B over A. The two catch-up times are not consecutive parts of one journey.</p>'+table(['Pair','Starting gap','Time to close that gap','Gain each minute'],[['C catching B',p.gap1+' m',p.t1+' min',`${p.gap1} ÷ ${p.t1}`],['B catching A',p.gap2+' m',p.t2+' min',`${p.gap2} ÷ ${p.t2}`]])+(strategy==='table'?'<p>Write (C − B) + (B − A). The B terms cancel, leaving C − A. Now identify the whole starting gap from C to A.</p>':'<p>Sketch the initial order C → B → A. Label the two gaps. What gap must C close in total?</p>');
 if(key==='relative-approach')return '<p>In one minute, each walker removes part of the same gap. Put both distances into one picture before choosing an operation.</p>'+table(['One minute','First walker','Second walker'],[['Distance towards the other',p.a+' m',p.b+' m']])+'<p>The gap closes by both contributions together. Compare that one-minute change with the starting gap.</p>';
 if(key==='average-speed'||key==='average-with-stop')return '<p>Average speed uses the whole distance and the whole elapsed time. Equal distances do not mean equal travel times.</p>'+table(['Part','Distance','Elapsed time'],[['Outward','One leg','Leg distance ÷ outward speed'],['Return','One leg','Leg distance ÷ return speed'],...(key==='average-with-stop'?[['Stop','0 km','Include the rest in hours']]:[])])+(strategy==='table'?'<p>Write the total-time expression first. Check that every term is in hours before combining them.</p>':'<p>Sketch a timeline for the outward trip, any stop, and the return. Use the full timeline, not the mean of two speeds.</p>');
 if(key==='drone-time')return '<p>The walkers and the drone share one elapsed time: from the start until the walkers meet. Find that time from the closing gap. The drone’s many turns do not change how long it flies.</p>';
 if(key==='circuit-series')return '<p>Trace a continuous route, beginning at one battery terminal, through each bulb and back to the other terminal. An open switch makes a gap in the route: it does not let current leak out.</p>'+(strategy==='table'?table(['Trace','Question to ask'],[['Supply','Where does the path leave the battery?'],['Bulbs','Does the route pass through every bulb?'],['Return','Can it get back without a gap?']]):'<p>Draw the route with one line. Can your pencil return to the battery without lifting?</p>');
 if(key==='circuit-parallel'||key==='circuit-common')return '<p>There may be more than one complete route from one battery terminal to the other. Trace the route through each bulb independently; a gap is a break, not a place where electricity escapes.</p>'+table(['Path','Follow it both ways'],[['Bulb A','Battery → branch A → shared return → battery'],['Bulb B','Battery → branch B → shared return → battery']])+(strategy==='table'?'<p>Now circle the broken wire. Decide which of the two routes uses it.</p>':'<p>Does the gap belong to one route, or to a wire shared by both? Trace rather than guess.</p>');
 if(key==='mirror-normal')return '<div class="tp-reference" role="img" aria-label="Reference-line reminder: the normal is perpendicular to the mirror. This is not a scale drawing of the question."><span>Normal ↕</span><strong>Mirror ━━━━━━━</strong><small>Normal and mirror form 90°.</small></div>'+(strategy==='table'?table(['Angle named in the question','Reference line'],[['Angle to the surface','Mirror'],['Incidence and reflection angles','Normal']])+'<p>First decide which line the given angle uses. Only convert it when the given reference is the surface. Then compare the incident and reflected angles using the same normal.</p>':'<p>Mark the normal before marking any angle. It is at right angles to the mirror. An angle to the surface and an angle to the normal share that right angle; they are not interchangeable.</p>');
 if(key==='shadow-size')return '<p>Keep track of which object moves. Draw straight rays from the source past the card’s two edges to the fixed screen.</p>'+(strategy==='table'?table(['Keep fixed','Change','Compare'],[['Source and screen','Card distance from source','Spread of the edge rays at the screen']]):'<p>Compare two card positions on the same sketch. Do not assume that “closer” means the same thing for the source and the screen.</p>');
 return '<p>Trace the path in order: a source gives out light, an object reflects some of it, and that reflected light enters the eye. The eye does not send out the light that illuminates the object.</p>';
}
function panel(subject,E,d,v,a){
 const q=E.question(v);if(!P.eligible(subject,v,q)||!a||v.revealed)return null;
 const id=prefix(subject),own=P.current(d,v.id),probe=own.find(x=>x.kind==='diagnostic');
 if(a.correct){if(!probe&&!own.some(e=>['support','ai-note'].includes(e.kind)))return '';return `<aside class="tp-panel" aria-label="Learning follow-up"><strong>Nice work finishing this problem.</strong><p>On a later example, try explaining the idea without the help. Keep your usual study time—there is no extra homework here.</p></aside>`;}
 if(!probe){
  const c=check(subject,E,v,q);if(!c)return '';
  return `<aside class="tp-panel" id="${id}TutorPilot"><p class="${id}-kicker">FIND THE NEXT TEACHING STEP</p><strong>${esc(c.prompt)}</strong><div class="tp-choices">${c.choices.map((x,i)=>`<button type="button" data-tp-choice="${i}">${esc(x)}</button>`).join('')}</div><p class="${id}-note">${a.responses.length>1?'A different approach is better than another guess. ':''}This quick check is not another score. Your choice helps select an explanation.</p></aside>`;
 }
 const next=P.decision(d,subject,v,q),alternate=own.some(e=>e.kind==='support'&&e.strategy==='table'),strategy=next.strategy|| (probe.choice===probe.correctChoice?'check-step':alternate?'table':'diagram');
 return `<aside class="tp-panel" id="${id}TutorPilot" aria-live="polite"><strong>${esc(next.title)}</strong><p>Your first quick-check choice: ${esc(probe.choices[probe.choice])}</p><p>${probe.choice===probe.correctChoice?'That choice fits this relationship.':'Let’s check the relationship before doing the calculation.'}</p>${next.kind==='pause'?'<p>Repeating the same instruction is unlikely to clarify the sticking point. Use the checked worked solution or discuss this example with a grown-up. Your saved work stays here; you do not owe extra study time.</p>':representation(P.spec(subject,q).key,strategy,q)}<div class="tp-choices">${!alternate?'<button type="button" data-tp-alternate>Show a different representation</button>':''}${subject==='maths'?'<button type="button" data-tp-units>Check the units instead</button>':''}</div><p class="${id}-note">Use this to revise your working when you are ready.</p></aside>`;
}
function wire(subject,E,d,host,{capture,persist,refresh}){
 const v=d.draft;if(!v)return false;const q=E.question(v);if(!P.eligible(subject,v,q))return false;
 const box=host.querySelector('#'+prefix(subject)+'TutorPilot');if(!box)return true;
 for(const b of box.querySelectorAll('[data-tp-choice]'))b.onclick=()=>{
  capture();const c=check(subject,E,v,q),e=P.diagnostic(d,subject,v,q,c,Number(b.dataset.tpChoice));if(!e)return;
  E.help(d);P.support(d,subject,v,q,e.choice===e.correctChoice?'check-step':'diagram');persist();refresh();
 };
 const alt=box.querySelector('[data-tp-alternate]');if(alt)alt.onclick=()=>{capture();E.help(d);P.support(d,subject,v,q,'table');persist();refresh();};
 const units=box.querySelector('[data-tp-units]');if(units)units.onclick=()=>{capture();E.help(d);P.support(d,subject,v,q,'units');persist();const note=document.createElement('div');note.innerHTML=representation(P.spec(subject,q).key,'units',q);units.replaceWith(note);};
 return true;
}
function status(subject,E,d){
 const v=d.draft;if(!v||!P.eligible(subject,v,E.question(v)))return '';
 const last=P.current(d,v.id).filter(e=>e.kind==='provider').at(-1),s=last?.reasonCode;
 const label=s==='LIVE_AI_SCHEMA_CHECKED'?(last.mode==='automatic'?'Live AI · automatic teaching guidance':'Live AI · provisional teaching guidance'):s==='LIVE_AI_UNSTRUCTURED'?'Built-in guide · AI response could not be checked':s==='LIVE_AI_FAILED'?'Built-in guide · AI connection failed':s==='BUILT_IN_NOT_CONNECTED'?'Built-in guide · live AI not connected':s==='AUTO_STARTED'?'Preparing automatic AI help':'Teaching source shown after you ask';
 return `<p class="tp-status" id="${prefix(subject)}PilotStatus">${esc(label)}</p>`;
}
// The model may suggest only a checked teaching aid, never a navigation or score action.
function offerAI(subject,E,d,v,q,note,out,{capture,persist}){
 const previous=out.parentElement?.querySelector('[data-tp-ai-aid]');if(previous)previous.remove();
 if(!P.eligible(subject,v,q))return;
 if(note.nextAction==='units'&&subject!=='maths')return;
 const strategy=note.nextAction==='units'?'units':note.nextAction==='check-step'?'check-step':'diagram';
 const box=document.createElement('div');box.dataset.tpAiAid='';box.className='tp-ai-aid';
 const b=document.createElement('button');b.type='button';b.className='tp-ai-aid-button';
 b.textContent=strategy==='diagram'?'Try a relationship sketch':strategy==='units'?'Check the units':'Check my next step';
 b.onclick=()=>{if(d.draft?.id!==v.id)return;capture();E.help(d);P.support(d,subject,v,q,strategy,Date.now(),'live-ai-provisional-suggestion');persist();box.innerHTML=representation(P.spec(subject,q).key,strategy,q);};
 box.appendChild(b);out.after(box);
}
function proactive(subject,E,d){
 const v=d.draft,q=v&&E.question(v),a=d.attempts?.find(x=>x.id===v?.id);
 if(!P.autoEnabled(d))return '';
 if(!P.eligible(subject,v,q)||!a||a.correct||v.revealed||v.phase==='recall'||q.kind==='written')return '';
 const own=P.current(d,v.id),started=own.find(x=>x.kind==='provider'&&x.reasonCode==='AUTO_STARTED'),note=own.filter(x=>x.kind==='ai-note'&&x.mode==='automatic').at(-1);
 const label=note?'Mochi noticed a tricky step':started?'Mochi can help without being asked':'Mochi’s quick check can help';
 return `<aside class="tp-proactive" id="${prefix(subject)}Proactive" aria-label="Automatic AI tutoring"><strong>${esc(label)}</strong><p id="${prefix(subject)}ProactiveReply" role="status" aria-live="polite">${note?esc(note.reply):started?'The automatic suggestion was interrupted. You can still use the quick check or Ask Mochi.':'With live AI connected, Mochi can suggest one next step without being asked.'}</p></aside>`;
}
function parent(subject,E,d){
 const rows=P.narrative(E,d,subject),p=prefix(subject),checked=P.autoEnabled(d)?'checked':'';
 return `<section class="tp-parent"><h3>Automatic AI teaching · all topics</h3><p>After a first wrong answer, Mochi offers one next step without being asked (at most three a day per subject). ${subject==='maths'?'Motion, Ratios, Two conditions and Percentages':'Light and Circuits'} also get a quick check and a checked teaching aid. Replies never state the answer, and each one is recorded as help.</p><p class="tp-connection"><strong>${typeof keyReady==='function'&&keyReady()?'AI provider: connected on this tablet.':'AI provider: not connected on this tablet.'}</strong> ${typeof keyReady==='function'&&keyReady()?'Automatic and Ask Mochi help can use live AI.':'Mochi uses the built-in guide only. Add a key under Grown-ups → Tutor on this tablet to turn on live help.'}</p><label><input type="checkbox" id="${p}AutoEnabled" ${checked}> Offer one automatic AI coaching turn after an incorrect answer</label><p>Uses the existing connected AI provider. Maximum ${P.AUTO_DAILY_LIMIT} requests per subject per Chicago day. Only current question, typed working and bounded skill history are sent. You can pause this here. No automatic help in tests, redos, recall or adult-marked writing.</p>${rows.length?'<h3>What changed after teaching?</h3>'+rows.map(s=>'<p>'+esc(s)+'</p>').join('')+'<p>These observations do not prove teaching caused improvement. Written science remains for grown-up review.</p>':''}</section>`;
}
function wireParent(subject,d,persist){const c=document.getElementById(prefix(subject)+'AutoEnabled');if(c)c.onchange=()=>{P.setAuto(d,c.checked);persist();};}

root.MochiTutorPilotUI={panel,wire,status,parent,representation,offerAI,proactive,wireParent};
})(typeof globalThis!=='undefined'?globalThis:this);
