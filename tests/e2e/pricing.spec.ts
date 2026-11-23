import { expect, test, type Locator, type Page } from './fixtures';
import {
  comparisonRows,
  comparisonSection,
  formatPrice,
  moreServices,
  packagesSection,
  paymentNote,
  pricingCta,
  pricingFaqs,
  pricingHead,
  pricingInquiry,
  pricingPackages,
  pricingProcess,
  websiteCare,
} from '../../src/data/pricing';
import { contactRoutes, primaryNav, site } from '../../src/data/site';

/**
 * The pricing page (src/pages/pricing/index.astro, the owner's briefs of 2026-11-20 and
 * 2026-11-23): the shared hero, then the three packages as equal-height white cards with Business
 * the studio's pick, one line about hosting under them, Website Care on a near-black panel directly
 * below, the comparison table (a real table at every width, re-flowed below md), a compact card
 * under it for services beyond the packages, the four steps with the payment terms, eleven
 * native FAQ disclosures, and the page's own closing call to action in place of the shared banner.
 * Every button leads to the inquiry page and nothing is sold on the page. The JSON-LD repeats the
 * visible questions, the breadcrumb, and the visible prices as offers. Page-level metadata, layout,
 * hero, and accessibility are covered by the site-wide suites.
 */
const ROUTE = '/pricing/';

/** Tailwind's md, where the comparison table stops re-flowing its rows. */
const MD = 768;
/** Tailwind's lg, where the three package cards share one row and Website Care two columns. */
const LG = 1024;

const faqs = (page: Page) => page.locator('#faq details');

/** Dollar amounts as the copy writes them, `$1,095` or `$149`, without a comma that follows. */
const PRICE = /\$\d{1,3}(?:,\d{3})*/g;

/** Every price the page shows as a price: the three packages and the monthly plan. */
const shownPrices = [
  ...pricingPackages.map((pkg) => formatPrice(pkg.price)),
  formatPrice(websiteCare.plan.price),
];

/** An element's box in the page's coordinates, rounded to the pixel. */
const box = (locator: Locator) =>
  locator.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return {
      top: Math.round(rect.top + scrollY),
      bottom: Math.round(rect.bottom + scrollY),
      left: Math.round(rect.left),
      right: Math.round(rect.right),
    };
  });

/** The page's JSON-LD graph, parsed. */
const graph = async (page: Page) => {
  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
  expect(blocks, 'one JSON-LD block').toHaveLength(1);
  const data = JSON.parse(blocks[0]) as { '@graph': Record<string, unknown>[] };
  return data['@graph'];
};

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

test('the page opens with the shared hero, runs its sections in order, and closes with its own call to action', async ({
  page,
}) => {
  const response = await page.goto(ROUTE);
  expect(response?.status()).toBe(200);
  await expect(page.locator('main > section').first()).toHaveAttribute(
    'aria-labelledby',
    'page-title',
  );
  const ids = await page.evaluate(() =>
    Array.from(document.querySelectorAll('main > section[id]'), (element) => element.id),
  );
  // Website Care directly under the packages, the card for other services under the table.
  expect(ids).toEqual([
    'packages',
    'website-care',
    'compare',
    'more-services',
    'process',
    'faq',
    'get-started',
  ]);
  // The page's own invitation takes the shared banner's place, and nothing hydrates.
  await expect(page.locator('#project-contact')).toHaveCount(0);
  await expect(page.locator('main astro-island')).toHaveCount(0);

  // Pricing is in the navbar, and the bar (and the menu's copy of it) marks this page as current.
  expect(primaryNav).toContainEqual({ label: 'Pricing', href: ROUTE });
  const links = page.locator('nav[aria-label="Primary"] a[href="/pricing/"]');
  await expect(links).toHaveCount(2);
  for (const link of await links.all()) {
    await expect(link).toHaveAttribute('aria-current', 'page');
  }
});

