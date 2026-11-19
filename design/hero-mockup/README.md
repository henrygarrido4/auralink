# Hero mockup: laptop and phone

Editable source for `src/assets/hero/laptop-phone.webp`, the device image in the home page hero (`src/components/sections/Hero.astro`): a silver laptop in three-quarter view and an upright phone beside it, on a transparent background with soft contact and cast shadows. The devices are generic, with no maker's logo or trade dress.

The screens show the homepage of **The Villas @ Foxbrick**, the owner's WordPress demo at https://villas-foxbrick-demo.instawp.site/, captured on 2026-11-18. It is the same demo as the selected-work card: not confirmed client work, and the hero's alt text names the website shown. Do not describe it as a client, a result, or the property's own live site.

## Files

| File                   | Contents                                                                                                     |
| ---------------------- | ------------------------------------------------------------------------------------------------------------ |
| `screens/desktop.png`  | Homepage at laptop size, 2880×1800 (1440×900 at 2×)                                                          |
| `screens/mobile.png`   | The same homepage at phone size, 1170×2532 (390×844 at 3×)                                                   |
| `scenes/devices.html`  | The laptop and phone with those screenshots as screens; `LAYOUT` at the top sets the composition             |
| `scenes/kit.js`        | Shared three.js helpers: renderer, rounded shapes, screen textures, contact shadows                          |
| `render.mjs`           | Runs the steps below in headless Chromium and writes the asset                                               |
| `sample-site/`         | Earlier fictional ceramics shop ("Marl"). Not shown on the hero. `--only=products` renders its product photo |
| `scenes/products.html` | That shop's product photo, modelled in three.js. Unused by the default pipeline                              |

## Re-render

```sh
node design/hero-mockup/render.mjs
```

It takes a few seconds and runs three steps, each writing to `reports/hero-mockup/` (gitignored): `screens` (copies the stored screenshots), `devices` (the 3D scene at twice the asset size), and `asset` (crops to the visible pixels, downsizes to 2000px wide, and saves a transparent WebP). Run part of it with `--only=<step>` or `--from=<step>`; `--preview` renders the devices at asset size and skips the asset. `--only=products` renders the unused sample-shop photo.

Requirements: network access (three.js 0.170.0 and the legend font load from cdn.jsdelivr.net), Playwright's Chromium (installed for the browser tests), and sharp (installed with Astro). On macOS the scenes render on the GPU through Metal.

The devices step fails if anything visible touches the edge of the frame, because a shadow cut by the frame would show as a hard line on the hero background. Widen `LAYOUT.margins` in `scenes/devices.html` if that happens.

## Changing it

- Screen content: replace `screens/desktop.png` and `screens/mobile.png` at the sizes above, then run the pipeline. The screens step refuses a file of any other size, because the device displays map each screenshot across the whole screen.
- Composition: change `LAYOUT` in `scenes/devices.html` (camera angle and distance, phone position and turn). The page also merges JSON from a `?layout=` query parameter into `LAYOUT`, for scripted side-by-side comparisons.
- After any change to the devices' outline or the image's proportions, run `npx playwright test tests/e2e/hero.spec.ts`. The service icons around the devices, and the names beside them, rest in places tuned to this image, and that suite fails when a device covers an icon or a name. If it does, change `start` on `ServiceOrbit` in `src/components/sections/Hero.astro` until it passes at every width; 0 to 59 covers every placing of six icons. Then check where each name sits (`order` and `namePlaces` in `src/components/ui/ServiceOrbit.astro`). If nothing passes, the ring needs different room (`--orbit-above` and `--orbit-below` in the hero) or smaller chips.

The captures above are the homepage as it loaded that day, viewport only, with motion reduced. Refresh them from the demo when the owner asks, and only publish work the owner has agreed to show. The demo was open without a password on the day of the capture; it had answered 401 before that.

The hero serves the asset through `astro:assets` as AVIF with a WebP fallback at six widths, so keep the source WebP at full quality; the build does the compression.
