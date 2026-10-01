// Challenge puzzles (dsa-puzzles.js): every answer is re-solved here by a different route —
// usually brute force over every case — read back from the question text or the drawn figure.
const test=require('node:test'),assert=require('node:assert/strict');
globalThis.window=globalThis;
require('../entrance-data.js');require('../entrance-figures.js');require('../quick-checks.js');
const B=require('../entrance-bank.js'),Z=require('../dsa-puzzles.js'),D=globalThis.MochiEntranceData,F=globalThis.MochiEntranceFigures,C=require('../path-coach.js'),QC=require('../quick-checks.js'),CC=require('../course-core.js');
const SEEDS=Array.from({length:250},(_,i)=>i*7919+13);
const IDS=['pz-logic','pz-space','pz-count'];
const cache=new Map();
const all=(u,f)=>{const k=u+':'+f;if(!cache.has(k))cache.set(k,SEEDS.map(s=>B.make(u,f,s)));return cache.get(k);};
const each=(u,f,variant,fn)=>{const list=all(u,f).filter(q=>q.params.variant===variant);assert.ok(list.length>=10,`${u}/${f}/${variant} appears only ${list.length} times`);list.forEach(q=>fn(q));return list;};
const NUM={zero:0,one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,eleven:11,twelve:12};
const wn=w=>{const v=NUM[String(w).toLowerCase()];assert.ok(v!==undefined,'number word '+w);return v;};
const nums=t=>[...t.matchAll(/\d+/g)].map(m=>+m[0]);
const m1=(t,re)=>{const m=t.match(re);assert.ok(m,`pattern ${re} not found in: ${t}`);return m;};
const names=s=>s.split(/, | and /);
function* perms(a){if(a.length<=1){yield a.slice();return;}for(let i=0;i<a.length;i++){const rest=a.slice(0,i).concat(a.slice(i+1));for(const p of perms(rest))yield [a[i],...p];}}

/* ---------- structure ---------- */
test('three puzzle units load through entrance data with real prerequisites and lesson content',()=>{
 const pz=D.units.filter(u=>u.module==='puzzles');
 assert.deepEqual(pz.map(u=>u.id),IDS);
 assert.deepEqual(pz.map(u=>u.strand),['logic','geometry','number']);
 for(const u of pz){
  assert.ok(u.extension);assert.ok(D.strands[u.strand]);assert.ok(CC.unit(u.foundation),u.id+' foundation');
  assert.equal(u.ideas.length,3);u.ideas.forEach(t=>assert.ok(t.length>120));
  assert.ok(u.prerequisites.length>=2);assert.ok(u.prerequisites.every(id=>D.units.some(v=>v.id===id&&!v.extension)),u.id+' prerequisites');
  const [prompt,choices,correct,explain]=u.check;assert.ok(prompt&&explain);assert.equal(choices.length,3);assert.equal(new Set(choices).size,3);assert.ok(choices[correct]);
  assert.ok(u.why.length>20);
 }
});

