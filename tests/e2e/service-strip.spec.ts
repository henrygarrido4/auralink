import { expect, test, type Locator, type Page } from '@playwright/test';
import { serviceCards } from '../../src/data/site';
import { SERVICE_STRIP_SPEED_PX_PER_SECOND } from '../../src/lib/service-strip';

/**
 * Home services strip (src/components/sections/ServiceStrip.astro), between the hero and the
 * introduction: the service-card titles as one line of type, the first word bold and the rest
 * light, with a small star before each. The titles scroll slowly right to left in one continuous
 * loop that fades out at both edges, hold still while the pointer is over the band, and otherwise
 * sit in a static wrapping row: under reduced motion and without JavaScript. There is no pause
 * button (owner, 2026-11-18). The repeated half and the stars stay out of the accessibility tree.
 * Nothing in the strip is a link or a control.
 */
const WIDTHS = [360, 390, 768, 1024, 1440, 1920];

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

  test('lists each service once, between the hero and the introduction, with no links', async ({
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
      const about = document.getElementById('about');
      if (!hero || !band || !about) return 'missing';
      const afterHero = hero.compareDocumentPosition(band) & Node.DOCUMENT_POSITION_FOLLOWING;
      const beforeAbout = band.compareDocumentPosition(about) & Node.DOCUMENT_POSITION_FOLLOWING;
      return afterHero && beforeAbout ? 'between' : 'elsewhere';
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
        bandHeight: box(root).height,
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
    // A short band: one line of type and its padding.
    expect(measured.bandHeight).toBeGreaterThanOrEqual(80);
    expect(measured.bandHeight).toBeLessThanOrEqual(120);
    expect(await edgeFade(page), 'the row fades at its edges').toContain('linear-gradient');
    const speed = measured.halfWidth / (measured.duration / 1000);
    expect(speed).toBeGreaterThan(SERVICE_STRIP_SPEED_PX_PER_SECOND * 0.9);
    expect(speed).toBeLessThan(SERVICE_STRIP_SPEED_PX_PER_SECOND * 1.1);

    // 400ms at 30px a second is 12px.
    expect(await travel(track, 400), 'the names move left').toBeLessThan(-6);
    expect(await pageOverflow(page)).toBeLessThanOrEqual(1);
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
