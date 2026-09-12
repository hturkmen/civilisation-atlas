# Güvenlik ve işletim tasarımı

Güvenlik bu belgede gereksinim olarak tanımlıdır; çalışan uygulamada sağlandığı henüz test edilmedi.

## Yetki matrisi

| İşlem | Misafir | Üye | Editör | İnceleyen | Admin |
|---|---|---|---|---|---|
| Yayınlanmış atlası oku | Evet | Evet | Evet | Evet | Evet |
| Kendi favorilerini yönet | Hayır | Evet | Evet | Evet | Evet |
| Taslak oluştur/düzenle | Hayır | Hayır | Evet | Atanmışsa | Atanmışsa |
| Kaynak/iddia incele | Hayır | Hayır | Hayır | Evet | İnceleyen rolü varsa |
| Yayın aktive et/geri çek | Hayır | Hayır | Hayır | Hayır | Evet |
| Kullanıcı rolü yönet | Hayır | Hayır | Hayır | Hayır | Evet |
| Diğer üyelerin özel favorilerini oku | Hayır | Hayır | Hayır | Hayır | Varsayılan olarak hayır |

Teknik admin yetkisi tarihsel uzman incelemesi yerine geçmez. Rol kontrolü her HTTP işleminde ve veri erişiminde yapılır; menüyü gizlemek güvenlik kontrolü sayılmaz.

## Kimlik ve oturum

- Kimlik sağlayıcısı kullanıcı oluşturma, e-posta doğrulama, oturum yenileme ve MFA için kullanılır.
- JWT imzası, issuer, audience, süre ve gerekiyorsa assurance level server tarafında doğrulanır. İstemci tarafından gönderilen user_id/role yetki kaynağı değildir.
- Web'de sağlayıcının desteklenen server-side oturum modeli ve güvenli cookie tercih edilir; Secure, HttpOnly ve uygun SameSite ayarları test edilir.
- Cookie ile yapılan mutation'larda Origin/CSRF denetimi; GET ile veri değişikliği yok.
- Admin/editör/inceleyen MFA'sız işlem yapamaz. Hassas rol/yayın işlemlerinde yakın zamanlı yeniden doğrulama uygulanır.
- Rol iptalinin açık oturumlara gecikmeli yansıması önlenir; server-side izin kaydı kontrol edilir.
- Hesap kurtarma akışı admin MFA'sını kolayca atlamamalı; recovery işlemleri denetim kaydına girer.
- Oturum anahtarları URL, log, analytics veya public JavaScript içine girmez.

