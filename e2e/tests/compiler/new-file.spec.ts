import { expect, test } from "@playwright/test";

// Characterisation of the Jack compiler page before its dialog moves to Radix:
// creating a file needs a project folder, so without one the key reports that
// in the status bar and opens no dialog.
test(
  "Compiler: creating a file with no project folder opens no dialog",
  { tag: "@smoke" },
  async ({ page }) => {
    await page.goto("compiler");
    const create = page.getByRole("button", {
      name: "Create a new file in the currently opened folder",
      exact: true,
    });
    await expect(create).toBeVisible();
    await create.click();
    await expect(page.getByText("No project folder loaded")).toBeVisible();
    await expect(page.getByRole("dialog")).toHaveCount(0);
  },
);
