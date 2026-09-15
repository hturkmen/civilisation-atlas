# Tarih çekirdeği ve katalog modülleri

Çalışan kod; MÖ/MS dönüşümü, yıl gösterimi, yarı açık tarih aralığı ve belirsizlik zarfı sınıflandırması (`chronology`), önizleme katalog/sınır/arşiv doğrulayıcıları ve P02-001 editoryal kaynak/kanıt sözleşmesi (`editorial`) ile sınırlıdır. Bağımlılıksız JavaScript ES module ve JSDoc kullanır; sonraki TypeScript uygulamasına taşınabilir.

Veri setindeki gerçek tarihlerin doğru olduğunu kanıtlamaz. Kaynak takvimini yorumlama, gün/ay dönüşümü, açık bitişi data_as_of ile sınırlama ve ürün tarih sınırını uygulama henüz entegrasyon görevleridir.

Test örneklerindeki sayılar sentetiktir, herhangi bir medeniyete ait tarihsel iddia değildir.

## Editoryal sözleşme (P02-001)

`src/editorial.mjs`, `data/editorial/sources.json` ve `data/editorial/candidates.json` içindeki gerçek Gate A verisini yapısal olarak doğrular ve `evaluatePublishability` ile ayrı bir yayın kapısı uygular. Doğrulamak için:

```
node scripts/validate-editorial.mjs
```

Ayrıntılar ve yayın kapısı kuralları için `packages/contracts/editorial/README.md` ve `data/editorial/README.md`'ye bakın. Bu modül dış URL'lere ağ isteği yapmaz; yalnızca kendisine verilen nesneleri yapısal olarak inceler.
