const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const P=require('../planner-core.js'),F=require('../cat-friends-core.js');
const currentVersion=require('../release.json').version;
function harness({missingFactory=false,legacy=false,failImport=false,mismatch=false}={}){
 const nodes=new Map(),calls=[];let disposed=0,mounted=0,rendered=0,legacyMounted=0;
 const node=id=>{if(!nodes.has(id))nodes.set(id,{id,style:{display:id==='viewRoom'?'none':''},hidden:false,textContent:'',parentElement:{hidden:false},setAttribute(k,v){this[k]=v;},querySelectorAll(){return [];}});return nodes.get(id);};
 const state={worn:{neck:'bow'},coins:42,planner:P.fresh(),learning:{attempts:[]},science:{attempts:[]}};
 for(let i=0;i<40;i++)state.planner.milestones[`maths:skill${i}:idea`]={subject:'maths',skill:'skill'+i,kind:'idea',earnedAt:1790330000000,evidence:['synthetic-'+i]};
 const factory={mount(){}};
 const root={MochiReady:true,MochiCatFriends:F,MochiPlanner:P,...(!missingFactory?{MochiCatFriendsScene:factory}:{})};
 const document={baseURI:'https://mochi.test/app/',getElementById:node,querySelector:()=>({src:'https://mochi.test/app/mochi-room.js?v='+currentVersion}),addEventListener(){}};
 const modern={CAT_FRIENDS_VERSION:1,mountMochiRoom:async()=>{mounted++;return {setFriends(ids){rendered=mismatch?0:ids.length;},getFriendCount:()=>rendered,setWear(){},setGrowth(){},setVisible(){},dispose(){disposed++;},pet(){},feed(){}};}};
 const stale={mountMochiRoom:async()=>{legacyMounted++;return {setWear(){},setGrowth(){},setVisible(){}};}};
 const imports=async url=>{
  calls.push(url);if(failImport)throw Error('Synthetic interrupted download');
  if(new URL(url).pathname.endsWith('/cat-friends-scene.js')){root.MochiCatFriendsScene=factory;return {};}
  return legacy&&!new URL(url).searchParams.has('repair')?stale:modern;
 };
 const ctx={window:root,document,S:state,URL,Date,navigator:{userAgent:'test'},localStorage:{getItem(){return null;},setItem(){}},MutationObserver:class{observe(){}},console:{warn(){}},importScene:imports};
 const source=fs.readFileSync(process.env.MOCHI_TEST_ROOM_SOURCE||require.resolve('../mochi-room.js'),'utf8').replace(/\bimport\(/g,'importScene(');
 vm.runInNewContext(source,ctx);
 return {root,state,nodes,calls,stats:()=>({disposed,mounted,rendered,legacyMounted}),open:async()=>{node('viewRoom').style.display='';await root.MochiRoom.open();}};
}
test('restored earned progress renders three friends without another answered question',async()=>{
 const h=harness(),before=JSON.stringify(h.state);await h.open();assert.equal(h.stats().rendered,3);assert.equal(h.stats().mounted,1);assert.deepEqual(h.state.catFriends.selected,['miso','suki','kumo']);
 const {catFriends,...rest}=h.state;assert.equal(JSON.stringify(rest),before);assert.equal(h.calls.length,1);assert.equal(new URL(h.calls[0]).searchParams.get('v'),currentVersion);
});
test('an interrupted companion-script load is recovered before mounting the room',async()=>{
 const h=harness({missingFactory:true});await h.open();assert.equal(h.calls.length,2);assert.match(h.calls[0],/cat-friends-scene\.js\?v=/);assert.equal(h.stats().rendered,3);assert.equal(h.nodes.get('mochi3d').hidden,false);
});
test('an older room module is retried once and is never silently mounted without friends',async()=>{
 const h=harness({legacy:true});await h.open();assert.equal(h.stats().legacyMounted,0);assert.equal(h.stats().rendered,3);assert.equal(h.calls.length,2);assert.ok(new URL(h.calls[1]).searchParams.has('repair'));
});
test('a renderer count mismatch falls back instead of claiming the selected friends are drawn',async()=>{
 const h=harness({mismatch:true});await h.open();assert.equal(h.stats().disposed,1);assert.equal(h.nodes.get('mochi3d').hidden,true);assert.equal(h.nodes.get('stage').hidden,false);assert.match(h.nodes.get('room3dStatus').textContent,/Not all selected cat friends/);assert.equal(h.state.catFriends.selected.length,3);
});
test('failed recovery keeps progress and exposes a retry rather than a false success',async()=>{
 const h=harness({missingFactory:true,failImport:true}),before=JSON.stringify(h.state);await h.open();assert.equal(h.stats().mounted,0);assert.equal(h.nodes.get('stage').hidden,false);assert.equal(h.nodes.get('room3dRetry').hidden,false);assert.match(h.nodes.get('room3dStatus').textContent,/interrupted download/);assert.equal(JSON.stringify(h.state),before);
});
