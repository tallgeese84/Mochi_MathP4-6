/* Additive cat collection rewards.
   Mochi is always present. Up to three friends may visit the room at once.
   Cat Points come from validated learning milestones plus a bounded 2× study-time bonus. */
(function(root){
'use strict';
const MAX=3,TOTAL=100,DOUBLE_POINTS=2;
const legacy=[
 {id:'miso',name:'Miso',breed:'British Shorthair',points:2,coat:'#9caac3',point:'#79869e',eyes:'#d6a14b',shape:'round',description:'Round cheeks, small upright ears and a plush blue-grey coat.'},
 {id:'suki',name:'Suki',breed:'Siamese',points:8,coat:'#eee0c9',point:'#685345',eyes:'#6eb6dc',shape:'slender',description:'A slender silhouette, blue eyes and dark face, ears, paws and tail.'},
 {id:'kumo',name:'Kumo',breed:'Maine Coon',points:18,coat:'#a07c63',point:'#644b3f',eyes:'#adc575',shape:'tufted',description:'A broad muzzle, tufted ears, a shaggy ruff and a long bushy tail.'},
 {id:'yuki',name:'Yuki',breed:'Ragdoll',points:32,coat:'#faf3e9',point:'#ac978a',eyes:'#7eafe0',shape:'fluffy',description:'A soft long coat, blue eyes, a pale face blaze and a fluffy tail.'}
];
const stems=['Maple','Bean','Pepper','Olive','Clover','Biscuit','Waffle','Pudding','Toffee','Nori','Chai','Cocoa','Pumpkin','Berry','Pebble','Sunny','Comet','Cloud','Rain','Misty','Sprout','Taro','Sesame','Juniper'];
const suffixes=['',' Moon',' Star',' Bloom'];
const looks=[
 ['Domestic Shorthair','round'],['Domestic Longhair','fluffy'],['Tabby shorthair','round'],['Colourpoint','slender'],
 ['Tuxedo shorthair','round'],['Silver tabby','tufted'],['Ginger tabby','round'],['Brown tabby','tufted'],
 ['Tortoiseshell shorthair','round'],['Cream longhair','fluffy'],['Black shorthair','slender'],['White longhair','fluffy']
];
const palettes=[
 ['#c8b59e','#8e7560','#87b36b'],['#d8d7d3','#7f858d','#d2a246'],['#c8895a','#8c5b3f','#78a86a'],['#eee1ce','#6b5547','#72aeda'],
 ['#4f4b52','#2e2a31','#d8b24d'],['#bbb9c3','#77737f','#8db36c'],['#d9a06b','#9d6848','#78aa70'],['#aa856a','#735747','#d2ad54'],
 ['#9c6d5a','#4e3c35','#82ad73'],['#ead8bd','#b69a78','#75a7cf'],['#4e5159','#2e3036','#d0ad4f'],['#f4eee5','#c4b7a8','#78a7d2']
];
function threshold(index){
 if(index<=legacy.length)return legacy[index-1].points;
 return 32+Math.round(Math.pow(index-4,1.2)*4);
}
const generated=[];
for(let i=0;i<95;i++){
 const name=stems[Math.floor(i/suffixes.length)%stems.length]+suffixes[i%suffixes.length],look=looks[i%looks.length],p=palettes[i%palettes.length],n=i+5;
 generated.push(Object.freeze({id:'friend-'+String(n).padStart(3,'0'),name,breed:look[0],points:threshold(n),coat:p[0],point:p[1],eyes:p[2],shape:look[1],description:'A collectible '+look[0].toLowerCase()+' friend with a distinct coat and bright eyes.'}));
}
const catalog=Object.freeze([...legacy.map(Object.freeze),...generated]);
if(catalog.length!==99)throw Error('Cat collection must contain 99 friends plus Mochi.');
const ids=new Set(catalog.map(c=>c.id));
const list=x=>Array.isArray(x)?[...new Set(x.filter(id=>ids.has(id)))]:[];
const timestamp=x=>Number.isSafeInteger(x)&&x>=0&&x<=8640000000000000?x:0;
const bonusKey=x=>typeof x==='string'&&/^\d{4}-\d{2}-\d{2}:(maths|science)$/.test(x)?x:'';
function fresh(){return {version:2,unlocked:[],selected:[],selectionEdited:false,selectionUpdatedAt:0,doubleBonuses:[]};}
function validate(raw){
 const c=fresh();if(!raw||![1,2].includes(raw.version))return c;
 c.unlocked=catalog.map(c=>c.id).filter(id=>list(raw.unlocked).includes(id));
 c.selected=list(raw.selected).filter(id=>c.unlocked.includes(id)).slice(0,MAX);
 c.selectionEdited=raw.selectionEdited===true;c.selectionUpdatedAt=timestamp(raw.selectionUpdatedAt);
 const seen=new Set();for(const x of Array.isArray(raw.doubleBonuses)?raw.doubleBonuses:[]){
  const key=bonusKey(x?.key||x),earnedAt=timestamp(x?.earnedAt);if(!key||seen.has(key))continue;seen.add(key);c.doubleBonuses.push({key,earnedAt});
  if(c.doubleBonuses.length>=1200)break;
 }
 return c;
}
function milestoneCount(state){
 const planner=root.MochiPlanner,p=planner?planner.validate(state?.planner):null;
 return p?Object.keys(p.milestones).length:0;
}
function awardDoubleTime(state,c,now=Date.now()){
 const planner=root.MochiPlanner;if(!planner||!state?.planner)return c;
 const p=planner.validate(state.planner),day=planner.localDay(now),elapsed=planner.elapsed(p,day),known=new Set(c.doubleBonuses.map(x=>x.key));
 for(const subject of planner.subjects){
  const target=planner.minutes(p,subject,now),key=day+':'+subject;
  if(target>0&&elapsed[subject]>=target*2*60000&&!known.has(key)){c.doubleBonuses.push({key,earnedAt:timestamp(now)});known.add(key);}
 }
 c.doubleBonuses=c.doubleBonuses.sort((a,b)=>a.earnedAt-b.earnedAt||a.key.localeCompare(b.key)).slice(-1200);return c;
}
function bonusPoints(c){return c.doubleBonuses.length*DOUBLE_POINTS;}
function pointCount(state,c=validate(state?.catFriends)){return milestoneCount(state)+bonusPoints(c);}
function sync(state,now=Date.now()){
 const c=awardDoubleTime(state,validate(state.catFriends),now),points=pointCount(state,c);
 c.unlocked=catalog.filter(cat=>c.unlocked.includes(cat.id)||points>=cat.points).map(cat=>cat.id);
 if(!c.selectionEdited)c.selected=c.unlocked.slice(0,MAX);
 state.catFriends=c;return c;
}
function select(state,id,show,now=Date.now()){
 const c=sync(state,now);
 if(!ids.has(id)||!c.unlocked.includes(id))return {ok:false,reason:'This friend is not unlocked yet.'};
 const present=c.selected.includes(id);
 if(show&&!present&&c.selected.length>=MAX)return {ok:false,reason:'Three friends are already in the room. Let one rest before inviting another.'};
 c.selected=show?list([...c.selected,id]):c.selected.filter(x=>x!==id);
 c.selectionEdited=true;c.selectionUpdatedAt=Math.max(timestamp(now),c.selectionUpdatedAt+1);
 return {ok:true,selected:c.selected.slice()};
}
function merge(a,b){
 a=validate(a);b=validate(b);
 const rank=x=>[x.selectionEdited?1:0,x.selectionUpdatedAt,JSON.stringify(x.selected)];
 const ra=rank(a),rb=rank(b);let winner=a;
 for(let i=0;i<ra.length;i++){if(ra[i]!==rb[i]){winner=rb[i]>ra[i]?b:a;break;}}
 const bonuses=new Map();for(const x of [...a.doubleBonuses,...b.doubleBonuses]){const old=bonuses.get(x.key);if(!old||x.earnedAt<old.earnedAt)bonuses.set(x.key,x);}
 return validate({...winner,unlocked:catalog.filter(c=>a.unlocked.includes(c.id)||b.unlocked.includes(c.id)).map(c=>c.id),doubleBonuses:[...bonuses.values()]});
}
function report(state,now=Date.now()){
 const c=sync(state,now),milestones=milestoneCount(state),timePoints=bonusPoints(c),points=milestones+timePoints,next=catalog.find(cat=>!c.unlocked.includes(cat.id))||null;
 return {milestones,timeBonusAwards:c.doubleBonuses.length,timeBonusPoints:timePoints,points,maxFriends:MAX,totalCats:TOTAL,main:'mochi',unlockedTotal:1+c.unlocked.length,nextCat:next?{...next,remaining:Math.max(0,next.points-points)}:null,...c,
  cats:catalog.map(cat=>({...cat,unlocked:c.unlocked.includes(cat.id),selected:c.selected.includes(cat.id),remaining:Math.max(0,cat.points-points)}))};
}
root.MochiCatFriends={catalog,MAX,TOTAL,DOUBLE_POINTS,fresh,validate,merge,sync,select,report,milestoneCount,pointCount,bonusPoints,threshold};
if(typeof module!=='undefined')module.exports=root.MochiCatFriends;
})(typeof window!=='undefined'?window:globalThis);
