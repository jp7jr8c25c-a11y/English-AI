'use strict';
// Detailed bilingual teaching notes; maintained separately from the accepted 24-lesson quiz bank.
const LESSON_GUIDES={
  "L01": {
    "intro": "Selamlaşmayı öğrenirken kendini tanıtmayı ve karşındaki kişiye kısa bir soru sormayı çalış. Tanışmada resmi ya da günlük ifadeler kullanılabilir.",
    "steps": [
      "İlk karşılaşmada “Hello” veya “Hi” de.",
      "Kendini “My name is ...” veya “I am ...” ile tanıt.",
      "Karşındaki kişiye “How are you?” sor; cevap verirken “I’m fine, thank you.” kullanabilirsin."
    ],
    "mistake": "“My name Ali” değil, “My name is Ali” yaz. İngilizcede burada is gerekir.",
    "meanings": [
      "Merhaba!",
      "Benim adım Ali.",
      "Tanıştığıma memnun oldum.",
      "Nasılsın?"
    ]
  },
  "L02": {
    "intro": "İngilizcede isim cümlesi kurarken be fiilini atlamayız. I ve you farklı be biçimleri kullanır.",
    "steps": [
      "“I” ile “am” kullan: I am happy.",
      "“You” ile “are” kullan: You are ready.",
      "Konuşmada I am → I’m ve You are → You’re kısaltmaları yaygındır."
    ],
    "mistake": "“I from Turkey” değil, “I am from Turkey.”",
    "meanings": [
      "Ben Türkiye’denim.",
      "Sen benim arkadaşımsın.",
      "Mutluyum.",
      "Hazırsın."
    ]
  },
  "L03": {
    "intro": "He, she ve it üçüncü tekil kişidir. Bunlarla am veya are yerine is kullanılır.",
    "steps": [
      "Erkek kişi için he, kadın kişi için she kullan.",
      "Nesne/hayvan için çoğu durumda it kullan.",
      "“He is”, “She is”, “It is” doğru biçimlerdir."
    ],
    "mistake": "“He are a teacher” değil, “He is a teacher.”",
    "meanings": []
  },
  "L04": {
    "intro": "Be fiiliyle soru sormak için am/is/are fiilini başa taşı. Soru sözcükleri daha özel bilgi ister.",
    "steps": [
      "“You are ready.” → “Are you ready?”",
      "“She is here.” → “Is she here?”",
      "“Where” nerede, “what” ne, “who” kim anlamındadır."
    ],
    "mistake": "“You are ready?” yerine öğrenme aşamasında “Are you ready?” kullan.",
    "meanings": []
  },
  "L05": {
    "intro": "Present Simple tekrarlanan işleri, rutinleri ve genel gerçekleri anlatır. I/you/we/they ile fiilin yalın biçimi kullanılır.",
    "steps": [
      "“I work every day.” günlük rutindir.",
      "“You study English.” alışkanlık anlatır.",
      "Always, usually, often, sometimes gibi zarflar sıklığı belirtir."
    ],
    "mistake": "“I am work every day” yanlış. Rutin için “I work every day.”",
    "meanings": []
  },
  "L06": {
    "intro": "Present Simple üçüncü tekil şahısta he/she/it öznesinden sonra fiil genellikle -s veya -es alır.",
    "steps": [
      "He works. / She studies.",
      "go → goes, watch → watches, study → studies.",
      "I work ile He works karşılaştırmasını yap."
    ],
    "mistake": "“She work” yerine “She works” de.",
    "meanings": []
  },
  "L07": {
    "intro": "Present Simple sorularında do/does yardımcı fiilleri gerekir. Does kullanıldığında ana fiil yalın olur.",
    "steps": [
      "Do you work here?",
      "Does he speak English?",
      "Do/does soru başında; diğer fiil yalın biçimdedir."
    ],
    "mistake": "“Does she works?” değil, “Does she work?”",
    "meanings": []
  },
  "L08": {
    "intro": "Rutinleri olumsuz yapmak için don’t veya doesn’t kullanılır.",
    "steps": [
      "I don’t drink coffee.",
      "He doesn’t work on Sunday.",
      "Doesn’t sonrası fiile -s eklenmez."
    ],
    "mistake": "“He doesn’t works” değil, “He doesn’t work.”",
    "meanings": []
  },
  "L09": {
    "intro": "Şu anda devam eden hareketler Present Continuous ile anlatılır.",
    "steps": [
      "Özneye göre am/is/are seç.",
      "Fiile -ing ekle: work → working.",
      "“I am studying now.” = Şu anda ders çalışıyorum."
    ],
    "mistake": "“I am study” değil, “I am studying.”",
    "meanings": []
  },
  "L10": {
    "intro": "Present Simple rutinleri, Present Continuous şu anı anlatır. Zaman sözcükleri hangi yapının uygun olduğunu gösterir.",
    "steps": [
      "Every day, often, usually → Present Simple.",
      "Now, right now, at the moment → Present Continuous.",
      "I work every day. / I am working now."
    ],
    "mistake": "“I am usually get up” yerine “I usually get up.”",
    "meanings": []
  },
  "L11": {
    "intro": "Can beceri ve olanak anlatır; can’t olumsuzudur. Özne değişse bile can ve fiil değişmez.",
    "steps": [
      "I can swim.",
      "She can speak English.",
      "Can you help me? sorusunda can baştadır."
    ],
    "mistake": "“I can swimming” değil, “I can swim.”",
    "meanings": []
  },
  "L12": {
    "intro": "Have/has sahiplik anlatır; günlük yaşamda sık kullanılır.",
    "steps": [
      "I have a car.",
      "She has a new phone.",
      "Has yalnızca he/she/it ile olumlu düz cümlede kullanılır."
    ],
    "mistake": "“He have” değil, “He has.”",
    "meanings": []
  },
  "L13": {
    "intro": "Bir şeyin bir yerde var olduğunu anlatmak için there is/there are kullanılır.",
    "steps": [
      "There is a table. (tekil)",
      "There are two chairs. (çoğul)",
      "Soru: Is there a hotel nearby? / Are there any taxis?"
    ],
    "mistake": "“There is two cars” değil, “There are two cars.”",
    "meanings": []
  },
  "L14": {
    "intro": "Zaman ve yer edatları doğru cümle için önemlidir; ezberden çok örnekle pekiştir.",
    "steps": [
      "at 9 o’clock → belirli saat",
      "on Monday → gün",
      "in October → ay; in the room → oda içinde"
    ],
    "mistake": "“in Monday” değil, “on Monday.”",
    "meanings": []
  },
  "L15": {
    "intro": "Was/were, be fiilinin geçmiş zaman biçimleridir.",
    "steps": [
      "I/he/she/it → was.",
      "You/we/they → were.",
      "Yesterday I was tired. / They were happy."
    ],
    "mistake": "“You was” değil, “You were.”",
    "meanings": []
  },
  "L16": {
    "intro": "Past Simple bitmiş geçmiş eylemi anlatır. Düzenli fiillere -ed eklenir.",
    "steps": [
      "I worked yesterday.",
      "Did you work yesterday? sorusunda fiil yalındır.",
      "I didn’t work yesterday. olumsuz yapıdır."
    ],
    "mistake": "“Did you worked?” değil, “Did you work?”",
    "meanings": []
  },
  "L17": {
    "intro": "Sık kullanılan düzensiz fiillerin geçmiş biçimlerini ayrıca öğrenmek gerekir.",
    "steps": [
      "go → went, eat → ate, see → saw, buy → bought.",
      "Olumlu: I went home yesterday.",
      "Soru: Did you go home? Did’den sonra kök fiil kullan."
    ],
    "mistake": "“Did you went?” değil, “Did you go?”",
    "meanings": []
  },
  "L18": {
    "intro": "Önceden verilmiş plan ve niyetleri going to ile anlatabiliriz.",
    "steps": [
      "I am going to travel.",
      "She is going to study.",
      "Are you going to work tomorrow?"
    ],
    "mistake": "“I going to travel” değil, “I am going to travel.”",
    "meanings": []
  },
  "L19": {
    "intro": "Will gelecek zaman, anlık karar, tahmin veya teklif ifade edebilir.",
    "steps": [
      "I will call you.",
      "I won’t be late.",
      "Will you help me?"
    ],
    "mistake": "“He will goes” değil, “He will go.”",
    "meanings": []
  },
  "L20": {
    "intro": "Comparative iki kişi veya şeyi karşılaştırır.",
    "steps": [
      "small → smaller, fast → faster.",
      "expensive → more expensive.",
      "good → better; A is bigger than B."
    ],
    "mistake": "“more better” değil, sadece “better” de.",
    "meanings": []
  },
  "L21": {
    "intro": "Present Perfect geçmişteki deneyimleri, çoğu zaman tam zamanı belirtmeden anlatır.",
    "steps": [
      "I have visited London.",
      "Have you ever tried sushi?",
      "She has never been to Japan."
    ],
    "mistake": "“I have went” değil, “I have gone” veya bağlama göre “I went.”",
    "meanings": []
  },
  "L22": {
    "intro": "Must / have to zorunluluk, should ise tavsiye anlamı taşır.",
    "steps": [
      "You must wear a seat belt.",
      "I have to work tomorrow.",
      "You should practice every day."
    ],
    "mistake": "“You should to study” değil, “You should study.”",
    "meanings": []
  },
  "L23": {
    "intro": "Gerçekleşmesi mümkün gelecek koşulları First Conditional ile ifade ederiz.",
    "steps": [
      "If + Present Simple kullan.",
      "Sonuç bölümünde will + yalın fiil kullan.",
      "If it rains, I will stay home."
    ],
    "mistake": "“If it will rain” değil, “If it rains.”",
    "meanings": []
  },
  "L24": {
    "intro": "Seyahatte ve iş ortamında nazik, kısa ve anlaşılır ifadeler çok işe yarar.",
    "steps": [
      "Could you help me? = Bana yardımcı olabilir misiniz?",
      "I’d like a ticket. = Bir bilet rica ediyorum.",
      "How much does it cost? = Ne kadar tutuyor?"
    ],
    "mistake": "Kibar isteklerde yalnızca emir vermek yerine “Could you...?” kullan.",
    "meanings": []
  }
};
