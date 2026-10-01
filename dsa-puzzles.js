/* DSA challenge puzzles: logic and strategy, seeing in 3D, and counting cleverly.
   Original seeded question types; no textbook, competition or booklet problem is reproduced.
   Every answer is a whole number. The tests re-solve each question by brute force. */
(function(root){
'use strict';
const unit=(id,strand,title,foundation,prerequisites,ideas,check,why)=>({id,strand,title,foundation,benchmarkPages:'Challenge extension (logic, spatial and counting puzzles)',extension:true,prerequisites,ideas,check,why});
const units=[
 unit('pz-logic','logic','Challenge · Logic and strategy','m-proof',['cases','invariants'],[
  'When some statements are true and some are false, do not trust any single speaker. Assume each possible answer in turn (each suspect, or each possible number of liars) and mark every statement true or false in that case. Keep only the case that matches the condition, such as “exactly one statement is true”. If two cases survive, the puzzle needs more information.',
  'For a strategy game, work backwards from the end. A position is losing for the player about to move if every move leads to a winning position for the other player, and winning if at least one move leads to a losing position. In “take 1 to k”, the losing positions are the multiples of k + 1, because you can always answer a take of t with k + 1 − t.',
  'Count what each event produces. A weighing has three results, so k weighings can tell apart at most 3 × 3 × … × 3 (k times) cases. Every game in a tournament gives out a fixed number of wins or points, so totals give limits: m players share m(m − 1)/2 wins among themselves, plus whatever they win against the rest. A limit together with an example that reaches it settles a “greatest” or “fewest” question.'
 ],['Exactly one of three statements is true. If Chen took it, two of the statements would be true. What can you conclude?',['Chen took it','Chen did not take it','Chen is lying'],1,'That case breaks the condition “exactly one is true”, so it is rejected. Try the next suspect.'],'Turn the puzzle into a list of cases or positions, test each one against every condition, and prove a best value with a limit and an example.'),
 unit('pz-space','geometry','Challenge · Seeing in 3D and counting shapes','m-solids',['spatial','volume','counting'],[
  'For a painted cube cut into small cubes, sort the small cubes by position: corners (3 painted faces), edge cubes between corners (2), the middles of the faces (1) and the inside (0). Between two corners there are n − 2 cubes. If some faces are not painted, look at the block one horizontal layer at a time: every layer is a rectangle with 4 corners, edge cubes and middle cubes.',
  'A front, side or top view shows only the tallest tower in each line. For the greatest number of cubes, every square can hold the smaller of its column’s height and its row’s height. For the fewest, every column and every row still needs one tower of its full height, and one tower can serve a column and a row that need the same height. For nets, fold around one face and see which faces meet it; two squares in a straight line with one square between them fold to opposite faces.',
  'To count shapes in a figure, sort them by how they are built. A triangle made from lines through one corner and lines parallel to the opposite side always uses two lines through that corner and one parallel line. A tilted square on a dot grid fits snugly inside an upright box, and a box of side s holds exactly s squares. Folding paper in half doubles the layers, so a cut or a hole is repeated on every layer.'
 ],['A 4 cm cube is painted and cut into 1 cm cubes. How many small cubes lie along one edge, not counting the two corners?',['4','2','3'],1,'Each edge has 4 small cubes; removing the 2 corner cubes leaves 4 − 2 = 2.'],'Sort cubes, towers and shapes by type before counting, then check that the parts add up to the whole.'),
 unit('pz-count','number','Challenge · Counting cleverly','m-proof',['counting','digits'],[
  'For routes that move only right or up, write at each point the number of ways to reach it: the sum of the numbers at the point to its left and the point below it. A closed point gets 0. A route that must pass through P splits into “A to P” and then “P to B”, so multiply the two counts.',
  'Deal with restrictions first. Glue people who must stand together into one block, then arrange the blocks and multiply by the orders inside the block. Count “must not stand together” as all orders minus the orders where they are together. Fill a restricted place (a first digit that cannot be 0, a last digit that must be even) before the free places, and split into cases when one choice changes another.',
  'When “at least one” is awkward, count the opposite and subtract from the total. For three overlapping groups, add the group sizes, subtract each overlap of two, and add back those in all three. When paying an amount with coins, list the cases in order of the largest coin, so that no way is missed or counted twice.'
 ],['Routes go only right or up. The point to the left of P can be reached in 4 ways and the point below P in 6 ways. How many ways reach P?',['10','24','6'],0,'Every route to P arrives either from the left or from below, never both, so add: 4 + 6 = 10.'],'Choose a counting structure — a table, blocks, cases or the opposite — so that every possibility is counted exactly once.')
];

const q=(prompt,choices,correct,explain)=>({prompt,choices,correct,explain});
const quickChecks={
 'pz-logic':[
  q('Exactly one of four statements is true. You assume Bella took it and find that two statements are true. What does that tell you?',['Bella took it.','Bella did not take it.','Two people took it.'],1,'Under that assumption the number of true statements is wrong, so the assumption is rejected. Try the next person.'),
  q('Players take 1, 2 or 3 counters in turn, and whoever takes the last counter wins. What should you leave for your opponent?',['A multiple of 3','A multiple of 4','An odd number'],1,'Whatever your opponent takes (1, 2 or 3), you take the rest of 4. A multiple of 4 is a losing position for the player about to move.'),
  q('Each person is a truth-teller or a liar. Suppose there are exactly 3 liars. Who are the truth-tellers?',['Everyone who says “exactly 3 of us are liars”','Everyone who says a number other than 3','Nobody'],0,'If there really are 3 liars, the statement “exactly 3” is true and every other number is false.'),
  q('In a take-away game, when is a pile size a losing size for the player about to move?',['When at least one move leads to a losing size','When every move leads to a winning size for the other player','When the size is even'],1,'If every move hands the other player a winning size, there is no escape: that size is losing.')
 ],
 'pz-space':[
  q('A painted cube is cut into small cubes. Which small cubes have exactly 3 painted faces?',['The edge cubes','The corner cubes','The middle cubes of each face'],1,'Only a corner cube touches three outside faces, and a cube has 8 corners.'),
  q('Lines are drawn from corner A to the opposite side, and other lines are drawn parallel to that side. Which lines does every triangle use?',['Three lines through A','Two lines through A and one parallel line','Two parallel lines and one line through A'],1,'Two parallel lines never meet, so at most one side is a parallel line. The other two sides go through A.'),
  q('The front view shows a column 3 cubes tall, and the side view shows a row 2 cubes tall. At most how many cubes can stand where that column and row cross?',['3','5','2'],2,'The tower must fit both views, so it is no taller than the smaller of the two heights.'),
  q('A cuboid is painted on every face except the bottom. How many painted faces does a small cube at a bottom corner have?',['2','3','1'],0,'A bottom corner cube touches the bottom and two sides. The bottom is not painted, so it has 2 painted faces.')
 ],
 'pz-count':[
  q('Moving only right or up, a point can be reached in 3 ways from its left neighbour and 4 ways from the point below. How many ways reach it?',['12','7','4'],1,'Every route arrives from the left or from below, never both, so add.'),
  q('Two friends must stand next to each other in a row. What is a good first step?',['Arrange everyone, then halve','Treat the pair as one block, then arrange the blocks','Count only the pair'],1,'Glue the pair into one block, arrange the blocks, then multiply by 2 for the order inside the pair.'),
  q('To count pupils in Art or Band, you add the two club sizes. What still needs fixing?',['Pupils in both clubs were counted twice','Nothing','Pupils in neither club were added'],0,'Subtract the overlap once so that every pupil is counted exactly once.'),
  q('You are forming even numbers from digits that include 0. Why treat “last digit 0” as its own case?',['Then the number is odd','Then the first digit has one more choice','Then 0 cannot be used'],1,'If 0 is already at the end, it cannot be the first digit anyway, so every remaining digit may start the number.')
 ]
};

/* ---------- helpers ---------- */
const fact=n=>{let p=1;for(let i=2;i<=n;i++)p*=i;return p;};
const choose=(n,k)=>{if(k<0||k>n)return 0;let p=1;for(let i=1;i<=k;i++)p=p*(n-k+i)/i;return Math.round(p);};
const perm=(n,k)=>{let p=1;for(let i=0;i<k;i++)p*=n-i;return p;};
const WORDS=['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve'];
const word=n=>WORDS[n]??String(n);
const Word=n=>{const w=word(n);return w[0].toUpperCase()+w.slice(1);};
const andList=a=>a.length<=1?a.join(''):a.slice(0,-1).join(', ')+' and '+a.at(-1);
const orList=a=>a.length<=1?a.join(''):a.slice(0,-1).join(', ')+' or '+a.at(-1);
const shuffle=(a,r)=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=r(0,i);[a[i],a[j]]=[a[j],a[i]];}return a;};
const s_=(n,one,many)=>n===1?one:many;
const range=(a,b)=>Array.from({length:b-a+1},(_,i)=>a+i);
const cents=A=>A<100?`${A} cents`:`S$${(A/100).toFixed(2)}`;
const PUPILS=['Amir','Bella','Chen','Divya','Ethan'];
const FRIENDS=['Asha','Ben','Cai','Dev','Eli','Fay','Gus','Hana'];
const CATS=['Ah Boy','Biscuit','Coco','Dumpling','Kaya'];

/* Statements about who took something. */
function sayCulprit(st,s,names){
 if(st.t==='did')return st.x===s?'I took it.':`${names[st.x]} took it.`;
 if(st.t==='not')return `${names[st.x]} did not take it.`;
 if(st.t==='self')return 'I did not take it.';
 if(st.t==='or')return `It was ${names[st.x]} or ${names[st.y]}.`;
 if(st.t==='lying')return `${names[st.x]} is lying.`;
 return `${names[st.x]} is telling the truth.`;
}
function truthCulprit(sts,c){
 const base=sts.map((st,s)=>st.t==='did'?c===st.x:st.t==='not'?c!==st.x:st.t==='self'?c!==s:st.t==='or'?(c===st.x||c===st.y):null);
 return sts.map((st,s)=>st.t==='lying'?!base[st.x]:st.t==='honest'?base[st.x]:base[s]);
}
function culpritQ(r,pick,out,n,k,kind,meta,variant){
 const names=PUPILS.slice(0,n),need=kind==='true'?k:n-k,ids=range(0,n-1);
 for(let tries=0;tries<6000;tries++){
  const sts=ids.map(s=>{const t=pick(['did','did','not','not','self','or']),others=ids.filter(i=>i!==s);
   if(t==='did')return {t,x:r(0,n-1)};if(t==='not')return {t,x:pick(others)};if(t==='self')return {t};
   const a=shuffle(others,r);return {t,x:Math.min(a[0],a[1]),y:Math.max(a[0],a[1])};});
  if(meta){const who=shuffle(ids,r).slice(0,r(1,2));for(const s of who){const targets=ids.filter(i=>i!==s&&!who.includes(i));sts[s]={t:pick(['lying','lying','honest']),x:pick(targets)};}}
  const keys=sts.map((st,s)=>st.t==='self'?'self':st.t==='did'&&st.x===s?'me':JSON.stringify(st)),plain=keys.filter(x=>x!=='self');
  if(new Set(plain).size<plain.length||keys.length-plain.length>2)continue;
  const truths=ids.map(c=>truthCulprit(sts,c)),counts=truths.map(t=>t.filter(Boolean).length),fits=ids.filter(c=>counts[c]===need);
  if(fits.length!==1)continue;
  const c=fits[0];
  const said=sts.map((st,s)=>`${names[s]} says, “${sayCulprit(st,s,names)}”`).join(' ');
  const text=`${Word(n)} pupils, ${andList(names.map((x,i)=>`${x} (${i+1})`))}, were near the class party table when the last curry puff disappeared. Exactly one of them took it. ${said} Exactly ${word(k)} of the ${word(n)} statements ${k===1?'is':'are'} ${kind}. Who took the curry puff? Give the pupil’s number.`;
  const steps=[`${kind==='false'?`Exactly ${word(k)} ${s_(k,'statement is','statements are')} false, so exactly ${word(need)} ${s_(need,'statement is','statements are')} true.`:`Exactly ${word(k)} ${s_(k,'statement is','statements are')} true.`} Assume each pupil in turn took it, and count the true statements.`];
  sts.forEach((st,s)=>{if(st.t==='lying')steps.push(`${names[s]} says ${names[st.x]} is lying, so whoever took it, exactly one of ${names[st.x]} and ${names[s]} tells the truth.`);if(st.t==='honest')steps.push(`${names[s]} says ${names[st.x]} is telling the truth, so ${names[st.x]} and ${names[s]} are both truthful or both lying.`);});
  ids.forEach(x=>{const tn=ids.filter(s=>truths[x][s]).map(s=>names[s]+'’s');steps.push(`If ${names[x]} (${x+1}) took it, the true statements are ${tn.length?andList(tn):'none'}: ${counts[x]} true. ${counts[x]===need?'This fits.':'This does not fit.'}`);});
  steps.push(`Only ${names[c]} fits, so the answer is ${c+1}.`);
  return out(text,c+1,steps,{variant,n,k,kind,sts,culprit:c});
 }
 throw Error('No culprit puzzle');
}

