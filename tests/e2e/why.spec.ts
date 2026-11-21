import { expect, test, type Locator, type Page } from './fixtures';
import { whyPillars } from '../../src/data/site';

/**
 * Home page "Why Auralink Studio?" (src/components/sections/WhyAuralink.astro), directly under the
 * services and before who we work with. The eyebrow, one h2 with a light "Why", a short primary
 * rule, and one sentence are left-aligned on the same edge as the three cards, like the other
 * sections; the sentence keeps a readable measure and is not centred. The three `whyPillars`
 * follow, in order, as cards after the "Why choose us" cards of the Troma demo, the owner's
 * reference (2026-11-20), in this site's colours, on a flat `neutral` band with no image: all
 * three a dark tone of `neutral` (80% mixed with white), with 8px corners, no shadow, and light
 * text, each opening with a decorative icon on a near-black tile, then the category, heading,
 * description, and checklist, left-aligned with the same padding. The checklist marks are
 * near-black discs with a yellow check, decorative. From lg the cards share one row and the
 * checklist of each starts on the same line; below that they stack. Hover is the premium card
 * shine (https://www.youtube.com/shorts/RojcPDSd63k): the band is parked off the card at rest, and
 * under a pointer that can hover it sweeps across that card alone over 0.8s, with nothing on any
 * card moving or changing colour; when the pointer leaves, the band fades out over 0.15s where it
 * is, then returns to its parking place in one jump, never sweeping back, and a pointer that
 * returns during the fade carries the sweep on from where it was; it moves and fades through
 * `translate` and `opacity` themselves (the compositor's properties), the cards transition
 * nothing, nothing runs on load, and under reduced motion the band stays parked. The owner's mark
 * lies faint in the band's top right corner from lg, behind the copy and the cards and inside the
 * screen, and is not drawn below lg. No link, button, or image. No client-side JavaScript.
 */
const EYEBROW = "How we're different";
const HEADING = 'Why Auralink Studio?';
const SENTENCE = 'Thoughtful websites. Built for performance. A partner invested in your business.';

const section = (page: Page) => page.locator('#why-auralink');
const cards = (page: Page) => section(page).locator('[data-why-card]');
const marks = (page: Page) => section(page).locator('[data-why-mark]');
const mark = (page: Page, corner: 'top' | 'bottom') =>
  section(page).locator(`[data-why-mark="${corner}"]`);
const canHover = (page: Page) =>
  page.evaluate(() => matchMedia('(hover: hover) and (pointer: fine)').matches);

/** A card's band: parked off the left edge at -100, off the right edge at 100. */
const PARKED = -100;
const CROSSED = 100;

/**
 * A card's band: how far it has travelled (`translate`, as a percentage of the card's width),
 * how much of it shows, and what it is transitioning.
 */
const shineOf = (card: Locator) =>
  card.evaluate((el) => {
    const band = getComputedStyle(el, '::after');
    return {
      travel: parseFloat(band.translate),
      opacity: parseFloat(band.opacity),
      property: band.transitionProperty,
      duration: band.transitionDuration,
      delay: band.transitionDelay,
      timing: band.transitionTimingFunction,
      image: band.backgroundImage,
    };
  });

interface Sample {
  /** Milliseconds since sampling began. */
  t: number;
  travel: number;
  opacity: number;
}

/** The band's travel and opacity at every animation frame for `ms` milliseconds. */
const sampleShine = (card: Locator, ms: number) =>
  card.evaluate(
    (el, ms) =>
      new Promise<Sample[]>((done) => {
        const samples: Sample[] = [];
        const start = performance.now();
        const tick = () => {
          const band = getComputedStyle(el, '::after');
          samples.push({
            t: Math.round(performance.now() - start),
            travel: parseFloat(band.translate),
            opacity: parseFloat(band.opacity),
          });
          if (performance.now() - start < ms) requestAnimationFrame(tick);
          else done(samples);
        };
        requestAnimationFrame(tick);
      }),
    ms,
  );

/** The samples in one line, for a failure message. */
const trace = (samples: Sample[]) =>
  samples.map((s) => `${s.t}ms ${s.travel.toFixed(1)}@${s.opacity.toFixed(2)}`).join(' | ');

