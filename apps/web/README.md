# Web uygulaması alt projesi

Durum: Next.js/TypeScript ile çalışan, yalnızca okuma yapan ilk web dilimi.

Sorumluluklar: explorer, tarih seçimi, varlık paneli, perspektif görünümü, hesap/favoriler ve yetkili admin alanı. HTTP adaptörleri aynı uygulamada, domain servislerinden ayrı olacak.

## Kurulum ve çalıştırma

Repo kökünde Node.js 22+ ve npm gerekir. Doğrulanan çalışma ortamı Node.js 24.19.0; doğrudan bağımlılıklar sabit sürümlü, tüm ağaç package-lock.json ile kilitlidir.

    npm ci
    npm run dev

Uygulama [localhost:3000](http://localhost:3000) adresinde açılır. Ortam değişkeni ve üçüncü taraf API anahtarı gerektirmez. Harita zemini, yazı tipleri ve veri gezinmesi çalışma anında üçüncü taraf servise istek göndermez; kaynak bağlantıları kullanıcının açmasıyla ziyaret edilir.

Üretim derlemesi:

    npm run build
    npm start

Node sunucusu gerekir; sayfa güncel UTC yılını sunucuda hesaplar. Statik export bu dilimde yapılandırılmadı. İstenirse Next.js'in anonim derleme telemetrisi NEXT_TELEMETRY_DISABLED=1 ile kapatılır.

## Doğrulama

    npm test
    npm run typecheck
    npm run build
    npx playwright install chromium
    npm run test:e2e

Tarayıcı testi production build'i 127.0.0.1:3100 üzerinde kendisi başlatır. Ayrı bir test tarayıcısı kullanmak gerekirse PLAYWRIGHT_CHROMIUM_EXECUTABLE değişkenine kurulu Chromium executable yolu verilebilir. Linux ortamında Chromium sistem kütüphaneleri de gerekir. Test ayarındaki SwiftShader yalnızca headless test ortamı içindir.

## Uygulanan sınırlar

- `/`: Türkçe atlas, MÖ 4000–güncel yıl, kaynak odak dönemlerine göre üç yerleşim, seçim, arama, doğrudan URL, paylaşma.
- `src/lib/catalog.ts`: static preview repository; UI/route tarih mantığı domain paketindedir.
- MapLibre dinamik yüklenir. WebGL veya zemin yükleme başarısızlığında aynı içerik listeden erişilebilir.
- MapLibre 6 worker ve shared modülü `predev`/`prebuild` sırasında lockfile'daki paketten, BSD lisansı korunarak `public/vendor/maplibre/<sürüm>` altına kopyalanır. Bu üretilmiş dosyalar Git'e alınmaz; derleme/dağıtımda public klasörü korunmalıdır. Worker URL'si açıkça aynı sunucuya bağlanır.
- Bilinen dünya modu henüz eser içermez; modern zemin eski haritaymış gibi gösterilmez.
- Kaynak URL'leri HTTPS olarak doğrulanır; kullanıcı girdisi HTML olarak işlenmez. Harita etiketleri textContent ile oluşturulur.
- Güvenlik başlıkları: nosniff, frame DENY, referrer ve camera/microphone/geolocation kısıtları.
- Giriş, oturum, yetki, veritabanı ve yazma işlemleri bulunmaz. Admin/account yolları açılmadı. Canlı dağıtım yapılmadı.

Tüm kapsam ve sonraki adımlar: [ilk web dilimi](../../docs/09-first-web-slice.md).

Sonraki route planı: /account, /admin/content, /admin/sources, /admin/imports, /admin/releases, /admin/users. packages/contracts/openapi.json tasarım sözleşmesidir; bu preview bir API uygulaması değildir.

Public gezinti hesap gerektirmez. Auth ekranlarının gerçek sağlayıcı oturumu olmadan işlevselmiş gibi görünmesi kabul edilmez.
