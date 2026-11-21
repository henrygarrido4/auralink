import { expect, test, type Page } from './fixtures';
import { serviceCards, services, servicesCta, whyPillars } from '../../src/data/site';

/**
 * About page (src/pages/about/index.astro), laid out after uprig.net/about, the owner's reference
 * (2026-11-20), in this site's own system. The hero keeps its headline and shows the owner's
 * description (2026-11-21). After that hero: the founder beside
 * the owner's portrait (AboutStory.astro), how it works as the three `whyPillars` on numbered
 * cards on the dark band (AboutPrinciples.astro), what it does as the service catalogue's three
 * cards on white cards (website development and search visibility linking to each catalogue
 * service's page, digital advertising listing its own services as plain text) and the hub's
 * "View all services" (AboutServices.astro), then the shared contact banner. The portrait is lazy, sized, and
 * described; its panel and bar are decorative. From lg the portrait sits right of the copy and
 * the pillar and service cards share a row; below lg everything stacks. Nothing in these sections
 * animates, and the page ships no island.
 */
const STORY_HEADING = 'Good businesses deserve to look the part online.';
const STORY_LEAD =
  "I'm the developer and founder behind Auralink Studio. My journey into tech wasn't traditional. Before becoming a developer, I worked as a truck driver, where I learned the value of hard work, consistency, and doing things right.";
const STORY_PARAGRAPHS = [
  'Today, I specialize in web development and digital marketing, with professional experience working alongside designers, marketers, and engineers to build digital experiences that connect businesses with their customers.',
  'I started Auralink Studio to bring that same level of care and attention to businesses of all sizes. I know how much work goes into building something of your own, and I believe your website should reflect that effort.',
  "Whether you're starting from scratch or improving what you've already built, my goal is to understand your business, create something you're proud of, and help you build a stronger presence online.",
];
const PRINCIPLES_HEADING = 'Why Auralink Studio?';
const PRINCIPLES_LEAD =
  'Thoughtful websites. Built for performance. A partner invested in your business.';
const SERVICES_HEADING = 'Websites built to help your business grow.';
const GROUPS = ['Website development', 'Digital advertising', 'Search visibility'];
/** The digital advertising card's own services, shown as plain text while they have no page. */
const ADVERTISING = ['Google Ads management', 'Meta (Facebook & Instagram) advertising'];

const story = (page: Page) => page.getByRole('region', { name: STORY_HEADING });
const principles = (page: Page) => page.getByRole('region', { name: PRINCIPLES_HEADING });
const offer = (page: Page) => page.getByRole('region', { name: SERVICES_HEADING });
const portrait = (page: Page) => story(page).getByRole('img');
/** A section's cards: the items of its first list, not the checklists or links inside them. */
const cards = (section: ReturnType<typeof story>) =>
  section.getByRole('list').first().locator(':scope > li');

/** The page that presents a catalogue service: the home card that lists it. */
const destination = (slug: string) =>
  serviceCards.find((card) => (card.services as readonly string[]).includes(slug))?.href;

test('opens with the hero, then who, how, and what, before the contact banner', async ({
  page,
}) => {
  await page.goto('/about/');
  const order = await page.evaluate(() =>
    [...document.querySelectorAll('main > section')].map((section) => section.id),
  );
  expect(order).toEqual(['', 'story', 'how-we-work', 'what-we-do', 'project-contact']);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'A digital presence built around your goals.',
  );
  await expect(
    page.getByText(
      'At Auralink Studio, you work directly with the person designing and building your website. We start by learning what you want more of from your site and what your customers need to know before they choose you.',
      { exact: true },
    ),
  ).toBeVisible();
  await expect(page.locator('main script, astro-island'), 'no island or script').toHaveCount(0);
});

test('introduces the founder beside the described, lazy portrait', async ({ page }) => {
  await page.goto('/about/');
  await expect(story(page).getByText('Meet the founder', { exact: true })).toBeVisible();
  await expect(story(page).getByRole('heading', { level: 2 })).toHaveText(STORY_HEADING);
  await expect(story(page).getByText(STORY_LEAD, { exact: true })).toBeVisible();
  for (const paragraph of STORY_PARAGRAPHS) {
    await expect(story(page).getByText(paragraph, { exact: true })).toBeVisible();
  }

  const image = portrait(page);
  await expect(image).toHaveCount(1);
  await expect(image).toHaveAttribute(
    'alt',
    'Man with glasses in a black T-shirt standing with his arms crossed, with a lit lamp on a shelf and a plant behind him',
  );
  await expect(image).toHaveAttribute('loading', 'lazy');
  await expect(image).toHaveAttribute('width', /^\d+$/);
  await expect(image).toHaveAttribute('height', /^\d+$/);
  await expect(image).toHaveAttribute('sizes', /100vw/);
  await expect(
    story(page).locator('picture source[type="image/avif"]'),
    'AVIF with the WebP fallback',
  ).toHaveCount(1);

  // The panel behind the photo and the bar under it are decorative, and nothing else is there.
  const decor = await story(page).evaluate((section) => {
    const figure = section.querySelector('img')!.closest('picture')!.parentElement!;
    return {
      hidden: Array.from(figure.children, (child) =>
        child.tagName === 'PICTURE' ? 'picture' : child.getAttribute('aria-hidden'),
      ),
      text: figure.textContent?.trim(),
      controls: figure.querySelectorAll('a, button, input, [tabindex]').length,
    };
  });
  expect(decor.hidden, 'the panel, the picture, then the bar').toEqual(['true', 'picture', 'true']);
  expect(decor.text, 'no words beside the photo').toBe('');
  expect(decor.controls).toBe(0);
});

