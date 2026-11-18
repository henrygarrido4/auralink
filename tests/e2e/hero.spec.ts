import { expect, test, type Locator, type Page } from '@playwright/test';
import { primaryCta } from '../../src/data/site';

/**
 * Home hero (src/components/sections/Hero.astro). Copy and buttons are real HTML, the device image
 * loads eagerly with its space reserved, and the pencil underline under "brings them back" is the
 * only motion on load: drawn once after a short pause, already finished under reduced motion,
 * hidden from assistive technology, and attached to its phrase at every width. The primary
 * button's aura is off and still until the pointer reaches it, takes no room of its own, and never
 * lights under reduced motion.
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
      section.getAnimations({ subtree: true }).map((animation) => ({
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

  test("the primary's aura is still until the pointer reaches it, then circles like the navbar's", async ({
    page,
  }) => {
    await page.goto('/');
    const aura = heroAura(page);
    await expect(aura, 'one aura in the hero, on the primary').toHaveCount(1);
    await expect(aura.getByText(primaryCta.label, { exact: true })).toBeVisible();

    // No lap on load, and no paused animation either: the light is off and nothing moves.
    expect(await auraAnimations(aura)).toEqual([]);
    await expect(aura).toHaveCSS('color', 'rgba(0, 0, 0, 0)');

    if (!(await page.evaluate(() => matchMedia('(hover: hover)').matches))) return;
    await primaryButton(page).hover();
    await expect.poll(async () => (await auraAnimations(aura)).length).toBeGreaterThan(0);
    const hovered = await auraAnimations(aura);
    expect(hovered.every((animation) => animation.playing)).toBe(true);
    // The same endless light as the navbar's, at the same speed and in the same direction.
    const navbar = await auraAnimations(page.getByRole('banner').locator('.aura'));
    const light = (animations: typeof hovered) =>
      animations
        .filter((animation) => animation.name === 'aura')
        .map(({ name, timing }) => ({ name, timing }));
    expect(light(hovered)).toEqual(light(navbar));

    // The pointer leaves: the light goes out at once and nothing is left running or paused.
    await page.mouse.move(0, 400);
    await expect.poll(() => auraAnimations(aura)).toEqual([]);
    await expect(aura).toHaveCSS('color', 'rgba(0, 0, 0, 0)');
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
    expect(await auraAnimations(heroAura(page))).toEqual([]);
    await expect(heroAura(page)).toHaveCSS('color', 'rgba(0, 0, 0, 0)');
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
