import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { industries, primaryCta } from '../../src/data/site';

/**
 * Home page "Who we work with" (src/components/sections/WhoWeWorkWith.astro), after Why Auralink
 * Studio and before the process, where selected work was until 2026-11-18, after the owner's mockup of
 * 2026-11-19. On the `primary` band: the eyebrow, the heading, and the sentence on the shared
 * container's left edge; the kinds of business in `industries` as one flat white directory, four
 * columns from lg, two from sm, one on phones, filled row by row, its cells touching across 1px
 * grey rules and every row as tall as the others (105-115px from lg); in each cell the entry's
 * decorative 24px icon, 16px before the name and centred beside it; then, 40px below, "Don't see
 * your business here?" and the flat charcoal "Let's talk", which follows the navbar's call to
 * action (`primaryCta`). Under a fine hovering pointer the cell beneath it, and only that one,
 * fills `#141817` and turns its name, icon, and underline white over 240ms (at once under reduced
 * motion), moving nothing; a coarse pointer never sees that hover. At rest every cell is white,
 * Automotive included. No industry page exists, so nothing in the list is a link or a tab stop.
 * No client-side JavaScript.
 *
 * Boxes and styles are read in one `evaluate` on a CSS-located container: Playwright's Firefox
 * crashes on `evaluateAll` inside a region found by its name (testing-playwright.mdc). The layout
 * tests resize one loaded page rather than reload it per width: the section is CSS only, and with a
 * reload per width (the hero's image decoded each time) the hero suite's image sampling failed in
 * mobile WebKit during full parallel runs.
 */
const EYEBROW = 'Who we work with';
const HEADING = 'Built for businesses like yours.';
const SENTENCE = 'Websites and email marketing built around your business.';
const QUESTION = "Don't see your business here?";
const ACTION = "Let's talk";
const NAMES = industries.map(({ name }) => name);
/** The hover fill and ink, the secondary pair in src/styles/global.css (`#141817` on white). */
const HOVER_FILL = '#141817';
const HOVER_INK = '#ffffff';
/** Every width the layout suite checks, the first at two columns, and the last before xl. */
const WIDTHS = [360, 390, 640, 768, 1024, 1279, 1280, 1440, 1920];

const section = (page: Page) => page.getByRole('region', { name: HEADING });
const list = (page: Page) => page.locator('#who-we-work-with ul');
const cells = (page: Page) => page.locator('#who-we-work-with li');
/** One column on phones, two from sm (640px), four from lg (1024px). */
const columnsAt = (width: number) => (width >= 1024 ? 4 : width >= 640 ? 2 : 1);
const canHover = (page: Page) =>
  page.evaluate(() => matchMedia('(hover: hover) and (pointer: fine)').matches);

function near(actual: number, expected: number, message: string, tolerance = 0.5) {
  expect(
    Math.abs(actual - expected),
    `${message}: ${actual} against ${expected}`,
  ).toBeLessThanOrEqual(tolerance);
}

/** A CSS colour as the browser computes it, to compare with computed styles. */
const colour = (page: Page, value: string) =>
  page.evaluate((css) => {
    const probe = document.createElement('i');
    probe.style.color = css;
    document.body.append(probe);
    const computed = getComputedStyle(probe).color;
    probe.remove();
    return computed;
  }, value);

/**
 * CSS colours as the RGBA bytes a 1x1 canvas paints them in. Bytes, not computed strings, because
 * engines write one colour in different notations: after a fade Firefox gives the underline as
 * `color(srgb …)`, the stylesheet's `oklch(…)` in sRGB. A probe resolves `var()` and `color-mix()`
 * first, which a canvas cannot.
 */
const paint = (page: Page, values: string[]) =>
  page.evaluate((colours) => {
    const probe = document.createElement('i');
    document.body.append(probe);
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const context = canvas.getContext('2d', { willReadFrequently: true })!;
    const bytes = colours.map((value) => {
      probe.style.color = value;
      context.clearRect(0, 0, 1, 1);
      context.fillStyle = getComputedStyle(probe).color;
      context.fillRect(0, 0, 1, 1);
      return [...context.getImageData(0, 0, 1, 1).data];
    });
    probe.remove();
    return bytes;
  }, values);

