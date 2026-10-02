/* Fresh representations and bounded practice. No pupil data or new assessment blueprints. */
(function(root){
'use strict';
function bank(h){
 const {pair,written,idea,table}=h,S={};
 // A diagram and a connection table provide different representations of the same circuit rules.
 const cases=[
  {parallel:true,open:'A',claim:'Only B lights.',because:'B still has its own complete path through the battery; A has a gap.'},
  {parallel:true,open:'B',claim:'Only A lights.',because:'A still has its own complete path through the battery; B has a gap.'},
  {parallel:true,open:'common',claim:'Neither bulb lights.',because:'The common gap breaks both possible paths back to the battery.'},
  {parallel:true,open:'none',claim:'Both bulbs light.',because:'Each bulb is on a complete conducting path through the battery.'},
  {parallel:false,open:'common',claim:'Neither bulb lights.',because:'The gap breaks the one shared series path through both bulbs.'},
  {parallel:false,open:'none',claim:'Both bulbs light.',because:'The one closed path passes through both bulbs and the battery.'}
 ];
 const options=['Only A lights.','Only B lights.','Both bulbs light.','Neither bulb lights.'];
 const describe=c=>c.open==='none'?'Every switch is closed.':c.open==='common'?'The switch in the common battery connection is open; all other connections are closed.':`Only the switch in branch ${c.open} is open. The common connections and the other branch are closed.`;
 S.circuits=[];
 S.circuits[1]=r=>{
  const c=cases[r.int(0,cases.length-1)],representation=r.int(0,1),figure=representation?table(['Connection','State'],[['Bulb arrangement',c.parallel?'Separate parallel branches':'One shared series path'],['Common battery connection',c.open==='common'?'open':'closed'],['Branch A',c.parallel?(c.open==='A'?'open':'closed'):'in shared path'],['Branch B',c.parallel?(c.open==='B'?'open':'closed'):'in shared path']],'Connection checklist — no light outcomes supplied'):{type:'circuit',parallel:c.parallel,open:c.open};
  return pair(`The two bulbs and battery are working. ${c.parallel?'The bulbs have separate parallel branches.':'The bulbs share one series path.'} ${describe(c)} Which bulbs light? Trace the complete routes rather than the position of a bulb on the page.`,c.claim,options.filter(x=>x!==c.claim),c.because,['A bulb lights whenever one wire touches the battery, even without a return path.','The first bulb uses up current so none can reach a second bulb.'],['Identify the common supply and return.','Trace a route from one battery terminal through each bulb and back to the other terminal.',c.because],figure);
 };
 S.circuits[2]=r=>{
  const c=cases[r.int(0,cases.length-1)],only=c.open==='A'?'B':'A',closed=c.open==='none';
  const claim=closed?idea('Both bulbs have complete paths',['both','two'],['light','lit','glow']):c.open==='common'?idea('Neither bulb lights',['neither','both','no bulb'],['unlit','off','dark','not light','not glow']):idea('Only the unbroken branch lights',[`only ${only.toLowerCase()}`,`bulb ${only.toLowerCase()}`,`branch ${only.toLowerCase()}`],['light','lit','glow']);
  const path=idea('Link the light outcome to a complete or broken path',['path','route','circuit','loop','connection'],['complete','closed','broken','gap','open','break']);
  const battery=idea('Trace the route through the battery, not just to one contact',['battery','cell','terminal'],['back','return','both','through','from','between']);
  let model=closed?`Both bulbs light. ${c.parallel?'Each branch has':'The shared series circuit has'} a complete path from one battery terminal through the bulbs and back to the other terminal.`:c.open==='common'?`Both bulbs are unlit. The open common connection breaks ${c.parallel?'both branch routes':'the shared path'}, so no complete route returns through the battery.`:`Only ${only} lights. ${only} has a complete path from one battery terminal through its branch and back to the other terminal. The open switch breaks the other branch but not this one.`;
  return written(`Explain which bulbs light and why. ${c.parallel?'A and B are on separate parallel branches.':'A and B share a series path.'} ${describe(c)} Trace the route from one battery terminal and back to the other in your own words.`,{key:'circuit-explain-'+(c.parallel?'parallel':'series')+'-'+c.open,ideas:[claim,path,battery],model,figure:{type:'circuit',parallel:c.parallel,open:c.open},steps:['Identify whether a gap is on one branch or a shared connection.','Trace each bulb route all the way through the battery.','Use that path to explain the outcome, not merely name a rule.']});
 };
 S.changes=[];
 S.changes[2]=r=>{
  const solute=r.pick(['sugar','salt']),mass=r.int(2,8),water=r.int(40,90),total=mass+water;
  return written(`${mass} g of ${solute} is stirred into ${water} g of water at room temperature until the crystals cannot be seen. Nothing is spilled or evaporated. A pupil says, “The crystals melted, so they no longer exist.” Explain the change, predict the total mass and describe one way to show the ${solute} is still present.`,{key:'dissolve-evidence-'+solute,ideas:[
   idea('Name dissolving as forming a solution',['dissolv','solution']),
   idea('The solute remains present',['sugar','salt','solute','particles'],['still','remain','present','not gone','not disappear']),
   idea('Account for the total mass',[String(total)+'$'],['g$','gram','mass']),
   idea('Recover the solute by evaporating water',['evaporat'],['water'])
  ],model:`The ${solute} dissolves to form a solution; it does not melt or disappear. The ${solute} particles remain present. The total mass is ${total} g because nothing leaves. Evaporating the water can leave the ${solute} behind.`,steps:[`Track both substances: ${mass} + ${water} = ${total} g.`,'Dissolving mixes a solute with a solvent; melting is a change of state.','A solid left after evaporating the water is evidence that the solute remained.'],figure:table(['Before mixing','Mass'],[[solute,mass+' g'],['Water',water+' g']],'Given masses; neither substance leaves the container')});
 };
 S.fairtest=[];
 S.fairtest[1]=r=>{
  // Retain an application role task but ask it through a new data representation.
  const temp=r.pick([20,25,30]),high=temp+20,delta=r.int(2,5),a=r.int(65,85),b=a-r.int(20,30);
  return pair('Two groups tested how water temperature affects sugar dissolving time. They used equal water volumes, the same mass and grain size of sugar and the same stirring. Which plan gives better evidence about the consistency of each result?', 'Repeat at EACH temperature and compare the times within each temperature.', ['Use one hot trial and one cold trial; two different temperatures count as repeats.','Repeat only the faster hot trial and discard any slow result.','Take the average of the hot and cold times together and call it the result at both temperatures.'], 'Replicates keep the tested condition the same, so they show variation at that condition.', ['Different temperatures are already repeats of one condition.','An average removes every error and makes a test perfectly accurate.'],['A changed temperature tests the effect; repeating the same temperature checks consistency.','Keep all the controls the same when repeating.','Calculate a separate mean at each temperature, not one mean across the two treatments.'],table(['Water temperature','Trial 1 / s','Trial 2 / s','Trial 3 / s'],[[temp+'°C',a-delta,a,a+delta],[high+'°C',b-delta,b+delta,b]],'Synthetic repeated measurements'));
 };
 return S;
}
function route(E,s,r,now=Date.now(),manual=false){
 const d=E.init(s);
 if(d.draft||Object.values(d.papers).some(p=>!p.submittedAt)||['paper','resume','recall','mixed-set','redo'].includes(r.kind))return r;
 const history=d.attempts.filter(a=>a.mode==='practice'&&a.answeredAt<=now),recent=history.filter(a=>now-a.answeredAt<14*E.DAY);
 // A bounded revisit offers teaching for explicit evidence gaps. It does not rewrite an old score.
 const concern=recent.slice().reverse().find(a=>{
  if(a.components?.kind!=='written'||d.reviews[a.id]?.verdict==='valid')return false;
  const q=E.question(a),p=E.B.ideaReport(q,a.responses.at(-1).answer);
  return (d.reviews[a.id]?.verdict==='needs-discussion'||p.contradictions.length||/fair-plan/.test(q.writtenKey||'')&&p.missing.some(x=>/repeat/i.test(x)))&&(d.lessons[a.unit]?.lastViewedAt||0)<Math.max(a.answeredAt,d.reviews[a.id]?.verdict==='needs-discussion'?d.reviews[a.id].at:0);
 });
 if(concern&&!manual)return {kind:'learn',unit:concern.unit,repair:true,reason:'Build the explanation: choose what to measure, control the comparison, and repeat each condition.'};
 const id=r.unit;if(!id||!['practice','learn'].includes(r.kind))return r;
 const sameDay=history.filter(a=>E.dayKey(a.answeredAt)===E.dayKey(now)),tail=sameDay.slice(-3),pending=recent.some(a=>a.unit===id&&E.pendingWriting(d,a));
 if(!pending&&!(tail.length===3&&tail.every(a=>a.unit===id)))return r;
 const e=E.evidence(d,id,now);
 // After three familiar circuit outcomes, explain a changed layout rather than choosing again.
 if(!pending&&id==='circuits'&&e.apply>=2&&tail.every(a=>a.form!==2))return {...r,kind:'practice',phase:'transfer',reason:'Try a different representation and explain the complete circuit paths.'};
 const alternatives=E.D.units.filter(u=>u.id!==id).map(u=>E.evidence(d,u.id,now)).filter(e=>!e.parked&&!recent.some(a=>a.unit===e.id&&E.pendingWriting(d,a)));
 const ready=alternatives.filter(e=>e.taught&&(e.apply<2||!e.transfer)).sort((a,b)=>a.last-b.last)[0];
 if(ready)return {kind:ready.needsTeaching?'learn':'practice',unit:ready.id,reason:'Change the representation or topic. Familiar repeats do not count as new mastery.'};
 const next=E.D.units.find(u=>u.id!==id&&!d.lessons[u.id]?.completedAt&&u.prerequisites.every(p=>E.evidence(d,p,now).taught));
 if(next)return {kind:'learn',unit:next.id,reason:'Your explanation is saved for review. Build the next science idea.'};
 const other=alternatives.sort((a,b)=>a.last-b.last)[0];return other?{kind:'practice',unit:other.id,reason:'Use another science idea rather than repeat the same question.'}:r;
}
root.MochiSciencePractice={bank,route};if(typeof module!=='undefined')module.exports=root.MochiSciencePractice;
})(typeof globalThis!=='undefined'?globalThis:this);
