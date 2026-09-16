import {test, expect} from '@playwright/test';

test('map loads locally and selecting a place exposes evidence', async ({page}) => {
  const external: string[] = [];
  const errors: string[] = [];
  page.on('request', request => {if (/^https?:/.test(request.url()) && !request.url().startsWith('http://127.0.0.1:3100')) external.push(request.url());});
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  // Cold software-GPU initialisation is not a production performance benchmark.
  await expect(page.getByTestId('atlas-map')).toHaveAttribute('data-ready', 'true', {timeout: 15000});
  await page.getByRole('button', {name: 'Mohenjo-daro yerleşimini seç'}).click();
  await expect(page.getByRole('heading', {name: 'Mohenjo-daro', exact: true})).toBeVisible();
  await expect(page.getByRole('link', {name: 'Archaeological Ruins at Moenjodaro'})).toHaveAttribute('href', 'https://whc.unesco.org/en/list/138/');
  await page.getByText('Kanıt ve kullanım bilgisi', {exact: true}).click();
  await expect(page.getByText('Dossier 138: N27 19 45 E68 8 20')).toBeVisible();
  expect(external).toEqual([]);
  expect(errors).toEqual([]);
});

test('year changes remove stale selections and keep source coverage honest', async ({page}) => {
  await page.goto('/?year=2500&era=BCE&place=caral-supe');
  await expect(page.getByRole('heading', {name: 'Caral-Supe', exact: true})).toBeVisible();
  await page.getByRole('combobox', {name: 'Tarih dönemi'}).selectOption('CE');
  await page.getByRole('textbox', {name: 'Yıl', exact: true}).fill('1300');
  await page.getByRole('button', {name: 'Yıla git'}).click();
  await expect(page.getByRole('heading', {name: 'Caral-Supe', exact: true})).toHaveCount(0);
  await expect(page.locator('.place-list')).toContainText('Büyük Zimbabve');
  await expect(page.locator('.place-list')).not.toContainText('Mohenjo-daro');
  await page.getByRole('button', {name: 'Günümüz', exact: true}).click();
  await expect(page.getByRole('heading', {name: 'Bu yıl için kayıt eklenmedi'})).toBeVisible();
});

test('BCE to CE has no display year zero and invalid years cannot alter state', async ({page}) => {
  await page.goto('/?year=1&era=BCE');
  await page.getByRole('slider', {name: 'Zaman çizelgesi'}).focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('combobox', {name: 'Tarih dönemi'})).toHaveValue('CE');
  await expect(page.getByRole('textbox', {name: 'Yıl', exact: true})).toHaveValue('1');
  await page.getByRole('textbox', {name: 'Yıl', exact: true}).fill('0');
  await page.getByRole('button', {name: 'Yıla git'}).click();
  await expect(page.getByRole('alert').filter({hasText: 'tam yıl gir'})).toBeVisible();
  await expect(page).toHaveURL(/year=1&era=CE/);
});

test('known world preserves the selected year and sources dialog supports Escape', async ({page}) => {
  await page.goto('/');
  await page.getByRole('button', {name: 'Bilinen dünya', exact: true}).click();
  await expect(page.getByText('için arşivde henüz harita yok.', {exact: false})).toBeVisible();
  await expect(page.getByTestId('atlas-map')).toHaveCount(0);
  await expect(page.getByTestId('historical-viewer')).toHaveCount(0);
  await expect(page.getByRole('textbox', {name: 'Yıl', exact: true})).toHaveValue('2500');
  await expect(page.getByRole('slider')).toBeEnabled();
  await page.getByRole('button', {name: 'Kaynaklar', exact: true}).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.getByRole('button', {name: 'Kaynaklar', exact: true})).toBeFocused();
});

