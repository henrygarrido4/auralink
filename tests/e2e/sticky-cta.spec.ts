import { expect, test, type Locator, type Page } from '@playwright/test';
import { primaryCta } from '../../src/data/site';

/**
 * Sticky call to action (src/components/sections/StickyCta.astro). Below the lg breakpoint, where
 * the navbar keeps its button inside the menu, the same button stays at the bottom of the screen
 * however far the page has scrolled. It rests after the page's last content, so it covers nothing
 * at the end of the page, and keyboard focus scrolls clear of it. From lg the navbar shows the
 * button and the bar is gone. The viewport is set per group, so every project checks both.
 */
const bar = (page: Page) => page.getByRole('complementary', { name: 'Contact' });
const button = (page: Page) => bar(page).getByText(primaryCta.label, { exact: true });

/** Jump there at once: the page scrolls smoothly when motion is allowed. */
const scrollTo = (page: Page, top: number) =>
  page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), top);

const maxScroll = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);

/** An element's box in the viewport, with the viewport's own size. */
const boxOf = (element: Locator) =>
  element.evaluate((el) => {
    const { top, bottom, left, width } = el.getBoundingClientRect();
    const { clientWidth, clientHeight } = document.documentElement;
    return { top, bottom, left, width, viewport: { width: clientWidth, height: clientHeight } };
  });

test.describe('below the desktop breakpoint', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('keeps the call to action at the bottom of the screen as the page scrolls', async ({
    page,
  }) => {
    await page.goto('/');
    // The same button as the navbar's, link or placeholder alike.
    await expect(button(page)).toBeVisible();
    if (primaryCta.href) await expect(button(page)).toHaveAttribute('href', primaryCta.href);
    else await expect(button(page), 'no destination yet').not.toHaveAttribute('href');

    const end = await maxScroll(page);
    expect(end, 'the page is taller than the screen').toBeGreaterThan(0);
    for (const top of [0, Math.round(end / 2), end]) {
      await scrollTo(page, top);
      const box = await boxOf(bar(page));
      expect(box.bottom, `scrolled to ${top}px: at the bottom edge`).toBeCloseTo(
        box.viewport.height,
        0,
      );
      expect(box.left, `scrolled to ${top}px: from the left edge`).toBeCloseTo(0, 0);
      expect(box.width, `scrolled to ${top}px: across the screen`).toBeCloseTo(
        box.viewport.width,
        0,
      );
      await expect(button(page)).toBeInViewport({ ratio: 1 });
    }
  });

  test('covers nothing at the end of the page', async ({ page }) => {
    await page.goto('/');
    await scrollTo(page, await maxScroll(page));
    const [main, cta] = [await boxOf(page.getByRole('main')), await boxOf(bar(page))];
    expect(main.bottom, 'the content ends where the bar starts').toBeLessThanOrEqual(cta.top + 0.5);
  });

  test('content scrolled into view stops clear of the bar and the navbar', async ({ page }) => {
    await page.goto('/');
    // The last link in the content starts below the screen, so reaching it scrolls the page.
    const link = page.getByRole('main').getByRole('link').last();
    await expect(link).not.toBeInViewport();
    /** The smaller of the gaps between the link and the two bars; negative when one covers it. */
    const clearance = async () => {
      const [target, cta, header] = [
        await boxOf(link),
        await boxOf(bar(page)),
        await boxOf(page.getByRole('banner')),
      ];
      return Math.min(cta.top - target.bottom, target.top - header.bottom);
    };

    await link.evaluate((el: HTMLElement) => el.focus());
    await expect(link).toBeFocused();
    await expect
      .poll(clearance, 'the focused link sits between the navbar and the bar')
      .toBeGreaterThanOrEqual(-0.5);

    // Chromium and WebKit centre what takes focus. A browser may instead scroll only as far as it
    // must, which would leave the link under the bar without `scroll-padding-bottom`.
    await scrollTo(page, 0);
    await link.evaluate((el) => el.scrollIntoView({ block: 'nearest', behavior: 'instant' }));
    await expect
      .poll(clearance, 'a shortest scroll stops above the bar, not under it')
      .toBeGreaterThanOrEqual(-0.5);
  });
});

test.describe('at desktop width', () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test('leaves the call to action to the navbar', async ({ page }) => {
    await page.goto('/');
    await expect(bar(page)).toBeHidden();
    await expect(
      page.getByRole('banner').getByText(primaryCta.label, { exact: true }),
    ).toBeVisible();
  });
});
