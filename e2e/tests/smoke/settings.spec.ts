import { expect, test } from "@playwright/test";
import { dialog } from "../../src/helpers";

test(
  "user picks Dark theme in Settings and the choice survives a reload",
  { tag: ["@settings"] },
  async ({ page }) => {
    await page.goto("");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

    await page.locator('li[data-tooltip="Settings"]').click();
    const settings = dialog(page, "Settings");
    await expect(settings).toBeVisible();

    await settings.getByRole("button", { name: "Dark" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

    await settings.getByRole("button", { name: "Close" }).click();
    await expect(settings).toBeHidden();

    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  },
);
