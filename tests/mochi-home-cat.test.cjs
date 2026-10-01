const test=require('node:test'),assert=require('node:assert/strict');
const F=require('../cat-friends-core.js');
async function load(){return {T:await import('../vendor/three-r180/three.module.js'),C:await import('../mochi-home-cat.js')};}
const meshes=c=>{let n=0;c.group.traverse(o=>{if(o.isMesh)n++;});return n;};
test('Mochi is a Maine Coon: a bigger, longer cat with lynx-tipped ears, a mane and a plume of a tail',async()=>{
 const {T,C}=await load();const mochi=C.buildCat(T,null),round=C.buildCat(T,F.catalog.find(c=>c.shape==='round'));
 assert.equal(mochi.palette.shape,'coon');
 assert.ok(mochi.parts.bodyLen>round.parts.bodyLen*1.15,'longer body');assert.ok(mochi.parts.height>round.parts.height,'taller');
 assert.ok(mochi.parts.ears.every(e=>e.children.some(o=>o.name==='fur')),'both ears have lynx tips');
 const tailBase=mochi.parts.tail[0].children[0].geometry.parameters.radius,roundTail=round.parts.tail[0].children[0].geometry.parameters.radius;
 assert.ok(tailBase>roundTail*1.5,'bushy tail');
 const kumo=C.buildCat(T,F.catalog.find(c=>c.id==='kumo'));assert.ok(kumo.parts.ears.every(e=>e.children.some(o=>o.name==='fur')),'Kumo, the Maine Coon friend, shares the look');
 [mochi,round,kumo].forEach(c=>c.dispose());
});
test('long fur stays cheap to draw on a tablet',async()=>{
 const {T,C}=await load();
 for(const lite of [false,true]){const c=C.buildCat(T,null,{lite});assert.ok(meshes(c)<=(lite?54:60),`${lite?'lite':'full'} Mochi uses ${meshes(c)} meshes`);c.dispose();}
});
test('long fur hangs down when Mochi sits, so it never looks like extra paws',async()=>{
 const {T,C}=await load();const c=C.buildCat(T,null);c.setPose({sit:1});c.update(1/30,true);
 const fringe=c.parts.body.children.find(o=>o.isGroup&&o.children.some(m=>m.name==='fur')&&o.scale.x<1);
 assert.ok(fringe,'the bib fringe tucks away');
 const w=new T.Quaternion();fringe.getWorldQuaternion(w);const down=new T.Vector3(0,-1,0).applyQuaternion(w);
 assert.ok(down.y<-.98,'and still points at the floor');c.dispose();
});
