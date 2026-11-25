import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { LECTURE_HALL_TOKENS } from "./lecture_hall_colors";

const tokensCss = readFileSync(
  resolve(process.cwd(), "src/ui/tokens.css"),
  "utf8",
);

// Light is the default theme in `@theme static`; dark overrides it.
const BLOCKS = {
  light: /@theme static \{([^}]*)\}/,
  dark: /:root\[data-theme="dark"\] \{([^}]*)\}/,
};

function colors(theme: "dark" | "light") {
  const block = tokensCss.match(BLOCKS[theme]);
  expect(block, `${theme} token block`).not.toBeNull();
  const out: Record<string, string> = {};
  for (const m of (block?.[1] ?? "").matchAll(/--color-([a-z-]+): ([^;]+);/g)) {
    out[m[1]] = m[2];
  }
  return out;
}

describe("Lecture Hall Monaco colours", () => {
  for (const theme of ["dark", "light"] as const) {
    it(`${theme} editor tokens match the stylesheet`, () => {
      const css = colors(theme);
      for (const [name, value] of Object.entries(LECTURE_HALL_TOKENS[theme])) {
        expect(css[name], `--color-${name}`).toBe(value);
      }
    });
  }

  it("gives the dark theme a value for every colour", () => {
    expect(Object.keys(colors("dark")).sort()).toEqual(
      Object.keys(colors("light")).sort(),
    );
  });
});
