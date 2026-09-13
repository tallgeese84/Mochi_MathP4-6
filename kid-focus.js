/* Mochi v4.2.4 — kid-sized copy layer.
   Keeps the task engine intact; removes adult-facing explanation from Euna's home view. */
(function(){
'use strict';

const VERSION='4.2.4';
let busy=false;

function addStyle(){
  if(document.getElementById('mochiKidFocusStyle')) return;
  const s=document.createElement('style');
  s.id='mochiKidFocusStyle';
  s.textContent=`
    #mochiFocusHome .focus-date,
    #mochiFocusHome .focus-note,
    #mochiFocusHome .focus-week-head span,
    #mochiFocusHome .focus-row small,
    #mochiFocusHome .focus-more-note{display:none!important}

    #mochiFocusHome .focus-today{padding:18px 18px 17px;margin-bottom:10px}
    #mochiFocusHome .focus-kicker{font-size:.72rem;margin-bottom:8px}
    #mochiFocusHome .focus-title{font-size:1.7rem;line-height:1.08;margin:0 0 7px}
    #mochiFocusHome .focus-sub{font-size:.93rem;margin:0 0 10px;color:var(--slate)}
    #mochiFocusHome .focus-progress{margin:9px 0 13px}
    #mochiFocusHome .focus-start{font-size:1.12rem;padding:15px 20px}

    #mochiFocusHome .focus-week{padding:14px 14px 10px}
    #mochiFocusHome .focus-week-head{margin-bottom:7px}
    #mochiFocusHome .focus-week h2{font-size:1.16rem}
    #mochiFocusHome .focus-list{gap:3px}
    #mochiFocusHome .focus-row{grid-template-columns:25px 58px 1fr;gap:7px;padding:7px 4px;align-items:center}
    #mochiFocusHome .focus-row b{font-size:.9rem;line-height:1.2}
    #mochiFocusHome .focus-when{font-size:.65rem;padding-top:0}
    #mochiFocusHome .focus-check{width:21px;height:21px}
    #mochiFocusHome .focus-more>summary{font-size:.82rem;padding:7px}

    @media(max-width:560px){
      #mochiFocusHome .focus-today{padding:16px}
      #mochiFocusHome .focus-title{font-size:1.5rem}
      #mochiFocusHome .focus-row{grid-template-columns:23px 54px 1fr;gap:5px}
    }
  `;
  document.head.appendChild(s);
}

function partFrom(text){
  const m=String(text||'').match(/PART\s+(\d)/i);
  return m?Number(m[1]):null;
}

function shortTask(host){
  const kicker=host.querySelector('.focus-kicker');
  const title=host.querySelector('.focus-title');
  const sub=host.querySelector('.focus-sub');
  const btn=host.querySelector('.focus-start');
  if(!kicker||!title) return;

  const originalKicker=kicker.textContent||'';
  const originalTitle=title.textContent||'';
  const originalSub=sub?.textContent||'';
  const part=partFrom(originalKicker);

  kicker.textContent='TODAY';

  if(part){
    title.textContent='Math Check '+part;
    const q=(originalSub.match(/(\d+)\s+question/i)||[])[1];
    const mins=(originalSub.match(/about\s+(\d+)\s+min/i)||[])[1];
    if(sub) sub.textContent=(q?q+' question'+(q==='1'?'':'s'):'A few questions')+(mins?' · ~'+mins+' min':'');
  }else if(/TRANSFER|new-looking/i.test(originalKicker+' '+originalTitle)){
    title.textContent='New Problems';
    const q=(originalSub.match(/(\d+)\s+question/i)||[])[1];
    if(sub) sub.textContent=(q?q+' question'+(q==='1'?'':'s'):'8 questions')+' · take your time';
  }else if(/REVIEW|Strengthen/i.test(originalKicker+' '+originalTitle)){
    title.textContent='Quick Review';
    if(sub) sub.textContent='One idea to practise';
  }else if(/COMPLETE|finished/i.test(originalKicker+' '+originalTitle)){
    kicker.textContent='DONE';
    title.textContent='All done!';
    if(sub) sub.textContent='Nice work today.';
  }

  if(btn){
    btn.textContent=/continue/i.test(btn.textContent||'')?'Continue →':'Start →';
  }
}

function shortWeek(host){
  const map=[
    [/Starting point\s*·\s*Part 1/i,'Math Check 1'],
    [/Starting point\s*·\s*Part 2/i,'Math Check 2'],
    [/Starting point\s*·\s*Part 3/i,'Math Check 3'],
    [/Starting point\s*·\s*Part 4/i,'Math Check 4'],
    [/Adaptive transfer check/i,'New Problems'],
    [/Repair one weak idea/i,'Fix One Thing'],
    [/Review together \+ light challenge/i,'Challenge + Review']
  ];
  host.querySelectorAll('.focus-row b').forEach(el=>{
    let t=el.textContent||'';
    for(const [re,repl] of map){ if(re.test(t)){t=repl;break;} }
    el.textContent=t;
  });

  const more=host.querySelector('.focus-more>summary');
  if(more) more.textContent='More';
}

function markVersion(){
  document.querySelectorAll('[data-app-version]').forEach(el=>el.textContent='v'+VERSION);
  document.querySelectorAll('[data-release-date]').forEach(el=>{el.dateTime='2026-09-13';el.textContent='13 September 2026';});
  const n=document.getElementById('releaseNotes');
  if(n) n.textContent='Simpler learner home: short Today card, compact weekly checklist, and one clear Start button.';
}

function simplify(){
  if(busy) return;
  const host=document.getElementById('mochiFocusHome');
  if(!host) return;
  busy=true;
  try{
    addStyle();
    shortTask(host);
    shortWeek(host);
    markVersion();
  }finally{busy=false;}
}

function init(){
  addStyle();
  markVersion();
  simplify();
  const observer=new MutationObserver(()=>requestAnimationFrame(simplify));
  observer.observe(document.body,{childList:true,subtree:true,characterData:true});
}

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
})();
