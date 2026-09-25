const test=require('node:test'),assert=require('node:assert/strict'),D=require('../entrance-data.js'),B=require('../entrance-bank.js'),F=require('../entrance-figures.js');
const near=(a,b,m)=>assert.ok(Math.abs(a-b)<1e-8,`${m}: ${a} versus ${b}`);
const range=(a,b)=>Array.from({length:b-a+1},(_,i)=>a+i),sum=a=>a.reduce((n,x)=>n+x,0),factors=n=>range(1,n).filter(x=>n%x===0);
const common=(a,b)=>{let n=a;while(n%b)n+=a;return n;};
const coordinate=(N)=>{let x=0,y=0,dir=0,s=0;for(let length=1;s<N;length++){for(let twice=0;twice<2&&s<N;twice++,dir++){let moved=0;while(moved<length&&s<N){const v=[[1,0],[0,1],[-1,0],[0,-1]][dir%4];x+=v[0];y+=v[1];s++;moved++;}if(s===N)return {x,y,last:moved};}}return {x,y,last:0};};
const brutePacks=(budget,costs,counts)=>{let max=0;for(let a=0;a*costs[0]<=budget;a++)for(let b=0;a*costs[0]+b*costs[1]<=budget;b++)for(let c=0;c<=(costs[2]?Math.floor((budget-a*costs[0]-b*costs[1])/costs[2]):0);c++)max=Math.max(max,a*counts[0]+b*counts[1]+c*(counts[2]||0));return max;};
function independentlySolve(q){const p=q.params,f=q.form;
 switch(q.unit){
 case 'relationships':return [()=>p.x,()=>range(0,p.total).find(x=>x+(x+p.difference)===p.total),()=>range(1,200).find(d=>(d+p.excess)/3===d-p.short),()=>sum([p.a,p.b])/2][f]();
 case 'percent':return [()=>p.price+p.price*p.rate/100,()=>p.paid*100/(100-p.rate),()=>p.paid/((1-p.p/100)*(1-p.s/100)),()=>range(0,1000).find(n=>Math.abs(.9*n+1.2*(n+p.difference)-p.total)<1e-8)][f]();
 case 'remainders':return [()=>p.whole-p.whole/3-(p.whole-p.whole/3)/4,()=>range(0,300).find(n=>3*n/4-p.fixed===p.left),()=>4*(p.left+p.fixed),()=>range(0,p.total).find(a=>((p.total-a)+a/3)*3/4===p.finalB)][f]();
 case 'simultaneous':return [()=>range(0,p.total).find(n=>4*n+2*(p.total-n)===p.wheels),()=>range(1,100).find(n=>Math.abs((p.one-2*n)/3-(p.two-4*n))<1e-8),()=>range(1,40).find(c=>5*(c-p.years)+p.years===3*(c+p.years)-p.years),()=>{for(let n=1;n<50;n++)for(let b=1;b<50;b++)if(3*n+2*b===p.one&&2*n+5*b===p.two)return 4*n+3*b;}][f]();
 case 'ratios':return [()=>p.white+p.white*p.a/p.b,()=>range(1,500).find(k=>2*k/(3*k+p.added)===3/8)*5,()=>range(1,500).find(k=>5*k-p.moved===3*k+p.moved)*8,()=>1/(1/p.a+1/p.b)][f]();
 case 'rates':return [()=>p.target*p.time/p.count,()=>1/(1/p.a+1/p.b),()=>p.target/(p.count/p.time-p.first/4),()=>p.first*(p.rate-p.inflow)/(2*p.rate-p.inflow)][f]();
 case 'motion':return [()=>p.distance/(p.a+p.b),()=>2*p.leg/(p.leg/p.a+p.leg/p.b),()=>p.distance*p.messenger/(p.a+p.b),()=>2*p.walk/(1/p.withTime+1/p.againstTime)][f]();
 case 'capacity':return [()=>p.usedLarge*p.small/p.large,()=>range(0,p.large).filter(n=>(p.usedLarge+n)/p.large+p.usedSmall/p.small<=1+1e-10).at(-1),()=>range(0,p.a).find(n=>n/p.a>=p.taken/p.b),()=>p.count+Math.floor((p.capacity-p.count*5)/3)][f]();
 case 'area':return [()=>p.b*p.h/2,()=>p.area*p.b/p.a,()=>p.total*p.b/(p.a+p.b+p.c),()=>p.base*p.areaB/(p.areaA+p.areaB)][f]();
 case 'decomposition':return [()=>{let n=0;for(let x=0;x<p.w;x++)for(let y=0;y<p.h;y++)if(x<p.b||x>=p.w-p.b||y<p.b||y>=p.h-p.b)n++;return n;},()=>{const x=p.position*p.w;return Math.abs((x*.3*p.h+p.w*p.h+x*.68*p.h)-(p.w*0+.3*p.h*x+p.h*0+.68*p.h*x))/2;},()=>{const pts=F.central(p.k).inside;let a=0;for(let i=1;i<3;i++){const [x,y]=pts[i].map((v,k)=>v-pts[0][k]),[u,v]=pts[i+1].map((v,k)=>v-pts[0][k]);a+=Math.abs(x*v-y*u)/2;}return a*p.side*p.side;},()=>{let n=0;for(let x=0;x<p.a+p.b;x++)for(let y=0;y<p.a+p.b;y++)if((x<p.a&&y<p.a)||(x>=p.a-p.ox&&x<p.a-p.ox+p.b&&y>=p.a-p.oy&&y<p.a-p.oy+p.b))n++;return n;}][f]();
 case 'circles':return [()=>[2*p.radius,p.radius],()=>[0,sum(p.ds)/2],()=>[0,p.smallArea*p.k*p.k],()=>[p.side*p.side,-((p.side/2)**2)]][f]();
 case 'angles':return [()=>(180-p.apex)/2,()=>p.apex+(180-p.apex)/2,()=>180-p.tip,()=>(180-90-p.theta)/2][f]();
 case 'spatial':return f<2?p.labels[[2,5,0,4,3,1][p.target]]:range(1,6).find(n=>!p.views.flat().includes(n));
 case 'volume':return [()=>range(1,20).find(n=>n*n*n===p.volume),()=>2*(p.cubes*p.edge*p.edge+p.cubes*p.edge*p.edge+p.edge*p.edge),()=>{let n=0;const occupied=(x,y,z)=>x>=0&&y>=0&&z>=0&&x<p.edge&&y<p.edge&&z<p.edge&&!(x<p.cut&&y<p.cut&&z<p.cut);for(let x=0;x<p.edge;x++)for(let y=0;y<p.edge;y++)for(let z=0;z<p.edge;z++)if(occupied(x,y,z))for(const v of [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]])if(!occupied(x+v[0],y+v[1],z+v[2]))n++;return n;},()=>B.exposed(p.edge,p.hole)][f]();
 case 'factors':return [()=>factors(p.N).length,()=>common(p.x,p.y),()=>range(1,500).find(n=>n%p.p===0&&factors(n).length===6),()=>factors(p.value).filter(n=>n%6===0).length][f]();
 case 'cycles':return [()=>p.N-Math.floor(p.N/p.divisor)*p.divisor,()=>range(1,2000).find(n=>p.ds.every(d=>n%d===d-1)),()=>Number((BigInt(p.base)**BigInt(p.n)+BigInt(p.base)**BigInt(p.m))%BigInt(p.divisor)),()=>range(p.after+1,2000).find(n=>n%p.a===0&&n%p.b===0&&n%p.c===0)][f]();
 case 'counting':return [()=>sum(range(1,p.n-1)),()=>{let n=0;for(let a=0;a<p.cols;a++)for(let b=a+1;b<=p.cols;b++)for(let c=0;c<p.rows;c++)for(let d=c+1;d<=p.rows;d++)n++;return n;},()=>range(1,p.a).flatMap(a=>range(1,p.b).map(b=>[a,b])).length,()=>1+p.parallel+sum(range(p.parallel+1,p.lines))][f]();
 case 'digits':return [()=>range(10,99).find(n=>Math.floor(n/10)+n%10===p.sum&&n-(10*(n%10)+Math.floor(n/10))===p.difference),()=>{let n=0;for(let a=10**(Math.ceil(p.digits/2)-1);a<10**Math.ceil(p.digits/2);a++)n++;return n;},()=>range(100,999).filter(n=>n%p.divisor===0&&String(n)===String(n).split('').reverse().join('')&&Math.floor(n/100)>=p.lo&&Math.floor(n/100)<=p.hi).length,()=>{let n=0;for(let x=100;x<=999;x++){const s=String(x),num=Number(s+s.slice(0,2).split('').reverse().join(''));if([...String(num)].every(d=>Number(d)<=p.limit)&&num%3===0)n++;}return n;}][f]();
 case 'sums':return [()=>sum(range(p.first,p.last)),()=>sum(range(1,p.last).map(n=>n%2?n:-n)),()=>p.a*p.a-p.b*p.b,()=>sum(range(p.start,p.end).map(n=>n*n))][f]();
 case 'patterns':return [()=>4+sum(range(1,p.n-1).map(()=>3)),()=>(p.sticks-1)/3,()=>sum(range(0,p.n-1).map(i=>p.first+i*p.increment)),()=>{let n=0;for(let i=1;i<100;i++){n+=i;if(n>=p.N)return i;}}][f]();
 case 'spirals':return f===1?coordinate(p.length).last:f===3?coordinate(p.N-1).y:coordinate(p.N-1).x;
 case 'cases':return f<2?['A','B','C'].find(x=>[x===p.b,x!==p.b,x!==p.c].filter(Boolean).length===1):f===2?range(10,99).find(n=>n%10>0&&Math.floor(n/10)>n%10&&Math.floor(n/10)-(n%10)===p.difference&&n+10*(n%10)+Math.floor(n/10)===p.total):range(1,100).filter(x=>p.a*x+p.b*(x+1)===p.total).map(x=>2*x+1)[0];
 case 'invariants':return f===0?(p.start%2!==p.target%2?'No':'Yes'):f===1?range(1,p.N).filter(n=>factors(n).length%2).length:f===2?p.colours*(p.need-1)+1:p.n/2+1;
 case 'bounds':return f===0||f===2?brutePacks(p.budget,p.costs,p.counts):f===1?range(0,p.total).find(n=>p.a+p.b-n<=p.total):p.total-(p.a-p.both)-p.b;
 default:throw Error('Missing independent solver: '+q.unit);
 }
}
for(const u of D.units)test(`${u.id}: 100 seeded questions per form have independently verified answers`,()=>{
 for(let f=0;f<4;f++)for(let i=0;i<100;i++){const seed=(i*104729+17903)>>>0,q=B.make(u.id,f,seed),answer=independentlySolve(q);assert.deepEqual(q,B.make(u.id,f,seed));assert.ok(q.steps.length>=2);assert.ok(B.mark(q,q.answerLabel),'exact label accepted: '+q.id);
 if(typeof answer==='string')assert.equal(q.answer,answer);else if(Array.isArray(answer)){near(q.answer.a,answer[0],q.id);near(q.answer.b,answer[1],q.id);}else {near(q.answer,answer,q.text);assert.equal(B.mark(q,String(q.answer+1)),false);}
 if(q.figure){const svg=F.diagram(q.figure,q.id);assert.match(svg,/role="img"/);assert.match(svg,/<title/);assert.doesNotMatch(svg,/NaN|undefined|Infinity/);}
 }
});
test('safe exact marking accepts equivalent fractions and pi expressions but rejects code and wrong units',()=>{
 const q=B.make('circles',3,88),{side}=q.params;assert.ok(B.mark(q,`${side}*${side} - (${side}/2)*(${side}/2)*pi`));assert.ok(B.mark(q,q.answerLabel+' cm²'));assert.equal(B.mark(q,q.answerLabel+' m²'),false);for(const s of ['alert(1)','Infinity','1/0','pi*pi','window.S','', '1+'])assert.equal(B.parse(s),null);
 assert.deepEqual(B.parse('2 1/2'),[2.5,0]);assert.deepEqual(B.parse('-2 1/2'),[-2.5,0]);
});
test('diagram vertices agree with the central-square relationship and keep givens separate from hints',()=>{
 for(const k of [2,3]){const {inside}=F.central(k),lengths=inside.map((p,i)=>Math.hypot(p[0]-inside[(i+1)%4][0],p[1]-inside[(i+1)%4][1]));lengths.forEach(n=>near(n,lengths[0],'equal sides'));near(F.area(inside),(k-1)**2/(k*k+1),'area fraction');}
 const q=B.make('decomposition',1,18);assert.doesNotMatch(F.diagram(q.figure,q.id),/stroke-dasharray/);assert.match(F.diagram(q.figure,q.id,true),/stroke-dasharray/);
});
test('all curriculum dependencies exist and match valid original foundation units',()=>{
 const C=require('../course-core.js');assert.equal(D.units.length,24);for(const u of D.units){assert.ok(C.unit(u.foundation),u.id);assert.ok(u.ideas.length>=3);assert.ok(u.prerequisites.every(id=>D.units.some(v=>v.id===id)));assert.ok(u.check[1][u.check[2]]);}
});