test('every form makes valid whole-number questions with worked steps that the marker accepts',()=>{
 for(const u of IDS)for(let f=0;f<4;f++)for(const q of all(u,f)){
  assert.ok(Number.isInteger(q.answer)&&q.answer>=0,`${q.id} answer ${q.answer}`);
  assert.ok(q.text.length>30&&!/undefined|NaN|\[object/.test(q.text),q.id);
  assert.ok(Array.isArray(q.steps)&&q.steps.length>=3&&q.steps.every(s=>typeof s==='string'&&s.length>3&&!/undefined|NaN/.test(s)),q.id+' steps');
  assert.ok(B.mark(q,String(q.answer)),q.id+' marks its own answer');assert.ok(!B.mark(q,String(q.answer+1)));
  assert.equal(q.level,f===0?1:f===1?2:3);
 }
});

test('each form mixes at least two structurally different variants, and generation is deterministic',()=>{
 for(const u of IDS)for(let f=0;f<4;f++){
  const list=all(u,f),v=new Set(list.map(q=>q.params.variant));assert.ok(v.size>=2,`${u}/${f}: ${[...v]}`);
  for(const name of v)assert.ok(list.filter(q=>q.params.variant===name).length>=20,`${u}/${f}/${name} too rare`);
  assert.ok(new Set(list.map(q=>q.fingerprint)).size>=50,`${u}/${f} variety`);
  assert.equal(B.make(u,f,SEEDS[7]).text,list[7].text);
 }
});

test('figures render as labelled SVG with no NaN and labels inside the frame',()=>{
 let n=0;
 for(const u of IDS)for(let f=0;f<4;f++)for(const q of all(u,f)){if(!q.figure)continue;n++;
  assert.equal(q.figure.module,'puzzles');assert.match(q.figure.kind,/^pz-/);
  const svg=F.diagram(q.figure,q.id);assert.match(svg,/^<svg class="entrance-figure"[^>]*role="img"/);assert.match(svg,/<title id="[^"]+">[^<]{10,}<\/title>/);
  assert.doesNotMatch(svg,/NaN|undefined|Infinity/);assert.equal(svg,Z.diagram(q.figure,q.id));
  const vb=svg.match(/viewBox="0 0 (\d+) (\d+)"/).slice(1).map(Number);
  for(const m of svg.matchAll(/<text x="(-?[\d.]+)" y="(-?[\d.]+)"/g))assert.ok(+m[1]>=8&&+m[1]<=vb[0]-8&&+m[2]>=12&&+m[2]<=vb[1]-2,`${q.id} label at ${m[1]},${m[2]}`);
 }
 assert.ok(n>800);
 for(const kind of ['pz-cuboid','pz-grid','pz-views','pz-cevians','pz-net','pz-strip','pz-fold','pz-paths','pz-dots'])assert.ok(IDS.some(u=>[0,1,2,3].some(f=>all(u,f).some(q=>q.figure?.kind===kind))),kind);
});

test('Quick checks: four one-step checks per unit, served through the shared lookup',()=>{
 for(const u of IDS){assert.equal(Z.quickChecks[u].length,4);
  for(let f=0;f<4;f++){const c=QC.check('maths',u,f);assert.equal(c,Z.quickChecks[u][f]);assert.equal(C.diagnostic('maths',u,null,f),c);
   assert.equal(c.choices.length,3);assert.equal(new Set(c.choices).size,3);assert.ok(Number.isInteger(c.correct)&&c.choices[c.correct]);assert.ok(c.prompt.length>20&&c.explain.length>20);}}
 assert.ok(new Set(IDS.flatMap(u=>Z.quickChecks[u].map(c=>c.correct))).size>=3);
});

/* ---------- logic ---------- */
function culpritBrute(text){
 const who=[...text.matchAll(/([A-Z][a-z]+) \((\d)\)/g)].map(m=>m[1]),idx=n=>{const i=who.indexOf(n);assert.ok(i>=0,n);return i;};
 const sts=[...text.matchAll(/([A-Z][a-z]+) says, “([^”]+)”/g)].map(m=>({sp:idx(m[1]),s:m[2]}));assert.equal(sts.length,who.length);
 const [,kw,nw,kind]=m1(text,/Exactly (\w+) of the (\w+) statements (?:is|are) (true|false)\./),k=wn(kw);assert.equal(wn(nw),who.length);
 const truth=(i,c,depth=0)=>{assert.ok(depth<4,'circular statements');const {sp,s}=sts.find(x=>x.sp===i);let m;
  if(s==='I took it.')return c===sp;if(s==='I did not take it.')return c!==sp;
  if((m=s.match(/^It was ([A-Z][a-z]+) or ([A-Z][a-z]+)\.$/)))return c===idx(m[1])||c===idx(m[2]);
  if((m=s.match(/^([A-Z][a-z]+) did not take it\.$/)))return c!==idx(m[1]);
  if((m=s.match(/^([A-Z][a-z]+) took it\.$/)))return c===idx(m[1]);
  if((m=s.match(/^([A-Z][a-z]+) is lying\.$/)))return !truth(idx(m[1]),c,depth+1);
  if((m=s.match(/^([A-Z][a-z]+) is telling the truth\.$/)))return truth(idx(m[1]),c,depth+1);
  throw Error('Unknown statement '+s);};
 return who.map((_,c)=>c).filter(c=>{const t=who.filter((_,i)=>truth(i,c)).length;return kind==='true'?t===k:who.length-t===k;});
}
test('who took it: trying every pupil leaves exactly one culprit (guided and with statements about statements)',()=>{
 each('pz-logic',0,'culprit',q=>{assert.deepEqual(culpritBrute(q.text),[q.answer-1]);assert.match(q.text,/^Four pupils/);});
 each('pz-logic',3,'meta',q=>{assert.deepEqual(culpritBrute(q.text),[q.answer-1]);assert.match(q.text,/is lying\.|is telling the truth\./);assert.match(q.text,/^Five pupils/);});
});

test('weighings: a minimax over every equal-pan split agrees',()=>{
 const memo=[0,0];const fw=n=>{if(memo[n]!==undefined)return memo[n];let best=Infinity;for(let a=1;2*a<=n;a++)best=Math.min(best,1+Math.max(fw(a),fw(n-2*a)));return memo[n]=best;};
 each('pz-logic',0,'weigh',q=>{
  if(q.params.sub==='fewest')return assert.equal(q.answer,fw(+m1(q.text,/You have (\d+) coins/)[1]));
  const k=wn(m1(q.text,/balance scale (\w+) times/)[1]);let best=0;for(let n=1;n<=300;n++)if(fw(n)<=k)best=n;assert.equal(q.answer,best);
 });
});

test('league points: every possible number of draws is tried',()=>each('pz-logic',0,'draws',q=>{
 const n=wn(m1(q.text,/^(\w+) teams/)[1]),T=+m1(q.text,/scored (\d+) points/)[1],G=n*(n-1)/2;
 const fit=[];for(let d=0;d<=G;d++)if(3*(G-d)+2*d===T)fit.push(d);assert.equal(fit.length,1);
 assert.equal(q.answer,/ended in a draw\?/.test(q.text)?fit[0]:G-fit[0]);
}));

test('marble games: full game-tree search finds exactly one winning first move',()=>{for(const v of ['nim','misere'])each('pz-logic',1,v,q=>{
 const N=+m1(q.text,/There are (\d+) marbles/)[1],takes=nums(m1(q.text,/must take ([\d, or]+) marbles/)[1]),misere=/has to take the last marble loses/.test(q.text);
 assert.equal(misere,v==='misere');const memo=new Map();
 const win=n=>{if(memo.has(n))return memo.get(n);const w=n===0?misere:takes.some(t=>t<=n&&!win(n-t));memo.set(n,w);return w;};
 const good=takes.filter(t=>t<=N&&!win(N-t));assert.deepEqual(good,[q.answer]);
});});

test('badminton: enumerating every tournament result gives the greatest group',()=>{
 const best={};
 const solve=n=>{if(best[n])return best[n];const pairs=[];for(let i=0;i<n;i++)for(let j=i+1;j<n;j++)pairs.push([i,j]);const out=Array(n).fill(0),wins=new Int8Array(n);
  for(let mask=0;mask<1<<pairs.length;mask++){wins.fill(0);for(let e=0;e<pairs.length;e++)wins[(mask>>e)&1?pairs[e][0]:pairs[e][1]]++;for(let w=1;w<n;w++){let c=0;for(let i=0;i<n;i++)if(wins[i]>=w)c++;if(c>out[w])out[w]=c;}}
  return best[n]=out;};
 each('pz-logic',1,'rr-max',q=>{const n=wn(m1(q.text,/^(\w+) players/)[1]),w=+m1(q.text,/at least (\d+) games/)[1];assert.equal(q.answer,solve(n)[w]);});
});

test('liar counts: all 2^n truth-teller/liar assignments give one consistent number of liars',()=>each('pz-logic',2,'claims',q=>{
 const friends=names(m1(q.text,/friends, (.+?), live on/)[1]),n=wn(m1(q.text,/^(\w+) friends/)[1]);assert.equal(friends.length,n);
 const claim=[];for(const m of q.text.matchAll(/([A-Z][a-z]+(?:(?:, | and )[A-Z][a-z]+)*) (?:each say|says), “(Exactly|At least) (\w+) of us/g))for(const p of names(m[1]))claim[friends.indexOf(p)]={exact:m[2]==='Exactly',v:wn(m[3])};
 assert.ok(claim.length===n&&claim.every(Boolean));const counts=new Set();
 for(let mask=0;mask<1<<n;mask++){const L=[...Array(n).keys()].filter(i=>mask>>i&1).length;if(L===n)continue;
  if(claim.every((c,i)=>{const tru=c.exact?L===c.v:L>=c.v;return tru===!(mask>>i&1);}))counts.add(L);}
 assert.deepEqual([...counts],[q.answer]);
}));

test('balances: searching all whole-number masses gives one solution',()=>each('pz-logic',2,'balance',q=>{
 const t=q.text,ask=m1(t,/How many .+? balance 1 (.+?)\?$/)[1];let sols=[];
 if(q.params.sub==='sum'){const [,p,X,qq,Y,s,,x1,y1,tt]=m1(t,/^On a balance, (\d+) (.+?) and (\d+) (.+?) together balance (\d+) (.+?)\. Also, 1 (.+?) balances 1 (.+?) and (\d+) /);
  for(let x=1;x<=200;x++)for(let y=1;y<=200;y++)if(+p*x+ +qq*y===+s&&x===y+ +tt)sols.push(ask===x1?x:ask===y1?y:NaN);assert.ok(X.startsWith(x1.split(' ')[0])&&Y.startsWith(y1.split(' ')[0]));}
 else{const [,a,,b,,y1,x1,tt]=m1(t,/^On a balance, (\d+) (.+?) balance (\d+) (.+?)\. Also, 1 (.+?) balances 1 (.+?) and (\d+) /);
  for(let x=1;x<=200;x++)for(let y=1;y<=200;y++)if(+a*x===+b*y&&y===x+ +tt)sols.push(ask===x1?x:ask===y1?y:NaN);}
 assert.deepEqual(sols,[q.answer]);
}));

test('round table: every seating of truth-tellers and liars is checked',()=>each('pz-logic',2,'circle',q=>{
 const n=wn(m1(q.text,/^(\w+) children/)[1]),right=/“The child on my right is a liar\.”/.test(q.text),liars=[];
 for(let mask=0;mask<1<<n;mask++){const liar=i=>!!(mask>>((i+n)%n)&1);let ok=true;
  for(let i=0;i<n&&ok;i++){const claim=right?liar(i+1):liar(i-1)&&liar(i+1);ok=claim===!liar(i);}
  if(ok)liars.push([...Array(n).keys()].filter(liar).length);}
 assert.ok(liars.length);
 if(right){assert.equal(new Set(liars).size,1);assert.equal(q.answer,liars[0]);}
 else assert.equal(q.answer,/greatest possible/.test(q.text)?Math.max(...liars):Math.min(...liars));
}));

test('cat logic grids: all 120 orders are tested and exactly one fits every clue',()=>each('pz-logic',3,'grid',q=>{
 const cats=names(m1(q.text,/^Five cats, (.+?), each ate/)[1]),body=q.text.slice(q.text.indexOf('(1) '),q.text.indexOf(' How many fish did')),clues=body.split(/ ?\(\d\) /).filter(Boolean);
 assert.ok(clues.length>=4&&clues.length<=6);const ci=n=>{const i=cats.indexOf(n);assert.ok(i>=0,n);return i;};
 const tests=clues.map(c=>{let m;
  if((m=c.match(/^(.+) ate more fish than (.+) but fewer than (.+)\.$/))){const [a,b,d]=[m[1],m[2],m[3]].map(ci);return v=>v[b]<v[a]&&v[a]<v[d];}
  if((m=c.match(/^(.+) ate more fish than (.+)\.$/))){const [a,b]=[m[1],m[2]].map(ci);return v=>v[a]>v[b];}
  if((m=c.match(/^(.+) ate (\w+) more fish than (.+)\.$/))){const a=ci(m[1]),k=wn(m[2]),b=ci(m[3]);return v=>v[a]-v[b]===k;}
  if((m=c.match(/^The number of fish (.+) ate is not (\d)\.$/))){const a=ci(m[1]),k=+m[2];return v=>v[a]!==k;}
  if((m=c.match(/^(.+) ate an (odd|even) number of fish\.$/))){const a=ci(m[1]),odd=m[2]==='odd';return v=>v[a]%2===(odd?1:0);}
  if((m=c.match(/^(.+) and (.+) ate (\d+) fish altogether\.$/))){const a=ci(m[1]),b=ci(m[2]),s=+m[3];return v=>v[a]+v[b]===s;}
  throw Error('Unknown clue '+c);});
 const sols=[...perms([1,2,3,4,5])].filter(v=>tests.every(t=>t(v)));assert.equal(sols.length,1,q.text);
 assert.equal(q.answer,sols[0][ci(m1(q.text,/How many fish did (.+) eat\?/)[1])]);
}));

test('counter games: a plain recursive game search counts the losing starts',()=>each('pz-logic',3,'game',q=>{
 const moves=nums(m1(q.text,/take exactly ([\d, or]+) counters/)[1]),M=+m1(q.text,/from 1 to (\d+) counters/)[1],memo={};
 const win=n=>memo[n]??=moves.some(m=>m<=n&&!win(n-m));
 let c=0;for(let n=1;n<=M;n++)if(!win(n))c++;assert.equal(q.answer,c);
}));

/* ---------- space ---------- */
function voxels(a,b,c,unpainted){let out=[0,0,0,0];for(let x=0;x<a;x++)for(let y=0;y<b;y++)for(let z=0;z<c;z++){const k=(x===0)+(x===a-1)+(y===0)+(y===b-1)+(z===0&&!unpainted.includes('bottom'))+(z===c-1&&!unpainted.includes('top'));out[k]=(out[k]||0)+1;}return out;}
function paintedAnswer(q){
 const t=q.text;let a,b,c;const cube=t.match(/A large cube of side (\d+) cm/);if(cube)a=b=c=+cube[1];else[a,b,c]=m1(t,/(\d+) cm long, (\d+) cm wide and (\d+) cm tall/).slice(1).map(Number);
 const un=/except the top face and the bottom face/.test(t)?['top','bottom']:/except the bottom face/.test(t)?['bottom']:[];
 if(q.figure)assert.deepEqual([q.figure.a,q.figure.b,q.figure.c,q.figure.unpainted],[a,b,c,un]);
 const v=voxels(a,b,c,un);if(/at least one painted face/.test(t))return a*b*c-v[0];if(/no painted faces/.test(t))return v[0];return v[wn(m1(t,/exactly (\w+) painted/)[1])]||0;
}
test('painted blocks: building the block cube by cube gives the count',()=>{
 each('pz-space',0,'painted',q=>assert.equal(q.answer,paintedAnswer(q)));
 each('pz-space',1,'cuboid',q=>assert.equal(q.answer,paintedAnswer(q)));
 each('pz-space',3,'layers',q=>assert.equal(q.answer,paintedAnswer(q)));
});

/* Geometry read back from the drawn SVG lines. */
const segs=svg=>[...svg.matchAll(/<line x1="([\d.-]+)" y1="([\d.-]+)" x2="([\d.-]+)" y2="([\d.-]+)"/g)].map(m=>m.slice(1,5).map(Number));
function figureGraph(svg){
 const S=segs(svg),pts=[];const add=p=>{if(!pts.some(q=>Math.hypot(q[0]-p[0],q[1]-p[1])<.6))pts.push(p);};
 for(const s of S){add([s[0],s[1]]);add([s[2],s[3]]);}
 for(let i=0;i<S.length;i++)for(let j=i+1;j<S.length;j++){const [x1,y1,x2,y2]=S[i],[x3,y3,x4,y4]=S[j],d=(x2-x1)*(y4-y3)-(y2-y1)*(x4-x3);if(Math.abs(d)<1e-9)continue;
  const u=((x3-x1)*(y4-y3)-(y3-y1)*(x4-x3))/d,v=((x3-x1)*(y2-y1)-(y3-y1)*(x2-x1))/d;if(u>-1e-6&&u<1+1e-6&&v>-1e-6&&v<1+1e-6)add([x1+u*(x2-x1),y1+u*(y2-y1)]);}
 const on=(p,s)=>{const [x1,y1,x2,y2]=s,L=Math.hypot(x2-x1,y2-y1),t=((p[0]-x1)*(x2-x1)+(p[1]-y1)*(y2-y1))/L;return Math.abs((p[0]-x1)*(y2-y1)-(p[1]-y1)*(x2-x1))/L<.6&&t>-.6&&t<L+.6;};
 const lists=S.map(s=>pts.map((p,i)=>on(p,s)?i:-1).filter(i=>i>=0)),link=(i,j)=>lists.some(l=>l.includes(i)&&l.includes(j));
 return {pts,link};
}
function countTriangles(svg){const {pts,link}=figureGraph(svg);let n=0;
 for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++){if(!link(i,j))continue;for(let k=j+1;k<pts.length;k++){if(!link(i,k)||!link(j,k))continue;const [a,b,c]=[pts[i],pts[j],pts[k]];if(Math.abs((b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]))>2)n++;}}
 return n;}
