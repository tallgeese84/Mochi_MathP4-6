const test=require('node:test'),assert=require('node:assert/strict'),harness=require('./harness.cjs');
const h=harness(),gens=h.run('GEN'),marker=h.run('isCorrect');
const close=(a,b,msg)=>assert.ok(Math.abs(a-b)<1e-8,`${msg}: ${a} != ${b}`);
const nums=s=>(s.match(/\d+(?:\.\d+)?/g)||[]).map(Number);
// Independent calculations from the visible statement (not generator internals).
const solve={
 fracRemainder(q){const [t,a,b,c,d]=nums(q.text);return t*(1-a/b)*(1-c/d);},
 ratioDiff(q){const [a,b,d]=nums(q.text);return d/(a-b)*(a+b);},
 percentDiscount(q){const [p,d]=nums(q.text);return p*(1-d/100);},
 percentWhole(q){const [p,n]=nums(q.text);return n*100/p;},
 speed(q){const [a,b]=nums(q.text);return /What distance/.test(q.text)?a*b:a/b;},
 algebra(q){const [a,b,y]=nums(q.text);return a*y+(q.text.includes('−')?-b:b);},
 semicircle(q){const [d]=nums(q.text);return /area/.test(q.text)?(22/7)*(d/2)**2/2:(22/7)*d/2+d;},
 quadrant(q){const [r]=nums(q.text);return /area/.test(q.text)?(22/7)*r*r/4:(22/7)*r/2+2*r;},
 volume(q){const [l,w,H,h]=nums(q.text);return l*w*h/1000;},
 angles(q){return 180-nums(q.figDesc)[1];},
 average(q){const [n,m,M]=nums(q.text);return (n+1)*M-n*m;},
 gapDiff(q){const [p,left,n,short]=nums(q.text);return (left+short)/(n-p);},
 orderOps(q){const [a,b,c,d]=nums(q.text);return a+b*c-d;},
 decimals(q){const [n,p,paid]=nums(q.text);return paid-n*p;},
 ratioChange(q){const [t,a,b]=nums(q.text);return t*a/(a+b);},
 percentChange(q){const [a,b]=nums(q.text);return Math.abs(b-a)/a*100;},
 twoLegSpeed(q){const [d,s,D,S]=nums(q.text);return (d+D)/(d/s+D/S);},
 rateWork(q){const [v,t,V]=nums(q.text);return t*V/v;},
 volumeDepth(q){const [l,w,H,v]=nums(q.text);return v*1000/(l*w);},
 parallelogramAngle(q){return 180-nums(q.text)[0];},
 fractionDivide(q){const [t,a,b]=nums(q.text);return t*b/a;},
 workingBackwards(q){const [a,b,x,y]=nums(q.text);return (x+y)/(1-a/b);},
 placeValue(q){const m=q.text.match(/digit (\d) in ([\d ]+)/);const s=m[2].replace(/ /g,'');return +m[1]*10**(s.length-s.indexOf(m[1])-1);},
 rounding(q){const n=Number(q.text.match(/Round ([\d ]+) to/)[1].replace(/ /g,'')),p=/thousand/.test(q.text)?1000:/hundred/.test(q.text)?100:10;return Math.floor((n+p/2)/p)*p;},
 factorsMultiples(q){const [a,b]=nums(q.text);if(!b){let count=0;for(let d=1;d<=a;d++)if(a%d===0)count++;return count;}let n=a;while(n%b)n+=a;return n;},
 measureConvert(q){const [n]=nums(q.text);return /in grams|in millilitres/.test(q.text)?n*1000:/in kilometres/.test(q.text)?n/1000:n/100;},
 timeDuration(q){const [h,m,H,M]=nums(q.text);return 60*(H-h)+M-m;},
 fracToDecimal(q){const [w,n,d]=nums(q.text);return w+n/d;},
 fracDivWhole(q){const [n,d,k]=nums(q.text);return n/(d*k);},
 gst(q){const [p,t]=nums(q.text);return p*(1+t/100);},
 algebraFraction(q){const [a,b,c,d,w]=nums(q.text);return a*w-b*w/c+d;},
 isoscelesAngle(q){return (180-nums(q.text)[0])/2;},
 parallelAngle(q){return 180-nums(q.figDesc)[0];},
 pieChartQ(q){const [n,...p]=nums(q.figDesc);return n*(100-p.reduce((a,b)=>a+b,0))/100;},
 barGraphQ(q){const n=nums(q.figDesc);return /altogether/.test(q.text)?n.reduce((a,b)=>a+b,0):Math.max(...n)-Math.min(...n);},
 lineGraphQ(q){const n=nums(q.figDesc),m=q.text.match(/from (\w+) to (\w+)/),i=['Jan','Feb','Mar','Apr','May'].indexOf(m[1]);return Math.abs(n[i+1]-n[i]);},
 averageTable(q){const [n,avg,count,...marks]=nums(q.text);return n*avg-marks.reduce((a,b)=>a+b,0);},
 rateTable(q){const [H,r,h,total]=nums(q.text);return (total-(h-H)*r)/H;},
 commission(q){const [a,p,b,E]=nums(q.text);return p+(E-p*a/100)/(b/100);},
 coinsProblem(q){const [small,big,extra,_b,_s,value]=nums(q.text);return 2*(value*100-extra*big)/(small+big)+extra;},
 twoVehiclesMeet(q){const n=nums(q.text),start=n[0],speed=n[1],lag=n[2]===30?.5:1;const raw=n[3];let end=Math.floor(raw)+(raw%1)*100/60;if(/p\.m\./.test(q.text)&&end<12)end+=12;return speed*(end-start)+2*speed*(end-start-lag);},
 waterTransfer(q){const [l,w,H,h,L,W,d]=nums(q.text);return (l*w*h-L*W*d)/(l*w);},
 fractionSum(q){const [a,b,c,d]=nums(q.text);return a/b+c/d;},
 fractionProduct(q){const [a,b,c,d]=nums(q.text);return a/b*c/d;},
 fractionCompare(q){const [a,b,c,d]=nums(q.text);return Math.max(a/b,c/d);},
 decimalDivision(q){const [a,b]=nums(q.text);return a/b;},
 areaTriangle(q){const [b,h]=nums(q.text);return b*h/2;},
 rectanglePerimeter(q){const [p,w]=nums(q.text);return (p/2-w)*w;},
 compositeArea(q){const [a,b,l,h]=nums(q.text);return l*h-a*b;},
 parallelogramArea(q){const [b,s,h]=nums(q.text);return b*h;},
 symmetryCount(q){return /non-square/.test(q.text)?2:/square/.test(q.text)?4:3;},
 cubeNet(q){const a=q.text.match(/opposite face ([A-F])/)[1];return {A:'E',E:'A',B:'D',D:'B',C:'F',F:'C'}[a];},
 unitCubes(q){const [l,w,h,m]=nums(q.text);return l*w*h-m;},
 ratioUnknownTotal(q){const [a,b,m,r,s]=nums(q.text);return m/(a/(a+b)-r/(r+s));},
 fractionRemainderTransfer(q){return nums(q.text)[4]*4;},
 multiPartBudget(q){const [n,p,f,total]=nums(q.text);return total-n*p-f;},
 algebraRelationship(q){const [boxes,extra,n]=nums(q.text);return boxes*n+extra;},
 changingWhole(q){return nums(q.text)[0]*1.2*.8;},
 linearEquation(q){const [a,b,t]=nums(q.text);return (t-b)/a;},
 simplifyExpression(q){const [a,b,c]=nums(q.text);return a+b-c;},
 ratioThreeParts(q){const [a,b,c,t]=nums(q.text);return t*b/(a+b+c);},
 fractionByFraction(q){const [a,b,c,d]=nums(q.text);return a/b/(c/d);},
 mixedSubtract(q){const [w,n,d,v,N,D]=nums(q.text);return w+n/d-v-N/D;},
 timeStart(q){const [h,m,t]=nums(q.text);return h*60+m-t;},
 measurementCompare(q){const [cm,m]=nums(q.text);return m*100-cm;},
 circleComposite(q){const [l,d]=nums(q.text);return 2*l+d+22/7*d/2;},
 cuboidFace(q){const [v,l]=nums(q.text);return v/l;},
 cubeEdge(q){return Math.cbrt(nums(q.text)[0]);},
 counterexample(){return '1/2';},
 patternGeneralise(q){return nums(q.text)[1]*3+1;},
 systematicCounting(q){const n=nums(q.text)[0];return n*(n-1)/2;},
 parityInvariant(q){const [a,step,back,b]=nums(q.text);return (b-a)%2===0?'Yes':'No';},
 reverseDigits(q){const [sum,difference]=nums(q.text);for(let n=10;n<100;n++)if(Math.floor(n/10)+n%10===sum&&n-(n%10*10+Math.floor(n/10))===difference)return n;},
 rectanglesInGrid(q){const [w,h]=nums(q.text);let n=0;for(let a=1;a<=w;a++)for(let b=1;b<=h;b++)n+=(w-a+1)*(h-b+1);return n;},
 guaranteeSocks(q){const [c,m]=nums(q.text);return c*(m-1)+1;},
 constrainedCoins(q){const [n,total]=nums(q.text);for(let k=0;k<=n;k++)if(k*50+(n-k)*20===total)return k;},
 borderGeneralise(q){const [n]=nums(q.text);let count=0;for(let x=0;x<n;x++)for(let y=0;y<n;y++)if(x===0||y===0||x===n-1||y===n-1)count++;return count;},
 constrainedDigits(q){const digits=nums(q.text).slice(0,4);return Array.from({length:90},(_,i)=>i+10).filter(n=>n%3===0&&Math.floor(n/10)!==n%10&&digits.includes(Math.floor(n/10))&&digits.includes(n%10)).length;},
 closestNumbers(q){const ds=nums(q.text).slice(0,4).sort().join('');let best=100;for(let a=10;a<=99;a++)for(let b=10;b<a;b++)if((String(a)+String(b)).split('').sort().join('')===ds)best=Math.min(best,a-b);return best;},
 overlappingClubs(q){const [n,m,s,b]=nums(q.text);return n-m-s+b;},
 averageAfterRemoval(q){const [n,m,a,b]=nums(q.text);return (n*m-a-b)/(n-2);},
 insideBorder(q){const [w,h,b]=nums(q.text);let count=0;for(let x=0;x<w;x++)for(let y=0;y<h;y++)if(x<b||y<b||x>=w-b||y>=h-b)count++;return count;},
 ratioWithFixedPart(q){const [a,b,removed,A,B]=nums(q.text);return removed*(a+b)/(b-a*B/A);},
 submergedObject(q){const [l,w,h]=nums(q.text);return l*w*h;},
 successiveDiscounts(q){const [a,b,paid]=nums(q.text);return paid/(1-a/100)/(1-b/100);},
 hiddenRectangle(q){const [p,d]=nums(q.text);for(let w=1;w<p;w++)if(2*(w+w+d)===p)return w*(w+d);},
 repeatedRemainder(q){const n=nums(q.text);return n.at(-1)/((1-n[0]/n[1])*(1-n[2]/n[3])*.5);},
 evidenceClaim(){return '8 of these 10 friends prefer chess';}
};
for(const g of gens)test(`${g.name}: independently solve 100 generated statements and reject wrong answers`,()=>{
 assert.ok(solve[g.name]);
 for(let i=0;i<100;i++){
  const q=g(),ans=solve[g.name](q);
  assert.ok(q.text&&q.steps.length);assert.ok(h.run('MochiLearning.skills')[q.skill||h.run('MochiLearning.mapping')[g.name]]);
  if(typeof q.answer==='number'){assert.ok(Number.isFinite(q.answer));close(q.answer,ans,g.name+' '+q.text);assert.ok(marker(String(q.answer),q));assert.equal(marker(String(q.answer+.01),q),false);assert.equal(marker(String(q.answer+1),q),false);}
  else assert.equal(q.answer,ans);
  if(q.answerLabel)assert.ok(marker(q.answerLabel,q),g.name+' label');
 }
});
test('unknown water depth is hidden in figure and figure scale',()=>{
 for(let i=0;i<100;i++){const q=gens.find(g=>g.name==='volumeDepth')();assert.match(q.fig,/>\? cm<\/text>/);assert.match(q.figDesc,/question mark/);}
});
test('decrease worked equation uses original minus new price',()=>{
 for(let i=0;i<200;i++){const q=gens.find(g=>g.name==='percentChange')();const m=q.steps[0].match(/\$(\d+) − \$(\d+) = \$(\d+)/);assert.ok(m);assert.equal(+m[1]-m[2],+m[3]);}
});
