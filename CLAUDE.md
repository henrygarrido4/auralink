@AGENTS.md

## Claude Code notes

The shared instructions above are imported from `AGENTS.md`, which Cursor also reads. Everything under `.cursor/` is written for Cursor and is **not** discovered automatically by Claude Code, so read the relevant file with the Read tool at the start of a matching task and follow it as if it were loaded. `npm run check:workflow -- --route <path>` prints which rules Cursor would attach for a file.

| When the task involves                                | Read first                                                                                                                 |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Anything (the always-on Cursor rules)                 | [project-foundation](.cursor/rules/project-foundation.mdc), [development-workflow](.cursor/rules/development-workflow.mdc) |
| `.astro` pages, layouts, components                   | [astro-components-pages](.cursor/rules/astro-components-pages.mdc)                                                         |
| `.vue` islands or composables                         | [vue-islands](.cursor/rules/vue-islands.mdc)                                                                               |
| CSS, Tailwind, daisyUI, Inspira UI, responsive layout | [styling-tailwind-daisyui](.cursor/rules/styling-tailwind-daisyui.mdc)                                                     |
| Markdown content, schemas, site data                  | [content-collections](.cursor/rules/content-collections.mdc)                                                               |
| Metadata, structured data, search visibility          | [seo-aeo-geo](.cursor/rules/seo-aeo-geo.mdc)                                                                               |
| Accessibility or performance                          | [accessibility-performance](.cursor/rules/accessibility-performance.mdc)                                                   |
| Tests                                                 | [testing-playwright](.cursor/rules/testing-playwright.mdc)                                                                 |
| Contact or inquiry forms                              | [forms-netlify](.cursor/rules/forms-netlify.mdc)                                                                           |
| Cleanup or refactoring                                | [code-cleanup](.cursor/rules/code-cleanup.mdc)                                                                             |

Procedures: treat each `.cursor/skills/<name>/SKILL.md` as a skill and read it before the matching task: [code-cleanup](.cursor/skills/code-cleanup/SKILL.md), [new-page](.cursor/skills/new-page/SKILL.md), [content-entry](.cursor/skills/content-entry/SKILL.md), [vue-island](.cursor/skills/vue-island/SKILL.md), [inspira-component](.cursor/skills/inspira-component/SKILL.md), [responsive-qa](.cursor/skills/responsive-qa/SKILL.md), [quality-check](.cursor/skills/quality-check/SKILL.md), [seo-review](.cursor/skills/seo-review/SKILL.md).

Specialists: when delegating with the Agent tool, read the matching `.cursor/agents/<name>.md` and put its objective, scope, hard rules, and response format into the subagent prompt: [astro-cleanup](.cursor/agents/astro-cleanup.md), [content-editor](.cursor/agents/content-editor.md), [seo-reviewer](.cursor/agents/seo-reviewer.md), [accessibility-reviewer](.cursor/agents/accessibility-reviewer.md), [qa-verifier](.cursor/agents/qa-verifier.md). Reviewer agents are read-only: report, do not edit.

Working agreements for Claude Code sessions:

- Start the dev server with `astro dev --background`; stop it with `astro dev stop` when done. Never test against port 4321; Playwright uses 4322 and the Lighthouse audit uses 4323.
- Run `npm run quality:static` before reporting a task as done, `npm run test:e2e:chromium` for routine page work, and `npm run test:e2e` when layouts, islands, forms, metadata, or shared components changed. State plainly if a check could not run (for example a browser that cannot launch in a sandboxed session).
- After changing anything under `.cursor/`, `docs/`, `AGENTS.md`, or this file, run `npm run check:workflow`.
- Never invent business facts, clients, results, or testimonials; see the content integrity section above.
