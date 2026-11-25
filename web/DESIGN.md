---
name: Nand2Tetris Web IDE (Braun Calculator)
description: A Dieter Rams calculator body in matte warm grey, where pill keys carry one colour per meaning.
colors:
  ground-dark: "#1c1c1a"
  panel-dark: "#242421"
  raised-dark: "#2c2c29"
  seam-dark: "#3d3d38"
  ink-dark: "#ece9e1"
  muted-dark: "#a19e94"
  orange-input-dark: "#f59a3c"
  green-output-dark: "#86c866"
  grey-internal-dark: "#a8a59a"
  red-error-dark: "#ff8a7a"
  ground-light: "#e9e7e1"
  panel-light: "#f6f4ee"
  raised-light: "#efede6"
  seam-light: "#cfccc3"
  ink-light: "#2a2a28"
  muted-light: "#6b685f"
  orange-input-light: "#b85f08"
  green-output-light: "#3f7f26"
  grey-internal-light: "#6e6b61"
  red-error-light: "#b3261e"
  key-yellow: "#f2d21a"
  on-yellow-dark: "#1c1c1a"
  on-yellow-light: "#2a2a28"
  yellow-text-light: "#6e5a00"
typography:
  body:
    fontFamily: "Be Vietnam Pro, system-ui, -apple-system, Segoe UI, Roboto, Noto Sans, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
  title:
    fontFamily: "Be Vietnam Pro, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 700
  label:
    fontFamily: "Be Vietnam Pro, system-ui, sans-serif"
    fontSize: "0.9rem"
    fontWeight: 700
    lineHeight: 1.2
  caption:
    fontFamily: "Be Vietnam Pro, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    letterSpacing: "0.08em"
  mono:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "15px"
    fontWeight: 400
rounded:
  field: "4px"
  panel: "6px"
  key: "999px"
spacing:
  gap: "8px"
  key-height: "1.75rem"
  key-padding-x: "0.8rem"
  panel-inset: "0.75rem"
components:
  key:
    backgroundColor: "{colors.raised-light}"
    textColor: "{colors.ink-light}"
    typography: "{typography.label}"
    rounded: "{rounded.key}"
    height: "{spacing.key-height}"
    padding: "0 0.8rem"
  key-primary:
    backgroundColor: "{colors.key-yellow}"
    textColor: "{colors.on-yellow-light}"
    rounded: "{rounded.key}"
    height: "{spacing.key-height}"
  panel:
    backgroundColor: "{colors.panel-light}"
    textColor: "{colors.ink-light}"
    rounded: "{rounded.panel}"
  panel-header:
    backgroundColor: "{colors.raised-light}"
    typography: "{typography.title}"
    padding: "0.1rem 0.6rem"
  field:
    backgroundColor: "{colors.raised-light}"
    textColor: "{colors.ink-light}"
    rounded: "{rounded.field}"
  tab-active:
    backgroundColor: "{colors.raised-light}"
    textColor: "{colors.yellow-text-light}"
    rounded: "{rounded.key}"
  tool-pill-current:
    backgroundColor: "{colors.key-yellow}"
    textColor: "{colors.on-yellow-light}"
    rounded: "{rounded.key}"
---

# Design System: Nand2Tetris Web IDE

## Overview

**Creative North Star: "The Braun Calculator"**

The IDE reads as a Dieter Rams calculator: a matte warm-grey body, quiet panels, and tactile pill keys where one colour means one thing. Light is the Braun ET 66 body; dark is the same device in charcoal. A student should see at a glance which pin is input, output or internal by key colour, and whether the test passed. The tool is the instrument, not the subject.

Density is calm and compact. Panels sit on a single 8px grid gap, keys share one height, and every colour is spent on a meaning: yellow is the one primary action and the current step, orange marks inputs, green marks outputs and passes, grey marks internals, red marks errors. Everything else is warm grey.

The build rejects the stock IDE grey-with-one-blue and the earlier chalk-on-slate world.

**Key Characteristics:**
- Matte warm-grey ground, panels and raised title bars, divided by 1px seams.
- Pill-shaped keys with a darker bottom lip; panels at 6px, fields at 4px.
- One colour per meaning; the same hue roles in both themes, retuned for contrast.
- Be Vietnam Pro for the interface, JetBrains Mono for values.
- Light and dark themes are the same system, switched by `data-theme`.

## Colors

