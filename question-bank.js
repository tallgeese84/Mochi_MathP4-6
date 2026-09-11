/* Original authored practice questions. Not reproduced or official admissions items. */
(function(root){
'use strict';
const pick=a=>a[Math.floor(Math.random()*a.length)],ri=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
const gcd=(a,b)=>b?gcd(b,a%b):a;
const fraction=(n,d)=>{const g=gcd(n,d);return `${n/g}/${d/g}`;};
const svg=(content,label)=>`<svg viewBox="0 0 360 210" width="360" role="img" aria-label="${label}"><g fill="none" stroke="#345b70" stroke-width="2">${content}</g></svg>`;
const text=(x,y,t)=>`<text x="${x}" y="${y}" fill="#263d49" stroke="none" font-size="16" text-anchor="middle">${t}</text>`;
const q=(skill,topic,stars,question,answer,steps,extra={})=>({skill,topic,stars,text:question,answer,steps,...extra});
const generators=[
 function fractionSum(){
   const a=pick([2,3,4]),b=pick([5,6,8]),p=ri(1,a-1),r=ri(1,b-1),n=p*b+r*a,d=a*b;
   return q('fraction','Fractions',2,`Find ${p}/${a} + ${r}/${b}. Give an exact fraction or mixed number.`,n/d,[`Equal-size parts are needed before adding. Use denominator ${d}.`,`${p}/${a} = ${p*b}/${d} and ${r}/${b} = ${r*a}/${d}.`,`Add the numerators: ${n}/${d} = ${fraction(n,d)}. Check whether the sum should exceed 1.`],{answerLabel:fraction(n,d),hint:'Would adding the denominators keep the pieces the same size? Draw the two fractions using one common whole.'});
 },
 function fractionProduct(){
   const p=ri(1,3),a=4,b=pick([3,5,6]),r=ri(1,b-1),n=p*r,d=a*b;
   return q('fraction','Fractions',2,`A ribbon is ${p}/${a} m long. You use ${r}/${b} of it. How many metres do you use? Give an exact fraction.`,n/d,[`The whole ribbon is ${p}/${a} m, not 1 m.`,`${r}/${b} of ${p}/${a} = ${n}/${d} = ${fraction(n,d)} m.`,`A proper fraction of the ribbon must be shorter than the ribbon.`],{answerLabel:fraction(n,d),suffix:'m',hint:'Draw the ribbon as a bar. Then take only the stated fraction of that bar.'});
 },
 function fractionCompare(){
   const a=pick([3,4,5,6,8]),b=a+1;
   return q('fraction','Fractions',2,`Which fraction is greater: ${a-1}/${a} or ${b-1}/${b}? Enter the greater fraction. Explain without converting to decimals.`,(b-1)/b,[`Both fractions are one part short of a whole.`,`They are missing 1/${a} and 1/${b}. A larger denominator makes a smaller missing piece.`,`${b-1}/${b} is closer to 1, so it is greater.`],{answerLabel:`${b-1}/${b}`,hint:'How far is each fraction from one whole?',transfer:true});
 },
 function decimalDivision(){
   const d=ri(2,9),n=ri(12,89),v=d*n/100;
   return q('decimal','Decimals',2,`Calculate ${v.toFixed(2)} ÷ ${d}.`,n/100,[`Think in hundredths: ${d*n} hundredths divided by ${d} is ${n} hundredths.`,`The answer is ${(n/100).toFixed(2)}. Multiply it by ${d} to check.`],{hint:'Change the decimal into a count of hundredths first.'});
 },
 function areaTriangle(){
   const b=ri(4,12)*2,h=ri(3,12);
   return q('area','Geometry',2,`A triangle has base ${b} cm and perpendicular height ${h} cm. Find its area.`,b*h/2,[`A copy of the triangle makes a parallelogram with area ${b} × ${h}.`,`The triangle has half that area: ${b} × ${h} ÷ 2 = ${b*h/2} cm².`],{suffix:'cm²',fig:svg(`<path d="M60 170 L300 170 L140 30 Z"/><path d="M140 30 V170" stroke-dasharray="5 4"/><path d="M140 158 H152 V170"/>${text(180,198,b+' cm')}${text(102,108,h+' cm')}`,'Triangle with perpendicular height marked'),figDesc:`Triangle with base ${b} cm and perpendicular height ${h} cm.`,hint:'Which two dimensions are perpendicular? Why does a triangle use half a matching parallelogram?'});
 },
 function rectanglePerimeter(){
   const w=ri(3,12),l=w+ri(3,9),per=2*(l+w);
   return q('area','Geometry',2,`A rectangle has perimeter ${per} cm and width ${w} cm. Find its area.`,l*w,[`Half the perimeter is one length plus one width: ${per} ÷ 2 = ${l+w} cm.`,`Length = ${l+w} − ${w} = ${l} cm.`,`Area = ${l} × ${w} = ${l*w} cm².`],{suffix:'cm²',hint:'Sketch and label all four sides. Does the perimeter give you one length or two?'});
 },
 function compositeArea(){
   const l=ri(8,14),h=ri(7,12),a=ri(2,5),b=ri(2,5);
   return q('area','Geometry',3,`An L-shaped card is made by removing a ${a} cm by ${b} cm rectangle from the top-right corner of a ${l} cm by ${h} cm rectangle. Find the area left.`,l*h-a*b,[`Area of the whole rectangle = ${l} × ${h} = ${l*h} cm².`,`Area removed = ${a} × ${b} = ${a*b} cm².`,`Area left = ${l*h} − ${a*b} = ${l*h-a*b} cm². Check by splitting the L into two rectangles.`],{suffix:'cm²',fig:svg(`<path d="M50 35 H225 V95 H310 V175 H50 Z"/>${text(175,201,l+' cm')}${text(24,110,h+' cm')}${text(267,80,a+' cm')}${text(325,63,b+' cm')}`,'L-shaped card; lengths are labelled; not to scale'),figDesc:`A ${l} by ${h} rectangle with a ${a} by ${b} corner removed.`,transfer:true,hint:'Would it be easier to find two rectangles inside the L, or subtract the missing corner? Compare the methods.'});
 },
 function parallelogramArea(){
   const b=ri(5,14),h=ri(3,8),s=h+ri(2,5);
   return q('area','Geometry',3,`A parallelogram has base ${b} cm, sloping side ${s} cm and perpendicular height ${h} cm. Find its area.`,b*h,[`The perpendicular height, not the sloping side, measures the distance between the parallel bases.`,`Cutting and moving a corner makes a rectangle of area ${b} × ${h} = ${b*h} cm².`],{stretch:true,suffix:'cm²',hint:'Which measurement is perpendicular to the base? The extra side length need not be used.',transfer:true});
 },
 function symmetryCount(){
   const shape=pick(['a non-square rectangle','a square','an equilateral triangle']),n={'a non-square rectangle':2,'a square':4,'an equilateral triangle':3}[shape];
   return q('spatial','Geometry',2,`How many lines of symmetry does ${shape} have? Explain by imagining folds.`,n,[`A symmetry line folds the shape into two matching halves.`,`Count the folds that make all corners and edges match.`,`${shape} has ${n} lines of symmetry.`],{hint:'Would a diagonal fold make every edge match? Try drawing or folding scrap paper.'});
 },
 function cubeNet(){
   const cells=[[1,0,'A'],[0,1,'B'],[1,1,'C'],[2,1,'D'],[1,2,'E'],[1,3,'F']];
   const pair=pick([['A','E'],['B','D'],['C','F']]);
   return q('spatial','Geometry',3,`This net folds into a cube. Which face will be opposite face ${pair[0]}? Choose its letter.`,pair[1],[`Keep C as the middle face. Fold A, B, D and E up around it; F closes the cube.`,`Opposite pairs are A–E, B–D and C–F.`,`So ${pair[1]} is opposite ${pair[0]}. Test your idea with a paper net.`],{choices:['A','B','C','D','E','F'],fig:svg(cells.map(([x,y,t])=>`<rect x="${95+x*42}" y="${12+y*42}" width="42" height="42"/>${text(116+x*42,39+y*42,t)}`).join(''),'Cube net: A above C; B left of C; D right of C; E below C; F below E'),figDesc:'Net rows: .A.; BCD; .E.; .F.',hint:'Start with C on the table and fold its four neighbours upward. Which face closes the open side?'});
 },
 function unitCubes(){
   const l=ri(2,5),w=ri(2,4),h=ri(2,4),missing=ri(1,h);
   return q('spatial','Geometry',3,`A solid block is ${l} unit cubes long, ${w} cubes wide and ${h} cubes high. A vertical stack of ${missing} cubes is removed from one top corner. How many cubes remain?`,l*w*h-missing,[`One complete layer holds ${l} × ${w} = ${l*w} cubes.`,`${h} layers hold ${l*w*h} cubes.`,`Remove ${missing}: ${l*w*h-missing} cubes remain.`],{hint:'Count complete layers, including hidden cubes, before removing the missing stack.'});
 },
 function ratioUnknownTotal(){
   const [a,b,r,s]=pick([[5,3,1,1],[7,3,3,2],[5,1,3,1]]),k=ri(2,8)*5,total=(a+b)*(r+s)*k,old=a*(r+s)*k,end=r*(a+b)*k,moved=old-end;
   return q('ratio','Ratio',4,`At first, the ratio of Aria’s cards to Ben’s was ${a}:${b}. Aria gave Ben ${moved} cards, and the ratio became ${r}:${s}. How many cards did they have altogether?`,total,[`The total does not change when cards move between them.`,`Aria's fraction of the total changes from ${a}/${a+b} to ${r}/${r+s}.`,`This drop is ${(a*(r+s)-r*(a+b))}/${(a+b)*(r+s)} of the total, equal to ${moved} cards.`,`Total = ${moved} ÷ ${(a*(r+s)-r*(a+b))} × ${(a+b)*(r+s)} = ${total}.`],{hint:'Make the total number of units the same in both ratios. What fraction of the total moved?',transfer:true});
 },
 function fractionRemainderTransfer(){
   const whole=ri(4,12)*12,left=whole/4;
   return q('fractionProblem','Fractions',3,`A library lends out 1/3 of its new books on Monday and 5/8 of the remaining new books on Tuesday. It has ${left} new books left. How many new books did it have initially?`,whole,[`After Monday, 2/3 of the books remain.`,`After Tuesday, 3/8 of that remainder stays: 2/3 × 3/8 = 1/4 of the original books.`,`${left} is 1/4, so the original number = ${left} × 4 = ${whole}.`],{hint:'Describe the fraction left at each stage, before using the number of books.',transfer:true});
 },
 function multiPartBudget(){
   const tickets=ri(4,8),price=pick([6,8,10]),fare=ri(2,4),paid=100,cost=tickets*price,change=paid-cost-fare;
   return q('model','Problem solving',3,`A family buys ${tickets} museum tickets at $${price} each and pays $${fare} for parking. They have $${paid}.`,change,[`(a) Ticket cost = ${tickets} × $${price} = $${cost}.`,`(b) Use (a): money left = $${paid} − $${cost} − $${fare} = $${change}.`,`Check: tickets + parking + money left must total $${paid}.`],{parts:[{label:'(a) What is the total ticket cost, in dollars?',answer:cost},{label:'(b) How much money remains after tickets and parking, in dollars?',answer:change}],hint:'Find one subtotal first. What needs to be included when you calculate the remaining money?',transfer:true});
 },
 function algebraRelationship(){
   const n=ri(3,9),extra=ri(2,8),boxes=ri(3,6);
   return q('algebra','Algebra',2,`There are n beads in each of ${boxes} boxes and ${extra} loose beads. If n = ${n}, how many beads are there altogether?`,boxes*n+extra,[`The relationship is ${boxes} × n + ${extra}.`,`${boxes} groups of ${n}, plus ${extra}, gives ${boxes*n+extra} beads.`],{hint:'What does n count: boxes or beads in one box?',transfer:true});
 },
 function changingWhole(){
   const price=ri(3,12)*20,up=price*1.2,end=up*.8;
   return q('percent','Percentage',3,`A price of $${price} rises by 20%, then the new price falls by 20%. What is the final price?`,Math.round(end*100)/100,[`After the rise: 120% of $${price} = $${up}.`,`The fall is 20% of $${up}, not of the original price.`,`Final price = 80% of $${up} = $${end.toFixed(2)}. Equal percentages need not cancel when the whole changes.`],{prefix:'$',hint:'Before each percentage step, write down the amount that is now 100%.',transfer:true});
 },
 function linearEquation(){
   const a=ri(2,9),n=ri(2,15),b=ri(2,20),total=a*n+b;
   return q('algebra','Algebra',2,`Solve ${a}n + ${b} = ${total}. What is n?`,n,[`Subtract ${b} from BOTH sides, keeping the equality: ${a}n = ${total-b}.`,`Divide BOTH sides by ${a}: n = ${n}.`,`Check in the original: ${a} × ${n} + ${b} = ${total}.`],{hint:'Imagine a balance: what can you remove from both sides to leave equal groups?'});
 },
 function simplifyExpression(){
   const a=ri(3,10),b=ri(2,8),c=ri(1,a-1);
   return q('algebra','Algebra',2,`Simplify ${a}x + ${b}x − ${c}x. Enter the number that multiplies x.`,a+b-c,[`Every term counts the same unit, x.`,`${a} groups + ${b} groups − ${c} groups = ${a+b-c} groups.`,`The simplified expression is ${a+b-c}x. Test x = 2 to check.`],{hint:'If x represented a box, how many boxes would remain?'});
 },
 function ratioThreeParts(){
   const a=ri(2,5),b=ri(2,6),c=ri(3,7),k=ri(3,12),total=(a+b+c)*k;
   return q('ratio','Ratio',2,`Red, blue and green beads are in the ratio ${a}:${b}:${c}. There are ${total} beads altogether. How many are blue?`,b*k,[`Total units = ${a} + ${b} + ${c} = ${a+b+c}.`,`One unit = ${total} ÷ ${a+b+c} = ${k} beads.`,`Blue beads = ${b} × ${k} = ${b*k}.`],{hint:'How many equal units does the total represent? Which part of the ratio is blue?'});
 },
 function fractionByFraction(){
   const a=ri(1,3),b=4,c=ri(1,4),d=5;
   return q('fraction','Fractions',3,`Calculate ${a}/${b} ÷ ${c}/${d}. Give an exact fraction or mixed number.`,a*d/(b*c),[`Think: how many groups of ${c}/${d} fit in ${a}/${b}?`,`Express both using denominator ${b*d}: ${a*d}/${b*d} and ${c*b}/${b*d}.`,`Divide their counts of equal-size pieces: ${a*d} ÷ ${c*b} = ${fraction(a*d,b*c)}.`],{answerLabel:fraction(a*d,b*c),hint:'Put both amounts into the same-size pieces, then compare how many pieces each contains.'});
 },
 function mixedSubtract(){
   const w=ri(3,8),v=ri(1,w-1),a=pick([3,4,5,6]),n=(w-v)*a-1;
   return q('fraction','Fractions',3,`Calculate ${w} 1/${a} − ${v} 2/${a}. Give an exact fraction or mixed number.`,n/a,[`Rename one whole from the first number: ${w} 1/${a} = ${w-1} ${a+1}/${a}.`,`Subtract whole parts and fractional parts: ${w-v-1} and ${(a+1)-2}/${a}.`,`The result is ${fraction(n,a)}. Add the amount taken away to check.`],{answerLabel:fraction(n,a),hint:'The first fraction is smaller. Can you rename one whole as fractional parts?'});
 },
 function timeStart(){
   const end=ri(10,17)*60+pick([10,20,30,45]),duration=pick([45,70,85,95]),start=end-duration;
   const clock=m=>String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');
   return q('time','Time',2,`A lesson ends at ${clock(end)} and lasts ${duration} minutes. How many minutes after midnight did it start?`,start,[`The end is ${Math.floor(end/60)} × 60 + ${end%60} = ${end} minutes after midnight.`,`Start = ${end} − ${duration} = ${start} minutes after midnight, or ${clock(start)}.`,`Add the duration to verify the ending time.`],{suffix:'minutes',hint:'Use one unit throughout. Would you move forward or backward from the finish time?',transfer:true});
 },
 function measurementCompare(){
   const cm=ri(120,190),extra=ri(5,45),other=(cm+extra)/100;
   return q('measure','Measurement',2,`One ribbon is ${cm} cm long and another is ${other.toFixed(2)} m long. How many centimetres longer is the second ribbon?`,extra,[`${other.toFixed(2)} m = ${cm+extra} cm.`,`Now compare in the SAME unit: ${cm+extra} − ${cm} = ${extra} cm.`],{suffix:'cm',hint:'Why would subtracting the printed numbers before converting units be misleading?',transfer:true});
 },
 function circleComposite(){
   const d=pick([14,28,42]),l=pick([d,d+7,d+14]);
   return q('circle','Circles',3,`A semicircle is attached outside one side of a rectangle of length ${l} cm and width ${d} cm. The shared side is the semicircle's diameter. Find the perimeter of the combined shape. Take π = 22/7.`,2*l+d+22*d/14,[`The shared diameter lies inside the shape, so do not count it.`,`The outer rectangle edges total ${l} + ${l} + ${d} = ${2*l+d} cm.`,`The curved edge is half a circumference: 22/7 × ${d} ÷ 2 = ${22*d/14} cm.`,`Total perimeter = ${2*l+d+22*d/14} cm.`],{suffix:'cm',hint:'Trace only the OUTSIDE boundary. Is the shared diameter on that boundary?',transfer:true});
 },
 function cuboidFace(){
   const area=ri(5,20)*5,length=ri(3,12),v=area*length;
   return q('volume','Volume',3,`A cuboid has volume ${v} cm³. Its length is ${length} cm. What is the area of the face perpendicular to that length?`,area,[`Volume = area of that face × length.`,`Face area = ${v} ÷ ${length} = ${area} cm².`,`Check the units: cm² × cm = cm³.`],{suffix:'cm²',hint:'Think of the solid as many slices of equal face area.',transfer:true});
 },
 function cubeEdge(){
   const edge=ri(2,12),v=edge**3;
   return q('volume','Volume',2,`A cube has volume ${v} cm³. Find the length of one edge, in centimetres.`,edge,[`For a cube, volume = edge × edge × edge.`,`Find a number whose cube is ${v}: ${edge} × ${edge} × ${edge} = ${v}.`,`The edge is ${edge} cm. Use nearby whole-number cubes to test your result.`],{suffix:'cm',hint:'What whole number multiplied by itself three times gives the volume?'});
 },
 function counterexample(){
   const a=ri(3,8);
   return q('inquiry','Investigation',3,`A student claims: “Multiplying a positive number always makes it bigger.” Which multiplier disproves this when the starting number is ${a}? Explain why one example is enough to refute “always”.`, '1/2',[`${a} × 1/2 = ${a/2}, which is smaller than ${a}.`,`The multiplier 1/2 gives a counterexample, so the word “always” is false.`,`A repaired claim: multiplying a positive number by a number greater than 1 makes it bigger.`],{choices:['2','3','1/2','10'],stretch:true,transfer:true,hint:'Look for a multiplier between zero and one. Is the claim about some cases or all cases?'});
 },
 function patternGeneralise(){
   const n=ri(7,20);
   return q('inquiry','Investigation',3,`One square uses 4 matchsticks. Squares are added in a straight row, sharing a full side with the previous square. How many matchsticks make ${n} squares? Explain a rule for any row length.`,3*n+1,[`The first square needs 4 sticks; every new square adds 3.`,`${n} squares need 4 + 3 × ${n-1} = ${3*n+1}.`,`Another way: ${n} top + ${n} bottom + ${n+1} vertical sticks. The rule is 3 × number of squares + 1.`],{stretch:true,transfer:true,hint:'Draw rows of one, two and three squares. What changes, and what is shared?'});
 },
 function systematicCounting(){
   const n=ri(4,9);
   return q('inquiry','Investigation',3,`${n} children each shake hands with every other child exactly once. How many handshakes happen? Explain how your method avoids counting one handshake twice.`,n*(n-1)/2,[`Each child has ${n-1} partners.`,`${n} × ${n-1} counts each pair twice, once from each child's view.`,`Divide by 2: ${n*(n-1)/2} handshakes. Check a group of 3 by drawing all pairs.`],{stretch:true,transfer:true,hint:'List pairs for three children. Does A–B describe a different handshake from B–A?'});
 },
 function evidenceClaim(){
   return q('inquiry','Investigation',2,'A pupil asks 10 friends in the chess club. Eight prefer chess to football. Which conclusion is supported by this survey?', '8 of these 10 friends prefer chess',[`The observations describe only the 10 surveyed friends.`,`Chess-club friends may not represent all pupils.`,`A larger, varied sample would help investigate the whole-school question.`],{choices:['80% of all pupils prefer chess','8 of these 10 friends prefer chess','Chess causes better maths results'],stretch:true,transfer:true,hint:'Who was actually asked? Does the claim describe only them or a bigger group?'});
 }
];
root.MochiBank={generators};
if(typeof module!=='undefined') module.exports=root.MochiBank;
})(typeof globalThis!=='undefined'?globalThis:this);