/**
 * Every cell's fill, underline, label, and icon, in list order, read in one frame, as painted.
 * The icon is compared with the label: its stroke is `currentColor`, so the two colours match,
 * or the stroke is still the keyword. `fill` on the svg stays `none` (outline icons).
 */
const looks = async (page: Page) => {
  const computed = await list(page).evaluate((element) =>
    Array.from(element.children, (item) => {
      const name = item.querySelector('[data-directory-name]')!;
      const icon = item.querySelector('svg')!;
      const itemStyle = getComputedStyle(item);
      const nameStyle = getComputedStyle(name);
      const iconStyle = getComputedStyle(icon);
      return {
        colors: [
          itemStyle.backgroundColor,
          nameStyle.textDecorationColor,
          nameStyle.color,
          iconStyle.color,
        ],
        strokeFollows:
          iconStyle.stroke === iconStyle.color || iconStyle.stroke.toLowerCase() === 'currentcolor',
        iconFill: iconStyle.fill,
      };
    }),
  );
  const bytes = await paint(
    page,
    computed.flatMap((cell) => cell.colors),
  );
  return computed.map((cell, i) => ({
    fill: bytes[i * 4],
    underline: bytes[i * 4 + 1],
    ink: bytes[i * 4 + 2],
    icon: bytes[i * 4 + 3],
    strokeFollows: cell.strokeFollows,
    iconFill: cell.iconFill,
  }));
};

/** Decoration and motion on every cell, separate from the painted colours `looks` compares. */
const chrome = (page: Page) =>
  list(page).evaluate((element) =>
    Array.from(element.children, (item) => {
      const style = getComputedStyle(item);
      const name = getComputedStyle(item.querySelector('[data-directory-name]')!);
      return {
        shadow: style.boxShadow,
        transform: style.transform,
        cursor: style.cursor,
        decoration: [
          name.textDecorationLine,
          name.textDecorationThickness,
          name.textUnderlineOffset,
        ],
      };
    }),
  );

/** The look of a cell at rest and under the pointer, as `looks` reports the painted colours. */
const directoryLooks = async (page: Page) => {
  const [white, clear, charcoal, dark, paper, secondary, secondaryInk] = await paint(page, [
    'var(--color-base-100)',
    'transparent',
    'var(--color-base-content)',
    HOVER_FILL,
    HOVER_INK,
    'var(--color-secondary)',
    'var(--color-secondary-content)',
  ]);
  expect(secondary, 'secondary is #141817').toEqual(dark);
  expect(secondaryInk, 'secondary label is pure white').toEqual(paper);
  return {
    rest: { fill: white, underline: clear, ink: charcoal, icon: charcoal },
    active: { fill: dark, underline: paper, ink: paper, icon: paper },
  };
};

/** The painted colours of one cell, without the icon's stroke check. */
const coloursOf = ({
  fill,
  underline,
  ink,
  icon,
}: {
  fill: number[];
  underline: number[];
  ink: number[];
  icon: number[];
}) => ({ fill, underline, ink, icon });

interface DirectoryWindow extends Window {
  directoryRuns: { prop: string; duration: number; easing: string }[][];
  directoryMids: { start: string; mid: string; iconStart: string; iconMid: string }[];
  directoryEnds: number[];
}

/** How many lines each name occupies. The name is a flex item, so its own box is one rect; a range counts the lines. */
const lineCounts = (page: Page) =>
  list(page).evaluate((element) =>
    Array.from(element.querySelectorAll('[data-directory-name]'), (name) => {
      const range = document.createRange();
      range.selectNodeContents(name);
      return range.getClientRects().length;
    }),
  );

/**
 * Every cell's box relative to the list, in one frame. Relative, because hovering scrolls a cell
 * into view.
 */
const boxes = (page: Page) =>
  list(page).evaluate((element) => {
    const origin = element.getBoundingClientRect();
    return Array.from(element.children, (item) => {
      const { x, y, width, height } = item.getBoundingClientRect();
      return [x - origin.x, y - origin.y, width, height];
    });
  });

