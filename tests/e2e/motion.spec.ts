import { expect, test } from '@playwright/test';
import { builtRoutes } from './routes';

/**
 * The global stylesheet switches smooth scrolling off and collapses animation
 * durations under `prefers-reduced-motion: reduce`. These tests prove the
 * media query plumbing works in every engine, and that nothing on a freshly
 * loaded page keeps moving for more than five seconds; they are not a
 * substitute for checking each future animated component by hand.
 */
test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('disables smooth scrolling and running animations', async ({ page }) => {
    await page.goto('/');
    const state = await page.evaluate(() => ({
      prefers: matchMedia('(prefers-reduced-motion: reduce)').matches,
      scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
      runningAnimations: document.getAnimations().filter((a) => a.playState === 'running').length,
    }));
    expect(state.prefers, 'emulation applied').toBe(true);
    expect(state.scrollBehavior).toBe('auto');
    expect(state.runningAnimations, 'no animation keeps running under reduced motion').toBe(0);
  });
});

test.describe('motion allowed', () => {
  test.use({ reducedMotion: 'no-preference' });

  test('keeps smooth scrolling when motion is allowed', async ({ page }) => {
    await page.goto('/');
    const scrollBehavior = await page.evaluate(
      () => getComputedStyle(document.documentElement).scrollBehavior,
    );
    expect(scrollBehavior).toBe('smooth');
  });

  test('motion that starts on its own ends within five seconds', async ({ page }) => {
    // WCAG 2.2.2: anything still moving after five seconds needs a pause control, so nothing is.
    for (const route of builtRoutes()) {
      await page.goto(route);
      const endTimes = await page.evaluate(() =>
        document
          .getAnimations()
          .filter((animation) => animation.playState === 'running')
          .map((animation) => Number(animation.effect?.getComputedTiming().endTime)),
      );
      expect(
        Math.max(0, ...endTimes),
        `${route}: longest animation on load, in ms`,
      ).toBeLessThanOrEqual(5000);
    }
  });
});
