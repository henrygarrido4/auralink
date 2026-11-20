import type { ServicePage } from '../detail-pages';

/** /services/seo/: the SEO card. Proposed copy (2026-11-20). */
export const seo: ServicePage = {
  slug: 'seo',
  card: 'seo',
  title: 'Help the right customers find the right pages.',
  highlight: 'the right pages.',
  description:
    'Search engine optimization grounded in intent: a structure search engines can understand, useful service and product content, and technical fixes in the right order.',
  metaTitle: 'Search Engine Optimization (SEO)',
  metaDescription:
    'SEO for business websites: a starting-point review, keyword-to-page planning, technical fixes, titles and descriptions, internal links, and measurement.',
  introduction: {
    eyebrow: 'Who it helps',
    heading: 'For businesses whose customers search before they call.',
    lead: 'Search engine optimization (SEO) makes your website easy for search engines to understand and worth showing for the searches your customers make: each important page matched to a real intent, technical issues fixed, and content improved.',
    paragraphs: [
      'No one can guarantee a ranking, and we do not. We remove what stops good pages from being found and measure what changes. Local search, such as your Google Business Profile and location pages, is included where the scope calls for it.',
    ],
    aside: {
      heading: 'When it fits',
      items: [
        {
          title: 'You are invisible for your own services',
          text: 'Customers search for what you do and find competitors or directories instead.',
        },
        {
          title: 'A new or rebuilt site',
          text: 'A fresh site needs the right structure and redirects so it keeps what the old one had.',
        },
        {
          title: 'Pages exist but do not rank',
          text: 'The content is there, but titles, structure, and internal links do not make its purpose clear.',
        },
        {
          title: 'You want to measure, not guess',
          text: 'You want to know which pages bring inquiries and what to improve next.',
        },
      ],
    },
  },
  deliverables: {
    heading: 'What an SEO engagement includes',
    intro: 'A one-time foundation, with ongoing work agreed separately.',
    items: [
      {
        title: 'Starting-point review',
        text: 'How search engines see the site today: indexing, crawl issues, speed, structure, content gaps, and how the key pages perform.',
      },
      {
        title: 'Keyword-to-page planning',
        text: 'A map from the searches your customers make to the page that should answer each one, so pages do not compete.',
      },
      {
        title: 'Technical fixes within scope',
        text: 'Corrections to indexing, redirects, metadata, structured data, page speed, and mobile issues, prioritized by impact.',
      },
      {
        title: 'Titles, descriptions, and internal links',
        text: 'Titles and descriptions written for the searcher, and links between pages that show search engines which ones matter.',
      },
      {
        title: 'Content recommendations',
        text: 'A plain list of pages to improve, add, or merge, with what each should cover and why.',
      },
      {
        title: 'Agreed measurement',
        text: 'Search Console and analytics set up or checked, a baseline recorded, and a simple report format agreed.',
      },
    ],
    scopeNote:
      'New content, further technical fixes, and regular reviews are agreed separately. Results depend on competition, your market, and the content you publish; we never promise a ranking or a timeframe for one.',
  },
  module: {
    eyebrow: 'The roadmap',
    heading: 'Work in the order that pays off first',
    intro:
      'Foundations before new content, so the content can be found; important pages before coverage, so the pages that bring inquiries improve first.',
    blocks: [
      {
        kind: 'journey',
        heading: 'A prioritized roadmap',
        steps: [
          {
            label: 'Phase 1',
            title: 'Fix the foundations',
            text: 'Assessed: indexing, crawl errors, redirects, speed, mobile rendering, duplicate pages. Delivered: fixes, or a prioritized fix list for your developer.',
          },
          {
            label: 'Phase 2',
            title: 'Improve the important pages',
            text: 'Assessed: the pages that should bring inquiries: intent match, titles, headings, content, links. Delivered: rewritten metadata, structural changes, and content edits or briefs.',
          },
          {
            label: 'Phase 3',
            title: 'Build relevant coverage',
            text: 'Assessed: searches you have no page for and questions customers ask. Delivered: a content plan with page briefs, and new pages where in scope.',
          },
          {
            label: 'Phase 4',
            title: 'Review the results',
            text: 'Assessed: impressions, clicks, and inquiries against the baseline. Delivered: a plain review and the next priorities.',
          },
        ],
        note: 'What is assessed and delivered, not a prediction of rankings. Phases can overlap; the plan says which are in scope.',
      },
      {
        kind: 'note',
        heading: 'What we do not do',
        paragraphs: [
          'We do not buy links, spin content, stuff keywords, or build pages for search engines rather than people; those tactics risk penalties. Nor do we report rankings as the goal: what matters is whether the right pages are found and visitors become inquiries.',
        ],
      },
    ],
  },
  engagement: {
    heading: 'Four steps from review to measured change',
    intro: 'You see the review and the plan before any change is made to the site.',
    steps: [
      {
        title: 'Discovery',
        text: 'We learn what you sell, where, and to whom, and look at how the site is found today.',
      },
      {
        title: 'Review and plan',
        text: 'The starting-point review, the keyword-to-page map, and a prioritized plan with an estimate.',
      },
      {
        title: 'Implement',
        text: 'We make the fixes and page improvements in scope, or hand clear instructions to your developer, and publish content briefs.',
      },
      {
        title: 'Measure and refine',
        text: 'After a period we agree, we compare the measures against the baseline and set the next priorities.',
      },
    ],
  },
  faqs: {
    heading: 'Questions about SEO',
    intro: 'What owners ask before SEO work begins.',
    items: [
      {
        question: 'How long does SEO take to work?',
        answer:
          'It depends on your market, the competition, and the state of the site, so we do not promise a timeframe. Technical fixes usually show sooner than content and authority.',
      },
      {
        question: 'We are rebuilding our website. When should SEO happen?',
        answer:
          'Before and during the rebuild, not after. Planning the structure, URLs, redirects, and page intents as part of the rebuild protects what the old site had.',
      },
      {
        question: 'Do we need local SEO or broader SEO?',
        answer:
          'If customers choose you by area, local search matters most: your Google Business Profile, location pages, and consistent details. Otherwise topic and service pages matter more.',
      },
      {
        question: 'What exactly do we get, and how do we know it worked?',
        answer:
          'The review, the keyword-to-page map, the fixes or fix list, rewritten metadata, content recommendations, and a measurement setup. You compare search impressions, clicks, and inquiries against the baseline.',
      },
    ],
  },
  invitation: {
    heading: 'Tell us what customers search for',
    text: 'Share your website and the services or products that matter most, and we will look at how it is found today and say where to start.',
    bring: [
      'Your website address',
      'The services, products, or areas you most want to be found for',
      'Access to Search Console or analytics, if you have them',
    ],
  },
};
