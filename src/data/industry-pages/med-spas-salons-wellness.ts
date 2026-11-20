import type { IndustryPage } from '../detail-pages';

/** /industries/med-spas-salons-wellness/. Proposed copy (2026-11-20). */
export const medSpasSalonsWellness: IndustryPage = {
  slug: 'med-spas-salons-wellness',
  name: 'Med Spas, Salons & Wellness',
  title: 'A smoother path from discovering a service to booking it.',
  highlight: 'booking it.',
  description:
    'Websites for med spas, salons, and wellness studios: clear services, provider qualifications, durations, and the booking process, with follow-up that fits consultations, appointments, and memberships.',
  metaTitle: 'Websites for Med Spas, Salons & Wellness',
  metaDescription:
    'Websites, SEO, and email for med spas, salons, and wellness studios: service information, provider qualifications, booking paths, and repeat-visit follow-up.',
  introduction: {
    eyebrow: 'Who this is for',
    heading: 'Built for businesses where the booking is the business.',
    lead: 'Whether a visitor is considering an aesthetic treatment, booking a haircut, or comparing memberships, the website has one job: make the service clear and the booking easy.',
    paragraphs: [
      'We explain services plainly, present qualifications as the business supplies them, show durations and locations, and lead into the booking system you already use.',
    ],
    aside: {
      heading: 'Who this page is for',
      items: [
        {
          title: 'Med spas and aesthetic clinics',
          text: 'Consultation-led services where trust and qualifications decide.',
        },
        {
          title: 'Salons and barbershops',
          text: 'Appointment-led services where the menu and the booking link matter most.',
        },
        {
          title: 'Wellness and fitness studios',
          text: 'Membership-led businesses where a first visit leads to a plan.',
        },
        {
          title: 'Multi-service studios',
          text: 'Businesses that combine two of the above.',
        },
      ],
    },
  },
  challenges: {
    heading: 'Where spa, salon, and studio websites lose bookings',
    intro: 'Three patterns, and the response to each.',
    items: [
      {
        problem: 'Unclear offers',
        symptom:
          'Services listed by brand name or jargon, with no duration, no performer, and no comparable price.',
        response:
          "Each service in the visitor's words: what it is, who it is for, how long it takes, who performs it, and the price in your terms.",
      },
      {
        problem: 'Difficult booking',
        symptom:
          'One booking link opens a system that looks nothing like the site and starts over.',
        response:
          'A booking action on every service page that lands in your system at the right service, plus a phone path. Consultation-led services get a short request.',
      },
      {
        problem: 'Inconsistent follow-up',
        symptom:
          'A first-time client hears nothing until a promotion months later; memberships lapse quietly.',
        response:
          'Follow-up by service type: approved aftercare and rebooking prompts, a check-in after a consultation, and renewal reminders for members, with consent.',
      },
    ],
  },
  services: {
    heading: 'The services that fit spas, salons, and studios',
    intro: 'A clear menu and booking paths first; visibility and follow-up build on them.',
    items: [
      {
        card: 'wordpress-websites',
        relevance:
          'Services, providers, prices in your terms, and locations as structured content the front desk updates.',
      },
      {
        card: 'custom-websites',
        relevance:
          'For a single-location salon or studio with a stable menu: a fast site and one booking path.',
      },
      {
        card: 'seo',
        relevance:
          'Service pages matched to how people search for treatments and classes, with local visibility.',
      },
      {
        card: 'email-automation',
        relevance:
          'Rebooking prompts, approved aftercare, consultation follow-up, and membership renewals.',
      },
    ],
  },
  module: {
    eyebrow: 'Three service types',
    heading: 'The journey changes with the kind of service',
    intro: 'A consultation, an appointment, and a membership each start and continue differently.',
    blocks: [
      {
        kind: 'paths',
        items: [
          {
            label: 'Consultation-led',
            title: 'Clinical aesthetics and treatments',
            text: 'The treatment in general terms, who performs it, and what the consultation covers, for a visitor comparing providers.',
            action: 'Request a consultation',
          },
          {
            label: 'Appointment-led',
            title: 'Salon and barber services',
            text: 'The menu with durations and prices, the stylists, and a booking button that lands on the right service.',
            action: 'Book an appointment',
          },
          {
            label: 'Membership-led',
            title: 'Wellness and fitness',
            text: 'The plans explained plainly and a first class or session offered as the first step.',
            action: 'Start with a first visit',
          },
        ],
      },
      {
        kind: 'note',
        heading: 'What the site does not claim',
        paragraphs: [
          'Treatment outcomes, before-and-after results, and credentials appear only as the business supplies and approves them; the business is responsible for the accuracy of clinical claims. Booking, payment, and client records stay in your systems.',
        ],
      },
    ],
  },
  faqs: {
    heading: 'Questions from spas, salons, and studios',
    intro: 'What owners ask before a project.',
    items: [
      {
        question: 'Can the site work with our booking system?',
        answer:
          'Yes, by linking into it from each service page at the right service. Deeper connections depend on what it supports.',
      },
      {
        question: 'How much detail should each service page have?',
        answer:
          'Enough to decide and book: what it is, who it suits, duration, who performs it, price in your terms, and the booking action.',
      },
      {
        question: 'How do you help with repeat visits?',
        answer:
          'Follow-up by service type: a rebooking prompt timed to the service, approved aftercare, and a check-in after a consultation.',
      },
      {
        question: 'We sell memberships. Can the site and email support them?',
        answer:
          'The site explains the plans and offers the first step; email handles welcome, follow-up, and renewal reminders. Billing stays in your system.',
      },
    ],
  },
  invitation: {
    heading: 'Tell us about your services and how clients book',
    text: 'Share your menu, your booking system, and what happens after a first visit; we will suggest the journey for each service type.',
    bring: [
      'Your website and booking system',
      'Your service menu with durations',
      'How clients hear from you after a visit',
    ],
  },
};
