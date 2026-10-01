/* DSA challenge module "numbers": digits and divisibility, clocks/calendars/laps, and most-and-least.
   Original questions with whole-number answers and no calculator. Each form has at least two
   structurally different variants chosen by seed; form 3 is reserved for mock papers.
   Registers itself as MochiDSA_numbers; entrance-data.js adds the units with extension:true, module:'numbers'. */
(function(root){
'use strict';
const unit=(id,strand,title,foundation,prerequisites,ideas,check,why)=>({id,strand,title,foundation,benchmarkPages:'Challenge extension (olympiad-style number, cycle and optimisation types)',extension:true,prerequisites,ideas,check,why});
const units=[
 unit('nx-digits','number','Challenge · Digits and divisibility','m-factors',['factors','cycles','digits'],[
  'Many divisibility tests use only the digits. A number is divisible by 9 exactly when its digit sum is (and by 3 when its digit sum is). It is divisible by 11 when the digits in the 1st, 3rd, 5th, … places from the right and the digits in the 2nd, 4th, … places have totals that differ by a multiple of 11 (0 counts). For 4, look at the last two digits; for 8, the last three; for 5, the last digit.',
  'For a divisor such as 36 = 4 × 9 or 72 = 8 × 9, split it into factors with no common factor and test each one. Fix the digit that the “last digits” test controls first, then use the digit-sum test to find the other digit. Count every case: a digit sum of 0 or 9 needed can give two choices.',
  'Large powers are handled by cycles. The last digits of 7, 7², 7³, … run 7, 9, 3, 1 and then repeat, so only the remainder of the power on division by the cycle length matters. Remainders on division by 7 or 11 repeat in the same way. A zero at the end of a product needs a factor 10 = 2 × 5, so count the scarcer prime, usually 5.'
 ],['A number is divisible by 36. Which pair of tests must it pass?',['Divisible by 4 and by 9','Divisible by 6 and by 6','Divisible by 3 and by 12'],0,'36 = 4 × 9, and 4 and 9 have no common factor, so passing both tests is enough. 6 and 6 (or 3 and 12) share factors, so 6 passes them both but is not a multiple of 36.'],'Turn the condition into a rule on the digits or a repeating cycle, then check every case.'),
 unit('nx-cycles','algebra','Challenge · Clocks, calendars and laps','m-rate',['motion','rates','cycles'],[
  'Clock hands are moving objects. The minute hand turns 6° per minute and the hour hand 0.5° per minute, so the minute hand gains 5.5° every minute. Measure every angle from 12 o’clock, then subtract. Events such as “hands together” happen each time the gain reaches another 360°.',
  'Weekdays repeat every 7 days. To move N days forwards or backwards, keep only the remainder when N is divided by 7. Between two dates, add the days left in the first month, the full months in between and the days into the last month; remember February has 29 days in a leap year.',
  'Two runners on a circular track meet whenever, together, they cover one more full lap (opposite directions: add speeds) or the faster one gains a full lap (same direction: subtract speeds). Trains are the same idea with lengths: to pass completely, the front must travel the train’s length plus whatever it passes. For work problems, add the fractions of the job done per day.'
 ],['Two runners go round a 400 m track in opposite directions at 3 m/s and 5 m/s from the same point. How do you find when they first meet?',['400 ÷ (5 + 3)','400 ÷ (5 − 3)','400 × 8'],0,'Running towards each other round the track, together they close the 400 m gap at 3 + 5 = 8 m/s.'],'Find what repeats (a lap, a turn of the hands, a week) and how fast the gap closes. Then count complete cycles and deal with the remainder.'),
 unit('nx-extremes','logic','Challenge · Most and least','m-proof',['bounds','invariants','cases'],[
  'A “least number to be sure” question is about the unluckiest possible case. Imagine taking as many as you can WITHOUT reaching the goal: for example, one short of the target from every colour, and all of any colour that has fewer than that. One more item then forces the goal.',
  'With a fixed sum, a product is largest when the parts are as equal as possible. When you may choose how many whole-number parts to use, parts of 3 are best: replace any part of 5 or more by 2 and 3, and swap three 2s for two 3s (8 < 9). Rectangles follow the same rule: a fixed perimeter gives the most area when the sides are as close as possible.',
  'The greedy choice (biggest coin first, cheapest item first) is not always best. List the cases in an organised way, for example by the number of the largest coin, and compare. An extreme answer needs two parts: a reason no case can do better, and an example that reaches it.'
 ],['A bag has 5 red and 5 blue marbles. Why is 3 the least number you must take to be sure of two of the same colour?',['After 2 marbles you might have one of each; the 3rd must match one of them','3 is half of 5 rounded up','You need one marble per colour'],0,'The worst case is one red and one blue. The next marble is red or blue, so it completes a pair.'],'Find a bound (no case can beat it) and a construction (some case reaches it). Without both, the answer is only a guess.')
];

/* ---------- helpers ---------- */
const gcd=(a,b)=>{a=Math.abs(a);b=Math.abs(b);while(b)[a,b]=[b,a%b];return a;};
const lcm=(a,b)=>a/gcd(a,b)*b;
const fmt=n=>n>=10000?n.toLocaleString('en-GB'):String(n);
const plural=(n,one,many=one+'s')=>`${n} ${n===1?one:many}`;
const DAYS=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];
const KEY='Give your answer as a number: Monday = 1, Tuesday = 2, …, Sunday = 7.';
const day=n=>DAYS[((n-1)%7+7)%7];
const wrap=n=>((n-1)%7+7)%7+1;
const leap=y=>y%4===0&&(y%100!==0||y%400===0);
const monthDays=(m,y)=>[31,leap(y)?29:28,31,30,31,30,31,31,30,31,30,31][m];
const weekday=(y,m,d)=>(new Date(Date.UTC(y,m,d)).getUTCDay()+6)%7+1;
const ord=n=>n+(n%100>=11&&n%100<=13?'th':n%10===1?'st':n%10===2?'nd':n%10===3?'rd':'th');
const pad=m=>String(m).padStart(2,'0');
const powerOf=(n,p)=>{let c=0;for(let q=p;q<=n;q*=p)c+=Math.floor(n/q);return c;};
const multiplesIn=(a,b,k)=>Math.floor(b/k)-Math.floor((a-1)/k);
const rep=(d,t)=>t?Number(String(d).repeat(t)):0;
const digitSum=n=>String(n).split('').reduce((s,c)=>s+ +c,0);
const DIGIT_WORDS=['zeros','ones','twos','threes','fours','fives','sixes','sevens','eights','nines'];
const COLOURS=['red','blue','green','yellow','white'];
const NAMES=['Aisha','Ben','Chloe','Dev','Farah','Hui Min','Kumar','Mei','Ravi','Siti'];
/* Powers of b reduced modulo m, starting at b¹, until they repeat. The sequences used are purely periodic. */
function cycle(b,m){const out=[];let v=b%m;while(!out.includes(v)){out.push(v);v=v*b%m;}return out;}
function cyclePos(n,len){const t=n%len;return t===0?len:t;}
function frac(n,d){const g=gcd(n,d);return d/g===1?String(n/g):`${n/g}/${d/g}`;}

/* ---------- fixed parameter families (checked in tests) ---------- */
const crtTriples=[[3,4,5],[3,5,7],[4,5,7],[3,7,8],[5,7,9],[4,7,9],[5,8,9],[3,5,8]];
const powerMods=[[2,7],[3,7],[4,7],[5,7],[2,9],[4,9],[5,9],[3,11],[3,5],[2,13]].filter(([b,m])=>cycle(b,m).length<=6);
const coinSystems=[[1,4,6],[1,5,7],[1,7,10],[1,6,9],[1,5,8],[1,4,9]];
const workSets=(()=>{const out=[];for(let a=3;a<=40;a++)for(let b=a+1;b<=60;b++){if((a*b)%(a+b))continue;const T=a*b/(a+b);if(T<2)continue;for(let t=1;t<T;t++){if((a*(T-t))%T)continue;const s=a*(T-t)/T;if(s>=1)out.push({a,b,T,t,s});}}return out;})();
const pipeSets=(()=>{const out=[];for(let a=4;a<=24;a++)for(let b=3;b<=24;b++){if(a===b)continue;for(let h=1;h<a;h++){if((b*(a-h))%a)continue;const x=b*(a-h)/a;if(x>=1&&x<h)out.push({a,b,h,x});}}return out;})();
function fewestCoins(N,coins){const best=Array(N+1).fill(Infinity);best[0]=0;for(let n=1;n<=N;n++)for(const c of coins)if(c<=n&&best[n-c]+1<best[n])best[n]=best[n-c]+1;return best[N];}
function greedyCoins(N,coins){let n=N,k=0;for(const c of [...coins].sort((x,y)=>y-x)){k+=Math.floor(n/c);n%=c;}return k;}
function bestSplit(S){if(S%3===0)return 3**(S/3);if(S%3===1)return S===1?1:4*3**((S-4)/3);return 2*3**((S-2)/3);}

/* ---------- generators ---------- */
function make(id,form,seed,r){
 let q=null;const out=(text,answer,steps,params={},extra={})=>q={text,answer,steps,params,...extra};
 const pick=a=>a[r(0,a.length-1)];
 if(id==='nx-digits'){
  if(form===0){
   const v=r(0,2);
   for(let t=0;t<400&&!q;t++){
    if(v===0||v===1){
     const L=r(5,6),digits=[r(1,9),...Array.from({length:L-1},()=>r(0,9))],pos=r(1,L-1),known=digits.map((d,i)=>i===pos?null:d),shown=known.map(d=>d===null?'□':d).join('');
     if(v===0){
      const s=known.reduce((a,d)=>a+(d||0),0);if(s%9===0)continue;const d=9-s%9,full=known.map(x=>x===null?d:x).join('');
      out(`The ${L}-digit number ${shown} is divisible by 9. The □ stands for one missing digit. What is the missing digit?`,d,[`A whole number is divisible by 9 exactly when the sum of its digits is divisible by 9.`,`The known digits add up to ${known.filter(x=>x!==null).join(' + ')} = ${s}.`,`The next multiple of 9 after ${s} is ${s+d}, so the missing digit is ${s+d} − ${s} = ${d}.`,`The multiple after that, ${s+d+9}, would need the digit ${d+9}, which is too big. So ${d} is the only choice.`,`Check: ${full} has digit sum ${s+d} = 9 × ${(s+d)/9}.`],{variant:'nine',known},{});
     }else{
      let odd=0,even=0;known.forEach((x,i)=>{if(x===null)return;const j=L-1-i;if(j%2===0)odd+=x;else even+=x;});
      const j=L-1-pos,sign=j%2===0?1:-1,d=((-sign*(odd-even))%11+11)%11;if(d===10)continue;
      const full=known.map(x=>x===null?d:x).join(''),O=odd+(sign>0?d:0),E=even+(sign<0?d:0);
      out(`The ${L}-digit number ${shown} is divisible by 11. The □ stands for one missing digit. What is the missing digit?`,d,[`Test for 11: add the digits in the 1st, 3rd, 5th, … places counting from the right, and separately the digits in the 2nd, 4th, … places. The number is divisible by 11 exactly when the two totals differ by a multiple of 11 (0 counts).`,`The □ is in the ${ord(j+1)} place from the right, so it belongs to the ${sign>0?'odd':'even'}-place total.`,`Known digits: odd places total ${odd}; even places total ${even}.`,`With the missing digit d: ${sign>0?`(${odd} + d) − ${even}`:`${odd} − (${even} + d)`} must be a multiple of 11. Since d is 0 to 9, the only possibility is d = ${d}.`,`Check: ${full} gives totals ${O} and ${E}; the difference is ${O-E}, a multiple of 11.`],{variant:'eleven',known},{});
     }
    }else{
     const m=pick([36,45,72]),p=m/9,L=5,digits=[r(1,9),r(0,9),r(0,9),r(0,9),r(0,9)],apos=m===72?1:r(1,2),shownArr=digits.map((d,i)=>i===apos?'A':i===4?'B':String(d)),shown=shownArr.join('');
     const val=(A,B)=>Number(digits.map((d,i)=>i===apos?A:i===4?B:d).join(''));
     const pairs=[];for(let A=0;A<=9;A++)for(let B=0;B<=9;B++)if(val(A,B)%m===0)pairs.push([A,B]);
     if(pairs.length<1||pairs.length>5)continue;
     const s=digits.reduce((a,d,i)=>a+(i===apos||i===4?0:d),0),Bs=[...new Set(pairs.map(x=>x[1]))];
     const tail=p===5?'the last digit B must be 0 or 5':p===4?`the last two digits ${shownArr[3]}B must make a multiple of 4`:`the last three digits ${shownArr.slice(2).join('')} must make a multiple of 8`;
     const Bline=`Divisible by ${p}: ${tail}. So B = ${Bs.join(' or ')}.`;
     const caseLines=Bs.map(B=>{const As=pairs.filter(x=>x[1]===B).map(x=>x[0]);return `B = ${B}: the digit sum is ${s} + A + ${B} = ${s+B} + A, a multiple of 9 when A = ${As.join(' or ')}.`;});
     out(`In the five-digit number ${shown}, the letters A and B stand for digits (they may be equal). The number is divisible by ${m}. How many different numbers are possible?`,pairs.length,[`${m} = ${p} × 9, and ${p} and 9 have no common factor, so the number must be divisible by both ${p} and 9.`,Bline,...caseLines,`Altogether there are ${pairs.length} numbers: ${pairs.map(([A,B])=>val(A,B)).join(', ')}.`],{variant:'two-digits',m,digits,apos},{});
    }
   }
   if(!q)throw Error('nx-digits/0 failed');
  }
  if(form===1){
   const v=r(0,2);
   if(v===0){
    const b=pick([2,3,7,8,12,13,17,18,22,27,33,37,43,48,53,57,63,67,72,77,83,88,93,97]),n=r(150,2100),u=b%10,c=cycle(u,10),k=cyclePos(n,c.length),ans=c[k-1];
    out(`What is the last digit of ${b}^${n}?`,ans,[`Only the last digit of ${b} affects the last digit of its powers, so work with powers of ${u}.`,`Powers of ${u} end in ${c.join(', ')}, then the pattern repeats: a cycle of ${c.length}.`,`${n} = ${c.length} × ${Math.floor((n-1)/c.length)} + ${k}${k===c.length?' (a full cycle, so use the last place in the cycle)':''}.`,`So ${b}^${n} ends in the same digit as ${u}^${k}: ${ans}.`],{variant:'last-digit',b,n});
   }
   if(v===1){
    const [b,m]=pick(powerMods),n=r(40,400),c=cycle(b,m),k=cyclePos(n,c.length),ans=c[k-1];
    out(`What is the remainder when ${b}^${n} is divided by ${m}?`,ans,[`Work only with remainders: multiply the last remainder by ${b} and take the remainder on division by ${m} again.`,`Remainders of ${b}, ${b}², ${b}³, …: ${c.join(', ')}, then they repeat. The cycle has length ${c.length}.`,`${n} = ${c.length} × ${Math.floor((n-1)/c.length)} + ${k}, so ${b}^${n} is in position ${k} of the cycle.`,`The remainder is ${ans}.`],{variant:'remainder',b,m,n});
   }
   if(v===2){
    let b1,b2;do{b1=pick([2,3,7,8]);b2=pick([3,4,7,9]);}while(b1===b2);
    const n1=r(20,300),n2=r(20,300),c1=cycle(b1,10),c2=cycle(b2,10),d1=c1[cyclePos(n1,c1.length)-1],d2=c2[cyclePos(n2,c2.length)-1],prod=r(0,1)===0,ans=prod?d1*d2%10:(d1+d2)%10;
    out(`What is the last digit of ${b1}^${n1} ${prod?'×':'+'} ${b2}^${n2}?`,ans,[`Powers of ${b1} end in ${c1.join(', ')} (cycle of ${c1.length}). ${n1} leaves remainder ${n1%c1.length} on division by ${c1.length}, so ${b1}^${n1} ends in ${d1}.`,`Powers of ${b2} end in ${c2.join(', ')} (cycle of ${c2.length}). ${n2} leaves remainder ${n2%c2.length} on division by ${c2.length}, so ${b2}^${n2} ends in ${d2}.`,`The last digit of a ${prod?'product':'sum'} depends only on the last digits: ${d1} ${prod?'×':'+'} ${d2} = ${prod?d1*d2:d1+d2}.`,`So the last digit is ${ans}.`],{variant:prod?'product':'sum',b1,n1,b2,n2});
   }
  }
  if(form===2){
   const v=r(0,2);
   if(v===0){
    const n=r(30,260),f5=powerOf(n,5),parts=[5,25,125].filter(p=>p<=n);
    out(`The number 1 × 2 × 3 × … × ${n} is worked out. How many zeros are at the end of the answer?`,f5,[`Each zero at the end comes from a factor 10 = 2 × 5. Even numbers supply far more 2s than multiples of 5 supply 5s, so count the 5s.`,...parts.map(p=>`Multiples of ${p} up to ${n}: ${Math.floor(n/p)}${p>5?` (each gives ${p===25?'a second':'a third'} 5)`:' (each gives one 5)'}.`),`Number of 5s = ${parts.map(p=>Math.floor(n/p)).join(' + ')} = ${f5}, so there are ${f5} zeros.`],{variant:'factorial',n});
   }
   if(v===1){
    for(let t=0;t<100&&!q;t++){
     const a=r(11,60),b=a+r(20,120),five=[5,25,125].map(k=>multiplesIn(a,b,k)),v5=five.reduce((s,x)=>s+x,0),v2=[2,4,8,16,32,64,128].map(k=>multiplesIn(a,b,k)).reduce((s,x)=>s+x,0);
     if(v2<=v5)continue;
     out(`All the whole numbers from ${a} to ${b} are multiplied together. How many zeros are at the end of the product?`,v5,[`A zero at the end needs one 2 and one 5. With so many even numbers in the list, 2s are plentiful; count the 5s.`,`Multiples of 5 from ${a} to ${b}: ${Math.floor(b/5)} − ${Math.floor((a-1)/5)} = ${five[0]}.`,`Multiples of 25 (an extra 5 each): ${Math.floor(b/25)} − ${Math.floor((a-1)/25)} = ${five[1]}.${five[2]?` Multiples of 125 (a third 5): ${five[2]}.`:''}`,`Number of 5s = ${five.filter(Boolean).join(' + ')} = ${v5}. There are ${v2} factors of 2, which is more, so there are ${v5} zeros.`],{variant:'range',a,b});
    }
    if(!q)throw Error('nx-digits/2 range failed');
   }
   if(v===2){
    const n=r(12,60),evens=r(0,1)===0;
    if(evens){const f5=powerOf(n,5);out(`Euna multiplies the first ${n} even numbers: 2 × 4 × 6 × … × ${2*n}. How many zeros are at the end of the product?`,f5,[`Each even number is 2 times a whole number, so the product is 2^${n} × (1 × 2 × 3 × … × ${n}).`,`Zeros need pairs of 2 and 5. There are at least ${n} 2s, so the 5s decide.`,`5s come only from 1 × 2 × … × ${n}: ${Math.floor(n/5)} multiples of 5${n>=25?` and ${Math.floor(n/25)} multiple${Math.floor(n/25)>1?'s':''} of 25 giving one more 5 each`:''}.`,`So there are ${f5} zeros.`],{variant:'evens',n});}
    else{const f2=powerOf(n,2),f5=n+powerOf(n,5),parts=[2,4,8,16,32].filter(p=>p<=n);out(`Euna multiplies the first ${n} multiples of 5: 5 × 10 × 15 × … × ${5*n}. How many zeros are at the end of the product?`,f2,[`Each factor is 5 times a whole number, so the product is 5^${n} × (1 × 2 × 3 × … × ${n}).`,`Zeros need pairs of 2 and 5. There are at least ${n} 5s, so this time the 2s decide.`,`2s come only from 1 × 2 × … × ${n}: ${parts.map(p=>`${plural(Math.floor(n/p),'multiple')} of ${p}`).join(', ')}, giving ${parts.map(p=>Math.floor(n/p)).join(' + ')} = ${f2} factors of 2.`,`There are ${f5} 5s, which is more, so there are ${f2} zeros.`],{variant:'fives',n});}
   }
  }
  if(form===3){
   const v=r(0,2);
   if(v===0){
    for(let t=0;t<200&&!q;t++){
     const [m1,m2,m3]=pick(crtTriples),rs=[r(0,m1-1),r(0,m2-1),r(0,m3-1)],ms=[m1,m2,m3];
     if(new Set(rs).size===1||new Set(ms.map((m,i)=>m-rs[i])).size===1)continue;
     const L=m1*m2*m3;let x=0;for(let n=1;n<=L;n++)if(n%m1===rs[0]&&n%m2===rs[1]&&n%m3===rs[2]){x=n;break;}
     if(x<20)continue;
     const first=[];for(let n=rs[2]||m3;first.length<12;n+=m3){first.push(n);if(n%m2===rs[1])break;}
     const y=first.at(-1),step=m2*m3,second=[];for(let n=y;second.length<8;n+=step){second.push(n);if(n%m1===rs[0])break;}
     out(`What is the smallest positive whole number that leaves remainder ${rs[0]} when divided by ${m1}, remainder ${rs[1]} when divided by ${m2}, and remainder ${rs[2]} when divided by ${m3}?`,x,[`Start with the largest divisor. Numbers leaving ${rs[2]} when divided by ${m3}: ${first.join(', ')}${first.length>=12?', …':''}.`,`The first of these leaving ${rs[1]} when divided by ${m2} is ${y}. Both conditions then repeat every ${m2} × ${m3} = ${step}.`,`Candidates: ${second.join(', ')}. Test each for remainder ${rs[0]} on division by ${m1}; the first that works is ${x}.`,`Check: ${x} = ${m1} × ${Math.floor(x/m1)} + ${rs[0]} = ${m2} × ${Math.floor(x/m2)} + ${rs[1]} = ${m3} × ${Math.floor(x/m3)} + ${rs[2]}.`],{variant:'remainders',ms,rs});
    }
    if(!q)throw Error('nx-digits/3 crt failed');
   }
   if(v===1){
    const d=r(1,9),m=pick([7,13]),n=r(100,2100),k=Math.floor(n/6),t=n%6,head=rep(d,t),ans=head%m,six=String(d).repeat(6);
    out(`A whole number is written using the digit ${d} exactly ${fmt(n)} times: ${String(d).repeat(4)}…${d} (${fmt(n)} ${DIGIT_WORDS[d]}). What is the remainder when it is divided by ${m}?`,ans,[`${six} = ${d} × 111111, and 111111 = 3 × 7 × 11 × 13 × 37. So any block of six ${DIGIT_WORDS[d]} is a multiple of ${m}.`,`${fmt(n)} = 6 × ${k} + ${t}. Split the number into its first ${t} digit${t===1?'':'s'} and then ${k} blocks of six.`,`Each block of six, wherever it sits, is a multiple of ${m} times a power of 10, so the blocks leave remainder 0.`,t?`The first part is ${head} followed by ${6*k} zeros. Since 1000000 = 999999 + 1 and 999999 = 9 × 111111 is a multiple of ${m}, each 1000000 leaves remainder 1. So this part leaves the same remainder as ${head}.`:`There is no leftover part: the whole number is made of complete blocks of six.`,t?`${head} = ${m} × ${Math.floor(head/m)} + ${ans}. The remainder is ${ans}.`:`The remainder is 0.`],{variant:'repdigit',d,m,n});
   }
   if(v===2){
    if(r(0,1)===0){
     const a=r(2,9),N=100*a-1,ans=900*a+50*a*(a-1);
     out(`Euna writes down every whole number from 1 to ${N} and adds up all the digits she has written. What total does she get?`,ans,[`Write each number with three digits (007, 045, …); the extra zeros do not change the total. The numbers 000 to ${N} form ${a} hundreds: 000–099${a>1?`, 100–199`:''}${a>2?', …':''}.`,`In each hundred, the last two digits run through 00 to 99. Every digit 0–9 appears 10 times in the units place and 10 times in the tens place: (10 + 10) × 45 = 900.`,`Last two digits over ${a} hundreds: ${a} × 900 = ${900*a}.`,`Hundreds digits: ${Array.from({length:a},(_,i)=>i).join(', ')}, each written 100 times: 100 × (${Array.from({length:a},(_,i)=>i).join(' + ')}) = ${50*a*(a-1)}.`,`Total = ${900*a} + ${50*a*(a-1)} = ${fmt(ans)}.`],{variant:'digit-sum',N});
    }else{
     const N=r(120,999),d=r(1,9),places=[1,10,100].map(p=>{const high=Math.floor(N/(10*p)),cur=Math.floor(N/p)%10,low=N%p;return {p,high,cur,low,count:high*p+(cur>d?p:cur===d?low+1:0)};}),ans=places.reduce((s,x)=>s+x.count,0);
     const name=['units','tens','hundreds'];
     out(`Euna writes down every whole number from 1 to ${N}. How many times does she write the digit ${d}?`,ans,[`Count the ${d}s in each place separately.`,...places.map((x,i)=>i===0?`Units place: the units digit is ${d} once in every 10 numbers. There are ${x.high} complete tens below ${x.high*10}${x.cur>=d?`, and ${d} appears once more in ${10*x.high+d}`:''}: ${x.count}.`:i===1?`Tens place: in every complete hundred, the tens digit is ${d} for 10 numbers (${d}0 to ${d}9). ${x.high} complete hundred${x.high===1?'':'s'} give ${10*x.high}${x.cur>d?`, and the last part of the list contains all of ${100*x.high+10*d} to ${100*x.high+10*d+9}: 10 more`:x.cur===d?`, and the last part contains ${100*x.high+10*d} to ${N}: ${x.low+1} more`:''}. Total ${x.count}.`:`Hundreds place: ${x.cur>d?`all of ${d}00 to ${d}99: 100`:x.cur===d?`${d}00 to ${N}: ${x.low+1}`:`no number up to ${N} starts with ${d} as a hundreds digit: 0`}.`),`Total = ${places.map(x=>x.count).join(' + ')} = ${ans}.`],{variant:'digit-count',N,d});
    }
   }
  }
 }
 else if(id==='nx-cycles'){
  if(form===0){
   const v=r(0,1);
   if(v===0){
    const h=r(1,12),m=2*r(1,29),hA=30*(h%12)+m/2,mA=6*m,diff=Math.abs(hA-mA),ans=Math.min(diff,360-diff);
    out(`What is the smaller angle between the hour hand and the minute hand of a clock at ${h}:${pad(m)}?`,ans,[`The minute hand turns 360° in 60 minutes: 6° per minute. At ${m} minutes past, it is ${m} × 6 = ${mA}° round from 12.`,`The hour hand turns 30° each hour, which is 0.5° each minute. At ${h}:${pad(m)} it is ${h%12} × 30 + ${m} × 0.5 = ${hA}° round from 12.`,`The difference is ${Math.max(hA,mA)} − ${Math.min(hA,mA)} = ${diff}°.`,diff>180?`That is more than 180°, so the smaller angle is 360° − ${diff}° = ${ans}°.`:`This is not more than 180°, so the smaller angle is ${ans}°.`],{variant:'angle',h,m},{suffix:'°',figure:{module:'numbers',kind:'nx-clock',h,m}});
   }else{
    const h1=r(1,8),m1=r(0,59),E=2*r(25,150),start=60*h1+m1,end=start+E,h2=Math.floor(end/60),m2=end%60,hour=r(0,1)===0;
    if(h2>11)return make(id,form,seed+1,r);
    const ans=hour?E/2:11*E/2;
    out(`A clock shows ${h1}:${pad(m1)} in the morning. Later the same morning it shows ${h2}:${pad(m2)}. ${hour?'Through how many degrees has the hour hand turned?':'How many more degrees has the minute hand turned than the hour hand?'}`,ans,[`Time passed: from ${h1}:${pad(m1)} to ${h2}:${pad(m2)} is ${E} minutes.`,`The minute hand turns 6° per minute and the hour hand turns 30° per hour, which is 0.5° per minute.`,hour?`Hour hand: ${E} × 0.5 = ${ans}°.`:`Each minute the minute hand gains 6 − 0.5 = 5.5° on the hour hand.`,...(hour?[`Check: ${E} minutes is ${frac(E,60)} of an hour, and ${frac(E,60)} × 30° = ${ans}°.`]:[`Gain = ${E} × 5.5 = ${ans}°. (The minute hand itself turns ${6*E}° and the hour hand ${E/2}°.)`])],{variant:hour?'hour-turn':'gain',start,E},{suffix:'°'});
   }
  }
  if(form===1){
   const v=r(0,2);
   if(v===0){
    const w=r(1,7),N=r(40,1500),later=r(0,1)===0,t=N%7,ans=wrap(later?w+t:w-t);
    out(`Today is a ${day(w)}. ${later?`What day of the week will it be ${fmt(N)} days from today?`:`What day of the week was it ${fmt(N)} days ago?`} ${KEY}`,ans,[`Weekdays repeat every 7 days, so only the remainder on division by 7 matters.`,`${fmt(N)} = 7 × ${Math.floor(N/7)} + ${t}.`,`${Math.floor(N/7)} whole weeks ${later?'later':'earlier'} it is ${day(w)} again; then ${later?'count on':'count back'} ${t} more day${t===1?'':'s'}: ${day(ans)}.`,`${day(ans)} is day ${ans}.`],{variant:later?'after':'before',w,N},{});
   }
   if(v===1){
    const y=r(2025,2032),m1=r(0,8),d1=r(1,monthDays(m1,y)),m2=r(m1+1,11),d2=r(1,monthDays(m2,y)),w1=weekday(y,m1,d1),ans=weekday(y,m2,d2);
    const rest=monthDays(m1,y)-d1,mids=[];for(let m=m1+1;m<m2;m++)mids.push(m);const midDays=mids.reduce((s,m)=>s+monthDays(m,y),0),G=rest+midDays+d2;
    const febNote=mids.includes(1)?` (${y} is ${leap(y)?'':'not '}a leap year, so February has ${monthDays(1,y)} days)`:'';
    out(`${d1} ${MONTHS[m1]} ${y} is a ${day(w1)}. ${y} is ${leap(y)?'':'not '}a leap year. What day of the week is ${d2} ${MONTHS[m2]} ${y}? ${KEY}`,ans,[`Count the days from ${d1} ${MONTHS[m1]} to ${d2} ${MONTHS[m2]}.`,`Rest of ${MONTHS[m1]}: ${monthDays(m1,y)} − ${d1} = ${rest} days.${mids.length?` Full months ${mids.map(m=>`${MONTHS[m]} (${monthDays(m,y)})`).join(', ')}: ${midDays} days${febNote}.`:''} Then ${d2} days into ${MONTHS[m2]}.`,`Total: ${[rest,...(mids.length?[midDays]:[]),d2].join(' + ')} = ${G} days later.`,`${G} = 7 × ${Math.floor(G/7)} + ${G%7}, so it is ${G%7} day${G%7===1?'':'s'} after ${day(w1)}: ${day(ans)}, which is ${ans}.`],{variant:'date',y,m1,d1,m2,d2,w1},{});
   }
   if(v===2){
    const y=r(2025,2032),m1=r(0,7),d1=r(1,monthDays(m1,y)),m2=r(m1+1,Math.min(11,m1+3)),d2=r(1,monthDays(m2,y)),w1=weekday(y,m1,d1),target=r(1,7);
    let G=monthDays(m1,y)-d1;for(let m=m1+1;m<m2;m++)G+=monthDays(m,y);G+=d2;const n=G+1,k=Math.floor(n/7),t=n%7,extra=Array.from({length:t},(_,i)=>wrap(w1+i)),ans=k+extra.filter(x=>x===target).length;
    out(`${d1} ${MONTHS[m1]} ${y} is a ${day(w1)}. ${y} is ${leap(y)?'':'not '}a leap year. How many ${day(target)}s are there from ${d1} ${MONTHS[m1]} to ${d2} ${MONTHS[m2]} ${y}, including both of those dates?`,ans,[`Days from ${d1} ${MONTHS[m1]} to ${d2} ${MONTHS[m2]}, counting both ends: ${G} + 1 = ${n}.`,`${n} = 7 × ${k} + ${t}. Each block of 7 days in a row contains exactly one ${day(target)}: that gives ${k}.`,t?`The ${t} extra day${t===1?' is':'s are'} the last ${t}, starting on ${day(w1)} again (7 × ${k} days after the start): ${extra.map(day).join(', ')}.${extra.includes(target)?` That includes one more ${day(target)}.`:` No ${day(target)} there.`}`:`There are no extra days.`,`Total: ${ans} ${day(target)}s.`],{variant:'count',y,m1,d1,m2,d2,w1,target},{});
   }
  }
  if(form===2){
   const v=r(0,2),[A,Bn]=(()=>{const a=pick(NAMES);let b;do{b=pick(NAMES);}while(b===a);return [a,b];})();
   if(v===0){
    const opp=r(0,1)===0;let t=r(2,9),v1,v2,rel;
    if(opp){rel=10*r(15,40);v1=10*r(Math.ceil(rel/20)+1,Math.floor(rel/10)-3);v2=rel-v1;}else{rel=10*r(2,8);v2=10*r(8,20);v1=v2+rel;t=r(Math.ceil(300/rel),Math.floor(1200/rel));}
    const L=rel*t;
    out(`${A} and ${Bn} start at the same time from the same point on a circular track ${L} m round. ${A} runs at ${v1} m/min and ${Bn} at ${v2} m/min, ${opp?'in opposite directions':'in the same direction'}. After how many minutes do they first meet again?`,t,[opp?`Running in opposite directions, they close the gap together: ${v1} + ${v2} = ${rel} m every minute.`:`Running the same way, ${A} gains ${v1} − ${v2} = ${rel} m every minute.`,opp?`They meet when together they have covered one full lap of ${L} m.`:`They meet when ${A} has gained one full lap of ${L} m.`,`Time = ${L} ÷ ${rel} = ${t} minutes.`,`Check: ${A} runs ${v1*t} m and ${Bn} runs ${v2*t} m; ${opp?`together ${v1*t+v2*t} m`:`the difference is ${v1*t-v2*t} m`}, one lap.`],{variant:opp?'opposite':'same',L,v1,v2},{suffix:'minutes',figure:{module:'numbers',kind:'nx-track',L,opp}});
   }
   if(v===1){
    if(r(0,1)===0){
     const opp=r(0,1)===0;let v1,v2,rel,L,T;
     for(;;){L=50*r(6,12);if(opp){v1=10*r(15,30);v2=10*r(8,20);rel=v1+v2;}else{v2=10*r(8,20);v1=v2+10*r(3,12);rel=v1-v2;}T=r(8,30);if((T*rel)%L)break;}
     const D=T*rel,ans=Math.floor(D/L);
     out(`${A} and ${Bn} start together from the same point on a circular track ${L} m round. ${A} cycles at ${v1} m/min and ${Bn} at ${v2} m/min, ${opp?'in opposite directions':'in the same direction'}. How many times do they meet during the first ${T} minutes? Do not count the start.`,ans,[opp?`In opposite directions, they meet each time their distances add up to another full lap. Together they cover ${v1} + ${v2} = ${rel} m per minute.`:`In the same direction, they meet each time ${A} gains another full lap. ${A} gains ${v1} − ${v2} = ${rel} m per minute.`,`In ${T} minutes that is ${T} × ${rel} = ${D} m.`,`${D} ÷ ${L} = ${ans} remainder ${D%L}: ${ans} complete laps.`,`So they meet ${ans} times.`],{variant:opp?'count-opposite':'count-same',L,v1,v2,T},{figure:{module:'numbers',kind:'nx-track',L,opp}});
    }else{
     let a,b;do{a=r(3,12);b=r(3,12);}while(a===b||lcm(a,b)===Math.max(a,b)||lcm(a,b)>90);const M=lcm(a,b),askA=r(0,1)===0;
     out(`${A} jogs one lap of a park in ${a} minutes and ${Bn} jogs one lap in ${b} minutes, both at steady speeds. They start together at the gate. When they are next at the gate at the same moment, how many laps has ${askA?A:Bn} completed?`,askA?M/a:M/b,[`${A} is at the gate after ${a}, ${2*a}, ${3*a}, … minutes: multiples of ${a}.`,`${Bn} is at the gate after multiples of ${b} minutes.`,`They are there together first after LCM(${a}, ${b}) = ${M} minutes.`,`${askA?A:Bn} has done ${M} ÷ ${askA?a:b} = ${askA?M/a:M/b} laps.`],{variant:'gate',a,b,askA});
    }
   }
   if(v===2){
    const kmh=[36,54,72,90,108],ms=k=>k/3.6,sub=r(0,2);
    if(sub===0){
     const k=pick(kmh),s=ms(k),t=r(15,40),total=s*t;let L=10*r(8,Math.floor(total/10)-6);const P=total-L;
     out(`A train ${L} m long travels at ${k} km/h. How many seconds does it take to pass completely through a station platform ${P} m long, from the moment its front reaches the platform until its back leaves it?`,t,[`${k} km/h = ${k} × 1000 m ÷ 3600 s = ${s} m/s.`,`From front-in to back-out, the front travels the platform plus the whole train: ${P} + ${L} = ${total} m.`,`Time = ${total} ÷ ${s} = ${t} seconds.`],{variant:'platform',L,P,k},{suffix:'seconds'});
    }else{
     const opp=sub===1;let k1,k2;do{k1=pick(kmh);k2=pick(kmh);}while(k1===k2||(!opp&&k1<k2));
     const rel=opp?ms(k1)+ms(k2):ms(k1)-ms(k2),t=r(opp?6:20,opp?20:60),total=rel*t;if(total<200)return make(id,form,seed+1,r);
     const L1=10*r(8,Math.floor(total/10)-8),L2=total-L1;
     const text=opp?`A train ${L1} m long travels at ${k1} km/h. Another train ${L2} m long travels at ${k2} km/h in the opposite direction on a parallel track. How many seconds pass from the moment their fronts meet until their backs pass each other?`:`A train ${L1} m long travels at ${k1} km/h. A slower train ${L2} m long travels at ${k2} km/h in the same direction on a parallel track. The fast train starts to overtake when its front is level with the back of the slow train. How many seconds does it take until its back is level with the front of the slow train?`;
     out(text,t,[`Speeds: ${k1} km/h = ${ms(k1)} m/s and ${k2} km/h = ${ms(k2)} m/s.`,opp?`Moving towards each other, the trains pass at ${ms(k1)} + ${ms(k2)} = ${rel} m/s.`:`The first train catches up at ${ms(k1)} − ${ms(k2)} = ${rel} m/s.`,`To pass completely, the trains must move ${L1} + ${L2} = ${total} m relative to each other.`,`Time = ${total} ÷ ${rel} = ${t} seconds.`],{variant:opp?'trains-opposite':'trains-same',L1,L2,k1,k2},{suffix:'seconds'});
    }
   }
  }
  if(form===3){
   const v=r(0,2);
   if(v===0){
    if(r(0,1)===0){
     const s=pick(workSets),{a,b,T,t}=s,sd=s.s;
     out(`Working together, Mr Tan and Mr Lee can paint a hall in ${T} days. They paint together for ${t} day${t===1?'':'s'}, then Mr Lee leaves. Mr Tan paints the rest alone in ${sd} more day${sd===1?'':'s'}. How many days would Mr Lee take to paint the whole hall alone?`,b,[`Together they paint 1/${T} of the hall per day. In ${t} day${t===1?'':'s'} they paint ${frac(t,T)}.`,`Mr Tan paints the remaining ${frac(T-t,T)} alone in ${sd} day${sd===1?'':'s'}, so he paints ${frac(T-t,T*sd)} of the hall per day.`,`Mr Lee’s rate = 1/${T} − ${frac(T-t,T*sd)} = ${frac(a-T,a*T)} of the hall per day.`,`So Mr Lee alone takes ${b} days.`,`Check: Mr Tan alone takes ${a} days, and 1/${a} + 1/${b} = 1/${T}.`],{variant:'leaves',a,b,T,t,s:sd},{suffix:'days'});
    }else{
     const s=pick(pipeSets),{a,b,h,x}=s;
     out(`Tap A alone fills a tank in ${a} hours and tap B alone fills it in ${b} hours. Tap A is turned on at an empty tank. Some time later tap B is also turned on, and the tank is full exactly ${h} hours after tap A was turned on. For how many hours was tap B on?`,x,[`Tap A runs for all ${h} hours and fills ${h} × 1/${a} = ${frac(h,a)} of the tank.`,`Tap B fills the rest: 1 − ${frac(h,a)} = ${frac(a-h,a)}.`,`Tap B fills 1/${b} per hour, so it needs ${frac(a-h,a)} ÷ 1/${b} = ${frac(a-h,a)} × ${b} = ${x} hours.`,`Check: ${frac(h,a)} + ${frac(x,b)} = 1.`],{variant:'joins',a,b,h},{suffix:'hours'});
    }
   }
   if(v===1){
    for(let t=0;t<300&&!q;t++){
     const len=r(29,31),extra=len-28,clues=[],used=new Set();const nClues=r(2,3);
     while(clues.length<nClues){const w=r(1,7);if(used.has(w))continue;used.add(w);clues.push({w,five:r(0,1)===0});}
     const fits=s=>clues.every(c=>((c.w-s+7)%7<extra)===c.five);
     const ok=[1,2,3,4,5,6,7].filter(fits);if(ok.length!==1)continue;
     const s=ok[0],ask=r(0,1)===0?1:pick([10,15,20,25]),ans=wrap(s+ask-1);
     const list=clues.map(c=>`${c.five?'five':'exactly four'} ${day(c.w)}s`);
     out(`A month has ${len} days. It has ${list.slice(0,-1).join(', ')} and ${list.at(-1)}. What day of the week is the ${ord(ask)} of the month? ${KEY}`,ans,[`${len} days = 4 weeks + ${extra} day${extra===1?'':'s'}. The weekdays of the 1st${extra>1?` to the ${ord(extra)}`:''} appear five times; every other weekday appears exactly four times.`,`Test each possible weekday for the 1st. The “five” days must all be among the five-times days, and the “four” days must not be.`,...[1,2,3,4,5,6,7].map(w=>`1st on a ${day(w)}: five-times day${extra===1?'':'s'} ${Array.from({length:extra},(_,i)=>day(w+i)).join(', ')} — ${fits(w)?'fits every clue':'fails'}.`),`The 1st is a ${day(s)}.${ask>1?` The ${ord(ask)} is ${ask-1} days later: ${(ask-1)%7} more than whole weeks, so it is a ${day(ans)}.`:''} Answer: ${ans}.`],{variant:'month',len,clues,ask},{});
    }
    if(!q)throw Error('nx-cycles/3 month failed');
   }
   if(v===2){
    const kind=pick(['together','right','straight']);let h1,h2;do{h1=r(1,8);h2=r(h1+3,11);}while(false);
    const first=kind==='together'?0:kind==='right'?180:360,step=kind==='together'?720:kind==='right'?360:720;
    const lo=660*h1,hi=660*h2,list=[];for(let n=first;n<hi;n+=step)if(n>lo)list.push(n);const ans=list.length;
    const what=kind==='together'?'pointing in exactly the same direction':kind==='right'?'at right angles to each other':'pointing in exactly opposite directions';
    out(`How many times are the hands of a clock ${what} after ${h1} o’clock and before ${h2} o’clock on the same afternoon? Do not count ${h1} o’clock or ${h2} o’clock themselves.`,ans,[`Measure time in minutes after 12 o’clock. The minute hand gains 6° − 0.5° = 5.5° on the hour hand each minute: 11° every 2 minutes.`,kind==='together'?`The hands are together each time the gain is 0°, 360°, 720°, … . That happens every 360 ÷ 5.5 = 720/11 minutes: at 0, 720/11, 1440/11, … minutes.`:kind==='right'?`The hands are at right angles when the gain is 90°, 270°, 450°, … (every 180°). That happens at 180/11 minutes and then every 360/11 minutes: 180/11, 540/11, 900/11, … .`:`The hands are opposite when the gain is 180°, 540°, 900°, … (every 360°). That happens at 360/11 minutes and then every 720/11 minutes: 360/11, 1080/11, … .`,`${h1} o’clock is ${60*h1} = ${lo}/11 minutes and ${h2} o’clock is ${60*h2} = ${hi}/11 minutes.`,`Numerators strictly between ${lo} and ${hi}: ${list.length>6?`${list.slice(0,3).join(', ')}, …, ${list.slice(-2).join(', ')}`:list.join(', ')}.`,`That is ${ans} time${ans===1?'':'s'}.`],{variant:'clock-'+kind,h1,h2,kind});
   }
  }
 }
 else if(id==='nx-extremes'){
  if(form===0){
   const v=r(0,2),k=r(3,5),cols=COLOURS.slice(0,k),ctx=pick([['socks','a drawer','sock'],['marbles','a bag','marble'],['sweets','a jar','sweet']]);
   let counts=cols.map(()=>r(3,12));const desc=()=>cols.map((c,i)=>`${counts[i]} ${c}`).join(', ').replace(/, ([^,]*)$/,' and $1');const total=()=>counts.reduce((s,x)=>s+x,0);
   if(v===0){
    if(r(0,1)===0){
     out(`${ctx[1][0].toUpperCase()+ctx[1].slice(1)} holds ${desc()} ${ctx[0]}. Without looking, what is the least number of ${ctx[0]} you must take to be sure of getting two of the same colour?`,k+1,[`Imagine the unluckiest case: every ${ctx[2]} so far is a different colour.`,`There are ${k} colours, so you could take ${k} ${ctx[0]} with no two the same.`,`The next ${ctx[2]} must match one of them. So ${k+1} is enough, and ${k} is not.`],{variant:'pair',counts},{});
    }else{
     const c=r(0,k-1),ans=total()-counts[c]+2;
     out(`${ctx[1][0].toUpperCase()+ctx[1].slice(1)} holds ${desc()} ${ctx[0]}. Without looking, what is the least number of ${ctx[0]} you must take to be sure of getting two ${cols[c]} ${ctx[0]}?`,ans,[`Unluckiest case: you take every ${ctx[2]} that is not ${cols[c]} first: ${total()} − ${counts[c]} = ${total()-counts[c]}.`,`Even then you need two ${cols[c]} ones.`,`So you need ${total()-counts[c]} + 2 = ${ans}. With one fewer, you might have only one ${cols[c]} ${ctx[2]}.`],{variant:'two-of-colour',counts,c},{});
    }
   }
   if(v===1){
    for(let t=0;t<200&&!q;t++){
     counts=cols.map(()=>r(2,12));const n=r(3,6);if(Math.max(...counts)<n||!counts.some(x=>x<n-1))continue;
     const worst=counts.map(x=>Math.min(x,n-1)),ans=worst.reduce((s,x)=>s+x,0)+1;
     out(`${ctx[1][0].toUpperCase()+ctx[1].slice(1)} holds ${desc()} ${ctx[0]}. Without looking, what is the least number of ${ctx[0]} you must take to be sure of getting ${n} of the same colour?`,ans,[`Unluckiest case: take as many as possible while every colour has fewer than ${n}.`,`That means at most ${n-1} of each colour, but a colour with fewer than ${n-1} can give only what it has: ${cols.map((c,i)=>`${c} ${worst[i]}`).join(', ')}.`,`That is ${worst.join(' + ')} = ${ans-1} ${ctx[0]} without ${n} of a colour.`,`The next ${ctx[2]} must be a colour that already has ${n-1}, so ${ans} is the least number.`],{variant:'n-same',counts,n},{});
    }
    if(!q)throw Error('nx-extremes/0 failed');
   }
   if(v===2){
    const need=r(1,2),mi=Math.min(...counts),ans=total()-mi+need;
    out(`${ctx[1][0].toUpperCase()+ctx[1].slice(1)} holds ${desc()} ${ctx[0]}. Without looking, what is the least number of ${ctx[0]} you must take to be sure of getting at least ${need===1?'one':'two'} of every colour?`,ans,[`Unluckiest case: one colour keeps missing. The worst colour to miss is the one with the fewest ${ctx[0]}, because then you can take all the others first.`,`All the other colours together: ${total()} − ${mi} = ${total()-mi}.`,`After those, you still need ${need===1?'one':'two'} of the last colour: ${total()-mi} + ${need} = ${ans}.`,`With ${ans-1} you might still be short of the colour with only ${mi}, so ${ans} is the least.`],{variant:'every-colour',counts,need},{});
   }
  }
  if(form===1){
   const v=r(0,2);
   if(v===0){
    const S=r(10,24),ans=bestSplit(S),threes=S%3===0?S/3:S%3===1?(S-4)/3:(S-2)/3,rest=S%3===0?'':S%3===1?' and two 2s':' and one 2';
    out(`${S} is split into whole numbers that add up to ${S} (you choose how many parts). The parts are multiplied together. What is the largest possible product?`,ans,[`A part of 1 is wasteful: it adds to the sum but multiplies by 1.`,`A part of 5 or more should be split: for example 5 → 2 + 3 (product 6 > 5), and in general n → 2 + (n − 2) gives 2(n − 2) > n when n ≥ 5. A 4 can be 2 + 2 with the same product.`,`So only 2s and 3s are needed, and three 2s (product 8) are worse than two 3s (product 9): use at most two 2s.`,`${S} = ${threes} × 3${S%3===0?'':S%3===1?' + 2 + 2':' + 2'}: ${threes} threes${rest}.`,`Largest product = ${S%3===0?`3^${threes}`:S%3===1?`3^${threes} × 4`:`3^${threes} × 2`} = ${fmt(ans)}.`],{variant:'any-parts',S});
   }
   if(v===1){
    if(r(0,1)===0){
     const S=r(14,45),a=Math.floor(S/3),e=S-3*a,parts=[a,a,a].map((x,i)=>x+(i>=3-e?1:0)),ans=parts.reduce((p,x)=>p*x,1);
     out(`Three whole numbers add up to ${S}. What is the largest possible value of their product?`,ans,[`If two of the numbers differ by 2 or more, move 1 from the larger to the smaller: x(y) with y ≥ x + 2 becomes (x + 1)(y − 1) = xy + (y − x − 1), which is bigger.`,`So in the best case the three numbers differ by at most 1.`,`${S} ÷ 3 = ${a} remainder ${e}, so the numbers are ${parts.join(', ')}.`,`Largest product = ${parts.join(' × ')} = ${fmt(ans)}.`],{variant:'three-parts',S});
    }else{
     const S=r(18,46),b=Math.floor((S-6)/4),e=S-(4*b+6),parts=[b,b+1,b+2,b+3].map((x,i)=>x+(i>=4-e?1:0)),ans=parts.reduce((p,x)=>p*x,1);
     if(b<1)return make(id,form,seed+1,r);
     out(`Four different whole numbers add up to ${S}. What is the largest possible value of their product?`,ans,[`The numbers must be different, so they cannot all be equal. The product is largest when they are as close together as possible.`,`Four consecutive numbers b, b + 1, b + 2, b + 3 add up to 4b + 6. The largest b with 4b + 6 ≤ ${S} is ${b}: ${b} + ${b+1} + ${b+2} + ${b+3} = ${4*b+6}.`,e?`${e} more must be added. Add 1 to each of the largest ${e} number${e===1?'':'s'}, which keeps them different and close: ${parts.join(', ')}.`:`This uses exactly ${S}: ${parts.join(', ')}.`,`Largest product = ${parts.join(' × ')} = ${fmt(ans)}.`],{variant:'four-different',S});
    }
   }
   if(v===2){
    const sub=r(0,2);
    if(sub<2){
     const P=2*r(9,40),half=P/2,a=Math.floor(half/2),b=half-a,max=sub===0;
     out(`A rectangle has a perimeter of ${P} cm. Its length and breadth are whole numbers of centimetres. What is its ${max?'largest':'smallest'} possible area?`,max?a*b:half-1,max?[`Length + breadth = ${P} ÷ 2 = ${half} cm.`,`For a fixed sum, the product is largest when the two numbers are as close as possible.`,`${half} = ${b} + ${a}${a===b?' (a square)':''}.`,`Largest area = ${b} × ${a} = ${a*b} cm².`,`Check a neighbour: ${b+1} × ${a-1} = ${(b+1)*(a-1)} cm², which is smaller.`]:[`Length + breadth = ${P} ÷ 2 = ${half} cm.`,`For a fixed sum, the product is smallest when the two numbers are as far apart as possible.`,`The breadth must be at least 1 cm, so take ${half-1} cm by 1 cm.`,`Smallest area = ${half-1} × 1 = ${half-1} cm².`],{variant:max?'rect-max':'rect-min',P},{suffix:'cm²'});
    }else{
     const F=r(20,70),best=(()=>{let b=0,bx=0;for(let x=1;2*x<F;x++){const A=x*(F-2*x);if(A>b){b=A;bx=x;}}return {b,bx};})(),xs=[best.bx-1,best.bx,best.bx+1].filter(x=>x>=1&&2*x<F);
     out(`A farmer builds a rectangular pen against a long straight wall. The wall forms one side, and ${F} m of fencing makes the other three sides. Each side is a whole number of metres. What is the largest possible area of the pen?`,best.b,[`Let each side touching the wall be x m. The side opposite the wall is then ${F} − 2x m, and the area is x × (${F} − 2x).`,`2x and ${F} − 2x add up to ${F}. Their product is largest when they are as equal as possible, so x should be near ${F} ÷ 4.`,`Try x near there: ${xs.map(x=>`x = ${x}: ${x} × ${F-2*x} = ${x*(F-2*x)}`).join('; ')}.`,`Largest area = ${best.b} m².`],{variant:'wall',F},{suffix:'m²'});
    }
   }
  }
  if(form===2){
   const v=r(0,2);
   if(v===0){
    for(let t=0;t<200&&!q;t++){
     const coins=pick(coinSystems),N=r(12,60),[c1,c2,c3]=coins,best=fewestCoins(N,coins);if(greedyCoins(N,coins)===best)continue;
     const rows=[];for(let k=Math.floor(N/c3);k>=0;k--){const R=N-k*c3,n2=Math.floor(R/c2),n1=R%c2;rows.push({k,R,n2,n1,total:k+n2+n1});}
     if(rows.length>7)continue;
     out(`In a board game, coins are worth ${c1}, ${c2} and ${c3} points. Euna must pay exactly ${N} points. What is the least number of coins she can use?`,best,[`Taking the biggest coin first is not always best, so list every possible number of ${c3}-point coins.`,`For each choice, pay the rest with as many ${c2}-point coins as possible and then ${c1}-point coins (with only ${c2}s and ${c1}s left, that is best).`,rows.map(x=>`${x.k} × ${c3} + ${x.n2} × ${c2} + ${x.n1} × ${c1}: ${x.total} coins`).join('; ')+'.',`The least is ${best} coins. (Greedy, biggest first, would use ${greedyCoins(N,coins)}.)`],{variant:'coins',coins,N});
    }
    if(!q)throw Error('nx-extremes/2 coins failed');
   }
   if(v===1){
    for(let t=0;t<300&&!q;t++){
     const items=pick([['pen','file'],['sticker','badge'],['eraser','notebook'],['bookmark','postcard']]),p=r(2,6),pq=r(p+1,11);if(gcd(p,pq)!==1)continue;
     const N=r(30,80),sols=[];for(let x=1;x*p<N;x++){const rest=N-x*p;if(rest%pq===0&&rest>0)sols.push([x,rest/pq]);}if(sols.length<2)continue;
     const most=r(0,1)===0,ans=most?Math.max(...sols.map(s=>s[0]+s[1])):Math.min(...sols.map(s=>s[0]+s[1]));
     out(`${items[0][0].toUpperCase()+items[0].slice(1)}s cost S$${p} each and ${items[1]}s cost S$${pq} each. Euna spends exactly S$${N} and buys at least one of each. What is the ${most?'greatest':'least'} total number of items she can buy?`,ans,[`Let x be the number of ${items[0]}s and y the number of ${items[1]}s: ${p}x + ${pq}y = ${N}, with x and y at least 1.`,`List x = 1, 2, 3, … and keep those where S$${N} − S$${p}x is a multiple of S$${pq}.`,`Possible ways: ${sols.map(([x,y])=>`${plural(x,items[0])} + ${plural(y,items[1])} (${x+y} items)`).join('; ')}.`,`The ${most?'greatest':'least'} total is ${ans} items.`],{variant:most?'spend-most':'spend-least',p,pq,N,items},{});
    }
    if(!q)throw Error('nx-extremes/2 spend failed');
   }
   if(v===2){
    for(let t=0;t<300&&!q;t++){
     const W=r(18,40),a=r(3,7),b=r(a+1,11),u=r(3,12),w2=r(u+1,30);
     const rows=[];for(let y=0;y*b<=W;y++){const x=Math.floor((W-y*b)/a);rows.push({y,x,val:x*u+y*w2,wt:x*a+y*b});}
     const best=Math.max(...rows.map(x=>x.val));if(rows.filter(x=>x.val===best).length!==1||rows.length>7||rows.length<3)continue;
     const ratioA=u/a,ratioB=w2/b,greedy=ratioB>=ratioA?rows.at(-1).val:rows[0].val;if(greedy===best)continue;
     out(`A bag can carry at most ${W} kg. Bricks of type A weigh ${a} kg and are worth S$${u} each. Bricks of type B weigh ${b} kg and are worth S$${w2} each. Any number of each type may be packed. What is the greatest total value, in dollars, that fits in the bag?`,best,[`List each possible number of type B bricks, and fill the rest of the weight with as many type A bricks as fit.`,rows.map(x=>`${x.y} B + ${x.x} A: ${x.wt} kg, S$${x.val}`).join('; ')+'.',`Packing the brick with the better value per kilogram as fully as possible gives only S$${greedy}, because some weight is wasted.`,`The greatest total value is S$${best}.`],{variant:'pack',W,a,b,u,w2},{});
    }
    if(!q)throw Error('nx-extremes/2 pack failed');
   }
  }
  if(form===3){
   const v=r(0,3);
   if(v===0){
    for(let t=0;t<300&&!q;t++){
     const m=pick([4,8,11,12,15,25]),S=r(13,30);if((m===12||m===15)&&S%3)continue;
     const k=Math.ceil(S/9),cands=[];let found=0;for(let n=10**(k-1);n<10**(k+2)&&!found;n++){if(digitSum(n)!==S)continue;cands.push(n);if(n%m===0)found=n;}
     if(!found||cands.length<3||cands.length>8)continue;
     const rule={4:'its last two digits make a multiple of 4',8:'its last three digits make a multiple of 8',11:'its alternating digit totals differ by a multiple of 11',12:'it is divisible by 3 (true here, since the digit sum is a multiple of 3) and by 4',15:'it ends in 0 or 5 (the digit sum is already a multiple of 3)',25:'it ends in 00, 25, 50 or 75'}[m];
     out(`What is the smallest whole number whose digits add up to ${S} and which is divisible by ${m}?`,found,[`Each digit is at most 9, so at least ${k} digits are needed (${plural(k-1,'digit')} give at most ${9*(k-1)}).`,`A number is divisible by ${m} when ${rule}.`,`Numbers with digit sum ${S}, from the smallest upwards: ${cands.join(', ')}.`,`The first one that passes the test is ${found}.`],{variant:'digit-sum-divisor',S,m});
    }
    if(!q)throw Error('nx-extremes/3 digits failed');
   }
   if(v===1){
    const S=r(12,40),subsets=[];for(let mask=1;mask<1024;mask++){const ds=[];for(let d=0;d<10;d++)if(mask>>d&1)ds.push(d);if(ds.reduce((s,x)=>s+x,0)!==S)continue;if(ds.length===1&&ds[0]===0)continue;subsets.push(ds.sort((x,y)=>y-x));}
    const val=ds=>Number(ds.join('')),best=subsets.reduce((b,ds)=>ds.length>b.length||(ds.length===b.length&&val(ds)>val(b))?ds:b,[]),n=best.length;
    let mincount=0,acc=0;while(acc+mincount<=S&&mincount<10){acc+=mincount;mincount++;}
    const lines=[];let rem=S,avail=[9,8,7,6,5,4,3,2,1,0];for(let i=0;i<n;i++){const left=n-1-i,d=best[i];lines.push(`Digit ${i+1}: ${d}${left?` (leaving ${rem-d} for ${left} smaller different digit${left===1?'':'s'})`:''}`);rem-=d;}
    out(`What is the largest whole number whose digits are all different and add up to ${S}?`,val(best),[`More digits make a bigger number, so use as many digits as possible. The smallest different digits are 0, 1, 2, …: 0 + 1 + … + ${n-1} = ${n*(n-1)/2} ≤ ${S}${n<10?`, but adding ${n} would give ${n*(n+1)/2} > ${S}`:''}. So the number has ${n} digits.`,`Now make the first digit as large as possible, then the next, while the remaining digits can still be different and smaller and make up the rest of the sum.`,lines.join('; ')+'.',`The largest number is ${val(best)}.`],{variant:'distinct-digits',S});
   }
   if(v===2){
    const d=pick([5,6,7,8,9]),N=r(18,40),cls=Array.from({length:d},(_,k)=>Array.from({length:N},(_,i)=>i+1).filter(x=>x%d===k).length);
    const lines=[],picks=[];for(let k=1;2*k<d;k++){const big=Math.max(cls[k],cls[d-k]);picks.push(big);lines.push(`remainders ${k} and ${d-k}: sizes ${cls[k]} and ${cls[d-k]}, keep ${big}`);}
    const zero=Math.min(1,cls[0]),half=d%2===0?Math.min(1,cls[d/2]):0,safe=picks.reduce((s,x)=>s+x,0)+zero+half,ans=safe+1;
    out(`Whole numbers are chosen from 1 to ${N}, all different. What is the least number of them that must be chosen to be sure that two of the chosen numbers add up to a multiple of ${d}?`,ans,[`Sort 1 to ${N} by remainder on division by ${d}. Two numbers add to a multiple of ${d} exactly when their remainders add to 0 or ${d}.`,`Remainder pairs that clash: ${lines.join('; ')}. From each clashing pair of groups you can safely take only one group, so take the bigger one.`,`Remainder 0 clashes with itself: at most ${zero} number.${d%2===0?` Remainder ${d/2} clashes with itself too: at most ${half}.`:''}`,`So you can choose ${picks.join(' + ')} + ${zero}${d%2===0?` + ${half}`:''} = ${safe} numbers with no such pair.`,`One more number must clash with one already chosen, so ${ans} is the least.`],{variant:'pair-sum',d,N});
   }
   if(v===3){
    if(r(0,1)===0){
     const L=r(2,6),C=r(1,4),ans=L*(L-1)/2+2*L*C+C*(C-1);
     out(`${L} straight lines and ${C} circle${C===1?'':'s'} are drawn on a page. What is the greatest possible number of points where two of them cross?`,ans,[`Two straight lines cross at most once: ${L} × ${L-1} ÷ 2 = ${L*(L-1)/2} pairs of lines, ${L*(L-1)/2} points.`,`A line and a circle cross at most twice: ${L} × ${C} pairs, ${2*L*C} points.`,C>1?`Two circles cross at most twice: ${C} × ${C-1} ÷ 2 = ${C*(C-1)/2} pairs, ${C*(C-1)} points.`:`With one circle there are no circle–circle crossings.`,`${C>1?'If no two lines are parallel, every line cuts every circle, every two circles cross, and no three meet at one point':'If no two lines are parallel, every line cuts the circle, and no three meet at one point'}, all of these happen together: ${L*(L-1)/2} + ${2*L*C} + ${C*(C-1)} = ${ans}.`],{variant:'crossings',L,C});
    }else{
     const C=r(3,9),ans=C*(C-1)+2,gains=Array.from({length:C},(_,i)=>i===0?1:2*i);
     out(`${C} circles are drawn on a page. Into at most how many regions can they divide the page (counting the outside as one region)?`,ans,[`One circle makes 2 regions: inside and outside.`,`A new circle that crosses each earlier circle twice, at new points, is cut into as many arcs as it has crossing points. Each arc splits one region into two.`,`The k-th circle can cross the ${C>1?'earlier':''} k − 1 circles at 2(k − 1) points, adding 2(k − 1) regions: gains ${gains.slice(1).join(', ')}.`,`Regions = 2 + ${gains.slice(1).join(' + ')} = ${ans}.`],{variant:'circle-regions',C});
    }
   }
  }
 }
 return q;
}

/* ---------- Quick checks: the one-step relationship for each form, never the answer ---------- */
const qc=(prompt,choices,correct,explain)=>({prompt,choices,correct,explain});
const quickChecks={
 'nx-digits':[
  qc('Which tests can be done using only the digits of a number?',['9: digit sum; 11: alternating digit totals; 4: last two digits','9: last digit; 11: first digit; 4: digit sum','None of them: you must divide'],0,'Divisibility by 9 depends on the digit sum, by 11 on the difference of alternate digit totals, and by 4 on the last two digits. For 36 or 72, combine 4 or 8 with 9.'),
  qc('The last digits of 3, 3², 3³, 3⁴, … are 3, 9, 7, 1, 3, … . What decides the last digit of 3 to a large power?',['The remainder when the power is divided by 4','The first digit of the power','Whether the power is odd'],0,'The last digits repeat in a cycle of 4, so only the position in the cycle matters.'),
  qc('A zero at the end of a product comes from a factor 10. Which prime is usually in short supply?',['2','5','3'],1,'10 = 2 × 5. Even numbers are common, multiples of 5 are rarer, so count the 5s (unless every factor is a multiple of 5).'),
  qc('With a very long number, or a long list of numbers, what should you look for first?',['A block or pattern that repeats','The largest digit','The first digit only'],0,'Remainder conditions repeat with the divisor, six repeated digits make a multiple of 7 and 13, and each hundred numbers has the same last-two-digit pattern.')
 ],
 'nx-cycles':[
  qc('In one minute, how far does each hand of a clock turn?',['Minute hand 6°, hour hand 0.5°','Minute hand 1°, hour hand 1/12°','Minute hand 6°, hour hand 30°'],0,'The minute hand turns 360° in 60 minutes. The hour hand turns 30° in 60 minutes.'),
  qc('Weekdays repeat every 7 days. What do you do with a number of days?',['Find its remainder on division by 7','Divide it by 30','Multiply it by 7'],0,'Whole weeks bring you back to the same weekday, so only the leftover days move it.'),
  qc('Two people move towards each other, or round a track in opposite directions. At what rate does the gap close?',['The sum of their speeds','The difference of their speeds','The faster speed only'],0,'In opposite directions the speeds add. In the same direction, the faster one gains at the difference of the speeds.'),
  qc('A situation changes partway, or has several possible starting points. What should you do first?',['Split it into stages or cases and handle each one','Average the different situations','Ignore the change'],0,'Work out what happens in each stage (or each case) separately, then combine or compare.')
 ],
 'nx-extremes':[
  qc('To be sure of something when picking without looking, which case should you imagine?',['The luckiest case','The unluckiest case','The average case'],1,'Take as many as possible without reaching the goal. One more then forces it.'),
  qc('Two numbers have a fixed sum. When is their product largest?',['When they are as close as possible','When one is as large as possible','When one of them is 1'],0,'Moving 1 from the larger to the smaller (when they differ by 2 or more) always increases the product.'),
  qc('Why must you list cases instead of always taking the biggest coin, or the best-value item, first?',['The greedy choice can miss the best combination','The biggest coin is never used','Listing is only for checking'],0,'Greedy choices can leave an awkward remainder. An organised list compares every possibility.'),
  qc('An extreme answer needs two things. What are they?',['A reason nothing can do better, and an example that reaches it','Two different examples','A guess and a check'],0,'A bound shows no case can beat the answer; a construction shows the answer is actually possible.')
 ]
};

/* ---------- exam-style monochrome figures ---------- */
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const f=x=>Number(x.toFixed(2));
const T=(x,y,t,extra='')=>`<text x="${f(x)}" y="${f(y)}" ${extra}>${esc(t)}</text>`;
function frame(key,alt,body,view='0 0 480 320'){
 return `<svg class="entrance-figure" viewBox="${view}" role="img" aria-labelledby="${key}-title" xmlns="http://www.w3.org/2000/svg"><title id="${key}-title">${esc(alt)}</title><g fill="none" stroke="#222" stroke-width="1.6" stroke-linejoin="round">${body}</g><style>.entrance-figure text{fill:#222;stroke:none;font:19px Georgia,serif;text-anchor:middle}</style></svg>`;
}
function diagram(spec,id='figure',help=false){
 const key='nx-'+String(id).replace(/[^a-zA-Z0-9_-]/g,'').slice(0,90);
 if(spec.kind==='nx-clock'){
  const c=[240,160],R=130,pt=(deg,rad)=>[c[0]+rad*Math.sin(deg*Math.PI/180),c[1]-rad*Math.cos(deg*Math.PI/180)];
  let b=`<circle cx="${c[0]}" cy="${c[1]}" r="${R}"/>`;
  for(let i=0;i<60;i++){const p=pt(6*i,R),q2=pt(6*i,i%5?R-6:R-14);b+=`<line x1="${f(p[0])}" y1="${f(p[1])}" x2="${f(q2[0])}" y2="${f(q2[1])}" stroke-width="${i%5?1:2}"/>`;}
  for(let n=1;n<=12;n++){const p=pt(30*n,R-34);b+=T(p[0],p[1]+7,String(n));}
  const hA=30*(spec.h%12)+spec.m/2,mA=6*spec.m,hp=pt(hA,R*0.5),mp=pt(mA,R*0.82);
  b+=`<line x1="${c[0]}" y1="${c[1]}" x2="${f(hp[0])}" y2="${f(hp[1])}" stroke-width="6" stroke-linecap="round"/><line x1="${c[0]}" y1="${c[1]}" x2="${f(mp[0])}" y2="${f(mp[1])}" stroke-width="3" stroke-linecap="round"/><circle cx="${c[0]}" cy="${c[1]}" r="5" fill="#222"/>`;
  if(help){const a1=Math.min(hA,mA),a2=Math.max(hA,mA),big=a2-a1>180,s1=big?a2:a1,s2=big?a1+360:a2,p1=pt(s1,40),p2=pt(s2,40);b+=`<path d="M${f(p1[0])} ${f(p1[1])}A40 40 0 ${s2-s1>180?1:0} 1 ${f(p2[0])} ${f(p2[1])}" stroke-dasharray="5 3"/>`;}
  return frame(key,`Clock face showing ${spec.h}:${pad(spec.m)}; the short hour hand and the long minute hand start at the centre.`,b);
 }
 if(spec.kind==='nx-track'){
  const c=[240,150],R=110,P=(rho,deg)=>[c[0]+rho*Math.cos(deg*Math.PI/180),c[1]+rho*Math.sin(deg*Math.PI/180)];
  const arc=(rho,a1,a2)=>{const p=P(rho,a1),q2=P(rho,a2);return `<path d="M${f(p[0])} ${f(p[1])}A${rho} ${rho} 0 0 ${a2>a1?1:0} ${f(q2[0])} ${f(q2[1])}" stroke-width="1.4" marker-end="url(#${key}-arr)"/>`;};
  let b=`<defs><marker id="${key}-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#222" stroke="none"/></marker></defs>`;
  b+=`<circle cx="${c[0]}" cy="${c[1]}" r="${R}" stroke-width="2.4"/><line x1="${c[0]}" y1="${c[1]+R-10}" x2="${c[0]}" y2="${c[1]+R+10}" stroke-width="3"/>`;
  b+=arc(R+18,95,25);
  b+=spec.opp?arc(R-18,85,155):arc(R-18,95,35);
  b+=T(c[0],c[1]+R+34,'Start')+T(c[0],c[1]+6,`${spec.L} m round`);
  return frame(key,`Circular track ${spec.L} m round with a marked start point; ${spec.opp?'arrows show the two runners going in opposite directions':'both runners go the same way round'}.`,b,'0 0 480 320');
 }
 return '';
}

const api={units,make,diagram,quickChecks,cycle,crtTriples,powerMods,coinSystems,workSets,pipeSets,fewestCoins,greedyCoins,bestSplit,weekday};
root.MochiDSA_numbers=api;
if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
