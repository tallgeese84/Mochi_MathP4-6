/* Original generated science illustrations with exact, interactive model overlays. */
(function(root){
'use strict';
const svg=(body,label)=>`<svg viewBox="0 0 600 350" role="img" aria-label="${label}" xmlns="http://www.w3.org/2000/svg"><defs>${[['scArrow','#7742b5'],['scArrowTeal','#277e8a'],['scArrowMuted','#b2a0c4']].map(([id,color])=>`<marker id="${id}" markerUnits="userSpaceOnUse" viewBox="0 0 14 14" markerWidth="14" markerHeight="14" refX="12" refY="7" orient="auto"><path d="M2 2L12 7L2 12" fill="none" stroke="${color}" stroke-width="2.5"/></marker>`).join('')}</defs><g font-family="system-ui,sans-serif" font-size="25" fill="#352452" stroke-linecap="round" stroke-linejoin="round">${body}</g></svg>`;
const label=(x,y,t)=>`<text x="${x}" y="${y}" text-anchor="middle">${t}</text>`;
const line=(x1,y1,x2,y2,color='#7952b0',width=5)=>`<path d="M${x1} ${y1}L${x2} ${y2}" fill="none" stroke="${color}" stroke-width="${width}"/>`;
const select=(key,title,options,value)=>`<label>${title}<select data-sc-key="${key}">${options.map(([v,t])=>`<option value="${v}" ${String(value)===String(v)?'selected':''}>${t}</option>`).join('')}</select></label>`;
const range=(key,title,min,max,value,unit='')=>`<label>${title} <output id="scOut-${key}">${value}${unit}</output><input data-sc-key="${key}" data-unit="${unit}" type="range" min="${min}" max="${max}" step="1" value="${value}" aria-label="${title}"></label>`;
const toggle=(key,title,value)=>`<label class="sc-toggle"><input data-sc-key="${key}" type="checkbox" ${value?'checked':''}>${title}</label>`;
const details={
 circuits:{question:'How can two lamps share a battery but work independently?',limit:'Model: ideal cells and wires; identical bulbs with fixed resistance. Glow represents relative power, not a calibrated brightness measurement.',challenge:'Compare series and parallel circuits. Can one bulb stay lit when the other breaks? Change one feature at a time.'},
 shadows:{question:'What controls the size of a shadow?',limit:'Model: a tiny point source, an opaque object and a flat screen, all aligned. Distances are schematic; an extended real source also produces partial shadows.',challenge:'Keep the light and screen fixed. Compare two object positions, then explain the result using the rays.'},
 heat:{question:'How could you test whether a wrap slows cooling?',limit:'Model: equal water volumes and matching cups start at 80°C in a constant 20°C room. Illustrative cooling curves, not measurements of a real material.',challenge:'Choose a time to compare the cups. Which variables have been controlled? What would you repeat in a real test?'},
 plants:{question:'How do the parts of a plant work together?',limit:'Original botanical illustration. The switches compare conditions conceptually; they do not simulate growth or predict how long a plant survives.',challenge:'Explore a root, stem, leaf and flower. Trace water to a leaf. Predict what darkness would change and what would continue.'},
 ecosystems:{question:'What can a food web tell us—and what can it not?',limit:'Original habitat illustration and a simplified possible feeding network. Arrows show energy transfer. Population effects are conditional, not numerical forecasts.',challenge:'Trace two energy pathways. Suppose fewer snails remain: name one possible effect and a reason it might not happen.'},
 forces:{question:'Can something keep moving when forces balance?',limit:'Instantaneous model: a 2 kg cart is already moving right; the displayed friction acts left. It does not simulate starting, stopping or reversal.',challenge:'Compare a push greater than, equal to and smaller than friction. Distinguish direction of motion from direction of acceleration.'},
 matter:{question:'How can the same water take different forms?',limit:'Particle diagram is schematic: size, spacing and movement are not to scale. The visible dots represent water particles, not air bubbles.',challenge:'Compare spacing and arrangement. Follow melting, freezing, evaporation or condensation and explain what changes and what stays water.'},
 body:{question:'How does a meal help a cell far from the stomach?',limit:'Original illustrative organ studies, not scale anatomy. The selected pathway explains how systems work together; it leaves out some organs and circulation details.',challenge:'Trace food to absorbed nutrients, and air to oxygen in blood. Where do the two routes connect?'}
};
function controls(skill,s){switch(skill){
 case 'circuits':return select('cells','Cells',[[1,'One'],[2,'Two']],s.cells)+select('bulbs','Bulbs',[[1,'One'],[2,'Two']],s.bulbs)+toggle('parallel','Separate parallel branches',s.parallel)+toggle('closed','Switch closed',s.closed)+toggle('broken','Bulb A broken',s.broken);
 case 'shadows':return range('object','Object distance from light',25,75,s.object,' units')+range('height','Object height',8,24,s.height,' units');
 case 'heat':return range('minutes','Time after filling',0,20,s.minutes,' min');
 case 'plants':return select('part','Explore a structure',[['root','Roots'],['stem','Stem'],['leaf','Leaves'],['flower','Flowers']],s.part)+toggle('light','Light available',s.light)+toggle('water','Water available',s.water);
 case 'ecosystems':return select('organism','Trace a food source',[['algae','Algae'],['snail','Snail'],['larvae','Insect larvae'],['fish','Fish']],s.organism)+toggle('remove','Imagine fewer snails',s.remove);
 case 'forces':return range('push','Rightward push',0,8,s.push,' N')+range('friction','Leftward friction',0,5,s.friction,' N');
 case 'matter':return select('state','Start with',[['solid','Ice: solid'],['liquid','Water: liquid'],['gas','Water vapour: gas']],s.state)+select('process','Try a change',[['melting','Melting'],['freezing','Freezing'],['evaporation','Evaporation'],['condensation','Condensation']],s.process);
 case 'body':return select('system','Trace a pathway',[['digestive','Food and nutrients'],['respiratory','Air and oxygen'],['circulatory','Transport in blood']],s.system);
 default:return '';
}}
function figure(skill,s,shown,assessment=false){
 shown=Boolean(shown)&&!assessment;
 if(skill==='circuits'){
  const m=MochiScience.circuit(s),parallel=s.parallel&&Number(s.bulbs)===2;
  const bulb=(x,y,name,broken)=>`<circle cx="${x}" cy="${y}" r="29" fill="${shown&&m.lit&&!broken?`hsl(43 100% ${96-Math.min(1,m.power/2)*34}%)`:'#f9f6ff'}" stroke="#63418f" stroke-width="4"/>${broken?line(x-13,y-13,x+1,y+1)+line(x+7,y+7,x+15,y+15):line(x-17,y-17,x+17,y+17)+line(x-17,y+17,x+17,y-17)}${label(x,y+61,name)}`;
  let wires=line(80,95,200,95)+line(260,95,520,95)+line(520,95,520,285)+line(520,285,80,285)+line(80,285,80,Number(s.cells)===2?220:202)+line(80,170,80,95);
  wires+=line(56,170,104,170)+line(65,188,95,188)+label(150,207,`${s.cells} cell${Number(s.cells)>1?'s':''}`);
  if(Number(s.cells)===2)wires+=line(80,188,80,202)+line(56,202,104,202)+line(65,220,95,220);
  else wires+=line(80,188,80,202);
  wires+=`<circle cx="200" cy="95" r="5"/><circle cx="260" cy="95" r="5"/>`+line(200,95,255,s.closed?95:60)+label(226,40,s.closed?'Closed':'Open');
  if(parallel){wires+=line(315,95,315,285)+line(450,95,450,285)+bulb(315,182,'A',s.broken)+bulb(450,182,'B',false);}
  else {wires+=bulb(Number(s.bulbs)===2?350:400,95,'A',s.broken);if(Number(s.bulbs)===2)wires+=bulb(485,95,'B',false);}
  // Remove the outer right shunt when separate bulb branches complete the circuit.
  if(parallel)wires=wires.replace(line(520,95,520,285),'');
  return svg(wires,'Circuit schematic showing battery cells, switch and bulb connections');
 }
 if(skill==='shadows'){
  const m=MochiScience.shadow(s),x=60+m.object*5,h=m.height*3,sh=m.shadow*3;
  return svg(`<circle cx="60" cy="175" r="12" fill="#d7a124"/>${line(510,35,510,315,'#a18bb7',7)}<path d="M60 175L510 ${175-sh/2}L510 ${175+sh/2}Z" fill="#dac8ff" opacity=".45"/>${line(60,175,510,175-sh/2,'#d5a024',3)}${line(60,175,510,175+sh/2,'#d5a024',3)}${line(x,175-h/2,x,175+h/2,'#654096',9)}${line(511,175-sh/2,511,175+sh/2,'#30203f',12)}${label(70,340,'Light')}${label(x,310,'Object')}${label(505,340,'Screen')}`,'Straight rays from a point light source past an opaque object onto a screen');
 }
 if(skill==='heat'){
  const curve=k=>Array.from({length:21},(_,i)=>`${i?'L':'M'}${70+i*22} ${292-(20+60*Math.exp(-k*i)-20)*3.1}`).join(' ');
  const m=MochiScience.cooling(s),x=70+m.minutes*22;
  return `<figure class="sc-art-plate sc-heat-plate"><img src="science-heat.webp" width="1200" height="800" alt="Original painted study of two matching cups with equal water levels, one bare and one with a lavender insulating wrap"><figcaption><span><i class="sc-key sc-key-bare"></i>Bare cup${shown?`<strong>${m.bare.toFixed(1)}°C</strong>`:''}</span><span><i class="sc-key"></i>Wrapped cup${shown?`<strong>${m.wrapped.toFixed(1)}°C</strong>`:''}</span></figcaption></figure>`+(shown?`<details class="sc-chart-detail" open><summary>Compare the cooling curves</summary>`+svg(`${line(70,60,70,292,'#aa9cb9',2)}${line(70,292,550,292,'#aa9cb9',2)}${[20,40,60,80].map(t=>label(34,300-(t-20)*3.1,t)+line(70,292-(t-20)*3.1,550,292-(t-20)*3.1,'#e8e0f1',1)).join('')}<path d="${curve(.085)}" fill="none" stroke="#277e8a" stroke-width="5"/><path d="${curve(.025)}" fill="none" stroke="#874acf" stroke-width="5"/>${shown?line(x,75,x,292,'#544261',2):''}${label(160,34,'Temperature / °C')}${label(70,337,'0')}${label(510,337,'20 min')}`,'Illustrative temperature against time curves: purple wrapped cup; teal bare cup')+'</details>':assessment?'':`<p class="sc-figure-caption">Predict which cup will cool faster. Test to compare temperatures.</p>`);
 }
 if(skill==='plants')return `<div class="sc-botanical"><img src="science-plant.webp" width="680" height="1020" alt="Original botanical illustration of a flowering bean plant, with leaves, stem and roots in cutaway soil">${[['root',50,78,'Roots'],['stem',50,51,'Stem'],['leaf',78,26,'Leaf'],['flower',60,19,'Flower']].map(([key,x,y,title])=>`<button type="button" class="sc-hotspot ${s.part===key?'selected':''}" style="left:${x}%;top:${y}%" data-sc-part="${key}" aria-label="Explore ${title}">${title}</button>`).join('')}</div>`;
 if(skill==='ecosystems'){
  // Keep every arrow tip 16 units outside the rounded label boxes.
  const arrow=(d,active)=>`<path d="${d}" fill="none" stroke="${active?'#8447c9':'#b2a0c4'}" stroke-width="${active?4:2.5}" marker-end="url(#${active?'scArrow':'scArrowMuted'})"/>`;
  const node=(x,y,w,t,active)=>`<rect x="${x}" y="${y}" width="${w}" height="54" rx="18" fill="${active?'#eadbf9':'#fbf8fe'}" stroke="#d0bde2" stroke-width="2"/><g font-size="30">${label(x+w/2,y+37,t)}</g>`;
  return `<img class="sc-pond" src="science-pond.webp" width="1080" height="720" alt="Original pond habitat illustration with green plants, a snail, fish, a frog and a dragonfly"><p class="sc-figure-caption">Follow the energy: food to consumer</p>`+svg(`${arrow('M156 165L214 73',s.organism==='algae')}${arrow('M156 185L204 277',s.organism==='algae')}${arrow('M386 73L440 163',s.organism==='snail')}${arrow('M396 277L440 187',s.organism==='larvae')}${node(20,148,120,'Algae',s.organism==='algae')}${node(230,30,140,'Snail',s.organism==='snail')}${node(220,266,160,'Larvae',s.organism==='larvae')}${node(456,148,124,'Fish',s.organism==='fish')}`,'Possible energy pathways: algae to snail and insect larvae; snail and larvae to fish');
 }
 if(skill==='forces'){
  const m=MochiScience.force(s);
  // Separate force lanes clear the illustration. Both use the same 22 units per newton.
  return `<p class="sc-figure-caption">A 2 kg cart, already moving right</p>`+svg(`<svg x="70" y="86" width="460" height="180" viewBox="0 172 1200 438"><image href="science-cart.webp" width="1200" height="800"/></svg><path d="M260 60h${m.push*22}" fill="none" stroke="#7742b5" stroke-width="5" opacity="${m.push?1:0}" marker-end="url(#scArrow)"/><path d="M340 296h-${m.friction*22}" fill="none" stroke="#277e8a" stroke-width="5" opacity="${m.friction?1:0}" marker-end="url(#scArrowTeal)"/><g font-size="30">${label(365,30,`Push: ${m.push} N right`)}${label(245,338,`Friction: ${m.friction} N left`)}</g>`,'Painted dynamics cart with opposing force arrows in separate lanes: push right above, friction left below')+`<p class="sc-model-reading">${shown?`Net force: ${Math.abs(m.net)} N ${m.net>0?'right':m.net<0?'left':'— balanced'}`:'Compare the opposing forces'}</p>`;
 }
 if(skill==='matter'){
  const pairs={melting:['solid','liquid'],freezing:['liquid','solid'],evaporation:['liquid','gas'],condensation:['gas','liquid']};const pair=pairs[s.process],state=shown&&pair&&pair[0]===s.state?pair[1]:s.state;const gas=state==='gas',solid=state==='solid';let dots='';
  for(let i=0;i<24;i++){const x=gas?98+(i*89)%410:175+(i%6)*49+(solid?0:(i%3-1)*8),y=gas?78+(i*47)%210:130+Math.floor(i/6)*43+(solid?0:(i%4-1)*7);dots+=`<circle cx="${x}" cy="${y}" r="12" fill="#9665d6" stroke="#633e94" stroke-width="2"/>`;}
  return svg(`<rect x="60" y="45" width="480" height="260" rx="12" fill="#f4edff" stroke="#cbb4e9" stroke-width="3"/>${dots}${label(300,337,solid?'Solid: closely packed, ordered':gas?'Gas: widely separated':'Liquid: close, less ordered')}`,'Schematic arrangement of water particles in a selected state');
 }
 const routes={
  digestive:{title:'Food to absorbed nutrients',steps:[['Mouth & oesophagus','Food is taken in and passes towards the stomach.'],['Stomach & small intestine','Food is digested. Digested nutrients are absorbed through the small intestine into blood.'],['Blood to body cells','Blood transports the absorbed nutrients. Food itself does not travel around in the blood.']]},
  respiratory:{title:'Air to oxygen for cells',steps:[['Windpipe to lungs','Air reaches the lungs through branching airways.'],['Lungs to blood','Oxygen passes into blood. Carbon dioxide passes from blood into the lungs.'],['Blood to body cells','Blood carries oxygen to cells; carbon dioxide is carried away.']]},
  circulatory:{title:'The transport connection',steps:[['Heart','The heart pumps blood around the body.'],['Blood','Blood transports oxygen from the lungs and absorbed nutrients from the small intestine.'],['Body cells','Cells receive oxygen and nutrients. Blood carries wastes away.']]}
 };
 const route=routes[s.system]||routes.digestive;
 return `<figure class="sc-art-plate sc-body-plate"><img src="science-body.webp" width="1200" height="800" alt="Original painted organ studies: digestive organs on the left, lungs and heart on the right"><figcaption><span>Digestive organs</span><span>Lungs & heart</span></figcaption></figure>${shown?`<section class="sc-route" aria-label="${route.title}"><h3>${route.title}</h3><ol>${route.steps.map(([title,explanation])=>`<li><strong>${title}</strong><span>${explanation}</span></li>`).join('')}</ol></section>`:assessment?'':`<p class="sc-figure-caption">Predict how these systems connect. Test your idea to trace the pathway.</p>`}`;
}
function observation(skill,s){const m=MochiScience.model(skill,s);switch(skill){
 case 'circuits':return !m.lit?'No bulb has a complete conducting path.':`${m.active} bulb${m.active>1?'s are':' is'} lit. Relative power per working bulb: ${m.power.toFixed(2)} (one cell with one bulb = 1). ${s.parallel?'Each working branch connects across the battery.':'The components share one path.'}`;
 case 'shadows':return `Shadow height: ${m.shadow.toFixed(1)} units for an object ${m.height} units high. Source to screen: 90 units; source to object: ${m.object} units.`;
 case 'heat':return `At ${m.minutes} min: bare cup ${m.bare.toFixed(1)}°C; wrapped cup ${m.wrapped.toFixed(1)}°C. Room: 20°C. Both started at 80°C.`;
 case 'plants':return ({root:'Roots anchor the plant and absorb water and mineral salts.',stem:'The stem supports the plant and transports substances, including water to leaves.',leaf:'Green leaves make sugars by photosynthesis when light, water and carbon dioxide are available.',flower:'Flowers are involved in sexual reproduction; after successful fertilisation, seeds can develop.'}[s.part])+' '+(!s.light?'Without light, photosynthesis stops; respiration can continue using stored food.':!s.water?'A continuing lack of water limits photosynthesis and other functions.':'With suitable conditions, the parts support growth together.');
 case 'ecosystems':return s.remove?'Fewer snails could mean less grazing on algae and less food for some fish. Alternative food and other conditions can change the outcome.':({algae:'Algae transfers energy to consumers such as grazing snails and some insect larvae.',snail:'Some fish eat snails. The arrow goes from snail to fish.',larvae:'Some insect larvae eat algae; fish may eat the larvae. Species have different diets.',fish:'Fish obtains energy from its food; this simplified web shows snails and larvae.'}[s.organism]);
 case 'forces':return m.net===0?'Forces balance. The moving cart has no acceleration and continues at constant velocity in this model.':m.net>0?`Net force is ${m.net} N right; the right-moving cart speeds up.`:`Net force is ${-m.net} N left; the right-moving cart slows down at this instant.`;
 case 'matter':{const changes={melting:['solid','liquid'],freezing:['liquid','solid'],evaporation:['liquid','gas'],condensation:['gas','liquid']},pair=changes[s.process];return s.state!==pair[0]?`${s.process} starts with ${pair[0]}, not ${s.state}. Select that starting state to trace the change.`:`${s.process[0].toUpperCase()+s.process.slice(1)} changes ${pair[0]} water to ${pair[1]}. It remains water. ${s.process==='evaporation'?'Evaporation can occur below 100°C.':''}`;}
 case 'body':return ({digestive:'Food passes through the oesophagus to the stomach and then small intestine. Digested nutrients are absorbed into blood.',respiratory:'Air reaches the lungs through the windpipe. Oxygen passes into blood; carbon dioxide passes out of blood to be breathed out.',circulatory:'Blood transports oxygen and absorbed nutrients to cells and carries wastes away. The heart pumps the blood.'}[s.system]);
}}
root.MochiScienceScenes={details,controls,figure,observation};
})(typeof globalThis!=='undefined'?globalThis:this);
