# Editorial source/evidence contract (P02-001)

Bu dizin, kaynak/kanıt sözleşmesinin yalnızca **yapısal** JSON Schema tanımlarını belgeler. Şemalar `packages/domain/src/editorial.mjs` içindeki gerçek çalışma zamanı doğrulayıcısı ile aynı alanları tarif eder; bu doğrulayıcı Node testlerinden ve `scripts/validate-editorial.mjs` betiğinden kullanılır. Şemalar dokümantasyon ve harici araç uyumu içindir; proje şu an ayrı bir JSON Schema kütüphanesi çalıştırmaz.

## Dosyalar

- `source.schema.json` — Bir kaynağın **kimliği** (`id`), **revizyonu** (`revision`, yoksa nedenini açıklayan `revisionNote`), erişim tarihi, lisans, zorunlu atıf, kullanım kapsamı, hak durumu ve checksum dayanağı. Bu üçü ayrı tutulur: kimlik kaynağın kendisidir, revizyon o kaynağın belirli bir hâlidir, `objectRightsExceptions` ise genel kaynak lisansının kapsamadığı tek bir nesnedir (örn. CC0 veri seti içindeki telifli bir görsel). `objectLocator` değerleri tekil olmalıdır.
- `candidate.schema.json` — Bir varlığa ait tek bir iddia/kanıt taslağı. `status=blocked` olan adaylar araştırılmış ama kullanılamayan seçenekleri belgeler; kanıt/zaman alanı gerektirmez. Diğer adaylarda kanıt, zaman belirsizliği, editoryal sınıf ve gerekçe zorunludur.
- `temporal-extent.schema.json` — `packages/domain/src/chronology.mjs` içindeki `TemporalExtent` şeklini yansıtır; astronomik yıl ve yarı açık aralık kuralları oradan gelir.

## Revizyona bağlı değerlendirme — P02-004 hazırlığı

`scripts/validate-editorial.mjs` artık `editorial-revisions.mjs` içindeki `evaluateRevisionPublishability` ile değerlendirme yapar. Eski `evaluatePublishability` yalnız aday/izin alt kapısıdır; tek başına dışa aktarma veya yayın yetkisi değildir.

Yeni kapı iddia hash'ini, çözülmüş varlık içeriğini (sınır kaydında gerçek GeoJSON feature geometrisi ve koleksiyon kaynağı; perspektifte mevcut katalog/asset hash alanları) ve kullanılan her kaynak kaydının tam içerik hash'ini aynı `revisionId` altında bağlar. `revision` yayımlayan kurumun kimliğidir; yerel `contentHash` bunun yerine geçirilmez ve sayfanın dışarıdaki güncel durumunu doğrulamaz. Yerleşimin koordinatları/dönemi, geometri, eser kaydı, hak bilgisi veya kaynak metaverisi değişirse eski onay reddedilir. Salt `context`/`contradicts` kaynakça veya locator'ı olmayan destek yeterli değildir.

İnceleme adaptörü, güvenilir depodan `{revisionId, reviewer}` kaydı sağlamalı ve sunucuda yetkilendirmelidir. Böyle bir servis henüz yoktur; CLI inceleme kaydı uydurmaz ve otomatik onay vermez. Testlerdeki olumlu onaylar yalnız sentetik kopyalardır. Bu çalışma DB migration, immutable DB kısıtı veya gerçek bağımsız tarihçi onayı değildir.

`revision.schema.json` kalıcı pin kaydını belgeler. `data/editorial/revisions.json` bir JSON manifestidir; geçmiş içerik Git geçmişinde saklanır. Hazırlama betiği eski pinleri silmez, yeni içerik kimliklerini ekler. Manifest üretmek bir inceleme yapmaz.

## Aday/izin alt kapısı

Yapısal geçerlilik yayın onayı değildir. Yayın kapısı doğrudan çağrıldığında da kaynak ve aday sözleşmesini doğrular; önceden başka bir validator çağrılmış olduğunu varsaymaz. Eksik iddia, inceleyen veya zaman alanı, eşleşen bir inceleme hash’i olsa bile reddedilir; bozuk girdi kapıdan olumlu sonuç alamaz. Mevcut varlık kayıtlarına karşı kimlik çözümlemesi ayrıca CLI betiğindeki registry kontrolüyle yapılır; bu modül canlı sunucu yetkilendirmesinin yerine geçmez. `packages/domain/src/editorial.mjs` içindeki `evaluatePublishability`, bir adayın gerçekten dışa aktarılabilir sayılması için üç bağımsız koşulu kontrol eder:

1. `status` değeri `ready_for_review` olmalı (`blocked` adaylar hiçbir zaman yayınlanamaz).
2. `reviewStatus` değeri `independently_reviewed` olmalı **ve** kayıtlı `reviewedContentHash`, adayın güncel içerik hash'iyle eşleşmeli. İçerik incelemeden sonra değişirse eski inceleme geçersiz sayılır.
3. Adayın en az bir kanıt bağlantısı olmalı ve her kanıttaki kaynağın (nesne bazlı istisna varsa istisnanın) hak durumu `approved` olmalı. Kanıt bir `sourceRevision` sabitliyorsa bu, kaynağın güncel `revision` değeriyle eşleşmelidir; kaynak revizyonu değişirse kanıt ve ona dayanan inceleme geçersiz olur.

Kapı **kapalı tarafa düşer**: doğrulayamadığı bir kayıt için asla `publishable: true` döndürmez. Kanıtı hiç olmayan aday yayınlanamaz; nesne bazlı istisna taşıyan bir kaynağa locator vermeden bağlanan kanıt, genel izinli durumu değil kaynaktaki **en kısıtlayıcı** durumu devralır. Belirli bir nesneyi adlandırmayan kanıt, kısıtlı nesnenin kullanılmadığını gösteremez.

Hak durumu geçmesi tarihsel incelemeyi onaylamaz; tarihsel inceleme geçmesi hak durumunu onaylamaz. İkisi ayrı alanlardır ve ayrı ayrı kontrol edilir.

## Doğrulama

```
node scripts/validate-editorial.mjs
```

Bu betik `data/editorial/sources.json` ve `data/editorial/candidates.json` dosyalarını `packages/domain/src/editorial.mjs` ile yapısal olarak doğrular, her adayın `entityRef` hedefini mevcut koleksiyonlarda (`preview-collection.json`, `boundary-collection.json`, `historical-maps.json`) gerçekten arar, ardından her adayın revizyon manifestini kontrol edip `evaluateRevisionPublishability` sonucunu yazdırır. Domain modülü dosya sistemine erişmez; kimlik listelerini betikten parametre olarak alır. Sıfır olmayan çıkış kodu, yapısal hata anlamına gelir; `blocked` durumu veya `unreviewed` inceleme durumu beklenen, başarılı bir doğrulama sonucudur — bunlar hata değildir.

Negatif/pozitif testler `packages/domain/test/editorial.test.mjs` içindedir.

Revizyon komutları:

```
node scripts/prepare-editorial-revisions.mjs
node scripts/prepare-editorial-revisions.mjs --write
node scripts/validate-editorial.mjs
```

İlk komut yalnız kontrol eder; eksik güncel pin varsa başarısız olur. `--write` yalnız incelenen veri değişikliği için çalıştırılır; onay taşımaz. Değerlendirme, aday/sources ile çözülmüş gerçek içerikleri aynı snapshot içinden almalıdır. DB aşamasında bu okuma transaction/release snapshot'ına bağlanmalıdır.