test('archive opens at its own date, zooms, shares its state and never fills adjacent years', async ({page}) => {
  const external: string[] = [];
  const errors: string[] = [];
  page.on('request', request => {if (/^https?:/.test(request.url()) && !request.url().startsWith('http://127.0.0.1:3100')) external.push(request.url());});
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await page.getByRole('navigation', {name: 'Koleksiyonda keşfedilecek tarihler'}).getByRole('button', {name: /MS 1507/}).click();
  await expect(page.locator('.archive-sheet')).toHaveAttribute('data-ready', 'true');
  await expect(page).toHaveURL(/year=1507&era=CE&mode=known/);
  await page.getByRole('button', {name: 'Tarihî haritayı yakınlaştır', exact: true}).click();
  await expect(page.getByLabel('Harita büyütme oranı')).toHaveText('150%');
  await page.getByRole('button', {name: 'Haritanın tamamını göster'}).click();
  await expect(page.getByLabel('Harita büyütme oranı')).toHaveText('100%');
  await page.reload();
  await expect(page.locator('.archive-sheet')).toHaveAttribute('data-ready', 'true');
  await page.getByRole('textbox', {name: 'Yıl', exact: true}).fill('1506');
  await page.getByRole('button', {name: 'Yıla git'}).click();
  await expect(page.getByTestId('historical-viewer')).toHaveCount(0);
  await expect(page.getByText('için arşivde henüz harita yok.', {exact: false})).toBeVisible();
  expect(external).toEqual([]);
  expect(errors).toEqual([]);
});

test('collection stops and contemporary places keep year and mode consistent', async ({page}) => {
  await page.goto('/?year=2500&era=BCE&place=caral-supe');
  await page.locator('.contemporaries').getByRole('button', {name: /Mohenjo-daro/}).click();
  await expect(page.getByRole('heading', {name: 'Mohenjo-daro', exact: true})).toBeVisible();
  await expect(page).toHaveURL(/year=2500&era=BCE&mode=history&place=mohenjo-daro/);
  await page.getByRole('button', {name: 'Sonraki koleksiyon durağı'}).click();
  await expect(page.locator('.polity-list')).toContainText('Ahameniş İmparatorluğu');
  await page.getByRole('navigation', {name: 'Koleksiyonda keşfedilecek tarihler'}).getByRole('button', {name: /MS 1507/}).click();
  await expect(page.getByTestId('historical-viewer')).toBeVisible();
  await page.getByRole('button', {name: 'Önceki koleksiyon durağı'}).click();
  await expect(page.getByTestId('atlas-map')).toBeVisible();
  await expect(page.locator('.polity-list')).toContainText('Osmanlı İmparatorluğu');
});

test('mobile archive controls and dates stay usable without page overflow', async ({page}) => {
  await page.setViewportSize({width: 390, height: 844});
  await page.goto('/?year=1507&era=CE&mode=known');
  await expect(page.locator('.archive-sheet')).toHaveAttribute('data-ready', 'true');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.getByRole('button', {name: 'Tarihî haritayı yakınlaştır', exact: true}).click();
  await expect(page.getByLabel('Harita büyütme oranı')).toHaveText('150%');
  await page.getByRole('textbox', {name: 'Yıl', exact: true}).scrollIntoViewIfNeeded();
  await expect(page.getByRole('textbox', {name: 'Yıl', exact: true})).toBeVisible();
  await page.getByRole('button', {name: 'Bilinen dünya', exact: true}).scrollIntoViewIfNeeded();
});

test('mobile keeps timeline and place selection accessible without horizontal overflow', async ({page}) => {
  await page.setViewportSize({width: 390, height: 844});
  await page.goto('/');
  await expect(page.getByRole('slider')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await expect(page.locator('.polity-map-label:visible')).toHaveCount(2);
  await expect.poll(() => page.evaluate(() => {
    const labels = [...document.querySelectorAll('.polity-map-label, .marker-label')].map(element => element.getBoundingClientRect());
    return labels.some((a, i) => labels.slice(i + 1).some(b => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top));
  })).toBe(false);
  await page.getByRole('button', {name: /01 Mohenjo-daro/}).click();
  await expect(page.getByRole('heading', {name: 'Mohenjo-daro', exact: true})).toBeInViewport();
  await page.getByRole('link', {name: 'Archaeological Ruins at Moenjodaro'}).scrollIntoViewIfNeeded();
  await expect(page.getByRole('link', {name: 'Archaeological Ruins at Moenjodaro'})).toBeVisible();
});

test('WebGL unavailable leaves list and source navigation usable', async ({page}) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, kind: string, ...args: unknown[]) {
      if (kind === 'webgl' || kind === 'webgl2') return null;
      return Reflect.apply(original, this, [kind, ...args]);
    } as typeof original;
  });
  await page.goto('/');
  await expect(page.getByRole('heading', {name: 'Harita görüntülenemiyor'})).toBeVisible();
  await page.getByRole('button', {name: /02 Caral-Supe/}).click();
  await expect(page.getByRole('heading', {name: 'Caral-Supe', exact: true})).toBeVisible();
});

