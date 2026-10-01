const test=require('node:test'),assert=require('node:assert/strict');
const B=require('../mochi-buddy.js');
test('Mochi reacts without guilt and remembers the reaction for the same question',()=>{
 assert.equal(B.mood({correct:true,independent:true,responses:1}),'independent');
 assert.equal(B.mood({correct:true,independent:false,responses:2}),'correct');
 assert.equal(B.mood({correct:false,responses:1}),'retry');
 assert.equal(B.mood({correct:false,responses:2}),'pause');
 const all=Object.values(B.lines).flat().join(' ').toLowerCase();
 for(const word of ['wrong','bad','fail','lose','lost','sad','hungry','disappoint','streak'])assert.ok(!new RegExp('\\b'+word).test(all),'no guilt words: '+word);
 const a=B.slot('ep','q1'),b=B.slot('ep','q1');
 assert.equal(a.match(/mochi-buddy-says">([^<]*)/)[1],b.match(/mochi-buddy-says">([^<]*)/)[1]);
 assert.match(a,/aria-live="polite"/);
});
