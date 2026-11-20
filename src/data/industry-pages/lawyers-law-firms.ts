import type { IndustryPage } from '../detail-pages';

/** /industries/lawyers-law-firms/. Proposed copy (2026-11-20). */
export const lawyersLawFirms: IndustryPage = {
  slug: 'lawyers-law-firms',
  name: 'Lawyers & Law Firms',
  title: 'Help the right clients understand how your firm can help.',
  highlight: 'how your firm can help.',
  description:
    'Websites for law firms: practice areas explained plainly, jurisdictions and attorney information, consultation expectations, and intake paths that collect only what a first contact needs.',
  metaTitle: 'Websites for Lawyers & Law Firms',
  metaDescription:
    'Websites, SEO, and AEO for law firms: practice-area pages, jurisdictions, attorney profiles, consultation expectations, and intake paths the firm reviews.',
  introduction: {
    eyebrow: 'Who this is for',
    heading: 'Built for firms where the first contact sets the tone.',
    lead: 'Someone in an urgent situation, someone researching for weeks, and a professional referring a matter should each see quickly whether the firm handles their kind of matter, where, and what a consultation involves.',
    paragraphs: [
      "We explain practice areas plainly and build intake paths that ask only what a first contact needs. Every claim, fee statement, and form is subject to the firm's review.",
    ],
    aside: {
      heading: 'Who this page is for',
      items: [
        {
          title: 'Small and mid-sized firms',
          text: 'Several practice areas, a few attorneys, intake handled by staff.',
        },
        {
          title: 'Solo practitioners',
          text: 'One attorney who needs the site to qualify inquiries.',
        },
        {
          title: 'Boutique and specialty practices',
          text: 'Firms that depend on referrals and on being understood precisely.',
        },
        {
          title: 'Firm administrators',
          text: 'The people who update attorney profiles and manage intake.',
        },
      ],
    },
  },
  challenges: {
    heading: 'Where law firm websites lose the right clients',
    intro: 'Three patterns, and the response to each.',
    items: [
      {
        problem: 'Vague service descriptions',
        symptom:
          "'Comprehensive legal services' and a list of practice areas, with no word on what each covers.",
        response:
          'A page per practice area, in language the firm approves: the matters it covers, who it is for, the jurisdictions served, and what a consultation involves.',
      },
      {
        problem: 'Contact friction',
        symptom: 'A general form or a phone number, with no indication of what to expect.',
        response:
          'An intake path per practice area that collects only what a first contact needs and says what happens next.',
      },
      {
        problem: 'No next step after reading',
        symptom: 'The visitor does not know whether to call, what it costs, or what to bring.',
        response:
          "Consultation expectations on every practice-area page: what it covers, the firm's own statement on fees, and the one action to take.",
      },
    ],
  },
  services: {
    heading: 'The services that fit a law firm',
    intro:
      'An accurate site, visibility for your practice areas, and answers that reflect your expertise.',
    items: [
      {
        card: 'wordpress-websites',
        relevance:
          'Practice areas, attorneys, locations, and articles as structured content the firm updates itself.',
      },
      {
        card: 'custom-websites',
        relevance: 'For a solo or boutique practice: a fast, precise site and a clear intake path.',
      },
      {
        card: 'seo',
        relevance:
          'Practice-area and jurisdiction pages matched to how people search for legal help.',
      },
      {
        card: 'aeo-geo',
        relevance:
          "Plain-language answers to prospective clients' questions, written with the firm's review.",
      },
    ],
  },
  module: {
    eyebrow: 'Practice areas and the first contact',
    heading: 'Find the practice area, then understand the consultation',
    intro:
      'Navigation gets the visitor to the right practice area; a consultation pathway there says what happens next.',
    blocks: [
      {
        kind: 'paths',
        heading: 'Three kinds of visitor, three paths',
        items: [
          {
            label: 'Urgent',
            title: 'Something has happened',
            text: 'A marked path for time-sensitive matters: what to do now, how to reach the firm, what it will need.',
            action: 'Contact the firm about an urgent matter',
          },
          {
            label: 'Researching',
            title: 'Weighing options',
            text: 'Practice-area pages that explain the kind of matter, how the process works, and what a consultation covers.',
            action: 'Request a consultation',
          },
          {
            label: 'Referring',
            title: 'A professional with a matter',
            text: 'Practice focus, jurisdictions, how referrals are received, and who to contact.',
            action: 'Refer a matter',
          },
        ],
      },
      {
        kind: 'journey',
        heading: 'The consultation pathway',
        steps: [
          {
            label: 'Fit',
            title: 'Is this the right firm?',
            text: 'The matters covered and the jurisdictions served, so the visitor knows whether to proceed.',
          },
          {
            label: 'Intake',
            title: 'A short first contact',
            text: 'Only what the firm needs to check conflicts and schedule, with its statement on confidentiality.',
          },
          {
            label: 'Consultation',
            title: 'What it involves',
            text: "Format, duration, and the firm's own statement on fees, plus what to bring.",
          },
          {
            label: 'Next',
            title: 'What happens after',
            text: 'How the firm follows up and how an engagement begins, in its words.',
          },
        ],
        note: 'An illustrative structure. Fee information, claims, and form language are supplied or approved by the firm.',
      },
    ],
  },
  faqs: {
    heading: 'Questions from law firms',
    intro: 'What partners and administrators ask.',
    items: [
      {
        question: 'Does each practice area need its own page?',
        answer:
          'Each one a prospective client would search for separately should. Related areas can share a hub.',
      },
      {
        question: 'Can the site connect to our intake or case management system?',
        answer:
          'It can lead into your intake tool or provide a form that collects what a first contact needs.',
      },
      {
        question: 'Who approves the content?',
        answer:
          'The firm. Every claim, fee statement, credential, and form is approved before publication; we make no statements about outcomes.',
      },
      {
        question: 'How does local visibility work for a firm?',
        answer:
          'Practice-area pages that state the jurisdictions served, consistent office information, and a Google Business Profile. We do not promise rankings.',
      },
    ],
  },
  invitation: {
    heading: 'Tell us about your practice areas',
    text: 'Share the matters you handle, the jurisdictions you serve, and how intake works; we will suggest the structure for your review.',
    bring: [
      'Your website and intake process',
      'Your practice areas and jurisdictions',
      'What a first contact needs to collect',
    ],
  },
};
