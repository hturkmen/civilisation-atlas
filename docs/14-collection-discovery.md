# Genişleyen koleksiyon ve kaynaklı yıl keşfi

14 Eylül 2026. Önceki sürümün 6 siyasi yapı / 12 kayıt kapsamı, **17 siyasi yapı / 35 seçilmiş kaynak kaydına** genişletildi. Bu sayılar bütün dünya tarihinin kapsandığı anlamına gelmez.

## Görünür değişiklikler

- MS 1500 durağında Osmanlı, Ming, Mali, Aztek Üçlü İttifakı ve İnka birlikte seçilebilir.
- Boş bir yılda harita, en yakın önceki ve sonraki **kaynaklı yıla** geçiş sunar. Örneğin MS 207 için MS 206 ve MS 387 önerilir; örnek durak olan 200/400'e yuvarlanmaz.
- Tarihsel dünya oynatması 100 yıl atlamak yerine seçilmiş koleksiyon duraklarında üçer saniye durur. Duraklar tarihsel olay veya devletin kuruluş/yıkılış tarihi değildir. Arşiv modu otomatik tura karışmaz; kendi tarihinden açılır.
- Koleksiyon sayıları veriden hesaplanır; kayıt eklenince eski sabit sayılar gösterilmez.
- İçe aktarma planı, üretilmiş metadata ve geometri derleme öncesinde karşılaştırılır. Eski çıktı ile yeni planın yanlışlıkla yayımlanması engellenir.

## Yeni seçilen siyasi yapılar

| Kaynak adı | Türkçe görünüm | Seçilmiş duraklar |
|---|---|---|
| Maurya Empire | Maurya İmparatorluğu | MÖ 250, MÖ 200 |
| Gupta Empire | Gupta İmparatorluğu | MS 400, MS 500 |
| Abbasid Caliphate | Abbâsî Halifeliği | MS 800, MS 900 |
| Byzantine Empire | Bizans İmparatorluğu | MS 1000, MS 1200 |
| Mongol Empire | Moğol İmparatorluğu | MS 1250 |
| Mali Empire | Mali İmparatorluğu | MS 1325, MS 1500 |
| Ming Dynasty | Ming Hanedanı | MS 1453, MS 1500, MS 1600 |
| Aztec Triple Alliance | Aztek Üçlü İttifakı | MS 1453, MS 1500 |
| Inca Empire | İnka İmparatorluğu | MS 1453, MS 1500 |
| Khmer Empire | Kmer İmparatorluğu | MS 1000, MS 1200, MS 1453 |
| Ghana Empire | Gana İmparatorluğu | MS 1000 |

Osmanlı için MS 1500 kaydı da eklendi; önceki 12 kayıt korunur. Her örneğin gerçek kaynak aralığı, sıfır tabanlı kaynak satırı ve kaynak kimlikleri `data/boundary-collection.json` içinde, seçimler `data/boundary-import.json` içinde tutulur. Örneğin İnka MS 1500 görünümü kaynağın MS 1497–1533 kaydına dayanır; bunlar İnka'nın yaşam süresi olarak sunulmaz.

## Kaynak ve teknik sınırlar

[Sabit Cliopatria kaynağı](https://github.com/Seshat-Global-History-Databank/cliopatria/tree/ad28a691b7c07c1fca89d0e0636d324667d2a258), v0.2.0 ve CC BY 4.0 koşulları değişmedi. Arşiv yeniden indirilip önceki SHA-256 ile doğrulandı. [İlk kaynak incelemesinin](13-sourced-boundaries.md) belirsizlikleri ve atıfları geçerlidir. Kaynak veri, seçilmiş satırlar ve lisans kayıtları okunmuştur; bağımsız tarihçi incelemesi yapılmış gibi değerlendirilmez.

35 kaydın kaynak ve sadeleştirilmiş geometrileri Shapely ile geçerli bulundu. Otomatik onarım veya dönem interpolasyonu yapılmadı. Yeni GeoJSON 317.270 bayttır; bütün kaynağın 44 MB arşivi tarayıcıya gönderilmez. Kaynak dönem boşlukları korunur. Döneme göre örtüşen sınırların bağımsız tarihsel değerlendirmesi hâlâ gereklidir.

Bu ortamda Python paketlerinin normal kurulumu I/O hatası verdi. Aynı sabit sürümlerin wheel arşivleri indirilip yalnız geçici içe aktarma ortamına açılarak işlem tamamlandı; proje bağımlılıkları veya derleme altyapısı değiştirilmedi.

## Doğrulama

15 Eylül tamamlanan doğrulama:

- 23 alan/veri testi; içe aktarma planı, metadata ve geometri doğrulaması geçti.
- Statik demo ve ana Node uygulamasının üretim derlemeleri / TypeScript kontrolleri geçti. Plan doğrulayıcısı 45 görev, 8 alt proje, 28 API beyanı ve 31 şemayı kontrol etti; bu, çalışan API testi değildir.
- Statik demodaki 17 Chromium senaryosunun 16'sı toplu çalışmada geçti. İlk soğuk harita açılışı 5 saniyelik beklemeyi aştı. Yazılım GPU'suyla çalışan işlev kontrolünün ilk hazır olma toleransı 15 saniyeye çıkarıldı; yalnız bu senaryo tekrar çalıştırılarak geçti. Böylece 17 senaryo doğrulandı; tek bir temiz toplu koşum veya üretim hız ölçümü yapıldığı iddia edilmez.
- Ana Node girişindeki dört yeni hedefli senaryo geçti: MS 1500'de beş alan / Türkçe arama / seçim ve paylaşılan görünüm; MS 207 için gerçek kaynak aralığı uçları ve eski seçimin temizlenmesi; üç saniyelik oynatma / duraklatma / elle tarih değişimi; 360 px boş yıl kısayolları.
- 1440×1000 MS 1500 görünümü ve 360×800 MS 1700 görünümü ekran görüntülerinden incelendi. Beş alan etiketi ile mobil önceki/sonraki yıl kartları okunabilir ve erişilebilir bulundu.

Kontroller yerel üretim derlemelerinde yapıldı. Fiziksel cihaz, Safari/Firefox, tarihçi değerlendirmesi ve canlı Site tarayıcı testi yapılmadı. Gerçek yayın sonucu devam kaydına eklenir.

## Sonraki somut iş

Seçili siyasi yapının başka dönemlerini genel aramadan bulmayı kolaylaştırmak ve kaynaklı kısa anlatıları detay ekranına eklemek. İkinci arşiv perspektifi, daha yoğun dönem/geometri kapsamı ve gerçek cihaz incelemesi bekliyor. Hesap/admin için sağlayıcı, veri bölgesi ve bütçe kararı olmadan dış hizmet taahhüdü veya istemciye dayalı sahte yetkilendirme eklenmez.
