const test=require('node:test'),assert=require('node:assert/strict');
globalThis.window=globalThis;
require('../entrance-data.js');require('../entrance-figures.js');
const B=require('../entrance-bank.js'),X=require('../dsa-extension.js'),D=globalThis.MochiEntranceData,F=globalThis.MochiEntranceFigures,C=require('../path-coach.js');
const SEEDS=Array.from({length:250},(_,i)=>i*7919+13);
const nums=t=>[...t.matchAll(/-?\d+(?:\.\d+)?/g)].map(m=>Number(m[0]));
const near=(a,b,msg,tol=1e-6)=>assert.ok(Math.abs(a-b)<=tol*Math.max(1,Math.abs(b)),`${msg}: ${a} vs ${b}`);
const each=(unit,form,fn)=>{for(const s of SEEDS){const q=B.make(unit,form,s);fn(q,s);}};

test('six challenge units exist, stay out of reserved papers and link to real prerequisites',()=>{
 // Units from separate challenge modules (dsa-<name>.js) carry u.module and are tested in their own files.
 const ext=D.units.filter(u=>u.extension&&!u.module);
 assert.equal(ext.length,6);assert.equal(D.units.filter(u=>!u.module).length,34);
 for(const u of ext){assert.ok(u.ideas.length>=3);assert.ok(u.prerequisites.every(id=>D.units.some(v=>v.id===id&&!v.extension)));assert.ok(u.check[1][u.check[2]]);}
});

// Revision 2 deliberately changes some paper templates (rates, cases and bounds form 3; cases form 1 in
// baseline B). Revision 1 of every template is frozen separately in tests/history-stability.test.cjs.
test('reserved papers and starting checks contain exactly the same questions as revision 2',()=>{
 const crypto=require('node:crypto'),E=require('../entrance-core.js'),S=require('../science-path-core.js');
 const frozen={"maths:baseline-a":"f5f5633bd5d3b9a3","maths:baseline-b":"6521d1768a5fead8","maths:mixed-a":"2b0fab9e2dbfdba6","maths:mixed-b":"9722ccc09a3fc67b","maths:mixed-c":"f86d7d34158680ae","science:baseline-a":"ab467f76e854ad16","science:baseline-b":"7954eab5eafc0e71","science:mixed-a":"17924a13181be34a","science:mixed-b":"eb10c3d6dee17a85","science:mixed-c":"6afa70fc815ee5ae"};
 for(const [name,X] of [['maths',E],['science',S]])for(const id of ['baseline-a','baseline-b','mixed-a','mixed-b','mixed-c']){const d=X.fresh();X.startPaper(d,id,Date.now());const seen=Object.keys(d.seen).sort();assert.ok(seen.length>=6);assert.equal(crypto.createHash('sha256').update(JSON.stringify(seen)).digest('hex').slice(0,16),frozen[name+':'+id],name+':'+id);}
});

test('every question type has a matching Quick check and a worked solution',()=>{
 for(const u of D.units.filter(u=>u.extension))for(let f=0;f<4;f++){const q=B.make(u.id,f,99);assert.ok(q.steps.length>=3,u.id+f);assert.ok(B.mark(q,q.answerLabel),`${u.id}/${f} accepts its own answer`);const d=C.diagnostic('maths',u.id,null,f);assert.ok(d&&d.choices[d.correct]);}
});

test('ticket totals: brute-force search reproduces Saturday’s takings',()=>each('ch-totals',0,q=>{
 const {pa,pc,d,down,up,N}=q.params;let found=null;
 for(let c=d+1;c<2000;c++){const a=c-d;const sun=a*(100-down)/100+c*(100+up)/100;if(Math.abs(sun-N)<1e-9){found=pa*a+pc*c;break;}}
 assert.equal(q.answer,found);
}));

test('leftover statements: brute force finds the same Qi',()=>each('ch-totals',1,q=>{
 const t=q.text,[k1,k2,k3]=[...t.matchAll(/have (\d+) times/g)].map(m=>+m[1]),g=+t.match(/Pia has (\d+) more/)[1];
 let hits=[];const {P,Q,R}=q.params,lim=Math.max(P,Q,R)*3;
 for(let p=1;p<=lim;p++)for(let r=1;r<p;r++){if(p-r!==g)continue;for(let qq=1;qq<=lim;qq++){const T=(k1+1)*(qq+r);const pile=T-p-qq-r;if(pile<=0)continue;if(qq+pile!==k2*(p+r)||r+pile!==k3*(p+qq))continue;if(new Set([p,qq,r]).size<3)continue;hits.push(qq);}}
 assert.deepEqual([...new Set(hits)],[q.answer]);
}));

