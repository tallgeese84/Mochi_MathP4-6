const test=require('node:test'),assert=require('node:assert/strict'),{spawnSync}=require('node:child_process'),path=require('node:path');
test('the complete published page starts and stays responsive with all active modules',()=>{
 const r=spawnSync(process.execPath,[path.join(__dirname,'fixtures/startup.cjs')],{encoding:'utf8',timeout:12000});
 assert.equal(r.error,undefined,`Startup deadline exceeded: ${r.error}`);
 assert.equal(r.status,0,r.stdout+r.stderr);
});
