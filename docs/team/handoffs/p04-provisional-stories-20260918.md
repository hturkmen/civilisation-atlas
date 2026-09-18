# Devir — kaynaklı ön bilgi kartları / 2026-09-18

Kod: 6c3b172d7a3943f46906ad82dc0a04630361f014. Demo kaynak: 46601f53b490c9ee3e205ed4d8fafdd11b565775.
V11: appgprj_6aa638d93f3c819188b55444e79f992a~appgver_0f64058a12a08191bf182868a81d9a15
Dağıtım: appgdep_6aad2865da708191913e5bc949c419a7 — succeeded 2026-09-18T12:03:00.891466+00:00.
URL: https://civilisation-atlas-hturkmen.halilturkmen.chatgpt.site (özel erişim korunur).

## Teslim
data/polity-stories.json: 10 kültür/tarih anlatısı. polity-story.tsx, detay paneli ve CSS kartları; bağımsız inceleme ve genel bağlam notları görünürdür. Dönem seçimi değişince bu anlatılar yıl olayı gibi sunulmaz. Yeni geometri, resim veya arşiv haritası yok; 389 sınır değişmedi.

Dokuz UNESCO World Heritage Centre açıklaması: /en/list/356/ (İstanbul), 252 (Taj Mahal), 439 (Ming/Qing sarayları, iki kart), 394 (Venedik), 273 (Cusco), 412 (Mexico City/Xochimilco), 300 (Québec), 19 (Gondar), 115 (İsfahan). Tam URL, locator ve 2026-09-18 erişimi her kayıtta.
Açıklamaların CC BY-SA 3.0 IGO lisansı, kaynak atfı, Türkçe kısaltma/uyarlama ve UNESCO onayı olmadığı notu görünür. Fotoğrafların hakları bu metin lisansından türetilmedi; fotoğraf alınmadı.
Taj Mahal kaynağında özet 1631, ayrıntılı Brief synthesis 1632 diyor; kart ayrıntılı bölümü izler ve locator farkı kaydeder.
Tümü unreviewed; beş Gate A adayının statüsü ve yayın değerlendirmesi değişmedi.

## Doğrulama
- node scripts/validate-polity-stories.mjs: 10 kayıt geçti. Komut henüz prebuild'e bağlı değil.
- node scripts/validate-boundaries.mjs: geçti.
- Statik Sites build ve TypeScript: geçti.
- apps/web/tests/polity-story.spec.ts: 360×800 görünüm, uyarı/kapsam, kaynak/lisans bağlantısı ve yatay taşma: 1/1 geçti.
- İlk tarayıcı denemesi uygulama başlamadan kesik yerel Chromium ikilisi yüzünden SIGSEGV verdi. Mevcut Brotli arşivinden ikili yeniden açıldı; test tekrarında geçti. Uygulama hatası olarak gizlenmedi.
- Tam domain/tarayıcı paketi, Node sunucu build, Safari/Firefox ve fiziksel cihaz bu dilimde çalıştırılmadı. Kullanıcının hız önceliği doğrultusunda odaklı kontrol yapıldı.
- Gerçek yayın sonucu Sites succeeded ile doğrulandı; canlı üzerinde ilave tarayıcı testi yok.

## Devam
Önce ikinci doğrulanabilir kaynak/lisanslı arşiv haritası ve eser seçicisi. Modern coğrafyadaki sınırlarla arşiv perspektifini karıştırma. Sonra İngiltere/İspanya/kolonilerin 1400–1750 dönemleri; isim/kimlik/tarih belirsizliğini kontrol et, kaynaklı ön bilgiyi etiketle. Performans/gerçek cihaz kabulü ertelendi, kapanmadı. Bu 10 kartı tekrar üretme.
