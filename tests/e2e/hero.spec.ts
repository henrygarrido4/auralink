import { expect, test, type Locator, type Page } from '@playwright/test';
import { primaryCta } from '../../src/data/site';

/**
 * Home hero (src/components/sections/Hero.astro). Copy and buttons are real HTML, the device image
 * loads eagerly with its space reserved, and the pencil underline under "brings them back" is the
 * only motion on load: drawn once after a short pause, already finished under reduced motion,
 * hidden from assistive technology, and attached to its phrase at every width. The primary
 * button's aura stays unlit until the pointer reaches it, then fades and circles like the navbar's
 * and resumes where it stopped. It takes no room of its own, and never lights under reduced motion.
 */
const HEADLINE = 'Websites that win customers. Email that brings them back.';

const hero = (page: Page) => page.getByRole('region', { name: HEADLINE });
const underline = (page: Page) => page.getByRole('heading', { level: 1 }).locator('svg');
const primaryButton = (page: Page) => hero(page).getByText(primaryCta.label, { exact: true });
const heroAura = (page: Page) => hero(page).locator('.aura');

/** The animations on an aura and its glow: name, timing, and whether each one plays. */
const auraAnimations = (aura: Locator) =>
  aura.evaluate((el) =>
    el.getAnimations({ subtree: true }).map((animation) => {
      const { duration, easing, direction, iterations } = animation.effect!.getTiming();
      return {
        name: (animation as CSSAnimation).animationName,
        playing: animation.playState === 'running',
        timing: { duration, easing, direction, iterations },
      };
    }),
  );

/**
 * The aura's own spin, not the glow copies, and how strongly the light shines. `time` is where the
 * spin has got to, so a later visit can be checked against it.
 */
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

test('shows the headline, the supporting copy, and both buttons', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(HEADLINE);
  await expect(hero(page).getByText('Web design + lifecycle email')).toBeVisible();
  await expect(
    hero(page).getByText(
      'Custom websites and email journeys that help people find you, choose you, and come back.',
    ),
  ).toBeVisible();

  // The primary button follows the navbar's call to action, link or placeholder alike.
  const primary = hero(page).getByText(primaryCta.label, { exact: true });
  await expect(primary).toBeVisible();
  if (primaryCta.href) await expect(primary).toHaveAttribute('href', primaryCta.href);
  else await expect(primary, 'no destination yet').not.toHaveAttribute('href');

  const about = hero(page).getByRole('link', { name: 'About us' });
  await expect(about).toHaveAttribute('href', '#about');
  await expect(page.locator('#about').getByRole('heading', { level: 2 })).toBeVisible();
});

test('loads the device image eagerly with its space reserved', async ({ page }) => {
  await page.goto('/');
  const image = hero(page).getByRole('img', { name: /laptop and phone/i });
  await expect(image).toHaveAttribute('loading', 'eager');
  await expect(image).toHaveAttribute('fetchpriority', 'high');
  await expect(image).toHaveAttribute('width', /^\d+$/);
  await expect(image).toHaveAttribute('height', /^\d+$/);
  await expect(hero(page).locator('picture source[type="image/avif"]')).toHaveCount(1);
});

