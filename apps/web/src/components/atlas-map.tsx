'use client';

import {useEffect, useRef, useState} from 'react';
import type {Map as MapInstance, Marker, StyleSpecification} from 'maplibre-gl';
import type {Place} from '@atlas/domain/catalog';
import type {VisibleBoundary} from '@atlas/domain/boundaries';
import {boundaryCollection} from '@/lib/boundaries';
import {Icon} from './icon';

const style: StyleSpecification = {
  version: 8,
  sources: {
    boundaries: {type: 'geojson', data: boundaryCollection.geometryPath, attribution: '<a href="https://github.com/Seshat-Global-History-Databank/cliopatria" target="_blank" rel="noopener noreferrer">Cliopatria · Seshat</a> · <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">CC BY 4.0</a> · uyarlanmış'},
    land: {type: 'geojson', data: '/data/land.geojson', attribution: '<a href="https://www.naturalearthdata.com/about/terms-of-use/" target="_blank" rel="noopener noreferrer">Natural Earth · public domain</a>'},
    grid: {type: 'geojson', data: {
      type: 'FeatureCollection', features: [
        ...Array.from({length: 11}, (_, i) => ({type: 'Feature' as const, properties: {}, geometry: {type: 'LineString' as const, coordinates: [[-150 + i * 30, -80], [-150 + i * 30, 80]]}})),
        ...Array.from({length: 5}, (_, i) => ({type: 'Feature' as const, properties: {}, geometry: {type: 'LineString' as const, coordinates: [[-180, -60 + i * 30], [180, -60 + i * 30]]}})),
      ],
    }},
  },
  layers: [
    {id: 'water', type: 'background', paint: {'background-color': '#dbe5e5'}},
    {id: 'graticule', type: 'line', source: 'grid', paint: {'line-color': '#afc5c6', 'line-opacity': 0.48, 'line-width': 0.7}},
    {id: 'land-fill', type: 'fill', source: 'land', paint: {'fill-color': '#f4f1e8'}},
    {id: 'coastline', type: 'line', source: 'land', paint: {'line-color': '#b5bcb0', 'line-width': 0.8}},
    {id: 'polity-fill', type: 'fill', source: 'boundaries', filter: ['==', ['get', 'recordId'], ''], paint: {'fill-color': ['get', 'color'], 'fill-opacity': 0.3}},
    {id: 'polity-line', type: 'line', source: 'boundaries', filter: ['==', ['get', 'recordId'], ''], paint: {'line-color': ['get', 'color'], 'line-width': 1.2, 'line-opacity': 0.9}},
  ],
};

