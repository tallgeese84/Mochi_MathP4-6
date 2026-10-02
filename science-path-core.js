/* Science uses separate records, tests and thresholds; earlier choice scores are not mastery. */
(function(root){
'use strict';
const core=root.MochiPathCore||(typeof require==='function'?require('./path-core.js'):null);
const D=root.MochiSciencePathData||(typeof require==='function'?require('./science-path-data.js'):null);
const B=root.MochiSciencePathBank||(typeof require==='function'?require('./science-path-bank.js'):null);
function bridge(s,d){
 const mapping={circuits:'circuits',shadows:'light',heat:'heat',plants:'plants',body:'transport',ecosystems:'ecology',matter:'matter',forces:'forces'},groups=new Map();
 for(const a of s.science?.attempts||[]){const id=mapping[a.skill];if(!id)continue;if(!groups.has(id))groups.set(id,[]);groups.get(id).push(a);}
 return [...groups].filter(([id,a])=>!d.lessons[id]?.completedAt&&a.length>=2&&a.slice(-2).every(x=>!x.firstCorrect||x.concept&&!x.concept.firstCorrect||x.explanationFlag)).map(([unit,a])=>({unit,at:a.at(-1).answeredAt||a.at(-1).at})).filter(x=>!d.lessons[x.unit]?.lastViewedAt||d.lessons[x.unit].lastViewedAt<x.at).sort((a,b)=>b.at-a.at)[0]||null;
}
// Existing papers are frozen: the original 24 units, generated at bank revision 1.
const paperDefinitions=[
 {id:'baseline-a',kind:'baseline',rev:1,title:'Science starting-point check · A',minutes:0,units:['fairtest','graphs','circuits','heat','plants','matter']},
 {id:'baseline-b',kind:'baseline',rev:1,title:'Science starting-point check · B',minutes:0,units:['measurement','models','forces','respiration','ecology','water']},
 ...['A','B','C'].map(letter=>({id:'mixed-'+letter.toLowerCase(),kind:'paper',rev:1,title:'Science reasoning paper '+letter,minutes:60,units:(D.originalUnits||D.units.map(u=>u.id)).slice()})),
 // DSA-style science mocks: every unit, including the lower-secondary ones, in 70 minutes with no topic labels.
 ...[24,16,9,4].map((weeks,k)=>{const ids=D.units.map(u=>u.id),order=ids.map(id=>[parseInt(B.hash('sci-mock-'+k+':'+id),36),id]).sort((a,b)=>a[0]-b[0]).map(x=>x[1]);return {id:'mock-'+(k+1),kind:'mock',rev:2,title:'DSA-style science mock '+(k+1),minutes:70,weeks,units:order,marks:order.map(()=>1)};})
];
root.MochiSciencePath=core.create(D,B,{stateKey:'sciencePath',writingReview:true,noRepeatCredit:true,mixedLegacyRev:2,prefix:'science-path-',fingerprintPrefix:'sp-paper-v1:',paperDefinitions,bridge,limits:[
 'Official DSA guidance supplies broad aims, not a released science test blueprint.',
 'NUS High SPSO samples are supplementary references and are explicitly separate from DSA.',
 'These original questions and 60-minute practice limits are not calibrated entrance-test equivalents.',
 '85% is an internal training aspiration, not an admissions cutoff or probability.',
 'Correct conclusions and structured reasons are marked separately; free text and handwriting require adult review.',
 'External results and explanation reviews are parent-reported evidence.'
]});
const E=root.MochiSciencePath,Practice=root.MochiSciencePractice||(typeof require==='function'?require('./science-practice.js'):null),normal=E.recommend;
E.recommend=(s,now=Date.now())=>Practice.route(E,s,normal(s,now),now);
E.practiceRoute=(s,id,phase,now=Date.now())=>phase?{kind:'practice',unit:id,phase}:Practice.route(E,s,{kind:'practice',unit:id},now,true);
if(typeof module!=='undefined')module.exports=root.MochiSciencePath;
})(typeof globalThis!=='undefined'?globalThis:this);
