/* v4.3.3 visible release marker. */
(function(){
'use strict';
const VERSION='4.3.3', DATE='2026-09-13';
function mark(){
  document.querySelectorAll('[data-app-version]').forEach(el=>el.textContent='v'+VERSION);
  document.querySelectorAll('[data-release-date]').forEach(el=>{el.dateTime=DATE;el.textContent='13 September 2026';});
  const n=document.getElementById('releaseNotes');
  if(n)n.textContent='Self-healing cache update, Firebase family sync, exact cloud backup JSON, private Google Drive learning mirror, and animated home illustrations.';
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mark,{once:true});else mark();
document.addEventListener('mochi:focus-rendered',mark);
document.addEventListener('mochi:cloud-merged',mark);
document.addEventListener('mochi:cloud-backup-saved',mark);
document.addEventListener('mochi:drive-mirrored',mark);
})();
