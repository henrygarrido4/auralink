import { expect, test, type Page } from '@playwright/test';
import { whyPillars } from '../../src/data/site';

/**
 * Home page "Why Auralink Studio?" (src/components/sections/WhyAuralink.astro), directly under the
 * services and before who we work with, after the owner's approved mockup (2026-11-19). The
 * eyebrow, one h2 with a light "Why", a short primary rule, and one sentence are left-aligned on
 * the same edge as the three cards, like the other sections; the sentence keeps a readable
 * measure and is not centred. The three `whyPillars` follow, in order. Inside each card the
 * category, heading, description, and checklist are left-aligned, with the same padding. Side
 * cards are white, the centre card is primary, all square and flat, with dark text. From lg they
 * share one row and the checklist of each starts on the same line; below that they stack.
 * Checklist marks are decorative. The desk photograph is decorative (empty alt, lazy). No link
 * or button. No client-side JavaScript.
 */
const EYEBROW = "How we're different";
const HEADING = 'Why Auralink Studio?';
const SENTENCE =
  'Thoughtful websites. Connected email journeys. A partner invested in your business.';
/** The check green from the approved mockup, #32a464. */
const CHECK = 'rgb(50, 164, 100)';

const section = (page: Page) => page.locator('#why-auralink');

const colour = (page: Page, value: string) =>
  page.evaluate((css) => {
    const probe = document.createElement('i');
    probe.style.backgroundColor = css;
    document.body.append(probe);
    const computed = getComputedStyle(probe).backgroundColor;
    probe.remove();
    return computed;
  }, value);

test('follows the services and introduces the three pillars', async ({ page }) => {
  await page.goto('/');
  const region = page.getByRole('region', { name: HEADING });
  await expect(region).toHaveAttribute('id', 'why-auralink');

  const ids = await page.evaluate(() =>
    Array.from(document.querySelectorAll('section[id]'), (element) => element.id),
  );
  const at = ids.indexOf('why-auralink');
  expect(ids[at - 1], 'after the services').toBe('services');
  expect(ids[at + 1], 'before who we work with').toBe('who-we-work-with');

  await expect(region.getByRole('heading', { level: 2 })).toHaveText(HEADING);
  const why = region.locator('h2 span');
  await expect(why).toHaveText('Why');
  await expect(why).toHaveCSS('font-weight', '300');
  await expect(region.locator('h2')).toHaveCSS('font-weight', '700');

  const eyebrow = region.getByText(EYEBROW, { exact: true });
  await expect(eyebrow).toBeVisible();
  await expect(eyebrow).toHaveCSS('text-transform', 'uppercase');
  await expect(region.getByText(SENTENCE, { exact: true })).toBeVisible();

  const cards = region.locator('[data-why-card]');
  await expect(cards).toHaveCount(whyPillars.length);
  for (const [index, pillar] of whyPillars.entries()) {
    const card = cards.nth(index);
    await expect(card.getByRole('heading', { level: 3 })).toHaveText(pillar.title.join(' '));
    await expect(card.getByText(pillar.description, { exact: true })).toBeVisible();
    await expect(card.locator('[data-why-points]').getByRole('listitem')).toHaveText([
      ...pillar.points,
    ]);
    const marks = card.locator('[data-why-points] svg');
    await expect(marks).toHaveCount(pillar.points.length);
    for (const mark of await marks.all()) {
      await expect(mark).toHaveAttribute('aria-hidden', 'true');
    }
  }

  await expect(region.getByRole('link')).toHaveCount(0);
  await expect(region.getByRole('button')).toHaveCount(0);
  const photo = region.locator('img');
  await expect(photo).toHaveCount(1);
  await expect(photo).toHaveAttribute('alt', '');
  await expect(photo).toHaveAttribute('loading', 'lazy');
});

