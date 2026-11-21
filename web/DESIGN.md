---
name: Nand2Tetris Web IDE (Lecture Hall)
description: Chalk on slate in dark, marker on whiteboard in light. Rounded panels where ink colour says what a thing is.
colors:
  ground: "#0e1112"
  panel: "#161a1c"
  raised: "#1c2123"
  seam: "#2b3234"
  chalk: "#f1efe7"
  chalk-muted: "#a3a99f"
  chalk-yellow: "#f6d55c"
  chalk-blue: "#7fc8f8"
  chalk-green: "#8fd694"
  chalk-amber: "#f0a868"
  chalk-red: "#ff8a80"
  chalk-pink: "#f28da6"
  on-yellow: "#14171a"
  whiteboard-ground: "#e9ece8"
  whiteboard-panel: "#ffffff"
  whiteboard-raised: "#f3f5f2"
  whiteboard-seam: "#d5dad3"
  marker-black: "#1b2022"
  marker-muted: "#566059"
  marker-yellow: "#f2c81d"
  marker-blue: "#1767a8"
  marker-green: "#2a7a37"
  marker-amber: "#a85a10"
  marker-red: "#b3261e"
  marker-pink: "#b3305a"
  marker-accent-text: "#7a5b00"
typography:
  body:
    fontFamily: "Nunito, system-ui, -apple-system, 'Segoe UI', Roboto, 'Noto Sans', sans-serif"
    fontWeight: 400
  title:
    fontFamily: "Nunito, system-ui, sans-serif"
    fontWeight: 800
    letterSpacing: "0.01em"
  label:
    fontFamily: "Nunito, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 800
    letterSpacing: "0.08em"
  button:
    fontFamily: "Nunito, system-ui, sans-serif"
    fontWeight: 700
  tab:
    fontFamily: "Nunito, system-ui, sans-serif"
    fontSize: "0.9rem"
    fontWeight: 700
  mono:
    fontFamily: "JetBrains Mono, source-code-pro, Menlo, Monaco, monospace"
    fontSize: "0.9rem"
    fontWeight: 400
  bus-cell:
    fontFamily: "JetBrains Mono, source-code-pro, Menlo, Monaco, monospace"
    fontSize: "0.8rem"
    fontWeight: 700
rounded:
  sm: "10px"
  md: "12px"
  lg: "16px"
  pill: "999px"
spacing:
  gap: "0.6rem"
  bench-gap: "8px"
  panel-pad: "8px"
  touch-target: "44px"
  dialog-pad: "1.25rem"
components:
  button-quiet:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.chalk}"
    rounded: "{rounded.pill}"
  button-primary:
    backgroundColor: "{colors.chalk-yellow}"
    textColor: "{colors.on-yellow}"
    rounded: "{rounded.pill}"
  nav-pill-current:
    backgroundColor: "{colors.chalk-yellow}"
    textColor: "{colors.on-yellow}"
    rounded: "{rounded.pill}"
    padding: "0.35rem 0.6rem"
  panel:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.chalk}"
    rounded: "{rounded.lg}"
  nav-capsule:
    backgroundColor: "{colors.ground}"
    textColor: "{colors.chalk-muted}"
    rounded: "{rounded.pill}"
    padding: "3px"
  panel-bench:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.chalk}"
    rounded: "{rounded.md}"
  panel-titlebar:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.chalk}"
  input:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.chalk}"
    rounded: "{rounded.sm}"
  tab-selected:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.chalk-yellow}"
    rounded: "{rounded.pill}"
---

# Design System: Nand2Tetris Web IDE (Lecture Hall)

## Overview

**Creative North Star: "The Lecture Hall"**

Slate-black rounded panels where chalk colour says what a thing is. Dark is the blackboard; light is the same room with the whiteboard, using darker marker inks of the same hues. The world lends only palette, type and one signature move; it is not a themed costume. Layout, workflow and keyboard behaviour of the underlying tools are unchanged.

The screen is calm and dense: panels separated by a 0.6rem gap and a 1px seam, no shadows, no hard frames. Colour is reserved for meaning. A student should see at once which pin is input, output or internal, which changed on the last step, and whether the test passed.

The Chip page is the reference surface: it runs as a dense bench (8px gap, slim title bars, 12px panel corners). Currently built for the shell and the Hardware Simulator only. Other tools inherit the shell tokens but have not been reviewed in this system.

