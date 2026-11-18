import { expect, test, type Locator, type Page } from '@playwright/test';
import { featuredProjects, workFilters, type FeaturedProject } from '../../src/data/site';

/**
 * Home page selected work (src/components/sections/SelectedWork.astro): an introduction, filters
 * by platform, and the chosen platform's project as a card numbered 01-03, laid out as a slide of
 * Hub2B's "Meet our hub space": the copy in the card's left third and a 3:2 photo filling the
 * rest, flush with its top and right edges, from xl; the copy above the photo below xl. The
 * filters are a native radio group that works without JavaScript; the section opens on the first.
 * Each card links to its project in a new tab and says when the site asks for a password. Behind
 * the card lie two cut-out props that pop out, as Hub2B's do, when the section scrolls into view
 * and when a filter shows the card: never without JavaScript or under reduced motion, never when
 * on screen at load, and never moving a box.
 */
const HEADING = 'Different businesses. Different reasons to visit.';
const GROUP = 'Show the projects built with';
/** Every width the layout suite checks. */
const WIDTHS = [360, 390, 768, 1024, 1280, 1440, 1920];

const section = (page: Page) => page.getByRole('region', { name: HEADING });
/** Only the chosen filter's cards are visible, so only they are in the accessibility tree. */
const visibleCards = (page: Page) => section(page).getByRole('article');
const cardOf = (page: Page, project: FeaturedProject) =>
  section(page).getByRole('article', { name: project.name });
const radioOf = (page: Page, label: string) =>
  section(page).getByRole('group', { name: GROUP }).getByRole('radio', { name: label });
/** Chooses a filter as a visitor does, by its pill (the label around the radio). */
const choose = (page: Page, label: string) =>
  section(page).locator('label').filter({ hasText: label }).click();
/** WebKit mirrors Safari: plain Tab skips links; Option+Tab (Alt+Tab) reaches them. */
const tabKey = (browserName: string) => (browserName === 'webkit' ? 'Alt+Tab' : 'Tab');
/** The panels: one per filter, stacked in one grid cell. */
const panels = (page: Page) => section(page).locator('[data-filter-panels]');

const projectsFor = (service: string) =>
  featuredProjects
    .map((project, index) => ({ project, position: index + 1 }))
    .filter(({ project }) => project.service === service);

/** Vertical offset in a computed `translate`, in % of the element (Chromium: "0% -45%"). */
const translateY = (translate: string) =>
  translate === 'none' ? 0 : Number.parseFloat(translate.trim().split(/\s+/).at(-1) ?? '0');

/** A card's props, top and bottom: their offsets, boxes, and the card's box, in one frame. */
const propsOf = (card: Locator) =>
  card.evaluate((article) => {
    const wrapper = article.parentElement!;
    const [top, bottom] = Array.from(wrapper.querySelectorAll(':scope > picture > img'));
    const box = (el: Element) => {
      const { x, y, width, height } = el.getBoundingClientRect();
      return { x, y, width, height };
    };
    const style = (el: Element) => getComputedStyle(el);
    return {
      state: (wrapper.closest('[data-reveal]') as HTMLElement).dataset.reveal,
      card: box(article),
      top: { box: box(top), translate: style(top).translate, alt: top.getAttribute('alt') },
      bottom: {
        box: box(bottom),
        translate: style(bottom).translate,
        alt: bottom.getAttribute('alt'),
      },
      transition: `${style(top).transitionProperty} ${style(top).transitionDuration} ${style(top).transitionTimingFunction}`,
      running: wrapper.getAnimations({ subtree: true }).length,
    };
  });

/** The visible card's box and its parts, relative to the panels, so scrolling cannot move them. */
const layout = (page: Page) =>
  panels(page).evaluate((stage) => {
    const origin = stage.getBoundingClientRect();
    const box = (el: Element) => {
      const { x, y, width, height } = el.getBoundingClientRect();
      return { x: x - origin.x, y: y - origin.y, width, height };
    };
    const card = Array.from(stage.querySelectorAll('article')).find(
      (el) => getComputedStyle(el).visibility === 'visible',
    )!;
    return {
      stage: box(stage),
      card: box(card),
      copy: box(card.firstElementChild!),
      photo: box(card.querySelector('img')!),
      number: box(card.lastElementChild!.lastElementChild!),
    };
  });

