/* Private plan receiver. Credentials remain in existing device settings, never URLs/exports.
   The Google relay must be upgraded once. A failed/opaque read is NOT a delivered plan. */
(function(root){
'use strict';
const C=root.MochiNightlyPlanCore,CACHE='mochi_nightly_plan_v1',DISABLED='mochi_nightly_disabled_v1';
const $=id=>document.getElementById(id),engines=()=>({maths:root.MochiEntrance,science:root.MochiSciencePath});
let record=null,pending=null,scope='',epoch=0,busy=false,lastAttempt=0,lastChecked=0,status='Nightly connection not checked yet.',retryTimer=null,pendingReceivedAt=0;
let health={reasonCode:'NOT_CHECKED',lastAttemptAt:null,lastSuccessAt:null,consecutiveFailures:0,lastOffered:null};
const fail=(code,message)=>Object.assign(new Error(message),{planCode:code});
const reason=code=>{health.reasonCode=code;};
function resetHealth(){pendingReceivedAt=0;lastChecked=0;health={reasonCode:'NOT_CHECKED',lastAttemptAt:null,lastSuccessAt:null,consecutiveFailures:0,lastOffered:null};}
function cancelRetry(){if(retryTimer!==null){clearTimeout(retryTimer);retryTimer=null;}}
function retry(){cancelRetry();if(health.consecutiveFailures>2||document.hidden||navigator.onLine===false||!enabled())return;retryTimer=setTimeout(()=>{retryTimer=null;if(!document.hidden&&navigator.onLine!==false&&enabled())refresh(true);},health.consecutiveFailures===1?30000:120000);}
const receipt=(p,receivedAt,adoptedAt=null,startedAt=null)=>p?{planId:p.id,revision:p.revision,sessionDate:p.sessionDate,sourceExportedAt:p.sourceExportedAt,receivedAt:receivedAt?new Date(receivedAt).toISOString():null,adoptedAt:adoptedAt?new Date(adoptedAt).toISOString():null,startedAt:startedAt?new Date(startedAt).toISOString():null}:null;
function get(k){try{return localStorage.getItem(k)||'';}catch(_){return '';}}
function put(k,v){try{localStorage.setItem(k,v);return true;}catch(_){return false;}}
const enabled=()=>get(DISABLED)!=='1';
function config(){return {url:get('mochi_drive_mirror_url_v1').trim(),secret:get('mochi_drive_mirror_secret_v1').trim()};}
function configured(c){return /^https:\/\/script\.google\.com\/macros\/s\/[a-zA-Z0-9_-]+\/exec$/.test(c.url)&&c.secret.length>=24;}
async function scopeOf(c){const bytes=new TextEncoder().encode(c.url+'\n'+c.secret);return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('');}
function persist(){if(scope)put(CACHE,JSON.stringify({scope,record,pending,pendingReceivedAt,health}));}
function signal(){paint();document.dispatchEvent(new Event('mochi:nightly-plan'));}
function busyScreen(){return [root.MochiEntranceUI,root.MochiSciencePathUI].some(u=>u?.visible()&&['lesson','practice','paper'].includes(u.view().kind));}
function adopt(safe=false){if(!enabled()||!pending||!C.usable(pending)||!safe&&busyScreen())return false;record=C.fresh(pending);record.receivedAt=pendingReceivedAt||record.receivedAt;pending=null;pendingReceivedAt=0;persist();signal();return true;}
function adoptAtBoundary(state,subject){const d=state[subject==='maths'?'entrance':'sciencePath'];if(!d?.draft&&!Object.values(d?.papers||{}).some(p=>!p.submittedAt))adopt(true);}
function currentPlan(){return enabled()&&record&&C.usable(record.plan)?record.plan:null;}
function receive(plan){
 const old=pending||record?.plan;
 if(old){
  if(plan.sessionDate<old.sessionDate||plan.sessionDate===old.sessionDate&&(plan.revision<old.revision||Date.parse(plan.sourceExportedAt)<Date.parse(old.sourceExportedAt)))throw fail('OLDER_PLAN','Older plan ignored.');
  if(plan.sessionDate===old.sessionDate&&plan.revision===old.revision){if(C.signature(plan)!==C.signature(old))throw fail('REVISION_CONFLICT','Conflicting plan revision ignored.');return false;}
 }
 pending=plan;pendingReceivedAt=Date.now();persist();adopt();return true;
}
async function refresh(force=false){
 if(busy||!force&&C.day(Date.now(),'America/Chicago')===C.day(lastAttempt,'America/Chicago')&&Date.now()-lastAttempt<300000)return false;
 const c=config();if(!enabled()){cancelRetry();reason('DISABLED');status='Nightly priorities are switched off. Built-in learning continues.';signal();return false;}
 if(!configured(c)){cancelRetry();resetHealth();reason('NOT_CONNECTED');record=null;pending=null;status='One-time connection needed: configure the existing Drive mirror, then upgrade its relay.';signal();return false;}
 if(navigator.onLine===false){cancelRetry();reason('OFFLINE');status='Offline. Using a saved plan for this date, or the built-in adaptive plan.';signal();return false;}
 const requestEpoch=epoch;cancelRetry();busy=true;lastAttempt=Date.now();health.lastAttemptAt=new Date(lastAttempt).toISOString();reason('CHECKING');status='Checking the private nightly plan…';signal();
 try{
  const nextScope=await scopeOf(c);if(epoch!==requestEpoch)return false;
  if(nextScope!==scope){record=null;pending=null;resetHealth();health.lastAttemptAt=new Date(lastAttempt).toISOString();reason('CHECKING');scope=nextScope;try{const saved=JSON.parse(get(CACHE)||'null');if(saved?.scope===scope){record=C.restore(saved.record,engines());pending=saved.pending?C.validate(saved.pending,engines()):null;pendingReceivedAt=Number.isFinite(saved.pendingReceivedAt)?saved.pendingReceivedAt:0;}}catch(_){} }
  // A simple POST follows Google's content-service redirect; no JSONP or URL secrets.
  const payload=await root.MochiNetwork.request(c.url,{method:'POST',mode:'cors',credentials:'omit',redirect:'follow',cache:'no-store',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:'readNextSession',secret:c.secret})},true);
  if(epoch!==requestEpoch)return false;
  if(!payload||JSON.stringify(payload).length>24000)throw fail('OVERSIZED_RESPONSE','Invalid plan response.');
  if(payload.service!=='mochi-drive-mirror'||payload.planApi!==1){throw fail('UNSUPPORTED_RELAY','One-time relay upgrade needed.');}
  if(!payload.ok)throw fail('RELAY_REJECTED','Private plan unavailable. Check the relay setup in Grown-ups.');
  lastChecked=Date.now();
  if(payload.plan===null){reason('NO_PLAN');health.lastSuccessAt=new Date(lastChecked).toISOString();health.consecutiveFailures=0;persist();status='No nightly plan published yet. Built-in learning continues.';signal();return true;}
  let plan;try{plan=C.validate(payload.plan,engines());}catch(_){throw fail('INVALID_PLAN','Plan validation failed.');}receive(plan);
  health.lastSuccessAt=new Date(lastChecked).toISOString();health.consecutiveFailures=0;health.lastOffered=receipt(plan,pendingReceivedAt||record?.receivedAt);reason(C.usable(plan)?'READY':plan.sessionDate<C.day(Date.now(),plan.timeZone)?'EXPIRED_PLAN':'FUTURE_PLAN');persist();
  status=plan.sessionDate===C.day(Date.now(),plan.timeZone)?(pending?'New priorities received; they will start after the current activity.':'Nightly priorities received and available to Daily Quests.'):'No plan for this date. Built-in learning continues.';signal();return true;
 }catch(error){if(epoch===requestEpoch){const allowed=['TIMEOUT','HTTP_ERROR','OPAQUE_RESPONSE','INVALID_JSON','OVERSIZED_RESPONSE','UNSUPPORTED_RELAY','RELAY_REJECTED','INVALID_PLAN','OLDER_PLAN','REVISION_CONFLICT'];reason(allowed.includes(error?.planCode)?error.planCode:'FETCH_FAILED');health.consecutiveFailures=Math.min(999,health.consecutiveFailures+1);status='Nightly update unavailable. Built-in learning or a valid saved plan continues.';persist();signal();retry();}return false;}
 finally{if(epoch===requestEpoch)busy=false;}
}
function next(state,subject,now){return enabled()?C.next(record,state,subject,engines(),now):null;}
function bind(task,view,draft){if(!enabled())return;C.bind(record,task,view,draft);persist();signal();}
function boundary(state,subject){if(!enabled())return;if(C.settle(record,state,subject))persist();}
function lessonDone(subject,id){if(!enabled())return;if(C.lessonDone(record,subject,id))persist();}
function label(){const p=currentPlan();if(p)return `Nightly priorities · ${p.sessionDate} · based on ${p.reviewedDate}`;return enabled()?'Built-in plan · no nightly priorities loaded for this date':'Built-in adaptive plan';}
function report(){const p=currentPlan();return {schema:1,enabled:enabled(),lastCheckedAt:lastChecked?new Date(lastChecked).toISOString():null,status:p?'available':'built-in',diagnostics:{...health},received:receipt(pending||record?.plan,pending?pendingReceivedAt:record?.receivedAt,pending?null:record?.adoptedAt),active:p?receipt(p,record.receivedAt,record.adoptedAt,record.startedAt):null,delivery:{localDate:C.day(Date.now(),'America/Chicago'),timeZone:'America/Chicago',stage:p?(record.startedAt?'work-started':'adopted-awaiting-task'):pending&&C.usable(pending)?'received-awaiting-boundary':pending&&pending.sessionDate>C.day(Date.now(),'America/Chicago')?'future-plan-cached':'built-in'},...(p?{planId:p.id,revision:p.revision,sessionDate:p.sessionDate,reviewedDate:p.reviewedDate,sourceExportedAt:p.sourceExportedAt,receivedAt:new Date(record.receivedAt).toISOString(),adoptedAt:new Date(record.adoptedAt).toISOString(),steps:Object.fromEntries(['maths','science'].map(s=>[s,{index:record.progress[s].index,total:p.subjects[s].steps.length,questionsInStep:record.progress[s].count,activeQuestion:record.progress[s].active?.kind==='practice'?record.progress[s].active.id:null}]))}:{})};}
function paint(){
 // Euna sees a friendly line only when a plan is in use; plan dates and status stay in Grown-ups.
 const small=$('todayNightlyStatus');if(small){const on=!!currentPlan();small.textContent=on?'Today’s quests were picked just for you.':'';small.hidden=!on;}
 const out=$('nightlyPlanStatus');if(out)out.textContent=status+' ['+health.reasonCode+'] '+(currentPlan()?`Plan ${record.plan.sessionDate}, revision ${record.plan.revision}.`:'');
 const b=$('nightlyPlanRefresh');if(b)b.disabled=busy;const e=$('nightlyPlanEnable');if(e)e.checked=enabled();
}
function mount(){
 if($('nightlyPlanSettings'))return;
 const anchor=$('driveMirrorDetails');if(!anchor)return;
 const d=document.createElement('details');d.className='study-details';d.id='nightlyPlanSettings';d.innerHTML='<summary>Nightly learning priorities</summary><p class="study-note">Receives a private, dated lesson plan. Daily priorities do not change the app version, time targets, scores or earned cats. Saved work and scheduled recall come first.</p><label><input id="nightlyPlanEnable" type="checkbox"> Use nightly priorities in Daily Quests</label><div class="study-actions"><button id="nightlyPlanRefresh" class="btn quiet" type="button">Check plan connection</button></div><p id="nightlyPlanStatus" class="study-status" role="status"></p><p class="study-note">One-time setup: replace the existing relay code with the updated <a href="tools/mochi-drive-mirror.gs" download>Drive mirror script</a>, run <code>setupNightlyPlan</code> once, then update its existing web-app deployment to a new version. Keep the same URL and secret. <a href="tools/NIGHTLY_PLAN_SETUP.md" target="_blank" rel="noopener">Setup and privacy details</a></p>';
 anchor.after(d);$('nightlyPlanRefresh').onclick=()=>refresh(true);$('nightlyPlanEnable').onchange=()=>{cancelRetry();epoch++;busy=false;put(DISABLED,$('nightlyPlanEnable').checked?'0':'1');if(enabled()){adopt();refresh(true);}else{status='Nightly priorities are switched off. Existing learning records are unchanged.';signal();}};paint();
}
function init(){
 mount();document.addEventListener('mochi:mirror-settings',()=>{cancelRetry();epoch++;busy=false;scope='';record=null;pending=null;resetHealth();lastAttempt=0;refresh(true);});
 document.addEventListener('mochi:activity',()=>{if(root.MochiTodayUI?.visible()){adopt();refresh();}paint();});
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){adopt();refresh();paint();}});
 root.addEventListener('online',()=>refresh(true));root.addEventListener('storage',e=>{if(['mochi_drive_mirror_url_v1','mochi_drive_mirror_secret_v1',DISABLED].includes(e.key)){cancelRetry();epoch++;busy=false;record=null;pending=null;scope='';resetHealth();lastAttempt=0;refresh(true);}});
 // Load the credential-bound cache even offline; do not require a network request to use it.
 const c=config();if(enabled()&&configured(c))scopeOf(c).then(s=>{if(scope||config().url!==c.url||config().secret!==c.secret)return;scope=s;try{const saved=JSON.parse(get(CACHE)||'null');if(saved?.scope===scope){record=C.restore(saved.record,engines());pending=saved.pending?C.validate(saved.pending,engines()):null;pendingReceivedAt=Number.isFinite(saved.pendingReceivedAt)?saved.pendingReceivedAt:0;}}catch(_){}adopt();signal();refresh(true);}).catch(()=>{status='Private plan storage is unavailable in this browser. Built-in learning continues.';signal();});else refresh(true);
 setTimeout(()=>{mount();paint();},1200);
 let foregroundTimer=null;
 const stop=()=>{if(foregroundTimer!==null){clearInterval(foregroundTimer);foregroundTimer=null;}};
 const start=()=>{stop();foregroundTimer=setInterval(()=>{if(!document.hidden)refresh();},300000);};
 root.addEventListener('pagehide',()=>{stop();cancelRetry();});root.addEventListener('pageshow',()=>{start();refresh();});start();
}
root.MochiNightlyPlan={next,bind,boundary,lessonDone,refresh,adopt,adoptAtBoundary,label,report,paint,active:()=>!!currentPlan()};
if(root.MochiReady)init();else document.addEventListener('mochi:ready',init,{once:true});
})(window);
