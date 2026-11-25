import type * as monaco from "monaco-editor";

type Theme = monaco.editor.IStandaloneThemeData;

/** Shared with `ui/tokens.css` (see `lecture_hall_colors.test.ts`). */
export const LECTURE_HALL_TOKENS = {
  dark: {
    card: "#242421",
    muted: "#2c2c29",
    border: "#3d3d38",
    foreground: "#ece9e1",
    primary: "#f2d21a",
  },
  light: {
    card: "#f6f4ee",
    muted: "#efede6",
    border: "#cfccc3",
    foreground: "#2a2a28",
    primary: "#f2d21a",
  },
} as const;

const hex = (c: string) => c.replace("#", "").toUpperCase();

const dark = LECTURE_HALL_TOKENS.dark;
const light = LECTURE_HALL_TOKENS.light;

export const LECTURE_HALL_MONACO: Record<string, Theme> = {
  "lecture-hall-dark": {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "", foreground: hex(dark.foreground) },
      { token: "comment", foreground: "A19E94", fontStyle: "italic" },
      { token: "keyword", foreground: "F28DA6" },
      { token: "number", foreground: hex(dark.primary) },
      { token: "string", foreground: "86C866" },
      { token: "identifier", foreground: hex(dark.foreground) },
      { token: "type", foreground: "F59A3C" },
    ],
    colors: {
      "editor.background": dark.card,
      "editor.foreground": dark.foreground,
      "editorLineNumber.foreground": "#7A776E",
      "editorLineNumber.activeForeground": dark.primary,
      "editor.lineHighlightBackground": dark.muted,
      "editor.selectionBackground": "#4A4A44",
      "editorCursor.foreground": dark.primary,
      "editorWidget.background": dark.muted,
      "editorWidget.border": dark.border,
      "editorGutter.background": dark.card,
    },
  },
  "lecture-hall-light": {
    base: "vs",
    inherit: true,
    rules: [
      { token: "", foreground: hex(light.foreground) },
      { token: "comment", foreground: "6B685F", fontStyle: "italic" },
      { token: "keyword", foreground: "B3305A" },
      { token: "number", foreground: "8A6A00" },
      { token: "string", foreground: "3F7F26" },
      { token: "identifier", foreground: hex(light.foreground) },
      { token: "type", foreground: "B85F08" },
    ],
    colors: {
      "editor.background": light.card,
      "editor.foreground": light.foreground,
      "editorLineNumber.foreground": "#8A877D",
      "editorLineNumber.activeForeground": light.foreground,
      "editor.lineHighlightBackground": light.muted,
      "editor.selectionBackground": "#F3E3B0",
      "editorCursor.foreground": light.foreground,
      "editorWidget.background": light.muted,
      "editorWidget.border": light.border,
      "editorGutter.background": light.card,
    },
  },
};
