import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator, type Page } from '@playwright/test';
import { primaryCta, primaryNav } from '../../src/data/site';

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
    await expect(banner.getByText(primaryCta.label, { exact: true })).toBeVisible();
    await expect(menuButton(page)).toBeHidden();
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
    await expect(dialog.getByText(primaryCta.label, { exact: true })).toBeVisible();

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

test.describe('navbar at tablet width', () => {
  test.use({ viewport: { width: 768, height: 1024 } });

  test('closes the menu when the scrim beside the panel is clicked', async ({ page }) => {
    await openMenu(page);
    // The panel is 28rem wide on the right; the left edge of the viewport is scrim.
    await page.mouse.click(40, 512);
    await expect(menuDialog(page)).toBeHidden();
  });
});
