# Set up the iOS 27 theme with Cordova

Install the standalone theme in the Web project after completing [Cordova setup](https://github.com/webview-native-ui/cordova-plugin#install-from-npm).

```sh
npm install @rdlabo/ionic-theme-ios27
```

Cordova has no equivalent to Capacitor Foldable for reporting device placement and posture. The iPhone Duo layout is unavailable with this integration.

## Load the theme stylesheet

Keep Ionic’s base styles and use the preset matching your existing dark-mode policy. For system appearance:

```css
@import '@rdlabo/ionic-theme-ios27/styles/system.css';
```

If using JavaScript helpers, import them from the theme package. In your Web bundler, map the exact module name

`@rdlabo/capacitor-native-ui/integration` → `@webview-native-ui/cordova-plugin/integration`

```ts
// vite.config.ts
import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    alias: [{
      find: /^@rdlabo\/capacitor-native-ui\/integration$/,
      replacement: '@webview-native-ui/cordova-plugin/integration',
    }],
  },
});
```

## Start Native UI after Cordova and the app are ready

Keep `<script src="cordova.js"></script>` in your Cordova entry HTML. Register the device-ready listener during startup, and wait for your framework to mount `ion-app` before enabling Native UI:

```ts
import { enableNativeUI } from '@webview-native-ui/cordova-plugin';

const deviceReady = new Promise<void>((resolve) => {
  document.addEventListener('deviceready', () => resolve(), { once: true });
});

export async function startNativeUI(appMounted: Promise<void>) {
  await Promise.all([deviceReady, appMounted]);
  return enableNativeUI();
}
```

Supply `appMounted` from your application's mount lifecycle, call `startNativeUI()` once and retain the returned handle. Call `await handle.destroy()` when the application permanently stops using Native UI. Do not create a new runtime for each page or also call `window.NativeUI.enableNativeUI()` alongside this npm-based startup. Browser previews do not emit Cordova's `deviceready`; keep this startup path for the Cordova build and preview the Web theme through your normal browser entry.

Build your Web assets into the Cordova application's `www` directory, then prepare and rebuild the native app, for example:

```sh
cordova prepare ios
cordova build ios
```

Use `android` for an Android build after completing its requirements. Do not use `npx cap sync` for Cordova. On iOS the adapter disables automatic scroll-view insets; apply safe-area spacing in your page CSS as described in the [plugin guide](https://github.com/webview-native-ui/cordova-plugin#start-native-ui).

## Moving an existing theme app to this integration

Version 0.1.5 and earlier shipped the theme inside the plugin. Starting with 0.1.6, replace the old imports as follows. Pin theme version 2.2.0 to keep the appearance shipped in 0.1.5.

- `@webview-native-ui/cordova-plugin/theme` → `@rdlabo/ionic-theme-ios27`
- `@webview-native-ui/cordova-plugin/theme/css/*` → `@rdlabo/ionic-theme-ios27/dist/css/*`
