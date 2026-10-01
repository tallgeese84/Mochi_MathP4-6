/* Mochi's Home: cosy pet-care rules. Pure functions, no DOM.
   Design promise: Mochi is never sad, sick, lost or punished. Needs drift down only to a
   comfortable floor, time away is a nap, bond never decreases, and basic care is always free.
   Coins (earned by learning) buy optional treats, toys and accessories. */
(function(root){
'use strict';
const NEEDS=['tummy','energy','clean','fun','love'];
// Per-hour drift while time passes, and the floor each need settles at. Floors keep Mochi content.
const DRIFT={tummy:-6,energy:+18,clean:-2.5,fun:-5,love:-4};
const FLOOR={tummy:42,energy:45,clean:52,fun:42,love:48};
const LABEL={tummy:'Tummy',energy:'Energy',clean:'Fluffiness',fun:'Playfulness',love:'Cuddles'};
const WISH={tummy:'A little peckish',energy:'Getting sleepy',clean:'Fur could use a brush',fun:'Wants to play',love:'Would love a cuddle'};
const BOND_PER_DAY=12;
const TOYS=[
 {id:'feather',name:'Feather wand',cost:0,kind:'wand'},
 {id:'yarn',name:'Ball of yarn',cost:0,kind:'ball'},
 {id:'box',name:'Cardboard box',cost:10,kind:'furniture'},
 {id:'laser',name:'Laser dot',cost:12,kind:'laser'},
 {id:'plush',name:'Fish plush',cost:15,kind:'ball'},
 {id:'tree',name:'Cat tree',cost:40,kind:'furniture'}
];
const TRICKS=[
 {id:'sit',name:'Sit',bond:0},
 {id:'highfive',name:'High five',bond:6},
 {id:'spin',name:'Spin',bond:14},
 {id:'roll',name:'Roll over',bond:26},
 {id:'wave',name:'Wave',bond:40},
 {id:'chase',name:'Chase tail',bond:58},
 {id:'hop',name:'Happy hop',bond:80}
];
const ROUTINE=[
 {id:'meal',label:'A meal'},
 {id:'brush',label:'A brush'},
 {id:'play',label:'Playtime'},
 {id:'cuddle',label:'Cuddles'}
];
const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
const num=(x,d=0)=>Number.isFinite(+x)?+x:d;
function dayKey(t){const d=new Date(t);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function fresh(now=Date.now()){
 return {version:1,needs:{tummy:70,energy:85,clean:80,fun:65,love:70},at:now,bond:0,bondDay:dayKey(now),bondToday:0,toys:['feather','yarn'],routine:{day:dayKey(now),done:[]},counts:{meals:0,brushes:0,plays:0,naps:0,treats:0,cuddles:0,tricks:0},lastVisit:now,sound:true};
}
function validate(raw,now=Date.now()){
 const h=fresh(now);if(!raw||typeof raw!=='object')return h;
 for(const k of NEEDS)h.needs[k]=clamp(num(raw.needs?.[k],h.needs[k]),FLOOR[k],100);
 h.at=clamp(num(raw.at,now),0,now);h.lastVisit=clamp(num(raw.lastVisit,h.at),0,now);
 h.bond=Math.max(0,Math.floor(num(raw.bond)));
 h.bondDay=typeof raw.bondDay==='string'?raw.bondDay.slice(0,10):h.bondDay;h.bondToday=clamp(Math.floor(num(raw.bondToday)),0,BOND_PER_DAY);
 const toyIds=new Set(TOYS.map(t=>t.id));h.toys=[...new Set(['feather','yarn',...(Array.isArray(raw.toys)?raw.toys:[]).filter(t=>toyIds.has(t))])];
 const ids=new Set(ROUTINE.map(r=>r.id));h.routine={day:typeof raw.routine?.day==='string'?raw.routine.day.slice(0,10):h.routine.day,done:[...new Set((Array.isArray(raw.routine?.done)?raw.routine.done:[]).filter(x=>ids.has(x)))]};
 for(const k of Object.keys(h.counts))h.counts[k]=Math.max(0,Math.floor(num(raw.counts?.[k])));
 h.sound=raw.sound!==false;
 return h;
}
/* Advance needs to `now`. Away time drifts each need towards its floor (energy recovers: he naps). */
function advance(h,now=Date.now()){
 const hours=clamp((now-h.at)/3600000,0,24*30);
 if(hours>0){for(const k of NEEDS){const v=h.needs[k]+DRIFT[k]*hours;h.needs[k]=DRIFT[k]<0?Math.max(Math.min(h.needs[k],FLOOR[k]),v):Math.min(100,v);h.needs[k]=clamp(h.needs[k],FLOOR[k],100);}}
 h.at=Math.max(h.at,now);
 const today=dayKey(now);if(h.bondDay!==today){h.bondDay=today;h.bondToday=0;}
 if(h.routine.day!==today)h.routine={day:today,done:[]};
 return h;
}
function score(h){return NEEDS.reduce((s,k)=>s+h.needs[k],0)/NEEDS.length;}
function mood(h){
 const s=score(h);
 if(s>=88)return {id:'joy',word:'Over the moon',line:'Mochi is purring so loudly the whole room can hear.'};
 if(s>=74)return {id:'happy',word:'Happy',line:'Mochi’s tail is up, curling like a question mark.'};
 if(s>=60)return {id:'content',word:'Content',line:'Mochi is relaxed and comfy.'};
 return {id:'cosy',word:'Cosy',line:'Mochi is calm and would love a little attention.'};
}
/* The gentlest wish to show, or null. Never more than one at a time. */
function wish(h){
 const low=NEEDS.filter(k=>h.needs[k]<66).sort((a,b)=>h.needs[a]-h.needs[b])[0];
 return low?{need:low,text:WISH[low]}:null;
}
function welcome(h,now=Date.now()){
 const away=(now-h.lastVisit)/3600000;h.lastVisit=now;
 if(away<1)return '';
 if(away<6)return 'Mochi stretches and trots over to say hello.';
 if(away<30)return 'While you were away, Mochi had a long nap in a sunny spot. He’s so happy to see you!';
 return 'Mochi has been dreaming about you. He bumps his head against your hand to say welcome back.';
}
function addBond(h,n=1){const add=Math.max(0,Math.min(n,BOND_PER_DAY-h.bondToday));h.bond+=add;h.bondToday+=add;return add;}
function mark(h,id){if(!h.routine.done.includes(id)){h.routine.done.push(id);return true;}return false;}
function learned(h){return TRICKS.filter(t=>h.bond>=t.bond).map(t=>t.id);}
function nextTrick(h){return TRICKS.find(t=>h.bond<t.bond)||null;}
function result(h,ok,text,extra={}){const before=extra.tricksBefore;delete extra.tricksBefore;const after=learned(h),fresh=before?after.filter(t=>!before.includes(t)):[];return {ok,text,mood:mood(h),newTricks:fresh.map(id=>TRICKS.find(t=>t.id===id)),...extra};}
const raise=(h,k,n)=>{h.needs[k]=clamp(h.needs[k]+n,FLOOR[k],100);};
function act(h,action,arg,now=Date.now()){
 advance(h,now);const before=learned(h);let bond=0,routine=false;
 if(action==='feed'){
  if(h.needs.tummy>=92)return result(h,false,'Mochi sniffs the bowl and looks up at you. He’s full for now!',{anim:'full'});
  const meaningful=h.needs.tummy<80;raise(h,'tummy',38);raise(h,'energy',4);h.counts.meals++;if(meaningful)bond=addBond(h,1);routine=mark(h,'meal');
  return result(h,true,'Crunch, crunch! Mochi eats his kibble happily.',{anim:'eat',bond,routine,tricksBefore:before});
 }
 if(action==='treat'){
  const t=arg||{};raise(h,'tummy',10);raise(h,'love',14);raise(h,'fun',6);h.counts.treats++;bond=addBond(h,t.cost>=9?2:1);
  return result(h,true,`Mochi gobbles the ${String(t.name||'treat').toLowerCase()} and licks his whiskers.`,{anim:'eat',bond,tricksBefore:before});
 }
 if(action==='brush'){
  const amount=clamp(num(arg,1),0,1);const was=h.needs.clean;raise(h,'clean',amount*14);raise(h,'love',amount*4);
  if(was<100&&h.needs.clean>=100){h.counts.brushes++;if(was<88)bond=addBond(h,1);routine=mark(h,'brush');return result(h,true,'So fluffy! Mochi’s fur is soft and shiny.',{anim:'shine',bond,routine,done:true,tricksBefore:before});}
  return result(h,true,'',{anim:'brush'});
 }
 if(action==='play'){
  if(h.needs.energy<30)return result(h,false,'Mochi gives a big yawn. He’d like a nap first.',{anim:'yawn'});
  const amount=clamp(num(arg,1),0,1);raise(h,'fun',amount*9);h.needs.energy=clamp(h.needs.energy-amount*4,20,100);
  if(h.needs.fun>=100&&!h.routine.done.includes('play')){h.counts.plays++;bond=addBond(h,1);routine=mark(h,'play');return result(h,true,'What a game! Mochi is bouncing with joy.',{anim:'hop',bond,routine,done:true,tricksBefore:before});}
  return result(h,true,'',{anim:'play'});
 }
 if(action==='pet'){
  raise(h,'love',6);h.counts.cuddles++;
  if(h.counts.cuddles%5===0)bond=addBond(h,1);
  if(h.needs.love>=96)routine=mark(h,'cuddle');
  return result(h,true,'',{anim:'purr',bond,routine,tricksBefore:before});
 }
 if(action==='nap'){
  const amount=clamp(num(arg,1),0,1);raise(h,'energy',amount*12);
  if(h.needs.energy>=100){h.counts.naps++;return result(h,true,'Mochi wakes up, stretches, and feels full of beans.',{anim:'wake',done:true});}
  return result(h,true,'',{anim:'sleep'});
 }
 if(action==='trick'){
  const t=TRICKS.find(x=>x.id===arg);
  if(!t||h.bond<t.bond)return result(h,false,'Mochi tilts his head. Keep caring for him and he’ll learn this one soon.',{anim:'tilt'});
  if(h.needs.energy<30&&t.id!=='sit')return result(h,false,'Mochi is a bit sleepy for tricks. How about a nap?',{anim:'yawn'});
  raise(h,'fun',8);raise(h,'love',4);h.needs.energy=clamp(h.needs.energy-3,20,100);h.counts.tricks++;
  return result(h,true,`${t.name}! Good boy, Mochi!`,{anim:'trick:'+t.id,tricksBefore:before});
 }
 return result(h,false,'');
}
function buyToy(h,id,coins){
 const t=TOYS.find(x=>x.id===id);if(!t)return {ok:false,text:'That toy is not in the shop.'};
 if(h.toys.includes(id))return {ok:true,owned:true,cost:0};
 if(coins<t.cost)return {ok:false,text:`The ${t.name.toLowerCase()} costs ${t.cost} coins. Answer a few more questions first.`};
 h.toys.push(id);return {ok:true,cost:t.cost,text:`You bought the ${t.name.toLowerCase()}! Mochi can’t wait to try it.`};
}
/* Newest-wins is fine for care; bond and purchases are never lost when two tablets differ. */
function merge(a,b,now=Date.now()){
 const x=validate(a,now),y=validate(b,now),out=validate(x.at>=y.at?x:y,now);
 out.bond=Math.max(x.bond,y.bond);out.toys=[...new Set([...x.toys,...y.toys])];
 for(const k of Object.keys(out.counts))out.counts[k]=Math.max(x.counts[k],y.counts[k]);
 return out;
}
root.MochiHome={NEEDS,DRIFT,FLOOR,LABEL,WISH,TOYS,TRICKS,ROUTINE,BOND_PER_DAY,fresh,validate,advance,score,mood,wish,welcome,act,buyToy,learned,nextTrick,merge,dayKey};
if(typeof module!=='undefined')module.exports=root.MochiHome;
})(typeof window!=='undefined'?window:globalThis);
