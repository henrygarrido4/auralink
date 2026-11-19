import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { industries, primaryCta } from '../../src/data/site';

/**
 * Home page "Who we work with" (src/components/sections/WhoWeWorkWith.astro), between the services
 * and the process, where selected work was until 2026-11-18, after the owner's mockup of
 * 2026-11-19. On the `primary` band: the eyebrow, the heading, and the sentence on the shared
 * container's left edge; the kinds of business in `industries` as one flat white directory, four
 * columns from lg, two from sm, one on phones, filled row by row, its cells touching across 1px
 * grey rules and every row as tall as the others (105-115px from lg); in each cell the entry's
 * decorative 24px icon, 16px before the name and centred beside it; then, 40px below, "Don't see
 * your business here?" and the flat charcoal "Let's talk", which follows the navbar's call to
 * action (`primaryCta`). Under a hovering pointer the cell beneath it, and only that one, turns a
 * very pale yellow and underlines its name over 250ms (at once under reduced motion), moving
 * nothing; at rest every cell is white, Automotive included. No industry page exists, so nothing
 * in the list is a link or a tab stop. No client-side JavaScript.
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
/** The hover fill, mixed as `directory-cell-active` in src/styles/global.css mixes it. */
const PALE_YELLOW = 'color-mix(in oklab, var(--color-primary) 14%, var(--color-base-100))';
/** Every width the layout suite checks, the first at two columns, and the last before xl. */
const WIDTHS = [360, 390, 640, 768, 1024, 1279, 1280, 1440, 1920];

const section = (page: Page) => page.getByRole('region', { name: HEADING });
const list = (page: Page) => page.locator('#who-we-work-with ul');
const cells = (page: Page) => page.locator('#who-we-work-with li');
/** One column on phones, two from sm (640px), four from lg (1024px). */
const columnsAt = (width: number) => (width >= 1024 ? 4 : width >= 640 ? 2 : 1);
const canHover = (page: Page) => page.evaluate(() => matchMedia('(hover: hover)').matches);

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

/** Every cell's fill and its name's underline, in list order, read in one frame, as painted. */
const looks = async (page: Page) => {
  const computed = await list(page).evaluate((element) =>
    Array.from(element.children, (item) => [
      getComputedStyle(item).backgroundColor,
      getComputedStyle(item.querySelector('[data-directory-name]')!).textDecorationColor,
    ]),
  );
  const bytes = await paint(page, computed.flat());
  return computed.map((_, i) => ({ fill: bytes[2 * i], underline: bytes[2 * i + 1] }));
};

/** The look of a cell at rest and under the pointer, as `looks` reports them. */
const directoryLooks = async (page: Page) => {
  const [white, clear, pale, ink] = await paint(page, [
    'var(--color-base-100)',
    'transparent',
    PALE_YELLOW,
    'var(--color-base-content)',
  ]);
  return { rest: { fill: white, underline: clear }, active: { fill: pale, underline: ink } };
};

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

test('sits between the services and the process, in the place of selected work', async ({
  page,
}) => {
  await page.goto('/');
  await expect(section(page)).toHaveAttribute('id', 'who-we-work-with');
  const ids = await page.evaluate(() =>
    Array.from(document.querySelectorAll('section[id]'), (element) => element.id),
  );
  const at = ids.indexOf('who-we-work-with');
  expect(ids[at - 1], 'after the services').toBe('services');
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
      expect(await looks(page)).toEqual(NAMES.map(() => rest));
      const timing = await cells(page).evaluateAll((items) =>
        items.map((item) => {
          const style = getComputedStyle(item);
          const name = getComputedStyle(item.querySelector('[data-directory-name]')!);
          return [
            style.transitionProperty,
            style.transitionDuration,
            style.transitionTimingFunction,
            style.cursor,
            name.textDecorationLine,
            name.textDecorationThickness,
          ];
        }),
      );
      for (const [index, values] of timing.entries()) {
        expect(values, `${NAMES[index]}: fades over 250ms, an ordinary cursor`).toEqual([
          '--directory-fill, --directory-rule',
          '0.25s',
          'ease',
          'auto',
          'underline',
          '1px',
        ]);
      }
    });

    test('under the pointer each cell, and only that one, fades to pale yellow and underlines its name, and nothing moves', async ({
      page,
    }) => {
      await page.goto('/');
      test.skip(!(await canHover(page)), 'Touch screens have no hover; every cell stays white.');
      const { rest, active } = await directoryLooks(page);
      const [red, green, blue] = active.fill;
      expect(Math.min(red, green), 'very pale').toBeGreaterThanOrEqual(245);
      expect(red - blue, 'warm: a tint of the primary yellow').toBeGreaterThanOrEqual(12);

      await page.mouse.move(0, 0);
      const before = await boxes(page);
      for (const [index, name] of NAMES.entries()) {
        await cells(page).nth(index).hover();
        await expect
          .poll(() => looks(page), `${name} under the pointer, every other cell at rest`)
          .toEqual(NAMES.map((_, i) => (i === index ? active : rest)));
        expectSamePlace(await boxes(page), before, `${name}: no cell moves or resizes`);
      }
      await page.mouse.move(0, 0);
      await expect
        .poll(() => looks(page), 'every cell at rest once the pointer leaves')
        .toEqual(NAMES.map(() => rest));
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
        expect((await looks(page))[NAMES.indexOf('Automotive')]).toEqual(active);
      }
    });
  });
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
