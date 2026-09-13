# İlk canlı demo — 13 Eylül 2026

[Demoyu aç](https://civilisation-atlas-hturkmen.halilturkmen.chatgpt.site)

Demo proje sahibine özel olarak yayımlandı. Bağlantının çalışması, görüntüleyenin yetkili hesabıyla giriş yapmasını gerektirebilir. Bu, atlasın kendi kullanıcı/üyelik altyapısı değildir.

## Deneme akışı

1. MÖ 2500 görünümünde Mohenjo-daro veya Caral-Supe yerleşimini seç.
2. Bilgi panelinde kaynağı ve “Kanıt ve kullanım bilgisi” bölümünü aç.
3. Yerleşim listesine dönüp “Başka bir zamana git” bölümünden Büyük Zimbabve'yi seç; tarih MS 1300'e geçer.
4. Tarihi değiştir, yerleşim ara ve “Bu görünümü paylaş” ile tarih/seçim içeren bağlantıyı kopyala. Alıcının demo erişim yetkisi ayrıca gerekir.

## Gerçekte tamamlanan kapsam

- MÖ 4000'den günümüze tarih seçimi; MÖ/MS geçişinde görüntülenen yıl sıfırı yok.
- Hareket ettirilebilir ve yakınlaştırılabilir harita; üç yerleşim için seçim ve kaynak paneli.
- Arama, paylaşılan görünüm, mobil düzen ve WebGL açılamazsa liste üzerinden erişim.
- UNESCO kaynaklarına bağlı metin, dönem ve konum bilgileri; Natural Earth modern kıyı çizgileri.

Tarih aralığının seçilebilir olması, tüm yılların verilerinin bulunduğu anlamına gelmez. Ülke/medeniyet sınırları henüz eklenmedi. “Bilinen dünya” görünümünde yayımlanmış tarihî harita yok. Üyelik, admin, veritabanı/API ve mobil uygulama bekliyor. Koleksiyon bağımsız tarihçi incelemesini henüz tamamlamadı.

## Dağıtım ve doğrulama

Demo, ana deponun `cadcdb09f01932c6d3deb81e939d0dcbe0952f13` sürümünden hazırlanan ayrı bir statik dağıtım kopyasıdır. Harita, kronoloji, katalog ve arayüz bileşenleri aynıdır. URL parametrelerini başlangıçta tarayıcıda okuyan küçük bir giriş bileşeni ve statik çıktı ayarı eklendi. Ana GitHub uygulamasının sunucu yapılandırması korunur. Demo kaynak sürümü: `5d19b0641705d1ec3082d2242383b1f75bca4be8`.

Temiz bağımlılık kurulumu, üretim derlemesi ve TypeScript kontrolü başarılı. Statik çıktı üzerinde mevcut iki Chromium senaryosu geçti: yerel harita/worker ve kaynak paneli; paylaşılan bağlantı ve yıl değişiminde eski seçimin temizlenmesi. Ana web sürümünde daha önce 12 alan testi ve altı tarayıcı senaryosu geçmişti; bkz. [doğrulama kaydı](08-validation.md).

Yayın hizmeti dağıtımı başarılı olarak bildirdi. Canlı adresteki kullanıcı oturumu/erişim koşulları yerel tarayıcı testinin kapsamı dışındadır.

## Sonraki uygulama sırası

1. Sürüm kontrollü veri modeli, kaynak incelemesi ve yayın iş akışı.
2. Kullanıcı/rol altyapısı ve sunucuda yetkilendirilen admin işlemleri.
3. Lisansı ve tarih kapsamı doğrulanmış sınır verisi ile ilk tarihî harita koleksiyonu.
4. Üretim izleme, yedek/geri alma ve mobil uygulama hazırlığı.

Bu statik demo, gerçek kullanıcı veya admin verisi için sunucu yetkilendirmesi sağlamaz; bunlar eklenmeden önce ilgili altyapı uygulanıp doğrulanmalıdır.
