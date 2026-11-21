import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator, type Page } from './fixtures';
import { contactRoutes, primaryCta, primaryNav } from '../../src/data/site';

/**
 * Site navbar (src/components/sections/Navbar.astro). The viewport is set per
 * group, so every project in the matrix checks both layouts: the full bar at
 * desktop width and the menu dialog it collapses into below the lg breakpoint.
 * Labels and targets come from src/data/site.ts, the same source the navbar reads.
 */
const labels = primaryNav.map((item) => item.label);

const menuDialog = (page: Page) => page.getByRole('dialog', { name: 'Site menu' });
const menuButton = (page: Page) => page.getByRole('button', { name: 'Open menu' });

async function openMenu(page: Page) {
  await page.goto('/');
  await menuButton(page).click();
  await expect(menuDialog(page)).toBeVisible();
  // Let the slide-in finish so later steps act on a settled panel. Only the dialog and its panel
  // count: the call to action's aura keeps a paused animation ready for hover, which never finishes.
  await menuDialog(page).evaluate((dialog) =>
    Promise.all(
      [dialog, ...dialog.children]
        .flatMap((element) => element.getAnimations())
        .map((animation) => animation.finished),
    ),
  );
}

/** End times in ms of the animations playing on an element; Infinity for an endless one. */
const playingUntil = (element: Locator) =>
  element.evaluate((el) =>
    el
      .getAnimations()
      .filter((animation) => animation.playState === 'running')
      .map((animation) => Number(animation.effect?.getComputedTiming().endTime)),
  );

/** Bar and logo heights in CSS pixels. The dialog's logo is outside `header`, so it is not included. */
const navbarSizes = (page: Page) =>
  page.evaluate(() => {
    const bar = document.querySelector('header .navbar');
    const logo = document.querySelector('header .navbar svg');
    const link = document.querySelector('header nav a');
    return {
      bar: bar?.getBoundingClientRect().height ?? 0,
      logo: logo?.getBoundingClientRect().height ?? 0,
      link: link ? Number.parseFloat(getComputedStyle(link).fontSize) : 0,
      pad: Number.parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop),
    };
  });

const scrollTo = (page: Page, top: number) =>
  page.evaluate(async (y) => {
    const { scrollingElement } = document;
    const root =
      scrollingElement instanceof HTMLElement ? scrollingElement : document.documentElement;
    const previous = root.style.scrollBehavior;
    // The page smooth-scrolls. Hold `auto` across the jump and the frames that follow, or the
    // ease is still running when the bar is measured and the logo is caught mid-shrink.
    root.style.scrollBehavior = 'auto';
    root.scrollTop = y;
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    root.style.scrollBehavior = previous;
    return window.scrollY;
  }, top);

test.describe('navbar at desktop width', () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test('shows the logo, every navigation entry, and the call to action', async ({ page }) => {
    await page.goto('/');
    const banner = page.getByRole('banner');
    await expect(banner.getByRole('link', { name: /Auralink Studio home/i })).toHaveAttribute(
      'href',
      '/',
    );

    const nav = banner.getByRole('navigation', { name: 'Primary' });
    await expect(nav.getByRole('listitem')).toHaveText(labels);
    await expect(nav.locator('[aria-current="page"]')).toHaveAttribute('href', '/');
    await expect(banner.getByRole('link', { name: primaryCta.label, exact: true })).toHaveAttribute(
      'href',
      contactRoutes.page,
    );
    await expect(menuButton(page)).toBeHidden();
  });

  test('the logo and the bar shrink from their designed size over the first 100px of scroll, then grow back', async ({
    page,
  }) => {
    await page.goto('/');
    const supported = await page.evaluate(() =>
      CSS.supports('(animation-timeline: scroll()) and (animation-range: 0% 100%)'),
    );
    test.skip(!supported, 'this engine has no scroll-driven animations');

    const resting = await navbarSizes(page);
    expect(resting.bar, 'bar starts at its designed 5rem').toBeGreaterThan(78);
    expect(resting.bar).toBeLessThan(82);
    expect(resting.logo, 'logo starts at its designed 3rem, no larger').toBeGreaterThan(46);
    expect(resting.logo).toBeLessThan(50);
    expect(resting.pad, 'focused content clears the bar').toBeGreaterThan(78);

    const linkSize = resting.link;
    const midY = await scrollTo(page, 50);
    const mid = await navbarSizes(page);
    expect(midY, 'partway down the range').toBeGreaterThan(20);
    expect(midY).toBeLessThan(80);
    expect(mid.logo, 'the logo is between its two sizes').toBeGreaterThan(40);
    expect(mid.logo).toBeLessThan(resting.logo);
    expect(mid.bar).toBeGreaterThan(64);
    expect(mid.bar).toBeLessThan(resting.bar);
    expect(mid.link, 'the links do not shrink').toBe(linkSize);

    // Shrinking the bar gives a little of the scroll back, so the jump overshoots 100px.
    expect(await scrollTo(page, 160), 'past the end of the range').toBeGreaterThanOrEqual(100);
    const shut = await navbarSizes(page);
    expect(shut.bar, 'scrolled bar is 4rem').toBeGreaterThan(62);
    expect(shut.bar).toBeLessThan(66);
    expect(shut.logo, 'scrolled logo is 2.5rem').toBeGreaterThan(38);
    expect(shut.logo).toBeLessThan(42);
    expect(shut.pad, 'focus clearance stays at the taller bar').toBeGreaterThan(78);
    expect(shut.pad).toBeLessThan(82);

    expect(await scrollTo(page, 0), 'scrolled back to the top').toBe(0);
    const again = await navbarSizes(page);
    expect(again.logo, 'scrolling back restores the logo').toBeGreaterThan(46);
    expect(again.logo).toBeLessThan(50);
    expect(again.bar).toBeGreaterThan(78);
    expect(again.bar).toBeLessThan(82);
  });

  test('links only the entries whose pages exist', async ({ page }) => {
    await page.goto('/');
    const nav = page.getByRole('banner').getByRole('navigation', { name: 'Primary' });
    for (const item of primaryNav) {
      const link = nav.getByRole('link', { name: item.label, exact: true });
      if (item.href) await expect(link).toHaveAttribute('href', item.href);
      else await expect(link, `${item.label} has no page yet`).toHaveCount(0);
    }
  });

  test("the call to action's aura stops after one lap and runs again under the pointer", async ({
    page,
  }) => {
    await page.goto('/');
    const banner = page.getByRole('banner');
    const aura = banner.locator('.aura');

    // WCAG 2.2.2: motion that starts on its own has to end within five seconds.
    const onLoad = await playingUntil(aura);
    expect(onLoad, 'the lap plays on load').not.toHaveLength(0);
    expect(Math.max(...onLoad), 'the lap ends on its own').toBeLessThanOrEqual(5000);

    // The endless light is the visitor's doing: it runs under the pointer and pauses without it.
    if (!(await page.evaluate(() => matchMedia('(hover: hover)').matches))) return;
    await banner.getByText(primaryCta.label, { exact: true }).hover();
    await expect.poll(() => playingUntil(aura)).toContain(Infinity);
    await page.mouse.move(0, 400);
    await expect.poll(() => playingUntil(aura)).not.toContain(Infinity);
  });

  test("the call to action's light fades through its strength, never its colour", async ({
    page,
  }) => {
    // When the pointer leaves, the light stops and fades. A fade of `color` changes only the
    // gradient's currentColor, which Safari without WebKit's fix of 2026-10-09 never repaints: the
    // light stayed on. Playwright's WebKit has that fix, so this checks the mechanism instead (see
    // `aura-lap` in src/styles/global.css).
    await page.goto('/');
    if (!(await page.evaluate(() => matchMedia('(hover: hover)').matches))) return;
    const banner = page.getByRole('banner');
    const aura = banner.locator('.aura');
    const light = () =>
      aura.evaluate((el) => {
        const style = getComputedStyle(el);
        return { strength: style.getPropertyValue('--aura-light'), colour: style.color };
      });

    // Skip the lap, which also moves the strength.
    await aura.evaluate((el) =>
      el.getAnimations({ subtree: true }).forEach((animation) => {
        if ((animation as CSSAnimation).animationName === 'aura-lap') animation.finish();
      }),
    );
    const unlit = await light();
    expect(unlit.strength).toBe('0%');

    await banner.getByText(primaryCta.label, { exact: true }).hover();
    await expect.poll(light).toEqual({ ...unlit, strength: '100%' });
    await page.mouse.move(0, 400);
    await expect.poll(light).toEqual(unlit);
  });
});

