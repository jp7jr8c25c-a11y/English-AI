'use strict';
// English AI Teacher v2.9 - iPhone PWA - Author: Ali Erkonak
const STORAGE_KEY='english_ai_teacher_iphone_v1';
const root=document.getElementById('view');
const TODAY=()=>new Date().toLocaleDateString('en-CA');
const defaultState=()=>({completed:{},attempts:0,correct:0,misses:{},days:[],chat:[],flashcards:[],dailyPlans:{},settings:{ai:'offline',worker:'',token:'',autoplay:false,voiceRate:0.87},created:Date.now()});
let speakMode='live';
let state=loadState(),page='home',memoFilter='due',memoSession=null,memoForm=null,quiz=null,speakIndex=0,recorder=null,hearing=false,heard='',speakFeedback='',engine=null,engineLoading=false,engineMessage='',isSending=false,toastTimer=null,chatError='',chatDraft='',speechIssue='',speechStatus='',microphoneBlocked=false,mediaRecorder=null,mediaStream=null,mediaChunks=[],mediaTimeout=null,speechUploading=false;
function loadState(){try{let s=JSON.parse(localStorage.getItem(STORAGE_KEY));if(s&&typeof s==='object')return {...defaultState(),...s,flashcards:Array.isArray(s.flashcards)?s.flashcards:[],dailyPlans:s.dailyPlans&&typeof s.dailyPlans==='object'?s.dailyPlans:{},settings:{...defaultState().settings,...(s.settings||{})}};}catch(e){}return defaultState();}
function save(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}catch(e){toast('Kayıt yapılamadı. Safari depolama alanını kontrol et.')}}
function h(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function clean(s){return String(s||'').normalize('NFKC').toLowerCase().replace(/[’‘`]/g,"'").replace(/[.,!?;:]+/g,'').replace(/\s+/g,' ').trim();}
function toast(s){let t=document.getElementById('toast');t.textContent=s;t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),3000);}
function answered(q,a){return q.answers.some(x=>clean(x)===clean(a));}
function completedCount(){return LESSONS.filter(l=>state.completed[l.id]?.score>=75).length;}
function nextLesson(){return LESSONS.find(l=>!state.completed[l.id]||state.completed[l.id].score<75)||LESSONS[LESSONS.length-1];}
function lessonUnlocked(idx){return idx===0||LESSONS.slice(0,idx).every(l=>state.completed[l.id]?.score>=75);}
function currentLesson(){let l=nextLesson();return l||LESSONS[0];}
function activity(){let d=TODAY();if(!state.days.includes(d)){state.days.push(d);state.days=state.days.slice(-400);}save()}
function streak(){let n=0,all=new Set(state.days);let d=new Date();if(!all.has(TODAY()))d.setDate(d.getDate()-1);for(let i=0;i<365;i++){let x=d.toLocaleDateString('en-CA');if(!all.has(x))break;n++;d.setDate(d.getDate()-1);}return n}
// Personal flashcards: stored in the existing v1 localStorage record for backward compatibility.
function memoItems(){return Array.isArray(state.flashcards)?state.flashcards:[]}
function memoDue(){return memoItems().filter(c=>!Number.isFinite(c.due)||c.due<=Date.now())}
function memoById(id){return memoItems().find(c=>c.id===id)}
function memoId(){return 'm'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,9)}
function memoAdd(front,back='',source='',example=''){
 front=String(front||'').trim().slice(0,220);back=String(back||'').trim().slice(0,300);
 if(!front)return {error:'İngilizce kelime veya cümleyi yaz.'};
 let exists=memoItems().find(x=>clean(x.front)===clean(front));
 if(exists)return {error:'Bu ifade ezber defterinde zaten var.',id:exists.id};
 let item={id:memoId(),front,back,example:String(example||'').trim().slice(0,280),source:String(source||'').slice(0,70),created:Date.now(),due:Date.now(),stage:0,interval:0,reviews:0,correct:0};
 state.flashcards.push(item);activity();return {item};
}
function memoGrade(card,kind){return memoProGrade(card,kind);}
function dailyPlan(){
 const today=TODAY();let plan=state.dailyPlans[today];
 if(!plan||typeof plan!=='object'){
  plan={lessonId:currentLesson().id,steps:{},created:Date.now()};state.dailyPlans[today]=plan;
  let keys=Object.keys(state.dailyPlans).sort();for(let k of keys.slice(0,Math.max(0,keys.length-180)))delete state.dailyPlans[k];save();
 }
 return plan;
}
function dailyStep(key){let plan=dailyPlan();return !!plan.steps[key]}
function completeDaily(key){let plan=dailyPlan();plan.steps[key]=!plan.steps[key];activity();render();}
function memoLabel(c){if(!c.due||c.due<=Date.now())return 'Tekrar zamanı';return new Date(c.due).toLocaleDateString('tr-TR',{day:'numeric',month:'short'});}
function memoFormHtml(){let c=memoForm||{};return `<div class="card"><h3>${c.id?'Kartı düzenle':'Yeni ezber kartı'}</h3><p class="muted">Kelime, kalıp veya tam bir İngilizce cümle ekleyebilirsin.</p><label class="label" for="memo-front">İngilizce ifade *</label><textarea class="field" id="memo-front" rows="2" maxlength="220" placeholder="I usually get up at 9 o'clock.">${h(c.front||'')}</textarea><div style="height:12px"></div><label class="label" for="memo-back">Türkçe anlam / açıklama</label><textarea class="field" id="memo-back" rows="2" maxlength="300" placeholder="Genellikle saat 9'da kalkarım.">${h(c.back||'')}</textarea><div style="height:12px"></div><label class="label" for="memo-example">Örnek / kişisel not (isteğe bağlı)</label><textarea class="field" id="memo-example" rows="2" maxlength="280">${h(c.example||'')}</textarea><div style="height:15px"></div><div class="grid2"><button class="btn secondary" data-action="memo-close">Vazgeç</button><button class="btn" data-action="memo-save">${c.id?'Güncelle':'Ezbere kaydet'}</button></div></div>`}
function renderMemo(){let all=memoItems(),due=memoDue(),cards=memoFilter==='all'?all:memoFilter==='weak'?all.filter(memoProWeak):due;
 if(memoSession){renderMemoReview();return;}
 root.innerHTML=`<div class="eyebrow">Personal memory book</div><h1>Ezber defterim</h1><p class="muted">Derslerden ve AI öğretmenden önemli kelimeleri, cümleleri kaydet. Kartları kendi hızında tekrar et.</p>
 ${memoProPanel()}<div class="grid2"><div class="kpi"><small>Kaydedilen kart</small><span class="num">${all.length}</span></div><div class="kpi"><small>Bugün tekrarlanacak</small><span class="num">${due.length}</span></div></div>
 <button class="btn full" data-action="memo-review" ${due.length?'':'disabled'}>▣ Bugünkü ezberlerimi çalış (${due.length})</button><div style="height:12px"></div>
 <button class="btn secondary full" data-action="memo-new">＋ Yeni kelime / cümle kaydet</button><div style="height:14px"></div>
 ${memoForm?memoFormHtml():''}
 <div class="row between"><h2 class="section-title">Kartlarım</h2><div class="row" style="gap:4px"><button class="mini-tab ${memoFilter==='due'?'on':''}" data-action="memo-filter" data-kind="due">Bugün</button><button class="mini-tab ${memoFilter==='weak'?'on':''}" data-action="memo-filter" data-kind="weak">Zor</button><button class="mini-tab ${memoFilter==='all'?'on':''}" data-action="memo-filter" data-kind="all">Tümü</button></div></div>
 ${cards.length?cards.slice().sort((a,b)=>(a.due||0)-(b.due||0)).map(c=>`<div class="card" style="margin-bottom:10px"><div class="row between"><strong style="overflow-wrap:anywhere">${h(c.front)}</strong><span class="badge">${h(memoLabel(c))}</span></div><p class="muted" style="white-space:pre-wrap">${h(c.back||'Anlamını henüz yazmadın')}</p>${c.example?`<p class="tiny">Not: ${h(c.example)}</p>`:''}<div class="row wrap"><button class="mini-tab" data-action="speak" data-text="${h(c.front)}">▶ Dinle</button><button class="mini-tab" data-action="memo-edit" data-id="${h(c.id)}">Düzenle</button><button class="mini-tab" data-action="memo-delete" data-id="${h(c.id)}">Sil</button></div></div>`).join(''):'<div class="card"><p class="muted">Bu bölümde gösterilecek kart yok. İstersen derslerdeki ☆ Kaydet düğmesini kullan.</p></div>'}
 <p class="tiny">Ezber defterin iPhone üzerinde saklanır ve JSON yedeğine eklenir. Otomatik sistem bildirimi gönderilmez; uygulamayı açtığında tekrarları görürsün.</p>`;
}
function renderMemoReview(){let session=memoSession;if(!session)return renderMemo();let card=memoById(session.ids[session.index]);
 if(!card){memoSession=null;return renderMemo();}
 root.innerHTML=`<button class="btn ghost" data-action="memo-stop">← Ezber defterine dön</button><div style="height:16px"></div><div class="row between"><span class="badge">Ezber tekrarı</span><span class="muted">${session.index+1}/${session.ids.length}</span></div>
 ${memoProReviewForm(card,session)}
 ${session.revealed?`<div class="review-actions"><button class="btn secondary" data-action="memo-grade" data-kind="again">↻ Yine<br><small>10 dakika</small></button><button class="btn secondary" data-action="memo-grade" data-kind="hard">Zor<br><small>1 gün</small></button><button class="btn" data-action="memo-grade" data-kind="good">✓ Bildim<br><small>Aralıklı tekrar</small></button><button class="btn" data-action="memo-grade" data-kind="easy">★ Çok kolay<br><small>Daha geç tekrar</small></button></div>`:`<button class="btn full" data-action="memo-reveal">Cevabımı kontrol et</button>`}
 <p class="tiny center">Değerlendirmeyi sen yaparsın; mikrofon/telaffuz ölçümü değildir.</p>`;
}
function memoSaveForm(){let front=document.getElementById('memo-front')?.value||'',back=document.getElementById('memo-back')?.value||'',example=document.getElementById('memo-example')?.value||'';
 if(!front.trim()){toast('Önce İngilizce kelime veya cümleyi yaz.');return;}
 if(memoForm?.id){let c=memoById(memoForm.id);if(!c)return;let duplicate=memoItems().find(x=>x.id!==c.id&&clean(x.front)===clean(front));if(duplicate){toast('Bu ifade başka bir kartta kayıtlı.');return;}Object.assign(c,{front:front.trim().slice(0,220),back:back.trim().slice(0,300),example:example.trim().slice(0,280)});save();}
 else{let r=memoAdd(front,back,memoForm?.source||'Kişisel',example);if(r.error){toast(r.error);return;}}
 memoForm=null;save();renderMemo();toast('Ezber defterine kaydedildi.');
}
function saveMemoFromLesson(text){const l=LESSONS.find(x=>x.examples.includes(text))||currentLesson();const index=l.examples.indexOf(text);let r=memoAdd(text,LESSON_GUIDES[l.id]?.meanings?.[index]||(index===0?l.tr:''),l.title);if(r.error){toast(r.error);return;}memoForm={id:r.item.id,...r.item};go('memo');toast('Kaydedildi. Türkçe anlamını da ekleyebilirsin.');}
function saveMemoFromChat(i){let message=state.chat[i];if(!message)return;let selected=window.getSelection?.()?.toString()?.trim();let text=(selected&&message.content.includes(selected)?selected:message.content).slice(0,220);memoForm={front:text,back:'',source:'AI öğretmen'};go('memo');}
function render(){document.querySelectorAll('.navitem').forEach(x=>x.classList.toggle('active',x.dataset.page===page));if(page==='home')renderHome();else if(page==='courses')renderCourses();else if(page==='lesson')renderLesson();else if(page==='quiz')renderQuiz();else if(page==='speaking')renderSpeaking();else if(page==='chat')renderChat();else if(page==='stats')renderStats();else if(page==='homework')renderHomework();else if(page==='memo')renderMemo();else if(page==='settings')renderSettings();}
function go(next){if(next!=='speaking'&&typeof liveEnd==='function')liveEnd(true);if(recorder&&hearing){try{recorder.abort()}catch(e){}hearing=false;}page=next;render();if(next==='lesson')teacherMaybeAutoExplain();if(next==='home')directorMaybePlan();window.scrollTo(0,0)}
function cap(l){return `${h(l.id)} · ${h(l.level)}`}
function renderHome(){
 const l=currentLesson(),done=completedCount(),decision=directorDecision(),plan=decision.plan;
 teacherAssignment(l);const tasks=teacherHomeworkStats(),steps=plan.steps||DIRECTOR_STEPS;
 const completed=steps.filter(x=>dailyStep(x.key)).length;
 const lesson=decision.lesson||l;
 const source=plan.source==='ai'?'✦ AI tarafından hazırlandı':'◇ Yerel öğretmen planı';
 root.innerHTML=`<section class="premium-head"><span class="premium-pill">✦ Kişisel AI Öğretmen</span><button class="round-action" data-page="settings" aria-label="Ayarlar">⚙</button></section>
 <section class="premium-intro"><h1><span>AI</span> Öğretmen</h1><p>✦ Bugünkü planın hazır</p></section>
 <section class="teacher-hero"><div class="hero-copy"><span class="hero-small">${h(l.level)} • ${source}</span><p>“${h(plan.message)}”</p><button class="hero-play" data-action="hero-greeting" aria-label="Öğretmenin mesajını dinle">▶ <span>Öğretmeni dinle</span></button></div><img class="teacher-portrait" src="teacher-home.webp" alt="Sanal AI öğretmen avatarı" width="510" height="518"></section>
 <section class="premium-panel plan-panel"><div class="premium-row"><div><span class="panel-eyebrow">✧ SENİN PROGRAMIN</span><h2>Bugünkü Planın</h2><p>Hedeflerine her gün biraz daha yaklaş</p></div><div class="plan-progress"><strong>${completed}/${steps.length}</strong><div class="progress"><div style="width:${completed/steps.length*100}%"></div></div></div></div>
 <div class="plan-track">${steps.map((step,i)=>`<button class="plan-step" data-action="director-step" data-kind="${step.key}" data-target="${step.page}"><span class="plan-icon ${dailyStep(step.key)?'done':''}">${dailyStep(step.key)?'✓':step.symbol}</span><strong>${h(step.name)}</strong><small>${step.mins} dk</small></button>`).join('')}</div></section>
 <section class="premium-panel next-lesson"><div class="lesson-picture">✦<span>ENGLISH</span></div><div class="next-details"><span class="badge">✧ AI'nın önerdiği adım</span><small>${h(lesson.level)} · ${h(lesson.id)}</small><h2>${h(lesson.title)}</h2><p>${h(lesson.tr)}</p></div><button class="btn full next-start" data-action="director-open">▶ ${decision.type==='homework'?'Ödevime devam et':decision.type==='review'?'Tekrarları çalış':decision.type==='speaking'?'Konuşmaya başla':decision.type==='memo'?'Ezber çalış':'Derse başla'}　 ›</button></section>
 <section class="quick-grid"><button class="quick-card" data-action="teacher-open-homework"><span class="quick-glyph orange">▤</span><span><strong>Ödev <em>${tasks.pending||''}</em></strong><small>Kişisel ödevlerin</small></span><b>›</b></button><button class="quick-card" data-action="review"><span class="quick-glyph violet">↻</span><span><strong>Tekrar</strong><small>${dueQuestions().length} soru bekliyor</small></span><b>›</b></button><button class="quick-card" data-page="memo"><span class="quick-glyph green">✤</span><span><strong>Ezber</strong><small>${memoDue().length} kart bekliyor</small></span><b>›</b></button><button class="quick-card" data-page="stats"><span class="quick-glyph blue">▥</span><span><strong>Gelişim</strong><small>${done}/${LESSONS.length} ders tamamlandı</small></span><b>›</b></button></section>
 <section class="director-note"><div class="premium-row"><strong>✦ AI Öğretmenin Kararı</strong><span class="status-chip ${plan.source==='ai'?'online':''}">${plan.source==='ai'?'AI aktif':'Yerel'}</span></div><p>${h(decision.reason)}</p><div class="director-actions"><button class="btn secondary" data-action="director-refresh" ${directorBusy?'disabled':''}>${directorBusy?'AI planlıyor…':'✦ AI planını yenile'}</button><button class="btn ghost" data-page="chat">Öğretmene sor →</button></div>${directorError?`<div class="warning" role="status">${h(directorError)}</div>`:''}</section>
 <p class="tiny center">${h(source)} · Verilerin bu iPhone'da saklanır. · v2.9 · Ali Erkonak</p>`;
}
function renderCourses(){let n=completedCount();root.innerHTML=`<div class="eyebrow">Ders programı</div><h1>Derslerim</h1><p class="muted">Öğretmenin sırayı belirler. Bir sonraki bölüme geçmek için önceki dersi en az %75 başarıyla tamamla.</p><div class="progress"><div style="width:${Math.round(n/LESSONS.length*100)}%"></div></div>${['A0','A1','A2','B1','B2','C1','C2'].map(level=>`<div class="divider-heading">${level} · ${level==='A0'?'Başlangıç':level==='A1'?'Temel İngilizce':'Ön orta seviye'}</div>${LESSONS.map((l,i)=>l.level!==level?'':`<button class="lessonitem" data-action="open-lesson" data-index="${i}" ${lessonUnlocked(i)?'':'disabled'}><span class="lessonnum">${state.completed[l.id]?.score>=75?'✓':lessonUnlocked(i)?i+1:'🔒'}</span><span><strong>${h(l.title)}</strong><small>${h(l.tr)}${state.completed[l.id]?' · Son skor: %'+state.completed[l.id].score:''}</small></span><span class="arrow">›</span></button>`).join('')}`).join('')}
${proficiencyRoadmap()}<div class="card"><h3>Kapsamlı eğitim yolu</h3><p class="muted">A0–C2 arasında 144 sıralı konu. İlk 24 dersin kimlikleri ve kayıtları korundu. İleri seviye açıklamalarda AI öğretmen örneklerle ayrıntılı öğretir.</p></div>`;}
function renderLesson(){let l=LESSONS.find(x=>x.id===state.activeLesson)||currentLesson();root.innerHTML=`<button class="btn ghost" data-page="courses">← Derslere dön</button><div style="height:18px"></div><span class="badge">${cap(l)}</span><h1>${h(l.title)}</h1><p class="muted">${h(l.tr)}</p>${flowStatus(l)}${coachRender(l)}${speakingLessonNote(l)}<h2 class="section-title">Öğretmenin anlatıyor</h2><div class="note">${h(l.rule)}</div><h2 class="section-title">Adım adım konu anlatımı</h2><div class="card"><p>${h(LESSON_GUIDES[l.id]?.intro||l.rule)}</p><ol class="guide-list">${(LESSON_GUIDES[l.id]?.steps||[l.rule]).map(t=>`<li>${h(t)}</li>`).join('')}</ol><div class="note"><strong>⚠ Sık yapılan hata</strong><p>${h(LESSON_GUIDES[l.id]?.mistake||'Konuya ait örnekleri tekrar oku.')}</p></div></div>${foundationAddon(l)}${proficiencyLessonAddon(l)}${deepLessonAddon(l)}${teacherLessonAddon(l)}<h2 class="section-title">Dinle, öğren, ezbere kaydet</h2><div class="card">${l.examples.map((x,i)=>`<div class="eg"><span style="flex:1">${h(x)}${LESSON_GUIDES[l.id]?.meanings?.[i]?`<small class="meaning">${h(LESSON_GUIDES[l.id].meanings[i])}</small>`:''}</span><button class="speakbtn" data-action="speak" data-text="${h(x)}" aria-label="Cümleyi dinle">▶</button><button class="speakbtn" data-action="memo-from-lesson" data-text="${h(x)}" aria-label="Ezber defterine kaydet">☆</button></div>`).join('')}</div><button class="btn secondary full" data-action="daily-toggle" data-kind="examples">${dailyStep('examples')?'✓ Örnekler çalışıldı':'Örnekleri çalıştım ✓'}</button><p class="muted">Yeni derslerde sıralama: anlatım ve AI alıştırması → ödev → %75 sınav → konuyla iki başarılı canlı cevap. Eski başarılı dersler korunur.</p><button class="btn full" data-action="start-lesson-quiz">${state.completed[l.id]?'Sınavı tekrar çöz':'Mini sınava başla'} →</button><div style="height:10px"></div><button class="btn secondary full" data-action="teacher-open-homework">📝 Bugünkü ödevimi yap</button>`;}
function startLessonQuiz(){let l=LESSONS.find(x=>x.id===state.activeLesson)||currentLesson();if(!flowCanTest(l)){toast('Önce AI alıştırmalarını ve ödevini tamamla.');return;}quiz={kind:'lesson',lesson:l,questions:l.questions.map((q,i)=>({...q,key:l.id+'-'+i})),index:0,score:0,wrong:0,selected:'',submitted:false,lastCorrect:false};go('quiz')}
function dueQuestions(){let arr=[];for(let l of LESSONS){l.questions.forEach((q,i)=>{let key=l.id+'-'+i,m=state.misses[key];if(m&&(!m.due||m.due<=Date.now()))arr.push({...q,key,lessonId:l.id});});}return arr;}
function reviewQuiz(){let arr=dueQuestions();if(!arr.length){toast('Şu anda tekrarlanacak soru yok.');return;}quiz={kind:'review',lesson:null,questions:arr.sort((a,b)=>(state.misses[a.key]?.due||0)-(state.misses[b.key]?.due||0)).slice(0,20),index:0,score:0,wrong:0,selected:'',submitted:false,lastCorrect:false};go('quiz')}
function renderQuiz(){if(!quiz){go('home');return;}if(quiz.index>=quiz.questions.length){renderQuizResult();return;}let q=quiz.questions[quiz.index],num=quiz.index+1,perc=Math.round((num-1)/quiz.questions.length*100);root.innerHTML=`<div class="row between"><span class="badge">${quiz.kind==='review'?'Tekrar antrenmanı':cap(quiz.lesson)}</span><span class="muted">Soru ${num}/${quiz.questions.length}</span></div><div style="height:12px"></div><div class="progress"><div style="width:${perc}%"></div></div><h2 class="section-title" style="font-size:23px;margin-top:32px">${h(q.q)}</h2><p class="muted">${q.type==='choice'?'Bir cevabı seç.':q.type==='fill'?'Boşluğa gelen kelimeyi yaz.':'Cümleyi İngilizce olarak yaz.'}</p><div>${q.options.length?q.options.map((o,i)=>`<button class="option ${quiz.selected===o?'selected':''}${quiz.submitted?(answered(q,o)?' right':quiz.selected===o?' wrong':''):''}" data-action="choose" data-index="${i}" ${quiz.submitted?'disabled':''}>${h(o)}</button>`).join(''):`<input id="written-answer" class="field" placeholder="Cevabını yaz..." value="${h(quiz.selected)}" ${quiz.submitted?'readonly':''} autocomplete="off" autocapitalize="sentences" spellcheck="false">`}</div>
${quiz.submitted?`<div class="feedback ${quiz.lastCorrect?'':'bad'}"><strong>${quiz.lastCorrect?'✓ Doğru!':'✕ Tekrar çalışacağız'}</strong><div>${h(q.why)}</div>${quiz.lastCorrect?'':`<div style="margin-top:7px">Doğru cevap: <strong>${h(q.answers[0])}</strong></div>`}</div><button class="btn full" data-action="next-question">${num===quiz.questions.length?'Sonucu göster':'Sıradaki soru'} →</button>`:`<div style="height:18px"></div><button class="btn full" data-action="submit-answer">Cevabı kontrol et</button>`}`;
if(q.options.length===0&&!quiz.submitted){let inp=document.getElementById('written-answer');inp.addEventListener('input',e=>quiz.selected=e.target.value);inp.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();submitAnswer()}});}}
function submitAnswer(){if(!quiz||quiz.submitted)return;if(!clean(quiz.selected)){toast('Önce bir cevap gir.');return;}let q=quiz.questions[quiz.index],correct=answered(q,quiz.selected);quiz.lastCorrect=correct;quiz.submitted=true;state.attempts++;if(correct){state.correct++;quiz.score++}else quiz.wrong++;
let miss=state.misses[q.key];if(!correct){state.misses[q.key]={interval:0,due:Date.now(),errors:(miss?.errors||0)+1,title:q.q,answer:q.answers[0]}}else if(miss){let interval=Math.min(60,Math.max(1,(miss.interval||0)*2));state.misses[q.key]={...miss,interval,due:Date.now()+interval*86400000,corrected:Date.now()};}
activity();save();renderQuiz();}
function nextQuestion(){if(!quiz)return;quiz.index++;quiz.selected='';quiz.submitted=false;renderQuiz()}
function renderQuizResult(){const score=Math.round(quiz.score/quiz.questions.length*100),passed=score>=75;let name=quiz.kind==='lesson'?quiz.lesson.title:'Tekrar';if(quiz.kind==='lesson'&&!quiz.resultApplied){quiz.resultApplied=true; if(typeof directorInvalidate==='function')directorInvalidate();if(typeof coachOnQuizResult==='function')coachOnQuizResult(quiz.lesson,score);dailyPlan().steps.quiz=true;flowApplyQuiz(quiz.lesson,score);activity()}
root.innerHTML=`<div class="hero center"><div class="eyebrow">${h(name)}</div><h1 style="max-width:none">${score>=75?'Harika ilerleme!':'Biraz daha pratik!'}</h1><div style="font-size:60px;font-weight:850;color:var(--cyan)">%${score}</div><p style="max-width:none">${quiz.score} doğru · ${quiz.wrong} yanlış</p></div>${quiz.kind==='lesson'&&!passed?'<div class="warning">Sonraki ders için %75 gerekiyor. Öğretmenin bu konuyu yeniden çalışmanı öneriyor.</div>':quiz.kind==='lesson'&&!flowLegacyPassed(quiz.lesson)?'<div class="coach-success">Sınavı geçtin. Dersi bitirmek için aynı konuda canlı sohbet yapacağız.</div>':''}<div class="grid2"><button class="btn secondary" data-action="repeat-quiz">Tekrar çöz</button><button class="btn" data-action="finish-quiz">${passed?'Devam et':'Derse dön'} →</button></div>`;save()}
function renderSpeaking(){if(speakMode==='live'){renderLiveVoice();return;}let l=LESSONS.find(x=>x.id===state.activeLesson)||currentLesson();let examples=l.examples||[],phrase=examples[speakIndex%examples.length];let cloudReady=state.settings.ai==='cloud'&&!!state.settings.worker&&!!state.settings.token;let canRecord=!speechUploading;
 root.innerHTML=`<div class="eyebrow">Speaking studio</div><h1>Konuşma pratiği</h1><div class="voice-tabs"><button class="mini-tab" data-action="voice-live">◉ Canlı AI görüşmesi</button><button class="mini-tab on" data-action="voice-phrase">♫ Cümle tekrarı</button></div><p class="muted">Cümleyi dinle, İngilizce söyle ve algılanan metni karşılaştır. iPhone'un klavye diktesi de kullanılabilir.</p><div class="card center"><span class="badge">${cap(l)} · ${speakIndex%examples.length+1}/${examples.length}</span><h2 style="margin:25px 0 12px;font-size:23px">${h(phrase)}</h2><button class="btn secondary" data-action="play-phrase">▶ Öğretmeni dinle</button><div><button class="record ${hearing?'active':''}" data-action="record" ${canRecord?'':'disabled'} aria-label="Konuşmayı başlat veya durdur">${speechUploading?'⌛':hearing?'■':'🎙'}</button></div><p class="muted">${h(speechStatus||(hearing?'Dinliyorum...':'Mikrofona dokun ve konuş'))}</p><p class="tiny">${cloudReady?'AI ses çözümleme: Mikrofon kaydın yalnızca butona bastığında Cloudflare AI’a gönderilir (en fazla 12 sn). Ücretsiz kotadan kullanır.':'Cihaz ses tanıma modu. Mikrofon izni verilmezse aşağıdaki dikte alanı kullanılabilir.'}</p></div>${speechIssue?`<div class="warning"><strong>Mikrofon sorunu:</strong> ${h(speechIssue)}<p class="tiny">Safari’de adres çubuğundaki sayfa menüsü → Web Sitesi Ayarları → Mikrofon → İzin Ver (menü adı iOS sürümüne göre değişebilir). iPhone Ayarlar → Genel → Klavye → Dikteyi Etkinleştir seçeneğini de kontrol et.</p><button class="btn secondary" data-action="focus-dictation">Metin/dikte alanını aç</button></div>`:''}<label class="label" for="heard">Algılanan cümle / klavye ile dikte</label><input id="heard" class="field" placeholder="Dokun → iPhone klavyesinde 🎙 → konuş" value="${h(heard)}" autocomplete="off" spellcheck="false"/><div style="height:8px"></div><button class="btn secondary full" data-action="focus-dictation">⌨ iPhone klavyesiyle konuş / yaz</button><div style="height:12px"></div><button class="btn full" data-action="check-speak">Cümleyi karşılaştır</button>${speakFeedback?`<div class="feedback">${h(speakFeedback)}</div>`:''}<div style="height:14px"></div><button class="btn secondary full" data-action="next-phrase">Sonraki cümle →</button><div class="warning"><strong>Not:</strong> Cümle eşleştirmesi metin üzerinden yapılır. Konuşmanın gerçek fonetik/telaffuz puanı değildir.</div>`;
 let el=document.getElementById('heard');el.addEventListener('input',e=>heard=e.target.value);
}function voiceFor(lang){if(!('speechSynthesis'in window))return null;let a=speechSynthesis.getVoices(),v=a.filter(x=>x.lang.toLowerCase().startsWith(lang));return v.find(x=>/Samantha|Ava|Karen|Victoria|Zira|Jenny|Siri|female/i.test(x.name))||v[0]||null;}
function say(s,lang='en'){if(!('speechSynthesis'in window)){toast('Bu cihazda ses sentezi kullanılamıyor.');return;}speechSynthesis.cancel();let u=new SpeechSynthesisUtterance(s);u.lang=lang==='en'?'en-US':'tr-TR';u.rate=Number(state.settings.voiceRate)||.87;let v=voiceFor(lang);if(v)u.voice=v;speechSynthesis.speak(u);}
function speakingRefresh(){if(page==='speaking')renderSpeaking()}
function microphoneHelp(code){
 if(['not-allowed','service-not-allowed','NotAllowedError','PermissionDeniedError'].includes(code)){microphoneBlocked=true;return 'Mikrofon/ses tanıma izni reddedildi veya iOS bu API kullanımını engelledi.';}
 if(code==='no-speech')return 'Ses duyulmadı. Tekrar dene veya klavyeden dikte et.';
 if(code==='network')return 'Ses tanıma servisine ulaşılamadı. Klavye diktesini dene.';
 return 'Ses tanıma çalışmadı ('+String(code).slice(0,50)+'). Dikte alanını kullanabilirsin.';
}
function stopAudioTracks(){if(mediaTimeout){clearTimeout(mediaTimeout);mediaTimeout=null;}if(mediaStream){mediaStream.getTracks().forEach(t=>t.stop());mediaStream=null;}}
async function sendAudioToWorker(blob){
 if(blob.size>1400000)throw Error('Ses kaydı çok büyük. Daha kısa konuş.');
 const base=String(state.settings.worker||'').trim(),token=state.settings.token;
 const b64=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onerror=()=>reject(Error('Ses kaydı okunamadı.'));reader.onload=()=>resolve(String(reader.result).split(',')[1]||'');reader.readAsDataURL(blob)});
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),40000);
 try{let r=await fetch(base,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},body:JSON.stringify({action:'transcribe',audio:b64,mime:blob.type||'audio/mp4'}),signal:controller.signal});let obj=await r.json().catch(()=>({}));if(!r.ok)throw Error(obj.error||('Sunucu HTTP '+r.status));if(!obj.text||!obj.text.trim())throw Error('Konuşma metne dönüştürülemedi.');return obj.text.trim().slice(0,500);}finally{clearTimeout(timer);}
}
async function startCloudRecording(){
 if(speechUploading)return;
 if(hearing){if(mediaRecorder?.state==='recording')mediaRecorder.stop();return;}
 if(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder){speechIssue='Bu iPhone tarayıcısı ses kaydı API’sini desteklemiyor.';speakingRefresh();return;}
 try{
  speechIssue='';speechStatus='Mikrofon izni isteniyor...';speakingRefresh();
  mediaStream=await navigator.mediaDevices.getUserMedia({audio:true});
  const types=['audio/mp4','audio/webm;codecs=opus','audio/webm','audio/ogg'];const mime=types.find(t=>MediaRecorder.isTypeSupported?.(t))||'';
  mediaRecorder=new MediaRecorder(mediaStream,mime?{mimeType:mime}:{});mediaChunks=[];
  mediaRecorder.ondataavailable=e=>{if(e.data?.size)mediaChunks.push(e.data)};
  mediaRecorder.onerror=e=>{speechIssue=microphoneHelp(e.error?.name||'recording-error');stopAudioTracks();hearing=false;speechStatus='';speakingRefresh()};
  mediaRecorder.onstop=async()=>{stopAudioTracks();hearing=false;speechUploading=true;speechStatus='AI sesi metne dönüştürüyor...';speakingRefresh();try{const blob=new Blob(mediaChunks,{type:mediaRecorder.mimeType||mime||'audio/mp4'});heard=await sendAudioToWorker(blob);speechIssue='';speechStatus='Konuşma algılandı. Karşılaştırabilirsin.';}catch(e){speechIssue='AI ses çözümleme: '+String(e.message||e).slice(0,160);speechStatus='';}finally{mediaChunks=[];speechUploading=false;speakingRefresh();}};
  mediaRecorder.start();hearing=true;speechStatus='Dinliyorum... Bitirmek için tekrar dokun (en fazla 12 sn).';speakingRefresh();
  mediaTimeout=setTimeout(()=>{if(mediaRecorder?.state==='recording')mediaRecorder.stop()},12000);
 }catch(e){stopAudioTracks();hearing=false;speechStatus='';speechIssue=microphoneHelp(e.name||e.message);speakingRefresh();}
}
function startRecording(){
 if(state.settings.ai==='cloud'&&state.settings.worker&&state.settings.token){startCloudRecording();return;}
 if(hearing){try{recorder?.stop()}catch(e){}return;}
 if(microphoneBlocked){speechIssue=microphoneHelp('not-allowed');speakingRefresh();return;}
 const Rec=window.SpeechRecognition||window.webkitSpeechRecognition;
 if(!Rec){speechIssue='Tarayıcında konuşma tanıma yok. Klavyedeki mikrofonu kullan.';speakingRefresh();return;}
 try{speechIssue='';recorder=new Rec();recorder.lang='en-US';recorder.interimResults=false;recorder.continuous=false;recorder.onresult=e=>{heard=Array.from(e.results).map(r=>r[0].transcript).join(' ');hearing=false;speechStatus='Konuşma algılandı.';speakingRefresh()};recorder.onerror=e=>{hearing=false;speechStatus='';speechIssue=microphoneHelp(e.error);speakingRefresh()};recorder.onend=()=>{hearing=false;speakingRefresh()};recorder.start();hearing=true;speechStatus='Dinliyorum...';speakingRefresh();}catch(e){hearing=false;speechIssue=microphoneHelp(e.name||e.message);speakingRefresh();}
}
function checkSpeaking(){let l=LESSONS.find(x=>x.id===state.activeLesson)||currentLesson(),ref=l.examples[speakIndex%l.examples.length],a=clean(heard),b=clean(ref);if(!a){toast('Önce konuş veya bir cümle yaz.');return;}let r=new Set(b.split(' ')),s=new Set(a.split(' ')),hits=[...r].filter(x=>s.has(x)).length,ratio=Math.round(100*hits/Math.max(r.size,s.size));speakFeedback=ratio>=95?'Tüm kelimeler eşleşiyor. Güzel!':ratio>=65?`Kelime eşleşmesi yaklaşık %${ratio}. Öğretmenin cümlesini yeniden dinle ve tekrar et.`:`Kelime eşleşmesi yaklaşık %${ratio}. Örnek: ${ref}`;activity();renderSpeaking();}
function chatModes(){let ai=state.settings.ai;return ai==='device'?'iPhone üzerinde AI (deneysel)':ai==='cloud'?'Çevrimiçi gerçek AI':'Çevrimdışı hazır koç';}
function renderChat(){root.innerHTML=`<div class="eyebrow">Personal AI coach</div><h1>AI Öğretmen</h1><div class="row between"><span class="badge">${h(chatModes())}</span><button class="btn ghost" data-page="settings" style="min-height:35px;padding:7px 11px">Ayarla</button></div>
${state.settings.ai==='offline'?'<div class="warning">Bu mod gerçek üretken AI değildir. Önceden hazırlanmış kurallarla kısa geri bildirim verir. Serbest AI sohbeti için Ayarlar’dan iPhone AI veya güvenli sunucu modunu seç.</div>':''}
${state.settings.ai==='device'?`<div class="card"><strong>Yerel AI ${engine?'hazır':engineLoading?'yükleniyor':'henüz başlatılmadı'}</strong><p class="muted">${h(engineMessage||'İlk kullanımda yüzlerce MB model indirilir. Safari bellek hatası verebilir. İnternet ve yeterli depolama gerekir.')}</p><button class="btn secondary full" data-action="start-device" ${engineLoading||engine?'disabled':''}>${engine?'Model hazır':engineLoading?'Yükleniyor...':'Cihaz AI modelini yükle'}</button></div>`:''}
${state.settings.ai==='cloud'&&(!state.settings.worker||!state.settings.token)?'<div class="warning">AI henüz bağlı değil. Ayarlar → Cloudflare Worker adresi ve erişim kodunu gir → Bağlantıyı test et. Bu işlem tamamlanmadan sohbet gönderilemez.</div>':''}${chatError?`<div class="warning" role="alert">${h(chatError)}</div>`:''}
<div class="chatbox" id="chatbox">${state.chat.length?state.chat.slice(-35).map((m,i)=>`<div class="bubble ${m.role==='user'?'user':'assistant'}">${h(m.content)}<button class="bubble-save" data-action="memo-from-chat" data-index="${Math.max(0,state.chat.length-35)+i}" aria-label="Mesajı ezber listesine ekle">☆ Kaydet</button></div>`).join(''):`<div class="bubble assistant">Hello! 👋 I’m your English practice partner. Try: “I’m learning English now.” Türkçe de yazabilirsin. ${state.settings.ai==='offline'?'Bu modda sadece hazır koç cevapları vardır.':''}</div>`}</div>
<div class="composer"><textarea id="chat-input" class="field" placeholder="Write a message…" rows="2" maxlength="1200" aria-label="AI öğretmene mesaj">${h(chatDraft)}</textarea><button class="btn" data-action="send" ${isSending?'disabled':''}>${isSending?'…':'Gönder'}</button></div><p class="tiny">AI cevapları hatalı olabilir. Ders içeriği ve gerçek AI konuşmaları ayrı tutulur.</p>`;
let box=document.getElementById('chatbox');box.scrollTop=box.scrollHeight;}
function knownOfflineCoach(s){let x=clean(s);const known=[
[/\bi am work(?!ing)\b/,"‘I am work’ yerine **I am working** (şu anda) veya **I work** (genel alışkanlık) yaz. Example: I am working now."],
[/\bi am study\b/,"Güzel deneme! ‘I am study’ yerine **I study English every day** veya **I am studying English now** yaz."],
[/\bi am usually\b/,"Usually rutin gösterir. **I usually get up at 9 o’clock.** (I am usually get up değil.)"],
[/\bi go to home\b/,"‘Go to home’ değil, **go home** kullanılır. Example: I am going home."],
[/\bi can (swimming|speaking|working)\b/,"Can'den sonra yalın fiil gerekir: **I can swim / I can speak / I can work.**"],
[/\beveryday\b/,"Zaman zarfı olarak **every day** (iki kelime). ‘Everyday’ ise sıfattır."],
[/\bstaying at hotel\b/,"Doğal kullanım: **I am staying at a hotel.** (a hotel)"],
[/\bgut up\b/,"Fiil **get up** olmalı: **I usually get up at nine.**"],
[/\bi am from turkey\b/,"Great! ✅ **I am from Turkey.** Şimdi şunu dene: ‘I live in Istanbul.’"],
[/\bi am learning english\b/,"Great! ✅ **I am learning English.** Şimdiki zaman doğru. Şimdi ‘I study English every day’ yazmayı dene."],
[/\bi work every day\b/,"Great! ✅ **I work every day.** Rutin için Present Simple doğru. Şimdi ‘I am working now’ dene."],
[/\b(hello|hi)\b/,"Hello! 👋 How are you today? Try answering with a complete sentence: ‘I’m fine, thank you.’"],
[/\bhow are you\b/,"I'm doing well, thank you! Now tell me: **What do you do every day?**"],
[/\b(merhaba|selam)\b/,"Hello! 👋 Bugün ‘I am...’ yapısını çalışalım. Bana İngilizce olarak nereli olduğunu söyle."],
];for(let [re,msg] of known)if(re.test(x))return msg.replace(/\*\*/g,'');let l=currentLesson();return `Çevrimdışı koç şu anda sınırlı cümleleri kontrol edebiliyor.\n\nBugünkü konun: ${l.title}\n${l.rule}\n\nÖrnek: ${l.examples[0]}\n\nSerbest cevap ve ayrıntılı düzeltme için Ayarlar > Gerçek AI modunu kullan.`;}
function systemPrompt(){let l=currentLesson(),miss=Object.values(state.misses).sort((a,b)=>b.errors-a.errors).slice(0,6).map(m=>`${m.title} => ${m.answer}`).join(' | ');return `You are an expert private English tutor for a Turkish A0-A2 learner. You own the curriculum; choose the next exercise. Current lesson: ${l.level} ${l.title}. Grammar: ${l.rule}. Important earlier mistakes: ${miss||'none yet'}. Be patient but precise, supportive not flattering. Keep answers short, maximum 120 words. Teach in Turkish for grammar explanations; English for practice, gradually increase English. For each learner response: 1) correct concrete mistakes and give the improved sentence, 2) briefly explain why in Turkish, 3) ask ONE useful follow-up question in English. If correct say so accurately. Never falsely claim to have heard or rated pronunciation. Prefer realistic conversation, travel/work/gym topics. No request for private data or payment.`}
async function loadDeviceModel(){if(engine||engineLoading){return;}if(!navigator.gpu){engineMessage='Bu Safari sürümünde WebGPU kullanılamıyor.';renderChat();return;}engineLoading=true;engineMessage='WebLLM modülü alınıyor…';renderChat();try{let lib=await import('https://esm.sh/@mlc-ai/web-llm@0.2.81?bundle');if(!lib.CreateMLCEngine)throw Error('WebLLM yüklenemedi');engine=await lib.CreateMLCEngine('SmolLM2-360M-Instruct-q4f16_1-MLC',{initProgressCallback:p=>{engineMessage=p.text||('Model indiriliyor: %'+Math.round(p.progress*100));if(page==='chat')renderChat();}});engineMessage='Yerel AI hazır. Bu küçük model hatalı cevaplar verebilir.';}catch(e){engine=null;engineMessage='Model yüklenemedi: '+String(e.message||e).slice(0,160)+' — Çevrimiçi AI seçeneğini deneyebilirsin.';}finally{engineLoading=false;if(page==='chat')renderChat();}}
function workerAddressValid(value){try{let u=new URL(value);return u.protocol==='https:'&&!!u.hostname&&!u.username&&!u.password&&!u.search&&!u.hash&&u.pathname.replace(/\/$/,'')==='';}catch{return false;}}
async function sendChat(){
 if(isSending)return;
 let input=document.getElementById('chat-input'),val=input?.value.trim();if(!val)return;
 chatError='';
 if(state.settings.ai==='cloud'&&(!workerAddressValid(state.settings.worker)||!state.settings.token)){
  chatDraft=val;chatError='Gerçek AI henüz kurulmadı. Ayarlar’dan HTTPS Worker adresini ve erişim kodunu girip bağlantıyı test et.';renderChat();return;
 }
 if(state.settings.ai==='device'&&!engine){chatDraft=val;chatError='Önce cihaz AI modelini başlat.';renderChat();return;}
 isSending=true;chatDraft='';state.chat.push({role:'user',content:val.slice(0,1200)});state.chat=state.chat.slice(-70);renderChat();
 try{let answer;
  if(state.settings.ai==='offline'){answer=knownOfflineCoach(val);}
  else if(state.settings.ai==='device'){
   let messages=[{role:'system',content:systemPrompt()},...state.chat.slice(-10)];
   let result=await engine.chat.completions.create({messages,temperature:.65,max_tokens:260});answer=result.choices?.[0]?.message?.content||'Yanıt alınamadı.';
  }else if(state.settings.ai==='cloud'){
   let controller=new AbortController(),timer=setTimeout(()=>controller.abort(),40000);
   try{let r=await fetch(state.settings.worker,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+state.settings.token},body:JSON.stringify({messages:state.chat.slice(-10),context:{level:currentLesson().level,title:currentLesson().title,rule:currentLesson().rule,mistakes:Object.values(state.misses).sort((a,b)=>b.errors-a.errors).slice(0,5).map(m=>m.title+' => '+m.answer)}}),signal:controller.signal});let body=await r.json().catch(()=>({}));if(!r.ok)throw Error(body.error||('HTTP '+r.status));answer=body.reply||'';if(!answer)throw Error('AI boş yanıt döndürdü.');}finally{clearTimeout(timer)}
  }else throw Error('AI modu bilinmiyor.');
  state.chat.push({role:'assistant',content:String(answer).slice(0,2400)});activity();
 }catch(e){
  // Avoid polluting lesson chat with connection failures or losing the student's draft.
  if(state.chat.at(-1)?.role==='user'&&state.chat.at(-1)?.content===val.slice(0,1200))state.chat.pop();
  chatDraft=val;chatError='AI bağlantısı kurulamadı: '+String(e.message||e).slice(0,220);
 }finally{isSending=false;save();if(page==='chat')renderChat();}
}

