import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test, type Page } from './fixtures';
import { privacyHero, privacyPage } from '../../src/data/privacy';
import { contactDetails, contactRoutes, serviceCards } from '../../src/data/site';
import { watchConsole } from './console';
import { builtRoutes } from './routes';

/**
 * Contact page (src/pages/contact/index.astro; the owner's brief of 2026-11-20): the dark hero
 * with the studio's address and number, then one white card with two tabs (ContactOptions.astro,
 * src/lib/contact-tabs.ts): "Book a free call", chosen by default, which shows Calendly's
 * scheduler for the discovery call (BookingCalendar.astro, src/lib/booking-embed.ts), and "Send a
 * message", which shows the inquiry form (ProjectInquiryForm.astro, src/lib/inquiry-form.ts), a
 * Netlify form that posts in the background and confirms in its own place. Beside the card from
 * xl, under it below, what happens next and where to look first (ContactAside.astro).
 *
 * Neither Netlify nor Calendly is reached from here. The tests answer the form's POST themselves,
 * and they stand in for Calendly: the widget script is answered with a stub that does what the
 * real one does as far as the page can see (an iframe appended to the container, whose height the
 * script then sets from the booking page), or refused, and the booking page with a blank
 * document. No appointment and no inquiry is ever made; a booking's confirmation, the message
 * Calendly's page posts to the window, is posted from the stubbed frame itself.
 */

/** WebKit mirrors Safari: plain Tab skips links; Option+Tab (Alt+Tab) reaches them. */
const tabKey = (browserName: string) => (browserName === 'webkit' ? 'Alt+Tab' : 'Tab');

const ENDPOINT = '**/';
const WIDGET = 'https://assets.calendly.com/**';
const CALENDLY = 'https://calendly.com/**';

/**
 * What Calendly's `widget.js` does for an inline widget, as far as this page can tell: an iframe
 * of the booking page appended to the container, and, once the page has loaded, the container
 * sized to it (`resize: true`). It counts the widgets it has made.
 */
const WIDGET_STUB = `
  window.Calendly = {
    initInlineWidget(options) {
      const frame = document.createElement('iframe');
      frame.src = options.url;
      frame.title = 'Select a Date & Time - Calendly';
      frame.width = '100%';
      frame.height = '100%';
      frame.frameBorder = '0';
      frame.addEventListener('load', () => {
        if (options.resize) options.parentElement.style.height = '602px';
      });
      options.parentElement.appendChild(frame);
      window.__calendlyWidgets = (window.__calendlyWidgets ?? 0) + 1;
    },
  };
`;

const form = (page: Page) => page.locator('form[name="project-inquiry"]');
const success = (page: Page) => page.getByRole('heading', { name: 'Message sent.' });
const status = (page: Page) => page.locator('[data-inquiry-status]');
const name = (page: Page) => page.getByLabel('Your name');
const email = (page: Page) => page.getByLabel('Email address');
const message = (page: Page) => page.getByLabel('Tell us about your project');
/** The submit button, whose name changes to "Sending…" while a message is on its way. */
const send = (page: Page) => form(page).getByRole('button', { name: /^(Send message|Sending)/ });

const tablist = (page: Page) => page.getByRole('tablist', { name: 'Ways to get in touch' });
const bookTab = (page: Page) => page.getByRole('tab', { name: 'Book a free call' });
const messageTab = (page: Page) => page.getByRole('tab', { name: 'Send a message' });
const bookPanel = (page: Page) => page.locator('#book-call-panel');
const messagePanel = (page: Page) => page.locator('#send-message-panel');
const embed = (page: Page) => page.locator('[data-booking-embed]');
const placeholder = (page: Page) => page.locator('[data-booking-placeholder]');
const openCalendar = (page: Page) => page.getByRole('link', { name: /^Open booking calendar/ });
const hero = (page: Page) => page.getByRole('region', { name: "Let's talk about your project." });

/** The fields a message needs, filled as a visitor would type them. */
async function fillMessage(page: Page) {
  await name(page).fill('Jamie Rivera');
  await email(page).fill('jamie@example.com');
  await message(page).fill('We run a dental clinic and need a new website and better email.');
}

/**
 * `window.scrollY` once three frames in a row agree on it. A programmatic scroll has not settled
 * when it returns: in the frames after it the navbar's collapse follows the offset on the scroll
 * timeline, and scroll anchoring then takes the bar's change back from the offset. After 30 frames
 * without agreement it gives the last reading, for the caller's assertion to report.
 */
const scrollYAtRest = (page: Page) =>
  page.evaluate(
    () =>
      new Promise<number>((resolve) => {
        let last = Number.NaN;
        let agreeing = 0;
        let frames = 0;
        const read = () => {
          const y = window.scrollY;
          agreeing = y === last ? agreeing + 1 : 0;
          last = y;
          frames += 1;
          if (agreeing >= 2 || frames >= 30) resolve(y);
          else requestAnimationFrame(read);
        };
        requestAnimationFrame(read);
      }),
  );

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

