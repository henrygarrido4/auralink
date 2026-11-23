import type { IconName } from '../lib/icons';
import { checkPageHead, type Engagement, type FaqList, type PageHead } from './detail-pages';
import { contactRoutes, primaryCta, type NavItem } from './site';

/**
 * The pricing page (/pricing/, src/pages/pricing/index.astro), from the owner's brief of
 * 2026-11-20, which gave the three website packages, their prices, inclusions, exclusions, and
 * estimated delivery ranges, the Website Care plan, the four steps, the payment terms, the
 * questions, and the closing call to action, as revised by the owner's brief of 2026-11-23: the
 * hero copy, each card's opening sentence, "Studio pick" for Business, Website Care at $149 a month
 * directly under the cards with its own copy and its scope in three groups, and the free
 * three-email welcome series taken out of Business and Growth; the owner's follow-up the same day
 * put a card for services beyond the packages under the comparison, in place of the welcome series.
 * Those figures and terms are the owner's; the section headings, introductions, and the answers to
 * the questions are proposed wording written to match them (docs/content-strategy.md, "Pricing
 * page").
 *
 * Nothing here is sold on the page itself: every button leads to the contact page. There is no
 * checkout, no subscription, and no price not shown on the page. Change a figure here and
 * the cards, the comparison table, and the structured data change together; the head's description
 * and the questions quote the prices in words, so change them too (tests/e2e/pricing.spec.ts fails
 * on a quoted price the page does not show). The public prices are for new clients; this site
 * holds no customer billing, so an existing client's plan is never changed from here.
 */

/** The document head and the hero (the brief of 2026-11-23; the yellow words are proposed). */
export const pricingHead: PageHead = {
  title: 'A website that fits your business and your budget.',
  highlight: 'your budget.',
  description:
    'Choose a one-time website package based on what your customers need to see and do. After launch, you can manage the site yourself or have us take care of it.',
  metaTitle: 'Website Pricing & Packages',
  metaDescription:
    'One-time website packages from Auralink Studio: Starter $1,095, Business $1,895, and Growth $2,895, with optional Website Care at $149 a month.',
};

/** The hero's eyebrow (the brief's, not the page's name in navigation) and its small note. */
export const pricingHero = {
  eyebrow: 'Website pricing',
  note: 'All packages include a first design preview within two weeks of receiving your deposit, project brief, and required materials.',
} as const;

/**
 * Where the package and Website Care buttons lead: the contact page, which opens on the booking
 * tab and offers the inquiry form beside it. Their labels name an offer, not a call or a message,
 * so they lead to the page itself rather than to one tab (`contactRoutes`).
 */
export const pricingInquiry: Required<NavItem> = {
  label: primaryCta.label,
  href: contactRoutes.page,
};

/** US dollars with no cents: `$1,095`. The same formatter serves the cards and the table. */
export const formatPrice = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);

export type PricingPackageId = 'starter' | 'business' | 'growth';

/** One of the three website packages. Everything in it is the owner's, from the briefs. */
export interface PricingPackage {
  readonly id: PricingPackageId;
  readonly name: string;
  /** The one-time project price in US dollars, separate from hosting. */
  readonly price: number;
  /** The card's opening sentence: what the website lets the client's customers see and do. */
  readonly summary: string;
  /** What is included, as the brief lists it. */
  readonly features: readonly string[];
  /** Revision rounds included; also a row of the comparison table. */
  readonly revisionRounds: number;
  /** The estimated delivery range, as written: an estimate, not a promise. */
  readonly delivery: string;
  /**
   * What the package does not cover, as one sentence fragment after "Not included:". Hosting is
   * left out here: one line under the cards says it for all three (`packagesSection.hosting`).
   */
  readonly excluded: string;
  /** The button's label. */
  readonly cta: string;
  /** The studio's pick: the card with the gold edge, the "Studio pick" badge, and the primary button. */
  readonly featured?: boolean;
}

