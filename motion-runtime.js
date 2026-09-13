/* Mochi v4.3.0 — reliable home motion using the Web Animations API.
   This deliberately does not depend on CSS keyframes or prefers-reduced-motion,
   because the family explicitly enabled motion for Mochi's home quest. */
(function(){
'use strict';
const VERSION='4.3.0';
const FLAG='mochi_motion';
try{if(!localStorage.getItem(FLAG))localStorage.setItem(FLAG,'on');}catch(e){}
function enabled(){try{return localStorage.getItem(FLAG)!=='off';}catch(e){return true;}}
function loop(el,frames,opts){
  if(!el||el.dataset.mochiWaapi==='1')return;
  el.dataset.mochiWaapi='1';
  try{el.animate(frames,{duration:opts.duration||3000,iterations:Infinity,direction:opts.direction||'normal',easing:opts.easing||'ease-in-out',delay:opts.delay||0});}catch(e){}
}
function animateScene(){
  if(!enabled())return;
  const host=document.getElementById('mochiFocusHome');if(!host)return;
  const scene=host.querySelector('.quest-scene');if(!scene)return;
  loop(scene.querySelector('.quest-euna'),[{transform:'translateY(0) rotate(-1deg)'},{transform:'translateY(-12px) rotate(1.5deg)'},{transform:'translateY(0) rotate(-1deg)'}],{duration:3200});
  loop(scene.querySelector('.quest-mochi'),[{transform:'translateY(0) rotate(1deg)'},{transform:'translateY(-15px) rotate(-2deg)'},{transform:'translateY(0) rotate(1deg)'}],{duration:2600,delay:180});
  loop(scene.querySelector('.qv-wheel'),[{transform:'rotate(-7deg)'},{transform:'rotate(14deg)'},{transform:'rotate(-7deg)'}],{duration:3800});
  scene.querySelectorAll('.qv-bead,.qv-counter,.qv-dot').forEach((el,i)=>loop(el,[{transform:'translateY(0) scale(1)'},{transform:`translateY(${i%2?-13:-18}px) scale(1.12)`},{transform:'translateY(0) scale(1)'}],{duration:1500+i*170,delay:i*120}));
  loop(scene.querySelector('.qv-balance'),[{transform:'rotate(-5deg)'},{transform:'rotate(6deg)'},{transform:'rotate(-5deg)'}],{duration:2800});
  loop(scene.querySelector('.qv-ruler'),[{transform:'translateX(-8px) rotate(-8deg)'},{transform:'translateX(15px) rotate(-1deg)'},{transform:'translateX(-8px) rotate(-8deg)'}],{duration:3000});
  loop(scene.querySelector('.qv-compass'),[{transform:'rotate(-9deg)'},{transform:'rotate(10deg)'},{transform:'rotate(-9deg)'}],{duration:3300});
  loop(scene.querySelector('.qv-angle'),[{transform:'scale(.92)',opacity:.65},{transform:'scale(1.12)',opacity:1},{transform:'scale(.92)',opacity:.65}],{duration:1800});
  loop(scene.querySelector('.qv-water'),[{transform:'translateX(-9px)'},{transform:'translateX(10px)'},{transform:'translateX(-9px)'}],{duration:2400});
  scene.querySelectorAll('.qv-bar').forEach((el,i)=>loop(el,[{transform:'scaleY(.72)'},{transform:'scaleY(1.08)'},{transform:'scaleY(.72)'}],{duration:2100+i*250,delay:i*130}));
  loop(scene.querySelector('.qv-token'),[{transform:'translate(-30px,12px) rotate(-10deg)'},{transform:'translate(42px,-22px) rotate(14deg)'},{transform:'translate(-30px,12px) rotate(-10deg)'}],{duration:3100});
  loop(scene.querySelector('.qv-gate'),[{transform:'scale(.94)',opacity:.7},{transform:'scale(1.08)',opacity:1},{transform:'scale(.94)',opacity:.7}],{duration:1700});
  loop(scene.querySelector('.qv-lens'),[{transform:'translate(-18px,10px) rotate(-8deg)'},{transform:'translate(23px,-10px) rotate(8deg)'},{transform:'translate(-18px,10px) rotate(-8deg)'}],{duration:2900});
  loop(scene.querySelector('.qv-star'),[{transform:'scale(.86) rotate(-5deg)'},{transform:'scale(1.15) rotate(6deg)'},{transform:'scale(.86) rotate(-5deg)'}],{duration:1700});
  scene.querySelectorAll('.qv-confetti').forEach((el,i)=>loop(el,[{transform:'translateY(-10px) rotate(0deg)'},{transform:'translateY(16px) rotate(100deg)'},{transform:'translateY(-10px) rotate(0deg)'}],{duration:1900+i*280,delay:i*130}));
  const card=host.querySelector('.focus-row.current .week-art svg');
  loop(card,[{transform:'translateY(0) scale(1)'},{transform:'translateY(-6px) scale(1.04)'},{transform:'translateY(0) scale(1)'}],{duration:2100});
  const node=host.querySelector('.focus-row.current .focus-check');
  loop(node,[{transform:'translateY(0) scale(1)'},{transform:'translateY(-5px) scale(1.12)'},{transform:'translateY(0) scale(1)'}],{duration:1500});
  host.dataset.motionRuntime='on';
}
function mountToggle(){
  if(document.getElementById('mochiMotionToggle'))return;
  const anchor=document.getElementById('cloudSyncDetails')||document.getElementById('backupStatus');if(!anchor)return;
  const p=document.createElement('p');p.className='study-note';p.innerHTML=`Home motion: <button type="button" class="btn quiet" id="mochiMotionToggle"></button>`;
  anchor.insertAdjacentElement('afterend',p);
  const b=document.getElementById('mochiMotionToggle');
  const paint=()=>b.textContent=enabled()?'On · animated maths scene':'Off · still scene';paint();
  b.onclick=()=>{try{localStorage.setItem(FLAG,enabled()?'off':'on');}catch(e){}paint();if(enabled()){document.querySelectorAll('[data-mochi-waapi]').forEach(el=>delete el.dataset.mochiWaapi);animateScene();}else document.querySelectorAll('#mochiFocusHome *').forEach(el=>{try{el.getAnimations().forEach(a=>a.cancel());}catch(e){}});};
}
function run(){mountToggle();requestAnimationFrame(()=>requestAnimationFrame(animateScene));}
function init(){run();document.addEventListener('mochi:focus-rendered',run);document.addEventListener('mochi:cloud-merged',run);setTimeout(run,600);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
