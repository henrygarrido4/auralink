import { expect, test, type Page } from '@playwright/test';
import { contactDetails, serviceCards } from '../../src/data/site';
import { watchConsole } from './console';
import { builtRoutes } from './routes';

/**
 * Contact page (src/pages/contact/index.astro): the inquiry form in a white card
 * (ProjectInquiryForm.astro) with, beside it from lg and under it below, what happens next and
 * where to look first (ContactAside.astro), after uprig.net/contact, the owner's reference
 * (2026-11-19). The form is a Netlify form that posts in the background (src/lib/inquiry-form.ts)
 * and confirms in its own place: the owner retired the thank-you page the same day, so a sent
 * message never leaves the page. Netlify itself is never posted to here: the tests answer the
 * request themselves, with a success or a failure, and check the page's side of each.
 */

/** WebKit mirrors Safari: plain Tab skips links; Option+Tab (Alt+Tab) reaches them. */
const tabKey = (browserName: string) => (browserName === 'webkit' ? 'Alt+Tab' : 'Tab');

const ENDPOINT = '**/';

const form = (page: Page) => page.locator('form[name="project-inquiry"]');
const success = (page: Page) => page.getByRole('heading', { name: 'Message sent.' });
const status = (page: Page) => page.locator('[data-inquiry-status]');
const name = (page: Page) => page.getByLabel('Your name');
const email = (page: Page) => page.getByLabel('Email address');
const message = (page: Page) => page.getByLabel('Tell us about your project');
/** The submit button, whose name changes to "Sending…" while a message is on its way. */
const send = (page: Page) => form(page).getByRole('button', { name: /^(Send message|Sending)/ });

/** The fields a message needs, filled as a visitor would type them. */
async function fillMessage(page: Page) {
  await name(page).fill('Jamie Rivera');
  await email(page).fill('jamie@example.com');
  await message(page).fill('We run a dental clinic and need a new website and better email.');
}

/**
 * Answers the form's request in place of Netlify, with the status given, and records the body,
 * which the fields arrive in. Nothing else on the page posts, so only POSTs are taken over.
 */
async function answerWith(page: Page, status: number) {
  const bodies: string[] = [];
  await page.route(ENDPOINT, async (route) => {
    if (route.request().method() !== 'POST') return route.fallback();
    bodies.push(route.request().postData() ?? '');
    await route.fulfill({ status, contentType: 'text/html', body: '' });
  });
  return bodies;
}

test('the form keeps the Netlify contract and the thank-you page is gone', async ({ page }) => {
  const watched = watchConsole(page);
  await page.goto('/contact/');
  const inquiry = form(page);
  await expect(inquiry).toHaveAttribute('method', 'POST');
  await expect(inquiry).toHaveAttribute('data-netlify', 'true');
  await expect(inquiry).toHaveAttribute('netlify-honeypot', 'company-website');
  // No `action`: without JavaScript the post goes to the page itself and Netlify answers.
  await expect(inquiry).not.toHaveAttribute('action', /.+/);
  await expect(inquiry.locator('input[name="form-name"]')).toHaveValue('project-inquiry');
  await expect(inquiry.locator('input[name="company-website"]')).toBeHidden();
  await expect(name(page)).toHaveAttribute('required', '');
  await expect(email(page)).toHaveAttribute('type', 'email');
  await expect(email(page)).toHaveAttribute('required', '');
  await expect(message(page)).toHaveAttribute('required', '');
  for (const optional of ['Business name', 'Phone', 'Current website']) {
    await expect(page.getByLabel(optional)).not.toHaveAttribute('required', /.*/);
  }
  // The services as boxes, several of which can be ticked, and one more for the undecided.
  const boxes = inquiry.getByRole('checkbox');
  expect(await boxes.evaluateAll((els) => els.map((el) => (el as HTMLInputElement).name))).toEqual(
    Array(serviceCards.length + 1).fill('services'),
  );
  for (const card of serviceCards) {
    await expect(inquiry.getByRole('checkbox', { name: card.title, exact: true })).toHaveCount(1);
  }
  await expect(inquiry.getByRole('checkbox', { name: 'Not sure yet' })).toHaveCount(1);
  await expect(success(page)).toBeHidden();
  await expect(page.getByRole('alert')).toBeHidden();
  expect(watched.errors, 'no console or page errors').toEqual([]);

  expect(builtRoutes()).not.toContain('/contact/thank-you/');
  const response = await page.goto('/contact/thank-you/');
  expect(response?.status()).toBe(404);
});

