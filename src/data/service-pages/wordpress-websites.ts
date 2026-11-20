import type { ServicePage } from '../detail-pages';

/** /services/wordpress-development/: the WordPress Websites card. Proposed copy (2026-11-20). */
export const wordpressWebsites: ServicePage = {
  slug: 'wordpress-development',
  card: 'wordpress-websites',
  title: 'A better website. An easier way to keep it current.',
  highlight: 'keep it current.',
  description:
    'WordPress websites for organizations that update services, articles, people, or events regularly, with an editing experience designed as carefully as the design.',
  metaTitle: 'WordPress Website Development',
  metaDescription:
    'WordPress websites with reusable sections, agreed content types, mobile layouts, forms, and an editor handoff, for teams that publish and update regularly.',
  introduction: {
    eyebrow: 'Who it helps',
    heading: 'For teams that publish, update, and grow the site themselves.',
    lead: 'A WordPress website gives your team a site they can keep current without a developer: add a service, post an article, update a team member, or list an event through an editor built for the way you work.',
    paragraphs: [
      'We design the site and the editing experience together, so a new page looks right the first time and new staff learn the editor quickly.',
    ],
    aside: {
      heading: 'When it fits',
      items: [
        {
          title: 'Regular publishing',
          text: 'Articles, news, events, or resources go out weekly or monthly and need to look consistent.',
        },
        {
          title: 'Many similar pages',
          text: 'Services, locations, programs, or people that follow one pattern and need their own pages.',
        },
        {
          title: 'Several editors',
          text: 'More than one person updates the site, with different levels of access.',
        },
        {
          title: 'Growth in sections',
          text: 'You expect to add whole areas later, such as a resource library or a careers section.',
        },
      ],
    },
  },
  deliverables: {
    heading: 'What a WordPress project includes',
    intro: 'A WordPress site is more than a theme. These are the parts we plan and build.',
    items: [
      {
        title: 'Site architecture',
        text: 'The pages, menus, and content types you need, mapped before design so nothing important is missing or buried.',
      },
      {
        title: 'Reusable page sections',
        text: 'Designed blocks, such as a hero, a feature grid, or a call to action, that editors combine into on-brand pages.',
      },
      {
        title: 'Agreed content types',
        text: 'Structured entries for what you publish often, such as services, team members, or events, each with its own fields and template.',
      },
      {
        title: 'Mobile layouts and forms',
        text: 'Every template tested on phones and tablets, with inquiry forms that validate input and deliver where you choose.',
      },
      {
        title: 'Migration where scoped',
        text: 'Existing pages, posts, and media moved into the new structure, with redirects so old links keep working.',
      },
      {
        title: 'Performance basics and editor handoff',
        text: 'Image optimization, caching, and lean templates, then a walkthrough and a short written guide for your editors.',
      },
    ],
    scopeNote:
      'Hosting, the domain, plugin licences, and WordPress updates are your responsibility unless a maintenance arrangement is agreed separately in writing.',
  },
  module: {
    eyebrow: 'The editing experience',
    heading: 'From edit to published, without a developer',
    intro:
      'How an update runs once the site is yours, and the kinds of pages your team can manage.',
    blocks: [
      {
        kind: 'journey',
        heading: 'The publishing workflow',
        intro: 'Four steps your team repeats for every update.',
        steps: [
          {
            label: 'Edit',
            title: 'Change the content',
            text: 'Open the page or entry, edit text and images in the designed sections, and add a section if one is needed.',
          },
          {
            label: 'Preview',
            title: 'Check it on screen',
            text: 'Preview at desktop and phone widths before anything is public.',
          },
          {
            label: 'Publish',
            title: 'Make it live',
            text: 'Publish at once or schedule it. Permissions decide who can publish and who can only draft.',
          },
          {
            label: 'Maintain',
            title: 'Keep it healthy',
            text: 'Updates, backups, and plugin checks, handled by you or through an agreed maintenance arrangement.',
          },
        ],
      },
      {
        kind: 'directory',
        heading: 'What the team can update',
        intro: 'Examples of content types we set up, with the pages they power.',
        groups: [
          {
            title: 'Services and offers',
            text: 'Each service has its own page and appears in lists and menus automatically.',
            items: ['Service pages', 'Plan or package summaries', 'Service area pages'],
          },
          {
            title: 'People and places',
            text: 'Profiles and locations follow one template and stay consistent.',
            items: ['Team profiles', 'Locations and hours', 'Departments'],
          },
          {
            title: 'Articles and resources',
            text: 'Dated content with categories, so readers can browse by topic.',
            items: ['Blog articles', 'Guides and downloads', 'News and announcements'],
          },
          {
            title: 'Events and programs',
            text: 'Entries with dates, details, and a clear action, listed by what is coming up.',
            items: ['Events and classes', 'Programs and courses', 'Registration pages'],
          },
        ],
      },
    ],
  },
  engagement: {
    heading: 'Four steps from plan to a site your team runs',
    intro:
      'You approve the structure and templates before content goes in, and the site before launch.',
    steps: [
      {
        title: 'Discovery',
        text: 'We learn what you publish, how often, and who does the work, and look at the content worth keeping.',
      },
      {
        title: 'Plan',
        text: 'The site architecture, the content types, the section set, and an estimate, with migration scoped if needed.',
      },
      {
        title: 'Build',
        text: 'We design the templates and sections, set up the content types, and load or migrate content, reviewing with you as pages take shape.',
      },
      {
        title: 'Handoff and refine',
        text: 'Your editors get a walkthrough and a short guide; after launch we review how publishing is going and adjust.',
      },
    ],
  },
  faqs: {
    heading: 'Questions about WordPress websites',
    intro: 'What organizations ask before a WordPress project.',
    items: [
      {
        question: 'Will my team find the editor easy to use?',
        answer:
          'That is the point of the build. Editors work with designed sections and clear fields, so a new page looks right by default, and the handoff includes a walkthrough and a guide.',
      },
      {
        question: 'Can you work with our existing theme?',
        answer:
          'Sometimes. If the theme is sound, fast, and easy to edit, we extend it; if not, we recommend a rebuild and explain why.',
      },
      {
        question: 'What happens to our existing content?',
        answer:
          'Pages, posts, images, and documents are migrated where that is scoped, with old URLs mapped to new ones. We flag content worth rewriting.',
      },
      {
        question: 'Who handles hosting and maintenance?',
        answer:
          "You own the hosting account and the site. Updates and backups are handled by you, your host's tools, or a maintenance arrangement with us.",
      },
    ],
  },
  invitation: {
    heading: 'Tell us what your team publishes',
    text: 'Share what you update most often and who does it, and we will suggest a structure and an editing setup that fits.',
    bring: [
      'Your current site and what you would keep',
      'The content you publish most: articles, events, services, people',
      'How many people will edit the site',
    ],
  },
};
