import { expect, test, type Locator, type Page } from '@playwright/test';
import { aboutCta, serviceCards, services, servicesCta, site } from '../../src/data/site';
import { serviceCardLink } from '../../src/lib/service-cards';

/**
 * Home page services section (src/components/sections/Services.astro): the introduction, ending
 * with the primary call to view all services at the same large size as the other primary buttons,
 * and one card (a tile) per `serviceCards` entry, laid out after the Hub2B reference: from xl a
 * four-column grid with the introduction in its first two cells, two tiles beside it and four
 * below. The introduction and everything on the cards are left-aligned at every width. Under the
 * pointer every card fades in Hub2B's frame. Each card links where src/lib/service-cards.ts says
 * (its service page, labelled "Learn more", else the inquiry page with no action label) or, with
 * nowhere to go, is no link at all. Every card
 * ends with an arrow box, shown before any hover. The others are the barbershop's: white with a
 * primary arrow, filling with primary over 0.5s as the arrow turns near-black. Custom Websites, the
 * lead card, is a near-black tile with a yellow title and a white sentence. Its arrow box has the
 * same 0.25rem corners, and it starts filled primary (near-black glyph) and turns white, the glyph
 * staying near-black. Both change under the pointer and under keyboard focus on a linked card, at once
 * under reduced motion, while nothing moves or resizes, and nothing fades in on load. The section
 * needs no client-side JavaScript.
 *
 * The link tests run only once a card has a destination; until then they are skipped with the
 * reason, and the plain-card tests run instead.
 */
const HEADING = 'Start with one service. Connect the rest.';
const ACTION_LABEL = /^(Learn more|Discuss this service)$/;

const section = (page: Page) => page.getByRole('region', { name: HEADING });
const items = (page: Page) => section(page).getByRole('listitem');
/** The card itself: the link, or the plain card that stands in for it. */
const surface = (item: Locator) => item.locator(':scope > *');
/** The arrow is the card's last icon; the service icon is its first. */
const arrowOf = (card: Locator) => card.locator('svg').last();
/** The white box the arrow sits in. */
const arrowBoxOf = (card: Locator) => arrowOf(card).locator('xpath=..');
/** WebKit mirrors Safari: plain Tab skips links; Option+Tab (Alt+Tab) reaches them. */
const tabKey = (browserName: string) => (browserName === 'webkit' ? 'Alt+Tab' : 'Tab');

const cards = serviceCards.map((card) => ({ card, link: serviceCardLink(card) }));
const firstLinked = cards.findIndex(({ link }) => link);

/** A theme colour as the browser computes it, to compare with computed styles. */
const tokenColour = (page: Page, token: string) =>
  page.evaluate((name) => {
    const probe = document.createElement('i');
    probe.style.color = `var(${name})`;
    document.body.append(probe);
    const value = getComputedStyle(probe).color;
    probe.remove();
    return value;
  }, token);

/** Hub2B's hover frame (the card's ::before): how visible it is, its border, and its fade time. */
const frameOf = (card: Locator) =>
  card.evaluate((el) => {
    const frame = getComputedStyle(el, '::before');
    return {
      opacity: frame.opacity,
      border: `${frame.borderTopWidth} ${frame.borderTopStyle} ${frame.borderTopColor}`,
      fade: frame.transitionDuration,
    };
  });

/** The arrow box's fill, the arrow's colour (it inherits the box's), and how they change. */
const arrowBoxLook = (card: Locator) =>
  arrowBoxOf(card).evaluate((box) => {
    const style = getComputedStyle(box);
    return {
      fill: style.backgroundColor,
      arrow: style.color,
      fade: style.transitionDuration,
      ease: style.transitionTimingFunction,
    };
  });

/** The arrow box's fill and the arrow's colour only. */
const arrowColours = async (card: Locator) => {
  const { fill, arrow } = await arrowBoxLook(card);
  return { fill, arrow };
};

/** Custom Websites is the lead tile: near-black, with the same 0.25rem arrow box. */
const LEAD_CARD = 'custom-websites';

