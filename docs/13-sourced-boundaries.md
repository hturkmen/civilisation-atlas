# İlk kaynaklı tarihsel alan katmanı

13 Eylül 2026. Altı siyasi yapıya ait seçilmiş 12 kaynak kaydı eklendi. Bu, dünya tarihinin eksiksiz sınır koleksiyonu değildir.

## Kullanıcıya görünenler

- Tarihe göre renkli alanlar, alan adları ve harita/listeden seçim.
- Seçilen alanın kaynak dönemi, kullanım lisansı, belirsizlik ve veri kökeni.
- Aynı siyasi yapının koleksiyona alınan dönemleri arasında geçiş.
- `polity` parametresiyle paylaşılabilen görünüm; kapsam dışı yılda eski seçim temizlenir.
- Yerleşim ve siyasi yapı araması; masaüstü ve mobilde aynı kaynak akışı.

| Siyasi yapı | Keşif durakları | İçeri alınan kayıt sayısı |
|---|---|---|
| Sümer şehir devletleri | MÖ 3000, MÖ 2500 | 2 |
| Eski Krallık Mısırı | MÖ 2500 | 1 |
| Ahameniş İmparatorluğu | MÖ 500 | 1 |
| Roma İmparatorluğu | MS 117, MS 200 | 2 |
| Han Hanedanı | MS 117, MS 200 | 2 |
| Osmanlı İmparatorluğu | MS 1453, MS 1600, MS 1800, MS 1914 | 4 |

Duraklar gezinme örnekleridir. Her kayıt yalnız kaynakta belirtilen yıl aralığında görünür. Örneğin Roma'nın ilk kaydı MS 117–126; Han'ın eşzamanlı kaydı MS 117–153 kapsamındadır. MS 127'de Roma kaldırılır, Han kalır. Aradaki kayıtlar alınmadığı için görünmeyen bir alanın tarihte yok olduğu çıkarılamaz.

## Kaynak, lisans ve sürüm

