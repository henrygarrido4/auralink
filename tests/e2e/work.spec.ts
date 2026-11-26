import { expect, test, type Locator, type Page } from './fixtures';
import { serviceCardById } from '../../src/data/detail-pages';
import { workCta } from '../../src/data/site';
import {
  featuredWork,
  ownSiteCta,
  ownSiteStatus,
  projectStatus,
  statusOf,
  workPage,
  workProjects,
  type WorkProject,
} from '../../src/data/work';
import { scrollToRest } from './scroll';

/**
 * Selected work (the owner's brief, 2026-11-21). On the home page, FeaturedWork.astro: a
 * white band under an aura of the primary yellow drawn in CSS (`work-aura`, white since
 * 2026-11-22), after the introduction and before the contact banner, with the shared eyebrow, the
 * near-black heading, the primary rule, the sentence, the near-black "View all projects" text
 * link to the work page, and one frosted white card per project (WorkCard.astro): the site's
 * homepage in a browser window, how it is built and that it is a live website, the name, and the
 * service tiles' white arrow box, the whole card one link to the project's section on the work
 * page. Three across from lg, two by two with the introduction in the first cell from sm, stacked
 * below. Under the pointer the screenshot grows a little and the arrow box fills primary, as it
 * does on keyboard focus, and nothing transitions on load.
 *
 * The work page (src/pages/work/index.astro): the shared hero, how to read the projects with an
 * index of them (WorkOverview.astro), one section per project (WorkProject.astro) with the
 * screenshot beside the copy from lg (swapping sides from one project to the next, sticky while
 * the copy scrolls) and above it below, the number, the platform and status, the name as the h2,
 * the kind of business, the lead, "The challenge", "The solution", and the services as links to
 * their pages, then the outlined secondary button to the site in a new tab; then the invitation
 * and the contact banner. The studio's own website (2026-11-26) comes last, on the work page
 * only: labelled "Our own website", its solution a list of choices, and its button an invitation
 * to a call in the same tab. The JSON-LD lists the projects. No
 * script or island ships, so the page is complete without JavaScript.
 */
const HOME_HEADING = 'Websites for local businesses.';
const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
/**
 * The site button's name: the visible label, then the hidden words naming the project and the
 * new tab. Chromium puts a space before the hidden words (their box is absolutely positioned), so
 * one is allowed before the comma.
 */
const siteLinkName = (project: WorkProject) =>
  new RegExp(`^${escape(project.link.label)}\\s?, ${escape(project.name)}, opens in a new tab$`);

const homeSection = (page: Page) => page.getByRole('region', { name: HOME_HEADING });
const cards = (page: Page) => homeSection(page).getByRole('list').locator(':scope > li');
const projectSection = (page: Page, project: WorkProject) =>
  page.getByRole('region', { name: project.name, exact: true });

/** A CSS colour as the browser computes it, for comparing a band to a theme token. */
const resolve = (page: Page, value: string) =>
  page.evaluate((colour) => {
    const probe = document.createElement('i');
    probe.style.backgroundColor = colour;
    document.body.append(probe);
    const computed = getComputedStyle(probe).backgroundColor;
    probe.remove();
    return computed;
  }, value);

const box = async (locator: Locator) => (await locator.boundingBox())!;

