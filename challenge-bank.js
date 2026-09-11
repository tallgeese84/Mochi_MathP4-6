/* Original investigations: invariants, constraints, counting and general arguments. */
(function(root){
'use strict';
const ri=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
const make=(text,answer,steps,extra={})=>({skill:'inquiry',topic:'Investigation',stars:4,stretch:true,transfer:true,text,answer,steps,...extra});
const generators=[
 function parityInvariant(){
   const start=ri(5,25),target=start+ri(1,12),yes=(target-start)%2===0;
   return make(`Start at ${start}. A move adds 2 or subtracts 4. Can you reach ${target} after any number of moves? Answer Yes or No, and justify it.`,yes?'Yes':'No',[`Both moves change the number by an even amount, so odd/even status stays the same.`,yes?`${target} is ${target-start} more than ${start}. Adding 2 ${(target-start)/2} times reaches it.`:`${start} and ${target} have different odd/even status. No allowed sequence can change that.`,`An invariant explains all possible move sequences, not just the ones you tried.`],{choices:['Yes','No'],hint:'What property does every allowed move preserve?'});
 },
 function reverseDigits(){
   const a=ri(3,9),b=ri(1,a-1),sum=a+b,diff=9*(a-b),answer=a*10+b;
   return make(`A two-digit number has digit sum ${sum}. It exceeds the number with its digits reversed by ${diff}. Find the original number.`,answer,[`If the tens digit is a and the ones digit is b, reversing changes 10a + b to 10b + a.`,`The difference is 9(a − b), so the digits differ by ${diff} ÷ 9 = ${a-b}.`,`The digits have sum ${sum} and difference ${a-b}, giving ${a} and ${b}. The number is ${answer}.`,`Check: ${answer} − ${10*b+a} = ${diff}, and ${a} + ${b} = ${sum}.`],{hint:'List digit pairs with the required sum. What does swapping a tens digit and ones digit change?'});
 },
 function rectanglesInGrid(){
   const w=ri(2,5),h=ri(2,5),answer=w*(w+1)*h*(h+1)/4;let lines='';
   for(let x=0;x<=w;x++)lines+=`<path d="M${30+x*35} 20 V${20+h*35}"/>`;
   for(let y=0;y<=h;y++)lines+=`<path d="M30 ${20+y*35} H${30+w*35}"/>`;
   return make(`A grid has ${w} columns and ${h} rows of unit squares. How many rectangles of all sizes have sides along the grid lines? Include squares.`,answer,[`A rectangle is uniquely determined by choosing two vertical and two horizontal grid lines.`,`There are ${w+1} vertical lines: ${w*(w+1)/2} different pairs. There are ${h+1} horizontal lines: ${h*(h+1)/2} pairs.`,`Each vertical pair combines with every horizontal pair: ${w*(w+1)/2} × ${h*(h+1)/2} = ${answer}.`,`Check a smaller grid by listing sizes and positions, with no duplicates.`],{fig:`<svg viewBox="0 0 ${60+w*35} ${40+h*35}" width="300" role="img" aria-label="${w} columns and ${h} rows"><g stroke="#587dd5" stroke-width="2" fill="none">${lines}</g></svg>`,figDesc:`Grid with ${w} columns and ${h} rows.`,hint:'How could you identify each rectangle uniquely so none are missed or counted twice?'});
 },
 function guaranteeSocks(){
   const colors=ri(3,5),match=ri(2,4),answer=colors*(match-1)+1;
   return make(`A drawer contains ${colors} sock colours, with plenty of each. You draw without looking. What is the smallest number of socks that guarantees at least ${match} of one colour?`,answer,[`Think about the worst possible case, not the most likely case.`,`You could draw ${match-1} of each of ${colors} colours without reaching ${match}: ${colors*(match-1)} socks.`,`The next sock must join one of those colours, so ${answer} guarantees the match.`,`The worst-case example also shows that a smaller number does not guarantee it.`],{hint:'What is the largest draw that could still avoid the required match?'});
 },
 function constrainedCoins(){
   const a=ri(4,12),b=ri(3,10),n=a+b,total=20*a+50*b;
   return make(`${n} coins are worth ${total} cents altogether. Every coin is either 20 cents or 50 cents. How many 50-cent coins are there?`,b,[`If all ${n} coins were 20 cents, the total would be ${20*n} cents.`,`The extra ${total-20*n} cents comes from replacing some 20-cent coins by 50-cent coins. Each replacement adds 30 cents.`,`So there are ${total-20*n} ÷ 30 = ${b} larger coins.`,`Check both constraints: ${a} + ${b} = ${n}, and 20 × ${a} + 50 × ${b} = ${total}.`],{hint:'Begin with a simple situation that satisfies the coin count. What change would bring its value to the required total?'});
 },
 function borderGeneralise(){
   const n=ri(5,20),answer=4*n-4;
   return make(`A square mosaic is ${n} tiles wide and ${n} tiles high. How many tiles touch its outer boundary? Each tile is counted once.`,answer,[`Counting ${n} tiles on each of 4 sides counts each corner twice.`,`Remove the four duplicate corners: 4 × ${n} − 4 = ${answer}.`,`A second method subtracts the inner square: ${n}² − ${n-2}² = ${answer}.`,`Explain why the two expressions agree for any square with at least 2 tiles per side.`],{hint:'Where would counting one side at a time count a tile twice?',stars:3});
 },
 function constrainedDigits(){
   const digits=[];while(digits.length<4){const d=ri(1,9);if(!digits.includes(d))digits.push(d);}digits.sort((a,b)=>a-b);
   const valid=[];for(const a of digits)for(const b of digits)if(a!==b&&(10*a+b)%3===0)valid.push(10*a+b);
   return make(`Use digits ${digits.join(', ')}. How many different two-digit multiples of 3 can you make without repeating a digit within a number?`,valid.length,[`A multiple of 3 has a digit sum divisible by 3. Test each pair of different digits.`,`Use an organised list so each allowed tens digit is considered once.`,`Valid numbers: ${valid.join(', ')||'none'}. There are ${valid.length}.`,`Explain why your list is complete, and why reversing a valid pair gives another valid number.`],{hint:'What digit-sum property do multiples of 3 share? Then organise the cases by their tens digit.'});
 },
 function closestNumbers(){
   const digits=[];while(digits.length<4){const d=ri(1,9);if(!digits.includes(d))digits.push(d);}digits.sort((a,b)=>a-b);
   let best=100,pair=[];
   for(const a of digits)for(const b of digits)for(const c of digits)for(const d of digits){if(new Set([a,b,c,d]).size!==4)continue;const left=10*a+b,right=10*c+d;if(left>right&&left-right<best){best=left-right;pair=[left,right];}}
   return make(`Use digits ${digits.join(', ')} exactly once to form two two-digit numbers. What is the smallest positive difference you can obtain?`,best,[`The tens digits have the greatest influence. Small differences need nearby tens digits and compensating ones digits.`,`List each possible pair of tens digits, then test the two possible assignments of the remaining ones digits.`,`One best pair is ${pair[0]} and ${pair[1]}, with difference ${best}.`,`Your justification must rule out every smaller difference, not just give one good pair.`],{hint:'For each choice of tens digits, how should you place the remaining digits to make the numbers closer?'});
 }
];
root.MochiChallenges={generators};
})(typeof globalThis!=='undefined'?globalThis:this);
