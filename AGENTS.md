# Auralink Studio website

Public website for **Auralink Studio** (https://auralinkstudio.com): an agency marketing site, portfolio, educational resource, and lead-generation site built with Astro. These instructions apply to every agent and contributor. Detailed procedures live in `.cursor/rules/`, `.cursor/skills/`, and `docs/`; keep this file short.

## Project facts

- Business: Auralink Studio. Domain: auralinkstudio.com.
- Services: custom static websites; WordPress website development; Shopify website development; email design and development; lifecycle email marketing and automation; SEO; answer engine optimization (AEO); generative engine optimization (GEO).
- Audience: business owners and marketing teams seeking a professional website, stronger online visibility, ecommerce support, or better email marketing.
- The site must explain services clearly, demonstrate expertise, present genuine work, answer prospective clients' questions, and encourage qualified inquiries.
- WordPress and Shopify are services sold to clients. This site runs on Astro and never depends on them.
- Planned information architecture, content types, and the publishing workflow: `docs/content-strategy.md`. Build pages when content is ready; no empty placeholder routes.

## Stack and boundaries

Astro 7 (static output), TypeScript (strict), Tailwind CSS 4 via `@tailwindcss/vite`, daisyUI 5, Vue 3 `<script setup>` islands via `@astrojs/vue`, selected Inspira UI components, Astro content collections with Markdown, Playwright with axe-core, Lighthouse, Netlify hosting and Netlify Forms. Exact versions, decisions, and documentation links: `docs/architecture.md`.

- Do not add React, Next.js, Nuxt, another CSS framework, a database, authentication, or an application backend. Explain the requirement instead.
- npm only; `package-lock.json` is the single lockfile. No major-version upgrades inside feature work; propose them separately. No prerelease packages.
- Build-time packages go in `dependencies`, tooling in `devDependencies`.
- Brand colours beyond the decided primary and secondary, the icon family, final imagery, and page layouts are open design decisions; do not pick them while doing setup or maintenance work. Web fonts are decided: Catamaran for text and Mukta for headings (`docs/architecture.md`). Analytics is decided: Google Tag Manager's snippet in `BaseLayout`'s head, with tags configured in the container, not in code (`docs/architecture.md`, "Analytics").

## Repository layout

`src/pages` routes, `src/layouts/BaseLayout.astro` (head, metadata, skip link, main landmark), `src/components/{ui,sections,seo,islands,inspira}`, `src/content` collections with `src/content.config.ts` schemas, `src/data/site.ts` verified facts, `src/data/service-pages` and `src/data/industry-pages` the typed, proposed copy of the service and industry detail pages, `src/data/pricing.ts` the pricing page's figures and copy, `src/styles/global.css` single stylesheet, `src/assets` optimised images (third-party ones credited in `src/assets/CREDITS.md`), `public` static files, `tests/e2e` Playwright suites, `scripts` executable checks, `design` editable source artwork for generated images (`design/hero-mockup` renders the home hero's device image, `design/process-lines` draws the lines behind the home steps, `design/favicon` draws the favicons from the owner's mark), `docs` references, `.cursor` rules, agents, and skills, `reports` generated screenshots and Lighthouse output (gitignored).

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`. The site runs at http://localhost:4321. Astro 7 also backgrounds `astro dev` and `astro preview` automatically when it detects an agent session; pass `--ignore-lock` when a one-off foreground server is required (the Playwright config and the Lighthouse script already do). Ports: 4321 dev server, 4322 Playwright preview, 4323 Lighthouse preview.

## Commands

| Command                                               | Purpose                                                                                                     |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `npm run build` / `npm run preview`                   | Production build to `dist/` and local preview                                                               |
| `npx eslint <files>` / `npx prettier --check <files>` | Targeted lint and format on changed files (preferred during a task)                                         |
| `npm run check` / `npm run check:vue`                 | Astro + TypeScript diagnostics / Vue SFC types                                                              |
| `npm run check:content`                               | Content integrity for published collection entries                                                          |
| `npm run check:workflow`                              | Validates rules, agents, skills, docs, commands, and references (`-- --route <path>` previews rule routing) |
| `npm run quality:static`                              | All static checks (workflow, content, format, lint, types)                                                  |
| `npm run test:e2e:chromium`                           | Routine browser run: desktop and mobile Chromium against a fresh build                                      |
| `npm run test:e2e`                                    | Full matrix: desktop Chromium, Firefox, WebKit, plus mobile Chromium and WebKit                             |
| `npm run perf:audit`                                  | Lighthouse mobile and desktop audit of the build with budgets (`reports/lighthouse/`)                       |
| `npm run quality`                                     | Static checks plus the full browser matrix; the definition of done                                          |
| `npm run quality:full`                                | One build, then static checks, full matrix, and performance audit (the CI sequence)                         |

Details and failure handling: `docs/quality-checks.md`. Performance budgets and baseline: `docs/performance.md`.

## How to work

1. Understand the current implementation and reuse existing components, data, and schemas before adding anything.
2. Keep diffs surgical: only files related to the task, no unrelated reformatting, no repo-wide autofix during feature work.
3. Validate narrowly first, then run `npm run quality:static`; run `npm run test:e2e:chromium` for routine page work and `npm run test:e2e` when pages, layouts, islands, forms, metadata, or shared components changed.
4. Finish with a summary: what changed, what was intentionally left unchanged, what needs human verification, and which checks ran.

Full workflow and definition of done: `.cursor/rules/development-workflow.mdc`.

## Content integrity

Never invent client names, logos, testimonials, certifications, pricing, statistics, case-study outcomes, or performance claims. Verified facts live in `src/data/site.ts` and the "Verified facts" section of `docs/content-strategy.md`. Everything else is proposed content: keep it `draft: true` and say so. Case studies need `approvedByClient: true` and a `resultsSource` for any results.

## Quality bar for every page

Rendered through `BaseLayout` with a unique title and 50-160 character description; one `h1`; accessible markup (WCAG 2.2 AA, automated scan plus manual keyboard pass); clean at 360, 390, 768, 1024, 1440, and 1920 px; answer-first copy; structured data matching visible content; internal links to hub, related pages, and contact; within the Lighthouse budgets. Rules: `.cursor/rules/seo-aeo-geo.mdc`, `.cursor/rules/accessibility-performance.mdc`, `.cursor/rules/styling-tailwind-daisyui.mdc`.

## Where guidance lives

| Topic                                        | File                                                                                                                                |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Purpose, stack, boundaries (always on)       | `.cursor/rules/project-foundation.mdc`                                                                                              |
| Workflow and definition of done (always on)  | `.cursor/rules/development-workflow.mdc`                                                                                            |
| Astro pages, layouts, components             | `.cursor/rules/astro-components-pages.mdc`                                                                                          |
| Vue islands                                  | `.cursor/rules/vue-islands.mdc`                                                                                                     |
| Tailwind, daisyUI, Inspira UI, responsive QA | `.cursor/rules/styling-tailwind-daisyui.mdc`                                                                                        |
| Content collections and writing              | `.cursor/rules/content-collections.mdc`                                                                                             |
| SEO, AEO, GEO                                | `.cursor/rules/seo-aeo-geo.mdc` and `docs/seo-aeo-geo.md`                                                                           |
| Accessibility and performance                | `.cursor/rules/accessibility-performance.mdc` and `docs/performance.md`                                                             |
| Playwright testing and the engine matrix     | `.cursor/rules/testing-playwright.mdc`                                                                                              |
| Forms and Netlify                            | `.cursor/rules/forms-netlify.mdc`                                                                                                   |
| Cleanup                                      | `.cursor/rules/code-cleanup.mdc`                                                                                                    |
| Procedures (skills)                          | `.cursor/skills/{code-cleanup,new-page,content-entry,vue-island,inspira-component,responsive-qa,quality-check,seo-review}/SKILL.md` |
| Specialist subagents                         | `.cursor/agents/{astro-cleanup,content-editor,seo-reviewer,accessibility-reviewer,qa-verifier}.md`                                  |
| Architecture, versions, CI, deployment       | `docs/architecture.md`                                                                                                              |
| Checks, evidence table, task routing         | `docs/quality-checks.md`                                                                                                            |

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
- [Vue integration](https://docs.astro.build/en/guides/integrations-guide/vue/), [Vue guide](https://vuejs.org/guide/), [Tailwind](https://tailwindcss.com/docs/), [daisyUI](https://daisyui.com/docs/), [Inspira UI](https://inspira-ui.com/docs/en/getting-started/installation), [Playwright](https://playwright.dev/docs/), [Lighthouse](https://developer.chrome.com/docs/lighthouse/overview), [Netlify Forms](https://docs.netlify.com/manage/forms/setup/)
