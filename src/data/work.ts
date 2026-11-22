import type { IconName } from '../lib/icons';
import type { ProjectId } from '../lib/project-screenshots';
import type { Invitation } from './detail-pages';
import type { ServiceCardId, ServicesPageCardId } from './site';

/**
 * The projects shown on the work page (src/pages/work/index.astro) and, as three cards, on the
 * home page's selected work section (src/components/sections/FeaturedWork.astro). Supplied by the
 * owner on 2026-11-18 and 2026-11-21 (Freight Solutions), and described from what each site showed
 * when it was inspected on 2026-11-21; docs/content-strategy.md records what was checked and what
 * still waits for the owner's confirmation. The one0one Shopify recreation of 2026-11-18 was
 * removed at the owner's request on 2026-11-21.
 *
 * The copy is written for a business owner, after the "results" page of Eyler Creative that the
 * owner gave as the reference (2026-11-21), in three parts per project: the challenge, the
 * solution, and what we manage. It states no measured result, figure, ranking, or testimonial:
 * the owner has none to publish, and the page says so by showing the work instead. Every
 * feature named is one a visitor can see on the project's own site.
 */

/** Something a visitor can see on the project's site, as checked there. */
export interface ProjectFeature {
  readonly icon: IconName;
  readonly text: string;
}

export interface WorkProject {
  /** Lowercase and hyphenated, unique. Element ids and the page's anchors derive from it. */
  readonly id: ProjectId;
  /** The name the project itself displays. */
  readonly name: string;
  /** How it is built: "Custom static website", "WordPress website". */
  readonly platform: string;
  /** The kind of business, for the line under the name. */
  readonly industry: string;
  /** Where the business is, as its site states it. */
  readonly location?: string;
  /** The lead paragraph on the work page: what the business is and who the website serves. */
  readonly description: string;
  /** What the business needed the website to do, and for whom. */
  readonly challenge: string;
  /** How the design and build answer it, feature by feature. */
  readonly solution: string;
  /** The services the studio manages for the business, each a link to its page. */
  readonly services: readonly (ServiceCardId | ServicesPageCardId)[];
  /** Three things a visitor can see on the site, shown under the screenshot. */
  readonly features: readonly [ProjectFeature, ProjectFeature, ProjectFeature];
  readonly link: {
    /** The address the owner supplied for the project. */
    readonly href: string;
    /** Names the destination: "View website". */
    readonly label: string;
  };
  /** Alt text for the homepage screenshot: what the picture shows, as a screenshot. */
  readonly screenshotAlt: string;
}

/**
 * The three projects, in display order (the owner's, 2026-11-21: the apartment community first),
 * numbered 01-03 on the work page and the home page's three cards (the owner's request the same
 * day: three cards, these three sites). Every one is the business's live website, as the owner
 * confirmed on 2026-11-21 (The Villas @ Foxbrick had been labelled a demo build until then, from
 * its address); each opens without a password. A site that asked for one would need a note under
 * its button and the owner's decision to publish the password.
 */
