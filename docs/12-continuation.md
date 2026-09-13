# Devam kaydı

## Kullanıcı yönlendirmesi

Görsel öncelikle geliştir; tüm hedef tamamlanana kadar ilerle. Süre veya token nedeniyle iş kesilirse üç saatte bir devamı tetikleyecek otomasyon istendi.

## Otomasyon durumu

Kurulamadı. Zamanlama servisi `too_many_active_automations` döndürdü: mevcut plan 5 aktif göreve izin veriyor ve 5 görev zaten aktif. Bu proje için otomasyon kimliği oluşmadı. Başka görev silinmedi/duraklatılmadı. Yeni bir görev için kullanıcının hangi mevcut görevi duraklatacağını seçmesi gerekiyor; mevcut görevlerin kişisel ayrıntıları bu açık depoya yazılmaz.

Yer açıldığında istenen sıklık `FREQ=HOURLY;INTERVAL=3`; amaç hatırlatma göndermek değil, işi kaldığı yerden yürütmek. Her çalışmada güncel depo ve açık görevler okunmalı, aktif çalışmayla çakışılmamalı, kaynak/lisans ve güvenlik kuralları korunmalı. Kapsam gerçekten tamamlanınca otomasyon devre dışı bırakılmalı. Kotalar veya onay kuralları aşılmaya çalışılmaz.

## Devam edecek çalışma için başlangıç

1. README, docs/11-visual-priorities.md, backlog/issues.json ve güncel GitHub görevlerini oku. Tamamlanan işleri tekrar yapma; açık kabul ölçütlerini kontrol et.
2. Demo kaynak deposu mevcut Sites projesine bağlıdır: `appgprj_6aa638d93f3c819188b55444e79f992a`. Yeni Site oluşturma; mevcut özel erişimi koru. Ana uygulama: https://github.com/hturkmen/civilisation-atlas.
3. GitHub ana uygulaması Node sunucu girişini, demo ise statik giriş uyarlamasını kullanır. Ortak bileşen/veri değişikliklerini ikisine aktar; birinin giriş/hosting ayarını diğerine yanlışlıkla kopyalama. Büyük arşiv görselleri doğrulanan indirme betiğiyle hazırlanır.
4. Bir sonraki somut öncelik, kanıtı ve lisansı uygun ilk tarihsel alan koleksiyonunu değerlendirmek ve örnek bir tarih/bölge için gerçek sınır katmanını uygulamak. Kaynak yeterli değilse uydurma; kaynaklı yerleşim kapsamını ve ikinci arşiv perspektifini ilerlet.
5. Gerçek üyelik/admin öncesinde sağlayıcı, veri bölgesi ve bütçe gibi henüz kararlaştırılmamış taahhütleri somut seçeneklerle kullanıcıya getir. Sunucu yetkilendirmesini UI görünürlüğüyle ikame etme.
6. Anlamlı değişiklikleri doğrula, GitHub ve mevcut demoyu güncelle, çalışma sonunda neyin bittiğini/ne kaldığını kaydet. Başarısız yayını veya eksik işlevi tamamlandı diye yazma.

Üç yerleşim ve tek tarihî harita, bütün medeniyet tarihinin tamamlanması değildir. Görev kapanışı, onaylı kapsamın kabul ölçütleri karşılanınca yapılır.
