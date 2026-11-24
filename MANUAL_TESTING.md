# Manual Testing

Contributor playbook for features that resist automation. Browser automation tools like Playwright cannot drive a real native directory picker, so the local desktop storage feature must be verified by hand before any PR that touches `components/src/stores/base.context.ts`, `components/src/stores/base/fs.ts`, `components/src/stores/base/indexDb.ts`, or `web/src/shell/settings.tsx` is merged.

Chromium (Chrome, Edge, Brave, Opera) is required. Firefox and Safari do not implement the File System Access API.

## Setup

1. `npm install && npm run build`
2. `npm run start`
3. Open <http://localhost:5173/web-ide/> in Chromium.
4. Create an empty scratch folder anywhere on disk. This will be the "PC projects folder" for the session. A fresh empty folder is important; the app seeds it the first time.

## Desktop Storage round-trip

The feature being exercised: switching storage mode from Browser to PC, seeding the folder, editing a chip, reloading the tab, and confirming the edit persisted through `IndexedDB → FileSystemDirectoryHandle → FileSystemAccessFileSystemAdapter → chip store → editor`.

1. Open the gear icon (Settings) in the header.
2. Under **Projects File Storage**, select **Use Desktop Storage**.
3. Click **Select Projects Folder** and pick the empty scratch folder created above. Grant read/write permission when the browser prompts.
4. Confirm the folder path now renders next to **Projects folder location**. Close Settings.
5. In a file browser (Finder/Explorer), confirm the folder now contains `01/`, `02/`, … through `08/` with the expected assignment files.
6. In the IDE, select **Project 1** / chip **And**. The HDL editor should display the And template (`CHIP And { … }` with `//// Replace this comment with your code.`).
7. Add a recognisable marker line inside `PARTS:`, e.g. `// manual-test-marker`. The editor autosaves on change; no Save button.
8. Open `01/And.hdl` in your OS text editor. Confirm the marker is present on disk.
9. Reload the browser tab (Cmd/Ctrl+R).
10. Depending on the browser, you may see a permission prompt to re-grant access. Accept it.
11. The IDE should reopen on the chip page; reselect Project 1 / And if needed. Confirm the marker from step 7 is still in the editor.
12. Remove the marker, let autosave flush, reload once more, and confirm the edit is gone on both disk and in the editor.

Pass criteria: every step above behaves as described, no console errors, and the on-disk file contents stay in lockstep with the editor across the reload boundary.

## Keyboard and screen-reader pass

Run this on every primitive a migration step touches (Dialog, Tooltip, Button, Input, Select, Slider, Table, Panel and Accordion, in that order of the migration). Automated axe checks do not replace it.

1. Keyboard only, with the mouse unplugged: Tab reaches every control in a logical order and a visible focus ring shows where you are.
2. Dialogs: Tab and Shift+Tab stay inside while open, Escape closes (or cancels), and focus returns to the control that opened it. Chained dialogs restore focus step by step. Focus never lands on `<body>`: not when a dialog opens, not when its content swaps (Reset, Incomplete Setup) and not after it closes. Clicking outside a dialog does not dismiss it. Behind an open dialog, the page does not scroll or take focus.
3. Select and menus: Enter, Space and arrow keys open and move through the list, Home and End jump, Escape closes, typing a letter jumps to a match.
4. Tabs and toggle groups: arrow keys move between items, Tab leaves the group.
5. Switches and radio groups: Space toggles, and the label is announced with the state.
6. Tooltips: Tab onto an icon button and the tooltip opens on focus; Escape closes it. The text is also reachable without hover, through the accessible name or a visible label. On touch no tooltip appears and nothing depends on one.
7. Screen reader (VoiceOver on macOS or NVDA on Windows): each control announces a role, a name and its state. Dialogs announce their title when they open. Icon-only buttons have a name.
8. Touch (a phone or devtools device mode): every target is at least 44px, and nothing needs hover.
9. Record the browser, the screen reader and any defects in the pull request.

## Live site update check

Run this after every deploy (see the deploy decision in the migration map). The service worker can serve a stale app from cache.

1. Open <https://nand2tetris.github.io/web-ide/> in a profile that already visited the previous version. Wait for the update prompt or reload once.
2. Confirm the About page shows the new version.
3. Run `BASE_URL=https://nand2tetris.github.io/web-ide/ npm run test:e2e:smoke` against the live site.
4. Reload the tool pages (`chip`, `cpu`, `asm`, `vm`, `compiler`, `bitmap`) once offline and confirm they still load.
5. If the old version persists, unregister the service worker in DevTools → Application and report it before deploying again.

## Teardown

1. Settings → **Use browser storage** to revert.
2. Delete the scratch folder if you no longer need it.
3. If the app gets wedged on a stale IndexedDB handle, clear site data from Chromium DevTools → Application → Storage → Clear site data.

## When to run

- Any PR that touches the files listed in the opening paragraph.
- Before cutting a release.
- After upgrading Chromium or the File System Access API surface the app uses.

## Why this is manual

The native directory picker (`window.showDirectoryPicker`) requires a user gesture and returns handles that Playwright cannot mint from outside the page. A Node side fixture that forges File System Access handles inside the page has been prototyped, but it is not yet production quality.

For automated tests and the other validation gates, see [DEVELOPMENT.md](./DEVELOPMENT.md#validation-gates).
