import type { IndustryPage } from '../detail-pages';

/** /industries/real-estate-property-management/. Proposed copy (2026-11-20). */
export const realEstatePropertyManagement: IndustryPage = {
  slug: 'real-estate-property-management',
  name: 'Real Estate & Property Management',
  title: 'Give owners, renters and residents a clearer way forward.',
  highlight: 'a clearer way forward.',
  description:
    'Websites for property management companies and leasing teams: management services for owners and boards, leasing information for prospective residents, and resident tools that stay easy to reach.',
  metaTitle: 'Websites for Real Estate & Property Management',
  metaDescription:
    'Websites, SEO, and email for property managers and leasing teams: owner and board services, leasing information, resident tools, and inquiry routing.',
  introduction: {
    eyebrow: 'Who this is for',
    heading: 'Built for three audiences who should never share a form.',
    lead: 'An owner comparing management companies, a renter looking for a home, and a resident reporting a leak arrive at the same website with nothing in common. Mixed together, service requests land in the sales inbox.',
    paragraphs: [
      'We separate management growth from leasing, keep resident needs easy to reach, and route each inquiry to the right team.',
    ],
    aside: {
      heading: 'Who this page is for',
      items: [
        {
          title: 'Property management companies',
          text: 'Growing the owner and board portfolio while serving residents well.',
        },
        {
          title: 'Leasing teams and communities',
          text: 'Filling homes with prospects who have the information to decide.',
        },
        {
          title: 'HOA and association managers',
          text: 'Boards comparing services, and residents who need documents.',
        },
        {
          title: 'Owner-operators',
          text: 'A few properties, one person, and inquiries that must reach the right place.',
        },
      ],
    },
  },
  challenges: {
    heading: 'Where property websites lose owners and residents',
    intro: 'Three patterns, and the response to each.',
    items: [
      {
        problem: 'Management services described for nobody in particular',
        symptom:
          "'Full-service property management' says nothing about what an owner or board gets.",
        response:
          'A management section for owners and boards: scope, what is included, how reporting works, and how to start, with a form that asks what a proposal needs.',
      },
      {
        problem: 'Residents and prospects in the same funnel',
        symptom: 'A resident hunting for the maintenance request ends up in the leasing form.',
        response:
          'A permanent residents entry point on every page, leading to the portal, documents, and request paths, outside the leasing funnel.',
      },
      {
        problem: 'Property information that is out of date',
        symptom: 'Availability, floor plans, amenities, and fees drift from the listing system.',
        response:
          'Property information as structured content with one source per fact, linked to the listing system where you have one.',
      },
    ],
  },
  services: {
    heading: 'The services that fit property management and leasing',
    intro:
      'Routing for each audience, visibility for your areas, and communication that keeps owners and residents informed.',
    items: [
      {
        card: 'wordpress-websites',
        relevance:
          'Properties, services, documents, and team as structured content the office keeps current.',
      },
      {
        card: 'custom-websites',
        relevance:
          'For a focused management company or a single community: a fast site with three entry points.',
      },
      {
        card: 'seo',
        relevance: 'Service and area pages matched to how owners and renters search.',
      },
      {
        card: 'email-automation',
        relevance:
          'Owner and board updates, leasing follow-up, move-in information, and renewal reminders.',
      },
    ],
  },
  module: {
    eyebrow: 'Three entry points',
    heading: 'Owners and boards, prospective residents, current residents',
    intro:
      'Three doors on every page, in the same place, each leading to a path built for that visitor.',
    blocks: [
      {
        kind: 'paths',
        items: [
          {
            label: 'Grow',
            title: 'Owners and boards',
            text: 'What management includes, how reporting works, service areas, and how a proposal is prepared.',
            action: 'Request a management proposal',
          },
          {
            label: 'Lease',
            title: 'Prospective residents',
            text: 'Available homes, floor plans, amenities, fees in your terms, and how to tour or apply.',
            action: 'Schedule a tour or apply',
          },
          {
            label: 'Live',
            title: 'Current residents',
            text: 'Portal access, documents, maintenance requests, and who to contact, never behind a sales form.',
            action: 'Submit a request or open the portal',
          },
        ],
      },
      {
        kind: 'note',
        heading: 'What stays in your systems',
        paragraphs: [
          'Listings, applications, payments, and maintenance tickets live in the property management and listing systems you already use. The website leads into them; any deeper connection is scoped separately within what each vendor supports.',
        ],
      },
    ],
  },
  faqs: {
    heading: 'Questions from property managers and leasing teams',
    intro: 'What owners and managers ask.',
    items: [
      {
        question: 'How do you keep owners, prospects, and residents apart?',
        answer:
          'Three entry points in the same place on every page, each with its own pages and forms, routed to the right team.',
      },
      {
        question: 'Can the site connect to our listing or property management system?',
        answer:
          'It can link to them, so prospects reach listings and residents reach the portal. Live availability depends on what the vendor supports.',
      },
      {
        question: 'Who updates property information?',
        answer:
          'Your team. Properties, amenities, fees, and documents are structured content with clear fields, edited in one place.',
      },
      {
        question: 'How does inquiry follow-up work?',
        answer:
          'Each inquiry type gets its own acknowledgement and follow-up by email: proposal steps for owners, tour information for prospects, confirmation for residents.',
      },
    ],
  },
  invitation: {
    heading: 'Tell us about your portfolio',
    text: 'Share the audiences you serve, the systems you use, and where inquiries go wrong; we will suggest the three entry points and the routing.',
    bring: [
      'Your website and property management or listing systems',
      'The services you offer owners and boards',
      'How resident requests reach you today',
    ],
  },
};
