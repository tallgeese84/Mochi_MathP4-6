/* DSA-style challenge units: harder, original question types that extend the main pathway.
   Calibrated against the difficulty of the supplied preparation booklet; no booklet problem is reproduced.
   These units are kept out of the reserved mixed papers so existing paper blueprints never change. */
(function(root){
'use strict';
const unit=(id,strand,title,foundation,prerequisites,ideas,check,why)=>({id,strand,title,foundation,benchmarkPages:'Challenge extension (harder benchmark-style types)',extension:true,prerequisites,ideas,check,why});
const units=[
 unit('ch-totals','algebra','Challenge · Keep track of every total','m-algebra',['relationships','remainders','rates'],[
  'Long word problems change several amounts in stages. Before calculating, write one line per stage: who has what, and what stays fixed. A total that never changes, or one that changes by a known amount, is usually the anchor of the whole problem.',
  'When a condition compares one person with “everyone else”, add the person to both sides. “Mine plus the extra is k times yours and theirs together” means the grand total is (k + 1) times “yours and theirs”. Each such sentence turns into a fraction of the same grand total, so the separate amounts can be compared directly.',
  'Rates that keep acting while something else changes (grass that keeps growing, tickets that rise by a percentage) are handled by naming the rate per day or per item and writing each scenario as one equation. Two scenarios that differ by one animal or one group reveal that group’s rate by subtraction.'
 ],['Mine plus the extra is 3 times what the other two have together. What fraction of the grand total do the other two have?',['One third','One quarter','Three quarters'],1,'The grand total is my share with the extra plus the other two: 3 parts + 1 part = 4 parts. The other two hold 1 of those 4 parts.'],'Name the fixed total first. Then express each condition as a fraction or a multiple of that one total.'),
 unit('ch-motion','algebra','Challenge · Same time, different distances','m-rate',['motion','rates'],[
  'When two people start at the same moment and arrive at the same moment, they travel for the same time. Their distances are then in the same ratio as their speeds, and the DIFFERENCE in distance is covered at the difference in speed.',
  'Symmetry gives a difference for free. If a meeting place is m metres from the exact midpoint between two starting points, one person travels m metres more than half the gap and the other m metres less. The difference in distance is 2m.',
  'On a moving staircase, count steps as distances. Your own steps measure your speed relative to the stairs. While you walk, the staircase also moves a number of steps in proportion to the time you spend on it. Write “visible steps = my steps ± staircase steps” for each trip and compare the times.'
 ],['Two cyclists set off together and arrive together. One cycles 15 m/min faster. After 8 minutes, how much further has the faster one gone?',['15 m','120 m','8 m'],1,'In the same time, the extra speed builds an extra distance: 15 × 8 = 120 m.'],'Look for the shared time. Then use the difference in distances with the difference in speeds.'),
 unit('ch-circles','geometry','Challenge · Hidden radii and circle patterns','m-circles',['circles','decomposition'],[
  'A radius can hide inside a figure. Any segment from the centre to the circle is a radius, and the two diagonals of a rectangle are equal. So if a rectangle has one corner at the centre and the opposite corner on the circle, BOTH of its diagonals equal the radius.',
  'Equal chords of the same circle cut off equal arcs, and the triangle from the centre to a chord depends only on the chord. You may therefore rearrange the sides of a polygon drawn in a circle without changing its area. Choose the arrangement that is easiest to measure.',
  'Nested shapes often repeat the same scale factor. A square drawn inside a circle has half the area of the square drawn around that circle. For overlapping curved regions, add the pieces you can calculate and subtract any overlap counted twice. Keep answers in terms of π until the final step.'
 ],['A rectangle has one corner at the centre of a circle of radius 9 cm and the opposite corner on the circle. How long is its other diagonal?',['9 cm','18 cm','It cannot be found'],0,'The diagonals of a rectangle are equal, and the first diagonal is a radius.'],'Ask which segments are radii and which shapes repeat at a fixed scale. A clever rearrangement can replace a long calculation.'),
 unit('ch-angles','geometry','Challenge · Angles on grids and overlapping shapes','m-angles',['angles','decomposition'],[
  'On a square grid, a diagonal of a single square makes 45° with the grid lines. To add two angles made by grid segments, build a right-angled triangle whose legs are in the same ratio as the second segment, placed on the first segment. If the new hypotenuse is a 45° diagonal, the two angles add to 45°.',
  'A segment that goes 2 right and 1 up makes the same angle as any segment that goes 4 right and 2 up: the angle depends only on the ratio of the moves. Turning a grid segment through a right angle swaps its moves, so a segment perpendicular to “3 right, 1 up” goes “1 left, 3 up”.',
  'For several overlapping rectangles or squares, total area = sum of the separate areas − each overlap counted twice. For the outline (perimeter) of a row of overlapping squares standing on one line, add the bottom, the top and every vertical edge you can actually see.'
 ],['A segment goes 6 right and 3 up. Which segment makes the same angle with the horizontal?',['2 right and 1 up','3 right and 6 up','6 right and 1 up'],0,'6 : 3 is the same ratio as 2 : 1, so the slope and the angle are the same.'],'Compare ratios, not lengths. Then look for a 45° diagonal or a right angle that combines the pieces.'),
 unit('ch-number','number','Challenge · Factors, squares and letter sums','m-factors',['factors','sums','digits'],[
  'Write a number as a product of prime powers. A factor chooses each prime’s power independently, from 0 up to the power in the number. Conditions on the factor (odd, a multiple of 10, …) change only the allowed range for the primes involved.',
  'If two square numbers differ by D, then (larger root − smaller root) × (larger root + smaller root) = D. List every factor pair of D. The two factors must have the same parity (both odd or both even) so that the roots are whole numbers. Each valid pair gives exactly one pair of squares.',
  'In a letter sum, each letter is one digit and different letters are different digits. Start where the information is strongest: a leading carry is always 1, a column that adds a digit to itself makes an even result plus any carry, and a column like L + L ending in L forces L to be 0 unless there is a carry. Check the finished sum.'
 ],['Two square numbers differ by 21. Which factor pair of 21 can give the two roots?',['3 and 7','1 and 21','Both pairs'],2,'Both pairs have two odd factors. 1 × 21 gives roots 10 and 11; 3 × 7 gives roots 2 and 5.'],'Turn the condition into a product, list every factor pair or case, and check each one against all the conditions.'),
 unit('ch-sequences','number','Challenge · Find the rule behind a sequence','m-proof',['patterns','spirals'],[
  'Look at the differences between neighbouring terms. If the differences go up by the same amount each time, the second differences are constant: extend the differences first, then the terms.',
  'In a Fibonacci-type sequence, each term after the first two is the sum of the two before it. Once you know any two neighbouring terms, the whole sequence is fixed, both forwards (add) and backwards (subtract: earlier term = later term − the one before it).',
  'If the differences themselves double (or triple), the sequence grows faster and faster. Write the differences in a row, find their rule, and add them back on one at a time. Always test your rule on every given term, not only the last two.'
 ],['3, 5, 9, 15, 23, … What is the next difference?',['8','10','12'],1,'The differences are 2, 4, 6, 8, so the next is 10 and the next term is 33.'],'Check differences, sums of neighbours, and growth factors before guessing. Test the rule on every term you were given.')
];

/* ---------- helpers ---------- */
const gcd=(a,b)=>{a=Math.abs(a);b=Math.abs(b);while(b)[a,b]=[b,a%b];return a;};
const lcm=(a,b)=>a/gcd(a,b)*b;
const money=n=>'$'+n.toLocaleString('en-GB');

/* Fixed parameter families, checked at load and in tests. */
const leftoverTriples=[[5,3,2],[3,2,1],[4,3,2],[5,4,2],[6,3,2],[4,2,1]].filter(([a,b,c])=>{const f=1/(a+1)+1/(b+1)+1/(c+1);const S=f/2;return f<2&&S-1/(a+1)>0&&S-1/(b+1)>0&&S-1/(c+1)>0&&new Set([S-1/(a+1),S-1/(b+1),S-1/(c+1)].map(x=>x.toFixed(9))).size===3;});
const grazingSets=(()=>{const out=[];for(let c=3;c<=9;c++)for(let g=1;g<=6;g++)for(let r=1;r<=5;r++)for(let k=1;k<c;k++){const den=[c+g-k,c+r-k,c-k,g+r-k,c+g+r-k];if(den.some(d=>d<=0)||g===r)continue;const L=den.reduce(lcm,1);if(L>360)continue;const t=den.map(d=>L/d);if(t.some(x=>x>240)||new Set(t.slice(0,4)).size<4)continue;out.push({c,g,r,k,L,t});}return out;})();
const escalators=(()=>{const out=[];for(const k of [2,3])for(let s1=6;s1<=30;s1++)for(let s2=s1+2;s2<=60;s2++){const num=s1*s2*(1+k),den=s2+k*s1;if(num%den)continue;const N=num/den;if(N>s1&&N<s2&&N<=60)out.push({k,s1,s2,N});}return out;})();
const hexes=[[2,1],[3,1],[3,2],[4,1],[4,3],[5,2]];
const angleSets=[
 {ends:[[2,1],[3,1]],sum:45,steps:['The marked angles belong to segments O→(2,1) and O→(3,1).','From P(6,2), which is twice as far as (3,1) along the same line, move 1 left and 3 up to Q(5,5). That move is at right angles to OP and half as long, so triangle OPQ has the same shape as the triangle for the segment “2 right, 1 up”. Angle POQ equals the angle of O→(2,1).','So the two angles together make the angle of OQ. Q is 5 right and 5 up, a 45° diagonal.','Sum = 45°.']},
 {ends:[[1,1],[2,1],[3,1]],sum:90,steps:['The segment O→(1,1) is a square’s diagonal: 45°.','For O→(2,1) and O→(3,1): from P(6,2) move 1 left and 3 up to Q(5,5). Triangle OPQ is right-angled at P with legs in the ratio 1 : 2, so angle POQ equals the angle of O→(2,1).','So those two angles together make the 45° angle of O→(5,5).','Sum = 45° + 45° = 90°.']},
 {ends:[[4,1],[5,3]],sum:45,steps:['The marked angles belong to O→(4,1) and O→(5,3).','From P(20,12), four times as far as (5,3), move 3 left and 5 up to Q(17,17). That move is at right angles to OP and a quarter as long, so angle POQ equals the angle of O→(4,1).','Q is 17 right and 17 up: a 45° diagonal.','Sum = 45°.']},
 {ends:[[1,1],[4,1],[5,3]],sum:90,steps:['O→(1,1) is a square’s diagonal: 45°.','For O→(4,1) and O→(5,3): from P(20,12) move 3 left and 5 up to Q(17,17). Triangle OPQ is right-angled at P with legs in the ratio 1 : 4, matching the segment “4 right, 1 up”.','So those two angles together make the 45° angle of O→(17,17).','Sum = 45° + 45° = 90°.']}
];
const puzzles=[
 {a:'TAIL',b:'TAIL',c:'HISS',value:3744,check:'1872 + 1872 = 3744',hint:'HISS has no extra digit, so T is at most 4. I + I ends in S and the next column S + ... must match.'},
 {a:'FED',b:'BED',c:'BALL',value:1044,check:'872 + 172 = 1044',hint:'A three-digit sum reaching four digits starts with 1, so B = 1.'},
 {a:'TOES',b:'TOES',c:'MEOWS',value:17940,check:'8970 + 8970 = 17940',hint:'The answer is one digit longer, so M = 1. S + S ends in S, so S = 0.'},
 {a:'NAPS',b:'NAPS',c:'PAUSE',value:15024,check:'7512 + 7512 = 15024',hint:'The answer is one digit longer, so P = 1.'},
 {a:'YARN',b:'YARN',c:'TABBY',value:12556,check:'6278 + 6278 = 12556',hint:'The answer is one digit longer, so T = 1.'},
 {a:'BALL',b:'BALL',c:'CLAWS',value:17954,check:'8977 + 8977 = 17954',hint:'The answer is one digit longer, so C = 1.'},
 {a:'PAUSE',b:'PAUSE',c:'NAPPY',value:59228,check:'29614 + 29614 = 59228',hint:'NAPPY has no extra digit, so P is at most 4. Look at the repeated P in the middle.'},
 {a:'PURR',b:'YARN',c:'NAPPY',value:15669,check:'6088 + 9581 = 15669',hint:'The answer is one digit longer, so N = 1.'}
];
const diffSquareTotals=[24,32,40,45,48,60,64,72,80,96];
/* Revision 2 families. */
const mirror=([a,b])=>({ends:[[a,b],[b,a]],sum:90,steps:[`The segment ${b} right, ${a} up is the mirror image of ${a} right, ${b} up in the 45° diagonal through O.`,`So its angle with the horizontal equals the first segment’s angle with the vertical line through O.`,`A segment’s angles with the horizontal and with the vertical add to 90°.`,'Sum = 90°.']});
const angleSets2={
 0:[angleSets[0],angleSets[2],
  {ends:[[5,1],[3,2]],sum:45,steps:['The marked angles belong to O→(5,1) and O→(3,2).','From P(15,10), five times as far as (3,2), move 2 left and 3 up to Q(13,13). That move is at right angles to OP and a fifth as long, so angle POQ equals the angle of O→(5,1).','Q is 13 right and 13 up: a 45° diagonal.','Sum = 45°.']},
  {ends:[[7,1],[4,3]],sum:45,steps:['The marked angles belong to O→(7,1) and O→(4,3).','From P(28,21), seven times as far as (4,3), move 3 left and 4 up to Q(25,25). That move is at right angles to OP and a seventh as long, so angle POQ equals the angle of O→(7,1).','Q is 25 right and 25 up: a 45° diagonal.','Sum = 45°.']},
  ...[[2,1],[3,1],[3,2],[4,1]].map(mirror),
  {ends:[[1,2],[1,3]],sum:135,steps:['O→(1,2) is the mirror image of O→(2,1) in the 45° diagonal, so its angle is 90° minus the angle of O→(2,1). Likewise O→(1,3) makes 90° minus the angle of O→(3,1).','The angles of O→(2,1) and O→(3,1) add to 45°: from P(6,2) move 1 left and 3 up to Q(5,5), a 45° diagonal. Triangle OPQ is right-angled at P with legs in the ratio 1 : 2.','Sum = 90° + 90° − 45° = 135°.']}],
 1:[angleSets[1],angleSets[3],
  {ends:[[1,1],[2,1],[1,2]],sum:135,steps:['O→(1,1) is a square’s diagonal: 45°.','O→(1,2) is the mirror image of O→(2,1) in that diagonal, so its angle with the horizontal equals the angle of O→(2,1) with the vertical. Together those two make 90°.','Sum = 45° + 90° = 135°.']},
  {ends:[[1,1],[3,1],[1,3]],sum:135,steps:['O→(1,1) is a square’s diagonal: 45°.','O→(1,3) is the mirror image of O→(3,1) in that diagonal, so its angle with the horizontal equals the angle of O→(3,1) with the vertical. Together those two make 90°.','Sum = 45° + 90° = 135°.']},
  {ends:[[1,1],[1,2],[1,3]],sum:180,steps:['O→(1,1) is a square’s diagonal: 45°.','O→(1,2) and O→(1,3) are the mirror images of O→(2,1) and O→(3,1) in that diagonal, so their angles are 90° minus the angles of O→(2,1) and O→(3,1).','The angles of O→(2,1) and O→(3,1) add to 45°: from P(6,2) move 1 left and 3 up to Q(5,5), a 45° diagonal.','So O→(1,2) and O→(1,3) together make 180° − 45° = 135°, and the sum is 45° + 135° = 180°.']}]
};
const factorConditions=[
 {id:'6-not-4',desc:'multiples of 6 but not multiples of 4',rng:{2:[1,1],3:[1,9],5:[0,9]},why:{2:'at least one 2 for 6, but not two 2s (that would make a multiple of 4)',3:'at least one 3 for 6',5:'any power'}},
 {id:'12-not-8',desc:'multiples of 12 but not multiples of 8',rng:{2:[2,2],3:[1,9],5:[0,9]},why:{2:'at least two 2s for 12, but not three (that would make a multiple of 8)',3:'at least one 3 for 12',5:'any power'}},
 {id:'15-not-9',desc:'multiples of 15 but not multiples of 9',rng:{2:[0,9],3:[1,1],5:[1,9]},why:{2:'any power',3:'at least one 3 for 15, but not two (that would make a multiple of 9)',5:'at least one 5 for 15'}},
 {id:'odd-15',desc:'odd multiples of 15',rng:{2:[0,0],3:[1,9],5:[1,9]},why:{2:'none at all, so the factor is odd',3:'at least one 3 for 15',5:'at least one 5 for 15'}},
 {id:'10-not-25',desc:'multiples of 10 but not multiples of 25',rng:{2:[1,9],3:[0,9],5:[1,1]},why:{2:'at least one 2 for 10',3:'any power',5:'exactly one 5: at least one for 10, but two would make a multiple of 25'}},
 {id:'18-not-27',desc:'multiples of 18 but not multiples of 27',rng:{2:[1,9],3:[2,2],5:[0,9]},why:{2:'at least one 2 for 18',3:'exactly two 3s: at least two for 18, but three would make a multiple of 27',5:'any power'}},
 {id:'square',desc:'perfect squares',square:true}
];
function factorCondition(r,pick){
 for(let t=0;t<500;t++){
  const e={2:r(2,5),3:r(1,4),5:r(1,3)},N=2**e[2]*3**e[3]*5**e[5];if(N>30000||N<360)continue;const c=pick(factorConditions);
  const opts={};for(const p of [2,3,5]){const L=[];for(let k=0;k<=e[p];k++)if(c.square?k%2===0:k>=c.rng[p][0]&&k<=c.rng[p][1])L.push(k);opts[p]=L;}
  const count=opts[2].length*opts[3].length*opts[5].length;if(count<3)continue;
  if(!c.square&&![2,3,5].some(p=>c.rng[p][1]<e[p]))continue;
  const line=p=>`Power of ${p}: ${c.square?'must be even':c.why[p]}: ${opts[p].join(', ')} — ${opts[p].length} choice${opts[p].length===1?'':'s'}.`;
  return {N,id:c.id,desc:c.desc,count,steps:[`${N} = 2^${e[2]} × 3^${e[3]} × 5^${e[5]}. A factor chooses a power of each prime, up to the power in ${N}.`,c.square?'A factor is a perfect square exactly when every prime appears an even number of times.':`Turn the condition into a rule for each prime.`,line(2),line(3),line(5),`Count = ${opts[2].length} × ${opts[3].length} × ${opts[5].length} = ${count}.`]};
 }
 throw Error('No factor condition');
}
function squarePairs(D){const out=[];for(let x=1;x*x<D;x++){if(D%x)continue;const y=D/x;if((x+y)%2||y-x<2)continue;out.push({x,y,n:(y-x)/2,m:(y+x)/2});}return out;}

/* ---------- generators ---------- */
function make(id,form,seed,r,rev=2){
 let q=null;const out=(text,answer,steps,params={},extra={})=>q={text,answer,steps,params,...extra};
 const pick=a=>a[r(0,a.length-1)];
 if(id==='ch-totals'){
  if(form===0){
   const pa=pick([18,20,24,25]),pc=pick([10,12,15]),c=10*r(18,40),d=10*r(5,Math.max(5,c/10-6)),a=c-d,down=pick([10,20]),up=pick([20,30]),a2=a*(100-down)/100,c2=c*(100+up)/100,N=a2+c2,coef=(200-down+up)/100;
   out(`At a fair, an adult ticket costs $${pa} and a child ticket costs $${pc}. On Saturday, ${d} fewer adult tickets than child tickets were sold. On Sunday, the number of adult tickets sold fell by ${down}% and the number of child tickets sold rose by ${up}%, compared with Saturday. Altogether ${N} tickets were sold on Sunday. How much money was collected on Saturday?`,pa*a+pc*c,[`Let c be Saturday’s child tickets. Saturday’s adult tickets are c − ${d}.`,`Sunday: ${(100-down)/100} × (c − ${d}) + ${(100+up)/100} × c = ${N}.`,`So ${coef}c − ${(100-down)/100*d} = ${N}, giving ${coef}c = ${N+(100-down)/100*d} and c = ${c}.`,`Saturday: ${c} child and ${a} adult tickets.`,`Money = ${a} × $${pa} + ${c} × $${pc} = ${money(pa*a+pc*c)}.`,`Check Sunday: ${a2} + ${c2} = ${N}.`],{pa,pc,c,d,down,up,N});
  }
  if(form===1){
   const [k1,k2,k3]=pick(leftoverTriples),L=[k1+1,k2+1,k3+1].reduce(lcm,1),m=r(1,3),T=2*L*m,qr=T/(k1+1),pr=T/(k2+1),pq=T/(k3+1),S=(qr+pr+pq)/2,P=S-qr,Q=S-pr,R=S-pq,pile=T-S,g=P-R;
   if(g<=0)return make(id,form,seed+1,r,rev);
   out(`Three friends, Pia, Qi and Ravi, each own a different number of stickers. They find a pile of spare stickers. Pia says, “If I take the whole pile, I will have ${k1} times as many as Qi and Ravi have together.” Qi says, “If I take the whole pile, I will have ${k2} times as many as Pia and Ravi together.” Ravi says, “If I take the whole pile, I will have ${k3} times as many as Pia and Qi together.” Pia has ${g} more stickers than Ravi. How many stickers does Qi have?`,Q,[`Let G be the grand total, including the pile. Pia’s statement makes G = ${k1+1} × (Qi + Ravi), so Qi + Ravi = G/${k1+1}.`,`Likewise Pia + Ravi = G/${k2+1} and Pia + Qi = G/${k3+1}.`,`Adding: 2 × (Pia + Qi + Ravi) = G × (1/${k1+1} + 1/${k2+1} + 1/${k3+1}).`,`Pia − Ravi = (Pia + Qi) − (Qi + Ravi) = G/${k3+1} − G/${k1+1} = ${g}, so G = ${T}.`,`Then Pia + Qi + Ravi = ${S}, and Qi = ${S} − (Pia + Ravi) = ${S} − ${pr} = ${Q}.`,`Check: Pia ${P}, Qi ${Q}, Ravi ${R}, pile ${pile}. Pia + pile = ${P+pile} = ${k1} × ${Q+R}.`],{k1,k2,k3,T,P,Q,R,pile});
  }
  if(form===2){
   for(let tries=0;tries<400&&!q;tries++){
    const A0=3*r(4,14),B0=r(6,40),N=A0+B0;if((B0+A0/3)%3)continue;
    const A1=2*A0/3,B1=B0+A0/3,A2=A1+B1/3,B2=2*B1/3;if(A2%2||B2%2)continue;
    const p=r(1,2),qv=r(1,2),A3=A2/2-p,B3=B2/2+qv,C=A2/2+p+B2/2-qv,d2=B3-A3,d1=C-B3;if(A3<1||d1<1||d2<1)continue;
    out(`${N} children are at two games, Hoops and Ladders. First, one third of the children at Hoops move to Ladders. Then one third of the children now at Ladders move to Hoops. A new game, Kites, then opens: 1 more than half of the children at Hoops move to Kites, and ${qv} fewer than half of the children at Ladders move to Kites. In the end, Kites has ${d1} more children than Ladders, and Ladders has ${d2} more than Hoops. How many children were at Hoops at the start?`,A0,[`End: let Hoops have h. Then Ladders has h + ${d2} and Kites has h + ${d2+d1}. Together 3h + ${2*d2+d1} = ${N}, so h = ${A3}.`,`End: Hoops ${A3}, Ladders ${B3}, Kites ${C}.`,`Undo Kites: Hoops kept half minus 1, so before it had 2 × (${A3} + 1) = ${A2}. Ladders kept half plus ${qv}, so it had 2 × (${B3} − ${qv}) = ${B2}.`,`Undo the second move: Ladders kept two thirds, so it had ${B2} ÷ 2 × 3 = ${B1}, and sent ${B1/3} to Hoops. Hoops had ${A2} − ${B1/3} = ${A1}.`,`Undo the first move: Hoops kept two thirds, so it started with ${A1} ÷ 2 × 3 = ${A0}.`,`Check: Ladders started with ${N} − ${A0} = ${B0}.`],{A0,B0,p,qv,d1,d2});
    if(p!==1){q.text=q.text.replace('1 more than half of the children at Hoops',`${p} more than half of the children at Hoops`);q.steps[2]=q.steps[2].replace('half minus 1',`half minus ${p}`).replace(`(${A3} + 1)`,`(${A3} + ${p})`);}
   }
   if(!q)throw Error('No transfer case');
  }
  if(form===3){
   const s=pick(grazingSets),[tcg,tcr,tc,tgr,tall]=s.t;
   out(`A field’s grass grows at a constant rate. A cow and a goat together would eat all of it in ${tcg} days. The cow and a rabbit together would take ${tcr} days. The cow alone would take ${tc} days. The goat and the rabbit together would take ${tgr} days. Each animal always eats at its own constant rate. How many days would the cow, goat and rabbit take together?`,tall,[`Measure grass in “fields”. Each day, a group clears 1/(its days) of the field, after allowing for growth.`,`Cow + goat − growth = 1/${tcg}; cow − growth = 1/${tc}. Subtract: goat = 1/${tcg} − 1/${tc}.`,`Cow + rabbit − growth = 1/${tcr}, so rabbit = 1/${tcr} − 1/${tc}.`,`All three − growth = (cow − growth) + goat + rabbit = 1/${tc} + (1/${tcg} − 1/${tc}) + (1/${tcr} − 1/${tc}) = 1/${tall}.`,`So all three take ${tall} days.`,`Check with the goat-and-rabbit clue: growth = goat + rabbit − 1/${tgr}, which is positive (${s.k}/${s.L} of a field per day).`],{t:s.t});
  }
 }
 else if(id==='ch-motion'){
  if(form===0||form===1){
   const vB=pick([60,65,70,75,80]),e=pick([10,15,20,25]),unitM=e/gcd(e,2),m=unitM*r(Math.ceil(40/unitM),Math.floor(140/unitM)),t=2*m/e,vA=vB+e,ben=vB*t,gap=(vA+vB)*t;
   const ask=form===0?'How far is Ben’s house from the shop?':'How far apart are the two houses?';
   out(`Mia and Ben live on a straight road. A playground is exactly halfway between their houses. A shop on the road is ${m} m from the playground, on Ben’s side. They leave home at the same time, cycle towards the shop and arrive together. Ben cycles at ${vB} m/min and Mia cycles ${e} m/min faster. ${ask}`,form===0?ben:gap,[`Mia rides ${m} m more than half the gap; Ben rides ${m} m less. Mia rides 2 × ${m} = ${2*m} m further.`,`They ride for the same time, and Mia gains ${e} m every minute.`,`Time = ${2*m} ÷ ${e} = ${t} minutes.`,form===0?`Ben’s distance = ${vB} × ${t} = ${ben} m.`:`Together they cover the whole gap: (${vA} + ${vB}) × ${t} = ${gap} m.`,`Check: Mia rides ${vA*t} m and Ben ${ben} m; the difference is ${2*m} m.`],{vB,e,m},{suffix:'m'});
  }
  if(form===2||form===3){
   const s=pick(escalators),{k,s1,s2,N}=s;
   const ask=form===2?'How many steps are visible when the escalator is stopped?':'While he walks up, how many steps does the escalator itself carry him?';
   out(`An escalator moves upward at a steady speed. Jun walks up it, taking one step at a time, and counts ${s1} steps. He then runs down the same upward-moving escalator at ${k} times his walking speed and counts ${s2} steps. ${ask}`,form===2?N:N-s1,[`Let N be the visible steps. Going up, Jun’s ${s1} steps plus the escalator’s movement cover N, so the escalator moves N − ${s1} steps.`,`Going down, the escalator works against him: his ${s2} steps cover N plus what the escalator brings up, so it moves ${s2} − N steps.`,`The escalator moves in proportion to time. Running ${k} times as fast, Jun’s ${s2} steps take the time of ${s2}/${k} walking steps.`,`(N − ${s1}) ÷ ${s1} = (${s2} − N) ÷ (${s2}/${k}), which gives N = ${N}.`,form===2?`Answer: ${N} steps.`:`The escalator carries him ${N} − ${s1} = ${N-s1} steps.`,`Check: up ${N-s1}/${s1} and down ${s2-N}/(${s2}/${k}) are equal escalator steps per Jun step.`],{k,s1,s2});
  }
 }
 else if(id==='ch-circles'){
  if(form===0){
   const R=r(6,15),oc=r(Math.ceil(R/3),Math.floor(2*R/3));
   out(`OAB is a quarter circle with centre O and radius ${R} cm. Rectangle OCDE has C on OA, E on OB and D on the arc AB. OC = ${oc} cm. How long is CE?`,R,[`OD joins the centre to the arc, so OD is a radius: ${R} cm.`,`OD and CE are the two diagonals of rectangle OCDE, and a rectangle’s diagonals are equal.`,`CE = ${R} cm. The length OC is not needed.`],{R,oc},{suffix:'cm',figure:{kind:'ch-quadrant',R,oc}});
  }
  if(form===1){
   const [a,b]=pick(hexes),k=a*a+4*a*b+b*b;
   out(`A hexagon is drawn with all six corners on a circle. Going round, its sides are ${a}, ${a}, ${a}, ${b}, ${b}, ${b} cm. Let A be the area of an equilateral triangle with sides 1 cm. The hexagon’s area is k × A. Find k.`,k,[`Each side, with the centre, forms a triangle that depends only on that side’s length. Rearranging the sides round the same circle keeps the area.`,`Arrange them ${a}, ${b}, ${a}, ${b}, ${a}, ${b}. By symmetry every angle is now equal, so each is 120°.`,`Extend the three ${a}-cm sides. They form an equilateral triangle with sides ${b} + ${a} + ${b} = ${a+2*b} cm, with three small equilateral triangles of side ${b} cm at the corners.`,`An equilateral triangle with side s has area s² × A. So the hexagon = ${a+2*b}²A − 3 × ${b}²A = ${(a+2*b)**2}A − ${3*b*b}A.`,`k = ${k}.`],{a,b},{figure:{kind:'ch-hexagon',a,b}});
  }
  if(form===2){
   const n=r(2,5),ratio=2**(n-1);
   out(`A circle is drawn. A square is drawn inside it with all four corners on the circle. A circle is drawn inside that square, touching all four sides. Squares and circles keep alternating like this until there are ${n} circles. How many times larger is the area of the largest circle than the area of the smallest?`,ratio,[`Take one step: a big circle of radius R, its inside square, and the circle inside that square with radius r.`,`The square’s diagonal is a diameter of the big circle, 2R. A square with diagonal 2R has area (2R × 2R) ÷ 2 = 2R².`,`The small circle fits exactly inside the same square, so the square’s side is 2r and its area is 4r². So 4r² = 2R², and R² = 2r².`,`Each step halves the circle’s area. With ${n} circles there are ${n-1} steps.`,`Ratio = 2${n-1>1?'^'+(n-1):''} = ${ratio}.`],{n},{figure:{kind:'ch-nested',n}});
  }
  if(form===3){
   const s=pick([4,6,8,10]),p=s/2;
   out(`A ${s} cm by ${s} cm square is drawn on a grid of 1 cm squares, with corner O at the bottom left. A quarter circle with centre O and radius ${s} cm is drawn inside the square. Two semicircles are also drawn inside the square, one on the left side and one on the bottom side, each with that whole side as its diameter. The shaded region is inside the quarter circle but outside both semicircles. Find its area in terms of π.`,{a:-p*p,b:p*p/2},[`Quarter circle: π × ${s}² ÷ 4 = ${s*s/4}π.`,`Each semicircle has radius ${p}: area π × ${p}² ÷ 2 = ${p*p/2}π. Both together: ${p*p}π.`,`The semicircles overlap in a leaf shape that was subtracted twice. The leaf is two equal pieces, each a quarter circle of radius ${p} minus a right triangle with legs ${p}: ${p*p/4}π − ${p*p/2}.`,`Leaf = ${p*p/2}π − ${p*p}.`,`Shaded = ${s*s/4}π − ${p*p}π + (${p*p/2}π − ${p*p}) = ${p*p/2}π − ${p*p} cm².`],{s},{suffix:'cm²',figure:{kind:'ch-lune',s}});
  }
 }
 else if(id==='ch-angles'){
  if(form===0||form===1){
   const v=rev>=2?pick(angleSets2[form]):angleSets[(form===0?0:1)+2*r(0,1)],ends=v.ends.map(([x,y])=>{const m=x*y===1||x+y>6?1:r(1,2);return [x*m,y*m];});
   const desc=ends.map(([x,y])=>`${x} right and ${y} up`).join('; '),scaled=ends.filter((e,i)=>e[0]!==v.ends[i][0]).map((e,i)=>e);
   const note=scaled.length?[`A segment keeps its angle when both moves are scaled by the same number: ${ends.map((e,i)=>e[0]!==v.ends[i][0]?`${e[0]} right, ${e[1]} up has the same angle as ${v.ends[i][0]} right, ${v.ends[i][1]} up`:'').filter(Boolean).join('; ')}.`]:[];
   out(`On a grid of unit squares, segments start at corner O and go to points that are: ${desc}. Find the sum of the angles that these segments make with the horizontal grid line through O.`,v.sum,[...note,...v.steps],{ends},{suffix:'°',figure:{kind:'ch-grid-angles',ends}});
  }
  if(form===2||form===3){
   let a,b,c,p1,p2;do{a=r(4,9);b=r(4,9);c=r(3,8);p1=r(1,Math.min(a,b)-1);p2=r(1,Math.min(b,c)-1);}while((a===b&&b===c)||b<=p1+p2);
   const area=a*a+b*b+c*c-p1*Math.min(a,b)-p2*Math.min(b,c),W=a+b+c-p1-p2,per=2*W+a+Math.abs(a-b)+Math.abs(b-c)+c;
   const ask=form===2?'Find the total area covered by the three squares.':'Find the perimeter of the outline of the whole figure.';
   out(`Three squares with sides ${a} cm, ${b} cm and ${c} cm stand side by side on one straight line, left to right. The middle square overlaps the left square by ${p1} cm along the line, and the right square overlaps the middle square by ${p2} cm along the line. ${ask}`,form===2?area:per,form===2?[`Separate areas: ${a}² + ${b}² + ${c}² = ${a*a+b*b+c*c} cm².`,`Left and middle overlap in a ${p1} cm wide rectangle as tall as the shorter square, ${Math.min(a,b)} cm: ${p1*Math.min(a,b)} cm².`,`Middle and right overlap: ${p2} × ${Math.min(b,c)} = ${p2*Math.min(b,c)} cm².`,`Each overlap was counted twice, so subtract it once: ${a*a+b*b+c*c} − ${p1*Math.min(a,b)} − ${p2*Math.min(b,c)} = ${area} cm².`]:[`Total width along the line: ${a} + ${b} + ${c} − ${p1} − ${p2} = ${W} cm. The bottom edge and the total of the top edges are each ${W} cm.`,`Visible vertical edges: the left side ${a} cm, the step between the first two squares ${Math.abs(a-b)} cm, the step between the last two ${Math.abs(b-c)} cm, and the right side ${c} cm.`,`Perimeter = 2 × ${W} + ${a} + ${Math.abs(a-b)} + ${Math.abs(b-c)} + ${c} = ${per} cm.`],{a,b,c,p1,p2},{suffix:form===2?'cm²':'cm',figure:{kind:'ch-squares',a,b,c,p1,p2}});
  }
 }
 else if(id==='ch-number'){
  if(form===0||form===1){
   const a=r(1,4),b=r(1,3),p=pick([5,7]),c=r(1,2),N=2**a*3**b*p**c;
   if(form===0)out(`How many positive factors does ${N} have?`,(a+1)*(b+1)*(c+1),[`${N} = 2^${a} × 3^${b} × ${p}^${c}.`,`A factor uses 2 to a power from 0 to ${a} (${a+1} choices), 3 from 0 to ${b} (${b+1} choices) and ${p} from 0 to ${c} (${c+1} choices).`,`Factors = ${a+1} × ${b+1} × ${c+1} = ${(a+1)*(b+1)*(c+1)}.`],{N});
   else if(rev>=2){const c=factorCondition(r,pick);out(`How many factors of ${c.N} are ${c.desc}?`,c.count,c.steps,{N:c.N,cond:c.id});}
   else{const odd=r(0,1)===0;
    out(odd?`How many factors of ${N} are odd?`:`How many factors of ${N} are multiples of ${2*p}?`,odd?(b+1)*(c+1):a*(b+1)*c,odd?[`${N} = 2^${a} × 3^${b} × ${p}^${c}.`,`An odd factor must use 2⁰: only 1 choice for the power of 2.`,`Odd factors = 1 × ${b+1} × ${c+1} = ${(b+1)*(c+1)}.`]:[`${N} = 2^${a} × 3^${b} × ${p}^${c}.`,`A multiple of ${2*p} needs at least one 2 and at least one ${p}: powers of 2 from 1 to ${a} (${a} choices), of ${p} from 1 to ${c} (${c} choices), and of 3 from 0 to ${b} (${b+1} choices).`,`Count = ${a} × ${b+1} × ${c} = ${a*(b+1)*c}.`],{N,odd});}
  }
  if(form===2){
   const D=pick(diffSquareTotals),d1=r(2,Math.min(20,D-2)),d2=D-d1,pairs=squarePairs(D),values=pairs.map(x=>x.n*x.n+d1),sum=values.reduce((s,v)=>s+v,0);
   out(`A whole number A is ${d1} more than a positive square number and ${d2} less than another square number. Find the sum of all possible values of A.`,sum,[`If A = n² + ${d1} = m² − ${d2}, then m² − n² = ${D}, so (m − n)(m + n) = ${D}.`,`Factor pairs of ${D} with both factors even or both odd, and m − n < m + n: ${pairs.map(x=>`${x.x} × ${x.y}`).join(', ')}.`,...pairs.map(x=>`${x.x} × ${x.y}: n = (${x.y} − ${x.x}) ÷ 2 = ${x.n}, m = ${x.m}, A = ${x.n}² + ${d1} = ${x.n*x.n+d1}.`),`Sum = ${values.join(' + ')} = ${sum}.`],{D,d1});
  }
  if(form===3){
   const z=pick(puzzles);
   out(`In the addition ${z.a} + ${z.b} = ${z.c}, each letter stands for a digit, different letters stand for different digits, and no number starts with 0. Find the value of ${z.c}.`,z.value,[z.hint,`Work column by column from the right, writing any carry above the next column.`,`Test the few digits each letter can take; reject any choice that repeats a digit.`,`The only assignment that works gives ${z.check}.`],{puzzle:z.a+'+'+z.b+'='+z.c});
  }
 }
 else if(id==='ch-sequences'){
  if(form===0){
   const a=r(1,3),b=r(-3,4),c=r(1,9),t=n=>a*n*n+b*n+c,terms=[1,2,3,4,5].map(t);
   if(terms.some(x=>x<=0))return make(id,form,seed+7,r,rev);
   const d=terms.slice(1).map((x,i)=>x-terms[i]);
   if(rev>=2){
    const far=r(0,1)===0,n=r(10,20),dn=k=>d[0]+2*a*(k-1),sum=(n-1)*(d[0]+dn(n-1))/2;
    if(!far&&d[0]<1)return make(id,form,seed+7,r,rev);
    if(far)out(`The differences between neighbouring terms of this sequence go up by the same amount each time: ${terms.join(', ')}, … What is the ${n}th term?`,t(n),[`Differences: ${d.join(', ')}. They go up by ${2*a} each time.`,`The difference from term k to term k + 1 is ${d[0]} + ${2*a} × (k − 1). From term 1 to term ${n} there are ${n-1} differences, the last being ${d[0]} + ${2*a} × ${n-2} = ${dn(n-1)}.`,`These differences form an evenly spaced list, so their sum is (${d[0]} + ${dn(n-1)}) × ${n-1} ÷ 2 = ${sum}.`,`Term ${n} = term 1 + all the differences = ${terms[0]} + ${sum} = ${t(n)}.`,`Check with a short case: term 5 = ${terms[0]} + ${d.join(' + ')} = ${terms[4]}.`],{a,b,c,n,ask:'far'});
    else{const more=[];for(let k=6;k<=n;k++)more.push(t(k));out(`The differences between neighbouring terms of this sequence go up by the same amount each time: ${terms.join(', ')}, … Which term of the sequence is equal to ${t(n)}?`,n,[`Differences: ${d.join(', ')}. They go up by ${2*a} each time, so the terms keep increasing and each value appears at most once.`,`Next differences: ${Array.from({length:n-5},(_,i)=>dn(5+i)).join(', ')}.`,`Terms 6 onwards: ${more.join(', ')}.`,`${t(n)} is term ${n}.`],{a,b,c,n,ask:'which'});}
   }
   else out(`What is the next term? ${terms.join(', ')}, …`,t(6),[`Differences: ${d.join(', ')}.`,`The differences increase by ${2*a} each time.`,`Next difference: ${d.at(-1)} + ${2*a} = ${d.at(-1)+2*a}.`,`Next term: ${terms.at(-1)} + ${d.at(-1)+2*a} = ${t(6)}.`],{a,b,c});
  }
  if(form===1){
   const x=r(1,6),y=r(x+1,x+7),s=[x,y];while(s.length<8)s.push(s.at(-1)+s.at(-2));
   out(`Each term after the first two is the sum of the two terms before it: ${s.slice(0,5).join(', ')}, … What is the 8th term?`,s[7],[`Continue adding neighbours: ${s[3]} + ${s[4]} = ${s[5]}.`,`${s[4]} + ${s[5]} = ${s[6]}.`,`${s[5]} + ${s[6]} = ${s[7]}.`,`The 8th term is ${s[7]}.`],{x,y});
  }
  if(form===2){
   const x=r(1,9),y=r(1,9),s=[x,y];while(s.length<7)s.push(s.at(-1)+s.at(-2));
   out(`In a sequence of whole numbers, each term after the first two is the sum of the two terms before it. The 6th term is ${s[5]} and the 7th term is ${s[6]}. What is the 1st term?`,x,[`Work backwards: an earlier term = later term − the term before it.`,`5th = ${s[6]} − ${s[5]} = ${s[4]}.`,`4th = ${s[5]} − ${s[4]} = ${s[3]}; 3rd = ${s[4]} − ${s[3]} = ${s[2]}.`,`2nd = ${s[3]} − ${s[2]} = ${s[1]}; 1st = ${s[2]} − ${s[1]} = ${x}.`,`Check forwards: ${s.join(', ')}.`],{x,y});
  }
  if(form===3){
   const start=r(1,9),d=r(1,3),k=pick([2,3]),s=[start];for(let i=0;i<6;i++)s.push(s.at(-1)+d*k**i);
   const diffs=s.slice(1).map((v,i)=>v-s[i]);
   out(`What is the 7th term? ${s.slice(0,5).join(', ')}, …`,s[6],[`Differences: ${diffs.slice(0,4).join(', ')}.`,`Each difference is ${k} times the one before.`,`Next differences: ${diffs[4]}, ${diffs[5]}.`,`6th term = ${s[4]} + ${diffs[4]} = ${s[5]}; 7th term = ${s[5]} + ${diffs[5]} = ${s[6]}.`],{start,d,k});
  }
 }
 return q;
}

/* ---------- exam-style monochrome figures ---------- */
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const f=x=>Number(x.toFixed(2));
const T=(x,y,t,extra='')=>`<text x="${f(x)}" y="${f(y)}" ${extra}>${esc(t)}</text>`;
function frame(key,alt,body,view='0 0 480 320'){
 return `<svg class="entrance-figure" viewBox="${view}" role="img" aria-labelledby="${key}-title" xmlns="http://www.w3.org/2000/svg"><title id="${key}-title">${esc(alt)}</title><defs><pattern id="${key}" width="6" height="6" patternUnits="userSpaceOnUse"><path d="M-1 1L1 -1M0 6L6 0M5 7L7 5" stroke="#888" stroke-width=".7"/></pattern></defs><g fill="none" stroke="#222" stroke-width="1.6" stroke-linejoin="round">${body}</g><style>.entrance-figure text{fill:#222;stroke:none;font:19px Georgia,serif;text-anchor:middle}</style></svg>`;
}
function diagram(spec,id='figure',help=false){
 const key='ch-'+String(id).replace(/[^a-zA-Z0-9_-]/g,'').slice(0,90),hatch=`url(#${key})`;
 if(spec.kind==='ch-quadrant'){
  const S=230/spec.R,O=[110,280],R=spec.R*S,cx=O[0]+spec.oc*S,dy=Math.sqrt(spec.R**2-spec.oc**2)*S,D=[cx,O[1]-dy];
  let b=`<path d="M${O[0]+R} ${O[1]}A${R} ${R} 0 0 0 ${O[0]} ${O[1]-R}"/>`+`<line x1="${O[0]}" y1="${O[1]}" x2="${O[0]+R}" y2="${O[1]}"/><line x1="${O[0]}" y1="${O[1]}" x2="${O[0]}" y2="${O[1]-R}"/>`;
  b+=`<rect x="${O[0]}" y="${f(D[1])}" width="${f(cx-O[0])}" height="${f(dy)}"/><line x1="${f(cx)}" y1="${O[1]}" x2="${O[0]}" y2="${f(D[1])}"/>`;
  if(help)b+=`<line x1="${O[0]}" y1="${O[1]}" x2="${f(D[0])}" y2="${f(D[1])}" stroke-dasharray="6 4"/>`;
  b+=T(O[0]-14,O[1]+20,'O')+T(O[0]+R+14,O[1]+20,'A')+T(O[0]-16,O[1]-R,'B')+T(cx,O[1]+22,'C')+T(D[0]+14,D[1]-8,'D')+T(O[0]-16,Math.max(D[1]+6,O[1]-R+40),'E')+T((O[0]+cx)/2,O[1]+44,`OC = ${spec.oc} cm`);
  return frame(key,`Quarter circle OAB of radius ${spec.R} cm with rectangle OCDE; D lies on the arc.`,b,'0 0 480 340');
 }
 if(spec.kind==='ch-hexagon'){
  const {a,b}=spec,sides=[a,a,a,b,b,b];
  // Central angles from chord lengths: solve 3θa + 3θb = 2π with chord = 2ρ sin(θ/2).
  let lo=Math.max(a,b)/2+1e-9,hi=1e3;for(let i=0;i<200;i++){const rho=(lo+hi)/2,t=3*2*Math.asin(a/(2*rho))+3*2*Math.asin(b/(2*rho));if(t>2*Math.PI)lo=rho;else hi=rho;}
  const rho=(lo+hi)/2,S=120/rho,c=[240,165];let ang=-Math.PI/2;const pts=[];for(const s of sides){pts.push([c[0]+S*rho*Math.cos(ang),c[1]+S*rho*Math.sin(ang)]);ang+=2*Math.asin(s/(2*rho));}
  let body=`<circle cx="${c[0]}" cy="${c[1]}" r="${f(S*rho)}"/><polygon points="${pts.map(p=>p.map(f).join(',')).join(' ')}" fill="${hatch}"/>`;
  pts.forEach((p,i)=>{const q=pts[(i+1)%6],m=[(p[0]+q[0])/2,(p[1]+q[1])/2],v=[m[0]-c[0],m[1]-c[1]],L=Math.hypot(...v);body+=T(m[0]+v[0]/L*22,m[1]+v[1]/L*22+6,String(sides[i]));});
  return frame(key,`Hexagon with sides ${sides.join(', ')} cm, all corners on a circle.`,body);
 }
 if(spec.kind==='ch-nested'){
  const c=[240,160];let R=140,body='';for(let i=0;i<spec.n;i++){body+=`<circle cx="${c[0]}" cy="${c[1]}" r="${f(R)}" ${i===spec.n-1?`fill="${hatch}"`:''}/>`;if(i<spec.n-1){const s=R*Math.SQRT2;body+=`<rect x="${f(c[0]-s/2)}" y="${f(c[1]-s/2)}" width="${f(s)}" height="${f(s)}"/>`;R=s/2;}}
  return frame(key,`${spec.n} circles alternating with squares, each shape fitting exactly inside the one before.`,body);
 }
 if(spec.kind==='ch-lune'){
  const s=spec.s,S=240/s,O=[120,290],X=v=>O[0]+v*S,Y=v=>O[1]-v*S,p=s/2;
  let grid='';for(let i=0;i<=s;i++)grid+=`<line x1="${f(X(i))}" y1="${f(Y(0))}" x2="${f(X(i))}" y2="${f(Y(s))}" stroke="#bbb" stroke-width=".8"/><line x1="${f(X(0))}" y1="${f(Y(i))}" x2="${f(X(s))}" y2="${f(Y(i))}" stroke="#bbb" stroke-width=".8"/>`;
  const quarter=`M${f(X(0))} ${f(Y(0))}L${f(X(s))} ${f(Y(0))}A${f(s*S)} ${f(s*S)} 0 0 0 ${f(X(0))} ${f(Y(s))}Z`;
  const left=`M${f(X(0))} ${f(Y(0))}A${f(p*S)} ${f(p*S)} 0 0 0 ${f(X(0))} ${f(Y(s))}Z`,bottom=`M${f(X(0))} ${f(Y(0))}A${f(p*S)} ${f(p*S)} 0 0 1 ${f(X(s))} ${f(Y(0))}Z`;
  let body=grid+`<path d="${quarter}" fill="${hatch}" stroke="none"/><path d="${left}" fill="white" stroke="none"/><path d="${bottom}" fill="white" stroke="none"/>`;
  body+=`<rect x="${f(X(0))}" y="${f(Y(s))}" width="${f(s*S)}" height="${f(s*S)}"/><path d="M${f(X(s))} ${f(Y(0))}A${f(s*S)} ${f(s*S)} 0 0 0 ${f(X(0))} ${f(Y(s))}"/><path d="M${f(X(0))} ${f(Y(0))}A${f(p*S)} ${f(p*S)} 0 0 0 ${f(X(0))} ${f(Y(s))}"/><path d="M${f(X(0))} ${f(Y(0))}A${f(p*S)} ${f(p*S)} 0 0 1 ${f(X(s))} ${f(Y(0))}"/>`;
  body+=T(X(0)-14,Y(0)+20,'O')+T(X(s/2),Y(0)+24,`${s} cm`);
  return frame(key,`${s} by ${s} square on a 1 cm grid with a quarter circle centred at O and two semicircles on the left and bottom sides; the region inside the quarter circle and outside both semicircles is shaded.`,body,'0 0 480 330');
 }
 if(spec.kind==='ch-grid-angles'){
  const W=Math.max(...spec.ends.map(e=>e[0])),H=Math.max(...spec.ends.map(e=>e[1])),S=Math.min(380/W,220/H),O=[50,270],X=v=>O[0]+v*S,Y=v=>O[1]-v*S;
  let body='';for(let i=0;i<=W;i++)body+=`<line x1="${f(X(i))}" y1="${f(Y(0))}" x2="${f(X(i))}" y2="${f(Y(H))}" stroke="#bbb" stroke-width=".8"/>`;for(let j=0;j<=H;j++)body+=`<line x1="${f(X(0))}" y1="${f(Y(j))}" x2="${f(X(W))}" y2="${f(Y(j))}" stroke="#bbb" stroke-width=".8"/>`;
  spec.ends.forEach(([x,y],i)=>{body+=`<line x1="${O[0]}" y1="${O[1]}" x2="${f(X(x))}" y2="${f(Y(y))}"/>`;const a=Math.atan2(y,x),rad=34+i*16;body+=`<path d="M${f(O[0]+rad)} ${O[1]}A${rad} ${rad} 0 0 0 ${f(O[0]+rad*Math.cos(a))} ${f(O[1]-rad*Math.sin(a))}" stroke-width="1.2"/>`;});
  body+=T(O[0]-14,O[1]+20,'O');
  return frame(key,`Grid of unit squares with segments from O to ${spec.ends.map(e=>`(${e[0]}, ${e[1]})`).join(', ')}; each angle with the horizontal is marked.`,body);
 }
 if(spec.kind==='ch-squares'){
  const {a,b,c,p1,p2}=spec,W=a+b+c-p1-p2,S=Math.min(420/W,240/Math.max(a,b,c)),base=280,x0=30,xs=[0,a-p1,a-p1+b-p2],sz=[a,b,c];
  let body=`<line x1="10" y1="${base}" x2="470" y2="${base}" stroke="#bbb"/>`;
  sz.forEach((s,i)=>{body+=`<rect x="${f(x0+xs[i]*S)}" y="${f(base-s*S)}" width="${f(s*S)}" height="${f(s*S)}" fill="${hatch}" fill-opacity=".35"/>`;});
  sz.forEach((s,i)=>{let L=xs[i],R=xs[i]+s;if(i>0&&sz[i-1]>s)L=Math.max(L,xs[i-1]+sz[i-1]);if(i<2&&sz[i+1]>s)R=Math.min(R,xs[i+1]);body+=`<text x="${f(x0+(L+R)/2*S)}" y="${f(base-s*S-8)}" style="font-size:15px">${s} cm</text>`;});
  body+=T(x0+(a-p1/2)*S,base+24,`${p1} cm`)+T(x0+(xs[2]+p2/2)*S,base+24,`${p2} cm`);
  return frame(key,`Three squares of sides ${a}, ${b} and ${c} cm on one line with overlaps of ${p1} cm and ${p2} cm along the line.`,body,'0 0 480 310');
 }
 return '';
}
const api={units,make,diagram,leftoverTriples,grazingSets,escalators,puzzles,squarePairs,angleSets,angleSets2,factorConditions,hexes};
root.MochiDSAExtension=api;
if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
