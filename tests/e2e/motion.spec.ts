import { expect, test } from './fixtures';
import { builtRoutes } from './routes';

/**
 * The global stylesheet switches smooth scrolling off and collapses animation
 * durations under `prefers-reduced-motion: reduce`. These tests prove the
 * media query plumbing works in every engine, and that nothing on a freshly
 * loaded page keeps moving for more than five seconds, except two things on
 * the home page, both the owner's decisions of 2026-11-18, recorded in
 * docs/quality-checks.md: the industry strip, which keeps scrolling and pauses
 * only under the pointer, with no pause button, and the light circling the
 * hero's benefit ring, which never pauses. These tests are not a substitute
 * for checking each future animated component by hand.
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

  test('motion that starts on its own ends within five seconds, except the home industry strip and the hero ring light', async ({
    page,
  }) => {
    // WCAG 2.2.2: motion still running after five seconds needs a way to pause it. Two things on
    // the home page keep going, both the owner's decisions: the industry strip, which pauses under
    // the pointer and has no button (tests/e2e/industry-strip.spec.ts), and the light on the hero's
    // benefit ring, which never pauses (tests/e2e/hero.spec.ts). Everything else has to finish.
    const routes = builtRoutes();
    // One visit per page, so the time grows with the site: 2 seconds per page.
    test.setTimeout(routes.length * 2_000);
    for (const route of routes) {
      await page.goto(route);
      const endless = await page.evaluate(() =>
        document
          .getAnimations()
          .filter((animation) => animation.playState === 'running')
          // Only motion that runs on the clock. A scroll-driven animation (the navbar's collapse,
          // `animation-timeline: scroll()`) moves as far as the visitor scrolls and no further, so
          // it is not motion that starts on its own. Its timing is a share of the scroll range:
          // a percentage in Chromium and WebKit, and in Firefox milliseconds of a notional 100 s
          // timeline, which on a short page reads as longer than five seconds.
          .filter((animation) => animation.timeline === document.timeline)
          .filter((animation) => Number(animation.effect?.getComputedTiming().endTime) > 5000)
          .filter((animation) => {
            const target = (animation.effect as KeyframeEffect | null)?.target ?? null;
            const name = (animation as CSSAnimation).animationName;
            const inStrip = target instanceof Element && !!target.closest('[data-industry-strip]');
            const ringLight = target instanceof Element && target.matches('[data-orbit-light]');
            return (
              !(inStrip && name === 'industry-strip-scroll') &&
              !(ringLight && name === 'orbit-light')
            );
          })
          .map((animation) => (animation as CSSAnimation).animationName),
      );
      expect(endless, `${route}: still moving after five seconds`).toEqual([]);
    }
  });
});
