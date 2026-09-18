'use client';

import type {RefObject} from 'react';
import type {BoundaryCollection, VisibleBoundary} from '@atlas/domain/boundaries';
import {formatYear} from '@atlas/domain/chronology';
import {Icon} from './icon';
import {PolityStory} from './polity-story';

export function BoundarySource({collection}: {collection: BoundaryCollection}) {
  const source = collection.source;
  return <article className="boundary-source-credit"><p className="eyebrow">TARİHSEL ALANLAR · {source.version}</p><h3><a href={source.url} target="_blank" rel="noopener noreferrer">Cliopatria · Seshat <Icon name="external" size={14}/></a></h3><p>{source.publisher}</p><p>{source.uncertainty}</p><p>{source.adaptation}</p><a href={source.licenseUrl} target="_blank" rel="noopener noreferrer">{source.license}</a><span> · </span><a href={source.paperUrl} target="_blank" rel="noopener noreferrer">Bilimsel açıklama</a><small>Erişim: {source.accessedOn} · Seçilmiş {collection.polities.length} siyasi yapı / {collection.records.length} kayıt.</small></article>;
}

export function PolityDetail({boundary, collection, year, headingRef, onBack, onShare, onJump}: {
  boundary: VisibleBoundary; collection: BoundaryCollection; year: number;
  headingRef: RefObject<HTMLHeadingElement | null>; onBack: () => void; onShare: () => void;
  onJump: (year: number, polityId: string) => void;
}) {
  const {polity, record} = boundary;
  const records = collection.records.filter(item => item.polityId === polity.id);
  const activeIndex = records.findIndex(item => item.id === record.id);
  const periodButtons = <div className="period-options">{records.map(item => <button key={item.id} aria-pressed={item.id === record.id} onClick={() => onJump(item.sampleYear, polity.id)}>{formatYear(item.sampleYear)}</button>)}</div>;
  return <div className="detail-panel polity-detail" style={{'--polity-color': polity.color} as React.CSSProperties}>
    <button className="text-button back-button" onClick={onBack}><Icon name="back" size={17}/>Koleksiyona dön</button>
    <p className="eyebrow">TARİHSEL ALAN · {formatYear(year)}</p>
    <h1 ref={headingRef} tabIndex={-1}>{polity.name}</h1>
    <p className="culture-name">{polity.sourceName}</p>
    <div className="place-badges"><span><i className="polity-swatch"/>Siyasi yapı</span><span>Yaklaşık alan</span></div>
    <p className="place-summary">Haritadaki renkli alan, Cliopatria’nın bu dönem için yayımladığı {polity.name} kaydını gösterir.</p>
    <section className="boundary-period"><span className="eyebrow">SINIR KAYDININ DÖNEMİ</span><strong>{formatYear(record.period.start)} — {formatYear(record.period.endExclusive - 1)}</strong><p>Bu aralık kaydın kapsamıdır; kuruluş veya sona eriş tarihi değildir.</p></section>
    <div className="boundary-uncertainty"><Icon name="info" size={17}/><p>Sınırlar dönemsel bir rekonstrüksiyondur. Aynı alanın her yıl değişmeden kaldığı veya sınırın kesin olarak bilindiği anlamına gelmez.</p></div>
    <PolityStory polityId={polity.id}/>
    {records.length > 1 && <section className="polity-periods"><p className="eyebrow">BU ALANIN DİĞER DÖNEMLERİ</p>
      {records.length > 8 ? <>
        <nav className="period-neighbors" aria-label="Komşu kaynak dönemleri">
          <button disabled={activeIndex === 0} onClick={() => onJump(records[activeIndex - 1].sampleYear, polity.id)}>Önceki dönem</button>
          <button disabled={activeIndex === records.length - 1} onClick={() => onJump(records[activeIndex + 1].sampleYear, polity.id)}>Sonraki dönem</button>
        </nav>
        <details key={polity.id} className="all-periods"><summary>Tüm dönemleri göster ({records.length})</summary>{periodButtons}</details>
      </> : periodButtons}
      <p>Yalnız seçilmiş kaynak kayıtları gösterilir. Aradaki boşluklar doldurulmaz.</p></section>}
    <section className="source-card"><div className="section-heading"><Icon name="book" size={17}/><h2>Alanın kaynağı</h2></div><a className="source-link" href={collection.source.url} target="_blank" rel="noopener noreferrer">Cliopatria · {collection.source.version}<Icon name="external" size={15}/></a><p>{collection.source.publisher}</p><a className="boundary-license" href={collection.source.licenseUrl} target="_blank" rel="noopener noreferrer">{collection.source.license} · uyarlanmış veri</a><details><summary>Kanıt ve kullanım bilgisi</summary><dl className="evidence-list"><dt>Kaynak kayıt adı</dt><dd>{polity.sourceName}</dd><dt>Kayıt aralığı</dt><dd>{formatYear(record.period.start)} – {formatYear(record.period.endExclusive - 1)}; kaynakta iki uç da dahildir.</dd><dt>Kaynak satırı</dt><dd>{record.sourceIndex} (sıfırdan başlayan kayıt dizini)</dd><dt>Kaynağın alan hesabı</dt><dd>Yaklaşık {new Intl.NumberFormat('tr-TR', {maximumFractionDigits: 2}).format(record.sourceAreaKm2 / 1000000)} milyon km²; kaynak modelinin hesabıdır.</dd><dt>Kaynağa erişim</dt><dd>{collection.source.accessedOn}</dd></dl><p>{collection.source.adaptation}</p><p>Kaynak ve geometri kontrol edildi; bağımsız tarihçi incelemesi henüz tamamlanmadı.</p><a href={collection.source.paperUrl} target="_blank" rel="noopener noreferrer">Verinin bilimsel açıklaması</a></details></section>
    <button className="text-button share-button" onClick={onShare}><Icon name="share" size={16}/>Bu görünümü paylaş</button>
  </div>;
}
