# İlk çalışan web dilimi — 12 Eylül 2026

Kullanıcının “Devam et” yönlendirmesiyle plan ve GitHub görevlerinin ardından ilk çalışan atlas arayüzü geliştirildi. Bu sürüm geniş ürünün tamamlanmış betası değildir.

## Çalışan özellikler

| Alan | Gerçek durum |
|---|---|
| Uygulama temeli | npm workspaces, Next.js 16.3.5, React 19.3.0, TypeScript 5.9.3; sabit sürümler ve lockfile |
| Harita | MapLibre 6.9.0; yerel Natural Earth kara verisi, modern siyasi etiket olmadan pan/zoom |
| Tarih | MÖ 4000–sunucudaki güncel yıl; doğrudan yıl/era girişi, slider, 100 yıl/sn oynatma |
| İçerik | Üç kaynaklı yerleşim; dönem ve coğrafya kapsamı açıkça sınırlı |
| Seçim | Harita ve klavye erişimli liste; kaynaklı detay, dönem ve konum notları |
| Arama | Türkçe karakterler ve alternatif isimler; seçili dönemle sınırlı |
| Bağlantılar | MÖ/MS görünür URL parametreleri, seçili yerleşim ve mod; kopyalama ve geri yükleme |
| Bilinen dünya | Ayrı görünüm ve açık boş durum; doğrulanmış eser eklenmedi |
| Mobil | Mobilde harita → tarih → bilgi sırası; masaüstünde yan panel |
| Hata durumu | WebGL/zemin başarısızlığında listeden bilgiye erişim |
| Kaynak şeffaflığı | Metin, dönem ve konum için sourceId ve locator; atıf, lisans, erişim tarihi |

Kaynak koleksiyonu, üç kıtadan arayüz ve veri anlamı denemesi için seçildi. Kullanıcının nihai beta içerik seçimi olarak kabul edilmez. [Veri kaynakları](../data/README.md) ve [çalıştırma adımları](../apps/web/README.md) ayrı belgelenmiştir.

## Mimari sınır

Sayfa adaptörü → `src/lib/catalog.ts` preview repository → `@atlas/domain/catalog` ve chronology. İstemci yalnızca açık koleksiyonu alır. Üretim API'si ve release repository geldiğinde aynı arayüzün veri erişim sınırı değiştirilecek.

`packages/contracts/openapi.json` hâlâ tasarım sözleşmesidir. Üç kayıtta gereksiz HTTP fetch/cache/worker katmanı oluşturulmadı; uzak istek olmadığı için istek iptali veya dağıtık release tutarlılığı çözülmüş sayılmaz. Henüz tile servisi veya PostGIS yoktur.

## Açık riskler ve sonraki işler

1. **Tarihsel sınır ve kapsama riski:** dünyadaki ülkeler/medeniyetler henüz çizilmez. Geniş koleksiyon için P02 kanıt, lisans ve geometri denemesi; ardından P03 zamansal veri modeli/API gerekir. Kaynak yokluğu boş bırakılır.
2. **Tarihsel kesinlik riski:** geniş dönem açıklamaları yıllık sınır kanıtı değildir. Arayüzde yaklaşık dönem ve inceleme notu korunur. Bağımsız editoryal kontrol, kamuya beta yayını öncesi gereklidir.
3. **Güvenlik/kimlik:** mevcut uygulama yalnızca okur. Hesap, oturum, admin, kullanıcı rolleri/MFA, RLS ve audit henüz uygulanmadı. Bunlar test edilmeden yazma uç noktası açılmamalı. Şifre, token, service-role anahtarı repoya veya istemciye eklenmez.
4. **Dağıtım:** sağlayıcı/bölge/bütçe seçilmedi; canlıya dağıtım ve domain bağlantısı yapılmadı. HTTPS, nonce temelli CSP, oran sınırlama, gözlemleme, CI ve geri alma akışı dağıtım/kimlik diliminde kurulmalı. Mevcut HTTP başlıkları kapsamlı güvenlik onayı değildir.
5. **Altyapı değişikliği:** bu dilim mevcut bir veritabanını, hesabı veya çalışan üretim servisini değiştirmez. İlerideki migration'lar expand/contract ve geri alma planıyla ayrı incelenmeli.
6. **Ölçek:** üç DOM marker kasıtlı olarak küçük koleksiyona uygundur. Çok sayıda kayıt öncesinde kaynaklı vektör katmanları, etiket çakışmaları, LOD ve performans bütçesi uygulanmalı.
7. **Kullanılabilirlik:** otomatik tarayıcı kontrolleri, hedef kullanıcıyla yapılacak kullanılabilirlik testinin veya gerçek cihaz ölçümünün yerini tutmaz.

Önerilen sıradaki teknik dilim: CI kalite kapıları → kanıt/geometri denemesi → PostgreSQL/PostGIS veri modeli ve yayınlanmış veri okuma API'si. Gerçek kullanıcı/admin entegrasyonu için sağlayıcı ve veri bölgesi seçimi somutlaştırılmalı.
