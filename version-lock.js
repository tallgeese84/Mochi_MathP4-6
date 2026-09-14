/* Mochi v4.3.4 — keep all visible version labels consistent. */
(function(){
'use strict';
const VERSION='4.3.4', DATE='2026-09-13', LABEL='13 September 2026';
let writing=false;
function mark(){
  if(writing)return;writing=true;
  try{
    document.querySelectorAll('[data-app-version]').forEach(el=>{if(el.textContent!=='v'+VERSION)el.textContent='v'+VERSION;});
    document.querySelectorAll('[data-release-date]').forEach(el=>{el.dateTime=DATE;if(el.textContent!==LABEL)el.textContent=LABEL;});
    const n=document.getElementById('releaseNotes');
    if(n)n.textContent='Direct-index v4.3.4: Firebase sync, exact learning backup, private Drive mirror, and animated illustrated home scenes.';
  }finally{writing=false;}
}
function init(){mark();new MutationObserver(mark).observe(document.body,{subtree:true,childList:true,characterData:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
