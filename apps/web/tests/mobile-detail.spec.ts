import {test,expect} from '@playwright/test';

test('mobile timeline and search enlarge and remain keyboard operable',async({page})=>{
  await page.setViewportSize({width:360,height:800});await page.goto('/?year=1500&era=CE');
  const search=page.getByRole('textbox',{name:'Medeniyet veya yerleşim ara'});
  const initial=await search.evaluate(el=>parseFloat(getComputedStyle(el).fontSize));
  const rootSize=await page.locator('html').evaluate(el=>parseFloat(getComputedStyle(el).fontSize));
  await page.addStyleTag({content:`html{font-size:${rootSize*2}px !important}`});
  expect(await search.evaluate(el=>parseFloat(getComputedStyle(el).fontSize))).toBe(initial*2);
  const year=page.getByRole('textbox',{name:'Yıl',exact:true});
  await year.fill('1600');await year.press('Enter');await expect(page).toHaveURL(/year=1600/);
  for(const selector of ['.time-input form','.track-heading','.search-box']){
    const box=await page.locator(selector).boundingBox();expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(0);expect(box!.x+box!.width).toBeLessThanOrEqual(361);
  }
  await search.fill('Roma');await search.press('Escape');await expect(search).toHaveValue('');await expect(search).toBeFocused();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('mobile sheet collapses and restores list keyboard focus',async({page},info)=>{
  await page.setViewportSize({width:360,height:800});await page.goto('/?year=1500&era=CE');
  const item=page.locator('.polity-list').getByRole('button',{name:/Mali İmparatorluğu/});
  await item.focus();await page.keyboard.press('Enter');
  const heading=page.getByRole('heading',{name:'Mali İmparatorluğu',exact:true});
  await expect(heading).toBeFocused();await expect(heading).toBeInViewport();
  expect(await page.locator('.mobile-detail-sheet').evaluate(el=>getComputedStyle(el).position)).toBe('fixed');
  await page.getByRole('button',{name:/Haritaya yer aç/}).click();
  await expect(page.locator('#explore-content')).toBeHidden();
  await page.getByRole('button',{name:/Detayları aç/}).click();await expect(heading).toBeFocused();
  await page.screenshot({path:info.outputPath('mobile-sheet.png')});
  await page.keyboard.press('Escape');await expect(item).toBeFocused();
});
test('360px sheet supports enlarged text and source scrolling',async({page})=>{
  await page.setViewportSize({width:360,height:800});await page.goto('/?year=117&era=CE&polity=roman-empire');
  await page.addStyleTag({content:'html{font-size:200% !important}'});
  await expect(page.getByRole('button',{name:'Detayı kapat ve listeye dön'})).toBeInViewport();
  const source=page.getByRole('link',{name:'CC BY 4.0 · uyarlanmış veri'});
  await source.scrollIntoViewIfNeeded();await expect(source).toBeInViewport();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.getByRole('button',{name:'Detayı kapat ve listeye dön'}).click();
  await expect(page.locator('.polity-list').getByRole('button',{name:/Roma İmparatorluğu/})).toBeFocused();
});
test('desktop sidebar returns selection focus without mobile controls',async({page})=>{
  await page.goto('/?year=1500&era=CE');const item=page.locator('.polity-list').getByRole('button',{name:/Mali İmparatorluğu/});
  await item.click();await expect(page.locator('.mobile-detail-bar')).toBeHidden();
  await page.getByRole('button',{name:'Koleksiyona dön'}).click();await expect(item).toBeFocused();
});
