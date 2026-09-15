# Görev devir kaydı şablonu

Bu şablonu `docs/team/handoffs/<görev>-<benzersiz-ek>.md` yoluna kopyala. Açılı ayraçları gerçek bilgilerle doldur; bilinmeyeni uydurma. Kimlik doğrulama bilgisi, ortam değişkeni değeri veya özel kullanıcı verisi yazma.

- Görev / issue:
- Çalışan araç ve rol:
- Durum: `in_progress | paused | ready_for_review | merged | blocked`
- Güncelleme zamanı: gerçek tarih/saat ve UTC farkı
- Başlangıç `origin/main` tam SHA:
- Dal / PR URL:
- Son push edilen uygulama commit'i:
- Son doğrulanan commit:
- İnceleme kapsamı / kalan fark:

Bu dosyayı içeren commit kendi SHA'sını içeremez. Son uygulama commit'ini yaz; devir dosyasının kendi commit'i ve uzak HEAD PR/Git kayıtlarından doğrulanır.

## Somut hedef ve kabul ölçütleri

## Değiştirilen dosya alanları ve ortak dosya ihtiyacı

## Tamamlananlar

Yalnız uygulanmış ve doğrulanmış işleri yaz.

## Doğrulama

| Komut / inceleme | Sonuç | Ortam / kapsam / kalan sınırlama |
|---|---|---|

Başarısız kontrol, tekrar koşum, yalnız statik kontrol veya hiç çalıştırılmamış test ayrı yazılır. Kaynak/lisans kontrolü tarihçi incelemesi değildir.

## Kaynak / hak / güvenlik / altyapı notları

Kaynak değiştiyse sürüm, erişim tarihi, gerçek checksum, locator ve izin dayanağına bağlantı ver. Hak veya bağımsız inceleme eksiklerini açıkça belirt.

## Kesinti ve devralma

- Devam eden süreç veya kısmi değişiklik var mı?
- İlk yapılacak somut komut/iş:
- Hangi işi tekrar yapmamak gerekir?
- Kullanıcı kararı/erişim bekleyen adım ve engellenmeyen alternatif:

## GitHub ve yayın

- Push doğrulaması / uzak SHA:
- PR inceleme ve birleştirme durumu:
- Demo: `not_needed | deployment_pending | succeeded | failed`
- Yayımlandıysa hizmetten doğrulanan sürüm / dağıtım / zaman / URL:
