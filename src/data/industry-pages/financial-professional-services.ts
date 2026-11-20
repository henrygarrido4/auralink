import type { IndustryPage } from '../detail-pages';

/** /industries/financial-professional-services/. Proposed copy (2026-11-20). */
export const financialProfessionalServices: IndustryPage = {
  slug: 'financial-professional-services',
  name: 'Financial & Professional Services',
  title: 'Make your expertise easy to evaluate before the first call.',
  highlight: 'before the first call.',
  description:
    'Websites for advisors, accountants, consultants, and other professional firms: services, client fit, qualifications, process, and next steps, so prospects can evaluate you first.',
  metaTitle: 'Websites for Financial & Professional Services',
  metaDescription:
    'Websites, SEO, AEO, and email for financial and professional services firms: service pages, a client-fit guide, an onboarding pathway, and client communication.',
  introduction: {
    eyebrow: 'Who this is for',
    heading: 'Built for firms chosen on trust, before the first meeting.',
    lead: 'A prospective client evaluates an advisor, an accountant, or a consultant long before they call: who you serve, what you do, your qualifications, how you work, and the first steps.',
    paragraphs: [
      "We explain services and client fit plainly and describe the process from inquiry to onboarding. Statements about credentials, fees, and compliance are the firm's.",
    ],
    aside: {
      heading: 'Who this page is for',
      items: [
        {
          title: 'Financial advisors and planners',
          text: 'Clients evaluating fit and trust, with regulatory care.',
        },
        {
          title: 'Accounting and tax firms',
          text: 'Deadline-driven inquiries and recurring client communication.',
        },
        {
          title: 'Consultants and specialist firms',
          text: 'Considered decisions where process and expertise must be visible.',
        },
        {
          title: 'Firm principals and operations leads',
          text: 'The people who approve content and manage onboarding.',
        },
      ],
    },
  },
  challenges: {
    heading: 'Where professional services websites lose the right clients',
    intro: 'Three patterns, and the response to each.',
    items: [
      {
        problem: 'Generic positioning',
        symptom:
          "'Trusted advisors delivering tailored solutions' says nothing about whether you serve people like them.",
        response:
          'A client-fit guide and service pages that say who you serve, what you do not do, and what engaging you involves.',
      },
      {
        problem: 'Unclear onboarding',
        symptom: 'The prospect does not know what happens after they call.',
        response:
          "An inquiry-to-onboarding pathway on the site: the steps, what each requires, and what the client receives, in the firm's words.",
      },
      {
        problem: 'Existing clients mixed with prospects',
        symptom:
          'Current clients hunt for the portal and deadline reminders among marketing pages.',
        response:
          'A client path on every page to the portal, documents, and deadlines, separate from the prospect journey.',
      },
    ],
  },
  services: {
    heading: 'The services that fit financial and professional firms',
    intro:
      'Fit and process explained, visibility for what prospects search, and client communication.',
    items: [
      {
        card: 'wordpress-websites',
        relevance:
          'Services, people, insights, and client resources as structured content the firm updates itself.',
      },
      {
        card: 'seo',
        relevance:
          'Service and specialty pages matched to how prospects search, with local visibility.',
      },
      {
        card: 'aeo-geo',
        relevance:
          'Plain answers to the questions prospects ask, so assistants describe you accurately.',
      },
      {
        card: 'email-automation',
        relevance:
          'Onboarding sequences, deadline reminders, and client updates, segmented by client type.',
      },
    ],
  },
  module: {
    eyebrow: 'Fit, then process',
    heading: 'Help prospects decide whether you fit, then show them the path',
    intro: 'A client-fit guide saves time; the pathway turns a yes into a prepared first meeting.',
    blocks: [
      {
        kind: 'comparison',
        heading: 'A client-fit guide',
        intro: 'Two columns the firm fills in its own words. Illustrative headings only.',
        columns: [
          {
            title: 'We are a good fit when',
            items: [
              'Your situation matches the services we describe',
              'You want a defined process and clear communication',
              'You value the specialization we describe',
              'You can share the information the engagement requires',
            ],
          },
          {
            title: 'We may not be the right fit when',
            items: [
              'You need a service we do not offer',
              'Your matter sits in a jurisdiction or area we do not serve',
              'You want guarantees no professional can responsibly give',
              'You prefer a different working style',
            ],
          },
        ],
        note: 'The firm writes the real items. The guide claims no results and states no regulatory language.',
      },
      {
        kind: 'journey',
        heading: 'From inquiry to onboarding',
        steps: [
          {
            label: 'Inquiry',
            title: 'A short first message',
            text: "What the firm needs to assess fit and schedule, with the firm's statement on confidentiality.",
          },
          {
            label: 'Conversation',
            title: 'Fit and scope',
            text: "A first meeting that confirms fit, scope, and the firm's own statement on fees.",
          },
          {
            label: 'Agreement',
            title: 'Engagement terms',
            text: "How the engagement is agreed, in the firm's words, and what the client receives.",
          },
          {
            label: 'Onboarding',
            title: 'Getting started',
            text: 'Documents, access, and the first deliverables, with a welcome sequence by email.',
          },
        ],
        note: 'An illustrative pathway. The firm supplies every statement about fees, terms, and compliance.',
      },
    ],
  },
  faqs: {
    heading: 'Questions from financial and professional firms',
    intro: 'What principals and operations leads ask.',
    items: [
      {
        question: 'How do you present our specializations?',
        answer:
          'A page per service or specialty: who it is for, what it covers, and how the engagement works.',
      },
      {
        question: 'Who reviews the content for compliance?',
        answer:
          'The firm and its compliance process approve every statement about services, credentials, fees, and regulation. We write no performance claims.',
      },
      {
        question: 'Which inquiry tools can you work with?',
        answer:
          'The site can lead into your scheduling or intake tool, or provide a form that asks what the firm needs.',
      },
      {
        question: 'Can the site and email support existing clients?',
        answer:
          'Yes. A client path leads to the portal, documents, and deadlines, and email handles onboarding, reminders, and updates.',
      },
    ],
  },
  invitation: {
    heading: 'Tell us who you serve and how you work',
    text: 'Share your services, the clients you fit best, and how onboarding runs; we will suggest the fit guide and pathway.',
    bring: [
      'Your website and client portal or scheduling tools',
      'The services and client types you focus on',
      'How a new client is onboarded today',
    ],
  },
};
