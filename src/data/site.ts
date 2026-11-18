import type { IconName } from '../lib/icons';

/**
 * Verified business facts for Auralink Studio. Anything that appears in
 * metadata, structured data, or shared UI should come from here rather than
 * being retyped in components.
 *
 * Update docs/content-strategy.md when these facts change.
 */
export const site = {
  name: 'Auralink Studio',
  url: 'https://auralinkstudio.com',
  /** Meta description for the home page and default link previews (keep under 160 characters). */
  description:
    'Auralink Studio builds custom static, WordPress, and Shopify websites, designs and automates email marketing, and improves search and AI visibility.',
  /** Longer positioning statement for body copy. */
  summary:
    'Auralink Studio is a web design, development, and marketing agency. We build custom static websites, WordPress and Shopify sites, design and develop email, run lifecycle email automation, and improve visibility in search and AI answer engines.',
  locale: 'en_US',
  language: 'en',
} as const;

/** Service catalogue. Slugs match the `serviceSlug` enum in src/content.config.ts. */
export const services = [
  { slug: 'static-websites', name: 'Custom static websites', group: 'website-development' },
  {
    slug: 'wordpress-development',
    name: 'WordPress website development',
    group: 'website-development',
  },
  {
    slug: 'shopify-development',
    name: 'Shopify website development',
    group: 'website-development',
  },
  { slug: 'email-design-development', name: 'Email design and development', group: 'email' },
  {
    slug: 'lifecycle-email-marketing',
    name: 'Lifecycle email marketing and automation',
    group: 'email',
  },
  { slug: 'seo', name: 'Search engine optimization (SEO)', group: 'search-visibility' },
  { slug: 'aeo', name: 'Answer engine optimization (AEO)', group: 'search-visibility' },
  { slug: 'geo', name: 'Generative engine optimization (GEO)', group: 'search-visibility' },
] as const;

/** A catalogue service's slug. */
export type ServiceSlug = (typeof services)[number]['slug'];

/**
 * Planned information architecture. These are the intended routes; a page is
 * only linked from navigation once it exists and passes the quality checks.
 * See docs/content-strategy.md for the full plan.
 */
export const plannedRoutes = [
  { path: '/', label: 'Home' },
  { path: '/services/website-development/', label: 'Website Development' },
  { path: '/services/static-websites/', label: 'Static Website Development' },
  { path: '/services/wordpress-development/', label: 'WordPress Development' },
  { path: '/services/shopify-development/', label: 'Shopify Development' },
  { path: '/services/email-marketing/', label: 'Email Marketing and Development' },
  { path: '/services/seo-ai-search/', label: 'SEO and AI Search Visibility' },
  { path: '/work/', label: 'Work' },
  { path: '/about/', label: 'About' },
  { path: '/insights/', label: 'Insights' },
  { path: '/contact/', label: 'Contact' },
] as const;

/** A navigation entry. Without an `href` it renders as a label instead of a link. */
export interface NavItem {
  label: string;
  href?: string;
}

/**
 * Navbar links, in display order. Add an entry's `href` when its page ships
 * (planned paths are listed above), so the site never links to a missing page.
 */
export const primaryNav: readonly NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Services' },
  { label: 'Work' },
  { label: 'Insights' },
  { label: 'About' },
];

/**
 * Navbar call to action. Add `href: '/contact/'` when the contact page ships. The home hero's
 * primary button follows it, and the service cards below fall back to it as their inquiry page.
 */
export const primaryCta: NavItem = { label: 'Book a free call' };

/**
 * The home introduction's call to action, under its text (owner, 2026-11-18). It leads to the
 * About page, `/about/` in docs/content-strategy.md, which is planned but not written. Add its
 * `href` when that page ships, along with the navbar's About entry; until then the button is a
 * placeholder, as the hero's primary is (src/components/ui/Button.astro).
 */
export const aboutCta: NavItem = { label: 'Learn more' };

/**
 * The home services section's call to action, under its introduction (owner, 2026-11-18). It
 * leads to a page listing every service, which docs/content-strategy.md does not plan yet: it plans
 * the service pages and a navbar menu for them. Add its `href` when that page ships; until then
 * the button is a placeholder, as the hero's primary is (src/components/ui/Button.astro).
 */
export const servicesCta: NavItem = { label: 'View all services' };

/** A card in the home page's services section (src/components/sections/Services.astro). */
export interface ServiceCard {
  /** Lowercase and hyphenated, unique among the cards; the card's element ids derive from it. */
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly icon: IconName;
  /** The catalogue services this card presents. */
  readonly services: readonly ServiceSlug[];
  /**
   * The card's own service page. Add it when that page ships (planned routes:
   * docs/content-strategy.md). Until then the card leads to the inquiry page, `primaryCta.href`,
   * labelled for that; with neither, it is not a link (src/lib/service-cards.ts).
   */
  readonly href?: string;
}

/**
 * The home page's service cards, in display order. Titles and descriptions are the owner's
 * (2026-11-17). Together the cards present every catalogue service above exactly once;
 * tests/e2e/services.spec.ts checks this, so a new service needs a card.
 */
export const serviceCards: readonly ServiceCard[] = [
  {
    id: 'custom-websites',
    title: 'Custom Websites',
    description: 'Fast, responsive websites shaped around your business and your customers.',
    icon: 'code-xml',
    services: ['static-websites'],
  },
  {
    id: 'wordpress-websites',
    title: 'WordPress Websites',
    description: 'Flexible websites that make managing and growing your content easier.',
    icon: 'file-pen-line',
    services: ['wordpress-development'],
  },
  {
    id: 'shopify-stores',
    title: 'Shopify Stores',
    description: 'Thoughtful storefronts that make browsing and buying easier.',
    icon: 'shopping-bag',
    services: ['shopify-development'],
  },
  {
    id: 'email-automation',
    title: 'Email & Automation',
    description: 'Branded emails and customer journeys that keep your audience connected.',
    icon: 'mail-clock',
    services: ['email-design-development', 'lifecycle-email-marketing'],
  },
  {
    id: 'seo',
    title: 'SEO',
    description:
      'Useful content and technical foundations that help search engines understand your website.',
    icon: 'search',
    services: ['seo'],
  },
  {
    id: 'aeo-geo',
    title: 'AEO & GEO',
    description:
      'Clear, structured content that supports discovery in answer engines and AI search.',
    icon: 'sparkles',
    services: ['aeo', 'geo'],
  },
];
