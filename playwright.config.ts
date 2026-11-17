import { defineConfig, devices } from '@playwright/test';

/**
 * Browser tests run against a fresh production build served by `astro preview`
 * on a dedicated port, so a developer's `astro dev` server on 4321 is never
 * picked up by mistake (the dev toolbar would break the SEO and a11y suites).
 *
 * Matrix: five projects. Desktop Chromium runs every suite; the other engines
 * and the mobile emulations run the cross-browser suites (smoke, a11y, motion, navigation, hero)
 * and skip the suites whose result cannot differ by engine (seo, layout,
 * rendering). See docs/quality-checks.md for the matrix table.
 *
 * Local: `npm run test:e2e` builds then serves. CI builds once and sets
 * PLAYWRIGHT_SKIP_BUILD=1 so the web server only serves dist/.
 * Docs: https://playwright.dev/docs/test-configuration
 */
const PORT = 4322;
const baseURL = `http://localhost:${PORT}`;
const skipBuild = !!process.env.PLAYWRIGHT_SKIP_BUILD;
/**
 * Playwright's bundled Firefox cannot start on some macOS releases (seen on macOS 27.2:
 * "Could not find profile folder"). Set PLAYWRIGHT_SKIP_FIREFOX=1 to drop that project
 * locally and say so in the report; CI on Ubuntu always runs it.
 */
const skipFirefox = !!process.env.PLAYWRIGHT_SKIP_FIREFOX;

/** Suites that only need one engine: metadata, viewport layout, static assets. */
const engineIndependent = ['**/seo.spec.ts', '**/layout.spec.ts', '**/rendering.spec.ts'];

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'] } },
    {
      name: 'desktop-firefox',
      use: { ...devices['Desktop Firefox'] },
      testIgnore: engineIndependent,
    },
    {
      name: 'desktop-webkit',
      use: { ...devices['Desktop Safari'] },
      testIgnore: engineIndependent,
    },
    { name: 'mobile-chromium', use: { ...devices['Pixel 7'] }, testIgnore: engineIndependent },
    { name: 'mobile-webkit', use: { ...devices['iPhone 15'] }, testIgnore: engineIndependent },
  ].filter((project) => !(skipFirefox && project.name === 'desktop-firefox')),
  webServer: {
    // Astro 7 starts dev/preview servers in the background when it detects an AI agent
    // session; `--ignore-lock` forces a one-off foreground server that stays a direct
    // child of Playwright (so it is stopped after the run) and never reuses a stale one.
    command: skipBuild
      ? `astro preview --port ${PORT} --ignore-lock`
      : `astro build && astro preview --port ${PORT} --ignore-lock`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    gracefulShutdown: { signal: 'SIGTERM', timeout: 5_000 },
  },
});
