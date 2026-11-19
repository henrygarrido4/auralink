import { primaryCta, type ServiceCard } from '../data/site';

/** Where a linked service card leads. `label` is the action named beside its arrow, when it has one. */
export interface ServiceCardLink {
  href: string;
  /**
   * Visible action beside the arrow. A card's own page uses "Learn more". The inquiry fallback
   * has none: the card's name is the link name (owner, 2026-11-19).
   */
  label?: string;
}

/**
 * The link a service card renders as. Its own service page once that ships (`card.href`), labelled
 * "Learn more". Until then the inquiry page, with no action label beside the arrow. With neither,
 * the card has nowhere real to go, so it gets no link at all and renders as a plain card: never an
 * empty or `#` href, and never a route that does not exist.
 */
export function serviceCardLink(
  card: Pick<ServiceCard, 'href'>,
  inquiryHref: string | undefined = primaryCta.href,
): ServiceCardLink | undefined {
  if (card.href) return { href: card.href, label: 'Learn more' };
  if (inquiryHref) return { href: inquiryHref };
  return undefined;
}
