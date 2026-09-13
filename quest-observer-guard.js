/* v4.2.8 guard: quest visuals update from mochi:focus-rendered, not a broad DOM observer.
   This temporarily supplies a no-op MutationObserver while quest-visuals initialises,
   then restores the browser-native constructor immediately afterwards. */
(function(){
'use strict';
const Native=window.MutationObserver;
if(!Native)return;
class QuietObserver{
  constructor(){this.active=false;}
  observe(){this.active=true;}
  disconnect(){this.active=false;}
  takeRecords(){return[];}
}
window.MutationObserver=QuietObserver;
const restore=()=>{if(window.MutationObserver===QuietObserver)window.MutationObserver=Native;};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(restore,0),{once:true});
else setTimeout(restore,0);
})();
