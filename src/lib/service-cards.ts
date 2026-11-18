import { primaryCta, type ServiceCard } from '../data/site';

/** Where a linked service card leads, and the action it names beside its arrow. */
export interface ServiceCardLink {
  href: string;
  label: string;
}

/**
 * The link a service card renders as. Its own service page once that ships (`card.href`); until
 * then the inquiry page, as a temporary fallback whose label promises a conversation, not more
 * information. With neither, the card has nowhere real to go, so it gets no link at all and renders
 * as a plain card: never an empty or `#` href, and never a route that does not exist.
 */
export function serviceCardLink(
  card: Pick<ServiceCard, 'href'>,
  inquiryHref: string | undefined = primaryCta.href,
): ServiceCardLink | undefined {
  if (card.href) return { href: card.href, label: 'Learn more' };
  if (inquiryHref) return { href: inquiryHref, label: 'Discuss this service' };
  return undefined;
}
