---
name: vue-island
description: Create or modify a Vue 3 Composition API island for interactive UI in the Astro site, choosing the right hydration directive and covering accessibility and tests. Use for navigation drawers, filters, interactive forms, tabs, calculators, or any client-side state.
---

# Vue island

## When to use

- The UI needs client-side state, browser APIs, or user-driven interaction that plain HTML, CSS, or a `<details>` element cannot provide.
- An existing island needs new behaviour.

## Instructions

1. Confirm an island is necessary. If the behaviour is a simple toggle or disclosure, use native HTML (`<details>`, anchor links) or daisyUI's CSS-only patterns inside an Astro component instead.
2. Create `src/components/islands/<Name>.vue` with `<script setup lang="ts">` first and `<template>` second. Type props and emits with the generic forms. Follow `.cursor/rules/vue-islands.mdc`.
3. Keep server-safe: no `window`, `document`, or `localStorage` at module scope; use `onMounted` or event handlers.
4. Put reusable logic in `src/composables/use<Thing>.ts`. Keep islands independent; no global store.
5. Style with Tailwind and daisyUI classes; merge prop-driven classes with `cn()` from `@/lib/utils`. No `<style>` block unless unavoidable.
6. Accessibility: labels for controls, visible focus, keyboard support (Enter, Space, Escape, arrows where expected), focus management for overlays, reduced-motion checks for any animation (`motion-v` or `@vueuse/core` helpers).
7. Use the island from an Astro page with the lightest directive that works: `client:visible` by default, `client:idle` for low priority, `client:load` only for above-the-fold controls, `client:only="vue"` only for browser-only libraries (with a sized fallback). Pass only serialisable props.
8. Forms inside islands follow `.cursor/rules/forms-netlify.mdc` (hidden static form in Astro, `form-name` hidden input, urlencoded POST to `/`).
9. Write `tests/e2e/<feature>.spec.ts` that exercises the interaction with role-based locators and keyboard where relevant.
10. Validate: `npx eslint <file.vue>`, `npx prettier --check <file.vue>`, `npm run check:vue`, `npm run check`, `npm run test:e2e` (the island must behave in Chromium, WebKit, and mobile WebKit; remember Alt+Tab reaches links in WebKit), and `npm run build && node scripts/perf-audit.mjs --no-build --routes=<page>` to confirm the hydration cost stays within budget.

## Checklist before finishing

- [ ] Island is justified; static parts stay in Astro
- [ ] Script-first SFC, typed props and emits, server-safe code
- [ ] Lightest working hydration directive
- [ ] Keyboard, focus, labels, reduced motion handled
- [ ] Playwright spec covers the interaction
