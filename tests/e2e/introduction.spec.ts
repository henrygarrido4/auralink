import { expect, test, type Locator, type Page } from '@playwright/test';
import { aboutCta, aboutHighlights, owner, site } from '../../src/data/site';

/**
 * Home page introduction (src/components/sections/AboutIntro.astro), where the hero's About us
 * button lands. It closes the home page, after the process. The portrait keeps the Hub2B
 * treatment the owner preferred (2026-11-20): on a primary frame the photo's own size, offset
 * down and right by the room made for it, with a name card over the photo's lower right corner
 * once `owner.name` is set. Beside it, after the owner's reference (2026-11-20), the copy, the
 * six `aboutHighlights` in two columns from sm (each a decorative mark, an h3, and one sentence),
 * and the primary call to learn more: a link to the About page once `aboutCta.href` is set and a
 * placeholder until then, named for that page by words only assistive technology reads, 32px
 * under the points on phones and 48px from 768px, with an 18px label. It changes colour at once,
 * and its aura stays unlit until the pointer reaches it, then fades out and resumes where it
 * stopped. From lg the portrait sits left of the copy; below, the copy comes first.
 */
const HEADING = 'A digital presence built around your goals.';
/** The button's whole text: the visible label, then the hidden words naming its destination. */
const NAME = `${aboutCta.label} about ${site.name}`;

const section = (page: Page) => page.getByRole('region', { name: HEADING });
const button = (page: Page) => section(page).getByText(NAME, { exact: true });
const points = (page: Page) => section(page).locator('[data-about-points]');

