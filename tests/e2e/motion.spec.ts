import { expect, test } from '@playwright/test';
import { builtRoutes } from './routes';

/**
 * The global stylesheet switches smooth scrolling off and collapses animation
 * durations under `prefers-reduced-motion: reduce`. These tests prove the
 * media query plumbing works in every engine, and that nothing on a freshly
 * loaded page keeps moving for more than five seconds, except the home
 * services strip. That strip keeps scrolling and pauses only under the pointer,
 * with no pause button: the owner's decision of 2026-11-18, recorded in
 * docs/quality-checks.md. These tests are not a substitute for checking each
 * future animated component by hand.
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

  test('motion that starts on its own ends within five seconds, except the home services strip', async ({
    page,
  }) => {
    // WCAG 2.2.2: motion still running after five seconds needs a way to pause it. Only the home
    // services strip keeps going. It pauses under the pointer and has no button (the owner's
    // decision), which tests/e2e/service-strip.spec.ts checks. Everything else has to finish.
    for (const route of builtRoutes()) {
      await page.goto(route);
      const endless = await page.evaluate(() =>
        document
          .getAnimations()
          .filter((animation) => animation.playState === 'running')
          .filter((animation) => Number(animation.effect?.getComputedTiming().endTime) > 5000)
          .filter((animation) => {
            const target = (animation.effect as KeyframeEffect | null)?.target ?? null;
            const name = (animation as CSSAnimation).animationName;
            const inStrip = target instanceof Element && !!target.closest('[data-service-strip]');
            return !(inStrip && name === 'service-strip-scroll');
          })
          .map((animation) => (animation as CSSAnimation).animationName),
      );
      expect(endless, `${route}: still moving after five seconds`).toEqual([]);
    }
  });
});
