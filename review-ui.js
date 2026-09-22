(function(){
'use strict';
const folder='https://drive.google.com/drive/folders/1A5A9LZ6vTP2UckVtl5DwdVkc8-ktnlX2';
function reviewBackup(){
 // Capture without submitting or completing an unanswered assessment.
 if(typeof studioCapture==='function')studioCapture();
 if(typeof studyCommit==='function')studyCommit(false);
 if(typeof scDraft==='function')scDraft();
 return window.MochiReview.build(S,APP_VERSION);
}
function download(){
 const data=reviewBackup(),url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));
 const a=document.createElement('a');a.href=url;a.download='euna-mochi-review-'+data.exported.slice(0,10)+'.json';a.click();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
 const m=data.review.maths,s=data.review.science;
 document.getElementById('learningReviewStatus').textContent=`Downloaded v${data.source.appVersion}: ${m.sampled} maths records and ${s.sampled} science studio records and ${data.course?.attempts?.length||0} classroom checks. Attach this JSON here in ChatGPT and ask for Euna’s learning review.`;
}
function init(){
 const anchor=document.getElementById('backupStatus');if(!anchor||document.getElementById('learningReview'))return;
 const d=document.createElement('details');d.id='learningReview';d.className='study-details';
 d.innerHTML='<summary>Review Euna’s progress with ChatGPT</summary><p class="study-note">Download her classroom lessons, notebooks and checks alongside Maths and Science studio history, including reasoning, hints and retries. The file includes the app version and export date. API keys and mirror secrets are excluded.</p><div class="review-actions"><button type="button" class="btn quiet" id="downloadLearningReview">Download for ChatGPT</button><a class="btn quiet" id="openLearningMirror" target="_blank" rel="noopener noreferrer">Open Drive folder</a></div><p class="study-note">In ChatGPT, attach the download or ask to read euna-mochi-latest.json from the connected Google Drive. Ask: “Review Euna’s latest classroom and question-studio records. Compare teaching explored, new independent answers, familiar retrieval and supported work. Read her explanations, identify patterns with examples, and propose three priorities for next week. Flag missing evidence.”</p><p class="study-note">The Drive mirror needs the one-time setup below. “Request sent” does not confirm delivery; check that the file date changes in Drive. Reviews happen when you ask here.</p><p class="review-status" id="learningReviewStatus" role="status"></p>';
 anchor.insertAdjacentElement('afterend',d);
 document.getElementById('downloadLearningReview').onclick=download;
 document.getElementById('openLearningMirror').href=folder;
}
window.MochiReviewDownload={make:reviewBackup};
if(window.MochiReady)init();else document.addEventListener('mochi:ready',init,{once:true});
})();
