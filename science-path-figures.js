/* Original monochrome scientific diagrams. Models are labelled; no outcome is animated in checks. */
(function(root){
'use strict';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const txt=(x,y,s,size=17,anchor='middle')=>`<text x="${x}" y="${y}" font-size="${size}" text-anchor="${anchor}" fill="#202026" stroke="none">${esc(s)}</text>`;
const path=(d,more='')=>`<path d="${d}" fill="none" stroke="#202026" stroke-width="2" ${more}/>`;
const circle=(x,y,r,more='')=>`<circle cx="${x}" cy="${y}" r="${r}" stroke="#202026" stroke-width="2" fill="white" ${more}/>`;
function diagram(f,id='science',support=false){
 if(!f)return '';const key=String(id).replace(/[^a-zA-Z0-9_-]/g,'').slice(0,100),marker='sp-arrow-'+key;
 if(f.type==='table')return `<figure class="sp-figure sp-table-figure"><figcaption>${esc(f.caption||'Synthetic classroom data')}</figcaption><div class="sp-data-table"><table><thead><tr>${f.heads.map(h=>'<th scope="col">'+esc(h)+'</th>').join('')}</tr></thead><tbody>${f.rows.map(row=>'<tr>'+row.map(c=>'<td>'+esc(c)+'</td>').join('')+'</tr>').join('')}</tbody></table></div></figure>`;
 let body='',caption='Simplified diagram; not drawn to scale.',desc='';const arrow=(d)=>path(d,`marker-end="url(#${marker})"`);
 if(f.type==='line'){
  const {x,y}=f,w=450,h=200,x0=90,y0=270,xmin=Math.min(...x),xmax=Math.max(...x),ymin=Math.min(0,...y),rawMax=Math.max(...y,1),step=Math.max(1,Math.ceil((rawMax-ymin)/5)),ymax=ymin+5*step;
  const X=n=>x0+(n-xmin)/(xmax-xmin||1)*w,Y=n=>y0-(n-ymin)/(ymax-ymin)*h;
  for(let i=0;i<=5;i++){const value=ymin+i*step,yy=Y(value);body+=path(`M${x0} ${yy}H${x0+w}`,'stroke-dasharray="3 5" opacity=".25"')+txt(x0-12,yy+5,value,16,'end');}
  body+=path(`M${x0} 55V${y0}H${x0+w+12}`);
  x.forEach(n=>{body+=path(`M${X(n)} ${y0}v6`)+txt(X(n),y0+26,n,16);});
  body+=path(y.map((v,i)=>(i?'L':'M')+X(x[i])+' '+Y(v)).join(' '));
  y.forEach((v,i)=>body+=circle(X(x[i]),Y(v),4));
  body+=txt(x0+w/2,335,f.xlabel,18)+`<text x="23" y="165" text-anchor="middle" transform="rotate(-90 23 165)" font-size="17" fill="#202026" stroke="none">${esc(f.ylabel)}</text>`;
  caption=f.caption||'Synthetic classroom data; points are the measurements.';
  desc=f.xlabel+' and '+f.ylabel+'. '+x.map((v,i)=>v+': '+y[i]).join('; ');
  return wrap(body,key,marker,600,355,caption,desc)+`<details class="sp-data-equivalent"><summary>Read the graph values</summary><p>${esc(desc)}</p></details>`;
 }
 if(f.type==='circuit'){
  const left=80,right=520;body+=path(`M${left} 55H280 M300 55H${right}V78 M${left} 55V235 H${right}V112`);
  body+=path('M280 32V78 M300 41V69')+txt(283,22,'Battery',16);
  const gap=(x,y,horizontal)=>horizontal?circle(x-20,y,3)+circle(x+20,y,3)+path(`M${x-18} ${y}l32 -23`):circle(x,y-17,3)+circle(x,y+17,3)+path(`M${x} ${y-15}l22 25`);
  body+=f.open==='common'?gap(right,95,false):path(`M${right} 78V112`);
  const bulb=(x,y,label)=>circle(x,y,19)+path(`M${x-12} ${y-12}l24 24 M${x-12} ${y+12}l24 -24`)+txt(x,y-30,label,18);
  if(f.parallel){
   // Bottom return is a branch wire, not a zero-resistance bypass around bulbs.
   body=body.replace(`M${left} 55V235 H${right}V112`,`M${left} 55V235 M${right} 235V112`);
   for(const [name,y]of [['A',140],['B',235]]){
    body+=path(`M${left} ${y}H231 M269 ${y}H365 M405 ${y}H${right}`)+bulb(250,y,'Bulb '+name);
    body+=f.open===name?gap(385,y,true):path(`M365 ${y}H405`);
    body+=circle(left,y,3,'fill="#202026"')+circle(right,y,3,'fill="#202026"');
   }
  }else{
   body=body.replace(`M${left} 55V235 H${right}V112`,`M${left} 55V235H211 M249 235H351 M389 235H${right}V112`);
   body+=bulb(230,235,'A')+bulb(370,235,'B');
  }
  body+=txt(300,295,'Connections shown; predict the outcome.',16);desc=`${f.parallel?'Two parallel bulb branches':'Two bulbs in one series loop'} with ${f.open==='common'?'an open common connection':f.open==='none'?'all shown connections closed':'an open switch on branch '+f.open}. Bulbs are drawn without showing whether they light.`;
 }
 if(f.type==='flow'||f.type==='foodweb'){
  const labels=f.labels,cols=labels.length,cell=520/cols;for(let i=0;i<cols;i++){
   const x=40+i*cell,w=cell-22;body+=`<rect x="${x}" y="112" width="${w}" height="72" rx="2" fill="white" stroke="#202026" stroke-width="2"/>`;
   const words=labels[i].split(' '),lines=[];let line='';for(const word of words){if((line+' '+word).trim().length>15&&line){lines.push(line);line=word;}else line+=(line?' ':'')+word;}if(line)lines.push(line);
   lines.forEach((s,k)=>body+=txt(x+w/2,137+k*20,s,16));if(i<cols-1)body+=arrow(`M${x+w+3} 148h17`);
  }
  caption=f.type==='foodweb'?'Arrows: food source → consumer. Only stated links are shown.':'Simplified system diagram; only selected processes are shown.';desc=labels.join(' → ');
 }
 if(f.type==='shadow'){
  const source=[65,150],cardX=f.near?205:290,screenX=510,half=30,scale=(screenX-source[0])/(cardX-source[0]);
  body+=circle(...source,8)+txt(65,195,'Source',17)+path(`M${cardX} 120V180`,'stroke-width="7"')+txt(cardX,215,'Card',17)+path(`M${screenX} 35V285`)+txt(screenX,315,'Screen',17);
  const upper=source[1]-half*scale,lower=source[1]+half*scale;
  body+=path(`M${source[0]} ${source[1]}L${screenX} ${upper} M${source[0]} ${source[1]}L${screenX} ${lower}`,'stroke-dasharray="5 5"');
  body+=path(`M${screenX} ${upper}V${lower}`,'stroke-width="8"');caption='Point-source ray model; compare positions, not measured drawing lengths.';desc='Small source, opaque card and screen in that order. Straight boundary rays extend from the source past the card to the screen.';
 }
 if(f.type==='mirror'){
  const a=f.angle*Math.PI/180,cx=300,cy=230,dx=145*Math.sin(a),dy=145*Math.cos(a);
  body+=path('M80 230H530','stroke-width="4"')+txt(480,265,'Mirror',17)+path('M300 230V45','stroke-dasharray="6 5"')+txt(300,30,'Normal',16);
  body+=arrow(`M${cx-dx} ${cy-dy}L${cx} ${cy}`)+arrow(`M${cx} ${cy}L${cx+dx} ${cy-dy}`);
  body+=txt(cx-dx-20,cy-dy-10,'Incident',16)+txt(cx+dx+20,cy-dy-10,'Reflected',16)+txt(190,210,(90-f.angle)+'° to surface',16)+txt(330,110,'?',19);
  desc=`Plane mirror and perpendicular normal. The incoming angle to the surface is ${90-f.angle} degrees. The reflected angle from the normal is unknown.`;
 }
 if(f.type==='forces'){
  body+=`<rect x="230" y="120" width="140" height="75" fill="#eee" stroke="#202026" stroke-width="2"/>`+circle(255,205,12)+circle(345,205,12)+path('M65 220H550');
  body+=arrow(`M370 155h${Math.min(150,f.right*12)}`)+txt(450,130,f.right+' N',18)+arrow(`M230 155h-${Math.min(150,f.left*12)}`)+txt(150,130,f.left+' N',18);
  desc=`Cart with horizontal force ${f.right} newtons rightward and ${f.left} newtons leftward. Vertical forces are not shown.`;caption='Horizontal forces only; starting motion is specified in the question.';
 }
 if(f.type==='particles'){
  const w=f.compressed?145:330,x=300-w/2;body+=`<rect x="${x}" y="55" width="${w}" height="210" fill="white" stroke="#202026" stroke-width="2"/>`;
  for(let i=0;i<24;i++){const xx=x+15+(i%6)*(w-30)/5+(i%2?3:-3),yy=85+Math.floor(i/6)*47+(i%3)*3;body+=circle(xx,yy,5,'fill="#777"');}
  caption='Particle model. Dot sizes and spacing are illustrative, not to scale.';desc='A bounded gas-particle model with 24 dots in a '+(f.compressed?'compressed':'larger')+' space.';
 }
 if(f.type==='filter'){
  body+=path('M170 60H400L310 165V200H270V165Z')+path('M185 69L290 154L385 69','stroke-dasharray="4 4"');
  for(let i=0;i<8;i++)body+=circle(230+i*16,90+(i%3)*9,3,'fill="#666"');
  body+=path('M235 205V280H350V205')+path('M239 257H346')+txt(455,90,'Filter paper',17)+path('M405 85H440')+txt(438,255,'Collected liquid',17)+path('M352 255H372');
  desc='Funnel lined with filter paper over a collecting beaker. No claim about dissolved substances is shown.';
 }
 if(f.type==='plant'){
  body+=path('M220 225L230 290H365L375 225Z')+path('M298 230V85','stroke-width="4"');
  for(const [x,y,side]of [[298,115,-1],[298,145,1],[298,190,-1]])body+=`<ellipse cx="${x+side*35}" cy="${y}" rx="43" ry="17" transform="rotate(${side*25} ${x+side*35} ${y})" fill="#ddd" stroke="#202026" stroke-width="2"/>`;
  body+=path('M298 230L276 272 M298 230L319 269 M298 230V280')+txt(425,150,'Leaves',18)+path('M341 148H383')+txt(430,253,'Soil / roots',18)+path('M339 253H372');
  desc='Simplified plant with leaves, stem and roots in soil. Additional experimental conditions are given in the question.';
 }
 if(f.type==='earth'){
  const solar=f.kind==='solar',eclipse=solar||f.kind==='lunar',offset=f.aligned===false?75:0;body+=circle(65,160,33,'fill="#eee"')+txt(65,215,'Sun',18)+arrow('M105 105H480');
  if(eclipse){const middle=solar?'Moon':'Earth',far=solar?'Earth':'Moon';body+=circle(285,160,solar?19:32)+txt(285,225,middle,18)+circle(490,160+offset,solar?32:19)+txt(490,offset?290:225,far,18);body+=path(`M98 127L285 128L530 128 M98 193L285 192L530 192`,'stroke-dasharray="5 5" opacity=".6"');}
  else{body+=circle(295,170,43,'fill="#ddd"')+path('M280 105l30 130')+txt(295,250,'Earth',18)+circle(465,110,17)+txt(465,155,'Moon',18);}
  caption='Position model, not to scale. Use the alignment conditions in the question.';desc=eclipse?`Sun, then ${solar?'Moon, then Earth':'Earth, then Moon'}. ${offset?'The far object is offset from the shadow route.':'The model shows alignment.'}`:'Sun, Earth with a tilted rotation axis, and Moon. Distances and sizes are not to scale.';
 }
 if(f.type==='bar'){
  // Accessible bar chart; an optional non-zero baseline is drawn with an axis-break mark.
  const labels=f.labels,values=f.values,base=Number.isFinite(f.baseline)?f.baseline:0,x0=95,y0=270,w=440,h=200,top=Math.max(...values),span=Math.max(1,top-base),step=Math.max(1,Math.ceil(span/5)),ymax=base+Math.ceil(span/step)*step,Y=n=>y0-(n-base)/(ymax-base)*h,slot=w/labels.length,bw=Math.min(90,slot*0.55);
  for(let v=base;v<=ymax;v+=step){const yy=Y(v);body+=path(`M${x0} ${yy}H${x0+w}`,'stroke-dasharray="3 5" opacity=".25"')+txt(x0-12,yy+5,v,16,'end');}
  body+=path(`M${x0} 55V${y0}H${x0+w+10}`);
  if(base!==0)body+=path(`M${x0-9} ${y0-14}l18 -6 M${x0-9} ${y0-6}l18 -6`)+txt(x0,y0+48,'Axis starts at '+base,14,'start');
  labels.forEach((l,i)=>{const cx=x0+slot*(i+.5),yy=Y(values[i]);body+=`<rect x="${cx-bw/2}" y="${yy}" width="${bw}" height="${y0-yy}" fill="#d9d2e2" stroke="#202026" stroke-width="2"/>`+txt(cx,y0+24,l,16);});
  body+=txt(x0+w/2,base!==0?338:325,f.xlabel,17)+`<text x="25" y="165" text-anchor="middle" transform="rotate(-90 25 165)" font-size="17" fill="#202026" stroke="none">${esc(f.ylabel)}</text>`;
  caption=f.caption||'Synthetic classroom data.';desc=`Bar chart of ${f.ylabel} for each ${f.xlabel}. The vertical axis starts at ${base}. Values: `+labels.map((l,i)=>l+' '+values[i]).join('; ');
  return wrap(body,key,marker,600,350,caption,desc)+`<details class="sp-data-equivalent"><summary>Read the chart values</summary><p>${esc(desc)}</p></details>`;
 }
 if(f.type==='cell'){
  // Plant cell model with lettered parts. Leader lines point to a part; names are not shown.
  body+=`<rect x="120" y="60" width="300" height="220" rx="14" fill="#f4f1f7" stroke="#202026" stroke-width="5"/>`+`<rect x="130" y="70" width="280" height="200" rx="10" fill="white" stroke="#202026" stroke-width="1.5"/>`;
  body+=`<rect x="215" y="105" width="150" height="130" rx="40" fill="#eef4f8" stroke="#202026" stroke-width="1.5" stroke-dasharray="5 3"/>`+circle(170,120,22,'fill="#cfc8d6"')+circle(170,120,6,'fill="#202026"');
  for(const [x,y] of [[160,200],[185,245],[385,95],[390,190],[380,248],[150,165]])body+=`<ellipse cx="${x}" cy="${y}" rx="13" ry="7" fill="#9fb59a" stroke="#202026" stroke-width="1.5"/>`;
  const at={wall:[120,180],membrane:[130,225],nucleus:[170,120],chloroplast:[385,95],vacuole:[300,170],cytoplasm:[190,150]};
  (f.marks||[]).forEach(([letter,part],i)=>{const [px,py]=at[part]||[270,170],ly=80+i*55;body+=path(`M${px} ${py}L470 ${ly}`)+circle(px,py,3,'fill="#202026"')+txt(495,ly+6,letter,20);});
  caption='Simplified plant cell model; not to scale. Labelled parts are lettered.';desc='Plant cell drawing: a thick outer layer with a thin layer just inside it, a large pale central space, a round body containing a dark dot, and small oval bodies. Lettered leader lines: '+(f.marks||[]).map(([l,p])=>`${l} points to ${({wall:'the thick outer layer',membrane:'the thin layer just inside the outer layer',nucleus:'the round body with a dark dot',chloroplast:'a small oval body',vacuole:'the large pale central space',cytoplasm:'the region between the parts'})[p]}`).join('; ')+'.';
 }
 if(f.type==='lever'){
  const mx=Math.max(...[...f.left,...f.right].map(x=>Number.isFinite(x[1])?x[1]:1),1)*1.15,cx=300,half=230,X=d=>half*d/mx,beam=150;
  body+=path(`M${cx-half-10} ${beam}H${cx+half+10}`,'stroke-width="7"')+path(`M${cx} ${beam+4}L${cx-20} ${beam+40}H${cx+20}Z`)+path(`M${cx-45} ${beam+40}H${cx+45}`,'stroke-width="3"');
  const draw=(list,side)=>list.forEach(([label,d],i)=>{const dd=Number.isFinite(d)?d:mx*0.6,x=cx+side*X(dd),drop=48+i*58;body+=path(`M${x} ${beam}V${beam+drop}`)+`<rect x="${x-34}" y="${beam+drop}" width="68" height="32" fill="#eee" stroke="#202026" stroke-width="2"/>`+txt(x,beam+drop+22,label,15);const ly=beam-30-i*30;body+=path(`M${cx} ${ly-6}v12 M${x} ${ly-6}v12`)+path(`M${cx} ${ly}H${x}`,`marker-end="url(#${marker})"`)+txt((cx+x)/2,ly-8,(Number.isFinite(d)?d:'?')+' '+f.unit,15);});
  draw(f.left,-1);draw(f.right,1);
  caption='Beam pivoted at its centre; distances measured from the pivot. Not to scale.';desc='Lever: '+f.left.map(x=>x[0]+' at '+x[1]+' '+f.unit+' left').join(', ')+'; '+f.right.map(x=>x[0]+' at '+x[1]+' '+f.unit+' right').join(', ')+' of the pivot.';
 }
 if(f.type==='pulley'){
  body+=path('M120 45H480','stroke-width="6"');
  if(f.kind==='fixed'){body+=path('M300 45V90')+circle(300,110,22)+path('M278 110V250 M322 110V200')+`<rect x="248" y="250" width="60" height="44" fill="#eee" stroke="#202026" stroke-width="2"/>`+txt(278,278,f.load,15)+arrow('M322 200V245')+txt(360,240,'Effort',16);desc='A single fixed pulley hangs from a beam. The rope passes over it; the load hangs on one side and the effort pulls down on the other.';}
  else{body+=path('M240 45V200 M340 200V95')+circle(290,200,50,'fill="white"')+path('M290 250V262')+`<rect x="260" y="262" width="60" height="40" fill="#eee" stroke="#202026" stroke-width="2"/>`+txt(290,288,f.load,15)+arrow('M340 95V60')+txt(390,70,'Effort',16);desc='A single movable pulley carries the load. Two sections of rope hold it up: one tied to the beam and one pulled upwards as the effort.';}
  caption='Ideal pulley model: no friction, weightless pulley and rope.';
 }
 if(f.type==='tank'){
  body+=path('M210 40V290H390V40')+`<rect x="212" y="70" width="176" height="218" fill="#e6eef5" stroke="none"/>`+path('M212 70H388','stroke-dasharray="6 4"');
  for(const [letter,i] of f.holes){const y=110+i*75;body+=circle(390,y,4,'fill="#202026"')+txt(420,y+6,letter,20);}
  caption='Tall can of water with three small holes. Jets are not drawn.';desc='A tall can filled with water. Holes: '+f.holes.map(([l,i])=>l+' '+['near the top','halfway down','near the bottom'][i]).join('; ')+'.';
 }
 if(f.type==='fruit'){
  const k=f.kind;
  if(k==='wing'){body+=`<ellipse cx="220" cy="170" rx="26" ry="20" fill="#cfc8d6" stroke="#202026" stroke-width="2"/>`+path('M240 160C320 110 420 120 450 150C420 175 330 190 242 182Z','fill="#f2f2f2"');}
  if(k==='hairs'){body+=`<ellipse cx="300" cy="245" rx="10" ry="22" fill="#cfc8d6" stroke="#202026" stroke-width="2"/>`+path('M300 223V150');for(let a=-70;a<=70;a+=14){const r=a*Math.PI/180;body+=path(`M300 150L${Math.round(300+95*Math.sin(r))} ${Math.round(150-95*Math.cos(r))}`,'stroke-width="1.2"');}}
  if(k==='hooks'){body+=circle(300,170,55,'fill="#cfc8d6"');for(let a=0;a<360;a+=30){const r=a*Math.PI/180,x=300+55*Math.cos(r),y=170+55*Math.sin(r),x2=300+75*Math.cos(r),y2=170+75*Math.sin(r);body+=path(`M${x.toFixed(1)} ${y.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}`)+path(`M${x2.toFixed(1)} ${y2.toFixed(1)}a5 5 0 1 1 7 4`);}}
  if(k==='fibrous'){body+=`<ellipse cx="300" cy="170" rx="110" ry="85" fill="#eee" stroke="#202026" stroke-width="3"/>`+`<ellipse cx="300" cy="170" rx="55" ry="45" fill="white" stroke="#202026" stroke-width="2"/>`;for(let i=0;i<10;i++)body+=path(`M${200+i*20} ${110+(i%3)*8}l8 18`,'stroke-width="1"');}
  if(k==='juicy'){body+=circle(300,175,80,'fill="#e8d7dd"');for(const [x,y] of [[280,160],[320,165],[300,195],[270,195],[330,195]])body+=`<ellipse cx="${x}" cy="${y}" rx="6" ry="4" fill="#202026"/>`;body+=path('M300 95C305 75 320 65 330 60');}
  if(k==='pod'){body+=path('M140 180C220 120 380 120 460 180C380 215 220 215 140 180Z','fill="#eee"');for(const x of [210,260,310,360,410])body+=circle(x,175,12,'fill="#cfc8d6"');}
  const words={wing:'Seed with a thin wing',hairs:'Seed with a tuft of fine hairs',hooks:'Fruit covered in tiny hooks',fibrous:'Fruit with a thick fibrous husk',juicy:'Soft, juicy fruit with small seeds',pod:'Long pod containing seeds'}[k];
  body+=txt(300,320,words,17);caption='Simplified drawing of a fruit or seed; not to scale.';desc=words+'.';
 }
 if(f.type==='cycle'){
  const n=f.labels.length,R=105,cx=300,cy=170;f.labels.forEach((l,i)=>{const a=-Math.PI/2+i*2*Math.PI/n,x=cx+R*1.35*Math.cos(a),y=cy+R*Math.sin(a);body+=`<rect x="${(x-55).toFixed(1)}" y="${(y-20).toFixed(1)}" width="110" height="40" rx="8" fill="white" stroke="#202026" stroke-width="2"/>`+txt(+x.toFixed(1),+(y+6).toFixed(1),l,16);
   const b=a+2*Math.PI/n,m1=a+0.42*2*Math.PI/n/1.4,m2=b-0.42*2*Math.PI/n/1.4;body+=path(`M${(cx+R*1.35*Math.cos(a+0.55)).toFixed(1)} ${(cy+R*Math.sin(a+0.55)).toFixed(1)}A${(R*1.35).toFixed(1)} ${R} 0 0 1 ${(cx+R*1.35*Math.cos(b-0.55)).toFixed(1)} ${(cy+R*Math.sin(b-0.55)).toFixed(1)}`,`marker-end="url(#${marker})"`);});
  caption='Life-cycle diagram; arrows show the order of stages.';desc='Cycle: '+f.labels.join(' → ')+' → back to '+f.labels[0]+'.';
 }
 return wrap(body,key,marker,600,340,caption,desc);
}
function wrap(body,key,marker,w,h,caption,desc){return `<figure class="sp-figure"><svg viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="${key}-title ${key}-desc" xmlns="http://www.w3.org/2000/svg"><title id="${key}-title">${esc(caption)}</title><desc id="${key}-desc">${esc(desc)}</desc><defs><marker id="${marker}" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="userSpaceOnUse"><path d="M0 0L8 4L0 8Z" fill="#202026"/></marker></defs><g font-family="Arial, sans-serif">${body}</g></svg><figcaption>${esc(caption)}</figcaption></figure>`;}
root.MochiSciencePathFigures={diagram};if(typeof module!=='undefined')module.exports=root.MochiSciencePathFigures;
})(typeof globalThis!=='undefined'?globalThis:this);
