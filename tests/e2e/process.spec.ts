import { expect, test, type Locator, type Page } from '@playwright/test';
import { processSteps } from '../../src/data/site';

/**
 * Home page process (src/components/sections/Process.astro), directly under selected work, after
 * the reference the owner named (fdicreative.com, "4 Easy Steps to Launch!"). The four steps from
 * `processSteps` are an ordered list, and each shows an icon, its number, and its title, stacked and
 * centred, as the reference's do. Below md the steps stack, with an arrow pointing down between
 * them; from md they share one row with an arrow pointing across between them, and the icons,
 * numbers, and titles each share a line. The band is the reference's charcoal with fine dark lines
 * over it. Above the steps there is only the heading: no eyebrow, rule, sentence, or button (owner,
 * 2026-11-18). No client-side JavaScript.
 */
const HEADING = 'Four easy steps. From quote to live work.';
/** The reference's band colour, #212121. */
const BAND = [33, 33, 33];

const section = (page: Page) => page.getByRole('region', { name: HEADING });
const items = (page: Page) => section(page).getByRole('listitem');
const numberOf = (item: Locator) => item.locator('span[aria-hidden="true"]').first();
const arrows = (page: Page) => section(page).locator('[data-step-arrow]');

const stepNumber = (index: number) => `${String(index + 1).padStart(2, '0')}.`;

/** A theme colour as the browser computes it, to compare with computed styles. */
const tokenColour = (page: Page, value: string) =>
  page.evaluate((colour) => {
    const probe = document.createElement('i');
    probe.style.color = colour;
    document.body.append(probe);
    const computed = getComputedStyle(probe).color;
    probe.remove();
    return computed;
  }, value);

const near = (actual: number, expected: number, what: string, within = 1) => {
  expect(Math.abs(actual - expected), what).toBeLessThanOrEqual(within);
};

