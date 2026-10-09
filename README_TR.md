# English AI Teacher v2.0 — iPhone

**Geliştirici:** Ali Erkonak

Bu bir iPhone Safari/PWA uygulamasıdır. Native `.ipa` değildir. Mac veya Xcode olmadan GitHub Pages üzerinden kullanılabilir. Mevcut v1 dosyalarının üstüne aynı GitHub deposuna yüklenirse **aynı origin / aynı tarayıcı profili** koşuluyla v1 ders kayıtlarını korur: depolama anahtarı `english_ai_teacher_iphone_v1` bilerek değiştirilmedi.

## v2.0 içinde yapılanlar

- Önceki 24 ders ve 96 mini sınav sorusu korundu. Her konu için adım adım genişletilmiş Türkçe konu anlatımı, yaygın hata ve dinlenebilir örnekler eklendi (`guides.js`). Bu paket hâlâ tam CEFR A0–C1 kütüphanesi değildir.
- Ana sayfada günlük **20 + 15 + 15 + 10 dakika** hedefli çalışma planı: konu anlatımı, örnek/ezber, sesli pratik, sınav/tekrar. Bölümler manuel işaretlenir; gerçek geçen süreyi ölçmez, zorunlu zamanlayıcı değildir. Her takvim günü yeni plan oluşur; bir ders başarıyla tamamlanmadıysa tekrar önerilir.
- Yeni **☆ Ezber** sayfası: kendi kelime/cümle/notlarını gir, düzenle, sil, dinle; derslerdeki örnekleri veya AI sohbetinden seçtiğin metni kaydet. Çift kayıt uyarısı vardır.
- Kart tekrarları: Kartın İngilizcesini gör, anlamını aç, **Tekrar (10 dk)** / **Zor (1 gün)** / **Bildim (1, 3, 7, 14, 30... gün)** seç. Tekrarlar cihaz saatine bağlıdır; otomatik sistem bildirimi gelmez.
- Eski sohbetler, ders sonuçları ve yeni ezber kartları **Ayarlar > Yedek indir** ile birlikte dışarı alınır. API erişim kodları yedeğe yazılmaz. v1 JSON yedeklerini yüklemeye devam eder.
- Çevrimiçi gerçek AI için **ücretsiz kotada kullanılabilen Cloudflare Workers AI** Worker kodu `free-cloudflare-ai/worker.js` içinde yer alır; OpenAI API anahtarı gerekmez. Kurulum ayrı bir adımdır. Cloudflare ücretsiz kullanım sınırına göre AI sohbet durabilir; ders ve ezber defteri yerel çalışmaya devam eder.

## iPhone üzerinden yeni sürümü yükle

**Önce mevcut v1 uygulamasında `Ayarlar > Yedek indir` yap.** Böylece yayınlama ve Safari önbellek sorunlarına karşı verin korunur.

1. ZIP'i iPhone'da Dosyalar ile aç.
2. Mevcut GitHub deponun ana dizinine şu dosyaları **mevcut adlarıyla** yükle/güncelle: `index.html`, `app.js`, `data.js`, `guides.js`, `style.css`, `sw.js`, `manifest.webmanifest`, `icon.svg`, `icon-192.png`, `icon-512.png`.
3. `free-cloudflare-ai` klasörü **GitHub Pages'e yüklenmek zorunda değil**, Worker tarafında kullanılır. Önceki sürümdeki ücretli OpenAI bağlantısı bu ücretsiz pakete dahil edilmedi.
4. GitHub Pages mevcut yayın adresini Safari'de aç ve yenile. Ana ekran ikonunu açtığında **v2.0**, ana menüde **☆ Ezber** görmelisin.
5. Önceki kayıtlar aynı Safari/site depolama bağlamındaysa otomatik korunur. Safari ve ana ekran uygulamasında depolar bazı iOS sürümlerinde ayrılabilir; boş görürsen **Ayarlar > Yedek yükle** ile v1 yedeğini içe aktar. Yeniden uygulama kurmak veya tarayıcı verisini temizlemek kayıtları silebilir.
6. Test: Dersler > ilk açık ders > örnek satırında ☆ > ezber defterinde Türkçe anlamı doldur > Kaydet > Bugünkü ezberlerimi çalış > Cevabı göster > Bildim > yedek indir.

GitHub Pages kurulmadıysa: GitHub üzerinde public repo oluştur, yukarıdaki kök dosyaları yükle, Settings > Pages > Deploy from branch `main` `/(root)` seç, yayımlanan HTTPS adresini Safari'de aç ve **Paylaş > Ana Ekrana Ekle** kullan. GitHub deposu kaynak kodlarını herkese açık yapar; cihazda tutulan ezber kayıtlarını açığa çıkarmaz.

