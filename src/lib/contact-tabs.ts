/**
 * The contact page's two tabs (src/components/sections/ContactOptions.astro): "Book a free call",
 * which shows the Calendly scheduler, and "Send a message", which shows the inquiry form. Two
 * independent ways in: a visitor takes either, never both, and nothing here submits anything.
 *
 * Without this script the page shows both panels, one after the other, under their own headings,
 * and the tab bar stays hidden. This script turns them into a WAI-ARIA tab interface
 * (https://www.w3.org/WAI/ARIA/apg/patterns/tabs/): the bar becomes a `tablist` of `tab` buttons,
 * each panel a `tabpanel` labelled by its tab, and the panel not chosen is `hidden`, so its
 * controls leave the tab order and the accessibility tree while keeping everything they hold (what
 * was typed, a message shown, the scheduler already loaded). Switching never moves focus or
 * scrolls the page. Activation is manual, as the pattern allows: Left and Right arrows, Home, and
 * End move focus along the tabs (wrapping at the ends) and Enter or Space, the button's own
 * activation, chooses one; `tabindex` follows the chosen tab, so Tab leaves the bar into the shown
 * panel.
 *
 * The chosen tab is the URL's fragment. `/contact/#book-call` and `/contact/#send-message` open on
 * that tab (each id is the tab's own, so the browser also scrolls to the bar); choosing a tab
 * writes its fragment with `pushState`, so Back and Forward move between tabs, and a link on the
 * page to either fragment (the confirmation's "Book a free call") chooses it as well. With no
 * fragment, or one that names no tab, the first tab is chosen. A fragment's name is its part
 * before any `&` or `?`, since Facebook adds its click id after the fragment
 * (`#book-call&fbclid=…`); the component's inline script mends such a link, and Instagram's
 * percent-encoded one, before this module runs (the owner's decision, 2026-11-24), and reads the
 * name the same way, so `hashchange` and `popstate` agree with it. A `contact-tabs:change` event
 * bubbles from the container each time a tab is chosen, with the tab's id in `detail`, which is
 * how the scheduler knows its panel is on show (src/lib/booking-embed.ts).
 *
 * The component's own inline script applies the first choice while the HTML is still parsing, so
 * the page never paints both panels and then hides one; this module takes over from there.
 */

/** The id of the tab chosen, in the event's `detail`. */
export interface ContactTabsChange {
  id: string;
}

const KEYS = new Set(['ArrowLeft', 'ArrowRight', 'Home', 'End']);

/** `decodeURIComponent`, or an empty string, which names no tab, for a malformed `%` sequence. */
function decode(text: string): string {
  try {
    return decodeURIComponent(text);
  } catch {
    return '';
  }
}

function enhance(root: HTMLElement): void {
  const list = root.querySelector<HTMLElement>('[data-contact-tablist]');
  const tabs = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-contact-tab]'));
  const panels = Array.from(root.querySelectorAll<HTMLElement>('[data-contact-panel]'));
  if (!list || tabs.length === 0 || panels.length !== tabs.length) return;

  const ids = tabs.map((tab) => tab.dataset.contactTab ?? '');
  const panelFor = (id: string) => panels.find((panel) => panel.dataset.contactPanel === id);
  if (ids.some((id, index) => !id || tabs[index]!.id !== id || !panelFor(id))) return;

  /**
   * The tab the URL's fragment names, else the first. The name is the fragment's part before any
   * `&` or `?`. The inline script in ContactOptions.astro reads it the same way and cannot import
   * this module: the two must match.
   */
  const fromHash = () => {
    const id = decode(location.hash.slice(1).split(/[&?]/)[0]);
    return ids.includes(id) ? id : ids[0]!;
  };

  const select = (id: string) => {
    for (const tab of tabs) {
      const chosen = tab.dataset.contactTab === id;
      tab.setAttribute('aria-selected', String(chosen));
      tab.tabIndex = chosen ? 0 : -1;
    }
    for (const panel of panels) panel.hidden = panel.dataset.contactPanel !== id;
    root.dataset.contactSelected = id;
    root.dispatchEvent(
      new CustomEvent<ContactTabsChange>('contact-tabs:change', { detail: { id }, bubbles: true }),
    );
  };

  list.hidden = false;
  list.setAttribute('role', 'tablist');
  for (const tab of tabs) {
    const id = tab.dataset.contactTab!;
    const panel = panelFor(id)!;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', panel.id);
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tab.id);
    // Focusable, so a keyboard user arrives at the panel's start and reads its heading first.
    if (!panel.hasAttribute('tabindex')) panel.tabIndex = 0;

    tab.addEventListener('click', () => {
      select(id);
      // Written, not navigated to: the page stays where it is, and Back returns to the other tab.
      if (location.hash !== `#${id}`) history.pushState(null, '', `#${id}`);
    });
  }

  list.addEventListener('keydown', (event) => {
    if (!KEYS.has(event.key)) return;
    const current = tabs.indexOf(event.target as HTMLButtonElement);
    if (current < 0) return;
    event.preventDefault();
    const last = tabs.length - 1;
    const next =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? last
          : event.key === 'ArrowRight'
            ? (current + 1) % tabs.length
            : (current + last) % tabs.length;
    tabs[next]!.focus();
  });

  // A fragment link on the page, and Back or Forward, both end here; `select` is idempotent.
  window.addEventListener('hashchange', () => select(fromHash()));
  window.addEventListener('popstate', () => select(fromHash()));

  const first = fromHash();
  select(first);
  // The page opened on a tab's fragment, but the bar was hidden while the browser looked for its
  // target, or the address came changed by an app and named nothing until the inline script
  // mended it, so it may not have scrolled there: bring the bar into view, at once, where the
  // browser would have (the tab's scroll margin keeps the card's edge and the navbar clear).
  if (location.hash === `#${first}`) {
    requestAnimationFrame(() =>
      tabs[ids.indexOf(first)]!.scrollIntoView({ block: 'start', behavior: 'instant' }),
    );
  }
  root.dataset.contactTabs = 'ready';
}

/**
 * Enhances every tab container (`[data-contact-tabs]`) inside `root`, the whole page by default.
 * Safe to call more than once: a container already enhanced is skipped.
 */
export function enhanceContactTabs(root: ParentNode = document): void {
  for (const container of root.querySelectorAll<HTMLElement>('[data-contact-tabs]')) {
    if (container.dataset.contactTabs === 'ready') continue;
    enhance(container);
  }
}
