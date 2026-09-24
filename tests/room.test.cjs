const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {JSDOM}=require('jsdom');
const root=path.resolve(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const version=require('../release.json').version;
function room({fail=false,picture=false}={}){
 const dom=new JSDOM(html,{url:'https://mochi.test/app/',runScripts:'outside-only'}),w=dom.window;
 w.S={coins:100,pets:4,done:17,owned:[],worn:{head:null,eyes:null,neck:null},learning:{keep:'unchanged'}};
 w.$=id=>w.document.getElementById(id);w.pick=a=>a[0];w.esc=s=>s;w.save=()=>w.document.dispatchEvent(new w.Event('mochi:state-saved'));
 // Use the real room purchase, pet and wear functions with the normal DOM.
 const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
 w.eval(app.slice(app.indexOf('const TREATS ='),app.indexOf('function showView(which)')));
 let loads=0,mounts=0,options,disposed=0;const state={visible:false,pets:0,feeds:[],wear:{}};
 w.loadMochiScene=async url=>{loads++;assert.equal(url,'https://mochi.test/app/mochi-room-scene.js?v='+version);if(fail)throw Error('No WebGL');return{mountMochiRoom:async(host,opts)=>{
  mounts++;options=opts;host.prepend(w.document.createElement('canvas'));
  return{setVisible:v=>state.visible=v,setWear:v=>state.wear={...v},setGrowth:v=>state.growth=v,pet:()=>state.pets++,feed:n=>state.feeds.push(n),dispose:()=>disposed++};
 }}};
 if(picture)w.localStorage.setItem('mochi-room-view-v1','picture');
 w.MochiReady=true;
 w.eval(fs.readFileSync(path.join(root,'mochi-room.js'),'utf8').replace('import(moduleURL.href)','window.loadMochiScene(moduleURL.href)'));
 const flush=()=>new Promise(r=>setTimeout(r,0));
 return{w,state,flush,dom,get options(){return options},get counts(){return{loads,mounts,disposed}},stroke:()=>options.onPet(),fail:value=>fail=value,contextLost:()=>options.onError()};
}
test('3D opens once on a room visit, credits one stroke, and preserves purchases and learning',async()=>{
 const h=room(),{w,state}=h;
 try{
  assert.equal(h.counts.loads,0);
  w.$('viewRoom').style.display='';await h.flush();
  assert.deepEqual(h.counts,{loads:1,mounts:1,disposed:0});assert.equal(w.$('stage').hidden,true);
  h.stroke();assert.equal(w.S.pets,5);assert.equal(state.pets,0,'scene callback cannot recursively pet itself');
  w.petCat();assert.equal(w.S.pets,6);assert.equal(state.pets,1);
  w.feed({id:'fish',name:'Fish snack',cost:3,purr:22});assert.equal(w.S.coins,97);assert.deepEqual(state.feeds,['Fish snack']);
  w.toggleWear({id:'bow',name:'Bow tie',cost:15,slot:'neck'});assert.equal(w.S.coins,82);assert.equal(state.wear.neck,'bow');
  w.toggleWear({id:'bow',name:'Bow tie',cost:15,slot:'neck'});assert.equal(w.S.coins,82);assert.equal(state.wear.neck,null);
  assert.deepEqual(w.S.learning,{keep:'unchanged'});assert.equal(w.S.done,17);
  w.$('roomPictureMode').click();assert.equal(state.visible,false);assert.equal(w.$('stage').hidden,false);
  w.$('room3dMode').click();await h.flush();assert.equal(h.counts.mounts,1);
  w.$('viewRoom').style.display='none';await h.flush();assert.equal(state.visible,false);
  w.$('viewRoom').style.display='';await h.flush();assert.equal(state.visible,true);assert.equal(h.counts.mounts,1);
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
 w.MochiPlanner={init:s=>s.planner,pet:()=>({level})};
 try{
  w.$('viewRoom').style.display='';await h.flush();
  assert.equal(h.options.level,2);assert.equal(h.state.growth,2);
  level=3;w.save();assert.equal(h.state.growth,3);
  level=4;w.document.dispatchEvent(new w.Event('mochi:cloud-merged'));assert.equal(h.state.growth,4);
  assert.equal(h.counts.mounts,1,'growth updates the living scene without replacing it');
 }finally{h.dom.window.close();}
});
