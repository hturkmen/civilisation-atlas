# Devir — Ortelius 1570 ve eser seçicisi / 19 Eylül 2026

## Sonuç
Main kaynak: 2e1a4c7dbe7d4512595cdf5621f856e2cb17242d.
Demo kaynak: 43d7c36524a95756560c7c56985784b3d7e252d9.
V12: appgprj_6aa638d93f3c819188b55444e79f992a~appgver_ca4012e81ec881918abfd50337b67d95
Dağıtım: appgdep_6aadf4cf52d88191b6a108dda9998451, succeeded, 2026-09-19T02:35:12.726305+00:00.
URL: https://civilisation-atlas-hturkmen.halilturkmen.chatgpt.site. Özel erişim ve Node/statik giriş ayrımı korundu.

Bilinen dünya görünümünde 1507 Waldseemüller ve 1570 Ortelius seçilebilir. Native select klavye/mobil kullanımına uygundur. Seçim mevcut tarih URL'sini günceller; zoom sıfırlanır. 1569/1571 boşluğu doldurulmaz. Eser bilgisi tarihle aynı kalır. Baş harfler, başlık, baskı etiketi ve atıf artık yalnız Waldseemüller'e sabit değil. Ana tarihsel sınır koleksiyonu değişmedi.

## Kaynak ve sınırlama
https://commons.wikimedia.org/wiki/File:OrteliusWorldMap1570.jpg
Summary / Licensing / File history bölümleri 2026-09-19 tarihinde okundu. Kamu malı/PD-Art işaretli. Kaydın LOC kaynak atfı korunur; eski memory.loc.gov bağlantısı 404, modern resource denemesi de okunamadı. Kurum kaydının doğrudan kontrol edildiği iddia edilmez; görünür sourceLocator bu sınırı taşır. Bağımsız tarihçi incelemesi yok. Aynı Avrupa haritacılık bağlamındaki iki yazar, iki farklı toplumun dünya bilgisi olarak sunulmaz.
Görsel: https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e2/OrteliusWorldMap1570.jpg/3840px-OrteliusWorldMap1570.jpg
3840×2615; 4.197.699 bayt; SHA-256 3839507553c7aeef28bc2ceb8747ef509a171d651993c443bba5530fc2f38c0c.
İndirilen resim gözle incelendi. Yeni çizim/georeference/geometri yok. Var olan hazırlama betiği resmi kendi sunucusundan servis etmek için indirip hash doğrular. İndirme host listesi/TLS/boyut/hash koşulları değiştirilmedi.

## Kontrol
- node --test packages/domain/test/archive.test.mjs: 3/3.
- node scripts/prepare-archive-assets.mjs: iki yerel dosyanın hash kontrolü başarılı.
- Statik Sites build/TypeScript ve prebuild sınır validator: başarılı.
- archive-selector.spec.ts: 2/2 Chromium, masaüstünde seç/değiştir/zoom/reload/mode/geçersiz yıl ve 360×800 mobil taşma.
- Snapshot nedeniyle kesik Chromium ikilisi mevcut Brotli arşivinden test öncesi geri açıldı; uygulama/test değişikliği gerekmedi.
- git diff --check: geçti.
- Tam domain/browser zinciri, Node build, fiziksel cihaz, Safari/Firefox çalıştırılmadı. Canlı Site'da ilave tarayıcı testi yapılmadı; yayın servis sonucu succeeded.
- UI selector yıl tabanlıdır; aynı yılda birden çok eser eklenmeden önce view/URL'ye eser kimliği eklenmeli. Bugünkü iki eserin tarihleri ayrı.

## Tek sonraki iş
1400–1750 İngiltere/İspanya ve koloni kayıtlarını sabit Cliopatria kaynağından kimlik, dönem, hak ve geometri tutarlılığıyla genişlet; mevcut 389 kaydı yeniden üretme işi olarak başa dönme. Üretilmiş GeoJSON elle düzenlenmez.
10 anlatı ve ikinci eser dilimini yeniden yapma. Sağlayıcı/auth/admin/bağımsız inceleme/üretim DB ve genel ürün kapsamı açık. Kullanıcı hız tercihi doğrultusunda değişen yüzeye yönelik kontrollerle ilerle.
