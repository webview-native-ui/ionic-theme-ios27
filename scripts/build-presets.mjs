import { createRequire } from 'node:module';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
const ionicLicense = readFileSync(join(dirname(require.resolve('@ionic/core/package.json')), 'LICENSE'), 'utf8');
mkdirSync('dist/preset', { recursive: true });
for (const mode of ['system', 'class', 'always']) {
  const files = [
    require.resolve(`@ionic/core/css/palettes/dark.${mode}.css`),
    'dist/css/default-variables.css',
    'dist/css/ionic-theme-ios27.css',
    'dist/css/md-remove-ios-class-effect.css',
    `dist/css/ionic-theme-ios27-dark-${mode}.css`,
  ];
  const styles = files.map((file) => readFileSync(file, 'utf8').replace(/\/\*# sourceMappingURL=.*?\*\//g, '')).join('\n');
  writeFileSync(`dist/preset/${mode}.css`, `/*! @ionic/core palette\n${ionicLicense} */\n${styles}`);
}
