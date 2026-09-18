import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {gzipSync} from 'node:zlib';

test('long period lists keep sources reachable with enlarged mobile text',async({page})=>{
  await page.setViewportSize({width:360,height:800});
  await page.goto('/?year=1600&era=CE&polity=ottoman-empire');
  await page.addStyleTag({content:'html{font-size:200% !important}'});
  const summary=page.locator('.all-periods summary');
  await expect(summary).toHaveText('Tüm dönemleri göster (64)');
  await expect(page.locator('.all-periods')).not.toHaveAttribute('open','');
  const source=page.getByRole('link',{name:'CC BY 4.0 · uyarlanmış veri'});
  await source.scrollIntoViewIfNeeded();await expect(source).toBeInViewport();
  await summary.focus();await page.keyboard.press('Enter');
  const target=page.locator('.period-options').getByRole('button',{name:'MS 1800',exact:true});
  await target.focus();await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/year=1800/);
  await expect(page.getByRole('heading',{name:'Osmanlı İmparatorluğu',exact:true})).toBeFocused();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('large collection records bundle size and local map readiness measurements',async({page},info)=>{
  await page.goto('/?year=1700&era=CE');
  await expect(page.getByTestId('atlas-map')).toHaveAttribute('data-ready','true',{timeout:15000});
  const result=await page.evaluate(()=>({
    mapReadyFlagObservedMs:performance.now(),viewport:{width:innerWidth,height:innerHeight}
  }));
  const bundle=readFileSync(new URL('../public/data/polity-boundaries.geojson',import.meta.url));
  expect(bundle.length).toBe(2884759);
  const measurement={...result,rawBytes:bundle.length,gzipLevel9Bytes:gzipSync(bundle,{level:9}).length,note:'Local software GPU; gzip is an offline estimate, not measured production transfer; map-ready flag is not a full visual paint metric.'};
  console.log('ATLAS_LOCAL_MEASUREMENT',JSON.stringify(measurement));
  await info.attach('local-map-measurements.json',{body:JSON.stringify(measurement,null,2),contentType:'application/json'});
});
