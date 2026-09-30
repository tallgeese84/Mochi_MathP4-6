/* Visual support is in the lesson/question, not another homepage dashboard.
   Mathematical 3D geometry projected to SVG works offline even without WebGL. */
(function(root){
'use strict';
const G=root.MochiGeometryBridge,V=root.MochiGeometryVisuals;
const available=new Set(['geo-measure','geo-layers','geo-surface','geo-angles','volume','spatial','area','angles']);
const defaults=id=>id==='geo-measure'?'length':id==='geo-angles'||id==='angles'?'angles':id==='area'?'area':id==='spatial'?'net':id==='geo-surface'?'surface':'layers';
function panel(id,practice=false){if(!available.has(id))return '';return `<details class="geometry-lab" id="geometryLab" ${practice?'':'open'}><summary>${practice?'Visual help · explore a different example':'See it in 2D and 3D'}</summary><div id="geometryLabBody"></div><p class="geometry-foot">${practice?'Opening visual help records support on this question. The model is a separate teaching example, not an answer calculator.':'Explore, predict what will change, then check using a fresh question with the model closed.'}</p></details>`;}
function mount(host,id,{practice=false,onHelp=()=>{}}={}){
 const box=host.querySelector('#geometryLab'),body=box?.querySelector('#geometryLabBody');if(!box||!body)return null;
 let state={mode:defaults(id),n:3,layers:3,count:2,edge:2,gap:0,fold:0,yaw:-.6,pitch:.4,rotation:0,shift:0},supported=false,drag=null,dead=false;
 const markHelp=()=>{if(practice&&!supported){onHelp();supported=true;}};
 const modes=id==='geo-measure'?['length','areaTiles','layers']:id==='geo-angles'||id==='angles'?['angles']:id==='area'?['area']:id==='spatial'?['net']:['layers','surface','joins','net'];
 const titles={length:'Trace a length',areaTiles:'Cover a square',layers:'Fill with layers',surface:'Cover the outside',joins:'See hidden faces',net:'Fold a cube net',angles:'Inside or outside?',area:'Shared-height triangles'};
 const button=(mode)=>`<button type="button" data-geo-mode="${mode}" aria-pressed="${state.mode===mode}">${titles[mode]}</button>`;
 const slider=(key,label,min,max,value,step=1)=>`<label>${label}<input type="range" data-geo-slider="${key}" min="${min}" max="${max}" step="${step}" value="${value}"><output data-geo-value="${key}">${value}</output></label>`;
 function controls(){
  body.innerHTML=`<div class="geometry-tabs" role="group" aria-label="Visual learning mode">${modes.map(button).join('')}</div><p id="geometryPrompt" class="geometry-prompt"></p><div id="geometryCanvas" tabindex="0" role="group" aria-label="Geometry model. Drag to turn a solid, or use the view buttons and arrow keys."></div><div class="geometry-controls" id="geometryControls"></div><p id="geometryInsight" class="geometry-insight" role="status" aria-live="polite"></p>`;
  let html='';const m=state.mode;
  if(['length','areaTiles','layers','surface'].includes(m))html+=slider('n','Edge length / unit steps',2,5,state.n);
  if(m==='layers')html+=slider('layers','Layers shown',1,state.n,state.layers);
  if(m==='joins')html+=slider('count','Number of cubes',1,5,state.count)+slider('edge','Each cube edge (cm)',1,4,state.edge)+slider('gap','Separate to inspect joins',0,1,state.gap,.1);
  if(m==='net')html+=slider('fold','Fold net (%)',0,100,state.fold,1);
  if(m==='angles')html+=slider('rotation','Turn the whole drawing (degrees)',-180,180,state.rotation,15)+`<div class="geometry-target"><p>Which rays enclose the marked angle x?</p><button type="button" data-geo-identify="interior">CA and CB</button><button type="button" data-geo-identify="exterior">CA and CD</button><span id="geometryTargetFeedback" role="status"></span></div>`;
  if(m==='area')html+=slider('shift','Slide the apex; keep its height',-80,80,state.shift,5);
  if(!['length','areaTiles','angles','area'].includes(m))html+='<div class="geometry-views" role="group" aria-label="View direction"><button type="button" data-geo-view="orbit">3D</button><button type="button" data-geo-view="front">Front</button><button type="button" data-geo-view="top">Top</button><button type="button" data-geo-view="side">Side</button></div>';
  body.querySelector('#geometryControls').innerHTML=html;
  for(const b of body.querySelectorAll('[data-geo-mode]'))b.onclick=()=>{markHelp();state.mode=b.dataset.geoMode;state.yaw=-.6;state.pitch=.4;controls();};
  for(const s of body.querySelectorAll('[data-geo-slider]'))s.oninput=()=>{markHelp();state[s.dataset.geoSlider]=Number(s.value);if(s.dataset.geoSlider==='n'){state.layers=Math.min(state.layers,state.n);const l=body.querySelector('[data-geo-slider=layers]');if(l){l.max=state.n;l.value=state.layers;}}draw();};
  for(const b of body.querySelectorAll('[data-geo-view]'))b.onclick=()=>{markHelp();const p={orbit:[-.6,.4],front:[0,0],top:[0,Math.PI/2],side:[-Math.PI/2,0]}[b.dataset.geoView];[state.yaw,state.pitch]=p;draw();};
  for(const b of body.querySelectorAll('[data-geo-identify]'))b.onclick=()=>{markHelp();body.querySelector('#geometryTargetFeedback').textContent=b.dataset.geoIdentify==='exterior'?'Yes: start at C, then trace CA and CD. The outside angle is 180° − 60° = 120°.':'CA and CB enclose the inside angle. Trace the bold outside arc from CA towards CD instead.';};
  const canvas=body.querySelector('#geometryCanvas');canvas.style.touchAction=['length','areaTiles','angles','area'].includes(state.mode)?'pan-y':'none';
  canvas.onpointerdown=e=>{if(['length','areaTiles','angles','area'].includes(state.mode))return;markHelp();drag={x:e.clientX,y:e.clientY};canvas.setPointerCapture?.(e.pointerId);};
  canvas.onpointermove=e=>{if(!drag)return;state.yaw+=(e.clientX-drag.x)*.008;state.pitch=Math.max(-Math.PI/2,Math.min(Math.PI/2,state.pitch+(e.clientY-drag.y)*.008));drag={x:e.clientX,y:e.clientY};draw();};
  canvas.onpointerup=canvas.onpointercancel=()=>{drag=null;};
  canvas.onkeydown=e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();markHelp();if(e.key==='ArrowLeft')state.yaw-=.15;if(e.key==='ArrowRight')state.yaw+=.15;if(e.key==='ArrowUp')state.pitch=Math.min(Math.PI/2,state.pitch+.15);if(e.key==='ArrowDown')state.pitch=Math.max(-Math.PI/2,state.pitch-.15);draw();};
  draw();
 }
 function draw(){if(dead)return;const s=state,n=s.n;let svg='',insight='',prompt='Predict first. What changes, and what stays the same?';
  if(['length','areaTiles','angles','area'].includes(s.mode)){
   svg=V.flat(s.mode,n,s.mode==='angles'?s.rotation:s.shift);
   insight=s.mode==='length'?`${n} centimetre steps measure a length: ${n} cm.`:s.mode==='areaTiles'?`${n} rows × ${n} squares cover a face: ${n*n} cm². No cubes are being counted.`:s.mode==='angles'?'The whole drawing turns. The same rays and opening stay together. Identify the bold arc before calculating.':'Both triangles keep the same height. Their areas stay in the base ratio 4:6 = 2:3, even as A slides.';
  }else if(s.mode==='layers'){
   const m=G.solid({across:n,deep:n,high:n,layers:s.layers});svg=V.project(m.faces,m.centre,s.yaw,s.pitch,`${s.layers} layers of ${n} by ${n} unit cubes.`,n*.9);
   insight=`One layer: ${n} × ${n} = ${n*n} unit cubes. ${s.layers} layer${s.layers===1?'':'s'}: ${n*n} × ${s.layers} = ${m.volume} cm³.${s.layers===n?` A complete cube: ${n} × ${n} × ${n} = ${n**3}. Its edge is ${n} cm, not ${n**3} ÷ 3.`:' Add layers to build the complete cube.'}`;
   prompt='How many cubes are in one layer? How many layers fill the cube?';
  }else if(s.mode==='surface'){
   const fs=G.cubeFaces([0,0,0],n);svg=V.project(fs,[n/2,n/2,n/2],s.yaw,s.pitch,'A closed cube: rotate to inspect all six outside faces.');
   insight=`ONE face: ${n} × ${n} = ${n*n} cm². SIX faces: 6 × ${n*n} = ${6*n*n} cm² outside. The inside volume is ${n**3} cm³ — a different quantity.`;prompt='Imagine wrapping the cube. Which flat surfaces must the paper cover?';
  }else if(s.mode==='joins'){
   const m=G.row(s.count,s.edge,s.gap*s.edge);svg=V.project(m.faces,m.centre,s.yaw,s.pitch,'Cubes in a straight row. Tinted joining faces would be internal when the cubes touch.');
   insight=`When joined: ${m.joins} join${m.joins===1?'':'s'} hide ${m.hidden} faces. ${m.exposed} exposed faces × ${s.edge**2} cm² = ${m.surface} cm² outside. Volume remains ${m.volume} cm³.${s.gap?' The gap is only an inspection aid; the tinted faces are NOT counted in the joined solid.':''}`;prompt='One join touches TWO faces. Separate and rotate the cubes to find them.';
  }else{
   svg=V.project(G.foldNet(s.fold/100),[0,.5,.4],s.yaw,s.pitch,'Six labelled squares hinged into a cube. A is opposite F, B opposite C, D opposite E.',2.3);
   insight=s.fold===100?'The six squares now enclose a cube. Opposite pairs: A–F, B–C and D–E. Folding changes position, not face area.':'Make a prediction: which faces will be opposite? Slide from the flat net to the folded cube to check.';prompt='Follow each letter while the net folds. Then turn the whole model.';
  }
  body.querySelector('#geometryCanvas').innerHTML=svg;body.querySelector('#geometryInsight').textContent=insight;body.querySelector('#geometryPrompt').textContent=prompt;
  for(const o of body.querySelectorAll('[data-geo-value]'))o.textContent=String(state[o.dataset.geoValue]);
 }
 box.ontoggle=()=>{if(box.open){markHelp();if(!body.children.length)controls();}};
 if(box.open){markHelp();controls();}
 return {dispose(){dead=true;drag=null;box.ontoggle=null;body.replaceChildren();},snapshot:()=>({...state}),draw};
}
root.MochiGeometryLab={panel,mount,available};
})(window);
