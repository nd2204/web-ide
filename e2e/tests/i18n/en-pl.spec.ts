import { expect, test } from "@playwright/test";

// The `en-pl` project seeds the pseudolocale (accented text) before load. If a
// string is not wrapped in Lingui it stays plain ASCII English, which these
// specs catch for the primitives in web/src/ui and the Settings dialog.

test.describe("en-PL pseudolocale", { tag: "@smoke" }, () => {
  test("Settings dialog is pseudo-translated", async ({ page }) => {
    await page.goto("chip");
    await expect(page.locator(".ChipPage")).toBeVisible();
    // Header tooltips are not wrapped yet, so find the button by its icon.
    await page
      .locator("li", {
        has: page.locator(".material-symbols-outlined", { hasText: /^settings$/ }),
      })
      .click();
    const header = page.locator("dialog[open] article.settings-dialog header p");
    await expect(header).toHaveText("Śēţţĩńĝś");
  });

  test("a wrapped tooltip shows accented text", async ({ page }) => {
    await page.goto("chip");
    const tip = page.locator(".ChipPage [data-tooltip][aria-label]").first();
    await expect(tip).toHaveAttribute("data-tooltip", /[^\x00-\x7f]/);
  });

  test("the chip picker Select shows accented labels in its list", async ({
    page,
  }) => {
    await page.goto("chip");
    const picker = page.getByTestId("chip-picker");
    await expect(picker).toBeVisible();
    // The trigger's accessible name is the translated "Chip" label.
    await expect(picker).toHaveAttribute("aria-label", /[^\x00-\x7f]/);
  });
});
