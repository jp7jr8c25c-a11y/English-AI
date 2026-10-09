# ENGLISH AI TEACHER — iPHONE v1.0

Geliştirici: Ali Erkonak

Bu proje **Mac ve Xcode kullanmadan** iPhone ana ekranında uygulama gibi açılan bir PWA'dır. Normal bir `.ipa` veya App Store uygulaması değildir. `index.html` dosyasını Dosyalar içinden açmak çevrimdışı önbellekleme için YETERLİ DEĞİLDİR; PWA'nın bir defa HTTPS sunucusunda açılması gerekir.

## Sürümde hazır olanlar

- Türkçe açıklamalı 24 İngilizce dersi: 4 A0 + 12 A1 + 8 A2.
- 96 kontrol sorusu: çoktan seçmeli, boşluk doldurma ve İngilizce çeviri.
- %75 geçme notu, yeni ders kilidi, puanlar, hataları kaydetme, tekrar aralıkları.
- Günlük çalışma günleri, seri takibi, temel gelişim göstergeleri.
- Cümlelerin iPhone sesleriyle seslendirilmesi; mümkün olduğunda İngilizce kadın sesi öncelikli.
- SpeechRecognition desteklenirse sesli metin tanıma; çalışmazsa iPhone klavyesinin yerleşik Dikte butonu.
- Yalnızca tanınan *kelimeleri* cümleyle karşılaştırır; profesyonel telaffuz puanı VERMEZ.
- Cihazda JSON yedek al/ver, internetsiz ders içeriği ve yerel kayıt.
- Üç ayrı öğretmen çalışma modu (farklar aşağıda).

## Mac olmadan iPhone üzerinde yayınlama — GitHub Pages

GitHub Pages ilk yükleme için internet gerektirir. GitHub hesabıyla iPhone Safari'den:

1. Dosyalar uygulamasında ZIP'e dokun, açılan `English_AI_Teacher_iPhone_v1` klasörüne gir.
2. GitHub web sitesinden bir **public** depo oluştur: örn. `english-ai-teacher` (depo kodu herkese açık olur; uygulama kaydı değildir). Dışarıdan erişim istemezsen özel HTTPS barındırma alternatifi gerekir.
3. Depodaki `Add file > Upload files` ile **root seviyesindeki** `index.html`, `app.js`, `data.js`, `style.css`, `sw.js`, `manifest.webmanifest`, `icon.svg`, `icon-192.png`, `icon-512.png` dosyalarını yükle. **`optional-cloud-ai` klasörünü yüklemene gerek yok.** iPhone ekranında Upload files görünmezse Safari'de “Masaüstü web sitesini iste” seçeneğini kullan.
4. GitHub `Settings > Pages` bölümüne git; `Deploy from a branch`, `main`, `/(root)` seç ve kaydet. Yayınlanınca `https://KULLANICIADI.github.io/english-ai-teacher/` benzeri bir adres verilir. Yayın birkaç dakika gecikebilir.
5. Adresi iPhone Safari'de aç. Paylaş > Ana Ekrana Ekle > Web Uygulaması Olarak Aç > Ekle. Bundan sonra ikon üzerinden çalıştır.
6. İlk çevrimiçi ziyaret sonrası ders dosyaları önbelleğe alınır; uçak modunda dersi açarak kontrol et. AI modeli ve bulut AI çevrimdışı sayılmaz.

**Önemli:** Ders ilerlemesi GitHub'a veya ChatGPT'ye gönderilmez. Yalnızca iPhone cihazındaki web uygulama depolama alanına yazılır. Güvenli Worker erişim kodu cihazda tutulur ancak yedek JSON dosyasına dahil edilmez. Çerez/veri temizliği, uygulamayı kaldırma veya iOS depolama tasarrufu verileri etkileyebilir. Düzenli `Ayarlar > Yedek indir` kullan.

## Öğretmen modları

**1. Çevrimdışı hazır koç (varsayılan):** Dersler ve sınavlar gerçek şekilde çalışır. Sohbet ise sınırlı, kurallarla hazırlanmış cevaplar döndürür. Bu mod üretken AI **değildir**.

**2. iPhone'da yerel gerçek AI — deneysel:** `Ayarlar > iPhone'da küçük gerçek AI`, sonra `AI Öğretmen > Cihaz AI modelini yükle`. Safari 26+ WebGPU ve uygun donanım gerekir. WebLLM üzerinden `SmolLM2-360M-Instruct-q4f16_1-MLC` indirilir (yaklaşık yüzlerce MB RAM/depolama). İlk başlatma internet ister; Safari büyük model yüklenirken kapanabilir veya cihaz modu hiç çalışmayabilir. Modelin cevapları güçlü sunucu modelinden belirgin biçimde zayıf olabilir. CDN önbelleği garanti edilmez. Başaramazsa başka moda geç.

**3. Güçlü çevrimiçi gerçek AI — isteğe bağlı:** Bir AI servis anahtarı ve güvenli Cloudflare Worker gerekir. Sunucu kodu `optional-cloud-ai/worker.js` içindedir. **API anahtarını web sayfasına, GitHub deposuna, JavaScript kaynak koduna veya sohbet bölümüne ASLA yazma.**

  - Cloudflare hesabında bir Worker oluşturup `worker.js` kodunu yapıştır ve yayımla.
  - `Settings > Variables and Secrets` içine **Secret** olarak `OPENAI_API_KEY` ve kendin oluşturduğun en az 24 karakterli `APP_ACCESS_TOKEN` ekle. API anahtarı için ayrı API faturası geçerli olabilir; ChatGPT aboneliği API kredisi değildir.
  - **Variable** olarak `ALLOWED_ORIGIN` = `https://KULLANICIADI.github.io` gir (sonda / olmayacak). İstersen `AI_MODEL` da belirle.
  - AI sağlayıcıda uygun harcama sınırı belirle. Örnekte dağıtık güvenilir kota/kimlik doğrulama çözümü bulunmadığı için Worker'ı geniş çapta paylaşma.
  - iPhone uygulamasında `Ayarlar > Güvenli sunucuda güçlü gerçek AI`, Worker HTTPS adresi ve **APP_ACCESS_TOKEN** değerini gir. Bu alan **OPENAI_API_KEY değildir.**
  - Bulut AI ile yazıştığında mesaj içeriği Worker'a ve AI sağlayıcısına iletilir. Ders kayıtları yine iPhone'da tutulur.

## Sınırlar

- Bu, **1.0 temel sürümdür**, A0–A2 derslerinin tamamı CEFR programının bütün kapsamı değildir. B1–C1 dersleri henüz içerik olarak eklenmedi.
- Kadın sesi her iPhone'da garanti değildir; mevcut iOS seslerine bağlıdır. Konuşma tanıma ana ekrandaki Safari web uygulamasında her sürümde çalışmayabilir. iPhone klavye diktesi yedektir.
- Gerçek üretken AI kullanımındaki teknik ve ücret koşulları seçilen yönteme bağlıdır. Her şeyin internetsiz, ücretsiz ve güçlü bir AI olarak çalıştığı iddia edilmez.
- İçeride reklam veya analiz/izleme servisi yoktur. Girilen Worker ve cihaz model indirme servisleri ayrı isteğe bağlı ağ işlevleridir.

## Proje dosyaları

`index.html` arayüz; `style.css` mobil stil; `app.js` ders, sınav, ilerleme, AI ve ses; `data.js` müfredat ve sorular; `sw.js` temel çevrimdışı önbellek; `manifest.webmanifest` PWA; `icon*` uygulama ikonları. `optional-cloud-ai/worker.js` opsiyonel sunucu.
