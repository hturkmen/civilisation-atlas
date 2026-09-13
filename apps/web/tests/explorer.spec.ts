import {test, expect} from '@playwright/test';

test('map loads locally and selecting a place exposes evidence', async ({page}) => {
  const external: string[] = [];
  const errors: string[] = [];
  page.on('request', request => {if (/^https?:/.test(request.url()) && !request.url().startsWith('http://127.0.0.1:3100')) external.push(request.url());});
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByTestId('atlas-map')).toHaveAttribute('data-ready', 'true');
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

test('known world is a separate truthful empty state; sources dialog supports Escape', async ({page}) => {
  await page.goto('/');
  await page.getByRole('button', {name: 'Bilinen dünya', exact: true}).click();
  await expect(page.getByText('Henüz harita yok', {exact: true})).toBeVisible();
  await expect(page.getByTestId('atlas-map')).toHaveCount(0);
  await expect(page.getByRole('slider')).toBeDisabled();
  await page.getByRole('button', {name: 'Kaynaklar', exact: true}).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.getByRole('button', {name: 'Kaynaklar', exact: true})).toBeFocused();
});

test('mobile keeps timeline and place selection accessible without horizontal overflow', async ({page}) => {
  await page.setViewportSize({width: 390, height: 844});
  await page.goto('/');
  await expect(page.getByRole('slider')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
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
