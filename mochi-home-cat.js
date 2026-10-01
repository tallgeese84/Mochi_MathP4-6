/* Procedural stylised cats for Mochi's Home. Built from simple, cheap parts so a tablet can
   draw Mochi plus three friends smoothly. Every pose is a set of numbers blended each frame. */
export const CAT_VERSION=1;

const MOCHI={name:'Mochi',coat:'#e39a57',stripe:'#b8642f',cream:'#fff5ea',inner:'#f4b0aa',nose:'#ee8f93',eyes:'#79c349',pattern:'tabby',shape:'round',socks:true,bib:true,collar:'#59a9e8'};

function shade(T,hex,amount){const c=new T.Color(hex);const hsl={};c.getHSL(hsl);c.setHSL(hsl.h,hsl.s,Math.max(0,Math.min(1,hsl.l+amount)));return '#'+c.getHexString();}
export function palette(T,info){
 if(!info||info.id==='mochi')return {...MOCHI};
 const breed=String(info.breed||'').toLowerCase(),pattern=/tabby|maine|bengal|mackerel|mau|ocicat|abyss/.test(breed)?'tabby':/point|siamese|ragdoll|birman|himalayan|balinese/.test(breed)?'point':'solid';
 return {name:info.name,coat:info.coat,stripe:info.point,cream:shade(T,info.coat,.16),inner:'#efb0ab',nose:shade(T,'#d88b8f',-.04),eyes:info.eyes,pattern,shape:info.shape||'round',socks:pattern!=='point'&&/white|tuxedo|calico|ragdoll|birman/.test(breed),bib:pattern!=='point',collar:null};
}

function eyeTexture(T,iris){
 if(typeof document==='undefined'||typeof document.createElement!=='function')return null;
 const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');
 g.fillStyle='#2a1d1a';g.fillRect(0,0,256,256);
 const ring=g.createRadialGradient(128,138,20,128,128,122);
 ring.addColorStop(0,shade(T,iris,.18));ring.addColorStop(.62,iris);ring.addColorStop(.9,shade(T,iris,-.22));ring.addColorStop(1,'#2a1d1a');
 g.fillStyle=ring;g.beginPath();g.arc(128,128,118,0,Math.PI*2);g.fill();
 g.fillStyle='#16100f';g.beginPath();g.ellipse(128,132,58,70,0,0,Math.PI*2);g.fill();
 g.fillStyle='rgba(255,255,255,.97)';g.beginPath();g.ellipse(94,86,30,26,-.4,0,Math.PI*2);g.fill();
 g.beginPath();g.arc(160,170,12,0,Math.PI*2);g.fill();
 g.fillStyle='rgba(255,255,255,.35)';g.beginPath();g.arc(170,92,8,0,Math.PI*2);g.fill();
 const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;return t;
}
function planarUV(geo){const p=geo.attributes.position,uv=geo.attributes.uv;for(let i=0;i<p.count;i++)uv.setXY(i,p.getX(i)*.5+.5,p.getY(i)*.5+.5);uv.needsUpdate=true;return geo;}
function smooth(a,b,x){const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t);}

