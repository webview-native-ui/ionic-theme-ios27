import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';
import { ios27ThemeConfig, iosTransitionAnimation, popoverEnterAnimation, popoverLeaveAnimation } from '../dist/index.js';

test('theme defaults are available without browser globals', () => {
  assert.deepEqual(ios27ThemeConfig, {
    mode: 'ios',
    navAnimation: iosTransitionAnimation,
    popoverEnter: popoverEnterAnimation,
    popoverLeave: popoverLeaveAnimation,
  });
});

test('application options override defaults without mutating their object', () => {
  const animation = () => {};
  const existing = { navAnimation: animation, popoverEnter: undefined, animated: false };
  const result = { ...ios27ThemeConfig, ...existing };
  assert.equal(result.navAnimation, animation);
  assert.equal(result.popoverEnter, undefined);
  assert.equal(result.animated, false);
  assert.deepEqual(existing, { navAnimation: animation, popoverEnter: undefined, animated: false });
  assert.notEqual(result, existing);
});

test('application spread options control mode and leave the preset unchanged', () => {
  assert.equal({ ...ios27ThemeConfig, mode: 'md' }.mode, 'md');
  assert.equal({ ...ios27ThemeConfig, mode: undefined }.mode, undefined);
  assert.equal(ios27ThemeConfig.mode, 'ios');
  assert.equal(ios27ThemeConfig.navAnimation, iosTransitionAnimation);
});

const require = createRequire(import.meta.url);
for (const mode of ['system', 'class', 'always']) {
  test(`${mode} preset bundles matching palette and styles in order`, () => {
    const preset = readFileSync(`dist/preset/${mode}.css`, 'utf8');
    const files = [
      require.resolve(`@ionic/core/css/palettes/dark.${mode}.css`),
      'dist/css/default-variables.css',
      'dist/css/ionic-theme-ios27.css',
      'dist/css/md-remove-ios-class-effect.css',
      `dist/css/ionic-theme-ios27-dark-${mode}.css`,
    ];
    let offset = 0;
    for (const file of files) {
      const content = readFileSync(file, 'utf8').replace(/\/\*# sourceMappingURL=.*?\*\//g, '');
      const index = preset.indexOf(content, offset);
      assert(index >= offset, `Missing or out-of-order ${file}`);
      offset = index + content.length;
    }
    assert(!preset.includes('@import'));
    assert(!preset.includes('sourceMappingURL'));
  });
}
