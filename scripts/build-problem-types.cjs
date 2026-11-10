// Catalog of Euna's Maths problem types for the nightly reviewer (v7.10).
// A practice step may name `form` (1 = standard method, 2 = harder paper-style type) and, for form 2,
// one `structure` listed here. Regenerate with `node scripts/build-problem-types.cjs`; the tests reject drift.
const fs=require('node:fs'),path=require('node:path');
globalThis.window=globalThis;
const E=require('../entrance-core.js'),P=require('../tutor-pilot-core.js');
const units=E.D.units.filter(u=>!u.hcis).map(u=>{
 const forms={};
 for(const form of [1,2]){
  const types=new Map();
  for(let i=0;i<160;i++){const q=E.B.make(u.id,form,(i*2654435761+7)>>>0,E.REV),key=q.structure||'';if(!types.has(key))types.set(key,{structure:key,sample:q.text.length>170?q.text.slice(0,167)+'…':q.text,skill:P.spec('maths',q)?.label||''});}
  forms[form]=[...types.values()].sort((a,b)=>a.structure.localeCompare(b.structure)).map(t=>({...(t.structure?{structure:t.structure}:{}),sample:t.sample,...(t.skill?{skill:t.skill}:{})}));
 }
 return {unit:u.id,title:u.title,forms};
});
const out=JSON.stringify({student:'Euna',subject:'maths',bankRevision:E.REV,note:'Optional nightly-plan fields: practice steps may add "form" (1 or 2) and, with form 2, one "structure" below. Omit both to let the app choose the type from her latest miss.',units},null,1)+'\n';
const target=path.join(__dirname,'..','tools','euna-problem-types.json');
if(process.argv.includes('--check')){if(!fs.existsSync(target)||fs.readFileSync(target,'utf8')!==out)throw Error('Problem-type catalog needs rebuilding');}
else fs.writeFileSync(target,out);
console.log(`${units.length} units, ${units.reduce((n,u)=>n+u.forms[1].length+u.forms[2].length,0)} problem types`);
