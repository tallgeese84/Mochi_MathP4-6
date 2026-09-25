// Keep room and avatar SVG files in lockstep with the shared Cat Friends renderer.
const fs=require('node:fs'),path=require('node:path'),P=require('../cat-portraits.js');
for(const [name,avatar] of [['mochi-flat.svg',false],['mochi-flat-avatar.svg',true]]){
 const target=path.join(__dirname,'..',name),expected=P.documentSVG(avatar);
 if(process.argv.includes('--check')){
  if(!fs.existsSync(target)||fs.readFileSync(target,'utf8')!==expected)throw Error('Run node scripts/build-cat-portraits.cjs: '+name);
 }else fs.writeFileSync(target,expected);
}
// Inline the same renderer at build time; no extra runtime dependency can hide friends.
const ui=path.join(__dirname,'..','cat-friends-ui.js'),before=fs.readFileSync(ui,'utf8');
const portrait=P.svg.toString().replace('function svg(cat=mochi)', 'function portrait(cat)');
const block='/* GENERATED PORTRAIT START */\n'+portrait+'\n/* GENERATED PORTRAIT END */';
if(!before.includes('/* GENERATED PORTRAIT START */'))throw Error('Missing generated portrait markers');
const after=before.replace(/\/\* GENERATED PORTRAIT START \*\/[\s\S]*?\/\* GENERATED PORTRAIT END \*\//,block);
if(process.argv.includes('--check')){if(before!==after)throw Error('Cat Friends portrait renderer is stale');}
else fs.writeFileSync(ui,after);
console.log('Mochi and Cat Friends portraits match the shared flat renderer.');
