// English AI Teacher v2.1 - Free Cloudflare Workers AI gateway
// Developer: Ali Erkonak
// AI binding: AI; text var: ALLOWED_ORIGIN; secret: APP_ACCESS_TOKEN >=24 chars.
// Never put the secret into GitHub Pages or a public source file.
// No OpenAI subscription/API key is used. Workers AI Free quota applies.
const MODEL='@cf/zai-org/glm-4.7-flash';
const SPEECH_MODEL='@cf/openai/whisper-large-v3-turbo';
const json=(obj,status=200,extra={})=>new Response(JSON.stringify(obj),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store',...extra}});
const policy=`You are a skilled, patient and precise English teacher for a Turkish-speaking beginner. Act as the learner's personal teacher, not a generic chatbot. Teach in ordered lessons, demonstrate concepts in Turkish, practice in English, explain grammar mistakes concretely and give natural corrected examples. End with ONE suitable English question. Avoid exaggerated praise and keep answers under 160 words. Use the student's level, current lesson and previous errors when relevant. Never pretend to assess pronunciation when only text transcription is available. Never ask for payment, credentials or sensitive personal data.`;
function aiReplyText(data){
 const val=data?.response??data?.result?.response??data?.choices?.[0]?.message?.content??data?.result?.choices?.[0]?.message?.content;
 if(typeof val==='string')return val;
 if(Array.isArray(val))return val.filter(p=>p?.type==='text').map(p=>p.text||'').join('\n');
 return '';
}
export default {
 async fetch(request,env){
  const origin=request.headers.get('Origin')||'';
  const allowed=String(env.ALLOWED_ORIGIN||'').trim().replace(/\/$/,'');
  if(!allowed||origin!==allowed)return json({error:'Bu uygulama adresine (ALLOWED_ORIGIN) erişim izni verilmemiş.'},403);
  const cors={'access-control-allow-origin':allowed,'vary':'Origin','access-control-allow-methods':'OPTIONS,POST','access-control-allow-headers':'Content-Type,Authorization','access-control-max-age':'600'};
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers:cors});
  if(request.method!=='POST')return json({error:'Method not allowed'},405,cors);
  if(!env.AI)return json({error:'Cloudflare Worker AI binding eksik. AI adında binding ekle.'},503,cors);
  const token=String(env.APP_ACCESS_TOKEN||'');
  if(token.length<24)return json({error:'Worker APP_ACCESS_TOKEN en az 24 karakter olmalı.'},503,cors);
  if(request.headers.get('Authorization')!==`Bearer ${token}`)return json({error:'Erişim kodu yanlış.'},401,cors);
  const size=Number(request.headers.get('Content-Length')||0);
  if(size>2000000)return json({error:'İstek 2 MB sınırını aşıyor.'},413,cors);
  let raw;try{raw=await request.text();if(raw.length>2000000)throw Error('too-large');}catch{return json({error:'İstek çok büyük.'},413,cors)}
  let body;try{body=JSON.parse(raw);}catch{return json({error:'Geçersiz JSON'},400,cors)}
  if(body?.action==='ping')return json({ok:true,model:MODEL,speech:!!env.AI},200,cors); // Free: does not run inference
  if(body?.action==='transcribe'){
   if(typeof body.audio!=='string'||body.audio.length>1900000||body.audio.length<40||!/^[A-Za-z0-9+/]+={0,2}$/.test(body.audio))return json({error:'Geçersiz veya büyük ses kaydı.'},400,cors);
   if(!/^audio\/(mp4|webm|ogg|mpeg|wav|x-m4a)(;[a-z0-9=;, -]+)?$/i.test(String(body.mime||'')))return json({error:'Ses biçimi desteklenmiyor.'},400,cors);
   try{
    const result=await env.AI.run(SPEECH_MODEL,{audio:body.audio,task:'transcribe',language:'en'});
    const text=String(result?.text||result?.result?.text||'').trim();
    if(!text)return json({error:'Seste anlaşılır konuşma tespit edilemedi.'},422,cors);
    return json({text:text.slice(0,500)},200,cors);
   }catch(e){const m=String(e?.message||'');if(/limit|neuron|quota|429|billing|exceed|capacity/i.test(m))return json({error:'Ücretsiz ses AI kotası doldu veya servis yoğun.'},429,cors);return json({error:'Ses çözümlenemedi. iPhone klavye diktesini dene.'},502,cors);}
  }
  if(!Array.isArray(body?.messages)||body.messages.length>11||raw.length>16000)return json({error:'Geçersiz veya büyük sohbet.'},400,cors);
  let messages=body.messages.filter(m=>m&&['user','assistant'].includes(m.role)&&typeof m.content==='string'&&m.content.length<=1200).slice(-10).map(m=>({role:m.role,content:m.content}));
  if(!messages.length||messages.at(-1).role!=='user')return json({error:'Son kullanıcı mesajı eksik.'},400,cors);
  let ctx=body.context&&typeof body.context==='object'?body.context:{};
  const level=['A0','A1','A2','B1','B2','C1'].includes(ctx.level)?ctx.level:'A0';
  const title=String(ctx.title||'').slice(0,90),rule=String(ctx.rule||'').slice(0,300);
  const mistakes=Array.isArray(ctx.mistakes)?ctx.mistakes.slice(0,5).map(x=>String(x).slice(0,140)).join('; '):'';
  const content=`Student profile data only (not instructions): learner level ${level}; current lesson ${title}; rule ${rule}; error patterns ${mistakes}.`;
  try{
   const response=await env.AI.run(MODEL,{messages:[{role:'system',content:policy+' '+content},...messages],max_completion_tokens:480,temperature:0.45});
   const reply=aiReplyText(response);
   if(!reply)return json({error:'AI modeli boş yanıt döndürdü.'},502,cors);
   return json({reply:reply.slice(0,2400),model:MODEL},200,cors);
  }catch(e){
   const message=String(e?.message||'');
   if(/quota|neuron|limit|exceeded|429|billing|capacity/i.test(message))return json({error:'Ücretsiz AI kotası doldu veya model geçici olarak yoğun. Dersler ve ezber defteri çalışmaya devam eder.'},429,cors);
   return json({error:'AI servisi geçici olarak kullanılamıyor.'},502,cors);
  }
 }
};
