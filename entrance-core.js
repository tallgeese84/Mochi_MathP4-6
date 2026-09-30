/* Maths wrapper for the shared, subject-isolated pathway engine. */
(function(root){
'use strict';
const core=root.MochiPathCore||(typeof require==='function'?require('./path-core.js'):null);
const D=root.MochiEntranceData||(typeof require==='function'?require('./entrance-data.js'):null);
const B=root.MochiEntranceBank||(typeof require==='function'?require('./entrance-bank.js'):null);
const E=core.create(D,B),G=root.MochiGeometryBridge||(typeof require==='function'?require('./geometry-bridge.js'):null),normal=E.recommend;
E.prerequisite=(d,id,now=Date.now())=>G?.prerequisite(E,d,id,now)||null;
E.recommend=(s,now=Date.now())=>{
 const r=normal(s,now),d=E.init(s);if(['paper','resume','recall'].includes(r.kind))return r;
 const focus=G?.focus(s,E,now);if(focus)return focus;
 const needed=r.unit&&E.prerequisite(d,r.unit,now);if(!needed)return r;
 const e=E.evidence(d,needed,now);return {kind:!e.taught||e.needsTeaching?'learn':'practice',unit:needed,geometryBridge:true,reason:'Build the geometric relationship before more complex solids.'};
};
root.MochiEntrance=E;
if(typeof module!=='undefined')module.exports=root.MochiEntrance;
})(typeof globalThis!=='undefined'?globalThis:this);
