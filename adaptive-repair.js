/* Short, evidence-led follow-ups. No learner-specific answers or diagnoses are embedded. */
(function(root){
'use strict';
const DAY=86400000, rand=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const tracks={
 gstDirection:{skill:'percent',label:'GST adds; a discount subtracts',sources:['gst'],minMisses:2,forms:['repairGstCheck','repairGstPractice','repairGstTransfer','repairGstReview']},
 cubeEdge:{skill:'volume',label:'Cube edges and equal layers',sources:['cubeEdge'],minMisses:2,forms:['repairCubeCheck','repairCubePractice','repairCubeTransfer','repairCubeReview']},
 changingWhole:{skill:'fractionProblem',label:'Fractions of the remainder',sources:['repeatedRemainder','fractionRemainderTransfer','workingBackwards','fracRemainder'],forms:['repairWholeCheck','repairWholePractice','repairWholeTransfer','repairWholeReview']},
 percentWhole:{skill:'percent',label:'Finding the percentage whole',sources:['percentWhole'],forms:['repairPercentCheck','repairPercentPractice','repairPercentTransfer','repairPercentReview']},
 fractionDivision:{skill:'fraction',label:'Dividing a fraction into equal parts',sources:['fracDivWhole','fractionDivide'],forms:['repairDivisionCheck','repairDivisionPractice','repairDivisionTransfer','repairDivisionReview']}
};
function question(key,stage,text,answer,steps,extra={}){return {topic:tracks[key].skill==='percent'?'Percentage':tracks[key].skill==='volume'?'Volume':'Fractions',skill:tracks[key].skill,stars:stage<2?1:3,text,answer,steps,hint:root.MochiLearning.skills[tracks[key].skill].question,repairOnly:true,repair:{key,stage},teachingKey:['gstDirection','cubeEdge'].includes(key)?key:'',needsTeaching:stage===0&&['gstDirection','cubeEdge'].includes(key),transfer:stage>=2,...extra};}
function repairWholeCheck(){const n=rand(3,8),left=2*n;return question('changingWhole',0,`A ribbon is divided into 3 equal parts. One part is cut off. The remaining 2 parts have a total length of ${left} cm.`,n*3,[`2 parts = ${left} cm.`,`1 part = ${n} cm.`,`The original 3 parts = ${3*n} cm.`],{parts:[{label:'(a) What is the length of one equal part, in cm?',answer:n},{label:'(b) What was the original length, in cm?',answer:3*n}]});}
function repairWholePractice(){const n=rand(4,15),left=3*n;return question('changingWhole',1,`A library lends out 1/4 of its new books. It then lends out 1/2 of the remaining new books. There are ${left} new books left.`,8*n,[`Before the second loan: ${left} × 2 = ${6*n}.`,`This is 3/4 of the original number.`,`Original number: ${6*n} ÷ 3 × 4 = ${8*n}.`],{parts:[{label:'(a) How many new books remained after the first loan?',answer:6*n},{label:'(b) How many new books were there originally?',answer:8*n}]});}
function repairWholeTransfer(){const n=rand(4,12),spent=3*rand(2,5),left=3*n;return question('changingWhole',2,`A bottle was full. Mei used 1/4 of the water, then used another ${spent} ml. There were ${left} ml left. What was the volume of water in the full bottle, in ml?`,(left+spent)*4/3,[`Before using ${spent} ml: ${left} + ${spent} = ${left+spent} ml.`,`This is 3/4 of the full bottle.`,`Full bottle: ${left+spent} ÷ 3 × 4 = ${(left+spent)*4/3} ml.`]);}
function repairWholeReview(){const n=3*rand(3,8);return question('changingWhole',3,`A bag contains some counters. Ali removes 1/3 of them. Bea then removes 1/4 of the remaining counters. Half of the counters still in the bag are blue. There are ${n} blue counters. How many counters were in the bag at first?`,4*n,[`After both removals: ${n} × 2 = ${2*n}.`,`Before Bea's removal: ${2*n} ÷ 3 × 4 = ${8*n/3}.`,`At first: ${2*n} ÷ (2/3 × 3/4) = ${4*n}.`]);}
function repairPercentCheck(){const n=rand(3,12);return question('percentWhole',0,`20% of a group of pupils is ${n} pupils. The whole group is 100%.`,5*n,[`100% contains five 20% groups.`,`Total: ${n} × 5 = ${5*n}.`],{parts:[{label:'(a) How many equal 20% groups make 100%?',answer:5},{label:'(b) How many pupils are in the whole group?',answer:5*n}]});}
function repairPercentPractice(){const n=rand(4,16);return question('percentWhole',1,`25% of the beads in a box are purple. There are ${n} purple beads. How many beads are in the box altogether?`,4*n,[`25% is 1/4 of the whole.`,`Whole: ${n} × 4 = ${4*n}.`]);}
function repairPercentTransfer(){const n=rand(5,20);return question('percentWhole',2,`A jacket is sold at a 20% discount. Its sale price is $${4*n}. What was its price before the discount?`,5*n,[`The sale price is 80% of the original price.`,`20% = $${n}; 100% = $${5*n}.`],{prefix:'$'});}
function repairPercentReview(){const n=rand(5,14);return question('percentWhole',3,`A tank is 60% full. Adding ${2*n} litres makes it 100% full. What is the capacity of the tank, in litres?`,5*n,[`The added water fills 40% of the tank.`,`20% = ${n} litres; 100% = ${5*n} litres.`]);}
function repairDivisionCheck(){const d=rand(3,8),n=rand(2,5);return question('fractionDivision',0,`A strip represents one whole. It is divided into ${d} equal parts. Each of these parts is then divided into ${n} equal pieces.`,1/(d*n),[`There are ${d} × ${n} = ${d*n} equal pieces in one whole.`,`Each small piece is 1/${d*n} of the whole.`],{parts:[{label:'(a) How many equal small pieces make one whole?',answer:d*n},{label:'(b) What fraction of the whole is one small piece?',answer:`1/${d*n}`}]});}
function repairDivisionPractice(){const d=rand(3,9),n=rand(2,6);return question('fractionDivision',1,`Calculate 1/${d} ÷ ${n}. Give your answer as a fraction in simplest form.`,`1/${d*n}`,[`Divide one ${d}th into ${n} equal parts.`,`Each part is 1/${d*n} of the whole.`]);}
function repairDivisionTransfer(){const d=rand(3,8),n=rand(2,5);return question('fractionDivision',2,`A jug contains 1/${d} litre of juice. All the juice is shared equally among ${n} cups. How much juice is in each cup, in litres?`,`1/${d*n}`,[`Each cup receives 1/${d} ÷ ${n} = 1/${d*n} litre.`]);}
function repairDivisionReview(){const d=rand(3,8),n=rand(2,5);return question('fractionDivision',3,`A piece of ribbon is 1/${d} m long. It is cut into ${n} equal pieces. Give the length of one piece as a fraction of a metre.`,`1/${d*n}`,[`One piece is 1/${d} ÷ ${n} = 1/${d*n} m.`]);}

function repairGstCheck(){
 const rate=9;return question('gstDirection',0,`A shop adds ${rate}% GST to the price before tax. Compared with that original price, the amount paid including GST is…`,'Greater',[`The original price is 100%.`,`GST adds ${rate}%, so the total is ${100+rate}%.`],{choices:['Smaller','Unchanged','Greater']});
}
function repairGstPractice(){const cost=100*rand(2,5),tax=cost*9/100;return question('gstDirection',1,`A lamp costs $${cost} before 9% GST.`,cost+tax,[`GST: ${cost} × 9/100 = $${tax}.`,`Total: ${cost} + ${tax} = $${cost+tax}.`],{parts:[{label:'(a) What is the GST amount, in dollars?',answer:tax},{label:'(b) What is the total including GST, in dollars?',answer:cost+tax}]});}
function repairGstTransfer(){const cost=100*rand(2,7),paid=cost+100,total=cost*109/100;return question('gstDirection',2,`A customer buys a chair for $${cost} before 9% GST and pays $${paid}. How much change should the customer receive?`,paid-total,[`Price including GST: ${cost} + ${cost*9/100} = $${total}.`,`Change: ${paid} − ${total} = $${paid-total}.`],{prefix:'$'});}
function repairGstReview(){const cost=100*rand(2,6);return question('gstDirection',3,`Compare two separate purchases, each with an original price of $${cost}. Purchase A adds 9% GST. Purchase B gives a 9% discount and has no additional charge in this problem.`,cost*109/100,[`A: 109% of ${cost} = $${cost*109/100}.`,`B: 91% of ${cost} = $${cost*91/100}.`],{parts:[{label:'(a) What is paid for A, in dollars?',answer:cost*109/100},{label:'(b) What is paid for B, in dollars?',answer:cost*91/100}]});}
function repairCubeCheck(){const edge=rand(2,3),good=`${edge} × ${edge} × ${edge}`;return question('cubeEdge',0,`A solid cube has ${edge} unit cubes along each edge. Which calculation counts all the unit cubes, including the hidden ones?`,good,[`A layer has ${edge} × ${edge} unit cubes.`,`There are ${edge} layers, so use ${good}.`],{choices:[`${edge} + ${edge} + ${edge}`,good,`${edge**3} ÷ 3`]});}
function repairCubePractice(){const edge=rand(4,5);return question('cubeEdge',1,`A solid cube has volume ${edge**3} cm³. Find the length of one edge, in centimetres. Check by multiplying the edge by itself three times.`,edge,[`${edge} × ${edge} × ${edge} = ${edge**3}.`,`The edge is ${edge} cm; the volume is ${edge**3} cm³.`],{suffix:'cm'});}
function repairCubeTransfer(){const edge=rand(3,5);return question('cubeEdge',2,`Two identical solid cubes, each with volume ${edge**3} cm³, are joined face to face in one straight row. What is the length of the resulting cuboid, in centimetres?`,2*edge,[`Each cube has edge ${edge} cm because ${edge}³ = ${edge**3}.`,`The row is two edges long: 2 × ${edge} = ${2*edge} cm.`],{suffix:'cm'});}
function repairCubeReview(){const edge=rand(3,5);return question('cubeEdge',3,`A solid cube has volume ${edge**3} cm³.`,edge,[`An edge of ${edge} cm gives ${edge} × ${edge} × ${edge} = ${edge**3} cm³.`,`An edge of ${edge+1} cm gives ${(edge+1)**3} cm³.`],{parts:[{label:'(a) What is the original edge length, in cm?',answer:edge},{label:'(b) If each edge is increased by 1 cm, what is the new volume, in cm³?',answer:(edge+1)**3}]});}
function conceptGuard(gate){
 const p=root.MochiReasoning.probeFor(gate.skill);
 function conceptGateCheck(){return {topic:'Check the idea',skill:gate.skill,stars:1,text:p.question,choices:[...p.choices],answer:p.choices[p.answer],steps:[p.explanation],hint:p.explanation,conceptGate:gate,teachingKey:'skill:'+gate.skill,needsTeaching:true,repairOnly:true};}
 return {g:conceptGateCheck,id:'conceptGateCheck',skill:gate.skill,difficulty:1,repairOnly:true,kind:'daily',conceptGate:gate,reason:'Two first answers on the same question type need a closer look. Read a short explanation, then check the idea before another calculation.'};
}

const generators=[repairGstCheck,repairGstPractice,repairGstTransfer,repairGstReview,repairCubeCheck,repairCubePractice,repairCubeTransfer,repairCubeReview,repairWholeCheck,repairWholePractice,repairWholeTransfer,repairWholeReview,repairPercentCheck,repairPercentPractice,repairPercentTransfer,repairPercentReview,repairDivisionCheck,repairDivisionPractice,repairDivisionTransfer,repairDivisionReview];
function clean(value){return value&&Object.hasOwn(tracks,value.key)&&Number.isInteger(value.stage)&&value.stage>=0&&value.stage<=3?{key:value.key,stage:value.stage}:null;}
function pending(l,now=Date.now()){
 const out=[];
 for(const [key,t] of Object.entries(tracks)){
  const all=l.attempts.filter(a=>!a.skipped&&a.kind!=='custom'),failures=all.filter(a=>t.sources.includes(a.generator)&&(!a.firstCorrect||a.hints||a.model||a.revealed));
  const source=all.filter(a=>t.sources.includes(a.generator));
  const trigger=t.minMisses===2?source.filter((a,i)=>i>0&&a.firstCorrect===false&&source[i-1].firstCorrect===false):failures;
  const seed=trigger.at(-1);if(!seed)continue;
  const after=all.filter(a=>a.at>=seed.at&&a.repair?.key===key);let stage=0,last=seed.at;
  for(const a of after){if(a.repair.stage!==stage)continue;last=a.answeredAt||a.at;if(a.independent)stage++;}
  if(stage>=4)continue;
  const due=stage===3?last+DAY:0;
  out.push({key,...t,stage,due,ready:!due||due<=now,last:after.at(-1)?.at||0});
 }
 return out.sort((a,b)=>a.last-b.last);
}
function choose(l,bank,mode,now){
 if(!['daily','review','sprint'].includes(mode))return null;
 // Two focused questions, then a mixed question. A mistake never creates an endless drill.
 const tail=l.attempts.filter(a=>!a.skipped).slice(-2);
 if(tail.length===2&&tail.every(a=>a.repair)&&l.session?.done>0)return null;
 const next=pending(l,now).find(p=>p.ready&&!(l.session?.deferredRepairs||[]).includes(p.key)&&(!l.session?.focusSkill||l.session.focusSkill===p.skill));if(!next)return null;
 const item=bank.find(b=>b.id===next.forms[next.stage]);if(!item)return null;
 const label=['Check the idea','Practise the relationship','Apply it in another situation','Recall it after a day'][next.stage];
 return {...item,needsTeaching:next.stage===0&&!!tracks[next.key].minMisses||tail.length===2&&tail.every(a=>a.repair?.key===next.key&&!a.firstCorrect),kind:mode,transfer:next.stage>=2,reason:`${label}: ${next.label.toLowerCase()}. Your earlier answers suggested a useful next check.`,repair:{key:next.key,stage:next.stage}};
}
root.MochiRepair={tracks,generators,clean,pending,choose,conceptGuard};
if(typeof module!=='undefined')module.exports=root.MochiRepair;
})(typeof globalThis!=='undefined'?globalThis:this);
