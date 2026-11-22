import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test, type Page } from './fixtures';
import { industryPath, serviceCardById, servicePath } from '../../src/data/detail-pages';
import { industryPages } from '../../src/data/industry-pages';
import { pricingHead, pricingHero } from '../../src/data/pricing';
import { servicePages } from '../../src/data/service-pages';
import { industries } from '../../src/data/site';
import { workPage } from '../../src/data/work';
import { builtRoutes } from './routes';

/**
 * Inner-page hero (src/components/sections/PageIntro.astro with the `page-hero` utility): the hero
 * of every page except the home page, as the owner asked on 2026-11-19. A dark band in the
 * navbar's `neutral`, first in `main`, straight under the navbar. Its copy is left-aligned: on a
 * detail page the breadcrumb trail (Home and the hub as links, the page as `aria-current` text,
 * decorative separators) and the page's icon, then on every page a primary eyebrow that is the
 * page's name in navigation (the owner's request, 2026-11-20; the pricing page's is the brief's
 * own words), the page's h1 in white with its
 * highlighted words in primary, a primary rule, the description in the band's light text, and,
 * on the pricing page, a short note under it. The logo's mark (src/assets/aura-hero.svg, the
 * owner's file) rests on the band's bottom edge at the right, centred on a glow and three rings
 * which that edge cuts in half, with three pixels on the outer ring. It is beside the copy from
 * lg and under it below lg, never behind text, and all of it is decorative. On load the glow
 * fades in, the rings open, the mark rises, and the pixels pop in, once, within 2.5s. The copy
 * never moves, and nothing moves under reduced motion. The home page keeps its own hero.
 */

/** A step of a page's breadcrumb trail; the last has no `href`. */
interface Crumb {
  label: string;
  href?: string;
}

interface HeroCopy {
  title: string;
  highlight?: string;
  /** The page's name in navigation, which the yellow eyebrow shows (the pricing page: the brief's). */
  eyebrow: string;
  /** A short note under the description, on the pricing page only. */
  note?: string;
  /** The page's icon file in src/assets/icons/, on the detail pages only. */
  icon?: string;
  /** Home, the hub, then the page, on the detail pages only. */
  crumbs?: Crumb[];
  /**
   * The tags a page adds after the description through the hero's slot: the contact page's list
   * of direct-contact links (2026-11-20). Every other page adds nothing.
   */
  after?: string[];
}

const HOME: Crumb = { label: 'Home', href: '/' };

/**
 * Each page's hero copy: the title as written, the words of it set in the primary yellow, the
 * eyebrow, and, on the detail pages, the icon and the trail. The hub pages are listed by hand; the
 * service and industry detail pages take theirs from the data that renders them
 * (src/data/service-pages/, src/data/industry-pages/), so a page is covered as soon as it is
 * added there.
 */
const TITLES: Record<string, HeroCopy> = {
  '/about/': {
    title: 'A digital presence built around your goals.',
    highlight: 'your goals.',
    eyebrow: 'About',
  },
  '/contact/': {
    title: "Let's talk about your project.",
    highlight: 'your project.',
    eyebrow: 'Contact',
    after: ['UL'],
  },
  '/industries/': {
    title: 'Digital support for the way your business works.',
    highlight: 'the way your business works.',
    eyebrow: 'Industries',
  },
  '/pricing/': {
    title: pricingHead.title,
    highlight: pricingHead.highlight,
    eyebrow: pricingHero.eyebrow,
    note: pricingHero.note,
  },
  '/services/': {
    title: 'Websites, email, and search that work together.',
    highlight: 'work together.',
    eyebrow: 'Services',
  },
  '/work/': {
    title: workPage.title,
    highlight: workPage.highlight,
    eyebrow: 'Work',
  },
  ...Object.fromEntries(
    servicePages.map((page) => {
      const card = serviceCardById(page.card);
      return [
        servicePath(page.slug),
        {
          title: page.title,
          highlight: page.highlight,
          eyebrow: card.title,
          icon: card.icon,
          crumbs: [HOME, { label: 'Services', href: '/services/' }, { label: card.title }],
        },
      ];
    }),
  ),
  ...Object.fromEntries(
    industryPages.map((page) => {
      const industry = industries.find((entry) => entry.name === page.name)!;
      return [
        industryPath(page.slug),
        {
          title: page.title,
          highlight: page.highlight,
          eyebrow: page.name,
          icon: industry.icon,
          crumbs: [HOME, { label: 'Industries', href: '/industries/' }, { label: page.name }],
        },
      ];
    }),
  ),
};

