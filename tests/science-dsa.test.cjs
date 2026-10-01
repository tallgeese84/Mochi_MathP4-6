// DSA science upgrade: revision-2 distractors, numeric entry, written key-idea marking,
// variable roles, new sx- units, bar charts and quick checks.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
globalThis.window=globalThis;
const E=require('../science-path-core.js'),B=E.B,D=E.D,F=require('../science-path-figures.js'),Q=require('../quick-checks.js'),H=require('../science-discovery-data.js');
const SX=D.units.filter(u=>u.id.startsWith('sx-')).map(u=>u.id),ORIGINAL=D.originalUnits;
const seedOf=i=>Math.imul(i+1,2654435761)>>>0;
const nums=s=>(String(s).match(/-?\d+(?:\.\d+)?/g)||[]).map(Number);
const close=(a,b,t=1e-6)=>Math.abs(a-b)<=t;
function find(pred,ids=SX,max=3000){for(let i=0;i<max;i++)for(const id of ids)for(let f=0;f<4;f++){const q=B.make(id,f,seedOf(i));if(pred(q))return q;}return null;}

test('six new sx- units are registered with lessons, checks, prerequisites, stories and four strands',()=>{
 assert.deepEqual(SX,['sx-cells','sx-machines','sx-pressure','sx-waves','sx-chem','sx-life']);
 assert.equal(ORIGINAL.length,24);
 for(const id of SX){const u=E.unit(id);assert.equal(u.ideas.length,3);assert.ok(u.ideas.join(' ').split(/\s+/).length>=150,id);assert.ok(u.check[1][u.check[2]]);assert.ok(u.prerequisites.length&&u.prerequisites.every(p=>ORIGINAL.includes(p)),id);assert.ok(H.get(id),id);}
 assert.deepEqual([...new Set(SX.map(id=>E.unit(id).strand))].sort(),['biology','physics','world']);
});

test('new units: every form over 200 seeds is valid, self-consistent and mixes question kinds',()=>{
 for(const id of SX){const unitKinds=new Set();for(let f=0;f<4;f++){const forms=new Set();for(let i=0;i<200;i++){
  const q=B.make(id,f,seedOf(i));forms.add(q.kind||'choice');unitKinds.add(q.kind||'choice');
  assert.ok(q.text.length>30&&q.steps.length>=2&&q.rubric.length===3,q.id);assert.equal(q.strand,E.unit(id).strand);
  assert.ok(B.mark(q,q.answer),'self-mark '+q.id);assert.equal(B.validAnswer(q,''),false);assert.equal(B.mark(q,'<script>alert(1)</script>'),false);assert.equal(B.mark(q,'c0:r0')&&q.kind?true:false,false);
  if(!q.kind){if(q.options)assert.equal(new Set(q.options).size,4,q.id);else assert.equal(new Set(q.statements).size,3,q.id);assert.equal(new Set(q.reasons).size,3,q.id);const [c,r]=q.answer.split(':');assert.equal(B.mark(q,c+':r'+((+r.slice(1)+1)%3)),false);}
  if(q.kind==='numeric'){assert.ok(Number.isFinite(q.value));assert.equal(B.mark(q,String(q.value*1.5+1)),false);assert.equal(B.parse(q.answer),q.value);}
  if(q.kind==='written'){assert.ok(q.writtenKey&&q.ideas.length>=2);assert.equal(B.mark(q,'I am not sure about this one.'),false);}
  if(q.kind==='roles'){assert.match(q.answer,/^v[0-2]+$/);assert.equal(q.variables.length,q.answer.length-1);}
  const fig=F.diagram(q.figure,q.id);assert.doesNotMatch(fig,/NaN|undefined|Infinity|<script/);
 }const structures=new Set();for(let i=0;i<200;i++){const q=B.make(id,f,seedOf(i));structures.add((q.kind||'choice')+':'+(q.statements?'s':'')+(q.figure?.type||'')+':'+q.text.slice(0,25));}assert.ok(structures.size>=2,`${id}:${f} has at least two structural variants`);}
 for(const k of ['choice','numeric'])assert.ok(unitKinds.has(k),id+' has '+k);}
 const all=new Set();for(const id of SX)for(let f=0;f<4;f++)for(let i=0;i<200;i++)all.add(B.make(id,f,seedOf(i)).kind||'choice');
 assert.deepEqual([...all].sort(),['choice','numeric','roles','written']);
});

