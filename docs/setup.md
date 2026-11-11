# Set up the iOS 26 theme

Use an existing Ionic Angular, React, or Vue application with `@ionic/core >=8.8.1 <10`.

## 1. Install

```sh
npm install @rdlabo/ionic-theme-ios26
```

## 2. Load one stylesheet

After Ionic's base styles, add this import to your global stylesheet.

```css
@import '@rdlabo/ionic-theme-ios26/styles/system.css';
```

The stylesheet supplies the theme variables, component styles, Material Design
compatibility styles, Ionic system-dark palette, and matching theme dark styles.
Use `styles/class.css` for manual dark mode through the `ion-palette-dark` class
on the document root, or `styles/always.css` for always-dark appearance. Choose the
stylesheet matching your application's dark-mode policy and replace the corresponding
existing theme and Ionic dark-palette imports.

## 3. Configure Ionic

Spread `ios26ThemeConfig` into your existing framework initializer before rendering.
Use the example for your framework.

Angular with Ionic 9 imports `provideIonicAngular` from `@ionic/angular`.
With Ionic 8, use `@ionic/angular/standalone` for that import.

```ts
import { provideIonicAngular } from '@ionic/angular';
import { ios26ThemeConfig } from '@rdlabo/ionic-theme-ios26';

// In the application's existing providers array
provideIonicAngular({
  ...ios26ThemeConfig,
  // animated: false,
});
```

For React:

```ts
import { setupIonicReact } from '@ionic/react';
import { ios26ThemeConfig } from '@rdlabo/ionic-theme-ios26';

setupIonicReact({
  ...ios26ThemeConfig,
  // animated: false,
});
```

For Vue, use the application's existing Vue app:

```ts
import { IonicVue } from '@ionic/vue';
import { ios26ThemeConfig } from '@rdlabo/ionic-theme-ios26';

app.use(IonicVue, {
  ...ios26ThemeConfig,
  // animated: false,
});
```

The configuration sets `mode: 'ios'`, so the theme also appears in desktop previews.
Add your Ionic options after the spread to override defaults. If your application
selects modes by platform, conditionally spread the configuration only in iOS mode. See
[Configuration](configuration.md#theme-configuration-and-customization) for an example.

## 4. Preview

Start your application's usual development server and open an existing page. Add
this markup inside its `ion-content`, using your framework's component syntax.

```html
<ion-list inset="true">
  <ion-item-group>
    <ion-item><ion-label>Notifications</ion-label></ion-item>
    <ion-item><ion-label>Appearance</ion-label></ion-item>
  </ion-item-group>
</ion-list>
```

Check the rounded inset groups, navigate between pages, and check the selected
dark-mode policy. Read [Using ion-item-group](using-ion-item-group.md) for list
structure. [Configuration](configuration.md) covers individual CSS imports and
animation options. [Migration](migration.md) covers adopting the wrappers in an
existing application and version-specific upgrades.
