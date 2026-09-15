# Editorial source/evidence contract (P02-001)

Bu dizin, kaynak/kanıt sözleşmesinin yalnızca **yapısal** JSON Schema tanımlarını belgeler. Şemalar `packages/domain/src/editorial.mjs` içindeki gerçek çalışma zamanı doğrulayıcısı ile aynı alanları tarif eder; bu doğrulayıcı Node testlerinden ve `scripts/validate-editorial.mjs` betiğinden kullanılır. Şemalar dokümantasyon ve harici araç uyumu içindir; proje şu an ayrı bir JSON Schema kütüphanesi çalıştırmaz.

## Dosyalar

- `source.schema.json` — Bir kaynağın kimliği, sürüm/erişim tarihi, lisans, zorunlu atıf, kullanım kapsamı, hak durumu ve checksum dayanağı. `objectRightsExceptions` ile genel kaynak lisansının kapsamadığı tek bir nesne (örn. CC0 veri seti içindeki telifli bir görsel) ayrıca işaretlenir.
- `candidate.schema.json` — Bir varlığa ait tek bir iddia/kanıt taslağı. `status=blocked` olan adaylar araştırılmış ama kullanılamayan seçenekleri belgeler; kanıt/zaman alanı gerektirmez. Diğer adaylarda kanıt, zaman belirsizliği, editoryal sınıf ve gerekçe zorunludur.
- `temporal-extent.schema.json` — `packages/domain/src/chronology.mjs` içindeki `TemporalExtent` şeklini yansıtır; astronomik yıl ve yarı açık aralık kuralları oradan gelir.

## Yayın kapısı

Yapısal geçerlilik yayın onayı değildir. `packages/domain/src/editorial.mjs` içindeki `evaluatePublishability`, bir adayın gerçekten dışa aktarılabilir sayılması için üç bağımsız koşulu kontrol eder:

1. `status` değeri `ready_for_review` olmalı (`blocked` adaylar hiçbir zaman yayınlanamaz).
2. `reviewStatus` değeri `independently_reviewed` olmalı **ve** kayıtlı `reviewedContentHash`, adayın güncel içerik hash'iyle eşleşmeli. İçerik incelemeden sonra değişirse eski inceleme geçersiz sayılır.
3. Adayın her kanıt bağlantısındaki kaynağın (nesne bazlı istisna varsa istisnanın) hak durumu `approved` olmalı.

Hak durumu geçmesi tarihsel incelemeyi onaylamaz; tarihsel inceleme geçmesi hak durumunu onaylamaz. İkisi ayrı alanlardır ve ayrı ayrı kontrol edilir.

## Doğrulama

```
node scripts/validate-editorial.mjs
```

Bu betik `data/editorial/sources.json` ve `data/editorial/candidates.json` dosyalarını `packages/domain/src/editorial.mjs` ile yapısal olarak doğrular, ardından her adayın `evaluatePublishability` sonucunu yazdırır. Sıfır olmayan çıkış kodu, yapısal hata anlamına gelir; `blocked` durumu veya `unreviewed` inceleme durumu beklenen, başarılı bir doğrulama sonucudur — bunlar hata değildir.

Negatif/pozitif testler `packages/domain/test/editorial.test.mjs` içindedir.
