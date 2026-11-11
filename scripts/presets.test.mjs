import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { ios26ThemeConfig, iosTransitionAnimation, popoverEnterAnimation, popoverLeaveAnimation } from '../dist/index.js';

const require = createRequire(import.meta.url);
const readCss = async (path) => (await readFile(path, 'utf8')).replace(/\/\*# sourceMappingURL=.*?\*\//g, '').trim();

test('supplies iOS defaults before Ionic initialization, including undefined mode', () => {
  const expected = {
    mode: 'ios',
    navAnimation: iosTransitionAnimation,
    popoverEnter: popoverEnterAnimation,
    popoverLeave: popoverLeaveAnimation,
  };
  assert.deepEqual(ios26ThemeConfig(), expected);
  assert.deepEqual(ios26ThemeConfig({ mode: undefined }), expected);
});

test('preserves explicit animation options without mutating the input', () => {
  const navAnimation = () => {};
  const existing = { navAnimation, popoverEnter: undefined, animated: false };
  const original = { ...existing };
  assert.deepEqual(ios26ThemeConfig(existing), {
    mode: 'ios',
    navAnimation,
    popoverEnter: undefined,
    popoverLeave: popoverLeaveAnimation,
    animated: false,
  });
  assert.deepEqual(existing, original);
});

test('adds no iOS animation defaults to explicit Material Design mode', () => {
  assert.deepEqual(ios26ThemeConfig({ mode: 'md' }), { mode: 'md' });
  const navAnimation = () => {};
  assert.deepEqual(ios26ThemeConfig({ mode: 'md', navAnimation }), { mode: 'md', navAnimation });
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
