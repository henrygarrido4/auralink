import type { IndustryPage } from '../detail-pages';

/** /industries/dental/. Proposed copy (2026-11-20). */
export const dental: IndustryPage = {
  slug: 'dental',
  name: 'Dental',
  title: 'Make it easier to choose your practice and stay connected.',
  highlight: 'stay connected.',
  description:
    'Dental practice websites that help new patients choose you, show provider and service information clearly, and support the recall communication the practice has approved.',
  metaTitle: 'Websites for Dental Practices',
  metaDescription:
    'Websites, SEO, and email for dental practices: new-patient discovery, provider and service pages, accepted-plan information, and approved recall communication.',
  introduction: {
    eyebrow: 'Who this is for',
    heading: 'Two jobs: win the new patient, keep the current one.',
    lead: 'A dental website has two jobs that are easy to mix up: helping a new patient choose you, and helping an existing patient stay on schedule. We plan for both.',
    paragraphs: [
      'New patients want services, dentists, accepted plans, and how to book; existing patients want reminders, easy rescheduling, and information before a procedure.',
    ],
    aside: {
      heading: 'Who this page is for',
      items: [
        {
          title: 'General practices',
          text: 'Family dentistry, where new-patient flow and recall matter most.',
        },
        {
          title: 'Cosmetic and implant practices',
          text: 'Patients who research for weeks before a consultation.',
        },
        {
          title: 'Pediatric practices',
          text: 'Parents deciding for a child, asking about comfort and insurance.',
        },
        {
          title: 'Specialists',
          text: 'Orthodontists, periodontists, and oral surgeons who depend on referrals.',
        },
      ],
    },
  },
  challenges: {
    heading: 'Where dental websites lose patients',
    intro: 'Three patterns, and the response to each.',
    items: [
      {
        problem: 'Service pages that do not help a decision',
        symptom:
          "'Cosmetic dentistry' is one paragraph, so a patient researching implants cannot tell whether you do them.",
        response:
          'A page for each service patients research: what it is, who it suits, and what a consultation covers, in wording the practice approves and never with claims about results.',
      },
      {
        problem: 'Plan and payment information that is hard to find',
        symptom:
          'Accepted plans are missing or out of date, so the front desk repeats the answer all day.',
        response:
          'A clear accepted-plans and payment page, using exactly the information the practice supplies, updated in one place.',
      },
      {
        problem: 'Recall that depends on the front desk',
        symptom: 'Reminders go out when someone has time, and lapsed patients are never contacted.',
        response:
          'Where the practice approves it, recall and follow-up emails triggered from dates your practice management system can share, with consent recorded.',
      },
    ],
  },
  services: {
    heading: 'The services that fit a dental practice',
    intro:
      'A site the office keeps current, found by the patients you want, with recall that runs on time.',
    items: [
      {
        card: 'wordpress-websites',
        relevance:
          'Providers, services, locations, and accepted plans as structured content the office updates itself.',
      },
      {
        card: 'seo',
        relevance:
          'Service pages matched to how patients search for treatments, and local visibility where patients choose by neighbourhood.',
      },
      {
        card: 'email-automation',
        relevance:
          'Practice-approved recall reminders, pre-visit information, and follow-up after a consultation.',
      },
    ],
  },
  module: {
    eyebrow: 'Two journeys',
    heading: 'A new patient and a current patient need different paths',
    intro:
      'Two journeys, planned separately; an orthodontic variation shows how a longer treatment changes the shape.',
    blocks: [
      {
        kind: 'paths',
        items: [
          {
            label: 'New patient',
            title: 'From research to a first appointment',
            text: 'Service and provider pages answer the research, the plan page removes the usual doubt, and a short form asks only what booking needs.',
            action: 'Request a first appointment',
          },
          {
            label: 'Current patient',
            title: 'From one visit to the next',
            text: 'Recall reminders, pre-procedure information, and easy rescheduling, through channels the practice approves and the patient agreed to.',
            action: 'Confirm or reschedule a visit',
          },
        ],
      },
      {
        kind: 'journey',
        heading: 'An orthodontic journey, when it applies',
        steps: [
          {
            label: 'Consultation',
            title: 'Explain the options',
            text: 'What is assessed, the options in general terms, and what to expect.',
          },
          {
            label: 'Treatment',
            title: 'Keep the patient informed',
            text: "Appointment reminders and care information, timed to the practice's schedule.",
          },
          {
            label: 'Retention',
            title: 'Stay in touch after',
            text: 'Retainer check reminders and a clear way to ask questions.',
          },
        ],
        note: 'Illustrative. Treatment details, timing, and communication are set and approved by the practice.',
      },
    ],
  },
  faqs: {
    heading: 'Questions from dental practices',
    intro: 'What owners and office managers ask.',
    items: [
      {
        question: 'How does the site help us attract new patients?',
        answer:
          'By answering the pre-call questions: what you treat, who the dentists are, which plans you accept, and how to book.',
      },
      {
        question: 'Can you set up recall reminders?',
        answer:
          'Yes, where the practice approves it and your practice management system can share the dates, by email with consent recorded.',
      },
      {
        question: 'Do we need a page for every service?',
        answer:
          "One for each service patients research separately: implants, veneers, aligners, children's dentistry, emergencies. Routine services share a general dentistry page.",
      },
      {
        question: 'We have more than one location. How does that work?',
        answer:
          'Each gets a page with address, hours, parking, and its dentists, and the new-patient form lets the patient choose one.',
      },
    ],
  },
  invitation: {
    heading: 'Tell us about your practice',
    text: 'Share your services, locations, and how new patients reach you, and we will suggest the two journeys and what each needs.',
    bring: [
      'Your current website and practice management software',
      'The services you most want new patients to find',
      'How recall reminders are handled today',
    ],
  },
};
