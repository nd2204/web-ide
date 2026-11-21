# 02. Coexistence of Tailwind v4, Radix and shadcn with Pico

Research ticket: what is the safest way for Tailwind v4 + Radix + shadcn to coexist with Pico during a staged migration, and what breaks in tests?

Method: each claim below was read from the owning primary source (official docs or upstream source) on the research date. "Not verified" marks anything that could not be confirmed. Nothing here was run against this repo; the repo-specific consequences are inferences from the cited rules and are labelled as such.

## Summary

1. Layer order is already safe for the current setup. Tailwind v4 uses native cascade layers, and unlayered CSS beats every layer for normal declarations. Our unlayered SCSS therefore beats Tailwind utilities, which is the opposite of what shadcn components want. The existing `[data-slot]` exclusion is the right mitigation; keep it and prefer narrowing unlayered rules over `!important`.
2. `prefix(tw)` is the only mechanism that removes class-name collisions, but it changes every utility to `tw:` and conflicts with shadcn-generated code. Cheaper options: rename our helpers, or leave them (they are unlayered and win).
3. Preflight is safe to enable only after Pico is removed and after unlayered SCSS no longer relies on browser default margins, heading sizes, list styles or `display:inline` images. Import it as `layer(base)`.
4. Radix under jsdom needs `hasPointerCapture`, `releasePointerCapture`, `scrollIntoView`, `ResizeObserver` stubs (and `PointerEvent` on older jsdom). Tooltip needs a `TooltipProvider`.
5. Radix modal scroll lock sets `position: relative` on `body` via react-remove-scroll-bar; the library has a `noRelative` option, but whether Radix exposes it was not verified.
6. shadcn CLI supports monorepos through one `components.json` per workspace; Tailwind v4 requires `tailwind.config` blank.

## (a) Layer ordering and `prefix()` versus our helper classes

### What the sources say

- Tailwind v4's default entry declares layer order `theme, base, components, utilities` and imports `theme.css` into `theme`, `preflight.css` into `base`, and `utilities.css` into `utilities`. Source: <https://tailwindcss.com/docs/preflight> and <https://tailwindcss.com/docs/theme>.
- v4 uses "native cascade layers and no longer hijack[s] the `@layer` at-rule". Source: <https://tailwindcss.com/docs/upgrade-guide>.
- CSS precedence: "Styles that are not defined in a layer always override styles declared in named and anonymous layers." For `!important` the order reverses: important declarations in layers beat important declarations outside layers. Layers are ordered by first declaration; later layers win. Source: <https://developer.mozilla.org/en-US/docs/Web/CSS/@layer>.
- Within one layer, "the one defined later in the stylesheet wins, not the one listed later in the `class` attribute". Source: <https://tailwindcss.com/docs/styling-with-utility-classes>.
- Prefix: `@import "tailwindcss" prefix(tw);` yields classes such as `tw:flex tw:bg-red-500 tw:hover:bg-red-600`; the prefix "always" comes first, like a variant. Theme variables are still configured without the prefix, but generated variables carry it (`--tw-color-avocado-100`). Source: <https://tailwindcss.com/docs/upgrade-guide>; the one-line option is also on <https://tailwindcss.com/docs/styling-with-utility-classes>.
- `!` modifier now goes at the end (`flex!`), and `@import "tailwindcss" important;` marks all utilities important. Sources: same two pages.
- Options such as `prefix()` "belong on the individual imports they affect". Source: <https://tailwindcss.com/docs/preflight>. For our split imports that means the option goes on the `utilities.css` import (and presumably `theme.css`; see Not verified).

### Consequences for our repo (inference)

Our declared order is `@layer pico component user;` in `public/root.css`, and Tailwind imports `theme`, `utilities` layers. Which layer is declared first decides relative order between Pico and Tailwind utilities. Declare it explicitly in one place, for example `@layer pico, theme, components, utilities;`, so utilities beat Pico. Unlayered SCSS beats all of these.

Collisions with our helpers:

| Helper | Tailwind utility of same name | Effect |
|---|---|---|
| `.flex` (`display:flex; flex-direction:column`) | `.flex` = `display:flex` | Both match. Ours is unlayered, so its `flex-direction: column` applies and `display` agrees. A shadcn component using `flex` expecting a row would render as a column. Visible breakage. |
| `.flex-1` | `.flex-1` = `flex: 1` | Ours is unlayered and wins. Only a problem if the declarations differ (not checked). |
| `.row`, `.wrap` | No `.row` utility known; `wrap` is not a v4 utility name I could confirm | Probably no collision. Not verified; check the generated CSS for `.wrap`. |

