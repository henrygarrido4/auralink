import type { ServicePage } from '../detail-pages';

/**
 * /services/meta-google-ads/: the Meta + Google Ads card of the services page. Proposed copy
 * (2026-11-20) for a service approved for inclusion but not in the verified catalogue. It names
 * no budget figure, price, lead count, or return. The platform statements follow Google Ads' and
 * Meta's own help pages as read that day (docs/content-strategy.md); client-owned accounts shared
 * through manager or partner access is the studio's practice, not a platform requirement.
 */
export const metaGoogleAds: ServicePage = {
  slug: 'meta-google-ads',
  card: 'meta-google-ads',
  title: 'Paid campaigns with a clear goal and a plan for every inquiry.',
  highlight: 'a plan for every inquiry.',
  description:
    'Google, Facebook, and Instagram campaigns planned around one goal and one offer: the right platform, targeting, creative, a matching landing page, approved tracking, and plain reporting.',
  metaTitle: 'Meta & Google Ads Campaigns',
  metaDescription:
    'Google, Facebook, and Instagram ad campaigns: planning, platform choice, targeting, ad copy and creative, landing pages, tracking, testing, and reporting.',
  introduction: {
    eyebrow: 'Who it helps',
    heading: 'For businesses with an offer to promote and someone to answer.',
    lead: 'Paid advertising on Google, Facebook, and Instagram puts a specific offer in front of people likely to want it and sends them to a page built to turn interest into an inquiry.',
    paragraphs: [
      "It works when the goal is specific and someone is ready to respond. We plan around one goal, pick the platform that fits how people find the offer, and make the page keep the ad's promise; we never promise leads or a return.",
    ],
    aside: {
      heading: 'When it fits',
      items: [
        {
          title: 'A specific offer',
          text: 'One service, product, event, or opening you want more people asking about.',
        },
        {
          title: 'Demand or an audience',
          text: 'People already search for it, or a definable group would want to know.',
        },
        {
          title: 'A page worth landing on',
          text: "A page, or the will to build one, that answers the ad's promise.",
        },
        {
          title: 'Someone to respond',
          text: 'Inquiries get a prompt reply, so paid attention is not wasted.',
        },
      ],
    },
  },
  deliverables: {
    heading: 'What a paid campaign engagement includes',
    intro: 'From goal to report, with your approval at each step.',
    items: [
      {
        title: 'Campaign plan',
        text: 'The goal, the offer, the audience, the budget you set, and how success is judged, agreed before building.',
      },
      {
        title: 'Platform and account setup',
        text: 'Google Search, Facebook and Instagram, or both, chosen for the goal, in ad accounts in your name, shared with us through manager or partner access.',
      },
      {
        title: 'Targeting and structure',
        text: 'Keywords and match types, or audiences, locations, and placements, in a structure that is easy to adjust.',
      },
      {
        title: 'Ad copy and creative requirements',
        text: "Ads written to each platform's limits and policies, with a list of the images, video, logos, and approvals needed from you.",
      },
      {
        title: 'Landing-page alignment',
        text: 'The page each ad leads to, checked or built, so headline, offer, and next step match the ad on any device.',
      },
      {
        title: 'Tracking, testing, and reporting',
        text: 'Conversion tracking that respects your privacy notice and any visitor consent rules that apply, a testing plan, and plain reports at agreed intervals.',
      },
    ],
    scopeNote:
      'Ad spend goes from your own accounts to Google or Meta, separate from our fee for planning and managing campaigns. We set no minimum budget of our own; Google requires none and Meta sets a daily minimum per ad set, and the plan recommends a starting point for you to decide.',
  },
  module: {
    eyebrow: 'How a campaign runs',
    heading: 'From goal to follow-up, and what each platform is for',
    intro: 'The chain every campaign follows, and where each platform joins it.',
    blocks: [
      {
        kind: 'journey',
        heading: 'The chain from goal to follow-up',
        steps: [
          {
            label: 'Start',
            title: 'Goal',
            text: 'One measurable outcome, such as inquiries for one service; it decides platform, budget, and what gets counted.',
          },
          {
            label: 'Reach',
            title: 'Campaign',
            text: 'Targeting, ads, and budget on the platform that fits how people find the offer, approved before launch.',
          },
          {
            label: 'Arrive',
            title: 'Landing page',
            text: 'Repeats the offer, answers the obvious questions, and asks for one action, on any device.',
          },
          {
            label: 'Convert',
            title: 'Inquiry',
            text: 'A call, form, message, or booking, recorded by approved tracking, so you know which ad brought it.',
          },
          {
            label: 'Respond',
            title: 'Follow-up',
            text: 'Your team replies and notes the outcome, so the report can say which inquiries became customers.',
          },
        ],
        note: 'Illustrative. Platforms, budget, pages, and follow-up are decided with you.',
      },
      {
        kind: 'comparison',
        heading: 'Google Search and Facebook or Instagram do different jobs',
        columns: [
          {
            title: 'Google Search',
            intro: 'Catches demand that already exists.',
            items: [
              'Reaches people searching for what you offer',
              'Text ads matched to keywords and locations',
              'The landing page answers the exact search',
            ],
          },
          {
            title: 'Facebook and Instagram',
            intro: 'Creates demand among people who fit.',
            items: [
              'Reaches people chosen by location, interests, and behaviour',
              'Image and video ads that earn attention',
              'The landing page carries the same picture and offer',
            ],
          },
        ],
        note: 'Some goals use one platform, some both; the plan says which fits yours.',
      },
    ],
  },
  engagement: {
    heading: 'Four steps from goal to a running campaign',
    intro: 'You approve the plan, ads, page, and tracking before any spend begins.',
    steps: [
      {
        title: 'Discovery',
        text: 'We learn the offer, the goal, the market, how you respond to inquiries, and past campaigns.',
      },
      {
        title: 'Plan',
        text: 'Platform, targeting, a budget recommendation, creative requirements, landing-page changes, tracking, and an estimate.',
      },
      {
        title: 'Build and launch',
        text: 'We set up accounts and tracking, write the ads, prepare the landing page, and launch once you approve.',
      },
      {
        title: 'Test and report',
        text: 'We review results at agreed intervals, test ads and pages, adjust with you, and report plainly.',
      },
    ],
  },
  faqs: {
    heading: 'Questions about Meta and Google Ads',
    intro: 'What owners ask before paid campaigns begin.',
    items: [
      {
        question: 'Should we start with Google or with Facebook and Instagram?',
        answer:
          'If people search for what you offer when they need it, start with Google Search. If they need to be shown it, or your work is visual, start with Facebook and Instagram.',
      },
      {
        question: 'What do we need to provide?',
        answer:
          'Account access or permission to create accounts, brand assets, photos or video where needed, the offer and its terms, and evidence for any claim.',
      },
      {
        question: 'How is the budget planned, and which costs are ours?',
        answer:
          'Ad spend goes from your account to Google or Meta; our management fee is separate. The plan recommends a starting budget, you decide, and nothing is spent until you approve.',
      },
      {
        question: 'Who owns the accounts, and how do we know it worked?',
        answer:
          "The ad accounts, tags, and data stay yours; we work through Google's manager-account link and Meta's partner access, which you can remove at any time. Success is judged against the plan's goal, through tracking that ties spend to inquiries.",
      },
    ],
  },
  invitation: {
    heading: 'Tell us what you want more of',
    text: 'Share the offer you want to promote and roughly what you could spend; we will say which platform fits.',
    bring: [
      'The service, product, or offer you want to promote, and where',
      'The page you would send people to today',
      'Past campaigns, if any, and how inquiries are handled now',
    ],
  },
};
