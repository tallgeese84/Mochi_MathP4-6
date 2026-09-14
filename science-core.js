/* Checked teaching models. These are simplified demonstrations, not physical measurements. */
(function(root){
'use strict';
const tutorLanguage='Use the terminology and level of the MOE 2023 Primary Science syllabus, with British English. Explain causes clearly, linking an observation to the relevant scientific idea. Use ice, liquid water and water vapour. Ice gains heat and melts; liquid water loses heat and freezes; liquid water gains heat and evaporates; water vapour loses heat and condenses into water droplets. Distinguish evaporation at the exposed surface from boiling throughout liquid water. For ordinary classroom conditions, pure water freezes at 0°C and boils at 100°C. Water vapour is invisible; visible mist consists of tiny liquid droplets. Never say water becomes air. Distinguish heat from temperature: heat flows from hotter to colder objects or surroundings, and a poor conductor slows heat transfer. Do not claim temperature must rise while pure ice is melting or water is boiling. Use closed circuit and electric current; do not describe current as being used up in a bulb. Green leaves use light energy, water and carbon dioxide to make food (sugar) in photosynthesis, producing oxygen. Respiration releases energy from food; it is not the same as breathing. Roots absorb water and mineral salts, not ready-made food. Prefer gullet, windpipe, lungs, digested food, blood and blood vessels. If oesophagus is used by a learner, accept it as another name for the gullet. Food-web arrows show energy transfer from food to consumer. Use frictional force and changes in speed, direction or shape; label net force, velocity, acceleration, particle models and carbon tracing as extensions, not required primary terms. For fair tests, name the variable changed, the quantity measured and the variables kept the same. Distinguish what was observed from what is inferred. Never assume every scientific conclusion can be proved by one result. Do not require memorised answer wording or reject an accurate synonym. You are not MOE or SEAB: never claim approval or an official marking scheme. If the problem, model and reference disagree, say so and ask for review rather than teaching the inconsistency.';
const skills={
 circuits:{label:'Electric circuits',concept:'A closed circuit allows electric current to flow. A bulb lights up when it is correctly connected in a closed circuit with a battery.',resource:'https://phet.colorado.edu/en/simulations/circuit-construction-kit-dc'},
 shadows:{label:'Light & shadows',concept:'Light travels in straight lines. A shadow is formed when an object blocks light from a light source.',resource:'https://phet.colorado.edu/en/simulations/bending-light'},
 heat:{label:'Heat & fair tests',concept:'Heat flows from a hotter object to cooler surroundings. A poor conductor of heat slows down heat transfer.',resource:'https://openstax.org/books/physics/pages/11-2-heat-specific-heat-and-heat-transfer'},
 plants:{label:'Plant systems',concept:'Roots absorb water and mineral salts. Green leaves use light energy, water and carbon dioxide to make food (sugar) during photosynthesis. Oxygen is also produced.',resource:'https://openstax.org/books/biology-2e/pages/8-1-overview-of-photosynthesis'},
 ecosystems:{label:'Living things & food webs',concept:'An arrow in a food chain points from the organism that is eaten to the organism that eats it. It shows the direction of energy transfer.',resource:'https://openstax.org/books/biology-2e/pages/46-2-energy-flow-through-ecosystems'},
 forces:{label:'Forces & motion (extension)',extension:true,concept:'A force is a push or a pull. Forces can change the speed, direction of motion or shape of an object. This extension activity also compares opposing forces.',resource:'https://phet.colorado.edu/en/simulations/forces-and-motion-basics'},
 matter:{label:'Matter & water',concept:'Ice gains heat and melts into liquid water. Liquid water can gain heat and change into water vapour by evaporation without boiling.',resource:'https://www.usgs.gov/special-topics/water-science-school/science/water-cycle'},
 body:{label:'Human body systems',concept:'Digestion breaks food into simpler substances. Digested food is absorbed into the blood in the small intestine. Blood transports digested food and oxygen to all parts of the body.',resource:'https://openstax.org/books/biology-2e/pages/34-1-digestive-systems'}
};
const changes={
 melting:{from:'solid',to:'liquid',start:'ice',end:'liquid water',text:'Ice gains heat and melts into liquid water. This is a change of state. No new substance is formed.'},
 freezing:{from:'liquid',to:'solid',start:'liquid water',end:'ice',text:'Liquid water loses heat and freezes into ice. This is a change of state. No new substance is formed.'},
 evaporation:{from:'liquid',to:'gas',start:'liquid water',end:'water vapour',text:'Liquid water gains heat and evaporates from its exposed surface, forming water vapour. Evaporation can occur below the boiling point. Water vapour is a gas; it is not air.'},
 condensation:{from:'gas',to:'liquid',start:'water vapour',end:'liquid water',text:'Water vapour loses heat and condenses into liquid water. The water droplets are liquid, not water vapour.'}
};
const defaults={circuits:{cells:1,bulbs:2,parallel:false,closed:false,broken:false},shadows:{object:45,height:18},heat:{minutes:0,insulated:true,bareStart:80,wrappedStart:80},plants:{part:'leaf',light:true,water:true},ecosystems:{organism:'algae',remove:false},forces:{push:4,friction:2},matter:{state:'solid',process:'melting'},body:{system:'digestive',part:'small intestine'}};
const copy=x=>JSON.parse(JSON.stringify(x));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,Number(v)||0));
function circuit(s){const cells=clamp(s.cells,1,2),bulbs=clamp(s.bulbs,1,2),lit=!!s.closed&&(!s.broken||s.parallel&&bulbs===2);return {lit,active:lit?(s.broken?1:bulbs):0,power:lit?(s.parallel?cells*cells:(cells/bulbs)**2):0};}
function shadow(s){const object=clamp(s.object,25,75),height=clamp(s.height,8,24);return {object,height,shadow:height*90/object,magnification:90/object};}
function cooling(s){const t=clamp(s.minutes,0,20),bareStart=clamp(s.bareStart??80,20,100),wrappedStart=clamp(s.wrappedStart??80,20,100),temp=(k,start)=>20+(start-20)*Math.exp(-k*t);return {minutes:t,bare:temp(.085,bareStart),wrapped:temp(.025,wrappedStart),ambient:20,bareStart,wrappedStart};}
function force(s){const push=clamp(s.push,0,8),friction=clamp(s.friction,0,5);return {push,friction,net:push-friction,acceleration:(push-friction)/2};}
function model(skill,s){if(skill==='circuits')return circuit(s);if(skill==='shadows')return shadow(s);if(skill==='heat')return cooling(s);if(skill==='forces')return force(s);return copy(s);}
// Each item is authored; assessment items are reserved from the practice selector.
const items=[];
function add(skill,id,prompt,choices,answer,why,options={}){items.push({skill,id,prompt,choices,answer,why,level:1,...options});}
add('circuits','c-path','The switch is open. What must change to light both bulbs?', ['Close the switch','Add a second cell only','Turn one bulb upside down'],0,'Closing the switch forms a closed circuit. Electric current can then flow through the bulbs, causing them to light up.');
add('circuits','c-series','Two identical bulbs are in series. One bulb breaks. What happens to the other?', ['It stays equally bright','It goes out','It becomes brighter'],1,'The broken bulb creates a gap in the only path. The circuit is open, so no current flows through either bulb.',{level:2,state:{closed:true,broken:false}});
add('circuits','c-parallel','Two identical bulbs are connected in parallel to a battery. One bulb breaks. If the battery continues to supply the other branch in the same way, what happens to the other bulb?',['Goes out','Keeps its brightness','Has to become brighter'],1,'The other branch is still a closed circuit. Current can still flow through its bulb. In this model, the brightness of that bulb stays the same.',{level:3,state:{closed:true,parallel:true}});
add('circuits','c-assess','Two bulbs connected in parallel light a model house. Removing bulb A leaves bulb B lit. Which statement explains why?', ['Bulb B is still connected in a closed circuit','Electricity is stored inside bulb B','Current jumps across the empty socket'],0,'The branch containing bulb B remains connected to both terminals of the battery, allowing electric current to flow.',{assessment:true,level:2,state:{closed:true,parallel:true,broken:true}});
add('shadows','l-block','What makes a shadow on the screen?', ['The object sends out darkness','The object blocks light travelling to the screen','The screen absorbs all surrounding air'],1,'An opaque object blocks some of the light travelling from the source to the screen.');
add('shadows','l-position','Keep the light and screen fixed. Move the same object nearer the light. What happens to its shadow?', ['It becomes larger','It becomes smaller','It must stay the same size'],0,'Light travels in straight lines. Nearer the light source, the same object blocks light from reaching a larger area of the screen, so its shadow is larger.',{level:2});
add('shadows','l-fair','You want to test the effect of object position on shadow size. What should stay fixed?', ['Only the date','Light position, screen position and object size','Both object size and object position must change'],1,'Change only the distance between the object and the light source. Keep the light source, screen and object size the same for a fair test.',{level:3});
add('shadows','l-assess','The source-to-screen distance is fixed. An opaque card is moved towards the screen. Its shadow becomes…',['Larger','Smaller','A source of light'],1,'The rays spread less between the object and screen, so the shadow gets smaller.',{assessment:true,level:2,state:{object:65}});
add('heat','h-direction','The water starts at 80°C in a 20°C room. Which way does heat transfer overall?', ['From the room into the hotter water','From the hotter water to the room','There is no transfer unless water boils'],1,'The hotter water loses heat to the cooler surroundings. Its temperature decreases as it cools.');
add('heat','h-insulation','Identical cups start with equal volumes of equally hot water. Why might a wrapped cup cool more slowly?', ['The wrap continually makes heat','The wrap reduces heat transfer','The wrap makes the water heavier'],1,'The wrap is a poor conductor of heat. It slows down heat loss from the water to the cooler surroundings. It does not produce heat.',{level:2});
add('heat','h-evidence','A wrapped cup started at 80°C; a bare cup started at 60°C. The wrapped cup is warmer later. Does this alone prove its wrap worked?', ['Yes, a warmer final reading proves it','No, the starting temperatures were different','Yes, the starting temperature never matters'],1,'The starting temperatures were different, so this is not a fair test of the wrap alone. Start both cups at the same temperature and keep the other relevant variables the same.',{level:3,state:{bareStart:60,wrappedStart:80}});
add('heat','h-assess','To compare two insulating materials fairly, which arrangement is best?', ['Different cups, volumes and starting temperatures','Matching cups and water volumes, same start temperature, same wrap thickness and covered area, same surroundings','One cup indoors and the other outdoors'],1,'Change only the material of the wrap. Keep the cups, volume of water, starting temperature, thickness and covered area of the wraps, and surroundings the same. Measure at the same times and repeat the test.',{assessment:true,level:3});
add('plants','p-root','Which plant structure takes up water and mineral salts from the soil?', ['Roots','Flowers','Fruit'],0,'Roots absorb water and mineral salts. These are transported to other parts of the plant.');
add('plants','p-food','Which statement correctly describes how a green plant makes food?', ['In leaves using light, water and carbon dioxide','By taking ready-made food from the soil','Only in flowers at night'],0,'Green leaves use light energy, water and carbon dioxide to make food (sugar) during photosynthesis. Oxygen is also produced. Roots absorb water and mineral salts from the soil, not food.');
add('plants','p-dark','A watered green plant is put in darkness. Which statement is best?', ['It immediately stops all life processes','It cannot photosynthesise, but respiration continues','Its roots replace sunlight'],1,'Without light, the plant cannot carry out photosynthesis. Respiration can continue, releasing energy from stored food for life processes.',{level:3,state:{light:false}});
add('plants','p-assess','A healthy plant gains mass as it grows. Which statement best explains where much of the carbon in its food came from?', ['Carbon dioxide in the air','Light itself becomes carbon','The flower petals absorb carbon from the pot'],0,'The plant uses carbon dioxide during photosynthesis to make sugars. This is a reasoning extension beyond naming plant parts.',{assessment:true,level:3,extension:true});
add('ecosystems','e-arrow','In a food web, an arrow from algae to a snail means…',['The algae eat the snail','The snail obtains energy by eating algae','The algae protect the snail from all predators'],1,'The arrow points from food to consumer, in the direction of energy transfer.');
add('ecosystems','e-producer','Which organism in this pond can make food using sunlight?', ['Green algae','A frog','A snail'],0,'Green algae photosynthesise. Animals obtain food by consuming other organisms.');
add('ecosystems','e-change','Suppose fewer snails graze on algae. What is a reasonable initial prediction if other conditions stay similar?', ['Algae may increase because less is eaten','All pond animals must disappear instantly','The exact future numbers are known'],0,'Reduced grazing may allow more algae to remain. Real food webs have other influences, so this is a conditional prediction.',{level:3});
add('ecosystems','e-assess','A fish eats both snails and insect larvae. Snails decrease. Why can you not calculate the fish population from this fact alone?', ['Fish do not need food','Other food, predation, reproduction and conditions also matter','All consumers change by the same percentage'],1,'The fish can also feed on insect larvae. Other factors, such as the number of predators and the conditions in the habitat, can affect its population. This one change is not enough to work out the future number of fish.',{assessment:true,level:3});
add('forces','f-net','A cart moving to the right has a 4 N force right and a 2 N frictional force to the left. What is the overall (net) force on the cart?',['2 N right','6 N right','2 N left'],0,'Opposite forces subtract: 4 − 2 = 2 N right. This changes its motion.');
add('forces','f-balanced','A cart is already moving right. The rightward push equals the leftward frictional force. What happens in this model?', ['It must stop immediately','It continues at the same speed in the same direction','It must speed up'],1,'The opposing forces are equal, so they do not change the motion of the cart. In this model, it continues at the same speed in the same direction. This is an extension beyond primary force effects.',{level:3,state:{push:2,friction:2}});
add('forces','f-compare','The same moving cart receives the same push on two surfaces. One has greater opposing frictional force. What changes?', ['The overall force to the right is reduced','Its mass must disappear','Friction must point right'],0,'The larger opposing force reduces the overall force to the right. If the push is still greater, the cart speeds up less quickly. If the forces balance, its speed stays the same. If the opposing force is greater, the cart slows down while it is still moving right.',{level:2});
add('forces','f-assess','A cart moves right with 3 N rightward push and 5 N frictional force to the left. At that moment it…',['Slows down','Instantly starts moving left','Speeds up to the right'],0,'The opposing force is 2 N greater than the push. It acts against the motion, so the cart slows down. It does not immediately change direction.',{assessment:true,level:3,state:{push:3,friction:5}});
add('matter','m-melt','An ice cube becomes liquid water. What is this change called?', ['Condensation','Melting','Evaporation'],1,'Ice gains heat and melts into liquid water. This is a change of state. No new substance is formed.');
add('matter','m-evaporate','A puddle dries on a warm day without boiling. How does this happen?', ['Water can evaporate below its boiling point','All the water must first freeze','Only boiling water can become water vapour'],0,'Liquid water gains heat from the surroundings and evaporates from its exposed surface, forming water vapour. Evaporation can occur below the boiling point of water.',{level:2,state:{state:'liquid',process:'evaporation'}});
add('matter','m-condense','Water droplets form on the outside of a sealed glass bottle containing cold water. Where does the water on the outside come from?', ['Liquid leaking through the glass','Water vapour in the surrounding air','The glass making a new substance'],1,'Water vapour in the surrounding air loses heat to the cold surface and condenses into water droplets.',{level:2,state:{state:'gas',process:'condensation'}});
add('matter','m-assess','Two identical cloths contain the same amount of water. One is placed in still air and the other in moving air. All other conditions are kept the same. Which prediction is reasonable?', ['Moving air can make drying faster','Neither can dry below 100°C','Water changes into air permanently'],0,'Moving air carries water vapour away from the cloth. This increases the rate of evaporation, so the cloth is likely to dry faster. Repeat the test to check the result.',{assessment:true,level:3,state:{state:'liquid'}});
add('body','b-absorb','In which part of the digestive system is digested food absorbed into the blood?', ['Small intestine','Windpipe','Heart'],0,'Digested food is absorbed through the walls of the small intestine into the blood. Blood then transports it to other parts of the body.');
add('body','b-oxygen','Which sequence shows how oxygen reaches a body cell?', ['Lungs → blood → body cell','Stomach → bones → lungs','Heart → food → stomach'],0,'Oxygen passes from air in the lungs into blood and is transported to body cells.',{level:2,state:{system:'respiratory',part:'lungs'}});
add('body','b-systems','Why do body cells need both digestive and circulatory systems?', ['Digestion breaks food into simpler substances; blood transports digested food','Blood chews food in the stomach','The heart absorbs all food directly'],0,'The digestive system breaks food into simpler substances that can be absorbed. The circulatory system transports digested food in the blood to all parts of the body.',{level:3});
add('body','b-assess','A child says food travels through the lungs before reaching the stomach. Which statement correctly describes the two pathways?', ['Swallowed food travels through the gullet; air travels through the windpipe','All food and air follow the same tube throughout','Food is pumped into the stomach by the heart'],0,'Swallowed food passes from the mouth through the gullet to the stomach. Air passes through the windpipe to the lungs. The windpipe does not carry swallowed food to the stomach.',{assessment:true,level:2});
add('ecosystems','e-energy-route','In a pond, a snail eats algae and a fish eats the snail. Which sequence shows the direction of energy transfer?',['Fish → snail → algae','Algae → snail → fish','Snail → algae → fish'],1,'Energy is transferred from algae to the snail when it eats algae, and from the snail to the fish when it eats the snail.',{level:2});
add('ecosystems','e-explain-arrow','A pupil draws snail → algae to mean “the snail eats algae”. How should this be shown in a food chain?',['Keep snail → algae','Draw arrows in both directions','Draw algae → snail'],2,'In a food chain the arrow shows energy transfer from food to consumer. The snail eats algae, so the arrow points from algae to snail.',{level:2});
add('circuits','c-gap','A wire is disconnected in a circuit containing a battery and one bulb. Why does the bulb go out?',['Electric current escapes through the gap','The conducting path is incomplete, so current cannot flow around the circuit','The gap uses up the light'],1,'The disconnected wire makes the circuit open. There is no complete conducting path through the bulb and battery.',{level:1,state:{bulbs:1,closed:false}});
add('circuits','c-reconnect','A battery, bulb and switch are correctly connected in series. The bulb is unlit with the switch open. What does closing the switch change?',['It forms a complete conducting path through the bulb','It adds another battery','It stores light in the wire'],0,'Closing the switch completes the circuit. Electric current can flow through the bulb, causing it to light up.',{level:2,state:{bulbs:1,closed:false}});
// These short reasoning checks are marked separately from the main choice.
// Free text and ink remain ungraded evidence for a tutor or adult to discuss.
const probes={
 circuits:[
  ['c-loop','Which explanation accounts for an unlit bulb when the switch is open?',['The gap breaks the complete conducting path','The battery sends current out through the gap','The bulb uses up all the current'],0,'An open switch breaks the complete conducting path. Current cannot flow around this circuit.'],
  ['c-terminals','Which connection allows a bulb to light?',['Both bulb contacts connected only to the same battery terminal','A complete conducting path from one battery terminal through the bulb to the other terminal','A wire touching only the glass'],1,'The circuit needs a complete conducting path through the bulb and both battery terminals.']
 ],
 ecosystems:[
  ['e-direction','A snail eats algae. Which direction shows energy transfer?',['Snail → algae','Algae → snail','Energy does not pass from food to consumer'],1,'Energy is transferred from the algae to the snail when the snail eats the algae.'],
  ['e-food','A fish eats a snail. Complete the explanation: energy is transferred…',['from the fish to the snail it eats','from the snail to the fish that eats it','from the water to both animals without food'],1,'The arrow points from the organism eaten to its consumer.']
 ],
 shadows:[
  ['l-rays','Why is there a dark region behind an opaque object?',['The object gives off darkness','The object bends all light towards itself','The object blocks some light travelling from the source'],2,'Light travels in straight lines. The opaque object blocks some light.'],
  ['l-screen','With the source and screen fixed, moving the same object towards the screen makes the shadow smaller. What should stay unchanged to test this fairly?',['The object size and the positions of source and screen','Nothing else needs to stay unchanged','The object must also become smaller'],0,'Change only the object position, keeping the other relevant conditions the same.']
 ],
 heat:[
  ['h-flow','A cup of water is hotter than the room. Complete the explanation: the water…',['gains heat from the cooler room','loses heat to the cooler surroundings','turns its temperature into air'],1,'Heat flows from the hotter water to the cooler surroundings.'],
  ['h-wrap','Why does a poor conductor wrapped around a hot cup slow cooling?',['It makes new heat','It stops all heat transfer forever','It reduces the rate of heat transfer to the cooler surroundings'],2,'A poor conductor slows heat transfer; it does not produce heat.']
 ],
 plants:[
  ['p-water','What do roots absorb from the soil?',['Ready-made food only','Water and mineral salts','Sunlight and sugar'],1,'Roots absorb water and mineral salts. Green leaves make food during photosynthesis.'],
  ['p-light','What is light used for by a green leaf?',['It supplies energy for making food','It becomes mineral salts','It replaces the need for water'],0,'Green leaves use light energy, water and carbon dioxide to make food.']
 ],
 matter:[
  ['m-heat','Which explanation describes melting?',['Ice loses heat and becomes water vapour','Ice gains heat and becomes liquid water','Liquid water becomes air'],1,'Ice gains heat and melts into liquid water. No new substance is formed.'],
  ['m-vapour','Which statement distinguishes water vapour from water droplets?',['Both are air','Water vapour is liquid; droplets are gas','Water vapour is a gas; droplets are liquid water'],2,'Water vapour is water in the gaseous state. It is not air.']
 ],
 body:[
  ['b-blood','What happens to digested food at the small intestine?',['It is absorbed into the blood','It passes into the windpipe','It is made by the heart'],0,'Digested food is absorbed through the walls of the small intestine into the blood.'],
  ['b-transport','How does oxygen reach body cells from the lungs?',['It travels through bones only','It is transported in the blood','It travels through the gullet with food'],1,'Oxygen passes into the blood in the lungs and is transported to body cells.']
 ],
 forces:[
  ['f-opposite','Two forces act in opposite directions. How do we find the overall force?',['Always add their sizes','Subtract the smaller size from the larger and use the direction of the larger force','Ignore friction'],1,'Opposing forces subtract. Net force is extension work.'],
  ['f-motion','For a cart already moving right, equal opposing forces mean…',['no change in its speed or direction in this model','it must stop instantly','its mass changes'],0,'Balanced forces do not change motion in this model. This is extension work.']
 ]
};
function probeFor(q){const list=items.filter(x=>x.skill===q.skill&&!x.assessment);const raw=probes[q.skill][Math.max(0,list.findIndex(x=>x.id===q.id))%2];return {id:raw[0],prompt:raw[1],choices:raw[2],answer:raw[3],why:raw[4]};}
function cleanConcept(q,value){if(!value)return null;const p=probeFor(q);if(value.id!==p.id||!Number.isInteger(value.choice)||value.choice<0||value.choice>=p.choices.length)return null;return {id:p.id,choice:value.choice,correct:value.choice===p.answer,firstCorrect:value.firstCorrect===true};}
function record(data,a){
 const previous=data.attempts.findIndex(x=>a.id&&x.id===a.id);
 const others=data.attempts.filter((_,i)=>i!==previous);
 a.repeated=others.some(x=>x.item===a.item);
 a.independent=!!(a.correct&&a.firstCorrect&&!a.helped&&!a.guess&&!a.repeated);
 const q=items.find(q=>q.id===a.item);a.concept=cleanConcept(q,a.concept);
 a.conceptIndependent=!!(a.concept?.correct&&a.concept.firstCorrect&&!a.helped&&!a.guess&&!others.some(x=>x.concept?.id===a.concept.id));
 if(previous<0)data.attempts.push(a);else data.attempts[previous]=a;
 data.attempts=data.attempts.slice(-1000);return a;
}
function fresh(){return {version:1,attempts:[],notes:[],drafts:{},seenAssess:[],session:null};}
const cleanInk=raw=>(Array.isArray(raw)?raw:[]).slice(-80).map(s=>(Array.isArray(s)?s:[]).slice(0,500).filter(p=>Array.isArray(p)&&p.length===2&&p.every(Number.isFinite)).map(p=>p.map(v=>clamp(v,0,1))));
function validate(raw){const out=fresh();if(!raw||raw.version!==1)return out;
 out.attempts=[];
 for(const a of (Array.isArray(raw.attempts)?raw.attempts:[]).slice(-1000)){
  const q=items.find(q=>q.id===a.item);if(!q||!Number.isFinite(a.at))continue;
  record(out,{id:String(a.id||'').slice(0,120),item:q.id,skill:q.skill,at:a.at,choice:Number.isInteger(a.choice)?a.choice:-1,correct:a.correct===true&&a.choice===q.answer,firstCorrect:a.firstCorrect===true,helped:a.helped===true,guess:a.guess===true,assessment:a.assessment===true,concept:cleanConcept(q,a.concept),explanation:String(a.explanation||'').slice(0,2500),prediction:String(a.prediction||'').slice(0,1000),strokes:cleanInk(a.strokes),responses:(Array.isArray(a.responses)?a.responses:[]).slice(-20).map(r=>({choice:Number.isInteger(r.choice)?r.choice:-1,conceptChoice:Number.isInteger(r.conceptChoice)?r.conceptChoice:-1,explanation:String(r.explanation||'').slice(0,2500),at:Number(r.at)||a.at}))});
 }
 out.notes=(Array.isArray(raw.notes)?raw.notes:[]).slice(-100).filter(n=>Object.hasOwn(skills,n.skill)).map(n=>({skill:n.skill,at:Number(n.at)||0,text:String(n.text||'').slice(0,2500),prediction:String(n.prediction||'').slice(0,1000),strokes:cleanInk(n.strokes),trials:(Array.isArray(n.trials)?n.trials:[]).slice(-12).map(t=>({state:copy(t.state||{}),result:copy(t.result||{})}))}));
 out.seenAssess=(Array.isArray(raw.seenAssess)?raw.seenAssess:[]).filter(id=>items.some(q=>q.id===id&&q.assessment));
 // Drafts are limited to authored fields; imported text is never rendered as HTML.
 for(const skill of Object.keys(skills)){const d=raw.drafts?.[skill];if(!d)continue;out.drafts[skill]={prediction:String(d.prediction||'').slice(0,1000),explanation:String(d.explanation||'').slice(0,2500),strokes:(Array.isArray(d.strokes)?d.strokes:[]).slice(-80).map(s=>(Array.isArray(s)?s:[]).slice(0,500).filter(p=>Array.isArray(p)&&p.length===2&&p.every(Number.isFinite)).map(p=>p.map(v=>clamp(v,0,1))))};}
 return out;
}
function evidence(data,skill){
 const a=data.attempts.filter(x=>x.skill===skill),recent=a.slice(-6),ind=recent.filter(x=>x.independent),concept=recent.filter(x=>x.conceptIndependent);
 return {count:a.length,independent:ind.length,conceptChecks:concept.length,pending:recent.filter(x=>!x.concept).length,misses:a.filter(x=>x.at>(a.filter(r=>r.concept?.correct&&r.concept.firstCorrect&&!r.helped&&!r.guess).at(-1)?.at||0)&&(!x.firstCorrect||x.concept&&!x.concept.firstCorrect)).length,days:new Set(ind.map(x=>new Date(x.at).toISOString().slice(0,10))).size,last:a.at(-1)?.at||0,label:!a.length?'Not checked':concept.length<2?'Building':'Practising'};
}
function choose(data,mode='practice',focus=null){
 let pool=items.filter(q=>!!q.assessment===(mode==='assessment'));if(focus)pool=pool.filter(q=>q.skill===focus);
 if(mode==='assessment')return pool.find(q=>!data.seenAssess.includes(q.id))||null;
 const last=data.attempts.at(-1),tail=data.attempts.slice(-2);
 const needsCheck=a=>a&&(!a.firstCorrect||a.concept&&!a.concept.correct||a.helped||a.guess);
 const consecutive=tail.length===2&&tail.every(a=>a.skill===last.skill);
 let target=focus||(!consecutive&&needsCheck(last)?last.skill:null);
 // Older mistakes and missing concept evidence get a fresh check on the next visit.
 if(!target){
  const ids=[...new Set(pool.map(q=>q.skill))];
  ids.sort((a,b)=>{
   const score=k=>{const e=evidence(data,k);return e.misses*8+e.pending*2+(e.count?0:4)-e.conceptChecks*2;};
   return score(b)-score(a);
  });
  target=ids.find(id=>(!consecutive||id!==last.skill)&&pool.some(q=>q.skill===id&&!data.attempts.some(a=>a.item===q.id)))||ids[0];
 }
 let candidates=pool.filter(q=>q.skill===target),fresh=candidates.filter(q=>!data.attempts.some(a=>a.item===q.id));
 if(!fresh.length&&!focus){fresh=pool.filter(q=>!data.attempts.some(a=>a.item===q.id));}
 if(fresh.length)candidates=fresh;
 else candidates=candidates.slice().sort((a,b)=>{
  const time=q=>data.attempts.filter(x=>x.item===q.id).at(-1)?.at||0;return time(a)-time(b);
 });
 const q=candidates[0];if(!q)return null;
 const repeated=data.attempts.some(a=>a.item===q.id);
 return {...q,reason:repeated?'Familiar practice — this repeat is not new independent evidence.':needsCheck(last)&&q.skill===last.skill?'A follow-up to check the idea from your last answer.':'A fresh question with a separate reasoning check.'};
}
root.MochiScience={tutorLanguage,skills,changes,defaults,items,copy,circuit,shadow,cooling,force,model,fresh,validate,evidence,choose,probeFor,record};
if(typeof module!=='undefined')module.exports=root.MochiScience;
})(typeof globalThis!=='undefined'?globalThis:this);
