import { mkdirSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { builtRoutes } from './routes';

/**
 * Representative viewport checks (desktop Chromium only; engines do not change
 * layout math enough to justify multiplying this suite). For every built page
 * and width: no horizontal page overflow, no element wider than the viewport,
 * no clipped text, the h1 visible. Screenshots land in reports/screenshots/
 * for human inspection; they are not visual-regression baselines.
 */
const VIEWPORTS = [
  { width: 360, height: 740, label: 'small-phone' },
  { width: 390, height: 844, label: 'phone' },
  { width: 768, height: 1024, label: 'tablet' },
  { width: 1024, height: 768, label: 'small-laptop' },
  { width: 1440, height: 900, label: 'desktop' },
  { width: 1920, height: 1080, label: 'large-desktop' },
];

const SCREENSHOT_DIR = 'reports/screenshots';

/*
 * Layout at rest: under reduced motion every entrance effect is skipped, so the full-page
 * screenshots show each section finished. A full-page capture never scrolls, so with motion the
 * home page's work props would still be tucked behind their cards (src/lib/reveal.ts). They move
 * only by `translate`, so the layout checked is the same either way.
 */
test.use({ reducedMotion: 'reduce' });

test('every built page lays out cleanly at representative widths', async ({ page }) => {
  mkdirSync(SCREENSHOT_DIR, { recursive: true });
  const routes = builtRoutes();
  // One test walks every page at every width and writes a full-page screenshot each time, so its
  // time grows with the site: 6 seconds per page and width (the home page's longest step takes 3).
  test.setTimeout(routes.length * VIEWPORTS.length * 6_000);
  for (const route of routes) {
    for (const viewport of VIEWPORTS) {
      await test.step(`${route} @ ${viewport.width}px`, async () => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto(route);

        const metrics = await page.evaluate(() => {
          const vw = document.documentElement.clientWidth;
          const overflowing: string[] = [];
          const clippedText: string[] = [];
          const describe = (el: Element) =>
            `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ''}${el.className && typeof el.className === 'string' ? `.${el.className.split(' ').slice(0, 2).join('.')}` : ''}`;
          for (const el of Array.from(document.body.querySelectorAll('*'))) {
            if (el.closest('.sr-only')) continue;
            const rect = el.getBoundingClientRect();
            if (rect.width === 0 && rect.height === 0) continue;
            if (rect.right > vw + 1 || rect.left < -1)
              overflowing.push(`${describe(el)} right=${Math.round(rect.right)}`);
            if (/^(P|H[1-6]|LI|A|BUTTON|LABEL|SPAN|TD|TH)$/.test(el.tagName)) {
              const style = getComputedStyle(el);
              if (style.overflowX !== 'visible' && el.scrollWidth > el.clientWidth + 1) {
                clippedText.push(
                  `${describe(el)} scrollWidth=${el.scrollWidth} clientWidth=${el.clientWidth}`,
                );
              }
            }
          }
          return {
            pageOverflow:
              document.documentElement.scrollWidth > vw || document.body.scrollWidth > vw,
            overflowing,
            clippedText,
          };
        });

        expect(metrics.pageOverflow, 'no horizontal page scroll').toBe(false);
        expect(metrics.overflowing, 'no element extends past the viewport').toEqual([]);
        expect(metrics.clippedText, 'no clipped text').toEqual([]);
        await expect(page.getByRole('heading', { level: 1 })).toBeInViewport();

        // Lazy images load as a visitor scrolls, and a full-page capture never scrolls: load them
        // all first, so the screenshot shows every photo. Their boxes are reserved, so this
        // changes nothing the checks above measured.
        await page.evaluate(() =>
          Promise.all(
            Array.from(document.images, async (image) => {
              image.loading = 'eager';
              await image.decode().catch(() => undefined);
            }),
          ),
        );

        const slug = route === '/' ? 'home' : route.replace(/^\/|\/$/g, '').replace(/\//g, '-');
        await page.screenshot({
          path: `${SCREENSHOT_DIR}/${slug}-${viewport.width}x${viewport.height}-${viewport.label}.png`,
          fullPage: true,
        });
      });
    }
  }
});
