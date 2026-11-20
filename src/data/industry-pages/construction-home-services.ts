import type { IndustryPage } from '../detail-pages';

/** /industries/construction-home-services/. Proposed copy (2026-11-20). */
export const constructionHomeServices: IndustryPage = {
  slug: 'construction-home-services',
  name: 'Construction & Home Services',
  title: "Make your next customer's first step easier.",
  highlight: 'first step easier.',
  description:
    'Websites and email for contractors and home service businesses: clear services and areas, easy ways to get in touch, and follow-up nobody has to remember.',
  metaTitle: 'Websites for Construction & Home Services',
  metaDescription:
    'Websites, SEO, and email follow-up for contractors and home service businesses: clear services and areas, fast mobile inquiries, and estimate follow-up.',
  moduleFirst: true,
  introduction: {
    eyebrow: 'Who this is for',
    heading: 'Built for the trades, where the first call decides the job.',
    lead: 'A homeowner with a problem decides in a minute whether to call you. The site has to show you do the work, cover their area, and how to reach you.',
    paragraphs: [
      'It also serves a burst pipe, a kitchen remodel, and a fortnightly lawn cut without mixing them up.',
    ],
    aside: {
      heading: 'Who this page is for',
      items: [
        { title: 'Owner-operators', text: 'You answer the phone and want only the right jobs.' },
        { title: 'Growing crews', text: 'Several trades, an office manager, and leads to route.' },
        { title: 'Seasonal businesses', text: 'Demand spikes with the weather.' },
        {
          title: 'Multi-service companies',
          text: 'Plumbing and HVAC, or landscaping and hardscape, under one brand.',
        },
      ],
    },
  },
  challenges: {
    heading: 'Where home service websites lose the job',
    intro: 'Three patterns, and the response to each.',
    items: [
      {
        problem: 'Unclear service information',
        symptom: "'Residential and commercial services', with no word on which jobs or where.",
        response:
          "A page per service you want more of, in the homeowner's words, with the area and the kind of job stated.",
      },
      {
        problem: 'Friction on a phone',
        symptom: 'A buried number, a twelve-question form, and a slow page on one bar.',
        response:
          'A tap-to-call button and a short form on every page, asking only the job, the area, and how to reach them.',
      },
      {
        problem: 'Estimates that go quiet',
        symptom: 'You send the quote and never hear back; nobody has time to chase.',
        response:
          'A short email follow-up after each estimate, in your voice, with an easy way to say yes or ask a question.',
      },
    ],
  },
  services: {
    heading: 'The services that fit a home service business',
    intro: 'The website and search visibility first, then follow-up email.',
    items: [
      {
        card: 'custom-websites',
        relevance: 'A fast, focused site for stable services, light enough for any phone.',
      },
      {
        card: 'wordpress-websites',
        relevance: 'For companies adding services, locations, or crew pages over time.',
      },
      { card: 'seo', relevance: 'Service and area pages planned around how homeowners search.' },
      {
        card: 'email-automation',
        relevance: 'Estimate follow-up, seasonal reminders, and review requests, sent on time.',
      },
    ],
  },
  module: {
    eyebrow: 'Three ways in',
    heading: 'One site, three kinds of customer',
    intro: 'Each visitor has a different urgency and gets a short path.',
    blocks: [
      {
        kind: 'paths',
        items: [
          {
            label: 'Right now',
            title: 'Urgent call',
            text: 'A leak, no heat, a door that will not close: your number, hours, and area above the fold.',
            action: 'Tap to call or send an inquiry',
          },
          {
            label: 'This season',
            title: 'Planned project',
            text: 'A remodel, a roof, a patio: this visitor compares and asks what an estimate involves.',
            action: 'Request an estimate',
          },
          {
            label: 'All year',
            title: 'Recurring service',
            text: 'Lawn care, pest control, cleaning, HVAC maintenance: a plan and an easy start.',
            action: 'Start a recurring inquiry',
          },
        ],
      },
      {
        kind: 'directory',
        heading: 'Trades this applies to',
        groups: [
          {
            title: 'Repair and essential systems',
            text: 'Availability, areas, and a direct inquiry path.',
            items: ['Plumbing', 'HVAC', 'Electrical', 'Garage Doors'],
          },
          {
            title: 'Construction and exterior projects',
            text: 'Scope and process explained for a useful estimate.',
            items: [
              'Roofing & Exteriors',
              'Remodeling & Builders',
              'Concrete & Hardscape',
              'Decks & Screened Porches',
              'Asphalt & Sealcoating',
            ],
          },
          {
            title: 'Outdoor and property care',
            text: 'One-time projects separated from recurring work, with seasonal emails.',
            items: [
              'Landscape & Outdoor',
              'Tree Service',
              'Pest Control',
              'Pressure Washing',
              'Cleaning',
            ],
          },
          {
            title: 'Specialist and other home services',
            text: 'The specific job, what a quote needs, the next step.',
            items: [
              'Restoration',
              'Painting',
              'Junk Removal & Hauling',
              'Solar',
              'Moving',
              'Handyman',
              'Home Inspection',
            ],
          },
        ],
      },
    ],
  },
  engagement: {
    heading: 'How a home services project runs',
    intro: 'You approve the plan before we build and the pages before launch.',
    steps: [
      {
        title: 'Discovery',
        text: 'Which jobs you want, where you work, how calls come in, what follows an estimate.',
      },
      {
        title: 'Plan',
        text: 'A page plan for services and areas, the inquiry paths, follow-up email, and an estimate.',
      },
      {
        title: 'Build',
        text: 'We build the pages, set up call and form paths, and connect follow-up email.',
      },
      {
        title: 'Launch and refine',
        text: 'Live with call and form tracking; we review which pages bring inquiries.',
      },
    ],
  },
  faqs: {
    heading: 'Questions from contractors and home service owners',
    intro: 'What owners ask before a project.',
    items: [
      {
        question: 'How do you handle service areas?',
        answer:
          'In plain text, with pages for the towns that matter most where local search is in scope.',
      },
      {
        question: 'We do several trades. Does each need its own page?',
        answer:
          'Each service you want more of should: homeowners search for the problem, not the company.',
      },
      {
        question: 'Can you improve our existing site instead of rebuilding?',
        answer:
          'Often. If the foundation is sound and the site performs on phones, we improve it; otherwise we recommend a rebuild.',
      },
      {
        question: 'How does follow-up on estimates work?',
        answer:
          'A thank-you with the quote, a check-in a few days later, and an easy way to ask a question.',
      },
    ],
  },
  invitation: {
    heading: 'Tell us about the jobs you want more of',
    text: 'Share your trade, your area, and how customers reach you; we will suggest the pages and paths that fit.',
    bring: [
      'The services you most want to grow',
      'The towns or areas you cover',
      'What happens after you send an estimate',
    ],
  },
};
