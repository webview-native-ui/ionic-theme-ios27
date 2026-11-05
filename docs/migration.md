---
title: Theme migration
---

# Theme migration

This guide upgrades the standalone theme and its Capacitor integration. To adopt the Cordova-bundled theme, use [Moving an existing theme app to Cordova](cordova.md#moving-an-existing-theme-app-to-this-integration).

## Upgrading from 2.1.0

Keep your existing theme imports, stylesheets and animation setup. Native UI remains optional. Applications already using `enableNativeUI()` should keep their existing application-root runtime; the older package-separation migration below does not need to be repeated.

The measured device layout and modal sizing changes are available in theme `2.1.1-0`:

```sh
npm install @rdlabo/ionic-theme-ios27@next
```

For applications using Capacitor Native UI, follow the [2.1.0 upgrade steps](https://docs.rdlabo.dev/projects/capacitor-native-ui/docs/migration) for the paired plugin version, Foldable layout listener and native rebuild. The published plugin `2.1.1-0` includes the geometry resolver but predates the later automatic submit-emphasis and ownership-retention fixes; select a plugin release containing those fixes when testing them.

### Update device geometry

Replace a placement-only `{ edge, inset }` mapping with `setVerticalBarsLayout(await resolveVerticalBarsLayout(Foldable))` in the existing initial layout and `layoutChange` handler. `setVerticalBarsLayout` belongs to the theme; import `resolveVerticalBarsLayout` from `@rdlabo/capacitor-native-ui/integration`. Do not gate rail layout on a foldable-device capability check. Keep separate posture handling with `applyFoldStateClasses`.

Remove hardcoded toolbar-top values that were device workarounds, while retaining intentional application customizations. The theme's default is now the measured outer-display origin, 174px; device geometry can supply the inner-display origin, 124px. See [device layout values](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/vertical-bars-layout#apply-device-layout-values) for the complete example and fallback rules.

### Remove obsolete modal workarounds

With `ios-theme-vertical-bars` or `ios-theme-fold-expanded` on `ion-app`, floating cards and sheets leave at least 8px at each side. Viewports at least 600px high cap their width at 653px; shorter viewports use the available width minus 16px. Their top clearance follows the safe area, with an 8px minimum. Sheet breakpoints still control visible height.

Remove forced-full-width CSS added solely to avoid a rail overlap if you want these floating defaults. Keep deliberate full-screen presentations and application-specific sizing via `--width`, `--max-width` and `--height`. Ordinary phone and tablet defaults are unchanged when neither layout class is active. See [content and overlay layout](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/vertical-bars-layout#content-and-overlay-layout).

Solid submit markup remains `type="submit" fill="solid"`; existing `.button-submit` actions retain their styling-only meaning. With a plugin release containing the corresponding fix, the native rail uses the same emphasis. The application does not need to switch native controls to Web during navigation or modal animation.

Verify fold/rotation, rail appearance/disappearance, card/sheet/full-screen modals, light/dark appearance, and ordinary iPhone/browser layouts. Cordova applications should update their [bundled plugin](cordova.md), which pins its own theme version, rather than independently replacing the theme underneath that integration.

## Native UI package separation

Theme styles and ordinary theme API imports remain supported. If you previously used native controls through this package, the `/native` and `/vertical-bars` entries have been removed:

| Previous import                           | Replacement                                 |
| ----------------------------------------- | ------------------------------------------- |
| `@rdlabo/ionic-theme-ios27/native`        | `@rdlabo/capacitor-native-ui`               |
| `@rdlabo/ionic-theme-ios27/vertical-bars` | `@rdlabo/capacitor-native-ui/vertical-bars` |

Add the native package as a direct application dependency, update imports, rebuild Web assets, and run `npx cap sync ios`. Follow the [Native UI migration guide](https://docs.rdlabo.dev/projects/capacitor-native-ui/docs/migration) for 1.2.1 startup settings and native project changes. Theme-only apps do not need native startup or plugin setup.

## Device layout in 2.0

Install Foldable alongside the theme as part of the standard setup:

```sh
npm install @rdlabo/ionic-theme-ios27 @erkamyaman/capacitor-foldable
```

Replace the former device-layout APIs with Foldable subscriptions:

| Previous API                         | Replacement                                                                         |
| ------------------------------------ | ----------------------------------------------------------------------------------- |
| `DeviceLayout`, `HingeStatus`        | `BarPlacement`, `FoldState` and `HingeStatus` from `@erkamyaman/capacitor-foldable` |
| `getDeviceLayout()`                  | `Foldable.getBarPlacement()` and `Foldable.getFoldState()`                          |
| `deviceLayoutChange`                 | `barPlacementChange` and `foldStateChange` listeners                                |
| Start/stop device-layout monitoring  | Subscribe with `addListener()`; remove each listener at teardown                    |
| One-shot WebView corner-radius reads | Native UI's `getWebViewMetrics()`                                                   |

Apply placement with `setVerticalBarsLayout` and posture with `applyFoldStateClasses`, both imported from the theme. Read the initial state as well as subscribing to changes. See [device layout and split panes](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/vertical-bars-layout#read-the-device-layout) and [rail projection](https://docs.rdlabo.dev/projects/capacitor-native-ui/docs/vertical-bars#use-with-capacitor-foldable) for the current setup. Installing the packages alone does not subscribe to device events or activate projection.

## From the iOS 26 theme

For an app using `@rdlabo/ionic-theme-ios26`, the recommended migration keeps that package and adds `@rdlabo/ionic-theme-ios27`. The [adaptive theme setup](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/adaptive-themes) selects iOS 27 or iOS 26 styles by browser capability and leaves Ionic's default iOS appearance on older browsers.

### 1. Add the new package

Keep the iOS 26 package and add iOS 27. The new theme requires `@ionic/core` 8.8.1 or later (Ionic 8 or 9).

```bash
npm install @rdlabo/ionic-theme-ios27 @erkamyaman/capacitor-foldable
```

### 2. Make the styles adaptive

Replace unconditional iOS 26 imports in your global Sass stylesheet with two mutually exclusive branches. This example uses class-based dark mode:

```diff
+ @use 'sass:meta';
+
- @use '@rdlabo/ionic-theme-ios26/src/styles/default-variables.scss';
- @use '@rdlabo/ionic-theme-ios26/src/styles/ionic-theme-ios26.scss';
- @use '@rdlabo/ionic-theme-ios26/src/styles/ionic-theme-ios26-dark-class.scss';
- @use '@rdlabo/ionic-theme-ios26/src/styles/md-remove-ios-class-effect.scss';
+ @supports (overflow-anchor: auto) {
+  @include meta.load-css('@rdlabo/ionic-theme-ios27/src/styles/default-variables');
+  @include meta.load-css('@rdlabo/ionic-theme-ios27/src/styles/ionic-theme-ios27');
+  @include meta.load-css('@rdlabo/ionic-theme-ios27/src/styles/ionic-theme-ios27-dark-class');
+  @include meta.load-css('@rdlabo/ionic-theme-ios27/src/styles/md-remove-ios-class-effect');
+ }
+
+ @supports (text-wrap: pretty) and (not (overflow-anchor: auto)) {
+  @include meta.load-css('@rdlabo/ionic-theme-ios26/src/styles/default-variables');
+  @include meta.load-css('@rdlabo/ionic-theme-ios26/src/styles/ionic-theme-ios26');
+  @include meta.load-css('@rdlabo/ionic-theme-ios26/src/styles/ionic-theme-ios26-dark-class');
+  @include meta.load-css('@rdlabo/ionic-theme-ios26/src/styles/md-remove-ios-class-effect');
+ }
```

Keep Ionic's matching dark palette. For system or always-dark mode, replace both `-dark-class` imports with the matching variant. If you use `md-ion-list-inset`, load the corresponding package's stylesheet inside each branch. Browsers without either feature retain Ionic's default styling.

### 3. Switch the animations

Replace the iOS 26 animation import and gate the iOS 27 animations on the same browser features. Resolve the options before Ionic initializes:

```diff
- import { iosTransitionAnimation, popoverEnterAnimation, popoverLeaveAnimation } from '@rdlabo/ionic-theme-ios26';
+ import { iosTransitionAnimation, popoverEnterAnimation, popoverLeaveAnimation } from '@rdlabo/ionic-theme-ios27';
+
+ function loadIOSAnimations() {
+  if (typeof CSS === 'undefined') return {};
+  if (!CSS.supports('overflow-anchor: auto') && !CSS.supports('text-wrap: pretty')) return {};
+
+  return {
+    navAnimation: iosTransitionAnimation,
+    popoverEnter: popoverEnterAnimation,
+    popoverLeave: popoverLeaveAnimation,
+  };
+ }

  provideIonicAngular({
-  navAnimation: isPlatform('ios') ? iosTransitionAnimation : undefined,
-  popoverEnter: isPlatform('ios') ? popoverEnterAnimation : undefined,
-  popoverLeave: isPlatform('ios') ? popoverLeaveAnimation : undefined,
+  ...(isPlatform('ios') ? loadIOSAnimations() : {}),
  });
```

The iOS 27 page transition and popover animations serve both styled generations. Older browsers keep Ionic's defaults. The example uses Angular; pass the same options to React's `setupIonicReact` or Vue's `IonicVue`.

### 4. Update customizations

Rename theme variables and opt-out classes used by your app. For example:

```diff
  ion-content {
-  --ios26-content-box-shadow-rgb: 0, 0, 0;
+  --ios-theme-content-box-shadow-rgb: 0, 0, 0;
  }

- <ion-button class="ios26-disabled">Standard Ionic button</ion-button>
+ <ion-button class="ios-theme-disabled">Standard Ionic button</ion-button>
```

The old names remain as deprecated fallbacks. Check the resulting screens in light and dark modes on the browsers you support.

### iOS 27 only

To switch entirely to iOS 27, remove the iOS 26 package and replace its stylesheet and animation imports. The stylesheet changes are:

```diff
- @use '@rdlabo/ionic-theme-ios26/src/styles/default-variables.scss';
- @use '@rdlabo/ionic-theme-ios26/src/styles/ionic-theme-ios26.scss';
- @use '@rdlabo/ionic-theme-ios26/src/styles/ionic-theme-ios26-dark-class.scss';
- @use '@rdlabo/ionic-theme-ios26/src/styles/md-remove-ios-class-effect.scss';
+ @use '@rdlabo/ionic-theme-ios27/src/styles/default-variables.scss';
+ @use '@rdlabo/ionic-theme-ios27/src/styles/ionic-theme-ios27.scss';
+ @use '@rdlabo/ionic-theme-ios27/src/styles/ionic-theme-ios27-dark-class.scss';
+ @use '@rdlabo/ionic-theme-ios27/src/styles/md-remove-ios-class-effect.scss';
```

Change the animation import from `@rdlabo/ionic-theme-ios26` to `@rdlabo/ionic-theme-ios27`; the existing `isPlatform('ios')` configuration can stay. See the [iOS 27 setup](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/setup). Unconditional imports apply the new styles on every browser using Ionic iOS mode.

## iOS 27 naming

For the iOS 27 branch or an iOS 27-only app, use `@rdlabo/ionic-theme-ios27`. Its stylesheets are `ionic-theme-ios27.scss` or `ionic-theme-ios27.css`, including the `-dark-always`, `-dark-system`, and `-dark-class` variants. Keep the iOS 26 stylesheet names in the iOS 26 branch of an adaptive setup.

| Customization       | Current name                                                      | Legacy behavior                                                                                   |
| ------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| CSS variables       | `--ios-theme-*`, for example `--ios-theme-content-box-shadow-rgb` | Corresponding `--ios26-*` names remain deprecated fallbacks. Current names win when both are set. |
| Theme opt-out class | `ios-theme-disabled`                                              | `ios26-disabled` remains a deprecated alias; migrate existing markup when convenient.             |

Use the version-independent names for new customizations.

See [Special markup and classes](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/special-markup) and [Default variables](../src/styles/default-variables.scss) for the current names.

Earlier migration notes are preserved in the [iOS 26 migration guide](https://docs.rdlabo.dev/projects/ionic-theme-ios26/docs/migration).

## Submit button appearance

Submit buttons now use each Ionic color's standard contrast value and an iOS 27 directional edge treatment. Remove the theme-specific brightness variables.

```diff
  :root {
-  --ion-color-primary-brightness-rgb: 130, 255, 255;
-  --ion-color-primary-brightness: #96feff;
  }
```