/* Logic-grid engine: permutation puzzles solved by constraint propagation, so the worked
   solution is a chain of deductions. */
function gridClues(v){
 const n=v.length,c=[],N=CATS;
 for(let i=0;i<n;i++){
  for(let k=1;k<=n;k++)if(k!==v[i])c.push({type:'not',vars:[i],k,test:a=>a[0]!==k,text:`The number of fish ${N[i]} ate is not ${k}.`});
  c.push({type:'par',vars:[i],e:v[i]%2,test:a=>a[0]%2===v[i]%2,text:`${N[i]} ate an ${v[i]%2?'odd':'even'} number of fish.`});
  for(let j=0;j<n;j++){if(i===j)continue;
   if(v[i]>v[j])c.push({type:'gt',vars:[i,j],test:a=>a[0]>a[1],text:`${N[i]} ate more fish than ${N[j]}.`});
   const d=v[i]-v[j];if(d>=1&&d<=3)c.push({type:'diff',vars:[i,j],k:d,test:a=>a[0]-a[1]===d,text:`${N[i]} ate ${word(d)} more fish than ${N[j]}.`});
   if(i<j)c.push({type:'sum',vars:[i,j],s:v[i]+v[j],test:a=>a[0]+a[1]===v[i]+v[j],text:`${N[i]} and ${N[j]} ate ${v[i]+v[j]} fish altogether.`});
   for(let m=0;m<n;m++)if(m!==i&&m!==j&&v[j]<v[i]&&v[i]<v[m])c.push({type:'btw',vars:[i,j,m],test:a=>a[1]<a[0]&&a[0]<a[2],text:`${N[i]} ate more fish than ${N[j]} but fewer than ${N[m]}.`});
  }
 }
 return c;
}
function propagate(n,clues,record){
 const dom=Array.from({length:n},()=>range(1,n)),steps=[];
 const show=i=>dom[i].length===1?`${CATS[i]} ate ${dom[i][0]}`:`${CATS[i]} ate ${orList(dom[i])}`;
 const support=(c,a,val)=>{const others=c.vars.map((x,i)=>i).filter(i=>i!==a);const vals=[];vals[a]=val;
  const rec=t=>{if(t===others.length)return c.test(vals);const i=others[t];for(const w of dom[c.vars[i]]){if(vals.some((u,j)=>j!==i&&u===w))continue;vals[i]=w;if(rec(t+1))return true;vals[i]=undefined;}return false;};return rec(0);};
 for(let round=0,changed=true;changed&&round<40;round++){
  changed=false;
  clues.forEach((c,ci)=>{const hit=[];c.vars.forEach((vi,a)=>{const keep=dom[vi].filter(val=>support(c,a,val));if(keep.length<dom[vi].length){dom[vi]=keep;hit.push(vi);}});
   if(hit.length){changed=true;if(record)steps.push(`From (${ci+1}): ${andList([...new Set(hit)].map(show))}.`);}
   for(let i=0;i<n;i++)if(dom[i].length===1){const val=dom[i][0],h=[];for(let j=0;j<n;j++)if(j!==i&&dom[j].includes(val)){dom[j]=dom[j].filter(x=>x!==val);h.push(j);}if(h.length){changed=true;if(record)steps.push(`${CATS[i]} ate ${val}, so ${andList(h.map(j=>CATS[j]))} did not; now ${andList(h.map(show))}.`);}}
   for(let val=1;val<=n;val++){const who=range(0,n-1).filter(i=>dom[i].includes(val));if(who.length===1&&dom[who[0]].length>1){dom[who[0]]=[val];changed=true;if(record)steps.push(`Only ${CATS[who[0]]} can have eaten ${val} fish, so ${CATS[who[0]]} ate ${val}.`);}}
  });
 }
 return {solved:dom.every(d=>d.length===1),dom,steps};
}
function gridQ(r,pick,out){
 const n=5;
 for(let tries=0;tries<200;tries++){
  const v=shuffle(range(1,n),r),pool=gridClues(v),byType={};for(const c of pool)(byType[c.type]??=[]).push(c);
  let clues=[];
  for(let add=0;add<12;add++){
   const t=pick(['gt','gt','diff','diff','sum','btw','btw','par','not']),list=(byType[t]||[]).filter(c=>!clues.includes(c));if(!list.length)continue;
   clues.push(pick(list));if(propagate(n,clues).solved)break;
  }
  if(!propagate(n,clues).solved)continue;
  for(let i=clues.length-1;i>=0;i--){const trial=clues.filter((_,j)=>j!==i);if(propagate(n,trial).solved)clues=trial;}
  if(clues.length<4||clues.length>6||clues.filter(c=>c.type==='not'||c.type==='par').length>2)continue;
  clues=shuffle(clues,r);const sol=propagate(n,clues,true);if(sol.steps.length>12)continue;
  const ask=r(0,n-1);
  const text=`Five cats, ${andList(CATS)}, each ate a different number of fish: 1, 2, 3, 4 or 5. ${clues.map((c,i)=>`(${i+1}) ${c.text}`).join(' ')} How many fish did ${CATS[ask]} eat?`;
  const steps=['Make a list of the possible numbers for each cat (1 to 5). Use each clue to cross out impossible numbers, and remember that no two cats ate the same number.',...sol.steps,`Check every clue with ${andList(CATS.map((x,i)=>`${x} ${v[i]}`))}.`,`${CATS[ask]} ate ${v[ask]} fish.`];
  return out(text,v[ask],steps,{variant:'grid',v,ask,types:clues.map(c=>c.type)});
 }
 throw Error('No grid puzzle');
}

/* Take-away games. */
function gameTable(moves,M){const lose=[];for(let n=0;n<=M;n++)lose[n]=!moves.some(m=>m<=n&&lose[n-m]);return lose;}