/**
 * Arrow colours at rest and under the pointer or focus. The other cards are white with a primary
 * arrow, then primary with a near-black arrow. The lead card starts on that filled state and turns
 * white, the arrow staying near-black.
 */
const arrowPalettes = async (page: Page) => {
  const white = await tokenColour(page, '--color-base-100');
  const primary = await tokenColour(page, '--color-primary');
  const ink = await tokenColour(page, '--color-primary-content');
  return {
    standard: {
      rest: { fill: white, arrow: primary },
      active: { fill: primary, arrow: ink },
    },
    lead: {
      rest: { fill: primary, arrow: ink },
      active: { fill: white, arrow: ink },
    },
  };
};

const paletteFor = (cardId: string, palettes: Awaited<ReturnType<typeof arrowPalettes>>) =>
  cardId === LEAD_CARD ? palettes.lead : palettes.standard;

const canHover = (page: Page) => page.evaluate(() => matchMedia('(hover: hover)').matches);

/**
 * The introduction's box and every card's, relative to the list, in one frame. Relative, because
 * hovering or tabbing scrolls a card into view, and an image settling above the section can shift
 * the whole page by a fraction of a pixel. From xl the list spans the whole grid, so its origin is
 * the grid's top-left corner.
 */
const layout = (page: Page) =>
  section(page)
    .getByRole('list')
    .evaluate((list) => {
      const origin = list.getBoundingClientRect();
      const box = (el: Element) => {
        const { x, y, width, height } = el.getBoundingClientRect();
        return [x - origin.x, y - origin.y, width, height];
      };
      const intro = list.parentElement!.querySelector('h2')!.parentElement!;
      return { intro: box(intro), cards: Array.from(list.children, box) };
    });

/** Every card's box, to prove a hover or focus moves and resizes nothing. */
const cardBoxes = async (page: Page) => (await layout(page)).cards;

/**
 * Same positions and sizes to within 0.01px. Scrolled coordinates carry float noise (Firefox on
 * Linux reports 316.0001 then 316 for an unmoved card); a real shift is a pixel or more.
 */
function expectSamePlace(actual: number[][], expected: number[][], message: string) {
  expect(actual.length, message).toBe(expected.length);
  actual.forEach((values, i) =>
    values.forEach((value, j) =>
      expect(Math.abs(value - expected[i][j]), `${message} (${i}, ${j})`).toBeLessThan(0.01),
    ),
  );
}

/** Where the arrow sits inside its card, measured in one frame. */
const arrowOffset = (card: Locator) =>
  card.evaluate((el) => {
    const icons = el.querySelectorAll('svg');
    const arrow = icons[icons.length - 1].getBoundingClientRect();
    const box = el.getBoundingClientRect();
    return [arrow.x - box.x, arrow.y - box.y];
  });

/** Tabs from the top of the page until `target` has focus (bounded, so a miss fails clearly). */
async function tabTo(page: Page, target: Locator, browserName: string) {
  for (let i = 0; i < 40; i += 1) {
    if (await target.evaluate((el) => el === document.activeElement)) return;
    await page.keyboard.press(tabKey(browserName));
  }
  await expect(target).toBeFocused();
}

test('introduces the services and shows one card per service group, in order', async ({ page }) => {
  await page.goto('/');
  const region = section(page);
  await expect(region.getByRole('heading', { level: 2 })).toHaveText(HEADING);
  await expect(region.getByText('Our services', { exact: true })).toBeVisible();
  await expect(items(page)).toHaveCount(serviceCards.length);
  await expect(region.getByRole('heading', { level: 3 })).toHaveText(
    serviceCards.map((card) => card.title),
  );

  for (const [index, card] of serviceCards.entries()) {
    const item = items(page).nth(index);
    await expect(item.getByText(card.description, { exact: true })).toBeVisible();
    // The service icon: inline SVG, decorative, never a tab stop.
    const icon = item.locator('svg').first();
    await expect(icon).toBeVisible();
    await expect(icon).toHaveAttribute('aria-hidden', 'true');
    await expect(icon).toHaveAttribute('focusable', 'false');
  }
});

