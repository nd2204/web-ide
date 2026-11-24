import { expect, test } from "@playwright/test";

// Characterisation specs for the form controls on pages that had no
// behavioural spec for them. They use labels and roles only, so they hold
// across the Input, Select and Slider migration.

test(
  "Converter: a binary value shows as decimal",
  { tag: "@smoke" },
  async ({ page }) => {
    await page.goto("util");
    await page.getByLabel("Binary").fill("101");
    // Fields in order: Binary, Decimal, Unsigned, Hex, HACK ASM.
    await expect(page.getByRole("textbox").nth(1)).toHaveValue("5");
  },
);

test(
  "Bitmap: Comments On and the margin choice change the generated code",
  { tag: "@smoke" },
  async ({ page }) => {
    await page.goto("bitmap");
    const code = page.locator(".code-panel textarea");
    await expect(code).toHaveValue(/\/\//);

    await page.getByLabel("Comments On").click();
    await expect(code).not.toHaveValue(/\/\//);

    const shifts = page.getByLabel(/shifts per animation frame/i);
    await expect(shifts).toBeVisible();
    await page.getByRole("radio", { name: "Rectangular" }).click();
    await expect(shifts).toBeHidden();
  },
);
