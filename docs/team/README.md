# Yerel araçlarla birlikte geliştirme

15 Eylül 2026. Bu dosya kullanıcı isteğiyle Kiro, Claude Code ve Codex arasında iş devri için hazırlandı. Yeni mimari veya ayrı proje oluşturmaz. Araçlar birbirlerinin sohbetini, yerel dosyalarını veya kota durumunu kendiliğinden göremez; ortak durum GitHub'daki dal, PR ve devir kayıtlarıdır. Bu belgelerin varlığı bir yerel ajanı başlatmaz.

## Kullanım

- Tek araç kullanacaksan [veri görevi promptunu](prompts/kiro-data.md) Kiro'ya **veya** Claude Code'a ver. Aynı veri görevini ikisinde eşzamanlı başlatma.
- İkisini birlikte çalıştıracaksan veri promptunu Kiro'ya, [arayüz promptunu](prompts/claude-code-ux.md) Claude Code'a ver; ayrı checkout/worktree kullan.
- Bir araç durunca diğerine [devralma ve entegrasyon promptunu](prompts/continue-and-integrate.md), mevcut dal/PR bilgisiyle ver. İşi yeniden başlatmasın.
- Yerel aracın repo dosyalarını değiştirme, komut çalıştırma ve GitHub'a yazma erişimini kendi oturumunda sağla. Kimlik doğrulamayı aracın normal güvenli akışıyla yap; anahtar veya token'ı prompta ekleme. Git erişimi olmadan push/PR tamamlandı denemez.

## Devralınan doğrulanmış durum

| Alan | 15 Eylül başlangıç kaydı |
|---|---|
| Ana kaynak | `https://github.com/hturkmen/civilisation-atlas.git`, `main` |
| Son uygulama commit'i | `5ff5b3d3afe5a98bba9a493e08d2e4db11bf423f` |
| Koleksiyon | 3 kaynaklı yerleşim, 1 arşiv eseri, 17 siyasi yapı / 35 seçilmiş alan kaydı |
| Görünür son dilim | MS 1500'de beş alan; boş yıldan yakın kaynaklı yıla geçiş; üç saniyelik koleksiyon turu |
| Demo | Mevcut özel Site sürüm 4; yayın hizmeti 15 Eylül 2026 10:46:18 UTC'de `succeeded` doğruladı |
| Kalıcı altyapı | Revizyonlu DB, genel import/inceleme/yayın sistemi ve gerçek auth/admin henüz uygulanmış değil |

Eski Kiro incelemesindeki **12 sınır kaydı** önceki sürüme aittir. Önce güncel uzak dalı ve veriyi oku. `docs/projects/` ve bazı issue gövdeleri daha eski ilerleme notları içerebilir; kabul ölçütlerini koru, güncel implementasyon/PR/validasyonla durumlarını uzlaştır. Sırf eski bir belgede `todo` yazıyor diye çalışan özelliği yeniden yazma.

Kaynaklı sınır seçiminin girdisi `data/boundary-import.json`; sabit Cliopatria sürümü, arşiv hash'i ve lisans oradadır. `data/boundary-collection.json` ve `apps/web/public/data/polity-boundaries.geojson` importer çıktılarıdır. `docs/13-sourced-boundaries.md` ile `docs/14-collection-discovery.md` mevcut yöntemi ve sınırlarını açıklar.

Son doğrulama: 23 alan/veri testi, her iki üretim derlemesi, statik demoda 17 senaryo ve ana Node girişinde dört hedefli senaryo. Statik toplu çalışmada 16 senaryo geçti; ilk soğuk harita açılışının işlevsel bekleme toleransı artırıldıktan sonra bir senaryo hedefli tekrarda geçti. Tek temiz toplu koşum, üretim performansı veya bağımsız tarihçi onayı iddiası yoktur. Bu sonuçlar gelecekteki commit'lerin test sonucu değildir.

## Görev ve dosya sınırları

