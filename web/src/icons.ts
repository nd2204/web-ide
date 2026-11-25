// The Material Symbols Outlined glyphs the app draws, sorted. The self-hosted
// font (public/material_symbols_outlined.woff2) holds only these, at the one
// style the app uses (FILL 0, wght 400, GRAD 0, opsz 24). A name missing here
// draws as its ligature word, so after adding one run `npm run icons -w web`
// to download the font again. src/icons.test.ts checks the list.
export const ICON_NAMES = [
  "bug_report",
  "code",
  "computer",
  "delete_sweep",
  "developer_board",
  "download",
  "draft",
  "fast_forward",
  "folder",
  "folder_open",
  "function",
  "grid_on",
  "info",
  "list_alt",
  "memory",
  "menu_book",
  "move_down",
  "pause",
  "settings",
  "skip_next",
  "skip_previous",
] as const;

export type IconName = (typeof ICON_NAMES)[number];
