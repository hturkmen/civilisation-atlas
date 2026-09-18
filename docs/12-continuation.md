# Devam kaydı

## Güncel devir noktası — 18 Eylül 2026

**Önce bu bölümü oku.** Aşağıdaki tarihli kayıtlar geçmiş sonuçlardır; eski “sonraki iş” cümleleri görev kuyruğu değildir. Uzak main ilerlemişse bu özeti güncel kod/devir kayıtlarıyla uzlaştır; tamamlanan dilimi yeniden başlatma.

| Alan | Güncel durum / yeniden yapılmayacak iş |
|---|---|
| Arayüz | Dönemler arası arama ve mobil alt panel tamamlanan dilimlerdir. Zaman çizelgesi/arama metinle büyür, kontroller sarılır; 360 px iki kat metin ve klavye testi eklendi. |
| Veri ve DB | 28 siyasi yapı / 389 alan; bu dilimde Avrupa/Amerika için 164 yeni kaynak kaydı. Önceki 225 metadata/geometri korunur. Üç yerleşim / bir arşiv ve beş unreviewed Gate A adayı değişmedi. |
| Bu dilimin testleri | 54/54 domain; editoryal pin/sınır validator; demo build/TypeScript ve 25/25 Chromium geçti. Fransa/Yeni Fransa ortak dönemli 34 kaynak çifti kesişmez. Ana Node build/gerçek cihaz/Safari/Firefox yapılmadı. |
| Son kod/yayın | Main veri commit: ad27e3f1be27eecb5ef1f411a4ea1758b9d8abe7. Demo kaynak: a89948e711e765b0892b035091fbda2b211e58a8. V9 succeeded, 2026-09-18T07:04:51.696563+00:00. Özel erişim korundu; canlı Site üzerinde ek tarayıcı testi yapılmadı. |
| İlk sonraki adım | P04-005 kalan mobil büyük metin/klavye kabulünü ve büyüyen veri için P04-006 ölçümünü ele al. 389 kayıt ve V9 yayını tamam; yeniden başlatma. İngiltere/İspanya/diğer koloniler tarih ve kimlik incelemesi bekliyor. |


Her dilim sonunda bu tabloyu, kendi handoff kaydını ve ilgili backlog notunu güncelle. Çalışan kodun SHA'sını, gerçekten geçen/çalışmayan testleri, demo dağıtım sonucunu ve sonraki tek işi belirt. Kullanıcı “devam” dediğinde en baştan plan çıkarmak yerine bu devir noktasından ilerle.

## Kullanıcı yönlendirmesi

Görsel öncelikle geliştir; tüm hedef tamamlanana kadar ilerle. Süre veya token nedeniyle iş kesilirse üç saatte bir devamı tetikleyecek otomasyon istendi.

## Otomasyon durumu

Kuruldu ve etkin. Önceki 5 aktif görev sınırı, kullanıcının seçtiği görevlerin devre dışı bırakılmasıyla çözüldü. Kişisel görevlerin adları/kimlikleri bu açık depoda tutulmaz.

Kullanıcının istediği sıklık üç saatti. Sonraki servis okumasında dört saatlik aralık görüldü; fark kullanıcıya bildirildi. 13 Eylül son kontrolünde kullanıcının ilk talebine uygun üç saatlik aralık geri yüklendi ve servis güncellemeyi doğruladı. Yeni plan başlangıcı 14 Eylül 2026 00:13 Türkiye saati. Önceki değişimin sebebi doğrulanmadığı için uydurulmaz. Güncel tetikleme zamanı ve sıklığı bu metinden hesaplanmamalı, zamanlama servisinden kontrol edilmeli. Amaç hatırlatma göndermek değil, işi kaldığı yerden yürütmek. Aktif çalışmayla çakışma; mevcut değişiklikleri ezme. Kapsam gerçekten tamamlanınca yalnız bu devam otomasyonunu devre dışı bırak. Kotalar veya onay kuralları aşılmaya çalışılmaz.

## Devam edecek çalışma için başlangıç

1. AGENTS.md, README, docs/team/README.md, docs/11-visual-priorities.md, backlog/issues.json ve güncel GitHub görevleri/açık PR kayıtlarını oku. Tamamlanan işleri tekrar yapma; açık kabul ölçütlerini kontrol et.
2. Demo kaynak deposu mevcut Sites projesine bağlıdır: `appgprj_6aa638d93f3c819188b55444e79f992a`. Yeni Site oluşturma; mevcut özel erişimi koru. Ana uygulama: https://github.com/hturkmen/civilisation-atlas.
3. GitHub ana uygulaması Node sunucu girişini, demo ise statik giriş uyarlamasını kullanır. Ortak bileşen/veri değişikliklerini ikisine aktar; birinin giriş/hosting ayarını diğerine yanlışlıkla kopyalama. Büyük arşiv görselleri doğrulanan indirme betiğiyle hazırlanır.
4. Kaynaklı koleksiyon 17 siyasi yapı / 35 kayda genişletildi; dönemler arası arama tamamlandı. Bu eski başlangıç sırasını yeniden uygulama: sıradaki somut işi yukarıdaki güncel devir noktasından al. Veri çalışmasında docs/14-collection-discovery.md, docs/13-sourced-boundaries.md ve sabit kaynak kayıtlarını oku. Kayıt dönemi ile devletin yaşam süresini karıştırma; kaynak yeterli değilse uydurma.
5. Gerçek üyelik/admin öncesinde sağlayıcı, veri bölgesi ve bütçe gibi henüz kararlaştırılmamış taahhütleri somut seçeneklerle kullanıcıya getir. Sunucu yetkilendirmesini UI görünürlüğüyle ikame etme.
6. Anlamlı değişiklikleri doğrula, GitHub ve mevcut demoyu güncelle, çalışma sonunda neyin bittiğini/ne kaldığını kaydet. Başarısız yayını veya eksik işlevi tamamlandı diye yazma.

