import { expect, test, type Page } from './fixtures';
import { aboutCta, aboutHighlights, basedIn, owner, site } from '../../src/data/site';

/**
 * Home page introduction (src/components/sections/AboutIntro.astro). It follows the process and
 * precedes the selected work (since 2026-11-21) and the closing contact banner. The portrait
 * keeps the Hub2B
 * treatment the owner preferred (2026-11-20): on a primary frame the photo's own size, offset
 * down and right by the room made for it, with a name card over the photo's lower right corner
 * once `owner.name` is set: the name and the city under it. Beside it, after the owner's reference (2026-11-20), the copy, the
 * six `aboutHighlights` in two columns from sm (each a decorative mark, an h3, and one sentence),
 * and the outlined secondary link to the About page, the near-black outline the hero's "About us"
 * had until the hero turned near-black (2026-11-22): a link
 * once `aboutCta.href` is set and a placeholder until then, labelled with where it leads, 32px
 * under the points on phones and 48px from 768px, with an 18px label. It changes colour at once
 * and has no border light. From lg the portrait sits left of the copy; below, the copy comes
 * first. Since 2026-11-22 the copy is the owner's, in the first person: the heading, and a
 * paragraph that gives the owner's name, the studio, and the city.
 */
const HEADING = 'Meet the developer behind your website.';

const section = (page: Page) => page.getByRole('region', { name: HEADING });
const button = (page: Page) => section(page).getByText(aboutCta.label, { exact: true });
const points = (page: Page) => section(page).locator('[data-about-points]');

test('follows the process, before the selected work and the closing contact banner', async ({
  page,
}) => {
  await page.goto('/');
  const order = await page.evaluate(() =>
    [...document.querySelectorAll('main > section')].map((section) => section.id),
  );
  expect(order.slice(-4)).toEqual(['process', 'about', 'work', 'project-contact']);
});

test('speaks in the first person: the heading, then who, which studio, and where', async ({
  page,
}) => {
  await page.goto('/');
  const heading = section(page).getByRole('heading', { level: 2 });
  await expect(heading.locator(':scope > span')).toHaveText([
    'Meet the developer',
    'behind your website.',
  ]);
  // The owner's copy of 2026-11-22, with the city the owner gave that day (`businessLocation`),
  // said here, above the projects.
  const paragraph = heading.locator('xpath=following-sibling::p[1]');
  const opening = owner.name
    ? `I'm ${owner.name}, founder of ${site.name} in ${basedIn}.`
    : `I'm the founder of ${site.name} in ${basedIn}.`;
  await expect(paragraph).toHaveText(
    `${opening} I design and build websites that help customers understand what you offer, see the quality of your work, and take the next step. That might mean booking an appointment, requesting a quote, or picking up the phone.`,
  );
  expect(basedIn).toBe('Houston, Texas');
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

  // Two columns from sm (640px), one below. One `evaluate` on the list, not `evaluateAll` on the
  // items: Playwright's Firefox crashes the page on `evaluateAll` inside a region found by its
  // name once that region has been queried (`.cursor/rules/testing-playwright.mdc`, engine notes).
  const rows = await list.evaluate((el) =>
    [...el.querySelectorAll(':scope > li')].map((item) =>
      Math.round(item.getBoundingClientRect().y),
    ),
  );
  const columns = page.viewportSize()!.width >= 640 ? 2 : 1;
  expect(new Set(rows).size, `${columns} column(s)`).toBe(aboutHighlights.length / columns);
});

test('the copy ends with the outlined link to more about the studio', async ({ page }) => {
  await page.goto('/');
  const cta = button(page);
  await expect(cta).toBeVisible();
  await expect(cta, 'the outlined secondary button').toHaveClass(/\bbtn-secondary\b/);
  await expect(cta).toHaveClass(/\bbtn-outline\b/);
  await expect(section(page).locator('.aura'), 'no border light').toHaveCount(0);
  await expect(cta).toHaveCSS('transition-property', 'none');
  // The secondary outline: transparent, with a near-black label and 1px border. (The hero's
  // "About us", once the model here, is its mirror for the near-black band since 2026-11-22.)
  const look = (element: HTMLElement) => {
    const style = getComputedStyle(element);
    return {
      color: style.color,
      backgroundColor: style.backgroundColor,
      borderTopColor: style.borderTopColor,
      borderTopWidth: style.borderTopWidth,
    };
  };
  const secondary = await page.evaluate(() => {
    const probe = document.createElement('i');
    document.body.append(probe);
    const resolve = (value: string) => {
      probe.style.color = value;
      return getComputedStyle(probe).color;
    };
    const colours = { ink: resolve('var(--color-secondary)'), none: resolve('transparent') };
    probe.remove();
    return colours;
  });
  expect(await cta.evaluate(look)).toEqual({
    color: secondary.ink,
    backgroundColor: secondary.none,
    borderTopColor: secondary.ink,
    borderTopWidth: '1px',
  });
  if (aboutCta.href) {
    await expect(cta).toHaveAttribute('href', aboutCta.href);
    // The label names where it leads (the owner, 2026-11-22), so the link needs no hidden words.
    await expect(
      section(page).getByRole('link', { name: aboutCta.label, exact: true }),
    ).toBeVisible();
    await expect(cta.locator('.sr-only'), 'no hidden words').toHaveCount(0);
  } else {
    await expect(cta, 'no destination yet').not.toHaveAttribute('href');
    await expect(section(page).getByRole('link')).toHaveCount(0);
  }
  expect(aboutCta.label).toBe('More about the studio');
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
    // No role line: the owner asked for "Founder" off the card (2026-11-22).
    await expect(card).not.toContainText(/founder/i);
    // The city under the name (the owner, 2026-11-22), after a pin: the last line of the card's text.
    const location = card.locator('[data-owner-location]');
    await expect(location).toHaveText(basedIn);
    const lines = await card.evaluate((element) =>
      Array.from(element.querySelectorAll('p'), (line) => ({
        text: line.textContent!.trim(),
        top: line.getBoundingClientRect().top,
      })),
    );
    expect(lines.at(-1)?.text, 'the city comes last').toBe(basedIn);
    expect(
      lines.every((line, index) => index === 0 || line.top > lines[index - 1].top),
      'one line under another',
    ).toBe(true);
    // The pin and the mark are decorative: each is hidden from assistive technology. One evaluate
    // on the card: Firefox crashes on evaluateAll from this named region.
    await expect(card.locator('svg'), 'the pin and the mark').toHaveCount(2);
    expect(
      await card.evaluate((element) =>
        Array.from(element.querySelectorAll('svg')).every(
          (svg) => svg.closest('[aria-hidden="true"]') !== null,
        ),
      ),
      'both decorative',
    ).toBe(true);
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
