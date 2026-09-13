# İlk web koleksiyonunun kaynakları

`preview-collection.json`, çalışan arayüz için üç yerleşimlik başlangıç koleksiyonudur. `sources.json` ise geniş ürün için önceki kaynak adayları sicilidir; bu iki dosya aynı yayın kapsamını temsil etmez.

Bağımsız tarihçi incelemesi tamamlanmadı. Dönem aralıkları, kaynağın odaklandığı bilgi için gezinme filtresidir; yerleşimin bütün yaşam süresi, bir devletin varlığı veya her yıl ayrı kanıt anlamına gelmez. Miras alanlarının modern referans noktaları kullanılır; modern koruma poligonları tarihsel sınır olarak kullanılmaz.

| Yerleşim | Dönem dayanağı | Nokta dayanağı | Kaynak |
|---|---|---|---|
| Mohenjo-daro | Giriş açıklamasındaki MÖ 3. binyıl; uygarlığa verilen başka bir tarih aralığı kente aktarılmadı | N27 19 45 E68 8 20 | [UNESCO 138](https://whc.unesco.org/en/list/138/) |
| Caral-Supe | Integrity and Authenticity bölümündeki radyokarbon analizleriyle ilişkili MÖ 3000–1800 | S10 53 30 W77 31 17 | [UNESCO 1269](https://whc.unesco.org/en/list/1269/) |
| Büyük Zimbabve | Brief synthesis bölümündeki MS 1100–1450 yapılaşma dönemi | S20 16 16.212 E30 55 59.768 | [UNESCO 364](https://whc.unesco.org/en/list/364/) |

Kaynaklara erişim: 12 Eylül 2026. Metinler UNESCO World Heritage Centre açıklamalarının Türkçe kısaltma ve uyarlamalarıdır; uyarlayan Civilisation Atlas. Uyarlanmış açıklamalar [CC BY-SA 3.0 IGO](https://creativecommons.org/licenses/by-sa/3.0/igo/) ile sunulur. Orijinal metinler yukarıdaki sayfalardadır; metin değiştirilmiş ve kısaltılmıştır. Fotoğraf, logo ve video kullanılmadı; UNESCO onayı ima edilmez. Konumlar ve tarihler sayfalardaki olgusal değerlerden türetilmiştir.

Konum dönüşümü: derece + dakika/60 + saniye/3600; güney/batı negatiftir. GeoJSON sırası `[boylam, enlem]` olarak korunur. Dönüşümler testte yeniden hesaplanır. Tarih filtresi astronomik yıllarla yarı açık aralık kullanır: MÖ 1 = 0. Yaklaşık bitiş yılları dahil edilip `endExclusive` sonraki iç yıla ayarlanır; bu teknik seçim tarihsel kesinlik yaratmaz. MÖ 3. binyıl filtresi MÖ 3000–2001 olarak kodlanır.

## Harita zemini

- Kaynak: [Natural Earth, 1:110m Land](https://www.naturalearthdata.com/downloads/110m-physical-vectors/110m-land/).
- Kullanım: [public domain](https://www.naturalearthdata.com/about/terms-of-use/).
- Kaynak dosya: [değişmez Git commit'indeki GeoJSON](https://github.com/nvkelso/natural-earth-vector/blob/693f11422f4e08d2da4566b854dda53eb7c39fb3/geojson/ne_110m_land.geojson).
- Uygulama kopyası: [land.geojson](../apps/web/public/data/land.geojson), 138.160 bayt.
- SHA-256: `9e0729ee253ca7d7a5c4ae9395fb1902264c5377c52e224d13dd85010e2835d9`.
- İndirilen JSON içeriği değişmez kaynak commit'iyle karşılaştırıldı; eşleşti. Dosya değiştirilmedi.

Zemin modern coğrafi referanstır. Antik kıyılar, tarihsel nehir yatakları, siyasi sınırlar ve modern ülke etiketleri içerik katmanı olarak sunulmaz. Ölçek ayrıntısı sınırlı olduğundan yakınlaştırma 6 ile sınırlandırıldı. Enlem-boylam ızgarası matematiksel olarak uygulama kodunda üretilir.