test('game transfers: forward simulation of every possible start gives one answer',()=>each('ch-totals',2,q=>{
 const t=q.text,N=+t.match(/^(\d+) children/)[1],p=+t.match(/(\d+) more than half of the children at Hoops/)[1],qv=+t.match(/(\d+) fewer than half/)[1],d1=+t.match(/Kites has (\d+) more/)[1],d2=+t.match(/Ladders has (\d+) more than Hoops/)[1];
 const ok=[];for(let A0=0;A0<=N;A0++){let A=A0,Bv=N-A0;if(A%3)continue;Bv+=A/3;A=A*2/3;if(Bv%3)continue;A+=Bv/3;Bv=Bv*2/3;if(A%2||Bv%2)continue;const toA=A/2+p,toB=Bv/2-qv;if(toB<0||toA>A)continue;const C=toA+toB;A-=toA;Bv-=toB;if(C-Bv===d1&&Bv-A===d2)ok.push(A0);}
 assert.deepEqual(ok,[q.answer]);
}));

test('grazing: exact fraction solver agrees and all four clues are consistent',()=>each('ch-totals',3,q=>{
 const [tcg,tcr,tc,tgr]=nums(q.text).filter(n=>n>1).slice(0,4);
 const g=1/tcg-1/tc,r=1/tcr-1/tc,k=g+r-1/tgr,c=1/tc+k;assert.ok(g>0&&r>0&&k>0&&c>0);
 near(1/(c+g+r-k),q.answer,'all three');
}));

test('cycling to the shop: simulate both riders minute by minute',()=>{for(const f of [0,1])each('ch-motion',f,q=>{
 const {vB,e,m}=q.params,vA=vB+e;let half=null;
 for(let h=m+1;h<20000;h++){if(Math.abs((h+m)/vA-(h-m)/vB)<1e-9){half=h;break;}}
 assert.ok(half,'meeting found');assert.equal(q.answer,f===0?half-m:2*half);
});});

test('escalator: continuous model with explicit speeds reproduces the counts',()=>{for(const f of [2,3])each('ch-motion',f,q=>{
 const {k,s1,s2}=q.params,N=f===2?q.answer:q.answer+s1;
 // Walker speed 1 step per unit time. Escalator speed e from the up trip, then check the down trip.
 const e=(N-s1)/s1,downSteps=k*N/(k-e);
 near(downSteps,s2,'down count');assert.ok(e>0&&e<k);
});});

test('quarter circle: the other diagonal equals the radius in coordinates',()=>each('ch-circles',0,q=>{
 const {R,oc}=q.params,D=[oc,Math.sqrt(R*R-oc*oc)];near(Math.hypot(oc-0,0-D[1]),q.answer,'CE');
}));

test('hexagon: area from coordinates on the circle equals k × unit triangle',()=>each('ch-circles',1,q=>{
 const {a,b}=q.params,sides=[a,a,a,b,b,b];let lo=Math.max(a,b)/2+1e-12,hi=1e3;
 for(let i=0;i<300;i++){const rho=(lo+hi)/2,t=sides.reduce((s,x)=>s+2*Math.asin(x/(2*rho)),0);if(t>2*Math.PI)lo=rho;else hi=rho;}
 const rho=(lo+hi)/2;let ang=0;const pts=sides.map(s=>{const p=[rho*Math.cos(ang),rho*Math.sin(ang)];ang+=2*Math.asin(s/(2*rho));return p;});
 const area=Math.abs(pts.reduce((s,p,i)=>{const w=pts[(i+1)%6];return s+p[0]*w[1]-w[0]*p[1];},0))/2;
 near(area/(Math.sqrt(3)/4),q.answer,'k',1e-7);
}));

test('nested circles: repeated geometric construction gives the ratio',()=>each('ch-circles',2,q=>{
 let R=1;for(let i=1;i<q.params.n;i++){const side=R*Math.SQRT2;R=side/2;}near(1/(R*R),q.answer,'ratio');
}));

