import stories from '../../../../data/polity-stories.json';

export function PolityStory({polityId}:{polityId:string}) {
  const story=stories.find(item=>item.polityId===polityId);
  if(!story)return null;
  return <section className="polity-story" aria-label="Kültür ve tarih notları">
    <p className="story-status">Ön bilgi · bağımsız inceleme bekliyor</p>
    <h2>{story.title}</h2>
    <p className="story-scope">Genel tarihçe; seçili yıla özgü değildir. Sonraki dönemlerden bilgiler içerebilir.</p>
    <p>{story.summary}</p>
    <ul className="story-places" aria-label="İlgili yerler">{story.places.map(place=><li key={place}>{place}</li>)}</ul>
    <ol className="story-highlights">{story.highlights.map(item=><li key={item.label}><strong>{item.label}</strong><p>{item.text}</p></li>)}</ol>
    <details><summary>Bu anlatının kaynağı ve kullanım bilgisi</summary>
      <a href={story.source.url} target="_blank" rel="noopener noreferrer">{story.source.title} · UNESCO</a>
      <p>{story.source.locator} · Erişim: {story.source.accessedOn}</p>
      <p>{story.source.adaptation}</p>
      <a href={story.source.licenseUrl} target="_blank" rel="noopener noreferrer">{story.source.license}</a>
    </details>
  </section>;
}
