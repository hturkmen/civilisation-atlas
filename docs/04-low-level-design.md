# Teknik tasarım — sürüm 0.1

Bu belge uygulama sözleşmesidir. Aşağıda tanımlanan servislerin çoğu henüz uygulanmadı. Çalışan küçük parça packages/domain içindeki tarih çekirdeğidir; API dosyası tasarım sözleşmesidir.

## 1. Modül sınırları

| Dizin | Sorumluluk | Bağlanabileceği katman |
|---|---|---|
| apps/web | Harita, hesap, admin ekranları ve HTTP adaptörleri | Domain, sözleşmeler, server servisleri |
| apps/worker | Kontrollü import, geometri hazırlama, yayın üretimi | Aynı domain, DB ve depolama adaptörleri |
| packages/domain | Zaman, varlık kimliği, yayın kuralları | Framework veya sağlayıcı SDK'sına bağlı olmaz |
| packages/contracts | OpenAPI ve ileride üretilen istemci tipleri | Domain terimleri |
| database | Şema/migration, sorgu ve veri erişim politikası | Postgres/PostGIS |
| data | Kaynak manifestleri, lisans metaverisi; büyük dosyalar değil | Kaynak revizyonları |
| backlog | Epik/görev kayıtları ve teslim durumu | Dokümanlara bağlantı |

Web modülleri: explorer, entity-detail, perspectives, account, admin-content, admin-users, publication. İş mantığı route handler içine dağılmaz. API v1 aynı domain servisleri üzerinden web ve gelecekte mobil istemciyi besler.

## 2. Zaman modeli

### Kullanıcı ve iç temsil

| Kullanıcı gösterimi | İç astronomik yıl |
|---|---:|
| MÖ 4000 | -3999 |
| MÖ 2 | -1 |
| MÖ 1 | 0 |
| MS 1 | 1 |
| MS 2026 | 2026 |

Kural: BCE için iç yıl = 1 - kullanıcı yılı; CE için iç yıl = kullanıcı yılı. 0 yılı yalnız iç temsilin parçasıdır. Kullanıcının yıl girişi pozitif tam sayı olmalıdır.

Tarihsel yıllar JavaScript Date nesnesiyle temsil edilmez. Yayın/oturum zamanları normal ISO UTC timestamp'tir; tarihsel zamanlar ayrı türdür. Bir yerde -4000, başka yerde -3999 anlamı oluşmasına izin verilmez.

### Geçerlilik ve belirsizlik

Kesin aralık [start, endExclusive) şeklindedir. Sorgu start ≤ year < endExclusive. Kaynak “MÖ 500–400 dahil” derse son kapsanan yıl -399, dış bitiş -398 olur; ilk/son yıl dahil bilgisi içe aktarmada açıkça kaydedilir.

Belirsiz tarih için dört alan:

- start_earliest, start_latest
- end_earliest_exclusive, end_latest_exclusive

Olası görünürlük aralığı [start_earliest, end_latest_exclusive).
Kesin görünürlük aralığı [start_latest, end_earliest_exclusive); boş olabilir.
Alanların sıralaması doğrulanır. “Olası” aralıkta görünen kayıt açık belirsizlik etiketi taşır; otomatik kesinleştirilmez.

Kaynakta gün/ay varsa özgün date_expression, calendar_system ve çözünürlük de tutulur. v1 ana sorgu yıl çözünürlüğündedir. Aynı yıl içindeki değişimler tek ve kesin 1 Ocak/31 Aralık durumu gibi gösterilmez; o yıl içindeki aşamalar aday listesi/detayda açıklanır. Gün hassasiyeti ayrı API genişlemesidir.

Devam eden durumlar için açık bitiş kaynakta korunur; her yayın snapshot'ı kendi data_as_of tarihine kadar değerlendirilir. Sınırsız ileriye uzatma yapılmaz. Ürünün alt/üst sınırı domain matematiğine değil, /meta sözleşmesine bağlıdır.

