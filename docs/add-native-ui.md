# Add Native UI to your theme

For iOS Native UI and Android Dynamic Color together, use [WebView Native UI Standard setup](https://webview-native-ui.com/standard-setup). This page adds Native UI to an existing iOS theme.

Already using `@rdlabo/ionic-theme-ios27` in a Capacitor app? Add native controls on iOS while keeping your theme styles, Web content, and routing. Unsupported controls, browsers, and Android retain their Web appearance.

Start with [theme setup](https://webview-native-ui.com/projects/ionic-theme-ios27/docs/setup) if you have not configured the theme yet. If you use a different Web appearance, follow [existing-theme setup](https://webview-native-ui.com/projects/capacitor-native-ui/docs/ionic-vertical-bars) instead.

Read [how projection works](https://webview-native-ui.com/projects/capacitor-native-ui/docs/native-ui) for how native controls remain connected to your Web DOM and handlers.

## 1. Install the native plugin

This guide assumes a Capacitor 8 application with an iOS project. For Cordova, follow the separate [Cordova setup](cordova.md). Web-only theme users can continue without Capacitor; adding native iOS controls requires setting up that native project first. See [Native UI requirements](https://webview-native-ui.com/projects/capacitor-native-ui/docs/readme#requirements) for supported Ionic, iOS, and Xcode versions.

The theme and Native UI are versioned independently. Install a Native UI version compatible with the theme’s declared peer dependency, and install Foldable as a separate application dependency:

```sh
npm install @rdlabo/ionic-theme-ios27 @rdlabo/capacitor-native-ui @erkamyaman/capacitor-foldable
```

Keep the stylesheet from [theme setup](setup.md), which includes Vertical Bars layout. Use Foldable 8.5 or later within version 8. Capacitor's default plugin discovery requires a direct dependency; the copy installed through the theme alone does not register the native plugin.

## 2. Enable native controls

Run once after `ion-app` renders. Ordinary controls and Vertical Bars are enabled by default. Subscribe to device changes before applying the initial layout:

```ts
import { enableNativeUI } from '@rdlabo/capacitor-native-ui';
import { Foldable } from '@erkamyaman/capacitor-foldable';
import { resolveVerticalBarsLayout } from '@rdlabo/capacitor-native-ui/integration';
import { setVerticalBarsLayout } from '@rdlabo/ionic-theme-ios27';

await enableNativeUI();

const updateLayout = async () => {
  setVerticalBarsLayout(await resolveVerticalBarsLayout(Foldable));
};

void Foldable.addListener('layoutChange', () => void updateLayout().catch(console.error))
  .then(updateLayout)
  .catch(console.error);
```

For Angular, place this startup code in the app shell’s `afterNextRender` callback. For React or Vue, run both after mounting the app shell. The theme applies device spacing; Native UI handles native projection. A null edge restores ordinary layout.

Keep `navAnimation: iosTransitionAnimation` from the theme package. It already coordinates native controls during page transitions and back gestures; do not wrap it again. If you use a custom animation, follow the [transition adapter instructions](https://webview-native-ui.com/projects/capacitor-native-ui/docs/migration#native-ui-transition-adapter).

Installing the plugin or configuring theme animations does not activate native controls. The application enables them with the startup call above.

## 3. Sync and run on iOS

For CocoaPods projects, first complete the [Engine Podfile setup](https://webview-native-ui.com/projects/capacitor-native-ui/docs/configuration#native-project-setup). SwiftPM resolves Engine automatically. Build your Web assets, then run:

```sh
npx cap sync ios
```

Run the app on a supported iOS device or simulator. Eligible fixed controls should use native presentation and still invoke their existing handlers. Navigate forward and back, then check the same app in a browser to confirm Web fallback. If everything stays on the Web on supported iOS, confirm the direct dependency, startup call, sync, and native rebuild. See [supported controls](https://webview-native-ui.com/projects/capacitor-native-ui/docs/native-ui#supported-markup) for eligible markup and Web fallback behavior. Retain your theme styles for Web content and controls that are not projected.

## Upgrading an existing native integration

If you previously imported native APIs from the theme package, follow the [native import migration](https://webview-native-ui.com/projects/capacitor-native-ui/docs/migration#2-replace-native-imports) and [native project migration](https://webview-native-ui.com/projects/capacitor-native-ui/docs/migration#3-sync-the-native-project). Keep ordinary theme imports and stylesheets.
