/* Contest module "contest" (v7.12): AMC 8 topics that the Singapore primary syllabus leaves out.
   Right triangles and square roots, probability by counting outcomes, and coordinates with negative
   numbers. Original questions, no calculator. Each form has at least two structurally different
   variants chosen by seed. Registers itself as MochiDSA_contest; entrance-data.js adds the units with
   extension:true, module:'contest'. No contest problem, wording or figure is reproduced. */
(function(root){
'use strict';
const unit=(id,strand,title,foundation,prerequisites,ideas,check,why)=>({id,strand,title,foundation,benchmarkPages:'Contest extension (AMC 8 topics beyond the Singapore primary syllabus)',extension:true,contest:true,prerequisites,ideas,check,why});
const units=[
 unit('amc-right','geometry','Contest · Right triangles and square roots','m-area',['area','angles'],[
  'A square number is a whole number times itself: 7 × 7 = 49, so 49 is a square number. Going backwards, the square root of 49 is 7, written √49 = 7. Learn the squares up to 25 × 25 = 625. To estimate √50, find the squares on either side: 7² = 49 and 8² = 64, so √50 is a little more than 7.',
  'In a right-angled triangle, the side opposite the right angle is the longest side, called the hypotenuse. Pythagoras’ theorem says: (longest side)² = (one shorter side)² + (other shorter side)². With shorter sides 3 and 4: 9 + 16 = 25 = 5², so the longest side is 5. Useful whole-number sets: 3, 4, 5 · 5, 12, 13 · 8, 15, 17 · 7, 24, 25, and any multiple of them, such as 6, 8, 10.',
  'To find a shorter side, subtract: (shorter side)² = (longest side)² − (other side)². Look for hidden right angles: a rectangle’s diagonal, a ladder against a wall, a walk east then north, the height of a triangle with two equal sides (it cuts the base in half), and the diagonals of a rhombus (they cross at right angles). For a slanted square, its area is its side squared, so you may never need the side itself.'
 ],['A right-angled triangle has shorter sides 6 cm and 8 cm. Which calculation gives the longest side?',['√(6² + 8²) = √100','6 + 8','√(8² − 6²)'],0,'The squares of the two shorter sides add up to the square of the longest side: 36 + 64 = 100, and √100 = 10. Adding the sides gives a path round two edges, which is longer than the straight side.'],'Find the right angle first. Then decide: are you finding the longest side (add the squares) or a shorter side (subtract)?'),
 unit('amc-chance','number','Contest · Probability by counting','m-data',['counting','percent'],[
  'When every outcome is equally likely, probability = (number of outcomes that work) ÷ (number of all outcomes). A fair dice has 6 equally likely outcomes, so the probability of rolling a 5 or a 6 is 2/6 = 1/3. A probability is between 0 (impossible) and 1 (certain). Give it as a fraction in its simplest form. (American contests call one dice a “die”.)',
  'For two dice, list pairs, not sums: the first dice has 6 results and the second has 6, so there are 6 × 6 = 36 equally likely pairs. Draw a 6 by 6 table. A sum of 7 comes from 6 pairs, but a sum of 2 from only 1. For coins, each coin doubles the number of results: 3 coins give 2 × 2 × 2 = 8 equally likely results.',
  'For “at least one”, count the opposite and subtract: P(at least one six in two rolls) = 1 − P(no six) = 1 − 25/36 = 11/36. Without putting back, the second pick is from one fewer: from 5 counters, there are 5 × 4 = 20 ordered pairs. When choosing a pair where order does not matter, halve: 5 × 4 ÷ 2 = 10 pairs. “A or B” counts both groups and subtracts the overlap once.'
 ],['A fair dice is rolled. What is the probability of rolling a number greater than 4?',['2/6 = 1/3','4/6 = 2/3','1/6'],0,'Only 5 and 6 are greater than 4: 2 of the 6 equally likely outcomes.'],'Name the equally likely outcomes first, count them, then count the ones that work. Check that your answer is between 0 and 1.'),
 unit('amc-coords','geometry','Contest · Coordinates and negative numbers','m-algebra',['relationships','area'],[
  'Negative numbers sit to the left of 0 on a number line. Adding moves right and subtracting moves left. Subtracting a negative number moves right: 3 − (−5) = 3 + 5 = 8. The distance between −4 and 6 is 4 + 6 = 10. Temperatures below zero, depths below sea level and money owed use negative numbers.',
  'A point (x, y) is x units across from the origin (0, 0) and y units up. A negative x is to the left; a negative y is below. Points with the same y-coordinate lie on a horizontal line, so their distance is the difference of the x-coordinates: from (−3, 2) to (5, 2) is 5 − (−3) = 8. The midpoint averages the coordinates.',
  'For areas on a grid, use horizontal and vertical lengths. A triangle with a horizontal side uses that side as its base and the vertical distance from the third corner as its height. For a slanted shape, draw the smallest rectangle around it and subtract the right-angled corner triangles. For a slanted length, the across and up-or-down distances are the shorter sides of a right-angled triangle.'
 ],['Points (−3, 2) and (5, 2) are joined. Which calculation gives the length?',['5 − (−3) = 8','5 − 3 = 2','−3 + 5 = 2'],0,'They have the same y-coordinate, so the segment is horizontal. Subtracting −3 adds 3.'],'Draw a quick sketch with the axes. Turn every slanted or awkward length into horizontal and vertical pieces.')
];

/* ---------- helpers ---------- */
const gcd=(a,b)=>{a=Math.abs(a);b=Math.abs(b);while(b)[a,b]=[b,a%b];return a;};
const lcm=(a,b)=>a/gcd(a,b)*b;
const sgn=n=>n<0?'−'+Math.abs(n):String(n);
const par=n=>n<0?`(${sgn(n)})`:String(n);
const pt=(x,y)=>`(${sgn(x)}, ${sgn(y)})`;
const half=n=>n%2===0?String(n/2):`${(n-1)/2}.5`;// n is twice the value
function frac(n,d){const g=gcd(n,d);return d/g===1?String(n/g):`${n/g}/${d/g}`;}
const simp=(n,d)=>{const l=frac(n,d);return l===`${n}/${d}`?`${n}/${d}`:`${n}/${d} = ${l}`;};
const choose=(n,k)=>{let c=1;for(let i=0;i<k;i++)c=c*(n-i)/(i+1);return c;};
const SIMPLE='Give your answer as a fraction in its simplest form.';
const NAMES=['Aisha','Ben','Chloe','Dev','Farah','Hui Min','Kumar','Mei','Ravi','Siti'];
const TRIPLES=[[3,4,5],[5,12,13],[8,15,17],[7,24,25],[20,21,29],[9,40,41],[12,35,37]];
/* Edges a, b, c and space diagonal d of a cuboid, all whole numbers. */
const QUADS=[[1,2,2,3],[2,3,6,7],[1,4,8,9],[4,4,7,9],[2,6,9,11],[6,6,7,11],[3,4,12,13],[2,5,14,15],[2,10,11,15],[1,12,12,17],[8,9,12,17],[6,10,15,19],[4,5,20,21],[4,8,19,21],[4,13,16,21],[8,11,16,21]];
function triple(r,maxC,minC=5){const list=[];for(const [a,b,c] of TRIPLES)for(let k=1;k*c<=maxC;k++)if(k*c>=minC)list.push([a*k,b*k,c*k]);const t=list[r(0,list.length-1)];return r(0,1)?t:[t[1],t[0],t[2]];}
const DICE=[1,2,3,4,5,6];
function pairs(test){const out=[];for(const a of DICE)for(const b of DICE)if(test(a,b))out.push([a,b]);return out;}
const show=list=>list.map(([a,b])=>`(${a}, ${b})`).join(', ');

function make(id,form,seed,r){
 let q=null;const pick=a=>a[r(0,a.length-1)];
 const out=(text,answer,steps,params={},extra={})=>q={text,answer,steps,params,...extra};
 const prob=(text,n,d,steps,params)=>out(`${text} ${SIMPLE}`,n/d,steps,params,{answerLabel:frac(n,d)});
 /* ---------- right triangles and square roots ---------- */
 if(id==='amc-right'){
  if(form===0){
   const v=r(0,2);
   if(v===0){const [a,b,c]=triple(r,30);out(`A right-angled triangle has shorter sides ${a} cm and ${b} cm. How long is its longest side?`,c,[`The longest side (the hypotenuse) is opposite the right angle. Pythagoras’ theorem: (longest side)² = ${a}² + ${b}².`,`${a}² + ${b}² = ${a*a} + ${b*b} = ${c*c}.`,`The longest side is the number whose square is ${c*c}: ${c} × ${c} = ${c*c}, so it is ${c} cm.`,`Check: ${c} cm is longer than both shorter sides.`],{variant:'hyp',a,b},{suffix:'cm',figure:{module:'contest',kind:'cx-right',w:a,h:b,labels:[`${a} cm`,`${b} cm`,'?']}});}
   if(v===1){const [a,b,c]=triple(r,30);out(`A right-angled triangle has longest side ${c} cm and one shorter side ${a} cm. How long is the third side?`,b,[`The longest side is opposite the right angle, so ${c}² = ${a}² + (third side)².`,`(third side)² = ${c}² − ${a}² = ${c*c} − ${a*a} = ${b*b}.`,`${b} × ${b} = ${b*b}, so the third side is ${b} cm.`,`Check: ${a}² + ${b}² = ${a*a+b*b} = ${c}².`],{variant:'leg',a,c},{suffix:'cm',figure:{module:'contest',kind:'cx-right',w:a,h:b,labels:[`${a} cm`,'?',`${c} cm`]}});}
   if(v===2){let s=r(11,29);if(s===20)s=21;const lo=Math.floor(s/10)*10,hi=lo+10,last=s*s%10,ends=[...Array(10).keys()].filter(d=>d*d%10===last);
    out(`A square has an area of ${s*s} cm². How long is one of its sides?`,s,[`The area of a square is side × side, so the side is √${s*s}, the number whose square is ${s*s}.`,`${lo}² = ${lo*lo} and ${hi}² = ${hi*hi}, so the side is between ${lo} and ${hi}.`,`${s*s} ends in ${last}. Only numbers ending in ${ends.join(' or ')} have squares ending in ${last}.`,`Try ${s}: ${s} × ${s} = ${s*s}. The side is ${s} cm.`],{variant:'root',s},{suffix:'cm'});}
  }
  if(form===1){
   const v=r(0,3);
   if(v===0){const [a,b,c]=triple(r,100);out(`A rectangular field is ${a} m long and ${b} m wide. A straight path joins two opposite corners. How long is the path?`,c,[`The path and two sides of the field make a right-angled triangle. The path is its longest side.`,`path² = ${a}² + ${b}² = ${a*a} + ${b*b} = ${c*c}.`,`${c} × ${c} = ${c*c}, so the path is ${c} m long.`,`Check: it is shorter than walking along two sides (${a+b} m).`],{variant:'diagonal',a,b},{suffix:'m'});}
   if(v===1){let [a,b,c]=triple(r,30);if(a>b)[a,b]=[b,a];out(`A ladder ${c} m long leans against a vertical wall. Its foot stands on level ground, ${a} m from the wall. How high up the wall does the ladder reach?`,b,[`The wall, the ground and the ladder make a right-angled triangle. The ladder is the longest side.`,`height² = ${c}² − ${a}² = ${c*c} − ${a*a} = ${b*b}.`,`${b} × ${b} = ${b*b}, so the ladder reaches ${b} m up the wall.`],{variant:'ladder',a,c},{suffix:'m',figure:{module:'contest',kind:'cx-right',w:a,h:b,labels:[`${a} m`,'?',`${c} m`]}});}
   if(v===2){const [E,N,c]=triple(r,50),e1=r(1,E-1),n1=r(1,N-1),name=pick(NAMES);out(`${name} walks ${e1} m east, then ${n1} m north, then ${E-e1} m east, then ${N-n1} m north. How far is ${name} from the starting point, in a straight line?`,c,[`Only the totals matter: ${e1} + ${E-e1} = ${E} m east and ${n1} + ${N-n1} = ${N} m north.`,`East and north are at right angles, so distance² = ${E}² + ${N}² = ${E*E} + ${N*N} = ${c*c}.`,`${c} × ${c} = ${c*c}, so ${name} is ${c} m from the start.`],{variant:'walk',E,N},{suffix:'m'});}
   if(v===3){let N;do N=r(30,700);while(Number.isInteger(Math.sqrt(N)));const k=Math.floor(Math.sqrt(N));out(`The square root of ${N} lies between two consecutive whole numbers. What is the smaller of the two numbers?`,k,[`Look for the square numbers on either side of ${N}.`,`${k}² = ${k*k} and ${k+1}² = ${(k+1)*(k+1)}.`,`${k*k} < ${N} < ${(k+1)*(k+1)}, so √${N} is between ${k} and ${k+1}. The smaller number is ${k}.`],{variant:'between',N});}
  }
  if(form===2){
   const v=r(0,3);
   if(v===0){const [a,h,s]=triple(r,40);out(`A triangle has two sides of length ${s} cm. Its third side, the base, is ${2*a} cm long. What is the area of the triangle?`,a*h,[`In a triangle with two equal sides, the height from the top corner meets the base at its midpoint, at a right angle.`,`That gives a right-angled triangle with longest side ${s} cm and one shorter side ${a} cm (half the base).`,`height² = ${s}² − ${a}² = ${s*s} − ${a*a} = ${h*h}, so the height is ${h} cm.`,`Area = ½ × base × height = ½ × ${2*a} × ${h} = ${a*h} cm².`],{variant:'isosceles',s,b:2*a},{suffix:'cm²'});}
   if(v===1){const [p,q2,c]=triple(r,40);out(`The two diagonals of a rhombus are ${2*p} cm and ${2*q2} cm long. What is the perimeter of the rhombus?`,4*c,[`The diagonals of a rhombus cut each other in half at right angles.`,`Each quarter of the rhombus is a right-angled triangle with shorter sides ${p} cm and ${q2} cm. Its longest side is a side of the rhombus.`,`side² = ${p}² + ${q2}² = ${p*p} + ${q2*q2} = ${c*c}, so each side is ${c} cm.`,`All four sides are equal: perimeter = 4 × ${c} = ${4*c} cm.`],{variant:'rhombus',d1:2*p,d2:2*q2},{suffix:'cm'});}
   if(v===2){const [a,b,c]=triple(r,60),A=a*b/2;out(`A right-angled triangle has an area of ${A} cm². One of its two shorter sides is ${a} cm long. What is its perimeter?`,a+b+c,[`The two shorter sides of a right-angled triangle are a base and its height, so area = ½ × ${a} × (other shorter side).`,`Other shorter side = 2 × ${A} ÷ ${a} = ${b} cm.`,`(longest side)² = ${a}² + ${b}² = ${a*a+b*b}, so the longest side is ${c} cm.`,`Perimeter = ${a} + ${b} + ${c} = ${a+b+c} cm.`],{variant:'perimeter',A,a},{suffix:'cm'});}
   if(v===3){const a=r(1,9);let b=r(2,12);if(b===a)b=a+3;out(`ABCD is a square. Points P, Q, R and S lie on sides AB, BC, CD and DA, so that AP = BQ = CR = DS = ${a} cm and PB = QC = RD = SA = ${b} cm. PQRS is also a square. What is the area of PQRS?`,a*a+b*b,[`Each corner of ABCD is cut off as a right-angled triangle with shorter sides ${a} cm and ${b} cm.`,`A side of PQRS is the longest side of one of these triangles, so (side of PQRS)² = ${a}² + ${b}² = ${a*a} + ${b*b}.`,`The area of PQRS is its side squared: ${a*a+b*b} cm². You never need the side itself.`,`Check another way: ${a+b}² − 4 × ½ × ${a} × ${b} = ${(a+b)*(a+b)} − ${2*a*b} = ${a*a+b*b}.`],{variant:'tilted',a,b},{suffix:'cm²',figure:{module:'contest',kind:'cx-tilt',a,b}});}
  }
  if(form===3){
   const v=r(0,2);
   if(v===0){const quad=pick(QUADS),d=quad[3],e=quad.slice(0,3);for(let i=2;i>0;i--){const j=r(0,i);[e[i],e[j]]=[e[j],e[i]];}const [x,y,z]=e;
    out(`A closed box measures ${x} cm by ${y} cm by ${z} cm. A thin straight rod runs from one bottom corner to the opposite top corner. How long is the rod?`,d,[`First cross the floor: (floor diagonal)² = ${x}² + ${y}² = ${x*x+y*y}.`,`The floor diagonal and the upright edge of ${z} cm meet at a right angle, so rod² = ${x*x+y*y} + ${z}² = ${x*x+y*y+z*z}.`,`${d} × ${d} = ${d*d}, so the rod is ${d} cm long.`],{variant:'box',x,y,z},{suffix:'cm'});}
   if(v===1){const [o,h,s]=triple(r,30),p=r(2,20),q2=p+2*o;out(`A trapezoid (trapezium) has parallel sides of ${p} cm and ${q2} cm. Its other two sides are both ${s} cm long. What is its area?`,(p+q2)/2*h,[`Draw the height from each end of the ${p} cm side. The ${q2} cm side splits into ${o} + ${p} + ${o} cm.`,`Each end piece is a right-angled triangle with longest side ${s} cm and base ${o} cm, so height² = ${s*s} − ${o*o} = ${h*h} and the height is ${h} cm.`,`Area = ½ × (${p} + ${q2}) × ${h} = ${(p+q2)/2*h} cm².`],{variant:'trapezoid',p,q:q2,s},{suffix:'cm²'});}
   if(v===2){const [a,b,c]=triple(r,120);out(`A rectangular park is ${a} m by ${b} m. How many metres shorter is it to walk straight across, from one corner to the opposite corner, than to walk along two sides?`,a+b-c,[`Along two sides: ${a} + ${b} = ${a+b} m.`,`Straight across: diagonal² = ${a}² + ${b}² = ${a*a+b*b}, so the diagonal is ${c} m.`,`The saving is ${a+b} − ${c} = ${a+b-c} m.`],{variant:'shortcut',a,b},{suffix:'m'});}
  }
 }
 /* ---------- probability by counting ---------- */
 if(id==='amc-chance'){
  if(form===0){
   const v=r(0,2);
   if(v===0){const counts={red:r(2,9),blue:r(2,9),green:r(1,8)},col=pick(Object.keys(counts)),T=counts.red+counts.blue+counts.green,n=counts[col];
    prob(`A bag holds ${counts.red} red, ${counts.blue} blue and ${counts.green} green marbles. One marble is taken out at random. What is the probability that it is ${col}?`,n,T,[`Every marble is equally likely to be taken, so probability = (number of ${col} marbles) ÷ (total number of marbles).`,`Total: ${counts.red} + ${counts.blue} + ${counts.green} = ${T}. ${col[0].toUpperCase()+col.slice(1)} marbles: ${n}.`,`Probability = ${simp(n,T)}.`],{variant:'bag',col,...counts});}
   if(v===1){const k=r(1,4),j=r(3,6),opts=[['an even number',[2,4,6]],['a prime number',[2,3,5]],['a multiple of 3',[3,6]],['a factor of 6',[1,2,3,6]],['an odd number',[1,3,5]],[`a number greater than ${k}`,DICE.filter(x=>x>k)],[`a number less than ${j}`,DICE.filter(x=>x<j)]],[desc,set]=pick(opts);
    prob(`A fair six-sided dice is rolled once. What is the probability of rolling ${desc}?`,set.length,6,[`There are 6 equally likely outcomes: 1, 2, 3, 4, 5, 6.`,`The outcomes that work are ${set.join(', ')}: ${set.length} of them.`,`Probability = ${simp(set.length,6)}.`],{variant:'dice',desc});}
   if(v===2){let n,m,list;do{n=r(8,20);m=pick([2,3,4,5]);list=[...Array(Math.floor(n/m)).keys()].map(i=>m*(i+1));}while(!list.length);
    prob(`A spinner has ${n} equal sections numbered 1 to ${n}. It is spun once. What is the probability that it lands on a multiple of ${m}?`,list.length,n,[`All ${n} sections are equally likely.`,`Multiples of ${m} from 1 to ${n}: ${list.join(', ')}. That is ${list.length} sections.`,`Probability = ${simp(list.length,n)}.`],{variant:'spinner',n,m});}
  }
  if(form===1){
   const v=r(0,2);
   if(v===0){const k=r(0,5),s=[r(3,11),r(8,11),r(3,6)][Math.min(k,2)],[desc,test]=[[`exactly ${s}`,(a,b)=>a+b===s],[`${s} or more`,(a,b)=>a+b>=s],[`${s} or less`,(a,b)=>a+b<=s],['an even number',(a,b)=>(a+b)%2===0],['a prime number',(a,b)=>[2,3,5,7,11].includes(a+b)],['a multiple of 3',(a,b)=>(a+b)%3===0]][k],list=pairs(test);
    prob(`Two fair six-sided dice are rolled. What is the probability that the two numbers add up to ${desc}?`,list.length,36,[`Each dice has 6 results, so there are 6 × 6 = 36 equally likely pairs (first dice, second dice). Think of a 6 by 6 table.`,list.length<=15?`Pairs that work: ${show(list)}. That is ${list.length} pairs.`:`In the 6 by 6 table of sums, mark every sum that is ${desc}: ${list.length} pairs.`,`Probability = ${simp(list.length,36)}.`],{variant:'sum',desc});}
   if(v===1){const n=r(3,5),mode=r(0,2),k=r(1,n-1),T=2**n,ways=j=>choose(n,j),C=mode===0?ways(k):mode===1?[...Array(k+1).keys()].reduce((t,j)=>t+ways(j),0):[...Array(n+1).keys()].filter(j=>2*j>n).reduce((t,j)=>t+ways(j),0);
    const desc=mode===0?`exactly ${k} ${k===1?'head':'heads'}`:mode===1?`at most ${k} ${k===1?'head':'heads'}`:'more heads than tails';
    const how=mode===0?`For exactly ${k} ${k===1?'head':'heads'}, choose which ${k===1?'coin is':k+' coins are'} heads: there are ${C} ways${n===3?` (${k===1?'HTT, THT, TTH':'HHT, HTH, THH'})`:''}.`:mode===1?`At most ${k} heads means ${[...Array(k+1).keys()].join(', ')} heads: ${[...Array(k+1).keys()].map(j=>ways(j)).join(' + ')} = ${C} ways.`:`More heads than tails means ${[...Array(n+1).keys()].filter(j=>2*j>n).join(', ')} heads: ${[...Array(n+1).keys()].filter(j=>2*j>n).map(j=>ways(j)).join(' + ')} = ${C} ways.`;
    prob(`${n} fair coins are tossed. What is the probability of getting ${desc}?`,C,T,[`Each coin lands heads or tails, so there are ${Array(n).fill(2).join(' × ')} = ${T} equally likely results.`,how,`Probability = ${simp(C,T)}.`],{variant:'coins',n,desc});}
   if(v===2){if(r(0,1)){const n=r(2,5),T=2**n;prob(`${n} fair coins are tossed. What is the probability of getting at least one head?`,T-1,T,[`Count the opposite: no heads at all means every coin shows tails. That is 1 result.`,`There are ${Array(n).fill(2).join(' × ')} = ${T} equally likely results altogether.`,`So ${T} − 1 = ${T-1} results have at least one head. Probability = ${simp(T-1,T)}.`],{variant:'at-least',coins:n});}
    else{const k=r(4,6),none=(k-1)*(k-1),desc=k===6?'a 6':`${k} or more`;prob(`Two fair six-sided dice are rolled. What is the probability that at least one of them shows ${desc}?`,36-none,36,[`Count the opposite: neither dice shows ${desc}. Then each dice shows one of 1 to ${k-1}.`,`That happens in ${k-1} × ${k-1} = ${none} of the 36 equally likely pairs.`,`So ${36} − ${none} = ${36-none} pairs work. Probability = ${simp(36-none,36)}.`],{variant:'at-least',k});}}
  }
  if(form===2){
   const v=r(0,2);
   if(v===0){const R=r(2,8),Bl=r(2,8),n=R+Bl,both=r(0,1),T=n*(n-1),fav=both?R*(R-1):2*R*Bl;
    prob(`A bag holds ${R} red and ${Bl} blue counters. Two counters are taken out at random, one after the other, without putting the first one back. What is the probability that ${both?'both counters are red':'one counter is red and the other is blue'}?`,fav,T,[`Count ordered pairs: the first counter is any of ${n} and the second is any of the ${n-1} left, so there are ${n} × ${n-1} = ${T} equally likely ordered pairs.`,both?`Both red: ${R} choices for the first red, then ${R-1} for the second: ${R} × ${R-1} = ${fav} ordered pairs.`:`Red then blue: ${R} × ${Bl} = ${R*Bl}. Blue then red: ${Bl} × ${R} = ${R*Bl}. Together: ${fav} ordered pairs.`,`Probability = ${simp(fav,T)}.`],{variant:'no-replace',R,B:Bl,both:!!both});}
   if(v===1){const [a,b]=pick([[2,3],[2,5],[3,5],[3,4],[4,5],[2,7],[3,7],[4,6],[6,8],[4,10],[6,9]]),N=r(30,120),l=lcm(a,b),fa=Math.floor(N/a),fb=Math.floor(N/b),fl=Math.floor(N/l),fav=fa+fb-fl;
    prob(`A whole number from 1 to ${N} is chosen at random. What is the probability that it is a multiple of ${a} or a multiple of ${b} (or both)?`,fav,N,[`Multiples of ${a} up to ${N}: ${fa} of them (the last is ${a} × ${fa} = ${a*fa}).`,`Multiples of ${b} up to ${N}: ${fb} of them (the last is ${b} × ${fb} = ${b*fb}).`,`Numbers in both lists are multiples of ${l}, and they were counted twice: there are ${fl}. So ${fa} + ${fb} − ${fl} = ${fav} numbers work.`,`Probability = ${simp(fav,N)}.`],{variant:'number-pick',N,a,b});}
   if(v===2){const k=r(10,20),opts=[['even',(a,b)=>a*b%2===0],['odd',(a,b)=>a*b%2===1],['a multiple of 3',(a,b)=>a*b%3===0],['a multiple of 4',(a,b)=>a*b%4===0],['a square number',(a,b)=>Number.isInteger(Math.sqrt(a*b))],[`greater than ${k}`,(a,b)=>a*b>k]],[desc,test]=pick(opts),list=pairs(test);
    const odd=pairs((a,b)=>a%2&&b%2).length;
    prob(`Two fair six-sided dice are rolled and the two numbers are multiplied. What is the probability that the product is ${desc}?`,list.length,36,[`There are 6 × 6 = 36 equally likely pairs.`,desc==='even'?`The product is odd only when both numbers are odd: 3 × 3 = ${odd} pairs. So ${36} − ${odd} = ${list.length} pairs give an even product.`:desc==='odd'?`The product is odd only when both numbers are odd (1, 3 or 5): 3 × 3 = ${list.length} pairs.`:`Go through the 6 by 6 table of products and mark those that are ${desc}: ${list.length<=12?show(list)+'. ':''}${list.length} pairs.`,`Probability = ${simp(list.length,36)}.`],{variant:'product',desc});}
  }
  if(form===3){
   const v=r(0,2);
   if(v===0){const k=r(2,6),fav=2*k-1;prob(`Two fair six-sided dice are rolled. What is the probability that the larger of the two numbers shown is exactly ${k}? (If both dice show the same number, that number counts as the larger.)`,fav,36,[`Larger number at most ${k}: both dice show 1 to ${k}, which is ${k} × ${k} = ${k*k} pairs.`,`Larger number at most ${k-1}: ${k-1} × ${k-1} = ${(k-1)*(k-1)} pairs.`,`Larger number exactly ${k}: ${k*k} − ${(k-1)*(k-1)} = ${fav} of the 36 pairs. Probability = ${simp(fav,36)}.`],{variant:'max',k});}
   if(v===1){const a=r(2,9),g=r(2,9),n=a+g,T=choose(n,2),mode=r(0,2),fav=mode===0?a*g:mode===1?choose(g,2):choose(a,2),desc=mode===0?'one is a boy and one is a girl':mode===1?'both are girls':'both are boys';
    prob(`A group has ${a} boys and ${g} girls. Two different pupils are chosen at random. What is the probability that ${desc}?`,fav,T,[`Possible pairs: ${n} × ${n-1} ÷ 2 = ${T}. (${n} × ${n-1} counts every pair twice, once in each order.)`,mode===0?`Pairs with one boy and one girl: ${a} × ${g} = ${fav}.`:mode===1?`Pairs of girls: ${g} × ${g-1} ÷ 2 = ${fav}.`:`Pairs of boys: ${a} × ${a-1} ÷ 2 = ${fav}.`,`Probability = ${simp(fav,T)}.`],{variant:'pair',a,g,mode});}
   if(v===2){const d=r(1,4),fav=2*(6-d),list=pairs((a,b)=>a-b===-d);prob(`Two fair six-sided dice are rolled. What is the probability that the two numbers differ by exactly ${d}?`,fav,36,[`With the first number smaller: ${show(list)}. That is ${6-d} pairs.`,`Each also works the other way round, giving ${6-d} more: ${fav} pairs of the 36.`,`Probability = ${simp(fav,36)}.`],{variant:'diff',d});}
  }
 }
 /* ---------- coordinates and negative numbers ---------- */
 if(id==='amc-coords'){
  if(form===0){
   const v=r(0,2);
   if(v===0){const rise=r(0,1);let t0,u;if(rise){t0=-r(2,12);u=r(3,20);}else{t0=r(1,8);u=r(t0+2,t0+15);}const t1=rise?t0+u:t0-u;
    const how=rise?(u>-t0?`${-t0} degrees bring it up to 0°C. The other ${u+t0} degrees take it to ${sgn(t1)}°C.`:u===-t0?`${u} degrees bring it exactly to 0°C.`:`It does not reach 0°C: ${sgn(t0)} + ${u} = ${sgn(t1)}.`):`${t0} degrees bring it down to 0°C. The other ${u-t0} degrees take it below zero, to ${sgn(t1)}°C.`;
    out(`At 6 a.m. the temperature was ${sgn(t0)}°C. By noon it had ${rise?'risen':'fallen'} by ${u}°C. What was the temperature at noon, in °C?`,t1,[`${rise?'Rising':'Falling'} means moving ${rise?'up':'down'} the number line by ${u}.`,how,`Check: ${sgn(t1)} ${rise?'−':'+'} ${u} = ${sgn(t0)}.`],{variant:'temperature',t0,u,rise:!!rise},{answerLabel:sgn(t1)});}
   if(v===1){const a=r(2,30),b=r(1,30);out(`On a number line, how far apart are ${sgn(-a)} and ${b}?`,a+b,[`From ${sgn(-a)} to 0 is ${a} units.`,`From 0 to ${b} is ${b} units.`,`Altogether ${a} + ${b} = ${a+b}. Subtracting gives the same: ${b} − (${sgn(-a)}) = ${b} + ${a} = ${a+b}.`],{variant:'distance',a,b});}
   if(v===2){const a=r(2,15),b=r(2,20),c=r(2,15),ans=-a+b+c;out(`Work out ${sgn(-a)} + ${b} − (${sgn(-c)}).`,ans,[`Subtracting a negative number is the same as adding the positive number: − (${sgn(-c)}) = + ${c}.`,`So the calculation is ${sgn(-a)} + ${b} + ${c}.`,`${sgn(-a)} + ${b} = ${sgn(b-a)}, and ${sgn(b-a)} + ${c} = ${sgn(ans)}.`],{variant:'evaluate',a,b,c},{answerLabel:sgn(ans)});}
  }
  if(form===1){
   const v=r(0,3);
   if(v===0){const fixed=r(-8,8),p=-r(1,12),s=r(1,12),across=r(0,1),A=across?[p,fixed]:[fixed,p],B=across?[s,fixed]:[fixed,s],xy=across?'x':'y';
    out(`The points A${pt(...A)} and B${pt(...B)} are joined by a straight line. How long is AB?`,s-p,[`A and B have the same ${across?'y':'x'}-coordinate (${sgn(fixed)}), so AB is ${across?'horizontal':'vertical'}.`,`Its length is the difference of the ${xy}-coordinates: ${s} − (${sgn(p)}) = ${s} + ${-p} = ${s-p}.`,`Check on a number line: ${-p} units from ${sgn(p)} to 0, then ${s} more.`],{variant:'segment',A,B});}
   if(v===1){const a=r(1,9),b=r(1,9),c=r(1,9),d=r(1,9),P=[[-a,-b],[c,-b],[c,d],[-a,d]];
    out(`A rectangle has corners at ${P.map(p=>pt(...p)).join(', ')}. What is its area, in square units?`,(a+c)*(b+d),[`Width: from x = ${sgn(-a)} to x = ${c} is ${c} + ${a} = ${a+c}.`,`Height: from y = ${sgn(-b)} to y = ${d} is ${d} + ${b} = ${b+d}.`,`Area = ${a+c} × ${b+d} = ${(a+c)*(b+d)} square units.`],{variant:'rectangle',a,b,c,d},{figure:{module:'contest',kind:'cx-plane',points:P.map((p,i)=>[...p,'ABCD'[i]]),poly:true}});}
   if(v===2){let x=r(-9,9),y=r(-9,9);if(!x)x=4;if(!y)y=-3;const yAxis=r(0,1),k=r(2,9),dir=pick(['up','down','left','right']),Q=yAxis?[-x,y]:[x,-y],R=[Q[0]+(dir==='right'?k:dir==='left'?-k:0),Q[1]+(dir==='up'?k:dir==='down'?-k:0)],sum=R[0]+R[1],moved=dir==='up'||dir==='down'?'y':'x';
    out(`The point P${pt(x,y)} is reflected in the ${yAxis?'y':'x'}-axis to give Q. Then Q is moved ${k} units ${dir} to give R. What is the sum of the two coordinates of R?`,sum,[`Reflecting in the ${yAxis?'y':'x'}-axis changes the sign of the ${yAxis?'x':'y'}-coordinate only: Q = ${pt(...Q)}.`,`Moving ${k} units ${dir} ${['up','right'].includes(dir)?'adds':'subtracts'} ${k} ${['up','right'].includes(dir)?'to':'from'} the ${moved}-coordinate: R = ${pt(...R)}.`,`Sum: ${sgn(R[0])} + ${par(R[1])} = ${sgn(sum)}.`],{variant:'reflect',x,y,k,dir,yAxis:!!yAxis},{answerLabel:sgn(sum)});}
   if(v===3){const reverse=r(0,1),useX=r(0,1),xy=useX?'x':'y';let A=[r(-9,9),r(-9,9)],B=[r(-9,9),r(-9,9)];const i=useX?0:1;if((A[i]+B[i])%2)B[i]+=B[i]<9?1:-1;if(A[i]===B[i])B[i]=A[i]+(A[i]<0?6:-6);const M=[(A[0]+B[0])/2,(A[1]+B[1])/2];
    if(!reverse){const m=M[i];out(`M is the midpoint of A${pt(...A)} and B${pt(B[0],B[1])}. What is the ${xy}-coordinate of M?`,m,[`The midpoint is halfway between, so average the ${xy}-coordinates.`,`(${sgn(A[i])} + ${par(B[i])}) ÷ 2 = ${sgn(A[i]+B[i])} ÷ 2 = ${sgn(m)}.`,`Check: ${sgn(A[i])} and ${sgn(B[i])} are both ${Math.abs(m-A[i])} away from ${sgn(m)}.`],{variant:'midpoint',reverse:false,A,B,xy},{answerLabel:sgn(m)});}
    else{const Mi=[Math.round(M[0]),Math.round(M[1])];Mi[i]=M[i];const step=Mi[i]-A[i],b=Mi[i]+step;out(`M${pt(...Mi)} is the midpoint of the segment from A${pt(...A)} to B. What is the ${xy}-coordinate of B?`,b,[`Going from A to M changes the ${xy}-coordinate by ${sgn(Mi[i])} − ${par(A[i])} = ${sgn(step)}.`,`B is the same step further on: ${sgn(Mi[i])} + ${par(step)} = ${sgn(b)}.`,`Check: (${sgn(A[i])} + ${par(b)}) ÷ 2 = ${sgn(Mi[i])}.`],{variant:'midpoint',reverse:true,A,M:Mi,xy},{answerLabel:sgn(b)});}}
  }
  if(form===2){
   const v=r(0,2);
   if(v===0){const x1=-r(1,8),x2=r(1,9),y0=r(-6,2),h=r(2,9),y3=r(0,1)?y0+h:y0-h,x3=r(-8,9),base=x2-x1,twice=base*h;
    out(`What is the area of the triangle with corners A${pt(x1,y0)}, B${pt(x2,y0)} and C${pt(x3,y3)}, in square units?`,twice/2,[`A and B have the same y-coordinate, so AB is horizontal. Use it as the base: ${x2} − (${sgn(x1)}) = ${base}.`,`The height is the vertical distance from C to the line AB: from y = ${sgn(y0)} to y = ${sgn(y3)} is ${h}. C does not need to be above the base.`,`Area = ½ × ${base} × ${h} = ${half(twice)} square units.`],{variant:'triangle',A:[x1,y0],B:[x2,y0],C:[x3,y3]},{answerLabel:half(twice),figure:{module:'contest',kind:'cx-plane',points:[[x1,y0,'A'],[x2,y0,'B'],[x3,y3,'C']],poly:true}});}
   if(v===1){const W=r(4,10),H=r(4,9),X=r(-6,0),Y=r(-5,0),p=r(1,H-1),q2=r(1,W-1),A=[X,Y],B=[X+W,Y+p],C=[X+q2,Y+H],t1=W*p,t2=(W-q2)*(H-p),t3=q2*H,twice=2*W*H-t1-t2-t3;
    out(`What is the area of the triangle with corners A${pt(...A)}, B${pt(...B)} and C${pt(...C)}, in square units?`,twice/2,[`No side is horizontal or vertical, so draw the smallest rectangle around the triangle: x from ${sgn(X)} to ${sgn(X+W)} and y from ${sgn(Y)} to ${sgn(Y+H)}. It is ${W} by ${H}, with area ${W*H}.`,`Three right-angled triangles fill the gaps: ½ × ${W} × ${p} = ${half(t1)}, ½ × ${W-q2} × ${H-p} = ${half(t2)} and ½ × ${q2} × ${H} = ${half(t3)}.`,`Area = ${W*H} − ${half(t1)} − ${half(t2)} − ${half(t3)} = ${half(twice)} square units.`],{variant:'enclose',A,B,C},{answerLabel:half(twice),figure:{module:'contest',kind:'cx-plane',points:[[...A,'A'],[...B,'B'],[...C,'C']],poly:true,box:[X,Y,X+W,Y+H]}});}
   if(v===2){const dx=r(1,7)*(r(0,1)?1:-1),dy=r(1,7)*(r(0,1)?1:-1),A=[r(-6,4),r(-6,4)],B=[A[0]+dx,A[1]+dy],area=dx*dx+dy*dy;
    out(`A${pt(...A)} and B${pt(...B)} are neighbouring corners of a square. What is the area of the square, in square units?`,area,[`From A to B is ${Math.abs(dx)} across and ${Math.abs(dy)} ${dy>0?'up':'down'}. These are the shorter sides of a right-angled triangle whose longest side is AB.`,`AB² = ${Math.abs(dx)}² + ${Math.abs(dy)}² = ${dx*dx} + ${dy*dy} = ${area}.`,`The area of the square is AB × AB = AB², so it is ${area} square units. You do not need AB itself.`],{variant:'tilted',A,B},{figure:{module:'contest',kind:'cx-plane',points:[[...A,'A'],[...B,'B']],poly:false}});}
  }
  if(form===3){
   const v=r(0,2);
   if(v===0){const [a,b,c]=triple(r,40),P=[r(-12,5),r(-12,5)],Q=[P[0]+a*(r(0,1)?1:-1),P[1]+b*(r(0,1)?1:-1)];
    out(`How far apart are the points P${pt(...P)} and Q${pt(...Q)}?`,c,[`Across: from x = ${sgn(P[0])} to x = ${sgn(Q[0])} is ${a}. Up or down: from y = ${sgn(P[1])} to y = ${sgn(Q[1])} is ${b}.`,`These meet at a right angle, so PQ² = ${a}² + ${b}² = ${a*a} + ${b*b} = ${c*c}.`,`PQ = ${c}, because ${c} × ${c} = ${c*c}.`],{variant:'distance',P,Q});}
   if(v===1){const W=r(4,10),H=r(4,9),X=r(-6,0),Y=r(-5,0),a=r(1,W-1),b=r(1,H-1),c=r(1,W-1),d=r(1,H-1),P=[X+a,Y],Q=[X+W,Y+b],R=[X+c,Y+H],S=[X,Y+d],t=[a*d,(W-a)*b,(W-c)*(H-b),c*(H-d)],twice=2*W*H-t.reduce((s,x)=>s+x,0);
    out(`A four-sided shape has corners P${pt(...P)}, Q${pt(...Q)}, R${pt(...R)} and S${pt(...S)}, joined in that order. What is its area, in square units?`,twice/2,[`Each corner lies on a side of the rectangle with x from ${sgn(X)} to ${sgn(X+W)} and y from ${sgn(Y)} to ${sgn(Y+H)}. That rectangle is ${W} by ${H}, with area ${W*H}.`,`Four right-angled corner triangles lie outside the shape: ½ × ${a} × ${d}, ½ × ${W-a} × ${b}, ½ × ${W-c} × ${H-b} and ½ × ${c} × ${H-d}. Together they make ${half(t.reduce((s,x)=>s+x,0))}.`,`Area = ${W*H} − ${half(t.reduce((s,x)=>s+x,0))} = ${half(twice)} square units.`],{variant:'quad',P,Q,R,S},{answerLabel:half(twice),figure:{module:'contest',kind:'cx-plane',points:[[...P,'P'],[...Q,'Q'],[...R,'R'],[...S,'S']],poly:true,box:[X,Y,X+W,Y+H]}});}
   if(v===2){const [a,b,c]=triple(r,30),A=[r(-9,0),r(-9,0)],L=r(2,9),horiz=r(0,1),B=horiz?[A[0]+L,A[1]]:[A[0],A[1]+L],C=[B[0]+a,B[1]+b],name=pick(NAMES);
    out(`${name} walks in straight lines from A${pt(...A)} to B${pt(...B)} and then to C${pt(...C)}. Each unit is 1 m. How far does ${name} walk altogether, in metres?`,L+c,[`A to B is ${horiz?'horizontal':'vertical'}: its length is ${L} m.`,`B to C goes ${a} across and ${b} up, so BC² = ${a}² + ${b}² = ${c*c} and BC = ${c} m.`,`Altogether ${L} + ${c} = ${L+c} m.`],{variant:'path',A,B,C},{suffix:'m'});}
  }
 }
 return q;
}

/* ---------- quick checks: one per form ---------- */
const qc=(prompt,choices,correct,explain)=>({prompt,choices,correct,explain});
const quickChecks={
 'amc-right':[
  qc('In a right-angled triangle, which side is the longest?',['The side opposite the right angle','A side that touches the right angle','It depends on the drawing'],0,'The side opposite the right angle (the hypotenuse) is always the longest. Pythagoras’ theorem links it to the other two: (longest)² = a² + b².'),
  qc('You know the longest side c and one shorter side a. What do you work out to find the other side?',['c² − a², then its square root','c² + a², then its square root','c − a'],0,'The squares of the two shorter sides add up to the square of the longest side, so the missing shorter side squared is c² − a².'),
  qc('A triangle has two equal sides. Where does its height from the top corner meet the base?',['At the middle of the base, at a right angle','At one end of the base','Anywhere along the base'],0,'Folding along the height matches the two halves, so the height cuts the base in half at a right angle. Each half is a right-angled triangle.'),
  qc('How do you find the distance between opposite corners of a box?',['Use the floor diagonal and the height in a second right-angled triangle','Add the three edges','Multiply the three edges'],0,'The floor diagonal and the upright edge meet at a right angle, so use Pythagoras twice: d² = a² + b² + c².')
 ],
 'amc-chance':[
  qc('When all outcomes are equally likely, what is a probability?',['Outcomes that work ÷ all outcomes','All outcomes ÷ outcomes that work','Outcomes that work − outcomes that fail'],0,'For example, rolling an even number: 3 outcomes work out of 6, so the probability is 3/6 = 1/2.'),
  qc('Two dice are rolled. Why count 36 outcomes rather than the 11 possible sums?',['The 36 pairs are equally likely; the sums are not','There are 36 faces altogether','All sums from 2 to 12 are equally likely'],0,'A sum of 7 comes from 6 pairs but a sum of 2 from only 1, so the sums are not equally likely. Count the 36 equally likely pairs.'),
  qc('Two counters are taken without putting the first back. What changes for the second one?',['There is one counter fewer to choose from','Nothing changes','Its probability is always 1/2'],0,'The second pick is from what is left. Count ordered pairs as (choices for the first) × (choices left for the second).'),
  qc('When is “1 − (probability it does not happen)” the quickest method?',['For “at least one” and other questions with many cases','Never; always count directly','Only for coins'],0,'“At least one six in two rolls” has many cases, but “no six” is a single 5 by 5 block: 25 of the 36 pairs. So the answer is 11/36.')
 ],
 'amc-coords':[
  qc('What is −4 − (−6)?',['2','−10','10'],0,'Subtracting −6 is the same as adding 6: −4 + 6 = 2.'),
  qc('The points (−3, 2) and (5, 2) are joined. How long is the segment?',['8','2','5'],0,'They have the same y-coordinate, so the segment is horizontal: 5 − (−3) = 8.'),
  qc('A triangle has corners (0, 0), (6, 0) and (2, 5). Using the side on the x-axis as the base, what is its height?',['5','2','6'],0,'The height is the vertical distance from (2, 5) to the x-axis, which is 5. The x-coordinate 2 does not matter.'),
  qc('How far is (1, 2) from (4, 6)?',['5','7','25'],0,'It is 3 across and 4 up, so distance² = 3² + 4² = 25 and the distance is 5.')
 ]
};

/* ---------- exam-style monochrome figures (not drawn to scale) ---------- */
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const f=x=>Number(x.toFixed(2));
const T=(x,y,t,extra='')=>`<text x="${f(x)}" y="${f(y)}" ${extra}>${esc(t)}</text>`;
function frame(key,alt,body,view='0 0 480 320'){
 return `<svg class="entrance-figure" viewBox="${view}" role="img" aria-labelledby="${key}-title" xmlns="http://www.w3.org/2000/svg"><title id="${key}-title">${esc(alt)}</title><g fill="none" stroke="#222" stroke-width="1.6" stroke-linejoin="round">${body}</g><style>.entrance-figure text{fill:#222;stroke:none;font:19px Georgia,serif;text-anchor:middle}.entrance-figure .cx-small{font-size:13px}</style></svg>`;
}
function diagram(spec,id='figure'){
 const key='cx-'+String(id).replace(/[^a-zA-Z0-9_-]/g,'').slice(0,90);
 if(spec.kind==='cx-right'){
  // Shorter sides drawn horizontal and vertical, proportioned from the real lengths within limits.
  const ratio=Math.max(0.35,Math.min(2.6,spec.h/spec.w)),W=ratio>1?230/ratio:300,H=W*ratio,x0=110,y0=280,B=[x0,y0],C=[x0+W,y0],A=[x0,y0-H];
  const b=`<path d="M${f(A[0])} ${f(A[1])}L${f(B[0])} ${f(B[1])}L${f(C[0])} ${f(C[1])}Z"/><path d="M${x0} ${y0-16}h16v16"/>`+T((B[0]+C[0])/2,y0+26,spec.labels[0])+T(x0-14,(A[1]+B[1])/2+6,spec.labels[1],'text-anchor="end"')+T((A[0]+C[0])/2+18,(A[1]+C[1])/2-8,spec.labels[2],'text-anchor="start"');
  return frame(key,`Right-angled triangle. The horizontal side is labelled ${spec.labels[0]}, the vertical side ${spec.labels[1]} and the sloping longest side ${spec.labels[2]}. Not drawn to scale.`,b);
 }
 if(spec.kind==='cx-tilt'){
  const s=240,x0=120,y0=40,t=spec.a/(spec.a+spec.b),P=[x0+t*s,y0],Q=[x0+s,y0+t*s],R=[x0+s-t*s,y0+s],S=[x0,y0+s-t*s];
  const b=`<rect x="${x0}" y="${y0}" width="${s}" height="${s}"/><path d="M${[P,Q,R,S].map(p=>f(p[0])+' '+f(p[1])).join('L')}Z"/>`+T(x0-12,y0-6,'A')+T(x0+s+12,y0-6,'B')+T(x0+s+12,y0+s+20,'C')+T(x0-12,y0+s+20,'D')+T(P[0],y0-10,'P')+T(Q[0]+14,Q[1]+6,'Q')+T(R[0],y0+s+22,'R')+T(S[0]-14,S[1]+6,'S')+T((x0+P[0])/2,y0+22,`${spec.a}`,'class="cx-small"')+T((P[0]+x0+s)/2,y0+22,`${spec.b}`,'class="cx-small"');
  return frame(key,`Square ABCD with a smaller tilted square PQRS whose corners lie on the sides of ABCD. On side AB, AP is ${spec.a} cm and PB is ${spec.b} cm.`,b,'0 0 480 320');
 }
 if(spec.kind==='cx-plane'){
  const pts=spec.points,xs=pts.map(p=>p[0]).concat(0,spec.box?[spec.box[0],spec.box[2]]:[]),ys=pts.map(p=>p[1]).concat(0,spec.box?[spec.box[1],spec.box[3]]:[]);
  const minX=Math.min(...xs)-1,maxX=Math.max(...xs)+1,minY=Math.min(...ys)-1,maxY=Math.max(...ys)+1,cell=Math.min(440/(maxX-minX),290/(maxY-minY)),ox=240-cell*(minX+maxX)/2,oy=165+cell*(minY+maxY)/2,X=x=>ox+cell*x,Y=y=>oy-cell*y;
  let b='';
  for(let x=minX;x<=maxX;x++)b+=`<line x1="${f(X(x))}" y1="${f(Y(minY))}" x2="${f(X(x))}" y2="${f(Y(maxY))}" stroke="#bbb" stroke-width="0.6"/>`;
  for(let y=minY;y<=maxY;y++)b+=`<line x1="${f(X(minX))}" y1="${f(Y(y))}" x2="${f(X(maxX))}" y2="${f(Y(y))}" stroke="#bbb" stroke-width="0.6"/>`;
  b+=`<line x1="${f(X(minX))}" y1="${f(Y(0))}" x2="${f(X(maxX))}" y2="${f(Y(0))}" stroke-width="1.8"/><line x1="${f(X(0))}" y1="${f(Y(minY))}" x2="${f(X(0))}" y2="${f(Y(maxY))}" stroke-width="1.8"/>`;
  b+=T(X(maxX)-8,Y(0)-8,'x','class="cx-small"')+T(X(0)+10,Y(maxY)+14,'y','class="cx-small"')+T(X(0)-8,Y(0)+16,'0','class="cx-small"');
  if(spec.box)b+=`<rect x="${f(X(spec.box[0]))}" y="${f(Y(spec.box[3]))}" width="${f(cell*(spec.box[2]-spec.box[0]))}" height="${f(cell*(spec.box[3]-spec.box[1]))}" stroke-dasharray="6 4" stroke-width="1.2"/>`;
  if(pts.length>1)b+=`<path d="M${pts.map(p=>f(X(p[0]))+' '+f(Y(p[1]))).join('L')}${spec.poly?'Z':''}" stroke-width="2.2"/>`;
  for(const [x,y,l] of pts){b+=`<circle cx="${f(X(x))}" cy="${f(Y(y))}" r="4" fill="#222"/>`+T(X(x)+(x>=0?14:-14),Y(y)-10,l);}
  return frame(key,`Coordinate grid with axes through 0. Points ${pts.map(p=>p[2]+' at '+pt(p[0],p[1])).join(', ')}${spec.poly&&pts.length>2?', joined to make a closed shape':pts.length===2?', joined by a straight line':''}${spec.box?'. A dashed rectangle surrounds the shape':''}.`,b,'0 0 480 330');
 }
 return '';
}

const api={units,make,diagram,quickChecks,TRIPLES,QUADS};
root.MochiDSA_contest=api;
if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
