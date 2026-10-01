// Past attempts and papers are re-marked by regenerating their questions, so revision 1 of every
// existing template must stay byte-identical. Fixes to existing templates must be gated on rev>=2.
const test=require('node:test'),assert=require('node:assert/strict'),crypto=require('crypto');
const snap=require('./fixtures/rev1-snapshot.json');
const h=s=>crypto.createHash('sha1').update(s).digest('hex').slice(0,12);
test('maths questions at revision 1 are unchanged, so past answers keep their marks',()=>{
 const B=require('../entrance-bank.js');
 for(const [k,v] of Object.entries(snap.maths)){const [id,f]=k.split(':');const got=h(Array.from({length:40},(_,i)=>{const q=B.make(id,+f,i*7919+1,1);return q.text+'|'+JSON.stringify(q.answer)+'|'+JSON.stringify(q.figure||{})}).join('\n'));assert.equal(got,v,'maths '+k+' changed at revision 1');}
});
test('science questions at revision 1 are unchanged, so past answers keep their marks',()=>{
 globalThis.window=globalThis;require('../science-path-data.js');const SB=require('../science-path-bank.js');
 for(const [k,v] of Object.entries(snap.science)){const [id,f]=k.split(':');const got=h(Array.from({length:40},(_,i)=>{const q=SB.make(id,+f,i*7919+1,1);return q.text+'|'+JSON.stringify(q.answer)+'|'+JSON.stringify(q.options)+'|'+JSON.stringify(q.reasons)+'|'+JSON.stringify(q.figure||{})}).join('\n'));assert.equal(got,v,'science '+k+' changed at revision 1');}
});
