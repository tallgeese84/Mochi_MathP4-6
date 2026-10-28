/* Small, offline-safe tutoring branches. Only the two pilot topics are affected. */
(function(root){
'use strict';
const P=root.MochiTutorPilot,esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const prefix=s=>s==='maths'?'ep':'sp';
function check(subject,E,v,q){return q.diagnostic||root.MochiPathCoach?.diagnostic(subject,v.unit,E,v.form);}
function representation(key,strategy,q){
 const p=q.params||{};
 if(strategy==='units')return '<p>Write the units beside each quantity. Distance divided by time must give a speed. Convert minutes to hours only when the other quantities use hours. Keep the relationship you already chose.</p>';
 if(strategy==='check-step')return '<p>You selected the relevant relationship. That does not prove every later step is right. Keep your method and compare your written setup with the quantities in the question. Then check the units and one calculation at a time.</p>';
 const table=(heads,rows)=>`<div class="tp-table-scroll"><table><thead><tr>${heads.map(x=>`<th>${esc(x)}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(x=>`<td>${esc(x)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
 if(key==='catch-up-gaps')return '<p>Track the gaps, rather than trying to find all three runners’ speeds. The gain of C over A equals the gain of C over B plus the gain of B over A. The two catch-up times are not consecutive parts of one journey.</p>'+table(['Pair','Starting gap','Time to close that gap','Gain each minute'],[['C catching B',p.gap1+' m',p.t1+' min',`${p.gap1} ÷ ${p.t1}`],['B catching A',p.gap2+' m',p.t2+' min',`${p.gap2} ÷ ${p.t2}`]])+(strategy==='table'?'<p>Write (C − B) + (B − A). The B terms cancel, leaving C − A. Now identify the whole starting gap from C to A.</p>':'<p>Sketch the initial order C → B → A. Label the two gaps. What gap must C close in total?</p>');
 if(key==='relative-approach')return '<p>In one minute, each walker removes part of the same gap. Put both distances into one picture before choosing an operation.</p>'+table(['One minute','First walker','Second walker'],[['Distance towards the other',p.a+' m',p.b+' m']])+'<p>The gap closes by both contributions together. Compare that one-minute change with the starting gap.</p>';
 if(key==='average-speed'||key==='average-with-stop')return '<p>Average speed uses the whole distance and the whole elapsed time. Equal distances do not mean equal travel times.</p>'+table(['Part','Distance','Elapsed time'],[['Outward','One leg','Leg distance ÷ outward speed'],['Return','One leg','Leg distance ÷ return speed'],...(key==='average-with-stop'?[['Stop','0 km','Include the rest in hours']]:[])])+(strategy==='table'?'<p>Write the total-time expression first. Check that every term is in hours before combining them.</p>':'<p>Sketch a timeline for the outward trip, any stop, and the return. Use the full timeline, not the mean of two speeds.</p>');
 if(key==='drone-time')return '<p>The walkers and the drone share one elapsed time: from the start until the walkers meet. Find that time from the closing gap. The drone’s many turns do not change how long it flies.</p>';
 if(key==='mirror-normal')return '<div class="tp-reference" role="img" aria-label="Reference-line reminder: the normal is perpendicular to the mirror. This is not a scale drawing of the question."><span>Normal ↕</span><strong>Mirror ━━━━━━━</strong><small>Normal and mirror form 90°.</small></div>'+(strategy==='table'?table(['Angle named in the question','Reference line'],[['Angle to the surface','Mirror'],['Incidence and reflection angles','Normal']])+'<p>First decide which line the given angle uses. Only convert it when the given reference is the surface. Then compare the incident and reflected angles using the same normal.</p>':'<p>Mark the normal before marking any angle. It is at right angles to the mirror. An angle to the surface and an angle to the normal share that right angle; they are not interchangeable.</p>');
 if(key==='shadow-size')return '<p>Keep track of which object moves. Draw straight rays from the source past the card’s two edges to the fixed screen.</p>'+(strategy==='table'?table(['Keep fixed','Change','Compare'],[['Source and screen','Card distance from source','Spread of the edge rays at the screen']]):'<p>Compare two card positions on the same sketch. Do not assume that “closer” means the same thing for the source and the screen.</p>');
 return '<p>Trace the path in order: a source gives out light, an object reflects some of it, and that reflected light enters the eye. The eye does not send out the light that illuminates the object.</p>';
}
function panel(subject,E,d,v,a){
 const q=E.question(v);if(!P.eligible(subject,v,q)||!a||v.revealed)return null;
 const id=prefix(subject),own=P.current(d,v.id),probe=own.find(x=>x.kind==='diagnostic');
 if(a.correct){if(!probe&&!own.some(e=>['support','ai-note'].includes(e.kind)))return '';return `<aside class="tp-panel" aria-label="Learning follow-up"><strong>Nice work finishing this problem.</strong><p>On a later example, try explaining the idea without the help. Keep your usual study time—there is no extra homework here.</p></aside>`;}
 if(!probe){
  if(a.responses.length!==1)return '';
  const c=check(subject,E,v,q);if(!c)return '';
  return `<aside class="tp-panel" id="${id}TutorPilot"><p class="${id}-kicker">FIND THE NEXT TEACHING STEP</p><strong>${esc(c.prompt)}</strong><div class="tp-choices">${c.choices.map((x,i)=>`<button type="button" data-tp-choice="${i}">${esc(x)}</button>`).join('')}</div><p class="${id}-note">This quick check is not another score. Your choice helps select an explanation.</p></aside>`;
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
 if(!P.eligible(subject,v,q)||!['representation','units','check-step'].includes(note.nextAction))return;
 if(note.nextAction==='units'&&subject!=='maths')return;
 const strategy=note.nextAction==='representation'?'diagram':note.nextAction;
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
 return `<section class="tp-parent"><h3>Automatic AI teaching · ${subject==='maths'?'Motion':'Light'}</h3><label><input type="checkbox" id="${p}AutoEnabled" ${checked}> Offer one automatic AI coaching turn after an incorrect answer</label><p>Uses the existing connected AI provider. Maximum ${P.AUTO_DAILY_LIMIT} requests per subject per Chicago day. Only current question, typed working and bounded skill history are sent. You can pause this here. No automatic help in tests, redos, recall or adult-marked writing.</p>${rows.length?'<h3>What changed after teaching?</h3>'+rows.map(s=>'<p>'+esc(s)+'</p>').join('')+'<p>These observations do not prove teaching caused improvement. Written science remains for grown-up review.</p>':''}</section>`;
}
function wireParent(subject,d,persist){const c=document.getElementById(prefix(subject)+'AutoEnabled');if(c)c.onchange=()=>{P.setAuto(d,c.checked);persist();};}

root.MochiTutorPilotUI={panel,wire,status,parent,representation,offerAI,proactive,wireParent};
})(typeof globalThis!=='undefined'?globalThis:this);
