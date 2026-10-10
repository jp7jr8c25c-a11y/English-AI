'use strict';
// English AI Teacher v2.4 - Voice conversation (turn-taking, experimental Safari PWA)
// Developer: Ali Erkonak. Microphone audio is only processed for transcription,
// never stored; transcribed text stays in existing local progress / backup.
const live={active:false,stream:null,ctx:null,source:null,analyser:null,rec:null,chunks:[],pulse:null,speakTimer:null,speechToken:0,seq:0,phase:'idle',status:'Başlatmaya hazır',error:'',history:[],busy:false,heardSpeech:false,voiceStart:0,lastLoud:0,firstLoud:0,recordStart:0,autoListen:true,slow:false,lastAnswer:'',mime:'',silentStop:false,volume:0,lastAssessment:null};
function liveConversation(){return Array.isArray(state.voiceHistory)?state.voiceHistory:[];}
function liveReady(){return state.settings.ai==='cloud'&&workerAddressValid(state.settings.worker)&&!!state.settings.token;}
function liveSet(phase,status,error){live.phase=phase;live.status=status;if(typeof error==='string')live.error=error;liveUpdate();}
function liveUpdate(){
 if(page!=='speaking'||speakMode!=='live')return;
 const el=document.getElementById('live-status');if(el)el.textContent=live.status;
 const orb=document.getElementById('live-orb');if(orb){orb.className='mic-control '+(live.phase==='listening'?'listening':live.phase==='speaking'?'speaking':live.phase==='thinking'?'thinking':'');orb.textContent=live.active?'■':'🎙';orb.setAttribute('aria-label',live.active?'Görüşmeyi bitir':'Görüşmeyi başlat');}
 const err=document.getElementById('live-error');if(err){err.textContent=live.error;err.hidden=!live.error;}
 const start=document.getElementById('live-start');if(start){start.textContent=live.active?'■ Görüşmeyi bitir':'▶ Canlı görüşmeyi başlat';start.dataset.action=live.active?'live-stop':'live-start';}
 const mic=document.getElementById('live-orb');if(mic)mic.dataset.action=live.active?'live-stop':'live-start';
 const done=document.getElementById('live-done');if(done)done.disabled=!live.active||live.phase!=='listening';
 const last=document.getElementById('live-last-response');if(last)last.textContent=live.lastAnswer||'Hello! Let’s practice English together.';
 const feedback=document.getElementById('live-feedback');if(feedback)feedback.innerHTML=speakingFeedbackHtml(live.lastAssessment);
 const pending=document.getElementById('live-pending');if(pending){const text=state.pendingVoiceTurn?.content||'';pending.hidden=!text;if(text)pending.querySelector('p').textContent='Gönderilemeyen cümle: '+text.slice(0,220);}
 const box=document.getElementById('live-transcript');if(box){box.innerHTML=liveConversation().slice(-16).map(m=>`<div class="bubble ${m.role==='user'?'user':'assistant'}"><span class="live-label">${m.role==='user'?'SEN':'AI ÖĞRETMEN'}</span>${h(m.content)}${m.assessment?.status==='needs_practice'&&m.assessment?.corrected?`<small class="live-correction">Örnek: ${h(m.assessment.corrected)}</small>`:''}</div>`).join('')||'<p class="muted">Görüşmeyi başlat. Öğretmen konuşacak, ardından seni dinleyecek.</p>';box.scrollTop=box.scrollHeight;}
}
function renderLiveVoice(){
 const ready=liveReady();
 root.innerHTML=`<div class="live-page-head"><button class="live-back" data-page="home" aria-label="Ana sayfaya dön">‹</button><div><h1>Canlı AI görüşmesi</h1><p>English AI Teacher ile konuşuyorsun</p></div><span class="live-online ${ready?'':'offline'}">${ready?'AI çevrimiçi':'AI çevrimdışı'}</span></div>
 <div class="live-stage premium-live"><div class="live-avatar-ring"><img src="teacher-avatar.webp" alt="AI öğretmen avatarı" width="448" height="568"></div><div class="live-avatar-speech" id="live-last-response">${h(live.lastAnswer||'Hello! Let’s practice English together.')}</div><div class="live-listen-banner"><h2 id="live-status" role="status">${h(live.status)}</h2><p>${live.phase==='listening'?'Konuşmaya başlayabilirsin…':'Mikrofon ile karşılıklı pratik yap'}</p></div><button class="mic-control" id="live-orb" data-action="${live.active?'live-stop':'live-start'}" aria-label="Görüşmeyi başlat">🎙</button><p class="live-mic-help">${live.active?'Dokunarak görüşmeyi bitirebilirsin':'Konuşmayı başlatmak için mikrofona dokun'}</p><button class="btn secondary full" id="live-start" data-action="${live.active?'live-stop':'live-start'}">${live.active?'■ Görüşmeyi bitir':'▶ Canlı görüşmeyi başlat'}</button></div>
 ${ready?'':`<div class="warning">Canlı AI bağlantısı henüz kurulmadı. Ayarlar bölümünden Cloudflare AI erişimini etkinleştir. <button class="btn secondary" data-page="settings">Ayarları aç</button></div>`}
 <div class="live-message" id="live-error" ${live.error?'':'hidden'} role="alert">${h(live.error)}</div>
 <section class="speaking-ai-card" aria-label="AI konuşma değerlendirmesi"><div class="row between"><strong>✦ AI Konuşma Koçu</strong><span>Metin analizi</span></div><div id="live-feedback">${speakingFeedbackHtml(live.lastAssessment)}</div><button class="mini-tab" data-action="live-practice">Bu konuda ek pratik yap</button></section>
 <section class="live-pending" id="live-pending" ${state.pendingVoiceTurn?.content?'':'hidden'}><strong>Gönderilmemiş cümle</strong><p>${h(state.pendingVoiceTurn?.content||'')}</p><div class="row"><button class="btn" data-action="live-retry">Yeniden dene</button><button class="btn secondary" data-action="live-discard">Vazgeç</button></div></section>
 <div class="premium-live-controls"><button id="live-done" data-action="live-done" ${live.active&&live.phase==='listening'?'':'disabled'}><span>■</span>Sözümü bitirdim</button><button data-action="live-explain" ${ready?'':'disabled'}><span>♧</span>Türkçe açıkla</button><button data-action="live-repeat"><span>↻</span>Tekrar söyle</button><button data-action="live-slower"><span>◷</span>${live.slow?'Normal hız':'Daha yavaş'}</button></div>
 <div class="live-conversation-card"><div class="row between"><h2 class="section-title" style="margin:4px 0">☷ Konuşma Akışı</h2><button class="mini-tab" data-action="live-reset">Temizle</button></div><div class="live-talk" id="live-transcript" aria-label="Konuşma geçmişi"></div><div class="live-composer"><input class="field" id="live-input" maxlength="900" placeholder="Yaz veya klavyeden dikte et" aria-label="Öğretmene mesaj yaz"/><button class="btn" data-action="live-send">➤</button></div></div>
 <button class="btn secondary full" data-action="live-memo" ${live.lastAnswer?'':'disabled'}>☆ Son cümleyi ezberime kaydet</button>
 <div class="voice-tabs"><button class="mini-tab on" data-action="voice-live">◉ Canlı AI</button><button class="mini-tab" data-action="voice-phrase">♫ Cümle tekrarı</button></div>
 <p class="live-help">Bu bir tam-dupleks telefon görüşmesi değildir. AI sırayla dinler ve konuşur. Ses kayıtları yalnızca yazıya çevrilmek üzere Cloudflare’a gönderilir ve kaydedilmez. AI, transkripsiyondaki gramer ve kelime kullanımını değerlendirir; sesin gerçek telaffuzunu puanlamaz. Konuşma metni ve hata notları iPhone yedeğine dahildir. iPhone Safari mikrofon izinleri test edilmelidir.</p>`;
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
 try{window.speechSynthesis?.cancel()}catch(e){}
 liveCleanupRecorder(true);liveReleaseHardware();live.phase='idle';live.status='Görüşme durduruldu';if(!quiet)live.error='';liveUpdate();
}
async function liveStart(){
 if(live.active){liveEnd();return;}
 if(!liveReady()){liveSet('idle','AI bağlantısı eksik','Önce Ayarlar sayfasında Cloudflare gerçek AI bağlantısını etkinleştir.');return;}
 if(state.pendingVoiceTurn?.content){liveSet('idle','Gönderilemeyen cümle var','Önce cümleni yeniden dene veya vazgeç.');return;}
 if(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder){liveSet('idle','Ses kaydı desteklenmiyor','Bu iPhone web görünümünde MediaRecorder veya mikrofon erişimi yok. Alttaki klavye diktesiyle sesli cevap alabilirsin.');return;}
 live.error='';live.active=true;live.busy=true;live.seq++;const seq=live.seq;
 liveSet('thinking','Mikrofon izni isteniyor…');
 try{
  const stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}});
  if(!live.active||live.seq!==seq){stream.getTracks().forEach(t=>t.stop());return;}
  live.stream=stream;
  const AC=window.AudioContext||window.webkitAudioContext;
  if(AC){live.ctx=new AC();live.source=live.ctx.createMediaStreamSource(stream);live.analyser=live.ctx.createAnalyser();live.analyser.fftSize=1024;live.source.connect(live.analyser);}
  live.busy=false;
  live.status='Öğretmen konuşuyor';
  // Starting speech here is part of the user's original tap, important for iOS playback.
  live.lastAnswer='Hello! I am your English teacher. How are you today?';
  liveSpeak(live.lastAnswer,()=>{if(live.active)liveCapture()});
 }catch(e){if(live.seq!==seq)return;live.active=false;live.busy=false;liveReleaseHardware();liveSet('idle','Mikrofon kullanılamıyor',liveMicError(e));}
}
function liveClipType(){if(!window.MediaRecorder)return '';const types=['audio/mp4','audio/webm;codecs=opus','audio/webm','audio/ogg'];return types.find(t=>MediaRecorder.isTypeSupported?.(t))||'';}
function liveCapture(){
 if(!live.active||live.busy||!live.stream)return;
 try{
  liveCleanupRecorder(true);
  const type=liveClipType();live.mime=type||'audio/mp4';live.chunks=[];
  const rec=new MediaRecorder(live.stream,type?{mimeType:type}:{});live.rec=rec;
  live.heardSpeech=false;live.firstLoud=0;live.lastLoud=0;live.voiceStart=performance.now();live.recordStart=live.voiceStart;live.silentStop=false;
  rec.ondataavailable=e=>{if(e.data?.size)live.chunks.push(e.data)};
  rec.onerror=e=>{if(live.active){live.error='Ses kaydı hata verdi: '+String(e.error?.name||'iOS recorder');liveEnd(false)}};
  rec.onstop=()=>{
   if(live.pulse){clearInterval(live.pulse);live.pulse=null;}
   if(live.silentStop||!live.active||rec!==live.rec)return;
   const chunks=live.chunks.slice();const blob=new Blob(chunks,{type:rec.mimeType||live.mime});live.chunks=[];
   if(blob.size<800){liveSet('idle','Ses duyulmadı','Mikrofon yeterli ses kaydetmedi. Tekrar deneyebilirsin.');liveCapture();return;}
   liveHandleAudio(blob);
  };
  rec.start();liveSet('listening','Dinliyorum… Konuşabilirsin');
  const arr=live.analyser?new Uint8Array(live.analyser.fftSize):null;
  live.pulse=setInterval(()=>{
   if(!live.active||live.phase!=='listening')return;
   const now=performance.now();let rms=0;
   if(live.analyser&&arr){live.analyser.getByteTimeDomainData(arr);let ss=0;for(let n=0;n<arr.length;n++){const x=(arr[n]-128)/128;ss+=x*x;}rms=Math.sqrt(ss/arr.length);}
   // Amplitude-based voice activity detection is only an approximation.
   if(rms>.020){if(!live.firstLoud)live.firstLoud=now;if(now-live.firstLoud>230){live.heardSpeech=true;live.lastLoud=now;}}
   else if(rms>.012&&live.heardSpeech)live.lastLoud=now;
   if(live.heardSpeech&&now-live.lastLoud>1250){liveFinishSentence();return;}
   if(now-live.recordStart>17000){liveFinishSentence();return;}
   if(!live.heardSpeech&&now-live.recordStart>15000){live.recordStart=now;live.firstLoud=0;liveCleanupRecorder(true);if(live.active)liveCapture();}
  },130);
 }catch(e){liveSet('idle','Dinleme başlatılamadı',liveMicError(e));liveEnd(true)}
}
function liveFinishSentence(){if(!live.active||live.phase!=='listening'||!live.rec)return;const recorder=live.rec;liveSet('thinking','Sesin çözümleniyor…');if(live.pulse){clearInterval(live.pulse);live.pulse=null;}if(recorder.state==='recording')recorder.stop();}
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
  const data=await liveWorker({action:'transcribe',audio:await liveAsBase64(blob),mime:blob.type||live.mime,language:'auto'},45000);
  if(!live.active||live.seq!==seq)return;
  const text=String(data.text||'').trim();if(!text)throw Error('Konuşma algılanamadı.');
  live.busy=false;await liveTalkToAI(text,'mic');
 }catch(e){if(live.seq!==seq)return;live.busy=false;live.error=String(e.message||e).slice(0,180);liveSet('idle','Ses algılanamadı',live.error);if(live.active)liveCapture();}
}
function liveLog(role,content){if(!Array.isArray(state.voiceHistory))state.voiceHistory=[];state.voiceHistory.push({role,content:String(content).slice(0,1200),at:Date.now()});state.voiceHistory=state.voiceHistory.slice(-60);activity();}
async function liveTalkToAI(message,source='typed'){
 if(!liveReady())throw Error('Worker adresi ve erişim kodunu kontrol et.');
 if(live.busy)return false;
 const value=String(message||'').trim().slice(0,500);
 if(!value)return false;
 const pending=state.pendingVoiceTurn;
 if(pending?.content&&pending.content!==value){liveSet('idle','Bekleyen cümle var','Önce gönderilemeyen cümleyi yeniden dene veya vazgeç.');return false;}
 live.busy=true;
 state.pendingVoiceTurn={content:value,source:source==='mic'?'mic':'typed',at:pending?.at||Date.now()};save();
 live.error='';liveSet('thinking','AI cümleni değerlendiriyor…');const seq=live.seq;
 const lesson=currentLesson();
 try{
  const payload={action:'analyze_speech_turn',utterance:value,source:state.pendingVoiceTurn.source,
   lesson:{id:lesson.id,level:lesson.level,title:lesson.title,rule:lesson.rule},
   history:liveConversation().slice(-8).map(m=>({role:m.role,content:m.content})),
   focus:speakingSummary().patterns.slice(0,3).map(p=>p.focus)};
  const res=await liveWorker(payload,60000);
  if(live.seq!==seq)return false;
  const a=speakingValidate(res);
  // Commit a completed turn atomically: a failed network request never counts as learning.
  liveLog('user',value);const history=liveConversation();history[history.length-1].assessment={status:a.status,corrected:a.corrected,focus:a.focus};
  liveLog('assistant',a.reply);live.lastAnswer=a.reply;live.lastAssessment=a;
  speakingCommit(value,a,source);state.pendingVoiceTurn=null;save();
  live.busy=false;liveUpdate();liveSpeak(a.reply,()=>{if(live.active)liveCapture()});return true;
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
  liveLog('assistant',answer);live.lastAnswer=answer;live.busy=false;
  liveSpeak(answer,()=>{if(live.active)liveCapture()});
 }catch(e){if(live.seq!==seq)return;live.busy=false;liveSet('idle','Açıklama alınamadı',String(e.message||e).slice(0,160));if(live.active)liveCapture();}
}
function liveDetermineLang(segment){return /[çğıöşüÇĞİÖŞÜ]|\b(merhaba|açıkla|çünkü|olduğu|şimdi|önce|sonra|doğru|yanlış|demek|türkçe|cümle|anlamı|öğren|kelime|çok|bunu|böyle|şöyle|edilir|kullanılır)\b/i.test(segment)?'tr':'en';}
function liveSpeechChunks(text){const raw=String(text).replace(/\*\*/g,'').replace(/[#*_`]/g,'').replace(/\[[^\]]+\]\([^)]*\)/g,'').replace(/\s+/g,' ').trim();const sentences=raw.match(/[^.!?\n]+[.!?]?/g)||[raw];let chunks=[];for(let p of sentences){p=p.trim();if(!p)continue;while(p.length>170){let at=p.lastIndexOf(' ',170);if(at<40)at=170;chunks.push(p.slice(0,at));p=p.slice(at).trim();}if(p)chunks.push(p);}return chunks.slice(0,16);}
function liveSpeak(text,finished){
 live.speechToken++;const version=live.speechToken;
 try{speechSynthesis.cancel()}catch(e){}
 if(!('speechSynthesis'in window)){liveSet('idle','Sesli okuma desteklenmiyor','Telefonunda konuşma sentezi desteklenmiyor. Metin ekranda duruyor.');if(finished)finished();return;}
 const chunks=liveSpeechChunks(text);
 liveSet('speaking','AI konuşuyor…');
 let index=0;
 const finish=()=>{if(version!==live.speechToken)return;if(live.speakTimer){clearTimeout(live.speakTimer);live.speakTimer=null;}if(finished)finished();else liveSet('idle','Hazır');};
 const next=()=>{
  if(version!==live.speechToken||!live.active&&finished){finish();return;}
  if(index>=chunks.length){finish();return;}
  const piece=chunks[index++],lang=liveDetermineLang(piece),u=new SpeechSynthesisUtterance(piece);
  u.lang=lang==='tr'?'tr-TR':'en-US';u.rate=(Number(state.settings.voiceRate)||.87)*(live.slow?.80:1);u.pitch=1;
  const voice=voiceFor(lang);if(voice)u.voice=voice;
  let fired=false;const advance=()=>{if(fired)return;fired=true;if(live.speakTimer){clearTimeout(live.speakTimer);live.speakTimer=null;}next()};
  u.onend=advance;u.onerror=advance;
  try{speechSynthesis.speak(u);live.speakTimer=setTimeout(advance,Math.min(18000,Math.max(5000,piece.length*130)));}catch(e){advance()}
 };
 next();
}
async function liveAsk(message){return liveRequestHelp(message);}
async function liveRetry(){
 const pending=state.pendingVoiceTurn;if(!pending?.content||live.busy)return;
 liveAbortCapture();return liveTalkToAI(pending.content,pending.source);
}
function liveDiscard(){
 if(live.busy)return;
 state.pendingVoiceTurn=null;save();live.error='';liveSet('idle','Cümle gönderimi iptal edildi');
 if(live.active)liveCapture();
}
async function livePracticeFocus(){
 const focus=live.lastAssessment?.focus||speakingSummary().patterns[0]?.focus||currentLesson().title;
 return liveRequestHelp('Bu konuşmada '+focus+' konusunu kısa ve kolay Türkçe anlat, sonra bana cevaplamam için TEK bir basit İngilizce konuşma sorusu sor.');
}
function liveAbortCapture(){if(live.pulse){clearInterval(live.pulse);live.pulse=null;}if(live.rec&&live.rec.state==='recording'){live.silentStop=true;try{live.rec.stop()}catch(e){}}live.rec=null;}
async function liveSendTyped(){let field=document.getElementById('live-input');let s=field?.value.trim();if(!s)return;if(!liveReady()){liveSet('idle','AI bağlantısı eksik','Cloudflare Worker ayarlarını kontrol et.');return;}if(live.busy)return;liveAbortCapture();const ok=await liveTalkToAI(s,'typed');if(ok)field.value='';}
function liveRepeat(){if(!live.lastAnswer){toast('Henüz tekrar edilecek cevap yok.');return;}liveAbortCapture();liveSpeak(live.lastAnswer,()=>{if(live.active)liveCapture()});}
function liveSetSlow(){live.slow=!live.slow;if(page==='speaking'&&speakMode==='live')renderLiveVoice();toast(live.slow?'Öğretmen daha yavaş konuşacak.':'Normal okuma hızı.');}
function liveSaveToMemo(){if(!live.lastAnswer)return;const text=live.lastAnswer.slice(0,220);const result=memoAdd(text,'','Canlı AI görüşmesi');toast(result.error||'Cümle ezber defterine eklendi.');}
function liveReset(){if(live.active){toast('Önce canlı görüşmeyi bitir.');return;}if(state.pendingVoiceTurn?.content){toast('Önce gönderilemeyen cümleyi yeniden dene veya vazgeç.');return;}if(!confirm('Yalnızca canlı görüşme geçmişi temizlensin mi? Dersler ve ezberler korunur.'))return;state.voiceHistory=[];state.pendingVoiceTurn=null;live.lastAnswer='';live.lastAssessment=null;save();renderLiveVoice();}
window.addEventListener('pagehide',()=>{if(live.active)liveEnd(true)});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&live.active)liveEnd(true)});
