/* Mochi v4.2.9 — tiny performance/version hotfix. */
(function(){
'use strict';
const VERSION='4.2.9';
function mark(){
  document.querySelectorAll('[data-app-version]').forEach(el=>el.textContent='v'+VERSION);
  document.querySelectorAll('[data-release-date]').forEach(el=>{el.dateTime='2026-09-13';el.textContent='13 September 2026';});
  const n=document.getElementById('releaseNotes');
  if(n)n.textContent='Performance hotfix: fast cached home shell, no duplicate startup precache, and lazy caching of Science assets.';
}
function init(){mark();document.addEventListener('mochi:focus-rendered',()=>requestAnimationFrame(mark));}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