test.describe('packages', () => {
  test('three white cards from the data, Business the studio pick with the gold edge, every button to the inquiry page', async ({
    page,
  }) => {
    await page.goto(ROUTE);
    const cards = page.locator('#packages [data-package]');
    await expect(cards).toHaveCount(3);
    await expect(page.getByText(packagesSection.featuredLabel, { exact: true })).toHaveCount(1);
    await expect(page.getByText('Most popular')).toHaveCount(0);

    for (const [index, pkg] of pricingPackages.entries()) {
      const card = cards.nth(index);
      await expect(card).toHaveAttribute('data-package', pkg.id);
      await expect(card.getByRole('heading', { level: 3 })).toHaveText(pkg.name);
      // The price with "One-time website build" next to it, in one paragraph.
      await expect(card.locator('[data-price]')).toHaveText(
        `${formatPrice(pkg.price)} ${packagesSection.priceNote}`,
      );
      await expect(card).toContainText(pkg.summary);
      await expect(card).toContainText(`Estimated delivery: ${pkg.delivery}`);
      await expect(card).toContainText(`Not included: ${pkg.excluded}`);
      await expect(card.getByRole('list').getByRole('listitem')).toHaveText(pkg.features);
      // Hosting is said once, under the cards; the welcome series is in no card.
      await expect(card).not.toContainText(/hosting|welcome|email series/i);
      const button = card.getByRole('link', { name: pkg.cta, exact: true });
      await expect(button).toHaveAttribute('href', pricingInquiry.href);
      await expect(button).toBeVisible();
      // The lit primary on the studio pick, the outline on the other two.
      await expect(button).toHaveClass(pkg.featured ? /\bbtn-primary\b/ : /\bbtn-outline\b/);
    }

    // Every card is white; the studio pick's edge is the primary gold, the others' the hairline.
    const [white, gold, hairline] = await paint(page, [
      'var(--color-base-100)',
      'var(--color-primary)',
      'var(--color-base-300)',
    ]);
    const styles = await cards.evaluateAll((elements) =>
      elements.map((element) => {
        const style = getComputedStyle(element);
        return { fill: style.backgroundColor, edge: style.borderTopColor };
      }),
    );
    const fills = await paint(
      page,
      styles.map((style) => style.fill),
    );
    const edges = await paint(
      page,
      styles.map((style) => style.edge),
    );
    for (const fill of fills) expect(fill, 'a white card').toEqual(white);
    expect(edges[1], 'Business has the gold edge').toEqual(gold);
    expect(edges[0], 'Starter has the hairline').toEqual(hairline);
    expect(edges[2], 'Growth has the hairline').toEqual(hairline);
    expect(pricingPackages[1].featured, 'the middle package is the featured one').toBe(true);
    await expect(cards.nth(1)).toContainText(packagesSection.featuredLabel);

    // One line under the cards says that hosting is separate, for all three.
    const hosting = page.locator('#packages [data-hosting-note]');
    await expect(hosting).toHaveText(
      `${packagesSection.hosting.lead} ${packagesSection.hosting.text}`,
    );
    const packages = (await page.locator('#packages').textContent()) ?? '';
    expect(packages.match(/hosting/gi), 'hosting is explained once').toHaveLength(1);
  });

  test('from lg the three cards share one row and line up part by part, with the buttons on one line', async ({
    page,
  }) => {
    test.skip((page.viewportSize()?.width ?? 0) < LG, 'the cards stack below lg');
    await page.goto(ROUTE);
    await page.evaluate(() => document.fonts.ready);
    const boxes = await page.locator('#packages [data-package]').evaluateAll((elements) =>
      elements.map((element) => {
        const rect = element.getBoundingClientRect();
        const button = element.querySelector('a.btn')!.getBoundingClientRect();
        // The name, price, sentence, list, delivery, exclusions, and button: the badge is placed.
        const parts = Array.from(element.children)
          .filter((child) => getComputedStyle(child).position !== 'absolute')
          .map((child) => child.getBoundingClientRect().top);
        const [amount, label] = Array.from(element.querySelector('[data-price]')!.children, (n) =>
          n.getBoundingClientRect(),
        );
        return {
          top: rect.top,
          height: rect.height,
          buttonBottom: button.bottom,
          parts,
          // Where the label sits against the price: beside it or under it, the same in each card.
          label: { top: label.top - amount.top, left: label.left - amount.left > 0 },
        };
      }),
    );
    for (const box of boxes) {
      expect(Math.abs(box.top - boxes[0].top), 'one row').toBeLessThanOrEqual(1);
      expect(Math.abs(box.height - boxes[0].height), 'equal heights').toBeLessThanOrEqual(1);
      expect(
        Math.abs(box.buttonBottom - boxes[0].buttonBottom),
        'buttons aligned at the foot',
      ).toBeLessThanOrEqual(1);
      expect(box.parts, 'seven parts per card').toHaveLength(7);
      for (const [index, top] of box.parts.entries()) {
        expect(
          Math.abs(top - boxes[0].parts[index]),
          `part ${index + 1} on one line`,
        ).toBeLessThanOrEqual(1);
      }
      expect(
        Math.abs(box.label.top - boxes[0].label.top),
        'the label placed alike',
      ).toBeLessThanOrEqual(1);
      expect(box.label.left, 'the label placed alike').toBe(boxes[0].label.left);
    }
  });
});