function logicMake(form,r,pick,out){
 if(form===0){
  const v=pick(['culprit','weigh','draws']);
  if(v==='culprit')return culpritQ(r,pick,out,4,1,pick(['true','false']),false,v);
  if(v==='weigh'){
   if(r(0,1)===0){
    const n=r(4,80);let k=0,p=1;while(p<n){p*=3;k++;}const a=Math.ceil(n/3);
    return out(`You have ${n} coins that look the same. One of them is slightly heavier than the others, and all the others have equal mass. You have a balance scale but no weights. What is the fewest number of weighings that will always find the heavier coin, whatever the results?`,k,[
     'Each weighing has three possible results: the left pan is heavier, the right pan is heavier, or the pans balance. So one weighing can narrow the heavy coin down to one of three groups.',
     `So 1 weighing can handle up to 3 coins, and each extra weighing triples this: ${range(1,k).map(i=>`${i} weighing${i>1?'s':''}: ${3**i} coins`).join('; ')}.`,
     `${n} is more than ${3**(k-1)}, so ${k-1} weighing${k-1>1?'s are':' is'} not enough: ${k-1} weighing${k-1>1?'s':''} can only pick out the heavy coin from at most ${3**(k-1)} coins.`,
     `${k} weighings are enough: put ${a} coins on each pan and leave ${n-2*a} aside. Whatever happens, at most ${a} coins remain, and ${a} ≤ ${3**(k-1)}, so ${k-1} more weighing${k-1>1?'s':''} will finish the job.`,
     `Fewest weighings = ${k}.`],{variant:v,sub:'fewest',n});
   }
   const k=r(2,4);
   return out(`One coin in a pile of identical-looking coins is slightly heavier; all the others have equal mass. You may use a balance scale ${word(k)} times, with no weights. What is the greatest number of coins the pile can have, if you must always be able to find the heavier coin?`,3**k,[
    'Each weighing has three possible results (left heavier, right heavier, balance), so it splits the coins into three groups: left pan, right pan, and aside.',
    'With 1 weighing you can handle 3 coins: 1 on each pan and 1 aside. With 2 weighings, each of the three groups may have up to 3 coins: 3 × 3 = 9.',
    `Each extra weighing triples the number. With ${k} weighings: ${Array(k).fill(3).join(' × ')} = ${3**k} coins, using ${3**(k-1)} on each pan and ${3**(k-1)} aside.`,
    `With ${3**k+1} coins, one of the three groups would have more than ${3**(k-1)} coins, which is too many for the weighings left. Greatest number = ${3**k}.`],{variant:v,sub:'greatest',k});
  }
  const n=r(4,7),G=n*(n-1)/2,d=r(1,G-1),T=3*G-d,ask=pick(['draws','winners']);
  return out(`${Word(n)} teams play in a futsal league. Each team plays every other team exactly once. A win earns 3 points, a draw earns 1 point for each of the two teams, and a loss earns 0 points. Altogether the teams scored ${T} points. ${ask==='draws'?'How many games ended in a draw?':'How many games had a winner?'}`,ask==='draws'?d:G-d,[
   `Each pair of teams plays once: ${n} × ${n-1} ÷ 2 = ${G} games.`,
   'A game with a winner gives out 3 points in total. A drawn game gives out 1 + 1 = 2 points.',
   `If every game had a winner there would be ${G} × 3 = ${3*G} points. Each draw gives out 1 point fewer.`,
   `Draws = ${3*G} − ${T} = ${d}.`,...(ask==='winners'?[`Games with a winner = ${G} − ${d} = ${G-d}.`]:[])],{variant:v,sub:ask,n,T});
 }
 if(form===1){
  const v=pick(['nim','misere','rr-max']);
  if(v==='nim'||v==='misere'){
   let N,k,m;do{N=r(15,40);k=r(2,5);m=v==='nim'?N%(k+1):(N-1)%(k+1);}while(m===0);
   const takes=orList(range(1,k).map(String)),left=N-m;
   return out(`There are ${N} marbles in a bowl. Two players take turns. On each turn a player must take ${takes} marbles. ${v==='nim'?'The player who takes the last marble wins.':'The player who has to take the last marble loses.'} You go first. How many marbles should you take on your first turn so that you are sure to win?`,m,v==='nim'?[
    `Work backwards. If ${k+1} marbles are left on your opponent’s turn, they must take between 1 and ${k}, and you can take all the rest.`,
    `So leave a multiple of ${k+1} each time: whenever your opponent takes t marbles, you take ${k+1} − t. The total keeps dropping by ${k+1} each round until you take the last marble.`,
    `${N} = ${Math.floor(N/(k+1))} × ${k+1} + ${m}. Take ${m} to leave ${left}, a multiple of ${k+1}.`,
    `Any other first move leaves a number that is not a multiple of ${k+1}, and then your opponent could use the same plan against you. So take ${m}.`]:[
    `Work backwards. You want your opponent to face exactly 1 marble, because then they must take it and lose.`,
    `If ${k+2} marbles are left on your opponent’s turn, whatever t they take (1 to ${k}), you take ${k+1} − t and leave 1. So leave 1 more than a multiple of ${k+1}: 1, ${k+2}, ${2*k+3}, …`,
    `${N} − 1 = ${N-1} = ${Math.floor((N-1)/(k+1))} × ${k+1} + ${m}. Take ${m} to leave ${left}, which is 1 more than a multiple of ${k+1}.`,
    `Any other first move lets your opponent use the same plan against you. So take ${m}.`],{variant:v,N,k});
  }
  const [n,w]=pick([[5,3],[6,3],[6,4],[7,3],[7,4],[7,5]]),cap=m=>Math.floor((m-1)/2)+n-m;let m=1;while(m<n&&w<=cap(m+1))m++;
  const G=n*(n-1)/2,inside=m%2?`each of them wins ${(m-1)/2} of the games among themselves (seat them in a circle; each beats the next ${(m-1)/2} clockwise)`:`half of them win ${m/2} and half win ${m/2-1} of the games among themselves`;
  return out(`${Word(n)} players take part in a badminton competition. Each player plays every other player exactly once, and every game has a winner. What is the greatest number of players who could each win at least ${w} games?`,m,[
   `Suppose some group of players each win at least ${w} games. Count the wins that group can possibly have.`,
   `A group of g players plays g(g − 1)/2 games among themselves, giving that many wins, and can win at most g × (${n} − g) games against the other players.`,
   `For g = ${m+1}: the group needs ${m+1} × ${w} = ${(m+1)*w} wins, but at most ${(m+1)*m/2} + ${(m+1)*(n-m-1)} = ${(m+1)*m/2+(m+1)*(n-m-1)} are possible. Too few, and larger groups are even worse.`,
   `For g = ${m} it can happen: the ${m} strong players beat all the other ${n-m}, and ${inside}. Each of them then wins at least ${cap(m)} games${cap(m)>w?`, more than ${w}`:''}.`,
   `Greatest number = ${m}. (Altogether there are ${G} games.)`],{variant:v,n,w});
 }
 if(form===2){
  const v=pick(['claims','balance','circle']);
  if(v==='claims'){
   const sub=pick(['exactly','atleast']);
   for(let tries=0;tries<3000;tries++){
    const n=r(5,8),names=FRIENDS.slice(0,n);let a,L;
    if(sub==='exactly'){L=r(1,n-1);const idx=shuffle(range(0,n-1),r);a=[];idx.forEach((p,i)=>a[p]=i<n-L?L:pick(range(1,n).filter(x=>x!==L)));}
    else a=range(0,n-1).map(()=>r(1,n));
    const ok=range(1,n-1).filter(x=>a.filter(y=>sub==='exactly'?y===x:y<=x).length===n-x);
    if(ok.length!==1)continue;L=ok[0];
    const vals=[...new Set(a)].sort((x,y)=>x-y);
    const claim=v2=>`${sub==='exactly'?'Exactly':'At least'} ${word(v2)} of us ${v2===1?'is a liar':'are liars'}.`;
    const said=vals.map(v2=>{const who=names.filter((_,i)=>a[i]===v2);return `${andList(who)} ${who.length>1?'each say':'says'}, “${claim(v2)}”`;}).join(' ');
    const truthful=x=>a.filter(y=>sub==='exactly'?y===x:y<=x).length;
    return out(`${Word(n)} friends, ${andList(names)}, live on an island where everyone is either a truth-teller, who always tells the truth, or a liar, who always lies. At least one of the friends is a truth-teller. ${said} How many of the friends are liars?`,L,[
     sub==='exactly'?'Suppose there are exactly L liars. Then the people who said “exactly L” are telling the truth and everyone else is lying.':'Suppose there are exactly L liars. Then everyone who said “at least” a number up to L is telling the truth, and everyone who said a bigger number is lying.',
     `So the number of truth-tellers must equal ${n} − L. Test each L from 1 to ${n-1} (there is at least one truth-teller, so L is not ${n}).`,
     range(1,n-1).map(x=>`L = ${x}: ${truthful(x)} truthful, need ${n-x} ${truthful(x)===n-x?'✓':'✗'}`).join('; ')+'.',
     `Only L = ${L} works, so there ${L===1?'is 1 liar':`are ${L} liars`}.`],{variant:v,sub,n,a});
   }
   throw Error('No claims puzzle');
  }
  if(v==='balance'){
   const [[X,Xs],[Y,Ys],[Z,Zs]]=pick([[['teacup','teacups'],['bowl','bowls'],['spoon','spoons']],[['toy car','toy cars'],['ball','balls'],['marble','marbles']],[['book','books'],['pencil case','pencil cases'],['eraser','erasers']]]);
   const sub=pick(['sum','ratio']),nm=(k,one,many)=>`${k} ${s_(k,one,many)}`;
   if(sub==='sum'){
    const y=r(2,6),t=r(1,4),x=y+t,p=r(2,3),qq=r(1,3),s=p*x+qq*y,ask=pick(['Y','X']);
    return out(`On a balance, ${nm(p,X,Xs)} and ${nm(qq,Y,Ys)} together balance ${nm(s,Z,Zs)}. Also, 1 ${X} balances 1 ${Y} and ${nm(t,Z,Zs)}. All ${Xs} have the same mass, and so do all ${Ys} and all ${Zs}. How many ${Zs} balance 1 ${ask==='Y'?Y:X}?`,ask==='Y'?y:x,[
     `Replace every ${X} by what it balances: 1 ${Y} and ${nm(t,Z,Zs)}.`,
     `Then ${nm(p,X,Xs)} become ${nm(p,Y,Ys)} and ${p} × ${t} = ${p*t} ${Zs}. So ${nm(p+qq,Y,Ys)} and ${p*t} ${Zs} balance ${s} ${Zs}.`,
     `Take ${p*t} ${Zs} off both pans: ${nm(p+qq,Y,Ys)} balance ${s-p*t} ${Zs}.`,
     `1 ${Y} balances ${s-p*t} ÷ ${p+qq} = ${y} ${Zs}.`,...(ask==='X'?[`1 ${X} balances ${y} + ${t} = ${x} ${Zs}.`]:[]),
     `Check: ${p} × ${x} + ${qq} × ${y} = ${s}.`],{variant:v,sub,p,qq,s,t,ask});
   }
   const [a,b]=pick([[3,2],[4,3],[5,3],[5,4],[3,1]]),g=(a-b),t=g*r(1,Math.max(1,Math.floor(12/b))),x=b*t/g,y=x+t,ask=pick(['Y','X']);
   return out(`On a balance, ${nm(a,X,Xs)} balance ${nm(b,Y,Ys)}. Also, 1 ${Y} balances 1 ${X} and ${nm(t,Z,Zs)}. All ${Xs} have the same mass, and so do all ${Ys} and all ${Zs}. How many ${Zs} balance 1 ${ask==='Y'?Y:X}?`,ask==='Y'?y:x,[
    `Replace every ${Y} by what it balances: 1 ${X} and ${nm(t,Z,Zs)}.`,
    `Then ${nm(a,X,Xs)} balance ${nm(b,X,Xs)} and ${b} × ${t} = ${b*t} ${Zs}.`,
    a-b===1?`Take ${nm(b,X,Xs)} off both pans: 1 ${X} balances ${b*t} ${Zs}.`:`Take ${nm(b,X,Xs)} off both pans: ${nm(a-b,X,Xs)} balance ${b*t} ${Zs}, so 1 ${X} balances ${b*t} ÷ ${a-b} = ${x} ${Zs}.`,
    ...(ask==='Y'?[`1 ${Y} balances ${x} + ${t} = ${y} ${Zs}.`]:[]),
    `Check: ${a} × ${x} = ${a*x} and ${b} × ${y} = ${b*y}.`],{variant:v,sub,a,b,t,ask});
  }
  const sub=pick(['most','fewest','right']);
  if(sub==='right'){
   const n=2*r(3,6);
   return out(`${Word(n)} children sit around a round table. Each child is either a truth-teller, who always tells the truth, or a liar, who always lies. Every child says, “The child on my right is a liar.” How many of the children are liars?`,n/2,[
    'If a child tells the truth, the child on their right really is a liar.',
    'If a child lies, the statement is false, so the child on their right is a truth-teller.',
    'So going round the table, truth-tellers and liars must take turns.',
    `With ${n} seats in alternating order, half are liars: ${n} ÷ 2 = ${n/2}.`],{variant:v,sub,n});
  }
  const n=r(6,12),t=sub==='most'?Math.ceil(n/3):Math.floor(n/2),ans=n-t;
  const most=[
   'A truth-teller’s neighbours really are both liars, so no two truth-tellers sit side by side.',
   'A liar’s statement is false, so at least one neighbour of every liar is a truth-teller. So no three liars sit in a row.',
   `Between neighbouring truth-tellers there are 1 or 2 liars. With T truth-tellers there are T gaps, so there are at most 2T liars and ${n} ≤ 3T, which means T ≥ ${t}.`,
   `Seating “truth-teller, liar, liar” round the table${n%3?` (with ${3*t-n} gap${3*t-n>1?'s':''} of just one liar)`:''} uses ${t} truth-tellers and works.`,
   `Greatest number of liars = ${n} − ${t} = ${ans}.`];
  const few=[
   'A truth-teller’s neighbours really are both liars, so no two truth-tellers sit side by side.',
   'So every gap between neighbouring truth-tellers has at least one liar. With T truth-tellers there are T gaps, so there are at least T liars.',
   `Then ${n} ≥ 2T, so T ≤ ${t}.`,
   `Alternating truth-teller and liar${n%2?' (with one gap of two liars)':''} works: each liar has a truth-teller beside them, so their statement is false.`,
   `Fewest liars = ${n} − ${t} = ${ans}.`];
  return out(`${Word(n)} children sit around a round table. Each child is either a truth-teller, who always tells the truth, or a liar, who always lies. Every child says, “Both of my neighbours are liars.” What is the ${sub==='most'?'greatest':'smallest'} possible number of liars?`,ans,sub==='most'?most:few,{variant:v,sub,n});
 }
 const v=pick(['grid','meta','game']);
 if(v==='grid')return gridQ(r,pick,out);
 if(v==='meta')return culpritQ(r,pick,out,5,r(1,2),pick(['true','false']),true,v);
 const moves=pick([[1,3,4],[1,4],[2,3],[2,5],[1,4,5],[3,4]]),M=r(20,40),lose=gameTable(moves,M+20);
 let P=1;for(;P<=12;P++)if(range(0,M).every(i=>lose[i]===lose[i+P]))break;
 const Ls=range(1,M).filter(i=>lose[i]),stuck=range(0,Math.min(...moves)-1);
 return out(`A pile has some counters. Two players take turns. On each turn a player must take exactly ${orList(moves.map(String))} counters. A player who cannot make a move loses. For how many starting piles from 1 to ${M} counters can the second player always win?`,Ls.length,[
  `Call a pile size L (losing) if the player about to move must lose with best play, and W (winning) otherwise. ${andList(stuck.map(String))} ${stuck.length>1?'are':'is'} L, because no move is possible.`,
  'A size is W if some move leads to an L size; it is L if every move leads to a W size.',
  `Sizes 0 to ${P+Math.max(...moves)}: ${range(0,P+Math.max(...moves)).map(i=>`${i} ${lose[i]?'L':'W'}`).join(', ')}.`,
  `The pattern repeats every ${P}: the L sizes are those leaving remainder ${orList(range(0,P-1).filter(i=>lose[i]).map(String))} when divided by ${P}.`,
  `From 1 to ${M} the L sizes are ${Ls.join(', ')}: ${Ls.length} of them. With an L size the first player loses, so the second player wins.`],{variant:v,moves,M});
}

/* ---------- 3D and shapes ---------- */
function paintedCounts(a,b,c){const I=(a-2)*(b-2)*(c-2),E=4*((a-2)+(b-2)+(c-2)),F=2*((a-2)*(b-2)+(b-2)*(c-2)+(a-2)*(c-2));return [I,F,E,8];}
const NETS=[[[0,1],[1,1],[2,1],[3,1],[0,0],[0,2]],[[0,1],[1,1],[2,1],[3,1],[0,0],[1,2]],[[0,1],[1,1],[2,1],[3,1],[0,0],[2,2]],[[0,1],[1,1],[2,1],[3,1],[0,0],[3,2]],[[0,1],[1,1],[2,1],[3,1],[1,0],[1,2]],[[0,1],[1,1],[2,1],[3,1],[1,0],[2,2]],
 [[0,0],[1,0],[1,1],[2,1],[3,1],[1,2]],[[0,0],[1,0],[1,1],[2,1],[3,1],[2,2]],[[0,0],[1,0],[1,1],[2,1],[3,1],[3,2]],[[0,0],[1,0],[1,1],[2,1],[2,2],[3,2]],[[0,0],[1,0],[2,0],[2,1],[3,1],[4,1]]];
