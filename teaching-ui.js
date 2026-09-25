/* Lightweight teaching cards: no WebGL, remote assets, speech service or paid provider. */
(function(root){
'use strict';
const T=root.MochiTeaching,panels={};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const byId=id=>document.getElementById(id);
function targets(subject){return subject==='maths'?[document.querySelector('#problemCard .question-content'),document.querySelector('#problemCard .answer-composer')]:['scQuestion','scChoices','scConceptCheck','scCheck','scNext'].map(byId);}
function lock(subject,on){for(const node of targets(subject))node?.classList.toggle('teaching-locked',on);}
function visual(type){
 if(type==='tax')return '<figure class="teaching-bars"><div aria-label="GST: original 100 percent plus 9 percent"><span class="tax-whole">Original 100%</span><span class="tax-extra">+9%</span></div><figcaption>GST: 100% + 9% = 109%</figcaption><div aria-label="Discount: 91 percent kept and 9 percent removed"><span class="discount-kept">Pay 91%</span><span class="discount-removed">−9%</span></div><figcaption>Discount: 100% − 9% = 91%</figcaption></figure>';
 if(type==='cube2'||type==='cube3'){const n=type==='cube2'?2:3;return '<div class="teaching-build" data-edge="'+n+'"><p>Build the cube: each square below is the top of one unit cube.</p><div class="teaching-layers"></div><p class="teaching-count" aria-live="polite"></p><button type="button" class="btn quiet teaching-add-layer">Add one layer</button><button type="button" class="btn quiet teaching-reset-layers">Start with one layer</button></div>';}
 if(type==='circuit')return '<p class="teaching-path" role="img" aria-label="Battery terminal to bulb to closed switch to other terminal, forming one complete path">Battery (+) → bulb → closed switch → battery (−)<br><strong>An open switch interrupts this complete path.</strong></p>';
 if(type==='branches')return '<div class="teaching-branches" role="img" aria-label="Two separate complete branches across a battery"><p>Battery (+) → switch A → lamp A → battery (−)</p><p>Battery (+) → lamp B → battery (−)</p><strong>Open switch A: A goes out; B still has a complete path.</strong></div>';
 return '';
}
function buildLayers(host){
 const box=host.querySelector('.teaching-build');if(!box)return;
 const edge=Number(box.dataset.edge);let count=1;
 const paint=()=>{box.querySelector('.teaching-layers').innerHTML=Array.from({length:count},(_,i)=>'<figure><figcaption>Layer '+(i+1)+'</figcaption><div class="teaching-layer" style="--edge:'+edge+'">'+Array.from({length:edge*edge},()=>'<span aria-hidden="true"></span>').join('')+'</div></figure>').join('');box.querySelector('.teaching-count').textContent=edge+' × '+edge+' × '+count+' = '+edge*edge*count+' unit cubes. '+(count===edge?'All three dimensions match: this is a cube.':'Add layers until the height matches the other two edges.');box.querySelector('.teaching-add-layer').disabled=count===edge;};
 box.querySelector('.teaching-add-layer').onclick=()=>{count=Math.min(edge,count+1);paint();};box.querySelector('.teaching-reset-layers').onclick=()=>{count=1;paint();};paint();
}
function markSupport(subject,p){
 if(subject==='maths'&&p.attempt){p.attempt.hints++;if(p.attempt.tries)studyCommit(false);}
 if(subject==='science'){SCI.helped=true;if(SCI.tries)scRecord(SCI.choice===SCI.q.answer);}
}
function paint(subject){
 const p=panels[subject],host=p.host,lesson=p.lesson;
 lock(subject,p.reading);
 if(!p.reading){host.innerHTML='<div class="teaching-compact"><span>Explanation closed · try the check without help</span><button type="button" class="btn quiet teaching-reopen">Review the mini-lesson</button></div>';host.querySelector('.teaching-reopen').onclick=()=>{markSupport(subject,p);p.reading=true;p.page=0;paint(subject);};return;}
 const page=lesson.pages[p.page];
 host.innerHTML='<p class="overline">READ → CHECK → PRACTISE</p><h2 tabindex="-1">'+esc(lesson.title)+'</h2><p class="teaching-step">Section '+(p.page+1)+' of '+lesson.pages.length+' · No timer</p><h3>'+esc(page.title)+'</h3><p class="teaching-prose">'+esc(page.text).replace(/\n/g,'<br>')+'</p>'+visual(page.visual)+'<div class="teaching-actions"><button type="button" class="btn quiet teaching-back"'+(!p.page?' disabled':'')+'>Previous</button><button type="button" class="btn teaching-next">'+(p.page===lesson.pages.length-1?'Close the explanation & try the check':'Next section')+'</button><button type="button" class="btn quiet teaching-book">Open the full textbook</button></div><p class="study-note">A short check helps choose the next step. It does not diagnose a weakness or establish mastery.</p>';
 host.querySelector('.teaching-back').onclick=()=>{p.page=Math.max(0,p.page-1);paint(subject);};
 host.querySelector('.teaching-next').onclick=()=>{
  if(p.page<lesson.pages.length-1){p.page++;paint(subject);host.querySelector('h2').focus();return;}
  p.reading=false;const now=Date.now();
  if(subject==='maths'&&p.attempt)p.attempt.lessonCompletedAt=now;
  if(subject==='science')SCI.lessonCompletedAt=now;
  if(root.MochiCourse){const c=MochiCourse.init(S);MochiCourse.startPractice(c,lesson.unit,now,p.key);}
  save(S);paint(subject);byId(subject==='maths'?'qText':'scQuestion')?.focus();
 };
 host.querySelector('.teaching-book').onclick=()=>root.courseOpen?.(subject,lesson.unit);
 buildLayers(host);
}
function show(subject,q,attempt){
 // Logic-only tests and unsupported hosts keep the original practice UI usable.
 if(!document.querySelector||!document.createElement)return;
 lock(subject,false);const old=panels[subject];old?.host.remove();delete panels[subject];
 const key=q?.teachingKey,lesson=T.lesson(key,root.MochiCourse?.data);if(!lesson)return;
 const parent=subject==='maths'?byId('problemCard'):byId('scQuestion')?.parentElement;if(!parent)return;
 const host=document.createElement('section');host.id=subject==='maths'?'mathsTeachingSupport':'scienceTeachingSupport';host.className='teaching-support';host.setAttribute('aria-label','Targeted mini-lesson');
 if(subject==='maths')parent.insertBefore(host,parent.firstChild);else parent.insertBefore(host,byId('scQuestion'));
 panels[subject]={host,key,lesson,page:0,reading:!!q.needsTeaching,attempt};paint(subject);
}
root.MochiTeachingUI={math:(q,a)=>show('maths',q,a),science:q=>show('science',q),active:subject=>!!panels[subject]?.reading};
function init(){if(typeof current!=='undefined'&&current)show('maths',current,studyAttempt);}
if(root.MochiReady)init();else document.addEventListener('mochi:ready',init,{once:true});
})(window);
