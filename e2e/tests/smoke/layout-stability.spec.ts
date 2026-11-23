import { expect, test } from "@playwright/test";

// Radix locks page scroll while a Select or Dialog is open by making <body>
// `position: relative`. #root is absolutely positioned, so without full-height
// html and body (web/src/pico/pico.scss) it would collapse. See the
// coexistence decision in the shadcn migration map.

test(
  "opening a Select leaves the #root box unchanged",
  { tag: "@smoke" },
  async ({ page }) => {
    await page.goto("chip");
    const root = page.locator("#root");
    await expect(page.locator(".ChipPage")).toBeVisible();
    const before = await root.boundingBox();
    expect(before?.height ?? 0).toBeGreaterThan(300);

    await page.getByTestId("project-picker").click();
    await expect(page.getByRole("listbox")).toBeVisible();
    await expect(page.locator("body")).toHaveAttribute("data-scroll-locked", /.+/);
    expect(await root.boundingBox()).toEqual(before);

    await page.keyboard.press("Escape");
    await expect(page.getByRole("listbox")).toBeHidden();
    expect(await root.boundingBox()).toEqual(before);
  },
);

test(
  "opening the Settings dialog leaves the #root box unchanged",
  { tag: "@smoke" },
  async ({ page }) => {
    await page.goto("chip");
    const root = page.locator("#root");
    await expect(page.locator(".ChipPage")).toBeVisible();
    const before = await root.boundingBox();

    await page.locator('li[data-tooltip="Settings"]').click();
    await expect(
      page.locator("dialog[open] article.settings-dialog"),
    ).toBeVisible();
    expect(await root.boundingBox()).toEqual(before);
  },
);
