import { expect, test } from '@playwright/test';
import { footerIndustries, footerServices } from '../../src/data/footer';

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
  await expect(
    footer.getByRole('navigation', { name: 'Footer services' }).getByRole('link'),
  ).toHaveCount(6);
  await expect(
    footer.getByRole('navigation', { name: 'Footer industries' }).getByRole('link'),
  ).toHaveCount(16);
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

test('every footer service and industry fragment exists on its destination page', async ({
  page,
}) => {
  for (const group of [footerServices, footerIndustries]) {
    const path = group[0]!.href.split('#')[0]!;
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    for (const link of group) {
      const fragment = link.href.split('#')[1]!;
      await expect(page.locator(`[id="${fragment}"]`)).toHaveCount(1);
    }
  }
});

test('an industry footer link lands at the requested industry', async ({ page }) => {
  await page.goto('/');
  await page
    .getByRole('navigation', { name: 'Footer industries' })
    .getByRole('link', { name: 'Dental', exact: true })
    .click();
  await expect(page).toHaveURL(/\/industries\/#industry-dental$/);
  await expect(page.locator('#industry-dental')).toBeInViewport();
});

test('contact form has a real endpoint contract and native accessible validation', async ({
  page,
}) => {
  await page.goto('/contact/');
  await expect(page.locator('#project-contact')).toHaveCount(0);
  const form = page.locator('form[name="project-inquiry"]');
  await expect(form).toHaveAttribute('method', 'POST');
  await expect(form).toHaveAttribute('data-netlify', 'true');
  await expect(form).toHaveAttribute('action', '/contact/thank-you/');
  await expect(form.locator('input[name="form-name"]')).toHaveValue('project-inquiry');
  await expect(form.locator('input[name="company-website"]')).toBeHidden();
  await expect(form.getByLabel('Your name', { exact: false })).toHaveAttribute('required', '');
  await expect(form.getByLabel('Email address', { exact: false })).toHaveAttribute('type', 'email');
  await expect(form.getByLabel('Tell us about your project', { exact: false })).toHaveAttribute(
    'required',
    '',
  );
  // No form submission: delivery is verified only after Netlify form detection is enabled.
  expect(await form.evaluate((el) => (el as HTMLFormElement).checkValidity())).toBe(false);
  const response = await page.goto('/contact/thank-you/');
  expect(response?.status()).toBe(200);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
});
