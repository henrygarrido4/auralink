import { expect, test } from './fixtures';
import { builtRoutes } from './routes';

/**
 * Server-level rendering and navigation checks (desktop Chromium only):
 * the build serves its static assets, unknown routes return 404, and every
 * internal link on every built page resolves. Not covered: external links.
 */
test('build artifacts are served', async ({ request }) => {
  const sitemap = await request.get('/sitemap-index.xml');
  expect(sitemap.status()).toBe(200);
  expect(await sitemap.text()).toContain('<sitemapindex');

  const robots = await request.get('/robots.txt');
  expect(robots.status()).toBe(200);
  expect(await robots.text()).toMatch(/Sitemap: https:\/\/auralinkstudio\.com\/sitemap-index\.xml/);

  for (const asset of ['/favicon.svg', '/favicon.ico']) {
    expect((await request.get(asset)).status(), `${asset} is served`).toBe(200);
  }
});

test('unknown routes return 404', async ({ request }) => {
  const response = await request.get('/this-route-does-not-exist/');
  expect(response.status()).toBe(404);
});

test('every internal link on every built page resolves', async ({ page, request }) => {
  const checked = new Map<string, number>();
  const routes = builtRoutes();
  // One visit per page plus its links, so the time grows with the site: 3 seconds per page.
  test.setTimeout(routes.length * 3_000);
  for (const route of routes) {
    await page.goto(route);
    const hrefs = await page
      .locator('a[href^="/"]')
      .evaluateAll((anchors) =>
        anchors.map((a) => (a as HTMLAnchorElement).getAttribute('href') ?? ''),
      );
    for (const href of hrefs) {
      const target = href.split('#')[0];
      if (!target || checked.has(target)) continue;
      const status = (await request.get(target)).status();
      checked.set(target, status);
      expect(status, `${route} links to ${target}`).toBe(200);
    }
  }
});
