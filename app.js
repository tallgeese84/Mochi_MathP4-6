
/* =========================================================
   MOCHI — CONVERSATIONAL P6 MATHS TUTOR (PROTOTYPE)
   Engine owns truth and runs locally. Cat owns the talking.
   ========================================================= */
const $ = id => document.getElementById(id);

/* ---------- storage: window.storage -> memory ----------
   On the GitHub Pages port, add a localStorage layer between these two. */
const MEM = {};
const KEY = 'mochi-tutor-v1';
function lsGet(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }
function lsSet(k,v){ try{ localStorage.setItem(k,v); return true; }catch(e){ return false; } }
async function save(obj){
  const str = JSON.stringify(obj);
  try { if(window.storage){ await window.storage.set(KEY, str); return; } } catch(e){}
  if(lsSet(KEY, str)) return;
  MEM[KEY] = str;
}
async function load(){
  try { if(window.storage){ const r = await window.storage.get(KEY); if(r && r.value) return JSON.parse(r.value); } } catch(e){}
  const v = lsGet(KEY);
  if(v){ try{ return JSON.parse(v); }catch(e){} }
  try { return MEM[KEY] ? JSON.parse(MEM[KEY]) : null; } catch(e){ return null; }
}

/* ---------- helpers ---------- */
const ri = (a,b)=> Math.floor(Math.random()*(b-a+1))+a;
const pick = arr => arr[Math.floor(Math.random()*arr.length)];
/* People carry their own pronouns — a P6 paper never writes "Daniel … she". */
const PEOPLE = [
  {n:'Ravi',    s:'he',  S:'He',  p:'his'},
  {n:'Daniel',  s:'he',  S:'He',  p:'his'},
  {n:'Jun Wei', s:'he',  S:'He',  p:'his'},
  {n:'Marcus',  s:'he',  S:'He',  p:'his'},
  {n:'Mei Ling',s:'she', S:'She', p:'her'},
  {n:'Siti',    s:'she', S:'She', p:'her'},
  {n:'Priya',   s:'she', S:'She', p:'her'},
  {n:'Aisha',   s:'she', S:'She', p:'her'},
  {n:'Xin Yi',  s:'she', S:'She', p:'her'},
  {n:'Farah',   s:'she', S:'She', p:'her'}
];
function twoPeople(){ const x=pick(PEOPLE); let y=pick(PEOPLE); let g=0; while(y.n===x.n && g++<25) y=pick(PEOPLE); return [x,y]; }
function money(n){ return (Math.round(n*100)/100).toFixed(2).replace(/\.00$/,''); }
/* Answers are money or measures — never hand a child 28.400000000000002. */
function r2(n){ return Math.round(n*100)/100; }
function esc(s){ return String(s).replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

/* =========================================================
   FIGURE LIBRARY — small SVG helpers
   ========================================================= */
const FIG = (function(){
  const INK='#2A1F1A', DIM='#B4560F', LINE='#A08C7E', SHAPE='#E86A2E', ACC='#1F8F6E';
  const f=n=>Number(n).toFixed(1);
  const unit=(p,q)=>{const dx=q.x-p.x,dy=q.y-p.y,m=Math.hypot(dx,dy)||1;return{x:dx/m,y:dy/m};};

  /* label sits on the angle bisector, clear of both arms */
  function angLabel(v,u1,u2,r,txt,col,size){
    const bx=u1.x+u2.x, by=u1.y+u2.y, m=Math.hypot(bx,by)||1;
    const x=v.x+bx/m*r, y=v.y+by/m*r;
    return `<text x="${f(x)}" y="${f(y)}" fill="${col}" font-size="${size||13}" font-weight="700"
      text-anchor="middle" dy=".35em">${txt}</text>`;
  }
  /* arc between two arms, drawn the short way round */
  function angArc(v,u1,u2,r,col){
    const p1={x:v.x+u1.x*r,y:v.y+u1.y*r}, p2={x:v.x+u2.x*r,y:v.y+u2.y*r};
    const sweep=(u1.x*u2.y-u1.y*u2.x)>0?1:0;
    return `<path d="M ${f(p1.x)} ${f(p1.y)} A ${r} ${r} 0 0 ${sweep} ${f(p2.x)} ${f(p2.y)}"
      fill="none" stroke="${col}" stroke-width="1.8"/>`;
  }
  /* dimension line with end ticks, so a measurement never sits on the shape */
  function dimH(x1,x2,y,txt,below){
    const t=6, ty=below?y+15:y-8;
    return `<g stroke="${LINE}" stroke-width="1.4">
      <line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}"/>
      <line x1="${x1}" y1="${y-t/2}" x2="${x1}" y2="${y+t/2}"/>
      <line x1="${x2}" y1="${y-t/2}" x2="${x2}" y2="${y+t/2}"/></g>
      <text x="${f((x1+x2)/2)}" y="${ty}" fill="${DIM}" font-size="12.5" font-weight="700"
        text-anchor="middle" dy=".35em">${txt}</text>`;
  }
  function dimV(y1,y2,x,txt,right){
    const t=6, tx=right?x+9:x-9, anc=right?'start':'end';
    return `<g stroke="${LINE}" stroke-width="1.4">
      <line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}"/>
      <line x1="${x-t/2}" y1="${y1}" x2="${x+t/2}" y2="${y1}"/>
      <line x1="${x-t/2}" y1="${y2}" x2="${x+t/2}" y2="${y2}"/></g>
      <text x="${tx}" y="${f((y1+y2)/2)}" fill="${DIM}" font-size="12.5" font-weight="700"
        text-anchor="${anc}" dy=".35em">${txt}</text>`;
  }

  return {
    semicircle(d){
      const cx=110, cy=96, r=72;
      return `<svg viewBox="0 0 220 140" width="290" role="img" aria-label="Semicircle of diameter ${d} centimetres">
        <path d="M ${cx-r} ${cy} A ${r} ${r} 0 0 1 ${cx+r} ${cy} Z"
          fill="rgba(232,106,46,.10)" stroke="${SHAPE}" stroke-width="2.5" stroke-linejoin="round"/>
        <circle cx="${cx}" cy="${cy}" r="2.6" fill="${INK}"/>
        ${dimH(cx-r, cx+r, cy+20, d+' cm', true)}
      </svg>`;
    },

    quadrant(r){
      const ox=66, oy=140, R=112;
      return `<svg viewBox="0 0 240 190" width="250" role="img" aria-label="Quadrant of radius ${r} centimetres">
        <path d="M ${ox} ${oy} L ${ox+R} ${oy} A ${R} ${R} 0 0 0 ${ox} ${oy-R} Z"
          fill="rgba(31,143,110,.10)" stroke="${ACC}" stroke-width="2.5" stroke-linejoin="round"/>
        <path d="M ${ox+13} ${oy} L ${ox+13} ${oy-13} L ${ox} ${oy-13}"
          fill="none" stroke="${LINE}" stroke-width="1.6"/>
        ${dimH(ox, ox+R, oy+18, r+' cm', true)}
        ${dimV(oy-R, oy, ox-16, r+' cm', false)}
      </svg>`;
    },

    tank(L,W,H,h,unknown=false){
      const x0=76,x1=196,yT=42,yB=112,dx=30,dy=17;   // front face + isometric offset
      const fill=Math.max(5, Math.min(yB-yT-4, (unknown?0.45:h/H)*(yB-yT)));
      const wy=yB-fill;
      return `<svg viewBox="0 0 300 168" width="310" role="img" aria-label="Rectangular tank ${L} by ${W} by ${H} centimetres">
        <polygon points="${x0},${yT} ${x1},${yT} ${x1+dx},${yT-dy} ${x0+dx},${yT-dy}"
          fill="rgba(42,31,26,.05)" stroke="${LINE}" stroke-width="2" stroke-linejoin="round"/>
        <polygon points="${x1},${yT} ${x1+dx},${yT-dy} ${x1+dx},${yB-dy} ${x1},${yB}"
          fill="rgba(42,31,26,.03)" stroke="${LINE}" stroke-width="2" stroke-linejoin="round"/>
        <rect x="${x0+1}" y="${wy}" width="${x1-x0-2}" height="${f(fill)}" fill="rgba(60,125,158,.28)"/>
        <polygon points="${x1},${wy} ${x1+dx},${wy-dy} ${x1+dx},${yB-dy} ${x1},${yB}" fill="rgba(60,125,158,.18)"/>
        <line x1="${x0+1}" y1="${f(wy)}" x2="${x1-1}" y2="${f(wy)}" stroke="#3C7D9E" stroke-width="2.2"/>
        <rect x="${x0}" y="${yT}" width="${x1-x0}" height="${yB-yT}" fill="none" stroke="${LINE}" stroke-width="2"/>
        ${dimV(wy, yB, x0-16, (unknown?'?':h)+' cm', false)}
        ${dimV(yT-dy, yB-dy, x1+dx+16, H+' cm', true)}
        ${dimH(x0, x1, yB+18, L+' cm', true)}
        <text x="${x1+dx-4}" y="${yB+14}" fill="${DIM}" font-size="12.5" font-weight="700"
          text-anchor="middle" dy=".35em">${W} cm</text>
      </svg>`;
    },

    /* ---- data handling: absent from the bank, present in every paper ---- */
    pie(parts, title){
      const cx=98, cy=100, r=76, PAL=[SHAPE,ACC,'#3C7D9E','#D4607A','#D99000'];
      let a0=-90, out='';
      parts.forEach((p,i)=>{
        const a1 = a0 + p.pct*3.6;
        const rad = d=>d*Math.PI/180;
        const x0=cx+r*Math.cos(rad(a0)), y0=cy+r*Math.sin(rad(a0));
        const x1=cx+r*Math.cos(rad(a1)), y1=cy+r*Math.sin(rad(a1));
        const big = p.pct>50?1:0;
        out += `<path d="M ${cx} ${cy} L ${f(x0)} ${f(y0)} A ${r} ${r} 0 ${big} 1 ${f(x1)} ${f(y1)} Z"
          fill="${PAL[i%5]}" fill-opacity=".55" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>`;
        a0 = a1;
      });
      const leg = parts.map((p,i)=>
        `<rect x="196" y="${f(40+i*24)}" width="15" height="15" rx="3" fill="${PAL[i%5]}" fill-opacity=".55" stroke="${INK}" stroke-width="1.5"/>`+
        `<text x="218" y="${f(48+i*24)}" fill="${INK}" font-size="12.5" font-weight="700" dy=".35em">${p.label} ${p.show}</text>`).join('');
      return `<svg viewBox="0 0 330 200" width="320" role="img" aria-label="Pie chart">`+
        (title?`<text x="98" y="14" fill="${DIM}" font-size="12" font-weight="700" text-anchor="middle" dy=".35em">${title}</text>`:'')+
        out+leg+`</svg>`;
    },

    bars(cats, vals, ymax, ylab){
      const x0=46, y0=150, w=248, h=126, bw=(w-x0)/cats.length, step=ymax/5;
      let grid='', bar='', lab='';
      for(let i=0;i<=5;i++){
        const y = y0-(i/5)*h;
        grid += `<line x1="${x0}" y1="${f(y)}" x2="${w}" y2="${f(y)}" stroke="${LINE}" stroke-width="1"/>`+
                `<text x="${x0-6}" y="${f(y)}" fill="${DIM}" font-size="11" font-weight="700" text-anchor="end" dy=".35em">${String(f(i*step)).replace(/\.0$/,'')}</text>`;
      }
      cats.forEach((c2,i)=>{
        const bh=(vals[i]/ymax)*h, bx=x0+i*bw+bw*0.22;
        bar += `<rect x="${f(bx)}" y="${f(y0-bh)}" width="${f(bw*0.56)}" height="${f(bh)}" fill="${SHAPE}" fill-opacity=".55" stroke="${INK}" stroke-width="1.8"/>`;
        lab += `<text x="${f(bx+bw*0.28)}" y="${y0+14}" fill="${INK}" font-size="11.5" font-weight="700" text-anchor="middle" dy=".35em">${c2}</text>`;
      });
      return `<svg viewBox="0 0 310 180" width="310" role="img" aria-label="Bar graph">`+grid+bar+lab+
        `<line x1="${x0}" y1="${y0}" x2="${w}" y2="${y0}" stroke="${INK}" stroke-width="2"/>`+
        `<line x1="${x0}" y1="24" x2="${x0}" y2="${y0}" stroke="${INK}" stroke-width="2"/>`+
        `<text x="${x0-6}" y="16" fill="${DIM}" font-size="11" font-weight="700" text-anchor="end">${ylab||''}</text></svg>`;
    },

    lineGraph(cats, vals, ymax, ylab){
      const x0=46, y0=150, w=280, h=126, step=ymax/5, dx=(w-x0)/(cats.length-1);
      let grid='', lab='';
      for(let i=0;i<=5;i++){
        const y=y0-(i/5)*h;
        grid += `<line x1="${x0}" y1="${f(y)}" x2="${w}" y2="${f(y)}" stroke="${LINE}" stroke-width="1"/>`+
                `<text x="${x0-6}" y="${f(y)}" fill="${DIM}" font-size="11" font-weight="700" text-anchor="end" dy=".35em">${String(f(i*step)).replace(/\.0$/,'')}</text>`;
      }
      const pts = vals.map((v,i)=>[x0+i*dx, y0-(v/ymax)*h]);
      cats.forEach((c2,i)=>{
        lab += `<text x="${f(pts[i][0])}" y="${y0+14}" fill="${INK}" font-size="11.5" font-weight="700" text-anchor="middle" dy=".35em">${c2}</text>`;
      });
      const dots = pts.map(p=>`<circle cx="${f(p[0])}" cy="${f(p[1])}" r="3.4" fill="${INK}"/>`).join('');
      return `<svg viewBox="0 0 300 180" width="300" role="img" aria-label="Line graph">`+grid+
        `<polyline points="${pts.map(p=>f(p[0])+','+f(p[1])).join(' ')}" fill="none" stroke="${SHAPE}" stroke-width="2.6" stroke-linejoin="round"/>`+
        dots+lab+
        `<line x1="${x0}" y1="${y0}" x2="${w}" y2="${y0}" stroke="${INK}" stroke-width="2"/>`+
        `<line x1="${x0}" y1="24" x2="${x0}" y2="${y0}" stroke="${INK}" stroke-width="2"/>`+
        `<text x="${x0-6}" y="16" fill="${DIM}" font-size="11" font-weight="700" text-anchor="end">${ylab||''}</text></svg>`;
    },

    isosceles(apex){
      const A={x:150,y:34}, B={x:86,y:134}, C={x:214,y:134};
      const uAB=unit(A,B), uAC=unit(A,C), uBA=unit(B,A), uBC=unit(B,C);
      return `<svg viewBox="0 0 300 168" width="290" role="img" aria-label="Isosceles triangle A B C">`+
        `<polygon points="${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}" fill="rgba(232,106,46,.10)" stroke="${SHAPE}" stroke-width="2.5" stroke-linejoin="round"/>`+
        `<path d="M112 88 l10 5 M110 92 l10 5" stroke="${INK}" stroke-width="2" fill="none"/>`+
        `<path d="M188 88 l-10 5 M190 92 l-10 5" stroke="${INK}" stroke-width="2" fill="none"/>`+
        angArc(A,uAB,uAC,22,DIM)+angLabel(A,uAB,uAC,36,apex+'\u00B0',DIM)+
        angArc(B,uBC,uBA,20,ACC)+angLabel(B,uBC,uBA,33,'x',ACC,15)+
        `<text x="${A.x}" y="${A.y-11}" fill="${LINE}" font-size="12" font-weight="700" text-anchor="middle">A</text>`+
        `<text x="${B.x-12}" y="${B.y+7}" fill="${LINE}" font-size="12" font-weight="700" text-anchor="middle">B</text>`+
        `<text x="${C.x+12}" y="${C.y+7}" fill="${LINE}" font-size="12" font-weight="700" text-anchor="middle">C</text></svg>`;
    },

    parallelCut(a){
      return `<svg viewBox="0 0 300 175" width="290" role="img" aria-label="Two parallel lines cut by a transversal">`+
        `<line x1="26" y1="56" x2="274" y2="56" stroke="${LINE}" stroke-width="2.5"/>`+
        `<line x1="26" y1="132" x2="274" y2="132" stroke="${LINE}" stroke-width="2.5"/>`+
        `<path d="M140 52 l9 4 l-9 4" fill="none" stroke="${LINE}" stroke-width="2"/>`+
        `<path d="M140 128 l9 4 l-9 4" fill="none" stroke="${LINE}" stroke-width="2"/>`+
        `<line x1="96" y1="18" x2="204" y2="170" stroke="${SHAPE}" stroke-width="2.5"/>`+
        `<path d="M 137 56 A 22 22 0 0 0 116.4 42.6" fill="none" stroke="${DIM}" stroke-width="1.8"/>`+
        `<text x="146" y="42" fill="${DIM}" font-size="13" font-weight="700" dy=".35em">${a}\u00B0</text>`+
        `<path d="M 156 132 A 22 22 0 0 1 176.6 145.4" fill="none" stroke="${ACC}" stroke-width="1.8"/>`+
        `<text x="139" y="150" fill="${ACC}" font-size="14" font-weight="800" text-anchor="end" dy=".35em">x</text>`+
        `<text x="20" y="56" fill="${LINE}" font-size="12" font-weight="700" text-anchor="end" dy=".35em">A</text>`+
        `<text x="280" y="56" fill="${LINE}" font-size="12" font-weight="700" dy=".35em">B</text>`+
        `<text x="20" y="132" fill="${LINE}" font-size="12" font-weight="700" text-anchor="end" dy=".35em">C</text>`+
        `<text x="280" y="132" fill="${LINE}" font-size="12" font-weight="700" dy=".35em">D</text></svg>`;
    },

    parallelogram(a){
      const A={x:64,y:132}, B={x:196,y:132}, C={x:236,y:54}, D={x:104,y:54};
      const uAB=unit(A,B), uAD=unit(A,D), uDA=unit(D,A), uDC=unit(D,C);
      return `<svg viewBox="0 0 290 165" width="300" role="img" aria-label="Parallelogram A B C D">
        <polygon points="${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y} ${D.x},${D.y}"
          fill="rgba(232,106,46,.10)" stroke="${SHAPE}" stroke-width="2.5" stroke-linejoin="round"/>
        ${angArc(D,uDC,uDA,20,DIM)}
        ${angArc(A,uAD,uAB,20,ACC)}
        ${angLabel(D,uDC,uDA,34,a+'\u00B0',DIM)}
        ${angLabel(A,uAD,uAB,34,'x',ACC,15)}
        <text x="${A.x-12}" y="${A.y+6}" fill="${LINE}" font-size="12" font-weight="700" text-anchor="middle">A</text>
        <text x="${B.x+12}" y="${B.y+6}" fill="${LINE}" font-size="12" font-weight="700" text-anchor="middle">B</text>
        <text x="${C.x+12}" y="${C.y-4}" fill="${LINE}" font-size="12" font-weight="700" text-anchor="middle">C</text>
        <text x="${D.x-12}" y="${D.y-4}" fill="${LINE}" font-size="12" font-weight="700" text-anchor="middle">D</text>
      </svg>`;
    },

    triangleLine(a,b){
      const P={x:76,y:120}, Q={x:196,y:120}, R={x:132,y:44};
      const uPQ=unit(P,Q), uPR=unit(P,R), uQP=unit(Q,P), uQR=unit(Q,R), uOut={x:1,y:0};
      return `<svg viewBox="0 0 290 160" width="300" role="img" aria-label="Triangle standing on the straight line P Q">
        <line x1="24" y1="${P.y}" x2="266" y2="${P.y}" stroke="${LINE}" stroke-width="2.5"/>
        <polygon points="${P.x},${P.y} ${Q.x},${Q.y} ${R.x},${R.y}"
          fill="rgba(232,106,46,.10)" stroke="${SHAPE}" stroke-width="2.5" stroke-linejoin="round"/>
        ${angArc(P,uPQ,uPR,21,DIM)}
        ${angArc(Q,uQR,uQP,21,DIM)}
        ${angArc(Q,uQR,uOut,27,ACC)}
        ${angLabel(P,uPQ,uPR,36,a+'\u00B0',DIM)}
        ${angLabel(Q,uQP,uQR,36,b+'\u00B0',DIM)}
        ${angLabel(Q,uQR,uOut,44,'x',ACC,15)}
        <circle cx="${P.x}" cy="${P.y}" r="3" fill="${INK}"/>
        <circle cx="${Q.x}" cy="${Q.y}" r="3" fill="${INK}"/>
        <text x="${P.x}" y="${P.y+17}" fill="${LINE}" font-size="12" font-weight="700" text-anchor="middle" dy=".35em">P</text>
        <text x="${Q.x}" y="${Q.y+17}" fill="${LINE}" font-size="12" font-weight="700" text-anchor="middle" dy=".35em">Q</text>
      </svg>`;
    }
  };
})();

/* =========================================================
   QUESTION GENERATORS
   Each returns: {topic, stars, text, fig, answer, prefix, suffix,
                  accept[], steps[], bar{}}
   ========================================================= */
const GEN = [

/* 1 — Fraction of the remainder */
function fracRemainder(){
  const f1 = pick([[1,3],[1,4],[2,5],[1,5],[3,8]]);
  const f2 = pick([[1,2],[1,3],[2,3],[1,4],[3,5]]);
  const base = f1[1]*f2[1];
  const total = base * ri(3,9) * (base < 12 ? 2 : 1);
  const spent1 = total * f1[0] / f1[1];
  const rem = total - spent1;
  const spent2 = rem * f2[0] / f2[1];
  const left = rem - spent2;
  const P = pick(PEOPLE);
  return {
    topic:'Fractions', stars:3, prefix:'$',
    text:`${P.n} had $${total}. ${P.S} spent ${f1[0]}/${f1[1]} of ${P.p} money on a book. ${P.S} then spent ${f2[0]}/${f2[1]} of the remainder on lunch. How much money had ${P.s} left?`,
    answer:r2(left),
    steps:[
      `Money spent on the book = ${f1[0]}/${f1[1]} × $${total} = $${money(spent1)}.`,
      `Remainder = $${total} − $${money(spent1)} = $${money(rem)}.`,
      `Money spent on lunch = ${f2[0]}/${f2[1]} × $${money(rem)} = $${money(spent2)}.`,
      `Money left = $${money(rem)} − $${money(spent2)} = $${money(left)}.`
    ],
    bar:{
      caption:`The whole bar is $${total}. The book takes ${f1[0]} of ${f1[1]} equal units. The remainder is then cut again for lunch.`,
      segments:[
        {w:f1[0]/f1[1], label:'book', fill:'var(--coral)'},
        {w:(rem-left)/total, label:'lunch', fill:'var(--gold)'},
        {w:left/total, label:'left', fill:'var(--mint)'}
      ]
    }
  };
},

/* 2 — Ratio, units and parts */
function ratioDiff(){
  const [p,q] = pick([[5,3],[7,4],[4,3],[5,2],[8,5],[7,3]]);
  const k = ri(4,14);
  const diff = (p-q)*k;
  const total = (p+q)*k;
  const [A,B] = twoPeople(); const a = A.n, b = B.n;
  return {
    topic:'Ratio', stars:3, suffix:'stickers',
    text:`The ratio of the number of stickers ${a} has to the number of stickers ${b} has is ${p} : ${q}. ${a} has ${diff} more stickers than ${b}. How many stickers do they have altogether?`,
    answer:total,
    steps:[
      `${a} : ${b} = ${p} units : ${q} units.`,
      `Difference = ${p} − ${q} = ${p-q} units, and this is ${diff} stickers.`,
      `1 unit = ${diff} ÷ ${p-q} = ${k} stickers.`,
      `Total = ${p+q} units = ${p+q} × ${k} = ${total} stickers.`
    ],
    bar:{
      caption:`${a} is ${p} units, ${b} is ${q} units. The extra ${p-q} units are worth ${diff} stickers.`,
      segments:[
        {w:p/(p+q), label:`${a} · ${p}u`, fill:'var(--sky)'},
        {w:q/(p+q), label:`${b} · ${q}u`, fill:'var(--berry)'}
      ]
    }
  };
},

/* 3 — Percentage: discount */
function percentDiscount(){
  const price = pick([80,120,150,240,300,450,60,90]);
  const d = pick([10,15,20,25,30,40]);
  const sale = price * (100-d)/100;
  const item = pick(['a jacket','a pair of shoes','a school bag','a bicycle helmet','a badminton racket']);
  return {
    topic:'Percentage', stars:2, prefix:'$',
    text:`The usual price of ${item} is $${price}. During a sale, it is sold at a discount of ${d}%. How much does it cost during the sale?`,
    answer:r2(sale),
    steps:[
      `Discount = ${d}% × $${price} = $${money(price*d/100)}.`,
      `Sale price = $${price} − $${money(price*d/100)} = $${money(sale)}.`,
      `You can also work it out as ${100-d}% × $${price} = $${money(sale)}.`
    ],
    bar:{
      caption:`The whole bar is the usual price, $${price}. The discount takes ${d}% away.`,
      segments:[
        {w:(100-d)/100, label:`pay ${100-d}%`, fill:'var(--mint)'},
        {w:d/100, label:`off ${d}%`, fill:'var(--coral)'}
      ]
    }
  };
},

/* 4 — Percentage: find the whole */
function percentWhole(){
  const pct = pick([20,25,30,40,60,75]);
  const total = pick([40,60,80,120,200,160]);
  const part = total*pct/100;
  if(!Number.isInteger(part)) return percentDiscount();
  return {
    topic:'Percentage', stars:3, suffix:'pupils',
    text:`${pct}% of the pupils in a school choir are boys. There are ${part} boys in the choir. How many pupils are there in the choir altogether?`,
    answer:total,
    steps:[
      `${pct}% of the pupils = ${part} pupils.`,
      `1% of the pupils = ${part} ÷ ${pct} = ${money(part/pct)} pupils.`,
      `100% of the pupils = ${money(part/pct)} × 100 = ${total} pupils.`
    ],
    bar:{
      caption:`The whole bar is 100% — all the pupils. The shaded part is ${pct}%, which is ${part} boys.`,
      segments:[
        {w:pct/100, label:`boys ${pct}%`, fill:'var(--sky)'},
        {w:(100-pct)/100, label:`girls ${100-pct}%`, fill:'var(--berry)'}
      ]
    }
  };
},

/* 5 — Rate and speed */
function speed(){
  const s = pick([40,45,50,60,75,80]);
  const t = pick([2,3,4,5]);
  const d = s*t;
  const mode = pick(['speed','distance','time']);
  const P = pick(PEOPLE);
  if(mode==='speed') return {
    topic:'Speed', stars:2, suffix:'km/h',
    text:`${P.n} drove a distance of ${d} km in ${t} hours. What was ${P.p} average speed?`,
    answer:s,
    steps:[`Average speed = total distance ÷ total time.`,
           `= ${d} km ÷ ${t} h.`,
           `= ${s} km/h.`]
  };
  if(mode==='distance') return {
    topic:'Speed', stars:2, suffix:'km',
    text:`${P.n} cycled at an average speed of ${s} km/h for ${t} hours. What distance did ${P.s} cover?`,
    answer:d,
    steps:[`Distance = average speed × time.`,
           `= ${s} km/h × ${t} h.`,
           `= ${d} km.`]
  };
  return {
    topic:'Speed', stars:2, suffix:'hours',
    text:`${P.n} travelled ${d} km at an average speed of ${s} km/h. How long did the journey take?`,
    answer:t,
    steps:[`Time = distance ÷ average speed.`,
           `= ${d} km ÷ ${s} km/h.`,
           `= ${t} hours.`]
  };
},

/* 6 — Algebra: substitution */
function algebra(){
  const a = ri(2,9), y = ri(3,12);
  const op = pick(['+','−']);
  // Subtraction must leave a positive result — negative numbers are Sec 1, not P6.
  const b = op==='+' ? ri(3,15) : ri(2, Math.max(2, a*y - 1));
  const val = op==='+' ? a*y + b : a*y - b;
  return {
    topic:'Algebra', stars:2,
    text:`Find the value of ${a}y ${op} ${b} when y = ${y}.`,
    answer:val,
    steps:[`Replace y with ${y}.`,
           `${a}y means ${a} × ${y} = ${a*y}.`,
           `${a*y} ${op} ${b} = ${val}.`]
  };
},

/* 7 — Circle: semicircle */
function semicircle(){
  const d = pick([14,28,42]);
  const wantArea = Math.random() < 0.5;
  const r = d/2;
  if(wantArea){
    const area = (22/7)*r*r/2;
    return {
      topic:'Circles', stars:3, suffix:'cm²', fig:FIG.semicircle(d),
      figDesc:`A semicircle. Its straight edge, the diameter, is labelled ${d} cm.`,
      text:`The figure shows a semicircle with a diameter of ${d} cm. Find its area. Take π = 22/7.`,
      answer:r2(area),
      steps:[`Radius = ${d} ÷ 2 = ${r} cm.`,
             `Area of a whole circle = π × r × r = 22/7 × ${r} × ${r} = ${money((22/7)*r*r)} cm².`,
             `A semicircle is half a circle, so area = ${money((22/7)*r*r)} ÷ 2 = ${money(area)} cm².`]
    };
  }
  const per = (22/7)*r + d;
  return {
    topic:'Circles', stars:4, suffix:'cm', fig:FIG.semicircle(d),
    figDesc:`A semicircle. Its straight edge, the diameter, is labelled ${d} cm.`,
    text:`The figure shows a semicircle with a diameter of ${d} cm. Find its perimeter. Take π = 22/7.`,
    answer:r2(per),
    steps:[`Radius = ${d} ÷ 2 = ${r} cm.`,
           `The curved part is half the circumference = 22/7 × ${d} ÷ 2 = ${money((22/7)*r)} cm.`,
           `The perimeter must also include the straight diameter, ${d} cm.`,
           `Perimeter = ${money((22/7)*r)} + ${d} = ${money(per)} cm.`]
  };
},

/* 8 — Circle: quadrant */
function quadrant(){
  const r = pick([14,28,21]);
  const wantArea = Math.random() < 0.5;
  if(wantArea){
    const area = (22/7)*r*r/4;
    return {
      topic:'Circles', stars:3, suffix:'cm²', fig:FIG.quadrant(r),
      figDesc:`A quadrant, a quarter of a circle. Both straight edges are radii labelled ${r} cm, with a right angle between them.`,
      text:`The figure shows a quadrant with a radius of ${r} cm. Find its area. Take π = 22/7.`,
      answer:r2(area),
      steps:[`Area of a whole circle = 22/7 × ${r} × ${r} = ${money((22/7)*r*r)} cm².`,
             `A quadrant is a quarter of a circle.`,
             `Area = ${money((22/7)*r*r)} ÷ 4 = ${money(area)} cm².`]
    };
  }
  const per = (22/7)*r/2 + 2*r;
  return {
    topic:'Circles', stars:4, suffix:'cm', fig:FIG.quadrant(r),
    figDesc:`A quadrant, a quarter of a circle. Both straight edges are radii labelled ${r} cm, with a right angle between them.`,
    text:`The figure shows a quadrant with a radius of ${r} cm. Find its perimeter. Take π = 22/7.`,
    answer:r2(per),
    steps:[`The curved part is a quarter of the circumference = 22/7 × 2 × ${r} ÷ 4 = ${money((22/7)*r/2)} cm.`,
           `There are also two straight sides, each of ${r} cm.`,
           `Perimeter = ${money((22/7)*r/2)} + ${r} + ${r} = ${money(per)} cm.`]
  };
},

/* 9 — Volume of water */
function volume(){
  const L = pick([20,25,30,40]);
  const W = pick([10,15,20,25]);
  const H = pick([20,30,40]);
  const h = pick([6,8,10,12]);
  if(h >= H) return volume();
  const cm3 = L*W*h;
  const litres = cm3/1000;
  return {
    topic:'Volume', stars:3, suffix:'litres', fig:FIG.tank(L,W,H,h),
    figDesc:`An open rectangular tank drawn in 3D. The base is ${L} cm by ${W} cm, the tank is ${H} cm tall, and the water inside is marked ${h} cm deep.`,
    text:`A rectangular tank measuring ${L} cm by ${W} cm by ${H} cm is filled with water to a depth of ${h} cm. Find the volume of water in the tank. Give your answer in litres.`,
    answer:r2(litres),
    steps:[`Volume of water = length × width × depth of water.`,
           `= ${L} × ${W} × ${h} = ${cm3} cm³.`,
           `1 litre = 1000 cm³.`,
           `Volume = ${cm3} ÷ 1000 = ${money(litres)} litres.`]
  };
},

/* 10 — Angles on a straight line with a triangle */
function angles(){
  const a = ri(35,70), b = ri(40,75);
  const inner = 180 - a - b;
  const x = 180 - b;
  return {
    topic:'Angles', stars:3, suffix:'°', fig:FIG.triangleLine(a,b),
    figDesc:`A triangle standing on the straight line PQ, with its apex above. The angle inside the triangle at P is ${a}° and the angle inside the triangle at Q is ${b}°. The angle marked x is OUTSIDE the triangle, between the sloping side that meets Q and the part of the line PQ that carries on to the right of Q.`,
    text:`In the figure, PQ is a straight line. Find the value of angle x. (The figure is not drawn to scale.)`,
    answer:x,
    accept:[String(x)+'°'],
    steps:[`Angle x and the ${b}° angle sit next to each other on the straight line PQ.`,
           `Angles on a straight line add up to 180°.`,
           `x = 180° − ${b}° = ${x}°.`,
           `(As a check, the third angle inside the triangle is ${inner}°.)`]
  };
},

/* 11 — Average */
function average(){
  const n = ri(4,9);
  const m = ri(28,45);
  const delta = pick([1,2]);
  const A = m + delta;
  const p = m + delta*(n+1);
  return {
    topic:'Average', stars:3, suffix:'kg',
    text:`The average mass of ${n} boys is ${m} kg. When another boy joins them, the average mass becomes ${A} kg. Find the mass of the boy who joined them.`,
    answer:p,
    steps:[`Total mass of the ${n} boys = ${n} × ${m} = ${n*m} kg.`,
           `Total mass of all ${n+1} boys = ${n+1} × ${A} = ${(n+1)*A} kg.`,
           `Mass of the new boy = ${(n+1)*A} − ${n*m} = ${p} kg.`]
  };
},

/* 12 — Gap and difference */
function gapDiff(){
  const kids = ri(5,12);
  const p = ri(2,4);
  const q = p + ri(2,4);
  const r1 = ri(3, kids*(q-p) - 2);
  const r2 = kids*(q-p) - r1;
  const totalSweets = p*kids + r1;
  const P = pick(PEOPLE);
  return {
    topic:'Whole numbers', stars:4, suffix:'children',
    text:`${P.n} bought some sweets to share among a group of children. If ${P.s} gives each child ${p} sweets, ${P.s} will have ${r1} sweets left over. If ${P.s} gives each child ${q} sweets, ${P.s} will be short of ${r2} sweets. How many children are there in the group?`,
    answer:kids,
    steps:[`Giving ${q} instead of ${p} means each child gets ${q-p} more sweets.`,
           `The change from ${r1} left over to ${r2} short is ${r1} + ${r2} = ${r1+r2} sweets.`,
           `Number of children = ${r1+r2} ÷ ${q-p} = ${kids}.`,
           `(Check: ${p} × ${kids} + ${r1} = ${totalSweets} sweets, and ${q} × ${kids} = ${q*kids}, which is ${r2} more than ${totalSweets}.)`],
    bar:{
      caption:`Two bars of the same length. The top bar gives ${p} each with ${r1} spare; the bottom gives ${q} each and runs ${r2} short.`,
      segments:[
        {w:(p*kids)/(q*kids), label:`${p} each`, fill:'var(--sky)'},
        {w:r1/(q*kids), label:'spare', fill:'var(--mint)'},
        {w:r2/(q*kids), label:'short', fill:'var(--coral)'}
      ]
    }
  };
},

/* 13 — Order of operations */
function orderOps(){
  const a = ri(3,12), b = ri(4,9), c = ri(3,9), d = ri(2,8);
  const val = a + b*c - d;
  return {
    topic:'Whole numbers', stars:1,
    text:`What is the value of ${a} + ${b} × ${c} − ${d}?`,
    answer:val,
    steps:[`Do multiplication and division before addition and subtraction.`,
           `${b} × ${c} = ${b*c}.`,
           `${a} + ${b*c} − ${d} = ${val}.`]
  };
},

/* 14 — Decimals in context */
function decimals(){
  const unit = pick([1.25,2.40,0.85,3.50,1.60]);
  const qty = ri(3,9);
  const paid = pick([20,50,100]);
  const cost = unit*qty;
  if(cost > paid) return decimals();
  const change = paid - cost;
  const item = pick(['pens','notebooks','erasers','folders','markers']);
  const P = pick(PEOPLE);
  return {
    topic:'Decimals', stars:2, prefix:'$',
    text:`${P.n} bought ${qty} ${item} costing $${unit.toFixed(2)} each. ${P.S} paid with a $${paid} note. How much change did ${P.s} receive?`,
    answer:r2(change),
    steps:[`Total cost = ${qty} × $${unit.toFixed(2)} = $${money(cost)}.`,
           `Change = $${paid} − $${money(cost)}.`,
           `= $${money(change)}.`]
  };
},

/* 15 — ratio before and after a transfer (total stays the same) */
function ratioChange(){
  const T = pick([[5,3,1,1],[3,2,1,1],[7,5,1,1],[5,1,3,1],[7,3,3,2],[9,3,2,1]]);
  const [a,b,r,s] = T;
  const lcm = (x,y)=>{ const g=(m,n)=>n?g(n,m%n):m; return x*y/g(x,y); };
  const L = lcm(a+b, r+s);
  const m = ri(2,9);
  const total = L*m;
  const aStart = total*a/(a+b), aEnd = total*r/(r+s);
  const moved = aStart - aEnd;
  if(moved <= 0 || !Number.isInteger(moved) || !Number.isInteger(aStart)) return ratioChange();
  const [P,Q] = twoPeople();
  return {
    topic:'Ratio', stars:3, suffix:'cards',
    text:`${P.n} and ${Q.n} had ${total} cards altogether. At first, the ratio of the number of cards ${P.n} had to the number of cards ${Q.n} had was ${a} : ${b}. ${P.S} then gave ${Q.n} ${moved} cards. The ratio became ${r} : ${s}. How many cards did ${P.n} have at first?`,
    answer:aStart,
    steps:[`The total number of cards never changes, so use the total as the whole.`,
           `At first, ${P.n} had ${a} out of ${a+b} equal units: ${a}/${a+b} \u00d7 ${total} = ${aStart}.`,
           `Afterwards, ${P.n} had ${r}/${r+s} \u00d7 ${total} = ${aEnd}.`,
           `Check: ${aStart} \u2212 ${aEnd} = ${moved} cards given away.`],
    bar:{ caption:`One bar of ${total} cards, cut two ways: ${a} : ${b} before, ${r} : ${s} after.`,
          segments:[{w:aEnd/total,label:`kept`,fill:'var(--sky)'},
                    {w:moved/total,label:`given`,fill:'var(--gold)'},
                    {w:(total-aStart)/total,label:`${Q.n} at first`,fill:'var(--berry)'}] }
  };
},

/* 16 — find the percentage change */
function percentChange(){
  const up = Math.random() < 0.5;
  const base = pick([40,50,60,80,120,150,200,250]);
  const pct  = pick([10,15,20,25,30,40,50]);
  const delta = base*pct/100;
  if(!Number.isInteger(delta)) return percentChange();
  const after = up ? base + delta : base - delta;
  if(after <= 0) return percentChange();
  const item = pick(['a bicycle','a school bag','a pair of shoes','a table fan','a badminton racket']);
  return {
    topic:'Percentage', stars:4, suffix:'%',
    text:up
      ? `The price of ${item} rose from $${base} to $${after}. Find the percentage increase.`
      : `The price of ${item} fell from $${base} to $${after}. Find the percentage decrease.`,
    answer:pct,
    steps:[`The change is $${Math.max(base,after)} − $${Math.min(base,after)} = $${delta}.`,
           `A percentage change is always measured against the ORIGINAL amount, $${base}.`,
           `Percentage change = ${delta}/${base} \u00d7 100% = ${pct}%.`]
  };
},

/* 17 — average speed over two legs (the classic trap: never average the speeds) */
function twoLegSpeed(){
  const [s1,s2] = pick([[30,60],[40,60],[20,30],[45,90],[50,75],[60,90],[36,45]]);
  const avg = 2*s1*s2/(s1+s2);
  if(!Number.isInteger(avg*10)) return twoLegSpeed();
  const g=(m,n)=>n?g(n,m%n):m;
  const d = (s1*s2/g(s1,s2)) * pick([1,2]);
  const P = pick(PEOPLE);
  return {
    topic:'Speed', stars:5, suffix:'km/h',
    text:`${P.n} cycled the first ${d} km of a journey at an average speed of ${s1} km/h. ${P.S} cycled the next ${d} km at an average speed of ${s2} km/h. Find ${P.p} average speed for the whole journey.`,
    answer:Math.round(avg*100)/100,
    steps:[`Time for the first part = ${d} \u00f7 ${s1} = ${money(d/s1)} h.`,
           `Time for the second part = ${d} \u00f7 ${s2} = ${money(d/s2)} h.`,
           `Total distance = ${2*d} km and total time = ${money(d/s1 + d/s2)} h.`,
           `Average speed = ${2*d} \u00f7 ${money(d/s1+d/s2)} = ${money(avg)} km/h. (It is not ${money((s1+s2)/2)} km/h \u2014 you cannot average the two speeds.)`]
  };
},

/* 18 — rate that is not speed */
function rateWork(){
  const v1 = pick([8,12,15,20,24]);
  const t1 = pick([3,4,5,6]);
  const k  = ri(3,8);
  const v2 = v1*k, t2 = t1*k;
  return {
    topic:'Rate', stars:3, suffix:'minutes',
    text:`A tap fills ${v1} litres of water in ${t1} minutes. At the same rate, how long will it take to fill ${v2} litres?`,
    answer:t2,
    steps:[`${v2} \u00f7 ${v1} = ${k}, so the tank needs ${k} times as much water.`,
           `The tap runs at the same rate, so it needs ${k} times as long.`,
           `Time = ${t1} \u00d7 ${k} = ${t2} minutes.`]
  };
},

/* 19 — volume the other way round: find the depth */
function volumeDepth(){
  const L = pick([20,25,40,50]);
  const W = pick([20,25,30,40]);
  const h = pick([4,5,6,8,10]);
  const cm3 = L*W*h;
  if(cm3 % 1000 !== 0) return volumeDepth();
  const H = h + pick([8,10,15,20]);
  return {
    topic:'Volume', stars:4, suffix:'cm', fig:FIG.tank(L,W,H,h,true),
    figDesc:`An open rectangular tank drawn in 3D. The base is ${L} cm by ${W} cm and the tank is ${H} cm tall. The water inside is marked with a question mark for its depth.`,
    text:`A rectangular tank measuring ${L} cm by ${W} cm by ${H} cm contains ${cm3/1000} litres of water. Find the depth of the water in the tank.`,
    answer:h,
    steps:[`${cm3/1000} litres = ${cm3} cm\u00b3.`,
           `The base area of the tank = ${L} \u00d7 ${W} = ${L*W} cm\u00b2.`,
           `Depth = volume \u00f7 base area = ${cm3} \u00f7 ${L*W} = ${h} cm.`]
  };
},

/* 20 — angles in a parallelogram */
function parallelogramAngle(){
  const a = ri(50,130);
  if(a === 90) return parallelogramAngle();
  return {
    topic:'Angles', stars:3, suffix:'\u00b0', fig:FIG.parallelogram(a),
    figDesc:`A parallelogram ABCD with A at the bottom left, B at the bottom right, C at the top right and D at the top left. Angle ADC is marked ${a} degrees. The angle marked x is angle DAB, at corner A between side AD and side AB.`,
    text:`ABCD is a parallelogram. Angle ADC = ${a}\u00b0. Find the value of angle x. (The figure is not drawn to scale.)`,
    answer:180-a,
    accept:[String(180-a)+'\u00b0'],
    steps:[`In a parallelogram, two angles that are next to each other add up to 180\u00b0.`,
           `Angle DAB and angle ADC are next to each other along the side AD.`,
           `x = 180\u00b0 \u2212 ${a}\u00b0 = ${180-a}\u00b0.`,
           `(The angle opposite x, angle BCD, is also ${180-a}\u00b0.)`]
  };
},

/* 21 — dividing by a fraction, in context */
function fractionDivide(){
  const f = pick([[1,2],[1,4],[3,4],[2,3],[1,3],[2,5],[3,8],[1,5]]);
  const [p,q] = f;
  const T = pick([3,4,5,6,8,9,10,12]);
  const n = T*q/p;
  if(!Number.isInteger(n) || n > 60) return fractionDivide();
  const stuff = pick([['rice','bags'],['flour','packets'],['sugar','packets'],['sand','sacks']]);
  const P = pick(PEOPLE);
  return {
    topic:'Fractions', stars:4, suffix:stuff[1],
    text:`${P.n} had ${T} kg of ${stuff[0]}. ${P.S} packed all of it into ${stuff[1]} of ${p}/${q} kg each. How many ${stuff[1]} did ${P.s} pack?`,
    answer:n,
    steps:[`This asks how many lots of ${p}/${q} kg fit into ${T} kg.`,
           `${T} \u00f7 ${p}/${q} means ${T} \u00d7 ${q}/${p}.`,
           `= ${T} \u00d7 ${q} \u00f7 ${p} = ${n} ${stuff[1]}.`]
  };
},

/* 22 — working backwards */
function workingBackwards(){
  const f = pick([[1,3],[1,4],[2,5],[1,5],[3,8],[1,2]]);
  const [p,q] = f;
  const start = q * ri(4,15) * 2;
  const spent = start*p/q;
  const rem = start - spent;
  const extra = pick([6,8,10,12,15,20]);
  const left = rem - extra;
  if(left <= 0 || !Number.isInteger(spent)) return workingBackwards();
  const P = pick(PEOPLE);
  return {
    topic:'Fractions', stars:5, prefix:'$',
    text:`${P.n} spent ${p}/${q} of ${P.p} money on a book. ${P.S} then spent another $${extra} on lunch. ${P.S} had $${left} left. How much money did ${P.s} have at first?`,
    answer:start,
    steps:[`Work backwards from the end. Before lunch ${P.s} had $${left} + $${extra} = $${rem}.`,
           `That $${rem} is what was left after the book, which is ${q-p}/${q} of the money.`,
           `1/${q} of the money = ${rem} \u00f7 ${q-p} = $${money(rem/(q-p))}.`,
           `All ${q}/${q} = ${money(rem/(q-p))} \u00d7 ${q} = $${start}.`],
    bar:{ caption:`The whole bar is the money at first. The book takes ${p} of ${q} units; what is left covers lunch and the $${left}.`,
          segments:[{w:spent/start,label:'book',fill:'var(--coral)'},
                    {w:extra/start,label:'lunch',fill:'var(--gold)'},
                    {w:left/start,label:'left',fill:'var(--mint)'}] }
  };
}

,

/* 23 — place value in a large number */
function placeValue(){
  const ds=[]; while(ds.length<6){ const d=ri(1,9); if(ds.indexOf(d)<0) ds.push(d); }
  const pos = ri(0,5);
  const n = Number(ds.join(''));
  const val = ds[pos] * Math.pow(10, 5-pos);
  const grouped = String(n).replace(/\B(?=(\d{3})+(?!\d))/g,' ');
  return {
    topic:'Whole numbers', stars:1,
    text:`What does the digit ${ds[pos]} in ${grouped} stand for?`,
    answer:val,
    steps:[`Count the places from the right: ones, tens, hundreds, thousands, ten thousands, hundred thousands.`,
           `The digit ${ds[pos]} sits in the ${['hundred thousands','ten thousands','thousands','hundreds','tens','ones'][pos]} place.`,
           `So it stands for ${ds[pos]} \u00d7 ${Math.pow(10,5-pos)} = ${val}.`]
  };
},

/* 24 — rounding */
function rounding(){
  const place = pick([10,100,1000]);
  let n = ri(10000, 999999);
  if(Math.abs(n % place - place/2) < 1) n += 7;         // avoid an exact halfway case
  const ans = Math.round(n/place)*place;
  const word = place===10 ? 'ten' : place===100 ? 'hundred' : 'thousand';
  return {
    topic:'Whole numbers', stars:1,
    text:`Round ${String(n).replace(/\B(?=(\d{3})+(?!\d))/g,' ')} to the nearest ${word}.`,
    answer:ans,
    steps:[`Look at the digit just to the right of the ${word}s place.`,
           `If it is 5 or more, round up. If it is less than 5, round down.`,
           `${n} rounds to ${ans}.`]
  };
},

/* 25 — factors and multiples */
function factorsMultiples(){
  if(Math.random() < 0.5){
    const n = pick([24,36,48,60,72,96,100,120]);
    let c=0, list=[]; for(let i=1;i<=n;i++) if(n%i===0){ c++; list.push(i); }
    return {
      topic:'Whole numbers', stars:2, suffix:'factors',
      text:`How many factors does ${n} have?`,
      answer:c,
      steps:[`Pair the factors up: 1 \u00d7 ${n}, and work inwards.`,
             `The factors of ${n} are ${list.join(', ')}.`,
             `That is ${c} factors.`]
    };
  }
  const a = pick([4,6,8,9,12]), b = pick([10,14,15,16,18,20]);
  const g=(x,y)=>y?g(y,x%y):x;
  const l = a*b/g(a,b);
  return {
    topic:'Whole numbers', stars:2,
    text:`What is the smallest number that is a multiple of both ${a} and ${b}?`,
    answer:l,
    steps:[`List the multiples of ${a}: ${[1,2,3,4,5].map(k=>a*k).join(', ')}, and so on.`,
           `List the multiples of ${b}: ${[1,2,3,4,5].map(k=>b*k).join(', ')}, and so on.`,
           `The smallest one in both lists is ${l}.`]
  };
},

/* 26 — measurement conversion */
function measureConvert(){
  const kind = pick(['kg','m','l','cm']);
  if(kind==='kg'){ const v = ri(12,89)/10;
    return {topic:'Measurement', stars:1, suffix:'g',
      text:`Express ${v} kg in grams.`, answer:Math.round(v*1000),
      steps:[`1 kg = 1000 g.`, `${v} \u00d7 1000 = ${Math.round(v*1000)} g.`]}; }
  if(kind==='m'){ const v = ri(12,89)*10 + pick([0,50]);
    return {topic:'Measurement', stars:1, suffix:'km',
      text:`Express ${v} m in kilometres.`, answer:r2(v/1000),
      steps:[`1 km = 1000 m.`, `${v} \u00f7 1000 = ${money(v/1000)} km.`]}; }
  if(kind==='l'){ const v = ri(11,95)/10;
    return {topic:'Measurement', stars:1, suffix:'ml',
      text:`Express ${v} litres in millilitres.`, answer:Math.round(v*1000),
      steps:[`1 litre = 1000 ml.`, `${v} \u00d7 1000 = ${Math.round(v*1000)} ml.`]}; }
  const v = ri(105,985);
  return {topic:'Measurement', stars:1, suffix:'m',
    text:`Express ${v} cm in metres.`, answer:r2(v/100),
    steps:[`1 m = 100 cm.`, `${v} \u00f7 100 = ${money(v/100)} m.`]};
},

/* 27 — duration between two times */
function timeDuration(){
  const startM = ri(6,13)*60 + pick([0,15,20,25,30,40,45,50]);
  const dur = pick([45,55,70,85,95,105,125,140,155,170]);
  const endM = startM + dur;
  const t24 = m => String(Math.floor(m/60)).padStart(2,'0') + ' ' + String(m%60).padStart(2,'0');
  return {
    topic:'Time', stars:2, suffix:'minutes',
    text:`A show started at ${t24(startM)} and ended at ${t24(endM)}. How long did it last, in minutes?`,
    answer:dur,
    steps:[`From ${t24(startM)} to ${t24(startM + (60 - startM%60)%60 || startM)} is part of the first hour.`,
           `Count the whole hours, then add the extra minutes.`,
           `The show lasted ${dur} minutes.`]
  };
},

/* 28 — fraction to decimal */
function fracToDecimal(){
  const q = pick([2,4,5,10,20,25,50]);
  const p = ri(1,q-1);
  const g=(x,y)=>y?g(y,x%y):x;
  if(g(p,q) !== 1) return fracToDecimal();
  const w = ri(1,9);
  const val = r2(w + p/q);
  if((String(val).split('.')[1]||'').length > 2) return fracToDecimal();
  return {
    topic:'Decimals', stars:2,
    text:`Express ${w} ${p}/${q} as a decimal.`,
    answer:val,
    steps:[`Turn ${p}/${q} into hundredths: ${p}/${q} = ${money(p/q*100)}/100.`,
           `${p}/${q} = ${money(p/q)}.`,
           `So ${w} ${p}/${q} = ${money(val)}.`]
  };
},

/* 29 — fraction divided by a whole number */
function fracDivWhole(){
  const q = pick([3,4,5,6,7,8,9]);
  const p = ri(1,q-1);
  const n = ri(2,8);
  const g=(x,y)=>y?g(y,x%y):x;
  if(g(p,q) !== 1) return fracDivWhole();
  const dq = q*n, k = g(p,dq);
  const np = p/k, nq = dq/k;
  return {
    topic:'Fractions', stars:3,
    text:`Find the value of ${p}/${q} \u00f7 ${n}. Give your answer in its simplest form.`,
    answer:np/nq, answerLabel:np+'/'+nq, accept:[np+'/'+nq],
    steps:[`Dividing by ${n} is the same as multiplying by 1/${n}.`,
           `${p}/${q} \u00d7 1/${n} = ${p}/${dq}.`,
           `In its simplest form that is ${np}/${nq}.`]
  };
},

/* 30 — GST added on */
function gst(){
  const price = pick([200,300,400,500,600,800,900,1200]);
  const rate = 9;
  const tax = price*rate/100;
  return {
    topic:'Percentage', stars:2, prefix:'$',
    text:`A television set costs $${price} before ${rate}% GST. What is the cost of the television set including GST?`,
    answer:r2(price+tax),
    steps:[`GST = ${rate}% \u00d7 $${price} = $${money(tax)}.`,
           `Cost including GST = $${price} + $${money(tax)} = $${money(price+tax)}.`,
           `You can also do it in one step: 1${String(100+rate).slice(1)}% \u00d7 $${price} = $${money(price+tax)}.`]
  };
},

/* 31 — algebra with a fraction term */
function algebraFraction(){
  const a = ri(3,9), c = pick([2,3,4]), w = ri(2,9);
  const b = c * ri(1,3) / ( (c*ri(1,3)) % c === 0 ? 1 : 1 );
  const bb = c * ri(1,3);
  const d = ri(2,12);
  const val = a*w - (bb*w)/c + d;
  if(!Number.isInteger(val) || val <= 0) return algebraFraction();
  return {
    topic:'Algebra', stars:3,
    text:`Find the value of ${a}w \u2212 ${bb}w/${c} + ${d} when w = ${w}.`,
    answer:val,
    steps:[`Replace every w with ${w}.`,
           `${a}w = ${a} \u00d7 ${w} = ${a*w}.`,
           `${bb}w/${c} = (${bb} \u00d7 ${w}) \u00f7 ${c} = ${bb*w} \u00f7 ${c} = ${(bb*w)/c}.`,
           `${a*w} \u2212 ${(bb*w)/c} + ${d} = ${val}.`]
  };
},

/* 32 — base angle of an isosceles triangle */
function isoscelesAngle(){
  const apex = ri(10,70)*2;
  const base = (180-apex)/2;
  return {
    topic:'Angles', stars:3, suffix:'\u00b0', fig:FIG.isosceles(apex),
    figDesc:`An isosceles triangle ABC with A at the top, B at the bottom left and C at the bottom right. The two sloping sides AB and AC are marked with ticks to show they are equal. The angle at A is ${apex} degrees. The angle marked x is the angle at B, inside the triangle.`,
    text:`In the isosceles triangle ABC, AB = AC and angle BAC = ${apex}\u00b0. Find the value of angle x.`,
    answer:base, accept:[base+'\u00b0'],
    steps:[`The three angles inside a triangle add up to 180\u00b0.`,
           `180\u00b0 \u2212 ${apex}\u00b0 = ${180-apex}\u00b0 is shared between the two bottom angles.`,
           `AB = AC, so those two angles are equal.`,
           `x = ${180-apex}\u00b0 \u00f7 2 = ${base}\u00b0.`]
  };
},

/* 33 — parallel lines cut by a transversal */
function parallelAngle(){
  const a = ri(100,140);
  return {
    topic:'Angles', stars:4, suffix:'\u00b0', fig:FIG.parallelCut(a),
    figDesc:`Two parallel lines, AB on top and CD below, both marked with arrows, cut by one slanting line. The angle of ${a} degrees is above AB, on the right of the slanting line. The angle marked x is below CD, also on the right of the slanting line.`,
    text:`In the figure, AB is parallel to CD. Find the value of angle x. (The figure is not drawn to scale.)`,
    answer:180-a, accept:[(180-a)+'\u00b0'],
    steps:[`AB and CD are parallel, so the angle above CD on the same side of the slanting line is also ${a}\u00b0.`,
           `That angle and x sit next to each other on the straight line CD.`,
           `Angles on a straight line add up to 180\u00b0.`,
           `x = 180\u00b0 \u2212 ${a}\u00b0 = ${180-a}\u00b0.`]
  };
},

/* 34 — pie chart */
function pieChartQ(){
  const FRUIT = [['Mango','Apple','Pear','Grapes'],['Football','Netball','Swimming','Running'],
                 ['Bus','Train','Car','Walking']];
  const set = pick(FRUIT);
  const pcts = pick([[40,25,20,15],[35,30,20,15],[45,25,20,10],[30,30,25,15],[50,20,20,10]]);
  const total = pick([120,160,200,240,300]);
  const hidden = ri(0,3);
  if(!Number.isInteger(total*pcts[hidden]/100)) return pieChartQ();
  const parts = set.map((s,i)=>({label:s, pct:pcts[i], show: i===hidden ? '?' : pcts[i]+'%'}));
  const known = pcts.filter((_,i)=>i!==hidden);
  const ans = total*pcts[hidden]/100;
  return {
    topic:'Data', stars:4, fig:FIG.pie(parts, total + ' pupils'),
    figDesc:`A pie chart of ${total} pupils split into ${set.join(', ')}. The chart shows ` +
      set.map((s,i)=> s+' '+(i===hidden?'unknown':pcts[i]+'%')).join(', ') + '.',
    text:`The pie chart shows how ${total} pupils answered a survey. Find the number of pupils in the part marked with a question mark.`,
    answer:ans, suffix:'pupils',
    steps:[`The whole pie chart is 100%.`,
           `The parts that are shown add up to ${known.join('% + ')}% = ${known.reduce((x,y)=>x+y,0)}%.`,
           `The missing part is 100% \u2212 ${known.reduce((x,y)=>x+y,0)}% = ${pcts[hidden]}%.`,
           `${pcts[hidden]}% of ${total} = ${ans} pupils.`]
  };
},

/* 35 — bar graph */
function barGraphQ(){
  const days = ['Mon','Tue','Wed','Thu','Fri'];
  const vals = days.map(()=>ri(2,19)*5);
  const ymax = Math.ceil(Math.max(...vals)/25)*25 + 0;
  const mode = pick(['total','diff']);
  if(mode==='total'){
    const t = vals.reduce((a,b)=>a+b,0);
    return {
      topic:'Data', stars:2, suffix:'books', fig:FIG.bars(days, vals, ymax, 'Books'),
      figDesc:`A bar graph of books borrowed each day: ` + days.map((d,i)=>d+' '+vals[i]).join(', ') + '.',
      text:`The bar graph shows the number of books borrowed from a library each day. How many books were borrowed altogether from Monday to Friday?`,
      answer:t,
      steps:[`Read the height of each bar: ${days.map((d,i)=>d+' = '+vals[i]).join(', ')}.`,
             `Add them: ${vals.join(' + ')} = ${t} books.`]
    };
  }
  let i=0, j=1;
  vals.forEach((v,k)=>{ if(v>vals[i]) i=k; });
  vals.forEach((v,k)=>{ if(v<vals[j]) j=k; });
  if(i===j) return barGraphQ();
  return {
    topic:'Data', stars:2, suffix:'books', fig:FIG.bars(days, vals, ymax, 'Books'),
    figDesc:`A bar graph of books borrowed each day: ` + days.map((d,k)=>d+' '+vals[k]).join(', ') + '.',
    text:`The bar graph shows the number of books borrowed from a library each day. How many more books were borrowed on ${days[i]} than on ${days[j]}?`,
    answer:vals[i]-vals[j],
    steps:[`${days[i]} = ${vals[i]} books and ${days[j]} = ${vals[j]} books.`,
           `${vals[i]} \u2212 ${vals[j]} = ${vals[i]-vals[j]} books.`]
  };
},

/* 36 — line graph */
function lineGraphQ(){
  const months = ['Jan','Feb','Mar','Apr','May'];
  const vals = months.map(()=>ri(2,11)*40);
  const ymax = Math.ceil(Math.max(...vals)/100)*100;
  let i = ri(0,3);
  if(vals[i+1] === vals[i]) return lineGraphQ();
  const up = vals[i+1] > vals[i];
  return {
    topic:'Data', stars:3, suffix:'visitors', fig:FIG.lineGraph(months, vals, ymax, 'Visitors'),
    figDesc:`A line graph of visitors each month: ` + months.map((m,k)=>m+' '+vals[k]).join(', ') + '.',
    text:`The line graph shows the number of visitors to a museum each month. What was the ${up?'increase':'decrease'} in the number of visitors from ${months[i]} to ${months[i+1]}?`,
    answer:Math.abs(vals[i+1]-vals[i]),
    steps:[`${months[i]} = ${vals[i]} visitors.`,
           `${months[i+1]} = ${vals[i+1]} visitors.`,
           `The ${up?'increase':'decrease'} = ${Math.max(vals[i],vals[i+1])} \u2212 ${Math.min(vals[i],vals[i+1])} = ${Math.abs(vals[i+1]-vals[i])} visitors.`]
  };
},

/* 37 — missing value from an average */
function averageTable(){
  const n = pick([4,5]);
  const avg = ri(60,85);
  const others = Array.from({length:n-1},()=>ri(50,95));
  const miss = avg*n - others.reduce((a,b)=>a+b,0);
  if(miss < 20 || miss > 100) return averageTable();
  return {
    topic:'Average', stars:3, suffix:'marks',
    text:`The average mark of ${n} pupils in a test was ${avg}. ${n-1} of them scored ${others.slice(0,-1).join(', ')} and ${others[others.length-1]} marks. How many marks did the last pupil score?`,
    answer:miss,
    steps:[`Total marks of all ${n} pupils = ${n} \u00d7 ${avg} = ${n*avg}.`,
           `The ${n-1} known pupils scored ${others.join(' + ')} = ${others.reduce((a,b)=>a+b,0)} marks.`,
           `The last pupil scored ${n*avg} \u2212 ${others.reduce((a,b)=>a+b,0)} = ${miss} marks.`]
  };
},

/* 38 — a rate that changes after a threshold */
function rateTable(){
  const H = 40, base = pick([9,10,11,12]), extraRate = pick([14,15,18]), extra = ri(4,12);
  const W = H + extra, T = base*H + extraRate*extra;
  const P = pick(PEOPLE);
  return {
    topic:'Rate', stars:5, prefix:'$',
    text:`${P.n} is paid one rate for the first ${H} hours worked in a week, and $${extraRate} per hour for every hour after that. Last week ${P.s} worked ${W} hours and was paid $${T} in total. How much was ${P.s} paid per hour for the first ${H} hours?`,
    answer:base,
    steps:[`Hours beyond the first ${H} = ${W} \u2212 ${H} = ${extra} hours.`,
           `Pay for those hours = ${extra} \u00d7 $${extraRate} = $${extraRate*extra}.`,
           `Pay for the first ${H} hours = $${T} \u2212 $${extraRate*extra} = $${base*H}.`,
           `Rate = $${base*H} \u00f7 ${H} = $${base} per hour.`]
  };
},

/* 39 — commission in two bands */
function commission(){
  const A = pick([150,160,200,250]);
  const k = ri(4,20)*25;
  const E = r2(A*0.10 + k*0.12);
  if((String(E).split('.')[1]||'').length > 2) return commission();
  const P = pick(PEOPLE);
  return {
    topic:'Percentage', stars:5, prefix:'$',
    text:`For every fan ${P.n} sells, ${P.s} earns 10% of the first $${A} of the selling price and 12% of the rest of the selling price. ${P.S} earned $${money(E)} on one fan. What was the selling price of the fan?`,
    answer:A+k,
    steps:[`Earnings from the first $${A} = 10% \u00d7 $${A} = $${money(A*0.1)}.`,
           `Earnings from the rest = $${money(E)} \u2212 $${money(A*0.1)} = $${money(k*0.12)}.`,
           `That is 12% of the rest, so the rest = $${money(k*0.12)} \u00f7 12% = $${k}.`,
           `Selling price = $${A} + $${k} = $${A+k}.`]
  };
},

/* 40 — two coin denominations */
function coinsProblem(){
  const n = ri(12,30), k = ri(3,12);
  const T = r2((70*n + 50*k)/100);
  const P = pick(PEOPLE);
  return {
    topic:'Money', stars:5, suffix:'coins',
    text:`${P.n}'s money box holds only 20-cent and 50-cent coins. There are ${k} more 50-cent coins than 20-cent coins. The total value of the coins is $${money(T)}. How many coins are in the money box altogether?`,
    answer:2*n+k,
    steps:[`Set aside the ${k} extra 50-cent coins: ${k} \u00d7 $0.50 = $${money(k*0.5)}.`,
           `That leaves $${money(T)} \u2212 $${money(k*0.5)} = $${money(T-k*0.5)} in equal numbers of each coin.`,
           `One 20-cent coin and one 50-cent coin together are $0.70.`,
           `Number of pairs = $${money(T-k*0.5)} \u00f7 $0.70 = ${n}.`,
           `Total coins = ${n} + ${n} + ${k} = ${2*n+k}.`]
  };
},

/* 41 — two vehicles travelling towards each other */
function twoVehiclesMeet(){
  const s = pick([40,45,48,50,60]);
  const t1 = pick([2,2.5,3]);
  const lag = pick([0.5,1]);
  const t2 = t1 - lag;
  if(t2 <= 0) return twoVehiclesMeet();
  const d = s*t1 + 2*s*t2;
  const start = ri(7,9);
  const hhmm = h => { const H=Math.floor(h), M=Math.round((h-H)*60);
    return (H>12?H-12:H) + (M? '.'+String(M).padStart(2,'0') : '') + (H>=12?' p.m.':' a.m.'); };
  return {
    topic:'Speed', stars:5, suffix:'km',
    text:`At ${hhmm(start)}, a lorry left Town P for Town Q at an average speed of ${s} km/h. ${lag===0.5?'30 minutes':'1 hour'} later, a car left Town Q for Town P at twice the average speed of the lorry. They passed each other at ${hhmm(start+t1)}. What is the distance between Town P and Town Q?`,
    answer:r2(d),
    steps:[`The lorry travelled for ${money(t1)} h, so it covered ${s} \u00d7 ${money(t1)} = ${money(s*t1)} km.`,
           `The car set off ${lag===0.5?'30 minutes':'1 hour'} later, so it travelled for ${money(t2)} h.`,
           `The car's speed = 2 \u00d7 ${s} = ${2*s} km/h, so it covered ${2*s} \u00d7 ${money(t2)} = ${money(2*s*t2)} km.`,
           `Together they covered the whole distance: ${money(s*t1)} + ${money(2*s*t2)} = ${money(d)} km.`]
  };
},

/* 42 — pouring water from one tank into another */
function waterTransfer(){
  const [L,W,l,w] = pick([[40,25,25,20],[30,20,20,15],[20,25,25,10],[40,30,30,20]]);
  const q = pick([5,6,8,10]);
  const r = pick([4,5,6,8]);
  const d = q + r, h = 2*q;
  const H = d + pick([6,8,10]);
  const Vy = l*w*h;
  if(Vy !== L*W*q) return waterTransfer();
  return {
    topic:'Volume', stars:5, suffix:'cm', fig:FIG.tank(L,W,H,d),
    figDesc:`An open rectangular tank X drawn in 3D. Its base is ${L} cm by ${W} cm and it is ${H} cm tall. The water inside is ${d} cm deep.`,
    text:`Tank X measures ${L} cm by ${W} cm by ${H} cm and holds water to a depth of ${d} cm. Water from tank X is poured into an empty tank Y measuring ${l} cm by ${w} cm by ${h} cm until tank Y is completely full. Find the depth of the water left in tank X.`,
    answer:r,
    steps:[`Water in tank X at first = ${L} \u00d7 ${W} \u00d7 ${d} = ${L*W*d} cm\u00b3.`,
           `Tank Y holds ${l} \u00d7 ${w} \u00d7 ${h} = ${Vy} cm\u00b3 when full.`,
           `Water left in tank X = ${L*W*d} \u2212 ${Vy} = ${L*W*d-Vy} cm\u00b3.`,
           `Base area of tank X = ${L} \u00d7 ${W} = ${L*W} cm\u00b2.`,
           `Depth left = ${L*W*d-Vy} \u00f7 ${L*W} = ${r} cm.`]
  };
}

];

/* =========================================================
   STATE
   ========================================================= */
GEN.push(...MochiBank.generators, ...MochiChallenges.generators);
const BANK = MochiLearning.catalog(GEN);
const TOPICS = ['Fractions','Ratio','Percentage','Speed','Rate','Algebra','Circles','Volume','Angles','Average','Whole numbers','Decimals','Measurement','Time','Data','Money','Geometry','Problem solving','Investigation'];
let S = {
  done:0, right:0, streak:0, best:0,
  mastery:{},           // topic -> {a, c}
  lastSeen:{},          // topic -> question index (stale-first)
  tick:0,
  voice:false,   // reading is the default; sound is opt-in
  cat:'Mochi'
};
TOPICS.forEach(t=>{ S.mastery[t]={a:0,c:0}; S.lastSeen[t]=-1; });

let current = null;       // active question
let currentGen = null;    // the generator that made it, so we can mint a twin
let settled = false;      // has this question been answered
let history = [];         // conversation turns for the LLM
let revealed = false;

/* =========================================================
   ADAPTIVE, STALE-FIRST SELECTION
   Weakest topics first; among equals, whichever has waited longest.
   ========================================================= */
function chooseGenerator(){
  const learning=MochiLearning.init(S);
  selectedStudy=MochiLearning.choose(learning,BANK);
  return selectedStudy.g;
}
let selectedStudy=null;
let questionEpoch=0,activeTutorController=null;

/* =========================================================
   MARKING — the engine owns truth
   ========================================================= */
function normalise(s){ return String(s).trim().toLowerCase().replace(/−/g,'-').replace(/,/g,'').replace(/\s+/g,' '); }
function numericInput(input,q={}){
  let t=normalise(input);
  if(q.prefix==='$') t=t.replace(/^\$\s*/,'');
  const aliases={cm:['cm','centimetres','centimeters'],m:['m','metres','meters'],km:['km','kilometres','kilometers'],g:['g','grams'],kg:['kg','kilograms'],litres:['l','litres','liters'],ml:['ml','millilitres','milliliters'],'cm²':['cm²','cm2','square centimetres'],'cm³':['cm³','cm3','cubic centimetres'],'°':['°','degrees','deg'],'%':['%','percent'],'km/h':['km/h'],'m/s':['m/s']};
  if(q.suffix){for(const u of (aliases[q.suffix]||[q.suffix])){if(t.endsWith(u.toLowerCase())){t=t.slice(0,-u.length).trim();break;}}}
  return t;
}
function toNumber(s,q){
  const t=numericInput(s,q);
  const mixed=t.match(/^(-?)(\d+)\s+(\d+)\s*\/\s*(\d+)$/);
  if(mixed){const d=Number(mixed[4]);return d? (mixed[1]==='-'?-1:1)*(Number(mixed[2])+Number(mixed[3])/d):NaN;}
  const frac=t.match(/^(-?\d+)\s*\/\s*(\d+)$/);
  if(frac)return Number(frac[2])?Number(frac[1])/Number(frac[2]):NaN;
  return /^-?(?:\d+(?:\.\d*)?|\.\d+)$/.test(t)?Number(t):NaN;
}
function isCorrect(input,q){
  if(typeof q.answer==='string')return normalise(input)===normalise(q.answer);
  const got=toNumber(input,q);
  return Number.isFinite(got)&&Math.abs(got-q.answer)<=1e-9*Math.max(1,Math.abs(q.answer));
}




/* The cat ships inside the markup; this just reads her back out. */
const BUILTIN_PHOTO = ($('catImg').getAttribute('src') || '');
const APP_VERSION = '3.0.0';
const BUILD_KIND  = 'site';
const BUILD_DATE  = '2026-09-11';
const BUILD = BUILD_KIND + ' v' + APP_VERSION + ' \u00b7 ' + BUILD_DATE;
const PHOTO_KEY = 'cat-photo-v1';

/* =========================================================
   THE CAT — mood shown by the frame, not a drawn face
   ========================================================= */
function setCat(mood){
  const w = $('catWrap');
  w.classList.remove('settled','curious','pleased','unsure');
  w.classList.add(mood);
}
function showPhoto(url){
  if(!url) return;
  if($('roomImg')) $('roomImg').src = url;
  $('catImg').src = url;
  $('catImg').style.display = '';
  $('catPh').style.display = 'none';
  const p = $('catPrev'); p.src = url; p.style.display = '';
}
function clearPhoto(){
  $('catImg').removeAttribute('src');
  $('catImg').style.display = 'none';
  $('catPh').style.display = '';
  $('catPrev').style.display = 'none';
}
async function savePhoto(url){
  try{ if(window.storage){ await window.storage.set(PHOTO_KEY, url); } }catch(e){}
  if(!lsSet(PHOTO_KEY, url)) MEM[PHOTO_KEY] = url;
}
async function loadPhoto(){
  try{
    if(window.storage){ const r = await window.storage.get(PHOTO_KEY); if(r && r.value) return r.value; }
  }catch(e){}
  return lsGet(PHOTO_KEY) || MEM[PHOTO_KEY] || BUILTIN_PHOTO || '';
}
/* Downscale before storing — a phone photo is several MB and would be slow every load. */
function handleFile(file){
  if(!file) return;
  $('photoNote').textContent = 'Reading…';
  const rd = new FileReader();
  rd.onerror = ()=> $('photoNote').textContent = 'That file could not be read. Try a PNG or JPEG.';
  rd.onload = ()=>{
    const im = new Image();
    im.onerror = ()=> $('photoNote').textContent = 'That file is not an image this browser can open.';
    im.onload = ()=>{
      const max = 400;
      const sc = Math.min(1, max/Math.max(im.width, im.height));
      const w = Math.max(1,Math.round(im.width*sc)), h = Math.max(1,Math.round(im.height*sc));
      const cv = document.createElement('canvas'); cv.width=w; cv.height=h;
      cv.getContext('2d').drawImage(im,0,0,w,h);
      let url;
      try{
        url = cv.toDataURL('image/webp',0.92);           // keeps transparency
        if(url.indexOf('data:image/webp') !== 0) throw new Error('no webp');
      }catch(e){ url = cv.toDataURL('image/png'); }
      showPhoto(url); savePhoto(url);
      $('photoNote').textContent = `Saved · ${w}×${h} · ${Math.round(url.length/1024)} KB`;
    };
    im.src = rd.result;
  };
  rd.readAsDataURL(file);
}

const PAW = `<svg viewBox="0 0 24 24" aria-hidden="true"><g class="pw"><ellipse cx="6" cy="8" rx="2.6" ry="3.4"/><ellipse cx="11.5" cy="5.4" rx="2.7" ry="3.6"/><ellipse cx="17" cy="7.4" rx="2.6" ry="3.4"/><ellipse cx="20.4" cy="12.8" rx="2.2" ry="2.9"/><path d="M12.4 11.4c4 0 6.7 2.7 6.7 5.5 0 2.4-2 3.9-4.4 3.9-1.6 0-2.3-.6-3.7-.6s-2.1.6-3.7.6c-2.4 0-4.4-1.5-4.4-3.9 0-2.8 2.7-5.5 6.7-5.5z"/></g></svg>`;
function drawPaws(pop){
  const box = $('paws');
  if(box.children.length !== 5) box.innerHTML = PAW.repeat(5);
  const lit = Math.min(S.streak, 5);
  [...box.children].forEach((sv,i)=>{
    const on = i < lit;
    if(on && !sv.classList.contains('lit') && pop){
      sv.classList.add('pop'); setTimeout(()=> sv.classList.remove('pop'), 420);
    }
    sv.classList.toggle('lit', on);
  });
  box.setAttribute('aria-label', 'Streak ' + S.streak);
  box.title = S.streak > 5 ? 'Streak of ' + S.streak : '';
}


/* ============================================================
   COINS, THE SHOP AND MOCHI'S ROOM
   Coins come from maths only. The room is the reward, never
   another place to grind, and Mochi is never sad or hungry.
   ============================================================ */
const TREATS = [
  {id:'fish',  name:'Fish snack',   cost:3,  icon:'\uD83D\uDC1F', purr:22},
  {id:'milk',  name:'Bowl of milk', cost:5,  icon:'\uD83E\uDD5B', purr:32},
  {id:'tuna',  name:'Tin of tuna',  cost:9,  icon:'\uD83E\uDD6B', purr:48},
  {id:'prawn', name:'Prawn treat',  cost:14, icon:'\uD83E\uDD90', purr:70}
];
const WEAR = [
  {id:'bow',    name:'Bow tie',     cost:15, slot:'neck'},
  {id:'specs',  name:'Round specs', cost:18, slot:'eyes'},
  {id:'party',  name:'Party hat',   cost:22, slot:'head'},
  {id:'scarf',  name:'Scarf',       cost:26, slot:'neck'},
  {id:'shades', name:'Sunglasses',  cost:30, slot:'eyes'},
  {id:'crown',  name:'Crown',       cost:50, slot:'head'}
];

/* Drawn in a 0-100 square laid over the photo, so they sit on his head,
   eyes and neck. Tuned to the shipped picture. */
const ACC_SVG = {
  bow:   '<polygon points="33,80 33,94 49,87" fill="#D4607A" stroke="#2A1F1A" stroke-width="1.2"/>'
        +'<polygon points="67,80 67,94 51,87" fill="#D4607A" stroke="#2A1F1A" stroke-width="1.2"/>'
        +'<circle cx="50" cy="87" r="4" fill="#B34A60" stroke="#2A1F1A" stroke-width="1.2"/>',
  scarf: '<path d="M26 80 Q50 94 74 80 L74 89 Q50 103 26 89 Z" fill="#1F8F6E" stroke="#2A1F1A" stroke-width="1.2"/>'
        +'<path d="M64 88 L74 88 L78 101 L68 101 Z" fill="#16755A" stroke="#2A1F1A" stroke-width="1.2"/>',
  party: '<polygon points="50,1 37,27 63,27" fill="#E86A2E" stroke="#2A1F1A" stroke-width="1.2"/>'
        +'<path d="M42 20 L58 20 M45 13 L55 13" stroke="#FFF3E4" stroke-width="2.2" stroke-linecap="round"/>'
        +'<circle cx="50" cy="2" r="4" fill="#D99000" stroke="#2A1F1A" stroke-width="1.2"/>',
  crown: '<polygon points="32,26 32,10 41,18 50,6 59,18 68,10 68,26" fill="#D99000" stroke="#2A1F1A" stroke-width="1.3" stroke-linejoin="round"/>'
        +'<circle cx="41" cy="21" r="2.2" fill="#EE8FA0"/><circle cx="50" cy="19" r="2.4" fill="#1F8F6E"/>'
        +'<circle cx="59" cy="21" r="2.2" fill="#EE8FA0"/>',
  shades:'<rect x="22" y="37" width="24" height="15" rx="7" fill="#2A1F1A"/>'
        +'<rect x="54" y="37" width="24" height="15" rx="7" fill="#2A1F1A"/>'
        +'<rect x="45" y="42" width="10" height="3.4" rx="1.5" fill="#2A1F1A"/>',
  specs: '<circle cx="34" cy="45" r="12" fill="rgba(255,255,255,.22)" stroke="#2A1F1A" stroke-width="2.6"/>'
        +'<circle cx="66" cy="45" r="12" fill="rgba(255,255,255,.22)" stroke="#2A1F1A" stroke-width="2.6"/>'
        +'<path d="M46 45 L54 45" stroke="#2A1F1A" stroke-width="2.6"/>'
};

function coins(){ return S.coins || 0; }
function addCoins(n){
  S.coins = coins() + n;
  const chip = $('coinChip');
  const pop = document.createElement('span');
  pop.className = 'coinpop'; pop.textContent = '+' + n;
  chip.appendChild(pop);
  setTimeout(()=>{ if(pop.parentNode) pop.parentNode.removeChild(pop); }, 1150);
  paintCoins();
  save(S);
}
function paintCoins(){ $('coinCount').textContent = coins(); }

/* purr is a moment, not a duty: it rises when she plays and drifts back to calm */
let purrTimer = null;
function purrWord(v){ return v > 78 ? 'blissful' : v > 45 ? 'happy' : v > 18 ? 'content' : 'calm'; }
function setPurr(v){
  S.purr = Math.max(0, Math.min(100, v));
  $('purrFill').style.width = S.purr + '%';
  $('purrWord').textContent = purrWord(S.purr);
  if(!purrTimer) purrTimer = setInterval(()=>{
    if((S.purr||0) > 0){ S.purr = Math.max(0, S.purr - 2);
      $('purrFill').style.width = S.purr + '%'; $('purrWord').textContent = purrWord(S.purr); }
  }, 1400);
}
function hearts(n){
  const st = $('stage');
  for(let i=0;i<n;i++){
    const h = document.createElement('div');
    h.className = 'heart'; h.textContent = pick(['\u2764\uFE0F','\uD83D\uDC9B','\u2728','\uD83D\uDC9A']);
    h.style.left = (18 + Math.random()*64) + '%';
    h.style.top  = (52 + Math.random()*18) + '%';
    h.style.animationDelay = (i*0.12) + 's';
    st.appendChild(h);
    setTimeout(()=>{ if(h.parentNode) h.parentNode.removeChild(h); }, 1500 + i*130);
  }
}
function petCat(){
  const st = $('stage');
  st.classList.remove('pet'); void st.offsetWidth; st.classList.add('pet');
  hearts(2);
  setPurr((S.purr||0) + 9);
  S.pets = (S.pets||0) + 1;
  $('roomNote').textContent = pick([
    'He leans into your hand.', 'A slow blink. That means he likes you.',
    'He is purring.', 'One ear flicks. He is listening.']);
  save(S);
}
function feed(t){
  if(coins() < t.cost){ $('roomNote').textContent = 'That costs ' + t.cost + ' coins. Answer a few more questions first.'; return; }
  S.coins = coins() - t.cost;
  S.fed = (S.fed||0) + 1;
  const st = $('stage');
  st.classList.remove('munch'); void st.offsetWidth; st.classList.add('munch');
  hearts(4);
  setPurr((S.purr||0) + t.purr);
  paintCoins(); paintShop(); save(S);
  $('roomNote').textContent = 'He polishes off the ' + t.name.toLowerCase() + '. ' + purrWord(S.purr) + '.';
}
function toggleWear(w){
  S.owned = S.owned || [];
  S.worn  = S.worn  || {head:null, eyes:null, neck:null};
  if(S.owned.indexOf(w.id) < 0){
    if(coins() < w.cost){ $('wearNote').textContent = 'The ' + w.name.toLowerCase() + ' costs ' + w.cost + ' coins. Not quite there yet.'; return; }
    S.coins = coins() - w.cost;
    S.owned.push(w.id);
    S.worn[w.slot] = w.id;
    $('wearNote').textContent = 'Bought the ' + w.name.toLowerCase() + '. He is wearing it now.';
  } else {
    S.worn[w.slot] = (S.worn[w.slot] === w.id) ? null : w.id;
    $('wearNote').textContent = S.worn[w.slot] ? w.name + ' on.' : w.name + ' off.';
  }
  paintCoins(); paintShop(); paintAcc(); save(S);
}
function paintAcc(){
  const worn = S.worn || {};
  $('accLayer').innerHTML = ['neck','head','eyes']
    .map(sl => worn[sl] ? (ACC_SVG[worn[sl]] || '') : '').join('');
}
function paintShop(){
  const tg = $('treatGrid'); tg.innerHTML = '';
  TREATS.forEach(t=>{
    const el = document.createElement('div');
    el.className = 'item' + (coins() < t.cost ? ' locked' : '');
    el.innerHTML = '<span class="ico">'+t.icon+'</span><span class="nm">'+esc(t.name)+
                   '</span><span class="pr">\uD83E\uDE99 '+t.cost+'</span>';
    el.onclick = ()=> feed(t);
    tg.appendChild(el);
  });
  const wg = $('wearGrid'); wg.innerHTML = '';
  S.owned = S.owned || []; S.worn = S.worn || {head:null,eyes:null,neck:null};
  WEAR.forEach(w=>{
    const own = S.owned.indexOf(w.id) >= 0;
    const on  = S.worn[w.slot] === w.id;
    const el = document.createElement('div');
    el.className = 'item' + (on ? ' worn' : '') + (!own && coins() < w.cost ? ' locked' : '');
    el.innerHTML = '<span class="ico"><svg viewBox="0 0 100 100">'+ACC_SVG[w.id]+'</svg></span>'+
      '<span class="nm">'+esc(w.name)+'</span>'+
      '<span class="pr'+(own?' own':'')+'">'+(own ? (on ? 'wearing' : 'tap to wear') : '\uD83E\uDE99 '+w.cost)+'</span>';
    el.onclick = ()=> toggleWear(w);
    wg.appendChild(el);
  });
}
function showView(which){
  const room = which === 'room';
  $('viewMaths').style.display = room ? 'none' : '';
  $('viewRoom').style.display  = room ? '' : 'none';
  $('tabMaths').classList.toggle('on', !room);
  $('tabRoom').classList.toggle('on', room);
  if(room){ paintShop(); paintAcc(); setPurr(S.purr || 0); }
}

/* =========================================================
   RENDER — all local, no network on this path
   ========================================================= */
let pendingEl = null;
function scrollChat(){
  const last = $('thread').lastElementChild;
  if(last && typeof last.scrollIntoView === 'function'){
    try{ last.scrollIntoView({behavior:'smooth', block:'nearest'}); }catch(e){}
  }
}
function addMsg(who, text){
  const d = document.createElement('div');
  d.className = 'msg ' + (who==='kid' ? 'm-kid' : 'm-cat');
  d.textContent = text;
  if(who !== 'kid'){
    const b = document.createElement('button');
    b.className = 'speakbtn'; b.type = 'button';
    b.title = 'Read this aloud'; b.setAttribute('aria-label','Read this aloud');
    b.textContent = '\uD83D\uDD0A';
    b.onclick = ()=> speakNow(text);
    d.appendChild(b);
  }
  $('thread').appendChild(d);
  scrollChat();
  return d;
}
function showPending(){
  pendingEl = document.createElement('div');
  pendingEl.className = 'msg m-cat pending';
  pendingEl.innerHTML = '<span class="dots"><i></i><i></i><i></i></span>';
  $('thread').appendChild(pendingEl);
  scrollChat();
}
function resolvePending(text){
  if(pendingEl && pendingEl.parentNode){ pendingEl.parentNode.removeChild(pendingEl); }
  pendingEl = null;
  addMsg('cat', text);
}

const OPENERS = [
  'Read it twice. What are you asked to find?',
  'What do you know, and what do you need to work out?',
  'Start with the first sentence. What is it telling you?',
  'Which quantities are related? A number can be extra information; explain before calculating.'
];
const FIG_OPENER = 'Look at the figure first, then read the question.';
function opener(q){ return q.fig ? FIG_OPENER : pick(OPENERS); }

function renderQuestion(customQuestion){
  questionEpoch++;
  if(activeTutorController) activeTutorController.abort();
  queue.length=0;
  currentGen = customQuestion ? null : chooseGenerator();
  current = customQuestion || currentGen();
  if(!customQuestion && selectedStudy?.stretch)current.stretch=true;
  settled = false; revealed = false; askCount = 0; tryCount = 0;
  history = [];   // the chat is scoped to the question on screen
  S.tick++; S.lastSeen[current.topic] = S.tick;

  $('qTopicName').textContent = current.topic;
  const n = current.stars || 2;
  $('qDiff').innerHTML = Array.from({length:5},(_,i)=>`<i class="${i<n?'on':''}"></i>`).join('');
  $('qNum').textContent = 'Q' + (S.done+1);
  $('qText').textContent = current.text;
  $('figBox').innerHTML = current.fig || '';

  const inp = $('answerInput');
  inp.value=''; inp.disabled=false;
  $('aBox').className='abox';
  $('aPre').style.display = current.prefix ? '' : 'none';
  $('aPre').textContent = current.prefix || '';
  $('aSuf').style.display = current.suffix ? '' : 'none';
  $('aSuf').textContent = current.suffix || '';

  $('verdict').className='verdict';
  $('checkBtn').style.display='';
  $('nextBtn').style.display='none';
  $('bm').className='bm';
  $('steps').className='steps'; $('steps').innerHTML='';
  $('modelBtn').style.display = current.bar ? '' : 'none';

  $('thread').innerHTML='';
  pendingEl = null;

  wkReset();
  setCat('settled');
  addMsg('cat', opener(current));   // instant, local — no API call here
  drawPaws(false);
  studyNewQuestion();
}

function drawBar(){
  if(!current.bar) return;
  if(studyAttempt&&!settled) studyAttempt.model=true;
  const strip = $('strip'); strip.innerHTML='';
  current.bar.segments.forEach((s,i)=>{
    const el = document.createElement('div');
    el.className='seg';
    el.style.flex = String(Math.max(0.06, s.w));
    el.style.background = s.fill;
    el.style.animationDelay = (i*0.11)+'s';
    el.textContent = s.label;
    strip.appendChild(el);
  });
  $('bmcap').textContent = current.bar.caption;
  $('bm').className='bm show';
}

function showSteps(){
  if(current.custom){localSay('Ask me for a worked explanation, then check it with another method.');return;}
  if(studyAttempt&&!settled) studyAttempt.revealed=true;
  const box = $('steps'); box.innerHTML='';
  current.steps.forEach((t,i)=>{
    const row = document.createElement('div'); row.className='step';
    row.style.animationDelay = (i*0.09)+'s';
    const a = document.createElement('div'); a.className='sn'; a.textContent = i+1;
    const b = document.createElement('div'); b.className='st'; b.textContent = t;
    row.appendChild(a); row.appendChild(b); box.appendChild(row);
  });
  box.className='steps show';
  revealed = true;
  $('nextBtn').style.display='';
  $('studyReflection').hidden=false;
}

/* =========================================================
   ANSWER FLOW — verdict is instant, the cat catches up after
   ========================================================= */
function submit(){
  if(settled||!current||current.custom)return;
  const raw=current.parts?current.parts.map((p,i)=>$('partAnswer'+i).value.trim()):$('answerInput').value.trim();
  if(Array.isArray(raw)?raw.some(v=>!v):!raw)return;
  const outcomes=current.parts?current.parts.map((p,i)=>isCorrect(raw[i],p)):[isCorrect(raw,current)];
  const ok=outcomes.every(Boolean);
  studyAttempt.tries++;
  if(studyAttempt.tries===1){studyAttempt.firstCorrect=ok;studyAttempt.confidence=$('studyConfidence').value;}
  studyAttempt.response=Array.isArray(raw)?raw.join(' | '):raw;
  studyAttempt.correct=ok;studyAttempt.partResults=outcomes;
  studyAttempt.plan=studyPlanText();studyAttempt.obstacle=$('studyObstacle').value;
  tryCount++;
  if(studyAttempt.tries===1){S.done++;const m=S.mastery[current.topic]||(S.mastery[current.topic]={a:0,c:0});m.a++;if(ok){S.right++;m.c++;}}
  const v=$('verdict');v.className='verdict show '+(ok?'good':'bad');
  v.textContent=ok?'Correct. How can you check or explain why it works?':current.parts?'Check '+outcomes.map((x,i)=>!x?'part '+(i+1):'').filter(Boolean).join(' and ')+'. You can revise your answer.':'Not yet. You can revise your answer. What could you check first?';
  $('aBox').className='abox '+(ok?'ok':'bad');
  $('nextBtn').style.display='';
  $('studyReflection').hidden=false;
  if(ok){
    settled=true;
    const independent=studyAttempt.firstCorrect&&!studyAttempt.hints&&!studyAttempt.revealed&&!studyAttempt.model&&studyAttempt.confidence!=='guess';
    if(independent){S.streak++;S.best=Math.max(S.best,S.streak);addCoins(2+(S.streak%5===0?5:0));}
    else S.streak=0;
    $('answerInput').disabled=true;$('checkBtn').style.display='none';
    document.querySelectorAll('#studyParts input,#studyChoices button').forEach(el=>el.disabled=true);
  }else{S.streak=0;}
  save(S);setCat(ok?'pleased':'unsure');drawPaws(ok);
  askMochi(ok?'praise':'wrong',Array.isArray(raw)?raw.join(' | '):raw);
}



/* ============================================================
   SCOPE AND OFFLINE
   Two rules: she can only ask about the question on screen,
   and losing the connection must not leave her with nothing.
   ============================================================ */
function keyReady(){ return !!apiKey(); }
function netReady(){ return (navigator.onLine !== false) && keyReady(); }

/* --- the topic gate runs here, before a single token is spent --- */
const HELP_PHRASES = ['help','stuck','hint','explain','why','how do','how to','how does','how many',
 'what do i','what does','what is this','i dont',"i don't",'dont get',"don't get",'do not get','get it',
 'dont understand',"don't understand",'do not understand','dont know',"don't know",'do not know',
 'no idea','no clue','not sure','confused','makes no sense','where do i','start','next','again','show me',
 'what now','lost','huh','pardon','check','is that right','am i right','simpler','slower','easier',
 'repeat','say that','mean','more','still','wrong','right','sure'];
const MATH_WORDS = ['add','plus','sum','subtract','minus','take away','times','multiply','divide',
 'fraction','numerator','denominator','ratio','unit','part','whole','percent','decimal','average',
 'total','remainder','angle','degree','triangle','straight','circle','radius','diameter','circumference',
 'area','perimeter','volume','litre','liter','speed','distance','time','bar model','step','method',
 'working','answer','equation','calculate','work out','solve','maths','math','number','question','figure'];

const STOP = new Set(('what when where which whose that this these those with from have has had they them '+
 'their there then than will would could should about after before into over under many much more most some '+
 'each every other another also been being does doing done just like make makes made only same such take took '+
 'very were your yours mine ours here want wants need needs give gives given find finds found tell tells told '+
 'know knows think thing things time times good best better first last next thin same please').split(' '));

function onTopic(msg){
  const t = ' ' + String(msg).toLowerCase().trim() + ' ';
  if(t.trim().length < 3) return true;                        // "?" or "ok"
  if(t.trim().split(/\s+/).length <= 3) return true;          // "huh", "still stuck", "why not"

  if(/\d/.test(t)) return true;                               // any number
  if(/[+\-\u00d7\u00f7*\/=%]/.test(t)) return true;           // any operator
  if(HELP_PHRASES.some(p=>t.indexOf(p) > -1)) return true;
  if(MATH_WORDS.some(w=>t.indexOf(w) > -1)) return true;
  // Overlap with the question only counts on distinctive words. Ordinary English
  // like "what" or "many" appears in almost every question and would wave anything through.
  const q = new Set((current.text + ' ' + current.steps.join(' ') + ' ' + current.topic)
    .toLowerCase().split(/[^a-z']+/).filter(w=>w.length > 3 && !STOP.has(w)));
  return t.split(/[^a-z']+/).filter(w=>w.length > 3 && !STOP.has(w)).some(w=>q.has(w));
}
const REDIRECTS = [
  'I can only help with the maths question on the screen. Which part of it is giving you trouble?',
  'That one is outside what I do \u2014 I only know the question in front of you. Where are you stuck on it?',
  'I stick to the maths on this page. Shall we look at the question again?'
];

/* A maths app is the wrong place for this, and brushing it aside would be worse. */
const CONCERN = ['kill myself','want to die','wanna die','hurt myself','hurting myself','hate myself',
 'end it all','cut myself','self harm','worthless','nobody likes me','no one likes me','everyone hates me',
 'want to disappear'];
function concerning(msg){
  const t = String(msg).toLowerCase();
  return CONCERN.some(p=>t.indexOf(p) > -1);
}
/* A child asking what she is talking to deserves a straight answer, every time.
   Answered here so no model can get it wrong and no call is needed. */
const IDENTITY = ['are you real','are you alive','are you a real','a real cat','are you human',
 'are you a person','are you a robot','are you a computer','are you ai','are you an ai','are you a bot',
 'are you chatgpt','are you claude','who made you','what are you','are u real','are u a real'];
function identityQ(msg){
  const t = String(msg).toLowerCase();
  return IDENTITY.some(p=>t.indexOf(p) > -1);
}
const IDENTITY_REPLY = 'I am a computer program that helps you with maths, drawn as a cat. Not a real one, I am afraid! Shall we get back to the question?';
const CONCERN_REPLY = 'That sounds really hard, and I am only a maths app, so I am not the right one to help with it. Please tell a grown-up you trust, like a parent or a teacher, as soon as you can. They will want to know.';

/* --- offline: a real hint ladder built from the worked solution --- */
const FIRST_NUDGE = {
  'Fractions':'Draw the whole amount as one long bar. What fraction is taken away first, and how much of the bar is left after that?',
  'Ratio':'Turn the ratio into units. How many units is each person, and how many units is the difference between them?',
  'Percentage':'Decide what counts as 100% in this question. Everything else is measured against that.',
  'Speed':'Write down which two of distance, speed and time you have been given. The missing one is what you are looking for.',
  'Algebra':'Replace the letter with the number you were given, then work it out like an ordinary sum.',
  'Circles':'Find the radius first. Then decide whether the question wants the space inside or the distance round the edge.',
  'Volume':'Volume is length times width times depth. Be careful to use the depth of the water, not the height of the tank.',
  'Angles':'Look for angles sitting on a straight line, or the three angles inside a triangle. Both of those add up to 180 degrees.',
  'Rate':'Work out what one unit costs or how long one unit takes first. Everything else follows from that.',
  'Measurement':'Decide which unit is bigger, then multiply or divide by 10, 100 or 1000.',
  'Time':'Count the whole hours first, then the extra minutes on each end.',
  'Data':'Read the numbers straight off the chart before you do any working.',
  'Money':'Work in cents if that is easier, then change back to dollars at the end.',
  'Average':'Averages always go through the total. Find the total first, then work from there.',
  'Whole numbers':'Read it twice. Write down what you are told, and underline what you are asked to find.',
  'Decimals':'Work in cents if that feels easier, then turn your answer back into dollars at the end.'
};

function localSay(text){ addMsg('cat', text); speak(text); }
function shortName(p){ return PROVIDERS[p].label.split(' ')[0]; }   // 'Claude' / 'ChatGPT'
/* Euna is talking to Mochi. Which engine is behind him is a grown-up's concern,
   so the only thing shown to her is whether he can talk at all. */
function updateNet(){
  if(typeof studioPaint==='function')studioPaint();
  const b = $('netBadge'); if(!b) return;
  const off = (USE.last === 'local') || !netReady();
  b.textContent = off ? 'offline' : '';
  b.className = 'netbadge' + (off ? ' show' : '');
  b.title = off ? (S.cat||'Mochi') + ' has no connection, so he is giving built-in hints' : '';
}
function markSource(local){
  if(local){ USE.local++; USE.last = 'local'; }
  else { const p = LAST.p || provider(); USE[p] = (USE[p]||0) + 1; USE.last = p;
         USE.ms[p] = (USE.ms[p]||0) + (LAST.ms||0); }
  updateNet();
}
function avgSecs(p){ return USE[p] ? (USE.ms[p]/USE[p]/1000).toFixed(1) + 's' : ''; }
function usageLine(){
  const now = USE.last === 'local' ? 'built-in hints (no model)'
            : USE.last ? PROVIDERS[USE.last].label + ' \u00b7 ' + (LAST.model || '')
            : 'nothing has answered yet';
  const bits = [];
  if(USE.anthropic) bits.push(USE.anthropic + ' from Claude (avg ' + avgSecs('anthropic') + ')');
  if(USE.openai)    bits.push(USE.openai + ' from ChatGPT (avg ' + avgSecs('openai') + ')');
  if(USE.local)     bits.push(USE.local + ' local');
  const acc = S.done ? Math.round((S.right/S.done)*100) + '%' : '\u2014';
  const work = S.done + ' answered, ' + acc + ' correct, best streak ' + S.best + '.';
  if(!bits.length) return 'Answering: ' + now + '. ' + work;
  return 'Answering: ' + now + '. Replies: ' + bits.join(', ') + '. ' + work;
}
window.addEventListener('online',  updateNet);
window.addEventListener('offline', updateNet);

/* ============================================================
   MODEL PROVIDERS
   The tutor's voice is swappable. Everything that decides
   right from wrong stays in JavaScript either way.
   ============================================================ */
const PROVIDERS = {
  anthropic: { label:'Claude (Anthropic)', defaultModel:'claude-sonnet-5', defaultRead:'claude-sonnet-5', keyHint:'sk-ant-...' },
  openai:    { label:'ChatGPT (OpenAI)',   defaultModel:'gpt-5.6-terra',     defaultRead:'gpt-5.6-terra',     keyHint:'sk-...' }
};
function provider(){ return S.provider === 'openai' ? 'openai' : 'anthropic'; }
function apiKey(p){ return String((S.keys && S.keys[p || provider()]) || '').trim(); }
function normModel(v){ return String(v || '').trim().toLowerCase().replace(/\s+/g, '-'); }
function modelName(p){
  p = p || provider();
  return String((S.models && S.models[p]) || '').trim() || PROVIDERS[p].defaultModel;
}
/* Reading her handwriting is a different job from talking: it wants vision quality,
   not speed, and it happens far less often. It gets its own model. */
function readModel(p){
  p = p || provider();
  return String((S.readModels && S.readModels[p]) || '').trim() || modelName(p) || PROVIDERS[p].defaultRead;
}

let LAST = {p:null, model:null, at:0, ms:0};
const USE = {anthropic:0, openai:0, local:0, last:null, ms:{anthropic:0, openai:0}};

async function callModel(opts, signal){
  const t0 = Date.now();
  const as = opts.as || {};
  const p     = as.p     || provider();
  const key   = (as.key !== undefined) ? as.key : apiKey(p);
  const model = as.model || (opts.reading ? readModel(p) : modelName(p));
  const maxTok = opts.maxTokens || 900;

  if(p === 'anthropic'){
    const msgs = opts.messages.map(m=>({role:m.role, content:m.content}));
    if(opts.image){
      const last = msgs[msgs.length-1];
      last.content = [{type:'image', source:{type:'base64', media_type:'image/png', data:opts.image}},
                      {type:'text', text:last.content}];
    }
    const h = {'Content-Type':'application/json'};
    if(key){ h['x-api-key']=key; h['anthropic-version']='2023-06-01'; h['anthropic-dangerous-direct-browser-access']='true'; }
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method:'POST', headers:h, signal,
      body: JSON.stringify({model, max_tokens:maxTok, system:opts.system, messages:msgs})
    });
    if(!r.ok) throw new Error('HTTP '+r.status+' '+(await r.text()).slice(0,160));
    const d = await r.json();
    LAST = {p, model, at:Date.now(), ms:Date.now()-t0};
    return (d.content||[]).filter(b=>b.type==='text').map(b=>b.text).join('\n').trim();
  }

  // OpenAI: system goes in the message list, and images use image_url.
  const msgs = [{role:'system', content:opts.system}]
    .concat(opts.messages.map(m=>({role:m.role, content:m.content})));
  if(opts.image){
    const last = msgs[msgs.length-1];
    last.content = [{type:'text', text:last.content},
                    {type:'image_url', image_url:{url:'data:image/png;base64,'+opts.image}}];
  }
  const send = (field, effort)=>{
    const body = {model, messages:msgs};
    body[field] = maxTok;
    // The model is handed the answer and the working, so it has nothing to reason out.
    // Left at the default the GPT-5.6 tiers think before every reply, which is pure waiting.
    if(effort) body.reasoning_effort = 'low';
    return fetch('https://api.openai.com/v1/chat/completions', {
      method:'POST', signal,
      headers:{'Content-Type':'application/json','Authorization':'Bearer '+key},
      body: JSON.stringify(body)
    });
  };
  // Newer models want max_completion_tokens and accept reasoning_effort; older ones want
  // max_tokens and reject both. Step down until one is accepted.
  let r = await send('max_completion_tokens', true);
  if(r.status === 400) r = await send('max_completion_tokens', false);
  if(r.status === 400) r = await send('max_tokens', false);
  if(!r.ok) throw new Error('HTTP '+r.status+' '+(await r.text()).slice(0,160));
  const d = await r.json();
  LAST = {p, model, at:Date.now(), ms:Date.now()-t0};
  return String((d.choices && d.choices[0] && d.choices[0].message && d.choices[0].message.content) || '').trim();
}

/* =========================================================
   THE TALKING LAYER
   ========================================================= */

function userTurn(kind, extra){
  if(kind==='wrong')  return `Euna answered "${extra}", which is wrong. Use her supplied working as evidence. If the cause is unclear, ask a diagnostic question; do not invent her method or label a misconception. Do not give the answer.`;
  if(kind==='praise') return `Euna answered "${extra}", which is correct. In one or two sentences, confirm the answer, then ask her to justify it or check using another method; do not assume which method she used.`;
  return extra;   // 'free' and 'working' pass their text straight through
}

let askCount = 0;
let tryCount = 0;         // attempts of her own on this question

/* A worked example minted by the SAME generator: same shape, different numbers,
   correct by construction. A model asked to invent one can get the sums wrong. */
function twinExample(){
  if(!currentGen || !current) return null;
  // numbers in the figure count too: some questions carry them only there
  const numsOf = q => (String(q.text + ' ' + (q.figDesc||'')).match(/\d+(?:\.\d+)?/g) || []);
  const pool = [];
  for(let i=0;i<40;i++){ let q; try{ q = currentGen(); }catch(e){ break; } if(q) pool.push(q); }
  if(!pool.length) return null;
  // a number in EVERY sample is structural (pi as 22/7, a 20-cent coin), not hers
  let constant = new Set(numsOf(pool[0]));
  pool.forEach(q=>{ const s2 = new Set(numsOf(q)); constant = new Set([...constant].filter(n=>s2.has(n))); });
  const hers = new Set(numsOf(current).filter(n=>!constant.has(n)));
  let best = null;
  for(const q of pool){
    if(q.text === current.text) continue;
    if(Math.abs(q.answer - current.answer) < 0.005) continue;   // never hand her her own answer
    const mine = numsOf(q).filter(n=>!constant.has(n));
    const shared = mine.filter(n=>hers.has(n)).length;
    const fresh = mine.length ? 1 - shared/mine.length : 0.5;
    if(fresh >= 0.75) return q;
    if(!best || fresh > best.fresh) best = {q, fresh};
  }
  return best && best.fresh >= 0.5 ? best.q : null;
}

let busy = false;
const queue = [];
async function askMochi(kind, extra){
  if(kind === 'free'){
    if(concerning(extra)){ localSay(CONCERN_REPLY); return; }      // never routed to a model
    if(identityQ(extra)){ localSay(IDENTITY_REPLY); return; }       // answered honestly, locally
    if(!onTopic(extra)){ localSay(pick(REDIRECTS)); return; }      // never costs a call
  }
  if(busy){ if(queue.length < 3) queue.push({kind, extra,epoch:questionEpoch}); return; }
  busy = true;
  if(kind === 'free' || kind === 'working'){askCount++;if(studyAttempt&&!settled) studyAttempt.hints++;}
  if(!netReady()){ localSay(offlineReply(kind)); busy = false; markSource(true); return; }
  if(kind === 'free' || kind === 'working') setCat('curious');

  const turn = userTurn(kind, extra);
  history.push({role:'user', content:turn});

  showPending();
  const ctrl = new AbortController();
  const epoch=questionEpoch;activeTutorController=ctrl;
  const timer = setTimeout(()=> ctrl.abort(), 30000);   // never hang the UI
  try{
    const text = await callModel({
      system: systemPrompt(),
      messages: history.slice(-14),
      maxTokens: 1600
    }, ctrl.signal);
    if(epoch!==questionEpoch)return;
    if(!text) throw new Error('empty');
    resolvePending(text);
    history.push({role:'assistant', content:text});
    speak(text);
    markSource(false);
  } catch(err){
    if(epoch!==questionEpoch)return;
    const fb = offlineReply(kind);
    resolvePending(fb);
    history.pop();
    speak(fb);
    markSource(true);
  } finally {
    clearTimeout(timer);
    busy = false;
    if(activeTutorController===ctrl)activeTutorController=null;
    if(queue.length){const q=queue.shift();setTimeout(()=>{if(q.epoch===questionEpoch)askMochi(q.kind,q.extra);},20);}
  }
}

function fallbackLine(kind){
  if(kind==='praise') return "That is correct. Look at the working below and check that your method matches it.";
  if(kind==='wrong')  return "Not quite. Read the question again and underline what it is asking you to find, then try the first step once more. Tap Show the working when you want to see it.";
  return "Start with the first sentence. What are you told, and what are you asked to find? Tap Draw the model if a picture would help.";
}

function speakNow(text){                    // explicit tap: always speaks
  if(!('speechSynthesis' in window)) return;
  try{
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(String(text).replace(/[—–]/g,', '));
    u.rate = 0.98; u.pitch = 1.05;
    speechSynthesis.speak(u);
  }catch(e){}
}
function speak(text){ if(S.voice) speakNow(text); }   // automatic: only if she turned it on

/* ============================================================
   Deterministic checker for a line of handwritten working.
   No eval(). The model transcribes; this decides.
   ============================================================ */
function normMath(s){
  let t = ' ' + String(s) + ' ';
  t = t.replace(/(\d),(?=\d{3}\b)/g,'$1');                       // 1,200 -> 1200
  t = t.replace(/[×✕✖·⋅]/g,'*').replace(/[÷]/g,'/').replace(/[−–—]/g,'-');
  t = t.replace(/(\d)\s*[xX]\s*(?=[\d(])/g,'$1*');               // 5 x 3, but never algebra x
  t = t.replace(/\bof\b/gi,'*');
  t = t.replace(/\$/g,'');
  t = t.replace(/(\d+(?:\.\d+)?)\s*%/g,'($1/100)');              // 60% -> (60/100)
  t = t.replace(/\b(\d+)\s+(\d+)\s*\/\s*(\d+)\b/g,'($1+$2/$3)'); // mixed number 2 1/2
  t = t.replace(/\b(km\/h|m\/s|cm³|cm3|cm²|cm2|m²|m2|litres|litre|kg|ml|km|cm|mm|hrs|hours|hour|mins|min|sweets|stickers|pupils|children|boys|girls|marbles|beads|cards|pens|books|units|unit)\b/gi,' ');
  t = t.replace(/[°]/g,' ');
  return t.trim();
}

function parseExpr(src){
  const t = normMath(src);
  if(!/\d/.test(t)) return NaN;
  if(/[a-zA-Z]/.test(t)) return NaN;        // leftover words: not pure arithmetic
  let i = 0;
  const ws = ()=>{ while(i<t.length && /\s/.test(t[i])) i++; };
  function factor(){
    ws();
    if(t[i]==='-'){ i++; return -factor(); }
    if(t[i]==='+'){ i++; return factor(); }
    if(t[i]==='('){ i++; const v=expr(); ws(); if(t[i]!==')') return NaN; i++; return v; }
    const m = /^\d+(\.\d+)?/.exec(t.slice(i));
    if(!m) return NaN;
    i += m[0].length;
    return Number(m[0]);
  }
  function term(){
    let v = factor(); ws();
    while(i<t.length && (t[i]==='*' || t[i]==='/')){
      const op = t[i++]; const r = factor();
      v = op==='*' ? v*r : v/r; ws();
    }
    return v;
  }
  function expr(){
    let v = term(); ws();
    while(i<t.length && (t[i]==='+' || t[i]==='-')){
      const op = t[i++]; const r = term();
      v = op==='+' ? v+r : v-r; ws();
    }
    return v;
  }
  const v = expr(); ws();
  if(i < t.length) return NaN;              // trailing junk we did not understand
  return Number.isFinite(v) ? v : NaN;
}

/* status: ok | round | wrong | unread | note */
function checkLine(raw){
  const s = String(raw==null?'':raw).trim();
  if(!s) return {status:'note', text:s};
  if(/^\[.*\]$/.test(s)) return {status:'note', text:s};          // [bar model]
  if(!s.includes('=')){
    const v = parseExpr(s);
    return {status:'note', text:s, value:Number.isNaN(v)?null:v};
  }
  const parts = s.split('=').map(p=>p.trim()).filter(p=>p.length);
  if(parts.length < 2) return {status:'note', text:s};
  const vals = parts.map(parseExpr);
  if(vals.some(v=>Number.isNaN(v))) return {status:'unread', text:s};
  let status = 'ok';
  for(let k=0;k<vals.length-1;k++){
    const a = vals[k], b = vals[k+1];
    const tight = Math.max(1e-6, Math.abs(a)*1e-9);
    const loose = Math.max(0.02, Math.abs(a)*0.002);   // tolerate her rounding, not her slips
    if(Math.abs(a-b) > loose) return {status:'wrong', text:s, value:vals[vals.length-1], vals};
    if(Math.abs(a-b) > tight) status = 'round';
  }
  return {status, text:s, value:vals[vals.length-1], vals};
}

function checkWorking(lines, answer){
  const rows = (lines||[]).map(checkLine);
  const firstWrong = rows.findIndex(r=>r.status==='wrong');
  let final = null;
  for(let k=rows.length-1;k>=0;k--){
    if(rows[k].value!=null && !Number.isNaN(rows[k].value)){ final = rows[k].value; break; }
  }
  const reaches = final!=null && answer!=null && typeof answer==='number' && isCorrect(String(final),{answer});
  return {rows, firstWrong, final, reaches};
}

/* ============================================================
   THE WORKING PAD
   Strokes -> the model transcribes -> JavaScript grades.
   Recognition is perception, so the model does it.
   Marking is judgement, so it stays here.
   ============================================================ */
const WK = {strokes:[], cur:null, erase:false, penOnly:false, cv:null, ctx:null, ok:false, lines:[]};

function wkInit(){
  const cv = $('wkCanvas'); if(!cv) return;
  WK.cv = cv;
  try{ WK.ctx = cv.getContext('2d'); }catch(e){ WK.ctx = null; }
  if(!WK.ctx){ $('wkHint').textContent = 'Handwriting is not available in this browser.'; $('wkCheck').disabled = true; return; }
  WK.ok = true;
  wkResize();
  cv.addEventListener('pointerdown', wkDown);
  cv.addEventListener('pointermove', wkMove);
  cv.addEventListener('pointerup', wkUp);
  cv.addEventListener('pointercancel', wkUp);
  try{ new ResizeObserver(()=>{ wkResize(); wkRedraw(); }).observe(cv); }
  catch(e){ window.addEventListener('resize', ()=>{ wkResize(); wkRedraw(); }); }
}
function wkResize(){
  const cv = WK.cv, c = WK.ctx; if(!cv || !c) return;
  const r = cv.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  cv.width  = Math.max(1, Math.round((r.width  || 600) * dpr));
  cv.height = Math.max(1, Math.round((r.height || 300) * dpr));
  c.setTransform(dpr,0,0,dpr,0,0);
  c.lineCap = 'round'; c.lineJoin = 'round';
}
function wkPos(e){
  const r = WK.cv.getBoundingClientRect();
  return {x:e.clientX-r.left, y:e.clientY-r.top, p:(e.pressure && e.pressure>0) ? e.pressure : 0.5};
}
function wkDown(e){
  if(!WK.ok) return;
  if(e.pointerType === 'pen' && !WK.penOnly){ WK.penOnly = true; $('wkPenOnly').classList.add('on'); }
  if(WK.penOnly && e.pointerType === 'touch') return;
  e.preventDefault();
  try{ WK.cv.setPointerCapture(e.pointerId); }catch(err){}
  WK.cur = {pts:[wkPos(e)], erase:WK.erase};
  WK.strokes.push(WK.cur);
  wkRedraw();
}
function wkMove(e){
  if(!WK.ok || !WK.cur) return;
  if(WK.penOnly && e.pointerType === 'touch') return;
  e.preventDefault();
  WK.cur.pts.push(wkPos(e));
  wkRedraw();
}
function wkUp(e){
  if(!WK.cur) return;
  WK.cur = null;
  try{ WK.cv.releasePointerCapture(e.pointerId); }catch(err){}
}
function wkStroke(s){
  const c = WK.ctx;
  c.globalCompositeOperation = s.erase ? 'destination-out' : 'source-over';
  c.strokeStyle = '#2A1F1A';
  if(s.pts.length === 1){
    c.beginPath(); c.arc(s.pts[0].x, s.pts[0].y, s.erase ? 12 : 1.9, 0, 6.3);
    c.fillStyle = '#2A1F1A'; c.fill();
  }
  for(let i=1;i<s.pts.length;i++){
    const a = s.pts[i-1], b = s.pts[i];
    c.lineWidth = s.erase ? 24 : Math.max(1.6, 3.4*(0.5 + b.p));
    c.beginPath(); c.moveTo(a.x,a.y); c.lineTo(b.x,b.y); c.stroke();
  }
  c.globalCompositeOperation = 'source-over';
}
function wkRedraw(){
  const c = WK.ctx; if(!c) return;
  c.save(); c.setTransform(1,0,0,1,0,0);
  c.clearRect(0,0,WK.cv.width,WK.cv.height); c.restore();
  WK.strokes.forEach(wkStroke);
}
function wkReset(){
  WK.strokes = []; WK.cur = null; WK.lines = [];
  wkRedraw();
  $('wkLines').innerHTML = '';
  $('wkSum').className = 'wksum';
  $('wkHint').textContent = 'Write out your steps, then I will read them back to you.';
  $('wkCheck').disabled = !WK.ok;
}
function wkInk(){ return WK.strokes.reduce((n,s)=> n + (s.erase?0:s.pts.length), 0); }

/* white background, capped width — the model reads line art better and it costs fewer tokens */
function wkToPng(maxW){
  const src = WK.cv;
  const sc = Math.min(1, maxW/src.width);
  const w = Math.max(1,Math.round(src.width*sc)), h = Math.max(1,Math.round(src.height*sc));
  const out = document.createElement('canvas'); out.width = w; out.height = h;
  const c = out.getContext('2d');
  c.fillStyle = '#ffffff'; c.fillRect(0,0,w,h);
  c.drawImage(src,0,0,w,h);
  return out.toDataURL('image/png');
}

const TRANSCRIBE = [
  "You are transcribing a child's handwritten mathematics working from an image.",
  "",
  "Reply with ONLY a JSON object and nothing else. No preamble, no markdown fences:",
  '{"lines": ["...", "..."]}',
  "",
  "Rules:",
  "- Transcribe EXACTLY what is written, including any mistakes. Never correct arithmetic. Never finish incomplete work. Never add a line she did not write.",
  "- One array entry per line of working, in the order they appear on the page.",
  "- Write fractions inline as a/b. Write a mixed number as 'a b/c'.",
  "- Use * for multiplication and / for division, and keep every = sign she wrote.",
  "- Keep dollar signs and units as written.",
  "- If a line is a label or a drawing rather than a calculation, transcribe any words, and describe a drawing in square brackets such as [bar model].",
  "- If part of a line is illegible, put ? where the illegible part is.",
  '- If the page is blank, reply with {"lines": []}.'
].join("\n");

function wkLabel(st){
  return st==='ok' ? 'correct' : st==='round' ? 'rounded' : st==='wrong' ? 'ARITHMETIC ERROR'
       : st==='unread' ? 'could not be read' : 'note';
}
function wkGlyph(st){
  return st==='ok' ? '\u2713' : st==='round' ? '\u2248' : st==='wrong' ? '\u2715'
       : st==='unread' ? '?' : '\u2022';
}

function wkRenderLines(){
  const box = $('wkLines'); box.innerHTML = '';
  const res = checkWorking(WK.lines, current ? current.answer : null);
  res.rows.forEach((r,i)=>{
    const row = document.createElement('div');
    row.className = 'ln' + (r.status==='wrong' ? ' bad' : '');
    const st = document.createElement('span');
    st.className = 'lnst ' + r.status;
    st.textContent = wkGlyph(r.status);
    st.title = wkLabel(r.status);
    const inp = document.createElement('input');
    inp.className = 'lnin'; inp.value = r.text;
    inp.setAttribute('aria-label','Working line '+(i+1));
    inp.addEventListener('input', ()=>{ WK.lines[i] = inp.value; });
    inp.addEventListener('change', ()=>wkRenderLines());
    row.appendChild(st); row.appendChild(inp); box.appendChild(row);
  });

  const sum = $('wkSum');
  if(!res.rows.length){ sum.className = 'wksum'; return res; }
  if(res.firstWrong >= 0){
    sum.className = 'wksum show bad';
    sum.innerHTML = 'Line ' + (res.firstWrong+1) + ' does not work out.' +
      '<small>This flags arithmetic only. Earlier steps may still need a check of their meaning.</small>';
  } else if(res.reaches){
    sum.className = 'wksum show good';
    sum.innerHTML = 'The final value matches. Check the meaning and units of each step too.' +
      '<small>If a line looks wrong above, it is because I misread your writing \u2014 tap it and correct it.</small>';
  } else {
    sum.className = 'wksum show bad';
    sum.innerHTML = 'No definite arithmetic error was detected; this may be unfinished or partly unreadable.' +
      '<small>A correct calculation alone cannot verify a method. Explain what each quantity means.</small>';
  }
  return res;
}

async function wkCheckNow(){
  if(!WK.ok || busy) return;
  if(wkInk() < 6){ $('wkHint').textContent = 'Write some working on the page first.'; return; }
  if(!netReady()){
    $('wkHint').textContent = 'I need a connection to read handwriting. Tap Type a line and I will still check every line you enter.';
    return; }
  $('wkCheck').disabled = true;
  $('wkHint').textContent = 'Reading your handwriting\u2026';

  const png = wkToPng(1000);
  const b64 = png.split(',')[1];
  const ctrl = new AbortController();
  const epoch=questionEpoch;
  const timer = setTimeout(()=> ctrl.abort(), 40000);
  try{
    let text = await callModel({
      system: 'You transcribe handwriting. You reply with JSON and nothing else.',
      messages: [{role:'user', content: TRANSCRIBE +
        "\n\nFor context only, the question is: " + (current ? current.text : "") +
        "\nDo not use the question to guess at what should be written. Transcribe only what you can actually see."}],
      image: b64,
      maxTokens: 900,
      reading: true
    }, ctrl.signal);
    if(epoch!==questionEpoch)return;
    text = text.replace(/```json/gi,'').replace(/```/g,'').trim();
    const m = text.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(m ? m[0] : text);
    if(!parsed || !Array.isArray(parsed.lines)) throw new Error('shape');
    WK.lines = parsed.lines.map(l=>String(l));
    if(!WK.lines.length){ $('wkHint').textContent = 'I could not find any working on the page.'; return; }
    $('wkHint').textContent = 'Check the transcription before trusting the feedback. Tap a line to correct it.';
    tryCount++;
    markSource(false);
    const result = wkRenderLines();

    // offer the value she reached, but never submit it for her
    if(!settled && result.final != null && !$('answerInput').value.trim()){
      $('answerInput').value = String(result.final);
    }
    wkTellCat(result);
  } catch(err){
    if(epoch!==questionEpoch)return;
    $('wkHint').textContent = (err && err.name === 'AbortError')
      ? 'That took too long. Your working is still on the page \u2014 try again.'
      : 'I could not read the page just now. Your working is still here, and you can carry on without me.';
  } finally {
    clearTimeout(timer);
    $('wkCheck').disabled = false;
  }
}

function wkTellCat(res){
  if(!res.rows.length) return;
  const listing = res.rows.map((r,i)=> (i+1)+'. '+r.text+'   ['+wkLabel(r.status)+']').join('\n');
  const diagnosis = res.firstWrong >= 0
    ? 'Line ' + (res.firstWrong+1) + ' has a detected arithmetic mismatch. Other lines are not necessarily valid method steps.'
    : res.reaches
      ? 'The final numeric value matches. This does not verify the reasoning or unreadable lines.'
      : 'No definite arithmetic mismatch was detected. The working could be unfinished, unreadable or based on an unsuitable method. Ask before diagnosing.';
  askMochi('working',
    'Euna wrote out her working by hand. This is what she wrote:\n' + listing +
    '\n\n' + diagnosis +
    '\n\nIn two or three sentences, point her at the exact line that needs attention and ask one question that helps her fix it herself. Do not give the answer.');
}

/* =========================================================
   WIRING
   ========================================================= */
$('checkBtn').onclick = submit;
$('answerInput').addEventListener('keydown', e=>{ if(e.key==='Enter'){ e.preventDefault(); submit(); } });
$('nextBtn').onclick = ()=> renderQuestion();
$('modelBtn').onclick = ()=> drawBar();
$('workingBtn').onclick = ()=>{
  showSteps();
  studyCommit(true);
  if(!settled){
    settled = true;
    $('answerInput').disabled = true;
    $('checkBtn').style.display='none';
    $('nextBtn').style.display='';
    S.streak = 0; drawPaws(false); setCat('settled');
  }
};

function sendChat(){
  const t = $('chatInput').value.trim().slice(0,3000);
  if(!t) return;
  $('chatInput').value='';
  addMsg('kid', t);
  askMochi('free', t);
}
$('sendBtn').onclick = sendChat;
$('chatInput').addEventListener('keydown', e=>{ if(e.key==='Enter'){ e.preventDefault(); sendChat(); } });
document.querySelectorAll('.chip').forEach(b=>{
  b.onclick = ()=>{ addMsg('kid', b.dataset.ask); askMochi('free', b.dataset.ask); };
});

function updateVoiceBtn(){
  const b = $('voiceBtn');
  b.classList.toggle('off', !S.voice);
  b.textContent = S.voice ? '🔊' : '🔇';
  b.title = S.voice ? 'Reading every reply aloud — tap to silence'
                    : 'Silent — tap the speaker on any reply to hear just that one';
}
$('voiceBtn').onclick = ()=>{
  S.voice = !S.voice;
  updateVoiceBtn();
  if(!S.voice && 'speechSynthesis' in window) speechSynthesis.cancel();
  save(S);
};

/* ---------- room ---------- */
$('tabMaths').onclick = ()=> showView('maths');
$('tabRoom').onclick  = ()=> showView('room');
$('petBtn').onclick   = ()=> petCat();
$('stage').onclick    = ()=> petCat();
$('stage').addEventListener('keydown', e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); petCat(); } });

/* ---------- working pad ---------- */
$('wkCheck').onclick = ()=> wkCheckNow();
$('wkAdd').onclick = ()=>{                       // works with no connection at all
  tryCount++;
  WK.lines = (WK.lines||[]).concat(['']);
  wkRenderLines();
  const rows = $('wkLines').children;
  if(rows.length) rows[rows.length-1].querySelector('.lnin').focus();
  $('wkHint').textContent = 'Type a line like  2/5 x 150 = 60  and I will check it, connection or not.';
};
$('wkPen').onclick = ()=>{ WK.erase=false; $('wkPen').classList.add('on'); $('wkErase').classList.remove('on'); };
$('wkErase').onclick = ()=>{ WK.erase=true; $('wkErase').classList.add('on'); $('wkPen').classList.remove('on'); };
$('wkUndo').onclick = ()=>{ WK.strokes.pop(); wkRedraw(); };
$('wkClear').onclick = ()=> wkReset();
$('wkPenOnly').onclick = ()=>{ WK.penOnly=!WK.penOnly; $('wkPenOnly').classList.toggle('on', WK.penOnly); };

/* ---------- grown-ups ---------- */
let gateAns = 0;
$('adultBtn').onclick = ()=>{
  const a = ri(12,19), b = ri(13,19);
  gateAns = a*b;
  $('gateQ').textContent = `${a} × ${b} = ?`;
  $('gateInput').value='';
  $('gate').style.display=''; $('panel').style.display='none';
  $('ovTitle').textContent='Grown-ups only'; $('ovSub').textContent='Answer this to continue.';
  $('ov').classList.add('show');$('gateInput').focus();
};
$('gateBtn').onclick = ()=>{
  if(Number($('gateInput').value) !== gateAns){ $('gateInput').value=''; $('ovSub').textContent='Not quite — try again.'; return; }
  $('gate').style.display='none'; $('panel').style.display='';
  $('ovTitle').textContent='Settings';
  $('ovSub').textContent='Topics she gets wrong come round more often.';
  $('catInput').value = S.cat || 'Mochi';
  $('provSel').value = provider();
  syncTutorFields();
  updateNet();
  studyParent();
  const list = $('mast'); list.innerHTML='';
  TOPICS.forEach(t=>{
    const m = S.mastery[t] || {a:0,c:0};
    const pct = m.a ? Math.round((m.c/m.a)*100) : 0;
    const row = document.createElement('div'); row.className='mrow';
    row.innerHTML = `<span class="mname">${esc(t)}</span>
      <span class="mbar"><span class="mfill" style="width:${m.a?pct:0}%"></span></span>
      <span class="mpct">${m.a ? pct+'%' : '—'}</span>`;
    list.appendChild(row);
  });
};
$('gateInput').addEventListener('keydown', e=>{ if(e.key==='Enter'){ e.preventDefault(); $('gateBtn').click(); } });
$('catSave').onclick = ()=>{
  const v = $('catInput').value.trim().slice(0,14);
  if(v){ S.cat = v; applyCatName(); save(S); }
};

/* Say plainly what went wrong instead of leaving a cat to mumble a fallback. */
function explainError(msg, p, model){
  const where = p==='openai' ? 'platform.openai.com' : 'console.anthropic.com';
  if(/AbortError|aborted/i.test(msg))
    return 'No reply within 20 seconds. Check the connection and try again.';
  if(/\b401\b|invalid_api_key|Incorrect API key|authentication/i.test(msg))
    return 'The key was rejected. It needs to be an API key from ' + where + ' \u2014 not a website password, and not a ChatGPT subscription login.';
  if(/\b403\b|permission/i.test(msg))
    return 'The key works but is not allowed to use ' + model + '. Check the project permissions on ' + where + '.';
  if(/\b404\b|model_not_found|does not exist|unknown model/i.test(msg))
    return 'There is no model called \u201c' + model + '\u201d on this account. Clear the model box to use the default, or type a name you can see in your dashboard.';
  if(/\b429\b|quota|insufficient_quota|billing|credit/i.test(msg))
    return 'Out of credit, or rate limited. ' + (p==='openai'
      ? 'A ChatGPT Plus subscription does NOT include API credit \u2014 add billing at platform.openai.com.'
      : 'Add credit in the Anthropic Console.');
  if(/Failed to fetch|NetworkError|CORS|Load failed/i.test(msg))
    return 'The request could not leave the browser. This happens when the page is opened straight from a file instead of being served over https, or when the network blocks it.';
  return 'Did not work: ' + String(msg).slice(0,150);
}

async function testConnection(){
  const p = $('provSel').value;
  const key = $('keyInput').value.trim();
  const model = normModel($('modelInput').value) || PROVIDERS[p].defaultModel;
  if(!key && p === 'openai'){ $('keyNote').textContent = 'Paste an OpenAI key first.'; return; }
  $('tutorTest').disabled = true;
  $('keyNote').textContent = 'Testing ' + model + '\u2026';
  const ctrl = new AbortController();
  const timer = setTimeout(()=> ctrl.abort(), 20000);
  try{
    const t = await callModel({
      system: 'You reply with one word only.',
      messages: [{role:'user', content:'Say the word ready.'}],
      maxTokens: 200,
      as: {p, key, model}
    }, ctrl.signal);
    $('keyNote').textContent = t
      ? 'Working. ' + model + ' replied in ' + ((LAST.ms||0)/1000).toFixed(1) + 's. Tap Save to use it.'
      : 'Connected, but ' + model + ' sent nothing back. Try a different model name.';
  }catch(err){
    $('keyNote').textContent = explainError(String((err && err.message) || err), p, model);
  }finally{
    clearTimeout(timer);
    $('tutorTest').disabled = false;
  }
}

function syncTutorFields(){
  const p = $('provSel').value;
  $('keyInput').value = apiKey(p);
  $('keyInput').placeholder = PROVIDERS[p].keyHint;
  $('modelInput').value = (S.models && S.models[p]) || '';
  $('modelInput').placeholder = PROVIDERS[p].defaultModel;
  $('readInput').value = (S.readModels && S.readModels[p]) || '';
  $('readInput').placeholder = 'same as above (' + PROVIDERS[p].defaultRead + ')';
  if($('useNote')) $('useNote').textContent = usageLine();
  if($('sessionNote')) $('sessionNote').textContent = usageLine();
  if($('buildNote')) $('buildNote').textContent = 'Coins: ' + coins() + ' \u00b7 ' +
    ((S.owned||[]).length) + ' of ' + WEAR.length + ' accessories owned \u00b7 ' + (S.fed||0) + ' treats given.\n' + BUILD + ' \u00b7 ' + GEN.length + ' generators across ' + TOPICS.length + ' topics.';
  $('keyNote').textContent = apiKey(p)
    ? 'Key saved on this device. ' + PROVIDERS[p].label + ' will answer as ' + (S.cat||'Mochi') + '.'
    : 'No key for ' + PROVIDERS[p].label + ' yet. Questions, marking, bar models and the working page all still run without one.';
}
$('provSel').onchange = ()=>{ USE.last = null; LAST = {p:null, model:null, at:0}; syncTutorFields(); updateNet(); };
$('tutorTest').onclick = ()=> testConnection();
$('tutorSave').onclick = ()=>{
  const p = $('provSel').value;
  S.provider = p;
  S.keys = S.keys || {}; S.keys[p] = $('keyInput').value.trim();
  S.models = S.models || {}; S.models[p] = normModel($('modelInput').value);
  S.readModels = S.readModels || {}; S.readModels[p] = normModel($('readInput').value);
  USE.last = null; LAST = {p:null, model:null, at:0};
  save(S); syncTutorFields(); updateNet();
  $('keyNote').textContent = 'Saved. ' + PROVIDERS[p].label + ' is now the tutor, using ' + modelName(p) + '. The badge by Ask ' + (S.cat||'Mochi') + ' will confirm it once it answers.';
};
$('photoInput').addEventListener('change', e=> handleFile(e.target.files && e.target.files[0]));
$('photoClear').onclick = async ()=>{
  clearPhoto();
  MEM[PHOTO_KEY] = '__none__'; lsSet(PHOTO_KEY,'__none__');
  try{ if(window.storage) await window.storage.set(PHOTO_KEY,'__none__'); }catch(e){}
  $('photoNote').textContent = 'Photo removed. Choose a photo to set a new one.';
};
$('ovClose').onclick = ()=>{ $('ov').classList.remove('show');$('adultBtn').focus(); };
$('parentDismiss').onclick=()=> $('ovClose').click();
$('resetBtn').onclick = ()=>{
  if(!confirm('Reset all learning progress and coins on this device? Back up first if you want to keep them.'))return;
  S.learning=MochiLearning.fresh();
  S.done=0; S.right=0; S.streak=0; S.best=0; S.tick=0;
  S.coins=0; S.owned=[]; S.worn={head:null,eyes:null,neck:null}; S.purr=0; S.fed=0; S.pets=0;
  TOPICS.forEach(t=>{ S.mastery[t]={a:0,c:0}; S.lastSeen[t]=-1; });
  save(S); $('ov').classList.remove('show'); renderQuestion();
};
$('ov').onclick = e=>{ if(e.target === $('ov')) $('ov').classList.remove('show'); };

function applyCatName(){
  const c = S.cat || 'Mochi';
  $('catName').textContent = c;
  $('chatInput').placeholder = 'Ask ' + c + '\u2026';
}

/* ---------- boot ---------- */
async function boot(){
  applyCatName();wkInit();paintCoins();
  await hydrate();
  MochiLearning.init(S);studyInit();if(typeof studioInit==='function')studioInit();renderQuestion();updateNet();
}

/* Storage is a network round-trip. It must never sit in front of a question. */
async function hydrate(){
  let saved = null;
  try{ saved = await load(); }catch(e){}
  if(saved && saved.mastery){
    const topic = current ? current.topic : null;
    S = Object.assign(S, saved);
    TOPICS.forEach(t=>{ if(!S.mastery[t]) S.mastery[t]={a:0,c:0}; if(S.lastSeen[t]==null) S.lastSeen[t]=-1; });
    if(topic){ S.tick++; S.lastSeen[topic] = S.tick; }
    $('qNum').textContent = 'Q' + (S.done+1);
    drawPaws(false);
    applyCatName();
    paintCoins();
  }
  updateVoiceBtn();
  try{
    const u = await loadPhoto();
    if(u === '__none__') clearPhoto();
    else if(u && u !== BUILTIN_PHOTO) showPhoto(u);
  }catch(e){}
}

if('serviceWorker' in navigator){
  window.addEventListener('load', ()=> navigator.serviceWorker.register('sw.js?v=3.0.0').catch(()=>{}));
}
