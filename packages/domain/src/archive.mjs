/** Facsimiles are selected by their publication year, never interpolated. */
export function archiveMapsAtYear(maps, year) {
  return maps.filter(map => map.publicationYear === year);
}

export function validateArchiveMaps(maps) {
  const ids = new Set();
  for (const map of maps) {
    if (!/^[a-z0-9-]+$/.test(map.id) || ids.has(map.id)) throw new Error('Invalid archive identity');
    ids.add(map.id);
    if (!Number.isInteger(map.publicationYear) || map.representation !== 'facsimile') throw new Error('Invalid archive date or representation');
    for (const field of ['title', 'creator', 'knowledgeDate', 'copyDate', 'perspective', 'summary', 'sourceLocator', 'holdingInstitution', 'license', 'accessedOn']) {
      if (typeof map[field] !== 'string' || !map[field].trim()) throw new Error('Missing archive metadata: ' + field);
    }
    for (const value of [map.sourceUrl, map.imageSourceUrl, map.licenseUrl, map.image.downloadUrl]) {
      if (new URL(value).protocol !== 'https:') throw new Error('Unsafe archive source');
    }
    if (!/^\/maps\/[a-z0-9-]+\.jpg$/.test(map.image.src) || !/^[a-f0-9]{64}$/.test(map.image.sha256)) throw new Error('Unpinned archive image');
    if (![map.image.width, map.image.height].every(value => Number.isInteger(value) && value > 0 && value <= 20000)) throw new Error('Invalid archive image dimensions');
  }
  return maps;
}