/** Same positions and sizes to within 0.01px; a real shift is a pixel or more. */
function expectSamePlace(actual: number[][], expected: number[][], message: string) {
  expect(actual.length, message).toBe(expected.length);
  actual.forEach((values, i) =>
    values.forEach((value, j) =>
      expect(Math.abs(value - expected[i][j]), `${message} (${i}, ${j})`).toBeLessThan(0.01),
    ),
  );
}

/** The `d` of every path in an icon's file, in order: what the page should draw for it. */
const pathsOf = (icon: string) =>
  Array.from(
    readFileSync(join(process.cwd(), 'src/assets/icons', `${icon}.svg`), 'utf8').matchAll(
      /\sd="([^"]+)"/g,
    ),
    ([, d]) => d,
  );

test('sits between why auralink and the process, in the place of selected work', async ({
  page,
}) => {
  await page.goto('/');
  await expect(section(page)).toHaveAttribute('id', 'who-we-work-with');
  const ids = await page.evaluate(() =>
    Array.from(document.querySelectorAll('section[id]'), (element) => element.id),
  );
  const at = ids.indexOf('who-we-work-with');
  expect(ids[at - 1], 'after why auralink').toBe('why-auralink');
  expect(ids[at + 1], 'before the process').toBe('process');
  await expect(page.locator('#work')).toHaveCount(0);
});

test('introduces the directory, then lists every kind of business in order, each with its own icon', async ({
  page,
}) => {
  await page.goto('/');
  const region = section(page);
  await expect(region.getByRole('heading')).toHaveCount(1);
  await expect(region.getByRole('heading', { level: 2 })).toHaveText(HEADING);
  const eyebrow = region.getByText(EYEBROW, { exact: true });
  await expect(eyebrow).toBeVisible();
  await expect(eyebrow).toHaveCSS('text-transform', 'uppercase');
  await expect(region.getByText(SENTENCE, { exact: true })).toBeVisible();

  await expect(region.getByRole('list').getByRole('listitem')).toHaveText(NAMES);
  const entries = await list(page).evaluate((element) =>
    Array.from(element.children, (item) => {
      const icon = item.querySelector('svg');
      return {
        parts: Array.from(item.children, (child) => child.tagName.toLowerCase()),
        hidden: icon?.getAttribute('aria-hidden'),
        focusable: icon?.getAttribute('focusable'),
        stroke: icon?.getAttribute('stroke-width'),
        paths: Array.from(icon?.querySelectorAll('path') ?? [], (path) => path.getAttribute('d')),
      };
    }),
  );
  for (const [index, { name, icon }] of industries.entries()) {
    expect(entries[index], `${name}: a decorative icon, then the name`).toEqual({
      parts: ['svg', 'span'],
      hidden: 'true',
      focusable: 'false',
      stroke: '1.75',
      paths: pathsOf(icon),
    });
  }
  // Plain text: no industry page exists, so nothing to follow and nothing to tab to.
  await expect(
    region.getByRole('list').locator('a, button, input, [tabindex], img, picture'),
  ).toHaveCount(0);

  await expect(region.getByText(QUESTION, { exact: true })).toBeVisible();
  await expect(region.getByText(ACTION, { exact: true })).toBeVisible();
});

test('a yellow band around one flat white panel, its cells touching across thin grey rules', async ({
  page,
}) => {
  await page.goto('/');
  const [primary, white, rule] = [
    await colour(page, 'var(--color-primary)'),
    await colour(page, 'var(--color-base-100)'),
    await colour(page, 'var(--color-base-300)'),
  ];
  const look = await page.locator('#who-we-work-with').evaluate((band) => {
    const panel = band.querySelector('ul')!;
    const surface = (el: Element) => {
      const style = getComputedStyle(el);
      return {
        fill: style.backgroundColor,
        radius: style.borderRadius,
        shadow: style.boxShadow,
        border: style.borderTopWidth,
      };
    };
    const { left, width } = band.getBoundingClientRect();
    return {
      band: { fill: getComputedStyle(band).backgroundColor, left, width },
      viewport: document.documentElement.clientWidth,
      panel: {
        ...surface(panel),
        gaps: [getComputedStyle(panel).rowGap, getComputedStyle(panel).columnGap],
      },
      cells: Array.from(panel.children, surface),
    };
  });
  expect(look.band, 'the band spans the page in primary').toEqual({
    fill: primary,
    left: 0,
    width: look.viewport,
  });
  // The 1px gaps show the panel's grey: the rules. An opaque grey, so no yellow shows through.
  expect(look.panel).toEqual({
    fill: rule,
    radius: '0px',
    shadow: 'none',
    border: '0px',
    gaps: ['1px', '1px'],
  });
  for (const [index, cell] of look.cells.entries()) {
    expect(cell, `${NAMES[index]}: square, flat, white`).toEqual({
      fill: white,
      radius: '0px',
      shadow: 'none',
      border: '0px',
    });
  }
});