test('the home page shows three project cards after the introduction, on the white aura band', async ({
  page,
}) => {
  await page.goto('/');
  const order = await page.evaluate(() =>
    [...document.querySelectorAll('main > section')].map((section) => section.id),
  );
  expect(order.slice(-3)).toEqual(['about', 'work', 'project-contact']);

  const section = homeSection(page);
  // White, like the introduction above (the owner, 2026-11-22), under three soft radial glows of
  // the primary yellow drawn in CSS: no image file is fetched.
  await expect(section).toHaveCSS('background-color', await resolve(page, 'var(--color-base-100)'));
  const glows = await section.evaluate((el) => getComputedStyle(el).backgroundImage);
  expect(glows.match(/radial-gradient\(/g)?.length, 'three glows').toBe(3);
  expect(glows, 'no image file').not.toContain('url(');
  await expect(section.getByText('Selected work', { exact: true })).toBeVisible();
  await expect(section.getByRole('heading', { level: 2 })).toHaveText(HOME_HEADING);

  // A plain near-black text link to the work page (the yellow is too light to read on white): no
  // button classes, no border light, at least 44px tall, and underlined under the pointer.
  const all = section.getByRole('link', { name: workCta.label });
  await expect(all).toHaveAttribute('href', workCta.href!);
  await expect(all).not.toHaveClass(/\bbtn\b/);
  await expect(section.locator('.aura, .btn')).toHaveCount(0);
  await expect(all).toHaveCSS('color', await resolve(page, 'var(--color-base-content)'));
  expect((await box(all)).height, 'a 44px target').toBeGreaterThanOrEqual(44);
  await expect(all).toHaveCSS('text-decoration-line', 'none');
  if (await page.evaluate(() => matchMedia('(hover: hover)').matches)) {
    await all.hover();
    await expect(all).toHaveCSS('text-decoration-line', 'underline');
    await page.mouse.move(0, 0);
  }

  await expect(cards(page)).toHaveCount(featuredWork.length);
  expect(featuredWork.length).toBe(3);
  const white = await resolve(page, 'var(--color-base-100)');
  const ink = await resolve(page, 'var(--color-primary-content)');
  for (const [index, project] of featuredWork.entries()) {
    const card = cards(page).nth(index);
    const link = card.getByRole('link');
    await expect(link).toHaveCount(1);
    await expect(link).toHaveAttribute('href', `/work/#${project.id}`);
    // Named by its visible text, in order: how it is built, that it is a live website, and the
    // name; the arrow is the action, and the browser bar is decorative and adds nothing.
    await expect(link).toHaveAccessibleName(`${project.platform} ${projectStatus} ${project.name}`);
    await expect(card.getByRole('heading', { level: 3 })).toHaveText(project.name);
    // Frosted white, so the band's aura tints it (engines write the 70% alpha as `/ 0.7` in
    // oklab or `, 0.7` in rgba). The arrow box is the service tiles' (the owner, 2026-11-22):
    // white at rest, lifted off the card by a shadow, with the near-black arrow.
    await expect(link).toHaveCSS('background-color', /[/,] ?0\.7\)$/);
    const arrowBox = card.locator('.arrow-box');
    await expect(arrowBox).toHaveCSS('background-color', white);
    await expect(arrowBox).toHaveCSS('color', ink);
    await expect(arrowBox).not.toHaveCSS('box-shadow', 'none');
    // The screenshot is decorative here: the card's text describes the project, and the work
    // page carries the description. Lazy: the band is far below the first screen.
    const screenshot = card.locator('img');
    await expect(screenshot).toHaveCount(1);
    await expect(screenshot).toHaveAttribute('alt', '');
    await expect(screenshot).toHaveAttribute('loading', 'lazy');
    await expect(card.getByRole('img')).toHaveCount(0);
    // The browser bar shows the site's address and is hidden from assistive technology.
    const bar = card.locator('[aria-hidden="true"]').first();
    await expect(bar).toContainText(new URL(project.link.href).hostname);
    await expect(card.locator('[data-arrow-track] svg')).toHaveCount(2);
  }
});

test('three cards share a row from lg, the introduction takes the first of four cells from sm, and all stack below', async ({
  page,
}) => {
  await page.goto('/');
  const heading = homeSection(page).getByRole('heading', { level: 2 });
  const tops = async () => {
    const rows: number[] = [];
    for (let i = 0; i < featuredWork.length; i += 1) rows.push((await box(cards(page).nth(i))).y);
    return rows;
  };

  await page.setViewportSize({ width: 1440, height: 900 });
  let rows = await tops();
  expect(new Set(rows.map(Math.round)).size, '1440: one row of three').toBe(1);
  expect((await box(heading)).y, '1440: the introduction is above the cards').toBeLessThan(rows[0]);

  await page.setViewportSize({ width: 768, height: 1024 });
  rows = await tops();
  const headingBox = await box(heading);
  const first = await box(cards(page).first());
  expect(first.x, '768: the first card is right of the introduction').toBeGreaterThan(
    headingBox.x + headingBox.width,
  );
  expect(Math.round(rows[1]), '768: the other two share the second row').toBe(Math.round(rows[2]));
  expect(rows[1], '768: the second row is below the first').toBeGreaterThan(rows[0]);

  await page.setViewportSize({ width: 390, height: 844 });
  rows = await tops();
  expect(new Set(rows.map(Math.round)).size, '390: stacked').toBe(featuredWork.length);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    ),
    '390: no sideways scroll',
  ).toBeLessThanOrEqual(1);
});

