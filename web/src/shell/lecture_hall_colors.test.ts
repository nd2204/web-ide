import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { LECTURE_HALL_TOKENS } from "./lecture_hall_colors";

const scss = readFileSync(
  resolve(process.cwd(), "src/pico/lecture_hall.scss"),
  "utf8",
);

function tokens(theme: "dark" | "light") {
  const block = scss.match(
    new RegExp(`:root\\[data-theme="${theme}"\\] \\{([^}]*)\\}`),
  );
  expect(block, `${theme} token block`).not.toBeNull();
  const out: Record<string, string> = {};
  for (const m of (block?.[1] ?? "").matchAll(
    /--lh-([a-z-]+): (#[0-9a-f]{6});/g,
  )) {
    out[m[1]] = m[2];
  }
  return out;
}

describe("Lecture Hall Monaco colours", () => {
  for (const theme of ["dark", "light"] as const) {
    it(`${theme} editor tokens match the stylesheet`, () => {
      const css = tokens(theme);
      for (const [name, value] of Object.entries(LECTURE_HALL_TOKENS[theme])) {
        expect(css[name], `--lh-${name}`).toBe(value);
      }
    });
  }
});
