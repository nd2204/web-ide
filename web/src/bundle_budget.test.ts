import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";
import { describe, expect, it } from "vitest";

// Entry bundle budget for the shadcn migration (see web/bundle-budget.json).
// The entry chunks are the files `build/index.html` loads before any route:
// the entry script, its modulepreloads and its stylesheets. Each woff2 font in
// the build root (copied from `public/`) has its own cap in raw bytes, since
// woff2 is already compressed. Locally the test
// skips when `web/build` is missing; in GitHub Actions a missing build fails,
// so a skipped budget can never look like a pass. (npm test scripts set
// CI=true even on a laptop, which is why this checks GITHUB_ACTIONS.)

const BUILD = join(process.cwd(), "build");
const budget = JSON.parse(
  readFileSync(join(process.cwd(), "bundle-budget.json"), "utf8"),
) as {
  entryJsGzipBytes: number;
  entryCssGzipBytes: number;
  fonts: Record<string, number>;
};

const hasBuild = existsSync(join(BUILD, "index.html"));

function entryAssets() {
  const html = readFileSync(join(BUILD, "index.html"), "utf8");
  const files = [
    ...html.matchAll(/(?:src|href)="[^"]*?\/(assets\/[^"]+\.(?:js|css))"/g),
  ].map((m) => m[1]);
  return [...new Set(files)];
}

const gzipped = (file: string) =>
  gzipSync(readFileSync(join(BUILD, file)), { level: 9 }).length;

describe("bundle budget", () => {
  it("has a build to measure in GitHub Actions", () => {
    if (process.env.GITHUB_ACTIONS) {
      expect(hasBuild, "web/build is missing: run `npm run build` first").toBe(
        true,
      );
    }
  });

  it.skipIf(!hasBuild)("keeps gzipped entry JS and CSS under budget", () => {
    const files = entryAssets();
    expect(files.length).toBeGreaterThan(0);
    expect(readdirSync(join(BUILD, "assets")).length).toBeGreaterThan(0);
    const sum = (ext: string) =>
      files.filter((f) => f.endsWith(ext)).reduce((n, f) => n + gzipped(f), 0);
    const js = sum(".js");
    const css = sum(".css");
    expect(js, `entry JS ${js} B gzip`).toBeLessThanOrEqual(
      budget.entryJsGzipBytes,
    );
    expect(css, `entry CSS ${css} B gzip`).toBeLessThanOrEqual(
      budget.entryCssGzipBytes,
    );
  });

  it.skipIf(!hasBuild)("keeps each woff2 font under its cap", () => {
    const fonts = readdirSync(BUILD).filter((f) => f.endsWith(".woff2"));
    expect(fonts).toContain("material_symbols_outlined.woff2");
    for (const font of fonts) {
      const cap = budget.fonts[font];
      expect(cap, `${font} has no cap under "fonts"`).toBeTypeOf("number");
      const bytes = statSync(join(BUILD, font)).size;
      expect(bytes, `${font} ${bytes} B`).toBeLessThanOrEqual(cap);
    }
  });
});
