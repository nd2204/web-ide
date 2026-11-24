import { expect, test } from "@playwright/test";
import { dialog } from "../../src/helpers";

// All dialogs are modal Radix dialogs. Settings can open the reset dialog on
// top of itself (siblings), and its "Incomplete Setup" warning is a second view
// of the same dialog. Escape always closes only the topmost layer.

const inDialog = (page: import("@playwright/test").Page) =>
  page.evaluate(
    () => document.activeElement?.closest('[role="dialog"]') !== null,
  );

test(
  "Settings dialog chain: Tab trap, topmost-only Escape, guard and focus return",
  { tag: "@smoke" },
  async ({ page }) => {
    await page.goto("chip");
    const opener = page.locator('li[data-tooltip="Settings"]');
    await opener.click();
    const settings = dialog(page, "Settings");
    await expect(settings).toBeVisible();

    // Tab never leaves the modal.
    for (let i = 0; i < 40; i++) {
      await page.keyboard.press("Tab");
      expect(await inDialog(page), `Tab press ${i + 1}`).toBe(true);
    }

    // A second dialog opens on top; Escape closes only that one and focus
    // returns to the key that opened it.
    const resetKey = settings.getByRole("button", {
      name: "Reset browser storage files",
    });
    await resetKey.click();
    const reset = dialog(page, "Reset browser storage files");
    await expect(reset).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(reset).toBeHidden();
    await expect(settings).toBeVisible();
    await expect(resetKey).toBeFocused();

    // Escape runs the same guard as the X key: desktop storage without a folder
    // swaps the content to the warning instead of closing.
    await settings.getByRole("radio", { name: "Use Desktop Storage" }).check();
    await page.keyboard.press("Escape");
    const warning = dialog(page, "Incomplete Setup");
    await expect(warning).toBeVisible();
    await expect(settings).toBeHidden();
    // Escape on the warning goes back to Settings, it does not close it.
    await page.keyboard.press("Escape");
    await expect(dialog(page, "Settings")).toBeVisible();

    await dialog(page, "Settings")
      .getByRole("radio", { name: "Use browser storage" })
      .check();
    await page.keyboard.press("Escape");
    await expect(dialog(page, "Settings")).toBeHidden();
    await expect(opener).toBeFocused();
  },
);
