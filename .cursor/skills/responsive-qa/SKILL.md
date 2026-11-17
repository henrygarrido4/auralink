---
name: responsive-qa
description: Verify and fix layout across representative viewport widths (360, 390, 768, 1024, 1440, 1920) using the Playwright layout suite, screenshot inspection, and keyboard checks. Use for responsive bug reports, new sections or templates, and before handing off layout work.
---

# Responsive QA

## When to use

- A layout, overflow, wrapping, overlap, or spacing problem is reported at some width or device.
- A new section, page template, or island changes layout.
- Before declaring front-end work done (part of the definition of done for templates).

## Instructions

1. Reproduce with the automated suite first: `npx playwright test tests/e2e/layout.spec.ts --project=desktop-chromium`. It visits every built page at 360x740, 390x844, 768x1024, 1024x768, 1440x900, and 1920x1080, fails on horizontal page overflow, elements extending past the viewport, or clipped text, and writes full-page screenshots to `reports/screenshots/<page>-<width>x<height>-<label>.png`.
2. Inspect the screenshots (open the PNG files; agents use their image-reading tool). Look at text wrapping, spacing rhythm, overlap, image sizing, and whether the h1 and primary call to action sit above the fold at 390 and 1440. Screenshot capture is not inspection: say which files you looked at and what you saw.
3. For a width that is not in the list, reproduce with `npm run test:e2e:ui` (resize the viewport) or a one-off `page.setViewportSize` in a scratch spec; do not add every width to the suite.
4. Fix mobile-first with Tailwind utilities: `min-w-0` on flex children, `break-words` or `hyphens-auto` for long words, `max-w-*` containers, responsive grids (`grid-cols-1 md:grid-cols-2`), images `w-full h-auto` with explicit `width` and `height`, no fixed pixel widths, no `overflow-hidden` to hide a symptom.
5. Re-run `tests/e2e/layout.spec.ts` and the mobile projects: `npx playwright test --project=mobile-chromium --project=mobile-webkit`. Run `npm run test:e2e` when the change touches a shared layout or component.
6. Keyboard check at a mobile and a desktop width: Tab through the controls, confirm visible focus, confirm the skip link appears on focus (in WebKit use Alt+Tab to reach links, which mirrors Safari's default).
7. Report: widths and engines verified, screenshot files inspected, remaining risks. State that mobile checks used browser emulation, not physical devices.

## Checklist before finishing

- [ ] `layout.spec.ts` passes at all six widths
- [ ] Screenshots inspected and findings written down
- [ ] Mobile Chromium and mobile WebKit projects pass
- [ ] Keyboard pass at mobile and desktop widths
- [ ] No fixed widths or symptom-hiding overflow rules added
