// Synthetic state only. Exercise the real transports and restore controls without network access.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const G=require('../learning-goals-core.js'),L=require('../learning.js');
const root=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8'),copy=x=>JSON.parse(JSON.stringify(x));
const NOW=Date.parse('2026-11-23T18:00:00Z');

function completed(category='maths',now=NOW){
 const subject=category==='science'?'science':'maths',key=subject==='maths'?'entrance':'sciencePath',id='synthetic-'+category+'-'+now;
 const state={learning:L.fresh(),[key]:{draft:{id,unit:subject==='maths'?'percent':'matter',at:now-1000,updatedAt:now-1000,phase:'apply',mode:'practice',helped:false},attempts:[]}};
 const started=G.beginGoal(state,{category,subject,unit:state[key].draft.unit,title:'Explain and check this synthetic problem',draftId:id},now);
 assert.equal(started.ok,true,'the synthetic task is agreed before its response');
 const a={...state[key].draft,mode:'practice',at:now-1000,answeredAt:now+1000,correct:true,firstCorrect:true,helped:false,revealed:false,hints:0,guess:false,working:'Divide the whole into equal groups.',responses:[{at:now+1000,answer:'25',working:'Divide the whole into equal groups.',correct:true,helped:false,revealed:false}]};
 state[key].attempts.push(a);
 const finished=G.recordFinish(state,started.goal.id,{kind:'finished',explanation:'The equal groups represent the same share of the whole.',check:'Multiplying my share by the number of groups gives the original whole.'},now+2000);
 assert.equal(finished.ok,true,'the post-start response supports a checked finish');
 const approved=G.approveGoal(state,started.goal.id,{explanationReviewed:true,checkReviewed:true},now+3000);
 assert.equal(approved.ok,true,'a grown-up verifies the recorded explanation and check');
 return state;
}
function paid(){
 const state=completed(),week=G.weeks(state,NOW+4000)[0].week;
 const settled=G.settle(state,week,NOW+4000);assert.equal(settled.ok,true);
 return state;
}
function transport(){
 const ctx={console,Date,Math,JSON,Map,Set,Number,String,Object,Array,RegExp,Promise,Intl,MochiLearning:L,MochiLearningGoals:G,document:{addEventListener(){}},localStorage:{getItem:()=>null},addEventListener(){}};
 ctx.window=ctx;
 const source=read('cloud-sync.js').replace(/\}\)\(\);\s*$/,'window.__sync={mergeState,normalise,uploadState};})();');
 vm.runInNewContext(source,ctx);assert(ctx.__sync,'the real sync functions are available in the test sandbox');
 return ctx.__sync;
}
function review(){
 const ctx={Intl,MochiLearning:L,MochiLearningGoals:G};
 vm.runInNewContext(read('learning-review.js'),ctx);return ctx.MochiReview;
}
function controls(state){
 const h=require('./harness.cjs')();
 h.ctx.__goals=G;h.ctx.__ledger=copy(state.learningGoals);
 h.run('window.MochiLearningGoals=__goals;globalThis.MochiLearningGoals=__goals;S.learningGoals=__ledger;renderQuestion=()=>{};studyParent=()=>{};studyPaint=()=>{};studyInit();');
 return h;
}
async function restore(h,ledger){
 h.ctx.__backup=L.backup(L.fresh());if(ledger!==undefined)h.ctx.__backup.learningGoals=copy(ledger);
 await h.run("$('importLearning').onchange({target:{files:[{size:1000,text:async()=>JSON.stringify(__backup)}],value:'synthetic.json'}})");
 assert.equal(h.nodes.get('backupStatus').textContent,'Learning history restored.');
 return JSON.parse(h.run('JSON.stringify(S.learningGoals)'));
}

test('cloud merge retains approved points and payment records when the other device predates the feature',()=>{
 const sync=transport(),state=paid(),expected=G.validate(state.learningGoals),legacy={learning:L.fresh(),coins:9};
 for(const newer of [true,false])for(const [left,right] of [[state,legacy],[legacy,state]]){
  const merged=sync.normalise(sync.mergeState(copy(left),copy(right),newer));
  assert.deepEqual(copy(merged.learningGoals),copy(expected));
 }
});

