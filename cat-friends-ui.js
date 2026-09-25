/* Compact accessible roster. Picture companions remain available without WebGL. */
(function(root){
'use strict';
const F=root.MochiCatFriends;
function portrait(cat){
 const fluffy=['fluffy','tufted'].includes(cat.shape),slim=cat.shape==='slender',round=cat.shape==='round';
 const ear=round?'M30 44 L27 20 Q29 13 39 25 L45 38':'M27 45 L21 8 Q26 3 43 30 L44 41';
 const parts=`<path d="${ear}" fill="${slim?cat.point:cat.coat}"/><path d="${ear}" transform="translate(120 0) scale(-1 1)" fill="${slim?cat.point:cat.coat}"/>
 <ellipse cx="60" cy="76" rx="${slim?28:36}" ry="40" fill="${cat.coat}"/>
 ${fluffy?`<path d="M25 52 L14 65 L24 69 L18 82 L36 81 L60 94 L87 80 L102 82 L96 68 L106 65 L94 50Z" fill="${cat.coat}"/>`:''}
 <ellipse cx="60" cy="50" rx="${slim?33:42}" ry="33" fill="${cat.coat}"/>
 ${slim?`<ellipse cx="60" cy="55" rx="28" ry="26" fill="${cat.point}"/>`:''}
 ${cat.id==='yuki'?`<ellipse cx="43" cy="50" rx="19" ry="23" fill="${cat.point}"/><ellipse cx="77" cy="50" rx="19" ry="23" fill="${cat.point}"/><path d="M60 27 L74 73 L45 73Z" fill="${cat.coat}"/>`:''}
 ${cat.id==='kumo'?`<path d="M36 29 L39 16 L46 32 M74 32 L81 16 L84 29 M30 16 L20 3 L26 25 M90 16 L100 3 L94 25" fill="${cat.point}"/>`:''}
 <ellipse cx="60" cy="72" rx="22" ry="12" fill="${slim?cat.point:'#fff6e9'}"/>
 <g class="cf-eyes"><ellipse cx="42" cy="52" rx="13" ry="15" fill="#352c40"/><ellipse cx="78" cy="52" rx="13" ry="15" fill="#352c40"/><ellipse cx="42" cy="53" rx="11" ry="12" fill="${cat.eyes}"/><ellipse cx="78" cy="53" rx="11" ry="12" fill="${cat.eyes}"/><ellipse cx="43" cy="53" rx="7" ry="10" fill="#282331"/><ellipse cx="77" cy="53" rx="7" ry="10" fill="#282331"/><circle cx="38" cy="47" r="4" fill="white"/><circle cx="74" cy="47" r="4" fill="white"/></g>
 <path d="M56 67 Q60 64 64 67 L60 72Z" fill="#b98491"/><path d="M54 75 Q60 80 66 75" stroke="#826777" stroke-width="1.5" fill="none"/>
 <ellipse cx="45" cy="110" rx="13" ry="7" fill="${slim?cat.point:cat.coat}"/><ellipse cx="76" cy="110" rx="13" ry="7" fill="${slim?cat.point:cat.coat}"/>`;
 return `<svg viewBox="0 0 120 120" aria-hidden="true" focusable="false">${parts}</svg>`;
}
function init(){
 const view=document.getElementById('viewRoom');if(!view||document.getElementById('catFriends'))return;
 const box=document.createElement('details');box.id='catFriends';box.className='cat-friends';
 box.innerHTML='<summary><span>Cat Friends</span><span id="catFriendsCount"></span></summary><p class="cf-intro">Mochi always stays. Invite up to three friends to share the room. Friends unlock through earned learning milestones, not coins or streaks.</p><div id="catFriendsCards" class="cf-cards"></div><p id="catFriendsStatus" class="cf-status" role="status" aria-live="polite"></p><p class="cf-note">Earned friends stay unlocked through mistakes and rest days. Pausing the room pauses every cat.</p>';
 (view.querySelector('.card.room')||view).appendChild(box);
 const pictures=document.createElement('div');pictures.id='catFriendsPictures';pictures.className='cf-picture-room';pictures.setAttribute('aria-label','Mochi’s companion cats');
 document.getElementById('stage').after(pictures);
 const cards=document.getElementById('catFriendsCards'),status=document.getElementById('catFriendsStatus');let last='';
 function stroke(cat){
  if(!root.MochiRoom?.petFriend(cat.id))status.textContent=cat.name+' settles beside Mochi. Prrr…';
  else status.textContent=cat.name+' is enjoying a gentle stroke.';
 }
 for(const cat of F.catalog){
  const card=document.createElement('article');card.className='cf-card';card.dataset.friend=cat.id;
  // All markup values are constants from the catalog, never imported learner text.
  card.innerHTML=`<div class="cf-portrait">${portrait(cat)}</div><div class="cf-name"><h3>${cat.name}</h3><p>${cat.breed}</p></div><p class="cf-description">${cat.description}</p><p class="cf-unlock"></p><button type="button" class="cf-toggle" aria-pressed="false"></button>`;
  const toggle=card.querySelector('.cf-toggle');toggle.onclick=()=>{
   const result=F.select(S,cat.id,!F.sync(S).selected.includes(cat.id));
   status.textContent=result.ok?(result.selected.includes(cat.id)?cat.name+' joined the room.':cat.name+' is resting. You can invite this friend back at any time.'):result.reason;
   if(result.ok){save(S);document.dispatchEvent(new Event('mochi:cat-friends-changed'));}
   paint();
  };cards.appendChild(card);
 }
 function paint(){
  const r=F.report(S),signature=JSON.stringify([r.unlocked,r.selected,r.milestones]);
  const picture=document.getElementById('stage');pictures.hidden=picture.hidden||!r.selected.length;
  if(signature===last)return;last=signature;
  document.getElementById('catFriendsCount').textContent=`${r.unlocked.length}/4 unlocked · ${r.selected.length}/3 visiting`;
  for(const cat of r.cats){
   const card=cards.querySelector(`[data-friend="${cat.id}"]`),button=card.querySelector('.cf-toggle');
   card.dataset.unlocked=String(cat.unlocked);card.dataset.selected=String(cat.selected);
   card.querySelector('.cf-unlock').textContent=cat.unlocked?(cat.selected?'With Mochi':'Ready to visit'):`${cat.remaining} more earned milestones to unlock (${cat.milestones} total)`;
   button.disabled=!cat.unlocked;button.setAttribute('aria-pressed',String(cat.selected));
   button.textContent=!cat.unlocked?'Not unlocked':cat.selected?'Let '+cat.name+' rest':'Invite '+cat.name;
  }
  pictures.replaceChildren();
  for(const id of r.selected){const cat=F.catalog.find(c=>c.id===id),b=document.createElement('button');b.type='button';b.className='cf-picture-cat';b.innerHTML=portrait(cat)+'<span>'+cat.name+'</span>';b.setAttribute('aria-label','Stroke '+cat.name+', '+cat.breed);b.onclick=()=>stroke(cat);pictures.appendChild(b);}
 }
 document.addEventListener('mochi:state-saved',paint);document.addEventListener('mochi:cloud-merged',paint);document.addEventListener('mochi:cat-friends-changed',paint);
 const observer=new MutationObserver(paint);observer.observe(document.getElementById('stage'),{attributes:true,attributeFilter:['hidden']});
 const before=JSON.stringify(S.catFriends);paint();if(before!==JSON.stringify(S.catFriends))save(S);
 root.MochiCatFriendsUI={refresh:paint};
}
root.MochiCatFriendsPortrait=portrait;
if(root.MochiReady)init();else document.addEventListener('mochi:ready',init,{once:true});
})(window);
