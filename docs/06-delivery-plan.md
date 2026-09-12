# Alt projeler ve teslim planı

Tek repo içinde sekiz alt proje; ayrı mikroservis veya ayrı GitHub repo zorunluluğu yok. Her işin girdisi, bağımlılığı, çıktısı, eforu ve kabul/doğrulama ölçütü tanımlıdır.

| Alt proje | Hedef | İş sayısı | Efor (saat) |
|---|---|---:|---:|
| [P01 — Proje temeli ve geliştirme ortamı](projects/P01.md) | Tek repo, tekrar üretilebilir geliştirme ve secretsız kalite kontrolü. | 5 | 13–22 |
| [P02 — Kaynak ve tarihsel veri üretimi](projects/P02.md) | Kullanım hakkı ve dayanağı incelenebilir küçük koleksiyon; ölçülmüş içerik üretim akışı. | 6 | 27–49 |
| [P03 — Zaman, coğrafi model ve API](projects/P03.md) | Aynı yayın ve tarih üzerinde tutarlı veri erişimi. | 6 | 29–48 |
| [P04 — Harita ve zaman deneyimi](projects/P04.md) | Telefon ve masaüstünde tarih → seçim → kaynak akışı. | 6 | 28–46 |
| [P05 — Hesaplar ve kullanıcı güvenliği](projects/P05.md) | Gerçek oturum, minimum profil, favori sahipliği ve yetkili admin. | 5 | 21–35 |
| [P06 — Dönemin bilinen dünyası](projects/P06.md) | Bakış açısı ve eser tarihi ayrılmış, kaynaklı ikinci görünüm. | 5 | 20–35 |
| [P07 — Admin, inceleme ve yayın](projects/P07.md) | İçerik taslağından doğrulanmış ve geri alınabilir yayına kadar akış. | 6 | 33–53 |
| [P08 — Beta doğrulama ve mobil hazırlık](projects/P08.md) | Ölçülmüş, incelenmiş beta; sonraki uygulama için uyumluluk denemesi. | 6 | 27–49 |

Toplam 45 görev. Web beta mühendislik/koordinasyon tahmini **190–321 saat** (27–46 odaklı geliştirici günü). Beta sonrası mobil teknik denemesi ayrıca 8–16 saat; tam mobil uygulama dahil değil.

Bu bir teklif veya kesin teslim tarihi değildir. Tarihsel koleksiyonun gerçek sayısallaştırması, bağımsız tarihçi incelemesi, lisans bekleme süresi ve gerekiyorsa büyük ölçekli vektör tile üretimi bu toplama dahil değildir. P02-002/P02-006 sonunda kaynak verisine göre tahmin yeniden yapılır.

Haftada 10 saat ayırılırsa yalnız bu efor yaklaşık 19–32 hafta; 20 saat için 10–16 hafta. AI yardımı ile azalabilecek süre ölçülmeden indirim varsayılmadı.

## Kritik sıra

1. Repo aktarımı ve kaynak denemesi; bağımsız oldukları için birlikte ilerleyebilir.
2. Zaman/kanıt modeli ve küçük geometri koleksiyonu.
3. Harita → tarih → seçim → kaynak dikey dilimi.
4. Gerçek hesaplar, sahiplik, MFA ve admin inceleme akışı.
5. İki bakış açısı örneği ve ikinci görünüm.
6. Immutable yayın, atomik aktivasyon, geri çekme ve güvenlik testleri.
7. İncelenmiş gerçek koleksiyon, kullanılabilirlik/restore kapısı, kapalı beta.
8. İçerik kapsamını bölge/dönem paketleriyle büyütme; sonra mobil.

## İlk odaklı çalışma paketi

İlk 20–30 saatte hedef: kaynak denemesinin ilk sonuçları, repo/uygulama temeli ve tarih çekirdeği. Arayüz denemesinde sentetik geometri kullanılabilir fakat belirgin test etiketiyle gerçek tarihsel veriden ayrılır. Kullanıcıya sunulan gerçek atlas yerine geçmez.

## İş yönetimi

Makine tarafından okunabilir kayıt: [issues.json](../backlog/issues.json). Önerilen pano sütunları: Backlog, Ready, In progress, Review, Blocked, Done. 45 GitHub issue kaydı [görev dizini](../backlog/github-issues.md) üzerinden takip edilir; Projects panosu ve milestone yapılandırması henüz yapılmadı. Alt proje dosyaları doğrudan issue gövdesine çevrilebilir; aktarım yardımcısı marker ile duplicate oluşturmayı önler.

P03-001 temel tarih matematiği uygulanmış olduğu için partial işaretlidir; uygulamaya entegrasyon ve import tarih yorumlarının tamamı henüz bitmedi. P01-001 repo aktarımı tamamlandığı için done; diğer görevler todo durumundadır.
