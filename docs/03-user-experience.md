# Kullanıcı deneyimi ve ekran sözleşmesi

## Görsel yön

Harita merkezli, çağdaş bir atlas: koyu lacivert deniz, okunabilir açık kara, seçili varlık için güçlü vurgu, ölçülü tipografi. Tarihsel görünüm etkisi için yapay yıpranmış kâğıt veya sahte eski harita kullanılmaz. Gerçek arşiv eseri ayrı görünümde kendi görsel kimliğini taşır.

İlk ekranın amacı keşiftir. Büyük tanıtım alanı, giriş zorunluluğu veya haritadan önce onboarding turu yoktur.

## Masaüstü

- Üst kontrol: “Tarihsel dünya / Dönemin bilinen dünyası”, varlık arama, hesap.
- Ana alan: harita, ölçek ve gerekli atıflar.
- Alt kontrol: MÖ/MS seçicisi, yıl, yakınlaştırılabilir zaman ekseni, önceki/sonraki belgelenmiş değişim.
- Sağ detay paneli: seçili varlığın o tarihteki adı, kısa özet, kanıt ve kaynak bağlantıları.
- Harita üzerinde sınırlı sayıda kontrol: yakınlaş/uzaklaş, başlangıç görünümü, katmanlar.

## Telefon

Harita açılışta görünür. Tarih girişi tek elle erişilir. Detaylar üç konumlu alt panelde açılır: özet, yarım ekran, tam ekran. Harita sürükleme ile panel sürükleme alanları ayrıdır. Güvenli ekran boşlukları ve ekrandaki klavye hesaba katılır.

Dokunma hedefi tasarım hedefi en az 44×44 CSS px'dir. Düzenli metin 16 px; ikincil bilgiler okunur ölçüde kalır. %200 metin büyütme ve 360 px ekran genişliği denenir.

## Tarih gezinmesi

Tarih kutusu MÖ 4000 ile veri manifestinin “bugün” üst sınırı arasındadır. MÖ 1'den sonraki yıl MS 1'dir; kullanıcıya 0 yılı gösterilmez.

Kaydırıcıda önizlenen tarih ile yüklenip gösterilen tarih ayrı state'tir. Yeni istek gelince eski istek iptal edilir; geç dönen yanıt geçerli görünümü değiştiremez. Yükleme sırasında “1453 yükleniyor” yazılır; 1452 geometrisi 1453 etiketiyle sunulmaz.

Kesin yıl girişi her zaman vardır. “Önceki/sonraki değişim” yalnız mevcut kaynaklı kayıtlardaki değişime gider; dünya tarihinde hiçbir başka olay olmadığı ima edilmez.

Oynatma açılışta kapalıdır. Sınırlar arasında görsel şekil dönüşümüyle hayali fetih hareketi üretilmez. İki kaynaklı durum arasında geçiş yapılır ve yaklaşık tarihler açıklanır.

## Katman ve seçim

| Katman | Görsel | Seçimde açıklama |
---|---|---|
| Siyasi kontrol | Kaynak çözünürlüğüne uygun sınır/dolgu | Kontrolün zamanı ve dayanağı |
| Egemenlik iddiası | Ayırt edilebilir tarama | İddia sahibi ve çelişen kayıt |
| Kültür/medeniyet alanı | Yumuşak veya taralı temsil | Bunun devlet sınırı olmadığı |
| Yerleşim | Nokta, ölçeğe göre etiket | Konum belirsizliği ve ad geçmişi |

Bir noktada birden fazla katman/yorum varsa aday listesi açılır. Üstte çizilen poligon otomatik olarak tarihsel açıdan daha doğru sayılmaz.

Varlık seçimi harita yakınlaştırılınca korunur. Tarih değişince varlığın kaydı bulunmazsa panel “Bu tarihte yayınlanmış kayıt yok” gösterir; “medeniyet yok oldu” sonucunu kendiliğinden üretmez.

## Detay paneli

1. O dönemdeki isim ve varsa alternatif/adlandırma açıklaması.
2. Seçili tarih ve varlık türü.
3. 80–150 kelimelik kaynaklı, anlaşılır özet.
4. Bu tarihe bağlı yönetim/başkent/kültür/önemli olay bilgileri; yalnız kanıt varsa.
5. Sınır ve tarih belirsizlikleri.
6. İddia bazlı kaynak açma; yazar, eser, sayfa, bağlantı, lisans.
7. Favori ve düzeltme önerisi.

Bir başkent, hükümdar veya nüfus bütün medeniyet ömrüne yayılmaz; kendi geçerlilik aralığıyla gelir. Sayı kaynakta bir aralık ise tek kesin sayıya çevrilmez.

## Dönemin bilinen dünyası

Mod seçildiğinde uygun bakış açısı listesi çıkar. Kullanıcı bir eser/yorum seçer; tasavvur ve kopya tarihleri birlikte görünür.

Koordinatlandırılabilir eser: ayrı katman, saydamlık kontrolü ve yöntem açıklaması. Koordinatlandırılamayan eser: ayrı görsel inceleme yüzeyi ve tarihsel açıklama. Kaynak yok: “Bu tarih için henüz kaynaklı bir görünüm yayınlanmadı.” Uygun en yakın örnek gösterilirse tarihi değiştirdiği açıkça belirtilir, sessizce tarih atlanmaz.

Bir sonraki sürümde iki görünümü yan yana karşılaştırmak düşünülebilir; ilk sürüm için iki bağımsız mod yeterlidir.

## URL ve oturum

Paylaşılabilir görünüm: tarih + era + mod + bakış açısı + harita merkezi/zoom + seçili varlık + veri sürümü. Kullanıcı kimliği, oturum anahtarı ve özel favori içeriği URL'ye girmez.

Eski bir paylaşımdaki yayın sürümü geri çekildiyse neden açıklanır ve güncel sürüme geçiş seçeneği verilir. Herhangi bir tarih uyumsuzluğu sessizce düzeltilmez.

## Erişilebilirlik ve hata durumları

- WebGL çalışmıyorsa tarih ve aramayla çalışan sonuç listesi; kaynağa erişim devam eder.
- Harita seçimlerinin eşdeğer liste görünümü vardır.
- Klavye odağı panel açılış/kapanışında yönetilir; odak haritada hapsolmaz.
- Yükleme, bağlantı kesilmesi, veri yokluğu ve yetki hatası farklı mesajlardır.
- Renk dışında sınır/desen/metin ile bilgi verilir.
- Hareket azaltma ve ekran okuyucu için tarih/sonuç bildirimleri aşırı tekrarlanmaz.
- Görsellerin açıklaması ve kaynak bilgisi görselin dışında da erişilir.

## Kullanılabilirlik denemesi

Beş kişiye görev: “MÖ bir yıl seç; bir bölgenin kimle ilişkili olduğunu incele; sınırın kesin olup olmadığını bul; dayandığı kaynağı aç; aynı dönem için başka bakış açısını kontrol et.” Tamamlama, yanlış yorumlama ve kaynak bulma süreleri kaydedilir. Başarı hedefleri HLD'dedir; bu turda kullanıcı testi yapılmadı.
