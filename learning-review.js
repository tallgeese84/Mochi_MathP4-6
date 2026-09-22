/* The downloadable file, Firebase backup and Drive mirror share this builder.
   Only learning records are copied; never copy the app settings object. */
(function(root){
'use strict';
function counts(attempts,science=false){
 const sampled=attempts.filter(a=>!a.skipped && a.kind!=='custom');
 const independent=a=>!!(a.correct&&a.firstCorrect&&(science?!a.helped&&!a.guess&&!a.repeated:!a.hints&&!a.model&&!a.revealed&&a.confidence!=='guess'));
 const latest=Math.max(0,...sampled.map(a=>Number(a.at)||0));
 return {recorded:attempts.length,sampled:sampled.length,correct:sampled.filter(a=>a.correct).length,
  independentCorrect:sampled.filter(independent).length,
  ...(science?{reasoningChecksCorrect:sampled.filter(a=>a.concept?.correct).length,newUnassistedReasoningChecks:sampled.filter(a=>a.conceptIndependent).length,repeatedQuestions:sampled.filter(a=>a.repeated).length,explanationsAutomaticallyGraded:false}:{}),
  assessmentRecords:sampled.filter(a=>science?a.assessment:a.kind==='diagnostic').length,
  latestAttempt:latest?new Date(latest).toISOString():null};
}
function build(state,version){
 const data=root.MochiLearning.backup(root.MochiLearning.init(state));
 if(root.MochiScience&&state.science)data.science=root.MochiScience.validate(state.science);
 // Supply question text for recorded Science items so a review need not guess from an ID.
 const used=new Set((data.science?.attempts||[]).map(a=>a.item));
 data.scienceQuestions=(root.MochiScience?.items||[]).filter(q=>used.has(q.id)).map(q=>({id:q.id,prompt:q.prompt,choices:[...q.choices]}));
 if(root.MochiCourse&&state.course){data.course=root.MochiCourse.validate(state.course);data.courseReview=root.MochiCourse.report(data.course);const ids=new Set(data.course.attempts.map(a=>a.question));data.courseQuestions=root.MochiCourse.data.questions.filter(q=>ids.has(q.id));}
 data.source={appVersion:version||'unknown',student:'Euna',timeZone:Intl.DateTimeFormat().resolvedOptions().timeZone||'unknown'};
 data.review={schema:1,maths:{...counts(data.learning.attempts),followUps:root.MochiRepair?.pending(data.learning).map(p=>({key:p.key,label:p.label,stage:p.stage,due:p.due,ready:p.ready}))||[]},science:counts(data.science?.attempts||[],true),
  limits:['Practice and diagnostic samples are not calibrated exam scores or percentiles.',
   'Separate independent answers from retries, hints, revealed solutions and guesses.',
   'Read the recorded plan, reasoning revisions, working and science explanation before inferring a misconception.',
   'Recorded seconds may include idle or minimised time; they are not a reliable speed benchmark.',
   'Use the export timestamp and latest attempt dates to check freshness. Empty records do not establish a weakness.',
   'Science choices and structured reasoning checks are separate; free-text and ink explanations are not automatically graded. Repeated items are familiar practice.',
   'Current unsent drafts are not completed assessments. Older backups may lack some reasoning fields.']};
 return data;
}
root.MochiReview={build,counts};
if(typeof module!=='undefined'&&module.exports)module.exports=root.MochiReview;
})(typeof window!=='undefined'?window:globalThis);
