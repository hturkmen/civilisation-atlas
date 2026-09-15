# Durmuş işi devralma, inceleme ve entegrasyon promptu

Önceki araç durmuşsa veya işi açıkça devretmişse kullan. Aktif iki oturumu aynı dala yönlendirme. Varsa dal/PR bağlantısını bu promptun sonuna ekle; yoksa ajan GitHub'daki devir kayıtlarından bulsun.

---

Civilisation Atlas işini kaldığı yerden devral: `https://github.com/hturkmen/civilisation-atlas.git`. `AGENTS.md`, `docs/team/README.md`, güncel README/devam kaydı, ilgili görev belgeleri ve açık GitHub PR/issue kayıtlarını oku. Önceki aracı veya sohbet geçmişini görüyormuş gibi davranma; gerçek dosya, commit, test ve devir kaydını esas al.

Görevin en yüksek faydalı, çakışmayan adımı tamamlamaktır. Tamamlanmamış ve devredilmiş PR varsa kendi `docs/team/handoffs/` kaydından devam et; aynı çözümü yeniden yazma. Başka ajanın aktif PR'ı varsa onun uygulama alanına girme; hazır PR incelemesi veya açıkça bağımsız iş seç. Kullanıcı önceki işi durdurduğunu belirtmediyse ve kayıt hâlâ aktifse sırf eski zaman damgasına dayanarak sahipliğini alma.

Yerel kirli dosyaları koru. Gerekirse ayrı checkout/worktree'de ilgili uzak dalı aç; origin/main ve PR HEAD'i güncel al. Başlangıç ve son doğrulanan tam SHA'yı karşılaştır. Devam eden süreç veya kaydedilmemiş kullanıcı işi varsa ezme. Gerçek anlamlı dilimi uygula/doğrula ve aynı görev dalına normal push yap. Kimlik doğrulama eksiği varsa güvenli normal giriş akışını kullan; token'ı isteme, prompta veya depoya koyma.

Hazır PR için önce hedef problemi/kabul ölçütlerini, diff'i, kaynak/lisans kanıtını ve test sonuçlarını incele. Özellikle tarih aralığı/boşluk, üretilmiş veri, inceleme/hak durumu, istemci-sunucu yetki sınırı ve Node/statik giriş ayrımını kontrol et. Yeni commit gelmişse eski incelemeyi geçerli sayma. Uygulama kapsamını büyütmeden somut hataları düzelt; başkasının devam eden değişikliğini silme. Bağımsız bir araç incelemesi yapmadıysan yapılmış gibi yazma.

Geçen testleri gereksiz tekrarlama; devraldığın veya entegrasyonda değişen davranışın somut riskini doğrula. Repo koruma/CI/insan incelemesi gerekliliklerini aşma. Gerekli yetki ve kontroller varsa PR'ları **birer birer** birleştirebilirsin; Codex erişimini veya yeni bir sohbet onayını beklemek gerekmiyor. Zorunlu insan onayı/başarısız kontrol varsa çalışmayı GitHub'da somut PR olarak bırakıp tam engeli bildir. Kapsamı eksik issue'ları kapatma. Doğrudan main'e force push/history rewrite yapma.

Entegrasyon sonunda README, backlog ve `docs/12-continuation.md` içindeki yalnız ilgili ilerlemeyi güncelle. Başka ajanın aynı ortak dosyalarda çalışmadığını kontrol et. Tamamlanan, kalan, gerçek test/merge/yayın sonucu ve ilk sonraki işi yaz. Birleştirmeden sonra gerçek main SHA'sını doğrula. Açık P02-001 veri veya dönemler arası arama işi varsa bunları tekrar başlatma.

Site yayınına yetkili aracın erişimi varsa ilgili Sites becerisini okuyup mevcut `appgprj_6aa638d93f3c819188b55444e79f992a` projesini kullan. Ortak bileşen/veriyi ana Node uygulamasından demo statik uyarlamasına seçerek taşı; giriş/hosting farkını koru. Yeni Site oluşturma, erişim kitlesini genişletme, gizli bilgileri başka ortama taşıma. Kaynak push, gerçek tam SHA, başarılı build/paket, kaydedilmiş sürüm ve hizmetten `succeeded` sonucu olmadan yayını başarılı sayma. Erişim yoksa `deployment_pending` bırak; bu GitHub kod geliştirmesini veya PR birleştirmesini engellemez.

Kesintiye yaklaşırken doğrulanabilir devir kaydı ve güvenli WIP commit/push bırak. Son yanıt kısa Türkçe: somut değişiklik, PR/commit/merge sonucu, doğrulama, demo durumu, açık risk ve ilk sonraki iş. Projenin bütün kabul ölçütleri karşılanmadan tamamlandı deme.