/* Roll a cube over the net: the face touching each square is recorded. Faces 0/1, 2/3, 4/5 are opposite. */
function rollNet(cells){
 const key=c=>c.join(','),has=new Map(cells.map((c,i)=>[key(c),i])),face=Array(cells.length).fill(-1);face[0]=0;
 const queue=[[0,{B:0,T:1,N:2,S:3,E:4,W:5}]];
 while(queue.length){const [i,o]=queue.shift(),[x,y]=cells[i];
  for(const [dx,dy,d] of [[1,0,'E'],[-1,0,'W'],[0,1,'S'],[0,-1,'N']]){const j=has.get(key([x+dx,y+dy]));if(j===undefined||face[j]>=0)continue;let n;
   if(d==='E')n={...o,B:o.E,E:o.T,T:o.W,W:o.B};if(d==='W')n={...o,B:o.W,W:o.T,T:o.E,E:o.B};if(d==='S')n={...o,B:o.S,S:o.T,T:o.N,N:o.B};if(d==='N')n={...o,B:o.N,N:o.T,T:o.S,S:o.B};
   face[j]=n.B;queue.push([j,n]);}
 }
 return face;
}
function viewsOf(h){const F=h[0].map((_,c)=>Math.max(...h.map(row=>row[c]))),S=h.map(row=>Math.max(...row));return {F,S};}
function routes(W,H,closed=[],from=[0,0],to=[W,H]){
 const t=[];for(let y=0;y<=H;y++){t[y]=[];for(let x=0;x<=W;x++){
  if(x<from[0]||y<from[1]||x>to[0]||y>to[1]||closed.some(p=>p[0]===x&&p[1]===y))t[y][x]=0;
  else if(x===from[0]&&y===from[1])t[y][x]=1;
  else t[y][x]=(x>0?t[y][x-1]:0)+(y>0?t[y-1][x]:0);}}
 return t;
}
const tableRows=(t,from,to)=>t.slice(from[1],to[1]+1).map(row=>row.slice(from[0],to[0]+1).join(', ')).join(' / ');

