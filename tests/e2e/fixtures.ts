import { test as base } from '@playwright/test';

export { expect } from '@playwright/test';
export type { Locator, Page } from '@playwright/test';

/** Google Tag Manager's container script, which every page's head loads (`BaseLayout.astro`). */
const TAG_MANAGER = 'https://www.googletagmanager.com/**';

/**
 * The suite's `test`: every spec imports it from here, not from `@playwright/test`, so that each
 * browser context answers Google Tag Manager's requests itself, with an empty script. Google is
 * never reached from a test: no tag fires, no page view from a test run lands in the owner's
 * analytics, and no test waits on, or depends on, Google's servers. The page is otherwise what a
 * visitor gets, the snippet included (`dataLayer` exists and holds its `gtag('js')` push).
 *
 * A context a test makes for itself from `browser` is not covered; route it the same way.
 */
export const test = base.extend({
  context: async ({ context }, use) => {
    await context.route(TAG_MANAGER, (route) =>
      route.fulfill({ status: 200, contentType: 'application/javascript', body: '' }),
    );
    await use(context);
  },
});