test('shows how the studio works as the three pillars, numbered, with their checklists', async ({
  page,
}) => {
  await page.goto('/about/');
  const section = principles(page);
  await expect(section.getByText('How we work', { exact: true })).toBeVisible();
  await expect(section.getByRole('heading', { level: 2 })).toHaveText(PRINCIPLES_HEADING);
  await expect(section.getByText(PRINCIPLES_LEAD, { exact: true })).toBeVisible();

  const pillars = cards(section);
  await expect(pillars).toHaveCount(whyPillars.length);
  for (const [index, pillar] of whyPillars.entries()) {
    const card = pillars.nth(index);
    await expect(card.getByText(pillar.category, { exact: true })).toBeVisible();
    await expect(card.getByRole('heading', { level: 3 })).toHaveText(pillar.title.join(' '));
    await expect(card.getByText(pillar.description, { exact: true })).toBeVisible();
    await expect(card.getByRole('listitem')).toHaveText([...pillar.points]);
    const number = card.locator('[aria-hidden="true"]').first();
    await expect(number, 'a decorative number').toHaveText(`0${index + 1}.`);
  }
  await expect(section.getByRole('link'), 'nothing to follow here').toHaveCount(0);
  // The checklist marks say nothing the words do not.
  const marks = section.getByRole('list').first().locator('svg');
  await expect(marks).toHaveCount(whyPillars.flatMap((pillar) => pillar.points).length);
  for (const mark of await marks.all()) {
    await expect(mark).toHaveAttribute('aria-hidden', 'true');
  }
});

test('lists the website and search services as links, advertising as plain text', async ({
  page,
}) => {
  await page.goto('/about/');
  const section = offer(page);
  await expect(section.getByRole('heading', { level: 2 })).toHaveText(SERVICES_HEADING);
  await expect(section.getByRole('heading', { level: 3 })).toHaveText(GROUPS);

  // Website development and search visibility link each catalogue service to the home card's page.
  const linked = services.filter((service) => service.group !== 'email');
  for (const service of linked) {
    const link = section.getByRole('link', { name: service.name, exact: true });
    await expect(link, service.name).toHaveCount(1);
    await expect(link).toHaveAttribute('href', destination(service.slug)!);
  }
  // Email marketing stays an optional add-on on the services hub, not a card here.
  for (const service of services.filter((service) => service.group === 'email')) {
    await expect(
      section.getByText(service.name, { exact: true }),
      `${service.name} omitted`,
    ).toHaveCount(0);
  }
  // Digital advertising lists its own services as plain text, with no destination page yet.
  for (const name of ADVERTISING) {
    await expect(section.getByText(name, { exact: true })).toBeVisible();
    await expect(section.getByRole('link', { name, exact: true })).toHaveCount(0);
  }
  // Every link in the cards is one of those linked services; the hub's own call follows the cards.
  const cardLinks = section.getByRole('list').first().getByRole('link');
  await expect(cardLinks).toHaveCount(linked.length);
  const hub = section.getByRole('link', { name: servicesCta.label, exact: true });
  await expect(hub).toHaveAttribute('href', servicesCta.href!);
  await expect(hub, 'the secondary button').toHaveClass(/\bbtn-secondary\b/);
});

test('the portrait sits beside the copy and the cards share a row from lg, stacked below', async ({
  page,
}) => {
  await page.goto('/about/');
  await page.evaluate(() => document.fonts.ready);
  // One evaluate by id, not `evaluateAll` inside a named region, which crashes Firefox
  // (testing-playwright.mdc).
  const boxes = () =>
    page.evaluate(() => {
      const box = (selector: string) => {
        const rect = document.querySelector(selector)!.getBoundingClientRect();
        return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
      };
      const tops = (selector: string) =>
        Array.from(document.querySelectorAll(selector), (item) => item.getBoundingClientRect().top);
      return {
        copy: box('#story h2'),
        photo: box('#story img'),
        pillars: tops('#how-we-work ol > li'),
        groups: tops('#what-we-do ul > li:has(h3)'),
      };
    });

  await page.setViewportSize({ width: 1440, height: 900 });
  const wide = await boxes();
  expect(wide.photo.x, 'the photo is right of the copy').toBeGreaterThan(
    wide.copy.x + wide.copy.width,
  );
  expect(new Set(wide.pillars).size, 'one row of pillars').toBe(1);
  expect(new Set(wide.groups).size, 'one row of groups').toBe(1);

  await page.setViewportSize({ width: 390, height: 844 });
  const narrow = await boxes();
  expect(narrow.photo.y, 'the photo follows the copy').toBeGreaterThan(narrow.copy.y);
  expect(narrow.photo.x, 'the photo starts on the container edge').toBeCloseTo(narrow.copy.x, 0);
  expect(new Set(narrow.pillars).size, 'stacked pillars').toBe(whyPillars.length);
  expect(new Set(narrow.groups).size, 'stacked groups').toBe(GROUPS.length);
});

test.describe('motion allowed', () => {
  test.use({ reducedMotion: 'no-preference' });

  test('nothing after the hero animates on load', async ({ page }) => {
    await page.goto('/about/');
    for (const section of [story(page), principles(page), offer(page)]) {
      expect(
        await section.evaluate((el) => el.getAnimations({ subtree: true }).length),
        'still',
      ).toBe(0);
    }
  });
});
