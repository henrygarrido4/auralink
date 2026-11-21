import { checkPageHead, type Engagement, type FaqList, type PageHead } from './detail-pages';
import { primaryCta, type NavItem } from './site';

/**
 * The pricing page (/pricing/, src/pages/pricing/index.astro), from the owner's brief of
 * 2026-11-20, which gave the three website packages, their prices, inclusions, exclusions, and
 * estimated delivery ranges, the Website Care plan and its price, the welcome-series bonus, the
 * four steps, the payment terms, the questions, and the closing call to action. Those figures and
 * terms are the owner's; the section headings, introductions, and the answers to the questions are
 * proposed wording written to match them (docs/content-strategy.md, "Pricing page").
 *
 * Nothing here is sold on the page itself: every call to action leads to the inquiry page. There
 * is no checkout, no subscription, and no price not shown on the page. Change a figure here and
 * the cards, the comparison table, and the structured data change together.
 */

/** The document head and the hero. */
export const pricingHead: PageHead = {
  title: 'A website that fits your business. Pricing that makes sense.',
  highlight: 'Pricing that makes sense.',
  description:
    'From your first website to a more complete online presence, choose a package built around your goals. Clear one-time pricing, thoughtful design, and optional ongoing support.',
  metaTitle: 'Website Pricing & Packages',
  metaDescription:
    'Clear one-time website pricing from Auralink Studio: Starter $1,095, Business $1,895, Growth $2,895, with optional Website Care hosting at $79 a month.',
};

/** The hero's eyebrow (the brief's, not the page's name in navigation) and its small note. */
export const pricingHero = {
  eyebrow: 'Simple, transparent pricing',
  note: 'All packages include a first design preview within two weeks of receiving your deposit, project brief, and required materials.',
} as const;

/** Where every call to action on the page leads: the inquiry page, which exists. */
export const pricingInquiry: Required<NavItem> = {
  label: primaryCta.label,
  href: primaryCta.href ?? '/contact/',
};

/** US dollars with no cents: `$1,095`. The same formatter serves the cards and the table. */
export const formatPrice = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);

export type PricingPackageId = 'starter' | 'business' | 'growth';

/** One of the three website packages. Everything in it is the owner's, from the brief. */
export interface PricingPackage {
  readonly id: PricingPackageId;
  readonly name: string;
  /** The one-time project price in US dollars, separate from hosting. */
  readonly price: number;
  /** Who the package is for, in one sentence. */
  readonly audience: string;
  /** What is included, as the brief lists it. */
  readonly features: readonly string[];
  /** Revision rounds included; also a row of the comparison table. */
  readonly revisionRounds: number;
  /** The estimated delivery range, as written: an estimate, not a promise. */
  readonly delivery: string;
  /** What the package does not cover, as one sentence fragment after "Not included:". */
  readonly excluded: string;
  /** The button's label. */
  readonly cta: string;
  /** The highlighted package: the dark card with the "Most popular" badge. */
  readonly featured?: boolean;
}

/** The three packages, in display order, with Business highlighted in the middle. */
export const pricingPackages: readonly [PricingPackage, PricingPackage, PricingPackage] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 1095,
    audience: 'For new businesses that need a professional website to start attracting inquiries.',
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
      'additional pages, email automation, e-commerce, advanced integrations, ongoing SEO, or hosting.',
    cta: 'Start my website',
  },
  {
    id: 'business',
    name: 'Business',
    price: 1895,
    audience: 'For growing businesses that want a complete and credible online presence.',
    features: [
      'Up to 5 custom-designed pages',
      'Everything in Starter',
      'Gallery or portfolio section',
      'Testimonials and trust-building content',
      'Enhanced contact and inquiry experience',
      'Basic keyword research and SEO foundations',
      'Free 3-email welcome series setup',
      '2 revision rounds',
    ],
    revisionRounds: 2,
    delivery: '4–6 weeks',
    excluded: 'e-commerce, custom software, paid marketing campaigns, ongoing SEO, or hosting.',
    cta: 'Grow my business',
    featured: true,
  },
  {
    id: 'growth',
    name: 'Growth',
    price: 2895,
    audience: 'For established businesses with multiple services and more ambitious website needs.',
    features: [
      'Up to 10 custom-designed pages',
      'Everything in Business',
      'Individual service pages',
      'Local keyword mapping where relevant',
      'Basic competitor research',
      'Conversion-focused page structure and tracking',
      'Project or case-study layouts',
      'Free 3-email welcome series setup',
      '3 revision rounds',
    ],
    revisionRounds: 3,
    delivery: '6–8 weeks',
    excluded:
      'e-commerce, custom applications, ongoing SEO retainers, advertising management, or hosting.',
    cta: 'Build my growth site',
  },
];

