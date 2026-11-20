import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { site } from '../../src/data/site';
import { builtRoutes } from './routes';

/**
 * Inner-page hero (src/components/sections/PageIntro.astro with the `page-hero` utility): the hero
 * of every page except the home page, as the owner asked on 2026-11-19. A dark band in the
 * navbar's `neutral`, first in `main`, straight under the navbar. Its copy is left-aligned: a
 * primary eyebrow, the page's h1 in white with its highlighted words in primary, a primary rule,
 * and the description in the band's light text. The logo's mark (src/assets/aura-hero.svg, the
 * owner's file) rests on the band's bottom edge at the right, centred on a glow and three rings
 * which that edge cuts in half, with three pixels on the outer ring. It is beside the copy from
 * lg and under it below lg, never behind text, and all of it is decorative. On load the glow
 * fades in, the rings open, the mark rises, and the pixels pop in, once, within 2.5s. The copy
 * never moves, and nothing moves under reduced motion. The home page keeps its own hero.
 */

/** Each page's title as written, and the words of it set in the primary yellow. */
const TITLES: Record<string, { title: string; highlight?: string }> = {
  '/about/': { title: `About ${site.name}`, highlight: site.name },
  '/contact/': { title: "Let's talk about your project.", highlight: 'your project.' },
  '/contact/thank-you/': { title: 'Thanks for getting in touch.', highlight: 'getting in touch.' },
  '/industries/': { title: 'Industries' },
  '/services/': { title: 'Services' },
};

const WIDTHS = [320, 360, 390, 768, 1023, 1024, 1440, 1920];

/** Tailwind's lg, where the art moves from under the copy to beside it. */
const LG = 1024;

/** What the art arrives with. The first three are the home orbit's keyframes. */
const ARRIVAL = [
  'glow: orbit-fade',
  'mark: page-hero-rise',
  'pixel: orbit-pop',
  'pixel: orbit-pop',
  'pixel: orbit-pop',
  'ring: orbit-ring',
  'ring: orbit-ring',
  'ring: orbit-ring',
];

/** Every built page except the home page. */
const innerRoutes = () => builtRoutes().filter((route) => route !== '/');

const hero = (page: Page) => page.locator('[aria-labelledby="page-title"]');
const art = (page: Page) => hero(page).locator('[data-page-hero-art]');
const artParts = (page: Page) =>
  art(page).locator(
    '[data-page-hero-glow], [data-page-hero-ring], [data-page-hero-pixel], [data-page-hero-mark]',
  );

function near(actual: number, expected: number, message: string, tolerance = 1) {
  expect(
    Math.abs(actual - expected),
    `${message}: ${actual} against ${expected}`,
  ).toBeLessThanOrEqual(tolerance);
}

/**
 * CSS colours as the RGBA bytes a 1x1 canvas paints them in. Bytes, not computed strings, because
 * engines write one colour in different notations. A probe resolves `var()` first, which a canvas
 * cannot.
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

/** The supplied file's one path, as written. */
const artwork = () => {
  const file = readFileSync(join(process.cwd(), 'src/assets/aura-hero.svg'), 'utf8');
  return {
    paths: file.match(/<path\b/g)?.length,
    d: /\sd="([^"]+)"/.exec(file)?.[1],
    fill: /\sfill="([^"]+)"/.exec(file)?.[1],
  };
};

/** Where the band, its copy, and every part of the art are, and where the page goes on. */
const measure = (page: Page) =>
  hero(page).evaluate((section) => {
    type Box = { left: number; top: number; right: number; bottom: number; width: number };
    const box = (rect: DOMRect): Box => ({
      left: rect.left,
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      width: rect.width,
    });
    const boxOf = (element: Element) => box(element.getBoundingClientRect());
    const part = (name: string) => boxOf(section.querySelector(`[data-page-hero-${name}]`)!);

    const container = section.firstElementChild!;
    const copy = section.querySelector('h1')!.parentElement!;
    // The words themselves: a paragraph's own box is as wide as its column, whatever it holds.
    const lines = Array.from(copy.children).flatMap((element) => {
      if (!element.textContent?.trim()) return [boxOf(element)];
      const range = document.createRange();
      range.selectNodeContents(element);
      return Array.from(range.getClientRects(), box);
    });
    const next = section.nextElementSibling;
    const first = next?.querySelector('h2, h3, p, a, button, img, label, input') ?? next;

    return {
      viewport: document.documentElement.clientWidth,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      band: boxOf(section),
      edge:
        container.getBoundingClientRect().right -
        parseFloat(getComputedStyle(container).paddingRight),
      copy: boxOf(copy),
      lines,
      art: part('art'),
      glow: part('glow'),
      mark: part('mark'),
      rings: ['inner', 'middle', 'outer'].map((ring) =>
        boxOf(section.querySelector(`[data-page-hero-ring="${ring}"]`)!),
      ),
      pixels: Array.from(section.querySelectorAll('[data-page-hero-pixel]'), boxOf),
      after: first ? first.getBoundingClientRect().top : null,
    };
  });

