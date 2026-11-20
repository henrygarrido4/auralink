import type { IndustryPage } from '../detail-pages';

/** /industries/automotive/. Proposed copy (2026-11-20). */
export const automotive: IndustryPage = {
  slug: 'automotive',
  name: 'Automotive',
  title: 'Build a clearer path from interest to inquiry.',
  highlight: 'interest to inquiry.',
  description:
    'Websites and follow-up for automotive businesses: dealership inquiries, service bookings, collision estimates, detailing, and fleet work, each with its own path and timely follow-up.',
  metaTitle: 'Websites for Automotive Businesses',
  metaDescription:
    'Websites, email, and SEO for automotive businesses: vehicle inquiry and service appointment paths, areas served, practical answers, and timely follow-up.',
  introduction: {
    eyebrow: 'Who this is for',
    heading: 'Built around the kind of automotive business you run.',
    lead: 'A dealership, a repair shop, a collision centre, a detailer, and a fleet service all sell to drivers, but the inquiries could not be more different. The website has to know which business it is.',
    paragraphs: [
      'We explain your services, the areas you serve, and the practical questions drivers call to ask: what you work on, loaners or pickup, how to book.',
    ],
    aside: {
      heading: 'Who this page is for',
      items: [
        {
          title: 'Dealerships',
          text: 'Vehicle inquiries, test drives, and a service department of its own.',
        },
        {
          title: 'Independent repair and tire shops',
          text: 'Service bookings, diagnostics, and repeat customers who need reminders.',
        },
        {
          title: 'Collision and body shops',
          text: 'Estimate requests with photos, insurance questions, and status updates.',
        },
        {
          title: 'Detailing and fleet services',
          text: 'Packages, mobile or on-site work, and recurring business accounts.',
        },
      ],
    },
  },
  challenges: {
    heading: 'Where automotive websites lose the inquiry',
    intro: 'Three patterns, and the response to each.',
    items: [
      {
        problem: 'One path for two very different visitors',
        symptom:
          'A driver with a check-engine light and a buyer comparing vehicles land on the same page.',
        response:
          'Separate, obvious paths for vehicle inquiries and service appointments, each with its own pages, form, and follow-up.',
      },
      {
        problem: 'Practical questions left unanswered',
        symptom:
          'Hours, areas served, makes you work on, loaners, pickup: the things drivers call to ask.',
        response:
          'A practical answers section on each service page and a clear areas-served statement, kept current from one source.',
      },
      {
        problem: 'Slow or missing follow-up',
        symptom:
          'A Saturday quote request is answered Tuesday, and nobody mentions the next service interval.',
        response:
          'An immediate acknowledgement by email, a follow-up sequence in your voice, and maintenance reminders at the intervals you set, with consent.',
      },
    ],
  },
  services: {
    heading: 'The services that fit an automotive business',
    intro:
      'The right paths, follow-up that responds on time, and visibility for your services and areas.',
    items: [
      {
        card: 'custom-websites',
        relevance:
          'For a shop or detailer with a stable set of services: a fast site with the quote paths built in.',
      },
      {
        card: 'wordpress-websites',
        relevance:
          'For businesses with changing services, several locations, or staff who update offers themselves.',
      },
      {
        card: 'email-automation',
        relevance:
          'Quote follow-up, appointment confirmations, maintenance reminders, and review requests.',
      },
      {
        card: 'seo',
        relevance: 'Service pages matched to how drivers search, with areas served stated clearly.',
      },
    ],
  },
  module: {
    eyebrow: 'Two paths',
    heading: 'A vehicle inquiry and a service appointment are not the same visit',
    intro:
      'Each path has its own pages, form, and follow-up; a business that only sells, or only services, builds one.',
    blocks: [
      {
        kind: 'paths',
        items: [
          {
            label: 'Vehicle inquiry',
            title: 'From browsing to a conversation',
            text: 'What you offer, how to ask about a specific vehicle, and a short form with a quick reply.',
            action: 'Ask about a vehicle or book a test drive',
          },
          {
            label: 'Service appointment',
            title: 'From a problem to a booked visit',
            text: 'The service, the practical details, and a request form for the vehicle, the issue, and preferred times.',
            action: 'Request a service appointment or estimate',
          },
        ],
      },
      {
        kind: 'note',
        heading: 'About inventory and scheduling tools',
        paragraphs: [
          'Live inventory, availability, and online scheduling depend on the systems you already use and what their vendors allow. We link to them and scope any deeper connection separately. The paths above work without them: a clear form and a fast reply win most inquiries.',
        ],
      },
    ],
  },
  faqs: {
    heading: 'Questions from automotive businesses',
    intro: 'What owners and managers ask.',
    items: [
      {
        question: 'We are a dealership with a service department. One site or two?',
        answer:
          'One site with two clear paths. Vehicle inquiries and service each get their own pages, forms, and follow-up.',
      },
      {
        question: 'Can you connect the site to our existing systems?',
        answer:
          'The site can link to your scheduling, inventory, or CRM tools. Deeper connections depend on what each vendor supports and are scoped separately.',
      },
      {
        question: 'How does lead follow-up work?',
        answer:
          'An immediate acknowledgement, then a short email sequence in your voice that answers common questions. Your team can stop it for anyone.',
      },
      {
        question: 'We have several locations. How are they handled?',
        answer:
          'Each gets its own page with address, hours, the services offered there, and its own inquiry routing.',
      },
    ],
  },
  invitation: {
    heading: 'Tell us what kind of automotive business you run',
    text: 'Share whether you sell, service, or both, and how inquiries reach you; we will suggest the paths and follow-up that fit.',
    bring: [
      'Your website and the systems it links to',
      'The services or vehicles you most want inquiries for',
      'What happens after a quote request arrives',
    ],
  },
};
