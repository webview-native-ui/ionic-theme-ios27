# Toolbar button badges

Place `ion-badge` directly inside `ion-button`. The styling is scoped to
`ion-toolbar` and buttons that have a direct badge child; other badges retain
their existing layout. A single button and buttons inside `ion-buttons` are
both supported.

```html
<ion-toolbar>
  <ion-button slot="end" aria-label="Notifications">
    <ion-icon name="ellipsis-horizontal" slot="icon-only"></ion-icon>
    <ion-badge>3</ion-badge>
  </ion-button>
</ion-toolbar>

<ion-toolbar>
  <ion-buttons slot="end">
    <ion-button aria-label="Notifications">
      <ion-icon name="ellipsis-horizontal" slot="icon-only"></ion-icon>
      <ion-badge></ion-badge>
    </ion-button>
    <ion-button aria-label="More">
      <ion-icon name="ellipsis-horizontal" slot="icon-only"></ion-icon>
    </ion-button>
  </ion-buttons>
</ion-toolbar>
```

An empty badge is an unread indicator. `hidden` or `display: none` hides it;
removing the badge also keeps the button and neighbour in place. Give the action
an accessible label; CSS does not invent a localized unread announcement.

The native toolbar reference has an 18 pt badge, including the empty indicator.
The corresponding CSS uses an 18 px height, 13 px regular text and a rounded
trailing edge that stays fixed as the text grows to the left. Its default color
is the system toolbar red (`#ff373c`, after conversion of the native Display P3
capture to sRGB), with white text in both light and dark mode. `color="success"`
and other explicit Ionic colors retain their palette and contrast color.
The badge is positioned relative to the action content, not the whole group.
Shared glass groups allow the badge to paint above their surface.

The rule does not style badges in tabs, badges nested inside another child,
or buttons outside toolbars. Theme opt-outs on the toolbar, group, button or
badge remain authoritative. RTL mirrors the anchor using logical properties.

## Image regression coverage

The existing `demo/e2e/screenshot.spec.ts` route list includes
`/main/index/toolbar-badge`. The page contains standalone and grouped empty,
numeric and wide badges, a single-button group, a menu-button group, explicit
color, hidden and opted-out badges, and unrelated outside/nested badges. LTR
and RTL appear in the same image. The existing suite captures light and dark
mode; MD3 also uses its existing device-palette runs.

```sh
npm run build
npm --prefix demo ci
npm --prefix demo run test:e2e -- e2e/screenshot.spec.ts --grep 'for toolbar-badge$'
```

Generate authoritative baselines through the existing CI screenshot-update
workflow. Local Mac captures are review evidence and do not replace Linux CI
baselines. No separate dimension, interaction or custom-runner tests are added.

Browser rasterization and device-local fonts can vary. Native measurements guide
size, anchoring and typography; they do not imply zero pixel error across all
operating systems or arbitrary application fonts. Native projection and Web rail
cloning remain owned by `@rdlabo/capacitor-native-ui`.