| Çalışma | İlk kapsam | Tercih edilen değişiklik alanı | Diğer işin sınırı |
|---|---|---|---|
| Veri çalışanı, varsayılan Kiro | P02-001; P02-002/P02-004 için sınırlı Gate A sözleşme ve aday paketi | `packages/contracts/editorial/`, `data/editorial/`, `scripts/validate-editorial.mjs`, `packages/domain/test/editorial.test.mjs`, kendi devir kaydı | Arayüzü, mevcut yayın verisini ve hosting'i değiştirmez |
| Arayüz çalışanı, varsayılan Claude Code | P04-003/P04-004'e katkı: dönemler arası koleksiyon araması | `apps/web/src/components/`, `apps/web/src/app/globals.css`, gerekirse domain arama yardımcıları ve ilgili testleri, kendi devir kaydı | Editoryal sözleşmeyi, kaynak haklarını ve sınır import planını değiştirmez |
| Entegrasyon çalışanı | Tamamlanan PR'ları sırayla inceleme/birleştirme; ortak kayıtlar | README, backlog, devam kaydı, gerektiğinde ortak paket dosyaları | Aynı anda bir entegratör; kaynak veya UI işini tekrar uygulamaz |
| Sites yayınına erişebilen çalışan, varsayılan Codex | Birleşmiş ortak değişiklikleri mevcut özel demoya taşıma | Mevcut Site kaynak checkout'u ve yayın kaydı | Ana Node girişi korunur; Site/audience değişmez |

Bunlar **hazır görevlerdir**, başlatılmış veya bitmiş işler değildir. Çalışan araç, görevini açık PR ve devir kaydıyla sahiplenir. Kullanıcı bu rolleri araçlar arasında değiştirebilir. Codex kendi sonraki devamında aktif veri/arayüz görevini almaz; hazır PR'ları ve bağımsız işleri kontrol eder.

`package.json`, lockfile, `packages/domain/package.json`, genel katalog tipleri ve ortak plan belgeleri çakışmaya açıktır. İlk kapsamı bunları değiştirmeden tamamlamak mümkünse öyle yap. Zorunlu ortak değişikliği PR'da açıkça bildir, diğer aktif PR'ın aynı değişikliği yapıp yapmadığını kontrol et; iki PR'ı sırayla birleştir. Yeni bağımlılığı gerçekten gerekli değilse ekleme. Aynı dosyaya dokunmak gerektiğinde başka bir dalın kodunu sessizce ezme.

## Başlama ve GitHub'a teslim