**Key Characteristics:**
- Panels are tonal layers (ground, panel, raised) divided by seams, not by shadow.
- Pills for every control: the header tool capsule, buttons, tabs, pin bit cells.
- Chalk colour is semantic: yellow = primary action and current step, blue = input, green = output and passed, amber = internal and warnings, red = errors, pink = HDL keywords.
- Two themes, one structure: every colour role has a chalk value (dark) and a marker value (light).

## Colors

A slate ground with a warm chalk-white text and five semantic chalk inks. Light theme swaps to a pale green-grey ground with deeper marker inks so contrast holds on white.

### Primary
- **Chalk Yellow** (#f6d55c dark, #f2c81d light): the one primary action per screen (class `lh-primary`), the current nav pill, the current test step underline, the cursor and active line number in Monaco, focus ring in dark.

### Secondary (semantic inks)
- **Input Blue** (#7fc8f8 / #1767a8): input pins; Monaco types. Focus ring in light.
- **Output Green** (#8fd694 / #2a7a37): output pins, passed, switch on, Monaco strings, correct diff cells.
- **Internal Amber** (#f0a868 / #a85a10): internal pins and warning status.
- **Error Red** (#ff8a80 / #b3261e): errors, error status dot, diff error cells.
- **Keyword Pink** (#f28da6 / #b3305a): HDL keywords in Monaco only.

### Neutral
- **Slate Ground** (#0e1112) / **Whiteboard Ground** (#e9ece8): page, header, footer.
- **Slate Panel** (#161a1c) / **White** (#ffffff): panels, dialogs, editor background.
- **Raised Slate** (#1c2123) / **Pale Board** (#f3f5f2): title bars, inputs, quiet buttons, selected tabs.
- **Seam** (#2b3234 / #d5dad3): every 1px border and divider.
- **Chalk** (#f1efe7) / **Marker Black** (#1b2022): text. **Muted** (#a3a99f / #566059): secondary text, pin names, unselected tabs.
- **Marker Gold Text** (#7a5b00, light only; yellow in dark): accent text such as selected tab labels and links, because yellow fill is unreadable as text on white.

### Named Rules
**The Chalk Means Something Rule.** A chalk ink appears only where it names a kind or a state. No decorative use of yellow, blue, green, amber, red or pink.
**The One Yellow Rule.** One yellow-filled primary button per screen, plus the current nav pill and current step. Everything else is a quiet pill.
**The Same Hue, Darker Ink Rule.** Light theme reuses each role's hue at a darker value; it never introduces new roles.

## Typography

**Display/Body Font:** Nunito (self-hosted, weights 400, 700, 800), fallback system-ui stack.
**Mono Font:** JetBrains Mono (self-hosted), used for pin names, bit cells and Monaco; Monaco at 15px (`--font-size-monospace`). Monaco colours live in one TypeScript source, `src/shell/lecture_hall_colors.ts`, whose shared tokens a test keeps equal to the stylesheet.

**Character:** a round-terminal humanist sans for the interface against a tabular mono for values; friendly but exact.

### Hierarchy
- **Title** (800, inherited size): product name, panel titles, dialog headers, selected tab.
- **Button / nav** (700): all pills.
- **Body** (400): form text, settings values.
- **Tab** (700, 0.9rem; selected 800): panel tab pills.
- **Label** (800, 0.75rem, 0.08em tracking, uppercase): pin table column headers only. Pin-control pills are also 0.75rem.
- **Mono value** (400 in pin names at 0.9rem; 700 in bit cells at 0.9rem, 0.8rem on bus cells so 16 fit): pin names and 0/1 cells.
- **Icon** (1.15rem Material Symbols in grouped buttons, 20px in the header capsule).

### Named Rules
**The Weight Does the Hierarchy Rule.** Size stays near body; hierarchy comes from weight steps 400, 700, 800 and from colour.

## Layout

Top bar with the product name left and the tools as one right-aligned capsule (see Navigation); the capsule scrolls horizontally on narrow screens and the title stays on one line. Main area is a grid of panels with a 0.6rem gap and 8px outer padding; the Chip page tightens the gap to 8px. On coarse pointers (`pointer: coarse`) header tools, grouped buttons, tabs and pin bit cells reach 44px minimum height (header tools 44px square). Footer status line spans full width. Dialogs use 0.85rem 1.25rem header/footer padding and 1.25rem body padding; the settings dialog uses a 12rem label column and 1fr value column with 0.75rem / 1.5rem gaps.

## Elevation & Depth

Flat. Depth comes from tonal layering (ground, panel, raised) and 1px seams. No box-shadows are used. Interaction feedback is a hover tint (`rgb(241 239 231 / 8%)` dark, `rgb(27 32 34 / 7%)` light) and a 0.97 scale on press; under `prefers-reduced-motion` the transitions and the press scale are removed and colours snap.

### Named Rules
**The Seam Not Shadow Rule.** Separate surfaces with a 1px seam and a tone step; never with a shadow.

## Shapes

Panels and dialogs 16px radius, Chip page panels 12px; inputs, details summaries and the Pico default 10px; every button, header tool, the tool capsule, tab and bit cell is a full pill (999px). Panels clip their overflow so title bars follow the rounded corner. Status dot is a 0.6rem circle.

## Components

### Buttons
- **Quiet pill (default):** raised fill, 1px seam border, chalk text, weight 700. Hover tints with border moving to muted. Disabled goes transparent at 70% opacity.
- **Primary (`lh-primary`):** chalk yellow fill and border, dark text; hover brightens 8%.
- **Grouped buttons:** buttons in a `fieldset[role=group]` (Eval/Reset/Clock, file, run bar) have 0.25rem 0.8rem padding, 1.9rem min height, centred labels; text buttons size to their label.
- **Run bar icons:** drawn SVG paths (step-to-end, step, run or pause, reset, mapped by position) as 1.05rem background images in chalk or marker black, 2rem min width. Other grouped icon buttons (file, download) use Material Symbols at 1.15rem, 2.25rem min width.
- **Focus:** 2px outline, 2px offset, yellow in dark and blue in light.

### Navigation
Header tools are one right-aligned capsule (`role="toolbar"`, 1px seam outline, transparent fill, 3px padding, 2px gap, full pill). Each tool is a keyboard-reachable item (`tabIndex=0`, Enter or Space activates, aria-label from the tooltip) drawn as a 20px Material icon with 0.2rem 0.4rem padding: muted, hover tint, current page filled yellow with dark text. 120ms ease on colour and background.

### Panels and tabs
Panel: panel fill, seam border, 16px radius (12px on the Chip page), raised title bar (0.3rem 0.75rem padding; 0.1rem 0.6rem on the Chip page) and footer. Tabs are pills over a seam baseline; selected tab is raised fill, seam border, accent text and weight 800.

### Inputs / Fields
Raised fill, 1px seam, 10px radius, chalk text, muted placeholder. Focus border takes the focus ink. Switches are pill-shaped and turn green when on.

### Pin table (signature)
Each row is `data-kind` input, output or internal, setting `--pin` to blue, green or amber. Pin name takes the kind colour. Bit cells are hollow pills with a 1.5px kind-coloured border and mono text; hover fills 20% of the kind colour. There is no changed-pin marker. An optional round-capped 2px polyline trace (`.pin-trace`, opt-in) shows recent values in the kind colour.

### Status line
Ground fill, chalk text, 0.6rem dot: muted idle, green success, amber warning, red error.

### Monaco themes
`lecture-hall-dark` and `lecture-hall-light` come from `lecture_hall_colors.ts` and mirror the tokens: panel/white background, raised line highlight, yellow cursor (dark) or black (light), keywords pink, numbers yellow or gold, strings green, types blue, comments italic muted.

### Banner and settings dialog
Tracking banner: panel fill, top seam, quiet pills with a yellow Accept. Settings: storage options are raised cards with seam and 10px radius; full-width pill buttons.

## Do's and Don'ts

### Do:
- **Do** express meaning with the chalk roles: input blue, output green, internal amber, error red, primary yellow.
- **Do** define any new colour in both themes, with the darker marker value for light.
- **Do** make controls pills (999px) and containers 16px (12px for Chip page panels, inner fields 10px).
- **Do** give coarse-pointer targets 44px.
- **Do** separate with a 1px seam and a tone step.
- **Do** keep the 120ms ease-out (`cubic-bezier(0.16, 1, 0.3, 1)`) for state change, and disable it under `prefers-reduced-motion`.

### Don't:
- **Don't** use chalk colour decoratively or add a second filled yellow button to a screen.
- **Don't** add box-shadows or hard frames.
- **Don't** put yellow text on the light theme; use the gold accent text value.
- **Don't** use emoji or glyph characters as icons; draw SVG or use Material Symbols.
- **Don't** hard-code hex values in components; use the `--lh-*` tokens (Monaco themes are the one place colours are duplicated; `lecture_hall_colors.ts` is their single source and its test fails if the shared tokens drift from the stylesheet).
