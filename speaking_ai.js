'use strict';
// v2.8 - Transcript-based speaking feedback and bounded local learning memory.
// Author: Ali Erkonak. These are text/grammar insights, NOT pronunciation scores.
const SPEAKING_STATUSES=['correct','needs_practice','uncertain','help'];
function speakingStore(){
 if(!state.speakingInsights||typeof state.speakingInsights!=='object'||Array.isArray(state.speakingInsights))
  state.speakingInsights={total:0,correct:0,needsPractice:0,uncertain:0,patterns:{},recent:[]};
 let s=state.speakingInsights;
 if(!s.patterns||typeof s.patterns!=='object'||Array.isArray(s.patterns))s.patterns={};
 if(!Array.isArray(s.recent))s.recent=[];
 return s;
}
function speakingValidate(response){
 const r=response?.analysis;
 if(!r||typeof r!=='object'||Array.isArray(r)||!SPEAKING_STATUSES.includes(r.status))throw Error('AI konuşma değerlendirmesi geçersiz.');
 const take=(v,max)=>typeof v==='string'?v.trim().slice(0,max):'';
 const reply=take(r.reply,500),feedbackTr=take(r.feedbackTr,450),corrected=take(r.corrected,240),focus=take(r.focus,90),nextQuestion=take(r.nextQuestion,210);
 if(!reply||!feedbackTr||!nextQuestion||!focus||(r.status==='needs_practice'&&!corrected)||(r.status==='help'&&r.onTopic!==false))throw Error('AI konuşma geri bildirimi eksik veya geçersiz.');
 return {status:r.status,reply,feedbackTr,corrected,focus,nextQuestion,onTopic:r.onTopic===true};
}
function speakingCommit(message,assessment,source='typed'){
 if(assessment.status==='help'){activity();save();return;} // Turkish tutoring is never an English exam attempt.
 const s=speakingStore(),at=Date.now(),focus=String(assessment.focus||'Genel konuşma').slice(0,90);
 s.total=Math.min(1000000,(Number(s.total)||0)+1);
 if(assessment.status==='correct')s.correct=Math.min(1000000,(Number(s.correct)||0)+1);
 else if(assessment.status==='needs_practice')s.needsPractice=Math.min(1000000,(Number(s.needsPractice)||0)+1);
 else s.uncertain=Math.min(1000000,(Number(s.uncertain)||0)+1);
 if(assessment.status==='needs_practice'){
  const key='f:'+focus.toLocaleLowerCase('tr-TR').trim().slice(0,90),old=s.patterns[key]||{};
  s.patterns[key]={focus,errors:Math.min(999,(Number(old.errors)||0)+1),last:at,example:assessment.corrected.slice(0,180)};
  const sorted=Object.entries(s.patterns).sort((a,b)=>b[1].last-a[1].last).slice(0,30);s.patterns=Object.fromEntries(sorted);
 }
 s.recent.push({at,lessonId:currentLesson().id,status:assessment.status,source:source==='mic'?'mic':'typed',focus,original:String(message).slice(0,180),corrected:assessment.corrected.slice(0,180)});
 s.recent=s.recent.slice(-40);
 if(typeof flowOnSpeech==='function'){const lessonId=state.lessonConversation?.lessonId; if(lessonId)flowOnSpeech(lessonId,message,assessment,source);}
 if(assessment.status!=='uncertain')dailyPlan().steps.speaking=true;
 if(assessment.status==='needs_practice'&&typeof directorInvalidate==='function')directorInvalidate();
 else save();
}
function speakingSummary(){
 const s=speakingStore();return {total:Number(s.total)||0,correct:Number(s.correct)||0,needsPractice:Number(s.needsPractice)||0,uncertain:Number(s.uncertain)||0,
 patterns:Object.values(s.patterns).filter(p=>p?.errors>0).sort((a,b)=>(b.errors||0)-(a.errors||0)).slice(0,5).map(p=>({focus:String(p.focus||'').slice(0,90),errors:Math.min(999,Number(p.errors)||0),example:String(p.example||'').slice(0,150)}))};
}
function speakingLessonNote(l){
 const s=speakingStore(),related=s.recent.filter(e=>e.status==='needs_practice'&&e.lessonId===l.id).slice(-3);
 if(!related.length)return '';
 return `<section class="speaking-lesson-hint"><strong>♩ Konuşma pratiğinden gelen eksikler</strong><p>AI öğretmenin bu derste aşağıdaki yazılı konuşma hatalarını tekrar çalıştırabilir:</p><ul>${related.map(e=>`<li>${h(e.focus)}: ${h(e.corrected)}</li>`).join('')}</ul><button class="btn secondary full" data-page="speaking">Konuşma pratiğine git →</button></section>`;
}
function speakingFeedbackHtml(a){
 if(!a)return '<p class="muted">İlk cümleni söyledikten sonra AI yazıya çevrilen cümleyi inceleyecek.</p>';
 const status=a.status==='help'?'🇹🇷 Türkçe öğretmen açıklaması':a.status==='correct'?'✓ Cümle uygun':a.status==='needs_practice'?'↻ Birlikte düzeltelim':'? Metin belirsiz';
 return `<div class="speaking-feedback ${h(a.status)}"><span class="speaking-review-badge">${status}</span><p>${h(a.feedbackTr)}</p>${a.corrected?`<div class="speaking-corrected"><strong>Örnek cümle</strong><span>${h(a.corrected)}</span></div>`:''}<div class="speaking-next"><strong>Sonraki konuşma sorusu</strong><span>${h(a.nextQuestion)}</span></div></div>`;
}