function countRects(svg){const {pts,link}=figureGraph(svg),find=(x,y)=>pts.findIndex(p=>Math.abs(p[0]-x)<.6&&Math.abs(p[1]-y)<.6);let sq=0,all=0;
 for(let i=0;i<pts.length;i++)for(let j=0;j<pts.length;j++){const [p,q]=[pts[i],pts[j]];if(q[0]<p[0]+1||q[1]<p[1]+1)continue;const r=find(q[0],p[1]),s=find(p[0],q[1]);if(r<0||s<0)continue;
  if(link(i,r)&&link(r,j)&&link(j,s)&&link(s,i)){all++;if(Math.abs((q[0]-p[0])-(q[1]-p[1]))<1)sq++;}}
 return {sq,all};}
test('triangle figures: every triple of drawn points joined by drawn lines is counted',()=>{
 each('pz-space',1,'cevians',q=>assert.equal(q.answer,countTriangles(F.diagram(q.figure,q.id))));
 each('pz-space',2,'strip',q=>assert.equal(q.answer,countTriangles(F.diagram(q.figure,q.id))));
});
test('grids: rectangles are found from the drawn lines and sorted into squares and others',()=>each('pz-space',0,'squares',q=>{
 const {sq,all:rects}=countRects(F.diagram(q.figure,q.id));assert.equal(q.answer,/are not squares/.test(q.text)?rects-sq:sq);
 const [W,H]=m1(q.text,/the (\d) by (\d) grid/).slice(1).map(Number);assert.deepEqual([W,H],[q.figure.W,q.figure.H]);
}));

