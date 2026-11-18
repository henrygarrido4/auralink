import { expect, test, type Locator, type Page } from '@playwright/test';
import { serviceCards, services, servicesCta } from '../../src/data/site';
import { serviceCardLink } from '../../src/lib/service-cards';

/**
 * Home page services section (src/components/sections/Services.astro): the introduction, ending
 * with the primary call to view all services, and one card (a tile) per `serviceCards` entry, laid
 * out after the Hub2B reference: from xl a four-column grid with the introduction in its first two
 * cells, two tiles beside it and four below. Under the pointer every card fades in Hub2B's frame.
 * Each card links where src/lib/service-cards.ts says (its service page, else the inquiry page) or,
 * with nowhere to go, is no link at all. A linked card is a single link whose arrow shows before any
 * hover and slides 3-4px toward its point under the pointer or keyboard focus, never under reduced
 * motion, while nothing moves or resizes. The section needs no client-side JavaScript.
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
const arrowOf = (anchor: Locator) => anchor.locator('svg').last();
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
const arrowOffset = (anchor: Locator) =>
  anchor.evaluate((card) => {
    const icons = card.querySelectorAll('svg');
    const arrow = icons[icons.length - 1].getBoundingClientRect();
    const box = card.getBoundingClientRect();
    return [arrow.x - box.x, arrow.y - box.y];
  });

/** Waits for the arrow's slide (a 150ms transition) to finish. */
const arrowSettled = (anchor: Locator) =>
  arrowOf(anchor).evaluate((el) => Promise.all(el.getAnimations().map((a) => a.finished)));

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
      await expect(anchor).toHaveAccessibleName(`${card.title} ${link.label}`);
      await expect(anchor).toHaveAccessibleDescription(card.description);
      await expect(anchor.getByText(link.label, { exact: true })).toBeVisible();
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
      // Nowhere to go yet: nothing to click, no action, no arrow.
      await expect(item.locator('a, button, [tabindex]'), card.title).toHaveCount(0);
      await expect(item.getByText(ACTION_LABEL), card.title).toHaveCount(0);
      await expect(item.locator('svg'), `${card.title}: its icon only`).toHaveCount(1);
    }
  }
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

test('cards keep the reference look: white, square, borderless, centred, under a large icon', async ({
  page,
}) => {
  await page.goto('/');
  const white = await tokenColour(page, '--color-base-100');
  const primary = await tokenColour(page, '--color-primary');
  for (const [index, card] of serviceCards.entries()) {
    const look = await surface(items(page).nth(index)).evaluate((el) => {
      const style = getComputedStyle(el);
      const icon = el.querySelector('svg')!;
      const [box, glyph] = [el.getBoundingClientRect(), icon.getBoundingClientRect()];
      return {
        background: style.backgroundColor,
        radius: style.borderRadius,
        shadow: style.boxShadow,
        border: style.borderTopWidth,
        align: style.textAlign,
        icon: [glyph.width, glyph.height, getComputedStyle(icon).color],
        offCentre: Math.abs(glyph.x + glyph.width / 2 - (box.x + box.width / 2)),
      };
    });
    expect(look.background, card.title).toBe(white);
    expect([look.radius, look.shadow, look.border, look.align], card.title).toEqual([
      '0px',
      'none',
      '0px',
      'center',
    ]);
    // Lucide's 24px grid keeps a 2px margin: a 96px icon draws the reference's 80px glyph.
    expect(look.icon, `${card.title}: icon`).toEqual([96, 96, primary]);
    expect(look.offCentre, `${card.title}: icon centred`).toBeLessThan(0.5);
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

test.describe('linked cards', () => {
  test.skip(
    firstLinked < 0,
    'No card has a destination yet: no service page and no inquiry page exist (docs/content-strategy.md, "Service cards on the home page").',
  );

  test('the arrow shows before any hover, on touch screens too', async ({ page }) => {
    await page.goto('/');
    for (const [index, { link }] of cards.entries()) {
      if (!link) continue;
      const arrow = arrowOf(items(page).nth(index).getByRole('link'));
      await expect(arrow).toBeVisible();
      await expect(arrow).toHaveAttribute('aria-hidden', 'true');
      await expect(arrow).toHaveCSS('translate', 'none');
    }
  });

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

    test('under the pointer the arrow slides 3-4px toward its point and nothing else moves', async ({
      page,
    }) => {
      await page.goto('/');
      test.skip(
        !(await canHover(page)),
        'Touch screens have no hover; the arrow stays where it is.',
      );

      const anchor = items(page).nth(firstLinked).getByRole('link');
      const rest = { arrow: await arrowOffset(anchor), boxes: await cardBoxes(page) };

      await anchor.hover();
      await expect
        .poll(async () => (await arrowOffset(anchor))[0] - rest.arrow[0])
        .toBeGreaterThanOrEqual(3);
      await arrowSettled(anchor);
      const [x, y] = await arrowOffset(anchor);
      expect(x - rest.arrow[0], 'toward its point, by 3-4px').toBeLessThanOrEqual(4.05);
      expectSamePlace([[y]], [[rest.arrow[1]]], 'only sideways');
      expectSamePlace(await cardBoxes(page), rest.boxes, 'no card moves or resizes');
      // The frame fades over 300ms, longer than the arrow's 150ms slide.
      await expect.poll(async () => (await frameOf(anchor)).opacity, "Hub2B's frame").toBe('1');

      await page.mouse.move(0, 0);
      await expect
        .poll(async () => Math.abs((await arrowOffset(anchor))[0] - rest.arrow[0]))
        .toBeLessThan(0.01);
    });

    test('keyboard focus moves the arrow and shows the frame the same way', async ({
      page,
      browserName,
    }) => {
      await page.goto('/');
      const anchor = items(page).nth(firstLinked).getByRole('link');
      const rest = { arrow: await arrowOffset(anchor), boxes: await cardBoxes(page) };

      await tabTo(page, anchor, browserName);
      await expect
        .poll(async () => (await arrowOffset(anchor))[0] - rest.arrow[0])
        .toBeGreaterThanOrEqual(3);
      await arrowSettled(anchor);
      expect((await arrowOffset(anchor))[0] - rest.arrow[0]).toBeLessThanOrEqual(4.05);
      expectSamePlace(await cardBoxes(page), rest.boxes, 'no card moves or resizes');
      await expect.poll(async () => (await frameOf(anchor)).opacity, "Hub2B's frame").toBe('1');
    });
  });

  test.describe('reduced motion', () => {
    test.use({ reducedMotion: 'reduce' });

    test('the arrow stays put under the pointer and keyboard focus', async ({
      page,
      browserName,
    }) => {
      await page.goto('/');
      const anchor = items(page).nth(firstLinked).getByRole('link');
      const arrow = arrowOf(anchor);
      const rest = await arrowOffset(anchor);

      if (await canHover(page)) {
        await anchor.hover();
        await expect(arrow).toHaveCSS('translate', 'none');
        expectSamePlace([await arrowOffset(anchor)], [rest], 'still under the pointer');
        await page.mouse.move(0, 0);
      }
      await tabTo(page, anchor, browserName);
      await expect(arrow).toHaveCSS('translate', 'none');
      expectSamePlace([await arrowOffset(anchor)], [rest], 'still under keyboard focus');
      // The ring still shows: only movement is removed.
      await expect(anchor).toHaveCSS('outline-style', 'solid');
    });
  });
});
