import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test, type Locator, type Page } from './fixtures';
import { contactRoutes, heroBenefits, primaryCta } from '../../src/data/site';
import { scrollToRest } from './scroll';

/**
 * Home hero (src/components/sections/Hero.astro), on the navbar's near-black since 2026-11-22: the
 * headline in white with its last line, "should, too.", in the primary yellow, where a pencil
 * underline used to be drawn. Copy and buttons are real HTML. The logo's mark, the owner's file as
 * supplied, sits at the centre of the benefit ring, decorative and still. Only the ring moves on
 * load, once: the benefit icons swing into place around the mark
 * (src/components/ui/ServiceOrbit.astro), where their labels fade in: one chip per hero benefit,
 * the icon decorative and the label that benefit's text, both resting clear of the mark, inside
 * the hero and off the copy, at every width. Afterwards the icons stay put. Once their ring has
 * opened a light circles it without end, pointer or not (the owner's decision), and never makes
 * the page scroll sideways.
 * The primary button's aura stays unlit until the pointer reaches it, then fades and circles like
 * the navbar's, in the navbar's light, and resumes where it stopped. It takes no room of its own,
 * and never lights under reduced motion. About us is the secondary mirrored for the dark band.
 */
const HEADLINE = 'Your business works hard. Your website should, too.';

const hero = (page: Page) => page.getByRole('region', { name: HEADLINE });
const primaryButton = (page: Page) => hero(page).getByText(primaryCta.label, { exact: true });
const aboutButton = (page: Page) => hero(page).getByRole('link', { name: 'About us' });
const heroAura = (page: Page) => hero(page).locator('.aura');
const mark = (page: Page) => hero(page).locator('[data-hero-mark]');
const orbit = (page: Page) => hero(page).locator('[data-orbit-frame]');

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

/** An element's label, background, and border colours, as `paint` gives them. */
const buttonColours = async (page: Page, button: Locator) => {
  const { color, backgroundColor, borderTopColor } = await button.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      color: style.color,
      backgroundColor: style.backgroundColor,
      borderTopColor: style.borderTopColor,
    };
  });
  const [label, fill, border] = await paint(page, [color, backgroundColor, borderTopColor]);
  return { label, fill, border };
};

/** The supplied file's one path, as written. */
const artwork = () => {
  const file = readFileSync(join(process.cwd(), 'src/assets/aura-hero.svg'), 'utf8');
  return {
    paths: file.match(/<path\b/g)?.length,
    d: /\sd="([^"]+)"/.exec(file)?.[1],
    fill: /\sfill="([^"]+)"/.exec(file)?.[1],
  };
};

/** The animations that bring the orbit in on load. Its `orbit-light` never ends. */
const ORBIT_ARRIVAL = ['orbit-arrive', 'orbit-fade', 'orbit-pop', 'orbit-ring'];

const hasHover = (page: Page) => page.evaluate(() => matchMedia('(hover: hover)').matches);

/** How far apart two directions are, in degrees. */
const apart = (a: number, b: number) => Math.abs(((a - b + 540) % 360) - 180);

/**
 * Each chip on the ring: its angle around the centre, clockwise from three o'clock, its distance
 * from the centre, and the angle the component gives its place (the first place's angle plus
 * equal steps).
 */
const chipPlaces = (page: Page) =>
  orbit(page).evaluate((frame) => {
    const degrees = (name: string) => parseFloat(getComputedStyle(frame).getPropertyValue(name));
    const disc = frame.querySelector('[data-orbit-disc]')!.getBoundingClientRect();
    const centre = { x: disc.left + disc.width / 2, y: disc.top + disc.height / 2 };
    return Array.from(frame.querySelectorAll<HTMLElement>('[data-orbit-chip]'), (chip) => {
      const box = chip.getBoundingClientRect();
      const x = box.left + box.width / 2 - centre.x;
      const y = box.top + box.height / 2 - centre.y;
      const place = Number(getComputedStyle(chip).getPropertyValue('--orbit-index'));
      return {
        id: chip.dataset.orbitChip,
        place,
        resting: (degrees('--orbit-start') + place * degrees('--orbit-step')) % 360,
        angle: ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360,
        distance: Math.hypot(x, y),
        // A turned box has a larger bounding box than its own size.
        upright:
          Math.abs(box.width - chip.offsetWidth) < 0.5 &&
          Math.abs(box.height - chip.offsetHeight) < 0.5,
      };
    });
  });

