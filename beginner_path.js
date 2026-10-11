'use strict';
// v3.1.2: Teacher-led zero-assumption starter for the very first A0 lesson.
// Lesson history and formal pass criteria stay in their existing stores.
const STARTER_L01 = [
 {en:'Hello!',tr:'Merhaba!',title:'1. İlk kelimen: Hello',note:'İngilizce biriyle ilk karşılaştığında Hello! diyebilirsin. Önce dinle, sonra sen de söyle.',task:'Şimdilik sadece Hello! kelimesini tanı ve sesini dinle.',words:[['Hello','Merhaba']]},
 {en:'My name is Ali.',tr:'Benim adım Ali.',title:'2. Adını söyle',note:'My name is... = Benim adım... demektir. Ali yerine kendi adını koyabilirsin. Başka bir kelime bilmen gerekmiyor.',task:'Dinledikten sonra kendi adınla “My name is ...” söyle.',words:[['My','Benim'],['name','ad'],['is','Burada adı söyleyen cümleyi tamamlar']]},
 {en:'Nice to meet you.',tr:'Tanıştığıma memnun oldum.',title:'3. Kibarca karşılık ver',note:'Yeni biriyle tanıştığında Nice to meet you. diyebilirsin. Sözcükleri ilk başta tek tek çevirmek zorunda değilsin; bu bir kalıptır.',task:'Cümleyi dinle. Türkçesini hatırlamaya çalış.',words:[['Nice to meet you','Tanıştığıma memnun oldum (hazır kalıp)']]},
 {en:'How are you?',tr:'Nasılsın?',title:'4. Nasılsın diye sor',note:'How are you? = Nasılsın? Karşındaki kişinin nasıl olduğunu öğrenmek için sorarsın. Şimdilik cevap vermeyi zorunlu tutmuyoruz.',task:'Cümleyi dinle ve soru olduğunu fark et.',words:[['How','Nasıl'],['are','Bu soruda you ile kullanılan be fiili'],['you','Sen / siz']]}
];
const STARTER_MEANINGS={
 L03:['O bir öğretmen (erkek).','O evde (kadın).','Hava soğuk.','O benim erkek kardeşim.'],
 L04:['İyi misin?','Nerelisin?','Adın ne?','O burada mı (kadın)?']
};
function starterItems(l){
 if(!l||l.level!=='A0')return [];
 if(l.id==='L01')return STARTER_L01;
 const gloss=STARTER_MEANINGS[l.id]||LESSON_GUIDES[l.id]?.meanings||[];
 return (l.examples||[]).map((en,i)=>({en,tr:gloss[i],title:`${i+1}. ifadeyi öğren`,note:'Bu İngilizce ifadeyi önce Türkçe anlamıyla öğren. Sesini dinle, sonra kendin söyle.',task:'İngilizce ifadeyi dinle ve Türkçe karşılığını hatırla.'})).filter(x=>x.en&&x.tr);
}
function starterAvailable(l){return starterItems(l).length>=2;}
function starterStore(){if(!state.beginnerCourse||typeof state.beginnerCourse!=='object'||Array.isArray(state.beginnerCourse))state.beginnerCourse={};return state.beginnerCourse;}
function starterRecord(l){const s=starterStore(),id=l?.id||'L01';if(!s[id]||!Number.isInteger(s[id].step))s[id]={step:0,finished:false};return s[id];}
function starterDone(l){return !starterAvailable(l)||starterRecord(l).finished||Number(state.completed?.[l.id]?.score)>=75;}
function starterAdvance(){const l=LESSONS.find(x=>x.id===state.activeLesson)||currentLesson(),s=starterRecord(l),items=starterItems(l);if(s.finished)return;s.step=Math.min(items.length,s.step+1);s.finished=s.step>=items.length;
 if(s.finished&&l.id==='L01'){
  const old=state.coachSessions?.L01;
  if(old&&old.attempts===0&&!old.readyForQuiz){const first=starterCoachTurn(l,'start','',old);old.question=first.question;old.feedback=first.feedback;old.focus=first.focus;old.correction='';}
 }
 save();renderLesson();}
