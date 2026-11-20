import type { IndustryPage } from '../detail-pages';

/** /industries/education-community-organizations/. Proposed copy (2026-11-20). */
export const educationCommunityOrganizations: IndustryPage = {
  slug: 'education-community-organizations',
  name: 'Education & Community Organizations',
  title: 'Clearer information. Easier ways to get involved.',
  highlight: 'get involved.',
  description:
    'Websites for schools, learning centres, and community organizations: programs, eligibility, schedules, costs, deadlines, and registration steps, built so changing staff can keep them current.',
  metaTitle: 'Websites for Education & Community Organizations',
  metaDescription:
    'Websites, email, and SEO for education and community organizations: program information, eligibility and deadlines, registration paths, and a content handoff.',
  introduction: {
    eyebrow: 'Who this is for',
    heading: 'Built for programs that change and teams that change with them.',
    lead: "A family deciding whether a program fits, a participant checking this week's schedule, a volunteer looking for a shift, and a supporter wanting to help all arrive at the same site.",
    paragraphs: [
      'We organize programs around eligibility, schedules, costs, deadlines, and registration, so a prospective participant can decide and act, and whoever is on staff can keep it current.',
    ],
    aside: {
      heading: 'Who this page is for',
      items: [
        {
          title: 'Schools and learning centres',
          text: 'Admissions, programs, calendars, and current-family information.',
        },
        {
          title: 'Community and youth organizations',
          text: 'Programs, registration, volunteers, and supporters.',
        },
        {
          title: 'Training and continuing education',
          text: 'Courses with schedules, eligibility, costs, and enrollment.',
        },
        {
          title: 'Small staff teams',
          text: 'The people who inherit the website and must keep it accurate.',
        },
      ],
    },
  },
  challenges: {
    heading: 'Where education and community websites lose participants',
    intro: 'Three patterns, and the response to each.',
    items: [
      {
        problem: 'Fragmented program information',
        symptom:
          "Eligibility in one place, the schedule in a PDF, the deadline in someone's memory.",
        response:
          'Each program as one structured entry: who it is for, when it runs, what it costs, the deadline, and how to register.',
      },
      {
        problem: 'Registration that depends on a phone call',
        symptom: "'Call to register', or a form that collects a name and nothing else.",
        response:
          'A registration path per program: your system, linked at the right program, or a form that asks what staff need to enroll someone.',
      },
      {
        problem: 'A site nobody can maintain',
        symptom: 'The person who built it left, and no one knows how to change it.',
        response:
          'Structured content with clear fields, an editor anyone can learn, written ownership of each content type, and a handoff guide.',
      },
    ],
  },
  services: {
    heading: 'The services that fit education and community organizations',
    intro:
      'A site the team can maintain, communication for participants and supporters, and visibility for your programs.',
    items: [
      {
        card: 'wordpress-websites',
        relevance:
          'Programs, schedules, people, and resources as structured content, with a handoff written for changing staff.',
      },
      {
        card: 'email-automation',
        relevance:
          'Registration confirmations, program reminders, deadline notices, and volunteer and supporter updates.',
      },
      {
        card: 'seo',
        relevance:
          'Program pages matched to how families search, with eligibility and location information.',
      },
    ],
  },
  module: {
    eyebrow: 'Two participants, one handoff',
    heading: 'Prospective and current participants, and the team that keeps it running',
    intro:
      'A prospective participant needs to decide; a current one needs to act; the team needs to keep the site accurate.',
    blocks: [
      {
        kind: 'paths',
        items: [
          {
            label: 'Deciding',
            title: 'Prospective participants and families',
            text: 'Programs by age, level, or interest, with eligibility, schedule, cost, deadline, and registration on one page.',
            action: 'Register or request information',
          },
          {
            label: 'Attending',
            title: 'Current participants',
            text: "This week's schedule, updates, forms, and who to contact, separate from admissions.",
            action: 'View schedules and updates',
          },
          {
            label: 'Helping',
            title: 'Volunteers and supporters',
            text: 'Open roles, shift information, how to give, and what it supports. No invented impact figures.',
            action: 'Volunteer or give',
          },
        ],
      },
      {
        kind: 'note',
        heading: 'Content ownership and handoff',
        paragraphs: [
          'Every content type has a named owner role, not a person: who updates programs, who updates the calendar, who publishes news. When staff change, the role passes with a short guide and a walkthrough.',
        ],
        points: [
          'A content map naming the owner role for each type',
          'A short editing guide kept with the site',
          'Permissions set by role, so access follows the job',
        ],
      },
    ],
  },
  faqs: {
    heading: 'Questions from schools and community organizations',
    intro: 'What directors and coordinators ask.',
    items: [
      {
        question: 'How do we keep program information current?',
        answer:
          'Each program is one structured entry, edited in one place and shown everywhere it appears; the owner role updates it each term.',
      },
      {
        question: 'Can the site handle our calendar?',
        answer:
          'Yes. Events and sessions are structured entries with dates, times, locations, and their program, including recurring sessions.',
      },
      {
        question: 'Which registration tools can you work with?',
        answer:
          'The site leads into the registration system you already use at the right program, or provides a form that asks what staff need.',
      },
      {
        question: 'What happens when the person who manages the site leaves?',
        answer:
          'Content types have owner roles, the editing guide stays with the site, and permissions follow the role. The next person needs no developer.',
      },
    ],
  },
  invitation: {
    heading: 'Tell us about your programs and your team',
    text: 'Share what you offer, how people register, and who maintains the website; we will suggest a structure and a handoff that fits.',
    bring: [
      'Your website and registration system',
      'The programs you run and how often they change',
      'Who updates the website, and how often staff change',
    ],
  },
};
