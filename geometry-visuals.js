/* Exact 2D diagrams and a small, rotatable orthographic 3D renderer.
   SVG is the display surface; the solids and hinged net are built in x,y,z coordinates.
   No WebGL, remote assets, automatic animation or parallel render loops. */
(function(root){
'use strict';
const G=root.MochiGeometryBridge||(typeof require==='function'?require('./geometry-bridge.js'):null);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num=n=>Number(n.toFixed(3)),point=p=>p.map(num).join(','),mean=points=>[0,1,2].map(i=>points.reduce((s,p)=>s+p[i],0)/points.length);
function frame(body,alt,extra=''){return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 360" class="geometry-figure" role="img" aria-label="${esc(alt)}" ${extra}><title>${esc(alt)}</title><g stroke="#37313e" stroke-width="1.3" stroke-linejoin="round">${body}</g></svg>`;}
const label=(p,t,attrs='')=>`<text x="${num(p[0])}" y="${num(p[1])}" text-anchor="middle" dominant-baseline="middle" fill="#37313e" stroke="none" font-size="16" font-family="system-ui,sans-serif" ${attrs}>${esc(t)}</text>`;
function project(faces,centre=[0,0,0],yaw=-.6,pitch=.40,alt='A solid that can be viewed from different directions.',extent=0){
 const rot=p=>G.rotate(p.map((v,i)=>v-centre[i]),yaw,pitch);
 const view=faces.map((f,i)=>({...f,i,points:f.points.map(rot),normal:f.normal?G.rotate(f.normal,yaw,pitch):null}));
 const coords=view.flatMap(f=>f.points),max=Math.max(extent,1,...coords.map(p=>Math.max(Math.abs(p[0]),Math.abs(p[1]))));
 const scale=132/max,map=p=>[260+p[0]*scale,174-p[1]*scale];
 const visible=view.filter(f=>f.doubleSided||!f.normal||f.normal[2]>.00001).sort((a,b)=>mean(a.points)[2]-mean(b.points)[2]);
 const body=visible.map(f=>{
  const fill=f.internal?'#ebc3b9':f.label?['#e5daef','#dae8e1','#f4e4c2','#e0e5f1','#eedce7','#e7e5de'][f.i%6]:['#e6e0ee','#eee9f5','#ddd4e7','#f7f3fb','#e1d7ec','#cdbbdd'][f.side??0];
  return `<polygon data-face="${f.side??f.label??''}" data-internal="${!!f.internal}" points="${f.points.map(p=>point(map(p))).join(' ')}" fill="${fill}"/>`+(f.label?label(map(mean(f.points)),f.label):'');
 }).join('');
 return frame(body,alt);
}
function blockDiagram(spec){
 const a=typeof spec.a==='number'?spec.a:3,b=typeof spec.b==='number'?spec.b:2,c=typeof spec.c==='number'?spec.c:3;
 const fs=G.cubeFaces().map(f=>({...f,points:f.points.map(p=>[p[0]*a,p[1]*c,p[2]*b])}));
 let svg=project(fs,[a/2,c/2,b/2],-.65,.42,'A cuboid. Length, width and height are stated in the question. Not drawn to scale.');
 const caption=`Length ${spec.a} cm · Width ${spec.b} cm · Height ${spec.c} cm`;
 return svg.replace('</g></svg>',label([260,334],caption)+'</g></svg>');
}
function angleDiagram(spec){
 const angle=spec.interior??60,theta=(180-angle)*Math.PI/180,r=(spec.rotation||0)*Math.PI/180,C=[0,0],B=[-1.8,0],D=[1.35,0],A=[1.65*Math.cos(theta),1.65*Math.sin(theta)];
 const map=p=>[260+70*(Math.cos(r)*p[0]-Math.sin(r)*p[1]),180-70*(Math.sin(r)*p[0]+Math.cos(r)*p[1])];
 const line=(p,q)=>`<line x1="${map(p)[0]}" y1="${map(p)[1]}" x2="${map(q)[0]}" y2="${map(q)[1]}"/>`;
 const arc=(from,to,rad,txt,bold=false)=>{const pts=Array.from({length:31},(_,i)=>{const t=from+(to-from)*i/30;return map([rad*Math.cos(t),rad*Math.sin(t)]);});const m=(from+to)/2;return `<polyline points="${pts.map(point).join(' ')}" fill="none" stroke-width="${bold?3:1.1}"/>`+label(map([(rad+.23)*Math.cos(m),(rad+.23)*Math.sin(m)]),txt);};
 let out=line(B,D)+line(C,A)+line(A,B);
 out+=label(map([A[0]*1.18,A[1]*1.18]),'A')+label(map([-2.08,-.13]),'B')+label(map([-.04,-.3]),'C')+label(map([1.66,-.14]),'D');
 if(spec.exterior){out+=arc(0,theta,.38,'x',true);if(!spec.hideAngle)out+=arc(theta,Math.PI,.60,`${angle}°`);}
 else out+=arc(theta,Math.PI,.50,'x',true);
 return frame(out,'Triangle ABC. B, C, D are collinear with D beyond C. The bold arc x is '+(spec.exterior?'between rays CA and CD.':'between rays CA and CB.'));
}
function straightDiagram(spec){
 const p=spec.p,q=spec.q,r=(spec.rotation||0)*Math.PI/180,map=a=>[260+118*Math.cos(a+r),180-118*Math.sin(a+r)],O=[260,180];let out='';
 const rays=[0,p*Math.PI/180,(p+q)*Math.PI/180,Math.PI];
 for(const a of rays){const v=map(a);out+=`<line x1="260" y1="180" x2="${num(v[0])}" y2="${num(v[1])}"/>`;}
 for(let i=0;i<3;i++){const a=(rays[i]+rays[i+1])/2+r;out+=label([260+67*Math.cos(a),180-67*Math.sin(a)],i===0?`${p}°`:i===1?`${q}°`:'x');}
 return frame(out,'A straight angle is split into three adjacent openings labelled '+p+' degrees, '+q+' degrees and x.');
}
function flat(mode,n=3,shift=0){
 if(mode==='angles')return angleDiagram({interior:60,rotation:shift,exterior:true});
 let out='';
 if(mode==='area'){
  const A=[210+shift,55],B=[65,270],D=[225,270],C=[450,270];
  out=`<polygon points="${[A,B,D].map(point).join(' ')}" fill="#e4d7ef"/><polygon points="${[A,D,C].map(point).join(' ')}" fill="#f4ecfa"/><line x1="${A[0]}" y1="55" x2="${A[0]}" y2="270" stroke-dasharray="5 5"/>`;
  out+=label([A[0],34],'A')+label([65,292],'B')+label([225,292],'D')+label([450,292],'C')+label([145,322],'4 cm')+label([338,322],'6 cm');
  return frame(out,'Triangles ABD and ADC share the same perpendicular height. BD is 4 cm and DC is 6 cm. The apex can slide without changing either area.');
 }
 if(mode==='length'){
  for(let x=0;x<=n;x++){out+=`<line x1="${100+x*320/n}" y1="165" x2="${100+x*320/n}" y2="185"/>`;if(x<n)out+=label([100+(x+.5)*320/n,207],'1 cm');}
  out+='<line x1="100" y1="175" x2="420" y2="175"/>';out+=label([260,268],`${n} steps of 1 cm = ${n} cm`);
 }else{
  const sz=220/n;for(let y=0;y<n;y++)for(let x=0;x<n;x++)out+=`<rect x="${150+x*sz}" y="${54+y*sz}" width="${sz}" height="${sz}" fill="${y%2?'#f0e9f5':'#e1d4ec'}"/>`;
  out+=label([260,303],`${n} × ${n} unit squares = ${n*n} cm²`);
 }
 return frame(out,mode==='length'?`${n} unit lengths make ${n} centimetres.`:`${n} rows of ${n} unit squares cover ${n*n} square centimetres.`);
}
function faceArea(spec){
 const n=spec.n===2?2:1,w=160,h=112,xs=n===2?[70,290]:[180];let body='';
 for(const x of xs){body+=`<rect x="${x}" y="115" width="${w}" height="${h}" fill="#f7f3fb"/>`+label([x+w/2,250],String(spec.w)+' cm')+label([x-18,171],String(spec.h)+' cm','transform="rotate(-90 '+(x-18)+' 171)"');}
 body+=label([260,65],spec.label||'Only the named face')+label([260,310],n===2?'Two matching faces; not all six.':'One flat face; not the inside volume.','font-size="14"');
 return frame(body,'Flat view of '+(spec.label||'the named face')+'. '+spec.w+' cm by '+spec.h+' cm; not drawn to scale.');
}
function diagram(spec){if(!spec)return '';if(spec.kind==='geo-face-area')return faceArea(spec);if(spec.kind==='geo-block')return blockDiagram(spec);if(spec.kind==='geo-angle')return angleDiagram(spec);if(spec.kind==='geo-straight')return straightDiagram(spec);if(spec.kind==='geo-row'){const m=G.row(spec.count,spec.edge);return project(m.faces,m.centre,-.6,.4,`${m.count} cubes of edge ${m.edge} cm in one row. The touching faces are internal.`);}return '';}
const paperDiagram=spec=>diagram(spec).replace(/#eee9f5/g,'#ffffff').replace(/#f7f3fb/g,'#eeeeee').replace(/#cdbbdd/g,'#dddddd').replace(/#e1d7ec/g,'#e6e6e6').replace(/#e6e0ee/g,'#eeeeee').replace(/#ddd4e7/g,'#dddddd');
root.MochiGeometryVisuals={diagram:paperDiagram,project,flat,angleDiagram,straightDiagram,blockDiagram};
if(typeof module!=='undefined')module.exports=root.MochiGeometryVisuals;
})(typeof globalThis!=='undefined'?globalThis:this);
