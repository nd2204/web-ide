import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { describe, expect, it } from "vitest";

// Rules for the shared UI (see the "Styling and UI" and "Internationalization"
// sections of DEVELOPMENT.md): `components` stays free of Radix, Tailwind and
// web/src/ui, and the primitives in web/src/ui stay free of Lingui and English.

const WEB = process.cwd(); // vitest runs from the `web` package
const REPO = resolve(WEB, "..");

function walk(dir: string, exts: string[]): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (name === "node_modules" || name === "build" || name === "locales") {
      return [];
    }
    if (statSync(path).isDirectory()) return walk(path, exts);
    return exts.some((ext) => path.endsWith(ext)) ? [path] : [];
  });
}

const read = (path: string) => readFileSync(path, "utf8");
const rel = (path: string) => relative(REPO, path);

const strip = (text: string) =>
  text.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

describe("components package", () => {
  it("imports no Radix, Tailwind or web/src/ui", () => {
    const hits = walk(join(REPO, "components", "src"), [
      ".ts",
      ".tsx",
      ".css",
      ".scss",
    ])
      .filter((path) =>
        /(@radix-ui|tailwind|@\/ui|\/ui\/)/.test(strip(read(path))),
      )
      .map(rel);
    expect(hits).toEqual([]);
  });
});

// Primitives in web/src/ui must not depend on Lingui or hold English text:
// built-in strings are required props (see the i18n decision).
describe("web/src/ui primitives", () => {
  const files = walk(join(WEB, "src/ui"), [".tsx", ".ts"]).filter(
    (path) => !/\.test\.tsx?$/.test(path),
  );

  it("do not import Lingui", () => {
    const hits = files.filter((path) => /@lingui\//.test(read(path))).map(rel);
    expect(hits).toEqual([]);
  });

  it("hold no literal aria-label, placeholder, title or JSX text", () => {
    const patterns = [
      /\b(aria-label|placeholder|title)=["'][^"']+["']/,
      />\s*[A-Za-z][^<>{}]*</,
    ];
    const hits = files.flatMap((path) =>
      strip(read(path))
        .split("\n")
        .filter((line) => patterns.some((re) => re.test(line)))
        .map((line) => `${rel(path)}: ${line.trim()}`),
    );
    expect(hits).toEqual([]);
  });
});
