import type { IconName } from '../lib/icons';
import type { ProjectId } from '../lib/project-photos';

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

/** Something a visitor can see on a featured project's site, as checked on that site. */
export interface ProjectFeature {
  readonly icon: IconName;
  readonly text: string;
}

/**
 * A project in the home page's selected work section (src/components/sections/SelectedWork.astro).
 * Every statement must be one a visitor could check on the project's own site, or that its
 * documentation supports; docs/content-strategy.md records where each fact came from.
 */
export interface FeaturedProject {
  /** Lowercase and hyphenated, unique. Element ids derive from it, and it picks the cover photo. */
  readonly id: ProjectId;
  /** The name the project itself displays. */
  readonly name: string;
  /**
   * The label above the name: how it is built, and what it is when it is not a live site for the
   * business ("WordPress demo", "Shopify recreation"), so a demo or a personal project never passes
   * for client work. Short enough for one line in the narrowest card.
   */
  readonly platform: string;
  /** The catalogue service it shows, which files it under a filter in `workFilters`. */
  readonly service: ServiceSlug;
  /** Its purpose and audience, in one or two sentences, starting with what the business is. */
  readonly description: string;
  /** One or two features a visitor can see on the site. */
  readonly features: readonly ProjectFeature[];
  readonly link: {
    /** The address the owner supplied for the project. */
    readonly href: string;
    /** Names the destination: "View website", "View demo", "View store". */
    readonly label: string;
    /**
     * The site asks visitors for a password the owner keeps private. The card says "Password
     * protected" under the button and never shows the password.
     */
    readonly passwordProtected?: boolean;
    /**
     * The password the site asks for, when the owner has chosen to publish it so visitors can get
     * in (one0one's storefront, 2026-11-18). The card shows "Demo password: …" under the button
     * instead, and a project with it needs no `passwordProtected`. Never add one the owner has not
     * published.
     */
    readonly password?: string;
  };
  /** Alt text for the cover photo, a stock photo that illustrates the industry, never the project. */
  readonly photoAlt: string;
}

/**
 * The filters above the selected work, in display order (owner, 2026-11-18: "By platform"). Each
 * shows the featured projects whose `service` it names; the first is selected when the page
 * loads, so the section opens on one project rather than all of them. Labels follow the service
 * cards' names. At most six: src/styles/global.css (`filter-group`) maps options to panels by
 * position, for up to six.
 */
export const workFilters: readonly { readonly service: ServiceSlug; readonly label: string }[] = [
  { service: 'static-websites', label: 'Custom websites' },
  { service: 'wordpress-development', label: 'WordPress' },
  { service: 'shopify-development', label: 'Shopify' },
];

/**
 * The home page's featured projects, in display order, numbered 01-03 there. Supplied by the owner
 * on 2026-11-18 and described from what each site shows (checked that day). The Villas @ Foxbrick
 * homepage was open without a password later that day; the card still calls it a demo and does not
 * repeat the phone number shown there.
 */
export const featuredProjects: readonly FeaturedProject[] = [
  {
    id: 'johnnys-exclusive-barbershop',
    name: "Johnny's Exclusive Barbershop",
    platform: 'Custom static website',
    service: 'static-websites',
    description:
      'A website for a barbershop in Humble, Texas, made for local customers choosing where to get a haircut or a shave. It sets out the services, prices, opening hours, and location.',
    features: [
      { icon: 'list-filter', text: 'A price list that filters by type of service' },
      {
        icon: 'calendar-check',
        text: "Appointment buttons that open the shop's online booking page",
      },
    ],
    link: { href: 'https://exclusivecutzz.netlify.app/', label: 'View website' },
    photoAlt:
      'Straight razors, a shaving brush in a metal bowl, and clipper guards laid out on a dark towel',
  },
  {
    id: 'villas-at-foxbrick',
    name: 'The Villas @ Foxbrick',
    platform: 'WordPress',
    service: 'wordpress-development',
    description:
      'A website for The Villas @ Foxbrick, an apartment community in Humble, Texas, made for renters comparing one- and two-bedroom homes before they visit.',
    features: [
      { icon: 'layout-grid', text: 'Floor plan, amenity, gallery, and neighborhood pages' },
      { icon: 'key-round', text: 'Leasing details and a tour button in the header' },
    ],
    link: {
      href: 'https://villas-foxbrick-demo.instawp.site/',
      label: 'View website',
    },
    photoAlt:
      "Aerial view of an apartment complex's swimming pool, ringed by loungers between a clubhouse and a covered patio",
  },
  {
    id: 'one0one',
    name: 'one0one',
    platform: 'Shopify recreation',
    service: 'shopify-development',
    description:
      "A personal project that recreates one0one's activewear store on Shopify, as it looked before the brand's latest redesign, for shoppers browsing dresses, tops, belts, and accessories. It is not affiliated with one0one.",
    features: [
      { icon: 'sliders-horizontal', text: 'Collection pages with filters and sorting' },
      { icon: 'globe', text: 'Country, currency, and language selectors' },
    ],
    link: {
      href: 'https://henrrywebsolutions.myshopify.com/',
      label: 'View store',
      password: 'password',
    },
    photoAlt: 'Woman in black activewear stretching in a butterfly pose on a studio floor',
  },
];

/**
 * One step in the home page's process section (src/components/sections/Process.astro), in order.
 * Each step shows an icon, its number, and its title, as the reference the owner named does
 * (fdicreative.com, "4 Easy Steps to Launch!"). The titles reword the owner's own (Free quote, A
 * clear plan, We do the work, You see the results) with synonyms, at the owner's request
 * (2026-11-18); the wording is a proposal. The owner's original titles and longer descriptions are
 * kept in docs/content-strategy.md.
 */
export interface ProcessStep {
  readonly title: string;
  /** Decorative, above the number; the title carries the meaning. */
  readonly icon: IconName;
}

/** The four steps, in the order they happen. */
export const processSteps: readonly ProcessStep[] = [
  { title: 'Free estimate', icon: 'messages-square' },
  { title: 'A simple roadmap', icon: 'clipboard-list' },
  { title: 'We get it done', icon: 'monitor-cog' },
  { title: 'You track the outcomes', icon: 'chart-column' },
];