test('four columns from lg, two from sm, one on phones: equal cells, equal rows, read row by row', async ({
  page,
}) => {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  for (const width of WIDTHS) {
    await page.setViewportSize({ width, height: 900 });
    const columns = columnsAt(width);
    const [panelWidth, panelHeight] = await list(page).evaluate((element) => [
      element.getBoundingClientRect().width,
      element.getBoundingClientRect().height,
    ]);
    const grid = (await boxes(page)).map(([left, top, cellWidth, height]) => ({
      left,
      top,
      right: left + cellWidth,
      bottom: top + height,
      width: cellWidth,
      height,
    }));
    const lefts = [...new Set(grid.map(({ left }) => Math.round(left)))].sort((a, b) => a - b);
    expect(lefts, `${width}px: ${columns} column(s)`).toHaveLength(columns);

    const [first] = grid;
    for (const [index, cell] of grid.entries()) {
      const name = NAMES[index];
      const [row, column] = [Math.floor(index / columns), index % columns];
      expect(Math.round(cell.left), `${width}px: ${name} in column ${column + 1}`).toBe(
        lefts[column],
      );
      near(cell.width, first.width, `${width}px: ${name} as wide as the others`);
      near(cell.height, first.height, `${width}px: ${name} as tall as the others`);
      near(cell.top, row * (first.height + 1), `${width}px: ${name} on row ${row + 1}`);
      if (column > 0) {
        near(cell.left - grid[index - 1].right, 1, `${width}px: ${name} 1px from its neighbour`);
      }
    }
    // The cells fill the panel to its edges, so no grey shows but the rules.
    near(grid[columns - 1].right, panelWidth, `${width}px: the last column ends the panel`);
    near(grid[grid.length - 1].bottom, panelHeight, `${width}px: the last row ends the panel`);
    if (width >= 1024) {
      expect(first.height, `${width}px: rows about 112px tall`).toBeGreaterThanOrEqual(105);
      expect(first.height, `${width}px: rows about 112px tall`).toBeLessThanOrEqual(115);
    }
  }
});