/** The three packages, in display order, with Business featured in the middle. */
export const pricingPackages: readonly [PricingPackage, PricingPackage, PricingPackage] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 1095,
    summary:
      'A one-page website that shows customers what you do, where you work, and how to request a quote.',
    features: [
      '1 custom-designed page',
      'Mobile-friendly responsive design',
      'Services and business information',
      'Contact or quote request form',
      'Click-to-call functionality',
      'Basic on-page SEO',
      'Website traffic analytics',
      'Launch support',
      '1 revision round',
    ],
    revisionRounds: 1,
    delivery: '3–4 weeks',
    excluded:
      'additional pages, email automation, e-commerce, advanced integrations, or ongoing SEO.',
    cta: 'Start my website',
  },
  {
    id: 'business',
    name: 'Business',
    price: 1895,
    summary:
      'Give customers a closer look at your services, show examples of your work, and make it easy to get in touch.',
    features: [
      'Up to 5 custom-designed pages',
      'Everything in Starter',
      'Gallery or portfolio section',
      'Testimonials and trust-building content',
      'Enhanced contact and inquiry experience',
      'Basic keyword research and SEO foundations',
      '2 revision rounds',
    ],
    revisionRounds: 2,
    delivery: '4–6 weeks',
    excluded: 'e-commerce, custom software, paid marketing campaigns, or ongoing SEO.',
    cta: 'Grow my business',
    featured: true,
  },
  {
    id: 'growth',
    name: 'Growth',
    price: 2895,
    summary:
      'Give each service its own page, showcase completed projects, and track which pages lead to inquiries.',
    features: [
      'Up to 10 custom-designed pages',
      'Everything in Business',
      'Individual service pages',
      'Local keyword mapping where relevant',
      'Basic competitor research',
      'Conversion-focused page structure and tracking',
      'Project or case-study layouts',
      '3 revision rounds',
    ],
    revisionRounds: 3,
    delivery: '6–8 weeks',
    excluded: 'e-commerce, custom applications, ongoing SEO retainers, or advertising management.',
    cta: 'Build my growth site',
  },
];

/**
 * The packages section: the heading and its sentence (proposed), the label beside each price and
 * the featured card's badge (the brief of 2026-11-23), the one line about hosting under the cards,
 * which replaces the "Hosting not included" each card repeated (that brief; the wording is
 * proposed), and the note on timelines under it (the owner's, 2026-11-20).
 */
export const packagesSection = {
  eyebrow: 'Three website packages',
  heading: 'Three packages. One clear price each.',
  intro: 'Each price is a one-time fee for the design and build of your website.',
  /** Beside each price. */
  priceNote: 'One-time website build',
  /** On the featured card's top edge. */
  featuredLabel: 'Studio pick',
  hosting: {
    lead: 'Hosting is separate from every package.',
    text: 'After launch, choose Auralink Website Care or host your finished website with a compatible provider.',
  },
  note: 'Delivery timelines are estimates and depend on timely content, feedback, and approvals. The two-week preview is a design milestone, not a promise of a completed website. Complex requirements are quoted separately.',
} as const;

/** A cell of the comparison table: included, not included, or a short value. */
export type ComparisonValue = boolean | string;

/** One row of the comparison table: a feature and its value in each package, in order. */
export interface ComparisonRow {
  readonly feature: string;
  readonly values: readonly [ComparisonValue, ComparisonValue, ComparisonValue];
}

/** The comparison section's heading. The title is the brief's; the rest is proposed. */
export const comparisonSection = {
  eyebrow: 'Package comparison',
  heading: 'Compare your options.',
  intro: 'The three packages side by side, feature by feature.',
  /** The accessible name of the table. */
  caption: 'Starter, Business, and Growth compared feature by feature',
  /** The first column's heading. */
  featureHeading: "What's included",
} as const;

/** The rows the brief asks for, with the figures taken from the packages above. */
export const comparisonRows: readonly ComparisonRow[] = [
  {
    feature: 'One-time price',
    values: [
      formatPrice(pricingPackages[0].price),
      formatPrice(pricingPackages[1].price),
      formatPrice(pricingPackages[2].price),
    ],
  },
  { feature: 'Pages', values: ['1', 'Up to 5', 'Up to 10'] },
  { feature: 'Mobile-friendly custom design', values: [true, true, true] },
  { feature: 'Contact form', values: [true, 'Enhanced', 'Enhanced'] },
  { feature: 'Website traffic analytics', values: [true, true, true] },
  {
    feature: 'SEO level',
    values: [
      'Basic on-page',
      'Keyword research and foundations',
      'Local keyword mapping and competitor research',
    ],
  },
  { feature: 'Gallery or portfolio', values: [false, true, true] },
  { feature: 'Individual service pages', values: [false, false, true] },
  { feature: 'Conversion planning', values: [false, false, true] },
  {
    feature: 'Revision rounds',
    values: [
      String(pricingPackages[0].revisionRounds),
      String(pricingPackages[1].revisionRounds),
      String(pricingPackages[2].revisionRounds),
    ],
  },
  {
    feature: 'Estimated delivery',
    values: [pricingPackages[0].delivery, pricingPackages[1].delivery, pricingPackages[2].delivery],
  },
  { feature: 'Hosting included?', values: ['No', 'No', 'No'] },
];

