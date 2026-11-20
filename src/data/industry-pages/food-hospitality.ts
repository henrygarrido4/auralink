import type { IndustryPage } from '../detail-pages';

/** /industries/food-hospitality/. Proposed copy (2026-11-20). */
export const foodHospitality: IndustryPage = {
  slug: 'food-hospitality',
  name: 'Food & Hospitality',
  title: 'Help guests find you, plan their visit and come back.',
  highlight: 'come back.',
  description:
    'Websites for restaurants, cafés, caterers, and venues: menus and hours that read on a phone, reservations and ordering that lead into your tools, and event inquiries that gather what you need.',
  metaTitle: 'Websites for Food & Hospitality',
  metaDescription:
    'Websites, SEO, and email for restaurants, cafés, caterers, and venues: readable menus and hours, reservation and ordering paths, and event inquiries.',
  introduction: {
    eyebrow: 'Who this is for',
    heading: 'Built for the quick decision and the considered inquiry.',
    lead: 'A guest deciding where to eat tonight wants your menu, hours, location, and a way to book, on a phone, in seconds. An event planner wants dates, capacity, packages, and a conversation.',
    paragraphs: [
      'We make the quick information unmissable, send reservations and orders to the tools you use, and give event inquiries a form that collects what you need.',
    ],
    aside: {
      heading: 'Who this page is for',
      items: [
        {
          title: 'Restaurants and cafés',
          text: 'Guests deciding quickly, on phones, from a search or a map.',
        },
        {
          title: 'Caterers',
          text: 'Inquiries with dates, headcounts, and dietary needs.',
        },
        {
          title: 'Venues and private dining',
          text: 'Capacity, packages, and availability questions that start a conversation.',
        },
        {
          title: 'Multi-location groups',
          text: 'Several locations with different menus, hours, and booking links.',
        },
      ],
    },
  },
  challenges: {
    heading: 'Where hospitality websites lose guests',
    intro: 'Three patterns, and the response to each.',
    items: [
      {
        problem: 'Information that is hard to read on a phone',
        symptom: 'The menu is a PDF, hours are in an image, and the address is not a link.',
        response:
          'Menus as readable HTML the kitchen can update, hours and location as text map apps can read, and tap-to-call on every page.',
      },
      {
        problem: 'Scattered booking paths',
        symptom: 'Reservations on one platform, orders on another, gift cards on a third.',
        response:
          'One set of actions on every page, in a fixed order, each leading directly into the tool you use.',
      },
      {
        problem: 'Event inquiries that start with phone tag',
        symptom: "'Contact us for events' produces a vague email, then three rounds of questions.",
        response:
          'An event form that asks for the date, headcount, occasion, dietary needs, and budget range, so your first reply is a real answer.',
      },
    ],
  },
  services: {
    heading: 'The services that fit food and hospitality',
    intro:
      'Readable information and clear actions first; visibility and seasonal communication build on them.',
    items: [
      {
        card: 'wordpress-websites',
        relevance:
          'Menus, hours, locations, and events as structured content the team updates itself.',
      },
      {
        card: 'custom-websites',
        relevance: 'For a single restaurant or café with a stable menu: a fast, simple site.',
      },
      {
        card: 'seo',
        relevance:
          'Location and cuisine pages matched to how guests search, with consistent hours and address.',
      },
      {
        card: 'email-automation',
        relevance:
          'Seasonal menus, events, holiday booking reminders, and catering follow-up, with consent.',
      },
    ],
  },
  module: {
    eyebrow: 'Three actions',
    heading: 'Visit, order, or plan an event: each gets its own path',
    intro:
      'Every page offers the actions you support, in the same order, so a guest never hunts for the button.',
    blocks: [
      {
        kind: 'paths',
        items: [
          {
            label: 'Tonight',
            title: 'Visit or reserve',
            text: 'Menu, hours, location, and a reservation action that leads into your booking platform or phone line.',
            action: 'Reserve a table or get directions',
          },
          {
            label: 'Now',
            title: 'Order',
            text: 'Pickup or delivery through the ordering tool you use, with the menu matching the kitchen today.',
            action: 'Order for pickup or delivery',
          },
          {
            label: 'Later',
            title: 'Inquire about an event',
            text: 'Capacity, packages in your terms, and a structured inquiry form with an immediate acknowledgement.',
            action: 'Send an event inquiry',
          },
        ],
      },
      {
        kind: 'note',
        heading: 'Only the actions you offer',
        paragraphs: [
          'A café without reservations shows order and visit; a caterer shows inquire and a sample menu; a venue shows inquire and a tour request. Reservations, ordering, and payment stay in your platforms. A merchandise store is a separate decision, where Shopify fits.',
        ],
      },
    ],
  },
  faqs: {
    heading: 'Questions from restaurants, caterers, and venues',
    intro: 'What owners and managers ask.',
    items: [
      {
        question: 'How should our menu appear on the site?',
        answer:
          'As readable text the kitchen can update, not a PDF or an image, so it works on phones and in search. A printable PDF can sit alongside.',
      },
      {
        question: 'Can the site connect to our reservation and ordering tools?',
        answer:
          'Yes, by leading directly into the platforms you already use from every page. Anything deeper is scoped separately.',
      },
      {
        question: 'How do catering and event inquiries work?',
        answer:
          'A structured form asks for the date, headcount, occasion, dietary needs, and budget range, with an immediate acknowledgement.',
      },
      {
        question: 'Can you help with seasonal communication?',
        answer:
          'Yes. Seasonal menus, holiday booking reminders, and event announcements go to guests who asked to hear from you.',
      },
    ],
  },
  invitation: {
    heading: 'Tell us about your kitchen, venue, or catering',
    text: 'Share your locations, your booking and ordering tools, and how event inquiries reach you; we will suggest the actions and paths that fit.',
    bring: [
      'Your website and booking or ordering platforms',
      'Your menu and how often it changes',
      'How event or catering inquiries are handled',
    ],
  },
};