test('sourced areas load locally, expose their provenance and survive a shared-link reload', async ({page}) => {
  const external: string[] = [];
  const errors: string[] = [];
  page.on('request', request => {if (/^https?:/.test(request.url()) && !request.url().startsWith('http://127.0.0.1:3100')) external.push(request.url());});
  page.on('pageerror', error => errors.push(error.message));
  const geometryResponse = page.waitForResponse(response => response.url().endsWith('/data/polity-boundaries.geojson'));
  await page.goto('/?year=117&era=CE');
  expect((await geometryResponse).ok()).toBe(true);
  await expect(page.getByTestId('atlas-map')).toHaveAttribute('data-ready', 'true');
  await expect(page.getByRole('button', {name: 'Han Hanedanı alanını seç'})).toBeVisible();
  await page.getByRole('button', {name: 'Roma İmparatorluğu alanını seç'}).click();
  await expect(page.getByRole('heading', {name: 'Roma İmparatorluğu', exact: true})).toBeVisible();
  await expect(page.locator('.boundary-period')).toContainText('MS 117 — MS 126');
  await expect(page.getByRole('link', {name: 'CC BY 4.0 · uyarlanmış veri'})).toHaveAttribute('href', 'https://creativecommons.org/licenses/by/4.0/');
  await expect(page).toHaveURL(/polity=roman-empire/);
  await page.reload();
  await expect(page.getByRole('heading', {name: 'Roma İmparatorluğu', exact: true})).toBeVisible();
  await page.locator('.polity-periods').getByRole('button', {name: 'MS 200', exact: true}).click();
  await expect(page.locator('.boundary-period')).toContainText('MS 197 — MS 206');
  await expect(page).toHaveURL(/year=200&era=CE&mode=history&polity=roman-empire/);
  expect(external).toEqual([]);
  expect(errors).toEqual([]);
});

test('changing an area to an uncovered year removes its selection and geometry labels', async ({page}) => {
  await page.goto('/?year=126&era=CE&polity=roman-empire');
  await expect(page.getByRole('heading', {name: 'Roma İmparatorluğu', exact: true})).toBeVisible();
  await page.getByRole('textbox', {name: 'Yıl', exact: true}).fill('127');
  await page.getByRole('button', {name: 'Yıla git'}).click();
  await expect(page.getByRole('heading', {name: 'Roma İmparatorluğu', exact: true})).toHaveCount(0);
  await expect(page.getByRole('button', {name: 'Roma İmparatorluğu alanını seç'})).toHaveCount(0);
  await expect(page.locator('.polity-list')).toContainText('Han Hanedanı');
  await expect(page).not.toHaveURL(/polity=/);
  await page.goto('/?year=116&era=CE&polity=roman-empire');
  await expect(page.getByRole('heading', {name: 'Bu yıl için kayıt eklenmedi'})).toBeVisible();
  await expect(page).not.toHaveURL(/polity=/);
});

test('BCE area boundaries honour the final included year without shifting by one year', async ({page}) => {
  await page.goto('/?year=2301&era=BCE&polity=old-kingdom-egypt');
  await expect(page.getByRole('heading', {name: 'Eski Krallık Mısırı', exact: true})).toBeVisible();
  await page.getByRole('textbox', {name: 'Yıl', exact: true}).fill('2300');
  await page.getByRole('button', {name: 'Yıla git'}).click();
  await expect(page.getByRole('heading', {name: 'Eski Krallık Mısırı', exact: true})).toHaveCount(0);
  await expect(page.locator('.polity-list')).toHaveCount(0);
  await expect(page.locator('.place-list')).toContainText('Caral-Supe');
});