test('nothing in the selected work section transitions on load', async ({ page }) => {
  await page.addInitScript(() => {
    const runs: string[] = [];
    Object.assign(window, { workRuns: runs });
    document.addEventListener(
      'transitionrun',
      (event) => {
        if ((event.target as Element).closest?.('#work')) runs.push(event.propertyName);
      },
      true,
    );
  });
  // Tall enough to have the section on screen from the first frame. The pointer and keyboard
  // checks have a page of their own: in a phone profile, three device pixels to the CSS pixel,
  // this window is a 3840 by 27000 pixel surface, and after it shrank WebKit on Linux drew no
  // new frame for seconds, so the arrow box's 0.3s fill outlasted the poll (CI, 2026-11-22).
  await page.setViewportSize({ width: 1280, height: 9000 });
  await page.goto('/');
  await page.evaluate(
    () => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))),
  );
  expect(
    await page.evaluate(() => (window as unknown as { workRuns: string[] }).workRuns),
    'no transition on load',
  ).toEqual([]);
});

test('a card grows its screenshot and fills its arrow box under the pointer, and fills the box and shows a ring on focus', async ({
  page,
  browserName,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');
  const card = cards(page).first().getByRole('link');
  const screenshot = card.locator('img');
  const scale = () => screenshot.evaluate((img) => getComputedStyle(img).scale);
  // The arrow box rests white and fills primary under the pointer and on keyboard focus, as the
  // service tiles' boxes do (the owner, 2026-11-22).
  const fill = () =>
    card.locator('.arrow-box').evaluate((box) => getComputedStyle(box).backgroundColor);
  const white = await resolve(page, 'var(--color-base-100)');
  const primary = await resolve(page, 'var(--color-primary)');
  await expect(screenshot).toHaveCSS('scale', 'none');
  expect(await fill(), 'the arrow box rests white').toBe(white);
  // In view and still before the pointer or the keyboard acts (scroll.ts). The fills below need
  // frames, and in a phone profile WebKit on Linux drew them seconds apart while the hero's load
  // animations were on screen (a container throttled like CI, 2026-11-22).
  await scrollToRest(card);
  if (await page.evaluate(() => matchMedia('(hover: hover)').matches)) {
    await card.hover();
    await expect.poll(scale).toBe('1.03');
    await expect.poll(fill, 'the arrow box fills under the pointer').toBe(primary);
    await page.mouse.move(0, 0);
    await expect.poll(scale).toBe('none');
    await expect.poll(fill, 'the arrow box is white again once the pointer leaves').toBe(white);
  }

  // From the "View all projects" link, Tab reaches the first card, which wears the ring.
  await homeSection(page).getByRole('link', { name: workCta.label }).focus();
  await page.keyboard.press(browserName === 'webkit' ? 'Alt+Tab' : 'Tab');
  await expect(card).toBeFocused();
  const ring = await card.evaluate((el) => {
    const style = getComputedStyle(el);
    return [el.matches(':focus-visible'), style.outlineStyle, style.outlineWidth];
  });
  expect(ring).toEqual([true, 'solid', '2px']);
  await expect.poll(fill, 'keyboard focus fills the arrow box').toBe(primary);
});

test('the work page opens with the hero and runs the overview, the four projects, the invitation, and the banner', async ({
  page,
}) => {
  await page.goto('/work/');
  const order = await page.evaluate(() =>
    [...document.querySelectorAll('main > section')].map((section) => section.id),
  );
  expect(order).toEqual([
    '',
    'overview',
    ...workProjects.map((project) => project.id),
    'next-step',
    'project-contact',
  ]);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(workPage.title);
  await expect(page.getByText(workPage.description, { exact: true })).toBeVisible();
  // Work is in the navbar and marked as the current page, in both copies of the primary nav (the
  // bar's, and the menu's, which is in a closed dialog below lg).
  await expect(page.locator('nav[aria-label="Primary"] a[aria-current="page"]')).toHaveText([
    'Work',
    'Work',
  ]);
  await expect(page.getByRole('heading', { name: workPage.invitation.heading })).toBeVisible();
  await expect(page.locator('main script, main astro-island')).toHaveCount(0);
});

test('the overview explains the three parts and indexes the projects, each a link to its section', async ({
  page,
}) => {
  await page.goto('/work/');
  const overview = page.getByRole('region', { name: workPage.overview.heading });
  await expect(overview.getByRole('heading', { level: 3 })).toHaveText(
    workPage.overview.legend.map((part) => part.title),
  );
  for (const part of workPage.overview.legend) {
    await expect(overview.getByText(part.text, { exact: true })).toBeVisible();
  }
  const index = overview.getByRole('navigation', { name: 'Projects on this page' });
  const links = index.getByRole('link');
  await expect(links).toHaveCount(workProjects.length);
  for (const [position, project] of workProjects.entries()) {
    const link = links.nth(position);
    await expect(link).toHaveAttribute('href', `#${project.id}`);
    await expect(link).toContainText(project.name);
    await expect(link).toContainText(`${project.platform} · ${project.industry}`);
  }
  // The index works: the second link lands the second project's section under the sticky navbar
  // (`scroll-padding-top` is the bar's 5rem; once scrolled the bar is 4rem, and Chromium's scroll
  // anchoring may keep the content where it was, so the top settles between 4rem and 5rem). On a
  // phone the screenshot comes first, so the heading itself may be below the fold. The link is
  // still before the click: a click during the navbar's collapse left the section where it was.
  await scrollToRest(links.nth(1));
  await links.nth(1).click();
  await expect(page).toHaveURL(new RegExp(`#${workProjects[1].id}$`));
  const target = projectSection(page, workProjects[1]);
  await expect
    .poll(async () => (await box(target)).y, { message: 'the section scrolls to the top' })
    .toBeLessThanOrEqual(81);
  const [top, navbar] = [(await box(target)).y, await box(page.locator('header'))];
  expect(top, 'not under the navbar').toBeGreaterThanOrEqual(navbar.y + navbar.height - 1);
});

test('each project tells the challenge, the solution, and the services, and ends with its button', async ({
  page,
}) => {
  await page.goto('/work/');
  for (const [position, project] of workProjects.entries()) {
    await test.step(project.name, async () => {
      const section = projectSection(page, project);
      await expect(section.getByRole('heading', { level: 2 })).toHaveText(project.name);
      // The number is decorative: the index and the name already place the project.
      const number = section.getByText(`${String(position + 1).padStart(2, '0')}.`, {
        exact: true,
      });
      await expect(number).toHaveAttribute('aria-hidden', 'true');
      await expect(section.getByText(project.platform, { exact: true })).toBeVisible();
      await expect(section.getByText(statusOf(project), { exact: true })).toBeVisible();
      const where = project.location
        ? `${project.industry} · ${project.location}`
        : project.industry;
      await expect(section.getByText(where, { exact: true })).toBeVisible();
      for (const text of [project.description, project.challenge]) {
        await expect(section.getByText(text, { exact: true })).toBeVisible();
      }
      await expect(section.getByRole('heading', { level: 3 })).toHaveText([
        'The challenge',
        'The solution',
        'What we manage',
      ]);
      // The solution is a paragraph, or a list of choices: each a bold title and a colon, then the
      // rest of the sentence, after a decorative check mark.
      if (typeof project.solution === 'string') {
        await expect(section.getByText(project.solution, { exact: true })).toBeVisible();
      } else {
        const choices = section
          .getByRole('heading', { name: 'The solution', level: 3 })
          .locator('xpath=..')
          .getByRole('list')
          .getByRole('listitem');
        await expect(choices).toHaveText(
          project.solution.map((choice) => `${choice.title}: ${choice.text}`),
        );
        await expect(choices.locator('strong')).toHaveText(
          project.solution.map((choice) => `${choice.title}:`),
        );
        for (const mark of await choices.locator('svg').all()) {
          await expect(mark).toHaveAttribute('aria-hidden', 'true');
        }
      }

      // One link per service, to its own page, named by the card's title.
      for (const id of project.services) {
        const card = serviceCardById(id);
        const link = section.getByRole('link', { name: card.title, exact: true });
        await expect(link).toHaveAttribute('href', card.href!);
      }

      // Three things a visitor can see on the site, each with a decorative icon.
      const features = section.getByRole('list').first().getByRole('listitem');
      await expect(features).toHaveText(project.features.map((feature) => feature.text));
      for (const icon of await features.locator('svg').all()) {
        await expect(icon).toHaveAttribute('aria-hidden', 'true');
      }

      // The screenshot: described, lazy, and 4:3 as reserved and as shown.
      const screenshot = section.getByRole('img');
      await expect(screenshot).toHaveCount(1);
      await expect(screenshot).toHaveAttribute('alt', project.screenshotAlt);
      await expect(screenshot).toHaveAttribute('loading', 'lazy');
      const shape = await screenshot.evaluate((img: HTMLImageElement) => {
        const rect = img.getBoundingClientRect();
        return {
          reserved: Number(img.getAttribute('width')) / Number(img.getAttribute('height')),
          shown: rect.width / rect.height,
        };
      });
      expect(shape.reserved).toBeCloseTo(4 / 3, 2);
      expect(shape.shown).toBeCloseTo(4 / 3, 2);

      // The outlined secondary button, with no transitions and no border light. On a client's
      // project it opens the site in a new tab, named with the project and the new tab. Every
      // listed site opens without a password, so no note describes the button. The studio's own
      // website, which the visitor is already on, ends instead with the entry's last line and the
      // button inviting a call, in this tab.
      await expect(section.locator('.aura')).toHaveCount(0);
      await expect(section.getByText(/password/i)).toHaveCount(0);
      if (project.ownSite) {
        await expect(section.getByText(ownSiteCta.lead, { exact: true })).toBeVisible();
        const call = section.getByRole('link', { name: ownSiteCta.label, exact: true });
        await expect(call).toHaveClass(/\bbtn-outline\b/);
        await expect(call).toHaveClass(/\bbtn-secondary\b/);
        await expect(call).toHaveCSS('transition-property', 'none');
        await expect(call).toHaveAttribute('href', ownSiteCta.href);
        await expect(call).not.toHaveAttribute('target');
        await expect(section.locator('a[target="_blank"]')).toHaveCount(0);
        return;
      }
      const site = section.getByRole('link', { name: siteLinkName(project) });
      await expect(site).toHaveClass(/\bbtn-outline\b/);
      await expect(site).toHaveClass(/\bbtn-secondary\b/);
      await expect(site).toHaveCSS('transition-property', 'none');
      await expect(site).toHaveAttribute('href', project.link.href);
      await expect(site).toHaveAttribute('target', '_blank');
      await expect(site).toHaveAttribute('rel', /\bnoopener\b/);
      await expect(site).not.toHaveAttribute('aria-describedby');
    });
  }
});

test("the studio's own website comes last, on the work page only, and says it is not a client's", async ({
  page,
}) => {
  const own = workProjects.filter((project) => project.ownSite);
  expect(own, 'one own website').toHaveLength(1);
  const [studio] = own;
  expect(workProjects.at(-1), 'after the client projects').toBe(studio);
  expect(featuredWork, 'not a home card').not.toContain(studio);
  expect(studio.description, 'the lead says so first').toMatch(/^This isn't a client project\./);

  await page.goto('/');
  await expect(cards(page)).toHaveCount(featuredWork.length);
  await expect(cards(page).getByRole('heading', { name: studio.name })).toHaveCount(0);

  // On the work page its label is its own, and no client project wears that label.
  await page.goto('/work/');
  const section = projectSection(page, studio);
  await expect(section.getByText(ownSiteStatus, { exact: true })).toBeVisible();
  await expect(section.getByText(projectStatus, { exact: true })).toHaveCount(0);
  for (const project of featuredWork) {
    await expect(
      projectSection(page, project).getByText(ownSiteStatus, { exact: true }),
    ).toHaveCount(0);
  }
});

test('the screenshot sits beside the copy from lg, swapping sides, sticks while the copy scrolls, and comes first below', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/work/');
  for (const [position, project] of workProjects.entries()) {
    const section = projectSection(page, project);
    const screenshot = await box(section.getByRole('img'));
    const heading = await box(section.getByRole('heading', { level: 2 }));
    if (position % 2 === 0) {
      expect(screenshot.x + screenshot.width, `${project.name}: screenshot left`).toBeLessThan(
        heading.x,
      );
    } else {
      expect(screenshot.x, `${project.name}: screenshot right`).toBeGreaterThan(
        heading.x + heading.width,
      );
    }
    // The screenshot's column sticks 7rem under the top, clear of the navbar, as the copy scrolls.
    const column = section
      .getByRole('img')
      .locator('xpath=ancestor::*[contains(@class, "sticky")]');
    await expect(column).toHaveCSS('position', 'sticky');
    await expect(column).toHaveCSS('top', '112px');
  }
  // Scrolled 200px into the first project, its screenshot has stopped 7rem under the top while the
  // copy went on: the column's own place is above that line, and the copy still reaches below it.
  const first = projectSection(page, workProjects[0]);
  await page.evaluate((id) => {
    const section = document.getElementById(id)!;
    window.scrollTo({
      top: section.getBoundingClientRect().top + scrollY + 200,
      behavior: 'instant',
    });
  }, workProjects[0].id);
  await page.evaluate(
    () => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))),
  );
  const stuck = await box(first.locator('[class*="sticky"]').first());
  expect(stuck.y, 'stuck 7rem under the top').toBeCloseTo(112, 0);

  await page.setViewportSize({ width: 768, height: 1024 });
  for (const project of workProjects) {
    const section = projectSection(page, project);
    const screenshot = await box(section.getByRole('img'));
    const heading = await box(section.getByRole('heading', { level: 2 }));
    expect(screenshot.y + screenshot.height, `${project.name}: screenshot first`).toBeLessThan(
      heading.y,
    );
  }
});

