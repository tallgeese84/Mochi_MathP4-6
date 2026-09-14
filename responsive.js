/* Event-driven viewport updates; never reset the question or the handwriting pad. */
(function(){
'use strict';
let frame=0;
const paused=new Set();
function viewport(){
 frame=0;
 const v=window.visualViewport, h=v?.height||window.innerHeight;
 const top=v?.offsetTop||0, bottom=Math.max(0,window.innerHeight-h-top);
 const style=document.documentElement.style;
 for(const [key,value] of Object.entries({'--visible-height':h+'px','--visual-top':top+'px','--visual-bottom':bottom+'px'}))if(style.getPropertyValue(key)!==value)style.setProperty(key,value);
 const typing=document.activeElement?.matches('textarea,input:not([type=checkbox]):not([type=radio]):not([type=range]),[contenteditable=true]');
 // A dragged lab must not retain desktop coordinates after the window shrinks.
 const lab=document.getElementById('visualLab');
 if(lab&&(lab.style.left||lab.style.top)){
  const r=lab.getBoundingClientRect();
  if(window.innerWidth<=780||r.right>window.innerWidth||r.bottom>window.innerHeight||r.left<0||r.top<0)
   Object.assign(lab.style,{left:'',top:'',right:'',bottom:''});
 }
 document.body.classList.toggle('keyboard-open',!!typing&&(v?.scale||1)<1.1&&window.innerHeight-h>120);
}
function schedule(){if(!frame)frame=requestAnimationFrame(viewport);}
function visibility(){
 const hidden=document.visibilityState==='hidden';
 document.body.classList.toggle('app-hidden',hidden);
 if(hidden){document.querySelectorAll('#mochiFocusHome *').forEach(el=>el.getAnimations?.().forEach(a=>{if(a.playState==='running'){a.pause();paused.add(a);}}));}
 else {paused.forEach(a=>{if(a.playState==='paused')a.play();});paused.clear();schedule();}
}
function init(){
 viewport();visibility();
 window.addEventListener('resize',schedule);
 window.visualViewport?.addEventListener('resize',schedule);
 window.visualViewport?.addEventListener('scroll',schedule);
 document.addEventListener('focusin',schedule);document.addEventListener('focusout',schedule);
 document.addEventListener('visibilitychange',visibility);
}
if(window.MochiReady)init();else document.addEventListener('mochi:ready',init,{once:true});
})();
