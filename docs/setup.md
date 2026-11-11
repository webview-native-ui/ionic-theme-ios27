# Set up the iOS 27 theme

Give an existing Ionic app the iOS 27 appearance with one stylesheet and one theme configuration object. This guide uses the iOS 27 theme on its own and system dark mode. For browser-dependent iOS 26/27 styling or MD3, use [adaptive themes](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/adaptive-themes) instead.

## Before you start

Use an existing Ionic Angular, React, or Vue application with Ionic `>=8.8.1 <10`. Keep Ionic's base CSS imports. Browser-only apps do not need a native Capacitor project. This is the standard setup for the standalone theme package; Cordova applications use the optional [Cordova setup](cordova.md).

## 1. Install the theme and Foldable

```sh
npm install @rdlabo/ionic-theme-ios27 @erkamyaman/capacitor-foldable
```

Foldable supplies device placement and posture. Connect its initial values and change events using the [device layout guide](vertical-bars-layout.md#read-the-device-layout).

## 2. Load one stylesheet

Add the stylesheet after Ionic's base CSS in your global stylesheet. Replace your existing Ionic dark palette and theme imports with this stylesheet so each stylesheet loads once.

```css
@import '@rdlabo/ionic-theme-ios27/styles/system.css';
```

The stylesheet bundles the matching Ionic dark palette and theme styles. For manual or always-dark appearance, stylesheet composition and application overrides, see [configuration](configuration.md#dark-mode).

## 3. Pass theme configuration to Ionic

```ts
import { ios27ThemeConfig } from '@rdlabo/ionic-theme-ios27';

const ionicConfig = {
  ...ios27ThemeConfig,
  // animated: false,
};
```

The configuration supplies `mode: 'ios'` and page-transition and popover animations. Pass this configuration to your existing Ionic initializer before rendering. Add application options after the spread when needed.

| Framework         | Apply the options                                                   |
| ----------------- | ------------------------------------------------------------------- |
| Angular / Ionic 8 | `provideIonicAngular(ionicConfig)` from `@ionic/angular/standalone` |
| Angular / Ionic 9 | `provideIonicAngular(ionicConfig)` from `@ionic/angular`            |
| React             | `setupIonicReact(ionicConfig)` from `@ionic/react`                  |
| Vue               | `app.use(IonicVue, ionicConfig)` with `IonicVue` from `@ionic/vue`  |

Existing applications can follow the [optional setup migration](migration.md#optional-simplify-the-setup) to preserve platform-based mode selection and custom animations. See [configuration](configuration.md) for individual stylesheet and animation APIs.

## 4. Preview your first screen

Start your application's usual development server and open an existing page. Add this markup inside its `ion-content` (use your framework's component syntax):

```html
<ion-list inset="true">
  <ion-item-group>
    <ion-item><ion-label>Notifications</ion-label></ion-item>
    <ion-item><ion-label>Appearance</ion-label></ion-item>
  </ion-item-group>
</ion-list>
```

You should see an inset group with rounded edges. Switch the system between light and dark appearance, then navigate between pages to see the theme transition. Read [Using ion-item-group](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/using-ion-item-group) for list structure.

| If you see…                         | Check…                                                        |
| ----------------------------------- | ------------------------------------------------------------- |
| Material Design controls on desktop | Set `mode: 'ios'` in the existing Ionic initializer.          |
| Unstyled controls                   | Load the theme stylesheet globally after Ionic's base styles. |
| Mixed light and dark surfaces       | Use one matching Ionic palette and theme dark-mode variant.   |
| Default page transitions            | Pass the animation options before Ionic initializes.          |

## Next steps

- [Customize styles and components](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/features).
- [Add Native UI](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/add-native-ui) for supported controls in a Capacitor iOS app. Theme installation alone does not enable native controls.
- [Add Vertical Bars with an existing theme](https://docs.rdlabo.dev/projects/capacitor-native-ui/docs/ionic-vertical-bars).
- [Migrate an existing app](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/migration).
