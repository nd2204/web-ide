import { expect, test } from "@playwright/test";

// Material Symbols is self-hosted (web/public/material_symbols_outlined.woff2)
// and holds only the icons in web/src/icons.ts. An icon whose glyph is missing
// draws as its ligature word ("folder_open"), several em wide instead of one.

test(
  "icons draw from the self-hosted font",
  { tag: "@smoke" },
  async ({ page }) => {
    const google: string[] = [];
    page.on("request", (request) => {
      if (/fonts\.(googleapis|gstatic)\.com/.test(request.url())) {
        google.push(request.url());
      }
    });

    await page.goto("chip");
    await expect(page.locator(".ChipPage")).toBeVisible();
    await page.evaluate(() => document.fonts.ready);

    const icons = await page
      .locator(".material-symbols-outlined:visible")
      .evaluateAll((spans) =>
        spans.map((span) => ({
          name: span.textContent?.trim(),
          width: span.getBoundingClientRect().width,
          size: Number.parseFloat(getComputedStyle(span).fontSize),
        })),
      );
    expect(icons.length).toBeGreaterThan(5);
    const words = icons.filter(({ width, size }) => width > size * 1.25);
    expect(words, "icons drawn as words").toEqual([]);
    expect(google, "requests to Google Fonts").toEqual([]);
  },
);
