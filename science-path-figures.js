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
  body+=txt(300,295,'Connections shown; predict the outcome.',16);desc=`${f.parallel?'Two parallel bulb branches':'Two bulbs in one series loop'} with ${f.open==='common'?'an open common connection':'an open switch on branch '+f.open}. Bulbs are drawn without showing whether they light.`;
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
 return wrap(body,key,marker,600,340,caption,desc);
}
function wrap(body,key,marker,w,h,caption,desc){return `<figure class="sp-figure"><svg viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="${key}-title ${key}-desc" xmlns="http://www.w3.org/2000/svg"><title id="${key}-title">${esc(caption)}</title><desc id="${key}-desc">${esc(desc)}</desc><defs><marker id="${marker}" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="userSpaceOnUse"><path d="M0 0L8 4L0 8Z" fill="#202026"/></marker></defs><g font-family="Arial, sans-serif">${body}</g></svg><figcaption>${esc(caption)}</figcaption></figure>`;}
root.MochiSciencePathFigures={diagram};if(typeof module!=='undefined')module.exports=root.MochiSciencePathFigures;
})(typeof globalThis!=='undefined'?globalThis:this);
