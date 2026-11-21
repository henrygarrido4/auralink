/**
 * Project inquiry form (src/components/sections/ProjectInquiryForm.astro): sends the form in the
 * background and confirms it on the page, so the visitor never leaves it. The owner asked for this
 * on 2026-11-19, and retired the thank-you page with it.
 *
 * The form is an ordinary Netlify form, so it works without this script: the browser validates it
 * and posts it, and Netlify answers with its own success page. Once this runs, the form takes over
 * its own validation (`novalidate`): on submit every field is checked with the constraint API, a
 * message appears under each field that is empty or invalid, in the words the field carries in
 * `data-required-message` and `data-invalid-message` (or the browser's), linked to the field with
 * `aria-describedby`, and the first of those fields takes focus. A message clears as soon as its
 * field is edited. A valid form is posted to `/` as `application/x-www-form-urlencoded`, the way
 * Netlify's AJAX guide shows, with the hidden `form-name` field that tells Netlify which form it is
 * and the honeypot it filters spam by. While it sends, the button says so (`data-inquiry-when`
 * swaps its label) and further submits are ignored. When Netlify answers, the form gives way to
 * the confirmation in the same card, which takes focus and names the visitor and the address a
 * reply would go to; its button brings an empty form back, and Tag Manager is told of the lead
 * (`trackLead`, src/lib/lead-tracking.ts), with nothing the visitor typed. When the request fails
 * (no connection, or an error from the server) an alert appears above the button and takes
 * focus, nothing the visitor typed is lost, and no lead is signalled. A visually hidden live
 * region announces each step. Nothing is logged.
 */

import { trackLead } from './lead-tracking';

/** Where the form is posted. Netlify accepts a form at any path of the site that exists. */
const ENDPOINT = '/';

type Field = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

const isField = (element: Element): element is Field =>
  element instanceof HTMLInputElement ||
  element instanceof HTMLSelectElement ||
  element instanceof HTMLTextAreaElement;

/** The message for a field that fails validation: the form's own words, or the browser's. */
function messageFor(field: Field): string {
  const { requiredMessage, invalidMessage } = field.dataset;
  if (field.validity.valueMissing) return requiredMessage ?? field.validationMessage;
  return invalidMessage ?? field.validationMessage;
}

/** Adds or removes `id` in the element's `aria-describedby`, keeping the ids already there. */
function describe(field: Field, id: string, add: boolean): void {
  const ids = (field.getAttribute('aria-describedby') ?? '')
    .split(/\s+/)
    .filter((each) => each && each !== id);
  if (add) ids.push(id);
  if (ids.length) field.setAttribute('aria-describedby', ids.join(' '));
  else field.removeAttribute('aria-describedby');
}

/** The posted body: every field as the browser would send it, URL-encoded. */
function encode(data: FormData): string {
  return new URLSearchParams(Array.from(data, ([key, value]) => [key, String(value)])).toString();
}

function enhance(form: HTMLFormElement): void {
  const scope = form.closest<HTMLElement>('[data-inquiry]');
  const status = scope?.querySelector<HTMLElement>('[data-inquiry-status]');
  const success = scope?.querySelector<HTMLElement>('[data-inquiry-success]');
  const alert = form.querySelector<HTMLElement>('[data-inquiry-alert]');
  const submit = form.querySelector<HTMLElement>('[data-inquiry-submit]');
  if (!scope || !status || !success || !alert || !submit) return;

  /** Each field's message element, by the field's name. */
  const errors = new Map<string, HTMLElement>();
  for (const error of form.querySelectorAll<HTMLElement>('[data-inquiry-error]')) {
    if (error.dataset.inquiryError && error.id) errors.set(error.dataset.inquiryError, error);
  }
  /** The fields this script validates: those with a message element of their own. */
  const fields = Array.from(form.elements)
    .filter(isField)
    .filter((field) => errors.has(field.name));

  const announce = (message: string) => {
    status.textContent = message;
  };

  const flag = (field: Field, message: string | null) => {
    const error = errors.get(field.name)!;
    (error.querySelector<HTMLElement>('[data-inquiry-error-text]') ?? error).textContent =
      message ?? '';
    error.hidden = !message;
    if (message) field.setAttribute('aria-invalid', 'true');
    else field.removeAttribute('aria-invalid');
    describe(field, error.id, Boolean(message));
  };

  /** Sending or ready: the button's label and whether submits are taken. */
  const setBusy = (busy: boolean) => {
    form.dataset.state = busy ? 'submitting' : 'idle';
    form.setAttribute('aria-busy', String(busy));
    if (busy) submit.setAttribute('aria-disabled', 'true');
    else submit.removeAttribute('aria-disabled');
    for (const part of form.querySelectorAll<HTMLElement>('[data-inquiry-when]')) {
      part.hidden = part.dataset.inquiryWhen !== (busy ? 'sending' : 'ready');
    }
  };

  const sent = (data: FormData) => {
    const name = String(data.get('name') ?? '').trim();
    const email = String(data.get('email') ?? '').trim();
    for (const part of success.querySelectorAll<HTMLElement>('[data-inquiry-first-name]')) {
      part.textContent = name.split(/\s+/)[0] ?? '';
    }
    for (const part of success.querySelectorAll<HTMLElement>('[data-inquiry-email]')) {
      part.textContent = email;
    }
    form.reset();
    for (const field of fields) flag(field, null);
    setBusy(false);
    form.dataset.state = 'sent';
    form.hidden = true;
    success.hidden = false;
    success.focus();
    announce('Your message was sent.');
    trackLead('inquiry_form');
  };

  const failed = () => {
    setBusy(false);
    form.dataset.state = 'error';
    alert.hidden = false;
    alert.focus();
    announce('Your message could not be sent.');
  };

  const send = async () => {
    alert.hidden = true;
    setBusy(true);
    announce('Sending your message…');
    const data = new FormData(form);
    try {
      const response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encode(data),
      });
      if (!response.ok) throw new Error(`The form endpoint answered ${response.status}.`);
      sent(data);
    } catch {
      failed();
    }
  };

  // From here the script validates, so the browser's own bubbles stay out of the way.
  form.noValidate = true;
  form.dataset.state = 'idle';

  for (const field of fields) {
    field.addEventListener('input', () => {
      if (field.hasAttribute('aria-invalid')) flag(field, null);
    });
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (form.dataset.state === 'submitting') return;

    const invalid = fields.filter((field) => !field.checkValidity());
    for (const field of fields) flag(field, invalid.includes(field) ? messageFor(field) : null);
    if (invalid.length) {
      announce(
        invalid.length === 1
          ? 'Please check the highlighted field.'
          : `Please check the ${invalid.length} highlighted fields.`,
      );
      invalid[0]!.focus();
      return;
    }
    void send();
  });

  scope.querySelector<HTMLElement>('[data-inquiry-reset]')?.addEventListener('click', () => {
    success.hidden = true;
    form.hidden = false;
    form.dataset.state = 'idle';
    announce('');
    fields[0]?.focus();
  });
}

/**
 * Enhances every inquiry form (`form[data-inquiry-form]`) inside `root`, the whole page by
 * default. Safe to call more than once: a form already enhanced is skipped.
 */
export function enhanceInquiryForm(root: ParentNode = document): void {
  for (const form of root.querySelectorAll<HTMLFormElement>('form[data-inquiry-form]')) {
    if (form.dataset.state) continue;
    enhance(form);
  }
}
