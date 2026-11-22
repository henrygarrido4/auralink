import { businessLocation, contactDetails, contactRoutes, site } from './site';

/**
 * The privacy policy page (src/pages/privacy/index.astro): a DRAFT the owner asked for on
 * 2026-11-22, in plain English. It covers what the site collects, why, who receives it, cookies
 * and tracking, how long it is kept, how to ask for a copy, a correction, or deletion, and how to
 * get in touch.
 *
 * Every statement about what the site does comes from the site itself: the inquiry form's fields
 * (src/components/sections/ProjectInquiryForm.astro), the booking embed, and the records in
 * docs/architecture.md ("Booking and the contact tabs", "Analytics: Google Tag Manager"). What
 * only the owner can say is a `confirm` marker, with the proposed wording or the open question
 * inside. A section whose content depends on the law where the business, its visitors, or its
 * clients are has `lawyer` set and shows [CHECK WITH A LAWYER] under its heading.
 *
 * While `draft` is true the page is `noindex` and closes with the draft reminder. Before it goes
 * live: resolve every marker, have a lawyer review the marked sections, remove the markers, set
 * `draft` to false, and drop the reminder.
 */
export const draft = true;

/** Where the page lives, and its name in navigation: the footer link and the hero's eyebrow. */
export const privacyPage = { href: '/privacy/', name: 'Privacy policy' } as const;

/** Part of a sentence: plain words, a link, or something only the owner can confirm. */
export type PolicyText =
  string | { readonly text: string; readonly href: string } | { readonly confirm: string };

/** A paragraph, or a bulleted list whose items are sentences. */
export type PolicyBlock =
  | { readonly paragraph: readonly PolicyText[] }
  | { readonly list: readonly (readonly PolicyText[])[] };

/** A part of a section under its own h3. */
export interface PolicyPart {
  readonly heading: string;
  readonly blocks: readonly PolicyBlock[];
}

/** One h2 section of the policy. */
export interface PolicySection {
  /** The section's anchor, used by the list of contents. */
  readonly id: string;
  readonly heading: string;
  /** The section depends on local law: shown as [CHECK WITH A LAWYER] under the heading. */
  readonly lawyer?: boolean;
  readonly blocks?: readonly PolicyBlock[];
  readonly parts?: readonly PolicyPart[];
}

export const privacyHead = {
  title: privacyPage.name,
  description:
    'How Auralink Studio collects, uses, shares, and keeps information from its website, contact form, call bookings, Google Analytics, and the Meta pixel.',
} as const;

export const privacyHero = {
  eyebrow: privacyPage.name,
  title: 'How we handle your information.',
  highlight: 'your information.',
  description:
    'What this website collects when you visit, send us a message, or book a call, why we collect it, who else receives it, and how to have it deleted.',
} as const;

const email = { text: contactDetails.email, href: contactDetails.emailHref };
const phone = { text: contactDetails.phone.display, href: contactDetails.phone.href };
const domain = new URL(site.url).host;
const based = `${businessLocation.region}, ${businessLocation.country}`;

/** Read before the sections: when the policy applies, then the answer in brief. */
export const privacyIntro: readonly PolicyBlock[] = [
  { paragraph: ['Effective date: ', { confirm: 'the date this policy takes effect' }, '.'] },
  {
    paragraph: [
      'In short: we collect what you send us through the contact form, what you give Calendly when you book a call, and how you use the site. We use it to reply to you, to run and improve the site, and to measure our advertising. Netlify, Calendly, Google, and Meta handle parts of it for us. We do not sell it for money. Email ',
      email,
      ' to see, correct, or delete what we hold about you.',
    ],
  },
];

