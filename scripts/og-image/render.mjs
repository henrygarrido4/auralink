#!/usr/bin/env node
/**
 * Draws public/og-image.png, the link-preview image every page sends (`socialImage` in
 * src/data/site.ts): a 1200x630 card after the home hero, from template.html beside this file.
 * Run with `npm run og:image`. It is not part of the build; the PNG is committed, so run it again
 * when the logo, the mark, the fonts, or the template change.
 *
 * The template's placeholders take the repository's own pieces, inlined so the page fetches
 * nothing: the navbar logo (src/assets/aura.svg), the hero's mark (src/assets/aura-hero.svg, in
 * the viewBox the hero draws it in), and the Mukta 700 and Catamaran files the site itself serves,
 * read from Astro's font cache (.astro/fonts/, written by `npm run build` or `astro dev`), so the
 * card is set in the same font files as the pages. Playwright's Chromium renders it at 1200x630
 * with a device scale factor of 1 once document.fonts is ready. Before the screenshot the script
 * checks that both faces loaded (so a missing file never falls back to a system face unnoticed)
 * and that the logo, each text block, and the mark keep LAYOUT.inset from every edge without
 * overlapping; after it, that the PNG is 1200x630 and under LAYOUT.maxBytes.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../..');
const output = join(root, 'public/og-image.png');
const fontsDir = join(root, '.astro/fonts');

const LAYOUT = {
  /** Open Graph's recommended size, and what BaseLayout declares in og:image:width and height. */
  width: 1200,
  height: 630,
  /** Least distance from any edge to the logo, the text, and the mark; the template's --inset. */
  inset: 60,
  /** The hero draws the mark in this viewBox: the file's artwork band, with the empty rows cut. */
  markViewBox: '0 225 1500 1050',
  /** Link previews are fetched by every share, so the file stays small. */
  maxBytes: 1024 * 1024,
};

/**
 * One of the site's font files as a data URL, found by the role and weight in its cache name
 * (`font-<cssVariable without "--font-">-<weight>-normal-latin-<hash>.woff2`; astro.config.mjs).
 * @param {'headers' | 'main'} role
 * @param {number} weight
 */
function fontDataUrl(role, weight) {
  const prefix = `font-${role}-${weight}-normal-latin-`;
  let names;
  try {
    names = readdirSync(fontsDir);
  } catch {
    names = [];
  }
  const name = names.find((entry) => entry.startsWith(prefix) && entry.endsWith('.woff2'));
  if (!name) {
    throw new Error(
      `${relative(root, fontsDir)} has no ${prefix}*.woff2. Run \`npm run build\` first: it downloads the site's fonts into that cache.`,
    );
  }
  return `data:font/woff2;base64,${readFileSync(join(fontsDir, name)).toString('base64')}`;
}

/** The hero's mark: the file's one path, as supplied, in the viewBox the hero trims it to. */
function heroMark() {
  const source = readFileSync(join(root, 'src/assets/aura-hero.svg'), 'utf8');
  const paths = source.match(/<path\b[^>]*>/g) ?? [];
  if (paths.length !== 1)
    throw new Error(`aura-hero.svg should hold one path, not ${paths.length}`);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${LAYOUT.markViewBox}" data-box="mark" aria-hidden="true">${paths[0]}</svg>`;
}

const pieces = {
  'font-headers': fontDataUrl('headers', 700),
  'font-main': fontDataUrl('main', 400),
  logo: readFileSync(join(root, 'src/assets/aura.svg'), 'utf8'),
  mark: heroMark(),
};
const html = readFileSync(join(here, 'template.html'), 'utf8').replace(
  /\{\{([a-z-]+)\}\}/g,
  (placeholder, name) => {
    if (!(name in pieces))
      throw new Error(`template.html has an unknown placeholder ${placeholder}`);
    return pieces[/** @type {keyof typeof pieces} */ (name)];
  },
);

const browser = await chromium.launch();
try {
  const page = await browser.newPage({
    viewport: { width: LAYOUT.width, height: LAYOUT.height },
    deviceScaleFactor: 1,
  });
  await page.setContent(html, { waitUntil: 'load' });

  const faces = await page.evaluate(async () => {
    await document.fonts.ready;
    return [...document.fonts].map((face) => `${face.family} ${face.weight} ${face.status}`);
  });
  const expectedFaces = ['Mukta 700 loaded', 'Catamaran 400 loaded'];
  if (faces.join() !== expectedFaces.join()) {
    throw new Error(`expected ${expectedFaces.join(', ')}; got ${faces.join(', ') || 'no faces'}`);
  }

  // Every placed piece inside the inset, and no two of them overlapping.
  const boxes = await page.evaluate(() =>
    [...document.querySelectorAll('[data-box]')].map((element) => {
      const { left, top, right, bottom } = element.getBoundingClientRect();
      return { name: element.getAttribute('data-box') ?? '', left, top, right, bottom };
    }),
  );
  const problems = [];
  const { inset, width, height } = LAYOUT;
  for (const box of boxes) {
    if (
      box.left < inset ||
      box.top < inset ||
      box.right > width - inset ||
      box.bottom > height - inset
    ) {
      problems.push(`${box.name} is within ${inset}px of an edge (${describe(box)})`);
    }
  }
  for (const [index, a] of boxes.entries()) {
    for (const b of boxes.slice(index + 1)) {
      if (a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom) {
        problems.push(`${a.name} overlaps ${b.name} (${describe(a)}; ${describe(b)})`);
      }
    }
  }
  if (problems.length) throw new Error(problems.join('\n'));

  await page.screenshot({ path: output, type: 'png' });
  for (const box of boxes) console.log(`  ${box.name.padEnd(8)} ${describe(box)}`);
} finally {
  await browser.close();
}

// The PNG's own header says its size (IHDR: width and height at bytes 16 and 20).
const png = readFileSync(output);
const size = { width: png.readUInt32BE(16), height: png.readUInt32BE(20) };
if (size.width !== LAYOUT.width || size.height !== LAYOUT.height) {
  throw new Error(`${relative(root, output)} is ${size.width}x${size.height}`);
}
if (png.length > LAYOUT.maxBytes) {
  throw new Error(`${relative(root, output)} is ${png.length} bytes, over ${LAYOUT.maxBytes}`);
}
console.log(`${relative(root, output)}: ${size.width}x${size.height}, ${png.length} bytes`);

/** @param {{ left: number; top: number; right: number; bottom: number }} box */
function describe(box) {
  const r = Math.round;
  return `x ${r(box.left)}-${r(box.right)}, y ${r(box.top)}-${r(box.bottom)}`;
}
