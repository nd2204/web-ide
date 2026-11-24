import { expect, test } from "@playwright/test";
import { EditorPanel } from "../../src/pages/EditorPanel";

// Characterisation spec for the Assembler's Symbol Table, which had no
// behavioural spec. It reads visible text only, so it holds across the Table
// migration.

test(
  "Assembler: translating lists the symbols and their addresses",
  { tag: "@smoke" },
  async ({ page }) => {
    await page.goto("asm");
    await new EditorPanel(page).write("(LOOP)\n@LOOP\n0;JMP\n");
    await page.getByRole("button", { name: "Translate", exact: true }).click();
    await expect(page.getByText("SCREEN", { exact: true })).toBeVisible();
    await expect(page.getByText("16384", { exact: true })).toBeVisible();
  },
);
