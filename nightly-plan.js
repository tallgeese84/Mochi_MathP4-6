/* Private plan receiver. Credentials remain in existing device settings, never URLs/exports.
   The Google relay must be upgraded once. A failed/opaque read is NOT a delivered plan. */
(function(root){
'use strict';
const C=root.MochiNightlyPlanCore,CACHE='mochi_nightly_plan_v1',DISABLED='mochi_nightly_disabled_v1';
const $=id=>document.getElementById(id),engines=()=>({maths:root.MochiEntrance,science:root.MochiSciencePath});
let record=null,pending=null,scope='',epoch=0,busy=false,lastAttempt=0,lastChecked=0,status='Nightly connection not checked yet.';
function get(k){try{return localStorage.getItem(k)||'';}catch(_){return '';}}
function put(k,v){try{localStorage.setItem(k,v);return true;}catch(_){return false;}}
const enabled=()=>get(DISABLED)!=='1';
function config(){return {url:get('mochi_drive_mirror_url_v1').trim(),secret:get('mochi_drive_mirror_secret_v1').trim()};}
function configured(c){return /^https:\/\/script\.google\.com\/macros\/s\/[a-zA-Z0-9_-]+\/exec$/.test(c.url)&&c.secret.length>=24;}
async function scopeOf(c){const bytes=new TextEncoder().encode(c.url+'\n'+c.secret);return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('');}
function persist(){if(scope)put(CACHE,JSON.stringify({scope,record,pending}));}
function signal(){paint();document.dispatchEvent(new Event('mochi:nightly-plan'));}
function busyScreen(){return [root.MochiEntranceUI,root.MochiSciencePathUI].some(u=>u?.visible()&&['lesson','practice','paper'].includes(u.view().kind));}
function adopt(safe=false){if(!enabled()||!pending||!C.usable(pending)||!safe&&busyScreen())return false;record=C.fresh(pending);pending=null;persist();signal();return true;}
function adoptAtBoundary(state,subject){const d=state[subject==='maths'?'entrance':'sciencePath'];if(!d?.draft&&!Object.values(d?.papers||{}).some(p=>!p.submittedAt))adopt(true);}
function currentPlan(){return enabled()&&record&&C.usable(record.plan)?record.plan:null;}
function receive(plan){
 const old=pending||record?.plan;
 if(old){
  if(plan.sessionDate<old.sessionDate||plan.sessionDate===old.sessionDate&&(plan.revision<old.revision||Date.parse(plan.sourceExportedAt)<Date.parse(old.sourceExportedAt)))throw Error('Older plan ignored.');
  if(plan.sessionDate===old.sessionDate&&plan.revision===old.revision){if(C.signature(plan)!==C.signature(old))throw Error('Conflicting plan revision ignored.');return false;}
 }
 pending=plan;persist();adopt();return true;
}
async function refresh(force=false){
 if(busy||!force&&Date.now()-lastAttempt<300000)return false;
 const c=config();if(!enabled()){status='Nightly priorities are switched off. Built-in learning continues.';signal();return false;}
 if(!configured(c)){record=null;pending=null;status='One-time connection needed: configure the existing Drive mirror, then upgrade its relay.';signal();return false;}
 if(navigator.onLine===false){status='Offline. Using a saved plan for this date, or the built-in adaptive plan.';signal();return false;}
 const requestEpoch=epoch;busy=true;lastAttempt=Date.now();status='Checking the private nightly plan…';signal();
 try{
  const nextScope=await scopeOf(c);if(epoch!==requestEpoch)return false;
  if(nextScope!==scope){record=null;pending=null;scope=nextScope;try{const saved=JSON.parse(get(CACHE)||'null');if(saved?.scope===scope){record=C.restore(saved.record,engines());pending=saved.pending?C.validate(saved.pending,engines()):null;}}catch(_){} }
  // A simple POST follows Google's content-service redirect; no JSONP or URL secrets.
  const payload=await root.MochiNetwork.request(c.url,{method:'POST',mode:'cors',credentials:'omit',redirect:'follow',cache:'no-store',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:'readNextSession',secret:c.secret})},true);
  if(epoch!==requestEpoch)return false;
  if(!payload||JSON.stringify(payload).length>24000)throw Error('Invalid plan response.');
  if(payload.service!=='mochi-drive-mirror'||payload.planApi!==1){status='One-time relay upgrade needed. Your existing progress mirror is unchanged.';signal();return false;}
  if(!payload.ok)throw Error('Private plan unavailable. Check the relay setup in Grown-ups.');
  lastChecked=Date.now();
  if(payload.plan===null){status='No nightly plan published yet. Built-in learning continues.';signal();return true;}
  const plan=C.validate(payload.plan,engines());receive(plan);
  status=plan.sessionDate===C.day(Date.now(),plan.timeZone)?(pending?'New priorities received; they will start after the current activity.':'Nightly priorities received and available to Daily Quests.'):'No plan for this date. Built-in learning continues.';signal();return true;
 }catch(_){if(epoch===requestEpoch){status='Nightly update unavailable. Keep studying; check the one-time relay setup or connection in Grown-ups.';signal();}return false;}
 finally{if(epoch===requestEpoch)busy=false;}
}
function next(state,subject,now){return enabled()?C.next(record,state,subject,engines(),now):null;}
function bind(task,view,draft){if(!enabled())return;C.bind(record,task,view,draft);persist();}
function boundary(state,subject){if(!enabled())return;if(C.settle(record,state,subject))persist();}
function lessonDone(subject,id){if(!enabled())return;if(C.lessonDone(record,subject,id))persist();}
function label(){const p=currentPlan();if(p)return `Nightly priorities · ${p.sessionDate} · based on ${p.reviewedDate}`;return enabled()?'Built-in plan · no nightly priorities loaded for this date':'Built-in adaptive plan';}
function report(){const p=currentPlan();return {schema:1,enabled:enabled(),lastCheckedAt:lastChecked?new Date(lastChecked).toISOString():null,status:p?'available':'built-in',...(p?{planId:p.id,revision:p.revision,sessionDate:p.sessionDate,reviewedDate:p.reviewedDate,sourceExportedAt:p.sourceExportedAt,receivedAt:new Date(record.receivedAt).toISOString(),adoptedAt:new Date(record.adoptedAt).toISOString(),steps:Object.fromEntries(['maths','science'].map(s=>[s,{index:record.progress[s].index,total:p.subjects[s].steps.length,questionsInStep:record.progress[s].count,activeQuestion:record.progress[s].active?.kind==='practice'?record.progress[s].active.id:null}]))}:{})};}
function paint(){
 const small=$('todayNightlyStatus');if(small)small.textContent=label();
 const out=$('nightlyPlanStatus');if(out)out.textContent=status+' '+(currentPlan()?`Plan ${record.plan.sessionDate}, revision ${record.plan.revision}.`:'');
 const b=$('nightlyPlanRefresh');if(b)b.disabled=busy;const e=$('nightlyPlanEnable');if(e)e.checked=enabled();
}
function mount(){
 if($('nightlyPlanSettings'))return;
 const anchor=$('driveMirrorDetails');if(!anchor)return;
 const d=document.createElement('details');d.className='study-details';d.id='nightlyPlanSettings';d.innerHTML='<summary>Nightly learning priorities</summary><p class="study-note">Receives a private, dated lesson plan. Daily priorities do not change the app version, time targets, scores or earned cats. Saved work and scheduled recall come first.</p><label><input id="nightlyPlanEnable" type="checkbox"> Use nightly priorities in Daily Quests</label><div class="study-actions"><button id="nightlyPlanRefresh" class="btn quiet" type="button">Check plan connection</button></div><p id="nightlyPlanStatus" class="study-status" role="status"></p><p class="study-note">One-time setup: replace the existing relay code with the updated <a href="tools/mochi-drive-mirror.gs" download>Drive mirror script</a>, run <code>setupNightlyPlan</code> once, then update its existing web-app deployment to a new version. Keep the same URL and secret. <a href="tools/NIGHTLY_PLAN_SETUP.md" target="_blank" rel="noopener">Setup and privacy details</a></p>';
 anchor.after(d);$('nightlyPlanRefresh').onclick=()=>refresh(true);$('nightlyPlanEnable').onchange=()=>{epoch++;busy=false;put(DISABLED,$('nightlyPlanEnable').checked?'0':'1');if(enabled()){adopt();refresh(true);}else{status='Nightly priorities are switched off. Existing learning records are unchanged.';signal();}};paint();
}
function init(){
 mount();document.addEventListener('mochi:mirror-settings',()=>{epoch++;busy=false;scope='';record=null;pending=null;lastAttempt=0;refresh(true);});
 document.addEventListener('mochi:activity',()=>{if(root.MochiTodayUI?.visible()){adopt();refresh();}paint();});
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){adopt();refresh();paint();}});
 root.addEventListener('online',()=>refresh(true));root.addEventListener('storage',e=>{if(['mochi_drive_mirror_url_v1','mochi_drive_mirror_secret_v1',DISABLED].includes(e.key)){epoch++;busy=false;record=null;pending=null;scope='';lastAttempt=0;refresh(true);}});
 // Load the credential-bound cache even offline; do not require a network request to use it.
 const c=config();if(enabled()&&configured(c))scopeOf(c).then(s=>{if(scope||config().url!==c.url||config().secret!==c.secret)return;scope=s;try{const saved=JSON.parse(get(CACHE)||'null');if(saved?.scope===scope){record=C.restore(saved.record,engines());pending=saved.pending?C.validate(saved.pending,engines()):null;}}catch(_){}adopt();signal();refresh(true);}).catch(()=>{status='Private plan storage is unavailable in this browser. Built-in learning continues.';signal();});else refresh(true);
 setTimeout(()=>{mount();paint();},1200);
}
root.MochiNightlyPlan={next,bind,boundary,lessonDone,refresh,adopt,adoptAtBoundary,label,report,paint,active:()=>!!currentPlan()};
if(root.MochiReady)init();else document.addEventListener('mochi:ready',init,{once:true});
})(window);
