import type * as monaco from "monaco-editor";

type Theme = monaco.editor.IStandaloneThemeData;

/** Shared with `pico/lecture_hall.scss` (see `lecture_hall_colors.test.ts`). */
export const LECTURE_HALL_TOKENS = {
  dark: {
    panel: "#242421",
    raised: "#2c2c29",
    seam: "#3d3d38",
    text: "#ece9e1",
    yellow: "#f2d21a",
  },
  light: {
    panel: "#f6f4ee",
    raised: "#efede6",
    seam: "#cfccc3",
    text: "#2a2a28",
    yellow: "#f2d21a",
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
      { token: "", foreground: hex(dark.text) },
      { token: "comment", foreground: "A19E94", fontStyle: "italic" },
      { token: "keyword", foreground: "F28DA6" },
      { token: "number", foreground: hex(dark.yellow) },
      { token: "string", foreground: "86C866" },
      { token: "identifier", foreground: hex(dark.text) },
      { token: "type", foreground: "F59A3C" },
    ],
    colors: {
      "editor.background": dark.panel,
      "editor.foreground": dark.text,
      "editorLineNumber.foreground": "#7A776E",
      "editorLineNumber.activeForeground": dark.yellow,
      "editor.lineHighlightBackground": dark.raised,
      "editor.selectionBackground": "#4A4A44",
      "editorCursor.foreground": dark.yellow,
      "editorWidget.background": dark.raised,
      "editorWidget.border": dark.seam,
      "editorGutter.background": dark.panel,
    },
  },
  "lecture-hall-light": {
    base: "vs",
    inherit: true,
    rules: [
      { token: "", foreground: hex(light.text) },
      { token: "comment", foreground: "6B685F", fontStyle: "italic" },
      { token: "keyword", foreground: "B3305A" },
      { token: "number", foreground: "8A6A00" },
      { token: "string", foreground: "3F7F26" },
      { token: "identifier", foreground: hex(light.text) },
      { token: "type", foreground: "B85F08" },
    ],
    colors: {
      "editor.background": light.panel,
      "editor.foreground": light.text,
      "editorLineNumber.foreground": "#8A877D",
      "editorLineNumber.activeForeground": light.text,
      "editor.lineHighlightBackground": light.raised,
      "editor.selectionBackground": "#F3E3B0",
      "editorCursor.foreground": light.text,
      "editorWidget.background": light.raised,
      "editorWidget.border": light.seam,
      "editorGutter.background": light.panel,
    },
  },
};
