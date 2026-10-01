const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
globalThis.window=globalThis;
require('../entrance-data.js');require('../entrance-figures.js');const B=require('../entrance-bank.js'),M=require('../bar-models.js');
const bank=globalThis.MochiEntranceBank||B;
test('bar models are drawn for sum/difference and ratio worked examples',()=>{
 for(const [unit,form] of [['relationships',1],['ratios',0],['ratios',2]])for(let seed=1;seed<40;seed++){
  const q=bank.make(unit,form,seed),svg=M.model(q);
  assert.match(svg,/<svg[^>]*role="img"/,`${unit}/${form}`);
  assert.ok(!svg.includes(String(q.answerLabel)+'<')||unit!=='relationships','the bar model must not print the answer');
  for(const m of svg.matchAll(/x="(-?[\d.]+)"/g))assert.ok(+m[1]<=480,`${unit}/${form} drawn outside the frame`);
  for(const m of svg.matchAll(/<text x="([\d.]+)"[^>]*>([^<]*)<\/text>/g)){const anchorMid=/text-anchor="middle"/.test(m[0]),w=m[2].length*7.5;assert.ok((anchorMid?+m[1]+w/2:+m[1]+w)<=480,`${unit}/${form} label "${m[2]}" runs off the frame`);}
 }
});
test('bar models never change question data or fingerprints',()=>{
 const q=bank.make('relationships',1,7),before=JSON.stringify(q);M.model(q);assert.equal(JSON.stringify(q),before);assert.equal(q.figure,undefined);
});
test('independent questions and papers never render a bar model',()=>{
 const ui=fs.readFileSync(path.join(__dirname,'..','entrance-ui.js'),'utf8');
 const uses=[...ui.matchAll(/MochiBarModels\?\.(model|lessonModel)/g)].length;
 assert.equal(uses,3,'only worked example, revealed solution and lesson page');
 assert.match(ui,/v\.revealed\?`\$\{\(root\.MochiBarModels/);
});
