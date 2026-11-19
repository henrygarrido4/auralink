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

The device image in the home hero shows a fictional heating and cooling homepage, Sableline Heating & Air, drawn for the mockup on 2026-11-18 (source and notes in `design/hero-mockup/`). The owner asked for those screens to show a construction or HVAC website rather than one of their own. It is not a client, a result, or a real business, and must not be described as one. The selected-work cards still show the three projects the owner supplied.

The chips that circle those devices (`src/components/ui/ServiceOrbit.astro`) started as the service cards' own icons and titles (owner, 2026-11-18). The same day the owner replaced them with six benefit badges, `heroBenefits` in `src/data/site.ts`, in those same places: More sales where SEO sat, New inquiries where AEO & GEO sat, More bookings where Shopify Stores sat, New subscribers where WordPress Websites sat, Repeat customers where Email & Automation sat, and Time saved where Custom Websites sat. The labels say what the work is for. They are not measured results: no figures, client names, logos, or notifications. More sales and Repeat customers are yellow; the other four are white. A label breaks before its last word when it needs a second line, and never onto a third. More sales stays on one line, because its chip is the highest and a second line leaves the hero. Each icon is decorative; its label is ordinary text. The services strip under the hero still lists the six services. A new benefit, or a longer label, needs its place on the ring checked.

