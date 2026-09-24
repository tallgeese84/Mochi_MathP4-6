/* Load Mochi's 3D room on demand; learning and purchases stay in the existing app. */
(function(root){
'use strict';
function init(){
 const $=id=>document.getElementById(id),view=$('viewRoom'),host=$('mochi3d'),picture=$('stage');
 if(!view||!host)return;
 const modeKey='mochi-room-view-v1',script=document.querySelector('script[src*="mochi-room.js"]');
 const version=new URL(script.src,document.baseURI).searchParams.get('v');
 const moduleURL=new URL('mochi-room-scene.js',script.src);moduleURL.searchParams.set('v',version);
 let api=null,pending=null,failed=false,forwarding=false,preferPicture=false;
 try{preferPicture=localStorage.getItem(modeKey)==='picture';}catch(_){}
 const visible=()=>view.style.display!=='none'&&!view.hidden;
 function saveMode(){try{localStorage.setItem(modeKey,preferPicture?'picture':'3d');}catch(_){} }
 function sync(){
  if(!api)return;
  api.setWear(S.worn||{});
  const pet=root.MochiPlanner?.pet(root.MochiPlanner.init(S));
  api.setGrowth(pet?.level||0);
 }
 function paint(){
  const active=!preferPicture&&!failed;
  host.hidden=!active;picture.hidden=active;
  $('room3dMode').setAttribute('aria-pressed',String(active));
  $('roomPictureMode').setAttribute('aria-pressed',String(!active));
  $('petBtn').parentElement.hidden=active&&!!api;
  $('room3dStatus').textContent=failed?'The 3D room is unavailable here. You can still play with Mochi’s picture.':pending?'Mochi is waking up…':'';
  $('room3dRetry').hidden=!failed;
  api?.setVisible(active&&visible());
 }
 async function ensure(){
  if(!visible()||preferPicture||failed||api||pending){paint();return;}
  pending=(async()=>{
   try{
    const scene=await import(moduleURL.href);
    api=await scene.mountMochiRoom(host,{
     level:root.MochiPlanner?.pet(root.MochiPlanner.init(S)).level||0,
     onPet(){forwarding=true;try{petCat();}finally{forwarding=false;}},
     onError(){failed=true;paint();}
    });
    sync();
   }catch(error){failed=true;console.warn('Mochi room unavailable:',error.message);}
   finally{pending=null;paint();}
  })();
  paint();await pending;
 }
 $('room3dMode').onclick=()=>{preferPicture=false;saveMode();paint();ensure();};
 $('roomPictureMode').onclick=()=>{preferPicture=true;saveMode();paint();};
 $('room3dRetry').onclick=()=>{api?.dispose();api=null;host.querySelectorAll('canvas').forEach(n=>n.remove());failed=false;preferPicture=false;saveMode();ensure();};
 document.addEventListener('mochi:pet',()=>{if(!forwarding&&api&&!preferPicture&&!failed)api.pet();});
 document.addEventListener('mochi:fed',e=>{if(api&&!preferPicture&&!failed)api.feed(e.detail?.name);});
 document.addEventListener('mochi:state-saved',sync);
 document.addEventListener('mochi:cloud-merged',sync);
 document.addEventListener('mochi:activity',ensure);
 const observer=new MutationObserver(()=>{paint();if(visible())ensure();});
 observer.observe(view,{attributes:true,attributeFilter:['style','hidden']});
 paint();if(visible())ensure();
 root.MochiRoom={refresh:sync,open:ensure};
}
if(root.MochiReady)init();else document.addEventListener('mochi:ready',init,{once:true});
})(window);
