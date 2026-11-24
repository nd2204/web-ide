import { expect, test } from "@playwright/test";
import { dialog, headerButton } from "../../src/helpers";

test(
  "user picks Dark theme in Settings and the choice survives a reload",
  { tag: ["@settings"] },
  async ({ page }) => {
    await page.goto("");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

    await headerButton(page, "Settings").click();
    const settings = dialog(page, "Settings");
    await expect(settings).toBeVisible();

    await settings.getByLabel("Dark").check({ force: true });
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

    await settings.getByRole("button", { name: "Close" }).click();
    await expect(settings).toBeHidden();

    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  },
);