let heights=null;
function viewTable(){if(heights)return heights;heights={fs:new Map(),fst:new Map()};
 for(let code=0;code<4**9;code++){const h=[...Array(9).keys()].map(i=>(code>>(2*i))&3),row=r=>h.slice(3*r,3*r+3),Fv=[0,1,2].map(c=>Math.max(h[c],h[3+c],h[6+c])),Sv=[0,1,2].map(r=>Math.max(...row(r))),n=h.reduce((a,b)=>a+b,0);
  const k1=Fv+'|'+Sv,k2=k1+'|'+h.map(x=>x?1:0).join('');
  for(const [m,k] of [[heights.fs,k1],[heights.fst,k2]]){const o=m.get(k);if(!o)m.set(k,{min:n,max:n});else{o.min=Math.min(o.min,n);o.max=Math.max(o.max,n);}}}
 return heights;}
test('cube views: every 3 by 3 stacking up to 3 high is checked against the drawn views',()=>{
 const V=viewTable();
 const check=q=>{const {F:Fv,S:Sv,top}=q.figure,o=top?V.fst.get(Fv+'|'+Sv+'|'+top.flat().join('')):V.fs.get(Fv+'|'+Sv);assert.ok(o,'views are possible');
  if(/difference between the greatest and the smallest/.test(q.text))return assert.equal(q.answer,o.max-o.min);
  assert.equal(q.answer,/greatest number/.test(q.text)?o.max:o.min);assert.equal(!!top,/top view/.test(q.text));};
 each('pz-space',0,'views-max',check);each('pz-space',2,'views-min',check);each('pz-space',3,'views-top',check);
});

