import { expect, test, type Page } from '@playwright/test';
import { industryPath, serviceCardById, servicePath } from '../../src/data/detail-pages';
import { industryPages } from '../../src/data/industry-pages';
import { servicePages } from '../../src/data/service-pages';
import { serviceCards, servicesPageCards, site } from '../../src/data/site';

/**
 * The industry and service detail pages (src/pages/industries/[slug].astro,
 * src/pages/services/[slug].astro; the owner's brief of 2026-11-20): one page per entry in
 * src/data/industry-pages/ and src/data/service-pages/ (one service page per card on the
 * services page: the six home cards and the three cards only that page shows), each with the
 * shared hero, its sections in the brief's order, four native FAQ disclosures that open from the
 * keyboard, the page's invitation, and the shared contact banner, which closes the page (the
 * owner removed the "Explore our services" navigation that followed it on 2026-11-20). The
 * JSON-LD on each page carries a BreadcrumbList ending at the page, a FAQPage whose questions and
 * answers are the visible ones, and a Service (service pages) or WebPage (industry pages). An
 * industry page's recommended services link to service pages. Page-level metadata, layout, and
 * accessibility are covered by the site-wide suites.
 */
const serviceRoutes = servicePages.map((page) => ({ page, route: servicePath(page.slug) }));
const industryRoutes = industryPages.map((page) => ({ page, route: industryPath(page.slug) }));

const faqs = (page: Page) => page.locator('#faq details');

/** The page's JSON-LD graph, parsed. */
const graph = async (page: Page) => {
  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
  expect(blocks, 'one JSON-LD block').toHaveLength(1);
  const data = JSON.parse(blocks[0]) as { '@graph': Record<string, unknown>[] };
  return data['@graph'];
};

test('every service and industry page exists, with the shared hero and the sections in order', async ({
  page,
}) => {
  expect(servicePages, 'one service page per card').toHaveLength(
    serviceCards.length + servicesPageCards.length,
  );
  expect(industryRoutes, 'sixteen industry pages').toHaveLength(16);

  for (const { route } of [...serviceRoutes, ...industryRoutes]) {
    await test.step(route, async () => {
      const response = await page.goto(route);
      expect(response?.status()).toBe(200);
      const ids = await page.evaluate(() =>
        Array.from(document.querySelectorAll('main > section[id]'), (element) => element.id),
      );
      // The hero (no id) comes first; the invitation and the banner close the page.
      expect(ids.slice(-2)).toEqual(['next-step', 'project-contact']);
      await expect(page.locator('main > nav')).toHaveCount(0);
      expect(ids).toContain('approach');
      expect(ids).toContain('faq');
      await expect(page.locator('main > section').first()).toHaveAttribute(
        'aria-labelledby',
        'page-title',
      );
    });
  }
});

