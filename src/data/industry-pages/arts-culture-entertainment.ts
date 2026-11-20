import type { IndustryPage } from '../detail-pages';

/** /industries/arts-culture-entertainment/. Proposed copy (2026-11-20). */
export const artsCultureEntertainment: IndustryPage = {
  slug: 'arts-culture-entertainment',
  name: 'Arts, Culture & Entertainment',
  title: 'Make your next event easier to discover and attend.',
  highlight: 'discover and attend.',
  description:
    'Websites for theatres, museums, galleries, festivals, and venues: programs, schedules, tickets, and visitor information that work on a phone, and audience communication from one season to the next.',
  metaTitle: 'Websites for Arts, Culture & Entertainment',
  metaDescription:
    'Websites, email, and SEO for arts, culture, and entertainment organizations: programs, schedules, ticketing paths, visitor information, and season email.',
  introduction: {
    eyebrow: 'Who this is for',
    heading: 'Built for the visitor planning tonight and the member planning the year.',
    lead: 'Someone deciding what to see this weekend needs the program, the dates, the venue, and a ticket link in a few taps. Someone who has come for years wants membership, education, or giving information.',
    paragraphs: [
      'We organize programs so events are easy to find, send ticketing to your system, and keep visitor information easy to reach at the door.',
    ],
    aside: {
      heading: 'Who this page is for',
      items: [
        {
          title: 'Theatres and performing arts',
          text: 'Seasons, productions, and ticketing that peaks in short windows.',
        },
        {
          title: 'Museums and galleries',
          text: 'Exhibitions, visitor information, memberships, and education programs.',
        },
        {
          title: 'Festivals and venues',
          text: 'Schedules, lineups, tickets, and on-the-day information.',
        },
        {
          title: 'Marketing and audience teams',
          text: 'The people who keep the calendar current.',
        },
      ],
    },
  },
  challenges: {
    heading: 'Where cultural websites lose the audience',
    intro: 'Three patterns, and the response to each.',
    items: [
      {
        problem: 'Scattered event details',
        symptom: 'The date on one page, the venue on another, the ticket link somewhere else.',
        response:
          'Events as structured content: one entry with dates, venue, times, pricing, accessibility, and the ticket action, shown consistently everywhere.',
      },
      {
        problem: 'Mobile ticketing friction',
        symptom: 'The ticket button leads to a desktop-era page, and the visitor gives up.',
        response:
          'A clear ticket action on every event that leads directly into your ticketing system at the right performance, with a phone path.',
      },
      {
        problem: 'Silence between seasons',
        symptom:
          "Last season's attendees hear nothing until the next brochure; members lapse quietly.",
        response:
          'A season-to-season email plan: thanks after attendance, announcements to people who asked, renewals timed to the membership, and segmented news.',
      },
    ],
  },
  services: {
    heading: 'The services that fit arts and culture organizations',
    intro:
      'A calendar the team keeps current, communication between seasons, and visibility for what is on.',
    items: [
      {
        card: 'wordpress-websites',
        relevance:
          'Events, programs, venues, and visitor information as structured content the marketing team updates.',
      },
      {
        card: 'email-automation',
        relevance:
          'Post-attendance thanks, season announcements, membership renewals, and segmented news.',
      },
      {
        card: 'seo',
        relevance:
          'Event and program pages search engines can read, with structured data for what is on.',
      },
    ],
  },
  module: {
    eyebrow: 'Season to season',
    heading: 'Discover, attend, reconnect',
    intro: 'An audience relationship runs in a loop, and the next season starts from the last.',
    blocks: [
      {
        kind: 'journey',
        heading: 'The audience loop',
        steps: [
          {
            label: 'Discover',
            title: 'Find what is on',
            text: 'Programs by date and type, with what, when, where, how much, and the ticket action on the listing.',
          },
          {
            label: 'Attend',
            title: 'Get there and enjoy it',
            text: 'Visitor information on the event page and in a confirmation email: venue, parking, accessibility, running time.',
          },
          {
            label: 'Reconnect',
            title: 'Stay in the conversation',
            text: 'A thank-you after the visit, an invitation to the next season, and membership or giving information for those who want more.',
          },
        ],
        note: 'An illustrative structure. No productions, sponsors, or audience figures are implied.',
      },
      {
        kind: 'paths',
        heading: 'Beyond attendance',
        items: [
          {
            label: 'Members',
            title: 'Membership',
            text: 'What membership includes in your terms, how to join, and renewal handled by email.',
            action: 'Join or renew',
          },
          {
            label: 'Learners',
            title: 'Education',
            text: 'Classes, workshops, and school programs with schedules, eligibility, and registration through your system.',
            action: 'Register for a program',
          },
          {
            label: 'Supporters',
            title: 'Giving',
            text: 'How to give and what it supports, leading to your donation platform. No invented impact figures.',
            action: 'Make a gift',
          },
        ],
      },
    ],
  },
  faqs: {
    heading: 'Questions from arts and culture organizations',
    intro: 'What marketing and audience teams ask.',
    items: [
      {
        question: 'Can the site connect to our ticketing system?',
        answer:
          'Yes, by leading from each event directly into it at the right performance. Deeper connections depend on what the vendor supports.',
      },
      {
        question: 'How does the events calendar work?',
        answer:
          'Events are structured content with dates, venue, times, pricing, and the ticket action; the calendar and event pages read from the same entry.',
      },
      {
        question: 'How should memberships appear?',
        answer:
          'As a separate path: what membership includes, how to join, and renewal reminders by email. Management stays in your system.',
      },
      {
        question: 'Can email be segmented by interest?',
        answer:
          'Yes. Subscribers choose or show what they care about, and announcements go only to the people who want them.',
      },
    ],
  },
  invitation: {
    heading: 'Tell us about your season',
    text: 'Share your programs, your ticketing system, and how you talk to your audience; we will suggest the calendar structure and the season plan.',
    bring: [
      'Your website and ticketing or membership systems',
      'The kinds of events and programs you present',
      'How audience members hear from you between seasons',
    ],
  },
};
