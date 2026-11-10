import { expect, test, type Page } from '@playwright/test';

const openPicker = async (page: Page) => {
  const modal = page.locator('ion-modal.ion-datetime-button-overlay');
  await modal.evaluate((el) => {
    el.addEventListener('ionModalDidPresent', () => el.setAttribute('data-test-presented', 'true'), { once: true });
  });
  await page.locator('ion-datetime-button button').first().click();
  await expect(modal).toHaveAttribute('data-test-presented', 'true');
  return modal;
};

for (const folded of [false, true]) {
  test(`datetime modal fits its picker${folded ? ' in a folded layout' : ''}`, async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('/main/index/date-and-time-pickers');
    if (folded) {
      await page.locator('ion-app').evaluate((app) => app.classList.add('ios-theme-fold-expanded'));
    }
    const modal = await openPicker(page);
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
              rendered: content.width > 0 && content.height > 0 && picker.width > 0 && picker.height > 0,
              width: Math.round(content.width - picker.width),
              height: Math.round(content.height - picker.height),
            };
          }),
        )
        .toEqual({ rendered: true, width: 0, height: 0 });
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
  const modal = await openPicker(page);
  await expect.poll(() => modal.getByRole('dialog').evaluate((el) => Math.round(el.getBoundingClientRect().width))).toBe(360);
});

test('ordinary modal sizing remains overridable by custom CSS', async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 800 });
  await page.goto('/main/index/modal?type=normal');
  await page.addStyleTag({ content: 'ion-modal.ios.custom-sized { --width: 420px; --height: 400px; }' });
  const modal = page.locator('ion-modal:visible');
  await modal.evaluate((el) => el.classList.add('custom-sized'));
  await expect
    .poll(() =>
      modal.getByRole('dialog').evaluate((el) => {
        const bounds = el.getBoundingClientRect();
        return [Math.round(bounds.width), Math.round(bounds.height)];
      }),
    )
    .toEqual([420, 400]);
});