test('every page except the home page opens with the dark hero, straight under the navbar', async ({
  page,
}) => {
  const routes = innerRoutes();
  expect(routes, 'every inner page has its title listed here').toEqual(Object.keys(TITLES).sort());

  for (const route of routes) {
    await test.step(route, async () => {
      await page.goto(route);
      await expect(hero(page)).toHaveCount(1);
      await expect(page.getByRole('heading', { level: 1 })).toHaveAttribute('id', 'page-title');

      const look = await hero(page).evaluate((section) => {
        const navbar = document.querySelector('header')!;
        const [eyebrow, title, rule, description] = Array.from(
          section.querySelector('h1')!.parentElement!.children,
        );
        return {
          tag: section.tagName,
          first: section === document.querySelector('main')?.firstElementChild,
          gap: section.getBoundingClientRect().top - navbar.getBoundingClientRect().bottom,
          parts: [eyebrow, title, rule, description].map((element) => element.tagName),
          eyebrow: eyebrow.textContent?.trim(),
          eyebrowCase: getComputedStyle(eyebrow).textTransform,
          described: !!description.textContent?.trim(),
          colours: [
            getComputedStyle(navbar).backgroundColor,
            getComputedStyle(section).backgroundColor,
            getComputedStyle(eyebrow).color,
            getComputedStyle(title).color,
            getComputedStyle(rule).backgroundColor,
          ],
        };
      });
      expect(look.tag, 'a section, named by the h1').toBe('SECTION');
      expect(look.first, 'first in main').toBe(true);
      near(look.gap, 0, 'no gap under the navbar', 0.5);
      expect(look.parts, 'eyebrow, title, rule, description').toEqual(['P', 'H1', 'DIV', 'P']);
      expect(look.eyebrow).toBe(site.name);
      expect(look.eyebrowCase).toBe('uppercase');
      expect(look.described, 'the description is there').toBe(true);

      const [dark, white, yellow] = await paint(page, [
        'var(--color-neutral)',
        'var(--color-base-100)',
        'var(--color-primary)',
      ]);
      const [navbar, band, eyebrow, title, rule] = await paint(page, look.colours);
      expect(band, 'the band is the near-black').toEqual(dark);
      expect(band, 'one masthead with the navbar').toEqual(navbar);
      expect(eyebrow, 'a yellow eyebrow').toEqual(yellow);
      expect(title, 'a white title').toEqual(white);
      expect(white, 'white is white').toEqual([255, 255, 255, 255]);
      expect(rule, 'a yellow rule').toEqual(yellow);
    });
  }

  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await expect(hero(page), 'the home page keeps its own hero').toHaveCount(0);
  await expect(page.locator('[data-page-hero-art]')).toHaveCount(0);
});

test('each title keeps its words, with the highlighted ones in yellow', async ({ page }) => {
  for (const [route, { title, highlight }] of Object.entries(TITLES)) {
    await test.step(route, async () => {
      await page.goto(route);
      const heading = page.getByRole('heading', { level: 1 });
      // The highlight adds no space of its own: "touch." stays one word.
      await expect(heading).toHaveText(title);
      const accents = heading.locator('span');
      await expect(accents).toHaveCount(highlight ? 1 : 0);
      if (!highlight) return;

      await expect(accents).toHaveText(highlight);
      const colour = await accents.evaluate((span) => getComputedStyle(span).color);
      const [accent, yellow] = await paint(page, [colour, 'var(--color-primary)']);
      expect(accent, `"${highlight}" is yellow`).toEqual(yellow);
    });
  }
});

