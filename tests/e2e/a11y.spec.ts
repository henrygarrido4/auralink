import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { builtRoutes } from './routes';

/**
 * Automated WCAG 2.2 AA scan of every built page. Automated checks catch a
 * subset of issues; manual keyboard and screen reader review is still part of
 * the definition of done for new templates.
 */
test('every built page passes automated WCAG 2.2 AA checks', async ({ page }) => {
  const routes = builtRoutes();
  // One scan per page, so the time grows with the site: 4 seconds per page.
  test.setTimeout(routes.length * 4_000);
  for (const route of routes) {
    await test.step(route, async () => {
      await page.goto(route);
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();
      const summary = results.violations.map(
        (v) =>
          `${v.id} (${v.impact}): ${v.help} -> ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`,
      );
      expect(summary, `${route} accessibility violations`).toEqual([]);
    });
  }
});