/**
 * Stands in for Calendly: the widget script is answered with the stub above (or refused, with
 * `fail`), and the booking page with a blank document. Counts the requests for the script.
 */
async function stubCalendly(page: Page, { fail = false } = {}) {
  const requests = { script: 0 };
  await page.route(WIDGET, async (route) => {
    requests.script += 1;
    if (fail) return route.abort();
    await route.fulfill({ status: 200, contentType: 'text/javascript', body: WIDGET_STUB });
  });
  await page.route(CALENDLY, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: '<!doctype html><title>Calendly</title><p>Booking page</p>',
    }),
  );
  return requests;
}

test.beforeEach(async ({ page }) => {
  // Calendly is never reached. A test that needs the stub's count, or a failure, routes again.
  await stubCalendly(page);
});

test('the form keeps the Netlify contract, is in the built HTML, and the thank-you page is gone', async ({
  page,
}) => {
  const watched = watchConsole(page);
  await page.goto(contactRoutes.sendMessage);
  const inquiry = form(page);
  await expect(inquiry).toBeVisible();
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

  // Netlify reads the form from the built HTML, where no script has hidden anything yet.
  const html = readFileSync(join(process.cwd(), 'dist/contact/index.html'), 'utf8');
  expect(html).toMatch(/<form[^>]*name="project-inquiry"[^>]*data-netlify="true"/);
  expect(html).toMatch(/<section[^>]*id="send-message-panel"(?![^>]*\bhidden)[^>]*>/);
  expect(html).toContain('name="company-website"');

  expect(builtRoutes()).not.toContain('/contact/thank-you/');
  const response = await page.goto('/contact/thank-you/');
  expect(response?.status()).toBe(404);
});