/** The `d` of every path in an icon's file, in order: what the page should draw for it. */
const pathsOf = (icon: string) =>
  Array.from(
    readFileSync(join(process.cwd(), 'src/assets/icons', `${icon}.svg`), 'utf8').matchAll(
      /\sd="([^"]+)"/g,
    ),
    ([, d]) => d,
  );

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
  // One visit per page, so the time grows with the site: 2 seconds per page.
  test.setTimeout(routes.length * 2_000);

  for (const route of routes) {
    await test.step(route, async () => {
      await page.goto(route);
      await expect(hero(page)).toHaveCount(1);
      await expect(page.getByRole('heading', { level: 1 })).toHaveAttribute('id', 'page-title');

      const expected = TITLES[route];
      const look = await hero(page).evaluate((section) => {
        const navbar = document.querySelector('header')!;
        const title = section.querySelector('h1')!;
        const eyebrow = title.previousElementSibling!;
        const rule = title.nextElementSibling!;
        const description = rule.nextElementSibling!;
        const copy = Array.from(title.parentElement!.children);
        const trail = section.querySelector('nav');
        // The copy column's own svg: the art's mark sits in the other column.
        const icon = title.parentElement!.querySelector(':scope > svg');
        return {
          tag: section.tagName,
          first: section === document.querySelector('main')?.firstElementChild,
          gap: section.getBoundingClientRect().top - navbar.getBoundingClientRect().bottom,
          // Everything in the copy column, in order: the trail and the icon only on detail pages.
          copy: copy.map((element) => element.tagName),
          eyebrow: eyebrow.textContent?.trim(),
          eyebrowCase: getComputedStyle(eyebrow).textTransform,
          described: !!description.textContent?.trim(),
          // The note is a paragraph; what a page adds through the slot (a list) is not one.
          note:
            description.nextElementSibling?.tagName === 'P'
              ? description.nextElementSibling.textContent?.trim()
              : undefined,
          colours: [
            getComputedStyle(navbar).backgroundColor,
            getComputedStyle(section).backgroundColor,
            getComputedStyle(eyebrow).color,
            getComputedStyle(title).color,
            getComputedStyle(rule).backgroundColor,
            icon ? getComputedStyle(icon).color : 'transparent',
          ],
          trail: trail && {
            label: trail.getAttribute('aria-label'),
            steps: Array.from(trail.querySelectorAll('li'), (item) => {
              const link = item.querySelector('a');
              const current = item.querySelector('[aria-current="page"]');
              return {
                label: (link ?? current)?.textContent?.trim(),
                href: link?.getAttribute('href') ?? undefined,
                current: !!current && !link,
                separator: item.querySelector('[aria-hidden="true"]')?.textContent?.trim(),
                // A comfortable target: the link's own box, at least 44px tall.
                tall: !link || link.getBoundingClientRect().height >= 44,
              };
            }),
          },
          icon: icon && {
            hidden: icon.getAttribute('aria-hidden'),
            focusable: icon.getAttribute('focusable'),
            stroke: icon.getAttribute('stroke-width'),
            size: [icon.getBoundingClientRect().width, icon.getBoundingClientRect().height],
            paths: Array.from(icon.querySelectorAll('path'), (path) => path.getAttribute('d')),
          },
        };
      });
      expect(look.tag, 'a section, named by the h1').toBe('SECTION');
      expect(look.first, 'first in main').toBe(true);
      near(look.gap, 0, 'no gap under the navbar', 0.5);
      expect(
        look.copy,
        'trail and icon where the page has them, then eyebrow, title, rule, description, the note where the page has one, and what the page adds after them',
      ).toEqual([
        ...(expected.crumbs ? ['NAV'] : []),
        ...(expected.icon ? ['svg'] : []),
        'P',
        'H1',
        'DIV',
        'P',
        ...(expected.note ? ['P'] : []),
        ...(expected.after ?? []),
      ]);
      expect(look.eyebrow, "the page's name as the eyebrow").toBe(expected.eyebrow);
      expect(look.eyebrowCase).toBe('uppercase');
      expect(look.described, 'the description is there').toBe(true);
      expect(look.note, 'the note under the description, only where the page has one').toBe(
        expected.note,
      );

      if (expected.crumbs) {
        expect(look.trail?.label, 'a breadcrumb landmark').toBe('Breadcrumb');
        expect(look.trail?.steps, 'Home, the hub, then the page as plain current text').toEqual(
          expected.crumbs.map((crumb, index) => ({
            label: crumb.label,
            href: crumb.href,
            current: !crumb.href,
            separator: index < expected.crumbs!.length - 1 ? '/' : undefined,
            tall: true,
          })),
        );
        await expect(
          hero(page).getByRole('navigation', { name: 'Breadcrumb' }).getByRole('link'),
        ).toHaveCount(expected.crumbs.length - 1);
      } else {
        expect(look.trail, 'no trail on a top-level page').toBeNull();
      }
      if (expected.icon) {
        expect(look.icon, `the ${expected.icon} icon, decorative, 40px, stroke 1.5`).toEqual({
          hidden: 'true',
          focusable: 'false',
          stroke: '1.5',
          size: [40, 40],
          paths: pathsOf(expected.icon),
        });
      } else {
        expect(look.icon, 'no icon on a top-level page').toBeNull();
      }

      const [dark, white, yellow] = await paint(page, [
        'var(--color-neutral)',
        'var(--color-base-100)',
        'var(--color-primary)',
      ]);
      const [navbar, band, eyebrow, title, rule, icon] = await paint(page, look.colours);
      expect(band, 'the band is the near-black').toEqual(dark);
      expect(band, 'one masthead with the navbar').toEqual(navbar);
      expect(eyebrow, 'a yellow eyebrow').toEqual(yellow);
      expect(title, 'a white title').toEqual(white);
      expect(white, 'white is white').toEqual([255, 255, 255, 255]);
      expect(rule, 'a yellow rule').toEqual(yellow);
      if (expected.icon) expect(icon, 'a yellow icon').toEqual(yellow);
    });
  }

  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await expect(hero(page), 'the home page keeps its own hero').toHaveCount(0);
  await expect(page.locator('[data-page-hero-art]')).toHaveCount(0);
});

test('each title keeps its words, with the highlighted ones in yellow', async ({ page }) => {
  test.setTimeout(Object.keys(TITLES).length * 2_000);
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
  const routes = innerRoutes();
  test.setTimeout(routes.length * 2_000);

  for (const route of routes) {
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
  // Eight widths per page, so the time grows with the site: 6 seconds per page.
  test.setTimeout(Object.keys(TITLES).length * 6_000);
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

      // What follows keeps its distance: the contact page's cards have no section padding of
      // their own above them.
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
    const routes = innerRoutes();
    test.setTimeout(routes.length * 2_000);
    for (const route of routes) {
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
