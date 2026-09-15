# Civilisation Atlas — Dünya Medeniyet Atlası

MÖ 4000'den günümüze tarih seçerek dünya medeniyetlerini harita üzerinde keşfetme projesi.

**Durum: ilk etkileşimli demo yayında.** [Demoyu aç](https://civilisation-atlas-hturkmen.halilturkmen.chatgpt.site) — erişim proje sahibine özeldir. Tarih seçimi, MapLibre haritası, üç kaynaklı yerleşim, arama ve bilgi paneli uygulanmıştır. Tam tarihsel sınır koleksiyonu, kullanıcı girişi, admin ve veritabanı/API henüz yoktur. [Demo kapsamı ve doğrulama](docs/10-live-demo.md).

**Kaynaklı alan katmanı:** 17 siyasi yapı ve 35 seçilmiş kayıt; MS 1500'de beş siyasi yapı, boş yıllardan en yakın kaynaklı yıla geçiş ve duraklara göre oynatma. [Güncel kapsam ve doğrulama](docs/14-collection-discovery.md).

**13 Eylül görsel geliştirmesi:** 1507 Waldseemüller haritası, arşiv inceleyicisi, koleksiyon durakları ve aynı dönemdeki yerleşimler arasında geçiş eklendi. [Görsel öncelikler ve kalanlar](docs/11-visual-priorities.md) · [Devam ve otomasyon durumu](docs/12-continuation.md).

Kapsam sahibi: hturkmen. Hazırlanma tarihi: 12 Eylül 2026. Proje adı teknik çalışma adıdır; marka/domain uygunluğu araştırılmadı.

## Kesinleşen ürün kararları

- İki ayrı görünüm: tarihsel dünya ve belirli bir toplumun/düşünürün dönemin bilinen dünyası.
- MÖ 4000 → günümüz tarih gezinmesi; tarihsel veri bulunmayan bölgeler açıkça belirtilir.
- Haritada döneme uygun isimler, seçim ve kaynaklı detay paneli.
- Kolay, etkileyici, mobil kullanıma uygun deneyim.
- Admin paneli ve kullanıcı altyapısı.
- Web önce; aynı veri ve API üzerine mobil uygulama sonra.
- Belirsiz sınırlar, tarihler ve tartışmalı yorumlar kesin bilgi gibi gösterilmez.

## Önce okunacak dosyalar

| Belge | İçerik |
|---|---|
| [Üst seviye plan](docs/01-high-level-plan.md) | Ürün kapsamı, mimari, aşamalar, ölçülebilir başarı koşulları |
| [Kaynak ve doğruluk politikası](docs/02-sources-and-editorial.md) | Kaynak adayları, doğrulanan lisanslar, yayın kuralları |
| [Kullanıcı deneyimi](docs/03-user-experience.md) | İki harita modu, tarih akışı, seçim, erişilebilirlik |
| [Teknik tasarım](docs/04-low-level-design.md) | Modüller, veri modeli, tarih matematiği, API ve yayın algoritması |
| [Güvenlik ve işletim](docs/05-security-and-operations.md) | Yetki matrisi, tehditler, dağıtım, yedek ve geri alma |
| [Alt projeler ve görevler](docs/06-delivery-plan.md) | Sıralama, efor, bağımlılık ve kabul kriterleri |
| [Açık kararlar](docs/07-decisions-and-blockers.md) | Kesinleşen, önerilen ve bekleyen konular |
| [Doğrulama sonucu](docs/08-validation.md) | Gerçekte yapılan ve henüz yapılamayan kontroller |
| [İlk çalışan web dilimi](docs/09-first-web-slice.md) | Uygulanan özellikler, sınırlar ve sıradaki işler |

Teknik dizinler: apps/web, apps/worker, packages/domain, packages/contracts, database, data, backlog, scripts.

## Çalıştırma

Node.js 22+ ve npm ile repo kökünde:

    npm ci
    npm run dev

[Yerel uygulama](http://localhost:3000) doğrudan haritaya açılır. API anahtarı gerekmez; coğrafi referans ve başlangıç koleksiyonu repodadır.

    npm test
    npm run typecheck
    npm run build
    npm start
    npm run check:plan

Son komut için Python 3 gerekir. Tarayıcı testleri ve üretim çalıştırma ayrıntıları [web README](apps/web/README.md) dosyasındadır.

## GitHub

Repo: [hturkmen/civilisation-atlas](https://github.com/hturkmen/civilisation-atlas) · Ana dal: main · Görünürlük: public.

Repo sahibi tarafından oluşturuldu ve paylaşımı doğrulandı. Plan ve uygulama dosyaları bu repoda tutulur. Geliştirme işleri [Issues](https://github.com/hturkmen/civilisation-atlas/issues) bölümünden takip edilir; 45 görevin bağlantıları [görev dizininde](backlog/github-issues.md), kimlikleri ve ayrıntıları [backlog/issues.json](backlog/issues.json) dosyasındadır. GitHub Projects panosu henüz kurulmadı.

[Aktarım rehberi](docs/github-setup.md), yerel geliştirme ve eksik görevleri güvenle eşitleme adımlarını içerir.

## Kod ve içerik hakları

Bu pakete açık kaynak lisansı eklenmedi. Repo public görünürlüktedir; kodun yeniden kullanım lisansı ayrıca belirlenecek. Üçüncü taraf verilerin kendi lisansları korunur. Veriye açık lisans uygulanması, uygulama kodunu otomatik olarak aynı lisansla yayınlama kararı anlamına gelmez; birleşik veri ürününün yükümlülükleri ayrıca değerlendirilir.

Başlangıç koleksiyonundaki UNESCO açıklama uyarlamaları CC BY-SA 3.0 IGO koşullarıyla sunulur. [Veri kaynakları ve dönüşümler](data/README.md) dosyasında kapsam ve atıflar kayıtlıdır. Natural Earth coğrafi referansı public domain'dir. Cliopatria alanları CC BY 4.0 atıflarıyla sunulur; 1507 arşiv görseli doğrulanmış kaynaktan hazırlanır. Kullanıcı bilgileri veya erişim anahtarları depoya eklenmez.