Note: because `[data-slot]` is excluded from the global unlayered rules, but the helper classes are plain class selectors, the exclusion does not protect shadcn components from `.flex`.

### Options, ranked

1. Rename our helpers (for example `.stack`, `.fill`, `.row`, `.wrap` kept) and keep Tailwind unprefixed. Cheapest, no tooling interaction, and the end state is the standard shadcn setup.
2. Put our helpers into `@layer components` or a layer below `utilities` so Tailwind utilities win, still colliding by name but resolved by layer. Tailwind's own guidance is that the `components` layer is for classes you "still like to be able to override with utility classes" (<https://tailwindcss.com/docs/adding-custom-styles>).
3. `prefix(tw)`. Removes collisions but every `tw:` class must be written, and shadcn-generated components would need rewriting. `components.json` has a `prefix` field, "Prefix for Tailwind utility classes, applied to added components. Example: `tw-`", with no special handling for v4 described. Source: <https://ui.shadcn.com/docs/components-json>. Whether the CLI emits the v4 `tw:` form was not verified. Not recommended unless renaming is impossible.
4. `important`: not recommended. It would make utilities `!important` in a layer, which beats unlayered normal rules, but it would also override Pico and inline expectations globally.

## (b) Turning on preflight safely

Preflight is `layer(base)`: add `@import "tailwindcss/preflight.css" layer(base);` back to the import list. Source: <https://tailwindcss.com/docs/preflight>.

What it changes (same source): `margin:0; padding:0` on all elements; `box-sizing: border-box; border: 0 solid`; headings inherit size and weight; `ol, ul, menu` get `list-style: none`; `img, svg, video, canvas, audio, iframe, embed, object` become `display:block; vertical-align: middle`; `img, video` get `max-width:100%; height:auto`; `[hidden]` becomes `display:none !important`. The v4 upgrade guide adds: buttons use `cursor: default`, `<dialog>` margins are reset, placeholder uses current color at 50%. Source: <https://tailwindcss.com/docs/upgrade-guide>.

Safe conditions (inference from the above):

- Pico (and its layer) is fully removed. Pico also resets and styles these same elements, so two resets fight, and unlayered SCSS written against Pico's look would shift.
- Every remaining unlayered SCSS rule is audited for reliance on default margins, heading sizes, bullets, and inline images or SVG.
- Because preflight sits in the `base` layer, our unlayered rules still beat it, so turning it on cannot override explicit SCSS. It only changes things we never styled.
- Docs note preflight can break third-party widgets that rely on borders; fix with `@layer base` overrides. Source: <https://tailwindcss.com/docs/preflight>.
- Expect to restore explicit styles for headings, lists and `button { cursor: pointer }` if desired (upgrade guide gives the snippet).

Staged alternative: scope-limited preflight is not offered by Tailwind docs; not verified that any supported mechanism exists.

## (c) Radix under jsdom and Vitest

Sources are Radix upstream source on `main` plus the Radix issue tracker. Radix documents no testing guidance (the Dialog and Select doc pages contain none).

Facts from source:

- `SelectTrigger` calls `target.hasPointerCapture(event.pointerId)` then `target.releasePointerCapture(event.pointerId)` in `onPointerDown`, and only opens on pointerdown when `event.button === 0 && !ctrlKey && event.pointerType === 'mouse'`. `pointerTypeRef` defaults to `'touch'`, in which case opening happens on click instead. `SelectContentImpl` calls `candidate?.scrollIntoView({ block: 'nearest' })`. `SelectItem` selects on `onPointerUp` for mouse and on `onClick` otherwise. Source: <https://raw.githubusercontent.com/radix-ui/primitives/main/packages/react/select/src/select.tsx>.
- `Slider` calls `target.setPointerCapture`, `hasPointerCapture` in move and up handlers, and `getBoundingClientRect()` for value math. Source: <https://raw.githubusercontent.com/radix-ui/primitives/main/packages/react/slider/src/slider.tsx>.
- `@radix-ui/react-use-size` constructs `new ResizeObserver(...)` with no feature check. Source: <https://raw.githubusercontent.com/radix-ui/primitives/main/packages/react/use-size/src/use-size.tsx>. Slider imports `useSize`, so it needs `ResizeObserver` (other primitives that use it, such as Popper-based ones, not individually checked).
- `Tooltip` requires a `TooltipProvider` context; default `delayDuration` is 700 ms; touch pointers are ignored for hover-open. Source: <https://raw.githubusercontent.com/radix-ui/primitives/main/packages/react/tooltip/src/tooltip.tsx>. The exact thrown error text was not visible.
- jsdom added a `PointerEvent` class (fix commit 5a03f27, April 2025, issue closed). Older workaround: `window.PointerEvent = MouseEvent`. Source: <https://github.com/jsdom/jsdom/issues/2527>. Which jsdom version first ships it was not verified; check the jsdom version used by our Vitest.

