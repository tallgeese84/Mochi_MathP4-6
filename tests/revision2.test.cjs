// Revision 2 fixes from the content audit. Revision 1 stays frozen (tests/history-stability.test.cjs);
// these tests check the new behaviour at explicitly pinned revision 2 and recompute every changed template.
const test=require('node:test'),assert=require('node:assert/strict');
globalThis.window=globalThis;
require('../entrance-data.js');
const Bank=require('../entrance-bank.js'),B={...Bank,make:(u,f,s,rev=2)=>Bank.make(u,f,s,rev)};
const SEEDS=Array.from({length:300},(_,i)=>(i*104729+7)>>>0);
const nums=t=>[...t.matchAll(/\d+(?:\.\d+)?/g)].map(m=>Number(m[0]));
const range=(a,b)=>Array.from({length:b-a+1},(_,i)=>a+i);

test('revision 2 remains explicitly available alongside frozen revision 1',()=>{
 assert.ok(B.REV>=2);const a=B.make('invariants',0,5,1),b=B.make('invariants',0,5);assert.equal(a.answer,'No');assert.deepEqual(b,B.make('invariants',0,5,2));
});

test('rates: every form gives a whole-number answer over 300 seeds',()=>{
 for(let f=0;f<4;f++)for(const s of SEEDS){const q=B.make('rates',f,s);assert.ok(Number.isInteger(q.answer),`rates/${f}: ${q.text} => ${q.answer}`);assert.equal(q.answerLabel,String(q.answer));}
 assert.ok(SEEDS.some(s=>!Number.isInteger(B.make('rates',3,s,1).answer)),'revision 1 keeps its original (fractional) questions');
});

test('rates form 3: simulating the tank minute by minute gives the same time',()=>{for(const s of SEEDS){const q=B.make('rates',3,s);
 const [inflow,rate,first]=nums(q.text),pumps=/three identical/.test(q.text)?3:2;let water=0;for(let t=0;t<first;t++)water-=inflow-rate;// one pump empties it in `first` minutes
 let t=0;while(water>0){water+=inflow-pumps*rate;t++;}assert.equal(water,0,'empties exactly at a whole minute');assert.equal(q.answer,t);}});

test('invariants form 0: Yes and No both occur, and a search of reachable numbers agrees',()=>{
 const counts={Yes:0,No:0};for(const s of SEEDS){const q=B.make('invariants',0,s),[start,a,b,target]=[+q.text.match(/Start with (\d+)/)[1],+q.text.match(/add (\d+)/)[1],+q.text.match(/subtract (\d+)/)[1],+q.text.match(/reach (\d+)/)[1]];
  const seen=new Set([start]),queue=[start];while(queue.length){const v=queue.shift();for(const w of [v+a,v-b])if(w>=-400&&w<=800&&!seen.has(w)){seen.add(w);queue.push(w);}}
  assert.equal(q.answer,seen.has(target)?'Yes':'No',q.text);counts[q.answer]++;
  if(q.answer==='Yes'){const m=q.steps.at(-1).match(/(\d+) moves? of \+(\d+)(?: and (\d+) moves? of −(\d+))?/);assert.ok(m,'a route is given');assert.equal(start+m[1]*m[2]-(m[3]||0)*(m[4]||0),target,'the route works');}}
 assert.ok(counts.Yes>=0.35*SEEDS.length&&counts.No>=0.35*SEEDS.length,JSON.stringify(counts));
});

test('cases forms 0 and 1: many different puzzles, each with one consistent answer found by testing every case',()=>{
 for(const f of [0,1]){const texts=new Set();for(const s of SEEDS){const q=B.make('cases',f,s),t=q.text;texts.add(t);
  const st=f===0?[...t.matchAll(/([A-D]): “The \w+ is (not )?in ([A-D])\.”/g)].map(m=>({who:m[1],not:!!m[2],ref:m[3]})):[...t.matchAll(/([A-Z][a-z]+): “(I|[A-Z][a-z]+) did( not)? (?:do )?it\.”/g)].map(m=>({who:m[1],not:!!m[3],ref:m[2]==='I'?m[1]:m[2]}));
  assert.ok(st.length>=3,t);const k=/Exactly one (?:label is true|of them is telling the truth)/.test(t)?1:st.length-1,fits=st.map(x=>x.who).filter(c=>st.filter(x=>x.not?c!==x.ref:c===x.ref).length===k);
  assert.deepEqual(fits,[q.answer],t);assert.deepEqual(q.choices,st.map(x=>x.who));
  // Two statements are exact opposites (the relationship the Quick check asks about).
  assert.ok(st.some((x,i)=>st.some((y,j)=>i<j&&x.ref===y.ref&&x.not!==y.not)));}
  assert.ok(texts.size>=50,`cases/${f} has ${texts.size} texts`);}
});

