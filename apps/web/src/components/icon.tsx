import type { CSSProperties } from 'react';

const paths = {
  globe: <><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18M5 6h14M5 18h14"/></>,
  compass: <><circle cx="12" cy="12" r="9"/><path d="m16 8-3 5-5 3 3-5 5-3Z"/></>,
  map: <><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6ZM9 3v15m6-12v15"/></>,
  search: <><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></>,
  arrow: <path d="M4 12h16m-6-6 6 6-6 6"/>,
  back: <path d="M20 12H4m6-6-6 6 6 6"/>,
  close: <path d="m6 6 12 12M6 18 18 6"/>,
  book: <><path d="M12 5c-3-2-6-2-9 0v14c3-2 6-2 9 0 3-2 6-2 9 0V5c-3-2-6-2-9 0Zm0 0v14"/></>,
  pin: <><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2"/></>,
  layers: <><path d="m3 8 9-5 9 5-9 5-9-5Zm0 5 9 5 9-5M3 18l9 5 9-5"/></>,
  share: <><path d="M12 16V3m-4 4 4-4 4 4M6 10H4v11h16V10h-2"/></>,
  info: <><circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v1"/></>,
  plus: <path d="M12 5v14M5 12h14"/>,
  minus: <path d="M5 12h14"/>,
  play: <path d="m8 5 11 7-11 7V5Z"/>,
  pause: <><path d="M8 5v14M16 5v14"/></>,
  external: <><path d="M14 3h7v7m0-7L10 14M10 4H4v16h16v-6"/></>,
  check: <path d="m5 12 4 4L19 6"/>,
  expand: <path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>,
  fit: <><rect x="4" y="6" width="16" height="12" rx="1"/><path d="M1 9V3h6m10 0h6v6M1 15v6h6m10 0h6v-6"/></>,
};

export function Icon({name, size = 20, style}: {name: keyof typeof paths; size?: number; style?: CSSProperties}) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={style}>{paths[name]}</svg>;
}