test.describe('motion allowed', () => {
  test.use({ reducedMotion: 'no-preference' });

  test('the underline draws once after a short pause and is the only motion', async ({ page }) => {
    await page.goto('/');
    await expect(underline(page)).toHaveAttribute('aria-hidden', 'true');

    const timings = await hero(page).evaluate((section) =>
      section
        .getAnimations({ subtree: true })
        .filter((animation) => animation.playState === 'running')
        .map((animation) => ({
          name: (animation as CSSAnimation).animationName,
          ...animation.effect!.getTiming(),
        })),
    );
    expect(timings, 'the hero runs exactly one animation').toHaveLength(1);
    const [draw] = timings;
    expect(draw.name).toBe('pencil-draw');
    expect(Number(draw.delay)).toBeGreaterThanOrEqual(200);
    expect(Number(draw.delay)).toBeLessThanOrEqual(300);
    expect(Number(draw.duration)).toBeGreaterThanOrEqual(700);
    expect(Number(draw.duration)).toBeLessThanOrEqual(900);
    expect(draw.iterations, 'plays once').toBe(1);

    // Once drawn, the line stays.
    const path = underline(page).locator('path');
    await path.evaluate((el) => Promise.all(el.getAnimations().map((a) => a.finished)));
    await expect(path).toHaveCSS('stroke-dashoffset', '0px');
  });

  test('the buttons change colour without transitions', async ({ page }) => {
    await page.goto('/');
    for (const label of [primaryCta.label, 'About us']) {
      await expect(hero(page).getByText(label, { exact: true })).toHaveCSS(
        'transition-property',
        'none',
      );
    }
  });

  test("the primary's aura fades and circles like the navbar's, and resumes where it stopped", async ({
    page,
  }) => {
    await page.goto('/');
    const aura = heroAura(page);
    await expect(aura, 'one aura in the hero, on the primary').toHaveCount(1);
    await expect(aura.getByText(primaryCta.label, { exact: true })).toBeVisible();

    // No lap on load. The spin is paused and the light is off, ready to continue later.
    const resting = await auraSpin(aura);
    expect(resting.playing, 'nothing moves at rest').toBe(false);
    expect(resting.time, 'the spin is waiting').not.toBeNull();
    expect(resting.strength).toBe('0%');
    // The fade is on the light's strength, in both directions, same as the navbar.
    await expect(aura).toHaveCSS('transition-property', '--aura-light');
    await expect(aura).toHaveCSS('transition-duration', '0.4s');

    if (!(await page.evaluate(() => matchMedia('(hover: hover)').matches))) return;
    await primaryButton(page).hover();
    await expect.poll(async () => (await auraSpin(aura)).strength).toBe('100%');
    await expect.poll(async () => (await auraSpin(aura)).time ?? 0).toBeGreaterThan(200);
    const hovered = await auraAnimations(aura);
    expect(hovered.every((animation) => animation.playing)).toBe(true);
    // The same endless light as the navbar's, at the same speed and in the same direction.
    const navbar = await auraAnimations(page.getByRole('banner').locator('.aura'));
    const light = (animations: typeof hovered) =>
      animations
        .filter((animation) => animation.name === 'aura')
        .map(({ name, timing }) => ({ name, timing }));
    expect(light(hovered)).toEqual(light(navbar));
    const carried = (await auraSpin(aura)).time ?? 0;

    // The pointer leaves: the light fades out and the spin stays paused where it is.
    await page.mouse.move(0, 400);
    await expect.poll(async () => (await auraSpin(aura)).playing).toBe(false);
    const paused = (await auraSpin(aura)).time ?? 0;
    expect(paused, 'the spin did not jump back to the start').toBeGreaterThanOrEqual(carried - 50);
    await expect.poll(async () => (await auraSpin(aura)).strength).toBe('0%');

    // Park the spin at a known angle, then come back: it continues from there and the light fades in.
    await aura.evaluate((el) => {
      for (const animation of el.getAnimations()) {
        if ((animation as CSSAnimation).animationName === 'aura') animation.currentTime = 2500;
      }
    });
    await primaryButton(page).hover();
    const resumed = (await auraSpin(aura)).time ?? 0;
    expect(resumed, 'the spin continues from where it stopped').toBeGreaterThanOrEqual(2400);
    expect(resumed, 'the spin did not start over').toBeLessThan(3500);
    await expect.poll(async () => (await auraSpin(aura)).strength).toBe('100%');
  });
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('shows the finished underline without animating', async ({ page }) => {
    await page.goto('/');
    const path = underline(page).locator('path');
    expect(await path.evaluate((el) => el.getAnimations().length)).toBe(0);
    await expect(path).toHaveCSS('stroke-dashoffset', '0px');
  });

  test("the primary's aura stays off and still, even under the pointer", async ({ page }) => {
    await page.goto('/');
    if (await page.evaluate(() => matchMedia('(hover: hover)').matches)) {
      await primaryButton(page).hover();
    }
    const aura = heroAura(page);
    expect(await auraAnimations(aura)).toEqual([]);
    expect((await auraSpin(aura)).strength).toBe('0%');
  });
});

test("the primary's aura takes no room of its own", async ({ page }) => {
  const measure = async (width: number) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const about = hero(page).getByRole('link', { name: 'About us' });
    const gap = await about.evaluate((el) => {
      const row = getComputedStyle(el.parentElement!);
      return { row: parseFloat(row.rowGap), column: parseFloat(row.columnGap) };
    });
    return {
      primary: (await primaryButton(page).boundingBox())!,
      about: (await about.boundingBox())!,
      gap,
    };
  };

  // Stacked: exactly as wide as About us, with only the row gap between them.
  const stacked = await measure(390);
  expect(stacked.primary.x).toBeCloseTo(stacked.about.x, 1);
  expect(stacked.primary.width).toBeCloseTo(stacked.about.width, 1);
  expect(stacked.about.y - (stacked.primary.y + stacked.primary.height)).toBeCloseTo(
    stacked.gap.row,
    1,
  );

  // Side by side: on the same line, with only the column gap between them.
  const row = await measure(1280);
  expect(row.primary.y).toBeCloseTo(row.about.y, 1);
  expect(row.about.x - (row.primary.x + row.primary.width)).toBeCloseTo(row.gap.column, 1);
});

test('the underline stays attached to its phrase at every width', async ({ page }) => {
  for (const width of [360, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    const geometry = await underline(page).evaluate((svg) => {
      const phrase = svg.parentElement!.getBoundingClientRect();
      const line = svg.querySelector('path')!.getBoundingClientRect();
      const fontSize = parseFloat(getComputedStyle(svg.parentElement!).fontSize);
      return { phrase, line, fontSize, viewport: document.documentElement.clientWidth };
    });
    const { phrase, line, fontSize, viewport } = geometry;
    // Spans the phrase, sits under it (not through the letters), and stays on screen.
    expect(Math.abs(line.left - phrase.left), `${width}px: starts at the phrase`).toBeLessThan(
      0.1 * fontSize,
    );
    expect(Math.abs(line.right - phrase.right), `${width}px: ends at the phrase`).toBeLessThan(
      0.1 * fontSize,
    );
    // Mukta's line box is deeper than the Latin letters, and the stroke is lifted 0.2em into that
    // spare descent. Its rising right end is the top of the box, still below the g.
    expect(line.top, `${width}px: below the letters`).toBeGreaterThan(
      phrase.bottom - 0.25 * fontSize,
    );
    expect(line.bottom, `${width}px: close to the phrase`).toBeLessThan(
      phrase.bottom + 0.3 * fontSize,
    );
    expect(line.right, `${width}px: inside the viewport`).toBeLessThanOrEqual(viewport);
  }
});
