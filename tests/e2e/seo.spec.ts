import { expect, test } from './fixtures';
import { builtRoutes } from './routes';

const SITE = 'https://auralinkstudio.com';

/**
 * Every built page must ship the metadata search engines and AI answer
 * engines rely on. Keep this in sync with docs/seo-aeo-geo.md.
 */
test('every built page has valid SEO basics', async ({ page }) => {
  const routes = builtRoutes();
  expect(routes.length, 'the build produced at least one page').toBeGreaterThan(0);
  // One visit per page, so the time grows with the site: 2 seconds per page.
  test.setTimeout(routes.length * 2_000);

  for (const route of routes) {
    await test.step(route, async () => {
      const response = await page.goto(route);
      expect(response?.status(), `${route} responds 200`).toBe(200);

      const title = await page.title();
      expect(title.length, `${route} title length`).toBeGreaterThanOrEqual(10);
      expect(title.length, `${route} title length`).toBeLessThanOrEqual(70);

      const description = await page.locator('meta[name="description"]').getAttribute('content');
      expect(description, `${route} has a meta description`).toBeTruthy();
      expect(description!.length, `${route} description length`).toBeGreaterThanOrEqual(50);
      expect(description!.length, `${route} description length`).toBeLessThanOrEqual(160);

      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
      expect(canonical, `${route} canonical`).toMatch(new RegExp(`^${SITE}`));

      await expect(page.locator('html'), `${route} lang`).toHaveAttribute('lang', /^[a-z]{2}/);
      await expect(page.locator('meta[name="viewport"]'), `${route} viewport`).toHaveCount(1);
      await expect(page.locator('h1'), `${route} has exactly one h1`).toHaveCount(1);

      const imagesMissingAlt = await page.locator('img:not([alt])').count();
      expect(imagesMissingAlt, `${route} images without alt attribute`).toBe(0);

      const jsonLdBlocks = await page
        .locator('script[type="application/ld+json"]')
        .allTextContents();
      for (const block of jsonLdBlocks) {
        expect(() => JSON.parse(block), `${route} JSON-LD parses`).not.toThrow();
      }
    });
  }
});
