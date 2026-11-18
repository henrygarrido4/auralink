import { expect, test, type Locator, type Page } from '@playwright/test';
import { aboutCta, site } from '../../src/data/site';

/**
 * Home page introduction (src/components/sections/AboutIntro.astro), where the hero's About us
 * button lands. Its copy ends with the primary call to learn more: a link to the About page once
 * `aboutCta.href` is set and a placeholder until then, named for that page by words only assistive
 * technology reads, and spaced and sized like the "Read more" of the Hub2B section it follows. It
 * changes colour at once, and its aura runs nothing until the pointer reaches it.
 */
const HEADING = 'A digital presence built around your goals.';
/** The button's whole text: the visible label, then the hidden words naming its destination. */
const NAME = `${aboutCta.label} about ${site.name}`;

const section = (page: Page) => page.getByRole('region', { name: HEADING });
const button = (page: Page) => section(page).getByText(NAME, { exact: true });

/** How many animations run on an aura and its glow. */
const animationCount = (aura: Locator) =>
  aura.evaluate((el) => el.getAnimations({ subtree: true }).length);

test('the copy ends with the primary call to learn more about the studio', async ({ page }) => {
  await page.goto('/');
  const cta = button(page);
  await expect(cta).toBeVisible();
  await expect(cta, 'the primary button').toHaveClass(/\bbtn-primary\b/);
  if (aboutCta.href) {
    await expect(cta).toHaveAttribute('href', aboutCta.href);
    await expect(section(page).getByRole('link', { name: NAME, exact: true })).toBeVisible();
  } else {
    await expect(cta, 'no destination yet').not.toHaveAttribute('href');
    await expect(section(page).getByRole('link')).toHaveCount(0);
  }

  // Only the label shows: the words after it are for assistive technology and search engines.
  const hidden = (await cta.getByText(`about ${site.name}`).boundingBox())!;
  expect(hidden.width * hidden.height, 'the destination is visually hidden').toBeLessThanOrEqual(1);
});

test('sits under the text and in line with it, spaced and sized as in Hub2B', async ({ page }) => {
  await page.goto('/');
  const text = section(page)
    .getByRole('heading', { level: 2 })
    .locator('xpath=following-sibling::p[1]');
  const [textBox, ctaBox] = [(await text.boundingBox())!, (await button(page).boundingBox())!];
  // Hub2B leaves 32px between its text and "Read more" on phones, and 48px from 768px.
  const gap = page.viewportSize()!.width >= 768 ? 48 : 32;
  expect(ctaBox.y - (textBox.y + textBox.height), 'the space under the text').toBeCloseTo(gap, 0);
  // The aura takes no room of its own, so the button starts where the text does.
  expect(ctaBox.x, 'in line with the text').toBeCloseTo(textBox.x, 1);
  // The large button, as Hub2B's 18px "Read more" in this section.
  await expect(button(page)).toHaveCSS('font-size', '18px');
});

test.describe('motion allowed', () => {
  test.use({ reducedMotion: 'no-preference' });

  test('changes colour at once, and its aura waits for the pointer', async ({ page }) => {
    await page.goto('/');
    const cta = button(page);
    await expect(cta).toHaveCSS('transition-property', 'none');
    const aura = section(page).locator('.aura');
    await expect(aura, 'one aura, on the button').toHaveCount(1);
    expect(await animationCount(aura), 'nothing runs at rest').toBe(0);

    if (!(await page.evaluate(() => matchMedia('(hover: hover)').matches))) return;
    await cta.hover();
    await expect.poll(() => animationCount(aura), 'lit under the pointer').toBeGreaterThan(0);
    await page.mouse.move(0, 400);
    await expect.poll(() => animationCount(aura), 'out once the pointer leaves').toBe(0);
  });
});
