# P02-003 / P03-002 — yerel revizyonlu PostGIS aktarımı

16 Eylül 2026. Başlangıç main: `c2125191d0dc488e280b33f2cbe56591ee20f3cf`. Ayrı çalışma alanı; başlangıçta açık PR yok. Kullanıcı talimatıyla PR açılmadan doğrudan main teslimi. Durum: bu dilim tamamlandı; doğrudan main teslimi GitHub üzerinden doğrulandı: `02f0adc9de931793e9bd0e62c094efd6dd625e18`. P02-003/P03-002 bütünü açık kalır.

## Uygulanan dilim

- 0001 değiştirilmeden 0002 migration eklendi. PostGIS MultiPolygon/4326, GiST, ST_IsValid, boş/boyut/koordinat kısıtları; özgün GeoJSON korunur, onarım yapılmaz.
- Beş gerçek aday için `gate-a-v1` yerel adaptör. Tam kaynak/entity snapshot'ları ve domain revizyon pinleri saklanır; source/entity içerik tekrarları yeni revizyon üretmez. Eski revizyonlar değişmez. Batch tek transaction; importer revision numaralama için tablo kilidi alır.
- Dört aday aktarılır; kaynak zinciri olmayan Roma alternatifi gerekçesiyle blocked kalır ve kullanılabilir iddia/geometri üretmez. Beşi de unreviewed. Release, onay ve public yayın oluşturulmaz.
- Waldseemüller 1507 eser tarihi korunur. Bilgi zamanı bilinmediğinden NULL + mevcut açıklama saklanır; basım yılı bilgi tarihine kopyalanmaz. Sınır kaydının kendi zaman aralığı aday iddiasından ayrıdır.
- Geometri hash'i saklanan canonical inline Feature'a aittir. Aday evidence'ı iddia/perspektife bağlıdır; geometri inceleme kanıtı veya tarihçi onayı diye sunulmaz.
- Bellekte ya da açıkça seçilmiş repo dışı yerel dizinde CLI. Uzak DB, servis veya ücretli sağlayıcı yok. Yerel runner migration sürümlerini denetler; üretim migration yönetimi değildir.

## Doğrulama

- `npm ci --prefix database --ignore-scripts`: başarılı; PGlite 0.5.8 / pglite-postgis 0.2.8 sabit. Web/root bağımlılıkları değişmedi.
- `npm test --prefix database`: **19/19**. Mevcut 12 + 7 import/PostGIS testi. Gerçek motor PostgreSQL 18.3 / PostGIS 3.6 bildirdi. Gerçek geometri uzamsal sorgusu ve GiST varlığı doğrulandı.
- Yeniden import, kaynak değişince yeni revizyon, eski pin/missing pin ve review durumu reddi, geç gelen bozuk geometride tüm batch rollback; yanlış SRID/tip/koordinat ve immutable yazım reddi doğrulandı.
- `npm run import:check --prefix database`: imported 4, blocked 1, unchanged 0, published 0.
- Repo dışı aynı kalıcı dizinde iki ayrı süreç: ilk 4+1, ikinci imported 0 / blocked 0 / unchanged 5. Gerçek diskte yeniden açma doğrulandı.
- `npm test`: **53/53**. `npm run check:plan`, `node scripts/validate-editorial.mjs`, `node scripts/validate-boundaries.mjs`, `node scripts/prepare-editorial-revisions.mjs`: geçti. Beş pin güncel; sıfır yayınlanabilir aday.
- İlk denemede olmayan `validate-editorial-revisions.mjs` adı kullanıldı ve MODULE_NOT_FOUND döndü; doğru mevcut `prepare-editorial-revisions.mjs` komutu başarıyla çalıştırıldı. Bu başarısız deneme başarılı sayılmadı.
- Runtime, kök/web paketleri, veri koleksiyonu ve UI değişmedi: build/typecheck/Playwright bu dilimde yeniden çalıştırılmadı. Yeni demo yayını yapılmadı; özel sürüm 5 devam eder.

## Kalanlar ve devralma

P02-003/P03-002 partial. PGlite tek bağlantılı yerel testtir: native PostgreSQL/PostGIS staging, iki bağlantılı import ve yayın kilitleme yarışı, backup/restore veya performans kanıtı değildir. Genel upload byte/vertex sınırları, karantina/kuyruk, kimliği doğrulanmış inceleme, runtime rol/RLS ve public aktivasyon yok. Güvenilen migration sahibi dışında uygulama rolüne yetki verilmedi. Bağımsız tarihçi incelemesi yapılmadı.

Sonraki somut iş: yerel adaptörün önüne dosya boyutu/vertex sınırları ve karantina sonucu olan import iş kaydı ekle; ağdan keyfi URL indirme veya onay verme yetkisi ekleme. Native staging sağlayıcısı/veri bölgesi kararı olmadan bağımsız yerel işleri ilerlet. Aynı içerikleri veya sınır geometrisini yeniden üretme. Mevcut demo/hosting girişlerini değiştirme.

Teslim sonrası #8 ve #13 ilerleme notları güncellendi; kabul ölçütleri tamamlanmadığından açık bırakıldı. Bu son kayıt yalnız belgedir; test edilen kod değişmedi.
