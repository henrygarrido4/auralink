# Performance

Laboratory performance measurement for the production build, with regression budgets. Everything on this page is Lighthouse lab data collected on a developer machine: it predicts nothing about real users, and field Core Web Vitals (including INP, which Lighthouse cannot measure) only exist once the live site has traffic and a field data source such as the Chrome User Experience Report or a real-user monitoring tool. The starter baseline below describes an almost empty page; it is a floor for regressions, not a forecast for the finished website.

## How to run

| Command                                                          | What it does                                                                                                                                                                                       |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run perf:audit`                                             | Builds, serves `dist/` on port 4323 with `astro preview --ignore-lock`, audits every built route in mobile and desktop mode three times each, keeps the median run, writes reports, checks budgets |
| `node scripts/perf-audit.mjs --no-build`                         | Same against the existing `dist/` (used by `npm run quality:full` and CI after one shared build)                                                                                                   |
| `npm run perf:audit:quick`                                       | One run per route and device against the existing build; for quick comparisons only                                                                                                                |
| `node scripts/perf-audit.mjs --no-build --routes=/services/seo/` | Audit specific routes (for example before and after adopting a component)                                                                                                                          |

Output: `reports/lighthouse/<timestamp>/` holds one HTML and one JSON report per run plus `summary.json` and `summary.md`; `reports/lighthouse/latest/` holds copies of the latest summary and the median reports. The folder is gitignored. The script exits 1 when any budget is exceeded. It refuses to start if port 4323 is busy so that a dev server is never measured.

## Audit configuration

| Mode    | Form factor | Screen emulation                  | Network and CPU throttling                     |
| ------- | ----------- | --------------------------------- | ---------------------------------------------- |
| mobile  | mobile      | 412x823 @1.75x (mobile emulation) | 150 ms RTT, 1638 kbps down, CPU x4 (simulated) |
| desktop | desktop     | 1350x940 @1x                      | 40 ms RTT, 10240 kbps down, CPU x1 (simulated) |

Lighthouse 13.6.0 CLI, Chrome/159.0.0.0 (Playwright's pinned Chromium at `~/Library/Caches/ms-playwright/chromium-1255/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`; override with `CHROME_PATH`), categories performance, accessibility, best-practices, seo, headless Chrome with `--headless=new`. Runs per route and device: 3; the run with the median performance score is the one reported and checked against budgets. Lighthouse 13 removed its built-in budget file support (`--budget-path`), so budgets are enforced by `scripts/perf-audit.mjs` from `lighthouse.budgets.json`.

## Baseline (2026-11-16)

Environment: Node v24.21.0, darwin 27.2.0, Lighthouse 13.6.0, Chrome/159.0.0.0, throttling method `simulate`. Routes built: / (the starter home page only).

| Route | Device  | Perf | A11y | BP  | SEO | FCP    | LCP    | SI     | TBT  | CLS   | TTI    | Transfer | Requests | Budget |
| ----- | ------- | ---- | ---- | --- | --- | ------ | ------ | ------ | ---- | ----- | ------ | -------- | -------- | ------ |
| /     | mobile  | 1    | 1    | 1   | 1   | 752 ms | 752 ms | 752 ms | 0 ms | 0.000 | 752 ms | 16 KB    | 3        | pass   |
| /     | desktop | 1    | 1    | 1   | 1   | 202 ms | 202 ms | 202 ms | 0 ms | 0.000 | 202 ms | 16 KB    | 3        | pass   |

Run-to-run variance:

- / mobile: performance scores across runs 1, 1, 1; LCP 752 / 752 / 752 ms
- / desktop: performance scores across runs 1, 1, 1; LCP 202 / 202 / 202 ms

Transfer breakdown (median mobile run): document 1.1 KB, script 0 KB, stylesheet 14 KB, image 0 KB, font 0 KB, other 1 KB; 0 third-party requests.

## Findings

- The starter page is a single HTML document, one stylesheet (Tailwind plus daisyUI themes, about 31 KB before compression), and no JavaScript. All four categories score 1.0 on both devices; LCP is the text heading and paints at the first contentful paint.
- There is nothing to optimise yet. The value of this baseline is the harness: every page added later is audited the same way, and the budgets below define when a regression needs attention.
- Watch items as the site grows: web fonts (self-host, subset, `font-display: swap`), hero imagery (`astro:assets`, explicit dimensions, `fetchpriority="high"` on one image), island JavaScript (hydrate lazily, keep script transfer under budget), Inspira effects (canvas and WebGL effects are the likeliest budget breakers), third-party scripts (none allowed without a decision).
- 2026-11-17, home hero added (`node scripts/perf-audit.mjs --no-build`, 3 runs per device, median reported): performance 1 on mobile and desktop, LCP 1052 ms mobile and 282 ms desktop, CLS 0.000, TBT 0 ms, 39.6 KB (mobile) and 44.1 KB (desktop) transferred in 4 requests, all budgets met. The device image ships as AVIF with a WebP fallback at six widths; the mobile run fetched the 640w file (15.4 KB) and the desktop run the 800w file (19.8 KB). The page still loads no JavaScript file: the navbar's short script is inlined.
- 2026-11-17, home introduction added below the hero (same command and runs): performance 1 on mobile and desktop, LCP 1127 ms mobile and 282 ms desktop (still the hero's device image), CLS 0.000, TBT 0 ms, 54.7 KB (mobile) and 59.2 KB (desktop) transferred in 5 requests, all budgets met. The introduction's photo is lazy-loaded with its dimensions reserved, but it sits close enough to the first screen that both runs fetched it: the 640w AVIF, 14.3 KB. Still no JavaScript file.
- 2026-11-17, CI fixes (hero headline at 10% of its column, reduced motion without transitions, round underline join): on the Mac, performance 1 on mobile and desktop, LCP 1127 ms and 282 ms (still the hero's device image), CLS 0.000, TBT 0 ms, 54.8 KB and 59.3 KB in 5 requests, all budgets met. The first Linux run of the audit, in the CI container (`docs/quality-checks.md`), matched it: performance 1 and 1, LCP 1128 ms and 283 ms, 54.1 KB and 58.4 KB, all budgets met. GitHub's own Lighthouse step first ran in run 44244297213 (Ubuntu runner, Node 24) and agreed: performance 1 and 1, LCP 1127 ms and 284 ms, CLS 0.000, 53.9 KB and 58.3 KB in 5 requests, all budgets met.
- 2026-11-18, Catamaran and Mukta (`node scripts/perf-audit.mjs --no-build`, 3 runs, median): performance 1 on mobile and desktop, LCP 1728 ms mobile and 363 ms desktop (still the hero's device image), CLS 0.000, TBT 0 ms, 117.7 KB and 122.1 KB in 8 requests, all budgets met. Font transfer is 60.5 KB on both devices (budget 100 KB): Catamaran's latin variable file, plus Mukta 300 and Mukta 700. The three extra requests are those files. Mobile LCP rose from 1127 ms; it stays inside the 2500 ms budget and the performance score is still 1.
- 2026-11-18, home selected work (`npm run perf:audit`, 3 runs, median): performance 1 on mobile and desktop, LCP 1727 ms mobile and 383 ms desktop (still the hero's device image), CLS 0.000, TBT 0 ms. Mobile transferred 120.9 KB in 8 requests (3.2 KB more, all in the document and stylesheet), desktop 196.4 KB in 10. The section's three photos are lazy and far below the first screen: the mobile run fetched none, and the desktop run fetched two, the barber tools (20.9 KB) and the pool (50.1 KB) as AVIF, so its images total 125.1 KB of the 250 KB budget. The reveal's script is inlined, so the page still loads no JavaScript file. All budgets met.
- 2026-11-18, selected work with platform filters and pop-out props (same command): performance 1 on mobile and desktop, LCP 1727 ms and 383 ms (still the hero's device image), CLS 0.000, TBT 0 ms. Mobile is unchanged at 122.7 KB in 8 requests, fetching none of the section's images. The panels now share one grid cell, so each panel's lazy images load together when the section comes near, and switching filters shows each project at once. The desktop run fetched them all: three photos and six props, the props 5-10 KB each as AVIF. That makes 254.7 KB in 17 requests, with images at 161.7 KB of the 250 KB budget. The page still loads no JavaScript file. All budgets met.

## Budgets (`lighthouse.budgets.json`)

| Budget                                      | Mobile                                                                                   | Desktop         |
| ------------------------------------------- | ---------------------------------------------------------------------------------------- | --------------- |
| Performance score                           | >= 0.9                                                                                   | >= 0.95         |
| Accessibility / best practices / SEO scores | 1 / >= 0.95 / 1                                                                          | 1 / >= 0.95 / 1 |
| First Contentful Paint                      | <= 1800 ms                                                                               | <= 1000 ms      |
| Largest Contentful Paint                    | <= 2500 ms                                                                               | <= 1200 ms      |
| Speed Index                                 | <= 3400 ms                                                                               | <= 1300 ms      |
| Total Blocking Time                         | <= 200 ms                                                                                | <= 150 ms       |
| Cumulative Layout Shift                     | <= 0.1                                                                                   | <= 0.1          |
| Time to Interactive                         | <= 3800 ms                                                                               | <= 2000 ms      |
| Transfer (both)                             | total 500 KB, document 40 KB, script 120 KB, stylesheet 60 KB, image 250 KB, font 100 KB | same            |
| Requests (both)                             | total 30, third-party 0                                                                  | same            |

The mobile metric budgets are the "good" thresholds of the Core Web Vitals and Lighthouse's scoring curve; the desktop budgets are tighter because the desktop preset removes most throttling. Transfer budgets are first estimates for a marketing site with a hero image and one or two islands per page. Raising any budget requires a dated note in the decision log below with the reason; lowering is always allowed.

Decision log:

- 2026-11-16: initial budgets set with the starter baseline.
- 2026-11-16: budgets unchanged; the third-party request count in `scripts/perf-audit.mjs` now only counts `http(s)` requests to another host. It had counted `data:` URLs, so the first visible daisyUI `btn` (the navbar call to action, whose built-in noise texture is an inline `data:` SVG with no network transfer) failed the desktop budget as one third-party request.

## Reading a failure

1. Open `reports/lighthouse/latest/summary.md` for the failing route and device, then the matching `*.report.html` for the audit details.
2. Compare the median run with the other runs in the timestamped folder; a single noisy run does not fail the budget, the median does.
3. Fix the page rather than the budget: image sizing and format, font loading, script hydration strategy, layout reservation for late content.
4. Re-run with `node scripts/perf-audit.mjs --no-build --routes=<route>` after `npm run build`.

## Lab versus field

|         | Lab (this page)                                                      | Field                                                                                           |
| ------- | -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Source  | Lighthouse on a developer machine or CI runner, simulated throttling | Real visitors' browsers                                                                         |
| Metrics | FCP, LCP, SI, TBT, CLS, TTI                                          | LCP, CLS, INP (Core Web Vitals)                                                                 |
| Use     | Catch regressions before deploy                                      | Judge the live experience, Search Console reporting                                             |
| Status  | Baseline recorded above                                              | Not available until the site is live; nothing on this page verifies production INP or field LCP |
