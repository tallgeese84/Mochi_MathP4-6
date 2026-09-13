/* Mochi v4.3.0 — family cloud sync via the same Firebase RTDB configuration used by the other family apps. */
(function(){
'use strict';
const VERSION='4.3.0';
const CONFIG_KEY='cubs_sync';
const META_KEY='mochi_cloud_meta_v1';
const DEVICE_KEY='mochi_cloud_device_v1';
const APP='mochi-math-p4-6';
let nativeSave=null;
let ready=false;
let suppress=0;
let pushTimer=null;
let syncing=false;
let lastStatus='Cloud sync not configured.';

const clone=x=>{try{return JSON.parse(JSON.stringify(x));}catch(e){return null;}};
function deviceId(){
  let v='';try{v=localStorage.getItem(DEVICE_KEY)||'';}catch(e){}
  if(!v){v=(crypto&&crypto.randomUUID?crypto.randomUUID():'d-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2));try{localStorage.setItem(DEVICE_KEY,v);}catch(e){}}
  return v;
}
function config(){
  let raw=null;try{raw=JSON.parse(localStorage.getItem(CONFIG_KEY)||'null');}catch(e){}
  const url=String(raw?.url||'').trim().replace(/\/+$/,'');
  const code=String(raw?.code||'').trim();
  const ok=/^https:\/\/[a-z0-9.-]+\.(?:firebasedatabase\.app|firebaseio\.com)$/i.test(url)&&code.length>=6;
  return{url,code,ok};
}
function saveConfig(url,code){
  url=String(url||'').trim().replace(/\/+$/,'');code=String(code||'').trim();
  if(!/^https:\/\/[a-z0-9.-]+\.(?:firebasedatabase\.app|firebaseio\.com)$/i.test(url))throw Error('Use the Firebase Realtime Database URL ending in firebasedatabase.app or firebaseio.com.');
  if(code.length<6)throw Error('Family code must be at least 6 characters.');
  localStorage.setItem(CONFIG_KEY,JSON.stringify({url,code}));
  return{url,code,ok:true};
}
function endpoint(c=config()){
  if(!c.ok)return'';
  const safe=encodeURIComponent(c.code).replace(/\./g,'%2E');
  return `${c.url}/fam/${safe}/mochi.json`;
}
function meta(){try{return JSON.parse(localStorage.getItem(META_KEY)||'{}')||{};}catch(e){return{};}}
function setMeta(patch){const m={...meta(),...patch};try{localStorage.setItem(META_KEY,JSON.stringify(m));}catch(e){}return m;}
function evidenceTime(s){
  let t=0;
  for(const a of s?.learning?.attempts||[])t=Math.max(t,Number(a.at)||0);
  for(const n of s?.learning?.notes||[])t=Math.max(t,Number(n.at)||0);
  for(const a of s?.science?.attempts||[])t=Math.max(t,Number(a.at)||0);
  for(const n of s?.science?.notes||[])t=Math.max(t,Number(n.at)||0);
  return t;
}
function safeState(src){
  const x=clone(src)||{};
  delete x.keys;delete x.provider;delete x.models;delete x.readModels;
  return x;
}
function unionBy(a,b,key,preferB=false,limit=5000){
  const m=new Map();
  for(const x of Array.isArray(a)?a:[]){const k=key(x);if(k)m.set(k,x);}
  for(const x of Array.isArray(b)?b:[]){const k=key(x);if(k&&(!m.has(k)||preferB))m.set(k,x);}
  return [...m.values()].sort((x,y)=>(Number(x.at)||0)-(Number(y.at)||0)).slice(-limit);
}
function mergeMastery(a,b){
  const out={};for(const k of new Set([...Object.keys(a||{}),...Object.keys(b||{})]))out[k]={a:Math.max(Number(a?.[k]?.a)||0,Number(b?.[k]?.a)||0),c:Math.max(Number(a?.[k]?.c)||0,Number(b?.[k]?.c)||0)};return out;
}
function mergeLearning(a,b,preferB){
  const base=clone(preferB?(b||a):(a||b))||{};
  const other=preferB?a:b;
  base.version=1;
  base.attempts=unionBy(a?.attempts,b?.attempts,x=>String(x?.id||''),preferB,5000);
  base.notes=unionBy(a?.notes,b?.notes,x=>`${Number(x?.at)||0}|${String(x?.question||'').slice(0,120)}|${String(x?.text||'').slice(0,120)}`,preferB,200);
  base.benchmarks=unionBy(a?.benchmarks,b?.benchmarks,x=>`${String(x?.date||'')}|${String(x?.name||'').slice(0,120)}`,preferB,50);
  if(!base.goalMonth)base.goalMonth=other?.goalMonth||'2027-09';
  return base;
}
function mergeScience(a,b,preferB){
  const base=clone(preferB?(b||a):(a||b))||{};
  base.version=1;
  base.attempts=unionBy(a?.attempts,b?.attempts,x=>`${String(x?.item||'')}|${Number(x?.at)||0}`,preferB,1000);
  base.notes=unionBy(a?.notes,b?.notes,x=>`${String(x?.skill||'')}|${Number(x?.at)||0}|${String(x?.text||'').slice(0,120)}`,preferB,100);
  base.seenAssess=[...new Set([...(a?.seenAssess||[]),...(b?.seenAssess||[])])];
  return base;
}
function mergeStates(local,remote,remoteNewer){
  local=clone(local)||{};remote=clone(remote)||{};
  const base=clone(remoteNewer?remote:local)||{};
  const other=remoteNewer?local:remote;
  for(const [k,v] of Object.entries(other))if(base[k]===undefined)base[k]=clone(v);
  base.learning=mergeLearning(local.learning,remote.learning,remoteNewer);
  if(local.science||remote.science)base.science=mergeScience(local.science,remote.science,remoteNewer);
  base.mastery=mergeMastery(local.mastery,remote.mastery);
  for(const k of ['done','right','best','fed'])base[k]=Math.max(Number(local[k])||0,Number(remote[k])||0);
  if(Array.isArray(local.owned)||Array.isArray(remote.owned))base.owned=[...new Set([...(local.owned||[]),...(remote.owned||[])])];
  delete base.keys;delete base.provider;delete base.models;delete base.readModels;
  return base;
}
function sanitizeMerged(s){
  if(typeof MochiLearning!=='undefined'){
    try{s.learning=MochiLearning.restore({app:'Mochi learning',version:1,learning:s.learning||MochiLearning.fresh()});}catch(e){s.learning=MochiLearning.init(s);}
  }
  if(typeof MochiScience!=='undefined'&&s.science)try{s.science=MochiScience.validate(s.science);}catch(e){}
  return s;
}
function status(text,kind=''){lastStatus=text;const el=document.getElementById('cloudSyncStatus');if(el){el.textContent=text;el.dataset.kind=kind;}}
async function getRemote(){
  const ep=endpoint();if(!ep)return null;
  const r=await fetch(ep,{method:'GET',cache:'no-store',headers:{Accept:'application/json'}});
  if(!r.ok)throw Error(`Database read failed (${r.status}).`);
  return await r.json();
}
async function putRemote(state,updatedAt=Date.now()){
  const ep=endpoint();if(!ep)return;
  const payload={schema:1,app:APP,student:'Euna',updatedAt,deviceId:deviceId(),state:safeState(state)};
  const r=await fetch(ep,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
  if(!r.ok)throw Error(`Database write failed (${r.status}).`);
  setMeta({updatedAt,lastPush:Date.now()});
}
function refreshViews(){
  try{if(typeof studyPaint==='function')studyPaint();}catch(e){}
  try{if(typeof studyParent==='function')studyParent();}catch(e){}
  document.dispatchEvent(new CustomEvent('mochi:cloud-merged'));
}
async function pullAndMerge({pushAfter=true,manual=false}={}){
  const c=config();if(!c.ok){status('Cloud sync not configured. Your work is still saved on this device.');return false;}
  if(syncing)return false;syncing=true;status(manual?'Syncing now…':'Checking family cloud…');
  try{
    const remote=await getRemote();
    const m=meta();
    const localAt=Number(m.updatedAt)||evidenceTime(S)||0;
    if(!remote||remote.app!==APP||!remote.state){
      ready=true;const now=Math.max(Date.now(),localAt);await putRemote(S,now);status('Cloud sync connected · this device uploaded Euna’s Mochi progress.','ok');paintSyncConfig();return true;
    }
    const remoteAt=Number(remote.updatedAt)||0;
    const merged=sanitizeMerged(mergeStates(S,remote.state,remoteAt>localAt));
    const before=JSON.stringify(safeState(S));
    const after=JSON.stringify(safeState(merged));
    if(before!==after){
      suppress++;try{S=merged;await nativeSave(S);}finally{suppress--;}
      refreshViews();
    }
    const mergedAt=Math.max(localAt,remoteAt,Date.now());
    setMeta({updatedAt:mergedAt,lastPull:Date.now(),remoteAt});
    ready=true;
    if(pushAfter)await putRemote(S,mergedAt);
    status('Cloud sync up to date · Euna’s progress is shared across family devices.','ok');paintSyncConfig();return true;
  }catch(err){ready=true;status('Cloud sync unavailable · '+err.message+' Local progress is safe.','bad');paintSyncConfig();return false;}
  finally{syncing=false;}
}
function schedulePush(){
  if(!ready||!config().ok||suppress)return;
  clearTimeout(pushTimer);pushTimer=setTimeout(async()=>{
    if(syncing)return;syncing=true;status('Saving to family cloud…');
    try{const now=Date.now();setMeta({updatedAt:now});await putRemote(S,now);status('Saved to family cloud.','ok');paintSyncConfig();}
    catch(err){status('Cloud save failed · '+err.message+' Local progress is safe.','bad');}
    finally{syncing=false;}
  },900);
}
function wrapSave(){
  if(nativeSave||typeof save!=='function')return;
  nativeSave=save;
  save=async function(obj){const result=await nativeSave(obj);if(!suppress){setMeta({updatedAt:Date.now()});schedulePush();}return result;};
}
function mountUI(){
  if(document.getElementById('cloudSyncDetails'))return;
  const anchor=document.getElementById('backupStatus')||document.querySelector('#panel .study-actions');if(!anchor)return;
  const box=document.createElement('details');box.id='cloudSyncDetails';box.className='study-details';
  box.innerHTML=`<summary>Family cloud sync</summary>
    <p class="study-note">Uses the same family Firebase configuration as the other learning apps. Mochi stores its data separately, so it does not overwrite Pokémon Academy progress.</p>
    <label class="study-field">Firebase database URL<input id="cloudDbUrl" type="url" autocomplete="off" placeholder="https://…firebasedatabase.app"></label>
    <label class="study-field">Family code<input id="cloudFamilyCode" type="password" autocomplete="off" minlength="6" placeholder="Same family code used by the other apps"></label>
    <div class="study-actions"><button class="btn quiet" id="cloudSyncSave">Save & sync</button><button class="btn quiet" id="cloudSyncNow">Sync now</button></div>
    <p id="cloudSyncStatus" class="study-status" role="status"></p>`;
  anchor.insertAdjacentElement('beforebegin',box);
  document.getElementById('cloudSyncSave').onclick=async()=>{
    try{saveConfig(document.getElementById('cloudDbUrl').value,document.getElementById('cloudFamilyCode').value);setMeta({updatedAt:evidenceTime(S)||Date.now()});await pullAndMerge({pushAfter:true,manual:true});}
    catch(err){status(err.message,'bad');}
  };
  document.getElementById('cloudSyncNow').onclick=()=>pullAndMerge({pushAfter:true,manual:true});
  paintSyncConfig();
}
function paintSyncConfig(){
  const c=config(),u=document.getElementById('cloudDbUrl'),f=document.getElementById('cloudFamilyCode');
  if(u&&document.activeElement!==u)u.value=c.url||'';
  if(f&&document.activeElement!==f)f.value=c.code||'';
  const s=document.getElementById('cloudSyncStatus');if(s&&!syncing)s.textContent=lastStatus;
}
async function init(){
  wrapSave();mountUI();
  const c=config();
  if(c.ok){status('Connecting to family cloud…');await pullAndMerge({pushAfter:true});}
  else{ready=true;status('Cloud sync not configured. Enter the same Firebase URL and family code used by the other apps.');}
  window.addEventListener('online',()=>pullAndMerge({pushAfter:true}));
  window.addEventListener('focus',()=>{const m=meta();if(Date.now()-(Number(m.lastPull)||0)>15000)pullAndMerge({pushAfter:true});});
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){const m=meta();if(Date.now()-(Number(m.lastPull)||0)>60000)pullAndMerge({pushAfter:true});}});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,0),{once:true});else setTimeout(init,0);
})();
