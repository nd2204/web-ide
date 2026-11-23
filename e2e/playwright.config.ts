import { defineConfig, devices } from "@playwright/test";

// `npm run test:e2e*` scripts set CI=true even on a laptop, so real CI is
// detected through GITHUB_ACTIONS instead.
const inGitHubActions = !!process.env.GITHUB_ACTIONS;
// Screenshot baselines exist for Linux only: run them in GitHub Actions, or in
// the Docker script (e2e/scripts/update-visual-baseline.sh) which sets VISUAL.
const runVisual = inGitHubActions || !!process.env.VISUAL;

const baseURL = process.env.BASE_URL ?? "http://localhost:5173/web-ide/";

export default defineConfig({
  testDir: "tests",
  retries: process.env.CI ? 3 : 0,
  timeout: 60_000,
  reporter: process.env.CI ? "dot" : "list",
  use: {
    baseURL,
    screenshot: "only-on-failure",
    trace: "on-first-retry",
  },
  expect: {
    toHaveScreenshot: { maxDiffPixelRatio: 0.002 },
  },
  projects: [
    {
      name: "chromium",
      testIgnore: ["**/visual/**", "**/phone/**", "**/i18n/**"],
      use: { ...devices["Desktop Chrome"] },
    },
    // Touch-only phone: coarse pointer, 390x844 (min-height 44px targets).
    {
      name: "phone",
      testMatch: "**/phone/**/*.spec.ts",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 390, height: 844 },
        hasTouch: true,
        isMobile: true,
      },
    },
    // The en-PL pseudolocale (accented text) is stored in the browser file
    // `/locale`, which the app reads at startup. Seed it before the first load.
    {
      name: "en-pl",
      testMatch: "**/i18n/**/*.spec.ts",
      use: {
        ...devices["Desktop Chrome"],
        storageState: {
          cookies: [],
          origins: [
            {
              origin: new URL(baseURL).origin,
              localStorage: [{ name: "/locale", value: "en-PL" }],
            },
          ],
        },
      },
    },
    ...(runVisual
      ? [
          {
            name: "visual",
            testMatch: "**/visual/**/*.spec.ts",
            use: { ...devices["Desktop Chrome"] },
          },
        ]
      : []),
  ],
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: "npm run start -w web",
        cwd: "..",
        url: "http://localhost:5173/web-ide/",
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
