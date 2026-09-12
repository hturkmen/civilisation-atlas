# API sözleşmesi

openapi.json OpenAPI 3.1 biçiminde bir taslaktır; çalışan servis yoktur. Private/admin işlemlerinin kimlik koşulları, public verinin sürüme bağlı okunması, tarih ve kanıt modelleri tanımlıdır.

Yerel doğrulayıcı JSON, referanslar, operationId, path parametreleri ve temel auth beyanlarını kontrol eder. Tam OpenAPI standardı ve gerçek HTTP/DB davranışı henüz test edilmedi. P03-006 bu sözleşmeyi implementasyonla eşleştirir.

Taslak oluşturmadaki UUID'ler istemci tarafından oluşturulabilir ancak referans erişimi ve uniqueness server/DB'de kontrol edilmelidir. Kaynak oluşturma, revizyon düzenleme ve typed draft şemalarının nihai ayrımı uygulama görevinde netleştirilecektir.

Yetki matrisi ve CSRF/MFA gereksinimleri security/description alanlarında ve güvenlik belgesindedir; security tanımı tek başına rol kontrolünü uygulamaz.
