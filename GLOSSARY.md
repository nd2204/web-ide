# Nand2Tetris Web IDE

A browser IDE for the nand2tetris course. This glossary covers the vocabulary of its UI layer.

## Language

**Primitive**:
A generic, domain-free UI control (button, dialog, select, switch, slider) built on shadcn, Radix and Tailwind. Primitives live in `web/src/ui`.
_Avoid_: UI component, base component

**Widget**:
A domain component that renders simulator state (pin table, memory grid, screen, keyboard, register, ALU, run bar, diff table). Widgets live in `components/` and know nothing of Tailwind, Radix or primitives.
_Avoid_: Chip component, shared component

**Chrome**:
The generic controls around a widget's content (its buttons, inputs and toolbars), as opposed to the content itself. Chrome is built from primitives; content stays custom.

**Token**:
A named design value (colour, radius, spacing) that both primitives and widgets read. Tokens carry shadcn names as Tailwind theme variables (`--color-primary`, `--radius-md`) and live in `web/src/ui/tokens.css`.
_Avoid_: Variable, theme value

**Braun**:
The app's visual world: matte warm-grey panels, tactile keys, one colour per meaning. The migration to shadcn keeps it unchanged.
_Avoid_: Lecture Hall (the old name; it survives only in `lecture_hall_colors.ts` and the Monaco theme names)

**Overlay**:
A control that appears above the page and is dismissed on demand: a tooltip, dialog or menu. Overlays are primitives.
_Avoid_: Popup, modal (a modal is one kind of dialog)

**Coarse pointer**:
An imprecise input device, in practice a finger. Every primitive guarantees a 44px minimum target for it; desktop density is unchanged.
_Avoid_: Mobile, touch device

**Phone width**:
The narrow-viewport range where chrome adapts (the header title truncates and its tools scroll). Page layouts adapt at their own content-driven widths, not at this one.
_Avoid_: Mobile breakpoint
