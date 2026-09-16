# Dönemler arası koleksiyon araması — 16 Eylül 2026

Durum: merged_and_deployed; bu arama dilimi tamamlandı. Yazar: Codex. PR: [#49](https://github.com/hturkmen/civilisation-atlas/pull/49). Dal: `agent/codex/cross-period-search-20260915`.

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


## Doğrulanmış entegrasyon ve yayın — 16 Eylül 2026

PR #49 birleşti: `ab0b48b0009d54d77f6baec82c800131c692e29a`. Test edilen uygulama commit'i: `4c3972b2cea39ce5affc96db0b2b45919bed8ffb`; merge kaynak ağacı aynı. Ana dal GitHub'dan doğrulandı.

Mevcut özel demo sürüm 5 yayımlandı. Site kaynak SHA: `35aa8ab3e5c18acfcd1c02600a6d1bfa60a7f37f`. Kaynak push sonrası tam HEAD okundu; doğrulanmış statik build paketlendi. Sürüm: `appgprj_6aa638d93f3c819188b55444e79f992a~appgver_a3c814ad2ce08191bb66368595c88c88`; dağıtım: `appgdep_6aaa48422df48191a3979d9d2da6765f`. Yayın hizmeti 2026-09-16T07:42:06.009698+00:00 tarihinde `succeeded` döndürdü. URL: https://civilisation-atlas-hturkmen.halilturkmen.chatgpt.site . Erişim genişletilmedi, yeni Site oluşturulmadı. Canlı URL üzerinde ek bulut tarayıcı testi yapılmadı; statik paket yerelde doğrulandı.

Sonuç: bu arama dilimi tamamlandı; önceki deployment_pending notu kapandı. Projenin tüm kapsamı tamamlanmadı. Sonraki ajan dönemler arası aramayı yeniden uygulamamalı; P02-004/P03 revizyon/kanıt entegrasyonu veya ikinci kaynaklı arşiv perspektifi ile devam etmeli. Kullanıcı/admin, tam veri kapsamı ve bağımsız inceleme hâlâ açık.
