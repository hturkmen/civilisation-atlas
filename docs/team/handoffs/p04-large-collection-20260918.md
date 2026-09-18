# Büyük koleksiyonda mobil dönem seçimi — 18 Eylül 2026

Main 4441e4481badcbc60b2db0fd4c3ebc4f212bd19f; demo kaynak b6825eb77aa4f8a3050ebce5517d1658301a091d; V10 succeeded, 2026-09-18T11:22:29.543915+00:00. Özel erişim korundu; canlı Site üzerinde ek tarayıcı testi yapılmadı.

## Uygulama
8'den fazla kaynak dönemi olan siyasi yapılarda tüm dönemler native details/summary içine alındı; önceki/sonraki kontroller yalnız gerçek kaynak kayıtları arasında geçer. Tüm dönemlerin seçimi korunur, düğmeler en az 44 px ve rem metin kullanır. Aynı siyasi yapıda record.id değişimi başlığa odağı ve panelin başına kaydırmayı tetikler. 28 siyasi yapı/389 geometri ve yayın kapıları değişmedi.

## Doğrulama
Son statik build/TypeScript ve 27/27 Chromium senaryosu geçti. İlk koşuda yeni test aynı devletin başka dönemine geçince odağın düğmede kaldığını buldu; kayıt kimliği bağımlılığıyla düzeltildi. İkinci yeni testin window ResourceTiming varsayımı worker isteğini göremedi; üretim aktarım metriği uydurmak yerine kaynak dosyası boyutu, çevrimdışı gzip ve hazır-bayrağı gözlemi açıkça ayrıldı. Son temiz toplu koşum 27 geçti.

1440×1000 yerel yazılım GPU: mapReadyFlagObservedMs=1267; rawBytes=2884759; gzipLevel9Bytes=181771. Gzip hesaplaması üretim yanıtının Content-Encoding doğrulaması değildir. Hazır bayrağı gözlemi tam görsel çizimin ölçümü veya hız garantisi değildir. Gerçek cihaz, Safari/Firefox, ana Node build ve canlı Site tarayıcı testi bu dilimde yapılmadı. Veri/domain mantığı değişmediği için önceki 54 domain sonucu yeni çalıştırılmış gibi raporlanmaz.

## Sonraki iş
P04-006 kontrollü mobil viewport/CPU-ağ koşullarında tekrarlı ölçüm ve bütçe kaydı. Gerçek cihaz kabulü ayrıca açık. P04-005 uzun liste/odak işini veya 389 kayıtlı veri importunu tekrar yapma. Tarihçi onayı/İngiltere-İspanya koloni kaynak belirsizlikleri açık kalır.
