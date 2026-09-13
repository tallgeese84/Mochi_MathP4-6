/* v4.3.0 visible release marker. */
(function(){
'use strict';
const VERSION='4.3.0', DATE='2026-09-13';
function mark(){
  document.querySelectorAll('[data-app-version]').forEach(el=>el.textContent='v'+VERSION);
  document.querySelectorAll('[data-release-date]').forEach(el=>{el.dateTime=DATE;el.textContent='13 September 2026';});
  const n=document.getElementById('releaseNotes');
  if(n)n.textContent='Family Firebase progress sync plus reliable animated home illustrations using the Web Animations API.';
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mark,{once:true});else mark();
document.addEventListener('mochi:focus-rendered',mark);
document.addEventListener('mochi:cloud-merged',mark);
})();
