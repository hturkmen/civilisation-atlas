import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const read=path=>JSON.parse(readFileSync(new URL('../'+path,import.meta.url),'utf8'));
const stories=read('data/polity-stories.json');
const ids=new Set(read('data/boundary-collection.json').polities.map(p=>p.id));
const seen=new Set();
assert.ok(Array.isArray(stories)&&stories.length>0);
for(const s of stories){
  assert.ok(ids.has(s.polityId)&&!seen.has(s.polityId),'Unknown or duplicate polity');seen.add(s.polityId);
  assert.equal(s.reviewStatus,'unreviewed');assert.equal(s.scope,'general-context');
  for(const v of [s.title,s.summary,s.source.title,s.source.locator,s.source.adaptation])assert.ok(typeof v==='string'&&v.trim());
  assert.ok(s.places.length>0&&s.places.every(p=>typeof p==='string'&&p.trim()));
  assert.ok(s.highlights.length>0&&s.highlights.every(h=>typeof h.label==='string'&&h.label.trim()&&typeof h.text==='string'&&h.text.trim()));
  assert.match(s.source.url,/^https:\/\/whc\.unesco\.org\/en\/list\/\d+\/$/);
  assert.equal(s.source.license,'CC BY-SA 3.0 IGO');
  assert.equal(s.source.licenseUrl,'https://creativecommons.org/licenses/by-sa/3.0/igo/');
  assert.match(s.source.accessedOn,/^\d{4}-\d{2}-\d{2}$/);
}
console.log(`${stories.length} sourced provisional narratives; identity, scope and attribution checked. Historical accuracy requires independent review.`);