test('the introduction ends with the primary call to view all services', async ({ page }) => {
  await page.goto('/');
  const region = section(page);
  const cta = region.getByText(servicesCta.label, { exact: true });
  await expect(cta).toBeVisible();
  await expect(cta, 'the primary button').toHaveClass(/\bbtn-primary\b/);
  // The large size, the same as the introduction's primary button and the other page primaries.
  const introductionCta = page.getByText(`${aboutCta.label} about ${site.name}`, { exact: true });
  const buttonSize = (element: HTMLElement) => {
    const style = getComputedStyle(element);
    return {
      fontSize: style.fontSize,
      height: style.height,
      paddingLeft: style.paddingLeft,
      paddingRight: style.paddingRight,
    };
  };
  expect(await cta.evaluate(buttonSize)).toEqual(await introductionCta.evaluate(buttonSize));
  if (servicesCta.href) {
    await expect(cta).toHaveAttribute('href', servicesCta.href);
  } else {
    await expect(cta, 'no destination yet').not.toHaveAttribute('href');
    await expect(region.getByRole('link', { name: servicesCta.label })).toHaveCount(0);
  }
  // Under the introduction's text, and before the cards in reading order.
  const text = region.getByRole('heading', { level: 2 }).locator('xpath=following-sibling::p[1]');
  const [textBox, ctaBox] = [await text.boundingBox(), await cta.boundingBox()];
  expect(ctaBox!.y, 'under the text').toBeGreaterThan(textBox!.y + textBox!.height);
  const beforeCards = await cta.evaluate((el) => {
    const list = el.closest('section')!.querySelector('ul')!;
    return Boolean(el.compareDocumentPosition(list) & Node.DOCUMENT_POSITION_FOLLOWING);
  });
  expect(beforeCards, 'before the cards').toBe(true);
});

test('the cards present every catalogue service exactly once', () => {
  const presented = serviceCards.flatMap((card) => card.services).sort();
  expect(presented).toEqual(services.map((service) => service.slug).sort());
  expect(new Set(serviceCards.map((card) => card.id)).size, 'card ids are unique').toBe(
    serviceCards.length,
  );
});

test('each card links where it should, or is not a link at all', async ({ page }) => {
  await page.goto('/');
  for (const [index, { card, link }] of cards.entries()) {
    const item = items(page).nth(index);
    if (link) {
      const anchor = item.getByRole('link');
      await expect(anchor, `${card.title}: one link`).toHaveCount(1);
      await expect(anchor).toHaveAttribute('href', link.href);
      // The name is the visible text, in order. A title-only name hides the sentence (WCAG 2.5.3).
      await expect(anchor).toHaveAccessibleName(
        [card.title, card.description, link.label].filter(Boolean).join(' '),
      );
      if (link.label) {
        await expect(anchor.getByText(link.label, { exact: true })).toBeVisible();
      } else {
        await expect(anchor.getByText(ACTION_LABEL), `${card.title}: no action label`).toHaveCount(
          0,
        );
      }
      // The whole card is the link: it fills its list item exactly (measured in one frame).
      const gaps = await item.evaluate((li) => {
        const outer = li.getBoundingClientRect();
        const inner = li.firstElementChild!.getBoundingClientRect();
        return [
          inner.x - outer.x,
          inner.y - outer.y,
          outer.right - inner.right,
          outer.bottom - inner.bottom,
        ];
      });
      expectSamePlace([gaps], [[0, 0, 0, 0]], `${card.title}: the whole card is the link`);
    } else {
      // Nowhere to go yet: nothing to click and no action, only its icon and the arrow.
      await expect(item.locator('a, button, [tabindex]'), card.title).toHaveCount(0);
      await expect(item.getByText(ACTION_LABEL), card.title).toHaveCount(0);
      await expect(item.locator('svg'), `${card.title}: its icon and the arrow`).toHaveCount(2);
    }
  }
});

