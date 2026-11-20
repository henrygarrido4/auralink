import type { IndustryPage } from '../detail-pages';

/** /industries/manufacturing-industrial/. Proposed copy (2026-11-20). */
export const manufacturingIndustrial: IndustryPage = {
  slug: 'manufacturing-industrial',
  name: 'Manufacturing & Industrial',
  title: 'Put the information technical buyers need within reach.',
  highlight: 'within reach.',
  description:
    'Websites for manufacturers and industrial companies: capabilities, applications, and approved specifications organized for engineering, procurement, and operations, with RFQ forms that qualify an inquiry.',
  metaTitle: 'Websites for Manufacturing & Industrial',
  metaDescription:
    'Websites, SEO, and email for manufacturers and industrial companies: capabilities, approved specifications and downloads, buyer-role paths, and RFQ pathways.',
  introduction: {
    eyebrow: 'Who this is for',
    heading: 'Built for buyers who read the specification before they call.',
    lead: 'An engineer checking tolerances, a buyer comparing suppliers, and an operations lead asking about lead times need different information. Buried in a brochure PDF, it sends them elsewhere.',
    paragraphs: [
      'We organize capabilities, applications, and approved specifications so each role finds what it needs, with downloads search engines can read too.',
    ],
    aside: {
      heading: 'Who this page is for',
      items: [
        {
          title: 'Contract manufacturers and job shops',
          text: 'Capabilities, materials, tolerances, and a quote process buyers can start.',
        },
        {
          title: 'Product manufacturers',
          text: 'Catalogues, specifications, applications, and distributor or direct paths.',
        },
        {
          title: 'Industrial service providers',
          text: 'Maintenance, installation, or engineering services with technical scope.',
        },
        {
          title: 'Sales and marketing leads',
          text: 'Whoever needs the website to support a long sale.',
        },
      ],
    },
  },
  challenges: {
    heading: 'Where industrial websites lose technical buyers',
    intro: 'Three patterns, and the response to each.',
    items: [
      {
        problem: 'Technical information that is hard to find',
        symptom:
          'Specifications in a long PDF, capabilities as a list of nouns, applications unexplained.',
        response:
          "Capabilities by process and material with the specifications you approve, applications in the buyer's terms, and downloads by revision.",
      },
      {
        problem: 'RFQ forms that ask the wrong things',
        symptom: "'Tell us about your project' in one box, then ten questions from the estimator.",
        response:
          'An RFQ form shaped by what your estimators need: quantities, materials, drawings, tolerances, timeline, and application.',
      },
      {
        problem: 'Follow-up that forgets the long cycle',
        symptom: "A quote goes out, the buyer's project slips six months, and nobody checks in.",
        response:
          'Follow-up paced for a long cycle: confirmation, a check-in at the interval you set, and capability news, with consent.',
      },
    ],
  },
  services: {
    heading: 'The services that fit manufacturers and industrial companies',
    intro:
      'Technical information for each buyer, visibility for your capabilities, and paced follow-up.',
    items: [
      {
        card: 'custom-websites',
        relevance:
          'For a shop with defined capabilities: a fast, precise site and a strong RFQ path.',
      },
      {
        card: 'wordpress-websites',
        relevance:
          'For manufacturers whose staff update catalogues, specifications, revisions, and news.',
      },
      {
        card: 'seo',
        relevance:
          'Capability, material, and application pages matched to how engineers and buyers search.',
      },
      {
        card: 'email-automation',
        relevance: 'RFQ acknowledgement and follow-up, distributor updates, and application news.',
      },
    ],
  },
  module: {
    eyebrow: 'Three buyer roles',
    heading: 'Engineering, procurement, and operations ask different questions',
    intro: 'Each role answered in its own terms; the RFQ pathway shows what earns a useful quote.',
    blocks: [
      {
        kind: 'paths',
        items: [
          {
            label: 'Engineering',
            title: 'Will it work?',
            text: 'Processes, materials, tolerances, approved certifications, and technical application examples, with downloads.',
            action: 'Download specifications or ask a question',
          },
          {
            label: 'Procurement',
            title: 'Can we buy it well?',
            text: 'Capacity, lead times in your terms, quality processes, minimums, and how quoting works.',
            action: 'Request a quote',
          },
          {
            label: 'Operations',
            title: 'Will it keep working?',
            text: 'Support, maintenance, spare parts, documentation, and who to contact after delivery.',
            action: 'Contact support or request documentation',
          },
        ],
      },
      {
        kind: 'journey',
        heading: 'An example RFQ pathway',
        steps: [
          {
            label: 'Scope',
            title: 'What is being made',
            text: 'Part or service, quantity, and application, so the estimator knows which process applies.',
          },
          {
            label: 'Specification',
            title: 'The technical detail',
            text: 'Materials, tolerances, finishes, standards, and file uploads, so the first reply is a quote.',
          },
          {
            label: 'Timing',
            title: 'When it is needed',
            text: 'Timeline and delivery location, so capacity and logistics can be checked first.',
          },
          {
            label: 'Reply',
            title: 'What happens next',
            text: "An immediate acknowledgement, the quote, then follow-up paced to the buyer's project.",
          },
        ],
        note: 'Illustrative. The fields are set with your estimators.',
      },
    ],
  },
  engagement: {
    heading: 'How an industrial website project runs',
    intro: 'Your technical and sales teams approve the structure and the published specifications.',
    steps: [
      {
        title: 'Discovery',
        text: 'Your capabilities, your buyers, what estimators need, and which material can be published.',
      },
      {
        title: 'Plan',
        text: 'The architecture by buyer role, the RFQ form, the downloads structure, and an estimate.',
      },
      {
        title: 'Build',
        text: 'We build the templates, structure the specifications and downloads, and set up the RFQ.',
      },
      {
        title: 'Launch and refine',
        text: 'Live with inquiry tracking; we review which capabilities draw inquiries.',
      },
    ],
  },
  faqs: {
    heading: 'Questions from manufacturers and industrial companies',
    intro: 'What sales and marketing leads ask.',
    items: [
      {
        question: 'How much technical content should we publish?',
        answer:
          'As much as you approve and buyers need to qualify themselves. Proprietary detail stays behind the RFQ.',
      },
      {
        question: 'Can the site handle our catalogue and specification downloads?',
        answer:
          'Yes. Products, specifications, and documents become structured content with revisions, organized by product family and application.',
      },
      {
        question: 'How do RFQs reach our estimators?',
        answer:
          'The form collects what estimators need, including file uploads, and routes to the right person.',
      },
      {
        question: 'How does follow-up work for long sales cycles?',
        answer:
          'Acknowledgement, the quote, a check-in at the interval you set, and capability news; sales can stop it for any buyer.',
      },
    ],
  },
  invitation: {
    heading: 'Tell us what you make and who buys it',
    text: 'Share your capabilities, your buyers, and what estimators need to quote; we will suggest the structure and the RFQ path.',
    bring: [
      'Your website and any spec sheets',
      'The capabilities you most want inquiries for',
      'What an estimator needs to quote',
    ],
  },
};
