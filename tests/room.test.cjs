const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {JSDOM}=require('jsdom');
const root=path.resolve(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const version=require('../release.json').version;
function room({fail=false,picture=false,android=false}={}){
 const dom=new JSDOM(html,{url:'https://mochi.test/app/',runScripts:'outside-only'}),w=dom.window;
 if(android)Object.defineProperty(w.navigator,'userAgent',{value:'Mozilla/5.0 (Linux; Android 14; SM-X210) Chrome/130.0.0.0'});
 w.S={coins:100,pets:4,done:17,owned:[],worn:{head:null,eyes:null,neck:null},learning:{keep:'unchanged'}};
 w.$=id=>w.document.getElementById(id);w.pick=a=>a[0];w.esc=s=>s;w.save=()=>w.document.dispatchEvent(new w.Event('mochi:state-saved'));
 const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
 w.eval(app.slice(app.indexOf('const TREATS ='),app.indexOf('function showView(which)')).replace('const TREATS =','var TREATS =').replace('const WEAR =','var WEAR ='));
 let loads=0,mounts=0,options,disposed=0;const state={visible:false,pets:0,feeds:[],wear:{},friends:[],reacts:[],modes:[],greets:0,toys:[]};
 w.MochiCatFriends={sync:()=>({selected:[]}),catalog:[]};
 w.loadMochiScene=async url=>{loads++;assert.equal(new URL(url).searchParams.get('v'),version);assert.match(url,/mochi-home-scene\.js/);if(fail)throw Error('No WebGL');return{CAT_FRIENDS_VERSION:1,mountMochiRoom:async(host,opts)=>{
  mounts++;options=opts;host.querySelector('.mh-stage').prepend(w.document.createElement('canvas'));
  return{setFriends:ids=>state.friends=[...ids],getFriendCount:()=>state.friends.length,setVisible:v=>state.visible=v,setWear:v=>state.wear={...v},setGrowth:v=>state.growth=v,setToys:t=>state.toys=[...t],setNeeds(){},pet:()=>state.pets++,feed:n=>state.feeds.push(n),react:a=>state.reacts.push(a),setMode:m=>{state.modes.push(m);state.mode=m;},get mode(){return state.mode||'idle'},wake(){state.mode='idle'},greet:()=>state.greets++,fillBowl(){},dispose:()=>disposed++};
 }}};
 if(picture)w.localStorage.setItem('mochi-room-view-v1','picture');
 w.MochiReady=true;
 for(const f of ['mochi-home-core.js','mochi-home-ui.js'])w.eval(fs.readFileSync(path.join(root,f),'utf8'));
 w.eval(fs.readFileSync(path.join(root,'mochi-room.js'),'utf8').replace('import(moduleURL.href)','window.loadMochiScene(moduleURL.href)'));
 const flush=()=>new Promise(r=>setTimeout(r,0));
 return{w,state,flush,dom,get options(){return options},get counts(){return{loads,mounts,disposed}},fail:value=>fail=value,contextLost:()=>options.onError()};
}
test('Mochi’s Home opens once per visit, greets Euna, and keeps purchases and learning intact',async()=>{
 const h=room(),{w,state}=h;
 try{
  assert.equal(h.counts.loads,0);
  w.$('viewRoom').style.display='';await h.flush();
  assert.deepEqual(h.counts,{loads:1,mounts:1,disposed:0});assert.equal(w.$('stage').hidden,true);assert.equal(w.$('viewRoom').classList.contains('home-3d'),true);
  assert.equal(state.greets,1,'Mochi comes over to say hello');
  h.options.onStroke(1);assert.equal(w.S.pets,5);assert.ok(state.reacts.includes('purr'));assert.ok(w.S.home.needs.love>=70);
  w.$('mhDock').querySelector('[data-care=feed]').click();assert.ok(state.reacts.includes('eat'));assert.ok(w.S.home.routine.done.includes('meal'));
  w.$('mhDock').querySelector('[data-care=treats]').click();w.$('mhDrawer').querySelector('[data-treat=fish]').click();assert.equal(w.S.coins,97);assert.equal(w.S.fed,1);assert.ok(state.reacts.includes('treat:fish'));
  w.$('mhDock').querySelector('[data-care=wardrobe]').click();w.$('mhDrawer').querySelector('[data-wear=bow]').click();assert.equal(w.S.coins,82);assert.equal(state.wear.neck,'bow');
  w.$('mhDock').querySelector('[data-care=play]').click();w.$('mhDrawer').querySelector('[data-toy=laser]').click();assert.equal(w.S.coins,70);assert.ok(w.S.home.toys.includes('laser'));
  w.$('mhDrawer').querySelector('[data-toy=laser]').click();assert.equal(state.mode,'play:laser');assert.equal(w.$('mhModebar').hidden,false);
  w.$('mhModeDone').click();assert.equal(state.mode,'idle');
  assert.deepEqual(w.S.learning,{keep:'unchanged'});assert.equal(w.S.done,17);
  w.$('roomPictureMode').click();assert.equal(state.visible,false);assert.equal(w.$('stage').hidden,false);assert.equal(w.$('viewRoom').classList.contains('home-3d'),false);
  w.$('room3dMode').click();await h.flush();assert.equal(h.counts.mounts,1);
  w.$('viewRoom').style.display='none';await h.flush();assert.equal(state.visible,false);
  w.$('viewRoom').style.display='';await h.flush();assert.equal(state.visible,true);assert.equal(h.counts.mounts,1);
 }finally{h.dom.window.close();}
});
test('a coin-free cat is still fully cared for: feeding, brushing, play with starter toys and naps cost nothing',async()=>{
 const h=room(),{w,state}=h;w.S.coins=0;
 try{
  w.$('viewRoom').style.display='';await h.flush();
  w.$('mhDock').querySelector('[data-care=feed]').click();
  w.$('mhDock').querySelector('[data-care=brush]').click();assert.equal(state.mode,'brush');for(let i=0;i<20;i++)h.options.onBrush(.2);
  w.$('mhDock').querySelector('[data-care=play]').click();w.$('mhDrawer').querySelector('[data-toy=feather]').click();assert.equal(state.mode,'play:feather');for(let i=0;i<20;i++)h.options.onPlay(.25);
  assert.equal(w.S.coins,0);assert.deepEqual([...w.S.home.routine.done].sort(),['brush','meal','play']);
 }finally{h.dom.window.close();}
});
test('unavailable 3D and context loss fall back without charging coins, and retry remounts once',async()=>{
 const h=room({fail:true}),{w}=h;w.console.warn=()=>{};
 try{
  w.$('viewRoom').style.display='';await h.flush();assert.equal(w.$('stage').hidden,false);assert.equal(w.$('room3dRetry').hidden,false);assert.equal(w.S.coins,100);
  h.fail(false);w.$('room3dRetry').click();await h.flush();assert.equal(h.counts.mounts,1);
  h.contextLost();assert.equal(w.$('stage').hidden,false);assert.equal(h.state.visible,false);
  w.$('room3dRetry').click();await h.flush();assert.equal(h.counts.disposed,1);assert.equal(h.counts.mounts,2);assert.equal(w.$('mochi3d').querySelectorAll('canvas').length,1);
 }finally{h.dom.window.close();}
});
test('saved picture preference does not load or initialise the 3D renderer',async()=>{
 const h=room({picture:true});try{h.w.$('viewRoom').style.display='';await h.flush();assert.equal(h.counts.loads,0);assert.equal(h.w.$('stage').hidden,false);}finally{h.dom.window.close();}
});
test('earned growth is applied at mount and refreshed after local saves and cloud merges',async()=>{
 const h=room(),{w}=h;let level=2;
 w.MochiPlanner={init:s=>s.planner,pet:()=>({level,name:'Explorer'})};
 try{
  w.$('viewRoom').style.display='';await h.flush();
  assert.equal(h.options.level,2);assert.equal(h.state.growth,2);
  level=3;w.save();assert.equal(h.state.growth,3);
  level=4;w.document.dispatchEvent(new w.Event('mochi:cloud-merged'));assert.equal(h.state.growth,4);
  assert.equal(h.counts.mounts,1,'growth updates the living scene without replacing it');
 }finally{h.dom.window.close();}
});
test('Android starts with lighter graphics and retry preserves progress and explains the failure',async()=>{
 const h=room({android:true}),{w}=h;
 try{
  w.$('viewRoom').style.display='';await h.flush();assert.equal(h.options.quality,'lite');
  h.options.onError(Error('The browser reset the 3D graphics context.'));
  assert.match(w.$('room3dStatus').textContent,/graphics context/);
  w.$('room3dRetry').click();await h.flush();
  assert.equal(h.options.quality,'lite');assert.equal(h.counts.disposed,1);assert.equal(w.S.coins,100);
  assert.equal(w.$('mochi3d').querySelectorAll('canvas').length,1);
 }finally{h.dom.window.close();}
});