/** The centre of a card, for pointer moves that take one round trip. */
const centre = async (card: Locator) => {
  const box = (await card.boundingBox())!;
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
};

const colour = (page: Page, value: string) =>
  page.evaluate((css) => {
    const probe = document.createElement('i');
    probe.style.backgroundColor = css;
    document.body.append(probe);
    const computed = getComputedStyle(probe).backgroundColor;
    probe.remove();
    return computed;
  }, value);

/** The theme colours the cards use, as the browser serialises them. */
const palette = async (page: Page) => {
  const [white, yellow, nearBlack, card] = await Promise.all([
    colour(page, 'var(--color-base-100)'),
    colour(page, 'var(--color-primary)'),
    colour(page, 'var(--color-neutral)'),
    colour(page, 'color-mix(in oklab, var(--color-neutral) 80%, white)'),
  ]);
  return { white, yellow, nearBlack, card };
};

/**
 * Each card's fill, its tile's fill and icon colour, its first mark's fill and check colour, and
 * its text: none of which the hover changes.
 */
const looks = (page: Page) =>
  cards(page).evaluateAll((items) =>
    items.map((card) => {
      const tile = card.querySelector<HTMLElement>('[data-why-icon]')!;
      const mark = card.querySelector<HTMLElement>('[data-why-points] span[aria-hidden="true"]')!;
      return {
        fill: getComputedStyle(card).backgroundColor,
        tile: getComputedStyle(tile).backgroundColor,
        icon: getComputedStyle(tile.querySelector('svg')!).color,
        mark: getComputedStyle(mark).backgroundColor,
        check: getComputedStyle(mark.querySelector('svg')!).color,
        text: getComputedStyle(card.querySelector('h3')!).color,
      };
    }),
  );

/** Each card's box, relative to the section, so scrolling a card into view changes nothing. */
const boxes = (page: Page) =>
  cards(page).evaluateAll((items) =>
    items.map((card) => {
      const origin = card.closest('section')!.getBoundingClientRect();
      const { x, y, width, height } = card.getBoundingClientRect();
      return [x - origin.x, y - origin.y, width, height];
    }),
  );

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

  const items = region.locator('[data-why-card]');
  await expect(items).toHaveCount(whyPillars.length);
  for (const [index, pillar] of whyPillars.entries()) {
    const card = items.nth(index);
    const tile = card.locator('[data-why-icon]');
    await expect(tile, 'one decorative icon tile').toHaveAttribute('aria-hidden', 'true');
    await expect(tile.locator('svg')).toHaveCount(1);
    await expect(tile.locator('svg')).toHaveAttribute('aria-hidden', 'true');
    await expect(card.getByText(pillar.category, { exact: true })).toBeVisible();
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
  await expect(region.locator('img, picture, video, canvas'), 'a flat band, no image').toHaveCount(
    0,
  );
  const [band, nearBlack] = await Promise.all([
    region.evaluate((el) => getComputedStyle(el).backgroundColor),
    colour(page, 'var(--color-neutral)'),
  ]);
  expect(band, 'the band is the flat neutral').toBe(nearBlack);
  await expect(marks(page), 'two decorative marks').toHaveCount(2);
  for (const art of await marks(page).all()) {
    await expect(art).toHaveAttribute('aria-hidden', 'true');
    await expect(art).toHaveAttribute('focusable', 'false');
  }
});

