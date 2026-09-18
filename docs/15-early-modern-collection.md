# 1400–1750 kaynaklı veri genişletmesi — 18 Eylül 2026

190 yeni kayıt eklendi: toplam 24 siyasi yapı / 225 alan kaydı. Önceki 35 kaydın metadata ve geometrileri birebir korunur. Üç yerleşim ve tek arşiv eseri değişmedi.

| Siyasi yapı | Eklenen kayıt | Koleksiyondaki toplam |
|---|---:|---:|
| Osmanlı İmparatorluğu | 59 | 64 |
| Ming Hanedanı | 23 | 26 |
| Babür İmparatorluğu | 35 | 35 |
| Qing Hanedanı | 19 | 19 |
| Safevî Hanedanı | 30 | 30 |
| Songhay İmparatorluğu | 8 | 8 |
| Kongo Krallığı | 3 | 3 |
| Tokugawa Şogunluğu | 3 | 3 |
| Etiyopya İmparatorluğu | 10 | 10 |

## Kaynak ve sınırlar

[Cliopatria v0.2.0 sabit kaynak](https://github.com/Seshat-Global-History-Databank/cliopatria/tree/ad28a691b7c07c1fca89d0e0636d324667d2a258), [aynı sürümün CC BY 4.0 lisansı](https://github.com/Seshat-Global-History-Databank/cliopatria/blob/ad28a691b7c07c1fca89d0e0636d324667d2a258/LICENSE.md). Lisans kaydı yeniden okundu; arşiv yeniden indirilip kayıtlı d01ae3a20d358cc5d54f69d9d725d390767d9c8759ac89ad6f90c58d106f3370 SHA-256 değeriyle doğrulandı. Yerel eski arşiv eksikti ve kullanılmadı.

Tablodaki dokuz siyasi yapı için 1400–1750 ile kesişen bütün POLITY kaynak aralıkları seçildi. Önceden seçilmiş örnek yıllar korundu; yeni aralıklar için max(1400, kaynak başlangıcı) örnek yıl olarak kullanıldı. Örnek yıl tarihsel olay değildir. Kaynak aralıkları kırpılmadığı için bazı kayıtlar 1400 öncesini veya 1750 sonrasını da gösterir. Yeni bir geometri çizilmedi, yıl interpolasyonu ve geometri onarımı yapılmadı. Belirsizlik ve atıf açıklamaları arayüzde korunur.

Bu veri yayımlayıcısının tarihsel yorumudur; bağımsız tarihçi onayı değildir. Gate A adayları unreviewed kalır; editoryal yayın kapısından geçen aday sayısı sıfırdır. Bu çalışma mevcut kaynaklı demo katmanını genişletir, editoryal beta kabulü sağlamaz. Avrupa'nın diğer devletleri, Amerika'daki sonraki dönemler ve daha geniş dünya kapsamı eksiktir.

## Doğrulama ve performans sınırı

225 kaynak ve sadeleştirilmiş geometri Shapely 2.1.2 ile geçerli bulundu. Aynı sabit importer kullanıldı; seçim yalnız data/boundary-import.json üzerinden değiştirildi. Ham GeoJSON 2.191.384 bayt (önceden 317.270); tarayıcıya giden veri yaklaşık yedi kat büyüdü. Yerel yazılım GPU testleri geçti; gerçek telefon/bağlantı performansı henüz ölçülmedi. Daha fazla büyümede bbox/tile bütçesi değerlendirilmelidir.

Ana depo domain testleri, editoryal revizyon pinleri, sınır validator ve plan kontrolü geçti. Demo build/TypeScript geçti. 24/24 Chromium senaryosu temiz toplu koşumda geçti. İlk koşudaki iki arşiv testi aynı yılın tarihsel alan ve arşiv duraklarını ayırmayan locator nedeniyle başarısızdı; locator arşiv düğmesinin tam adına daraltıldı, iki modun ayrımı korundu. Eski 1700 boş-yıl testi artık veri bulunduğu için gerçek boş yıl 207'ye taşındı; aynı önceki/sonraki kaynak yılı davranışı korunarak doğrulandı. 1700/1750 yeni kayıtları ve her kaydın bitişHariç sınırı ayrıca test edilir.

Ana Node build, gerçek telefon/Safari/Firefox ve tarihçi değerlendirmesi bu dilimde yapılmadı. Yayın sonucu ve kesin commit docs/12-continuation.md güncel devir noktasına yazılır.

## Sonraki dilim

1400–1750 Avrupa ve Amerika kapsamını kaynak isimleri/koloni-ana devlet ilişkileri ve olası örtüşmeler açısından incele. Yalnız doğrulanmış, tekrarsız kayıtlarla genişlet; 225 kaydı tekrar içeri alma. Ardından P04-005 kalan cihaz/erişilebilirlik işlerine dön.
