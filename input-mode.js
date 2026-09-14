/* The learner's input preference is local; switching never clears the question. */
let inputMode='keyboard';
function inputSyncText(){
 $('typedWorking').value=WK.lines.join('\n');
}
function inputSetMode(mode,announce=true){
 inputMode=mode==='stylus'?'stylus':'keyboard';
 const pen=inputMode==='stylus';
 document.body.dataset.inputMode=inputMode;
 $('inputKeyboard').setAttribute('aria-pressed',String(!pen));
 $('inputStylus').setAttribute('aria-pressed',String(pen));
 $('stylusTools').hidden=!pen;$('wkCanvas').hidden=!pen;$('wkCheck').hidden=!pen;
 $('keyboardWorking').hidden=pen;
 if(pen){$('workingDrawer').open=true;$('answerInput').blur?.();}
 else inputSyncText();
 $('wkLines').hidden=!pen;
 try{localStorage.setItem('mochi-input-mode',inputMode);}catch(e){}
 if(announce)$('inputModeStatus').textContent=pen?'Stylus mode. Your typed working and answer are kept.':'Keyboard mode. Your drawing and answer are kept.';
 requestAnimationFrame(()=>{wkResize();wkRedraw();});
}
function inputReset(){
 $('typedWorking').value='';
 $('wkSum').textContent='';
 $('inputModeStatus').textContent='';
}
function inputQuestion(){
 $('workingDrawer').open=inputMode==='stylus';
 $('finalAnswerLabel').hidden=!!(current?.parts||current?.choices||current?.custom);
 inputSetMode(inputMode,false);
}
function inputCheckTyped(){
 WK.lines=$('typedWorking').value.split('\n');
 if(!WK.lines.some(l=>l.trim())){ $('wkHint').textContent='Write a step first, then check it.'; return; }
 if(studyAttempt&&!settled)studyAttempt.hints++;
 tryCount++;
 wkRenderLines();
 $('wkHint').textContent='Arithmetic checked. Explain why each step fits the problem too.';
 if(typeof studioCapture==='function')studioCapture();
}
function inputInit(){
 try{inputMode=localStorage.getItem('mochi-input-mode')==='stylus'?'stylus':'keyboard';}catch(e){}
 $('inputKeyboard').onclick=()=>inputSetMode('keyboard');
 $('inputStylus').onclick=()=>inputSetMode('stylus');
 $('typedWorking').oninput=()=>{
  WK.lines=$('typedWorking').value.split('\n');
  $('wkSum').className='wksum';$('wkSum').textContent='';
  if(typeof studioCapture==='function')studioCapture();
 };
 $('typedCheck').onclick=inputCheckTyped;
 $('openInputWorking').onclick=()=>{
  focusClose(false);$('workingDrawer').open=true;
  requestAnimationFrame(()=>{wkResize();wkRedraw();$('workingDrawer').scrollIntoView({block:'center',behavior:'smooth'});});
 };
 $('wkPenOnly').setAttribute('aria-pressed',String(!!WK.penOnly));
 inputSetMode(inputMode,false);
}
