/* Maths wrapper for the shared, subject-isolated pathway engine. */
(function(root){
'use strict';
const core=root.MochiPathCore||(typeof require==='function'?require('./path-core.js'):null);
const D=root.MochiEntranceData||(typeof require==='function'?require('./entrance-data.js'):null);
const B=root.MochiEntranceBank||(typeof require==='function'?require('./entrance-bank.js'):null);
// Maths asks for a one-line plan before checking a new-twist or mixed-set question.
const E=core.create(D,B,{requireMethod:true,completionSupport:true,safeReview:true,mockRevision:2,mixedLegacyRev:2,extraPapers:(root.MochiHCISPrep||(typeof require==='function'?require('./hcis-prep.js'):null))?.papers()||[],mixReady:(d,id,now)=>!G?.prerequisite(E,d,id,now)}),G=root.MochiGeometryBridge||(typeof require==='function'?require('./geometry-bridge.js'):null),normal=E.recommend;
const PB=root.MochiPaperPractice||(typeof require==='function'?require('./paper-practice.js'):null);
const H=root.MochiHCISPrep||(typeof require==='function'?require('./hcis-prep.js'):null);
E.paperPracticeReport=(d,now=Date.now())=>PB.report(E,d,now);
E.prerequisite=(d,id,now=Date.now())=>G?.prerequisite(E,d,id,now)||null;
E.recommend=(s,now=Date.now())=>{
 const r=normal(s,now),d=E.init(s);if(['paper','resume','recall','mixed-set','redo'].includes(r.kind))return r;
 const focus=G?.focus(s,E,now);if(focus)return focus;
 const needed=r.unit&&E.prerequisite(d,r.unit,now);if(!needed)return PB.extensionRecommendation(E,d,r,now);
 const e=E.evidence(d,needed,now);return {kind:!e.taught||e.needsTeaching?'learn':'practice',unit:needed,geometryBridge:true,reason:'Build the geometric relationship before more complex solids.'};
};
const routed=E.recommend;E.recommend=(s,now=Date.now())=>E.avoidRepeat(s,routed(s,now),now);
E.practiceRoute=(s,id,phase,now=Date.now())=>E.avoidRepeat(s,{kind:'practice',unit:id,...(phase?{phase}:{})},now);
E.hcisReport=(d,now=Date.now())=>H?.report(E,d,now);
E.hcisRecommendation=(d,now=Date.now())=>H?.recommend(E,d,now);
E.hcisSchedule=(d,now=Date.now())=>H?.papers().map(p=>({id:p.id,date:p.date,status:d.papers?.[p.id]?.submittedAt?'done':d.papers?.[p.id]?'started':Date.parse(p.date+'T00:00:00Z')<=now?'due':'upcoming'}))||[];
E.dueHCIS=(d,now=Date.now())=>E.hcisSchedule(d,now).find(x=>x.status==='due')||null;
root.MochiEntrance=E;
if(typeof module!=='undefined')module.exports=root.MochiEntrance;
})(typeof globalThis!=='undefined'?globalThis:this);
