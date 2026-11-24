import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { describe, expect, it } from "vitest";

// Guard for the Pico to shadcn migration (see the "Styling and UI" section of
// DEVELOPMENT.md). Each rule counts today's violations and fails when a count
// goes UP. Every migration step lowers the numbers below as it deletes Pico
// rules; the guard is deleted together with `web/src/pico/` in the last step.
// A number may only be lowered, never raised.

const WEB = process.cwd(); // vitest runs from the `web` package
const REPO = resolve(WEB, "..");

function walk(dir: string, exts: string[], skip: RegExp[] = []): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (name === "node_modules" || name === "build" || name === "locales") {
      return [];
    }
    if (skip.some((re) => re.test(path))) return [];
    if (statSync(path).isDirectory()) return walk(path, exts, skip);
    return exts.some((ext) => path.endsWith(ext)) ? [path] : [];
  });
}

const read = (path: string) => readFileSync(path, "utf8");
const rel = (path: string) => relative(REPO, path);

const SOURCES = [
  ...walk(join(WEB, "src"), [".ts", ".tsx", ".scss", ".css"]),
  ...walk(join(REPO, "components", "src"), [".ts", ".tsx", ".scss", ".css"]),
].filter((path) => !/\.test\.tsx?$/.test(path));

const strip = (text: string) =>
  text.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

describe("shadcn migration guard", () => {
  // (a) Pico is imported from outside `web/src/pico`.
  it("limits imports of pico/", () => {
    const CEILING = 16;
    const hits = SOURCES.filter((path) => !path.includes("/src/pico/")).flatMap(
      (path) =>
        strip(read(path))
          .split("\n")
          .filter((line) =>
            /(import|@use|@import|from)\b.*["']\S*pico\//.test(line),
          )
          .map((line) => `${rel(path)}: ${line.trim()}`),
    );
    expect(hits.length, hits.join("\n")).toBeLessThanOrEqual(CEILING);
  });

  // (b) Type selectors in lecture_hall.scss style bare elements (`button`,
  // `input`, ...). Primitives own their styling through classes instead.
  it("limits type selectors in lecture_hall.scss", () => {
    const CEILING: Record<string, number> = {
      a: 3,
      article: 9,
      button: 19,
      dd: 3,
      details: 6,
      dialog: 0,
      div: 3,
      dl: 3,
      dt: 3,
      fieldset: 11,
      footer: 3,
      h2: 1,
      header: 7,
      input: 7,
      label: 5,
      li: 12,
      main: 8,
      nav: 4,
      p: 1,
      section: 3,
      select: 3,
      summary: 4,
      table: 5,
      tbody: 1,
      td: 4,
      textarea: 2,
      th: 2,
      tr: 13,
      ul: 9,
    };
    const TAGS =
      "button|input|select|textarea|dialog|table|thead|tbody|tr|th|td|details|summary|fieldset|legend|label|article|header|footer|main|nav|a|h[1-6]|p|ul|li|code|kbd|pre|hr|progress|mark|form|section|dl|dt|dd|span|div";
    const selector = new RegExp(
      `(?:^|[\\s,>+~(])(${TAGS})(?=[\\s,{.:\\[>+~)#]|$)`,
      "g",
    );
    const counts: Record<string, number> = {};
    for (const line of strip(
      read(join(WEB, "src/pico/lecture_hall.scss")),
    ).split("\n")) {
      const text = line.trim();
      if (!(text.endsWith("{") || text.endsWith(",")) || text.startsWith("@"))
        continue;
      for (const m of text.matchAll(selector))
        counts[m[1]] = (counts[m[1]] ?? 0) + 1;
    }
    if (process.env.GUARD_PRINT) console.log(JSON.stringify(counts));
    for (const [tag, count] of Object.entries(counts)) {
      expect(
        count,
        `type selector \`${tag}\` in lecture_hall.scss`,
      ).toBeLessThanOrEqual(CEILING[tag] ?? 0);
    }
  });

  // (c) Custom properties that only Pico defines.
  it("limits Pico-only CSS variables", () => {
    const CEILING: Record<string, number> = {
      "--accordion-active-summary-color": 1,
      "--accordion-close-summary-color": 1,
      "--accordion-open-summary-color": 1,
      "--block-spacing-horizontal": 5,
      "--block-spacing-vertical": 3,
      "--border-radius": 4,
      "--border-width": 5,
      "--card-background-color": 3,
      "--card-border-color": 5,
      "--card-sectionning-background-color": 1,
      "--code-background-color": 1,
      "--color": 2,
      "--font-weight": 1,
      "--form-element-disabled-background-color": 1,
      "--form-element-disabled-opacity": 1,
      "--form-element-spacing-horizontal": 4,
      "--form-element-spacing-vertical": 4,
      "--icon-chevron": 1,
      "--line-height": 2,
      "--mark-background-color": 7,
      "--muted-border-color": 1,
      "--muted-color": 1,
      "--nav-element-spacing-horizontal": 1,
      "--nav-link-spacing-horizontal": 1,
      "--outline-width": 1,
      "--primary": 5,
      "--primary-focus": 1,
      "--primary-inverse": 4,
      "--secondary": 1,
      "--secondary-hover": 1,
      "--secondary-inverse": 1,
      "--spacing": 27,
      "--table-border-color": 1,
      "--table-row-stripped-background-color": 1,
      "--transition": 2,
    };
    const pico = read(join(WEB, "public/pico.min.css"));
    const picoVars = new Set(
      [...pico.matchAll(/(--[a-z0-9-]+)\s*:/g)]
        .map((m) => m[1])
        .filter((name) => !name.startsWith("--lh-")),
    );
    const counts: Record<string, number> = {};
    for (const path of SOURCES) {
      for (const m of strip(read(path)).matchAll(/var\((--[a-z0-9-]+)/g)) {
        if (picoVars.has(m[1])) counts[m[1]] = (counts[m[1]] ?? 0) + 1;
      }
    }
    if (process.env.GUARD_PRINT) console.log(JSON.stringify(counts));
    for (const [name, count] of Object.entries(counts)) {
      expect(count, `var(${name})`).toBeLessThanOrEqual(CEILING[name] ?? 0);
    }
  });

  // (d) Our flex helpers were renamed to `stack` so they cannot collide with
  // Tailwind's `flex`, `row`, `justify-*` and `flex-<n>` classes.
  it("has no .flex or .row selectors or class names", () => {
    const BAD_SELECTOR =
      /\.(flex(-[0-9])?|row|wrap|justify-[a-z]+|align-[a-z]+)(?![\w-])/;
    const BAD_CLASS =
      /class(Name)?=["'`{][^"'`]*(?<![\w-])(flex(-[0-9])?|row|wrap|justify-[a-z]+|align-[a-z]+)(?![\w-])/;
    const hits = SOURCES.filter((path) => !path.includes("/src/ui/")).flatMap(
      (path) =>
        strip(read(path))
          .split("\n")
          .filter((line) =>
            path.endsWith(".scss") || path.endsWith(".css")
              ? BAD_SELECTOR.test(line)
              : BAD_CLASS.test(line),
          )
          .map((line) => `${rel(path)}: ${line.trim()}`),
    );
    expect(hits).toEqual([]);
  });
});

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
  const files = walk(
    join(WEB, "src/ui"),
    [".tsx", ".ts"],
    [/prototype-/],
  ).filter((path) => !/\.test\.tsx?$/.test(path));

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
