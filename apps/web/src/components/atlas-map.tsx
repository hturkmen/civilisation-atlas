'use client';

import {useEffect, useRef, useState} from 'react';
import type {Map as MapInstance, Marker, StyleSpecification} from 'maplibre-gl';
import type {Place} from '@atlas/domain/catalog';
import {Icon} from './icon';

const style: StyleSpecification = {
  version: 8,
  sources: {
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
  ],
};

export function AtlasMap({places, selectedId, onSelect}: {
  places: Place[]; selectedId: string | null; onSelect: (id: string) => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapInstance | null>(null);
  const markers = useRef<Marker[]>([]);
  const selectRef = useRef(onSelect);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  selectRef.current = onSelect;

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
      localMap?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!ready || !mapRef.current) return;
    let cancelled = false;
    const map = mapRef.current;
    const positionLabels = () => {
      for (const marker of markers.current) {
        const x = map.project(marker.getLngLat()).x;
        marker.getElement().querySelector('.marker-label')?.classList.toggle('label-left', x > map.getCanvas().clientWidth - 170);
      }
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
    {!ready && !failed && <div className="map-loading" role="status"><Icon name="globe"/> Harita hazırlanıyor…</div>}
    {failed && <div className="map-fallback" role="status"><Icon name="map" size={32}/><h2>Harita görüntülenemiyor</h2>
      <p>Yerleşimleri listeden seçerek tarih ve kaynakları keşfetmeye devam edebilirsin.</p></div>}
    <div className="map-controls" aria-label="Harita kontrolleri">
      <button onClick={() => mapRef.current?.zoomIn({duration: 150})} aria-label="Yakınlaştır" disabled={!ready || failed}><Icon name="plus"/></button>
      <button onClick={() => mapRef.current?.zoomOut({duration: 150})} aria-label="Uzaklaştır" disabled={!ready || failed}><Icon name="minus"/></button>
      <button onClick={reset} aria-label="Dünya görünümüne dön" disabled={!ready || failed}><Icon name="globe"/></button>
      <button onClick={() => setShowLabels(value => !value)} aria-label="Yerleşim adlarını göster" aria-pressed={showLabels} disabled={!ready || failed}><Icon name="layers"/></button>
    </div>
  </>;
}