test('shaded region: grid sampling agrees with the exact π answer',()=>{
 for(const s of [4,6,8,10]){const q=[...SEEDS].map(x=>B.make('ch-circles',3,x)).find(v=>v.params.s===s);if(!q)continue;const p=s/2,n=1200;let hit=0;
  for(let i=0;i<n;i++)for(let j=0;j<n;j++){const x=(i+.5)*s/n,y=(j+.5)*s/n;if(x*x+y*y<=s*s&&(x*x+(y-p)**2>p*p)&&((x-p)**2+y*y>p*p))hit++;}
  near(hit*(s/n)**2,q.answer.a+q.answer.b*Math.PI,'area s='+s,2e-3);}
});

test('grid angles: atan2 sums match',()=>{for(const f of [0,1])for(const rev of [1,2])for(const s of SEEDS){const q=B.make('ch-angles',f,s,rev);
 const sum=q.params.ends.reduce((s,[x,y])=>s+Math.atan2(y,x)*180/Math.PI,0);near(sum,q.answer,'angles');
 const fromText=[...q.text.matchAll(/(\d+) right and (\d+) up/g)].reduce((s,m)=>s+Math.atan2(+m[2],+m[1])*180/Math.PI,0);near(fromText,q.answer,'angles from text');
}});
test('grid angles at revision 2 give at least three different answers per form',()=>{for(const f of [0,1]){const answers=new Set(SEEDS.map(s=>B.make('ch-angles',f,s).answer));assert.ok(answers.size>=3,`form ${f}: ${[...answers]}`);const old=new Set(SEEDS.map(s=>B.make('ch-angles',f,s,1).answer));assert.equal(old.size,1);}});

test('three squares: unit-cell counting gives the area and the outline length',()=>{for(const f of [2,3])each('ch-angles',f,q=>{
 const {a,b,c,p1,p2}=q.params,xs=[0,a-p1,a-p1+b-p2],sz=[a,b,c],W=a+b+c-p1-p2,H=Math.max(a,b,c);
 const filled=(x,y)=>x>=0&&y>=0&&sz.some((s,i)=>x>=xs[i]&&x<xs[i]+s&&y<s);let area=0,per=0;
 for(let x=0;x<W;x++)for(let y=0;y<H;y++)if(filled(x,y)){area++;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]])if(!filled(x+dx,y+dy))per++;}
 assert.equal(q.answer,f===2?area:per);
});});

test('factor counts: direct enumeration of divisors',()=>{for(const f of [0,1])each('ch-number',f,q=>{
 const N=+q.text.match(/factors (?:of|does) (\d+)/)[1],divs=[];for(let d=1;d<=N;d++)if(N%d===0)divs.push(d);
 if(f===0)return assert.equal(q.answer,divs.length);
 const t=q.text,but=t.match(/multiples of (\d+) but not multiples of (\d+)/),odd=t.match(/odd multiples of (\d+)/),sq=/perfect squares/.test(t);
 const keep=but?d=>d%+but[1]===0&&d%+but[2]!==0:odd?d=>d%2===1&&d%+odd[1]===0:sq?d=>Number.isInteger(Math.sqrt(d)):null;
 assert.ok(keep,'recognised condition: '+t);assert.equal(q.answer,divs.filter(keep).length,t);
});});
test('factor counts at revision 1 keep the original odd / multiple questions',()=>{for(const s of SEEDS.slice(0,60)){const q=B.make('ch-number',1,s,1),N=q.params.N,divs=[];for(let d=1;d<=N;d++)if(N%d===0)divs.push(d);const m=q.text.match(/multiples of (\d+)/);assert.equal(q.answer,m?divs.filter(d=>d%+m[1]===0).length:divs.filter(d=>d%2).length);}});

test('difference of squares: search every square up to the limit',()=>each('ch-number',2,q=>{
 const [d1,d2]=nums(q.text);const A=new Set();for(let n=1;n<200;n++){const v=n*n+d1,m=Math.round(Math.sqrt(v+d2));if(m*m===v+d2)A.add(v);}
 assert.equal(q.answer,[...A].reduce((s,v)=>s+v,0));
}));