/** Same boxes to within 0.01px: scrolled coordinates carry float noise in some engines. */
function expectSameLayout(actual: unknown, expected: unknown, message: string) {
  const flat = (value: unknown): number[] =>
    typeof value === 'number' ? [value] : Object.values(value as object).flatMap(flat);
  const [a, b] = [flat(actual), flat(expected)];
  expect(a.length, message).toBe(b.length);
  for (const [i, value] of a.entries()) expect(Math.abs(value - b[i]), message).toBeLessThan(0.01);
}

/**
 * The photo's `sizes` in ProjectCard.astro, evaluated as the browser does, on the viewport width
 * including any classic scrollbar: the card's full width below xl, then two thirds of it, capped
 * by the 88rem container from 1408px.
 */
const sizesAt = (viewport: number) =>
  viewport >= 1408
    ? 896
    : viewport >= 1280
      ? ((viewport - 64) * 2) / 3
      : viewport >= 1024
        ? viewport - 64
        : viewport - 48;

/** Brings an element to the middle of the viewport, as a visitor scrolling down would. */
const scrollToMiddle = (target: Locator) =>
  target.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));

/** Tabs from the top of the page until `target` has focus (bounded, so a miss fails clearly). */
async function tabTo(page: Page, target: Locator, browserName: string) {
  for (let i = 0; i < 60; i += 1) {
    if (await target.evaluate((el) => el === document.activeElement)) return;
    await page.keyboard.press(tabKey(browserName));
  }
  await expect(target).toBeFocused();
}

test('introduces the work, offers one filter per platform, and opens on the first', async ({
  page,
}) => {
  await page.goto('/');
  const region = section(page);
  await expect(region.getByRole('heading', { level: 2 })).toHaveText(HEADING);
  await expect(region.getByText('Selected work', { exact: true })).toBeVisible();

  const radios = region.getByRole('group', { name: GROUP }).getByRole('radio');
  await expect(radios).toHaveCount(workFilters.length);
  for (const [index, filter] of workFilters.entries()) {
    const radio = radioOf(page, filter.label);
    await expect(radio).toHaveAttribute('value', filter.service);
    if (index === 0) await expect(radio).toBeChecked();
    else await expect(radio).not.toBeChecked();
  }

  // One project at a time: the first platform's.
  const first = projectsFor(workFilters[0].service);
  await expect(visibleCards(page)).toHaveCount(first.length);
  await expect(region.getByRole('heading', { level: 3 })).toHaveText(
    first.map(({ project }) => project.name),
  );
});

test("each filter shows its platform's project, complete and numbered, and only that", async ({
  page,
}) => {
  await page.goto('/');
  for (const filter of workFilters) {
    await choose(page, filter.label);
    await expect(radioOf(page, filter.label)).toBeChecked();
    const shown = projectsFor(filter.service);
    await expect(visibleCards(page)).toHaveCount(shown.length);
    for (const { project, position } of shown) {
      const card = cardOf(page, project);
      await expect(card.getByText(project.platform, { exact: true })).toBeVisible();
      await expect(card.getByText(project.description, { exact: true })).toBeVisible();
      const features = card.getByRole('list').getByRole('listitem');
      await expect(features).toHaveText(project.features.map((feature) => feature.text));
      for (const icon of await features.locator('svg').all()) {
        await expect(icon).toHaveAttribute('aria-hidden', 'true');
      }
      // The number is decorative: the name already identifies the project.
      const number = card.getByText(`0${position}.`, { exact: true });
      await expect(number).toBeVisible();
      await expect(number).toHaveAttribute('aria-hidden', 'true');
    }
    // Every other project is out of sight and out of the accessibility tree, but in the HTML.
    for (const project of featuredProjects.filter((p) => p.service !== filter.service)) {
      await expect(cardOf(page, project)).toHaveCount(0);
      await expect(section(page).getByText(project.description, { exact: true })).toBeHidden();
    }
  }
});

test('the filters work from the keyboard, with a visible ring', async ({ page, browserName }) => {
  await page.goto('/');
  const first = radioOf(page, workFilters[0].label);
  await tabTo(page, first, browserName);
  const ring = await section(page)
    .locator('label')
    .filter({ hasText: workFilters[0].label })
    .evaluate((label) => {
      const style = getComputedStyle(label);
      return [style.outlineStyle, style.outlineWidth];
    });
  expect(ring, 'the focused pill shows its ring').toEqual(['solid', '2px']);

  for (const filter of workFilters.slice(1)) {
    await page.keyboard.press('ArrowRight');
    const radio = radioOf(page, filter.label);
    await expect(radio).toBeFocused();
    await expect(radio).toBeChecked();
    await expect(visibleCards(page)).toHaveText(
      projectsFor(filter.service).map(({ project }) => new RegExp(project.name)),
    );
  }
});

