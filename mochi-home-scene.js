/* Mochi's Home — the 3D room. Draws the room, Mochi and visiting friends, runs Mochi's own little
   life (wandering, naps, grooming, window-watching), and turns touches into care events.
   The rules of care live in mochi-home-core.js; this file only shows them. */
export const HOME_VERSION=1;

const ROOM={minX:-2.45,maxX:2.45,minZ:-2.0,maxZ:2.1};
const SPOTS={bed:[-1.85,-1.5],bowl:[1.35,.62],box:[.95,-1.55],tree:[-1.95,1.0],window:[.45,-1.65],basket:[2.05,-1.25]};

export function timeOfDay(date=new Date()){const h=date.getHours()+date.getMinutes()/60;return h>=7&&h<17?'day':(h>=17&&h<19.5)||(h>=5.5&&h<7)?'golden':'night';}

function texture(T,draw,size=128){if(typeof document==='undefined'||typeof document.createElement!=='function')return null;const c=document.createElement('canvas');c.width=c.height=size;const g=c.getContext('2d');draw(g,size);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;return t;}
function particleTextures(T){
 const heart=(g,s)=>{g.fillStyle='#ff7a9c';g.beginPath();const x=s/2,y=s*.36;g.moveTo(x,s*.86);g.bezierCurveTo(s*.05,s*.52,s*.12,s*.08,x,y);g.bezierCurveTo(s*.88,s*.08,s*.95,s*.52,x,s*.86);g.fill();g.fillStyle='rgba(255,255,255,.55)';g.beginPath();g.ellipse(s*.33,s*.34,s*.08,s*.05,-.6,0,7);g.fill();};
 const star=(g,s)=>{g.fillStyle='#ffe58a';g.beginPath();for(let i=0;i<8;i++){const r=i%2?s*.14:s*.46,a=i/8*Math.PI*2-Math.PI/2;g.lineTo(s/2+Math.cos(a)*r,s/2+Math.sin(a)*r);}g.fill();g.fillStyle='#fff';g.beginPath();g.arc(s/2,s/2,s*.08,0,7);g.fill();};
 const zed=(g,s)=>{g.fillStyle='#8f7bd8';g.font=`bold ${s*.8}px system-ui, sans-serif`;g.textAlign='center';g.textBaseline='middle';g.fillText('z',s/2,s/2);};
 const puff=(g,s)=>{const r=g.createRadialGradient(s/2,s/2,2,s/2,s/2,s/2);r.addColorStop(0,'rgba(255,214,170,.9)');r.addColorStop(1,'rgba(255,214,170,0)');g.fillStyle=r;g.fillRect(0,0,s,s);};
 const glow=(g,s)=>{const r=g.createRadialGradient(s/2,s/2,1,s/2,s/2,s/2);r.addColorStop(0,'rgba(255,60,60,1)');r.addColorStop(.25,'rgba(255,40,40,.65)');r.addColorStop(1,'rgba(255,0,0,0)');g.fillStyle=r;g.fillRect(0,0,s,s);};
 const note=(g,s)=>{g.fillStyle='#ff9ecb';g.beginPath();g.ellipse(s*.38,s*.7,s*.16,s*.12,-.4,0,7);g.fill();g.fillRect(s*.5,s*.18,s*.06,s*.52);g.fillRect(s*.5,s*.18,s*.26,s*.08);};
 return {heart:texture(T,heart),star:texture(T,star),zed:texture(T,zed),puff:texture(T,puff),glow:texture(T,glow),note:texture(T,note)};
}

