# Editoryal Gate A verisi (P02-001 / P02-002)

Bu dizin, `packages/contracts/editorial/` sözleşmesinin gerçek örnek verisidir. `data/preview-collection.json` ve `data/boundary-collection.json`'ı değiştirmez veya onların yerine geçmez; onlara **atıfta bulunan** ayrı bir editoryal katmandır.

## Dosyalar

- `sources.json` — Gate A denemesinde kullanılan beş kaynağın P02-001 sözleşmesine uygun kaydı. Aynı UNESCO ve Cliopatria kaynakları `data/preview-collection.json` ve `data/boundary-collection.json` içinde zaten kullanılıyor; burada aynı kararlar editoryal sözleşme alanlarına (hak durumu, checksum dayanağı, kullanım kapsamı) taşındı, kaynak yeniden uydurulmadı.
- `candidates.json` — Beş Gate A adayı: Mohenjo-daro ve Büyük Zimbabve için gerçek UNESCO metninden alınmış dönem dayanağı, Roma İmparatorluğu MS 117 için mevcut `boundary-collection.json` kaydına (`cliopatria-1235`) atıf, Waldseemüller 1507 için katalog/eser tarihi ayrımı, ve Roma için araştırılmış ama kullanılamayan bir alternatif yorum denemesi (`status: blocked`).

Tüm adaylar `reviewStatus: unreviewed` durumundadır. Bu, doğrulamanın **beklenen** sonucudur; hiçbiri bağımsız tarihçi incelemesi yapılmış gibi sunulmaz ve `evaluatePublishability` hiçbiri için `publishable: true` döndürmez.

## Neden bu beş aday

`docs/team/prompts/kiro-data.md` istediği paket şu şekilde karşılanır:

1. **Mohenjo-daro** — UNESCO'nun gerçek "beginning of the 3rd millennium BC" ifadesi, uygarlığın MÖ 2500–1500 aralığından ayrıştırılarak kullanıldı.
2. **Büyük Zimbabve** — UNESCO'nun gerçek "built between 1100 and 1450 AD" ifadesi, Şona kültürünün veya yerleşimin bütün varlık süresinden ayrıştırılarak kullanıldı.
3. **Roma İmparatorluğu, MS 117** — Yeni geometri eklenmedi; mevcut `data/boundary-collection.json` kaydı `cliopatria-1235`'e (Wikidata Q12544, kaynak satırı 1235) doğrudan atıf yapıldı.
4. **Waldseemüller 1507** — Eserin katalog/basım tarihi ile temsil ettiği coğrafi bilginin tarihi ayrı tutuldu; her ikisi de `data/historical-maps.json` içinde zaten ayrı alanlardır.
5. **Roma için alternatif yorum, engellendi** — Wikimedia Commons'taki `RomanEmpire_117.svg` dosyası incelendi; dosyanın kendi açıklaması "kaynak/referans belirtilmemiş" dediği için kanıt zinciri kurulamadı ve aday `blocked` olarak kaydedildi. Sahte bir ikinci kaynak veya çelişki uydurulmadı.

## Doğrulama

```
node scripts/validate-editorial.mjs
```

Ayrıca `npm test` çalıştırıldığında `packages/domain/test/editorial.test.mjs` bu dosyaları ve validator'ı birlikte test eder.


## Revizyon pinleri — 16 Eylül

`revisions.json` mevcut beş adayın iddia, çözülmüş varlık/geometri/perspektif ve kullanılan kaynak içeriklerini SHA-256 kimliklerine bağlar. Kaynakların yayımladığı sürüm numarası değildir. `node scripts/prepare-editorial-revisions.mjs` güncel pinlerin varlığını kontrol eder; `--write` eski pinleri koruyarak yenilerini ekler, hiçbir adayın inceleme durumunu değiştirmez. Genel editoryal validator da bu pinleri zorunlu kontrol eder. Henüz yetkili inceleme servisi ve DB olmadığı için CLI yayın izni üretemez.