function fold3D(cells){
 const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],neg=a=>a.map(x=>-x),k=c=>c.join(',');
 const at=new Map(cells.map((c,i)=>[k(c),i])),frame=[];frame[0]={u:[1,0,0],v:[0,1,0]};const queue=[0];
 while(queue.length){const i=queue.shift(),{u,v}=frame[i],n=cross(u,v),[x,y]=cells[i];
  for(const [dx,dy,nu,nv] of [[1,0,n,v],[-1,0,neg(n),v],[0,1,u,n],[0,-1,u,neg(n)]]){const j=at.get(k([x+dx,y+dy]));if(j===undefined||frame[j])continue;frame[j]={u:nu,v:nv};queue.push(j);}}
 return frame.map(({u,v})=>cross(u,v));
}
test('nets: folding the drawn net in 3D gives six different faces and the stated opposite',()=>{
 for(const net of Z.NETS){const nrm=fold3D(net);assert.equal(new Set(nrm.map(String)).size,6);}
 each('pz-space',1,'net',q=>{const {cells,labels}=q.figure,nrm=fold3D(cells);assert.equal(new Set(nrm.map(String)).size,6);assert.deepEqual([...labels].sort(),[1,2,3,4,5,6]);
  const t=labels.indexOf(+m1(q.text,/face numbered (\d)\?/)[1]),o=nrm.findIndex(n=>n.every((x,i)=>x===-nrm[t][i]));assert.equal(q.answer,labels[o]);});
});

