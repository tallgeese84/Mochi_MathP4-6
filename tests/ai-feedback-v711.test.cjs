// v7.11: every child-facing AI reply is readable, never hands over the answer, and Mochi is not a calculator.
// All learner data here is synthetic.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
globalThis.window=globalThis;
const G=require('../tutor-guard.js'),M=require('../entrance-core.js'),S=require('../science-path-core.js');
require('../tutor-pilot-core.js');const N=require('../tutor-nudge.js'),W=require('../writing-review.js');
const DAY=864e5,src=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
function teach(E,d,id,t){for(let i=0;i<3;i++)E.visit(d,id,i,t);E.concept(d,id,E.unit(id).check[2],t);E.complete(d,id,t);}

test('the reply Euna saw becomes readable maths, with no codes left',()=>{
 const seen="Break one number into easier parts:\n\n\\[\n284937 \\times 273833\n=284937 \\times (273000+833)\n\\]\n\n\\[\n284937\\times273000=77,787,801,000\n\\]\n\n\\[\n284937\\times833=237,352,521\n\\]\n\nNow add:\n\n\\[\n77,787,801,000+237,352,521=\\boxed{78,025,153,521}\n\\]";
 assert.equal(G.clean(seen),'Break one number into easier parts:\n\n284937 × 273833\n= 284937 × (273000 + 833)\n\n284937 × 273000 = 77,787,801,000\n\n284937 × 833 = 237,352,521\n\nNow add:\n\n77,787,801,000 + 237,352,521 = 78,025,153,521');
 const cases={
  'The fraction is $\\frac{3}{4}$ and \\(\\dfrac{x+1}{2}\\) of the **total**. It costs $5 and $7.':'The fraction is 3/4 and (x+1)/2 of the total. It costs $5 and $7.',
  '### Step 1\n- Find 1%: \\( 765 \\div 85 = 9 \\)\n- Then 100%: `9 * 100`\n\n> Try it!':'Step 1\n• Find 1%: 765 ÷ 85 = 9\n• Then 100%: 9 × 100\n\nTry it!',
  'Area $= 6 \\text{ cm} \\times 5 \\text{ cm} = 30\\,\\text{cm}^2$, angle is $90^\\circ$, and $\\sqrt{49}$, $2^{3}$.':'Area = 6 cm × 5 cm = 30 cm², angle is 90°, and √49, 2³.',
  '\\frac{\\frac{1}{2}}{3} and \\boxed{\\frac{7}{8}}':'(1/2)/3 and 7/8',
  'What do you notice about the difference? It stays the same - can you see why?':'What do you notice about the difference? It stays the same - can you see why?',
  'Speed = distance ÷ time. Ratio 4:5; 5 - 3 = 2; the price is $1,020.':'Speed = distance ÷ time. Ratio 4:5; 5 - 3 = 2; the price is $1,020.'
 };
 for(const [raw,want] of Object.entries(cases)){const got=G.clean(raw);assert.equal(got,want);assert.equal(G.clean(got),got,'cleaning twice changes nothing');assert.doesNotMatch(got,/\\[a-zA-Z([]|\*\*|`/);}
 assert.equal(G.clean(''),'');assert.equal(G.clean(null),'');
});

test('a reply that states the checked answer is caught; a guiding reply is not',()=>{
 const q={text:'After a 15% discount a bag costs $765. Find the original price.',answerLabel:'900'};
 for(const r of ['The original price is $900.','So \\boxed{900}','765 ÷ 85 × 100 = 900'])assert.equal(G.leaks(r,q),true,r);
 for(const r of ['Find 1% first: 765 ÷ 85. What do you get?','85% is $765, so what is 1%?','Is it more or less than $765?'])assert.equal(G.leaks(r,q),false,r);
 const two={text:'Find the exposed surface area of a 3 by 3 by 6 cuboid.',answerLabel:'90',suffix:'cm²'};
 assert.equal(G.leaks('That gives 18 + 72 = 90.',two),true);assert.equal(G.leaks('So the answer is 90 cm².',two),true);
 assert.equal(G.leaks('Two faces are 3 × 3 and four are 3 × 6. Add them up.',two),false);
 const given={text:'A tank holds 120 litres. How much is left after 0 litres are used?',answerLabel:'120'};assert.equal(G.leaks('The tank holds 120 litres at first.',given),false,'a number the question states is not a leak');
 const choice={text:'Is x inside or outside?',answerLabel:'inside',choices:['inside','outside']};
 assert.equal(G.leaks('The correct answer is inside.',choice),true);assert.equal(G.leaks('Is the arc between CA and CB (inside) or CA and CD (outside)?',choice),false);
 assert.equal(G.leaks('anything',{kind:'written',answerLabel:'Both bulbs are unlit.'}),false,'written answers are reviewed by a grown-up');
 // Real generated questions: a reply ending in the checked answer is caught, unless the question itself prints that number.
 let n=0,caught=0;for(const u of ['percent','rates','ratios','volume','remainders','area'])for(let i=0;i<24;i++){
  let x;try{x=M.B.make(u,1+i%2,(i*2654435761+3)>>>0,M.REV);}catch(_){continue;}
  const label=String(x.answerLabel??'');if(typeof x.answer!=='number'||!/^[\d,.]+$/.test(label))continue;n++;
  const plain=label.replace(/,/g,''),printed=(x.text.replace(/(\d),(?=\d{3})/g,'$1').match(/\d+(?:\.\d+)?/g)||[]).includes(plain);
  const hit=G.leaks(`Well done so far. So the answer is ${label}.`,x);assert.equal(hit,!printed,`${x.text} -> ${label}`);if(hit)caught++;
  assert.equal(G.leaks('What is one part worth? Write that step first.',x),false);}
 assert.ok(n>60&&caught>n*.8,`${caught} of ${n}`);
});

test('a bare sum is coached without a model; a real question is not intercepted',()=>{
 for(const m of ['284937 × 273833','what is 48 ÷ 6?','12 + 7 = ?','1,250 x 16','765 / 85','Calculate 2^10']){const r=G.sumRequest(m);assert.ok(r,m);assert.match(r,/Estimate first/);assert.doesNotMatch(r,/78,?025|= ?8\b|= ?19\b|20,?000|= ?9\b|1024/,'never the result');}
 assert.match(G.sumRequest('284937 × 273833'),/284937 = 284000 \+ 937/);
 for(const m of ['Calculate 3/4','I got 3/4 but why','how do I start','what is 20% of 80','why is it 12 × 3 and not 12 + 3?',''])assert.equal(G.sumRequest(m),null,m);
});

test('every tutor prompt carries the shared rules and every reply is cleaned before display',()=>{
 assert.match(G.RULES,/plain text only/);assert.match(G.RULES,/not a calculator/);assert.match(G.RULES,/never state the final answer/);
 for(const f of ['entrance-ui.js','science-path-ui.js'])for(const need of ['G.RULES','G.clean(raw)','G.leaks(raw,q)','G.clean(note.reply)','G?.sumRequest(message)','MochiTutorNudge?.run('])assert.ok(src(f).includes(need),`${f}: ${need}`);
 assert.match(src('course-ui.js'),/G\.RULES[\s\S]*G\.clean\(response\)/);assert.match(src('science-ui.js'),/MochiTutorGuard\.RULES[\s\S]*MochiTutorGuard\.clean\(reply\)/);
 assert.match(src('study-ui.js'),/current\.custom\?window\.MochiTutorGuard\.FORMAT:window\.MochiTutorGuard\.RULES/);
 assert.match(src('app.js'),/text = G\.clean\(text\);[\s\S]{0,200}G\.leaks\(text/);
 const html=src('index.html'),at=n=>html.indexOf(n);assert.ok(at('tutor-guard.js')>0&&at('tutor-guard.js')<at('entrance-ui.js')&&at('tutor-nudge.js')>at('tutor-pilot-ui.js'));
 assert.deepEqual(W.parse('{"verdict":"valid","missing":["**complete path**"],"reason":"She links \\\\(3 \\\\times 4\\\\) to the path."}'),{verdict:'valid',reason:'She links 3 × 4 to the path.',missing:['complete path']});
});

test('one automatic nudge after a first wrong answer, in topics outside the pilot',async()=>{
 const now=Date.now(),d=M.fresh();N._reset();for(const u of ['rates','percent'])teach(M,d,u,now-20*DAY);
 const wrong=(unit)=>{M.finishPractice(d);const v=M.startPractice(d,unit,{phase:'apply',now:Date.now()});M.touchDraft(d,{answer:'999999',working:'I added the two times'},Date.now());assert.ok(M.respond(d,Date.now()).ok);return v;};
 let calls=0,reply='What do both pumps fill together in **one** hour?';globalThis.netReady=()=>true;globalThis.callModel=async o=>{calls++;assert.match(o.system,/I added the two times/);assert.match(o.system,/plain text only/);return reply;};
 M.finishPractice(d);M.startPractice(d,'rates',{phase:'apply',now});assert.equal(N.gate('maths',M,d),'NOT_FIRST_INCORRECT','nothing before an answer');M.finishPractice(d);
 const v1=wrong('rates');assert.equal(N.gate('maths',M,d),'READY');assert.equal(await N.run('maths',M,d,()=>{}),true);
 assert.equal(N.read().notes[v1.id].reply,'What do both pumps fill together in one hour?');assert.equal(d.draft.helped,true,'recorded as help');
 assert.match(N.panel('maths',M,d),/Mochi noticed a tricky step[\s\S]*one hour/);assert.notEqual(N.gate('maths',M,d),'READY','once per question');
 // A nudge that states the answer is replaced by the built-in hint.
 const v2=wrong('rates'),q2=M.question(v2);reply=`The answer is ${q2.answerLabel}.`;assert.equal(await N.run('maths',M,d,()=>{}),true);
 const note=N.read().notes[v2.id];assert.equal(note.live,false);assert.ok(!note.reply.includes(q2.answerLabel)||q2.text.includes(q2.answerLabel));assert.match(N.panel('maths',M,d),/built-in hint/);
 // Daily cap, pilot topics and the grown-up switch.
 reply='What is one part worth?';wrong('rates');assert.equal(await N.run('maths',M,d,()=>{}),true);
 wrong('rates');assert.equal(N.gate('maths',M,d),'DAILY_LIMIT');assert.equal(await N.run('maths',M,d,()=>{}),false);assert.equal(calls,3);
 N._reset();wrong('percent');assert.equal(N.gate('maths',M,d),'NOT_GENERAL','pilot topics keep their own quick check');assert.equal(N.panel('maths',M,d),'');
 wrong('rates');globalThis.MochiTutorPilot.setAuto(d,false);assert.equal(N.gate('maths',M,d),'PAUSED_BY_PARENT');assert.equal(N.panel('maths',M,d),'');globalThis.MochiTutorPilot.setAuto(d,true);
 // Solved while Mochi was thinking: nothing is shown and the daily count is returned.
 const v6=d.draft,q6=M.question(v6);globalThis.callModel=async()=>{M.touchDraft(d,{answer:q6.answerLabel,working:'fixed it'},Date.now());M.respond(d,Date.now());return 'late';};
 const used=N.read().used.maths||0;assert.equal(await N.run('maths',M,d,()=>{}),false);assert.equal(N.read().used.maths||0,used);assert.equal(N.read().notes[v6.id],undefined);
 delete globalThis.callModel;delete globalThis.netReady;
});
