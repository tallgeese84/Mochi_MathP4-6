// v7.4 delight: the Today greeting mounts and cleans up, celebrations are tied to earned moments,
// and the skill map remembers rings so new progress fills in.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
test('the Mochi greeting mounts, follows the finger and cleans up after itself',async()=>{
 const {JSDOM}=require('jsdom');const dom=new JSDOM('<!doctype html><div id="h"></div>');
 const keep={window:globalThis.window,document:globalThis.document,performance:globalThis.performance,requestAnimationFrame:globalThis.requestAnimationFrame,cancelAnimationFrame:globalThis.cancelAnimationFrame};
 globalThis.window=dom.window;globalThis.document=dom.window.document;let frames=[];globalThis.requestAnimationFrame=f=>{frames.push(f);return frames.length;};globalThis.cancelAnimationFrame=()=>{};
 try{
  const T0=await import('../vendor/three-r180/three.module.js'),cat=await import('../mochi-home-cat.js');
  class FakeRenderer{constructor({canvas}){this.domElement=canvas;this.renders=0;}setPixelRatio(){}setClearColor(){}setSize(){}render(){this.renders++;}dispose(){this.disposed=true;}}
  let made;const T={...T0,WebGLRenderer:class extends FakeRenderer{constructor(o){super(o);made=this;}}};
  const {mountGreeting}=await import('../mochi-greet.js');const host=document.getElementById('h');host.getBoundingClientRect=()=>({left:0,top:0,width:170,height:170});
  const api=await mountGreeting(host,{growth:2,three:T,catModule:cat});
  assert.ok(host.querySelector('canvas'));assert.ok(host.classList.contains('mochi-greet-ready'));
  let t=0;for(let i=0;i<40&&frames.length;i++){const f=frames.shift();t+=50;f(t);}
  assert.ok(made.renders>10,'animates');
  window.dispatchEvent(new window.MouseEvent('pointermove',{clientX:160,clientY:40}));
  api.dispose();assert.equal(host.querySelector('canvas'),null);assert.equal(made.disposed,true);assert.ok(!host.classList.contains('mochi-greet-ready'));
 }finally{Object.assign(globalThis,keep);}
});
test('celebrations come only from earned moments, never on a plain redraw',()=>{
 for(const f of ['entrance-ui.js','science-path-ui.js']){const s=fs.readFileSync(require.resolve('../'+f),'utf8');
  assert.match(s,/A\?\.correct&&eb&&!eb\.transfer&&ea\?\.transfer\)root\.MochiCelebrate\?\.show\(\{kind:'topic'/);
  assert.match(s,/mb&&data\(\)\.mixed\?\.completedAt\)root\.MochiCelebrate/);
  assert.match(s,/const sc=E\.submitPaper\(data\(\),p\.id\);save\(S\);open\('results',p\.id\);if\(sc\)root\.MochiCelebrate/);
  assert.equal((s.match(/MochiCelebrate\?\.show/g)||[]).length,3,f);}
 assert.match(fs.readFileSync(require.resolve('../mochi-home-ui.js'),'utf8'),/newTricks[^\n]*MochiCelebrate\?\.show\(\{kind:'trick'/);
 const c=fs.readFileSync(require.resolve('../ux-celebrate.js'),'utf8');assert.match(c,/prefers-reduced-motion/);assert.match(c,/addEventListener\('click',close\)/);
});
test('the skill map remembers rings so new progress fills in, starting from what was last shown',()=>{
 const store={};globalThis.localStorage={getItem:k=>store[k]??null,setItem:(k,v)=>{store[k]=v;}};
 try{
  delete require.cache[require.resolve('../ux-kit.js')];const X=require('../ux-kit.js'),E=require('../entrance-core.js'),d=E.fresh();
  let html=X.trail('ep',E,d,'algebra','percent');assert.match(html,/data-p="0\.00" style="--p:0\.00"/);
  store['mochi-rings']=JSON.stringify({relationships:.25});html=X.trail('ep',E,d,'algebra','percent');
  assert.match(html,/data-unit="relationships"><button[^>]*><span class="ux-ring" data-p="0\.00" style="--p:0\.25"/);
 }finally{delete globalThis.localStorage;}
});
