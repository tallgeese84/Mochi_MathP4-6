/* Mochi v4.3.5 — one authoritative visible release. */
(function(){
'use strict';
const VERSION='4.3.5', DATE='2026-09-13', LABEL='13 September 2026';
let writing=false, observer=null;
function mark(){
  if(writing)return;writing=true;
  try{
    document.querySelectorAll('[data-app-version]').forEach(el=>{if(el.textContent!=='v'+VERSION)el.textContent='v'+VERSION;});
    document.querySelectorAll('[data-release-date]').forEach(el=>{el.dateTime=DATE;if(el.textContent!==LABEL)el.textContent=LABEL;});
    const n=document.getElementById('releaseNotes');
    if(n)n.textContent='v4.3.5: direct index, Firebase sync, exact learning backup, private Drive mirror, and animated illustrated home scenes.';
  }finally{writing=false;}
}
function startObserver(){
  mark();
  try{
    observer=new window.MutationObserver(()=>queueMicrotask(mark));
    observer.observe(document.body,{subtree:true,childList:true,characterData:true});
  }catch(e){}
  document.addEventListener('mochi:focus-rendered',mark,true);
  document.addEventListener('mochi:cloud-merged',mark,true);
  document.addEventListener('mochi:cloud-backup-saved',mark,true);
  [50,150,500,1200].forEach(ms=>setTimeout(mark,ms));
  setInterval(mark,2000);
}
mark();
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(startObserver,80),{once:true});
else setTimeout(startObserver,80);
})();
