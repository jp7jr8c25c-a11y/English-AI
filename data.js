"use strict";
const LESSONS = [
 {
  "id": "L01",
  "level": "A0",
  "title": "Tanışma ve selamlaşma",
  "tr": "Merhaba, ben...",
  "rule": "Hello = merhaba; My name is... = Benim adım...; Nice to meet you = Tanıştığımıza memnun oldum.",
  "examples": [
   "Hello!",
   "My name is Ali.",
   "Nice to meet you.",
   "How are you?"
  ],
  "questions": [
   {
    "type": "choice",
    "q": "“Merhaba” İngilizcede hangisi?",
    "options": [
     "Goodbye",
     "Hello",
     "Thanks"
    ],
    "answers": [
     "Hello"
    ],
    "why": "Hello selamlaşmada kullanılır."
   },
   {
    "type": "fill",
    "q": "My ___ is Ali.",
    "options": [],
    "answers": [
     "name"
    ],
    "why": "My name is... = Benim adım..."
   },
   {
    "type": "choice",
    "q": "“Nice to meet you” ne demek?",
    "options": [
     "Nasılsın?",
     "Tanıştığıma memnun oldum",
     "Görüşürüz"
    ],
    "answers": [
     "Tanıştığıma memnun oldum"
    ],
    "why": "Yeni tanışmada kullanılır."
   },
   {
    "type": "translate",
    "q": "“Nasılsın?” İngilizce yaz.",
    "options": [],
    "answers": [
     "How are you?"
    ],
    "why": "How are you? = Nasılsın?"
   }
  ]
 },
 {
  "id": "L02",
  "level": "A0",
  "title": "I am / You are",
  "tr": "Ben ve sen",
  "rule": "I am = Ben ...im; You are = Sen ...sin. Kısa biçimler: I’m / You’re.",
  "examples": [
   "I am from Turkey.",
   "You are my friend.",
   "I am happy.",
   "You are ready."
  ],
  "questions": [
   {
    "type": "fill",
    "q": "I ___ from Turkey.",
    "options": [],
    "answers": [
     "am"
    ],
    "why": "I ile am kullanılır."
   },
   {
    "type": "choice",
    "q": "You ___ ready.",
    "options": [
     "am",
     "is",
     "are"
    ],
    "answers": [
     "are"
    ],
    "why": "You ile are kullanılır."
   },
   {
    "type": "translate",
    "q": "“Ben mutluyum.” İngilizce yaz.",
    "options": [],
    "answers": [
     "I am happy.",
     "I’m happy."
    ],
    "why": "I am veya I’m kullanılabilir."
   },
   {
    "type": "choice",
    "q": "“I am from Turkey” anlamı nedir?",
    "options": [
     "Türkiye’ye gidiyorum",
     "Türkiye’denim",
     "Türkiye’yi seviyorum"
    ],
    "answers": [
     "Türkiye’denim"
    ],
    "why": "Be from = ...den olmak."
   }
  ]
 },
 {
  "id": "L03",
  "level": "A0",
  "title": "He / She / It",
  "tr": "O kim?",
  "rule": "He = erkek için o, she = kadın için o, it = hayvan/nesne için o. Üçüyle de is kullanılır.",
  "examples": [
   "He is a teacher.",
   "She is at home.",
   "It is cold.",
   "He is my brother."
  ],
  "questions": [
   {
    "type": "fill",
    "q": "She ___ a student.",
    "options": [],
    "answers": [
     "is"
    ],
    "why": "She ile is kullanılır."
   },
   {
    "type": "choice",
    "q": "___ is my brother.",
    "options": [
     "She",
     "He",
     "We"
    ],
    "answers": [
     "He"
    ],
    "why": "Brother için he kullanılır."
   },
   {
    "type": "choice",
    "q": "It ___ cold.",
    "options": [
     "is",
     "am",
     "are"
    ],
    "answers": [
     "is"
    ],
    "why": "It ile is kullanılır."
   },
   {
    "type": "translate",
    "q": "“O (erkek) öğretmen.” İngilizce yaz.",
    "options": [],
    "answers": [
     "He is a teacher."
    ],
    "why": "Meslekten önce a gelir."
   }
  ]
 },
 {
  "id": "L04",
  "level": "A0",
  "title": "Temel sorular",
  "tr": "Basit sorular",
  "rule": "Be fiilini başa al: Are you ready? / Is she here? What = ne, where = nerede.",
  "examples": [
   "Are you okay?",
   "Where are you from?",
   "What is your name?",
   "Is she here?"
  ],
  "questions": [
   {
    "type": "choice",
    "q": "Doğru soru hangisi?",
    "options": [
     "You are ready?",
     "Are you ready?",
     "Ready are you?"
    ],
    "answers": [
     "Are you ready?"
    ],
    "why": "Are özneden önce gelir."
   },
   {
    "type": "fill",
    "q": "Where ___ you from?",
    "options": [],
    "answers": [
     "are"
    ],
    "why": "Where are you from?"
   },
   {
    "type": "translate",
    "q": "“Adın ne?” İngilizce yaz.",
    "options": [],
    "answers": [
     "What is your name?",
     "What’s your name?"
    ],
    "why": "What is your name?"
   },
   {
    "type": "choice",
    "q": "“Is she here?” ne demek?",
    "options": [
     "O burada mı?",
     "O kim?",
     "O nereli?"
    ],
    "answers": [
     "O burada mı?"
    ],
    "why": "Is öne alınca soru olur."
   }
  ]
 },
 {
  "id": "L05",
  "level": "A1",
  "title": "Present Simple — I / You",
  "tr": "Her gün yaptıkların",
  "rule": "Rutin için Present Simple: I work, you study; I am work değil.",
  "examples": [
   "I work every day.",
   "I study English.",
   "You drink coffee.",
   "I go home."
  ],
  "questions": [
   {
    "type": "choice",
    "q": "Doğru cümleyi seç.",
    "options": [
     "I am work every day.",
     "I work every day.",
     "I working every day."
    ],
    "answers": [
     "I work every day."
    ],
    "why": "Alışkanlıkta I + fiilin yalın hali."
   },
   {
    "type": "fill",
    "q": "I ___ English every day.",
    "options": [],
    "answers": [
     "study"
    ],
    "why": "I study English."
   },
   {
    "type": "translate",
    "q": "“Ben her gün çalışırım.” İngilizce yaz.",
    "options": [],
    "answers": [
     "I work every day."
    ],
    "why": "every day iki kelimedir."
   },
   {
    "type": "choice",
    "q": "Doğru ifade hangisi?",
    "options": [
     "I go to home.",
     "I go home.",
     "I am go home."
    ],
    "answers": [
     "I go home."
    ],
    "why": "Go home ifadesinde to kullanılmaz."
   }
  ]
 },
 {
  "id": "L06",
  "level": "A1",
  "title": "He / She / It + s",
  "tr": "Üçüncü tekil kişi",
  "rule": "Rutin anlatırken he/she/it öznesiyle fiile genellikle -s gelir: He works.",
  "examples": [
   "She works in Istanbul.",
   "He drinks tea.",
   "It rains a lot.",
   "She studies English."
  ],
  "questions": [
   {
    "type": "choice",
    "q": "He ___ every day.",
    "options": [
     "work",
     "works",
     "working"
    ],
    "answers": [
     "works"
    ],
    "why": "He ile -s gerekir."
   },
   {
    "type": "fill",
    "q": "She ___ tea.",
    "options": [],
    "answers": [
     "drinks"
    ],
    "why": "She drinks tea."
   },
   {
    "type": "choice",
    "q": "Doğru cümleyi seç.",
    "options": [
     "She study English.",
     "She studies English.",
     "She studying English."
    ],
    "answers": [
     "She studies English."
    ],
    "why": "study → studies."
   },
   {
    "type": "translate",
    "q": "“O (erkek) kahve içer.” İngilizce yaz.",
    "options": [],
    "answers": [
     "He drinks coffee."
    ],
    "why": "He drinks coffee."
   }
  ]
 },
 {
  "id": "L07",
  "level": "A1",
  "title": "Do / Does ile soru",
  "tr": "Günlük rutin soruları",
  "rule": "Do I/you/we/they...? Does he/she/it...? Does sonrası fiil yalın kalır.",
  "examples": [
   "Do you work?",
   "Does he like coffee?",
   "Do they play football?",
   "Does she live here?"
  ],
  "questions": [
   {
    "type": "choice",
    "q": "___ you speak English?",
    "options": [
     "Does",
     "Do",
     "Are"
    ],
    "answers": [
     "Do"
    ],
    "why": "Do you speak English?"
   },
   {
    "type": "fill",
    "q": "___ she live here?",
    "options": [],
    "answers": [
     "Does"
    ],
    "why": "Does she..."
   },
   {
    "type": "choice",
    "q": "Doğru soru hangisi?",
    "options": [
     "Does he likes tea?",
     "Does he like tea?",
     "Do he like tea?"
    ],
    "answers": [
     "Does he like tea?"
    ],
    "why": "Does sonrası like (s yok)."
   },
   {
    "type": "translate",
    "q": "“İngilizce konuşur musun?” İngilizce yaz.",
    "options": [],
    "answers": [
     "Do you speak English?"
    ],
    "why": "Do you speak English?"
   }
  ]
 },
 {
  "id": "L08",
  "level": "A1",
  "title": "Don’t / Doesn’t",
  "tr": "Olumsuz alışkanlıklar",
  "rule": "I/you/we/they don’t; he/she/it doesn’t + yalın fiil.",
  "examples": [
   "I don’t smoke.",
   "She doesn’t work here.",
   "We don’t eat meat.",
   "He doesn’t speak French."
  ],
  "questions": [
   {
    "type": "fill",
    "q": "I ___ drink tea.",
    "options": [],
    "answers": [
     "don't",
     "do not"
    ],
    "why": "I don’t..."
   },
   {
    "type": "choice",
    "q": "Doğru cümleyi seç.",
    "options": [
     "He doesn’t likes coffee.",
     "He doesn’t like coffee.",
     "He don’t like coffee."
    ],
    "answers": [
     "He doesn’t like coffee."
    ],
    "why": "doesn’t ardından yalın fiil."
   },
   {
    "type": "fill",
    "q": "She ___ work here.",
    "options": [],
    "answers": [
     "doesn't",
     "does not"
    ],
    "why": "She doesn’t..."
   },
   {
    "type": "translate",
    "q": "“Ben sigara içmem.” İngilizce yaz.",
    "options": [],
    "answers": [
     "I don't smoke.",
     "I do not smoke."
    ],
    "why": "I don’t smoke."
   }
  ]
 },
 {
  "id": "L09",
  "level": "A1",
  "title": "Present Continuous",
  "tr": "Şu anda ne yapıyorsun?",
  "rule": "Şu anda olan eylem: am/is/are + fiil-ing.",
  "examples": [
   "I am working now.",
   "I am studying English.",
   "He is sleeping.",
   "They are eating."
  ],
  "questions": [
   {
    "type": "choice",
    "q": "Doğru olan hangisi?",
    "options": [
     "I working now.",
     "I am working now.",
     "I am work now."
    ],
    "answers": [
     "I am working now."
    ],
    "why": "am + working."
   },
   {
    "type": "fill",
    "q": "She is ___ now.",
    "options": [],
    "answers": [
     "sleeping"
    ],
    "why": "Şu an: sleeping."
   },
   {
    "type": "translate",
    "q": "“Şu anda İngilizce öğreniyorum.” İngilizce yaz.",
    "options": [],
    "answers": [
     "I'm learning English now.",
     "I am learning English now."
    ],
    "why": "am learning."
   },
   {
    "type": "choice",
    "q": "They ___ eating.",
    "options": [
     "am",
     "is",
     "are"
    ],
    "answers": [
     "are"
    ],
    "why": "They are..."
   }
  ]
 },
 {
  "id": "L10",
  "level": "A1",
  "title": "Simple vs Continuous",
  "tr": "Genelde mi şu an mı?",
  "rule": "every day / usually → Simple; now / at the moment → Continuous.",
  "examples": [
   "I drink coffee every morning.",
   "I am drinking coffee now.",
   "I usually get up at nine.",
   "I am going home."
  ],
  "questions": [
   {
    "type": "choice",
    "q": "I ___ coffee every morning.",
    "options": [
     "drink",
     "am drinking",
     "drinking"
    ],
    "answers": [
     "drink"
    ],
    "why": "every morning: Simple."
   },
   {
    "type": "choice",
    "q": "I ___ coffee now.",
    "options": [
     "drink",
     "am drinking",
     "drinks"
    ],
    "answers": [
     "am drinking"
    ],
    "why": "now: Continuous."
   },
   {
    "type": "fill",
    "q": "I usually ___ up at 9 o’clock.",
    "options": [],
    "answers": [
     "get"
    ],
    "why": "I usually get up..."
   },
   {
    "type": "translate",
    "q": "“Şu anda eve gidiyorum.” İngilizce yaz.",
    "options": [],
    "answers": [
     "I'm going home now.",
     "I am going home now."
    ],
    "why": "am going home; to yok."
   }
  ]
 },
 {
  "id": "L11",
  "level": "A1",
  "title": "Can / Can’t",
  "tr": "Yetenek ve izin",
  "rule": "Can + fiilin yalın hali. He can swims yanlış; he can swim doğru.",
  "examples": [
   "I can swim.",
   "Can you help me?",
   "I can’t speak English very well.",
   "She can drive."
  ],
  "questions": [
   {
    "type": "choice",
    "q": "Doğru cümle hangisi?",
    "options": [
     "I can swimming.",
     "I can swim.",
     "I can to swim."
    ],
    "answers": [
     "I can swim."
    ],
    "why": "can + swim."
   },
   {
    "type": "fill",
    "q": "She can ___ a car.",
    "options": [],
    "answers": [
     "drive"
    ],
    "why": "Can drive."
   },
   {
    "type": "translate",
    "q": "“İyi yüzebilirim.” İngilizce yaz.",
    "options": [],
    "answers": [
     "I can swim well."
    ],
    "why": "I can swim well."
   },
   {
    "type": "choice",
    "q": "“Can you help me?” anlamı?",
    "options": [
     "Bana yardım edebilir misin?",
     "Neredesin?",
     "Ne yapıyorsun?"
    ],
    "answers": [
     "Bana yardım edebilir misin?"
    ],
    "why": "Yardım isteme sorusu."
   }
  ]
 },
 {
  "id": "L12",
  "level": "A1",
  "title": "Have / Has",
  "tr": "Sahip olmak",
  "rule": "I/you/we/they have, he/she/it has.",
  "examples": [
   "I have a car.",
   "She has a dog.",
   "We have time.",
   "Do you have a ticket?"
  ],
  "questions": [
   {
    "type": "fill",
    "q": "I ___ a phone.",
    "options": [],
    "answers": [
     "have"
    ],
    "why": "I have."
   },
   {
    "type": "choice",
    "q": "She ___ a car.",
    "options": [
     "have",
     "has",
     "having"
    ],
    "answers": [
     "has"
    ],
    "why": "She has."
   },
   {
    "type": "translate",
    "q": "“Bir biletim var.” İngilizce yaz.",
    "options": [],
    "answers": [
     "I have a ticket."
    ],
    "why": "a ticket."
   },
   {
    "type": "choice",
    "q": "Doğru soru hangisi?",
    "options": [
     "Have you a ticket?",
     "Do you have a ticket?",
     "Does you have a ticket?"
    ],
    "answers": [
     "Do you have a ticket?"
    ],
    "why": "Do you have...?"
   }
  ]
 },
 {
  "id": "L13",
  "level": "A1",
  "title": "There is / There are",
  "tr": "Bir şey var",
  "rule": "Tekil için there is, çoğul için there are.",
  "examples": [
   "There is a hotel nearby.",
   "There are two chairs.",
   "Is there a pharmacy?",
   "There is no water."
  ],
  "questions": [
   {
    "type": "choice",
    "q": "There ___ a hotel here.",
    "options": [
     "are",
     "is",
     "am"
    ],
    "answers": [
     "is"
    ],
    "why": "Tekil a hotel → is."
   },
   {
    "type": "fill",
    "q": "There ___ three rooms.",
    "options": [],
    "answers": [
     "are"
    ],
    "why": "Çoğul → are."
   },
   {
    "type": "translate",
    "q": "“Yakında bir otel var.” İngilizce yaz.",
    "options": [],
    "answers": [
     "There is a hotel nearby."
    ],
    "why": "There is..."
   },
   {
    "type": "choice",
    "q": "“Is there a pharmacy?” ne demek?",
    "options": [
     "Eczane var mı?",
     "Eczaneye gidiyorum",
     "Eczane nerede?"
    ],
    "answers": [
     "Eczane var mı?"
    ],
    "why": "Is there...?"
   }
  ]
 },
 {
  "id": "L14",
  "level": "A1",
  "title": "At / In / On",
  "tr": "Yer ve zaman",
  "rule": "At 9 o’clock; on Monday; in October. At the hotel, in the room.",
  "examples": [
   "I wake up at nine.",
   "I work on Monday.",
   "I live in Istanbul.",
   "I am at the hotel."
  ],
  "questions": [
   {
    "type": "choice",
    "q": "I wake up ___ 9.",
    "options": [
     "in",
     "on",
     "at"
    ],
    "answers": [
     "at"
    ],
    "why": "Saatlerden önce at."
   },
   {
    "type": "fill",
    "q": "I live ___ Istanbul.",
    "options": [],
    "answers": [
     "in"
    ],
    "why": "Şehirlerden önce in."
   },
   {
    "type": "choice",
    "q": "I work ___ Monday.",
    "options": [
     "on",
     "at",
     "in"
    ],
    "answers": [
     "on"
    ],
    "why": "Günlerden önce on."
   },
   {
    "type": "translate",
    "q": "“Oteldeyim.” İngilizce yaz.",
    "options": [],
    "answers": [
     "I'm at the hotel.",
     "I am at the hotel."
    ],
    "why": "at the hotel."
   }
  ]
 },
 {
  "id": "L15",
  "level": "A1",
  "title": "Past Simple — was/were",
  "tr": "Dün neredeydin?",
  "rule": "I/he/she/it was; you/we/they were. Past = geçmiş.",
  "examples": [
   "I was tired yesterday.",
   "We were at home.",
   "Was she happy?",
   "You were late."
  ],
  "questions": [
   {
    "type": "fill",
    "q": "I ___ at home yesterday.",
    "options": [],
    "answers": [
     "was"
    ],
    "why": "I was."
   },
   {
    "type": "choice",
    "q": "They ___ late.",
    "options": [
     "was",
     "were",
     "are"
    ],
    "answers": [
     "were"
    ],
    "why": "They were."
   },
   {
    "type": "translate",
    "q": "“Dün yorgundum.” İngilizce yaz.",
    "options": [],
    "answers": [
     "I was tired yesterday."
    ],
    "why": "was = geçmiş."
   },
   {
    "type": "choice",
    "q": "Doğru soru hangisi?",
    "options": [
     "Was you tired?",
     "Were you tired?",
     "Did you were tired?"
    ],
    "answers": [
     "Were you tired?"
    ],
    "why": "You were → Were you...?"
   }
  ]
 },
 {
  "id": "L16",
  "level": "A1",
  "title": "Past Simple — did",
  "tr": "Dün ne yaptın?",
  "rule": "Düzenli fiiller -ed: worked, played. Olumsuz ve soruda did + yalın fiil.",
  "examples": [
   "I worked yesterday.",
   "Did you call me?",
   "I didn’t go out.",
   "She watched a movie."
  ],
  "questions": [
   {
    "type": "choice",
    "q": "I ___ yesterday.",
    "options": [
     "work",
     "worked",
     "working"
    ],
    "answers": [
     "worked"
    ],
    "why": "Geçmiş düzenli fiil -ed."
   },
   {
    "type": "fill",
    "q": "___ you call me?",
    "options": [],
    "answers": [
     "Did"
    ],
    "why": "Did you...?"
   },
   {
    "type": "choice",
    "q": "Doğru olumsuz hangisi?",
    "options": [
     "I didn't went.",
     "I didn't go.",
     "I don't went."
    ],
    "answers": [
     "I didn't go."
    ],
    "why": "didn’t sonrası go."
   },
   {
    "type": "translate",
    "q": "“Dün çalıştım.” İngilizce yaz.",
    "options": [],
    "answers": [
     "I worked yesterday."
    ],
    "why": "worked."
   }
  ]
 },
 {
  "id": "L17",
  "level": "A2",
  "title": "Irregular Verbs",
  "tr": "Düzensiz geçmiş",
  "rule": "go → went; eat → ate; see → saw; buy → bought. Did sorusunda kök fiil kullan.",
  "examples": [
   "I went home.",
   "I ate breakfast.",
   "She saw a film.",
   "We bought tickets."
  ],
  "questions": [
   {
    "type": "choice",
    "q": "go fiilinin geçmişi?",
    "options": [
     "goed",
     "went",
     "gone"
    ],
    "answers": [
     "went"
    ],
    "why": "go → went."
   },
   {
    "type": "fill",
    "q": "I ___ breakfast at seven.",
    "options": [],
    "answers": [
     "ate"
    ],
    "why": "eat → ate."
   },
   {
    "type": "choice",
    "q": "Doğru soru hangisi?",
    "options": [
     "Did you went?",
     "Did you go?",
     "Do you went?"
    ],
    "answers": [
     "Did you go?"
    ],
    "why": "Did + go."
   },
   {
    "type": "translate",
    "q": "“Eve gittim.” İngilizce yaz.",
    "options": [],
    "answers": [
     "I went home."
    ],
    "why": "went home; to yok."
   }
  ]
 },
 {
  "id": "L18",
  "level": "A2",
  "title": "Future — going to",
  "tr": "Planlarını anlat",
  "rule": "Önceden planlanmış gelecek: am/is/are going to + fiil.",
  "examples": [
   "I am going to travel.",
   "We are going to study.",
   "She is going to call.",
   "Are you going to work?"
  ],
  "questions": [
   {
    "type": "choice",
    "q": "I ___ going to travel.",
    "options": [
     "am",
     "is",
     "are"
    ],
    "answers": [
     "am"
    ],
    "why": "I am going to..."
   },
   {
    "type": "fill",
    "q": "She is going to ___ me.",
    "options": [],
    "answers": [
     "call"
    ],
    "why": "going to + yalın fiil."
   },
   {
    "type": "translate",
    "q": "“Yarın çalışacağım.” İngilizce yaz.",
    "options": [],
    "answers": [
     "I'm going to work tomorrow.",
     "I am going to work tomorrow."
    ],
    "why": "going to work."
   },
   {
    "type": "choice",
    "q": "Doğru soru hangisi?",
    "options": [
     "Are you going to study?",
     "Do you going to study?",
     "Will you going to study?"
    ],
    "answers": [
     "Are you going to study?"
    ],
    "why": "Are + going to."
   }
  ]
 },
 {
  "id": "L19",
  "level": "A2",
  "title": "Future — will",
  "tr": "Anlık karar ve tahmin",
  "rule": "Will + yalın fiil; olumsuz won’t.",
  "examples": [
   "I will help you.",
   "It will rain tomorrow.",
   "I won’t be late.",
   "Will you come?"
  ],
  "questions": [
   {
    "type": "choice",
    "q": "I ___ help you.",
    "options": [
     "will",
     "am",
     "do"
    ],
    "answers": [
     "will"
    ],
    "why": "will help."
   },
   {
    "type": "fill",
    "q": "It ___ rain tomorrow.",
    "options": [],
    "answers": [
     "will"
    ],
    "why": "Tahmin: will."
   },
   {
    "type": "translate",
    "q": "“Geç kalmayacağım.” İngilizce yaz.",
    "options": [],
    "answers": [
     "I won't be late.",
     "I will not be late."
    ],
    "why": "won’t."
   },
   {
    "type": "choice",
    "q": "Doğru ifade hangisi?",
    "options": [
     "She will goes.",
     "She will go.",
     "She will going."
    ],
    "answers": [
     "She will go."
    ],
    "why": "will + go."
   }
  ]
 },
 {
  "id": "L20",
  "level": "A2",
  "title": "Comparatives",
  "tr": "Karşılaştırma",
  "rule": "Short: small → smaller; long: expensive → more expensive; good → better.",
  "examples": [
   "This phone is cheaper.",
   "English is easier now.",
   "This hotel is more expensive.",
   "Today is better."
  ],
  "questions": [
   {
    "type": "choice",
    "q": "big karşılaştırma hali?",
    "options": [
     "more big",
     "bigger",
     "biggest"
    ],
    "answers": [
     "bigger"
    ],
    "why": "big → bigger."
   },
   {
    "type": "fill",
    "q": "This is ___ expensive.",
    "options": [],
    "answers": [
     "more"
    ],
    "why": "more expensive."
   },
   {
    "type": "choice",
    "q": "good karşılaştırma hali?",
    "options": [
     "gooder",
     "best",
     "better"
    ],
    "answers": [
     "better"
    ],
    "why": "good → better."
   },
   {
    "type": "translate",
    "q": "“Bu otel daha pahalı.” İngilizce yaz.",
    "options": [],
    "answers": [
     "This hotel is more expensive."
    ],
    "why": "more expensive."
   }
  ]
 },
 {
  "id": "L21",
  "level": "A2",
  "title": "Present Perfect — experience",
  "tr": "Hiç yaptın mı?",
  "rule": "have/has + V3. Deneyimlerde ever/never; geçmiş zaman ifadesi vermiyorsan uygun.",
  "examples": [
   "I have been to Thailand.",
   "Have you ever tried sushi?",
   "She has never flown.",
   "I have seen that film."
  ],
  "questions": [
   {
    "type": "choice",
    "q": "I ___ been to Thailand.",
    "options": [
     "has",
     "have",
     "am"
    ],
    "answers": [
     "have"
    ],
    "why": "I have been..."
   },
   {
    "type": "fill",
    "q": "She ___ never flown.",
    "options": [],
    "answers": [
     "has"
    ],
    "why": "She has."
   },
   {
    "type": "choice",
    "q": "Have you ___ visited London?",
    "options": [
     "ever",
     "yesterday",
     "last"
    ],
    "answers": [
     "ever"
    ],
    "why": "Have you ever...?"
   },
   {
    "type": "translate",
    "q": "“O filmi gördüm.” İngilizce yaz.",
    "options": [],
    "answers": [
     "I have seen that film."
    ],
    "why": "have + seen."
   }
  ]
 },
 {
  "id": "L22",
  "level": "A2",
  "title": "Must / Have to / Should",
  "tr": "Zorunluluk ve öneri",
  "rule": "Must/have to = zorunluluk, should = tavsiye; ardından yalın fiil.",
  "examples": [
   "You should rest.",
   "I have to work.",
   "You must wear a seat belt.",
   "You shouldn’t worry."
  ],
  "questions": [
   {
    "type": "choice",
    "q": "Tavsiye vermek için hangisi?",
    "options": [
     "should",
     "was",
     "did"
    ],
    "answers": [
     "should"
    ],
    "why": "should = tavsiye."
   },
   {
    "type": "fill",
    "q": "I have ___ work tomorrow.",
    "options": [],
    "answers": [
     "to"
    ],
    "why": "have to."
   },
   {
    "type": "choice",
    "q": "Doğru olan hangisi?",
    "options": [
     "You should to rest.",
     "You should resting.",
     "You should rest."
    ],
    "answers": [
     "You should rest."
    ],
    "why": "should + rest."
   },
   {
    "type": "translate",
    "q": "“Dinlenmelisin.” İngilizce yaz.",
    "options": [],
    "answers": [
     "You should rest."
    ],
    "why": "should rest."
   }
  ]
 },
 {
  "id": "L23",
  "level": "A2",
  "title": "If — First Conditional",
  "tr": "Olası gelecek",
  "rule": "If + Present Simple, will + fiil: If it rains, I will stay home.",
  "examples": [
   "If I have time, I will call you.",
   "If it rains, we will stay home.",
   "I will study if I am free.",
   "If you practice, you will improve."
  ],
  "questions": [
   {
    "type": "choice",
    "q": "If it ___, I will stay home.",
    "options": [
     "will rain",
     "rains",
     "raining"
    ],
    "answers": [
     "rains"
    ],
    "why": "If cümlesinde present."
   },
   {
    "type": "fill",
    "q": "If I have time, I ___ call.",
    "options": [],
    "answers": [
     "will"
    ],
    "why": "Ana cümlede will."
   },
   {
    "type": "choice",
    "q": "Doğru olan hangisi?",
    "options": [
     "If I will study, I learn.",
     "If I study, I will learn.",
     "If I studies, I will learn."
    ],
    "answers": [
     "If I study, I will learn."
    ],
    "why": "If + present, will + verb."
   },
   {
    "type": "translate",
    "q": "“Vaktim olursa seni ararım.” İngilizce yaz.",
    "options": [],
    "answers": [
     "If I have time, I'll call you.",
     "If I have time, I will call you."
    ],
    "why": "If I have time..."
   }
  ]
 },
 {
  "id": "L24",
  "level": "A2",
  "title": "İş ve seyahat diyaloğu",
  "tr": "Gerçek hayatta konuşma",
  "rule": "Nazik istek: Could you...? / I’d like... / How much...?",
  "examples": [
   "I’d like to check in.",
   "Could you help me?",
   "How much does it cost?",
   "Where is the train station?"
  ],
  "questions": [
   {
    "type": "choice",
    "q": "“Yardım edebilir misiniz?” hangisi?",
    "options": [
     "Do you help?",
     "Could you help me?",
     "You help me."
    ],
    "answers": [
     "Could you help me?"
    ],
    "why": "Nazik rica."
   },
   {
    "type": "fill",
    "q": "How ___ does it cost?",
    "options": [],
    "answers": [
     "much"
    ],
    "why": "How much...?"
   },
   {
    "type": "translate",
    "q": "“Tren istasyonu nerede?” İngilizce yaz.",
    "options": [],
    "answers": [
     "Where is the train station?"
    ],
    "why": "Where is...?"
   },
   {
    "type": "choice",
    "q": "I’d like to check in hangi durumda kullanılır?",
    "options": [
     "Otele giriş",
     "Bilet iptali",
     "Yemek siparişi"
    ],
    "answers": [
     "Otele giriş"
    ],
    "why": "Check in = giriş kaydı."
   }
  ]
 }
];