test('mobile polity selection, period switching and sources remain usable', async ({page}) => {
  await page.setViewportSize({width: 390, height: 844});
  await page.goto('/?year=1600&era=CE');
  await page.locator('.polity-list').getByRole('button', {name: /Osmanlı İmparatorluğu/}).click();
  await expect(page.getByRole('heading', {name: 'Osmanlı İmparatorluğu', exact: true})).toBeInViewport();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.locator('.polity-periods').getByRole('button', {name: 'MS 1800', exact: true}).click();
  await expect(page.locator('.boundary-period')).toContainText('MS 1800 — MS 1802');
  await page.getByRole('link', {name: 'CC BY 4.0 · uyarlanmış veri'}).scrollIntoViewIfNeeded();
  await expect(page.getByRole('link', {name: 'CC BY 4.0 · uyarlanmış veri'})).toBeVisible();
  await page.getByRole('button', {name: 'Bilinen dünya', exact: true}).click();
  await expect(page.getByTestId('atlas-map')).toHaveCount(0);
  await expect(page).not.toHaveURL(/polity=/);
});

test('expanded 1500 snapshot exposes five sourced areas and Turkish search', async ({page}) => {
  await page.goto('/?year=1500&era=CE');
  await expect(page.locator('.polity-list li')).toHaveCount(5);
  await expect(page.getByTestId('atlas-map')).toHaveAttribute('data-ready', 'true');
  await page.getByRole('textbox', {name: 'Medeniyet veya yerleşim ara'}).fill('İNKA');
  await expect(page.locator('.polity-list li')).toHaveCount(1);
  await page.locator('.polity-list').getByRole('button', {name: /İnka İmparatorluğu/}).click();
  await expect(page.getByRole('heading', {name: 'İnka İmparatorluğu', exact: true})).toBeVisible();
  await expect(page.locator('.boundary-period')).toContainText('MS 1497 — MS 1533');
  await expect(page.getByRole('link', {name: 'CC BY 4.0 · uyarlanmış veri'})).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', {name: 'İnka İmparatorluğu', exact: true})).toBeVisible();
});

test('empty year offers the actual nearest source edge without retaining a stale polity', async ({page}) => {
  await page.goto('/?year=207&era=CE&polity=roman-empire');
  const nearby = page.getByRole('navigation', {name: 'En yakın kaynaklı yıllar'});
  await expect(nearby.getByRole('button', {name: 'Önceki kaynaklı yıl: MS 206'})).toBeVisible();
  await expect(nearby.getByRole('button', {name: 'Sonraki kaynaklı yıl: MS 387'})).toBeVisible();
  await expect(page).not.toHaveURL(/polity=/);
  await nearby.getByRole('button', {name: 'Sonraki kaynaklı yıl: MS 387'}).click();
  await expect(page.getByRole('textbox', {name: 'Yıl', exact: true})).toHaveValue('387');
  await expect(page.locator('.polity-list')).toContainText('Gupta İmparatorluğu');
  await expect(nearby).toHaveCount(0);
});

test('collection playback visits a short source period and stops on pause or a manual year', async ({page}) => {
  await page.goto('/?year=500&era=CE');
  await expect(page.getByTestId('atlas-map')).toHaveAttribute('data-ready', 'true');
  await page.clock.install();
  await page.getByRole('button', {name: 'Zamanı oynat', exact: true}).click();
  await page.clock.fastForward(3100);
  await expect(page.getByRole('textbox', {name: 'Yıl', exact: true})).toHaveValue('800');
  await expect(page.locator('.polity-list')).toContainText('Abbâsî Halifeliği');
  await page.getByRole('button', {name: 'Zamanı durdur', exact: true}).click();
  await page.clock.fastForward(9000);
  await expect(page.getByRole('textbox', {name: 'Yıl', exact: true})).toHaveValue('800');
  await page.getByRole('button', {name: 'Zamanı oynat', exact: true}).click();
  await page.getByRole('textbox', {name: 'Yıl', exact: true}).fill('1500');
  await page.getByRole('button', {name: 'Yıla git'}).click();
  await page.clock.fastForward(9000);
  await expect(page.getByRole('textbox', {name: 'Yıl', exact: true})).toHaveValue('1500');
  await expect(page.getByRole('button', {name: 'Zamanı oynat', exact: true})).toHaveAttribute('aria-pressed', 'false');
});

