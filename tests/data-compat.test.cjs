const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
// Guards family sync, cloud backup, the Drive mirror and the progress-review export.
// Transport baselines are pinned; v7.7 intentionally adds a read action, settings event and receipt.
// If one must change, update its hash deliberately
// and confirm existing tablets can still read and merge the data they already hold.
const root=path.join(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const FROZEN={
 'cloud-sync.js':'c476de9e218322275dd71c9857dbc23c18decbf007968ac42cdb069e15f1d6bd',
 'cloud-backup.js':'f69f62d2800f09029020f5289a27f02844974e44dcc2105ed37243b28bdcc0e5',
 'drive-mirror.js':'5bc7fabf401e0179eeef99fbeb2cdae8cd6e9b3bddd4bdda8841e9c6cddfca08',
 'learning-review.js':'875a3ff6a0cdc34f338440ab3379a8278905f6c239ad56534d6cd97f045ceaef',
 'network.js':'956bc684a5d280f41f2630304beaa93c138bf155b61a80f0144c2916b8810843',
 'tools/mochi-drive-mirror.gs':'28722d9d45aaec8e3853f8af09efefbbe5d5062746306391089fa2164b4d967e'
};
test('sync/backup remain frozen; v7.7 read-only integration changes are pinned',()=>{
 for(const [f,h] of Object.entries(FROZEN))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,f))).digest('hex'),h,f+' changed');
});
test('saved-state and sync identifiers are unchanged',()=>{
 assert.match(read('app.js'),/const KEY = 'mochi-tutor-v1';/);
 assert.match(read('cloud-sync.js'),/CONFIG_KEY='cubs_sync', META_KEY='mochi_cloud_meta_v1', DEVICE_KEY='mochi_cloud_device_v1', APP='mochi-math-p4-6'/);
 assert.match(read('cloud-sync.js'),/schema:1,app:APP,student:'Euna'/);
 assert.match(read('learning-review.js'),/data\.review=\{schema:1,/);
});

test('v7.7 keeps original mirror upsert and weekly snapshot functions byte-identical',()=>{
 const s=read('tools/mochi-drive-mirror.gs'),chunk=s.slice(s.indexOf('function upsert_'),s.indexOf('function json_'));
 assert.equal(crypto.createHash('sha256').update(chunk).digest('hex'),'58c5d9d8aaee6062e15b84d403328c9e7df6773ee845b2324389dd5e74c34c29');
});
