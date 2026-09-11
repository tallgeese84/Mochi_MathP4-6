const test=require('node:test'),assert=require('node:assert/strict'),harness=require('./harness.cjs');
function app(){const h=harness(true);h.run('studyInit();studioInit();renderQuestion();');return h;}
test('switching input keeps the drawing, typed steps, answer and independent evidence',()=>{
 const h=app();h.run(String.raw`$('typedWorking').value='24 / 3 = 8\n8 + 2 = 10';$('typedWorking').oninput();WK.strokes=[{pts:[{x:400,y:120,p:.5}],erase:false}];$('answerInput').value='10';inputSetMode('stylus');inputSetMode('keyboard');`);
 assert.equal(h.run(String.raw`$('typedWorking').value`),'24 / 3 = 8\n8 + 2 = 10');assert.equal(h.run('WK.strokes.length'),1);assert.equal(h.run(String.raw`$('answerInput').value`),'10');assert.equal(h.run('studyAttempt.hints'),0);assert.equal(h.stored.get('mochi-input-mode'),'keyboard');
 h.run(String.raw`inputSetMode('stylus');inputInit();`);assert.equal(h.run('inputMode'),'stylus');assert.equal(h.run(String.raw`$('workingDrawer').open`),true);
});
test('new questions clear working while keeping the chosen input method',()=>{
 const h=app();h.run(String.raw`inputSetMode('stylus');$('typedWorking').value='24 / 3 = 8';$('typedWorking').oninput();WK.strokes=[{pts:[]}];renderQuestion();`);
 assert.equal(h.run(String.raw`$('typedWorking').value`),'');assert.equal(h.run('WK.lines.length'),0);assert.equal(h.run('WK.strokes.length'),0);assert.equal(h.run('inputMode'),'stylus');assert.equal(h.run(String.raw`$('workingDrawer').open`),true);
});
test('typed step checking flags arithmetic errors, records support and never submits an answer',()=>{
 const h=app();h.run(String.raw`$('typedWorking').value='24 / 3 = 9';$('typedWorking').oninput();inputCheckTyped();`);
 assert.match(h.run(String.raw`$('wkSum').innerHTML`),/Line 1 does not work out/);assert.equal(h.run('studyAttempt.hints'),1);assert.equal(h.run('settled'),false);assert.equal(h.run(String.raw`$('answerInput').value`),'');
});
test('working longer than 24 lines survives toggles and clearing ink keeps text',()=>{
 const h=app();h.run(String.raw`$('typedWorking').value=Array.from({length:30},(_,i)=>'Step '+i).join('\n');$('typedWorking').oninput();inputSetMode('stylus');WK.strokes=[{pts:[]}];$('wkClear').onclick();inputSetMode('keyboard');`);
 assert.equal(h.run(String.raw`$('typedWorking').value.split('\n').length`),30);assert.equal(h.run('WK.strokes.length'),0);
});
test('writing coordinates survive portrait/landscape widths; a palm cannot end the pen stroke',()=>{
 const h=app();h.run(String.raw`WK.ok=true;WK.cv={getBoundingClientRect:()=>({left:10,top:20,width:360,height:270}),setPointerCapture(){},releasePointerCapture(){}};let pos=wkPos({clientX:190,clientY:155,pressure:.5});`);
 assert.equal(h.run('pos.x'),360);assert.equal(h.run('pos.y'),270);
 h.run(String.raw`WK.cv.getBoundingClientRect=()=>({left:10,top:20,width:720,height:540});pos=wkPos({clientX:370,clientY:290,pressure:.5});`);assert.equal(h.run('pos.x'),360);assert.equal(h.run('pos.y'),270);
 h.run(String.raw`let pen={pointerId:7,pointerType:'pen',button:0,clientX:100,clientY:100,pressure:.5,preventDefault(){}};wkDown(pen);wkUp({...pen,pointerType:'touch',pointerId:8});wkMove({...pen,clientX:110});`);
 assert.equal(h.run('WK.strokes.length'),1);assert.equal(h.run('WK.cur.pts.length'),2);h.run('wkUp(pen);');assert.equal(h.run('WK.cur'),null);
});
function reader(){const h=app();h.run(String.raw`WK.ok=true;WK.strokes=[{pts:Array.from({length:7},()=>({x:1,y:1}))}];netReady=()=>true;wkToPng=()=> 'data:image/png;base64,dGVzdA==';callModel=async()=>JSON.stringify({lines:['24 / 3 = 8']});`);return h;}
test('reading handwriting offers a final answer without submitting and preserves existing answers',async()=>{
 const h=reader();await h.run('wkCheckNow()');assert.equal(h.run(String.raw`$('answerInput').value`),'8');assert.equal(h.run('settled'),false);assert.equal(h.run('WK.reading'),false);
 h.run(String.raw`$('answerInput').value='9';`);await h.run('wkCheckNow()');assert.equal(h.run(String.raw`$('answerInput').value`),'9');
});
test('recognition does not apply stale writing or put a numeric result into a multipart answer',async()=>{
 const h=reader();h.run(String.raw`callModel=async()=>{WK.revision=(WK.revision||0)+1;return JSON.stringify({lines:['8']});};`);await h.run('wkCheckNow()');assert.equal(h.run(String.raw`$('answerInput').value`),'');assert.match(h.run(String.raw`$('wkHint').textContent`),/working changed/);
 h.run(String.raw`callModel=async()=>JSON.stringify({lines:['8']});current.parts=[{label:'Part a',answer:8}];`);await h.run('wkCheckNow()');assert.equal(h.run(String.raw`$('answerInput').value`),'');assert.match(h.run(String.raw`$('wkHint').textContent`),/each part/);
});
