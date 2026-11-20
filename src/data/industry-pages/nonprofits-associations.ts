import type { IndustryPage } from '../detail-pages';

/** /industries/nonprofits-associations/. Proposed copy (2026-11-20). */
export const nonprofitsAssociations: IndustryPage = {
  slug: 'nonprofits-associations',
  name: 'Nonprofits & Associations',
  title: 'Help more people understand your mission and take part.',
  highlight: 'take part.',
  description:
    'Websites for nonprofits and associations: clear information and one action per audience, whether they give, seek services, join, volunteer, or attend, with communication a small team can sustain.',
  metaTitle: 'Websites for Nonprofits & Associations',
  metaDescription:
    'Websites, email, and SEO for nonprofits and associations: paths for giving, services, membership, volunteering, and events, with email a small team can run.',
  introduction: {
    eyebrow: 'Who this is for',
    heading: 'Built for small teams with many audiences.',
    lead: 'A nonprofit website serves a donor, a person seeking help, a prospective member, a volunteer, and an event attendee, often with one staff member responsible for all of it.',
    paragraphs: [
      'We organize the site by audience, explain the mission plainly, and lead each action directly into the platform you already use.',
    ],
    aside: {
      heading: 'Who this page is for',
      items: [
        {
          title: 'Service nonprofits',
          text: 'People seeking help and supporters funding it, kept apart.',
        },
        {
          title: 'Membership associations',
          text: 'Prospective and current members, benefits, renewals, and events.',
        },
        {
          title: 'Advocacy and community groups',
          text: 'Volunteers, actions, and supporters who want updates.',
        },
        {
          title: 'Executive directors and communications leads',
          text: 'The person or two who keep the site and email going.',
        },
      ],
    },
  },
  challenges: {
    heading: 'Where nonprofit websites lose supporters and participants',
    intro: 'Three patterns, and the response to each.',
    items: [
      {
        problem: 'Competing calls to action',
        symptom: 'Donate, join, volunteer, register, and subscribe all shout from one screen.',
        response:
          'One primary action per page, matched to its audience, with the others quieter. The home page routes each audience in the first screen.',
      },
      {
        problem: 'Difficult donation or registration steps',
        symptom:
          'The donate form asks too much, or event registration lives on a page nobody links to.',
        response:
          'Actions that lead directly into your donation, membership, or event platform, with the website explaining what the gift or membership supports.',
      },
      {
        problem: 'Fragmented communications',
        symptom:
          'A newsletter when there is time, renewals by hand, and no thank-you after an event.',
        response:
          'A communication plan by audience, run from your email platform: welcome, updates, renewals, and event follow-up, in a rhythm a small team can sustain.',
      },
    ],
  },
  services: {
    heading: 'The services that fit nonprofits and associations',
    intro:
      'A site the team can maintain, communication by audience, and visibility for your mission.',
    items: [
      {
        card: 'wordpress-websites',
        relevance:
          'Programs, events, people, and resources as structured content, with permissions for staff and volunteers.',
      },
      {
        card: 'email-automation',
        relevance:
          'Donor and member journeys, event follow-up, and segmented updates a small team can keep up.',
      },
      {
        card: 'seo',
        relevance:
          'Program and service pages matched to how people search for help and for causes.',
      },
    ],
  },
  module: {
    eyebrow: 'One action per audience',
    heading: 'Give, get help, join, volunteer, attend',
    intro:
      'Five audiences, five paths, each with one clear action, then an illustrative journey for a first-time donor.',
    blocks: [
      {
        kind: 'paths',
        items: [
          {
            label: 'Donors',
            title: 'Give',
            text: 'What a gift supports, described plainly, leading into your donation platform. No invented impact figures.',
            action: 'Make a gift',
          },
          {
            label: 'People seeking services',
            title: 'Get help',
            text: 'Programs, eligibility, how to access them, and who to contact, kept separate from fundraising.',
            action: 'Find the right program',
          },
          {
            label: 'Prospective members',
            title: 'Join',
            text: 'What membership includes in your terms, who it is for, and how to join.',
            action: 'Become a member',
          },
          {
            label: 'Volunteers',
            title: 'Volunteer',
            text: 'Open roles, what each involves, and how to sign up, with updates by email.',
            action: 'Sign up to volunteer',
          },
          {
            label: 'Attendees',
            title: 'Attend',
            text: 'Events with dates, locations, cost in your terms, and registration through your platform.',
            action: 'Register for an event',
          },
        ],
      },
      {
        kind: 'journey',
        heading: 'Illustrative journey: a first-time donor',
        steps: [
          {
            label: 'Trigger',
            title: 'A first gift',
            text: "The donation platform records the gift and the donor's consent to hear from you.",
          },
          {
            label: 'Action',
            title: 'A thank-you that says what it supports',
            text: 'A prompt, personal thank-you that explains in plain words what the gift goes toward.',
          },
          {
            label: 'Wait',
            title: 'An update on the work',
            text: 'Some weeks later, a short update on the program the donor supported.',
          },
          {
            label: 'Action',
            title: 'An invitation to go further',
            text: 'An invitation to volunteer, attend, or give again, as a choice, with an easy opt-out.',
          },
        ],
        note: 'Illustrative. Timing, content, and branches are decided with you; no impact figures or stories are implied.',
      },
    ],
  },
  faqs: {
    heading: 'Questions from nonprofits and associations',
    intro: 'What executive directors and communications leads ask.',
    items: [
      {
        question: 'Can you work with our donation platform?',
        answer:
          'Yes. The website explains what a gift supports and leads into the platform you already use. We do not handle payments.',
      },
      {
        question: 'How should membership work on the site?',
        answer:
          'As its own path: what membership includes, who it is for, and how to join, with renewal reminders by email.',
      },
      {
        question: 'How do we keep volunteers informed?',
        answer:
          'Volunteers who sign up join an email segment that receives role updates, shift reminders, and thanks.',
      },
      {
        question: 'Can our staff and volunteers edit the site?',
        answer:
          'Yes. Programs, events, people, and resources are structured content, and permissions let staff publish while volunteers draft.',
      },
    ],
  },
  invitation: {
    heading: 'Tell us about your mission and your audiences',
    text: 'Share who you serve, who supports you, and the platforms you use; we will suggest the paths and a rhythm your team can keep.',
    bring: [
      'Your website and donation or membership platforms',
      'The audiences you serve and what each should do',
      'How supporters hear from you today',
    ],
  },
};
