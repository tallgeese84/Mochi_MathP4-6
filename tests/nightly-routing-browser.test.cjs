const test=require('node:test'),assert=require('node:assert/strict'),path=require('node:path'),{spawnSync}=require('node:child_process');
test('published-page controls deliver the focus after saved work and preserve real boundaries',()=>{
 const r=spawnSync(process.execPath,[path.join(__dirname,'fixtures/nightly-routing.cjs')],{encoding:'utf8',timeout:20000});
 assert.equal(r.error,undefined,'Browser regression exceeded its deadline');assert.equal(r.status,0,r.stdout+r.stderr);
});
