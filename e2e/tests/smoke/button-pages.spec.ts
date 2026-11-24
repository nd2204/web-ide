import { expect, test } from "@playwright/test";

// Characterisation specs for pages whose buttons have no behavioural spec yet.
// They locate buttons by role and accessible name, so they hold across the
// Button migration.

test(
  "Bitmap: Resize applies the new canvas size",
  { tag: "@smoke" },
  async ({ page }) => {
    await page.goto("bitmap");
    await page.locator("#inputWidth").fill("8");
    await page.locator("#inputHeight").fill("4");
    await page.getByRole("button", { name: "Resize" }).click();
    // The column-number header row plus the four pixel rows.
    await expect(page.locator("table.canvas-grid tbody tr")).toHaveCount(5);
  },
);

test(
  "Tracking banner: Reject dismisses it",
  { tag: "@smoke" },
  async ({ page }) => {
    await page.addInitScript(() =>
      localStorage.removeItem("/tracking/canTrack"),
    );
    await page.goto("chip");
    const banner = page.locator("#trackingBanner");
    await expect(banner).toBeVisible();
    await banner.getByRole("button", { name: "Reject" }).click();
    await expect(banner).toBeHidden();
  },
);
