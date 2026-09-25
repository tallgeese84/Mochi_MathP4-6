/* Shared flat portrait language for Mochi and every Cat Friend.
   Rendering is presentation only: no storage, progress or rewards are read/written. */
(function(root){
'use strict';
const mochi=Object.freeze({id:'mochi',name:'Mochi',shape:'round',coat:'#b58e6e',point:'#765743',eyes:'#a9be76'});
function svg(cat=mochi){
 if(!cat||![cat.coat,cat.point,cat.eyes].every(c=>/^#[0-9a-f]{6}$/i.test(c)))throw new TypeError('Expected a fixed cat palette');
 const main=cat.id==='mochi';
 const fluffy=['fluffy','tufted'].includes(cat.shape),slim=cat.shape==='slender',round=cat.shape==='round';
 const ear=round?'M30 44 L27 20 Q29 13 39 25 L45 38':'M27 45 L21 8 Q26 3 43 30 L44 41';
 const parts=`${main?'<path d="M80 108 C107 118 115 93 99 81 C96 79 93 84 96 88 C104 99 96 108 85 100Z" fill="#a88262"/>':''}<path d="${ear}" fill="${slim?cat.point:cat.coat}"/><path d="${ear}" transform="translate(120 0) scale(-1 1)" fill="${slim?cat.point:cat.coat}"/>
 <ellipse cx="60" cy="76" rx="${slim?28:36}" ry="40" fill="${cat.coat}"/>
 ${main?'<ellipse cx="60" cy="92" rx="15" ry="23" fill="#fff6e9"/>':''}
 ${fluffy?`<path d="M25 52 L14 65 L24 69 L18 82 L36 81 L60 94 L87 80 L102 82 L96 68 L106 65 L94 50Z" fill="${cat.coat}"/>`:''}
 <ellipse cx="60" cy="50" rx="${slim?33:42}" ry="33" fill="${cat.coat}"/>
 ${main?'<path d="M48 19 L51 33 Q54 35 55 31 L56 18 M58 17 L60 34 L64 17 M67 18 L66 31 Q68 35 70 31 L73 19 M19 52 L29 56 L20 61 M100 52 L91 56 L100 61 M23 66 L32 67 L27 73 M97 66 L88 67 L93 73" fill="#765743"/><path d="M60 40 Q54 57 44 65 L76 65 Q66 57 60 40Z" fill="#fff6e9"/>':''}
 ${slim?`<ellipse cx="60" cy="55" rx="28" ry="26" fill="${cat.point}"/>`:''}
 ${cat.id==='yuki'?`<ellipse cx="43" cy="50" rx="19" ry="23" fill="${cat.point}"/><ellipse cx="77" cy="50" rx="19" ry="23" fill="${cat.point}"/><path d="M60 27 L74 73 L45 73Z" fill="${cat.coat}"/>`:''}
 ${cat.id==='kumo'?`<path d="M36 29 L39 16 L46 32 M74 32 L81 16 L84 29 M30 16 L20 3 L26 25 M90 16 L100 3 L94 25" fill="${cat.point}"/>`:''}
 <ellipse cx="60" cy="72" rx="22" ry="12" fill="${slim?cat.point:'#fff6e9'}"/>
 <g class="cf-eyes"><ellipse cx="42" cy="52" rx="13" ry="15" fill="#352c40"/><ellipse cx="78" cy="52" rx="13" ry="15" fill="#352c40"/><ellipse cx="42" cy="53" rx="11" ry="12" fill="${cat.eyes}"/><ellipse cx="78" cy="53" rx="11" ry="12" fill="${cat.eyes}"/><ellipse cx="43" cy="53" rx="7" ry="10" fill="#282331"/><ellipse cx="77" cy="53" rx="7" ry="10" fill="#282331"/><circle cx="38" cy="47" r="4" fill="white"/><circle cx="74" cy="47" r="4" fill="white"/></g>
 <path d="M56 67 Q60 64 64 67 L60 72Z" fill="#b98491"/><path d="M54 75 Q60 80 66 75" stroke="#826777" stroke-width="1.5" fill="none"/>
 ${main?'<path d="M40 82 Q60 90 80 82 L80 87 Q60 96 40 87Z" fill="#6298b6"/><circle cx="60" cy="91" r="5" fill="#d8b763"/><circle cx="60" cy="91" r="1.6" fill="#ad8950"/>':''}
 <ellipse cx="45" cy="110" rx="13" ry="7" fill="${main?'#fff6e9':slim?cat.point:cat.coat}"/><ellipse cx="76" cy="110" rx="13" ry="7" fill="${main?'#fff6e9':slim?cat.point:cat.coat}"/>`;
 return `<svg viewBox="0 0 120 120" aria-hidden="true" focusable="false">${parts}</svg>`;
}
function documentSVG(avatar=false){
 return svg(mochi).replace('<svg viewBox="0 0 120 120" aria-hidden="true" focusable="false">',
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="'+(avatar?'12 4 96 96':'0 0 120 120')+'" role="img" aria-label="Mochi, a round brown tabby cat"><title>Mochi</title>').replace(/[ \t]+$/gm,'')+'\n';
}
root.MochiCatPortraits=Object.freeze({mochi,svg,documentSVG});
if(typeof module!=='undefined')module.exports=root.MochiCatPortraits;
})(typeof window!=='undefined'?window:globalThis);