function starterRestart(){const l=LESSONS.find(x=>x.id===state.activeLesson)||currentLesson(),s=starterRecord(l);s.step=0;s.finished=false;save();renderLesson();}
function beginnerPathHtml(l){if(!starterAvailable(l))return '';
 const items=starterItems(l),s=starterRecord(l),done=starterDone(l),index=Math.max(0,Math.min(items.length-1,s.step)),x=items[index];
 return `<section class="premium-panel beginner-path" id="beginner-first" aria-label="Sıfırdan İngilizce öğrenme">
 <span class="badge">A0 · Gerçek başlangıç</span><h2>Önce öğren, sonra soru çöz</h2>
 <p class="muted">İngilizce bilmen beklenmiyor. Sana henüz göstermediğimiz kelimeyle sınav yapmayacağız. Her adımda Türkçe anlamı ve İngilizce sesini göreceksin.</p>
 ${!done?`<div class="beginner-count">${s.step+1} / ${items.length} temel ifade</div>
 <h3>${h(x.title)}</h3><p>${h(x.note)}</p>
 <div class="beginner-phrase"><strong lang="en">${h(x.en)}</strong><span>${h(x.tr)}</span><button type="button" class="btn secondary" data-action="speak" data-text="${h(x.en)}">▶ İngilizcesini dinle</button></div>
 ${x.words?.length?`<div class="beginner-words"><strong>Bu ifadede geçen sözcükler</strong>${x.words.map(w=>`<div><b>${h(w[0])}</b><span>${h(w[1])}</span></div>`).join('')}</div>`:''}<p class="beginner-task">${h(x.task)}</p><button class="btn full" data-action="starter-next">${s.step===items.length-1?'✓ Temel ifadeleri gördüm · Alıştırmaya geç':'Öğrendim, sonraki ifadeyi göster →'}</button>`:
 `<div class="beginner-ready"><strong>✓ Bu dersin temel ifadeleriyle tanıştın.</strong><p>Şimdi yalnızca aşağıda gördüğün bu ifadelerle kolay Türkçe yönlendirmeli alıştırmalara başlayabilirsin. İstersen tekrar dinle.</p></div>
 <div class="beginner-learned">${items.map(z=>`<div><button class="speakbtn" data-action="speak" data-text="${h(z.en)}">▶</button><strong lang="en">${h(z.en)}</strong><span>${h(z.tr)}</span></div>`).join('')}</div><button class="btn secondary" data-action="starter-restart">İfadeleri yeniden çalış</button>`}
 </section>`;
}
function starterLessonContent(l){if(!starterAvailable(l))return null;
 const items=starterItems(l);
 if(l.id!=='L01')return {source:'local',explanationTr:'Önce bu konunun kısa İngilizce ifadelerini Türkçe anlamlarıyla öğren. Her ifadeyi sesli dinle ve sonra kendin tekrar et. AI alıştırmalarına ancak bu örnekleri gördükten sonra geç.',steps:items.map((x,i)=>({title:x.title,explainTr:x.note,exampleEn:x.en,meaningTr:x.tr})),mistakes:[],vocabulary:items.map(x=>({en:x.en,tr:x.tr,example:x.en})),readingEn:items.map(x=>x.en).join(' '),readingQuestions:['İlk İngilizce ifadenin Türkçesi ne?'],listeningEn:items.map(x=>x.en).join(' '),writingTaskTr:'Yalnızca yukarıda öğrendiğin iki ifadeyi İngilizce olarak yaz.',speakingPromptEn:items[0].en};
 return {source:'local',explanationTr:'Selamlaşma günlük konuşmanın ilk adımıdır. İlk aşamada dört kısa ifade öğreneceksin. İngilizce cümleleri önce dinle, Türkçe anlamlarını gör, ardından tekrar et. Bunları öğrenmeden yeni İngilizce sorulara cevap vermen beklenmiyor.',steps:STARTER_L01.map(x=>({title:x.title,explainTr:x.note,exampleEn:x.en,meaningTr:x.tr})),mistakes:[{wrong:'My name Ali.',correct:'My name is Ali.',whyTr:'“Benim adım” demek için My name is ... yapısında is kullanılır.'}],vocabulary:[{en:'Hello',tr:'Merhaba',example:'Hello!'},{en:'My name is...',tr:'Benim adım...',example:'My name is Ali.'},{en:'Nice to meet you',tr:'Tanıştığıma memnun oldum',example:'Nice to meet you.'},{en:'How are you?',tr:'Nasılsın?',example:'How are you?'}],readingEn:'Hello! My name is Ali. Nice to meet you. How are you?',readingQuestions:['“Hello!” Türkçede ne anlama gelir?','“My name is Ali.” ne demektir?'],listeningEn:'Hello! My name is Ali. Nice to meet you. How are you?',writingTaskTr:'Önce “Hello!” yaz. Sonra “My name is ...” kalıbına kendi adını koy. İki kısa cümle yeterli.',speakingPromptEn:'Hello! What is your name?'};
}
// Deterministic first-turn guardrail: only previously taught greetings are assessed.
// The AI teacher remains available later; these foundation checks are intentionally
// offline, predictable and never claim to measure pronunciation.
function starterCoachTurn(l,phase,answer,session){if(!l||l.id!=='L01')return null;
 const prompts=['“Merhaba!” İngilizce nasıl söylenir?','“Benim adım Ali.” İngilizce nasıl yazılır?','“Tanıştığıma memnun oldum.” İngilizce nasıl söylenir?'];
 const expected=['Hello!','My name is Ali.','Nice to meet you.'];
 if(phase==='start')return {correct:null,feedback:'Dört kısa ifadeyi gördün. Şimdi yalnızca öğrendiğin ifadelerden soru soracağım. İlk soruyu Türkçe okuyabilirsin.',correction:'',focus:'Temel selamlaşma',question:prompts[0]};
 const at=Math.max(0,Math.min(2,Number(session?.streak)||0));
 const key=typeof answerKey==='function'?answerKey(answer):String(answer||'').toLowerCase().replace(/[.!?]/g,'').trim();
 const correct=at===0?['hello','hi'].includes(key):at===1?/^(?:my name is|i am|i'm) [\p{L}]+(?: [\p{L}]+){0,3}$/u.test(key):['nice to meet you',"it's nice to meet you"].includes(key);
 return {correct,feedback:correct?'Doğru! Bu ifade az önce gördüğün Türkçe anlamla eşleşiyor.':`Henüz sorun değil. Birlikte hatırlayalım: “${expected[at]}” = ${STARTER_L01[at].tr}. Yeniden deneyebilirsin.`,correction:correct?'':expected[at],focus:'Temel selamlaşma',question:correct?prompts[Math.min(2,at+1)]:`İpucu: “${expected[at]}”. Şimdi tekrar yaz: ${prompts[at]}`};
}
