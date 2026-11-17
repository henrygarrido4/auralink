---
name: inspira-component
description: Add an Inspira UI component (Vue + Tailwind visual effect or interaction) to the site safely: check CSS variables, dependencies, server rendering, accessibility, and mobile performance before adoption. Use when a design calls for an animated background, text effect, card interaction, or similar visual enhancement.
---

# Inspira UI component

Docs: https://inspira-ui.com/docs/en/getting-started/installation and the component pages under https://inspira-ui.com/docs/en/components/

## When to use

- A page section needs a visual effect or interaction that Inspira UI provides and that serves the content (hero background, section divider, highlighted card, animated metric only when the metric is verified).
- Replacing an ad-hoc animation with a maintained component.

## Instructions

1. Justify the effect: name the section, what it draws attention to, and why a static treatment is insufficient. Limit effects to one or two per page and never on body text, navigation, or form controls.
2. Open the component's page in the Inspira docs and read its full source, props, and import list before copying anything.
3. Work through the adoption checklist below. Stop and report if any item needs a decision from the owner (a new dependency, a brand colour, a heavy effect above the fold).
4. Copy the component into `src/components/inspira/<Name>.vue`, keeping the original file name. Point imports at `@/lib/utils` and local paths. Keep the component's licence header or attribution comment if present.
5. Adapt to the project: `<script setup lang="ts">` first, typed props, daisyUI semantic colours or `@theme` tokens instead of hard-coded colours where the component allows it, no inline styles beyond values computed from props.
6. Use the component from an Astro section with a sized container to prevent layout shift, hydrated with `client:visible` or `client:idle`.
7. Validate: `npx eslint <file.vue>`, `npm run check:vue`, `npm run test:e2e:chromium` (includes the layout and reduced-motion suites), then `npm run build && node scripts/perf-audit.mjs --no-build --routes=<page>` and compare with `docs/performance.md`.
8. Record the component, its source URL, the date copied, any added dependency, and the audit result in `docs/architecture.md`.

## Adoption checklist

**CSS variables.** Inspira components expect shadcn-style variables (`--background`, `--foreground`, `--primary`, `--border`, `--radius`, and so on) and sometimes a `.dark` class. This project does not define those globally. Either rewrite the component to daisyUI tokens (`bg-base-100`, `text-base-content`, `bg-primary`) or declare only the variables the component reads, in `src/styles/global.css` under a comment naming the component, mapped to daisyUI colour variables so the component follows the theme. The site is light only (`.cursor/rules/styling-tailwind-daisyui.mdc`): keep the component's light styles, drop its `.dark` rules and `dark:` classes, and replace any colour-mode check in its script (`useDark`, `useColorMode`, `usePreferredDark`, `matchMedia('(prefers-color-scheme: dark)')`) with the light value. Verify the component looks the same with the device set to dark.

**Dependencies.** Already installed: `@vueuse/core`, `motion-v`, `tw-animate-css`, `@inspira-ui/plugins` (only `addBackgrounds` is loaded, through `src/styles/inspira-backgrounds.mjs`), `clsx`, `tailwind-merge`. Anything else the component imports (shadcn-vue primitives, `reka-ui`, icon packages, extra Tailwind plugins, three.js or canvas libraries) is a new dependency: get approval first, install the stable release, and note it in `docs/architecture.md`. Do not install component dependencies speculatively.

**Server rendering.** Astro renders the component to HTML at build time. Code that touches `window`, `document`, `ResizeObserver`, `IntersectionObserver`, canvas, WebGL, or `matchMedia` must run in `onMounted` or event handlers. If the component cannot render on the server at all, use `client:only="vue"` with a sized static fallback so the page has no layout shift and still carries its content without JavaScript. Confirm with `npm run build` (no SSR errors) and by reading the page's HTML in `dist/`.

**Accessibility.** Decorative effects get `aria-hidden="true"`; text over an effect keeps 4.5:1 contrast at all times; nothing flashes; no focus trap; interactive effects are keyboard operable or purely decorative. JS-driven loops stop when `prefers-reduced-motion: reduce` is set (the global CSS already shortens CSS animations); `tests/e2e/motion.spec.ts` must still pass.

**Mobile performance.** Run the Lighthouse audit for the page before and after; keep within `lighthouse.budgets.json` (mobile performance 0.9+, total transfer 500 KB, script 120 KB). Prefer CSS-driven effects over canvas or WebGL on the home page above the fold. Check the layout suite screenshots at 360 and 390 px for overflow.

## Checklist before finishing

- [ ] Effect justified and limited
- [ ] CSS variables mapped or component rewritten to daisyUI tokens; dark styles and colour-mode checks removed; unchanged with the device set to dark
- [ ] No unapproved dependency
- [ ] Server-safe, no layout shift, content present without JavaScript
- [ ] Reduced-motion fallback, decorative `aria-hidden`, contrast preserved
- [ ] Lighthouse mobile within budget; recorded in `docs/architecture.md`
