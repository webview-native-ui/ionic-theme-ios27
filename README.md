# Ionic Theme iOS26

A CSS/JS theme library that applies iOS26 design system to Ionic applications.

<!-- rdlabo-docs-pick -->

![iOS 26 themed Ionic screens with Liquid Glass tab bar, lists, and controls](https://raw.githubusercontent.com/rdlabo-dev/ionic-theme-ios26/v3.0.0/screenshots/ios26.png)

<!-- /rdlabo-docs-pick -->

DEMO is here: https://ionic-theme-ios26.rdlabo.dev/

## Installation

```sh
npm install @rdlabo/ionic-theme-ios26
```

After Ionic's base CSS, add the system-dark preset to your global stylesheet.

```css
@import '@rdlabo/ionic-theme-ios26/preset/system.css';
```

Pass `ios26ThemeConfig(existingIonicConfig)` to your existing Ionic initializer.
The helper supplies iOS mode and theme animations while accepting your Ionic
options. An explicit mode takes precedence.

```ts
import { ios26ThemeConfig } from '@rdlabo/ionic-theme-ios26';

const ionicConfig = ios26ThemeConfig();
```

Follow [Set up the theme](docs/setup.md) for Angular, React, and Vue examples,
dark-mode selection, and a preview. Use [Configuration](docs/configuration.md)
for individual CSS and animation exports, custom options, and iOS 26 with MD3.
Existing applications can adopt the wrappers using [Migration](docs/migration.md).

## Documentation

- [Using ion-item-group](https://docs.rdlabo.dev/projects/ionic-theme-ios26/docs/using-ion-item-group) — required markup for inset lists.
- [Special markup and classes](https://docs.rdlabo.dev/projects/ionic-theme-ios26/docs/special-markup) — opt-in markup and utility classes used by the theme.
- [ESLint](https://docs.rdlabo.dev/projects/ionic-theme-ios26/docs/eslint) — check list structure with ESLint rules.
- [Features](https://docs.rdlabo.dev/projects/ionic-theme-ios26/docs/features) — CSS variables, Liquid Glass, selective imports, and dark mode.
- [Experimental Animation](https://docs.rdlabo.dev/projects/ionic-theme-ios26/docs/experimental-animation) — tab bar and searchable effects.
- [iOS 18](https://docs.rdlabo.dev/projects/ionic-theme-ios26/docs/ios-18) — load the theme only on iOS 26.
- [Migration](docs/migration.md) — optional preset adoption and version-specific upgrade steps.

<!-- rdlabo-docs-omit -->

**Full documentation:** [https://docs.rdlabo.dev/projects/ionic-theme-ios26](https://docs.rdlabo.dev/projects/ionic-theme-ios26)

## Development & Testing

### JavaScript module builds

Keep relative imports in TypeScript source extensionless, matching Ionic's source
style. The shared `rdlabo-build-theme` CLI from `@rdlabo/ionic-theme-utils` uses
tsdown to resolve imports when generating ESM JavaScript and type declarations.
Dependencies remain external, and source files are not rewritten.

Run `npm run build && npm run test:esm` to build and verify the npm tarball with
the shared `rdlabo-check-esm` CLI. Public JavaScript entry points can be imported
in Node.js without a DOM; UI operations still require a browser or a supported
native environment. The package ships ESM only.

### Demo Application

The same demo is deployed against both supported Ionic versions:

- [Ionic 9 demo](https://ionic-theme-ios26.rdlabo.dev) — canonical
- [Ionic 8 demo](https://ionic8-theme-ios26.rdlabo.dev) — compatibility

The `demo/` directory contains the Angular application used by both deployments. To run it locally:

```bash
cd demo
npm install
npm start
```

### Visual Regression Testing

We use Playwright for visual regression testing to ensure consistent styling across all components. The test suite automatically captures screenshots of all routes in both light and dark modes.

#### Running Tests

```bash
cd demo

# Run all E2E tests
npm run test:e2e

# Run tests in UI mode (interactive)
npm run test:e2e:ui

# Debug tests
npm run test:e2e:debug

# Update baseline screenshots (when intentionally changing UI)
npm run test:e2e:update
```

### Prerelease channels

An open, non-draft pull request can be published to the npm `beta` dist-tag after its `Lint`, `E2E Screenshot Tests Pull Request`, and `Package Candidate` workflows pass. A repository owner or maintainer must add a comment whose entire body is:

```text
/beta
```

The request authorizes only the pull request head SHA and base branch that existed when the comment was added. The workflow revalidates the owner or maintainer permission, head SHA, and base branch immediately before publishing. Any new commit or retargeting invalidates the request; the new state must pass CI and receive a fresh owner or maintainer `/beta` comment. Fork pull requests are supported. Pull requests that change a release-gating workflow cannot be beta-published until those workflow changes land on their target branch.

Beta versions use `<base>-beta.pr<PR number>.sha<12-character SHA>`. The pull request receives a comment containing the immutable version and exact `npm install` command.

When a pull request is merged into `main` or `ios26`, it is automatically published to the npm `beta` dist-tag only after `Lint`, `E2E Screenshot Tests`, and `Package Candidate` all succeed for that exact merge commit. Direct pushes do not publish a candidate. Merge candidates use `<base>-beta.pr<PR number>.sha<12-character SHA>` and the merged pull request receives the exact install command.

Candidate code is built in a read-only workflow without npm publishing credentials. The privileged release workflow never checks out or executes pull request code; it revalidates the source workflow and package identity, then publishes only the immutable packed artifact with lifecycle scripts disabled. The install-command comment is a separate best-effort notification and cannot invalidate a successful npm publish.

Only `npm run release` can create a release tag. Stable `ios26-vX.Y.Z` tags (major, minor, or patch releases) publish to npm `latest`; revision/prerelease tags publish to `next`. Neither `beta` nor `next` publishing changes the npm `latest` dist-tag.

<!-- /rdlabo-docs-omit -->

<!-- rdlabo-docs-omit -->

## Maintainers

- [rdlabo](https://rdlabo.dev/)
<!-- /rdlabo-docs-omit -->
