# Ionic Theme iOS27

Apply iOS 27 Liquid Glass styling and animations to Ionic components in the browser or a WebView. For native iOS controls, add Capacitor Native UI.

**[Ionic 9 demo](https://ionic-theme-ios27.rdlabo.dev/) · [Setup guide](https://webview-native-ui.com/projects/ionic-theme-ios27/docs/setup)**

The setup guide shows Ionic 9. On Ionic 8 (8.8.1 or later), Angular apps import `provideIonicAngular` from `@ionic/angular/standalone`.

<!-- rdlabo-docs-pick -->

<p>
  <img src="https://raw.githubusercontent.com/rdlabo-dev/ionic-theme-ios27/main/screenshots/ios27-settings.png" width="32%" alt="iOS 27 theme: Settings in light mode with a Liquid Glass search bar" />
  <img src="https://raw.githubusercontent.com/rdlabo-dev/ionic-theme-ios27/main/screenshots/ios27-settings-dark.png" width="32%" alt="iOS 27 theme: Settings in dark mode" />
  <img src="https://raw.githubusercontent.com/rdlabo-dev/ionic-theme-ios27/main/screenshots/ios27-library.png" width="32%" alt="iOS 27 theme: Library with Liquid Glass buttons and tab bar" />
</p>

<!-- /rdlabo-docs-pick -->

<a id="get-started"></a>

## What would you like to do?

| Goal                                                    | Guide                                                                                                                                                                                                                      |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Style an existing Ionic app                             | [Get started](https://webview-native-ui.com/projects/ionic-theme-ios27/docs/setup)                                                                                                                                         |
| Select iOS 26/27 styles and optionally use MD3          | [Adaptive themes](https://webview-native-ui.com/projects/ionic-theme-ios27/docs/adaptive-themes)                                                                                                                           |
| Add native iOS controls to a Capacitor app              | [Add Native UI](https://webview-native-ui.com/projects/ionic-theme-ios27/docs/add-native-ui)                                                                                                                               |
| Add a side rail to Ionic while keeping your own theme   | [Vertical Bars step by step](https://webview-native-ui.com/projects/capacitor-native-ui/docs/ionic-vertical-bars)                                                                                                          |
| Optional: use the theme and Native UI with Cordova      | [Configure Ionic](https://webview-native-ui.com/projects/ionic-theme-ios27/docs/setup#3.-pass-theme-configuration-to-ionic), then [connect Cordova](https://webview-native-ui.com/projects/ionic-theme-ios27/docs/cordova) |
| Configure styles, dark mode and animations individually | [Configuration](https://webview-native-ui.com/projects/ionic-theme-ios27/docs/configuration)                                                                                                                               |
| Upgrade an existing installation                        | [Migration](https://webview-native-ui.com/projects/ionic-theme-ios27/docs/migration)                                                                                                                                       |

## Customize your app

- [Features](https://webview-native-ui.com/projects/ionic-theme-ios27/docs/features): CSS variables, Liquid Glass, and selective component imports.
- [Special markup and classes](https://webview-native-ui.com/projects/ionic-theme-ios27/docs/special-markup): opt-in component behavior.
- [Using ion-item-group](https://webview-native-ui.com/projects/ionic-theme-ios27/docs/using-ion-item-group): inset list markup.
- [Animation](https://webview-native-ui.com/projects/ionic-theme-ios27/docs/animation): tab, segment, and search effects.
- [ESLint](https://webview-native-ui.com/projects/ionic-theme-ios27/docs/eslint): catch unsupported list structure.
- [Vertical Bars layout](https://webview-native-ui.com/projects/ionic-theme-ios27/docs/vertical-bars-layout): spacing, RTL, device placement, posture, and split panes.

## Repository boundaries

The Capacitor plugin is maintained in [webview-native-ui/capacitor-plugin](https://github.com/webview-native-ui/capacitor-plugin). This repository owns the Ionic theme, the combined demo, browser screenshots, and simulator integration tests. The demo installs `@rdlabo/capacitor-native-ui` from npm; theme releases do not publish or change the plugin version.

The [Cordova plugin](https://github.com/webview-native-ui/cordova-plugin) provides the native integration. Install this theme separately in the Web project.

To verify an unpublished plugin archive against the real demo, run:

```sh
npm run test:native-candidate -- /absolute/path/rdlabo-capacitor-native-ui-VERSION.tgz --e2e
```

This creates an isolated temporary checkout and leaves your manifests and lockfiles unchanged. Add `--shard=1/2` alongside `--e2e` to run one Playwright shard; run every shard to cover the full suite. Each shard retains package checks, unit tests, and the production build. Add `--simulator=UDID` for native UI, search, and edge simulator suites. Diagnostics and the temporary demo are retained at the printed path. Plugin-only unit and native library tests live in the plugin repository. Its CI tests each candidate archive against this repository’s main branch.

For 1.x installations, see the [v1.2.1 guide](https://github.com/webview-native-ui/ionic-theme-ios27/tree/ios27-v1.2.1).

## Maintenance

Release the root theme package with `npm run release` from a clean, up-to-date `main`. The `ios27-v…` tag workflow publishes only the theme, using `next` for prereleases and `latest` for stable releases.

Theme and plugin versions are independent. For the standalone `@rdlabo/ionic-theme-ios27` package, Capacitor Native UI is a required peer dependency so the theme and application share one plugin instance. npm 7+ installs it automatically for theme-only apps; other package managers must install required peers. Apps using native controls must also declare the plugin directly for Capacitor discovery. A published npm version cannot be overwritten.
