/* Mochi's Home: care controls around the 3D room. Rules come from MochiHome (mochi-home-core.js).
   Basic care is free. Coins from learning buy treats, toys and accessories. Nothing here can make Mochi sad. */
(function(root){
'use strict';
const H=root.MochiHome;if(!H)return;
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ICON={
 tummy:'<path d="M3 12c3-5 9-6 13-3l4-3v12l-4-3c-4 3-10 2-13-3z" fill="currentColor"/><circle cx="8" cy="11" r="1.3" fill="#fff"/>',
 energy:'<path d="M15 3a8 8 0 1 0 6 13A7 7 0 0 1 15 3z" fill="currentColor"/>',
 clean:'<path d="M12 2l2.2 6.3L21 9l-5.3 4 1.8 6.6L12 16l-5.5 3.6L8.3 13 3 9l6.8-.7z" fill="currentColor"/>',
 fun:'<circle cx="12" cy="12" r="8" fill="currentColor"/><path d="M5 9c4 1 10 1 14 0M5 15c4-1 10-1 14 0M12 4c-2 5-2 11 0 16" stroke="#fff" stroke-width="1.4" fill="none"/>',
 love:'<path d="M12 21s-8-5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 6-8 11-8 11z" fill="currentColor"/>',
 feed:'<path d="M3 13h18a9 6 0 0 1-18 0z" fill="currentColor"/><circle cx="9" cy="11" r="1.6" fill="currentColor"/><circle cx="13" cy="10" r="1.6" fill="currentColor"/><circle cx="16" cy="11.5" r="1.4" fill="currentColor"/>',
 brush:'<rect x="10" y="2" width="4" height="10" rx="2" fill="currentColor"/><rect x="5" y="12" width="14" height="5" rx="2" fill="currentColor"/><path d="M7 18v3M10 18v3M13 18v3M16 18v3" stroke="currentColor" stroke-width="1.6"/>',
 play:'<circle cx="12" cy="13" r="7" fill="currentColor"/><path d="M6 11c4 1 8 1 12-1M7 16c3-1 7-1 10 0" stroke="#fff" stroke-width="1.3" fill="none"/><path d="M18 7c2-2 3-4 3-5" stroke="currentColor" stroke-width="1.6" fill="none"/>',
 nap:'<path d="M14 3a8 8 0 1 0 7 12A7 7 0 0 1 14 3z" fill="currentColor"/><text x="15" y="9" font-size="7" font-weight="700" fill="currentColor">z</text>',
 treats:'<path d="M2 12c3-4 8-5 12-2l5-3v10l-5-3c-4 3-9 2-12-2z" fill="currentColor"/>',
 tricks:'<path d="M12 2l2.5 5.5L20 8l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5z" fill="currentColor"/>',
 wardrobe:'<path d="M8 3l4 3 4-3 5 4-3 4v10H6V11L3 7z" fill="currentColor"/>'
};
const svg=(k,cls='')=>`<svg viewBox="0 0 24 24" class="${cls}" aria-hidden="true">${ICON[k]||''}</svg>`;
let api=null,msgTimer=null,lastWish='',ticker=null,purr=null,modeTimer=null;
const home=()=>{S.home=H.validate(S.home);return S.home;};
function persist(){save(S);}
function say(text,ms=4500){if(!text)return;const b=$('mhBubble');if(!b)return;b.textContent=text;b.hidden=false;b.classList.remove('mh-pop');void b.offsetWidth;b.classList.add('mh-pop');clearTimeout(msgTimer);msgTimer=setTimeout(()=>{b.dataset.kind='';paintWish(true);},ms);b.dataset.kind='msg';}
function paintWish(force){const b=$('mhBubble');if(!b||(!force&&b.dataset.kind==='msg'))return;const w=H.wish(home());const text=w?w.text+'…':'';if(text===lastWish&&!force)return;lastWish=text;b.textContent=text;b.hidden=!text;b.dataset.kind='wish';}
function paintNeeds(){
 const h=home(),box=$('mhNeeds');if(!box)return;
 box.innerHTML=H.NEEDS.map(k=>{const v=Math.round(h.needs[k]);return `<div class="mh-need" data-need="${k}" title="${H.LABEL[k]}"><span class="mh-need-icon">${svg(k)}</span><span class="mh-need-bar"><span style="width:${v}%"></span></span><span class="mh-sr">${H.LABEL[k]} ${v}%</span></div>`;}).join('');
 const m=H.mood(h);$('mhMood').textContent=m.word;$('mhMood').dataset.mood=m.id;$('mhMoodLine').textContent=m.line;
}
function paintDay(){
 const h=home();
 $('mhRoutine').innerHTML='<span class="mh-day-label">Today with Mochi</span>'+H.ROUTINE.map(r=>`<span class="mh-paw${h.routine.done.includes(r.id)?' on':''}"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="15" r="4.5"/><circle cx="6.5" cy="9.5" r="2.2"/><circle cx="10" cy="6" r="2.2"/><circle cx="14" cy="6" r="2.2"/><circle cx="17.5" cy="9.5" r="2.2"/></svg>${esc(r.label)}</span>`).join('');
 const next=H.nextTrick(h),prev=[...H.TRICKS].reverse().find(t=>t.bond<=h.bond),span=next?next.bond-prev.bond:1,got=next?h.bond-prev.bond:1;
 $('mhBond').innerHTML=`<span class="mh-bond-hearts">${svg('love')} Bond ${h.bond}</span><span class="mh-bond-bar"><span style="width:${Math.round(100*got/span)}%"></span></span><span class="mh-bond-next">${next?`Next trick: <b>${esc(next.name)}</b> at ${next.bond}`:'Mochi knows every trick!'}</span>`;
 const pet=root.MochiPlanner?.pet?.(root.MochiPlanner.init(S));if(pet)$('mhGrowth').innerHTML=`<b>${esc(pet.name)}</b> · grows as you learn`;
 $('mhCoins').textContent=String(Math.max(0,Math.floor(S.coins||0)));
 $('mhSound').setAttribute('aria-pressed',String(h.sound));
}
function refresh(){if(!$('mhNeeds'))return;H.advance(home());paintNeeds();paintDay();paintWish();api?.setNeeds?.(home().needs);}
function after(r){
 if(!r)return;persist();refresh();
 if(r.text)say(r.text);
 for(const t of r.newTricks||[]){celebrate(`Mochi learned a new trick: ${t.name}!`);}
 if(r.routine&&home().routine.done.length===H.ROUTINE.length)setTimeout(()=>celebrate('All four paw stamps today. Mochi feels so loved!'),900);
}
function celebrate(text){const t=$('mhToast');if(!t)return;t.textContent=text;t.hidden=false;t.classList.remove('mh-pop');void t.offsetWidth;t.classList.add('mh-pop');chime();clearTimeout(t._t);t._t=setTimeout(()=>t.hidden=true,4200);}

// ---------- sound: a soft synthesised purr and a small chime ----------
let ctx=null;
function audio(){if(!home().sound)return null;try{ctx=ctx||new (root.AudioContext||root.webkitAudioContext)();if(ctx.state==='suspended')ctx.resume();return ctx;}catch(e){return null;}}
function purrOn(ms=1600){const a=audio();if(!a)return;clearTimeout(purr?.stop);if(!purr){const len=a.sampleRate*2,buf=a.createBuffer(1,len,a.sampleRate),d=buf.getChannelData(0);let b=0;for(let i=0;i<len;i++){b=(b+.02*(Math.random()*2-1))/1.02;d[i]=b*3.5;}const src=a.createBufferSource();src.buffer=buf;src.loop=true;const lp=a.createBiquadFilter();lp.type='lowpass';lp.frequency.value=320;const g=a.createGain();g.gain.value=0;const am=a.createGain();am.gain.value=.5;const lfo=a.createOscillator();lfo.frequency.value=24;const lg=a.createGain();lg.gain.value=.5;lfo.connect(lg).connect(am.gain);src.connect(lp).connect(am).connect(g).connect(a.destination);src.start();lfo.start();purr={src,lfo,g};}
 purr.g.gain.setTargetAtTime(.16,a.currentTime,.15);purr.stop=setTimeout(()=>{purr.g.gain.setTargetAtTime(0,a.currentTime,.25);const p=purr;setTimeout(()=>{if(purr===p&&p.g.gain.value<.01){p.src.stop();p.lfo.stop();purr=null;}},1500);},ms);}
function chime(){const a=audio();if(!a)return;[784,988,1319].forEach((f,i)=>{const o=a.createOscillator(),g=a.createGain();o.type='sine';o.frequency.value=f;g.gain.setValueAtTime(0,a.currentTime+i*.09);g.gain.linearRampToValueAtTime(.08,a.currentTime+i*.09+.02);g.gain.exponentialRampToValueAtTime(.0001,a.currentTime+i*.09+.5);o.connect(g).connect(a.destination);o.start(a.currentTime+i*.09);o.stop(a.currentTime+i*.09+.6);});}

// ---------- modes ----------
function setMode(m,text,doneLabel='Done'){
 api?.setMode(m);const bar=$('mhModebar');bar.hidden=m==='idle';$('mhModeText').textContent=text||'';$('mhModeDone').textContent=doneLabel;
 document.querySelectorAll('[data-care]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.care===({brush:'brush',nap:'nap'}[m]||(m.startsWith('play:')?'play':'')))));
 $('mhStage').dataset.mode=m.split(':')[0];
}
function endMode(){if(api?.mode==='nap')api.wake();setMode('idle');}
function drawer(kind){
 const d=$('mhDrawer');if(d.dataset.kind===kind&&!d.hidden){d.hidden=true;d.dataset.kind='';return;}
 d.dataset.kind=kind;d.hidden=false;const coins=Math.floor(S.coins||0),h=home();let html='';
 if(kind==='treats')html=`<h3>Treats <small>Bought with coins from your learning</small></h3><div class="mh-items">${(root.TREATS_LIST||[]).map(t=>`<button class="mh-item${coins<t.cost?' locked':''}" data-treat="${t.id}"><span class="mh-item-ico">${t.icon}</span><span>${esc(t.name)}</span><span class="mh-cost">🪙 ${t.cost}</span></button>`).join('')}</div>`;
 if(kind==='play')html=`<h3>Toys <small>Pick one to play</small></h3><div class="mh-items">${H.TOYS.map(t=>{const own=h.toys.includes(t.id);return `<button class="mh-item${!own&&coins<t.cost?' locked':''}" data-toy="${t.id}"><span class="mh-item-ico">${{feather:'🪶',yarn:'🧶',box:'📦',laser:'🔴',plush:'🐟',tree:'🌳'}[t.id]}</span><span>${esc(t.name)}</span><span class="mh-cost">${own?(t.kind==='furniture'?'In the room':'Play'):'🪙 '+t.cost}</span></button>`;}).join('')}</div>`;
 if(kind==='tricks')html=`<h3>Tricks <small>Mochi learns new tricks as your bond grows</small></h3><div class="mh-items">${H.TRICKS.map(t=>{const ok=h.bond>=t.bond;return `<button class="mh-item${ok?'':' locked'}" data-trick="${t.id}" ${ok?'':'aria-disabled="true"'}><span class="mh-item-ico">${ok?'⭐':'🔒'}</span><span>${esc(t.name)}</span><span class="mh-cost">${ok?'Ask him':'Bond '+t.bond}</span></button>`;}).join('')}</div>`;
 if(kind==='wardrobe'){const W=root.WEAR_LIST||[],owned=S.owned||[],worn=S.worn||{};html=`<h3>Wardrobe <small>Tap to wear or take off</small></h3><div class="mh-items">${W.map(w=>{const own=owned.includes(w.id),on=worn[w.slot]===w.id;return `<button class="mh-item${!own&&coins<w.cost?' locked':''}${on?' on':''}" data-wear="${w.id}"><span class="mh-item-ico">${{bow:'🎀',specs:'👓',party:'🥳',scarf:'🧣',shades:'🕶️',crown:'👑'}[w.id]||'✨'}</span><span>${esc(w.name)}</span><span class="mh-cost">${own?(on?'Wearing':'Wear'):'🪙 '+w.cost}</span></button>`;}).join('')}</div>`;}
 d.innerHTML=html+'<button class="mh-drawer-close" type="button" aria-label="Close">×</button>';
 d.querySelector('.mh-drawer-close').onclick=()=>{d.hidden=true;d.dataset.kind='';};
 d.querySelectorAll('[data-treat]').forEach(b=>b.onclick=()=>buyTreat(b.dataset.treat));
 d.querySelectorAll('[data-toy]').forEach(b=>b.onclick=()=>chooseToy(b.dataset.toy));
 d.querySelectorAll('[data-trick]').forEach(b=>b.onclick=()=>trick(b.dataset.trick));
 d.querySelectorAll('[data-wear]').forEach(b=>b.onclick=()=>wear(b.dataset.wear));
}
function buyTreat(id){
 const t=(root.TREATS_LIST||[]).find(x=>x.id===id);if(!t)return;
 if((S.coins||0)<t.cost){say(`The ${t.name.toLowerCase()} costs ${t.cost} coins. Answer a few more questions to earn them.`);return;}
 S.coins-=t.cost;S.fed=(S.fed||0)+1;try{root.paintCoins?.();}catch(e){}
 const r=H.act(home(),'treat',t);api?.react('treat:'+t.id);after(r);$('mhDrawer').hidden=true;
}
function chooseToy(id){
 const h=home(),t=H.TOYS.find(x=>x.id===id);
 if(!h.toys.includes(id)){const r=H.buyToy(h,id,S.coins||0);if(!r.ok){say(r.text);return;}S.coins-=r.cost;try{root.paintCoins?.();}catch(e){}persist();api?.setToys(h.toys);say(r.text);drawer('play');drawer('play');if(t.kind==='furniture')return;}
 if(t.kind==='furniture'){say(id==='box'?'Mochi loves his box. Tap it and he’ll hop inside!':'Tap the cat tree and Mochi will climb to the top.');return;}
 $('mhDrawer').hidden=true;
 const tips={feather:'Drag the feather around. Mochi will chase and pounce!',laser:'Move the red dot and watch Mochi chase it.',yarn:'Tap the floor to roll the yarn. Mochi will bat it back.',plush:'Tap the floor to toss the fish. Mochi will chase it.'};
 setMode('play:'+id,tips[id],'Finish playing');
}
function trick(id){const r=H.act(home(),'trick',id);api?.react(r.anim);if(r.ok)purrOn(900);after(r);$('mhDrawer').hidden=true;}
function wear(id){const w=(root.WEAR_LIST||[]).find(x=>x.id===id);if(!w)return;root.toggleWear?.(w);api?.setWear(S.worn||{});drawer('wardrobe');drawer('wardrobe');refresh();const note=$('wearNote')?.textContent;if(note)say(note);}
function care(kind){
 const h=home();
 if(kind==='feed'){endMode();const r=H.act(h,'feed');if(r.ok){api?.fillBowl();api?.react('eat');}else api?.react(r.anim);after(r);return;}
 if(kind==='brush'){if(api?.mode==='brush')return endMode();setMode('brush','Brush Mochi by stroking his fur. He loves it!');say('Mochi sits still and waits for his brush.');return;}
 if(kind==='nap'){if(api?.mode==='nap')return endMode();if(h.needs.energy>=97){say('Mochi is wide awake and full of beans!');api?.react('tilt');return;}setMode('nap','Shh… Mochi is napping. Wake him whenever you like.','Wake him');return;}
 if(kind==='play'){if(api?.mode?.startsWith('play:'))return endMode();drawer('play');return;}
 drawer(kind);
}
// ---------- events from the 3D room ----------
let strokeCount=0;
const UI={
 attach(a){
  api=a;const first=!S.home;const h=home();H.advance(h);const hello=first?'Welcome to Mochi’s home! Tap him to say hello. Feed, brush, play and nap are always free.':H.welcome(h,Date.now());persist();
  root.TREATS_LIST=typeof TREATS!=='undefined'?TREATS:root.TREATS_LIST;root.WEAR_LIST=typeof WEAR!=='undefined'?WEAR:root.WEAR_LIST;
  api.setToys?.(h.toys);api.setNeeds?.(h.needs);
  document.querySelector('#mochi3d .mp-loading')?.setAttribute('hidden','');
  refresh();if(hello)say(hello,6000);
  clearInterval(ticker);ticker=setInterval(()=>{if(document.hidden)return;refresh();},20000);
 },
 refresh,
 visit(){if(!api)return;const h=home();H.advance(h);const hello=H.welcome(h,Date.now());persist();refresh();if(hello)say(hello,6000);api.greet?.();},
 stroke(){if(api?.mode==='nap'){say('Mochi purrs in his sleep.');purrOn(1200);return;}S.pets=(S.pets||0)+1;strokeCount++;const r=H.act(home(),'pet');api?.react('purr');purrOn();after({...r,text:strokeCount%4===1?['Mochi leans into your hand.','A slow blink. That means he loves you.','Prrrrr… Mochi is purring.','Mochi rubs his cheek on your hand.'][Math.floor(strokeCount/4)%4]:''});},
 brush(n){const r=H.act(home(),'brush',n);purrOn(900);if(r.done){api?.react('shine');after(r);clearTimeout(modeTimer);modeTimer=setTimeout(()=>{if(api?.mode==='brush')endMode();},1800);}else{persist();paintNeeds();}},
 play(n){const r=H.act(home(),'play',n);if(!r.ok){after(r);endMode();api?.react('yawn');return;}if(r.done){api?.react('hop');after(r);}else{persist();paintNeeds();}},
 nap(n){const r=H.act(home(),'nap',n);if(r.done){after(r);endMode();}else paintNeeds();},
 tap(kind,id){if(kind==='bowl')care('feed');else if(kind==='bed')care('nap');else if(kind==='basket')care('play');else if(kind==='friend'){const f=root.MochiCatFriends?.catalog?.find(c=>c.id===id);if(f)say(`${f.name} purrs happily. Friends are always welcome here.`);}}
};
function init(){
 if(!$('mhDock'))return;
 $('mhDock').querySelectorAll('[data-care]').forEach(b=>{const k=b.dataset.care;b.innerHTML=svg(k,'mh-dock-ico')+`<span>${b.textContent}</span>`;b.onclick=()=>care(k);});
 $('mhModeDone').onclick=endMode;
 $('mhSound').onclick=()=>{const h=home();h.sound=!h.sound;if(!h.sound&&purr){purr.g.gain.value=0;}persist();paintDay();};
 refresh();
}
root.MochiHomeUI=UI;
if(root.MochiReady)init();else document.addEventListener('mochi:ready',init,{once:true});
})(window);
