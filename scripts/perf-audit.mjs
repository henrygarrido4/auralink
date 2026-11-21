#!/usr/bin/env node
/**
 * Repeatable Lighthouse audit of the production build (laboratory data).
 *
 *   node scripts/perf-audit.mjs                 build, then audit every built route
 *   node scripts/perf-audit.mjs --no-build      audit the existing dist/
 *   node scripts/perf-audit.mjs --runs=1        one run per route and device (default 3, median kept)
 *   node scripts/perf-audit.mjs --routes=/,/about/
 *   node scripts/perf-audit.mjs --sample        every top-level page, and from each directory of
 *                                               detail pages only the one with the largest HTML
 *                                               (what CI and `npm run quality:full` audit)
 *
 * What it does:
 *   1. Serves dist/ with `astro preview --port 4323 --ignore-lock` (never a dev server).
 *   2. Runs the Lighthouse CLI for each route in mobile (default emulation: Moto G Power,
 *      simulated slow 4G, 4x CPU slowdown) and desktop (`--preset=desktop`) mode, N times
 *      each, using Playwright's pinned Chromium unless CHROME_PATH is set.
 *   3. Keeps the median run (by performance score), writes every run's HTML and JSON report
 *      plus summary.json and summary.md into reports/lighthouse/<timestamp>/ and copies the
 *      summary and median reports into reports/lighthouse/latest/.
 *   4. Compares the median run against lighthouse.budgets.json and exits 1 on any overage.
 *
 * Transfer budgets cover the site's own resources, those served from the page's origin; what a
 * third party sends (the contact page's Calendly scheduler, an iframe with its own scripts and
 * styles) counts toward the third-party request budget alone and is reported beside the total.
 * A route listed under `routes` in lighthouse.budgets.json takes its own values for the keys it
 * names, over the defaults (docs/performance.md, "Budgets").
 *
 * Lab results are not field Core Web Vitals: INP and real-user LCP/CLS can only come from
 * users of the live site. See docs/performance.md.
 */
import { spawn } from 'node:child_process';
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { hostname, platform, release } from 'node:os';
import { join, relative, resolve, sep } from 'node:path';
import { chromium } from '@playwright/test';

const root = resolve(new URL('..', import.meta.url).pathname);
const args = process.argv.slice(2);
const flag = (name) => args.find((a) => a === `--${name}` || a.startsWith(`--${name}=`));
const flagValue = (name, fallback) => {
  const found = flag(name);
  return found && found.includes('=') ? found.split('=').slice(1).join('=') : fallback;
};

const PORT = 4323;
const BASE = `http://localhost:${PORT}`;
const RUNS = Number(flagValue('runs', 3));
const BUILD = !flag('no-build');
const SAMPLE = !!flag('sample');
const DEVICES = ['mobile', 'desktop'];
const CATEGORIES = ['performance', 'accessibility', 'best-practices', 'seo'];
const METRICS = [
  'first-contentful-paint',
  'largest-contentful-paint',
  'speed-index',
  'total-blocking-time',
  'cumulative-layout-shift',
  'interactive',
];
const budgets = JSON.parse(readFileSync(join(root, 'lighthouse.budgets.json'), 'utf8'));
const chromePath = process.env.CHROME_PATH || chromium.executablePath();

function run(command, commandArgs, options = {}) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, commandArgs, { cwd: root, stdio: 'inherit', ...options });
    child.on('error', reject);
    child.on('exit', (code) =>
      code === 0 ? resolvePromise() : reject(new Error(`${command} exited with ${code}`)),
    );
  });
}

function builtRoutes() {
  const dist = join(root, 'dist');
  const routes = [];
  const visit = (dir) => {
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      if (statSync(full).isDirectory()) visit(full);
      else if (name.endsWith('.html')) {
        const relPath = relative(dist, full).split(sep).join('/');
        if (relPath === '404.html') continue;
        routes.push(
          relPath === 'index.html'
            ? '/'
            : `/${relPath.replace(/\/index\.html$/, '/').replace(/\.html$/, '')}`,
        );
      }
    }
  };
  visit(dist);
  return routes.sort();
}

