# Görev devir kaydı — P02-001 kaynak/kanıt sözleşmesi

- Görev / issue: [P02-001 #6](https://github.com/hturkmen/civilisation-atlas/issues/6); katkı olarak [P02-002 #7](https://github.com/hturkmen/civilisation-atlas/issues/7) ve [P02-004 #9](https://github.com/hturkmen/civilisation-atlas/issues/9)
- Çalışan araç ve rol: Kiro, veri çalışanı
- Durum: `ready_for_review`
- Güncelleme zamanı: 2026-09-15 12:40 (+03:00, Europe/Istanbul; UTC+3)
- Başlangıç `origin/main` tam SHA: `80fe225d0e0732dc3b1e51865fcb21d0c57fed4e`
- Dal / PR URL: `agent/kiro/p02-001-editorial-contract-20260915` — bu commit push edildikten sonra PR açılacak, aşağıdaki "GitHub ve yayın" bölümünde güncellenir
- Son push edilen uygulama commit'i: (bu devir kaydıyla birlikte push edilen commit; bu dosya kendi SHA'sını içermez, `git log -1` ile doğrulanır)
- Son doğrulanan commit: aynı, henüz push edilmedi
- İnceleme kapsamı / kalan fark: yalnızca aşağıda listelenen yeni/değişen dosyalar

## Somut hedef ve kabul ölçütleri

`docs/team/prompts/kiro-data.md` promptundaki P02-001 görevi: sürümlü, makineyle doğrulanabilir bir editoryal kaynak/kanıt sözleşmesi + beş adaylık küçük Gate A paketi. Mevcut demo verisini yeni şemaya taşımadan, toplu kayıt/geometri eklemeden.

## Değiştirilen dosya alanları ve ortak dosya ihtiyacı

Yalnızca izin verilen dosya alanı: `packages/contracts/editorial/`, `data/editorial/`, `scripts/validate-editorial.mjs`, `packages/domain/test/editorial.test.mjs`, `packages/domain/src/editorial.mjs`+`.d.mts`, `packages/domain/README.md` (yeni komutu belgelemek için eklendi), bu devir kaydı. Ortak `package.json`/lockfile'a dokunulmadı; testler relative import kullanır.

## Tamamlananlar

