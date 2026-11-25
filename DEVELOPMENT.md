# Nand2Tetris Web IDE Developer Guide

This guide explains how the repository is built, tested, and organized, for human developers and coding agents alike. [CONTRIBUTING.md](./CONTRIBUTING.md) covers first time setup and the pull request process. [AGENTS.md](./AGENTS.md) adds the few rules that apply only to coding agents. [MANUAL_TESTING.md](./MANUAL_TESTING.md) lists checks that cannot be automated.

## Project Summary

The repository is a TypeScript monorepo of npm workspaces. It implements the full nand2tetris course, from hardware simulation through the operating system, as a browser IDE. GitHub Pages hosts the deployed app at <https://nand2tetris.github.io/web-ide>.

## Toolchain

| Tool | Version | Purpose |
|------|---------|---------|
| Node | 24 or newer | Runtime |
| npm | 10 or newer | Package manager and workspaces |
| TypeScript | ^6.0 | Language, with composite project references |
| Biome | ^2.4 | Formatter and linter |
| Vite | ^7 | Dev server and bundler for `web` |
| Vitest | ^4 | Unit tests for `simulator`, `components`, `web`, and `cli` |
| Playwright | ^1.52 | End to end tests for `web`, Chromium only |

## Package Roles

| Package | Role |
|---------|------|
| `projects/` | Static data: all HDL, ASM, VM, and Jack course files as TypeScript string exports |
| `runner/` | Bridge to the reference Java implementation for conformance testing |
| `simulator/` | Core emulation engine: chip, CPU, VM, assembler, compiler, and test runner |
| `components/` | Shared React components and Immer and RxJS state stores |
| `web/` | Vite single page app hosting all tools; deploys to GitHub Pages |
| `cli/` | `nand2tetris` grading CLI |
| `e2e/` | Playwright end to end tests for the web app |

## Package Build Order

Each package imports a previous package's `build/` output, so packages build in this order:

```
projects → runner → simulator → components → web
```

`cli` depends on `runner` and `simulator`. It is not part of the default test run.

## Key Commands

Run these from the repository root.

| Command | What it does |
|---------|-------------|
| `npm run check` | Builds the libraries, then checks format, types, and lint |
| `npm run format` | Formats TypeScript sources with Biome and writes the result |
| `npm run fix` | Applies automated Biome lint fixes |
| `npm test` | Runs `npm run build` (which runs `npm run check`), then Vitest in `simulator`, `components`, and `web` |
| `npm test -w <package>` | Runs Vitest in one package without rebuilding its dependencies |
| `npm run build` | Runs `npm run check`, then builds every package in order |
| `npm run watch` | Rebuilds `projects`, `runner`, `simulator`, and `components` on change |
| `npm run start` | Starts the Vite dev server for `web` at <http://localhost:5173/web-ide/> |
| `npm run test:e2e` | Runs the Playwright end to end tests (see below) |

Formatting and linting are fast, so run them after every change.

`npm run check` builds `projects`, `runner`, `simulator`, and `components` before it type checks, because packages reference each other's `build/` output. The build makes the check slow, so a TypeScript language server in an editor gives faster feedback while iterating.

## Conventions