export async function mountMochiHome(root,options={}){
 const T=options.three||await import('./vendor/three-r180/three.module.js');
 // The cat module shares this file's release version so an update never mixes old and new parts.
 const catURL=new URL('./mochi-home-cat.js',import.meta.url);catURL.search=new URL(import.meta.url).search;
 const {buildCat,buildWear}=options.catModule||await import(catURL.href);
 const stage=root.querySelector('.mh-stage')||root;
 const lite=options.quality==='lite';
 const reduced=!!options.reducedMotion;
 const renderer=new T.WebGLRenderer({antialias:!lite,alpha:true,powerPreference:'default'});
 renderer.debug.onShaderError=()=>{throw Error('The graphics driver could not draw Mochi’s home.');};
 let pixelRatio=Math.min(window.devicePixelRatio||1,lite?1:2);renderer.setPixelRatio(pixelRatio);renderer.setClearColor(0,0);
 renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.NeutralToneMapping||T.ACESFilmicToneMapping;renderer.toneMappingExposure=1;
 renderer.shadowMap.enabled=!lite;renderer.shadowMap.type=T.PCFSoftShadowMap;
 const canvas=renderer.domElement;canvas.className='mh-canvas';canvas.setAttribute('role','img');canvas.setAttribute('aria-label','Mochi’s home: a cosy 3D room where Mochi the ginger kitten lives.');
 stage.prepend(canvas);
 const scene=new T.Scene();
 const camera=new T.PerspectiveCamera(32,1,.1,60);
 const disposables=new Set();const keep=x=>{disposables.add(x);return x;};
 const tex=particleTextures(T);Object.values(tex).forEach(t=>t&&keep(t));
 const std=(c,r=.8,extra={})=>keep(new T.MeshStandardMaterial({color:c,roughness:r,...extra}));
 const add=(geo,mat,parent,pos,rot,scale,shadow=[true,true])=>{const m=new T.Mesh(keep(geo),mat);m.position.set(...pos);if(rot)m.rotation.set(...rot);if(scale)m.scale.set(...scale);m.castShadow=shadow[0]&&!lite;m.receiveShadow=shadow[1]&&!lite;parent.add(m);return m;};

 // ---------------- lights ----------------
 const hemi=new T.HemisphereLight('#fffaf2','#d6cbe4',1.6);scene.add(hemi);
 const sun=new T.DirectionalLight('#fff3e2',2.4);sun.position.set(1.2,5.5,-3.2);sun.castShadow=!lite;sun.shadow.mapSize.set(2048,2048);
 Object.assign(sun.shadow.camera,{left:-4,right:4,top:4,bottom:-4,near:.5,far:14});sun.shadow.bias=-.0004;sun.shadow.normalBias=.03;scene.add(sun);scene.add(sun.target);
 const fill=new T.DirectionalLight('#f0e8ff',.9);fill.position.set(4,4,6);scene.add(fill);
 const lamp=new T.PointLight('#ffcf8a',0,6,1.6);lamp.position.set(-2.3,1.55,-.45);scene.add(lamp);

 // ---------------- room ----------------
 const room=new T.Group();room.name='Room';scene.add(room);
 const floorMat=std('#e9c9a4',.75),wallMat=std('#f3ecfb',.95),trimMat=std('#ffffff',.6),woodMat=std('#c98e5e',.6);
 const slab=add(new T.BoxGeometry(5.6,.3,4.8),floorMat,room,[0,-.15,0]);slab.name='floor';
 for(let i=-6;i<=6;i++)add(new T.BoxGeometry(.012,.002,4.8),std('#d9b38c',.8),room,[i*.42,.001,0],null,null,[false,true]);
 const back=add(new T.BoxGeometry(5.6,2.7,.14),wallMat,room,[0,1.35,-2.47]);back.name='wall';
 const left=add(new T.BoxGeometry(.14,2.7,4.8),wallMat,room,[-2.87,1.35,0]);left.name='wall';
 add(new T.BoxGeometry(5.6,.12,.04),trimMat,room,[0,.06,-2.39]);add(new T.BoxGeometry(.04,.12,4.8),trimMat,room,[-2.79,.06,0]);
 // wallpaper dots
 if(!lite){const dot=keep(new T.CircleGeometry(.035,10)),dm=std('#e6dbf4',1);for(let i=0;i<70;i++){const m=new T.Mesh(dot,dm);if(i<40){m.position.set(-2.6+(i%10)*.56+(Math.floor(i/10)%2)*.28,.55+Math.floor(i/10)*.5,-2.395);}else{const j=i-40;m.position.set(-2.795,.55+Math.floor(j/8)*.5,-2.1+(j%8)*.56+(Math.floor(j/8)%2)*.28);m.rotation.y=Math.PI/2;}room.add(m);}}
 // window with sky
 const skyCanvas=typeof document!=='undefined'&&typeof document.createElement==='function'?document.createElement('canvas'):null;let skyTex=null;
 if(skyCanvas){skyCanvas.width=256;skyCanvas.height=192;skyTex=keep(new T.CanvasTexture(skyCanvas));skyTex.colorSpace=T.SRGBColorSpace;}
 const win=new T.Group();win.position.set(.45,1.5,-2.39);room.add(win);
 const sky=add(new T.PlaneGeometry(1.5,1.1),keep(new T.MeshBasicMaterial({map:skyTex,color:skyTex?'#ffffff':'#bfe3ff',toneMapped:false})),win,[0,0,0],null,null,[false,false]);
 for(const [w,h,x,y] of [[1.7,.1,0,.6],[1.7,.12,0,-.6],[.1,1.3,-.8,0],[.1,1.3,.8,0],[1.5,.05,0,0],[.05,1.1,0,0]])add(new T.BoxGeometry(w,h,.1),trimMat,win,[x,y,.04]);
 add(new T.BoxGeometry(1.85,.07,.32),trimMat,win,[0,-.67,.14]);
 const curtainMat=std('#f6b9c9',.9);for(const s of [-1,1])add(new T.CylinderGeometry(.12,.16,1.35,10,1,true),curtainMat,win,[s*.95,-.05,.12],null,[1,1,.5]);
 // rug
 const rug=add(new T.CylinderGeometry(1.25,1.25,.025,64),std('#f7d6e3',.95),room,[.05,.012,.25]);rug.name='rug';
 add(new T.CylinderGeometry(.95,.95,.028,64),std('#fbe9f0',.95),room,[.05,.014,.25]);
 // bed
 const bed=new T.Group();bed.position.set(SPOTS.bed[0],0,SPOTS.bed[1]);bed.name='bed';room.add(bed);
 add(new T.TorusGeometry(.48,.17,16,40),std('#b9a3e3',.9),bed,[0,.15,0],[Math.PI/2,0,0]);
 add(new T.CylinderGeometry(.5,.52,.12,40),std('#fff3e6',.95),bed,[0,.07,0]);
 // bowls
 const bowl=new T.Group();bowl.position.set(1.62,0,.92);bowl.name='bowl';room.add(bowl);
 const lathe=pts=>new T.LatheGeometry(pts.map(([x,y])=>new T.Vector2(x,y)),32);
 add(lathe([[0,0],[.26,0],[.3,.03],[.28,.13],[.24,.13],[.23,.04],[0,.04]]),std('#ff9f8a',.4),bowl,[0,0,0]);
 const kibbleGeo=keep(new T.SphereGeometry(.035,8,6)),kibble=new T.InstancedMesh(kibbleGeo,std('#b0703f',.7),24);kibble.count=0;
 const dummy=new T.Object3D();for(let i=0;i<24;i++){const a=i*2.4,r=.04+Math.sqrt(i/24)*.16;dummy.position.set(Math.cos(a)*r,.07+(1-r/.2)*.04+Math.random()*.02,Math.sin(a)*r);dummy.updateMatrix();kibble.setMatrixAt(i,dummy.matrix);}bowl.add(kibble);
 const water=new T.Group();water.position.set(2.15,0,.45);room.add(water);
 add(lathe([[0,0],[.22,0],[.25,.03],[.23,.11],[.2,.11],[.19,.04],[0,.04]]),std('#8fc9f0',.4),water,[0,0,0]);
 add(new T.CylinderGeometry(.19,.19,.01,24),std('#cfeeff',.1,{transparent:true,opacity:.85}),water,[0,.085,0],null,null,[false,false]);
 // basket of toys
 const basket=new T.Group();basket.position.set(2.15,0,-1.55);basket.name='basket';room.add(basket);
 add(new T.CylinderGeometry(.32,.26,.32,20,1,true),std('#d6a36a',.9,{side:T.DoubleSide}),basket,[0,.16,0]);
 add(new T.SphereGeometry(.13,16,12),std('#ff8fb1',.9),basket,[-.08,.3,.05]);add(new T.SphereGeometry(.1,16,12),std('#8fd3ff',.9),basket,[.1,.28,-.06]);
 // plant and lamp
 const plant=new T.Group();plant.position.set(2.32,0,-2.05);room.add(plant);
 add(new T.CylinderGeometry(.2,.15,.36,16),std('#e88a5a',.7),plant,[0,.18,0]);
 for(let i=0;i<7;i++){const a=i/7*Math.PI*2;add(new T.SphereGeometry(.16,12,10),std(i%2?'#7cc47a':'#5fae6a',.8),plant,[Math.cos(a)*.14,.5+(i%3)*.12,Math.sin(a)*.14],null,[.7,1.4,.7]);}
 const lampG=new T.Group();lampG.position.set(-2.32,0,-.45);room.add(lampG);
 add(new T.CylinderGeometry(.18,.2,.05,20),woodMat,lampG,[0,.025,0]);add(new T.CylinderGeometry(.025,.025,1.4,8),woodMat,lampG,[0,.72,0]);
 const shadeMat=std('#fff1d6',.8,{emissive:'#ffcf8a',emissiveIntensity:0});add(new T.CylinderGeometry(.18,.3,.32,24,1,true),shadeMat,lampG,[0,1.5,0]).material.side=T.DoubleSide;
 // shelf & framed paw print
 add(new T.BoxGeometry(.3,.04,1.0),woodMat,room,[-2.66,1.15,.8]);
 const picture=new T.Group();picture.position.set(-2.78,1.75,.8);picture.rotation.y=Math.PI/2;room.add(picture);
 add(new T.BoxGeometry(.7,.55,.04),woodMat,picture,[0,0,0]);add(new T.PlaneGeometry(.58,.43),std('#fff8ef',1),picture,[0,0,.025]);
 for(const [x,y,r] of [[0,-.05,.09],[-.11,.09,.045],[-.035,.13,.045],[.04,.13,.045],[.11,.09,.045]])add(new T.CircleGeometry(r,16),std('#f19ab0',1),picture,[x,y,.027]);
 add(new T.SphereGeometry(.09,14,10),std('#ffd166',.6),room,[-2.66,1.24,.55]);add(new T.BoxGeometry(.12,.18,.12),std('#9fd8c7',.7),room,[-2.66,1.26,1.05]);

 // optional furniture (bought with coins)
 const owned={box:null,tree:null};
 function buildBox(){const g=new T.Group();g.position.set(SPOTS.box[0],0,SPOTS.box[1]);g.name='box';const m=std('#d9a76a',.9,{side:T.DoubleSide});const W=.8,D=.65,H=.36;
  add(new T.BoxGeometry(W,.02,D),m,g,[0,.01,0]);for(const s of [-1,1]){add(new T.BoxGeometry(W,H,.02),m,g,[0,H/2,s*D/2]);add(new T.BoxGeometry(.02,H,D),m,g,[s*W/2,H/2,0]);
  const f=add(new T.BoxGeometry(W,.02,.22),m,g,[0,H,s*(D/2+.1)]);f.rotation.x=s*-.5;}add(new T.BoxGeometry(.18,.02,.14),std('#c0392b',.7),g,[.2,H*.6,D/2+.012],[Math.PI/2,0,0]);return g;}
 function buildTree(){const g=new T.Group();g.position.set(SPOTS.tree[0],0,SPOTS.tree[1]);g.name='tree';const carpet=std('#b9a3e3',.95),sisal=std('#e4c891',.95);
  add(new T.BoxGeometry(.9,.08,.9),carpet,g,[0,.04,0]);add(new T.CylinderGeometry(.08,.08,1.1,12),sisal,g,[-.2,.6,-.15]);add(new T.CylinderGeometry(.08,.08,.6,12),sisal,g,[.22,.35,.2]);
  add(new T.CylinderGeometry(.34,.34,.07,24),carpet,g,[.18,.68,.18]);add(new T.CylinderGeometry(.38,.38,.07,24),carpet,g,[-.15,1.18,-.12]);add(new T.TorusGeometry(.3,.07,10,24),carpet,g,[-.15,1.24,-.12],[Math.PI/2,0,0]);
  const dangle=add(new T.SphereGeometry(.07,12,10),std('#ff8fb1',.8),g,[.45,.45,.2]);dangle.name='dangle';return g;}
 function setToys(ids=[]){
  for(const k of ['box','tree']){const want=ids.includes(k);if(want&&!owned[k]){owned[k]=k==='box'?buildBox():buildTree();room.add(owned[k]);}if(!want&&owned[k]){owned[k].removeFromParent();owned[k]=null;}}
  toyIds=[...ids];
 }
 let toyIds=[];

 // ---------------- time of day ----------------
 let tod='';
 function setTimeOfDay(date=options.now?.()||new Date()){
  const next=timeOfDay(date);if(next===tod)return;tod=next;
  const cfg={day:{sky:['#9fd4ff','#e3f4ff'],hemi:['#fffaf2','#d6cbe4',1.6],sun:['#fff3e2',2.4],lamp:0,exp:1},golden:{sky:['#ff9f80','#ffd9a0'],hemi:['#fff0e0','#d9c3d6',1.35],sun:['#ffbe85',2.0],lamp:.6,exp:.98},night:{sky:['#1c2450','#3d4a86'],hemi:['#d9dcf8','#a596c6',.95],sun:['#c3ccff',.7],lamp:3.2,exp:1}}[tod];
  hemi.color.set(cfg.hemi[0]);hemi.groundColor.set(cfg.hemi[1]);hemi.intensity=cfg.hemi[2];sun.color.set(cfg.sun[0]);sun.intensity=cfg.sun[1];lamp.intensity=cfg.lamp;shadeMat.emissiveIntensity=cfg.lamp?.9:0;renderer.toneMappingExposure=cfg.exp;
  if(skyCanvas){const g=skyCanvas.getContext('2d'),gr=g.createLinearGradient(0,0,0,192);gr.addColorStop(0,cfg.sky[0]);gr.addColorStop(1,cfg.sky[1]);g.fillStyle=gr;g.fillRect(0,0,256,192);
   if(tod==='night'){g.fillStyle='#fff8dc';g.beginPath();g.arc(190,52,22,0,7);g.fill();g.fillStyle=cfg.sky[0];g.beginPath();g.arc(180,46,20,0,7);g.fill();g.fillStyle='#fff';for(let i=0;i<26;i++){g.globalAlpha=.4+((i*37)%60)/100;g.fillRect((i*71)%250,(i*43)%140,2,2);}g.globalAlpha=1;}
   else{g.fillStyle=tod==='day'?'#fff6b8':'#ffe0a3';g.beginPath();g.arc(70,62,24,0,7);g.fill();g.fillStyle='rgba(255,255,255,.9)';for(const [x,y,s] of [[160,70,1],[210,110,.8],[60,130,.7]]){for(const [dx,dy,r] of [[0,0,16],[18,-6,20],[38,2,15]]){g.beginPath();g.arc(x+dx*s,y+dy*s,r*s,0,7);g.fill();}}}
   skyTex.needsUpdate=true;}
  root.dataset.timeOfDay=tod;
 }

 // ---------------- cats ----------------
 let growth=Math.max(0,Math.min(4,options.growth|0));
 let mochi=null,heading=.6,pos=new T.Vector3(.2,0,.5),worn={};
 function placeMochi(){
  const old=mochi;mochi=buildCat(T,null,{growth,lite});mochi.group.name='Mochi';scene.add(mochi.group);
  mochi.group.position.copy(pos);mochi.group.rotation.y=heading;
  if(old){old.dispose();}
  applyWear(worn);
 }
 function applyWear(w){worn={...(w||{})};if(!mochi)return;for(const slot of ['head','eyes','neck']){const anchor=mochi.parts.wear[slot];while(anchor.children.length){const c=anchor.children[0];c.traverse(o=>{o.geometry?.dispose?.();o.material?.dispose?.();});c.removeFromParent();}if(worn[slot])anchor.add(buildWear(T,worn[slot],mochi.parts.R));}}
 placeMochi();

 const friends=new Map();
 function setFriends(list=[]){
  const want=list.slice(0,3),ids=new Set(want.map(x=>x.id));
  for(const [id,f] of friends)if(!ids.has(id)){f.cat.dispose();friends.delete(id);}
  want.forEach((info,i)=>{if(friends.has(info.id))return;const cat=buildCat(T,info,{growth:4,lite:true});cat.group.scale.setScalar(.8);const spot=[[-.9,1.2],[1.0,1.35],[-.4,-1.0]][i%3];cat.group.position.set(spot[0],0,spot[1]);cat.group.rotation.y=Math.random()*6;cat.group.userData.friendId=info.id;scene.add(cat.group);friends.set(info.id,{info,cat,target:null,wait:2+Math.random()*4,activity:'idle',hearts:0});});
 }

 // ---------------- particles ----------------
 const sprites=[];
 function emit(kind,at,n=1,spread=.25){
  if(!tex[kind])return;n=reduced?Math.ceil(n/2):n;
  for(let i=0;i<n;i++){const s=new T.Sprite(keepSprite(kind));s.position.copy(at).add(new T.Vector3((Math.random()-.5)*spread,Math.random()*spread*.5,(Math.random()-.5)*spread));const size=kind==='glow'?.25:kind==='puff'?.18:.14+Math.random()*.06;s.scale.setScalar(size);s.userData={v:new T.Vector3((Math.random()-.5)*.3,kind==='puff'?.15:.45+Math.random()*.3,(Math.random()-.5)*.3),life:kind==='zed'?2.2:1.3,age:0,size,kind};scene.add(s);sprites.push(s);}
 }
 const spriteMats={};function keepSprite(kind){return spriteMats[kind]||(spriteMats[kind]=keep(new T.SpriteMaterial({map:tex[kind],transparent:true,depthWrite:false})));}
 function updateSprites(dt){for(let i=sprites.length-1;i>=0;i--){const s=sprites[i],u=s.userData;u.age+=dt;s.position.addScaledVector(u.v,dt);if(u.kind==='zed')s.position.x+=Math.sin(u.age*3)*.004;s.material.opacity=1;const k=u.age/u.life;s.scale.setScalar(u.size*(1+k*.4));s.material.rotation=u.kind==='star'?u.age*2:0;if(k>=1){s.removeFromParent();sprites.splice(i,1);}else if(k>.6){s.scale.multiplyScalar(1-(k-.6)*1.5);}}}

 // ---------------- toys in play ----------------
 const toy=new T.Group();toy.visible=false;scene.add(toy);let toyKind=null;const toyPos=new T.Vector3(.8,0,.8),toyVel=new T.Vector3();
 const wand=new T.Group();toy.add(wand);
 const wandLine=new T.Line(keep(new T.BufferGeometry().setFromPoints([new T.Vector3(),new T.Vector3(0,1,0)])),keep(new T.LineBasicMaterial({color:'#7a5c48'})));wand.add(wandLine);
 const feather=new T.Group();wand.add(feather);
 for(const [c,r] of [['#ff7aa8',0],['#ffd166',1.2],['#7bd3f7',2.4]]){const m=add(new T.ConeGeometry(.045,.22,8),std(c,.8),feather,[0,-.06,0],[0,r,.5]);m.position.x=Math.sin(r)*.03;}
 const ball=add(new T.SphereGeometry(.11,20,14),std('#ff8fb1',.9),toy,[0,.11,0]);
 const fish=new T.Group();toy.add(fish);add(new T.SphereGeometry(.12,16,12),std('#6cc4f0',.8),fish,[0,.09,0],null,[1.4,.7,.6]);add(new T.ConeGeometry(.08,.14,8),std('#4aa6d6',.8),fish,[-.2,.09,0],[0,0,Math.PI/2]);add(new T.SphereGeometry(.018,8,6),std('#222',.4),fish,[.11,.11,.05]);
 const laser=new T.Sprite(keepSprite('glow'));laser.scale.setScalar(.22);toy.add(laser);
 function showToy(kind){toyKind=kind;toy.visible=!!kind;wand.visible=kind==='feather';ball.visible=kind==='yarn';fish.visible=kind==='plush';laser.visible=kind==='laser';toyVel.set(0,0,0);if(kind)toyPos.set(THREEclamp(pos.x+.9,ROOM.minX,ROOM.maxX),0,THREEclamp(pos.z+.6,ROOM.minZ,ROOM.maxZ));}
 function THREEclamp(v,a,b){return Math.min(b,Math.max(a,v));}
 const treatItem=new T.Group();treatItem.visible=false;scene.add(treatItem);
 function showTreat(id,at){
  while(treatItem.children.length){const c=treatItem.children[0];c.removeFromParent();}
  if(!id){treatItem.visible=false;return;}
  if(id==='fish'){const f=fish.clone();f.scale.setScalar(.7);treatItem.add(f);}
  else if(id==='milk'){add(lathe([[0,0],[.16,0],[.18,.02],[.17,.07],[0,.07]]),std('#9fd3ff',.4),treatItem,[0,0,0]);add(new T.CylinderGeometry(.15,.15,.01,20),std('#ffffff',.3),treatItem,[0,.06,0]);}
  else if(id==='tuna'){add(new T.CylinderGeometry(.12,.12,.08,24),std('#c9d2db',.25,{metalness:.6}),treatItem,[0,.04,0]);add(new T.CylinderGeometry(.1,.1,.01,20),std('#f2a07b',.6),treatItem,[0,.082,0]);}
  else{const curve=new T.CatmullRomCurve3([new T.Vector3(-.12,.05,0),new T.Vector3(-.04,.12,0),new T.Vector3(.08,.1,0),new T.Vector3(.12,.03,0)]);add(new T.TubeGeometry(curve,16,.035,8),std('#ff9a7a',.6),treatItem,[0,0,0]);}
  const from=at?{x:at[0],z:at[1]}:pos,ahead=new T.Vector3(Math.sin(at?.6:heading),0,Math.cos(at?.6:heading)).multiplyScalar(.55);treatItem.position.set(THREEclamp(from.x+ahead.x,ROOM.minX,ROOM.maxX),0,THREEclamp(from.z+ahead.z,ROOM.minZ,ROOM.maxZ));treatItem.visible=true;
 }

 // ---------------- behaviour ----------------
 let mode='idle',act=null,queue=[],needs={tummy:70,energy:85,clean:80,fun:65,love:70},sleeping=false,lookTarget=null,elevated=0;
 const obstacles=()=>[[SPOTS.bed,.6],[[2.15,-1.55],.4],[[2.32,-2.05],.35],[[-2.32,-.45],.3],[[1.62,.92],.3],[[2.15,.45],.28],...(owned.tree?[[SPOTS.tree,.5]]:[]),...(owned.box?[[SPOTS.box,.48]]:[])];
 function clampRoom(v){v.x=THREEclamp(v.x,ROOM.minX,ROOM.maxX);v.z=THREEclamp(v.z,ROOM.minZ,ROOM.maxZ);return v;}
 // ---------------- personal space ----------------
 // Each cat is a circle on the floor sized from its body. Walking cats steer around others,
 // and a final pass nudges apart any that still touch. Friends make way for Mochi.
 // Two floor circles per cat: head-and-chest in front, haunches behind. Cats are long, so one circle is not enough.
 function circlesOf(cat,x,z,yaw,scale=1){const p=cat.parts,fx=Math.sin(yaw),fz=Math.cos(yaw),f=(p.bodyLen*.66+p.headR*.3)*scale,b=-p.bodyLen*.5*scale;
  return [{x:x+fx*f,z:z+fz*f,r:p.headR*1.0*scale},{x:x+fx*b,z:z+fz*b,r:Math.max(p.bodyW*1.05,p.headR*.7)*scale}];}
 function radiusOf(cat,scale=1){const p=cat.parts;return Math.max(p.headR,p.bodyW*1.05)*scale;}
 function catsList(){const list=[{id:'mochi',cat:mochi,g:{position:pos},yaw:heading,scale:1}];for(const [id,f] of friends)list.push({id,f,cat:f.cat,g:f.cat.group,yaw:f.cat.group.rotation.y,scale:.8});return list;}
 function others(except){const out=[];for(const c of catsList())if(c.id!==except)out.push(...circlesOf(c.cat,c.g.position.x,c.g.position.z,c.id==='mochi'?heading:c.g.rotation.y,c.scale));return out;}
 function avoidHeading(x,z,want,r,except,dist){
  // Bend the heading sideways around cats ahead (more strongly the closer they are), plus a little push away.
  const bx=Math.sin(want),bz=Math.cos(want);let vx=bx,vz=bz;
  for(const o of others(except)){const dx=o.x-x,dz=o.z-z,l=Math.hypot(dx,dz),clear=r+o.r+.1;if(l<1e-4||l>clear+.7||l>dist+o.r)continue;
   const ahead=(dx*bx+dz*bz)/l;if(ahead<-.25)continue;
   const cross=dx*bz-dz*bx,side=cross>0?-1:1,w=Math.min(3,(clear+.7-l)/.7)*(.4+Math.max(0,ahead));
   vx+=side*bz*w-dx/l*w*.3;vz+=-side*bx*w-dz/l*w*.3;}
  return Math.atan2(vx,vz);
 }
 function separate(){
  const aloft=['climb','perch','boxsit'].includes(act?.name)||elevated>.4;
  const items=catsList().map(c=>({...c,pos:c.id==='mochi'?pos:c.g.position,weight:c.id==='mochi'?((sleeping||aloft)?0:.25):1}));
  // A cat pressed against furniture or a wall cannot give way, so the other cat yields instead.
  const walls=it=>{const v=it.pos,bx=v.x,bz=v.z;if(it.id!=='mochi')for(const [[ox,oz],r] of obstacles()){const dx=v.x-ox,dz=v.z-oz,l=Math.hypot(dx,dz);if(l<r){v.x=ox+dx/l*r;v.z=oz+dz/l*r;}}if(it.id!=='mochi'||!sleeping)clampRoom(v);if(Math.hypot(v.x-bx,v.z-bz)>1e-5&&it.weight>0)it.weight=.02;};
  // Resolve cat contacts and walls together over a few rounds, so a cat pinned against furniture still ends up clear.
  for(let pass=0;pass<6;pass++){
   for(let i=0;i<items.length;i++)for(let j=i+1;j<items.length;j++){
    const A=items[i],B=items[j];if((A.id==='mochi'||B.id==='mochi')&&aloft)continue;
    const ca=circlesOf(A.cat,A.pos.x,A.pos.z,A.id==='mochi'?heading:A.g.rotation.y,A.scale),cb=circlesOf(B.cat,B.pos.x,B.pos.z,B.id==='mochi'?heading:B.g.rotation.y,B.scale);
    let best=null;for(const a of ca)for(const b of cb){let dx=b.x-a.x,dz=b.z-a.z,l=Math.hypot(dx,dz);const pen=a.r+b.r+.005-l;if(pen>0&&(!best||pen>best.pen)){if(l<1e-4){dx=B.pos.x-A.pos.x||1;dz=B.pos.z-A.pos.z;l=Math.hypot(dx,dz);}best={pen,nx:dx/l,nz:dz/l};}}
    if(!best)continue;const wa=A.weight,wb=B.weight,tot=wa+wb||1;
    A.pos.x-=best.nx*best.pen*wa/tot;A.pos.z-=best.nz*best.pen*wa/tot;B.pos.x+=best.nx*best.pen*wb/tot;B.pos.z+=best.nz*best.pen*wb/tot;
    for(const it of [A,B])if(it.f&&it.weight>0&&it.f.activity==='rest')it.f.wait=Math.min(it.f.wait,.2);
   }
   items.forEach(walls);
  }
 }
 // Velocity-based steering: ease in, brake before arriving, and slow down to turn rather than sliding sideways.
 let curSpeed=0,mochiGoal=null;
 function steer(from,to,speed,dt,allowInto){
  const d=new T.Vector3(to.x-from.x,0,to.z-from.z),dist=d.length();
  if(dist<.04&&curSpeed<.2){curSpeed=0;return true;}
  const run=speed>1.5,want=avoidHeading(from.x,from.z,Math.atan2(d.x,d.z),radiusOf(mochi),'mochi',dist);let diff=((want-heading+Math.PI*3)%(Math.PI*2))-Math.PI;
  const maxTurn=(run?6.5:4.2)*dt;heading+=Math.max(-maxTurn,Math.min(maxTurn,diff*Math.min(1,dt*9)));
  const decel=run?5:2.6,accel=run?6:2.4,align=Math.max(0,Math.cos(diff)),wantSpeed=Math.min(speed,Math.sqrt(2*decel*Math.max(0,dist-.03)))*(align>.35?align:0);
  curSpeed+=Math.max(-decel*1.6*dt,Math.min(accel*dt,wantSpeed-curSpeed));
  const step=Math.min(dist,curSpeed*dt);from.x+=Math.sin(heading)*step;from.z+=Math.cos(heading)*step;
  if(!allowInto)for(const [[ox,oz],r] of obstacles()){const dx=from.x-ox,dz=from.z-oz,l=Math.hypot(dx,dz);if(l<r){from.x=ox+dx/l*r;from.z=oz+dz/l*r;}}
  clampRoom(from);return dist<.05&&curSpeed<.25;
 }
 const P=x=>mochi.setPose(x);
 const base={sit:0,lie:0,crouch:0,headPitch:0,headYaw:0,headTilt:0,tailUp:.6,tailCurl:0,eye:1,happy:0,mouth:0,ears:0,blush:0,frontRaise:0,wave:0,walk:0,purr:0,lick:0};
 function start(a){act={t:0,...a};act.enter?.();}
 function next(){act=null;if(queue.length)start(queue.shift());}
 function interrupt(list,keepTreat){queue=[];act?.exit?.();act=null;sleeping=false;elevated=0;rollAngle=0;if(!keepTreat)showTreat(null);list.forEach((a,i)=>i?queue.push(a):start(a));}
 const walkTo=(spot,speed=.8,into=false,then)=>({name:'walk',enter(){P({...base,tailUp:.85});mochiGoal=spot;},update(dt){const done=steer(pos,new T.Vector3(spot[0],0,spot[1]),speed,dt,into);mochi.current.walk>.1&&Math.random()<.01&&0;return done;},exit(){P({walk:0})}});
 const face=(yaw)=>({name:'face',update(dt){let diff=((yaw-heading+Math.PI*3)%(Math.PI*2))-Math.PI;heading+=diff*Math.min(1,dt*6);return Math.abs(diff)<.05;}});
 const faceCamera=()=>({name:'faceCam',update(dt){const yaw=Math.atan2(camera.position.x-pos.x,camera.position.z-pos.z);let diff=((yaw-heading+Math.PI*3)%(Math.PI*2))-Math.PI;heading+=diff*Math.min(1,dt*6);return Math.abs(diff)<.08;}});
 const hold=(name,pose,secs,each)=>({name,enter(){P({...base,...pose})},update(dt){each?.(dt,this);return this.t>=secs;}});
 const eatAt=(spot,secs,fromBowl)=>[walkTo(spot,1.05),fromBowl?face(Math.atan2(1.62-spot[0],.92-spot[1])):face(heading),hold('eat',{headPitch:.75,crouch:.35,tailUp:.9,ears:.1},secs,(dt,a)=>{mochi.setPose({mouth:.4+Math.sin(a.t*14)*.4});if(fromBowl&&Math.random()<dt*2.2&&kibble.count>0)kibble.count--;if(Math.random()<dt*1.2)emit('note',headPos(),1,.1);}),hold('lick',{sit:1,happy:1,blush:.6,mouth:.25,tailUp:.9},1.4,()=>{}),{name:'done',update(){if(!fromBowl)showTreat(null);kibble.count=fromBowl?0:kibble.count;return true;}}];
 function headPos(){const v=new T.Vector3();mochi.parts.head.getWorldPosition(v);return v;}
 const sleepAct=(manual)=>({name:'sleep',limit:40+Math.random()*30,enter(){sleeping=true;P({...base,lie:1,eye:0,tailCurl:1,headPitch:.3,headTilt:.35,tailUp:.2});},update(dt){if(Math.random()<dt*.7)emit('zed',headPos().add(new T.Vector3(.1,.15,0)),1,.05);if(manual){options.onNap?.(dt*.09);return false;}return this.t>this.limit||(needs.energy>=98&&this.t>12);},exit(){sleeping=false;}});
 function idlePick(){
  const night=tod==='night',r=Math.random(),spot=()=>[ROOM.minX+.6+Math.random()*(ROOM.maxX-ROOM.minX-1.2),ROOM.minZ+.8+Math.random()*(ROOM.maxZ-ROOM.minZ-1.2)];
  if((needs.energy<55||night&&r<.45)&&!sleeping)return [walkTo(SPOTS.bed,.65,true),face(.4),sleepAct(false),hold('stretch',{crouch:.8,tailUp:1,mouth:.8,eye:.3},1.4)];
  if(owned.box&&r<.16)return [walkTo(SPOTS.box,.75,true),face(.9),hold('boxsit',{sit:1,happy:.0,tailUp:.4},6+Math.random()*6,(dt,a)=>{elevated=.02;}),{name:'out',update(){elevated=0;return true;}}];
  if(owned.tree&&r<.3)return [walkTo([SPOTS.tree[0]+.55,SPOTS.tree[1]+.35],.8,false),face(Math.atan2(SPOTS.tree[0]-.15-pos.x,SPOTS.tree[1]-.12-pos.z)),climb([SPOTS.tree[0]-.15,SPOTS.tree[1]-.12],1.22),hold('perch',{lie:1,eye:.8,tailCurl:.6},6+Math.random()*8),climb([SPOTS.tree[0]+.6,SPOTS.tree[1]+.4],0)];
  if(r<.42)return [walkTo([SPOTS.window[0],SPOTS.window[1]],.75),face(Math.PI),hold('gaze',{sit:1,headPitch:-.35,tailUp:.5},5+Math.random()*5,(dt,a)=>mochi.setPose({tailUp:.4+Math.sin(a.t*2)*.15}))];
  if(r<.58)return [hold('groom',{sit:1,lick:1,eye:.4,frontRaiseSide:-1},3+Math.random()*2,(dt,a)=>mochi.setPose({lick:.8+Math.sin(a.t*5)*.2}))];
  if(r<.78)return [faceCamera(),hold('hello',{sit:1,headTilt:.25,tailUp:.9},3+Math.random()*3)];
  return [walkTo(spot(),.7),hold('look',{headYaw:(Math.random()-.5)*1.2},2+Math.random()*2)];
 }
 const climb=(spot,height)=>({name:'climb',from:null,update(dt){if(!this.from){this.from={x:pos.x,z:pos.z,y:elevated};P({...base,crouch:.4,tailUp:1});}const k=Math.min(1,this.t/.7);pos.x=this.from.x+(spot[0]-this.from.x)*k;pos.z=this.from.z+(spot[1]-this.from.z)*k;elevated=this.from.y+(height-this.from.y)*k+Math.sin(k*Math.PI)*.35;if(k>=1){elevated=height;return true;}return false;}});
 function react(anim){
  if(!anim)return;
  if(anim==='eat'){interrupt(eatAt([1.62-.42,.92-.2],4.5,true));return;}
  if(anim.startsWith('treat:')){
   const id=anim.slice(6),from=nearBed()?STAGE_SPOT:[pos.x,pos.z],lead=toStage();
   interrupt([]);showTreat(id,from);
   const t=[treatItem.position.x,treatItem.position.z],d=new T.Vector3(from[0]-t[0],0,from[1]-t[1]).normalize().multiplyScalar(.3),spot=[t[0]+d.x,t[1]+d.z];
   interrupt([...lead,walkTo(spot,.95),face(Math.atan2(t[0]-spot[0],t[1]-spot[1])),...eatAt(spot,3,false).slice(2)],true);return;}
  if(anim==='purr'){if(act?.name==='sleep'&&mode==='nap')return;if(act?.name!=='purr')interrupt([hold('purr',{sit:1,happy:1,blush:1,purr:1,headTilt:.3,tailUp:.95,ears:.15},2.2)]);else act.t=Math.max(0,act.t-1);emit('heart',headPos().add(new T.Vector3(0,.2,0)),2);return;}
  if(anim==='shine'){emit('star',headPos(),8,.6);interrupt([hold('shine',{sit:1,happy:1,blush:1,tailUp:1},2)]);return;}
  if(anim==='hop'||anim==='trick:hop'){interrupt([hold('hop',{happy:1,blush:1,tailUp:1},1.6,(dt,a)=>{elevated=reduced?0:Math.abs(Math.sin(a.t*Math.PI*2.4))*.35;}),{name:'land',update(){elevated=0;return true;}}]);emit('star',headPos(),6,.5);return;}
  if(anim==='full'){interrupt([hold('full',{sit:1,headTilt:-.3,tailUp:.7},1.6,(dt,a)=>mochi.setPose({headYaw:Math.sin(a.t*8)*.3}))]);return;}
  if(anim==='yawn'||anim==='wake'){interrupt([hold('yawn',{crouch:.9,mouth:1,eye:.15,tailUp:1,ears:.4},1.6),hold('after',{sit:1},1)]);return;}
  if(anim==='tilt'){interrupt([faceCamera(),hold('tilt',{sit:1,headTilt:.55},1.6)]);return;}
  if(anim.startsWith('trick:')&&toStage().length&&!anim.endsWith(':again')){interrupt([...toStage(),{name:'then',update(){react(anim);return true;}}]);return;}
  if(anim==='trick:sit'){interrupt([faceCamera(),hold('sit',{sit:1,tailUp:.9},2.2)]);emit('heart',headPos(),1);return;}
  if(anim==='trick:highfive'){interrupt([faceCamera(),hold('hf',{sit:1,frontRaise:1,frontRaiseSide:1,happy:1,blush:.8,tailUp:1},2)]);setTimeout(()=>emit('star',headPos().add(new T.Vector3(.15,-.1,.15)),5,.2),500);return;}
  if(anim==='trick:wave'){interrupt([faceCamera(),hold('wave',{sit:1,frontRaise:.75,frontRaiseSide:1,wave:1,happy:.6,tailUp:1},2.6)]);return;}
  if(anim==='trick:spin'){interrupt([hold('spin',{walk:.8,tailUp:1},1.4,(dt)=>{heading+=dt*(reduced?2:4.6);}),faceCamera(),hold('ta',{sit:1,happy:1,tailUp:1},1)]);return;}
  if(anim==='trick:roll'){interrupt([hold('down',{lie:1,tailUp:.4},.6),hold('roll',{lie:1,happy:1,tailUp:.5},1.4,(dt,a)=>{rollAngle=reduced?0:Math.min(1,a.t/1.2)*Math.PI*2;}),{name:'up',update(){rollAngle=0;return true;}},faceCamera(),hold('ta',{sit:1,happy:1,blush:1},1)]);emit('star',headPos(),4,.5);return;}
  if(anim==='trick:chase'){const c=[pos.x,pos.z];interrupt([hold('chase',{walk:1,tailUp:1,crouch:.2},2.6,(dt,a)=>{heading+=dt*3.6;pos.x=c[0]+Math.sin(a.t*3.6)*.25;pos.z=c[1]+Math.cos(a.t*3.6)*.25;}),faceCamera(),hold('dizzy',{sit:1,headTilt:.4,happy:1},1.2,(dt,a)=>mochi.setPose({headTilt:Math.sin(a.t*6)*.35}))]);return;}
 }
 let rollAngle=0;
 const STAGE_SPOT=[.15,.75];
 function nearBed(){return sleeping||Math.hypot(pos.x-SPOTS.bed[0],pos.z-SPOTS.bed[1])<.7||elevated>.1;}
 function toStage(){return nearBed()||Math.hypot(pos.x-STAGE_SPOT[0],pos.z-STAGE_SPOT[1])>1.6?[...(sleeping?[hold('stretch',{crouch:.9,mouth:1,eye:.2,tailUp:1},1.3)]:[]),...(elevated>.1&&owned.tree?[climb([SPOTS.tree[0]+.6,SPOTS.tree[1]+.4],0)]:[]),walkTo(STAGE_SPOT,1.0)]:[];}
 function greet(){if(mode!=='idle')return;interrupt([...toStage(),faceCamera(),hold('hello',{sit:1,happy:1,blush:.8,tailUp:1,headTilt:.2},2.6)]);setTimeout(()=>emit('heart',headPos().add(new T.Vector3(0,.2,0)),2),2200);}

 // ---------------- modes ----------------
 function setMode(m){
  if(m===mode)return;mode=m;showToy(m.startsWith('play:')?m.slice(5):null);
  if(m==='brush'){interrupt([faceCamera(),hold('brush',{sit:1,happy:.6,tailUp:.9,blush:.5},1e9)]);focus(true);}
  else if(m==='nap'){interrupt([walkTo(SPOTS.bed,.65,true),face(.4),sleepAct(true)]);focus(false);}
  else if(m.startsWith('play:')){focus(false);interrupt([hold('ready',{crouch:.5,tailUp:1,ears:.2},.6)]);}
  else{focus(false);if(act?.name==='brush'||act?.name==='sleep'||act?.name==='chase')interrupt([hold('stretch',{crouch:.8,tailUp:1,mouth:.6,eye:.4},1.2)]);}
 }
 function wake(){if(sleeping||act?.name==='sleep'){interrupt([hold('stretch',{crouch:.9,mouth:1,eye:.2,tailUp:1},1.5),faceCamera(),hold('hi',{sit:1,happy:1,tailUp:1},1.2)]);}if(mode==='nap')mode='idle';}
 let swatCool=0;
 function playUpdate(dt){
  const target=toyPos;
  if(toyKind==='yarn'||toyKind==='plush'){toyPos.addScaledVector(toyVel,dt);toyVel.multiplyScalar(Math.exp(-dt*1.6));if(toyPos.x<ROOM.minX||toyPos.x>ROOM.maxX)toyVel.x*=-.7;if(toyPos.z<ROOM.minZ||toyPos.z>ROOM.maxZ)toyVel.z*=-.7;clampRoom(toyPos);ball.rotation.x+=toyVel.z*dt/.11;ball.rotation.z-=toyVel.x*dt/.11;fish.rotation.y=Math.atan2(toyVel.x,toyVel.z)-Math.PI/2;}
  ball.position.set(toyPos.x,.11,toyPos.z);fish.position.set(toyPos.x,0,toyPos.z);laser.position.set(toyPos.x,.02,toyPos.z);
  if(toyKind==='feather'){const h=.28+Math.sin(performance.now()/180)*.03;feather.position.set(toyPos.x,h,toyPos.z);const top=new T.Vector3(toyPos.x+.6,2.3,toyPos.z+1.2);const p=wandLine.geometry.attributes.position;p.setXYZ(0,top.x,top.y,top.z);p.setXYZ(1,toyPos.x,h+.05,toyPos.z);p.needsUpdate=true;wandLine.geometry.computeBoundingSphere();}
  if(act&&act.name!=='chase'&&act.name!=='pounce'&&act.name!=='swat'&&act.name!=='ready')return;
  if(act?.name==='ready'&&act.t<.6)return;
  const dist=Math.hypot(target.x-pos.x,target.z-pos.z);swatCool-=dt;
  if(dist>.55){if(act?.name!=='chase')start({name:'chase',enter(){P({...base,tailUp:1,ears:.25})},update(){return false;}});steer(pos,new T.Vector3(target.x,0,target.z),needs.energy<40?1.3:2.3,dt,false);lookTarget=target;if(Math.random()<dt*.3)options.onPlay?.(.06);}
  else if(swatCool<=0){swatCool=1.35;const ahead=dist>.33,side=Math.random()<.5?-1:1;curSpeed=0;
   start({name:ahead?'pounce':'swat',enter(){P({...base,crouch:ahead?1:.3,wiggle:ahead?1:0,frontRaise:0,frontRaiseSide:side,tailUp:1,ears:.35,happy:0});},
    update(dt){
     if(ahead){
      if(this.t<.42){const yaw=Math.atan2(target.x-pos.x,target.z-pos.z);let diff=((yaw-heading+Math.PI*3)%(Math.PI*2))-Math.PI;heading+=diff*Math.min(1,dt*10);return false;}
      if(!this.leap){let tx=target.x,tz=target.z;for(const o of others('mochi')){const dx=tx-o.x,dz=tz-o.z,l=Math.hypot(dx,dz),need=o.r+radiusOf(mochi)+.05;if(l<need){const bx=pos.x-o.x,bz=pos.z-o.z,bl=Math.hypot(bx,bz)||1;tx=o.x+bx/bl*need;tz=o.z+bz/bl*need;}}this.leap={x:pos.x,z:pos.z,tx,tz};mochi.setPose({crouch:0,wiggle:0});}
      const k=Math.min(1,(this.t-.42)/.42),e=k*k*(3-2*k);pos.x=this.leap.x+(this.leap.tx-this.leap.x)*e*.92;pos.z=this.leap.z+(this.leap.tz-this.leap.z)*e*.92;for(const [[ox,oz],r] of obstacles()){const dx=pos.x-ox,dz=pos.z-oz,l=Math.hypot(dx,dz);if(l<r){pos.x=ox+dx/l*r;pos.z=oz+dz/l*r;}}clampRoom(pos);elevated=reduced?0:Math.sin(k*Math.PI)*.22;
      if(k>=1){elevated=0;mochi.setPose({crouch:.35,frontRaise:0});return this.t>1.0;}return false;}
     if(this.t>.12&&this.t<.4)mochi.setPose({frontRaise:1});else mochi.setPose({frontRaise:0});return this.t>.55;},
    exit(){elevated=0;mochi.setPose({wiggle:0,crouch:0,frontRaise:0});}});
   options.onPlay?.(.22);emit(toyKind==='laser'?'star':'heart',new T.Vector3(target.x,.3,target.z),2,.2);
   if(toyKind==='yarn'||toyKind==='plush'){const a=heading+(Math.random()-.5)*1.2;toyVel.set(Math.sin(a)*2.2,0,Math.cos(a)*2.2);}
  }
 }

 // ---------------- camera ----------------
 let az=.62,azGoal=.62,focusOn=0,focusGoal=0;
 function focus(on){focusGoal=on?1:0;}
 const camTarget=new T.Vector3();
 function placeCamera(dt){
  az+=(azGoal-az)*Math.min(1,dt*(reduced?20:5));focusOn+=(focusGoal-focusOn)*Math.min(1,dt*(reduced?20:3));
  const wide=new T.Vector3(.05+pos.x*.4,.45,.2+pos.z*.35),close=new T.Vector3(pos.x,.35+elevated+mochi.parts.height*.45,pos.z);
  camTarget.copy(wide).lerp(close,focusOn);
  const aspect=camera.aspect,radius=Math.min(9.5,5.6*Math.pow(Math.max(1,1.36/aspect),.85))*(1-focusOn)+2.4*focusOn,elev=.42-.1*focusOn;
  camera.position.set(camTarget.x+Math.sin(az)*Math.cos(elev)*radius,camTarget.y+Math.sin(elev)*radius,camTarget.z+Math.cos(az)*Math.cos(elev)*radius);camera.lookAt(camTarget);
 }

 // ---------------- input ----------------
 const ray=new T.Raycaster(),ndc=new T.Vector2(),floorPlane=new T.Plane(new T.Vector3(0,1,0),0),hit=new T.Vector3();
 let press=null,strokeAcc=0,brushAcc=0;
 function pick(e){const r=canvas.getBoundingClientRect();ndc.set(((e.clientX-r.left)/r.width)*2-1,-((e.clientY-r.top)/r.height)*2+1);ray.setFromCamera(ndc,camera);}
 function hitCat(){return ray.intersectObject(mochi.group,true)[0]||null;}
 function hitFriend(){for(const [id,f] of friends){if(ray.intersectObject(f.cat.group,true).length)return id;}return null;}
 function hitNamed(){const h=ray.intersectObjects([bed,bowl,water,basket,...(owned.box?[owned.box]:[]),...(owned.tree?[owned.tree]:[])],true)[0];if(!h)return null;let o=h.object;while(o&&!['bed','bowl','basket','box','tree'].includes(o.name))o=o.parent;return o?.name||(h.object.parent===water?'bowl':null);}
 function floorPoint(){return ray.ray.intersectPlane(floorPlane,hit)?clampRoom(hit.clone()):null;}
 const brush=new T.Group();brush.visible=false;scene.add(brush);
 add(new T.BoxGeometry(.05,.03,.26),std('#c98e5e',.5),brush,[0,.02,.13]);add(new T.BoxGeometry(.1,.025,.12),std('#f6a6c1',.6),brush,[0,0,-.03]);
 for(let i=0;i<12;i++)add(new T.CylinderGeometry(.006,.006,.05,4),std('#fff',.7),brush,[(i%4-1.5)*.025,-.03,-.08+Math.floor(i/4)*.04]);
 function onDown(e){canvas.setPointerCapture?.(e.pointerId);pick(e);press={x:e.clientX,y:e.clientY,moved:0,onCat:!!hitCat(),az:azGoal,last:{x:e.clientX,y:e.clientY}};if(mode.startsWith('play:')&&toyKind!=='yarn'&&toyKind!=='plush'){const f=floorPoint();if(f)toyPos.set(f.x,0,f.z);}wakeLoop();}
 function onMove(e){
  pick(e);
  if(mode==='brush'){const h=hitCat();brush.visible=!!h;if(h){brush.position.copy(h.point).addScaledVector(h.face?.normal?h.face.normal.clone().transformDirection(h.object.matrixWorld):new T.Vector3(0,1,0),.05);brush.lookAt(camera.position);brush.rotateX(-1.1);
   if(press){const d=Math.hypot(e.clientX-press.last.x,e.clientY-press.last.y);brushAcc+=d;if(Math.random()<.35)emit(Math.random()<.5?'star':'puff',h.point,1,.1);if(brushAcc>90){options.onBrush?.(.18);brushAcc=0;}}}}
  if(mode.startsWith('play:')&&(press||e.pointerType==='mouse')&&toyKind!=='yarn'&&toyKind!=='plush'){const f=floorPoint();if(f)toyPos.set(f.x,0,f.z);}
  if(!press)return;
  const dx=e.clientX-press.last.x,dy=e.clientY-press.last.y;press.moved+=Math.hypot(dx,dy);press.last={x:e.clientX,y:e.clientY};
  if(mode==='idle'&&press.onCat){if(hitCat()){strokeAcc+=Math.hypot(dx,dy);if(strokeAcc>110){strokeAcc=0;options.onStroke?.(1);}}}
  else if(mode==='idle'&&!press.onCat&&press.moved>10){azGoal=THREEclamp(press.az-(e.clientX-press.x)*.006,.05,1.15);}
 }
 function onUp(e){
  if(!press)return;const tap=press.moved<10;pick(e);
  if(tap){
   const fr=hitFriend();
   if(mode.startsWith('play:')&&(toyKind==='yarn'||toyKind==='plush')){const f=floorPoint();if(f){const d=new T.Vector3(f.x-toyPos.x,0,f.z-toyPos.z);toyVel.copy(d.multiplyScalar(1.6));}}
   else if(hitCat()&&mode==='idle'){options.onStroke?.(1);}
   else if(fr){petFriend(fr);options.onTap?.('friend',fr);}
   else if(mode==='idle'){const n=hitNamed();if(n==='bowl'||n==='bed'||n==='basket')options.onTap?.(n);else if(n==='box'||n==='tree'){interrupt(n==='box'?[walkTo(SPOTS.box,1.2,true),face(.9),hold('boxsit',{sit:1,tailUp:.4},6)]:[walkTo([SPOTS.tree[0]+.55,SPOTS.tree[1]+.35],1.2),climb([SPOTS.tree[0]-.15,SPOTS.tree[1]-.12],1.22),hold('perch',{lie:1,eye:.8},6),climb([SPOTS.tree[0]+.6,SPOTS.tree[1]+.4],0)]);}
    else{const f=floorPoint();if(f){interrupt([...(sleeping?[hold('stretch',{crouch:.9,mouth:1,eye:.2,tailUp:1},1.2)]:[]),walkTo([f.x,f.z],1.1),faceCamera(),hold('arrive',{sit:1,tailUp:.9},2)]);}}}
  }
  press=null;strokeAcc=0;
 }
 canvas.addEventListener('pointerdown',onDown);canvas.addEventListener('pointermove',onMove);canvas.addEventListener('pointerup',onUp);canvas.addEventListener('pointercancel',()=>{press=null;});canvas.addEventListener('pointerleave',()=>{brush.visible=false;});

 function petFriend(id){const f=friends.get(id);if(!f)return false;f.cat.setPose({sit:1,happy:1,blush:1,purr:1,tailUp:1});f.activity='petted';f.wait=2.2;const v=new T.Vector3();f.cat.parts.head.getWorldPosition(v);emit('heart',v.add(new T.Vector3(0,.2,0)),3);return true;}
 // A free spot on the floor: away from furniture, from Mochi and his destination, and from other cats.
 function clearSpot(except){
  let best=null,bestScore=-1;
  for(let k=0;k<14;k++){const c=[ROOM.minX+.5+Math.random()*(ROOM.maxX-ROOM.minX-1),ROOM.minZ+.9+Math.random()*(ROOM.maxZ-ROOM.minZ-1.3)];
   let score=Math.min(...obstacles().map(([[ox,oz],r])=>Math.hypot(c[0]-ox,c[1]-oz)-r),...others(except).map(o=>Math.hypot(c[0]-o.x,c[1]-o.z)-o.r-.25));
   if(mochiGoal)score=Math.min(score,Math.hypot(c[0]-mochiGoal[0],c[1]-mochiGoal[1])-.6);
   if(score>bestScore){bestScore=score;best=c;}if(score>.4)break;}
  return best;
 }
 function makeWay(){
  // A resting friend sitting where Mochi is heading gets up and moves.
  if(!mochiGoal)return;for(const f of friends.values()){if(f.activity!=='rest')continue;const g=f.cat.group.position;if(Math.hypot(g.x-mochiGoal[0],g.z-mochiGoal[1])<radiusOf(mochi)+radiusOf(f.cat,.8)+.15)f.wait=0;}
 }
 function updateFriends(dt){
  makeWay();
  for(const f of friends.values()){
   const g=f.cat.group;f.wait-=dt;
   const before={x:g.position.x,z:g.position.z,h:g.rotation.y};f.speed=f.speed||0;
   if(f.activity==='walk'&&f.target){const d=new T.Vector3(f.target[0]-g.position.x,0,f.target[1]-g.position.z),l=d.length();
    if(l<.05&&f.speed<.15){f.speed=0;f.activity='rest';f.wait=4+Math.random()*7;f.cat.setPose({sit:Math.random()<.6?1:0,lie:Math.random()<.25?1:0,eye:1,happy:0});}
    else{const yaw=avoidHeading(g.position.x,g.position.z,Math.atan2(d.x,d.z),radiusOf(f.cat,.8),f.info.id,l);let diff=((yaw-g.rotation.y+Math.PI*3)%(Math.PI*2))-Math.PI;g.rotation.y+=Math.max(-3.5*dt,Math.min(3.5*dt,diff*Math.min(1,dt*8)));const align=Math.max(0,Math.cos(diff)),want=Math.min(.6,Math.sqrt(2*2.2*Math.max(0,l-.03)))*(align>.4?align:0);f.speed+=Math.max(-3.5*dt,Math.min(2*dt,want-f.speed));const st=Math.min(l,f.speed*dt);g.position.x+=Math.sin(g.rotation.y)*st;g.position.z+=Math.cos(g.rotation.y)*st;}}
   else if(f.wait<=0){f.activity='walk';f.target=clearSpot(f.info.id);f.cat.setPose({sit:0,lie:0,happy:0,purr:0,blush:0});}
   f.cat.update(dt,reduced,{speed:dt>0?Math.hypot(g.position.x-before.x,g.position.z-before.z)/dt:0,turn:dt>0?(((g.rotation.y-before.h+Math.PI*3)%(Math.PI*2))-Math.PI)/dt:0});
  }
 }

 // ---------------- loop ----------------
 let visible=false,frame=null,last=null,disposed=false,lastPaint=-1e9,activeUntil=0;const gaps=[];
 function wakeLoop(){activeUntil=performance.now()+4000;}
 function resize(){const w=stage.clientWidth||600,h=stage.clientHeight||420;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
 const ro=typeof ResizeObserver!=='undefined'?new ResizeObserver(resize):null;ro?.observe(stage);resize();
 const lastPos={x:pos.x,z:pos.z},motion={speed:0,turn:0,air:false};let lastHeading=heading;
 function tick(dt){
  setTimeOfDay();
  if(mode.startsWith('play:'))playUpdate(dt);
  if(!act){if(mode==='idle'){const plan=idlePick();plan.forEach((a,i)=>i?queue.push(a):start(a));}else if(mode==='brush'){start(hold('brush',{sit:1,happy:.6,tailUp:.9,blush:.5},1e9));}}
  if(act){act.t+=dt;if(act.update(dt)){act.exit?.();next();}}
  const moved=Math.hypot(pos.x-lastPos.x,pos.z-lastPos.z),dHead=((heading-lastHeading+Math.PI*3)%(Math.PI*2))-Math.PI;
  motion.speed=dt>0?moved/dt:0;motion.turn=dt>0?dHead/dt:0;motion.air=elevated>.04&&act?.name!=='boxsit'&&act?.name!=='perch';
  lastPos.x=pos.x;lastPos.z=pos.z;lastHeading=heading;if(act?.name!=='walk'&&act?.name!=='chase')curSpeed=Math.max(0,curSpeed-4*dt);
  mochi.group.position.set(pos.x,elevated,pos.z);mochi.group.rotation.set(0,heading,rollAngle);
  if(lookTarget&&mode.startsWith('play:')){const local=Math.atan2(lookTarget.x-pos.x,lookTarget.z-pos.z)-heading;mochi.setPose({headYaw:THREEclamp(((local+Math.PI*3)%(Math.PI*2))-Math.PI,-.7,.7)});}
  if(act?.name!=='walk')mochiGoal=null;
  mochi.update(dt,false,motion);updateFriends(dt);separate();mochi.group.position.x=pos.x;mochi.group.position.z=pos.z;updateSprites(dt);placeCamera(dt);
  if(owned.tree){const d=owned.tree.getObjectByName('dangle');if(d)d.position.x=.45+Math.sin(performance.now()/500)*.04;}
 }
 function frameLoop(now){
  frame=null;if(disposed||!visible)return;
  const busy=now<activeUntil||mode!=='idle'||act?.name==='walk',fps=lite?30:busy?60:30;
  if(now-lastPaint>=1000/fps-2){const dt=last===null?1/30:Math.min(.1,(now-last)/1000);if(last!==null)adapt(now-last);last=now;lastPaint=now;try{tick(dt);renderer.render(scene,camera);}catch(err){visible=false;options.onError?.(err);return;}}
  frame=requestAnimationFrame(frameLoop);
 }
 function adapt(gap){if(lite||gap>250)return;gaps.push(gap);if(gaps.length<60)return;const m=[...gaps].sort((a,b)=>a-b)[30];gaps.length=0;if(m>48&&pixelRatio>1.25){pixelRatio=Math.max(1.25,pixelRatio-.375);renderer.setPixelRatio(pixelRatio);resize();root.dataset.pixelRatio=String(pixelRatio);}}
 function setVisible(v){visible=!!v;if(visible&&frame===null&&!disposed){last=null;frame=requestAnimationFrame(frameLoop);}}
 const onHidden=()=>{if(document.hidden){visible=false;}};document.addEventListener('visibilitychange',onHidden);
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();visible=false;options.onError?.(Error('The browser reset the 3D view.'));});
 function dispose(){if(disposed)return;disposed=true;visible=false;ro?.disconnect();document.removeEventListener('visibilitychange',onHidden);mochi.dispose();for(const f of friends.values())f.cat.dispose();friends.clear();disposables.forEach(d=>d.dispose?.());scene.traverse(o=>{o.geometry?.dispose?.();});renderer.dispose();renderer.forceContextLoss?.();canvas.remove();}

 setTimeOfDay();setToys(options.toys||[]);setFriends(options.friends||[]);applyWear(options.worn||{});
 if(options.needs)needs={...needs,...options.needs};
 placeCamera(1);renderer.render(scene,camera);
 return {
  setVisible,dispose,setMode,wake,react,greet,setToys,setFriends,setTimeOfDay,
  getFriendCount:()=>friends.size,petFriend,
  setGrowth(level){level=Math.max(0,Math.min(4,level|0));if(level!==growth){growth=level;placeMochi();}},
  setWear:applyWear,
  setNeeds(n){needs={...needs,...n};},
  fillBowl(){kibble.count=24;},
  get mode(){return mode;},get activity(){return act?.name||'none';},get timeOfDay(){return tod;},
  debug:{scene,camera,renderer,get mochi(){return mochi},pos,tick:dt=>tick(dt),render:()=>renderer.render(scene,camera),friends,setToy:(x,z)=>toyPos.set(x,0,z)}
 };
}

/* Loader contract shared with mochi-room.js (kept so its safety checks still apply). */
export const CAT_FRIENDS_VERSION=1;
export async function mountMochiRoom(host,opts={}){
 const catalog=(typeof window!=='undefined'&&window.MochiCatFriends?.catalog)||[];
 const infos=ids=>(ids||[]).map(x=>typeof x==='string'?catalog.find(c=>c.id===x):x).filter(Boolean);
 const api=await mountMochiHome(host,{...opts,growth:opts.level,friends:infos(opts.friends)});
 return {...api,setFriends:ids=>api.setFriends(infos(ids)),pet:()=>api.react('purr'),feed:(name,id)=>api.react(id?'treat:'+id:'eat')};
}
