import {copyFile, mkdir, readFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

// MapLibre 6 uses a separate module worker. Bundlers cannot infer its URL
// after import.meta.url is rewritten. Serve the pinned worker and its shared
// module from our own origin, keeping the upstream licence with the assets.
const require = createRequire(import.meta.url);
const packageRoot = path.dirname(require.resolve('maplibre-gl/package.json'));
const {version} = JSON.parse(await readFile(path.join(packageRoot, 'package.json'), 'utf8'));
const output = fileURLToPath(new URL('../apps/web/public/vendor/maplibre/' + version + '/', import.meta.url));
await mkdir(output, {recursive: true});
for (const file of ['maplibre-gl-worker.mjs', 'maplibre-gl-shared.mjs']) {
  await copyFile(path.join(packageRoot, 'dist', file), path.join(output, file));
}
await copyFile(path.join(packageRoot, 'LICENSE.txt'), path.join(output, 'LICENSE.txt'));
console.log('Prepared same-origin MapLibre ' + version + ' worker.');