test('the JSON-LD describes the page, the trail, and one item per project', async ({ page }) => {
  await page.goto('/work/');
  const graph = await page
    .locator('script[type="application/ld+json"]')
    .first()
    .evaluate((script) => JSON.parse(script.textContent ?? '')['@graph']);
  expect(graph.map((node: { '@type': string }) => node['@type'])).toEqual([
    'CollectionPage',
    'BreadcrumbList',
    'ItemList',
  ]);
  expect(graph[1].itemListElement.map((item: { name: string }) => item.name)).toEqual([
    'Home',
    'Work',
  ]);
  const items = graph[2].itemListElement as { item: { name: string; url: string } }[];
  expect(items.map((entry) => entry.item.name)).toEqual(workProjects.map((p) => p.name));
  expect(items.map((entry) => entry.item.url)).toEqual(workProjects.map((p) => p.link.href));
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('the work page is complete and every project ends with its link', async ({ page }) => {
    await page.goto('/work/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(workPage.title);
    for (const project of workProjects) {
      const section = projectSection(page, project);
      await expect(section.getByRole('heading', { level: 2 })).toBeVisible();
      const [link, href] = project.ownSite
        ? [section.getByRole('link', { name: ownSiteCta.label, exact: true }), ownSiteCta.href]
        : [section.getByRole('link', { name: siteLinkName(project) }), project.link.href];
      await expect(link).toHaveAttribute('href', href);
    }
  });
});
