# Content strategy

## Purpose

auralinkstudio.com is the public website of Auralink Studio: a marketing site, portfolio, educational resource, and lead-generation site. It should explain services clearly, demonstrate expertise, present genuine work, answer prospective clients' questions, and encourage qualified inquiries.

## Audience

Business owners and marketing teams seeking a professional website, stronger online visibility, ecommerce support, or better email marketing. They are not developers; copy must be plain, concrete, and honest about scope and effort.

## Verified facts

These are the only facts that may be stated without qualification. Source: the owner's brief (2026-11-16). They are mirrored in `src/data/site.ts`.

- Business name: Auralink Studio.
- Domain: auralinkstudio.com.
- Services: custom static websites; WordPress website development; Shopify website development; email design and development; lifecycle email marketing and automation; search engine optimization (SEO); answer engine optimization (AEO); generative engine optimization (GEO).
- Website type: public agency marketing website, portfolio, educational resource, and lead-generation site.
- Technology of this site: Astro. WordPress and Shopify are client services, not requirements of this site.

Not yet verified (do not publish as fact): location and service area, team members and roles, founding date, client names, outcomes, testimonials, certifications, partnerships, pricing, turnaround times, contact phone number and email, social profiles.

## Proposed content versus verified facts

Everything beyond the list above is proposed content. Proposed content is written in draft (`draft: true` in collections, or clearly marked in page copy) and becomes publishable only after the owner confirms it. Process descriptions and educational explanations may be written from professional knowledge; claims about Auralink's own results, clients, or credentials may not.

The device image in the home hero shows "Marl", a fictional ceramics shop designed as concept work (source and notes in `design/hero-mockup/`). It is not a client and must not be described as one; replace it with approved client work when that exists.

