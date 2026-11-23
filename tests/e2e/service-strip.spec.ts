import { expect, test, type Locator, type Page } from './fixtures';
import { serviceCards } from '../../src/data/site';
import { SERVICE_STRIP_SPEED_PX_PER_SECOND } from '../../src/lib/service-strip';

/**
 * Home services strip (src/components/sections/ServiceStrip.astro), between the hero and the
 * services: the service-card titles as one line of type, the first word bold and the rest
 * light, with a small eight-point asterisk before each, near-black on a yellow band. Behind the yellow lies a
 * neutral band tilted 2.2 degrees, showing above it on the right and below it on the left, as in
 * the owner's reference (2026-11-18). The titles scroll slowly right to left in one continuous
 * loop that runs off both edges, hold still while the pointer is over the band, and otherwise sit
 * in a static wrapping row: under reduced motion and without JavaScript. There is no pause button
 * (owner, 2026-11-18). The repeated half and the asterisks stay out of the accessibility tree.
 * Nothing in the strip is a link or a control.
 */
const WIDTHS = [360, 390, 768, 1024, 1440, 1920];

/** The tilt of the band behind the yellow one, in degrees. */
const TILT = 2.2;

const strip = (page: Page) => page.getByRole('region', { name: 'Services', exact: true });
const trackOf = (page: Page) => strip(page).locator('[data-service-strip-track]');

/** The marquee's play state: running, paused, or missing when it is not applied. */
const playState = (track: Locator) =>
  track.evaluate(
    (element) =>
      element
        .getAnimations()
        .find((item) => (item as CSSAnimation).animationName === 'service-strip-scroll')
        ?.playState ?? 'missing',
  );

/** The fade at the row's edges: its mask, or `none`. */
const edgeFade = (page: Page) =>
  strip(page)
    .locator('[data-service-strip-viewport]')
    .evaluate((element) => {
      const style = getComputedStyle(element);
      return (
        style.getPropertyValue('mask-image') ||
        style.getPropertyValue('-webkit-mask-image') ||
        'none'
      );
    });

/** How far the track moves over `ms`, in px: negative is leftward. */
const travel = (track: Locator, ms: number) =>
  track.evaluate(
    (element, duration) =>
      new Promise<number>((resolve) => {
        const xOf = () => new DOMMatrix(getComputedStyle(element).transform).m41;
        const start = performance.now();
        const x0 = xOf();
        const tick = () => {
          if (performance.now() - start < duration) requestAnimationFrame(tick);
          else resolve(xOf() - x0);
        };
        requestAnimationFrame(tick);
      }),
    ms,
  );

const pageOverflow = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

/** A CSS colour as the sRGB channels the page paints it in, through a 1x1 canvas. */
const srgb = (page: Page, value: string) =>
  page.evaluate((colour) => {
    const probe = document.createElement('i');
    probe.style.color = colour;
    document.body.append(probe);
    const computed = getComputedStyle(probe).color;
    probe.remove();
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const context = canvas.getContext('2d')!;
    context.fillStyle = computed;
    context.fillRect(0, 0, 1, 1);
    return [...context.getImageData(0, 0, 1, 1).data.slice(0, 3)];
  }, value);

/** The colours at the given points of a screenshot. The page decodes it, so no image library. */
const pixelsAt = (page: Page, png: Buffer, points: (readonly [number, number])[]) =>
  page.evaluate(
    async ({ src, points }) => {
      const image = new Image();
      image.src = src;
      await image.decode();
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext('2d')!;
      context.drawImage(image, 0, 0);
      return points.map(([x, y]) => [
        ...context.getImageData(Math.floor(x), Math.floor(y), 1, 1).data.slice(0, 3),
      ]);
    },
    { src: `data:image/png;base64,${png.toString('base64')}`, points },
  );

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

const sameColour = (actual: number[], expected: number[], what: string) => {
  for (const [index, channel] of actual.entries()) {
    expect(
      Math.abs(channel - expected[index]),
      `${what}: ${actual} vs ${expected}`,
    ).toBeLessThanOrEqual(2);
  }
};

/**
 * Where each named item sits, read in one `evaluate` over the strip's list. Not with
 * `strip(page).getByRole('listitem').evaluateAll(...)`: in Playwright 1.65's Firefox (159), an
 * `evaluateAll` on a locator inside a region found by its name crashes the page once anything has
 * queried that region before (a count, an expect, an evaluate). Seen in CI and reproduced on Linux,
 * 2026-11-18. An `evaluate` on one element does not crash.
 */
