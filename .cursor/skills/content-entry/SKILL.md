---
name: content-entry
description: Create or update a Markdown entry in the services, work, insights, or faqs content collections with correct front matter and content integrity checks. Use when adding a service description, case study, article, or FAQ.
---

# Content entry

## When to use

- Adding or editing a Markdown file under `src/content/`.
- Preparing a case study, article, service description, or FAQ answer for publication.

## Instructions

1. Open the target collection's `_README.md` for the front matter template and `src/content.config.ts` for the schema. Field names and types must match exactly.
2. Name the file with a stable, lowercase, hyphenated id (`shopify-development.md`). The id becomes part of the URL.
3. Start every new entry with `draft: true`. Only the owner removes the draft flag after reviewing the content.
4. Write per `.cursor/rules/content-collections.mdc`: direct answer first, question-style headings where relevant, concrete process and scope, honest limitations, a closing next step. No filler, no keyword stuffing.
5. Facts: use only `src/data/site.ts` and the "Verified facts" section of `docs/content-strategy.md`. For anything else, write the sentence without the unverified detail and add a question for the owner in your summary.
6. Case studies: `approvedByClient` stays `false` until the owner confirms; `results` requires `resultsSource`. Never invent outcomes or quotes.
7. Images: place in `src/assets/content/<collection>/` and reference from front matter (`cover`). Provide descriptive alt text in the page template.
8. Cross-link related FAQs or services with `reference()` fields where the schema provides them.
9. Validate: `npm run check:content`, `npx astro sync`, `npm run check`. If a page renders the entry, `npm run test:e2e`.
10. Summarise: files changed, facts used and their sources, open questions for the owner.

## Checklist before finishing

- [ ] Front matter matches the schema and template
- [ ] `draft: true` unless the owner approved publication
- [ ] No placeholders, invented facts, quotes, or statistics
- [ ] Answer-first structure with a next step
- [ ] `npm run check:content` passes
