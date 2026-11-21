/**
 * The Calendly scheduler on the contact page (src/components/sections/BookingCalendar.astro): the
 * owner's discovery-call event, embedded inline with Calendly's own script, which stays in charge
 * of availability, time zones, and the booking itself. With Google Tag Manager's container script
 * (src/layouts/BaseLayout.astro), one of the site's two third-party scripts; the decision is
 * recorded in docs/architecture.md.
 *
 * When. Calendly's script (`widget.js`) is fetched only once the page has loaded and the browser
 * is idle, so nothing of the page waits for it, and the widget is created only while the booking
 * panel is on show: at once when the page opens on the booking tab, otherwise the moment that tab
 * is chosen (`contact-tabs:change`, src/lib/contact-tabs.ts). The script is fetched once and the
 * widget made once; switching tabs hides and shows the same iframe, so a half-made booking
 * survives a look at the form.
 *
 * How. `Calendly.initInlineWidget` with `resize: true`, Calendly's documented inline embed and
 * auto-resizing (https://calendly.com/help/advanced-calendly-embed-for-developers), into the
 * container, which is at least 320px wide at every width, as Calendly requires
 * (https://calendly.com/help/how-to-control-your-embed-layout-and-sizing). The event's own details
 * are hidden (`hide_event_type_details=1`, a documented option on every plan), since the panel
 * states them; Calendly's branding and cookie banner stay. No colour options: they need a paid
 * plan, and the embed is left as Calendly draws it.
 *
 * States, on the container's `data-booking-state`. `loading`: the placeholder over the container
 * says so and offers the "Open booking calendar" link. `ready`: Calendly has shown itself, either
 * by posting one of its documented `calendly.*` messages from its origin or by sizing the
 * container (its script sets the container's height from the booking page's own measurement,
 * which also marks the container `data-booking-sized`, so the page follows that height), and the
 * placeholder goes; a short announcement tells assistive technology. The iframe's own `load`
 * event is not taken as a sign: a blocked or empty frame fires it too. `failed`: the script could
 * not be fetched, or Calendly had not shown itself twenty seconds after the start (a blocker,
 * say): the placeholder stays, says so, and keeps the link, which opens the same event on
 * Calendly's site, so booking is never further than one link away; should the scheduler still
 * arrive, it takes over. Without this script the placeholder shows its first words and the link.
 * Nothing is logged, and nothing here reads what the visitor enters in the scheduler.
 */

const SCRIPT_SRC = 'https://assets.calendly.com/assets/external/widget.js';
const CALENDLY_ORIGIN = 'https://calendly.com';
/** How long the scheduler may take before the placeholder offers the link as the way forward. */
const PATIENCE = 20_000;

const LOADING = 'Loading the booking calendar…';
const READY = 'The booking calendar is ready.';
const SLOW = 'The booking calendar is taking a while to load. You can open it on Calendly instead.';
const FAILED = "The booking calendar couldn't load here. You can still book on Calendly.";

type State = 'idle' | 'loading' | 'ready' | 'failed';

declare global {
  interface Window {
    Calendly?: {
      initInlineWidget(options: {
        url: string;
        parentElement: HTMLElement;
        resize?: boolean;
      }): void;
    };
  }
}

let script: Promise<void> | undefined;

/** Fetches Calendly's script once; a second caller shares the first request. */
function loadScript(): Promise<void> {
  if (window.Calendly) return Promise.resolve();
  script ??= new Promise((resolve, reject) => {
    const element = document.createElement('script');
    element.src = SCRIPT_SRC;
    element.async = true;
    element.addEventListener(
      'load',
      () => (window.Calendly ? resolve() : reject(new Error('Calendly did not initialise.'))),
      { once: true },
    );
    element.addEventListener(
      'error',
      () => reject(new Error('The Calendly script could not be fetched.')),
      { once: true },
    );
    document.head.append(element);
  });
  return script;
}