Kaynak: Bennett, J. S. ve diğerleri (2025), *Cliopatria – A geospatial database of world-wide political entities from 3400BCE to 2024CE*, Scientific Data 12, 247. [Makale kaydı ve özeti](https://pubmed.ncbi.nlm.nih.gov/39939607/); [DOI](https://doi.org/10.1038/s41597-025-04516-9).

[Seshat kaynak deposu](https://github.com/Seshat-Global-History-Databank/cliopatria/tree/ad28a691b7c07c1fca89d0e0636d324667d2a258) ve aynı sürümün [lisans dosyası](https://github.com/Seshat-Global-History-Databank/cliopatria/blob/ad28a691b7c07c1fca89d0e0636d324667d2a258/LICENSE.md) kontrol edildi. Veri **CC BY 4.0** olarak yayımlanıyor. Kaynak, lisans ve yapılan uyarlamalar hem harita atfında hem detaylarda gösteriliyor. Bu beyan veri yayımlayıcısının lisans kaydıdır; bağımsız hukuki veya tarihçi onayı değildir.

- Kullanılan sürüm: `v0.2.0`, yeniden yayımlama etiketi `v0.2.0-duplicate`.
- Sabit commit: `ad28a691b7c07c1fca89d0e0636d324667d2a258`.
- Arşiv SHA-256: `d01ae3a20d358cc5d54f69d9d725d390767d9c8759ac89ad6f90c58d106f3370`.
- ZIP içindeki gerçek dosya: `cliopatria_polities_only.geojson`. README genel bir eski dosya adı kullanıyor; içe aktarma gerçek arşiv üyesine sabitlendi.
- Kaynak arşivde 13.765 kayıt var; `POLITY` ve `RELATION` türleri birlikte bulunuyor. Yalnız açıkça seçilmiş `POLITY` kayıtları alındı.
- Tam makaleye doğrudan erişim bu oturumda başarısız oldu. Okunabilen makale özeti, sürüme sabit README, lisans dosyası ve veri kayıtları kullanıldı; tam metin okunmuş gibi raporlanmaz.

Kaynak README'si sınırların tarihsel yorum içerdiğini; isim, alan ve dönem üzerinde görüş ayrılıkları olabileceğini söylüyor. Veri kaydının başlangıç/bitişi devletin kuruluş/yıkılış tarihi olarak kullanılmaz. Bu ayrım özellikle daha geniş veri aktarımından önce önemlidir; tüm kaynak satırları otomatik olarak onaylı içerik sayılmaz.

## Tekrar üretilebilir aktarım ve güvenlik

`data/boundary-import.json` seçimleri ve kökeni tutar. `scripts/import-boundaries.py`, açıkça verilen ZIP dosyasının boyutunu ve SHA-256 değerini kontrol eder; yalnız belirtilen dosyayı bellekte okur, arşiv yollarını diske açmaz. Seçim tek bir kayıtla eşleşmezse işlem durur.

Kaynak ve türetilen geometri Shapely ile doğrulandı. 0,025 derece toleranslı sadeleştirmede her geometrinin topolojisi korundu, halka yönleri RFC 7946 düzenine getirildi ve koordinatlar altı ondalığa yuvarlandı. Ardından geçerlilik yeniden kontrol edildi. Bu tolerans tarihsel hata payı değildir; farklı kayıtların ortak kenar topolojisi için ayrıca garanti verilmez. Otomatik geometri onarımı, tarih interpolasyonu veya modern ülke sınırlarıyla değiştirme yapılmadı.

Kaynakta eksi yıllar MÖ'dür ve iki uç dahildir. Atlas'ın astronomik yılına yalnız bir kez çevrilir; bitiş `[başlangıç, bitişHariç)` aralığına dönüştürülür. Kaynaktaki yıl sıfırı, başka bir aktarımda açıkça çözülene kadar reddedilir. Seçilen 12 kayıtta bu belirsizlik yoktur.

Derleme, önceden üretilmiş 166.424 baytlık yerel GeoJSON ile metadata eşleşmesini ve checksum'u doğrular. Üretim derlemesi 44 MB kaynak ZIP'ini indirmez; Python/Shapely uygulama çalışma zamanı bağımlılığı değildir. Yeniden aktarım için bağımlılıklar `scripts/requirements-ingest.txt` dosyasında sabittir. Tarayıcı alan verisini yalnız uygulamanın kendi adresinden alır.

Etiket noktaları geometri içinden hesaplanır; başkent veya yerleşim konumu anlamına gelmez. Küçük ekranda metin çakışmalarını azaltmak için etiketler yer değiştirebilir; kesik bağlantı çizgisi etiketin asıl konumunu gösterir. Coğrafi doğruluk alan geometrisine aittir.

## Doğrulama ve kalanlar

19 alan/veri testi ve statik demo üzerinde 13 Chromium senaryosu geçti. Yeni kontroller; BCE dahil uç dönüşümü, bağımsız kayıt dönemleri, paylaşım bağlantısı, kapsam dışı seçimin temizlenmesi, yerel veri yükleme, mobil detay ve mod geçişini kapsıyor. Kaynak geometrileri ve sadeleştirilmiş çıktı geçerli. Gerçek iPhone/Android, Safari/Firefox, bütün yıllar ve bütün dünya doğrulanmış değildir.

Son etiket düzeltmesinden sonra mobil etiketlerin görünürlüğü ve çakışmaması görsel olarak ve tarayıcı testiyle doğrulandı. Ana uygulamanın Node sunucu girişinde paylaşım, mobil seçim ve etiket yerleşimi olmak üzere üç hedefli senaryo geçti. Statik demodaki 13 senaryonun tamamı geçti; eşzamanlı tarayıcı çalıştırmasında ilk açılışın 5 saniyelik beklentisi bir kez zaman aşımına uğradı, aynı kontrol tek başına tekrar çalıştırıldığında geçti. Bu yerel kontrol gerçek cihaz performans ölçümü değildir. Her iki üretim derlemesi ve TypeScript kontrolü başarılı.

Sonraki iş: bu alt kümeye komşu dönemleri ve diğer bölgeleri kaynak incelemesiyle genişletmek; kayıt boşluklarını harita üzerinde daha kolay keşfedilir kılmak. Ayrıca zengin tarih anlatıları/görseller, ikinci arşiv perspektifi, güvenli kullanıcı/admin, PostGIS/API ve mobil uygulama bekliyor.
