/* Mochi v4.2.5 — playful learner dashboard for Euna.
   Short copy, one clear quest, visual weekly path, gentle motion. */
(function(){
'use strict';

const VERSION='4.2.5';
let busy=false;
let observer=null;

function addStyle(){
  if(document.getElementById('mochiKidFocusStyle')) return;
  const s=document.createElement('style');
  s.id='mochiKidFocusStyle';
  s.textContent=`
    #mochiFocusHome{position:relative}
    #mochiFocusHome .focus-date,
    #mochiFocusHome .focus-note,
    #mochiFocusHome .focus-week-head span,
    #mochiFocusHome .focus-row small,
    #mochiFocusHome .focus-more-note{display:none!important}

    /* TODAY'S QUEST */
    #mochiFocusHome .focus-today{
      position:relative;isolation:isolate;overflow:hidden;
      padding:22px 22px 20px;margin:5px 0 12px;
      min-height:235px;display:flex;flex-direction:column;justify-content:center;
      border-radius:28px;border:2px solid rgba(111,82,153,.18);
      background:
        radial-gradient(circle at 82% 20%,rgba(221,208,246,.88),transparent 30%),
        radial-gradient(circle at 5% 100%,rgba(230,218,250,.66),transparent 34%),
        linear-gradient(145deg,#fff,#faf7ff);
      box-shadow:0 16px 36px rgba(70,43,108,.11),0 2px 0 rgba(111,82,153,.08);
    }
    #mochiFocusHome .focus-today>*:not(.quest-scene){position:relative;z-index:2}
    #mochiFocusHome .focus-kicker{
      width:max-content;margin:0 0 8px;padding:5px 9px;border-radius:999px;
      background:rgba(111,82,153,.10);color:#70509a;
      font-size:.68rem;letter-spacing:1.35px;font-weight:900;
    }
    #mochiFocusHome .focus-title{
      font-size:2rem;line-height:1.04;margin:0 0 8px;max-width:72%;
      letter-spacing:-.025em;
    }
    #mochiFocusHome .focus-sub{font-size:.95rem;margin:0 0 13px;color:var(--slate);font-weight:750}
    #mochiFocusHome .focus-progress{
      width:min(360px,70%);height:11px;margin:0 0 15px;background:rgba(111,82,153,.11);
      border-radius:999px;overflow:hidden;
    }
    #mochiFocusHome .focus-progress>i{background:linear-gradient(90deg,#8a68bb,#b887db);box-shadow:0 0 12px rgba(138,104,187,.30)}
    #mochiFocusHome .focus-start{
      width:min(360px,70%);min-height:52px;padding:14px 20px;border-radius:17px;
      font-size:1.12rem;background:#7956a8;box-shadow:0 4px 0 #5e3f8b,0 10px 22px rgba(94,63,139,.18);
      transition:transform .18s cubic-bezier(.2,1.4,.4,1),box-shadow .18s ease,filter .18s ease;
    }
    #mochiFocusHome .focus-start:hover{transform:translateY(-2px) scale(1.015);filter:brightness(1.04)}
    #mochiFocusHome .focus-start:active{transform:translateY(3px) scale(.99);box-shadow:0 1px 0 #5e3f8b}
    #mochiFocusHome .focus-done{width:min(360px,70%);border-radius:17px}

    /* FLOATING PLAY SHAPES */
    .quest-scene{position:absolute;inset:0;z-index:1;pointer-events:none;overflow:hidden}
    .quest-shape{position:absolute;display:block;opacity:.74;filter:drop-shadow(0 6px 8px rgba(76,53,109,.08))}
    .quest-shape.ring{width:70px;height:70px;border:12px solid rgba(133,95,184,.19);border-radius:50%;right:25px;top:23px;animation:questFloatA 6.5s ease-in-out infinite}
    .quest-shape.diamond{width:38px;height:38px;border-radius:11px;background:rgba(246,177,203,.45);right:102px;bottom:30px;transform:rotate(25deg);animation:questSpin 9s linear infinite}
    .quest-shape.dot{width:22px;height:22px;border-radius:50%;background:rgba(240,192,97,.56);right:52px;bottom:38px;animation:questFloatB 5.2s ease-in-out infinite}
    .quest-shape.capsule{width:54px;height:20px;border-radius:999px;background:rgba(120,194,179,.34);right:124px;top:38px;transform:rotate(-24deg);animation:questSway 7s ease-in-out infinite}
    .quest-orbit{position:absolute;right:30px;top:61px;width:116px;height:116px;border:1.5px dashed rgba(111,82,153,.20);border-radius:50%;animation:questSpin 18s linear infinite}
    .quest-orbit:after{content:'';position:absolute;width:13px;height:13px;border-radius:50%;background:rgba(121,86,168,.36);top:-7px;left:50%;transform:translateX(-50%)}
    @keyframes questFloatA{0%,100%{transform:translateY(0) rotate(-4deg)}50%{transform:translateY(-10px) rotate(6deg)}}
    @keyframes questFloatB{0%,100%{transform:translate(0,0)}50%{transform:translate(-7px,-12px)}}
    @keyframes questSpin{to{transform:rotate(385deg)}}
    @keyframes questSway{0%,100%{transform:rotate(-24deg) translateY(0)}50%{transform:rotate(-10deg) translateY(-10px)}}

    /* WEEKLY QUEST PATH */
    #mochiFocusHome .focus-week{
      padding:15px 14px 13px;border-radius:22px;background:rgba(255,255,255,.78);
      border:2px solid rgba(111,82,153,.10);box-shadow:none;
    }
    #mochiFocusHome .focus-week-head{margin-bottom:10px;align-items:center}
    #mochiFocusHome .focus-week h2{font-size:1.18rem;margin:0}
    #mochiFocusHome .focus-list{display:grid;gap:2px}
    #mochiFocusHome .focus-row{
      position:relative;display:grid;grid-template-columns:34px 58px 1fr;gap:8px;align-items:center;
      min-height:48px;padding:6px 7px;border-radius:14px;transition:transform .16s ease,background .16s ease;
    }
    #mochiFocusHome .focus-row:not(:last-child):after{
      content:'';position:absolute;left:23px;top:39px;width:3px;height:17px;border-radius:4px;background:rgba(111,82,153,.13)
    }
    #mochiFocusHome .focus-row.done:not(:last-child):after{background:rgba(91,162,137,.35)}
    #mochiFocusHome .focus-row.current{background:rgba(235,225,249,.66);cursor:pointer}
    #mochiFocusHome .focus-row.current:hover{transform:translateX(3px)}
    #mochiFocusHome .focus-row.done{opacity:.66}
    #mochiFocusHome .focus-check{
      position:relative;z-index:2;width:27px;height:27px;border-radius:10px;
      border:2px solid rgba(111,82,153,.18);background:#fff;color:#70509a;
      box-shadow:0 3px 8px rgba(76,53,109,.07);font-size:.74rem;
    }
    #mochiFocusHome .focus-row.current .focus-check{
      border-color:#8b67b9;background:#f4edff;color:#70509a;
      animation:questPulse 2.1s ease-in-out infinite;
    }
    #mochiFocusHome .focus-row.done .focus-check{border-color:#62a68f;background:#6eae98;color:#fff}
    @keyframes questPulse{0%,100%{box-shadow:0 0 0 0 rgba(139,103,185,.18)}50%{box-shadow:0 0 0 7px rgba(139,103,185,0)}}
    #mochiFocusHome .focus-row b{font-size:.91rem;line-height:1.16}
    #mochiFocusHome .focus-when{font-size:.64rem;padding-top:0;color:var(--slate)}
    #mochiFocusHome .focus-more{margin:6px 0 14px}
    #mochiFocusHome .focus-more>summary{font-size:.82rem;padding:7px;color:var(--slate)}

    @media(max-width:560px){
      #mochiFocusHome .focus-today{padding:18px;min-height:220px}
      #mochiFocusHome .focus-title{font-size:1.68rem;max-width:74%}
      #mochiFocusHome .focus-progress,#mochiFocusHome .focus-start,#mochiFocusHome .focus-done{width:72%}
      .quest-shape.ring{width:58px;height:58px;border-width:10px;right:18px;top:26px}
      .quest-orbit{width:91px;height:91px;right:19px;top:68px}
      .quest-shape.diamond{right:75px;bottom:28px;width:31px;height:31px}
      .quest-shape.dot{right:25px;bottom:38px}
      .quest-shape.capsule{right:72px;top:35px;width:43px}
      #mochiFocusHome .focus-row{grid-template-columns:32px 54px 1fr;gap:5px;padding-left:5px}
      #mochiFocusHome .focus-row:not(:last-child):after{left:19px}
    }
    @media(prefers-reduced-motion:reduce){
      .quest-shape,.quest-orbit,#mochiFocusHome .focus-row.current .focus-check{animation:none!important}
      #mochiFocusHome .focus-start,#mochiFocusHome .focus-row{transition:none!important}
    }
  `;
  document.head.appendChild(s);
}

function partFrom(text){
  const m=String(text||'').match(/PART\s+(\d)/i);
  return m?Number(m[1]):null;
}

function ensureScene(host){
  const card=host.querySelector('.focus-today');
  if(!card||card.querySelector('.quest-scene')) return;
  const scene=document.createElement('div');
  scene.className='quest-scene';scene.setAttribute('aria-hidden','true');
  scene.innerHTML='<span class="quest-shape ring"></span><span class="quest-shape diamond"></span><span class="quest-shape dot"></span><span class="quest-shape capsule"></span><span class="quest-orbit"></span>';
  card.prepend(scene);
}

function shortTask(host){
  const kicker=host.querySelector('.focus-kicker');
  const title=host.querySelector('.focus-title');
  const sub=host.querySelector('.focus-sub');
  const btn=host.querySelector('.focus-start');
  if(!kicker||!title) return;

  const raw=(kicker.dataset.rawKicker||kicker.textContent||'');
  if(!kicker.dataset.rawKicker) kicker.dataset.rawKicker=raw;
  const rawTitle=(title.dataset.rawTitle||title.textContent||'');
  if(!title.dataset.rawTitle) title.dataset.rawTitle=rawTitle;
  const rawSub=(sub?.dataset.rawSub||sub?.textContent||'');
  if(sub&&!sub.dataset.rawSub) sub.dataset.rawSub=rawSub;
  const part=partFrom(raw);

  kicker.textContent='TODAY';
  if(part){
    title.textContent='Math Check '+part;
    const q=(rawSub.match(/(\d+)\s+question/i)||[])[1];
    const mins=(rawSub.match(/about\s+(\d+)\s+min/i)||[])[1];
    if(sub) sub.textContent=(q?q+' question'+(q==='1'?'':'s'):'A few questions')+(mins?' · ~'+mins+' min':'');
  }else if(/TRANSFER|new-looking/i.test(raw+' '+rawTitle)){
    title.textContent='New Problems';
    const q=(rawSub.match(/(\d+)\s+question/i)||[])[1];
    if(sub) sub.textContent=(q?q+' question'+(q==='1'?'':'s'):'8 questions')+' · take your time';
  }else if(/REVIEW|Strengthen/i.test(raw+' '+rawTitle)){
    title.textContent='Quick Review';
    if(sub) sub.textContent='One idea · ~15 min';
  }else if(/COMPLETE|finished/i.test(raw+' '+rawTitle)){
    kicker.textContent='DONE';
    title.textContent='All done!';
    if(sub) sub.textContent='Nice work today.';
  }
  if(btn) btn.textContent=/continue/i.test(btn.textContent||'')?'Continue →':'Start →';
  ensureScene(host);
}

function shortWeek(host){
  const map=[
    [/Starting point\s*·\s*Part 1/i,'Math Check 1'],
    [/Starting point\s*·\s*Part 2/i,'Math Check 2'],
    [/Starting point\s*·\s*Part 3/i,'Math Check 3'],
    [/Starting point\s*·\s*Part 4/i,'Math Check 4'],
    [/Adaptive transfer check/i,'Mix It Up'],
    [/Repair one weak idea/i,'Fix One Thing'],
    [/Review together \+ light challenge/i,'Challenge']
  ];
  host.querySelectorAll('.focus-row b').forEach(el=>{
    const raw=el.dataset.rawTitle||el.textContent||'';
    if(!el.dataset.rawTitle)el.dataset.rawTitle=raw;
    let t=raw;
    for(const [re,repl] of map){if(re.test(raw)){t=repl;break;}}
    el.textContent=t;
  });
  host.querySelectorAll('.focus-row').forEach((row,i)=>{
    const check=row.querySelector('.focus-check');
    if(check&&!row.classList.contains('done')&&!row.classList.contains('current')) check.textContent=String(i+1);
    if(check&&row.classList.contains('current')) check.textContent='→';
    if(row.classList.contains('current')){
      row.tabIndex=0;row.setAttribute('role','button');row.setAttribute('aria-label','Start current task');
      row.onclick=()=>host.querySelector('.focus-start')?.click();
      row.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();host.querySelector('.focus-start')?.click();}};
    }
  });
  const more=host.querySelector('.focus-more>summary');if(more)more.textContent='More';
}

function markVersion(){
  document.querySelectorAll('[data-app-version]').forEach(el=>el.textContent='v'+VERSION);
  document.querySelectorAll('[data-release-date]').forEach(el=>{el.dateTime='2026-09-13';el.textContent='13 September 2026';});
  const n=document.getElementById('releaseNotes');
  if(n)n.textContent='Playful task dashboard: short Today quest, animated shapes, visual weekly path, and one clear Start button.';
}

function simplify(){
  if(busy)return;
  const host=document.getElementById('mochiFocusHome');if(!host)return;
  busy=true;
  try{addStyle();shortTask(host);shortWeek(host);markVersion();}
  finally{busy=false;}
}

function init(){
  addStyle();markVersion();simplify();
  observer=new MutationObserver(()=>requestAnimationFrame(simplify));
  observer.observe(document.body,{childList:true,subtree:true,characterData:true});
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