Üç yerleşim, tek tarihî harita ve 35 alan kaydı, bütün medeniyet tarihinin tamamlanması değildir. Görev kapanışı, onaylı kapsamın kabul ölçütleri karşılanınca yapılır.

## Önceki doğrulanmış yayın — 13 Eylül 2026

Kaynaklı alan sürümü GitHub’a aktarıldı: `adba71198fcd79d576af2107d38027a51deddbd1`. Mevcut özel demo sürüm 3, 19:26 UTC’de başarılı yayımlandı: https://civilisation-atlas-hturkmen.halilturkmen.chatgpt.site. Demo kaynak commit’i: `a8677916fc6c1b98126b92b0fef03560acf55d7b`. Yayın durumu Sites hizmetinden `succeeded` olarak doğrulandı; canlı adrese ek tarayıcı testi uygulanmadı.

Altı siyasi yapıdan seçilmiş 12 kaynak kaydı; tarihe göre alanlar, kaynak detayları, paylaşılan seçim ve mobil etiket düzeni tamamlandı. 19 alan/veri testi, statik demodaki 13 tarayıcı senaryosu ve ana Node girişindeki üç hedefli senaryo doğrulandı. Tek ilk açılış zaman aşımının yeniden kontrolü ve kapsam sınırları docs/13-sourced-boundaries.md içinde. Her iki üretim derlemesi başarılı.

Sonraki dilim: komşu kaynak dönemlerini ve diğer bölgeleri genişlet; koleksiyondaki boş yıllar arasında gezinmeyi iyileştir. Bütün dünya kapsamı, tarihçi incelemesi, kullanıcı/admin ve mobil uygulama tamamlanmış sayılmaz. Otomasyon üç saatlik aralıkla etkin; 14 Eylül 00:13 Türkiye başlangıcı son servis okumasıyla doğrulandı.


## 15 Eylül 2026 — tamamlanan geliştirme ve yayın hazırlığı

Koleksiyon 17 siyasi yapı / 35 seçilmiş kaynak kaydına genişletildi; MS 1500'de beş alan seçilebilir. Sabit Cliopatria arşivinin özeti yeniden doğrulandı; 35 kaynak ve sadeleştirilmiş geometri geçerli. Kaynak aralıkları korunur, eksik dönemler uydurulmaz. Modern coğrafyadaki alanlar ile arşiv eseri perspektifi ayrı kalır.

Boş yılda en yakın önceki/sonraki gerçek kaynaklı yıl önerisi, üç saniyelik koleksiyon oynatması ve veriden hesaplanan durak sayıları tamamlandı. İçe aktarma planıyla üretilmiş dosyaların uyuşması derleme öncesinde denetlenir. Ayrıntılar docs/14-collection-discovery.md içinde.

23 alan/veri testi, iki üretim derlemesi ve dört yeni Node tarayıcı senaryosu geçti. Statik demoda 17 senaryo doğrulandı: 16 toplu koşumda, ilk haritanın soğuk açılışındaki zaman aşımı için yalnız işlevsel bekleme toleransı artırılan bir kontrol hedefli tekrarda geçti. Tek temiz toplu koşum veya üretim performansı iddia edilmez. Masaüstü ve 360 px mobil ekranlar incelendi. Fiziksel cihaz, diğer tarayıcılar ve bağımsız tarihçi incelemesi bekliyor.

Kaynak aktarımı ve özel yayın tamamlandı; doğrulanmış sürüm 4 sonucu aşağıdadır. Ana Node girişi ile demo statik girişi korundu; erişim kitlesi değiştirilmedi.

Sonraki somut geliştirme: dönemler arası siyasi yapı araması ve kaynaklı kısa anlatılar. İkinci arşiv perspektifi, daha yoğun kaynak kapsamı, güvenli sunucu üyelik/admin ve mobil uygulama henüz tamamlanmadı. Sağlayıcı / veri bölgesi / ücret kararları kullanıcıya somut seçeneklerle sunulmadan bağlayıcı kurulum yapılmaz.


## Son doğrulanmış yayın — 15 Eylül 2026

Uygulama kaynak commit'i: `5ff5b3d3afe5a98bba9a493e08d2e4db11bf423f`. Ana GitHub dalından tekrar okunarak doğrulandı. Demo kaynak commit'i: `fcbe5f67a1065b996fab32440831b9411ce06396`; başarılı push sonrasında tam HEAD okundu.

