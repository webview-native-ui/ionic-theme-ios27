# Configure the iOS 27 theme

The [setup guide](setup.md) uses one preset stylesheet and `ios27ThemeConfig()`. This guide describes their defaults, application overrides and the individual CSS and animation APIs. Existing applications can adopt the presets using the [optional migration](migration.md#optional-adopt-the-setup-presets).

## Dark mode

Choose one preset and load it globally after Ionic's base CSS. Each preset bundles the matching Ionic palette, default theme variables, component styles, Material Design compatibility styles and dark theme variant.

| Appearance policy | Preset                                        | Activation                               |
| ----------------- | --------------------------------------------- | ---------------------------------------- |
| System            | `@rdlabo/ionic-theme-ios27/preset/system.css` | System appearance.                       |
| Manual            | `@rdlabo/ionic-theme-ios27/preset/class.css`  | `ion-palette-dark` on the document root. |
| Always dark       | `@rdlabo/ionic-theme-ios27/preset/always.css` | Always active.                           |

For class-based appearance, the application owns the class toggle.

```ts
document.documentElement.classList.toggle('ion-palette-dark', dark);
```

Replace the equivalent individual theme imports and Ionic dark-palette import with the selected preset so each stylesheet loads once. Put application CSS variable overrides after the preset. Native controls inherit the resulting appearance marker. See [native appearance inheritance](https://docs.rdlabo.dev/projects/capacitor-native-ui/docs/appearance).

## Compose individual stylesheets

Individual stylesheet imports remain supported. For example, system dark mode uses the following order after Ionic's base CSS.

```css
@import '@ionic/core/css/palettes/dark.system.css';
@import '@rdlabo/ionic-theme-ios27/dist/css/default-variables.css';
@import '@rdlabo/ionic-theme-ios27/dist/css/ionic-theme-ios27.css';
@import '@rdlabo/ionic-theme-ios27/dist/css/md-remove-ios-class-effect.css';
@import '@rdlabo/ionic-theme-ios27/dist/css/ionic-theme-ios27-dark-system.css';
```

Pair the Ionic palette and theme dark variant according to the same policy.

| Policy      | Ionic palette under `@ionic/core/css/palettes/` | Theme variant under `@rdlabo/ionic-theme-ios27/dist/css/` |
| ----------- | ----------------------------------------------- | --------------------------------------------------------- |
| System      | `dark.system.css`                               | `ionic-theme-ios27-dark-system.css`                       |
| Manual      | `dark.class.css`                                | `ionic-theme-ios27-dark-class.css`                        |
| Always dark | `dark.always.css`                               | `ionic-theme-ios27-dark-always.css`                       |

The compatibility stylesheet prevents iOS-specific utility classes from affecting Material Design components. For conditional iOS 26/27 styling and MD3 combinations, use the existing [adaptive theme composition](adaptive-themes.md).

## Configuration defaults and overrides

`ios27ThemeConfig(existingOptions)` returns a new Ionic configuration synchronously. It defaults an omitted or `undefined` mode to `ios` and supplies `iosTransitionAnimation`, `popoverEnterAnimation` and `popoverLeaveAnimation` when the effective mode is `ios`. Existing application animation options override these defaults, including an explicit `undefined` value. Other Ionic options are copied to the result.

```ts
import { ios27ThemeConfig } from '@rdlabo/ionic-theme-ios27';

const ionicConfig = ios27ThemeConfig({
  ...existingIonicConfig,
  navAnimation: customNavigationAnimation,
  popoverEnter: undefined,
});
```

Pass this result to the application's existing Ionic initializer before rendering. Use `provideIonicAngular`, `setupIonicReact` or `app.use(IonicVue, ionicConfig)` according to the framework. The [setup guide](setup.md#3-pass-theme-configuration-to-ionic) lists the framework imports.

### Preserve platform-based mode selection

An application that previously allowed Ionic to select its mode by platform should pass its selected mode explicitly when adopting the wrapper.

```ts
import { isPlatform } from '@ionic/core';
import { ios27ThemeConfig } from '@rdlabo/ionic-theme-ios27';

const ionicConfig = ios27ThemeConfig({
  ...existingIonicConfig,
  mode: existingIonicConfig.mode ?? (isPlatform('ios') ? 'ios' : 'md'),
});
```

An explicit `md` mode receives the application's supplied options without iOS animation defaults. Use the application's existing mode-selection function when its platform policy differs from this example. The selection must run before Ionic initializes.

## Wire animations individually

The individual animation exports remain available for manual configuration.

```ts
import { iosTransitionAnimation, popoverEnterAnimation, popoverLeaveAnimation } from '@rdlabo/ionic-theme-ios27';

const ionicConfig = {
  mode: 'ios' as const,
  navAnimation: iosTransitionAnimation,
  popoverEnter: popoverEnterAnimation,
  popoverLeave: popoverLeaveAnimation,
  ...existingIonicConfig,
};
```

The theme's transition already coordinates Native UI when enabled. Applications using a custom transition can follow the [transition adapter instructions](https://docs.rdlabo.dev/projects/capacitor-native-ui/docs/migration#native-ui-transition-adapter). Additional tab, segment and search effects are described in [animations](animation.md).