test('the mark is the supplied artwork, whole and decorative, with nothing to focus', async ({
  page,
}) => {
  const file = artwork();
  expect(file.paths, 'the file is one path').toBe(1);

  for (const route of innerRoutes()) {
    await test.step(route, async () => {
      await page.goto(route);
      await expect(art(page)).toHaveAttribute('aria-hidden', 'true');
      const drawn = await art(page).evaluate((element) => {
        const marks = element.querySelectorAll('svg');
        const paths = marks[0].querySelectorAll('path');
        const view = marks[0].viewBox.baseVal;
        const ink = paths[0].getBBox();
        return {
          marks: marks.length,
          focusable: marks[0].getAttribute('focusable'),
          paths: paths.length,
          d: paths[0].getAttribute('d'),
          fill: paths[0].getAttribute('fill'),
          // How far the artwork is from each edge of the viewBox: none of it cut, and no margin
          // left, so the mark's box is the mark.
          margins: [
            ink.x - view.x,
            ink.y - view.y,
            view.x + view.width - (ink.x + ink.width),
            view.y + view.height - (ink.y + ink.height),
          ],
          rings: element.querySelectorAll('[data-page-hero-ring]').length,
          pixels: element.querySelectorAll('[data-page-hero-pixel]').length,
          text: element.textContent?.trim(),
        };
      });
      expect(drawn.marks, 'one mark').toBe(1);
      expect(drawn.focusable).toBe('false');
      expect(drawn.paths).toBe(1);
      expect(drawn.d, "the file's path, unchanged").toBe(file.d);
      expect(drawn.fill, "the file's yellow").toBe(file.fill);
      for (const margin of drawn.margins) {
        expect(margin, 'the viewBox ends at the artwork').toBeGreaterThanOrEqual(0);
        expect(margin, 'the viewBox ends at the artwork').toBeLessThan(1);
      }
      expect(drawn.rings).toBe(3);
      expect(drawn.pixels).toBe(3);
      expect(drawn.text, 'no words in the art').toBe('');
      await expect(art(page).locator('a, button, input, img, [tabindex]')).toHaveCount(0);
    });
  }
});

test('the mark rests on the bottom edge at the right, on its rings and clear of the copy, at every width', async ({
  page,
}) => {
  // Reduced motion shows the resting places at once. With motion only transforms and fades differ.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const route of Object.keys(TITLES)) {
    await page.goto(route);
    // The copy is measured in Catamaran and Mukta, not in the face a browser shows until they load.
    await page.evaluate(() => document.fonts.ready);

    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: 900 });
      const at = `${route} at ${width}px`;
      const { band, mark, rings, pixels, ...measured } = await measure(page);
      const [inner, middle, outer] = rings;
      const centre = { x: (outer.left + outer.right) / 2, y: (outer.top + outer.bottom) / 2 };
      const radius = outer.width / 2;

      expect(measured.overflow, `${at}: no sideways scroll`).toBeLessThanOrEqual(1);

      // A sun on the horizon, in the corner: the rings share a centre on the band's bottom edge,
      // the outer one ends on the container's right edge, and the glow fills it.
      near(centre.y, band.bottom, `${at}: the rings are centred on the bottom edge`);
      near(outer.right, measured.edge, `${at}: the outer ring ends at the container's edge`);
      for (const ring of [inner, middle, measured.glow]) {
        near((ring.left + ring.right) / 2, centre.x, `${at}: one centre, across`);
        near((ring.top + ring.bottom) / 2, centre.y, `${at}: one centre, down`);
      }
      expect(inner.width, `${at}: the rings grow outward`).toBeLessThan(middle.width);
      expect(middle.width, `${at}: the rings grow outward`).toBeLessThan(outer.width);
      near(measured.glow.width, outer.width, `${at}: the glow ends at the outer ring`);

      // The mark: all of it in the band and on the screen, resting just above the edge, centred
      // on the rings with its tip inside the outer one, and large enough to be the picture.
      expect(mark.top, `${at}: the mark's tip is in the band`).toBeGreaterThan(band.top);
      expect(mark.left, `${at}: the mark is on the screen`).toBeGreaterThanOrEqual(0);
      expect(mark.right, `${at}: the mark is on the screen`).toBeLessThanOrEqual(measured.viewport);
      expect(band.bottom - mark.bottom, `${at}: the mark rests above the edge`).toBeGreaterThan(0);
      expect(band.bottom - mark.bottom, `${at}: the mark rests on the edge`).toBeLessThan(
        radius / 10,
      );
      near((mark.left + mark.right) / 2, centre.x, `${at}: the mark is centred on the rings`);
      expect(mark.top, `${at}: the tip is inside the outer ring`).toBeGreaterThan(outer.top);
      expect(mark.width, `${at}: the mark is wider than the inner ring`).toBeGreaterThan(
        inner.width,
      );
      expect(mark.width, `${at}: the mark is large enough`).toBeGreaterThanOrEqual(
        width >= LG ? 240 : 160,
      );

      // The pixels sit on the outer ring, above the edge and on the screen.
      expect(pixels).toHaveLength(3);
      for (const pixel of pixels) {
        const x = (pixel.left + pixel.right) / 2 - centre.x;
        const y = (pixel.top + pixel.bottom) / 2 - centre.y;
        near(Math.hypot(x, y), radius, `${at}: a pixel is on the outer ring`, 1.5);
        expect(pixel.bottom, `${at}: a pixel is above the edge`).toBeLessThan(band.bottom);
        expect(pixel.left, `${at}: a pixel is on the screen`).toBeGreaterThanOrEqual(0);
        expect(pixel.right, `${at}: a pixel is on the screen`).toBeLessThanOrEqual(
          measured.viewport,
        );
      }

      // Never behind text: the outer ring's upper half holds all of the art, and no line of the
      // copy, nor its rule, comes within 8px of it.
      for (const line of measured.lines) {
        const apart =
          line.right + 8 <= outer.left ||
          line.left - 8 >= outer.right ||
          line.bottom + 8 <= outer.top ||
          line.top - 8 >= band.bottom;
        expect(apart, `${at}: the art is clear of the copy`).toBe(true);
      }

      // Beside the copy from lg, under it below. Either way its box ends with the band.
      near(measured.art.bottom, band.bottom, `${at}: the art ends with the band`, 0.5);
      if (width >= LG) {
        expect(measured.art.left, `${at}: beside the copy`).toBeGreaterThanOrEqual(
          measured.copy.right,
        );
        near(measured.art.top, band.top, `${at}: as tall as the band`, 0.5);
      } else {
        expect(measured.art.top, `${at}: under the copy`).toBeGreaterThanOrEqual(
          measured.copy.bottom - 0.5,
        );
      }

      // What follows keeps its distance: the contact form's heading and the thank-you page's
      // buttons have no section padding of their own above them.
      expect(measured.after, `${at}: the page goes on`).not.toBeNull();
      expect(
        (measured.after ?? 0) - band.bottom,
        `${at}: the page goes on clear of the band`,
      ).toBeGreaterThanOrEqual(48);
    }
  }
});