test('every cell: 24px padding, a 24px icon 16px before the name and centred beside it, the name whole and quieter than the headings', async ({
  page,
}) => {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  for (const width of [360, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const { anatomy, heading, cardTitle } = await page.evaluate(() => {
      const panel = document.querySelector('#who-we-work-with ul')!;
      return {
        heading: parseFloat(
          getComputedStyle(document.querySelector('#who-we-work-with h2')!).fontSize,
        ),
        cardTitle: parseFloat(getComputedStyle(document.querySelector('#services h3')!).fontSize),
        anatomy: Array.from(panel.children, (item) => {
          const style = getComputedStyle(item);
          const box = item.getBoundingClientRect();
          const icon = item.querySelector('svg')!.getBoundingClientRect();
          const name = item.querySelector('[data-directory-name]')!;
          const label = name.getBoundingClientRect();
          const range = document.createRange();
          range.selectNodeContents(name);
          const text = range.getBoundingClientRect();
          return {
            padding: [style.paddingTop, style.paddingRight, style.paddingBottom, style.paddingLeft],
            icon: { width: icon.width, height: icon.height, inset: icon.left - box.left },
            gap: label.left - icon.right,
            offCentre: icon.top + icon.height / 2 - (label.top + label.height / 2),
            size: parseFloat(getComputedStyle(name).fontSize),
            weight: getComputedStyle(name).fontWeight,
            overflow: name.scrollWidth - name.clientWidth,
            inside:
              text.left >= box.left + 24 - 0.5 &&
              text.right <= box.right - 24 + 0.5 &&
              text.top >= box.top - 0.5 &&
              text.bottom <= box.bottom + 0.5,
          };
        }),
      };
    });
    expect(new Set(anatomy.map(({ size }) => size)).size, `${width}px: one size for all`).toBe(1);
    for (const [index, cell] of anatomy.entries()) {
      const name = `${width}px: ${NAMES[index]}`;
      expect(cell.padding, `${name}: 24px padding`).toEqual(['24px', '24px', '24px', '24px']);
      expect([cell.icon.width, cell.icon.height], `${name}: a 24px icon`).toEqual([24, 24]);
      near(cell.icon.inset, 24, `${name}: the icon starts inside the padding`);
      near(cell.gap, 16, `${name}: 16px between icon and name`);
      near(cell.offCentre, 0, `${name}: the icon centred on the name`);
      expect(cell.size, `${name}: 16-18px`).toBeGreaterThanOrEqual(16);
      expect(cell.size, `${name}: 16-18px`).toBeLessThanOrEqual(18);
      expect(cell.size, `${name}: quieter than the heading`).toBeLessThan(heading);
      expect(cell.size, `${name}: quieter than the service cards`).toBeLessThan(cardTitle);
      expect(cell.weight, `${name}: medium`).toBe('500');
      expect(cell.overflow, `${name} fits its cell`).toBeLessThanOrEqual(0);
      expect(cell.inside, `${name} wraps inside its cell`).toBe(true);
    }
  }
});

test("everything starts on the shared container's left edge, at every width", async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  for (const width of WIDTHS) {
    await page.setViewportSize({ width, height: 900 });
    const layout = await page.evaluate(() => {
      const start = (el: Element) => {
        const range = document.createRange();
        range.selectNodeContents(el);
        return range.getBoundingClientRect().left;
      };
      /** Where a section's content starts and ends: its container inside the padding. */
      const content = (id: string) => {
        const container = document.getElementById(id)!.firstElementChild!;
        const { left, right } = container.getBoundingClientRect();
        const style = getComputedStyle(container);
        return [left + parseFloat(style.paddingLeft), right - parseFloat(style.paddingRight)];
      };
      const region = document.getElementById('who-we-work-with')!;
      const [edge, end] = content('who-we-work-with');
      const panel = region.querySelector('ul')!.getBoundingClientRect();
      const row = region.querySelector('ul')!.nextElementSibling!;
      const question = row.querySelector('p')!;
      const action = row.querySelector('.btn')!.getBoundingClientRect();
      const asked = question.getBoundingClientRect();
      return {
        neighbours: [content('services')[0] - edge, content('process')[0] - edge],
        parts: {
          eyebrow: start(region.querySelector('h2')!.previousElementSibling!) - edge,
          heading: start(region.querySelector('h2')!) - edge,
          sentence: start(region.querySelector('h2 + p')!) - edge,
          panel: panel.left - edge,
          question: start(question) - edge,
        },
        panelEnd: panel.right - end,
        gapAbove: row.getBoundingClientRect().top - panel.bottom,
        action: {
          beside: action.left > asked.right,
          offCentre: action.top + action.height / 2 - (asked.top + asked.height / 2),
          offEdge: action.left - edge,
          below: action.top >= asked.bottom,
        },
      };
    });
    for (const offset of layout.neighbours) {
      near(offset, 0, `${width}px: the edge the sections around it share`);
    }
    for (const [part, offset] of Object.entries(layout.parts)) {
      near(offset, 0, `${width}px: the ${part} starts at the edge`);
    }
    near(layout.panelEnd, 0, `${width}px: the panel spans the container`);
    expect(
      layout.gapAbove,
      `${width}px: about 40px of yellow above the closing row`,
    ).toBeGreaterThanOrEqual(36);
    expect(
      layout.gapAbove,
      `${width}px: about 40px of yellow above the closing row`,
    ).toBeLessThanOrEqual(44);
    // "Let's talk" follows the question on its row, or starts the next one at the edge.
    if (layout.action.beside) {
      near(layout.action.offCentre, 0, `${width}px: the button centred on the question`);
    } else {
      expect(layout.action.below, `${width}px: the button under the question`).toBe(true);
      near(layout.action.offEdge, 0, `${width}px: the button starts at the edge`);
    }
  }
});

