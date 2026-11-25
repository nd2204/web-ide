import { expect, test } from "@playwright/test";

// Characterisation of the tabs and accordions before they move to the Panel,
// Tabs and Accordion primitives: each one shows and hides its content.

test("Test panel: a tab shows its own content", { tag: "@smoke" }, async ({
  page,
}) => {
  await page.goto("chip");
  const hint = page.getByText("Execute test script to generate output.");
  await expect(hint).toBeHidden();
  await page.getByRole("tab", { name: "Output File" }).click();
  await expect(hint).toBeVisible();
  await page.getByRole("tab", { name: "Test Script" }).click();
  await expect(hint).toBeHidden();
});

test("Bitmap: the Hack tab shows the generated assembly", { tag: "@smoke" }, async ({
  page,
}) => {
  await page.goto("bitmap");
  await expect(
    page.getByRole("textbox", { name: "Generated Jack Code" }),
  ).toBeVisible();
  await page.getByText("Generated Hack Assembly", { exact: true }).click();
  await expect(
    page.getByRole("textbox", { name: "Generated Hack Assembly" }),
  ).toBeVisible();
});

test("CPU: the Registers accordion collapses and reopens", { tag: "@smoke" }, async ({
  page,
}) => {
  await page.goto("cpu");
  const pc = page.getByTestId("register-PC");
  await expect(pc).toBeVisible();
  await page.getByText("Registers", { exact: true }).click();
  await expect(pc).toBeHidden();
  await page.getByText("Registers", { exact: true }).click();
  await expect(pc).toBeVisible();
});