test('360px empty-year shortcuts remain in view and open a sourced period', async ({page}) => {
  await page.setViewportSize({width: 360, height: 800});
  await page.goto('/?year=1700&era=CE');
  const nearby = page.getByRole('navigation', {name: 'En yakın kaynaklı yıllar'});
  await expect(nearby).toBeInViewport();
  await expect(nearby.getByRole('button', {name: 'Önceki kaynaklı yıl: MS 1618'})).toBeInViewport();
  await expect(nearby.getByRole('button', {name: 'Sonraki kaynaklı yıl: MS 1800'})).toBeInViewport();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await nearby.getByRole('button', {name: 'Sonraki kaynaklı yıl: MS 1800'}).click();
  await page.locator('.polity-list').getByRole('button', {name: /Osmanlı İmparatorluğu/}).click();
  await expect(page.getByRole('heading', {name: 'Osmanlı İmparatorluğu', exact: true})).toBeInViewport();
});


test('cross-period search opens a source sample, survives reload and clears an obsolete selection', async ({page}) => {
  await page.goto('/?year=1700&era=CE&mode=history');
  await page.getByRole('textbox', {name: 'Medeniyet veya yerleşim ara'}).fill('MALİ');
  await expect(page.getByRole('heading', {name: 'Bu tarihte eşleşme yok'})).toBeVisible();
  const periods = page.getByRole('region', {name: 'Diğer dönemlerde keşfet'});
  await expect(periods.getByRole('heading', {name: 'Mali İmparatorluğu'})).toHaveCount(1);
  await expect(periods.getByRole('button')).toHaveCount(2);
  await periods.getByRole('button', {name: 'Mali İmparatorluğu, MS 1500 örneğini aç', exact: true}).click();
  await expect(page.getByRole('heading', {name: 'Mali İmparatorluğu', exact: true})).toBeFocused();
  await expect(page).toHaveURL(/year=1500&era=CE&mode=history&polity=/);
  await page.reload();
  await expect(page.getByRole('heading', {name: 'Mali İmparatorluğu', exact: true})).toBeVisible();
  await page.getByRole('textbox', {name: 'Yıl', exact: true}).fill('1700');
  await page.getByRole('button', {name: 'Yıla git'}).click();
  await expect(page).not.toHaveURL(/polity=/);
  await expect(page.getByRole('textbox', {name: 'Medeniyet veya yerleşim ara'})).toHaveValue('');
});

test('cross-period search supports keyboard clearing and place discovery on a narrow screen', async ({page}) => {
  await page.setViewportSize({width: 360, height: 800});
  await page.goto('/?year=1700&era=CE&mode=history');
  const search = page.getByRole('textbox', {name: 'Medeniyet veya yerleşim ara'});
  await search.fill('Roman');
  await expect(page.getByRole('region', {name: 'Diğer dönemlerde keşfet'}).getByRole('button')).toHaveCount(2);
  await search.press('Escape');
  await expect(search).toHaveValue('');
  await expect(search).toBeFocused();
  await search.fill('zzzzzz');
  await expect(page.getByText('Diğer kaynak dönemlerinde de eşleşme yok. Başka bir ad deneyebilirsin.')).toBeVisible();
  await page.getByRole('button', {name: 'Aramayı temizle', exact: true}).first().click();
  await expect(search).toBeFocused();
  await search.fill('Mohenjo');
  const target = page.getByRole('button', {name: /Mohenjo-daro, MÖ .* örneğini aç/});
  await target.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', {name: 'Mohenjo-daro', exact: true})).toBeFocused();
  await expect(page).toHaveURL(/era=BCE&mode=history&place=mohenjo-daro/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
