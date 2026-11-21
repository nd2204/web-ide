import { expect, test } from "@playwright/test";

// Length stress: 150% text scale on the phone viewport. Primitives must grow,
// not clip: no horizontal page overflow, and scrollWidth <= clientWidth for
// every non-truncating control. Truncation is allowed only for the Select
// value, editor file tab names and the header title.

test.describe("150% text scale", { tag: "@smoke" }, () => {
  test("primitive labels grow instead of clipping", async ({ page }) => {
    await page.goto("chip");
    await expect(page.locator(".ChipPage")).toBeVisible();
    await page.addStyleTag({ content: "html { font-size: 150% !important; }" });
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow, "page scrolls horizontally").toBeLessThanOrEqual(0);
    const clipped = await page.evaluate(() =>
      [
        ...document.querySelectorAll<HTMLElement>(
          "#root button, #root [role=tab], #root label, #root [data-slot]",
        ),
      ]
        .filter((el) => el.offsetParent !== null)
        // Truncation is allowed for the Select value, file tab names and the
        // header title only.
        .filter((el) => !el.matches("[data-slot=select-trigger], .truncate"))
        .filter((el) => !el.closest("[data-allow-clip], .monaco-editor"))
        .filter((el) => el.scrollWidth > el.clientWidth + 1)
        .map((el) => `${el.tagName.toLowerCase()}: ${el.textContent?.trim().slice(0, 30)}`),
    );
    expect(clipped).toEqual([]);
  });
});
