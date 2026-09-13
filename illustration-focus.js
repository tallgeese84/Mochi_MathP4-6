/* Mochi v4.2.7 — illustration-first learner dashboard.
   Keeps the v4.2.x learning engine and quest schedule intact; replaces text-heavy
   learner chrome with original scene art. Parent evidence remains unchanged. */
(function(){
'use strict';
const VERSION='4.2.7';
let busy=false;

function addStyle(){
  if(document.getElementById('mochiIllustrationFocusStyle'))return;
  const s=document.createElement('style');
  s.id='mochiIllustrationFocusStyle';
  s.textContent=`
    #mochiFocusHome .focus-today{
      min-height:310px!important;padding:28px 47% 24px 24px!important;
      background:linear-gradient(145deg,#fffdfb,#fbf7ff 58%,#f3ecff)!important;
      overflow:hidden!important;
    }
    #mochiFocusHome .focus-title{max-width:none!important;font-size:2.08rem!important}
    #mochiFocusHome .focus-sub{max-width:340px;margin-bottom:12px!important}
    #mochiFocusHome .focus-progress,#mochiFocusHome .focus-start,#mochiFocusHome .focus-done{width:100%!important;max-width:350px}
    #mochiFocusHome .focus-date,#mochiFocusHome .focus-note{display:none!important}
    #mochiFocusHome .quest-scene{
      position:absolute!important;z-index:1!important;pointer-events:none;
      left:auto!important;right:0!important;top:0!important;bottom:0!important;width:46%!important;
      overflow:hidden!important;border-radius:0 26px 26px 0;
      background:linear-gradient(165deg,rgba(246,239,255,.96),rgba(255,247,232,.82));
      transform-origin:center!important;
    }
    #mochiFocusHome .quest-shape,#mochiFocusHome .quest-orbit,#mochiFocusHome .mb-floater{display:none!important}
    .quest-paint{position:absolute;inset:0;width:100%;height:100%;filter:drop-shadow(0 10px 18px rgba(71,46,98,.10))}
    .quest-euna{position:absolute;z-index:4;left:4%;bottom:-5%;width:41%;max-height:77%;object-fit:contain;object-position:left bottom;filter:drop-shadow(0 8px 12px rgba(63,42,83,.17));animation:qfBob 5s ease-in-out infinite}
    .quest-mochi{position:absolute;z-index:5;right:5%;bottom:2%;width:31%;max-height:48%;object-fit:contain;object-position:right bottom;filter:drop-shadow(0 8px 12px rgba(63,42,83,.15));animation:qfBob2 4.3s ease-in-out infinite}
    .quest-spark{transform-box:fill-box;transform-origin:center;animation:qfTwinkle 2.8s ease-in-out infinite}
    .quest-spark.s2{animation-delay:.7s}.quest-spark.s3{animation-delay:1.25s}
    @keyframes qfBob{0%,100%{transform:translateY(0) rotate(-1deg)}50%{transform:translateY(-5px) rotate(1deg)}}
    @keyframes qfBob2{0%,100%{transform:translateY(0) rotate(1deg)}50%{transform:translateY(-7px) rotate(-1deg)}}
    @keyframes qfTwinkle{0%,100%{opacity:.45;transform:scale(.82)}50%{opacity:1;transform:scale(1.15)}}

    /* The week is a strip of illustrated postcards, not a timetable wall. */
    #mochiFocusHome .focus-week{padding:14px 12px 12px!important;overflow:hidden}
    #mochiFocusHome .focus-week-head{margin:0 4px 10px!important}
    #mochiFocusHome .focus-list{
      display:grid!important;grid-template-columns:repeat(7,minmax(108px,1fr))!important;
      gap:8px!important;overflow-x:auto!important;padding:2px 2px 6px!important;scrollbar-width:thin;
    }
    #mochiFocusHome .focus-row{
      min-width:108px!important;min-height:132px!important;padding:7px!important;
      display:flex!important;flex-direction:column!important;justify-content:flex-end!important;gap:3px!important;
      border:1.5px solid rgba(111,82,153,.11);border-radius:18px!important;
      background:linear-gradient(180deg,#fff,#fbf8ff);overflow:hidden;
    }
    #mochiFocusHome .focus-row:after{display:none!important}
    #mochiFocusHome .focus-row.current{background:linear-gradient(180deg,#f5edff,#fff9eb)!important;transform:none!important;box-shadow:0 8px 18px rgba(85,58,119,.10)}
    #mochiFocusHome .focus-row.done{opacity:.62}
    #mochiFocusHome .focus-check{position:absolute!important;top:7px;right:7px;width:24px!important;height:24px!important;border-radius:9px!important;z-index:4}
    #mochiFocusHome .focus-when{font-size:.62rem!important;padding:0!important;line-height:1.1}
    #mochiFocusHome .focus-row b{font-size:.79rem!important;line-height:1.12!important}
    #mochiFocusHome .focus-row small{display:none!important}
    .week-art{order:-1;width:100%;height:72px;margin-bottom:3px;border-radius:13px;overflow:hidden;background:linear-gradient(145deg,#f5efff,#fff6e8)}
    .week-art svg{display:block;width:100%;height:100%}
    #mochiFocusHome .focus-more{margin-top:4px!important}

    @media(max-width:720px){
      #mochiFocusHome .focus-today{min-height:420px!important;padding:205px 18px 18px!important}
      #mochiFocusHome .quest-scene{left:0!important;right:0!important;top:0!important;bottom:auto!important;width:100%!important;height:190px!important;border-radius:26px 26px 0 0}
      #mochiFocusHome .focus-title{font-size:1.65rem!important}
      #mochiFocusHome .focus-sub{max-width:none}
      #mochiFocusHome .focus-progress,#mochiFocusHome .focus-start,#mochiFocusHome .focus-done{max-width:none}
      .quest-euna{left:8%;width:31%;max-height:88%}.quest-mochi{right:9%;width:24%;max-height:59%}
      #mochiFocusHome .focus-list{grid-template-columns:repeat(7,118px)!important}
      #mochiFocusHome .focus-row{min-width:118px!important}
    }
    @media(prefers-reduced-motion:reduce){.quest-euna,.quest-mochi,.quest-spark{animation:none!important}}
  `;
  document.head.appendChild(s);
}

function rawText(el,key){
  if(!el)return'';
  return el.dataset[key]||el.textContent||'';
}
function sceneKind(host){
  const k=rawText(host.querySelector('.focus-kicker'),'rawKicker');
  const t=rawText(host.querySelector('.focus-title'),'rawTitle');
  const all=(k+' '+t).toLowerCase();
  const m=all.match(/part\s+(\d)/i);
  if(m)return 'p'+m[1];
  if(/transfer|new problems|mix it up|new-looking/.test(all))return'transfer';
  if(/review|strengthen|fix one/.test(all))return'review';
  if(/complete|all done|finished/.test(all))return'done';
  return'p1';
}

function defs(){return `<defs>
  <linearGradient id="gLav" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#efe5ff"/><stop offset="1" stop-color="#d9c3f5"/></linearGradient>
  <linearGradient id="gGold" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#ffe9a8"/><stop offset="1" stop-color="#efbd58"/></linearGradient>
  <linearGradient id="gMint" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#dff4eb"/><stop offset="1" stop-color="#94ccb9"/></linearGradient>
  <filter id="paper"><feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="2" seed="8" result="n"/><feColorMatrix in="n" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 .055 0"/><feBlend in="SourceGraphic" mode="multiply"/></filter>
</defs>`;}
function spark(x,y,r=5,c='#f2c35f',cls=''){return `<path class="quest-spark ${cls}" d="M${x} ${y-r}L${x+r*.28} ${y-r*.28}L${x+r} ${y}L${x+r*.28} ${y+r*.28}L${x} ${y+r}L${x-r*.28} ${y+r*.28}L${x-r} ${y}L${x-r*.28} ${y-r*.28}Z" fill="${c}"/>`;}

function sceneSvg(kind){
  const common=defs()+spark(286,34,6,'#f2c35f','s2')+spark(244,73,4,'#d89bc6','s3')+spark(310,112,4,'#8bc7b4','');
  let art='';
  if(kind==='p1')art=`
    <ellipse cx="232" cy="242" rx="123" ry="28" fill="#eadff3" opacity=".68"/>
    <path d="M185 220c20-44 66-72 119-62l-13 56c-35-8-70 2-94 26z" fill="#dfeeda"/>
    <circle cx="255" cy="145" r="48" fill="#fffaf0" stroke="#75549a" stroke-width="4"/><path d="M255 145L255 97A48 48 0 0 1 296.6 169z" fill="#e8c7dc"/><path d="M255 145L296.6 169A48 48 0 0 1 213.4 169z" fill="#f6d67d"/><path d="M255 145L213.4 169A48 48 0 0 1 255 97z" fill="#b9dfd0"/>
    <g filter="url(#paper)"><rect x="300" y="178" width="46" height="62" rx="11" fill="#fff" stroke="#b38dcc" stroke-width="3"/><circle cx="315" cy="198" r="6" fill="#8e6ab4"/><circle cx="332" cy="198" r="6" fill="#8e6ab4"/><circle cx="315" cy="218" r="6" fill="#efbd58"/><circle cx="332" cy="218" r="6" fill="#efbd58"/></g>`;
  else if(kind==='p2')art=`
    <ellipse cx="240" cy="246" rx="128" ry="26" fill="#eadff3" opacity=".7"/>
    <path d="M176 218h160l-12 28H188z" fill="#b98bc7" opacity=".72"/><path d="M205 218v-58h45v58M277 218v-78h42v78" fill="#fffaf2" stroke="#76519b" stroke-width="3"/>
    <g fill="#efbd58"><circle cx="219" cy="177" r="7"/><circle cx="237" cy="177" r="7"/><circle cx="219" cy="197" r="7"/><circle cx="237" cy="197" r="7"/></g>
    <g fill="#8bc7b4"><circle cx="290" cy="159" r="7"/><circle cx="306" cy="159" r="7"/><circle cx="290" cy="178" r="7"/><circle cx="306" cy="178" r="7"/><circle cx="290" cy="197" r="7"/><circle cx="306" cy="197" r="7"/></g>
    <path d="M251 128h30M266 128v49M229 177h74" stroke="#5f477b" stroke-width="4" stroke-linecap="round"/><path d="M218 177l11-20 11 20M292 177l11-20 11 20" fill="none" stroke="#5f477b" stroke-width="3"/>`;
  else if(kind==='p3')art=`
    <ellipse cx="238" cy="245" rx="126" ry="25" fill="#e9def3" opacity=".7"/>
    <path d="M219 211l36-83 61 27-39 81z" fill="#fbf7ef" stroke="#76519b" stroke-width="4"/><circle cx="270" cy="160" r="31" fill="none" stroke="#d59abf" stroke-width="5"/><path d="M270 160l25-18M270 160l17 27" stroke="#76519b" stroke-width="4" stroke-linecap="round"/><path d="M177 228l48-73 29 20-46 69z" fill="#b8ded0" stroke="#5d907e" stroke-width="3"/><path d="M310 113l31 54h-62z" fill="#f4d47d" stroke="#9c7b37" stroke-width="3"/>
    <path d="M324 88l-17 36M324 88l24 11" stroke="#5f477b" stroke-width="5" stroke-linecap="round"/><circle cx="324" cy="88" r="8" fill="#8e6ab4"/>`;
  else if(kind==='p4')art=`
    <ellipse cx="238" cy="245" rx="126" ry="25" fill="#e9def3" opacity=".7"/>
    <rect x="202" y="143" width="84" height="88" rx="8" fill="#eef7fb" stroke="#665080" stroke-width="4"/><path d="M206 199h76v28h-76z" fill="#93cfe3" opacity=".72"/><path d="M206 199c18-8 35 8 52 0s22-2 24 0" fill="none" stroke="#4c9fbe" stroke-width="3"/>
    <path d="M302 226V143H362M312 210l12-18 13 9 18-34" fill="none" stroke="#76519b" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><g fill="#efbd58"><circle cx="312" cy="210" r="5"/><circle cx="324" cy="192" r="5"/><circle cx="337" cy="201" r="5"/><circle cx="355" cy="167" r="5"/></g>
    <g fill="#b9dfd0" stroke="#5d907e" stroke-width="2"><rect x="167" y="176" width="28" height="28" rx="5"/><rect x="157" y="208" width="38" height="20" rx="5"/></g>`;
  else if(kind==='transfer')art=`
    <ellipse cx="240" cy="246" rx="130" ry="26" fill="#e6ddf2" opacity=".72"/>
    <path d="M169 221c38-83 111-88 168-11" fill="none" stroke="#b9dfd0" stroke-width="22" stroke-linecap="round"/><path d="M169 221c38-83 111-88 168-11" fill="none" stroke="#5d907e" stroke-width="3" stroke-dasharray="8 8"/>
    <circle cx="202" cy="180" r="23" fill="#f6d67d"/><path d="M240 147h44l-22 38z" fill="#e6b8d1"/><rect x="288" y="173" width="38" height="38" rx="9" fill="#cbb6ea"/><path d="M213 135h43l-22-25z" fill="#fff" stroke="#76519b" stroke-width="3"/>`;
  else if(kind==='review')art=`
    <ellipse cx="240" cy="246" rx="128" ry="25" fill="#e6ddf2" opacity=".7"/>
    <rect x="191" y="184" width="135" height="52" rx="10" fill="#f3d99a" stroke="#9a7743" stroke-width="3"/><circle cx="247" cy="159" r="34" fill="#fff" stroke="#76519b" stroke-width="5"/><path d="M271 183l29 29" stroke="#76519b" stroke-width="9" stroke-linecap="round"/>
    <path d="M228 159l13 13 28-31" fill="none" stroke="#69a991" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><g fill="#d7b6e8"><rect x="304" y="147" width="27" height="23" rx="6"/><rect x="174" y="158" width="29" height="29" rx="7"/></g>`;
  else art=`
    <ellipse cx="238" cy="246" rx="124" ry="24" fill="#e8def2" opacity=".62"/>
    <path d="M235 112l15 30 33 5-24 23 6 33-30-16-30 16 6-33-24-23 33-5z" fill="url(#gGold)" stroke="#9b793c" stroke-width="3"/>
    ${spark(305,142,12,'#c7a5df','s2')}${spark(184,176,9,'#8bc7b4','s3')}${spark(321,203,8,'#efbd58','')}`;
  return `<svg class="quest-paint" viewBox="0 0 390 280" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${common}${art}</svg>`;
}

function applyScene(host){
  const scene=host.querySelector('.quest-scene');if(!scene)return;
  const kind=sceneKind(host);
  if(scene.dataset.illustrationKind===kind)return;
  scene.dataset.illustrationKind=kind;
  scene.innerHTML=sceneSvg(kind)+`<img class="quest-euna" src="euna-avatar.webp" alt=""><img class="quest-mochi" src="mochi-watermark.webp" alt="">`;
}

function miniSvg(i){
  const colors=[['#f6d67d','#d9b6e9'],['#9ed6c3','#f1c46c'],['#d8b9e9','#8fc4dd'],['#8fc4dd','#f4cf77'],['#b8ded0','#cfafe3'],['#f0c774','#9ed2bf'],['#d6b2e7','#f3cf77']][i%7];
  const [a,b]=colors;
  const drawings=[
    `<circle cx="35" cy="31" r="18" fill="${a}"/><path d="M35 31V13A18 18 0 0 1 51 40z" fill="${b}"/><circle cx="69" cy="46" r="7" fill="#76519b"/><circle cx="83" cy="46" r="7" fill="#76519b"/>`,
    `<rect x="19" y="24" width="30" height="35" rx="7" fill="${a}"/><rect x="58" y="16" width="28" height="43" rx="7" fill="${b}"/><path d="M24 36h20M63 30h18M63 42h18" stroke="#76519b" stroke-width="3" stroke-linecap="round"/>`,
    `<circle cx="39" cy="36" r="20" fill="none" stroke="${a}" stroke-width="7"/><path d="M39 36l17-12M39 36l11 17" stroke="#76519b" stroke-width="3"/><path d="M67 56l19-34 15 34z" fill="${b}"/>`,
    `<rect x="19" y="25" width="37" height="35" rx="5" fill="${a}"/><path d="M61 59V20H100M69 51l9-12 9 5 10-19" fill="none" stroke="#76519b" stroke-width="3" stroke-linecap="round"/><circle cx="97" cy="25" r="4" fill="${b}"/>`,
    `<path d="M13 58c20-42 51-45 92-8" fill="none" stroke="${a}" stroke-width="12" stroke-linecap="round"/><circle cx="38" cy="35" r="9" fill="${b}"/><path d="M65 25h18l-9 15z" fill="#76519b"/>`,
    `<circle cx="48" cy="33" r="19" fill="none" stroke="${a}" stroke-width="5"/><path d="M62 47l18 17" stroke="#76519b" stroke-width="7" stroke-linecap="round"/><path d="M39 33l7 7 15-17" fill="none" stroke="${b}" stroke-width="5" stroke-linecap="round"/>`,
    `<path d="M57 12l9 19 21 3-15 15 4 21-19-10-19 10 4-21-15-15 21-3z" fill="${a}"/><circle cx="94" cy="24" r="7" fill="${b}"/><circle cx="21" cy="57" r="6" fill="#9ed2bf"/>`
  ];
  return `<svg viewBox="0 0 118 76" aria-hidden="true"><rect width="118" height="76" rx="13" fill="#fcf9ff"/>${drawings[i%drawings.length]}</svg>`;
}
function applyWeek(host){
  host.querySelectorAll('.focus-row').forEach((row,i)=>{
    if(row.querySelector('.week-art'))return;
    const art=document.createElement('div');art.className='week-art';art.innerHTML=miniSvg(i);
    const when=row.querySelector('.focus-when');
    row.insertBefore(art,when||row.firstChild);
  });
}

function markVersion(){
  document.querySelectorAll('[data-app-version]').forEach(el=>el.textContent='v'+VERSION);
  document.querySelectorAll('[data-release-date]').forEach(el=>{el.dateTime='2026-09-13';el.textContent='13 September 2026';});
  const n=document.getElementById('releaseNotes');
  if(n)n.textContent='Illustration-first quest board: original visual scenes for each maths checkpoint, illustrated weekly cards, and less learner-facing text.';
}
function apply(){
  if(busy)return;const host=document.getElementById('mochiFocusHome');if(!host)return;
  busy=true;try{addStyle();applyScene(host);applyWeek(host);markVersion();}finally{busy=false;}
}
function init(){
  addStyle();markVersion();apply();
  new MutationObserver(()=>requestAnimationFrame(apply)).observe(document.body,{childList:true,subtree:true,characterData:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
