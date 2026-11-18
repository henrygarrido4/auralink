#!/usr/bin/env node
/**
 * Renders the home hero's laptop-and-phone image, src/assets/hero/laptop-phone.webp, from the
 * editable sources in this folder (see README.md):
 *
 *   1. screens   screens/*.png            -> reports/hero-mockup/screen-desktop.png, screen-mobile.png
 *   2. devices   scenes/devices.html     -> reports/hero-mockup/devices.png (transparent, 2x size)
 *   3. asset     devices.png, cropped to its visible pixels and downscaled
 *                                        -> src/assets/hero/laptop-phone.webp
 *
 * `screens/desktop.png` (2880x1800) and `screens/mobile.png` (1170x2532) are the pages on the
 * devices. `--only=products` still renders the earlier sample shop's product photo; nothing in the
 * default pipeline uses it.
 *
 * Usage: node design/hero-mockup/render.mjs [--from=<step>] [--only=<step>] [--preview]
 * `--preview` renders the devices at a quarter of the final pixel count and skips the asset.
 * Needs network access: the pages load three.js and fonts from cdn.jsdelivr.net (pinned versions).
 * Uses Playwright's Chromium (GPU through Metal on macOS) and sharp, both already installed.
 */
import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, normalize, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../..');
const require = createRequire(join(root, 'package.json'));
const { chromium } = require('@playwright/test');
const sharp = require('sharp');

const outDir = join(root, 'reports/hero-mockup');
const assetPath = join(root, 'src/assets/hero/laptop-phone.webp');
/** The devices scene renders at twice this size; the asset is cropped to its visible pixels. */
const RENDER = { width: 2000, height: 1400 };
/** Width of the finished asset in pixels; its height follows from the crop. */
const ASSET_WIDTH = 2000;
/** Alpha at or below this is invisible on the hero background and is cropped away. */
const VISIBLE_ALPHA = 2;

const args = Object.fromEntries(
  process.argv.slice(2).map((arg) => {
    const [key, value = 'true'] = arg.replace(/^--/, '').split('=');
    return [key, value];
  }),
);
const steps = [...(args.only === 'products' ? ['products'] : []), 'screens', 'devices', 'asset'];
const preview = args.preview === 'true';
const selected = steps.filter((step, index) => {
  if (preview && step === 'asset') return false;
  if (args.only) return step === args.only;
  if (args.from) return index >= steps.indexOf(args.from);
  return true;
});

mkdirSync(outDir, { recursive: true });

// Pages are served from a private origin so modules and textures load without file:// limits.
const origin = 'http://hero-mockup.local';
const browser = await chromium.launch({
  args: process.platform === 'darwin' ? ['--use-angle=metal', '--enable-gpu'] : [],
});

