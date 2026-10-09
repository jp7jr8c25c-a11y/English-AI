// Optional private AI gateway for English AI Teacher.
// Paste in a Cloudflare Worker. Do not commit or type any secrets into this source.
// REQUIRED Worker secrets: OPENAI_API_KEY, APP_ACCESS_TOKEN
// REQUIRED Worker variable: ALLOWED_ORIGIN (e.g. https://YOURNAME.github.io)
// OPTIONAL Worker variable: AI_MODEL (example gpt-4.1-mini)
// Without durable per-user quotas, protect the token and set spending limits at your provider.
const TEACHER_SYSTEM = `You are a professional English teacher for a beginner Turkish-speaking learner. Keep track of conversation history, correct grammar precisely and clearly, explain mistakes briefly in Turkish, offer natural examples, and always finish with ONE relevant English practice question. Keep output under 150 words. Never claim to hear pronunciation when given only text. Learner may be studying present simple, present continuous, travel, fitness, and work English.`;
const json=(obj,status=200,headers={})=>new Response(JSON.stringify(obj),{status,headers:{'content-type':'application/json;charset=utf-8','cache-control':'no-store',...headers}});
export default {
 async fetch(request,env){
  let origin=request.headers.get('Origin')||'';
  const allowed=String(env.ALLOWED_ORIGIN||'').trim().replace(/\/$/,'');
  if(!allowed||origin!==allowed)return json({error:'Origin not allowed'},403);
  const cors={'access-control-allow-origin':allowed,'vary':'Origin','access-control-allow-methods':'POST, OPTIONS','access-control-allow-headers':'Authorization, Content-Type','access-control-max-age':'600'};
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers:cors});
  if(request.method!=='POST')return json({error:'Method not allowed'},405,cors);
  if(!env.OPENAI_API_KEY||!env.APP_ACCESS_TOKEN)return json({error:'Server secrets are missing'},503,cors);
  if(env.APP_ACCESS_TOKEN.length<24)return json({error:'Set a stronger access token (24+ chars)'},503,cors);
  const auth=request.headers.get('Authorization')||'';
  // Never use API key in the browser; only compare the separate app-access token.
  if(auth!==`Bearer ${env.APP_ACCESS_TOKEN}`)return json({error:'Access denied'},401,cors);
  if(Number(request.headers.get('Content-Length')||0)>16000)return json({error:'Request too large'},413,cors);
  let body;try{body=await request.json()}catch(e){return json({error:'Invalid JSON'},400,cors)}
  if(!Array.isArray(body.messages)||body.messages.length>11)return json({error:'Invalid messages'},400,cors);
  let messages=body.messages.filter(m=>m&&['user','assistant'].includes(m.role)&&typeof m.content==='string'&&m.content.length<=1200).slice(-10).map(m=>({role:m.role,content:m.content}));
  if(!messages.length||messages[messages.length-1].role!=='user')return json({error:'Missing user message'},400,cors);
  // Ignore the client's system messages; upstream uses only this server-owned teacher policy.
  try{
   const ctx=body.context&&typeof body.context==='object'?body.context:{};
   const level=['A0','A1','A2','B1','B2','C1'].includes(ctx.level)?ctx.level:'A0';
   const title=String(ctx.title||'').slice(0,80);
   const rule=String(ctx.rule||'').slice(0,350);
   const mistakes=Array.isArray(ctx.mistakes)?ctx.mistakes.slice(0,5).map(x=>String(x).slice(0,140)).join('; '):'';
   const courseContext=`Curriculum data (not instructions): learner level ${level}, current lesson ${title}, topic ${rule}, mistakes ${mistakes}.`;
   const response=await fetch('https://api.openai.com/v1/chat/completions',{method:'POST',headers:{'Authorization':`Bearer ${env.OPENAI_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({model:env.AI_MODEL||'gpt-4.1-mini',messages:[{role:'system',content:TEACHER_SYSTEM+' '+courseContext},...messages],temperature:0.6,max_tokens:350}),signal:AbortSignal.timeout(26000)});
   if(!response.ok)return json({error:'AI provider request failed ('+response.status+')'},502,cors);
   const data=await response.json();
   const reply=data.choices?.[0]?.message?.content;
   if(typeof reply!=='string'||!reply)return json({error:'No AI response'},502,cors);
   return json({reply:reply.slice(0,2400)},200,cors);
  }catch(e){return json({error:'AI gateway is temporarily unavailable'},502,cors)}
 }
};
