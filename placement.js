'use strict';
// Original 28-question placement bank: grammar, vocabulary, reading and synthetic listening.
// Developer: Ali Erkonak
const PLACEMENT_LEVELS=['A0','A1','A2','B1','B2','C1','C2'];
const PLACEMENT_QUESTIONS=[
 {
  "level": "A0",
  "kind": "grammar",
  "prompt": "I ___ a student.",
  "options": [
   "am",
   "are",
   "is",
   "be"
  ],
  "answer": "am",
  "audio": null,
  "why": "I öznesi ile am kullanılır."
 },
 {
  "level": "A0",
  "kind": "vocab",
  "prompt": "Good morning ne anlama gelir?",
  "options": [
   "Günaydın",
   "İyi geceler",
   "Güle güle",
   "Teşekkürler"
  ],
  "answer": "Günaydın",
  "audio": null,
  "why": "Good morning sabah selamıdır."
 },
 {
  "level": "A0",
  "kind": "reading",
  "prompt": "“My name is Tom. I am from Spain.” Tom nereli?",
  "options": [
   "Spain",
   "Turkey",
   "Italy",
   "France"
  ],
  "answer": "Spain",
  "audio": null,
  "why": "From Spain ifadesi ülkesini bildirir."
 },
 {
  "level": "A0",
  "kind": "listening",
  "prompt": "Dinle ve söylenen cümleyi seç.",
  "options": [
   "My name is Emma.",
   "I am tired.",
   "He is late.",
   "Good night."
  ],
  "answer": "My name is Emma.",
  "audio": "My name is Emma.",
  "why": "Söylenen cümle My name is Emma idi."
 },
 {
  "level": "A1",
  "kind": "grammar",
  "prompt": "She ___ to work every day.",
  "options": [
   "goes",
   "go",
   "going",
   "gone"
  ],
  "answer": "goes",
  "audio": null,
  "why": "He/she/it olumlu geniş zaman fiilinde -s/-es alır."
 },
 {
  "level": "A1",
  "kind": "vocab",
  "prompt": "“always” ne demek?",
  "options": [
   "Her zaman",
   "Nadiren",
   "Asla",
   "Bazen"
  ],
  "answer": "Her zaman",
  "audio": null,
  "why": "Always = her zaman."
 },
 {
  "level": "A1",
  "kind": "reading",
  "prompt": "“I usually get up at seven, but on Sunday I sleep until nine.” Pazar günü ne zaman kalkıyor?",
  "options": [
   "9",
   "7",
   "6",
   "8"
  ],
  "answer": "9",
  "audio": null,
  "why": "On Sunday I sleep until nine diyor."
 },
 {
  "level": "A1",
  "kind": "listening",
  "prompt": "Dinle ve duyduğun ifadeyi seç.",
  "options": [
   "I am working now.",
   "I work every day.",
   "She is cooking.",
   "We are ready."
  ],
  "answer": "I am working now.",
  "audio": "I am working now.",
  "why": "I am working now şimdiki zamanda."
 },
 {
  "level": "A2",
  "kind": "grammar",
  "prompt": "I ___ to London last year.",
  "options": [
   "went",
   "go",
   "have gone",
   "going"
  ],
  "answer": "went",
  "audio": null,
  "why": "Last year belirli geçmiş zamandır."
 },
 {
  "level": "A2",
  "kind": "vocab",
  "prompt": "“appointment” ne anlama gelir?",
  "options": [
   "Randevu",
   "Fatura",
   "Valiz",
   "Adres"
  ],
  "answer": "Randevu",
  "audio": null,
  "why": "Appointment = randevu."
 },
 {
  "level": "A2",
  "kind": "reading",
  "prompt": "“The bus leaves at 8:15, but it is delayed by 20 minutes.” Otobüs ne zaman hareket edecek?",
  "options": [
   "8:35",
   "8:15",
   "8:20",
   "8:05"
  ],
  "answer": "8:35",
  "audio": null,
  "why": "8:15 + 20 dakika = 8:35."
 },
 {
  "level": "A2",
  "kind": "listening",
  "prompt": "Dinle ve duyduğun ifadeyi seç.",
  "options": [
   "I have never been to Rome.",
   "I went to Rome yesterday.",
   "I will go tomorrow.",
   "I go to Rome often."
  ],
  "answer": "I have never been to Rome.",
  "audio": "I have never been to Rome.",
  "why": "Never been deneyim yokluğu belirtir."
 },
 {
  "level": "B1",
  "kind": "grammar",
  "prompt": "If I had more time, I ___ study more.",
  "options": [
   "would",
   "will",
   "can",
   "must"
  ],
  "answer": "would",
  "audio": null,
  "why": "Second conditional If + past, would + yalın fiil."
 },
 {
  "level": "B1",
  "kind": "vocab",
  "prompt": "“reliable” sözcüğüne en yakın anlam hangisidir?",
  "options": [
   "Güvenilir",
   "Pahalı",
   "Eski",
   "Yalnız"
  ],
  "answer": "Güvenilir",
  "audio": null,
  "why": "Reliable = güvenilir."
 },
 {
  "level": "B1",
  "kind": "reading",
  "prompt": "“Although the project was costly, it finished on time and met all targets.” Hangi ifade doğrudur?",
  "options": [
   "Proje pahalıydı ama başarılı tamamlandı.",
   "Proje gecikti.",
   "Hedefler kaçırıldı.",
   "Maliyeti düşüktü."
  ],
  "answer": "Proje pahalıydı ama başarılı tamamlandı.",
  "audio": null,
  "why": "Although karşıtlık gösteriyor."
 },
 {
  "level": "B1",
  "kind": "listening",
  "prompt": "Dinle ve duyduğun ifadeyi seç.",
  "options": [
   "The report was sent yesterday.",
   "The report is being written.",
   "The report will be sent.",
   "I sent an email."
  ],
  "answer": "The report was sent yesterday.",
  "audio": "The report was sent yesterday.",
  "why": "Was sent past passive yapı."
 },
 {
  "level": "B2",
  "kind": "grammar",
  "prompt": "If we had left earlier, we ___ the train.",
  "options": [
   "would have caught",
   "will catch",
   "would catch",
   "had catch"
  ],
  "answer": "would have caught",
  "audio": null,
  "why": "Third conditional geçmişte gerçekleşmemiş sonuca bakar."
 },
 {
  "level": "B2",
  "kind": "vocab",
  "prompt": "“mitigate” ne anlama gelir?",
  "options": [
   "Etkisini azaltmak",
   "Tamamen yok etmek",
   "Açıklamak",
   "Reddetmek"
  ],
  "answer": "Etkisini azaltmak",
  "audio": null,
  "why": "Mitigate = etkisini hafifletmek."
 },
 {
  "level": "B2",
  "kind": "reading",
  "prompt": "“The results suggest a correlation, yet they do not establish a causal link.” Hangi çıkarım yapılabilir?",
  "options": [
   "Nedensellik kanıtlanmamış.",
   "Neden kesin bulundu.",
   "İlişki yok.",
   "Veriler tamamen yanlış."
  ],
  "answer": "Nedensellik kanıtlanmamış.",
  "audio": null,
  "why": "Correlation is not proof of causation."
 },
 {
  "level": "B2",
  "kind": "listening",
  "prompt": "Dinle ve ifadeyi seç.",
  "options": [
   "She might have overlooked the detail.",
   "She must have finished yesterday.",
   "She has never visited.",
   "She is looking for details."
  ],
  "answer": "She might have overlooked the detail.",
  "audio": "She might have overlooked the detail.",
  "why": "Might have = geçmişe yönelik ihtimal."
 },
 {
  "level": "C1",
  "kind": "grammar",
  "prompt": "Never ___ such a compelling argument.",
  "options": [
   "have I heard",
   "I have heard",
   "did I heard",
   "I heard have"
  ],
  "answer": "have I heard",
  "audio": null,
  "why": "Never başta olduğunda devrik yapı gerekir."
 },
 {
  "level": "C1",
  "kind": "vocab",
  "prompt": "“nuanced” sözcüğünün en uygun açıklaması?",
  "options": [
   "İnce ayrımları gözeten",
   "Tamamen anlamsız",
   "Yalnızca resmî",
   "Kasıtlı hatalı"
  ],
  "answer": "İnce ayrımları gözeten",
  "audio": null,
  "why": "Nuanced ince farklılıkları yansıtır."
 },
 {
  "level": "C1",
  "kind": "reading",
  "prompt": "“The evidence appears persuasive at first glance; nevertheless, the sample lacks demographic diversity.” Yazarın temel çekincesi?",
  "options": [
   "Örneklemin temsiliyetinin sınırlı olması",
   "Bütün verilerin uydurma olması",
   "Deneyin hiç yapılmaması",
   "Sonucun kesin kanıtlanması"
  ],
  "answer": "Örneklemin temsiliyetinin sınırlı olması",
  "audio": null,
  "why": "Demographic diversity eksikliği genelleme sınırıdır."
 },
 {
  "level": "C1",
  "kind": "listening",
  "prompt": "Dinle ve duyduğun ifadeyi seç.",
  "options": [
   "Not only did she identify the flaw, but she resolved it.",
   "She identified no mistakes.",
   "She hardly looked at the problem.",
   "She will resolve it tomorrow."
  ],
  "answer": "Not only did she identify the flaw, but she resolved it.",
  "audio": "Not only did she identify the flaw, but she resolved it.",
  "why": "Not only başta devrik yapı getirir."
 },
 {
  "level": "C2",
  "kind": "grammar",
  "prompt": "Rarely ___ so much achieved with so few resources.",
  "options": [
   "has there been",
   "there has been",
   "there have been",
   "there being"
  ],
  "answer": "has there been",
  "audio": null,
  "why": "Rarely ile devrik yardımcı fiil gerekir."
 },
 {
  "level": "C2",
  "kind": "vocab",
  "prompt": "“equivocal” sözcüğünün en yakın anlamı?",
  "options": [
   "Birden çok yoruma açık",
   "Kesin ve tartışmasız",
   "Şeffaf ve basit",
   "Maddi değeri yüksek"
  ],
  "answer": "Birden çok yoruma açık",
  "audio": null,
  "why": "Equivocal = yoruma açık, belirsiz."
 },
 {
  "level": "C2",
  "kind": "reading",
  "prompt": "“The proposal is elegant in theory but assumes a degree of institutional coherence that the evidence scarcely warrants.” Temel eleştiri nedir?",
  "options": [
   "Varsaydığı kurumsal uyum yeterince kanıtlanmıyor.",
   "Öneri çok basit.",
   "Kurumsal uyum kesin var.",
   "Teori tamamen geçersiz."
  ],
  "answer": "Varsaydığı kurumsal uyum yeterince kanıtlanmıyor.",
  "audio": null,
  "why": "Scarcely warrants = kanıtın sınırlı biçimde desteklemesi."
 },
 {
  "level": "C2",
  "kind": "listening",
  "prompt": "Dinle ve duyduğun ifadeyi seç.",
  "options": [
   "I wouldn't be so quick to dismiss that possibility.",
   "I will certainly reject the idea.",
   "I do not understand the proposal.",
   "I have already approved the plan."
  ],
  "answer": "I wouldn't be so quick to dismiss that possibility.",
  "audio": "I wouldn't be so quick to dismiss that possibility.",
  "why": "İma ve nüansa dikkat edilir."
 }
];

