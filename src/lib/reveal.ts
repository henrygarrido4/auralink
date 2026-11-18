/**
 * Reveal on scroll: a short entrance that plays once, the first time an element scrolls into view.
 * The motion itself is CSS: give the element `data-reveal`, give the parts that move a reveal
 * utility from src/styles/global.css (`pop-out`), and call `revealOnScroll()` from the component's
 * script.
 *
 * Nothing is hidden unless this runs. It hides only elements that are off screen when it runs,
 * marking them `data-reveal="hidden"`. Each is marked `data-reveal="shown"`, which starts the
 * utility's transition, once its top passes the lower part of the viewport and the images it
 * displays have loaded, so the entrance never plays over empty frames (a fast scroll can outrun
 * lazy loading). Only displayed images count: a lazy image in an undisplayed panel never loads. An
 * image that fails to load counts as ready. Elements already on screen stay as they are, so nothing
 * in view flickers; they turn `shown` once the page has loaded, without moving, so a later change
 * (a filter) can still animate. Without JavaScript or IntersectionObserver, under reduced motion, and in print,
 * everything simply rests. The utilities move parts only with `translate`, never layout, so a
 * reveal cannot shift the page.
 */

/** How far above the bottom of the viewport an element's top must come before it shows. */
const ENTRY_MARGIN = '0px 0px -15% 0px';

/** Elements with `data-reveal` that no call has prepared yet. */
const SELECTOR = '[data-reveal=""]';

/** Whether any part of the element is inside the viewport right now. */
function isOnScreen(element: Element): boolean {
  const { top, bottom } = element.getBoundingClientRect();
  return top < window.innerHeight && bottom > 0;
}

/**
 * Runs `callback` once the page has loaded and two frames have rendered with its stylesheet.
 * WebKit can style the page before the stylesheet applies; marking an element `shown` before that
 * turned the stylesheet's arrival into a transition, so elements on screen at load slid in.
 */
function afterStylesApply(callback: () => void): void {
  const twoFrames = () => requestAnimationFrame(() => requestAnimationFrame(callback));
  if (document.readyState === 'complete') twoFrames();
  else window.addEventListener('load', twoFrames, { once: true });
}

/** Resolves once every displayed image inside the element has loaded and decoded, or failed to. */
function imagesReady(element: Element): Promise<unknown> {
  const displayed = Array.from(element.querySelectorAll('img')).filter(
    (image) => image.getClientRects().length > 0,
  );
  return Promise.allSettled(displayed.map((image) => image.decode()));
}

/**
 * Prepares every unprepared `data-reveal` element inside `root` (the whole page by default).
 * Safe to call more than once: prepared elements are skipped.
 */
export function revealOnScroll(root: ParentNode = document): void {
  if (!('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const element = entry.target as HTMLElement;
        observer.unobserve(element);
        void imagesReady(element).then(() => {
          element.dataset.reveal = 'shown';
        });
      }
    },
    { rootMargin: ENTRY_MARGIN },
  );

  for (const element of root.querySelectorAll<HTMLElement>(SELECTOR)) {
    if (isOnScreen(element)) {
      // Nothing to reveal: it turns `shown` without moving, so later changes can animate.
      afterStylesApply(() => {
        element.dataset.reveal = 'shown';
      });
      continue;
    }
    element.dataset.reveal = 'hidden';
    observer.observe(element);
  }
}
