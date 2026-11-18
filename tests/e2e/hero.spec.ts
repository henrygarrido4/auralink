import { expect, test, type Locator, type Page } from '@playwright/test';
import { primaryCta, serviceCards } from '../../src/data/site';

/**
 * Home hero (src/components/sections/Hero.astro). Copy and buttons are real HTML, and the device
 * image loads eagerly with its space reserved. Two things move on load, once each, and both are
 * hidden from assistive technology and already in place under reduced motion. The pencil
 * underline under "brings them back" is drawn after a short pause and stays attached to its phrase
 * at every width. The service icons swing into place on a ring around the devices
 * (src/components/ui/ServiceOrbit.astro): one chip per service card, resting clear of the laptop
 * and the phone, inside the hero and off the copy, at every width. Afterwards they travel only
 * while a pointer is over the devices, and keep their place when it leaves. The primary button's
 * aura stays unlit until the pointer reaches it, then fades and circles like the navbar's and
 * resumes where it stopped. It takes no room of its own, and never lights under reduced motion.
 */
const HEADLINE = 'Websites that win customers. Email that brings them back.';

const hero = (page: Page) => page.getByRole('region', { name: HEADLINE });
const underline = (page: Page) => page.getByRole('heading', { level: 1 }).locator('svg');
const primaryButton = (page: Page) => hero(page).getByText(primaryCta.label, { exact: true });
const heroAura = (page: Page) => hero(page).locator('.aura');
const devices = (page: Page) => hero(page).getByRole('img', { name: /laptop and phone/i });
const orbit = (page: Page) => hero(page).locator('[data-orbit-frame]');

/** The animations that bring the orbit in on load. Its `orbit-spin` waits for the pointer. */
const ORBIT_ARRIVAL = ['orbit-arrive', 'orbit-fade', 'orbit-pop', 'orbit-ring'];

const hasHover = (page: Page) => page.evaluate(() => matchMedia('(hover: hover)').matches);

/** How far apart two directions are, in degrees. */
const apart = (a: number, b: number) => Math.abs(((a - b + 540) % 360) - 180);

/**
 * Where each chip is on the ring: its angle around the centre, clockwise from three o'clock, and
 * its distance from the centre. `spinTo` first moves the pointer-driven spin to that many
 * milliseconds, in the same step, so a running spin cannot move on before the chips are measured.
 */
const chipPlaces = (page: Page, spinTo?: number) =>
  orbit(page).evaluate((frame, spinTo) => {
    if (spinTo !== undefined) {
      for (const animation of frame.getAnimations({ subtree: true })) {
        if ((animation as CSSAnimation).animationName === 'orbit-spin') {
          animation.currentTime = spinTo;
        }
      }
    }
    const disc = frame.querySelector('[data-orbit-disc]')!.getBoundingClientRect();
    const centre = { x: disc.left + disc.width / 2, y: disc.top + disc.height / 2 };
    return Array.from(frame.querySelectorAll<HTMLElement>('[data-orbit-chip]'), (chip) => {
      const box = chip.getBoundingClientRect();
      const x = box.left + box.width / 2 - centre.x;
      const y = box.top + box.height / 2 - centre.y;
      return {
        id: chip.dataset.orbitChip,
        angle: ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360,
        distance: Math.hypot(x, y),
        // A turned box has a larger bounding box than its own size.
        upright:
          Math.abs(box.width - chip.offsetWidth) < 0.5 &&
          Math.abs(box.height - chip.offsetHeight) < 0.5,
      };
    });
  }, spinTo);

/** Where the chips rest: from the first one's angle, at equal steps, as the component sets them. */
const restingAngles = (page: Page) =>
  orbit(page).evaluate((frame) => {
    const style = getComputedStyle(frame);
    const degrees = (name: string) => parseFloat(style.getPropertyValue(name));
    const count = frame.querySelectorAll('[data-orbit-chip]').length;
    return Array.from(
      { length: count },
      (_, index) => (degrees('--orbit-start') + index * degrees('--orbit-step')) % 360,
    );
  });

/** Every chip is in its resting place, turned by `turn` degrees, with its icon upright. */
async function expectChipsInPlace(page: Page, turn = 0) {
  const resting = await restingAngles(page);
  const places = await chipPlaces(page, turn ? (turn / 360) * 60_000 : undefined);
  expect(
    places.map((place) => place.id),
    'one chip per service card, in order',
  ).toEqual(serviceCards.map((card) => card.id));
  places.forEach((place, index) => {
    const expected = (resting[index] + turn) % 360;
    expect(
      apart(place.angle, expected),
      `${place.id} is at ${expected} degrees, not ${place.angle.toFixed(1)}`,
    ).toBeLessThan(1);
    expect(place.upright, `${place.id} is upright`).toBe(true);
    expect(place.distance, `${place.id} is on the ring`).toBeCloseTo(places[0].distance, 0);
  });
}

