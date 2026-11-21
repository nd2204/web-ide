import { defineConfig, devices } from "@playwright/test";

// `npm run test:e2e*` scripts set CI=true even on a laptop, so real CI is
// detected through GITHUB_ACTIONS instead.
const inGitHubActions = !!process.env.GITHUB_ACTIONS;
// Screenshot baselines exist for Linux only: run them in GitHub Actions, or in
// the Docker script (e2e/scripts/update-visual-baseline.sh) which sets VISUAL.
const runVisual = inGitHubActions || !!process.env.VISUAL;

export default defineConfig({
  testDir: "tests",
  retries: process.env.CI ? 3 : 0,
  timeout: 60_000,
  reporter: process.env.CI ? "dot" : "list",
  use: {
    baseURL: "http://localhost:5173/web-ide/",
    screenshot: "only-on-failure",
    trace: "on-first-retry",
  },
  expect: {
    toHaveScreenshot: { maxDiffPixelRatio: 0.002 },
  },
  projects: [
    {
      name: "chromium",
      testIgnore: "**/visual/**",
      use: { ...devices["Desktop Chrome"] },
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
  webServer: {
    command: "npm run start -w web",
    cwd: "..",
    url: "http://localhost:5173/web-ide/",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
