---
name: code-cleanup
description: Perform safe, behaviour-preserving cleanup in Astro, Vue, TypeScript, CSS, and content front matter. Use when the user asks to clean up, refactor, simplify, de-bloat, remove dead code, or improve readability without changing behaviour.
---

# Code cleanup

## When to use

- The task is cleanup or refactor only, with no feature change.
- The user wants dead code, duplication, or clutter removed.
- A file has grown hard to read and the user asks for smaller, safer improvements.

## Instructions

1. Limit scope to files directly related to the request. List them before editing.
2. Read the file and its consumers (imports, routes, tests) to understand what is actually used.
3. Identify low-risk cleanups: unused imports and variables, dead branches, stale comments, duplicated markup an existing component covers, redundant utility classes, props never read, over-eager hydration directives.
4. Apply the smallest behaviour-preserving edits first. Keep rendered output, metadata, URLs, props, emitted events, and content meaning identical.
5. Keep architecture and public interfaces stable unless the user asked for a change.
6. Validate narrowly: `npx eslint <files>`, `npx prettier --check <files>`, then `npm run check` or `npm run check:vue` when types changed, and `npm run test:e2e` when a layout, page, or island was touched.
7. Report what changed, what was intentionally left unchanged, and any risky or uncertain areas.

## Hard constraints

- No behaviour or copy changes unless explicitly requested.
- No broad rewrites or speculative refactors.
- No unrelated file edits; no repo-wide `lint:fix` or `format`.
- No new dependencies, `<style>` blocks, inline styles, or schema changes.
- Content files: formatting and front matter consistency only; facts stay untouched.

## Project guardrails

- Rendered markup lives in `src/pages`, `src/layouts`, `src/components`; islands in `src/components/islands`; content in `src/content`.
- Rule: `.cursor/rules/code-cleanup.mdc`. Subagent: `.cursor/agents/astro-cleanup.md`.
