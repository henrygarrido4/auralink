---
name: quality-check
description: Run and interpret the repository's executable quality checks (format, lint, Astro and Vue type checks, content integrity, workflow validation, Playwright smoke, SEO, and accessibility suites). Use before finishing any task or when asked whether the site is ready to ship.
---

# Quality check

Reference: `docs/quality-checks.md`

## When to use

- Before reporting a task as done.
- When the user asks "does everything pass", "is this ready", or to verify a change.
- After dependency, configuration, or instruction-file changes.

## Instructions

1. List changed files with `git status --short`.
2. Targeted first: `npx eslint <files>` and `npx prettier --check <files>` on the changed files. Fix formatting with `npx prettier --write <files>` on those files only.
3. Static suite: `npm run quality:static`. It runs, in order: `check:workflow` (instruction system is valid), `check:content` (content integrity), `format:check`, `lint`, `check` (Astro + TypeScript), `check:vue` (Vue SFC types).
4. Browser suites: `npm run test:e2e:chromium` for routine page work; `npm run test:e2e` (adds Firefox, WebKit, and mobile WebKit) when pages, layouts, islands, forms, metadata, shared components, or content changed. Both rebuild the site and serve it with `astro preview` on port 4322. A single suite: `npx playwright test tests/e2e/layout.spec.ts --project=desktop-chromium`. If Firefox cannot start on the machine, rerun with `PLAYWRIGHT_SKIP_FIREFOX=1` and report that Firefox ran only in CI. After layout changes, open the screenshots in `reports/screenshots/` and describe what you inspected.
   Performance when assets, fonts, scripts, islands, or templates changed: `npm run build` then `node scripts/perf-audit.mjs --no-build`; compare with `docs/performance.md` (lab data, not field data).
5. Interpret failures:
   - `check:workflow`: a rule, agent, skill, or doc reference is malformed or missing; fix the file it names.
   - `check:content`: placeholder text, missing client approval, or results without a source in a published entry; set `draft: true` or supply the missing field.
   - `format:check` / `lint`: run the fix on the named files only.
   - `check` / `check:vue`: type errors; fix the code, do not loosen `tsconfig.json`.
   - `seo.spec.ts`: metadata length, canonical, `h1`, alt, or JSON-LD problem on the named route.
   - `layout.spec.ts`: horizontal overflow, an element past the viewport, or clipped text at the named width; fix the CSS, never hide overflow.
   - `rendering.spec.ts`: a missing asset, a route that should 404, or a broken internal link.
   - `motion.spec.ts`: an animation or smooth scroll ignoring `prefers-reduced-motion`.
   - `navigation.spec.ts`: the navbar no longer matches `primaryNav` or `primaryCta` in `src/data/site.ts`, or the menu dialog below `lg` stopped opening, closing, or returning focus.
   - `perf-audit`: a budget in `lighthouse.budgets.json` exceeded; read `reports/lighthouse/latest/summary.md`.
   - `a11y.spec.ts`: axe violation with rule id and selector; fix the markup.
   - Browser missing: `npx playwright install chromium firefox webkit`.
6. Never loosen a threshold or skip a test to make a check pass. Threshold changes require a documented decision in `docs/quality-checks.md`.
7. Report: a table of commands with pass/fail/not run and the key output for failures, then the definition-of-done status from `.cursor/rules/development-workflow.mdc`.
