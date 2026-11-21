import { expect, test, type Page } from './fixtures';
import {
  comparisonRows,
  comparisonSection,
  formatPrice,
  paymentNote,
  pricingCta,
  pricingFaqs,
  pricingInquiry,
  pricingPackages,
  pricingProcess,
  websiteCare,
  welcomeSeries,
} from '../../src/data/pricing';
import { contactRoutes, primaryNav, site } from '../../src/data/site';

/**
 * The pricing page (src/pages/pricing/index.astro, the owner's brief of 2026-11-20): the shared
 * hero, then the three packages as equal-height cards with Business highlighted, the comparison
 * table (a real table at every width, re-flowed below md), the welcome-series bonus, the Website
 * Care plan, the four steps with the payment terms, eleven native FAQ disclosures, and the page's
 * own closing call to action in place of the shared banner. Every button leads to the inquiry page
 * and nothing is sold on the page. The JSON-LD repeats the visible questions, the breadcrumb, and
 * the visible prices as offers. Page-level metadata, layout, hero, and accessibility are covered by
 * the site-wide suites.
 */
const ROUTE = '/pricing/';

/** Tailwind's md, where the comparison table stops re-flowing its rows. */
const MD = 768;
/** Tailwind's lg, where the three package cards share one row. */
const LG = 1024;

const faqs = (page: Page) => page.locator('#faq details');

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
  expect(ids).toEqual([
    'packages',
    'compare',
    'welcome-series',
    'website-care',
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
  test('three cards from the data, Business highlighted in the middle, every button to the inquiry page', async ({
    page,
  }) => {
    await page.goto(ROUTE);
    const cards = page.locator('#packages [data-package]');
    await expect(cards).toHaveCount(3);
    await expect(page.getByText('Most popular', { exact: true })).toHaveCount(1);

    for (const [index, pkg] of pricingPackages.entries()) {
      const card = cards.nth(index);
      await expect(card).toHaveAttribute('data-package', pkg.id);
      await expect(card.getByRole('heading', { level: 3 })).toHaveText(pkg.name);
      await expect(card).toContainText(formatPrice(pkg.price));
      await expect(card).toContainText(pkg.audience);
      await expect(card).toContainText(`Estimated delivery: ${pkg.delivery}`);
      await expect(card).toContainText(`Not included: ${pkg.excluded}`);
      await expect(card.getByRole('list').getByRole('listitem')).toHaveText(pkg.features);
      const button = card.getByRole('link', { name: pkg.cta, exact: true });
      await expect(button).toHaveAttribute('href', pricingInquiry.href);
      await expect(button).toBeVisible();
    }

    // The highlighted card is the near-black `secondary`; the others are white.
    const [dark, white] = await paint(page, ['var(--color-secondary)', 'var(--color-base-100)']);
    const fills = await cards.evaluateAll((elements) =>
      elements.map((element) => getComputedStyle(element).backgroundColor),
    );
    const painted = await paint(page, fills);
    expect(painted[1], 'Business is the dark card').toEqual(dark);
    expect(painted[0], 'Starter is white').toEqual(white);
    expect(painted[2], 'Growth is white').toEqual(white);
    expect(pricingPackages[1].featured, 'the middle package is the highlighted one').toBe(true);
    await expect(cards.nth(1)).toContainText('Most popular');
  });

  test('from lg the three cards share one row, equal in height, with the buttons on one line', async ({
    page,
  }) => {
    test.skip((page.viewportSize()?.width ?? 0) < LG, 'the cards stack below lg');
    await page.goto(ROUTE);
    await page.evaluate(() => document.fonts.ready);
    const boxes = await page.locator('#packages [data-package]').evaluateAll((elements) =>
      elements.map((element) => {
        const rect = element.getBoundingClientRect();
        const button = element.querySelector('a.btn')!.getBoundingClientRect();
        return { top: rect.top, height: rect.height, buttonBottom: button.bottom };
      }),
    );
    for (const box of boxes) {
      expect(Math.abs(box.top - boxes[0].top), 'one row').toBeLessThanOrEqual(1);
      expect(Math.abs(box.height - boxes[0].height), 'equal heights').toBeLessThanOrEqual(1);
      expect(
        Math.abs(box.buttonBottom - boxes[0].buttonBottom),
        'buttons aligned at the foot',
      ).toBeLessThanOrEqual(1);
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
    expect(comparisonRows).toHaveLength(13);

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

test('the welcome series is a bonus, not a fourth package: three numbered emails, no price, no button', async ({
  page,
}) => {
  await page.goto(ROUTE);
  const section = page.locator('#welcome-series');
  await expect(section.getByRole('heading', { level: 2 })).toHaveText(welcomeSeries.heading);
  await expect(section.getByRole('heading', { level: 3 })).toHaveText(
    welcomeSeries.emails.map((email, index) => `Email ${index + 1}. ${email.title}`),
  );
  await expect(section).toContainText(welcomeSeries.scope);
  await expect(section.getByRole('link')).toHaveCount(0);
  await expect(section.getByRole('button')).toHaveCount(0);
  await expect(section).not.toContainText('$');
});

test('Website Care is one plan at its monthly price, with its terms beside it and a button to the inquiry page', async ({
  page,
}) => {
  await page.goto(ROUTE);
  const section = page.locator('#website-care');
  const plan = section.locator('[data-care-plan]');
  await expect(plan.getByRole('heading', { level: 3 })).toHaveText(websiteCare.plan.name);
  await expect(plan).toContainText(new RegExp(`\\$${websiteCare.plan.price}\\s*/month`));
  await expect(plan).toContainText(websiteCare.plan.trial);
  const lists = plan.getByRole('list');
  await expect(lists.nth(0).getByRole('listitem')).toHaveText([...websiteCare.plan.includes]);
  await expect(lists.nth(1).getByRole('listitem')).toHaveText([...websiteCare.plan.limits]);
  const button = plan.getByRole('link', { name: websiteCare.plan.cta, exact: true });
  await expect(button).toHaveAttribute('href', pricingInquiry.href);
  // The conditions the brief set: a separate purchase, explicit acceptance, hosting elsewhere.
  await expect(section.getByRole('heading', { level: 4 })).toHaveText(
    websiteCare.terms.items.map((term) => term.title),
  );
  await expect(section).toContainText('never starts a subscription on its own');
  await expect(section.getByRole('link')).toHaveCount(1);
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