Mevcut özel Site **sürüm 4**, 15 Eylül 2026 10:46:18 UTC'de hizmetten `succeeded` olarak doğrulandı: https://civilisation-atlas-hturkmen.halilturkmen.chatgpt.site. Kayıtlı sürüm: `appgprj_6aa638d93f3c819188b55444e79f992a~appgver_1d296ed4f68c8191a88726ffe5efb359`. Dağıtım: `appgdep_6aa921c475208191b2bf5f5fb65a61ac`. Build/paket başarılı; canlı adrese ek tarayıcı testi uygulanmadı. Erişim yalnız sahibinde kaldı.

## 15 Eylül — yerel ajanlarla görev devri

Kullanıcı Kiro veya Claude Code'un yerelde çalışıp GitHub'a teslim ederek devam edebilmesi için promptlar istedi. Ortak kurallar `AGENTS.md`, iş akışı ve kullanım `docs/team/README.md`, veri/arayüz/devralma promptları `docs/team/prompts/` altında. Çalışma kayıt şablonu mevcut; bu belgeler yerel araçların başlatıldığı veya görevleri yaptığı anlamına gelmez.

Hazır görev ayrımı: veri çalışanı P02-001 kaynak/kanıt sözleşmesi + beş adaylık sınırlı Gate A paketi; arayüz çalışanı mevcut kaynaklı dönemler arasında arama/geçiş. Tek araçla veri promptu kullanılabilir; iki araçla ayrı görev ve checkout/worktree. Ortak ilerleme dosyaları entegrasyonda tek yazıcıyla güncellenir. Aktif iş sahipliği açık PR ve devir kayıtlarından okunur; eski sohbet veya eski 12 kayıt sayısı esas alınmaz.

**Codex için bir sonraki somut adım:** önce açık PR'ları ve `docs/team/handoffs/` kayıtlarını kontrol et; hazır işi incele/entegre et ve gerekiyorsa mevcut özel demoya taşı. Yerel ajana ayrılmış veri sözleşmesi veya dönemler arası arama dilimini eşzamanlı yeniden uygulama. Hazır PR yoksa dosya alanı çakışmayan bağımsız işi seç; ikinci arşiv perspektifinin kaynak/lisans incelemesi adaydır. Kullanıcı araç değiştirince proje sıfırlanmaz. Yerel ajanların GitHub geliştirmesi Codex veya Sites erişimini beklemez; erişimsiz demo yayını `deployment_pending` olarak kaydedilir.

Bu devir belgeleri uygulama davranışını değiştirmez; önceki uygulama testlerini tekrar koşmak yerine belge bağlantıları, komutların repo ile uyumu ve GitHub aktarımı kontrol edilir. Tüm dünya kapsamı, bağımsız tarihçi incelemesi, kalıcı veri/inceleme sistemi, kullanıcı/admin ve mobil uygulama açık kalır. Otomatik devam görevi bu nedenle kapatılmaz.

## 15 Eylül — P02-001 kaynak/kanıt sözleşmesi ve Gate A paketi birleştirildi

