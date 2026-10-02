const test=require('node:test'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const E=require('../entrance-core.js'),B=E.B,F=require('../entrance-figures.js'),PB=require('../paper-practice.js'),S=require('../science-path-core.js');
const h=x=>crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const seeds=Array.from({length:500},(_,i)=>(i*104729+739)>>>0),near=(a,b,msg='')=>assert.ok(Math.abs(a-b)<1e-8,`${msg}: ${a} vs ${b}`);
const unique=a=>{assert.equal(a.length,1,'unique inverse solution');return a[0];};
function faces(cells){const set=new Set(cells.map(v=>v.join(',')));let f=0;for(const v of cells)for(let i=0;i<3;i++)for(const d of [-1,1]){const w=v.slice();w[i]+=d;if(!set.has(w.join(',')))f++;}return f;}
function block(a,b,c){const cells=[];for(let x=0;x<a;x++)for(let y=0;y<b;y++)for(let z=0;z<c;z++)cells.push([x,y,z]);return cells;}
function solve(q){const p=q.params,key=q.structure.split(':').at(-1);let matches=[];
 switch(key){
 case 'swap-height':for(let height=1;height<300;height++)for(let diff=1;diff<100;diff++)if(height+diff===p.gap1&&height-diff===p.gap2)matches.push(height);return unique(matches);
 case 'equal-stacks':for(let blue=1;blue<200;blue++)if(p.first*p.red+2*blue===p.second*p.red+blue)matches.push(p.first*p.red+2*blue);return unique(matches);
 case 'two-wholes':for(let a=1;a<1000;a++){const c=a+p.gap;if(Math.abs(a*(100-p.pa)/100+c*(100+p.pc)/100-p.final)<1e-9)matches.push(a*p.ac+c*p.cc);}return unique(matches);
 case 'order-of-changes':{assert.ok(p.a>0&&p.b>p.a);for(let price=1;price<2000;price++){const voucher=price*(100-p.discount)/100-p.a;if(voucher>0&&Math.abs((price-voucher)*(100-p.discount)/100-p.b)<1e-9)matches.push(price);}return unique(matches);}
 case 'reverse-transfers':for(let a=0;a<=p.fA+p.fB;a++){const b=p.fA+p.fB-a,moved=a/3,back=(b+moved)/2;if(a%3===0&&Number.isInteger(back)&&a-moved+back===p.fA&&b+moved-back===p.fB)matches.push(a);}return unique(matches);
 case 'restock-between-sales':for(let n=1;n<2000;n++)if(n%4===0&&(3*n/4+p.added)%5===0&&(3*n/4+p.added)*3===p.left*5)matches.push(n);return unique(matches);
 case 'replacement-before-baseline':for(let large=p.swaps;large<=p.total;large++)if((large-p.swaps)*50+(p.total-large+p.swaps)*p.small===p.final)matches.push(large);return unique(matches);
 case 'three-pair-totals':for(let a=1;a<p.ab;a++){const b=p.ab-a,c=p.ca-a;if(c>0&&b+c===p.bc)matches.push(a+b+2*c);}return unique(matches);
 case 'weighted-groups':for(let b=4;b<1000;b+=4){const yes=2*p.A/5+3*b/4,no=3*p.A/5+b/4;if(yes*p.q===no*p.p)matches.push(b);}return unique(matches);
 case 'equal-additions':for(let k=1;k<1000;k++)if((p.a*k+p.added)*p.d===(p.b*k+p.added)*p.c)matches.push(p.b*k);return unique(matches);
 case 'unknown-inflow':{const stock=p.t1*p.t2,netSingle=stock/p.t1,netDouble=stock/p.t2,pump=netDouble-netSingle,inflow=pump-netSingle;assert.ok(inflow>0);let left=stock,t=0;const removal=3*pump-inflow;while(left>=removal){left-=removal;t++;}return t+left/removal;}
 case 'pair-rates-then-leave':{for(let a=1;a<p.ab;a++){const b=p.ab-a,c=p.ca-a;if(c>0&&b+c===p.bc){let remaining=p.target,mins=0;for(;mins<p.t;mins++)remaining-=a+b+c;assert.ok(remaining>0);while(remaining>0){remaining-=b+c;mins++;}assert.equal(remaining,0);matches.push(mins);}}return unique(matches);}
 case 'three-runner-gaps':{const vA=20,vB=vA+p.gap2/p.t2,vC=vB+p.gap1/p.t1;const meet=q.answer;near(vC*meet,p.gap1+p.gap2+vA*meet,'meeting positions');return (p.gap1+p.gap2)/(vC-vA);}
 case 'average-with-stop-inverse':for(let D=1;D<1000;D++)if(Math.abs(D/(D/2/p.u+D/2/p.v+p.stop/60)-p.average)<1e-9)matches.push(D);return unique(matches);
 case 'intersecting-lines':{const A=[0,0],D=[0,1],V=[1/(p.k+1),0],K=[0,.5],O=F.intersect(D,V,[1,0],K);return F.area([A,V,O,K])*p.total;}
 case 'opposite-triangles':{const x=q.figure.x,y=q.figure.y,area=p.top*2/y;near(p.right,area*(1-x)/2);near(p.bottom,area*(1-y)/2);return F.area([[0,1],[x,y],[0,0]])*area;}
 case 'circumference-to-area':{let small=0;while(2*(p.k-1)*small<p.gap)small++;assert.equal(2*(p.k-1)*small,p.gap);return {a:0,b:(p.k*small)**2-small**2};}
 case 'semicircle-subtraction':return {a:0,b:((p.a+p.b)/2)**2/2-(p.a/2)**2/2-(p.b/2)**2/2};
 case 'three-tunnels':{const size=p.L/p.e,mid=(size-1)/2,cells=block(size,size,size).filter(v=>v.filter(x=>x===mid).length<2);return faces(cells)*p.e*p.e;}
 case 'rearrange-surface':assert.equal(p.a*p.b*p.c,p.N);return (faces(block(p.N,1,1))-faces(block(p.a,p.b,p.c)))*p.e*p.e;
 case 'contain-a-cell':{let count=0;for(let x=0;x<p.cols;x++)for(let X=x+1;X<=p.cols;X++)for(let y=0;y<p.rows;y++)for(let Y=y+1;Y<=p.rows;Y++)if(x<=p.col&&X>=p.col+1&&y<=p.row&&Y>=p.row+1)count++;return count;}
 case 'unordered-pairs-with-exclusion':{let count=0;for(let a=0;a<p.a;a++)for(let b=a+1;b<p.a;b++)for(let c=0;c<p.b;c++)if(!(a===0&&c===0))count++;return count;}
 case 'complete-prime-pairs':{let m=1;while(!Number.isInteger(Math.sqrt(p.N*m)))m++;return m;}
 case 'restricted-factor-pairs':{let count=0;for(let l=1;l<=p.N;l++)if(p.N%l===0){const b=p.N/l;if(l>=b&&b>=p.minimum&&l%p.p===0)count++;}return count;}
 default:throw Error('Missing independent solver: '+key);
 }
}
for(const id of PB.topicIds)test(`paper practice: independently solve 500 ${id} questions and check their presentation data`,()=>{
 const variants=new Set(),prints=[new Set(),new Set()];for(const seed of seeds){const q=B.make(id,2,seed),s=solve(q);variants.add(q.structure);prints[q.params.variant].add(q.fingerprint);if(typeof s==='object'){near(q.answer.a,s.a);near(q.answer.b,s.b);}else near(q.answer,s,q.text);
  assert.deepEqual(q,B.make(id,2,seed));assert.ok(B.mark(q,q.answerLabel));assert.ok(q.hints.length===2);assert.ok(q.steps.length>=3);assert.equal(q.paperStandard,'original-paper-style');assert.doesNotMatch(q.text+' '+q.steps.join(' '),/NaN|Infinity|undefined|\[object Object\]/);assert.ok(q.diagnostic.choices[q.diagnostic.correct]);assert.equal(new Set(q.diagnostic.choices).size,3);if(q.figure){assert.match(F.diagram(q.figure,q.id),/<svg[^>]*role="img"/);assert.doesNotMatch(F.diagram(q.figure,q.id),/NaN|undefined/);}
  const wrong=typeof q.answer==='number'?String(q.answer+1):`${q.answer.b+1}pi`;assert.equal(B.mark(q,wrong),false);
 }
 assert.equal(variants.size,2);for(const p of prints)assert.ok(p.size>=15,`${id}: sufficient distinct variants, got ${p.size}`);
});
test('all prior revision 1 and 2 question objects and all 20 reserved paper objects stay byte-identical',()=>{
 const snap=require('./fixtures/pre-paper-practice-v740.json');for(const [rev,want]of Object.entries(snap.questions))assert.equal(h(E.D.units.flatMap(u=>[0,1,2,3].flatMap(f=>Array.from({length:40},(_,i)=>B.make(u.id,f,i*7919+1,+rev))))),want,'all questions, revision '+rev);
 for(const [subject,C]of [['maths',E],['science',S]])for(const def of C.paperDefinitions)assert.equal(h({def,questions:C.paperQuestions(def.id)}),snap.papers[subject+':'+def.id],subject+':'+def.id);
});
const now=Date.UTC(2026,9,2,17),taught=(d,id,t=now-100000)=>{for(let i=0;i<3;i++)E.visit(d,id,i,t);E.concept(d,id,E.unit(id).check[2],t+1);E.complete(d,id,t+2);};
function correct(d,id,phase,seed,t){E.finishPractice(d);E.startPractice(d,id,{phase,seed,now:t});const q=E.question(d.draft);E.touchDraft(d,{answer:q.answerLabel,working:'Synthetic test explanation'},t+1);const a=E.respond(d,t+2).attempt;E.finishPractice(d);return a;}
test('normal daily transfer uses the new bank, but guided/application basics and bridge gating remain',()=>{
 const d=E.fresh();taught(d,'percent');correct(d,'percent','apply',13,now-5000);correct(d,'percent','apply',971,now-4000);const v=E.startPractice(d,'percent',{now});assert.equal(v.phase,'transfer');assert.equal(v.rev,3);assert.equal(E.question(v).paperStandard,'original-paper-style');
 for(const id of PB.topicIds)for(const f of [0,1,3])assert.deepEqual(B.make(id,f,691,3),B.make(id,f,691,2));assert.ok(E.prerequisite(E.fresh(),'volume',now));
});
test('revision 3 help is supported, stale work retains its original question and redo remains revision 2',()=>{
 const d=E.fresh();taught(d,'volume');E.startPractice(d,'volume',{phase:'transfer',seed:1234,now});E.help(d);E.touchDraft(d,{answer:E.question(d.draft).answerLabel,working:'Synthetic assisted work'},now+1);assert.equal(E.respond(d,now+2).attempt.independent,false);
 const old={...E.fresh(),draft:{...d.draft,rev:2,answer:'77',working:'Saved before upgrade',helped:false}};const restored=E.validate(old);assert.equal(restored.draft.rev,2);assert.equal(E.question(restored.draft).text,B.make('volume',2,restored.draft.seed,2).text);assert.equal(restored.draft.working,old.draft.working);
 const x=E.fresh();taught(x,'percent');E.startPractice(x,'percent',{phase:'redo',form:2,seed:129,rev:2,redoOf:'old',now});E.touchDraft(x,{answer:'999999',working:'Synthetic old incorrect work'},now+1);const a=E.respond(x,now+2).attempt;assert.equal(a.rev,2);assert.equal(E.startRedo(x,a.id,now+3).rev,2);
});
test('unfinished mixed sets without revision are pinned to revision 2; new queues and cloud merges retain revision 3',()=>{
 const d=E.fresh();d.mixed={id:'legacy-mix',at:now-2000,items:[{unit:'percent',form:2,seed:313,recall:false},{unit:'volume',form:2,seed:319,recall:false}],completedAt:0};const x=E.validate(d);assert.ok(x.mixed.items.every(i=>i.rev===2));const v=E.startMixedItem(x,now);assert.equal(v.rev,2);assert.deepEqual(E.question(v),B.make('percent',2,313,2));
 const fresh=E.fresh();for(const [i,id]of ['percent','relationships'].entries()){taught(fresh,id);correct(fresh,id,'apply',123+i,now-4000);correct(fresh,id,'apply',187+i,now-3500);correct(fresh,id,'transfer',193+i,now-3000);}const m=E.startMixed(fresh,now);assert.ok(m.items.every(i=>i.rev===3));const z=E.merge(E.validate(fresh),E.validate(fresh));assert.ok(z.mixed.items.every(i=>i.rev===3));assert.equal(E.startMixedItem(z,now+1).rev,3);
});
test('earlier extension lessons require secure prerequisites and never replace urgent work',()=>{
 const d=E.fresh(),extension=E.D.units.find(u=>u.extension&&u.prerequisites.length),r={kind:'learn',unit:'patterns'};for(const [i,id]of extension.prerequisites.entries()){taught(d,id);correct(d,id,'apply',300+i,now-6000);correct(d,id,'apply',699+i,now-5000);correct(d,id,'transfer',880+i,now-4000);}
 const result=PB.extensionRecommendation(E,d,r,now);assert.equal(result.unit,extension.id);assert.equal(result.paperExtension,true);
 for(const kind of ['resume','paper','recall','mixed-set','redo']){const urgent={...r,kind};assert.equal(PB.extensionRecommendation(E,d,urgent,now),urgent);}for(const flag of ['repair','geometryBridge']){const urgent={...r,[flag]:true};assert.equal(PB.extensionRecommendation(E,d,urgent,now),urgent);}
 assert.equal(PB.extensionRecommendation(E,E.fresh(),r,now),r);E.visit(d,extension.id,0,now);assert.equal(PB.extensionRecommendation(E,d,r,now+1),r);
});
test('new parent evidence excludes earlier questions, help, repeated exposure and copied corrections',()=>{
 const d=E.fresh();taught(d,'percent');const a=correct(d,'percent','transfer',888,now-10);assert.ok(a.independent);let row=E.paperPracticeReport(d,now).find(x=>x.id==='percent');assert.equal(row.independent,1);assert.equal(row.structures.length,1);
 E.startPractice(d,'percent',{phase:'transfer',seed:989,now:now+1});E.help(d);E.touchDraft(d,{answer:E.question(d.draft).answerLabel,working:'Synthetic assisted'},now+2);E.respond(d,now+3);row=E.paperPracticeReport(E.validate(d),now+4).find(x=>x.id==='percent');assert.equal(row.attempts,2);assert.equal(row.independent,1);
});

test('new ratio structures never inherit the old 5:3 transfer bar model, and mass units are accepted',()=>{const M=require('../bar-models.js');for(const seed of seeds){const q=B.make('ratios',2,seed);assert.equal(M.model(q),'');const m=B.make('simultaneous',2,seed);if(m.suffix==='kg')assert.ok(B.mark(m,m.answerLabel+' kg'));}assert.ok(M.model(B.make('ratios',2,7,2)).includes('Box A'));});
