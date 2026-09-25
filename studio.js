/* Interaction layer. Numerical truth and teaching decisions stay in pure modules. */
let studioStage='understand',studioSelectedSkill='number',studioView='maths';
let studioLab={tool:'fraction',parts:6,selected:2,a:2,b:3,unit:4,w:4,h:3,n:4};
let studioLabReturn=null,studioTutorReturn=null;
const STAGE_PROMPTS={understand:'What do you know, and what are you trying to find?',connect:'Which relationship makes your approach work?',solve:'Explain your steps. What does each calculation mean?',verify:'How could you check this another way — or find a counterexample?'};
const STAGE_IDS={understand:'stageUnderstand',connect:'stageConnect',solve:'stageSolve',verify:'stageVerify'};
function studioCapture(){
 if(!studyAttempt)return;
 const text=$('studyPlan').value.trim();
 if(!studyAttempt.trace)studyAttempt.trace=MochiReasoning.cleanTrace();
 if(text!==studyAttempt.trace[studioStage]){
   studyAttempt.trace[studioStage]=text;
   studyAttempt.reasoningHistory=studyAttempt.reasoningHistory||[];
   if(text)studyAttempt.reasoningHistory.push({stage:studioStage,text});
   studyAttempt.reasoningHistory=studyAttempt.reasoningHistory.slice(-12);
 }
 studyAttempt.working=WK.lines.slice(0,24);
}
function studioPlanText(){studioCapture();return Object.entries(studyAttempt?.trace||{}).filter(([,s])=>s).map(([k,s])=>MochiReasoning.stages[k]+': '+s).join('\n');}
function studioStageGo(stage,focus=false){
 studioCapture();studioStage=stage;
 $('studyPlan').value=studyAttempt?.trace?.[stage]||'';
 $('stagePrompt').textContent=STAGE_PROMPTS[stage];
 $('reasonEditor').setAttribute('aria-labelledby',STAGE_IDS[stage]);
 for(const [key,id] of Object.entries(STAGE_IDS)){
   $(id).setAttribute('aria-selected',String(key===stage));$(id).tabIndex=key===stage?0:-1;
   $(id).classList.toggle('has-thought',!!studyAttempt?.trace?.[key]);
 }
 if(stage==='solve')$('workingDrawer').open=true;
 if(focus)$(STAGE_IDS[stage]).focus();
 const count=Object.values(studyAttempt?.trace||{}).filter(Boolean).length;
 $('traceCount').textContent=count?count+' thinking step'+(count===1?'':'s')+' recorded':'Your route is yours';
}
function studioShow(which){
 window.MochiTodayUI?.leave();
 window.MochiEntranceUI?.leave();window.MochiSciencePathUI?.leave();
 if(typeof courseLeave==='function')courseLeave();
 if(typeof SCI!=='undefined'&&SCI.view!=='maths'){scDraft();scAbort();SCI.view='maths';document.body.classList.remove('science-active');$('viewScience').hidden=true;for(const [id,on] of [['subjectMaths',true],['subjectScience',false]])$(id).setAttribute('aria-pressed',String(on));}
 if(which==='tools'){studioOpenLab();return;}
 focusClose(false);
 studioView=which;
 $('viewMap').hidden=which!=='map';
 $('viewMaths').style.display=which==='maths'?'':'none';
 $('viewRoom').style.display=which==='room'?'':'none';
 document.dispatchEvent?.(new Event('mochi:activity'));
 for(const [view,id] of [['maths','tabMaths'],['map','tabMap'],['room','tabRoom']]){
   $(id).classList.toggle('on',which===view);$(id).setAttribute('aria-current',which===view?'page':'false');
 }
 if(which==='map'){studioCapture();studioMap();}
 if(which==='room'){paintShop();paintAcc();setPurr(S.purr||0);}
 $('focusDock').hidden=which!=='maths'||$('problemCard').hidden;
 if(which==='maths')requestAnimationFrame(()=>{wkResize();wkRedraw();});
}
function studioTutor(open=true){
 if(!open){focusClose();return;}
 if(studioView!=='maths')studioShow('maths');
 focusOpen('coachCard');$('chatInput').focus();
}
function studioAsk(text){
 if(!current)return;studioCapture();studioTutor(true);addMsg('kid',text);askMochi('free',text);
}
function studioPaint(){
 if(!current)return;
 const l=learning(),move=MochiReasoning.nextMove(l,currentSkill(),$('studyObstacle').value);
 $('moveTitle').textContent=move.title;$('movePrompt').textContent=move.prompt;
 const conn=netReady()?'Live AI tutor connected':keyReady()?'Offline · local hints available':'Local hints · connect an AI tutor in parent settings';
 $('coachConnection').textContent=conn;
 const s=l.session,recorded=l.attempts.some(a=>a.id===studyAttempt?.id);$('sessionFinish').hidden=!s?.finished;
 $('problemCard').hidden=!!(s?.finished&&!recorded&&!current.custom);$('focusDock').hidden=$('problemCard').hidden||studioView!=='maths';
 $('focusQuestionMore').textContent=settled||revealed?'Reflect on my method':'Need a way in?';
 $('focusQuestionMore').setAttribute('aria-controls',settled||revealed?'thinkPanel':'morePanel');
 FOCUS_TRIGGERS.focusQuestionMore=settled||revealed?'thinkPanel':'morePanel';
 for(const id of ['thinkQuestion','coachQuestion','labQuestionRef'])$(id).textContent=current.text;
 $('focusProgress').textContent=(s?.done||0)+' / '+(s?.total||8)+' explored';
 $('chicProgress').value=Math.min(s?.done||0,s?.total||8);$('chicProgress').max=s?.total||8;
 $('focusSession').setAttribute('aria-label','Euna’s progress and practice schedule');
 $('focusContext').textContent=current.custom?'Your own problem · check Mochi’s explanation together.':current.stretch?'Reasoning investigation · explore, explain, test.':'No calculator · Take your time';
 $('nextBtn').textContent=s?.finished?'Finish session':'Continue';
 $('challengeLabel').textContent=current.custom?'YOUR QUESTION':`Question ${Math.min((s?.done||0)+(recorded?0:1),s?.total||8)} of ${s?.total||8} · ${current.repair?'Revisiting an idea':selectedStudy?.kind==='diagnostic'?'Starting-point check':'Practice'}`;
 if(s?.finished){const recent=l.attempts.filter(a=>a.at>=s.started);$('sessionFinishText').textContent=recent.filter(a=>a.independent).length+' independent solutions; '+recent.filter(a=>!a.independent).length+' ideas to revisit. A useful insight matters more than a perfect session.';}
}
function studioNewQuestion(){
 focusClose(false,false);
 studioStage='understand';studyAttempt.trace=MochiReasoning.cleanTrace();studyAttempt.route='unsure';studyAttempt.reasoningHistory=[];studyAttempt.working=[];studyAttempt.probe=null;studyAttempt.toolNotes='';
 studyAttempt.transfer=MochiReasoning.transferEvidence(learning(),current,currentGen?.name,currentSkill());
 $('probeCard').hidden=true;$('probeStart').disabled=false;$('probeFeedback').textContent='';
 $('probeStart').textContent='Untangle it with a small example';
 $('visualLab').hidden=true;$('labLaunch').setAttribute('aria-expanded','false');
 $('labPrediction').value='';$('labFinding').value='';$('labSave').textContent='Keep in my working';
 $('traceSaved').textContent='';$('routeChoice').textContent='I’m exploring';
 studioStageGo('understand');studioRouteButtons();studioPaint();
 if(typeof inputQuestion==='function')inputQuestion();
}
function studioRouteButtons(){
 const box=$('routeOptions');box.innerHTML='';
 for(const [id,label] of Object.entries(MochiReasoning.routes)){
   const b=document.createElement('button');b.textContent=label;b.type='button';b.setAttribute('aria-pressed',String(studyAttempt?.route===id));
   b.onclick=()=>{studyAttempt.route=id;$('routeChoice').textContent=label;studioRouteButtons();if(studyAttempt.tries)studyCommit(false);};box.append(b);
 }
}
function studioProbe(){
 if(!studyAttempt||studyAttempt.probe)return;
 const skill=currentSkill()==='speed'?'rate':currentSkill(),p=MochiReasoning.probeFor(skill);
 if(!settled)studyAttempt.hints++;
 $('probeStart').disabled=true;$('probeCard').hidden=false;$('probeQuestion').textContent=p.question;
 const box=$('probeChoices');box.innerHTML='';
 p.choices.forEach((choice,i)=>{
   const b=document.createElement('button');b.textContent=choice;b.setAttribute('aria-pressed','false');
   b.onclick=()=>{
     if(studyAttempt.probe)return;
     studyAttempt.probe={skill,choice:i,correct:i===p.answer,checks:p.checks,at:Date.now()};
     [...box.children].forEach(x=>{x.disabled=true;x.setAttribute('aria-pressed',String(x===b));});
     $('probeFeedback').textContent=(i===p.answer?'That relationship checks out. ':'Let’s rebuild this relationship. ')+p.explanation+' Now explain how it relates to your problem.';
     if(studyAttempt.tries)studyCommit(false);
     $('moveTitle').textContent=i===p.answer?'Connect it to your plan':'Try the relationship again';
     $('movePrompt').textContent=i===p.answer?'This small case worked. Which part of your own problem uses the same idea?':'Draw the small example and explain each quantity before returning to your problem.';
   };box.append(b);
 });
}
function studioMap(){
 const l=learning(),box=$('skillConstellation');box.innerHTML='';
 MochiLearning.summary(l).forEach((e,i)=>{
   const b=document.createElement('button');b.className='skill-node';b.dataset.retained=String(e.level==='Retained in practice');b.setAttribute('aria-pressed',String(e.id===studioSelectedSkill));
   b.innerHTML='<span class="node-orbit">'+String(i+1).padStart(2,'0')+'</span><strong>'+studyEscape(e.label)+'</strong><span class="node-level">'+studyEscape(e.level)+'</span><small>'+(e.attempts?e.days+' days with independent evidence':'Ready for a first look')+'</small>';
   b.onclick=()=>{studioSelectedSkill=e.id;studioMap();$('skillDetail').focus();};box.append(b);
 });
 const skill=MochiLearning.skills[studioSelectedSkill],e=MochiLearning.evidence(l,studioSelectedSkill),profile=MochiReasoning.profile(l,studioSelectedSkill);
 const detail=$('skillDetail');detail.tabIndex=-1;
 detail.innerHTML='<span class="overline">'+(skill.stretch?'ENRICHMENT':'CORE IDEA')+'</span><h2>'+studyEscape(skill.label)+'</h2><p>'+studyEscape(skill.question)+'</p><p><b>'+studyEscape(e.level)+'</b><br>'+e.attempts+' questions explored · '+e.independent+' independent in the last 10 · '+e.forms+' question forms</p><h3>Building blocks</h3><div class="prereq-chips" id="prereqLinks"></div><p>'+(profile.routeEvidence.length?'Routes you have tried: '+profile.routeEvidence.map(r=>studyEscape(r.label)+' ('+r.independent+'/'+r.uses+' independent)').join('; ')+'. These are observations, not a fixed learning style.':'Your reasoning will make this map more useful. We have no route evidence yet.')+'</p><button class="btn" id="practiceSkill">Explore this idea</button><p>Independent practice is evidence of progress. It is not an exam percentile.</p>';
 for(const id of skill.prereq){const b=document.createElement('button');b.textContent=MochiLearning.skills[id].label;b.onclick=()=>{studioSelectedSkill=id;studioMap();};$('prereqLinks').append(b);}
 if(!skill.prereq.length)$('prereqLinks').textContent='A starting foundation.';
 $('practiceSkill').onclick=()=>{
   studyCommit(true);MochiLearning.start(l,skill.stretch?'stretch':'daily');l.session.focusSkill=studioSelectedSkill;save(S);studioShow('maths');renderQuestion();$('qText').focus();
 };
 const notes=[...l.notes,...l.attempts.filter(a=>a.reflection).map(a=>({at:a.at,question:a.question,text:a.reflection}))].sort((a,b)=>b.at-a.at).slice(0,9);
 $('insightGallery').innerHTML=notes.length?notes.map(n=>'<article class="insight"><small>'+new Date(n.at).toLocaleDateString('en-SG')+'</small><p>'+studyEscape(n.text)+'</p><details><summary>Related problem</summary><p>'+studyEscape(n.question)+'</p></details></article>').join(''):'<p>Your saved reflections and discoveries will appear here.</p>';
}
function studioOpenLab(){
 if(studyAttempt&&!settled)studyAttempt.model=true;
 focusOpen('visualLab');studioRenderLab();
}
function studioCloseLab(){focusClose();}
function studioSlider(id,label,value,min,max){return '<label for="'+id+'">'+label+' <output id="'+id+'Value">'+value+'</output><input type="range" id="'+id+'" min="'+min+'" max="'+max+'" step="1" value="'+value+'"></label>';}
function studioRenderLab(){
 const t=studioLab.tool,c=$('labControls');
 $('labResult').hidden=true;$('labReveal').textContent='Reveal measurements';
 document.querySelectorAll('[data-tool]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.tool===t)));
 const prompts={fraction:'Tap equal parts. How does the same amount appear on a number line?',ratio:'Keep the ratio fixed and change the size of one unit. What stays the same?',area:'Can two rectangles have the same area but different perimeters? Try to find a pair.',pattern:'Add one row to the triangle. How many new dots appear? Can you predict any row number?'};
 $('labQuestion').textContent=prompts[t];
 const fields=t==='fraction'?[['parts','Equal parts',2,12]]:t==='ratio'?[['a','A units',1,8],['b','B units',1,8],['unit','Value of a unit',1,12]]:t==='area'?[['w','Width',1,12],['h','Height',1,12]]:[['n','Rows',1,10]];
 c.innerHTML=fields.map(([key,label,min,max])=>studioSlider('lab_'+key,label,studioLab[key],min,max)).join('');
 fields.forEach(([key])=>{$('lab_'+key).oninput=e=>{studioLab[key]=Number(e.target.value);if(key==='parts')studioLab.selected=Math.min(studioLab.selected,studioLab.parts);$('lab_'+key+'Value').textContent=e.target.value;$('labResult').hidden=true;$('labReveal').textContent='Reveal measurements';studioDrawLab();};});
 studioDrawLab();
}
function studioDrawLab(){
 const t=studioLab.tool,box=$('labVisual');box.innerHTML='';
 if(t==='fraction'){
   const {parts,selected}=MochiReasoning.fractionState(studioLab.parts,studioLab.selected),strip=document.createElement('div');strip.className='fraction-strip';
   for(let i=0;i<parts;i++){const b=document.createElement('button');b.className=i<selected?'filled':'';b.setAttribute('aria-label','Shade '+(i+1)+' of '+parts+' equal parts');b.setAttribute('aria-pressed',String(i<selected));b.onclick=()=>{studioLab.selected=i+1===selected?0:i+1;studioDrawLab();document.querySelectorAll('#labVisual button')[i]?.focus();$('labResult').hidden=true;$('labReveal').textContent='Reveal measurements';};strip.append(b);}
   box.append(strip);const axis=document.createElement('div');axis.className='number-axis';axis.innerHTML='<span>0</span><span class="axis-mark" style="left:'+(100*selected/parts)+'%"></span><span>1 whole</span>';axis.setAttribute('aria-label',selected+' of '+parts+' equal intervals along the number line');box.append(axis);
 }else if(t==='ratio'){
   const {a,b}=MochiReasoning.ratioState(studioLab.a,studioLab.b,studioLab.unit),width=(88-Math.max(a,b))/Math.max(a,b);
   for(const [label,count] of [['A',a],['B',b]]){const row=document.createElement('div');row.className='ratio-row';row.innerHTML='<span>'+label+'</span>'+Array.from({length:count},()=>'<i class="ratio-unit" style="width:'+width+'%"></i>').join('');row.setAttribute('aria-label',label+' has '+count+' equal ratio units');box.append(row);}
   const caption=document.createElement('p');caption.className='visual-caption';caption.textContent='Each block represents the same amount. The picture shows the ratio.';box.append(caption);
 }else if(t==='area'){
   const {w,h}=MochiReasoning.gridState(studioLab.w,studioLab.h),step=18,x=30,y=15;
   let cells='';for(let r=0;r<h;r++)for(let c=0;c<w;c++)cells+='<rect x="'+(x+c*step)+'" y="'+(y+r*step)+'" width="18" height="18" fill="#dfe8ff" stroke="#8aa5e6" stroke-width="1"/>';
   box.innerHTML='<svg role="img" aria-label="'+w+' columns and '+h+' rows of unit squares" viewBox="0 0 280 '+(h*step+45)+'">'+cells+'<rect x="30" y="15" width="'+(w*step)+'" height="'+(h*step)+'" fill="none" stroke="#ed7744" stroke-width="3"/></svg><p class="visual-caption">Blue squares cover the inside. Orange follows the boundary.</p>';
 }else{
   const n=studioLab.n;let dots='';for(let row=1;row<=n;row++)for(let col=0;col<row;col++)dots+='<circle cx="'+(140-(row-1)*10+col*20)+'" cy="'+(14+(row-1)*20)+'" r="6" fill="'+(row===n?'#ed7744':'#5376ea')+'"/>';
   box.innerHTML='<svg role="img" aria-label="Triangle with '+n+' rows; row k contains k dots" viewBox="0 0 280 '+(n*20+12)+'">'+dots+'</svg><p class="visual-caption">The orange row is the newest row.</p>';
 }
}
function studioLabMeasurement(){
 const s=studioLab;
 if(s.tool==='fraction'){const f=MochiReasoning.fractionState(s.parts,s.selected);return f.selected+'/'+f.parts+' of the whole; number-line position '+f.selected+'/'+f.parts+'.';}
 if(s.tool==='ratio'){const r=MochiReasoning.ratioState(s.a,s.b,s.unit);return 'A : B = '+r.a+' : '+r.b+'. One unit = '+r.unit+'. A = '+r.left+', B = '+r.right+', total = '+r.total+'.';}
 if(s.tool==='area'){const r=MochiReasoning.gridState(s.w,s.h);return r.w+' × '+r.h+': area = '+r.area+' square units; perimeter = '+r.perimeter+' units.';}
 return studioLab.n+' rows contain '+studioLab.n*(studioLab.n+1)/2+' dots. The next row adds '+(studioLab.n+1)+' dots.';
}
function studioLabNote(){return 'Visual lab ('+studioLab.tool+'). My prediction: '+$('labPrediction').value.trim()+'\nExperiment: '+studioLabMeasurement()+'\nMy observation: '+$('labFinding').value.trim();}
function studioKeepLab(discuss=false){
 if(!studyAttempt)return;
 if(!$('labFinding').value.trim()){$('labFinding').focus();$('labFinding').placeholder='Add your observation first. What relationship did you notice?';return;}
 const note=studioLabNote();studyAttempt.toolNotes=note;learning().notes.push({at:Date.now(),question:current.text,text:note});learning().notes=learning().notes.slice(-200);save(S);
 $('labSave').textContent='Observation saved';if(studyAttempt.tries)studyCommit(false);
 if(discuss){studioCloseLab();studioAsk('Help me check my mathematical observation and connect it to the problem. '+note);}
}
function studioBenchmarks(){
 const rows=learning().benchmarks||[];
 $('benchmarkList').innerHTML=rows.slice().reverse().map(b=>'<p><b>'+studyEscape(b.name)+'</b> · '+studyEscape(b.date)+'<br>'+studyEscape(b.note)+(b.percentile==null?'':'<br>Percentile '+b.percentile+' (supplied by an adult, not independently verified)')+'</p>').join('')||'<p>No external assessments recorded.</p>';
}
function studioInit(){
 if(typeof inputInit==='function')inputInit();
 $('tabMaths').onclick=()=>studioShow('maths');$('tabRoom').onclick=()=>studioShow('room');$('tabMap').onclick=()=>studioShow('map');$('tabTools').onclick=studioOpenLab;$('mapReturn').onclick=()=>studioShow('maths');
 const advance=()=>{studyCommit(true);if(learning().session?.finished&&!current.custom)studioShow('map');else{renderQuestion();$('qText').focus();}};
 $('nextBtn').onclick=advance;$('skipBtn').onclick=advance;
 $('coachFloat').onclick=()=>studioTutor(true);$('coachClose').onclick=()=>studioTutor(false);
 Object.entries(STAGE_IDS).forEach(([stage,id])=>{
   $(id).onclick=()=>studioStageGo(stage);
   $(id).onkeydown=e=>{const keys=Object.keys(STAGE_IDS),i=keys.indexOf(stage);let j;if(e.key==='ArrowRight')j=(i+1)%4;if(e.key==='ArrowLeft')j=(i+3)%4;if(e.key==='Home')j=0;if(e.key==='End')j=3;if(j!==undefined){e.preventDefault();studioStageGo(keys[j],true);}};
 });
 $('studyPlan').onchange=()=>{studioCapture();if(studyAttempt?.tries)studyCommit(false);$('traceSaved').textContent='Step recorded';};
 $('sendReason').onclick=()=>{const text=studioPlanText();studioAsk(text?'Help me examine the logic of this step without replacing my approach. '+text:'Help me find a first step. Ask what I understand about the question.');};
 $('studyObstacle').onchange=()=>{if(studyAttempt)studyAttempt.obstacle=$('studyObstacle').value;studioPaint();};
 $('workingDrawer').ontoggle=()=>{if($('workingDrawer').open)requestAnimationFrame(()=>{wkResize();wkRedraw();});};
 $('probeStart').onclick=studioProbe;$('labLaunch').onclick=studioOpenLab;$('labClose').onclick=studioCloseLab;
 document.querySelectorAll('[data-tool]').forEach(b=>b.onclick=()=>{studioLab.tool=b.dataset.tool;studioRenderLab();});
 $('labReveal').onclick=()=>{$('labResult').textContent=studioLabMeasurement();$('labResult').hidden=false;$('labReveal').textContent='Measurements shown';};
 $('labSave').onclick=()=>studioKeepLab(false);$('labDiscuss').onclick=()=>studioKeepLab(true);
 $('labResetPosition').onclick=()=>{Object.assign($('visualLab').style,{top:'',left:'',right:'',bottom:''});};
 // Dragging is optional: every control works without it, and Reset restores the panel.
 let drag=null;
 $('labHandle').onpointerdown=e=>{if(e.target.closest('button')||window.innerWidth<781)return;const r=$('visualLab').getBoundingClientRect();drag={x:e.clientX-r.left,y:e.clientY-r.top};$('labHandle').setPointerCapture(e.pointerId);};
 $('labHandle').onpointermove=e=>{if(!drag)return;const el=$('visualLab'),r=el.getBoundingClientRect();Object.assign(el.style,{left:Math.max(12,Math.min(window.innerWidth-r.width-12,e.clientX-drag.x))+'px',top:Math.max(12,Math.min(window.innerHeight-r.height-12,e.clientY-drag.y))+'px',right:'auto',bottom:'auto'});};
 $('labHandle').onpointerup=$('labHandle').onpointercancel=()=>{drag=null;};
 window.addEventListener('resize',()=>{if(window.innerWidth<781)$('labResetPosition').onclick();});
 document.addEventListener('keydown',e=>{if(e.key==='Tab'&&$('ov').classList.contains('show')){const targets=[...$('ov').querySelectorAll('button,input,select,textarea,a[href],summary')].filter(x=>!x.disabled&&x.getClientRects().length);const first=targets[0],last=targets[targets.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}if(e.key==='Escape'){if($('ov').classList.contains('show')){$('ovClose').click();return;}if(focusPanel)focusClose();}});
 $('finishMap').onclick=()=>studioShow('map');$('finishInsight').onclick=()=>{focusOpen('thinkPanel');$('studyReflection').hidden=false;$('reflectionText').focus();};
 $('benchmarkSave').onclick=()=>{
   const name=$('benchmarkName').value.trim(),date=$('benchmarkDate').value,note=$('benchmarkNote').value.trim(),raw=$('benchmarkPercentile').value;
   const percentile=raw===''?null:Number(raw);
   if(!name||!/^\d{4}-\d{2}-\d{2}$/.test(date)||!note||percentile!==null&&(!Number.isFinite(percentile)||percentile<0||percentile>100)){$('benchmarkStatus').textContent='Add a title/source, date and feedback. Leave percentile blank unless the assessment supplies it.';return;}
   const l=learning();l.benchmarks=l.benchmarks||[];l.benchmarks.push({name:name.slice(0,160),date,note:note.slice(0,1000),percentile});l.benchmarks=l.benchmarks.slice(-50);save(S);studioBenchmarks();$('benchmarkStatus').textContent='Assessment saved. It does not change app mastery.';
 };
 focusInit();
}
let focusPanel=null,focusReturn=null;
const FOCUS_PANELS=['thinkPanel','sessionPanel','resourcePanel','morePanel','coachCard','visualLab'];
const FOCUS_TRIGGERS={focusThink:'thinkPanel',focusSession:'sessionPanel',focusMore:'morePanel',focusQuestionMore:'morePanel',coachFloat:'coachCard',tabTools:'visualLab',labLaunch:'visualLab'};
function focusClose(restore=true,capture=true){
 if(capture&&studyAttempt){studioCapture();if(studyAttempt.tries)studyCommit(false);}
 for(const id of FOCUS_PANELS)$(id).hidden=true;
 for(const id of Object.keys(FOCUS_TRIGGERS))$(id).setAttribute('aria-expanded','false');
 $('focusBackdrop').hidden=true;$('studioSurface').inert=false;
 document.body.classList.remove('has-focus-panel','coach-open');focusPanel=null;
 const returnTarget=focusReturn;focusReturn=null;if(restore)returnTarget?.focus?.();
}
function focusOpen(id,opener){
 if(!FOCUS_PANELS.includes(id))return;
 const returnTo=opener||focusReturn||document.activeElement||$('focusMore');
 focusClose(false);focusReturn=returnTo;focusPanel=id;
 $(id).hidden=false;$('focusBackdrop').hidden=false;
 document.body.classList.add('has-focus-panel');document.body.classList.toggle('coach-open',id==='coachCard');
 // These are nonmodal dialogs: desktop learners can keep working on the question;
 // the floating navigation remains usable at every width.
 $('studioSurface').inert=window.innerWidth<1200;
 for(const [trigger,panel] of Object.entries(FOCUS_TRIGGERS))$(trigger).setAttribute('aria-expanded',String(panel===id));
 $(id).focus();
 if(id==='thinkPanel')requestAnimationFrame(()=>{wkResize();wkRedraw();});
}
function focusToggle(id,opener){if(focusPanel===id)focusClose();else focusOpen(id,opener);}
function focusInit(){
 $('studioHome').onclick=e=>{e.preventDefault();studioShow('maths');$('qText').focus();};
 $('focusThink').onclick=()=>focusToggle('thinkPanel',$('focusThink'));
 $('focusSession').onclick=()=>focusToggle('sessionPanel',$('focusSession'));
 $('focusMore').onclick=()=>focusToggle('morePanel',$('focusMore'));
 $('focusQuestionMore').onclick=()=>focusToggle(settled||revealed?'thinkPanel':'morePanel',$('focusQuestionMore'));
 $('coachFloat').onclick=()=>{if(focusPanel==='coachCard')focusClose();else{focusReturn=$('coachFloat');studioTutor();}};
 $('tabTools').onclick=()=>{if(focusPanel==='visualLab')focusClose();else{focusReturn=$('tabTools');studioOpenLab();}};
 $('focusBackdrop').onclick=()=>focusClose();
 for(const id of ['thinkClose','sessionClose','resourceClose','moreClose'])$(id).onclick=()=>focusClose();
 $('focusThinkMore').onclick=()=>focusOpen('thinkPanel');
 $('focusTutorMore').onclick=()=>studioTutor();
 $('focusResources').onclick=()=>{focusOpen('resourcePanel');if($('resourceDetails').open&&studyAttempt&&!settled)studyAttempt.hints++;$('resourceDetails').open=true;};
 $('focusPlan').onclick=()=>focusOpen('sessionPanel');
 // Install wrappers once so restored learning backups cannot stack handlers.
 for(const id of ['studyStart','ownProblemStart','modelBtn','workingBtn','skipBtn','adultBtn','saveResource']){
   const original=$(id).onclick?._focusOriginal||$(id).onclick;
   if(!original)continue;
   const wrapped=function(...args){
     if(id==='ownProblemStart'&&!$('ownProblem').value.trim()||id==='saveResource'&&!$('resourceNote').value.trim())return;
     focusClose(false);original.apply(this,args);
     if(id==='ownProblemStart'||id==='saveResource')studioTutor();
     else if(id==='studyStart'){studioShow('maths');$('qText').focus();}
     else if(id==='workingBtn'||id==='modelBtn'){$('qText').focus();}
   };
   wrapped._focusOriginal=original;$(id).onclick=wrapped;
 }
 window.addEventListener('resize',()=>{$('studioSurface').inert=!!focusPanel&&window.innerWidth<1200;});
 focusClose(false,false);
}
boot();