const itemBoxes = (page: Page) =>
  strip(page)
    .getByRole('list')
    .evaluate((list) =>
      [...list.querySelectorAll(':scope > li')].map((item) => {
        const rect = item.getBoundingClientRect();
        return { top: rect.top, left: rect.left, right: rect.right };
      }),
    );

test.describe('services strip', () => {
  test.use({ reducedMotion: 'no-preference' });

  test('lists each service once, between the hero and the services, with no links', async ({
    page,
  }) => {
    await page.goto('/');
    const band = strip(page);
    await expect(band.getByRole('listitem')).toHaveCount(serviceCards.length);
    const snapshot = await band.ariaSnapshot();
    for (const [index, card] of serviceCards.entries()) {
      const item = band.getByRole('listitem').nth(index);
      await expect(item).toHaveText(card.title);
      await expect(item.locator('svg[aria-hidden="true"]'), `${card.title} star`).toHaveCount(1);
      await expect(item.locator('svg')).toBeVisible();
      // The first word is bold and the rest light, in the heading face's two weights.
      const lead = item.locator('[data-service-strip-label] > span');
      await expect(lead).toHaveText(card.title.split(' ')[0]);
      await expect(lead).toHaveCSS('font-weight', '700');
      await expect(item.locator('[data-service-strip-label]')).toHaveCSS('font-weight', '300');
      const hits =
        snapshot.match(new RegExp(card.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) ?? [];
      expect(hits, snapshot).toHaveLength(1);
    }
    await expect(band.getByRole('link')).toHaveCount(0);
    await expect(band.getByRole('button'), 'no pause button').toHaveCount(0);
    expect(
      await band.locator('li').count(),
      'the loop repeats the list in the DOM',
    ).toBeGreaterThan(serviceCards.length);

    const order = await page.evaluate(() => {
      const hero = document.querySelector('[aria-labelledby="hero-title"]');
      const band = document.querySelector('[data-service-strip]');
      const services = document.getElementById('services');
      if (!hero || !band || !services) return 'missing';
      const afterHero = hero.compareDocumentPosition(band) & Node.DOCUMENT_POSITION_FOLLOWING;
      const beforeServices =
        band.compareDocumentPosition(services) & Node.DOCUMENT_POSITION_FOLLOWING;
      return afterHero && beforeServices ? 'between' : 'elsewhere';
    });
    expect(order).toBe('between');
  });

  test('scrolls right to left in one seamless loop that fills the screen', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    const band = strip(page);
    const track = band.locator('[data-service-strip-track]');
    const measured = await track.evaluate((element) => {
      const root = element.closest('[data-service-strip]');
      const viewport = root?.querySelector('[data-service-strip-viewport]');
      const half = root?.querySelector<HTMLElement>(
        '[data-service-strip-half]:not([data-service-strip-clone])',
      );
      const clone = root?.querySelector<HTMLElement>('[data-service-strip-clone]');
      if (!root || !viewport || !half || !clone) return null;
      // elementFromPoint only answers for points on screen.
      viewport.scrollIntoView({ block: 'center', behavior: 'instant' });
      const animation = element
        .getAnimations()
        .find((item) => (item as CSSAnimation).animationName === 'service-strip-scroll');
      const duration = animation?.effect?.getComputedTiming().duration;
      const box = (node: Element) => node.getBoundingClientRect();
      const halfLabels = [...half.querySelectorAll('[data-service-strip-label]')];
      const cloneLabels = [...clone.querySelectorAll('[data-service-strip-label]')];
      const gap = (from: Element, to: Element) => box(to).left - box(from).right;
      const viewportBox = box(viewport);
      const misses: number[] = [];
      const y = viewportBox.top + viewportBox.height / 2;
      for (let x = Math.ceil(viewportBox.left) + 1; x < viewportBox.right - 1; x += 8) {
        const hit = document.elementFromPoint(x, y);
        if (!hit?.closest('li')) misses.push(Math.round(x));
      }
      return {
        running: root.hasAttribute('data-running'),
        playState: animation?.playState ?? 'missing',
        iterations: animation?.effect?.getComputedTiming().iterations ?? 0,
        easing: animation?.effect?.getComputedTiming().easing ?? '',
        duration: typeof duration === 'number' ? duration : 0,
        halfWidth: box(half).width,
        cloneWidth: box(clone).width,
        viewportWidth: viewportBox.width,
        internalGap: gap(cloneLabels[0], cloneLabels[1]),
        boundaryGap: gap(halfLabels[halfLabels.length - 1], cloneLabels[0]),
        misses,
        fontSize: Number.parseFloat(getComputedStyle(halfLabels[0]).fontSize),
        bandHeight: viewportBox.height,
      };
    });

    expect(measured, 'the strip measured').not.toBeNull();
    if (!measured) return;
    expect(measured.running, 'the script started the marquee').toBe(true);
    expect(measured.playState).toBe('running');
    expect(measured.iterations).toBe(Infinity);
    expect(measured.easing).toBe('linear');
    expect(measured.halfWidth).toBeGreaterThanOrEqual(measured.viewportWidth - 1);
    expect(Math.abs(measured.halfWidth - measured.cloneWidth)).toBeLessThan(1.5);
    expect(Math.abs(measured.internalGap - measured.boundaryGap)).toBeLessThan(1.5);
    expect(measured.misses, 'no empty gap across the band').toEqual([]);
    expect(measured.fontSize).toBeGreaterThanOrEqual(20);
    // A short yellow band: one line of type and its padding.
    expect(measured.bandHeight).toBeGreaterThanOrEqual(80);
    expect(measured.bandHeight).toBeLessThanOrEqual(120);
    expect(await edgeFade(page), 'the names run off both edges, with no fade').toBe('none');
    const speed = measured.halfWidth / (measured.duration / 1000);
    expect(speed).toBeGreaterThan(SERVICE_STRIP_SPEED_PX_PER_SECOND * 0.9);
    expect(speed).toBeLessThan(SERVICE_STRIP_SPEED_PX_PER_SECOND * 1.1);

    // 400ms at 30px a second is 12px.
    expect(await travel(track, 400), 'the names move left').toBeLessThan(-6);
    expect(await pageOverflow(page)).toBeLessThanOrEqual(1);
  });

  test('is a yellow band with near-black names, over a neutral band tilted behind it', async ({
    page,
  }) => {
    await page.goto('/');
    const band = strip(page);
    const colours = await band.locator('[data-service-strip-viewport]').evaluate((element) => ({
      band: getComputedStyle(element).backgroundColor,
      label: getComputedStyle(element.querySelector('[data-service-strip-label]')!).color,
      star: getComputedStyle(element.querySelector('li svg')!).color,
    }));
    const primary = await srgb(page, 'var(--color-primary)');
    const label = await srgb(page, 'var(--color-primary-content)');
    sameColour(await srgb(page, colours.band), primary, 'the band is the primary yellow');
    sameColour(await srgb(page, colours.label), label, "the names take the primary's label colour");
    expect(colours.star, 'the stars match the names').toBe(colours.label);
    expect(contrast(label, primary)).toBeGreaterThanOrEqual(4.5);

    // The tilted band shows as a wedge as deep as the section's padding at each edge of the
    // screen: half the width times tan(2.2deg). The section's top continues the hero's
    // background and its bottom the services band, so no seam shows beside the wedges. Since the
    // hero turned near-black (2026-11-22), the top is the tilted band's own colour, and the band
    // seems to pass behind the yellow from the hero.
    await band.evaluate(async (element) => {
      element.scrollIntoView({ block: 'center', behavior: 'instant' });
      // The navbar shrinks as the page scrolls (`navbar-collapse`), and everything below it moves
      // up with it; that scroll-driven animation applies over the next frames, so the strip's box
      // is taken only once they have run, or the clip sits a few pixels off and a sample meant for
      // the wedge lands on the yellow.
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    });
    const box = await band.boundingBox();
    expect(box, 'the strip has a box').not.toBeNull();
    if (!box) return;
    const { rise, screenWidth } = await band.evaluate((element) => ({
      rise: Number.parseFloat(getComputedStyle(element).paddingTop),
      screenWidth: window.innerWidth,
    }));
    const expected = (screenWidth / 2) * Math.tan((TILT * Math.PI) / 180);
    expect(Math.abs(rise - expected), `wedge depth ${rise}px`).toBeLessThan(0.5);
    const png = await page.screenshot({ clip: box, scale: 'css' });
    const [topRight, topLeft, bottomLeft, bottomRight] = await pixelsAt(page, png, [
      [box.width - 3, rise / 2],
      [2, rise / 2],
      [2, box.height - rise / 2],
      [box.width - 3, box.height - rise / 2],
    ]);
    const neutral = await srgb(page, 'var(--color-neutral)');
    sameColour(topRight, neutral, 'the tilted band above the yellow on the right');
    sameColour(bottomLeft, neutral, 'the tilted band below the yellow on the left');
    sameColour(topLeft, neutral, "the hero's background above");
    sameColour(
      bottomRight,
      await srgb(page, 'color-mix(in oklab, var(--color-base-300) 70%, var(--color-base-100))'),
      'the services band below',
    );
  });

  test('stays on one line and inside the page at every checked width', async ({ page }) => {
    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      const band = strip(page);
      await expect(band).toHaveAttribute('data-running', '');
      const tops = (await itemBoxes(page)).map((box) => box.top);
      expect(Math.max(...tops) - Math.min(...tops), `${width}px stays one line`).toBeLessThan(2);
      expect(await pageOverflow(page), `${width}px page overflow`).toBeLessThanOrEqual(1);
      const fontSize = await band
        .locator('[data-service-strip-label]')
        .first()
        .evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize));
      expect(fontSize, `${width}px type`).toBeGreaterThanOrEqual(20);
    }
  });

  test('holds still under the pointer and moves on when it leaves', async ({ page }) => {
    await page.goto('/');
    const band = strip(page);
    const track = trackOf(page);
    await expect(band).toHaveAttribute('data-running', '');
    expect(await playState(track)).toBe('running');

    await band.hover();
    await expect.poll(() => playState(track)).toBe('paused');
    // WebKit can still move the row a pixel or so just after the animation reports the pause
    // (CI, 2026-11-18: 1.1px in the next 300ms), so measure again until it holds still. A row
    // that never stops still fails.
    await expect
      .poll(async () => Math.abs(await travel(track, 300)), { message: 'still under the pointer' })
      .toBeLessThan(0.5);

    // The sticky navbar is always in view and never over the band.
    await page.getByRole('banner').hover({ position: { x: 4, y: 4 } });
    await expect.poll(() => playState(track)).toBe('running');
    expect(await travel(track, 400), 'moving again, from where it stopped').toBeLessThan(-6);
  });

  test('on a touch screen a tap holds the names, and a tap elsewhere lets them go', async ({
    page,
    hasTouch,
  }) => {
    test.skip(!hasTouch, 'needs a touch screen');
    await page.goto('/');
    const band = strip(page);
    const track = trackOf(page);
    await expect(band).toHaveAttribute('data-running', '');

    await band.tap();
    await expect.poll(() => playState(track)).toBe('paused');
    await page.getByRole('heading', { level: 1 }).tap();
    await expect.poll(() => playState(track)).toBe('running');
  });
});