/** Every chip is in a resting place of its own, on the ring, with its icon and name upright. */
async function expectChipsInPlace(page: Page) {
  const chips = await chipPlaces(page);
  expect(chips.map((chip) => chip.id).sort(), 'one chip per benefit').toEqual(
    heroBenefits.map((benefit) => benefit.id).sort(),
  );
  expect(chips.map((chip) => chip.place).sort(), 'every place on the ring taken once').toEqual(
    chips.map((_, index) => index),
  );
  for (const chip of chips) {
    expect(
      apart(chip.angle, chip.resting),
      `${chip.id} is at ${chip.resting} degrees, not ${chip.angle.toFixed(1)}`,
    ).toBeLessThan(1);
    expect(chip.upright, `${chip.id} is upright`).toBe(true);
    expect(chip.distance, `${chip.id} is on the ring`).toBeCloseTo(chips[0].distance, 0);
  }
}

/** The light on the ring: whether it plays, how far round, how bright, its timing. */
const orbitLight = (page: Page) =>
  orbit(page).evaluate((frame) => {
    const lights = frame
      .getAnimations({ subtree: true })
      .filter((animation) => (animation as CSSAnimation).animationName === 'orbit-light');
    const [light] = lights;
    const { duration, easing, iterations } = light?.effect?.getTiming() ?? {};
    return {
      count: lights.length,
      playing: light?.playState === 'running',
      time: light ? Number(light.currentTime) : null,
      brightness: Number(getComputedStyle(frame.querySelector('[data-orbit-light]')!).opacity),
      timing: { duration, easing, iterations },
    };
  });

/** The animations on an aura and its glow: name, timing, and whether each one plays. */
const auraAnimations = (aura: Locator) =>
  aura.evaluate((el) =>
    el.getAnimations({ subtree: true }).map((animation) => {
      const { duration, easing, direction, iterations } = animation.effect!.getTiming();
      return {
        name: (animation as CSSAnimation).animationName,
        playing: animation.playState === 'running',
        timing: { duration, easing, direction, iterations },
      };
    }),
  );

/**
 * The aura's own spin, not the glow copies, and how strongly the light shines. `time` is where the
 * spin has got to, so a later visit can be checked against it.
 */
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