test('numeric answers are recalculated independently from the visible givens',()=>{
 let checked=0;
 for(const id of [...SX,'fairtest'])for(let f=0;f<4;f++)for(let i=0;i<200;i++){
  const q=B.make(id,f,seedOf(i));if(q.kind!=='numeric')continue;const t=q.text,n=nums(t);let want=null;
  if(/total magnification/.test(t))want=n[0]*n[1];
  else if(/How wide is the image/.test(t))want=n[0]*n[1];
  else if(/actual width of the cell/.test(t))want=n[1]/n[0];
  else if(/How many cells are in the row/.test(t))want=n[0]/n[1];
  else if(/moment of the force/.test(t))want=n[0]*n[1]/100;
  else if(/What mass must hang/.test(t)){const [m1,d1,d2]=n;want=m1*d1/d2;}
  else if(/How far from the pivot/.test(t)){const [m1,d1,m2]=n;want=m1*d1/m2;}
  else if(/What single mass/.test(t)){const [m1,d1,m2,d2,d3]=n;want=(m1*d1+m2*d2)/d3;}
  else if(/single (movable|fixed) pulley/.test(t))want=/movable/.test(t)?n[0]/2:n[0];
  else if(/What pressure does it exert/.test(t))want=n[0]/n[1];
  else if(/greatest pressure it can exert/.test(t)){const [w,a,b,c]=n;want=w/Math.min(a*b,a*c,b*c);}
  else if(/Each of her shoes/.test(t)){const [w,shoe]=n;want=w/(/one foot/.test(t)?shoe:2*shoe);}
  else if(/water pressure at a depth/.test(t)){const rows=q.figure.rows,k=rows[1][1]-rows[0][1];want=k*n.at(-1);}
  else if(/tuning fork/.test(t))want=n[0]/n[1];
  else if(/echo/.test(t)&&/cliff/.test(t))want=n[1]*n[0]/2;
  else if(/thunder/.test(t))want=n[1]*n[0];
  else if(/mean period/.test(t)){const times=q.figure.rows.map(r=>+r[1]);want=times.reduce((a,b)=>a+b,0)/times.length/10;}
  else if(/complete swings in/.test(t))want=n[1]/n[0];
  else if(/sea bed/.test(t))want=n[1]*n[0]/2;
  else if(/neutralises 10 mL/.test(t))want=n[0]*n[2]/10;
  else if(/mass of gas escaped/.test(t))want=n[0]-n[1];
  else if(/from the egg being laid/.test(t))want=q.figure.rows.reduce((a,r)=>a+r[1],0);
  else if(/germinate/.test(t))want=100*n[1]/n[0];
  else if(/percentage of the forest/.test(t))want=100*n[1]/n[0];
  assert.notEqual(want,null,'unrecognised numeric template: '+t);
  assert.ok(close(want,q.value,Math.max(q.tolerance,0.0051)),`${q.id}: ${want} vs ${q.value}`);assert.ok(B.mark(q,String(Math.round(want*1000)/1000)),q.id);checked++;
 }
 assert.ok(checked>500,'checked '+checked);
});

