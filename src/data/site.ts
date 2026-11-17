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

/** Navbar call to action. Add `href: '/contact/'` when the contact page ships. */
export const primaryCta: NavItem = { label: 'Book a free call' };
