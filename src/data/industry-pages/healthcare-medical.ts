import type { IndustryPage } from '../detail-pages';

/** /industries/healthcare-medical/. Proposed copy (2026-11-20). */
export const healthcareMedical: IndustryPage = {
  slug: 'healthcare-medical',
  name: 'Healthcare & Medical',
  title: 'Help patients find the right care and the next step.',
  highlight: 'the next step.',
  description:
    'Websites for medical practices and clinics: clear provider and service information, locations, appointment access, and content written for patients, caregivers, and referring practices.',
  metaTitle: 'Websites for Healthcare & Medical Practices',
  metaDescription:
    'Websites and SEO for medical practices and clinics: provider and service pages, locations and hours, appointment paths, and communication in approved systems.',
  introduction: {
    eyebrow: 'Who this is for',
    heading: 'Built for practices where clarity is part of care.',
    lead: 'Patients arrive anxious, caregivers in a hurry, and referring professionals wanting a specialty list. The website works when each finds accurate information and a clear next step in seconds.',
    paragraphs: [
      "We focus on what is most often wrong: which providers see which conditions, each location's address and hours, and how to request an appointment.",
    ],
    aside: {
      heading: 'Who this page is for',
      items: [
        {
          title: 'Independent practices',
          text: 'One or a few providers whose patients must know what they treat.',
        },
        {
          title: 'Multi-location groups',
          text: 'Several offices whose hours, providers, and services must stay accurate.',
        },
        {
          title: 'Specialty clinics',
          text: 'Referral-dependent practices that need professional information too.',
        },
        {
          title: 'Practice managers',
          text: 'Whoever updates provider details and hours without a developer.',
        },
      ],
    },
  },
  challenges: {
    heading: 'Where practice websites fail patients',
    intro: 'Three patterns, and the response to each.',
    items: [
      {
        problem: 'Confusing navigation',
        symptom:
          'Services organized by department name, and providers listed without what they treat.',
        response:
          'Services organized by condition and need, and a page per provider with conditions treated, locations, and how to book.',
      },
      {
        problem: 'Outdated practical details',
        symptom: 'Hours changed, a provider moved, and nobody can update the page.',
        response:
          'Locations, hours, providers, and forms as structured content the practice manager edits, with one source per fact.',
      },
      {
        problem: 'Difficult appointment pathways',
        symptom:
          "'Call us' is the only option, or the form asks for clinical detail it should not.",
        response:
          'The path your practice supports on each page: a phone number, an approved form that asks only what scheduling needs, or a link to your scheduling system.',
      },
    ],
  },
  services: {
    heading: 'The services that fit a medical practice',
    intro: 'An accurate website first; visibility and communication build on it.',
    items: [
      {
        card: 'wordpress-websites',
        relevance:
          'For practices whose providers, locations, and services change: structured content the practice manager keeps current.',
      },
      {
        card: 'custom-websites',
        relevance:
          'For a single-location practice: a fast, simple site and a clear appointment path.',
      },
      {
        card: 'seo',
        relevance: 'Condition and service pages matched to how patients search.',
      },
      {
        card: 'email-automation',
        relevance:
          'Appointment and practice communications, within what your approved systems allow.',
      },
    ],
  },
  module: {
    eyebrow: 'Three audiences',
    heading: 'Patients, caregivers, and referring professionals each need a different first page',
    intro: 'Three kinds of visitor, each with a path of their own.',
    blocks: [
      {
        kind: 'paths',
        items: [
          {
            label: 'Patients',
            title: 'Find care and book',
            text: 'What you treat in plain words, which provider to see, what a first visit involves, and how to book.',
            action: 'Request an appointment or call the office',
          },
          {
            label: 'Caregivers',
            title: 'Arrange care for someone else',
            text: 'How to accompany a patient, the forms needed, accessibility at each location, and who to contact.',
            action: 'Download forms or contact the practice',
          },
          {
            label: 'Referring professionals',
            title: 'Refer with confidence',
            text: 'Specialties, providers, accepted referral methods, what to include, and how your office follows up.',
            action: 'Send a referral through your approved channel',
          },
        ],
      },
      {
        kind: 'note',
        heading: 'What stays in your systems',
        paragraphs: [
          'Scheduling, patient records, secure messaging, and reminders live in the systems your practice has approved; the website links to them without replacing them. Claims about treatments, outcomes, and credentials are published only as the practice approves.',
        ],
      },
    ],
  },
  engagement: {
    heading: 'How a practice website project runs',
    intro: 'The practice reviews every clinical statement before it is published.',
    steps: [
      {
        title: 'Discovery',
        text: 'Your services, providers, locations, how patients book today, and which systems the site must respect.',
      },
      {
        title: 'Plan',
        text: 'A structure for conditions, services, providers, and locations, the appointment paths, and an estimate.',
      },
      {
        title: 'Build and review',
        text: 'We build the templates and load content, with the practice approving wording as pages take shape.',
      },
      {
        title: 'Launch and maintain',
        text: 'Live, with the practice manager trained; we review what patients search for.',
      },
    ],
  },
  faqs: {
    heading: 'Questions from practices and clinics',
    intro: 'What practice owners and managers ask.',
    items: [
      {
        question: 'Can the website connect to our scheduling system?',
        answer:
          'It can link to your scheduling system or patient portal. Deeper connections depend on what the vendor supports and are scoped separately.',
      },
      {
        question: 'We have several locations. How do you keep them straight?',
        answer:
          'Each gets its own page with address, hours, parking, accessibility, and its providers, with each fact stored once.',
      },
      {
        question: 'Who reviews the medical content?',
        answer:
          'You do. Every clinical statement, credential, and treatment description is approved by the practice before publication.',
      },
      {
        question: 'How do we update provider details ourselves?',
        answer:
          'Providers, locations, and services are structured content with clear fields; the practice manager edits and publishes, with permissions by role.',
      },
    ],
  },
  invitation: {
    heading: 'Tell us about your practice',
    text: 'Share your locations, how patients book, and what visitors get wrong; we will suggest a structure that keeps information accurate.',
    bring: [
      'Your current website and the systems it links to',
      'The number of providers and locations',
      'The services patients most often ask about',
    ],
  },
};