test.describe('services strip, reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('shows every service in a static wrap and does not scroll', async ({ page }) => {
    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      const band = strip(page);
      await expect(band.getByRole('listitem')).toHaveCount(serviceCards.length);
      await expect(band.getByRole('button')).toHaveCount(0);
      await expect(band).not.toHaveAttribute('data-running', '');
      const running = await band.evaluate(
        (element) =>
          element.getAnimations({ subtree: true }).filter((item) => item.playState === 'running')
            .length,
      );
      expect(running, `${width}px`).toBe(0);
      expect(await edgeFade(page), `${width}px no fade on a static row`).toBe('none');
      expect(await pageOverflow(page), `${width}px page overflow`).toBeLessThanOrEqual(1);

      const boxes = await itemBoxes(page);
      const viewportWidth = page.viewportSize()?.width ?? width;
      for (const box of boxes) {
        expect(box.left).toBeGreaterThanOrEqual(-1);
        expect(box.right).toBeLessThanOrEqual(viewportWidth + 1);
      }
    }

    await page.setViewportSize({ width: 360, height: 800 });
    const tops = (await itemBoxes(page)).map((box) => box.top);
    expect(Math.max(...tops) - Math.min(...tops), 'the narrow row wraps').toBeGreaterThan(8);
  });
});

test.describe('services strip, without JavaScript', () => {
  test.use({ javaScriptEnabled: false, reducedMotion: 'no-preference' });

  test('keeps every service readable in a static wrap', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await page.goto('/');
    const band = strip(page);
    await expect(band.getByRole('listitem')).toHaveCount(serviceCards.length);
    for (const card of serviceCards) {
      await expect(band.getByRole('listitem').filter({ hasText: card.title })).toBeVisible();
    }
    await expect(band.getByRole('button')).toHaveCount(0);
    const running = await band.evaluate(
      (element) => element.getAnimations({ subtree: true }).length,
    );
    expect(running).toBe(0);
    expect(await edgeFade(page), 'no fade on a static row').toBe('none');
    await expect(band.locator('[data-service-strip-clone]')).toBeHidden();

    const boxes = await itemBoxes(page);
    expect(
      Math.max(...boxes.map((box) => box.top)) - Math.min(...boxes.map((box) => box.top)),
    ).toBeGreaterThan(8);
    for (const box of boxes) {
      expect(box.left).toBeGreaterThanOrEqual(-1);
      expect(box.right).toBeLessThanOrEqual(391);
    }
    expect(await pageOverflow(page)).toBeLessThanOrEqual(1);
  });
});