test('every card ends with the arrow, shown before any hover, on touch screens too', async ({
  page,
}) => {
  await page.goto('/');
  const palettes = await arrowPalettes(page);
  for (const [index, { card }] of cards.entries()) {
    const tile = surface(items(page).nth(index));
    const arrow = arrowOf(tile);
    await expect(arrow, card.title).toBeVisible();
    await expect(arrow).toHaveAttribute('aria-hidden', 'true');
    // 50px either way, with the same 0.25rem corners on every card.
    const box = await arrowBoxOf(tile).boundingBox();
    expect([box!.width, box!.height], `${card.title}: a 50px box`).toEqual([50, 50]);
    const shape = await arrowBoxOf(tile).evaluate((el) => {
      const style = getComputedStyle(el);
      return { radius: parseFloat(style.borderTopLeftRadius), shadow: style.boxShadow };
    });
    expect(shape.radius, `${card.title}: 0.25rem corners`).toBe(4);
    expect(await arrowColours(tile), card.title).toEqual(paletteFor(card.id, palettes).rest);
    if (card.id === LEAD_CARD) {
      expect(shape.shadow, `${card.title}: no shadow on the dark tile`).toBe('none');
    }
  }
  // Under each card's sentence, and as far above its bottom edge on every card: at its foot.
  const feet = await section(page)
    .getByRole('list')
    .evaluate((list) =>
      Array.from(list.children, (item) => {
        const card = item.firstElementChild!;
        const icons = card.querySelectorAll('svg');
        const box = icons[icons.length - 1].parentElement!.getBoundingClientRect();
        const text = card.querySelector('p')!.getBoundingClientRect();
        return [box.top - text.bottom, card.getBoundingClientRect().bottom - box.bottom];
      }),
    );
  for (const [index, [belowText]] of feet.entries()) {
    expect(belowText, `${serviceCards[index].title}: under its sentence`).toBeGreaterThan(0);
  }
  expectSamePlace(
    feet.map(([, aboveEdge]) => [aboveEdge]),
    feet.map(() => [feet[0][1]]),
    "the arrow sits at every card's foot",
  );
});

test('one card per row on phones, two on tablets, and on desktops four, beside the introduction', async ({
  page,
}) => {
  const layouts = [
    [360, 1],
    [390, 1],
    [640, 2],
    [768, 2],
    [1024, 2],
    [1280, 4],
    [1440, 4],
    [1920, 4],
  ] as const;
  for (const [width, columns] of layouts) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const { intro, cards } = await layout(page);
    const lefts = [...new Set(cards.map(([x]) => Math.round(x)))].sort((a, b) => a - b);
    expect(lefts, `${width}px: columns`).toHaveLength(columns);
    expect(new Set(cards.map(([, , w]) => Math.round(w))).size, `${width}px: equal widths`).toBe(1);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
      `${width}px: no sideways scroll`,
    ).toBeLessThanOrEqual(0);

    const [x, y, w, h] = intro;
    if (columns < 4) {
      expect(y + h, `${width}px: the introduction comes first`).toBeLessThanOrEqual(0);
      continue;
    }
    // Hub2B's arrangement: the introduction fills columns 1-2 of row one, two cards sit beside
    // it, and four fill row two.
    const column = (left: number) => lefts.indexOf(Math.round(left)) + 1;
    expect(
      cards.map(([left]) => column(left)),
      `${width}px: card columns`,
    ).toEqual([3, 4, 1, 2, 3, 4]);
    const [rowOne, rowTwo] = [cards[0][1], cards[2][1]];
    expect(rowTwo, `${width}px: two rows`).toBeGreaterThan(rowOne);
    expectSamePlace(
      cards.map(([, top]) => [top]),
      cards.map((_, i) => [i < 2 ? rowOne : rowTwo]),
      `${width}px: card rows`,
    );
    expect(Math.round(x), `${width}px: the introduction starts in column 1`).toBe(lefts[0]);
    expect(x + w, `${width}px: it reaches into column 2`).toBeGreaterThan(lefts[1]);
    expect(x + w, `${width}px: and ends before column 3`).toBeLessThanOrEqual(lefts[2]);
    expect(y, `${width}px: it sits in row one`).toBeGreaterThan(rowOne - 0.01);
    expect(y + h, `${width}px: above row two`).toBeLessThanOrEqual(rowTwo);
  }
});