test('folded paper: unfolding the drawn cuts and holes layer by layer',()=>each('pz-space',2,'fold',q=>{
 const s=q.figure;
 if(s.mode==='strip'){assert.equal(wn(m1(q.text,/folded (\w+) times/)[1]),s.k);assert.equal(/(\w+) straight cuts? (?:is|are) made/.test(q.text)&&wn(q.text.match(/(\w+) straight cuts? (?:is|are) made/)[1]),s.cuts.length);
  let len=1/2**s.k,pos=s.cuts.map(t=>t*len);for(let i=0;i<s.k;i++){pos=pos.flatMap(x=>[x,2*len-x]);len*=2;}
  assert.equal(new Set(pos.map(x=>x.toFixed(9))).size,pos.length);assert.ok(pos.every(x=>x>0&&x<1));assert.equal(q.answer,pos.length+1);return;}
 assert.equal(s.k,/then in half from top to bottom again/.test(q.text)?3:2);assert.equal(wn(m1(q.text,/\. (\w+) small round hole/)[1]),s.holes.length);assert.equal(!!s.notch,/half-circle notch/.test(q.text));
 const folds=[['y',4],['x',4],['y',2]].slice(0,s.k);let pts=[...s.holes,...(s.notch?[s.notch]:[])];
 for(const [axis,c] of folds.reverse())pts=pts.flatMap(([x,y])=>axis==='y'?[[x,y],[x,2*c-y]]:[[x,y],[2*c-x,y]]);
 assert.ok(pts.every(([x,y])=>x>0&&x<8&&y>0&&y<8));assert.equal(q.answer,new Set(pts.map(String)).size);
}));

