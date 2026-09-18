import {test,expect} from '@playwright/test';
test('provisional narrative has context, review warning and its own attribution on mobile',async({page})=>{
  await page.setViewportSize({width:360,height:800});
  await page.goto('/?year=1500&era=CE&polity=ottoman-empire');
  const story=page.getByRole('region',{name:'Kültür ve tarih notları'});
  await expect(story).toContainText('Ön bilgi · bağımsız inceleme bekliyor');
  await expect(story).toContainText('Genel tarihçe; seçili yıla özgü değildir');
  await expect(story.getByRole('heading')).toHaveText('İstanbul: saraylar ve külliyeler');
  await story.locator('summary').click();
  await expect(story.getByRole('link',{name:'Historic Areas of Istanbul · UNESCO'})).toHaveAttribute('href','https://whc.unesco.org/en/list/356/');
  await expect(story.getByRole('link',{name:'CC BY-SA 3.0 IGO'})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
