const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
for(const [name,file,prefix,core,unit] of [
 ['Maths','entrance-ui.js','ep',require('../entrance-core.js'),'percent'],
 ['Science','science-path-ui.js','sp',require('../science-path-core.js'),'measurement']
]){
 const src=fs.readFileSync(require.resolve('../'+file),'utf8');
 const start=src.indexOf('function '+(prefix==='sp'?'selection':'editor')+'(');
 const render=vm.runInNewContext(src.slice(start,src.indexOf('function tutorPanel()',start))+';editor',{
  E:core,pen:false,strokes:[],esc:s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))
 });
 const q=core.B.make(unit,1,19723);
 test(name+': outside-help declaration is separate and above the working pad',()=>{
  const html=render(q),id=prefix+'Guess';
  assert.match(html,new RegExp('<div class="'+prefix+'-attempt-note">'));
  assert.match(html,new RegExp('for="'+id+'"'));
  assert.match(html,new RegExp('aria-describedby="'+id+'Note"'));
  assert.equal((html.match(new RegExp('id="'+id+'"','g'))||[]).length,1);
  assert.ok(html.indexOf('id="'+id+'"')<html.indexOf('class="'+prefix+'-input-switch"'));
  assert.ok(html.indexOf('id="'+id+'"')<html.indexOf('id="'+prefix+'Working"'));
  assert.doesNotMatch(html.match(new RegExp('<input[^>]+id="'+id+'"[^>]*>'))[0],/\bchecked\b|\brequired\b/);
  assert.match(html,/Tick only if this applies/);
 });
 test(name+': saved help stays checked and papers have no declaration',()=>{
  assert.match(render(q,{guess:true},false,true),new RegExp('id="'+prefix+'Guess"[^>]*checked[^>]*disabled'));
  assert.doesNotMatch(render(q,{},true),new RegExp('id="'+prefix+'Guess"|'+prefix+'-attempt-note'));
 });
 test(name+': help recording and independent credit remain unchanged',()=>{
  for(const type of ['none','outside','hint']){
   const d=core.fresh(),v=core.startPractice(d,unit,{phase:'apply',seed:19723,now:1});
   if(type==='hint')core.help(d);
   core.touchDraft(d,{answer:prefix==='sp'?q.answer:q.answerLabel,working:'My reasoning',guess:type==='outside'},2);
   const a=core.respond(d,3).attempt;
   assert.equal(a.correct,true);assert.equal(a.independent,type==='none');assert.equal(a.guess,type==='outside');
  }
 });
}