test('beside Send message, the form links to the privacy policy, which is published and indexable', async ({
  page,
}) => {
  await page.goto(contactRoutes.sendMessage);
  const link = form(page).getByRole('link', { name: 'privacy policy' });
  await expect(link).toHaveAttribute('href', privacyPage.href);
  await expect(link.locator('xpath=..')).toHaveText(
    'We use what you send only to respond to your inquiry. Our privacy policy has the details.',
  );
  await link.click();
  await expect(page).toHaveURL(new RegExp(`${privacyPage.href}$`));
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(privacyHero.title);
  // Approved on 2026-11-22: no longer noindex, and no review markers left on the page.
  await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
  await expect(page.locator('main')).not.toContainText(
    /\[CONFIRM|\[CHECK WITH A LAWYER|Draft, not legal advice/,
  );
});

test('two tabs open on the call, with the tabs pattern and the other panel out of reach', async ({
  page,
}) => {
  const watched = watchConsole(page);
  await page.goto('/contact/');
  const list = tablist(page);
  await expect(list).toBeVisible();
  await expect(list.getByRole('tab')).toHaveText(['Book a free call', 'Send a message']);
  await expect(bookTab(page)).toHaveAttribute('aria-selected', 'true');
  await expect(bookTab(page)).toHaveAttribute('aria-controls', 'book-call-panel');
  await expect(bookTab(page)).toHaveAttribute('tabindex', '0');
  await expect(messageTab(page)).toHaveAttribute('aria-selected', 'false');
  await expect(messageTab(page)).toHaveAttribute('aria-controls', 'send-message-panel');
  await expect(messageTab(page)).toHaveAttribute('tabindex', '-1');
  // Each panel is a tabpanel named by its tab, and only the chosen one shows.
  for (const [panel, tab] of [
    [bookPanel(page), 'book-call'],
    [messagePanel(page), 'send-message'],
  ] as const) {
    await expect(panel).toHaveAttribute('role', 'tabpanel');
    await expect(panel).toHaveAttribute('aria-labelledby', tab);
    await expect(panel).toHaveAttribute('tabindex', '0');
  }
  await expect(bookPanel(page)).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Book a free discovery call' })).toBeVisible();
  await expect(messagePanel(page)).toBeHidden();
  await expect(form(page)).toBeHidden();
  // The hidden panel's controls cannot take focus, from the keyboard or from a script.
  expect(
    await name(page).evaluate((field) => {
      field.focus();
      return document.activeElement === field;
    }),
    'a field in the hidden panel cannot be focused',
  ).toBe(false);
  // The call's facts, from the approved details.
  const facts = page.getByRole('list', { name: 'About the call' });
  await expect(facts.getByRole('listitem')).toHaveText([
    contactDetails.booking.duration,
    contactDetails.booking.platform,
    contactDetails.booking.kind,
  ]);
  expect(watched.errors, 'no console or page errors').toEqual([]);
});

test('the fragment chooses the tab: direct links, a click, Back, and Forward, with no jump', async ({
  page,
}) => {
  await page.goto(contactRoutes.sendMessage);
  await expect(messageTab(page)).toHaveAttribute('aria-selected', 'true');
  await expect(form(page)).toBeVisible();
  await expect(bookPanel(page)).toBeHidden();

  await page.goto(contactRoutes.bookCall);
  await expect(bookTab(page)).toHaveAttribute('aria-selected', 'true');
  await expect(bookPanel(page)).toBeVisible();
  await expect(form(page)).toBeHidden();

  // A click writes the fragment without moving the page. Measure where the page comes to rest:
  // after the fonts, whose late arrival re-flows the hero above the card, with the tab centred by
  // an instant scroll (the page scrolls smoothly) and past the navbar's 100px collapse range, where
  // the shut bar no longer follows the offset. Inside the range Linux WebKit's scroll anchoring
  // leaves a pixel or two of the bar's change to the next layout, which no number of frames
  // brings, and a tab poking past the viewport's edge is scrolled into view by the click itself
  // (`.cursor/rules/testing-playwright.mdc`). Both readings are taken the same way.
  await page.goto('/contact/');
  await page.evaluate(() => document.fonts.ready);
  await messageTab(page).evaluate((tab) =>
    tab.scrollIntoView({ block: 'center', behavior: 'instant' }),
  );
  const before = await scrollYAtRest(page);
  expect(before, 'parked past the navbar collapse range').toBeGreaterThanOrEqual(100);
  await expect(messageTab(page), 'wholly on screen, so the click scrolls nothing').toBeInViewport({
    ratio: 1,
  });
  await messageTab(page).click();
  await expect(page).toHaveURL(/\/contact\/#send-message$/);
  await expect(form(page)).toBeVisible();
  await expect(bookPanel(page)).toBeHidden();
  expect(await scrollYAtRest(page), 'the page stays where it was').toBe(before);
  // Choosing the chosen tab again writes nothing new.
  await messageTab(page).click();
  await expect(page).toHaveURL(/\/contact\/#send-message$/);

  await bookTab(page).click();
  await expect(page).toHaveURL(/\/contact\/#book-call$/);
  await expect(bookPanel(page)).toBeVisible();

  await page.goBack();
  await expect(page).toHaveURL(/\/contact\/#send-message$/);
  await expect(messageTab(page)).toHaveAttribute('aria-selected', 'true');
  await expect(form(page)).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(/\/contact\/$/);
  await expect(bookTab(page)).toHaveAttribute('aria-selected', 'true');
  await expect(bookPanel(page)).toBeVisible();
  await page.goForward();
  await expect(page).toHaveURL(/\/contact\/#send-message$/);
  await expect(form(page)).toBeVisible();
  await expect(bookPanel(page)).toBeHidden();
});

/**
 * Links that Facebook and Instagram change on the way in (the owner's decision, 2026-11-24).
 * Facebook adds its click id after the fragment, with "&", or with "?" when the link has no query.
 * Instagram's bio link sends the "#" percent-encoded, so the tab's name ends the last UTM value and
 * there is no fragment. The card's inline script mends the address in place, before the page's
 * other scripts run (ContactOptions.astro), and the page then opens as `/contact/#book-call` does.
 */
const changedLinks = [
  {
    name: 'a click id after the fragment, with an ampersand',
    from: '/contact/?utm_source=facebook&utm_medium=organic_social#book-call&fbclid=TEST123',
    to: '/contact/?utm_source=facebook&utm_medium=organic_social&fbclid=TEST123#book-call',
    tab: bookTab,
    panel: bookPanel,
  },
  {
    name: 'a click id after the fragment, with a question mark',
    from: '/contact/?utm_source=facebook&utm_medium=organic_social#book-call?fbclid=TEST123',
    to: '/contact/?utm_source=facebook&utm_medium=organic_social&fbclid=TEST123#book-call',
    tab: bookTab,
    panel: bookPanel,
  },
  {
    name: 'a click id after the fragment of a link with no query',
    from: '/contact/#book-call?fbclid=TEST123',
    to: '/contact/?fbclid=TEST123#book-call',
    tab: bookTab,
    panel: bookPanel,
  },
  {
    // What URLSearchParams would re-spell (spring+sale, a%7Eb) and a repeated key stay as written.
    name: 'a click id after the fragment, the other parameters exactly as written',
    from: '/contact/?utm_campaign=spring%20sale&utm_term=a~b&utm_term=c#book-call&fbclid=TEST123',
    to: '/contact/?utm_campaign=spring%20sale&utm_term=a~b&utm_term=c&fbclid=TEST123#book-call',
    tab: bookTab,
    panel: bookPanel,
  },
  {
    name: "a click id after the message tab's fragment",
    from: '/contact/?utm_source=facebook&utm_medium=organic_social#send-message&fbclid=TEST123',
    to: '/contact/?utm_source=facebook&utm_medium=organic_social&fbclid=TEST123#send-message',
    tab: messageTab,
    panel: messagePanel,
  },
  {
    name: 'the bio link with its hash percent-encoded',
    from: '/contact/?utm_source=instagram&utm_medium=organic_social&utm_campaign=social_profiles&utm_content=bio_link%23book-call',
    to: '/contact/?utm_source=instagram&utm_medium=organic_social&utm_campaign=social_profiles&utm_content=bio_link#book-call',
    tab: bookTab,
    panel: bookPanel,
  },
  {
    name: 'the bio link with its hash percent-encoded, then a click id',
    from: '/contact/?utm_source=instagram&utm_medium=organic_social&utm_campaign=social_profiles&utm_content=bio_link%23book-call&fbclid=TEST123',
    to: '/contact/?utm_source=instagram&utm_medium=organic_social&utm_campaign=social_profiles&utm_content=bio_link&fbclid=TEST123#book-call',
    tab: bookTab,
    panel: bookPanel,
  },
];

/**
 * Links whose recovered name is no tab's id, a malformed `%` sequence among them (it names
 * nothing, rather than throwing and stopping the script): they are left as they came.
 */
const foreignLinks = [
  { name: 'a fragment naming no tab', from: '/contact/?utm_source=facebook#pricing&fbclid=x' },
  { name: 'an encoded hash naming no tab', from: '/contact/?utm_content=foo%23bar' },
  { name: 'a malformed percent sequence', from: '/contact/#%E0&fbclid=x' },
];

/**
 * Records, from an init script, which runs before any of the page's own scripts, the session
 * history's length at that moment and the address when DOMContentLoaded fires, ahead of the
 * moments Tag Manager's container script is added at (an interaction, or three seconds after
 * `load`). The function returned reads both, with the history's length by then.
 */
async function watchArrival(page: Page) {
  await page.addInitScript(() => {
    const arrival = { length: history.length, ready: '' };
    (window as unknown as { __arrival: typeof arrival }).__arrival = arrival;
    document.addEventListener(
      'DOMContentLoaded',
      () => {
        arrival.ready = location.href;
      },
      { once: true },
    );
  });
  return () =>
    page.evaluate(() => {
      const { length, ready } = (
        window as unknown as { __arrival: { length: number; ready: string } }
      ).__arrival;
      return { before: length, after: history.length, ready };
    });
}

for (const { name, from, to, tab, panel } of changedLinks) {
  test(`a link an app has changed is mended in place and opens its tab in view: ${name}`, async ({
    page,
  }) => {
    const watched = watchConsole(page);
    const arrival = await watchArrival(page);
    await page.goto(from);
    await expect(page).toHaveURL(to);
    await expect(tab(page)).toHaveAttribute('aria-selected', 'true');
    await expect(panel(page)).toBeVisible();
    // The bar starts below the fold at every project's size, so only the scroll to the chosen
    // tab, as for a plain fragment, brings all of it into view.
    await expect(tablist(page)).toBeInViewport({ ratio: 1 });
    const { before, after, ready } = await arrival();
    expect(ready, 'mended before DOMContentLoaded').toBe(new URL(to, page.url()).href);
    expect(after, 'no history entry added').toBe(before);
    expect(watched.errors, 'no console or page errors').toEqual([]);
  });
}

for (const { name, from } of foreignLinks) {
  test(`a link naming no tab is left as it came, on the first tab, at the top: ${name}`, async ({
    page,
  }) => {
    const watched = watchConsole(page);
    const arrival = await watchArrival(page);
    await page.goto(from);
    await expect(page.locator('[data-contact-tabs]')).toHaveAttribute('data-contact-tabs', 'ready');
    await expect(page).toHaveURL(from);
    await expect(bookTab(page)).toHaveAttribute('aria-selected', 'true');
    await expect(bookPanel(page)).toBeVisible();
    expect(await scrollYAtRest(page), 'nothing scrolled').toBe(0);
    const { before, after, ready } = await arrival();
    expect(ready, 'unchanged at DOMContentLoaded').toBe(new URL(from, page.url()).href);
    expect(after, 'no history entry added').toBe(before);
    expect(watched.errors, 'no console or page errors').toEqual([]);
  });
}

test('a fragment the page moves to with a click id after it still chooses its tab', async ({
  page,
}) => {
  // Only the arrival is mended; later, `hashchange` reads the name as the inline script does.
  await page.goto('/contact/');
  await expect(page.locator('[data-contact-tabs]')).toHaveAttribute('data-contact-tabs', 'ready');
  await page.evaluate(() => {
    location.hash = 'send-message&fbclid=TEST123';
  });
  await expect(messageTab(page)).toHaveAttribute('aria-selected', 'true');
  await expect(form(page)).toBeVisible();
  await expect(bookPanel(page)).toBeHidden();
});

test('switching tabs keeps what was typed, a message shown, and the one scheduler', async ({
  page,
}) => {
  const calendly = await stubCalendly(page);
  await page.goto(contactRoutes.sendMessage);
  await name(page).fill('Jamie Rivera');
  await message(page).fill('We run a dental clinic.');
  await page.getByRole('checkbox', { name: 'SEO', exact: true }).check();
  // Sent without an address: the field is marked, and the mark must survive the switch.
  await send(page).click();
  await expect(email(page)).toHaveAttribute('aria-invalid', 'true');

  await bookTab(page).click();
  await expect(bookPanel(page)).toBeVisible();
  await expect(embed(page).locator('iframe')).toHaveCount(1);
  await expect(embed(page)).toHaveAttribute('data-booking-state', 'ready');

  await messageTab(page).click();
  await expect(name(page)).toHaveValue('Jamie Rivera');
  await expect(message(page)).toHaveValue('We run a dental clinic.');
  await expect(page.getByRole('checkbox', { name: 'SEO', exact: true })).toBeChecked();
  await expect(email(page)).toHaveAttribute('aria-invalid', 'true');
  await expect(page.getByText('Please enter your email address so we can reply.')).toBeVisible();

  // Back to the call: the same iframe, no second script, no second widget.
  await bookTab(page).click();
  await expect(embed(page).locator('iframe')).toHaveCount(1);
  expect(calendly.script, 'the script was fetched once').toBe(1);
  expect(
    await page.evaluate(
      () => (window as unknown as { __calendlyWidgets?: number }).__calendlyWidgets,
    ),
    'one widget was made',
  ).toBe(1);
  expect(await page.locator('script[src*="assets.calendly.com"]').count()).toBe(1);
});

test('the tabs work from the keyboard: arrows and Home and End move, Enter and Space choose', async ({
  page,
  browserName,
}) => {
  await page.goto('/contact/');
  await bookTab(page).focus();
  await expect(bookTab(page)).toBeFocused();

  // Manual activation: the arrow moves focus, and the panel waits for Enter or Space.
  await page.keyboard.press('ArrowRight');
  await expect(messageTab(page)).toBeFocused();
  await expect(bookTab(page)).toHaveAttribute('aria-selected', 'true');
  await expect(form(page)).toBeHidden();
  await page.keyboard.press('Enter');
  await expect(messageTab(page)).toHaveAttribute('aria-selected', 'true');
  await expect(form(page)).toBeVisible();
  await expect(page).toHaveURL(/#send-message$/);

  // The ends wrap; Home and End go straight to them.
  await page.keyboard.press('ArrowRight');
  await expect(bookTab(page)).toBeFocused();
  await page.keyboard.press('ArrowLeft');
  await expect(messageTab(page)).toBeFocused();
  await page.keyboard.press('Home');
  await expect(bookTab(page)).toBeFocused();
  await page.keyboard.press('End');
  await expect(messageTab(page)).toBeFocused();
  await page.keyboard.press('Home');
  await page.keyboard.press('Space');
  await expect(bookTab(page)).toHaveAttribute('aria-selected', 'true');
  await expect(bookPanel(page)).toBeVisible();
  await expect(form(page)).toBeHidden();
  await expect(page).toHaveURL(/#book-call$/);

  // Tab leaves the bar for the shown panel, which takes focus so its heading is read first,
  // and nothing in the hidden panel is ever reached.
  await page.keyboard.press(tabKey(browserName));
  await expect(bookPanel(page)).toBeFocused();
  for (let i = 0; i < 3; i++) {
    await page.keyboard.press(tabKey(browserName));
    expect(
      await page.evaluate(() => !!document.activeElement?.closest('#send-message-panel')),
      'focus never enters the hidden panel',
    ).toBe(false);
  }
  // The ring is visible on the chosen tab.
  await bookTab(page).focus();
  await expect(bookTab(page)).toHaveCSS('outline-style', 'solid');
  await expect(bookTab(page)).toHaveCSS('outline-width', '2px');
});

test('the scheduler loads into the booking panel once the page has, and the placeholder goes', async ({
  page,
}) => {
  const watched = watchConsole(page);
  const calendly = await stubCalendly(page);
  await page.goto('/contact/');
  const frame = embed(page).locator('iframe');
  await expect(frame).toHaveCount(1);
  const src = new URL((await frame.getAttribute('src'))!);
  expect(`${src.origin}${src.pathname}`).toBe(contactDetails.booking.url);
  expect(
    src.searchParams.get('hide_event_type_details'),
    "the panel states the call's details",
  ).toBe('1');
  expect(src.searchParams.get('hide_gdpr_banner'), "Calendly's cookie banner stays").toBeNull();
  await expect(frame).toHaveAttribute('title', /.+/);
  await expect(embed(page)).toHaveAttribute('data-booking-state', 'ready');
  await expect(embed(page)).toHaveAttribute('data-booking-sized', 'true');
  await expect(placeholder(page)).toBeHidden();
  await expect(page.locator('[data-booking-live]')).toHaveText('The booking calendar is ready.');
  // The container follows the height Calendly set, and Calendly's room on a phone is kept.
  const box = (await embed(page).boundingBox())!;
  expect(box.height).toBeGreaterThanOrEqual(602);
  expect(box.height).toBeLessThan(620);
  expect(box.width).toBeGreaterThanOrEqual(320);
  expect(calendly.script).toBe(1);
  expect(watched.errors, 'no console or page errors').toEqual([]);
});

test('on the message tab the scheduler waits until the call is chosen', async ({ page }) => {
  const calendly = await stubCalendly(page);
  await page.goto(contactRoutes.sendMessage);
  await page.waitForLoadState('load');
  await expect(form(page)).toBeVisible();
  // Give the page the idle moment it would use, and check nothing was asked for.
  await page.evaluate(() => new Promise((resolve) => setTimeout(resolve, 300)));
  expect(calendly.script, 'no script while the booking panel is hidden').toBe(0);
  await expect(embed(page)).toHaveAttribute('data-booking-state', 'idle');
  await expect(embed(page).locator('iframe')).toHaveCount(0);

  await bookTab(page).click();
  await expect(embed(page).locator('iframe')).toHaveCount(1);
  await expect(embed(page)).toHaveAttribute('data-booking-state', 'ready');
  expect(calendly.script).toBe(1);
});

test('when Calendly cannot load, the panel says so and keeps the link to Calendly', async ({
  page,
}) => {
  await stubCalendly(page, { fail: true });
  await page.goto('/contact/');
  await expect(embed(page)).toHaveAttribute('data-booking-state', 'failed');
  await expect(placeholder(page)).toBeVisible();
  await expect(placeholder(page)).toContainText("The booking calendar couldn't load here.");
  const link = openCalendar(page);
  await expect(link).toBeVisible();
  await expect(link).toHaveAttribute('href', contactDetails.booking.url);
  await expect(link).toHaveAttribute('target', '_blank');
  await expect(link).toHaveAttribute('rel', /noopener/);
  await expect(embed(page).locator('iframe')).toHaveCount(0);
  await expect(page.locator('[data-booking-live]')).toContainText("couldn't load");
  // The failure is contained: the form is a tab away, untouched.
  await messageTab(page).click();
  await expect(form(page)).toBeVisible();
});

test('the address and number are in the hero, whichever tab shows, and in the structured data', async ({
  page,
}) => {
  await page.goto('/contact/');
  const mail = hero(page).getByRole('link', { name: contactDetails.email });
  const phone = hero(page).getByRole('link', { name: contactDetails.phone.display });
  await expect(mail).toHaveAttribute('href', contactDetails.emailHref);
  await expect(phone).toHaveAttribute('href', contactDetails.phone.href);
  for (const link of [mail, phone]) {
    await expect(link).toBeVisible();
    expect((await link.boundingBox())!.height, 'a comfortable target').toBeGreaterThanOrEqual(44);
  }
  await messageTab(page).click();
  await expect(mail).toBeVisible();
  await expect(phone).toBeVisible();
  // Nowhere else is an address made up: every mailto: and tel: is the approved one.
  for (const href of await page
    .locator('a[href^="mailto:"]')
    .evaluateAll((a) => a.map((el) => el.getAttribute('href')))) {
    expect(href).toBe(contactDetails.emailHref);
  }
  for (const href of await page
    .locator('a[href^="tel:"]')
    .evaluateAll((a) => a.map((el) => el.getAttribute('href')))) {
    expect(href).toBe(contactDetails.phone.href);
  }
  const schema = JSON.parse(
    (await page.locator('script[type="application/ld+json"]').first().textContent())!,
  );
  expect(schema['@type']).toBe('ContactPage');
  expect(schema.about).toMatchObject({
    '@type': 'Organization',
    email: contactDetails.email,
    telephone: contactDetails.phone.href.replace('tel:', ''),
  });
});

test('an empty form is held on the page with its empty fields marked, the first focused', async ({
  page,
}) => {
  await page.goto(contactRoutes.sendMessage);
  const bodies = await answerWith(page, 200);
  await send(page).click();
  await expect(page).toHaveURL(/\/contact\/#send-message$/);
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

test('a message is sent without leaving the page, and the confirmation offers the call', async ({
  page,
}) => {
  const watched = watchConsole(page);
  await page.goto(contactRoutes.sendMessage);
  const bodies = await answerWith(page, 200);
  await fillMessage(page);
  await page.getByLabel('Business name').fill('Rivera Dental');
  await page.getByLabel('What kind of business do you run?').selectOption('Dental');
  await page.getByRole('checkbox', { name: 'Custom Websites', exact: true }).check();
  await page.getByRole('checkbox', { name: 'Email & Automation' }).check();
  await page.getByLabel('Current website').fill('riveradental.example');
  await send(page).click();

  await expect(success(page)).toBeVisible();
  await expect(page).toHaveURL(/\/contact\/#send-message$/);
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
  await expect(status(page)).toHaveText('Your message was sent.');

  // "Send another message" brings back an empty form, with the first field focused.
  await panel.getByRole('button', { name: 'Send another message' }).click();
  await expect(form(page)).toBeVisible();
  await expect(panel).toBeHidden();
  await expect(name(page)).toBeFocused();
  await expect(name(page)).toHaveValue('');
  await expect(message(page)).toHaveValue('');
  await expect(page.getByRole('checkbox', { name: 'Email & Automation' })).not.toBeChecked();

  // Sent again, the confirmation's "Book a free call" opens the booking tab.
  await fillMessage(page);
  await send(page).click();
  await expect(panel).toBeVisible();
  const book = panel.getByRole('link', { name: 'Book a free call' });
  await expect(book).toHaveAttribute('href', contactRoutes.bookCall);
  await book.click();
  await expect(page).toHaveURL(/\/contact\/#book-call$/);
  await expect(bookTab(page)).toHaveAttribute('aria-selected', 'true');
  await expect(bookPanel(page)).toBeVisible();
  await expect(messagePanel(page)).toBeHidden();
  // And the confirmation waits in its panel.
  await messageTab(page).click();
  await expect(panel).toBeVisible();
  expect(watched.errors, 'no console or page errors').toEqual([]);
});

test('a failed send says so, offers the address and the number, keeps every word, and lets the visitor try again', async ({
  page,
}) => {
  await page.goto(contactRoutes.sendMessage);
  const failures = await answerWith(page, 500);
  await fillMessage(page);
  await send(page).click();

  const alert = page.getByRole('alert');
  await expect(alert).toBeVisible();
  await expect(alert).toBeFocused();
  await expect(alert).toContainText("Your message couldn't be sent.");
  await expect(alert.getByRole('link', { name: contactDetails.email })).toHaveAttribute(
    'href',
    contactDetails.emailHref,
  );
  await expect(alert.getByRole('link', { name: contactDetails.phone.display })).toHaveAttribute(
    'href',
    contactDetails.phone.href,
  );
  await expect(page).toHaveURL(/\/contact\/#send-message$/);
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
  await page.goto(contactRoutes.sendMessage);
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

test('a message that finishes sending behind the booking tab moves no focus and waits there', async ({
  page,
}) => {
  await page.goto(contactRoutes.sendMessage);
  let release!: () => void;
  const held = new Promise<void>((resolve) => (release = resolve));
  await page.route(ENDPOINT, async (route) => {
    if (route.request().method() !== 'POST') return route.fallback();
    await held;
    await route.fulfill({ status: 200, contentType: 'text/html', body: '' });
  });
  await fillMessage(page);
  await send(page).click();
  await expect(send(page)).toHaveText(/Sending/);

  await bookTab(page).click();
  await expect(bookPanel(page)).toBeVisible();
  await expect(messagePanel(page)).toBeHidden();
  release();
  await expect(status(page)).toHaveText('Your message was sent.');
  await expect(messagePanel(page)).toBeHidden();
  expect(
    await page.evaluate(() => !!document.activeElement?.closest('#send-message-panel')),
    'focus is not pulled into the hidden panel',
  ).toBe(false);

  await messageTab(page).click();
  await expect(success(page)).toBeVisible();
  await expect(page.locator('[data-inquiry-success]')).toContainText('Thanks, Jamie.');
  await expect(form(page)).toBeHidden();
});

test('an accepted message and a booked call each signal one lead to Tag Manager, and nothing else does', async ({
  page,
}) => {
  /** The leads on `dataLayer`, as the container reads them (src/lib/lead-tracking.ts). */
  const leads = () =>
    page.evaluate(() =>
      ((window as unknown as { dataLayer?: unknown[] }).dataLayer ?? []).filter(
        (entry) => (entry as { event?: unknown } | null)?.event === 'generate_lead',
      ),
    );
  await page.goto(contactRoutes.sendMessage);
  expect(await leads(), 'no lead on arrival').toEqual([]);

  // A refused send is no lead.
  await answerWith(page, 500);
  await fillMessage(page);
  await send(page).click();
  await expect(page.getByRole('alert')).toBeVisible();
  expect(await leads(), 'no lead from a failed send').toEqual([]);

  // An accepted one is, once: its source, and nothing the visitor typed.
  await page.unroute(ENDPOINT);
  await answerWith(page, 200);
  await send(page).click();
  await expect(success(page)).toBeVisible();
  const fromForm = { event: 'generate_lead', lead_source: 'inquiry_form' };
  expect(await leads()).toEqual([fromForm]);

  // The booking. The same message from the page's own origin is not Calendly's, and is ignored;
  // a second message from the same source follows it, so by then the first has been dispatched.
  await bookTab(page).click();
  await expect(embed(page)).toHaveAttribute('data-booking-state', 'ready');
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        window.addEventListener('message', (e) => e.data === 'settled' && resolve());
        window.postMessage({ event: 'calendly.event_scheduled', payload: {} }, '*');
        window.postMessage('settled', '*');
      }),
  );
  expect(await leads(), 'a message from another origin is not a booking').toEqual([fromForm]);
  // From Calendly's frame, in the order the booking page sends them: a time chosen is not yet a
  // lead; the confirmation is, once.
  const calendly = page.frame({ url: /^https:\/\/calendly\.com\// });
  expect(calendly, 'the booking page is framed from Calendly').toBeTruthy();
  const post = (name: string) =>
    calendly!.evaluate((event) => parent.postMessage({ event, payload: {} }, '*'), name);
  await post('calendly.date_and_time_selected');
  await post('calendly.event_scheduled');
  await expect
    .poll(leads)
    .toEqual([fromForm, { event: 'generate_lead', lead_source: 'discovery_call' }]);
});

test('the service pills work from the keyboard and show focus and choice', async ({
  page,
  browserName,
}) => {
  await page.goto(contactRoutes.sendMessage);
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

test('what happens next covers both ways in, with the hub links, beside the card from xl', async ({
  page,
}) => {
  await page.goto('/contact/');
  const aside = page.getByRole('complementary', { name: 'What to expect' });
  await expect(aside.getByRole('heading', { level: 2 })).toHaveText([
    'What happens next',
    'Still exploring?',
  ]);
  const steps = aside.getByRole('list').first().getByRole('listitem');
  await expect(steps).toHaveCount(3);
  await expect(steps.nth(0)).toContainText('You book a call or send a message');
  await expect(steps.nth(1)).toContainText('We talk through your goals');
  await expect(steps.nth(2)).toContainText('You get a free estimate and a simple roadmap');
  // No response time, price, or result is promised.
  await expect(aside).not.toContainText(/within \d|hours|business day|guarantee/i);
  await expect(aside.getByRole('link', { name: 'Explore our services' })).toHaveAttribute(
    'href',
    '/services/',
  );
  await expect(aside.getByRole('link', { name: 'See who we work with' })).toHaveAttribute(
    'href',
    '/industries/',
  );

  // Beside the card from xl (1280px), under it below.
  const [card, column] = await Promise.all([
    page.locator('[data-contact-tabs]').boundingBox(),
    aside.boundingBox(),
  ]);
  if (page.viewportSize()!.width >= 1280) {
    expect(column!.x, 'the aside sits to the right of the card').toBeGreaterThanOrEqual(
      card!.x + card!.width,
    );
    expect(Math.abs(column!.y - card!.y), 'both start on one line').toBeLessThanOrEqual(1);
  } else {
    expect(column!.y, 'the aside follows the card').toBeGreaterThanOrEqual(card!.y + card!.height);
  }
});

test('on a narrow phone the scheduler keeps the width Calendly needs, with no sideways scroll', async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto('/contact/');
  await expect(embed(page)).toHaveAttribute('data-booking-state', 'ready');
  const box = (await embed(page).boundingBox())!;
  expect(box.width, 'at least the 320px Calendly asks for').toBeGreaterThanOrEqual(320);
  expect(box.x, 'inside the screen').toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(360);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    ),
    'no sideways scroll',
  ).toBe(0);
  // The tabs stay side by side and readable, each a 44px target at least.
  for (const tab of [bookTab(page), messageTab(page)]) {
    const rect = (await tab.boundingBox())!;
    expect(rect.height).toBeGreaterThanOrEqual(44);
    expect(rect.width).toBeGreaterThanOrEqual(120);
  }
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('the confirmation appears at once, and the booking panel runs nothing', async ({ page }) => {
    await stubCalendly(page, { fail: true });
    await page.goto('/contact/');
    await expect(embed(page)).toHaveAttribute('data-booking-state', 'failed');
    const running = (scope: ReturnType<Page['locator']>) =>
      scope.evaluate(
        (el) => el.getAnimations({ subtree: true }).filter((a) => a.playState === 'running').length,
      );
    expect(await running(bookPanel(page)), 'nothing animates in the booking panel').toBe(0);

    await messageTab(page).click();
    await answerWith(page, 200);
    await fillMessage(page);
    await send(page).click();
    const panel = page.locator('[data-inquiry-success]');
    await expect(panel).toBeVisible();
    expect(await running(panel), 'nothing animates').toBe(0);
  });
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('both ways in stand on their own: the link to Calendly, and the form the browser validates', async ({
    page,
  }) => {
    await page.goto('/contact/');
    // No tab bar; the two panels follow one another under their own headings.
    await expect(page.locator('[data-contact-tablist]')).toBeHidden();
    await expect(page.getByRole('tab')).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Book a free discovery call' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Start a conversation' })).toBeVisible();
    const link = openCalendar(page);
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href', contactDetails.booking.url);
    await expect(embed(page).locator('iframe')).toHaveCount(0);

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