test('dot squares: every pair of dots is tried as one side of a square',()=>each('pz-space',3,'dots',q=>{
 const [a,b]=m1(q.text,/a (\d) by (\d) array/).slice(1).map(Number),inside=(x,y)=>x>=0&&y>=0&&x<a&&y<b;let all=0,tilted=0;
 for(let x1=0;x1<a;x1++)for(let y1=0;y1<b;y1++)for(let x2=0;x2<a;x2++)for(let y2=0;y2<b;y2++){if(x1===x2&&y1===y2)continue;const dx=x2-x1,dy=y2-y1;
  if(inside(x2-dy,y2+dx)&&inside(x1-dy,y1+dx)){all++;if(dx&&dy)tilted++;}}
 assert.equal(q.answer,/are tilted/.test(q.text)?tilted/4:all/4);
}));

/* ---------- counting ---------- */
function routesBrute(W,H){const out=[];const walk=(x,y,path)=>{if(x===W&&y===H){out.push(path);return;}if(x<W)walk(x+1,y,[...path,[x+1,y]]);if(y<H)walk(x,y+1,[...path,[x,y+1]]);};walk(0,0,[[0,0]]);return out;}
test('grid routes: every right/up route is listed and filtered by the rules in the text',()=>{
 const check=q=>{const {W,H,marks}=q.figure,t=q.text,pt=l=>{const m=marks.find(x=>x.label===l);assert.ok(m,l);return m;},visits=(p,m)=>p.some(([x,y])=>x===m.x&&y===m.y);
  let rs=routesBrute(W,H);
  if(/Point X is closed/.test(t)){assert.equal(pt('X').type,'closed');rs=rs.filter(p=>!visits(p,pt('X')));}
  if(/must pass through P or Q \(or both\)/.test(t))rs=rs.filter(p=>visits(p,pt('P'))||visits(p,pt('Q')));
  else if(/must pass through point P/.test(t))rs=rs.filter(p=>visits(p,pt('P')));
  if(/must not pass through point Q/.test(t)){assert.equal(pt('Q').type,'closed');rs=rs.filter(p=>!visits(p,pt('Q')));}
  assert.equal(q.answer,rs.length);};
 each('pz-count',0,'paths',check);each('pz-count',1,'paths-closed',check);each('pz-count',2,'paths-via',check);each('pz-count',3,'paths-avoid',check);
});

test('handshakes, diagonals and cards: list every pair',()=>each('pz-count',0,'handshake',q=>{
 const t=q.text;let n,c=0;
 if(/couples/.test(t)){n=2*wn(m1(t,/^(\w+) couples/)[1]);for(let i=0;i<n;i++)for(let j=i+1;j<n;j++)if(Math.floor(i/2)!==Math.floor(j/2))c++;}
 else if(/diagonals/.test(t)){n=+m1(t,/polygon with (\d+) sides/)[1];for(let i=0;i<n;i++)for(let j=i+1;j<n;j++)if(j-i!==1&&j-i!==n-1)c++;}
 else{n=+m1(t,/group of (\d+)/)[1];for(let i=0;i<n;i++)for(let j=0;j<n;j++)if(i!==j)c++;}
 assert.equal(q.answer,c);
}));

function payWays(A,values){const v=[...values].sort((a,b)=>b-a);let c=0;const go=(i,rem)=>{if(i===v.length){if(rem===0)c++;return;}for(let n=0;n*v[i]<=rem;n++)go(i+1,rem-n*v[i]);};go(0,A);return c;}
test('coins and stamps: every combination of coin counts is tried',()=>{
 const amount=t=>{const m=t.match(/make (\d+) cents/)||t.match(/exactly (\d+) cents of postage/);if(m)return +m[1];return Math.round(+m1(t,/make S\$(\d+\.\d\d)/)[1]*100);};
 const coins=t=>[...t.matchAll(/(\d+)-cent/g)].map(m=>+m[1]).concat(/S\$1 coins/.test(t)?[100]:[]);
 each('pz-count',0,'coins',q=>assert.equal(q.answer,payWays(amount(q.text),coins(q.text))));
 each('pz-count',3,'coins',q=>assert.equal(q.answer,payWays(amount(q.text),coins(q.text))));
});

