import { expect, test, type Locator, type Page } from '@playwright/test';
import { whyPillars } from '../../src/data/site';

/**
 * Home page "Why Auralink Studio?" (src/components/sections/WhyAuralink.astro), directly under the
 * services and before who we work with. The eyebrow, one h2 with a light "Why", a short primary
 * rule, and one sentence are left-aligned on the same edge as the three cards, like the other
 * sections; the sentence keeps a readable measure and is not centred. The three `whyPillars`
 * follow, in order, as cards after the "Why choose us" cards of the Troma demo, the owner's
 * reference (2026-11-20), in this site's colours, on a flat `neutral` band with no image: all
 * three white, with 8px corners, no shadow, and dark text, each opening with a decorative icon on
 * a near-black tile, then the category, heading, description, and checklist, left-aligned with
 * the same padding. The checklist marks are near-black discs with a yellow check, decorative.
 * From lg the cards share one row and the checklist of each starts on the same line; below that
 * they stack. Each card sits in the buttons' aura (`aura-hover`), in `primary`: unlit at rest, and
 * under a pointer that can hover the light fades in and circles that card alone, with nothing on
 * any card moving or changing colour, then fades out when the pointer leaves and continues from
 * where it stopped; nothing runs on load, and under reduced motion the light stays off. The
 * owner's mark lies faint in the band's top right corner from lg, behind the copy and the cards
 * and inside the screen, and is not drawn below lg. No link, button, or image. No client-side
 * JavaScript.
 */
const EYEBROW = "How we're different";
const HEADING = 'Why Auralink Studio?';
const SENTENCE = 'Thoughtful websites. Built for performance. A partner invested in your business.';

const section = (page: Page) => page.locator('#why-auralink');
const cards = (page: Page) => section(page).locator('[data-why-card]');
const auras = (page: Page) => section(page).locator('[data-why-aura]');
const marks = (page: Page) => section(page).locator('[data-why-mark]');
const mark = (page: Page, corner: 'top' | 'bottom') =>
  section(page).locator(`[data-why-mark="${corner}"]`);
const canHover = (page: Page) =>
  page.evaluate(() => matchMedia('(hover: hover) and (pointer: fine)').matches);

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