/** The orbit's pointer-driven spin: whether it plays, how far it has got, and its timing. */
const orbitSpin = (page: Page) =>
  orbit(page).evaluate((frame) => {
    const spins = frame
      .getAnimations({ subtree: true })
      .filter((animation) => (animation as CSSAnimation).animationName === 'orbit-spin');
    const [spin] = spins;
    const { duration, easing, iterations } = spin?.effect?.getTiming() ?? {};
    return {
      count: spins.length,
      playing: spin?.playState === 'running',
      time: spin ? Number(spin.currentTime) : null,
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
  await expect(hero(page).getByText('Web design + lifecycle email')).toBeVisible();
  await expect(
    hero(page).getByText(
      'Custom websites and email journeys that help people find you, choose you, and come back.',
    ),
  ).toBeVisible();

  // The primary button follows the navbar's call to action, link or placeholder alike.
  const primary = hero(page).getByText(primaryCta.label, { exact: true });
  await expect(primary).toBeVisible();
  if (primaryCta.href) await expect(primary).toHaveAttribute('href', primaryCta.href);
  else await expect(primary, 'no destination yet').not.toHaveAttribute('href');

  const about = hero(page).getByRole('link', { name: 'About us' });
  await expect(about).toHaveAttribute('href', '#about');
  await expect(page.locator('#about').getByRole('heading', { level: 2 })).toBeVisible();
});

test('loads the device image eagerly with its space reserved', async ({ page }) => {
  await page.goto('/');
  const image = hero(page).getByRole('img', { name: /laptop and phone/i });
  await expect(image).toHaveAttribute('loading', 'eager');
  await expect(image).toHaveAttribute('fetchpriority', 'high');
  await expect(image).toHaveAttribute('width', /^\d+$/);
  await expect(image).toHaveAttribute('height', /^\d+$/);
  await expect(hero(page).locator('picture source[type="image/avif"]')).toHaveCount(1);
});

test('one chip per service circles the devices, as decoration only', async ({ page }) => {
  await page.goto('/');
  const frame = orbit(page);
  await expect(frame).toHaveAttribute('aria-hidden', 'true');
  await expect(frame, 'no text').toHaveText('');
  await expect(
    frame.locator('a, button, input, select, textarea, [tabindex]'),
    'nothing to focus',
  ).toHaveCount(0);

  await expect(frame.locator('[data-orbit-chip]')).toHaveCount(serviceCards.length);
  for (const card of serviceCards) {
    await expect(
      frame.locator(`[data-orbit-chip="${card.id}"] svg`),
      `${card.title}: one icon`,
    ).toHaveCount(1);
  }

  // The headline's two promises, websites and email, take the primary colour. The rest do not.
  const colours = await frame.evaluate((frame) => {
    const probe = document.createElement('span');
    probe.style.backgroundColor = 'var(--color-primary)';
    frame.append(probe);
    const primary = getComputedStyle(probe).backgroundColor;
    probe.remove();
    return Array.from(frame.querySelectorAll<HTMLElement>('[data-orbit-chip]'), (chip) => ({
      id: chip.dataset.orbitChip,
      primary: getComputedStyle(chip).backgroundColor === primary,
    }));
  });
  expect(colours.filter((chip) => chip.primary).map((chip) => chip.id)).toEqual([
    'custom-websites',
    'email-automation',
  ]);
});

test('the service icons rest clear of the devices and the copy, inside the hero, at every width', async ({
  page,
}) => {
  // Reduced motion shows the resting places at once. With motion only transforms differ.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [320, 360, 390, 768, 1024, 1280, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await expectChipsInPlace(page);

    const measured = await hero(page).evaluate(async (section) => {
      const image = section.querySelector('img')!;
      await image.decode();
      const frame = section.querySelector('[data-orbit-frame]')!;
      const disc = frame.querySelector('[data-orbit-disc]')!.getBoundingClientRect();
      const hero = section.getBoundingClientRect();
      const shown = image.getBoundingClientRect();

      // The image as the browser drew it, small. Where it is opaque, a device hides the ring.
      // Its soft shadows are far below this threshold.
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = Math.round((400 * shown.height) / shown.width);
      const context = canvas.getContext('2d')!;
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
      const opaqueAt = (x: number, y: number) => {
        const column = Math.floor(((x - shown.left) / shown.width) * canvas.width);
        const row = Math.floor(((y - shown.top) / shown.height) * canvas.height);
        if (column < 0 || row < 0 || column >= canvas.width || row >= canvas.height) return false;
        return data[(row * canvas.width + column) * 4 + 3] > 200;
      };
      /** The share of an evenly spread grid of points, within `reach` of a centre, that is hidden. */
      const hidden = (centre: { x: number; y: number }, reach: number, round: boolean) => {
        let points = 0;
        let covered = 0;
        for (let i = -4; i <= 4; i += 1) {
          for (let j = -4; j <= 4; j += 1) {
            const x = (i / 4) * reach;
            const y = (j / 4) * reach;
            if (round && Math.hypot(x, y) > reach) continue;
            points += 1;
            if (opaqueAt(centre.x + x, centre.y + y)) covered += 1;
          }
        }
        return covered / points;
      };

      // The disc is every place a chip can reach. It must miss the copy, with a little air.
      const copy = Array.from(section.querySelector('h1')!.parentElement!.children);
      const touchesCopy = copy.some((element) => {
        const box = element.getBoundingClientRect();
        return !(
          disc.right <= box.left - 8 ||
          disc.left >= box.right + 8 ||
          disc.bottom <= box.top - 8 ||
          disc.top >= box.bottom + 8
        );
      });

      return {
        // The laptop's keyboard is at the middle of the image: proof that the sampling sees it.
        devicesSeen: opaqueAt(shown.left + shown.width / 2, shown.top + shown.height / 2),
        touchesCopy,
        room: {
          top: disc.top - hero.top,
          bottom: hero.bottom - disc.bottom,
          left: disc.left,
          right: document.documentElement.clientWidth - disc.right,
        },
        chips: Array.from(frame.querySelectorAll<HTMLElement>('[data-orbit-chip]'), (chip) => {
          const box = chip.getBoundingClientRect();
          const centre = { x: box.left + box.width / 2, y: box.top + box.height / 2 };
          const icon = chip.querySelector('svg')!.getBoundingClientRect();
          return {
            id: chip.dataset.orbitChip,
            // Lucide draws inside the middle 20 of its 24 units.
            iconHidden: hidden(centre, (icon.width / 2) * (20 / 24), false),
            chipHidden: hidden(centre, box.width / 2, true),
          };
        }),
      };
    });

    expect(measured.devicesSeen, `${width}px: the image was sampled`).toBe(true);
    expect(measured.touchesCopy, `${width}px: the ring keeps off the copy`).toBe(false);
    expect(measured.room.top, `${width}px: below the navbar`).toBeGreaterThanOrEqual(8);
    expect(measured.room.bottom, `${width}px: above the hero's lower edge`).toBeGreaterThanOrEqual(
      8,
    );
    expect(measured.room.left, `${width}px: inside the screen`).toBeGreaterThanOrEqual(0);
    expect(measured.room.right, `${width}px: inside the screen`).toBeGreaterThanOrEqual(0);
    for (const chip of measured.chips) {
      expect(chip.iconHidden, `${width}px: no device covers the ${chip.id} icon`).toBe(0);
      expect(
        chip.chipHidden,
        `${width}px: at most a fifth of the ${chip.id} chip is tucked behind a device`,
      ).toBeLessThanOrEqual(0.2);
    }
  }
});

