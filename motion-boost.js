/* Mochi v4.2.6 — visible, playful motion for Euna's quest dashboard. */
(function(){
'use strict';
const VERSION='4.2.6';
const reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function addStyle(){
  if(document.getElementById('mochiMotionBoostStyle')) return;
  const s=document.createElement('style');
  s.id='mochiMotionBoostStyle';
  s.textContent=`
    #mochiFocusHome .focus-today{perspective:700px}
    #mochiFocusHome .quest-scene{overflow:visible!important}

    /* Make the existing shapes visibly move, not merely tremble. */
    #mochiFocusHome .quest-shape.ring{opacity:.88!important;animation:mbRing 3.4s ease-in-out infinite!important}
    #mochiFocusHome .quest-shape.diamond{opacity:.86!important;animation:mbDiamond 4.8s ease-in-out infinite!important}
    #mochiFocusHome .quest-shape.dot{opacity:.92!important;animation:mbDot 2.9s ease-in-out infinite!important}
    #mochiFocusHome .quest-shape.capsule{opacity:.80!important;animation:mbCapsule 4.1s ease-in-out infinite!important}
    #mochiFocusHome .quest-orbit{opacity:.9!important;animation:mbOrbit 7s linear infinite!important}
    #mochiFocusHome .quest-orbit:after{box-shadow:0 0 0 7px rgba(121,86,168,.09)}

    @keyframes mbRing{
      0%,100%{transform:translate3d(0,0,0) rotate(-8deg) scale(1)}
      50%{transform:translate3d(-18px,18px,0) rotate(13deg) scale(1.08)}
    }
    @keyframes mbDiamond{
      0%,100%{transform:translate3d(0,0,0) rotate(18deg)}
      50%{transform:translate3d(-22px,-20px,0) rotate(82deg)}
    }
    @keyframes mbDot{
      0%,100%{transform:translate3d(0,0,0) scale(1)}
      50%{transform:translate3d(-25px,-17px,0) scale(1.18)}
    }
    @keyframes mbCapsule{
      0%,100%{transform:translate3d(0,0,0) rotate(-28deg)}
      50%{transform:translate3d(19px,18px,0) rotate(-7deg)}
    }
    @keyframes mbOrbit{to{transform:rotate(360deg)}}

    /* Extra orbiting pieces so motion is instantly noticeable. */
    .mb-floater{position:absolute;z-index:1;pointer-events:none;display:block}
    .mb-floater.f1{width:16px;height:16px;border-radius:5px;background:rgba(116,170,225,.50);right:162px;top:72px;animation:mbF1 3.1s ease-in-out infinite}
    .mb-floater.f2{width:11px;height:42px;border-radius:999px;background:rgba(246,177,203,.46);right:19px;top:126px;transform:rotate(28deg);animation:mbF2 4.2s ease-in-out infinite}
    .mb-floater.f3{width:27px;height:27px;border:7px solid rgba(240,192,97,.52);border-radius:50%;right:150px;bottom:23px;animation:mbF3 3.7s ease-in-out infinite}
    @keyframes mbF1{0%,100%{transform:translate(0,0) rotate(0)}50%{transform:translate(-15px,-18px) rotate(55deg)}}
    @keyframes mbF2{0%,100%{transform:translate(0,0) rotate(28deg)}50%{transform:translate(-13px,15px) rotate(2deg)}}
    @keyframes mbF3{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(17px,-14px) scale(.86)}}

    /* The current quest node breathes and lifts. */
    #mochiFocusHome .focus-row.current .focus-check{animation:mbNode 1.65s ease-in-out infinite!important}
    @keyframes mbNode{
      0%,100%{transform:translateY(0) scale(1);box-shadow:0 0 0 0 rgba(139,103,185,.22)}
      50%{transform:translateY(-3px) scale(1.08);box-shadow:0 0 0 8px rgba(139,103,185,0)}
    }

    /* A moving highlight makes the main action feel alive. */
    #mochiFocusHome .focus-start{position:relative;overflow:hidden}
    #mochiFocusHome .focus-start:after{
      content:'';position:absolute;top:-50%;left:-30%;width:22%;height:200%;
      background:linear-gradient(90deg,transparent,rgba(255,255,255,.34),transparent);
      transform:skewX(-18deg);animation:mbShine 3.2s ease-in-out infinite;
    }
    @keyframes mbShine{0%,35%{left:-35%;opacity:0}48%{opacity:1}66%,100%{left:118%;opacity:0}}

    /* Pointer/touch parallax is applied to this inner visual layer by JS. */
    #mochiFocusHome .quest-scene{transition:transform .45s cubic-bezier(.2,.8,.2,1)}

    @media(max-width:560px){
      .mb-floater.f1{right:116px;top:74px}
      .mb-floater.f2{right:9px;top:127px}
      .mb-floater.f3{right:108px;bottom:22px}
    }
    @media(prefers-reduced-motion:reduce){
      #mochiFocusHome .quest-shape,#mochiFocusHome .quest-orbit,.mb-floater,
      #mochiFocusHome .focus-row.current .focus-check,#mochiFocusHome .focus-start:after{animation:none!important}
      #mochiFocusHome .quest-scene{transition:none!important}
    }
  `;
  document.head.appendChild(s);
}

function addFloaters(){
  const card=document.querySelector('#mochiFocusHome .focus-today');
  if(!card||card.querySelector('.mb-floater')) return;
  for(const c of ['f1','f2','f3']){
    const el=document.createElement('span');el.className='mb-floater '+c;el.setAttribute('aria-hidden','true');card.appendChild(el);
  }
}

function addParallax(){
  if(reduced) return;
  const card=document.querySelector('#mochiFocusHome .focus-today');
  const scene=card?.querySelector('.quest-scene');
  if(!card||!scene||card.dataset.mbParallax) return;
  card.dataset.mbParallax='1';
  const move=(x,y)=>{scene.style.transform=`translate3d(${x}px,${y}px,0)`;};
  card.addEventListener('pointermove',e=>{
    const r=card.getBoundingClientRect();
    const x=((e.clientX-r.left)/r.width-.5)*14;
    const y=((e.clientY-r.top)/r.height-.5)*10;
    move(x,y);
  });
  card.addEventListener('pointerleave',()=>move(0,0));
}

function markVersion(){
  document.querySelectorAll('[data-app-version]').forEach(el=>el.textContent='v'+VERSION);
  const n=document.getElementById('releaseNotes');
  if(n)n.textContent='More visible quest motion: drifting shapes, orbiting pieces, animated current node and interactive parallax.';
}

function apply(){addStyle();addFloaters();addParallax();markVersion();}
function init(){apply();new MutationObserver(()=>requestAnimationFrame(apply)).observe(document.body,{childList:true,subtree:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
