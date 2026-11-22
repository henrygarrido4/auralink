import { businessLocation, contactDetails, contactRoutes, site } from './site';

/**
 * The privacy policy page (src/pages/privacy/index.astro), in plain English: drafted at the
 * owner's request on 2026-11-22 and approved by the owner the same day, after every open question
 * was answered; the owner chose to publish it without a lawyer's review. It covers what the site
 * collects, why, who receives it, cookies and tracking, how long it is kept, how to ask for a
 * copy, a correction, or deletion, and how to get in touch.
 *
 * Every statement about what the site does comes from the site itself: the inquiry form's fields
 * (src/components/sections/ProjectInquiryForm.astro), the booking embed, and the records in
 * docs/architecture.md ("Booking and the contact tabs", "Analytics: Google Tag Manager"), and
 * the account settings checked on 2026-11-22; what only the owner could say is in the owner's
 * answers of that day (docs/content-strategy.md, "Verified facts"). When a practice changes,
 * change this copy and the effective date together.
 */

/** Where the page lives, and its name in navigation: the footer link and the hero's eyebrow. */
export const privacyPage = { href: '/privacy/', name: 'Privacy policy' } as const;

/** Part of a sentence: plain words or a link. */
export type PolicyText = string | { readonly text: string; readonly href: string };

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
  {
    paragraph: ['Effective date: November 22, 2026.'],
  },
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
          `This policy covers ${domain}, the website of ${site.name} ("we" and "us"), a web design, development, and marketing studio based in ${based}. ${site.name} is owned and operated by Henrry Garrido.`,
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
              `The booking calendar on our contact page is Calendly's. When you book a discovery call, Calendly collects your name, email address, chosen time, time zone, and any answer you give about your business and what you'd like help with. The call takes place on ${contactDetails.booking.platform}.`,
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
              'When you send the form or book a call, we tell Google Analytics and Meta which action occurred. The lead event does not include your name, email address, phone number, or message.',
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
          ['To measure whether our advertising leads to inquiries.'],
          ['To keep the site and the form secure and free of spam.'],
          ['To meet our legal, tax, and accounting obligations.'],
        ],
      },
      {
        paragraph: [
          'Sending us a message or booking a call does not subscribe you to a mailing list.',
        ],
      },
    ],
  },
  {
    id: 'who-we-share-it-with',
    heading: 'Who we share it with',
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
            ' hosts the website, and receives and stores the information you submit through our contact form.',
          ],
          [
            { text: 'Calendly', href: 'https://calendly.com/legal/privacy-notice' },
            ' runs the booking calendar and keeps the bookings. Its calendar also loads scripts from ',
            { text: 'Stripe', href: 'https://stripe.com/privacy' },
            ', a payments company, which can set cookies even though our call is free.',
          ],
          [
            { text: 'Google', href: 'https://policies.google.com/privacy' },
            ` runs Google Tag Manager, which loads our analytics and advertising tags; Google Analytics 4, which produces our site statistics; and Google Calendar and ${contactDetails.booking.platform}, which handle booking invitations and calls.`,
          ],
          [
            `Namecheap Private Email hosts our business email, including messages you send to ${contactDetails.email}.`,
          ],
          [
            { text: 'Meta', href: 'https://www.facebook.com/privacy/policy/' },
            ' runs the Meta pixel, which measures visits and leads from our advertising on Facebook and Instagram.',
          ],
          [
            'We also copy inquiry details, such as who got in touch and when, into a spreadsheet we use to keep track of inquiries.',
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
          'We do not sell your information for money. Some state privacy laws count sharing information with advertising platforms, as the Meta pixel does, as a "sale" or "sharing", and give residents the right to opt out.',
        ],
      },
    ],
  },
  {
    id: 'cookies-and-tracking',
    heading: 'Cookies and tracking',
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
          'Google Analytics and the Meta pixel load when you visit our site. We do not currently ask for your permission before they load. Calendly displays its own cookie notice in the booking calendar.',
        ],
      },
      {
        paragraph: [
          'You can clear previously stored cookies in your browser. If you visit again, our analytics and advertising tags may load again. You can also install the ',
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
    blocks: [
      {
        list: [
          [
            'We keep non-client inquiry messages, booking records, and their spreadsheet entries for up to six months from the date we receive them. If you become a client, see client records below.',
          ],
          [
            'Client records: while we work together, then as long as the law requires us to keep business, tax, and accounting records.',
          ],
          [
            'Google Analytics keeps event-level data for 2 months. It keeps user-level data for 14 months, and that period restarts with new activity. Aggregated reports may remain available longer.',
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
    blocks: [
      {
        paragraph: [
          'Email ',
          email,
          ' to ask what information we hold about you, to correct it, or to delete it. Write from the address you used with us, or tell us which one it was, so we can find your records and know the request is yours. Put "Privacy request" in the subject line. We respond to privacy requests within 45 days.',
        ],
      },
      {
        paragraph: [
          "We can delete what we hold directly: your form messages, emails, and Calendly bookings. Analytics and advertising data is tied to a random ID in your browser's cookies, not to your name or email address, so we usually cannot look it up. You can clear those cookies in your browser, but our analytics and advertising tags may load again if you visit again.",
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
    blocks: [
      {
        paragraph: [
          'We run this site from the United States, and the companies above may process information in the United States and other countries. If you visit from elsewhere, your information will be handled in the United States, where privacy laws may differ from yours. We market our services to businesses in the United States.',
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
        paragraph: [`${site.name}, ${based}.`],
      },
    ],
  },
];
