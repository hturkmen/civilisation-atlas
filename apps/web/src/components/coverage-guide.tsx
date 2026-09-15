import type {CollectionStop} from '@atlas/domain/collection';
import {formatYear} from '@atlas/domain/chronology';
import {Icon} from './icon';

export function CoverageGuide({previous, next, onJump}: {
  previous: CollectionStop | null; next: CollectionStop | null; onJump: (year: number) => void;
}) {
  if (!previous && !next) return null;
  return <nav className="coverage-guide" aria-label="En yakın kaynaklı yıllar">
    <p>Kaynak bulunan bir yıla geç</p>
    <div>{([{stop: previous, direction: 'Önceki', icon: 'back'}, {stop: next, direction: 'Sonraki', icon: 'arrow'}] as const).map(({stop, direction, icon}) => stop && <button key={direction} onClick={() => onJump(stop.year)} aria-label={direction + ' kaynaklı yıl: ' + formatYear(stop.year)}>
      <span><small>{direction} kaynaklı yıl</small><strong>{formatYear(stop.year)}</strong><span>{stop.names[0]}{stop.names.length > 1 ? ' + ' + (stop.names.length - 1) : ''}</span></span><Icon name={icon} size={17}/>
    </button>)}</div>
  </nav>;
}