test('the centre card is yellow, the others white, and every card is flat', async ({ page }) => {
  await page.goto('/');
  const [white, yellow] = await Promise.all([
    colour(page, 'var(--color-base-100)'),
    colour(page, 'var(--color-primary)'),
  ]);
  const cards = section(page).locator('[data-why-card]');
  await expect(cards.nth(0)).toHaveCSS('background-color', white);
  await expect(cards.nth(1)).toHaveCSS('background-color', yellow);
  await expect(cards.nth(1)).toHaveAttribute('data-accent', 'true');
  await expect(cards.nth(2)).toHaveCSS('background-color', white);
  for (const card of await cards.all()) {
    await expect(card).toHaveCSS('border-radius', '0px');
    await expect(card).toHaveCSS('cursor', 'auto');
    const shadows = await card.evaluate((el) => {
      const value = getComputedStyle(el).boxShadow;
      return value === 'none' ? [] : value.split(/,(?![^(]*\))/);
    });
    for (const shadow of shadows) {
      expect(shadow, 'no visible shadow').toMatch(/rgba\(0, 0, 0, 0\)|transparent/);
    }
  }
  const mark = section(page).locator('[data-why-points] span[aria-hidden="true"]').first();
  await expect(mark).toHaveCSS('background-color', CHECK);
});

test('the introduction and the cards are left-aligned, on one edge', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);

  for (const width of [360, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    const layout = await section(page).evaluate((root) => {
      const start = (el: Element) => {
        const range = document.createRange();
        range.selectNodeContents(el);
        return range.getBoundingClientRect().left;
      };
      const heading = root.querySelector('h2')!;
      const container = heading.parentElement!;
      const containerStyle = getComputedStyle(container);
      const edge = container.getBoundingClientRect().left + parseFloat(containerStyle.paddingLeft);
      const contentWidth =
        container.getBoundingClientRect().width -
        parseFloat(containerStyle.paddingLeft) -
        parseFloat(containerStyle.paddingRight);
      const eyebrow = heading.previousElementSibling!;
      const rule = heading.nextElementSibling!;
      const sentence = rule.nextElementSibling as HTMLElement;
      const grid = sentence.nextElementSibling!;
      const sentenceStyle = getComputedStyle(sentence);
      const sentenceBox = sentence.getBoundingClientRect();
      const cards = [...root.querySelectorAll<HTMLElement>('[data-why-card]')].map((card) => {
        const cardStyle = getComputedStyle(card);
        const cardEdge = card.getBoundingClientRect().left + parseFloat(cardStyle.paddingLeft);
        const category = card.querySelector(':scope > p')!;
        const title = card.querySelector('h3')!;
        const description = card.querySelectorAll(':scope > p')[1]!;
        const points = card.querySelector('[data-why-points]')!;
        return {
          padding: [
            cardStyle.paddingTop,
            cardStyle.paddingRight,
            cardStyle.paddingBottom,
            cardStyle.paddingLeft,
          ],
          align: [category, title, description, points].map((el) => getComputedStyle(el).textAlign),
          starts: [
            start(category),
            ...[...title.querySelectorAll('span')].map((line) => start(line)),
            start(description),
            points.getBoundingClientRect().left,
          ].map((left) => left - cardEdge),
        };
      });
      return {
        intro: [
          start(eyebrow),
          start(heading),
          rule.getBoundingClientRect().left,
          start(sentence),
          grid.getBoundingClientRect().left,
        ].map((left) => left - edge),
        introAlign: [eyebrow, heading, sentence].map((el) => getComputedStyle(el).textAlign),
        sentence: {
          maxWidth: sentenceStyle.maxWidth,
          marginLeft: sentenceStyle.marginLeft,
          width: sentenceBox.width,
          contentWidth,
        },
        cards,
      };
    });

    for (const [index, part] of ['eyebrow', 'heading', 'rule', 'sentence', 'cards'].entries()) {
      expect(
        Math.abs(layout.intro[index]),
        `${width}px: the ${part} starts at the left edge`,
      ).toBeLessThan(0.5);
    }
    for (const align of layout.introAlign) {
      expect(['left', 'start'], `${width}px: the introduction is left-aligned`).toContain(align);
    }
    expect(layout.sentence.maxWidth, `${width}px: the sentence keeps a measure`).not.toBe('none');
    expect(layout.sentence.marginLeft, `${width}px: the sentence is not centred`).toBe('0px');
    if (layout.sentence.contentWidth > parseFloat(layout.sentence.maxWidth) + 1) {
      expect(
        layout.sentence.width,
        `${width}px: the sentence stays within its measure`,
      ).toBeLessThanOrEqual(parseFloat(layout.sentence.maxWidth) + 1);
      expect(
        layout.sentence.width,
        `${width}px: the sentence does not span the cards`,
      ).toBeLessThan(layout.sentence.contentWidth - 1);
    }

    const [first] = layout.cards;
    for (const card of layout.cards) {
      expect(card.padding, `${width}px: the same padding on every card`).toEqual(first.padding);
      for (const align of card.align) {
        expect(['left', 'start'], `${width}px: card copy is left-aligned`).toContain(align);
      }
      for (const [index, part] of [
        'category',
        'heading line',
        'heading line',
        'description',
        'checklist',
      ].entries()) {
        expect(
          Math.abs(card.starts[index]),
          `${width}px: the ${part} starts at the card's left`,
        ).toBeLessThan(0.5);
      }
    }
  }
});

