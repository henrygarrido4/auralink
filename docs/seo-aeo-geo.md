# SEO, AEO, and GEO playbook

How auralinkstudio.com earns visibility in classic search results, answer engines (featured answers, assistants that quote a source), and generative engines (AI overviews and chat assistants that synthesise and cite). The same foundations serve all three: indexable pages, people-first content that answers real questions directly, consistent facts about the business, and structured data that matches what is on the page.

Google's position on AI features (verified 2026-11-16, https://developers.google.com/search/docs/appearance/ai-features): there are no additional technical requirements, special files, or markup to appear in AI Overviews or AI Mode. Pages must be indexable and eligible for a snippet, content should be helpful and available as text, structured data must match visible content, and internal linking should make content discoverable.

## Technical foundation

- `site` in `astro.config.mjs` is `https://auralinkstudio.com`; canonical URLs and the sitemap derive from it.
- `@astrojs/sitemap` generates `sitemap-index.xml` on each build; `public/robots.txt` references it and allows crawling.
- `BaseLayout.astro` emits title, description, canonical, Open Graph, Twitter card, `lang`, viewport, and favicon tags, and exposes a `head` slot for page-specific JSON-LD.
- Directory-style URLs with trailing slashes; stable slugs; redirects in `netlify.toml` when a URL changes.
- Static HTML carries all primary content; islands enhance it. Nothing important renders only on the client.
- `noindex` only on thank-you and utility pages. Drafts are never built.
- Performance and accessibility (`docs/quality-checks.md`) are part of search quality: fast, stable, accessible pages.

## Metadata rules

| Element          | Rule                                                                                          |
| ---------------- | --------------------------------------------------------------------------------------------- |
| Title            | 10-70 characters including the appended site name; page-specific; the main topic first        |
| Meta description | 50-160 characters; a genuine summary a person would click; no keyword lists                   |
| Canonical        | Generated; override only for intentional duplicates                                           |
| Open Graph       | Title, description, type, URL, locale from the layout; `ogImage` once a 1200x630 image exists |
| Headings         | One `h1` equal to the page topic; `h2` and `h3` form a readable outline                       |
| Images           | Descriptive `alt`; key messages never only in images                                          |
| Links            | Descriptive anchor text; each page links to its hub, related pages, and contact               |

The Playwright `seo` suite enforces the measurable parts of this table on every built page.

## Structured data

Use JSON-LD through typed components in `src/components/seo/`. Only describe what is visible. Use `src/data/site.ts` for the organisation's facts so every page agrees.