function placementRequired(){return !state.placement?.level&&!Object.values(state.completed||{}).some(x=>Number(x?.score)>=75);}
function placementDraft(){if(!state.placementDraft||typeof state.placementDraft!=='object')state.placementDraft={levelIndex:0,question:0,correct:0,results:[],started:Date.now(),writing:''};return state.placementDraft;}
// Shuffle visible options once per question. Persist their order in the ongoing
// placement draft so Safari re-renders/reopens never move buttons mid-question.
// Original option indices are retained for grading and accessibility.
function placementDisplayOptions(question,draft){
 if(!draft.choiceOrders||typeof draft.choiceOrders!=='object')draft.choiceOrders={};
 const key=draft.levelIndex+':'+draft.question;
 const validOrder=x=>Array.isArray(x)&&x.length===question.options.length&&new Set(x).size===x.length&&x.every(v=>Number.isInteger(v)&&v>=0&&v<question.options.length);
 if(!validOrder(draft.choiceOrders[key])){
  const indices=question.options.map((_,i)=>i);
  for(let i=indices.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[indices[i],indices[j]]=[indices[j],indices[i]];}
  draft.choiceOrders[key]=indices;save();
 }
 return draft.choiceOrders[key].map(index=>({text:question.options[index],index}));
}
function placementLessonIndex(level){return Math.max(0,LESSONS.findIndex(l=>l.level===level));}
function placementResultChoice(grade,writing=''){
 const level=PLACEMENT_LEVELS[Math.max(0,Math.min(6,grade))];
 const history=placementDraft().results.slice();
 state.placement={level,startIndex:placementLessonIndex(level),assessedAt:Date.now(),source:'objective',provisional:true,history,writing:String(writing).slice(0,600),summary:`${level} başlangıç seviyesi önerildi. Bu bir ön yerleştirme; AI öğretmen konuşma ve yazma performansına göre öğrenme planını güncelleyecek.`};
 delete state.placementDraft;state.aiDirector=null;save();
}
function placementStart(){if(state.placement?.level&&!confirm('Seviye testini tekrar yapmak başlangıç seviyeni değiştirebilir. Önceki ders başarıların silinmez. Devam?'))return;
 state.placementDraft={levelIndex:0,question:0,correct:0,results:[],started:Date.now(),writing:''};save();go('placement');}
