/* Load Mochi's Home (3D pet care) on demand; learning and purchases stay in the existing app. */
(function(root){
'use strict';
function init(){
 const $=id=>document.getElementById(id),view=$('viewRoom'),host=$('mochi3d'),picture=$('stage');
 if(!view||!host)return;
 const modeKey='mochi-room-view-v1',script=document.querySelector('script[src*="mochi-room.js"]');
 const version=new URL(script.src,document.baseURI).searchParams.get('v');
 const moduleURL=new URL('mochi-home-scene.js',script.src);moduleURL.searchParams.set('v',version);
 let wasShown=false,api=null,pending=null,failed=false,forwarding=false,preferPicture=false,quality=/Android/i.test(navigator.userAgent)?'lite':'full',failure='',retry=0;
 try{preferPicture=localStorage.getItem(modeKey)==='picture';}catch(_){}
 const visible=()=>view.style.display!=='none'&&!view.hidden;
 function saveMode(){try{localStorage.setItem(modeKey,preferPicture?'picture':'3d');}catch(_){} }
 function fail(error){
  failure=error?.message||'The browser reset the 3D view.';failed=true;
  const previous=api;api=null;try{previous?.setVisible(false);previous?.dispose();}catch(_){}
  paint();
 }
 function sync(){
  if(!api)return;
  try{
   const selected=root.MochiCatFriends.sync(S).selected;
   if(typeof api.setFriends!=='function'||typeof api.getFriendCount!=='function')throw Error('The room graphics are from an older update. Retry 3D while online.');
   api.setFriends(selected);
   if(api.getFriendCount()!==selected.length)throw Error('Not all selected cat friends could be drawn. Their portraits are available above.');
   api.setWear(S.worn||{});
   const pet=root.MochiPlanner?.pet(root.MochiPlanner.init(S));
   api.setGrowth(pet?.level||0);
   api.setToys?.(S.home?.toys||['feather','yarn']);root.MochiHomeUI?.refresh?.();
  }catch(error){fail(error);}
 }
 async function loadScene(){
  if(typeof root.MochiCatFriends?.sync!=='function')throw Error('Cat Friends files are incomplete. Refresh while online; your saved progress is kept.');
  let scene=await import(moduleURL.href);
  if(scene.CAT_FRIENDS_VERSION!==1){
   const fresh=new URL(moduleURL.href);fresh.searchParams.set('repair',String(Date.now()));
   scene=await import(fresh.href);
  }
  if(scene.CAT_FRIENDS_VERSION!==1)throw Error('The room graphics need an online update. Your selected friends and progress are kept.');
  return scene;
 }
 function paint(){
  const active=!preferPicture&&!failed;
  host.hidden=!active;picture.hidden=active;view.classList.toggle('home-3d',active&&!!api);
  $('room3dMode').setAttribute('aria-pressed',String(active));
  $('roomPictureMode').setAttribute('aria-pressed',String(!active));
  $('petBtn').parentElement.hidden=active&&!!api;
  $('room3dStatus').textContent=failed?'3D could not start: '+failure+' Your selected cat portraits are above; picture mode is still available.':pending?'Mochi is waking up…':'';
  $('room3dRetry').hidden=!failed;
  const shown=active&&visible();if(shown&&api&&!wasShown)root.MochiHomeUI?.visit?.();wasShown=shown&&!!api;
  api?.setVisible(shown);
 }
 async function ensure(){
  if(!visible()||preferPicture||failed||api||pending){paint();return;}
  pending=(async()=>{
   try{
    const scene=await loadScene();
    api=await scene.mountMochiRoom(host,{
     quality,
     friends:root.MochiCatFriends?.sync(S).selected||[],
     level:root.MochiPlanner?.pet(root.MochiPlanner.init(S)).level||0,
     onPet(){forwarding=true;try{petCat();}finally{forwarding=false;}},
     onStroke(n){forwarding=true;try{if(root.MochiHomeUI?.stroke)root.MochiHomeUI.stroke(n);else petCat();}finally{forwarding=false;}},
     onBrush:n=>root.MochiHomeUI?.brush?.(n),onPlay:n=>root.MochiHomeUI?.play?.(n),onNap:n=>root.MochiHomeUI?.nap?.(n),onTap:(k,id)=>root.MochiHomeUI?.tap?.(k,id),
     toys:S.home?.toys||['feather','yarn'],worn:S.worn||{},reducedMotion:!!root.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
     onError:fail
    });
    sync();root.MochiHomeUI?.attach?.(api);
   }catch(error){fail(error);console.warn('Mochi room unavailable:',error.message);}
   finally{pending=null;paint();}
  })();
  paint();await pending;
 }
 $('room3dMode').onclick=()=>{preferPicture=false;saveMode();paint();ensure();};
 $('roomPictureMode').onclick=()=>{preferPicture=true;saveMode();paint();};
 $('room3dRetry').onclick=()=>{api?.dispose();api=null;host.querySelectorAll('canvas').forEach(n=>n.remove());failed=false;failure='';quality='lite';moduleURL.searchParams.set('retry',String(++retry));preferPicture=false;saveMode();ensure();};
 document.addEventListener('mochi:pet',()=>{if(!forwarding&&api&&!preferPicture&&!failed)api.pet();});
 document.addEventListener('mochi:fed',e=>{if(api&&!preferPicture&&!failed)api.feed(e.detail?.name,e.detail?.id);});
 document.addEventListener('mochi:cat-friends-changed',sync);
 document.addEventListener('mochi:state-saved',sync);
 document.addEventListener('mochi:cloud-merged',sync);
 document.addEventListener('mochi:activity',ensure);
 const observer=new MutationObserver(()=>{paint();if(visible())ensure();});
 observer.observe(view,{attributes:true,attributeFilter:['style','hidden']});
 paint();if(visible())ensure();
 root.MochiRoom={refresh:sync,open:ensure,scene:()=>(!preferPicture&&!failed?api:null),petFriend:id=>!preferPicture&&!failed&&!!api?.petFriend(id)};
}
if(root.MochiReady)init();else document.addEventListener('mochi:ready',init,{once:true});
})(window);
