# Configure the iOS 26 theme

Use these individual stylesheets and animation exports when customizing the theme.
For the preset-based introduction, follow [Set up the theme](setup.md).

## Load styles individually

Keep Ionic's base styles first, then load the Ionic palette and theme files in
this order. This example follows the system's dark appearance.

```css
@import '@ionic/core/css/palettes/dark.system.css';
@import '@rdlabo/ionic-theme-ios26/dist/css/default-variables.css';
@import '@rdlabo/ionic-theme-ios26/dist/css/ionic-theme-ios26.css';
@import '@rdlabo/ionic-theme-ios26/dist/css/md-remove-ios-class-effect.css';
@import '@rdlabo/ionic-theme-ios26/dist/css/ionic-theme-ios26-dark-system.css';
```

`md-remove-ios-class-effect.css` handles iOS-specific utility classes when the
application uses Material Design mode. Load application overrides after these
imports. For the inset grouped-list design on Android, optionally add
`@rdlabo/ionic-theme-ios26/dist/css/md-ion-list-inset.css`. MD3 includes those list
styles already.

Pair one Ionic palette with the matching theme variant.

| Policy      | Ionic palette under `@ionic/core/css/palettes/` | Theme under `dist/css/`             | Preset equivalent   |
| ----------- | ----------------------------------------------- | ----------------------------------- | ------------------- |
| System      | `dark.system.css`                               | `ionic-theme-ios26-dark-system.css` | `preset/system.css` |
| Manual      | `dark.class.css`                                | `ionic-theme-ios26-dark-class.css`  | `preset/class.css`  |
| Always dark | `dark.always.css`                               | `ionic-theme-ios26-dark-always.css` | `preset/always.css` |

Manual dark mode uses `ion-palette-dark` on `document.documentElement`. Each preset
includes its matching Ionic palette and all five imports shown above. Replace the
corresponding individual imports when adopting a preset.

## Configure animations individually

Resolve the application's mode before Ionic initializes and supply animations for
that mode. This example retains Material Design mode on other platforms.

```ts
import { isPlatform, type IonicConfig } from '@ionic/core';
import { iosTransitionAnimation, popoverEnterAnimation, popoverLeaveAnimation } from '@rdlabo/ionic-theme-ios26';

const mode = existingIonicConfig.mode ?? (isPlatform('ios') ? 'ios' : 'md');
const ionicConfig: IonicConfig = {
  ...(mode === 'ios'
    ? { navAnimation: iosTransitionAnimation, popoverEnter: popoverEnterAnimation, popoverLeave: popoverLeaveAnimation }
    : {}),
  ...existingIonicConfig,
  mode,
};
```

`existingIonicConfig` is your application's current Ionic options object. Use `{}`
when there are no additional options. Its explicit values take precedence in this
example. Pass `ionicConfig` to your framework's existing initializer.

| Framework         | Initializer                        | Import                      |
| ----------------- | ---------------------------------- | --------------------------- |
| Angular / Ionic 9 | `provideIonicAngular(ionicConfig)` | `@ionic/angular`            |
| Angular / Ionic 8 | `provideIonicAngular(ionicConfig)` | `@ionic/angular/standalone` |
| React             | `setupIonicReact(ionicConfig)`     | `@ionic/react`              |
| Vue               | `app.use(IonicVue, ionicConfig)`   | `@ionic/vue`                |

## Preset options and customization

`ios26ThemeConfig(existingIonicConfig)` supplies iOS navigation and popover
animations, and defaults an omitted or undefined mode to `ios`. An explicit
`mode: 'md'` receives no iOS animation defaults. Preserve platform-based mode
selection by passing its resolved mode.

```ts
import { isPlatform } from '@ionic/core';
import { ios26ThemeConfig } from '@rdlabo/ionic-theme-ios26';

const mode = existingIonicConfig.mode ?? (isPlatform('ios') ? 'ios' : 'md');
const ionicConfig = ios26ThemeConfig({ ...existingIonicConfig, mode });
```

Explicit Ionic options take precedence over the helper's defaults, including
custom `navAnimation`, `popoverEnter`, and `popoverLeave` functions. An explicitly
supplied `undefined` animation also takes precedence over that animation default.
The helper reads no browser globals and can be imported in a server-rendered app.

For replacing an existing manual setup, see [Optional preset adoption](migration.md#optional-adopt-the-setup-presets).

## Optional: use the iOS 26 and MD3 themes together

Install MD3 to style both Ionic modes in the same application. Both themes require
`@ionic/core` 8.8.1 or later.

```sh
npm install @rdlabo/ionic-theme-ios26 @rdlabo/ionic-theme-md3
```

When the global stylesheet uses Sass, load the themes in this order. This example
uses class-based dark mode. For system or always-dark appearance, select the
matching variant for both the Ionic palette and iOS 26 theme.

```scss
@use '@ionic/core/css/palettes/dark.class.css';
@use '@rdlabo/ionic-theme-ios26/src/styles/default-variables.scss' as ios26-vars;
@use '@rdlabo/ionic-theme-ios26/src/styles/ionic-theme-ios26.scss';
@use '@rdlabo/ionic-theme-ios26/src/styles/ionic-theme-ios26-dark-class.scss';
@use '@rdlabo/ionic-theme-ios26/src/styles/md-remove-ios-class-effect.scss';
@use '@rdlabo/ionic-theme-md3/dist/css/default-variables.css' as md3-vars;
@use '@rdlabo/ionic-theme-md3/dist/css/ionic-theme-md3.css';
```

The explicit `ios26-vars` and `md3-vars` namespaces prevent the variable modules
from using the same default namespace. MD3 supplies its inset-list styles.
Configure the matching transitions before Ionic initializes.

```ts
import { isPlatform, type IonicConfig } from '@ionic/core';
import { iosTransitionAnimation, popoverEnterAnimation, popoverLeaveAnimation } from '@rdlabo/ionic-theme-ios26';
import { mdTransitionAnimation } from '@rdlabo/ionic-theme-md3';

const mode = existingIonicConfig.mode ?? (isPlatform('ios') ? 'ios' : 'md');
const ios = mode === 'ios';
const ionicConfig: IonicConfig = {
  navAnimation: ios ? iosTransitionAnimation : mdTransitionAnimation,
  popoverEnter: ios ? popoverEnterAnimation : undefined,
  popoverLeave: ios ? popoverLeaveAnimation : undefined,
  ...existingIonicConfig,
  mode,
};
```

Pass this object to the initializer for your framework using the table above.
