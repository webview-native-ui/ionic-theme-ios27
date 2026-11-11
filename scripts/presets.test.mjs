import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { ios26ThemeConfig, iosTransitionAnimation, popoverEnterAnimation, popoverLeaveAnimation } from '../dist/index.js';

const require = createRequire(import.meta.url);
const readCss = async (path) => (await readFile(path, 'utf8')).replace(/\/\*# sourceMappingURL=.*?\*\//g, '').trim();

test('exports iOS defaults that can be imported without a DOM', () => {
  assert.deepEqual(ios26ThemeConfig, {
    mode: 'ios',
    navAnimation: iosTransitionAnimation,
    popoverEnter: popoverEnterAnimation,
    popoverLeave: popoverLeaveAnimation,
  });
});

test('spread options override defaults without mutating the preset', () => {
  const original = { ...ios26ThemeConfig };
  const navAnimation = () => {};
  const config = { ...ios26ThemeConfig, navAnimation, animated: false };
  assert.equal(config.navAnimation, navAnimation);
  assert.equal(config.animated, false);
  assert.deepEqual(ios26ThemeConfig, original);
});

test('explicit undefined options retain normal object spread semantics', () => {
  const config = { ...ios26ThemeConfig, mode: undefined, popoverEnter: undefined };
  assert.equal(config.mode, undefined);
  assert.equal(config.popoverEnter, undefined);
});

test('applications can select the preset only for iOS mode', () => {
  const configForMode = (mode) => ({ ...(mode === 'ios' ? ios26ThemeConfig : {}), mode });
  assert.deepEqual(configForMode('ios'), ios26ThemeConfig);
  assert.deepEqual(configForMode('md'), { mode: 'md' });
});

for (const mode of ['system', 'class', 'always']) {
  test(`${mode} preset export contains the matching palette and theme in order`, async () => {
    const sourcePaths = [
      require.resolve(`@ionic/core/css/palettes/dark.${mode}.css`),
      ...['default-variables', 'ionic-theme-ios26', 'md-remove-ios-class-effect', `ionic-theme-ios26-dark-${mode}`].map(
        (name) => `dist/css/${name}.css`,
      ),
    ];
    const ionicLicense = await readFile(join(dirname(require.resolve('@ionic/core/package.json')), 'LICENSE'), 'utf8');
    const expected = `/*! @ionic/core palette\n${ionicLicense} */\n${(await Promise.all(sourcePaths.map(readCss))).join('\n')}\n`;
    const exportedPath = require.resolve(`@rdlabo/ionic-theme-ios26/preset/${mode}.css`);
    assert.equal(await readFile(exportedPath, 'utf8'), expected);
    assert.doesNotMatch(expected, /@import\b/);
  });
}
