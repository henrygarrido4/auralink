import { expect, test } from './fixtures';
import { watchConsole } from './console';

/** WebKit mirrors Safari: plain Tab skips links; Option+Tab (Alt+Tab) reaches them. */
const tabKey = (browserName: string) => (browserName === 'webkit' ? 'Alt+Tab' : 'Tab');

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

test.describe('home page', () => {
  test('renders with the expected document basics', async ({ page }) => {
    const watched = watchConsole(page);

    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
    await expect(
      page.locator('astro-dev-toolbar'),
      'tests must run against a production build (astro preview), not astro dev',
    ).toHaveCount(0);

    await expect(page).toHaveTitle(/Auralink Studio/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Your business works hard. Your website should, too.',
    );
    await expect(page.locator('main#main-content')).toBeVisible();

    expect(watched.errors, 'no console or page errors').toEqual([]);
    expect(watched.hydrationWarnings, 'no hydration warnings').toEqual([]);
    if (watched.otherWarnings.length) {
      test.info().annotations.push({
        type: 'console-warnings',
        description: watched.otherWarnings.join('\n'),
      });
    }
  });

  test('stays light whatever colour scheme the device prefers', async ({ page }) => {
    const render = async (colorScheme: 'light' | 'dark') => {
      // Reduced motion stops the call to action's aura, so colours do not depend on read timing.
      await page.emulateMedia({ colorScheme, reducedMotion: 'reduce' });
      await page.goto('/');
      return page.evaluate(() => {
        const schemeQueries: string[] = [];
        const visit = (rules: CSSRuleList) => {
          for (const rule of Array.from(rules)) {
            if (rule instanceof CSSMediaRule && /prefers-color-scheme/.test(rule.media.mediaText)) {
              schemeQueries.push(rule.media.mediaText);
            }
            if ('cssRules' in rule) visit((rule as CSSGroupingRule).cssRules);
          }
        };
        for (const sheet of Array.from(document.styleSheets)) visit(sheet.cssRules);

        const props = [
          'color',
          'background-color',
          'background-image',
          'border-top-color',
          'outline-color',
          'box-shadow',
          'fill',
          'stroke',
        ];
        const root = document.documentElement;
        return {
          prefersDark: matchMedia('(prefers-color-scheme: dark)').matches,
          theme: root.getAttribute('data-theme'),
          meta: document.querySelector('meta[name="color-scheme"]')?.getAttribute('content'),
          // Engines may order the keywords differently ("light only", "only light").
          colorScheme: getComputedStyle(root).colorScheme.split(' ').sort().join(' '),
          schemeQueries,
          colours: Array.from(document.querySelectorAll('*'), (el) => {
            const style = getComputedStyle(el);
            const values = props.map((prop) => style.getPropertyValue(prop)).join(' / ');
            return `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ''}: ${values}`;
          }),
        };
      });
    };

    const light = await render('light');
    const dark = await render('dark');
    expect([light.prefersDark, dark.prefersDark], 'colour-scheme emulation applied').toEqual([
      false,
      true,
    ]);
    for (const state of [light, dark]) {
      expect(state.theme, 'daisyUI theme set on <html>').toBe('light');
      expect(state.meta, 'color-scheme meta tag').toBe('only light');
      expect(state.colorScheme, 'light controls, opted out of forced dark').toBe('light only');
      expect(state.schemeQueries, 'no stylesheet rule follows the device scheme').toEqual([]);
    }
    expect(dark.colours, 'every element keeps its light colours').toEqual(light.colours);
  });

  test('skip link is the first tab stop and moves focus to the main content', async ({
    page,
    browserName,
  }) => {
    await page.goto('/');
    await page.keyboard.press(tabKey(browserName));
    const skipLink = page.getByRole('link', { name: /skip to main content/i });
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toBeVisible();
    await skipLink.press('Enter');
    await expect(page.locator('main#main-content')).toBeFocused();
  });

  test('tab order reaches every interactive control in DOM order, with no trap', async ({
    page,
    browserName,
  }) => {
    await page.goto('/');
    const expected = await page.locator(FOCUSABLE).evaluateAll((elements) =>
      elements
        // Rendered and visible: invisible content (a filter panel not chosen) takes no focus.
        .filter(
          (el) => el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden',
        )
        // A radio group is one tab stop, its checked radio (or its first, when none is); the
        // arrow keys move within it.
        .filter((el) => {
          if (!(el instanceof HTMLInputElement) || el.type !== 'radio' || !el.name) return true;
          const group = Array.from(
            document.querySelectorAll<HTMLInputElement>(
              `input[type="radio"][name="${CSS.escape(el.name)}"]`,
            ),
          );
          return el === (group.find((radio) => radio.checked) ?? group[0]);
        })
        .map(
          (el) =>
            `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ''}:${(el.textContent ?? '').trim().slice(0, 40)}`,
        ),
    );
    expect(expected.length, 'the page has at least one interactive control').toBeGreaterThan(0);

    const visited: string[] = [];
    for (let i = 0; i < expected.length + 1; i += 1) {
      await page.keyboard.press(tabKey(browserName));
      visited.push(
        await page.evaluate(() => {
          const el = document.activeElement;
          if (!el || el === document.body) return 'body';
          return `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ''}:${(el.textContent ?? '').trim().slice(0, 40)}`;
        }),
      );
    }
    expect(visited.slice(0, expected.length), 'tab order matches DOM order').toEqual(expected);
    // After the last control focus either leaves the document or wraps to the first control.
    expect(
      visited[expected.length] === 'body' || visited[expected.length] === expected[0],
      `no focus trap after the last control (landed on ${visited[expected.length]})`,
    ).toBe(true);
  });
});
