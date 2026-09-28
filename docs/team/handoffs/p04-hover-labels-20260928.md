# Harita isimlerini sadeleştirme — 28 Eylül 2026

Kullanıcı talebi: ülke/medeniyet isimleri sürekli yer kaplamasın; ülkenin üzerine gelince yarı saydam tooltip görünsün.

Sabit siyasi alan Marker düğmeleri ve yerleşim/bağlantı çizgisi algoritması kaldırıldı. Tek MapLibre Popup, dolgu alanının mousemove olayında kaynak adını güvenli setText ile gösterir. Örtüşmede adlar aynı balonda birleştirilir. Tooltip pointer-events:none ve %76 opak zeminlidir. Ayrılma, sürükleme, dokunma, tarih/kayıt/seçim değişimi ve odaklı haritada Escape kapatır. Tıklama/dokunma ile seçim ve çoklu alan seçicisi korunur. Klavye erişimi mevcut yan listedendir. Katman düğmesi yalnız yerleşim adlarını açıp kapattığı için erişilebilir adı düzeltildi.

Ana Node build ve TypeScript geçti. Hedefli tarayıcı senaryosu eklendi; Chromium indirmesi geçersiz ZIP döndürdüğünden henüz çalıştırıldığı iddia edilmez. Yayın sonucu devam kaydında güncellenir. Bu dilimde tarihsel veri değiştirilmedi; mevcut 38 siyasi yapı / 562 kayıt korunur. Önceki MS 1440 yerel çalışmasının GitHub'a ulaştığı varsayılmadı.

Sonraki iş: ortam izin verdiğinde hover/leave ve mobil seçim testini çalıştır; veri genişletmesini güncel main ile uzlaştırarak devam ettir.
