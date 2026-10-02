/* Small visual building blocks shared by the Maths and Science screens: progress dots, the hint ladder,
   the number pad, paw-stamp feedback, lesson reveal and the skill-map trail. Presentation only. */
(function(root){
'use strict';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const PAW='<svg viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="6.5" cy="9" rx="1.9" ry="2.5"/><ellipse cx="10.5" cy="6.2" rx="1.9" ry="2.6"/><ellipse cx="14.5" cy="6.2" rx="1.9" ry="2.6"/><ellipse cx="18.3" cy="9" rx="1.9" ry="2.5"/><path d="M12.4 11.2c3 0 5.6 3.6 5.6 6 0 2.1-1.6 2.8-3.1 2.8-1.2 0-1.6-.6-2.5-.6s-1.4.6-2.6.6C8.3 20 7 19.3 7 17.2c0-2.4 2.4-6 5.4-6z"/></svg>';
const STEP_ICON=['📖','✏️','🔀','🧠','🏁'],STEP_NAME=['Learn','Try','New twist','Remember','Mixed'];
/* Five steps of a method as dots, with the learning goal on one short line. */
function masteryDots(P,progress,goal){
 if(!progress)return '';
 return `<section class="ux-steps" aria-label="Progress in this topic"><ol>${progress.steps.map((x,i)=>{const state=x.done?'done':i===progress.current?'now':'later';return `<li data-state="${state}"><span class="ux-dot" aria-hidden="true">${x.done?PAW:STEP_ICON[i]||'•'}</span><span class="ux-step-name">${esc(STEP_NAME[i]||x.label)}</span><span class="ux-sr">${state==='done'?'done':state==='now'?'now':'later'}</span></li>`;}).join('')}</ol>${goal?`<p class="ux-goal"><strong>Goal:</strong> ${esc(goal)}</p>`:''}</section>`;
}
/* Hints come one at a time: first the idea to use, then the first step. The full solution is separate. */
function hintBox(level,goal,steps){
 if(!level)return '';const out=[];
 if(level>=1&&goal)out.push(`<div class="ux-hint"><strong>Hint 1</strong><p>${esc(goal)}</p></div>`);
 if(level>=2&&steps?.[0])out.push(`<div class="ux-hint"><strong>Hint 2</strong><p>${esc(steps[0])}</p></div>`);
 return out.join('');
}
function hintLabel(level){return level===0?'Hint':level===1?'Another hint':'Show the solution';}
/* Number pad for touch screens, so the device keyboard does not cover the question. */
function keypad(P,pi=false){
 const keys=['7','8','9','4','5','6','1','2','3','0','.','/',' ',pi?'π':'−','⌫'];
 return `<div class="ux-keypad" id="${P}Keypad" hidden role="group" aria-label="Number pad">${keys.map(k=>`<button type="button" data-key="${esc(k)}" aria-label="${k===' '?'space':k==='⌫'?'delete':k==='/'?'fraction bar':k}">${k===' '?'␣':esc(k)}</button>`).join('')}<button type="button" data-key="kbd" class="ux-key-kbd" aria-label="Use the keyboard instead">⌨︎</button></div>`;
}
function wireKeypad(P,onChange){
 const pad=document.getElementById(P+'Keypad'),input=document.getElementById(P+'Answer');if(!pad||!input||input.disabled)return;
 let coarse=false;try{coarse=root.matchMedia?.('(pointer:coarse)').matches;}catch(_){}
 let useKeyboard=false;try{useKeyboard=root.localStorage?.getItem('mochi-keyboard')==='1';}catch(_){}
 if(!coarse||useKeyboard){pad.hidden=true;return;}
 pad.hidden=false;input.setAttribute('inputmode','none');
 for(const b of pad.querySelectorAll('[data-key]'))b.onclick=()=>{const k=b.dataset.key;
  if(k==='kbd'){try{root.localStorage?.setItem('mochi-keyboard','1');}catch(_){}pad.hidden=true;input.setAttribute('inputmode','text');input.focus();return;}
  const v=input.value;input.value=k==='⌫'?v.slice(0,-1):v+(k==='−'?'-':k);onChange?.();};
}
/* Paw stamps when an answer is right; a gentle shake when it is not yet right. */
function burst(fx){
 if(fx!=='correct'&&fx!=='solo')return '';
 return `<div class="ux-burst" aria-hidden="true">${Array.from({length:7},(_,i)=>`<span style="--i:${i}">${PAW}</span>`).join('')}</div>${fx==='solo'?'<p class="ux-badge">'+PAW+'Solved on your own</p>':''}`;
}
/* Progress through a method, for the skill-map rings: 0 to 1. */
const STAGE_ORDER=['Learn','Apply','Connect','Revisit after a week','Mixed-paper practice'];
function stageProgress(e){const i=STAGE_ORDER.indexOf(e.stage);return e.taught?Math.max(.08,i/ (STAGE_ORDER.length-1)):0;}
function trail(P,E,d,strandKey,nextId,now=Date.now()){
 const units=E.D.units.filter(u=>u.strand===strandKey);
 return `<ol class="ux-trail">${units.map((u,i)=>{const e=E.evidence(d,u.id,now),p=stageProgress(e),done=e.delayed>0||e.stage==='Mixed-paper practice',ready=u.prerequisites.every(id=>E.evidence(d,id,now).apply>=1),state=done?'done':u.id===nextId?'next':e.taught?'started':ready?'open':'later',star=u.extension||u.id.startsWith('sx-');
  return `<li data-state="${state}"><button type="button" class="ux-node" data-lesson="${u.id}" aria-label="${esc(u.title)}: ${state==='done'?'done':state==='next'?'next step':state==='started'?'in progress':'not started'}"><span class="ux-ring" style="--p:${p.toFixed(2)}"><span>${done?PAW:i+1}</span></span>${star?'<span class="ux-star" aria-hidden="true">★</span>':''}<span class="ux-node-name">${esc(u.title.replace(/^Challenge · /,''))}</span></button></li>`;}).join('')}</ol>`;
}
/* Mock papers placed on the months between now and the test. */
function mockTimeline(E,d,now=Date.now()){
 const plan=E.plan(d,now),[y,m,dd]=plan.testDate.split('-').map(Number),end=new Date(y,m-1,dd,12).getTime(),start=Math.min(now,(plan.mocks[0]?.at||now)-14*86400000),span=Math.max(1,end-start),pos=t=>Math.max(0,Math.min(100,100*(t-start)/span));
 const months=[];for(let t=new Date(new Date(start).getFullYear(),new Date(start).getMonth()+1,1).getTime();t<end;t=new Date(new Date(t).getFullYear(),new Date(t).getMonth()+1,1).getTime())months.push(t);
 return `<figure class="ux-timeline" aria-label="Mock papers before the selection test"><div class="ux-tl-track"><span class="ux-tl-fill" style="width:${pos(now)}%"></span>${months.map(t=>`<span class="ux-tl-month" style="left:${pos(t)}%">${new Date(t).toLocaleDateString(undefined,{month:'short'})}</span>`).join('')}${plan.mocks.map((x,i)=>`<span class="ux-tl-mock" data-status="${x.status}" style="left:${pos(x.at)}%" title="${esc(x.title)} · ${esc(x.date)}">${x.status==='done'?PAW:i+1}</span>`).join('')}<span class="ux-tl-now" style="left:${pos(now)}%" aria-hidden="true"></span><span class="ux-tl-test" style="left:100%">🏁</span></div><figcaption><span>Today</span><span>Mock papers</span><span>Selection test</span></figcaption></figure>`;
}
root.MochiUX={PAW,esc,masteryDots,hintBox,hintLabel,keypad,wireKeypad,burst,stageProgress,trail,mockTimeline};
if(typeof module!=='undefined')module.exports=root.MochiUX;
})(typeof window!=='undefined'?window:globalThis);
