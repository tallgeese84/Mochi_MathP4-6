// v7.12 contest module: every answer is recomputed by a different route from the printed question
// (coordinates and the shoelace formula, Heron's formula, brute-force enumeration of outcomes).
const test=require('node:test'),assert=require('node:assert/strict');
globalThis.window=globalThis;
require('../entrance-data.js');require('../entrance-figures.js');require('../quick-checks.js');
const B=require('../entrance-bank.js'),K=require('../dsa-contest.js'),D=globalThis.MochiEntranceData,F=globalThis.MochiEntranceFigures,C=require('../path-coach.js');
const SEEDS=Array.from({length:260},(_,i)=>i*7919+13),IDS=['amc-right','amc-chance','amc-coords'];
const near=(a,b,msg)=>assert.ok(Math.abs(a-b)<1e-9,`${msg}: ${a} vs ${b}`);
const N=s=>Number(String(s).replace('−','-'));
const points=t=>Object.fromEntries([...t.matchAll(/([A-Z])\((−?\d+), (−?\d+)\)/g)].map(m=>[m[1],[N(m[2]),N(m[3])]]));
const shoelace=p=>Math.abs(p.reduce((s,v,i)=>{const w=p[(i+1)%p.length];return s+v[0]*w[1]-w[0]*v[1];},0))/2;
const dist=(p,q)=>Math.hypot(p[0]-q[0],p[1]-q[1]);
const DICE=[1,2,3,4,5,6],pairs=f=>{let n=0;for(const a of DICE)for(const b of DICE)if(f(a,b))n++;return n;};
const isPrime=n=>n>1&&[...Array(n).keys()].slice(2).every(d=>n%d);
const gcd=(a,b)=>b?gcd(b,a%b):a;
function each(unit,form,handlers){
 const seen=new Set();
 for(const s of SEEDS){const q=B.make(unit,form,s),h=handlers[q.params.variant];assert.ok(h,`${unit}/${form} has a checker for ${q.params.variant}`);seen.add(q.params.variant);
  const got=h(q);if(Array.isArray(got)){const [n,d]=got;near(q.answer,n/d,q.text);const g=gcd(n,d);assert.equal(q.answerLabel,d/g===1?String(n/g):`${n/g}/${d/g}`,'simplest form: '+q.text);}else near(q.answer,got,q.text);}
 assert.deepEqual([...seen].sort(),Object.keys(handlers).sort(),`${unit}/${form} variants all appear`);
}

test('three contest units are a registered module with lessons, checks and real prerequisites',()=>{
 const mine=D.units.filter(u=>u.module==='contest');assert.deepEqual(mine.map(u=>u.id),IDS);assert.ok(D.DSA_MODULES.includes('contest'));assert.equal(globalThis.MochiDSA_contest,K);
 for(const u of mine){assert.equal(u.extension,true);assert.equal(u.contest,true);assert.ok(D.strands[u.strand]);assert.equal(u.ideas.length,3);assert.ok(u.prerequisites.length&&u.prerequisites.every(id=>D.units.some(v=>v.id===id&&!v.extension)),u.id);assert.equal(u.check[1].length,3);assert.ok(u.check[1][u.check[2]]&&u.check[3]&&u.why);}
});

