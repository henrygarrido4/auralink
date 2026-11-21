import { industryHref } from './industry-pages';
import { industries, primaryNav, serviceCards, servicesPageCards, type NavItem } from './site';

/** Stable fragment for an industry directory entry on the home and industries pages. */
export const industryAnchor = (name: string) =>
  `industry-${name
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')}`;

/**
 * Real destinations, derived from the same catalogues the website displays. The services are the
 * nine cards of the services page, in its order: the six home cards and the three that page adds,
 * each with a page of its own since 2026-11-20. Each link leads straight to that page (the card's
 * `href`), as the home cards and the hub do; the "Services" link in the Company column is the way
 * to the hub itself.
 */
export const footerServices: readonly NavItem[] = [...serviceCards, ...servicesPageCards].map(
  (card) => ({ label: card.title, href: card.href }),
);

/**
 * One link per industry, straight to its page (src/data/industry-pages/, matched by name); the
 * Company column's "Industries" link leads to the hub.
 */
export const footerIndustries: readonly NavItem[] = industries.map((industry) => ({
  label: industry.name,
  href: industryHref(industry.name),
}));

/** The navbar's links, then Contact. Blog is not listed (owner, 2026-11-21). */
export const footerCompany: readonly NavItem[] = [
  ...primaryNav,
  { label: 'Contact', href: '/contact/' },
];