test("Let's talk: a flat charcoal pill with a light label and an arrow, following the navbar", async ({
  page,
}) => {
  await page.goto('/');
  const region = section(page);
  const action = region.getByText(ACTION, { exact: true });
  await expect(action).toHaveClass(/\bbtn\b/);
  await expect(action).toHaveClass(/\bbtn-neutral\b/);
  const look = await action.evaluate((el) => {
    const style = getComputedStyle(el);
    const arrow = el.querySelector('svg');
    return {
      fill: style.backgroundColor,
      image: style.backgroundImage,
      label: style.color,
      radius: parseFloat(style.borderTopLeftRadius),
      height: parseFloat(style.height),
      shadows: style.boxShadow === 'none' ? [] : style.boxShadow.split(/,(?![^(]*\))/),
      textShadow: style.textShadow,
      arrow: [arrow?.getAttribute('aria-hidden'), arrow?.getAttribute('focusable')],
    };
  });
  expect(look.fill, 'charcoal').toBe(await colour(page, 'var(--color-neutral)'));
  expect(look.image, 'a flat fill: no gradient or texture').toBe('none');
  expect(look.label, 'a light label').toBe(await colour(page, 'var(--color-neutral-content)'));
  expect(look.radius, 'a pill, like the other buttons').toBeGreaterThanOrEqual(look.height / 2);
  for (const shadow of look.shadows) {
    expect(shadow, 'no shadow or glow').toMatch(/rgba\(0, 0, 0, 0\)|transparent/);
  }
  expect(look.textShadow).toBe('none');
  expect(look.arrow, 'the arrow is decorative').toEqual(['true', 'false']);

  if (primaryCta.href) {
    await expect(region.getByRole('link', { name: ACTION })).toHaveAttribute(
      'href',
      primaryCta.href,
    );
  } else {
    // A placeholder until the inquiry page ships, as the navbar's own button is.
    await expect(action).not.toHaveAttribute('href');
    await expect(region.getByRole('link')).toHaveCount(0);
  }
});