/** WCAG contrast between two sRGB colours given as 0-255 channels. */
const contrast = (a: number[], b: number[]) => {
  const luminance = (rgb: number[]) => {
    const [r, g, bl] = rgb.map((v) => {
      const c = v / 255;
      return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
};

/** Escapes text for use inside a regular expression. */
const literal = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Scrolls an element to the middle of the viewport at once, clear of the sticky bars. */
const centre = (element: Locator) =>
  element.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));

/**
 * The colours in a screenshot, most common first. The page decodes it itself, so the test needs no
 * image library.
 */
const coloursIn = (page: Page, png: Buffer) =>
  page.evaluate(
    async (src) => {
      const image = new Image();
      image.src = src;
      await image.decode();
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext('2d')!;
      context.drawImage(image, 0, 0);
      const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
      const counts = new Map<string, number>();
      for (let i = 0; i < data.length; i += 4) {
        const key = `${data[i]},${data[i + 1]},${data[i + 2]}`;
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
      return [...counts.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([key, count]) => ({ rgb: key.split(',').map(Number), count }));
    },
    `data:image/png;base64,${png.toString('base64')}`,
  );

/** The colours of an element as the browser painted it, most common first. */
const paintedColours = async (page: Page, element: Locator) => {
  await centre(element);
  return coloursIn(page, await element.screenshot());
};

test('follows selected work and shows the four steps in order: icon, number, title', async ({
  page,
}) => {
  await page.goto('/');
  await expect(items(page)).toHaveCount(processSteps.length);

  const order = await page.evaluate(() => {
    const work = document.getElementById('work');
    const process = document.getElementById('process');
    return Boolean(
      work && process && work.compareDocumentPosition(process) & Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });
  expect(order, 'the process section follows selected work').toBe(true);
  const [workBox, processBox] = [
    (await page.locator('#work').boundingBox())!,
    (await page.locator('#process').boundingBox())!,
  ];
  expect(processBox.y, 'and sits below it').toBeGreaterThanOrEqual(workBox.y + workBox.height - 1);

  for (const [index, step] of processSteps.entries()) {
    const item = items(page).nth(index);
    await expect(item.getByRole('heading', { level: 3 })).toHaveAccessibleName(
      `Step ${index + 1}. ${step.title}`,
    );
    // An icon, the number, and the title: nothing else to read, as in the reference.
    await expect(item).toHaveText(
      new RegExp(
        `^\\s*${literal(stepNumber(index))}\\s*Step ${index + 1}\\.\\s+${literal(step.title)}\\s*$`,
      ),
    );
    const number = numberOf(item);
    await expect(number).toHaveText(stepNumber(index));
    await expect(number).toBeVisible();
    const icon = item.locator('svg').first();
    await expect(icon).toBeVisible();
    await expect(icon).toHaveAttribute('aria-hidden', 'true');
    await expect(item.locator('[data-step-arrow]')).toHaveCount(
      index < processSteps.length - 1 ? 1 : 0,
    );
  }
  for (const arrow of await arrows(page).all()) {
    await expect(arrow).toHaveAttribute('aria-hidden', 'true');
  }
});

test('the number is grey with a primary full stop, and readable on the band (3:1 or more)', async ({
  page,
}) => {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  const primary = await tokenColour(page, 'var(--color-primary)');
  for (const index of processSteps.keys()) {
    const number = numberOf(items(page).nth(index));
    await expect(number.locator('span')).toHaveCSS('color', primary);

    const colours = await paintedColours(page, number);
    const band = colours[0].rgb;
    // The digits: the commonest colour clearly lighter than the band that is a grey, not the yellow.
    const digits = colours.find(
      ({ rgb }) =>
        rgb[0] > band[0] + 40 && Math.max(...rgb) - Math.min(...rgb) <= 6 && rgb[0] < 200,
    );
    expect(digits, `${stepNumber(index)} digits were painted`).toBeDefined();
    const ratio = contrast(digits!.rgb, band);
    expect(ratio, `${stepNumber(index)} digits against the band`).toBeGreaterThanOrEqual(3);
    // Still a muted grey, as in the reference, well below the titles' contrast.
    expect(ratio, `${stepNumber(index)} digits stay muted`).toBeLessThan(4.5);
  }
});

test('the band is the reference charcoal, with fine dark lines drawn over it', async ({ page }) => {
  await page.goto('/');
  const band = section(page);
  const style = await band.evaluate((el) => {
    const computed = getComputedStyle(el);
    return { image: computed.backgroundImage, size: computed.backgroundSize };
  });
  expect(style.image).toMatch(/^url\(".*lines.*\.svg"\)$/);
  expect(style.size).toBe('cover');

  // A strip under the steps, in the band's bottom padding: band and lines only. The last step is
  // centred, so the strip is on screen even where the list is taller than the viewport.
  const list = band.locator('ol');
  await centre(items(page).last());
  const clip = await list.evaluate((el) => {
    const box = el.getBoundingClientRect();
    return { x: box.left, y: box.bottom + 8, width: Math.min(box.width, 600), height: 24 };
  });
  const colours = await coloursIn(page, await page.screenshot({ clip }));
  const [commonest] = colours;
  commonest.rgb.forEach((channel, i) =>
    near(channel, BAND[i], `band colour ${commonest.rgb} against #212121`, 3),
  );
  const lines = colours.filter(({ rgb }) => rgb[0] <= commonest.rgb[0] - 3);
  expect(lines.length, 'fine lines darker than the band').toBeGreaterThan(0);
  expect(
    Math.min(...colours.map(({ rgb }) => rgb[0])),
    'the lines stay faint: never near black',
  ).toBeGreaterThanOrEqual(BAND[0] - 12);
});

test('stacked with arrows down below md, one row with arrows across from md', async ({ page }) => {
  const layouts = [
    [360, 'stack'],
    [390, 'stack'],
    [768, 'row'],
    [1024, 'row'],
    [1280, 'row'],
    [1440, 'row'],
    [1920, 'row'],
  ] as const;
  for (const [width, layout] of layouts) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    const steps = await items(page).evaluateAll((lis) =>
      lis.map((li) => {
        const box = (el: Element) => {
          const r = el.getBoundingClientRect();
          return {
            top: r.top,
            bottom: r.bottom,
            left: r.left,
            right: r.right,
            cx: r.x + r.width / 2,
          };
        };
        return {
          icon: box(li.querySelector('svg')!),
          number: box(li.querySelector('span[aria-hidden="true"]')!),
          title: box(li.querySelector('h3')!),
        };
      }),
    );
    const turns = await arrows(page).evaluateAll((svgs) =>
      svgs.map((svg) => {
        const r = svg.getBoundingClientRect();
        return {
          rotate: getComputedStyle(svg).rotate,
          left: r.left,
          right: r.right,
          cy: r.y + r.height / 2,
          top: r.top,
          bottom: r.bottom,
        };
      }),
    );
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
      `${width}px: no sideways scroll`,
    ).toBeLessThanOrEqual(0);
    expect(turns, `${width}px: an arrow between each pair of steps`).toHaveLength(
      processSteps.length - 1,
    );

    for (const [index, step] of steps.entries()) {
      const what = `${width}px, step ${index + 1}`;
      expect(step.icon.bottom, `${what}: number under the icon`).toBeLessThanOrEqual(
        step.number.top + 1,
      );
      expect(step.number.bottom, `${what}: title under the number`).toBeLessThanOrEqual(
        step.title.top + 1,
      );
      near(step.number.cx, step.icon.cx, `${what}: number centred under the icon`, 2);
      near(step.title.cx, step.icon.cx, `${what}: title centred under the icon`, 2);
    }

    if (layout === 'stack') {
      for (const [index, arrow] of turns.entries()) {
        expect(arrow.rotate, `${width}px: arrow ${index + 1} points down`).toBe('90deg');
        expect(arrow.top, `${width}px: under step ${index + 1}`).toBeGreaterThan(
          steps[index].title.bottom,
        );
        expect(arrow.bottom, `${width}px: above step ${index + 2}`).toBeLessThan(
          steps[index + 1].icon.top,
        );
        near(
          arrow.left + (arrow.right - arrow.left) / 2,
          steps[index].icon.cx,
          `${width}px: centred`,
          2,
        );
      }
      continue;
    }

    const sameLine = (values: number[], what: string) => {
      for (const value of values) near(value, values[0], `${width}px: ${what}`);
    };
    sameLine(
      steps.map((step) => step.icon.top),
      'icons share a line',
    );
    sameLine(
      steps.map((step) => step.number.top),
      'numbers share a line',
    );
    sameLine(
      steps.map((step) => step.title.top),
      'titles share a line',
    );
    const pitch = steps[1].icon.cx - steps[0].icon.cx;
    for (let i = 1; i < steps.length; i += 1) {
      near(steps[i].icon.cx - steps[i - 1].icon.cx, pitch, `${width}px: steps evenly spaced`, 2);
    }
    for (const [index, arrow] of turns.entries()) {
      expect(arrow.rotate, `${width}px: arrow ${index + 1} points across`).toBe('0deg');
      expect(arrow.left, `${width}px: after step ${index + 1}`).toBeGreaterThanOrEqual(
        steps[index].title.right - 1,
      );
      expect(arrow.right, `${width}px: before step ${index + 2}`).toBeLessThanOrEqual(
        steps[index + 1].title.left + 1,
      );
      // In the gap between the icon and the number, as in the reference.
      expect(arrow.cy, `${width}px: below the icon's middle`).toBeGreaterThan(
        (steps[index].icon.top + steps[index].icon.bottom) / 2,
      );
      expect(arrow.cy, `${width}px: above the number's middle`).toBeLessThan(
        (steps[index].number.top + steps[index].number.bottom) / 2,
      );
    }
  }
});

test('holds only the heading and the steps: no eyebrow, rule, sentence, or button', async ({
  page,
}) => {
  await page.goto('/');
  const region = section(page);
  await expect(region.getByRole('heading', { level: 2 })).toHaveCount(1);
  const parts = await region.evaluate((el) =>
    [...el.querySelectorAll(':scope > div > *')].map((part) => part.tagName.toLowerCase()),
  );
  expect(parts, 'the heading, then the list, and nothing else').toEqual(['h2', 'ol']);
  await expect(region.locator('p, a, button, [role="button"]')).toHaveCount(0);
  // Nothing but the steps after the list: the band ends in its own padding.
  const gap = await region.evaluate((el) => {
    const list = el.querySelector('ol')!.getBoundingClientRect();
    const padding = Number.parseFloat(getComputedStyle(el.firstElementChild!).paddingBottom);
    return el.getBoundingClientRect().bottom - list.bottom - padding;
  });
  near(gap, 0, 'the list is the last thing in the band', 1);
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('the section renders in full', async ({ page }) => {
    await page.goto('/');
    await expect(items(page)).toHaveCount(processSteps.length);
    for (const [index, step] of processSteps.entries()) {
      const item = items(page).nth(index);
      await expect(item.getByRole('heading', { level: 3 })).toHaveAccessibleName(
        `Step ${index + 1}. ${step.title}`,
      );
      await expect(numberOf(item)).toHaveText(stepNumber(index));
    }
    await expect(section(page).locator('script, astro-island, img, a, button')).toHaveCount(0);
  });
});
