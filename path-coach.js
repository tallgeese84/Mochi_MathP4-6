/* Small mastery coaching helpers shared by the new Maths and Science pathways.
   Presentation only: diagnostics mark help through the existing engines; no mastery is created here. */
(function(root){
'use strict';
const goals={
 maths:{
  relationships:'Turn totals and differences into equal parts.',
  percent:'Name the percentage whole before calculating.',
  counting:'Count each structure once — no duplicates.',
  factors:'Use factors and LCM only when the relationship calls for them.',
  area:'Use shared heights to compare areas before calculating.',
  volume:'Track which cube faces are hidden and which remain exposed.'
 },
 science:{
  circuits:'Trace one complete electrical path from the cell and back.',
  matter:'Track matter through a change without losing particles.',
  fairtest:'Change one variable and keep the rest comparable.',
  graphs:'Say what the data show without claiming more than the evidence.',
  heat:'Follow heat from hotter objects to cooler surroundings.',
  forces:'Combine forces by direction as well as size.'
 }
};
const forks={
 maths:{
  counting:{prompt:'If the same two boundary lines are chosen in the opposite order, is that a new rectangle?',choices:['No — it is the same rectangle.','Yes — the order makes a new rectangle.'],correct:0,explain:'A rectangle is fixed by the pair of vertical boundaries and the pair of horizontal boundaries. Reversing a pair does not create a new rectangle.'},
  factors:{prompt:'For the least common multiple, which prime powers should you keep?',choices:['The highest power of every prime needed by either number.','Only the primes that appear in both numbers.'],correct:0,explain:'The LCM must contain enough of every prime factor to be divisible by each number.'},
  area:{prompt:'Two triangles share the same height. If one base is 2.5 times as long, what happens to its area?',choices:['Its area is 2.5 times as large.','Its area stays the same.','Its area is squared.'],correct:0,explain:'With the same height, triangle area is directly proportional to the base length.'},
  volume:{prompt:'Two cubes touch face-to-face. How many square faces stop being exposed?',choices:['Two faces — one from each cube.','One face total.','Four faces.'],correct:0,explain:'The touching face on each cube becomes internal, so one join hides two faces.'},
  percent:{prompt:'After a 20% discount, the sale price is what percentage of the original price?',choices:['80%','20%','120%'],correct:0,explain:'The original is 100%. Removing 20% leaves 80% of the original.'},
  relationships:{prompt:'If you subtract the known difference from the total of two amounts, what remains?',choices:['Two equal copies of the smaller amount.','One copy of the larger amount.','The difference again.'],correct:0,explain:'Removing the extra part makes the two amounts equal, so the remainder is twice the smaller amount.'}
 },
 science:{
  circuits:{prompt:'What must be true for a bulb to light in a simple circuit?',choices:['There is a complete conducting path from the cell, through the bulb, and back.','The wire only needs to touch one terminal of the cell.','An open switch makes current flow more easily.'],correct:0,explain:'Current needs a complete closed path. Trace the path all the way out from the cell and back to it.'},
  matter:{prompt:'Ice melts inside a sealed container. What happens to the total mass?',choices:['It stays the same.','It disappears as the ice melts.','It doubles because liquid takes a new shape.'],correct:0,explain:'Melting changes state, not the amount of matter in a closed system.'},
  fairtest:{prompt:'To test whether one factor causes a change, what should you do?',choices:['Change that factor and keep the other important conditions comparable.','Change several factors together.','Only measure the group you expect to win.'],correct:0,explain:'A fair comparison isolates the factor being tested so another change does not explain the result.'},
  graphs:{prompt:'A graph shows two quantities changing together. What can you safely conclude first?',choices:['They are associated in these data; the graph alone does not prove cause.','One definitely causes the other.','The graph proves the pattern will continue forever.'],correct:0,explain:'A graph can show a pattern or association. Causation needs a suitable comparison or experiment.'},
  heat:{prompt:'When two objects at different temperatures interact, what is the overall direction of heat transfer?',choices:['From hotter to cooler.','From cooler to hotter.','There is no transfer until boiling.'],correct:0,explain:'Heat transfers overall from a hotter object or region to a cooler one.'},
  forces:{prompt:'A 4 N force acts right and a 2 N force acts left. What is the net force?',choices:['2 N right','6 N right','2 N left'],correct:0,explain:'Opposite forces subtract. The larger force sets the net direction.'}
 }
};
function diagnostic(subject,id,E){
 const custom=forks[subject]?.[id];if(custom)return custom;
 const u=E?.unit?.(id),c=u?.check;if(!c)return null;
 return {prompt:c[0],choices:[...c[1]],correct:c[2],explain:c[3]};
}
function goal(subject,id,E){
 const custom=goals[subject]?.[id];if(custom)return custom;
 const u=E?.unit?.(id);return u?.why||u?.title||'Understand the relationship, then use it in a new situation.';
}
function progress(E,d,id,now=Date.now()){
 const e=E.evidence(d,id,now),mixed=(d.attempts||[]).some(a=>a.unit===id&&a.mode==='paper'&&a.independent),steps=[
  {id:'learn',label:'Learn',done:e.taught},
  {id:'apply',label:'Apply',done:e.apply>=2},
  {id:'connect',label:'Transfer',done:e.transfer>=1},
  {id:'remember',label:'Remember',done:e.delayed>=1},
  {id:'mix',label:'Mix',done:mixed}
 ];
 let current=steps.findIndex(x=>!x.done);if(current<0)current=steps.length-1;
 return {evidence:e,steps,current};
}
const reward=phase=>phase==='transfer'||phase==='recall'?2:1;
const rewardReason=phase=>phase==='recall'?'Remembered later':phase==='transfer'?'Solved a changed problem':'Fresh independent answer';
root.MochiPathCoach={diagnostic,goal,progress,reward,rewardReason};
if(typeof module!=='undefined')module.exports=root.MochiPathCoach;
})(typeof window!=='undefined'?window:globalThis);
