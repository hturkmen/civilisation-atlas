# Civilisation Atlas — ortak ajan kuralları

Bu kurallar Kiro, Claude Code, Codex ve işi devralan diğer geliştirme araçları içindir. Kullanıcının güncel talimatı önceliklidir. Çalışma dili Türkçe; ana kaynak `hturkmen/civilisation-atlas` deposudur.

## Başlangıç ve görev sahipliği

Önce `README.md`, `docs/12-continuation.md`, `docs/11-visual-priorities.md`, `docs/team/README.md`, `backlog/issues.json`, ilgili alt proje belgeleri ve açık GitHub PR/issue kayıtlarını oku. Eski sohbetlerdeki kapsam sayısını güncel veri yerine kullanma. Görev numarası ile PR numarasını karıştırma.

Kiro/veri görevi: P02-001 kaynak/kanıt sözleşmesi ve sınırlı Gate A denemesi. Claude Code/arayüz görevi: mevcut koleksiyon üzerinde dönemler arası arama. Araç adı zorunlu sahip değildir; kullanıcı aynı görevi başka araca verebilir. Codex'in varsayılan devam işi bu iki işi yeniden yazmak değil, PR incelemesi/entegrasyon ve erişebildiği mevcut özel demo yayınıdır.

Her görevde tek yazıcı, ayrı dal ve ayrı checkout/worktree kullan. Aynı dizinde iki ajanın branch değiştirmesine izin verme. Başlamadan ilgili açık PR ve devir kaydını kontrol et; mevcut işi sürdür veya çakışmayan görevi al. GitHub'a erişemiyorsan yeni ortak görev sahipliğini doğrulanmış sayma.

## Uygulama sınırları

- Gerçek dosyaları değiştir, anlamlı dilimi doğrula ve kullanıcının verdiği GitHub yetkisiyle kaydet; yalnız plan veya durum mesajı bırakma.
- Tarih, geometri, kaynak, lisans, checksum ve bağımsız inceleme sonucu uydurma. Kaynak ifadesini editör çıkarımından ayır. `unreviewed` kaydı incelenmiş diye yayımlama.
- Tarihsel dünya ile belirli bir eserin Bilinen dünya perspektifi ayrı kalır. Veri boşluğu tarihsel yokluk veya kuruluş/yıkılış anlamına gelmez.
- Üretilmiş sınır GeoJSON'unu ve metadata çıktısını elle düzenleme. Seçim `data/boundary-import.json`, üretim `scripts/import-boundaries.py`; sürüm/hash doğrulaması korunur.
- Kullanıcı yıl 0 görmez; astronomik iç yıl ve yarı açık aralık kuralları mevcut domain modülünden kullanılır.
- Ana uygulamanın Node girişi ile Sites demosunun statik girişi/hosting ayarlarını birbirine kopyalama. GitHub'a push, demo yayını değildir.
- Gizli bilgi/gerçek kullanıcı verisi depoya, loga, PR'a veya devir kaydına yazılmaz. Sunucu yetkisi istemci rol kontrolüyle ikame edilmez. Yeni ücretli hizmet, veri bölgesi veya sağlayıcı taahhüdü için somut seçeneklerle kullanıcı kararı gerekir; bağımsız işlere devam et.
- `reset --hard`, `clean -fd`, force push, koruma kuralını aşma ve başkasının değişikliğini silme uygulanmaz. Kirli checkout'u otomatik stash etme; ayrı çalışma alanı kullan.

## Doğrulama ve teslim

Projedeki gerçek komutları kullan: `npm ci`, `npm test`, `npm run check:plan`, `node scripts/validate-boundaries.mjs`, `npm run build`, `npm run typecheck`; değişen davranış için gerekli tarayıcı/veri kontrollerini ekle. Yalnız belge değişiminde bağlantı/tutarlılık kontrolü yeterlidir. Eksik ortam aracını veya başarısız kontrolü başarılı sayma; testi geçirtmek için kapsamı ya da güvenlik koşulunu zayıflatma.

Her PR'ın kendi `docs/team/handoffs/` kaydı olur. Ortak README/backlog/devam kaydı değişiklikleri entegrasyonda tek yazıcı tarafından birleştirilir. Doğrulanmış sonuç, kalan kabul ölçütleri, tam commit, çalıştırılan komutlar, engeller ve ilk sonraki adım kaydedilir. GitHub kuralları ve gerekli kontroller sağlanınca PR birleştirilebilir; Codex'in çevrimiçi olması zorunlu değildir. Ayrıntılı süreç ve görev promptları `docs/team/README.md` içinde.
