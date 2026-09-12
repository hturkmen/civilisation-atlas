# Web uygulaması alt projesi

Durum: tasarım; Next.js uygulaması henüz başlatılmadı.

Sorumluluklar: explorer, tarih seçimi, varlık paneli, perspektif görünümü, hesap/favoriler ve yetkili admin alanı. HTTP adaptörleri aynı uygulamada, domain servislerinden ayrı olacak.

İlk iş sırası: P01 geliştirme temeli → P03 sözleşme/veri erişimi → P04 harita dilimi. Gerçek üretim verisine erişim P05 kimlik ve P07 yayın kontrollerine bağlıdır.

Route planı: /, /account, /admin/content, /admin/sources, /admin/imports, /admin/releases, /admin/users.

Public gezinti hesap gerektirmez. Auth ekranlarının gerçek sağlayıcı oturumu olmadan işlevselmiş gibi görünmesi kabul edilmez.
