const test=require('node:test'),assert=require('node:assert/strict');
const F=require('../cat-friends-core.js');
async function setup(opts={}){
 const T0=await import('../vendor/three-r180/three.module.js'),cat=await import('../mochi-home-cat.js');
 const listeners={};const canvas={className:'',style:{},setAttribute(){},addEventListener(k,f){listeners[k]=f;},removeEventListener(){},remove(){},getBoundingClientRect:()=>({left:0,top:0,width:800,height:500}),setPointerCapture(){}};
 class FakeRenderer{constructor(){this.domElement=canvas;this.debug={};this.shadowMap={};this.renders=0;}setPixelRatio(){}setClearColor(){}setSize(){}render(){this.renders++;}dispose(){this.disposed=true;}forceContextLoss(){}}
 const T={...T0,WebGLRenderer:FakeRenderer};
 globalThis.window=globalThis.window||{devicePixelRatio:2};globalThis.document=globalThis.document||{addEventListener(){},removeEventListener(){},hidden:false};
 const stage={clientWidth:800,clientHeight:500,prepend(){}},host={dataset:{},querySelector:()=>stage};
 const events={stroke:0,brush:0,play:0,nap:0};
 const {mountMochiHome,timeOfDay}=await import('../mochi-home-scene.js');
 const api=await mountMochiHome(host,{three:T,catModule:cat,quality:'full',growth:2,toys:['feather','yarn'],now:()=>new Date(2026,9,1,11),onStroke:()=>events.stroke++,onBrush:n=>events.brush+=n,onPlay:n=>events.play+=n,onNap:n=>events.nap+=n,...opts});
 const run=(secs)=>{for(let i=0;i<secs*30;i++)api.debug.tick(1/30);};
 return {api,run,events,T,host,timeOfDay};
}
test('the home draws Mochi, follows the clock, and never shows more than three friends',async()=>{
 const {api,host,timeOfDay}=await setup();
 assert.equal(api.timeOfDay,'day');assert.equal(host.dataset.timeOfDay,'day');
 assert.equal(timeOfDay(new Date(2026,9,1,22)),'night');assert.equal(timeOfDay(new Date(2026,9,1,18)),'golden');
 assert.ok(api.debug.scene.getObjectByName('Mochi'));
 api.setFriends(F.catalog.slice(0,5));assert.equal(api.getFriendCount(),3);
 assert.equal(api.petFriend(F.catalog[0].id),true);assert.equal(api.petFriend(F.catalog[4].id),false);
 api.setFriends([F.catalog[1]]);assert.equal(api.getFriendCount(),1);
 api.setToys(['feather','yarn','box','tree']);assert.ok(api.debug.scene.getObjectByName('box'));assert.ok(api.debug.scene.getObjectByName('tree'));
 api.setToys(['feather','yarn']);assert.equal(api.debug.scene.getObjectByName('box'),undefined);
 api.dispose();api.dispose();
});
test('every reaction and trick runs without errors and Mochi stays inside the room',async()=>{
 const {api,run}=await setup();
 for(const a of ['eat','treat:fish','treat:milk','treat:tuna','treat:prawn','purr','shine','hop','full','yawn','wake','tilt','trick:sit','trick:highfive','trick:spin','trick:roll','trick:wave','trick:chase','trick:hop']){api.react(a);run(3);}
 api.greet();run(60);
 const p=api.debug.pos;assert.ok(p.x>=-2.46&&p.x<=2.46&&p.z>=-2.01&&p.z<=2.11,'inside the room');
 api.dispose();
});
test('play, brushing and naps report progress back to the care rules',async()=>{
 const {api,run,events}=await setup();
 api.setMode('play:laser');run(8);assert.ok(events.play>0,'chasing the laser counts as play');
 api.setMode('play:yarn');run(8);assert.ok(events.play>0);
 api.setMode('nap');run(25);assert.ok(events.nap>0,'sleeping restores energy');assert.equal(api.activity,'sleep');
 api.wake();run(1);assert.notEqual(api.activity,'sleep');
 api.setMode('brush');run(2);assert.equal(api.activity,'brush');
 api.setMode('idle');run(3);
 api.setGrowth(4);api.setWear({head:'crown',eyes:'specs',neck:'bow'});run(1);
 const wear=api.debug.mochi.parts.wear;assert.equal(wear.head.children.length,1);assert.equal(wear.eyes.children.length,1);assert.equal(wear.neck.children.length,1);
 api.setWear({});assert.equal(wear.head.children.length,0);
 api.dispose();
});
test('lite quality and reduced motion still work',async()=>{
 const {api,run}=await setup({quality:'lite',reducedMotion:true});api.react('trick:roll');run(4);api.react('hop');run(2);api.dispose();
});

test('paws stay planted while walking: the gait follows distance travelled, not the clock',async()=>{
 const T=await import('../vendor/three-r180/three.module.js'),C=await import('../mochi-home-cat.js');
 for(const growth of [0,4])for(const speed of [.65,1.0]){
  const c=C.buildCat(T,null,{growth});const scene=new T.Scene();scene.add(c.group);const dt=1/60;let x=0,v=0,slip=0,n=0,hmin=1e9,hmax=-1e9;const prev=c.parts.legs.map(()=>null);
  for(let i=0;i<600;i++){v=Math.min(speed,v+2.5*dt);x+=v*dt;c.group.position.z=x;c.update(dt,false,{speed:v,turn:0});scene.updateMatrixWorld(true);
   c.parts.legs.forEach((L,k)=>{const q=L.paw.getWorldPosition(new T.Vector3());if(prev[k]&&i>240&&L.lift<1e-6&&prev[k].lift<1e-6){slip+=Math.abs(q.z-prev[k].z);n++;if(!L.front){hmin=Math.min(hmin,q.y);hmax=Math.max(hmax,q.y);}}prev[k]=Object.assign(q,{lift:L.lift});});}
  const ratio=slip/n/(speed*dt);
  assert.ok(ratio<.2,`growth ${growth} speed ${speed}: planted paws slide ${(ratio*100).toFixed(0)}% of body motion`);
  assert.ok(hmax-hmin<.012,`planted hind paws stay on the floor (height varies ${((hmax-hmin)*1000).toFixed(1)} mm)`);
 }
});
test('Mochi eases into motion and brakes before arriving instead of starting and stopping at full speed',async()=>{
 const {api,run}=await setup();const D=api.debug;D.pos.set(-1,0,.8);api.react('tilt');run(3);
 const speeds=[];let last={x:D.pos.x,z:D.pos.z};api.greet();
 for(let i=0;i<150;i++){D.tick(1/30);speeds.push(Math.hypot(D.pos.x-last.x,D.pos.z-last.z)*30);last={x:D.pos.x,z:D.pos.z};}
 const moving=speeds.findIndex(v=>v>.05);assert.ok(moving>=0);
 assert.ok(speeds[moving]<.4,'starts gently');
 const peak=Math.max(...speeds),stopAt=speeds.findIndex((v,i)=>i>moving&&v<.02);
 assert.ok(stopAt<0||speeds[stopAt-3]<peak*.8,'slows down before stopping');
 api.dispose();
});
