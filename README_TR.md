# English AI Teacher v2.1 — iPhone Güncellemesi

**Geliştirici: Ali Erkonak**  
Mevcut koyu tema ve 24 ders/96 soru/ezber defteri korunur. Bu sürüm v2.0'ın küçük ve hedefli güncellemesidir.

## Değişiklikler

1. **Gerçek AI modeli güncellendi.** Cloudflare tarafındaki eski `@cf/meta/llama-3.1-8b-instruct-fast` adı artık mevcut model kataloğunda yok. Bu pakette ücretsiz planda kullanılabilen `@cf/zai-org/glm-4.7-flash` kullanılır (Workers AI ücretsiz kota geçerlidir).
2. **Ayarlar > Gerçek AI bağlantısını test et** eklendi. Test, sunucuda AI üretimi başlatmadan güvenli Worker bağlantısı, AI binding ve erişim kodu varlığını kontrol eder. Başarı mesajı tek başına model yanıtının doğru olduğunu garanti etmez: testten sonra sohbet mesajı gönder.
3. **iPhone mikrofon erişiminde** `not-allowed` vb. hatalar anlaşılır biçimde gösterilir, tekrar tekrar başarısız dinleme başlatılmaz. iPhone klavyesi/dikte alanına tek dokunuşlu geçiş eklendi.
4. Cloudflare AI bağlantısı kurulursa konuşma sekmesindeki mikrofon **en fazla 12 saniyelik ses kaydını** izinle alıp Cloudflare'ın `@cf/openai/whisper-large-v3-turbo` modeline göndermeye çalışır. Bu özellik iPhone Safari, mikrofon izni ve bulut ses modelinin biçim desteğine bağlıdır; iPhone üzerinde canlı test gerektirir. **Gerçek fonetik telaffuz puanı değildir.** Kaydedilen ses uygulamada veya sunucuda kalıcı dosya olarak tutulmaz.
5. Worker adresi eksikken sohbete yazdığın mesaj kaybolmaz; hata mesajları sohbet geçmişine yeni öğretmen yanıtları olarak eklenmez.
6. Ayarlar kısmı, Cloudflare'a yazılacak `ALLOWED_ORIGIN` değerini otomatik gösterir ve kopyalamana izin verir.
7. Yerel veri anahtarı hâlâ **`english_ai_teacher_iphone_v1`**. İlerleme, ezber ve JSON yedekleme mantığı değiştirilmedi. PWA servis çalışanının önbellek sürümü **2.1** yapıldı.

## Güncelleme: iPhone + GitHub Pages

**İlk olarak v2.0 Ayarlar > Yedek indir yap.** Safari ve ana ekrana eklenmiş uygulamanın veri alanları iOS sürümüne göre farklı olabilir. Yedeğini kaybetme.

- Elindeki eski GitHub deponun ana dizininde **`app.js` ve `sw.js`** dosyalarını bu ZIP'tekilerle değiştir.
- `free-cloudflare-ai/worker.js` **GitHub Pages'e yüklenmez**; Cloudflare Worker'ın **Edit Code** ekranında eski Worker kodunu bununla değiştirip **Deploy** yaparsın.
- `index.html`, `style.css`, `data.js`, `guides.js` ve ikonlar değişmedi; eski dosyaların durması yeterli.
- Mevcut GitHub Pages HTTPS adresini Safari'de yenile. Kaydedilmiş PWA ikonunu yeniden oluşturman normalde gerekmez. Önbellek yüzünden eski sürüm devam ederse Safari'den yayın adresini açıp yenile, ardından ana ekran uygulamasını yeniden aç. **Tarayıcı verilerini temizleme!**
- **Ayarlar** sayfasının altında “English AI Teacher 2.1” yazdığını ve **Gerçek AI bağlantısını test et** düğmesini gördüğünü doğrula.

## Ücretsiz Cloudflare AI'yı ilk kez kur (iPhone ile)

1. Safari: <https://dash.cloudflare.com/>. **Workers Free** hesabına giriş yap veya ücretsiz bir hesap oluştur. Ödeme planına yükseltme yapma.
2. **Workers & Pages > Create application > Worker** oluştur. Cloudflare arayüzünde **Edit Code** bölümüne `free-cloudflare-ai/worker.js` dosyasının içeriğini yapıştır ve **Deploy** et. Cloudflare'ın başlangıç şablonu yerine bu kod geçmeli.
3. Worker'ın **Settings > Bindings** kısmında **Workers AI** bağını ekle. **Variable name tam `AI`** olacak. Kaydet / Deploy.
4. **Settings > Variables and Secrets** içinde:
   - `ALLOWED_ORIGIN`: **Text**, değerini English AI Teacher uygulamasında **Ayarlar > ALLOWED_ORIGIN** kutusundan kopyala. Yalnızca `https://kullanici.github.io` benzeri origin; **/depo-adi yolu ve sondaki `/` bulunmasın**.
   - `APP_ACCESS_TOKEN`: **Secret**, 24+ karakter uzunluğunda rastgele ve başka yerde kullanmadığın erişim kodu. Sadece Worker Secret ve kendi iPhone uygulama ayarına yaz. GitHub'a, sohbete veya ekran görüntüsüne gönderme.
