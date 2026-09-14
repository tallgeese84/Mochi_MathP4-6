/* The suggested schedule lives in the avatar panel, separate from the lesson. */
(function(){
'use strict';

const BASELINE_TOTAL=17;
const PLAN_KEY='mochi-focus-plan-start-v1';

function learning(){try{return MochiLearning.init(S);}catch(err){return null;}}
function localDay(ts){const d=ts?new Date(ts):new Date();return new Date(d.getFullYear(),d.getMonth(),d.getDate());}
function isoDay(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
function planStart(){
  let raw='';try{raw=localStorage.getItem(PLAN_KEY)||'';}catch(e){}
  if(/^\d{4}-\d{2}-\d{2}$/.test(raw)){const [y,m,d]=raw.split('-').map(Number);return new Date(y,m-1,d);}
  const now=localDay();try{localStorage.setItem(PLAN_KEY,isoDay(now));}catch(e){}return now;
}
function addDays(d,n){const x=new Date(d);x.setDate(x.getDate()+n);return x;}
function sameDay(a,b){return !!(a&&b&&a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate());}
function dateLabel(d){const today=localDay(),tomorrow=addDays(today,1);if(sameDay(d,today))return'Today';if(sameDay(d,tomorrow))return'Tomorrow';return d.toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric'});}

function diagnosticStats(l){
  const all=(l?.attempts||[]).filter(a=>a.kind==='diagnostic'&&!a.skipped);
  const seen=new Set(all.map(a=>a.skill));
  const active=l?.session&&l.session.mode==='diagnostic'?Math.max(0,Number(l.session.done)||0):0;
  const done=Math.min(BASELINE_TOTAL,Math.max(seen.size,active));
  const last=all.reduce((m,a)=>Math.max(m,Number(a.at)||0),0);
  return{done,finished:done>=BASELINE_TOTAL,last};
}
function postBaselineAttempts(l,lastDiagnostic){return(l?.attempts||[]).filter(a=>a.kind==='daily'&&!a.skipped&&Number(a.at)>lastDiagnostic);}
function weekRows(l){
  const start=planStart(),d=diagnosticStats(l),transfer=postBaselineAttempts(l,d.last);
  return[
    {date:addDays(start,0),title:'Starting point · Part 1',detail:'Number sense, fractions and decimals',done:d.done>=4,current:d.done<4},
    {date:addDays(start,1),title:'Starting point · Part 2',detail:'Ratio, percentages, rates and algebra',done:d.done>=8,current:d.done>=4&&d.done<8},
    {date:addDays(start,2),title:'Starting point · Part 3',detail:'Measurement, time and geometry',done:d.done>=12,current:d.done>=8&&d.done<12},
    {date:addDays(start,3),title:'Starting point · Part 4',detail:'Volume, angles, data and modelling',done:d.done>=17,current:d.done>=12&&d.done<17},
    {date:addDays(start,4),title:'Adaptive transfer check',detail:'8 fresh problems chosen from the baseline evidence',done:d.done>=17&&transfer.length>=8,current:d.done>=17&&transfer.length<8},
    {date:addDays(start,5),title:'Repair one weak idea',detail:'Short targeted review; no score chasing',done:false,current:d.done>=17&&transfer.length>=8},
    {date:addDays(start,6),title:'Review together + light challenge',detail:'Look at 2–3 pieces of working; then rest',done:false,current:false}
  ];
}

function mount(){
 if(document.getElementById('mochiFocusHome'))return;
 const host=document.createElement('details');host.id='mochiFocusHome';host.className='plan-schedule';
 document.getElementById('sessionPanel').appendChild(host);paint();
}
function paint(){
 const host=document.getElementById('mochiFocusHome'),l=learning();if(!host||!l)return;
 const rows=weekRows(l),key=JSON.stringify(rows);if(host.dataset.plan===key)return;
 host.dataset.plan=key;
 host.innerHTML='<summary>My practice schedule</summary><p>A suggested sequence. Take more time when an idea needs it.</p><ol>'+rows.map(r=>'<li><strong>'+r.title+'</strong><span>'+r.detail+'</span><small>'+(r.done?'Explored':r.current?'Current focus':dateLabel(r.date))+'</small></li>').join('')+'</ol>';
}
function install(){mount();document.addEventListener('mochi:state-saved',paint);document.addEventListener('mochi:cloud-merged',paint);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')paint();});}
if(window.MochiReady)install();else document.addEventListener('mochi:ready',install,{once:true});
})();
