/**
 * Runs the home services strip (src/components/sections/ServiceStrip.astro).
 *
 * The scrolling itself is the `service-strip` utility in src/styles/global.css: a transform from
 * 0 to -50% of a track made of two equal halves. This measures that track, repeats a set of names
 * until one half is at least as wide as the viewport (so a wide screen never shows an empty gap),
 * and sets --service-strip-duration so the motion stays at SERVICE_STRIP_SPEED_PX_PER_SECOND
 * whatever the width. Pausing under the pointer is the stylesheet's, not this script's.
 *
 * Nothing here runs the motion. Without this script, or when the visitor prefers reduced motion,
 * the stylesheet already shows every name in a static wrapping row.
 */

/**
 * How fast the names travel. Slow enough to read every label as it drifts past (owner,
 * 2026-11-18: slower than the first 60).
 */
export const SERVICE_STRIP_SPEED_PX_PER_SECOND = 60;

/** Enough repeats to fill a very wide screen from the shortest realistic set. */
const MAX_COPIES = 8;

const started = new WeakSet<HTMLElement>();

/** Prepares one strip. Safe to call again: a prepared root is left as it is. */
export function startServiceStrip(root: HTMLElement): void {
  if (started.has(root)) return;

  const viewport = root.querySelector<HTMLElement>('[data-service-strip-viewport]');
  const half = root.querySelector<HTMLElement>(
    '[data-service-strip-half]:not([data-service-strip-clone])',
  );
  const list = half?.querySelector<HTMLElement>(':scope > [data-service-strip-list]');
  if (!viewport || !half || !list) return;

  started.add(root);

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const pads = () => [...root.querySelectorAll<HTMLElement>('[data-service-strip-pad]')];
  let signature = '';

  const rest = () => {
    signature = '';
    delete root.dataset.running;
    for (const pad of pads()) pad.replaceChildren();
  };

  /*
   * Reads first, writes after, and nothing is measured once the copies are in: a measurement
   * then would make the browser lay the page out again on the spot (a forced reflow, 56 ms on
   * the live home page in PageSpeed Insights, 2026-11-22). A half is the list and its copies side
   * by side with nothing between them, so its width is the list's times the number of copies.
   */
  const layout = () => {
    if (reduced.matches) {
      rest();
      return;
    }

    const listWidth = list.getBoundingClientRect().width;
    const viewportWidth = viewport.clientWidth;
    if (listWidth < 1 || viewportWidth < 1) return;

    const copies = Math.min(MAX_COPIES, Math.ceil(viewportWidth / listWidth));
    const extra = copies - 1;
    const next = `${Math.round(viewportWidth)}:${extra}:${Math.round(listWidth)}`;
    if (next === signature && root.dataset.running !== undefined) return;

    for (const pad of pads()) {
      pad.replaceChildren();
      for (let index = 0; index < extra; index += 1) {
        const copy = list.cloneNode(true);
        if (!(copy instanceof HTMLElement)) continue;
        copy.setAttribute('aria-hidden', 'true');
        copy.removeAttribute('role');
        pad.appendChild(copy);
      }
    }

    const distance = listWidth * copies;
    root.style.setProperty(
      '--service-strip-duration',
      `${distance / SERVICE_STRIP_SPEED_PX_PER_SECOND}s`,
    );
    root.dataset.running = '';
    signature = next;
  };

  /*
   * The observer reports once as soon as the band has a size, in the same frame, after the
   * browser's own first layout: the first measurement happens there, so this script never forces
   * the whole page to be laid out before its first paint. Fonts arriving change the names' widths
   * without changing the band's, so that case measures again on its own.
   */
  if (document.fonts) void document.fonts.ready.then(layout);
  reduced.addEventListener('change', layout);
  new ResizeObserver(layout).observe(viewport);
}