The home page introduction (`src/components/sections/AboutIntro.astro`, where the hero's About us button lands) replaced the earlier "About Auralink Studio" paragraph on 2026-11-17. On 2026-11-19 the owner moved it to the end of the home page, after the process, so the services are the first section after the hero. Its heading and body copy are the owner's (the body as the owner rewrote it that day); the eyebrow, "About Auralink Studio", is a proposal the owner has not confirmed yet. The copy makes no claim beyond the verified facts. It ends with a "Learn more" button (the owner's request, 2026-11-18), defined as `aboutCta` in `src/data/site.ts`, for the planned About page (`/about/`). Until that page ships, the button is a placeholder with no link, like "View all services" and the hero's "Book a free call". Visually hidden words, "about Auralink Studio", complete its name for screen readers and search engines, since "Learn more" alone does not say where it leads. Its photo is a portrait the owner supplied on 2026-11-19, credited in `src/assets/CREDITS.md`, replacing the earlier stock photo. It is not captioned or named, and it is not presented as a client or a testimonial. The owner will supply a YouTube video for this section later; the player is separate work and nothing video-related is published until then.

## Information architecture (planned)

| Route                                 | Purpose                                                                                                               | Primary call to action                | Content source               | Status                                    |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------- | ---------------------------- | ----------------------------------------- |
| `/`                                   | Position the agency, show the service groups, highlight real work once available, route visitors to the right service | Start a project inquiry               | `src/data/site.ts`, sections | Built; home page sections described below |
| `/services/website-development/`      | Hub comparing static, WordPress, and Shopify builds; helps the visitor choose                                         | Inquiry; links to the three sub-pages | `services` collection        | Planned                                   |
| `/services/static-websites/`          | Custom static websites: what, for whom, process, deliverables                                                         | Inquiry                               | `services` + `faqs`          | Planned                                   |
| `/services/wordpress-development/`    | WordPress builds: scope, approach, maintenance considerations                                                         | Inquiry                               | `services` + `faqs`          | Planned                                   |
| `/services/shopify-development/`      | Shopify stores: setup, theme development, integrations                                                                | Inquiry                               | `services` + `faqs`          | Planned                                   |
| `/services/email-marketing/`          | Email design and development plus lifecycle automation                                                                | Inquiry                               | `services` + `faqs`          | Planned                                   |
| `/services/seo-ai-search/`            | SEO, AEO, and GEO explained and offered as a programme                                                                | Inquiry                               | `services` + `faqs`          | Planned                                   |
| `/work/` and `/work/[id]/`            | Genuine case studies, each client-approved                                                                            | Inquiry; related service              | `work` collection            | Planned; requires approved entries        |
| `/about/`                             | Who Auralink Studio is, how it works, why clients choose it (verified facts only)                                     | Inquiry                               | page copy                    | Planned                                   |
| `/insights/` and `/insights/[id]/`    | Educational articles answering real client questions                                                                  | Related service; inquiry              | `insights` collection        | Planned                                   |
| `/contact/` and `/contact/thank-you/` | Project inquiry form (Netlify Forms) and confirmation                                                                 | Submit inquiry                        | page copy, form              | Planned                                   |
| `/404`                                | Helpful not-found page linking to hubs                                                                                | Hubs                                  | page copy                    | Planned                                   |

Pages are built when their content is ready and pass the quality checks. Do not create empty placeholder routes. Update the status column when a route ships.

## Navigation plan

Primary (the navbar, `src/components/sections/Navbar.astro`): the logo, five links, and a "Book a free call" button, as the owner asked on 2026-11-16. The entries live in `primaryNav` and `primaryCta` in `src/data/site.ts`. An entry becomes a link only when its page exists and its `href` is added there; until then it renders as a label, so the site never links to a missing page.

Below `lg`, where the navbar's button moves into the menu, the same button also stays at the bottom of the screen on every page (`src/components/sections/StickyCta.astro`), as the owner asked on 2026-11-18. It reads `primaryCta` too, so it becomes a link with the others.

Proposed, awaiting the owner's confirmation: the five labels (Home, Services, Work, Insights, About) and `/contact/` as the target of the button. Services becomes a menu of the five service pages once they ship.

Footer: service links, Work, Insights, About, Contact, privacy page once written, and verified contact details only.

## Services strip on the home page

The home page repeats the six service-card titles in a strip between the hero and the services (`src/components/sections/ServiceStrip.astro`, built 2026-11-18). The titles come from `serviceCards` and are not renamed. The hero's benefit chips do not use these titles: the strip lists the services, and the chips list the benefits. The strip describes what Auralink Studio does. It is not a client, partner, or certification list: no logos, and no "trusted by" line. The names are labels, not links. A link belongs on the service card below, once that card has a destination. The row has no visible heading; its accessible name is "Services". The bold first word of each name is styling only.

## Service cards on the home page

The home page's services section (`src/components/sections/Services.astro`, built 2026-11-18) shows six cards, defined once in `serviceCards` in `src/data/site.ts`. Each card presents services from the verified catalogue, and together they present all eight; `tests/e2e/services.spec.ts` fails if one is missing or listed twice. The card titles and descriptions are the owner's (2026-11-17) and claim nothing beyond the verified services: no results, rankings, or timescales.

The section's introduction is a proposal the owner has not confirmed. The owner suggested "Websites, email, and search. Working together." and "From your first impression to your next customer conversation, we help you build an online presence that supports your business." Both repeat the introduction above, which already brings "websites, email, and search strategy together" in a "From ... to ..." sentence. So the proposal invites the visitor to choose instead: "Start with one service. Connect the rest.", then "Each service works on its own and is planned to fit with the others, so whatever you add next builds on what is already in place." The eyebrow, "Our services", is the owner's.

Destinations follow one rule, in `src/lib/service-cards.ts`. A card links to its own service page once that page ships, labelled "Learn more". Until then it links to the inquiry page, labelled "Discuss this service". With neither, it is not a link and shows no label, so it never names an action that leads nowhere. Every card shows its arrow all the same, its box filling with the primary colour under the pointer: each will lead to a page, so the arrow comes first (owner, 2026-11-18), as the hero's "Book a free call" button shows before its page. On 2026-11-18 neither destination exists: no service page has been written, and `/contact/` is planned but not built, so all six cards are plain cards with the arrow alone. When the contact page ships, setting `primaryCta.href` to `/contact/` turns all six into "Discuss this service" links. Adding a card's `href` then points that card at its own page:

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

## Why Auralink Studio, on the home page

The home page's "Why Auralink Studio?" section (`src/components/sections/WhyAuralink.astro`, built 2026-11-19, `#why-auralink`) sits directly under the services and before who we work with. The copy is the owner's, from the approved mockup of that day: the eyebrow "How we're different", the heading "Why Auralink Studio?" (a light "Why", then the name in bold), the sentence "Thoughtful websites. Connected email journeys. A partner invested in your business.", and the three pillars in `whyPillars` in `src/data/site.ts`, in order: Personal partnership, Connected expertise, and Purposeful execution. The centre pillar is the only one on the primary yellow. None of it states a client, a price, a statistic, or a measured result. The checklist marks are decorative. There is no link or button. Behind the copy is a dark desk photograph the owner supplied on 2026-11-19, credited in `src/assets/CREDITS.md`. It is decorative, not a client's workplace. A `neutral` wash keeps the heading readable.

## Who we work with on the home page

The home page's "Who we work with" section (`src/components/sections/WhoWeWorkWith.astro`, built 2026-11-18, `#who-we-work-with`) took the place of selected work that day, at the owner's request, after Why Auralink Studio and before the process. The owner redesigned it from a mockup on 2026-11-19. All of its copy is the owner's: the eyebrow "Who we work with", the heading "Built for businesses like yours.", the sentence "Websites and email marketing built around your business.", the sixteen kinds of business in `industries` in `src/data/site.ts`, in this order (Construction & Home Services; Healthcare & Medical; Dental; Veterinary & Pet Care; Med Spas, Salons & Wellness; Automotive; Food & Hospitality; Real Estate & Property Management; Retail & Consumer Brands; Manufacturing & Industrial; Arts, Culture & Entertainment; Education & Community Organizations; Nonprofits & Associations; Lawyers & Law Firms; Financial & Professional Services; Technology & SaaS), and the closing line "Don't see your business here? Let's talk." Each name has the icon the owner named for it beside it (a hard hat for construction, a tooth for dental, and so on); the icons are decorative and add nothing the names do not say.

The names are businesses Auralink Studio can help. They are not a client list, and they claim no past work, experience, or results in these fields: client names, logos, project counts, and "trusted by" lines do not belong in the section. They stay plain text, not links, until a page for one of them exists; the near-black fill and white underline under a hovering pointer are decoration, not a promise of a page. "Let's talk" follows the navbar's button (`primaryCta`): until the contact page ships it is a placeholder with no link, like "Book a free call", and it links to `/contact/` once that page does.

## Selected work on the home page

Since 2026-11-18 no page shows this section: the owner replaced it on the home page with "Who we work with" (above). Its component, `featuredProjects`, `workFilters`, the photos, and the props are kept unchanged for a later page, and `tests/e2e/work.spec.ts` is skipped until a page renders it. The rest of this section describes it as built.

The home page's selected work section (`src/components/sections/SelectedWork.astro`, built 2026-11-18, `#work`) shows the three projects the owner supplied that day, numbered 01-03 and defined once in `featuredProjects` in `src/data/site.ts`. Later that day the owner asked for "a filtering system ... instead of displaying them all at once" and chose filters by platform: Custom websites, WordPress, and Shopify (`workFilters`). Each filter shows the projects whose `service` it names, one each for now, and the section opens on the first. They are not entries in the `work` collection. That collection holds client-approved case studies for `/work/`, and none of these three is one: one is a demo, one a personal recreation, and the third's client status is unconfirmed. No case-study page exists for any of them.

Each description says only what the project's own site shows, or what the owner's documentation of it supports, as checked on 2026-11-18. Each card states its status in its label, so a demo or a personal project never passes for client work, and claims no client relationship, result, testimonial, integration, or booking system.

1. Johnny's Exclusive Barbershop, "Custom static website", https://exclusivecutzz.netlify.app/. Inspected live. The site displays that name (its logo badge reads "Exclusive Cutz") for a barbershop in Humble, Texas. It shows services, a price list whose tabs filter it by service (tried), opening hours, the address, gallery and contact pages, a newsletter sign-up, and appointment buttons that open the shop's page on a third-party booking service. It is hand-written HTML, CSS, and JavaScript on Netlify, with no CMS. The owner's own portfolio lists it as a website from 2024. Not confirmed: whether it was paid client work, and whether the shop agreed to be featured. The card repeats none of the shop's contact details.
2. The Villas @ Foxbrick, "WordPress demo", https://villas-foxbrick-demo.instawp.site/. On 2026-11-18 the homepage loaded without a password (earlier the same day every request got HTTP basic authentication, 401, served by InstaWP). The homepage shows "Now leasing", one- and two-bedroom homes in Humble, a phone number, links for floor plans, amenities, gallery, neighborhood, and residents, "Schedule a tour", and the heading "Luxury living, right here in Humble". The home hero showed this homepage until later that day, when those screens were replaced with a fictional heating and cooling sample. The card still rests on the owner's portfolio (a WordPress website, 2026) and the owner's source for its gallery page, built with the Flatsome theme's page builder. Public rental listings confirm The Villas at Foxbrick is an apartment community on Foxbrick Lane in Humble, Texas. Not confirmed: whether the demo was made for the property or as a concept. The card calls it a demo and describes the tour button only as a button. The card repeats none of the phone number.
3. one0one, "Shopify recreation", https://henrrywebsolutions.myshopify.com/. The storefront asks for a password (store name "Henrrywebsolutions"). The owner's portfolio documents it as a 2024 recreation of the storefront of one0one, an activewear brand, as it looked before the brand's latest redesign, and gives the password. With that password the storefront was checked read-only. It shows one0one's branding on Shopify's Dawn theme, with dresses, tops, belts, accessories, men's, and sale collections. Collection pages have availability and price filters and sorting, product pages offer sizes and sale prices, and there are country, currency, and English and Spanish selectors. The card calls it a personal project and says it is not affiliated with one0one. At the owner's request (2026-11-18), it also gives the store's password under its button ("Demo password: password") so visitors can open the store; that password opened the storefront the same day. Open question for the owner: featuring a recreation of a real brand's store, with its name, logo, and photography, on a commercial agency site.

Each cover photo is a licensed stock photo of the project's industry (`src/assets/CREDITS.md`). It is never the business, its premises, or its products, and its alt text describes the photo, not the project.

Each card also has two cut-out props that pop out from behind it, as the plant and pencil cup do in Hub2B (the owner's choice, 2026-11-18: "props per project"). They are scissors and a comb for the barbershop, keys and a succulent for the apartments, and sneakers and a water bottle for the activewear store. All are cut from licensed stock photos chosen without logos or people. They are decorative, with empty alt text, and only suggest the industry: never the business's own tools, premises, or products.

The section introduction is a proposal the owner has not confirmed. The owner suggested the eyebrow "Selected work", the heading "Different businesses. Thoughtful digital experiences.", and "Explore a selection of website and storefront projects, each shaped around a different audience and purpose." The introduction above already promises "thoughtful digital experiences", and the first service card is "shaped around your business". So the proposal keeps the eyebrow and the heading's first half: "Different businesses. Different reasons to visit." Then it says plainly what follows: "Three projects on three platforms: a custom static website for a barbershop, a WordPress demo for an apartment community, and a Shopify recreation of an activewear store."

## How a project starts, on the home page

The home page's process section (`src/components/sections/Process.astro`, built 2026-11-18, `#process`) sits directly under who we work with. The owner pointed at another agency's "4 Easy steps to launch" (fdicreative.com) and asked for that kind of section, with their own four steps. Later that day they asked for each step to show an icon, a number, and a title as that section does, so the page shows titles only. Then they asked for the titles to be reworded with synonyms. The current titles, defined once in `processSteps` in `src/data/site.ts`, are that rewording, a proposal for the owner to confirm:

| Owner's title       | On the page now        |
| ------------------- | ---------------------- |
| Free quote          | Free estimate          |
| A clear plan        | A simple roadmap       |
| We do the work      | We get it done         |
| You see the results | You track the outcomes |

"Free" stays because its synonyms (no-cost, complimentary) read stiffly. The new titles keep each meaning and add no claim: "You track the outcomes" says the client can follow what happens, not what the outcomes will be.

The owner also wrote a sentence for each step. They are no longer on the page and are kept here, under the owner's original titles, in case they return:

1. Free quote. Tell us about your business, where you work, and what kind of jobs you want more of.
2. A clear plan. We tell you what we'd do first, what it costs, and what to expect. Nothing starts until you say yes.
3. We do the work. You approve it before anything goes live.
4. You see the results. Calls, form fills, and booked jobs, every month.

If they return, the earlier notes still apply. "What it costs" says the plan includes a cost; it does not publish one. "Every month" can read as a promise that those results arrive, so the owner should confirm it. "What kind of jobs you want more of" frames the offer toward businesses that book jobs, which is narrower than the verified audience (business owners and marketing teams).

The titles name no price, client, statistic, or measured outcome. Each step's icon (Lucide: conversation, clipboard list, monitor with a cog, bar chart) is decorative and was chosen to suit the title; the chart's bars are not data.

Only the heading sits above the steps: "Four easy steps. From quote to live work.", a proposal that keeps the spirit of the section the owner pointed at without copying its wording. The owner had the rest removed (2026-11-18): the eyebrow "Getting started", the rule under the heading, the sentence "You approve the plan before anything starts, and the work before it goes live.", and the "Book a free call" button that ended the section. The section no longer says anywhere that the client approves the plan and the work before they go ahead.

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

## Closing contact section, footer, and navigation (2026-11-19)

The owner approved the closing contact banner mockup and requested a separate footer in the style of Hub2B's agency page. `ContactBanner.astro` is a section inside `main`, after the page content, and `SiteFooter.astro` is a separate footer landmark. `BaseLayout` renders both by default; contact and thank-you pages omit the banner. Its approved copy is “Let's build what's next”, “Have a project in mind?”, “Websites and email marketing, built around your business.”, and “Let's talk”. The button links to `/contact/`.

The footer has the real studio logo and approved positioning line, Services, Industries, and Company columns. Services derives the six home service-card labels from `serviceCards`; Industries derives all sixteen names from `industries`. The links lead to stable fragments on `/services/` and `/industries/`. The simplified dotted map is original decorative artwork, not a service-area claim. No unverified contact details, social accounts, or legal policies are displayed.

Built routes now include `/services/`, `/industries/`, `/about/`, `/contact/`, and `/contact/thank-you/`. The first three reuse approved home content, not invented case studies or claims of industry experience. These built destinations supersede the earlier notes above describing the About and contact destinations as planned. Individual service and industry detail pages are still future work.

Primary navigation is Home, Services, Industries, About, and Blog. The first four have real destinations. Blog is a non-link label until published editorial content supports `/blog/`; no empty blog route or fabricated articles are created. The intended editorial label is now Blog; existing `insights` collections are retained for future editorial implementation.

The contact page contains a native HTML Netlify project-inquiry form and a noindex success page. It asks for name, email, optional business/website, service interest, and project details, without invented email addresses or telephone numbers. Delivery needs Netlify form detection enabled before deployment and an actual deployed submission check. Local browser checks must not send inquiries.