test.describe('motion allowed', () => {
  test.use({ reducedMotion: 'no-preference' });

  test('the underline draws and the service icons swing into place, once each, and nothing else moves', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(underline(page)).toHaveAttribute('aria-hidden', 'true');

    // Everything in the hero that plays by itself, still playing or already over. What waits for
    // the pointer is paused: the primary's aura and the orbit's spin.
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

    const draws = started.filter((animation) => animation.name === 'pencil-draw');
    expect(draws, 'one underline').toHaveLength(1);
    const [draw] = draws;
    expect(Number(draw.delay)).toBeGreaterThanOrEqual(200);
    expect(Number(draw.delay)).toBeLessThanOrEqual(300);
    expect(Number(draw.duration)).toBeGreaterThanOrEqual(700);
    expect(Number(draw.duration)).toBeLessThanOrEqual(900);
    expect(draw.iterations, 'plays once').toBe(1);

    // The rest is the orbit arriving: once, and over well inside five seconds (WCAG 2.2.2).
    const arrival = started.filter((animation) => animation.name !== 'pencil-draw');
    expect([...new Set(arrival.map((animation) => animation.name))].sort()).toEqual(ORBIT_ARRIVAL);
    for (const animation of arrival) {
      expect(animation.iterations, `${animation.name} plays once`).toBe(1);
      expect(animation.end, `${animation.name} is over in time`).toBeLessThanOrEqual(3500);
    }

    // Once drawn, the line stays. Once arrived, every icon rests in its place, upright and solid.
    await hero(page).evaluate(async (section) => {
      const playing = section
        .getAnimations({ subtree: true })
        .filter((animation) => animation.playState !== 'paused');
      await Promise.all(playing.map((animation) => animation.finished));
    });
    await expect(underline(page).locator('path')).toHaveCSS('stroke-dashoffset', '0px');
    await expectChipsInPlace(page);
    for (const chip of await orbit(page).locator('[data-orbit-chip]').all()) {
      await expect(chip).toHaveCSS('opacity', '1');
    }
  });

  test('the service icons travel only under the pointer, and keep their place when it leaves', async ({
    page,
  }) => {
    await page.goto('/');

    // Applied and waiting, so a later visit can continue: nothing travels by itself.
    const waiting = await orbitSpin(page);
    expect(waiting.count, 'one spin, on the track').toBe(1);
    expect(waiting.playing, 'nothing travels at rest').toBe(false);
    expect(waiting.time).toBe(0);
    expect(
      waiting.timing,
      'a lap a minute, at an even pace, for as long as the pointer stays',
    ).toEqual({ duration: 60_000, easing: 'linear', iterations: Infinity });

    // A touch screen has no hover: a tap on the devices starts nothing.
    if (!(await hasHover(page))) {
      await devices(page).tap();
      expect((await orbitSpin(page)).playing, 'still waiting after a tap').toBe(false);
      return;
    }

    await devices(page).hover();
    await expect.poll(async () => (await orbitSpin(page)).playing).toBe(true);
    await expect.poll(async () => (await orbitSpin(page)).time ?? 0).toBeGreaterThan(100);
    const carried = (await orbitSpin(page)).time ?? 0;

    // The pointer leaves: the icons stop where they are.
    await page.mouse.move(0, 400);
    await expect.poll(async () => (await orbitSpin(page)).playing).toBe(false);
    expect(
      (await orbitSpin(page)).time ?? 0,
      'the spin did not jump back to the start',
    ).toBeGreaterThanOrEqual(carried);

    // A sixth of a lap on, each icon stands where the next one rests, still upright. Measured
    // from the resting places, so skip to the end of the arrival first.
    await orbit(page).evaluate((frame) => {
      for (const animation of frame.getAnimations({ subtree: true })) {
        if (animation.playState !== 'paused') animation.finish();
      }
    });
    await expectChipsInPlace(page, 360 / serviceCards.length);

    // The pointer returns: they go on from there.
    await devices(page).hover();
    await expect.poll(async () => (await orbitSpin(page)).playing).toBe(true);
    const resumed = (await orbitSpin(page)).time ?? 0;
    expect(resumed, 'the spin continues from where it stopped').toBeGreaterThanOrEqual(10_000);
    expect(resumed, 'the spin did not start over').toBeLessThan(15_000);
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

  test('shows the finished underline without animating', async ({ page }) => {
    await page.goto('/');
    const path = underline(page).locator('path');
    expect(await path.evaluate((el) => el.getAnimations().length)).toBe(0);
    await expect(path).toHaveCSS('stroke-dashoffset', '0px');
  });

  test('the service icons rest in their places and never move, even under the pointer', async ({
    page,
  }) => {
    await page.goto('/');
    if (await hasHover(page)) await devices(page).hover();
    expect(
      await orbit(page).evaluate((frame) => frame.getAnimations({ subtree: true }).length),
      'no arrival and no spin',
    ).toBe(0);
    await expectChipsInPlace(page);
    for (const chip of await orbit(page).locator('[data-orbit-chip]').all()) {
      await expect(chip).toHaveCSS('opacity', '1');
    }
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

test('the underline stays attached to its phrase at every width', async ({ page }) => {
  for (const width of [360, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    const geometry = await underline(page).evaluate((svg) => {
      const phrase = svg.parentElement!.getBoundingClientRect();
      const line = svg.querySelector('path')!.getBoundingClientRect();
      const fontSize = parseFloat(getComputedStyle(svg.parentElement!).fontSize);
      return { phrase, line, fontSize, viewport: document.documentElement.clientWidth };
    });
    const { phrase, line, fontSize, viewport } = geometry;
    // Spans the phrase, sits under it (not through the letters), and stays on screen.
    expect(Math.abs(line.left - phrase.left), `${width}px: starts at the phrase`).toBeLessThan(
      0.1 * fontSize,
    );
    expect(Math.abs(line.right - phrase.right), `${width}px: ends at the phrase`).toBeLessThan(
      0.1 * fontSize,
    );
    // Mukta's line box is deeper than the Latin letters, and the stroke is lifted 0.2em into that
    // spare descent. Its rising right end is the top of the box, still below the g.
    expect(line.top, `${width}px: below the letters`).toBeGreaterThan(
      phrase.bottom - 0.25 * fontSize,
    );
    expect(line.bottom, `${width}px: close to the phrase`).toBeLessThan(
      phrase.bottom + 0.3 * fontSize,
    );
    expect(line.right, `${width}px: inside the viewport`).toBeLessThanOrEqual(viewport);
  }
});