Kiro veri çalışanı, `docs/team/prompts/kiro-data.md` promptundaki P02-001 görevini tamamladı. [PR #47](https://github.com/hturkmen/civilisation-atlas/pull/47), `agent/kiro/p02-001-editorial-contract-20260915` dalından `main`'e squash-merge edildi: merge commit `b5fe0940a20dc5911475feac4c6463cdb71db83b`. Koruma kuralı/zorunlu kontrol tanımlı olmadığı ve dal `origin/main` ile çakışmasız olduğu doğrulandıktan sonra protokole göre birleştirildi.

Eklenenler: `packages/domain/src/editorial.mjs` (+`.d.mts`) — kaynak kimliği/sürümü, nesne bazlı hak istisnası, lisans, checksum dayanağı, kanıt ilişkisi (`supports/contradicts/context`), kaynak ifadesi vs editör çıkarımı ayrımını doğrulayan ve hak durumu ile bağımsız inceleme durumunu **ayrı** kapı olarak kontrol eden (`evaluatePublishability`) validator; `packages/contracts/editorial/*.schema.json` yapısal belgeleri; `data/editorial/{sources,candidates}.json` içinde 5 gerçek kaynak ve 5 Gate A adayı (Mohenjo-daro, Büyük Zimbabve, Roma İmparatorluğu MS 117 — mevcut `boundary-collection.json` kaydı `cliopatria-1235`'e atıfla, yeni geometri eklenmeden —, Waldseemüller 1507, ve kaynak zinciri kurulamadığı için `status: blocked` olarak belgelenmiş bir Roma alternatif yorum denemesi); `scripts/validate-editorial.mjs`; 12 yeni test (`packages/domain/test/editorial.test.mjs`). Tüm adaylar `reviewStatus: unreviewed`; hiçbiri yayınlanabilir değil (beklenen, kasıtlı sonuç).

Doğrulama: `node scripts/validate-editorial.mjs` geçti; `npm test` 34/35 geçti (tek başarısız test `boundaries.test.mjs` geometri checksum'ı, bu PR'dan bağımsız önceden var olan bir fark olduğu `git stash` ile doğrulandı — muhtemelen Windows CRLF checkout farkı, ayrı bir işte ele alınmalı); `npm run typecheck` geçti; `npm run build` ve `npm run check:plan` bu makinede ortam engeliyle (sırasıyla TLS/self-signed sertifika ve Python eksikliği) çalışmadı, bunların da PR'dan bağımsız olduğu doğrulandı. Ayrıntılar `docs/team/handoffs/p02-001-editorial-contract-20260915.md` içinde. Bu görev mevcut web arayüzünü veya yayınlanan demoyu değiştirmedi; demo güncellemesi gerekmiyor.

Kalanlar: P02-002/P02-004 kabul ölçütlerinin tamamı kapanmadı (bu bir katkı dilimiydi); gerçek bağımsız tarihçi incelemesi hâlâ yapılmadı ve kim yapacağı kullanıcı kararı bekliyor (`docs/07-decisions-and-blockers.md`); arayüz çalışanının dönemler arası arama dilimi ayrı ve bağımsız kalır. Sıradaki somut Kiro/veri adımı: P02-002 için üç dönem/bölgeden kanıt-geometri denemesini genişletmek veya P02-004 doğrulayıcısını gerçek revizyon kimlikleriyle bütünleştirmek; ikisi de bu PR'ın sözleşmesini temel alır, yeniden yazmaz.

## 15 Eylül — P02-001 sözleşmesinin bağımsız incelemesi ve düzeltmeleri

PR #47 (`b5fe094`) ve devam kaydı `af93ee9` bağımsız olarak incelendi. Önceki rapor kanıt sayılmadı; SHA'lar, dosyalar ve doğrulama sonuçları yeniden üretildi. İnceleme dalı: `agent/claude/p02-001-contract-review-20260915`, başlangıç `af93ee9b9aa8300ec9f557747929b84153ca29bc`. Ayrıntılar `docs/team/handoffs/p02-001-contract-review-20260915.md` içinde.

Altı gerçek hata birleştirilmiş kodda yeniden üretildi ve düzeltildi; her biri için `af93ee9` üzerinde başarısız olan bir regresyon testi eklendi. En ciddi ikisi yayın kapısındaydı ve kapı **izinli tarafa** düşüyordu: (1) nesne bazlı hak kısıtı yalnız `evidence.locator` ile eşleştiği için, locator vermeyen bir kanıt `rejected` işaretli nesneyi genel `approved` durumuna düşürüp yayınlanabilir yapıyordu; (2) kanıtı hiç olmayan bir aday `publishable: true` dönüyordu, çünkü hak döngüsü sıfır kez çalışıyordu. Kapı artık kapalı tarafa düşüyor. Ayrıca aynı `objectLocator` için ikinci istisna artık reddediliyor; kaynak kimliği ile **kaynak revizyonu** ayrıldı (`revision` / `revisionNote`, kanıtta `sourceRevision` sabitleme — P02-001 ve P02-004 kabul ölçütleri bunu istiyordu ama hiçbir katmanda alan yoktu); `entityRef` artık mevcut koleksiyonlara karşı gerçekten çözümleniyor; JSON Schema ile çalışan validator arasındaki üç çelişki giderildi; bozuk girdi ham `TypeError` yerine adlandırılmış doğrulama hatası veriyor.

CRLF/checksum farkının kök nedeni teşhis olarak kabul edilmeyip kanıtlandı: git blob ve LF checkout 317.270 bayt, kullanıcının Windows checkout'u 317.271 bayt ve tek bir CR; CR çıkarıldığında dosya commit'lenmiş baytlarla birebir aynı. İçerik bozuk değil, fark yalnız `core.autocrlf=true` checkout dönüşümü ve depoda `.gitattributes` yoktu. Çözüm tek kural: `apps/web/public/data/*.geojson -text`. Beklenen checksum, üretilmiş GeoJSON, metadata ve test değiştirilmedi; hash öncesi normalizasyon eklenmedi; depo yeniden normalize edilmedi. Ek olarak `scripts/import-boundaries.py` çıktılarını platform varsayılan newline/encoding ile yazıyordu, yani Windows'ta üretilen dosya betiğin az önce kaydettiği hash ile hiç uyuşmazdı; artık `encoding='utf-8', newline='\n'` açık.

Doğrulama: `npm test` **43/43 geçti** (35 → +8 regresyon), `node scripts/validate-editorial.mjs` geçti, `node scripts/validate-boundaries.mjs` geçti, `npm run typecheck` geçti, `npm run check:plan` **geçti** (`result: passed`; önceki raporda "Python yok" diye engelli yazılmıştı, bu ortamda betik gerçekten çalıştı). CRLF benzetiminde kural öncesi 1 test başarısız, kural sonrası 6/6 geçti. `npm run build` **hâlâ engelli** ve geçti sayılmıyor: `prepare-archive-assets.mjs` Wikimedia görselini indiremiyor; bu ortamda neden TLS değil, proxy'nin `CONNECT` isteğine dönen **403 egress reddi**. Önceki raporun `SELF_SIGNED_CERT_IN_CHAIN` bildirimi kendi kurum ağına ait olabilir; bu oturumda ne doğrulandı ne yalanlandı. Playwright çalıştırılmadı: bu dilim arayüzü ve çalışma zamanında tüketilen veriyi değiştirmiyor (`data/editorial/` hiçbir bileşen tarafından okunmuyor, kontrol edildi).

**GitHub teslimi engellendi.** Bu oturumun git proxy'si `hturkmen/civilisation-atlas` için kimlik bilgisi enjekte etmiyor (`403: not in this session's authorized repository set`) ve oturumda depoyu yetkilendirecek bir araç yok. Dal ve commit'ler yerel; push, PR ve merge **yapılmadı** ve yapılmış gibi kaydedilmiyor. Eksik koşul: deponun oturumun kaynak listesine push erişimiyle eklenmesi.

Windows checkout'u için tek seferlik adım: `.gitattributes` geldikten sonra CRLF dosya kendiliğinden düzelmez ve `git status` temiz görünür; `rm apps/web/public/data/polity-boundaries.geojson` ardından `git checkout -- <aynı dosya>`. `git add --renormalize` bu dosyada kullanılmamalı.

Bu inceleme P02-001'in **teknik** sözleşmesini kapatır; P02'nin tamamı, P02-002/P02-004 kabul ölçütleri ve bağımsız tarihçi onayı açık kalır. Beş adayın tamamı hâlâ `unreviewed` ve hiçbiri yayınlanabilir değil. Arayüz çalışanının dönemler arası arama dilimi ayrı ve bağımsızdır; bu dilim doğrulanana kadar yeni arayüz özelliğine veya veri genişletmesine geçilmedi.


## Codex doğrulaması — 2026-09-15T16:34:07+00:00

PR #48'in `42b3a7ab4959e3a713ae1d60349883cfbd5d3709` kaynak durumu GitHub'dan okunup ayrı çalışma alanına blob hash'leri doğrulanarak alındı. Kod zaten GitHub'daydı; aşağıdaki eski push/PR engeli notları Claude oturumunun geçmiş durumudur. Kullanıcının stash/bundle dosyalarına ihtiyaç duyulmadı.

Build engeli bu ortamda çözüldü: önceki başarılı özel demo yayınından kalan `waldseemuller-1507.jpg` dosyası kullanıldı. Mevcut `prepare-archive-assets.mjs`, dosyayı katalogdaki tam SHA-256 ile doğruladı. Betik, kaynak, beklenen hash veya TLS ayarı değiştirilmedi. Bu sonuç Wikimedia'ya yeni ağ erişiminin ya da kullanıcının Windows sertifika ortamının düzeldiği anlamına gelmez. Aynı lockfile'a ait mevcut bağımlılıklar kullanıldı; yeni temiz npm ci koşumu iddia edilmez.

Ek kod incelemesinde `evaluatePublishability` doğrudan çağrıldığında, `claimStatement` olmayan sentetik bir adayın eşleşen inceleme hash'iyle `publishable=true` döndüğü yeniden üretildi. Kapı artık mevcut kaynak/aday doğrulayıcısını kendisi çağırıp hatalı girdiyi gerekçeli biçimde reddediyor. Eksik iddia, reviewer veya extent ve hatalı evidence/istisna konteynerleri için iki regresyon testi eklendi. Dört eski test kaynağı, zaten sözleşmede zorunlu olan revisionNote/publishedOnNote alanlarıyla tamamlandı; gerçek adayların inceleme durumu değiştirilmedi.

Son değişikliklerle `npm test` 45/45, editoryal validator, sınır validator, `npm run build`, `npm run typecheck` ve `npm run check:plan` geçti. Beş gerçek aday yapısal olarak geçerli, sıfırı yayınlanabilir. Arayüz/çalışma zamanı koleksiyonu değişmediği için Playwright yeniden çalıştırılmadı ve yeni demo yayını gerekmiyor. Gerçek Windows, canlı auth/admin veya tarihçi incelemesi yapılmadı.

Kod ve kayıtlar aynı PR #48'e aktarılacak; birleştirme sonucu GitHub PR kaydından doğrulanmalı. P02-004 canlı revizyon/kanıt entegrasyonu, bağımsız inceleme ve üretim yetkilendirmesi açık kalır. Sonraki somut iş: PR #48 birleştirildikten sonra güncel main'den dönemler arası arama görevini devral; açık başka bir arayüz PR'ı varsa aynı işi yeniden yazma.


## 16 Eylül — dönemler arası arama

PR #48 artık birleşti; doğrulanmış main merge SHA: `63305adc047ff466b5093b6d9fc57ddca7ae6502`. Yukarıdaki eski push/build/merge bekleme notları bu doğrulamayla tarihsel kayıttır.

PR #49 mevcut koleksiyon üzerinde dönemler arası aramayı uygular. 1700'de Mali veya Roma aranabilir; ayrı kaynak dönemleri ve örnek tarihleri listelenir, seçim yılı ve detayı birlikte açar. Yerleşim alias'ları, Türkçe arama, Escape/odak, URL/reload ve mobil geçiş kapsandı. Veri/lisans/inceleme durumu değişmedi.

47/47 birim/veri testi, plan/sınır/editoryal kontrolü, ana ve statik üretim derlemeleri, ana TypeScript kontrolü ve iki yeni Node tarayıcı senaryosu geçti. Masaüstü/360px görüntüleri incelendi. Statik regresyon ve yayın terminal sonucu henüz kaydedilmeli; GitHub kaydı demo yayını sayılmaz. Ayrıntılı devir: `docs/team/handoffs/cross-period-search-20260915.md`.

Sonraki iş: revizyon/kanıt entegrasyonu P02-004/P03; kaynak genişletme, bağımsız tarihçi incelemesi, gerçek kullanıcı/admin, üretim altyapısı ve mobil ürün açık kalır. #20/#21 yalnız bu dilimle kapanmaz.

Statik demo regresyonu: 4/4 geçti (iki yeni arama senaryosu, mevcut MS 1500 araması ve Bilinen dünya/ESC). Tam 19 senaryonun temiz toplu koşumu iddia edilmez.


## Doğrulanmış entegrasyon ve yayın — 16 Eylül 2026

PR #49 birleşti: `ab0b48b0009d54d77f6baec82c800131c692e29a`. Test edilen uygulama commit'i: `4c3972b2cea39ce5affc96db0b2b45919bed8ffb`; merge kaynak ağacı aynı. Ana dal GitHub'dan doğrulandı.

Mevcut özel demo sürüm 5 yayımlandı. Site kaynak SHA: `35aa8ab3e5c18acfcd1c02600a6d1bfa60a7f37f`. Kaynak push sonrası tam HEAD okundu; doğrulanmış statik build paketlendi. Sürüm: `appgprj_6aa638d93f3c819188b55444e79f992a~appgver_a3c814ad2ce08191bb66368595c88c88`; dağıtım: `appgdep_6aaa48422df48191a3979d9d2da6765f`. Yayın hizmeti 2026-09-16T07:42:06.009698+00:00 tarihinde `succeeded` döndürdü. URL: https://civilisation-atlas-hturkmen.halilturkmen.chatgpt.site . Erişim genişletilmedi, yeni Site oluşturulmadı. Canlı URL üzerinde ek bulut tarayıcı testi yapılmadı; statik paket yerelde doğrulandı.

Sonuç: bu arama dilimi tamamlandı; önceki deployment_pending notu kapandı. Projenin tüm kapsamı tamamlanmadı. Sonraki ajan dönemler arası aramayı yeniden uygulamamalı; P02-004/P03 revizyon/kanıt entegrasyonu veya ikinci kaynaklı arşiv perspektifi ile devam etmeli. Kullanıcı/admin, tam veri kapsamı ve bağımsız inceleme hâlâ açık.


## 16 Eylül — P02-004 revizyon bağlantısı

Kullanıcı artık PR açılmasını istemiyor; kısa kapsam özeti ardından test edilmiş dilimler doğrudan main'e normal ileri güncelleme ile teslim edilir. Ortak ajan belgeleri güncellendi.

İddia + çözülmüş varlık/geometri/perspektif + kullanılan kaynak içerikleri aynı revizyon pinine bağlandı. Eski revizyon incelemesi değişmiş içeriğe taşınamaz; sırf genel kaynakça veya locator'sız kanıt yayın için yeterli değildir. Mevcut beş aday için pin manifesti üretildi, hiçbir onay durumu değiştirilmedi. CLI yetkili inceleme kaydı uydurmadığından sıfır aday yayınlanabilir.

53 test ve kaynak/sınır/revizyon doğrulaması geçti. Son build/typecheck/plan ve main teslim sonucu aşağıya kaydedilecek. Yeni görünür UI veya çalışma zamanı verisi olmadığından özel demo sürüm 5 yeniden yayımlanmadı. Devir: `docs/team/handoffs/p02-004-revision-pins-20260916.md`.

Kalan: P03-002 yerel DB migration ve revizyon FK/immutable yayın negatif testleri, ardından yetkili inceleme servisi/transaction entegrasyonu. P02-004 tümüyle kapalı değildir; kullanıcı/admin, bağımsız tarihçi incelemesi ve kapsam genişletmesi açık.

Son doğrulama: üretim build, TypeScript ve plan kontrolü geçti. Hazırlama betiği ikinci `--write` çalışmasında 0 pin ekledi (idempotent). Kod/girdiler test sonrası değişmedi; yalnız açıklama/kayıtlar tamamlandı.

Teslim doğrulandı: `94f9c67ddfec0b6625174466978c6f0d39c9dbed` doğrudan main’e normal ileri güncelleme ile kaydedildi ve uzak HEAD okunarak doğrulandı. PR oluşturulmadı. Bu geliştirme dilimi tamamlandı; P02-004/P03-002 ve genel ürün kapsamı açık. Bu son kayıt yalnız belgedir, uygulama/test girdilerini değiştirmez.


## 16 Eylül — P03-002 ilişkisel migration

İlk SQL migration ve 12 yerel SQL senaryosu tamamlandı. Kaynak/iddia/geometri/perspektif ilişkileri FK'lerle bağlı; revizyonlar append-only; doğrulanmış yayın üyeliği kilitli. PUBLIC şema erişimi yok ve public `active` yayına geçiş henüz desteklenmiyor. PGlite testi gerçek staging/PostGIS/eşzamanlılık testi olarak sayılmadı. Ayrıntı: `database/README.md`, `docs/team/handoffs/p03-002-relational-core-20260916.md`.

Web ekranları ve runtime koleksiyonu değişmedi; yeni demo yayını yok. Sıradaki somut iş: PostGIS kolonları ve domain pinlerini DB'ye bağlayan import adaptörü; ardından native staging/yetkili inceleme/publicasyon. P03-002 partial, genel ürün kapsamı açık.

Son doğrulama: 12/12 SQL senaryosu, 53/53 domain/veri testi, plan kontrolü, revizyon pinleri, editoryal kapı (0 publishable) ve sınır validator geçti. Root/web bağımlılıkları, runtime kodu ve veriler değişmediğinden build/Playwright tekrarlanmadı. Yeni veri tabanı yalnız bellek içi test ortamındadır.

GitHub teslimi: `d8f1876ba3eb7b976a1e322047d8a9088bb9e142` doğrudan main’e kaydedildi; PR açılmadı. #13 ilerleme notu güncellendi, eksik kabul ölçütleri nedeniyle açık bırakıldı. Sonraki iş yukarıdaki PostGIS/import dilimidir.

## 16 Eylül — PostGIS ve idempotent yerel aktarım

0002 migration ve revizyon pinli import adaptörü tamamlandı. Özgün geometri PostGIS MultiPolygon/4326 ve GiST ile saklanır; bozuk geometri transaction'ı geri alır. Dört Gate A adayı ile gerekçeli bir blocked kayıt içe aktarılır; hepsi unreviewed, yayın sayısı sıfır. Waldseemüller için bilinmeyen bilgi tarihi eser yılından türetilmez. Detay: `database/README.md`, `docs/team/handoffs/p02-003-spatial-import-20260916.md`.

19/19 SQL/import ve 53/53 domain testi geçti; plan, sınır, editoryal kapı ve beş revizyon pini doğrulandı. Aynı yerel DB iki ayrı süreçte açıldı: ikinci import 0 yeni / 5 unchanged döndürdü. Web/runtime değişmediği için build/typecheck/tarayıcı testleri tekrarlanmadı ve demo sürüm 5 yeniden yayımlanmadı. Uzak teslim doğrulandı: `02f0adc9de931793e9bd0e62c094efd6dd625e18` doğrudan main'e normal ileri güncelleme ile kaydedildi. PR oluşturulmadı. #8/#13 ilerleme notları güncellendi ve görevler açık bırakıldı. Bu son kayıt yalnız belgedir; test edilen kod değişmedi.

P02-003/P03-002 partial. Sonraki somut iş: dosya boyutu/vertex sınırları ve karantina sonucu taşıyan yerel import iş kaydı. Native staging, çok bağlantılı yarış testleri, sunucu rol/RLS, yetkili inceleme/public aktivasyon ve bağımsız tarihçi onayı açık. Sağlayıcı veya veri bölgesi seçilmedi. Genel ürün tamamlanmadı; devam görevi açık kalır.

## 16 Eylül — sınırlı paket karantinası

P02-003 için yerel `.json` paket sınırları ve immutable `local_import_job` karantina kaydı eklendi. 8 MiB byte, derinlik, JSON düğümü, kayıt ve vertex bütçeleri uygulanır; URL/redirect/arşiv ve son dosya symlink'i okunmaz. Üst dizinler yerel operatörün güven sınırındadır. Bozuk JSON ve boyut aşımı atlas revision tablolarına yazılmadan kodlanmış gerekçeyle karantinaya alınır. Başarılı paket checksum + adaptör/politika sürümüyle tekrarlanırsa önceki iş kaydı yeniden kullanılır.

28/28 veritabanı testi geçti; gerçek Gate A paketinden CLI ilk çalışmada 4 imported + 1 blocked, ikinci çalışmada aynı job `reused: true` döndürdü. Teslim öncesi son incelemede arşiv tarih eşleştirmesi hatalarının karantinaya yönlendirilmesi tamamlandı; maliyet limitleri, DB rollback sonrası karantina ve altyapı hatalarının ayrı kalması test edildi. Önceki 53 domain testi, plan/veri/pin kontrolleri ve typecheck geçti; değişmeyen web/runtime için build/tarayıcı/demo tekrarı yok. P02-003/P03-002 hâlâ partial: production upload/malware taraması, worker queue ve süre kotası, native staging/çok bağlantılı yarışlar, RLS, yetkili inceleme ve public aktivasyon açık. Sonraki somut iş, bu yerel policy sonucunu güvenli worker job sözleşmesine bağlamak; HTTP/ağ indirmesi eklememek.

Teslim tamamlandı: `77b7dfee42cd617d5dfe4c18c04fbefcc7a16a58` doğrudan main'e kaydedildi, uzak HEAD yeniden okunarak doğrulandı. Önceki kullanım limiti kaynaklı GitHub yazma engeli bu denemede yaşanmadı. PR oluşturulmadı; mevcut özel demo sürüm 5 korunur. Devir: `docs/team/handoffs/p02-003-quarantine-20260916.md`. Sonraki ajan bu hazır dilimi yeniden uygulamamalı; worker lease/heartbeat, bounded retry ve süre bütçesiyle devam etmeli. Genel ürün ve bağımsız inceleme hâlâ açık.

## 17 Eylül — yerel worker, lease ve yeniden deneme

0004 migration ve `apps/worker/import-tasks.mjs` uygulandı. Kalıcı iş kimliği checksum/adaptör/politikaya bağlı; claim her denemede değişir. 30 saniye lease ve 120 saniye mutlak bitiş; geçici hatalarda ilk/ikinci deneme sonrası 5/10 saniye bekleme, toplam en fazla üç deneme. Süresi dolan eski worker yenisinin sonucunu değiştiremez. Atlas yazıları, receipt ve görev tamamlanması tek transaction'da; son kontrolde süre dolmuşsa tamamı geri alınır. Dosya değişmesi reddedilir; veri hataları terminal quarantine olur. Yerel komut her çağrıda tek göreve bakar, kendini zamanlamaz.

38/38 DB/import (10 yeni worker testi), 53/53 domain testi, plan/editoryal/sınır/pin kontrolleri geçti. Kalıcı DB iki ayrı worker sürecinde açıldı: ilkinde imported/attempt 1, ikincide aynı görev imported/attempt 1/worked false. Beş aday unreviewed, public yayın sıfır. Web/runtime değişmediği için build/typecheck/tarayıcı ve demo yayını tekrarlanmadı. Devir: `docs/team/handoffs/p02-003-worker-20260917.md`; komutlar: `apps/worker/README.md`.

P02-003/P03-002 ve genel ürün partial. Süre kontrolü commit'i korur; senkron JS parse'ı/CPU'yu çalışırken zorla kesmez. Native PostgreSQL statement_timeout ve iki bağlantılı lease/kilit yarışları bu PGlite ortamında doğrulanmadı. Sonraki somut iş: parser için ayrı süreçte gerçek süre aşımı ve native DB yarış test paketi. Runtime rol/RLS, auth/admin, bağımsız tarihçi incelemesi, üretim scheduler/provider ve public aktivasyon bekliyor. Bu dilimde yeni hizmet veya veri bölgesi seçilmedi.

GitHub teslimi doğrulandı: `8551206ea81b5a39c9fa173b31527e600bb3d6c2` doğrudan main'e kaydedildi; PR yok. Kaynak kod GitHub'dan devralınabilir. Bu son kayıt yalnız belge değişikliğidir. Demo sürüm 5 aynı; backend'i üretime bağlama veya yeni yayın yapılmadı. Genel iş tamamlanmadığı için devam görevi kapatılmaz.

## 17 Eylül — ön doğrulamayı ayrı süreçte sonlandırma

Yerel paket read/hash/JSON parse/ön doğrulaması DB erişimi olmayan sabit çocuk sürece taşındı. 20 saniye sonunda SIGKILL uygulanır; süreç kapanışı beklenir. Parent environment/secrets/Node injection flag'leri devralınmaz; shell yoktur. Eski byte/depth/node/record/vertex ve karantina kuralları aynen korunur. Timeout, veri hatası diye karantinaya yazılmaz; mevcut sınırlı tekrar mekanizmasına TIME_BUDGET olarak girer. Beş supervisor regresyon testi eklendi.

Sınır: bu bütün import işi için hard timeout değildir. Enqueue okuması, parent pin doğrulaması ve DB/PostGIS aşaması ayrı kalır; lease/atomik son commit koruması sürer. OS sandbox, native PostgreSQL statement timeout/çok bağlantılı yarışlar ve Windows/macOS doğrulaması yapılmadı. Native PostgreSQL/Docker mevcut ortamda bulunmadı. Sonraki somut iş native iki bağlantılı yarış test paketi ve gerçek PostgreSQL doğrulaması; P02-003/P03-002 ve genel ürün partial.

UI/veri koleksiyonu/hosting değişmedi, özel demo V5 yeniden yayımlanmadı. Beş aday unreviewed; public onay verilmedi. Test ve teslim sonucu: `docs/team/handoffs/p02-003-preflight-20260917.md`.

Teslim doğrulandı: `1d1d03f0bd7776d5c97b9d4bc1c5da21bfd678d0` doğrudan main. Son temiz koşum 43/43 DB/import/süreç ve 53/53 domain testi; plan, editoryal, sınır ve revizyon pin kontrolleri geçti. Yeni demo dağıtımı yok; genel proje tamamlanmadı.

## 17 Eylül — mobil panel teslim/yayın teyidi

Main kod: 36ea56332d76cf2d2236fbf99c79052e40658a69; demo source: 67585e0d65a11b1933c7cda1ee50e4c5f09ed4c8. Mevcut özel Site V6 sürümü yayımlandı: appgdep_6aac4b08fe548191836690216e350807, succeeded 2026-09-17T20:18:28.852623+00:00. URL: https://civilisation-atlas-hturkmen.halilturkmen.chatgpt.site. İlk geçici 503 sonrası aynı kaynak normal push ile gönderildi; yeni Site/audience değişimi yok. Statik build/TypeScript ve 22 Chromium testi geçti. Bu son teslimde Node sunucu build yeniden çalıştırılmadı; giriş/hosting ayarları korunur. P04-005 partial, genel ürün tamamlanmadı. Devir: docs/team/handoffs/p04-005-mobile-detail-20260917.md.
