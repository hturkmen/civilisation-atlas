'use client';

import {useEffect, useState} from 'react';
import {MIN_YEAR, type Place} from '@atlas/domain/catalog';
import {formatYear, toAstronomicalYear, toDisplayYear, type Era} from '@atlas/domain/chronology';
import {Icon} from './icon';

export function Timeline({year, maxYear, places, onChange, disabled = false}: {
  year: number; maxYear: number; places: Place[]; onChange: (year: number) => void; disabled?: boolean;
}) {
  const display = toDisplayYear(year);
  const [input, setInput] = useState(String(display.year));
  const [era, setEra] = useState<Era>(display.era);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {setInput(String(toDisplayYear(year).year)); setEra(toDisplayYear(year).era); setError('');}, [year]);
  useEffect(() => {if (disabled) setPlaying(false);}, [disabled]);
  useEffect(() => {
    if (!playing || disabled) return;
    if (year >= maxYear) {setPlaying(false); return;}
    const timer = window.setTimeout(() => onChange(Math.min(maxYear, year + 100)), 1000);
    return () => window.clearTimeout(timer);
  }, [playing, disabled, year, maxYear, onChange]);
  useEffect(() => {
    const pause = () => {if (document.hidden) setPlaying(false);};
    document.addEventListener('visibilitychange', pause);
    return () => document.removeEventListener('visibilitychange', pause);
  }, []);
  const pct = (value: number) => ((value - MIN_YEAR) / (maxYear - MIN_YEAR)) * 100;
  const ticks = [MIN_YEAR, -2999, -1999, -999, 1, 1000, maxYear];

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
    </div>
    <div className="time-track">
      <div className="track-heading"><span>6.000 yılı aşan bir yolculuk</span>
        <button className="play-button" aria-label={playing ? 'Zamanı durdur' : 'Zamanı oynat'} aria-pressed={playing} disabled={disabled} onClick={() => {
          if (!playing && year >= maxYear) onChange(MIN_YEAR);
          setPlaying(value => !value);
        }}><Icon name={playing ? 'pause' : 'play'} size={15}/>{playing ? 'Duraklat' : 'Oynat'}<small>100 yıl/sn</small></button>
      </div>
      <div className="slider-wrap">
        <div className="coverage-track" aria-hidden="true">{places.map(place => <span key={place.id} style={{left: pct(place.period.start) + '%', width: (pct(place.period.endExclusive - 1) - pct(place.period.start)) + '%'}}/>)}</div>
        <input className="year-slider" type="range" min={MIN_YEAR} max={maxYear} step={1} value={year} disabled={disabled} aria-label="Zaman çizelgesi" aria-valuetext={formatYear(year)}
          onChange={e => {setPlaying(false); onChange(Number(e.target.value));}}/>
      </div>
      <div className="time-ticks">{ticks.map((tick, i) => <button key={tick} className={i === 0 ? 'first' : i === ticks.length - 1 ? 'last' : ''} style={{left: pct(tick) + '%'}} disabled={disabled} onClick={() => {setPlaying(false); onChange(tick);}}>{tick === maxYear ? 'Günümüz' : formatYear(tick)}</button>)}</div>
      <div className="track-caption"><span className="coverage-key"/> Renkli aralıklar başlangıç koleksiyonunun dönem kapsamıdır.</div>
    </div>
  </section>;
}
