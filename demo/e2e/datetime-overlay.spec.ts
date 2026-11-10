import { expect, test } from '@playwright/test';

for (const folded of [false, true]) {
  test(`datetime modal fits its picker${folded ? ' in a folded layout' : ''}`, async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('/main/index/date-and-time-pickers');
    if (folded) {
      await page.locator('ion-app').evaluate((app) => app.classList.add('ios-theme-fold-expanded'));
    }
    await page.locator('ion-datetime-button button').first().click();
    const modal = page.locator('ion-modal:visible');
    await expect(modal).toHaveClass(/ion-datetime-button-overlay/);

    for (const viewport of [
      { width: 1200, height: 800 },
      { width: 844, height: 390 },
      { width: 390, height: 844 },
    ]) {
      await page.setViewportSize(viewport);
      await expect
        .poll(() =>
          modal.evaluate((el) => {
            const content = el.shadowRoot!.querySelector('[part="content"]')!.getBoundingClientRect();
            const picker = el.querySelector('ion-datetime')!.getBoundingClientRect();
            return {
              width: Math.round(content.width - picker.width),
              height: Math.round(content.height - picker.height),
            };
          }),
        )
        .toEqual({ width: 0, height: 0 });
    }
  });
}

test('datetime modal follows a custom picker width', async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 800 });
  await page.goto('/main/index/date-and-time-pickers');
  await page.locator('ion-datetime#datetime').evaluate((picker) => {
    picker.style.width = '360px';
    picker.style.maxWidth = 'none';
  });
  await page.locator('ion-datetime-button button').first().click();
  const modal = page.locator('ion-modal:visible');
  await expect.poll(() => modal.getByRole('dialog').evaluate((el) => Math.round(el.getBoundingClientRect().width))).toBe(360);
});