5. Cloudflare Worker'ın sunduğu `https://...workers.dev` adresini kopyala.
6. English AI Teacher > **Ayarlar**: Öğretmen modu = **Ücretsiz Cloudflare gerçek AI**, Worker adresi = adım 5, kişisel erişim kodu = adım 4. **Gerçek AI bağlantısını test et** düğmesine bas. Başarılıysa **Ayarları kaydet**.
7. **AI Öğretmen** sekmesinde `I am study English every day` yaz; AI bunu `I study English every day` şeklinde düzeltip Türkçe açıklayabilmeli. Sonra **Konuşma** sekmesinde mikrofon ve izinleri dene.

> Önemli: Cloudflare Worker kodunu GitHub'a koyman onu otomatik devreye almaz. Worker Cloudflare'a ayrıca dağıtılmalı, `AI` binding ile `ALLOWED_ORIGIN` ve `APP_ACCESS_TOKEN` ayarlanmalıdır. Bunlar tamamlanmadan “güvenli HTTPS Worker adresi geçersiz” benzeri bağlantı hatası devam eder.

## iPhone'da mikrofon engellenirse

- Safari'de web sayfasını aç. Adres çubuğundaki **sayfa ayarları** menüsünden **Mikrofon → İzin Ver** (menü isimleri iOS sürümüne göre değişebilir).
- iPhone **Ayarlar > Genel > Klavye > Dikteyi Etkinleştir** açık olsun. Konuşma ekranında metin alanına dokun, klavyenin mikrofon simgesiyle söyle ve **Cümleyi karşılaştır** butonuna bas.
- iOS ana ekran PWA'sında mikrofon / tarayıcı konuşma tanıma API desteği farklı olabilir. Cloudflare bağlantısı hazır olsa da mikrofon erişim izni reddedildiğinde kayıt yapılamaz. Bu durumda **klavye diktesi veya metin yazma** kullanılabilir.
- Ses kaydı (Cloudflare modu) sunucuya gönderilir ve ücretsiz Workers AI kotasından tüketir. Günlük 10.000 Neuron ücretsiz kota sabit konuşma süresi anlamına gelmez; kullanım miktarına göre değişir.

## Güvenlik ve veri

- **OpenAI API, ChatGPT Plus erişimi veya kredi kartı gerekli değildir.** Workers Free planı kullanılacak. Ücretsiz kota bitince AI çağrıları hata verir; ders/ezber yerelde çalışmaya devam eder.
- AI sohbet mesajları ve Cloudflare modunda mikrofonla üretilen kısa kayıtlar **Cloudflare sunucusuna aktarılır**. Sunucuda kayıtların kalıcı saklanması için kod eklenmemiştir. Üçüncü taraf hizmetin işlem politikaları ayrıca geçerlidir.
- Ezber, ders kayıtları ve günlük planlar yerel tarayıcı belleğinde saklanır; yedek almak önerilir. Özel Worker erişim kodu yedek JSON'a yazılmaz.
- Uygulama fonetik/telaffuz analizi yapmaz; transkript metnini hedef cümleyle karşılaştırır.

Resmi kaynaklar:
- <https://developers.cloudflare.com/workers-ai/get-started/dashboard/>
- <https://developers.cloudflare.com/workers-ai/platform/pricing/>
- <https://developers.cloudflare.com/workers-ai/models/glm-4.7-flash/>
- <https://developers.cloudflare.com/workers-ai/models/whisper-large-v3-turbo/>
- <https://support.apple.com/guide/iphone/dictate-text-iph2c0651d2/ios>

## Test sonuçları

- JS sözdizimi: geçti.
- Cloudflare Worker kuralları: taklit/test ortamında origin kontrolü, token doğrulama, bağ testi, sohbet istekleri ve ses yazıya çevirme yolu geçti.
- Mobil genişlikte tarayıcıda dosyaları sayfaya doğrudan ekleyerek temel arayüz ve kayıt/ezber işlemleri test edildi. Otomatik test ortamının yerel URL'lere erişimi engelli olduğu için canlı PWA ve service-worker akışı burada doğrulanamadı.
- **Gerçek Cloudflare AI yanıtı** ve **iPhone mikrofonu** kullanıcı hesabı/telefonu olmadan test edilemedi.
