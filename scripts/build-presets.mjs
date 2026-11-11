import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
const ionicLicense = await readFile(join(dirname(require.resolve('@ionic/core/package.json')), 'LICENSE'), 'utf8');
const readCss = async (path) => (await readFile(path, 'utf8')).replace(/\/\*# sourceMappingURL=.*?\*\//g, '').trim();
const base = await Promise.all(
  ['default-variables', 'ionic-theme-ios26', 'md-remove-ios-class-effect'].map((name) => readCss(`dist/css/${name}.css`)),
);

await mkdir('dist/preset', { recursive: true });
for (const mode of ['system', 'class', 'always']) {
  const palette = await readCss(require.resolve(`@ionic/core/css/palettes/dark.${mode}.css`));
  const dark = await readCss(`dist/css/ionic-theme-ios26-dark-${mode}.css`);
  await writeFile(`dist/preset/${mode}.css`, [`/*! @ionic/core palette\n${ionicLicense} */`, palette, ...base, dark, ''].join('\n'));
}
