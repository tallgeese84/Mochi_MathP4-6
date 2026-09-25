/* Exact SVG constructions: given geometry is shared by questions and their diagrams. */
(function(root){
'use strict';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const n=x=>Number(x.toFixed(3));
const line=(a,b,extra='')=>`<line x1="${n(a[0])}" y1="${n(a[1])}" x2="${n(b[0])}" y2="${n(b[1])}" ${extra}/>`;
const text=(x,y,t,extra='')=>`<text x="${n(x)}" y="${n(y)}" ${extra}>${esc(t)}</text>`;
const poly=(p,extra='')=>`<polygon points="${p.map(v=>v.map(n).join(',')).join(' ')}" ${extra}/>`;
const rect=(x,y,w,h,extra='')=>`<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" ${extra}/>`;
function intersect(a,b,c,d){const x=b[0]-a[0],y=b[1]-a[1],u=d[0]-c[0],v=d[1]-c[1],den=x*v-y*u;if(Math.abs(den)<1e-12)throw Error('Parallel construction');const t=((c[0]-a[0])*v-(c[1]-a[1])*u)/den;return [a[0]+t*x,a[1]+t*y];}
function area(p){return Math.abs(p.reduce((s,v,i)=>{const w=p[(i+1)%p.length];return s+v[0]*w[1]-w[0]*v[1];},0))/2;}
function central(k){const t=1/k,A=[0,0],B=[1,0],C=[1,1],D=[0,1],corners=[A,B,C,D],ends=[[1,t],[1-t,1],[0,1-t],[t,0]];return {corners,ends,inside:corners.map((p,i)=>intersect(p,ends[i],corners[(i+1)%4],ends[(i+1)%4]))};}
function spiral(steps){let x=0,y=0,len=1,dir=0,used=0;const dirs=[[1,0],[0,1],[-1,0],[0,-1]],points=[[0,0]],segments=[];while(used<steps){const full=Math.floor(dir/2)+1,take=Math.min(full,steps-used),v=dirs[dir%4];for(let j=0;j<take;j++){x+=v[0];y+=v[1];points.push([x,y]);}segments.push({length:take,full,direction:dir%4,end:[x,y]});used+=take;dir++;}return {x,y,points,segments};}
function diagram(spec,id='figure',help=false){
 if(!spec)return '';const key='ep-'+String(id).replace(/[^a-zA-Z0-9_-]/g,'').slice(0,90),hatch=`url(#${key})`;let out='',alt=spec.alt||'Mathematical figure; use the stated dimensions, not screen measurements.';
 const dimH=(x1,x2,y,label)=>line([x1,y],[x2,y])+line([x1,y-5],[x1,y+5])+line([x2,y-5],[x2,y+5])+text((x1+x2)/2,y+24,label);
 if(spec.kind==='triangle'){
  const x=70,y=245,w=340,h=190,A=[190,y-h],B=[x,y],C=[x+w,y];out=poly([A,B,C])+text(A[0],A[1]-17,'A')+text(B[0]-13,B[1]+8,'B')+text(C[0]+13,C[1]+8,'C')+dimH(x,x+w,270,`${spec.b} cm`);
  if(spec.h!==undefined)out+=line(A,[A[0],y],'stroke-dasharray="5 4"')+`<path d="M190 230h15v15"/>`+text(240,155,`${spec.h} cm`);
 }else if(spec.kind==='split'){
  const A=[210,45],B=[50,235],C=[425,235],total=spec.parts.reduce((a,b)=>a+b,0);let acc=0;out=poly([A,B,C])+text(210,28,'A')+text(36,242,'B')+text(441,242,'C');
  spec.parts.forEach((p,i)=>{const start=50+375*acc/total;acc+=p;const end=50+375*acc/total;if(i<spec.parts.length-1){out+=line(A,[end,235])+text(end,258,String.fromCharCode(68+i));}if(!spec.hideMeasures)out+=text((start+end)/2,286,`${p} cm`);if(spec.shade===i)out+=poly([A,[start,235],[end,235]],`fill="${hatch}"`);});
 }else if(spec.kind==='inscribed'){
  const scale=Math.min(330/spec.w,195/spec.h),w=spec.w*scale,h=spec.h*scale,x=(480-w)/2,y=55,p=spec.position??.35;out=rect(x,y,w,h)+poly([[x+w*p,y],[x+w,y+h*.30],[x+w*p,y+h],[x,y+h*.68]],`fill="${hatch}"`);
  for(const [dx,dy,label]of [[0,0,'A'],[w,0,'B'],[w,h,'C'],[0,h,'D'],[w*p,0,'E'],[w,h*.30,'F'],[w*p,h,'G'],[0,h*.68,'H']])out+=text(x+dx+(dx===0?-16:dx===w?16:0),y+dy+(dy===0?-13:dy===h?23:6),label);
  if(help)out+=line([x+w*p,y],[x+w*p,y+h],'stroke-dasharray="6 4"');
 }else if(spec.kind==='border'){
  const s=Math.min(320/spec.w,180/spec.h),x=70,y=55;out=rect(x,y,s*spec.w,s*spec.h,`fill="${hatch}"`)+rect(x+s*spec.b,y+s*spec.b,s*(spec.w-2*spec.b),s*(spec.h-2*spec.b),'fill="white"')+dimH(x,x+s*spec.w,y+s*spec.h+25,`${spec.w} m`)+text(x+s*spec.w+40,y+s*spec.h/2,`${spec.h} m`)+text(240,30,`Uniform inside border: ${spec.b} m`);
 }else if(spec.kind==='central'){
  const m=central(spec.k),map=p=>[105+220*p[0],40+220*p[1]];out=poly(m.corners.map(map));for(let i=0;i<4;i++)out+=line(map(m.corners[i]),map(m.ends[i]));out+=poly(m.inside.map(map),`fill="${hatch}"`);
  ['A','B','C','D'].forEach((t,i)=>{const [x,y]=map(m.corners[i]);out+=text(x+(i===0||i===3?-16:16),y+(i<2?-14:22),t);});
  ['E','F','G','H'].forEach((t,i)=>{const [x,y]=map(m.ends[i]);out+=text(x+(i===0?18:i===2?-18:0),y+(i===1?22:i===3?-14:5),t);});
  out+=text(390,156,`${spec.side} cm`);if(help){const [x,y]=map(m.inside[0]);out+=text(x+2,y-14,'P');}
 }else if(spec.kind==='overlap'){
  const sx=spec.a-spec.ox,sy=spec.a-spec.oy,max=Math.max(spec.a,sx+spec.b,sy+spec.b),s=210/max,x=110,y=42;
  out=rect(x,y,s*spec.a,s*spec.a)+rect(x+s*sx,y+s*sy,s*spec.b,s*spec.b)+rect(x+s*sx,y+s*sy,s*spec.ox,s*spec.oy,`fill="${hatch}"`)+text(x-35,y+s*spec.a/2,`${spec.a} cm`)+text(x+s*(sx+spec.b)+37,y+s*(sy+spec.b/2),`${spec.b} cm`)+text(240,287,`Overlap: ${spec.ox} cm × ${spec.oy} cm`);
 }else if(spec.kind==='semicircles'){
  const sum=spec.ds.reduce((a,b)=>a+b,0),scale=350/sum;let x=65;out=line([65,200],[415,200]);spec.ds.forEach(d=>{const w=d*scale;out+=`<path d="M${n(x)} 200 A${n(w/2)} ${n(w/2)} 0 0 1 ${n(x+w)} 200"/>`+text(x+w/2,230,`${d} cm`);x+=w;});out+=text(240,282,'Only the semicircular arcs are counted.');
 }else if(spec.kind==='circleSquare'){
  out=rect(130,55,200,200,`fill="${hatch}"`)+`<circle cx="230" cy="155" r="100" fill="white"/>`+dimH(130,330,275,`${spec.side} cm`);
 }else if(spec.kind==='circleRatio'){
  out=`<circle cx="155" cy="150" r="${96/spec.k}"/><circle cx="325" cy="150" r="96"/>`+line([155,150],[155+96/spec.k,150])+line([325,150],[421,150])+text(174,133,'r')+text(371,133,`${spec.k}r`)+text(155,268,'Small circle')+text(325,268,'Large circle');
 }else if(spec.kind==='isosceles'){
  const a=spec.apex*Math.PI/180,w=Math.min(135,180*Math.tan(a/2)),h=w/Math.tan(a/2),y=250,A=[240,y-h],B=[240-w,y],C=[240+w,y];out=poly([A,B,C])+line([B[0]-50,y],[C[0]+50,y]);
  out+=text(240,y-h+36,`${spec.apex}°`)+text(spec.exterior?C[0]+28:B[0]+29,y-14,'x')+text(240,25,'AB = AC')+text(240,y-h-14,'A')+text(B[0],y+23,'B')+text(C[0],y+23,'C');
 }else if(spec.kind==='star'){
  const pts=Array.from({length:5},(_,i)=>{const a=(i===2&&spec.angleC!==undefined?spec.angleC:(-90+i*72))*Math.PI/180;return [240+112*Math.cos(a),155+112*Math.sin(a)];});out=poly([0,2,4,1,3].map(i=>pts[i]));pts.forEach(([x,y],i)=>{const len=Math.hypot(x-240,y-155);out+=text(x+(x-240)/len*19,y+(y-155)/len*19+5,String.fromCharCode(65+i));});
 }else if(spec.kind==='squareTriangle'){
  const A=[80,245],B=[250,245],C=[250,75],D=[80,75],E=[250+170*Math.sin((spec.theta||60)*Math.PI/180),245-170*Math.cos((spec.theta||60)*Math.PI/180)];out=poly([A,B,C,D])+poly([B,C,E])+line(A,E);
  for(const [p,label,dx,dy]of [[A,'A',-13,18],[B,'B',7,22],[C,'C',10,-10],[D,'D',-14,-8],[E,'E',19,6]])out+=text(p[0]+dx,p[1]+dy,label);
  out+=text(142,236,'x')+text(240,30,`ABCD is a square; BC = BE.`)+text(286,201,`${spec.theta||60}°`);
 }else if(spec.kind==='net'){
  const cells=[[0,1],[1,1],[2,1],[1,0],[1,2],[1,3]],s=56,x=155,y=30;cells.forEach(([a,b],i)=>{out+=rect(x+a*s,y+b*s,s,s)+text(x+(a+.5)*s,y+(b+.5)*s+6,spec.labels[i]);});
 }else if(spec.kind==='views'){
  for(let i=0;i<2;i++){const x=75+i*245,y=104,s=85,dx=47,dy=30,l=spec.views[i];out+=poly([[x,y],[x+s,y+dy],[x+s+dx,y],[x+dx,y-dy]],'fill="#ededed"')+poly([[x,y],[x+s,y+dy],[x+s,y+dy+s],[x,y+s]],'fill="#ddd"')+poly([[x+s,y+dy],[x+s+dx,y],[x+s+dx,y+s],[x+s,y+dy+s]],'fill="#fafafa"')+text(x+s*.5+dx*.5,y,l[0])+text(x+s*.5,y+s*.55+dy/2,l[1])+text(x+s+dx*.5,y+s*.55+dy/2,l[2]);}
 }else if(spec.kind==='cubes'){
  const x=150,y=95,s=150,dx=65,dy=45;out=poly([[x,y],[x+s,y],[x+s+dx,y-dy],[x+dx,y-dy]],'fill="#f4f4f4"')+poly([[x+s,y],[x+s+dx,y-dy],[x+s+dx,y+s-dy],[x+s,y+s]],'fill="#eee"')+rect(x,y,s,s);
  if(spec.hole){const size=s*spec.hole/spec.edge;out+=rect(x+(s-size)/2,y+(s-size)/2,size,size,`fill="${hatch}"`)+text(70,166,`${spec.hole} cm`)+line([90,166],[x+(s-size)/2,y+s/2]);}
  out+=dimH(x,x+s,275,`${spec.edge===undefined?'?':spec.edge} cm`);
 }else if(spec.kind==='grid'){
  const w=350,h=200,x=65,y=40;for(let i=0;i<=spec.cols;i++)out+=line([x+i*w/spec.cols,y],[x+i*w/spec.cols,y+h]);for(let j=0;j<=spec.rows;j++)out+=line([x,y+j*h/spec.rows],[x+w,y+j*h/spec.rows]);
 }else if(spec.kind==='sticks'){
  const s=37,xs=[40,158,305];for(let k=1;k<=3;k++){const x=xs[k-1];out+=line([x,120],[x+k*s,120])+line([x,120+s],[x+k*s,120+s]);for(let j=0;j<=k;j++)out+=line([x+j*s,120],[x+j*s,120+s]);out+=text(x+k*s/2,195,`Figure ${k}`);}
 }else if(spec.kind==='spiralPath'){
  const p=spiral(30).points;out=`<polyline points="${p.map(([x,y])=>`${225+x*35},${170-y*35}`).join(' ')}"/>`+text(225,196,'Start')+text(245,155,'1 cm')+text(240,298,'Each successive pair of segments is 1 cm longer.');
 }else if(spec.kind==='spiral'){
  const p=spiral(24).points;out=p.map(([x,y],i)=>text(225+x*44,151-y*44,i+1)).join('');out+=text(240,290,'Start: right, up, left, down; lengths 1, 1, 2, 2, …');
 }else if(spec.kind==='motion'){
  out=line([60,170],[415,170])+text(65,207,'P')+text(412,207,'Q')+text(240,150,`${spec.distance} ${spec.unit||'m'}`);
  out+=line([70,100],[140,100],'marker-end="url(#'+key+'-arrow)"')+text(100,80,`${spec.a} ${spec.speedUnit||'m/min'}`);
  out+=line([spec.same?320:408,100],[spec.same?392:336,100],'marker-end="url(#'+key+'-arrow)"')+text(372,80,`${spec.b} ${spec.speedUnit||'m/min'}`);
 }
 return `<svg class="entrance-figure" viewBox="0 0 480 320" role="img" aria-labelledby="${key}-title" xmlns="http://www.w3.org/2000/svg"><title id="${key}-title">${esc(alt)}</title><defs><pattern id="${key}" width="6" height="6" patternUnits="userSpaceOnUse"><path d="M-1 1L1 -1M0 6L6 0M5 7L7 5" stroke="#888" stroke-width=".7"/></pattern><marker id="${key}-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10" fill="white" stroke="#222"/></marker></defs><g fill="none" stroke="#222" stroke-width="1.6" stroke-linejoin="round">${out}</g><style>.entrance-figure text{fill:#222;stroke:none;font:19px Georgia,serif;text-anchor:middle}</style></svg>`;
}
root.MochiEntranceFigures={diagram,central,area,intersect,spiral};if(typeof module!=='undefined')module.exports=root.MochiEntranceFigures;
})(typeof globalThis!=='undefined'?globalThis:this);