test('every card is a dark tone, soft-cornered, and flat, with near-black tiles and marks, and the shine parked', async ({
  page,
}) => {
  await page.goto('/');
  await page.mouse.move(0, 0);
  const { white, yellow, nearBlack, card: tone } = await palette(page);
  const seen = await looks(page);
  expect(seen).toHaveLength(whyPillars.length);
  for (const [index, card] of seen.entries()) {
    const name = whyPillars[index].category;
    expect(card.fill, `${name}: a dark tone at rest`).toBe(tone);
    expect(card.text, `${name}: light text`).toBe(white);
    expect(card.tile, `${name}: a near-black tile`).toBe(nearBlack);
    expect(card.icon, `${name}: a yellow icon`).toBe(yellow);
    expect(card.mark, `${name}: near-black marks`).toBe(nearBlack);
    expect(card.check, `${name}: yellow checks`).toBe(yellow);
  }
  for (const card of await cards(page).all()) {
    const shine = await shineOf(card);
    expect(shine.travel, 'the band is parked off the card').toBe(PARKED);
    expect(shine.opacity, 'and unlit').toBe(0);
    expect(shine.image, 'the short\u2019s tilted band').toContain('115deg');
  }
  for (const card of await cards(page).all()) {
    await expect(card).toHaveCSS('border-radius', '8px');
    await expect(card).toHaveCSS('cursor', 'auto');
    await expect(card).toHaveCSS('border-top-width', '0px');
    const shadows = await card.evaluate((el) => {
      const value = getComputedStyle(el).boxShadow;
      return value === 'none' ? [] : value.split(/,(?![^(]*\))/);
    });
    for (const shadow of shadows) {
      expect(shadow, 'no visible shadow').toMatch(/rgba\(0, 0, 0, 0\)|transparent/);
    }
  }
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
        const tile = card.querySelector('[data-why-icon]')!;
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
            tile.getBoundingClientRect().left,
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
        'icon tile',
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

test("the owner's mark lies faint in the band's top right corner and rises from its bottom left from lg, behind the copy and the cards, and inside the screen", async ({
  page,
}) => {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  const tint = await colour(page, 'color-mix(in oklab, var(--color-primary) 10%, transparent)');
  for (const art of await marks(page).all()) {
    await expect(art).toHaveCSS('z-index', '-10');
    await expect(art).toHaveCSS('pointer-events', 'none');
    // The tint is the primary at a tenth, and the file's own yellow fill gives way to it.
    await expect(art).toHaveCSS('color', tint);
    const fills = await art
      .locator('path')
      .evaluateAll((paths) => paths.map((path) => getComputedStyle(path).fill));
    expect(fills.length).toBeGreaterThan(0);
    for (const fill of fills) {
      expect(fill, 'not the file\u2019s own yellow').not.toBe('rgb(247, 219, 21)');
    }
  }

  for (const width of [1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(mark(page, 'top'), `${width}px: the top mark is drawn`).toBeVisible();
    await expect(mark(page, 'bottom'), `${width}px: the bottom mark is drawn`).toBeVisible();
    const placed = await section(page).evaluate((root) => {
      const box = (selector: string) => {
        const { left, right, top, bottom, width, height } = root
          .querySelector(selector)!
          .getBoundingClientRect();
        return { left, right, top, bottom, width, height };
      };
      const band = root.getBoundingClientRect();
      const sentence = root.querySelector('h2 + div + p')!.getBoundingClientRect();
      const cards = [...root.querySelectorAll('[data-why-card]')].map((card) =>
        card.getBoundingClientRect(),
      );
      return {
        top: box('[data-why-mark="top"]'),
        bottom: box('[data-why-mark="bottom"]'),
        band: { top: band.top, right: band.right, bottom: band.bottom, left: band.left },
        sentenceRight: sentence.right,
        cardsTop: Math.min(...cards.map((card) => card.top)),
        cardsBottom: Math.max(...cards.map((card) => card.bottom)),
        vw: document.documentElement.clientWidth,
      };
    });
    const { top, bottom } = placed;
    expect(top.width, `${width}px: the two marks are the same size`).toBeCloseTo(bottom.width, 0);

    expect(top.right, `${width}px: top mark inside the screen`).toBeLessThanOrEqual(placed.vw + 1);
    expect(top.right, `${width}px: against the band's right edge`).toBeCloseTo(
      placed.band.right,
      0,
    );
    expect(top.top, `${width}px: at the band's top`).toBeCloseTo(placed.band.top, 0);
    expect(top.left, `${width}px: right of the sentence`).toBeGreaterThan(placed.sentenceRight);
    expect(top.bottom, `${width}px: above the cards`).toBeLessThan(placed.cardsTop);

    expect(bottom.left, `${width}px: bottom mark inside the screen`).toBeGreaterThanOrEqual(-1);
    expect(bottom.left, `${width}px: against the band's left edge`).toBeCloseTo(
      placed.band.left,
      0,
    );
    // Centred on the band's bottom edge, which clips its lower half.
    expect(
      (bottom.top + bottom.bottom) / 2,
      `${width}px: centred on the band's bottom edge`,
    ).toBeCloseTo(placed.band.bottom, 0);
    expect(bottom.top, `${width}px: its visible half meets no card`).toBeGreaterThan(
      placed.cardsBottom,
    );
  }

  await page.setViewportSize({ width: 768, height: 900 });
  for (const art of await marks(page).all()) {
    await expect(art, 'not drawn below lg, where the copy could run under it').toBeHidden();
  }
});

test.describe('the shine', () => {
  test.describe('motion allowed', () => {
    test.use({ reducedMotion: 'no-preference' });

    test('under the pointer the band sweeps one card, and only that one, with nothing on any card moving or changing colour; when the pointer leaves it goes dark and returns to its parking place', async ({
      page,
    }) => {
      await page.goto('/');
      test.skip(!(await canHover(page)), 'Touch screens have no hover; every band stays parked.');
      await page.setViewportSize({ width: 1280, height: 900 });
      await page.evaluate(() => document.fonts.ready);
      await page.mouse.move(0, 0);
      const rest = await looks(page);
      const before = await boxes(page);

      for (const [index, pillar] of whyPillars.entries()) {
        await cards(page).nth(index).hover();
        await expect
          .poll(async () => (await shineOf(cards(page).nth(index))).travel, {
            message: `${pillar.category}: the band crosses the card`,
          })
          .toBe(CROSSED);
        expect((await shineOf(cards(page).nth(index))).opacity, 'lit while it crosses').toBe(1);
        for (const [other, name] of whyPillars.entries()) {
          if (other === index) continue;
          const shine = await shineOf(cards(page).nth(other));
          expect(shine.travel, `${name} stays parked`).toBe(PARKED);
          expect(shine.opacity, `${name} stays unlit`).toBe(0);
        }
        expect(await looks(page), `${pillar.category}: no colour on any card changes`).toEqual(
          rest,
        );
        expect(await boxes(page), `${pillar.category}: no card moves or resizes`).toEqual(before);
        await expect(cards(page).nth(index)).toHaveCSS('cursor', 'auto');
      }

      // Leaving: the band goes dark and is parked again, ready for the next visit.
      const last = cards(page).last();
      await page.mouse.move(0, 0);
      await expect
        .poll(async () => await shineOf(last), { message: 'parked and unlit again' })
        .toMatchObject({ travel: PARKED, opacity: 0 });
    });

    test('a pointer that leaves mid-sweep sees the band fade where it is, never sweep back; one that returns during the fade carries the sweep on', async ({
      page,
    }) => {
      await page.goto('/');
      test.skip(!(await canHover(page)), 'Touch screens have no hover; the band never travels.');
      await page.setViewportSize({ width: 1280, height: 900 });
      const card = cards(page).first();
      await card.scrollIntoViewIfNeeded();
      const over = await centre(card);
      const midSweep = () =>
        expect
          .poll(async () => (await shineOf(card)).travel, {
            message: 'the band is part way across',
            intervals: [40, 40, 40, 40, 40, 40, 40, 40, 40, 40],
          })
          .toBeGreaterThan(-60);

      // Leave while the band is crossing. Sample every frame as it goes.
      await page.mouse.move(over.x, over.y);
      await midSweep();
      const leaving = sampleShine(card, 500);
      await page.mouse.move(0, 0);
      const samples = await leaving;

      const seen = trace(samples);
      const onCard = (s: Sample) => s.travel > PARKED + 0.5;
      // The frames after the pointer left and before the band jumped back.
      const fading = samples.filter((s) => s.opacity < 1 && onCard(s));
      expect(fading.length, `the light fades over more than one frame: ${seen}`).toBeGreaterThan(1);
      const held = fading[0].travel;
      expect(held, `it fades part way across, where it was: ${seen}`).toBeLessThan(CROSSED);
      for (const [i, s] of fading.entries()) {
        expect(
          Math.abs(s.travel - held),
          `held in place while it fades (${s.travel} at ${s.t}ms): ${seen}`,
        ).toBeLessThanOrEqual(1);
        if (i > 0) {
          expect(s.opacity, `dimming (${s.opacity} at ${s.t}ms): ${seen}`).toBeLessThanOrEqual(
            fading[i - 1].opacity,
          );
        }
      }
      for (const s of samples) {
        // Every frame shows the band either where it was or parked: nothing in between.
        const between = onCard(s) && s.travel < held - 1;
        expect(between, `no sweep back (${s.travel} at ${s.t}ms): ${seen}`).toBe(false);
      }
      // The jump back happens once the light is out, or as near as a frame can tell.
      const parked = samples.find((s) => s.opacity < 1 && !onCard(s));
      expect(parked?.opacity, `off the card only once unlit: ${seen}`).toBeLessThanOrEqual(0.05);
      expect(samples.at(-1), `parked and unlit at the end: ${seen}`).toMatchObject({
        travel: PARKED,
        opacity: 0,
      });

      // Return during the fade: the sweep goes on from where it was, and does not start over.
      // WebKit holds the band a few percent short of the last value read, so allow that.
      await page.mouse.move(over.x, over.y);
      await midSweep();
      const since = (await shineOf(card)).travel;
      await page.mouse.move(0, 0);
      await page.mouse.move(over.x, over.y);
      const resumed = await sampleShine(card, 1000);
      const again = trace(resumed);
      expect(resumed[0].opacity, `lit again at once: ${again}`).toBe(1);
      for (const s of resumed) {
        expect(s.travel, `never back to the start (since ${since}): ${again}`).toBeGreaterThan(
          since - 10,
        );
      }
      expect(resumed.at(-1)?.travel, `and across: ${again}`).toBe(CROSSED);
    });

    test('the band moves and fades through the compositor\u2019s properties alone, and the cards transition nothing', async ({
      page,
    }) => {
      await page.goto('/');
      test.skip(!(await canHover(page)), 'Touch screens have no hover; the band never travels.');
      await page.mouse.move(0, 0);
      const rest = await shineOf(cards(page).first());
      expect(rest.property, 'leaving: the light fades, then the band jumps back').toBe(
        'opacity, translate',
      );
      expect(rest.duration).toBe('0.15s, 0s');
      expect(rest.delay, 'the jump waits for the fade').toBe('0s, 0.15s');

      await cards(page).first().hover();
      const hovered = await shineOf(cards(page).first());
      expect(hovered.property, 'hovering: only the travel eases').toBe('translate');
      expect(hovered.duration).toBe('0.8s');
      expect(hovered.timing).toBe('ease');
      for (const card of await cards(page).all()) {
        await expect(card).toHaveCSS('transition-duration', '0s');
      }
    });

    test('nothing runs or slides in on load, even as the stylesheet arrives', async ({ page }) => {
      // WebKit can style the page before the stylesheet applies. The band transitions `translate`
      // and `opacity` themselves, which is safe only because the stylesheet creates the band, so
      // there is no earlier style to transition from (`card-shine` in global.css).
      await page.addInitScript(() => {
        const runs: string[] = [];
        Object.assign(window, { whyRuns: runs });
        document.addEventListener(
          'transitionrun',
          (event) => {
            if ((event.target as Element).closest('#why-auralink')) {
              runs.push(`${event.propertyName}${event.pseudoElement ?? ''}`);
            }
          },
          true,
        );
      });
      await page.goto('/');
      await page.evaluate(
        () => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))),
      );
      const runs = await page.evaluate(() => (window as unknown as { whyRuns: string[] }).whyRuns);
      expect(runs, 'no transition on load').toEqual([]);
      for (const card of await cards(page).all()) {
        expect(await shineOf(card), 'parked and unlit on load').toMatchObject({
          travel: PARKED,
          opacity: 0,
        });
      }
    });
  });

  test.describe('reduced motion', () => {
    test.use({ reducedMotion: 'reduce' });

    test('the band stays parked, and nothing moves', async ({ page }) => {
      await page.goto('/');
      if (await canHover(page)) {
        await page.mouse.move(0, 0);
        const before = await boxes(page);
        await cards(page).first().hover();
        await page.evaluate(
          () => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))),
        );
        expect(await shineOf(cards(page).first()), 'parked under the pointer').toMatchObject({
          travel: PARKED,
          opacity: 0,
        });
        expect(await boxes(page), 'no card moves').toEqual(before);
      }
    });
  });
});