/** The packages section's heading (proposed) and the note under the cards (the owner's). */
export const packagesSection = {
  eyebrow: 'Three website packages',
  heading: 'Three packages. One clear price each.',
  intro:
    'Each price is a one-time fee for the design and build of your website. Hosting is separate and optional.',
  /** Under each price. */
  priceNote: 'One-time price. Hosting not included.',
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
  { feature: 'Three-email welcome series', values: [false, true, true] },
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

/** One email of the complimentary welcome series. */
export interface WelcomeEmail {
  readonly title: string;
  readonly text: string;
}

/**
 * The complimentary three-email welcome series that comes with Business and Growth. The eyebrow,
 * heading, the three emails' titles, and the scope paragraph are the brief's; the lead sentence
 * and the sentence under each email are proposed.
 */
export const welcomeSeries = {
  eyebrow: 'A little extra to help you start',
  heading: 'Your website is just the beginning.',
  lead: 'Business and Growth packages include a complimentary three-email welcome series, so the people who sign up on your new website hear from you right away.',
  emails: [
    {
      title: 'Welcome and introduction',
      text: 'A warm first email that says who you are and what to expect.',
    },
    {
      title: 'Build trust and introduce services',
      text: 'A closer look at how you work and the services you offer.',
    },
    {
      title: 'Encourage an inquiry or next step',
      text: 'A clear invitation to get in touch, book, or visit.',
    },
  ] as readonly [WelcomeEmail, WelcomeEmail, WelcomeEmail],
  scope:
    'This bonus covers one audience, three emails, and basic automation setup on a compatible platform, subject to platform capabilities. Marketing emails go only to properly opted-in subscribers. Email platform fees, list building, additional automations, and ongoing email campaigns are not included.',
} as const;

/** A short titled statement beside the Website Care card. */
export interface CareTerm {
  readonly title: string;
  readonly text: string;
}

/**
 * Hosting and Website Care. The heading, the description, the plan's name, price, trial, and its
 * inclusions and limits are the brief's; the terms beside the card put the brief's conditions
 * (a separate one-time website purchase, explicit acceptance, external hosting allowed) into
 * three short statements.
 */
export const websiteCare = {
  eyebrow: 'Hosting & website care',
  heading: 'We keep your website running. You keep your business moving.',
  intro:
    'Get dependable hosting, routine maintenance, and a little extra help when you need to make changes.',
  plan: {
    name: 'Auralink Website Care',
    /** US dollars per month. */
    price: 79,
    trial: 'First 30 days included after website launch',
    includes: [
      'Managed website hosting for eligible supported builds',
      'SSL certificate',
      'Backups where supported by the hosting/platform setup',
      'Basic uptime and contact-form monitoring',
      'Routine security and platform maintenance where applicable',
      'Hosting-related technical support',
      'Up to 30 minutes of small content updates per billing month',
    ],
    limits: [
      'Unused editing time does not roll over',
      'New pages, redesigns, advanced integrations, and major functionality are quoted separately',
      'Domain registration, paid platform fees, third-party subscriptions, and ongoing SEO are not included',
    ],
    cta: 'Ask about Website Care',
  },
  terms: {
    heading: 'How Website Care works',
    items: [
      {
        title: 'Separate from your website',
        text: 'Website development is a one-time purchase. Website Care is a separate monthly plan, priced on its own.',
      },
      {
        title: 'Optional, and only when you say yes',
        text: 'Your first 30 days after launch are included. Continuing beyond that is your choice and must be accepted explicitly; buying a website never starts a subscription on its own.',
      },
      {
        title: 'Host elsewhere if you prefer',
        text: "Your completed website can be handed over for compatible external hosting. That provider's costs, and any setup on their platform, are separate.",
      },
    ] as readonly [CareTerm, CareTerm, CareTerm],
  },
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
 * The questions are the brief's; the answers are proposed, written to agree with the packages,
 * the care plan, and the payment terms above, and promising no ranking or outcome.
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
        'No. The package prices cover the website itself. Auralink Website Care, at $79 a month, adds managed hosting for eligible builds, an SSL certificate, backups and monitoring where the setup supports them, routine maintenance, hosting-related support, and up to 30 minutes of small content updates per billing month, with the first 30 days after launch included. It starts only if you choose it.',
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
        'Tell us what you have in mind. Extra pages, e-commerce, custom applications, advanced integrations, email automation beyond the welcome series, and ongoing SEO are quoted separately, either as an addition to a package or as a project of their own. If you already know you need more than a package covers, we quote the whole project up front.',
    },
    {
      question: 'Do you write all the website content?',
      answer:
        'Normally the words and photos come from you, because you know your business, services, and customers best. We shape your material into the page structure and tell you what each page needs. Copywriting, stock imagery, and photography can be scoped separately if you would like help with them.',
    },
    {
      question: 'What does the free three-email welcome series include?',
      answer:
        "With Business and Growth, we set up three automated emails for one audience on a compatible email platform: a welcome and introduction, a message that builds trust and introduces your services, and one that encourages an inquiry or next step. We write and design the emails and set up the basic automation, within what your platform supports. The platform's own fees, list building, further automations, and ongoing campaigns are not included, and the emails go only to subscribers who have properly opted in.",
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

/** The closing call to action: the brief's copy, with both buttons leading to the inquiry page. */
export const pricingCta = {
  eyebrow: "Let's build something great",
  heading: 'Ready for a website that works for your business?',
  text: "Tell us what you have in mind. We'll help you choose the right package and plan your next steps.",
  primary: { label: "Let's get started", href: pricingInquiry.href },
  secondary: { label: 'Have a question?', href: pricingInquiry.href },
} as const;

/* The head is within the limits the SEO suite enforces, checked at build like the detail pages'. */
checkPageHead({ ...pricingHead, slug: 'pricing' });