A warm-grey neutral field with one yellow key colour and three small signal hues. Values below are normative in the frontmatter; the code token names (`--lh-*`) predate this world and keep their old hue words (`--lh-blue` holds orange, `--lh-amber` holds grey).

### Primary
- **Key Yellow** (#f2d21a): the one primary action (`button.lh-primary`), the current tool pill, the current test step highlight, cursor and selection tints. Identical in both themes. As text on light ground it is replaced by **Dark Olive Yellow** (#6e5a00, `--lh-accent-text`), used for active tab labels and links.

### Secondary
- **Input Orange** (dark #f59a3c, light #b85f08): input pins, their traces and bit cells; Monaco `type` tokens.
- **Output Green** (dark #86c866, light #3f7f26): output pins, passed state, success dot, on-switch, correct diff cells.
- **Internal Grey** (dark #a8a59a, light #6e6b61): internal pins and the warning dot.

### Tertiary
- **Error Red** (dark #ff8a7a, light #b3261e): errors, failed diff cells, error status dot.

### Neutral
- **Ground** (dark #1c1c1a, light #e9e7e1): page, header, footer.
- **Panel** (dark #242421, light #f6f4ee): cards, editor background.
- **Raised** (dark #2c2c29, light #efede6): panel title bars, keys, fields, active tabs.
- **Seam** (dark #3d3d38, light #cfccc3): every 1px border and divider.
- **Ink** (dark #ece9e1, light #2a2a28): primary text. Light focus ring is Ink; dark focus ring is Key Yellow.
- **Muted** (dark #a19e94, light #6b685f): secondary text, inactive tabs and pills.

### Named Rules
**The One Colour Per Meaning Rule.** Yellow, orange, green, grey and red each carry exactly one meaning. A hue is never reused as decoration.

**The Lone Yellow Rule.** At most one filled-yellow key per screen, plus the current step and current tool pill. Yellow never appears as light-theme text.

## Typography

**Display Font:** none; the IDE has no display tier.
**Body Font:** Be Vietnam Pro (system-ui, Segoe UI, Roboto, Noto Sans), self-hosted TTF at 400, 600 and 700 from `public/`.
**Label/Mono Font:** JetBrains Mono (self-hosted TTF, `public/jet_brains_mono.ttf`, 400) at 15px (`--font-size-monospace`).
**Icon Font:** Material Symbols Outlined, self-hosted `public/material_symbols_outlined.woff2`: one static style (FILL 0, wght 400, GRAD 0, opsz 24) holding only the icons listed in `src/icons.ts`, so it works offline.

**Character:** A friendly, geometric sans designed for Vietnamese diacritics, paired with a plain mono for bits and code. Weight does the hierarchy, not size.

### Hierarchy
- **Title** (700, 1rem): panel title bars, dialog headers, product name.
- **Label** (700, 0.9rem, line-height 1.2): keys, tabs.
- **Body** (400, 1rem): prose, settings values.
- **Caption** (700, 0.75rem, 0.08em tracking, uppercase): pin table column heads only.
- **Mono** (400, 15px; 700 inside bit cells at 0.8-0.9rem): pin names, bit values, editor.

### Named Rules
**The Weight Is The Hierarchy Rule.** Sizes stay within 0.75-1rem; emphasis is 700 against 400.

## Layout

Pages are grids of panels with 8px outer padding on `main` and an 8px gap (`--lh-gap`) between panels. A fixed header (ground, 1px seam beneath) holds the product path left and a tool capsule right; a footer holds the status line. Panel title bars are as tall as one row of keys (`--lh-btn-h` 1.75rem) and wrap controls beneath. Interior insets are 0.75rem. Nested panels become sections divided by a seam, not cards. On narrow screens the header title truncates and the tool capsule scrolls horizontally. On coarse pointers keys, tabs and pin bit cells grow to a 44px minimum height.

## Elevation & Depth

Flat and tonal. Depth comes from stepping Ground, Panel and Raised plus 1px seams; no drop shadows exist. The only shadow is the key lip.

### Shadow Vocabulary
- **Key lip** (`box-shadow: inset 0 -2px 0 rgb(0 0 0 / 14%)`): the darker bottom edge on every key and pill button.
- **Key pressed** (`box-shadow: inset 0 1px 0 rgb(0 0 0 / 14%)` with `transform: scale(0.97)`): the active state.
- **Pin key lip** (`inset 0 -3px 0` in a darker mix of the pin colour): the bit key's lip, flattening to `inset 0 0 0` when pressed.

### Named Rules
**The Inset Lip Rule.** Keys carry an inset lip only; nothing floats and nothing casts an outer shadow.

## Shapes

Pill (999px) for keys, tabs, header tool pills, the tool capsule, selects, toggle switches, the segments of a segmented well and pin bit cells; 6px for panels, accordion keycaps, dialogs and dropdown lists; 4px for text fields, the import well and storage choice keys. A 16-bit bus is one joined pill: only the first and last cells are rounded. 1px seams define panels; bit cells use a 1.5px outline in the pin colour.

## Components

### Keys (buttons)
- **Shape:** pill (999px), 1.75rem minimum height, 0.8rem horizontal padding, icon-only keys square.
- **Default:** Raised fill, 1px Seam border, Ink 700 text at 0.9rem, bottom lip.
- **Primary (`lh-primary`):** Key Yellow fill and border, on-yellow ink text; hover brightens 8%.
- **Hover / Active / Disabled:** hover tints with a 8% ink overlay and a Muted border; active presses (scale 0.97, lip flips); disabled goes transparent at 70% opacity. 120ms ease-out transitions, removed under reduced motion.
- **Groups:** every button in a group is its own pill with a 0.3rem gap.

### Panels
- **Corner Style:** 6px. **Background:** Panel with 1px Seam border. **Title bar:** Raised, 700, seam beneath. Wide content scrolls sideways; it never clips.

### Fields, selects, sliders and switches
- **Wells, not raised:** text fields, selects, segmented wells, slider tracks and switch tracks are sunk wells (`--lh-well`: dark #171715, light #e2dfd5) with a 1px edge (`--lh-well-edge`: dark #6e6b62, light #9a968b). Focus draws a 2px outline (Ink in light, Key Yellow in dark) offset 2px.
- **Keys are lit:** buttons use the key face (`--lh-key`: dark #3d3d38, light #fffefb) with a 1px key edge (`--lh-key-edge`: dark #8a877c, light #8a867b) and the bottom lip, so they separate from any panel. Hover darkens the face and turns the edge to Ink.
- **Slider:** a well track and a 1.25rem round key thumb with a lip. **Switch:** a well track with an edge; on turns Output Green; a boolean is a row with its label on the left and the switch on the right. **Open list:** a key-coloured sheet with a key edge; the hovered row tints toward Key Yellow.
- **Segmented well:** a short exclusive choice (theme, Bitmap margin and base address) is a well holding one segment per option; the chosen segment rises as a lit key with a lip. Segments wrap to a second row rather than clip.
- **Choice keys:** an exclusive choice with a hint (storage mode) is a stack of 4px keys, each with a small well that lights a yellow lamp when chosen; the chosen key takes an Ink edge and its lip flattens. Controls that depend on a choice appear only when it is chosen.
- **Labels and field groups:** labels sit above text fields in the 0.85rem body weight; a group of fields is a `fieldset` with a bold `legend`. A file picker is an input-shaped well showing the chosen file, with the Import key attached to its right edge.
- Edges are 3:1 or better against the panel in both themes.

### Tabs
- Pill tabs; inactive Muted on transparent, hover ink tint, selected Raised fill with Seam border and accent-text label.

### Navigation
- Header tool pills in a right-aligned outlined capsule (1px Seam, 3px padding); inactive Muted, current page filled Key Yellow.

### Pin table (signature)
- Rows carry a kind colour (orange input, green output, grey internal) on the pin name, bit cell and trace. A single-bit pin is a spring key: a pill with a darker bottom lip that presses in 2px and springs back (320ms overshoot), filled with the pin colour when the value is 1 and hollow when 0. A pin that changed on the last step keeps a small lamp beside the key until the next step.
- The trace fills the rest of the row (minimum 8rem) and shows the last 16 values as a stepped stroke. Every trace shares one time scale with the newest value at the right edge, a faint gridline marks each step, and the newest step is tinted, so values at one moment are compared by reading straight down.
- Column heads are uppercase captions.

### Status line
- Footer on Ground with a 0.6rem dot: green success, grey warning, red error, Muted idle.

## Component Library

Every panel, tab set, accordion, button, text field, select, switch, radio group, segmented well, slider, data table and dialog in the app is a shadcn-style component in `src/ui/` (Radix primitives, Tailwind v4 utilities, `cva` variants, `data-slot` attributes). `src/ui/tailwind.css` loads Tailwind's preflight reset in a layer under Pico, then `src/ui/base.css` with the element defaults Pico used to give (the root type size stepping from 16px to 20px with the viewport, flow margins, code chips, form metrics), and its theme and utilities in layers after Pico, and maps shadcn's token names onto the `--lh-*` tokens (`--color-primary` is Key Yellow, `--color-key` the key face, `--color-well` the sunk well). Existing global rules in `lecture_hall.scss` skip elements carrying `data-slot`, so the two systems do not fight. Selects draw their own list (not the OS list) in the open-list style above. Dialogs (`src/ui/dialog.tsx`) are modal raised keys: a centred key-face card with a 2px key-edge border and a lip shadow, a Raised title bar with an X key, bounded by the viewport and scrolling inside on a phone. Escape and the X key dismiss them; clicking the overlay does not. Buttons (`src/ui/button.tsx`) are the calculator key: lit face, strong edge, inset bottom lip that flattens when pressed; an icon-only button is a round key, 44px on touch, and `aria-current="true"` marks the chosen key in a group. `components` widgets ask for one through a `Btn` wrapper that renders a plain `<button>` until `web` provides the shadcn one; in the same way `Field`, `Choice` and `Range` render a plain `<input>`, `<select>` and range input until `web` provides Input, Select and Slider (the run bar speed control and the memory panel's address field and number format). Data tables (`src/ui/table.tsx`: the Assembler symbol table, and `DiffTable`, which no route renders today) sit on the Panel ground with 1px Seam rules between rows, muted small-caps column headings like the pin table's, values in JetBrains Mono with tabular numerals, the Key Yellow step tint on the current row and a Red tint on a failed cell; `components` reaches them through `useTableParts()`, which renders plain table elements until `web` provides the parts. The pin table, memory grids and Bitmap grid stay custom widgets, styled by plain CSS in `../components/src/public` (or page SCSS) written against the `--lh-*` tokens. Panels (`src/ui/panel.tsx`) are the cards above: a titled panel is a region named by its title, a panel inside a panel becomes a seam-divided section, and content wider than the panel scrolls sideways instead of clipping; the memory, screen and keyboard widgets reach it through a `Panel` wrapper (`../components/src/panel.tsx`) that renders plain divs until `web` provides it. Tabs (`src/ui/tabs.tsx`: the test panel, the compiler's files, the Bitmap Jack and Hack code) are the pill tabs below on a seam, wrapping onto more rows rather than widening the panel. Accordions (`src/ui/accordion.tsx`: CPU registers, chip visualizations, the plain editor's parse error) are keycap bars: each item is a lit key face with a key edge and 6px corners, its title left and a chevron right, several open at once. Tab and accordion content stays mounted while hidden, so an editor keeps its state. Layout outside widgets is Tailwind's flex utilities; widget rows use their own plain CSS. Tooltips (`src/ui/tooltip.tsx`) are inverted keys (Text colour as the ground, page Ground as the text) that open on focus or after 300ms of hover and never on touch; `components` widgets request one through a `Tip` wrapper that defaults to a plain `title` until `web` provides the Radix one. The header, footer and status line still use bare `nav`, `ul` and `li` markup until the last steps, styled by `src/shell/header.scss` and `lecture_hall.scss` rather than by Pico.

## Do's and Don'ts

### Do:
- **Do** spend colour only on meaning: orange input, green output and passed, grey internal, yellow the single primary action and current step, red errors.
- **Do** give every key the same height and the inset bottom lip; keep keys in a group as separate pills with a gap.
- **Do** build depth from Ground, Panel and Raised steps and 1px Seam lines.
- **Do** use Be Vietnam Pro (400, 600, 700, self-hosted) for UI and JetBrains Mono for values; keep Vietnamese diacritics rendering.
- **Do** keep every theme value in `src/ui/tokens.css`, mirrored in `lecture_hall_colors.ts` for Monaco; both themes must move together.
- **Do** use `#6e5a00` (not Key Yellow) for yellow-family text on light ground.

### Don't:
- **Don't** make a control the same tone as its panel: keys are lit, fields are wells, and both carry an edge.
- **Don't** add drop shadows, glows or outer elevation; the key lip is the only shadow.
- **Don't** fill more than one key yellow on a screen or use yellow for decoration.
- **Don't** reuse orange, green, grey or red for anything but their pin or status meaning.
- **Don't** use sharp-cornered keys or fused button groups (the joined 16-bit bus is the one exception).
- **Don't** return to the chalk-on-slate look, Nunito, or a stock grey-with-one-blue IDE palette.