- `packages/domain/src/editorial.mjs` + `.d.mts`: kaynak kimliği/sürümü, nesne bazlı hak istisnası, lisans, zorunlu atıf, kullanım kapsamı, hak durumu, erişim tarihi, checksum dayanağını ayıran `validateEditorialSources`; sayfa/harita locator'ı veya `locatorMissingReason`, `supports/contradicts/context`, kaynak ifadesi vs editör çıkarımını ayıran `validateEditorialEvidence`/`validateEditorialCandidates`; ve rights+review'i **ayrı** kontrol eden `evaluatePublishability` (hak `approved` olması review'i onaylamaz, review geçmesi hak durumunu onaylamaz). `contentHash` ile içerik değiştiğinde eski review'in `reviewedContentHash` üzerinden geçersiz sayılması sağlanır. Ağ isteği yapılmaz (test edildi, bkz. aşağıdaki doğrulama tablosu).
- `packages/contracts/editorial/{source,candidate,temporal-extent}.schema.json` + `README.md`: yapısal sözleşmenin JSON Schema belgeleri; yayın kapısının validator'da olduğu, şemanın kendisinin onay vermediği açıkça yazıldı.
- `data/editorial/sources.json`: 5 gerçek kaynak (UNESCO 138, UNESCO 364, Cliopatria v0.2.0, LOC Waldseemüller 2003626426, Wikimedia RomanEmpire_117.svg dosya sayfası). UNESCO/Cliopatria/LOC kayıtları mevcut `data/preview-collection.json`, `data/boundary-collection.json`, `data/historical-maps.json` içindeki aynı kararları sözleşme alanlarına taşır; kaynak uydurulmadı.
- `data/editorial/candidates.json`: 5 aday —
  1. Mohenjo-daro: UNESCO'nun gerçek "beginning of the 3rd millennium BC" ifadesi (canlı sayfadan doğrulandı), uygarlığın MÖ 2500–1500 aralığından ayrıştırıldı.
  2. Büyük Zimbabve: UNESCO'nun gerçek "built between 1100 and 1450 AD" ifadesi (canlı sayfadan doğrulandı), Şona kültürünün/yerleşimin tüm varlık süresinden ayrıştırıldı.
  3. Roma İmparatorluğu MS 117: yeni geometri **eklenmedi**; mevcut `data/boundary-collection.json` kaydı `cliopatria-1235`'e (Wikidata Q12544) doğrudan atıf.
  4. Waldseemüller 1507: LOC katalog kaydına dayanan artifact/knowledge date ayrımı.
  5. Roma için alternatif yorum — **engellendi**. Wikimedia Commons `File:RomanEmpire_117.svg` incelendi; dosya sayfası "A source (reference) has not been provided for the data in this self-made map" diyor. Kanıt zinciri kurulamadığı için aday `status: blocked` olarak kaydedildi, sahte kaynak/çelişki uydurulmadı.
  Tüm adaylar `reviewStatus: unreviewed`; `evaluatePublishability` hiçbiri için `publishable: true` döndürmüyor (beklenen sonuç).
- `scripts/validate-editorial.mjs`: yapısal doğrulama + her adayın publishability raporu.
- `packages/domain/test/editorial.test.mjs`: 4 gerçek veri testi + 8 fixture testi (rights unknown/rejected/revoked, nesne bazlı istisna, eksik/yanlış hedefli kanıt, çelişen kaynak, stale review hash, unreviewed asla publishable değil, ağ erişimi yok, yapısal red). Fixture'lar açıkça `fixture:` önekiyle etiketlendi.
- `packages/domain/README.md`: yeni modül ve komut belgelendi.

## Doğrulama

| Komut / inceleme | Sonuç | Ortam / kapsam / kalan sınırlama |
|---|---|---|
| `node scripts/validate-editorial.mjs` | Geçti | 5 kaynak, 5 aday yapısal geçerli; 0 publishable (beklenen) |
| `npm test` | 34/35 geçti | Tek başarısız test `boundaries.test.mjs` içindeki geometri checksum karşılaştırması; `git stash` ile doğrulandı ki bu hata bu PR'ın değişikliklerinden **önce de** mevcuttu (muhtemelen Windows CRLF checkout farkı, `core.autocrlf=true`). Bu PR'ın dosya alanı bu dosyaya dokunmuyor; düzeltme kapsam dışı bırakıldı. Editorial testlerinin tamamı (12/12) geçti. |
| `npm run typecheck` | Geçti | apps/web tsc --noEmit |
| `npm run build` | Başarısız — ortam engeli | `prepare-archive-assets.mjs` Wikimedia'dan görsel indirmeye çalışırken `SELF_SIGNED_CERT_IN_CHAIN` alıyor (bu makinedeki TLS ortası proxy/sertifika). `git stash` ile doğrulandı ki bu PR'ın değişiklikleri olmadan da aynı hata oluşuyor; ortam kısıtı, bu PR'ın regresyonu değil. |
| `npm run check:plan` | Başarısız — ortam engeli | Bu makinede `python3`/`python` kurulu değil; betik Python gerektiriyor. Bu PR yalnızca Markdown/JSON belgeleri içerir, plan yapısını değiştirmez. |
| `node scripts/validate-boundaries.mjs` | Build'in bir parçası olarak başarısız (yukarıdaki checksum farkı) | Bu PR `data/boundary-collection.json` veya geometriyi değiştirmiyor; hata build zincirinin önceki adımındaki ortam engelinden geliyor. |

Eksik ortam aracı veya önceden var olan hata başarılı sayılmadı; her biri ayrı satırda ve nedeniyle kaydedildi.

## Kaynak / hak / güvenlik / altyapı notları

Beş kaynağın ikisi (UNESCO 138, UNESCO 364) canlı sayfadan gerçek metinle doğrulandı (`web_fetch`, 2026-09-15). Cliopatria ve LOC kayıtları mevcut repo belgelerindeki (docs/13-sourced-boundaries.md, data/historical-maps.json) zaten doğrulanmış bilgiye dayanır; bu oturumda yeniden indirilmedi. Wikimedia kaynağı yalnızca "engellendi" belgelemesi için kullanıldı, kanıt olarak değil. Hiçbir aday `independently_reviewed` değildir; hiçbiri yayınlanabilir değildir. Gizli bilgi veya gerçek kullanıcı verisi eklenmedi.

## Kesinti ve devralma

- Devam eden süreç veya kısmi değişiklik yok; bu dilim kendi içinde tamamlanmış durumda push edilmeye hazır.
- İlk yapılacak somut komut/iş: bu commit'i push et, PR aç, PR açıklamasına bu tabloyu ve kalan riskleri yaz.
- Hangi işi tekrar yapmamak gerekir: beş adaylık Gate A paketini yeniden üretme; `data/boundary-import.json`/`boundary-collection.json`'a dokunma (bu PR'da elle düzenlenmedi); `main`'deki önceden var olan CRLF/checksum farkını bu PR kapsamında "düzeltilmiş" sayma.
- Kullanıcı kararı/erişim bekleyen adım ve engellenmeyen alternatif: Gerçek bağımsız tarihçi incelemesi kullanıcı/harici karar gerektirir (kim inceleyecek — bkz. `docs/07-decisions-and-blockers.md`); bu PR bu kararı beklemeden yapısal sözleşmeyi ve `unreviewed` adayları teslim ediyor, engellenmedi.

## GitHub ve yayın

- Push doğrulaması / uzak SHA: aşağıda commit/push adımından sonra güncellenecek
- PR inceleme ve birleştirme durumu: taslak PR açılacak
- Demo: `not_needed` — bu görev dosya alanı (`packages/contracts/editorial/`, `data/editorial/`, domain modülü, script, test) mevcut web arayüzünü veya yayınlanan demo davranışını değiştirmiyor.
- Yayımlandıysa hizmetten doğrulanan sürüm / dağıtım / zaman / URL: uygulanmaz (demo değişmedi)