test('letter sums: exhaustive search confirms exactly one solution and the stated value',()=>{
 for(const z of X.puzzles){const letters=[...new Set(z.a+z.b+z.c)],lead=new Set([z.a[0],z.b[0],z.c[0]]);let sols=[];
  const val=(w,m)=>[...w].reduce((s,ch)=>s*10+m[ch],0);const used=Array(10).fill(false),m={};
  (function rec(i){if(sols.length>1)return;if(i===letters.length){if(val(z.a,m)+val(z.b,m)===val(z.c,m))sols.push(val(z.c,m));return;}for(let d=0;d<10;d++){if(used[d]||(d===0&&lead.has(letters[i])))continue;used[d]=true;m[letters[i]]=d;rec(i+1);used[d]=false;}})(0);
  assert.deepEqual(sols,[z.value],z.a+'+'+z.b+'='+z.c);}
});

test('sequences: rules recomputed from the printed terms',()=>{
 each('ch-sequences',0,q=>{const t=nums(q.text.split(':')[1].split('…')[0]);const d=t.slice(1).map((v,i)=>v-t[i]),dd=d[1]-d[0];assert.ok(d.slice(1).every((v,i)=>v-d[i]===dd));
  // Extend the sequence term by term from the printed terms.
  const ext=[...t];let diff=d.at(-1);while(ext.length<40){diff+=dd;ext.push(ext.at(-1)+diff);}
  const far=q.text.match(/What is the (\d+)th term/),which=q.text.match(/is equal to (\d+)\?/);
  if(far)assert.equal(q.answer,ext[+far[1]-1]);else{assert.ok(which);const hits=ext.map((v,i)=>v===+which[1]?i+1:0).filter(Boolean);assert.deepEqual(hits,[q.answer]);}
  assert.ok(q.answer>=10||which,'asks for a far term, not just the next one');});
 for(const s of SEEDS.slice(0,60)){const q=B.make('ch-sequences',0,s,1),t=nums(q.text.split('?')[1]),d=t.slice(1).map((v,i)=>v-t[i]),dd=d[1]-d[0];assert.equal(q.answer,t.at(-1)+d.at(-1)+dd);}
 each('ch-sequences',1,q=>{const t=nums(q.text.split(':')[1]).slice(0,5);while(t.length<8)t.push(t.at(-1)+t.at(-2));assert.equal(q.answer,t[7]);});
 each('ch-sequences',2,q=>{const [six,seven]=nums(q.text).filter(n=>n>7).slice(-2);let found=[];for(let a=1;a<60;a++)for(let b=1;b<60;b++){const s=[a,b];while(s.length<7)s.push(s.at(-1)+s.at(-2));if(s[5]===six&&s[6]===seven)found.push(a);}assert.deepEqual(found,[q.answer]);});
 each('ch-sequences',3,q=>{const t=nums(q.text.split('?')[1]);const d=t.slice(1).map((v,i)=>v-t[i]),k=d[1]/d[0];assert.ok(d.slice(1).every((v,i)=>v===d[i]*k));assert.equal(q.answer,t.at(-1)+d.at(-1)*k+d.at(-1)*k*k);});
});

test('diagrams render, hide construction lines on independent questions and keep labels inside the frame',()=>{
 for(const [u,forms] of [['ch-circles',[0,1,2,3]],['ch-angles',[0,1,2,3]]])for(const f of forms)for(const s of SEEDS.slice(0,40)){
  const q=B.make(u,f,s),svg=F.diagram(q.figure,q.id);assert.match(svg,/<svg[^>]*role="img"/);assert.match(svg,/<title/);
  if(u==='ch-circles'&&f===0){assert.doesNotMatch(svg,/stroke-dasharray/);assert.match(F.diagram(q.figure,q.id,true),/stroke-dasharray/);}
  const vb=svg.match(/viewBox="0 0 (\d+) (\d+)"/).slice(1).map(Number);
  for(const m of svg.matchAll(/<text x="(-?[\d.]+)" y="(-?[\d.]+)"/g)){assert.ok(+m[1]>=0&&+m[1]<=vb[0]&&+m[2]>=0&&+m[2]<=vb[1],`${u}/${f} label outside frame`);}
 }
});

test('question variety: each type produces many different questions',()=>{
 for(const u of D.units.filter(u=>u.extension))for(let f=0;f<4;f++){const prints=new Set(SEEDS.map(s=>B.make(u.id,f,s).fingerprint));assert.ok(prints.size>=4,`${u.id}/${f} only ${prints.size} variants`);}
});
