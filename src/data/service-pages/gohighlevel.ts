import type { ServicePage } from '../detail-pages';

/**
 * /services/gohighlevel/: the GoHighLevel card of the services page. Proposed copy (2026-11-20)
 * for a service approved for inclusion but not in the verified catalogue. GoHighLevel is a third
 * party's platform; the page describes its features only as far as the client's own plan and the
 * agreed scope allow, names no price, and claims no partnership with the platform. The feature
 * and texting-registration statements follow HighLevel's support articles as read that day
 * (docs/content-strategy.md).
 */
export const goHighLevel: ServicePage = {
  slug: 'gohighlevel',
  card: 'gohighlevel',
  title: 'Keep inquiries, follow-up, and bookings in one place.',
  highlight: 'in one place.',
  description:
    'A practical GoHighLevel setup: agreed forms, organized contacts, a pipeline that shows where each inquiry stands, booking calendars, and workflows that keep follow-up moving.',
  metaTitle: 'GoHighLevel Setup for Inquiries & Booking',
  metaDescription:
    'GoHighLevel setup for small businesses: agreed forms, contact organization, pipelines, calendars, workflows, notifications, testing, and handoff to your team.',
  introduction: {
    eyebrow: 'Who it helps',
    heading: 'For businesses that lose inquiries between the form and the follow-up.',
    lead: 'GoHighLevel is a platform for capturing inquiries, organizing contacts, following up by email and text, and taking bookings, in one account. We set it up for the way your business works.',
    paragraphs: [
      'A good setup uses the parts you need and leaves the rest off. We configure what the scope covers, within what your plan supports, and hand it over with the notes your team needs.',
    ],
    aside: {
      heading: 'When it fits',
      items: [
        {
          title: 'Inquiries arrive everywhere',
          text: 'Forms, calls, texts, and social messages land in different inboxes; some go unanswered.',
        },
        {
          title: 'Follow-up depends on memory',
          text: 'Whoever saw the message replies when they can; nobody knows what happened next.',
        },
        {
          title: 'Booking takes back-and-forth',
          text: 'Appointments take phone calls or emails when customers would rather pick a time.',
        },
        {
          title: 'You already pay for GoHighLevel',
          text: 'The account exists, but little of it is set up or used.',
        },
      ],
    },
  },
  deliverables: {
    heading: 'What a GoHighLevel setup includes',
    intro: 'Configured in your account, to an agreed scope, and handed over working.',
    items: [
      {
        title: 'Agreed forms',
        text: 'The inquiry, quote, or booking forms you need, built in the platform or embedded on your website, with fields agreed in advance.',
      },
      {
        title: 'Contact organization',
        text: 'Contacts tagged by source, service, and stage, with the fields follow-up depends on; existing contacts imported where you have consent.',
      },
      {
        title: 'Pipelines',
        text: 'One pipeline per kind of inquiry, with stages that match how your team works, from new to won or closed.',
      },
      {
        title: 'Calendars',
        text: 'Booking calendars for the services or people that take appointments, with availability, buffers, confirmations, and reminders.',
      },
      {
        title: 'Workflows and notifications',
        text: 'A reply when an inquiry arrives, a reminder before an appointment, a nudge when nobody has followed up, alerts to the right person.',
      },
      {
        title: 'Testing and handoff',
        text: 'Every form, workflow, and calendar tested with sample inquiries, then a walkthrough for your team and a short written guide.',
      },
    ],
    scopeNote:
      "GoHighLevel is a subscription you hold with the platform or a provider, paid separately from our setup fee. We configure what your plan includes and the scope covers. Texting to US numbers also needs carrier registration, run through the platform, approved by the carriers, and charged separately; calling and other connections follow the platform's rules. Later changes are agreed separately.",
  },
  module: {
    eyebrow: 'How a setup works',
    heading: 'From a new inquiry to a booked appointment',
    intro: 'One inquiry, step by step, and how this differs from email and automation.',
    blocks: [
      {
        kind: 'journey',
        heading: 'Illustrative workflow: one inquiry, start to finish',
        steps: [
          {
            label: 'Trigger',
            title: 'Inquiry received',
            text: 'A form is sent or a message arrives on a connected channel and becomes a contact and pipeline entry at once.',
          },
          {
            label: 'Organize',
            title: 'Contact organized',
            text: 'Tagged with source and service, the fields you need filled from the form, and the right person notified.',
          },
          {
            label: 'Act',
            title: 'Follow-up',
            text: 'An acknowledgement goes out at once, and a task makes sure a person follows up in time.',
          },
          {
            label: 'Convert',
            title: 'Booking',
            text: 'The customer picks a time from a calendar link; confirmations and reminders go out, and the stage moves on.',
          },
          {
            label: 'Handoff',
            title: 'Team handoff',
            text: 'Appointment, notes, and history sit on the contact record, so whoever meets the customer knows what was promised.',
          },
        ],
        note: "Illustrative, not a client's workflow. Channels and automations depend on your plan and on the permissions your contacts have given.",
      },
      {
        kind: 'note',
        heading: 'GoHighLevel setup or Email & Automation?',
        paragraphs: [
          'Our email and automation service plans the whole customer journey: who hears from you when, what each message says, how it looks, and how it is measured.',
          'This is the practical setup of one platform for the front of that journey: catching the inquiry, following up, and booking. Designed lifecycle email can come on top.',
        ],
      },
    ],
  },
  engagement: {
    heading: 'Four steps from your process to a working setup',
    intro: 'You approve the forms, stages, and every message before anything is switched on.',
    steps: [
      {
        title: 'Discovery',
        text: 'We map how inquiries reach you, who handles them, and what your plan includes.',
      },
      {
        title: 'Plan',
        text: 'The forms, fields, stages, calendars, workflows, and notifications in scope, their messages, and an estimate.',
      },
      {
        title: 'Build',
        text: 'We configure the account, connect the forms and channels your plan allows, write the messages with you, and import consented contacts.',
      },
      {
        title: 'Test and hand off',
        text: 'We test every path with sample inquiries, fix what the tests show, and walk your team through it.',
      },
    ],
  },
  faqs: {
    heading: 'Questions about GoHighLevel setup',
    intro: 'What owners ask before a platform setup.',
    items: [
      {
        question: 'We already have an account. Can you work in it?',
        answer:
          'Yes. We work in your account with a login you can remove, keep what works, and document what we change. If an agency holds it, we need its cooperation.',
      },
      {
        question: 'Does it connect to our website and other tools?',
        answer:
          'Website forms and booking links connect as part of the setup. Other connections depend on your plan; we confirm what is possible before promising it.',
      },
      {
        question: 'What does the software cost, and who pays?',
        answer:
          "The subscription, usage charges for texting, calling, or email, and the carrier registration fees are paid by you to the platform or your provider; our setup fee is separate. We do not quote the platform's prices.",
      },
      {
        question: 'Can we message imported contacts, and who owns the setup?',
        answer:
          'Only contacts who agreed to hear from you, by the channels they agreed to, with separate consent for marketing texts, and only once texting is registered. The account and everything in it are yours; after handoff your team runs it.',
      },
    ],
  },
  invitation: {
    heading: 'Tell us how inquiries reach you today',
    text: 'Share where inquiries come from, who answers them, and what should happen next, and we will outline the setup it needs.',
    bring: [
      'How inquiries arrive now: forms, phone, text, social messages',
      'Who follows up today, and what good follow-up looks like',
      'Whether you have a GoHighLevel account, and which plan',
    ],
  },
};
