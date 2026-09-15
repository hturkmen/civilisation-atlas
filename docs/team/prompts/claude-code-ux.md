# Claude Code veya Kiro — dönemler arası keşif görevi

Bu prompt veri göreviyle paralel yürütülebilir. Araç adı zorunlu değildir; bu işteki ajan arayüz çalışanıdır. Yalnız bir araçla veri sözleşmesine başlamak istiyorsan önce `kiro-data.md` promptunu kullan.

---

Civilisation Atlas deposunda yerel uygulama geliştir: `https://github.com/hturkmen/civilisation-atlas.git`. Çalışan değişikliği uygula, doğrula, GitHub'a push et ve PR ile teslim et. Planla durma. Test ve repo kuralları sağlandığında ortak protokole göre PR'ı birleştirmeye yetkilisin; Codex'in çevrimiçi olmasını bekleme.

Önce `AGENTS.md`, `docs/team/README.md`, README, `docs/03-user-experience.md`, `docs/04-low-level-design.md`, `docs/11-visual-priorities.md`, `docs/12-continuation.md`, `docs/14-collection-discovery.md`, `docs/projects/P04.md` ve `backlog/issues.json` oku. Temiz çalışma alanında güncel uzak dalı al; mevcut kullanıcı değişikliklerini koru. Açık PR ve devir kayıtlarını kontrol et. Veri sözleşmesi/Gate A işi başka ajana ayrılmıştır; bu işi veya aynı görevin açık PR'ını yeniden uygulama. Ayrı dal ve checkout/worktree kullan.

Başlangıç durumu 17 siyasi yapı / 35 alan kaydı, üç yerleşim ve tek arşiv eseridir; sayıları depodan doğrula. MS 1500 beş alan, yakın kaynaklı yıl kısayolları ve üç saniyelik koleksiyon turu zaten uygulanmış olabilir. Önce kontrol et, tekrar yazma.

İlk somut görev: **Genel aramadan, seçili yılda görünmeyen bir siyasi yapının kayıtlı dönemini bulup haritada o yıla geçebilmek.** P04-003 (#20) / P04-004 (#21) için sınırlı bir keşif dilimi uygula. Gerçek API, genel arama servisi veya tüm P04 kapsamı tamamlandı diye işaretleme.

Beklenen davranış:

- Örneğin MS 1700'de “Mali” veya “Roma” arayan kullanıcı, seçili yılda kayıt olmadığını ve koleksiyonda bulunan kaynaklı dönemleri görebilsin. Sonuç yılı/aralığı açıkça yazsın; bu dönemler devletin kuruluş/yıkılış tarihi gibi sunulmasın.
- Aynı siyasi yapının farklı kayıtları kararlı kimlikle gruplanabilsin. Örnek durağı ve kaydın geçerli kaynak aralığını ayır. Önerilen yıl gerçekten ilgili kayıt içinde olmalı. Eksik yılları doldurma; veri sayısı ve dönemler sabit UI listelerinden değil mevcut katalogdan gelsin.
- Sonuç seçimi yıl, tarihsel dünya modu ve siyasi yapı seçimini tutarlı biçimde güncellesin; detay aynı kaynağı göstersin. Paylaşılan URL yeniden açılınca aynı görünüm geri gelsin. Başka bir tarihe manuel geçişte eski seçim yanlış bilgiyi göstermesin.
- Mevcut tarih içi sonuçlar anlaşılır kalsın; diğer dönemler açık bir etiketle sunulsun. Arşiv eseri ile modern coğrafyadaki siyasi alan aynı sonuç türü gibi birleştirilmesin. İki modun mevcut davranışı korunsun.
- Türkçe büyük/küçük harf ve mevcut ad arama kuralları korunsun. Klavye odağı, sonuç seçimi, Escape/temizleme ve ekran okuyucu etiketi anlaşılır olsun. 360 px genişlikte dokunma ve bilgi paneline erişim çalışsın. Yeni tasarım sistemi veya baştan UI yazımı yapma; mevcut görsel dili kullan.

Önce mevcut explorer, katalog/domain arama, collectionStops, chronology ve URL state akışını incele. Veri görevinin taslak şemasını beklemeyen, mevcut yayın koleksiyonunu kullanan küçük bir çözüm kur. Düzenleme alanın arayüz bileşenleri/CSS, gerekirse domain arama yardımcıları ve ilgili testlerdir. `data/editorial/`, editoryal sözleşme ve validator, kaynak hakları, boundary import planı ve üretilmiş geometrilere dokunma. Ortak package/type dosyası zorunluysa aktif PR'larla çakışmayı kontrol edip ihtiyacı açıkça belgeleyerek sırayla entegre et.

Anlamlı testler ekle: kayıtsız yıldan kaynaklı sonuç yılına geçiş ve seçim; aynı varlığın farklı kayıtları; Türkçe arama; paylaşım/reload; eski seçimin temizlenmesi; MÖ/MS dönüşümü etkileniyorsa MÖ 1/MS 1; mobil ve klavye. Tarih verisi bulunmayan MÖ/MS sınırına sırf test için gerçekmiş gibi kayıt ekleme. `npm test`, `npm run check:plan`, `node scripts/validate-boundaries.mjs`, `npm run build`, ardından `npm run typecheck` ve etkilediğin Playwright kontrollerini çalıştır. 3100 portunun başka checkout'a ait sunucusunu kullanma; testte `CI=true` ile reuse kapalı olsun. Görsel değişikliği yerel üretim görünümünde masaüstü ve 360 px olarak incele; yalnız screenshot üretmiş olmayı inceleme sayma.

Hata çıkarsa nedeni çöz; mevcut test/izin/kaynak koşulunu gevşeterek geçirme. Kaynak eksikse metin/tarih/sınır uydurma. Sunucu oturumu, admin yetkisi veya kullanıcı girişi taklidi ekleme. Ücretli servis, yeni sağlayıcı/veri bölgesi ve büyük bağımlılık geçişi yapma.

Kendi `docs/team/handoffs/` kaydınla taslak PR açıp aynı dalda ilerle. Bitince yalnız kendi dosyalarını commit/push et, uzak tam SHA'yı doğrula, PR'a somut davranış, test, ekran incelemesi, risk ve açık kabul ölçütlerini yaz. Kapsamı eksik issue'ları kapatma. Ortak README/backlog/devam kaydı entegrasyonda tek yazıcıyla güncellensin.

Ana kaynak Node sunucusudur. Sites demo kaynağı statik uyarlamadır; giriş veya hosting dosyalarını birbirine kopyalama. GitHub teslimin Sites erişimine bağlı değildir. Demo erişimin yoksa yayın bekliyor diye devir kaydı bırak; yeni Site oluşturma veya erişimi genişletme. Kesintide dal/PR/SHA, testler, kalan iş ve ilk sonraki adımı push edilmiş kayda yaz. Sonuç kısa Türkçe olsun; uygulanan davranışı, PR/commit'i, doğrulamayı ve kalanları bildir.