export function buildCat(T,info,{growth=4,lite=false}={}){
 const pal=palette(T,info),g=Math.max(0,Math.min(4,growth|0)),shape=pal.shape;
 const disposables=[];const keep=x=>{disposables.push(x);return x;};
 const seg=lite?[28,20]:[48,32];
 const fluffy=shape==='fluffy'||shape==='tufted',slender=shape==='slender';
 // Kittens: big head, short legs. Grown cats: longer body and legs.
 const S=.8+g*.08,headR=.36-g*.014,bodyLen=(.30+g*.045)*(slender?1.08:1),bodyW=(.25+g*.012)*(fluffy?1.12:slender?.9:1),bodyH=.23+g*.012,legLen=(.13+g*.028)*(slender?1.12:1),legR=(.062+g*.004)*(slender?.85:fluffy?1.1:1);
 const C=k=>new T.Color(pal[k]);
 const mat=(o)=>keep(lite?new T.MeshStandardMaterial({roughness:.86,...o}):new T.MeshPhysicalMaterial({roughness:.82,sheen:.55,sheenRoughness:.75,sheenColor:new T.Color('#fff2e3'),...o}));
 const fur=mat({vertexColors:true}),plain=mat({color:pal.coat}),cream=mat({color:pal.cream}),inner=keep(new T.MeshStandardMaterial({color:pal.inner,roughness:.7})),nose=keep(new T.MeshStandardMaterial({color:pal.nose,roughness:.45})),dark=keep(new T.MeshStandardMaterial({color:'#4a312b',roughness:.6}));
 const tongue=keep(new T.MeshStandardMaterial({color:'#f08a95',roughness:.5}));
 const eyeTex=eyeTexture(T,pal.eyes),eyeMat=keep(new T.MeshPhysicalMaterial({map:eyeTex,color:eyeTex?'#ffffff':pal.eyes,roughness:.08,clearcoat:1,clearcoatRoughness:.05}));if(eyeTex)disposables.push(eyeTex);
 const blushMat=keep(new T.MeshBasicMaterial({color:'#ff9aa8',transparent:true,opacity:0,depthWrite:false}));
 const sphere=keep(new T.SphereGeometry(1,seg[0],seg[1])),small=keep(new T.SphereGeometry(1,lite?14:20,lite?10:14));
 // Vertex-coloured fur in local unit-sphere coordinates.
 function colored(kind){
  const geo=keep(new T.SphereGeometry(1,seg[0],seg[1])),p=geo.attributes.position,col=[],c=new T.Color(),base=C('coat'),stripe=C('stripe'),cr=C('cream');
  for(let i=0;i<p.count;i++){
   const x=p.getX(i),y=p.getY(i),z=p.getZ(i);c.copy(base);
   const grain=1+(Math.sin(x*40+y*31)+Math.sin(z*47-y*23))*.012;
   if(kind==='head'){
    if(pal.pattern==='tabby'){
     const fore=smooth(.2,.55,y)*smooth(.15,.6,z),v=Math.abs(x);
     const m=(1-smooth(.03,.08,Math.abs(v-(.05+.22*smooth(.3,.9,y)))))+(1-smooth(.03,.07,Math.abs(v-.32)))*.8;
     c.lerp(stripe,Math.min(.85,m*fore));
     const cheek=smooth(.55,.9,v)*(1-smooth(-.1,.35,y))*smooth(-.2,.4,z);c.lerp(stripe,cheek*Math.pow(.5+.5*Math.sin(y*16),6)*.7);
    }
    if(pal.pattern==='point')c.lerp(stripe,smooth(.55,.95,z)*(1-smooth(-.1,.35,y))*.75);
    const muzzle=(1-smooth(-.35,.05,y))*smooth(.35,.75,z),blaze=(1-smooth(.07,.16,Math.abs(x)))*smooth(.0,.35,y)*(1-smooth(.62,.8,y))*smooth(.55,.85,z);
    if(pal.bib||pal.pattern!=='point')c.lerp(cr,Math.max(muzzle,pal.pattern==='tabby'?blaze*.9:0));
   }else if(kind==='body'){
    if(pal.pattern==='tabby'){const side=smooth(.0,.6,y+Math.abs(x)*.6);c.lerp(stripe,Math.pow(.5+.5*Math.sin(z*13+Math.abs(x)*2),7)*side*.75);}
    if(pal.pattern==='point')c.lerp(stripe,smooth(-.95,-.6,z)*.5);
    if(pal.bib)c.lerp(cr,(1-smooth(-.65,-.2,y))*smooth(-.3,.4,z)*.95+smooth(.55,.95,z)*(1-smooth(-.2,.35,y))*.9);
   }
   c.multiplyScalar(grain);col.push(c.r,c.g,c.b);
  }
  geo.setAttribute('color',new T.Float32BufferAttribute(col,3));
  if(kind==='head'){for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i);const w=1+.13*Math.exp(-Math.pow((y+.25)*2.6,2))*smooth(-.2,.3,z+.2);p.setXYZ(i,x*w,y*(y<0?.92:1),z*(1+.05*Math.exp(-Math.pow((y+.2)*3,2))));}geo.computeVertexNormals();}
  return geo;
 }
 const headGeo=colored('head'),bodyGeo=colored('body');
 const mesh=(geo,m,parent,pos,scale,shadow=true)=>{const x=new T.Mesh(geo,m);x.position.set(...pos);if(scale)x.scale.set(...scale);x.castShadow=shadow&&!lite;x.receiveShadow=!lite;parent.add(x);return x;};

 const cat=new T.Group();cat.name=pal.name||'Cat';cat.userData.isCat=true;
 const scaler=new T.Group();scaler.scale.setScalar(S);cat.add(scaler);
 const hipY=legLen+bodyH*.55;
 const body=new T.Group();body.position.set(0,hipY,-bodyLen*.62);scaler.add(body);// pivot at back hips
 const torso=mesh(bodyGeo,fur,body,[0,bodyH*.15,bodyLen*.62],[bodyW,bodyH,bodyLen]);
 mesh(sphere,pal.bib?cream:plain,body,[0,bodyH*.05,bodyLen*1.18],[bodyW*.82,bodyH*.95,bodyLen*.42]);// chest
 if(fluffy)mesh(sphere,pal.bib?cream:plain,body,[0,bodyH*.55,bodyLen*1.25],[bodyW*1.05,bodyH*.9,bodyLen*.4]);// ruff
 // Head
 const neck=new T.Group();neck.position.set(0,bodyH*.75,bodyLen*1.28);body.add(neck);
 const head=new T.Group();head.position.set(0,headR*.62,headR*.28);neck.add(head);
 mesh(headGeo,fur,head,[0,0,0],[headR*1.08,headR,headR*.96]);
 const R=headR;
 for(const s of [-1,1]){
  mesh(sphere,cream,head,[s*R*.2,-R*.28,R*.78],[R*.26,R*.2,R*.2]);// muzzle pads
  if(fluffy||g<3){const tuft=mesh(keep(new T.ConeGeometry(R*.16,R*.42,10)),fur===fur?plain:plain,head,[s*R*1.0,-R*.25,R*.12],null);tuft.rotation.z=s*2.0;tuft.rotation.x=.25;}
 }
 const chin=mesh(sphere,cream,head,[0,-R*.47,R*.6],[R*.2,R*.13,R*.16]);
 mesh(sphere,nose,head,[0,-R*.14,R*.94],[R*.085,R*.06,R*.06]);
 // Mouth: a soft "w" made from two short arcs, plus an open mouth for eating and yawning.
 const mouthGroup=new T.Group();mouthGroup.position.set(0,-R*.27,R*.9);head.add(mouthGroup);
 for(const s of [-1,1]){const curve=new T.QuadraticBezierCurve3(new T.Vector3(0,R*.05,0),new T.Vector3(s*R*.05,-R*.06,R*.02),new T.Vector3(s*R*.12,R*.0,-R*.01));mesh(keep(new T.TubeGeometry(curve,10,R*.014,6)),dark,mouthGroup,[0,0,0],null,false);}
 const mouthOpen=new T.Group();mouthOpen.position.set(0,-R*.33,R*.86);head.add(mouthOpen);
 mesh(sphere,dark,mouthOpen,[0,0,0],[R*.09,R*.08,R*.05],false);mesh(sphere,tongue,mouthOpen,[0,-R*.035,R*.02],[R*.06,R*.035,R*.04],false);mouthOpen.scale.setScalar(.001);
 // Eyes
 const eyeGeo=keep(planarUV(new T.SphereGeometry(1,lite?20:32,lite?14:24)));
 const eyes=[],closed=[],blush=[];
 for(const s of [-1,1]){
  const e=new T.Group();e.position.set(s*R*.38,R*.04,R*.78);head.add(e);
  const ball=mesh(eyeGeo,eyeMat,e,[0,0,0],[R*.31,R*.36,R*.2],false);ball.rotation.y=s*.22;
  eyes.push(e);
  const arc=new T.QuadraticBezierCurve3(new T.Vector3(-R*.2,0,0),new T.Vector3(0,R*.17,R*.05),new T.Vector3(R*.2,0,0));
  const shut=mesh(keep(new T.TubeGeometry(arc,14,R*.03,6)),dark,head,[s*R*.38,R*.0,R*.93],null,false);shut.rotation.y=s*.25;shut.visible=false;closed.push(shut);
  const b=new T.Mesh(keep(new T.CircleGeometry(R*.16,20)),blushMat);b.position.set(s*R*.6,-R*.22,R*.76);b.rotation.y=s*.6;head.add(b);blush.push(b);
 }
 // Whiskers
 if(!lite){const pts=[];for(const s of [-1,1])for(let i=0;i<3;i++){const y=-R*.18-i*R*.07;pts.push(new T.Vector3(s*R*.3,y,R*.85),new T.Vector3(s*R*1.05,y+(1-i)*R*.12,R*.62));}const wg=keep(new T.BufferGeometry().setFromPoints(pts));const wm=keep(new T.LineBasicMaterial({color:'#ffffff',transparent:true,opacity:.85}));head.add(new T.LineSegments(wg,wm));}
 // Ears
 const ears=[];
 const earGeo=keep(new T.ConeGeometry(R*.4,R*.78,lite?14:22,1)),innerGeo=keep(new T.ConeGeometry(R*.27,R*.58,lite?12:18,1));
 for(const s of [-1,1]){
  const ear=new T.Group();ear.position.set(s*R*.5,R*.68,R*.08);ear.rotation.set(-.08,0,-s*.32);head.add(ear);
  mesh(earGeo,pal.pattern==='point'?keep(new T.MeshStandardMaterial({color:pal.stripe,roughness:.85})):plain,ear,[0,R*.2,0],[1,1,.5]);
  mesh(innerGeo,inner,ear,[0,R*.17,R*.1],[1,1,.32],false);
  if(shape==='tufted'){const t=mesh(keep(new T.ConeGeometry(R*.05,R*.3,6)),dark,ear,[0,R*.58,0],null,false);t.rotation.z=s*.1;}
  ears.push(ear);
 }
 // Legs (pivot at the top), white socks for Mochi.
 const legs=[];const legGeo=keep(new T.CapsuleGeometry(legR,legLen,lite?4:6,lite?10:14));
 const pawMat=pal.socks?cream:(pal.pattern==='point'?keep(new T.MeshStandardMaterial({color:pal.stripe,roughness:.85})):plain);
 for(const [front,s] of [[1,-1],[1,1],[0,-1],[0,1]]){
  const pivot=new T.Group();
  if(front){pivot.position.set(s*bodyW*.55,-bodyH*.2,bodyLen*1.15);body.add(pivot);}
  else{pivot.position.set(s*bodyW*.62,hipY-bodyH*.25,-bodyLen*.62);scaler.add(pivot);mesh(sphere,plain,pivot,[0,0,0],[bodyW*.5,bodyH*.66,bodyLen*.44]);}
  const lower=new T.Group();pivot.add(lower);
  mesh(legGeo,front?plain:plain,lower,[0,-legLen*.5-legR*.3,0],null);
  const paw=mesh(sphere,pawMat,lower,[0,-legLen-legR*.6,legR*.35],[legR*1.25,legR*.8,legR*1.5]);
  legs.push({pivot,lower,paw,front:!!front,side:s,baseY:pivot.position.y});
 }
 // Tail: a chain of short segments that bends smoothly.
 const tail=[];let parent=new T.Group();parent.position.set(0,bodyH*.35,-bodyLen*.18);body.add(parent);const tailRoot=parent;
 const tailCount=lite?6:9,tailLen=(.42+g*.05)*(fluffy?1.05:1);
 for(let i=0;i<tailCount;i++){
  const r=(fluffy?.085:.062)*(1-i/tailCount*.4)*(1+g*.04);
  const ring=pal.pattern==='tabby'&&i%2===1,tip=i===tailCount-1&&pal.pattern!=='solid';
  const m=ring||tip?keep(new T.MeshStandardMaterial({color:pal.stripe,roughness:.85})):plain;
  const segG=new T.Group();segG.position.set(0,i?tailLen/tailCount:0,0);parent.add(segG);
  mesh(keep(new T.CapsuleGeometry(r,tailLen/tailCount*.9,4,lite?8:12)),m,segG,[0,tailLen/tailCount*.5,0],null);
  tail.push(segG);parent=segG;
 }
 // Collar
 const collarAnchor=new T.Group();collarAnchor.position.set(0,bodyH*.62,bodyLen*1.22);body.add(collarAnchor);
 if(pal.collar){
  // Sits just under the chin so it reads clearly from the front, with a little gold bell.
  const collarMat=keep(new T.MeshStandardMaterial({color:pal.collar,roughness:.45}));
  const band=new T.Group();band.position.set(0,-R*.16,R*.26);neck.add(band);
  const ring=mesh(keep(new T.TorusGeometry(R*.6,R*.08,10,40)),collarMat,band,[0,0,0],null);ring.rotation.x=-(Math.PI/2-.6);
  const bell=mesh(small,keep(new T.MeshStandardMaterial({color:'#f2c94c',roughness:.25,metalness:.6})),band,[0,-R*.47,R*.5],[R*.13,R*.13,R*.13]);bell.name='bell';
 }
 const wear={head:new T.Group(),eyes:new T.Group(),neck:new T.Group()};
 wear.head.position.set(0,R*.82,0);head.add(wear.head);wear.eyes.position.set(0,R*.04,R*1.0);head.add(wear.eyes);wear.neck.position.set(0,-R*.16,R*.26);neck.add(wear.neck);

 // ---------------- pose blending ----------------
 const pose={sit:0,lie:0,crouch:0,headPitch:0,headYaw:0,headTilt:0,tailUp:.6,tailCurl:0,eye:1,happy:0,mouth:0,ears:0,blush:0,frontRaise:0,frontRaiseSide:1,wave:0,walk:0,purr:0,lean:0,lick:0,wiggle:0};
 const target={...pose};let phase=0,blinkT=2+Math.random()*3,blink=0,time=0;
 // Locomotion: the gait cycle advances with distance travelled, so planted paws never slide.
 /* hip to paw centre: the part the eye follows */ const legWorld=(legLen+legR*.6);const pawAhead=legR*.35/legWorld;let gait=0,moveW=0,airW=0,bank=0,look=0,wW=1,tW=0,gW=0;
 const GAITS={walk:{off:[.25,.75,0,.5],duty:.62,stride:1.6},trot:{off:[0,.5,.5,0],duty:.5,stride:2.2},gallop:{off:[.5,.6,0,.1],duty:.38,stride:3.2}};
 // Half the stance travel, in leg lengths. With the leg lengthened by 1/cos(θ) the paw stays on the floor
 // and moves ℓ·tan(θ) horizontally, so a planted paw travels exactly as far as the body.
 for(const g of Object.values(GAITS)){g.half=g.stride*g.duty/2;g.amp=Math.atan(g.half);}
 const ease=u=>u*u*(3-2*u);
 // Stance: the paw moves in a straight line along the floor at the body's speed.
 function legCycle(p,g){let th,lift=0;if(p<g.duty)th=Math.atan(g.half*(2*(p/g.duty)-1));else{const u=(p-g.duty)/(1-g.duty);th=g.amp-2*g.amp*ease(u);lift=Math.sin(Math.PI*u);}return [th,lift,(1-pawAhead*Math.sin(th))/Math.cos(th)];}
 let gaitName='walk';
 const damp=(a,b,k,dt)=>a+(b-a)*(1-Math.exp(-k*dt));
 function update(dt,still=false,motion={}){
  time+=dt;for(const k of Object.keys(pose))pose[k]=still?target[k]:damp(pose[k],target[k],k==='eye'?18:6,dt);
  const p=pose;
  const speed=Math.max(0,(motion.speed||0)/S),turn=motion.turn||0,rel=speed/legWorld,air=motion.air?1:0;
  const stepping=rel<.6&&Math.abs(turn)>.7&&!air;
  // Discrete gaits with hysteresis, cross-faded quickly, so legs never follow two rhythms for long.
  if(gaitName==='walk'&&rel>6.5)gaitName='trot';else if(gaitName==='trot'&&rel<5)gaitName='walk';else if(gaitName==='trot'&&rel>11.5)gaitName='gallop';else if(gaitName==='gallop'&&rel<9)gaitName='trot';
  wW=damp(wW,gaitName==='walk'?1:0,12,dt);gW=damp(gW,gaitName==='gallop'?1:0,12,dt);tW=Math.max(0,1-wW-gW);
  const stride=(GAITS.walk.stride*wW+GAITS.trot.stride*tW+GAITS.gallop.stride*gW)*legWorld;
  gait=(gait+(stepping?Math.abs(turn)*dt*.32:speed*dt/stride))%1;
  moveW=damp(moveW,air?0:Math.min(1,Math.max(rel/1.2,stepping?.7:0)),10,dt);airW=damp(airW,air,14,dt);
  bank=damp(bank,Math.max(-.14,Math.min(.14,-turn*rel*.012)),6,dt);look=damp(look,Math.max(-.4,Math.min(.4,turn*.14)),5,dt);
  // blink
  blinkT-=dt;if(blinkT<0){blink=1;blinkT=2.5+Math.random()*4;}blink=Math.max(0,blink-dt*7);
  const open=Math.max(.06,p.eye*(1-Math.sin(Math.min(1,blink)*Math.PI)*.94));
  const showClosed=p.happy>.5||p.eye<.15;
  eyes.forEach(e=>{e.visible=!showClosed;e.scale.y=open;});
  closed.forEach((c,i)=>{c.visible=showClosed;c.rotation.z=(p.eye<.15&&p.happy<.5)?Math.PI:0;c.position.y=R*(p.eye<.15&&p.happy<.5?.12:.04);});
  blushMat.opacity=Math.min(.55,p.blush*.55);
  mouthOpen.scale.setScalar(Math.max(.001,p.mouth));mouthGroup.visible=p.mouth<.35;
  // body: sitting pitches up around the hips, lying lowers everything
  const breathe=Math.sin(time*(p.lie>.5?1.6:2.6))*.012*(1+p.lie);
  const P2=gait*Math.PI*2,bob=(-Math.cos(2*P2)*(.012*wW+.02*tW)+Math.sin(P2)*.045*gW)*moveW;
  body.rotation.x=-.62*p.sit+.12*p.crouch+Math.sin(P2+.6)*.13*gW*moveW-.12*airW;
  body.rotation.z=Math.sin(time*40)*.004*p.purr+Math.sin(P2)*.035*wW*moveW+bank;
  body.position.y=hipY-p.sit*bodyH*.35-p.lie*(legLen*.95)-p.crouch*legLen*.35+bob;
  torso.scale.set(bodyW*(1+breathe),bodyH*(1+breathe),bodyLen*(1+Math.sin(P2)*.07*gW*moveW));
  // legs
  legs.forEach((L,li)=>{
   let sw=0,lift=0;
   let reach=0;for(const [g,w] of [[GAITS.walk,wW],[GAITS.trot,tW],[GAITS.gallop,gW]]){if(w<.01)continue;const [ang,l,len]=legCycle((gait+g.off[li])%1,g);sw+=ang*w;lift+=l*w;reach+=(len-1)*w;}
   sw*=moveW;lift*=moveW;reach*=moveW;sw+=(L.front?-.85:.95)*airW;
   // The planted leg flexes to absorb the body's bob, so the paw stays on the floor.
   const dy=(L.front?bob:bob*.6)/legWorld*moveW*(1-Math.min(1,lift*3));
   const stretch=(1+reach+dy)*(1-.3*lift);L.lower.scale.y=stretch;L.lift=lift;L.paw.rotation.x=(L.front?.9:-.5)*lift;
   if(L.front){
    let rx=sw+.62*p.sit-1.45*p.lie;
    if(L.side===p.frontRaiseSide&&p.frontRaise>0)rx-=p.frontRaise*(2.2+Math.sin(time*9)*.25*p.wave);
    if(L.side===p.frontRaiseSide&&p.lick>0)rx-=p.lick*(1.9);
    L.pivot.rotation.x=rx;L.pivot.rotation.z=(L.side===p.frontRaiseSide?Math.sin(time*8)*.35*p.wave:0);
    L.lower.scale.y=(1+.55*p.sit*(1-p.lie))*stretch;
   }else{
    L.pivot.position.y=L.baseY-p.sit*bodyH*.35-p.lie*legLen*.95-p.crouch*legLen*.3+bob*.6;
    L.pivot.rotation.x=sw-1.2*p.sit-1.35*p.lie+.3*p.crouch+Math.sin(time*16)*.08*p.wiggle;
   }
  });
  // head
  neck.rotation.x=.62*p.sit*(1-p.lie*.3)+p.headPitch-.12*p.crouch+p.lie*.15-(Math.sin(P2+.6)*.13*gW*moveW-.12*airW)*.8-bob*1.5;
  head.rotation.y=p.headYaw+look;head.rotation.z=p.headTilt+Math.sin(time*14)*.03*p.lick;
  head.rotation.x=p.lick*.35;
  ears.forEach((e,i)=>{const s=i?1:-1;e.rotation.z=-s*(.32+p.ears*.5)+Math.sin(time*1.3+i*2)*.02;e.rotation.x=-.08-p.ears*.3;});
  // tail
  const sway=(Math.sin(time*1.6)*.25*(1-moveW)+Math.sin(P2)*.16*moveW)*(1-p.lie*.6)+Math.sin(time*13)*.35*p.wiggle,up=Math.min(1,p.tailUp+.15*moveW);
  tailRoot.rotation.x=-2.05+up*1.65-p.lie*.9+p.sit*.4;
  tail.forEach((s,i)=>{const f=i/tail.length;s.rotation.x=(up*.16)*(f>.55?1.6:.2)+(p.sit*.15)*f;s.rotation.z=sway*(.15+f*.25)+p.tailCurl*.25*(p.lie>.5?1:0);});
 }
 function setPose(next){Object.assign(target,next);}
 function reset(){Object.assign(target,{sit:0,lie:0,crouch:0,headPitch:0,headYaw:0,headTilt:0,tailUp:.6,tailCurl:0,eye:1,happy:0,mouth:0,ears:0,blush:0,frontRaise:0,wave:0,walk:0,purr:0,lean:0,lick:0,wiggle:0});}
 function dispose(){disposables.forEach(d=>d.dispose?.());cat.removeFromParent();}
 const parts={head,neck,body,torso,legs,tail,eyes,ears,wear,mouthOpen,R,headR:R*S,bodyW:bodyW*S,height:(hipY+bodyH+R*1.6)*S,scale:S,bodyLen:bodyLen*S};
 cat.userData.parts=parts;
 return {group:cat,parts,pose:target,current:pose,update,setPose,reset,dispose,palette:pal,growth:g};
}