test.describe('comparison table', () => {
  test('a table with column and row headers and a value in every cell', async ({ page }) => {
    await page.goto(ROUTE);
    const table = page.getByRole('table', { name: comparisonSection.caption });
    await expect(table).toHaveCount(1);
    await expect(table.getByRole('columnheader')).toHaveText([
      comparisonSection.featureHeading,
      ...pricingPackages.map((pkg) => pkg.name),
    ]);
    await expect(table.getByRole('rowheader')).toHaveText(comparisonRows.map((row) => row.feature));
    expect(comparisonRows).toHaveLength(12);
    // The welcome series is no longer a feature of any package.
    await expect(table).not.toContainText(/welcome|email/i);

    const rows = table.locator('tbody').getByRole('row');
    await expect(rows).toHaveCount(comparisonRows.length);
    for (const [index, row] of comparisonRows.entries()) {
      const cells = rows.nth(index).getByRole('cell');
      await expect(cells).toHaveCount(3);
      for (const [column, value] of row.values.entries()) {
        const cell = cells.nth(column);
        if (value === true) await expect(cell).toHaveText('Included');
        else if (value === false) await expect(cell).toContainText('Not included');
        else await expect(cell).toHaveText(value);
      }
    }
    // Hosting is never included, and the table says so in words.
    const hosting = comparisonRows.find((row) => row.feature === 'Hosting included?')!;
    expect(hosting.values).toEqual(['No', 'No', 'No']);
  });

  test('below md each row re-flows under its header; from md the row is one line', async ({
    page,
  }) => {
    await page.goto(ROUTE);
    await page.evaluate(() => document.fonts.ready);
    const width = page.viewportSize()?.width ?? 0;
    const table = page.getByRole('table', { name: comparisonSection.caption });
    const row = table.locator('tbody').getByRole('row').nth(2);
    const layout = await row.evaluate((element) => {
      const box = (node: Element) => node.getBoundingClientRect();
      const header = box(element.querySelector('th')!);
      const cells = Array.from(element.querySelectorAll('td'), box);
      return { row: box(element), header, cells };
    });
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow, 'no sideways scroll').toBeLessThanOrEqual(1);
    if (width < MD) {
      expect(layout.header.width, 'the header spans the row').toBeGreaterThan(
        layout.row.width * 0.95,
      );
      for (const cell of layout.cells) {
        expect(cell.top, 'the values sit under the header').toBeGreaterThanOrEqual(
          layout.header.bottom - 1,
        );
      }
      // The package names stay in view under the navbar while the rows scroll past.
      await expect(table.locator('thead')).toHaveCSS('position', 'sticky');
    } else {
      for (const cell of layout.cells) {
        expect(Math.abs(cell.top - layout.header.top), 'one line').toBeLessThanOrEqual(1);
      }
      await expect(table.locator('thead')).toHaveCSS('position', 'static');
    }
  });
});

