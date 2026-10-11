"use strict";
// v3.1.1 - Shared objective answer evaluation. Developer: Ali Erkonak.
// Presentation differences are tolerated, grammatical differences are NOT.
function answerKey(value, strictPunctuation=false){
 let s=String(value??'').normalize('NFKC')
  .replace(/[\u200B-\u200D\uFEFF]/g,'')
  .replace(/[‘’‛ʼ＇`]/g,"'")
  .replace(/[“”„‟«»＂]/g,'"')
  .toLocaleLowerCase('en-US').replace(/i\u0307/g,'i')
  .replace(/\s+/g,' ').trim();
 if(strictPunctuation)return s;
 // Preserve decimal points/time separators: 1.5 != 15; 8:30 != 830.
 let out='';
 const chars=Array.from(s);
 for(let i=0;i<chars.length;i++){
  const c=chars[i],prev=chars[i-1]||'',next=chars[i+1]||'';
  if(c==="'"){
   // Preserve contractions and grammatical possessives; strip enclosing quotes.
   out+=/\p{L}/u.test(prev)&&/\p{L}/u.test(next)?c:' ';
  }else if((c==='.'||c===':'||c===',')&&/\d/.test(prev)&&/\d/.test(next)){
   out+=c;
  }else if(c===','&&/\p{L}/u.test(prev)&&/\s/.test(next)&&/\p{L}/u.test(chars.slice(i+1).join('').trimStart()[0]||'')){
   // Internal comma may change meaning (Let's eat, Grandma != Let's eat Grandma).
   out+=c;
  }else if(/[.,!?;:…"“”‘’()[\]{}\/\\—–-]/u.test(c)){
   out+=' ';
  }else out+=c;
 }
 return out.replace(/\s+/g,' ').trim();
}
function answerNeedsPunctuation(question){
 const t=String(question?.q||question?.title||'');
 return /noktalama|virgül|nokta işareti|soru işareti|ünlem|apostrof|kesme işareti|punctuation|comma|full stop|question mark|apostrophe/i.test(t);
}
function answerCheck(question,value){
 const answers=Array.isArray(question?.answers)?question.answers:[];
 const strict=answerNeedsPunctuation(question);
 const typed=answerKey(value,strict);
 if(!typed)return {correct:false,reason:'empty'};
 for(const v of answers){
  const expected=answerKey(v,strict);
  if(expected&&expected===typed){
   const literal=String(value).trim().toLocaleLowerCase('en-US')===String(v).trim().toLocaleLowerCase('en-US');
   return {correct:true,reason:literal?'exact':'presentation'};
  }
 }
 return {correct:false,reason:'different'};
}
function answerMatches(value,target){return answerKey(value)!==''&&answerKey(value)===answerKey(target);}
