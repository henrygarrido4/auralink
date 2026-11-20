import type { ServicePage } from '../detail-pages';

/** /services/shopify-development/: the Shopify Stores card. Proposed copy (2026-11-20). */
export const shopifyStores: ServicePage = {
  slug: 'shopify-development',
  card: 'shopify-stores',
  title: 'Make it easier to find the right product and buy.',
  highlight: 'find the right product and buy.',
  description:
    'Shopify stores designed for product discovery: clear collections, informative product pages, filtering that works, and a purchase that is easy on a phone.',
  metaTitle: 'Shopify Store Design & Development',
  metaDescription:
    'Shopify stores with a clear structure, collection and product templates, supported filtering, theme customization, agreed apps, and mobile QA before launch.',
  introduction: {
    eyebrow: 'Who it helps',
    heading: 'For brands that sell online and want shoppers to find what fits.',
    lead: "A Shopify store from us is a storefront built on Shopify's platform and shaped around how your customers shop: how they browse, compare, and decide, and how quickly they can buy on a phone.",
    paragraphs: [
      "Shopify handles hosting, payments, and checkout. We focus on what you control: structure, collection and product templates, filtering, theme customization, and the apps you need. The checkout itself is Shopify's and changes only within what your plan allows.",
    ],
    aside: {
      heading: 'When it fits',
      items: [
        {
          title: 'A new store',
          text: 'You are moving from marketplaces or a first site to a storefront of your own.',
        },
        {
          title: 'An existing Shopify store',
          text: 'The store works, but shoppers struggle to find products or drop off on mobile.',
        },
        {
          title: 'A growing catalogue',
          text: 'Collections, variants, and filters need a structure that scales as products are added.',
        },
        {
          title: 'A merchandise store',
          text: 'A business adds a product line beside its services and needs a focused shop.',
        },
      ],
    },
  },
  deliverables: {
    heading: 'What a Shopify project includes',
    intro: 'The work that turns a theme into your store.',
    items: [
      {
        title: 'Store structure',
        text: 'Collections, navigation, and the paths from the home page to a product, planned around how customers look for things.',
      },
      {
        title: 'Collection and product templates',
        text: 'What shoppers need to decide: variants, materials, fit or compatibility, shipping notes, and clear prices.',
      },
      {
        title: 'Navigation and filtering',
        text: 'Menus and filters within what Shopify and your theme support, using tags and metafields so shoppers narrow down quickly.',
      },
      {
        title: 'Theme customization',
        text: 'Your brand applied to the theme: typography, colours, imagery, and section layouts, with care for speed.',
      },
      {
        title: 'Agreed app setup',
        text: 'The apps your store needs, such as reviews, subscriptions, or email capture, chosen together and configured.',
      },
      {
        title: 'Mobile QA and handoff',
        text: 'Every template tested on phones from browsing to checkout, then a walkthrough of how to manage products and content.',
      },
    ],
    scopeNote:
      "Shopify's subscription, transaction fees, and app fees are paid to Shopify and the app makers, not to us; the plan lists the ones it depends on. Checkout customization is limited to what your plan allows, and ongoing updates are agreed separately.",
  },
  module: {
    eyebrow: 'Product discovery',
    heading: 'From a collection to the cart, one decision at a time',
    intro:
      'Shoppers move through three screens before they buy, and each is designed for the question it answers.',
    blocks: [
      {
        kind: 'journey',
        heading: 'The path to a purchase',
        steps: [
          {
            label: 'Collection',
            title: 'Narrow the choice',
            text: 'A manageable set of products with filters and sorting that match how people shop, such as size, use, or price.',
          },
          {
            label: 'Product',
            title: 'Answer the question that stops the sale',
            text: "The deciding information first: variants, what's included, fit or compatibility, shipping and returns, and photos that show the detail a shopper would check in a store.",
          },
          {
            label: 'Cart',
            title: 'Confirm and continue',
            text: "The cart confirms the choice, shows the total clearly, and leads into Shopify's checkout without surprises.",
          },
        ],
        note: "How we plan a store, not a client's result. Checkout is Shopify's, and the filters and apps available depend on your plan and theme.",
      },
      {
        kind: 'note',
        heading: 'Why structure comes before styling',
        paragraphs: [
          'A store that looks good but hides products does not sell. We settle collections, navigation, and the product template first, then apply the brand, so the design supports discovery. That order also keeps the store fast: fewer apps, lighter sections, and well-sized images matter most on a phone.',
        ],
      },
    ],
  },
  engagement: {
    heading: 'Four steps from catalogue to live store',
    intro:
      'You approve the structure and templates before products go in, and the store before it opens.',
    steps: [
      {
        title: 'Discovery',
        text: 'We look at your products, how customers choose between them, and what the current store or channel does well and badly.',
      },
      {
        title: 'Plan',
        text: 'The store structure, the templates, the apps the store needs, and an estimate, with product migration scoped if required.',
      },
      {
        title: 'Build',
        text: 'We customize the theme, build the templates, set up collections and filters, configure apps, and load products with you.',
      },
      {
        title: 'Test, open, refine',
        text: 'We test on phones and desktops through to a completed order, open the store, and review how shoppers move through it.',
      },
    ],
  },
  faqs: {
    heading: 'Questions about Shopify stores',
    intro: 'What store owners ask before a project.',
    items: [
      {
        question: 'Can you improve our existing Shopify store?',
        answer:
          'Yes. We review how shoppers move through the store, where they stop, and how the theme and apps perform, then recommend targeted changes or a rebuild.',
      },
      {
        question: 'Can you move our products from another platform?',
        answer:
          'Yes, where it is scoped in the plan. Products, variants, images, and collections are imported and checked, with redirects from the old URLs.',
      },
      {
        question: 'Which apps will we need, and what do they cost?',
        answer:
          "Only the apps your store genuinely needs, chosen during planning. Each app's recurring fee is paid to its maker and listed in the plan, so you see the monthly cost before you commit.",
      },
      {
        question: 'Who owns the store, and can we update it ourselves?',
        answer:
          'You do. The Shopify account, theme, and content are yours, and the handoff shows you how to add products, edit pages, and change sections.',
      },
    ],
  },
  invitation: {
    heading: 'Tell us what you sell',
    text: 'Share your store or product range and what shoppers find hard today, and we will suggest a structure and say what the platform can and cannot do.',
    bring: [
      'Your current store address or product list',
      'How customers choose between products',
      'The apps or tools you already use',
    ],
  },
};
