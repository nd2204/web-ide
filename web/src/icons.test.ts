import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { ICON_NAMES } from "./icons";

// public/material_symbols_outlined.woff2 holds only the glyphs in ICON_NAMES.
// An icon name missing from the font draws as its ligature word ("folder_open"),
// so every name the source uses must be listed. `Icon` in web takes an
// `IconName`, so TypeScript checks web; `components` writes the icon spans by
// hand, so this test reads them.

const WEB = process.cwd(); // vitest runs from the `web` package
const REPO = resolve(WEB, "..");

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (name === "node_modules" || name === "build") return [];
    if (statSync(path).isDirectory()) return walk(path);
    return /\.tsx$/.test(path) && !/\.test\.tsx$/.test(path) ? [path] : [];
  });
}

const SPAN = /className="material-symbols-outlined"[^>]*>([\s\S]*?)<\/span>/g;

/** Icon names written inside `material-symbols-outlined` spans. */
function spanNames(source: string): string[] {
  return [...source.matchAll(SPAN)].flatMap(([, body]) => {
    const text = body.trim();
    if (!text.startsWith("{")) return [text];
    // An expression such as {running ? "pause" : "fast_forward"}.
    return [...text.matchAll(/"([a-z0-9_]+)"/g)].map((m) => m[1]);
  });
}

describe("Material Symbols subset", () => {
  it("lists each icon once, in the order the Google Fonts API needs", () => {
    expect([...ICON_NAMES]).toEqual([...new Set(ICON_NAMES)].sort());
  });

  it("covers every icon written in a span", () => {
    const sources = [
      ...walk(join(REPO, "components", "src")),
      ...walk(join(WEB, "src")),
    ];
    const used = sources.flatMap((path) =>
      spanNames(readFileSync(path, "utf8")).map((name) => ({ path, name })),
    );
    // The memory panel and run bar draw their icons this way.
    expect(used.map(({ name }) => name)).toEqual(
      expect.arrayContaining(["folder_open", "pause", "fast_forward"]),
    );
    const missing = used.filter(
      ({ name }) => !(ICON_NAMES as readonly string[]).includes(name),
    );
    expect(
      missing,
      "add these to ICON_NAMES in web/src/icons.ts, then run `npm run icons -w web`",
    ).toEqual([]);
  });

  it("ships the font in public/", () => {
    expect(
      existsSync(join(WEB, "public", "material_symbols_outlined.woff2")),
    ).toBe(true);
  });
});
