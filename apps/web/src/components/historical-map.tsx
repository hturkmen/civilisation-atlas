'use client';

import {useEffect, useRef, useState} from 'react';
import type {ArchiveMap} from '@atlas/domain/archive';
import {formatYear} from '@atlas/domain/chronology';
import {Icon} from './icon';

export function ArchiveSource({map}: {map: ArchiveMap}) {
  return <section className="source-card archive-source">
    <div className="section-heading"><Icon name="book" size={17}/><h2>Eserin kaynağı</h2></div>
    <a className="source-link" href={map.sourceUrl} target="_blank" rel="noopener noreferrer">Library of Congress kaydı<Icon name="external" size={15}/></a>
    <p>{map.holdingInstitution}</p>
    <details><summary>Kanıt ve görsel kullanım bilgisi</summary>
      <p>{map.sourceLocator}</p><p>Görsel: Library of Congress taramasının Wikimedia Commons kopyası. Harita yeniden çizilmedi veya modern koordinatlara oturtulmadı.</p>
      <a href={map.imageSourceUrl} target="_blank" rel="noopener noreferrer">Görsel kaydı ve hak bilgisi</a><br/>
      <a href={map.licenseUrl} target="_blank" rel="noopener noreferrer">{map.license}</a>
      <p>Kontrol: {map.accessedOn}. Bağımsız tarihçi incelemesi bekliyor.</p>
    </details>
  </section>;
}

export function ArchivePanel({map, maps, year, onOpen, onShare}: {
  map?: ArchiveMap; maps: ArchiveMap[]; year: number; onOpen: (year: number) => void; onShare: () => void;
}) {
  return <div className="known-panel">
    <p className="eyebrow">ARŞİVİN İÇİNDEN</p>
    <h1>{map ? 'Dünya, onun gözünden.' : 'Bir harita. Başka bir dünya.'}</h1>
    {map ? <>
      <div className="archive-author"><span className="archive-monogram" aria-hidden="true">MW</span><div><strong>{map.creator}</strong><span>{formatYear(map.publicationYear)} · Dünya haritası</span></div></div>
      <h2 className="archive-title">{map.title}</h2>
      <p className="archive-summary">{map.summary}</p>
      <dl className="archive-dates"><dt>ESERİN TARİHİ</dt><dd>{map.copyDate}</dd><dt>TEMSİL EDİLEN BİLGİ</dt><dd>{map.knowledgeDate}</dd></dl>
      <div className="perspective-note"><Icon name="info" size={17}/><p>{map.perspective}</p></div>
      <ArchiveSource map={map}/>
      <button className="text-button share-button" onClick={onShare}><Icon name="share" size={16}/>Bu görünümü paylaş</button>
    </> : <>
      <p><strong>{formatYear(year)}</strong> için arşivde henüz harita yok. Aşağıdaki eseri kendi tarihine geçerek inceleyebilirsin.</p>
      <div className="archive-catalogue">{maps.map(item => <button key={item.id} className="archive-open-card" onClick={() => onOpen(item.publicationYear)}>
        <span className="eyebrow">{formatYear(item.publicationYear)} · ARŞİV ESERİ</span><strong>{item.title}</strong><span>{item.creator}</span><span className="archive-open-action">{formatYear(item.publicationYear)}’ye git <Icon name="arrow" size={17}/></span>
      </button>)}</div>
      <div className="perspective-note"><Icon name="info" size={17}/><p>Her eser belirli bir bakış açısına aittir. Yayım tarihi, içerdiği bütün bilgilerin aynı tarihte edinildiği anlamına gelmez.</p></div>
    </>}
  </div>;
}

export function ArchivePreview({map, year, onOpen}: {map: ArchiveMap; year: number; onOpen: (year: number) => void}) {
  return <div className="archive-preview">
    <div className="archive-preview-copy"><p className="eyebrow">GEÇMİŞİN HARİTA ODASI</p><h2>Bir zamanlar<br/>dünya böyle çizildi.</h2><p>{formatYear(year)} için eser eklenmedi.<br/>Koleksiyondaki ilk haritayı keşfet.</p></div>
    <button className="archive-preview-card" onClick={() => onOpen(map.publicationYear)} aria-label={formatYear(map.publicationYear) + ' tarihli Waldseemüller haritasını aç'}>
      <img src={map.image.src} alt="On iki yapraktan oluşan 1507 dünya haritasının koleksiyon önizlemesi" width={map.image.width} height={map.image.height} loading="lazy"/>
      <span><span><small>KOLEKSİYONDAN BİR ESER · {formatYear(map.publicationYear)}</small><strong>{map.title}</strong></span><Icon name="arrow" size={22}/></span>
    </button>
    <p className="archive-preview-credit">{map.holdingInstitution} · Kamu malı</p>
  </div>;
}

