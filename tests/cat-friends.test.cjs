const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const P=require('../planner-core.js'),F=require('../cat-friends-core.js');
const now=new Date(2026,8,25,12).getTime();
function state(n=0){const s={learning:{attempts:[]},science:{attempts:[]},coins:42,owned:['bow'],worn:{neck:'bow'},planner:P.fresh()};for(let i=0;i<n;i++)s.planner.milestones[`maths:skill${i}:idea`]={subject:'maths',skill:'skill'+i,kind:'idea',earnedAt:now,evidence:['synthetic-'+i]};return s;}
function addTime(s,subject,minutes,id='time'){const offset=subject==='science'?4*3600000:0,end=now-offset;s.planner.sessions.push({id:id+'-'+subject,subject,day:P.localDay(now),start:end-minutes*60000,end});}

test('collection contains Mochi plus 99 unique collectible friends',()=>{
 assert.equal(F.TOTAL,100);assert.equal(F.catalog.length,99);assert.equal(new Set(F.catalog.map(c=>c.id)).size,99);assert.equal(new Set(F.catalog.map(c=>c.name)).size,99);
 assert.deepEqual(F.catalog.slice(0,4).map(c=>c.breed),['British Shorthair','Siamese','Maine Coon','Ragdoll']);
 assert.deepEqual(F.catalog.slice(0,4).map(c=>c.points),[2,8,18,32]);
 for(let i=1;i<F.catalog.length;i++)assert.ok(F.catalog[i].points>F.catalog[i-1].points,'thresholds rise at '+i);
 assert.ok(F.catalog.at(-1).points>=900,'the 100th cat is a long-term collection goal');
});

test('legacy milestone unlocks are preserved while new cats continue from Cat Points',()=>{
 for(const [n,expected]of [[0,0],[1,0],[2,1],[7,1],[8,2],[17,2],[18,3],[31,3],[32,4]])assert.equal(F.sync(state(n),now).unlocked.length,expected);
 const s=state(57),before=JSON.stringify(s);F.sync(s,now);assert.ok(s.catFriends.unlocked.length>4);assert.equal(s.catFriends.selected.length,3);
 const {catFriends,...rest}=s;assert.equal(JSON.stringify(rest),before);
});

test('reaching exactly 2× a non-rest subject target earns one bounded double-time award worth two Cat Points',()=>{
 const s=state(10),target=P.minutes(s.planner,'maths',now);addTime(s,'maths',target*2,'double');
 let r=F.report(s,now);assert.equal(r.timeBonusAwards,1);assert.equal(r.timeBonusPoints,2);assert.equal(r.points,12);
 F.sync(s,now+1000);F.sync(s,now+2000);r=F.report(s,now+3000);assert.equal(r.timeBonusAwards,1,'same subject/day cannot farm repeated awards');
 addTime(s,'science',P.minutes(s.planner,'science',now)*2,'double2');r=F.report(s,now+4000);assert.equal(r.timeBonusAwards,2);assert.equal(r.timeBonusPoints,4,'at most one +2 award per subject/day');
});

test('time below 2× and rest-day time never earns Cat Points; time beyond 2× earns nothing extra',()=>{
 const s=state(),target=P.minutes(s.planner,'maths',now);addTime(s,'maths',target*2-1,'almost');assert.equal(F.report(s,now).timeBonusAwards,0);
 s.planner.sessions=[];addTime(s,'maths',target*4,'over');assert.equal(F.report(s,now).timeBonusAwards,1);assert.equal(F.report(s,now).timeBonusPoints,2);
 const sunday=now+2*86400000;s.planner.schedule.week[P.weekday(sunday)].maths=0;s.planner.sessions.push({id:'rest',subject:'maths',day:P.localDay(sunday),start:sunday-3600000,end:sunday});
 assert.equal(F.report(s,sunday).doubleBonuses.filter(x=>x.key===P.localDay(sunday)+':maths').length,0);
});

test('full collection is reachable only from earned milestones plus bounded bonus records',()=>{
 const s=state(500);s.catFriends=F.fresh();
 for(let i=0;i<240;i++)for(const subject of ['maths','science'])s.catFriends.doubleBonuses.push({key:`2027-${String(1+Math.floor(i/28)).padStart(2,'0')}-${String(1+i%28).padStart(2,'0')}:${subject}`,earnedAt:now+i});
 const r=F.report(s,now);assert.equal(r.unlockedTotal,100);assert.equal(r.nextCat,null);
});

test('Mochi cannot be removed; locked, unknown and fourth visitors cannot be invited',()=>{
 const s=state(32);F.sync(s,now);assert.equal(F.select(s,'mochi',false).ok,false);assert.equal(F.select(s,'__proto__',true).ok,false);
 assert.equal(F.select(s,'yuki',true).ok,false);assert.equal(s.catFriends.selected.length,3);
 assert.equal(F.select(s,'miso',false,now).ok,true);assert.equal(F.select(s,'yuki',true,now+1).ok,true);assert.deepEqual(s.catFriends.selected,['suki','kumo','yuki']);
 assert.equal(F.select(state(0),'miso',true).ok,false);
});

test('choosing no visitors remains deliberate after save, restore and new unlocks',()=>{
 const s=state(60);F.sync(s,now);for(const id of s.catFriends.selected.slice())F.select(s,id,false,now);
 for(let i=0;i<10;i++)F.sync(s,now+i);assert.deepEqual(s.catFriends.selected,[]);assert.equal(s.catFriends.selectionEdited,true);
 const restored={...s,catFriends:F.validate(JSON.parse(JSON.stringify(s.catFriends)))};F.sync(restored,now);assert.deepEqual(restored.catFriends.selected,[]);
});