| Page       | Types                                                                                                                                                | Required facts                                                                                                             |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Home       | `Organization`, `WebSite`                                                                                                                            | name, url; `logo` and `sameAs` only when real assets and profiles exist                                                    |
| Service    | `Service` with `provider` (Organization), `BreadcrumbList`, `FAQPage` for the four visible questions (`src/components/seo/DetailPageSchema.astro`)   | name (the service card's title), description matching the meta description, `serviceType`, `areaServed` only once verified |
| Industry   | `WebPage` with `audience` (`BusinessAudience`, the industry's name), `BreadcrumbList`, `FAQPage` (same component)                                    | name, description matching the meta description; no client, result, or area claim                                          |
| Pricing    | `WebPage`, `BreadcrumbList`, `FAQPage`, and two `Service` nodes whose `Offer`s are the visible prices (`src/components/seo/PricingPageSchema.astro`) | prices as shown, from `src/data/pricing.ts`; the monthly plan a `UnitPriceSpecification`; no rating, review, or result     |
| Case study | `Article` or `CreativeWork`, `BreadcrumbList`                                                                                                        | headline, datePublished, author (Organization), about (the client) only with approval                                      |
| Article    | `Article`                                                                                                                                            | headline, description, datePublished, dateModified, author                                                                 |
| About      | `AboutPage` + `Organization` with the email, phone, and city the page shows (`src/components/seo/PageSchema.astro`)                                  | verified facts only; the city as a `PostalAddress` with no street or postal code                                           |
| Contact    | `ContactPage`                                                                                                                                        | contact details only once verified                                                                                         |

Example for the home page (values from `site`):

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://auralinkstudio.com/#organization",
      "name": "Auralink Studio",
      "url": "https://auralinkstudio.com/"
    },
    {
      "@type": "WebSite",
      "@id": "https://auralinkstudio.com/#website",
      "url": "https://auralinkstudio.com/",
      "name": "Auralink Studio",
      "publisher": { "@id": "https://auralinkstudio.com/#organization" }
    }
  ]
}
```

Example for a service page:

```json
{
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "WordPress website development",
  "serviceType": "WordPress website development",
  "description": "Same summary as the page's meta description.",
  "provider": { "@id": "https://auralinkstudio.com/#organization" },
  "url": "https://auralinkstudio.com/services/wordpress-development/"
}
```

Notes:

- `FAQPage`: Google stopped showing FAQ rich results in May 2026 and removed the feature documentation in June 2026 (verified from the Search Central documentation updates). FAQ markup earns no Google search appearance; it is still acceptable where questions and answers are visible on the page, because other engines and assistants may read it. Never add it for content that is not a visible FAQ.
- Never add `AggregateRating`, `Review`, awards, or employee counts without verified data.
- Validate with Google's Rich Results Test or the Schema Markup Validator after building a page.

## Answer engine optimisation (AEO)

Goal: be the source quoted when someone asks a direct question.

- Open every service page, article, and FAQ answer with the direct answer in one or two sentences, then expand.
- Use question-style headings that mirror how clients ask ("How long does a Shopify store take to build?", "What is lifecycle email marketing?").
- Keep sections self-contained: a heading plus its first paragraph should make sense when quoted alone.
- Add short FAQ blocks from the `faqs` collection to service pages, with answers of two to four sentences.
- Define AEO, GEO, lifecycle email, and other terms in one sentence on first use.
- Use lists and tables for steps, comparisons, and inclusions; keep them in HTML, not images.

## Generative engine optimisation (GEO)

Goal: be understood and cited correctly by generative engines.

- Entity clarity: state who Auralink Studio is, what it does, and for whom in plain text on the home and about pages, using the same wording as `src/data/site.ts`.
- Consistency: name, services, and contact details identical across the site and, later, across external profiles.
- Attribution: articles show the author or organisation and publication dates; case studies name the client only with approval.
- Evidence: statistics link to their source; claims about results come only from verified case studies.
- Depth over volume: fewer pages that fully answer a question beat many thin pages.
- Crawlability: no primary content behind client-side rendering, no blocking of crawlers in `robots.txt`.
- No fabricated "AI summary" sections, hidden text, or prompt-like instructions in the page.

## Internal linking model

- Hubs (`/services/`, `/industries/`, and later `/work/` and `/insights/`) link down to every child: the service cards to the nine service pages, the directory to the sixteen industry pages.
- Children link up to their hub (the hero's breadcrumbs), sideways to one or two related pages, and forward to `/contact/`. An industry page links to its three or four recommended services in the body; the services hub and the footer list all six.
- Articles link to the relevant service page; service pages link to supporting articles and approved case studies.
- Every page is reachable within three clicks from the home page.

## Measurement

After launch: verify the domain in Google Search Console, submit the sitemap, review coverage and query reports monthly, and run Lighthouse on each template after significant changes. Record findings and decisions in `docs/quality-checks.md` or a dated note here. Do not publish traffic or ranking claims on the site unless they are measured and the owner approves.

## Not allowed

Keyword stuffing; duplicate pages for keyword variants; doorway pages; hidden text; fake reviews, ratings, or testimonials; invented statistics; auto-generated content published without review; misleading titles or descriptions.

## References

- Google Search Central: https://developers.google.com/search/docs/
- Google AI features guidance: https://developers.google.com/search/docs/appearance/ai-features
- Structured data general guidelines: https://developers.google.com/search/docs/appearance/structured-data/sd-policies
- Astro sitemap integration: https://docs.astro.build/en/guides/integrations-guide/sitemap/
- WCAG 2.2 quick reference: https://www.w3.org/WAI/WCAG22/quickref/