test('an empty form is held on the page with its empty fields marked, the first focused', async ({
  page,
}) => {
  await page.goto('/contact/');
  const bodies = await answerWith(page, 200);
  await send(page).click();
  await expect(page).toHaveURL(/\/contact\/$/);
  expect(bodies, 'nothing was sent').toEqual([]);

  const required = [
    { field: name(page), says: 'Please enter your name.' },
    { field: email(page), says: 'Please enter your email address so we can reply.' },
    { field: message(page), says: 'Please tell us a little about your project.' },
  ];
  for (const { field, says } of required) {
    await expect(field).toHaveAttribute('aria-invalid', 'true');
    // The message is the field's description, so it is read with the field.
    const described = (await field.getAttribute('aria-describedby'))!.split(' ');
    const error = page.locator(described.map((id) => `#${id}`).join(', ')).filter({
      hasText: says,
    });
    await expect(error).toBeVisible();
  }
  await expect(name(page)).toBeFocused();
  await expect(status(page)).toHaveText('Please check the 3 highlighted fields.');

  // Typing clears a mark; a second try narrows it down, and a wrong address gets its own words.
  await name(page).fill('Jamie Rivera');
  await expect(name(page)).not.toHaveAttribute('aria-invalid', /.*/);
  await email(page).fill('jamie@');
  await message(page).fill('We need a new website for our clinic.');
  await send(page).click();
  await expect(email(page)).toBeFocused();
  await expect(
    page.getByText('Please enter a valid email address, like name@example.com.'),
  ).toBeVisible();
  await expect(name(page)).not.toHaveAttribute('aria-invalid', /.*/);
  await expect(message(page)).not.toHaveAttribute('aria-invalid', /.*/);
  await expect(status(page)).toHaveText('Please check the highlighted field.');
  expect(bodies, 'still nothing was sent').toEqual([]);
});

test('a message is sent without leaving the page, and the confirmation takes focus', async ({
  page,
}) => {
  const watched = watchConsole(page);
  await page.goto('/contact/');
  const bodies = await answerWith(page, 200);
  await fillMessage(page);
  await page.getByLabel('Business name').fill('Rivera Dental');
  await page.getByLabel('What kind of business do you run?').selectOption('Dental');
  await page.getByRole('checkbox', { name: 'Custom Websites', exact: true }).check();
  await page.getByRole('checkbox', { name: 'Email & Automation' }).check();
  await page.getByLabel('Current website').fill('riveradental.example');
  await send(page).click();

  await expect(success(page)).toBeVisible();
  await expect(page).toHaveURL(/\/contact\/$/);
  expect(bodies).toHaveLength(1);
  const sent = new URLSearchParams(bodies[0]);
  expect(sent.get('form-name')).toBe('project-inquiry');
  expect(sent.get('name')).toBe('Jamie Rivera');
  expect(sent.get('email')).toBe('jamie@example.com');
  expect(sent.get('company')).toBe('Rivera Dental');
  expect(sent.get('industry')).toBe('Dental');
  expect(sent.getAll('services')).toEqual(['Custom Websites', 'Email & Automation']);
  expect(sent.get('website')).toBe('riveradental.example');
  expect(sent.get('company-website'), 'the honeypot is sent, empty').toBe('');

  // The form gives way to the confirmation, which names the visitor and repeats the address.
  await expect(form(page)).toBeHidden();
  const panel = page.locator('[data-inquiry-success]');
  await expect(panel).toBeFocused();
  await expect(panel).toContainText(
    "Thanks, Jamie. We've received your message and will reply to jamie@example.com.",
  );
  await expect(panel.getByRole('link', { name: 'Explore our services' })).toHaveAttribute(
    'href',
    '/services/',
  );
  await expect(status(page)).toHaveText('Your message was sent.');

  // Another message starts from an empty form, with the first field focused.
  await panel.getByRole('button', { name: 'Send another message' }).click();
  await expect(form(page)).toBeVisible();
  await expect(panel).toBeHidden();
  await expect(name(page)).toBeFocused();
  await expect(name(page)).toHaveValue('');
  await expect(message(page)).toHaveValue('');
  await expect(page.getByRole('checkbox', { name: 'Email & Automation' })).not.toBeChecked();
  expect(watched.errors, 'no console or page errors').toEqual([]);
});

test('a failed send says so, keeps every word, and lets the visitor try again', async ({
  page,
}) => {
  await page.goto('/contact/');
  const failures = await answerWith(page, 500);
  await fillMessage(page);
  await send(page).click();

  const alert = page.getByRole('alert');
  await expect(alert).toBeVisible();
  await expect(alert).toBeFocused();
  await expect(alert).toContainText("Your message couldn't be sent.");
  await expect(page).toHaveURL(/\/contact\/$/);
  await expect(form(page)).toBeVisible();
  await expect(success(page)).toBeHidden();
  await expect(message(page)).toHaveValue(
    'We run a dental clinic and need a new website and better email.',
  );
  await expect(status(page)).toHaveText('Your message could not be sent.');
  expect(failures).toHaveLength(1);
  await expect(send(page)).toBeEnabled();
  await expect(send(page)).not.toHaveAttribute('aria-disabled', /.*/);

  // The same words go through once the connection does.
  await page.unroute(ENDPOINT);
  const bodies = await answerWith(page, 200);
  await send(page).click();
  await expect(success(page)).toBeVisible();
  await expect(alert).toBeHidden();
  expect(new URLSearchParams(bodies[0]).get('name')).toBe('Jamie Rivera');
});

