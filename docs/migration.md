---
title: Migration
---

# Migration

Review every section newer than the version currently installed, in ascending order. For example, when upgrading from 1.x to 9.0.0, complete the 2.0.0 and 3.0.0 migration steps before reviewing 9.0.0.

The optional setup section explains how to adopt the wrappers. Versioned sections
document upgrade changes and compatibility guidance.

## Optional: adopt the setup presets

Existing individual CSS paths and animation exports remain supported. You can
adopt `ios26ThemeConfig` and a CSS preset when simplifying your setup. New
applications can follow [Set up the theme](setup.md).

Replace the manual theme and Ionic dark-palette imports with the preset matching
your current dark-mode policy. For a system-dark application, the styles before
adoption are:

```css
@import '@ionic/core/css/palettes/dark.system.css';
@import '@rdlabo/ionic-theme-ios26/dist/css/default-variables.css';
@import '@rdlabo/ionic-theme-ios26/dist/css/ionic-theme-ios26.css';
@import '@rdlabo/ionic-theme-ios26/dist/css/md-remove-ios-class-effect.css';
@import '@rdlabo/ionic-theme-ios26/dist/css/ionic-theme-ios26-dark-system.css';
```

After adoption, keep Ionic's base CSS before this import and application overrides
after it:

```css
@import '@rdlabo/ionic-theme-ios26/preset/system.css';
```

For manual dark mode, use `preset/class.css` and retain your document root's
`ion-palette-dark` toggle. For always-dark appearance, use `preset/always.css`.
The preset includes the matching Ionic palette. Keep additional selective styles,
such as `md-ion-list-inset.css`, according to your application's existing needs.

Replace the manually assembled animation defaults with the configuration helper.
The following example preserves platform-based mode selection. Before adoption:

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

`existingIonicConfig` is your application's current options object. Use `{}` when
there are no additional options. After adoption:

```ts
import { isPlatform } from '@ionic/core';
import { ios26ThemeConfig } from '@rdlabo/ionic-theme-ios26';

const mode = existingIonicConfig.mode ?? (isPlatform('ios') ? 'ios' : 'md');
const ionicConfig = ios26ThemeConfig({ ...existingIonicConfig, mode });
```

Pass the result to the same `provideIonicAngular`, `setupIonicReact`, or
`app.use(IonicVue, ...)` call your application already uses. Resolve mode before
Ionic initializes. The helper defaults an omitted or undefined mode to `ios`;
an explicit `md` mode receives no iOS animation defaults. Supply your existing
resolved mode when preserving Ionic's platform-dependent appearance.

Explicit Ionic options take precedence over the helper's animation defaults,
including custom `navAnimation`, `popoverEnter`, `popoverLeave`, and an explicitly
supplied `undefined`. Keep custom animations in the options passed to the helper.
For per-file CSS composition and mixed-theme recipes, see
[Configuration](configuration.md).

## Migrating to 9.2.0

### Version-independent theme names

The theme opt-out class and CSS variables have been renamed to remove the OS version from their public names. The old names are deprecated; use the new names in new code and migrate existing customizations when convenient.

| Deprecated name                     | New name                             |
| ----------------------------------- | ------------------------------------ |
| `ios26-disabled`                    | `ios-theme-disabled`                 |
| `--ios26-content-box-shadow-rgb`    | `--ios-theme-content-box-shadow-rgb` |
| `--ios26-*` (other theme variables) | `--ios-theme-*` (same suffix)        |

```diff
- <ion-button class="ios26-disabled">Standard Ionic button</ion-button>
+ <ion-button class="ios-theme-disabled">Standard Ionic button</ion-button>
```

```diff
ion-content {
-  --ios26-content-box-shadow-rgb: 255, 255, 255;
+  --ios-theme-content-box-shadow-rgb: 255, 255, 255;
}
```

`ios26-disabled` remains supported as an alias. Old CSS variables remain supported as fallbacks, and the new variable takes precedence when both are set. Existing applications can therefore keep using the deprecated names during migration. Package names and stylesheet paths are unchanged.

## Migrating to 9.0.0

Version 9 aligns the theme's major version with Ionic Framework 9. It does not introduce additional breaking changes beyond those documented in the earlier migration sections.

Both Ionic 8 and Ionic 9 remain supported. Version 9 requires `@ionic/core >=8.8.1 <10`.

## Migrating to 3.0.0

### Rename `.header-item-group` to `.item-group-header`

The class for an `ion-item-group` used as a section header has been renamed for consistency with the element it modifies. Replace every occurrence of `.header-item-group` in application templates and styles.

```diff
- <ion-item-group class="header-item-group">
+ <ion-item-group class="item-group-header">
    ...
  </ion-item-group>
```

The old class is no longer styled by the theme. This rename applies to markup shared with `@rdlabo/ionic-theme-md3` as well.

## Migrating to 2.0.0

### Configure `iosTransitionAnimation`

Version 2 requires the package navigation transition. It follows Ionic's default iOS transition without the obsolete `animateBackButton()` behavior that animated a Large Title into the back-button label.

```ts
import { isPlatform } from '@ionic/core'; // or @ionic/angular/standalone, @ionic/react, @ionic/vue
import { iosTransitionAnimation } from '@rdlabo/ionic-theme-ios26';

// Angular
provideIonicAngular({
  // ...
  navAnimation: isPlatform('ios') ? iosTransitionAnimation : undefined,
});

// React
setupIonicReact({
  // ...
  navAnimation: isPlatform('ios') ? iosTransitionAnimation : undefined,
});

// Vue
createApp(App).use(IonicVue, {
  // ...
  navAnimation: isPlatform('ios') ? iosTransitionAnimation : undefined,
});
```

With this transition configured, `<ion-buttons><ion-back-button></ion-back-button></ion-buttons>` can be used without the unwanted transition side effects caused by the old animation.

## Migrating to 1.0.0

### Update SCSS import paths

The source files moved under `src/styles` when JavaScript files were added to the package.

```diff
- @import '@rdlabo/ionic-theme-ios26/src/default-variables.scss';
+ @import '@rdlabo/ionic-theme-ios26/src/styles/default-variables.scss';
```

Generated CSS paths under `dist` did not change.

### Rename `--ios26-color-background-rgb`

```diff
  :root {
-   --ios26-color-background-rgb: 255, 255, 255;
+   --ios26-content-box-shadow-rgb: 255, 255, 255;
  }
```

### Rename brightness variables

Replace each `--ion-color-*-brightness-rgb` variable with `--ion-color-*-brightness` and use a color value instead of an RGB channel list.

```diff
  :root {
-   --ion-color-primary-brightness-rgb: 130, 255, 255;
+   --ion-color-primary-brightness: #96feff;
  }
```
