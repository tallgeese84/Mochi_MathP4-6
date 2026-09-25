/* Lightweight breed-specific visitors share Mochi's renderer and render loop. */
(function(root){
'use strict';
function mount(T,scene,{lite=false,onPet=()=>{}}={}){
 const group=new T.Group();group.name='Cat friends';scene.add(group);
 const sphere=new T.SphereGeometry(1,lite?16:24,lite?12:16);
 const earShape=new T.Shape();earShape.moveTo(-.16,0);earShape.quadraticCurveTo(-.17,.16,-.02,.40);earShape.quadraticCurveTo(.025,.45,.07,.34);earShape.lineTo(.17,0);earShape.closePath();
 const ear=new T.ExtrudeGeometry(earShape,{depth:.07,bevelEnabled:true,bevelThickness:.025,bevelSize:.025,bevelSegments:2,curveSegments:8});
 const geometries=new Set([sphere,ear]),materials=new Set(),cats=new Map();let disposed=false,time=0;
 const material=color=>{const m=new T.MeshStandardMaterial({color,roughness:.82});materials.add(m);return m;};
 const shared={pink:material('#cf989d'),nose:material('#986573'),pupil:material('#292233'),white:material('#fff8ee')};
 function ell(parent,pos,scale,mat){const m=new T.Mesh(sphere,mat);m.position.set(...pos);m.scale.set(...scale);m.castShadow=!lite;m.receiveShadow=!lite;parent.add(m);return m;}
 function build(info){
  const cat=new T.Group();cat.name=info.name+' — '+info.breed;cat.userData.friendId=info.id;
  const coat=material(info.coat),points=material(info.point),iris=material(info.eyes),fluff=info.shape==='fluffy'||info.shape==='tufted',slender=info.shape==='slender';
  const body=new T.Group();cat.add(body);
  ell(body,[0,.52,-.05],[slender?.26:.36,fluff?.51:.45,.35],coat);
  for(const side of [-1,1]){
   ell(body,[side*.27,.23,-.08],[.19,.22,.24],coat);
   ell(body,[side*.15,.25,.26],[.095,.26,.11],coat);
   ell(body,[side*.15,.075,.32],[.12,.075,.18],slender?points:coat);
  }
  if(fluff){ell(body,[0,.74,.20],[.37,.26,.21],info.id==='yuki'?shared.white:coat);for(let i=0;i<7;i++){const a=(i/6-.5)*Math.PI;ell(body,[Math.sin(a)*.31,.66-Math.cos(a)*.12,.23],[.11,.19,.10],coat);}}
  const head=new T.Group();head.position.set(0,1.04,.17);body.add(head);
  const face=ell(head,[0,0,0],[slender?.32:info.shape==='round'?.43:.39,.34,.32],coat);
  if(slender)ell(head,[0,-.02,.258],[.275,.235,.095],points);
  if(info.id==='yuki'){
   for(const side of [-1,1])ell(head,[side*.17,.015,.265],[.16,.20,.075],points);
   ell(head,[0,-.015,.324],[.065,.22,.035],shared.white);
  }
  for(const side of [-1,1]){
   const e=new T.Group();e.position.set(side*(slender?.23:.28),.24,-.02);e.rotation.z=-side*.18;
   e.scale.setScalar(info.shape==='round'?.70:slender?1.12:1);head.add(e);
   const outer=new T.Mesh(ear,slender||info.id==='yuki'?points:coat);e.add(outer);
   const inner=new T.Mesh(ear,shared.pink);inner.scale.set(.57,.67,.38);inner.position.set(.002,.04,.09);e.add(inner);
   if(info.shape==='tufted'){const tuft=new T.ConeGeometry(.045,.17,5);geometries.add(tuft);const t=new T.Mesh(tuft,points);t.position.set(.01,.40,.02);e.add(t);}
   ell(head,[side*.135,-.14,.288],[info.shape==='tufted'?.135:.12,.10,.08],slender?points:shared.white);
  }
  if(info.shape==='tufted'){
   for(const side of [-1,1])for(let i=0;i<3;i++)ell(head,[side*(.31+i*.015),-.13-i*.045,.06],[.12,.045,.13],coat);
   for(const side of [-1,1])for(let i=0;i<2;i++){const stripe=ell(head,[side*(.095+i*.11),.245,.20],[.023,.08,.045],points);stripe.rotation.z=side*.24;}
  }
  const eyes=[];
  for(const side of [-1,1]){
   const eye=new T.Group();eye.position.set(side*.17,.025,.30);head.add(eye);
   ell(eye,[0,0,0],[.126,.145,.046],shared.pupil);
   ell(eye,[0,0,.024],[.107,.121,.04],iris);
   ell(eye,[0,0,.053],[.068,.089,.022],shared.pupil);
   ell(eye,[-.03,.047,.073],[.030,.033,.008],shared.white);
   ell(eye,[.031,-.034,.074],[.014,.017,.008],shared.white);eyes.push(eye);
  }
  ell(head,[0,-.118,.373],[.042,.028,.020],shared.nose);
  const mouth=new T.CatmullRomCurve3([new T.Vector3(-.04,-.19,.35),new T.Vector3(0,-.20,.36),new T.Vector3(.04,-.19,.35)]);
  const mouthGeo=new T.TubeGeometry(mouth,8,.005,4,false);geometries.add(mouthGeo);head.add(new T.Mesh(mouthGeo,shared.nose));
  const tailRig=new T.Group();tailRig.position.set(.27,.26,-.22);body.add(tailRig);
  const tailPath=new T.CatmullRomCurve3([new T.Vector3(0,0,0),new T.Vector3(.30,.04,-.20),new T.Vector3(.51,.35,-.18),new T.Vector3(.45,.60,-.13)]);
  const tailGeo=new T.TubeGeometry(tailPath,20,fluff?.15:slender?.055:.085,8,false);geometries.add(tailGeo);
  const tail=new T.Mesh(tailGeo,slender?points:coat);tailRig.add(tail);ell(tailRig,[.45,.60,-.13],[fluff?.15:.07,fluff?.17:.075,fluff?.15:.07],slender?points:coat);
  const cushion=ell(cat,[0,.00,0],[.58,.06,.52],material('#dcd0e8'));cushion.name=info.name+' cushion';
  cat.scale.setScalar(info.shape==='tufted'?1.02:.94);group.add(cat);
  const result={info,cat,body,head,eyes,tailRig,phase:cats.size*1.37,petUntil:-1};cats.set(info.id,result);return result;
 }
 const homes=[[-2.05,0,.50],[2.05,0,.50],[1.70,0,-1.95]];
 function set(ids=[]){
  if(disposed)return;
  const selected=[...new Set(ids)].filter(id=>root.MochiCatFriends.catalog.some(c=>c.id===id)).slice(0,3);
  for(const c of cats.values())c.cat.visible=false;
  selected.forEach((id,index)=>{const c=cats.get(id)||build(root.MochiCatFriends.catalog.find(c=>c.id===id));c.cat.visible=true;c.cat.position.set(...homes[index]);});
 }
 function tick(dt,camera){
  if(disposed)return;time+=Math.max(0,dt);
  for(const c of cats.values())if(c.cat.visible){
   const pet=time<c.petUntil,phase=time+c.phase;
   const yaw=Math.atan2(camera.position.x-c.cat.position.x,camera.position.z-c.cat.position.z);
   c.cat.rotation.y=yaw;
   c.head.rotation.z=Math.sin(phase*1.05)*.025+(pet?.12:0);
   c.body.position.y=Math.sin(phase*1.6)*.008;
   c.tailRig.rotation.y=Math.sin(phase*1.2)*(pet?.17:.08);
   const b=phase%5.7,blink=b>5.48?Math.sin((b-5.48)/.22*Math.PI):0;
   c.eyes.forEach(e=>e.scale.y=pet?.38:1-blink*.94);
  }
 }
 function pet(id){const c=cats.get(id);if(!c||!c.cat.visible)return false;c.petUntil=time+2.5;onPet(c.info);return true;}
 function hit(ray){for(const hit of ray.intersectObject(group,true)){let node=hit.object;while(node&&node!==group){if(node.userData.friendId){const c=cats.get(node.userData.friendId);if(c?.cat.visible)return pet(c.info.id);break;}node=node.parent;}}return false;}
 function dispose(){if(disposed)return;disposed=true;scene.remove(group);geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());cats.clear();}
 return {set,tick,hit,pet,dispose,get count(){return [...cats.values()].filter(c=>c.cat.visible).length;}};
}
root.MochiCatFriendsScene={mount};
if(typeof module!=='undefined')module.exports=root.MochiCatFriendsScene;
})(typeof window!=='undefined'?window:globalThis);