test.describe('Website Care', () => {
  test('one plan on a near-black panel: its price and opt-in terms, three groups, what is not included, and one button', async ({
    page,
  }) => {
    await page.goto(ROUTE);
    const section = page.locator('#website-care');
    const panel = section.locator('[data-care-panel]');
    const plan = panel.locator('[data-care-plan]');
    const { plan: care } = websiteCare;

    await expect(section.getByRole('heading', { level: 2 })).toHaveText(websiteCare.heading);
    await expect(panel).toContainText(websiteCare.eyebrow);
    await expect(panel).toContainText(websiteCare.intro);
    await expect(plan.getByRole('heading', { level: 3 })).toHaveText(care.name);
    await expect(plan.locator('[data-care-price]')).toHaveText(`${formatPrice(care.price)}/month`);
    await expect(plan).toContainText(care.priceNote);
    // Optional, and only when the client says yes: the conditions the briefs set.
    await expect(plan).toContainText(care.optIn);
    await expect(plan).toContainText('only if you opt in');
    await expect(plan).toContainText('never starts a subscription on its own');
    await expect(plan.getByRole('heading', { level: 4 })).toHaveText(
      care.groups.map((group) => group.title),
    );
    for (const group of care.groups) await expect(plan).toContainText(group.text);
    await expect(plan).toContainText(`Not included. ${care.excluded}`);
    await expect(plan).toContainText('quoted separately');
    await expect(plan).toContainText('Domain registration');
    // Hosting elsewhere stays the alternative.
    await expect(panel).toContainText(`Prefer another host? ${care.elsewhere}`);

    // One button, the lit primary, to the inquiry page.
    const links = section.getByRole('link');
    await expect(links).toHaveCount(1);
    await expect(links.first()).toHaveText(care.cta);
    await expect(links.first()).toHaveAttribute('href', pricingInquiry.href);
    await expect(links.first()).toHaveClass(/\bbtn-primary\b/);

    // The near-black panel on the white page, with a white heading.
    const [white, nearBlack] = await paint(page, ['var(--color-base-100)', 'var(--color-neutral)']);
    const painted = await paint(page, [
      await section.evaluate((element) => getComputedStyle(element).backgroundColor),
      await panel.evaluate((element) => getComputedStyle(element).backgroundColor),
      await section
        .getByRole('heading', { level: 2 })
        .evaluate((element) => getComputedStyle(element).color),
    ]);
    expect(painted[0], 'a white band').toEqual(white);
    expect(painted[1], 'a near-black panel').toEqual(nearBlack);
    expect(painted[2], 'a white heading').toEqual(white);
  });

  test('from lg the copy and button sit left of the price and scope; below lg the button comes last', async ({
    page,
  }) => {
    await page.goto(ROUTE);
    await page.evaluate(() => document.fonts.ready);
    const width = page.viewportSize()?.width ?? 0;
    const section = page.locator('#website-care');
    const heading = await box(section.getByRole('heading', { level: 2 }));
    const description = await box(section.getByText(websiteCare.intro));
    const price = await box(section.locator('[data-care-price]'));
    const groups = await box(section.locator('[data-care-plan] ul'));
    const button = await box(section.getByRole('link'));
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow, 'no sideways scroll').toBeLessThanOrEqual(1);
    if (width >= LG) {
      for (const left of [heading, description, button]) {
        expect(left.right, 'in the left column').toBeLessThan(price.left);
      }
      expect(price.top, 'the price at the top of the right column').toBeLessThan(description.top);
      expect(groups.top, 'the scope under the price').toBeGreaterThan(price.bottom);
      expect(button.top, 'the button under the description').toBeGreaterThan(description.bottom);
      expect(button.top, 'beside the scope, not after it').toBeLessThan(groups.bottom);
    } else {
      // The brief's order on a phone: heading, description, price, inclusions, button.
      expect(description.top).toBeGreaterThanOrEqual(heading.bottom);
      expect(price.top).toBeGreaterThan(description.bottom);
      expect(groups.top).toBeGreaterThan(price.bottom);
      expect(button.top).toBeGreaterThan(groups.bottom);
    }
  });
});

