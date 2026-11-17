---
name: seo-review
description: Audit a page or template for SEO, answer engine optimisation (AEO), and generative engine optimisation (GEO) against the project playbook, producing prioritised fixes. Use before publishing a page or when asked to improve search and AI visibility.
---

# SEO, AEO, and GEO review

Playbook: `docs/seo-aeo-geo.md`. Requirements: `.cursor/rules/seo-aeo-geo.mdc`.

## When to use

- A page is about to be published or has been substantially edited.
- The user asks how to improve rankings, answer visibility, or AI citations for a page.

## Instructions

1. Identify the page's purpose, the question it answers, and the planned route in `docs/content-strategy.md`.
2. Build and inspect the rendered HTML (`npm run build`, then read `dist/<route>/index.html`) rather than only the source, so you see what crawlers see.
3. Check technical basics: title and description lengths and uniqueness, canonical, `lang`, sitemap inclusion, `noindex` absence, single `h1`, image `alt`, crawlable primary content.
4. Check on-page quality: answer-first intro, question-style headings, self-contained sections, definitions for AEO/GEO/lifecycle terms, concrete process and scope, no filler or keyword repetition.
5. Check structured data: correct type per page, fields match visible content, JSON parses, no invented ratings, FAQ markup only with visible Q&A.
6. Check internal linking: parent hub, related pages, contact path, descriptive anchors; orphan pages get at least two inbound links.
7. Check entity consistency: name, services, and contact details match `src/data/site.ts`; author and dates on articles; sources linked for statistics.
8. Check integrity: flag any claim that cannot be traced to a verified fact or a cited source as a blocker.
9. Optionally run `npx playwright test tests/e2e/seo.spec.ts` to confirm the automated baseline.
10. Deliver prioritised findings (blocker, high, medium, low) with the file or route, the problem, and the exact fix. Do not implement fixes unless asked.