test('photo rows: every order of the friends is listed',()=>each('pz-count',1,'row',q=>{
 const t=q.text,ppl=names(m1(t,/friends, (.+?), stand in a row/)[1]);let ok;
 let m=t.match(/(\w+) and (\w+) must stand next to each other\./);
 if(m)ok=p=>Math.abs(p.indexOf(m[1])-p.indexOf(m[2]))===1;
 else if((m=t.match(/(\w+) and (\w+) must not stand next to each other\./)))ok=p=>Math.abs(p.indexOf(m[1])-p.indexOf(m[2]))!==1;
 else{m=m1(t,/(\w+) must stand at one end of the row, and (\w+) must not stand next to/);ok=p=>{const i=p.indexOf(m[1]);return (i===0||i===p.length-1)&&Math.abs(i-p.indexOf(m[2]))!==1;};}
 assert.equal(q.answer,[...perms(ppl)].filter(ok).length);
}));

test('digit conditions: every number in range is checked',()=>{
 each('pz-count',1,'digit-sum',q=>{const s=+m1(q.text,/add up to (\d+)/)[1];let c=0;for(let n=100;n<1000;n++)if([...String(n)].reduce((a,d)=>a+ +d,0)===s)c++;assert.equal(q.answer,c);
  const ex=m1(q.text,/For example, (\d{3}) is one/)[1];assert.equal([...ex].reduce((a,d)=>a+ +d,0),s);});
 each('pz-count',2,'contains',q=>{let lo,hi,d,m=q.text.match(/three-digit numbers \(from 100 to 999\) contain at least one digit (\d)/);
  if(m){lo=100;hi=999;d=m[1];}else{m=m1(q.text,/from 1 to (\d+) contain at least one digit (\d)/);lo=1;hi=+m[1];d=m[2];}
  let c=0;for(let n=lo;n<=hi;n++)if(String(n).includes(d))c++;assert.equal(q.answer,c);});
 each('pz-count',3,'digits',q=>{const [,Lw,what,list]=m1(q.text,/How many (\w+)-digit (even numbers|odd numbers|multiples of 5) can be made from the digits ([\d, and]+), using/),L=wn(Lw),D=nums(list);
  assert.equal(new Set(D).size,D.length);let c=0;
  for(let n=10**(L-1);n<10**L;n++){const s=String(n);if(new Set(s).size<L||[...s].some(ch=>!D.includes(+ch)))continue;if(what==='even numbers'?n%2===0:what==='odd numbers'?n%2===1:n%5===0)c++;}
  assert.equal(q.answer,c);});
});

test('three clubs: rebuilding the class pupil by pupil from the given numbers',()=>each('pz-count',2,'venn',q=>{
 const t=q.text,N=+m1(t,/class of (\d+) pupils/)[1],[A,Bc,Cc]=m1(t,/(\d+) are in the Art club, (\d+) in the Band club and (\d+) in the Chess club/).slice(1).map(Number),[AB,AC,BC]=m1(t,/(\d+) are in both Art and Band, (\d+) in both Art and Chess, and (\d+) in both Band and Chess/).slice(1).map(Number);
 const allM=t.match(/(\d+) pupils? (?:is|are) in all three clubs/),noneM=t.match(/(\d+) pupils are in none of the clubs/);
 const fits=[];
 for(let abc=0;abc<=N;abc++){if(allM&&abc!==+allM[1])continue;const ab=AB-abc,ac=AC-abc,bc=BC-abc,a=A-ab-ac-abc,b=Bc-ab-bc-abc,c=Cc-ac-bc-abc,none=N-(a+b+c+ab+ac+bc+abc);
  if([ab,ac,bc,a,b,c,none].some(x=>x<0))continue;if(noneM&&none!==+noneM[1])continue;
  const pupils=[...Array(a).fill('A'),...Array(b).fill('B'),...Array(c).fill('C'),...Array(ab).fill('AB'),...Array(ac).fill('AC'),...Array(bc).fill('BC'),...Array(abc).fill('ABC'),...Array(none).fill('')];
  assert.equal(pupils.length,N);assert.equal(pupils.filter(p=>p.includes('A')).length,A);assert.equal(pupils.filter(p=>p.includes('A')&&p.includes('B')).length,AB);
  fits.push(/in all three clubs\?$/.test(t)?abc:/in none of the clubs\?$/.test(t)?none:pupils.filter(p=>p.length===1).length);}
 assert.deepEqual(fits,[q.answer]);
}));

test('the shared exports agree with the independent checks',()=>{
 assert.equal(Z.routes(4,3)[3][4],35);assert.equal(Z.coinWays(100,[10,20,50]),10);assert.deepEqual(Z.paintedCounts(4,4,4),[8,24,24,8]);
 for(const net of Z.NETS){const face=Z.rollNet(net),nrm=fold3D(net);for(let i=0;i<6;i++)for(let j=0;j<6;j++)assert.equal((face[i]^1)===face[j],nrm[i].every((x,k)=>x===-nrm[j][k]));}
});
