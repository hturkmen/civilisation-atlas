'use client';

export default function ErrorPage({reset}: {reset: () => void}) {
  return <main className="error-page"><p className="eyebrow">CIVILISATION ATLAS</p>
    <h1>Atlas şu anda açılamadı.</h1><p>Sayfayı yeniden yükleyerek tekrar deneyebilirsin.</p>
    <button className="primary-button" onClick={reset}>Tekrar dene</button></main>;
}
