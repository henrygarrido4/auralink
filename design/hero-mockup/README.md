# Hero mockup: laptop and phone

Editable source for `src/assets/hero/laptop-phone.webp`, the device image in the home page hero (`src/components/sections/Hero.astro`): a silver laptop in three-quarter view and an upright phone beside it, on a transparent background with soft contact and cast shadows. The devices are generic, with no maker's logo or trade dress.

The screens show **Marl**, a fictional ceramics studio designed for this image. It is concept work, not a client project: never present it as one. When approved client work exists, swap its screenshots in (see below) and update the image's alt text in the hero.

## Files

| File                          | Contents                                                                                       |
| ----------------------------- | ---------------------------------------------------------------------------------------------- |
| `sample-site/desktop.html`    | The sample website at laptop size (1440x900)                                                   |
| `sample-site/mobile.html`     | The same website at phone size (390x844)                                                       |
| `sample-site/sample-site.css` | Styles shared by both pages; Fraunces and Inter, open-licensed, pinned on cdn.jsdelivr.net     |
| `scenes/products.html`        | The sample shop's product photo: three stoneware pieces on a plinth, modelled in three.js      |
| `scenes/devices.html`         | The laptop and phone with the screenshots as screens; `LAYOUT` at the top sets the composition |
| `scenes/kit.js`               | Shared three.js helpers: renderer, rounded shapes, screen textures, contact shadows            |
| `render.mjs`                  | Runs the steps below in headless Chromium and writes the asset                                 |

## Re-render

```sh
node design/hero-mockup/render.mjs
```

It takes about 15 seconds and runs four steps, each writing to `reports/hero-mockup/` (gitignored): `products` (the product photo), `screens` (screenshots of the sample site at 2x and 3x), `devices` (the 3D scene at twice the asset size), and `asset` (crops to the visible pixels, downsizes to 2000px wide, and saves a transparent WebP). Run part of it with `--only=<step>` or `--from=<step>`; `--preview` renders the devices at asset size and skips the asset.

Requirements: network access (three.js 0.170.0 and the fonts load from cdn.jsdelivr.net), Playwright's Chromium (installed for the browser tests), and sharp (installed with Astro). On macOS the scenes render on the GPU through Metal.

The devices step fails if anything visible touches the edge of the frame, because a shadow cut by the frame would show as a hard line on the hero background. Widen `LAYOUT.margins` in `scenes/devices.html` if that happens.

## Changing it

- Screen content: edit the sample-site pages and run the pipeline. The pages load the product photo from `/out/`, a path that only `render.mjs` serves.
- Composition: change `LAYOUT` in `scenes/devices.html` (camera angle and distance, phone position and turn). The page also merges JSON from a `?layout=` query parameter into `LAYOUT`, for scripted side-by-side comparisons.
- Real client work: save the desktop screenshot as `reports/hero-mockup/screen-desktop.png` (2880x1800, 16:10) and the mobile one as `reports/hero-mockup/screen-mobile.png` (1170x2532), then run `node design/hero-mockup/render.mjs --from=devices`. Only publish client work the client has approved.

The hero serves the asset through `astro:assets` as AVIF with a WebP fallback at six widths, so keep the source WebP at full quality; the build does the compression.
