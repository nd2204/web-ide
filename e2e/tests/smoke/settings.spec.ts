import { expect, test } from "@playwright/test";
import { choose, dialog, headerButton } from "../../src/helpers";

test(
  "user picks Dark theme in Settings and the choice survives a reload",
  { tag: ["@settings"] },
  async ({ page }) => {
    await page.goto("");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

    await headerButton(page, "Settings").click();
    const settings = dialog(page, "Settings");
    await expect(settings).toBeVisible();

    await choose(page, "Theme", "Dark");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

    await settings.getByRole("button", { name: "Close" }).click();
    await expect(settings).toBeHidden();

    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  },
);

test(
  "Settings shows the projects folder controls only for desktop storage",
  { tag: ["@settings"] },
  async ({ page }) => {
    await page.goto("");
    await headerButton(page, "Settings").click();
    const settings = dialog(page, "Settings");
    const storage = settings.getByRole("radiogroup", { name: "Project files" });
    const download = settings.getByRole("button", {
      name: "Download the projects folder",
    });

    await expect(
      storage.getByRole("radio", { name: "Use browser storage" }),
    ).toBeChecked();
    await expect(download).toBeHidden();

    await choose(page, "Project files", "Use Desktop Storage");
    await expect(
      storage.getByRole("radio", { name: "Use Desktop Storage" }),
    ).toBeChecked();
    await expect(download).toBeVisible();

    await choose(page, "Project files", "Use browser storage");
    await expect(download).toBeHidden();
  },
);
