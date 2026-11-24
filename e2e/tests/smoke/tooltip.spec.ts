import { expect, test } from "@playwright/test";

// The Radix tooltip: opens on keyboard focus, and on hover after 300ms. The
// control keeps its own accessible name either way.

test.describe("Tooltip", { tag: "@smoke" }, () => {
  test("opens on focus", async ({ page }) => {
    await page.goto("chip");
    const reset = page.getByLabel("Reset", { exact: true });
    await reset.focus();
    await expect(page.getByRole("tooltip")).toHaveText("Reset");
    await page.keyboard.press("Escape");
    await expect(page.getByRole("tooltip")).toHaveCount(0);
  });

  test("opens on hover after a delay", async ({ page }) => {
    await page.goto("chip");
    await page.getByRole("button", { name: "Step", exact: true }).hover();
    await expect(page.getByRole("tooltip")).toHaveText("Step");
  });
});
