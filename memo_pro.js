'use strict';
// v2.9.3 – local-first spaced repetition and guided vocab suggestions. Developer: Ali Erkonak.
// Existing state.flashcards and storage key remain unchanged.
const MEMO_STARTER=[
 ['Hello!','Merhaba!','Hello! How are you?','A0'],
 ['Good morning.','Günaydın.','Good morning! How are you?','A0'],
 ['Thank you.','Teşekkür ederim.','Thank you for your help.','A0'],
 ['Please.','Lütfen.','A glass of water, please.','A0'],
 ['Excuse me.','Affedersiniz.','Excuse me, where is the station?','A0'],
 ['My name is...','Benim adım...','My name is Ali.','A0'],
 ['I am from Turkey.','Türkiye’denim.','I am from Turkey.','A0'],
 ['How are you?','Nasılsın?','How are you today?','A0'],
 ['I am fine.','İyiyim.','I am fine, thank you.','A0'],
 ['What is your name?','Adın ne?','What is your name?','A0'],
 ['I do not understand.','Anlamıyorum.','Sorry, I do not understand.','A0'],
 ['Can you repeat that?','Tekrar eder misiniz?','Can you repeat that, please?','A0'],
 ['I need help.','Yardıma ihtiyacım var.','I need help with this.','A0'],
 ['I am learning English.','İngilizce öğreniyorum.','I am learning English now.','A1'],
 ['I usually get up at nine.','Genellikle dokuzda kalkarım.','I usually get up at nine.','A1'],
 ['I work every day.','Her gün çalışırım.','I work every day.','A1'],
 ['I am working now.','Şu anda çalışıyorum.','I am working now.','A1'],
 ['Could you help me?','Bana yardım edebilir misiniz?','Could you help me, please?','A2'],
 ['I would like to book a room.','Bir oda ayırtmak istiyorum.','I would like to book a room.','A2'],
 ['My flight has been delayed.','Uçağım gecikti.','My flight has been delayed.','A2'],
 ['In my opinion,...','Bana göre,...','In my opinion, practice is essential.','B1'],
 ['On the other hand,...','Öte yandan,...','On the other hand, it is expensive.','B1'],
 ['We need to meet the deadline.','Son teslim tarihine yetişmeliyiz.','We need to meet the deadline.','B2'],
 ['Could you clarify that point?','Bu noktayı netleştirir misiniz?','Could you clarify that point?','B2'],
 ['I would like to propose an alternative.','Bir alternatif önermek istiyorum.','I would like to propose an alternative.','C1'],
 ['The evidence suggests that...','Kanıtlar şunu gösteriyor ki...','The evidence suggests that more research is needed.','C1'],
 ['Correlation does not imply causation.','Korelasyon nedensellik anlamına gelmez.','Correlation does not imply causation.','C2']
];
function memoProSettings(){if(!state.memoProSettings||typeof state.memoProSettings!=='object')state.memoProSettings={direction:'tr-en',limit:15};return state.memoProSettings;}
function memoProWeak(c){let reviews=Number(c.reviews)||0,correct=Number(c.correct)||0;return c.lastGrade==='again'||c.lastGrade==='hard'||(reviews>=2&&correct/reviews<.7&&Number(c.repetitions||c.stage||0)<3);}
function memoProStats(){let all=memoItems(),now=Date.now();return {total:all.length,due:all.filter(c=>!Number.isFinite(c.due)||c.due<=now).length,weak:all.filter(memoProWeak).length,mastered:all.filter(c=>Number(c.repetitions||c.stage||0)>=4).length};}
function memoProCandidates(){
 const allowed=new Set();const current=LESSONS.findIndex(l=>l.id===currentLesson().id);
 for(let i=Math.max(0,current-2);i<=current&&i<LESSONS.length;i++)if(i===current||state.completed[LESSONS[i].id]?.score>=75)allowed.add(LESSONS[i].id);
 const rows=[];let level=currentLesson().level;
 for(const [front,back,example,levelTag] of MEMO_STARTER){if(levelTag==='A0'||levelTag==='A1'&&['A1','A2','B1','B2','C1','C2'].includes(level)||levelTag===level)rows.push({front,back,example,source:'Temel kelimeler · '+levelTag});}
 for(const l of LESSONS){if(!allowed.has(l.id))continue;
  const guide=LESSON_GUIDES[l.id]||{};for(let i=0;i<l.examples.length;i++){
   const meaning=guide.meanings?.[i]|| (i===0?l.tr:'');if(meaning)rows.unshift({front:l.examples[i],back:meaning,example:'',source:l.title});
  }
 }
 const existing=new Set(memoItems().map(c=>clean(c.front)));return rows.filter(c=>!existing.has(clean(c.front))).slice(0,8);
}
function memoProAddSuggested(){let items=memoProCandidates();let added=0;
 for(const r of items){const result=memoAdd(r.front,r.back,r.source,r.example);if(result.item)added++;}
 save();renderMemo();toast(added+' açıklamalı ezber kartı eklendi.');
}
function memoProGrade(c,kind){if(!c)return;
 const now=Date.now();const prior=Number(c.interval)||0;
 c.reviews=(Number(c.reviews)||0)+1;c.lastReviewed=now;
 let ease=Math.max(1.3,Math.min(3.5,Number(c.ease)||2.5));let rep=Number(c.repetitions||c.stage||0);
 if(kind==='again'){c.lapses=(Number(c.lapses)||0)+1;rep=0;ease=Math.max(1.3,ease-.2);c.interval=10/1440;}
 else if(kind==='hard'){ease=Math.max(1.3,ease-.15);c.interval=Math.max(1,Math.ceil(prior*1.2));}
 else if(kind==='easy'){rep++;ease=Math.min(3.5,ease+.15);c.correct=(Number(c.correct)||0)+1;c.interval=Math.max(4,Math.round((prior||1)*(rep<2?4:ease*1.3)));}
 else{rep++;c.correct=(Number(c.correct)||0)+1;c.interval=rep===1?1:rep===2?3:Math.max(4,Math.round(Math.max(1,prior)*ease));}
 c.interval=Math.min(365,c.interval);c.repetitions=rep;c.stage=Math.min(8,rep);c.ease=ease;c.due=now+c.interval*86400000;c.lastGrade=kind;
 state.memoReviewed=(Number(state.memoReviewed)||0)+1;
 if(typeof activity==='function')activity();save();
}
function memoProPanel(){let stats=memoProStats();const suggest=memoProCandidates(),settings=memoProSettings();
 return `<section class="premium-panel memo-pro-panel"><h2>Akıllı ezber koçu</h2><p class="muted">Tekrarları kartın zorluğuna göre planlar. Zorlandığın kartları daha erken görürsün; hazır cümleleri Türkçe anlamlarıyla ekleyebilirsin.</p>
 <div class="memo-pro-stats"><div><strong>${stats.weak}</strong><small>Zayıf kart</small></div><div><strong>${stats.mastered}</strong><small>İlerleyen kart</small></div><div><strong>${stats.due}</strong><small>Tekrar bekleyen</small></div></div>
 <div class="memo-pro-setting"><label for="memo-direction">Çalışma yönü</label><select id="memo-direction" class="field" data-change="memo-direction"><option value="tr-en" ${settings.direction==='tr-en'?'selected':''}>Türkçe → İngilizce (aktif hatırlama)</option><option value="en-tr" ${settings.direction==='en-tr'?'selected':''}>İngilizce → Türkçe</option></select></div>
 ${suggest.length?`<div class="memo-pro-suggestions"><p><strong>Öğretmeninin kelime önerileri</strong></p>${suggest.slice(0,4).map(x=>`<div class="memo-pro-item"><span><b>${h(x.front)}</b><small>${h(x.back)}</small></span></div>`).join('')}<button class="btn secondary full" data-action="memo-pro-add">＋ ${suggest.length} kartı anlamlarıyla ekle</button></div>`:'<p class="tiny">Şu an önerilen yeni kart yok. Derslerden ☆ simgesiyle kart ekleyebilirsin.</p>'}
 <p class="tiny">Aralıklı tekrar cihaz üzerinde yürütülür. Otomatik kelime önerileri mevcut ders kaynaklarından gelir; AI tarafından doğrulanmamış yeni bir çeviri üretilmez.</p></section>`;
}
function memoProReviewPrompt(card,session){const dir=memoProSettings().direction;
 const trEn=dir==='tr-en'&&!!String(card.back||'').trim();
 const target=trEn?card.front:card.back;const prompt=trEn?card.back:card.front;
 return {prompt,target,label:trEn?'Türkçe → İngilizce':'İngilizce → Türkçe',trEn};
}
function memoProCheck(value,target){
 const alternatives=String(target||'').split(/\s*(?:;|\/)\s*/).filter(Boolean);
 return alternatives.some(expected=>answerMatches(value,expected));
}
function memoProReviewForm(card,session){const p=memoProReviewPrompt(card,session);
 const entered=session.answer||'';const checked=session.revealed?memoProCheck(entered,p.target):null;
 return `<div class="card memocard center memo-pro-review"><p class="eyebrow">${h(p.label)}</p><h2>${h(p.prompt)}</h2>${!p.trEn?`<button class="btn secondary" data-action="speak" data-text="${h(card.front)}">▶ İngilizceyi dinle</button>`:''}
 ${!session.revealed?`<label class="label" for="memo-typed">Hatırladığın karşılığı yaz</label><textarea class="field" id="memo-typed" rows="2" placeholder="Cevabını yaz; gerekirse klavyeden dikte kullan" spellcheck="false" autocapitalize="sentences">${h(entered)}</textarea>`:
 `<div class="memo-pro-result"><small>Senin cevabın</small><p>${h(entered||'Boş bırakıldı')}</p><small>Doğru karşılık</small><p><b>${h(p.target||'Anlam henüz eklenmedi')}</b></p><p class="tiny">${checked?'✓ Metin aynı görünüyor.': 'Birebir eşleşmedi. Anlamı doğru bir alternatifse kendin değerlendirebilirsin.'}</p>${card.example?`<p><small>Bağlam:</small> ${h(card.example)}</p>`:''}<button class="btn secondary" data-action="speak" data-text="${h(card.front)}">▶ İngilizce telaffuzu dinle</button></div>`}
 </div>`;
}