test.describe('questions', () => {
  test('four disclosures per page open from the keyboard and close again', async ({ page }) => {
    for (const route of [serviceRoutes[0].route, industryRoutes[5].route]) {
      await test.step(route, async () => {
        await page.goto(route);
        const items = faqs(page);
        await expect(items).toHaveCount(4);
        for (let i = 0; i < 4; i += 1) {
          const details = items.nth(i);
          const summary = details.locator('summary');
          await expect(details).toHaveJSProperty('open', false);
          await expect(summary).toHaveCSS('min-height', '44px');
          await summary.focus();
          await expect(summary).toBeFocused();
          await page.keyboard.press('Enter');
          await expect(details).toHaveJSProperty('open', true);
          await expect(details.locator('p')).toBeVisible();
          await page.keyboard.press('Space');
          await expect(details).toHaveJSProperty('open', false);
        }
      });
    }
  });

  test('the FAQ markup repeats the visible questions and answers, and the breadcrumb ends at the page', async ({
    page,
  }) => {
    for (const { page: data, route } of [serviceRoutes[4], industryRoutes[0]]) {
      await test.step(route, async () => {
        await page.goto(route);
        const nodes = await graph(page);
        const faq = nodes.find((node) => node['@type'] === 'FAQPage') as {
          mainEntity: { name: string; acceptedAnswer: { text: string } }[];
        };
        expect(faq.mainEntity.map((entry) => entry.name)).toEqual(
          data.faqs.items.map((item) => item.question),
        );
        expect(faq.mainEntity.map((entry) => entry.acceptedAnswer.text)).toEqual(
          data.faqs.items.map((item) => item.answer),
        );
        await expect(faqs(page).locator('summary h3')).toHaveText(
          data.faqs.items.map((item) => item.question),
        );

        const crumbs = nodes.find((node) => node['@type'] === 'BreadcrumbList') as {
          itemListElement: { position: number; name: string; item: string }[];
        };
        expect(crumbs.itemListElement.map((crumb) => crumb.item)).toEqual([
          `${site.url}/`,
          `${site.url}${route.startsWith('/services/') ? '/services/' : '/industries/'}`,
          `${site.url}${route}`,
        ]);
      });
    }
  });

  test('a service page describes a Service by its card; an industry page a WebPage for that audience', async ({
    page,
  }) => {
    await page.goto(serviceRoutes[1].route);
    const service = (await graph(page)).find((node) => node['@type'] === 'Service') as {
      name: string;
      provider: { name: string };
      url: string;
    };
    expect(service.name).toBe(serviceCardById(servicePages[1].card).title);
    expect(service.provider.name).toBe(site.name);
    expect(service.url).toBe(`${site.url}${serviceRoutes[1].route}`);

    await page.goto(industryRoutes[2].route);
    const webPage = (await graph(page)).find((node) => node['@type'] === 'WebPage') as {
      name: string;
      audience: { '@type': string; name: string };
    };
    expect(webPage.name).toBe(industryPages[2].name);
    expect(webPage.audience).toEqual({ '@type': 'BusinessAudience', name: industryPages[2].name });
  });
});

test('an industry page recommends three or four services, each linked to its own page', async ({
  page,
}) => {
  for (const { page: industry, route } of industryRoutes) {
    await test.step(route, async () => {
      await page.goto(route);
      const links = page.locator('#services').getByRole('list').getByRole('link');
      expect(industry.services.items.length).toBeGreaterThanOrEqual(3);
      expect(industry.services.items.length).toBeLessThanOrEqual(4);
      await expect(links).toHaveCount(industry.services.items.length);
      for (const [index, item] of industry.services.items.entries()) {
        await expect(links.nth(index)).toHaveAttribute('href', serviceCardById(item.card).href!);
      }
      await expect(page.locator('#challenges').getByRole('list').getByRole('listitem')).toHaveCount(
        3,
      );
    });
  }
});

test('a service page lists four to six deliverables and a four-step process', async ({ page }) => {
  for (const { page: service, route } of serviceRoutes) {
    await test.step(route, async () => {
      await page.goto(route);
      expect(service.deliverables.items.length).toBeGreaterThanOrEqual(4);
      expect(service.deliverables.items.length).toBeLessThanOrEqual(6);
      await expect(page.locator('#deliverables').getByRole('listitem')).toHaveCount(
        service.deliverables.items.length,
      );
      await expect(page.locator('#process').getByRole('listitem')).toHaveCount(4);
      await expect(page.locator('#process').getByRole('heading', { level: 3 })).toHaveText(
        service.engagement.steps.map((step, index) => `Step ${index + 1}. ${step.title}`),
      );
    });
  }
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('the disclosures still open, and the page needs no script', async ({ page }) => {
    await page.goto(industryRoutes[0].route);
    await expect(page.locator('main astro-island')).toHaveCount(0);
    const first = faqs(page).first();
    await first.locator('summary').click();
    await expect(first).toHaveJSProperty('open', true);
  });
});
