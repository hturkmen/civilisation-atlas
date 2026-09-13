# Devam kaydı

## Kullanıcı yönlendirmesi

Görsel öncelikle geliştir; tüm hedef tamamlanana kadar ilerle. Süre veya token nedeniyle iş kesilirse üç saatte bir devamı tetikleyecek otomasyon istendi.

## Otomasyon durumu

Kuruldu ve etkin. Önceki 5 aktif görev sınırı, kullanıcının seçtiği görevlerin devre dışı bırakılmasıyla çözüldü. Kişisel görevlerin adları/kimlikleri bu açık depoda tutulmaz.

Kullanıcının istediği sıklık üç saatti. Sonraki servis okumasında dört saatlik aralık görüldü; fark kullanıcıya bildirildi. 13 Eylül son kontrolünde kullanıcının ilk talebine uygun üç saatlik aralık geri yüklendi ve servis güncellemeyi doğruladı. Yeni plan başlangıcı 14 Eylül 2026 00:13 Türkiye saati. Önceki değişimin sebebi doğrulanmadığı için uydurulmaz. Güncel tetikleme zamanı ve sıklığı bu metinden hesaplanmamalı, zamanlama servisinden kontrol edilmeli. Amaç hatırlatma göndermek değil, işi kaldığı yerden yürütmek. Aktif çalışmayla çakışma; mevcut değişiklikleri ezme. Kapsam gerçekten tamamlanınca yalnız bu devam otomasyonunu devre dışı bırak. Kotalar veya onay kuralları aşılmaya çalışılmaz.

## Devam edecek çalışma için başlangıç

1. README, docs/11-visual-priorities.md, backlog/issues.json ve güncel GitHub görevlerini oku. Tamamlanan işleri tekrar yapma; açık kabul ölçütlerini kontrol et.
2. Demo kaynak deposu mevcut Sites projesine bağlıdır: `appgprj_6aa638d93f3c819188b55444e79f992a`. Yeni Site oluşturma; mevcut özel erişimi koru. Ana uygulama: https://github.com/hturkmen/civilisation-atlas.
3. GitHub ana uygulaması Node sunucu girişini, demo ise statik giriş uyarlamasını kullanır. Ortak bileşen/veri değişikliklerini ikisine aktar; birinin giriş/hosting ayarını diğerine yanlışlıkla kopyalama. Büyük arşiv görselleri doğrulanan indirme betiğiyle hazırlanır.
4. İlk tarihsel alan katmanı uygulandı: Cliopatria'dan altı siyasi yapıya ait seçilmiş 12 kayıt. Önce docs/13-sourced-boundaries.md ve sabit kaynak kayıtlarını oku. Sonraki somut iş, komşu dönemleri/diğer bölgeleri kaynak incelemesiyle genişletmek ve veri boşluklarını daha kolay keşfedilir kılmak. Kayıt dönemi ile devletin yaşam süresini karıştırma. Kaynak yeterli değilse uydurma; ikinci arşiv perspektifi ve lisanslı görseller gibi bağımsız işleri ilerlet.
5. Gerçek üyelik/admin öncesinde sağlayıcı, veri bölgesi ve bütçe gibi henüz kararlaştırılmamış taahhütleri somut seçeneklerle kullanıcıya getir. Sunucu yetkilendirmesini UI görünürlüğüyle ikame etme.
6. Anlamlı değişiklikleri doğrula, GitHub ve mevcut demoyu güncelle, çalışma sonunda neyin bittiğini/ne kaldığını kaydet. Başarısız yayını veya eksik işlevi tamamlandı diye yazma.

Üç yerleşim, tek tarihî harita ve 12 alan kaydı, bütün medeniyet tarihinin tamamlanması değildir. Görev kapanışı, onaylı kapsamın kabul ölçütleri karşılanınca yapılır.

## Son doğrulanmış yayın — 13 Eylül 2026

Kaynaklı alan sürümü GitHub’a aktarıldı: `adba71198fcd79d576af2107d38027a51deddbd1`. Mevcut özel demo sürüm 3, 19:26 UTC’de başarılı yayımlandı: https://civilisation-atlas-hturkmen.halilturkmen.chatgpt.site. Demo kaynak commit’i: `a8677916fc6c1b98126b92b0fef03560acf55d7b`. Yayın durumu Sites hizmetinden `succeeded` olarak doğrulandı; canlı adrese ek tarayıcı testi uygulanmadı.

Altı siyasi yapıdan seçilmiş 12 kaynak kaydı; tarihe göre alanlar, kaynak detayları, paylaşılan seçim ve mobil etiket düzeni tamamlandı. 19 alan/veri testi, statik demodaki 13 tarayıcı senaryosu ve ana Node girişindeki üç hedefli senaryo doğrulandı. Tek ilk açılış zaman aşımının yeniden kontrolü ve kapsam sınırları docs/13-sourced-boundaries.md içinde. Her iki üretim derlemesi başarılı.

Sonraki dilim: komşu kaynak dönemlerini ve diğer bölgeleri genişlet; koleksiyondaki boş yıllar arasında gezinmeyi iyileştir. Bütün dünya kapsamı, tarihçi incelemesi, kullanıcı/admin ve mobil uygulama tamamlanmış sayılmaz. Otomasyon üç saatlik aralıkla etkin; 14 Eylül 00:13 Türkiye başlangıcı son servis okumasıyla doğrulandı.
