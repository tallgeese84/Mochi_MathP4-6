const test=require('node:test'),assert=require('node:assert/strict');
const W=require('../wide-reading.js');
const day=(start,n)=>new Date(Date.parse(start+'T00:00:00Z')+n*86400000).toISOString().slice(0,10);

test('72 facts, 36 maths and 36 science, with unique ids',()=>{
 assert.equal(W.facts.length,72);
 assert.equal(W.facts.filter(f=>f.subject==='maths').length,36);
 assert.equal(W.facts.filter(f=>f.subject==='science').length,36);
 assert.equal(new Set(W.facts.map(f=>f.id)).size,72);
 assert.equal(globalThis.MochiWideReading,W);
});

test('every fact is well formed',()=>{
 for(const f of W.facts){
  assert.ok(['maths','science'].includes(f.subject),f.id);
  assert.ok(typeof f.topic==='string'&&f.topic.trim(),`${f.id} topic`);
  assert.ok(typeof f.question==='string'&&f.question.trim().length>10,`${f.id} question`);
  assert.ok([1,2,3].includes(f.level),`${f.id} level`);
  assert.equal(f.choices.length,4,`${f.id} has 4 choices`);
  assert.equal(new Set(f.choices.map(c=>c.trim().toLowerCase())).size,4,`${f.id} choices are distinct`);
  for(const c of f.choices)assert.ok(typeof c==='string'&&c.trim(),`${f.id} empty choice`);
  assert.ok(Number.isInteger(f.answer)&&f.answer>=0&&f.answer<4,`${f.id} answer index`);
  assert.ok(typeof f.explain==='string'&&f.explain.length>=80,`${f.id} explanation`);
  // Split on sentence ends, but not after initials such as “G. H. Hardy”.
  const sentences=f.explain.split(/(?<=[^A-Z][.!?…])\s+(?=[A-Z0-9“"(])/).length;
  assert.ok(sentences>=2&&sentences<=3,`${f.id} explanation should be 2–3 sentences (${sentences})`);
 }
});

test('answer positions are balanced',()=>{
 const pos=[0,0,0,0];for(const f of W.facts)pos[f.answer]++;
 for(const n of pos)assert.ok(n>=12,`positions ${pos}`);
});

test('the correct answer is the longest option in at most 30% of facts (ties count)',()=>{
 const longest=W.facts.filter(f=>{const L=f.choices.map(c=>c.length);return L[f.answer]===Math.max(...L);});
 assert.ok(longest.length<=Math.floor(W.facts.length*0.3),`${longest.length} facts: ${longest.map(f=>f.id).join(', ')}`);
});

test('no option is shorter than 40% of the longest option in its item',()=>{
 for(const f of W.facts){
  const L=f.choices.map(c=>c.length),max=Math.max(...L);
  for(const [i,len] of L.entries())assert.ok(len>=0.4*max,`${f.id} option “${f.choices[i]}” is too short`);
 }
});

test('facts include women and Asian mathematicians and scientists, and Singapore science',()=>{
 const text=W.facts.map(f=>f.question+' '+f.choices.join(' ')+' '+f.explain).join(' ');
 for(const name of ['Marie Curie','Ada Lovelace','Emmy Noether','Ramanujan','Chien-Shiung Wu','Tu Youyou','Katherine Johnson','Zhang Heng','Al-Khwarizmi','NEWater','mangrove'])
  assert.ok(text.includes(name),name);
});

test('check() reports correctness and the explanation',()=>{
 for(const f of W.facts){
  assert.deepEqual(W.check(f.id,f.answer),{correct:true,explain:f.explain});
  assert.equal(W.check(f.id,(f.answer+1)%4).correct,false);
  assert.equal(W.check(f.id,f.choices[f.answer]).correct,true);
 }
 assert.equal(W.check('nope',0),null);
});

test('factForDay is deterministic, alternates subjects and prefers unseen facts',()=>{
 assert.equal(W.factForDay('2026-10-01'),W.factForDay('2026-10-01'));
 assert.equal(W.factForDay('2026-13-01'),null);
 assert.equal(W.factForDay('2026-02-30'),null);
 assert.equal(W.factForDay(''),null);
 for(let n=0;n<20;n++)assert.notEqual(W.factForDay(day('2026-10-01',n)).subject,W.factForDay(day('2026-10-01',n+1)).subject);
 const first=W.factForDay('2026-10-01'),next=W.factForDay('2026-10-01',[first.id]);
 assert.notEqual(next.id,first.id);
 assert.equal(next.subject,first.subject);
 // Feeding back what she has seen covers every fact in 72 days.
 const seen=[];
 for(let n=0;n<72;n++){const f=W.factForDay(day('2026-10-01',n),seen);assert.ok(!seen.includes(f.id),`repeat ${f.id} on day ${n}`);seen.push(f.id);}
 assert.equal(new Set(seen).size,72);
 // Once one subject is exhausted, unseen facts from the other subject are used.
 const allMaths=W.facts.filter(f=>f.subject==='maths').map(f=>f.id),d=first.subject==='maths'?'2026-10-01':'2026-10-02';
 assert.equal(W.factForDay(d,allMaths).subject,'science');
 // When everything has been seen it still returns a fact.
 assert.ok(W.factForDay('2026-10-01',W.facts.map(f=>f.id)));
});

test('12 investigations, 6 per subject, each complete',()=>{
 const I=W.investigations;
 assert.equal(I.length,12);
 assert.equal(I.filter(x=>x.subject==='maths').length,6);
 assert.equal(I.filter(x=>x.subject==='science').length,6);
 assert.equal(new Set(I.map(x=>x.id)).size,12);
 for(const x of I){
  for(const k of ['title','question','predict','record','grownUp'])assert.ok(typeof x[k]==='string'&&x[k].trim(),`${x.id} ${k}`);
  assert.equal(typeof x.safety,'string',`${x.id} safety`);
  assert.ok(Array.isArray(x.materials)&&x.materials.length>=2,`${x.id} materials`);
  assert.ok(x.steps.length>=4&&x.steps.length<=7,`${x.id} has ${x.steps.length} steps`);
  assert.equal(x.explain.length,3,`${x.id} explain prompts`);
  for(const s of [...x.materials,...x.steps,...x.explain])assert.ok(typeof s==='string'&&s.trim(),x.id);
  assert.ok(x.explain.some(p=>/what would happen/i.test(p)),`${x.id} has an extension prompt`);
 }
 const scissors=I.filter(x=>x.materials.some(m=>/scissors/i.test(m)));
 for(const x of scissors)assert.ok(x.safety,`${x.id} uses scissors`);
});

test('investigationForWeek is fixed within an ISO week and prefers ones not done',()=>{
 // 2026-09-28 is a Monday; 2026-10-04 is the Sunday of the same ISO week.
 const mon=W.investigationForWeek('2026-09-28');
 for(let n=0;n<7;n++)assert.equal(W.investigationForWeek(day('2026-09-28',n)),mon);
 assert.notEqual(W.investigationForWeek('2026-10-05').subject,mon.subject);
 assert.notEqual(W.investigationForWeek('2026-09-28',[mon.id]).id,mon.id);
 assert.equal(W.investigationForWeek('nope'),null);
 const done=[];
 for(let n=0;n<12;n++){const x=W.investigationForWeek(day('2026-09-28',7*n),done);assert.ok(!done.includes(x.id),`repeat ${x.id}`);done.push(x.id);}
 assert.equal(new Set(done).size,12);
 assert.ok(W.investigationForWeek('2026-09-28',done));
 // ISO weeks across a year boundary: 2026-12-28 (Mon) to 2027-01-03 (Sun).
 const yearEnd=W.investigationForWeek('2026-12-28');
 assert.equal(W.investigationForWeek('2027-01-03'),yearEnd);
 assert.notEqual(W.investigationForWeek('2027-01-04'),yearEnd);
});

test('index.html loads wide-reading.js after quick-checks.js',()=>{
 const html=require('node:fs').readFileSync(require('node:path').join(__dirname,'..','index.html'),'utf8');
 const q=html.indexOf('src="quick-checks.js'),w=html.indexOf('src="wide-reading.js');
 assert.ok(q>0&&w>q,'wide-reading.js should follow quick-checks.js');
});
