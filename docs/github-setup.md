# GitHub aktarımı

## Mevcut repo

Repo: https://github.com/hturkmen/civilisation-atlas · Ana dal: main · Görünürlük: public.

Repo sahibi tarafından oluşturulup paylaşıldı. Yeni repo açma adımı artık gerekli değil. Plan, başlangıç kodu ve görev kayıtları bu repoda tutulur.

## Kendi bilgisayarında devam et

Önkoşul: git, Node.js ve Python 3. GitHub CLI yalnız issue eşitlemesi için gereklidir. Yerel git name/email ayarların sana ait olmalıdır.

    git clone https://github.com/hturkmen/civilisation-atlas.git
    cd civilisation-atlas
    node --test packages/domain/test/*.test.mjs
    python3 scripts/validate_plan.py

Çalışan web uygulamasının kurulumu P01-002 görevidir. Paket, plan ve tarih çekirdeği içerir. Mevcut branch/commit'leri incelemeden force-push yapma.

## Eksik görevleri eşitle

Önizleme, dışarıya yazma yapmaz:

    python3 scripts/github_issues.py

Gerektiğinde yalnız eksik görevleri oluşturmak için:

    python3 scripts/github_issues.py --repo hturkmen/civilisation-atlas --apply

Yardımcı gh üzerinden hesabın hturkmen olduğunu, hedef repo sahibini ve paket varlığını kontrol eder. Gövde marker'ı eşleşen açık/kapalı görevleri atlar; mevcut issue'ları değiştirmez, etiket/atama/davet eklemez. Bir hata olursa durur; yeniden çalıştırıldığında tamamlananları atlar. Aynı anda iki kopyasını çalıştırma; iki ayrı koşunun issue yaratma yarışı için sunucu kilidi uygulanmadı.

GitHub Projects panosu ayrı işlemdir. Önerilen sütunlar: Backlog, Ready, In progress, Review, Blocked, Done. Bu pakette GitHub Projects panosunun oluşturulduğu iddia edilmez.

## Aktarım sonrası kabul

- Repo doğru kullanıcı ve istenen görünürlükte.
- README, sekiz alt proje, OpenAPI, backlog ve domain testleri aynı commit'te.
- Görev sayısı 45; duplicate marker yok.
- Repo'da erişim anahtarı, gerçek kullanıcı verisi veya izinsiz harita dosyası yok.
- Koruma/CI ayarları P01 görevleri kapsamında uygulanır; doküman var diye aktif sayılmaz.

Komut referansları: [gh repo create](https://cli.github.com/manual/gh_repo_create), [gh api](https://cli.github.com/manual/gh_api).
