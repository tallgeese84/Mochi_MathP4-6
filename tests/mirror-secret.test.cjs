const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {JSDOM}=require('jsdom');
function setup(writeText){
 const dom=new JSDOM('<p id="backupStatus"></p>',{url:'https://mochi.test/',runScripts:'outside-only'}),w=dom.window;
 w.MochiReady=true;w.save=async()=>{};
 w.localStorage.setItem('mochi_drive_mirror_secret_v1','test-only-synthetic-secret-123456');
 Object.defineProperty(w.navigator,'clipboard',{value:writeText?{writeText}:undefined});
 w.eval(fs.readFileSync(require.resolve('../drive-mirror.js'),'utf8'));
 return{w,dom,input:w.document.getElementById('driveMirrorSecret'),button:id=>w.document.getElementById(id)};
}
test('show/hide preserves the existing secret; Copy uses its actual masked value',async()=>{
 let copied;const a=setup(async value=>{copied=value;});
 try{
  const original=a.input.value;assert.equal(a.input.type,'password');
  a.button('driveMirrorShow').click();assert.equal(a.input.type,'text');assert.equal(a.input.value,original);
  a.button('driveMirrorShow').click();assert.equal(a.input.type,'password');
  await a.button('driveMirrorCopy').onclick();assert.equal(copied,original);assert.equal(a.input.type,'password');
  assert.match(a.button('driveMirrorStatus').textContent,/Secret copied/);
  assert.ok(!a.button('driveMirrorStatus').textContent.includes(original));
 }finally{a.dom.window.close();}
});
test('denied or missing clipboard reveals and selects for manual copy without false success',async()=>{
 for(const clipboard of [undefined,async()=>{throw Error('Not allowed');}]){
  const a=setup(clipboard);
  try{
   await a.button('driveMirrorCopy').onclick();assert.equal(a.input.type,'text');
   assert.equal(a.input.selectionStart,0);assert.equal(a.input.selectionEnd,a.input.value.length);
   assert.match(a.button('driveMirrorStatus').textContent,/blocked/);
   assert.doesNotMatch(a.button('driveMirrorStatus').textContent,/Secret copied/);
  }finally{a.dom.window.close();}
 }
});
