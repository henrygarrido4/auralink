import type { Page } from '@playwright/test';

/**
 * Collects console errors, uncaught page errors, and warnings that indicate a
 * hydration problem. Astro logs island failures as `[astro-island]`; Vue logs
 * `[Vue warn]` (production builds strip most Vue warnings, so a clean console
 * here is necessary but not sufficient proof of correct hydration).
 */
export function watchConsole(page: Page) {
  const errors: string[] = [];
  const hydrationWarnings: string[] = [];
  const otherWarnings: string[] = [];
  page.on('console', (msg) => {
    const text = msg.text();
    if (msg.type() === 'error') errors.push(text);
    else if (msg.type() === 'warning') {
      if (/hydrat|astro-island|\[Vue warn\]/i.test(text)) hydrationWarnings.push(text);
      else otherWarnings.push(text);
    }
  });
  page.on('pageerror', (err) => errors.push(err.message));
  return { errors, hydrationWarnings, otherWarnings };
}
