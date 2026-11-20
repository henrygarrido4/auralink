import type { ServicePage } from '../detail-pages';

/** /services/email-marketing/: the Email & Automation card. Proposed copy (2026-11-20). */
export const emailAutomation: ServicePage = {
  slug: 'email-marketing',
  card: 'email-automation',
  title: 'Turn first-time visitors into customers who stay.',
  highlight: 'customers who stay.',
  description:
    'Email design and lifecycle automation: welcome, post-purchase, retention, and reactivation journeys with useful timing, sensible segmentation, and emails that render well everywhere.',
  metaTitle: 'Email Design & Lifecycle Automation',
  metaDescription:
    'Lifecycle email marketing and automation: journey planning, triggers and audiences, responsive templates, platform setup, testing, and agreed reporting.',
  introduction: {
    eyebrow: 'Who it helps',
    heading: 'For businesses whose customers come back, or should.',
    lead: 'Lifecycle email sends the right message when it is useful: a welcome at signup, help after a purchase, a reminder before a renewal, a nudge when a customer goes quiet. We plan the journeys and build the emails.',
    paragraphs: [
      'The work covers both email design and development, so every message looks right in every inbox, and automation, so messages go out on time without someone pressing send.',
    ],
    aside: {
      heading: 'When it fits',
      items: [
        {
          title: 'You have a list and no plan',
          text: 'Subscribers sign up, but hear from you rarely or only when there is a sale.',
        },
        {
          title: 'Customers buy or book again',
          text: 'Repeat purchases, renewals, memberships, or seasonal services make timing matter.',
        },
        {
          title: 'Follow-up is manual',
          text: 'Someone remembers to send the welcome or the reminder, or forgets.',
        },
        {
          title: 'Emails look inconsistent',
          text: 'Campaigns are built from scratch each time and render differently across devices.',
        },
      ],
    },
  },
  deliverables: {
    heading: 'What an email project includes',
    intro: 'From the first map of the journey to the report after it runs.',
    items: [
      {
        title: 'Journey planning',
        text: 'Who enters each journey, when, what each email says, and what happens next, agreed before design.',
      },
      {
        title: 'Trigger and audience definitions',
        text: 'The events and segments that start and shape each journey, such as a signup, a purchase, or a date.',
      },
      {
        title: 'Responsive email templates',
        text: 'Designed, coded, and tested to render well in the major email clients and on phones, with reusable modules.',
      },
      {
        title: 'Platform setup within scope',
        text: 'Automations, lists, and integrations configured in your platform, with the data connections each journey depends on.',
      },
      {
        title: 'Testing, permissions, and unsubscribe handling',
        text: "Rendering and link tests, consent recorded, and unsubscribe and preference options that meet the platform's requirements.",
      },
      {
        title: 'Reporting tied to agreed events',
        text: 'A simple report on the events you care about, such as clicks and completed actions.',
      },
    ],
    scopeNote:
      'Journeys depend on the customer data your systems can share, such as signups, purchases, or appointment dates. Platform subscriptions are paid to the platform; campaign management after setup is agreed separately.',
  },
  module: {
    eyebrow: 'An example journey',
    heading: 'A welcome journey, step by step',
    intro:
      'Each step has a trigger or a wait, and an action. Yours would use your own events, timing, and content.',
    blocks: [
      {
        kind: 'journey',
        heading: 'Illustrative workflow: a new subscriber welcome',
        steps: [
          {
            label: 'Trigger',
            title: 'Someone subscribes',
            text: 'A form on the website or at checkout adds the person to the list with their consent recorded.',
          },
          {
            label: 'Action',
            title: 'Welcome email',
            text: 'A short, branded email that says what to expect, points to the most useful page, and makes it easy to reply.',
          },
          {
            label: 'Wait and check',
            title: 'A few days later',
            text: 'If the person has not visited a key page or bought, the next email offers help; if they have, the journey skips ahead.',
          },
          {
            label: 'Action',
            title: 'Invite the next step',
            text: 'One clear action, such as booking, buying, or reading a guide, then regular communications.',
          },
        ],
        note: "Illustrative, not a client's journey. Timing, branches, and content are decided with you, and every step respects consent and preferences.",
      },
      {
        kind: 'paths',
        heading: 'Other journeys we plan',
        intro: 'The same method, applied to each stage of the relationship.',
        items: [
          {
            label: 'After a sale or booking',
            title: 'Post-purchase',
            text: 'Confirm, explain what happens next, help the customer get value, and ask for a review when appropriate.',
          },
          {
            label: 'Before they drift',
            title: 'Retention',
            text: 'Reminders before renewals, seasonal services, or reorders, timed to when the customer is likely to need you again.',
          },
          {
            label: "When they've gone quiet",
            title: 'Reactivation',
            text: 'A short series that checks in, offers something useful, and makes it easy to update preferences or leave the list.',
          },
        ],
      },
    ],
  },
  engagement: {
    heading: 'Four steps from first map to a running journey',
    intro: 'You approve the journey map before we build and each email before it is switched on.',
    steps: [
      {
        title: 'Discovery',
        text: 'We look at your customer lifecycle, the data you hold, the platform you use, and what you send today.',
      },
      {
        title: 'Plan',
        text: 'The journey map, the triggers and audiences, the templates needed, and an estimate for the setup.',
      },
      {
        title: 'Build',
        text: 'We design and code the templates, configure the automations, connect the data, and test rendering and timing.',
      },
      {
        title: 'Launch and refine',
        text: 'Journeys go live; we review the agreed report with you and adjust timing, content, or branches.',
      },
    ],
  },
  faqs: {
    heading: 'Questions about email and automation',
    intro: 'What owners ask before an email project.',
    items: [
      {
        question: 'Which email platforms do you work with?',
        answer:
          'The mainstream platforms used by small and mid-sized businesses, and the ecommerce-focused ones for stores. We build in yours if you have one, or recommend one.',
      },
      {
        question: 'Is our list ready for this?',
        answer:
          'When you know where each contact came from and that they agreed to hear from you. If not, the first step is a clean-up and proper signup forms.',
      },
      {
        question: 'What is the difference between a campaign and an automation?',
        answer:
          'A campaign is one email sent to many people at once, such as a newsletter; an automation is a sequence sent to one person at a time, triggered by something they did.',
      },
      {
        question: 'How is success measured, and who owns the setup?',
        answer:
          'We agree the events that matter before launch, such as clicks, bookings, or purchases, and report on those. The account, templates, and automations belong to you.',
      },
    ],
  },
  invitation: {
    heading: 'Tell us how customers come back',
    text: 'Share how people sign up and what happens after a sale or booking today, and we will sketch a journey map and say what data it needs.',
    bring: [
      'The platform you use, if any, and roughly how many contacts',
      'How people join your list today',
      'What a customer does after a first purchase or visit',
    ],
  },
};
