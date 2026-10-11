'use strict';
// v2.9 – consistent learning sequence; old completed lessons stay completed.
// AI guidance is not authority to write a passing grade; official quiz and
// topic-relevant, correct turns are required. Author: Ali Erkonak.
const FLOW_TALK_TARGET=2;
function flowStore(){if(!state.lessonFlow||typeof state.lessonFlow!=='object'||Array.isArray(state.lessonFlow))state.lessonFlow={};return state.lessonFlow;}
function flowFor(l){const store=flowStore();if(!store[l.id])store[l.id]={quizScore:null,talkCorrect:0,talkHistory:[],started:Date.now(),finished:null};return store[l.id];}
function flowLegacyPassed(l){return Number(state.completed[l.id]?.score)>=75;}
function flowHomeDone(l){const h=state.homework?.[l.id];return h?.status==='completed'&&Number(h.score)>=75;}
function flowCoachDone(l){return !!state.coachSessions?.[l.id]?.readyForQuiz||!!state.coachSessions?.[l.id]?.examPassed;}
function flowQuizDone(l){return Number(flowFor(l).quizScore)>=75;}
function flowCanTest(l){return flowLegacyPassed(l)||(flowCoachDone(l)&&flowHomeDone(l));}
function flowCanTalk(l){return flowLegacyPassed(l)||flowQuizDone(l);}
function flowCurrentStage(l){if(flowLegacyPassed(l))return 'completed';if(!flowCoachDone(l))return 'teach';if(!flowHomeDone(l))return 'homework';if(!flowQuizDone(l))return 'quiz';return 'conversation';}
function flowStatus(l){const s=flowFor(l),old=flowLegacyPassed(l);const stage=flowCurrentStage(l);const steps=[['Öğretmen anlatımı ve AI alıştırması',old||flowCoachDone(l)],['Ödev kontrolü',old||flowHomeDone(l)],['Mini sınav (%75)',old||flowQuizDone(l)],['Konuyla canlı konuşma (2 doğru)',old||!!s.finished]];
 return `<section class="premium-panel flow-panel"><div class="premium-row"><h2>Öğrenme yolun</h2><span class="badge">${old?'Tamamlandı':l.level}</span></div><p class="muted">Sırayla öğren, ödev yap, sınavı geç ve öğrendiğin konuyla konuş.</p>${steps.map(([name,ok],i)=>`<div class="flow-line ${ok?'done':''}"><span>${ok?'✓':i+1}</span><strong>${h(name)}</strong></div>`).join('')}${old?'<p class="tiny">Bu dersin önceki sürümdeki başarılı kaydı aynen korundu.</p>':stage==='teach'?'<p class="muted">Önce aşağıdaki anlatımı oku ve AI öğretmenle üç doğru alıştırma yap.</p>':stage==='homework'?'<button class="btn full" data-action="teacher-open-homework">📝 Şimdi ödevimi yap →</button>':stage==='quiz'?'<button class="btn full" data-action="start-lesson-quiz">✓ Mini sınava geç →</button>':`<p class="muted">Sınav başarılı. Şimdi aynı konuda ${s.talkCorrect}/${FLOW_TALK_TARGET} uygun İngilizce cevap kaydedildi.</p><button class="btn full" data-action="flow-talk" >🎙 Konulu canlı sohbete geç →</button>`}</section>`;
}
function flowApplyQuiz(l,score){if(flowLegacyPassed(l))return;if(!flowCanTest(l))return;const f=flowFor(l);f.quizScore=Math.max(Number(f.quizScore)||0,score);f.quizAt=Date.now();if(score<75&&Number(f.quizScore)<75){f.talkCorrect=0;f.talkHistory=[];}save();}
function flowOpenTalk(l){if(!l||!flowCanTalk(l)){toast('Önce ödevini ve mini sınavını başarıyla tamamla.');return;}
 state.activeLesson=l.id;state.lastCompletedLessonId=null;if(typeof live!=='undefined'){live.lastAnswer=flowPrompt(l);live.lastAssessment=null;live.error='';}state.lessonConversation={lessonId:l.id,started:Date.now()};save();speakMode='live';go('speaking');
}
function flowOnSpeech(lessonId,utterance,assessment,source){const session=state.lessonConversation;if(!session||session.lessonId!==lessonId)return;
 const l=LESSONS.find(x=>x.id===lessonId);if(!l||flowLegacyPassed(l)||!flowQuizDone(l)||assessment.status==='help')return;
 const f=flowFor(l);const normalized=answerKey(utterance);const fresh=!f.talkHistory.some(x=>x.status==='correct'&&x.onTopic&&answerKey(x.utterance)===normalized);
 const valid=assessment.status==='correct'&&assessment.onTopic===true&&normalized.split(/\s+/).filter(Boolean).length>=3&&fresh;
 f.talkHistory=[...(f.talkHistory||[]),{at:Date.now(),utterance:String(utterance).slice(0,150),status:assessment.status,onTopic:assessment.onTopic===true,source}].slice(-12);
 if(valid)f.talkCorrect=Math.min(FLOW_TALK_TARGET,(Number(f.talkCorrect)||0)+1);
 else if(assessment.status==='needs_practice'||(assessment.status==='correct'&&assessment.onTopic===false))f.talkCorrect=0;
 if(f.talkCorrect>=FLOW_TALK_TARGET&&!f.finished){f.finished=Date.now();state.completed[l.id]={score:f.quizScore,ts:Date.now(),pathVersion:29};state.lessonConversation=null;state.lastCompletedLessonId=l.id;toast('Harika! '+l.title+' dersini tamamladın.');if(typeof directorInvalidate==='function')directorInvalidate();}
 save();
}
function flowActiveLesson(){const s=state.lessonConversation;return s?LESSONS.find(x=>x.id===s.lessonId)||null:null;}
function flowPrompt(l){return `Let's practise ${l.title}. Example: ${l.examples[0]} Can you make a different English sentence about yourself using this lesson?`;}
