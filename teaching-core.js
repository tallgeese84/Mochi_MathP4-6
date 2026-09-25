/* Teaching interventions and linked observations. No network, learner data or grade predictions. */
(function(root){
'use strict';
const DAY=86400000;
const mathsUnits={number:'m-number',fraction:'m-fraction-ops',fractionProblem:'m-remainders',decimal:'m-decimals',ratio:'m-ratio',percent:'m-percent',rate:'m-rate',algebra:'m-algebra',measure:'m-measure',time:'m-time',area:'m-area',circle:'m-circles',volume:'m-volume',angle:'m-angles',spatial:'m-solids',model:'m-modelling',data:'m-data',inquiry:'m-proof'};
const scienceUnits={circuits:'s-electricity',shadows:'s-light',ecosystems:'s-ecosystems',heat:'s-heat',plants:'s-photosynthesis',matter:'s-matter',body:'s-body',forces:'s-forces'};
const lessons={
 gstDirection:{unit:'m-percent',subject:'maths',skill:'percent',title:'GST adds; a discount subtracts',pages:[
  {title:'Predict the direction first',text:'The price before tax is the original whole: 100%. GST is added to that price, so the final price must be greater. A discount removes part of the original price, so the sale price must be smaller.'},
  {title:'Keep the same reference whole',text:'For a price of $100, a stated 9% GST adds $9: $100 + $9 = $109. A 9% discount removes $9: $100 − $9 = $91. Both percentages are of the same original $100. The direction, not the percentage calculation, changes.',visual:'tax'},
  {title:'Check before calculating',text:'First decide whether the price should rise or fall. Then find the percentage of the original price and add it for tax, or subtract it for a discount. When the explanation closes, try a fresh check. Use the tax rate stated in each question.'}
 ]},
 cubeEdge:{unit:'m-volume',subject:'maths',skill:'volume',title:'A cube is made of equal square layers',pages:[
  {title:'Build a small cube',text:'A cube with an edge of 2 cm has 2 unit cubes along each edge. One layer has 2 × 2 = 4 unit cubes. Two layers have 4 × 2 = 8 unit cubes, so its volume is 8 cm³.',visual:'cube2'},
  {title:'Three dimensions multiply',text:'An edge of 3 cm gives 3 × 3 unit cubes in each layer and 3 layers: 3 × 3 × 3 = 27 cm³. The three dimensions multiply. They are not three equal shares of the volume.',visual:'cube3'},
  {title:'Work backwards and check',text:'For a cube with volume 27 cm³, find the edge that gives that volume when multiplied by itself three times. 3 × 3 × 3 = 27, so the edge is 3 cm. Dividing 27 by 3 gives 9, but 9 × 9 × 9 = 729, not 27. Always multiply your proposed edge three times to check.'}
 ]},
 circuits:{unit:'s-electricity',subject:'science',skill:'circuits',title:'Trace the complete conducting path',pages:[
  {title:'An open switch breaks the path',text:'A simple battery circuit needs a complete conducting path from one terminal, through the bulb, to the other terminal. An open switch breaks that path. Current does not leak out of the gap; it cannot flow around this incomplete circuit.',visual:'circuit'},
  {title:'One path or separate branches?',text:'In a series circuit, both bulbs are on the same path. A break anywhere on that path stops current through both bulbs. In a parallel circuit, each branch can form its own complete path through the battery. A break in one branch need not break the other.',visual:'branches'},
  {title:'Predict, then explain',text:'Trace the remaining path before predicting whether a bulb stays lit. For the ideal-battery model used here, an unchanged parallel branch keeps the same brightness when the other branch is opened. Current does not have to flood into the remaining bulb. Real batteries can behave differently; use the assumptions given in the question.'}
 ]}
};
function lesson(key,data){
 if(Object.hasOwn(lessons,key))return lessons[key];
 if(!/^skill:[A-Za-z]+$/.test(String(key)))return null;
 const skill=key.slice(6),u=data?.units?.find(u=>u.id===mathsUnits[skill]);
 return u?{unit:u.id,subject:'maths',skill,title:u.title,pages:u.pages.slice(1,3)}:null;
}
function unitFor(subject,skill){return (subject==='maths'?mathsUnits:scienceUnits)[skill]||'';}
function cleanGate(x){return x&&Object.hasOwn(mathsUnits,x.skill)&&typeof x.generator==='string'&&/^[A-Za-z][A-Za-z0-9]*$/.test(x.generator)&&Number.isFinite(x.triggerAt)&&x.triggerAt>=0?{skill:x.skill,generator:x.generator.slice(0,80),triggerAt:x.triggerAt}:null;}
function independent(a){return !!(a.correct&&a.firstCorrect&&!a.skipped&&!a.hints&&!a.model&&!a.revealed&&a.confidence!=='guess'&&a.kind!=='custom');}
function blocked(l){
 const all=(l?.attempts||[]).filter(a=>!a.skipped&&a.kind!=='custom'&&!a.conceptGate&&!a.repair);
 const out=[];
 for(const generator of new Set(all.map(a=>a.generator))){
  const pair=all.filter(a=>a.generator===generator).slice(-2);
  if(pair.length!==2||!pair.every(a=>a.firstCorrect===false))continue;
  const last=pair[1];if(!Object.hasOwn(mathsUnits,last.skill))continue;
  const gate={skill:last.skill,generator,triggerAt:last.at};
  const passed=(l.attempts||[]).some(a=>a.at>=last.at&&independent(a)&&((a.conceptGate?.generator===generator&&a.conceptGate.triggerAt>=last.at)||(a.repair?.stage===0&&root.MochiRepair?.tracks[a.repair.key]?.sources.includes(generator))));
  if(!passed)out.push(gate);
 }
 return out.sort((a,b)=>b.triggerAt-a.triggerAt);
}
function cleanContext(x,data){
 const u=data?.units?.find(u=>u.id===x?.unit);
 return u&&Number.isFinite(x.started)&&x.started>0?{unit:u.id,subject:u.subject,skill:u.skill,started:x.started,lessonKey:lesson(x.lessonKey,data)?String(x.lessonKey):''}:null;
}
function cleanLink(a,data){
 if(a?.source!=='practice-link'||typeof a.id!=='string'||!Number.isFinite(a.at)||a.at<=0)return null;
 const u=data.units.find(u=>u.id===a.unit);if(!u||!['exit','practice','transfer','delayed'].includes(a.phase))return null;
 const x={source:'practice-link',id:a.id.slice(0,140),originalId:String(a.originalId||'').slice(0,120),unit:u.id,subject:u.subject,at:a.at,answeredAt:Number(a.answeredAt)||a.at,question:String(a.question||'').slice(0,3000),form:String(a.form||'').slice(0,100),level:Number(a.level)||1,phase:a.phase,lessonKey:lesson(a.lessonKey,data)?a.lessonKey:'',correct:a.correct===true,firstCorrect:a.firstCorrect===true,helped:!!a.helped,guess:!!a.guess,repeated:!!a.repeated,reasoningChecked:!!a.reasoningChecked,reasoningFlag:!!a.reasoningFlag,response:String(a.response||'').slice(0,1000),explanation:String(a.explanation||'').slice(0,6000),responses:[],lessonCompletedAt:Number(a.lessonCompletedAt)||0};
 x.independent=x.correct&&x.firstCorrect&&!x.helped&&!x.guess&&(x.subject!=='science'||x.reasoningChecked&&!x.reasoningFlag&&!x.repeated);return x;
}
function storeLink(c,a,data){
 const x=cleanLink(a,data);if(!x)return null;const index=c.attempts.findIndex(v=>v.id===x.id),old=c.attempts[index];
 if(old){x.firstCorrect=x.firstCorrect&&old.firstCorrect;x.helped=x.helped||old.helped;x.guess=x.guess||old.guess;x.reasoningFlag=x.reasoningFlag||old.reasoningFlag;}
 const result=cleanLink(x,data);if(index<0)c.attempts.push(result);else c.attempts[index]=result;c.attempts=c.attempts.slice(-3000);return result;
}
function link(c,a,subject,data){
 if(!a||a.skipped||a.kind==='custom')return null;
 const key=a.teachingKey||(a.conceptGate?'skill:'+a.skill:''),mini=lesson(key,data),context=cleanContext(c.practiceContext,data);
 const wanted=mini?.unit||(context?.subject===subject&&context.skill===(subject==='science'?({circuits:'electricity',shadows:'light',ecosystems:'ecology'}[a.skill]||a.skill):a.skill)&&a.at>=context.started?context.unit:'');
 if(!wanted)return null;
 const phase=a.repair?['exit','practice','transfer','delayed'][a.repair.stage]:a.conceptGate?'exit':a.phase||(a.lessonCompletedAt?'exit':'practice');
 return storeLink(c,{source:'practice-link',id:'link:'+subject+':'+a.id,originalId:a.id,unit:wanted,at:a.at,answeredAt:a.answeredAt||a.at,question:a.question||a.prompt||'',form:a.generator||a.item||'',level:a.difficulty||a.level||1,phase,lessonKey:key||context?.lessonKey||'',correct:a.correct,firstCorrect:a.firstCorrect,helped:subject==='science'?a.helped:!!(a.hints||a.model||a.revealed),guess:subject==='science'?a.guess:a.confidence==='guess',repeated:a.repeated,reasoningChecked:!!(a.concept?.correct&&a.concept.firstCorrect),reasoningFlag:!!a.explanationFlag,response:a.response??String(a.choice??''),explanation:a.explanation||a.plan||'',lessonCompletedAt:a.lessonCompletedAt||(context?.lessonKey?context.started:0)||0},data);
}
function linkedReport(c){const a=(c.attempts||[]).filter(a=>a.source==='practice-link');return {recorded:a.length,exit:a.filter(a=>a.phase==='exit').length,practice:a.filter(a=>a.phase==='practice').length,transfer:a.filter(a=>a.phase==='transfer').length,delayed:a.filter(a=>a.phase==='delayed').length,independent:a.filter(a=>a.independent).length,limits:'Linked records duplicate the original subject attempt for lesson-outcome analysis; do not add them to the subject question total or infer causation from before/after results.'};}
root.MochiTeaching={DAY,lessons,lesson,unitFor,cleanGate,independent,blocked,cleanContext,cleanLink,storeLink,link,linkedReport};
if(typeof module!=='undefined')module.exports=root.MochiTeaching;
})(typeof globalThis!=='undefined'?globalThis:this);
