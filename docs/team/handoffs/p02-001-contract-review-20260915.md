# Görev devir kaydı — P02-001 sözleşmesinin bağımsız incelemesi ve düzeltmeleri

- Görev / issue: [P02-001 #6](https://github.com/hturkmen/civilisation-atlas/issues/6); katkı olarak [P02-002 #7](https://github.com/hturkmen/civilisation-atlas/issues/7) ve [P02-004 #9](https://github.com/hturkmen/civilisation-atlas/issues/9)
- Çalışan araç ve rol: Claude (Cowork), inceleme ve entegrasyon çalışanı
- Durum: `blocked` — yerel iş tamam ve doğrulandı; GitHub'a push bu oturumda yetkilendirilmemiş (aşağıya bakınız)
- Güncelleme zamanı: 2026-09-15 13:05 (+01:00, Europe/London; UTC+1)
- Başlangıç `origin/main` tam SHA: `af93ee9b9aa8300ec9f557747929b84153ca29bc`
- Dal / PR URL: yerel dal `agent/claude/p02-001-contract-review-20260915`; PR açılamadı (erişim engeli)
- Son push edilen uygulama commit'i: yok — push engellendi
- Son doğrulanan commit: `39bcf50509cd5fd244ca47fb4a563b9b11a50001` (+ bu devir kaydı ve belge commit'i)
- İnceleme kapsamı / kalan fark: PR #47'nin tamamı (`b5fe094`, squash-merge) ve devam kaydı commit'i `af93ee9`

## Somut hedef ve kabul ölçütleri

Kiro'nun PR #47 ile birleştirdiği P02-001 kaynak/kanıt sözleşmesini bağımsız olarak incelemek, gerçek hataları düzeltmek, CRLF/checksum farkının kök nedenini kanıtlamak ve önceki raporda "ortam engeli" denen kontrolleri gerçekten çalıştırmak.

Önceki rapor kanıt olarak kabul edilmedi; bildirilen SHA'lar, dosyalar ve sonuçlar yeniden doğrulandı. Bildirilen `b5fe0940a20dc5911475feac4c6463cdb71db83b` ve `af93ee9` commit'lerinin ikisi de `main` üzerinde mevcut ve bildirilen içerikle eşleşiyor.

## Değiştirilen dosya alanları ve ortak dosya ihtiyacı

`packages/domain/src/editorial.mjs` + `.d.mts`, `packages/domain/test/editorial.test.mjs`, `packages/contracts/editorial/*.schema.json` + `README.md`, `data/editorial/{sources,candidates}.json`, `scripts/validate-editorial.mjs`, `scripts/import-boundaries.py`, `.gitattributes` (yeni), `docs/13-sourced-boundaries.md`, bu devir kaydı, `docs/12-continuation.md`.

Ortak `package.json`, lockfile ve `packages/domain/package.json` değiştirilmedi. `.gitattributes` yeni bir ortak dosyadır ve yalnız tek bir satır kural içerir. Üretilmiş GeoJSON, `data/boundary-collection.json` ve `data/boundary-import.json` elle düzenlenmedi.

## Tamamlananlar

Altı hata PR #47'nin birleştirilmiş kodunda **yeniden üretildi**, sonra düzeltildi. Her biri için `af93ee9` üzerinde başarısız olan, bu dalda geçen bir regresyon testi eklendi.

Yayın kapısı (artık kapalı tarafa düşüyor):

1. **Nesne bazlı hak kısıtı atlanabiliyordu.** `objectRightsExceptions` yalnız `evidence.locator` ile eşleştiriliyordu. Kanıt `locator: null` + `locatorMissingReason` ile verildiğinde kaynak genel durumuna (`approved`) düşüyor ve `rejected` işaretli nesne `publishable: true` oluyordu. Artık locator vermeyen kanıt, kaynaktaki **en kısıtlayıcı** durumu devralır.
2. **Aynı `objectLocator` için iki istisna** varsa `find()` ilkini seçiyordu; izinli kayıt kısıtlayıcı kaydı gölgeleyebiliyordu. Tekrar eden locator artık yapısal hata.
3. **Kanıtı hiç olmayan aday `publishable: true` dönüyordu**, çünkü hak döngüsü sıfır kez çalışıyordu. Artık açıkça engelleniyor.

Sözleşme ile uygulama arasındaki farklar:

4. **Kaynak kimliği ile kaynak revizyonu ayrılmamıştı.** P02-001 kabul ölçütü ("kaynak, veri sürümü ve lisans istisnası birbirinden ayrılır"), `docs/02-sources-and-editorial.md` ("checksum/sürüm tutulur") ve `docs/04-low-level-design.md` (`source_revision` tablosu) bunu istiyor; hata mesajı da "source revision" diyordu. Gerçekte hiçbir katmanda (mjs, d.mts, şema, veri) revizyon alanı yoktu. Artık kaynak ya `revision` taşır ya da neden taşımadığını açıklayan `revisionNote`; kanıt `sourceRevision` sabitleyebilir ve kaynak revizyonu değişirse kanıt ile ona dayanan inceleme geçersiz olur. Cliopatria kaydının revizyonu depoda zaten bulunan sabit commit'tir (`data/boundary-import.json` → `commit`); yeni bir sürüm iddiası üretilmedi.
5. **`entityRef` hiç çözümlenmiyordu.** Var olmayan bir kimlik veya yanlış `kind` sessizce geçiyordu. Doğrulayıcı artık isteğe bağlı bir varlık kimlik listesi alır; `scripts/validate-editorial.mjs` bunu mevcut koleksiyonlardan üretir (39 varlık). Domain modülü dosya sistemine erişmez.
6. **JSON Schema ile çalışan validator çelişiyordu.** Şema `blocked` adayda `extent`'i yasaklarken validator kabul ediyordu; `reviewedContentHash` için şemada hex deseni varken validator yalnız boş olmamasına bakıyordu; `publishedOn` ile `publishedOnNote`'un birlikte bulunamayacağı yalnız açıklama metnindeydi. Üçü de hem şemada hem validator'da uygulandı.
7. **Bozuk girdi ham `TypeError` üretiyordu** ("Invalid URL", "Cannot read properties of null"). Artık hangi kaydın/alanın hatalı olduğunu söyleyen adlandırılmış doğrulama hataları veriliyor.

Önce/sonra karşılaştırması (aynı girdilerle, `af93ee9` modülü ile bu daldaki modül):

| Senaryo | PR #47 (`af93ee9`) | Bu dal |
|---|---|---|
| Locator'sız kanıtla hak kısıtı atlama | `publishable=true` | `publishable=false` |
| Kanıtı olmayan aday | `publishable=true` | `publishable=false` |
| Bozuk URL hata türü | `TypeError` | `Error` (adlandırılmış) |
| Var olmayan `entityRef` | kabul edildi | reddedildi |

CRLF / checksum — kök neden kanıtlandı, teşhis olduğu gibi kabul edilmedi:

- Git blob ve LF checkout: **317.270 bayt**, 0 CR, sha256 `fd5a005b…` = kayıtlı `geometrySha256`.
- Kullanıcının Windows checkout'u (dosya gerçekten okunarak): **317.271 bayt**, **tek 1 CR**, sha256 `8345861e…`.
- Tek CR çıkarıldığında dosya commit'lenmiş baytlarla **birebir aynı** (`cmp` ile doğrulandı). İçerik bozuk değil; fark yalnız checkout dönüşümü.
- Dosya tek satırdır (`separators=(',',':')` + tek sondaki `\n`), bu yüzden fark tam olarak 1 bayttır. Aynı +1/+N farkı `README.md`, `package.json`, `.gitignore` gibi dosyalarda da görülüyor; yani `core.autocrlf=true` tüm çalışma kopyasında etkin.
- Depoda `.gitattributes` **yoktu**.

Çözüm: `.gitattributes` içinde tek kural — `apps/web/public/data/*.geojson -text`. Bu, hash'lenen üretilmiş yapıtın çalışma kopyası baytlarını her platformda blob ile aynı tutar. Beklenen checksum, üretilmiş GeoJSON, metadata ve test **değiştirilmedi**; hash öncesi sessiz normalizasyon eklenmedi; depo yeniden normalize edilmedi.

Ek olarak `scripts/import-boundaries.py` çıktılarını platform varsayılan newline/encoding ile yazıyordu (`write_text(bundle)`), oysa `geometrySha256` LF/UTF-8 dizeden hesaplanıyor. Windows'ta betiğin ürettiği dosya, betiğin az önce kaydettiği hash ile **hiçbir zaman** uyuşmazdı. Artık `encoding='utf-8', newline='\n'` açıkça veriliyor. Bu ayrı, gerçek bir determinizm hatasıydı ve git checkout'undan bağımsızdır.

## Doğrulama

| Komut / inceleme | Sonuç | Ortam / kapsam / kalan sınırlama |
|---|---|---|
| `npm ci` | Geçti | 63 paket, lockfile korundu; sürüm yükseltmesi veya yeni bağımlılık yok |
| `node scripts/validate-editorial.mjs` | **Geçti** | 5 kaynak, 5 aday; artık 39 mevcut varlığa karşı `entityRef` de çözümleniyor; 0 publishable (beklenen) |
| `npm test` | **Geçti — 43/43** | PR #47 sonrası 35 testti; 8 regresyon testi eklendi. Kiro'nun bildirdiği tek başarısız test bu LF checkout'ta hiç oluşmuyor |
| `npm run typecheck` | **Geçti** | `tsc --noEmit`, apps/web |
| `npm run check:plan` | **Geçti** | `result: passed`, 45 görev / 8 proje / 28 API işlemi. Kiro'da "Python yok" diye engelli yazılmıştı; bu ortamda Python 3.11.15 var ve betik gerçekten çalıştı |
| `node scripts/validate-boundaries.mjs` | **Geçti** | Tek başına çalıştırıldı; metadata, tarihler ve geometri yapıtı doğrulandı |
| CRLF benzetimi — kural **öncesi** (`core.autocrlf=true`, `af93ee9`) | **Başarısız (beklenen)** | `boundaries.test.mjs` 5 geçti / 1 başarısız; 317.271 bayt. Kiro'nun bildirdiği hata birebir yeniden üretildi |
| CRLF benzetimi — kural **sonrası** (`core.autocrlf=true`, bu dal) | **Geçti** | `boundaries.test.mjs` 6/6; 317.270 bayt, 0 CR. Aynı koşumda `README.md` hâlâ 72 CR taşır, yani kural yalnız hash'lenen yapıta uygulanıyor |
| `npm run build` | **Ortam engelli — geçti sayılmadı** | `prebuild` ikinci adımı `scripts/prepare-archive-assets.mjs`, `https://thumb.wikimedia.org/...` adresini indiremiyor. Bu ortamda neden **TLS değil, egress politikası**: proxy `CONNECT` isteğine **403** dönüyor. `next build` bu yüzden hiç çalıştırılmadı |
| `npm run test:e2e` (Playwright) | **Çalıştırılmadı** | Bu dilim çalışma zamanı davranışını veya arayüzde tüketilen veriyi değiştirmiyor; `data/editorial/` henüz hiçbir arayüz bileşeni tarafından okunmuyor (kontrol edildi). `npm run build` de engelli olduğu için üretim sunucusu ayağa kaldırılamazdı |
| Gerçek Windows üzerinde koşum | **Yapılmadı** | Bu oturumun kullanıcı makinesinde komut çalıştırma yetkisi yok (`device_bash` mevcut değil). Windows tarafı yalnız **dosya baytları okunarak** doğrulandı; CRLF senaryosu Linux'ta `core.autocrlf=true` ile benzetildi |

Başarısız veya engelli hiçbir kontrol başarılı sayılmadı. Önceden var olan hata da hata olarak ele alındı: CRLF/checksum farkı "benim değişikliğim değil" denip bırakılmadı, kök nedeni kanıtlanıp düzeltildi.

Kiro'nun doğrulama tablosundaki iki satır bu ortamda **doğrulanmadı**: `npm run check:plan` gerçekte geçiyor (Python mevcut), ve `npm run build` hatası burada TLS/self-signed değil 403 egress reddi. Kiro'nun `SELF_SIGNED_CERT_IN_CHAIN` bildirimi kendi Windows/kurum ağına ait olabilir; o iddia bu oturumda ne doğrulandı ne de yalanlandı.

## Kaynak / hak / güvenlik / altyapı notları

Yeni kaynak eklenmedi, mevcut kaynakların lisansı/checksum'ı/locator'ı değiştirilmedi. Eklenen tek kaynak alanı `revision`/`revisionNote`:

- `ed-cliopatria-v0-2-0` → `revision: ad28a691b7c07c1fca89d0e0636d324667d2a258`. Bu değer depoda zaten `data/boundary-import.json` içinde `commit` olarak kayıtlı ve `locatorUrl` içinde geçiyor; yeni bir iddia değil, mevcut sabitin ayrı alana taşınması.
- Diğer dördü `revisionNote` taşıyor ve **sabit revizyon iddia etmiyor**: UNESCO liste sayfaları yerinde güncellenebilir, LOC katalog kaydı için revizyon kimliği kullanılmadı, Wikimedia dosya sayfasının `oldid`'i bu oturumda doğrulanmadığı için yazılmadı.

Beş adayın kaynak metni, locator ve checksum iddiaları bu oturumda **yeniden doğrulanmadı**; UNESCO sayfalarına erişim bu ortamda mümkün değil. Kiro'nun "canlı sayfadan doğrulandı" kaydı bu incelemede kanıt sayılmadı, yalnız değiştirilmeden bırakıldı. `entityRef` hedeflerinin dördü de mevcut koleksiyonlarda **gerçekten bulundu** (`mohenjo-daro`, `great-zimbabwe`, `cliopatria-1235`, `waldseemuller-1507`).

Tarihsel/uzman inceleme yapılmadı ve yapılmış gibi sunulmuyor. Bu bir teknik kod incelemesidir. Beş adayın tamamı hâlâ `reviewStatus: unreviewed` ve hiçbiri yayınlanabilir değil. Gizli bilgi, anahtar veya gerçek kullanıcı verisi eklenmedi. TLS doğrulaması hiçbir noktada zayıflatılmadı; `NODE_TLS_REJECT_UNAUTHORIZED`, `strict-ssl` veya HTTP'ye düşürme kullanılmadı, sahte görsel eklenmedi.

## Kesinti ve devralma

- Devam eden süreç veya kısmi değişiklik yok. Yerel dilim kendi içinde tamamlanmış ve doğrulanmıştır; eksik olan tek şey GitHub'a teslim.
- **İlk yapılacak somut iş:** dalı push edip PR açmak. Bu oturumda git proxy'si `hturkmen/civilisation-atlas` için kimlik bilgisi enjekte etmiyor (`403: not in this session's authorized repository set`) ve oturumda repoyu yetkilendirecek bir araç yok. Kullanıcının depoyu oturumun kaynak listesine **push** erişimiyle eklemesi gerekir; alternatif olarak `docs/team/handoffs/` altındaki bu kayıt ve commit yerel olarak teslim edilebilir.
- **Windows checkout'u için tek seferlik adım:** `.gitattributes` geldikten sonra çalışma kopyasındaki CRLF dosya kendiliğinden düzelmez ve `git status` temiz görünür (stat önbelleği). Tek dosya için `rm apps/web/public/data/polity-boundaries.geojson` ardından `git checkout -- apps/web/public/data/polity-boundaries.geojson`. `git add --renormalize` bu dosyada **kullanılmamalı**: `-text` altında CRLF baytlarını index'e yazar (denendi, 317.271 baytlık blob üretti).
- **Hangi işi tekrar yapmamak gerekir:** beş adaylık Gate A paketini yeniden üretme; `data/boundary-import.json` / `boundary-collection.json` / üretilmiş GeoJSON'a dokunma; CRLF farkını yeniden teşhis etme (kök neden kanıtlandı ve düzeltildi); `npm run check:plan`'i "Python yok" diye engelli sayma.
- **Kullanıcı kararı/erişim bekleyen adım:** (a) GitHub push yetkisi — yukarıda. (b) `npm run build`: Wikimedia indirmesi için ya egress izni, ya kurum CA'sının `NODE_EXTRA_CA_CERTS` ile tanıtılması, ya da `apps/web/public/maps/waldseemuller-1507.jpg` dosyasının kayıtlı sha256 (`f4219df3…`) ile yerel olarak sağlanması gerekir; betik hash'i doğrulanan yerel dosyayı zaten kabul edip indirmeyi atlar, dolayısıyla kaynak ve hash kontrolleri korunur. (c) Bağımsız tarihçi incelemesi hâlâ kullanıcı kararı bekliyor (`docs/07-decisions-and-blockers.md`). Bunların hiçbiri bu dilimi engellemedi.

## GitHub ve yayın

- Push doğrulaması / uzak SHA: **yok — push engellendi.** Yerel commit `39bcf50509cd5fd244ca47fb4a563b9b11a50001` ve bu kaydı içeren belge commit'i. Push/PR/merge yapılmış gibi kaydedilmiyor.
- PR inceleme ve birleştirme durumu: PR açılamadı. PR #47 halihazırda `main`'e birleştirilmiş durumda ve bu dal onun **üstüne** düzeltme getiriyor; PR #47 yeniden açılmıyor veya geri alınmıyor.
- Demo: `not_needed` — bu dilim arayüzü, yayınlanan demo davranışını veya çalışma zamanında tüketilen veriyi değiştirmiyor. `data/editorial/` hiçbir arayüz bileşeni tarafından okunmuyor.
- Yayımlandıysa hizmetten doğrulanan sürüm / dağıtım / zaman / URL: uygulanmaz.
