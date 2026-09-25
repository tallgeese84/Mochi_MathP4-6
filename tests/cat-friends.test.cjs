const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const P=require('../planner-core.js'),F=require('../cat-friends-core.js');
const now=Date.UTC(2026,8,25,12);
function state(n=0){const s={learning:{attempts:[]},science:{attempts:[]},coins:42,owned:['bow'],worn:{neck:'bow'},planner:P.fresh()};for(let i=0;i<n;i++)s.planner.milestones[`maths:skill${i}:idea`]={subject:'maths',skill:'skill'+i,kind:'idea',earnedAt:now,evidence:['synthetic-'+i]};return s;}
test('four named breeds have transparent, achievable milestone unlocks',()=>{
 assert.deepEqual(F.catalog.map(c=>c.breed),['British Shorthair','Siamese','Maine Coon','Ragdoll']);assert.equal(new Set(F.catalog.map(c=>c.id)).size,4);
 for(const [n,expected]of [[0,0],[1,0],[2,1],[7,1],[8,2],[17,2],[18,3],[31,3],[32,4]])assert.equal(F.sync(state(n)).unlocked.length,expected);
});
test('existing earned milestones unlock friends without touching maths, science, coins or wear',()=>{
 const s=state(57),before=JSON.stringify(s);F.sync(s);assert.equal(s.catFriends.unlocked.length,4);assert.equal(s.catFriends.selected.length,3);
 const {catFriends,...rest}=s;assert.equal(JSON.stringify(rest),before);
});
test('unlocks survive a shorter history, mistakes and rest; repeated petting cannot earn them',()=>{
 const s=state(18);F.sync(s);s.planner=P.fresh();s.learning.attempts=[{correct:false}];s.pets=99999;assert.equal(F.sync(s).unlocked.length,3);
 const fresh=state();fresh.pets=99999;fresh.coins=999999;assert.equal(F.sync(fresh).unlocked.length,0);
});
test('Mochi cannot be removed; locked, unknown and fourth visitors cannot be invited',()=>{
 const s=state(32);F.sync(s);assert.equal(F.select(s,'mochi',false).ok,false);assert.equal(F.select(s,'__proto__',true).ok,false);
 assert.equal(F.select(s,'yuki',true).ok,false);assert.equal(s.catFriends.selected.length,3);
 assert.equal(F.select(s,'miso',false,now).ok,true);assert.equal(F.select(s,'yuki',true,now+1).ok,true);assert.deepEqual(s.catFriends.selected,['suki','kumo','yuki']);
 assert.equal(F.select(state(0),'miso',true).ok,false);
});
test('choosing no visitors remains deliberate after save, restore and new milestones',()=>{
 const s=state(32);F.sync(s);for(const id of s.catFriends.selected.slice())F.select(s,id,false,now);
 for(let i=0;i<10;i++)F.sync(s);assert.deepEqual(s.catFriends.selected,[]);assert.equal(s.catFriends.selectionEdited,true);
 const restored={...s,catFriends:F.validate(JSON.parse(JSON.stringify(s.catFriends)))};F.sync(restored);assert.deepEqual(restored.catFriends.selected,[]);
});
test('malformed imported rosters are bounded, sanitised and never include locked friends',()=>{
 assert.deepEqual(F.validate({version:2,unlocked:['miso']}),F.fresh());
 const c=F.validate({version:1,unlocked:['miso','miso','<script>','yuki'],selected:['suki','miso','miso','yuki','__proto__'],selectionUpdatedAt:Infinity});
 assert.deepEqual(c.unlocked,['miso','yuki']);assert.deepEqual(c.selected,['miso','yuki']);assert.equal(c.selectionUpdatedAt,0);
});
test('cloud merge unions earned friends and respects the most recent deliberate roster',()=>{
 const a=state(18),b=state(32);F.sync(a);F.sync(b);F.select(a,'miso',false,now+1);F.select(b,'kumo',false,now+2);F.select(b,'yuki',true,now+3);
 const merged=F.merge(a.catFriends,b.catFriends);assert.equal(merged.unlocked.length,4);assert.deepEqual(merged.selected,['miso','suki','yuki']);assert.deepEqual(F.merge(b.catFriends,a.catFriends),merged);assert.deepEqual(F.merge(merged,merged),merged);
 const c={...a.catFriends,selectionUpdatedAt:now+3};assert.deepEqual(F.merge(c,b.catFriends),F.merge(b.catFriends,c),'equal timestamps settle deterministically');
 assert.deepEqual(F.merge(b.catFriends,undefined),b.catFriends,'older clients without rosters cannot erase one');
});
test('learning backup contains only sanitised cat preferences and no parent keys',()=>{
 const s=state(32);s.learning={version:1,attempts:[],notes:[],benchmarks:[]};s.keys={openai:'PRIVATE_TEST_KEY'};F.sync(s);
 const ctx={MochiLearning:require('../learning.js'),MochiPlanner:P,MochiCatFriends:F,Intl};vm.runInNewContext(fs.readFileSync(require.resolve('../learning-review.js'),'utf8'),ctx);
 const exported=ctx.MochiReview.build(s,'5.5.0');assert.deepEqual(JSON.parse(JSON.stringify(exported.catFriends)),s.catFriends);assert.doesNotMatch(JSON.stringify(exported),/PRIVATE_TEST_KEY/);
});
test('family sync retains roster edits independent of which question timestamp is newer',()=>{
 const ctx={window:{MochiCatFriends:F},MochiCatFriends:F,document:{addEventListener(){}},JSON};
 const src=fs.readFileSync(require.resolve('../cloud-sync.js'),'utf8').replace('if(window.MochiReady)init();','window.testMerge=mergeState;if(window.MochiReady)init();');vm.runInNewContext(src,ctx);
 const a=state(32),b=state(32);F.sync(a);F.sync(b);F.select(a,'miso',false,now+10);a.keys={openai:'LOCAL'};
 for(const newer of [false,true]){const merged=ctx.window.testMerge(a,b,newer);assert.deepEqual(merged.catFriends.selected,['suki','kumo']);assert.equal(merged.keys.openai,'LOCAL');}
});
test('all companion scripts are versioned offline assets and load once',()=>{
 const html=fs.readFileSync(require.resolve('../index.html'),'utf8'),sw=fs.readFileSync(require.resolve('../sw.js'),'utf8');
 for(const file of ['cat-friends-core.js','cat-friends-scene.js','cat-friends-ui.js','cat-friends.css']){assert.equal(html.split(file+'?v=').length-1,1);assert.ok(sw.includes(file+'?v='+require('../release.json').version));}
 assert.ok(html.indexOf('cat-friends-core.js')<html.indexOf('app.js?v='));
});
test('real Three.js companion scene uses a bounded reusable group and releases resources',async()=>{
 const T=await import('../vendor/three-r180/three.module.js');const M=require('../cat-friends-scene.js'),scene=new T.Scene(),pet=[];
 const api=M.mount(T,scene,{lite:true,onPet:c=>pet.push(c.id)}),camera=new T.PerspectiveCamera();camera.position.set(2,3,8);
 api.set(['miso','suki','kumo','yuki']);assert.equal(api.count,3);api.tick(.02,camera);
 let geometryCount=0;scene.traverse(o=>{if(o.geometry)geometryCount++;});assert.ok(geometryCount>30);
 const group=scene.getObjectByName('Cat friends');assert.equal(group.children.length,3);
 assert.equal(api.pet('miso'),true);assert.deepEqual(pet,['miso']);
 const head=group.children[0].children[0].children.find(c=>c.type==='Group');
 api.tick(.1,camera);const poses=JSON.stringify(group.toJSON());api.tick(0,camera);assert.equal(JSON.stringify(group.toJSON()),poses,'paused ticks do not advance animation');
 api.set(['yuki']);assert.equal(api.count,1);assert.equal(api.pet('miso'),false);assert.equal(api.pet('yuki'),true);
 for(let i=0;i<10;i++)api.set(['miso','suki','yuki']);assert.equal(group.children.length,4,'at most four allocated models per mount');
 assert.equal(scene.children.length,1);api.dispose();api.dispose();assert.equal(scene.children.length,0);assert.equal(api.count,0);
});