test('numeric entry: units are optional, equivalent units convert and wrong units or values are not accepted',()=>{
 const echo=find(q=>/cliff/.test(q.text)&&q.value===85);assert.ok(echo);
 for(const ok of ['85','85 m','85m','85 metres','  85 m. ','0.085 km','85.0'])assert.ok(B.mark(echo,ok),ok);
 for(const bad of ['170','85 s','85 kg','42.5 m'])assert.equal(B.mark(echo,bad),false,bad);
 assert.equal(B.parts(echo,'85 s').claim,true,'right number, wrong unit is recorded as a unit slip');assert.equal(B.parts(echo,'85 s').reason,false);
 for(const blank of ['','abc','m'])assert.equal(B.validAnswer(echo,blank),false,blank);
 const p=find(q=>/What pressure does it exert/.test(q.text));assert.ok(B.mark(p,p.value+' N/cm²')&&B.mark(p,p.value+' N/cm2')&&B.mark(p,p.value+' N per cm2'));
 const mom=find(q=>/moment of the force/.test(q.text));assert.ok(B.mark(mom,`${mom.value} N m`)&&B.mark(mom,`${Math.round(mom.value*100)} N cm`));
 assert.equal(B.parse('1,200'),1200);assert.equal(B.parse('3/4'),0.75);assert.equal(B.parse('about 12.5 g'),12.5);assert.equal(B.parse('twelve'),null);
});