1. Repo yolunu ve `origin` sahibini doğrula. `git status --short`, mevcut dal ve son commit'leri incele. Temiz yerel `main` için `git pull --ff-only`; farklı veya kirli çalışma varsa `git fetch origin` sonrasında yeni bir checkout/worktree'yi `origin/main` üzerinden aç. Mevcut dosyaları otomatik temizleme veya stash etme.
2. Açık PR'ları, ilgili issue'ları ve `docs/team/handoffs/` kayıtlarını oku. Veri görevi [#6](https://github.com/hturkmen/civilisation-atlas/issues/6), kaynak denemesi [#7](https://github.com/hturkmen/civilisation-atlas/issues/7), kanıt bağlantıları [#9](https://github.com/hturkmen/civilisation-atlas/issues/9); arayüz dilimi [#20](https://github.com/hturkmen/civilisation-atlas/issues/20) ve [#21](https://github.com/hturkmen/civilisation-atlas/issues/21) ile ilişkilidir. Bu dilimler tüm issue kabul ölçütlerini kapatmaz.
3. Tek görevlik dal aç: örneğin `agent/kiro/p02-001-<benzersiz-ek>` veya `agent/claude/cross-period-search-<benzersiz-ek>`. Eki gerçek çalışma zamanı/kısa kimlikten üret. Aynı dizinde iki ajan çalıştırma; ayrı worktree olsa bile sabit test portunu aynı anda kullanma.
4. Kendi devir dosyanı [şablonla](handoff-template.md) oluştur; başlangıç SHA, kapsam, dosya alanı ve `in_progress` durumunu yaz. Bu ilk küçük commit'i push edip **taslak PR** aç. PR işi devralan/inceleyen araçların görebileceği kayıttır; ayrı kilit servisi kurma. Aynı görev için mevcut PR varsa yenisini üretme. Aynı kapsam için iki PR açılmışsa ikinci çalışan uygulamaya geçmeden işi uzlaştırır.
5. Uygula, görevdeki kabul davranışlarını test et, kendi diff'ini ve devir kaydını gözden geçir. Yalnız ilgili dosyaları stage et; commit ve normal push yap. Ortak dalda history rewrite/force push yapma.
6. Kesintide bile güvenle kaydedilebilen WIP'i aynı dala push et; PR taslak kalsın. Son geçen test ile son commit farklıysa belirt. `ready_for_review` yalnız gerçekten doğrulanan dilim için kullanılır. Hazır PR açıklamasına değişiklik, test, risk, kalan kabul ölçütleri ve devir dosyasını yaz. Başarılı push'u uzak dalın tam SHA'sıyla doğrula.
7. Entegratör açık PR'ları sırayla değerlendirir. Diğer araç müsaitse somut diff/test incelemesini ona ver; müsait değilse aynı araç ayrı bir inceleme geçişi yapabilir, bunu bağımsız inceleme diye sunmaz. GitHub'ın zorunlu insan onayı/CI/koruma şartları aynen uygulanır; atlanmaz. Yetki ve zorunlu kontroller uygunsa PR'ı birleştir; yeni bir sohbet onayı veya Codex erişimi beklemek gerekmez. Şartlar sağlanmıyorsa PR GitHub'da hazır kalır ve eksik şart açıkça raporlanır.
8. Birleştirmeden önce güncel `origin/main` ve diğer PR değişiklikleriyle çakışmayı kontrol et. Ortak dalı yeniden yazmak yerine gerekli upstream değişikliği merge ederek al; değiştirdiğin davranışı yeniden doğrula. İncelenen/test edilen PR HEAD ilerlediyse eski incelemeyle birleştirme.
9. Entegrasyonda `docs/12-continuation.md`, ilgili backlog/alt proje ilerlemesi ve README'yi tek yazıcıyla güncelle. Kapsamı eksik issue'ları kapatma. Tam birleştirme SHA'sını doğrula. Sadece belge olan bu son kayıt değişikliği için tüm uygulama testlerini tekrar çalıştırma.

GitHub kimliği/erişimi yoksa yerel iş ve devir dosyasını tamamla, eksik erişimi somut bildir. Push/PR/merge'i olmuş gibi yazma. Diğer ajanın devam eden işini yalnız zaman geçti diye sahipsiz sayma; devralma için kullanıcının önceki çalışmayı durdurmuş olması veya açık `paused`/devir kaydı gerekir. Bu süreç GitHub'ı koordinasyon noktası yapar; atomik bir dağıtık kilit sistemi değildir.

## Yerel doğrulama ve demo

Node 22+ ve npm kullan; projedeki lockfile'ı koru. Normal kaynak kurulumu `npm ci`. `npm test`, `npm run check:plan`, `node scripts/validate-boundaries.mjs`, `npm run build`, ardından `npm run typecheck` mevcut kontrollerdir. Python 3 plan kontrolü için gerekir. Geometri üretimi bu görevlerde değişmiyorsa Python/Shapely import ortamını yeniden kurma.

Davranış değişince ilgili Playwright senaryolarını çalıştır. Chromium yoksa proje yönergesine uygun olarak kur; test ortamı sorununu ürün başarısızlığından ayır. `apps/web/playwright.config.ts` üretim sunucusunu 3100 portunda açar. Başka worktree'nin sunucusunu yanlışlıkla kullanma; testte `CI=true` mevcut sunucunun sessizce yeniden kullanılmasını engeller. Dolu portta başka işi öldürme; çakışan testi sıraya al. Ekran/klavye/mobil değişikliği için gerçek görünümü incele. Yalnız belge değişiklikleri için bağlantı/tutarlılık kontrolü yeterlidir.

GitHub ana uygulaması Node sunucusudur ve yerelde `npm run dev` ile çalışabilir. Özel demo ayrı kaynak deposunda statik uyarlamadır. Yerel geliştirme ve GitHub teslimi Sites hesabı gerektirmez. Demo güncellemesi Sites becerisi/erişimi olan ajan tarafından yapılır; erişim yoksa `deployment_pending` yazılır, GitHub geliştirmesi devam eder.

Mevcut Site: `appgprj_6aa638d93f3c819188b55444e79f992a`. Yeni Site oluşturma, özel erişimi genişletme, Node ve statik giriş/hosting yapılandırmalarını karıştırma. Kaynak push → tam SHA → doğrulanmış build paketi → kayıtlı sürüm → özel dağıtım → gerçek terminal durum zinciri doğrulanmadan “yayında” yazma. Site anahtarları yerel ajana kopyalanmaz; yetkili aracın normal erişimi kullanılır.
