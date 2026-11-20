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

/**
 * Ways to reach the studio directly. Each stays unset until the owner confirms it:
 * docs/content-strategy.md lists the email address and phone number as not yet verified. The
 * contact page shows its "Direct contact" card, and the inquiry form's failure message offers the
 * address, only once `email` is set (src/components/sections/ContactAside.astro,
 * src/components/sections/ProjectInquiryForm.astro).
 */
export const contactDetails: { readonly email?: string } = {};

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
  { path: '/services/', label: 'Services' },
  { path: '/industries/', label: 'Industries' },
  { path: '/blog/', label: 'Blog' },
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
  { label: 'Services', href: '/services/' },
  { label: 'Industries', href: '/industries/' },
  { label: 'About', href: '/about/' },
  { label: 'Blog' },
];

/**
 * Navbar call to action. The home hero and service-card inquiry links share the contact page.
 */
export const primaryCta: NavItem = { label: 'Book a free call', href: '/contact/' };

/**
 * The home introduction's call to action, under its text, links to the built About page.
 */
export const aboutCta: NavItem = { label: 'Learn more', href: '/about/' };

/**
 * The home services introduction links to the services hub, which reuses the approved catalogue.
 */
export const servicesCta: NavItem = { label: 'View all services', href: '/services/' };

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
   * with no action label; with neither, it is not a link (src/lib/service-cards.ts).
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

/** A benefit chip around the devices in the home hero (src/components/ui/ServiceOrbit.astro). */
export interface HeroBenefit {
  /** Lowercase and hyphenated, unique among the chips. */
  readonly id: string;
  /** Two words at most, so the label stays on one or two lines. */
  readonly label: string;
  readonly icon: IconName;
  /** Yellow circle. The others are white. */
  readonly accent: boolean;
}

/**
 * Benefit labels for the chips around the home hero's devices (owner, 2026-11-18). They say what
 * the work is for. They are not measured results: no figures, client names, or notifications
 * belong here. The services strip and the service cards still list the services. Each chip keeps
 * the place of the service it replaced; that order lives in ServiceOrbit, tuned to the devices.
 */
export const heroBenefits: readonly HeroBenefit[] = [
  { id: 'more-sales', label: 'More sales', icon: 'trending-up', accent: true },
  { id: 'new-inquiries', label: 'New inquiries', icon: 'message-circle', accent: false },
  { id: 'more-bookings', label: 'More bookings', icon: 'calendar-check', accent: false },
  { id: 'new-subscribers', label: 'New subscribers', icon: 'user-plus', accent: false },
  { id: 'repeat-customers', label: 'Repeat customers', icon: 'repeat', accent: true },
  { id: 'time-saved', label: 'Time saved', icon: 'clock', accent: false },
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
 * One pillar in the home page's "Why Auralink Studio?" section
 * (src/components/sections/WhyAuralink.astro). Copy is the owner's, from the approved mockup of
 * 2026-11-19. It describes how the studio works. It names no client, price, statistic, or result.
 */
export interface WhyPillar {
  readonly id: string;
  readonly category: string;
  /** Two lines, in order. Each stays its own line. */
  readonly title: readonly [string, string];
  readonly description: string;
  readonly points: readonly string[];
  /** The centre card, on the primary yellow. The other two stay white. */
  readonly accent?: boolean;
}

/** The three pillars, in display order: white, yellow, white. */
export const whyPillars: readonly WhyPillar[] = [
  {
    id: 'personal-partnership',
    category: 'Personal partnership',
    title: ['Direct access.', 'Clear answers.'],
    description: 'Work directly with the person planning, designing, and building your project.',
    points: ['Direct communication', 'Clear scope and timelines', 'Support beyond launch'],
  },
  {
    id: 'connected-expertise',
    category: 'Connected expertise',
    title: ['Web + email.', 'Working together.'],
    description: 'Connect your website and email marketing into one consistent customer journey.',
    points: [
      'Web design and development',
      'Email campaigns and automation',
      'Consistent brand experience',
    ],
    accent: true,
  },
  {
    id: 'purposeful-execution',
    category: 'Purposeful execution',
    title: ['Clear goals.', 'Measurable progress.'],
    description:
      'Build around your business goals, with testing and reporting to guide what comes next.',
    points: [
      'Conversion-focused decisions',
      'Testing and performance tracking',
      'Practical, ongoing improvements',
    ],
  },
];

/** A kind of business in the home page's "Who we work with" directory. */
export interface Industry {
  readonly name: string;
  /** Decorative, beside the name; the name carries the meaning. */
  readonly icon: IconName;
}

/**
 * The kinds of business in the home page's "Who we work with" directory
 * (src/components/sections/WhoWeWorkWith.astro), in display order, read left to right across the
 * rows (owner, 2026-11-19), each with its icon. They are businesses Auralink Studio can help, not a
 * client list: no client names, logos, results, or claims of past work belong here. Plain text
 * until a page for one of them exists.
 */
export const industries: readonly Industry[] = [
  { name: 'Construction & Home Services', icon: 'hard-hat' },
  { name: 'Healthcare & Medical', icon: 'activity' },
  { name: 'Dental', icon: 'tooth' },
  { name: 'Veterinary & Pet Care', icon: 'paw-print' },
  { name: 'Med Spas, Salons & Wellness', icon: 'leaf' },
  { name: 'Automotive', icon: 'car' },
  { name: 'Food & Hospitality', icon: 'utensils' },
  { name: 'Real Estate & Property Management', icon: 'house' },
  { name: 'Retail & Consumer Brands', icon: 'shopping-bag' },
  { name: 'Manufacturing & Industrial', icon: 'factory' },
  { name: 'Arts, Culture & Entertainment', icon: 'palette' },
  { name: 'Education & Community Organizations', icon: 'graduation-cap' },
  { name: 'Nonprofits & Associations', icon: 'heart-handshake' },
  { name: 'Lawyers & Law Firms', icon: 'scale' },
  { name: 'Financial & Professional Services', icon: 'briefcase' },
  { name: 'Technology & SaaS', icon: 'code' },
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
