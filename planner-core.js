/* Learning plan and observations. No timers, network or UI side effects here. */
(function(root){
'use strict';
const C=root.MochiCourse||(typeof require==='function'?require('./course-core.js'):null);
const DAY=86400000,subjects=['maths','science'],days=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const defaults=[[25,20],[20,25],[25,20],[20,25],[15,15],[30,30],[10,10]];
const fresh=()=>({version:1,schedule:{updatedAt:0,week:defaults.map(([maths,science])=>({maths,science}))},sessions:[],days:{},milestones:{}});
const init=s=>s.planner||(s.planner=fresh());
const stamp=n=>Number.isFinite(n)&&n>0&&n<8640000000000000?n:0;
const answered=a=>stamp(a.answeredAt)||stamp(a.responses?.[0]?.at)||stamp(a.at);
const text=(x,n=120)=>typeof x==='string'?x.slice(0,n):'';
function localDay(at=Date.now()){const d=new Date(at);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
function weekday(at=Date.now()){return (new Date(at).getDay()+6)%7;}
function validDay(s){return /^\d{4}-\d{2}-\d{2}$/.test(s)&&!Number.isNaN(Date.parse(s))&&new Date(s+'T12:00:00').getDate()===Number(s.slice(-2));}
function validate(raw){
 const p=fresh();if(!raw)return p;if(raw.version!==1)throw Error('Unsupported learning plan version.');
 if(raw.schedule?.week){if(!Array.isArray(raw.schedule.week)||raw.schedule.week.length!==7||raw.schedule.week.some(d=>subjects.some(s=>!Number.isInteger(d?.[s])||d[s]<0||d[s]>90)))throw Error('Plan minutes must be whole numbers from 0 to 90.');p.schedule={updatedAt:stamp(raw.schedule.updatedAt),week:raw.schedule.week.map(d=>({maths:d.maths,science:d.science}))};}
 const sessions=new Map();
 for(const v of (Array.isArray(raw.sessions)?raw.sessions:[]).slice(-3000)){
  if(!text(v?.id)||!subjects.includes(v.subject)||!validDay(v.day)||!stamp(v.start)||!stamp(v.end)||v.end<v.start||v.end-v.start>6*3600000)continue;
  const x={id:text(v.id),subject:v.subject,day:v.day,start:v.start,end:v.end},old=sessions.get(x.id);if(!old||x.end>old.end)sessions.set(x.id,x);
 }p.sessions=[...sessions.values()].sort((a,b)=>a.start-b.start||a.id.localeCompare(b.id));
 for(const [date,d] of Object.entries(raw.days||{}).filter(([k])=>validDay(k)).sort().slice(-400)){
  const clean={};for(const s of subjects){const x=d?.[s];if(!x)continue;clean[s]={updatedAt:stamp(x.updatedAt),unit:C.unit(x.unit)?.subject===s?x.unit:'',learnedAt:stamp(x.learnedAt),reflection:text(x.reflection,1500),exitIds:[...new Set((Array.isArray(x.exitIds)?x.exitIds:[]).filter(v=>typeof v==='string').map(v=>text(v)))].slice(-8)};}p.days[date]=clean;
 }
 for(const [key,v] of Object.entries(raw.milestones||{}).slice(0,500)){
  if(!v||!subjects.includes(v.subject)||!['idea','variety','retained'].includes(v.kind)||!text(v.skill,50)||key!==`${v.subject}:${v.skill}:${v.kind}`||!stamp(v.earnedAt))continue;
  p.milestones[key]={subject:v.subject,skill:text(v.skill,50),kind:v.kind,earnedAt:v.earnedAt,evidence:(Array.isArray(v.evidence)?v.evidence:[]).map(x=>text(x)).filter(Boolean).slice(-4)};
 }return p;
}
function merge(a,b){
 a=validate(a);b=validate(b);const p=validate({...a,sessions:[...a.sessions,...b.sessions]});
 const choose=(x,y)=>!x?y:!y?x:y.updatedAt>x.updatedAt?y:y.updatedAt<x.updatedAt?x:JSON.stringify(y)>JSON.stringify(x)?y:x;
 p.schedule=choose(a.schedule,b.schedule);
 for(const date of new Set([...Object.keys(a.days),...Object.keys(b.days)])){
  p.days[date]={};for(const s of subjects){const x=a.days[date]?.[s],y=b.days[date]?.[s],v=choose(x,y);if(v)p.days[date][s]={...v,exitIds:[...new Set([...(x?.exitIds||[]),...(y?.exitIds||[])])].sort().slice(-8)};}
 }
 p.milestones={...a.milestones};for(const [k,v] of Object.entries(b.milestones))if(!p.milestones[k]||v.earnedAt<p.milestones[k].earnedAt)p.milestones[k]=v;
 return validate(p);
}
function day(p,subject,now=Date.now()){const key=localDay(now);p.days[key]??={};for(const old of Object.keys(p.days).sort().slice(0,-400))delete p.days[old];return p.days[key][subject]??={updatedAt:now,unit:'',learnedAt:0,reflection:'',exitIds:[]};}
function minutes(p,subject,now=Date.now()){return p.schedule.week[weekday(now)][subject];}
// Union intervals across devices AND subjects. Overlap goes to the earlier session.
function elapsed(p,date=localDay()){
 const out={maths:0,science:0};let covered=0;
 for(const x of p.sessions.filter(x=>x.day===date).sort((a,b)=>a.start-b.start||a.id.localeCompare(b.id))){out[x.subject]+=Math.max(0,x.end-Math.max(x.start,covered));covered=Math.max(covered,x.end);}return out;
}
function clock(){
 let run=null,lastMono=0,lastWall=0,touched=0;
 return {get subject(){return run?.subject||null;},touch(mono){touched=mono;},
  start(subject,p,id,wall,mono){if(!subjects.includes(subject))throw Error('Unknown subject');run={id,subject,day:localDay(wall),start:wall,end:wall};p.sessions.push(run);p.sessions=p.sessions.slice(-3000);lastMono=touched=mono;lastWall=wall;},
  stop(){run=null;},
  tick(p,wall,mono,visible=true,activeSubject=run?.subject){
   if(!run)return {running:false};const delta=mono-lastMono,wallDelta=wall-lastWall;
   let reason=!visible?'Paused while the app is hidden.':activeSubject!==run.subject?'Paused when you changed activity.':localDay(wall)!==run.day?'A new day has started. Start today’s clock when ready.':mono-touched>=180000?'Paused after three minutes without interaction. Resume when ready.':delta<0||delta>5000||wallDelta<0||Math.abs(wallDelta-delta)>250?'Paused after an interruption. Resume when ready.':'';
   if(reason){run=null;return {running:false,reason};}
   // A cloud merge can replace the state object. Preserve this session's identity.
   let saved=p.sessions.find(x=>x.id===run.id);if(!saved){saved={...run};p.sessions.push(saved);}saved.end=run.end+delta;run=saved;lastMono=mono;lastWall=wall;
   if(elapsed(p,run.day)[run.subject]>=minutes(p,run.subject,wall)*60000){run=null;return {running:false,reason:'Time goal reached. Finish your thought, take a break and try your exit check when ready.'};}
   return {running:true};
  }
 };
}
const scienceSkills={circuits:'electricity',shadows:'light',ecosystems:'ecology'};
function records(s){
 const out=[];
 for(const a of s.learning?.attempts||[])if(!a.skipped&&a.kind!=='custom'&&stamp(a.at)&&a.tries>0)out.push({id:'math:'+a.id,subject:'maths',skill:a.skill,at:answered(a),form:a.generator,correct:!!a.correct,first:!!a.firstCorrect,independent:!!(a.correct&&a.firstCorrect&&!a.hints&&!a.model&&!a.revealed&&a.confidence!=='guess'),confident:a.confidence==='sure',checked:!!a.trace?.verify?.trim(),obstacle:a.obstacle||'',raw:a});
 for(const a of s.science?.attempts||[])if(stamp(a.at))out.push({id:'science:'+a.id,subject:'science',skill:scienceSkills[a.skill]||a.skill,at:answered(a),form:a.item,correct:!!a.correct,first:!!a.firstCorrect,independent:!!(a.correct&&a.firstCorrect&&!a.helped&&!a.guess&&(!a.concept||a.concept.correct&&a.concept.firstCorrect)),conceptMiss:!!a.concept&&!a.concept.firstCorrect,raw:a});
 for(const a of s.course?.attempts||[]){const q=C.question(a.question),u=q&&C.unit(q.unit);if(!u||!stamp(a.at)||!a.responses?.length)continue;const first=a.responses[0]===q.answer,correct=a.responses.at(-1)===q.answer;
  out.push({id:'course:'+a.id,subject:u.subject,skill:u.skill,unit:u.id,at:answered(a),form:q.id,correct,first,independent:!!(correct&&first&&!a.helped&&!a.guess),raw:a});}
 // Repeated items within a day are not fresh independent evidence for promotion or growth.
 out.sort((a,b)=>a.at-b.at||a.id.localeCompare(b.id));const seen=new Map(),ids=new Set();
 return out.filter(a=>{if(ids.has(a.id))return false;ids.add(a.id);return true;}).map(a=>{const k=`${a.subject}:${a.skill}:${a.form}`,prev=seen.get(k);seen.set(k,a.at);return {...a,familiar:prev!==undefined,spaced:prev===undefined||a.at-prev>=DAY};});
}
function observations(s,subject,now=Date.now()){
 const all=records(s).filter(a=>a.subject===subject&&a.at<=now),recent=all.slice(-12),signals=[];
 const add=(kind,title,items,action)=>{if(items.length>=2)signals.push({kind,title,count:items.length,sample:recent.length,evidence:items.slice(-3).map(a=>a.id),action});};
 add('confidence','Check confidence against evidence',recent.filter(a=>a.confident&&!a.first),'Before submitting, estimate a reasonable answer and try to disprove your method.');
 add('concept','Test the explanation behind the answer',recent.filter(a=>a.conceptMiss),'Predict what changes, keep the other conditions fixed, then explain what the result supports.');
 add('checking','Make checking visible',recent.filter(a=>a.id.startsWith('math:')&&!a.first&&!a.checked),'Try a second method, substitution or an estimate. Missing written checking does not prove she did not check mentally.');
 add('support','Fade the help gradually',recent.filter(a=>a.correct&&!a.independent),'Use one worked example, explain each step, then try a different problem with the help closed.');
 const obstacles={meaning:'Restate the unknown and the information in your own words.',representation:'Represent the relationship with a labelled model, table or equation.',calculation:'Keep your model; check one operation at a time.',checking:'Use an estimate or a different method to check.'};
 for(const [k,action] of Object.entries(obstacles))add('reported-'+k,'Follow up on a difficulty Euna reported',recent.filter(a=>a.obstacle===k),action);
 return {sample:recent.length,independent:recent.filter(a=>a.independent&&a.spaced).length,signals:signals.slice(0,3),limits:'Small practice sample. These are prompts for discussion, not diagnoses. Free explanations and drawings require review.'};
}
function recommend(s,subject,now=Date.now()){
 const c=s.course||C.fresh(),all=records(s).filter(a=>a.subject===subject&&a.at<=now),list=C.data.units.filter(u=>u.subject===subject);
 // Two recent first-answer misses in the same skill outweigh moving on to a new topic.
 const misses=[...new Set(all.slice(-12).map(a=>a.skill))].map(skill=>({skill,a:all.filter(a=>a.skill===skill).slice(-2)})).filter(x=>x.a.length===2&&x.a.every(a=>!a.first||a.conceptMiss)).sort((a,b)=>b.a.at(-1).at-a.a.at(-1).at);
 if(misses.length){const m=misses[0],last=m.a.at(-1),u=list.find(u=>u.id===last.unit)||list.find(u=>u.skill===m.skill);if(u){const prerequisite=u.prerequisites.map(C.unit).find(v=>v&&!c.lessons[v.id]?.completedAt);return {unit:(prerequisite||u).id,kind:'repair',reason:prerequisite?'Two recent checks suggest revisiting this building block before returning to '+u.title+'.':'Two recent first answers need a closer look. Revisit the explanation, then try a different check.',evidence:m.a.map(a=>a.id)};}}
 const due=list.filter(u=>C.evidence(c,u.id,now).overdue).sort((a,b)=>C.evidence(c,a.id,now).due-C.evidence(c,b.id,now).due);
 if(due.length)return {unit:due[0].id,kind:'review',reason:'A delayed check is due. Recall the idea before reopening its explanation.',evidence:all.filter(a=>a.unit===due[0].id).slice(-2).map(a=>a.id)};
 const last=all.at(-1),u=last&&(list.find(u=>u.id===last.unit)||list.find(u=>u.skill===last.skill));
 if(u&&c.lessons[u.id]?.completedAt){const r=all.filter(a=>a.skill===u.skill).slice(-2);if(r.length===2&&r.every(a=>a.independent&&a.spaced)&&new Set(r.map(a=>a.form)).size===2){const next=C.choose(c,u.id,now);if(next.kind==='question')return {unit:u.id,kind:'stretch',reason:'Two different unassisted answers support trying the next available check. Explain why it works.',evidence:r.map(a=>a.id)};}}
 const next=C.recommend(c,subject,now);return {unit:next.unit.id,kind:'learn',reason:next.reason,evidence:[]};
}
function goals(s,subject,now=Date.now()){
 const p=init(s),d=p.days[localDay(now)]?.[subject],all=records(s).filter(a=>a.subject===subject&&localDay(a.at)===localDay(now)),exit=all.filter(a=>d?.exitIds.includes(a.id));
 const practice=all.filter(a=>!d?.exitIds.includes(a.id)),target=minutes(p,subject,now)===0?0:weekday(now)===6?1:weekday(now)===5?5:3;
 return {minutes:minutes(p,subject,now),activeMs:elapsed(p,localDay(now))[subject],learned:!!d?.learnedAt,practice:practice.length,target,exit:exit.length,exitIndependent:exit.filter(a=>a.independent&&a.spaced).length,reflected:!!d?.reflection.trim(),unit:d?.unit||recommend(s,subject,now).unit,complete:!!d?.learnedAt&&practice.length>=target&&exit.length>0&&!!d?.reflection.trim()};
}
function grow(s){
 const p=init(s),all=records(s),groups=new Map();let changed=false;
 for(const a of all.filter(a=>a.independent&&a.spaced)){const k=a.subject+':'+a.skill;if(!groups.has(k))groups.set(k,[]);groups.get(k).push(a);}
 for(const [key,a] of groups){const forms=new Set(a.map(x=>x.form)),retained=a.at(-1).at-a[0].at>=3*DAY&&new Set(a.map(x=>localDay(x.at))).size>=2;
  for(const kind of ['idea',...(forms.size>=2?['variety']:[]),...(retained?['retained']:[])]){const k=key+':'+kind;if(p.milestones[k])continue;p.milestones[k]={subject:a[0].subject,skill:a[0].skill,kind,earnedAt:a.at(-1).at,evidence:[a[0].id,...a.slice(-3).map(x=>x.id)].filter((x,i,v)=>v.indexOf(x)===i)};changed=true;}}
 return changed;
}
function pet(p){
 const badges=Object.values(p.milestones),ideas=s=>badges.filter(x=>x.subject===s&&x.kind==='idea').length,maths=ideas('maths'),science=ideas('science'),variety=badges.filter(x=>x.kind==='variety').length,retained=badges.filter(x=>x.kind==='retained').length;
 const stages=[{name:'Little companion',next:'Explore two different question forms in each subject.'},{name:'Curious companion',next:'Build independent evidence in three topics in each subject.'},{name:'Explorer',next:'Build five topics in each subject and revisit four ideas successfully after three days.'},{name:'Thoughtful explorer',next:'Build eight topics in each subject and retain ten ideas over time.'},{name:'Learning companion',next:'Keep exploring new ideas together. This is a learning milestone, not an exam grade.'}];
 let level=0;if(maths>=1&&science>=1&&subjects.every(s=>badges.some(x=>x.subject===s&&x.kind==='variety')))level=1;if(level&&maths>=3&&science>=3)level=2;if(level===2&&maths>=5&&science>=5&&retained>=4)level=3;if(level===3&&maths>=8&&science>=8&&retained>=10)level=4;
 return {...stages[level],level,maths,science,variety,retained,badges:badges.length};
}
function report(s,now=Date.now()){
 const p=validate(init(s));return {generatedAt:new Date(now).toISOString(),timeZone:Intl.DateTimeFormat().resolvedOptions().timeZone,schedule:p.schedule,days:Object.keys(p.days).sort().slice(-14).map(date=>({date,activeMs:elapsed(p,date),goals:p.days[date]})),today:Object.fromEntries(subjects.map(subject=>[subject,goals(s,subject,now)])),next:Object.fromEntries(subjects.map(subject=>[subject,recommend(s,subject,now)])),thinking:Object.fromEntries(subjects.map(subject=>[subject,observations(s,subject,now)])),mochi:pet(p),limits:['Minutes are editable starting goals, not a prescribed educational dose.','Foreground time is an estimate; reading, reasoning and learning quality cannot be inferred from a clock.','Studied-idea ticks and reflections are self-reported. An exit answer is evidence, not a pass/fail gate.','Mochi milestones are retained celebrations, not grades, percentiles or admissions predictions.','Original checks are finite and uncalibrated. Familiar questions do not establish novel transfer.']};
}
root.MochiPlanner={fresh,init,validate,merge,day,days,defaults,subjects,localDay,weekday,minutes,elapsed,clock,records,observations,recommend,goals,grow,pet,report};
if(typeof module!=='undefined')module.exports=root.MochiPlanner;
})(typeof window!=='undefined'?window:globalThis);