export function AtlasMap({places, selectedId, onSelect, boundaries, selectedPolityId, onSelectPolity}: {
  places: Place[]; selectedId: string | null; onSelect: (id: string) => void;
  boundaries: VisibleBoundary[]; selectedPolityId?: string; onSelectPolity: (id: string) => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapInstance | null>(null);
  const markers = useRef<Marker[]>([]);
  const boundaryMarkers = useRef<Marker[]>([]);
  const leadersRef = useRef<SVGSVGElement>(null);
  const selectRef = useRef(onSelect);
  const selectPolityRef = useRef(onSelectPolity);
  const [overlapIds, setOverlapIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  selectRef.current = onSelect;
  selectPolityRef.current = onSelectPolity;

  useEffect(() => {
    let cancelled = false;
    let localMap: MapInstance | undefined;
    let observer: ResizeObserver | undefined;
    let loadTimeout: ReturnType<typeof setTimeout> | undefined;
    import('maplibre-gl').then(({Map, setWorkerUrl, getVersion}) => {
      if (cancelled || !container.current) return;
      try {
        setWorkerUrl('/vendor/maplibre/' + getVersion() + '/maplibre-gl-worker.mjs');
        localMap = new Map({container: container.current, style, center: [8, 12], zoom: 1,
          minZoom: 0, maxZoom: 6, renderWorldCopies: false, attributionControl: {compact: false},
          dragRotate: false, pitchWithRotate: false, touchPitch: false});
        mapRef.current = localMap;
        localMap.touchZoomRotate.disableRotation();
        localMap.fitBounds([[-128, -54], [132, 64]], {padding: {top: 90, bottom: 70, left: 40, right: 40}, duration: 0});
        loadTimeout = setTimeout(() => {if (!cancelled) setFailed(true);}, 15000);
        localMap.on('load', () => {
          clearTimeout(loadTimeout);
          if (!cancelled) {setReady(true); setFailed(false);}
        });
        localMap.on('click', 'polity-fill', event => {
          const ids = [...new Set((event.features ?? []).map(feature => String(feature.properties.polityId)))];
          if (ids.length === 1) {setOverlapIds([]); selectPolityRef.current(ids[0]);}
          else if (ids.length > 1) setOverlapIds(ids);
        });
        localMap.on('mouseenter', 'polity-fill', () => {if (localMap) localMap.getCanvas().style.cursor = 'pointer';});
        localMap.on('mouseleave', 'polity-fill', () => {if (localMap) localMap.getCanvas().style.cursor = '';});
        localMap.on('error', () => {if (!cancelled) setFailed(true);});
        observer = new ResizeObserver(() => localMap?.resize());
        observer.observe(container.current);
      } catch {
        setFailed(true);
      }
    }).catch(() => {if (!cancelled) setFailed(true);});
    return () => {
      cancelled = true;
      clearTimeout(loadTimeout);
      observer?.disconnect();
      markers.current.forEach(marker => marker.remove());
      markers.current = [];
      boundaryMarkers.current.forEach(marker => marker.remove());
      boundaryMarkers.current = [];
      localMap?.remove();
      mapRef.current = null;
    };
  }, []);

  const boundaryKey = boundaries.map(item => item.record.id).join(',');
  useEffect(() => {
    if (!ready || !mapRef.current) return;
    const map = mapRef.current;
    let cancelled = false;
    setOverlapIds([]);
    const filter: import('maplibre-gl').FilterSpecification = ['in', ['get', 'recordId'], ['literal', boundaries.map(item => item.record.id)]];
    map.setFilter('polity-fill', filter);
    map.setFilter('polity-line', filter);
    map.setPaintProperty('polity-fill', 'fill-opacity', ['case', ['==', ['get', 'polityId'], selectedPolityId ?? ''], 0.47, 0.27]);
    map.setPaintProperty('polity-line', 'line-width', ['case', ['==', ['get', 'polityId'], selectedPolityId ?? ''], 2.5, 1.1]);
    boundaryMarkers.current.forEach(marker => marker.remove());
    boundaryMarkers.current = [];
    const positionBoundaryLabels = () => {
      if (!showLabels) {leadersRef.current?.replaceChildren(); return;}
      const host = map.getContainer();
      const origin = host.getBoundingClientRect();
      const lines: SVGLineElement[] = [];
      const placed = [...host.parentElement!.querySelectorAll<HTMLElement>('.marker-label:not([hidden]), .marker-dot, .map-heading, .map-controls, .map-legend')].map(element => {
        const rect = element.getBoundingClientRect();
        return {left: rect.left - origin.left, right: rect.right - origin.left, top: rect.top - origin.top, bottom: rect.bottom - origin.top};
      });
      for (const marker of boundaryMarkers.current) {
        const point = map.project(marker.getLngLat());
        const element = marker.getElement();
        const width = element.offsetWidth;
        const height = element.offsetHeight;
        let positioned = false;
        for (const dy of [0, 60, -60, 120, -120, 180]) {
          for (const dx of [0, -60, 60, -120, 120, -180, 180]) {
            const box = {left: point.x + dx - width / 2, right: point.x + dx + width / 2, top: point.y + dy - height / 2, bottom: point.y + dy + height / 2};
            if (box.left < 5 || box.right > host.clientWidth - 5 || box.top < 5 || box.bottom > host.clientHeight - 5) continue;
            if (placed.every(other => box.right < other.left - 5 || box.left > other.right + 5 || box.bottom < other.top - 5 || box.top > other.bottom + 5)) {
              marker.setOffset([dx, dy]); placed.push(box); positioned = true;
              const back = Math.min(dx ? width / (2 * Math.abs(dx)) : Infinity, dy ? height / (2 * Math.abs(dy)) : Infinity);
              if (back < 1) {
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                for (const [key, value] of Object.entries({x1: point.x, y1: point.y, x2: point.x + dx * (1 - back), y2: point.y + dy * (1 - back)})) line.setAttribute(key, String(value));
                line.setAttribute('stroke', element.style.getPropertyValue('--polity-color'));
                lines.push(line);
              }
              break;
            }
          }
          if (positioned) break;
        }
        element.style.visibility = positioned ? '' : 'hidden';
      }
      leadersRef.current?.replaceChildren(...lines);
    };
    const host = container.current;
    host?.addEventListener('atlas-label-layout', positionBoundaryLabels);
    map.on('move', positionBoundaryLabels);
    map.on('resize', positionBoundaryLabels);
    import('maplibre-gl').then(({Marker}) => {
      if (cancelled) return;
      boundaryMarkers.current = boundaries.map(({polity, record}) => {
        const element = document.createElement('button');
        element.type = 'button';
        element.className = 'polity-map-label' + (selectedPolityId === polity.id ? ' selected' : '');
        element.style.setProperty('--polity-color', polity.color);
        element.textContent = polity.name;
        element.hidden = !showLabels;
        element.setAttribute('aria-label', polity.name + ' alanını seç');
        element.setAttribute('aria-pressed', String(selectedPolityId === polity.id));
        element.addEventListener('click', () => selectPolityRef.current(polity.id));
        return new Marker({element, anchor: 'center'}).setLngLat(record.labelPoint).addTo(map);
      });
      positionBoundaryLabels();
    });
    return () => {cancelled = true; host?.removeEventListener('atlas-label-layout', positionBoundaryLabels); map.off('move', positionBoundaryLabels); map.off('resize', positionBoundaryLabels);};
  }, [ready, boundaryKey, selectedPolityId, showLabels]);

  useEffect(() => {
    if (!ready || !selectedPolityId) return;
    const boundary = boundaries.find(item => item.polity.id === selectedPolityId);
    if (!boundary) return;
    const [west, south, east, north] = boundary.record.bbox;
    mapRef.current?.fitBounds([[west, south], [east, north]], {padding: {top: 125, bottom: 85, left: 50, right: 70}, maxZoom: 4,
      duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 800});
  }, [ready, selectedPolityId]); // Changing the year preserves the user's camera.

  useEffect(() => {
    if (!ready || !mapRef.current) return;
    let cancelled = false;
    const map = mapRef.current;
    const positionLabels = () => {
      for (const marker of markers.current) {
        const x = map.project(marker.getLngLat()).x;
        marker.getElement().querySelector('.marker-label')?.classList.toggle('label-left', x > map.getCanvas().clientWidth - 170);
      }
      container.current?.dispatchEvent(new Event('atlas-label-layout'));
    };
    map.on('move', positionLabels);
    map.on('resize', positionLabels);
    import('maplibre-gl').then(({Marker}) => {
      if (cancelled || !mapRef.current) return;
      markers.current.forEach(marker => marker.remove());
      markers.current = places.map(place => {
        const element = document.createElement('button');
        element.type = 'button';
        element.className = 'map-marker' + (selectedId === place.id ? ' selected' : '');
        element.setAttribute('aria-label', place.name + ' yerleşimini seç');
        element.setAttribute('aria-pressed', String(selectedId === place.id));
        const dot = document.createElement('span');
        dot.className = 'marker-dot';
        const label = document.createElement('span');
        label.className = 'marker-label';
        label.hidden = !showLabels;
        label.textContent = place.name;
        element.append(dot, label);
        element.addEventListener('click', () => selectRef.current(place.id));
        return new Marker({element, anchor: 'center'}).setLngLat(place.coordinates).addTo(mapRef.current!);
      });
      positionLabels();
    });
    return () => {cancelled = true; map.off('move', positionLabels); map.off('resize', positionLabels);};
  }, [ready, places, selectedId, showLabels]);

  useEffect(() => {
    if (!ready || !selectedId) return;
    const place = places.find(p => p.id === selectedId);
    if (place) mapRef.current?.flyTo({center: place.coordinates, zoom: 3.2,
      duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 900});
  }, [selectedId, ready]); // Selection changes move the camera; filtering alone does not.

  function reset() {
    mapRef.current?.fitBounds([[-128, -54], [132, 64]], {padding: {top: 90, bottom: 70, left: 40, right: 40},
      duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 600});
  }

  return <>
    <div ref={container} className="map-canvas" role="region" aria-label="Etkileşimli dünya haritası" data-testid="atlas-map" data-ready={ready} />
    <svg ref={leadersRef} className="polity-leaders" aria-hidden="true"/>
    {!ready && !failed && <div className="map-loading" role="status"><Icon name="globe"/> Harita hazırlanıyor…</div>}
    {failed && <div className="map-fallback" role="status"><Icon name="map" size={32}/><h2>Harita görüntülenemiyor</h2>
      <p>Yerleşimleri ve siyasi yapıları listeden seçerek tarih ve kaynakları keşfetmeye devam edebilirsin.</p></div>}
    {overlapIds.length > 1 && <div className="map-overlap" role="group" aria-label="Bu noktadaki alanlar"><strong>Bu noktada birden fazla alan var</strong>{boundaries.filter(item => overlapIds.includes(item.polity.id)).map(({polity}) => <button key={polity.id} onClick={() => {setOverlapIds([]); onSelectPolity(polity.id);}}>{polity.name}</button>)}<button onClick={() => setOverlapIds([])}>Kapat</button></div>}
    <div className="map-controls" aria-label="Harita kontrolleri">
      <button onClick={() => mapRef.current?.zoomIn({duration: 150})} aria-label="Yakınlaştır" disabled={!ready || failed}><Icon name="plus"/></button>
      <button onClick={() => mapRef.current?.zoomOut({duration: 150})} aria-label="Uzaklaştır" disabled={!ready || failed}><Icon name="minus"/></button>
      <button onClick={reset} aria-label="Dünya görünümüne dön" disabled={!ready || failed}><Icon name="globe"/></button>
      <button onClick={() => setShowLabels(value => !value)} aria-label="Haritadaki adları göster" aria-pressed={showLabels} disabled={!ready || failed}><Icon name="layers"/></button>
    </div>
  </>;
}
