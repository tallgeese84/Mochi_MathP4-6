/* v7.11 Shared readability and safety layer for every child-facing AI reply.
   The engine owns the answers; a model only talks. This module makes what it says readable
   (no LaTeX or Markdown codes), keeps it from handing over the answer, and stops Mochi being
   used as a calculator. Everything here is deterministic and works offline. */
(function(root){
'use strict';
const SYMBOLS={times:'×',div:'÷',cdot:'×',pm:'±',le:'≤',leq:'≤',ge:'≥',geq:'≥',ne:'≠',neq:'≠',approx:'≈',pi:'π',to:'→',rightarrow:'→',Rightarrow:'⇒',implies:'⇒',therefore:'∴',because:'∵',angle:'∠',triangle:'△',degree:'°',dots:'…',ldots:'…',cdots:'…',quad:' ',qquad:' ',left:'',right:'',displaystyle:'',colon:':',lt:'<',gt:'>',parallel:'∥',perp:'⊥',infty:'∞'};
const SUPER={'0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹'};
const wrap=s=>/[\s+\-×÷\/]/.test(s.trim())?'('+s.trim()+')':s.trim();
// Rewrite \cmd{a}{b} forms from the inside out, so nested fractions and boxes resolve.
function braces(s){
 const unary={boxed:x=>x,text:x=>x,textbf:x=>x,textit:x=>x,mathrm:x=>x,mathbf:x=>x,mathit:x=>x,operatorname:x=>x,underline:x=>x,overline:x=>x,sqrt:x=>'√'+wrap(x)};
 for(let pass=0;pass<40;pass++){
  const before=s;
  s=s.replace(/\\[dt]?frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g,(_,a,b)=>wrap(a)+'/'+wrap(b));
  s=s.replace(/\\sqrt\s*\[3\]\s*\{([^{}]*)\}/g,(_,x)=>'∛'+wrap(x));
  s=s.replace(/\\([a-zA-Z]+)\s*\{([^{}]*)\}/g,(m,cmd,x)=>unary[cmd]?unary[cmd](x):m);
  s=s.replace(/\^\s*\{([^{}]*)\}/g,(_,x)=>'^'+x).replace(/_\s*\{([^{}]*)\}/g,(_,x)=>'_'+x);
  if(s===before)break;
 }
 return s;
}
/* Turn a model reply into plain text a primary pupil can read. Safe on ordinary prose. */
function clean(raw){
 let s=String(raw??'').replace(/\r\n?/g,'\n');if(!s.trim())return '';
 const latex=/\\[a-zA-Z()[\]]|\$\$/.test(s);
 s=s.replace(/```[a-zA-Z]*\n?/g,'').replace(/`([^`\n]*)`/g,'$1');
 s=s.replace(/\\begin\{[^}]*\}|\\end\{[^}]*\}/g,'').replace(/\\\[|\\\]|\\\(|\\\)|\$\$/g,'');
 // $…$ is maths only when it holds LaTeX; "$5 and $7" stays money.
 s=s.replace(/\$([^$\n]{1,160})\$/g,(m,x)=>/[\\^{}]/.test(x)?x:m).replace(/\\\$/g,'$').replace(/\\%/g,'%').replace(/\\&/g,'&').replace(/\\#/g,'#').replace(/\\_/g,'_');
 s=braces(s);
 s=s.replace(/\^\s*\\circ\b/g,'°').replace(/\\\\/g,'\n').replace(/\\[,;:! ]/g,' ');
 s=s.replace(/\\([a-zA-Z]+)(?![a-zA-Z]) ?/g,(m,cmd)=>Object.hasOwn(SYMBOLS,cmd)?SYMBOLS[cmd]:cmd+(m.endsWith(' ')?' ':''));
 s=s.replace(/\^(\d{1,2})(?!\d|\.\d)/g,(_,n)=>[...n].map(c=>SUPER[c]).join(''));
 if(latex)s=s.replace(/[{}]/g,'').replace(/^[ \t]*&[ \t]*/gm,'').replace(/[ \t]*&[ \t]*=/g,' =');
 // Markdown: emphasis, headings, quotes and bullets become plain text.
 s=s.replace(/\*\*([^*\n]+)\*\*/g,'$1').replace(/__([^_\n]+)__/g,'$1').replace(/(^|[\s(])\*([^*\s][^*\n]*?)\*(?=[\s).,!?:;]|$)/gm,'$1$2');
 s=s.replace(/^[ \t]{0,3}#{1,6}[ \t]+/gm,'').replace(/^[ \t]{0,3}>[ \t]?/gm,'').replace(/^[ \t]*[-*+][ \t]+/gm,'• ').replace(/^[ \t]*([-*_])\1{2,}[ \t]*$/gm,'');
 s=s.replace(/(\d)[ \t]*\*[ \t]*(?=\d)/g,'$1 × ');
 // Even spacing around operators, so "284937×273000=77,787,801,000" reads as a sum.
 s=s.replace(/[ \t]*([×÷])[ \t]*/g,' $1 ').replace(/(\d)\+(?=\d)/g,'$1 + ').replace(/([^\s=<>!+\-×÷])=(?=[^\s=])/g,'$1 =').replace(/(^|[^=<>!])=(?=[^\s=])/gm,'$1= ');
 s=s.replace(/[ \t]+$/gm,'').replace(/^[ \t]+/gm,'').replace(/[ \t]{2,}/g,' ').replace(/\n{3,}/g,'\n\n');
 return s.trim();
}

const norm=s=>String(s??'').toLowerCase().replace(/(\d),(?=\d{3}(?!\d))/g,'$1').replace(/\s+/g,' ').trim();
const numbers=s=>norm(s).match(/\d+(?:\.\d+)?(?:\/\d+)?/g)||[];
const escRe=s=>s.replace(/[.*+?^${}()|[\]\\\/]/g,'\\$&');
/* Does this reply hand over the checked answer of an unsolved question?
   A number the question itself states cannot be told apart from a quotation, so it never counts.
   Long numbers count wherever they stand; one- or two-digit answers only when presented as the result. */
function leaks(reply,q){
 if(!q||q.kind==='written')return false;
 const label=String(q.answerLabel??'').trim(),text=norm(clean(reply));if(!label||!text)return false;
 const nums=numbers(label);
 if(nums.length){
  const target=nums.slice().sort((a,b)=>b.length-a.length)[0];
  if(numbers(q.text).includes(target))return false;
  const bare=`(?<![\\d./])${escRe(target)}(?![\\d/]|\\.\\d)`;
  if(!new RegExp(bare).test(text))return false;
  if(target.replace(/\D/g,'').length>=3)return true;
  return new RegExp(`(?:answer|result|= ?|equals|altogether|in total)[^.\\n]{0,18}?${bare}[^\\d\\n]{0,14}(?:[.!\\n]|$)`).test(text);
 }
 // A choice question: naming the correct option alone, as the one to pick.
 const options=[...(q.choices||[]),...(q.options||[])].map(norm).filter(Boolean),correct=norm(label);
 if(options.length<2||correct.length<3||!options.includes(correct))return false;
 const word=o=>new RegExp(`(?<![a-z])${escRe(o)}(?![a-z])`).test(text);
 return word(correct)&&!options.some(o=>o!==correct&&word(o))&&/answer|correct|right|choose|pick|select|option|it is|it's|must be/.test(text);
}

/* A bare sum typed into the tutor box ("284937 × 273833", "what is 48 ÷ 6?") is answered here,
   without a model: Mochi coaches the method and leaves the working to her. */
function sumRequest(message){
 let s=norm(message).replace(/[?=!]+/g,' ').replace(/\b(?:what(?:'s| is)|whats|calculate|compute|work out|solve|find|evaluate|simplify|please|pls|mochi|can you|could you|tell me|help me|do|the answer (?:to|of|for)|answer|equals?|how much is)\b/g,' ').replace(/\s+/g,' ').trim();
 if(!s||s.length>80||!/^[\d\s.,()+\-*x×÷\/^%]+$/.test(s))return null;
 const parts=s.replace(/(\d),(?=\d{3})/g,'$1').match(/\d+(?:\.\d+)?|[+\-*x×÷\/^]/g)||[],op=parts.find(p=>/^[+\-*x×÷\/^]$/.test(p)),nums=parts.filter(p=>/^\d/.test(p));
 if(!op||nums.length<2)return null;
 // A lone fraction such as 3/4 is a number, not a request.
 if(op==='/'&&nums.length===2&&parts.length===3&&nums.every(n=>n.length<=2))return null;
 const big=nums.slice().sort((a,b)=>b.length-a.length)[0],head=big.length>3?big.slice(0,-3)+'000':big.length>1?big[0]+'0'.repeat(big.length-1):big,rest=String(Number(big)-Number(head));
 const split=Number(rest)>0&&Number.isSafeInteger(Number(big))?` For example, ${big} = ${head} + ${rest}.`:'';
 const tip=/[*x×]/.test(op)?`Split one number into easier parts, multiply each part, then add the results.${split}`:/[÷\/]/.test(op)?'Ask how many times the divisor fits. Take away easy chunks (10 times, 100 times), then count the chunks.':op==='^'?'Write the multiplication out in full, then work it out one step at a time.':'Line up the place values, then work from the ones column.';
 return `That one is yours to work out, and you can do it! Estimate first, so you can check your answer. ${tip} Write each step in your working, and ask me if a step goes wrong.`;
}

/* Rules added to every child-facing tutor prompt. */
const PARTS=[
 'FORMAT: Reply in plain text only. Never use LaTeX, Markdown, code blocks, backslash commands, \\boxed, dollar-sign delimiters, asterisks, headings or tables: the screen shows your characters exactly as typed. Write maths the way a primary textbook prints it: 3 × 4, 12 ÷ 3, 3/4, 5², 25%, with one short step per line.',
 'CALCULATIONS: You are not a calculator, and your arithmetic is not checked. Never work out a calculation for her and never state the final answer of the question on her screen before it is solved or its solution is open. If she asks you to compute something, show how to split it into easier parts, leave the numbers for her to work out, and ask her to estimate first.',
 'FOCUS: Stay with the question on her screen. If she asks about something unrelated, answer in one friendly sentence and bring her back to it. Teach one step, then stop and let her try.'
],FORMAT=PARTS[0],RULES=PARTS.join('\n');

const api={clean,leaks,sumRequest,RULES,FORMAT};
root.MochiTutorGuard=api;
if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