// Three good and three bad sample answers for every written template.
const SAMPLES={
 'fair-plan-plants':{good:[
  'I would grow several identical bean seedlings in each group and give each group a different amount of fertiliser, including one group with none. I would keep the type of seedling, pot size, soil, water and light the same. After two weeks I would measure the height of every seedling with a ruler and find the average. Using many seedlings makes it reliable.',
  'Use 3 groups of 5 identical seedlings. Give each group a different mass of fertiliser (0 g, 2 g, 4 g). Keep the water, light, soil and pot size the same. After two weeks measure every seedling’s height and find the average for each group.',
  'I wud change only the amont of fertilizer for each pot. Keep the water, sunlight and soil the same for all plants. I will measure how tall each plant grows with a ruler. I will repeat it with many plants.'],
  bad:['I would give the plants fertiliser and see which one grows best.','Put one plant in the sun and one in the dark and water them every day.','Change the amount of fertiliser and measure the height of the plant.']},
 'fair-plan-dissolve':{good:[
  'I would dissolve the same mass of sugar in the same volume of water at different temperatures, such as 20°C, 40°C and 60°C. I would keep the stirring and grain size the same. I would use a stopwatch to measure the time taken to dissolve. I would repeat each temperature three times and find the average.',
  'Change only the temperature of the water. Keep the amount of sugar, the volume of water and the stirring the same. Time how long the sugar takes to dissolve with a stopwatch. Do it again two more times and take the mean.',
  'Use water at diffrent temperatures but keep the sugar and water amount constant. Measure the time for the sugar to disappear. Repeat the test to check the results.'],
  bad:['Put sugar in hot water and watch it dissolve.','I would use different amounts of sugar in the same water and see which dissolves fastest. Repeat it.','Change the temperature and time how long it takes to dissolve.']},
 'cells-not-all-green':{good:[
  'No, her observations do not support the claim. The root cells have cell walls, so they are plant cells, but they have no chloroplasts. Roots grow underground where there is no light, so they do not photosynthesise.',
  'Her claim is wrong. These cells have no chloroplasts even though they are plant cells. They grow in the dark soil, so they do not need to make food.',
  'Not all plant cells have chloroplasts. The cells she saw did not have any chloroplasts. They get no sunlight so they cannot photosynthesise.'],
  bad:['Yes, plant cells are green because they need light.','The cells have cell walls, so they are plant cells.','No. Roots take in water from the soil.']},
 'ramp-tradeoff':{good:[
  'Ramp B needs a smaller force to push the trolley because it rises gently. In exchange, I have to push the trolley over a longer distance to reach the same height.',
  'On the gentle ramp you need less effort, but you must push it further.',
  'Less force is needed on ramp B. The trade off is that the distance is longer.'],
  bad:['Ramp B is easier because the trolley becomes lighter on a gentle ramp. You push it further.','Ramp B is longer.','It is easier because ramp B is not steep.']},
 'seesaw-moments':{good:[
  'Each child’s moment is their weight multiplied by their distance from the pivot. The heavier child has a larger weight, so a smaller distance gives the same moment as the lighter child further away. When the moments are equal, the see-saw balances.',
  'Moment = force × distance from the pivot. The heavier child sits closer so that a bigger weight times a shorter distance equals the moment of the lighter child. Then the two moments are the same and it balances.',
  'The turning effect depends on weight and distance. A heavier child must be nearer the pivot. Both sides then have equal moments so it is balanced.'],
  bad:['The heavier child is heavier so they go down.','The heavier child sits nearer the pivot because it is safer.','The turning effect depends on how far you sit from the pivot.']},
 'straw-air-pressure':{good:[
  'When I suck, I remove some air from the straw, so the air pressure inside the straw becomes lower. The air pressure on the surface of the drink outside the straw is now greater. This pushes the drink up the straw.',
  'Sucking lowers the air pressure in the straw. The atmospheric pressure on the drink is higher, so it pushes the liquid up.',
  'I suck the air out of the straw. The air outside presses down harder on the drink. This forces the drink up the straw.'],
  bad:['The straw sucks the drink up into my mouth.','I suck the drink up.','The air pressure inside the straw becomes higher so the drink comes up.']},
 'dam-depth':{good:[
  'Water pressure increases with depth, so the water presses hardest on the bottom of the dam. The bottom is built thicker so that it is strong enough to withstand this greater pressure.',
  'The deeper the water, the greater the pressure. The bottom of the dam must be thick to resist the large force.',
  'Pressure at the bottom is higher because there is more water above. A thick base stops the dam from breaking.'],
  bad:['Because the bottom of the dam is heavier.','The dam is thicker at the bottom to look nice.','There is more water at the bottom of the dam.']},
 'pendulum-mass':{good:[
  'The mass of the bob does not affect the period of the pendulum. When the mass changed from 20 g to 100 g, the time for 10 swings stayed about the same, at 14.2 s. It was fair because only the mass was changed and the length of the string was kept the same.',
  'Mass has no effect on the period. All three times were about 14.2 s. The length stayed at 50 cm so only the bob was changed.',
  'A heavier bob does not change how long a swing takes. The times were the same. It was a fair test because the string length was kept constant.'],
  bad:['A heavier bob swings faster.','The times were about 14.2 s.','The length was 50 cm each time, so it was fair.']},
 'carbonate-gas':{good:[
  'Yes, it is a chemical change. The fizzing shows a gas was given off, and the limewater turned milky, which shows the gas is carbon dioxide. Carbon dioxide is a new substance, so a chemical change took place.',
  'It is a chemical change because a new substance, carbon dioxide, was made. We know it is carbon dioxide because the limewater turned milky.',
  'Chemical change. The gas turned limewater chalky so it is CO2. A new gas was formed.'],
  bad:['It is not a chemical change, because carbon dioxide was just released from the shell. No new substance.','It is a chemical change because it fizzes.','The limewater turned milky so it is carbon dioxide.']},
 'rust-conditions':{good:[
  'Rusting needs both water and air (oxygen). Nail C had both water and air, and it rusted. Nail A had air but no water, and nail B had water but no air, and neither of them rusted.',
  'Iron needs both water and oxygen to rust. Only nail C, which had water and air, rusted. Nail A in dry air and nail B without air did not rust.',
  'Both water and air are needed. C rusted. A and B did not rust because each was missing water or air.'],
  bad:['Only nail C rusted.','Water makes iron rust.','Rusting needs water and air.']},
 'dispersal-hooks':{good:[
  'It is dispersed by animals. Its hooks catch on the fur of passing animals, which carry it far from the parent plant. The seedlings then grow away from the parent, so there is less competition for light, water and space.',
  'Animals disperse it. The hooks stick to their fur and it is carried away. The new plants will not compete with the parent plant for sunlight and water.',
  'By animals such as dogs. The tiny hooks attach to the fur. Then the seeds grow far from the parent so they have more space and nutrients.'],
  bad:['It is dispersed by the wind because it is small.','Animals eat the fruit.','The hooks catch on fur so animals carry it away.']},
 'dispersal-wind':{good:[
  'It is dispersed by the wind. Because it is light and its fine hairs catch the air, it is carried far from the parent plant. The seedlings grow away from the parent, so there is less competition for light, water and space.',
  'By wind. The hairs act like a parachute so it floats far away. This means the new plant does not have to compete with the parent for sunlight.',
  'The wind blows it away because it is very light. The seeds then grow away from the parent plant and have enough space and water.'],
  bad:['It is dispersed by animals because it is light.','It is dispersed by the wind.','The wind blows it far away from the parent plant.']},
 'deforestation':{good:[
  'Animals that live in the forest lose their habitat, so they lose their food and shelter. Also, there are fewer trees to take in carbon dioxide, so more carbon dioxide stays in the air.',
  'Many animals will lose their homes and food. Without tree roots, the soil can be washed away more easily, causing soil erosion.',
  'The animals lose their shelter. There will be less trees to absorb carbon dioxide which leads to global warming.'],
  bad:['The animals will lose their homes.','More people can use the road.','Trees give us shade, and the road will be hot.']}
};
test('written answers: every template accepts three good paraphrases and rejects three off-topic or partial answers',()=>{
 const keys=new Set();for(const id of [...SX,'fairtest'])for(let f=0;f<4;f++)for(let i=0;i<300;i++){const q=B.make(id,f,seedOf(i));if(q.kind==='written')keys.add(q.writtenKey);}
 assert.deepEqual([...keys].sort(),Object.keys(SAMPLES).sort());
 for(const key of keys){const q=find(x=>x.writtenKey===key,[...SX,'fairtest']),s=SAMPLES[key];
  for(const a of s.good)assert.ok(B.mark(q,a),`${key} should accept: ${a}\n${B.describe(q,a)}`);
  for(const a of s.bad)assert.equal(B.mark(q,a),false,`${key} should reject: ${a}`);
  assert.ok(B.mark(q,q.answer),key+' model answer');
  const half=B.ideaReport(q,s.bad[2]);assert.equal(half.found.length+half.missing.length,q.ideas.length);assert.ok(half.missing.length>=1,key);
  assert.match(B.describe(q,s.good[0]),/Key ideas found: .*Missing: none/);
 }
});

