const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
// Guards family sync, cloud backup, the Drive mirror and the progress-review export.
// These files are frozen at v6.7.1. If one must change, update its hash deliberately
// and confirm existing tablets can still read and merge the data they already hold.
const root=path.join(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const FROZEN={
 'cloud-sync.js':'c476de9e218322275dd71c9857dbc23c18decbf007968ac42cdb069e15f1d6bd',
 'cloud-backup.js':'f69f62d2800f09029020f5289a27f02844974e44dcc2105ed37243b28bdcc0e5',
 'drive-mirror.js':'df253cdb9fabb55e62780634bca6e36ea93994c546cbf0f3e9e5f2961c68857b',
 'learning-review.js':'4ca014c60a439164e5d88de3579ec3f932ed8dff56c37e7cb5f7f413a56eb865',
 'network.js':'956bc684a5d280f41f2630304beaa93c138bf155b61a80f0144c2916b8810843',
 'tools/mochi-drive-mirror.gs':'0895335fddded76c3bbcec28354cfce60da09bed27062288f1fd5cade135e478'
};
test('sync, backup, mirror and review-export code is unchanged from v6.7.1',()=>{
 for(const [f,h] of Object.entries(FROZEN))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,f))).digest('hex'),h,f+' changed');
});
test('saved-state and sync identifiers are unchanged',()=>{
 assert.match(read('app.js'),/const KEY = 'mochi-tutor-v1';/);
 assert.match(read('cloud-sync.js'),/CONFIG_KEY='cubs_sync', META_KEY='mochi_cloud_meta_v1', DEVICE_KEY='mochi_cloud_device_v1', APP='mochi-math-p4-6'/);
 assert.match(read('cloud-sync.js'),/schema:1,app:APP,student:'Euna'/);
 assert.match(read('learning-review.js'),/data\.review=\{schema:1,/);
});