test('the introduction is left-aligned at every width, like the other sections', async ({
  page,
}) => {
  for (const width of [360, 768, 1024, 1280, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    // Eyebrow, heading, rule, text, and button, each from the introduction's left edge.
    const starts = await section(page)
      .getByRole('heading', { level: 2 })
      .evaluate((heading) => {
        const start = (el: Element) => {
          const range = document.createRange();
          range.selectNodeContents(el);
          return range.getBoundingClientRect().left;
        };
        const intro = heading.parentElement!;
        const [eyebrow, , rule, text] = Array.from(intro.children);
        const button = intro.querySelector('.btn')!;
        const edge = intro.getBoundingClientRect().left;
        return [
          start(eyebrow),
          start(heading),
          rule.getBoundingClientRect().left,
          start(text),
          button.getBoundingClientRect().left,
        ].map((left) => left - edge);
      });
    for (const [i, part] of ['eyebrow', 'heading', 'rule', 'text', 'button'].entries()) {
      expect(Math.abs(starts[i]), `${width}px: the ${part} starts at the left edge`).toBeLessThan(
        0.5,
      );
    }
  }
});

test('cards keep the reference look: white, square, borderless, under a large icon, all left-aligned', async ({
  page,
}) => {
  await page.goto('/');
  const white = await tokenColour(page, '--color-base-100');
  const primary = await tokenColour(page, '--color-primary');
  const neutral = await tokenColour(page, '--color-neutral');
  const neutralContent = await tokenColour(page, '--color-neutral-content');
  for (const [index, card] of serviceCards.entries()) {
    const look = await surface(items(page).nth(index)).evaluate((el) => {
      const start = (target: Element) => {
        const range = document.createRange();
        range.selectNodeContents(target);
        return range.getBoundingClientRect().left;
      };
      const style = getComputedStyle(el);
      const icons = el.querySelectorAll('svg');
      const [icon, arrow] = [icons[0], icons[icons.length - 1]];
      const glyph = icon.getBoundingClientRect();
      const edge = el.getBoundingClientRect().left + parseFloat(style.paddingLeft);
      const heading = el.querySelector('h3')!;
      const sentence = el.querySelector('p')!;
      return {
        background: style.backgroundColor,
        radius: style.borderRadius,
        shadow: style.boxShadow,
        border: style.borderTopWidth,
        title: getComputedStyle(heading).color,
        sentence: getComputedStyle(sentence).color,
        icon: [glyph.width, glyph.height, getComputedStyle(icon).color],
        // The icon's drawing starts inside Lucide's 2px margin (2 of 24, 8px at 96px).
        starts: [
          glyph.left + glyph.width / 12,
          start(heading),
          start(sentence),
          arrow.parentElement!.getBoundingClientRect().left,
        ].map((left) => left - edge),
      };
    });
    if (card.id === LEAD_CARD) {
      expect(look.background, `${card.title}: the lead tile`).toBe(neutral);
      expect(look.title, `${card.title}: a yellow title`).toBe(primary);
      expect(look.sentence, `${card.title}: a white sentence`).toBe(neutralContent);
    } else {
      expect(look.background, card.title).toBe(white);
    }
    expect([look.radius, look.shadow, look.border], card.title).toEqual(['0px', 'none', '0px']);
    // Lucide's 24px grid keeps a 2px margin: a 96px icon draws the reference's 80px glyph.
    expect(look.icon, `${card.title}: icon`).toEqual([96, 96, primary]);
    for (const [i, part] of ["icon's drawing", 'title', 'sentence', 'arrow box'].entries()) {
      expect(
        Math.abs(look.starts[i]),
        `${card.title}: the ${part} starts at the text's left edge`,
      ).toBeLessThan(0.5);
    }
  }
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('the section renders in full, with every icon drawn inline', async ({ page }) => {
    await page.goto('/');
    await expect(items(page)).toHaveCount(serviceCards.length);
    for (const [index, card] of serviceCards.entries()) {
      const item = items(page).nth(index);
      await expect(item.getByRole('heading', { level: 3 })).toHaveText(card.title);
      expect(await item.locator('svg').first().locator('path, circle').count()).toBeGreaterThan(0);
    }
    // Nothing in the section runs code or fetches an icon.
    await expect(
      section(page).locator('script, astro-island, img, use, object, embed, iframe'),
    ).toHaveCount(0);
  });
});

test.describe("Hub2B's hover", () => {
  test.describe('motion allowed', () => {
    test.use({ reducedMotion: 'no-preference' });

    test('under the pointer every card fades in a 2px primary frame, and nothing moves', async ({
      page,
    }) => {
      await page.goto('/');
      test.skip(!(await canHover(page)), 'Touch screens have no hover.');
      const primary = await tokenColour(page, '--color-primary');
      for (const [index, { card, link }] of cards.entries()) {
        const tile = surface(items(page).nth(index));
        expect(await frameOf(tile), `${card.title} at rest`).toEqual({
          opacity: '0',
          border: `2px solid ${primary}`,
          fade: '0.3s',
        });
        const boxes = await cardBoxes(page);
        await tile.hover();
        await expect
          .poll(async () => (await frameOf(tile)).opacity, `${card.title} under the pointer`)
          .toBe('1');
        expectSamePlace(await cardBoxes(page), boxes, `${card.title}: no card moves or resizes`);
        // The frame is decoration: a card with nowhere to go still does not act like a link.
        if (!link) await expect(tile, card.title).not.toHaveCSS('cursor', 'pointer');
      }
    });
  });

  test.describe('reduced motion', () => {
    test.use({ reducedMotion: 'reduce' });

    test('the frame shows at once, without fading', async ({ page }) => {
      await page.goto('/');
      const tile = surface(items(page).first());
      expect((await frameOf(tile)).fade).toBe('0s');
      if (await canHover(page)) {
        await tile.hover();
        expect((await frameOf(tile)).opacity).toBe('1');
      }
    });
  });
});

test.describe('the arrow box', () => {
  test.describe('motion allowed', () => {
    test.use({ reducedMotion: 'no-preference' });

    test('under the pointer every arrow box changes colour over 0.5s, and nothing moves', async ({
      page,
    }) => {
      await page.goto('/');
      test.skip(!(await canHover(page)), 'Touch screens have no hover; each box stays at rest.');
      const palettes = await arrowPalettes(page);

      for (const [index, { card }] of cards.entries()) {
        const colours = paletteFor(card.id, palettes);
        const tile = surface(items(page).nth(index));
        expect(await arrowBoxLook(tile), `${card.title} at rest`).toEqual({
          ...colours.rest,
          fade: '0.5s',
          ease: 'ease',
        });
        const rest = { arrow: await arrowOffset(tile), boxes: await cardBoxes(page) };

        await tile.hover();
        await expect
          .poll(() => arrowColours(tile), `${card.title} under the pointer`)
          .toEqual(colours.active);
        expectSamePlace([await arrowOffset(tile)], [rest.arrow], `${card.title}: the arrow stays`);
        expectSamePlace(
          await cardBoxes(page),
          rest.boxes,
          `${card.title}: no card moves or resizes`,
        );

        await page.mouse.move(0, 0);
        await expect
          .poll(() => arrowColours(tile), `${card.title} after the pointer leaves`)
          .toEqual(colours.rest);
      }
    });

    test('no card fades anything in on load, even as the stylesheet arrives', async ({ page }) => {
      // Count every transition the cards start, from the first frame: WebKit can style the page
      // before the stylesheet applies, and a colour transition then faded each box in from the
      // browser's defaults (`arrow-box` in src/styles/global.css).
      await page.addInitScript(() => {
        const runs: string[][] = [];
        Object.assign(window, { cardRuns: runs });
        document.addEventListener(
          'transitionrun',
          (event) => {
            const item = (event.target as Element).closest('li');
            if (item) runs.push([item.closest('section')?.id ?? '', event.propertyName]);
          },
          true,
        );
      });
      await page.goto('/');
      const id = await section(page).getAttribute('id');
      await page.evaluate(
        () => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))),
      );
      const runs = await page.evaluate(
        () => (window as unknown as { cardRuns: string[][] }).cardRuns,
      );
      expect(
        runs.filter(([at]) => at === id).map(([, property]) => property),
        'no transition on load',
      ).toEqual([]);
    });
  });

  test.describe('reduced motion', () => {
    test.use({ reducedMotion: 'reduce' });

    test('the box fills at once, without fading', async ({ page }) => {
      await page.goto('/');
      const palettes = await arrowPalettes(page);
      const leadIndex = serviceCards.findIndex((card) => card.id === LEAD_CARD);
      const lead = surface(items(page).nth(leadIndex));
      const other = surface(items(page).nth(leadIndex === 0 ? 1 : 0));
      expect((await arrowBoxLook(lead)).fade).toBe('0s');
      expect((await arrowBoxLook(other)).fade).toBe('0s');
      if (await canHover(page)) {
        await lead.hover();
        expect(await arrowColours(lead)).toEqual(palettes.lead.active);
        await page.mouse.move(0, 0);
        await other.hover();
        expect(await arrowColours(other)).toEqual(palettes.standard.active);
      }
    });
  });
});

