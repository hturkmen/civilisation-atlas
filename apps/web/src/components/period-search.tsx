import type {Place} from '@atlas/domain/catalog';
import type {PeriodSearchResults} from '@atlas/domain/collection';
import {formatYear} from '@atlas/domain/chronology';
import {Icon} from './icon';

export function PeriodSearch({results, onPolity, onPlace}: {
  results: PeriodSearchResults; onPolity: (year: number, id: string) => void; onPlace: (place: Place) => void;
}) {
  const count = results.polities.length + results.places.length;
  return <section className="period-search" aria-labelledby="period-search-title">
    <div className="section-heading results-heading"><h2 id="period-search-title">Diğer dönemlerde keşfet</h2><span role="status">{count} eşleşme</span></div>
    <p className="period-search-note">Bunlar koleksiyondaki kaynak dönemleridir; kuruluş ve yıkılış tarihleri değildir.</p>
    {!count && <p className="period-search-empty">Diğer kaynak dönemlerinde de eşleşme yok. Başka bir ad deneyebilirsin.</p>}
    <ul className="period-search-list">
      {results.polities.map(({polity, records}) => <li key={polity.id}>
        <h3><i className="polity-swatch" style={{background: polity.color}}/>{polity.name}</h3>
        <span className="period-search-kind">Yaklaşık alan · {records.length} kaynak dönemi</span>
        {records.map(record => <button key={record.id} onClick={() => onPolity(record.sampleYear, polity.id)} aria-label={polity.name + ', ' + formatYear(record.sampleYear) + ' örneğini aç'}>
          <span><small>Kaynak dönemi</small><strong>{formatYear(record.period.start)} – {formatYear(record.period.endExclusive - 1)}</strong><span className="period-search-action">{formatYear(record.sampleYear)} örneğini aç</span></span><Icon name="arrow" size={17}/>
        </button>)}
      </li>)}
      {results.places.map(place => <li key={place.id}>
        <h3>{place.name}</h3><span className="period-search-kind">Yerleşim · {place.region}</span>
        <button onClick={() => onPlace(place)} aria-label={place.name + ', ' + formatYear(place.suggestedYear) + ' örneğini aç'}>
          <span><small>Kaynağın odaklandığı dönem</small><strong>{formatYear(place.period.start)} – {formatYear(place.period.endExclusive - 1)}</strong><span className="period-search-action">{formatYear(place.suggestedYear)} örneğini aç</span></span><Icon name="arrow" size={17}/>
        </button>
      </li>)}
    </ul>
  </section>;
}
