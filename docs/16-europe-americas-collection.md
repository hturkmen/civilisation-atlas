# Avrupa ve Amerika kaynak dilimi — 18 Eylül 2026

164 yeni kayıt: toplam 28 siyasi yapı / 389 alan. Önceki 225 metadata ve geometri kaydı birebir korunur. Üç yerleşim, tek arşiv ve beş unreviewed Gate A adayı değişmedi.

| Siyasi yapı | Yeni kayıt | Toplam |
|---|---:|---:|
| Fransa Krallığı | 61 | 61 |
| Portekiz Krallığı | 21 | 21 |
| Venedik Cumhuriyeti | 36 | 36 |
| Yeni Fransa (Fransız kolonisi) | 30 | 30 |
| Aztek Üçlü İttifakı | 10 | 12 |
| İnka İmparatorluğu | 6 | 8 |

1500 yılında 11, 1700'de 10, 1750'de 9 alan görünür. Bu sayılar dünya üzerindeki bütün siyasi yapıların sayısı değildir.

## Kaynak seçimi ve yorum sınırı

[Cliopatria sabit sürüm](https://github.com/Seshat-Global-History-Databank/cliopatria/tree/ad28a691b7c07c1fca89d0e0636d324667d2a258), v0.2.0 ve [CC BY 4.0 lisansı](https://github.com/Seshat-Global-History-Databank/cliopatria/blob/ad28a691b7c07c1fca89d0e0636d324667d2a258/LICENSE.md) korunur. Arşiv SHA-256 d01ae3a20d358cc5d54f69d9d725d390767d9c8759ac89ad6f90c58d106f3370 yeniden doğrulandı. Altı siyasi yapının 1400–1750 ile kesişen tüm POLITY kaynak aralıkları seçildi; eski örnek yıllar korunarak yeni aralık başlangıçları gezinme örneği oldu. Kaynak aralıkları kırpılmaz, kuruluş/yıkılış tarihleri veya her yılın bağımsız gözlemleri olarak sunulmaz.

Kaynağın parantezli `(Kingdom of France)` ve `(Portuguese Empire)` gibi birleşik kayıtları alınmadı. `Components` alanı boş olan `Kingdom of France`, `Kingdom of Portugal`, `Republic of Venice`, `New France`, `Aztec Triple Alliance`, `Inca Empire` kayıtları seçildi. Fransa ve koloniyi içeren üst toplam alanı bunlarla birlikte tekrar yayımlamıyoruz. Kaynakta New France kayıtlarının tümü `MemberOf: (Kingdom of France)` taşır; Türkçe etiket bu nedenle açıkça koloniyi belirtir. Yeni Fransa ayrı bağımsız devlet ilan edilmez. Ortak dönemli 34 Fransa/Yeni Fransa kaynak geometri çiftinin kesişim alanı sıfır bulundu. Bu dar kontrol, bütün devletler arasında uyuşmazlık veya örtüşme bulunmadığı garantisi değildir.

İngiltere, İspanya, Portekiz imparatorluk/sömürge toplamları ve diğer Amerika kolonileri bu dilime alınmadı. Örneğin kaynaktaki New Netherland kimliği 1780'e uzanan bir satır içeriyor; adın hangi bölgeyi anlattığı ve tarih dayanağı incelenmeden eklenmedi. Kaynağın aralıkları modern tarihsel adlarla kendiliğinden eşitlenmez. Bağımsız tarihçi onayı yoktur; editoryal yayın kapısı ve unreviewed adaylar değiştirilmedi.

## Teknik doğrulama

Sabit importer, 389 kaynak ve sadeleştirilmiş geometriyi geçerli buldu. Onarım, interpolasyon veya elle GeoJSON düzenleme yapılmadı. Önceki 225 kayıt/geometri birebir korundu. Ham GeoJSON 2.884.759 bayt; önceki dilim 2.191.384 bayttı. Daha geniş veri için gerçek mobil ağ/GPU performansı ölçülmeli; bu dilim tile mimarisi getirmez.

54/54 ana depo domain testi, editoryal kaynak/revizyon doğrulaması, sınır validator ve demo build/TypeScript geçti. Yeni Fransa/Fransa ayrımı, koloninin etiketi, kaynak bağlantısı ve paylaşılan seçimin reload sonrası korunması için tarayıcı testi eklendi. Son E2E ve yayın sonucu devam kaydında tutulur. Ana Node build, gerçek cihaz/Safari/Firefox ve tarihçi incelemesi bu dilimde yapılmadı.

## Sonraki adım

Veri büyümesinden sonra P04-005 mobil büyük metin/klavye kabulündeki açıkları ve P04-006 ölçüm ihtiyacını değerlendir. Sonraki veri dilimi için İngiltere/İspanya/koloni kayıtlarının tarih ve kimlik sorularını kaynak düzeyinde çöz; bu kayıtları sadece sayıyı artırmak için ekleme.
