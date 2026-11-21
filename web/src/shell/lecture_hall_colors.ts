import type * as monaco from "monaco-editor";

type Theme = monaco.editor.IStandaloneThemeData;

/** Shared with `pico/lecture_hall.scss` (see `lecture_hall_colors.test.ts`). */
export const LECTURE_HALL_TOKENS = {
  dark: {
    panel: "#161a1c",
    raised: "#1c2123",
    seam: "#2b3234",
    text: "#f1efe7",
    yellow: "#f6d55c",
  },
  light: {
    panel: "#ffffff",
    raised: "#f3f5f2",
    seam: "#d5dad3",
    text: "#1b2022",
    yellow: "#f2c81d",
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
      { token: "comment", foreground: "8D948C", fontStyle: "italic" },
      { token: "keyword", foreground: "F28DA6" },
      { token: "number", foreground: hex(dark.yellow) },
      { token: "string", foreground: "8FD694" },
      { token: "identifier", foreground: hex(dark.text) },
      { token: "type", foreground: "7FC8F8" },
    ],
    colors: {
      "editor.background": dark.panel,
      "editor.foreground": dark.text,
      "editorLineNumber.foreground": "#6D756F",
      "editorLineNumber.activeForeground": dark.yellow,
      "editor.lineHighlightBackground": dark.raised,
      "editor.selectionBackground": "#3B4A4F",
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
      { token: "comment", foreground: "6A726C", fontStyle: "italic" },
      { token: "keyword", foreground: "B3305A" },
      { token: "number", foreground: "8A6A00" },
      { token: "string", foreground: "2F7A3B" },
      { token: "identifier", foreground: hex(light.text) },
      { token: "type", foreground: "1767A8" },
    ],
    colors: {
      "editor.background": light.panel,
      "editor.foreground": light.text,
      "editorLineNumber.foreground": "#8A918C",
      "editorLineNumber.activeForeground": light.text,
      "editor.lineHighlightBackground": light.raised,
      "editor.selectionBackground": "#CFE3F3",
      "editorCursor.foreground": light.text,
      "editorWidget.background": light.raised,
      "editorWidget.border": light.seam,
      "editorGutter.background": light.panel,
    },
  },
};
