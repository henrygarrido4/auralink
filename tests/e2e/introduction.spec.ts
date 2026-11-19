import { expect, test, type Locator, type Page } from '@playwright/test';
import { aboutCta, site } from '../../src/data/site';

/**
 * Home page introduction (src/components/sections/AboutIntro.astro), where the hero's About us
 * button lands. It closes the home page, after the process. Its copy ends with the primary call
 * to learn more: a link to the About page once `aboutCta.href` is set and a placeholder until
 * then, named for that page by words only assistive technology reads, and spaced and sized like
 * the "Read more" of the Hub2B section it follows. It changes colour at once, and its aura stays
 * unlit until the pointer reaches it, then fades out and resumes where it stopped.
 */
const HEADING = 'A digital presence built around your goals.';
/** The button's whole text: the visible label, then the hidden words naming its destination. */
const NAME = `${aboutCta.label} about ${site.name}`;

const section = (page: Page) => page.getByRole('region', { name: HEADING });
const button = (page: Page) => section(page).getByText(NAME, { exact: true });

test('closes the home page, after the process', async ({ page }) => {
  await page.goto('/');
  const order = await page.evaluate(() =>
    [...document.querySelectorAll('main > section')].map((section) => section.id),
  );
  expect(order.at(-1)).toBe('about');
  expect(order.at(-2)).toBe('process');
});

/** The aura's own spin, not the glow copies, and how strongly the light shines. */
const auraSpin = (aura: Locator) =>
  aura.evaluate((el) => {
    const spin = el.getAnimations().find((animation) => {
      const effect = animation.effect as KeyframeEffect | null;
      return (animation as CSSAnimation).animationName === 'aura' && !effect?.pseudoElement;
    });
    return {
      playing: spin?.playState === 'running',
      time: spin ? Number(spin.currentTime) : null,
      strength: getComputedStyle(el).getPropertyValue('--aura-light').trim(),
    };
  });

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

  test('changes colour at once, and its aura fades and resumes', async ({ page }) => {
    await page.goto('/');
    const cta = button(page);
    await expect(cta).toHaveCSS('transition-property', 'none');
    const aura = section(page).locator('.aura');
    await expect(aura, 'one aura, on the button').toHaveCount(1);
    const resting = await auraSpin(aura);
    expect(resting.playing, 'nothing runs at rest').toBe(false);
    expect(resting.strength).toBe('0%');
    await expect(aura).toHaveCSS('transition-property', '--aura-light');
    await expect(aura).toHaveCSS('transition-duration', '0.4s');

    if (!(await page.evaluate(() => matchMedia('(hover: hover)').matches))) return;
    await cta.hover();
    await expect
      .poll(async () => (await auraSpin(aura)).playing, 'lit under the pointer')
      .toBe(true);
    await expect.poll(async () => (await auraSpin(aura)).time ?? 0).toBeGreaterThan(200);
    const carried = (await auraSpin(aura)).time ?? 0;
    await page.mouse.move(0, 400);
    await expect
      .poll(async () => (await auraSpin(aura)).playing, 'paused once the pointer leaves')
      .toBe(false);
    const paused = (await auraSpin(aura)).time ?? 0;
    expect(paused, 'the spin holds its place').toBeGreaterThanOrEqual(carried - 50);
    await expect.poll(async () => (await auraSpin(aura)).strength).toBe('0%');
    await aura.evaluate((el) => {
      for (const animation of el.getAnimations()) {
        if ((animation as CSSAnimation).animationName === 'aura') animation.currentTime = 2500;
      }
    });
    await cta.hover();
    const resumed = (await auraSpin(aura)).time ?? 0;
    expect(resumed, 'the spin continues from where it stopped').toBeGreaterThanOrEqual(2400);
    expect(resumed, 'the spin did not start over').toBeLessThan(3500);
  });
});
