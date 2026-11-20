import type { IndustryPage } from '../detail-pages';

/** /industries/retail-consumer-brands/. Proposed copy (2026-11-20). */
export const retailConsumerBrands: IndustryPage = {
  slug: 'retail-consumer-brands',
  name: 'Retail & Consumer Brands',
  title: 'Make choosing your products feel simple.',
  highlight: 'feel simple.',
  description:
    'Stores and websites for retail and consumer brands: product information that answers the deciding questions, discovery that works, fulfillment details up front, and email that brings customers back.',
  metaTitle: 'Stores & Websites for Retail Brands',
  metaDescription:
    'Shopify stores, email, and SEO for retail and consumer brands: product structure, fit and compatibility details, discovery, repeat-purchase email, wholesale.',
  introduction: {
    eyebrow: 'Who this is for',
    heading: 'Built for the shopper, the local customer, and the buyer.',
    lead: 'A shopper comparing your products online, a local customer checking stock, and a wholesale buyer evaluating your line each need different information. The site makes choosing simple for each.',
    paragraphs: [
      'We organize products around how people choose: fit, compatibility, use, and availability, with fulfillment details where the decision is made.',
    ],
    aside: {
      heading: 'Who this page is for',
      items: [
        {
          title: 'Direct-to-consumer brands',
          text: 'Online sales where product information and discovery decide the purchase.',
        },
        {
          title: 'Shops with a storefront and a website',
          text: 'Local customers and online shoppers in one catalogue.',
        },
        {
          title: 'Brands with wholesale accounts',
          text: 'Retail buyers and stockists who need a separate path.',
        },
        {
          title: 'Businesses adding a product line',
          text: 'A service business with merchandise that needs a focused store.',
        },
      ],
    },
  },
  challenges: {
    heading: 'Where retail websites lose the sale',
    intro: 'Three patterns, and the response to each.',
    items: [
      {
        problem: 'Weak product information',
        symptom:
          'Two photos and a paragraph; sizing, materials, and what is in the box are missing.',
        response:
          "A product template with the deciding information first: variants, fit or compatibility, materials, what's included, shipping and returns.",
      },
      {
        problem: 'Difficult discovery',
        symptom:
          'Categories mirror the warehouse, not the customer, and filters do not match how people choose.',
        response:
          'Collections organized by how customers shop, with filters built from your product data, within what the platform supports.',
      },
      {
        problem: 'Missed repeat purchases',
        symptom:
          'After the order confirmation, silence. Customers who would reorder are never reminded.',
        response:
          'Post-purchase and replenishment emails timed to the product, a welcome series, and new-arrival news, with consent.',
      },
    ],
  },
  services: {
    heading: 'The services that fit retail and consumer brands',
    intro:
      'The store first, then the email that brings customers back, then visibility for what people search.',
    items: [
      {
        card: 'shopify-stores',
        relevance:
          'Store structure, collection and product templates, supported filtering, theme customization, and agreed apps.',
      },
      {
        card: 'email-automation',
        relevance:
          'Welcome, post-purchase, replenishment, and new-arrival journeys, plus abandoned-cart where supported.',
      },
      { card: 'seo', relevance: 'Collection and product pages matched to how shoppers search.' },
      {
        card: 'aeo-geo',
        relevance:
          'For brands whose customers ask fit, compatibility, and care questions of assistants.',
      },
    ],
  },
  module: {
    eyebrow: 'Discovery and the trade',
    heading: 'Help shoppers find the product, and give buyers their own door',
    intro:
      'Product discovery shapes the store; where the brand sells to retailers, a separate wholesale path keeps that apart from the cart.',
    blocks: [
      {
        kind: 'journey',
        heading: 'Product discovery, step by step',
        steps: [
          {
            label: 'Category',
            title: 'Start where the customer thinks',
            text: 'Collections by use, fit, compatibility, or occasion, not by internal product codes.',
          },
          {
            label: 'Narrow',
            title: 'Filter with real product data',
            text: 'Filters built from the attributes shoppers care about, so they reach a short list quickly.',
          },
          {
            label: 'Decide',
            title: 'Answer the deciding question',
            text: "Fit, compatibility, materials, what's included, availability, and delivery before the shopper asks.",
          },
          {
            label: 'Buy',
            title: 'Make the purchase easy',
            text: 'A cart that confirms the choice and a checkout that works on a phone.',
          },
        ],
        note: "How we plan a store, not a result from a client's store. Checkout and filters depend on the platform and theme.",
      },
      {
        kind: 'paths',
        heading: 'A separate path for wholesale and stockists, when needed',
        items: [
          {
            label: 'Retail buyers',
            title: 'Wholesale inquiry',
            text: 'The line, terms in your words, minimums, and how to open an account, with a form about the business.',
            action: 'Request wholesale information',
          },
          {
            label: 'Customers',
            title: 'Find a stockist',
            text: 'Where to buy in person, by area, kept current by the brand.',
            action: 'Find a store near you',
          },
        ],
      },
    ],
  },
  faqs: {
    heading: 'Questions from retail and consumer brands',
    intro: 'What brand owners and store managers ask.',
    items: [
      {
        question: 'Can you improve our existing store rather than rebuild it?',
        answer:
          'Often. We review how shoppers move through the store and how the theme and apps perform, then recommend targeted changes or a rebuild.',
      },
      {
        question: 'How should our products be structured?',
        answer:
          'Around how customers choose: collections by use, fit, or compatibility, and a product template that answers the deciding questions.',
      },
      {
        question: 'How do wholesale inquiries work alongside the store?',
        answer:
          "Through a separate wholesale page and form about the retailer's business, routed to whoever handles accounts. Pricing stays in your system.",
      },
      {
        question: 'Which email flows should a store have first?',
        answer:
          'A welcome series, post-purchase follow-up, and abandoned-cart where supported. Replenishment reminders come next for products that run out.',
      },
    ],
  },
  invitation: {
    heading: 'Tell us what you sell and who buys it',
    text: 'Share your store or catalogue, how customers choose, and whether you sell to retailers; we will suggest the structure and the first email flows.',
    bring: [
      'Your current store or product list',
      'How customers choose: fit, use, compatibility',
      'Whether you sell wholesale or through stockists',
    ],
  },
};
