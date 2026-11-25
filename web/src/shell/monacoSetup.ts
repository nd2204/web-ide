// Use the bundled monaco-editor instead of @monaco-editor/react's default
// jsdelivr CDN copy. The bundle is same-origin and precached by the service
// worker, so the editor works offline, and the app no longer loads Monaco twice.
import { loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import EditorWorker from "monaco-editor/editor/editor.worker.js?worker";
import "./monacoReset.scss";

// The app only uses Monarch languages, which need the generic editor worker.
self.MonacoEnvironment = {
  getWorker: () => new EditorWorker(),
};

loader.config({ monaco });

import type * as monacoT from "monaco-editor";
import { LECTURE_HALL_MONACO } from "./lecture_hall_colors";

// Lecture Hall editor themes: slate with chalk colours in dark, whiteboard
// with marker inks in light. Colours live in `lecture_hall_colors.ts`, which a
// test keeps in step with `ui/tokens.css`.
// Defined on the Monaco instance the editor component hands to `beforeMount`,
// so the theme is registered on the same module the editor renders with.
export function defineLectureHallThemes(m: typeof monacoT) {
  for (const [id, theme] of Object.entries(LECTURE_HALL_MONACO)) {
    m.editor.defineTheme(id, theme);
  }
}