- Put unit tests in `src/` beside their source as `*.test.ts` or `*.test.tsx`, not in a separate `tests/` directory.
- In `simulator`, return `Result<T, E>` from `@davidsouther/jiffies` instead of throwing exceptions.
- Define domain languages (HDL, ASM, VM, Jack, TST, and CMP) with Ohm.js grammars in `simulator`.
- Keep state stores in `components/src/stores` free of UI imports, so more than one front end can share them. Stores use `useImmerReducer`.
- Drive tick and tock through the RxJS `Clock` singleton (`Clock.get()`). React components subscribe to it in `useEffect`.
- Wrap user facing text in `web` with Lingui macros, as [Internationalization](#internationalization) describes.
- Use the existing formatter, linter, and test runners. Do not add another.

[README.md](./README.md#architecture) describes the architecture of each subsystem.

## Internationalization

`web` translates its interface with [Lingui](https://lingui.dev) 6. The Lingui configuration is `web/lingui.config.ts`. `components` and `simulator` do not use Lingui, so their strings are not translatable. `components/src/i18n.tsx` is an unused stub.

### Adding a string

- Wrap JSX text in `<Trans>` from `@lingui/react/macro`.
- Wrap strings in attributes, props, and code in the `` t`...` `` macro from `@lingui/core/macro`.
- Do not nest the two. `` <Trans>{t`Choose file`}</Trans> `` copies the whole source file into the catalog as a placeholder comment. Use `<Trans>Choose file</Trans>` instead.
- Do not assign message IDs. The SWC plugin in `web/vite.config.ts` derives each ID from the source text, which serves as the English message.
- Do not hardcode user facing text, such as the "Select local file" button in `web/src/shell/file_select.tsx`.

### Primitives and `components`

These rules keep the shared UI translatable ([web/src/ui](./web/src/ui) holds the shadcn primitives; [Styling and UI](#styling-and-ui) describes them):

1. **Primitives are Lingui-free.** `web/src/ui` never imports `@lingui/*` and ships no English text. Built-in strings (a Dialog close label, a Select placeholder, Slider and Tooltip `aria-label`s) are required props with no default, so TypeScript forces each caller to translate. Callers pass `<Trans>` children, or `` t`...` `` from `useLingui()` (not the global `t`) for any string passed as a prop, so it re-renders on a locale change.
2. **`components` stays Lingui-free.** Chrome text arrives already translated through render-prop slots, and `web` owns every string. Text inside custom widget content stays English until a human translation exists.
3. **Grow, do not truncate.** Text controls use `min-h-*` and `min-w-*`, never fixed `h-*` or `w-*`. Button labels wrap, and wells and tab lists wrap or scroll instead of clipping. Truncate only the Select trigger value, editor file tab names and the header title, and keep the full text reachable through the accessible name or a tooltip.

A Vitest guard enforces the first rule for `web/src/ui`. The `en-pl` and 150% text-scale `@smoke` specs check the rest.

### Catalogs

No manual step is needed. `npm run start`, `npm run build -w web`, and `npm test -w web` extract the messages into `web/src/locales/<locale>/messages.po` when they start, and the Lingui Vite plugin compiles each catalog when `web/src/locales.ts` imports it. Run `npm run extract -w web` only to inspect the catalogs without starting Vite. `web/src/.gitignore` ignores `web/src/locales/`, so the catalogs are not committed. No check fails on missing translations.

### Translations

The configured locales are `en`, which is the source locale, and `en-PL`, which is a pseudolocale with accented text that helps find strings that are not wrapped. No human translations exist yet. Because git ignores `web/src/locales/`, a translated `.po` file cannot be committed. Contributing a translation first requires changing `web/src/.gitignore` so that the locale's `messages.po` is tracked.

To add a locale, add it to `locales` in `web/lingui.config.ts`, and optionally map it in `fallbackLocales`. `web/src/locales.ts` loads every catalog it finds.

At startup, `web/src/App.tsx` activates `navigator.language`. In browser storage mode, `web/src/shell/settings.tsx` then activates the locale stored in the browser file `/locale`, and writes `en` there when the file is missing. The app has no language picker. A missing translation falls back to the fallback locale or the source text.

## Styling and UI

The app is moving from Pico CSS and SCSS to shadcn (Radix, Tailwind v4, `cva`). Until the last step deletes `web/src/pico/`, both systems coexist:

- Primitives live in `web/src/ui`, one file per part, and every Radix part sets `data-slot`. Tailwind is unprefixed.
- One cascade layer order, declared once in `web/public/root.css` before its first `@import`: `@layer base, pico, theme, components, utilities;`. Tailwind's preflight reset sits in `base`, under Pico, so it only reaches what Pico leaves unset. An element that relied on a browser default Pico never set (an `hr` margin, an inline `svg`) needs its own rule. Our own SCSS in `lecture_hall.scss` is unlayered and still wins over every layer.
- Layout in `web` uses Tailwind's flex utilities (`flex`, `flex-col`, `flex-1`, `justify-*`, `items-*`) directly; there is no `Stack` or `Row` wrapper. Widgets in `components` lay out their rows with plain CSS in `components/src/public`. Panels, tabs and accordions are `web/src/ui` primitives, and `components` widgets reach the Panel through a context wrapper like `Btn`.
- Icons come from Material Symbols Outlined, self-hosted as `web/public/material_symbols_outlined.woff2` and cut down to the names in `web/src/icons.ts`. An icon missing from that list draws as its name, and `web/src/icons.test.ts` fails. To add one, add its name to the list and run `npm run icons -w web`, which downloads the font again from Google Fonts. Commit the new font. Its size cap is under `fonts` in `web/bundle-budget.json`.
- Colour tokens are the `--lh-*` variables in `web/src/ui/tokens.css`. They stay canonical until the final rename to shadcn names. The Tailwind `dark:` variant follows `data-theme="dark"`.
- `components` styles its widgets with plain CSS in `components/src/public` and imports no Tailwind, Radix or `web/src/ui`. Chrome around a widget is passed in as slots from `web`.
- Primitives carry `coarse:min-h-11` for 44px touch targets and use the `phone` breakpoint (576px) for chrome. Page grids keep their SCSS thresholds.
- Until Pico is gone, button-based parts set explicit `bg-*`, `text-*` and `border-*` plus `w-auto mb-0`, use `inline-flex w-full` instead of `flex`, and add `grid-flow-row grid-cols-1` to Tailwind `grid`.
- `web/src/migration_guard.test.ts` counts remaining Pico imports, type selectors in `lecture_hall.scss` and Pico-only CSS variables. A step may only lower those numbers. `web/src/bundle_budget.test.ts` enforces `web/bundle-budget.json` against `web/build`, and fails in GitHub Actions when the build is missing.
- Tests: Radix needs browser APIs that jsdom lacks, and `web/src/setupTests.ts` stubs them. In e2e, `e2e/src/helpers.ts` provides `pick`, `toggle`, `openTab` and `dialog`. Use roles and accessible names, never Pico class names.

## End to End Tests

End to end tests live in `e2e/tests/` and run with Playwright against the dev server at <http://localhost:5173/web-ide/>.

| Command | What it does |
|---------|-------------|
| `npm run test:e2e` | Runs every test in CI mode: always starts a fresh dev server and retries failures |
| `npm run test:e2e:smoke` | Runs only the tests tagged `@smoke`, in CI mode |
| `npm test -w e2e` | Runs every test locally, reusing a dev server started with `npm run start` |
| `npm test -w e2e -- --headed` | Runs with a visible browser window |
| `npm test -w e2e -- --ui` | Opens Playwright UI mode for interactive debugging |
| `npm test -w e2e -- --debug` | Runs with the Playwright inspector attached |
| `npm run -w e2e flakes` | Repeats each test 10 times to identify flaky tests |

Append `-- --grep "<pattern>"` to any of these commands to limit which tests run.

The Playwright projects are:

| Project | Runs | Notes |
|---------|------|-------|
| `chromium` | Every spec outside the folders below | Desktop Chrome |
| `phone` | `tests/phone/` | 390x844, touch, mobile; checks overflow and 44px targets |
| `en-pl` | `tests/i18n/` | Seeds the `en-PL` pseudolocale before the app loads |
| `visual` | `tests/visual/` | Screenshot baselines; GitHub Actions and the Docker script only |

The `test:e2e*` scripts set `CI=true` even on a laptop, so checks that must differ in real CI test `GITHUB_ACTIONS` instead. The service-worker specs and the bundle budget skip locally without a `web/build`, and fail in GitHub Actions.

Set `BASE_URL` (with a trailing slash) to run specs against an already deployed site, for example `BASE_URL=https://nand2tetris.github.io/web-ide/ npm run test:e2e:smoke`. No dev server starts then.

### Visual baselines

`tests/visual/visual.spec.ts` screenshots every route and the Settings dialog at a desktop and a phone viewport. The baselines are Linux and Chromium only, committed in `tests/visual/visual.spec.ts-snapshots/`. Pull requests compare against them in GitHub Actions, and the diff images upload with the `playwright-results` artifact. A migration step must leave them unchanged, or update them on purpose in the same pull request.

Regenerate them in the official Playwright Docker image, so they match CI:

```
npm run test:e2e:visual:update
```

GitHub Actions runs the whole e2e job in the same image (`container:` in `.github/workflows/e2e.yaml`), so the tag `mcr.microsoft.com/playwright:v<version>-noble` must equal the installed `@playwright/test` version. Change both together, and regenerate the baselines after a Playwright upgrade.

`npm run test:e2e:visual:update -- --check` compares without rewriting, and leaves the diff images in `e2e/test-results/visual-docker`.

The script copies the repository into the container, builds it and rewrites the snapshots (amd64, so expect a few minutes). If Docker is not available, download the `playwright-results` artifact of a failed run and commit the `*-actual.png` images under their baseline names.

In CI mode, Playwright records a trace when it retries a failed test. View the trace with:

```
npx playwright show-trace e2e/test-results/<test-name>/trace.zip
```

Install the Playwright browser once after cloning, and again after upgrading Playwright:

```
npm run playwright:install
```

## Validation Gates

A change is ready for review when both of these commands exit 0:

- `npm run check` reports no format, type, or lint errors.
- `npm test` passes every Vitest suite.

End to end tests are not required for every change, but they must pass before merging a feature that touches the chip simulator UI. A change to desktop storage also requires the manual checks in [MANUAL_TESTING.md](./MANUAL_TESTING.md).