test.describe('services beyond the packages', () => {
  test('a compact card under the table: the heading, the sentence, and two actions, with no price or fine print', async ({
    page,
  }) => {
    await page.goto(ROUTE);
    const section = page.locator('#more-services');
    await expect(section.getByRole('heading')).toHaveCount(1);
    await expect(section.getByRole('heading', { level: 2 })).toHaveText(moreServices.heading);
    await expect(section.getByRole('paragraph')).toHaveText(moreServices.text);
    // The outline button to the message tab, and the text link to the services hub.
    const links = section.getByRole('link');
    await expect(links).toHaveCount(2);
    const button = links.nth(0);
    const link = links.nth(1);
    await expect(button).toHaveText(moreServices.cta.label);
    await expect(button).toHaveAttribute('href', '/contact/#send-message');
    await expect(button).toHaveClass(/\bbtn-outline\b/);
    await expect(link).toHaveText(moreServices.link.label);
    await expect(link).toHaveAttribute('href', '/services/');
    await expect(link).not.toHaveClass(/\bbtn\b/);
    // No envelope, no email fine print, no price label: the one icon is the link's arrow.
    await expect(section.locator('svg')).toHaveCount(1);
    await expect(link.locator('svg')).toHaveCount(1);
    await expect(section).not.toContainText(/\$|quoted separately|opted in|welcome/i);
  });

  test('the actions sit together right of the copy from lg and directly under it below lg, the copy left-aligned', async ({
    page,
  }) => {
    await page.goto(ROUTE);
    await page.evaluate(() => document.fonts.ready);
    const width = page.viewportSize()?.width ?? 0;
    const section = page.locator('#more-services');
    const heading = await box(section.getByRole('heading', { level: 2 }));
    const text = await box(section.getByRole('paragraph'));
    const actions = await box(section.locator('[data-more-services-actions]'));
    const button = await box(section.getByRole('link').nth(0));
    const link = await box(section.getByRole('link').nth(1));
    for (const element of [
      section.getByRole('heading', { level: 2 }),
      section.getByRole('paragraph'),
    ]) {
      await expect(element).toHaveCSS('text-align', /^(start|left)$/);
    }
    expect(heading.left, 'the copy starts on one edge').toBe(text.left);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow, 'no sideways scroll').toBeLessThanOrEqual(1);
    if (width >= LG) {
      expect(actions.left, 'right of the copy').toBeGreaterThan(text.right);
      // Together: the link under the button, on the same left edge.
      expect(link.top).toBeGreaterThanOrEqual(button.bottom);
      expect(Math.abs(link.left - button.left)).toBeLessThanOrEqual(1);
    } else {
      expect(actions.top, 'under the copy').toBeGreaterThanOrEqual(text.bottom);
      expect(Math.abs(actions.left - text.left), "on the copy's left edge").toBeLessThanOrEqual(1);
    }
  });

  test('both actions arrive: the message tab of the contact page and the services hub', async ({
    page,
  }) => {
    // The contact page's booking tab would load Calendly; nothing here needs it.
    await page.route(/calendly\.com/, (route) => route.abort());
    await page.goto(ROUTE);
    const section = page.locator('#more-services');
    await section.getByRole('link', { name: moreServices.cta.label }).click();
    await expect(page).toHaveURL(/\/contact\/#send-message$/);
    await expect(page.locator('#send-message-panel')).toBeVisible();

    await page.goto(ROUTE);
    await section.getByRole('link', { name: moreServices.link.label }).click();
    await expect(page).toHaveURL(/\/services\/$/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});

test('nothing offers the welcome series free, and every price the copy quotes is one the page shows', async ({
  page,
}) => {
  await page.goto(ROUTE);
  // The answers in closed disclosures count too: textContent reads them.
  const text = (await page.locator('main').textContent()) ?? '';
  expect(text).not.toMatch(/free (3|three)-email|complimentary|welcome series bonus/i);
  const quoted = [...text.matchAll(PRICE), ...pricingHead.metaDescription.matchAll(PRICE)].map(
    ([price]) => price,
  );
  expect(quoted.length).toBeGreaterThan(0);
  for (const price of quoted) expect(shownPrices, `${price} is shown on the page`).toContain(price);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    pricingHead.metaDescription,
  );
});

test('the process has four steps and the payment terms under them', async ({ page }) => {
  await page.goto(ROUTE);
  const section = page.locator('#process');
  await expect(section.getByRole('heading', { level: 3 })).toHaveText(
    pricingProcess.steps.map((step, index) => `Step ${index + 1}. ${step.title}`),
  );
  await expect(section).toContainText(`${paymentNote.title}. ${paymentNote.text}`);
  await expect(section).toContainText('50% deposit');
});

test.describe('questions', () => {
  test('eleven disclosures, the first opens from the keyboard and closes again', async ({
    page,
  }) => {
    await page.goto(ROUTE);
    const items = faqs(page);
    await expect(items).toHaveCount(pricingFaqs.items.length);
    expect(pricingFaqs.items).toHaveLength(11);
    await expect(items.locator('summary h3')).toHaveText(
      pricingFaqs.items.map((item) => item.question),
    );
    const first = items.first();
    const summary = first.locator('summary');
    await expect(first).toHaveJSProperty('open', false);
    await expect(summary).toHaveCSS('min-height', '44px');
    await summary.focus();
    await expect(summary).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(first).toHaveJSProperty('open', true);
    await expect(first.locator('p')).toBeVisible();
    await page.keyboard.press('Space');
    await expect(first).toHaveJSProperty('open', false);
  });

  test('the question about other services answers briefly and links to the services hub', async ({
    page,
  }) => {
    await page.goto(ROUTE);
    const linked = pricingFaqs.items.filter((item) => item.link);
    expect(linked.map((item) => item.question)).toEqual(['Can I request a service separately?']);
    expect(pricingFaqs.items.some((item) => /welcome/i.test(item.question))).toBe(false);
    const item = faqs(page).filter({ hasText: linked[0].question });
    await expect(item).toHaveCount(1);
    await item.locator('summary').click();
    await expect(item.locator('p')).toHaveText(linked[0].answer);
    const link = item.getByRole('link', { name: moreServices.link.label });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href', '/services/');
  });

  test('the JSON-LD repeats the visible questions, the breadcrumb, and the visible prices', async ({
    page,
  }) => {
    await page.goto(ROUTE);
    const nodes = await graph(page);
    const faq = nodes.find((node) => node['@type'] === 'FAQPage') as {
      mainEntity: { name: string; acceptedAnswer: { text: string } }[];
    };
    expect(faq.mainEntity.map((entry) => entry.name)).toEqual(
      pricingFaqs.items.map((item) => item.question),
    );
    expect(faq.mainEntity.map((entry) => entry.acceptedAnswer.text)).toEqual(
      pricingFaqs.items.map((item) => item.answer),
    );

    const crumbs = nodes.find((node) => node['@type'] === 'BreadcrumbList') as {
      itemListElement: { name: string; item: string }[];
    };
    expect(crumbs.itemListElement.map((crumb) => crumb.item)).toEqual([
      `${site.url}/`,
      `${site.url}${ROUTE}`,
    ]);

    const services = nodes.filter((node) => node['@type'] === 'Service') as {
      name: string;
      provider: { name: string };
      offers: { price: number; priceCurrency: string }[] | { price: number; priceCurrency: string };
    }[];
    expect(services.map((service) => service.name)).toEqual([
      'Website design and development',
      websiteCare.plan.name,
    ]);
    for (const service of services) expect(service.provider.name).toBe(site.name);
    const [websites, care] = services;
    expect(
      (websites.offers as { price: number }[]).map((offer) => offer.price),
      'one offer per package, at its price',
    ).toEqual(pricingPackages.map((pkg) => pkg.price));
    expect(care.offers).toMatchObject({
      price: websiteCare.plan.price,
      priceCurrency: 'USD',
      priceSpecification: { unitCode: 'MON' },
    });
  });
});

test('the closing call to action offers two ways in, both to the contact page', async ({
  page,
}) => {
  await page.goto(ROUTE);
  const section = page.locator('#get-started');
  await expect(section.getByRole('heading', { level: 2 })).toHaveText(pricingCta.heading);
  await expect(section).toContainText(pricingCta.text);
  const links = section.getByRole('link');
  await expect(links).toHaveCount(2);
  await expect(links.nth(0)).toHaveText(pricingCta.primary.label);
  await expect(links.nth(0)).toHaveAttribute('href', pricingCta.primary.href);
  // The question leads to the contact page's "Send a message" tab (2026-11-20).
  await expect(links.nth(1)).toHaveText(pricingCta.secondary.label);
  await expect(links.nth(1)).toHaveAttribute('href', contactRoutes.sendMessage);
  expect(pricingCta.primary.href).toBe(pricingInquiry.href);
  // No form, checkout, or booking on the page.
  await expect(page.locator('main form, main input, main select, main textarea')).toHaveCount(0);
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('the disclosures still open, and the page needs no script', async ({ page }) => {
    await page.goto(ROUTE);
    await expect(page.locator('main astro-island')).toHaveCount(0);
    const last = faqs(page).last();
    const answer = last.locator('p');
    await expect(answer).toBeHidden();
    await last.locator('summary').click();
    // Read the state from the `open` attribute and the answer showing, not the `open` property:
    // `toHaveJSProperty` runs in the page's script world, which Firefox lacks with scripts off.
    await expect(last).toHaveAttribute('open', '');
    await expect(answer).toBeVisible();
  });
});