test('three equal columns from lg, stacked below, with the checklists aligned', async ({
  page,
}) => {
  await page.goto('/');

  const measure = () =>
    section(page).evaluate((root) => {
      const cards = [...root.querySelectorAll<HTMLElement>('[data-why-card]')].map((card) => {
        const box = card.getBoundingClientRect();
        const points = card.querySelector('[data-why-points]');
        const first = points?.firstElementChild?.getBoundingClientRect();
        const lines = [...card.querySelectorAll('h3 span')].map((span) => {
          const range = document.createRange();
          range.selectNodeContents(span);
          return range.getClientRects().length;
        });
        return {
          x: box.x,
          y: box.y,
          width: box.width,
          height: box.height,
          pointY: first?.y ?? null,
          lines,
        };
      });
      return {
        cards,
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      };
    });

  for (const width of [1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const desktop = await measure();
    expect(desktop.overflow, `no sideways scroll at ${width}`).toBeLessThanOrEqual(1);
    const [first, second, third] = desktop.cards;
    expect(first.y, `${width}: one row`).toBeCloseTo(second.y, 0);
    expect(third.y).toBeCloseTo(second.y, 0);
    expect(second.x).toBeGreaterThan(first.x + first.width - 1);
    expect(third.x).toBeGreaterThan(second.x + second.width - 1);
    for (const card of desktop.cards) {
      expect(Math.abs(card.width - first.width), `${width}: equal width`).toBeLessThanOrEqual(1);
      expect(Math.abs(card.height - first.height), `${width}: equal height`).toBeLessThanOrEqual(1);
      expect(
        Math.abs((card.pointY ?? 0) - (first.pointY ?? 0)),
        `${width}: checklists align`,
      ).toBeLessThanOrEqual(1);
      expect(card.lines, `${width}: each heading line fits`).toEqual([1, 1]);
    }
  }

  await page.setViewportSize({ width: 390, height: 844 });
  const phone = await measure();
  expect(phone.overflow, 'no sideways scroll at 390').toBeLessThanOrEqual(1);
  expect(phone.cards[1].y).toBeGreaterThanOrEqual(phone.cards[0].y + phone.cards[0].height - 1);
  expect(phone.cards[2].y).toBeGreaterThanOrEqual(phone.cards[1].y + phone.cards[1].height - 1);
  for (const card of phone.cards) {
    expect(card.lines, 'each heading line fits on a phone').toEqual([1, 1]);
  }
});
