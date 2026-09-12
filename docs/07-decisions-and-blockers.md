# Kararlar ve engeller

## Kullanıcı tarafından kesinleşen

- MÖ 4000'den günümüze dünya medeniyetlerini haritada gezme.
- Kaynak gösterilebilir doğruluk, kolay ve etkileyici UX.
- Admin ve kullanıcı altyapısı; web sonrası uygulama.
- GitHub sahibi hturkmen.
- İki ayrı harita görünümü: tarihsel dünya ve dönemin bilinen dünyası.
- Gereksiz adım atmama; belirsizliği uydurmama; güvenliği ve bozucu değişiklikleri bildirme.

## Çalışmayı ilerletmek için seçilen, değiştirilebilir öneriler

- Repo çalışma adı civilisation-atlas. İlk öneri private idi; kullanıcının oluşturup paylaştığı repo public olarak doğrulandı ve bu durum kullanıcıya bildirildi.
- “Low level projeler”: tek repo içinde bağımlılıkları ve kabul kriterleri olan alt projeler/görevler.
- İlk arayüz Türkçe; tüm alanlarda dil desteğine uygun şema. İngilizce çeviri ikinci içerik çalışması olabilir.
- Modüler monolit, Next.js/TypeScript, MapLibre, PostgreSQL/PostGIS.
- Auth/veri servisleri için Supabase ilk aday; hosting ve bölge satın alma öncesi seçilir.
- İlk ürün ücretsiz keşif akışı; ödeme/abonelik henüz kapsamda değil.
- Çalışan siteyi bu planlama turunda üretmek veya canlıya almak yerine geliştirme temelini hazırlama.

Bu öneriler kullanıcı onayı verilmiş seçimler gibi işaretlenmez. Geri döndürülebilir planlama tercihleridir.

## Açık kararlar ve hangi adımı etkiledikleri

| Konu | Neden sorulmalı? | Ne zaman gerekir? |
|---|---|---|
| Tarihsel incelemeyi kim yapacak? | Bağımsız inceleme iddiası, içerik hızı ve güven | P02 kaynak denemesi sonunda, gerçek içerik beta yayını öncesi |
| Ticari kullanım planı | Lisans karışımı, içerik iş modeli ve altyapı paketi | Veri lisansı/ücretli sağlayıcı taahhüdü öncesi |
| Aylık bütçe ve ayırabileceğin süre | Sağlayıcı ve takvim tahminini değiştirir | P01 kurulum ve sprint takvimi öncesi |
| İlk beta içerik koleksiyonu | Lisansı ve kanıtı bulunan örneklerden seçilmeli | Kaynak denemesi sonunda somut adaylarla |
| İlk sürümün Türkçe/İngilizce kapsamı | Editoryal iş yükü ve arama | İlk gerçek içerik girişinden önce |

## GitHub erişimi — engel çözüldü

Bağlı GitHub hesabı hturkmen. Kullanıcı https://github.com/hturkmen/civilisation-atlas.git adresini paylaştı; repo boş, varsayılan dal main ve yazma erişimi mevcut olarak doğrulandı.

Görünürlük public; dosya aktarımından önce kullanıcıya açıkça bildirildi. Görünürlük değiştirilmedi. Başlangıç paketinde erişim anahtarı veya gerçek kullanıcı verisi bulunmuyor.

Önceki turdaki yeni repo oluşturma yeteneği eksikliği, kullanıcının repoyu oluşturmasıyla giderildi. Paket ve görevlerin aktarımı mevcut dosyaları ezmeden yapılır. GitHub Projects panosu bu aktarımın parçası değildir.