test('version-1 rosters migrate and malformed bonus ledgers are bounded and sanitised',()=>{
 const old=F.validate({version:1,unlocked:['miso','yuki'],selected:['miso'],selectionEdited:true,selectionUpdatedAt:123});assert.equal(old.version,2);assert.deepEqual(old.unlocked,['miso','yuki']);assert.deepEqual(old.doubleBonuses,[]);
 const bad=F.validate({version:2,unlocked:['miso','<script>'],selected:['miso','__proto__'],doubleBonuses:[{key:'2026-09-25:maths',earnedAt:123},{key:'bad',earnedAt:999},{key:'2026-09-25:maths',earnedAt:500}],selectionUpdatedAt:Infinity});
 assert.deepEqual(bad.unlocked,['miso']);assert.deepEqual(bad.selected,['miso']);assert.equal(bad.doubleBonuses.length,1);assert.equal(bad.selectionUpdatedAt,0);
});

test('cloud merge unions unlocked cats and time bonuses while respecting the latest deliberate roster',()=>{
 const a=state(18),b=state(32);F.sync(a,now);F.sync(b,now);F.select(a,'miso',false,now+1);F.select(b,'kumo',false,now+2);F.select(b,'yuki',true,now+3);
 a.catFriends.doubleBonuses.push({key:'2026-09-24:maths',earnedAt:now-2});b.catFriends.doubleBonuses.push({key:'2026-09-24:science',earnedAt:now-1});
 const merged=F.merge(a.catFriends,b.catFriends);assert.deepEqual(merged.selected,['miso','suki','yuki']);assert.equal(merged.doubleBonuses.length,2);assert.deepEqual(F.merge(b.catFriends,a.catFriends),merged);assert.deepEqual(F.merge(merged,merged),merged);
});

test('learning backup contains only sanitised cat collection preferences and no parent keys',()=>{
 const s=state(32);s.learning={version:1,attempts:[],notes:[],benchmarks:[]};s.keys={openai:'PRIVATE_TEST_KEY'};F.sync(s,now);
 const ctx={MochiLearning:require('../learning.js'),MochiPlanner:P,MochiCatFriends:F,Intl};vm.runInNewContext(fs.readFileSync(require.resolve('../learning-review.js'),'utf8'),ctx);
 const exported=ctx.MochiReview.build(s,'6.6.0');assert.deepEqual(JSON.parse(JSON.stringify(exported.catFriends)),s.catFriends);assert.doesNotMatch(JSON.stringify(exported),/PRIVATE_TEST_KEY/);
});

test('family sync retains collection bonuses and roster edits',()=>{
 const ctx={window:{MochiCatFriends:F},MochiCatFriends:F,document:{addEventListener(){}},JSON};
 const src=fs.readFileSync(require.resolve('../cloud-sync.js'),'utf8').replace('if(window.MochiReady)init();','window.testMerge=mergeState;if(window.MochiReady)init();');vm.runInNewContext(src,ctx);
 const a=state(32),b=state(32);F.sync(a,now);F.sync(b,now);F.select(a,'miso',false,now+10);a.catFriends.doubleBonuses.push({key:'2026-09-24:maths',earnedAt:now});b.catFriends.doubleBonuses.push({key:'2026-09-24:science',earnedAt:now});a.keys={openai:'LOCAL'};
 const merged=ctx.window.testMerge(a,b,true);assert.deepEqual(merged.catFriends.selected,['suki','kumo']);assert.equal(merged.catFriends.doubleBonuses.length,2);assert.equal(merged.keys.openai,'LOCAL');
});

test('collection UI is paginated and companion scripts stay versioned offline',()=>{
 const html=fs.readFileSync(require.resolve('../index.html'),'utf8'),sw=fs.readFileSync(require.resolve('../sw.js'),'utf8'),ui=fs.readFileSync(require.resolve('../cat-friends-ui.js'),'utf8');
 for(const file of ['cat-friends-core.js','cat-friends-scene.js','cat-friends-ui.js','cat-friends.css']){assert.equal(html.split(file+'?v=').length-1,1);assert.ok(sw.includes(file+'?v='+require('../release.json').version));}
 assert.match(ui,/const PAGE=12/);assert.match(ui,/Cat Points/);assert.match(ui,/100 cats total/);assert.doesNotMatch(ui,/for\(const cat of F\.catalog\)\{/,'do not render all 99 portraits at mount');
});

test('real Three.js companion scene still limits the room to three visiting friends and releases resources',async()=>{
 const T=await import('../vendor/three-r180/three.module.js');const M=require('../cat-friends-scene.js'),scene=new T.Scene(),pet=[];
 const api=M.mount(T,scene,{lite:true,onPet:c=>pet.push(c.id)}),camera=new T.PerspectiveCamera();camera.position.set(2,3,8);
 api.set(['miso','suki','kumo','yuki']);assert.equal(api.count,3);api.tick(.02,camera);
 const group=scene.getObjectByName('Cat friends');assert.equal(group.children.length,3);assert.equal(api.pet('miso'),true);assert.deepEqual(pet,['miso']);
 api.set(['yuki']);assert.equal(api.count,1);assert.equal(api.pet('miso'),false);assert.equal(api.pet('yuki'),true);
 for(let i=0;i<10;i++)api.set(['miso','suki','yuki']);assert.equal(group.children.length,4,'models are created lazily only for cats actually visited');
 api.dispose();api.dispose();assert.equal(scene.children.length,0);assert.equal(api.count,0);
});