/* Accessories in 3D, matching the shop's names. Returned group is attached to the slot. */
export function buildWear(T,id,headR){
 const g=new T.Group(),R=headR,m=c=>new T.MeshStandardMaterial({color:c,roughness:.5});
 const add=(geo,mat,pos,rot,scale)=>{const x=new T.Mesh(geo,mat);x.position.set(...pos);if(rot)x.rotation.set(...rot);if(scale)x.scale.set(...scale);x.castShadow=true;g.add(x);return x;};
 if(id==='party'){const cone=new T.ConeGeometry(R*.38,R*.95,24);const cols=[];const p=cone.attributes.position,c=new T.Color();for(let i=0;i<p.count;i++){c.set(Math.sin(p.getY(i)*28)>0?'#ff7a45':'#ffd166');cols.push(c.r,c.g,c.b);}cone.setAttribute('color',new T.Float32BufferAttribute(cols,3));add(cone,new T.MeshStandardMaterial({vertexColors:true,roughness:.6}),[R*.15,R*.42,0],[0,0,-.25]);add(new T.SphereGeometry(R*.12,14,10),m('#7bd389'),[R*.27,R*.9,0]);}
 if(id==='crown'){const gold=new T.MeshStandardMaterial({color:'#f2c14e',roughness:.25,metalness:.7});add(new T.CylinderGeometry(R*.42,R*.4,R*.22,24,1,true),gold,[0,R*.1,0]);for(let i=0;i<5;i++){const a=i/5*Math.PI*2;add(new T.ConeGeometry(R*.08,R*.24,8),gold,[Math.sin(a)*R*.41,R*.32,Math.cos(a)*R*.41]);add(new T.SphereGeometry(R*.055,10,8),m(i%2?'#ef6f8f':'#45c4a0'),[Math.sin(a)*R*.43,R*.1,Math.cos(a)*R*.43]);}}
 if(id==='specs'){const rim=m('#3b2b28');for(const s of [-1,1])add(new T.TorusGeometry(R*.3,R*.035,8,28),rim,[s*R*.38,0,0],[0,s*.22,0]);add(new T.CylinderGeometry(R*.025,R*.025,R*.18,6),rim,[0,R*.04,0],[0,0,Math.PI/2]);}
 if(id==='shades'){const black=new T.MeshStandardMaterial({color:'#1d1a24',roughness:.15,metalness:.3});for(const s of [-1,1])add(new T.SphereGeometry(R*.33,20,14),black,[s*R*.38,0,0],[0,s*.22,0],[1,.8,.22]);add(new T.CylinderGeometry(R*.03,R*.03,R*.2,6),black,[0,R*.06,0],[0,0,Math.PI/2]);}
 if(id==='bow'){const pink=m('#ef6f8f');for(const s of [-1,1])add(new T.ConeGeometry(R*.16,R*.32,12),pink,[s*R*.17,-R*.36,R*.55],[0,0,s*Math.PI/2]);add(new T.SphereGeometry(R*.09,12,10),m('#d94f72'),[0,-R*.36,R*.58]);}
 if(id==='scarf'){const green=m('#2fa37a');add(new T.TorusGeometry(R*.62,R*.13,12,36),green,[0,0,0],[-(Math.PI/2-.6),0,0]);add(new T.BoxGeometry(R*.22,R*.55,R*.09),green,[R*.22,-R*.68,R*.5],[.3,0,.18]);}
 g.userData.wearId=id;return g;
}
