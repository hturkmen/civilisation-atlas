# Veritabanı uygulama sınırı

16 Eylül 2026: ilişkisel migration, PostGIS ve beş Gate A adayını revizyon pinleriyle aktaran yerel adaptör uygulandı. Ana web/demo henüz DB kullanmaz. Üretim sağlayıcısı veya veri bölgesi seçilmedi.

## İçerik

`migrations/0001_revision_core.sql` ayrı `atlas` şemasında varlık, kaynak, zaman, iddia/geometri/perspektif revizyonları, kanıt bağlantıları ve tipli yayın üyelerini kurar. SQL migration transaction içinde çalışır; boş ve projeye ayrılmış veritabanında yalnız bir kez uygulanır. Tekrar çalıştırma veya mevcut `atlas` şeması hata verir; mevcut veriyi silerek yeniden kurmaz. Migration sürümü `atlas.schema_migration` tablosuna yazılır.

- Revizyonlar, zaman bağımlılıkları ve kanıt bağlantıları append-only. Taslak düzenleme ayrı editoryal katmanda yapılır, yeni içerik yeni revizyon oluşturur. UPDATE/DELETE/TRUNCATE engellenir.
- Kanıt tam bir iddia, geometri veya perspektif revizyonuna ve belirli kaynak revizyonuna FK taşır. Genel kimlik ya da polimorfik serbest metin hedefi kabul edilmez.
- Olası tarih aralığı boş olamaz; kesin aralığın boş olabileceği belirsizlik desteklenir. Yıllar astronomik integer, bitiş exclusive.
- Yayın üyeleri yalnız `building` durumunda değişir. Üye işlemleri ebeveyn yayını `FOR UPDATE` ile kilitler; doğrulama durum değişimiyle aynı satır üzerinden sıralanır.
- `validated` ilişkisel olarak kilitlenmiş küme anlamına gelir: manifest hash zorunlu, referans verilen kaynak/hedef/ebeveyn aynı yayın içinde, içerikte locator'lı destekleyici kanıt ve kaynakta onaylı hak durumu aranır. Sonrasında yalnız `withdrawn` durumuna geçilebilir; üyeler yine değişmez.
- **`validated` tarihçi onayı veya public yayın değildir.** `active` durumu/active_release, yetkili inceleme servisi ve public yayın işlemi henüz uygulanmadı. Kaynak içindeki nesne bazlı hak istisnaları ve iddia hash doğruluğu önceki domain kapısında doğrulanmalıdır; bu SQL onun yerine geçmez.
- `0002_spatial_import.sql`, özgün GeoJSON geometri nesnesinden üretilen PostGIS `MultiPolygon,4326` kolonu, GiST indeks, geçerlilik/boşluk/boyut/koordinat sınırlarını ekler. Geometri onarılmaz veya uydurulmaz. Bilinmeyen bilgi tarihi NULL ve gerekçeli notla tutulur; eser tarihi bu alana kopyalanmaz. Arşiv eserleri siyasi alan olarak kullanılmaz.
- PUBLIC rolünün şema/tablo/fonksiyon erişimi yok. Runtime/browser rolü veya RLS yetkisi verilmez. Migration sahibi ve superuser güvenilen yönetim sınırıdır; bu roller trigger'ı değiştirebilir. Üretim uygulaması bu rollerle çalıştırılmamalı.

## Yerel test

Repo kökünden Node 22+ ile:

```sh
npm ci --prefix database --ignore-scripts
npm test --prefix database
```

Test bağımlılıkları yalnız `database/package.json`/lockfile içindedir; web uygulamasına eklenmez. PGlite 0.5.8 ve pglite-postgis 0.2.8 sabitlenmiştir. Temel testler sentetik kayıtlarla, import testleri mevcut beş gerçek adayın yerel kopyasıyla çalışır. Tarihçi onayı üretilmez. Test bitince bellek içi DB kapanır.

Mevcut sonuç: 19/19 SQL/import senaryosu (12 temel + 7 import). FK, zaman, immutable yayın, yetkisiz rol kontrollerine ek olarak tekrar aktarım, eski kaynak revizyonunun korunması, eksik/eski pin reddi, hatalı geometride tüm transaction'ın geri alınması ve gerçek PostGIS sorgusu doğrulandı. Test motoru PostgreSQL 18.3, PostGIS 3.6 bildirdi.

PGlite tek bağlantılı gömülü motordur. Bu sonuç çok bağlantılı PostgreSQL sunucu concurrency testi, staging migration, restore veya query plan/performance testi değildir. Native PostgreSQL/PostGIS staging ortamı sağlandığında aynı migration ve negatif testler orada da çalıştırılmalı; iki bağlantıda import ve üye ekleme–yayın kilitleme yarışları ayrıca sınanmalı.

## Yerel editoryal aktarım

```sh
# Bellekte doğrula; kalıcı dosya yazmaz.
npm run import:check --prefix database
# İsteğe bağlı: yalnız bu çalışma için ayrılmış, repo dışındaki mutlak dizin.
npm run import:check --prefix database -- --data-dir /absolute/path/atlas-local-db
```

İlk aktarım 4 aday ve gerekçesi korunmuş 1 blocked kayıt oluşturur. Aynı dizinde ikinci çalıştırma `unchanged: 5` döndürür. Tüm adaylar `unreviewed`; yayın/review/release oluşturulmaz. Eski içerik değişmez, kaynak değiştiğinde yeni kaynak revizyonu eklenir. Hatalı batch tümüyle geri alınır.

Adaptör yalnız depodaki doğrulanmış JSON ve çözülmüş varlıkları kabul eder; genel dosya yükleme servisi değildir. Gerçek entity/source snapshot'ı, tam revizyon pini ve typed FK'ler saklanır. Sınırın kaynak dönemi aday iddiasının döneminden ayrı korunur. Geometri artifact hash'i saklanan canonical inline Feature'a aittir; upstream arşiv checksum'ı diye sunulmaz. Aday kanıtı iddia/perspektife bağlanır; geometri inceleme kanıtı eklenmiş sayılmaz. Blocked aday kullanılabilir iddia/geometri üretmez.

Yerel runner yalnız migration sürüm sırasını denetler ve eksik migration'ı uygular; mevcut veriyi silmez. Üretim migration checksum/rollback/backup aracı değildir. DB dosyalarını Git'e ekleme; aynı PGlite dizinini eşzamanlı iki süreçten açma.

## Kalan / sonraki migration

P02-003/P03-002 kısmi: genel import için byte/vertex sınırları, karantina/editoryal kuyruk, kimliği doğrulanmış inceleme kayıtları, runtime rol/RLS politikaları ve güvenli public aktivasyon bekliyor. Üretime taşımadan migration runner/checksum, yedek-restore ve native eşzamanlılık testleri gereklidir. Bu migration otomatik olarak hiçbir uzak DB'ye uygulanmaz; geri alma için veri silen down migration eklenmedi.

Referans: [PostgreSQL constraints](https://www.postgresql.org/docs/16/ddl-constraints.html), [trigger davranışı](https://www.postgresql.org/docs/16/sql-createtrigger.html), [PGlite çalışma ve tek bağlantı sınırı](https://pglite.dev/docs/). Mimari: [teknik tasarım](../docs/04-low-level-design.md).