test('variable-role items: one changed, one measured, the rest kept; partial answers are diagnosed',()=>{
 let n=0;for(const id of ['fairtest','sx-waves','sx-chem'])for(let f=0;f<4;f++)for(let i=0;i<200;i++){const q=B.make(id,f,seedOf(i));if(q.kind!=='roles')continue;n++;
  const roles=q.answer.slice(1).split('').map(Number);assert.equal(roles.filter(x=>x===0).length,1);assert.equal(roles.filter(x=>x===1).length,1);assert.ok(roles.filter(x=>x===2).length>=2);
  const changed=q.variables[roles.indexOf(0)],measured=q.variables[roles.indexOf(1)];
  assert.match(changed+' '+measured,/layers|height|turns|temperature of the water|length of the string|amount of salt/i);assert.match(measured,/temperature after|distance|clips|time|mass of rust/i);
  // Swapping changed and measured is wrong; a mistake only in a kept variable keeps the claim part.
  const swap='v'+roles.map(x=>x===0?1:x===1?0:2).join('');assert.equal(B.mark(q,swap),false);assert.equal(B.parts(q,swap).claim,false);
  const k=roles.indexOf(2),slip='v'+roles.map((x,j)=>j===k?1:x).join('');assert.equal(B.mark(q,slip),false);assert.equal(B.parts(q,slip).claim,false,'two measured variables means the measured part is wrong');
  assert.equal(B.validAnswer(q,'v'+'-'.repeat(roles.length)),false);assert.ok(B.describe(q,q.answer).includes(changed+': Changed'));}
 assert.ok(n>100,'roles items '+n);
});

