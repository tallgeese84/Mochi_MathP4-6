/* Singapore-style bar models for worked examples and revealed solutions only.
   They are teaching scaffolds: never drawn on independent questions or papers,
   and never stored in question data, so fingerprints and saved records are unchanged. */
(function(root){
'use strict';
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const U=46,H=34,X=96;
function bar(y,label,units,extra,u=U){
 let s=`<text x="${X-12}" y="${y+H/2+5}" text-anchor="end" class="bm-label">${esc(label)}</text>`;
 for(let i=0;i<units;i++)s+=`<rect x="${X+i*u}" y="${y}" width="${u}" height="${H}" rx="3" class="bm-unit"/>`;
 if(extra)s+=`<rect x="${X+units*U}" y="${y}" width="${extra.w}" height="${H}" rx="3" class="bm-extra"/><text x="${X+units*U+extra.w/2}" y="${y+H/2+5}" text-anchor="middle" class="bm-small">${esc(extra.label)}</text>`;
 return s;
}
function brace(x1,x2,y,label,below=false){
 const d=below?8:-8,ty=below?y+26:y-12;
 return `<path d="M${x1} ${y}v${d}H${x2}v${-d}" class="bm-brace"/><text x="${(x1+x2)/2}" y="${ty}" text-anchor="middle" class="bm-small">${esc(label)}</text>`;
}
function svg(height,body,alt){
 return `<figure class="bm-figure"><svg viewBox="0 0 480 ${height}" role="img" aria-label="${esc(alt)}" class="bm-svg">${body}</svg><figcaption>Bar model</figcaption></figure>`;
}
// v7.10 before-and-after model for equal additions: the gap between the bars keeps its length, so the
// parts are matched by the difference, and the extra parts on red show the added counters.
function equalAdditions(p){
 const gcd=(x,y)=>y?gcd(y,x%y):x,d1=p.b-p.a,d2=p.d-p.c;if(!(d1>0&&d2>0&&p.added>0))return '';
 const L=d1*d2/gcd(d1,d2),m1=L/d1,m2=L/d2,A=p.a*m1,Bb=p.b*m1,inc=p.c*m2-A,max=Bb+inc;
 if(!(inc>0)||max>24)return '';
 const u=Math.min(U,360/max),part=p.added/inc;
 const row=(y,label,n,ext)=>{let s=`<text x="${X-12}" y="${y+H/2+5}" text-anchor="end" class="bm-label">${esc(label)}</text>`;for(let i=0;i<n;i++)s+=`<rect x="${X+i*u}" y="${y}" width="${u}" height="${H}" rx="3" class="bm-unit"/>`;for(let i=0;i<ext;i++)s+=`<rect x="${X+(n+i)*u}" y="${y}" width="${u}" height="${H}" rx="3" class="bm-extra"/>`;return s;};
 const pl=n=>n===1?'part':'parts';
 const body=`<text x="${X}" y="16" class="bm-small">Before</text>`+row(24,'Red',A,0)+row(64,'Blue',Bb,0)+brace(X+A*u,X+Bb*u,64+H,`difference: ${L} ${pl(L)}`,true)
  +`<text x="${X}" y="152" class="bm-small">After (+${p.added} each)</text>`+row(160,'Red',A,inc)+row(200,'Blue',Bb,inc)+brace(X+(A+inc)*u,X+(Bb+inc)*u,200+H,`still ${L} ${pl(L)}`,true)
  +`<text x="${X}" y="292" class="bm-note">Red gained ${inc} shaded ${pl(inc)} = ${p.added} counters.</text><text x="${X}" y="312" class="bm-note">So 1 part = ${part}.</text>`;
 return svg(326,body,`Bar model: before, red has ${A} parts and blue ${Bb} parts, a difference of ${L}. After adding ${p.added} counters to each, red has ${A+inc} parts and blue ${Bb+inc}; the difference is still ${L} parts, so ${inc} parts are ${p.added} counters.`);
}
function model(q){
 if(q?.structure==='pb3:ratios:equal-additions'&&q.params)return equalAdditions(q.params);
 if(!q||!q.params||q.paperStandard)return ''; // Old numeric bar examples must not be attached to new structures.
 const p=q.params;
 if(q.unit==='relationships'&&q.form===1&&p.total!=null&&p.difference!=null){
  const w=3*U,ex=Math.max(36,Math.min(80,w*p.difference/Math.max(1,(p.total-p.difference)/2)));
  const big=`<rect x="${X}" y="30" width="${w}" height="${H}" rx="3" class="bm-unit"/><text x="${X+w/2}" y="52" text-anchor="middle" class="bm-small">?</text><rect x="${X+w}" y="30" width="${ex}" height="${H}" rx="3" class="bm-extra"/><text x="${X+w+ex/2}" y="52" text-anchor="middle" class="bm-small">${esc(p.difference)}</text><text x="${X-12}" y="52" text-anchor="end" class="bm-label">First</text>`;
  const small=`<rect x="${X}" y="76" width="${w}" height="${H}" rx="3" class="bm-unit"/><text x="${X+w/2}" y="98" text-anchor="middle" class="bm-small">?</text><text x="${X-12}" y="98" text-anchor="end" class="bm-label">Second</text>`;
  return svg(150,big+small+`<path d="M${X+w+ex+10} 30h8V110h-8" class="bm-brace"/><text x="${X+w+ex+26}" y="75" class="bm-small">${esc(p.total)} altogether</text>`+`<text x="${X}" y="138" class="bm-note">Remove the extra ${esc(p.difference)}: two equal bars are left.</text>`,'Bar model: the first bar is the second bar plus the difference; together they make the total.');
 }
 if(q.unit==='ratios'&&q.form===0&&p.a&&p.b){
  const white=p.white!=null?`${p.white}`:'';
  const u=Math.min(U,360/Math.max(p.a,p.b));
  return svg(160,bar(26,'Blue',p.a,null,u)+bar(76,'White',p.b,null,u)+brace(X,X+p.b*u,118,white?`${white} white beads = ${p.b} units`:`${p.b} units`,true),`Bar model: blue has ${p.a} equal units and white has ${p.b} equal units.`);
 }
 if(q.unit==='ratios'&&q.form===2){
  return svg(150,bar(26,'Box A',5)+bar(76,'Box B',3)+brace(X+3*U,X+5*U,20,'difference: 2 units')+`<text x="${X}" y="138" class="bm-note">Moving 1 unit from A to B makes both 4 units.</text>`,'Bar model: box A has 5 units and box B has 3 units; the difference is 2 units.');
 }
 return '';
}
function lessonModel(unit){
 if(unit==='relationships')return model({unit:'relationships',form:1,params:{total:34,difference:8}});
 return '';
}
const api={model,lessonModel};
root.MochiBarModels=api;
if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