test('shows the headline, the supporting copy, and both buttons', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(HEADLINE);
  await expect(hero(page).getByText('Websites for growing businesses')).toBeVisible();
  await expect(
    hero(page).getByText(
      'We build professional websites that make your business look established, showcase what you do best, and make it easier for customers to choose you.',
    ),
  ).toBeVisible();

  // The primary button uses the navbar's label and links to the contact page.
  const primary = hero(page).getByText(primaryCta.label, { exact: true });
  await expect(primary).toBeVisible();
  await expect(primary).toHaveAttribute('href', contactRoutes.page);

  // About us opens the About page (the owner, 2026-11-22), not the introduction further down.
  const about = hero(page).getByRole('link', { name: 'About us' });
  await expect(about).toHaveAttribute('href', '/about/');
  await scrollToRest(about);
  await about.click();
  await expect(page).toHaveURL(/\/about\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test("sits on the navbar's near-black, the headline white with its last line in yellow", async ({
  page,
}) => {
  await page.goto('/');
  const [neutral, white, primary] = await paint(page, [
    'var(--color-neutral)',
    'var(--color-base-100)',
    'var(--color-primary)',
  ]);
  const computed = await hero(page).evaluate((section) => {
    const heading = section.querySelector('h1')!;
    return {
      band: getComputedStyle(section).backgroundColor,
      navbar: getComputedStyle(document.querySelector('header')!).backgroundColor,
      lines: Array.from(heading.children, (line) => ({
        text: line.textContent!.trim(),
        colour: getComputedStyle(line).color,
      })),
      // The pencil underline that used to run under "should, too" (removed 2026-11-22).
      drawings: heading.querySelectorAll('svg').length,
    };
  });
  const [band, navbar] = await paint(page, [computed.band, computed.navbar]);
  expect(band, "the band is the theme's neutral").toEqual(neutral);
  expect(navbar, 'the navbar above it is the same colour').toEqual(neutral);

  // Four lines, the first three white, the last the primary yellow, and nothing drawn under them.
  expect(computed.lines.map((line) => line.text)).toEqual([
    'Your business',
    'works hard.',
    'Your website',
    'should, too.',
  ]);
  const colours = await paint(
    page,
    computed.lines.map((line) => line.colour),
  );
  expect(colours.slice(0, 3), 'the first three lines are white').toEqual([white, white, white]);
  expect(colours[3], 'the last line is the primary yellow').toEqual(primary);
  expect(computed.drawings, 'no underline').toBe(0);
});

test("shows the logo's mark, as supplied, large at the centre of the ring with no glow behind it, at every width", async ({
  page,
}) => {
  const file = artwork();
  expect(file.paths, 'the file is one path').toBe(1);
  // The rings rest where they belong at once. With motion they open from 80% of their size, and
  // the mark never moves either way (tested with motion below).
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(mark(page), 'one mark').toHaveCount(1);
  await expect(mark(page), 'decorative').toHaveAttribute('aria-hidden', 'true');
  await expect(mark(page)).toHaveAttribute('focusable', 'false');

  // The mark sits on the plain band: nothing in the ring paints a gradient, so no glow lies behind
  // it (the owner's request, 2026-11-22). The light on the ring is drawn by a pseudo-element.
  const painted = await orbit(page).evaluate((frame) =>
    Array.from(frame.querySelectorAll('*'))
      .filter((element) => getComputedStyle(element).backgroundImage !== 'none')
      .map((element) => element.outerHTML.slice(0, 80)),
  );
  expect(painted, 'no glow in the ring').toEqual([]);

  for (const width of [320, 390, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    const drawn = await mark(page).evaluate((svg) => {
      const view = (svg as SVGSVGElement).viewBox.baseVal;
      const paths = svg.querySelectorAll('path');
      const ink = paths[0].getBBox();
      const box = svg.getBoundingClientRect();
      const ring = (name: string) =>
        document.querySelector(`[data-orbit-ring="${name}"]`)!.getBoundingClientRect();
      const disc = document.querySelector('[data-orbit-disc]')!.getBoundingClientRect();
      return {
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
        offset: {
          x: box.left + box.width / 2 - (disc.left + disc.width / 2),
          y: box.top + box.height / 2 - (disc.top + disc.height / 2),
        },
        share: box.width / disc.width,
        // The corners of the mark's box are as far from the centre as any of it reaches.
        reach: Math.hypot(box.width, box.height) / 2,
        middle: ring('middle').width / 2,
        outer: ring('outer').width / 2,
      };
    });
    const at = `${width}px:`;
    expect(drawn.paths, `${at} one path`).toBe(1);
    expect(drawn.d, `${at} the file's path, unchanged`).toBe(file.d);
    expect(drawn.fill, `${at} the file's yellow`).toBe(file.fill);
    for (const margin of drawn.margins) {
      expect(margin, `${at} the viewBox ends at the artwork`).toBeGreaterThanOrEqual(0);
      expect(margin, `${at} the viewBox ends at the artwork`).toBeLessThan(1);
    }
    expect(Math.abs(drawn.offset.x), `${at} centred across the ring`).toBeLessThan(1);
    expect(Math.abs(drawn.offset.y), `${at} centred down the ring`).toBeLessThan(1);
    // Two thirds of the ring wide (the owner asked for it larger, 2026-11-22, from half). The
    // icons and their labels keep clear of it: tested at every width below.
    expect(drawn.share, `${at} two thirds of the ring wide`).toBeCloseTo(2 / 3, 2);
    expect(drawn.reach, `${at} past the middle ring`).toBeGreaterThan(drawn.middle);
    expect(drawn.reach, `${at} inside the outer ring, where the icons ride`).toBeLessThan(
      drawn.outer,
    );
  }

  await expect(
    mark(page).locator('xpath=..').locator('a, button, input, img, [tabindex]'),
    'nothing to focus',
  ).toHaveCount(0);
});

test('About us is the secondary mirrored for the dark band: a white outline that fills white', async ({
  page,
}) => {
  await page.goto('/');
  const about = aboutButton(page);
  await expect(about, 'the outlined variant').toHaveClass(/\bbtn-outline\b/);
  const [white, secondary] = await paint(page, ['var(--color-base-100)', 'var(--color-secondary)']);

  const resting = await buttonColours(page, about);
  expect(resting.label, 'a white label').toEqual(white);
  expect(resting.border, 'a white border').toEqual(white);
  expect(resting.fill[3], 'no fill').toBe(0);

  if (!(await hasHover(page))) return;
  await about.hover();
  const hovered = await buttonColours(page, about);
  expect(hovered.fill, 'filled white').toEqual(white);
  expect(hovered.border, 'the border stays white').toEqual(white);
  expect(hovered.label, "the secondary's near-black label").toEqual(secondary);
});

test('one labelled benefit chip circles the mark', async ({ page }) => {
  await page.goto('/');
  const frame = orbit(page);
  // The labels are the text. The icons are decorative, and nothing can be focused.
  await expect(frame).not.toHaveAttribute('aria-hidden');
  await expect(
    frame.locator('a, button, input, select, textarea, [tabindex]'),
    'nothing to focus',
  ).toHaveCount(0);

  // Clockwise from the right, one benefit in each place: the places they had around the laptop
  // and phone, which the mark kept.
  // One evaluate on the frame: Firefox crashes on evaluateAll from this named region.
  const order = await frame.evaluate((frame) =>
    Array.from(
      frame.querySelectorAll<HTMLElement>('[data-orbit-chip]'),
      (chip) => chip.dataset.orbitChip,
    ),
  );
  expect(order).toEqual([
    'more-bookings',
    'repeat-customers',
    'time-saved',
    'new-subscribers',
    'new-inquiries',
    'more-sales',
  ]);

  // Each chip shows its benefit's icon and its label, word for word, and nothing else.
  await expect(frame.locator('[data-orbit-chip]')).toHaveCount(heroBenefits.length);
  for (const benefit of heroBenefits) {
    const chip = frame.locator(`[data-orbit-chip="${benefit.id}"]`);
    const icon = chip.locator('svg');
    await expect(icon, `${benefit.label}: one icon`).toHaveCount(1);
    await expect(icon, `${benefit.label}: the icon is decorative`).toHaveAttribute(
      'aria-hidden',
      'true',
    );
    await expect(chip.locator('[data-orbit-name]'), `${benefit.label}: its label`).toHaveText(
      benefit.label,
    );
    // Every label is two words of ten letters or more, so each takes two lines, its last word
    // under the rest.
    await expect(chip.locator('[data-orbit-name] span'), `${benefit.label}: two lines`).toHaveCount(
      1,
    );
    await expect(chip, `${benefit.label}: nothing else`).toHaveText(benefit.label);
  }

  // More sales and Repeat customers are yellow. The other four are not. Every icon is the same near-black.
  const colours = await frame.evaluate((frame) => {
    const probe = document.createElement('span');
    probe.style.backgroundColor = 'var(--color-primary)';
    probe.style.color = 'var(--color-neutral)';
    frame.append(probe);
    const primary = getComputedStyle(probe).backgroundColor;
    const neutral = getComputedStyle(probe).color;
    probe.remove();
    return Array.from(frame.querySelectorAll<HTMLElement>('[data-orbit-chip]'), (chip) => ({
      id: chip.dataset.orbitChip,
      primary: getComputedStyle(chip).backgroundColor === primary,
      icon: getComputedStyle(chip.querySelector('svg')!).color === neutral,
    }));
  });
  expect(colours.filter((chip) => chip.primary).map((chip) => chip.id)).toEqual([
    'repeat-customers',
    'more-sales',
  ]);
  expect(
    colours.every((chip) => chip.icon),
    'every icon uses the neutral ink',
  ).toBe(true);
});

test('the benefit icons and their labels rest clear of the mark and the copy, inside the hero, at every width', async ({
  page,
}) => {
  // Reduced motion shows the resting places at once. With motion only transforms and fades differ.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [320, 360, 390, 768, 1024, 1280, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    // The names are measured in Catamaran, not in the wider face a browser shows until it loads.
    await page.evaluate(() => document.fonts.ready);
    await expectChipsInPlace(page);

    const measured = await hero(page).evaluate((section) => {
      const frame = section.querySelector('[data-orbit-frame]')!;
      const disc = frame.querySelector('[data-orbit-disc]')!.getBoundingClientRect();
      const mark = section.querySelector('[data-hero-mark]')!.getBoundingClientRect();
      const hero = section.getBoundingClientRect();

      // The copy and the mark, each with a little air around it: no icon or name may reach in.
      const near = (box: DOMRect, other: DOMRect) =>
        !(
          box.right <= other.left - 8 ||
          box.left >= other.right + 8 ||
          box.bottom <= other.top - 8 ||
          box.top >= other.bottom + 8
        );
      const copy = Array.from(section.querySelector('h1')!.parentElement!.children, (element) =>
        element.getBoundingClientRect(),
      );
      const touchesCopy = (box: DOMRect) => copy.some((text) => near(box, text));
      const overlap = (a: DOMRect, b: DOMRect) =>
        !(a.right <= b.left || a.left >= b.right || a.bottom <= b.top || a.top >= b.bottom);
      const screen = document.documentElement.clientWidth;
      const chips = Array.from(frame.querySelectorAll<HTMLElement>('[data-orbit-chip]'));
      const names = chips.map((chip) =>
        chip.querySelector('[data-orbit-name]')!.getBoundingClientRect(),
      );

      return {
        // The disc is every place a chip can reach.
        discTouchesCopy: touchesCopy(disc),
        room: {
          top: disc.top - hero.top,
          bottom: hero.bottom - disc.bottom,
          left: disc.left,
          right: screen - disc.right,
        },
        chips: chips.map((chip, index) => {
          const box = chip.getBoundingClientRect();
          const name = names[index];
          return {
            id: chip.dataset.orbitChip,
            chipNearMark: near(box, mark),
            nameNearMark: near(name, mark),
            nameSize: parseFloat(
              getComputedStyle(chip.querySelector('[data-orbit-name]')!).fontSize,
            ),
            nameHeight: name.height,
            nameRoom: {
              top: name.top - hero.top,
              bottom: hero.bottom - name.bottom,
              left: name.left,
              right: screen - name.right,
            },
            nameTouchesCopy: touchesCopy(name),
            // Another chip, or another chip's name, under this name.
            nameCrowded: chips.some(
              (other, at) =>
                at !== index &&
                (overlap(name, other.getBoundingClientRect()) || overlap(name, names[at])),
            ),
          };
        }),
      };
    });

    expect(measured.discTouchesCopy, `${width}px: the ring keeps off the copy`).toBe(false);
    expect(measured.room.top, `${width}px: below the navbar`).toBeGreaterThanOrEqual(8);
    expect(measured.room.bottom, `${width}px: above the hero's lower edge`).toBeGreaterThanOrEqual(
      8,
    );
    expect(measured.room.left, `${width}px: inside the screen`).toBeGreaterThanOrEqual(0);
    expect(measured.room.right, `${width}px: inside the screen`).toBeGreaterThanOrEqual(0);
    for (const chip of measured.chips) {
      const at = `${width}px: the ${chip.id}`;
      expect(chip.chipNearMark, `${at} chip keeps off the mark`).toBe(false);
      expect(chip.nameNearMark, `${at} name keeps off the mark`).toBe(false);
      expect(chip.nameSize, `${at} label is large enough to read`).toBeGreaterThanOrEqual(10);
      expect(chip.nameHeight, `${at} label is at most two lines`).toBeLessThanOrEqual(
        chip.nameSize * 1.15 * 2 + 1,
      );
      expect(chip.nameRoom.left, `${at} name is on the screen`).toBeGreaterThanOrEqual(2);
      expect(chip.nameRoom.right, `${at} name is on the screen`).toBeGreaterThanOrEqual(2);
      expect(chip.nameRoom.top, `${at} name is below the navbar`).toBeGreaterThanOrEqual(8);
      expect(chip.nameRoom.bottom, `${at} name is inside the hero`).toBeGreaterThanOrEqual(8);
      expect(chip.nameTouchesCopy, `${at} name keeps off the copy`).toBe(false);
      expect(chip.nameCrowded, `${at} name has its place to itself`).toBe(false);
    }
  }
});

test.describe('motion allowed', () => {
  test.use({ reducedMotion: 'no-preference' });

  test('the benefit icons swing into place once around a still mark, and only the light on their ring keeps going', async ({
    page,
  }) => {
    await page.goto('/');

    // Everything in the hero that plays by itself, still playing or already over. What waits for
    // the pointer, the primary's aura, is paused.
    const started = await hero(page).evaluate((section) =>
      section
        .getAnimations({ subtree: true })
        .filter((animation) => animation.playState !== 'paused')
        .map((animation) => ({
          name: (animation as CSSAnimation).animationName,
          ...animation.effect!.getTiming(),
          end: Number(animation.effect!.getComputedTiming().endTime),
        })),
    );

    // The light on the ring is the one thing that never ends: the owner's exception to the
    // five-second limit, tested on its own below.
    const endless = started.filter((animation) => animation.end === Infinity);
    expect(endless.map((animation) => animation.name)).toEqual(['orbit-light']);

    // The rest is the orbit arriving: once, and over well inside five seconds (WCAG 2.2.2). The
    // copy and the mark never move, and no underline is drawn.
    const arrival = started.filter((animation) => animation.end !== Infinity);
    expect([...new Set(arrival.map((animation) => animation.name))].sort()).toEqual(ORBIT_ARRIVAL);
    for (const animation of arrival) {
      expect(animation.iterations, `${animation.name} plays once`).toBe(1);
      expect(animation.end, `${animation.name} is over in time`).toBeLessThanOrEqual(3500);
    }

    // The names are the last to arrive: they fade in only once their chips have all but stopped
    // (the swing is 99% done after 2.5s), so no text travels.
    const names = await orbit(page).evaluate((frame) =>
      Array.from(frame.querySelectorAll('[data-orbit-name]'), (name) =>
        name.getAnimations().map((animation) => ({
          name: (animation as CSSAnimation).animationName,
          delay: Number(animation.effect!.getTiming().delay),
        })),
      ),
    );
    expect(names).toHaveLength(heroBenefits.length);
    for (const fades of names) {
      expect(
        fades.map((fade) => fade.name),
        'a name only fades',
      ).toEqual(['orbit-fade']);
      expect(fades[0].delay, 'after its chip has arrived').toBeGreaterThanOrEqual(2500);
    }

    const moving = await hero(page).evaluate(
      (section) =>
        section
          .getAnimations({ subtree: true })
          .map((animation) => (animation.effect as KeyframeEffect | null)?.target)
          .filter((target): target is Element => target instanceof Element)
          .filter((target) => !target.closest('[data-orbit-frame], .aura')).length,
    );
    expect(moving, 'nothing outside the ring and the aura moves').toBe(0);

    // Once arrived, every icon rests in its place, upright and solid, with its name showing.
    await hero(page).evaluate(async (section) => {
      const ending = section
        .getAnimations({ subtree: true })
        .filter((animation) => animation.playState !== 'paused')
        .filter((animation) => Number(animation.effect?.getComputedTiming().endTime) < Infinity);
      await Promise.all(ending.map((animation) => animation.finished));
    });
    await expectChipsInPlace(page);
    for (const part of await orbit(page).locator('[data-orbit-chip], [data-orbit-name]').all()) {
      await expect(part).toHaveCSS('opacity', '1');
    }
  });

  test('a light circles the ring all the time, pointer or not, and the icons stay where they are', async ({
    page,
  }) => {
    await page.goto('/');

    // Circling from the start with no pointer near: one light, a lap every ten seconds at an even
    // pace, without end.
    const loaded = await orbitLight(page);
    expect(loaded.count, 'one light, on the ring').toBe(1);
    expect(loaded.playing, 'circling with no pointer').toBe(true);
    expect(loaded.timing, 'a lap every ten seconds, at an even pace, without end').toEqual({
      duration: 10_000,
      easing: 'linear',
      iterations: Infinity,
    });

    // It fades in only once the outer ring has opened, so it never lies on a ring still growing.
    const { opened, lit } = await orbit(page).evaluate((frame) => {
      const timing = (selector: string, name: string) =>
        frame
          .querySelector(selector)!
          .getAnimations()
          .find((animation) => (animation as CSSAnimation).animationName === name)!
          .effect!.getComputedTiming();
      return {
        opened: Number(timing('[data-orbit-ring="outer"]', 'orbit-ring').endTime),
        lit: Number(timing('[data-orbit-light]', 'orbit-fade').delay),
      };
    });
    expect(lit, 'lit once the outer ring has opened').toBeGreaterThanOrEqual(opened);

    // Skip to the end of the arrival (everything here that has an end): the light shines in full
    // and goes on circling, and every icon is in its resting place.
    await orbit(page).evaluate((frame) => {
      for (const animation of frame.getAnimations({ subtree: true })) {
        const end = Number(animation.effect?.getComputedTiming().endTime);
        if (Number.isFinite(end)) animation.finish();
      }
    });
    await expect.poll(async () => (await orbitLight(page)).brightness).toBe(1);
    const before = (await orbitLight(page)).time ?? 0;
    await expect
      .poll(async () => (await orbitLight(page)).time ?? 0, 'still circling')
      .toBeGreaterThan(before);
    await expectChipsInPlace(page);

    // A pointer over the mark and away again, or a tap on touch, neither stops nor dims it.
    if (await hasHover(page)) {
      await mark(page).hover();
      await page.mouse.move(0, 400);
    } else {
      await mark(page).tap();
    }
    const after = await orbitLight(page);
    expect(after.playing, 'still circling').toBe(true);
    expect(after.brightness, 'still lit').toBe(1);
    expect(after.time ?? 0, 'it went on from where it was').toBeGreaterThan(before);
  });

  test('the turning light never makes the page scroll sideways, at every width', async ({
    page,
  }) => {
    for (const width of [320, 360, 390, 768, 1024, 1280, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      // Held an eighth of a lap round, 45 degrees, where a turned square reaches furthest.
      await orbit(page).evaluate((frame) => {
        for (const animation of frame.getAnimations({ subtree: true })) {
          if ((animation as CSSAnimation).animationName === 'orbit-light') {
            animation.pause();
            animation.currentTime = 1250;
          }
        }
      });
      const sideways = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(sideways, `${width}px: no sideways scroll`).toBeLessThanOrEqual(1);
    }
  });

  test('the arriving icons never make the page scroll sideways, at every width', async ({
    page,
  }) => {
    for (const width of [320, 360, 390, 768, 1024, 1280, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      // Every moment of the arrival, 50ms apart. Each icon's box with its label, turned, counts
      // as page width: on phones it reached past the edge from about 1.5s to 2.1s (2026-11-22).
      const widest = await orbit(page).evaluate((frame, names) => {
        const root = document.documentElement;
        const arrival = frame
          .getAnimations({ subtree: true })
          .filter((animation) => names.includes((animation as CSSAnimation).animationName));
        arrival.forEach((animation) => animation.pause());
        let found = { time: 0, sideways: -Infinity, animations: arrival.length };
        for (let time = 0; time <= 3600; time += 50) {
          arrival.forEach((animation) => (animation.currentTime = time));
          const sideways = root.scrollWidth - root.clientWidth;
          if (sideways > found.sideways) found = { ...found, time, sideways };
        }
        return found;
      }, ORBIT_ARRIVAL);
      expect(widest.animations, `${width}px: the arrival is running`).toBeGreaterThan(0);
      expect(
        widest.sideways,
        `${width}px: no sideways scroll, ${widest.time}ms into the arrival`,
      ).toBeLessThanOrEqual(1);
    }
  });

  test('the buttons change colour without transitions', async ({ page }) => {
    await page.goto('/');
    for (const label of [primaryCta.label, 'About us']) {
      await expect(hero(page).getByText(label, { exact: true })).toHaveCSS(
        'transition-property',
        'none',
      );
    }
  });

  test("the primary's aura fades and circles like the navbar's, and resumes where it stopped", async ({
    page,
  }) => {
    await page.goto('/');
    const aura = heroAura(page);
    await expect(aura, 'one aura in the hero, on the primary').toHaveCount(1);
    await expect(aura.getByText(primaryCta.label, { exact: true })).toBeVisible();

    // No lap on load. The spin is paused and the light is off, ready to continue later.
    const resting = await auraSpin(aura);
    expect(resting.playing, 'nothing moves at rest').toBe(false);
    expect(resting.time, 'the spin is waiting').not.toBeNull();
    expect(resting.strength).toBe('0%');
    // The fade is on the light's strength, in both directions, same as the navbar.
    await expect(aura).toHaveCSS('transition-property', '--aura-light');
    await expect(aura).toHaveCSS('transition-duration', '0.4s');

    if (!(await page.evaluate(() => matchMedia('(hover: hover)').matches))) return;
    await primaryButton(page).hover();
    await expect.poll(async () => (await auraSpin(aura)).strength).toBe('100%');
    await expect.poll(async () => (await auraSpin(aura)).time ?? 0).toBeGreaterThan(200);
    const hovered = await auraAnimations(aura);
    expect(hovered.every((animation) => animation.playing)).toBe(true);
    // The same endless light as the navbar's, at the same speed and in the same direction.
    const navbar = await auraAnimations(page.getByRole('banner').locator('.aura'));
    const light = (animations: typeof hovered) =>
      animations
        .filter((animation) => animation.name === 'aura')
        .map(({ name, timing }) => ({ name, timing }));
    expect(light(hovered)).toEqual(light(navbar));
    // In the navbar's light too: on the near-black band both take the band's light text colour.
    const glow = (target: Locator) => target.evaluate((el) => getComputedStyle(el).color);
    expect(await glow(aura), "the navbar's light").toBe(
      await glow(page.getByRole('banner').locator('.aura')),
    );
    const carried = (await auraSpin(aura)).time ?? 0;

    // The pointer leaves: the light fades out and the spin stays paused where it is.
    await page.mouse.move(0, 400);
    await expect.poll(async () => (await auraSpin(aura)).playing).toBe(false);
    const paused = (await auraSpin(aura)).time ?? 0;
    expect(paused, 'the spin did not jump back to the start').toBeGreaterThanOrEqual(carried - 50);
    await expect.poll(async () => (await auraSpin(aura)).strength).toBe('0%');

    // Park the spin at a known angle, then come back: it continues from there and the light fades in.
    await aura.evaluate((el) => {
      for (const animation of el.getAnimations()) {
        if ((animation as CSSAnimation).animationName === 'aura') animation.currentTime = 2500;
      }
    });
    await primaryButton(page).hover();
    const resumed = (await auraSpin(aura)).time ?? 0;
    expect(resumed, 'the spin continues from where it stopped').toBeGreaterThanOrEqual(2400);
    expect(resumed, 'the spin did not start over').toBeLessThan(3500);
    await expect.poll(async () => (await auraSpin(aura)).strength).toBe('100%');
  });
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('the benefit icons and their labels rest in place, and no light comes, even under the pointer', async ({
    page,
  }) => {
    await page.goto('/');
    if (await hasHover(page)) await mark(page).hover();
    expect(
      await hero(page).evaluate((section) => section.getAnimations({ subtree: true }).length),
      'no arrival, no fade, and no light: nothing in the hero animates',
    ).toBe(0);
    await expectChipsInPlace(page);
    for (const part of await orbit(page).locator('[data-orbit-chip], [data-orbit-name]').all()) {
      await expect(part).toHaveCSS('opacity', '1');
    }
    await expect(orbit(page).locator('[data-orbit-light]')).toHaveCSS('opacity', '0');
  });

  test("the primary's aura stays off and still, even under the pointer", async ({ page }) => {
    await page.goto('/');
    if (await page.evaluate(() => matchMedia('(hover: hover)').matches)) {
      await primaryButton(page).hover();
    }
    const aura = heroAura(page);
    expect(await auraAnimations(aura)).toEqual([]);
    expect((await auraSpin(aura)).strength).toBe('0%');
  });
});

test("the primary's aura takes no room of its own", async ({ page }) => {
  const measure = async (width: number) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const about = hero(page).getByRole('link', { name: 'About us' });
    const gap = await about.evaluate((el) => {
      const row = getComputedStyle(el.parentElement!);
      return { row: parseFloat(row.rowGap), column: parseFloat(row.columnGap) };
    });
    return {
      primary: (await primaryButton(page).boundingBox())!,
      about: (await about.boundingBox())!,
      gap,
    };
  };

  // Stacked: exactly as wide as About us, with only the row gap between them.
  const stacked = await measure(390);
  expect(stacked.primary.x).toBeCloseTo(stacked.about.x, 1);
  expect(stacked.primary.width).toBeCloseTo(stacked.about.width, 1);
  expect(stacked.about.y - (stacked.primary.y + stacked.primary.height)).toBeCloseTo(
    stacked.gap.row,
    1,
  );

  // Side by side: on the same line, with only the column gap between them.
  const row = await measure(1280);
  expect(row.primary.y).toBeCloseTo(row.about.y, 1);
  expect(row.about.x - (row.primary.x + row.primary.width)).toBeCloseTo(row.gap.column, 1);
});

test('the headline keeps its four lines at every width', async ({ page }) => {
  for (const width of [320, 360, 768, 1024, 1280, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    // Measured in Mukta, the heading face, not in the fallback a browser shows until it loads.
    await page.evaluate(() => document.fonts.ready);
    const lines = await hero(page).evaluate((section) => {
      const heading = section.querySelector('h1')!;
      const fontSize = parseFloat(getComputedStyle(heading).fontSize);
      return Array.from(heading.children, (line) => ({
        text: line.textContent!.trim(),
        // A line that wrapped would be two line-heights tall.
        lines: line.getBoundingClientRect().height / (fontSize * 1.05),
      }));
    });
    for (const line of lines) {
      expect(line.lines, `${width}px: "${line.text}" on one line`).toBeLessThan(1.5);
    }
  }
});