## 3. Veri modeli

Tüm değişen tarihsel içerik revizyonlanır. Bir yayın, her kaydın tam revision_id değerine bağlıdır; “en güncel metni” dinamik çekmez.

| Tablo | Temel alanlar / anahtar | Kısıt / ilişki |
|---|---|---|
| entity | id UUID PK, kind, stable_slug, created_at | kind: polity, civilisation, culture, settlement, region; kimlik ad değişince değişmez |
| entity_revision | id PK, entity_id FK, revision_no, status, authored_by, reviewed_by, content_hash | UNIQUE(entity_id, revision_no); yayınlanmış revizyon değiştirilemez |
| entity_name | id PK, entity_revision_id FK, locale, name, name_type, temporal_extent_id FK | Yerel, alternatif, çağdaş veya sonradan kullanılan ad ayrımı |
| entity_relation | id PK, from_revision_id FK, to_entity_id FK, relation_type, temporal_extent_id FK | predecessor/successor/member/influence; döngü gerekmeyen ilişkilerde döngü kontrolü |
| temporal_extent | id PK, dört yıl sınırı, date_expression, calendar_system, precision, rationale | Alan sırası ve exclusive bitiş kuralı; kaynak ifade korunur |
| assertion_revision | id PK, entity_revision_id FK, predicate, value_json, locale, temporal_extent_id FK, editorial_class, rationale | Şeması predicate'e göre doğrulanır; nüfus aralık olabilir; hükümdar isimleri ayrı iddia |
| geometry_revision | id PK, entity_revision_id FK, layer_kind, geom, label_point, temporal_extent_id FK, interpretation_id, quality_note | EPSG:4326; Point/MultiPolygon; kaynak türüyle uyumlu geometri; ST_IsValid |
| source | id PK, stable_external_id | Kaynak kimliği |
| source_revision | id PK, source_id FK, title, author, publisher, uri, locator_type, license_id, access_date, rights_status, checksum | Hak durumu unknown/approved/rejected/revoked; izin kapsamı açıklanır |
| license_record | id PK, name, version, url, attribution_text, redistribution_rules | Veri ve kod lisansları ayrıdır |
| evidence_link | id PK, source_revision_id FK, assertion_revision_id veya geometry_revision_id veya perspective_revision_id, locator, relation, note | Tam bir hedef dolu olmalı; destekleyen/çelişen; locator zorunlu veya neden yok bilgisi |
| perspective_revision | id PK, observer_entity_id nullable, observer_label, knowledge_extent_id FK, artifact_extent_id FK, artifact_kind, asset_id, interpretation_note | Tasavvur ve eldeki eserin tarihi ayrı; bakış açısı etiketi zorunlu |
| perspective_georeference | id PK, perspective_revision_id FK, footprint, control_points, method, residual_note, status | Opsiyonel; şematik eserler georeference gerektirmez |
| asset_revision | id PK, object_key, hash, media_type, byte_size, rights_status, attribution, visibility | Kaynak bağlantısı ve malware/format kontrolleri; private/public ayrımı |
| coverage_cell | id PK, release_id FK, region_id, temporal_extent_id FK, layer_kind, coverage_status, note | Kapsama yokluğu tarihsel yokluk değildir |
| dataset_release | id PK, state, manifest_key, manifest_hash, data_as_of, app_schema_version, created_by, activated_at | building/validated/active/withdrawn; yalnız bir etkin yayın |
| release_member | release_id FK, revision_type, revision_id, content_hash | Revizyon türü doğrulanır; implementasyonda tipli FK tabloları tercih edilir |
| active_release | singleton PK, release_id FK, version | Compare-and-swap; birden çok yayımlayıcı yarışı engellenir |
| import_job | id PK, source_revision_id FK, checksum, adapter_version, state, report_key, retry_count | UNIQUE(source_revision_id, checksum, adapter_version); tekrarda duplicate üretmez |
| user_profile | auth_subject PK, display_name, locale, created_at, status | Kimlik sağlayıcısının subject değeri; parola tutulmaz |
| role_assignment | subject FK, role, granted_by, granted_at, revoked_at | Profil JSON'undan okunmaz; server tarafında yönetilir |
| bookmark | id PK, owner_subject FK, view_state_json, created_at | Sahiplik kısıtı; özel ve public CDN dışında |
| correction_report | id PK, owner_subject nullable, target_revision_id, body, source_url, state | Spam kontrolü ve boyut sınırı; public yayına otomatik geçmez |
| audit_event | id PK, actor_subject, action, target_id, before_hash, after_hash, reason, timestamp, request_id | Runtime rolü değiştiremez/silemez; minimum kişisel veri |

