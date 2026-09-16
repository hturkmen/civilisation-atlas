# Dönemler arası koleksiyon araması — 16 Eylül 2026

Durum: ready_for_review; demo deployment_pending. Yazar: Codex. PR: [#49](https://github.com/hturkmen/civilisation-atlas/pull/49). Dal: `agent/codex/cross-period-search-20260915`.

Başlangıç main: `63305adc047ff466b5093b6d9fc57ddca7ae6502`. Görev sahipliği commit'i: `e073de0f7063f222be13300a455eb9e4db99f93f`. Ayrı çalışma alanı kullanıldı; başlangıçta açık başka PR yoktu. 15 Eylül taslak PR isteği kullanım limiti nedeniyle yürütülmedi; 16 Eylül tekrarında #49 açıldı.

## Uygulanan

- Mevcut yıldaki sonuçlar korundu. Diğer kaynak dönemleri siyasi yapı ID'siyle gruplanır; kayıtlar kronolojik gösterilir, aradaki boşluklar birleştirilmez.
- Kaynak dönemi ve örnek tarih ayrı etiketlidir. Sonuç seçimi yıl, tarihsel mod ve ayrıntıyı aynı işlemde günceller. Yerleşimler ad/kültür/bölge/alias ile; siyasi yapılar Türkçe ve kaynak adıyla aranır.
- Türkçe normalizasyon, boşluk temizliği, Escape ve temizleme sonrası arama odağı; mevcut detay odağı ve paylaşılabilir URL akışı korundu.
- Yeni geometri/tarih/lisans veya editoryal yayın yok. Node ve statik giriş/hosting ayarları ayrı kaldı. Yeni bağımlılık yok.

## Doğrulama

- `npm test`: 47/47; iki yeni test gerçek Mali/Roma kayıtları, ID gruplama, boş sorgu, kaynak boşlukları, sentetik MÖ uçları, alias ve input değişmezliğini kapsıyor.
- `npm run check:plan`, `node scripts/validate-boundaries.mjs`, `node scripts/validate-editorial.mjs`, `npm run build`, `npm run typecheck`: geçti.
- Ana Node üretim sunucusunda iki yeni Playwright senaryosu geçti: dönem seçimi/URL/reload/eski seçim temizliği; 360px klavye/yerleşim geçişi/taşma.
- Özel demo statik üretim derlemesi geçti. Masaüstü ve 360px gerçek Chromium görüntüleri incelendi.
- İlk tarayıcı çalışması uygulamaya erişmeden SIGSEGV ile durdu. Kalıcı çalışma alanındaki Chromium dosyası eksikti (166034432 bayt, ELF section header'ları eksik). Mevcut sıkıştırılmış paketten ayrı test dizinine 209022176 baytlık tarayıcı açılarak test ortamı düzeltildi; uygulama/test beklentileri gevşetilmedi. İlk kök npm komutu grep'i geçirmedi; doğru Playwright CLI ile hedefli tekrar yapıldı.
- Mevcut lockfile'a ait bağımlılıklar ve hash doğrulanmış arşiv görseli kullanıldı; temiz npm ci veya yeni Wikimedia indirmesi iddia edilmez. Aynı ajan diff incelemesi yapıldı, bağımsız inceleme değildir.

## Kalan

Statik demo hedefli regresyon sonuçlarını ve gerçek yayın sonucunu devam kaydına ekle. GitHub HEAD değişmişse eski SHA ile merge etme. #20/#21 tüm kabul ölçütleri kapanmaz. Gerçek iPhone/Android, Safari/Firefox, büyük veri arama performansı ve bağımsız tarihçi incelemesi bekliyor.

Sonraki somut iş: P02-004/P03 revizyon ve kanıt kimliği entegrasyonunu mevcut sözleşme üzerinde ilerlet; sağlayıcı/bölge/maliyet kararı olmadan ücretli altyapı kurma. Görsel bağımsız alternatif: ikinci arşiv perspektifinin kaynak/lisans değerlendirmesi.

Statik demo regresyonu: 4/4 geçti (iki yeni arama senaryosu, mevcut MS 1500 araması ve Bilinen dünya/ESC). Tam 19 senaryonun temiz toplu koşumu iddia edilmez.