test.describe('linked cards', () => {
  test.skip(
    firstLinked < 0,
    'No card has a destination yet: no service page and no inquiry page exist (docs/content-strategy.md, "Service cards on the home page").',
  );

  test('Tab reaches every card in order with a visible ring, and Enter follows it', async ({
    page,
    browserName,
  }) => {
    await page.goto('/');
    // The cards' links only: "View all services" above them is a link too once its page ships.
    const anchors = section(page).getByRole('list').getByRole('link');
    const count = cards.filter(({ link }) => link).length;
    await expect(anchors).toHaveCount(count);

    await tabTo(page, anchors.first(), browserName);
    for (let i = 0; i < count; i += 1) {
      const anchor = anchors.nth(i);
      await expect(anchor).toBeFocused();
      await expect(anchor).toHaveCSS('outline-style', 'solid');
      await expect(anchor).toHaveCSS('outline-width', '2px');
      await expect(anchor).toHaveCSS('outline-offset', '4px');
      if (i < count - 1) await page.keyboard.press(tabKey(browserName));
    }

    const target = new URL((await anchors.last().getAttribute('href'))!, page.url()).href;
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(target);
  });

  test.describe('motion allowed', () => {
    test.use({ reducedMotion: 'no-preference' });

    test("keyboard focus fills the arrow's box and shows the frame the same way", async ({
      page,
      browserName,
    }) => {
      await page.goto('/');
      const palettes = await arrowPalettes(page);
      const anchor = items(page).nth(firstLinked).getByRole('link');
      const rest = { arrow: await arrowOffset(anchor), boxes: await cardBoxes(page) };

      await tabTo(page, anchor, browserName);
      await expect
        .poll(() => arrowColours(anchor), 'the box fills')
        .toEqual(paletteFor(cards[firstLinked].card.id, palettes).active);
      expectSamePlace([await arrowOffset(anchor)], [rest.arrow], 'the arrow stays');
      expectSamePlace(await cardBoxes(page), rest.boxes, 'no card moves or resizes');
      await expect.poll(async () => (await frameOf(anchor)).opacity, "Hub2B's frame").toBe('1');
    });
  });

  test.describe('reduced motion', () => {
    test.use({ reducedMotion: 'reduce' });

    test('the box fills at once under keyboard focus, and the ring shows', async ({
      page,
      browserName,
    }) => {
      await page.goto('/');
      const palettes = await arrowPalettes(page);
      const anchor = items(page).nth(firstLinked).getByRole('link');

      await tabTo(page, anchor, browserName);
      expect(await arrowColours(anchor)).toEqual(
        paletteFor(cards[firstLinked].card.id, palettes).active,
      );
      await expect(anchor).toHaveCSS('outline-style', 'solid');
    });
  });
});
