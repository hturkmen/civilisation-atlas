import {readFile, writeFile, mkdir, rename} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {validateArchiveMaps} from '../packages/domain/src/archive.mjs';

const root = new URL('../', import.meta.url);
const maps = validateArchiveMaps(JSON.parse(await readFile(new URL('data/historical-maps.json', root), 'utf8')));
const digest = value => createHash('sha256').update(value).digest('hex');
for (const map of maps) {
  const target = new URL('apps/web/public' + map.image.src, root);
  let existing;
  try {existing = await readFile(target);} catch (error) {if (error.code !== 'ENOENT') throw error;}
  if (existing && digest(existing) === map.image.sha256) continue;
  const source = new URL(map.image.downloadUrl);
  if (!['thumb.wikimedia.org', 'upload.wikimedia.org'].includes(source.hostname)) throw new Error('Archive download host is not approved');
  const response = await fetch(source, {signal: AbortSignal.timeout(30000), headers: {
    'User-Agent': 'CivilisationAtlas/0.1 (https://github.com/hturkmen/civilisation-atlas; archival demo asset)',
  }});
  if (!response.ok || !response.headers.get('content-type')?.startsWith('image/jpeg') || !response.body) throw new Error('Archive image download failed: ' + response.status);
  const chunks = [];
  let bytes = 0;
  for await (const chunk of response.body) {
    bytes += chunk.length;
    if (bytes > 8000000) throw new Error('Archive image exceeds the download limit');
    chunks.push(chunk);
  }
  const image = Buffer.concat(chunks);
  if (digest(image) !== map.image.sha256) throw new Error('Archive image changed; review the new source before publishing');
  await mkdir(new URL('.', target), {recursive: true});
  const temporary = new URL(target.href + '.tmp');
  await writeFile(temporary, image);
  await rename(temporary, target);
}
console.log('Prepared verified local archive images.');
