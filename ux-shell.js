/* The one way round the app: Today, Learn, Papers and Mochi. Navigation only; it reads which screen
   is showing and asks the existing screens to open. Hidden during a timed paper so it cannot be left by
   accident. */
(function(root){
'use strict';
const $=id=>document.getElementById(id);
const ICON={
 today:'<path d="M5 6h14v13H5z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M5 10h14M9 4v4M15 4v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="14.5" r="1.8" fill="currentColor"/>',
 learn:'<path d="M4 6.5C6.5 5 9.5 5 12 6.8 14.5 5 17.5 5 20 6.5V19c-2.5-1.5-5.5-1.5-8 .3-2.5-1.8-5.5-1.8-8-.3z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M12 6.8v12.5" stroke="currentColor" stroke-width="2"/>',
 papers:'<path d="M7 3h7l4 4v14H7z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M14 3v4h4M10 12h5M10 16h5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
 mochi:'<ellipse cx="6.5" cy="9" rx="1.9" ry="2.5" fill="currentColor"/><ellipse cx="10.5" cy="6.2" rx="1.9" ry="2.6" fill="currentColor"/><ellipse cx="14.5" cy="6.2" rx="1.9" ry="2.6" fill="currentColor"/><ellipse cx="18.3" cy="9" rx="1.9" ry="2.5" fill="currentColor"/><path d="M12.4 11.2c3 0 5.6 3.6 5.6 6 0 2.1-1.6 2.8-3.1 2.8-1.2 0-1.6-.6-2.5-.6s-1.4.6-2.6.6C8.3 20 7 19.3 7 17.2c0-2.4 2.4-6 5.4-6z" fill="currentColor"/>'
};
const ITEMS=[['today','Today'],['learn','Learn'],['papers','Papers'],['mochi','Mochi']];
let nav=null,subject='maths',last='';
const ui=s=>s==='science'?root.MochiSciencePathUI:root.MochiEntranceUI;
function current(){
 if(root.MochiTodayUI?.visible?.())return 'today';
 for(const s of ['maths','science']){const u=ui(s);if(u?.visible?.()){subject=s;const k=u.view().kind;return ['paper','papers','results'].includes(k)?'papers':'learn';}}
 const room=$('viewRoom');if(room&&room.style.display!=='none'&&!room.hidden)return 'mochi';
 return '';
}
function go(id){
 if(id==='today')root.MochiTodayUI?.open?.();
 else if(id==='learn')ui(subject)?.open?.('lessons');
 else if(id==='papers')ui(subject)?.open?.('papers');
 else if(id==='mochi'&&typeof root.studioShow==='function')root.studioShow('room');
 paint(true);root.scrollTo?.({top:0,behavior:'instant'});
}
function paint(force=false){
 if(!nav)return;const b=document.body,inPaper=b.classList.contains('entrance-paper')||b.classList.contains('science-path-paper'),now=current();
 const sig=now+'|'+inPaper;if(!force&&sig===last)return;last=sig;
 nav.hidden=inPaper;b.classList.toggle('ux-has-nav',!inPaper);
 for(const btn of nav.querySelectorAll('[data-ux-nav]'))btn.toggleAttribute('aria-current',btn.dataset.uxNav===now);
}
function init(){
 if(nav||!document.body)return;
 nav=document.createElement('nav');nav.className='ux-nav';nav.setAttribute('aria-label','Main');
 nav.innerHTML=ITEMS.map(([id,label])=>`<button type="button" data-ux-nav="${id}"><svg viewBox="0 0 24 24" aria-hidden="true">${ICON[id]}</svg><span>${label}</span></button>`).join('');
 document.body.append(nav);
 for(const btn of nav.querySelectorAll('[data-ux-nav]'))btn.onclick=()=>go(btn.dataset.uxNav);
 document.addEventListener('mochi:activity',()=>paint());document.addEventListener('click',()=>setTimeout(paint,0),true);
 setInterval(paint,900);paint(true);
}
root.MochiShell={init,paint,current,go};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,0));else setTimeout(init,0);
})(window);
