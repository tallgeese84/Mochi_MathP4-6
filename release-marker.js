/* Mochi v4.3.4 visible release marker. */
(function(){
'use strict';
const VERSION='4.3.4', DATE='2026-09-13', LABEL='13 September 2026';
function mark(){
  document.querySelectorAll('[data-app-version]').forEach(el=>el.textContent='v'+VERSION);
  document.querySelectorAll('[data-release-date]').forEach(el=>{el.dateTime=DATE;el.textContent=LABEL;});
  const n=document.getElementById('releaseNotes');
  if(n)n.textContent='Direct-index v4.3.4: Firebase sync, exact learning backup, private Drive mirror, and animated illustrated home scenes.';
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mark,{once:true});else mark();
document.addEventListener('mochi:focus-rendered',mark);
document.addEventListener('mochi:cloud-merged',mark);
document.addEventListener('mochi:cloud-backup-saved',mark);
})();