test('actual cloud merge combines separate subject awards and deduplicates a shared payment',()=>{
 const sync=transport(),a=paid(),b=completed('science',NOW+10000);
 b.learningGoals=G.merge(b.learningGoals,copy(a.learningGoals));
 const merged=sync.normalise(sync.mergeState(copy(a),copy(b),true));
 assert.equal(Object.keys(merged.learningGoals.awards).length,2);
 assert.equal(Object.keys(merged.learningGoals.settlements).length,1);
 assert.deepEqual(copy(merged.learningGoals),copy(sync.normalise(sync.mergeState(copy(b),copy(a),false)).learningGoals));
 assert.deepEqual(copy(sync.normalise(sync.mergeState(copy(merged),copy(merged),true)).learningGoals),copy(merged.learningGoals),'repeated sync adds no awards or settlements');
});

test('independent devices cannot double the same daily category when their task records differ',()=>{
 const sync=transport(),a=completed('maths',NOW),b=completed('maths',NOW+10000);
 const week=G.weeks(b,NOW+20000)[0].week;assert.equal(G.settle(b,week,NOW+20000).ok,true);
 const forward=sync.normalise(sync.mergeState(copy(a),copy(b),true));
 const reverse=sync.normalise(sync.mergeState(copy(b),copy(a),false));
 assert.deepEqual(copy(forward.learningGoals),copy(reverse.learningGoals));
 assert.equal(Object.keys(forward.learningGoals.awards).length,1,'one Maths award per Chicago day across both devices');
 const total=G.summary(forward,NOW+30000).totals;
 assert.equal(total.points,2);assert.equal(total.cents,40);assert.equal(total.paidCents,40);assert.equal(total.dueCents,0);
});

test('portable review includes the exact ledger and readable reward report while excluding settings',()=>{
 const state=paid();state.keys={api:'PRIVATE_API_KEY'};state.provider='private-provider';state.mirrorSecret='PRIVATE_MIRROR_SECRET';state.models=['PRIVATE_MODEL'];
 const exported=review().build(state,'7.13.0');
 assert.deepEqual(copy(G.validate(exported.learningGoals)),copy(G.validate(state.learningGoals)));
 assert.ok(exported.learningGoalsReview,'the nightly reviewer receives an explicit reward report');
 assert.equal(exported.source.appVersion,'7.13.0');
 assert.doesNotMatch(JSON.stringify(exported),/PRIVATE_|private-provider/);
 assert.deepEqual(L.restore(exported).attempts,state.learning.attempts,'the old learning backup contract remains readable');
 const upload=transport().uploadState(state);assert.equal(upload.keys,undefined);assert.equal(upload.provider,undefined);assert.equal(upload.models,undefined);
});

test('restoring an old backup cannot erase cash awards or payment acknowledgements',async()=>{
 const state=paid(),h=controls(state),expected=copy(G.validate(state.learningGoals));
 assert.deepEqual(await restore(h),expected,'a backup without the new optional key keeps the current ledger');
 assert.deepEqual(await restore(h,G.fresh()),expected,'an explicitly empty older ledger cannot erase earned points');
 const extra=completed('science',NOW+10000);
 const merged=await restore(h,extra.learningGoals);
 assert.equal(Object.keys(merged.awards).length,2,'restoring adds the other subject award');
 assert.equal(Object.keys(merged.settlements).length,1,'payment acknowledgement survives restoration');
});

test('general learning reset preserves the cash ledger without silently starting a new trial',()=>{
 const state=paid(),h=controls(state),before=copy(state.learningGoals);
 h.run("$('resetBtn').onclick()");
 assert.deepEqual(JSON.parse(h.run('JSON.stringify(S.learningGoals)')),before);
});

test('loading, normalising and exporting an older state never starts the four-week trial',()=>{
 const sync=transport(),state=sync.normalise(sync.mergeState({learning:L.fresh()},{learning:L.fresh()},true));
 const ledger=G.validate(state.learningGoals);assert.equal(ledger.trial,null);
 const exported=review().build(state,'7.13.0');assert.equal(G.validate(exported.learningGoals).trial,null);
 assert.equal(Object.keys(ledger.awards).length,0);
});
