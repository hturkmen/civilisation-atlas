# Görsel öncelikli geliştirme — 13 Eylül 2026

Kullanıcının yönlendirmesi: kalan işleri listele; kullanıcıya görünür etkiye göre geliştirmeye devam et. Sıra görsel etkiye göredir; veri doğruluğu ve güvenlik bağımlılıkları atlanmaz.

## Bu adımda uygulananlar

- İlk gerçek arşiv haritası: Waldseemüller, 1507. Yakınlaştırma, kaydırma, kaynağa erişim ve destekleyen tarayıcılarda tam ekran inceleme.
- Eser/kopya tarihi ile temsil edilen bilgi ayrı gösterilir. Harita yalnız yayım yılında açılır; başka bir tarihte sessizce gösterilmez. Kullanıcı önerilen eserin tarihine açık bir düğmeyle geçer.
- Zaman çizelgesinde koleksiyon durakları: MÖ 2500, MS 1300, MS 1507. Önceki/sonraki durak, seçili durak vurgusu ve arşiv yayım yılı işareti.
- Aynı tarih aralığında kayıtlı diğer yerleşime doğrudan geçiş. Bu örtüşme, iki toplum arasında ilişki kanıtı gibi sunulmaz.
- Mobil arşiv kontrolleri, yatay taşma kontrolü ve seçili zaman durağının görünür tutulması.

## Kalanların sırası

| Öncelik | Kullanıcının göreceği sonuç | Kalan iş / kabul koşulu |
|---|---|---|
| 1 | Tarihe göre değişen ülke/medeniyet alanları | Lisansı doğrulanmış ilk sınır koleksiyonu; tarih, kaynak, çözünürlük ve belirsizlik kaydı; geçerli geometri; hiçbir modern sınırı antik sınır diye kullanmama. |
| 2 | Daha dolu bir dünya ve karşılaştırılabilir dönemler | Üç yerleşimin ötesinde kaynaklı bölge/dönem kapsamı; medeniyet, ülke, şehir ayrımı; dönem adları; iddia düzeyinde kaynak; bağımsız editoryal inceleme. |
| 3 | Daha güçlü keşif ve detay ekranı | Lisanslı yerleşim görselleri; önemli olaylar; yakınlaştırılabilir zaman ekseni; anlamlı filtreler; örtüşen alan seçimi. Şimdiki duraklar tarihî olay veya devlet değişimi değildir. |
| 4 | Farklı toplumların dünya tasavvurları | İkinci kaynaklı perspektif eseri; eser seçici; tasavvur/kopya tarih aralıklarının yapılandırılması. Georeference ancak kontrol noktası, yöntem ve hata payı ile. |
| 5 | Telefonda tek elle rahat gezinme | Kaydırılabilir alt detay paneli; harita/listeden seçimin odak yönetimi; gerçek iPhone/Android, Safari/Firefox ve büyük metin kontrolü. |
| 6 | Hesap, favoriler ve güvenli admin | Oturum, doğrulama, sunucu yetkilendirmesi, roller ve sahiplik; içerik taslağı, kaynak/harita düzenleme, inceleme kuyruğu ve yayın geçmişi. |
| 7 | Güvenilir ürün ve sonrasında uygulama | Postgres/PostGIS/API, sürümlü yayın, CI, izleme, yedek/restore, geri alma, performans bütçeleri ve web API'sini kullanan mobil uygulama denemesi. |

Sınırlar görsel açıdan en büyük kazanımdır; uygun kanıt bulunmadan çizilmeleri kabul edilemez. Bu doğrulama sürerken bağımsız arayüz ve arşiv işleri yapılabilir. Kullanıcı/admin işlemleri, görsel öncelik gerekçesiyle sahte giriş veya istemci tarafı rol kontrolüyle yayımlanmaz.

## Kaynak ve görselin kökeni

[Library of Congress katalog kaydı](https://www.loc.gov/item/2003626426/) ve [Wikimedia Commons görsel kaydı](https://commons.wikimedia.org/wiki/File:Waldseemuller_map,_complete_100%25.jpg) kullanıldı. Görsel kaydı kamu malı olarak işaretli; 1507 tarihi, yazar ve on iki yaprağın birleşimi belirtilir. Sayfa erişimi sırasında LOC doğrudan isteği 403 döndürdü; katalog bilgileri arama indeksinden, görselin hak bilgisi ise açılabilen Commons kaydından kontrol edildi. Doğrudan LOC sayfası okunmuş veya bağımsız tarihçi onayı alınmış gibi gösterilmez.

3840×2133 JPEG, 4.285.612 bayt; SHA-256 `f4219df3a2b9b1f58eae676ac28ae2731253c6ed4b97c8a31c62e7e657ca6842`. Orijinal tarama yeniden çizilmedi. Görseli modern harita koordinatlarına oturtma veya siyasi sınır olarak kullanma yapılmadı.

`prepare-archive-assets.mjs` görseli derleme/geliştirme öncesi indirir, boyut sınırını ve SHA-256 değerini doğrular. Geçerli yerel kopya yeniden indirilmez. Görsel sunucusu değişirse veya dosya farklılaşırsa derleme durur; yeni görsel incelemeden hash değiştirilmez. İndirme isteği Wikimedia'nın istediği tanımlayıcı User-Agent ile yapılır. Tarayıcı, görseli uygulamanın kendi adresinden alır; çalışma anında dış görsel servisine bağımlılık yoktur.

## Doğrulama

Üretim derlemesi ve TypeScript kontrolü geçti. 14 alan/veri testi, statik dağıtım üzerinde 9 Chromium senaryosu geçti. Yeni senaryolar yayım yılına sadakati, yakınlaştırmayı, bağlantıdan açılışı, koleksiyon duraklarını ve mobil taşmayı kapsar. Ana Node sunucu uygulamasında arşiv ve mobil akışı kapsayan 2 ek tarayıcı kontrolü de geçti. Masaüstünde sürükleme ve tam ekran, mobil görünümde seçili durağın görünürlüğü ayrıca kontrol edildi. Görselin önbelleksiz indirilip hash ile doğrulanması başarılı oldu. Gerçek cihazlar ve diğer tarayıcılar henüz doğrulanmadı.
