'use client';

import {useEffect, useMemo, useRef, useState} from 'react';
import {MIN_YEAR, type Place} from '@atlas/domain/catalog';
import type {BoundaryCollection} from '@atlas/domain/boundaries';
import {collectionStops} from '@atlas/domain/collection';
import type {ArchiveMap} from '@atlas/domain/archive';
import {formatYear, toAstronomicalYear, toDisplayYear, type Era} from '@atlas/domain/chronology';
import {Icon} from './icon';

export function Timeline({year, maxYear, places, onChange, mode, maps, boundaries, onOpenArchive, onJumpToCollection, disabled = false}: {
  year: number; maxYear: number; places: Place[]; onChange: (year: number) => void; disabled?: boolean;
  mode: 'history' | 'known'; maps: ArchiveMap[]; onOpenArchive: (year: number) => void; onJumpToCollection: (year: number) => void;
  boundaries: BoundaryCollection;
}) {
  const display = toDisplayYear(year);
  const [input, setInput] = useState(String(display.year));
  const [era, setEra] = useState<Era>(display.era);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState('');
  const stopsNav = useRef<HTMLElement>(null);
  const stops = useMemo(() => collectionStops(places, boundaries, maps), [places, boundaries, maps]);
  const historyStops = stops.filter(stop => stop.mode === 'history');
  const nextHistoryYear = historyStops.find(stop => stop.year > year)?.year;
  useEffect(() => {setInput(String(toDisplayYear(year).year)); setEra(toDisplayYear(year).era); setError('');}, [year]);
  useEffect(() => {if (disabled) setPlaying(false);}, [disabled]);
  useEffect(() => {setPlaying(false);}, [mode]);
  useEffect(() => {
    const nav = stopsNav.current;
    const active = nav?.querySelector<HTMLElement>('[aria-current="step"]');
    if (!nav || !active) return;
    const left = active.getBoundingClientRect().left - nav.getBoundingClientRect().left + nav.scrollLeft;
    if (left < nav.scrollLeft || left + active.offsetWidth > nav.scrollLeft + nav.clientWidth) {
      nav.scrollTo({left: left - (nav.clientWidth - active.offsetWidth) / 2, behavior: 'instant'});
    }
  }, [year, mode]);
  useEffect(() => {
    if (!playing || disabled) return;
    if (nextHistoryYear === undefined) {setPlaying(false); return;}
    const timer = window.setTimeout(() => onJumpToCollection(nextHistoryYear), 3000);
    return () => window.clearTimeout(timer);
  }, [playing, disabled, nextHistoryYear, onJumpToCollection]);
  useEffect(() => {
    const pause = () => {if (document.hidden) setPlaying(false);};
    document.addEventListener('visibilitychange', pause);
    return () => document.removeEventListener('visibilitychange', pause);
  }, []);
  const pct = (value: number) => ((value - MIN_YEAR) / (maxYear - MIN_YEAR)) * 100;
  const ticks = [MIN_YEAR, -2999, -1999, -999, 1, 1000, maxYear];
  const previous = stops.filter(stop => stop.year < year).at(-1);
  const next = stops.find(stop => stop.year > year);
  const go = (stop: typeof stops[number]) => {
    setPlaying(false);
    if (stop.mode === 'known') onOpenArchive(stop.year); else onJumpToCollection(stop.year);
  };

  return <section className={'timeline' + (disabled ? ' inactive' : '')} aria-label="Tarih seçimi">
    <div className="time-input">
      <span className="eyebrow">ZAMANDA YOLCULUK</span>
      <form onSubmit={event => {
        event.preventDefault(); setPlaying(false);
        if (!/^[1-9][0-9]{0,5}$/.test(input)) {setError('1 veya daha büyük bir tam yıl gir.'); return;}
        const value = toAstronomicalYear({year: Number(input), era});
        if (value < MIN_YEAR || value > maxYear) {setError('MÖ 4000 ile MS ' + maxYear + ' arasında bir yıl seç.'); return;}
        setError(''); onChange(value);
      }}>
        <select aria-label="Tarih dönemi" value={era} onChange={e => setEra(e.target.value as Era)} disabled={disabled}>
          <option value="BCE">MÖ</option><option value="CE">MS</option>
        </select>
        <input aria-label="Yıl" inputMode="numeric" pattern="[0-9]+" maxLength={6} value={input} onChange={e => setInput(e.target.value)} aria-describedby={error ? 'year-error' : undefined} aria-invalid={!!error} disabled={disabled}/>
        <button type="submit" aria-label="Yıla git" disabled={disabled}><Icon name="arrow"/></button>
      </form>
      {error ? <p id="year-error" className="form-error" role="alert">{error}</p> : <span className="time-hint">Bir tarih yaz veya çizgiyi kaydır.</span>}
      <div className="collection-step-controls"><button disabled={!previous || disabled} aria-label="Önceki koleksiyon durağı" title={previous ? formatYear(previous.year) : 'Önceki durak yok'} onClick={() => previous && go(previous)}><Icon name="back" size={15}/></button><span>KOLEKSİYON DURAKLARI</span><button disabled={!next || disabled} aria-label="Sonraki koleksiyon durağı" title={next ? formatYear(next.year) : 'Sonraki durak yok'} onClick={() => next && go(next)}><Icon name="arrow" size={15}/></button></div>
    </div>
    <div className="time-track">
      <div className="track-heading"><span>6.000 yılı aşan bir yolculuk</span>
        {mode === 'known' ? <span className="archive-time-note">Eserlerin yayım yılına göre</span> : <button className="play-button" aria-label={playing ? 'Zamanı durdur' : 'Zamanı oynat'} aria-pressed={playing} disabled={disabled} onClick={() => {
          if (!playing && nextHistoryYear === undefined && historyStops[0]) onJumpToCollection(historyStops[0].year);
          setPlaying(value => !value);
        }}><Icon name={playing ? 'pause' : 'play'} size={15}/>{playing ? 'Duraklat' : 'Koleksiyonu oynat'}<small>3 sn/durak</small></button>}
      </div>
      <div className="slider-wrap">
        <div className="coverage-track" aria-hidden="true">{mode === 'history' ? <>{places.map(place => <span key={place.id} style={{left: pct(place.period.start) + '%', width: (pct(place.period.endExclusive) - pct(place.period.start)) + '%'}}/>)}{boundaries.records.map(record => <span className="boundary-coverage" key={record.id} style={{left: pct(record.period.start) + '%', width: (pct(record.period.endExclusive) - pct(record.period.start)) + '%'}}/>)}</> : maps.map(map => <span className="archive-year-mark" key={map.id} style={{left: pct(map.publicationYear) + '%'}}/>)}</div>
        <input className="year-slider" type="range" min={MIN_YEAR} max={maxYear} step={1} value={year} disabled={disabled} aria-label="Zaman çizelgesi" aria-valuetext={formatYear(year)}
          onChange={e => {setPlaying(false); onChange(Number(e.target.value));}}/>
      </div>
      <div className="time-ticks">{ticks.map((tick, i) => <button key={tick} className={i === 0 ? 'first' : i === ticks.length - 1 ? 'last' : ''} style={{left: pct(tick) + '%'}} disabled={disabled} onClick={() => {setPlaying(false); onChange(tick);}}>{tick === maxYear ? 'Günümüz' : formatYear(tick)}</button>)}</div>
      <div className="track-caption"><span className={'coverage-key' + (mode === 'known' ? ' archive-key' : '')}/>{mode === 'known' ? 'Altın işaretler arşiv eserlerinin yayım yıllarıdır.' : 'Yeşil: yerleşimler · Altın: alan kayıtları · Boşluklar tamamlanmayı bekliyor.'}</div>
      <nav ref={stopsNav} className="collection-stops" aria-label="Koleksiyonda keşfedilecek tarihler">{stops.map(stop => <button key={stop.mode + stop.year} className={stop.mode === 'known' ? 'archive-stop' : ''} aria-current={year === stop.year && mode === stop.mode ? 'step' : undefined} onClick={() => go(stop)} disabled={disabled}>
        <Icon name={stop.mode === 'known' ? 'map' : 'pin'} size={15}/><strong>{formatYear(stop.year)}</strong><span>{stop.mode === 'known' ? 'Arşiv haritası' : [stop.areaCount ? stop.areaCount + ' alan' : '', stop.placeCount ? stop.placeCount + ' yerleşim' : ''].filter(Boolean).join(' · ')}</span>
      </button>)}</nav>
    </div>
  </section>;
}
