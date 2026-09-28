import {test, expect} from '@playwright/test';

test('country names appear only over a polygon and clear on leave', async ({page}) => {
  await page.goto('/?year=1402&era=CE&mode=history');
  const map = page.getByTestId('atlas-map');
  await expect(map).toHaveAttribute('data-ready', 'true');
  await expect(page.locator('.polity-map-label')).toHaveCount(0);
  await expect(page.getByRole('tooltip')).toHaveCount(0);
  const box = await map.boundingBox();
  if (!box) throw new Error('Map missing');
  // Locate an actual rendered polygon without relying on one viewport's geography.
  let found = false;
  for (let y = .2; y < .8 && !found; y += .08) {
    for (let x = .2; x < .95; x += .04) {
      await page.mouse.move(box.x + box.width*x, box.y + box.height*y);
      if (await page.getByRole('tooltip').count()) {found = true; break;}
    }
  }
  expect(found).toBe(true);
  await expect(page.getByRole('tooltip')).not.toHaveText('');
  await page.keyboard.press('Escape');
  // Escape works when map canvas is focused; leaving always dismisses.
  await page.mouse.move(5, 5);
  await expect(page.getByRole('tooltip')).toHaveCount(0);
});
