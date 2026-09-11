const vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
// Minimal event/storage adapters let us test application logic without a browser.
function harness(studio=false){
 const nodes=new Map(),stored=new Map();
 const make=()=>({style:{},classList:{add(){},remove(){},contains(){return false},toggle(){}},children:[],value:'',textContent:'',innerHTML:'',dataset:{},hidden:false,parentNode:null,getAttribute(){return ''},setAttribute(){},addEventListener(){},appendChild(n){this.children.push(n);n.parentNode=this;return n;},append(...ns){ns.forEach(n=>this.appendChild(n))},removeChild(n){this.children=this.children.filter(x=>x!==n)},getContext(){return null},querySelector(){return make()},focus(){},click(){this.onclick?.()},scrollIntoView(){}});
 const ctx=vm.createContext({console,Date,Math,JSON,Map,Set,Number,String,Object,Array,RegExp,Promise,AbortController,Blob,URL,confirm:()=>true,setTimeout:()=>0,clearTimeout(){},setInterval:()=>0,clearInterval(){},requestAnimationFrame:()=>0,document:{body:make(),addEventListener(){},getElementById(id){if(!nodes.has(id))nodes.set(id,make());return nodes.get(id)},createElement:make,querySelectorAll:()=>[]},navigator:{onLine:false},localStorage:{getItem:k=>stored.get(k)||null,setItem:(k,v)=>stored.set(k,v)},window:{addEventListener(){},devicePixelRatio:1},fetch:async()=>{throw Error('No provider calls in tests');}});
 const run=code=>vm.runInContext(code,ctx);
 for(const f of ['reasoning.js','learning.js','question-bank.js','challenge-bank.js','app.js','input-mode.js','study-ui.js',...(studio?['studio.js']:[])]){
   let source=fs.readFileSync(path.join(__dirname,'..',f),'utf8');
   if(f==='study-ui.js'||f==='studio.js')source=source.replace(/\nboot\(\);\s*$/,'');
   run(source);
 }
 return {ctx,run,nodes,stored};
}
module.exports=harness;
