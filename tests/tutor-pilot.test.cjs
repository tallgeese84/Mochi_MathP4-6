const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const P=require('../tutor-pilot-core.js'),M=require('../entrance-core.js'),S=require('../science-path-core.js'),C=require('../path-coach.js');
const now=Date.parse('2026-10-28T18:00:00Z'),copy=x=>JSON.parse(JSON.stringify(x));
function setup(subject='maths',form=2,seed=55){const E=subject==='maths'?M:S,d=E.fresh(),v=E.startPractice(d,subject==='maths'?'motion':'light',{phase:form===0?'guided':form===1?'apply':'transfer',seed,now}),q=E.question(v);return {subject,E,d,v,q};}
function check(t){return t.q.diagnostic||C.diagnostic(t.subject,t.v.unit,t.E,t.v.form);}
function answer(t,right,at=now+10){t.E.touchDraft(t.d,{answer:right?(t.subject==='maths'?t.q.answerLabel:t.q.answer):(t.subject==='maths'?'999999':'c0:r0'),working:'Synthetic working: compare the given quantities.'},at);return t.E.respond(t.d,at+1);}
function support(t){const c=check(t);P.diagnostic(t.d,t.subject,t.v,t.q,c,(c.correct+1)%c.choices.length,now+20);t.E.help(t.d,false,now+20);P.support(t.d,t.subject,t.v,t.q,'diagram',now+21);}
function later(t,at,{helped=false,repeated=false,wrongFirst=false}={}){
 t.E.finishPractice(t.d);let seed=1,v,q;
 while(seed<20000){const x=t.E.B.make(t.v.unit,t.v.form,seed);if(P.spec(t.subject,x)?.key===P.spec(t.subject,t.q)?.key&&x.fingerprint!==t.q.fingerprint&&!t.d.seen[x.fingerprint])break;seed++;}
 v=t.E.startPractice(t.d,t.v.unit,{phase:t.v.phase,seed,now:at});q=t.E.question(v);
 if(helped)t.E.help(t.d,false,at+1);if(repeated)v.seenBefore=true;
 if(wrongFirst){t.E.touchDraft(t.d,{answer:t.subject==='maths'?'999999':'c0:r0',working:'Synthetic first working.'},at+1);t.E.respond(t.d,at+2);}
 t.E.touchDraft(t.d,{answer:t.subject==='maths'?q.answerLabel:q.answer,working:'Synthetic independent working.'},at+3);return t.E.respond(t.d,at+4).attempt;
}
test('pilot distinguishes catch-up gaps, average speed and mirror normals',()=>{
 assert.equal(P.spec('maths',M.B.make('motion',2,55)).key,'catch-up-gaps');
 assert.equal(P.spec('maths',M.B.make('motion',1,55)).key,'average-speed');
 assert.equal(P.spec('science',S.B.make('light',2,55)).key,'mirror-normal');
 assert.equal(P.spec('science',S.B.make('light',1,55)).key,'shadow-size');
 assert.equal(P.spec('maths',M.B.make('percent',1,55)),null);
});
test('papers, mixed checks, redos and other topics do not acquire pilot help',()=>{
 const t=setup();for(const phase of ['mixed','redo','paper','baseline','mock'])assert.equal(P.eligible(t.subject,{...t.v,phase},t.q),false);
 assert.equal(P.eligible('maths',t.v,M.B.make('percent',2,1)),false);
});
test('diagnostic keeps the actual first selection and is idempotent',()=>{
 const t=setup(),c=check(t),e=P.diagnostic(t.d,t.subject,t.v,t.q,c,1,now+1);
 assert.equal(e.choice,1);assert.equal(e.prompt,c.prompt);assert.deepEqual(e.choices,c.choices);
 P.diagnostic(t.d,t.subject,t.v,t.q,c,0,now+2);
 assert.equal(P.events(t.d).length,1);assert.equal(P.events(t.d)[0].choice,1);
});
test('diagnostic rejects out-of-range choices',()=>{const t=setup();assert.equal(P.diagnostic(t.d,t.subject,t.v,t.q,check(t),99,now),null);assert.equal(P.events(t.d).length,0);});
test('a passing relationship diagnostic does not label an arithmetic misconception',()=>{
 const t=setup(),c=check(t);P.diagnostic(t.d,t.subject,t.v,t.q,c,c.correct,now);const x=P.decision(t.d,t.subject,t.v,t.q);
 assert.equal(x.kind,'check-step');assert.equal(x.strategy,'check-step');assert.equal(x.misconception,undefined);
});
test('a failed diagnostic branches to a representation, not another mark',()=>{
 const t=setup(),before=copy(t.d);support(t);assert.equal(P.decision(t.d,t.subject,t.v,t.q).kind,'representation');assert.deepEqual(t.d.attempts,before.attempts);assert.deepEqual(t.d.reviews,before.reviews);
});
test('two attempts plus an alternative representation stop the repeating-scaffold loop',()=>{
 const t=setup();answer(t,false);support(t);t.E.touchDraft(t.d,{answer:'888888',working:'Synthetic revised working.'},now+30);t.E.respond(t.d,now+31);P.support(t.d,t.subject,t.v,t.q,'table',now+32);t.E.touchDraft(t.d,{answer:'777777',working:'A further synthetic attempt.'},now+33);t.E.respond(t.d,now+34);assert.equal(P.decision(t.d,t.subject,t.v,t.q).kind,'pause');
});
test('event storage leaves lesson prerequisites, drafts, reviews and scores intact',()=>{
 const t=setup();t.d.reviews['synthetic-review']={verdict:'needs-discussion',at:now,note:'Preserve this.'};const before=copy(t.d);
 P.diagnostic(t.d,t.subject,t.v,t.q,check(t),0,now+1);P.support(t.d,t.subject,t.v,t.q,'table',now+2);
 const after=copy(t.d);delete after.tutorPilot;assert.deepEqual(after,before);
});
test('tutoring evidence survives subject validation and export',()=>{
 const t=setup();support(t);const v=t.E.validate(t.d);assert.deepEqual(v.tutorPilot,P.validate(t.d.tutorPilot));assert.deepEqual(t.E.exportData(v).tutorPilot,v.tutorPilot);
});
test('merge is commutative and unions notes without replacing adult reviews',()=>{
 const t=setup();answer(t,false);support(t);const a=copy(t.d),b=copy(t.d);P.support(b,t.subject,t.v,t.q,'table',now+30);a.reviews[t.v.id]={verdict:'needs-discussion',note:'Adult note.',at:now+40};
 const x=M.merge(a,b),y=M.merge(b,a);assert.deepEqual(x.tutorPilot,y.tutorPilot);assert.equal(x.reviews[t.v.id].note,'Adult note.');assert.equal(P.events(x).length,3);
});
test('a conflicting diagnostic is flagged and excluded from teaching decisions',()=>{
 const t=setup();const e=P.diagnostic(t.d,t.subject,t.v,t.q,check(t),0,now);const a={schema:1,events:[e]},b={schema:1,events:[{...e,choice:1}]};
 assert.deepEqual(P.merge(a,b),P.merge(b,a));t.d.tutorPilot=P.merge(a,b);assert.equal(P.events(t.d)[0].conflicted,true);assert.equal(P.current(t.d,t.v.id).length,0);
});
test('malformed and prototype-like payload fields cannot become app settings',()=>{
 const t=setup();support(t);const e=P.events(t.d)[0],raw={schema:1,events:[{...e,coins:99999,apiKey:'synthetic-not-a-key',review:{verdict:'valid'}},null,{kind:'diagnostic',at:now}]};const v=P.validate(raw);
 assert.equal(v.events.length,1);assert.equal(v.events[0].coins,undefined);assert.equal(JSON.stringify(v).includes('synthetic-not-a-key'),false);
});
for(const sub of ['maths','science']){
 test(sub+': completing a revised supported answer is not independent learning',()=>{
  const t=setup(sub);if(sub==='maths')answer(t,false);support(t);answer(t,true,now+30);const r=P.report(t.E,t.d,sub,now+40).items[0];assert.equal(r.supportedCompletion,true);assert.equal(r.changedIndependent,null);assert.equal(r.delayedIndependent,null);
 });
 test(sub+': a changed same-structure answer is application, not broad transfer',()=>{
  const t=setup(sub);support(t);answer(t,true,now+30);const a=later(t,now+1000);const r=P.report(t.E,t.d,sub,now+2000).items[0];assert.equal(r.changedIndependent.attemptId,a.id);assert.equal(r.changedIndependent.changedStructure,false);assert.equal(r.delayedIndependent,null);
 });
 test(sub+': later unaided success is distinct from immediate success',()=>{
  const t=setup(sub);support(t);answer(t,true,now+30);const a=later(t,now+2*P.DAY);const r=P.report(t.E,t.d,sub,now+2*P.DAY+100).items[0];assert.equal(r.delayedIndependent.attemptId,a.id);assert.equal(r.status,'DELAYED_INDEPENDENT_OBSERVED');
 });
 for(const opt of [{helped:true},{repeated:true}])test(sub+': helped/repeated later work is not independent evidence '+JSON.stringify(opt),()=>{
  const t=setup(sub);support(t);answer(t,true,now+30);later(t,now+2*P.DAY,opt);assert.equal(P.report(t.E,t.d,sub,now+3*P.DAY).items[0].changedIndependent,null);
 });
}
test('a retry after a wrong first answer does not establish independent change',()=>{
 const t=setup();support(t);answer(t,true,now+30);later(t,now+2*P.DAY,{wrongFirst:true});assert.equal(P.report(M,t.d,'maths',now+3*P.DAY).items[0].changedIndependent,null);
});
test('future-dated answers are not evidence at an earlier cutoff',()=>{
 const t=setup();support(t);answer(t,true,now+30);later(t,now+2*P.DAY);assert.equal(P.report(M,t.d,'maths',now+P.DAY).items[0].changedIndependent,null);
});
test('success in a different Motion subskill does not clear catch-up follow-up',()=>{
 const t=setup();support(t);answer(t,true,now+30);M.finishPractice(t.d);const v=M.startPractice(t.d,'motion',{phase:'apply',seed:21,now:now+100}),q=M.question(v);M.touchDraft(t.d,{answer:q.answerLabel,working:'Use total distance and total time.'},now+101);M.respond(t.d,now+102);assert.equal(P.report(M,t.d,'maths',now+200).items[0].changedIndependent,null);
});
test('Chicago day uses the specified timezone across midnight',()=>{assert.equal(P.day(Date.parse('2026-10-29T04:59:00Z')),'2026-10-28');assert.equal(P.day(Date.parse('2026-10-29T05:01:00Z')),'2026-10-29');});
test('AI context includes observed support, not invented learning labels',()=>{
 const t=setup();support(t);t.v.strokes=[[[.1,.2],[.3,.4]]];const c=P.context(M,t.d,'maths',t.v,t.q,now+30);assert.equal(c.subskill,'catch-up-gaps');assert.equal(c.handwriting.present,true);assert.equal(c.handwriting.interpreted,false);assert.equal(c.events.length,2);assert.equal(c.confidence,undefined);
});
const validNote={reply:'Keep the gap relationship. What does each time measure?',focus:'relationship',evidenceQuote:'add the times',evidenceSource:'working',nextAction:'representation'};
test('AI note requires a literal quote from the supplied learner evidence',()=>{
 assert.equal(P.parseAI(JSON.stringify(validNote),{working:'I add the times.'}).provisional,true);
 assert.throws(()=>P.parseAI(JSON.stringify(validNote),{working:'I divide each gap by its time.'}),/AI_EVIDENCE_NOT_FOUND/);
});
test('AI grade/reward overrides and extra fields are rejected',()=>{assert.throws(()=>P.parseAI(JSON.stringify({...validNote,score:100}),{working:'add the times'}),/AI_REPLY_SCHEMA/);});
test('unstructured AI output is not silently treated as a verified diagnosis',()=>{assert.throws(()=>P.parseAI('You have a unit misconception.'),/AI_REPLY_SCHEMA/);});
test('uncertain AI feedback may ask for evidence without inventing a quote',()=>{
 const n=P.parseAI(JSON.stringify({...validNote,focus:'uncertain',evidenceQuote:'',evidenceSource:'none',nextAction:'clarify'}));assert.equal(n.focus,'uncertain');
});
test('a definite AI focus without evidence is rejected',()=>{assert.throws(()=>P.parseAI(JSON.stringify({...validNote,evidenceQuote:'',evidenceSource:'none'})),/AI_EVIDENCE_REQUIRED/);});
test('provider provenance distinguishes offline, schema failure, and live replies',()=>{
 const t=setup();for(const [i,code] of ['BUILT_IN_NOT_CONNECTED','LIVE_AI_UNSTRUCTURED','LIVE_AI_SCHEMA_CHECKED'].entries())P.provider(t.d,t.subject,t.v,t.q,code,now+i);assert.equal(P.report(M,t.d,'maths',now+5).provider,'LIVE_AI_SCHEMA_CHECKED');assert.equal(P.events(t.d).length,3);
});
test('pending follow-up changes only the seed within an already scheduled form',()=>{
 const t=setup();support(t);answer(t,true,now+30);M.finishPractice(t.d);let chosen;
 for(let i=1;i<300;i++){const seed=(i*0x9e3779b9)>>>0;const c=M.practiceChoice(t.d,'motion',{phase:'transfer',seed,now:now+100});if(c&&P.spec('maths',c.q)?.key==='average-with-stop'){chosen=c;break;}}
 assert(chosen);const snapshot=JSON.stringify(t.d),x=P.choose('maths',M.B,t.d,chosen,now+100);
 assert.equal(x.q.unit,chosen.q.unit);assert.equal(x.phase,chosen.phase);assert.equal(x.form,chosen.form);assert.equal(P.spec('maths',x.q).key,'catch-up-gaps');assert.equal(JSON.stringify(t.d),snapshot);assert.equal(t.d.seen[x.q.fingerprint],undefined);
});
test('the pilot cannot change a recall or substitute a different scheduled topic',()=>{
 const t=setup();support(t);M.finishPractice(t.d);
 for(const [unit,phase] of [['motion','recall'],['percent','transfer'],['motion','guided']]){const c=M.practiceChoice(t.d,unit,{phase,now:now+100});assert.deepEqual(P.choose('maths',M.B,t.d,c,now+100),c);}
});
test('export and UI hooks exist without changing the nightly plan schema',()=>{
 for(const f of ['entrance-ui.js','science-path-ui.js']){const s=fs.readFileSync(require.resolve('../'+f),'utf8');assert.match(s,/MochiTutorPilotUI\?\.panel/);assert.match(s,/pilot\.parseAI/);assert.match(s,/stampProvider\('BUILT_IN_NOT_CONNECTED'\)/);}
 const t=setup();support(t);assert.equal(M.report(t.d,now+50).tutorPilot.subject,'maths');
 assert.match(fs.readFileSync(require.resolve('../learning-review.js'),'utf8'),/data.entranceReview=root.MochiEntrance.report/);
 const html=fs.readFileSync(require.resolve('../index.html'),'utf8');assert(html.indexOf('tutor-pilot-core.js')<html.indexOf('path-core.js'));assert(html.indexOf('tutor-pilot-ui.js')<html.indexOf('entrance-ui.js'));
});