/** The built HTML file of a route, as `builtRoutes()` derived the route from it. */
function htmlFile(route) {
  const dist = join(root, 'dist');
  return route.endsWith('/') ? join(dist, route, 'index.html') : join(dist, `${route}.html`);
}

/**
 * The routes CI audits (`--sample`): every top-level page (`/`, `/about/`, `/services/`, ...) and,
 * from each directory of detail pages built from one template (`/services/<slug>/`,
 * `/industries/<slug>/`), only the page with the largest HTML file, the fullest instance of its
 * template. Pages from one template share their stylesheet, fonts, scripts, and layout, so one
 * audit stands for the rest. Auditing all of them, three runs on two devices each, outgrew the CI
 * job's time limit once the twenty-five detail pages were added (2026-11-20). A detail page whose
 * own data adds images or scripts still wants `--routes=<route>` by hand.
 */
function sampleRoutes(routes) {
  const topLevel = [];
  const largestPerDirectory = new Map();
  for (const route of routes) {
    const segments = route.split('/').filter(Boolean);
    if (segments.length < 2) {
      topLevel.push(route);
      continue;
    }
    const directory = `/${segments.slice(0, -1).join('/')}/`;
    const size = statSync(htmlFile(route)).size;
    const current = largestPerDirectory.get(directory);
    if (!current || size > current.size) largestPerDirectory.set(directory, { route, size });
  }
  return [...topLevel, ...[...largestPerDirectory.values()].map((entry) => entry.route)].sort();
}

async function waitForServer(url, attempts = 60) {
  for (let i = 0; i < attempts; i += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`preview server did not respond at ${url}`);
}

async function portIsFree(url) {
  try {
    await fetch(url);
    return false;
  } catch {
    return true;
  }
}

