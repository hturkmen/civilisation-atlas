# Veri ve yayın işleri

17 Eylül 2026: yerel import için kalıcı iş durumu, lease/heartbeat, en fazla üç deneme ve atomik sonuç kaydı uygulandı. HTTP servisi veya sürekli çalışan üretim worker'ı değildir.

İş tipleri: source-import, geometry-validate, release-build, asset-process, release-withdraw ve cleanup.

İlk uygulama DB destekli kalıcı iş tablosu/sağlayıcının job altyapısı kullanabilir. Web request içinde uzun import yapılmaz. Ayrı queue ürünü zorunlu değildir; yeniden deneme, lease/heartbeat ve idempotency zorunludur.

## Yerel tek geçiş çalıştırıcısı

```sh
npm ci --prefix database --ignore-scripts
node database/scripts/export-local-bundle.mjs --output /absolute/path/new-bundle.json
npm run worker:once --prefix database -- --input /absolute/path/new-bundle.json --data-dir /absolute/path/atlas-worker-db
```

Aynı komut aynı DB ile tekrar çalıştırılabilir. Checksum + adaptör + politika bir görev belirler; terminal görev yeniden açılmaz. Kuyruktaki input çalıştırma öncesi tekrar hash'lenir. Değişmiş dosya `INPUT_CHANGED` ile kalıcı başarısız olur. Dosya yolu veya içeriği kuyruğa kopyalanmaz; kaynak dosyayı operatör erişilebilir tutar. Dosyanın değişmesi yeni checksum ile ayrı iş oluşturur. Bu komut yalnız verilen dosyanın görevini işler; dosya keşfi/ağ indirmesi yoktur. PGlite dizini aynı anda bir süreç tarafından açılmalıdır.

Enqueue öncesi bounded reader çalışır; 8 MiB üstü veya erişilemeyen dosya için görev oluşturulmaz. İçerik parse/geometri hataları ise worker çalışırken mevcut karantina akışına girer. Yerel operatörün doğrudan `import:bundle` komutu enqueue öncesi dosya reddi için de ayrı quarantine receipt oluşturabilir.

## İş ve süre kuralları

- SQL `import_task` queued → running → imported/quarantined/failed durumlarını tutar. Her claim yeni token alır. Terminal durum ve iş kimliği değiştirilemez; durum geçişleri append-only `import_task_event` ile izlenir.
- 30 saniyelik lease, 120 saniyelik mutlak deneme bitişi. `heartbeatImport` lease'i en fazla mutlak bitişe uzatır; geçmiş süreyi canlandıramaz. Yerel çalıştırıcı işlem başı, transaction başlangıcı ve tamamlamada kontrol eder. Bu sürümde arka planda periyodik heartbeat döngüsü yoktur.
- Bir süreç kaybolunca bir sonraki claim, süresi dolmuş işi yeniden kuyruğa koyar. İlk/ikinci deneme sonrası 5/10 saniye beklenir; toplam en fazla 3 deneme. Çalıştırıcı uyuyarak beklemez veya kendini zamanlamaz; zamanı geldiğinde aynı komut yeniden çalıştırılır. Testler zaman alanlarını yalnız fixture içinde ilerletir.
- Serialization/deadlock/lock/connection hataları ve süre bütçesi tekrar denenebilir. Veri hatası terminal quarantine, dosya değişmesi veya beklenmeyen program hatası terminal failed olur. DB tamamen erişilemezse hata kaydı da yazılamaz; işin sonraki lease recovery'si bunu ele alır.
- Import transaction'ının başında görev satırı kilitlenir; atlas içeriği + import receipt + görev tamamlanması aynı transaction'da commit olur. Eski token veya sona ermiş süre tamamlamayı reddeder ve tüm yazımlar geri alınır. Karantina ayrı rollback sonrası transaction içinde aynı sahiplik kontrolünden geçer.
- SQL transaction'ında `statement_timeout=25000` ayarlanır. Native PostgreSQL timeout/iki bağlantılı yarışlar henüz doğrulanmadı. Dosya okuma, JSON parse ve ön doğrulama artık ayrı Node sürecinde en fazla 20 saniye çalışır; süre dolunca supervisor SIGKILL gönderir ve süreç kapanmadan sonucu döndürmez. Timeout karantina verisi değil, mevcut en fazla üç denemelik `TIME_BUDGET` hatasıdır.

## Ön doğrulama süreç sınırı — 17 Eylül

Sabit `preflight-child.mjs` çalışır; paket içinden kod veya komut yürütülmez. Çocuk süreç DB istemcisi açmaz, parent environment/secrets/`NODE_OPTIONS` devralmaz; shell kullanılmaz. V8 old-space 128 MiB ile sınırlıdır; bu toplam RSS/OS bellek kotası değildir. Önceki byte/depth/node/record/vertex kontrolleri korunur. Mevcut importer DB transaction içinde pinleri yeniden doğrular; bu ikinci doğrulama, DB/PostGIS işlemleri ve enqueue checksum okuması süreç zaman aşımı kapsamının dışındadır. SQL lease/son commit kontrolü korunur. Bütün iş için üretim hard-timeout garantisi verilmez.

Bu bir OS sandbox değildir: dosya üst dizinleri ve sabit uygulama kodu güvenilen yerel operatöre aittir. Network/filesystem yetkileri OS seviyesinde kısıtlanmadı; çocuk kodu ağ isteği yapmaz. Linux üzerinde gerçek sonsuz CPU döngüsünün öldürüldüğü ve PID'nin artık yaşamadığı doğrulandı. Windows/macOS süreç davranışı ayrıca doğrulanmalıdır. Kaynak: [Node child process API](https://nodejs.org/api/child_process.html).

## Doğrulama ve sınır

Önceki dilimde 38 DB/import testi ve kalıcı DB'de ikinci süreçte aynı task için `worked:false` doğrulandı. Bu dilimde beş supervisor senaryosu eklendi: CPU döngüsünü gerçek sonlandırma, sonuç yollayıp açık kalan süreç, environment ayrımı, crash/eksik mesaj ve bütçe sınırı. Güncel koşum sonucu devir kaydındadır. Yanlış/eski token, lease expiry, üç deneme sınırı, terminal immutability, receipt eşleşmesi, PostGIS rollback ve son yazım anında süre bitmesi testleri korunur. Bu PGlite testi gerçek çok bağlantılı/native DB yarış testi değildir. Runtime rol/RLS ve kimlik doğrulama henüz kurulmadı; PUBLIC SQL tablo/fonksiyon erişimleri kapalı, migration sahibi güvenilen operatördür. Native DB yedeği/restore, tüm iş için hard timeout, Windows ve üretim scheduler seçimi açık kalır.

SQL referansları: [satır kilitleme ve SKIP LOCKED](https://www.postgresql.org/docs/18/sql-select.html#SQL-FOR-UPDATE-SHARE), [statement timeout](https://www.postgresql.org/docs/18/runtime-config-client.html#GUC-STATEMENT-TIMEOUT).

Worker'ın private kaynaklara okuma, staging çıktıya yazma izinleri vardır. Public aktivasyon kontrollü servis işlemiyle yapılır. İş loglarında erişim token'ı veya tam kişisel veri yoktur.
