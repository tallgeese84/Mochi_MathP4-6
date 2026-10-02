/* Maths wrapper for the shared, subject-isolated pathway engine. */
(function(root){
'use strict';
const core=root.MochiPathCore||(typeof require==='function'?require('./path-core.js'):null);
const D=root.MochiEntranceData||(typeof require==='function'?require('./entrance-data.js'):null);
const B=root.MochiEntranceBank||(typeof require==='function'?require('./entrance-bank.js'):null);
// Maths asks for a one-line plan before checking a new-twist or mixed-set question.
const E=core.create(D,B,{requireMethod:true,mockRevision:2,mixedLegacyRev:2,mixReady:(d,id,now)=>!G?.prerequisite(E,d,id,now)}),G=root.MochiGeometryBridge||(typeof require==='function'?require('./geometry-bridge.js'):null),normal=E.recommend;
const PB=root.MochiPaperPractice||(typeof require==='function'?require('./paper-practice.js'):null);
E.paperPracticeReport=(d,now=Date.now())=>PB.report(E,d,now);
E.prerequisite=(d,id,now=Date.now())=>G?.prerequisite(E,d,id,now)||null;
E.recommend=(s,now=Date.now())=>{
 const r=normal(s,now),d=E.init(s);if(['paper','resume','recall','mixed-set','redo'].includes(r.kind))return r;
 const focus=G?.focus(s,E,now);if(focus)return focus;
 const needed=r.unit&&E.prerequisite(d,r.unit,now);if(!needed)return PB.extensionRecommendation(E,d,r,now);
 const e=E.evidence(d,needed,now);return {kind:!e.taught||e.needsTeaching?'learn':'practice',unit:needed,geometryBridge:true,reason:'Build the geometric relationship before more complex solids.'};
};
root.MochiEntrance=E;
if(typeof module!=='undefined')module.exports=root.MochiEntrance;
})(typeof globalThis!=='undefined'?globalThis:this);
