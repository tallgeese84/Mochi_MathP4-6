/* Mochi sits beside each practice question and reacts to checked answers.
   Presentation only: it reads the result the pathway engine already recorded and
   never changes marks, help flags, rewards or saved data. No guilt, no streaks. */
(function(root){
'use strict';
const lines={
 calm:['Take your time. I’m right here.','Read it slowly, then picture it.','What do you know, and what do you need?'],
 independent:['You worked that out on your own!','Purr-fect. All by yourself!','That was your own thinking. Brilliant.'],
 correct:['You got there! Help is part of learning.','Nice — now could you explain why it works?','Got it. Ready for the next one?'],
 retry:['Not yet — that’s how learning works.','Close look time. Try the quick check with me.','Mistakes help us find the tricky part.'],
 pause:['Let’s look at the lesson together, then try again.','A short look back will help. I’ll wait here.']
};
let turn=0;
const memory={};
const pick=list=>list[(turn++)%list.length];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function avatar(){
 const d=root.document;
 const pet=d?.getElementById?.('plannerPetImage')?.getAttribute?.('src')||'';
 const base=typeof MOCHI_AVATAR==='string'?MOCHI_AVATAR:'mochi-flat-avatar.svg';
 return !pet||/mochi-flat(-avatar)?\.svg/.test(pet)?base.replace('mochi-flat-avatar.svg','mochi-flat.svg'):pet;
}
function slot(prefix,key=''){
 let m=memory[prefix];
 if(!m||m.key!==key)m=memory[prefix]={key,mood:'calm',text:pick(lines.calm)};
 return `<div class="mochi-buddy" id="${prefix}MochiBuddy" data-mood="${m.mood}" data-key="${esc(key)}" aria-live="polite"><img src="${esc(avatar())}" alt="" width="64" height="64"><p class="mochi-buddy-says">${esc(m.text)}</p><span class="mochi-buddy-burst" aria-hidden="true"></span></div>`;
}
function mood(r){
 if(r.correct)return r.independent&&r.responses<=1?'independent':'correct';
 return r.needsLesson||r.responses>=2?'pause':'retry';
}
function react(prefix,result){
 const box=root.document?.getElementById?.(prefix+'MochiBuddy');if(!box)return null;
 const m=mood(result||{}),text=pick(lines[m]);
 box.dataset.mood=m;memory[prefix]={key:box.dataset.key||'',mood:m,text};
 const says=box.querySelector('.mochi-buddy-says');if(says)says.textContent=text;
 box.classList.remove('mochi-buddy-pop');void box.offsetWidth;box.classList.add('mochi-buddy-pop');
 return m;
}
const api={slot,react,mood,lines};
root.MochiBuddy=api;
if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