test.describe('motion allowed', () => {
  test.use({ reducedMotion: 'no-preference' });

  test('the art arrives once, the pixels last, within 2.5s, and the copy never moves', async ({
    page,
  }) => {
    await page.goto('/services/');

    // Everything in the hero that plays by itself, still playing or already over.
    const started = await hero(page).evaluate((section) =>
      section.getAnimations({ subtree: true }).map((animation) => {
        const target = (animation.effect as KeyframeEffect).target!;
        const part = ['glow', 'ring', 'pixel', 'mark'].find((name) =>
          target.matches(`[data-page-hero-${name}]`),
        );
        return {
          what: `${part ?? 'copy'}: ${(animation as CSSAnimation).animationName}`,
          part,
          iterations: animation.effect!.getTiming().iterations,
          delay: Number(animation.effect!.getTiming().delay),
          end: Number(animation.effect!.getComputedTiming().endTime),
        };
      }),
    );
    // Only the art, so no word of the copy fades or travels.
    expect(started.map((animation) => animation.what).sort()).toEqual(ARRIVAL);
    for (const animation of started) {
      expect(animation.iterations, `${animation.what} plays once`).toBe(1);
      expect(animation.end, `${animation.what} is over in time`).toBeLessThanOrEqual(2500);
    }
    // No pixel lands on a ring that is still growing.
    const opened = Math.max(
      ...started.filter((animation) => animation.part === 'ring').map((animation) => animation.end),
    );
    for (const pixel of started.filter((animation) => animation.part === 'pixel')) {
      expect(pixel.delay, 'a pixel waits for the rings').toBeGreaterThanOrEqual(opened);
    }

    // Once over, every part is solid and exactly where it rests under reduced motion.
    await hero(page).evaluate(async (section) => {
      await Promise.all(
        section.getAnimations({ subtree: true }).map((animation) => animation.finished),
      );
    });
    for (const part of await artParts(page).all()) {
      await expect(part).toHaveCSS('opacity', '1');
    }
    const arrived = await measure(page);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.reload();
    const resting = await measure(page);
    for (const [index, box] of [arrived.mark, ...arrived.rings, ...arrived.pixels].entries()) {
      const rest = [resting.mark, ...resting.rings, ...resting.pixels][index];
      near(box.left, rest.left, 'arrived where it rests, across', 0.5);
      near(box.top, rest.top, 'arrived where it rests, down', 0.5);
      near(box.width, rest.width, 'arrived at its size', 0.5);
    }
  });
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('nothing in the hero animates, and the art is there at once', async ({ page }) => {
    for (const route of innerRoutes()) {
      await page.goto(route);
      expect(
        await hero(page).evaluate((section) => section.getAnimations({ subtree: true }).length),
        `${route}: no arrival`,
      ).toBe(0);
      for (const part of await artParts(page).all()) {
        await expect(part).toHaveCSS('opacity', '1');
      }
    }
  });
});
