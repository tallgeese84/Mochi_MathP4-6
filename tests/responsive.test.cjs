const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {JSDOM}=require('jsdom');
function app(){
 const d=new JSDOM('<body><input id="answer"><canvas id="working"></canvas><div id="visualLab"></div><div id="mochiFocusHome"><span>cat</span></div></body>',{runScripts:'outside-only',pretendToBeVisual:true}),w=d.window;
 const v=new w.EventTarget();Object.assign(v,{height:800,offsetTop:0,scale:1});w.visualViewport=v;w.innerHeight=800;w.MochiReady=true;
 let nextFrame;w.requestAnimationFrame=f=>{nextFrame=f;return 1;};
 const animation={playState:'running',pause(){this.playState='paused';},play(){this.playState='running';}};
 w.document.querySelector('#mochiFocusHome span').getAnimations=()=>[animation];
 w.eval(fs.readFileSync(require.resolve('../responsive.js'),'utf8'));
 return{w,v,animation,flush:()=>{const f=nextFrame;nextFrame=null;f?.();},close:()=>w.close()};
}
test('keyboard viewport changes preserve the answer and expose the usable panel height',()=>{
 const a=app(),{w,v}=a;const input=w.document.getElementById('answer');input.value='3/4';input.focus();
 v.height=430;v.offsetTop=20;v.dispatchEvent(new w.Event('resize'));a.flush();
 assert.equal(w.document.documentElement.style.getPropertyValue('--visible-height'),'430px');
 assert.equal(w.document.documentElement.style.getPropertyValue('--visual-bottom'),'350px');
 assert.equal(w.document.body.classList.contains('keyboard-open'),true);assert.equal(input.value,'3/4');
 v.scale=2;v.dispatchEvent(new w.Event('resize'));a.flush();assert.equal(w.document.body.classList.contains('keyboard-open'),false,'pinch zoom is not treated as a keyboard');a.close();
});
test('minimising pauses home motion and restoring resumes it without resetting input',()=>{
 const a=app(),{w}=a;w.document.getElementById('answer').value='11';
 Object.defineProperty(w.document,'visibilityState',{value:'hidden',configurable:true});w.document.dispatchEvent(new w.Event('visibilitychange'));
 assert.equal(a.animation.playState,'paused');assert.equal(w.document.body.classList.contains('app-hidden'),true);
 Object.defineProperty(w.document,'visibilityState',{value:'visible',configurable:true});w.document.dispatchEvent(new w.Event('visibilitychange'));a.flush();
 assert.equal(a.animation.playState,'running');assert.equal(w.document.getElementById('answer').value,'11');a.close();
});

test('shrinking a window releases stale dragged-lab coordinates',()=>{
 const a=app(),{w}=a,lab=w.document.getElementById('visualLab');
 lab.style.left='900px';lab.style.top='600px';w.innerWidth=375;
 w.dispatchEvent(new w.Event('resize'));a.flush();
 assert.equal(lab.style.left,'');assert.equal(lab.style.top,'');a.close();
});
