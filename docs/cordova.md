# Set up the iOS 27 theme with Cordova

Install the theme in your Ionic Web project. Its stylesheet and animations work in the WebView.

```sh
npm install @rdlabo/ionic-theme-ios27
```

## Configure Ionic

Keep Ionic’s base styles and load the theme stylesheet for your existing dark-mode policy. For system appearance:

```css
@import '@rdlabo/ionic-theme-ios27/styles/system.css';
```

Spread `ios27ThemeConfig` into your existing Ionic initializer to enable the theme’s page transitions and popover animations. Follow the [Angular, React or Vue initialization example](setup.md#3-pass-theme-configuration-to-ionic).

## Add native controls

For native controls, [install the Cordova plugin](https://github.com/webview-native-ui/cordova-plugin#install-from-npm). Map the theme’s integration import to the Cordova adapter so both use the same runtime state. For Vite:

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

[Start Native UI](https://github.com/webview-native-ui/cordova-plugin#start-native-ui) once Cordova is ready and your app has mounted. Cordova has no equivalent to Capacitor Foldable for device placement and posture, so this integration cannot provide the iPhone Duo layout.

## Moving an existing theme app to this integration

Version 0.1.5 and earlier shipped the theme inside the plugin. Starting with 0.1.6, replace the old imports as follows. Pin theme version 2.2.0 to keep the appearance shipped in 0.1.5.

- `@webview-native-ui/cordova-plugin/theme` → `@rdlabo/ionic-theme-ios27`
- `@webview-native-ui/cordova-plugin/theme/css/*` → `@rdlabo/ionic-theme-ios27/dist/css/*`