export const privacySections: readonly PolicySection[] = [
  {
    id: 'who-we-are',
    heading: 'Who we are',
    blocks: [
      {
        paragraph: [
          `This policy covers ${domain}, the website of ${site.name} ("we" and "us"), a web design, development, and marketing studio based in ${based}. `,
          {
            confirm: 'the legal name of the business, if it differs, such as an LLC',
          },
        ],
      },
      {
        paragraph: [
          'It explains what the site collects, why, who else receives it, how long we keep it, and the choices you have. Websites we link to, including Google, Meta, and Calendly, have their own privacy policies.',
        ],
      },
    ],
  },
  {
    id: 'what-we-collect',
    heading: 'What we collect',
    parts: [
      {
        heading: 'When you send a message',
        blocks: [
          {
            paragraph: [
              'The contact form asks for your name, your email address, and a few sentences about your project. You can also give your business name, a phone number, the kind of business you run, the services you are interested in, and your current website.',
            ],
          },
        ],
      },
      {
        heading: 'When you book a call',
        blocks: [
          {
            paragraph: [
              `The booking calendar on our contact page is Calendly's. To book the free call, you give Calendly your name and email address `,
              { confirm: 'and the answers to any questions your Calendly event asks' },
              `, and it records the time you choose and your time zone. The call takes place on ${contactDetails.booking.platform}.`,
            ],
          },
        ],
      },
      {
        heading: 'When you email or call us',
        blocks: [
          {
            paragraph: [
              'We receive your email address or phone number, and whatever you choose to tell us.',
            ],
          },
        ],
      },
      {
        heading: 'When you browse the site',
        blocks: [
          {
            paragraph: [
              'Google Analytics 4 and the Meta pixel record the pages you view, how you arrived (for example from a search or an ad), your device and browser, and your IP address, from which they work out your approximate location (Google Analytics does not store the address itself). They keep a random ID in a cookie so they can recognize your browser when you come back. If you are logged in to Facebook or Instagram, Meta can connect your visits to your account.',
            ],
          },
          {
            paragraph: [
              'When you send the form or book a call, the site also tells Google Analytics and Meta that a lead came in, and whether it came from the form or a booking. It does not send your name, email address, phone number, or message. ',
              {
                confirm:
                  'automatic advanced matching is off for the pixel in Meta Events Manager. If it is on, the pixel reads form fields such as your email address and phone number and sends them to Meta in scrambled (hashed) form, and this paragraph must say so',
              },
            ],
          },
          {
            paragraph: [
              'Our host, Netlify, logs technical details of each visit, such as your IP address, your browser, and the page you asked for, as web servers do.',
            ],
          },
        ],
      },
      {
        heading: 'What we do not ask for',
        blocks: [
          {
            paragraph: [
              'We do not ask for sensitive information, such as health details, bank or card numbers, or government ID numbers. Please do not send it through the form or by email.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'why-we-collect-it',
    heading: 'Why we collect it',
    blocks: [
      {
        list: [
          [
            'To reply to your message, prepare for the call you booked, and talk with you about your project.',
          ],
          ['To do the work, and keep the records it needs, if you become a client.'],
          ['To see how people use the site, which pages help and which do not, and to improve it.'],
          [
            'To measure whether our advertising on Google and Meta leads to inquiries ',
            {
              confirm:
                'and to show our ads to people who have visited the site, if you use retargeting',
            },
            '.',
          ],
          ['To keep the site and the form secure and free of spam.'],
          ['To meet our legal, tax, and accounting obligations.'],
        ],
      },
      {
        paragraph: [
          'Writing to us or booking a call does not put you on a mailing list. ',
          {
            confirm:
              'if you send marketing emails to people who inquire, say so here and explain how to unsubscribe',
          },
        ],
      },
    ],
  },
  {
    id: 'who-we-share-it-with',
    heading: 'Who we share it with',
    lawyer: true,
    blocks: [
      {
        paragraph: [
          'A few companies run parts of the site for us. They receive information to provide their service, and they handle it under their own privacy policies:',
        ],
      },
      {
        list: [
          [
            { text: 'Netlify', href: 'https://www.netlify.com/privacy/' },
            ' hosts the website and receives the messages you send through the form.',
          ],
          [
            { text: 'Calendly', href: 'https://calendly.com/legal/privacy-notice' },
            ' runs the booking calendar and keeps the bookings. Its calendar also loads scripts from ',
            { text: 'Stripe', href: 'https://stripe.com/privacy' },
            ', a payments company, which can set cookies even though our call is free.',
          ],
          [
            { text: 'Google', href: 'https://policies.google.com/privacy' },
            ` runs Google Tag Manager, which loads our analytics and advertising tags; Google Analytics 4, which produces our site statistics; and ${contactDetails.booking.platform}, where calls take place. `,
            { confirm: 'add your email provider, such as Google Workspace' },
          ],
          [
            { text: 'Meta', href: 'https://www.facebook.com/privacy/policy/' },
            ' runs the Meta pixel, which measures visits and leads from our advertising on Facebook and Instagram.',
          ],
          [
            {
              confirm:
                'list any other tools you copy inquiries into, such as a CRM, a spreadsheet, or an email marketing service',
            },
          ],
        ],
      },
      {
        paragraph: [
          "We may also disclose information when the law requires it, to protect our rights or someone else's safety, or to a buyer if the business is ever sold.",
        ],
      },
      {
        paragraph: [
          'We do not sell your information for money. Some state privacy laws count sharing information with advertising platforms, as the Meta pixel does, as a "sale" or "sharing", and give residents the right to opt out. The choices under Cookies and tracking stop that sharing from your browser.',
        ],
      },
    ],
  },
  {
    id: 'cookies-and-tracking',
    heading: 'Cookies and tracking',
    lawyer: true,
    blocks: [
      {
        paragraph: [
          `Cookies are small files a website stores in your browser. The site's own code stores nothing there. The tags below do, and only on ${domain}:`,
        ],
      },
      {
        list: [
          [
            'Google Analytics sets _ga and _ga_L8TJ8LXX5Z, which tell visits and visitors apart. By default they last up to two years.',
          ],
          [
            'The Meta pixel sets _fbp, which recognizes your browser for advertising measurement and lasts about 90 days. Meta may also use its own cookies if you are logged in to Facebook or Instagram.',
          ],
          [
            'Calendly and Stripe set their own cookies when the booking calendar opens on the contact page. Calendly shows its own cookie notice there.',
          ],
        ],
      },
      {
        paragraph: [
          'These tags start when a page loads; the site does not ask first. ',
          { confirm: 'whether you will add a cookie banner that asks before these tags load' },
        ],
      },
      {
        paragraph: [
          'You can block or delete cookies in your browser settings, install the ',
          {
            text: 'Google Analytics opt-out browser add-on',
            href: 'https://tools.google.com/dlpage/gaoptout',
          },
          ', and change your ad preferences in your Facebook or Instagram settings. ',
          {
            text: 'How Google uses information from sites that use its services',
            href: 'https://policies.google.com/technologies/partner-sites',
          },
          ' explains more. The site does not currently respond to browser privacy signals such as Do Not Track or Global Privacy Control.',
        ],
      },
    ],
  },
  {
    id: 'how-long-we-keep-it',
    heading: 'How long we keep it',
    lawyer: true,
    blocks: [
      {
        list: [
          [
            'Form messages, emails, and booking records: ',
            { confirm: 'two years after our last contact' },
            ', unless you become a client.',
          ],
          [
            'Client records: while we work together, then as long as the law requires us to keep business, tax, and accounting records.',
          ],
          [
            'Google Analytics: visit-level data for ',
            { confirm: '2 or 14 months, the data retention setting in GA4' },
            '. Reports built from it do not identify you and may be kept longer.',
          ],
          ["Meta pixel data: as set out in Meta's own policies."],
          ["Netlify's server logs: as Netlify's own policies set out."],
          ['Cookies: as listed under Cookies and tracking, unless you delete them sooner.'],
        ],
      },
      { paragraph: ['When we no longer need information, we delete it.'] },
    ],
  },
  {
    id: 'your-choices',
    heading: 'How to see, correct, or delete your information',
    lawyer: true,
    blocks: [
      {
        paragraph: [
          'Email ',
          email,
          ' to ask what information we hold about you, to correct it, or to delete it. Write from the address you used with us, or tell us which one it was, so we can find your records and know the request is yours. Put "Privacy request" in the subject line. We will reply within ',
          { confirm: '45 days' },
          '.',
        ],
      },
      {
        paragraph: [
          "We can delete what we hold directly: your form messages, emails, and Calendly bookings. Analytics and advertising data is tied to a random ID in your browser's cookies, not to your name or email address, so we usually cannot look it up. To stop it being collected, delete your cookies and use the choices under Cookies and tracking.",
        ],
      },
      {
        paragraph: [
          'We may need to keep some records, for example for taxes. If so, we will tell you what we kept and why. We will not treat you differently for asking.',
        ],
      },
      {
        paragraph: [
          'Texas residents: the Texas Data Privacy and Security Act gives rights to access, correct, delete, and get a copy of personal data, to opt out of targeted advertising, sale, and profiling, and to appeal if a request is refused. Residents of other states and countries may have similar rights. Whether these laws apply to a business of our size depends on the law, and we will answer requests either way.',
        ],
      },
    ],
  },
  {
    id: 'children',
    heading: "Children's privacy",
    lawyer: true,
    blocks: [
      {
        paragraph: [
          'This site is for businesses and is not meant for children. We do not knowingly collect information from anyone under 13. If you think a child has sent us information, email us and we will delete it.',
        ],
      },
    ],
  },
  {
    id: 'outside-the-us',
    heading: 'Visitors outside the United States',
    lawyer: true,
    blocks: [
      {
        paragraph: [
          'We run this site from the United States, and the companies above may process information in the United States and other countries. If you visit from elsewhere, your information will be handled in the United States, where privacy laws may differ from yours. ',
          {
            confirm:
              'whether you serve visitors or clients outside the US, such as in the EU, the UK, or Canada',
          },
        ],
      },
    ],
  },
  {
    id: 'keeping-it-safe',
    heading: 'Keeping it safe',
    blocks: [
      {
        paragraph: [
          'The site is served over an encrypted connection (HTTPS), and we use established providers for hosting, booking, and email. No website or email is completely secure, so please do not send sensitive information.',
        ],
      },
    ],
  },
  {
    id: 'changes',
    heading: 'Changes to this policy',
    blocks: [
      {
        paragraph: [
          'When our practices change, we will update this page and the effective date at the top.',
        ],
      },
    ],
  },
  {
    id: 'contact-us',
    heading: 'How to contact us',
    blocks: [
      {
        paragraph: [
          'For questions or requests about your privacy, email ',
          email,
          ' or call ',
          phone,
          '. You can also write to us from the ',
          { text: 'contact page', href: contactRoutes.sendMessage },
          '.',
        ],
      },
      {
        paragraph: [
          `${site.name}, ${based}. `,
          { confirm: 'a mailing address, if you want one listed' },
        ],
      },
    ],
  },
];

/** The closing reminder, shown while `draft` is true (the owner's brief: end with it). */
export const draftReminder =
  'This is a draft, not legal advice. It was written on November 22, 2026, from what this website does today, and no lawyer has reviewed it. Before it goes live, settle each [CONFIRM] item, have a lawyer check the sections marked [CHECK WITH A LAWYER] for Texas and anywhere else your visitors and clients are, and remove the markers.';
