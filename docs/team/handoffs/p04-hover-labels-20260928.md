# Harita isimlerini sadeleştirme — 28 Eylül 2026

Kullanıcı talebi: ülke/medeniyet isimleri sürekli yer kaplamasın; ülkenin üzerine gelince yarı saydam tooltip görünsün.

Sabit siyasi alan Marker düğmeleri ve yerleşim/bağlantı çizgisi algoritması kaldırıldı. Tek MapLibre Popup, dolgu alanının mousemove olayında kaynak adını güvenli setText ile gösterir. Örtüşmede adlar aynı balonda birleştirilir. Tooltip pointer-events:none ve %76 opak zeminlidir. Ayrılma, sürükleme, dokunma, tarih/kayıt/seçim değişimi ve odaklı haritada Escape kapatır. Tıklama/dokunma ile seçim ve çoklu alan seçicisi korunur. Klavye erişimi mevcut yan listedendir. Katman düğmesi yalnız yerleşim adlarını açıp kapattığı için erişilebilir adı düzeltildi.

Node ve statik build/TypeScript, 56 domain testi, plan kontrolü ve diff kontrolü geçti. Hedefli tarayıcı senaryosu eklendi; Chromium indirmesi geçersiz ZIP döndürdüğünden çalıştırılamadı. Gerçek cihaz/canlı tarayıcı QA yapılmadı. Bu dilimde tarihsel veri değiştirilmedi; mevcut 38 siyasi yapı / 562 kayıt korunur. Önceki MS 1440 yerel çalışmasının GitHub'a ulaştığı varsayılmadı.

Main kod: 88706897f8a1dbe72925b450f69b6f7368805286. Demo kaynak: 5887881e5db992e2c0a6fbb7b8e39cbc1f90ac8d. Özel yayın succeeded 2026-09-28T08:29:08.771152+00:00. Version: appgprj_6aa638d93f3c819188b55444e79f992a~appgver_37a0964ca6588191a64accd452c76ecd. Dağıtım: appgdep_6aba2542bc248191879dd6d3a985a80e. https://civilisation-atlas-hturkmen.halilturkmen.chatgpt.site . Erişim yalnız sahibinde korundu. Kaynak kurtarmasında sunucunun shallow repo sınırı nedeniyle fetch --update-shallow gerekti; force push veya kaynak geçmişini yeniden yazma yapılmadı.

Sonraki iş: ortam izin verdiğinde hover/leave ve mobil seçim testini çalıştır; veri genişletmesini güncel main ile uzlaştırarak devam ettir.