test('each card links to its project in a new tab and says when a password is needed', async ({
  page,
  browserName,
}) => {
  await page.goto('/');
  for (const filter of workFilters) {
    await choose(page, filter.label);
    for (const { project } of projectsFor(filter.service)) {
      const card = cardOf(page, project);
      const link = card.getByRole('link');
      await expect(link).toHaveCount(1);
      // The visible label first, then the visually hidden words. Chromium puts a space before
      // the hidden words (their box is absolutely positioned), so allow one before the comma.
      const words = `, ${project.name}, opens in a new tab`.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      await expect(link).toHaveAccessibleName(new RegExp(`^${project.link.label}\\s?${words}$`));
      await expect(link).toHaveAttribute('href', project.link.href);
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('rel', /\bnoopener\b/);
      if (project.link.passwordProtected) {
        await expect(card.getByText('Password protected', { exact: true })).toBeVisible();
        await expect(link).toHaveAccessibleDescription('Password protected');
      } else {
        await expect(card.getByText('Password protected')).toHaveCount(0);
        await expect(link).not.toHaveAttribute('aria-describedby');
      }
      // From the filters, Tab reaches this link next, with the near-black ring; the hidden
      // projects' links are skipped.
      await radioOf(page, filter.label).focus();
      await page.keyboard.press(tabKey(browserName));
      await expect(link).toBeFocused();
      const ring = await link.evaluate((el) => {
        const style = getComputedStyle(el);
        return [style.outlineStyle, style.outlineWidth, style.outlineOffset];
      });
      expect(ring, project.name).toEqual(['solid', '2px', '4px']);
    }
  }
});

test('each photo is described, lazy, 3:2, and fetched at the width it is shown', async ({
  browser,
}) => {
  // With width descriptors, naturalWidth is the evaluated `sizes` value. A fresh context per
  // width, so the browser cannot reuse a larger file it fetched for a wider viewport.
  for (const width of [390, 768, 1024, 1280, 1440, 1920]) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await context.newPage();
    await page.goto('/');
    for (const filter of workFilters) {
      await choose(page, filter.label);
      for (const { project } of projectsFor(filter.service)) {
        const name = `${width}px ${project.name}`;
        const photo = cardOf(page, project).getByRole('img', { name: project.photoAlt });
        await expect(photo).toHaveAttribute('loading', 'lazy');
        await scrollToMiddle(photo);
        await expect
          .poll(() => photo.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth))
          .toBeTruthy();
        const shown = await photo.evaluate((img: HTMLImageElement) => {
          const box = img.getBoundingClientRect();
          return {
            rendered: box.width,
            natural: img.naturalWidth,
            ratio: box.width / box.height,
            reserved: Number(img.getAttribute('width')) / Number(img.getAttribute('height')),
            viewport: window.innerWidth,
            scrollbar: window.innerWidth - document.documentElement.clientWidth,
          };
        });
        expect(shown.reserved, `${name}: reserved 3:2`).toBe(1.5);
        expect(shown.ratio, `${name}: shown 3:2`).toBeCloseTo(1.5, 2);
        const sizes = sizesAt(shown.viewport);
        expect(Math.abs(shown.natural - sizes), `${name}: sizes picked`).toBeLessThan(1);
        // The rendered width differs from `sizes` by at most the scrollbar it leaves out.
        expect(
          Math.abs(shown.rendered - sizes),
          `${name}: sizes matches the box`,
        ).toBeLessThanOrEqual(shown.scrollbar + 0.5);
      }
    }
    await context.close();
  }
});

