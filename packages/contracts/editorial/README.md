# Editorial source/evidence contract (P02-001)

Bu dizin, kaynak/kanıt sözleşmesinin yalnızca **yapısal** JSON Schema tanımlarını belgeler. Şemalar `packages/domain/src/editorial.mjs` içindeki gerçek çalışma zamanı doğrulayıcısı ile aynı alanları tarif eder; bu doğrulayıcı Node testlerinden ve `scripts/validate-editorial.mjs` betiğinden kullanılır. Şemalar dokümantasyon ve harici araç uyumu içindir; proje şu an ayrı bir JSON Schema kütüphanesi çalıştırmaz.

## Dosyalar

- `source.schema.json` — Bir kaynağın **kimliği** (`id`), **revizyonu** (`revision`, yoksa nedenini açıklayan `revisionNote`), erişim tarihi, lisans, zorunlu atıf, kullanım kapsamı, hak durumu ve checksum dayanağı. Bu üçü ayrı tutulur: kimlik kaynağın kendisidir, revizyon o kaynağın belirli bir hâlidir, `objectRightsExceptions` ise genel kaynak lisansının kapsamadığı tek bir nesnedir (örn. CC0 veri seti içindeki telifli bir görsel). `objectLocator` değerleri tekil olmalıdır.
- `candidate.schema.json` — Bir varlığa ait tek bir iddia/kanıt taslağı. `status=blocked` olan adaylar araştırılmış ama kullanılamayan seçenekleri belgeler; kanıt/zaman alanı gerektirmez. Diğer adaylarda kanıt, zaman belirsizliği, editoryal sınıf ve gerekçe zorunludur.
- `temporal-extent.schema.json` — `packages/domain/src/chronology.mjs` içindeki `TemporalExtent` şeklini yansıtır; astronomik yıl ve yarı açık aralık kuralları oradan gelir.

## Yayın kapısı

Yapısal geçerlilik yayın onayı değildir. `packages/domain/src/editorial.mjs` içindeki `evaluatePublishability`, bir adayın gerçekten dışa aktarılabilir sayılması için üç bağımsız koşulu kontrol eder:

1. `status` değeri `ready_for_review` olmalı (`blocked` adaylar hiçbir zaman yayınlanamaz).
2. `reviewStatus` değeri `independently_reviewed` olmalı **ve** kayıtlı `reviewedContentHash`, adayın güncel içerik hash'iyle eşleşmeli. İçerik incelemeden sonra değişirse eski inceleme geçersiz sayılır.
3. Adayın en az bir kanıt bağlantısı olmalı ve her kanıttaki kaynağın (nesne bazlı istisna varsa istisnanın) hak durumu `approved` olmalı. Kanıt bir `sourceRevision` sabitliyorsa bu, kaynağın güncel `revision` değeriyle eşleşmelidir; kaynak revizyonu değişirse kanıt ve ona dayanan inceleme geçersiz olur.

Kapı **kapalı tarafa düşer**: doğrulayamadığı bir kayıt için asla `publishable: true` döndürmez. Kanıtı hiç olmayan aday yayınlanamaz; nesne bazlı istisna taşıyan bir kaynağa locator vermeden bağlanan kanıt, genel izinli durumu değil kaynaktaki **en kısıtlayıcı** durumu devralır. Belirli bir nesneyi adlandırmayan kanıt, kısıtlı nesnenin kullanılmadığını gösteremez.

Hak durumu geçmesi tarihsel incelemeyi onaylamaz; tarihsel inceleme geçmesi hak durumunu onaylamaz. İkisi ayrı alanlardır ve ayrı ayrı kontrol edilir.

## Doğrulama

```
node scripts/validate-editorial.mjs
```

Bu betik `data/editorial/sources.json` ve `data/editorial/candidates.json` dosyalarını `packages/domain/src/editorial.mjs` ile yapısal olarak doğrular, her adayın `entityRef` hedefini mevcut koleksiyonlarda (`preview-collection.json`, `boundary-collection.json`, `historical-maps.json`) gerçekten arar, ardından her adayın `evaluatePublishability` sonucunu yazdırır. Domain modülü dosya sistemine erişmez; kimlik listelerini betikten parametre olarak alır. Sıfır olmayan çıkış kodu, yapısal hata anlamına gelir; `blocked` durumu veya `unreviewed` inceleme durumu beklenen, başarılı bir doğrulama sonucudur — bunlar hata değildir.

Negatif/pozitif testler `packages/domain/test/editorial.test.mjs` içindedir.
