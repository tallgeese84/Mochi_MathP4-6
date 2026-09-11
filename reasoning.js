/* Small, transparent teaching decisions. No percentile or fixed learning-style inference. */
(function(root){
'use strict';
const routes={picture:'Draw a model',equation:'Use an equation',table:'Make a table',backwards:'Work backwards',cases:'Try small cases',unsure:'Find a starting point'};
const stages={understand:'What I know',connect:'My approach',solve:'My steps',verify:'My check'};
const probes={
 number:{question:'Without calculating exactly, which is a reasonable estimate of 49 × 21?',choices:['100','1,000','10,000'],answer:1,explanation:'50 × 20 is 1,000. An estimate helps you check the size before exact calculation.',checks:'size and place value'},
 fraction:{question:'Two same-sized cakes: one is cut into thirds, the other into sixths. Which is the same amount as 1/3?',choices:['1/6','2/6','3/6'],answer:1,explanation:'One third contains two sixths. Equivalent fractions represent the same amount of the same whole.',checks:'equal parts of a common whole'},
 fractionProblem:{question:'You spend 1/2 of $24, then 1/3 of what remains. The second fraction is of which amount?',choices:['$24','$12','$8'],answer:1,explanation:'After the first step, $12 remains. That becomes the whole for the second fraction.',checks:'the changing reference whole'},
 decimal:{question:'0.6 ÷ 3 is 2 of which unit?',choices:['Ones','Tenths','Hundredths'],answer:1,explanation:'Six tenths shared in three equal groups gives two tenths in each group.',checks:'decimal place value'},
 ratio:{question:'Red : blue is 2 : 3. There are 10 red counters. How many counters does ONE ratio unit represent?',choices:['2','3','5'],answer:2,explanation:'Two equal ratio units represent 10 counters, so one unit represents 5 counters.',checks:'meaning of a ratio unit'},
 percent:{question:'A price rises from $80 to $100. To find the percentage increase, which price is 100%?',choices:['$20','$80','$100'],answer:1,explanation:'A percentage change compares the change with the original amount. Here the original amount is $80.',checks:'percentage change reference'},
 rate:{question:'3 identical notebooks cost $12. Which expression gives the cost of ONE notebook?',choices:['12 ÷ 3','12 × 3','3 ÷ 12'],answer:0,explanation:'Divide total dollars by the number of notebooks: dollars per notebook.',checks:'unit rate and units'},
 algebra:{question:'Each bag holds x marbles. Which expression describes 3 bags and 2 loose marbles?',choices:['3(x + 2)','3x + 2','x + 5'],answer:1,explanation:'Three equal groups of x give 3x. The 2 loose marbles are added once.',checks:'expression meaning'},
 measure:{question:'The same ribbon measures 2 m. When expressed in centimetres, the numerical value of this length is…',choices:['Smaller than 2','Still 2','Larger than 2'],answer:2,explanation:'Centimetres are smaller units, so more of them are needed for the same length.',checks:'unit-size relationship'},
 time:{question:'How much time passes from 10:50 a.m. to 11:10 a.m.?',choices:['20 minutes','40 minutes','60 minutes'],answer:0,explanation:'Ten minutes to 11:00, then ten more minutes: 20 minutes altogether.',checks:'bridging the hour'},
 area:{question:'Which calculation finds the area of a rectangle 3 cm by 5 cm?',choices:['3 × 5','2 × (3 + 5)','3 + 5'],answer:0,explanation:'Area counts square units inside: 3 rows of 5 squares. Perimeter measures the boundary.',checks:'area versus perimeter'},
 circle:{question:'A semicircle has radius 7 cm. Which lengths form its complete boundary?',choices:['The curved edge only','The curved edge and a 7 cm line','The curved edge and a 14 cm line'],answer:2,explanation:'The straight edge is a diameter: twice the radius. It belongs to the perimeter too.',checks:'the full boundary'},
 volume:{question:'Water moves to a wider tank without spilling. Which quantity must stay the same?',choices:['Water depth','Water volume','Base area'],answer:1,explanation:'The amount of water stays the same. A wider base can hold that amount at a smaller depth.',checks:'conservation of volume'},
 angle:{question:'Two adjacent angles make a straight line. What must their sum be?',choices:['90°','180°','360°'],answer:1,explanation:'A straight angle is half a full turn, so the two angles total 180°.',checks:'a geometric relationship'},
 spatial:{question:'A fold is a line of symmetry when…',choices:['It divides the area in half','The two sides match exactly when folded','It joins any two corners'],answer:1,explanation:'Equal areas alone are not enough. Corresponding points must overlap when folded.',checks:'reflection versus equal area'},
 data:{question:'Two groups have averages of 10 and 20, but different group sizes. Can you always average 10 and 20 to find the combined average?',choices:['Yes','No — the group sizes matter','Only when all values are whole numbers'],answer:1,explanation:'Find the total of all values and divide by the total number of values. A larger group contributes more.',checks:'weighted meaning of an average'},
 model:{question:'A problem gives a total and a difference for two quantities. What helps you begin?',choices:['Add every number in the question','Represent the two quantities and label total and difference','Guess which operation looks familiar'],answer:1,explanation:'Representing the relationship explains what operations are justified. The same words can occur in different structures.',checks:'modelling a relationship'},
 inquiry:{question:'You test a claim on 5 examples and it works. What have you established?',choices:['It is proved for every case','It works in those 5 cases; a general argument is still needed','It must be false'],answer:1,explanation:'Examples can suggest a pattern. To prove it, explain why it must hold in every allowed case; one counterexample can disprove a universal claim.',checks:'evidence versus proof'}
};
function probeFor(skill){return probes[skill]||probes.rate;}
function cleanTrace(t){
 const obj=t&&typeof t==='object'?t:{};
 return Object.fromEntries(Object.keys(stages).map(k=>[k,String(obj[k]||'').slice(0,1200)]));
}
function cleanProbe(p){
 if(!p||!Object.hasOwn(probes,p.skill)||!Number.isInteger(p.choice)||p.choice<0||p.choice>=3)return null;
 return {skill:p.skill,choice:p.choice,correct:p.choice===probes[p.skill].answer,checks:probes[p.skill].checks,at:Number.isFinite(p.at)?p.at:0};
}
function cleanExtras(a){return {
 route:Object.hasOwn(routes,a.route)?a.route:'unsure',
 trace:cleanTrace(a.trace),
 reasoningHistory:(Array.isArray(a.reasoningHistory)?a.reasoningHistory:[]).slice(-12).map(e=>({stage:Object.hasOwn(stages,e.stage)?e.stage:'connect',text:String(e.text||'').slice(0,1200)})),
 working:(Array.isArray(a.working)?a.working:[]).slice(0,24).map(x=>String(x).slice(0,250)),
 probe:cleanProbe(a.probe),toolNotes:String(a.toolNotes||'').slice(0,1500)
};}
function profile(l,skill){
 const recent=l.attempts.filter(a=>a.skill===skill&&!a.skipped).slice(-12);
 const routeEvidence=Object.entries(routes).filter(([id])=>id!=='unsure').map(([id,label])=>{
   const attempts=recent.filter(a=>a.route===id);return {id,label,uses:attempts.length,independent:attempts.filter(a=>a.independent).length};
 }).filter(r=>r.uses).sort((a,b)=>b.independent-a.independent||b.uses-a.uses);
 const obstacles={};recent.filter(a=>!a.independent).forEach(a=>{if(a.obstacle)obstacles[a.obstacle]=(obstacles[a.obstacle]||0)+1;});
 return {sample:recent.length,routeEvidence,obstacles,confidentMisses:recent.filter(a=>a.confidence==='sure'&&!a.firstCorrect).length,
  recentProbe:recent.slice().reverse().map(a=>cleanProbe(a.probe)).find(Boolean)||null};
}
function band(l,skill){
 const recent=l.attempts.filter(a=>a.skill===skill&&!a.skipped).slice(-5);
 if(recent.length>=2&&recent.slice(-2).every(a=>!a.firstCorrect))return {min:1,max:2,label:'Rebuild',reason:'Two recent first answers need a revisit. Try a smaller conceptual step.'};
 if(recent.length>=3&&recent.slice(-3).every(a=>a.independent))return {min:3,max:5,label:'Stretch',reason:'Three recent independent answers: try a less familiar, deeper problem.'};
 return {min:1,max:3,label:'Explore',reason:'Build evidence across different forms before increasing complexity.'};
}
function nextMove(l,skill,obstacle=''){
 const p=profile(l,skill),b=band(l,skill);
 if(obstacle==='meaning')return {title:'Name the unknown',prompt:'What exactly are you trying to find? Which information helps you find it?'};
 if(obstacle==='representation')return {title:'Make the relationship visible',prompt:'Choose a bar, a table or an equation. Label what each part means.'};
 if(obstacle==='calculation')return {title:'Check one operation',prompt:'Keep your plan. Estimate the result of the first calculation, then check that line.'};
 if(obstacle==='checking'||p.confidentMisses>=2)return {title:'Try to disprove it',prompt:'What estimate, inverse operation or small case could reveal a mistake?'};
 if(p.recentProbe&&!p.recentProbe.correct)return {title:'Revisit the concept',prompt:'The small-case check suggests revisiting '+p.recentProbe.checks+'. Explain one example before returning to the problem.'};
 if(b.label==='Stretch')return {title:'Connect two methods',prompt:'Can you solve this using a different representation, then explain why both methods agree?'};
 return {title:'Follow your idea',prompt:'Show your first step and tell Mochi why it follows from what you know.'};
}
function transferEvidence(l,q,generator,skill){
 // A review slot or a fresh random number is NOT itself evidence of transfer.
 return !!q.transfer && l.attempts.some(a=>a.skill===skill&&a.independent)&&!l.attempts.filter(a=>a.skill===skill&&!a.skipped).slice(-5).some(a=>a.generator===generator);
}
const clamp=(n,min,max)=>Math.min(max,Math.max(min,Math.round(Number(n)||min)));
function fractionState(parts,selected){parts=clamp(parts,2,12);selected=clamp(selected,0,parts);return {parts,selected,value:selected/parts};}
function ratioState(a,b,unit){a=clamp(a,1,8);b=clamp(b,1,8);unit=clamp(unit,1,12);return {a,b,unit,left:a*unit,right:b*unit,total:(a+b)*unit};}
function gridState(w,h){w=clamp(w,1,12);h=clamp(h,1,12);return {w,h,area:w*h,perimeter:2*(w+h)};}
root.MochiReasoning={routes,stages,probes,probeFor,cleanTrace,cleanExtras,profile,band,nextMove,transferEvidence,fractionState,ratioState,gridState};
if(typeof module!=='undefined')module.exports=root.MochiReasoning;
})(typeof globalThis!=='undefined'?globalThis:this);