Community workaround (reported, not endorsed): stub `hasPointerCapture`, `releasePointerCapture`, and `scrollIntoView` on `window.HTMLElement.prototype`. Reports in the same thread are mixed: a global `jest.fn()` mock broke form submission for one user and made Vitest hang for another; alternatives were targeting the `combobox` role or `user.selectOptions` on the hidden native `<select>`. Source: <https://github.com/radix-ui/primitives/issues/1822>.

Suggested setup file (a sketch for our Vitest `setupFiles`; not executed here):

```ts
// Minimal, idempotent stubs. Use real functions, not vi.fn(), so
// resetAllMocks does not strip them.
const proto = window.HTMLElement.prototype as any;
proto.hasPointerCapture ??= () => false;
proto.setPointerCapture ??= () => {};
proto.releasePointerCapture ??= () => {};
proto.scrollIntoView ??= () => {};
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
```

Per-primitive notes:

| Primitive | Needs | Evidence |
|---|---|---|
| Select | pointer-capture stubs, `scrollIntoView`, `ResizeObserver` (Popper positioning; not individually confirmed) | select.tsx above |
| Dialog | Portal to `document.body`; query via `screen`, not the render container. Focus is trapped, Esc closes | <https://www.radix-ui.com/primitives/docs/components/dialog> |
| Tabs, Switch, Collapsible, Accordion | Not individually verified; expected to need no pointer stubs | not verified |
| Tooltip | `TooltipProvider`; fake timers or `delayDuration={0}` because default is 700 ms | tooltip.tsx above |
| Slider | `setPointerCapture`/`hasPointerCapture`, `ResizeObserver`; `getBoundingClientRect` returns zeros in jsdom so pointer-driven value changes will not be meaningful; use keyboard events | slider.tsx above (zero rect is an inference about jsdom) |
| Popover | Not individually verified; Popper-based, expect `ResizeObserver` | not verified |

