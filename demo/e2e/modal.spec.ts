import { expect, test } from '@playwright/test';

test.use({ viewport: { width: 1210, height: 834 } });

for (const type of ['normal', 'card', 'sheet']) {
  test(`${type} opens once and closes with Done`, async ({ page }) => {
    await page.goto(`/main/index/modal?type=${type}`);
    const modal = page.locator('ion-modal:visible');
    await expect(modal).toHaveCount(1);
    await expect(modal.getByRole('button', { name: 'Done', exact: true })).toBeVisible();
    await modal.getByRole('button', { name: 'Done', exact: true }).click();
    await expect(modal).toHaveCount(0);
    // A delegated ModalPage must not reopen the URL-selected overlay.
    await expect(page.getByText('present:normal', { exact: true })).toBeVisible();
  });
}

test('sheet retains dragging and backdrop dismissal', async ({ page }) => {
  await page.goto('/main/index/modal?type=sheet');
  const modal = page.locator('ion-modal:visible');
  const handle = modal.locator('[part="handle"]');
  await expect(handle).toBeVisible();
  await expect.poll(() => modal.evaluate((el: HTMLIonModalElement) => el.getCurrentBreakpoint())).toBe(0.8);
  await page.waitForTimeout(600);
  const box = (await handle.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2, box.y + 210, { steps: 30 });
  await page.mouse.up();
  await expect.poll(() => modal.evaluate((el: HTMLIonModalElement) => el.getCurrentBreakpoint())).toBe(0.5);
  await expect.poll(() => modal.evaluate((el) => Math.round(el.querySelector('.ion-page')!.getBoundingClientRect().bottom))).toBe(814);
  // Outside the sheet's horizontal bounds, the backdrop must remain interactive.
  await page.mouse.click(30, 350);
  await expect(modal).toHaveCount(0);
});

test('phone normal modal stays fullscreen', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/main/index/modal?type=normal');
  const content = page.getByRole('dialog');
  await expect(content).toBeVisible();
  await expect.poll(async () => Math.round((await content.boundingBox())!.width)).toBe(390);
  await expect.poll(async () => Math.round((await content.boundingBox())!.height)).toBe(844);
});

for (const scenario of [
  { name: 'inner landscape', width: 951, height: 669, safeTop: 0, modalWidth: 653, modalHeight: 661 },
  { name: 'inner portrait', width: 669, height: 951, safeTop: 82, modalWidth: 653, modalHeight: 869 },
  { name: 'outer portrait', width: 466, height: 678, safeTop: 0, modalWidth: 450, modalHeight: 670 },
  { name: 'outer landscape', width: 678, height: 466, safeTop: 0, modalWidth: 662, modalHeight: 458 },
]) {
  test(`floating modal bounds in ${scenario.name}`, async ({ page }) => {
    await page.setViewportSize({ width: scenario.width, height: scenario.height });
    await page.goto('/main/index/modal');
    await page.locator('ion-app').evaluate((app, inner) => {
      app.classList.add(inner ? 'ios-theme-fold-expanded' : 'ios-theme-vertical-bars');
    }, scenario.name.startsWith('inner'));
    await page.addStyleTag({ content: `:root { --ion-safe-area-top: ${scenario.safeTop}px !important; }` });
    await page.getByText('present:card', { exact: true }).click();
    const modal = page.locator('ion-modal:visible');
    const bounds = () =>
      modal.getByRole('dialog').evaluate((el) => {
        const r = el.getBoundingClientRect();
        return { width: Math.round(r.width), height: Math.round(r.height), top: Math.round(r.top) };
      });
    await expect.poll(bounds).toEqual({
      width: scenario.modalWidth,
      height: scenario.modalHeight,
      top: scenario.height - scenario.modalHeight,
    });
    await modal.getByRole('button', { name: 'Done', exact: true }).click();
    await expect(modal).toHaveCount(0);
    await page.getByText('present:sheet', { exact: true }).click();
    await expect
      .poll(() => modal.getByRole('dialog').evaluate((el) => Math.round(el.getBoundingClientRect().width)))
      .toBe(scenario.modalWidth);
    await expect.poll(() => modal.evaluate((el: HTMLIonModalElement) => el.getCurrentBreakpoint())).toBe(0.8);
    await modal.evaluate((el: HTMLIonModalElement) => el.dismiss());
    await expect(modal).toHaveCount(0);
    await page.evaluate(async () => {
      const sheet = document.createElement('ion-modal');
      sheet.mode = 'ios';
      sheet.component = document.createElement('div');
      sheet.breakpoints = [0, 0.5, 1];
      sheet.initialBreakpoint = 1;
      sheet.expandToScroll = false;
      document.querySelector('ion-app')!.append(sheet);
      await sheet.present();
    });
    await expect.poll(bounds).toEqual({
      width: scenario.modalWidth,
      height: scenario.modalHeight,
      top: scenario.height - scenario.modalHeight,
    });
    // The sheet offset controls its height while its bottom stays at the viewport edge.
    await modal.evaluate((el: HTMLElement) => el.style.setProperty('--ion-modal-offset-top', '80px'));
    await expect.poll(bounds).toEqual({ width: scenario.modalWidth, height: scenario.height - 80, top: 80 });
    await expect(modal.getByRole('dialog')).toHaveCSS('bottom', '0px');
  });
}

test('explicit full-screen sizing overrides the floating defaults', async ({ page }) => {
  await page.setViewportSize({ width: 951, height: 669 });
  await page.goto('/main/index/modal?type=card');
  const modal = page.locator('ion-modal:visible');
  await expect(modal).toBeVisible();
  await page.locator('ion-app').evaluate((app) => app.classList.add('ios-theme-fold-expanded'));
  await modal.evaluate((el: HTMLElement) => {
    el.style.setProperty('--width', '100%');
    el.style.setProperty('--max-width', 'none');
    el.style.setProperty('--height', '100%');
  });
  await expect
    .poll(() =>
      modal.getByRole('dialog').evaluate((el) => {
        const r = el.getBoundingClientRect();
        return [Math.round(r.width), Math.round(r.height)];
      }),
    )
    .toEqual([951, 669]);
});

for (const scenario of [
  { width: 390, height: 844, cardWidth: 390, cardHeight: 804 },
  { width: 844, height: 390, cardWidth: 720, cardHeight: 270 },
]) {
  test(`ordinary phone card sizing remains unchanged at ${scenario.width}x${scenario.height}`, async ({ page }) => {
    await page.setViewportSize({ width: scenario.width, height: scenario.height });
    await page.goto('/main/index/modal?type=card');
    const modal = page.locator('ion-modal:visible');
    await expect
      .poll(() =>
        modal.getByRole('dialog').evaluate((el) => {
          const r = el.getBoundingClientRect();
          return [Math.round(r.width), Math.round(r.height)];
        }),
      )
      .toEqual([scenario.cardWidth, scenario.cardHeight]);
  });
}

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
