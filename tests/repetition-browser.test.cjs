const test=require('node:test'),assert=require('node:assert/strict'),path=require('node:path'),{spawnSync}=require('node:child_process');
test('real page controls cannot reissue an exhausted mist question for extra progress',()=>{
 const r=spawnSync(process.execPath,[path.join(__dirname,'fixtures/repetition-guard.cjs')],{encoding:'utf8',timeout:20000});
 assert.equal(r.error,undefined);assert.equal(r.status,0,r.stdout+r.stderr);
});
