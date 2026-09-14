/* Mochi v4.3.1 — mirror the exact downloadable learning backup to Firebase. */
(function(){
'use strict';
const CONFIG_KEY='cubs_sync';
let busy=false;

function cfg(){
  let x=null;try{x=JSON.parse(localStorage.getItem(CONFIG_KEY)||'null');}catch(e){}
  const url=String(x?.url||'').trim().replace(/\/+$/,''),code=String(x?.code||'').trim();
  return{url,code,ok:/^https:\/\/[a-z0-9.-]+\.(?:firebasedatabase\.app|firebaseio\.com)$/i.test(url)&&code.length>=6};
}
function endpoint(){
  const c=cfg();if(!c.ok)return'';
  return `${c.url}/fam/${encodeURIComponent(c.code).replace(/\./g,'%2E')}/mochiBackup/latest.json`;
}
function makeBackup(){
  const data=MochiLearning.backup(MochiLearning.init(S));
  if(typeof scDraft==='function')try{scDraft();}catch(e){}
  if(typeof MochiScience!=='undefined'&&S.science)try{data.science=MochiScience.validate(S.science);}catch(e){}
  return data;
}
function setStatus(text){
  const b=document.getElementById('backupStatus');if(b)b.textContent=text;
  const c=document.getElementById('cloudBackupStatus');if(c)c.textContent=text;
}
async function saveBackup(data=makeBackup()){
  const ep=endpoint();
  if(!ep){setStatus('Cloud backup is not configured. Use Back up learning to download a local copy.');return false;}
  if(busy)return false;busy=true;
  try{
    /* Store the exact same JSON object as the downloaded file — no wrapper or credentials. */
    const r=await window.MochiNetwork.request(ep,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
    if(!r.ok)throw Error(`Firebase backup write failed (${r.status}).`);
    setStatus('Learning backup saved to Firebase cloud backup.');
    document.dispatchEvent(new CustomEvent('mochi:cloud-backup-saved',{detail:{exported:data.exported||''}}));
    return true;
  }catch(err){
    setStatus('Cloud backup failed; local learning progress is unchanged: '+err.message);
    return false;
  }finally{busy=false;}
}
function mount(){
  const exportBtn=document.getElementById('exportLearning');
  if(exportBtn&&!exportBtn.dataset.cloudBackupHook){
    exportBtn.dataset.cloudBackupHook='1';
    exportBtn.addEventListener('click',()=>setTimeout(()=>saveBackup(makeBackup()),0));
  }
  const details=document.getElementById('cloudSyncDetails');
  if(details&&!document.getElementById('cloudBackupNow')){
    const p=document.createElement('div');p.className='study-actions';
    p.innerHTML='<button type="button" class="btn quiet" id="cloudBackupNow">Save cloud backup now</button><span id="cloudBackupStatus" class="study-status"></span>';
    details.appendChild(p);
    document.getElementById('cloudBackupNow').onclick=()=>saveBackup(makeBackup());
  }
}
function init(){mount();setTimeout(mount,500);document.addEventListener('mochi:cloud-merged',mount);}
window.MochiCloudBackup={save:saveBackup,make:makeBackup};
if(window.MochiReady)init();else document.addEventListener('mochi:ready',init,{once:true});
})();