test('while a message sends, the button says so and a second press sends nothing', async ({
  page,
}) => {
  await page.goto('/contact/');
  let release!: () => void;
  const held = new Promise<void>((resolve) => (release = resolve));
  const bodies: string[] = [];
  await page.route(ENDPOINT, async (route) => {
    if (route.request().method() !== 'POST') return route.fallback();
    bodies.push(route.request().postData() ?? '');
    await held;
    await route.fulfill({ status: 200, contentType: 'text/html', body: '' });
  });
  await fillMessage(page);
  const button = send(page);
  await button.click();
  await expect(button).toHaveText(/Sending/);
  await expect(button).toHaveAttribute('aria-disabled', 'true');
  await expect(form(page)).toHaveAttribute('aria-busy', 'true');
  await button.click({ force: true });
  await button.press('Enter');
  expect(bodies, 'one request for three presses').toHaveLength(1);
  release();
  await expect(success(page)).toBeVisible();
  expect(bodies).toHaveLength(1);
});

test('the service pills work from the keyboard and show focus and choice', async ({
  page,
  browserName,
}) => {
  await page.goto('/contact/');
  const box = page.getByRole('checkbox', { name: 'Email & Automation' });
  const pill = page.locator('label').filter({ has: box });
  await page.getByLabel('What kind of business do you run?').focus();
  // Through the pills in order: Custom Websites, WordPress Websites, Shopify Stores, then this one.
  for (let i = 0; i < 4; i++) await page.keyboard.press(tabKey(browserName));
  await expect(box).toBeFocused();
  // The pill, not the box inside it, wears the ring.
  await expect(pill).toHaveCSS('outline-style', 'solid');
  await expect(pill).toHaveCSS('outline-width', '2px');
  await expect(box).toHaveCSS('outline-style', 'none');
  const resting = await pill.evaluate((el) => getComputedStyle(el).borderTopColor);
  await page.keyboard.press('Space');
  await expect(box).toBeChecked();
  const chosen = await pill.evaluate((el) => getComputedStyle(el).borderTopColor);
  expect(chosen, 'the pill shows the choice').not.toBe(resting);
  await page.keyboard.press('Space');
  await expect(box).not.toBeChecked();
  await expect(pill).toHaveCSS('border-top-color', resting);
});

test('what happens next and where to look sit with the form, with no contact details unless set', async ({
  page,
}) => {
  await page.goto('/contact/');
  const aside = page.getByRole('complementary', { name: 'Before you send' });
  await expect(aside.getByRole('heading', { level: 2 })).toHaveText(
    contactDetails.email
      ? ['What happens next', 'Direct contact', 'Still exploring?']
      : ['What happens next', 'Still exploring?'],
  );
  await expect(aside.getByRole('list').first().getByRole('listitem')).toHaveCount(3);
  await expect(aside.getByRole('link', { name: 'Explore our services' })).toHaveAttribute(
    'href',
    '/services/',
  );
  await expect(aside.getByRole('link', { name: 'See who we work with' })).toHaveAttribute(
    'href',
    '/industries/',
  );
  const mailto = page.locator('a[href^="mailto:"]');
  if (contactDetails.email) {
    await expect(mailto.first()).toHaveAttribute('href', `mailto:${contactDetails.email}`);
  } else {
    // No address has been confirmed (docs/content-strategy.md), so none is shown or made up.
    await expect(mailto).toHaveCount(0);
    await expect(page.getByText(/@/)).toHaveCount(0);
  }

  // Beside the form from lg, under it below.
  const [card, column] = await Promise.all([
    page.locator('[data-inquiry]').boundingBox(),
    aside.boundingBox(),
  ]);
  if (page.viewportSize()!.width >= 1024) {
    expect(column!.x, 'the aside sits to the right of the form').toBeGreaterThanOrEqual(
      card!.x + card!.width,
    );
    expect(Math.abs(column!.y - card!.y), 'both start on one line').toBeLessThanOrEqual(1);
  } else {
    expect(column!.y, 'the aside follows the form').toBeGreaterThanOrEqual(card!.y + card!.height);
  }
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('the confirmation appears at once', async ({ page }) => {
    await page.goto('/contact/');
    await answerWith(page, 200);
    await fillMessage(page);
    await send(page).click();
    const panel = page.locator('[data-inquiry-success]');
    await expect(panel).toBeVisible();
    const running = await panel.evaluate(
      (el) => el.getAnimations({ subtree: true }).filter((a) => a.playState === 'running').length,
    );
    expect(running, 'nothing animates').toBe(0);
  });
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('the browser validates the form itself and nothing is shown out of turn', async ({
    page,
  }) => {
    await page.goto('/contact/');
    const inquiry = form(page);
    await expect(inquiry).toBeVisible();
    await expect(inquiry).not.toHaveAttribute('novalidate', /.*/);
    expect(await inquiry.evaluate((el) => (el as HTMLFormElement).checkValidity())).toBe(false);
    await expect(success(page)).toBeHidden();
    await expect(page.getByRole('alert')).toBeHidden();
    await expect(page.getByText(/Sending/)).toBeHidden();
    await expect(send(page)).toBeVisible();
  });
});
