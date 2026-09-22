const fs=require('node:fs'),path=require('node:path');
const dir=path.join(__dirname,'../course'),meta=JSON.parse(fs.readFileSync(path.join(dir,'catalog.json')));
const units=meta.units.map(u=>{const text=fs.readFileSync(path.join(dir,'lessons',u.id+'.md'),'utf8');const pages=text.split(/^## /m).slice(1).map(p=>{const n=p.indexOf('\n');return{title:p.slice(0,n).trim(),text:p.slice(n+1).trim()};});if(pages.length<6)throw Error('Too few teaching sections: '+u.id);return{...u,pages};});
const bank=JSON.parse(fs.readFileSync(path.join(dir,'questions.json'))).map(q=>{
 let seed=2166136261;for(const c of q.id)seed=Math.imul(seed^c.charCodeAt(0),16777619)>>>0;
 const order=q.choices.map((_,i)=>i);for(let i=order.length-1;i>0;i--){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;const j=(seed>>>0)%(i+1);[order[i],order[j]]=[order[j],order[i]];}
 return {...q,choices:order.map(i=>q.choices[i]),answer:order.indexOf(q.answer)};
});
for(const u of units)if(bank.filter(q=>q.unit===u.id).length<6)throw Error('Missing checks: '+u.id);
const output='/* Original authored course; rebuild with node scripts/build-course.cjs. */\n(function(root){\nconst data='+JSON.stringify({version:1,reviewedOn:'2026-09-22',sources:meta.sources,units,questions:bank})+';\nroot.MochiCourseData=data;if(typeof module!=="undefined")module.exports=data;\n})(typeof globalThis!=="undefined"?globalThis:this);\n';
const target=path.join(dir,'../course-data.js');if(process.argv.includes('--check')){if(fs.readFileSync(target,'utf8')!==output)throw Error('Course needs rebuilding');}else fs.writeFileSync(target,output);
console.log(`${units.length} units, ${units.reduce((n,u)=>n+u.pages.length,0)} teaching sections, ${bank.length} checks, ${units.reduce((n,u)=>n+u.pages.map(p=>p.text).join(' ').split(/\s+/).length,0)} teaching words`);
