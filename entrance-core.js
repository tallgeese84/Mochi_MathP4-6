/* Maths wrapper for the shared, subject-isolated pathway engine. */
(function(root){
'use strict';
const core=root.MochiPathCore||(typeof require==='function'?require('./path-core.js'):null);
const D=root.MochiEntranceData||(typeof require==='function'?require('./entrance-data.js'):null);
const B=root.MochiEntranceBank||(typeof require==='function'?require('./entrance-bank.js'):null);
root.MochiEntrance=core.create(D,B);
if(typeof module!=='undefined')module.exports=root.MochiEntrance;
})(typeof globalThis!=='undefined'?globalThis:this);
