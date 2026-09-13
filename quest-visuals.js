/* Mochi v4.2.8 — persistent animated illustration layer.
   Loaded after baseline-week.js. The maths engine is untouched. */
(function(){
'use strict';
const VERSION='4.2.8';
let observer=null;

function addStyle(){
  if(document.getElementById('mochiQuestVisualStyle'))return;
  const s=document.createElement('style');s.id='mochiQuestVisualStyle';s.textContent=`
    #mochiFocusHome .focus-date,#mochiFocusHome .focus-note,#mochiFocusHome .focus-week-head span,#mochiFocusHome .focus-row small,#mochiFocusHome .focus-more-note{display:none!important}
    #mochiFocusHome .focus-today{isolation:isolate;min-height:314px!important;padding:28px 47% 24px 24px!important;border-radius:28px!important;border:2px solid rgba(111,82,153,.18)!important;background:linear-gradient(145deg,#fffdfb,#fbf7ff 58%,#f3ecff)!important;box-shadow:0 16px 36px rgba(70,43,108,.11),0 2px 0 rgba(111,82,153,.08)!important;overflow:hidden!important}
    #mochiFocusHome .focus-today>*:not(.quest-scene){position:relative;z-index:4}
    #mochiFocusHome .focus-kicker{width:max-content;margin:0 0 8px;padding:5px 9px;border-radius:999px;background:rgba(111,82,153,.10);color:#70509a;font-size:.68rem;letter-spacing:1.2px;font-weight:900}
    #mochiFocusHome .focus-title{max-width:none!important;font-size:2rem!important;line-height:1.04!important;letter-spacing:-.025em;margin-bottom:8px!important}
    #mochiFocusHome .focus-sub{max-width:350px;margin:0 0 13px!important;color:var(--slate);font-weight:750}
    #mochiFocusHome .focus-progress,#mochiFocusHome .focus-start,#mochiFocusHome .focus-done{width:100%!important;max-width:350px}
    #mochiFocusHome .focus-progress{height:11px!important;background:rgba(111,82,153,.11)!important}.focus-progress>i{background:linear-gradient(90deg,#8a68bb,#b887db)!important;box-shadow:0 0 12px rgba(138,104,187,.30)}
    #mochiFocusHome .focus-start{position:relative;overflow:hidden;min-height:52px;border-radius:17px!important;font-size:1.1rem!important;background:#7956a8!important;box-shadow:0 4px 0 #5e3f8b,0 10px 22px rgba(94,63,139,.18)!important}
    #mochiFocusHome .focus-start:after{content:'';position:absolute;top:-50%;left:-35%;width:22%;height:200%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.36),transparent);transform:skewX(-18deg);animation:qvShine 3.1s ease-in-out infinite}
    @keyframes qvShine{0%,35%{left:-35%;opacity:0}48%{opacity:1}66%,100%{left:118%;opacity:0}}

    #mochiFocusHome .quest-scene{position:absolute;z-index:1;pointer-events:none;right:0;top:0;bottom:0;width:46%;overflow:hidden;border-radius:0 26px 26px 0;background:linear-gradient(165deg,rgba(246,239,255,.96),rgba(255,247,232,.84));transition:transform .35s cubic-bezier(.2,.8,.2,1)}
    #mochiFocusHome .quest-paint{position:absolute;inset:0;width:100%;height:100%;filter:drop-shadow(0 10px 18px rgba(71,46,98,.10))}
    #mochiFocusHome .quest-euna{position:absolute;z-index:5;left:3%;bottom:-5%;width:40%;max-height:77%;object-fit:contain;object-position:left bottom;filter:drop-shadow(0 8px 12px rgba(63,42,83,.17));animation:qvEuna 3.2s ease-in-out infinite}
    #mochiFocusHome .quest-mochi{position:absolute;z-index:6;right:4%;bottom:2%;width:31%;max-height:49%;object-fit:contain;object-position:right bottom;filter:drop-shadow(0 8px 12px rgba(63,42,83,.15));animation:qvMochi 2.7s ease-in-out infinite}
    @keyframes qvEuna{0%,100%{transform:translateY(0) rotate(-1deg)}50%{transform:translateY(-9px) rotate(1deg)}}
    @keyframes qvMochi{0%,100%{transform:translateY(0) rotate(1deg)}50%{transform:translateY(-11px) rotate(-1.5deg)}}

    .qv-wheel,.qv-balance,.qv-compass,.qv-ruler,.qv-water,.qv-dot,.qv-token,.qv-lens,.qv-star,.qv-confetti,.qv-bead{transform-box:fill-box;transform-origin:center}
    .qv-wheel{animation:qvWheel 4.4s ease-in-out infinite}.qv-bead.a{animation:qvBeadA 1.7s ease-in-out infinite}.qv-bead.b{animation:qvBeadB 1.9s ease-in-out infinite}.qv-bead.c{animation:qvBeadA 2.1s ease-in-out .3s infinite}
    .qv-balance{animation:qvRock 3.1s ease-in-out infinite}.qv-counter.a{animation:qvCounterA 1.65s ease-in-out infinite}.qv-counter.b{animation:qvCounterB 1.8s ease-in-out infinite}
    .qv-compass{animation:qvCompass 3.8s ease-in-out infinite}.qv-ruler{animation:qvRuler 3s ease-in-out infinite}.qv-angle{animation:qvPulse 2.1s ease-in-out infinite}
    .qv-water{animation:qvWater 2.6s ease-in-out infinite}.qv-dot{animation:qvDot 1.7s ease-in-out infinite}.qv-bar{transform-box:fill-box;transform-origin:center bottom;animation:qvBar 2.4s ease-in-out infinite}
    .qv-token{animation:qvTravel 3.4s ease-in-out infinite}.qv-gate{animation:qvPulse 1.9s ease-in-out infinite}
    .qv-lens{animation:qvLens 3s ease-in-out infinite}.qv-check{stroke-dasharray:75;stroke-dashoffset:75;animation:qvDraw 2.5s ease-in-out infinite}
    .qv-star{animation:qvStar 1.7s ease-in-out infinite}.qv-confetti.a{animation:qvConfettiA 2.2s ease-in-out infinite}.qv-confetti.b{animation:qvConfettiB 2.5s ease-in-out .4s infinite}
    @keyframes qvWheel{0%,100%{transform:rotate(-5deg)}50%{transform:rotate(10deg)}}
    @keyframes qvBeadA{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
    @keyframes qvBeadB{0%,100%{transform:translateY(-2px)}50%{transform:translateY(9px)}}
    @keyframes qvRock{0%,100%{transform:rotate(-3deg)}50%{transform:rotate(4deg)}}
    @keyframes qvCounterA{0%,100%{transform:translate(0,0)}50%{transform:translate(4px,-9px)}}
    @keyframes qvCounterB{0%,100%{transform:translate(0,0)}50%{transform:translate(-5px,8px)}}
    @keyframes qvCompass{0%,100%{transform:rotate(-7deg)}50%{transform:rotate(8deg)}}
    @keyframes qvRuler{0%,100%{transform:translateX(0) rotate(-7deg)}50%{transform:translateX(12px) rotate(-2deg)}}
    @keyframes qvPulse{0%,100%{transform:scale(.94);opacity:.68}50%{transform:scale(1.08);opacity:1}}
    @keyframes qvWater{0%,100%{transform:translateX(-5px)}50%{transform:translateX(7px)}}
    @keyframes qvDot{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-8px) scale(1.18)}}
    @keyframes qvBar{0%,100%{transform:scaleY(.82)}50%{transform:scaleY(1.06)}}
    @keyframes qvTravel{0%,100%{transform:translate(-25px,11px) rotate(-8deg)}50%{transform:translate(35px,-18px) rotate(12deg)}}
    @keyframes qvLens{0%,100%{transform:translate(-12px,8px) rotate(-7deg)}50%{transform:translate(20px,-8px) rotate(7deg)}}
    @keyframes qvDraw{0%,20%{stroke-dashoffset:75}65%,100%{stroke-dashoffset:0}}
    @keyframes qvStar{0%,100%{transform:scale(.88) rotate(-4deg)}50%{transform:scale(1.12) rotate(5deg)}}
    @keyframes qvConfettiA{0%,100%{transform:translateY(-6px) rotate(0)}50%{transform:translateY(13px) rotate(90deg)}}
    @keyframes qvConfettiB{0%,100%{transform:translateY(8px) rotate(20deg)}50%{transform:translateY(-10px) rotate(-70deg)}}

    #mochiFocusHome .focus-week{padding:14px 12px 12px!important;border-radius:22px!important;background:rgba(255,255,255,.80)!important;border:2px solid rgba(111,82,153,.10)!important;overflow:hidden}
    #mochiFocusHome .focus-week-head{margin:0 4px 10px!important}.focus-week h2{font-size:1.17rem!important}
    #mochiFocusHome .focus-list{display:grid!important;grid-template-columns:repeat(7,minmax(108px,1fr))!important;gap:8px!important;overflow-x:auto!important;padding:2px 2px 6px!important;scrollbar-width:thin}
    #mochiFocusHome .focus-row{min-width:108px!important;min-height:132px!important;padding:7px!important;display:flex!important;flex-direction:column!important;justify-content:flex-end!important;gap:3px!important;border:1.5px solid rgba(111,82,153,.11);border-radius:18px!important;background:linear-gradient(180deg,#fff,#fbf8ff);overflow:hidden}
    #mochiFocusHome .focus-row.current{background:linear-gradient(180deg,#f5edff,#fff9eb)!important;box-shadow:0 8px 18px rgba(85,58,119,.10)}#mochiFocusHome .focus-row.done{opacity:.62}
    #mochiFocusHome .focus-check{position:absolute!important;top:7px;right:7px;width:24px!important;height:24px!important;border-radius:9px!important;z-index:4}#mochiFocusHome .focus-row.current .focus-check{animation:qvNode 1.55s ease-in-out infinite}
    @keyframes qvNode{0%,100%{transform:translateY(0) scale(1);box-shadow:0 0 0 0 rgba(139,103,185,.24)}50%{transform:translateY(-3px) scale(1.08);box-shadow:0 0 0 8px rgba(139,103,185,0)}}
    #mochiFocusHome .focus-when{font-size:.62rem!important;padding:0!important;line-height:1.1}#mochiFocusHome .focus-row b{font-size:.79rem!important;line-height:1.12!important}
    .week-art{order:-1;width:100%;height:72px;margin-bottom:3px;border-radius:13px;overflow:hidden;background:linear-gradient(145deg,#f5efff,#fff6e8)}.week-art svg{display:block;width:100%;height:100%}.focus-row.current .week-art svg{animation:qvCard 2.4s ease-in-out infinite}@keyframes qvCard{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-3px) scale(1.025)}}

    @media(max-width:720px){#mochiFocusHome .focus-today{min-height:425px!important;padding:207px 18px 18px!important}#mochiFocusHome .quest-scene{left:0;right:0;top:0;bottom:auto;width:100%;height:192px;border-radius:26px 26px 0 0}#mochiFocusHome .focus-title{font-size:1.65rem!important}#mochiFocusHome .focus-sub{max-width:none}#mochiFocusHome .focus-progress,#mochiFocusHome .focus-start,#mochiFocusHome .focus-done{max-width:none}.quest-euna{left:7%!important;width:31%!important;max-height:88%!important}.quest-mochi{right:8%!important;width:24%!important;max-height:59%!important}#mochiFocusHome .focus-list{grid-template-columns:repeat(7,118px)!important}#mochiFocusHome .focus-row{min-width:118px!important}}
    @media(prefers-reduced-motion:reduce){#mochiFocusHome *{animation-duration:.001ms!important;animation-iteration-count:1!important}#mochiFocusHome .quest-scene{transition:none!important}}
  `;document.head.appendChild(s);
}

function shortCopy(host){
  const today=host.querySelector('.focus-today');if(!today)return;
  const phase=today.dataset.phase||'baseline',part=today.dataset.part||'';
  const kicker=host.querySelector('.focus-kicker'),title=host.querySelector('.focus-title'),sub=host.querySelector('.focus-sub'),btn=host.querySelector('.focus-start');
  if(kicker)kicker.textContent=phase==='done'?'DONE':'TODAY';
  if(phase==='baseline'){if(title)title.textContent='Math Check '+(part||'1');}
  else if(phase==='transfer'){if(title)title.textContent='New Problems';}
  else if(phase==='review'){if(title)title.textContent='Quick Review';}
  else if(phase==='done'){if(title)title.textContent='All done!';if(sub)sub.textContent='Nice work today.';}
  if(btn)btn.textContent=/continue/i.test(btn.textContent||'')?'Continue →':'Start →';
  const map=[['Starting point · Part 1','Math Check 1'],['Starting point · Part 2','Math Check 2'],['Starting point · Part 3','Math Check 3'],['Starting point · Part 4','Math Check 4'],['Adaptive transfer check','Mix It Up'],['Repair one weak idea','Fix One Thing'],['Review together + light challenge','Challenge']];
  host.querySelectorAll('.focus-row b').forEach(el=>{const hit=map.find(([a])=>el.textContent.trim()===a);if(hit)el.textContent=hit[1];});
  host.querySelectorAll('.focus-row').forEach((row,i)=>{const c=row.querySelector('.focus-check');if(c&&!row.classList.contains('done')&&!row.classList.contains('current'))c.textContent=String(i+1);if(c&&row.classList.contains('current'))c.textContent='→';if(row.classList.contains('current')){row.tabIndex=0;row.setAttribute('role','button');row.onclick=()=>host.querySelector('.focus-start')?.click();}});
  const more=host.querySelector('.focus-more>summary');if(more)more.textContent='More';
}

function kind(host){const t=host.querySelector('.focus-today');if(!t)return'p1';const p=t.dataset.phase||'baseline';if(p==='baseline')return'p'+(t.dataset.part||'1');return p;}
function svgDefs(){return`<defs><linearGradient id="qvLav" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#efe5ff"/><stop offset="1" stop-color="#d9c3f5"/></linearGradient><linearGradient id="qvGold" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#ffe9a8"/><stop offset="1" stop-color="#efbd58"/></linearGradient><linearGradient id="qvMint" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#dff4eb"/><stop offset="1" stop-color="#94ccb9"/></linearGradient></defs>`;}
function sceneSvg(k){
  let a='';
  if(k==='p1')a=`<ellipse cx="238" cy="247" rx="132" ry="26" fill="#e9def3" opacity=".72"/><path d="M172 229c28-58 83-91 154-65l-15 66z" fill="#dff0df"/><g class="qv-wheel"><circle cx="270" cy="142" r="49" fill="#fffaf0" stroke="#75549a" stroke-width="4"/><path d="M270 142V93A49 49 0 0 1 312 167z" fill="#e8c7dc"/><path d="M270 142L312 167A49 49 0 0 1 228 167z" fill="#f6d67d"/><path d="M270 142L228 167A49 49 0 0 1 270 93z" fill="#b9dfd0"/></g><g><circle class="qv-bead a" cx="329" cy="194" r="8" fill="#8e6ab4"/><circle class="qv-bead b" cx="351" cy="197" r="8" fill="#efbd58"/><circle class="qv-bead c" cx="340" cy="220" r="8" fill="#8bc7b4"/></g>`;
  else if(k==='p2')a=`<ellipse cx="239" cy="247" rx="132" ry="26" fill="#e9def3" opacity=".72"/><g class="qv-balance"><path d="M210 181h127" stroke="#5f477b" stroke-width="5" stroke-linecap="round"/><path d="M274 181v48M248 229h52" stroke="#5f477b" stroke-width="5" stroke-linecap="round"/><path d="M223 181l-17 29h34zM323 181l-17 29h34z" fill="#fff9ee" stroke="#9a7743" stroke-width="3"/></g><g fill="#efbd58"><circle class="qv-counter a" cx="214" cy="169" r="8"/><circle class="qv-counter b" cx="232" cy="169" r="8"/></g><g fill="#8bc7b4"><circle class="qv-counter b" cx="307" cy="160" r="8"/><circle class="qv-counter a" cx="325" cy="160" r="8"/><circle class="qv-counter b" cx="316" cy="142" r="8"/></g><rect x="172" y="129" width="38" height="72" rx="10" fill="#fff" stroke="#b38dcc" stroke-width="3"/><rect x="340" y="115" width="37" height="86" rx="10" fill="#fff" stroke="#8bc7b4" stroke-width="3"/>`;
  else if(k==='p3')a=`<ellipse cx="237" cy="247" rx="130" ry="25" fill="#e9def3" opacity=".7"/><g class="qv-ruler"><rect x="172" y="184" width="116" height="35" rx="8" fill="#b8ded0" stroke="#5d907e" stroke-width="3"/><g stroke="#5d907e" stroke-width="2"><path d="M188 184v11M204 184v16M220 184v11M236 184v16M252 184v11M268 184v16"/></g></g><g class="qv-compass"><circle cx="313" cy="111" r="9" fill="#8e6ab4"/><path d="M313 119l-36 95M313 119l35 92" stroke="#5f477b" stroke-width="6" stroke-linecap="round"/><path d="M278 196a42 42 0 0 0 69 0" fill="none" stroke="#d59abf" stroke-width="4"/></g><path class="qv-angle" d="M221 143l45 0-24-40z" fill="#f6d67d" stroke="#9c7b37" stroke-width="3"/>`;
  else if(k==='p4')a=`<ellipse cx="238" cy="247" rx="132" ry="25" fill="#e9def3" opacity=".7"/><rect x="174" y="135" width="101" height="94" rx="10" fill="#eef7fb" stroke="#665080" stroke-width="4"/><g class="qv-water"><path d="M179 189c17-9 31 8 48 0s26 7 43 0v34h-91z" fill="#93cfe3" opacity=".78"/><path d="M179 189c17-9 31 8 48 0s26 7 43 0" fill="none" stroke="#4c9fbe" stroke-width="3"/></g><path d="M292 225V137H371" fill="none" stroke="#665080" stroke-width="4"/><rect class="qv-bar" x="305" y="190" width="15" height="35" rx="4" fill="#b9dfd0"/><rect class="qv-bar" x="329" y="169" width="15" height="56" rx="4" fill="#e6b8d1"/><rect class="qv-bar" x="353" y="147" width="15" height="78" rx="4" fill="#f4d47d"/><circle class="qv-dot" cx="361" cy="147" r="7" fill="#76519b"/>`;
  else if(k==='transfer')a=`<ellipse cx="238" cy="247" rx="132" ry="25" fill="#e6ddf2" opacity=".72"/><path d="M168 222c39-85 112-90 181-12" fill="none" stroke="#b9dfd0" stroke-width="23" stroke-linecap="round"/><path d="M168 222c39-85 112-90 181-12" fill="none" stroke="#5d907e" stroke-width="3" stroke-dasharray="8 8"/><circle class="qv-token" cx="253" cy="187" r="18" fill="#f6d67d" stroke="#9c7b37" stroke-width="3"/><path class="qv-gate" d="M327 145h34v61h-34zM333 145v-18M355 145v-18" fill="#fff9ee" stroke="#76519b" stroke-width="4"/>`;
  else if(k==='review')a=`<ellipse cx="238" cy="247" rx="130" ry="25" fill="#e6ddf2" opacity=".7"/><rect x="183" y="178" width="150" height="56" rx="12" fill="#f3d99a" stroke="#9a7743" stroke-width="3"/><g class="qv-lens"><circle cx="252" cy="153" r="39" fill="rgba(255,255,255,.75)" stroke="#76519b" stroke-width="6"/><path d="M280 181l34 34" stroke="#76519b" stroke-width="10" stroke-linecap="round"/></g><path class="qv-check" d="M222 154l18 18 39-45" fill="none" stroke="#69a991" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`;
  else a=`<ellipse cx="238" cy="247" rx="126" ry="24" fill="#e8def2" opacity=".62"/><path class="qv-star" d="M244 100l18 37 41 6-30 29 7 41-36-19-37 19 7-41-30-29 42-6z" fill="url(#qvGold)" stroke="#9b793c" stroke-width="4"/><rect class="qv-confetti a" x="320" y="126" width="10" height="28" rx="5" fill="#8bc7b4"/><rect class="qv-confetti b" x="185" y="167" width="10" height="30" rx="5" fill="#d59abf"/><circle class="qv-confetti a" cx="342" cy="194" r="8" fill="#efbd58"/>`;
  return`<svg class="quest-paint" viewBox="0 0 390 280" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${svgDefs()}${a}</svg>`;
}

function applyScene(host){
  const card=host.querySelector('.focus-today');if(!card)return;const k=kind(host);
  let scene=card.querySelector('.quest-scene');if(!scene){scene=document.createElement('div');scene.className='quest-scene';scene.setAttribute('aria-hidden','true');card.prepend(scene);}
  if(scene.dataset.kind!==k){scene.dataset.kind=k;scene.innerHTML=sceneSvg(k)+`<img class="quest-euna" src="euna-avatar.webp" alt=""><img class="quest-mochi" src="mochi-watermark.webp" alt="">`;}
  if(!scene.dataset.parallax&&!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)){
    scene.dataset.parallax='1';card.addEventListener('pointermove',e=>{const r=card.getBoundingClientRect(),x=((e.clientX-r.left)/r.width-.5)*10,y=((e.clientY-r.top)/r.height-.5)*8;scene.style.transform=`translate3d(${x}px,${y}px,0)`;});card.addEventListener('pointerleave',()=>{scene.style.transform='translate3d(0,0,0)';});
  }
}

function miniSvg(i){
  const c=[['#f6d67d','#d9b6e9'],['#9ed6c3','#f1c46c'],['#d8b9e9','#8fc4dd'],['#8fc4dd','#f4cf77'],['#b8ded0','#cfafe3'],['#f0c774','#9ed2bf'],['#d6b2e7','#f3cf77']][i%7],[a,b]=c;
  const d=[`<circle cx="35" cy="32" r="18" fill="${a}"/><path d="M35 32V14A18 18 0 0 1 51 41z" fill="${b}"/><circle cx="74" cy="45" r="7" fill="#76519b"/>`,`<rect x="19" y="26" width="30" height="34" rx="7" fill="${a}"/><rect x="59" y="17" width="28" height="43" rx="7" fill="${b}"/><circle cx="95" cy="39" r="7" fill="#76519b"/>`,`<circle cx="39" cy="37" r="20" fill="none" stroke="${a}" stroke-width="7"/><path d="M39 37l17-12M39 37l11 17" stroke="#76519b" stroke-width="3"/><path d="M68 58l19-35 15 35z" fill="${b}"/>`,`<rect x="18" y="26" width="38" height="35" rx="5" fill="${a}"/><path d="M62 59V20H101M69 51l9-12 9 5 10-19" fill="none" stroke="#76519b" stroke-width="3"/>`,`<path d="M13 59c20-42 51-45 92-8" fill="none" stroke="${a}" stroke-width="12" stroke-linecap="round"/><circle cx="38" cy="36" r="9" fill="${b}"/>`,`<circle cx="48" cy="34" r="19" fill="none" stroke="${a}" stroke-width="5"/><path d="M62 48l18 17" stroke="#76519b" stroke-width="7" stroke-linecap="round"/><path d="M39 34l7 7 15-17" fill="none" stroke="${b}" stroke-width="5"/>`,`<path d="M57 12l9 19 21 3-15 15 4 21-19-10-19 10 4-21-15-15 21-3z" fill="${a}"/><circle cx="94" cy="24" r="7" fill="${b}"/>`][i%7];
  return`<svg viewBox="0 0 118 76" aria-hidden="true"><rect width="118" height="76" rx="13" fill="#fcf9ff"/>${d}</svg>`;
}
function applyWeek(host){host.querySelectorAll('.focus-row').forEach((row,i)=>{if(row.querySelector('.week-art'))return;const art=document.createElement('div');art.className='week-art';art.innerHTML=miniSvg(i);const when=row.querySelector('.focus-when');row.insertBefore(art,when||row.firstChild);});}
function markVersion(){document.querySelectorAll('[data-app-version]').forEach(el=>el.textContent='v'+VERSION);document.querySelectorAll('[data-release-date]').forEach(el=>{el.dateTime='2026-09-13';el.textContent='13 September 2026';});const n=document.getElementById('releaseNotes');if(n)n.textContent='Animated illustration fix: the home board now preserves scenes between state changes, with moving maths objects, Euna, Mochi, and current quest cards.';}
function apply(){const host=document.getElementById('mochiFocusHome');if(!host)return;addStyle();shortCopy(host);applyScene(host);applyWeek(host);markVersion();}
function init(){addStyle();apply();document.addEventListener('mochi:focus-rendered',()=>requestAnimationFrame(apply));observer=new MutationObserver(m=>{if(m.some(x=>x.addedNodes&&x.addedNodes.length))requestAnimationFrame(apply);});observer.observe(document.body,{childList:true,subtree:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
