// Draws public/favicon.svg and public/favicon.ico from the owner's mark, src/assets/aura-hero.svg.
// Run: node design/favicon/render.mjs
//
// The mark sits on a near-black tile, as it does in the navbar and on the About section's name
// card: on its own, its yellow is 1.4:1 against a light browser tab, and its lower pixels fade at
// 16px. The SVG keeps the mark's one path as supplied; the ICO holds PNG renders of that SVG for
// browsers and tools that do not read SVG icons. Uses sharp, already installed with Astro.
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const sharp = createRequire(join(root, 'package.json'))('sharp');

/** Change these to redraw the icon; run the script again and look at it in a light and a dark tab. */
const LAYOUT = {
  /** The artwork's box in the mark's own units: the viewBox the About name card draws it in. */
  mark: { x: 0, y: 225, width: 1500, height: 1050 },
  /** Space between the mark's widest points and the tile's sides, in the mark's units. */
  margin: 100,
  /** Corner radius as a share of the tile's side: `rounded-md` on the name card's 44px tile. */
  radius: 6 / 44,
  /** daisyUI light's `neutral`, oklch(14% 0.005 285.823): the navbar's near-black. */
  tile: '#09090b',
  /** Pixel sizes rendered into favicon.ico. */
  icoSizes: [16, 32, 48],
};

const source = readFileSync(join(root, 'src/assets/aura-hero.svg'), 'utf8');
const paths = source.match(/<path\b[^>]*>/g) ?? [];
if (paths.length !== 1) throw new Error(`aura-hero.svg should hold one path, not ${paths.length}`);
const attribute = (name) => paths[0].match(new RegExp(`\\s${name}="([^"]*)"`))?.[1].trim();

const { mark, margin, radius, tile, icoSizes } = LAYOUT;
const side = Math.max(mark.width, mark.height) + 2 * margin;
const x = mark.x + mark.width / 2 - side / 2;
const y = mark.y + mark.height / 2 - side / 2;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} ${side} ${side}"><rect x="${x}" y="${y}" width="${side}" height="${side}" rx="${Math.round(side * radius)}" fill="${tile}"/><path fill="${attribute('fill')}" fill-rule="${attribute('fill-rule') ?? 'nonzero'}" d="${attribute('d')}"/></svg>\n`;
writeFileSync(join(root, 'public/favicon.svg'), svg);

// Rendered at each size rather than scaled down from one large render, so small sizes stay sharp.
const pngs = await Promise.all(
  icoSizes.map((size) =>
    sharp(Buffer.from(svg.replace('<svg ', `<svg width="${size}" height="${size}" `)))
      .png()
      .toBuffer(),
  ),
);

// ICO: a 6-byte header (reserved, type 1 for icons, image count), one 16-byte entry per image
// (width and height with 0 meaning 256, palette size, reserved, planes, bits per pixel, byte
// length, offset), then the images, here PNG.
const header = Buffer.alloc(6);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(pngs.length, 4);
let offset = header.length + 16 * pngs.length;
const entries = pngs.map((png, index) => {
  const entry = Buffer.alloc(16);
  entry.writeUInt8(icoSizes[index] % 256, 0);
  entry.writeUInt8(icoSizes[index] % 256, 1);
  entry.writeUInt16LE(1, 4);
  entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(png.length, 8);
  entry.writeUInt32LE(offset, 12);
  offset += png.length;
  return entry;
});
const ico = Buffer.concat([header, ...entries, ...pngs]);
writeFileSync(join(root, 'public/favicon.ico'), ico);

console.log(
  `favicon.svg ${svg.length} bytes, favicon.ico ${ico.length} bytes (${icoSizes.join(', ')}px)`,
);