test.describe('the hover', () => {
  test.describe('motion allowed', () => {
    test.use({ reducedMotion: 'no-preference' });

    test('at rest every cell is white with its underline hidden, Automotive included', async ({
      page,
    }) => {
      await page.goto('/');
      await page.mouse.move(0, 0);
      const { rest } = await directoryLooks(page);
      const seen = await looks(page);
      expect(seen.map(coloursOf)).toEqual(NAMES.map(() => rest));
      for (const [index, cell] of seen.entries()) {
        expect(cell.strokeFollows, `${NAMES[index]}: the icon uses currentColor`).toBe(true);
        expect(cell.iconFill, `${NAMES[index]}: an outline icon`).toBe('none');
      }
      const still = {
        shadow: 'none',
        transform: 'none',
        cursor: 'auto',
        decoration: ['underline', '1px', '5px'],
      };
      expect(await chrome(page)).toEqual(NAMES.map(() => still));
      const timing = await cells(page).evaluateAll((items) =>
        items.map((item) => {
          const style = getComputedStyle(item);
          return [
            style.transitionProperty,
            style.transitionDuration,
            style.transitionTimingFunction,
          ];
        }),
      );
      for (const [index, values] of timing.entries()) {
        const [property, duration, timingFunction] = values;
        expect(property, `${NAMES[index]}: only the fill, ink, and underline`).toBe(
          '--directory-fill, --directory-ink, --directory-rule',
        );
        expect(new Set(duration.split(', ')), `${NAMES[index]}: 240ms`).toEqual(new Set(['0.24s']));
        expect(new Set(timingFunction.split(', ')), `${NAMES[index]}: ease`).toEqual(
          new Set(['ease']),
        );
      }
    });

    test('under the pointer each cell, and only that one, fills near-black and turns its name and icon white, and nothing moves', async ({
      page,
    }) => {
      await page.goto('/');
      test.skip(!(await canHover(page)), 'Touch screens have no hover; every cell stays white.');
      await page.setViewportSize({ width: 1024, height: 900 });
      await page.evaluate(() => document.fonts.ready);
      const { rest, active } = await directoryLooks(page);
      const lines = await lineCounts(page);
      const wrappedAt = lines.findIndex((count) => count > 1);
      expect(wrappedAt, 'a name wraps onto more than one line').toBeGreaterThanOrEqual(0);

      await page.mouse.move(0, 0);
      const before = await boxes(page);
      for (const [index, name] of NAMES.entries()) {
        await cells(page).nth(index).hover();
        await expect
          .poll(async () => (await looks(page)).map(coloursOf), {
            message: `${name} under the pointer, every other cell at rest`,
          })
          .toEqual(NAMES.map((_, i) => (i === index ? active : rest)));
        const seen = await looks(page);
        expect(seen[index].strokeFollows, `${name}: the icon turns white with the label`).toBe(
          true,
        );
        expect(seen[index].iconFill, `${name}: the icon stays an outline`).toBe('none');
        expect((await chrome(page))[index], `${name}: underlined, still, ordinary cursor`).toEqual({
          shadow: 'none',
          transform: 'none',
          cursor: 'auto',
          decoration: ['underline', '1px', '5px'],
        });
        expect((await lineCounts(page))[index], `${name}: the underline does not reflow`).toBe(
          lines[index],
        );
        expectSamePlace(await boxes(page), before, `${name}: no cell moves or resizes`);
      }
      await page.mouse.move(0, 0);
      await expect
        .poll(async () => (await looks(page)).map(coloursOf), {
          message: 'every cell at rest once the pointer leaves',
        })
        .toEqual(NAMES.map(() => rest));
    });

    test('the fill, the ink, and the underline fade in and back out over 240ms', async ({
      page,
    }) => {
      await page.goto('/');
      test.skip(!(await canHover(page)), 'Touch screens have no hover; nothing fades.');
      await page.evaluate(() => {
        const runs: { prop: string; duration: number; easing: string }[][] = [];
        const mids: { start: string; mid: string; iconStart: string; iconMid: string }[] = [];
        const ends: number[] = [];
        Object.assign(window, { directoryRuns: runs, directoryMids: mids, directoryEnds: ends });
        const cellOf = (target: EventTarget | null) =>
          target instanceof HTMLElement && target.matches('#who-we-work-with li') ? target : null;
        document.addEventListener(
          'transitionrun',
          (event) => {
            const item = cellOf(event.target);
            if (!item || event.propertyName !== '--directory-fill') return;
            const icon = item.querySelector('svg');
            if (!icon) return;
            const start = getComputedStyle(item).backgroundColor;
            const iconStart = getComputedStyle(icon).color;
            runs.push(
              item.getAnimations().flatMap((anim) => {
                if (!(anim instanceof CSSTransition) || !anim.effect) return [];
                const { duration, easing } = anim.effect.getTiming();
                return [
                  {
                    prop: anim.transitionProperty,
                    duration: typeof duration === 'number' ? duration : -1,
                    easing: String(easing),
                  },
                ];
              }),
            );
            // Sample once the fade's own clock is past 70ms. A fixed timeout can run before
            // the first interpolated frame, so the colour still reads as the start.
            const sampleMid = () => {
              const transition = item
                .getAnimations()
                .find(
                  (anim): anim is CSSTransition =>
                    anim instanceof CSSTransition && anim.transitionProperty === '--directory-fill',
                );
              const now = transition?.currentTime;
              if (typeof now !== 'number' || now < 70) {
                requestAnimationFrame(sampleMid);
                return;
              }
              mids.push({
                start,
                mid: getComputedStyle(item).backgroundColor,
                iconStart,
                iconMid: getComputedStyle(icon).color,
              });
            };
            requestAnimationFrame(sampleMid);
          },
          true,
        );
        document.addEventListener(
          'transitionend',
          (event) => {
            if (!cellOf(event.target) || event.propertyName !== '--directory-fill') return;
            ends.push(event.elapsedTime);
          },
          true,
        );
      });
      const trace = () =>
        page.evaluate(() => {
          const recorded = window as unknown as DirectoryWindow;
          return {
            mids: recorded.directoryMids.length,
            ends: recorded.directoryEnds.length,
          };
        });
      const automotive = cells(page).nth(NAMES.indexOf('Automotive'));
      await automotive.hover();
      await expect.poll(trace, { message: 'the fade in finishes' }).toEqual({ mids: 1, ends: 1 });
      await page.mouse.move(0, 0);
      await expect.poll(trace, { message: 'the fade out finishes' }).toEqual({ mids: 2, ends: 2 });
      const { runs, mids, ends } = await page.evaluate(() => {
        const recorded = window as unknown as DirectoryWindow;
        return {
          runs: recorded.directoryRuns,
          mids: recorded.directoryMids,
          ends: recorded.directoryEnds,
        };
      });
      const fade = [
        { prop: '--directory-fill', duration: 240, easing: 'ease' },
        { prop: '--directory-ink', duration: 240, easing: 'ease' },
        { prop: '--directory-rule', duration: 240, easing: 'ease' },
      ];
      const byName = (list: { prop: string; duration: number; easing: string }[]) =>
        [...list].sort((a, b) => a.prop.localeCompare(b.prop));
      expect(runs.map(byName), 'entering and leaving each fade the same three properties').toEqual([
        byName(fade),
        byName(fade),
      ]);
      expect(ends, 'both directions run for 240ms').toHaveLength(2);
      // Firefox reports 240ms as 0.23999999463558197s. That is still 240ms.
      for (const elapsed of ends) expect(elapsed).toBeCloseTo(0.24, 3);
      for (const sample of mids) {
        expect(sample.mid, 'the fill is between its two colours').not.toBe(sample.start);
        expect(sample.iconMid, 'the icon colour is between its two colours').not.toBe(
          sample.iconStart,
        );
      }
    });

    test('no cell fades anything in on load, even as the stylesheet arrives', async ({ page }) => {
      // WebKit can style the page before the stylesheet applies; a plain colour transition would
      // then fade every cell in from the browser's defaults (`directory-cell` in global.css).
      await page.addInitScript(() => {
        const runs: string[] = [];
        Object.assign(window, { directoryRuns: runs });
        document.addEventListener(
          'transitionrun',
          (event) => {
            if ((event.target as Element).closest('#who-we-work-with li')) {
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
      const runs = await page.evaluate(
        () => (window as unknown as { directoryRuns: string[] }).directoryRuns,
      );
      expect(runs, 'no transition on load').toEqual([]);
    });
  });

  test.describe('reduced motion', () => {
    test.use({ reducedMotion: 'reduce' });

    test('the fill and underline show at once, without fading', async ({ page }) => {
      await page.goto('/');
      const automotive = cells(page).nth(NAMES.indexOf('Automotive'));
      await expect(automotive).toHaveCSS('transition-duration', '0s');
      if (await canHover(page)) {
        const { active } = await directoryLooks(page);
        await automotive.hover();
        expect((await looks(page)).map(coloursOf)[NAMES.indexOf('Automotive')]).toEqual(active);
      }
    });
  });
});

test('a coarse pointer does not leave a cell dark', async ({ page }) => {
  await page.goto('/');
  test.skip(await canHover(page), 'A fine hovering pointer is covered with the other hover tests.');
  const { rest } = await directoryLooks(page);
  await cells(page).first().click();
  expect((await looks(page)).map(coloursOf)).toEqual(NAMES.map(() => rest));
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('the section renders in full', async ({ page }) => {
    await page.goto('/');
    await expect(section(page).getByRole('listitem')).toHaveText(NAMES);
    await expect(section(page).getByText(ACTION, { exact: true })).toBeVisible();
    await expect(section(page).locator('script, astro-island, img')).toHaveCount(0);
  });
});
