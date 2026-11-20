import type { ServicePage } from '../detail-pages';

/** /services/aeo-geo/: the AEO & GEO card. Proposed copy (2026-11-20). */
export const aeoGeo: ServicePage = {
  slug: 'aeo-geo',
  card: 'aeo-geo',
  title: 'Make your expertise easier to find and understand.',
  highlight: 'find and understand.',
  description:
    'Answer engine optimization (AEO) and generative engine optimization (GEO): answer-focused content and clear business information that search features and AI assistants can read and cite.',
  metaTitle: 'AEO & GEO: Answer and AI Search Visibility',
  metaDescription:
    'AEO and GEO services: audience-question mapping, direct-answer sections, clearer business information, accurate structured data, and a measurement plan.',
  introduction: {
    eyebrow: 'Who it helps',
    heading: 'For businesses whose customers ask questions before they choose.',
    lead: 'Answer engine optimization (AEO) makes your pages the kind that search features and assistants quote when someone asks a direct question. Generative engine optimization (GEO) makes your business easy for AI systems to understand and describe accurately. Both rest on clear, genuinely useful content.',
    paragraphs: [
      'Neither is a trick or a special file: Google states that its AI features need no extra markup, only indexable, helpful pages with structured data that matches them. The work extends SEO; if the site is not yet technically sound, we start there.',
    ],
    aside: {
      heading: 'When it fits',
      items: [
        {
          title: 'Customers research first',
          text: 'People compare, read, and ask questions before they contact a business like yours.',
        },
        {
          title: 'Your expertise is not on the page',
          text: 'You answer the same questions by phone or email that the website never addresses.',
        },
        {
          title: 'AI answers describe you poorly',
          text: 'Assistants get your services, location, or offer wrong, or leave you out.',
        },
        {
          title: 'Your SEO foundations are in place',
          text: 'The site is indexed and sound, and you want the next layer.',
        },
      ],
    },
  },
  deliverables: {
    heading: 'What an AEO & GEO engagement includes',
    intro: 'Content and information work you can see on the page, with an honest review plan.',
    items: [
      {
        title: 'Audience-question mapping',
        text: 'The questions customers ask before choosing, collected from your team, inquiries, and search data, and matched to pages.',
      },
      {
        title: 'Direct-answer sections',
        text: 'Question-style headings with a clear answer in the first sentences, so each can be quoted on its own and still be right.',
      },
      {
        title: 'Clearer service and business information',
        text: 'Who you are, what you do, for whom, and where, stated consistently across the site in plain text.',
      },
      {
        title: 'Accurate structured data',
        text: 'Schema markup for the organization, services, and visible FAQs, describing only what is on the page.',
      },
      {
        title: 'Crawlability review',
        text: 'A check that the important content is in the HTML, indexable, and not blocked, with fixes or a fix list.',
      },
      {
        title: 'A practical review plan',
        text: 'The signals we can observe: referrals from assistants where reported, impressions for question searches, and inquiries that mention AI.',
      },
    ],
    scopeNote:
      'No one can guarantee that an AI system will mention a business, and we do not. Assistants report little, so measurement is partial and the plan says so. Ongoing content work is agreed separately.',
  },
  module: {
    eyebrow: 'How it differs',
    heading: 'SEO, AEO, and GEO side by side, then an example',
    intro:
      'The three overlap more than they differ: the comparison shows where the emphasis shifts, and the example shows an answer section.',
    blocks: [
      {
        kind: 'comparison',
        heading: 'Where the emphasis shifts',
        columns: [
          {
            title: 'SEO',
            intro: 'Being found for a search.',
            items: [
              'Pages matched to search intent',
              'Technical health and speed',
              'Titles, descriptions, and internal links',
              'Measured through impressions, clicks, and inquiries',
            ],
          },
          {
            title: 'AEO & GEO',
            intro: 'Being understood and quoted.',
            items: [
              'Direct answers to specific questions',
              'Consistent facts about the business',
              'Structured data that matches the page',
              'Measured through the referral and visibility signals available',
            ],
          },
        ],
        note: 'All three need indexable pages, people-first content, and matching structured data, which is why this work starts with SEO foundations.',
      },
      {
        kind: 'example',
        heading: 'What an improved answer section looks like',
        label: 'Illustrative example',
        title: 'What is the difference between a custom website and a WordPress website?',
        paragraphs: [
          'A custom website is designed and coded for one business and is changed through an agreed arrangement; a WordPress website adds an editor so your team can publish and update pages themselves.',
          'Choose custom when the site changes rarely and speed matters most. Choose WordPress when regular publishing by several people matters more.',
        ],
        caption:
          'The question is the heading, the first sentence answers it, and the second gives the rule for deciding.',
      },
    ],
  },
  engagement: {
    heading: 'Four steps from questions to quotable pages',
    intro: 'You approve the question map and review every answer section before it goes live.',
    steps: [
      {
        title: 'Discovery',
        text: 'We collect the questions customers ask, review how the site and assistants describe you today, and check the technical foundations.',
      },
      {
        title: 'Plan',
        text: 'The question map, the pages to improve or add, the structured data plan, and an estimate.',
      },
      {
        title: 'Write and mark up',
        text: 'We write or rework answer sections and business information with your review, and add structured data that matches them.',
      },
      {
        title: 'Review',
        text: 'At agreed points we review the available signals, correct anything assistants still get wrong, and set the next questions.',
      },
    ],
  },
  faqs: {
    heading: 'Questions about AEO & GEO',
    intro: 'What owners ask about answer engines and AI search.',
    items: [
      {
        question: 'How does this relate to SEO?',
        answer:
          "It builds on it. SEO gets a page indexed and matched to a search; AEO and GEO make its answers clear enough to quote and the business's facts consistent enough to describe correctly.",
      },
      {
        question: 'Is this suitable for a small business?',
        answer:
          'Yes, especially one whose customers ask practical questions before choosing. Answering them plainly helps people, search features, and assistants alike.',
      },
      {
        question: 'Can you work with our existing content?',
        answer:
          'Usually. Existing pages often hold the answers but bury them. We restructure sections so the question is the heading and the answer comes first, then add structured data.',
      },
      {
        question: 'What can actually be measured?',
        answer:
          'Impressions and clicks for question-style searches, referrals from assistants where reported, and inquiries that mention an AI tool. The picture is partial, and we never promise a mention.',
      },
    ],
  },
  invitation: {
    heading: 'Tell us what customers ask you',
    text: 'Share the questions you answer most often by phone or email, and we will show you which ones the website should answer first.',
    bring: [
      'Your website address',
      'The five questions customers ask before they choose you',
      'Anything an assistant or search result currently gets wrong about you',
    ],
  },
};