/** One group of what Website Care covers: a title, a plain sentence, and a decorative icon. */
export interface CareGroup {
  readonly title: string;
  readonly text: string;
  readonly icon: IconName;
}

/**
 * Website Care, directly under the package cards since the owner's brief of 2026-11-23: one
 * optional plan at $149 a month, the public price for new clients, with the first 30 days after
 * launch included and continuing only if the client opts in; compatible external hosting stays the
 * alternative. The eyebrow, heading, description, plan name, price, price note, button, and the
 * three groups are the brief's; the opt-in sentence, the note on what is not included, and the
 * note on hosting elsewhere restate the conditions of the brief of 2026-11-20 in fewer words.
 */
export const websiteCare = {
  eyebrow: 'After launch',
  heading: "We'll take care of your website.",
  intro:
    "When your hours change, you have new photos, or your contact form needs attention, you'll have a developer who already knows your site.",
  plan: {
    name: 'Auralink Website Care',
    /** US dollars per month, for new clients. */
    price: 149,
    priceNote: 'First 30 days included after launch.',
    optIn:
      "It's optional: after those 30 days, Website Care continues only if you opt in. Buying a website never starts a subscription on its own.",
    groups: [
      {
        title: 'Hosting and maintenance',
        text: 'Managed hosting for supported builds, SSL, and routine platform maintenance where applicable.',
        icon: 'monitor-cog',
      },
      {
        title: 'Monitoring and support',
        text: 'Uptime and contact-form monitoring, backups where supported, and hosting-related technical support.',
        icon: 'activity',
      },
      {
        title: 'Small website updates',
        text: "Up to 30 minutes per billing month for changes like business hours, text, or photos. Unused time doesn't roll over.",
        icon: 'file-pen-line',
      },
    ] as readonly [CareGroup, CareGroup, CareGroup],
    /** What the plan leaves out, after "Not included." */
    excluded:
      'Larger changes, such as new pages, redesigns, advanced integrations, and major functionality, are quoted separately. Domain registration, paid platform fees, and third-party subscriptions are separate costs, and ongoing SEO is a separate service.',
    /** The alternative to the plan, after "Prefer another host?" */
    elsewhere:
      "Your finished website can be handed over for compatible external hosting. That provider's costs, and any setup on their platform, are separate.",
    cta: 'Ask about Website Care',
  },
} as const;

/**
 * The card under the comparison table for services beyond the packages, the owner's copy of
 * 2026-11-23 (in place of the welcome series): the heading and the sentence, the outline button to
 * the contact page's message tab, as it asks for a message, and the text link to the services hub.
 */
export const moreServices = {
  heading: 'Need something beyond these packages?',
  text: "We can help you sell online with Shopify, reach local customers through search and ads, or follow up with leads by email. Tell us what you have in mind and we'll put together a separate quote.",
  cta: { label: 'Ask about a service', href: contactRoutes.sendMessage },
  link: { label: 'Explore all services', href: '/services/' },
} as const;

/** The four steps (the brief's titles and sentences) with a proposed introduction. */
export const pricingProcess: Engagement = {
  heading: 'A straightforward process. A website built for you.',
  intro: 'From the first conversation to launch, you see the design early and approve each step.',
  steps: [
    {
      title: 'Tell us about your business',
      text: 'Share your goals, services, brand materials, content, and design preferences.',
    },
    {
      title: 'See your design direction',
      text: 'Receive an initial homepage design or prototype within two weeks of the completed project brief, deposit, and required materials.',
    },
    {
      title: 'Review and refine',
      text: 'Share feedback within the revision rounds included in your package, then proceed through development and testing.',
    },
    {
      title: 'Approve and launch',
      text: 'Settle the remaining project balance, approve the final site, and arrange launch or compatible handoff.',
    },
  ],
};

/** The payment terms under the steps, the brief's, with no checkout behind them. */
export const paymentNote = {
  title: 'Payment',
  text: 'A 50% deposit reserves the project and starts the work. The remaining 50% is due before launch or final handoff. Scope, ownership terms, and deliverables are confirmed in a signed agreement.',
} as const;

/**
 * The questions are the brief's, except the one about services beyond the packages, the owner's of
 * 2026-11-23 in place of the welcome series' question; the answers are proposed, written to agree
 * with the packages, the care plan, and the payment terms above, and promising no ranking or
 * outcome. That answer links to the services hub, as the owner asked.
 */
