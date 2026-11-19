import { industries, primaryNav, serviceCards, type NavItem } from './site';

/** Stable fragment for an industry directory entry on the home and industries pages. */
export const industryAnchor = (name: string) =>
  `industry-${name
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')}`;

/** Real destinations, derived from the same catalogues the website displays. */
export const footerServices = serviceCards.map((card) => ({
  label: card.title,
  href: `/services/#services-${card.id}`,
}));

export const footerIndustries = industries.map((industry) => ({
  label: industry.name,
  href: `/industries/#${industryAnchor(industry.name)}`,
}));

/** Blog deliberately stays a label until editorial content is ready to publish. */
export const footerCompany: readonly NavItem[] = [
  ...primaryNav,
  { label: 'Contact', href: '/contact/' },
];