test('follows the process, before the closing contact banner', async ({ page }) => {
  await page.goto('/');
  const order = await page.evaluate(() =>
    [...document.querySelectorAll('main > section')].map((section) => section.id),
  );
  expect(order.slice(-3)).toEqual(['process', 'about', 'project-contact']);
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

test('makes six points after the paragraph, each a mark, a title, and one sentence', async ({
  page,
}) => {
  await page.goto('/');
  const list = points(page);
  const items = list.getByRole('listitem');
  await expect(items).toHaveCount(aboutHighlights.length);
  for (const [index, point] of aboutHighlights.entries()) {
    const item = items.nth(index);
    await expect(item.getByRole('heading', { level: 3 })).toHaveText(point.title);
    await expect(item.getByText(point.description, { exact: true })).toBeVisible();
    const mark = item.locator('span[aria-hidden="true"]');
    await expect(mark, 'one decorative mark').toHaveCount(1);
    await expect(mark.locator('svg')).toHaveAttribute('aria-hidden', 'true');
  }
  // The paragraph comes first, then the points, then the button.
  const paragraph = section(page)
    .getByRole('heading', { level: 2 })
    .locator('xpath=following-sibling::p[1]');
  const [paragraphBox, listBox, buttonBox] = await Promise.all([
    paragraph.boundingBox(),
    list.boundingBox(),
    button(page).boundingBox(),
  ]);
  expect(listBox!.y).toBeGreaterThan(paragraphBox!.y + paragraphBox!.height);
  expect(buttonBox!.y).toBeGreaterThan(listBox!.y + listBox!.height);

  // Two columns from sm (640px), one below.
  const rows = await items.evaluateAll((els) =>
    els.map((el) => Math.round(el.getBoundingClientRect().y)),
  );
  const columns = page.viewportSize()!.width >= 640 ? 2 : 1;
  expect(new Set(rows).size, `${columns} column(s)`).toBe(aboutHighlights.length / columns);
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

test('sits under the points and in line with them, spaced and sized as in the reference', async ({
  page,
}) => {
  await page.goto('/');
  const [listBox, ctaBox] = [
    (await points(page).boundingBox())!,
    (await button(page).boundingBox())!,
  ];
  // 32px between the points and the button on phones, and 48px from 768px.
  const gap = page.viewportSize()!.width >= 768 ? 48 : 32;
  expect(ctaBox.y - (listBox.y + listBox.height), 'the space under the points').toBeCloseTo(gap, 0);
  // The aura takes no room of its own, so the button starts where the points do.
  expect(ctaBox.x, 'in line with the points').toBeCloseTo(listBox.x, 1);
  // The large button, as the reference's call to action in this section.
  await expect(button(page)).toHaveCSS('font-size', '18px');
});

test('the portrait sits on a primary frame offset down and right, and names the owner only once confirmed', async ({
  page,
}) => {
  await page.goto('/');
  const photo = section(page).locator('picture img');
  await expect(photo).toHaveCount(1);
  await expect(photo).toHaveAttribute('loading', 'lazy');
  await expect(photo).toHaveCSS('border-radius', '0px');

  const frame = section(page).locator('[data-photo-frame]');
  await expect(frame).toHaveCount(1);
  await expect(frame).toHaveAttribute('aria-hidden', 'true');
  const yellow = await page.evaluate(() => {
    const probe = document.createElement('i');
    probe.style.borderColor = 'var(--color-primary)';
    document.body.append(probe);
    const computed = getComputedStyle(probe).borderTopColor;
    probe.remove();
    return computed;
  });
  await expect(frame).toHaveCSS('border-top-color', yellow);
  // 6px below lg, 8px from lg.
  await expect(frame).toHaveCSS(
    'border-top-width',
    page.viewportSize()!.width >= 1024 ? '8px' : '6px',
  );
  // The frame is the photo's size, moved down and right by the same distance (the room made for
  // it), so it shows along the photo's right and bottom edges only.
  const [photoBox, frameBox] = [(await photo.boundingBox())!, (await frame.boundingBox())!];
  const offset = frameBox.x - photoBox.x;
  expect(offset, 'moved right').toBeGreaterThan(0);
  expect(frameBox.y - photoBox.y, 'moved down by the same distance').toBeCloseTo(offset, 0);
  expect(frameBox.width, "the photo's width").toBeCloseTo(photoBox.width, 0);
  expect(frameBox.height, "the photo's height").toBeCloseTo(photoBox.height, 0);

  const card = section(page).locator('[data-owner-card]');
  if (owner.name) {
    await expect(card).toHaveCount(1);
    await expect(card).toContainText(owner.name);
    if (owner.role) await expect(card).toContainText(owner.role);
    await expect(card.locator('svg'), 'the mark is decorative').toHaveCount(1);
    await expect(card.locator('[aria-hidden="true"] svg')).toHaveCount(1);
    const [photoBox, cardBox] = [(await photo.boundingBox())!, (await card.boundingBox())!];
    expect(cardBox.x, 'inside the photo').toBeGreaterThan(photoBox.x);
    expect(cardBox.x + cardBox.width).toBeLessThanOrEqual(photoBox.x + photoBox.width + 0.5);
    expect(cardBox.y + cardBox.height).toBeLessThanOrEqual(photoBox.y + photoBox.height + 0.5);
    expect(cardBox.y, 'over the lower half').toBeGreaterThan(photoBox.y + photoBox.height / 2);
  } else {
    await expect(card, 'no name card until the owner confirms the name').toHaveCount(0);
    await expect(section(page).locator('picture ~ *'), 'nothing over the photo').toHaveCount(0);
  }
});

test('the portrait sits left of the copy from lg and follows it below', async ({ page }) => {
  await page.goto('/');
  const photo = section(page).locator('picture');
  const heading = section(page).getByRole('heading', { level: 2 });
  for (const width of [1440, 1024]) {
    await page.setViewportSize({ width, height: 900 });
    const [photoBox, headingBox] = [(await photo.boundingBox())!, (await heading.boundingBox())!];
    expect(photoBox.x + photoBox.width, `${width}: the photo is left of the copy`).toBeLessThan(
      headingBox.x,
    );
  }
  await page.setViewportSize({ width: 390, height: 844 });
  const [photoBox, buttonBox] = [(await photo.boundingBox())!, (await button(page).boundingBox())!];
  expect(photoBox.y, '390: the photo follows the button').toBeGreaterThan(
    buttonBox.y + buttonBox.height,
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    ),
    'no sideways scroll at 390',
  ).toBeLessThanOrEqual(1);
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
