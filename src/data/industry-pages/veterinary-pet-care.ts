import type { IndustryPage } from '../detail-pages';

/** /industries/veterinary-pet-care/. Proposed copy (2026-11-20). */
export const veterinaryPetCare: IndustryPage = {
  slug: 'veterinary-pet-care',
  name: 'Veterinary & Pet Care',
  title: 'Clearer websites for the people caring for animals.',
  highlight: 'caring for animals.',
  description:
    'Websites for veterinary practices and pet care businesses: species and services, urgent information, practical access details, and booking details for boarding, grooming, and training.',
  metaTitle: 'Websites for Veterinary & Pet Care',
  metaDescription:
    'Websites, SEO, and email for veterinary and pet care businesses: species and services, urgent information, referrals, booking details, and seasonal reminders.',
  introduction: {
    eyebrow: 'Who this is for',
    heading: 'Built for clinics, hospitals, and the businesses around them.',
    lead: 'A pet owner choosing a regular vet, one with an animal in distress at night, and one following a referral are in different states of mind. The website has to serve all three.',
    paragraphs: [
      'We organize the site around species, services, and situations, with the practical details that reduce stress: parking, entrances, what to bring.',
    ],
    aside: {
      heading: 'Who this page is for',
      items: [
        {
          title: 'General practices',
          text: 'Companion animal clinics where the regular relationship is the business.',
        },
        {
          title: 'Emergency and specialty hospitals',
          text: 'Urgent and referral information matter more than routine booking.',
        },
        {
          title: 'Mixed and large animal practices',
          text: 'Species and visit arrangements unlike a small animal clinic.',
        },
        {
          title: 'Boarding, grooming, and training',
          text: 'Businesses that live on bookings, requirements, and seasonal demand.',
        },
      ],
    },
  },
  challenges: {
    heading: 'Where veterinary and pet care websites fall short',
    intro: 'Three patterns, and the response to each.',
    items: [
      {
        problem: 'Species and services left unclear',
        symptom:
          "'Full-service veterinary care', but a rabbit or horse owner cannot tell if you see their animal.",
        response:
          'Services organized by species and need, each stating what you do, what you refer out, and what a visit involves.',
      },
      {
        problem: 'Urgent information that is hard to reach in a panic',
        symptom:
          'Hours and after-hours arrangements are buried, so a frightened owner calls a closed line.',
        response:
          'A permanent, prominent place for your hours, what to do outside them, who to call, and where to go.',
      },
      {
        problem: 'Booking information that depends on a phone call',
        symptom:
          "Boarding requirements, grooming prices, and seasonal availability live in someone's head.",
        response:
          'A page per service with requirements, what to bring, how availability works, and the way to reserve, linked to your booking tool.',
      },
    ],
  },
  services: {
    heading: 'The services that fit veterinary and pet care',
    intro:
      'Accurate information first, then visibility, then communication that keeps clients on schedule.',
    items: [
      {
        card: 'wordpress-websites',
        relevance:
          'Species, services, providers, and locations as structured content the practice updates itself.',
      },
      {
        card: 'custom-websites',
        relevance:
          'For a single clinic or pet care business: a fast site with clear booking paths.',
      },
      {
        card: 'seo',
        relevance: 'Service and species pages matched to how owners search, plus local visibility.',
      },
      {
        card: 'email-automation',
        relevance:
          'Vaccination and wellness reminders, reservation confirmations, and seasonal communication, with consent.',
      },
    ],
  },
  module: {
    eyebrow: 'Three situations',
    heading: 'Routine care, an urgent night, or a referral',
    intro:
      'Three states of mind, each with a short path; nonclinical pet care gets its own booking details.',
    blocks: [
      {
        kind: 'paths',
        items: [
          {
            label: 'Routine care',
            title: 'Choosing a regular practice',
            text: 'Species seen, services, the team, what a first visit involves, and how to book.',
            action: 'Book a first appointment',
          },
          {
            label: 'Urgent',
            title: 'Something is wrong now',
            text: 'Hours, what to do outside them, the emergency number or nearest hospital, and directions. Big type, no scrolling.',
            action: 'Call now or find the emergency hospital',
          },
          {
            label: 'Referral',
            title: 'Sent by another vet',
            text: 'Specialties, how referrals are accepted, what records to bring, and what the first visit involves.',
            action: 'Complete the referral intake',
          },
        ],
      },
      {
        kind: 'directory',
        heading: 'Booking details for nonclinical pet care',
        intro: 'Boarding, grooming, daycare, and training live on reservations.',
        groups: [
          {
            title: 'Requirements',
            text: 'What must be true before a reservation.',
            items: ['Vaccination records', 'Assessment visits', 'Age and health requirements'],
          },
          {
            title: 'Seasonal availability',
            text: 'Holidays and summer fill first; the page says when to book.',
            items: ['Holiday booking windows', 'Peak-season reminders', 'Waitlist information'],
          },
        ],
      },
    ],
  },
  faqs: {
    heading: 'Questions from veterinary and pet care businesses',
    intro: 'What owners and practice managers ask.',
    items: [
      {
        question: 'How do you present different species and services?',
        answer:
          'Grouped by species and by need, so a cat, dog, or horse owner finds their path quickly.',
      },
      {
        question: 'How should urgent information work?',
        answer:
          'A fixed place on every page: your hours, what to do outside them, and the number or hospital to use.',
      },
      {
        question: 'Can the site connect to our booking tool?',
        answer:
          'It can link to the booking or practice management tool you use. Anything deeper depends on what the vendor supports.',
      },
      {
        question: 'How do we handle seasonal demand for boarding or grooming?',
        answer:
          'The service page explains when to book, and a reminder email goes to past clients ahead of busy periods, with consent.',
      },
    ],
  },
  invitation: {
    heading: 'Tell us about your practice or pet care business',
    text: 'Share the species and services you offer and how clients book; we will suggest the paths the site needs.',
    bring: [
      'Your website and booking or practice software',
      'The species you see and what you refer out',
      'How urgent cases are handled outside hours',
    ],
  },
};
