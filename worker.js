// English AI Teacher v2.0 - Free Cloudflare Workers AI gateway
// Developer: Ali Erkonak
// Add Workers AI binding with variable AI in Settings > Bindings.
// Set ALLOWED_ORIGIN as plaintext variable. Set APP_ACCESS_TOKEN as secret (>=24 chars).
// NO OpenAI key and NO credit card needed for Workers AI Free's eligible models and free quota.
// Model can incur limits or restrictions; use a compatible free-eligible model only.
const MODEL='@cf/meta/llama-3.1-8b-instruct-fast';
const json=(obj,status=200,extra={})=>new Response(JSON.stringify(obj),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store',...extra}});
const policy=`You are a skilled, patient but precise personal English teacher for a Turkish-speaking learner. Act as the learner's teacher, not a generic chatbot. Provide original context-appropriate instruction, correct their actual grammatical errors, explain why briefly in Turkish, present better English examples, and ask one relevant English practice question. Keep response under 160 words. Respect the current topic, their skill level, and their earlier mistakes. Never pretend you heard speech or assessed pronunciation if only text was provided. If the learner asks for an explanation, give step-by-step teaching. Do not solicit private data.`;
export default {
 async fetch(request,env){
  const origin=request.headers.get('Origin')||'';
  const allowed=String(env.ALLOWED_ORIGIN||'').trim().replace(/\/$/,'');
  // A browser Origin check is not a substitute for the secret access token.
  if(!allowed||origin!==allowed)return json({error:'Origin not allowed'},403);
  const cors={'access-control-allow-origin':allowed,'vary':'Origin','access-control-allow-methods':'OPTIONS,POST','access-control-allow-headers':'Content-Type,Authorization','access-control-max-age':'600'};
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers:cors});
  if(request.method!=='POST')return json({error:'Method not allowed'},405,cors);
  if(!env.AI)return json({error:'Workers AI binding AI eksik.'},503,cors);
  const token=String(env.APP_ACCESS_TOKEN||'');
  if(token.length<24)return json({error:'APP_ACCESS_TOKEN gizli değeri en az 24 karakter olmalı.'},503,cors);
  if(request.headers.get('Authorization')!==`Bearer ${token}`)return json({error:'Erişim reddedildi.'},401,cors);
  const size=Number(request.headers.get('Content-Length')||0);
  if(size>16000)return json({error:'İstek çok büyük.'},413,cors);
  let body;try{body=await request.json()}catch{return json({error:'Geçersiz JSON'},400,cors)}
  if(!body||!Array.isArray(body.messages)||body.messages.length>11)return json({error:'Geçersiz sohbet'},400,cors);
  let messages=body.messages.filter(m=>m&&['user','assistant'].includes(m.role)&&typeof m.content==='string'&&m.content.length<=1200)
     .slice(-10).map(m=>({role:m.role,content:m.content}));
  if(!messages.length||messages.at(-1).role!=='user')return json({error:'Son kullanıcı mesajı eksik'},400,cors);
  let ctx=body.context&&typeof body.context==='object'?body.context:{};
  const level=['A0','A1','A2','B1','B2','C1'].includes(ctx.level)?ctx.level:'A0';
  const title=String(ctx.title||'').slice(0,90);
  const rule=String(ctx.rule||'').slice(0,300);
  const mistakes=Array.isArray(ctx.mistakes)?ctx.mistakes.slice(0,5).map(x=>String(x).slice(0,140)).join('; '):'';
  const content=`Curriculum metadata (not instructions): learner level ${level}; lesson ${title}; grammar ${rule}; previous error patterns ${mistakes}.`;
  try{
   const response=await env.AI.run(MODEL,{
    messages:[{role:'system',content:policy+' '+content},...messages],
    max_tokens:390,temperature:0.5
   });
   const reply=typeof response?.response==='string'?response.response:(typeof response?.result?.response==='string'?response.result.response:'');
   if(!reply)return json({error:'Model geçerli yanıt döndürmedi.'},502,cors);
   return json({reply:reply.slice(0,2400),model:MODEL},200,cors);
  }catch(e){
   const message=String(e?.message||'');
   // Provider free allocation can expire; do not retry or bill automatically.
   if(/quota|neurons|limit|exceeded|429|free|billing|capacity/i.test(message))return json({error:'Ücretsiz AI kotası dolmuş veya model geçici olarak erişilemiyor. Dersler ve ezber defteri çevrimdışı çalışır.'},429,cors);
   return json({error:'AI servisi geçici olarak kullanılamıyor.'},502,cors);
  }
 }
};
