/* Load Mochi's 3D room on demand; learning and purchases stay in the existing app. */
(function(root){
'use strict';
function init(){
 const $=id=>document.getElementById(id),view=$('viewRoom'),host=$('mochi3d'),picture=$('stage');
 if(!view||!host)return;
 const modeKey='mochi-room-view-v1',script=document.querySelector('script[src*="mochi-room.js"]');
 const version=new URL(script.src,document.baseURI).searchParams.get('v');
 const moduleURL=new URL('mochi-room-scene.js',script.src);moduleURL.searchParams.set('v',version);
 let api=null,pending=null,failed=false,forwarding=false,preferPicture=false,quality=/Android/i.test(navigator.userAgent)?'lite':'full',failure='',retry=0;
 try{preferPicture=localStorage.getItem(modeKey)==='picture';}catch(_){}
 const visible=()=>view.style.display!=='none'&&!view.hidden;
 function saveMode(){try{localStorage.setItem(modeKey,preferPicture?'picture':'3d');}catch(_){} }
 function fail(error){
  failure=error?.message||'The browser reset the 3D view.';failed=true;
  const previous=api;api=null;try{previous?.dispose();}catch(_){}
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
  }catch(error){fail(error);}
 }
 async function loadScene(){
  // A failed classic-script request must not quietly remove every companion.
  if(typeof root.MochiCatFriendsScene?.mount!=='function'){
   const url=new URL('cat-friends-scene.js',script.src);url.searchParams.set('v',version);
   await import(url.href);
  }
  if(typeof root.MochiCatFriends?.sync!=='function'||typeof root.MochiCatFriendsScene?.mount!=='function')throw Error('Cat Friends files are incomplete. Refresh while online; your saved progress is kept.');
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
  host.hidden=!active;picture.hidden=active;
  $('room3dMode').setAttribute('aria-pressed',String(active));
  $('roomPictureMode').setAttribute('aria-pressed',String(!active));
  $('petBtn').parentElement.hidden=active&&!!api;
  $('room3dStatus').textContent=failed?'3D could not start: '+failure+' Your selected cat portraits are above; picture mode is still available.':pending?'Mochi is waking up…':'';
  $('room3dRetry').hidden=!failed;
  api?.setVisible(active&&visible());
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
     onError:fail
    });
    sync();
   }catch(error){fail(error);console.warn('Mochi room unavailable:',error.message);}
   finally{pending=null;paint();}
  })();
  paint();await pending;
 }
 $('room3dMode').onclick=()=>{preferPicture=false;saveMode();paint();ensure();};
 $('roomPictureMode').onclick=()=>{preferPicture=true;saveMode();paint();};
 $('room3dRetry').onclick=()=>{api?.dispose();api=null;host.querySelectorAll('canvas').forEach(n=>n.remove());failed=false;failure='';quality='lite';moduleURL.searchParams.set('retry',String(++retry));preferPicture=false;saveMode();ensure();};
 document.addEventListener('mochi:pet',()=>{if(!forwarding&&api&&!preferPicture&&!failed)api.pet();});
 document.addEventListener('mochi:fed',e=>{if(api&&!preferPicture&&!failed)api.feed(e.detail?.name);});
 document.addEventListener('mochi:cat-friends-changed',sync);
 document.addEventListener('mochi:state-saved',sync);
 document.addEventListener('mochi:cloud-merged',sync);
 document.addEventListener('mochi:activity',ensure);
 const observer=new MutationObserver(()=>{paint();if(visible())ensure();});
 observer.observe(view,{attributes:true,attributeFilter:['style','hidden']});
 paint();if(visible())ensure();
 root.MochiRoom={refresh:sync,open:ensure,petFriend:id=>!preferPicture&&!failed&&!!api?.petFriend(id)};
}
if(root.MochiReady)init();else document.addEventListener('mochi:ready',init,{once:true});
})(window);
