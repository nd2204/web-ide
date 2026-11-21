import { expect, type Page, test } from "@playwright/test";

// Screenshot baselines for the shadcn migration (Linux and Chromium only; see
// DEVELOPMENT.md "Visual baselines"). The `visual` Playwright project is
// enabled only in GitHub Actions and in the Docker regeneration script.
// Every migration step must leave these unchanged, or update them on purpose.

// Selectors that exist only once the lazy route (and its editor) has rendered.
const EDITOR = ".monaco-editor .view-lines";
const ROUTES = {
  chip: [".ChipPage", EDITOR],
  cpu: [".CpuPage"],
  asm: [".AsmPage", EDITOR],
  vm: [".VmPage", EDITOR],
  compiler: [".CompilerPage"],
  bitmap: [".BitmapPage"],
  about: ["text=Nand to Tetris IDE Online"],
} as const;

const VIEWPORTS = {
  desktop: { viewport: { width: 1280, height: 800 } },
  phone: {
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  },
} as const;

// The screenshot must be stable twice in a row; allow for slow emulated CI.
const SCREENSHOT = { animations: "disabled", caret: "hide", timeout: 20_000 } as const;

// With the icon font blocked, the ligature text ("folder_open") would draw over
// neighbouring controls. Replace each glyph with a 1em box so layout stays
// close to the real icons. Remove this when the font is self-hosted.
const ICON_BOX = `.material-symbols-outlined {
  display: inline-block; width: 1em; height: 1em; overflow: hidden;
  text-indent: -100em; background: currentColor; opacity: 0.4;
}`;

async function settle(page: Page, ready: readonly string[]) {
  for (const selector of ready) {
    await expect(page.locator(selector).first()).toBeVisible();
  }
  await expect(page.getByText("Loading...")).toHaveCount(0);
  await page.waitForLoadState("networkidle");
  await page.addStyleTag({ content: ICON_BOX });
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator("#root")).toBeVisible();
}

function masks(page: Page) {
  return [
    // Monaco's blinking cursor and the selection-highlight layers.
    page.locator(".monaco-editor .cursors-layer"),
    // The build version differs on every release.
    page.locator("code", { hasText: /^\d{4}\.\d+\.\d+$/ }),
  ];
}

for (const [name, context] of Object.entries(VIEWPORTS)) {
  test.describe(`${name} viewport`, { tag: "@visual" }, () => {
    test.use(context);

    test.beforeEach(async ({ page }) => {
      // The icon font loads from Google Fonts until the self-hosting step.
      // Blocking it keeps the baseline independent of the network; icons draw
      // as their ligature text. Drop this route when the font is self-hosted.
      await page.route(/fonts\.(googleapis|gstatic)\.com/, (route) =>
        route.abort(),
      );
    });

    for (const [route, ready] of Object.entries(ROUTES)) {
      test(`${route} page`, async ({ page }) => {
        await page.goto(route);
        await settle(page, ready);
        await expect(page).toHaveScreenshot(`${route}-${name}.png`, {
          ...SCREENSHOT,
          mask: masks(page),
        });
      });
    }

    test("settings dialog", async ({ page }) => {
      await page.goto("chip");
      await settle(page, ROUTES.chip);
      await page.locator('li[data-tooltip="Settings"]').click();
      await expect(
        page.locator("dialog[open] article.settings-dialog"),
      ).toBeVisible();
      await expect(page).toHaveScreenshot(`settings-dialog-${name}.png`, {
        ...SCREENSHOT,
        mask: masks(page),
      });
    });
  });
}
