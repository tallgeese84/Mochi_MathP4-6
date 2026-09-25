/* Evidence model: a practice heuristic, never a placement score or diagnosis. */
(function(root){
'use strict';
const DAY=86400000;
const tutorLanguage='Use Singapore primary Mathematics terminology and British English. Prefer average, breadth for rectangles and cuboids, mass in g or kg, volume in cubic units, capacity in litres or millilitres, perimeter, area, numerator, denominator, equivalent fractions and simplest form. Explain each term through its meaning. Distinguish a digit from its value, an expression from an equation, area from perimeter, and a fraction of the original amount from a fraction of the remainder. Define a positive common multiple explicitly. State units and the relevant whole for percentages. Give complete mathematical statements; do not teach tricks such as moving a decimal point without place-value reasoning. Do not claim that testing one value proves an algebraic identity, or that the average of speeds is never valid: it works for equal time intervals. Identify speed and other beyond-primary content as extension work. Accept correct alternative terminology and reasoning; do not mark by a rigid keyword checklist. You are not MOE or SEAB and must not claim their approval, an official marking scheme, or that your wording is the only accepted wording.';
const skills={
 number:{label:'Number sense & operations',prereq:[],question:'What does each number represent? Estimate before calculating.',resource:'https://www.mathsisfun.com/numbers/index.html'},
 fraction:{label:'Fraction meaning & operations',prereq:['number'],question:'What is the whole? Can you draw equal parts to explain the operation?',resource:'https://www.mathsisfun.com/fractions.html'},
 fractionProblem:{label:'Fractions in changing situations',prereq:['fraction'],question:'Is this fraction of the original whole or of what remains?',resource:'https://www.mathsisfun.com/fractions.html'},
 decimal:{label:'Decimals & money',prereq:['number','fraction'],question:'How does place value help? What answer size would be reasonable?',resource:'https://www.mathsisfun.com/decimals.html'},
 ratio:{label:'Ratio & equal units',prereq:['fraction'],question:'What stays the same? What does one unit stand for?',resource:'https://www.mathsisfun.com/numbers/ratio.html'},
 percent:{label:'Percentages & the reference whole',prereq:['fraction','decimal'],question:'Which quantity is 100%, and does it change between the steps?',resource:'https://www.mathsisfun.com/percentage.html'},
 rate:{label:'Rates & proportional reasoning',prereq:['ratio','decimal'],question:'What quantity corresponds to one unit? Is the rate constant?',resource:'https://www.mathsisfun.com/measure/unit-price.html'},
 speed:{stretch:true,label:'Speed, time & distance (extension)',prereq:['rate','measure','time'],question:'What distance and time belong together? Are the time units consistent?',resource:'https://www.mathsisfun.com/measure/speed-velocity.html'},
 algebra:{label:'Algebra & relationships',prereq:['number'],question:'What does the letter stand for? Can you explain the relationship in words?',resource:'https://www.mathsisfun.com/algebra/introduction.html'},
 measure:{label:'Measurement & units',prereq:['decimal'],question:'Will changing to smaller units make the number bigger or smaller?',resource:'https://www.mathsisfun.com/measure/metric-system.html'},
 time:{label:'Time & duration',prereq:['number'],question:'Can you make a timeline and bridge to the next hour?',resource:'https://www.mathsisfun.com/time.html'},
 area:{label:'Area & perimeter',prereq:['measure','number'],question:'Are you measuring the boundary or the space inside? Can you split the shape?',resource:'https://www.mathsisfun.com/area.html'},
 circle:{label:'Circles & composite boundaries',prereq:['area','fraction'],question:'Which edges belong to the boundary? Is the given length a radius or diameter?',resource:'https://www.mathsisfun.com/geometry/circle.html'},
 volume:{label:'Volume & conservation',prereq:['area','measure'],question:'What volume stays the same? Which depth describes the water?',resource:'https://www.mathsisfun.com/geometry/cuboids-rectangular-prisms.html'},
 angle:{label:'Angles & shape properties',prereq:['number'],question:'Which marked property lets you deduce an angle? Do not measure the drawing.',resource:'https://www.mathsisfun.com/angles.html'},
 spatial:{label:'Symmetry & spatial reasoning',prereq:['angle','area'],question:'Try rotating or folding it mentally. Which features must stay together?',resource:'https://www.mathsisfun.com/geometry/symmetry.html'},
 data:{label:'Tables, graphs & averages',prereq:['number','fraction'],question:'What do the labels and scale mean? Does the evidence support the claim?',resource:'https://www.mathsisfun.com/data/index.html'},
 model:{label:'Multi-step problem modelling',prereq:['ratio','fractionProblem'],question:'What is unknown? Draw, list or model the relationships before choosing operations.',resource:'https://nrich.maths.org/curriculum-linked-problems-primary-teachers'},
 inquiry:{label:'Patterns, proof & counterexamples',prereq:['number'],question:'Try a small case. What pattern do you notice, and what would disprove it?',resource:'https://nrich.maths.org/curriculum-linked-problems-primary-teachers',stretch:true}
};
const mapping={
 fracRemainder:'fractionProblem',ratioDiff:'ratio',percentDiscount:'percent',percentWhole:'percent',speed:'speed',algebra:'algebra',semicircle:'circle',quadrant:'circle',volume:'volume',angles:'angle',average:'data',gapDiff:'model',orderOps:'number',decimals:'decimal',ratioChange:'ratio',percentChange:'percent',twoLegSpeed:'speed',rateWork:'rate',volumeDepth:'volume',parallelogramAngle:'angle',fractionDivide:'fraction',workingBackwards:'fractionProblem',placeValue:'number',rounding:'number',factorsMultiples:'number',measureConvert:'measure',timeDuration:'time',fracToDecimal:'decimal',fracDivWhole:'fraction',gst:'percent',algebraFraction:'algebra',isoscelesAngle:'angle',parallelAngle:'angle',pieChartQ:'data',barGraphQ:'data',lineGraphQ:'data',averageTable:'data',rateTable:'rate',commission:'percent',coinsProblem:'model',twoVehiclesMeet:'speed',waterTransfer:'volume'
};
function fresh(){return {version:1,goalMonth:'2027-09',mode:'diagnostic',attempts:[],notes:[],benchmarks:[],session:null};}
function init(s){
 if(!s.learning || s.learning.version!==1) s.learning=fresh();
 const l=s.learning;
 if(!Array.isArray(l.attempts)) l.attempts=[];
 if(!Array.isArray(l.notes)) l.notes=[];
 if(!Array.isArray(l.benchmarks)) l.benchmarks=[];
 return l;
}
function evidence(l,id,now=Date.now()){
 const all=l.attempts.filter(a=>a.skill===id && a.kind!=='custom' && !a.skipped);
 const recent=all.slice(-10), independent=recent.filter(a=>a.independent);
 const days=new Set(independent.map(a=>new Date(a.at).toISOString().slice(0,10))).size;
 const forms=new Set(independent.map(a=>a.generator)).size;
 const explained=independent.filter(a=>a.plan && a.plan.trim().length>=15).length;
 const transfer=independent.some(a=>a.transfer);
 const misses=recent.filter(a=>!a.firstCorrect).length;
 let level=!recent.length?'Not checked':independent.length<2?'Building':days<3||!transfer||!explained||misses>2?'Practising':'Retained in practice';
 // For families with multiple forms, require independent evidence on at least two.
 if(level==='Retained in practice' && forms<2) level='Practising';
 const last=all[all.length-1];
 let streak=0; for(let i=all.length-1;i>=0 && all[i].independent;i--) streak++;
 const due=last?last.at+[1,1,3,7,14,30][Math.min(streak,5)]*DAY:0;
 return {level,attempts:all.length,independent:independent.length,days,forms,explained,misses,due,overdue:!!last&&due<=now,last,transfer};
}
function record(l,a){
 if(l.attempts.some(x=>x.id===a.id)) return false;
 l.attempts.push({...a,independent:!!(a.firstCorrect && a.correct && !a.hints && !a.revealed && !a.model && a.confidence!=='guess' && a.kind!=='custom')});
 l.attempts=l.attempts.slice(-5000);
 if(l.session){l.session.done++; if(l.session.done>=l.session.total) l.session.finished=true;}
 return true;
}
function catalog(gens){return gens.map(g=>{const q=g(),skill=q.skill||mapping[g.name]; return {g,id:g.name,skill,topic:q.topic,difficulty:q.stars||2,repairOnly:!!q.repairOnly,stretch:!!q.stretch||!!skills[skill]?.stretch||g.name==='parallelAngle'};});}
function choose(l,bank,now=Date.now()){
 const blocked=root.MochiTeaching?.blocked(l)||[],blockedIds=new Set(blocked.map(b=>b.generator));
 const core=bank.filter(b=>!b.stretch&&!b.repairOnly&&!blockedIds.has(b.id)), session=l.session;
 const done=session&&!session.finished?session.done:0;
 const mode=session&&!session.finished?session.mode:l.mode;
 const repair=root.MochiRepair?.choose(l,bank,mode||'daily',now);
 if(repair&&(!session?.focusSkill||repair.skill===session.focusSkill))return repair;
 const guard=blocked.find(b=>(!session?.focusSkill||session.focusSkill===b.skill)&&!Object.values(root.MochiRepair?.tracks||{}).some(t=>t.sources.includes(b.generator)));
 if(guard&&mode!=='diagnostic'&&mode!=='stretch')return {...root.MochiRepair.conceptGuard(guard),kind:mode||'daily'};
 const base=l.attempts.slice(-1)[0];
 const ev=id=>evidence(l,id,now);
 let pool=core,reason='Mixing skills to keep earlier learning active.',transfer=false;
 if(mode==='diagnostic'){
   const since=session?.started||0;
   const seen=new Set(l.attempts.filter(a=>a.at>=since&&a.kind==='diagnostic').map(a=>a.skill));
   const next=Object.keys(skills).find(id=>!skills[id].stretch&&!seen.has(id));
   if(next){pool=bank.filter(b=>!b.stretch&&!b.repairOnly&&b.skill===next);reason='A first look at '+skills[next].label.toLowerCase()+'. It is fine to ask for help.';}
 } else if(mode==='stretch'){
   pool=bank.filter(b=>b.stretch); transfer=true; reason='Explore, test a claim, then explain why it works.';
 } else if(mode==='sprint'){
   pool=core.filter(b=>b.difficulty<=3);reason='No-calculator fluency practice. Timing is practice, not a placement prediction.';
 } else {
   const due=core.filter(b=>ev(b.skill).overdue);
   if(base && !base.skipped && (!base.firstCorrect||base.hints||base.revealed)){
     const prerequisites=base.probe||['gst','cubeEdge'].includes(base.generator)?[]:skills[base.skill]?.prereq||[];
     const p=prerequisites.find(id=>ev(id).independent<2);
     pool=core.filter(b=>b.skill===(p||base.skill));
     reason=base.probe&&!base.probe.correct?'The concept check suggests revisiting '+base.probe.checks+'.':p?'Let’s check a building block: '+skills[p].label.toLowerCase()+'.':'Try the idea in another form, with less help.';
   } else if(mode==='review'&&due.length){pool=due;reason='A delayed check: can you retrieve the idea without a hint?';transfer=true;}
   else if(done===0){pool=core.filter(b=>b.difficulty<=2);reason='Warm up with one foundation skill.';}
   else if(done===6){pool=due.length?due:core;transfer=true;reason='Use an earlier idea in a fresh question.';}
   else if(done===7){pool=bank.filter(b=>b.stretch);transfer=true;reason='Finish by investigating a claim, not just calculating.';}
   else if(due.length && done===5){pool=due;transfer=true;reason='A spaced review before it fades.';}
   else {
     const ids=Object.keys(skills).filter(id=>!skills[id].stretch);
     ids.sort((a,b)=>{
       const score=id=>{const e=ev(id);return (!e.attempts?3:0)+e.misses*2-e.independent+ (e.overdue?2:0);};
       return score(b)-score(a);
     });
     pool=core.filter(b=>b.skill===ids[0]);reason='Strengthen '+skills[ids[0]].label.toLowerCase()+' with independent practice.';
   }
 }
 if(session?.focusSkill && mode!=='diagnostic'){
   const focused=bank.filter(b=>b.skill===session.focusSkill&&!b.repairOnly&&!blockedIds.has(b.id)&&(!b.stretch||mode==='stretch'));
   if(!focused.length&&mode!=='diagnostic'){const gate=blocked.find(b=>b.skill===session.focusSkill);if(gate)return {...root.MochiRepair.conceptGuard(gate),kind:mode||'daily'};}
   if(focused.length){pool=focused;reason='A focused session on '+skills[session.focusSkill].label.toLowerCase()+'.';}
 }
 if(mode!=='diagnostic')pool=pool.filter(b=>!blockedIds.has(b.id));
 if(!pool.length)pool=core;
 if(!pool.length&&blocked.length)return {...root.MochiRepair.conceptGuard(blocked[0]),kind:mode||'daily'};
 const freshForm=pool.filter(b=>{const band=root.MochiReasoning?.band(l,b.skill);return !band?.provisional||b.id!==band.excludeGenerator;});
 if(freshForm.length)pool=freshForm;
 // Pick the nearest available tier within each selected skill; gaps do not reopen the whole bank.
 const distance=b=>Math.abs(b.difficulty-(root.MochiReasoning?.band(l,b.skill).target||1));
 pool=pool.filter(b=>distance(b)===Math.min(...pool.filter(x=>x.skill===b.skill).map(distance)));
 const unseen=pool.filter(b=>!l.attempts.slice(-6).some(a=>a.generator===b.id));
 if(unseen.length) pool=unseen;
 const item=pool[Math.floor(Math.random()*pool.length)];
 return {...item,reason,transfer,kind:mode||'daily'};
}
function start(l,mode){
 const total=mode==='diagnostic'?Object.values(skills).filter(s=>!s.stretch).length:mode==='sprint'?10:8;
 l.mode=mode;l.session={mode,started:Date.now(),done:0,total,finished:false};
}
function summary(l){return Object.entries(skills).map(([id,s])=>({id,label:s.label,...evidence(l,id)}));}
function backup(l){return {app:'Mochi learning',version:1,exported:new Date().toISOString(),learning:JSON.parse(JSON.stringify(l))};}
function restore(input){
 if(input?.app!=='Mochi learning'||input.version!==1||!input.learning||!Array.isArray(input.learning.attempts)||input.learning.attempts.length>5000) throw Error('This is not a Mochi learning backup.');
 const src=input.learning,l=fresh();
 const modes=['diagnostic','daily','review','stretch','sprint'];l.mode=modes.includes(src.mode)?src.mode:'daily';
 if(/^\d{4}-(0[1-9]|1[0-2])$/.test(src.goalMonth)) l.goalMonth=src.goalMonth;
 for(const a of src.attempts){
   if(!a || !Object.hasOwn(skills,a.skill)||typeof a.at!=='number'||!Number.isFinite(a.at)||a.at<0||a.at>8640000000000000) throw Error('Invalid attempt in backup.');
   record(l,{id:String(a.id).slice(0,120),skill:a.skill,generator:String(a.generator).slice(0,80),difficulty:Number.isInteger(a.difficulty)&&a.difficulty>=1&&a.difficulty<=5?a.difficulty:null,at:a.at,answeredAt:Number.isFinite(a.answeredAt)&&a.answeredAt>0&&a.answeredAt<8640000000000000?a.answeredAt:a.at,kind:modes.includes(a.kind)?a.kind:'daily',skipped:a.skipped===true,firstCorrect:a.firstCorrect===true,correct:a.correct===true,hints:Math.max(0,Number(a.hints)||0),revealed:a.revealed===true,model:a.model===true,confidence:['guess','unsure','sure'].includes(a.confidence)?a.confidence:'unsure',plan:String(a.plan||'').slice(0,1200),reflection:String(a.reflection||'').slice(0,1200),question:String(a.question||'').slice(0,3000),response:String(a.response||'').slice(0,500),obstacle:String(a.obstacle||'').slice(0,100),transfer:a.transfer===true,seconds:Math.max(0,Number(a.seconds)||0),tries:Math.max(1,Number(a.tries)||1),repair:root.MochiRepair?.clean(a.repair)||null,...(root.MochiReasoning?root.MochiReasoning.cleanExtras(a):{})});
 }
 l.notes=(Array.isArray(src.notes)?src.notes:[]).slice(-200).map(n=>({at:Number(n.at)||0,question:String(n.question||'').slice(0,3000),text:String(n.text||'').slice(0,2000)}));
 l.benchmarks=(Array.isArray(src.benchmarks)?src.benchmarks:[]).slice(-50).filter(b=>b&&typeof b.name==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(b.date)).map(b=>({name:b.name.slice(0,160),date:b.date,note:String(b.note||'').slice(0,1000),percentile:typeof b.percentile==='number'&&Number.isFinite(b.percentile)&&b.percentile>=0&&b.percentile<=100?b.percentile:null}));
 return l;
}
root.MochiLearning={tutorLanguage,skills,mapping,fresh,init,evidence,record,catalog,choose,start,summary,backup,restore};
if(typeof module!=='undefined') module.exports=root.MochiLearning;
})(typeof globalThis!=='undefined'?globalThis:this);