function spaceMake(form,r,pick,out){
 if(form===0){
  const v=pick(['painted','squares','views-max']);
  if(v==='painted'){
   const n=r(3,6),k=pick([0,1,1,2,2,3]),[I,F,E]=paintedCounts(n,n,n),ans=[I,F,E,8][k];
   return out(`A large cube of side ${n} cm is built from ${n**3} small 1 cm cubes. The outside of the large cube is painted all over. It is then taken apart. How many of the small cubes have ${k?`exactly ${word(k)} painted ${s_(k,'face','faces')}`:'no painted faces'}?`,ans,[
    'Sort the small cubes by where they sit: corners, edges (not corners), the middles of the faces, and the inside.',
    'Corners: a cube has 8 corners, and each corner cube has 3 painted faces.',
    `Edges: a cube has 12 edges, each with ${n} − 2 = ${n-2} cubes between its corners: 12 × ${n-2} = ${E} cubes with 2 painted faces.`,
    `Faces: each of the 6 faces has a ${n-2} by ${n-2} middle: 6 × ${(n-2)**2} = ${F} cubes with 1 painted face.`,
    `Inside: a ${n-2} by ${n-2} by ${n-2} block of ${I} cubes with no paint. Check: 8 + ${E} + ${F} + ${I} = ${n**3}.`,
    `Answer: ${ans}.`],{variant:v,n,k},{figure:{module:'puzzles',kind:'pz-cuboid',a:n,b:n,c:n,unpainted:[]}});
  }
  if(v==='squares'){
   let W,H;do{W=r(2,5);H=r(2,5);}while(W===H&&r(0,1));
   const sizes=range(1,Math.min(W,H)),Sq=sizes.reduce((s,k)=>s+(W-k+1)*(H-k+1),0),Rc=choose(W+1,2)*choose(H+1,2),sub=pick(['squares','squares','oblong']);
   return out(sub==='squares'?`How many squares of any size can you find in the ${W} by ${H} grid of small squares shown?`:`How many rectangles in the ${W} by ${H} grid of small squares shown are not squares?`,sub==='squares'?Sq:Rc-Sq,[
    'Count squares by size. A k by k square needs k columns and k rows of small squares.',
    sizes.map(k=>`${k} by ${k}: ${W-k+1} × ${H-k+1} = ${(W-k+1)*(H-k+1)}`).join('; ')+'.',
    `Squares altogether: ${Sq}.`,
    ...(sub==='squares'?[`Answer: ${Sq}.`]:[`All rectangles: choose 2 of the ${W+1} upright lines and 2 of the ${H+1} flat lines: ${choose(W+1,2)} × ${choose(H+1,2)} = ${Rc}.`,`Not squares: ${Rc} − ${Sq} = ${Rc-Sq}.`])],{variant:v,sub,W,H},{figure:{module:'puzzles',kind:'pz-grid',W,H}});
  }
  for(;;){
   const h=range(0,2).map(()=>range(0,2).map(()=>r(0,3))),{F,S}=viewsOf(h);if(F.includes(0)||S.includes(0)||Math.max(...F)<2)continue;
   const mins=S.map(s=>F.map(f=>Math.min(f,s))),ans=mins.flat().reduce((a,b)=>a+b,0);
   return out('Identical cubes are stacked on a 3 by 3 square mat. Each cube sits on a square of the mat or directly on top of another cube. The front view and the right side view are shown. What is the greatest number of cubes there could be?',ans,[
    `The front view gives the tallest tower in each column, left to right: ${F.join(', ')}. The right side view gives the tallest tower in each row, front to back: ${S.join(', ')}.`,
    'A tower can be no taller than its column’s height in the front view, and no taller than its row’s height in the side view. So the most it can have is the smaller of the two.',
    `Put that many cubes on every square. Front row: ${mins[0].join(', ')}; middle row: ${mins[1].join(', ')}; back row: ${mins[2].join(', ')}.`,
    `Both views stay the same, and no square can hold more. Greatest number = ${ans}.`],{variant:v,h},{figure:{module:'puzzles',kind:'pz-views',F,S}});
  }
 }
 if(form===1){
  const v=pick(['cuboid','cevians','net']);
  if(v==='cuboid'){
   const sub=pick(['k','k','any']),lo=sub==='any'?3:2;let a,b,c;do{a=r(lo,6);b=r(lo,6);c=r(lo,6);}while(a===b&&b===c);
   const [I,F,E]=paintedCounts(a,b,c),k=pick([0,1,2]),ans=sub==='any'?a*b*c-I:[I,F,E][k];
   const ask=sub==='any'?'at least one painted face':k?`exactly ${word(k)} painted ${s_(k,'face','faces')}`:'no painted faces';
   return out(`A cuboid ${a} cm long, ${b} cm wide and ${c} cm tall is built from 1 cm cubes. Its whole outside is painted. It is then taken apart. How many of the 1 cm cubes have ${ask}?`,ans,[
    `There are ${a} × ${b} × ${c} = ${a*b*c} small cubes. Sort them into corners, edges, face middles and inside.`,
    `Edges: 4 edges of each length. Between the corners they hold ${a-2}, ${b-2} and ${c-2} cubes: 4 × (${a-2} + ${b-2} + ${c-2}) = ${E} cubes with 2 painted faces. The 8 corners have 3.`,
    `Face middles: two faces of each kind: 2 × (${a-2} × ${b-2} + ${b-2} × ${c-2} + ${a-2} × ${c-2}) = ${F} cubes with 1 painted face.`,
    `Inside: ${a-2} × ${b-2} × ${c-2} = ${I} cubes with no paint. Check: 8 + ${E} + ${F} + ${I} = ${a*b*c}.`,
    sub==='any'?`At least one painted face: ${a*b*c} − ${I} = ${ans}.`:`Answer: ${ans}.`],{variant:v,sub,a,b,c,k},{figure:{module:'puzzles',kind:'pz-cuboid',a,b,c,unpainted:[]}});
  }
  if(v==='cevians'){
   let p,qq;do{p=r(1,4);qq=r(0,2);}while(qq===0&&p<2);
   const ans=choose(p+2,2)*(qq+1);
   return out(`In triangle ABC, ${word(p)} straight ${s_(p,'line is','lines are')} drawn from A to side BC${qq?`, and ${word(qq)} ${s_(qq,'line is','lines are')} drawn across the triangle parallel to BC`:''}, as shown. How many triangles of any size are there in the figure?`,ans,[
    `The lines through A are AB, AC and the ${word(p)} drawn from A: ${p+2} lines. The lines parallel to BC are BC${qq?` and the ${word(qq)} drawn across`:''}: ${qq+1} ${s_(qq+1,'line','lines')}.`,
    'Two parallel lines never meet, so a triangle has at most one side on a parallel line. Its other two sides lie on lines through A, so every triangle has a corner at A.',
    `So a triangle is fixed by choosing 2 of the ${p+2} lines through A (${p+2} × ${p+1} ÷ 2 = ${choose(p+2,2)} ways) and 1 of the ${qq+1} parallel ${s_(qq+1,'line','lines')}.`,
    `Triangles = ${choose(p+2,2)} × ${qq+1} = ${ans}.`],{variant:v,p,q:qq},{figure:{module:'puzzles',kind:'pz-cevians',p,q:qq}});
  }
  const shape=pick(NETS),sym=r(0,7),tf=([x,y])=>[[x,y],[-x,y],[x,-y],[-x,-y],[y,x],[-y,x],[y,-x],[-y,-x]][sym];
  let cells=shape.map(tf);const mx=Math.min(...cells.map(c=>c[0])),my=Math.min(...cells.map(c=>c[1]));cells=cells.map(([x,y])=>[x-mx,y-my]);
  const labels=shuffle(range(1,6),r),face=rollNet(cells),t=r(0,5),o=face.findIndex(f=>f===(face[t]^1));
  const at=(x,y)=>cells.findIndex(c=>c[0]===x&&c[1]===y),[tx,ty]=cells[t],[ox,oy]=cells[o];
  const straight=(tx===ox&&Math.abs(ty-oy)===2&&at(tx,(ty+oy)/2)>=0)||(ty===oy&&Math.abs(tx-ox)===2&&at((tx+ox)/2,ty)>=0);
  const netNb=cells.map((c,i)=>i).filter(i=>Math.abs(cells[i][0]-tx)+Math.abs(cells[i][1]-ty)===1),cubeNb=cells.map((c,i)=>i).filter(i=>i!==t&&i!==o),later=cubeNb.filter(i=>!netNb.includes(i));
  const pairs=[0,2,4].map(f=>[labels[face.indexOf(f)],labels[face.indexOf(f+1)]].sort((x,y)=>x-y).join(' and '));
  return out(`The net shown folds up to make a cube. Which number is on the face opposite the face numbered ${labels[t]}?`,labels[o],[
   `Imagine face ${labels[t]} lying flat on the table and fold the other squares up around it.`,
   `Squares joined to ${labels[t]} in the net (${andList(netNb.map(i=>String(labels[i])))}) become side faces next to it.`,
   straight?`${labels[t]} and ${labels[o]} lie in a straight line with exactly one square between them. Folding the square in the middle up makes ${labels[o]} fold over to the top, opposite ${labels[t]}.`:`When the net is folded, ${andList(later.map(i=>String(labels[i])))} also ${later.length>1?'meet':'meets'} face ${labels[t]} along an edge. Only ${labels[o]} never touches it.`,
   `So ${labels[o]} is opposite ${labels[t]}. (The opposite pairs are ${andList(pairs)}.)`],{variant:v,cells,labels,t},{figure:{module:'puzzles',kind:'pz-net',cells,labels}});
 }
 if(form===2){
  const v=pick(['views-min','strip','fold']);
  if(v==='views-min'){
   for(;;){
    const h=range(0,2).map(()=>range(0,2).map(()=>r(0,3))),{F,S}=viewsOf(h);if(F.includes(0)||S.includes(0)||Math.max(...F)<2)continue;
    const hs=[...new Set([...F,...S])].sort((x,y)=>y-x),parts=hs.map(k=>{const cf=F.filter(x=>x===k).length,cs=S.filter(x=>x===k).length;return {k,cf,cs,m:Math.max(cf,cs)};});
    const ans=parts.reduce((s,p)=>s+p.k*p.m,0),mx=S.flatMap(s=>F.map(f=>Math.min(f,s))).reduce((x,y)=>x+y,0);if(ans===mx)continue;
    return out('Identical cubes are stacked on a 3 by 3 square mat. Each cube sits on a square of the mat or directly on top of another cube, and some squares may be empty. The front view and the right side view are shown. What is the smallest number of cubes there could be?',ans,[
     `Front view, columns left to right: ${F.join(', ')}. Right side view, rows front to back: ${S.join(', ')}.`,
     'Every column needs at least one tower as tall as its front-view height, and every row needs one as tall as its side-view height. A tower standing where a column and a row cross can serve both if they need the same height.',
     ...parts.map(p=>`Height ${p.k}: ${p.cf} ${s_(p.cf,'column','columns')} and ${p.cs} ${s_(p.cs,'row','rows')} need it, so ${p.m} ${s_(p.m,'tower','towers')} of ${p.k}: ${p.m*p.k} ${s_(p.m*p.k,'cube','cubes')}.`),
     `Pair columns and rows of equal height where they cross; any extra tower stands in a row or column that is at least as tall. No other cubes are needed. Smallest number = ${ans}.`],{variant:v,h},{figure:{module:'puzzles',kind:'pz-views',F,S}});
   }
  }
  if(v==='strip'){
   const sub=pick(['both','zigzag']),m=r(2,6),ans=sub==='both'?10*m-2:3*m-1;
   return out(sub==='both'?`A row of ${m} equal squares is drawn, and both diagonals of every square are drawn, as shown. How many triangles of any size are there?`:`A row of ${m} equal squares is drawn. One diagonal is drawn in each square so that the diagonals make a zigzag, as shown. How many triangles of any size are there?`,ans,sub==='both'?[
    'Inside one square, the two diagonals make 4 small triangles, and each diagonal cuts the square into 2 half-square triangles: 4 + 4 = 8 triangles in each square.',
    `${m} squares give ${m} × 8 = ${8*m} triangles.`,
    `Neighbouring squares share a corner at the top and at the bottom. The two diagonals that meet at the shared top corner make a wide triangle with the bottom line, and the two meeting at the shared bottom corner make one with the top line: 2 × ${m-1} = ${2*(m-1)}.`,
    'No other triangles exist: only the top and bottom lines cross more than one square, and diagonals meet only inside a square or at a shared corner.',
    `Total = ${8*m} + ${2*(m-1)} = ${ans}.`]:[
    `Each diagonal cuts its square into 2 triangles: ${m} × 2 = ${2*m}.`,
    `Where two diagonals meet at a shared corner, they make a wide triangle with the top or bottom line. There are ${m-1} such ${s_(m-1,'corner','corners')}.`,
    'No other triangles exist: only the top and bottom lines cross more than one square, and diagonals meet only at shared corners.',
    `Total = ${2*m} + ${m-1} = ${ans}.`],{variant:v,sub,m},{figure:{module:'puzzles',kind:'pz-strip',m,mode:sub}});
  }
  if(r(0,1)===0){
   const k=r(2,4),c=r(1,3),Lr=2**k,ans=c*Lr+1;
   const cuts=c===1?[1]:c===2?[1,3]:[1,2,3];
   return out(`A long, thin strip of paper is folded in half by bringing one end onto the other. It is folded in half in the same way again, until it has been folded ${word(k)} times. Then ${c===1?'one straight cut is':`${word(c)} straight cuts are`} made across the folded strip, at right angles to its length, as shown, away from the folds and the ends. The strip is unfolded. How many pieces of paper are there?`,ans,[
    `Each fold doubles the number of layers: after ${k} folds there are ${Array(k).fill(2).join(' × ')} = ${Lr} layers.`,
    `Each cut goes through every layer, so it cuts the unfolded strip in ${Lr} places. ${c===1?'The cut makes':`${Word(c)} cuts make`} ${c} × ${Lr} = ${c*Lr} cut places.`,
    `Cutting a strip in ${c*Lr} places makes ${c*Lr} + 1 pieces, because every cut place adds one more piece.`,
    `Answer: ${ans}.`],{variant:'fold',sub:'strip',k,c},{figure:{module:'puzzles',kind:'pz-fold',mode:'strip',k,cuts:cuts.map(x=>x/4)}});
  }
  const k=r(2,3),region=k===2?[4,4]:[4,2],spots=shuffle(range(1,3).flatMap(x=>range(1,region[1]-1).map(y=>[x,y])),r),h=r(1,Math.min(3,spots.length)),holes=spots.slice(0,h),edge=r(0,1);
  const notch=edge?(k===2?[4,r(1,3)]:[r(1,3),2]):null,ans=h*2**k+(edge?2**(k-1):0);
  return out(`A square sheet of paper is folded in half from top to bottom, then in half from right to left${k===3?', then in half from top to bottom again':''}. ${Word(h)} small round ${s_(h,'hole is','holes are')} punched through all the layers, away from the edges and folds${edge?`, and one more hole is punched with its centre exactly on the last fold, making a half-circle notch in the folded edge`:''}, as shown. The paper is unfolded. How many holes are there in the sheet?`,ans,[
   `Each fold doubles the layers: after ${k} folds there are ${2**k} layers.`,
   `A hole away from the folds goes through every layer, so each makes ${2**k} holes: ${h} × ${2**k} = ${h*2**k}.`,
   ...(edge?[`The half-circle notch opens out into one whole hole across the last fold line, so its two layers make 1 hole instead of 2. It makes only ${2**k} ÷ 2 = ${2**(k-1)} holes.`]:[]),
   `Total = ${ans}.`],{variant:'fold',sub:'punch',k,h,edge},{figure:{module:'puzzles',kind:'pz-fold',mode:'punch',k,holes,notch}});
 }
 const v=pick(['layers','dots','views-top']);
 if(v==='layers'){
  const a=r(3,5),b=r(3,5),hh=r(2,5),sub=pick(['bottom','topbottom']),k=sub==='bottom'?pick([0,1,1,2,2,3]):pick([0,1,1,2]);
  const Ed=2*(a-2)+2*(b-2),Mi=(a-2)*(b-2);
  const other=[Mi,Ed,4,0],topK=[0,Mi,Ed,4][k],ans=sub==='bottom'?topK+(hh-1)*other[k]:hh*other[k];
  return out(`A cuboid ${a} cm long, ${b} cm wide and ${hh} cm tall is built from 1 cm cubes. Every outside face is painted except ${sub==='bottom'?'the bottom face, which stands on the table':'the top face and the bottom face'}. The cuboid is then taken apart. How many of the 1 cm cubes have ${k?`exactly ${word(k)} painted ${s_(k,'face','faces')}`:'no painted faces'}?`,ans,sub==='bottom'?[
   `Look at the cuboid one layer at a time. Each layer is ${a} by ${b}: 4 corner cubes, ${Ed} other cubes round the edge, and ${Mi} middle cubes.`,
   `Top layer (its top is painted): corners have 3 painted faces, edge cubes 2, middle cubes 1.`,
   `Each of the other ${hh-1} ${s_(hh-1,'layer','layers')}, including the bottom layer whose underside is not painted: corners have 2 painted faces, edge cubes 1, middle cubes 0.`,
   `Exactly ${k}: ${topK} in the top layer and ${hh-1} × ${[Mi,Ed,4,0][k]} = ${(hh-1)*[Mi,Ed,4,0][k]} in the other layers.`,
   `Total = ${ans}.`]:[
   `Look at the cuboid one layer at a time. Each layer is ${a} by ${b}: 4 corner cubes, ${Ed} other cubes round the edge, and ${Mi} middle cubes.`,
   'The top and bottom are not painted, so every layer is painted only round its sides: corners have 2 painted faces, edge cubes 1, middle cubes 0.',
   `Each of the ${hh} layers has ${[Mi,Ed,4][k]} ${s_([Mi,Ed,4][k],'cube','cubes')} with ${k?`exactly ${word(k)}`:'no'} painted ${s_(k,'face','faces')}.`,
   `Total = ${hh} × ${[Mi,Ed,4][k]} = ${ans}.`],{variant:v,sub,a,b,h:hh,k},{figure:{module:'puzzles',kind:'pz-cuboid',a,b,c:hh,unpainted:sub==='bottom'?['bottom']:['top','bottom']}});
 }
 if(v==='dots'){
  const a=r(3,6),b=r(3,6),W=a-1,H=b-1,sub=pick(['all','all','tilted']),sizes=range(1,Math.min(W,H)),boxes=s=>(W-s+1)*(H-s+1),tot=sizes.reduce((x,s)=>x+(sub==='all'?s:s-1)*boxes(s),0);
  return out(sub==='all'?`The figure shows a ${a} by ${b} array of equally spaced dots. How many squares of any size have all four corners on dots? Count tilted squares too, like the dashed one.`:`The figure shows a ${a} by ${b} array of equally spaced dots. How many squares with all four corners on dots are tilted (not upright), like the dashed one?`,tot,[
   'Every square, upright or tilted, fits snugly inside an upright “box” square whose sides run along the rows and columns of dots.',
   `A box of side s holds exactly s such squares: the box itself and s − 1 tilted squares whose corners sit on the box’s sides, 1, 2, … , s − 1 steps from its corners.${sub==='tilted'?' So it holds s − 1 tilted squares.':''}`,
   `Boxes of each size: ${sizes.map(s=>`side ${s}: ${W-s+1} × ${H-s+1} = ${boxes(s)}`).join('; ')}.`,
   `Total = ${sizes.map(s=>`${sub==='all'?s:s-1} × ${boxes(s)}`).join(' + ')} = ${tot}.`],{variant:v,sub,a,b},{figure:{module:'puzzles',kind:'pz-dots',a,b}});
 }
 for(;;){
  const h=range(0,2).map(()=>range(0,2).map(()=>r(0,3))),{F,S}=viewsOf(h);if(F.includes(0)||S.includes(0)||Math.max(...F)<2)continue;
  const sub=pick(['top','spread']),mins=S.map(s=>F.map(f=>Math.min(f,s))),mx=mins.flat().reduce((x,y)=>x+y,0);
  if(sub==='top'){
   const top=h.map(row=>row.map(x=>x?1:0)),best=mins.map((row,i)=>row.map((x,j)=>top[i][j]?x:0)),ans=best.flat().reduce((x,y)=>x+y,0);if(ans===mx)continue;
   return out('Identical cubes are stacked on a 3 by 3 square mat. Each cube sits on a square of the mat or directly on top of another cube. The front view, the right side view and the top view are shown; the shaded squares in the top view are the squares that have cubes. What is the greatest number of cubes there could be?',ans,[
    `Front view, columns left to right: ${F.join(', ')}. Right side view, rows front to back: ${S.join(', ')}.`,
    'The top view shows which squares have at least one cube. The other squares are empty.',
    'On each used square, the tower can be no taller than the smaller of its column height and its row height.',
    `Greatest towers. Front row: ${best[0].join(', ')}; middle row: ${best[1].join(', ')}; back row: ${best[2].join(', ')}. These still give all three views.`,
    `Greatest number = ${ans}.`],{variant:v,sub,h},{figure:{module:'puzzles',kind:'pz-views',F,S,top}});
  }
  const hs=[...new Set([...F,...S])].sort((x,y)=>y-x),mn=hs.reduce((s,k)=>s+k*Math.max(F.filter(x=>x===k).length,S.filter(x=>x===k).length),0);if(mn===mx)continue;
  return out('Identical cubes are stacked on a 3 by 3 square mat. Each cube sits on a square of the mat or directly on top of another cube, and some squares may be empty. The front view and the right side view are shown. What is the difference between the greatest and the smallest number of cubes there could be?',mx-mn,[
   `Front view, columns left to right: ${F.join(', ')}. Right side view, rows front to back: ${S.join(', ')}.`,
   `Greatest: each square holds the smaller of its column and row heights. Rows front to back: ${mins.map(x=>x.join(', ')).join(' / ')}. Total ${mx}.`,
   `Smallest: each column and each row needs one tower of its full height, and one tower can serve a column and a row of the same height. ${hs.map(k=>{const m=Math.max(F.filter(x=>x===k).length,S.filter(x=>x===k).length);return `${m} ${s_(m,'tower','towers')} of ${k}`;}).join(', ')}: ${mn} cubes.`,
   `Difference = ${mx} − ${mn} = ${mx-mn}.`],{variant:v,sub,h},{figure:{module:'puzzles',kind:'pz-views',F,S}});
 }
}

