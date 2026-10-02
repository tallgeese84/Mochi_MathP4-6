const test=require('node:test'),assert=require('node:assert/strict'),crypto=require('node:crypto'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const C=require('../p6-core.js');
const img='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl6B9sAAAAASUVORK5CYII=';
function source(fields=[{label:'Answer',kind:'number',unit:'cm²',answer:12}]){return {schema:'mochi-private-p6-v1',id:'demo',digest:'a'.repeat(64),title:'Synthetic test pack',questions:[{id:'demo-q1',sourceId:'demo-source',contentHash:'b'.repeat(64),subject:'maths',reference:'Demo Q1',topic:'Area',pages:[2],keyPages:[4],fields,images:[img],keyImages:[],hint:'Compare the sides',alt:'An original synthetic test diagram.'}],catalogue:[]};}
const setup=(fields)=>{const p=C.pack(source(fields)),d=C.fresh(),q=p.questions[0];C.start(d,p,q,1000,'attempt-1');return {p,d,q};};
test('P6 packs validate without copying executable content or arbitrary remote images',()=>{
 const p=C.pack(source());assert.equal(p.questions.length,1);
 for(const value of ['javascript:alert(1)','https://other.test/a.png','data:image/svg+xml;base64,PHN2Zz4=']){const x=source();x.questions[0].images=[value];assert.throws(()=>C.pack(x));}
 for(const id of ['__proto__','constructor','../leak']){const x=source();x.questions[0].id=id;assert.throws(()=>C.pack(x));}
 const x=source();x.questions.push(x.questions[0]);assert.throws(()=>C.pack(x));
});
test('P6 accepted numbers preserve units and support equivalent fractions, never arbitrary unit stripping',()=>{
 for(const [a,u,n] of [['12 cm²','cm²',12],['12 cm^2','cm²',12],['1 1/2','',1.5],['3/2','',1.5],['$1,200','$',1200],['1.2 centimetres','cm',1.2]])assert.equal(C.value(a,u),n,a);
 for(const a of ['12 cm³','12 kg','12 elephants','NaN','Infinity','1/0','1,2','<script>12</script>'])assert.equal(C.value(a,'cm²'),null,a);
 assert.equal(C.checkField({kind:'ratio',answer:[2,3]},'4:6').correct,true);
 assert.equal(C.checkField({kind:'ratio',answer:[2,3]},'2:4').correct,false);
});
test('P6 incomplete submissions and duplicate taps do not create spurious mistakes',()=>{
 const {d,q}=setup();assert.ok(C.respond(d,q,1200).error);assert.equal(d.attempts.length,0);
 C.touch(d,{answers:['9'],working:'3 x 3'},1300);C.respond(d,q,1400);assert.equal(d.attempts[0].responses.length,1);
 assert.equal(C.respond(d,q,1500).duplicate,true);assert.equal(d.attempts[0].responses.length,1);
 C.touch(d,{answers:['12'],working:'3 x 4'},1600);C.respond(d,q,1700);assert.equal(d.attempts[0].correct,true);assert.equal(d.attempts[0].independent,false);
});
test('P6 fresh and supported attempts remain distinct; repeat exposure is never fresh evidence',()=>{
 const {p,d,q}=setup();C.touch(d,{answers:['12']},1100);C.respond(d,q,1200);assert.equal(d.attempts[0].independent,true);
 C.touch(d,{revealed:true},1300);assert.equal(C.validate(d).attempts[0].independent,true,'after-answer reading must not erase a first response');
 C.start(d,p,q,2000,'attempt-2');C.touch(d,{answers:['12']});C.respond(d,q,2100);assert.equal(d.attempts[1].seenBefore,true);assert.equal(d.attempts[1].independent,false);
 const other=setup();C.touch(other.d,{answers:['12'],helped:true});C.respond(other.d,other.q);assert.equal(other.d.attempts[0].independent,false);
});
test('P6 self-report flag can be corrected before submission, but recorded support is sticky afterwards',()=>{
 const {d,q}=setup();C.touch(d,{guess:true});C.touch(d,{guess:false,answers:['12']});C.respond(d,q,1200);assert.equal(d.attempts[0].independent,true);
 C.touch(d,{guess:true});C.touch(d,{guess:false});assert.equal(C.validate(d).attempts[0].independent,false);
});
test('P6 written and drawn explanations never auto-pass by keywords or numerical subparts',()=>{
 const {d,q}=setup([{kind:'number',label:'Number',answer:12,unit:''},{kind:'review',label:'Explanation',unit:''}]);
 C.touch(d,{answers:['12','Do not change fertiliser. Do not measure height. Never repeat.'],strokes:[[[.1,.1],[.2,.2]]]});C.respond(d,q,1300);
 assert.equal(d.attempts[0].correct,null);assert.equal(d.attempts[0].pendingReview,true);assert.equal(d.attempts[0].independent,false);assert.equal(C.report(d).pendingReview.length,1);
});
test('P6 sync merges concurrent attempts and does not lose earlier wrong answers or support',()=>{
 const {p,d,q}=setup();C.touch(d,{answers:['9']},1100);C.respond(d,q,1200);const a=JSON.parse(JSON.stringify(d)),b=JSON.parse(JSON.stringify(d));
 C.touch(a,{answers:['12']},1400);C.respond(a,q,1500);C.touch(b,{helped:true},1300);
 C.start(b,p,q,2100,'attempt-b');C.touch(b,{answers:['12']},2200);C.respond(b,q,2300);
 const x=C.merge(a,b),y=C.merge(b,a);assert.deepEqual(x,y);assert.equal(x.attempts.length,2);assert.equal(x.attempts[0].responses.length,2);assert.equal(x.attempts[0].independent,false);assert.equal(x.attempts[0].helped,true);
 assert.deepEqual(C.merge(x,x),x);assert.deepEqual(C.validate(x),x);
});
test('P6 validation ignores arbitrary precomputed independent flags and strips injected settings/scans',()=>{
 const {d,q}=setup();C.touch(d,{answers:['8']});C.respond(d,q);d.attempts[0].independent=true;d.keys={openai:'DO-NOT-EXPORT'};d.images=[img];d.draft.secret='private';
 const x=C.validate(d);assert.equal(x.attempts[0].independent,false);assert.equal(x.keys,undefined);assert.equal(x.images,undefined);assert.equal(x.draft.secret,undefined);
});
test('P6 source integrity changes when a scan or answer key changes',()=>{
 const p=C.pack(source()),q=p.questions[0],hash=x=>crypto.createHash('sha256').update(C.signable(x)).digest('hex'),a=hash(q);
 const b=JSON.parse(JSON.stringify(q));b.fields[0].answer=13;assert.notEqual(hash(b),a);b.fields[0].answer=12;assert.equal(hash(b),a);b.alt='different';assert.notEqual(hash(b),a);
});
test('P6 only adds its own learner namespace to backup and cloud merge; old state retains identifiers and secrets',()=>{
 const read=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');let src=read('cloud-sync.js');src=src.replace('function mergeState(local={},remote={},remoteNewer){','rootForTest.mergeState=mergeState;rootForTest.normalise=normalise;function mergeState(local={},remote={},remoteNewer){');
 const box={window:{MochiP6:C},MochiP6:C,rootForTest:{},document:{addEventListener(){}},console};vm.createContext(box);vm.runInContext(src,box);
 const {d,q}=setup();C.touch(d,{answers:['12']});C.respond(d,q);const local={learning:{version:1,attempts:[],notes:[]},keys:{openai:'keep-local'},provider:'provider',coins:43,p6:d,entrance:{untouched:'old'},catFriends:{kept:'yes'}},remote={learning:{version:1,attempts:[],notes:[]},keys:{openai:'NEVER'},p6:C.fresh()};
 const m=box.rootForTest.mergeState(local,remote,true);assert.equal(m.keys.openai,'keep-local');assert.equal(m.coins,43);assert.equal(m.p6.attempts.length,1);assert.equal(m.entrance.untouched,'old');assert.equal(m.catFriends.kept,'yes');
 assert.match(read('learning-review.js'),/data\.p6=root\.MochiP6\.validate/);assert.match(read('study-ui.js'),/if\(p6Restored\)S\.p6=p6Restored/);
 assert.match(read('planner-ui.js'),/MochiP6UI\.subject\(\)/);assert.match(read('p6-ui.js'),/crypto\.subtle\.digest\('SHA-256'/);
});
test('P6 resuming a revised response retains its latest answer, explanation and ink',()=>{
 const {d,q}=setup([{kind:'review',label:'Explain',unit:''}]);
 C.touch(d,{answers:['First idea'],working:'First working'},1100);C.respond(d,q,1200);
 C.touch(d,{answers:['Revised idea'],working:'New working',strokes:[[[.2,.2],[.3,.4]]]},1300);C.respond(d,q,1400);
 const a=C.validate(d).attempts[0];assert.deepEqual(a.answers,['Revised idea']);assert.equal(a.working,'New working');assert.equal(a.strokes.length,1);assert.equal(a.responses.length,2);assert.equal(a.pendingReview,true);
 assert.deepEqual(C.validate({version:1,draft:a}).draft.answers,['Revised idea']);
});
test('P6 conflicting later responses are not reported as independently correct',()=>{
 const {d,q}=setup();C.touch(d,{answers:['12']},1100);C.respond(d,q,1200);
 const x=JSON.parse(JSON.stringify(d));x.attempts[0].responses.push({...x.attempts[0].responses[0],at:1400,answers:['9'],correct:false});
 assert.equal(C.validate(x).attempts[0].independent,false);
 const ui=fs.readFileSync(path.join(__dirname,'..','p6-ui.js'),'utf8');assert.match(ui,/<select id="p6Answer\$\{i\}" \$\{done\?/);assert.match(ui,/<input id="p6Answer\$\{i\}" \$\{done\?/);
});