Bu tablo SQL migration yerine geçmez. Fiziksel şema ve RLS politikaları P03/P05 görevleridir. Polimorfik release_member ve evidence_link için tipli bağlantı tabloları veya CHECK+trigger ile referans bütünlüğü sağlanmalıdır; yalnız uygulamaya bırakılmamalıdır.

### İndeks ve geometri

- Geometrilerde GiST; zaman aralıklarında GiST/int4range veya sorgu planına göre birleşik filtre.
- entity_slug, release_id ve locale için sorgu odaklı indeksler.
- Tam geometri editoryal doğruluk için saklanır; sadeleştirilmiş geometri türetilmiş sürümdür.
- 180° meridyenini geçen poligonlar kanonik olarak bölünür; bbox isteği west > east ise iki kutu olarak değerlendirilir.
- Delikler, adalar, MultiPolygon ve sınırda seçim için vaka seti hazırlanır.
- Poligon merkezi denize düşebilir; etiket için incelenmiş label_point veya alan içinde nokta kullanılır.
- Katmanlar arası örtüşme kabul edilir. Aynı varlık/yorum/zamanın kopyası ise hata kabul edilir.
- ST_MakeValid gibi onarım geometriyi değiştirebilir; özgün geometri tutulur ve değişim incelemeye gönderilir.