/** Runs `task` once the page has loaded and the browser has a moment, so the page renders first. */
function afterLoad(task: () => void): void {
  const idle = () => {
    // Older Safari has no requestIdleCallback; a timeout after `load` is the next best moment.
    if (typeof window.requestIdleCallback === 'function') {
      window.requestIdleCallback(task, { timeout: 2000 });
    } else {
      window.setTimeout(task, 0);
    }
  };
  if (document.readyState === 'complete') idle();
  else window.addEventListener('load', idle, { once: true });
}

function enhance(embed: HTMLElement): void {
  const scope = embed.closest<HTMLElement>('[data-booking]');
  const placeholder = scope?.querySelector<HTMLElement>('[data-booking-placeholder]');
  const status = scope?.querySelector<HTMLElement>('[data-booking-status]');
  const live = scope?.querySelector<HTMLElement>('[data-booking-live]');
  const url = embed.dataset.bookingUrl;
  if (!scope || !placeholder || !status || !url) return;
  /** The tab panel around the scheduler, when it sits in one; `hidden` while another tab shows. */
  const panel = embed.closest<HTMLElement>('[data-contact-panel]');

  let state: State = 'idle';
  let patience: number | undefined;

  const setState = (next: State, message?: string) => {
    state = next;
    embed.dataset.bookingState = next;
    if (message) status.textContent = message;
    placeholder.hidden = next === 'ready';
    if (live) live.textContent = next === 'ready' ? READY : next === 'failed' ? message! : '';
  };

  const ready = () => {
    if (state === 'ready') return;
    window.clearTimeout(patience);
    setState('ready');
  };

  const failed = (message: string) => {
    if (state === 'ready') return;
    setState('failed', message);
  };

  const start = () => {
    if (state !== 'idle') return;
    setState('loading', LOADING);
    patience = window.setTimeout(() => failed(SLOW), PATIENCE);
    loadScript()
      .then(() => {
        const widget = new URL(url);
        widget.searchParams.set('hide_event_type_details', '1');
        window.Calendly!.initInlineWidget({
          url: widget.href,
          parentElement: embed,
          resize: true,
        });
        const frame = embed.querySelector('iframe');
        if (!frame) throw new Error('Calendly made no iframe.');
        if (!frame.title) frame.title = 'Book a discovery call on Calendly';
      })
      .catch(() => {
        window.clearTimeout(patience);
        failed(FAILED);
      });
  };

  /** Calendly's documented events, posted from the iframe as the booking page shows and is used. */
  window.addEventListener('message', (event: MessageEvent<{ event?: unknown }>) => {
    if (event.origin !== CALENDLY_ORIGIN) return;
    const name = event.data?.event;
    if (typeof name === 'string' && name.startsWith('calendly.')) ready();
  });

  /** Calendly's script sizes the container to the booking page: the page has rendered. */
  new MutationObserver(() => {
    if (!embed.style.height) return;
    embed.dataset.bookingSized = 'true';
    ready();
  }).observe(embed, { attributes: true, attributeFilter: ['style'] });

  const shown = () => !panel || !panel.hidden;
  document.addEventListener('contact-tabs:change', () => {
    if (shown()) start();
  });
  afterLoad(() => {
    if (shown()) start();
  });
  embed.dataset.bookingState = state;
  embed.dataset.bookingEnhanced = 'true';
}

/**
 * Enhances every scheduler container (`[data-booking-embed]`) inside `root`, the whole page by
 * default. Safe to call more than once: a container already enhanced is skipped. (The component's
 * inline script may have marked the container `idle` already, so the state is not the guard.)
 */
export function enhanceBookingEmbed(root: ParentNode = document): void {
  for (const embed of root.querySelectorAll<HTMLElement>('[data-booking-embed]')) {
    if (embed.dataset.bookingEnhanced) continue;
    enhance(embed);
  }
}