/* ---------- counting ---------- */
function coinWays(A,coins){const c=coins.slice().sort((x,y)=>y-x);const rec=(i,rem)=>i===c.length-1?(rem%c[i]===0?1:0):range(0,Math.floor(rem/c[i])).reduce((s,n)=>s+rec(i+1,rem-n*c[i]),0);return rec(0,A);}
function countMake(form,r,pick,out){
 const intro='Mochi the cat walks along the lines of the grid from A to B, moving only right or up at each step.';
 const pt=(W,H)=>[r(1,W-1),r(1,H-1)];
 const same=(p,q)=>p[0]===q[0]&&p[1]===q[1];
 if(form===0){
  const v=pick(['paths','handshake','coins']);
  if(v==='paths'){
   const W=r(2,5),H=r(2,4),t=routes(W,H),ans=t[H][W];
   return out(`${intro} How many different routes are there?`,ans,[
    'Write at each point the number of routes from A to that point. Every point on the bottom edge or the left edge can be reached in only 1 way.',
    'Any other point is entered either from the point on its left or from the point below it, so its number is the sum of those two numbers.',
    `Numbers row by row, from the bottom: ${tableRows(t,[0,0],[W,H])}.`,
    `The number at B is ${ans}.`],{variant:v,W,H},{figure:{module:'puzzles',kind:'pz-paths',W,H,marks:[]}});
  }
  if(v==='handshake'){
   const sub=pick(['couples','diagonals','cards']);
   if(sub==='couples'){const n=r(3,10),P=2*n;return out(`${Word(n)} couples go to a party. Each guest shakes hands once with every other guest except their own partner. How many handshakes are there?`,choose(P,2)-n,[
    `There are ${P} guests. If everyone shook hands with everyone: ${P} × ${P-1} ÷ 2 = ${choose(P,2)} handshakes (each handshake involves two people, so halve).`,
    `The ${n} couples do not shake hands with each other, so remove ${n}.`,
    `Handshakes = ${choose(P,2)} − ${n} = ${choose(P,2)-n}.`,
    `Check: each guest shakes ${P-2} hands, and ${P} × ${P-2} ÷ 2 = ${P*(P-2)/2}.`],{variant:v,sub,n});}
   if(sub==='diagonals'){const n=r(5,20);return out(`A diagonal joins two corners of a polygon that are not next to each other. How many diagonals does a polygon with ${n} sides have?`,n*(n-3)/2,[
    `From each of the ${n} corners, a diagonal goes to every other corner except itself and its two neighbours: ${n} − 3 = ${n-3} diagonals.`,
    `${n} × ${n-3} = ${n*(n-3)} counts every diagonal twice, once from each end.`,
    `Diagonals = ${n*(n-3)} ÷ 2 = ${n*(n-3)/2}.`],{variant:v,sub,n});}
   const n=r(6,20);return out(`Each pupil in a group of ${n} sends one greeting card to every other pupil in the group. How many cards are sent altogether?`,n*(n-1),[
    `Each pupil sends ${n-1} cards, one to each of the others.`,
    'A card from Amir to Bella is a different card from one sent by Bella to Amir, so do not halve.',
    `Cards = ${n} × ${n-1} = ${n*(n-1)}.`],{variant:v,sub,n});
  }
  const A=10*r(5,15),ways=range(0,Math.floor(A/50)).map(f=>Math.floor((A-50*f)/20)+1),ans=ways.reduce((x,y)=>x+y,0);
  return out(`In how many different ways can you make ${cents(A)} using only 10-cent, 20-cent and 50-cent coins? You may use any number of each coin, including none.`,ans,[
   'Sort the ways by the number of 50-cent coins, then by the number of 20-cent coins. The 10-cent coins make up whatever is left, in exactly one way.',
   ...ways.map((w,f)=>`${f} × 50c leaves ${A-50*f} cents: from 0 to ${w-1} twenty-cent coins, so ${w} ${s_(w,'way','ways')}.`),
   `Total = ${ways.join(' + ')} = ${ans}.`],{variant:v,A});
 }
 if(form===1){
  const v=pick(['paths-closed','row','digit-sum']);
  if(v==='paths-closed'){
   const W=r(3,5),H=r(3,4),X=pt(W,H),t=routes(W,H,[X]),ans=t[H][W];
   return out(`${intro} Point X is closed, so Mochi may not pass through it. How many different routes are there?`,ans,[
    'Write at each point the number of routes from A to that point: the sum of the numbers at the point to its left and the point below.',
    'Point X cannot be used, so write 0 there. Routes through X are then never counted.',
    `Numbers row by row, from the bottom: ${tableRows(t,[0,0],[W,H])}.`,
    `The number at B is ${ans}.`],{variant:v,W,H,X},{figure:{module:'puzzles',kind:'pz-paths',W,H,marks:[{x:X[0],y:X[1],type:'closed',label:'X'}]}});
  }
  if(v==='row'){
   const n=r(4,6),names=FRIENDS.slice(0,n),[x,y]=shuffle(names,r),sub=pick(['together','apart','end']),f1=fact(n-1),f2=fact(n-2);
   const cond=sub==='together'?`${x} and ${y} must stand next to each other.`:sub==='apart'?`${x} and ${y} must not stand next to each other.`:`${x} must stand at one end of the row, and ${y} must not stand next to ${x}.`;
   const ans=sub==='together'?2*f1:sub==='apart'?fact(n)-2*f1:2*(n-2)*f2;
   return out(`${Word(n)} friends, ${andList(names)}, stand in a row for a photo. ${cond} How many different orders are possible?`,ans,sub==='end'?[
    `${x} goes first: 2 choices (left end or right end).`,
    `${y} cannot take ${x}’s place or the place next to ${x}: ${n} − 2 = ${n-2} choices.`,
    `The other ${n-2} friends fill the remaining places in ${n-2} × … × 1 = ${f2} ways.`,
    `Orders = 2 × ${n-2} × ${f2} = ${ans}.`]:[
    `Glue ${x} and ${y} into one block. Now there are ${n-1} things to arrange: ${n-1} × … × 1 = ${f1} ways.`,
    `Inside the block, ${x} and ${y} can stand in 2 orders: ${f1} × 2 = ${2*f1} orders with them together.`,
    ...(sub==='apart'?[`All orders without any rule: ${n} × … × 1 = ${fact(n)}.`,`Not together = ${fact(n)} − ${2*f1} = ${ans}.`]:[`Answer: ${ans}.`])],{variant:v,sub,n,x,y});
  }
  const s=r(4,11),hs=range(1,Math.min(9,s)),cnt=hs.map(hh=>{const t=s-hh;return t<=9?t+1:19-t;}),ans=cnt.reduce((a,b)=>a+b,0);
  return out(`How many three-digit numbers have digits that add up to ${s}? (For example, ${hs[0]}${s-hs[0]>9?9:s-hs[0]}${s-hs[0]>9?s-hs[0]-9:0} is one of them.)`,ans,[
   `Call the digits h (hundreds, 1 to 9), t and u (0 to 9). Then h + t + u = ${s}.`,
   'Fix h. Then t + u is fixed, and t can be any digit that leaves u as a digit too.',
   cnt.map((c,i)=>`h = ${hs[i]}: t + u = ${s-hs[i]}, ${c} ${s_(c,'way','ways')}`).join('; ')+'.',
   `Total = ${cnt.join(' + ')} = ${ans}.`],{variant:v,s});
 }
 if(form===2){
  const v=pick(['paths-via','venn','contains']);
  if(v==='paths-via'){
   const W=r(4,5),H=r(3,4),P=pt(W,H);
   if(r(0,1)===0){
    const a=routes(W,H,[],[0,0],P)[P[1]][P[0]],b=routes(W,H,[],P,[W,H])[H][W],ans=a*b;
    return out(`${intro} Mochi must pass through point P. How many different routes are there?`,ans,[
     'Every route through P is a route from A to P followed by a route from P to B.',
     `Routes from A to P (adding table): ${a}.`,
     `Routes from P to B (start a new table at P): ${b}.`,
     `Each first part can go with each second part: ${a} × ${b} = ${ans}.`],{variant:v,sub:'via',W,H,P},{figure:{module:'puzzles',kind:'pz-paths',W,H,marks:[{x:P[0],y:P[1],type:'via',label:'P'}]}});
   }
   let Q;do Q=pt(W,H);while(same(P,Q)||!((Q[0]>=P[0]&&Q[1]>=P[1])||(Q[0]<=P[0]&&Q[1]<=P[1])));
   const thr=p=>routes(W,H,[],[0,0],p)[p[1]][p[0]]*routes(W,H,[],p,[W,H])[H][W];
   const [lo,hi]=(Q[0]>=P[0]&&Q[1]>=P[1])?[P,Q]:(P[0]>=Q[0]&&P[1]>=Q[1])?[Q,P]:[null,null];
   const both=lo?routes(W,H,[],[0,0],lo)[lo[1]][lo[0]]*routes(W,H,[],lo,hi)[hi[1]][hi[0]]*routes(W,H,[],hi,[W,H])[H][W]:0,ans=thr(P)+thr(Q)-both;
   return out(`${intro} Mochi must pass through P or Q (or both). How many different routes are there?`,ans,[
    `Through P: (A to P) × (P to B) = ${thr(P)}. Through Q: ${thr(Q)}.`,
    'Routes through both P and Q were counted twice, so subtract them once.',
    lo?`A route can visit both only in the order ${lo===P?'P then Q':'Q then P'}: (A to ${lo===P?'P':'Q'}) × (${lo===P?'P to Q':'Q to P'}) × (${hi===P?'P':'Q'} to B) = ${both}.`:'Neither point is up and to the right of the other, so no route passes through both: 0.',
    `Total = ${thr(P)} + ${thr(Q)} − ${both} = ${ans}.`],{variant:v,sub:'or',W,H,P,Q},{figure:{module:'puzzles',kind:'pz-paths',W,H,marks:[{x:P[0],y:P[1],type:'via',label:'P'},{x:Q[0],y:Q[1],type:'via',label:'Q'}]}});
  }
  if(v==='venn'){
   const abc=r(1,4),ab=r(0,5),ac=r(0,5),bc=r(0,5),a=r(2,9),b=r(2,9),c=r(2,9),none=r(1,6),A=a+ab+ac+abc,B=b+ab+bc+abc,C=c+ac+bc+abc,AB=ab+abc,AC=ac+abc,BC=bc+abc,U=a+b+c+ab+ac+bc+abc,N=U+none,sub=pick(['none','one','all']);
   const base=`In a class of ${N} pupils, ${A} are in the Art club, ${B} in the Band club and ${C} in the Chess club. ${AB} are in both Art and Band, ${AC} in both Art and Chess, and ${BC} in both Band and Chess (each of these numbers includes the pupils in all three clubs).`;
   if(sub==='all')return out(`${base} ${none} pupils are in none of the clubs. How many pupils are in all three clubs?`,abc,[
    `Pupils in at least one club: ${N} − ${none} = ${U}.`,
    'Adding the three clubs counts pupils in two clubs twice and pupils in all three clubs three times. Subtracting the three “both” numbers removes pupils in all three clubs three times.',
    `So (at least one) = ${A} + ${B} + ${C} − ${AB} − ${AC} − ${BC} + (all three), that is ${U} = ${A+B+C-AB-AC-BC} + (all three).`,
    `All three = ${U} − ${A+B+C-AB-AC-BC} = ${abc}.`],{variant:v,sub,N,A,B,C,AB,AC,BC,none});
   if(sub==='none')return out(`${base} ${abc} ${s_(abc,'pupil is','pupils are')} in all three clubs. How many pupils are in none of the clubs?`,none,[
    `Add the clubs: ${A} + ${B} + ${C} = ${A+B+C}. Pupils in two clubs were counted twice and pupils in all three clubs three times.`,
    `Subtract the pairs: ${A+B+C} − ${AB} − ${AC} − ${BC} = ${A+B+C-AB-AC-BC}. Now pupils in exactly two clubs count once, but pupils in all three count 3 − 3 = 0 times.`,
    `Add back all three: ${A+B+C-AB-AC-BC} + ${abc} = ${U} pupils in at least one club.`,
    `None = ${N} − ${U} = ${none}.`],{variant:v,sub,N,A,B,C,AB,AC,BC,abc});
   return out(`${base} ${abc} ${s_(abc,'pupil is','pupils are')} in all three clubs. How many pupils are in exactly one club?`,a+b+c,[
    `Exactly two clubs: Art and Band only ${AB} − ${abc} = ${ab}; Art and Chess only ${AC} − ${abc} = ${ac}; Band and Chess only ${BC} − ${abc} = ${bc}.`,
    `Art only = ${A} − ${ab} − ${ac} − ${abc} = ${a}. Band only = ${B} − ${ab} − ${bc} − ${abc} = ${b}.`,
    `Chess only = ${C} − ${ac} − ${bc} − ${abc} = ${c}.`,
    `Exactly one club = ${a} + ${b} + ${c} = ${a+b+c}.`],{variant:v,sub,N,A,B,C,AB,AC,BC,abc});
  }
  if(r(0,1)===0){
   const d=r(0,9),hc=d?8:9,no=hc*81,ans=900-no;
   return out(`How many three-digit numbers (from 100 to 999) contain at least one digit ${d}?`,ans,[
    `Count the opposite: three-digit numbers with no ${d} at all.`,
    `Hundreds digit: 1 to 9${d?`, but not ${d}`:''}: ${hc} choices. Tens and units: any digit except ${d}: 9 choices each.`,
    `No ${d}: ${hc} × 9 × 9 = ${no}. There are 900 three-digit numbers.`,
    `At least one ${d}: 900 − ${no} = ${ans}.`],{variant:'contains',sub:'three',d});
  }
  const k=r(2,9),d=r(1,9),N=100*k-1,hk=k-(d<=k-1?1:0),ans=100*k-hk*81;
  return out(`How many whole numbers from 1 to ${N} contain at least one digit ${d}?`,ans,[
   `Write every number from 0 to ${N} with three digits, using zeros in front (7 becomes 007). This adds no new ${d}s, and 000 has no ${d}.`,
   `Count the opposite. Hundreds digit 0 to ${k-1}${d<=k-1?`, but not ${d}`:''}: ${hk} choices. Tens and units: any digit except ${d}: 9 choices each.`,
   `Without a ${d}: ${hk} × 9 × 9 = ${hk*81}, out of ${100*k} numbers from 000 to ${N}.`,
   `With at least one ${d}: ${100*k} − ${hk*81} = ${ans}.`],{variant:'contains',sub:'range',k,d});
 }
 const v=pick(['paths-avoid','digits','coins']);
 if(v==='paths-avoid'){
  for(;;){
   const W=r(4,6),H=r(3,5),P=pt(W,H),Q=pt(W,H);if(same(P,Q))continue;
   const a=routes(W,H,[Q],[0,0],P)[P[1]][P[0]],b=routes(W,H,[Q],P,[W,H])[H][W],ans=a*b,free=routes(W,H,[],[0,0],P)[P[1]][P[0]]*routes(W,H,[],P,[W,H])[H][W];
   if(ans===free||ans===0)continue;
   const inFirst=Q[0]<=P[0]&&Q[1]<=P[1];
   return out(`${intro} Mochi must pass through point P, but must not pass through point Q. How many different routes are there?`,ans,[
    'Split every route at P: a route from A to P, then a route from P to B. Neither part may use Q.',
    `A to P with a 0 at Q${inFirst?'':' (Q is not on the way to P, so nothing changes)'}: numbers row by row from the bottom: ${tableRows(routes(W,H,[Q],[0,0],P),[0,0],P)}. So ${a} ${s_(a,'way','ways')}.`,
    `P to B with a 0 at Q${!inFirst&&Q[0]>=P[0]&&Q[1]>=P[1]?'':' (Q is not on the way from P, so nothing changes)'}: numbers row by row from P: ${tableRows(routes(W,H,[Q],P,[W,H]),P,[W,H])}. So ${b} ${s_(b,'way','ways')}.`,
    `Routes = ${a} × ${b} = ${ans}.`],{variant:v,W,H,P,Q},{figure:{module:'puzzles',kind:'pz-paths',W,H,marks:[{x:P[0],y:P[1],type:'via',label:'P'},{x:Q[0],y:Q[1],type:'closed',label:'Q'}]}});
  }
 }
 if(v==='digits'){
  for(;;){
   const L=r(3,4),size=L===4?5:r(4,5),cond=pick(['even','odd','five']),others=shuffle(range(1,9),r).slice(0,size-1);
   if(cond==='five'&&!others.includes(5))others[0]=5;
   const D=[0,...others].sort((x,y)=>x-y),last=D.filter(x=>cond==='even'?x%2===0:cond==='odd'?x%2===1:x%5===0);if(!last.length)continue;
   const mid=perm(size-2,L-2),rows=last.map(e=>{const fc=e===0?size-1:size-2;return {e,fc,ways:fc*mid};}),ans=rows.reduce((s,x)=>s+x.ways,0);
   const what=cond==='five'?'multiples of 5':cond==='even'?'even numbers':'odd numbers';
   return out(`How many ${word(L)}-digit ${what} can be made from the digits ${andList(D.map(String))}, using each digit at most once? A number cannot start with 0.`,ans,[
    `The last digit decides whether the number is ${cond==='five'?'a multiple of 5':cond}: it must be ${orList(last.map(String))}. The first digit cannot be 0. Fill these two places before the middle.`,
    ...rows.map(x=>`Last digit ${x.e}: first digit from the ${x.e===0?'other':'remaining non-zero'} digits (${x.fc} choices), then the ${L-2} middle ${s_(L-2,'place','places')} from the ${size-2} digits left (${mid} ${s_(mid,'way','ways')}): ${x.fc} × ${mid} = ${x.ways}.`),
    rows.length>1?`Total = ${rows.map(x=>x.ways).join(' + ')} = ${ans}.`:`Total = ${ans}.`],{variant:v,L,D,cond});
  }
 }
 if(r(0,1)===0){
  const A=pick([150,200,250]),coins=[100,50,20,10],ans=coinWays(A,coins);
  const groups=range(0,Math.floor(A/100)).map(d=>{const rem=A-100*d,parts=range(0,Math.floor(rem/50)).map(f=>Math.floor((rem-50*f)/20)+1);return {d,rem,parts,sum:parts.reduce((x,y)=>x+y,0)};});
  return out(`In how many different ways can you make ${cents(A)} using only 10-cent, 20-cent, 50-cent and S$1 coins? You may use any number of each coin, including none.`,ans,[
   'List the cases by the number of S$1 coins, then 50-cent coins, then 20-cent coins. The 10-cent coins fill the rest in exactly one way.',
   ...groups.map(g=>`${g.d} × S$1 leaves ${g.rem} cents. For 0 to ${g.parts.length-1} fifty-cent coins the 20-cent choices are ${g.parts.join(', ')}: ${g.sum} ${s_(g.sum,'way','ways')}.`),
   `Total = ${groups.map(g=>g.sum).join(' + ')} = ${ans}.`],{variant:'coins',sub:'coins',A});
 }
 const A=r(20,40),stamps=[10,5,2],ans=coinWays(A,stamps);
 const groups=range(0,Math.floor(A/10)).map(t=>{const rem=A-10*t,fives=range(0,Math.floor(rem/5)).filter(f=>(rem-5*f)%2===0);return {t,rem,fives};});
 return out(`A letter needs exactly ${A} cents of postage. You have plenty of 2-cent, 5-cent and 10-cent stamps. In how many different ways can you make exactly ${A} cents? (Only the number of each kind of stamp matters, not the order.)`,ans,[
  'List the cases by the number of 10-cent stamps, then the number of 5-cent stamps. The rest must be made with 2-cent stamps, so it must be an even amount.',
  ...groups.map(g=>`${g.t} × 10c leaves ${g.rem} cents: 5-cent stamps ${g.fives.length?orList(g.fives.map(String)):'— none works'} (leaving an even amount): ${g.fives.length} ${s_(g.fives.length,'way','ways')}.`),
  `Total = ${groups.map(g=>g.fives.length).join(' + ')} = ${ans}.`],{variant:'coins',sub:'stamps',A});
}