function slugify(route) {
  return route === '/' ? 'home' : route.replace(/^\/|\/$/g, '').replace(/\//g, '-');
}

function summarize(report) {
  const scores = Object.fromEntries(
    CATEGORIES.map((c) => [c, report.categories[c]?.score ?? null]),
  );
  const metrics = Object.fromEntries(
    METRICS.map((m) => [m, report.audits[m]?.numericValue ?? null]),
  );
  const items = report.audits['network-requests']?.details?.items ?? [];
  const transferKB = {
    total: 0,
    document: 0,
    script: 0,
    stylesheet: 0,
    image: 0,
    font: 0,
    other: 0,
  };
  let thirdParty = 0;
  let thirdPartyKB = 0;
  for (const item of items) {
    const kb = (item.transferSize ?? 0) / 1024;
    let external = false;
    try {
      const { protocol, hostname } = new URL(item.url);
      // data: and blob: URLs parse without a host and never leave the page; only http(s) can be third-party.
      external = protocol.startsWith('http') && hostname !== 'localhost';
    } catch {
      // unparsable URL
    }
    if (external) {
      // Another origin's bytes are its own: counted as a request, reported, and kept out of the
      // site's transfer budgets (see the header comment).
      thirdParty += 1;
      thirdPartyKB += kb;
      continue;
    }
    transferKB.total += kb;
    const type = String(item.resourceType ?? 'Other').toLowerCase();
    if (type in transferKB) transferKB[type] += kb;
    else transferKB.other += kb;
  }
  for (const key of Object.keys(transferKB))
    transferKB[key] = Math.round(transferKB[key] * 10) / 10;
  return {
    scores,
    metrics,
    transferKB,
    thirdPartyKB: Math.round(thirdPartyKB * 10) / 10,
    requests: { total: items.length, 'third-party': thirdParty },
  };
}

/** The budgets for a route: the defaults, with the values its `routes` entry names in their place. */
function budgetsFor(route) {
  const own = budgets.routes?.[route];
  if (!own) return budgets;
  return {
    scores: Object.fromEntries(
      DEVICES.map((device) => [device, { ...budgets.scores[device], ...own.scores?.[device] }]),
    ),
    metrics: Object.fromEntries(
      DEVICES.map((device) => [device, { ...budgets.metrics[device], ...own.metrics?.[device] }]),
    ),
    resources: {
      transferKB: { ...budgets.resources.transferKB, ...own.resources?.transferKB },
      requests: { ...budgets.resources.requests, ...own.resources?.requests },
    },
  };
}

function checkBudgets(route, device, summary) {
  const failures = [];
  const limits = budgetsFor(route);
  for (const [category, min] of Object.entries(limits.scores[device] ?? {})) {
    const actual = summary.scores[category];
    if (actual === null || actual < min) failures.push(`${category} score ${actual} < ${min}`);
  }
  for (const [metric, max] of Object.entries(limits.metrics[device] ?? {})) {
    const actual = summary.metrics[metric];
    if (actual === null || actual > max)
      failures.push(`${metric} ${Math.round(actual * 1000) / 1000} > ${max}`);
  }
  for (const [type, max] of Object.entries(limits.resources.transferKB ?? {})) {
    if (summary.transferKB[type] > max)
      failures.push(`${type} transfer ${summary.transferKB[type]} KB > ${max} KB`);
  }
  for (const [kind, max] of Object.entries(limits.resources.requests ?? {})) {
    if (summary.requests[kind] > max)
      failures.push(`${kind} requests ${summary.requests[kind]} > ${max}`);
  }
  return failures;
}

function fmt(value, metric) {
  if (value === null || value === undefined) return 'n/a';
  if (metric === 'cumulative-layout-shift') return value.toFixed(3);
  return `${Math.round(value)} ms`;
}

async function main() {
  if (!(await portIsFree(BASE))) {
    throw new Error(
      `${BASE} is already in use; stop that server first so the audit never measures a dev server.`,
    );
  }
  if (BUILD) await run('node_modules/.bin/astro', ['build']);
  if (!existsSync(join(root, 'dist'))) throw new Error('dist/ is missing; run without --no-build');

  const routes = flagValue('routes')
    ? flagValue('routes').split(',')
    : SAMPLE
      ? sampleRoutes(builtRoutes())
      : builtRoutes();
  const coverage = flagValue('routes')
    ? 'the routes given'
    : SAMPLE
      ? 'every top-level page and the largest page of each directory of detail pages'
      : 'every built route';
  console.log(`perf-audit: auditing ${routes.length} route(s), ${coverage}: ${routes.join(' ')}`);
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outDir = join(root, 'reports', 'lighthouse', stamp);
  const latestDir = join(root, 'reports', 'lighthouse', 'latest');
  mkdirSync(outDir, { recursive: true });

  const preview = spawn(
    'node_modules/.bin/astro',
    ['preview', '--port', String(PORT), '--ignore-lock'],
    {
      cwd: root,
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );
  const stopPreview = () => {
    if (!preview.killed) preview.kill('SIGTERM');
  };
  process.on('exit', stopPreview);

  const results = [];
  let environment = null;
  try {
    await waitForServer(BASE);
    for (const route of routes) {
      for (const device of DEVICES) {
        const runs = [];
        for (let i = 1; i <= RUNS; i += 1) {
          const base = join(outDir, `${slugify(route)}-${device}-run${i}`);
          const lhArgs = [
            `${BASE}${route}`,
            `--only-categories=${CATEGORIES.join(',')}`,
            '--output=json',
            '--output=html',
            `--output-path=${base}`,
            '--chrome-flags=--headless=new --no-sandbox',
            '--quiet',
          ];
          if (device === 'desktop') lhArgs.push('--preset=desktop');
          await run('node_modules/.bin/lighthouse', lhArgs, {
            env: { ...process.env, CHROME_PATH: chromePath },
          });
          const jsonPath = existsSync(`${base}.report.json`)
            ? `${base}.report.json`
            : `${base}.json`;
          const report = JSON.parse(readFileSync(jsonPath, 'utf8'));
          environment ??= {
            lighthouse: report.lighthouseVersion,
            chrome: report.environment?.hostUserAgent?.match(/Chrome\/[\d.]+/)?.[0] ?? 'unknown',
            chromePath,
            node: process.version,
            os: `${platform()} ${release()} (${hostname()})`,
            throttlingMethod: report.configSettings.throttlingMethod,
          };
          runs.push({
            run: i,
            report: relative(root, jsonPath).replace(/\.json$/, ''),
            formFactor: report.configSettings.formFactor,
            screen: report.configSettings.screenEmulation,
            throttling: report.configSettings.throttling,
            ...summarize(report),
          });
        }
        const sorted = [...runs].sort(
          (a, b) => (a.scores.performance ?? 0) - (b.scores.performance ?? 0),
        );
        const median = sorted[Math.floor(sorted.length / 2)];
        results.push({
          route,
          device,
          median,
          runs,
          budgetFailures: checkBudgets(route, device, median),
        });
      }
    }
  } finally {
    stopPreview();
  }

  const summary = {
    generatedAt: new Date().toISOString(),
    runsPerConfig: RUNS,
    coverage,
    environment,
    budgets,
    results,
  };
  writeFileSync(join(outDir, 'summary.json'), JSON.stringify(summary, null, 2));

  const lines = [
    `# Lighthouse baseline (${summary.generatedAt})`,
    '',
    `Lighthouse ${environment.lighthouse}, ${environment.chrome}, Node ${environment.node}, ${environment.os}. Throttling: ${environment.throttlingMethod}. ${RUNS} run(s) per route and device; the median run by performance score is reported. Routes: ${coverage} (${routes.length}). Transfer is the site's own; a third party's bytes follow in parentheses. Lab data only.`,
    '',
    '| Route | Device | Perf | A11y | BP | SEO | FCP | LCP | SI | TBT | CLS | TTI | Transfer | Requests | Budget |',
    '| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |',
  ];
  for (const r of results) {
    const m = r.median;
    const transfer = m.thirdPartyKB
      ? `${m.transferKB.total} KB (+${m.thirdPartyKB} KB third-party)`
      : `${m.transferKB.total} KB`;
    lines.push(
      `| ${r.route} | ${r.device} | ${m.scores.performance} | ${m.scores.accessibility} | ${m.scores['best-practices']} | ${m.scores.seo} | ${fmt(m.metrics['first-contentful-paint'])} | ${fmt(m.metrics['largest-contentful-paint'])} | ${fmt(m.metrics['speed-index'])} | ${fmt(m.metrics['total-blocking-time'])} | ${fmt(m.metrics['cumulative-layout-shift'], 'cumulative-layout-shift')} | ${fmt(m.metrics.interactive)} | ${transfer} | ${m.requests.total} | ${r.budgetFailures.length ? 'FAIL' : 'pass'} |`,
    );
  }
  for (const r of results) {
    if (r.budgetFailures.length) {
      lines.push(
        '',
        `## Budget failures: ${r.route} (${r.device})`,
        '',
        ...r.budgetFailures.map((f) => `- ${f}`),
      );
    }
  }
  lines.push('', `Reports: ${relative(root, outDir)}/ (one HTML and JSON per run).`, '');
  writeFileSync(join(outDir, 'summary.md'), lines.join('\n'));

  mkdirSync(latestDir, { recursive: true });
  cpSync(join(outDir, 'summary.json'), join(latestDir, 'summary.json'));
  cpSync(join(outDir, 'summary.md'), join(latestDir, 'summary.md'));
  for (const r of results) {
    for (const ext of ['html', 'json']) {
      const src = join(root, `${r.median.report}.${ext}`);
      if (existsSync(src))
        cpSync(src, join(latestDir, `${slugify(r.route)}-${r.device}.report.${ext}`));
    }
  }

  console.log(lines.join('\n'));
  const failed = results.filter((r) => r.budgetFailures.length);
  if (failed.length) {
    console.error(
      `\nperf-audit: ${failed.length} route/device combination(s) exceed lighthouse.budgets.json.`,
    );
    process.exit(1);
  }
  console.log(
    `perf-audit: OK. ${results.length} route/device combinations within budget. Latest copies in ${relative(root, latestDir)}/.`,
  );
}

main().catch((error) => {
  console.error(`perf-audit: ${error.message}`);
  process.exit(1);
});
