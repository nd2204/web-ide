import { expect, type Page, test } from "@playwright/test";
import { dialog, headerButton } from "../../src/helpers";

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

// Monaco reveals its scrollbar sliders for about 500ms after any resize of the
// editor, such as a web font swapping in and re-flowing a panel header. Baselines
// never show them, so hide them instead of racing the fade.
const MONACO_SLIDERS = `.monaco-scrollable-element > .scrollbar > .slider {
  visibility: hidden !important;
}`;

async function settle(page: Page, ready: readonly string[]) {
  for (const selector of ready) {
    await expect(page.locator(selector).first()).toBeVisible({
      timeout: 20_000,
    });
  }
  await expect(page.getByText("Loading...")).toHaveCount(0, {
    timeout: 20_000,
  });
  await page.waitForLoadState("networkidle");
  await page.addStyleTag({ content: MONACO_SLIDERS });
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
      // Answer the analytics consent banner so it does not cover the page.
      // The "tracking banner" test below removes this to show it.
      await page.addInitScript(() =>
        localStorage.setItem("/tracking/canTrack", "no"),
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

    test("tracking banner", async ({ page }) => {
      await page.addInitScript(() =>
        localStorage.removeItem("/tracking/canTrack"),
      );
      await page.goto("chip");
      await settle(page, ROUTES.chip);
      await expect(page.getByRole("button", { name: "Accept" })).toBeVisible();
      await expect(page).toHaveScreenshot(`tracking-banner-${name}.png`, {
        ...SCREENSHOT,
        mask: masks(page),
      });
    });

    test("settings dialog", async ({ page }) => {
      await page.goto("chip");
      await settle(page, ROUTES.chip);
      await headerButton(page, "Settings").click();
      await expect(dialog(page, "Settings")).toBeVisible();
      await expect(page).toHaveScreenshot(`settings-dialog-${name}.png`, {
        ...SCREENSHOT,
        mask: masks(page),
      });
    });
  });
}