/** Whether each card's light is on and spinning. */
const lit = async (page: Page) => {
  const states = await Promise.all((await auras(page).all()).map((aura) => auraSpin(aura)));
  return states.map((state) => state.playing && state.strength === '100%');
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
  const [white, yellow, nearBlack] = await Promise.all([
    colour(page, 'var(--color-base-100)'),
    colour(page, 'var(--color-primary)'),
    colour(page, 'var(--color-neutral)'),
  ]);
  return { white, yellow, nearBlack };
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

test('every card is white, soft-cornered, and flat, with near-black tiles and marks, in an unlit aura', async ({
  page,
}) => {
  await page.goto('/');
  await page.mouse.move(0, 0);
  const { white, yellow, nearBlack } = await palette(page);
  const seen = await looks(page);
  expect(seen).toHaveLength(whyPillars.length);
  for (const [index, card] of seen.entries()) {
    const name = whyPillars[index].category;
    expect(card.fill, `${name}: white at rest`).toBe(white);
    expect(card.tile, `${name}: a near-black tile`).toBe(nearBlack);
    expect(card.icon, `${name}: a yellow icon`).toBe(yellow);
    expect(card.mark, `${name}: near-black marks`).toBe(nearBlack);
    expect(card.check, `${name}: yellow checks`).toBe(yellow);
  }
  // One aura around each card, the buttons' hover policy, whose light is the primary yellow.
  await expect(auras(page)).toHaveCount(whyPillars.length);
  for (const aura of await auras(page).all()) {
    await expect(aura).toHaveClass(/\baura\b/);
    await expect(aura).toHaveClass(/\baura-hover\b/);
    await expect(aura).toHaveCSS('color', yellow);
    await expect(aura.locator('> [data-why-card]'), 'wrapping the card alone').toHaveCount(1);
    const { playing, strength } = await auraSpin(aura);
    expect(playing, 'nothing runs at rest').toBe(false);
    expect(strength, 'unlit at rest').toBe('0%');
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

test.describe('the aura', () => {
  test.describe('motion allowed', () => {
    test.use({ reducedMotion: 'no-preference' });

    test('under the pointer the light fades in and circles a card, and only that one, with nothing on any card moving or changing colour; it fades out when the pointer leaves and continues from where it stopped', async ({
      page,
    }) => {
      await page.goto('/');
      test.skip(!(await canHover(page)), 'Touch screens have no hover; every light stays off.');
      await page.setViewportSize({ width: 1280, height: 900 });
      await page.evaluate(() => document.fonts.ready);
      await page.mouse.move(0, 0);
      const rest = await looks(page);
      const before = await boxes(page);
      expect(await lit(page), 'all unlit at rest').toEqual(whyPillars.map(() => false));

      for (const [index, pillar] of whyPillars.entries()) {
        await auras(page).nth(index).hover();
        await expect
          .poll(() => lit(page), { message: `${pillar.category} lit, every other card unlit` })
          .toEqual(whyPillars.map((_, i) => i === index));
        await expect
          .poll(async () => (await auraSpin(auras(page).nth(index))).time ?? 0, {
            message: `${pillar.category}: the light circles`,
          })
          .toBeGreaterThan(200);
        expect(await looks(page), `${pillar.category}: no colour on any card changes`).toEqual(
          rest,
        );
        expect(await boxes(page), `${pillar.category}: no card moves or resizes`).toEqual(before);
        await expect(cards(page).nth(index)).toHaveCSS('cursor', 'auto');
      }

      // Leaving: the spin pauses where it is and the light fades out; the next visit resumes.
      const last = auras(page).last();
      const carried = (await auraSpin(last)).time ?? 0;
      await page.mouse.move(0, 0);
      await expect
        .poll(async () => (await auraSpin(last)).playing, {
          message: 'paused once the pointer leaves',
        })
        .toBe(false);
      expect((await auraSpin(last)).time ?? 0, 'the spin holds its place').toBeGreaterThanOrEqual(
        carried - 50,
      );
      await expect.poll(async () => (await auraSpin(last)).strength, 'fades out').toBe('0%');
      await last.evaluate((el) => {
        for (const animation of el.getAnimations()) {
          if ((animation as CSSAnimation).animationName === 'aura') animation.currentTime = 2500;
        }
      });
      await last.hover();
      const resumed = (await auraSpin(last)).time ?? 0;
      expect(resumed, 'continues from where it stopped').toBeGreaterThanOrEqual(2400);
      expect(resumed, 'did not start over').toBeLessThan(3500);
    });

    test('the light fades through its strength over 0.4s, and nothing on the cards transitions', async ({
      page,
    }) => {
      await page.goto('/');
      for (const aura of await auras(page).all()) {
        await expect(aura).toHaveCSS('transition-property', '--aura-light');
        await expect(aura).toHaveCSS('transition-duration', '0.4s');
      }
      for (const card of await cards(page).all()) {
        await expect(card).toHaveCSS('transition-duration', '0s');
      }
    });

    test('nothing runs or fades in on load, even as the stylesheet arrives', async ({ page }) => {
      // WebKit can style the page before the stylesheet applies; a plain transition would then
      // fade the lights in from the browser's defaults (`aura-hover` in global.css).
      await page.addInitScript(() => {
        const runs: string[] = [];
        Object.assign(window, { whyRuns: runs });
        document.addEventListener(
          'transitionrun',
          (event) => {
            if ((event.target as Element).closest('[data-why-aura]')) {
              runs.push(event.propertyName);
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
      expect(await lit(page), 'no light on load').toEqual(whyPillars.map(() => false));
    });
  });

  test.describe('reduced motion', () => {
    test.use({ reducedMotion: 'reduce' });

    test('the light stays off, and nothing moves', async ({ page }) => {
      await page.goto('/');
      for (const aura of await auras(page).all()) {
        await expect(aura).toHaveCSS('animation-name', 'none');
      }
      if (await canHover(page)) {
        await page.mouse.move(0, 0);
        const before = await boxes(page);
        await auras(page).first().hover();
        await page.evaluate(
          () => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))),
        );
        expect((await auraSpin(auras(page).first())).strength, 'unlit under the pointer').toBe(
          '0%',
        );
        expect(await boxes(page), 'no card moves').toEqual(before);
      }
    });
  });
});
