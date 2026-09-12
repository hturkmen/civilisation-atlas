# Veritabanı uygulama sınırı

Durum: fiziksel migration ve RLS politikaları henüz hazırlanmadı/çalıştırılmadı.

Tam mantıksal model docs/04-low-level-design.md dosyasındadır. PostgreSQL + PostGIS önerilir. P03 fiziksel şema, zaman/geometri kısıtları, referans bütünlüğü ve indeksleri; P05 kullanıcı sahipliği ve rol yetkilerini uygular.

Üretim kapısı: migration staging'de çalışmalı; SQL/RLS negatif testleri, query plan ve yedekten dönüş doğrulanmalı. Hazır güvenlik politikası olmadan veritabanı doğrudan web istemcisine açılmamalıdır.

Prototip sentetik geometrileri gerçek tarihsel içerikten ayrı schema/fixture içinde tutulur; public yayın seçimine alınmaz.
