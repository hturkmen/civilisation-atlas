import {test, expect} from '@playwright/test';

test('archive selection changes the dated image and survives reload without filling gaps', async ({page}) => {
  await page.goto('/?year=1507&era=CE&mode=known');
  const picker = page.getByRole('combobox', {name: /Arşiv eseri seç/});
  await picker.selectOption('ortelius-1570');
  await expect(page).toHaveURL(/year=1570&era=CE&mode=known/);
  await expect(page.locator('.archive-sheet')).toHaveAttribute('src', '/maps/ortelius-1570.jpg');
  await expect(page.locator('.archive-sheet')).toHaveAttribute('data-ready', 'true');
  await expect(page.locator('.archive-edition')).toHaveText('TYPVS ORBIS TERRARVM');
  await page.getByRole('button', {name:'Tarihî haritayı yakınlaştır', exact:true}).click();
  await expect(page.getByLabel('Harita büyütme oranı')).toHaveText('150%');
  await picker.selectOption('waldseemuller-1507');
  await expect(page.getByLabel('Harita büyütme oranı')).toHaveText('100%');
  await picker.selectOption('ortelius-1570');
  await page.reload();
  await expect(picker).toHaveValue('ortelius-1570');
  await page.getByRole('button', {name:'Tarihsel dünya', exact:true}).click();
  await expect(page.getByRole('textbox', {name:'Yıl', exact:true})).toHaveValue('1570');
  await expect(page.locator('.archive-sheet')).toHaveCount(0);
  await page.goto('/?year=1571&era=CE&mode=known');
  await expect(page.locator('.archive-sheet')).toHaveCount(0);
  await expect(picker).toHaveValue('');
});

test('mobile archive picker opens the second image without page overflow', async ({page}) => {
  await page.setViewportSize({width:360,height:800});
  await page.goto('/?year=1500&era=CE&mode=known');
  await page.getByRole('combobox', {name:/Arşiv eseri seç/}).selectOption('ortelius-1570');
  await expect(page.locator('.archive-sheet')).toHaveAttribute('data-ready','true');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
});