Kimlik doğrulama ile yetkilendirme ayrımı Next.js belgelerinde; MFA seçenekleri Supabase belgelerinde açıklanır. Uygulama tercihleri gerçek entegrasyonda doğrulanacaktır. [Next.js Authentication](https://nextjs.org/docs/app/guides/authentication), [Supabase MFA](https://supabase.com/docs/guides/auth/auth-mfa).

## Somut tehditler ve kontroller

| Tehdit | Önlem | Doğrulama |
|---|---|---|
| Başka üyeye ait bookmark'ı değiştirme | Subject server'dan; sahiplik SQL/RLS kontrolü | İki farklı kullanıcıyla BOLA/IDOR senaryosu |
| Editörün kendini admin yapması | Ayrı rol tablosu, yalnız admin yetkili servis | Profil JSON ve sahte JWT role denemeleri |
| Taslakların public API/CDN'e sızması | Ayrı private alan, export allowlist, yalnız yayın revizyonları | Tahmin edilen ID, doğrudan dosya URL'si ve cache denemesi |
| Kaynak metniyle XSS | Düz metin/sınırlı sanitize; keyfi HTML yok | Script, olay attribute ve zararlı URL fixture'ları |
| Import URL'siyle SSRF | Kayıtlı adaptör, izinli origin, redirect/DNS/IP kontrolü | Localhost, RFC1918, metadata IP ve redirect testleri |
| Aşırı büyük GeoJSON/zip bombası | Sıkıştırılmış/açılmış byte, derinlik, vertex ve süre limitleri | Büyük ve iç içe örneklerin reddi |
| API üzerinden pahalı sorgu | Bbox/zoom/yıl/limit zorunluluğu, statement timeout, rate limit | Maksimum kapsam ve eşzamanlı istek denemesi |
| CSRF ile yayın/rol değişikliği | SameSite + CSRF/Origin doğrulama | Farklı origin ve eksik token ile ret |
| Yanlış kaynağın otomatik yayınlanması | Hak+kanıt+inceleme kapısı | Eksik kaynak/iptal edilmiş hak ile yayın engeli |
| İki adminin sürümü ezmesi | If-Match + transaction + immutable release | Aynı eski version ile iki aktivasyondan yalnız biri başarılı |
| Bağımlılık veya CI anahtarı sızıntısı | Lockfile, least privilege, secret tarama, fork izolasyonu | CI'da secretsız kontrol ve bundle tarama |
| AI kaynaklı talimat enjeksiyonu | İçerik veri sayılır; araç/yayın yetkisi verilmez | Kaynaktaki “yayınla/anahtarı göster” talimatı etkisiz |

Güvenlik doğrulama kapsamı için OWASP ASVS referans alınır; bu bir sertifikasyon iddiası değildir. [OWASP ASVS](https://owasp.org/www-project-application-security-verification-standard/).

## Veritabanı ve anahtarlar

Runtime uygulama rolü DB sahibi veya superuser değildir. Public okuma, kullanıcı özel verisi, editoryal yazma ve yayın işleri için izinler ayrılır. Kimlik sağlayıcısının service-role anahtarı browser'a verilmez; RLS'yi aşabilen yönetim anahtarı normal kullanıcı sorgularında kullanılmaz.

RLS default-deny yaklaşımıyla kurulur. Supabase seçilirse exposed schema ve Data API erişimi ayrıca kısıtlanır; BFF koruması tek başına yeterli değildir. Son kullanıcıya public tablo üzerinden taslak veya kaynak dosyası açılmaz.

İlk admin ataması bir defalık kontrollü işlem ve audit event ile yapılır. Son aktif adminin yanlışlıkla kaldırılması engellenir. Kodda sabit admin e-postası veya paylaşılan varsayılan parola olmaz.

## Upload ve medya

Başlangıçta yükleme editoryal rollerle sınırlıdır. Düz GeoJSON ve izinli raster formatları kabul edilir. Keyfi SVG, HTML ve çalıştırılabilir arşiv alınmaz. Dosya imzası/media type doğrulanır, boyut ve piksel limiti uygulanır.

Özgün dosya karantinada; işlenmiş dosya yeni anahtarda; kamu yayını ayrı prefix/bucket içinde tutulur. Taslak dosyaların imzalı URL'leri kısa ömürlüdür. URL'deki token loglanmaz.

## Gizlilik ve veri yaşam döngüsü

Favoriler özeldir. Düzeltme önerileri incelemesiz yayınlanmaz. Kullanıcı kaynak metnine kişisel veri eklerse moderasyon süreci vardır.

Üretim öncesi retention kararı verilir: oturum/güvenlik logları, ürün olayları, düzeltme önerileri ve yedekler için ayrı süreler. Süreler keyfi “yasal zorunluluk” olarak uydurulmaz. Hesap silme, kimlik sağlayıcısı ve uygulama kayıtlarında koordineli iş yürütür; gerekli içerik geçmişi kişiden ayrıştırılır. Yedeklerin yaşam döngüsü kullanıcı açıklamasında yer alır.

## Ortamlar ve CI

Development, staging ve production veri/anahtarları ayrıdır. Staging'e gerçek kullanıcı bilgisi kopyalanmaz. Preview yayınları production DB erişimi almaz.

CI kapıları: tip/derleme, domain testleri, OpenAPI/DB uyumu, import doğrulama, yetki negatif testleri, kritik E2E, dependency/secret kontrolü. Bu pakette yalnız doküman+domain kontrolleri uygulanmıştır; üretim CI görevleri backlog'dadır.

GitHub Actions eklenirse izinler read-only varsayılan olur; kullanılan action referansları doğrulanmış commit'e sabitlenir. Untrusted PR kodu production secret'larıyla çalıştırılmaz. Supply-chain kontrolleri uygulanmadan compliance başarı etiketi koyulmaz.

## Şema ve yayın değişikliği

Migration yaklaşımı: yeni alan/tablo ekle → eski/yeni uyumlu kod yayınla → kontrollü backfill → doğrula → eski alanı sonraki sürümde kaldır.

Aşağıdaki işlemler uygulanmadan önce etkisi somut olarak bildirilir:

- Kolon/tablo silme veya geri döndürülemeyen toplu veri düzeltme.
- Kimlik sağlayıcısı, domain, DB bölgesi veya hosting değişimi.
- RLS/yetki politikasını genişletme veya private dosyayı public yapma.
- Zaman kodlaması, geometri SRID'si, API ana sürümü değiştirme.
- Kaynak lisansını yeniden yorumlayıp mevcut veriyi farklı haklarla yayınlama.
- Mevcut DB ile uyumsuz kod rollback'i veya force-push.

Bu paket böyle bir altyapı değişikliği yapmadı. Gerçek migration henüz çalıştırılmadı.

## Yedek ve geri alma

Önerilen başlangıç hedefi: içerik/hesap DB için RPO ≤24 saat, RTO ≤4 saat. Bunlar henüz sağlanmış hizmet garantileri değil; sağlayıcı paketi ve restore denemesiyle kabul edilecek hedeflerdir. Daha yüksek veri değişim hızında PITR değerlendirilir.

DB yedeği ile immutable dosya manifestlerinin beraber geri yüklenmesi test edilir. Dosyaların DB dışında saklanması, DB yedeğinin harita dosyalarını içerdiği anlamına gelmez.

Yayın rollback'i: önceki release aktive edilir. Uygulama rollback'i: DB uyumlu önceki build. Veri geri yükleme: ayrı staging ortamına geri dönüş, kontrol ve planlı geçiş. Üçü aynı işlem değildir.

## Operasyon sinyalleri

- API hata/latency, harita yükleme ve WebGL fallback oranı.
- Yanıt boyutu, CDN hit ratio, DB statement timeout.
- Import bekleme süresi, başarısız kayıtlar, yayın oluşturma süresi.
- Kaynağı/izni eksik taslak sayısı, kırık kaynak URL'leri, veri güncelliği.
- Kimlik/rol hataları ve başarısız admin MFA denemeleri.
- Trafik, e-posta, depolama ve sorgu bütçesi; %50/%80/%100 uyarı eşikleri.

Alarm alıcıları ve kanalı ayrıca belirlenir. Bu görevde e-posta, Slack mesajı veya davet gönderilmedi.
