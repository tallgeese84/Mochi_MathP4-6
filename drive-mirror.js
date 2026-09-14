/* Mochi v4.3.1 — mirror the exact Back up learning JSON to private Google Drive via Apps Script. */
(function(){
'use strict';
const URL_KEY='mochi_drive_mirror_url_v1';
const SECRET_KEY='mochi_drive_mirror_secret_v1';
const LAST_KEY='mochi_drive_mirror_last_v1';
let nativeSave=null;
let timer=null;
let busy=false;
let lastMessage='Drive mirror not configured.';

function get(k){try{return localStorage.getItem(k)||'';}catch(e){return'';}}
function set(k,v){try{localStorage.setItem(k,v);}catch(e){}}
function relayUrl(){return get(URL_KEY).trim();}
function secret(){return get(SECRET_KEY).trim();}
function configured(){return /^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/i.test(relayUrl())&&secret().length>=24;}
function randomSecret(){
  const bytes=new Uint8Array(24);crypto.getRandomValues(bytes);
  return Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
}
function backupObject(){
  const learning=MochiLearning.init(S);
  const data=MochiLearning.backup(learning);
  if(typeof MochiScience!=='undefined'&&S.science){
    try{data.science=MochiScience.validate(S.science);}catch(e){}
  }
  return data;
}
function status(text,kind=''){lastMessage=text;const el=document.getElementById('driveMirrorStatus');if(el){el.textContent=text;el.dataset.kind=kind;}}
async function mirrorNow(reason='auto'){
  if(!configured()||busy)return false;
  busy=true;status(reason==='manual'?'Sending latest backup to Drive…':'Mirroring learning backup to Drive…');
  try{
    const body={secret:secret(),reason,backup:backupObject()};
    /* text/plain keeps this a simple cross-origin request and avoids CORS preflight. */
    const payload=JSON.stringify(body);
    await window.MochiNetwork.request(relayUrl(),{method:'POST',mode:'no-cors',cache:'no-store',keepalive:reason==='pagehide' && new Blob([payload]).size<60000,headers:{'Content-Type':'text/plain;charset=utf-8'},body:payload});
    const at=new Date().toISOString();set(LAST_KEY,at);
    status('Drive request sent; delivery cannot be confirmed in this browser · '+new Date(at).toLocaleString(), 'ok');paint();
    return true;
  }catch(err){status('Drive mirror failed · '+err.message,'bad');return false;}
  finally{busy=false;}
}
function schedule(){
  if(!configured())return;
  clearTimeout(timer);timer=setTimeout(()=>mirrorNow('autosave'),12000);
}
function wrapSave(){
  if(nativeSave||typeof save!=='function')return;
  nativeSave=save;
  save=async function(obj){const r=await nativeSave(obj);schedule();return r;};
}
function hookBackupButton(){
  const b=document.getElementById('exportLearning');
  if(!b||b.dataset.driveMirrorHook)return;
  b.dataset.driveMirrorHook='1';
  b.addEventListener('click',()=>setTimeout(()=>mirrorNow('manual-backup'),0));
}
function mount(){
  if(document.getElementById('driveMirrorDetails'))return;
  const anchor=document.getElementById('cloudSyncDetails')||document.getElementById('backupStatus');if(!anchor)return;
  const d=document.createElement('details');d.id='driveMirrorDetails';d.className='study-details';
  d.innerHTML=`<summary>ChatGPT learning mirror</summary>
    <p class="study-note">Copies the same JSON made by “Back up learning” into your private Google Drive. Firebase remains the live cross-device database.</p>
    <label class="study-field">Apps Script web-app URL<input id="driveMirrorUrl" type="url" autocomplete="off" placeholder="https://script.google.com/macros/s/…/exec"></label>
    <label class="study-field">Mirror secret<input id="driveMirrorSecret" type="password" autocomplete="off" minlength="24" placeholder="Private relay secret"></label>
    <div class="study-actions"><button class="btn quiet" id="driveMirrorGenerate">Generate secret</button><button class="btn quiet" id="driveMirrorSave">Save settings</button><button class="btn quiet" id="driveMirrorNow">Mirror now</button></div>
    <p class="study-note">Drive folder ID for the relay: <code>1A5A9LZ6vTP2UckVtl5DwdVkc8-ktnlX2</code></p>
    <p id="driveMirrorStatus" class="study-status" role="status"></p>`;
  anchor.insertAdjacentElement('afterend',d);
  document.getElementById('driveMirrorGenerate').onclick=()=>{const v=randomSecret();document.getElementById('driveMirrorSecret').value=v;status('Secret generated. Copy this same value into Apps Script property MIRROR_SECRET before deploying.');};
  document.getElementById('driveMirrorSave').onclick=()=>{const u=document.getElementById('driveMirrorUrl').value.trim(),s=document.getElementById('driveMirrorSecret').value.trim();if(!/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/i.test(u)){status('Paste the deployed Apps Script /exec URL.','bad');return;}if(s.length<24){status('Mirror secret must be at least 24 characters.','bad');return;}set(URL_KEY,u);set(SECRET_KEY,s);status('Drive mirror settings saved.','ok');paint();};
  document.getElementById('driveMirrorNow').onclick=()=>mirrorNow('manual');
  paint();
}
function paint(){
  const u=document.getElementById('driveMirrorUrl'),s=document.getElementById('driveMirrorSecret'),st=document.getElementById('driveMirrorStatus');
  if(u&&document.activeElement!==u)u.value=relayUrl();
  if(s&&document.activeElement!==s)s.value=secret();
  if(st&&!busy){const last=get(LAST_KEY);st.textContent=lastMessage+(last&&lastMessage==='Drive mirror not configured.'?' Last send: '+new Date(last).toLocaleString():'');}
}
function init(){wrapSave();mount();hookBackupButton();document.addEventListener('mochi:cloud-merged',schedule);window.addEventListener('online',schedule);window.addEventListener('pagehide',()=>{if(configured())mirrorNow('pagehide');});setTimeout(()=>{mount();hookBackupButton();},1000);}
if(window.MochiReady)init();else document.addEventListener('mochi:ready',init,{once:true});
})();