function renderStats(){let done=completedCount(),acc=state.attempts?Math.round(state.correct/state.attempts*100):0,miss=Object.values(state.misses).filter(x=>x.errors>0).length;
root.innerHTML=`<div class="eyebrow">Progress & Review</div><h1>Gelişim paneli</h1><div class="grid2"><div class="kpi"><small>Tamamlanan ders</small><span class="num">${done}/24</span></div><div class="kpi"><small>Doğruluk</small><span class="num">%${acc}</span></div><div class="kpi"><small>Çözülen soru</small><span class="num">${state.attempts}</span></div><div class="kpi"><small>Çalışılan gün</small><span class="num">${state.days.length}</span></div></div><h2 class="section-title">Konu ilerlemesi</h2>${['A0','A1','A2'].map(l=>{let ls=LESSONS.filter(x=>x.level===l),d=ls.filter(x=>state.completed[x.id]?.score>=75).length;return `<div class="card"><div class="row between"><strong>${l}</strong><span class="muted">${d}/${ls.length} ders</span></div><div style="height:10px"></div><div class="progress"><div style="width:${d/ls.length*100}%"></div></div></div>`}).join('')}
<h2 class="section-title">AI konuşma geri bildirimleri</h2><div class="card"><p class="muted">${speakingSummary().total} incelenen cümle · ${speakingSummary().correct} uygun · ${speakingSummary().needsPractice} çalışma önerisi · ${speakingSummary().uncertain} belirsiz metin</p>${speakingSummary().patterns.length?`<strong>Tekrar edilmesi önerilen konular</strong><ul>${speakingSummary().patterns.slice(0,4).map(p=>`<li>${h(p.focus)} (${p.errors} kez)</li>`).join('')}</ul>`:'<p class="tiny">Konuşma koçunun değerlendirmeleri burada görünecek.</p>'}<button class="btn secondary full" data-page="speaking">Konuşma koçuna git</button></div><h2 class="section-title">Ödev ve öğretmen takibi</h2><div class="card"><p class="muted">${teacherHomeworkStats().done} tamamlanan ödev · ${teacherHomeworkStats().pending} bekleyen ödev</p><button class="btn secondary full" data-action="teacher-open-homework">Ödevlerimi gör →</button></div><h2 class="section-title">Ezber takibi</h2><div class="card"><p class="muted">${memoItems().length} kayıtlı ifade · ${memoDue().length} tekrarlanacak kart · ${state.memoReviewed||0} kart çalışması</p><button class="btn secondary full" data-page="memo">Ezber defterimi aç</button></div><h2 class="section-title">Aralıklı tekrar</h2><div class="card"><p class="muted">Yanlış cevapladığın ${miss} soru takip ediliyor. Doğru tekrarlar sorunun bir sonraki tekrar tarihini ileri taşır.</p><button class="btn full" data-action="review">Bugünkü tekrarları çöz (${dueQuestions().length})</button></div><p class="tiny">İlerleme istatistikleri yalnızca iPhone'unun tarayıcı deposundadır. Veri kaybı riskine karşı Ayarlar'dan yedek al.</p>`;}
function renderSettings(){root.innerHTML=`<div class="eyebrow">Preferences & Privacy</div><h1>Ayarlar</h1><div class="card"><h3>AI çalışma modu</h3><p class="muted">Gerçek AI kullanımı için cihaz modeli ya da güvenli sunucu gereklidir.</p><label class="label" for="ai-mode">Öğretmen modu</label><select class="field" id="ai-mode"><option value="offline" ${state.settings.ai==='offline'?'selected':''}>Çevrimdışı hazır koç (AI değil)</option><option value="device" ${state.settings.ai==='device'?'selected':''}>iPhone'da küçük gerçek AI (deneysel)</option><option value="cloud" ${state.settings.ai==='cloud'?'selected':''}>Ücretsiz Cloudflare gerçek AI</option></select><p class="tiny">Cihaz AI modu: ilk indirmenin büyüklüğü yüzlerce MB; Safari/WebGPU desteği ve hafıza kısıtlarına bağlıdır. Çevrimiçi mod: metinler ücretsiz Workers AI servisine gider; günlük ücretsiz kota aşılırsa sohbet durur.</p><div class="card" style="margin:12px 0"><p class="muted">Cloudflare’a ekleyeceğin <strong>ALLOWED_ORIGIN</strong>:</p><p class="tiny" style="overflow-wrap:anywhere"><code>${h(location.origin)}</code></p><button class="btn secondary" data-action="copy-origin">Adresi kopyala</button></div><label class="label" for="worker">Worker HTTPS adresi (çevrimiçi mod)</label><input class="field" id="worker" type="url" placeholder="https://...workers.dev" value="${h(state.settings.worker)}" autocomplete="off"/><div style="height:10px"></div><label class="label" for="token">Kişisel Worker erişim kodu</label><input class="field" id="token" type="password" autocomplete="off" placeholder="API anahtarı değil; kendin belirlediğin erişim kodu" value="${h(state.settings.token)}"/><div style="height:12px"></div><button class="btn secondary full" data-action="test-worker">✓ Gerçek AI bağlantısını test et</button><div id="connection-test" class="tiny" role="status"></div></div>
<div class="card"><h3>Sesli eğitim</h3><label class="label" for="voice-rate">Okuma hızı: ${state.settings.voiceRate}x</label><input id="voice-rate" type="range" min="0.65" max="1.2" step="0.05" value="${state.settings.voiceRate}" style="width:100%"><p class="muted">iPhone'da bulunan İngilizce seslerden kadın sesine öncelik verilir. Tam olarak hangi sesin seçileceği yüklü iOS seslerine bağlıdır.</p><button class="btn secondary" data-action="test-voice">▶ Ses testini dinle</button></div>
<button class="btn full" data-action="save-settings">Ayarları kaydet</button><h2 class="section-title">Verilerim</h2><div class="card"><p class="muted">Tüm öğrenme kayıtları cihazındaki tarayıcıda saklanır. iOS depolama temizliği bu verileri silebilir; yedek almanı öneririm.</p><div class="grid2"><button class="btn secondary" data-action="export">Yedek indir</button><button class="btn secondary" data-action="import">Yedek yükle</button></div><input type="file" id="import-file" accept=".json,application/json" style="display:none"/><div style="height:16px"></div><button class="btn danger full" data-action="clear-progress">Tüm ilerlemeyi sıfırla</button></div><div class="card"><h3>iPhone uyumluluk kontrolü</h3><p class="muted">Ses, depolama ve iPhone üzerinde AI çalıştırma desteğini kontrol et.</p><button class="btn secondary full" data-action="diagnostics">Telefonumu kontrol et</button><div id="diagnostic-results"></div></div><div class="foot">English AI Teacher 2.9.2 · Developer: Ali Erkonak</div>`;
const f=document.getElementById('import-file');f.addEventListener('change',importBackup);}
function runDiagnostics(){let tests=[['Güvenli HTTPS bağlantısı',location.protocol==='https:'?'Uygun':'HTTPS yayın gerekir'],['Tarayıcı depolaması',(()=>{try{localStorage.setItem('__eai_test','ok');let ok=localStorage.getItem('__eai_test')==='ok';localStorage.removeItem('__eai_test');return ok?'Uygun':'Kullanılamıyor'}catch(e){return 'Kullanılamıyor'}})()],['İngilizce ses sentezi',typeof window.speechSynthesis!=='undefined'?'Mevcut':'Desteklenmiyor'],['Mikrofondan konuşma tanıma',window.SpeechRecognition||window.webkitSpeechRecognition?'API mevcut, izin ve iOS desteği test edilmeli':'Klavye diktesi önerilir'],['Yerel AI WebGPU',navigator.gpu?'Destek var; model ayrıca denenmeli':'Destek bulunamadı'],['Çevrimdışı uygulama altyapısı','serviceWorker'in navigator?'Destek var':'Desteklenmiyor']];let el=document.getElementById('diagnostic-results');if(el)el.innerHTML='<div class="line"></div>'+tests.map(([k,v])=>`<p class="muted"><strong>${h(k)}:</strong> ${h(v)}</p>`).join('');}
async function testWorkerConnection(){let el=document.getElementById('connection-test');let url=document.getElementById('worker')?.value.trim().replace(/\/$/,''),token=document.getElementById('token')?.value.trim();if(!el)return;if(!workerAddressValid(url)||!token){el.textContent='HTTPS Worker adresini ve erişim kodunu gir.';return;}el.textContent='Bağlantı kontrol ediliyor...';const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);try{let r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},body:JSON.stringify({action:'ping'}),signal:controller.signal});let data=await r.json().catch(()=>({}));if(!r.ok)throw Error(data.error||('HTTP '+r.status));if(!data.ok)throw Error('Worker geçerli yanıt vermedi.');el.textContent='✓ Bağlantı başarılı. AI binding ve erişim kodu doğrulandı. Şimdi Ayarları kaydet.';}catch(e){el.textContent='Bağlantı testi başarısız: '+String(e.message||e).slice(0,180);}finally{clearTimeout(timer);}}
function saveSettings(){let mode=document.getElementById('ai-mode').value,url=document.getElementById('worker').value.trim().replace(/\/$/,''),token=document.getElementById('token').value.trim(),rate=Number(document.getElementById('voice-rate').value);if(url&&!workerAddressValid(url)){toast('Worker adresi https:// ile başlamalı.');return;}state.settings={ai:mode,worker:url,token,autoplay:false,voiceRate:rate};save();toast('Ayarlar kaydedildi.');renderSettings();directorMaybePlan();}
function exportBackup(){let data=JSON.parse(JSON.stringify(state));data.settings.token='';let payload={app:'english-ai-teacher',version:1,exported:new Date().toISOString(),data};let blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='EnglishAI_yedek_'+TODAY()+'.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),3000);}
async function importBackup(e){let file=e.target.files?.[0];if(!file)return;try{if(file.size>2e6)throw Error('Dosya çok büyük.');let obj=JSON.parse(await file.text());if(obj.app!=='english-ai-teacher'||obj.version!==1||!obj.data||typeof obj.data.completed!=='object'||!Array.isArray(obj.data.chat))throw Error('Bu bir English AI yedeği değil.');if(!confirm('Mevcut kayıtların yedek ile değiştirilecek. Devam edilsin mi?'))return;state={...defaultState(),...obj.data,settings:{...defaultState().settings,...obj.data.settings}};save();go('home');toast('Yedek geri yüklendi.');}catch(err){toast('Yedek okunamadı: '+String(err.message||err).slice(0,80));}}
function clearProgress(){if(!confirm('Tüm ders ilerlemen, ezber kartların ve sohbetlerin silinecek. Emin misin?'))return;if(!confirm('Bu işlem geri alınamaz. Devam etmek istiyor musun?'))return;let settings=state.settings;state=defaultState();state.settings=settings;save();go('home');toast('İlerleme sıfırlandı.');}
document.addEventListener('input',e=>{if(e.target.id==='coach-answer')coachRememberDraft(e.target.value);if(e.target.matches('[data-hw-answer]'))teacherInputUpdate(e.target);if(e.target.id==='teacher-student-reply')teacherDraftUpdate(e.target.value)});document.addEventListener('change',e=>{if(e.target.matches('input[name^="hw-"]'))teacherInputUpdate(e.target)});
document.addEventListener('click',async e=>{let el=e.target.closest('[data-action],[data-page]');if(!el)return;if(el.dataset.page){const dest=el.dataset.page;go(dest);if(dest==='speaking'&&speakMode==='live'&&!live.active&&liveReady())liveStart();return;}let a=el.dataset.action;switch(a){
case 'director-open':directorGo();break;
case 'coach-start':await coachStart(LESSONS.find(x=>x.id===state.activeLesson)||currentLesson());break;
case 'coach-restart':await coachStart(LESSONS.find(x=>x.id===state.activeLesson)||currentLesson(),true);break;
case 'coach-retry':{const l=LESSONS.find(x=>x.id===state.activeLesson)||currentLesson();if(coachPending?.phase==='answer')await coachSubmit(l);else await coachStart(l,false);break;}
case 'coach-submit':await coachSubmit(LESSONS.find(x=>x.id===state.activeLesson)||currentLesson());break;
case 'director-refresh':await directorRefresh(true);break;
case 'director-step':{const target=el.dataset.target;if(target==='homework'){teacherOpenHomework();}else if(target==='lesson'){state.activeLesson=directorDecision().lesson.id;save();go('lesson');}else if(['memo','speaking','chat'].includes(target))go(target);break;}
case 'hero-greeting':say(directorDecision().plan.message,'tr');break;
case 'continue':state.activeLesson=currentLesson().id;save();go('lesson');break;
case 'teacher-do-recommendation':{const rec=teacherRecommendedLesson();if(rec.type==='homework'){state.activeHomework=rec.lesson.id;save();go('homework')}else if(rec.type==='review')reviewQuiz();else{state.activeLesson=rec.lesson.id;save();go('lesson')}break;}
case 'teacher-open-homework':teacherOpenHomework();break;
case 'teacher-back-lesson':state.activeLesson=state.activeHomework||currentLesson().id;save();go('lesson');break;
case 'teacher-submit-homework':await teacherSubmitHomework();break;
case 'teacher-explain':await teacherExplain();break;
case 'teacher-reply':await teacherReply();break;
case 'teacher-save-explain':{const l=LESSONS.find(x=>x.id===state.activeLesson)||currentLesson(),exp=state.tutorExplanations?.[l.id];if(exp){memoForm={front:l.title,back:exp.text.slice(0,300),source:'AI konu anlatımı'};go('memo')}break;}
case 'daily-toggle':if(el.dataset.kind==='homework'){teacherOpenHomework();break;}completeDaily(el.dataset.kind);break;
case 'memo-new':memoForm={front:'',back:'',example:'',source:'Kişisel'};renderMemo();break;
case 'memo-close':memoForm=null;renderMemo();break;
case 'memo-save':memoSaveForm();break;
case 'memo-from-lesson':saveMemoFromLesson(el.dataset.text);break;
case 'memo-from-chat':saveMemoFromChat(Number(el.dataset.index));break;
case 'memo-filter':memoFilter=['due','weak','all'].includes(el.dataset.kind)?el.dataset.kind:'due';renderMemo();break;
case 'memo-pro-add':memoProAddSuggested();break;
case 'memo-edit':{let c=memoById(el.dataset.id);if(c){memoForm={...c};renderMemo()}break;}
case 'memo-delete':{let c=memoById(el.dataset.id);if(c&&confirm('Bu ezber kartını silmek istiyor musun?')){state.flashcards=state.flashcards.filter(x=>x.id!==c.id);save();renderMemo();}break;}
case 'memo-review':{let ids=memoDue().sort((a,b)=>Number(memoProWeak(b))-Number(memoProWeak(a))||(a.due||0)-(b.due||0)).slice(0,15).map(x=>x.id);if(ids.length){memoSession={ids,index:0,revealed:false,answer:''};renderMemo();}break;}
case 'memo-reveal':if(memoSession){memoSession.answer=document.getElementById('memo-typed')?.value?.trim().slice(0,300)||'';memoSession.revealed=true;renderMemo()}break;
case 'memo-grade':if(memoSession){memoGrade(memoById(memoSession.ids[memoSession.index]),el.dataset.kind);memoSession.index++;memoSession.revealed=false;memoSession.answer='';if(memoSession.index>=memoSession.ids.length){memoSession=null;renderMemo();toast('Bugünkü ezber tekrarın tamamlandı!')}else renderMemo();}break;
case 'memo-stop':memoSession=null;renderMemo();break;
case 'open-lesson':{let idx=Number(el.dataset.index);if(!lessonUnlocked(idx))return;state.activeLesson=LESSONS[idx].id;save();go('lesson');break;}
case 'start-lesson-quiz':startLessonQuiz();break;
case 'choose':if(!quiz?.submitted){quiz.selected=quiz.questions[quiz.index].options[Number(el.dataset.index)];renderQuiz();}break;
case 'submit-answer':submitAnswer();break;
case 'next-question':nextQuestion();break;
case 'repeat-quiz':if(quiz.kind==='lesson')startLessonQuiz();else reviewQuiz();break;
case 'finish-quiz':{let l=quiz?.lesson,passed=quiz&&quiz.score/quiz.questions.length>=.75;quiz=null;if(l&&passed&&!flowLegacyPassed(l)){flowOpenTalk(l)}else if(l&&passed){state.activeLesson=nextLesson().id;save();go('lesson')}else if(l){state.activeLesson=l.id;save();go('lesson')}else go('stats');break;}
case 'review':reviewQuiz();break;
case 'speak':say(el.dataset.text);break;
case 'play-phrase':{let l=LESSONS.find(x=>x.id===state.activeLesson)||currentLesson();say(l.examples[speakIndex%l.examples.length]);break;}
case 'record':startRecording();break;
case 'voice-live':speakMode='live';renderSpeaking();if(!live.active&&liveReady())liveStart();break;
case 'voice-phrase':liveEnd(true);speakMode='phrase';renderSpeaking();break;
case 'flow-talk':flowOpenTalk(LESSONS.find(x=>x.id===state.activeLesson)||currentLesson());if(page==='speaking'&&!live.active&&liveReady())liveStart();break;
case 'live-start':await liveStart();break;
case 'live-auto':liveToggleAuto();break;
case 'live-lang-en':liveSetInputLanguage('en');break;
case 'live-lang-tr':liveSetInputLanguage('tr');break;
case 'live-captions':liveToggleCaptions();break;
case 'live-record':liveCapture();break;
case 'live-audio-retry':await liveRetryAudio();break;
case 'live-stop':liveEnd(false);break;
case 'live-done':liveFinishSentence();break;
case 'live-explain':await liveAsk('Son cevabını basit Türkçe ile açıkla; sonra kısa İngilizce örnek ver.');break;
case 'live-repeat':liveRepeat();break;
case 'live-slower':liveSetSlow();break;
case 'live-send':await liveSendTyped();break;
case 'live-memo':liveSaveToMemo();break;
case 'live-reset':liveReset();break;
case 'live-retry':await liveRetry();break;
case 'live-discard':liveDiscard();break;
case 'live-practice':await livePracticeFocus();break;
case 'focus-dictation':document.getElementById('heard')?.focus();break;
case 'copy-origin':navigator.clipboard?.writeText(location.origin).then(()=>toast('Uygulama adresi kopyalandı.')).catch(()=>toast('Adresi seçip kopyalayabilirsin.'));break;
case 'test-worker':await testWorkerConnection();break;
case 'check-speak':checkSpeaking();break;
case 'next-phrase':{let l=LESSONS.find(x=>x.id===state.activeLesson)||currentLesson();speakIndex=(speakIndex+1)%l.examples.length;heard='';speakFeedback='';speechStatus='';speechIssue='';renderSpeaking();break;}
case 'send':await sendChat();break;
case 'start-device':await loadDeviceModel();break;
case 'save-settings':saveSettings();break;
case 'test-voice':say('Hello! I am your English teacher. Let us learn together.');break;
case 'diagnostics':runDiagnostics();break;
case 'export':exportBackup();break;
case 'import':document.getElementById('import-file')?.click();break;
case 'clear-progress':clearProgress();break;
}});
if('serviceWorker'in navigator&&(location.protocol==='https:'||['localhost','127.0.0.1'].includes(location.hostname))){navigator.serviceWorker.register('./sw.js').catch(e=>console.warn('Offline cache:',e));}
render();
directorMaybePlan();

// Persist direction without modifying legacy vocabulary records.
document.addEventListener('change',e=>{if(e.target?.id==='memo-direction'){
 const value=e.target.value; if(value==='en-tr'||value==='tr-en'){memoProSettings().direction=value;save();}
}});
