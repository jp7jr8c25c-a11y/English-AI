'use strict';
// v2.7 - AI lesson coach: explain -> ask -> assess -> remediate -> official exam.
// Developer: Ali Erkonak. Only the existing fixed exam can unlock a lesson.
let coachBusy=false,coachError='',coachPending=null;
const COACH_TARGET=3;
function coachStore(){
 if(!state.coachSessions||typeof state.coachSessions!=='object'||Array.isArray(state.coachSessions))state.coachSessions={};
 return state.coachSessions;
}
function coachSession(l){return coachStore()[l.id]||null;}
function coachCanUse(){return typeof directorReady==='function'&&directorReady();}
function coachValidLesson(l){return l&&LESSONS.some((x,i)=>x.id===l.id&&lessonUnlocked(i));}
function coachCleanReply(v,phase){
 if(!v||typeof v!=='object'||Array.isArray(v))throw Error('AI yanıt biçimi geçersiz.');
 if(phase==='start'&&v.correct!==null)throw Error('Başlangıç yanıtı değerlendirme içermemeli.');
 if(phase==='answer'&&typeof v.correct!=='boolean')throw Error('AI doğruluk bilgisi eksik.');
 const feedback=String(v.feedback||'').trim(),question=String(v.question||'').trim(),correction=String(v.correction||'').trim(),focus=String(v.focus||'').trim();
 if(!feedback||!question||feedback.length>1800||question.length>1000)throw Error('AI açıklaması veya alıştırması eksik.');
 return {correct:phase==='start'?null:v.correct,feedback:feedback.slice(0,600),question:question.slice(0,360),correction:correction.slice(0,300),focus:focus.slice(0,90)};
}
function coachMake(l){
 return {lessonId:l.id,started:Date.now(),updated:Date.now(),question:'',focus:'',feedback:'',correction:'',correct:null,streak:0,attempts:0,correctTotal:0,readyForQuiz:false,needsRestart:false,examPassed:false,history:[],draft:''};
}
function coachRender(l){
 const s=coachSession(l),connected=coachCanUse();
 return `<section class="premium-panel coach-panel" aria-label="AI öğretmenli ders çalışması">
 <div class="coach-heading"><span class="coach-avatar"><img src="teacher-avatar.webp" alt="AI öğretmen" width="52" height="52"></span><span><small class="panel-eyebrow">✦ KİŞİSEL ÖĞRETMEN</small><h2>AI ile adım adım öğren</h2></span></div>
 <p class="muted">Öğretmenin cevabına göre konuyu yeniden anlatır, sana özel yeni sorular sorar ve hazır olduğunda mini sınava yönlendirir.</p>
 ${!connected?`<div class="warning"><strong>AI öğretmen şu an bağlı değil.</strong> Ayarlar'dan Cloudflare bağlantısını aç. Hazır ders anlatımı ve mini sınav bağlantı olmadan kullanılabilir.</div><button class="btn secondary full" data-page="settings">AI bağlantı ayarları</button>`:
 !s?`<button class="btn full" data-action="coach-start" ${coachBusy?'disabled':''}>${coachBusy?'Ders hazırlanıyor…':'✦ AI öğretmenle dersi başlat'}</button>`:
 `<div class="coach-mastery"><span>${s.readyForQuiz?'✓ Alıştırmalar tamamlandı':`Doğru cevap serisi: ${s.streak}/${COACH_TARGET}`}</span><span>${s.attempts} cevap</span></div>
 <div class="coach-pips" aria-label="Doğru cevap ilerlemesi">${Array.from({length:COACH_TARGET},(_,i)=>`<i class="${s.streak>i?'on':''}"></i>`).join('')}</div>
 <div class="coach-teacher-message"><strong>✦ Öğretmenin</strong><p>${h(s.feedback||'Öğretmen hazır.')}</p>${s.correction?`<p class="coach-correction"><strong>Örnek düzeltme:</strong> ${h(s.correction)}</p>`:''}</div>
 ${s.examPassed?`<div class="coach-success">Sınav aşamasını geçtin. Ders bitişi için konulu sohbet de gerekli olabilir.</div><button class="btn full" data-page="courses">Derslerime devam et →</button>`:s.needsRestart?`<div class="warning">Resmî mini sınavda eksik kalan konular var. AI öğretmen hatalarını temel alarak yeni bir çalışma başlatabilir.</div><button class="btn full" data-action="coach-restart" ${coachBusy?'disabled':''}>↻ Eksiklerimi AI ile yeniden çalış</button>`:s.readyForQuiz?`<div class="coach-success">Üç doğru cevabı arka arkaya verdin. Şimdi ödevini yap; ödevden sonra mini sınav (%75) ve canlı konu sohbeti var.</div><button class="btn full" data-action="teacher-open-homework">Ödevimi yap →</button><button class="btn secondary full coach-restart" data-action="coach-restart">Ek alıştırma çalış</button>`:
 `<div class="coach-question"><span class="badge">${h(s.focus||l.title)}</span><h3>${h(s.question)}</h3><label for="coach-answer" class="label">Cevabın</label><textarea id="coach-answer" class="field" rows="3" maxlength="550" spellcheck="false" autocapitalize="sentences" placeholder="İngilizce cevabını buraya yaz…">${h(s.draft||'')}</textarea><button class="btn full" data-action="coach-submit" ${coachBusy?'disabled':''}>${coachBusy?'AI değerlendiriyor…':'Cevabımı kontrol et →'}</button></div>`}
 <button class="btn ghost coach-restart" data-action="coach-restart" ${coachBusy?'disabled':''}>${s.readyForQuiz?'':'↻ Yeni alıştırma dizisi başlat'}</button>`}
 ${coachError?`<div class="warning" role="alert">${h(coachError)} <button class="mini-tab" data-action="coach-retry">Tekrar dene</button></div>`:''}
 <p class="tiny">AI yalnızca yazılı cevabı değerlendirir. Telaffuzu ölçmez. Ders geçme yetkisi sabit mini sınavdadır. Çalışman iPhone'da saklanır.</p>
 </section>`;
}
async function coachRequest(l,phase,answer='',previous=null){
 if(!coachCanUse())throw Error('Cloudflare gerçek AI bağlantısı etkin değil.');
 if(!coachValidLesson(l))throw Error('Bu ders henüz açılmadı.');
 const session=previous||coachSession(l)||coachMake(l);
 const history=(session.history||[]).slice(-6).map(x=>({question:String(x.question||'').slice(0,360),answer:String(x.answer||'').slice(0,550),correct:!!x.correct}));
 const body={action:'coach_turn',phase,lesson:{id:l.id,level:l.level,title:l.title,rule:l.rule,examples:l.examples.slice(0,4)},answer:String(answer||'').slice(0,550),question:phase==='answer'?String(session.question||'').slice(0,360):'',history,mistakes:[...Object.values(state.misses).slice(-4).map(x=>String(x?.title||'').slice(0,120)),...speakingSummary().patterns.slice(0,3).map(x=>'Konuşma hatası: '+x.focus)].slice(0,7)};
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),50000);
 try{
  const response=await fetch(state.settings.worker,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+state.settings.token},body:JSON.stringify(body),signal:controller.signal});
  const payload=await response.json().catch(()=>({}));
  if(!response.ok)throw Error(payload.error||'HTTP '+response.status);
  return coachCleanReply(payload.turn,phase);
 }finally{clearTimeout(timer)}
}
async function coachStart(l,reset=false){
 if(coachBusy||!coachValidLesson(l))return;
 coachBusy=true;coachError='';coachPending={phase:'start',lessonId:l.id};if(page==='lesson')renderLesson();
 try{
  const base=reset?coachMake(l):coachSession(l)||coachMake(l);
  const response=await coachRequest(l,'start','',base);
  const next={...base,question:response.question,feedback:response.feedback,focus:response.focus,correction:'',draft:'',correct:null,readyForQuiz:false,needsRestart:false,examPassed:false,streak:reset?0:base.streak,updated:Date.now()};
  coachStore()[l.id]=next;activity();save();coachPending=null;
 }catch(e){coachError='AI dersi hazırlayamadı: '+String(e.message||e).slice(0,150);}
 finally{coachBusy=false;if(page==='lesson')renderLesson()}
}
async function coachSubmit(l){
 if(coachBusy||!coachValidLesson(l))return;
 const s=coachSession(l);if(!s||s.readyForQuiz)return;
 const answer=(document.getElementById('coach-answer')?.value||s.draft||'').trim();
 if(!answer){coachError='Önce cevabını yaz.';renderLesson();return;}
 if(answer.length>550){coachError='Cevap 550 karakterden kısa olmalı.';renderLesson();return;}
 s.draft=answer;save();coachBusy=true;coachError='';coachPending={phase:'answer',lessonId:l.id};renderLesson();
 try{
  const question=s.question;
  const response=await coachRequest(l,'answer',answer,s);
  const streak=response.correct?Math.min(COACH_TARGET,(Number(s.streak)||0)+1):0;
  s.streak=streak;s.attempts=(Number(s.attempts)||0)+1;s.correctTotal=(Number(s.correctTotal)||0)+(response.correct?1:0);
  s.history=[...(s.history||[]),{question,answer,correct:response.correct,at:Date.now()}].slice(-24);
  s.question=response.question;s.focus=response.focus;s.feedback=response.feedback;s.correction=response.correction;s.correct=response.correct;s.readyForQuiz=streak>=COACH_TARGET;s.needsRestart=false;s.examPassed=false;s.draft='';s.updated=Date.now();
  if(!response.correct){
   teacherStore();state.tutorHistory.push({lessonId:l.id,at:Date.now(),kind:'coach-remediate',note:'AI tekrar önerdi: '+l.title});state.tutorHistory=state.tutorHistory.slice(-80);
  }
  if(typeof directorInvalidate==='function')directorInvalidate();
  activity();save();coachPending=null;
 }catch(e){coachError='AI cevabını değerlendiremedi. Yazdığın metin korundu: '+String(e.message||e).slice(0,145);}
 finally{coachBusy=false;if(page==='lesson')renderLesson()}
}
function coachRememberDraft(value){const l=LESSONS.find(x=>x.id===state.activeLesson)||currentLesson(),s=coachSession(l);if(!s)return;s.draft=String(value||'').slice(0,550);save();}

// A failed official mini exam supersedes practice readiness. Progress is not deleted.
function coachOnQuizResult(l,score){const s=coachSession(l);if(!s)return;s.examPassed=score>=75;s.needsRestart=score<75;if(score<75){s.readyForQuiz=false;s.streak=0;s.draft='';}s.updated=Date.now();save();}
