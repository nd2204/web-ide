import type { Locator, Page } from "@playwright/test";

// Shared locators for the primitives the shadcn migration touches. They use
// roles and accessible names only, never class names or tag selectors, so
// a spec survives swapping the markup behind a primitive.

/** Opens a Select and chooses the option with this exact label. */
export async function pick(
  page: Page,
  trigger: Locator,
  label: string,
): Promise<void> {
  await trigger.click();
  await page.getByRole("option", { name: label, exact: true }).click();
}

/**
 * Picks one option of a radio group or a segmented ToggleGroup (both expose
 * `radiogroup` and `radio`), by the group's and the option's names.
 */
export async function choose(
  page: Page,
  group: string | RegExp,
  option: string,
): Promise<void> {
  await page
    .getByRole("radiogroup", { name: group })
    .getByRole("radio", { name: option, exact: true })
    .click();
}

/** Switches a `role="switch"` control to the wanted state. */
export async function toggle(
  page: Page,
  name: string | RegExp,
  on: boolean,
): Promise<void> {
  const control = page.getByRole("switch", { name });
  if ((await control.isChecked()) !== on) {
    await control.click();
  }
}

/** Selects a tab by its accessible name. */
export async function openTab(page: Page, name: string | RegExp) {
  await page.getByRole("tab", { name }).click();
}

/** A modal dialog by accessible name. */
export function dialog(page: Page, name: string | RegExp): Locator {
  return page.getByRole("dialog", { name });
}

/** A titled panel (a `region` named by its title), e.g. "RAM" or "VM Code". */
export function panel(page: Page, name: string | RegExp): Locator {
  return page.getByRole("region", { name, exact: typeof name === "string" });
}

/** The test panel; its title is "Test", or "Test: <name>" on some pages. */
export function testPanel(page: Page): Locator {
  return panel(page, /^Test(:|$)/);
}

/** A button or link in the header toolbar, by accessible name (e.g. "Settings"). */
export function headerButton(page: Page, name: string): Locator {
  return page.getByRole("toolbar").getByLabel(name, { exact: true });
}
