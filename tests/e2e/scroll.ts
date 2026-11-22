import type { Locator } from './fixtures';

/**
 * Brings an element into view and waits until it holds still, before the pointer acts on it. In
 * the frame after a scroll the navbar collapses by 16px, and then scroll anchoring takes that back
 * from the offset or, at the page's foot, the shorter page clamps it. A pointer aimed in between
 * misses. A hover ended above a footer link, which faded straight back. In WebKit the adjustment
 * also cancelled the smooth scroll that a link's click had just started (both on a Mac,
 * 2026-11-22). Fonts first, since a late swap re-flows what is above. After 30 frames without
 * agreement it goes on, for the caller's assertions to report.
 */
export async function scrollToRest(target: Locator) {
  await target.page().evaluate(() => document.fonts.ready);
  await target.scrollIntoViewIfNeeded();
  await target.evaluate(
    (el) =>
      new Promise<void>((resolve) => {
        let last = '';
        let agreeing = 0;
        let frames = 0;
        const read = () => {
          const now = `${window.scrollY} ${el.getBoundingClientRect().top}`;
          agreeing = now === last ? agreeing + 1 : 0;
          last = now;
          frames += 1;
          if (agreeing >= 2 || frames >= 30) resolve();
          else requestAnimationFrame(read);
        };
        requestAnimationFrame(read);
      }),
  );
}