export const workProjects: readonly WorkProject[] = [
  {
    id: 'villas-at-foxbrick',
    name: 'The Villas @ Foxbrick',
    platform: 'WordPress website',
    industry: 'Apartment community',
    location: 'Humble, Texas',
    description:
      'The Villas @ Foxbrick is a gated community of one- and two-bedroom homes in Humble, Texas. Its website is built for a renter comparing homes on a phone: floor plans with pricing, amenities, a gallery, the neighborhood, and a Schedule a Tour button in the header.',
    challenge:
      "Renters compare a dozen communities in one evening, mostly on a phone. They want the price, the floor plan, what's nearby, and a way to see it in person, and they move on the moment any of that is hard to find. Current residents need something different: to pay rent or request maintenance without hunting for the portal.",
    solution:
      'A WordPress website the leasing office can keep current. The home page answers the first questions in order: bedrooms, square footage, starting rent, and a Now Leasing bar with the phone number. Each of the four floor plans has its own page, the amenities are shown as full-width photos, and a neighborhood map lists groceries, parks, and dining by distance. Schedule a Tour stays in the header, and Apply Online, Pay Rent, and Resident Center sit in the top bar, so prospects and residents each find their path in a second.',
    services: ['wordpress-websites', 'seo'],
    features: [
      { icon: 'layout-grid', text: 'Four floor plans, each with its own page and pricing' },
      {
        icon: 'map-pin',
        text: 'A neighborhood map with distances to groceries, parks, and dining',
      },
      {
        icon: 'key-round',
        text: 'Apply online, pay rent, and resident center links in the top bar',
      },
    ],
    link: { href: 'https://villas-foxbrick-demo.instawp.site/', label: 'View website' },
    screenshotAlt:
      'Homepage of The Villas @ Foxbrick: yellow three-storey apartment buildings behind a lawn, with the headline Luxury living, right here in Humble and a Find Your Home button',
  },
  {
    id: 'johnnys-exclusive-barbershop',
    name: "Johnny's Exclusive Barbershop",
    platform: 'Custom static website',
    industry: 'Barbershop',
    location: 'Humble, Texas',
    description:
      "Johnny's Exclusive Barbershop serves men in Humble, Texas who want a sharp cut, a clean shave, and no guesswork about what it costs. The website gives them everything they need to decide and book: the services, the prices, the hours, the address, and a booking button on every page.",
    challenge:
      'Most customers find a barbershop on their phone, often between errands. They want three answers fast: what the shop offers, what it costs, and when they can get in. A page that buries the prices, or makes people call to book, loses them to the next shop in the search results.',
    solution:
      "A fast, hand-built website in the shop's own look: dark, warm, and confident. The price list filters by type of service, so a customer tapping Kids Cuts sees only that, with the time each service takes. The hours and phone number sit in the top bar of every page, and every Book an Appointment button opens the shop's online scheduler, so the next step is never more than a tap away. A gallery shows the work, a Google review link invites happy customers to say so, and a newsletter sign-up keeps them in touch.",
    services: ['custom-websites', 'local-seo', 'email-automation'],
    features: [
      { icon: 'list-filter', text: 'A price list that filters by type of service' },
      { icon: 'calendar-check', text: "Booking buttons that open the shop's online scheduler" },
      { icon: 'clock', text: 'Hours and phone number in the top bar of every page' },
    ],
    link: { href: 'https://exclusivecutzz.netlify.app/', label: 'View website' },
    screenshotAlt:
      "Homepage of Johnny's Exclusive Barbershop: a barber spraying a client's hair behind the headline Barber & Hair Cutting, with a Book an Appointment button",
  },
  {
    id: 'freight-solutions',
    name: 'Freight Solutions LLC',
    platform: 'Custom static website',
    industry: 'Flatbed trucking and logistics',
    location: 'Houston, Texas',
    description:
      'Freight Solutions LLC hauls flatbed, step-deck, heavy-haul, and oilfield loads, and most of its business starts with a phone call. The website is built for the two people who arrive on it: a shipper deciding whether to request a quote, and a driver deciding whether to apply.',
    challenge:
      'Shippers vet a carrier in minutes. They want to see the equipment, the kinds of loads it handles, and a sign that the company is established before they pick up the phone. Freight Solutions had the fleet and the experience; it needed a website that showed both clearly, worked on a phone in a truck yard, and gave drivers a quick way to apply.',
    solution:
      "A bold, dark design in the company's red, built around the call. The phone number and email sit in the header of every page, and the home page says plainly that quotes come by phone. Eleven services, from flatbed and stretch trailers to heavy haul and rig-site deliveries, run as a numbered list so a shipper finds their load type at a glance. A Why Choose Us section and a note on GPS tracking answer the trust questions, a featured-projects gallery shows loads on the road, and an Online Driver Application link in the main navigation sends drivers straight to the company's application form.",
    services: ['custom-websites', 'seo'],
    features: [
      { icon: 'phone', text: 'Phone number and email in the header of every page' },
      { icon: 'clipboard-list', text: 'Eleven services laid out as a numbered list' },
      { icon: 'user-plus', text: 'A driver application link in the main navigation' },
    ],
    link: { href: 'https://freightsolutions.netlify.app/', label: 'View website' },
    screenshotAlt:
      'Homepage of Freight Solutions LLC: the red and white headline To Every Direction over a night-time photo of pipe stacked on a flatbed trailer, with a View Services button',
  },
];

/**
 * The home page's cards, in order: every project, and exactly three of them, since the section's
 * grid is built for three (FeaturedWork.astro). A fourth project needs that grid rethought, or a
 * `featured` flag here.
 */
export const featuredWork = workProjects;
if (featuredWork.length !== 3) {
  throw new Error('The home page shows exactly three projects (the owner, 2026-11-21).');
}

/** The small label beside each project's platform: every project is the business's live website. */
export const projectStatus = 'Live website';

/** The work page's own copy: the hero, the overview, and the closing invitation. */
export const workPage = {
  metaTitle: 'Our Work',
  metaDescription:
    'Website projects by Auralink Studio: an apartment community, a barbershop, and a trucking company, each with its challenge and solution.',
  title: 'Real businesses. Websites built to be chosen.',
  highlight: 'built to be chosen.',
  description:
    'Three live websites for local businesses: an apartment community on WordPress, and a barbershop and a trucking company on custom static websites. Each is shown the same way: the challenge, how the website answers it, and what we manage.',
  overview: {
    eyebrow: 'Three projects',
    heading: 'How to read these projects.',
    intro:
      'Each one is a working website you can open. Rather than headline numbers, we show the thinking behind every build: the problem the business brought, how the website answers it, and what we take care of.',
    legend: [
      {
        title: 'The challenge',
        text: 'What the business needed the website to do, and for whom.',
      },
      {
        title: 'The solution',
        text: 'How the design and build answer it, feature by feature.',
      },
      {
        title: 'What we manage',
        text: 'The services behind the project, each linked to its own page.',
      },
    ],
  },
  invitation: {
    heading: 'Your business could be next.',
    text: "Tell us what you want more of, whether that's calls, bookings, applications, or orders, and we'll show you what a website built around it could look like.",
    bring: [
      'What you want the website to do for your business',
      'Your current website and profiles, if you have them',
      'One or two websites you like, and why',
    ],
  } satisfies Invitation,
} as const;
