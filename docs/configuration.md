# Configure the iOS 27 theme

The [setup guide](setup.md) uses one bundled stylesheet and `ios27ThemeConfig`. This guide describes their defaults, application overrides and the individual CSS and animation APIs. Existing applications can simplify their setup using the [optional migration](migration.md#optional-simplify-the-setup).

## Dark mode

Choose one stylesheet and load it globally after Ionic's base CSS. Each stylesheet bundles the matching Ionic palette, default theme variables, component styles, Material Design compatibility styles and dark theme variant.

| Appearance policy | Stylesheet                                    | Activation                               |
| ----------------- | --------------------------------------------- | ---------------------------------------- |
| System            | `@rdlabo/ionic-theme-ios27/styles/system.css` | System appearance.                       |
| Manual            | `@rdlabo/ionic-theme-ios27/styles/class.css`  | `ion-palette-dark` on the document root. |
| Always dark       | `@rdlabo/ionic-theme-ios27/styles/always.css` | Always active.                           |

For class-based appearance, the application owns the class toggle.

```ts
document.documentElement.classList.toggle('ion-palette-dark', dark);
```

Replace the equivalent individual theme imports and Ionic dark-palette import with the selected stylesheet so each stylesheet loads once. Put application CSS variable overrides after the stylesheet. Native controls inherit the resulting appearance marker. See [native appearance inheritance](https://docs.rdlabo.dev/projects/capacitor-native-ui/docs/appearance).

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

`ios27ThemeConfig` is a typed Ionic configuration object with `mode: 'ios'`, `iosTransitionAnimation`, `popoverEnterAnimation` and `popoverLeaveAnimation`. Spread it into the application's Ionic configuration before rendering. Properties added after the spread override the corresponding configuration values, including explicit `undefined` values.

```ts
import { ios27ThemeConfig } from '@rdlabo/ionic-theme-ios27';

const ionicConfig = {
  ...ios27ThemeConfig,
  animated: false, // Application preference overrides Ionic's default.
  popoverEnter: undefined, // Use Ionic's default popover enter animation.
};
```

A custom transition can replace `navAnimation` after the spread using the application's animation function. Create a new configuration object for application options, so other users of the shared configuration retain its defaults.

Pass this object to the application's existing Ionic initializer. Use `provideIonicAngular`, `setupIonicReact` or `app.use(IonicVue, ionicConfig)` according to the framework. The [setup guide](setup.md#3-pass-theme-configuration-to-ionic) lists the framework imports.

### Preserve platform-based mode selection

The configuration contains iOS mode and iOS animations. An application that selects its appearance by platform should select the whole configuration before Ionic initializes. For example, this application uses the iOS 27 theme on iOS and Ionic's Material Design defaults elsewhere.

```ts
import { isPlatform } from '@ionic/core';
import { ios27ThemeConfig } from '@rdlabo/ionic-theme-ios27';

const ionicConfig = {
  ...(isPlatform('ios') ? ios27ThemeConfig : { mode: 'md' as const }),
  animated: false, // Optional application setting, applied on both platforms.
};
```

Use the application's existing mode-selection policy when it differs from this example. Changing only `mode` after spreading the configuration retains its iOS animation properties. Select the appropriate configuration as a whole when both mode and animations should change. Browser-capability conditions and multi-theme selection can keep their [adaptive configuration](adaptive-themes.md).

## Wire animations individually

The individual animation exports remain available for manual configuration.

```ts
import { iosTransitionAnimation, popoverEnterAnimation, popoverLeaveAnimation } from '@rdlabo/ionic-theme-ios27';

const ionicConfig = {
  mode: 'ios' as const,
  navAnimation: iosTransitionAnimation,
  popoverEnter: popoverEnterAnimation,
  popoverLeave: popoverLeaveAnimation,
  // animated: false,
};
```

The theme's transition already coordinates Native UI when enabled. Applications using a custom transition can follow the [transition adapter instructions](https://docs.rdlabo.dev/projects/capacitor-native-ui/docs/migration#native-ui-transition-adapter). Additional tab, segment and search effects are described in [animations](animation.md).
