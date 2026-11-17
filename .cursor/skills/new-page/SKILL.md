---
name: new-page
description: Add a new route or page template to the Astro site with layout, metadata, structured data, internal links, content wiring, and tests. Use when creating a service page, hub page, about, contact, work listing, article template, or any new URL.
---

# New page

## When to use

- A new URL from the planned information architecture in `docs/content-strategy.md` is ready to be built.
- A dynamic route template is needed for a content collection (services, work, insights).

## Instructions

1. Confirm the route and purpose against `docs/content-strategy.md` (path, audience question it answers, primary call to action). Do not create pages whose content is not ready; a page with placeholder copy is not allowed outside `draft` content.
2. Create `src/pages/<path>/index.astro` or `src/pages/<collection>/[id].astro`. Render through `BaseLayout` with a page-specific `title` and a 50-160 character `description`.
3. Build the page from sections in `src/components/sections/` (create a section component when a block will be reused). Exactly one `h1`; headings in order; answer-first opening paragraph.
4. Pull data from collections with a draft filter (`({ data }) => !data.draft`) and from `src/data/site.ts`. Never hard-code business facts in the page.
5. Add structured data through a component in `src/components/seo/` via `<Fragment slot="head">`, using the type table in `.cursor/rules/seo-aeo-geo.mdc`.
6. Add internal links: parent hub, related pages, and a contact path, with descriptive link text. Update navigation data only when the page is complete: a navbar entry becomes a link when its `href` is added to `primaryNav` (or `primaryCta`) in `src/data/site.ts`.
7. Images go in `src/assets/` and render with `<Image />` (`alt`, `width`, `height`).
8. If the page has an interactive part, build it as an island with `.cursor/skills/vue-island/SKILL.md`.
9. Tests: the site-wide SEO and accessibility suites cover the page automatically because they read `dist/`. Add a focused spec only for page-specific interactions.
10. Run `npx eslint <files>`, `npx prettier --check <files>`, `npm run check`, then `npm run test:e2e:chromium`; inspect the new page's screenshots in `reports/screenshots/` at every width; run `npm run test:e2e` when the page changes a shared layout. Run `npm run build && node scripts/perf-audit.mjs --no-build --routes=<route>` for pages with images, fonts, or islands.
11. Update `docs/content-strategy.md` (mark the route as built) and any instruction file whose conventions changed.

## Checklist before finishing

- [ ] `BaseLayout` with unique title and description
- [ ] One `h1`, logical headings, answer-first intro
- [ ] Structured data matches visible content
- [ ] Internal links in and out of the page
- [ ] No unverified claims; drafts filtered out
- [ ] `npm run test:e2e:chromium` passes (smoke, SEO, layout, rendering, motion, a11y) and screenshots were inspected
