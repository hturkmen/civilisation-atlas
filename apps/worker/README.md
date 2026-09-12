# Veri ve yayın işleri

Durum: tasarım; worker henüz uygulanmadı.

İş tipleri: source-import, geometry-validate, release-build, asset-process, release-withdraw ve cleanup.

İlk uygulama DB destekli kalıcı iş tablosu/sağlayıcının job altyapısı kullanabilir. Web request içinde uzun import yapılmaz. Ayrı queue ürünü zorunlu değildir; yeniden deneme, lease/heartbeat ve idempotency zorunludur.

Worker'ın private kaynaklara okuma, staging çıktıya yazma izinleri vardır. Public aktivasyon kontrollü servis işlemiyle yapılır. İş loglarında erişim token'ı veya tam kişisel veri yoktur.
