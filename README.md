# Civilisation Atlas — Dünya Medeniyet Atlası

MÖ 4000'den günümüze tarih seçerek dünya medeniyetlerini harita üzerinde keşfetme projesi.

**Durum: planlama ve başlangıç paketi. Çalışan web sitesi, giriş sistemi veya canlı veri servisi henüz uygulanmadı.**

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

Teknik dizinler: apps/web, apps/worker, packages/domain, packages/contracts, database, data, backlog, scripts.

## Yerelde doğrulama

Node.js ve Python 3 kurulu bir ortamda:

    node --test packages/domain/test/*.test.mjs
    python3 scripts/validate_plan.py

Bu komutlar plan bütünlüğünü ve tarih çekirdeğini doğrular. Uygulama güvenlik testlerinin veya veritabanı entegrasyon testlerinin yerine geçmez.

## GitHub

Repo: [hturkmen/civilisation-atlas](https://github.com/hturkmen/civilisation-atlas) · Ana dal: main · Görünürlük: public.

Repo sahibi tarafından oluşturuldu ve paylaşımı doğrulandı. Plan ve başlangıç dosyaları bu repoda tutulur. Geliştirme işleri [Issues](https://github.com/hturkmen/civilisation-atlas/issues) bölümünden takip edilir; görev kimlikleri ve ayrıntıları [backlog/issues.json](backlog/issues.json) dosyasındadır. GitHub Projects panosu henüz kurulmadı.

[Aktarım rehberi](docs/github-setup.md), yerel geliştirme ve eksik görevleri güvenle eşitleme adımlarını içerir.

## Kod ve içerik hakları

Bu pakete açık kaynak lisansı eklenmedi. Repo public görünürlüktedir; kodun yeniden kullanım lisansı ayrıca belirlenecek. Üçüncü taraf verilerin kendi lisansları korunur. Veriye açık lisans uygulanması, uygulama kodunu otomatik olarak aynı lisansla yayınlama kararı anlamına gelmez; birleşik veri ürününün yükümlülükleri ayrıca değerlendirilir.

Pakette gerçek tarihsel sınır poligonları, telifli harita taramaları, kullanıcı bilgileri veya erişim anahtarları yoktur.
