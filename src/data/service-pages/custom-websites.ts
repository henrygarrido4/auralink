import type { ServicePage } from '../detail-pages';

/** /services/static-websites/: the Custom Websites card. Proposed copy (2026-11-20). */
export const customWebsites: ServicePage = {
  slug: 'static-websites',
  card: 'custom-websites',
  title: 'A website built around the way your business works.',
  highlight: 'the way your business works.',
  description:
    'Custom websites for focused business sites and landing pages: tailored journeys, responsive layouts, and fast pages, with no platform you do not need.',
  metaTitle: 'Custom Website Design & Development',
  metaDescription:
    'Custom, fast, responsive websites built around your business: page planning, tailored layouts, lead forms, agreed integrations, and search foundations.',
  introduction: {
    eyebrow: 'Who it helps',
    heading: 'For businesses that know what the site needs to do.',
    lead: 'A custom website is built by hand for your business: every page, layout, and form shaped around what your customers need to do, with no theme or page builder in the way.',
    paragraphs: [
      'It suits a focused business site or a landing page for one offer: light, fast, and easy to maintain, because it contains only what you use.',
    ],
    aside: {
      heading: 'When it fits',
      items: [
        {
          title: 'A focused business site',
          text: 'Services, about, contact, and a few supporting pages that change rarely.',
        },
        {
          title: 'A campaign landing page',
          text: 'One page, one offer, one action, for visitors from a specific source.',
        },
        {
          title: 'Performance matters',
          text: 'The fastest, lightest site possible, with nothing to maintain but the pages.',
        },
        {
          title: 'A specific user journey',
          text: 'Visitors follow a set sequence, such as choosing a service and requesting an estimate.',
        },
      ],
    },
  },
  deliverables: {
    heading: 'What a custom website project includes',
    intro: 'The parts of a project, scoped to your pages and goals.',
    items: [
      {
        title: 'Page planning',
        text: 'The pages visitors need, what each must answer, and where it leads next, mapped before design.',
      },
      {
        title: 'Custom responsive layouts',
        text: 'Designed for your content and tested at phone, tablet, and desktop widths, not adapted from a template.',
      },
      {
        title: 'Content structure',
        text: 'Headings, sections, and calls to action arranged so visitors find the answer and the next step.',
      },
      {
        title: 'Lead forms',
        text: 'Inquiry forms with clear labels, validation, and spam protection, delivered to the inbox or tool you choose.',
      },
      {
        title: 'Agreed integrations',
        text: 'Connections to tools you already use, such as booking, a newsletter list, or analytics, scoped at the start.',
      },
      {
        title: 'Search foundations and handoff',
        text: 'Clean HTML, metadata, a sitemap, fast loading, and a walkthrough of how to update text and request changes.',
      },
    ],
    scopeNote:
      'Content edits after launch run through an agreed arrangement: a short list of changes we make, or a light editing setup where the site allows one. Ongoing support is a separate written agreement.',
  },
  module: {
    eyebrow: 'Decision guide',
    heading: 'Custom website or editable CMS?',
    intro:
      'Both are good choices in different situations. See which column sounds like your business.',
    blocks: [
      {
        kind: 'comparison',
        heading: 'Which fits your business?',
        columns: [
          {
            title: 'A custom website fits when',
            items: [
              'Your pages change a few times a year, not weekly.',
              'Speed and simplicity matter more than self-service editing.',
              'You want a landing page for one offer or audience.',
              'You prefer a small, well-understood codebase over a platform.',
            ],
          },
          {
            title: 'An editable CMS fits when',
            items: [
              'Your team publishes articles, events, people, or resources regularly.',
              'Several people need to edit the site without a developer.',
              'You need many similar pages built from one template.',
              'You expect the site to grow in sections over time.',
            ],
          },
        ],
        note: 'Many businesses start with a custom site and move to WordPress when publishing becomes weekly; both routes are planned so content and design carry over.',
      },
      {
        kind: 'note',
        heading: 'What "custom" means here',
        paragraphs: [
          'The design and code are made for your business, not configured from a theme. Text and images can still be edited through an agreed arrangement, and the best custom sites are often the simplest: a few well-planned pages that load instantly and lead to one clear action.',
        ],
      },
    ],
  },
  engagement: {
    heading: 'Four steps from first call to launch',
    intro: 'You approve the plan before we build and the pages before they go live.',
    steps: [
      {
        title: 'Discovery',
        text: 'We talk through your business, your customers, what the site needs to do, and what has worked so far.',
      },
      {
        title: 'Plan',
        text: 'A page plan, a scope, and an estimate, naming each page, its purpose, and the forms and integrations included.',
      },
      {
        title: 'Build',
        text: 'We design and build the pages, share them for review, and refine copy and layout with you.',
      },
      {
        title: 'Launch and refine',
        text: 'The site goes live with analytics in place; we check how visitors use it and recommend small improvements.',
      },
    ],
  },
  faqs: {
    heading: 'Questions about custom websites',
    intro: 'What owners ask before choosing a custom build.',
    items: [
      {
        question: 'Can I edit the content myself?',
        answer:
          'Simple edits, yes, through an arrangement agreed at the start: a list you send us, or a light editing setup. For frequent editing, WordPress is the better choice.',
      },
      {
        question: 'How do I choose between a custom website and WordPress?',
        answer:
          'By how often the site will change and who will change it: a few updates a year by one person points to custom, weekly publishing by a team to WordPress.',
      },
      {
        question: 'Can you move my existing site over?',
        answer:
          'Yes. We keep what works, rewrite what does not, and set up redirects so existing links and search listings keep working.',
      },
      {
        question: 'What does a custom site cost to run?',
        answer:
          'A domain and hosting, with no platform licence to renew. Any support agreement you choose is the only other ongoing cost.',
      },
    ],
  },
  invitation: {
    heading: 'Tell us what the site needs to do',
    text: 'Share a little about your business and the pages you have in mind, and we will say plainly whether custom or WordPress fits better.',
    bring: [
      'Your current website address, if you have one',
      'What a visitor should be able to do',
      'Tools the site should connect to, such as booking or email',
    ],
  },
};
