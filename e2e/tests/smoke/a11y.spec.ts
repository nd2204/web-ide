import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { dialog, headerButton } from "../../src/helpers";

// Automated accessibility floor for the shadcn migration: no serious or
// critical axe violation on any route, an open dialog, or an open Select
// listbox. This does not replace the manual keyboard and screen-reader pass in
// MANUAL_TESTING.md.

const ROUTES = ["chip", "cpu", "asm", "vm", "compiler", "bitmap", "about", "util"];

// Violations that exist today and that this migration must not fix by
// restyling (step 0 has no visual change). Each entry names the axe rule, a
// CSS-target pattern, and why it is allowed. Every step deletes the entries it
// fixes; never add one to let a new violation pass.
const KNOWN: { rule: string; target: RegExp; why: string }[] = [
  {
    rule: "aria-hidden-focus",
    target: /^#root$/,
    why: "Radix hides #root while a Select is open and traps focus in the list",
  },
  {
    rule: "aria-required-children",
    target: /^section(\[role="tablist"\])?$/,
    why: "tabs are radio inputs inside role=tab wrappers (tabs step)",
  },
  {
    rule: "nested-interactive",
    target: /^#tab-_r_\w+_$/,
    why: "tabs are radio inputs inside role=tab wrappers (tabs step)",
  },
  {
    rule: "color-contrast",
    target: /\.col-label|\.row-label/,
    why: "bitmap editor axis labels (table step)",
  },
  {
    rule: "color-contrast",
    target: /\.line-numbers|tr\[data-kind="output"\]|\.folder-location-row|^div:nth-child\(4\) > button$|label\[aria-current="true"\]/,
    why: "muted text on panels: Braun token review, separate from this migration",
  },
  {
    rule: "label",
    target: /input\[role="switch"\]|^textarea$/,
    why: "unlabelled asm switch and bitmap textarea (Input/Select step)",
  },
  {
    rule: "scrollable-region-focusable",
    target: /^(#root > \.stack-item-1 > div|main > div|\.(RAM|ROM|Stack) > div|\.canvas-panel > main > div)$/,
    why: "scroll panes are not keyboard focusable (Panel step)",
  },
];

async function serious(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  return results.violations
    .filter((v) => v.impact === "serious" || v.impact === "critical")
    .flatMap((v) =>
      v.nodes.map((n) => ({ rule: v.id, target: n.target.join(" ") })),
    )
    .filter(
      (v) => !KNOWN.some((k) => k.rule === v.rule && k.target.test(v.target)),
    );
}

for (const route of ROUTES) {
  test(`${route} has no serious axe violations`, { tag: "@smoke" }, async ({ page }) => {
    await page.goto(route);
    await expect(page.locator("#root > main")).toBeVisible();
    expect(await serious(page)).toEqual([]);
  });
}

test("open Settings dialog has no serious axe violations", { tag: "@smoke" }, async ({ page }) => {
  await page.goto("chip");
  await headerButton(page, "Settings").click();
  await expect(dialog(page, "Settings")).toBeVisible();
  expect(await serious(page)).toEqual([]);
});

test("open Select listbox has no serious axe violations", { tag: "@smoke" }, async ({ page }) => {
  await page.goto("chip");
  await page.getByTestId("project-picker").click();
  await expect(page.getByRole("listbox")).toBeVisible();
  expect(await serious(page)).toEqual([]);
});
