// Challenge module "numbers": every answer is recomputed by a different route (big-integer arithmetic,
// enumeration or step-by-step simulation), mostly from the printed question text.
const test=require('node:test'),assert=require('node:assert/strict');
globalThis.window=globalThis;
require('../entrance-data.js');require('../entrance-figures.js');require('../quick-checks.js');
const B=require('../entrance-bank.js'),N=require('../dsa-numbers.js'),D=globalThis.MochiEntranceData,F=globalThis.MochiEntranceFigures,C=require('../path-coach.js');
const SEEDS=Array.from({length:260},(_,i)=>i*7919+13);
const IDS=['nx-digits','nx-cycles','nx-extremes'];
const nums=t=>[...t.matchAll(/\d+/g)].map(m=>Number(m[0]));
const each=(unit,form,fn)=>{for(const s of SEEDS){const q=B.make(unit,form,s);fn(q,s);}};
const byVariant=(unit,form,handlers)=>each(unit,form,q=>{const h=handlers[q.params.variant];assert.ok(h,`${unit}/${form} has a checker for variant ${q.params.variant}`);const got=h(q);assert.equal(q.answer,got,`${unit}/${form} [${q.params.variant}] ${q.text}`);});
const digitSum=n=>String(n).split('').reduce((s,c)=>s+ +c,0);
const DAY_NAMES=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const dayNo=name=>DAY_NAMES.indexOf(name)+1;
const MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];
const isLeap=y=>y%4===0&&(y%100!==0||y%400===0);
const LEN=(m,y)=>[31,isLeap(y)?29:28,31,30,31,30,31,31,30,31,30,31][m];
const step=(y,m,d)=>d<LEN(m,y)?[y,m,d+1]:m<11?[y,m+1,1]:[y+1,0,1];
const zeros=big=>{const s=big.toString();return s.length-s.replace(/0+$/,'').length;};

test('three number challenge units are registered as a module, with lessons, checks and real prerequisites',()=>{
 const mine=D.units.filter(u=>u.module==='numbers');assert.deepEqual(mine.map(u=>u.id),IDS);
 for(const u of mine){assert.equal(u.extension,true);assert.ok(D.strands[u.strand],u.id);assert.equal(u.ideas.length,3);assert.ok(u.prerequisites.length&&u.prerequisites.every(id=>D.units.some(v=>v.id===id&&!v.extension)),u.id);assert.equal(u.check[1].length,3);assert.ok(u.check[1][u.check[2]]);assert.ok(u.check[3]&&u.why);}
 assert.deepEqual(mine.map(u=>u.strand),['number','algebra','logic']);
 assert.equal(globalThis.MochiDSA_numbers,N);
});

