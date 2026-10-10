'use strict';
// English AI Teacher v2.9.2 - Bilingual Turkish/English voice teacher for iPhone Safari
// Developer: Ali Erkonak. Microphone audio is only processed for transcription,
// never stored; transcribed text stays in existing local progress / backup.
const live={active:false,stream:null,ctx:null,source:null,analyser:null,rec:null,chunks:[],pulse:null,speakTimer:null,speechToken:0,seq:0,phase:'idle',status:'Başlatmaya hazır',error:'',history:[],busy:false,heardSpeech:false,voiceStart:0,lastLoud:0,firstLoud:0,recordStart:0,autoListen:true,slow:false,lastAnswer:'',mime:'',silentStop:false,volume:0,lastAssessment:null,failedAudio:null,recognized:'',meter:0,captions:false,inputLanguage:'en',lastSpeechSegments:null,speechUtterance:null,speechStarted:false,speechError:'',manualFallback:false,noiseFloor:0,noiseSamples:0};
function liveConversation(){return Array.isArray(state.voiceHistory)?state.voiceHistory:[];}
function liveReady(){return state.settings.ai==='cloud'&&workerAddressValid(state.settings.worker)&&!!state.settings.token;}
function liveSet(phase,status,error){live.phase=phase;live.status=status;if(typeof error==='string')live.error=error;liveUpdate();}
function liveUpdate(){
 if(page!=='speaking'||speakMode!=='live')return;
 const el=document.getElementById('live-status');if(el)el.textContent=live.status;
 const orb=document.getElementById('live-orb');if(orb){const recording=live.phase==='listening';orb.className='mic-control '+(recording?'listening':live.phase==='speaking'?'speaking':live.phase==='thinking'?'thinking':'');orb.textContent=recording?'■':live.phase==='speaking'?'🔊':'🎙';orb.dataset.action=recording?'live-done':live.active?'live-record':'live-start';orb.disabled=live.busy||live.phase==='thinking'||live.phase==='speaking';orb.setAttribute('aria-label',recording?'Sözümü bitirdim':live.active?'Konuşmaya başla':'Sesli görüşmeyi başlat');}
 const err=document.getElementById('live-error');if(err){err.textContent=live.error;err.hidden=!live.error;}
 const start=document.getElementById('live-start');if(start){start.textContent=live.active?'■ Sesli görüşmeyi bitir':'▶ Sesli görüşmeyi başlat';start.dataset.action=live.active?'live-stop':'live-start';}
 const measure=document.getElementById('live-volume');if(measure?.style)measure.style.width=Math.round(live.meter*100)+'%';
 const elapsed=document.getElementById('live-elapsed');if(elapsed)elapsed.textContent=live.phase==='listening'?`${Math.max(0,Math.round((performance.now()-live.recordStart)/1000))} sn / 30 sn`:'AI konuştuğunda dinle; ardından cevap ver';
 const recognized=document.getElementById('live-recognized');if(recognized)recognized.textContent=live.recognized?'Algılanan: '+live.recognized.slice(0,500):'Henüz konuşma algılanmadı.';
 const retryAudio=document.getElementById('live-audio-retry');if(retryAudio)retryAudio.hidden=!live.failedAudio;
 const done=document.getElementById('live-done');if(done)done.disabled=!live.active||live.phase!=='listening';
 const last=document.getElementById('live-last-response');if(last)last.textContent=live.captions?(live.lastAnswer||'Hello! Let’s practice English together.'):(live.phase==='speaking'?'🔊 AI öğretmen sesli konuşuyor':live.phase==='listening'?'🎙 Seni dinliyorum':'🔊 Öğretmenle sesli sohbet');
 const feedback=document.getElementById('live-feedback');if(feedback)feedback.innerHTML=speakingFeedbackHtml(live.lastAssessment);
 const pending=document.getElementById('live-pending');if(pending){const text=state.pendingVoiceTurn?.content||'';pending.hidden=!text;if(text)pending.querySelector('p').textContent='Gönderilemeyen cümle: '+text.slice(0,220);}
 const transcripts=document.getElementById('live-text-details');if(transcripts)transcripts.hidden=!live.captions;
 const toggle=document.getElementById('live-captions');if(toggle){toggle.textContent=live.captions?'◉ Altyazıları kapat':'◯ Altyazıları göster';toggle.setAttribute('aria-pressed',String(live.captions));}
 const tr=document.getElementById('live-input-tr'),en=document.getElementById('live-input-en');
 if(tr){tr.setAttribute('aria-pressed',String(live.inputLanguage==='tr'));if(live.inputLanguage==='tr')tr.classList.add('on');else tr.classList.remove('on');tr.disabled=live.busy||['thinking','speaking'].includes(live.phase);}
 if(en){en.setAttribute('aria-pressed',String(live.inputLanguage==='en'));if(live.inputLanguage==='en')en.classList.add('on');else en.classList.remove('on');en.disabled=live.busy||['thinking','speaking'].includes(live.phase);}
 const auto=document.getElementById('live-auto');if(auto){auto.textContent=live.autoListen?'◉ Otomatik dinleme':'◯ Elle dinleme';auto.setAttribute('aria-pressed',String(live.autoListen));}
 const box=document.getElementById('live-transcript');if(box&&live.captions){box.innerHTML=liveConversation().slice(-16).map(m=>`<div class="bubble ${m.role==='user'?'user':'assistant'}"><span class="live-label">${m.role==='user'?'SEN':'AI ÖĞRETMEN'}</span>${h(m.content)}${m.assessment?.status==='needs_practice'&&m.assessment?.corrected?`<small class="live-correction">Örnek: ${h(m.assessment.corrected)}</small>`:''}</div>`).join('')||'<p class="muted">Görüşmeyi başlattığında öğretmenin sesini duyacaksın.</p>';box.scrollTop=box.scrollHeight;}
}
function renderLiveVoice(){
 const ready=liveReady(),lesson=flowActiveLesson(),progress=lesson?flowFor(lesson):null;
 root.innerHTML=`<div class="live-page-head"><button class="live-back" data-page="home" aria-label="Ana sayfaya dön">‹</button><div><h1>Canlı AI görüşmesi</h1><p>Türkçe bilen sesli İngilizce öğretmeni · v2.9.2</p></div><span class="live-online ${ready?'':'offline'}">${ready?'AI bağlantısı hazır':'AI çevrimdışı'}</span></div>
 ${!lesson&&state.lastCompletedLessonId?`<section class="premium-panel flow-live"><strong>✓ Konu tamamlandı!</strong><p>İki uygun konuşma yanıtın kaydedildi. Sıradaki derse geçebilirsin.</p><button class="btn full" data-page="courses">Derslere devam et →</button></section>`:''}${lesson?`<section class="premium-panel flow-live"><strong>🎓 Konulu sesli sohbet · ${h(lesson.title)}</strong><p>AI öğretmen konuya uygun sorular soracak.</p><span class="badge">${progress.talkCorrect}/${FLOW_TALK_TARGET} konuya uygun doğru yanıt</span></section>`:''}
 <div class="live-stage premium-live voice-first-stage"><div class="live-avatar-ring"><img src="teacher-avatar.webp" alt="AI öğretmen avatarı" width="448" height="568"></div><div class="live-avatar-speech" id="live-last-response">${live.captions?h(live.lastAnswer||'Hello! Let’s practice English together.'):'🔊 Öğretmenle sesli sohbet'}</div><div class="live-listen-banner"><h2 id="live-status" role="status">${h(live.status)}</h2><p>İngilizce öğretir · Hatalarını Türkçe açıklar · Sesli sohbet eder</p></div>
 <button class="mic-control" id="live-orb" data-action="${live.active?'live-record':'live-start'}" aria-label="Konuşmaya başla">🎙</button><p class="live-mic-help">${live.active?'AI konuşuyorsa dinle, mikrofon açıldığında cevap ver.':'Sesli görüşmeyi başlatmak için dokun. iPhone ses izni için ilk dokunuş zorunludur.'}</p><div class="live-audio-meter"><div id="live-volume"></div></div><p class="live-mic-help" id="live-elapsed">AI konuştuğunda dinle; ardından cevap ver</p><button class="btn full voice-call-start" id="live-start" data-action="${live.active?'live-stop':'live-start'}">${live.active?'■ Sesli görüşmeyi bitir':'▶ Sesli görüşmeyi başlat'}</button></div>
 ${ready?'':`<div class="warning">AI bağlantısı eksik. Ayarlar sayfasından mevcut Cloudflare bağlantını kontrol et. <button class="btn secondary" data-page="settings">Ayarlar</button></div>`}
 <section class="voice-language-panel" aria-label="Mikrofon konuşma dili"><strong>Hangi dilde konuşacaksın?</strong><div class="voice-language-buttons"><button id="live-input-en" class="mini-tab ${live.inputLanguage==='en'?'on':''}" data-action="live-lang-en" aria-pressed="${live.inputLanguage==='en'}">🇬🇧 İngilizce pratik</button><button id="live-input-tr" class="mini-tab ${live.inputLanguage==='tr'?'on':''}" data-action="live-lang-tr" aria-pressed="${live.inputLanguage==='tr'}">🇹🇷 Türkçe soru sor</button></div><p>İngilizce konuşursan öğretmen hatanı Türkçe sesle düzeltir. Türkçe soru sorarsan Türkçe yanıt verir; sınav başarına sayılmaz.</p></section>
 <div class="voice-switches"><button class="mini-tab" id="live-auto" data-action="live-auto" aria-pressed="${live.autoListen}">${live.autoListen?'◉ Otomatik dinleme':'◯ Elle dinleme'}</button><button class="mini-tab" id="live-captions" data-action="live-captions" aria-pressed="${live.captions}">${live.captions?'◉ Altyazıları kapat':'◯ Altyazıları göster'}</button></div>
 <div class="voice-sound-help">🔊 Ses gelmezse <button class="mini-tab" data-action="live-repeat">Öğretmeni sesli dinle</button> düğmesine bas ve iPhone medya sesini yükselt. Sessiz mod veya Safari ses ayarları da etkileyebilir.</div>
 <button class="btn secondary full" id="live-audio-retry" data-action="live-audio-retry" ${live.failedAudio?'':'hidden'}>↻ Kaydı yeniden gönder</button>
 <div class="live-message" id="live-error" ${live.error?'':'hidden'} role="alert">${h(live.error)}</div>
 <div class="premium-live-controls"><button id="live-done" data-action="live-done" ${live.active&&live.phase==='listening'?'':'disabled'}><span>■</span>Sözümü bitirdim</button><button data-action="live-explain" ${ready?'':'disabled'}><span>♧</span>Türkçe açıkla</button><button data-action="live-repeat"><span>🔊</span>Tekrar söyle</button><button data-action="live-slower"><span>◷</span>${live.slow?'Normal hız':'Daha yavaş'}</button></div>
 <div id="live-text-details" ${live.captions?'':'hidden'}><p class="live-recognized" id="live-recognized">${h(live.recognized?'Algılanan: '+live.recognized:'Henüz konuşma algılanmadı.')}</p><section class="speaking-ai-card"><div class="row between"><strong>✦ Konuşma geri bildirimi</strong><span>Metin analizi</span></div><div id="live-feedback">${speakingFeedbackHtml(live.lastAssessment)}</div><button class="mini-tab" data-action="live-practice">Bu konuda ek pratik</button></section><div class="live-conversation-card"><div class="row between"><h2 class="section-title">Konuşma geçmişi</h2><button class="mini-tab" data-action="live-reset">Temizle</button></div><div class="live-talk" id="live-transcript" aria-label="Konuşma geçmişi"></div><div class="live-composer"><input class="field" id="live-input" maxlength="900" placeholder="İstersen metin yaz" aria-label="Öğretmene mesaj yaz"/><button class="btn" data-action="live-send">➤</button></div></div><button class="btn secondary full" data-action="live-memo" ${live.lastAnswer?'':'disabled'}>☆ Son cümleyi ezberime kaydet</button></div>
 <section class="live-pending" id="live-pending" ${state.pendingVoiceTurn?.content?'':'hidden'}><strong>Gönderilememiş cümle</strong><p>${h(state.pendingVoiceTurn?.content||'')}</p><div class="row"><button class="btn" data-action="live-retry">Yeniden dene</button><button class="btn secondary" data-action="live-discard">Vazgeç</button></div></section>
 <div class="voice-tabs"><button class="mini-tab on" data-action="voice-live">◉ Canlı AI</button><button class="mini-tab" data-action="voice-phrase">♫ Cümle tekrarı</button></div>
 <p class="live-help">Bu, telefon gibi eşzamanlı iki yönlü arama değil; karşılıklı sırayla sesli görüşmedir. Ses çıkışı iPhone'un ücretsiz yerleşik konuşma motorunu kullanır; AI yanıtları mevcut Cloudflare bağlantısından gelir. Otomatik dinleme iOS sürümüne göre değişebilir; gerekirse mikrofona basıp «Sözümü bitirdim» seçeneğini kullan. Ses kayıtları yalnızca yazıya çevirmek için gönderilir; konuşma metni ve hata notları cihazında saklanır. Telaffuz puanı üretilmez.</p>`;
 liveUpdate();
}
function liveMicError(e){let code=String(e?.name||e?.message||e||'');if(/NotAllowed|Permission|denied/i.test(code))return 'Mikrofon izni reddedildi. Safari → Web Sitesi Ayarları → Mikrofon bölümünü kontrol et. Olmazsa alttaki iPhone klavye diktesini kullan.';
 if(/NotFound/i.test(code))return 'Kullanılabilir mikrofon bulunamadı.';
 return 'iPhone mikrofonu başlatılamadı: '+code.slice(0,110)+'. Klavye diktesiyle devam edebilirsin.';}