## Ücretsiz gerçek AI'yı iPhone'da kur

Ücretsiz bağlantı ayrı kurulmadıkça uygulamadaki **Çevrimdışı hazır koç** gerçek üretken AI değildir. Varsayılan kalır ve önceden tanımlı sınırlı cevap verir.

1. `https://dash.cloudflare.com` adresinde **Workers Free** hesap aç veya mevcut hesabınla giriş yap. Ücretli plan seçme.
2. Workers & Pages > Create > **Worker** oluştur. Edit code bölümünde ZIP'teki `free-cloudflare-ai/worker.js` dosyasının **tamamını** yapıştır ve Deploy yap. Kodda hiçbir gizli anahtar yazılmayacak.
3. Worker sayfasında **Settings > Bindings > Add binding > Workers AI** seç, değişken adını `AI` yap. Bu bağ **zorunludur**; yalnızca Worker kodunu yüklemek gerçek AI'ı çalıştırmaz.
4. Worker **Settings > Variables and Secrets** bölümüne şunları ekle:
   - `ALLOWED_ORIGIN` — **Text**: mevcut uygulama adresinin sadece origin bölümü, örn. `https://kullaniciadi.github.io` (depo yolu **olmayacak**, sonuna `/` eklenmeyecek).
   - `APP_ACCESS_TOKEN` — **Secret**: **en az 24 karakter** uzunluğunda kendin oluşturduğun güçlü erişim kodu. Bunu public Github'a yazma. iPhone Ayarlar'da kullanmak üzere güvenli sakla.
5. Uygulama > Ayarlar > Öğretmen modu = **Ücretsiz Cloudflare gerçek AI**; HTTPS Worker adresi = Cloudflare'ın verdiği `https://....workers.dev` adresi; erişim kodu = adım 4'teki `APP_ACCESS_TOKEN`. **Kaydet**.
6. AI Öğretmen bölümünde “I am study English every day” mesajını dene. AI öğretmeni doğru biçimi ve nedenini açıklamalı. Hata varsa Worker ayarlarını kontrol et.

Cloudflare dokümanları: [Workers AI binding](https://developers.cloudflare.com/workers-ai/configuration/bindings/), [Ücretsiz AI kotası](https://developers.cloudflare.com/workers-ai/platform/pricing/), [Model](https://developers.cloudflare.com/workers-ai/models/llama-3.1-8b-instruct-fast/).

### Ücret / gizlilik / sınırlar

- Workers AI Free günlük **10.000 Neuron** ücretsiz kota verir ve sınır aşılınca işlem başarısız olur; gerçek sohbet süresi verilen/üretilen tokenlere ve seçili modele bağlıdır. Kesin 60 veya 120 dakikayı garanti etmiyoruz. iPhone mikrofonu, speech recognition ve TTS ayrı konulardır; sesin değerlendirilmesi bu sürümde profesyonel telaffuz analizi değildir.
- Cloudflare hesabında ücretli seçeneğe yükseltmediğin sürece önerilen Worker için ücretli API kullanılmaz. Kullanım ve ücretlendirme politikaları zamanla değişebilir; Cloudflare panelinden plan ve kotaları kontrol et.
- AI sohbetine yazdığın metinler Cloudflare'a gönderilir. Yerel ders ilerlemesi / kartlar / günlük planlar gönderilmez; yalnızca sohbete yazdığın metin ve sınırlı ders bağlamı gönderilir. Cihazda saklanan `APP_ACCESS_TOKEN` JSON yedeğine dahil edilmez. Kodları herkese açık paylaşmak doğrudan şifreyi paylaşmaz ama kişisel Worker token'ını gizli tutmalısın.
- AI modelleri hatalı açıklamalar verebilir; doğruluğu programdaki hazırlanmış ders ve testlerle birlikte değerlendir.
- iPhone'un bildirim sistemi için ayrı izinli push altyapısı kurulmamıştır; ezber zamanı geldiğinde uygulamada görünür, otomatik bildirim yoktur.

## Proje dosyaları

`index.html` sayfa ve sekmeler, `style.css` koyu arayüz, `app.js` iş mantığı, `data.js` 24 ders / 96 soru, `guides.js` genişletilmiş anlatım, `sw.js` çevrimdışı önbellek, ikonlar/PWA manifesti, `free-cloudflare-ai/worker.js` **ücretsiz kota AI gateway**, Ücretli OpenAI bağlantısı bu paketle verilmez.
