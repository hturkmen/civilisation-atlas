"""Rebuild the reviewed subset from an immutable upstream archive.

python -m pip install -r scripts/requirements-ingest.txt
python scripts/import-boundaries.py /path/to/cliopatria.geojson.zip
The archive is supplied explicitly: normal app builds never fetch this dataset.
"""
import hashlib
import json
from pathlib import Path
import sys
import zipfile

from shapely.geometry import shape, mapping
from shapely.geometry.polygon import orient
from shapely.validation import explain_validity

ROOT = Path(__file__).resolve().parents[1]
config = json.loads((ROOT / 'data/boundary-import.json').read_text())
source = config['source']
archive = Path(sys.argv[1])
if archive.stat().st_size > 60_000_000:
    raise ValueError('Archive too large')
if hashlib.sha256(archive.read_bytes()).hexdigest() != source['archiveSha256']:
    raise ValueError('Upstream checksum mismatch; review before changing the pin')
with zipfile.ZipFile(archive) as zipped:
    member = zipped.getinfo(source['archiveMember'])
    if member.file_size > 200_000_000:
        raise ValueError('Uncompressed dataset too large')
    features = json.loads(zipped.read(member))['features']


def year(value):
    # Upstream: -1 = 1 BCE. Atlas: 0 = 1 BCE. Never pass these through Date.
    if not isinstance(value, int) or value == 0:
        raise ValueError('Ambiguous upstream year zero')
    return value + 1 if value < 0 else value


def rounded(value):
    if isinstance(value, (tuple, list)):
        return [rounded(item) for item in value]
    return round(value, 6)


records, output = [], []
for polity in config['polities']:
    for sampled_year in polity['years']:
        matches = [(i, f) for i, f in enumerate(features)
                   if f['properties']['Name'] == polity['sourceName']
                   and f['properties']['Type'] == 'POLITY'
                   and f['properties']['FromYear'] <= sampled_year <= f['properties']['ToYear']]
        if len(matches) != 1:
            raise ValueError(f'Expected exactly one source record: {polity["id"]} {sampled_year}')
        index, feature = matches[0]
        props = feature['properties']
        record_id = f'cliopatria-{index}'  # zero-based position, scoped to the pinned archive
        if any(record['id'] == record_id for record in records):
            raise ValueError('Two samples select the same record; consolidate the import plan')
        original = shape(feature['geometry'])
        if original.geom_type not in ('Polygon', 'MultiPolygon') or original.is_empty or not original.is_valid:
            raise ValueError(f'Invalid source geometry {index}: {explain_validity(original)}')
        geometry = original.simplify(config['simplifyToleranceDegrees'], preserve_topology=True)
        parts = list(geometry.geoms) if geometry.geom_type == 'MultiPolygon' else [geometry]
        # RFC 7946 ring orientation; no boundary invention or repair.
        if geometry.geom_type == 'MultiPolygon':
            from shapely.geometry import MultiPolygon
            geometry = MultiPolygon([orient(part, sign=1) for part in parts])
        else:
            geometry = orient(geometry, sign=1)
        encoded = mapping(geometry)
        encoded['coordinates'] = rounded(encoded['coordinates'])
        geometry = shape(encoded)
        if geometry.is_empty or not geometry.is_valid:
            raise ValueError(f'Invalid derived geometry {index}: {explain_validity(geometry)}')
        parts = list(geometry.geoms) if geometry.geom_type == 'MultiPolygon' else [geometry]
        label = max(parts, key=lambda part: part.area).representative_point()
        period = {'start': year(props['FromYear']), 'endExclusive': year(props['ToYear']) + 1}
        record = {
            'id': record_id, 'polityId': polity['id'], 'sourceIndex': index,
            'sourceFromYear': props['FromYear'], 'sourceToYear': props['ToYear'],
            'period': period, 'sampleYear': year(sampled_year),
            'sourceAreaKm2': props['Area'], 'wikidata': props['Wikidata'],
            'seshatId': props['SeshatID'],
            'labelPoint': [round(label.x, 6), round(label.y, 6)],
            'bbox': list(geometry.bounds)
        }
        records.append(record)
        output.append({'type': 'Feature', 'id': record_id, 'properties': {
            'recordId': record_id, 'polityId': polity['id'], 'name': polity['name'],
            'color': polity['color'], **period
        }, 'geometry': encoded})

bundle = json.dumps({'type': 'FeatureCollection', 'features': output}, ensure_ascii=False, separators=(',', ':')) + '\n'
geometry_path = ROOT / 'apps/web/public/data/polity-boundaries.geojson'
geometry_path.parent.mkdir(parents=True, exist_ok=True)
geometry_path.write_text(bundle)
collection = {
    'source': source,
    'geometryPath': '/data/polity-boundaries.geojson',
    'geometrySha256': hashlib.sha256(bundle.encode()).hexdigest(),
    'polities': [{key: polity[key] for key in ['id', 'name', 'sourceName', 'color']} for polity in config['polities']],
    'records': sorted(records, key=lambda record: (record['period']['start'], record['id']))
}
(ROOT / 'data/boundary-collection.json').write_text(json.dumps(collection, ensure_ascii=False, indent=2) + '\n')
print(f'{len(collection["polities"])} polities; {len(records)} records; {len(bundle.encode())} geometry bytes')
print('All source and derived polygons are valid. No geometry repairs or interpolation performed.')
