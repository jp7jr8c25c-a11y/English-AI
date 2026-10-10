'use strict';
// English AI Teacher v2.6: central teacher decisions. Developer: Ali Erkonak.
// The AI proposes a plan; the client validates it. Only actual completed work changes progress.
const DIRECTOR_STEPS=[
 {key:'examples',name:'Kelime',mins:10,page:'memo',symbol:'◇'},
 {key:'speaking',name:'Konuşma',mins:15,page:'speaking',symbol:'◉'},
 {key:'explain',name:'Dinleme',mins:10,page:'lesson',symbol:'♫'},
 {key:'homework',name:'Gramer',mins:10,page:'homework',symbol:'▤'},
 {key:'quiz',name:'Test',mins:10,page:'lesson',symbol:'✓'}
];
let directorBusy=false,directorError='',directorAttemptedFor='';
function directorReady(){return state.settings.ai==='cloud'&&workerAddressValid(state.settings.worker)&&Boolean(state.settings.token);}
function directorStored(){const p=state.aiDirector;return p&&p.day===TODAY()&&p.lessonId&&LESSONS.some((l,i)=>l.id===p.lessonId&&lessonUnlocked(i))?p:null;}
function directorFallback(){const rec=teacherRecommendedLesson(),l=rec.lesson||currentLesson();let reason=rec.type==='homework'?'Bekleyen ödevini tamamlamak önceliğin.':rec.type==='review'?'Önce yanlış yaptığın soruları yeniden çalışmalısın.':'Yeni konuyu öğrenip kısa pratikle pekiştireceğiz.';
 return {day:TODAY(),lessonId:l.id,mode:rec.type,source:'local',message:'Bugün '+l.title+' konusuna odaklanalım. '+reason,reason,steps:DIRECTOR_STEPS.map(x=>({...x}))};}
function snapshotHasUnlockedLesson(id){return LESSONS.some((l,i)=>l.id===id&&lessonUnlocked(i));}
function directorSnapshot(){const next=currentLesson();const unlocked=LESSONS.filter((l,i)=>lessonUnlocked(i)).slice(-8).map(l=>({id:l.id,level:l.level,title:l.title,score:state.completed[l.id]?.score??null}));
 const pending=teacherPendingAssignments().slice(0,5).map(x=>({lessonId:x.lessonId,status:x.status,overdue:Number(x.dueAt)<Date.now()}));
 return {day:TODAY(),level:next.level,activeLesson:next.id,unlocked,completed:completedCount(),total:LESSONS.length,accuracy:state.attempts?Math.round(state.correct/state.attempts*100):null,answered:state.attempts,streak:streak(),dueMistakes:dueQuestions().length,dueFlashcards:memoDue().length,pending,patterns:Object.values(state.misses).filter(x=>x?.errors).sort((a,b)=>b.errors-a.errors).slice(0,5).map(x=>({title:String(x.title||'').slice(0,100),answer:String(x.answer||'').slice(0,100),errors:x.errors})),todaySteps:dailyPlan().steps,speaking:speakingSummary(),coaching:Object.values(state.coachSessions||{}).filter(x=>x&&snapshotHasUnlockedLesson(x.lessonId)).sort((a,b)=>(b.updated||0)-(a.updated||0)).slice(0,5).map(x=>({lessonId:x.lessonId,attempts:Math.min(100,Number(x.attempts)||0),correctTotal:Math.min(100,Number(x.correctTotal)||0),streak:Math.min(3,Number(x.streak)||0),readyForQuiz:!!x.readyForQuiz,lastWrong:(x.history||[]).slice(-4).filter(h=>!h.correct).length,focus:String(x.focus||'').slice(0,90)}))};}
function directorValidate(input,snapshot){if(!input||typeof input!=='object')throw Error('AI planı geçerli değil.');
 const allowed=new Set(snapshot.unlocked.map(l=>l.id));const id=String(input.lessonId||'');if(!allowed.has(id))throw Error('AI kilitli veya bilinmeyen bir ders önerdi.');
 const safe=['lesson','review','homework','speaking','memo'].includes(input.mode)?input.mode:'lesson';
 const mode=(safe==='review'&&!snapshot.dueMistakes)||(safe==='memo'&&!snapshot.dueFlashcards)||(safe==='homework'&&!snapshot.pending.some(x=>x.lessonId===id))?'lesson':safe;
 const reason=String(input.reason||'').slice(0,220).trim(),message=String(input.message||'').slice(0,260).trim();if(!reason||!message)throw Error('Plan gerekçesi eksik.');
 const all=Array.isArray(input.steps)?input.steps:[];
 const steps=DIRECTOR_STEPS.map(st=>{const candidate=all.find(x=>x&&x.key===st.key)||{};return {...st,mins:Number.isFinite(Number(candidate.mins))?Math.max(5,Math.min(25,Math.round(Number(candidate.mins)))):st.mins};});
 return {day:TODAY(),lessonId:id,mode,source:'ai',message,reason,steps,created:Date.now()};}
function directorDecision(){let plan=directorStored()||directorFallback();const lesson=LESSONS.find(x=>x.id===plan.lessonId)||currentLesson();return {type:plan.mode,lesson,reason:plan.reason,plan};}
async function directorRefresh(force=false){if(directorBusy)return;if(!directorReady()){directorError='AI yönetimi için Ayarlar → Cloudflare gerçek AI bağlantısını etkinleştir.';if(page==='home')renderHome();return;}
 if(!force&&directorStored())return;
 directorBusy=true;directorError='';if(page==='home')renderHome();const snapshot=directorSnapshot(),controller=new AbortController(),timer=setTimeout(()=>controller.abort(),55000);
 try{const response=await fetch(state.settings.worker,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+state.settings.token},body:JSON.stringify({action:'plan_day',learner:snapshot}),signal:controller.signal});const data=await response.json().catch(()=>({}));if(!response.ok)throw Error(data.error||('HTTP '+response.status));const plan=directorValidate(data.plan,snapshot);state.aiDirector=plan;save();}
 catch(e){directorError='AI planı alınamadı: '+String(e.message||e).slice(0,155)+' Yerel öğretmen önerisi kullanılabilir.';}
 finally{clearTimeout(timer);directorBusy=false;if(page==='home')renderHome();}
}
function directorMaybePlan(){if(directorReady()&&!directorStored()&&directorAttemptedFor!==TODAY()){directorAttemptedFor=TODAY();Promise.resolve().then(()=>directorRefresh(false));}}
function directorGo(){const rec=directorDecision();if(rec.type==='homework'){state.activeHomework=rec.lesson.id;save();go('homework');}
 else if(rec.type==='review'){if(dueQuestions().length)reviewQuiz();else{state.activeLesson=rec.lesson.id;save();go('lesson');}}
 else if(rec.type==='speaking')go('speaking');else if(rec.type==='memo')go('memo');else{state.activeLesson=rec.lesson.id;save();go('lesson');}}

// Recalculate recommendation after meaningful learning evidence; never alter scores.
function directorInvalidate(){state.aiDirector=null;directorAttemptedFor='';save();}