PostGIS geçerlilik kontrolü tarihsel doğruluk kontrolü değildir. [ST_IsValid resmi belgesi](https://postgis.net/docs/ST_IsValid.html).

## 4. Harita servisleme

İlk dilim: release_id + tarih + bbox + zoom ile boyutu sınırlandırılmış GeoJSON. Aday üst sınırı 2.000 feature veya 2 MB sıkıştırılmış yanıt; ilk performans denemesinde kalibre edilir. Sınır aşılırsa sessiz kırpma yerine response-too-large ve zoom/refine gereği döner.

Dünya görünümü için önceden üretilmiş düşük detay seviyesi bulunur. Uygulama bütün tarihlerin bütün geometrilerini indirmez. DB sorgusunda zaman ve bbox ikisi de sınırlıdır.

Vektör döşeme geçişi gerektiğinde:

- Geometri revizyonları zaman aralıklarıyla MVT özelliklerine dönüştürülür.
- Dönem paketlerine yalnız paketle kesişen aralıklar alınır. Dönem paketi birimdir; kesin tarih filtresi kaybolmaz.
- PMTiles dosyaları yayın/dönem/LOD bazında bölünür; CDN range request ve CORS davranışı test edilir.
- Sınırda kesilen feature'lar kalıcı feature/revision kimliğiyle birleştirilir.
- Detay metinleri döşemeye konmaz; release_id ile API'den alınır.
- Aynı yılın her biri için ayrı dünya dosyası üretilmez.

PMTiles'ın veri erişimi HTTP Range isteklerine dayanır; dosya boyutu, istek sayısı ve CDN önbelleği birlikte ölçülür. [PMTiles Concepts](https://docs.protomaps.com/pmtiles/).

## 5. API özeti

Tam taslak: [OpenAPI](../packages/contracts/openapi.json). Public okuma giriş istemez; özel ve admin işlemleri kimlik doğrular.

| İşlem | Sözleşme |
|---|---|
| GET /api/v1/meta | Ürün tarih sınırı, etkin release_id, data_as_of, özellik bayrakları |
| GET /api/v1/releases/{releaseId}/features | year + era + bbox + zoom + layers; kaynak ve geometri revizyon kimlikleri |
| GET /api/v1/releases/{releaseId}/entities/{entityId} | Aynı yıl ve yayın için adlar, iddialar, kanıtlar |
| GET /api/v1/releases/{releaseId}/sources/{sourceId} | İzinli bibliyografik kaynak görünümü |
| GET /api/v1/releases/{releaseId}/search | q + isteğe bağlı yıl/era; alias ve dönem bilgisi |
| GET /api/v1/releases/{releaseId}/coverage | Bölge/dönem/katman için veri durumu |
| GET /api/v1/releases/{releaseId}/perspectives | Tarih ve bakış açısına uygun kayıtlar |
| GET /api/v1/releases/{releaseId}/perspectives/{perspectiveId} | Eser, iki tarih, haklar, görsel/georeference yöntemi |
| GET/POST /api/v1/me/bookmarks | Yalnız oturumdaki kullanıcının görünüm kayıtları |
| DELETE /api/v1/me/bookmarks/{bookmarkId} | Sahiplik denetimi; tekrar silme idempotent |
| POST /api/v1/corrections | Sınırlı, doğrulanmış düzeltme önerisi |
| GET /api/v1/admin/users | Minimum kullanıcı alanları; arama ve cursor |
| PATCH /api/v1/admin/users/{subject}/role | Admin + yeniden doğrulama; kendi son adminini kaldırma engeli |
| GET /api/v1/admin/drafts | Tür/durum ve cursor ile yetkili taslak listesi |
| GET /api/v1/admin/drafts/{draftId} | Taslak, tam revizyon ve inceleme durumu |
| POST /api/v1/admin/drafts | Sürüm numaralı, şeması doğrulanan taslak |
| POST /api/v1/admin/drafts/{draftId}/submit | Belirli hash/revizyonu inceleme kuyruğuna gönder |
| POST /api/v1/admin/drafts/{draftId}/reviews | accept/reject; revizyon eşleşmesi ve inceleme kaydı |
| POST /api/v1/admin/imports | Kayıtlı kaynaktan kontrollü iş; serbest URL fetch yok |
| POST /api/v1/admin/releases | Idempotency-Key; 202 + iş kimliği |
| GET /api/v1/admin/releases | Yayın adayları, etkin/geri çekilmiş sürümler ve cursor |
| GET /api/v1/admin/jobs/{jobId} | İzinli iş durumu ve hata özeti |
| POST /api/v1/admin/releases/{releaseId}/activate | If-Match ile etkin yayın versiyonu; doğrulanmış sürüm |
| POST /api/v1/admin/releases/{releaseId}/withdraw | Gerekçe, erişim iptali ve aktifyse alternatif sürüm |

Auth uçları sağlayıcının desteklenen SDK/endpoint'lerini kullanır; bu OpenAPI sağlayıcı kimlik protokolünü yeniden tanımlamaz. Hesap silme/erişim durdurma işlemleri sağlayıcı ile uygulama verilerinin birlikte işlendiği P05/P07 görevleridir.

Taslak düzenleme mevcut revizyonu sessizce değiştirmez: POST /admin/drafts ile parentRevisionId'ye bağlı yeni bir revizyon oluşturulur. Bu durumda If-Match önceki içerik hash'ini taşımalıdır; uyuşmazlıkta 412 döner. Gönderme ve inceleme işlemleri tam revizyon/hash üzerinden ilerler.

## 6. API davranışı

Hatalar RFC 9457 tarzı application/problem+json: type, title, status, code, request_id. Stack trace veya SQL kullanıcıya dönmez.

400 geçersiz tarih/bbox; 401 oturum yok; 403 yetki yok; 404 görünür kayıt yok; 409 çakışma/geçersiz durum; 410 geri çekilmiş yayın; 412 eski If-Match; 422 içerik doğrulama; 429 hız sınırı + Retry-After.

GET yanıtları ETag destekler. Public önbellek anahtarında release_id, normalize parametreler, locale ve katmanlar vardır. Özel/admin yanıtlar private,no-store; paylaşılan public cache'e girmez.

Etkin yayın “sonsuz immutable” cache'lenmez. Geçmiş sürüm URL'leri sabit olsa da geri çekme için denylist/origin kontrolü ve sonlu TTL kullanılır. İndirilmiş kamu içeriğini kullanıcının cihazından geri almanın mümkün olduğu iddia edilmez.

Metin API'si HTML kabul etmez. Şema dışı alanlar reddedilir. Arama parametreleri SQL'e birleştirilmez. Cursor imzalı ve sürüme bağlıdır.

## 7. İçerik yayın algoritması

1. Admin isteği doğrulanır: aktif oturum, rol, MFA, CSRF, If-Match/Idempotency-Key.
2. Worker immutable aday listesi oluşturur: entity, assertion, geometry, source, asset ve perspective revizyonları.
3. İşlem anında hak durumu, inceleme, zaman ve geometri koşulları tekrar kontrol edilir.
4. Kamuya açık olmayan alanlar allowlist ile çıkarılır.
5. Yeni yayın prefix'ine çıktı yazılır; aynı anahtarın üzerine yazılmaz.
6. Manifest hash ve referansları, dosyaların varlığı, lisans atıfları ve veri şeması kontrol edilir.
7. Yayın validated durumuna gelir; release_members dondurulur.
8. Aktivasyon DB transaction'ında eski version ile karşılaştırılır; başarısızsa 412.
9. Küçük etkin-manifest önbelleği temizlenir; istemci tek bir release_id'ye bağlanır.
10. Hata olursa etkin sürüm korunur. Aday çıktılar retention işiyle temizlenir.

Aktivasyon sırasında izin/hak durumu tekrar kontrol edilir; validated olmuş olması sonradan geri çekilmiş kaynağı kullanmaya yetmez.

Rollback şema silme veya veri geri yazma değildir. Önceki sağlam yayın etkinleştirilir. Kritik hak/gizlilik ihlalinde ilgili tüm geçmiş yayınlar geri çekilir; yalnız işaretçiyi değiştirmek yeterli sayılmaz.

## 8. İçeri aktarma

Kayıtlı kaynak adaptörü → izinli indirme → checksum → karantina → parse → tarih/lisans/CRS normalleştirme → duplicate denetimi → geometri QA → insan incelemesi.

İş idempotent'tir. Aynı checksum ve adaptör sürümü tekrar çalışınca duplicate oluşturmaz. Kısmi hata raporlanır; başarılı satırlar bile otomatik yayınlanmaz. Ağ ve boyut bütçesi, retry/backoff ve hata kuyruğu vardır.

Kaynak sayfalarının genel içerik kazıması ilk sürümde yoktur. Kullanıcı URL'si sunucudan sınırsız fetch edilmez. Lisansı belirsiz kayıt karantinada kalır.

## 9. Mobil devam planı

Önce API sözleşmesini tüketen ikinci istemci denemesi. React bileşenlerinin tamamının paylaşılacağı vaat edilmez; domain, tarih dönüşümü, sözleşmeler ve bazı görünüm state kuralları paylaşılır.

Native kimlik akışında sağlayıcının desteklediği code+PKCE, cihazın güvenli token deposu ve session revoke kullanılır. Web cookie modeli native'e aynen taşınmaz.

Offline veri indirme ancak lisans, boyut, güncelleme ve geri çekilme davranışı netleştikten sonra eklenir. Kullanıcının indirilen tarih sürümünü görmesi zorunludur.
