import { expect, test, type Locator, type Page } from '@playwright/test';
import { footerIndustries, footerServices } from '../../src/data/footer';

/** The first link of the footer's lists, which all share one style (`footer-link`). */
const listLink = (page: Page) =>
  page
    .getByRole('contentinfo')
    .getByRole('navigation', { name: 'Footer services' })
    .getByRole('link')
    .first();

/**
 * CSS colours as the RGBA bytes a 1x1 canvas paints them in. Bytes, not computed strings, because
 * engines write one colour in different notations: after a fade Firefox gives an `oklch(…)` colour
 * as `color(srgb …)` (tests/e2e/industries.spec.ts). A probe resolves `var()` first, which a
 * canvas cannot.
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

/** The footer's light text and the primary yellow, as painted. */
const linkColours = async (page: Page) => {
  const [rest, primary] = await paint(page, [
    'var(--color-neutral-content)',
    'var(--color-primary)',
  ]);
  return { rest, primary };
};

/** A footer link's colour as painted, its underline, and what it fades and for how long. */
const linkLook = async (page: Page, link: Locator) => {
  const style = await link.evaluate((el) => {
    const computed = getComputedStyle(el);
    return {
      colour: computed.color,
      underline: computed.textDecorationLine,
      fades: computed.transitionProperty,
      over: computed.transitionDuration,
    };
  });
  const [colour] = await paint(page, [style.colour]);
  return { ...style, colour };
};

const canHover = (page: Page) => page.evaluate(() => matchMedia('(hover: hover)').matches);

test('closing contact banner is separate from the site footer', async ({ page }) => {
  await page.goto('/');
  const banner = page.getByRole('region', { name: 'Have a project in mind?' });
  await expect(page.getByRole('main').locator('#project-contact')).toHaveCount(1);
  await expect(banner.getByRole('link', { name: "Let's talk" })).toHaveAttribute(
    'href',
    '/contact/',
  );
  const footer = page.getByRole('contentinfo');
  await expect(footer.locator('#project-contact')).toHaveCount(0);
  // The nine cards of the services page (the six home cards and the three that page adds) and
  // the sixteen industries, each a link because each has a page of its own.
  expect(footerServices).toHaveLength(9);
  expect(footerIndustries).toHaveLength(16);
  await expect(
    footer.getByRole('navigation', { name: 'Footer services' }).getByRole('link'),
  ).toHaveCount(footerServices.length);
  await expect(
    footer.getByRole('navigation', { name: 'Footer industries' }).getByRole('link'),
  ).toHaveCount(footerIndustries.length);
  await expect(
    footer
      .getByRole('navigation', { name: 'Footer company' })
      .getByRole('link', { name: 'Blog', exact: true }),
  ).toHaveCount(0);
  await banner.screenshot({
    path: `reports/screenshots/contact-banner-${test.info().project.name}.png`,
  });
  await footer.screenshot({ path: `reports/screenshots/footer-${test.info().project.name}.png` });
});

test('every footer service and industry link leads to its own detail page', async ({ page }) => {
  // Each destination is a built page whose hero names it: the eyebrow is the page's name in
  // navigation, which is the footer label. The Company column keeps the hubs themselves.
  const links = [...footerServices, ...footerIndustries];
  test.setTimeout(links.length * 2_000);
  for (const link of links) {
    await test.step(link.label, async () => {
      expect(link.href, `${link.label} has a destination`).toMatch(
        /^\/(services|industries)\/[a-z0-9-]+\/$/,
      );
      const response = await page.goto(link.href!);
      expect(response?.status()).toBe(200);
      const hero = page.locator('[aria-labelledby="page-title"]');
      await expect(hero.locator('h1').locator('xpath=preceding-sibling::p[1]')).toHaveText(
        link.label,
      );
    });
  }
});

test('an industry footer link lands on that industry page', async ({ page }) => {
  await page.goto('/');
  await page
    .getByRole('navigation', { name: 'Footer industries' })
    .getByRole('link', { name: 'Dental', exact: true })
    .click();
  await expect(page).toHaveURL(/\/industries\/dental\/$/);
  await expect(page.getByRole('navigation', { name: 'Breadcrumb' })).toContainText('Dental');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('nothing in the footer fades in on load, even as the stylesheet arrives', async ({ page }) => {
  // WebKit can style the page before the stylesheet applies. A plain colour transition then faded
  // every list link in from the browser's link blue, 2.1:1 on the footer, and the accessibility
  // scan caught the labels on the way (`footer-link` in src/styles/global.css).
  await page.addInitScript(() => {
    const runs: string[] = [];
    Object.assign(window, { footerRuns: runs });
    document.addEventListener(
      'transitionrun',
      (event) => {
        if ((event.target as Element).closest('footer')) runs.push(event.propertyName);
      },
      true,
    );
  });
  await page.goto('/');
  await page.evaluate(
    () => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))),
  );
  const runs = await page.evaluate(
    () => (window as unknown as { footerRuns: string[] }).footerRuns,
  );
  expect(runs, 'no transition on load').toEqual([]);
});

test('a footer link fades to primary under the pointer and back, through its registered ink only', async ({
  page,
}) => {
  await page.goto('/');
  const link = listLink(page);
  const { rest, primary } = await linkColours(page);
  // The fade never lists `color` itself, which is what faded in on load in WebKit.
  expect(await linkLook(page, link)).toEqual({
    colour: rest,
    underline: 'none',
    fades: '--footer-link-ink',
    over: '0.2s',
  });
  test.skip(!(await canHover(page)), 'Touch screens have no hover; the links keep their colour.');
  await link.evaluate((el) => {
    const fades: { property: string; seconds: number }[] = [];
    Object.assign(window, { footerFades: fades });
    el.addEventListener('transitionend', (event) => {
      const { propertyName, elapsedTime } = event as TransitionEvent;
      fades.push({ property: propertyName, seconds: elapsedTime });
    });
  });
  const fades = () =>
    page.evaluate(
      () =>
        (window as unknown as { footerFades: { property: string; seconds: number }[] }).footerFades,
    );
  await link.hover();
  await expect.poll(fades, { message: 'the fade in finishes' }).toHaveLength(1);
  expect(await linkLook(page, link)).toMatchObject({ colour: primary, underline: 'underline' });
  await page.mouse.move(0, 0);
  await expect.poll(fades, { message: 'the fade out finishes' }).toHaveLength(2);
  expect(await linkLook(page, link)).toMatchObject({ colour: rest, underline: 'none' });
  for (const fade of await fades()) {
    expect(fade.property).toBe('--footer-link-ink');
    // To the millisecond: Firefox reports elapsed times a hair off the round figure.
    expect(fade.seconds).toBeCloseTo(0.2, 3);
  }
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('a footer link changes colour at once, without fading', async ({ page }) => {
    await page.goto('/');
    const link = listLink(page);
    await expect(link).toHaveCSS('transition-duration', '0s');
    if (await canHover(page)) {
      const { primary } = await linkColours(page);
      await link.hover();
      expect((await linkLook(page, link)).colour).toEqual(primary);
    }
  });
});

test('the contact page has no closing banner', async ({ page }) => {
  await page.goto('/contact/');
  await expect(page.locator('#project-contact')).toHaveCount(0);
});
