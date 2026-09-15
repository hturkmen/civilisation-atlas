# PR #48 — Codex tamamlayıcı doğrulama

## Codex doğrulaması — 2026-09-15T16:34:07+00:00

PR #48'in `42b3a7ab4959e3a713ae1d60349883cfbd5d3709` kaynak durumu GitHub'dan okunup ayrı çalışma alanına blob hash'leri doğrulanarak alındı. Kod zaten GitHub'daydı; aşağıdaki eski push/PR engeli notları Claude oturumunun geçmiş durumudur. Kullanıcının stash/bundle dosyalarına ihtiyaç duyulmadı.

Build engeli bu ortamda çözüldü: önceki başarılı özel demo yayınından kalan `waldseemuller-1507.jpg` dosyası kullanıldı. Mevcut `prepare-archive-assets.mjs`, dosyayı katalogdaki tam SHA-256 ile doğruladı. Betik, kaynak, beklenen hash veya TLS ayarı değiştirilmedi. Bu sonuç Wikimedia'ya yeni ağ erişiminin ya da kullanıcının Windows sertifika ortamının düzeldiği anlamına gelmez. Aynı lockfile'a ait mevcut bağımlılıklar kullanıldı; yeni temiz npm ci koşumu iddia edilmez.

Ek kod incelemesinde `evaluatePublishability` doğrudan çağrıldığında, `claimStatement` olmayan sentetik bir adayın eşleşen inceleme hash'iyle `publishable=true` döndüğü yeniden üretildi. Kapı artık mevcut kaynak/aday doğrulayıcısını kendisi çağırıp hatalı girdiyi gerekçeli biçimde reddediyor. Eksik iddia, reviewer veya extent ve hatalı evidence/istisna konteynerleri için iki regresyon testi eklendi. Dört eski test kaynağı, zaten sözleşmede zorunlu olan revisionNote/publishedOnNote alanlarıyla tamamlandı; gerçek adayların inceleme durumu değiştirilmedi.

Son değişikliklerle `npm test` 45/45, editoryal validator, sınır validator, `npm run build`, `npm run typecheck` ve `npm run check:plan` geçti. Beş gerçek aday yapısal olarak geçerli, sıfırı yayınlanabilir. Arayüz/çalışma zamanı koleksiyonu değişmediği için Playwright yeniden çalıştırılmadı ve yeni demo yayını gerekmiyor. Gerçek Windows, canlı auth/admin veya tarihçi incelemesi yapılmadı.

Kod ve kayıtlar aynı PR #48'e aktarılacak; birleştirme sonucu GitHub PR kaydından doğrulanmalı. P02-004 canlı revizyon/kanıt entegrasyonu, bağımsız inceleme ve üretim yetkilendirmesi açık kalır. Sonraki somut iş: PR #48 birleştirildikten sonra güncel main'den dönemler arası arama görevini devral; açık başka bir arayüz PR'ı varsa aynı işi yeniden yazma.