test.describe('navbar below the desktop breakpoint', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('collapses the links into a menu button', async ({ page }) => {
    await page.goto('/');
    await expect(menuButton(page)).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Primary' })).toBeHidden();
    await expect(menuDialog(page)).toBeHidden();
  });

  test('opens the menu from the keyboard and Escape returns focus to the button', async ({
    page,
  }) => {
    await page.goto('/');
    await menuButton(page).focus();
    await page.keyboard.press('Enter');

    const dialog = menuDialog(page);
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Close menu' })).toBeFocused();
    await expect(dialog.getByRole('listitem')).toHaveText(labels);
    await expect(dialog.getByRole('link', { name: primaryCta.label, exact: true })).toHaveAttribute(
      'href',
      contactRoutes.page,
    );

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(menuButton(page)).toBeFocused();
  });

  test('closes from the close button and returns focus to the menu button', async ({ page }) => {
    await openMenu(page);
    await menuDialog(page).getByRole('button', { name: 'Close menu' }).click();
    await expect(menuDialog(page)).toBeHidden();
    await expect(menuButton(page)).toBeFocused();
  });

  test('closes when the viewport grows to the desktop layout', async ({ page }) => {
    await openMenu(page);
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(menuDialog(page)).toBeHidden();
    await expect(page.getByRole('navigation', { name: 'Primary' })).toBeVisible();
  });

  test('the open menu passes automated WCAG 2.2 AA checks', async ({ page }) => {
    await openMenu(page);
    const results = await new AxeBuilder({ page })
      .include('#site-menu')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    const summary = results.violations.map(
      (v) =>
        `${v.id} (${v.impact}): ${v.help} -> ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`,
    );
    expect(summary, 'menu dialog accessibility violations').toEqual([]);
  });
});

test.describe('navbar with reduced motion', () => {
  test.use({ reducedMotion: 'reduce', viewport: { width: 1280, height: 720 } });

  test('keeps the compact logo and bar at the top of the page', async ({ page }) => {
    await page.goto('/');
    const size = await navbarSizes(page);
    expect(size.bar, 'stays at the designed size when motion is reduced').toBeGreaterThan(78);
    expect(size.bar).toBeLessThan(82);
    expect(size.logo).toBeGreaterThan(46);
    expect(size.logo).toBeLessThan(50);
    expect(size.pad).toBeGreaterThan(78);
    expect(size.pad).toBeLessThan(82);
  });
});

test.describe('navbar at tablet width', () => {
  test.use({ viewport: { width: 768, height: 1024 } });

  test('closes the menu when the scrim beside the panel is clicked', async ({ page }) => {
    await openMenu(page);
    // The panel is 28rem wide on the right; the left edge of the viewport is scrim.
    await page.mouse.click(40, 512);
    await expect(menuDialog(page)).toBeHidden();
  });
});
