import type { IndustryPage } from '../detail-pages';

/** /industries/technology-saas/. Proposed copy (2026-11-20). */
export const technologySaas: IndustryPage = {
  slug: 'technology-saas',
  name: 'Technology & SaaS',
  title: 'Turn product interest into a clearer path to adoption.',
  highlight: 'path to adoption.',
  description:
    'Marketing sites and lifecycle email for software companies: plain use cases, pricing clarity, demo or trial paths, and permission-based email from signup to adoption.',
  metaTitle: 'Websites for Technology & SaaS',
  metaDescription:
    'Marketing websites, lifecycle email, SEO, and AEO for software and SaaS companies: use cases, pricing clarity, trial and demo journeys, and activation email.',
  introduction: {
    eyebrow: 'Who this is for',
    heading: 'Built for the marketing site and the lifecycle, not the product itself.',
    lead: 'An evaluator wants to know what the software does for someone like them, what it costs, and how to try it. A trial user wants the first moment of value, fast.',
    paragraphs: [
      "We explain use cases in the customer's words, make pricing clear, and build the trial or demo path and the lifecycle email behind it.",
    ],
    aside: {
      heading: 'Who this page is for',
      items: [
        {
          title: 'Self-serve SaaS',
          text: 'Signups that activate on their own, with timely email.',
        },
        {
          title: 'Sales-led software',
          text: 'Demo requests, multi-stakeholder evaluations, and team-led onboarding.',
        },
        {
          title: 'Early-stage products',
          text: 'A first marketing site that explains the product clearly.',
        },
        {
          title: 'Marketing and growth leads',
          text: 'Whoever owns the site, the lifecycle, and the numbers.',
        },
      ],
    },
  },
  challenges: {
    heading: 'Where software marketing sites lose adoption',
    intro: 'Three patterns, and the response to each.',
    items: [
      {
        problem: 'Vague product messaging',
        symptom: "'The all-in-one platform for modern teams.' For whom? Instead of what?",
        response:
          'Use-case pages that state the job, the person, the before and after, and what the product replaces.',
      },
      {
        problem: 'Signup and pricing friction',
        symptom: "Pricing hides behind 'contact sales'; the trial wants a card and twelve fields.",
        response:
          'Pricing as clear as your model allows, a form that asks only what the next step needs, and what happens next.',
      },
      {
        problem: 'Inactive trials',
        symptom: 'People sign up, poke around once, and never return.',
        response:
          'A welcome that points to the first valuable action, then help triggered by what the user has and has not done.',
      },
    ],
  },
  services: {
    heading: 'The services that fit a software company',
    intro:
      "A clear marketing site, email that activates signups, and visibility for buyers' questions.",
    items: [
      {
        card: 'custom-websites',
        relevance:
          'A fast marketing site built around use cases, pricing, and the trial or demo path.',
      },
      {
        card: 'email-automation',
        relevance: 'Signup-to-activation journeys, trial nurture, onboarding, and reactivation.',
      },
      { card: 'seo', relevance: 'Use-case and comparison pages matched to how buyers search.' },
      {
        card: 'aeo-geo',
        relevance:
          'Direct answers to what evaluators ask, so assistants describe the product accurately.',
      },
    ],
  },
  module: {
    eyebrow: 'Two journeys',
    heading: 'Self-serve and sales-led need different paths',
    intro: 'Both journeys are illustrative, built from your own events and sales process.',
    blocks: [
      {
        kind: 'journey',
        heading: 'Self-serve: trial, activation, adoption',
        steps: [
          {
            label: 'Trial',
            title: 'Sign up with the least friction',
            text: 'A short signup and a welcome pointing to the first valuable action.',
          },
          {
            label: 'Activation',
            title: 'Reach the first moment of value',
            text: 'Email nudges triggered by what the user has and has not done.',
          },
          {
            label: 'Adoption',
            title: 'Make it part of the routine',
            text: 'The next use cases, the right plan, and reactivation for those who go quiet.',
          },
        ],
        note: 'Events, timing, and content are decided with you and depend on the data you can share.',
      },
      {
        kind: 'journey',
        heading: 'Sales-led: demo, evaluation, onboarding',
        steps: [
          {
            label: 'Demo',
            title: 'Request and prepare',
            text: 'A form that asks what sales needs, then a confirmation and what to expect.',
          },
          {
            label: 'Evaluation',
            title: 'Support the buying group',
            text: "Pages and emails for each stakeholder's questions: security, pricing, integration.",
          },
          {
            label: 'Onboarding',
            title: 'Start well',
            text: 'A welcome sequence that explains the steps and the first milestones.',
          },
        ],
        note: 'Your sales and success teams define the steps; the site and email support them.',
      },
      {
        kind: 'note',
        heading: 'What this is, and is not',
        paragraphs: [
          'Marketing-site and lifecycle work: the pages that sell the product and the email that moves a signup toward adoption, not the software itself. We say plainly when a step needs data you do not yet collect.',
        ],
      },
    ],
  },
  faqs: {
    heading: 'Questions from software companies',
    intro: 'What marketing and growth leads ask.',
    items: [
      {
        question: 'Should we offer a demo or a free trial?',
        answer:
          'Quick time to value suits a trial; several stakeholders or a security review suit a demo. Many offer both.',
      },
      {
        question: 'What data does lifecycle email need?',
        answer:
          'Signup and product events your systems can share, such as account created or key feature used, plus consent.',
      },
      {
        question: 'Can you work with our existing tools?',
        answer:
          'Yes, in the email and CRM platforms you already use, connected to the product events they can receive.',
      },
      {
        question: 'How do we measure activation?',
        answer:
          'You define the first valuable action, we agree the events that mark it, and the report tracks them.',
      },
    ],
  },
  invitation: {
    heading: 'Tell us how people buy your product',
    text: 'Share your product, how you sell, and what follows a signup or demo; we will suggest the structure and journeys.',
    bring: [
      'Your site and email or CRM platforms',
      'Whether you sell self-serve, sales-led, or both',
      'The product events your systems can share',
    ],
  },
};