test('from xl the photo fills two thirds beside the copy; below xl it follows the copy', async ({
  page,
}) => {
  for (const width of WIDTHS) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
      `${width}px: no sideways scroll`,
    ).toBeLessThanOrEqual(0);
    const heights: number[] = [];
    for (const filter of workFilters) {
      await choose(page, filter.label);
      const { stage, card, copy, photo, number } = await layout(page);
      const name = `${width}px ${filter.label}`;
      heights.push(stage.height);
      // As in Hub2B's slider, every card fills the panels, which are as tall as the tallest.
      expect(card.height, `${name}: card fills the panels`).toBeCloseTo(stage.height, 1);
      expect(photo.width / photo.height, `${name}: photo 3:2`).toBeCloseTo(1.5, 2);
      expect(
        card.x + card.width - (photo.x + photo.width),
        `${name}: photo flush right`,
      ).toBeCloseTo(0, 1);
      expect(number.y, `${name}: number under the photo`).toBeGreaterThanOrEqual(
        photo.y + photo.height - 0.5,
      );
      expect(
        card.x + card.width - (number.x + number.width),
        `${name}: number at the right`,
      ).toBeCloseTo(0, 1);
      if (width >= 1280) {
        expect(copy.x, `${name}: copy at the left`).toBeCloseTo(card.x, 1);
        expect(copy.width / card.width, `${name}: copy a third`).toBeCloseTo(1 / 3, 2);
        expect(photo.y, `${name}: photo flush top`).toBeCloseTo(card.y, 1);
        expect(photo.width / card.width, `${name}: photo two thirds`).toBeCloseTo(2 / 3, 2);
      } else {
        expect(copy.y + copy.height, `${name}: copy first`).toBeLessThanOrEqual(photo.y + 0.5);
        expect(photo.x, `${name}: photo full width`).toBeCloseTo(card.x, 1);
        expect(photo.width, `${name}: photo full width`).toBeCloseTo(card.width, 1);
      }
    }
    expect(new Set(heights.map(Math.round)).size, `${width}px: switching keeps the height`).toBe(1);
  }
});

/** A card's props at rest: decorative, peeking 45% above and 40% below it, and under it. */
async function expectPropsAtRest(page: Page, project: FeaturedProject, name: string) {
  const card = cardOf(page, project);
  // The card's top at 35% of the viewport, so the prop rising above it is on screen too.
  await card.evaluate((el) =>
    window.scrollTo({
      top: el.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.35,
      behavior: 'instant',
    }),
  );
  const { card: box, top, bottom } = await propsOf(card);
  expect([top.alt, bottom.alt], `${name}: decorative`).toEqual(['', '']);
  // The props stay out of the accessibility tree; the cover photo is the card's only image.
  await expect(card.getByRole('img')).toHaveCount(1);
  expect((box.y - top.box.y) / top.box.height, `${name}: top peeks`).toBeCloseTo(0.45, 1);
  expect(
    (bottom.box.y + bottom.box.height - (box.y + box.height)) / bottom.box.height,
    `${name}: bottom peeks`,
  ).toBeCloseTo(0.4, 1);
  // Within the card's width, so never past the viewport.
  for (const prop of [top, bottom]) {
    expect(prop.box.x, `${name}: inside the card`).toBeGreaterThanOrEqual(box.x);
    expect(prop.box.x + prop.box.width, `${name}: inside the card`).toBeLessThanOrEqual(
      box.x + box.width,
    );
  }
  // Under the card: where the top prop and the card overlap, the card is on top.
  const covered = await card.evaluate((article, prop) => {
    const hit = document.elementFromPoint(prop.x + prop.width / 2, prop.y + prop.height * 0.9);
    return !!hit && article.contains(hit);
  }, top.box);
  expect(covered, `${name}: the card covers the top prop's lower part`).toBe(true);
}

test.describe('at rest', () => {
  // Reduced motion leaves the props where they rest, so their geometry reads without waiting.
  test.use({ reducedMotion: 'reduce' });

  test('each card has two decorative props under it that peek past its edges', async ({ page }) => {
    for (const width of [390, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      for (const filter of workFilters) {
        await choose(page, filter.label);
        for (const { project } of projectsFor(filter.service)) {
          await expectPropsAtRest(page, project, `${width}px ${project.name}`);
        }
      }
    }
  });
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false, reducedMotion: 'no-preference' });

  test('the filters still switch projects, and the props simply rest', async ({ page }) => {
    await page.goto('/');
    for (const filter of workFilters) {
      await choose(page, filter.label);
      for (const { project } of projectsFor(filter.service)) {
        const card = cardOf(page, project);
        await expect(card).toBeVisible();
        await expect(card.getByRole('link')).toHaveAttribute('href', project.link.href);
        const props = await propsOf(card);
        expect(props.state, project.name).toBe('');
        expect(translateY(props.top.translate), `${project.name}: top prop out`).toBeCloseTo(
          -45,
          1,
        );
        expect(translateY(props.bottom.translate), `${project.name}: bottom prop out`).toBeCloseTo(
          40,
          1,
        );
        expect(props.running, `${project.name}: nothing moves`).toBe(0);
      }
    }
  });
});

