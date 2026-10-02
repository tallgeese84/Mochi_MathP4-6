/* Celebration moments, shown only when something is earned: a topic mastered, a mock paper finished,
   a mixed practice set completed, or a new trick for Mochi. About three seconds, tap to close.
   Paw prints tumble with simple physics on a canvas; reduced motion shows a still card instead. */
(function(root){
'use strict';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const KINDS={topic:{emoji:'🏅',color:'#e2873b'},mock:{emoji:'📝',color:'#5b3a86'},set:{emoji:'🔀',color:'#2f9d72'},trick:{emoji:'🐾',color:'#e2873b'},lesson:{emoji:'📘',color:'#5b3a86'}};
let open=null,lastAt=0;
const reduced=()=>{try{return root.matchMedia?.('(prefers-reduced-motion: reduce)').matches;}catch(_){return false;}};
const lite=()=>/Android/i.test(root.navigator?.userAgent||'');
function pawPath(ctx){ctx.beginPath();for(const [x,y,rx,ry] of [[-5.5,-3,1.9,2.5],[-1.5,-5.8,1.9,2.6],[2.5,-5.8,1.9,2.6],[6.3,-3,1.9,2.5]]){ctx.moveTo(x+rx,y);ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);}ctx.moveTo(.4,-.8);ctx.bezierCurveTo(3.4,-.8,6,2.8,6,5.2);ctx.bezierCurveTo(6,7.3,4.4,8,2.9,8);ctx.bezierCurveTo(1.7,8,1.3,7.4,.4,7.4);ctx.bezierCurveTo(-.5,7.4,-1,8,-2.2,8);ctx.bezierCurveTo(-3.7,8,-5,7.3,-5,5.2);ctx.bezierCurveTo(-5,2.8,-2.6,-.8,.4,-.8);ctx.fill();}
function show({kind='topic',title='Well done!',detail='',sub=''}={}){
 const now=Date.now();if(open||now-lastAt<1500||!document.body)return false;lastAt=now;
 const k=KINDS[kind]||KINDS.topic,calm=reduced();
 const el=document.createElement('div');el.className='ux-celebrate'+(calm?' ux-celebrate-calm':'');el.setAttribute('role','status');el.setAttribute('aria-live','polite');
 el.innerHTML=`<canvas aria-hidden="true"></canvas><div class="ux-cel-card" style="--c:${k.color}"><svg class="ux-cel-medal" viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="50" class="ux-cel-track"/><circle cx="60" cy="60" r="50" class="ux-cel-fill" pathLength="100"/><text x="60" y="74" text-anchor="middle">${k.emoji}</text></svg><h2>${esc(title)}</h2>${detail?`<p class="ux-cel-detail">${esc(detail)}</p>`:''}${sub?`<p class="ux-cel-sub">${esc(sub)}</p>`:''}<p class="ux-cel-tap">Tap to continue</p></div>`;
 document.body.append(el);open=el;
 const close=()=>{if(!open)return;open=null;el.classList.add('ux-cel-out');setTimeout(()=>el.remove(),260);};
 el.addEventListener('click',close);setTimeout(close,calm?2600:3400);
 if(calm)return true;
 const canvas=el.querySelector('canvas'),ctx=canvas.getContext('2d');if(!ctx)return true;
 const dpr=Math.min(root.devicePixelRatio||1,2),W=root.innerWidth,H=root.innerHeight;canvas.width=W*dpr;canvas.height=H*dpr;canvas.style.width=W+'px';canvas.style.height=H+'px';ctx.scale(dpr,dpr);
 const colors=['#e2873b','#f0a35e','#5b3a86','#7a56a8','#2f9d72','#f4c95d'],n=lite()?18:42,floor=H-24;
 const paws=Array.from({length:n},(_,i)=>({x:W/2+(Math.random()-.5)*W*.25,y:H*.42+(Math.random()-.5)*40,vx:(Math.random()-.5)*W*1.1,vy:-(H*.6+Math.random()*H*.9),r:(Math.random()-.5)*6,vr:(Math.random()-.5)*10,s:1.4+Math.random()*1.8,c:colors[i%colors.length],life:0}));
 let last=performance.now(),t=0;
 (function frame(now){if(!el.isConnected)return;const dt=Math.min(.033,(now-last)/1000);last=now;t+=dt;ctx.clearRect(0,0,W,H);
  for(const p of paws){p.vy+=H*2.1*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.r+=p.vr*dt;p.vx*=.995;
   if(p.y>floor){p.y=floor;p.vy*=-.45;p.vx*=.7;p.vr*=.6;}if(p.x<10||p.x>W-10){p.vx*=-.8;p.x=Math.max(10,Math.min(W-10,p.x));}
   const fade=t>2.5?Math.max(0,1-(t-2.5)/.8):1;ctx.save();ctx.globalAlpha=fade;ctx.translate(p.x,p.y);ctx.rotate(p.r);ctx.scale(p.s,p.s);ctx.fillStyle=p.c;pawPath(ctx);ctx.restore();}
  if(t<3.4)requestAnimationFrame(frame);})(last);
 return true;
}
root.MochiCelebrate={show};
})(window);
