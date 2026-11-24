import { expect, type Page, test } from "@playwright/test";
import { dialog, headerButton } from "../../src/helpers";

// Touch phone layout (390x844, coarse pointer). The `phone` Playwright project
// runs these. Primitives in web/src/ui carry `data-slot`; each must reach the
// 44px touch target through the `coarse:` Tailwind variant.

const MIN_TARGET = 44;

// Anything wider than the viewport must sit inside a scroller (the header's
// tool capsule scrolls on a phone) or inside Monaco. `overflow: hidden` does
// not count: clipping is the failure this check exists to catch.
async function overflowing(page: Page, within: string) {
  return page.evaluate((scope) => {
    const clipped = (el: Element) => {
      for (let p = el.parentElement; p; p = p.parentElement) {
        if (p.matches(scope.replace(/ .*/, "")) && p !== el) break;
        const x = getComputedStyle(p).overflowX;
        if (x === "auto" || x === "scroll") return true;
      }
      return false;
    };
    return {
      page: document.documentElement.scrollWidth - window.innerWidth,
      wide: [...document.querySelectorAll<HTMLElement>(`${scope} *`)]
        .filter((el) => el.getBoundingClientRect().right > window.innerWidth + 1)
        .filter((el) => !el.closest(".monaco-editor") && !clipped(el))
        .map((el) => `${el.tagName.toLowerCase()}.${el.className}`.slice(0, 80))
        .slice(0, 5),
    };
  }, within);
}

async function expectNoHorizontalOverflow(page: Page, within = "#root") {
  const overflow = await overflowing(page, within);
  expect(overflow.page, "document scrollWidth beyond viewport").toBeLessThanOrEqual(0);
  expect(overflow.wide, "elements beyond viewport").toEqual([]);
}

async function expectPrimitiveTargets(page: Page) {
  const slots = page.locator("[data-slot]:visible");
  const count = await slots.count();
  expect(count, "at least one primitive on the page").toBeGreaterThan(0);
  for (let i = 0; i < count; i++) {
    const slot = slots.nth(i);
    const interactive = await slot.evaluate((el) =>
      el.matches("button, [role=switch], [role=combobox], [role=option], a, input"),
    );
    if (!interactive) continue;
    const box = await slot.boundingBox();
    expect(
      box?.height ?? 0,
      `${await slot.getAttribute("data-slot")} height`,
    ).toBeGreaterThanOrEqual(MIN_TARGET - 0.5);
  }
}

test.describe("phone", { tag: "@smoke" }, () => {
  test("header fits the viewport and Chip primitives reach 44px", async ({
    page,
  }) => {
    await page.goto("chip");
    await expect(page.locator(".ChipPage")).toBeVisible();
    await expect(page.locator("#root > header")).toBeVisible();
    await expectNoHorizontalOverflow(page, "#root > header");
    await expectPrimitiveTargets(page);
  });

  // Known defect today: the Chip page's editor wrappers are wider than a phone
  // and are clipped by their panels. `test.fail` starts failing (and must
  // become a plain test) when the Panel step fixes it.
  test("chip page content does not overflow the viewport", async ({ page }) => {
    test.fail(
      true,
      "Chip editor wrappers overflow a phone until the Panel step",
    );
    await page.goto("chip");
    await expect(page.locator(".ChipPage")).toBeVisible();
    await expectNoHorizontalOverflow(page, ".ChipPage");
  });

  test("every header tool is reachable by Tab at 360px", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto("chip");
    const tools = page.getByRole("toolbar").locator("[aria-label]");
    const count = await tools.count();
    expect(count).toBeGreaterThan(5);
    const seen = new Set<string>();
    await tools.first().focus();
    for (let i = 0; i < count; i++) {
      const label = await page.evaluate(
        () => document.activeElement?.getAttribute("aria-label") ?? "",
      );
      seen.add(label);
      // Focus scrolls the toolbar, so at least a 24px target (WCAG 2.5.8) of
      // the focused tool is inside the toolbar's visible area.
      await expect
        .poll(() =>
          page.evaluate(() => {
            const el = document.activeElement;
            const bar = el?.closest("ul");
            if (!el || !bar) return -1;
            const r = el.getBoundingClientRect();
            const b = bar.getBoundingClientRect();
            return Math.min(r.right, b.right) - Math.max(r.left, b.left);
          }),
        )
        .toBeGreaterThanOrEqual(24);
      await page.keyboard.press("Tab");
    }
    expect(seen.size).toBe(count);
  });

  test("settings dialog fits the viewport", async ({ page }) => {
    await page.goto("chip");
    await headerButton(page, "Settings").click();
    const settings = dialog(page, "Settings");
    await expect(settings).toBeVisible();
    const box = await settings.boundingBox();
    const viewport = page.viewportSize();
    expect(box).not.toBeNull();
    expect(box?.x ?? -1).toBeGreaterThanOrEqual(0);
    expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(
      (viewport?.width ?? 0) + 0.5,
    );
    expect((box?.y ?? 0) + (box?.height ?? 0)).toBeLessThanOrEqual(
      (viewport?.height ?? 0) + 0.5,
    );
  });

  test("settings dialog content does not overflow", async ({ page }) => {
    await page.goto("chip");
    await headerButton(page, "Settings").click();
    await expect(dialog(page, "Settings")).toBeVisible();
    const spill = await page.evaluate(() => {
      const root = document.querySelector("[role=dialog]");
      const edge = root?.getBoundingClientRect().right ?? 0;
      return [...(root?.querySelectorAll("*") ?? [])]
        .filter((el) => el.getBoundingClientRect().right > edge + 1)
        .map((el) => `${el.tagName.toLowerCase()}.${el.className}`.slice(0, 60))
        .slice(0, 5);
    });
    expect(spill, "content wider than the dialog").toEqual([]);
  });
});
