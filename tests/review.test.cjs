const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
function review(){const c={MochiLearning:require('../learning.js'),MochiScience:require('../science-core.js'),Intl};vm.runInNewContext(fs.readFileSync(require.resolve('../learning-review.js'),'utf8'),c);return c.MochiReview;}
test('review totals distinguish independent, supported, skipped and assessment records',()=>{
 const r=review(),a={at:1000,kind:'diagnostic',correct:true,firstCorrect:true,confidence:'sure'};
 const m=r.counts([a,{...a,hints:1},{...a,confidence:'guess'},{...a,correct:false},{...a,skipped:true},{...a,kind:'custom'}]);
 assert.equal(m.recorded,6);assert.equal(m.sampled,4);assert.equal(m.independentCorrect,1);assert.equal(m.correct,3);assert.equal(m.assessmentRecords,4);
 const s=r.counts([{...a,assessment:true},{...a,helped:true},{...a,guess:true}],true);
 assert.equal(s.independentCorrect,1);assert.equal(s.assessmentRecords,1);
 assert.equal(r.counts([]).latestAttempt,null);
});
test('review backup preserves reasoning and restore compatibility while excluding settings',()=>{
 const l=require('../learning.js').fresh();l.attempts.push({id:'a',at:1000,skill:'fraction',generator:'fractionSum',kind:'daily',correct:false,tries:1,working:['I split the whole into equal parts'],plan:'Compare the parts',hints:1});
 const data=review().build({learning:l,keys:{api:'PRIVATE_API_KEY'},provider:'private-provider',mirrorSecret:'PRIVATE_MIRROR_SECRET'},'4.3.7');
 assert.equal(data.source.appVersion,'4.3.7');assert.equal(data.learning.attempts[0].working[0],'I split the whole into equal parts');
 assert.equal(data.review.maths.independentCorrect,0);assert.equal(require('../learning.js').restore(data).attempts.length,1);
 assert.doesNotMatch(JSON.stringify(data),/PRIVATE_|private-provider/);
});
