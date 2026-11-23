/* Firebase family progress sync. Local saves are immediate; cloud checkpoints are batched. */
(function(){
'use strict';
const CONFIG_KEY='cubs_sync', META_KEY='mochi_cloud_meta_v1', DEVICE_KEY='mochi_cloud_device_v1', APP='mochi-math-p4-6';
const CHECKPOINT_MS = 5 * 60 * 1000;
let localSave=null, timer=null, syncing=false, inFlight=null, followUp=null, dirty=false, starting=false, edits=0;
let familyUrl='', knownTag=null, baseline=null, lastRemoteAt=0, lastStatus='Cloud sync not configured.';
const cp=x=>{try{return JSON.parse(JSON.stringify(x));}catch(e){return null;}};
function cfg(){let x=null;try{x=JSON.parse(localStorage.getItem(CONFIG_KEY)||'null');}catch(e){}const url=String(x?.url||'').trim().replace(/\/+$/,''),code=String(x?.code||'').trim();return{url,code,ok:/^https:\/\/[a-z0-9.-]+\.(?:firebasedatabase\.app|firebaseio\.com)$/i.test(url)&&code.length>=6};}
function setCfg(url,code){url=String(url||'').trim().replace(/\/+$/,'');code=String(code||'').trim();if(!/^https:\/\/[a-z0-9.-]+\.(?:firebasedatabase\.app|firebaseio\.com)$/i.test(url))throw Error('Use the Firebase Realtime Database URL ending in firebasedatabase.app or firebaseio.com.');if(code.length<6)throw Error('Family code must be at least 6 characters.');localStorage.setItem(CONFIG_KEY,JSON.stringify({url,code}));}
function endpoint(c=cfg()){return c.ok?`${c.url}/fam/${encodeURIComponent(c.code).replace(/\./g,'%2E')}/mochi.json`:'';}
function meta(){try{return JSON.parse(localStorage.getItem(META_KEY)||'{}')||{};}catch(e){return{};}}
function setMeta(x){try{localStorage.setItem(META_KEY,JSON.stringify({...meta(),...x}));}catch(e){}}
function device(){let x='';try{x=localStorage.getItem(DEVICE_KEY)||'';}catch(e){}if(!x){x=globalThis.crypto?.randomUUID?.()||('d-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2));try{localStorage.setItem(DEVICE_KEY,x);}catch(e){}}return x;}
function latest(s){let t=0;for(const group of [s?.learning?.attempts,s?.learning?.notes,s?.science?.attempts,s?.science?.notes,s?.course?.attempts])for(const x of group||[])t=Math.max(t,Number(x?.at)||0);return t;}
function uploadState(s){const x=cp(s)||{};for(const k of ['keys','provider','models','readModels'])delete x[k];return x;}
function mergeList(a,b,key,preferB,limit){const m=new Map();for(const x of a||[]){const k=key(x);if(k)m.set(k,x);}for(const x of b||[]){const k=key(x);if(k&&(!m.has(k)||preferB))m.set(k,x);}return[...m.values()].sort((x,y)=>(+x.at||0)-(+y.at||0)).slice(-limit);}
function mergeLearning(a={},b={},preferB){const out=cp(preferB?b:a)||{};out.version=1;out.attempts=mergeList(a.attempts,b.attempts,x=>String(x?.id||''),preferB,5000);out.notes=mergeList(a.notes,b.notes,x=>`${+x?.at||0}|${String(x?.question||'').slice(0,100)}|${String(x?.text||'').slice(0,100)}`,preferB,200);out.benchmarks=mergeList(a.benchmarks,b.benchmarks,x=>`${x?.date||''}|${String(x?.name||'').slice(0,100)}`,preferB,50);return out;}
function mergeScience(a={},b={},preferB){const out=cp(preferB?b:a)||{};out.version=1;out.attempts=mergeList(a.attempts,b.attempts,x=>`${x?.item||''}|${+x?.at||0}`,preferB,1000);out.notes=mergeList(a.notes,b.notes,x=>`${x?.skill||''}|${+x?.at||0}|${String(x?.text||'').slice(0,100)}`,preferB,100);out.seenAssess=[...new Set([...(a.seenAssess||[]),...(b.seenAssess||[])])];return out;}
function mastery(a={},b={}){const out={};for(const k of new Set([...Object.keys(a),...Object.keys(b)]))out[k]={a:Math.max(+a[k]?.a||0,+b[k]?.a||0),c:Math.max(+a[k]?.c||0,+b[k]?.c||0)};return out;}
function mergeState(local={},remote={},remoteNewer){const out=cp(remoteNewer?remote:local)||{},other=remoteNewer?local:remote;for(const [k,v] of Object.entries(other))if(out[k]===undefined)out[k]=cp(v);out.learning=mergeLearning(local.learning,remote.learning,remoteNewer);if(local.science||remote.science)out.science=mergeScience(local.science,remote.science,remoteNewer);if(window.MochiCourse&&(local.course||remote.course))out.course=MochiCourse.merge(local.course,remote.course);if(window.MochiPlanner&&(local.planner||remote.planner))out.planner=MochiPlanner.merge(local.planner,remote.planner);if(window.MochiCatFriends)out.catFriends=MochiCatFriends.merge(local.catFriends,remote.catFriends);if(window.MochiEntrance&&(local.entrance||remote.entrance))out.entrance=MochiEntrance.merge(local.entrance,remote.entrance);if(window.MochiSciencePath&&(local.sciencePath||remote.sciencePath))out.sciencePath=MochiSciencePath.merge(local.sciencePath,remote.sciencePath);if(window.MochiQuestRewards&&(local.questRewards||remote.questRewards))out.questRewards=MochiQuestRewards.merge(local.questRewards,remote.questRewards);if(window.MochiContest&&(local.contest||remote.contest))out.contest=MochiContest.merge(local.contest,remote.contest);if(window.MochiLearningGoals&&(local.learningGoals||remote.learningGoals))out.learningGoals=MochiLearningGoals.merge(local.learningGoals,remote.learningGoals);out.mastery=mastery(local.mastery,remote.mastery);for(const k of ['done','right','best','fed'])out[k]=Math.max(+local[k]||0,+remote[k]||0);if(Array.isArray(local.owned)||Array.isArray(remote.owned))out.owned=[...new Set([...(local.owned||[]),...(remote.owned||[])])];for(const k of ['keys','provider','models','readModels']){if(local[k]!==undefined)out[k]=cp(local[k]);else delete out[k];}return out;}
function normalise(s){if(window.MochiQuestRewards)s.questRewards=MochiQuestRewards.validate(s.questRewards);if(window.MochiSciencePath&&s.sciencePath)s.sciencePath=MochiSciencePath.validate(s.sciencePath);if(window.MochiEntrance&&s.entrance)s.entrance=MochiEntrance.validate(s.entrance);if(window.MochiContest&&s.contest)s.contest=MochiContest.validate(s.contest);if(window.MochiLearningGoals&&s.learningGoals)s.learningGoals=MochiLearningGoals.validate(s.learningGoals);if(window.MochiCatFriends)MochiCatFriends.sync(s);if(window.MochiPlanner&&s.planner)s.planner=MochiPlanner.validate(s.planner);if(window.MochiCourse&&s.course)s.course=MochiCourse.validate(s.course);if(typeof MochiLearning!=='undefined')try{MochiLearning.init(s);}catch(e){}if(s.science){s.science.version=1;s.science.attempts=Array.isArray(s.science.attempts)?s.science.attempts.slice(-1000):[];s.science.notes=Array.isArray(s.science.notes)?s.science.notes.slice(-100):[];s.science.seenAssess=Array.isArray(s.science.seenAssess)?s.science.seenAssess:[];}return s;}
function status(text,kind=''){lastStatus=text;const e=document.getElementById('cloudSyncStatus');if(e){e.textContent=text;e.dataset.kind=kind;}}
// Firebase drops empty children and can return numeric keys as arrays. Compare
// the stored values independently of object order and the JSON representation.
function wireValue(value){
  if(value === null || typeof value !== 'object') return value;
  const entries = [];
  for(const key of Object.keys(value).sort()){
    const child = wireValue(value[key]);
    if(child != null) entries.push([key, child]);
  }
  return entries.length ? Object.fromEntries(entries) : null;
}

function signature(state){
  return JSON.stringify(wireValue(state));
}

async function digest(text){
  if(!globalThis.crypto?.subtle || typeof TextEncoder==='undefined') return null;
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(bytes), byte=>byte.toString(16).padStart(2,'0')).join('');
}

// A clean reload may reuse a revision only if that exact save survived locally.
// This also covers browsers where localStorage was full and save fell back to memory.
async function restoreRevision(url){
  const m = meta();
  if(m.syncedUrl !== url || !m.tag || !m.digest || m.pending) return;
  try{
    const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
    if(!saved) return;
    const previous = signature(uploadState(saved));
    if(await digest(previous) !== m.digest || endpoint() !== url) return;
    knownTag = m.tag;
    baseline = previous;
    lastRemoteAt = m.remoteAt || 0;
  }catch{ /* Read the cloud record if local verification is unavailable. */ }
}

async function rememberRevision(url, tag, current, remoteAt, extra){
  const hash = await digest(current);
  if(endpoint() !== url) return;
  setMeta({syncedUrl:url,tag,digest:hash,remoteAt,lastPull:Date.now(),pending:dirty,...extra});
}

async function taggedRequest(url, options = {}){
  const headers = {'X-Firebase-ETag':'true', ...options.headers};
  return window.MochiNetwork.request(url, {cache:'no-store', ...options, headers}, async response=>{
    if(!response.ok && response.status !== 412) throw Error('Database request failed ('+response.status+').');
    const tag = response.headers.get('ETag');
    if(!tag) throw Error('Firebase did not return a revision for this save.');
    // A successful conditional PUT echoes the submitted JSON; the app only
    // needs the new ETag. Only read a body for incoming or conflicting data.
    const readBody = response.status === 412 || (options.method !== 'PUT' && response.status !== 204);
    if(!readBody && response.body) response.body.cancel().catch(()=>{});
    return {tag, conflict:response.status === 412, record:readBody ? await response.json() : undefined};
  });
}

function refresh(){try{studyPaint?.();}catch(e){}try{studyParent?.();}catch(e){}document.dispatchEvent(new CustomEvent('mochi:cloud-merged'));}

function planCheckpoint(){
  if(timer !== null || !dirty || !cfg().ok) return;
  timer = setTimeout(()=>{timer = null; return sync();}, CHECKPOINT_MS);
}

async function reconcile(url, editsBeforeSync, pendingAtStart){
  const firstCheck = url !== familyUrl;
  if(firstCheck){
    familyUrl = url;
    knownTag = null;
    baseline = null;
    lastRemoteAt = 0;
    await restoreRevision(url);
  }
  let incoming;
  if(knownTag){
    // A silent GET returns the current ETag with an empty response body.
    const check = await taggedRequest(url+'?print=silent');
    if(check.tag !== knownTag) incoming = await taggedRequest(url);
    else if(firstCheck){
      // Rendering the home screen can save timer and pet bookkeeping during
      // startup. Leave those changes in the ordinary checkpoint queue.
      setMeta({lastPull:Date.now()});
      return;
    }
  }else{
    incoming = await taggedRequest(url);
  }

  for(let attempt=0; attempt<3; attempt++){
    if(endpoint() !== url) return;
    let state = uploadState(S);
    let current = signature(state);
    let expectedTag = knownTag;
    let needsWrite = dirty && current !== baseline;
    let remoteAt = lastRemoteAt;
    if(incoming){
      const record = incoming.record;
      expectedTag = incoming.tag;
      if(record !== null && (record?.app !== APP || !record.state)){
        throw Error('This family record is not a readable Mochi save.');
      }
      remoteAt = Number(record?.updatedAt) || 0;
      if(record){
        const m = meta();
        const localAt = Number(m.updatedAt) || latest(S);
        const bootOnly = firstCheck && !pendingAtStart && edits===editsBeforeSync;
        const localChanges = dirty && !bootOnly && (baseline === null || current !== baseline);
        const firstContact = baseline === null && m.syncedUrl !== url;
        const publishLocal = localChanges || (firstContact && (latest(S)>0 || S.done>0 || localAt>0));
        const preferRemote = !publishLocal || remoteAt >= localAt;
        // RTDB elides an empty attempts array. Restore the classroom schema
        // before its strict validator reads a first-time or older tablet's save.
        if(record.state.course?.version===1 && record.state.course.attempts==null){
          record.state.course.attempts=[];
        }
        const merged = normalise(mergeState(S, record.state, preferRemote));
        if(signature(uploadState(merged)) !== current){
          S = merged;
          await localSave(S);
          refresh();
        }
        // UI refresh and ordinary local saves can run during a merge.
        state = uploadState(S);
        current = signature(state);
        needsWrite = (publishLocal || edits !== editsBeforeSync) && current !== signature(record.state);
      }else{
        needsWrite = true;
      }
    }
    if(!needsWrite){
      knownTag = expectedTag;
      lastRemoteAt = remoteAt;
      baseline = current;
      dirty = false;
      await rememberRevision(url, knownTag, current, remoteAt);
      return;
    }

    const sentEdits = edits;
    const updatedAt = Math.max(Date.now(), remoteAt+1);
    const body = {schema:1,app:APP,student:'Euna',updatedAt,deviceId:device(),state};
    // RTDB rejects print=silent with If-Match. Use a conditional write so a
    // simultaneous save from another tablet is merged rather than overwritten.
    const result = await taggedRequest(url, {
      method:'PUT',headers:{'Content-Type':'application/json','If-Match':expectedTag},
      body:JSON.stringify(body)
    });
    if(endpoint() !== url) return;
    if(result.conflict){
      incoming = result;
      continue;
    }
    knownTag = result.tag;
    lastRemoteAt = updatedAt;
    baseline = current;
    dirty = edits !== sentEdits;
    await rememberRevision(url, knownTag, current, updatedAt, {lastPush:Date.now()});
    return;
  }
  throw Error('Another device is saving. Mochi will retry.');
}

function sync(manual=false){
  if(inFlight){
    if(!manual) return inFlight;
    if(!followUp) followUp=inFlight.then(()=>{followUp=null;return sync(true);});
    return followUp;
  }
  inFlight=runSync(manual).finally(()=>{inFlight=null;planCheckpoint();});
  return inFlight;
}

async function runSync(manual){
  const url = endpoint();
  if(!url){status('Cloud sync not configured. Your work is still saved on this device.');return;}
  if(timer !== null){clearTimeout(timer);timer=null;}
  syncing=true;
  status(manual ? 'Syncing now…' : 'Checking family cloud…');
  try{
    await reconcile(url, edits, dirty);
    if(endpoint()===url) status(dirty ? 'New work saved here · cloud update pending.' : 'Cloud sync up to date · Euna’s progress is shared across family devices.','ok');
  }catch(error){
    status('Cloud sync unavailable · '+error.message+' Local progress is safe.','bad');
  }finally{
    syncing=false;
    paint();
  }
}

function wrap(){
  if(localSave || typeof save !== 'function') return;
  localSave=save;
  save=async function(obj){
    const saved = localSave(obj);
    if(cfg().ok){
      dirty=true;
      if(starting){
        // Hydration can save default screens. Keep the previous edit time so
        // an unused tablet cannot win over an existing family record.
        setMeta({pending:true});
      }else{
        edits++;
        setMeta({updatedAt:Date.now(),pending:true});
      }
      planCheckpoint();
    }
    return saved;
  };
}
function mount(){if(document.getElementById('cloudSyncDetails'))return;const a=document.getElementById('backupStatus')||document.querySelector('#panel .study-actions');if(!a)return;const d=document.createElement('details');d.id='cloudSyncDetails';d.className='study-details';d.innerHTML=`<summary>Family cloud sync</summary><p class="study-note">Uses the same family Firebase configuration as the other learning apps. Mochi stores its progress separately from Pokémon Academy.</p><label class="study-field">Firebase database URL<input id="cloudDbUrl" type="url" autocomplete="off" placeholder="https://…firebasedatabase.app"></label><label class="study-field">Family code<input id="cloudFamilyCode" type="password" autocomplete="off" minlength="6" placeholder="Same family code used by the other apps"></label><div class="study-actions"><button class="btn quiet" id="cloudSyncSave">Save & sync</button><button class="btn quiet" id="cloudSyncNow">Sync now</button></div><p id="cloudSyncStatus" class="study-status" role="status"></p>`;a.insertAdjacentElement('beforebegin',d);document.getElementById('cloudSyncSave').onclick=async()=>{try{setCfg(document.getElementById('cloudDbUrl').value,document.getElementById('cloudFamilyCode').value);await sync(true);}catch(e){status(e.message,'bad');}};document.getElementById('cloudSyncNow').onclick=()=>sync(true);paint();}
function paint(){const c=cfg(),u=document.getElementById('cloudDbUrl'),f=document.getElementById('cloudFamilyCode'),s=document.getElementById('cloudSyncStatus');if(u&&document.activeElement!==u)u.value=c.url||'';if(f&&document.activeElement!==f)f.value=c.code||'';if(s&&!syncing)s.textContent=lastStatus;}
function init(){
  starting=true;
  queueMicrotask(()=>{starting=false;});
  wrap();
  mount();
  dirty = !!meta().pending;
  const checkOnReturn = ()=>{
    if(Date.now()-(+meta().lastPull||0)>15000) sync();
  };
  let pendingFlush=null;
  const flush = ()=>{
    // Pause, hide and pagehide may fire together. Persist the last edit first.
    if(!pendingFlush){
      pendingFlush=Promise.resolve().then(()=>{if(dirty) return sync(true);})
        .finally(()=>{pendingFlush=null;});
    }
    return pendingFlush;
  };
  document.addEventListener('mochi:study-paused',flush);
  document.addEventListener('visibilitychange',()=>{
    if(document.visibilityState==='hidden') flush();
    else if(document.visibilityState==='visible') checkOnReturn();
  });
  window.addEventListener('pagehide',flush);
  window.addEventListener('online',()=>sync(true));
  window.addEventListener('focus',checkOnReturn);
  if(cfg().ok) return sync();
  else status('Cloud sync not configured. Enter the same Firebase URL and family code used by the other apps.');
}
if(window.MochiReady)init();else document.addEventListener('mochi:ready',init,{once:true});
})();