test('every form: whole-number answers, worked steps, its own answer accepted, a matching Quick check',()=>{
 for(const id of IDS)for(let f=0;f<4;f++){
  const qc=N.quickChecks[id][f];assert.ok(qc&&qc.choices.length===3&&qc.choices[qc.correct]&&qc.explain,`${id}/${f} quick check`);
  assert.deepEqual(C.diagnostic('maths',id,null,f),qc,`${id}/${f} diagnostic uses the module Quick check`);
  for(const s of SEEDS.slice(0,120)){const q=B.make(id,f,s);assert.ok(Number.isInteger(q.answer)&&q.answer>=0,`${id}/${f} integer answer: ${q.text} => ${q.answer}`);assert.ok(q.steps.length>=3);assert.ok(B.mark(q,q.answerLabel));assert.equal(B.mark(q,String(q.answer+1)),false);assert.deepEqual(q,B.make(id,f,s));assert.doesNotMatch(q.text+q.steps.join(' '),/undefined|NaN|Infinity|\[object/);}
 }
});

test('each form has at least two structurally different variants and many different questions',()=>{
 for(const id of IDS)for(let f=0;f<4;f++){const qs=SEEDS.map(s=>B.make(id,f,s)),variants=new Set(qs.map(q=>q.params.variant)),prints=new Set(qs.map(q=>q.fingerprint));
  assert.ok(variants.size>=2,`${id}/${f} variants ${[...variants]}`);assert.ok(prints.size>=40,`${id}/${f} only ${prints.size} questions`);
  for(const v of variants)assert.ok(qs.filter(q=>q.params.variant===v).length>=15,`${id}/${f} variant ${v} is rare`);}
});

/* ---------- nx-digits ---------- */
test('digits form 0: try every digit in the gaps and test divisibility directly',()=>byVariant('nx-digits',0,{
 nine:q=>{const t=q.text.match(/number (\S+) is/)[1],ok=[...'0123456789'].filter(d=>Number(t.replace('□',d))%9===0);assert.equal(ok.length,1);return +ok[0];},
 eleven:q=>{const t=q.text.match(/number (\S+) is/)[1],ok=[...'0123456789'].filter(d=>Number(t.replace('□',d))%11===0);assert.equal(ok.length,1);return +ok[0];},
 'two-digits':q=>{const t=q.text.match(/number (\S+), the/)[1],m=+q.text.match(/divisible by (\d+)/)[1];let n=0;for(let A=0;A<10;A++)for(let B2=0;B2<10;B2++)if(Number(t.replace('A',A).replace('B',B2))%m===0)n++;return n;}
}));
test('digits form 1: big-integer powers give the last digit or remainder',()=>byVariant('nx-digits',1,{
 'last-digit':q=>{const [b,n]=q.text.match(/(\d+)\^(\d+)/).slice(1).map(BigInt);return Number(b**n%10n);},
 remainder:q=>{const [b,n]=q.text.match(/(\d+)\^(\d+)/).slice(1).map(BigInt),m=BigInt(q.text.match(/divided by (\d+)/)[1]);return Number(b**n%m);},
 product:q=>{const [b1,n1,b2,n2]=q.text.match(/(\d+)\^(\d+) × (\d+)\^(\d+)/).slice(1).map(BigInt);return Number(b1**n1*b2**n2%10n);},
 sum:q=>{const [b1,n1,b2,n2]=q.text.match(/(\d+)\^(\d+) \+ (\d+)\^(\d+)/).slice(1).map(BigInt);return Number((b1**n1+b2**n2)%10n);}
}));
test('digits form 2: multiply out with big integers and count the zeros',()=>{
 const prod=(a,b,f=x=>x)=>{let p=1n;for(let i=a;i<=b;i++)p*=BigInt(f(i));return p;};
 byVariant('nx-digits',2,{
  factorial:q=>zeros(prod(1,+q.text.match(/× … × (\d+)/)[1])),
  range:q=>{const [a,b]=q.text.match(/from (\d+) to (\d+)/).slice(1).map(Number);return zeros(prod(a,b));},
  evens:q=>zeros(prod(1,+q.text.match(/first (\d+) even/)[1],i=>2*i)),
  fives:q=>zeros(prod(1,+q.text.match(/first (\d+) multiples of 5/)[1],i=>5*i))
 });
});
test('digits form 3: search, big-integer remainders and writing out every number',()=>byVariant('nx-digits',3,{
 remainders:q=>{const c=[...q.text.matchAll(/remainder (\d+) when divided by (\d+)/g)].map(m=>[+m[1],+m[2]]);for(let n=1;n<1e5;n++)if(c.every(([r,m])=>n%m===r))return n;return -1;},
 repdigit:q=>{const [,d,n]=q.text.match(/digit (\d) exactly ([\d,]+) times/);const m=BigInt(q.text.match(/divided by (\d+)/)[1]);return Number(BigInt(d.repeat(+n.replace(/,/g,'')))%m);},
 'digit-sum':q=>{const n=+q.text.match(/from 1 to (\d+)/)[1];let s=0;for(let i=1;i<=n;i++)s+=digitSum(i);return s;},
 'digit-count':q=>{const n=+q.text.match(/from 1 to (\d+)/)[1],d=q.text.match(/the digit (\d)/)[1];let c=0;for(let i=1;i<=n;i++)c+=String(i).split(d).length-1;return c;}
}));

/* ---------- nx-cycles ---------- */
test('clocks form 0: count the hands round minute by minute from 12 o’clock',()=>{
 // Positions in half-degrees: the minute hand moves 12 and the hour hand 1 every minute.
 const pos=(h,m)=>{let hour=0,minute=0;for(let t=0;t<60*(h%12)+m;t++){hour=(hour+1)%720;minute=(minute+12)%720;}return [hour,minute];};
 byVariant('nx-cycles',0,{
  angle:q=>{const [h,m]=q.text.match(/at (\d+):(\d+)/).slice(1).map(Number),[a,b]=pos(h,m),d=Math.abs(a-b);return Math.min(d,720-d)/2;},
  'hour-turn':q=>{const [h1,m1,h2,m2]=[...q.text.matchAll(/(\d+):(\d+)/g)].flatMap(x=>[+x[1],+x[2]]);let turn=0;for(let t=60*h1+m1;t<60*h2+m2;t++)turn+=0.5;return turn;},
  gain:q=>{const [h1,m1,h2,m2]=[...q.text.matchAll(/(\d+):(\d+)/g)].flatMap(x=>[+x[1],+x[2]]);let mm=0,hh=0;for(let t=60*h1+m1;t<60*h2+m2;t++){mm+=6;hh+=0.5;}return mm-hh;}
 });
});
test('calendars form 1: step through the days one at a time',()=>byVariant('nx-cycles',1,{
 after:q=>{let w=dayNo(q.text.match(/Today is a (\w+)/)[1]);const n=+q.text.match(/be ([\d,]+) days/)[1].replace(/,/g,'');for(let i=0;i<n;i++)w=w%7+1;return w;},
 before:q=>{let w=dayNo(q.text.match(/Today is a (\w+)/)[1]);const n=+q.text.match(/it ([\d,]+) days ago/)[1].replace(/,/g,'');for(let i=0;i<n;i++)w=w===1?7:w-1;return w;},
 date:q=>{const m=q.text.match(/^(\d+) (\w+) (\d+) is a (\w+)\..*?is (\d+) (\w+) \d+\?/);let [y,mo,d]=[+m[3],MONTHS.indexOf(m[2]),+m[1]],w=dayNo(m[4]);
  assert.equal(N.weekday(y,mo,d),w,'the stated weekday is true');assert.equal(/is not a leap/.test(q.text),!isLeap(y));
  const target=[MONTHS.indexOf(m[6]),+m[5]];while(mo!==target[0]||d!==target[1]){[y,mo,d]=step(y,mo,d);w=w%7+1;}return w;},
 count:q=>{const m=q.text.match(/^(\d+) (\w+) (\d+) is a (\w+)\..*?How many (\w+)s are there from \d+ \w+ to (\d+) (\w+)/);let [y,mo,d]=[+m[3],MONTHS.indexOf(m[2]),+m[1]],w=dayNo(m[4]),c=0;const want=dayNo(m[5]);
  assert.equal(N.weekday(y,mo,d),w);for(;;){if(w===want)c++;if(mo===MONTHS.indexOf(m[7])&&d===+m[6])return c;[y,mo,d]=step(y,mo,d);w=w%7+1;}}
}));
test('laps and trains form 2: simulate positions in small time steps',()=>{
 const runners=q=>{const L=+q.text.match(/track (\d+) m round/)[1],[v1,v2]=[...q.text.matchAll(/at (\d+) m\/min/g)].map(x=>+x[1]),opp=/opposite/.test(q.text);return {L,v1,v2,opp};};
 byVariant('nx-cycles',2,{
  opposite:q=>{const {L,v1,v2}=runners(q);for(let s=1;s<1e6;s++){if((v1*s+v2*s)%(60*L)===0)return s/60;}return -1;},
  same:q=>{const {L,v1,v2}=runners(q);for(let s=1;s<1e6;s++){if((v1*s-v2*s)%(60*L)===0)return s/60;}return -1;},
  'count-opposite':q=>{const {L,v1,v2}=runners(q),T=+q.text.match(/first (\d+) minutes/)[1];let meet=0,prev=0;for(let i=1;i<=T*600;i++){const gap=((v1+v2)*i/600)%L;if(gap<prev)meet++;prev=gap;}return meet;},
  'count-same':q=>{const {L,v1,v2}=runners(q),T=+q.text.match(/first (\d+) minutes/)[1];let meet=0,prev=0;for(let i=1;i<=T*600;i++){const gap=((v1-v2)*i/600)%L;if(gap<prev)meet++;prev=gap;}return meet;},
  gate:q=>{const [a,b]=[...q.text.matchAll(/in (\d+) minutes/g)].map(x=>+x[1]),first=q.text.match(/^(\w+(?: \w+)?) jogs/)[1],asked=q.text.match(/how many laps has (.+) completed/)[1];for(let t=1;t<1e5;t++)if(t%a===0&&t%b===0)return asked===first?t/a:t/b;return -1;},
  platform:q=>{const [L,k,P]=nums(q.text);const v=k*1000/3600;let back=-L;for(let t=1;t<1e5;t++){back+=v;if(back>=P-1e-9)return t;}return -1;},
  'trains-opposite':q=>{const [L1,k1,L2,k2]=nums(q.text);let back1=-L1,back2=L2;for(let t=1;t<1e5;t++){back1+=k1/3.6;back2-=k2/3.6;if(back1>=back2-1e-9)return t;}return -1;},
  'trains-same':q=>{const [L1,k1,L2,k2]=nums(q.text);let fastBack=-L1,slowFront=L2;for(let t=1;t<1e5;t++){fastBack+=k1/3.6;slowFront+=k2/3.6;if(fastBack>=slowFront-1e-9)return t;}return -1;}
 });
});
test('work, months and clock hands form 3: exact checks, month simulation and a fine clock simulation',()=>byVariant('nx-cycles',3,{
 leaves:q=>{const [T,t,s]=nums(q.text);for(let b=1;b<2000;b++)if(t*b+s*(b-T)===T*b)return b;},
 joins:q=>{const [a,b,h]=nums(q.text);for(let x=0;x<=h;x++)if(h*b+x*a===a*b)return x;},
 month:q=>{const len=+q.text.match(/has (\d+) days/)[1],clues=[...q.text.matchAll(/(five|exactly four) (\w+)days/g)].map(m=>({five:m[1]==='five',w:dayNo(m[2]+'day')})),ask=+q.text.match(/the (\d+)\w\w of the month/)[1];
  const starts=[1,2,3,4,5,6,7].filter(s=>clues.every(c=>{let n=0;for(let d=0;d<len;d++)if((s-1+d)%7+1===c.w)n++;return (n===5)===c.five;}));assert.equal(starts.length,1,q.text);return (starts[0]-1+ask-1)%7+1;},
 'clock-together':q=>clockCount(q,[0]),'clock-right':q=>clockCount(q,[360,1080]),'clock-straight':q=>clockCount(q,[720])
}));
// One unit is 1/22 minute; the gap between the hands grows by a quarter-degree per unit (1440 quarter-degrees per turn).
function clockCount(q,targets){const [h1,h2]=nums(q.text).slice(0,2);let n=0;for(let u=h1*60*22+1;u<h2*60*22;u++)if(targets.includes(u%1440))n++;return n;}

/* ---------- nx-extremes ---------- */
test('most and least form 0: enumerate every way of drawing that still fails',()=>{
 const counts=q=>[...q.text.matchAll(/(\d+) (red|blue|green|yellow|white)/g)].map(m=>[m[2],+m[1]]);
 // Largest draw (a count for each colour) that does NOT meet the goal; the answer is one more.
 const worst=(cs,fails)=>{let best=0;const rec=(i,pick)=>{if(i===cs.length){if(fails(pick))best=Math.max(best,pick.reduce((a,b)=>a+b,0));return;}for(let k=0;k<=cs[i][1];k++)rec(i+1,[...pick,k]);};rec(0,[]);return best+1;};
 byVariant('nx-extremes',0,{
  pair:q=>worst(counts(q),p=>p.every(k=>k<2)),
  'two-of-colour':q=>{const cs=counts(q),c=q.text.match(/two (\w+) (?:socks|marbles|sweets)\?/)[1],i=cs.findIndex(x=>x[0]===c);return worst(cs,p=>p[i]<2);},
  'n-same':q=>{const n=+q.text.match(/getting (\d+) of the same/)[1];return worst(counts(q),p=>p.every(k=>k<n));},
  'every-colour':q=>{const need=/at least one of every/.test(q.text)?1:2;return worst(counts(q),p=>p.some(k=>k<need));}
 });
});
test('most and least form 1: list every split or rectangle',()=>{
 const parts=(S,max=S)=>S===0?[[]]:Array.from({length:Math.min(S,max)},(_,i)=>i+1).flatMap(k=>parts(S-k,k).map(p=>[k,...p]));
 byVariant('nx-extremes',1,{
  'any-parts':q=>{const S=+q.text.match(/^(\d+)/)[1];return Math.max(...parts(S).map(p=>p.reduce((a,b)=>a*b,1)));},
  'three-parts':q=>{const S=+q.text.match(/add up to (\d+)/)[1];let best=0;for(let x=0;x<=S;x++)for(let y=x;x+y<=S;y++){const z=S-x-y;if(z>=y)best=Math.max(best,x*y*z);}return best;},
  'four-different':q=>{const S=+q.text.match(/add up to (\d+)/)[1];let best=0;for(let a=0;a<S;a++)for(let b=a+1;a+b<S;b++)for(let c=b+1;a+b+c<S;c++){const d=S-a-b-c;if(d>c)best=Math.max(best,a*b*c*d);}return best;},
  'rect-max':q=>{const P=+q.text.match(/perimeter of (\d+)/)[1];let best=0;for(let l=1;l<P/2;l++)best=Math.max(best,l*(P/2-l));return best;},
  'rect-min':q=>{const P=+q.text.match(/perimeter of (\d+)/)[1];let best=Infinity;for(let l=1;l<P/2;l++)best=Math.min(best,l*(P/2-l));return best;},
  wall:q=>{const F=+q.text.match(/(\d+) m of fencing/)[1];let best=0;for(let x=1;2*x<F;x++)best=Math.max(best,x*(F-2*x));return best;}
 });
});
test('most and least form 2: try every combination of coins, items and bricks',()=>byVariant('nx-extremes',2,{
 coins:q=>{const [c1,c2,c3,Nn]=nums(q.text);let best=Infinity;for(let k=0;k*c3<=Nn;k++)for(let j=0;k*c3+j*c2<=Nn;j++){const i=(Nn-k*c3-j*c2)/c1;best=Math.min(best,i+j+k);}return best;},
 'spend-most':q=>{const [p,pq,Nn]=nums(q.text);let best=0;for(let x=1;x*p<Nn;x++)for(let y=1;x*p+y*pq<=Nn;y++)if(x*p+y*pq===Nn)best=Math.max(best,x+y);return best;},
 'spend-least':q=>{const [p,pq,Nn]=nums(q.text);let best=Infinity;for(let x=1;x*p<Nn;x++)for(let y=1;x*p+y*pq<=Nn;y++)if(x*p+y*pq===Nn)best=Math.min(best,x+y);return best;},
 pack:q=>{const [W,a,u,b,w2]=nums(q.text);let best=0;for(let x=0;x*a<=W;x++)for(let y=0;x*a+y*b<=W;y++)best=Math.max(best,x*u+y*w2);return best;}
}));
test('most and least form 3: brute-force search, class counting and a random construction',()=>{
 const rnd=(()=>{let s=12345;return ()=>(s=(Math.imul(s,1103515245)+12345)>>>0)/4294967296;})();
 const lineCircle=(l,c)=>{const [px,py,dx,dy]=l,[cx,cy,R]=c,fx=px-cx,fy=py-cy,A=dx*dx+dy*dy,Bq=2*(fx*dx+fy*dy),Cq=fx*fx+fy*fy-R*R,disc=Bq*Bq-4*A*Cq;if(disc<=0)return [];const s=Math.sqrt(disc);return [(-Bq+s)/(2*A),(-Bq-s)/(2*A)].map(t=>[px+t*dx,py+t*dy]);};
 const circleCircle=(c1,c2)=>{const [x1,y1,r1]=c1,[x2,y2,r2]=c2,d=Math.hypot(x2-x1,y2-y1);if(d>=r1+r2||d<=Math.abs(r1-r2))return [];const a=(r1*r1-r2*r2+d*d)/(2*d),h=Math.sqrt(r1*r1-a*a),mx=x1+a*(x2-x1)/d,my=y1+a*(y2-y1)/d;return [[mx+h*(y2-y1)/d,my-h*(x2-x1)/d],[mx-h*(y2-y1)/d,my+h*(x2-x1)/d]];};
 const lineLine=(l1,l2)=>{const [x1,y1,a1,b1]=l1,[x2,y2,a2,b2]=l2,den=a1*b2-b1*a2;if(Math.abs(den)<1e-12)return [];const t=((x2-x1)*b2-(y2-y1)*a2)/den;return [[x1+t*a1,y1+t*b1]];};
 const distinct=pts=>{const out=[];for(const p of pts)if(!out.some(q=>Math.hypot(p[0]-q[0],p[1]-q[1])<1e-6))out.push(p);return out;};
 const lines=n=>Array.from({length:n},()=>{const a=rnd()*Math.PI;return [rnd()-.5,rnd()-.5,Math.cos(a),Math.sin(a)];}),circles=n=>Array.from({length:n},()=>[rnd()-.5,rnd()-.5,5]);
 byVariant('nx-extremes',3,{
  'digit-sum-divisor':q=>{const [S,m]=nums(q.text);for(let n=1;n<1e7;n++)if(digitSum(n)===S&&n%m===0)return n;return -1;},
  'distinct-digits':q=>{const S=+q.text.match(/add up to (\d+)/)[1];let best=-1n;const rec=(d,left,str)=>{if(left===0&&str&&!(str[0]==='0'&&str.length>1)){const v=BigInt(str);if(v>best)best=v;}if(d<0)return;rec(d-1,left,str);if(d<=left)rec(d-1,left-d,str+d);};rec(9,S,'');return Number(best);},
  'pair-sum':q=>{const [n,d]=nums(q.text).slice(1);const size=k=>Array.from({length:n},(_,i)=>i+1).filter(x=>x%d===k).length;let best=0;
   for(let mask=0;mask<1<<d;mask++){const rs=[...Array(d).keys()].filter(k=>mask>>k&1);if(rs.some((r1,i)=>rs.some((r2,j)=>i<j&&(r1+r2)%d===0)))continue;best=Math.max(best,rs.reduce((s,k)=>s+((2*k)%d===0?Math.min(1,size(k)):size(k)),0));}return best+1;},
  crossings:q=>{const [L,Cn]=nums(q.text),ls=lines(L),cs=circles(Cn),pts=[];ls.forEach((l,i)=>{ls.slice(i+1).forEach(m=>pts.push(...lineLine(l,m)));cs.forEach(c=>pts.push(...lineCircle(l,c)));});cs.forEach((c,i)=>cs.slice(i+1).forEach(e=>pts.push(...circleCircle(c,e))));return distinct(pts).length;},
  'circle-regions':q=>{const Cn=+q.text.match(/^(\d+) circles/)[1],cs=circles(Cn);let V=[],E=0;cs.forEach((c,i)=>{const on=distinct(cs.flatMap((e,j)=>i===j?[]:circleCircle(c,e)));E+=on.length;V.push(...on);});V=distinct(V);return E-V.length+2;}
 });
});

test('fixed parameter families are valid',()=>{
 for(const [b,m] of N.powerMods){const c=N.cycle(b,m);assert.ok(c.length<=6);assert.equal(c[0],b%m);}
 for(const t of N.crtTriples)assert.ok(t.every((a,i)=>t.every((b,j)=>i===j||(()=>{let x=a,y=b;while(y)[x,y]=[y,x%y];return x===1;})())));
 for(const s of N.workSets){assert.equal(1/s.a+1/s.b,1/s.T*1+(1/s.a+1/s.b-1/s.T));assert.equal(s.T*s.a*s.b%1,0);assert.ok(Math.abs(1/s.a+1/s.b-1/s.T)<1e-12&&Math.abs(s.t/s.T+s.s/s.a-1)<1e-12);}
 for(const s of N.pipeSets)assert.ok(Math.abs(s.h/s.a+s.x/s.b-1)<1e-12&&s.x<s.h);
 for(let S=2;S<=30;S++){let best=0;const rec=(left,max,prod)=>{if(left===0){best=Math.max(best,prod);return;}for(let k=Math.min(left,max);k>=1;k--)rec(left-k,k,prod*k);};rec(S,S,1);assert.equal(N.bestSplit(S),best,'split '+S);}
});

test('clock and track figures render inside their frames',()=>{
 for(const [id,f] of [['nx-cycles',0],['nx-cycles',2]])for(const s of SEEDS.slice(0,80)){const q=B.make(id,f,s);if(!q.figure)continue;assert.equal(q.figure.module,'numbers');
  for(const help of [false,true]){const svg=F.diagram(q.figure,q.id,help);assert.match(svg,/<svg[^>]*role="img"/);assert.match(svg,/<title/);assert.doesNotMatch(svg,/NaN|undefined|Infinity/);
   const vb=svg.match(/viewBox="0 0 (\d+) (\d+)"/).slice(1).map(Number);for(const m of svg.matchAll(/<text x="(-?[\d.]+)" y="(-?[\d.]+)"/g))assert.ok(+m[1]>=0&&+m[1]<=vb[0]&&+m[2]>=0&&+m[2]<=vb[1],`${id}/${f} label outside frame`);}}
 const clocks=SEEDS.map(s=>B.make('nx-cycles',0,s)).filter(q=>q.figure?.kind==='nx-clock');assert.ok(clocks.length>40);
 const tracks=SEEDS.map(s=>B.make('nx-cycles',2,s)).filter(q=>q.figure?.kind==='nx-track');assert.ok(tracks.length>40);
});

test('module units stay out of the reserved mixed papers',()=>{
 const E=require('../entrance-core.js');for(const p of E.paperDefinitions)assert.ok(p.units.every(id=>!IDS.includes(id)),p.id);
});
