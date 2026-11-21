import { expect } from "@playwright/test";
import { test } from "../../fixtures/chip.fixture";

// Switching Builtin on shows generated `BUILTIN <name>;` text in the editor.
// That text must never be saved over the student's own HDL file: switching
// Builtin back off, or reloading, has to bring the original HDL back.
//
// The Monaco editor reports programmatic changes as edits, which the plain
// textarea does not, so this test runs with Monaco on (the fixture default is
// `?monaco=0`).
test("Toggling Builtin on and off leaves the saved HDL untouched", async ({
  chipPage,
}) => {
  const page = chipPage.page;
  await page.goto("chip");
  const savedHdl = () =>
    page.evaluate(() => localStorage.getItem("/projects/01/And.hdl") ?? "");
  const builtin = page.getByRole("switch", { name: "Builtin" });
  const toggle = page.locator("label", { hasText: "Builtin" });
  const editorText = page.locator(".view-lines").first();

  await page.selectOption('[data-testid="project-picker"]', { label: "Project 1" });
  await page.selectOption('[data-testid="chip-picker"]', { label: "And" });
  await expect(editorText).toContainText("CHIP And");
  const original = await savedHdl();
  expect(original).not.toContain("BUILTIN");

  await toggle.click();
  await expect(builtin).toBeChecked();
  await expect(editorText).toContainText("BUILTIN");
  // The unwanted save is asynchronous: give it time to happen.
  await page.waitForTimeout(1000);
  expect(await savedHdl()).toBe(original);

  await toggle.click();
  await expect(builtin).not.toBeChecked();
  await expect(editorText).not.toContainText("BUILTIN");
  await page.waitForTimeout(1000);
  expect(await savedHdl()).toBe(original);

  await page.reload();
  await expect(editorText).toContainText("CHIP And");
  await expect(editorText).not.toContainText("BUILTIN");
});