function make(id,form,seed,r){
 let q=null;const out=(text,answer,steps,params={},extra={})=>(q={text,answer,steps,params,...extra});
 const pick=a=>a[r(0,a.length-1)];
 if(!Number.isInteger(form)||form<0||form>3)return null;
 if(id==='pz-logic')logicMake(form,r,pick,out);
 else if(id==='pz-space')spaceMake(form,r,pick,out);
 else if(id==='pz-count')countMake(form,r,pick,out);
 return q;
}

/* ---------- exam-style monochrome figures ---------- */
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const f=x=>Number(x.toFixed(2));
const T=(x,y,t,extra='')=>`<text x="${f(x)}" y="${f(y)}"${extra?' '+extra:''}>${esc(t)}</text>`;
const L=(a,b,extra='')=>`<line x1="${f(a[0])}" y1="${f(a[1])}" x2="${f(b[0])}" y2="${f(b[1])}"${extra?' '+extra:''}/>`;
const Pg=(pts,extra='')=>`<polygon points="${pts.map(p=>f(p[0])+','+f(p[1])).join(' ')}"${extra?' '+extra:''}/>`;
const small='class="pz-small"',halo='class="pz-halo"';
function frame(key,alt,body,view='0 0 480 320'){
 return `<svg class="entrance-figure" viewBox="${view}" role="img" aria-labelledby="${key}-title" xmlns="http://www.w3.org/2000/svg"><title id="${key}-title">${esc(alt)}</title><defs><pattern id="${key}" width="6" height="6" patternUnits="userSpaceOnUse"><path d="M-1 1L1 -1M0 6L6 0M5 7L7 5" stroke="#888" stroke-width=".7"/></pattern></defs><g fill="none" stroke="#222" stroke-width="1.6" stroke-linejoin="round">${body}</g><style>.entrance-figure text{fill:#222;stroke:none;font:19px Georgia,serif;text-anchor:middle}.entrance-figure text.pz-small{font-size:15px}.entrance-figure text.pz-halo{stroke:#fff;stroke-width:5px;paint-order:stroke;stroke-linejoin:round}</style></svg>`;
}
function cevianGeometry(p,q){
 const A=[240,34],B=[60,286],C=[420,286],lines=[[A,B],[A,C],[B,C]];
 for(let i=1;i<=p;i++)lines.push([A,[B[0]+(C[0]-B[0])*i/(p+1),B[1]]]);
 for(let j=1;j<=q;j++){const t=j/(q+1)*.82+.12,y=A[1]+(B[1]-A[1])*t;lines.push([[A[0]+(B[0]-A[0])*t,y],[A[0]+(C[0]-A[0])*t,y]]);}
 return {A,B,C,lines};
}
function diagram(spec,id='figure',help=false){
 if(!spec)return '';
 const key='pz-'+String(id).replace(/[^a-zA-Z0-9_-]/g,'').slice(0,90),hatch=`url(#${key})`;
 if(spec.kind==='pz-cuboid'){
  const {a,b,c}=spec,un=spec.unpainted||[],cs=Math.cos(Math.PI/6),sn=.5;
  const s=Math.min(330/((a+b)*cs),200/(c+(a+b)*sn)),wid=(a+b)*cs*s,hei=(c+(a+b)*sn)*s,ox=240-wid/2+b*cs*s,oy=152-hei/2+c*s;
  const P=(x,y,z)=>[ox+(x-y)*cs*s,oy+(x+y)*sn*s-z*s],grey='#d4d4d4',topFill=un.includes('top')?'#fff':grey;
  let body=Pg([P(0,0,c),P(a,0,c),P(a,b,c),P(0,b,c)],`fill="${topFill}"`)+Pg([P(a,0,0),P(a,b,0),P(a,b,c),P(a,0,c)],`fill="${grey}"`)+Pg([P(0,b,0),P(a,b,0),P(a,b,c),P(0,b,c)],`fill="#e6e6e6"`);
  const thin='stroke-width="1" stroke="#555"';
  for(let i=1;i<a;i++)body+=L(P(i,0,c),P(i,b,c),thin)+L(P(i,b,0),P(i,b,c),thin);
  for(let j=1;j<b;j++)body+=L(P(0,j,c),P(a,j,c),thin)+L(P(a,j,0),P(a,j,c),thin);
  for(let k=1;k<c;k++)body+=L(P(0,b,k),P(a,b,k),thin)+L(P(a,b,k),P(a,0,k),thin);
  body+=Pg([P(0,0,c),P(a,0,c),P(a,b,c),P(0,b,c)])+Pg([P(a,0,0),P(a,b,0),P(a,b,c),P(a,0,c)])+Pg([P(0,b,0),P(a,b,0),P(a,b,c),P(0,b,c)]);
  const mid=(p,q)=>[(p[0]+q[0])/2,(p[1]+q[1])/2],fb=mid(P(0,b,0),P(a,b,0)),rb=mid(P(a,b,0),P(a,0,0)),hl=mid(P(0,b,0),P(0,b,c));
  body+=T(fb[0]-16,fb[1]+28,`${a} cm`,small)+T(rb[0]+20,rb[1]+28,`${b} cm`,small)+T(hl[0]-34,hl[1]+5,`${c} cm`,small);
  if(un.includes('top')){const tc=P(a/2,b/2,c);body+=T(tc[0],tc[1]+5,'not painted','class="pz-small pz-halo"');}
  if(un.length)body+=T(240,312,un.includes('top')?'Shaded faces are painted. The top and bottom are not.':'Shaded faces are painted. The bottom is not.',small);
  return frame(key,`Cuboid ${a} cm by ${b} cm by ${c} cm built from 1 cm cubes${un.length?`; not painted: ${un.join(' and ')}`:'; painted on every face'}.`,body);
 }
 if(spec.kind==='pz-grid'){
  const {W,H}=spec,s=Math.min(360/W,240/H),x0=240-W*s/2,y0=160-H*s/2;let body='';
  for(let i=0;i<=W;i++)body+=L([x0+i*s,y0],[x0+i*s,y0+H*s]);
  for(let j=0;j<=H;j++)body+=L([x0,y0+j*s],[x0+W*s,y0+j*s]);
  return frame(key,`A grid of ${W} by ${H} small squares.`,body);
 }
 if(spec.kind==='pz-views'){
  const {F,S,top}=spec,panels=top?3:2,maxH=Math.max(...F,...S),w=panels===3?140:190,cs=Math.min(panels===3?34:42,(w-20)/Math.max(F.length,S.length),170/maxH),ground=250;let body='';
  const centres=panels===3?[85,240,395]:[130,350];
  const elev=(hs,cx,cap,ends)=>{const x0=cx-hs.length*cs/2;let b=L([x0-12,ground],[x0+hs.length*cs+12,ground],'stroke-width="2"');hs.forEach((hh,i)=>{for(let k=0;k<hh;k++)b+=`<rect x="${f(x0+i*cs)}" y="${f(ground-(k+1)*cs)}" width="${f(cs)}" height="${f(cs)}" fill="#e6e6e6"/>`;});
   b+=T(cx,ground+48,cap,small);if(ends)b+=T(x0+cs/2,ground+22,ends[0],small)+T(x0+(hs.length-.5)*cs,ground+22,ends[1],small);return b;};
  body+=elev(F,centres[0],'Front view',['left','right'])+elev(S,centres[1],'Right side view',['front','back']);
  if(top){const cx=centres[2],rows=top.length,cols=top[0].length,x0=cx-cols*cs/2,y0=ground-rows*cs;
   top.forEach((row,i)=>row.forEach((v,j)=>{body+=`<rect x="${f(x0+j*cs)}" y="${f(y0+(rows-1-i)*cs)}" width="${f(cs)}" height="${f(cs)}" fill="${v?'#bdbdbd':'#fff'}"/>`;}));
   body+=T(cx,ground+22,'front',small)+T(cx,ground+48,'Top view',small);}
  return frame(key,`Front view column heights ${F.join(', ')} (left to right); right side view row heights ${S.join(', ')} (front to back)${top?`; top view, front row first: ${top.map(r=>r.map(v=>v?'cube':'empty').join(' ')).join(' / ')}`:''}.`,body);
 }
 if(spec.kind==='pz-cevians'){
  const g=cevianGeometry(spec.p,spec.q);let body=g.lines.map(([a,b])=>L(a,b)).join('');
  body+=T(g.A[0],g.A[1]-12,'A')+T(g.B[0]-16,g.B[1]+8,'B')+T(g.C[0]+16,g.C[1]+8,'C');
  return frame(key,`Triangle ABC with ${spec.p} ${s_(spec.p,'line','lines')} from A to BC${spec.q?` and ${spec.q} ${s_(spec.q,'line','lines')} parallel to BC`:''}.`,body);
 }
 if(spec.kind==='pz-strip'){
  const {m,mode}=spec,s=Math.min(400/m,150),x0=240-m*s/2,y0=160-s/2,X=i=>x0+i*s,Y=j=>y0+(1-j)*s;let body=L([X(0),Y(0)],[X(m),Y(0)])+L([X(0),Y(1)],[X(m),Y(1)]);
  for(let i=0;i<=m;i++)body+=L([X(i),Y(0)],[X(i),Y(1)]);
  for(let i=0;i<m;i++){if(mode==='both')body+=L([X(i),Y(0)],[X(i+1),Y(1)])+L([X(i),Y(1)],[X(i+1),Y(0)]);else body+=i%2?L([X(i),Y(1)],[X(i+1),Y(0)]):L([X(i),Y(0)],[X(i+1),Y(1)]);}
  return frame(key,`A row of ${m} squares with ${mode==='both'?'both diagonals in every square':'one diagonal in each square, forming a zigzag'}.`,body);
 }
 if(spec.kind==='pz-net'){
  const {cells,labels}=spec,cols=Math.max(...cells.map(c=>c[0]))+1,rows=Math.max(...cells.map(c=>c[1]))+1,s=Math.min(64,400/cols,260/rows),x0=240-cols*s/2,y0=160-rows*s/2;
  const body=cells.map(([x,y],i)=>`<rect x="${f(x0+x*s)}" y="${f(y0+y*s)}" width="${f(s)}" height="${f(s)}" fill="#f4f4f4"/>`+T(x0+(x+.5)*s,y0+(y+.5)*s+7,labels[i])).join('');
  return frame(key,`Cube net of six squares numbered ${labels.join(', ')}.`,body);
 }
 if(spec.kind==='pz-paths'){
  const {W,H,marks}=spec,s=Math.min(380/W,230/H),x0=240-W*s/2,y0=165+H*s/2,X=i=>x0+i*s,Y=j=>y0-j*s;let body='';
  for(let i=0;i<=W;i++)body+=L([X(i),Y(0)],[X(i),Y(H)]);for(let j=0;j<=H;j++)body+=L([X(0),Y(j)],[X(W),Y(j)]);
  body+=`<circle cx="${f(X(0))}" cy="${f(Y(0))}" r="5" fill="#222"/><circle cx="${f(X(W))}" cy="${f(Y(H))}" r="5" fill="#222"/>`+T(X(0)-16,Y(0)+22,'A')+T(X(W)+16,Y(H)-10,'B');
  for(const mk of marks){const cx=X(mk.x),cy=Y(mk.y);
   body+=mk.type==='closed'?L([cx-9,cy-9],[cx+9,cy+9],'stroke-width="3.5"')+L([cx-9,cy+9],[cx+9,cy-9],'stroke-width="3.5"'):`<circle cx="${f(cx)}" cy="${f(cy)}" r="7" fill="#222"/>`;
   body+=T(cx-17,cy-11,mk.label,halo);}
  return frame(key,`Grid of ${W} by ${H} squares from A (bottom left) to B (top right)${marks.length?'; '+marks.map(m=>`${m.label} ${m.type==='closed'?'(closed)':'(must pass)'} at ${m.x} right, ${m.y} up`).join('; '):''}.`,body);
 }
 if(spec.kind==='pz-dots'){
  const {a,b}=spec,s=Math.min(380/(a-1),240/(b-1),70),x0=240-(a-1)*s/2,y0=160+(b-1)*s/2,X=i=>x0+i*s,Y=j=>y0-j*s;let body='';
  for(let i=0;i<a;i++)for(let j=0;j<b;j++)body+=`<circle cx="${f(X(i))}" cy="${f(Y(j))}" r="4" fill="#222" stroke="none"/>`;
  body+=Pg([[X(1),Y(0)],[X(2),Y(1)],[X(1),Y(2)],[X(0),Y(1)]],'stroke-dasharray="7 5"');
  return frame(key,`A ${a} by ${b} array of dots; a dashed tilted square has corners on four dots.`,body);
 }
 if(spec.kind==='pz-fold'){
  let body='';
  if(spec.mode==='strip'){
   const k=spec.k,len=440,x0=20,y0=70,layers=2**k,w=len/layers;
   body+=`<rect x="${x0}" y="${y0-14}" width="${len}" height="28" fill="#f4f4f4"/>`+T(240,y0-26,'strip before folding',small);
   for(let i=1;i<layers;i++)body+=L([x0+i*w,y0-14],[x0+i*w,y0+14],'stroke-dasharray="3 4" stroke-width="1"');
   const fw=Math.max(110,w),fx=240-fw/2,fy=170,lh=Math.min(10,90/layers);
   for(let i=0;i<layers;i++)body+=`<rect x="${f(fx)}" y="${f(fy+i*lh)}" width="${f(fw)}" height="${f(lh)}" fill="#f4f4f4" stroke-width="1"/>`;
   spec.cuts.forEach(t=>{const cx=fx+t*fw;body+=L([cx,fy-14],[cx,fy+layers*lh+14],'stroke-dasharray="6 4" stroke-width="2"');});
   body+=T(240,fy-26,`after ${k} folds: ${layers} layers`,small)+T(fx+spec.cuts[0]*fw,fy+layers*lh+36,'cut',small);
   return frame(key,`A strip folded in half ${k} times, with ${spec.cuts.length} straight ${s_(spec.cuts.length,'cut','cuts')} across the folded strip.`,body);
  }
  const k=spec.k,S=150,x0=40,y0=70,u=S/8;
  body+=`<rect x="${x0}" y="${y0}" width="${S}" height="${S}" fill="#f4f4f4"/>`+L([x0,y0+S/2],[x0+S,y0+S/2],'stroke-dasharray="6 4"')+T(x0+S+14,y0+S/2+6,'1',small)+L([x0+S/2,y0],[x0+S/2,y0+S],'stroke-dasharray="6 4"')+T(x0+S/2,y0-8,'2',small);
  if(k===3)body+=L([x0,y0+S/4],[x0+S,y0+S/4],'stroke-dasharray="2 4"')+L([x0,y0+3*S/4],[x0+S,y0+3*S/4],'stroke-dasharray="2 4"')+T(x0+S+14,y0+S/4+6,'3',small)+T(x0+S+14,y0+3*S/4+6,'3',small);
  body+=T(x0+S/2,y0+S+30,'fold lines 1, 2'+(k===3?', 3':''),small)+L([x0+S+30,y0+S/2],[x0+S+70,y0+S/2],'stroke-width="2"')+`<path d="M${x0+S+62} ${y0+S/2-6}L${x0+S+70} ${y0+S/2}L${x0+S+62} ${y0+S/2+6}"/>`;
  const fw=4,fh=k===2?4:2,sc=Math.min(180/fw,180/fh,40),fx=280,fy=y0+S/2+fh*sc/2,FX=x=>fx+x*sc,FY=y=>fy-y*sc;
  body+=`<rect x="${f(FX(0))}" y="${f(FY(fh))}" width="${f(fw*sc)}" height="${f(fh*sc)}" fill="#f4f4f4"/>`;
  const creaseRight=k===2;
  body+=creaseRight?L([FX(fw),FY(0)],[FX(fw),FY(fh)],'stroke-width="4"')+T(FX(fw)+24,FY(fh/2)+6,'fold',small):L([FX(0),FY(fh)],[FX(fw),FY(fh)],'stroke-width="4"')+T(FX(fw/2),FY(fh)-12,'fold',small);
  for(const [hx,hy] of spec.holes)body+=`<circle cx="${f(FX(hx))}" cy="${f(FY(hy))}" r="${f(sc*.22)}" fill="#fff" stroke-width="1.6"/>`;
  if(spec.notch){const [nx,ny]=spec.notch,rr=sc*.25;body+=creaseRight?`<path d="M${f(FX(nx))} ${f(FY(ny)-rr)}A${f(rr)} ${f(rr)} 0 0 0 ${f(FX(nx))} ${f(FY(ny)+rr)}Z" fill="#fff"/>`:`<path d="M${f(FX(nx)-rr)} ${f(FY(ny))}A${f(rr)} ${f(rr)} 0 0 0 ${f(FX(nx)+rr)} ${f(FY(ny))}Z" fill="#fff"/>`;}
  body+=T(FX(fw/2),FY(0)+30,'folded and punched',small);
  return frame(key,`A square sheet folded ${k} times, then punched with ${spec.holes.length} ${s_(spec.holes.length,'hole','holes')}${spec.notch?' and one half-circle notch on the last fold':''}.`,body);
 }
 return '';
}
const api={units,make,diagram,quickChecks,rollNet,NETS,cevianGeometry,routes,coinWays,gameTable,propagate,paintedCounts};
root.MochiDSA_puzzles=api;
if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
