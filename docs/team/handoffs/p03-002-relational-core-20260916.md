# P03-002 ilişkisel çekirdek — 16 Eylül 2026

Başlangıç main: `124aea95b42f051f583b66d964638ec4b07e1948`; açık PR yoktu. Kullanıcı talimatıyla önce kapsam özeti verildi, PR açılmadan main'e normal ileri güncelleme yapılacak. Çalışma alanı atlas-database.

## Sonuç

İlk fiziksel SQL migration: kaynak/varlık/iddia/geometri/perspektif revizyonları, bağımsız zaman kayıtları, kaynak–tek hedef kanıt FK'leri, tipli release üyeliği, immutable snapshot ve mühürlenmiş üyelik. Geometri henüz artifact hash/feature locator düzeyinde; PostGIS kurulmuş gibi sunulmaz. Gerçek içerik veya mevcut JSON verileri DB'ye aktarılmadı. `validated` yalnız ilişkisel mühürdür, tarihçi onayı değildir; `active`/public yayın desteklenmez.

Tüm tablolar özel şemada; PUBLIC erişimi kapalı. Migration sahibi/superuser güvenilen sınırdır, runtime kullanıcıları bu yetkiyle çalıştırılamaz. Üye değişikliği ile yayın mühürleme aynı parent satır lock'u üzerinden sıralanır; çok bağlantılı yarış testi henüz yapılmadı.

## Test ve sınırlar

PGlite 0.5.8 ayrı database dev bağımlılığı/lockfile olarak kuruldu; root/web bağımlılıkları değişmedi. Motor kendisini PostgreSQL 18.3 (wasm32) olarak bildirdi. 12/12 SQL senaryosu geçti: geçerli kurulum, negatif FK/zaman/hash/revizyon, locator ve tek hedef, revizyon UPDATE/DELETE/TRUNCATE, yayın kapanışı/destekleyici kaynak, hak reddi, mühürlenmiş/geri çekilmiş yayın değişmezliği, yeni revizyonun eski yayını değiştirmemesi, aktivasyon atlaması ve yetkisiz rol erişimi. Fixture'lar sentetik ve transaction rollback ile temizlenir.

53 alan/veri testi ve plan/revizyon/editoryal/sınır kontrollerinin son sonucu devam kaydına yazılacak. Bu dilim web runtime veya görsel değişiklik yapmadığı için tekrar build/Playwright/Sites yayını gerektirmez; mevcut özel demo sürüm 5 korunur.

## Kalan ve sonraki iş

P03-002 kapanmadı: native PostgreSQL/PostGIS staging, iki bağlantılı concurrency, DB pin/import adaptörü, RLS/runtime yetkileri, gerçek bağımsız inceleme, public aktivasyon, migration runner ve restore eksik. Sonraki somut iş: PostGIS geometri kolonları ve mevcut artifact kayıtlarını domain revizyon pinlerine bağlayan import adaptörü; boş yerel DB üzerinde doğrulanmalı. Ücretli servis/veri bölgesi kararı alınmadı ve uzak DB'ye migration uygulanmadı.

Son doğrulama: 12/12 SQL senaryosu, 53/53 domain/veri testi, plan kontrolü, revizyon pinleri, editoryal kapı (0 publishable) ve sınır validator geçti. Root/web bağımlılıkları, runtime kodu ve veriler değişmediğinden build/Playwright tekrarlanmadı. Yeni veri tabanı yalnız bellek içi test ortamındadır.

GitHub teslimi: `d8f1876ba3eb7b976a1e322047d8a9088bb9e142` doğrudan main’e kaydedildi; PR açılmadı. #13 ilerleme notu güncellendi, eksik kabul ölçütleri nedeniyle açık bırakıldı. Sonraki iş yukarıdaki PostGIS/import dilimidir.