The home page introduction (`src/components/sections/AboutIntro.astro`, where the hero's About us button lands) replaced the earlier "About Auralink Studio" paragraph on 2026-11-17. Its heading and body copy are the owner's (the body as the owner rewrote it that day); the eyebrow, "About Auralink Studio", is a proposal the owner has not confirmed yet. The copy makes no claim beyond the verified facts. It ends with a "Learn more" button (the owner's request, 2026-11-18), defined as `aboutCta` in `src/data/site.ts`, for the planned About page (`/about/`). Until that page ships, the button is a placeholder with no link, like "View all services" and the hero's "Book a free call". Visually hidden words, "about Auralink Studio", complete its name for screen readers and search engines, since "Learn more" alone does not say where it leads. Its photo is a licensed stock photo of a business owner at work, credited in `src/assets/CREDITS.md`. It illustrates the audience, so it must never be captioned, named, or quoted as a client or team member. The owner will supply a YouTube video for this section later; the player is separate work and nothing video-related is published until then.

## Information architecture (planned)

| Route                                 | Purpose                                                                                                               | Primary call to action                | Content source               | Status                             |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------- | ---------------------------- | ---------------------------------- |
| `/`                                   | Position the agency, show the service groups, highlight real work once available, route visitors to the right service | Start a project inquiry               | `src/data/site.ts`, sections | Built: hero, intro, services       |
| `/services/website-development/`      | Hub comparing static, WordPress, and Shopify builds; helps the visitor choose                                         | Inquiry; links to the three sub-pages | `services` collection        | Planned                            |
| `/services/static-websites/`          | Custom static websites: what, for whom, process, deliverables                                                         | Inquiry                               | `services` + `faqs`          | Planned                            |
| `/services/wordpress-development/`    | WordPress builds: scope, approach, maintenance considerations                                                         | Inquiry                               | `services` + `faqs`          | Planned                            |
| `/services/shopify-development/`      | Shopify stores: setup, theme development, integrations                                                                | Inquiry                               | `services` + `faqs`          | Planned                            |
| `/services/email-marketing/`          | Email design and development plus lifecycle automation                                                                | Inquiry                               | `services` + `faqs`          | Planned                            |
| `/services/seo-ai-search/`            | SEO, AEO, and GEO explained and offered as a programme                                                                | Inquiry                               | `services` + `faqs`          | Planned                            |
| `/work/` and `/work/[id]/`            | Genuine case studies, each client-approved                                                                            | Inquiry; related service              | `work` collection            | Planned; requires approved entries |
| `/about/`                             | Who Auralink Studio is, how it works, why clients choose it (verified facts only)                                     | Inquiry                               | page copy                    | Planned                            |
| `/insights/` and `/insights/[id]/`    | Educational articles answering real client questions                                                                  | Related service; inquiry              | `insights` collection        | Planned                            |
| `/contact/` and `/contact/thank-you/` | Project inquiry form (Netlify Forms) and confirmation                                                                 | Submit inquiry                        | page copy, form              | Planned                            |
| `/404`                                | Helpful not-found page linking to hubs                                                                                | Hubs                                  | page copy                    | Planned                            |

Pages are built when their content is ready and pass the quality checks. Do not create empty placeholder routes. Update the status column when a route ships.

## Navigation plan

Primary (the navbar, `src/components/sections/Navbar.astro`): the logo, five links, and a "Book a free call" button, as the owner asked on 2026-11-16. The entries live in `primaryNav` and `primaryCta` in `src/data/site.ts`. An entry becomes a link only when its page exists and its `href` is added there; until then it renders as a label, so the site never links to a missing page.

Proposed, awaiting the owner's confirmation: the five labels (Home, Services, Work, Insights, About) and `/contact/` as the target of the button. Services becomes a menu of the five service pages once they ship.

Footer: service links, Work, Insights, About, Contact, privacy page once written, and verified contact details only.

## Service cards on the home page

The home page's services section (`src/components/sections/Services.astro`, built 2026-11-18) shows six cards, defined once in `serviceCards` in `src/data/site.ts`. Each card presents services from the verified catalogue, and together they present all eight; `tests/e2e/services.spec.ts` fails if one is missing or listed twice. The card titles and descriptions are the owner's (2026-11-17) and claim nothing beyond the verified services: no results, rankings, or timescales.

The section's introduction is a proposal the owner has not confirmed. The owner suggested "Websites, email, and search. Working together." and "From your first impression to your next customer conversation, we help you build an online presence that supports your business." Both repeat the introduction above, which already brings "websites, email, and search strategy together" in a "From ... to ..." sentence. So the proposal invites the visitor to choose instead: "Start with one service. Connect the rest.", then "Each service works on its own and is planned to fit with the others, so whatever you add next builds on what is already in place." The eyebrow, "Our services", is the owner's.

Destinations follow one rule, in `src/lib/service-cards.ts`. A card links to its own service page once that page ships, labelled "Learn more". Until then it links to the inquiry page, labelled "Discuss this service". With neither, it is not a link and shows no label or arrow, so it never pretends to lead somewhere. On 2026-11-18 neither exists: no service page has been written, and `/contact/` is planned but not built, so all six cards are plain cards. When the contact page ships, setting `primaryCta.href` to `/contact/` turns all six into "Discuss this service" links. Adding a card's `href` then points that card at its own page:

| Card               | Planned destination                |
| ------------------ | ---------------------------------- |
| Custom Websites    | `/services/static-websites/`       |
| WordPress Websites | `/services/wordpress-development/` |
| Shopify Stores     | `/services/shopify-development/`   |
| Email & Automation | `/services/email-marketing/`       |
| SEO                | `/services/seo-ai-search/`         |
| AEO & GEO          | `/services/seo-ai-search/`         |

The plan above puts SEO, AEO, and GEO on one page, so the last two cards would share it. Six service pages, one per card, would change the planned information architecture; that is the owner's decision.

The section's introduction ends with a primary button, "View all services" (the owner's request, 2026-11-18), defined as `servicesCta` in `src/data/site.ts`. It has no destination: no page lists every service, and this plan has none. The navbar's Services entry becomes a menu of the service pages, and `/services/website-development/` compares only the website builds. Until the owner adds such a page, for example a `/services/` overview, the button is a placeholder with no link, like the hero's "Book a free call".

## Content types and collections

| Type                | Collection | Notes                                                                   |
| ------------------- | ---------- | ----------------------------------------------------------------------- |
| Service description | `services` | One per service group page section; `faqs` references for the FAQ block |
| Case study          | `work`     | `approvedByClient` and `resultsSource` required for publication         |
| Article             | `insights` | Dated, attributed, sourced                                              |
| FAQ                 | `faqs`     | Question in front matter, answer in body, visible wherever marked up    |

Templates for front matter live in each collection folder's `_README.md`. Schemas: `src/content.config.ts`.

## Page templates

- Service page: answer-first intro (what it is and who it is for), what is included, process steps, what the client receives, when it is not the right fit, related work (when available), FAQ block, inquiry call to action.
- Case study: client and industry, situation, approach, what shipped, measured results with source (only when verified), related services, inquiry call to action.
- Article: direct answer summary, body with question-style headings, sources, related service, inquiry call to action.
- Hub page: short framing, comparison of options, links to each sub-page, inquiry call to action.

## Conversion paths

1. Primary: any page to `/contact/` (project inquiry). Every page carries at least one inquiry link in the body or closing section and one in the header or footer.
2. Secondary: service page to related insight or case study, then to contact.
3. Tertiary: insight article to the related service page.

## Voice and tone

Clear, specific, calm, confident. Short sentences and paragraphs. Explain trade-offs honestly. Define AEO, GEO, and lifecycle email on first use. No hype, no superlatives without evidence, no jargon for its own sake.

## What "detailed" means

Detailed content answers the reader's real questions: scope, process, timelines expressed as ranges only when verified, what they receive, what is excluded, how success is measured. It is not repetitive copy, keyword stuffing, or long pages without a purpose. Remove anything that does not help a prospective client decide.

## Content integrity policy

- Never invent client logos, testimonials, certifications, pricing, statistics, case-study outcomes, or performance claims.
- Case studies publish only with written client approval (`approvedByClient: true`) and a recorded source for any results.
- Quotes publish only with the person's name, role, and approval on record.
- Statistics from third parties link to the source.
- `npm run check:content` enforces placeholders, approval, and sources for published entries.

## Publishing workflow

1. Author creates the entry with `draft: true` (`content-entry` skill).
2. Owner reviews facts and tone; supplies missing verified details.
3. Owner sets `draft: false` (and `approvedByClient: true` for case studies).
4. `npm run quality` passes; the page ships with the next deploy.