Testing tips from the sources: `Select.Root` renders a visually hidden native `select` for forms (<https://www.radix-ui.com/primitives/docs/components/select>), which can confuse role queries or be used with `selectOptions`. Because the default `pointerType` is `'touch'`, a test that fires only `click` opens the Select through the touch path and avoids pointer-capture, which may explain why some users pass without stubs. This is an inference from the source, not confirmed by a test.

## (d) Scroll lock versus an absolutely sized `#root`

Facts:

- Radix modal components (Dialog default `modal: true`) use `react-remove-scroll`; Radix Dialog docs do not mention scroll locking (<https://www.radix-ui.com/primitives/docs/components/dialog>). Its use of react-remove-scroll is therefore known to me only from the issue tracker and library code, not from the Dialog docs page. Release notes mention pinning `react-remove-scroll` to avoid double scrollbar bugs (<https://www.radix-ui.com/primitives/docs/overview/releases>, seen only as a search-result title, not read).
- react-remove-scroll-bar's generated CSS: `body[data-scroll-locked] { overflow: hidden !important; overscroll-behavior: contain; position: relative !important; margin-left:0; margin-top:0; margin-right: <gap>px !important; ... }` plus the CSS variable for removed bar size. `position: relative` is added only when `noRelative` is not set; `!important` is dropped with `noImportant`. Source: <https://raw.githubusercontent.com/theKashey/react-remove-scroll-bar/master/src/component.tsx> (paraphrased from a summary of the file; exact string not seen verbatim).
- Layout shift from the scrollbar toggling is a long-standing Radix discussion (<https://github.com/radix-ui/primitives/discussions/1100>, <https://www.github.com/radix-ui/primitives/discussions/1586>; read only as search snippets).

Consequence for an absolutely sized `#root` (inference): `body` becoming `position: relative` makes `body` the containing block for an absolutely positioned `#root` that previously resolved against the initial containing block. If `html`/`body` sizes differ (body height not 100%), `#root` can resize or move when a dialog opens. The `!important` means a normal unlayered rule cannot undo it, only `!important` rules can (unlayered `!important` loses to layered `!important`, per MDN, but the injected style is unlayered, so a more specific `!important` selector is needed).

Fixes, from least to most invasive:

1. Make `html, body { height: 100%; margin: 0 }` and `#root { position: absolute; inset: 0 }` so the new containing block is the same rectangle. Safest and independent of Radix internals.
2. Override: `body[data-scroll-locked] { position: static !important; }` (selector specificity must beat the library's; the library repeats the attribute in some versions, so verify in devtools). Not verified against the Radix-bundled version.
3. `modal={false}` on Dialog/Popover to avoid the lock. This changes accessibility behavior (no focus trap or outside-interaction blocking); effect on scroll lock not confirmed in docs. A web search found no confirmation.
4. Use `noRelative`/`gapMode` if Radix exposes them. Not verified that Radix does.

Recommend option 1, then confirm with a Playwright check that opening a Select or Dialog does not change `#root`'s bounding box.

## (e) Playwright patterns for Radix

Verified:

- Playwright recommends `getByRole` with an accessible name; locators are strict and re-resolve on each action. Do not use `first()`/`nth()` as a habit. Source: <https://playwright.dev/docs/locators>. The page does not mention the `combobox` or `option` roles.
- Radix Select follows the ListBox WAI-ARIA pattern, content renders in a Portal on `document.body`, Enter/Space/Arrow keys open it, Esc closes and returns focus. Source: <https://www.radix-ui.com/primitives/docs/components/select>. The trigger is `role="combobox"` and items are `role="option"`; I derived these from the pattern, and the Select page itself does not state the role names. Not verified from source.
- Radix Dialog follows the WAI-ARIA Dialog pattern, and its title is announced, so `getByRole('dialog', { name })` should work when `Dialog.Title` exists. Source: Dialog page above.

Pattern (sketch, not run):

```ts
await page.getByRole('combobox', { name: 'Speed' }).click();
await page.getByRole('option', { name: 'Fast' }).click();
await expect(page.getByRole('combobox', { name: 'Speed' })).toHaveText('Fast');
```

Because the listbox is portaled, query from `page`, not from a container locator. Use the hidden native `select` only via `locator('select')`, and expect it to be visually hidden.

## (f) shadcn CLI in a non-Next, Vite, npm-workspaces monorepo with a separate components package

Verified (<https://ui.shadcn.com/docs/monorepo>, <https://ui.shadcn.com/docs/components-json>, <https://ui.shadcn.com/docs/cli>, <https://ui.shadcn.com/docs/installation/vite>):

- Each workspace needs its own `components.json`; `style`, `iconLibrary` and `baseColor` must match across them.
- Aliases are mandatory in `components.json`; they may use `tsconfig` `paths` or `package.json#imports`. Shared imports like `@workspace/ui/components` resolve via the target package's `exports`.
- For Tailwind v4, `tailwind.config` must be left blank. `tailwind.css` points at the stylesheet to edit. `cssVariables` and `style` "cannot be changed after initialization".
- The CLI routes files by type: adding `button` installs it in the UI package and rewrites imports in the app.
- `add` options: `-c/--cwd`, `-o/--overwrite`, `-p/--path`, `--dry-run`, `--diff`, `--view`. Run from the workspace holding the `components.json`.
- Vite is an accepted template. Existing Vite installs need `@import "tailwindcss"`, a `@/*` tsconfig path, and a Vite `resolve.alias`.
- The monorepo docs describe a pnpm + Turborepo starter; npm workspaces are not mentioned either way. The doc page says nothing about workspace tooling beyond that. npm workspace behavior is therefore not verified.

Implications (inference): our `components/` package is the natural home for shadcn primitives, with `web/` importing from it. That means a `components.json` in both, `components` building to `build/` (our packages import each other's `build/`), and the Tailwind CSS entry living in `web/` (the app), with `@source` pointing at `components/src` so utilities used there are generated. The `@source` requirement comes from general Tailwind v4 behavior and was not verified in this pass. shadcn components in v4 use `data-slot`, `React.ComponentProps` instead of `forwardRef`, `@theme inline`, and `tw-animate-css` (<https://ui.shadcn.com/docs/tailwind-v4>); note `components` is not Lingui-enabled, so shadcn components with text must take it via props.

## Not verified

- Whether our unlayered `.flex-1` declares the same properties as Tailwind's `.flex-1`; whether any Tailwind v4 utility is named `.wrap` or `.row`.
- Whether `prefix(tw)` applies to `theme.css`, and what the shadcn CLI emits when `components.json` `prefix` is set under v4.
- Whether Radix exposes `noRelative`, and the exact `body[data-scroll-locked]` CSS in the react-remove-scroll version bundled with our Radix. The CSS template came from a tool summary, not a verbatim read.
- Per-primitive jsdom needs for Tabs, Switch, Collapsible, Accordion, Popover.
- Role names `combobox`/`option` from Radix's own docs.
- Vitest 5 specifics and which jsdom version we run (the jsdom `PointerEvent` fix date is from the issue page).
- Radix `modal={false}` effect on scroll lock.
- npm-workspaces behavior of the shadcn CLI.
- Radix release notes and the two Radix scroll-shift discussions were seen only as search-result titles/snippets, not opened.
