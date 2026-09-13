# Doğrulama sonucu

12 Eylül 2026'da yapılan kontroller. İlk plan aktarımı ile çalışan web diliminin doğrulamaları ayrı kaydedilmiştir.

## Çalışan web dilimi

| Kontrol | Sonuç | Kapsam |
|---|---|---|
| Temiz kurulum | Geçti | Ayrı kaynak kopyasında node_modules, .next ve üretilmiş vendor dosyaları olmadan npm ci |
| Production build | Geçti | Next.js 16.3.5; TypeScript strict; MapLibre worker varlıklarının otomatik üretilmesi |
| Typecheck | Geçti | Uygulama, domain bildirimleri, test dosyaları |
| Domain ve içerik testleri | 12/12 geçti | MÖ/MS, aralık uçları, kaynak zorunluluğu, HTTPS kaynak URL'leri, arama, görünüm URL'si, DMS koordinat dönüşümü |
| Tarayıcı kontrolleri | 6/6 geçti | Harita ve kaynak seçimi; eski seçimin temizlenmesi; MÖ/MS/yıl 0; mod/klavye; mobil seçim; WebGL fallback |
| Görünüm incelemesi | Yapıldı | 1440×1000 masaüstü ve 390×844 mobil, yerel headless Chromium ekran görüntüleri |
| Üretim bağımlılık taraması | Bilinen açık bildirilmedi | npm audit --omit=dev; bu sonuç uygulamanın tüm güvenliğini doğrulamaz |
| Coğrafi referans | Eşleşti | Natural Earth yerel JSON'u sabit upstream commit ile karşılaştırıldı |
| Üçüncü taraf çalışma anı isteği | Yok | Açılış ve seçim senaryosunda zemin, worker, yazı tipi ve içerik aynı uygulamadan |

Tarayıcı ortamı: Playwright 1.63.0 ve Chromium 153.0.8010.0, SwiftShader. Standart Playwright tarayıcı indirme sunucusu bu ortamda 502/zaman aşımı döndürdüğü için testte @sparticuz/chromium 153.0.0 paketindeki yerel Chromium kullanıldı. Bu paket uygulama bağımlılığına eklenmedi. Gerçek cihaz ve hedef kullanıcı testi yapılmadı.

Doğrulamada MapLibre 6'nın ayrı module worker adresinin bundler dönüşümünden sonra boş kaldığı saptandı. Worker ve shared modülü derleme sırasında aynı sunucuya kopyalanarak açık URL verildi. Kaynak dosya kopyası, lisans ve sürüm eşleşmesi otomatik hazırlama adımında korunur. Mobil seçimde bilgi paneline kaydırma ve yükleme başarısızlığında liste erişimi uygulanmıştır.

## İlk plan ve GitHub aktarımı

| Kontrol | Sonuç | Kapsam |
|---|---|---|
| GitHub hesap kimliği | Doğrulandı | Bağlı kullanıcı hturkmen |
| Uzak repo erişimi | Doğrulandı | Kullanıcı tarafından oluşturulan public repo; main dalı ve yazma erişimi mevcut |
| Başlangıç dosyalarının aktarımı | Geçti | İlk içerik commit'indeki 32 dosyanın GitHub blob hash değerleri yerel içerikle birebir eşleşti |
| GitHub görev kayıtları | Geçti | 45 tekil görev kimliği; 44 açık, 1 tamamlanmış kapalı kayıt |
| Tarih çekirdeği | 7/7 test geçti | MÖ/MS, exclusive bitiş, belirsizlik ve hatalı girdi |
| Tarih round-trip | Geçti | MÖ 4000–MS 2026 arası 6.026 yıl |
| Backlog | Geçti | 8 alt proje, 45 tekil görev; eksik bağımlılık/döngü yok |
| JSON ve yerel belge bağlantıları | Geçti | Paket içi dosyalar |
| API yapısal kontrolü | Geçti | 28 işlem, 31 schema; internal referans/path/operationId/auth beyanı |
| Issue aktarım önizlemesi | Geçti | 45 görev; dış yazma yapılmadı |
| Issue yardımcısı güvenlik denemesi | Geçti | Offline mock ile önizlemede ağ yok, yanlış hesapta yazma yok, mevcut 45 marker için duplicate yok |

Kontrol sırasında /meta uç noktasını /me ile yanlış eşleştiren doğrulayıcı koşulu düzeltildi. Son kontrol geçti.

## Henüz yapılmayanlar

- Tam OpenAPI standardı doğrulayıcısı ve gerçek servis contract testleri.
- Fiziksel telefon/Safari/Firefox matrisi, kullanıcı deneyimi görüşmeleri ve performans/yük ölçümü.
- PostgreSQL/PostGIS migration, RLS ve canlı auth/MFA entegrasyonu.
- Gerçek tarihsel veri import'u, eser lisans onayı ve tarihsel uzman incelemesi.
- Üretim güvenlik testleri, CDN geri çekme, restore veya yük testi.
- GitHub Projects panosu ve üretim CI kurulumu.

İlk içerik commit'i: [b3a73dc](https://github.com/hturkmen/civilisation-atlas/commit/b3a73dcdbf61e836f55b65897023bf037ce03944). Görev kayıtları repository issues API üzerinden yeniden okunarak doğrulandı.

Sonradan eklenen [görev dizini](../backlog/github-issues.md) ve JSON eşleştirmesi ilk aktarımın durumunu belgeler.

Bu sınırlar nedeniyle “üretim sitesi hazır”, “güvenlik tamam” veya “bütün tarihsel veriler doğrulandı” sonucu çıkarılamaz. İlk çalışan dilim ve kapsam dışı kalanlar [uygulama durumunda](09-first-web-slice.md) açıklanır.