export const pricingFaqs: FaqList = {
  heading: 'Questions about pricing and scope',
  intro: 'Plain answers about payment, hosting, revisions, content, and ownership.',
  items: [
    {
      question: 'Is the website price a one-time payment?',
      answer:
        'Yes. Each package is a one-time price for the design and build of your website: $1,095 for Starter, $1,895 for Business, and $2,895 for Growth. It is paid in two parts, a 50% deposit to reserve the project and the remaining 50% before launch or final handoff. Hosting and Website Care are separate and optional.',
    },
    {
      question: 'Is hosting included?',
      answer:
        'No. The package prices cover the website itself. After launch, you can host it with a compatible provider of your choice, or choose Auralink Website Care at $149 a month: managed hosting for supported builds, SSL, routine platform maintenance where applicable, uptime and contact-form monitoring, backups where supported, hosting-related technical support, and up to 30 minutes of small updates per billing month. The first 30 days after launch are included, and the plan continues after that only if you opt in.',
    },
    {
      question: 'Can I host my website somewhere else?',
      answer:
        'Yes. Your completed website can be handed over for compatible external hosting. You choose and pay that provider, and any setup or migration work on their platform is scoped separately.',
    },
    {
      question: 'What happens after I get started?',
      answer:
        'We confirm the scope in a signed agreement and you pay the 50% deposit. You then complete a short project brief and send the materials we need, such as your logo, brand colours, photos, text, and the details of your services. Within two weeks of receiving those, you see your first design direction, and from there we move through your revision rounds, the build, and testing.',
    },
    {
      question: 'Will I see a design before the website is completed?',
      answer:
        'Yes. Every package includes a first design preview, an initial homepage design or prototype, within two weeks of receiving your deposit, completed project brief, and required materials. It is a design milestone for you to react to, not the finished website.',
    },
    {
      question: 'What counts as a revision round?',
      answer:
        "A revision round is one consolidated set of feedback on the current design or build, which we then apply. Starter includes one round, Business two, and Growth three. Gathering everyone's comments into one list for each round keeps the project moving; changes beyond the included rounds, or a change of direction after approval, are quoted separately.",
    },
    {
      question: 'What if I need more pages or features?',
      answer:
        'Tell us what you have in mind. Extra pages, e-commerce, custom applications, advanced integrations, email setup and automation, and ongoing SEO are quoted separately, either as an addition to a package or as a project of their own. If you already know you need more than a package covers, we quote the whole project up front.',
    },
    {
      question: 'Do you write all the website content?',
      answer:
        'Normally the words and photos come from you, because you know your business, services, and customers best. We shape your material into the page structure and tell you what each page needs. Copywriting, stock imagery, and photography can be scoped separately if you would like help with them.',
    },
    {
      question: 'Can I request a service separately?',
      answer:
        'Yes. Services beyond the packages, such as a Shopify store, local search and ads, or email follow-up for your leads, are quoted separately. Tell us what you have in mind.',
      link: moreServices.link,
    },
    {
      question: 'Who owns my website?',
      answer:
        'You do. Once the project is paid in full, the completed website, its design, and its content are handed over to you, subject to the licences of any third-party fonts, images, plugins, or platforms used in it, which stay with their owners. The scope, ownership terms, and deliverables are confirmed in your signed agreement.',
    },
    {
      question: 'Can you guarantee Google rankings?',
      answer:
        'No, and no honest provider can: search engines decide rankings. What we do is build on solid foundations, with fast, mobile-friendly pages, a clear structure, and the on-page SEO your package includes, so your website has a fair chance to be found. Ongoing SEO is a separate service, and we never promise a position or a result.',
    },
  ],
};

/**
 * The closing call to action: the brief's copy. Both buttons lead to the contact page; the
 * question goes to its "Send a message" tab, as its wording asks for one (2026-11-20).
 */
export const pricingCta = {
  eyebrow: "Let's build something great",
  heading: 'Ready for a website that works for your business?',
  text: "Tell us what you have in mind. We'll help you choose the right package and plan your next steps.",
  primary: { label: "Let's get started", href: pricingInquiry.href },
  secondary: { label: 'Have a question?', href: contactRoutes.sendMessage },
} as const;

/* The head is within the limits the SEO suite enforces, checked at build like the detail pages'. */
checkPageHead({ ...pricingHead, slug: 'pricing' });
