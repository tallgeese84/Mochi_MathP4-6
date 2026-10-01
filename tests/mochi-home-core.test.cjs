const test=require('node:test'),assert=require('node:assert/strict');
const H=require('../mochi-home-core.js');
const HOUR=3600000,T0=Date.UTC(2026,9,1,2,0,0);

test('time away never makes Mochi sad: needs settle at a cosy floor and energy recovers',()=>{
 for(const away of [0,1,5,24,72,24*14,24*400]){
  const h=H.fresh(T0);H.advance(h,T0+away*HOUR);
  for(const k of H.NEEDS)assert.ok(h.needs[k]>=H.FLOOR[k],`${k} after ${away}h`);
  assert.ok(['joy','happy','content','cosy'].includes(H.mood(h).id));
  if(away>=3)assert.ok(h.needs.energy>=95,'a long absence is a nap');
 }
});

test('no wording anywhere suggests guilt, illness, hunger pangs or loss',()=>{
 const words=[...Object.values(H.WISH),...['joy','happy','content','cosy'].map(()=>''),H.mood({needs:Object.fromEntries(H.NEEDS.map(k=>[k,H.FLOOR[k]]))}).word,H.mood({needs:Object.fromEntries(H.NEEDS.map(k=>[k,H.FLOOR[k]]))}).line];
 const h=H.fresh(T0);for(const away of [2,10,48,200])words.push(H.welcome({...h,lastVisit:T0},T0+away*HOUR));
 for(const a of ['feed','brush','play','nap','pet','trick'])words.push(H.act(H.fresh(T0),a,a==='trick'?'roll':1,T0).text);
 const all=words.join(' ').toLowerCase();
 for(const w of ['sad','sick','ill','starv','hungry','lonely','neglect','miss','cry','die','dead','run away','left you','angry','upset','disappoint','forgot'])assert.ok(!new RegExp('\\b'+w).test(all),'avoid: '+w);
});

test('basic care is free and always possible; feeding a full cat is a polite no, not a penalty',()=>{
 const h=H.fresh(T0);h.needs.tummy=50;
 const r=H.act(h,'feed',null,T0);assert.equal(r.ok,true);assert.ok(h.needs.tummy>80);
 h.needs.tummy=95;const before=JSON.stringify(h.needs),full=H.act(h,'feed',null,T0);assert.equal(full.ok,false);assert.equal(JSON.stringify(h.needs),before);
});

test('bond only grows, is capped per day so care stays a habit, and resets the cap the next day',()=>{
 const h=H.fresh(T0);let last=0;
 for(let i=0;i<200;i++){h.needs.tummy=50;H.act(h,'feed',null,T0+i*1000);assert.ok(h.bond>=last);last=h.bond;}
 assert.equal(h.bond,H.BOND_PER_DAY);
 H.advance(h,T0+30*HOUR);h.needs.tummy=50;H.act(h,'feed',null,T0+30*HOUR);assert.equal(h.bond,H.BOND_PER_DAY+1);
 H.advance(h,T0+400*24*HOUR);assert.equal(h.bond,H.BOND_PER_DAY+1,'never decays');
});

test('tricks unlock from bond and are announced exactly once',()=>{
 const h=H.fresh(T0);assert.deepEqual(H.learned(h),['sit']);
 let announced=[];for(let d=0;d<10;d++){const t=T0+d*24*HOUR;for(let i=0;i<20;i++){h.needs.tummy=50;const r=H.act(h,'feed',null,t+i);announced.push(...r.newTricks.map(x=>x.id));}}
 assert.deepEqual(announced,['highfive','spin','roll','wave','chase','hop'].filter(id=>H.TRICKS.find(t=>t.id===id).bond<=h.bond));
 assert.equal(H.act(h,'trick','highfive',T0+11*24*HOUR).ok,true);
 const k=H.fresh(T0);assert.equal(H.act(k,'trick','hop',T0).ok,false);
});

test('brushing and play reach a satisfying finish and tick the daily routine',()=>{
 const h=H.fresh(T0);h.needs.clean=60;let r;do r=H.act(h,'brush',.5,T0);while(!r.done);assert.equal(h.needs.clean,100);assert.ok(h.routine.done.includes('brush'));
 h.needs.fun=50;h.needs.energy=100;do r=H.act(h,'play',.5,T0);while(!r.done);assert.ok(h.routine.done.includes('play'));
 h.needs.energy=25;assert.equal(H.act(h,'play',1,T0).ok,false,'too sleepy: suggests a nap');
 let n;do n=H.act(h,'nap',.5,T0);while(!n.done);assert.equal(h.needs.energy,100);
 const next=H.advance(h,T0+26*HOUR);assert.deepEqual(next.routine.done,[]);
});

test('toys cost coins only when bought, starter toys are free, and malformed saves are repaired',()=>{
 const h=H.fresh(T0);assert.equal(H.buyToy(h,'laser',5).ok,false);assert.ok(!h.toys.includes('laser'));
 const r=H.buyToy(h,'laser',20);assert.equal(r.cost,12);assert.ok(h.toys.includes('laser'));assert.equal(H.buyToy(h,'laser',0).cost,0);
 const v=H.validate({needs:{tummy:-50,fun:'x',love:900},toys:['laser','bogus'],bond:-3,bondToday:99,routine:{done:['meal','nope']},at:T0*10},T0);
 assert.equal(v.needs.tummy,H.FLOOR.tummy);assert.equal(v.needs.love,100);assert.deepEqual(v.toys,['feather','yarn','laser']);assert.equal(v.bond,0);assert.equal(v.bondToday,H.BOND_PER_DAY);assert.deepEqual(v.routine.done,['meal']);assert.equal(v.at,T0);
});

test('merging two tablets keeps the newest needs, the highest bond and every toy',()=>{
 const a=H.fresh(T0),b=H.fresh(T0+HOUR);a.bond=30;a.toys.push('tree');b.bond=12;b.toys.push('box');b.needs.fun=99;
 const m=H.merge(a,b,T0+2*HOUR);assert.equal(m.bond,30);assert.deepEqual(m.toys.sort(),['box','feather','tree','yarn']);assert.equal(m.needs.fun,99);
});
