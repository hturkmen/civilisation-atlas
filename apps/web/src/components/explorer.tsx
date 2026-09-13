'use client';

import {useCallback, useEffect, useRef, useState} from 'react';
import {parseView, RELEASE_ID, viewQuery, visiblePlaces, type Catalog, type Place, type View} from '@atlas/domain/catalog';
import {formatYear} from '@atlas/domain/chronology';
import {archiveMapsAtYear} from '@atlas/domain/archive';
import {archiveMaps} from '@/lib/archive';
import {AtlasMap} from './atlas-map';
import {ArchivePanel, ArchivePreview, ArchiveSource, HistoricalMap} from './historical-map';
import {Timeline} from './timeline';
import {Icon} from './icon';

export function Explorer({catalog, initialView, maxYear}: {catalog: Catalog; initialView: View; maxYear: number}) {
  const [view, setView] = useState(initialView);
  const [query, setQuery] = useState('');
  const [shared, setShared] = useState('');
  const sourceDialog = useRef<HTMLDialogElement>(null);
  const detailHeading = useRef<HTMLHeadingElement>(null);
  const visible = visiblePlaces(catalog.places, view.year);
  const results = visiblePlaces(catalog.places, view.year, query);
  const selected = visible.find(place => place.id === view.selectedId);
  const archiveMap = archiveMapsAtYear(archiveMaps, view.year)[0];

  useEffect(() => {window.history.replaceState(null, '', viewQuery(view));}, [view]);
  useEffect(() => {
    const restore = () => {setView(parseView(new URLSearchParams(window.location.search), maxYear, catalog.places)); setQuery('');};
    window.addEventListener('popstate', restore);
    return () => window.removeEventListener('popstate', restore);
  }, [maxYear, catalog]);
  useEffect(() => {
    if (!selected) return;
    detailHeading.current?.focus({preventScroll: true});
    if (window.matchMedia('(max-width: 760px)').matches) {
      document.getElementById('explore-panel')?.scrollIntoView({block: 'start',
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
    }
  }, [selected?.id]);
  useEffect(() => {
    if (!shared) return;
    const timer = window.setTimeout(() => setShared(''), 4000);
    return () => window.clearTimeout(timer);
  }, [shared]);

  const changeYear = useCallback((year: number) => {
    setView(current => ({...current, year, selectedId: visiblePlaces(catalog.places, year).some(p => p.id === current.selectedId) ? current.selectedId : null}));
  }, [catalog.places]);

  function selectPlace(id: string) {setView(current => ({...current, selectedId: id}));}
  function jump(place: Place) {
    setQuery(''); setView({year: place.suggestedYear, mode: 'history', selectedId: place.id});
  }
  function switchMode(mode: View['mode']) {setView(current => ({...current, mode, selectedId: null}));}
  function openArchive(year: number) {
    setQuery(''); setView({year, mode: 'known', selectedId: null});
    if (window.matchMedia('(max-width: 760px)').matches) {
      document.getElementById('map-stage')?.scrollIntoView({block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
    }
  }
  function jumpToCollection(year: number) {setQuery(''); setView({year, mode: 'history', selectedId: null});}
  async function share() {
    try {
      await navigator.clipboard.writeText(window.location.origin + '/' + viewQuery(view));
      setShared('Bağlantı kopyalandı.');
    } catch {setShared('Adres çubuğundaki bağlantıyı kopyalayabilirsin.');}
  }

  return <div className={'atlas-app' + (view.mode === 'known' ? ' archive-mode' : '')}>
    <a className="skip-link" href="#explore-panel">Yerleşim listesine geç</a>
    <header className="masthead">
      <a className="brand" href="/" aria-label="Civilisation Atlas ana sayfa"><span className="brand-symbol"><Icon name="compass" size={32}/></span><span>CIVILISATION<strong>ATLAS<span className="brand-dot">.</span></strong></span></a>
      <nav className="mode-switch" aria-label="Atlas görünümü">
        <button aria-pressed={view.mode === 'history'} onClick={() => switchMode('history')}><Icon name="globe" size={17}/><span>Tarihsel dünya</span></button>
        <button aria-pressed={view.mode === 'known'} onClick={() => switchMode('known')}><Icon name="map" size={17}/><span>Bilinen dünya</span></button>
      </nav>
      <div className="header-actions"><span className="preview-badge">İlk koleksiyon</span><button className="text-button sources-button" onClick={() => sourceDialog.current?.showModal()}><Icon name="book" size={18}/><span>Kaynaklar</span></button></div>
    </header>

    <main className="workspace">
      <aside className="explore-panel" id="explore-panel" aria-label="Yerleşimler ve bilgiler" tabIndex={-1}>
        {view.mode === 'known' ? <ArchivePanel map={archiveMap} maps={archiveMaps} year={view.year} onOpen={openArchive} onShare={share}/> : selected ? <div className="detail-panel" key={selected.id}>
          <button className="text-button back-button" onClick={() => setView(current => ({...current, selectedId: null}))}><Icon name="back" size={17}/>Yerleşimlere dön</button>
          <p className="eyebrow">{selected.region}</p>
          <h1 ref={detailHeading} tabIndex={-1}>{selected.name}</h1>
          <p className="culture-name">{selected.culture}</p>
          <div className="place-badges"><span><Icon name="pin" size={14}/> Yerleşim</span><span>Yaklaşık dönem</span></div>
          <p className="place-summary">{selected.summary}</p>
          <section className="detail-section"><h2>Neden önemli?</h2><p>{selected.significance}</p></section>
          <section className="detail-section"><h2>Kaynağın odaklandığı dönem</h2><strong className="period-value">{selected.period.label}</strong><p>{selected.period.note}</p></section>
          <section className="source-card"><div className="section-heading"><Icon name="book" size={17}/><h2>Bilginin kaynağı</h2></div>
            {catalog.sources.filter(source => source.id === selected.evidence.summary.sourceId).map(source => <div key={source.id}>
              <a className="source-link" href={source.url} target="_blank" rel="noopener noreferrer">{source.title}<Icon name="external" size={15}/></a>
              <p>{source.publisher}</p><details><summary>Kanıt ve kullanım bilgisi</summary><dl className="evidence-list">
                <dt>Metin</dt><dd>{selected.evidence.summary.locator}</dd>
                <dt>Tarih</dt><dd>{selected.evidence.period.locator}</dd>
                <dt>Konum</dt><dd>{selected.evidence.coordinates.locator}</dd>
                <dt>Kaynağa erişim</dt><dd>{source.accessedOn}</dd>
              </dl><p>{source.adaptation}</p><a href={source.licenseUrl} target="_blank" rel="noopener noreferrer">{source.license}</a></details>
            </div>)}
          </section>
          <details className="location-note"><summary>Konum ve inceleme notu</summary><p>{selected.coordinateNote}</p><p>{selected.editorialStatus}</p></details>
          <button className="text-button share-button" onClick={share}><Icon name="share" size={16}/>Bu görünümü paylaş</button>
          {visible.length > 1 && <section className="contemporaries"><p className="eyebrow">AYNI TARİHTE BAŞKA BİR YER</p>{visible.filter(place => place.id !== selected.id).map(place => <button key={place.id} onClick={() => selectPlace(place.id)}><span><strong>{place.name}</strong><small>{place.region}</small></span><Icon name="arrow" size={17}/></button>)}<p>Yalnızca koleksiyondaki dönemler örtüşür; doğrudan bir ilişki iddiası değildir.</p></section>}
        </div> : <>
          <p className="eyebrow">DÜNYANIN ORTAK HİKÂYESİ</p>
          <h1>Tarihin<br/><em>izini sür.</em></h1>
          <p className="intro-copy">Bir yıl seç. Haritadaki bir yerleşime dokun. Geçmişi kaynaklarıyla keşfet.</p>
          <label className="search-box"><Icon name="search" size={18}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Yerleşim veya kültür ara" aria-label="Yerleşim veya kültür ara"/>{query && <button aria-label="Aramayı temizle" onClick={() => setQuery('')}><Icon name="close" size={16}/></button>}</label>
          <div className="section-heading results-heading"><h2>Bu tarihte keşfet</h2><span aria-live="polite">{results.length} yer</span></div>
          {results.length ? <ul className="place-list">{results.map((place, index) => <li key={place.id}><button onClick={() => selectPlace(place.id)}><span className="place-number">0{index + 1}</span><span><strong>{place.name}</strong><small>{place.culture}</small></span><Icon name="arrow" size={18}/></button></li>)}</ul> : <div className="empty-state"><Icon name="search"/><h3>{query ? 'Bu tarihte eşleşme yok' : 'Bu yıl için kayıt eklenmedi'}</h3><p>{query ? 'Aramayı temizle veya aşağıdan başka bir döneme geç.' : 'Bu, o dönemde yerleşim olmadığı anlamına gelmez. Başlangıç koleksiyonu henüz sınırlı.'}</p>{query && <button className="text-button" onClick={() => setQuery('')}>Aramayı temizle</button>}</div>}
          <div className="collection-note"><Icon name="info" size={17}/><p>Üç yerleşimden oluşan başlangıç koleksiyonu. Noktalar yerleşimleri gösterir; tarihsel sınır verisi henüz eklenmedi.</p></div>
          <section className="journeys"><p className="eyebrow">BAŞKA BİR ZAMANA GİT</p>{catalog.places.map(place => <button key={place.id} onClick={() => jump(place)}><span><strong>{place.name}</strong><small>{formatYear(place.suggestedYear)}</small></span><Icon name="arrow" size={17}/></button>)}</section>
          <button className="archive-teaser" onClick={() => openArchive(archiveMaps[0].publicationYear)}><span className="archive-teaser-icon"><Icon name="map" size={27}/></span><span><small>YENİ · TARİHÎ HARİTA</small><strong>1507’de dünyaya bak</strong><span>Waldseemüller arşivini aç</span></span><Icon name="arrow" size={17}/></button>
        </>}
        <div className="panel-footnote"><span className="small-compass">✧</span> Her hikâyenin bir kaynağı var.</div>
      </aside>

      <section id="map-stage" className={'map-stage' + (view.mode === 'known' ? ' known-stage' : '')} aria-label={view.mode === 'history' ? 'Tarihsel dünya görünümü' : 'Bilinen dünya görünümü'}>
        {view.mode === 'history' ? <>
          <AtlasMap places={visible} selectedId={view.selectedId} onSelect={selectPlace}/>
          <div className="map-heading"><span className="eyebrow">TARİHSEL DÜNYA</span><div>{formatYear(view.year)}</div><p role="status">{visible.length ? visible.length + ' yerleşim · başlangıç koleksiyonu' : 'Bu yıl için kayıt eklenmedi'}</p></div>
          <div className="north-mark" aria-hidden="true">N<span>↑</span></div>
          <div className="map-legend"><span className="legend-dot"/>Yerleşim noktası<span className="legend-divider"/>Modern kıyı çizgisi</div>
        </> : archiveMap ? <HistoricalMap key={archiveMap.id} map={archiveMap}/> : <ArchivePreview map={archiveMaps[0]} year={view.year} onOpen={openArchive}/>}
      </section>
    </main>

    <Timeline year={view.year} maxYear={maxYear} places={catalog.places} onChange={changeYear} mode={view.mode} maps={archiveMaps} onOpenArchive={openArchive} onJumpToCollection={jumpToCollection}/>
    <div className="toast" role="status" aria-live="polite" hidden={!shared}>{shared}</div>
    <dialog ref={sourceDialog} className="sources-dialog" aria-labelledby="sources-title">
      <div className="dialog-heading"><div><p className="eyebrow">AÇIK VE İZLENEBİLİR</p><h2 id="sources-title">Atlasın kaynakları</h2></div><button className="icon-button" aria-label="Kaynakları kapat" onClick={() => sourceDialog.current?.close()}><Icon name="close"/></button></div>
      <p>Metin, dönem ve konum bilgisi her yerleşimde kaynağa bağlanır. Başlangıç koleksiyonu bağımsız tarihçi incelemesini henüz tamamlamadı.</p>
      <div className="source-registry">{catalog.sources.map(source => <article key={source.id}><span className="eyebrow">{source.publisher}</span><h3><a href={source.url} target="_blank" rel="noopener noreferrer">{source.title}<Icon name="external" size={15}/></a></h3><p>{source.adaptation}</p><a href={source.licenseUrl} target="_blank" rel="noopener noreferrer">{source.license}</a><small>Erişim: {source.accessedOn}</small></article>)}</div>
      {archiveMaps.map(map => <ArchiveSource key={map.id} map={map}/>)}
      <article className="basemap-credit"><h3>Coğrafi referans: Natural Earth</h3><p>1:110m kara verisi, public domain. Modern kıyı çizgisi kullanılır; tarihsel kıyılar veya siyasi sınırlar temsil edilmez.</p><a href="https://www.naturalearthdata.com/about/terms-of-use/" target="_blank" rel="noopener noreferrer">Kaynak ve kullanım koşulları <Icon name="external" size={14}/></a></article>
      <p className="release-note">Koleksiyon sürümü: {RELEASE_ID}</p>
    </dialog>
  </div>;
}
