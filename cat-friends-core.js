/* Additive room rewards. No question scoring, streaks, purchases or learner data here. */
(function(root){
'use strict';
const MAX=3;
const catalog=Object.freeze([
 Object.freeze({id:'miso',name:'Miso',breed:'British Shorthair',milestones:2,coat:'#9caac3',point:'#79869e',eyes:'#d6a14b',shape:'round',description:'Round cheeks, small upright ears and a plush blue-grey coat.'}),
 Object.freeze({id:'suki',name:'Suki',breed:'Siamese',milestones:8,coat:'#eee0c9',point:'#685345',eyes:'#6eb6dc',shape:'slender',description:'A slender silhouette, blue eyes and dark face, ears, paws and tail.'}),
 Object.freeze({id:'kumo',name:'Kumo',breed:'Maine Coon',milestones:18,coat:'#a07c63',point:'#644b3f',eyes:'#adc575',shape:'tufted',description:'A broad muzzle, tufted ears, a shaggy ruff and a long bushy tail.'}),
 Object.freeze({id:'yuki',name:'Yuki',breed:'Ragdoll',milestones:32,coat:'#faf3e9',point:'#ac978a',eyes:'#7eafe0',shape:'fluffy',description:'A soft long coat, blue eyes, a pale face blaze and a fluffy tail.'})
]);
const ids=new Set(catalog.map(c=>c.id));
const list=x=>Array.isArray(x)?[...new Set(x.filter(id=>ids.has(id)))]:[];
const timestamp=x=>Number.isSafeInteger(x)&&x>=0&&x<=8640000000000000?x:0;
function fresh(){return {version:1,unlocked:[],selected:[],selectionEdited:false,selectionUpdatedAt:0};}
function validate(raw){
 const c=fresh();if(!raw||raw.version!==1)return c;
 c.unlocked=catalog.map(c=>c.id).filter(id=>list(raw.unlocked).includes(id));
 c.selected=list(raw.selected).filter(id=>c.unlocked.includes(id)).slice(0,MAX);
 c.selectionEdited=raw.selectionEdited===true;c.selectionUpdatedAt=timestamp(raw.selectionUpdatedAt);return c;
}
function milestoneCount(state){
 // Use the existing planner's validated, earned records, not attempts or time-on-task.
 const planner=root.MochiPlanner;
 const p=planner?planner.validate(state?.planner):null;
 return p?Object.keys(p.milestones).length:0;
}
function sync(state){
 const c=validate(state.catFriends),count=milestoneCount(state);
 c.unlocked=catalog.filter(cat=>c.unlocked.includes(cat.id)||count>=cat.milestones).map(cat=>cat.id);
 if(!c.selectionEdited)c.selected=c.unlocked.slice(0,MAX);
 state.catFriends=c;return c;
}
function select(state,id,show,now=Date.now()){
 const c=sync(state);
 if(!ids.has(id)||!c.unlocked.includes(id))return {ok:false,reason:'This friend is not unlocked yet.'};
 const present=c.selected.includes(id);
 if(show&&!present&&c.selected.length>=MAX)return {ok:false,reason:'Three friends are already in the room. Let one rest before inviting another.'};
 c.selected=show?list([...c.selected,id]):c.selected.filter(x=>x!==id);
 c.selectionEdited=true;c.selectionUpdatedAt=Math.max(timestamp(now),c.selectionUpdatedAt+1);
 return {ok:true,selected:c.selected.slice()};
}
function merge(a,b){
 a=validate(a);b=validate(b);
 // A deliberate roster choice wins over auto-fill; timestamps choose between edits.
 const rank=x=>[x.selectionEdited?1:0,x.selectionUpdatedAt,JSON.stringify(x.selected)];
 const ra=rank(a),rb=rank(b);let winner=a;
 for(let i=0;i<ra.length;i++){if(ra[i]!==rb[i]){winner=rb[i]>ra[i]?b:a;break;}}
 return validate({...winner,unlocked:catalog.filter(c=>a.unlocked.includes(c.id)||b.unlocked.includes(c.id)).map(c=>c.id)});
}
function report(state){const c=sync(state),count=milestoneCount(state);return {milestones:count,maxFriends:MAX,main:'mochi',...c,cats:catalog.map(cat=>({...cat,unlocked:c.unlocked.includes(cat.id),selected:c.selected.includes(cat.id),remaining:Math.max(0,cat.milestones-count)}))};}
root.MochiCatFriends={catalog,MAX,fresh,validate,merge,sync,select,report,milestoneCount};
if(typeof module!=='undefined')module.exports=root.MochiCatFriends;
})(typeof window!=='undefined'?window:globalThis);