function placementChoose(answer){const d=placementDraft(),lvl=PLACEMENT_LEVELS[d.levelIndex],q=PLACEMENT_QUESTIONS.filter(x=>x.level===lvl)[d.question];if(!q)return;
 const passed=String(answer)===q.answer;d.correct+=Number(passed);
 d.results.push({level:lvl,kind:q.kind,correct:passed,at:Date.now()});
 d.question++;
 if(d.question>=4){const passedLevel=d.correct>=3;
  if(!passedLevel||d.levelIndex===6){d.candidate=Math.min(6,d.levelIndex+(passedLevel&&d.levelIndex===6?0:0));d.phase='writing';}
  else{d.levelIndex++;d.question=0;d.correct=0;}
 }
 save();renderPlacement();
}
function renderPlacementWelcome(){root.innerHTML=`<div class="placement-welcome"><span class="badge">✦ Kişisel eğitim başlangıcı</span><h1>İngilizce seviyeni birlikte belirleyelim</h1><p>Öğretmenin gramer, kelime, okuma ve dinleme sorularıyla başlangıç düzeyini belirleyecek. Sonra yazma örneğini AI inceleyebilecek. Derslerine uygun sıradan başlayacaksın.</p><div class="placement-illustration">🎧 <span>28 soruya kadar · yaklaşık 10–15 dakika</span></div><button class="btn full" data-action="placement-start">Seviye tespitine başla →</button><button class="btn secondary full" data-action="placement-zero">Sıfırdan (A0) başla</button><p class="tiny">Değerlendirme resmî CEFR sertifikası değildir. Mikrofon gerektirmez; dinleme için iPhone sesini aç.</p></div>`;}
function renderPlacement(){if(!state.placementDraft){renderPlacementWelcome();return;}
 const d=placementDraft();if(d.phase==='writing'){
  const lv=PLACEMENT_LEVELS[d.candidate||0];root.innerHTML=`<section class="placement-panel"><span class="badge">Son adım · Yazma örneği</span><h1>Biraz İngilizce yazalım</h1><p class="muted">Ön testte ${h(lv)} seviyesine ulaştın. Kendinden, rutininden veya görüşlerinden İngilizce 2–5 cümle yaz. AI, dilbilgisi ve açıklık açısından başlangıç planını daha iyi oluşturabilir.</p><textarea id="placement-writing" class="field" rows="5" maxlength="600" placeholder="My name is... I usually...">${h(d.writing||'')}</textarea><p class="tiny">Yazma örneğini göndermek isteğe bağlıdır. Cloudflare AI kapalıysa yalnızca test puanın kullanılır.</p><button class="btn full" data-action="placement-finish" ${placementBusy?'disabled':''}>${placementBusy?'AI değerlendiriyor…':'Seviyemi belirle ve dersime başla'}</button></section>`;return;
 }
 const lvl=PLACEMENT_LEVELS[d.levelIndex],q=PLACEMENT_QUESTIONS.filter(x=>x.level===lvl)[d.question];if(!q){d.phase='writing';renderPlacement();return;}
 const total=PLACEMENT_LEVELS.length*4, done=d.levelIndex*4+d.question;
 root.innerHTML=`<section class="placement-panel"><div class="premium-row"><span class="badge">Seviye tespiti · ${lvl}</span><span class="muted">${d.question+1}/4</span></div><div class="progress"><div style="width:${Math.round(done/total*100)}%"></div></div><h1>${q.kind==='listening'?'Dinleme':q.kind==='reading'?'Okuma':q.kind==='grammar'?'Dilbilgisi':'Kelime bilgisi'}</h1><h2 class="placement-prompt">${h(q.prompt)}</h2>${q.audio?`<button class="btn secondary full" data-action="placement-listen">🔊 İngilizce cümleyi dinle</button><p class="muted">Dinledikten sonra işaretle. Cümle yazılı gösterilmez.</p>`:''}<div class="placement-options">${placementDisplayOptions(q,d).map(o=>`<button class="placement-option" data-action="placement-answer" data-choice="${o.index}">${h(o.text)}</button>`).join('')}</div><p class="tiny">İstersen bilmediğin soruyu tahmin edebilirsin. Test sonucu öğrenme başlangıcını belirler; ders başarılarını değiştirmez.</p></section>`;
}
let placementBusy=false;
async function placementFinish(){if(placementBusy)return;const d=placementDraft(),candidate=d.candidate??d.levelIndex,writing=String(document.getElementById('placement-writing')?.value||'').trim().slice(0,600);d.writing=writing;save();
 placementBusy=true;renderPlacement();let ai=null;
 try{if(typeof directorReady==='function'&&directorReady()&&writing.length>=25){const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),40000);try{const res=await fetch(state.settings.worker,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+state.settings.token},body:JSON.stringify({action:'assess_placement',candidate:PLACEMENT_LEVELS[candidate],writing,history:d.results.slice(-28)}),signal:ctrl.signal});const out=await res.json();if(!res.ok)throw Error(out.error||'AI testi başarısız');ai=out.assessment;}finally{clearTimeout(timer);}}}catch(e){toast('AI yazı analizi alınamadı; ön test sonucu kullanılacak.');}
 finally{placementBusy=false;}
 const finalIndex=ai&&PLACEMENT_LEVELS.includes(ai.recommendedLevel)?Math.min(candidate,PLACEMENT_LEVELS.indexOf(ai.recommendedLevel)):candidate;
 placementResultChoice(finalIndex,writing);if(ai&&typeof ai.feedbackTr==='string'){state.placement.source='ai-assisted';state.placement.provisional=true;state.placement.summary=ai.feedbackTr.slice(0,350);state.placement.focus=String(ai.focus||'').slice(0,160);save();}
 state.activeLesson=currentLesson().id;save();go('home');toast('Başlangıç seviyen: '+state.placement.level+'. Ders planın hazır.');
}
function placementSetZero(){placementResultChoice(0);state.placement.source='user-A0';save();go('home');}
function placementOpen(){state.placementDraft=null;save();go('placement');}
function placementBanner(){if(!state.placement?.level)return `<section class="placement-banner"><strong>İlk adım: Seviye tespiti</strong><p>AI öğretmen doğru seviyeden başlamak için kısa bir ölçme yapacak.</p><button class="btn full" data-action="placement-open">Seviye tespitini başlat</button></section>`;
 return `<section class="placement-banner completed"><div><strong>Başlangıç seviyen: ${h(state.placement.level)}</strong><p>${h(state.placement.summary||'Öğretmen seviyene göre eğitimi yönlendiriyor.')}</p></div><button class="btn secondary" data-action="placement-start">Yeniden ölç</button></section>`;
}