function liveCleanupRecorder(silent=true){
 live.silentStop=silent;
 if(live.pulse){clearInterval(live.pulse);live.pulse=null;}
 if(live.rec&&live.rec.state==='recording'){try{live.rec.stop()}catch(e){}}
 live.rec=null;live.chunks=[];
}
function liveReleaseHardware(){if(live.stream){live.stream.getTracks().forEach(t=>t.stop());live.stream=null;}try{live.source?.disconnect()}catch(e){}live.source=null;try{live.ctx?.close()}catch(e){}live.ctx=null;live.analyser=null;}
function liveEnd(quiet=false){
 live.seq++;live.active=false;live.busy=false;live.speechToken++;
 if(live.speakTimer){clearTimeout(live.speakTimer);live.speakTimer=null;}
 live.speechUtterance=null;
 try{window.speechSynthesis?.cancel()}catch(e){}
 liveCleanupRecorder(true);liveReleaseHardware();live.failedAudio=null;live.meter=0;live.phase='idle';live.status='Görüşme durduruldu';if(!quiet)live.error='';liveUpdate();
}
function liveOpeningGreeting(){
 const lesson=flowActiveLesson();
 return lesson?`Hello! Let's practise your current lesson. Here is an example: ${String(lesson.examples?.[0]||'I study English every day.').slice(0,90)} Now make a different English sentence about yourself, please.`:
  'Hello! Welcome to English AI Teacher. I am here to speak English with you. How are you today?';
}
function liveGreetingSegments(){
 const lesson=flowActiveLesson();
 const en=liveOpeningGreeting();
 return lesson?[{lang:'tr',text:'Merhaba! Bu konuyu İngilizce çalışacağız. Hatalarını Türkçe açıklayacağım. Türkçe soru sormak istersen Türkçe soru sor düğmesini seç.'},{lang:'en',text:en}]:[
  {lang:'en',text:'Hello! Welcome to English AI Teacher.'},
  {lang:'tr',text:'Merhaba! Ben Türkçe bilen İngilizce öğretmeninim. Hatalarını Türkçe açıklayacağım. Türkçe soru da sorabilirsin.'},
  {lang:'en',text:'How are you today?'}
 ];
}
function liveSetInputLanguage(lang){
 if(!['en','tr'].includes(lang))return;
 if(live.busy||['thinking','speaking'].includes(live.phase)){toast('Dil değiştirmek için öğretmenin konuşmasının bitmesini bekle.');return;}
 const wasListening=live.phase==='listening';
 if(wasListening){liveAbortCapture();liveSet('ready','Mikrofon dili değiştiriliyor…');}
 live.inputLanguage=lang;liveUpdate();toast(lang==='tr'?'Türkçe soru modu: Türkçe konuşabilirsin.':'İngilizce pratik modu: İngilizce konuşabilirsin.');
 if(wasListening&&live.active)liveCapture();
}
function liveIsTurkishText(value){return /[çğıöşüÇĞİÖŞÜ]|\b(?:merhaba|nasıl|neden|ne demek|anlamı|türkçe|anlat|açıkla|bilmiyorum|öğret|çalışacağım|cümlede|kullanılır|örnek ver|kelime)\b/i.test(value);}
function liveSpeechSegmentsForAssessment(a){
 if(a.status==='help')return [
  {lang:'tr',text:a.reply},
  ...(a.corrected?[{lang:'en',text:a.corrected}]:[]),
  {lang:'en',text:a.nextQuestion}
 ];
 if(a.status==='needs_practice')return [
  {lang:'tr',text:a.feedbackTr},
  ...(a.corrected?[{lang:'en',text:a.corrected}]:[]),
  {lang:'en',text:a.reply}
 ];
 if(a.status==='uncertain')return [{lang:'tr',text:a.feedbackTr},{lang:'en',text:a.reply}];
 return [{lang:'en',text:a.reply}];
}
function liveSpeechFinished(audible=true){
 if(!live.active||live.busy)return;
 if(!audible){live.manualFallback=true;liveSet('ready','Ses çalınamadı. «Tekrar söyle» düğmesine dokun.','iPhone sesli oynatmayı engellemiş olabilir. Yeniden dinlemeye dokunabilir veya konuşmaya başlayabilirsin.');return;}
 liveSet('ready','Sıra sende · Şimdi İngilizce konuş');
 if(live.autoListen)liveCapture();
}
async function liveStart(){
 if(live.active){liveEnd();return;}
 if(!liveReady()){liveSet('idle','AI bağlantısı eksik','Ayarlar sayfasında mevcut Cloudflare bağlantını kontrol et.');return;}
 if(state.pendingVoiceTurn?.content){liveSet('idle','Gönderilemeyen cümle var','Önce cümleni yeniden dene veya vazgeç.');return;}
 if(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder){liveSet('idle','Mikrofon desteklenmiyor','Bu tarayıcı mikrofonu kullanamıyor. Safari sürümünü ve mikrofon iznini kontrol et.');return;}
 if(!('speechSynthesis' in window)||typeof SpeechSynthesisUtterance==='undefined'){liveSet('idle','Sesli öğretmen desteklenmiyor','Bu iPhone tarayıcısı sesli konuşma sentezini desteklemiyor.');return;}
 live.error='';live.manualFallback=false;live.inputLanguage='en';live.active=true;live.busy=false;live.recognized='';live.failedAudio=null;live.seq++;live.lastAnswer=liveOpeningGreeting();
 // IMPORTANT: speaking begins IN this tap event. Safari does not allow first audio playback from an async network callback.
 live.lastSpeechSegments=liveGreetingSegments();liveSpeak(live.lastAnswer,liveSpeechFinished,live.lastSpeechSegments);
}
async function liveAcquireMic(){
 if(live.stream?.getAudioTracks().some(t=>t.readyState==='live'))return true;
 const seq=live.seq;
 try{
  liveSet('thinking','Mikrofon izni kontrol ediliyor…');
  const stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}});
  if(!live.active||live.seq!==seq){stream.getTracks().forEach(t=>t.stop());return false;}
  live.stream=stream;
  const AC=window.AudioContext||window.webkitAudioContext;
  if(AC){try{live.ctx=new AC();const resumed=live.ctx.resume?.();resumed?.catch?.(()=>{});live.source=live.ctx.createMediaStreamSource(stream);live.analyser=live.ctx.createAnalyser();live.analyser.fftSize=1024;live.source.connect(live.analyser);}catch(e){try{live.ctx?.close()}catch(_){}live.ctx=null;live.analyser=null;live.source=null;}}
  if(!live.analyser&&live.autoListen){live.autoListen=false;live.manualFallback=true;live.error='Bu cihazda sessizlik algılama kullanılamıyor. «Sözümü bitirdim» düğmesine basarak kaydı gönderebilirsin.';liveUpdate();}
  return true;
 }catch(e){if(live.active&&live.seq===seq){live.autoListen=false;live.manualFallback=true;liveSet('ready','Mikrofon açılmadı · Yeniden dokun',liveMicError(e));}return false;}
}
function liveClipType(){if(!window.MediaRecorder)return '';const types=['audio/mp4','audio/webm;codecs=opus','audio/webm','audio/ogg'];return types.find(t=>MediaRecorder.isTypeSupported?.(t))||'';}
async function liveCapture(){
 if(!live.active||live.busy||live.phase==='listening'||live.phase==='speaking')return;
 if(!await liveAcquireMic())return;
 if(!live.active||live.busy)return;
 try{
  liveCleanupRecorder(true);
  const type=liveClipType();live.mime=type||'audio/mp4';live.chunks=[];live.failedAudio=null;if(!live.manualFallback)live.error='';
  const rec=new MediaRecorder(live.stream,type?{mimeType:type}:{});live.rec=rec;
  live.recordStart=performance.now();live.silentStop=false;live.meter=0;live.heardSpeech=false;live.lastLoud=0;live.firstLoud=0;live.noiseFloor=0;live.noiseSamples=0;
  rec.ondataavailable=e=>{if(e.data?.size)live.chunks.push(e.data)};
  rec.onerror=e=>{live.error='Ses kaydedilemedi: '+String(e.error?.name||'recorder');liveSet('ready','Kaydı yeniden başlat',live.error)};
  rec.onstop=()=>{
   if(live.pulse){clearInterval(live.pulse);live.pulse=null;}
   if(live.silentStop||!live.active||rec!==live.rec)return;
   const chunks=live.chunks.slice(),blob=new Blob(chunks,{type:rec.mimeType||live.mime});live.chunks=[];
   if(blob.size<800){liveSet('ready','Ses kaydı çok kısa','Tekrar mikrofona dokunup konuş.');return;}
   liveHandleAudio(blob);
  };
  rec.start();liveSet('listening','Kayıt yapılıyor · Seni dinliyorum');
  const arr=live.analyser?new Uint8Array(live.analyser.fftSize):null;
  live.pulse=setInterval(()=>{
   if(!live.active||live.phase!=='listening')return;
   if(live.analyser&&arr){live.analyser.getByteTimeDomainData(arr);let ss=0;for(const v of arr){let x=(v-128)/128;ss+=x*x;}const rms=Math.sqrt(ss/arr.length);live.meter=Math.min(1,rms*7);
    const now=performance.now();if(now-live.recordStart<450){live.noiseSamples++;live.noiseFloor+=(rms-live.noiseFloor)/live.noiseSamples;}
    const threshold=Math.max(.035,live.noiseFloor*2.5);if(now-live.recordStart>450&&rms>threshold){if(!live.firstLoud)live.firstLoud=now;live.lastLoud=now;if(now-live.firstLoud>=150)live.heardSpeech=true;}
    // Silence detection applies only to optional automatic turn-taking. Manual stop is always available.
    if(live.autoListen&&live.heardSpeech&&now-live.lastLoud>1600&&now-live.recordStart>1200){liveFinishSentence();return;}
   }
   if(live.ctx?.state==='suspended'&&live.autoListen&&performance.now()-live.recordStart>1400){live.autoListen=false;live.manualFallback=true;live.error='iPhone ses seviyesi analizini başlatmadı; kaydı elle bitirmen gerekiyor.';liveUpdate();}
   const meter=document.getElementById('live-volume');if(meter?.style)meter.style.width=Math.round(live.meter*100)+'%';
   const label=document.getElementById('live-elapsed');if(label)label.textContent=Math.round((performance.now()-live.recordStart)/1000)+' sn / 30 sn';
   if(performance.now()-live.recordStart>=30000){if(live.autoListen&&!live.heardSpeech){liveCleanupRecorder(true);liveSet('ready','Ses algılanmadı · Mikrofona dokun veya konuş','Mikrofon ses seviyesi görünmüyorsa Safari mikrofon iznini kontrol et.');}else liveFinishSentence();}
  },180);
 }catch(e){liveSet('ready','Dinleme başlatılamadı',liveMicError(e));}
}
function liveFinishSentence(){if(!live.active||live.phase!=='listening'||!live.rec)return;const recorder=live.rec;liveSet('thinking','Ses kaydı bitiriliyor…');if(live.pulse){clearInterval(live.pulse);live.pulse=null;}if(recorder.state==='recording')recorder.stop();}
async function liveWorker(body,timeoutMs=45000){
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeoutMs);
 try{const r=await fetch(state.settings.worker,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+state.settings.token},body:JSON.stringify(body),signal:controller.signal});const data=await r.json().catch(()=>({}));if(!r.ok)throw Error(data.error||('HTTP '+r.status));return data;}finally{clearTimeout(timer)}
}
function liveAsBase64(blob){return new Promise((resolve,reject)=>{const fr=new FileReader();fr.onerror=()=>reject(Error('Ses okunamadı'));fr.onload=()=>resolve(String(fr.result).split(',')[1]||'');fr.readAsDataURL(blob)});}
async function liveHandleAudio(blob){
 if(!live.active||live.busy)return;
 const seq=live.seq;live.busy=true;liveSet('thinking','Sesi yazıya çeviriyorum…');
 try{
  if(blob.size>1400000)throw Error('Ses kaydı çok büyük. Daha kısa konuş.');
  const micLang=live.inputLanguage;
  const data=await liveWorker({action:'transcribe',audio:await liveAsBase64(blob),mime:blob.type||live.mime,language:micLang},45000);
  if(!live.active||live.seq!==seq)return;
  const text=String(data.text||'').trim();if(!text)throw Error('Konuşma algılanamadı.');
  live.recognized=text;live.failedAudio=null;live.busy=false;liveUpdate();await liveTalkToAI(text,'mic',micLang);
 }catch(e){if(live.seq!==seq)return;live.busy=false;live.error=String(e.message||e).slice(0,180);live.failedAudio=blob;liveSet('ready','Ses işlenemedi · Tekrar dene',live.error);}
}
function liveLog(role,content){if(!Array.isArray(state.voiceHistory))state.voiceHistory=[];state.voiceHistory.push({role,content:String(content).slice(0,1200),at:Date.now()});state.voiceHistory=state.voiceHistory.slice(-60);activity();}
async function liveTalkToAI(message,source='typed',spokenLanguage){
 if(!liveReady())throw Error('Worker adresi ve erişim kodunu kontrol et.');
 if(live.busy)return false;
 const value=String(message||'').trim().slice(0,500);
 if(!value)return false;
 const pending=state.pendingVoiceTurn;
 const language=pending?.content===value&&['en','tr'].includes(pending.language)?pending.language:(spokenLanguage==='tr'||spokenLanguage==='en'?spokenLanguage:source==='typed'&&liveIsTurkishText(value)?'tr':'en');
 if(pending?.content&&pending.content!==value){liveSet('idle','Bekleyen cümle var','Önce gönderilemeyen cümleyi yeniden dene veya vazgeç.');return false;}
 live.busy=true;
 state.pendingVoiceTurn={content:value,source:source==='mic'?'mic':'typed',language,at:pending?.at||Date.now()};save();
 live.error='';liveSet('thinking','AI cümleni değerlendiriyor…');const seq=live.seq;
 const lesson=flowActiveLesson()||currentLesson();
 try{
  const payload={action:'analyze_speech_turn',utterance:value,source:state.pendingVoiceTurn.source,language,
   lesson:{id:lesson.id,level:lesson.level,title:lesson.title,rule:lesson.rule},
   history:liveConversation().slice(-8).map(m=>({role:m.role,content:m.content})),
   focus:speakingSummary().patterns.slice(0,3).map(p=>p.focus),practiceLessonId:flowActiveLesson()?.id||null};
  const res=await liveWorker(payload,60000);
  if(live.seq!==seq)return false;
  const a=speakingValidate(res);
  // Commit a completed turn atomically: a failed network request never counts as learning.
  liveLog('user',value);const history=liveConversation();history[history.length-1].assessment={status:a.status,corrected:a.corrected,focus:a.focus};
  liveLog('assistant',a.reply);live.lastAnswer=a.reply;live.lastAssessment=a;live.lastSpeechSegments=liveSpeechSegmentsForAssessment(a);
  speakingCommit(value,a,source);state.pendingVoiceTurn=null;save();
  live.busy=false;liveReleaseHardware();if(language==='tr')live.inputLanguage='en';liveUpdate();liveSpeak(a.reply,liveSpeechFinished,live.lastSpeechSegments);return true;
 }catch(e){
  if(live.seq!==seq)return false;
  live.busy=false;const reason='AI değerlendirmesi tamamlanamadı: '+String(e.message||e).slice(0,170);
  if(live.active)liveEnd(true); // stop microphone if automatic capture cannot continue
  live.error=reason;liveSet('idle','Cümlen beklemede',reason);
  // Keep the exact pending transcript and do not resume automatic recording.
  return false;
 }
}
async function liveRequestHelp(message){
 if(!liveReady()){liveSet('idle','Bağlantı eksik','Önce Cloudflare Worker bağlantısını kaydet.');return;}
 if(live.busy)return;
 if(state.pendingVoiceTurn?.content){liveSet('idle','Bekleyen cümle var','Önce önceki cümleyi yeniden gönder veya iptal et.');return;}
 liveAbortCapture();live.busy=true;const seq=live.seq;
 liveSet('thinking','AI öğretmen açıklıyor…');
 try{
  const l=currentLesson(),messages=[...liveConversation().slice(-8).map(m=>({role:m.role,content:m.content})),{role:'user',content:message}];
  const res=await liveWorker({messages,context:{mode:'voice',level:l.level,title:l.title,rule:l.rule,mistakes:speakingSummary().patterns.map(p=>p.focus)}},55000);
  if(live.seq!==seq)return;
  const answer=String(res.reply||'').trim().slice(0,1200);if(!answer)throw Error('AI yanıtı boş.');
  // Help commands are NOT student English utterances; never grade them.
  liveLog('assistant',answer);live.lastAnswer=answer;live.lastSpeechSegments=null;live.busy=false;liveReleaseHardware();
  liveSpeak(answer,liveSpeechFinished);
 }catch(e){if(live.seq!==seq)return;live.busy=false;liveSet('idle','Açıklama alınamadı',String(e.message||e).slice(0,160));if(live.active)liveSet('ready','Hazır · Yeni kayıt için mikrofona dokun');}
}
function liveDetermineLang(segment){return /[çğıöşüÇĞİÖŞÜ]|\b(merhaba|açıkla|çünkü|olduğu|şimdi|önce|sonra|doğru|yanlış|demek|türkçe|cümle|anlamı|öğren|kelime|çok|bunu|böyle|şöyle|edilir|kullanılır|bu|senin|benim|neden|nasıl|için|lütfen|öğretmen|konuşalım|şimdi|şunu|tekrar|yapmalısın)\b/i.test(segment)?'tr':'en';}
function liveSpeechChunks(text){const raw=String(text).replace(/\*\*/g,'').replace(/[#*_`]/g,'').replace(/\[[^\]]+\]\([^)]*\)/g,'').replace(/\s+/g,' ').trim();const sentences=raw.match(/[^.!?\n]+[.!?]?/g)||[raw];let chunks=[];for(let p of sentences){p=p.trim();if(!p)continue;while(p.length>170){let at=p.lastIndexOf(' ',170);if(at<40)at=170;chunks.push(p.slice(0,at));p=p.slice(at).trim();}if(p)chunks.push(p);}return chunks.slice(0,16);}
function liveSpeak(text,finished,segments){
 live.speechToken++;const version=live.speechToken;
 if(live.speakTimer){clearTimeout(live.speakTimer);live.speakTimer=null;}
 try{speechSynthesis.cancel()}catch(e){}
 if(!('speechSynthesis'in window)||typeof SpeechSynthesisUtterance==='undefined'){
  liveSet('ready','Sesli okuma desteklenmiyor','Bu Safari sürümünde sesli okuma yok.');if(finished)finished(false);return;
 }
 const chunks=Array.isArray(segments)&&segments.length?segments.filter(s=>s&&['tr','en'].includes(s.lang)).flatMap(s=>liveSpeechChunks(s.text).map(text=>({text,lang:s.lang}))):liveSpeechChunks(text).map(text=>({text,lang:liveDetermineLang(text)}));
 if(!chunks.length){if(finished)finished(false);return;}
 liveSet('speaking','🔊 AI öğretmen sesli konuşuyor…');let index=0;
 const finish=(ok)=>{if(version!==live.speechToken)return;if(live.speakTimer){clearTimeout(live.speakTimer);live.speakTimer=null;}live.speechUtterance=null;if(finished)finished(ok);else liveSet('ready','Hazır');};
 const next=()=>{
  if(version!==live.speechToken||!live.active&&finished){finish(false);return;}
  if(index>=chunks.length){finish(true);return;}
  const {text:piece,lang}=chunks[index++],u=new SpeechSynthesisUtterance(piece);
  live.speechUtterance=u;u.lang=lang==='tr'?'tr-TR':'en-US';u.rate=Math.max(.5,Math.min(1.2,(Number(state.settings.voiceRate)||.87)*(live.slow?.78:1)));u.pitch=1;
  const voice=voiceFor(lang);if(voice)u.voice=voice;
  let settled=false,started=false;
  const clear=()=>{if(live.speakTimer){clearTimeout(live.speakTimer);live.speakTimer=null;}};
  u.onstart=()=>{started=true;clear();liveSet('speaking','🔊 Öğretmen konuşuyor · Şimdi dinle');live.speakTimer=setTimeout(()=>{if(version!==live.speechToken||settled)return;try{speechSynthesis.resume()}catch(e){};live.speakTimer=setTimeout(()=>{if(!settled){settled=true;finish(false);}},5000);},Math.max(12000,piece.length*270));};
  u.onend=()=>{if(settled||version!==live.speechToken)return;settled=true;clear();next();};
  u.onerror=(e)=>{if(settled||version!==live.speechToken)return;settled=true;clear();liveSet('ready','Öğretmen sesi çalınamadı','iPhone sesli okuma hatası: '+String(e?.error||'unknown')+'. «Tekrar söyle» ile dene.');finish(false);};
  try{speechSynthesis.speak(u);
   // On iOS, a queued utterance may never start if the initial play gesture is blocked.
   live.speakTimer=setTimeout(()=>{if(!started&&!settled&&version===live.speechToken){settled=true;try{speechSynthesis.cancel()}catch(e){};liveSet('ready','Ses başlatılamadı','iPhone bu ses oynatmayı engelledi. «Tekrar söyle» düğmesine dokun.');finish(false);}},6500);
  }catch(e){settled=true;liveSet('ready','Sesli oynatma başarısız',String(e.message||e));finish(false);}
 };
 next();
}
async function liveAsk(message){return liveRequestHelp(message);}
async function liveRetry(){
 const pending=state.pendingVoiceTurn;if(!pending?.content||live.busy)return;
 liveAbortCapture();return liveTalkToAI(pending.content,pending.source,pending.language);
}
function liveDiscard(){
 if(live.busy)return;
 state.pendingVoiceTurn=null;save();live.error='';liveSet('idle','Cümle gönderimi iptal edildi');
 if(live.active)liveSet('ready','Hazır · Yeni kayıt için mikrofona dokun');
}
async function livePracticeFocus(){
 const focus=live.lastAssessment?.focus||speakingSummary().patterns[0]?.focus||currentLesson().title;
 return liveRequestHelp('Bu konuşmada '+focus+' konusunu kısa ve kolay Türkçe anlat, sonra bana cevaplamam için TEK bir basit İngilizce konuşma sorusu sor.');
}
function liveAbortCapture(){if(live.pulse){clearInterval(live.pulse);live.pulse=null;}if(live.rec&&live.rec.state==='recording'){live.silentStop=true;try{live.rec.stop()}catch(e){}}live.rec=null;}
async function liveSendTyped(){let field=document.getElementById('live-input');let s=field?.value.trim();if(!s)return;if(!liveReady()){liveSet('idle','AI bağlantısı eksik','Cloudflare Worker ayarlarını kontrol et.');return;}if(live.busy)return;liveAbortCapture();const ok=await liveTalkToAI(s,'typed');if(ok)field.value='';}
function liveRepeat(){if(!live.lastAnswer)live.lastAnswer=liveOpeningGreeting();liveAbortCapture();liveReleaseHardware();if(!live.active){live.active=true;live.seq++;}liveSpeak(live.lastAnswer,liveSpeechFinished,live.lastSpeechSegments);}
function liveSetSlow(){live.slow=!live.slow;if(page==='speaking'&&speakMode==='live')renderLiveVoice();toast(live.slow?'Öğretmen daha yavaş konuşacak.':'Normal okuma hızı.');}
function liveToggleAuto(){live.autoListen=!live.autoListen;if(live.autoListen)live.manualFallback=false;liveUpdate();toast(live.autoListen?'Otomatik dinleme açık: AI konuşması bitince mikrofon açılır.':'Elle dinleme açık: cevap vermek için mikrofona dokun.');}
function liveToggleCaptions(){live.captions=!live.captions;liveUpdate();}
function liveSaveToMemo(){if(!live.lastAnswer)return;const text=live.lastAnswer.slice(0,220);const result=memoAdd(text,'','Canlı AI görüşmesi');toast(result.error||'Cümle ezber defterine eklendi.');}
function liveReset(){if(live.active){toast('Önce canlı görüşmeyi bitir.');return;}if(state.pendingVoiceTurn?.content){toast('Önce gönderilemeyen cümleyi yeniden dene veya vazgeç.');return;}if(!confirm('Yalnızca canlı görüşme geçmişi temizlensin mi? Dersler ve ezberler korunur.'))return;state.voiceHistory=[];state.pendingVoiceTurn=null;live.lastAnswer='';live.lastAssessment=null;live.lastSpeechSegments=null;save();renderLiveVoice();}
window.addEventListener('pagehide',()=>{if(live.active)liveEnd(true)});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&live.active)liveEnd(true)});

async function liveRetryAudio(){if(!live.failedAudio||live.busy)return;const blob=live.failedAudio;await liveHandleAudio(blob);}
