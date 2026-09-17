# Native PostgreSQL eşzamanlılık paketi

Bu paket hazırdır; 17 Eylül ortamında PostgreSQL/PostGIS/Docker bulunmadığı için native sonuç **doğrulanmadı**. PGlite testinin yerine geçtiği veya üretime hazır olduğu iddia edilmez. Yeni servis, sağlayıcı, CI workflow veya maliyet taahhüdü oluşturulmadı.

## Güvenli çalıştırma

Node 22+, `npm ci --prefix database --ignore-scripts` ve yerelde native PostgreSQL/PostGIS extension dosyaları gerekir. Test rolünün yalnız ayrı test DB'sinde migration/extension yetkisi olmalıdır. PostgreSQL/PostGIS sürümleri komut sonucunda yazılır; belirli bir native sürümde başarı henüz kaydedilmedi.

Operatör **yeni ve boş**, adı `atlas_test_` ile başlayan bir DB oluşturur. URL sadece localhost/127.0.0.1/::1 kabul eder; URL parametreleri, uzak host ve genel üretim adları reddedilir. URL'de açık test kullanıcısı/parolası gerekir; üretim parolası kullanma. Boş olmayan public ilişkileri veya atlas/başka kullanıcı şeması varsa test durur. PostGIS'i önceden kurma; migration kurar. Aynı DB'de eşzamanlı iki runner advisory lock ile reddedilir.

Yerel terminalinde ortam değişkenlerini ayarla (değerleri GitHub'a, loga veya sohbete koyma):

```sh
# Örnek biçim: postgresql://TEST_USER:TEST_PASSWORD@127.0.0.1:5432/atlas_test_worker_01
# ATLAS_NATIVE_TEST_URL değerini kendi yerel ortamından sağla.
export ATLAS_NATIVE_TEST_ACK=empty-disposable-db
npm run test:native --prefix database
```

PowerShell'de aynı değişkenler `$env:ATLAS_NATIVE_TEST_URL` ve `$env:ATLAS_NATIVE_TEST_ACK` ile atanır. Windows native koşumu henüz denenmedi.

Runner `DATABASE_URL` veya `PG*` bağlantı bilgilerine düşmez; kendi sürecindeki kalıtılmış PG ayarlarını bağlantıdan önce temizler. TLS sadece bu loopback test için kapalıdır; üretim bağlantı rehberi değildir. Host ismi kontrolü bir OS ağ sandbox'ı değildir. Lokal port forwarding arkasına üretim DB bağlama.

Hiçbir DB/schema/table DROP/TRUNCATE edilmez. Sonuçlar inceleme için DB'de kalır; tekrar için **yeni boş test DB** kullan. Yarım kalan koşumda da eski DB otomatik temizlenmez. Operatör temizlik kararını kendisi verir. Yalnız runner'ın oluşturduğu geçici bundle klasörü otomatik kaldırılır.

## Yedi senaryo

1. İki gerçek bağlantının eşzamanlı claim'inde tam bir sahip ve tek deneme.
2. Diğer bağlantı satır kilidini tutarken SKIP LOCKED beklemeden boş döner.
3. Heartbeat gerçek kilit beklemesine girer (`pg_blocking_pids` ile gözlenir); kilit açılmadan lease geçmişe alınır, eski süreyle yenileme reddedilir.
4. Native `statement_timeout` SQLSTATE 57014 üretir; task ve audit yazıları rollback olur.
5. Rollback edilen claim deneme sayısını ve running audit kaydını artırmaz.
6. Yeni token ile devralınan işte eski bağlantı heartbeat/fail yapamaz.
7. Gerçek Gate A paketinin iki paralel import'u tek receipt ve beş immutable kayıt oluşturur; public release yoktur.

Test durumları DB sahibi fixture yetkisiyle zaman alanlarını değiştirir; üretim koduna test clock eklenmedi. Kilit yarışı sabit uyku tahminiyle değil, server'da bloklanma gözlenerek başlatılır. SQL timeout 10 sn, idle transaction 15 sn, connection timeout 5 sn; özel timeout senaryosu 100 ms kullanır. Native test başarısızlığı skip/pass'e çevrilmez; güvenli kodla nonzero döner, ham PG hatası/SQL/URL yazılmaz.

Referanslar: [aynı client ile transaction](https://node-postgres.com/features/transactions), [PostgreSQL etkin bağlantı gözlemi](https://www.postgresql.org/docs/18/monitoring-stats.html). Bu paket runtime rol/RLS, auth/admin, tüm worker için OS süre/bellek kotası, staging yedek/restore veya tarihçi incelemesini tamamlamaz.