test('cases form 3 is a multi-condition search: brute force over every candidate finds the unique answer',()=>{
 const kinds=new Set();for(const s of SEEDS){const q=B.make('cases',3,s),t=q.text;kinds.add(q.params.variant);assert.ok(q.steps.length>=4);
  if(q.params.variant==='digits'){const S=+t.match(/add up to (\d+)/)[1],k=+t.match(/digit is (\d+) more/)[1],m=+t.match(/divisible by (\d+)/)[1],diff=/all different/.test(t);
   const hits=range(100,999).filter(n=>{const d=String(n).split('').map(Number);return d[0]+d[1]+d[2]===S&&d[0]-d[2]===k&&n%m===0&&(!diff||new Set(d).size===3);});assert.deepEqual(hits,[q.answer],t);}
  else{const list=[...t.matchAll(/\(\d\) ([^(]+?\.)(?= \(|\s*What)/g)].map(m=>m[1]);assert.equal(list.length,4);
   const holds=(st,n)=>{let m;if(m=st.match(/multiple of (\d+)/))return n%+m[1]===0;if(m=st.match(/greater than (\d+)/))return n>+m[1];if(m=st.match(/less than (\d+)/))return n<+m[1];if(m=st.match(/add up to (\d+)/))return String(n).split('').reduce((a,c)=>a+ +c,0)===+m[1];if(/square/.test(st))return Number.isInteger(Math.sqrt(n));if(/odd/.test(st))return n%2===1;return n%2===0;};
   assert.deepEqual(range(1,60).filter(n=>list.filter(st=>holds(st,n)).length===3),[q.answer],t);}}
 assert.deepEqual([...kinds].sort(),['digits','statements']);
});

test('bounds form 3 needs a bound and a construction: brute force agrees',()=>{
 const kinds=new Set();for(const s of SEEDS){const q=B.make('bounds',3,s),p=q.params;kinds.add(p.variant);assert.ok(q.steps.length>=4);
  if(p.variant==='five-numbers'){let best=0;for(let a=1;a<p.L;a++)for(let b=a+1;b<p.L;b++)for(let c=b+1;c<p.L;c++){const d=p.T-p.L-a-b-c;if(d>c&&d<p.L)best=Math.max(best,a);}assert.equal(q.answer,best);}
  else{const [N,a,b,c]=nums(q.text);let found=null;
   for(let t=0;t<=Math.min(a,b,c)&&found===null;t++)for(let ab=0;ab<=a-t&&found===null;ab++)for(let ac=0;ac<=a-t-ab&&found===null;ac++)for(let bc=0;bc<=b-t-ab&&bc<=c-t-ac;bc++){const xa=a-t-ab-ac,xb=b-t-ab-bc,xc=c-t-ac-bc;if(xb>=0&&xc>=0&&xa+xb+xc+ab+ac+bc+t<=N){found=t;break;}}
   assert.equal(q.answer,found,q.text);}}
 assert.deepEqual([...kinds].sort(),['five-numbers','three-sets']);
});

test('percent: money with cents always shows two decimal places, and the price checks out',()=>{
 let cents=0;for(const s of SEEDS){const q=B.make('percent',2,s);assert.doesNotMatch(q.text+q.steps.join(' '),/\$\d+\.\d(?!\d)/,q.text);
  const [p,sd,paid]=nums(q.text);if(paid%1){cents++;assert.match(q.text,/\$\d+\.\d\d\b/);}assert.ok(Math.abs(q.answer*(100-p)*(100-sd)/10000-paid)<1e-9);}
 assert.ok(cents>10,'some prices have cents');
 assert.ok(SEEDS.some(s=>/\$\d+\.5\./.test(B.make('percent',2,s,1).text)),'revision 1 text is unchanged');
});

test('transfer bank: ratios are in simplest form and never k:k',()=>{
 const T=require('../transfer-bank.js'),gcd=(a,b)=>b?gcd(b,a%b):a;let seen=0;
 for(const g of T.generators)for(let i=0;i<1500;i++){const q=g();for(const m of q.text.matchAll(/(\d+) ?: ?(\d+)/g)){seen++;const a=+m[1],b=+m[2];assert.notEqual(a,b,q.text);assert.equal(gcd(a,b),1,q.text);}}
 assert.ok(seen>1000);
});

test('challenge items at revision 2: harder factor and sequence questions, varied grid angles',()=>{
 const sq=new Set(),angles=[new Set(),new Set()];
 for(const s of SEEDS){const q=B.make('ch-number',1,s);assert.ok(q.params.N>=360,q.text);sq.add(q.params.cond);
  const t=B.make('ch-sequences',0,s);assert.ok(/(\d+)th term|Which term/.test(t.text));
  for(const f of [0,1])angles[f].add(B.make('ch-angles',f,s).answer);}
 assert.ok(sq.size>=6,[...sq].join());assert.ok(angles[0].size>=3&&angles[1].size>=3,JSON.stringify(angles.map(a=>[...a])));
});
