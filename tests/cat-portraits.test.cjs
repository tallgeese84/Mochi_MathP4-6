const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const P=require('../cat-portraits.js'),F=require('../cat-friends-core.js'),harness=require('./harness.cjs');
const root=path.join(__dirname,'..');
const digest=s=>crypto.createHash('sha256').update(s.replace(/>\s+</g,'><').trim()).digest('hex');
// Previous approved friend portraits. Only the new Mochi portrait should change.
const approved={"miso":"6d55ed86fcdfe295c223fa3a1540f93f961a6dd45133c97a07f04f8113890713","suki":"fe3386f4388f2b03fb94dd46622db898b65a5efc3966dbb0b11fc2f8b8e60fc1","kumo":"f1fc1986e381b119aecfadc2f80e29a23b9fcd7136c65b931611597835f845f5","yuki":"600f63c5b0359d9ea51cc3b87dde868c34dc301085ea640e5d2dd24ff2501ccc"};
test('the four existing friends keep their exact approved shapes and palette',()=>{
 for(const cat of F.catalog)assert.equal(digest(P.svg(cat)),approved[cat.id]);
});
test('Mochi shares the friends eye and body geometry but keeps his tabby identity',()=>{
 const svg=P.svg(P.mochi),friend=P.svg(F.catalog[0]);
 assert.match(svg,/viewBox="0 0 120 120"/);assert.match(svg,/<g class="cf-eyes">/);
 assert.match(svg,/cx="60" cy="50" rx="42" ry="33"/);
 assert.match(svg,/#765743/);assert.match(svg,/#a9be76/);assert.match(svg,/#6298b6/);
 assert.equal((svg.match(/<ellipse/g)||[]).length>(friend.match(/<ellipse/g)||[]).length,true);
 assert.doesNotMatch(svg,/<image|<filter|<linearGradient|<radialGradient|<script/);
 assert.throws(()=>P.svg({...P.mochi,coat:'"><script>'}),/fixed cat palette/);
});
test('generated room and avatar SVGs cannot drift from the shared renderer',()=>{
 for(const [file,avatar]of [['mochi-flat.svg',false],['mochi-flat-avatar.svg',true]]){
  assert.equal(fs.readFileSync(path.join(root,file),'utf8'),P.documentSVG(avatar));
  assert.match(P.documentSVG(avatar),/xmlns="http:\/\/www.w3.org\/2000\/svg"/);
 }
});
test('room, tutor and background reference versioned, precached flat assets',()=>{
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8'),sw=fs.readFileSync(path.join(root,'sw.js'),'utf8'),v=require('../release.json').version;
 for(const id of ['catImg','roomImg'])assert.ok(html.match(new RegExp('id="'+id+'"[^>]+src="mochi-flat.svg\\?v='+v.replace(/\./g,'\\.')+'"')));
 assert.equal((html.match(/data-mochi-avatar src="mochi-flat-avatar.svg/g)||[]).length,2);
 assert.equal((html.match(/class="watermark-cat[^>]+src="mochi-flat-avatar.svg/g)||[]).length,2);
 for(const file of ['mochi-flat.svg','mochi-flat-avatar.svg'])assert.ok(sw.includes('./'+file+'?v='+v));
 assert.ok(!html.includes('src="cat-portraits.js'),'build-time sharing adds no runtime dependency');
 const ui=fs.readFileSync(path.join(root,'cat-friends-ui.js'),'utf8');
 assert.ok(ui.includes(P.svg.toString().replace('function svg(cat=mochi)','function portrait(cat)')));
 assert.doesNotMatch(html,/<img[^>]+src="(?:mochi-builtin|mochi-watermark)\.webp/);
});
test('older built-in references update but a saved custom photo remains deliberate',async()=>{
 const h=harness(),builtin=h.run('BUILTIN_PHOTO');
 for(const url of ['__builtin__','mochi-builtin.webp','./mochi-builtin.webp?v=5.5.0','mochi-flat.svg?v=5.5.1']){
  h.stored.set('cat-photo-v1',url);assert.equal(await h.run('loadPhoto()'),builtin);
 }
 const custom='data:image/png;base64,c3ludGhldGlj';h.stored.set('cat-photo-v1',custom);assert.equal(await h.run('loadPhoto()'),custom);
 const before=h.run('JSON.stringify(S)');h.run(`showPhoto(${JSON.stringify(custom)});`);
 assert.equal(h.nodes.get('roomImg').src,custom);assert.equal(h.nodes.get('stage').dataset.portrait,'custom');assert.equal(h.run('JSON.stringify(S)'),before);
 h.nodes.get('photoDefault').click();assert.equal(h.stored.get('cat-photo-v1'),'__builtin__');assert.equal(h.run('JSON.stringify(S)'),before);
});
test('neck accessories fit the new full-body portrait and custom-photo placement is retained',()=>{
 const h=harness();h.run("S.worn={neck:'bow',eyes:'specs'};$('stage').dataset.portrait='flat';paintAcc();");
 assert.match(h.nodes.get('accLayer').innerHTML,/translate\(0 -14\)/);
 h.run("$('stage').dataset.portrait='custom';paintAcc();");assert.doesNotMatch(h.nodes.get('accLayer').innerHTML,/translate\(0 -14\)/);
});
