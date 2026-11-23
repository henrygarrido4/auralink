# Hero mockup: laptop and phone

Editable source for `src/assets/hero/laptop-phone.webp`, the device image the home page hero (`src/components/sections/Hero.astro`) showed until 2026-11-22, when the owner's brief put the logo's mark in its place. Nothing imports the image now; it and this source are kept for reuse. The image is a silver laptop in three-quarter view and an upright phone beside it, on a transparent background with soft contact and cast shadows. The devices are generic, with no maker's logo or trade dress. Both turn to the left, with the phone on the laptop's left (the owner's request, 2026-11-22; see `facing` under "Changing it").

The screens show a fictional heating and cooling homepage, **Sableline Heating & Air**, drawn in `sample-site/` on 2026-11-18. The owner asked for the devices to show a construction or HVAC website rather than one of their own. HVAC was used because a tune-up each season is the return visit the hero's email line is about. It is not a client, a result, or a real business. The phone number is in the fictional 555 range. The person in the photograph is not an employee and does not endorse the sample or Auralink Studio. The hero's alt text calls it a sample. Do not describe the screen as client work.

The selected-work cards are separate. They still show the three projects the owner supplied.

## Files

| File                   | Contents                                                                                                                                           |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `screens/desktop.png`  | Homepage at laptop size, 2880×1800 (1440×900 at 2×)                                                                                                |
| `screens/mobile.png`   | The same homepage at phone size, 1170×2532 (390×844 at 3×)                                                                                         |
| `scenes/devices.html`  | The laptop and phone with those screenshots as screens; `LAYOUT` at the top sets the composition                                                   |
| `scenes/kit.js`        | Shared three.js helpers: renderer, rounded shapes, screen textures, contact shadows                                                                |
| `render.mjs`           | Runs the steps below in headless Chromium and writes the asset                                                                                     |
| `sample-site/`         | The fictional homepage, desktop and mobile. `hero.jpg` is its background photo. `--only=capture` screenshots both pages into `screens/`            |
| `scenes/products.html` | Earlier fictional ceramics shop ("Marl"), a product photo modelled in three.js. Unused by the default pipeline. `--only=products` still renders it |

## Re-render

```sh
node design/hero-mockup/render.mjs --only=capture
node design/hero-mockup/render.mjs
```

Capture screenshots `sample-site/` into `screens/` (desktop at 1440×900 and 2×, mobile at 390×844 and 3×). It needs network access: Inter loads from cdn.jsdelivr.net. The second command runs three steps, each writing to `reports/hero-mockup/` (gitignored): `screens` (copies the stored screenshots), `devices` (the 3D scene at twice the asset size), and `asset` (crops to the visible pixels, downsizes to 2000px wide, and saves a transparent WebP). Run part of it with `--only=<step>` or `--from=<step>`; `--preview` renders the devices at asset size and skips the asset. `--only=products` renders the unused ceramics photo.

Requirements: network access (three.js 0.170.0 and the legend font load from cdn.jsdelivr.net), Playwright's Chromium (installed for the browser tests), and sharp (installed with Astro). On macOS the scenes render on the GPU through Metal.

The devices step fails if anything visible touches the edge of the frame, because a shadow cut by the frame would show as a hard line on the hero background. Widen `LAYOUT.margins` in `scenes/devices.html` if that happens.

## Changing it

- Screen content: edit `sample-site/`, run `--only=capture`, then run the pipeline. The capture and screens steps refuse a file of any other size, because the device displays map each screenshot across the whole screen.
- Composition: change `LAYOUT` in `scenes/devices.html` (camera angle and distance, phone position and turn). The page also merges JSON from a `?layout=` query parameter into `LAYOUT`, for scripted side-by-side comparisons.
- Direction: `LAYOUT.facing` sets the way the devices turn. The scene and the rest of `LAYOUT` describe them turned to the right, as modelled. `'left'` draws the screens and the keyboard mirror-image, and `render.mjs` flips the frame, so the image is the right-facing one's exact mirror, light and shadows included, with the pages and the keys reading the right way. `?layout={"facing":"right"}` renders the right-facing image. Flipping the image moves the gaps the benefit icons rest in, so mirror the ring with it (next point): `start` becomes its negative, place k takes what place 3 - k (mod 6) had in `order` and `namePlaces`, and the two side labels hang the other way.
- After any change to the devices' outline or the image's proportions, run `npx playwright test tests/e2e/hero.spec.ts`. The benefit icons around the devices, and the labels beside them, rest in places tuned to this image, and that suite fails when a device covers an icon or a label. If it does, change `start` on `ServiceOrbit` in `src/components/sections/Hero.astro` until it passes at every width; -30 to 29 covers every placing of six icons and keeps the first place, whose label hangs to the right, nearest three o'clock. Then check where each label sits (`order` and `namePlaces` in `src/components/ui/ServiceOrbit.astro`). If nothing passes, the ring needs different room (`--orbit-above` and `--orbit-below` in the hero) or smaller chips.

The captures are the sample pages at those viewports, with no browser chrome. Change the name, the phone number, or the photograph only in `sample-site/`, and keep the page labelled as a sample.

The hero serves the asset through `astro:assets` as AVIF with a WebP fallback at six widths, so keep the source WebP at full quality; the build does the compression.