test('every form: worked steps, its own answer accepted, a wrong one refused, deterministic, a Quick check',()=>{
 for(const id of IDS)for(let f=0;f<4;f++){
  const qc=K.quickChecks[id][f];assert.ok(qc&&qc.choices.length===3&&qc.choices[qc.correct]&&qc.explain);assert.deepEqual(C.diagnostic('maths',id,null,f),qc);
  const prints=new Set();
  for(const s of SEEDS){const q=B.make(id,f,s);prints.add(q.fingerprint);assert.ok(q.steps.length>=3);assert.ok(B.mark(q,q.answerLabel),q.answerLabel);assert.equal(B.mark(q,String(q.answer+1)),false);assert.deepEqual(q,B.make(id,f,s));
   assert.doesNotMatch(q.text+q.steps.join(' ')+q.answerLabel,/undefined|NaN|Infinity|\[object/);
   if(q.figure){const svg=F.diagram(q.figure,q.id);assert.match(svg,/^<svg/);assert.doesNotMatch(svg,/NaN|undefined/);}}
  assert.ok(prints.size>=40,`${id}/${f}: ${prints.size} distinct questions`);
 }
});

test('right triangles: Pythagoras, Heron, coordinates and direct search agree',()=>{
 each('amc-right',0,{
  hyp:q=>{const [a,b]=q.text.match(/shorter sides (\d+) cm and (\d+) cm/).slice(1).map(Number);return Math.hypot(a,b);},
  leg:q=>{const [c,a]=q.text.match(/longest side (\d+) cm and one shorter side (\d+) cm/).slice(1).map(Number);return Math.sqrt(c*c-a*a);},
  root:q=>{const A=+q.text.match(/area of (\d+) cm²/)[1];let s=0;while(s*s<A)s++;assert.equal(s*s,A);return s;}
 });
 each('amc-right',1,{
  diagonal:q=>{const [a,b]=q.text.match(/(\d+) m long and (\d+) m wide/).slice(1).map(Number);return dist([0,0],[a,b]);},
  ladder:q=>{const [c,a]=q.text.match(/ladder (\d+) m long[\s\S]*?, (\d+) m from the wall/).slice(1).map(Number);let h=0;while(h*h+a*a<c*c)h++;return h;},
  walk:q=>{const e=[...q.text.matchAll(/(\d+) m east/g)].reduce((s,m)=>s+ +m[1],0),n=[...q.text.matchAll(/(\d+) m north/g)].reduce((s,m)=>s+ +m[1],0);return dist([0,0],[e,n]);},
  between:q=>{const n=+q.text.match(/square root of (\d+)/)[1];let k=0;while((k+1)*(k+1)<=n)k++;assert.ok(k*k<n);return k;}
 });
 each('amc-right',2,{
  isosceles:q=>{const [s,b]=q.text.match(/two sides of length (\d+) cm\. Its third side, the base, is (\d+) cm/).slice(1).map(Number),p=(2*s+b)/2;return Math.sqrt(p*(p-s)*(p-s)*(p-b));},
  rhombus:q=>{const [d1,d2]=q.text.match(/are (\d+) cm and (\d+) cm long/).slice(1).map(Number),P=[[d1/2,0],[0,d2/2],[-d1/2,0],[0,-d2/2]];return P.reduce((t,p,i)=>t+dist(p,P[(i+1)%4]),0);},
  perimeter:q=>{const [A,a]=q.text.match(/area of (\d+) cm²\. One of its two shorter sides is (\d+) cm/).slice(1).map(Number),P=[[0,0],[a,0],[0,2*A/a]];return dist(P[0],P[1])+dist(P[1],P[2])+dist(P[2],P[0]);},
  tilted:q=>{const a=+q.text.match(/DS = (\d+) cm/)[1],b=+q.text.match(/SA = (\d+) cm/)[1],s=a+b;return shoelace([[a,0],[s,a],[s-a,s],[0,s-a]]);}
 });
 each('amc-right',3,{
  box:q=>{const e=q.text.match(/measures (\d+) cm by (\d+) cm by (\d+) cm/).slice(1).map(Number);return dist([0,0],[dist([0,0],[e[0],e[1]]),e[2]]);},
  trapezoid:q=>{const [p,Q,s]=q.text.match(/parallel sides of (\d+) cm and (\d+) cm\. Its other two sides are both (\d+) cm/).slice(1).map(Number),o=(Q-p)/2,h=Math.sqrt(s*s-o*o);return shoelace([[0,0],[Q,0],[o+p,h],[o,h]]);},
  shortcut:q=>{const [a,b]=q.text.match(/park is (\d+) m by (\d+) m/).slice(1).map(Number);return a+b-dist([0,0],[a,b]);}
 });
 for(const [a,b,c,d] of K.QUADS)assert.equal(a*a+b*b+c*c,d*d);for(const [a,b,c] of K.TRIPLES)assert.equal(a*a+b*b,c*c);
});

test('probability: enumerate every equally likely outcome',()=>{
 const DIE={'an even number':x=>x%2===0,'a prime number':isPrime,'a multiple of 3':x=>x%3===0,'a factor of 6':x=>6%x===0,'an odd number':x=>x%2===1};
 const PROD={even:p=>p%2===0,odd:p=>p%2===1,'a multiple of 3':p=>p%3===0,'a multiple of 4':p=>p%4===0,'a square number':p=>Number.isInteger(Math.sqrt(p))};
 each('amc-chance',0,{
  bag:q=>{const [r,b,g,col]=q.text.match(/holds (\d+) red, (\d+) blue and (\d+) green marbles[\s\S]*that it is (\w+)\?/).slice(1),bag=[...Array(+r).fill('red'),...Array(+b).fill('blue'),...Array(+g).fill('green')];return [bag.filter(x=>x===col).length,bag.length];},
  dice:q=>{const desc=q.text.match(/probability of rolling (.+)\? Give/)[1],gt=desc.match(/greater than (\d)/),lt=desc.match(/less than (\d)/),f=gt?x=>x>+gt[1]:lt?x=>x<+lt[1]:DIE[desc];return [DICE.filter(f).length,6];},
  spinner:q=>{const [n,m]=q.text.match(/(\d+) equal sections[\s\S]*multiple of (\d+)/).slice(1).map(Number);return [[...Array(n).keys()].map(i=>i+1).filter(x=>x%m===0).length,n];}
 });
 each('amc-chance',1,{
  sum:q=>{const desc=q.text.match(/add up to (.+)\? Give/)[1],e=desc.match(/^exactly (\d+)$/),m=desc.match(/^(\d+) or more$/),l=desc.match(/^(\d+) or less$/),f=e?t=>t===+e[1]:m?t=>t>=+m[1]:l?t=>t<=+l[1]:{'an even number':t=>t%2===0,'a prime number':isPrime,'a multiple of 3':t=>t%3===0}[desc];return [pairs((a,b)=>f(a+b)),36];},
  coins:q=>{const n=+q.text.match(/(\d) fair coins/)[1],desc=q.text.match(/getting (.+)\? Give/)[1],e=desc.match(/exactly (\d)/),m=desc.match(/at most (\d)/),f=e?h=>h===+e[1]:m?h=>h<=+m[1]:h=>h>n-h;let c=0;for(let x=0;x<2**n;x++)if(f(x.toString(2).split('1').length-1))c++;return [c,2**n];},
  'at-least':q=>{const c=q.text.match(/(\d) fair coins are tossed\. What is the probability of getting at least one head/);if(c){const n=+c[1];let k=0;for(let m=0;m<2**n;m++)if(m)k++;return [k,2**n];}const t=q.text.match(/shows (a 6|(\d) or more)/),lim=t[2]?+t[2]:6;return [pairs((a,b)=>a>=lim||b>=lim),36];}
 });
 each('amc-chance',2,{
  'no-replace':q=>{const [r,b]=q.text.match(/holds (\d+) red and (\d+) blue/).slice(1).map(Number),bag=[...Array(r).fill('r'),...Array(b).fill('b')],both=/both counters are red/.test(q.text);let fav=0,all=0;bag.forEach((x,i)=>bag.forEach((y,j)=>{if(i===j)return;all++;if(both?x==='r'&&y==='r':x!==y)fav++;}));return [fav,all];},
  'number-pick':q=>{const [n,a,b]=q.text.match(/from 1 to (\d+)[\s\S]*multiple of (\d+) or a multiple of (\d+)/).slice(1).map(Number);let c=0;for(let x=1;x<=n;x++)if(x%a===0||x%b===0)c++;return [c,n];},
  product:q=>{const desc=q.text.match(/the product is (.+)\? Give/)[1],g=desc.match(/greater than (\d+)/),f=g?p=>p>+g[1]:PROD[desc];return [pairs((a,b)=>f(a*b)),36];}
 });
 each('amc-chance',3,{
  max:q=>{const k=+q.text.match(/is exactly (\d)/)[1];return [pairs((a,b)=>Math.max(a,b)===k),36];},
  pair:q=>{const [a,g]=q.text.match(/(\d+) boys and (\d+) girls/).slice(1).map(Number),kids=[...Array(a).fill('b'),...Array(g).fill('g')],want=q.text.match(/that (.+)\? Give/)[1];let fav=0,all=0;for(let i=0;i<kids.length;i++)for(let j=i+1;j<kids.length;j++){all++;const s=kids[i]+kids[j];if(want.startsWith('one')?s==='bg'||s==='gb':want.includes('girls')?s==='gg':s==='bb')fav++;}return [fav,all];},
  diff:q=>{const d=+q.text.match(/differ by exactly (\d)/)[1];return [pairs((a,b)=>Math.abs(a-b)===d),36];}
 });
});

test('coordinates and negative numbers: distances, the shoelace formula and a safe parser',()=>{
 each('amc-coords',0,{
  temperature:q=>{const [t,dir,u]=q.text.match(/was (−?\d+)°C\. By noon it had (risen|fallen) by (\d+)°C/).slice(1);return N(t)+(dir==='risen'?1:-1)*N(u);},
  distance:q=>{const [a,b]=q.text.match(/apart are (−?\d+) and (−?\d+)/).slice(1).map(N);return Math.abs(b-a);},
  evaluate:q=>B.parse(q.text.match(/Work out (.+)\.$/)[1])[0]
 });
 each('amc-coords',1,{
  segment:q=>{const p=points(q.text);return dist(p.A,p.B);},
  rectangle:q=>shoelace([...q.text.matchAll(/\((−?\d+), (−?\d+)\)/g)].map(m=>[N(m[1]),N(m[2])])),
  reflect:q=>{const p=points(q.text).P,axis=q.text.match(/in the (x|y)-axis/)[1],[k,dir]=q.text.match(/moved (\d+) units (up|down|left|right)/).slice(1);let [x,y]=axis==='y'?[-p[0],p[1]]:[p[0],-p[1]];x+=dir==='right'?+k:dir==='left'?-k:0;y+=dir==='up'?+k:dir==='down'?-k:0;return x+y;},
  midpoint:q=>{const p=points(q.text),i=q.text.match(/the (x|y)-coordinate of (M|B)\?/),c=i[1]==='x'?0:1;return i[2]==='M'?(p.A[c]+p.B[c])/2:2*p.M[c]-p.A[c];}
 });
 each('amc-coords',2,{
  triangle:q=>{const p=points(q.text);return shoelace([p.A,p.B,p.C]);},
  enclose:q=>{const p=points(q.text);return shoelace([p.A,p.B,p.C]);},
  tilted:q=>{const p=points(q.text),dx=p.B[0]-p.A[0],dy=p.B[1]-p.A[1];return shoelace([p.A,p.B,[p.B[0]-dy,p.B[1]+dx],[p.A[0]-dy,p.A[1]+dx]]);}
 });
 each('amc-coords',3,{
  distance:q=>{const p=points(q.text);return dist(p.P,p.Q);},
  quad:q=>{const p=points(q.text),P=[p.P,p.Q,p.R,p.S],xs=P.map(v=>v[0]),ys=P.map(v=>v[1]);
   // Each corner lies on a different side of the surrounding rectangle, so the shape is simple and in order.
   assert.equal(p.P[1],Math.min(...ys));assert.equal(p.Q[0],Math.max(...xs));assert.equal(p.R[1],Math.max(...ys));assert.equal(p.S[0],Math.min(...xs));return shoelace(P);},
  path:q=>{const p=points(q.text);return dist(p.A,p.B)+dist(p.B,p.C);}
 });
});
