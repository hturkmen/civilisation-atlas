import type { Metadata } from 'next';
import 'maplibre-gl/dist/maplibre-gl.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'Civilisation Atlas — Tarihin izini sür',
  description: 'MÖ 4000’den günümüze kaynaklarla dünya tarihini keşfet. Başlangıç koleksiyonu: üç yerleşim, açık kaynak bağlantıları ve tarih gezinmesi.',
  robots: {index: false, follow: false},
};

export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  return <html lang="tr"><body>{children}</body></html>;
}
