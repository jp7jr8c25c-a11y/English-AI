"use strict";
// v3.1 — A0/A1/A2 independent practice/homework/exam pools + instructor guide.
// Developer: Ali Erkonak. Does not change stable lesson identifiers or user data.
const PRO_LEGACY_MEANINGS={"L03":["O bir öğretmendir.","O evdedir.","Hava soğuk.","O benim erkek kardeşim."],"L04":["İyi misin?","Nerelisin?","Adın ne?","O burada mı?"],"L05":["Her gün çalışırım.","İngilizce öğreniyorum.","Sen kahve içersin.","Eve giderim."],"L06":["O İstanbul’da çalışır.","O çay içer.","Çok yağmur yağar.","O İngilizce öğrenir."],"L07":["Çalışıyor musun?","O kahve sever mi?","Onlar futbol oynar mı?","O burada yaşar mı?"],"L08":["Sigara içmem.","O burada çalışmaz.","Biz et yemeyiz.","O Fransızca konuşmaz."],"L09":["Şu anda çalışıyorum.","İngilizce çalışıyorum.","O uyuyor.","Onlar yemek yiyor."],"L10":["Her sabah kahve içerim.","Şu anda kahve içiyorum.","Genellikle dokuzda kalkarım.","Eve gidiyorum."],"L11":["Yüzebilirim.","Bana yardım edebilir misin?","Çok iyi İngilizce konuşamam.","O araba kullanabilir."],"L12":["Bir arabam var.","Onun bir köpeği var.","Zamanımız var.","Biletin var mı?"],"L13":["Yakınlarda bir otel var.","İki sandalye var.","Eczane var mı?","Su yok."],"L14":["Saat dokuzda uyanırım.","Pazartesi çalışırım.","İstanbul’da yaşıyorum.","Oteldeyim."],"L15":["Dün yorgundum.","Evdeydik.","O mutlu muydu?","Geç kaldın."],"L16":["Dün çalıştım.","Beni aradın mı?","Dışarı çıkmadım.","O bir film izledi."],"L17":["Eve gittim.","Kahvaltı yaptım.","O bir film gördü.","Bilet satın aldık."],"L18":["Seyahat edeceğim.","Ders çalışacağız.","O telefon edecek.","Çalışacak mısın?"],"L19":["Sana yardım edeceğim.","Yarın yağmur yağacak.","Geç kalmayacağım.","Gelecek misin?"],"L20":["Bu telefon daha ucuz.","İngilizce artık daha kolay.","Bu otel daha pahalı.","Bugün daha iyi."],"L21":["Tayland’a gittim.","Hiç suşi denedin mi?","O hiç uçağa binmedi.","O filmi gördüm."],"L22":["Dinlenmelisin.","Çalışmak zorundayım.","Emniyet kemeri takmalısın.","Endişelenmemelisin."],"L23":["Zamanım olursa seni arayacağım.","Yağmur yağarsa evde kalacağız.","Boş olursam ders çalışacağım.","Pratik yaparsan gelişirsin."],"L24":["Giriş yapmak istiyorum.","Bana yardımcı olabilir misiniz?","Fiyatı ne kadar?","Tren istasyonu nerede?"]};
const PRO_LEVELS=new Set(['A0','A1','A2']);
const PRO_BANK_VERSION=1;
const PRO_BANK_CACHE={};
function proEnabled(l){return !!l&&PRO_LEVELS.has(l.level)&&!!PROFESSIONAL_NOTES[l.id]}
function proHash(s){let h=2166136261;for(const c of String(s)){h=Math.imul(h^c.charCodeAt(0),16777619)}return h>>>0}
function proMix(a,seed){let x=seed>>>0;const v=a.slice();for(let i=v.length-1;i>0;i--){x=(Math.imul(x,1664525)+1013904223)>>>0;const j=x%(i+1);[v[i],v[j]]=[v[j],v[i]]}return v}
function proPickWrong(values,correct,seed){const normalized=String(correct).toLowerCase().trim();let options=values.filter(v=>v&&String(v).toLowerCase().trim()!==normalized&&String(v).length<130);
 options=[...new Set(options)];return proMix(options,seed).slice(0,3);
}
function proQ(l,part,index,q,source){return {...q,key:`pro:${l.id}:${part}:${index}`,origin:part,focus:l.title,source:source||'Yapılandırılmış içerik'};}
function proBank(l){if(!proEnabled(l))return null;if(PRO_BANK_CACHE[l.id])return PRO_BANK_CACHE[l.id];
 const index=LESSONS.indexOf(l),neighbors=LESSONS.filter(x=>x.level===l.level&&x.id!==l.id&&Array.isArray(x.examples));
 const guide=LESSON_GUIDES[l.id]||{},unit=MASTER_LESSON_UNITS.find(x=>x.id===l.id);
 const samples=l.examples.map((en,i)=>({en, tr: unit?(i===0?unit.at:unit.bt):String((guide.meanings?.length?guide.meanings:(PRO_LEGACY_MEANINGS[l.id]||[]))[i]||'').trim()})).filter(x=>x.en&&x.tr&&x.en!==x.tr);
 const otherTranslations=neighbors.flatMap(x=>{const r=MASTER_LESSON_UNITS.find(y=>y.id===x.id);const g=LESSON_GUIDES[x.id]||{};return r?[r.at,r.bt]:g.meanings?.length?g.meanings:(PRO_LEGACY_MEANINGS[x.id]||[])}).filter(Boolean);
 const otherEnglish=neighbors.flatMap(x=>x.examples||[]).filter(Boolean);
 const exam=[],practice=[],homework=[];
 // Established validated questions are reserved for formal testing, not duplicated in homework.
 (l.questions||[]).forEach((q,i)=>exam.push(proQ(l,'exam',i,{type:q.type,q:q.q,options:(q.options||[]).slice(),answers:(q.answers||[]).slice(),why:q.why||l.rule},'Mevcut doğrulanmış soru')));
 samples.forEach((s,i)=>{
   const trChoices=[s.tr,...proPickWrong(otherTranslations,s.tr,proHash(l.id+':t:'+i))];
   const enChoices=[s.en,...proPickWrong(otherEnglish,s.en,proHash(l.id+':e:'+i))];
   if(trChoices.length>=3){
     exam.push(proQ(l,'exam',exam.length,{type:'choice',q:`“${s.en}” ifadesinin Türkçe anlamını seç.`,options:trChoices,answers:[s.tr],why:`${s.en} → ${s.tr}`},'Anlam ayırt etme'));
     exam.push(proQ(l,'exam',exam.length,{type:'choice',q:`▶ Dinleme görevi ${i+1}: Duyduğun cümlenin Türkçesini seç.`,listenText:s.en,options:trChoices,answers:[s.tr],why:`Dinlenen ifade: ${s.en} — ${s.tr}`},'Dinlediğini anlama (iOS sesi)'));
     practice.push(proQ(l,'practice',practice.length,{type:'choice',q:`Bu İngilizce cümlenin anlamını düşün: “${s.en}”`,options:trChoices,answers:[s.tr],why:`${s.en} = ${s.tr}`},'Anlam pekiştirme'));
   }
   if(enChoices.length>=3){
     exam.push(proQ(l,'exam',exam.length,{type:'choice',q:`“${s.tr}” ifadesinin İngilizcesini seç.`,options:enChoices,answers:[s.en],why:`${s.tr} → ${s.en}`},'İfade seçme'));
     practice.push(proQ(l,'practice',practice.length,{type:'choice',q:`Türkçe anlamı “${s.tr}” olan doğru İngilizce ifade hangisi?`,options:enChoices,answers:[s.en],why:`Öğrenilen örnek: ${s.en}`},'Kontrollü uygulama'));
   }
 });
 // Three independent homework tasks: not copied from the four original mini-exam items.
 // Use other skills and a personally composed sentence for AI review.
 for(let i=0;i<3;i++){
   const s=samples[i%samples.length];if(!s)break;
   const useEnglish=i===0;const answer=useEnglish?s.en:s.tr;
   const opts=useEnglish?[answer,...proPickWrong(otherEnglish,answer,proHash(l.id+'hw'+i))]:[answer,...proPickWrong(otherTranslations,answer,proHash(l.id+'hw'+i))];
   if(opts.length>=3)homework.push(proQ(l,'homework',i,{type:'choice',listenText:i===2?s.en:null,q:i===2?'▶ Öğretmeni dinleyip doğru Türkçe anlamı seç.':useEnglish?`Duruma uygun İngilizce ifadeyi seç: ${s.tr}`:`“${s.en}” cümlesini kendi sözlerinle anlamlandırmadan önce doğru Türkçe karşılığı seç.`,options:opts,answers:[answer],why:`Örnek: ${s.en} — ${s.tr}`},'Ev ödevi — uygulama'));
 }
 // Extra practice is ungraded, but records mistakes and feeds the learning profile.
 const pbase=(l.questions||[]).filter(q=>Array.isArray(q.answers)&&q.answers.length&&Array.isArray(q.options));
 pbase.forEach((q,i)=>practice.push(proQ(l,'practice',practice.length,{type:q.type,q:`Kendini kontrol et: ${q.q}`,options:(q.options||[]).slice(),answers:q.answers.slice(),why:q.why||l.rule},'Konu pekiştirme')));
 // At least 10 exam items; each attempt selects a subset, and every question's choices are shuffled at attempt creation.
 // Same learning expressions may appear in different modalities; this is NOT a bank of 100% unique linguistic concepts.
 const unique=arr=>{const seen=new Set();return arr.filter(q=>{const id=String(q.q).toLowerCase();if(seen.has(id))return false;seen.add(id);return true})};
 const result={exam:unique(exam),practice:unique(practice),homework:unique(homework),samples,focus:PROFESSIONAL_NOTES[l.id].focus,task:PROFESSIONAL_NOTES[l.id].task};
 PRO_BANK_CACHE[l.id]=result;return result;
}
function proExamQuestions(l){const bank=proBank(l);if(!bank)return (l.questions||[]).map((q,i)=>({...q,key:l.id+'-'+i}));
 const list=bank.exam;return proMix(list,Math.floor(Math.random()*4294967295)).slice(0,Math.min(10,list.length)).map(q=>({...q,options:(q.options||[]).slice()}));}