export function HistoricalMap({map}: {map: ArchiveMap}) {
  const stage = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const sheet = useRef<HTMLImageElement>(null);
  const drag = useRef<{x: number; y: number; left: number; top: number} | null>(null);
  const focusPoint = useRef({x: .5, y: .5});
  const [size, setSize] = useState({width: 800, height: 500});
  const [zoom, setZoom] = useState(1);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [canFullscreen, setCanFullscreen] = useState(false);
  const [notice, setNotice] = useState('');
  const ratio = map.image.width / map.image.height;
  const fit = Math.max(1, Math.min(size.width - 40, (size.height - 40) * ratio));
  const width = fit * zoom;
  const height = width / ratio;
  const canvasWidth = Math.max(size.width, width + 40);
  const canvasHeight = Math.max(size.height, height + 40);

  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const resize = () => setSize({width: element.clientWidth, height: element.clientHeight});
    const observer = new ResizeObserver(resize);
    observer.observe(element); resize();
    if (sheet.current?.complete && sheet.current.naturalWidth > 0) setLoaded(true);
    setCanFullscreen(Boolean(document.fullscreenEnabled && stage.current?.requestFullscreen));
    const update = () => setFullscreen(document.fullscreenElement === stage.current);
    document.addEventListener('fullscreenchange', update);
    return () => {observer.disconnect(); document.removeEventListener('fullscreenchange', update);};
  }, []);

  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    element.scrollTo({left: (canvasWidth - width) / 2 + width * focusPoint.current.x - size.width / 2,
      top: (canvasHeight - height) / 2 + height * focusPoint.current.y - size.height / 2, behavior: 'instant'});
  }, [zoom, size, canvasWidth, canvasHeight, width, height]);

  function setMagnification(next: number, point?: {x: number; y: number}) {
    const element = viewport.current;
    if (point) focusPoint.current = point;
    else if (element) focusPoint.current = {
      x: (element.scrollLeft + size.width / 2 - (canvasWidth - width) / 2) / width,
      y: (element.scrollTop + size.height / 2 - (canvasHeight - height) / 2) / height,
    };
    setZoom(Math.max(1, Math.min(4, next)));
  }

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement === stage.current) await document.exitFullscreen();
      else await stage.current?.requestFullscreen();
    } catch {setNotice('Tarayıcı tam ekranı açamadı. Yakınlaştırma kontrollerini kullanabilirsin.');}
  }

  return <div ref={stage} className="historical-viewer" data-testid="historical-viewer">
    <div className="archive-viewer-heading"><div><span className="eyebrow">ORİJİNAL ESERİN DİJİTAL GÖRÜNTÜSÜ</span><strong>{formatYear(map.publicationYear)} <span>/ {map.creator}</span></strong></div><span className="archive-edition">12 YAPRAK · TEK DÜNYA</span></div>
    <div ref={viewport} className={'archive-scroll' + (zoom > 1 ? ' zoomed' : '')} tabIndex={0} role="region" aria-label="Tarihî harita inceleyici" aria-describedby="archive-gesture-hint"
      onPointerDown={event => {
        if (event.pointerType !== 'mouse' || event.button !== 0 || zoom === 1) return;
        drag.current = {x: event.clientX, y: event.clientY, left: event.currentTarget.scrollLeft, top: event.currentTarget.scrollTop};
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={event => {if (drag.current) {
        event.currentTarget.scrollLeft = drag.current.left + drag.current.x - event.clientX;
        event.currentTarget.scrollTop = drag.current.top + drag.current.y - event.clientY;
      }}}
      onPointerUp={() => {drag.current = null;}} onPointerCancel={() => {drag.current = null;}} onLostPointerCapture={() => {drag.current = null;}}>
      <div className="archive-canvas" style={{width: canvasWidth, height: canvasHeight}}>
        <img ref={sheet} className="archive-sheet" src={map.image.src} alt={map.title + '. ' + map.copyDate} draggable={false} width={map.image.width} height={map.image.height}
          style={{width, height}} onLoad={() => {setLoaded(true); setFailed(false);}} onError={() => setFailed(true)} data-ready={loaded}/>
      </div>
    </div>
    {!loaded && !failed && <div className="archive-loading" role="status">Arşiv haritası açılıyor…</div>}
    {failed && <div className="archive-loading" role="status"><p>Görsel yüklenemedi.</p><a href={map.imageSourceUrl} target="_blank" rel="noopener noreferrer">Kaynakta incele <Icon name="external" size={15}/></a></div>}
    <div className="archive-toolbar" aria-label="Tarihî harita kontrolleri">
      <button aria-label="Tarihî haritayı uzaklaştır" disabled={zoom === 1 || !loaded} onClick={() => setMagnification(zoom - .5)}><Icon name="minus"/></button>
      <output aria-label="Harita büyütme oranı">{Math.round(zoom * 100)}%</output>
      <button aria-label="Tarihî haritayı yakınlaştır" disabled={zoom === 4 || !loaded} onClick={() => setMagnification(zoom + .5)}><Icon name="plus"/></button>
      <span className="toolbar-divider"/>
      <button aria-label="Haritanın tamamını göster" title="Haritanın tamamı" onClick={() => setMagnification(1, {x: .5, y: .5})}><Icon name="fit"/></button>
      {canFullscreen && <button aria-label={fullscreen ? 'Tam ekrandan çık' : 'Haritayı tam ekran aç'} aria-pressed={fullscreen} onClick={toggleFullscreen}><Icon name="expand"/></button>}
    </div>
    <div className="archive-footer"><p id="archive-gesture-hint">Yakınlaştır, ardından sürükle. Klavyeyle incelemek için haritaya odaklan ve ok tuşlarını kullan.</p>
      <a href={map.imageSourceUrl} target="_blank" rel="noopener noreferrer">Library of Congress / Wikimedia Commons · Kamu malı <Icon name="external" size={12}/></a>
      {notice && <p role="status">{notice}</p>}
    </div>
  </div>;
}
