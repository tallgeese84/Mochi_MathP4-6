/* Geometry foundations: original lessons, questions and exact 3D constructions.
   No learner data. Models are bounded and share their mathematical quantities with text. */
(function(root){
'use strict';
const unit=(id,title,prerequisites,ideas,check,why)=>({id,title,strand:'geometry',foundation:id==='geo-angles'?'m-angles':'m-volume',benchmarkPages:'Targeted foundation bridge (not a new entrance-test specification)',bridge:true,prerequisites,ideas,check,why});
const units=[
 unit('geo-measure','Length, covering and filling',[],[
  'First name what is being measured. Length follows a line and uses centimetres (cm). A centimetre is a small length, not a square or a cube.',
  'Area covers a flat surface with unit squares. A square that is 1 cm by 1 cm covers 1 square centimetre (1 cm²). A 3 cm by 3 cm square has 3 rows of 3 squares: 9 cm². The superscript 2 counts two multiplied lengths; it does not mean divide by 2.',
  'Volume fills a solid with unit cubes. A cube 1 cm along each edge occupies 1 cubic centimetre (1 cm³). A solid can have both volume inside and surface area outside. Wrapping uses square units; filling uses cubic units. Name the quantity before choosing a calculation.'
 ],['Which unit measures the paper needed to cover the outside of a closed box?',['cm','cm²','cm³'],1,'Paper covers faces. We count square units of area, not cubes inside the box.'], 'Decide whether the task follows a line, covers a surface or fills space. A correct calculation for the wrong quantity is not the answer.'),
 unit('geo-layers','Build volume one layer at a time',['geo-measure'],[
  'Build a bottom layer first. A layer 3 cubes across and 3 cubes deep contains 3 × 3 = 9 unit cubes. Stacking 3 such layers makes 9 × 3 = 27 unit cubes.',
  'For a cuboid, volume = cubes across × cubes deep × number of layers. For a cube, all three lengths are equal: an edge e gives e × e × e. Three dimensions are multiplied; volume is not 3 × edge length.',
  'To recover a cube’s edge, find the equal number that multiplies by itself three times to give the volume. For 64 cm³, test 4 × 4 × 4 = 64, so the edge is 4 cm. Dividing 64 by 3 would split the volume into three equal volumes, not find an edge. For a cuboid, divide the volume by the known area of one layer to find its height.'
 ],['A cube has edge 3 cm. Each unit cube has edge 1 cm. Which calculation counts all its unit cubes?',['3 + 3 + 3','3 × 3','3 × 3 × 3'],2,'There are 3 × 3 cubes in each layer and 3 layers.'], 'Explain each factor as a length or a layer count, then check the inverse calculation by building the volume again.'),
 unit('geo-surface','Cover faces, then hide the joins',['geo-measure','geo-layers'],[
  'A face is a flat surface. For a cube of edge 2 cm, one face covers 2 × 2 = 4 cm². The cube has six faces, so its total outside area is 6 × 4 = 24 cm². Its volume is instead 2 × 2 × 2 = 8 cm³.',
  'A cuboid has three pairs of matching faces. A box of length l, width w and height h has outside area 2(lw + lh + wh). Unfold a net and name the dimensions of each rectangle rather than memorising the expression alone.',
  'When two cubes join face-to-face, one face from each cube is hidden. One join hides TWO faces, not one. Two cubes each of edge 2 cm have 12 separate faces, but 2 faces become internal: 10 exposed faces × 4 cm² = 40 cm². Their volume still adds to 16 cm³. Separating cubes in the model is for seeing the joins; count their outside area when joined.'
 ],['Two solid cubes are joined along one complete face. How many faces become internal?',['One','Two — one from each cube','Four'],1,'Both touching faces become internal, even though there is only one join.'], 'Name the requested quantity, find the area of ONE face, then decide which faces are exposed. Check simple cases before a long row.'),
 unit('geo-angles','Name the angle before calculating',[],[
  'An angle is the opening between two rays at a vertex. In angle ACB, the middle letter C names the vertex. Point to C and trace the rays CA and CB before calculating.',
  'Extending BC beyond C creates a different ray from C. The interior angle ACB and the exterior angle between CA and the extension are beside each other on a straight line, so they add to 180°. Finding the interior angle is only an intermediate step when the exterior angle is asked for.',
  'Turning the whole drawing does not change any angle. Ignore “up”, “down”, “left” and “right”: use the vertex, ray labels and marked arc. In a split straight angle, add the parts already known, then subtract their sum from 180°. Give your final answer for the named opening, in degrees.'
 ],['Angle ACB is asked for. Which letter names its vertex?',['A','C','B'],1,'The middle letter names the point where the two rays meet.'], 'Identify the two rays and the requested opening in a rotated drawing; do not stop at a different angle just because you calculated it first.')
];
// Small prerequisite steps; excluded from the already-published assessment blueprints.
units.push(
 {...unit('geo-one-face','Find the area of one face',['geo-measure'],[
  'Name the target before multiplying: ONE flat face. A rectangular face has only two dimensions. The third length of the solid does not belong in this calculation.',
  'A box is 5 cm long, 3 cm wide and 2 cm high. Its top is a 5 by 3 rectangle, so 15 square-centimetre tiles cover it. Its front is a different 5 by 2 rectangle, so 10 tiles cover it. The same box has more than one face size.',
  'Trace the named face on the solid, sketch that face as a flat rectangle, and label its two sides. Count rows of unit squares. Finish with cm²; cm³ would describe filling the whole solid. Try a fresh named face without the model.'
 ],['A box is 5 cm long, 3 cm wide and 2 cm high. Which calculation finds the area of its TOP face?',['5 × 3','5 × 3 × 2','2 × (5 + 3)'],0,'The top is a 5 by 3 rectangle. Covering uses square units.'],'Name one face, identify its two edges, and count square units.'),microBridge:true},
 {...unit('geo-face-pairs','Pair matching faces',['geo-one-face'],[
  'Opposite faces of a cuboid match. First find the area of ONE face, then double that area to cover its opposite partner. Do not multiply by the height again.',
  'For a 5 by 3 by 2 cm closed box: top and bottom are 2 × (5 × 3) = 30 cm²; front and back are 2 × (5 × 2) = 20 cm²; the two ends are 2 × (3 × 2) = 12 cm². Add 30 + 20 + 12 = 62 cm² only when all six faces are asked for.',
  'Use the net to check that each face is counted once. For a pair, count only its two rectangles. For all six, add all three pairs. For joined boxes, identify which touching faces are hidden before subtracting them. Keep the pair, whole shell and inside volume separate.'
 ],['The front face covers 12 cm². What is the area of the FRONT AND BACK together?',['12 cm²','24 cm²','144 cm³'],1,'The matching pair contains two equal faces: 2 × 12 = 24 cm².'],'One face → matching pair → three pairs for the whole shell.'),microBridge:true}
);
function bounded(n,lo,hi){return Math.min(hi,Math.max(lo,Math.round(Number(n)||lo)));}
const add=(a,b)=>a.map((x,i)=>x+b[i]),sub=(a,b)=>a.map((x,i)=>x-b[i]);
function rotate(p,yaw=0,pitch=0){const c=Math.cos(yaw),s=Math.sin(yaw),x=c*p[0]+s*p[2],z=-s*p[0]+c*p[2],cp=Math.cos(pitch),sp=Math.sin(pitch);return [x,cp*p[1]-sp*z,sp*p[1]+cp*z];}
function cubeFaces(origin=[0,0,0],size=1){
 const [x,y,z]=origin,v=[[x,y,z],[x+size,y,z],[x+size,y+size,z],[x,y+size,z],[x,y,z+size],[x+size,y,z+size],[x+size,y+size,z+size],[x,y+size,z+size]];
 return [[0,3,2,1],[4,5,6,7],[0,1,5,4],[3,7,6,2],[0,4,7,3],[1,2,6,5]].map((indices,i)=>({points:indices.map(j=>v[j]),normal:[[0,0,-1],[0,0,1],[0,-1,0],[0,1,0],[-1,0,0],[1,0,0]][i],side:i}));
}
function solid({across=3,deep=3,high=3,layers=high,gap=0}={}){
 across=bounded(across,1,9);deep=bounded(deep,1,9);high=bounded(high,1,9);layers=bounded(layers,1,high);gap=Math.max(0,Math.min(.5,Number(gap)||0));
 const faces=[],cells=[];
 for(let y=0;y<layers;y++)for(let z=0;z<deep;z++)for(let x=0;x<across;x++){
  cells.push([x,y,z]);for(const f of cubeFaces([x*(1+gap),y*(1+gap),z*(1+gap)])){
   const [dx,dy,dz]=f.normal,internal=x+dx>=0&&x+dx<across&&y+dy>=0&&y+dy<layers&&z+dz>=0&&z+dz<deep;
   if(!internal||gap)faces.push({...f,internal,cell:[x,y,z]});
  }
 }
 return {cells,faces,across,deep,high,layers,volume:across*deep*layers,layer:across*deep,surface:2*(across*deep+across*layers+deep*layers),centre:[(across+(across-1)*gap)/2,(layers+(layers-1)*gap)/2,(deep+(deep-1)*gap)/2]};
}
function row(count=2,edge=2,gap=0){
 count=bounded(count,1,6);edge=bounded(edge,1,6);gap=Math.max(0,Math.min(edge,Number(gap)||0));const faces=[];
 for(let x=0;x<count;x++)for(const f of cubeFaces([x*(edge+gap),0,0],edge)){
  const internal=(f.side===4&&x>0)||(f.side===5&&x<count-1);if(!internal||gap)faces.push({...f,internal});
 }
 return {faces,count,edge,joins:count-1,hidden:2*(count-1),exposed:6*count-2*(count-1),surface:(4*count+2)*edge*edge,volume:count*edge**3,centre:[(count*edge+(count-1)*gap)/2,edge/2,edge/2]};
}
function foldNet(amount=0){
 const t=Math.max(0,Math.min(1,Number(amount)||0))*Math.PI/2;
 const rx=(p,a)=>[p[0],Math.cos(a)*p[1]-Math.sin(a)*p[2],Math.sin(a)*p[1]+Math.cos(a)*p[2]];
 const ry=(p,a)=>[Math.cos(a)*p[0]+Math.sin(a)*p[2],p[1],-Math.sin(a)*p[0]+Math.cos(a)*p[2]];
 const hinge=(p,pivot,a,rot)=>add(rot(sub(p,pivot),a),pivot),square=(x,y)=>[[x-.5,y-.5,0],[x+.5,y-.5,0],[x+.5,y+.5,0],[x-.5,y+.5,0]];
 const configs=[['A',0,0,p=>p],['B',1,0,p=>hinge(p,[.5,0,0],-t,ry)],['C',-1,0,p=>hinge(p,[-.5,0,0],t,ry)],['D',0,1,p=>hinge(p,[0,.5,0],t,rx)],['E',0,-1,p=>hinge(p,[0,-.5,0],-t,rx)],['F',0,2,p=>hinge(hinge(p,[0,1.5,0],t,rx),[0,.5,0],t,rx)]];
 return configs.map(([label,x,y,fn])=>({label,points:square(x,y).map(fn),doubleSided:true}));
}
function make(id,form,seed,r,rev=2){
 let q;const out=(text,answer,steps,params={},extra={})=>q={text,answer,steps,params,...extra};
 const a=r(2,8),b=r(2,7),c=r(2,6);
 if(id==='geo-one-face'||id==='geo-face-pairs'){
  const paired=id==='geo-face-pairs',axis=(seed+form)%3,names=paired?['top and bottom','front and back','two end faces']:['top','front','right end'],dims=[[a,b],[a,c],[b,c]][axis],n=paired?2:1,w=dims[0],h=dims[1];
  if(form===2||form===3){
   const total=n*w*h;
   out(`The ${names[axis]} of a cuboid ${paired?'together cover':'covers'} ${total} cm². ${paired?'Each of these matching rectangular faces has':'This rectangular face has'} one edge ${w} cm long. Find the other edge of ${paired?'one face':'that face'}.`,h,[`The target is an edge of one rectangular face, not the volume.`,paired?`One face has area ${total} ÷ 2 = ${w*h} cm².`:`The face area is ${total} cm².`,`Other edge = ${w*h} ÷ ${w} = ${h} cm. Check ${w} × ${h}${paired?' × 2':''} = ${total}.`],{w,h,n,axis},{suffix:'cm',figure:{kind:'geo-face-area',w,h:'?',n,label:names[axis]}});
  }else out(`A cuboid is ${a} cm long, ${b} cm wide and ${c} cm high. Find the area of ONLY its ${names[axis]}${paired?'':' face'}.`,n*w*h,[`Identify the ${names[axis]}: ${paired?'two matching rectangles':'one rectangle'}, ${w} cm by ${h} cm.`,`One face: ${w} × ${h} = ${w*h} cm².`,paired?`Both faces: 2 × ${w*h} = ${n*w*h} cm².`:'Do not include the third dimension or any other face.'],{w,h,n,axis},{suffix:'cm²',figure:{kind:'geo-face-area',w,h,n,label:names[axis]}});
 }else if(id==='geo-measure'){
  const contexts=[['A ribbon','its length','cm'],['A rectangular board','the area of its top surface','cm²'],['A solid brick','the volume it occupies','cm³'],['A closed box','the area of paper covering its faces','cm²'],['A tank','the space its water occupies','cm³'],['An edge of a cube','the length of that edge','cm'],['A square cloth','its area','cm²'],['A solid model','the space filled by the model','cm³']];
  if(form===2||form===3){const filling=(a%2)===0;out(`A cube has edge ${a} cm. A pupil calculates ${a} × ${a}${filling?' × '+a:''}. Which unit belongs to the quantity actually calculated?`,filling?'cm³':'cm²',[filling?'Three lengths are multiplied: this measures the space inside.':'Two lengths are multiplied: this measures one square face.',filling?'The volume uses cm³.':'The area of one face uses cm².','This does not automatically answer a question about a different quantity.'],{quantity:filling?'volume':'one face area',unit:filling?'cm³':'cm²'},{choices:['cm','cm²','cm³']});return q;}
  const item=contexts[(a+b+form)%contexts.length];out(`${item[0]} is being measured. We need ${item[1]}. Choose the correct centimetre-based unit.`,item[2],[`Identify what is requested: ${item[1]}.`,'A line uses cm; a covering uses cm²; filling space uses cm³.',`The unit is ${item[2]}.`],{quantity:item[1],unit:item[2]},{choices:['cm','cm²','cm³']});
 }else if(id==='geo-layers'){
  if(form===0)out(`A cuboid is made from 1 cm unit cubes. Each layer has ${a} cubes across and ${b} cubes deep. There are ${c} complete layers. Find the volume.`,a*b*c,[`One layer contains ${a} × ${b} = ${a*b} unit cubes.`,`${c} layers contain ${a*b} × ${c} = ${a*b*c} cubes.`,`Each occupies 1 cm³, so the volume is ${a*b*c} cm³.`],{a,b,c},{suffix:'cm³',figure:{kind:'geo-block',a,b,c}});
  if(form===1)out(`A solid cube has volume ${a**3} cm³. All its edges have equal length. Find one edge length and check it by multiplying three equal lengths.`,a,[`Look for e × e × e = ${a**3}, not 3 × e = ${a**3}.`,`${a} × ${a} = ${a*a} square centimetres in the base.`,`${a*a} × ${a} = ${a**3} cubic centimetres, so the edge is ${a} cm.`],{a},{suffix:'cm',figure:{kind:'cubes'}});
  if(form===2)out(`A cuboid has a base ${a} cm by ${b} cm and volume ${a*b*c} cm³. How high is it?`,c,[`Each 1 cm-high layer occupies ${a} × ${b} = ${a*b} cm³.`,`Number of such layers = ${a*b*c} ÷ ${a*b} = ${c}.`,`Height = ${c} cm. Check ${a} × ${b} × ${c} = ${a*b*c}.`],{a,b,c},{suffix:'cm',figure:{kind:'geo-block',a,b,c:'?'}});
  if(form===3)out(`A cuboid of volume ${a*b*c} cm³ is ${b} cm high and ${c} cm wide. Find its length.`,a,[`The known cross-section has area ${b*c} cm².`,`Length = ${a*b*c} ÷ ${b*c} = ${a} cm.`],{a,b,c},{suffix:'cm'});
 }else if(id==='geo-surface'){
  if(form===0)out(`A cube has edge ${a} cm. A square label covers exactly ONE face. What is the label’s area?`,a*a,[`One face is a ${a} cm by ${a} cm square.`,`Area = ${a} × ${a} = ${a*a} cm².`,`Do not use ${a} × ${a} × ${a}: that would measure volume.`],{a},{suffix:'cm²',figure:{kind:'cubes',edge:a}});
  if(form===1)out(`A closed cuboid measures ${a} cm long, ${b} cm wide and ${c} cm high. What is the total area of all SIX faces?`,2*(a*b+a*c+b*c),[`Two faces each have area ${a*b} cm², two ${a*c} cm², and two ${b*c} cm².`,`Total = 2 × (${a*b} + ${a*c} + ${b*c}) = ${2*(a*b+a*c+b*c)} cm².`],{a,b,c},{suffix:'cm²',figure:{kind:'geo-block',a,b,c}});
  if(form===2||form===3){const count=form===2?2:r(3,5);out(`${count} identical cubes, each of edge ${a} cm, are joined in a straight row along complete faces. What is the total EXPOSED surface area?`,(4*count+2)*a*a,[`One square face has area ${a*a} cm².`,`${count} separate cubes have ${6*count} faces; ${count-1} joins hide ${2*(count-1)} faces.`,`${4*count+2} exposed faces × ${a*a} = ${(4*count+2)*a*a} cm².`,`The inside volume is a different quantity and uses cm³.`],{a,count},{suffix:'cm²',figure:{kind:'geo-row',count,edge:a}});}
 }else if(id==='geo-angles'){
  const interior=10*r(3,14),rotation=30*r(-5,5);
  if(form===0){const exterior=(a%2)===0;out(`Look at the marked arc x. BC is extended from C towards D. Is x the opening INSIDE the triangle, or OUTSIDE between CA and CD?`,exterior?'outside':'inside',[`Locate vertex C and trace the marked arc.`,exterior?'The rays are CA and CD: outside.':'The rays are CA and CB: inside.'],{exterior,rotation},{choices:['inside','outside'],figure:{kind:'geo-angle',interior,rotation,exterior,hideAngle:true}});}
  if(form===1)out(`B, C and D lie on a straight line, with D beyond C. Angle ACB is ${interior}°. Find angle ACD, marked x.`,180-interior,[`Angle ACD uses rays CA and CD, not CB.`,`The adjacent angles form a straight angle: ${interior} + x = 180.`,`x = ${180-interior}°.`],{interior,rotation},{suffix:'°',figure:{kind:'geo-angle',interior,rotation,exterior:true}});
  if(form===2||form===3){const p=10*r(2,6),q=10*r(2,5);out(`Three adjacent openings together form a straight angle. Two are ${p}° and ${q}°. Find the third opening x.`,180-p-q,[`Identify the whole straight opening: 180°.`,`Known parts = ${p} + ${q} = ${p+q}°.`,`x = 180 − ${p+q} = ${180-p-q}°.`],{p,q,rotation},{suffix:'°',figure:{kind:'geo-straight',p,q,rotation}});}
 }
 return q;
}
function ready(E,d,id,now){const e=E.evidence(d,id,now);return e.taught&&e.apply>=2&&e.transfer>=1;}
function prerequisite(E,d,id,now=Date.now()){
 const required=id==='volume'?['geo-measure','geo-layers','geo-one-face','geo-face-pairs','geo-surface']:id==='geo-layers'||id==='geo-one-face'?['geo-measure']:id==='geo-face-pairs'?['geo-measure','geo-one-face']:id==='geo-surface'?['geo-measure','geo-layers','geo-one-face','geo-face-pairs']:[];
 // Existing independent evidence is preserved; do not force proficient learners to restart.
 if(['volume','geo-surface'].includes(id)&&E.evidence(d,id,now).apply>=2&&E.evidence(d,id,now).transfer>=1)return null;
 return required.find(x=>!ready(E,d,x,now))||null;
}
function focus(s,E,now=Date.now()){
 const d=s.entrance||E.fresh(),answered=d.attempts.filter(a=>a.mode==='practice'&&a.responses?.length),volume=answered.filter(a=>a.unit==='volume').slice(-4);
 const old=(s.learning?.attempts||[]).filter(a=>a.generator==='cubeEdge').slice(-2);
 const weakVolume=volume.some(a=>!a.firstCorrect||a.revealed)||(!volume.length&&old.length===2&&old.every(a=>!a.firstCorrect));
 const surface=answered.filter(a=>a.unit==='geo-surface').slice(-3),weakSurface=surface.some(a=>!a.firstCorrect||a.revealed)&&!ready(E,d,'geo-surface',now);
 let next=weakSurface?prerequisite(E,d,'geo-surface',now)||'geo-surface':weakVolume?prerequisite(E,d,'volume',now):null;
 if(!next){const angles=answered.filter(a=>a.unit==='angles').slice(-3);if(angles.filter(a=>!a.firstCorrect).length>=2&&!ready(E,d,'geo-angles',now))next='geo-angles';}
 if(!next)return null;
 // Keep one brief strength task after three geometry questions, not an all-remediation session.
 const last=answered.slice(-3),strong=E.D.units.filter(u=>u.strand==='algebra').map(u=>E.evidence(d,u.id,now)).filter(e=>e.taught&&e.apply>=2&&!e.needsTeaching).sort((a,b)=>a.last-b.last)[0];
 if(last.length===3&&last.every(a=>E.unit(a.unit)?.strand==='geometry')&&strong)return {kind:'practice',unit:strong.id,strength:true,reason:'A fresh question in a strength, then back to the visual geometry bridge.'};
 const e=E.evidence(d,next,now);return {kind:!e.taught||e.needsTeaching?'learn':e.overdue?'recall':'practice',unit:next,geometryBridge:true,reason:'Build the geometric relationship before combining it with exposed faces.'};
}
root.MochiGeometryBridge={units,make,solid,row,foldNet,rotate,cubeFaces,bounded,prerequisite,focus,ready};
if(typeof module!=='undefined')module.exports=root.MochiGeometryBridge;
})(typeof globalThis!=='undefined'?globalThis:this);
