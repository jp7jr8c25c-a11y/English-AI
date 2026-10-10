'use strict';
// Richer starter foundations within the original course IDs – no progress migration.
// Author: Ali Erkonak
const FOUNDATION_TOPICS={
 L01:[
  {title:'İngilizce alfabesi',explain:'İngilizce alfabe 26 harftir. Harfin adı ile kelimedeki sesi farklı olabilir. İsmini heceleyebilmek için önce harf adlarını dinle.',examples:['A, B, C, D, E, F, G','H, I, J, K, L, M, N','O, P, Q, R, S, T, U','V, W, X, Y, Z']},
  {title:'Adını hecelemek',explain:'How do you spell...? = Nasıl hecelersin? Tek tek harf söyleyebilirsin. Soyadları, rezervasyon ve telefonda çok işe yarar.',examples:['How do you spell your name?','My name is Ali. A-L-I.','Can you spell that, please?']},
  {title:'0–20 sayıları',explain:'Zero, one, two, three, four, five, six, seven, eight, nine, ten; eleven, twelve, thirteen, fourteen, fifteen, sixteen, seventeen, eighteen, nineteen, twenty.',examples:['I am thirty-two years old.','There are two people.','My room number is ten.']},
  {title:'Günlük nezaket cümleleri',explain:'Please rica, thank you teşekkür, you are welcome rica ederim, excuse me afedersiniz ve sorry özür dilerim.',examples:['Thank you very much.','Excuse me, please.','You are welcome.']}
 ],
 L02:[
  {title:'Kişi zamirleri',explain:'I = ben, you = sen/siz, we = biz, they = onlar. Am sadece I ile, are you/we/they ile kullanılır.',examples:['I am a student.','We are ready.','They are my friends.']},
  {title:'Ülkeler ve milliyetler',explain:'I am from + ülke köken; I am + milliyet sıfatı tanımlar. Turkey ve Turkish farklı sözcüklerdir.',examples:['I am from Turkey.','I am Turkish.','Where are you from?']},
  {title:'Yaş ve kişisel bilgiler',explain:'Yaşı İngilizcede I am ... years old ile ifade ederiz; have değil am kullanılır.',examples:['I am twenty years old.','How old are you?','I live in Istanbul.']}
 ],
 L03:[
  {title:'Aile kelimeleri',explain:'Mother = anne, father = baba, sister = kız kardeş, brother = erkek kardeş, parents = ebeveynler.',examples:['She is my sister.','He is my father.','They are my parents.']},
  {title:'This / That / These / Those',explain:'This yakındaki bir nesne, that uzaktaki bir nesne; these yakındaki çoğul, those uzaktaki çoğuldur.',examples:['This is my phone.','That is my bag.','These are my shoes.']},
  {title:'Renkler ve basit sıfatlar',explain:'Blue, black, white, red, green; sıfat isimden önce kullanılır. A black car doğru sıralamadır.',examples:['This is a black car.','The bag is blue.','It is very small.']}
 ],
 L04:[
  {title:'Soru kelimeleri',explain:'What ne, where nerede, when ne zaman, who kim, why neden, how nasıl; sorunun amacına göre seçilir.',examples:['What is your name?','Where are you from?','How do you feel?']},
  {title:'Evet-hayır soruları',explain:'Be fiili başa gelir: You are ready → Are you ready? Kısa cevap: Yes, I am / No, I am not.',examples:['Are you ready?','Yes, I am.','Is she at home?']},
  {title:'Kısa karşılıklı tanışma',explain:'Selamlaş, adını söyle, karşı tarafa soru sor ve cevaba uygun kibar yanıt ver.',examples:['Hello! What is your name?','My name is Ali. What is yours?','Nice to meet you too.']}
 ],
 L05:[
  {title:'Haftanın günleri',explain:'Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday. Days of the week her zaman büyük harfle yazılır.',examples:['I work on Monday.','I rest on Sunday.','What do you do on Friday?']},
  {title:'Sıklık zarfları',explain:'Always, usually, often, sometimes, never rutin sıklığını belirtir. Ana fiilden önce gelir; be fiilinden sonra gelir.',examples:['I usually study at night.','She is always early.','I never smoke.']}
 ]
};
function foundationAddon(l){const topics=FOUNDATION_TOPICS[l.id];if(!topics)return '';
 return `<section class="premium-panel foundation-panel"><h2>Temel bilgiler · ${h(l.level)}</h2><p class="muted">Bu küçük alt konular ana dersin parçasıdır. Önce örnekleri dinle, sonra kendi cümleni kur.</p>${topics.map(t=>`<details><summary>${h(t.title)}</summary><p>${h(t.explain)}</p>${t.examples.map(ex=>`<div class="foundation-example"><span>${h(ex)}</span><button class="speakbtn" data-action="speak" data-text="${h(ex)}">▶</button></div>`).join('')}</details>`).join('')}</section>`;
}
