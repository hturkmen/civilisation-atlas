# Veritabanı uygulama sınırı

16 Eylül 2026: ilk ilişkisel migration ve yerel SQL negatif testleri uygulandı. Ana web/demo henüz DB kullanmaz. Üretim sağlayıcısı veya veri bölgesi seçilmedi.

## İçerik

`migrations/0001_revision_core.sql` ayrı `atlas` şemasında varlık, kaynak, zaman, iddia/geometri/perspektif revizyonları, kanıt bağlantıları ve tipli yayın üyelerini kurar. SQL migration transaction içinde çalışır; boş ve projeye ayrılmış veritabanında yalnız bir kez uygulanır. Tekrar çalıştırma veya mevcut `atlas` şeması hata verir; mevcut veriyi silerek yeniden kurmaz. Migration sürümü `atlas.schema_migration` tablosuna yazılır.

- Revizyonlar, zaman bağımlılıkları ve kanıt bağlantıları append-only. Taslak düzenleme ayrı editoryal katmanda yapılır, yeni içerik yeni revizyon oluşturur. UPDATE/DELETE/TRUNCATE engellenir.
- Kanıt tam bir iddia, geometri veya perspektif revizyonuna ve belirli kaynak revizyonuna FK taşır. Genel kimlik ya da polimorfik serbest metin hedefi kabul edilmez.
- Olası tarih aralığı boş olamaz; kesin aralığın boş olabileceği belirsizlik desteklenir. Yıllar astronomik integer, bitiş exclusive.
- Yayın üyeleri yalnız `building` durumunda değişir. Üye işlemleri ebeveyn yayını `FOR UPDATE` ile kilitler; doğrulama durum değişimiyle aynı satır üzerinden sıralanır.
- `validated` ilişkisel olarak kilitlenmiş küme anlamına gelir: manifest hash zorunlu, referans verilen kaynak/hedef/ebeveyn aynı yayın içinde, içerikte locator'lı destekleyici kanıt ve kaynakta onaylı hak durumu aranır. Sonrasında yalnız `withdrawn` durumuna geçilebilir; üyeler yine değişmez.
- **`validated` tarihçi onayı veya public yayın değildir.** `active` durumu/active_release, yetkili inceleme servisi ve public yayın işlemi henüz uygulanmadı. Kaynak içindeki nesne bazlı hak istisnaları ve iddia hash doğruluğu önceki domain kapısında doğrulanmalıdır; bu SQL onun yerine geçmez.
- Geometri şu aşamada hash doğrulanmış artifact + feature locator üzerinden referanslanır. **PostGIS geometry kolonu, uzamsal indeks/sorgu ve ST_IsValid henüz yok.** Tasavvur ve eser tarihi ayrı FK'lerle tutulur; arşiv eserleri siyasi alan olarak kullanılmaz.
- PUBLIC rolünün şema/tablo/fonksiyon erişimi yok. Runtime/browser rolü veya RLS yetkisi verilmez. Migration sahibi ve superuser güvenilen yönetim sınırıdır; bu roller trigger'ı değiştirebilir. Üretim uygulaması bu rollerle çalıştırılmamalı.

## Yerel test

Repo kökünden Node 22+ ile:

```sh
npm ci --prefix database --ignore-scripts
npm test --prefix database
```

Test bağımlılığı yalnız `database/package.json`/lockfile içindedir; web uygulamasına eklenmez. Testler sabitlenmiş PGlite 0.5.8'in bellek içi PostgreSQL motorunda migration'ı çalıştırır. Gerçek tarihsel kayıtlar veya sahte tarihçi onayları eklenmez. Test bitince DB kapanır.

Mevcut sonuç: 12/12 SQL senaryosu. FK, zaman sıralaması, hash biçimi, tekil revizyon, kanıtta tek hedef, yayın referans kapanışı, locator'lı destek, bilinmeyen haklar, immutable revizyon/yayın/üyelik, yeni sürümün eskisini etkilememesi, public aktivasyonun kapalı olması ve ayrı yetkisiz rol kontrol edildi.

PGlite tek bağlantılı gömülü motordur. Bu sonuç çok bağlantılı PostgreSQL sunucu concurrency testi, staging migration, restore, query plan/performance veya PostGIS testi değildir. Native PostgreSQL staging ortamı sağlandığında aynı migration ve negatif testler orada da çalıştırılmalı; iki bağlantıda üye ekleme–yayın kilitleme yarışı ayrıca sınanmalı.

## Kalan / sonraki migration

P03-002 kısmi: PostGIS uzamsal kolonları/indeksleri, gerçek içerik import eşlemesi, domain revizyon pinlerinin DB snapshot'ına bağlanması, kimliği doğrulanmış inceleme kayıtları, runtime rol/RLS politikaları ve güvenli public aktivasyon bekliyor. Üretime taşımadan migration runner/checksum, yedek-restore ve eşzamanlılık testleri gereklidir. Bu migration otomatik olarak hiçbir uzak DB'ye uygulanmaz; geri alma için veri silen down migration eklenmedi.

Referans: [PostgreSQL constraints](https://www.postgresql.org/docs/16/ddl-constraints.html), [trigger davranışı](https://www.postgresql.org/docs/16/sql-createtrigger.html), [PGlite çalışma ve tek bağlantı sınırı](https://pglite.dev/docs/). Mimari: [teknik tasarım](../docs/04-low-level-design.md).
