/* Original paper-style transfer questions in existing maths topics.
 * Revision 3 only; source papers are references for skills, not copied content.
 * No learner data, network access or automatic grading of written explanations. */
(function(root){
'use strict';
const topicIds=['relationships','percent','remainders','simultaneous','ratios','rates','motion','area','circles','volume','counting','factors'];
const gcd=(a,b)=>b?gcd(b,a%b):Math.abs(a),frac=(a,b)=>{const g=gcd(a,b);return b/g===1?String(a/g):`${a/g}/${b/g}`;};
const cash=n=>Number.isInteger(n)?String(n):n.toFixed(2);
function random(seed){let n=seed>>>0;return (a,b)=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return a+Math.floor(n/4294967296*(b-a+1));};}
const guidance={
 relationships:'When two arrangements use the same objects, write one relationship for each. Add or subtract the relationships to remove an unknown; check both original arrangements.',
 percent:'For different groups, name each original whole separately. For a voucher and a percentage discount, write down their order: a fixed subtraction does not generally commute with multiplication.',
 remainders:'Use a before-and-after table for transfers. Undo the final transfer first, returning the transferred amount to its source before undoing the earlier fraction. New stock changes the next whole.',
 simultaneous:'Undo a stated replacement before comparing an all-one-type baseline. When three pairwise totals are given, adding them counts every individual quantity twice.',
 ratios:'A fraction in one group is not a fraction of the combined population. Express the counts with separate group sizes. Equal additions preserve the difference, not the total or the ratio.',
 rates:'When a stock keeps growing, one-pump and two-pump emptying rates contain the same growth term. Subtract the net rates to isolate one pump. Adding all three pairwise worker rates counts each worker twice.',
 motion:'Use relative speeds for each gap; gains over the same direction add. For an average-speed problem with a stop, include the stop in total time, even though it adds no distance.',
 area:'Connecting an interior point to all four rectangle corners gives two pairs of opposite triangles. Each opposite pair has half the rectangle area. For intersecting lines, express the same height in two ways before finding areas.',
 circles:'Keep length and area separate: circumference is proportional to radius, but area to its square. For a shaded region, identify whole semicircles and subtract their areas; do not subtract arc lengths.',
 volume:'Rearranging cubes preserves volume but may change the exposed area. A tunnel removes an opening on the outside and adds walls inside. Count every new wall exactly once, including surfaces you cannot see.',
 counting:'A rectangle containing a marked cell needs one boundary on each side of it. For teams, first decide whether order matters, then count all possibilities and subtract the forbidden cases.',
 factors:'A square has an even number of each prime factor. For integer-sided rectangles, a factor pair gives the side lengths; count each pair only once, then apply every stated restriction.'
};
function make(unit,seed){
 if(!topicIds.includes(unit))return null;
 const r=random((seed^0x9e3779b9)>>>0),pick=a=>a[r(0,a.length-1)],variant=r(0,1);let q;
 const out=(key,text,answer,steps,params,hints,extra={})=>q={text,answer,steps,params:{...params,variant},hints,paperStandard:'original-paper-style',structure:`pb3:${unit}:${key}`,prefix:'',suffix:'',figure:null,choices:null,...extra};
 if(unit==='relationships'){
  if(!variant){const shelf=r(45,110),diff=r(9,30),gap1=shelf+diff,gap2=shelf-diff;
   out('swap-height',`Two models stand on a level floor beside a platform. With the taller model on the platform, its top is ${gap1} cm above the shorter model's top. When the models exchange places, the model on the platform is still higher, by ${gap2} cm. What is the height of the platform?`,shelf,
    [`Let h be the platform height and d the difference between the model heights.`,`First arrangement: h + d = ${gap1}. Second arrangement: h − d = ${gap2}.`,`Adding cancels d: 2h = ${gap1+gap2}, so h = ${shelf} cm.`,`Check: the model-height difference is ${diff} cm; both gaps agree.`],{gap1,gap2},['The platform height is unchanged. The models contribute the same height difference with opposite signs.','Write h + d for the first gap and h − d for the second. What happens when you add them?'],{suffix:'cm'});
  }else{const red=r(3,12),first=r(2,5),blueRed=r(2,4),blue=blueRed*red,second=first+blueRed,height=first*red+2*blue;
   out('equal-stacks',`Red blocks all have height ${red} cm. Blue blocks all have the same unknown height. A stack of ${first} red blocks and 2 blue blocks is exactly as tall as a stack of ${second} red blocks and 1 blue block. Blocks are stacked without gaps. How tall is either stack?`,height,
    [`Remove ${first} red blocks and 1 blue block from both stacks.`,`One blue block is as tall as ${second-first} red blocks: ${second-first} × ${red} = ${blue} cm.`,`Either original stack is ${first} × ${red} + 2 × ${blue} = ${height} cm.`,`Check the other stack: ${second} × ${red} + ${blue} = ${height} cm.`],{red,first,second},['Imagine removing the same blocks from both equal stacks.','Cancel all red blocks that occur in both stacks and one blue block. Find a blue block height before the whole stack.'],{suffix:'cm'});
  }
 }else if(unit==='percent'){
  if(!variant){const adults=10*r(6,24),gap=10*r(2,8),children=adults+gap,pa=pick([10,20,30]),pc=pick([10,20,30]),final=(100-pa)*adults/100+(100+pc)*children/100,ac=r(12,24),cc=r(5,11),revenue=adults*ac+children*cc;
   out('two-wholes',`At a museum, adult admission is $${ac} and child admission is $${cc}. On Saturday, ${gap} more children than adults visited. On Sunday, the number of adults was ${pa}% lower and the number of children was ${pc}% higher than on Saturday. There were ${final} visitors on Sunday. How much admission money was collected on Saturday?`,revenue,
    [`Let Saturday's adult count be x; the child count is x + ${gap}.`,`Sunday's total: ${1-pa/100}x + ${1+pc/100}(x + ${gap}) = ${final}.`,`Thus ${(200-pa+pc)/100}x = ${cash(final-(1+pc/100)*gap)}, so x = ${adults}. There were ${children} children.`,`Saturday's money = ${ac} × ${adults} + ${cc} × ${children} = $${revenue}.`,`Check Sunday: ${(100-pa)*adults/100} adults + ${(100+pc)*children/100} children = ${final}.`],{gap,pa,pc,final,ac,cc},['Sunday counts and Saturday prices cannot be multiplied together. First reconstruct Saturday’s two groups.','Use x and x + the stated difference for Saturday. Apply each percentage to its own group.'],{prefix:'$'});
  }else{const price=100*r(3,8),voucher=20*r(2,7),discount=pick([20,25,40]),a=price*(100-discount)/100-voucher,b=(price-voucher)*(100-discount)/100;
   out('order-of-changes',`Two shops sell the same bag at the same original price and offer the same fixed-value voucher and a ${discount}% discount. At Shop A the discount is applied first, then the voucher: the payment is $${cash(a)}. At Shop B the voucher is applied first, then the discount: the payment is $${cash(b)}. What is the original price of the bag?`,price,
    [`Let the voucher value be v. Shop A subtracts the full v after the discount; Shop B effectively subtracts only ${100-discount}% of v.`,`The payment difference, $${cash(b-a)}, is ${discount}% of v. Hence v = ${cash(b-a)} ÷ ${discount/100} = $${voucher}.`,`Before Shop A's voucher, the discounted price was ${cash(a)} + ${voucher} = $${cash(a+voucher)}.`,`Original price = ${cash(a+voucher)} ÷ ${(100-discount)/100} = $${price}.`,`Check Shop B: (${price} − ${voucher}) × ${(100-discount)/100} = $${cash(b)}.`],{discount,a,b},['Does a percentage discount reduce the voucher as well when the voucher is used first?','Compare the two payments to find the percentage of the voucher lost at Shop B.'],{prefix:'$'});
  }
 }else if(unit==='remainders'){
  if(!variant){const a=6*r(3,20),b=6*r(3,18),fB=(b+a/3)/2,fA=2*a/3+fB;
   out('reverse-transfers',`There are counters in jars A and B. First, one third of the counters in A are moved to B. Then half of the counters now in B are moved to A. At the end A has ${fA} counters and B has ${fB}. No counters are added or lost. How many counters were in A at the start?`,a,
    [`Undo the second move first. The half left in B is ${fB}, so ${fB} counters moved from B to A.`,`Just before that move, A contained ${fA} − ${fB} = ${fA-fB}.`,`That was 2/3 of its original amount. Original A = ${fA-fB} ÷ 2 × 3 = ${a}.`,`The total is ${fA+fB}, so original B = ${b}. Check both transfers forwards.`],{fA,fB},['Which move happened last? Undo that one first, not the earlier third.','After half of B was transferred, the transferred half and the half left in B were equal.']);
  }else{const initial=20*r(4,25),added=5*r(2,12),left=(initial*3/4+added)*3/5;
   out('restock-between-sales',`A shop sells one quarter of its notebooks in the morning. A delivery then adds ${added} notebooks. In the afternoon it sells two fifths of the notebooks then available. There are ${left} left at closing. How many notebooks were there before the morning sale?`,initial,
    [`The closing stock is 3/5 of the afternoon's starting stock. That starting stock was ${left} ÷ 3 × 5 = ${left*5/3}.`,`Undo the delivery: ${left*5/3} − ${added} = ${left*5/3-added}.`,`This is 3/4 of the initial stock, so initial stock = ${left*5/3-added} ÷ 3 × 4 = ${initial}.`,`Check: (${initial} × 3/4 + ${added}) × 3/5 = ${left}.`],{added,left},['The afternoon fraction acts on a new whole that includes the delivery.','Recover the stock before the afternoon sale, remove the delivery, then undo the morning sale.']);
  }
 }else if(unit==='simultaneous'){
  if(!variant){const total=r(25,65),high=r(9,total-6),swaps=r(2,7),small=pick([10,20]),large=50,final=(total-high+swaps)*small+(high-swaps)*large;
   out('replacement-before-baseline',`A box originally contains ${total} coins, all either ${small}-cent or 50-cent coins. ${swaps} of the 50-cent coins are replaced, one for one, by ${small}-cent coins. The box now contains $${(final/100).toFixed(2)}. How many 50-cent coins were in the box originally?`,high,
    [`Each replacement reduces the value by ${large-small} cents. Undo all ${swaps}: original value = ${final} + ${swaps*(large-small)} = ${final+swaps*(large-small)} cents.`,`If all ${total} coins had been ${small}-cent coins, the value would be ${total*small} cents.`,`Each original 50-cent coin adds ${large-small} cents beyond that baseline.`,`Original 50-cent coins = (${final+swaps*(large-small)} − ${total*small}) ÷ ${large-small} = ${high}.`,`Check after the swaps: ${high-swaps} large coins and ${total-high+swaps} small coins give ${final} cents.`],{total,swaps,small,final},['The coin count stays fixed, but the stated value is after the replacements.','Undo the value change first. Then compare with a box containing only the smaller coins.']);
  }else{const a=r(7,25),b=r(9,29),c=r(6,24),ab=a+b,bc=b+c,ca=c+a;
   out('three-pair-totals',`Three crates A, B and C have masses recorded in pairs: A and B together are ${ab} kg; B and C together are ${bc} kg; C and A together are ${ca} kg. What is the mass of A and B together with two copies of crate C? Each copy has the same mass as C.`,a+b+2*c,
    [`Add the three readings: ${ab} + ${bc} + ${ca} = ${ab+bc+ca} kg. Each crate is counted twice.`,`A + B + C = ${(ab+bc+ca)/2} kg.`,`C = ${(ab+bc+ca)/2} − ${ab} = ${c} kg.`,`A + B + 2C = ${ab} + 2 × ${c} = ${a+b+2*c} kg.`,`Alternative: (B + C) + (C + A) = ${bc} + ${ca}; the same requested total appears directly.`],{ab,bc,ca},['Name precisely which total is requested; not every crate is counted once.','Write the pair totals as A+B, B+C and C+A. Can two readings be combined directly?'],{suffix:'kg'});
  }
 }else if(unit==='ratios'){
  if(!variant){const A=5*r(5,24),B=4*r(5,28),yes=2*A/5+3*B/4,no=A+B-yes,g=gcd(yes,no),p=yes/g,q=no/g;
   out('weighted-groups',`A school has ${A} pupils in Group A and an unknown number in Group B. Two fifths of Group A and three quarters of Group B attend an art club. Across the two groups together, the ratio of club members to non-members is ${p}:${q}. How many pupils are in Group B?`,B,
    [`In Group A, ${2*A/5} attend and ${3*A/5} do not. Let Group B have 4x pupils: 3x attend and x do not.`,`The overall ratio means ${q}(${2*A/5} + 3x) = ${p}(${3*A/5} + x).`,`So ${3*q-p}x = ${p*3*A/5-q*2*A/5}, giving x = ${B/4}.`,`Group B has 4 × ${B/4} = ${B} pupils.`,`Check the combined counts: ${yes} members and ${no} non-members simplify to ${p}:${q}.`],{A,p,q},['The two fractions refer to two different groups. Do not average them.','Represent Group B as 4x pupils. List members and non-members in each group before combining.']);
  }else{const a=r(2,5),b=a+r(1,4),k=r(1,4),unitSize=r(6,25),added=k*unitSize,g1=gcd(a,b),g2=gcd(a+k,b+k);
   out('equal-additions',`Red and blue counters are initially in the ratio ${a/g1}:${b/g1}. Then ${added} red counters and ${added} blue counters are added. The ratio becomes ${(a+k)/g2}:${(b+k)/g2}. How many blue counters were there initially?`,b*unitSize,
    [`Equal additions leave the difference between the blue and red counts unchanged.`,`Let original amounts be ${a/g1}x and ${b/g1}x. The later ratio gives ${(b+k)/g2}(${a/g1}x + ${added}) = ${(a+k)/g2}(${b/g1}x + ${added}).`,`Solve this balanced relationship: x = ${g1*unitSize}.`,`Original blue count = ${b/g1} × ${g1*unitSize} = ${b*unitSize}.`,`Check the new counts: ${(a+k)*unitSize}:${(b+k)*unitSize} has the required ratio.`],{a:a/g1,b:b/g1,c:(a+k)/g2,d:(b+k)/g2,added},['Both groups increase by the same number. Which difference stays unchanged?','Ratio parts from the two stages may have different sizes. Write counts, not just differences of ratio numbers.']);
  }
 }else if(unit==='rates'){
  if(!variant){const pump=r(3,9),inflow=r(1,pump-1),net1=pump-inflow,net2=2*pump-inflow,net3=3*pump-inflow,stock=(net1*net2/gcd(net1,net2))*net3/gcd(net1*net2/gcd(net1,net2),net3)*r(1,3),t1=stock/net1,t2=stock/net2,t3=stock/net3;
   out('unknown-inflow',`Water enters a tank at a constant rate. Starting with the same amount of water each time, one pump empties it in ${t1} minutes, while two identical pumps working together empty it in ${t2} minutes. The water keeps entering during both trials. How many minutes would three identical pumps take, with the same starting amount and continuing inflow?`,t3,
    [`Use one starting tankful as a work unit. One pump's net removal rate is 1/${t1}; two pumps' net removal rate is 1/${t2}.`,`Their difference is one pump's removal rate: 1/${t2} − 1/${t1} = ${frac(t1-t2,t1*t2)} tankful per minute.`,`Three pumps' net rate is the two-pump net rate plus one pump: 2/${t2} − 1/${t1} = 1/${t3}.`,`So the time is ${t3} minutes. The inflow is subtracted once, not once per pump.`],{t1,t2},['The observed emptying rates are net rates: pump removal minus incoming water.','Compare two pumps with one. The inflow cancels when you subtract those two net rates.'],{suffix:'minutes'});
  }else{const a=r(2,7),b=r(3,9),c=r(2,8),t=r(2,5),later=r(3,10),ab=a+b,bc=b+c,ca=c+a,target=(a+b+c)*t+(b+c)*later;
   out('pair-rates-then-leave',`At constant independent rates, workers A and B together label ${ab} parcels per minute, B and C together label ${bc}, and C and A together label ${ca}. All three start on a batch of ${target} parcels. After ${t} minutes, A stops and B and C finish it. How many minutes altogether does the batch take?`,t+later,
    [`Add the pair rates and halve: (${ab} + ${bc} + ${ca}) ÷ 2 = ${a+b+c} parcels/minute for all three.`,`First ${t} minutes: ${(a+b+c)*t} parcels. Remaining: ${target} − ${(a+b+c)*t} = ${(b+c)*later}.`,`B and C work at ${bc} parcels/minute, so the remaining work takes ${later} minutes.`,`Total time = ${t} + ${later} = ${t+later} minutes.`],{ab,bc,ca,t,target},['Adding the three pair rates counts every worker twice.','Find work completed before A stops, then use the B-and-C rate for the remainder.'],{suffix:'minutes'});
  }
 }else if(unit==='motion'){
  if(!variant){const t1=r(4,12),t2=r(4,12),v1=r(5,15),v2=r(5,15),gap1=v1*t1,gap2=v2*t2;
   out('three-runner-gaps',`Three runners A, B and C move in the same direction along a straight track at constant speeds, with C fastest and A slowest. Initially B is ${gap1} m ahead of C, and A is ${gap2} m ahead of B. From these starting positions C catches B in ${t1} minutes, while B catches A in ${t2} minutes. How many minutes after the start does C catch A? Give an exact fraction if necessary.`,(gap1+gap2)/(v1+v2),
    [`C gains on B at ${gap1} ÷ ${t1} = ${v1} m/min.`,`B gains on A at ${gap2} ÷ ${t2} = ${v2} m/min.`,`C therefore gains on A at ${v1+v2} m/min; their original gap is ${gap1+gap2} m.`,`Time = ${gap1+gap2} ÷ ${v1+v2} = ${frac(gap1+gap2,v1+v2)} minutes. Do not add the two catch-up times.`],{t1,t2,gap1,gap2},['C catches A by closing the whole starting gap. Find relative speeds, not the runners’ absolute speeds.','C’s gain over A equals its gain over B plus B’s gain over A.'],{suffix:'minutes',answerLabel:frac(gap1+gap2,v1+v2),figure:{kind:'pb-road',gap1,gap2}});
  }else{const a=r(5,12),stop=5*r(2,8),u=2*a,v=3*a,average=2*a,distance=a*stop/5;
   out('average-with-stop-inverse',`A cyclist rides to a park at ${u} km/h, rests there for ${stop} minutes, and returns along the same route at ${v} km/h. Her average speed for the entire outing, including the rest, is ${average} km/h. What total distance did she cycle?`,distance,
    [`Let the total distance be D km. Each riding leg is D/2 km.`,`Total time = D/${2*u} + D/${2*v} + ${frac(stop,60)} hours. It also equals D/${average}.`,`Subtract the riding time from D/${average}: D/${12*a} = ${frac(stop,60)}.`,`Thus D = ${12*a} × ${frac(stop,60)} = ${distance} km.`,`Check: two legs of ${distance/2} km plus the ${stop}-minute rest give the stated average.`],{u,v,stop,average},['Average speed includes all the time, even the rest, which adds no distance.','Let D be the whole distance, so each riding leg is D/2. Express total time in two ways.'],{suffix:'km'});
  }
 }else if(unit==='area'){
  if(!variant){const k=r(1,4),scale=r(2,25),total=4*(k+1)*(2*k+1)*scale,answer=(3*k+1)*scale;
   out('intersecting-lines',`ABCD is a rectangle of area ${total} cm². E lies on AB with AE:EB = 1:${k}, and F is the midpoint of AD. DE and BF meet at O. Find the shaded area AEOF. The drawing is not to scale.`,answer,
    [`Let the rectangle's width be w and height h. Let O be x widths to the right of AD and y heights below AB.`,`Along BF, y = (1 − x)/2. Along DE, y = 1 − ${k+1}x. These describe the same O.`,`Equating the heights gives x = 1/${2*k+1}, and y = ${k}/${2*k+1}.`,`Triangle ABF is one quarter of the rectangle: ${total/4} cm². Triangle EBO has base ${k}/${k+1} of the width and height ${k}/${2*k+1} of the height.`,`EBO area = 1/2 × ${k}/${k+1} × ${k}/${2*k+1} × ${total} = ${total/4-answer} cm².`,`AEOF = ABF − EBO = ${total/4} − ${total/4-answer} = ${answer} cm². This uses proportional distances, not measurements from the drawing.`],{k,total},['AEOF is the large triangle ABF with triangle EBO removed. Their heights are not equal.','Describe O’s height using each of the two straight lines that pass through O. Fractions of the rectangle’s width and height can help.'],{suffix:'cm²',figure:{kind:'pb-cevians',k}});
  }else{const w=4*r(3,9),h=4*r(3,8),x=r(1,3)/4,y=r(1,3)/4,top=w*h*y/2,right=w*h*(1-x)/2,bottom=w*h*(1-y)/2,left=w*h*x/2;
   out('opposite-triangles',`O is a point inside rectangle ABCD and is joined to all four corners. Triangle AOB has area ${top} cm², BOC has area ${right} cm², and COD has area ${bottom} cm². What is the shaded area DOA? The drawing is not to scale.`,left,
    [`AOB and COD use opposite sides of the rectangle as bases. Their heights add to the rectangle's full height.`,`Their combined area is half the rectangle: ${top} + ${bottom} = ${top+bottom} cm².`,`BOC and DOA likewise add to half the rectangle.`,`DOA = ${top+bottom} − ${right} = ${left} cm². Check: all four triangle areas sum to ${w*h} cm².`],{top,right,bottom},['Pair triangles on opposite sides, not adjacent sides.','The two heights of triangles with top and bottom bases add to one full rectangle height.'],{suffix:'cm²',figure:{kind:'pb-fan',x,y,top,right,bottom}});
  }
 }else if(unit==='circles'){
  if(!variant){const radius=r(2,20),k=r(2,5),gap=2*radius*(k-1),answer=(k*k-1)*radius*radius;
   out('circumference-to-area',`Two circles have the same centre. The larger radius is ${k} times the smaller radius. The larger circumference exceeds the smaller circumference by ${gap}π cm. Find the area between the circles, in terms of π.`,{a:0,b:answer},
    [`Let the smaller radius be r cm. The circumferences are 2πr and 2π × ${k}r.`,`Their difference is ${2*(k-1)}πr = ${gap}π, so r = ${radius} cm.`,`The radii are ${radius} and ${k*radius} cm. Subtract their areas, not their circumferences.`,`Area between them = (${k*radius}² − ${radius}²)π = ${answer}π cm².`],{k,gap},['The given difference is a length, but the question asks for an area. Find the radii first.','Call the small radius r. Write both circumferences using that same r.'],{suffix:'cm²',answerLabel:`${answer}π`,figure:{kind:'pb-ring',k}});
  }else{const a=2*r(3,15),b=2*r(2,14),answer=a*b/4;
   out('semicircle-subtraction',`A, B and C lie on a straight line with AB = ${a} cm and BC = ${b} cm. A semicircle is drawn on AC as diameter. Two smaller semicircles, on AB and BC as diameters, lie inside it on the same side of the line. Find the shaded area inside the large semicircle but outside both smaller ones, in terms of π.`,{a:0,b:answer},
    [`The large diameter is ${a+b} cm. The radii of the large and two small semicircles are ${(a+b)/2}, ${a/2} and ${b/2} cm.`,`Shaded area = 1/2 × [${(a+b)/2}² − ${a/2}² − ${b/2}²]π.`,`This is 1/2 × [${(a+b)**2/4} − ${a*a/4} − ${b*b/4}]π = ${answer}π cm².`,`The smaller semicircles touch at B but do not overlap; subtract each exactly once.`],{a,b},['Identify the three diameters before writing any areas.','A semicircle has half a circle’s area, and its radius is half its diameter.'],{suffix:'cm²',answerLabel:`${answer}π`,figure:{kind:'pb-arbelos',a,b}});
  }
 }else if(unit==='volume'){
  if(!variant){const e=r(1,6),side=2*r(1,3)+1,L=side*e,arm=(L-e)/2,inside=24*e*arm,answer=6*L*L-6*e*e+inside;
   out('three-tunnels',`A solid cube has edge ${L} cm. Three straight square tunnels, each ${e} cm by ${e} cm, pass through its centre: left to right, front to back, and top to bottom. Each opening is centred on its face and its sides are parallel to cube edges. Find the total exposed surface area after drilling, including the tunnel walls.`,answer,
    [`The three tunnels meet in a central empty cube of edge ${e} cm. Each of the six arms outside this crossing has length (${L} − ${e}) ÷ 2 = ${arm} cm.`,`Original outside area = 6 × ${L}² = ${6*L*L} cm². The six openings remove 6 × ${e}² = ${6*e*e} cm².`,`Each arm has four rectangular walls, each ${e} cm by ${arm} cm. The six arms therefore add 6 × 4 × ${e} × ${arm} = ${inside} cm².`,`There is no wall across the open central crossing. Nor is the opening a surface to cover.`,`Total = ${6*L*L} − ${6*e*e} + ${inside} = ${answer} cm².`],{e,L},['Count removed outside openings and newly exposed inside walls separately.','Locate the empty central crossing. Each tunnel arm runs from an outside opening to that crossing and has four side walls.'],{suffix:'cm²',figure:{kind:'pb-tunnels',e,L}});
  }else{const a=r(2,4),b=r(2,4),c=r(1,3),e=r(1,4),N=a*b*c,old=(4*N+2)*e*e,neo=2*(a*b+a*c+b*c)*e*e;
   out('rearrange-surface',`${N} identical cubes, each of edge ${e} cm, are first joined in one straight row. They are then rearranged into a solid cuboid ${a} cubes long, ${b} cubes wide and ${c} cubes high, with no gaps. By how many square centimetres does the total exposed surface area decrease?`,old-neo,
    [`The straight row has dimensions ${N*e} × ${e} × ${e} cm. Its surface area is 2(${N*e*e} + ${N*e*e} + ${e*e}) = ${old} cm².`,`The new cuboid measures ${a*e} × ${b*e} × ${c*e} cm.`,`Its surface area is 2(${a*b*e*e} + ${a*c*e*e} + ${b*c*e*e}) = ${neo} cm².`,`Decrease = ${old} − ${neo} = ${old-neo} cm². The volume stays ${N*e**3} cm³: no cubes were lost.`],{a,b,c,e,N},['Both arrangements use the same cubes. Equal volume does not mean equal outside area.','Find the three dimensions of each complete solid. Compare the areas of their six outer faces.'],{suffix:'cm²'});
  }
 }else if(unit==='counting'){
  if(!variant){const cols=r(3,7),rows=r(3,6),col=r(1,cols-2),row=r(1,rows-2),answer=(col+1)*(cols-col)*(row+1)*(rows-row);
   out('contain-a-cell',`The grid has ${cols} columns and ${rows} rows. The marked cell is in column ${col+1} from the left and row ${row+1} from the top. How many rectangles, including squares, have boundaries on grid lines and contain this entire marked cell?`,answer,
    [`A left boundary has ${col+1} choices on or left of the cell's left edge, and a right boundary has ${cols-col} choices on or right of its right edge.`,`A top boundary has ${row+1} choices; a bottom boundary has ${rows-row} choices.`,`Each set of four choices fixes exactly one rectangle.`,`Count = ${col+1} × ${cols-col} × ${row+1} × ${rows-row} = ${answer}. Boundaries must not pass through the cell.`],{cols,rows,col,row},['Not all rectangles in the grid contain the marked cell. Place one boundary on each side of it.','Count the allowed left, right, top and bottom boundary choices independently.'],{figure:{kind:'pb-grid',cols,rows,col,row}});
  }else{const a=r(5,10),b=r(4,9),pairs=a*(a-1)/2,answer=pairs*b-(a-1);
   out('unordered-pairs-with-exclusion',`A team must contain two pupils from a club of ${a} pupils and one pupil from a different club of ${b} pupils. No pupil belongs to both clubs. One particular pupil in the first club must not be on the same team as one particular pupil in the second club. How many different teams are possible? The order of names on a team does not matter.`,answer,
    [`The first club gives ${a} × ${a-1} ÷ 2 = ${pairs} unordered pairs.`,`Without the restriction there are ${pairs} × ${b} = ${pairs*b} teams.`,`For a forbidden team, the two particular pupils are fixed. The other first-club pupil has ${a-1} choices.`,`Valid teams = ${pairs*b} − ${a-1} = ${answer}. No forbidden team has been subtracted twice.`],{a,b},['Choosing two pupils from the same club is an unordered pair, not two distinct roles.','Count all teams, then count those containing both forbidden pupils.']);
  }
 }else if(unit==='factors'){
  if(!variant){const a=pick([1,3,5]),b=r(1,4),c=r(0,2),N=2**a*3**b*5**c,multiplier=2*3**(b%2)*5**(c%2);
   out('complete-prime-pairs',`What is the smallest positive whole number that ${N} must be multiplied by to make a perfect square?`,multiplier,
    [`Prime factorisation: ${N} = 2^${a} × 3^${b} × 5^${c}. A zero exponent means that prime is absent.`,`In a square, every prime exponent is even because its factors can be paired.`,`Supply one factor of each prime with an odd exponent: ${[2,...(b%2?[3]:[]),...(c%2?[5]:[])].join(' × ')} = ${multiplier}.`,`No smaller positive multiplier can supply all the missing prime factors. Check: ${N} × ${multiplier} = ${N*multiplier} = ${Math.round(Math.sqrt(N*multiplier))}².`],{N},['Think about prime-factor pairs, not the next square above the starting number.','Multiplying by a square adds even exponents. Which prime exponents are currently odd?']);
  }else{const N=2**r(2,5)*3**r(1,3)*5**r(0,2),p=pick([3,5]),minimum=r(2,5),pairs=[];for(let breadth=minimum;breadth*breadth<=N;breadth++)if(N%breadth===0&&(N/breadth)%p===0)pairs.push([breadth,N/breadth]);
   out('restricted-factor-pairs',`A rectangle has area ${N} cm² and both side lengths are whole numbers of centimetres. Its length is at least its breadth, its breadth is at least ${minimum} cm, and its length is a multiple of ${p}. How many different pairs of side lengths are possible? Rotating a rectangle does not create a new pair.`,pairs.length,
    [`List factor pairs b × l = ${N}, with b no greater than l. It is enough to try b up to √${N}.`,`Keep only breadths b ≥ ${minimum} and lengths l divisible by ${p}.`,`The valid (breadth, length) pairs are ${pairs.length?pairs.map(x=>'('+x.join(', ')+')').join('; '):'none'}.`,`There are ${pairs.length} pairs. The order restriction prevents counting a rotation again.`],{N,p,minimum},['Each rectangle corresponds to a factor pair of the area.','Keep the shorter side first. Check the breadth minimum and length divisibility separately.']);
  }
 }
 if(!q)throw Error('Unimplemented paper-practice topic');
 q.answerLabel??=String(q.answer);q.diagnostic=diagnostic(q);return q;
}
const checks={
 "swap-height": [
  "How can the two gaps isolate the platform height?",
  "Add the gaps, then halve.",
  "Subtract the gaps to get the platform height.",
  "Use the larger gap by itself."
 ],
 "equal-stacks": [
  "What can be removed without changing the equality of the stacks?",
  "The same blocks from both stacks.",
  "All blue blocks from only one stack.",
  "One centimetre from only the taller-looking stack."
 ],
 "two-wholes": [
  "Which counts must you find before computing Saturday’s takings?",
  "Saturday adults and Saturday children separately.",
  "Sunday’s total only.",
  "The average of the two percentage changes."
 ],
 "order-of-changes": [
  "What changes when the voucher is subtracted before a percentage discount?",
  "The discount also acts on the amount subtracted by the voucher.",
  "The voucher is used twice.",
  "The order never changes the payment."
 ],
 "reverse-transfers": [
  "Which transfer should you undo first?",
  "The final half-of-B transfer.",
  "The initial third-of-A transfer.",
  "Both, using their fractions of the original total."
 ],
 "restock-between-sales": [
  "The afternoon fraction applies to which whole?",
  "The stock after the delivery.",
  "Only the initial stock.",
  "Only the delivered notebooks."
 ],
 "replacement-before-baseline": [
  "What does replacing a large coin by a small coin change?",
  "Total value, but not the number of coins.",
  "The number of coins, but not total value.",
  "Neither number nor value."
 ],
 "three-pair-totals": [
  "Adding the masses A+B, B+C and C+A counts each crate how many times?",
  "Twice.",
  "Once.",
  "Three times."
 ],
 "weighted-groups": [
  "Can the fractions of two groups be averaged without knowing the group sizes?",
  "No; the groups may have different numbers of pupils.",
  "Yes; two fractions always have an equally weighted average.",
  "Yes; denominators can simply be added."
 ],
 "equal-additions": [
  "Adding the same number to each group keeps what unchanged?",
  "The difference between the group counts.",
  "The ratio between the group counts.",
  "The total number of counters."
 ],
 "unknown-inflow": [
  "What remains when you subtract the one-pump net rate from the two-pump net rate?",
  "One pump’s removal rate; the common inflow cancels.",
  "The inflow rate alone.",
  "Two pump rates plus two inflows."
 ],
 "pair-rates-then-leave": [
  "The sum of all three pair rates is what multiple of the three-worker rate?",
  "Two.",
  "One.",
  "Three."
 ],
 "three-runner-gaps": [
  "How are the same-direction gains C over B and B over A related?",
  "They add to C’s gain over A.",
  "Their catch-up times add instead.",
  "Only the initial gaps determine the gain per minute."
 ],
 "average-with-stop-inverse": [
  "Which time belongs in the outing’s average speed?",
  "Both riding times and the rest.",
  "The riding time only.",
  "Half of the rest because there are two legs."
 ],
 "intersecting-lines": [
  "Why describe O using both DE and BF?",
  "O lies on both, so both descriptions must give the same position.",
  "All intersecting lines bisect each other.",
  "O must be at the rectangle’s centre."
 ],
 "opposite-triangles": [
  "For two triangles based on opposite rectangle sides, their perpendicular heights add to what?",
  "The full separation of those sides.",
  "Twice the rectangle’s diagonal.",
  "An unknown length unrelated to the rectangle."
 ],
 "circumference-to-area": [
  "Multiplying a radius by k multiplies its circle area by what?",
  "k squared.",
  "k.",
  "2k."
 ],
 "semicircle-subtraction": [
  "Which expression describes the shaded region?",
  "The large semicircle area minus both smaller semicircle areas.",
  "The large arc length minus two radii.",
  "The sum of all three semicircle areas."
 ],
 "three-tunnels": [
  "Which surfaces belong in the area after drilling?",
  "The remaining outside faces plus the inside tunnel walls.",
  "Only the outside faces visible in the drawing.",
  "The empty square openings themselves."
 ],
 "rearrange-surface": [
  "What definitely stays the same when all cubes are rearranged without gaps?",
  "Total volume.",
  "Total exposed surface area.",
  "The number of hidden joins."
 ],
 "contain-a-cell": [
  "A rectangle containing the whole marked cell needs its four boundaries where?",
  "On or outside each corresponding edge of the cell.",
  "All four boundaries through the cell’s centre.",
  "Anywhere, even if the marked cell is outside."
 ],
 "unordered-pairs-with-exclusion": [
  "Choosing pupils A and B in either order gives how many teams when the third pupil is fixed?",
  "One team.",
  "Two teams.",
  "It depends on which name is written first."
 ],
 "complete-prime-pairs": [
  "What is true of each prime exponent in a perfect square?",
  "It is even, including zero.",
  "It is odd.",
  "It must equal two."
 ],
 "restricted-factor-pairs": [
  "Why list only a breadth no greater than the length?",
  "To avoid counting a rectangle and its rotation twice.",
  "To remove all square rectangles.",
  "To make the length equal the area."
 ]
};
function diagnostic(q){const c=checks[q.structure.split(':').at(-1)],shift=(q.params.variant+q.text.length)%3,choices=c.slice(1);return {prompt:c[0],choices:choices.slice(shift).concat(choices.slice(0,shift)),correct:(3-shift)%3,explain:q.hints[0]};}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const n=x=>Math.round(x*1000)/1000;
const poly=(pts,attrs='')=>`<polygon points="${pts.map(p=>p.map(n).join(',')).join(' ')}" ${attrs}/>`;
const line=(x,y,X,Y,attrs='')=>`<line x1="${n(x)}" y1="${n(y)}" x2="${n(X)}" y2="${n(Y)}" ${attrs}/>`;
const text=(x,y,s)=>`<text x="${n(x)}" y="${n(y)}">${esc(s)}</text>`;
function diagram(s,id='paper-practice'){
 if(!s?.kind?.startsWith('pb-'))return '';
 const key='pb-'+String(id).replace(/[^a-zA-Z0-9_-]/g,'').slice(0,90),shade=`fill="url(#${key})"`;let out='',alt='Use the given information, not screen measurements.';
 if(s.kind==='pb-road'){
  alt=`C, B and A in that order along a straight track. C to B is ${s.gap1} m, B to A is ${s.gap2} m. All runners move to the right.`;
  out=line(60,135,420,135)+text(60,110,'C')+text(225,110,'B')+text(410,110,'A')+text(140,165,`${s.gap1} m`)+text(323,165,`${s.gap2} m`)+text(240,220,'All run in this direction →');
 }else if(s.kind==='pb-grid'){
  const x=90,y=45,w=300,h=200;alt=`${s.cols} columns and ${s.rows} rows. Marked cell column ${s.col+1}, row ${s.row+1}.`;
  out=`<rect x="${n(x+s.col*w/s.cols)}" y="${n(y+s.row*h/s.rows)}" width="${n(w/s.cols)}" height="${n(h/s.rows)}" ${shade}/>`;
  for(let i=0;i<=s.cols;i++)out+=line(x+i*w/s.cols,y,x+i*w/s.cols,y+h);
  for(let i=0;i<=s.rows;i++)out+=line(x,y+i*h/s.rows,x+w,y+i*h/s.rows);
 }else if(s.kind==='pb-fan'){
  const A=[75,50],B=[405,50],C=[405,245],D=[75,245],O=[75+330*s.x,50+195*s.y];alt='An interior point O is joined to all rectangle corners. DOA is shaded.';
  out=poly([A,B,C,D])+poly([D,O,A],shade)+[A,B,C,D].map(p=>line(...p,...O)).join('');
  [[A,'A',-14,-8],[B,'B',14,-8],[C,'C',14,23],[D,'D',-14,23],[O,'O',13,0]].forEach(([p,t,dx,dy])=>out+=text(p[0]+dx,p[1]+dy,t));
  out+=text((A[0]+B[0]+O[0])/3,(A[1]+B[1]+O[1])/3+5,s.top)+text((B[0]+C[0]+O[0])/3,(B[1]+C[1]+O[1])/3+5,s.right)+text((C[0]+D[0]+O[0])/3,(C[1]+D[1]+O[1])/3+5,s.bottom)+text(240,293,'Areas are in cm²');
 }else if(s.kind==='pb-cevians'){
  const A=[75,50],B=[405,50],C=[405,245],D=[75,245],E=[75+330/(s.k+1),50],F=[75,147.5],O=[75+330/(2*s.k+1),50+195*s.k/(2*s.k+1)];
  alt=`Rectangle ABCD, E on AB with AE to EB 1:${s.k}; F halfway along AD. DE and BF meet at O. AEOF is shaded.`;
  out=poly([A,B,C,D])+poly([A,E,O,F],shade)+line(...D,...E)+line(...B,...F);
  [[A,'A',-14,-10],[B,'B',14,-10],[C,'C',14,23],[D,'D',-14,23],[E,'E',0,-10],[F,'F',-14,5],[O,'O',17,16]].forEach(([p,t,dx,dy])=>out+=text(p[0]+dx,p[1]+dy,t));
 }else if(s.kind==='pb-ring'){
  alt=`Two concentric circles, with radii r and ${s.k}r. The region between them is shaded.`;
  out=`<circle cx="240" cy="145" r="100" ${shade}/><circle cx="240" cy="145" r="${n(100/s.k)}" fill="white"/>`+line(240,145,340,145)+line(240,145,240,145-100/s.k)+text(226,150-50/s.k,'r')+text(307,134,s.k+'r');
 }else if(s.kind==='pb-arbelos'){
  const x=65,y=225,W=350,a=W*s.a/(s.a+s.b),b=W-a,R=W/2;alt=`Semicircle on AC outside two smaller semicircles. AB=${s.a} cm; BC=${s.b} cm. The space between arcs is shaded.`;
  out=`<path d="M${x} ${y} A${R} ${R} 0 0 1 ${x+W} ${y} Z" ${shade}/>`;
  out+=`<path d="M${x} ${y} A${n(a/2)} ${n(a/2)} 0 0 1 ${n(x+a)} ${y} Z" fill="white"/><path d="M${n(x+a)} ${y} A${n(b/2)} ${n(b/2)} 0 0 1 ${x+W} ${y} Z" fill="white"/>`;
  out+=text(x,y+23,'A')+text(x+a,y+23,'B')+text(x+W,y+23,'C')+text(x+a/2,y+50,s.a+' cm')+text(x+a+b/2,y+50,s.b+' cm');
 }else if(s.kind==='pb-tunnels'){
  const A=[120,95],B=[300,95],C=[300,255],D=[120,255],dx=65,dy=-55,top=[[120,95],[300,95],[365,40],[185,40]],right=[[300,95],[365,40],[365,200],[300,255]];
  const lo=(1-s.e/s.L)/2,hi=1-lo;
  const hole=(p,u,v)=>poly([[lo,lo],[hi,lo],[hi,hi],[lo,hi]].map(([a,b])=>[p[0]+a*u[0]+b*v[0],p[1]+a*u[1]+b*v[1]]),'fill="#ddd"');
  alt=`Cube edge ${s.L} cm with three perpendicular central square tunnels, each ${s.e} cm wide. Openings shown on the front, top and right faces; matching openings lie on the opposite faces.`;
  out=poly(top,'fill="#fafafa"')+poly(right,'fill="#f3f3f3"')+poly([A,B,C,D],'fill="white"')+hole(A,[180,0],[0,160])+hole(A,[180,0],[dx,dy])+hole(B,[dx,dy],[0,160])+text(210,284,'Cube edge '+s.L+' cm')+text(240,20,'Each tunnel: '+s.e+' cm × '+s.e+' cm');
 }
 return `<svg class="ep-figure" viewBox="0 0 480 315" role="img" aria-labelledby="${key}-title"><title id="${key}-title">${esc(alt)}</title><defs><pattern id="${key}" width="7" height="7" patternUnits="userSpaceOnUse"><path d="M-1 1L1-1M0 7L7 0M6 8L8 6" stroke="#aaa" stroke-width="1"/></pattern></defs><g fill="none" stroke="#333" stroke-width="1.8" stroke-linejoin="round">${out.replace(/<text /g,'<text fill="#222" stroke="none" font-family="system-ui, sans-serif" font-size="16" text-anchor="middle" ')}</g></svg>`;
}
function extensionRecommendation(E,d,normal,now){
 // Only substitute for choosing an unstarted lesson, never saved work, repair or review.
 if(normal.kind!=='learn'||normal.repair||normal.geometryBridge||E.evidence(d,normal.unit,now).taught)return normal;
 const ready=id=>{const e=E.evidence(d,id,now);return e.taught&&e.apply>=2&&e.transfer>=1&&!e.needsTeaching&&!e.parked;};
 // One extension lesson per local day, not an entire streak of hard tasks.
 const day=E.dayKey(now);if(E.D.units.some(u=>u.extension&&d.lessons[u.id]?.lastViewedAt&&E.dayKey(d.lessons[u.id].lastViewedAt)===day))return normal;
 const u=E.D.units.find(u=>u.extension&&u.prerequisites.length&&u.prerequisites.every(ready)&&!E.evidence(d,u.id,now).taught);
 return u?{kind:'learn',unit:u.id,paperExtension:true,reason:'Your foundations for this challenge are ready. Learn how to connect them in an unfamiliar problem.'}:normal;
}
function report(E,d,now=Date.now()){
 return topicIds.map(id=>{const a=d.attempts.filter(a=>a.unit===id&&a.form===2&&(a.rev||1)>=3&&a.mode==='practice'&&a.answeredAt<=now&&!a.skipped),unseen=a.filter(a=>a.independent&&!a.seenBefore&&a.phase!=='redo');
  return {id,attempts:a.length,firstCorrect:a.filter(a=>a.firstCorrect).length,independent:unseen.length,structures:[...new Set(unseen.map(a=>E.question(a).structure))].sort()};});
}
root.MochiPaperPractice={topicIds,guidance,make,diagram,extensionRecommendation,report};
if(typeof module!=='undefined')module.exports=root.MochiPaperPractice;
})(typeof globalThis!=='undefined'?globalThis:this);