test('revision 2 removes the longest-answer cue and throwaway options',()=>{
 let total=0,reasonLongest=0,claimLongest=0;
 for(const id of D.units.map(u=>u.id))for(let f=0;f<4;f++)for(let i=0;i<12;i++){const q=B.make(id,f,seedOf(i),2);if(q.kind)continue;total++;
  const ri=+q.answer.split(':r')[1],L=q.reasons.map(x=>x.length);if(L[ri]>Math.max(...L.filter((_,j)=>j!==ri)))reasonLongest++;
  assert.ok(Math.min(...L)>=0.55*Math.max(...L),'thin reason in '+q.id+': '+q.reasons.join(' | '));
  if(q.options){const ci=+q.answer.split(':')[0].slice(1),O=q.options.map(x=>x.length);if(O[ci]>Math.max(...O.filter((_,j)=>j!==ci)))claimLongest++;assert.ok(Math.min(...O)>=0.55*Math.max(...O),'thin option in '+q.id+': '+q.options.join(' | '));}}
 assert.ok(total>1000,'sampled '+total);
 assert.ok(reasonLongest/total<=0.4,`correct reason longest in ${reasonLongest}/${total}`);
 assert.ok(claimLongest/total<=0.4,`correct conclusion longest in ${claimLongest}/${total}`);
});

test('revision 1 is still the original wording (spot checks) and revision 2 is the default',()=>{
 assert.equal(B.REV,2);
 const old=B.make('evidence',1,5,1),neu=B.make('evidence',1,5);assert.ok(old.options.includes('Extra light alone caused the whole difference.'));assert.ok(!neu.options.includes('Extra light alone caused the whole difference.'));
 assert.deepEqual(B.make('heat',0,9,0),B.make('heat',0,9,1),'revisions below 1 clamp to 1');assert.deepEqual(B.make('heat',0,9,99),B.make('heat',0,9,2),'revisions above REV clamp to REV');
 for(const id of ORIGINAL)for(let f=0;f<4;f++){const q=B.make(id,f,77,1);assert.equal(q.kind,undefined);assert.ok(!('rev' in q));}
});

test('the truncated-axis question shows a real bar chart at revision 2 that renders without NaN',()=>{
 for(let i=0;i<50;i++){const q1=B.make('graphs',1,seedOf(i),1),q2=B.make('graphs',1,seedOf(i),2);assert.equal(q1.figure.type,'table');assert.equal(q2.figure.type,'bar');
  const [a,b]=q2.figure.values;assert.equal(q2.figure.baseline,a-1);assert.equal(q2.answerLabel,`${b-a} units`);
  const html=F.diagram(q2.figure,q2.id);assert.match(html,/<svg[^>]+role="img"/);assert.match(html,/Axis starts at/);assert.match(html,/<details class="sp-data-equivalent">/);assert.doesNotMatch(html,/NaN|undefined|Infinity/);}
 const zero=F.diagram({type:'bar',labels:['P','Q','R'],values:[3,7,5],xlabel:'Plant',ylabel:'Height / cm'},'z');assert.doesNotMatch(zero,/NaN|Axis starts/);assert.equal((zero.match(/<rect /g)||[]).length,3);
});

test('single-question templates gain variety at revision 2',()=>{
 for(const [id,f] of [['circuits',2],['heat',2],['classification',2],['transport',2],['ecology',2],['matter',2],['changes',2],['water',2],['earth',2],['circuits',0],['light',0],['energy',0],['plants',0],['respiration',0],['digestion',0],['earth',0],['technology',0],['models',0],['fairtest',0],['magnets',0],['classification',0],['transport',0],['water',0],['changes',0],['ecology',0]]){
  const r1=new Set(),r2=new Set();for(let i=0;i<120;i++){r1.add(B.make(id,f,seedOf(i),1).fingerprint);r2.add(B.make(id,f,seedOf(i),2).fingerprint);}
  assert.ok(r2.size>=2&&r2.size>r1.size,`${id}:${f} rev1 ${r1.size} rev2 ${r2.size}`);}
});

