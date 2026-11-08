import { expect, test } from '@playwright/test';
import { compile } from 'sass';
import { resolve } from 'node:path';

const css = compile(resolve(__dirname, '../../src/styles/vertical-bars.scss')).css;

for (const tag of ['ion-header', 'ion-footer']) {
  for (const fade of [false, true]) {
    test(`${tag} fade=${fade}: prehide and safe-area spacing follow fixed versus scrolling placement`, async ({ page }) => {
      const surface = (id: string) =>
        `<${tag} ${fade ? 'collapse="fade"' : ''}><ion-toolbar id="${id}" class="ios"><ion-back-button></ion-back-button></ion-toolbar></${tag}>`;
      await page.setContent(
        `<html class="native-ui-prehide"><body><ion-app class="ios-theme-vertical-bars" style="--ios-theme-vertical-bars-native-inset: 84px"><div class="ion-page">${surface('fixed')}<ion-content>${surface('scrolling')}</ion-content></div></ion-app></body></html>`,
      );
      await page.addStyleTag({ content: css });
      await page.evaluate(() => {
        for (const toolbar of document.querySelectorAll('ion-toolbar')) {
          toolbar.attachShadow({ mode: 'open' }).innerHTML = '<div part="container"><slot></slot></div>';
        }
      });
      await expect(page.locator('#fixed ion-back-button')).toHaveCSS('visibility', 'hidden');
      await expect(page.locator('#scrolling ion-back-button')).toHaveCSS('visibility', 'visible');
      await expect(page.locator('#fixed [part="container"]')).toHaveCSS('padding-right', '84px');
      await expect(page.locator('#scrolling [part="container"]')).toHaveCSS('padding-right', '0px');
    });
  }
}

for (const marker of ['collapse="condense"', 'class="header-collapse-condense"']) {
  test(`condense ${marker} is never hidden by the entering-back CSS`, async ({ page }) => {
    await page.setContent(
      `<html class="native-ui-prehide"><body><ion-app class="ios-theme-vertical-bars"><ion-header ${marker}><ion-toolbar><ion-back-button></ion-back-button></ion-toolbar></ion-header></ion-app></body></html>`,
    );
    await page.addStyleTag({ content: css });
    await expect(page.locator('ion-back-button')).toHaveCSS('visibility', 'visible');
  });
}

for (const left of [false, true]) {
  for (const tag of ['ion-back-button', 'ion-button', 'ion-buttons']) {
    test(`${tag} keeps its rail placement while carried by a card page (${left ? 'left' : 'right'})`, async ({ page }) => {
      await page.setViewportSize({ width: 466, height: 678 });
      const back = tag === 'ion-back-button';
      const group = tag === 'ion-buttons';
      await page.setContent(
        `<style>body{margin:0}ion-app,app-modal{display:block;width:466px;height:678px}app-modal{position:relative;transform-origin:0 0;transform:translate(12px,30px) scale(.9)}</style>
        <ion-app class="ios-theme-vertical-bars ios-theme-vertical-bars-toolbar-ready ${left ? 'ios-theme-vertical-bars-left' : ''}" style="--ios-theme-vertical-bars-native-inset:84px;--ios-theme-vertical-bars-toolbar-top:174px">
          <app-modal></app-modal>
          <${tag} id="target" class="ios ion-cloned-element ${back ? 'ios-theme-vertical-bars-back-button-projection' : 'ios-theme-vertical-bars-toolbar-projection'}">
            ${group ? '<ion-button class="ios ios-theme-vertical-bars-toolbar-action"></ion-button><ion-button class="ios ios-theme-vertical-bars-toolbar-action"></ion-button>' : ''}
          </${tag}>
        </ion-app>`,
      );
      await page.addStyleTag({ content: css });
      const target = page.locator('#target');
      const initial = await target.boundingBox();
      expect(initial).not.toBeNull();
      expect(initial!.x).toBeCloseTo(left ? 24 : 394, 2);
      expect(initial!.y).toBeCloseTo(174, 2);
      await page.locator('app-modal').evaluate((layer) => layer.append(document.getElementById('target')!));
      await expect(target).toHaveCSS('position', 'fixed');
      const moved = await target.boundingBox();
      expect(moved!.x).toBeCloseTo(12 + initial!.x * 0.9, 2);
      expect(moved!.y).toBeCloseTo(30 + initial!.y * 0.9, 2);
      expect(moved!.width).toBeCloseTo(initial!.width * 0.9, 2);
      expect(moved!.height).toBeCloseTo(initial!.height * 0.9, 2);
      await page.locator('ion-app').evaluate((app) => app.append(document.getElementById('target')!));
      expect(await target.boundingBox()).toEqual(initial);
    });
  }
}
