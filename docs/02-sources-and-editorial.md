# Kaynak, lisans ve editoryal doğruluk

Kontrol tarihi: 12 Eylül 2026. Aşağıdaki tablo sağlayıcıların o gün erişilen resmi açıklamalarını özetler. Lisansın açık olması tarihsel doğruluğun kanıtı değildir.

## Kaynak adayları

| Kaynak | Kullanım adayı | Doğrulanan durum / sınır |
|---|---|---|
| [OpenHistoricalMap](https://www.openhistoricalmap.org/copyright) | Tarihli coğrafi nesneler | Genel olarak CC0; nesne bazında CC BY / CC BY-SA istisnaları var. Her nesnenin lisansı ve kökeni incelenmeli |
| [Pleiades](https://pleiades.stoa.org/) | Antik yer isimleri, konumlar, kimlik bağlantıları | Ana sayfa CC BY bildiriyor. Kullanılacak indirme sürümünün lisans sürümü ayrıca doğrulanacak. Eksiksiz imparatorluk sınırları kaynağı olarak kabul edilmez |
| [Seshat kullanıcı sözleşmesi](https://seshat-db.com/terms/current/) | Siyasi yapılar ve kaynaklı tarihsel değişkenler | Public Data için CC BY-SA 4.0; indirmede hesap/koşul kabulü gerekiyor. Private Data yeniden yayınlanamaz |
| [Natural Earth](https://www.naturalearthdata.com/about/terms-of-use/) | Genel coğrafi zemin ve ölçeğe uygun modern katman | Veri kamu malı. Tarihsel siyasi sınırların kanıtı olarak kullanılamaz |
| [Wikidata lisansı](https://www.wikidata.org/wiki/Wikidata:Licensing) | Harici kimlikler, adlandırmalar ve referans keşfi | Ana/property/lexeme ad alanlarındaki yapılandırılmış veri CC0. Diğer metin/görsellerin lisansı ayrı değerlendirilir |
| Müze, üniversite ve milli kütüphane koleksiyonları | Dönemin bilinen dünyası eserleri, bilimsel yeniden kurmalar | Her eser için hak durumu, tarih ve kullanım koşulu ayrıca doğrulanacak. Bu turda herhangi bir tarama kullanım için onaylanmadı |

OpenHistoricalMap, Pleiades ve Seshat birbirinin yerine geçmez. Bir yerin koordinatı bir imparatorluğun sınırını; bir metindeki toprak büyüklüğü ise poligon geometrisini kanıtlamaz.

Bu araştırmada MÖ 4000–günümüz için kesintisiz ve her yıl küresel sınırlar veren, kaynakları ve ticari yeniden kullanım hakkı doğrulanmış tek bir veri seti saptanmadı. Bu, böyle bir kaynağın kesinlikle bulunmadığı iddiası değildir.

## Kaynak kaydı

Her kaynak için: kurum/yazar, başlık, URL veya DOI/ISBN, basım tarihi, erişim tarihi, dil, kaynak türü, lisans adı/sürümü/URL'si, zorunlu atıf, izin durumu, kullanım kapsamı ve checksum/sürüm tutulur.

İçeriği indirme izni yoksa bibliyografik kayıt ve gerekli kısa özgün özet tutulur; kitabın veya ücretli makalenin tamamı uygulamaya yüklenmez. Arşivleme hakkı doğrulanmadıysa kaynak kopyasının saklanacağı varsayılmaz.

İddia/geometri bağlantısında ayrıca sayfa, şekil veya harita numarası; kaynakta söylenen ile editörün çıkardığı sonuç; destek/çelişki ilişkisi; döneme uygunluk ve inceleme gerekçesi bulunur.

## Kanıt sınıfları

- Doğrudan belgeleme: kaynak nesneyi veya durumu açıkça tarif eder.
- Bilimsel yeniden kurma: bir çalışma birden fazla kanıttan çıkarım yapmıştır.
- Editoryal yaklaşık gösterim: eğitim amacıyla sınırlandırılmış temsil; yöntemi açık ve incelemeye tabidir.
- Tartışmalı: birden fazla destekli yorum korunur.
- Bilinmiyor: sonuç üretmeye yeterli kanıt yoktur.

“Yüksek / orta / düşük” kullanılacaksa gerekçeli değerlendirme ölçeği tanımlanır. Yüzde doğruluk veya AI'nın kendi güven puanı gösterilmez. Kullanıcı metni tercihen “yaklaşık sınır”, “tarihi tartışmalı”, “kaynaklı yeniden kurma” şeklindedir.

## Yayın süreci

1. Kaynak kaydı → kullanım hakkı kontrolü.
2. İddia, tarih ve geometri taslağı; özgün ifade korunur.
3. Otomatik geometri/zaman/yetim kaynak/boyut kontrolleri.
4. İnceleyen, tarihsel dayanağı ve kullanım hakkını değerlendirir.
5. Taslakların belirli revizyonları bir yayın adayına alınır.
6. Worker yalnız izinli kamu alanlarını dışa aktarır; manifest, döşeme ve metinler doğrulanır.
7. Manifestin checksum'ı doğrulanıp etkin yayın işaretçisi atomik olarak değiştirilir.
8. Yayın kimliği, inceleyen, iş kimliği ve değişiklik nedeni denetim kaydına yazılır.

Kaynak bağlantısının mevcut olması yeterli değildir; iddiayı gerçekten desteklemesi gerekir. Tek kişi geliştiriyorsa teknik admin olabilir fakat kendi metnini “bağımsız uzman tarafından incelendi” diye etiketleyemez. İnceleme kapasitesi, beta yayınını etkileyen açık karardır.

## Dönemin bilinen dünyası

Bakış açısı varlığı ayrı tutulur. En az şu alanlar gerekir:

- İlişkili kişi/toplum/harita geleneği; bilinmiyorsa bu durum.
- Tasvir edilen bilginin zamanı ve belirsizlik aralığı.
- Fiziksel eserin hazırlanma veya eldeki kopyanın tarihi.
- Kaynak nüsha, kurum, koleksiyon ve katalog kimliği.
- Orijinal eser, sonraki kopya veya modern bilimsel yeniden kurma ayrımı.
- Hak durumu; görselin çözünürlük/yeniden dağıtım kısıtları.
- Koordinatlandırma yöntemi ve hata açıklaması, yapılmışsa kontrol noktaları.

Şematik veya kozmolojik bir harita zorla gerçek dünya koordinatlarına oturtulmaz. Bu durumda ayrı görsel inceleyicide sunulur. “Bu alanı biliyorlardı” maskesi ancak bunu destekleyen kaynaklı bir yorum varsa çizilir. MÖ 4000 için veri bulunmaması normal bir ürün durumudur.

## Küresel kapsama ve tarafsızlık

Kapsama matrisi bölge × dönem × katman şeklindedir. Durumlar: henüz taranmadı, inceleme sürüyor, sınırlı veri var, incelendi fakat kullanılabilir kanıt bulunamadı. “İnsan yaşamıyordu” ayrı bir bilimsel iddiadır ve kaynak gerektirir.

Avrupa/Akdeniz verisinin daha kolay bulunması küresel tamamlanmışlık gibi sunulmaz. Yerel isimler ve farklı dilde kaynaklar korunur. Günümüzde tartışmalı alanlarda siyasi iddia, fiili kontrol ve tercih edilen harita sunumu ayrı kayıt edilir.

## AI kullanımı

AI'ya verilen içerik güvenilmeyen veri kabul edilir; metindeki talimatlar yürütülmez. AI dış bağlantıdan aldığı iddiayı otomatik onaylayamaz, rol değiştiremez veya veri yayınlayamaz. Taslaklar kullanılan kaynak kimliklerini ve düzenleme geçmişini taşır. Model adı ve işlem maliyeti editoryal kayıtta tutulabilir; bunlar akademik doğrulama değildir.

## İlk kaynak denemesinin çıktıları

20–30 varlığa geçmeden önce üç ayrı dönem/bölgeden küçük örnekler: izinli bir geometri, yaklaşık tarihli bir kayıt, örtüşen iki yorum ve en az bir bakış açısı eseri. Her birinin işleme süresi, hak durumu ve yayımlanabilirliği ölçülür. Başarısız örnekler de nedenleriyle kaydedilir.
