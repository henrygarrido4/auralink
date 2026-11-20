import type { ServicePage } from '../detail-pages';

/**
 * /services/local-seo/: the Local SEO + Google Business Profile card of the services page.
 * Proposed copy (2026-11-20) for a service approved for inclusion but not in the verified
 * catalogue. The Google statements follow its Business Profile guidelines, local-ranking page, and
 * Maps content policy as read that day (docs/content-strategy.md).
 */
export const localSeo: ServicePage = {
  slug: 'local-seo',
  card: 'local-seo',
  title: 'Show nearby customers what you do and where you work.',
  highlight: 'where you work.',
  description:
    'Local SEO for businesses chosen by area: an accurate Google Business Profile, pages that say where you work, consistent details, honest review requests, and measurement.',
  metaTitle: 'Local SEO & Google Business Profile',
  metaDescription:
    'Local SEO for businesses chosen by area: Google Business Profile accuracy, service and location pages, search foundations, review requests, and measurement.',
  introduction: {
    eyebrow: 'Who it helps',
    heading: 'For businesses whose customers look for someone nearby.',
    lead: 'Local SEO helps the people near you understand your business, what it offers, and where it operates: an accurate Google Business Profile, pages for each service and area you serve, and details that match everywhere they appear.',
    paragraphs: [
      'It suits any business whose customers decide partly on distance: a clinic, a trade, a restaurant, a shop, a studio. The work is practical and visible; no one can guarantee a position, and we do not.',
    ],
    aside: {
      heading: 'When it fits',
      items: [
        {
          title: 'Customers come from a radius',
          text: 'People search "near me" or a town name, and distance decides who they call.',
        },
        {
          title: 'Your profile is thin or wrong',
          text: 'Hours, categories, services, or photos are missing or out of date.',
        },
        {
          title: 'You serve several areas',
          text: 'You work across towns or neighbourhoods, and the website does not say which.',
        },
        {
          title: 'Reviews happen by chance',
          text: 'Happy customers would leave a review if asked, but nobody asks consistently.',
        },
      ],
    },
  },
  deliverables: {
    heading: 'What a local SEO engagement includes',
    intro: 'The profile, the website, and the details around them, made to agree.',
    items: [
      {
        title: 'Profile accuracy',
        text: 'Your Google Business Profile claimed and verified where needed, then name, address or service area, hours, categories, services, attributes, and photos checked and completed.',
      },
      {
        title: 'Relevant business information',
        text: 'A short description, services as you offer them, products or menus where the profile allows, and answers to common questions.',
      },
      {
        title: 'Service and location pages',
        text: 'Pages for the services and areas that matter most, saying what you do there and how to reach you; no near-identical town pages.',
      },
      {
        title: 'Local search foundations',
        text: 'Consistent name, address, and phone number across the site and main directories, local business structured data, and the technical basics.',
      },
      {
        title: 'An honest review-request process',
        text: "A consistent way to ask for a review once the work is done, within Google's policies: no incentives, no picking only happy customers, no set wording, nothing written for them.",
      },
      {
        title: 'Measurement',
        text: "A baseline from the profile's reports and Search Console, the actions they attribute, and an agreed report format.",
      },
    ],
    scopeNote:
      'Google decides what a profile shows and who is eligible; we work within its rules. Positions depend on relevance, distance, and prominence, cannot be requested or paid for, and are never promised by us. Ongoing posts and review monitoring are agreed separately.',
  },
  module: {
    eyebrow: 'How it fits together',
    heading: 'One business, described the same way in three places',
    intro:
      'A nearby customer may meet you on the map, on your website, or in a directory. Local SEO makes the three agree.',
    blocks: [
      {
        kind: 'paths',
        heading: 'The profile, the website, and the service-area information',
        items: [
          {
            label: 'On the map',
            title: 'Google Business Profile',
            text: 'Often the first thing people see: name, category, hours, photos, reviews, and a website link. It must agree with the site and lead to the right page.',
          },
          {
            label: 'On your site',
            title: 'Service and location pages',
            text: 'Where the detail lives: what each service includes, where you provide it, and how to get in touch, with the structured data search engines compare with the profile.',
          },
          {
            label: 'Everywhere else',
            title: 'Service-area information',
            text: 'The towns or neighbourhoods you serve, stated on the site, set in the profile, and matched in the directories that list you, so search engines can trust the rest.',
          },
        ],
      },
      {
        kind: 'note',
        heading: 'Local SEO or SEO?',
        paragraphs: [
          'Our SEO service works on the whole website: crawling, which page answers which search, and fixes in the right order, with local search only where scoped.',
          'This service is the local work on its own, for a business chosen by area whose website is otherwise sound: the profile and the pages nearby customers need, with or without broader SEO.',
        ],
      },
    ],
  },
  engagement: {
    heading: 'Four steps from a profile check to measured change',
    intro: 'You confirm every fact before it is published, on the profile or the site.',
    steps: [
      {
        title: 'Discovery',
        text: 'We learn which services and areas matter most, and how the profile and site describe you today.',
      },
      {
        title: 'Plan',
        text: 'Profile corrections, pages to add or improve, details to make consistent, the review process, and an estimate.',
      },
      {
        title: 'Implement',
        text: 'We complete the profile, write or rework the pages, add structured data, align the directories in scope, and set up review requests.',
      },
      {
        title: 'Measure and refine',
        text: 'After an agreed period we compare profile actions, impressions, and inquiries against the baseline and set the next priorities.',
      },
    ],
  },
  faqs: {
    heading: 'Questions about local SEO',
    intro: 'What owners ask before local search work begins.',
    items: [
      {
        question: 'Is my business eligible for a Google Business Profile?',
        answer:
          "Yes if customers can visit your location or you travel to theirs, which is Google's rule. A virtual office alone does not qualify, and some kinds of business have extra guidelines.",
      },
      {
        question: 'We have no shopfront. Can we list the areas we serve?',
        answer:
          "Yes. Google's guidelines ask a business that travels to its customers to hide its address and set a service area on one profile; the website then describes those areas.",
      },
      {
        question: 'We already have a profile. Do we start again?',
        answer:
          'No. We work with the profile you have, help you request access through Google if someone else manages it, and correct it rather than add a second profile, which Google does not allow.',
      },
      {
        question: 'What affects where we appear in local results?',
        answer:
          'Google names three factors: relevance, distance from the searcher, and prominence, which includes reviews. Relevance and prominence can improve; distance is fixed, and no one can promise a position.',
      },
    ],
  },
  invitation: {
    heading: 'Tell us where your customers come from',
    text: 'Share your business, the areas you serve, and your profile link if you have one; we will say what to fix first.',
    bring: [
      'Your website and Google Business Profile, if you have one',
      'The areas you serve and the services that matter most there',
      'How you ask for reviews today, if you do',
    ],
  },
};