/** A browser context that serves this folder, and `/out/` from the intermediate output folder. */
async function servingContext(options = {}) {
  const context = await browser.newContext(options);
  await context.route(`${origin}/**`, async (route) => {
    const { pathname } = new URL(route.request().url());
    const base = pathname.startsWith('/out/') ? outDir : here;
    const file = normalize(join(base, decodeURIComponent(pathname.replace(/^\/out\//, '/'))));
    if (relative(base, file).startsWith('..')) return route.fulfill({ status: 403 });
    return route.fulfill({ path: file }).catch(() => route.fulfill({ status: 404 }));
  });
  return context;
}

/** Opens a scene page and waits for its PNG data URL. */
async function renderScene(path, size) {
  const context = await servingContext();
  const page = await context.newPage();
  page.on('console', (message) => {
    if (message.type() === 'error') console.error(`  [${path}] ${message.text()}`);
  });
  await page.goto(`${origin}${path}?w=${size.width}&h=${size.height}`);
  await page.waitForFunction(() => window.__rendered || window.__renderError, null, {
    timeout: 180_000,
  });
  const { data, error } = await page.evaluate(() => ({
    data: window.__rendered,
    error: window.__renderError,
  }));
  await context.close();
  if (error) throw new Error(`${path}: ${error}`);
  return Buffer.from(data.split(',')[1], 'base64');
}

/**
 * The composition sits on the hero background, so nothing may touch the frame: a shadow cut by
 * the edge would show as a hard line. Fails when any pixel in the outer band is not transparent.
 */
async function assertClearEdges(png, band = 4) {
  const { data, info } = await sharp(png).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const worst = { top: 0, right: 0, bottom: 0, left: 0 };
  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      const alpha = data[(y * info.width + x) * 4 + 3];
      if (y < band) worst.top = Math.max(worst.top, alpha);
      if (y >= info.height - band) worst.bottom = Math.max(worst.bottom, alpha);
      if (x < band) worst.left = Math.max(worst.left, alpha);
      if (x >= info.width - band) worst.right = Math.max(worst.right, alpha);
    }
  }
  const touching = Object.entries(worst).filter(([, alpha]) => alpha > VISIBLE_ALPHA);
  if (touching.length) {
    const sides = touching.map(([side, alpha]) => `${side} ${alpha}/255`).join(', ');
    throw new Error(
      `the devices render touches its frame (edge alpha: ${sides}); widen LAYOUT.margins`,
    );
  }
}

/** Bounding box of the pixels whose alpha is above VISIBLE_ALPHA, grown by `pad` pixels. */
async function visibleBox(png, pad) {
  const { data, info } = await sharp(png).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let [minX, minY, maxX, maxY] = [info.width, info.height, -1, -1];
  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      if (data[(y * info.width + x) * 4 + 3] > VISIBLE_ALPHA) {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
    }
  }
  const left = Math.max(0, minX - pad);
  const top = Math.max(0, minY - pad);
  return {
    left,
    top,
    width: Math.min(info.width, maxX + pad + 1) - left,
    height: Math.min(info.height, maxY + pad + 1) - top,
  };
}

for (const step of selected) {
  const started = Date.now();
  if (step === 'products') {
    writeFileSync(
      join(outDir, 'products.png'),
      await renderScene('/scenes/products.html', { width: 1200, height: 1240 }),
    );
  } else if (step === 'screens') {
    const sources = [
      ['desktop.png', 'screen-desktop.png', 2880, 1800],
      ['mobile.png', 'screen-mobile.png', 1170, 2532],
    ];
    for (const [name, dest, width, height] of sources) {
      const source = join(here, 'screens', name);
      const meta = await sharp(source).metadata();
      if (meta.width !== width || meta.height !== height) {
        throw new Error(`${name} is ${meta.width}x${meta.height}; expected ${width}x${height}`);
      }
      copyFileSync(source, join(outDir, dest));
    }
  } else if (step === 'devices') {
    const scale = preview ? 1 : 2;
    const png = await renderScene('/scenes/devices.html', {
      width: RENDER.width * scale,
      height: RENDER.height * scale,
    });
    await assertClearEdges(png);
    writeFileSync(join(outDir, preview ? 'devices-preview.png' : 'devices.png'), png);
  } else if (step === 'asset') {
    // Crop to the visible pixels (shadow tails included), then downscale: the 2x render
    // supersamples every edge. The WebP keeps the alpha channel.
    const source = join(outDir, 'devices.png');
    const crop = await visibleBox(source, 8);
    const info = await sharp(source)
      .extract(crop)
      .resize({ width: ASSET_WIDTH, kernel: 'lanczos3' })
      .webp({ quality: 92, alphaQuality: 100, effort: 6, smartSubsample: true })
      .toFile(assetPath);
    console.log(`  ${relative(root, assetPath)}: ${info.width}x${info.height}, ${info.size} bytes`);
  }
  console.log(`${step}: ${((Date.now() - started) / 1000).toFixed(1)} s`);
}

await browser.close();
