import { expect, type Page, test } from "@playwright/test";
import { dialog, headerButton } from "../../src/helpers";

// Our own rules must reproduce everything public/pico.min.css still styles, so
// that deleting it (step 9 of the shadcn migration) is a pure deletion. Each
// test removes the `pico` layer from the CSSOM and checks that no element
// moves or changes its type, colours or spacing. Once pico.min.css is gone
// there is nothing to remove and the check passes trivially; delete it then.
//
// Not compared: Monaco's internals (it draws its own), and grid track metrics,
// which only matter through the boxes compared here. One such difference is
// known: the radio indicator in Settings loses Pico's gap on its empty grid,
// and nothing moves.

const PROPS = [
  "display",
  "font-family",
  "font-size",
  "font-weight",
  "line-height",
  "color",
  "background-color",
  "list-style-type",
  "text-decoration-line",
  "margin-top",
  "margin-right",
  "margin-bottom",
  "margin-left",
  "padding-top",
  "padding-right",
  "padding-bottom",
  "padding-left",
  "border-top-width",
  "border-bottom-width",
  "border-top-color",
  "border-radius",
  "fill",
  "stroke",
];

/** Returns every element whose box or style changes when Pico is removed. */
async function picoDiff(page: Page): Promise<string[]> {
  await page.evaluate(() => document.fonts.ready);
  return page.evaluate((props) => {
    const freeze = document.createElement("style");
    freeze.textContent =
      "*, ::before, ::after { transition: none !important; animation: none !important; }";
    document.head.append(freeze);

    const elements = [...document.querySelectorAll(
        "#root *, [role=dialog] *, [data-radix-popper-content-wrapper] *",
      )]
      .filter((el) => !el.closest(".monaco-editor"));
    const describe = (el: Element) =>
      `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ""}.${[...el.classList].slice(0, 3).join(".")}`;
    const snapshot = () =>
      elements.map((el) => {
        const style = getComputedStyle(el);
        const box = el.getBoundingClientRect();
        const values: Record<string, string> = {
          box: [box.x, box.y, box.width, box.height]
            .map((n) => n.toFixed(1))
            .join(","),
        };
        for (const prop of props) values[prop] = style.getPropertyValue(prop);
        return values;
      });

    const before = snapshot();
    for (const sheet of document.styleSheets) {
      let rules: CSSRuleList;
      try {
        rules = sheet.cssRules;
      } catch {
        continue;
      }
      for (let i = rules.length - 1; i >= 0; i--) {
        const rule = rules[i];
        if (rule instanceof CSSImportRule && rule.layerName === "pico") {
          sheet.deleteRule(i);
        }
      }
    }
    const after = snapshot();

    return elements.flatMap((el, i) =>
      Object.keys(before[i])
        .filter((key) => before[i][key] !== after[i][key])
        .map(
          (key) =>
            `${describe(el)} ${key}: ${before[i][key]} -> ${after[i][key]}`,
        ),
    );
  }, PROPS);
}

// Every tool page, by the grid that marks it as rendered.
const PAGES = {
  chip: ".ChipPage",
  cpu: ".CpuPage",
  asm: ".AsmPage",
  vm: ".VmPage",
  compiler: ".CompilerPage",
  bitmap: ".BitmapPage",
};

const DESKTOP = { width: 1280, height: 800 };
const VARIANTS = {
  desktop: { viewport: DESKTOP, colorScheme: "light" },
  phone: { viewport: { width: 390, height: 844 }, colorScheme: "light" },
  dark: { viewport: DESKTOP, colorScheme: "dark" },
} as const;

for (const [name, options] of Object.entries(VARIANTS)) {
  test.describe(`without Pico (${name})`, { tag: "@smoke" }, () => {
    test.use(options);

    test.beforeEach(async ({ page }) => {
      await page.addInitScript(() =>
        localStorage.setItem("/tracking/canTrack", "no"),
      );
    });

    for (const [route, ready] of Object.entries(PAGES)) {
      test(`the ${route} page looks the same`, async ({ page }) => {
        await page.goto(route);
        await expect(page.locator(ready)).toBeVisible();
        await expect(page.getByText("Loading...")).toHaveCount(0);
        expect(await picoDiff(page)).toEqual([]);
      });
    }

    test("an open Select list looks the same", async ({ page }) => {
      await page.goto("chip");
      await expect(page.locator(".ChipPage")).toBeVisible();
      await page.getByTestId("project-picker").click();
      await expect(page.getByRole("listbox")).toBeVisible();
      expect(await picoDiff(page)).toEqual([]);
    });

    test("the about page looks the same", async ({ page }) => {
      await page.goto("about");
      await expect(page.getByText("Nand to Tetris IDE Online")).toBeVisible();
      expect(await picoDiff(page)).toEqual([]);
    });

    test("the Settings dialog looks the same", async ({ page }) => {
      await page.goto("chip");
      await expect(page.locator(".ChipPage")).toBeVisible();
      await headerButton(page, "Settings").click();
      await expect(dialog(page, "Settings")).toBeVisible();
      expect(await picoDiff(page)).toEqual([]);
    });
  });
}