function proPracticeQuestions(l){const bank=proBank(l);if(!bank)return [];
 return proMix(bank.practice,Math.floor(Math.random()*4294967295)).slice(0,Math.min(6,bank.practice.length)).map(q=>({...q,options:(q.options||[]).slice()}));}
function proHomeworkTasks(l,assigned){const bank=proBank(l);if(!bank)return null;
 // Freeze a full task snapshot within the homework record. Subsequent renders cannot change the assignment.
 if(assigned.professionalTasks?.length===4)return assigned.professionalTasks;
 if(Object.keys(assigned.answers||{}).length||assigned.attempts>0||assigned.status!=='assigned')return null; // grandfather started assignments
 if(bank.homework.length<3)return null;
 const source=bank.homework.slice(0,3).map((q,i)=>({key:'q'+i,type:q.type,title:q.q,options:proMix(q.options||[],proHash(l.id+':'+assigned.assignedAt+':hw'+i)),answers:q.answers,why:q.why,listenText:q.listenText,questionId:q.key}));
 source.push({key:'own',type:'own',title:`${bank.task} Kendi hayatından en az bir yeni İngilizce cümle yaz; hazır örnek cümleleri kopyalama.`,options:[],answers:[],why:''});
 assigned.professionalTasks=source;save();return source;
}
function proState(){if(!state.professionalPractice||typeof state.professionalPractice!=='object')state.professionalPractice={};return state.professionalPractice;}
function proOnPracticeResult(l,score,wrongKeys){const p=proState();p[l.id]={score,at:Date.now(),wrongKeys:wrongKeys.slice(0,10)};save();if(typeof directorInvalidate==='function')directorInvalidate();}
function proTutorGuide(l){const bank=proBank(l);if(!bank)return '';
 const assessment=proState()[l.id],nWrong=Object.keys(state.misses||{}).filter(k=>k.startsWith(`pro:${l.id}:`)&&(state.misses[k].errors||0)>0).length;
 const diagnose=assessment?`${assessment.score}% · ${new Date(assessment.at).toLocaleDateString('tr-TR')} · ${assessment.wrongKeys.length} yanlış`:'Henüz ön çalışma yapılmadı';
 return `<section class="premium-panel pro-instructor"><span class="badge">A0–A2 • Öğretmenli öğrenme</span><h2>Bu konuyu gerçekten öğren</h2><p class="muted">Dersleri sıralı işle: önce örnekleri kavra, kendi cümleni kur, dene, hatanı düzelt; sonra ödev, bağımsız sınav ve konulu konuşma.</p>
 <div class="pro-instructor-grid"><div><small>Öğrenme hedefi</small><p>${h(l.tr)}</p></div><div><small>Öğretmenin odak noktası</small><p>${h(bank.focus)}</p></div><div><small>Gerçek yaşam görevi</small><p>${h(bank.task)}</p></div><div><small>En sık karıştırılan bölüm</small><p>${h((LESSON_GUIDES[l.id]||{}).mistake||l.rule)}</p></div></div>
 <p class="muted">Ön alıştırma: <strong>${h(diagnose)}</strong> · Takip edilen yanlış soru: ${nWrong}</p>
 <p class="tiny">Bu ders için ${bank.practice.length} alıştırma, ${bank.homework.length} kapalı ödev sorusu + özgün yazı görevi, ${bank.exam.length} sınav varyantı bulunuyor. Dinleme soruları iPhone'un cihaz sesini kullanır; doğal konuşma kaydı değildir.</p>
 <button class="btn secondary full" data-action="pro-practice">🎯 Öğrenme kontrolü ve alıştırma</button>
 ${assessment&&assessment.score<80?'<div class="warning">Ön alıştırmada eksikler var. AI öğretmenle açıklamayı tekrar et ve alıştırmayı yenile. Resmî ders sınavı bu ön alıştırmadan ayrıdır.</div>':''}
 </section>`;
}
function proMasterySummary(l){const bank=proBank(l);const results=proState()[l.id];if(!bank)return '';
 return `${results?`Ön alıştırma: %${results.score}. `:'Ön alıştırma yapılmadı. '}${PROFESSIONAL_NOTES[l.id].focus}`;
}
