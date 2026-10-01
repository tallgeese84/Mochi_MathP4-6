/* Compact accessible roster. Picture companions remain available without WebGL. */
(function(root){
'use strict';
const F=root.MochiCatFriends;
/* GENERATED PORTRAIT START */
function portrait(cat){
 if(!cat||![cat.coat,cat.point,cat.eyes].every(c=>/^#[0-9a-f]{6}$/i.test(c)))throw new TypeError('Expected a fixed cat palette');
 const main=cat.id==='mochi';
 const coon=['coon','tufted'].includes(cat.shape),fluffy=coon||cat.shape==='fluffy',slim=cat.shape==='slender',round=cat.shape==='round';
 const ear=round?'M30 44 L27 20 Q29 13 39 25 L45 38':'M27 45 L21 8 Q26 3 43 30 L44 41';
 const parts=`${main?'<path d="M78 110 C111 123 124 93 103 75 C95 69 86 77 91 85 C100 96 97 104 84 97Z" fill="#a88262"/>':''}<path d="${ear}" fill="${slim?cat.point:cat.coat}"/><path d="${ear}" transform="translate(120 0) scale(-1 1)" fill="${slim?cat.point:cat.coat}"/>
 <ellipse cx="60" cy="76" rx="${slim?28:36}" ry="40" fill="${cat.coat}"/>
 ${main?'<ellipse cx="60" cy="92" rx="15" ry="23" fill="#fff6e9"/>':''}
 ${fluffy?`<path d="M25 52 L14 65 L24 69 L18 82 L36 81 L60 94 L87 80 L102 82 L96 68 L106 65 L94 50Z" fill="${cat.coat}"/>`:''}
 <ellipse cx="60" cy="50" rx="${slim?33:42}" ry="33" fill="${cat.coat}"/>
 ${main?'<path d="M48 19 L51 33 Q54 35 55 31 L56 18 M58 17 L60 34 L64 17 M67 18 L66 31 Q68 35 70 31 L73 19 M19 52 L29 56 L20 61 M100 52 L91 56 L100 61 M23 66 L32 67 L27 73 M97 66 L88 67 L93 73" fill="#765743"/><path d="M60 40 Q54 57 44 65 L76 65 Q66 57 60 40Z" fill="#fff6e9"/>':''}
 ${slim?`<ellipse cx="60" cy="55" rx="28" ry="26" fill="${cat.point}"/>`:''}
 ${cat.id==='yuki'?`<ellipse cx="43" cy="50" rx="19" ry="23" fill="${cat.point}"/><ellipse cx="77" cy="50" rx="19" ry="23" fill="${cat.point}"/><path d="M60 27 L74 73 L45 73Z" fill="${cat.coat}"/>`:''}
 ${coon?`<path d="M36 29 L39 16 L46 32 M74 32 L81 16 L84 29 M30 16 L20 3 L26 25 M90 16 L100 3 L94 25" fill="${cat.point}"/>`:''}
 <ellipse cx="60" cy="72" rx="22" ry="12" fill="${slim?cat.point:'#fff6e9'}"/>
 <g class="cf-eyes"><ellipse cx="42" cy="52" rx="13" ry="15" fill="#352c40"/><ellipse cx="78" cy="52" rx="13" ry="15" fill="#352c40"/><ellipse cx="42" cy="53" rx="11" ry="12" fill="${cat.eyes}"/><ellipse cx="78" cy="53" rx="11" ry="12" fill="${cat.eyes}"/><ellipse cx="43" cy="53" rx="7" ry="10" fill="#282331"/><ellipse cx="77" cy="53" rx="7" ry="10" fill="#282331"/><circle cx="38" cy="47" r="4" fill="white"/><circle cx="74" cy="47" r="4" fill="white"/></g>
 <path d="M56 67 Q60 64 64 67 L60 72Z" fill="#b98491"/><path d="M54 75 Q60 80 66 75" stroke="#826777" stroke-width="1.5" fill="none"/>
 ${main?'<path d="M40 82 Q60 90 80 82 L80 87 Q60 96 40 87Z" fill="#6298b6"/><circle cx="60" cy="91" r="5" fill="#d8b763"/><circle cx="60" cy="91" r="1.6" fill="#ad8950"/>':''}
 <ellipse cx="45" cy="110" rx="13" ry="7" fill="${main?'#fff6e9':slim?cat.point:cat.coat}"/><ellipse cx="76" cy="110" rx="13" ry="7" fill="${main?'#fff6e9':slim?cat.point:cat.coat}"/>`;
 return `<svg viewBox="0 0 120 120" aria-hidden="true" focusable="false">${parts}</svg>`;
}
/* GENERATED PORTRAIT END */
function init(){
 const view=document.getElementById('viewRoom');if(!view||document.getElementById('catFriends'))return;
 const PAGE=12;let page=0,last='';
 const box=document.createElement('details');box.id='catFriends';box.className='cat-friends';
 box.innerHTML='<summary><span>Cat collection</span><span id="catFriendsCount"></span></summary><p class="cf-intro">Mochi always stays. Collect up to 99 friends (100 cats total) and invite up to three at a time. Cat Points come from earned milestones, new geometry bridge lessons and independently confirmed corrections; reaching exactly 2× a subject’s planned study time adds a small bounded bonus.</p><div class="cf-points"><strong id="catPointTotal"></strong><span id="catPointBreakdown"></span><small id="catNextUnlock"></small></div><div class="cf-page-nav"><button type="button" id="catPrevPage">← Previous</button><span id="catPageLabel"></span><button type="button" id="catNextPage">Next →</button></div><div id="catFriendsCards" class="cf-cards"></div><p id="catFriendsStatus" class="cf-status" role="status" aria-live="polite"></p><p class="cf-note">The time bonus is awarded once per subject per day at 2× and stops there; going beyond 2× earns nothing extra. Earned cats never disappear after mistakes or rest days.</p>';
 const room=view.querySelector('.card.room')||view;
 const welcome=document.createElement('div');welcome.className='cf-room-welcome';
 welcome.innerHTML='<div><strong>Mochi + friends</strong><p id="catFriendsRoomSummary" role="status"></p></div><button type="button" class="cf-toggle" id="catFriendsManage" aria-controls="catFriends" aria-expanded="false">Choose friends</button>';
 room.prepend(welcome);room.appendChild(box);
 document.getElementById('catFriendsManage').onclick=()=>{box.open=!box.open;if(box.open)box.scrollIntoView({block:'nearest'});};
 box.addEventListener('toggle',()=>document.getElementById('catFriendsManage').setAttribute('aria-expanded',String(box.open)));
 const roomLink=document.getElementById('tabRoom');if(roomLink)roomLink.textContent='Mochi + cat friends ↗';
 const pictures=document.createElement('div');pictures.id='catFriendsPictures';pictures.className='cf-picture-room';pictures.setAttribute('aria-label','Mochi’s companion cats');welcome.after(pictures);
 const cards=document.getElementById('catFriendsCards'),status=document.getElementById('catFriendsStatus');
 function stroke(cat){if(!root.MochiRoom?.petFriend(cat.id))status.textContent=cat.name+' settles beside Mochi. Prrr…';else status.textContent=cat.name+' is enjoying a gentle stroke.';}
 function renderCards(r){
  const maxPage=Math.max(0,Math.ceil(F.catalog.length/PAGE)-1);page=Math.max(0,Math.min(page,maxPage));cards.replaceChildren();
  for(const cat of r.cats.slice(page*PAGE,page*PAGE+PAGE)){
   const card=document.createElement('article');card.className='cf-card';card.dataset.friend=cat.id;card.dataset.unlocked=String(cat.unlocked);card.dataset.selected=String(cat.selected);
   card.innerHTML=`<div class="cf-portrait">${portrait(cat)}</div><div class="cf-name"><h3>${cat.name}</h3><p>${cat.breed}</p></div><p class="cf-description">${cat.description}</p><p class="cf-unlock">${cat.unlocked?(cat.selected?'With Mochi':'Ready to visit'):`${cat.remaining} more Cat Points · unlock at ${cat.points}`}</p><button type="button" class="cf-toggle" aria-pressed="${cat.selected}" ${cat.unlocked?'':'disabled'}>${!cat.unlocked?'Not unlocked':cat.selected?'Let '+cat.name+' rest':'Invite '+cat.name}</button>`;
   card.querySelector('.cf-toggle').onclick=()=>{const result=F.select(S,cat.id,!F.sync(S).selected.includes(cat.id));status.textContent=result.ok?(result.selected.includes(cat.id)?cat.name+' joined the room.':cat.name+' is resting. You can invite this friend back at any time.'):result.reason;if(result.ok){save(S);document.dispatchEvent(new Event('mochi:cat-friends-changed'));}paint(true);};
   cards.appendChild(card);
  }
  document.getElementById('catPageLabel').textContent=`Cats ${page*PAGE+2}–${Math.min(F.catalog.length+1,(page+1)*PAGE+1)} of ${F.TOTAL}`;
  document.getElementById('catPrevPage').disabled=page===0;document.getElementById('catNextPage').disabled=page>=maxPage;
 }
 function paint(force=false){
  const r=F.report(S),signature=JSON.stringify([r.unlocked,r.selected,r.points,r.timeBonusAwards,page]);pictures.hidden=!r.selected.length;
  if(signature===last&&!force)return;last=signature;
  document.getElementById('catFriendsRoomSummary').textContent=r.selected.length?r.selected.map(id=>F.catalog.find(c=>c.id===id).name).join(', ')+' are visiting Mochi.':r.unlocked.length?'Your friends are resting. Choose friends to invite them back.':'Mochi is waiting for the first friend to unlock.';
  document.getElementById('catFriendsCount').textContent=`${r.unlockedTotal}/${r.totalCats} cats · ${r.selected.length}/${r.maxFriends} visiting`;
  document.getElementById('catPointTotal').textContent=`${r.points} Cat Points`;
  document.getElementById('catPointBreakdown').textContent=`${r.milestones} milestones · ${r.studyPoints} geometry learning · ${r.timeBonusPoints} time bonus`;
  document.getElementById('catNextUnlock').textContent=r.nextCat?`Next: ${r.nextCat.name} in ${r.nextCat.remaining} Cat Points`:'All 100 cats collected!';
  renderCards(r);
  pictures.replaceChildren();for(const id of r.selected){const cat=F.catalog.find(c=>c.id===id),b=document.createElement('button');b.type='button';b.className='cf-picture-cat';b.innerHTML=portrait(cat)+'<span>'+cat.name+'</span>';b.setAttribute('aria-label','Stroke '+cat.name+', '+cat.breed);b.onclick=()=>stroke(cat);pictures.appendChild(b);}
 }
 document.getElementById('catPrevPage').onclick=()=>{page--;last='';paint(true);};
 document.getElementById('catNextPage').onclick=()=>{page++;last='';paint(true);};
 document.addEventListener('mochi:state-saved',()=>paint());document.addEventListener('mochi:cloud-merged',()=>paint(true));document.addEventListener('mochi:cat-friends-changed',()=>paint(true));document.addEventListener('mochi:activity',()=>paint());
 const before=JSON.stringify(S.catFriends);paint(true);if(before!==JSON.stringify(S.catFriends))save(S);
 root.MochiCatFriendsUI={refresh:()=>paint(true),portrait};
}
root.MochiCatFriendsPortrait=portrait;
if(root.MochiReady)init();else document.addEventListener('mochi:ready',init,{once:true});
})(window);
