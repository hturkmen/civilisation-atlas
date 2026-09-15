# Devam kaydı

## Kullanıcı yönlendirmesi

Görsel öncelikle geliştir; tüm hedef tamamlanana kadar ilerle. Süre veya token nedeniyle iş kesilirse üç saatte bir devamı tetikleyecek otomasyon istendi.

## Otomasyon durumu

Kuruldu ve etkin. Önceki 5 aktif görev sınırı, kullanıcının seçtiği görevlerin devre dışı bırakılmasıyla çözüldü. Kişisel görevlerin adları/kimlikleri bu açık depoda tutulmaz.

Kullanıcının istediği sıklık üç saatti. Sonraki servis okumasında dört saatlik aralık görüldü; fark kullanıcıya bildirildi. 13 Eylül son kontrolünde kullanıcının ilk talebine uygun üç saatlik aralık geri yüklendi ve servis güncellemeyi doğruladı. Yeni plan başlangıcı 14 Eylül 2026 00:13 Türkiye saati. Önceki değişimin sebebi doğrulanmadığı için uydurulmaz. Güncel tetikleme zamanı ve sıklığı bu metinden hesaplanmamalı, zamanlama servisinden kontrol edilmeli. Amaç hatırlatma göndermek değil, işi kaldığı yerden yürütmek. Aktif çalışmayla çakışma; mevcut değişiklikleri ezme. Kapsam gerçekten tamamlanınca yalnız bu devam otomasyonunu devre dışı bırak. Kotalar veya onay kuralları aşılmaya çalışılmaz.

## Devam edecek çalışma için başlangıç

1. AGENTS.md, README, docs/team/README.md, docs/11-visual-priorities.md, backlog/issues.json ve güncel GitHub görevleri/açık PR kayıtlarını oku. Tamamlanan işleri tekrar yapma; açık kabul ölçütlerini kontrol et.
2. Demo kaynak deposu mevcut Sites projesine bağlıdır: `appgprj_6aa638d93f3c819188b55444e79f992a`. Yeni Site oluşturma; mevcut özel erişimi koru. Ana uygulama: https://github.com/hturkmen/civilisation-atlas.
3. GitHub ana uygulaması Node sunucu girişini, demo ise statik giriş uyarlamasını kullanır. Ortak bileşen/veri değişikliklerini ikisine aktar; birinin giriş/hosting ayarını diğerine yanlışlıkla kopyalama. Büyük arşiv görselleri doğrulanan indirme betiğiyle hazırlanır.
4. Kaynaklı koleksiyon 17 siyasi yapı / 35 kayda genişletildi. Önce docs/14-collection-discovery.md, docs/13-sourced-boundaries.md ve sabit kaynak kayıtlarını oku. Sonraki somut iş, genel aramada siyasi yapıların diğer kaynaklı dönemlerini bulup o yıla geçişi sağlamak ve seçili alan detayına kaynaklı kısa anlatılar eklemek. Kayıt dönemi ile devletin yaşam süresini karıştırma. Kaynak yeterli değilse uydurma; ikinci arşiv perspektifi ve lisanslı görseller gibi bağımsız işleri ilerlet.
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