test.describe('motion allowed', () => {
  test.use({ reducedMotion: 'no-preference' });

  test('props pop out once as the section scrolls in, and again for each filter', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      const shifts: number[] = [];
      Object.assign(window, { shifts });
      if (PerformanceObserver.supportedEntryTypes.includes('layout-shift')) {
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries())
            shifts.push((entry as unknown as { value: number }).value);
        }).observe({ type: 'layout-shift', buffered: true });
      }
    });
    await page.goto('/');
    const [first, second] = workFilters;
    const firstCard = cardOf(page, projectsFor(first.service)[0].project);

    // Below the fold at load: tucked behind the card, waiting.
    let props = await propsOf(firstCard);
    expect(props.state).toBe('hidden');
    expect([translateY(props.top.translate), translateY(props.bottom.translate)]).toEqual([0, 0]);
    const before = await layout(page);
    const shiftsBefore = await page.evaluate(
      () => (window as unknown as { shifts: number[] }).shifts.length,
    );

    await scrollToMiddle(panels(page));
    await expect.poll(async () => (await propsOf(firstCard)).state).toBe('shown');
    // Out over 1s with `ease`, the reference's motion, once the photo and props have loaded.
    props = await propsOf(firstCard);
    expect(props.transition).toBe('translate 1s ease');
    await expect.poll(async () => translateY((await propsOf(firstCard)).top.translate)).toBe(-45);
    await expect.poll(async () => translateY((await propsOf(firstCard)).bottom.translate)).toBe(40);
    expect(
      await firstCard.evaluate((article) =>
        Array.from(article.parentElement!.querySelectorAll('img')).every(
          (img) => img.complete && img.naturalWidth > 0,
        ),
      ),
      'photo and props loaded',
    ).toBe(true);

    expectSameLayout(await layout(page), before, 'no card or part moved or resized');
    expect(
      await page.evaluate(
        (from) => (window as unknown as { shifts: number[] }).shifts.slice(from),
        shiftsBefore,
      ),
      'no layout shift during the reveal',
    ).toEqual([]);

    // Choosing another platform pops its props out from behind its card.
    await choose(page, second.label);
    const secondCard = cardOf(page, projectsFor(second.service)[0].project);
    await expect.poll(async () => (await propsOf(secondCard)).running).toBeGreaterThan(0);
    await expect.poll(async () => translateY((await propsOf(secondCard)).top.translate)).toBe(-45);
    await expect.poll(async () => (await propsOf(secondCard)).running).toBe(0);
    expectSameLayout(
      { stage: (await layout(page)).stage },
      { stage: before.stage },
      'the panels keep their box',
    );

    // Once: scrolling away and back does not tuck them in again.
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await scrollToMiddle(panels(page));
    props = await propsOf(secondCard);
    expect(props.state).toBe('shown');
    expect(translateY(props.top.translate)).toBe(-45);
  });

  test('props already on screen at load never move, even as the stylesheet arrives', async ({
    page,
  }) => {
    // Count every transition the props start, from the first frame: WebKit can style the page
    // before the stylesheet applies, and a transition then would slide them in on load.
    await page.addInitScript(() => {
      const moves: string[] = [];
      Object.assign(window, { propMoves: moves });
      document.addEventListener(
        'transitionrun',
        (event) => {
          const target = event.target as Element;
          if (target.matches('[data-filter-panels] picture img')) moves.push(event.propertyName);
        },
        true,
      );
    });
    // Tall enough to show the whole page at once, so the panels are on screen when the script runs.
    await page.setViewportSize({ width: 1280, height: 9000 });
    await page.goto('/');
    const card = cardOf(page, projectsFor(workFilters[0].service)[0].project);
    // It turns `shown` once the page has loaded, without moving, so a filter can animate later.
    await expect.poll(async () => (await propsOf(card)).state).toBe('shown');
    const props = await propsOf(card);
    expect(translateY(props.top.translate)).toBe(-45);
    expect(props.running).toBe(0);
    expect(
      await page.evaluate(() => (window as unknown as { propMoves: string[] }).propMoves),
      'no prop moved on load',
    ).toEqual([]);
  });
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('the props never tuck in or move, at load, in view, or on a filter change', async ({
    page,
  }) => {
    await page.goto('/');
    for (const filter of workFilters) {
      await choose(page, filter.label);
      const card = cardOf(page, projectsFor(filter.service)[0].project);
      await scrollToMiddle(card);
      const props = await propsOf(card);
      expect(props.state, filter.label).toBe('');
      expect(translateY(props.top.translate), filter.label).toBeCloseTo(-45, 1);
      expect(props.running, `${filter.label}: nothing moves`).toBe(0);
    }
  });
});
