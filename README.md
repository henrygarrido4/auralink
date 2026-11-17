# Auralink Studio website

Source for [auralinkstudio.com](https://auralinkstudio.com): the marketing, portfolio, insights, and inquiry website of Auralink Studio, built with Astro 7, Tailwind CSS 4, daisyUI 5, Vue 3 islands, Playwright, and Lighthouse. Deployed as a static site on Netlify.

## Commands

All commands run from the project root.

| Command                     | Action                                                                                             |
| :-------------------------- | :------------------------------------------------------------------------------------------------- |
| `npm install`               | Install dependencies, then `npx playwright install chromium firefox webkit` once for browser tests |
| `astro dev --background`    | Start the dev server at `localhost:4321` in the background (`astro dev stop` to stop)              |
| `npm run build`             | Build the production site to `./dist/`                                                             |
| `npm run preview`           | Preview the build locally                                                                          |
| `npm run quality:static`    | Workflow-file, content, format, lint, and type checks                                              |
| `npm run test:e2e:chromium` | Routine browser suites on desktop and mobile Chromium against a fresh build                        |
| `npm run test:e2e`          | Full matrix: Chromium, Firefox, WebKit, mobile Chromium, mobile WebKit                             |
| `npm run perf:audit`        | Lighthouse mobile and desktop audit with budgets; reports in `reports/lighthouse/`                 |
| `npm run quality`           | Static checks plus the full browser matrix; the definition of done                                 |
| `npm run quality:full`      | One build, static checks, full matrix, and performance audit (what CI runs)                        |

## Where to look

- `AGENTS.md`: shared operating instructions for people and coding agents (`CLAUDE.md` imports it for Claude Code).
- `.cursor/rules`, `.cursor/skills`, `.cursor/agents`: scoped rules, procedures, and specialist subagents for Cursor.
- `docs/architecture.md`: stack, versions, decisions, ports, CI, deployment checklist.
- `docs/content-strategy.md`: audience, planned information architecture, verified facts, publishing workflow.
- `docs/quality-checks.md`: what each check validates, requirement-to-evidence table, task routing, manual review list.
- `docs/performance.md`: Lighthouse baseline, budgets, and how to run the audit.
- `docs/seo-aeo-geo.md`: search, answer engine, and generative engine playbook.