test('every new unit and form has its own quick check',()=>{
 for(const id of SX)for(let f=0;f<4;f++){const c=Q.check('science',id,f);assert.ok(c,id+':'+f);assert.ok(c.correct>=0&&c.correct<c.choices.length);assert.equal(new Set(c.choices).size,c.choices.length);}
});

test('existing papers use only the original 24 units at revision 1; new units do not enter them',()=>{
 for(const def of E.paperDefinitions){assert.equal(def.rev,1);assert.ok(def.units.every(u=>ORIGINAL.includes(u)));if(def.kind==='paper')assert.deepEqual(def.units,ORIGINAL);
  for(const q of E.paperQuestions(def.id)){assert.deepEqual(q,B.make(q.unit,q.form,q.seed,1));assert.equal(q.kind,undefined);}}
});

test('the engine accepts numeric and written science answers, keeps long explanations, and explains invalid entries',()=>{
 const now=Date.UTC(2026,9,1,9),d=E.fresh(),seed=(()=>{for(let i=0;i<500;i++)if(B.make('sx-life',2,seedOf(i)).writtenKey==='deforestation')return seedOf(i);})();
 E.startPractice(d,'sx-life',{phase:'transfer',seed,now});const q=E.question(d.draft);assert.equal(q.writtenKey,'deforestation');
 E.touchDraft(d,{answer:'no'},now+1);let r=E.respond(d,now+2);assert.equal(r.ok,false);assert.match(r.reason,/short sentence/);
 const long=SAMPLES.deforestation.good[0]+' '+'The road also brings noise and pollution from cars, which can disturb the animals that remain nearby.';assert.ok(long.length>180);
 E.touchDraft(d,{answer:'The animals will lose their homes.'},now+3);r=E.respond(d,now+4);assert.equal(r.ok,true);assert.equal(r.attempt.correct,false);assert.equal(r.attempt.components.ideas[0],true);assert.equal(r.attempt.components.ideas[1],false);
 E.touchDraft(d,{answer:long},now+5);r=E.respond(d,now+6);assert.equal(r.attempt.correct,true);assert.equal(r.attempt.firstCorrect,false);assert.equal(E.validate(d).attempts[0].responses.at(-1).answer,long);
 assert.ok(E.review(d,r.attempt.id,'valid','Grown-up accepts the explanation.',now+7));assert.equal(E.validate(d).reviews[r.attempt.id].verdict,'valid');
 const n=E.fresh(),ns=(()=>{for(let i=0;i<500;i++)if(B.make('sx-waves',1,seedOf(i)).kind==='numeric')return seedOf(i);})();E.startPractice(n,'sx-waves',{phase:'apply',seed:ns,now});const nq=E.question(n.draft);
 E.touchDraft(n,{answer:'about a hundred'},now+1);r=E.respond(n,now+2);assert.equal(r.ok,false);assert.match(r.reason,/Type a number/);
 E.touchDraft(n,{answer:nq.answerLabel},now+3);r=E.respond(n,now+4);assert.equal(r.ok,true);assert.equal(r.attempt.correct,true);assert.equal(r.attempt.independent,true);
});

test('UI, page and offline cache include the new science files and answer kinds',()=>{
 const html=fs.readFileSync(require.resolve('../index.html'),'utf8'),sw=fs.readFileSync(require.resolve('../sw.js'),'utf8'),v=require('../release.json').version,ui=fs.readFileSync(require.resolve('../science-path-ui.js'),'utf8');
 for(const f of ['science-path-rev2.js','science-path-sx.js']){assert.equal(html.split('"'+f+'?v=').length-1,1,f);assert.ok(sw.includes(f+'?v='+v),f);assert.ok(html.indexOf(f+'?')<html.indexOf('science-path-bank.js?'),f+' loads before the bank');}
 assert.match(ui,/inputmode="decimal"/);assert.match(ui,/KEY IDEAS CHECK/);assert.match(ui,/data-sp-role/);assert.match(ui,/Model answer/);assert.doesNotMatch(ui,/\/24<\/strong>/);
});
