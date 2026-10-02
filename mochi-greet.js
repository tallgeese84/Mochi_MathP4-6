/* Mochi says hello on Today: a small 3D Mochi who waves, follows Euna's finger and purrs when tapped.
   Loaded after the page is ready, only on capable devices; the flat picture stays as the fallback. */
export const GREET_VERSION=1;
export async function mountGreeting(host,{growth=0,three,catModule,onTap}={}){
 const T=three||await import('./vendor/three-r180/three.module.js'),C=catModule||await import('./mochi-home-cat.js');
 const canvas=document.createElement('canvas');canvas.className='mochi-greet-canvas';canvas.setAttribute('aria-hidden','true');
 const renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.NeutralToneMapping;renderer.setClearColor(0x000000,0);
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(30,1,.05,30);camera.position.set(0,1.0,2.9);camera.lookAt(0,.6,0);
 scene.add(new T.HemisphereLight('#fff7ef','#d9c9ea',1.9));const sun=new T.DirectionalLight('#fff1dc',2.2);sun.position.set(1.6,3,2.4);scene.add(sun);
 // A soft round shadow instead of a floor, so Mochi floats on the card.
 const shadowTex=(()=>{const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext?.('2d');if(!g)return null;const r=g.createRadialGradient(64,64,4,64,64,62);r.addColorStop(0,'rgba(60,30,90,.28)');r.addColorStop(1,'rgba(60,30,90,0)');g.fillStyle=r;g.fillRect(0,0,128,128);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;return t;})();
 const shadow=new T.Mesh(new T.PlaneGeometry(1.5,1.5),new T.MeshBasicMaterial({map:shadowTex,color:shadowTex?'#ffffff':'#d9c9ea',transparent:true,opacity:shadowTex?1:.35,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=.005;scene.add(shadow);
 const cat=C.buildCat(T,null,{growth});scene.add(cat.group);cat.group.rotation.y=.18;
 const base={sit:1,lie:0,crouch:0,headPitch:0,headYaw:0,headTilt:0,tailUp:.8,tailCurl:0,eye:1,happy:0,mouth:0,ears:0,blush:0,frontRaise:0,frontRaiseSide:1,wave:0,walk:0,purr:0,lean:0,lick:0,wiggle:0};
 cat.setPose(base);cat.update(.016,true);
 host.append(canvas);host.classList.add('mochi-greet-ready');
 let w=0,h=0,raf=0,last=performance.now(),t=0,look={x:0,y:0},want={x:0,y:0},hiddenPage=false,disposed=false,purrUntil=0;
 function size(){const r=host.getBoundingClientRect();w=Math.max(1,r.width);h=Math.max(1,r.height);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
 const ro=typeof ResizeObserver!=='undefined'?new ResizeObserver(size):null;ro?.observe(host);size();
 // Greeting: a wave and a happy face, then settle and watch Euna.
 const script=[[0,{...base,happy:1,blush:.6,tailUp:1}],[.35,{...base,frontRaise:.8,wave:1,happy:1,blush:.6,tailUp:1}],[2.1,{...base,happy:.4,tailUp:.9}],[2.6,{...base,tailUp:.8}]];let step=0;
 function onMove(e){const r=host.getBoundingClientRect();want.x=Math.max(-1,Math.min(1,(e.clientX-(r.left+r.width/2))/(r.width*.8)));want.y=Math.max(-1,Math.min(1,(e.clientY-(r.top+r.height*.35))/(r.height*.9)));}
 function onTapped(){purrUntil=t+2.2;cat.setPose({...base,happy:1,blush:1,purr:1,eye:.2,tailUp:1,headTilt:.25});onTap?.();}
 window.addEventListener('pointermove',onMove,{passive:true});host.addEventListener('pointerdown',onTapped);
 const onVis=()=>{hiddenPage=document.hidden;if(!hiddenPage&&!raf&&!disposed){last=performance.now();raf=requestAnimationFrame(loop);}};document.addEventListener('visibilitychange',onVis);
 function loop(now){
  raf=0;if(disposed||hiddenPage)return;const dt=Math.min(.05,(now-last)/1000);last=now;t+=dt;
  while(step<script.length&&t>=script[step][0]){cat.setPose(script[step][1]);step++;}
  if(purrUntil&&t>purrUntil){purrUntil=0;cat.setPose(base);}
  look.x+=(want.x-look.x)*Math.min(1,dt*5);look.y+=(want.y-look.y)*Math.min(1,dt*5);
  if(step>=script.length&&!purrUntil)cat.setPose({headYaw:look.x*.55,headPitch:look.y*.25});
  cat.group.position.y=Math.sin(t*1.4)*.012;
  cat.update(dt,false,{});renderer.render(scene,camera);
  if(host.isConnected)raf=requestAnimationFrame(loop);else dispose();
 }
 raf=requestAnimationFrame(loop);
 function dispose(){if(disposed)return;disposed=true;cancelAnimationFrame(raf);ro?.disconnect();window.removeEventListener('pointermove',onMove);host.removeEventListener('pointerdown',onTapped);document.removeEventListener('visibilitychange',onVis);cat.dispose();shadow.geometry.dispose();shadow.material.dispose();shadowTex?.dispose();renderer.dispose();canvas.remove();host.classList.remove('mochi-greet-ready');}
 return {dispose,canvas,cat};
}
