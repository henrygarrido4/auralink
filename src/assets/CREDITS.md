# Asset credits

Every file in `src/assets/` that Auralink Studio did not create has an entry here, added in the same change as the file: where it came from, who made it, the licence it is used under, and what was changed. Original work is not listed: the owner's logo files, and the laptop and phone in the hero, which are rendered from `design/hero-mockup/`. The pages on those screens are a screenshot of the owner's own demo and are noted under the hero entry below. Remove an entry when its file is deleted.

Stock photos only illustrate: the site's audience, or the industry of a featured project. Never caption one as a client, a team member, or a testimonial, never name the people in it, and never present one as a project's own premises, products, or photography.

## Web fonts

Not files in this folder. Astro's font support downloads them at build time and the site serves the woff2 files. No request to a font host from the browser. Latin, upright, `font-display: swap`. Registered in `astro.config.mjs`.

- Catamaran, used for text (`--font-main`), weights 400 and 700. Copyright 2014 The Catamaran Authors (pria.ravichandran@gmail.com). Designed by Pria Ravichandran.
- Mukta, used for headings (`--font-headers` and `--font-subheaders`), weights 300 and 700. Copyright (c) 2014, Girish Dalvi, Ek Type.
- Licence for both: SIL Open Font License 1.1, https://openfontlicense.org/open-font-license-official-text/ (read from the upstream `OFL.txt` on 2026-11-18). The fonts may be used, studied, modified, and redistributed, including embedded in a website, and may not be sold by themselves. A reserved font name stays with the copyright holder.

## `hero/laptop-phone.webp`

- Used in: the home page hero, `src/components/sections/Hero.astro`.
- The laptop and phone are original 3D, rendered from `design/hero-mockup/` (see its README). No maker's logo.
- The pages on the screens are a screenshot of the owner's WordPress demo for The Villas @ Foxbrick, https://villas-foxbrick-demo.instawp.site/, captured 2026-11-18. Desktop is the homepage at 1440×900, saved at 2× (2880×1800). Mobile is the same homepage at 390×844, saved at 3× (1170×2532).
- The photography inside that screenshot belongs to the demo. It was not downloaded as a stock photo, and no separate licence for those photographs is on record here. The image shows the website the owner asked to feature. Do not describe it as a client result, or as the property's own live site (that site is a different address).

## `about/business-owner-laptop.webp`

- Used in: the home page introduction, `src/components/sections/AboutIntro.astro`.
- Photo: "Woman Using a Laptop" by Mikhail Nilov, Pexels photo 8871889.
- Photo page: https://www.pexels.com/photo/woman-using-a-laptop-8871889/
- Photographer: https://www.pexels.com/@mikhail-nilov/
- Licence: Pexels License, https://www.pexels.com/license/ (read 2026-11-17). Free to use and to modify; attribution is not required; the licence page names websites, e-commerce shops, and marketing campaigns among its uses. Not allowed: implying that the people shown endorse a product, or showing identifiable people in a bad light. The page says nothing about model releases, so keep the photo purely illustrative.
- Retrieved: 2026-11-17, the original 5991×3999 JPEG from https://images.pexels.com/photos/8871889/pexels-photo-8871889.jpeg. The photo page lists a Nikon D750, taken 2021-06-07 and published 2021-07-23.
- Changes: full frame kept; resized to 2000×1335 and saved as WebP at quality 92 without metadata. The build serves AVIF and WebP versions made from this file.

## `work/` (selected work covers)

The covers of the home page's selected work section, `src/components/sections/SelectedWork.astro`, through `src/lib/project-photos.ts`. Each shows the industry of a featured project and nothing of the project itself: not the business, its premises, its products, or its own photography. All three are under the Pexels License, https://www.pexels.com/license/ (read 2026-11-18): every photo is free to use and to modify, and attribution is not required. Not allowed: showing identifiable people in a bad light or offensively, selling unaltered copies, implying that the people or brands shown endorse a product, redistributing the files on other stock or wallpaper platforms, and using them in a trademark or business name. Each was retrieved on 2026-11-18 as the original JPEG from `https://images.pexels.com/photos/<id>/pexels-photo-<id>.jpeg`, saved at 2100×1400 (exactly 3:2) as WebP at quality 90 without metadata. The build serves AVIF and WebP versions made from these files.

### `work/barber-tools.webp`

- Cover of: Johnny's Exclusive Barbershop.
- Photo: "Gray Hand Tool" by Nikolaos Dimou, Pexels photo 1319459, described there as "Close-up of neatly arranged barber tools, including razors and combs, highlighting precision."
- Photo page: https://www.pexels.com/photo/1319459/
- Photographer: https://www.pexels.com/@nickoloui/
- Original: 6000×4000. The photo page lists a Canon EOS 80D at 50 mm, taken 2018-08-09 and published 2018-08-12.
- Changes: full frame kept; resized.

### `work/apartment-pool.webp`

- Cover of: The Villas @ Foxbrick.
- Photo: "Drone Photo of a Swimming Pool" by Jaxon Matthew Willis, Pexels photo 12485724, described there as "Aerial shot of a stylish apartment complex with a pool in Knoxville, TN." It is not the Foxbrick property, which is in Humble, Texas.
- Photo page: https://www.pexels.com/photo/12485724/
- Photographer: https://www.pexels.com/@jaxon-matthew-willis-55957128/
- Original: 4032×3024. The photo page lists the camera as "FC3582" (a drone), taken and published 2022-06-13.
- Changes: cropped to 3:2, 3630×2420 from 400px in and 600px down, which leaves out the road, the parking, a dumpster enclosure, and a uniform company's branded container on the lawn at the top left; then resized.

### `work/activewear-stretch.webp`

- Cover of: the one0one Shopify recreation.
- Photo: "Fit woman sitting in butterfly pose and pressing on legs" by Monstera Production, Pexels photo 6311625, described there as "Woman in black activewear practicing butterfly pose on studio floor."
- Photo page: https://www.pexels.com/photo/6311625/
- Photographer: https://www.pexels.com/@gabby-k/
- Original: 5760×3840. The photo page lists a Canon EOS 5D Mark III at 50 mm, taken 2020-12-21 and published 2020-12-27.
- Changes: full frame kept; resized.
- The model and her clothes have nothing to do with one0one. Never suggest she wears the brand or endorses the store. The page says nothing about a model release. A more dynamic shot of black activewear (Pexels 4587359) was passed over because it shows other brands' logos.

## `work/props/` (selected work props)

The cut-out objects that pop out from behind the project cards in the same section, two per project, through `projectProps` in `src/lib/project-photos.ts`. Each is a top-down object from the project's industry, chosen with no logo, brand name, or person in it, and shows nothing of the project itself. All six are under the Pexels License, https://www.pexels.com/license/ (read 2026-11-18, the terms quoted under `work/` above), and each page labels its photo "Free" (checked 2026-11-18). Each original JPEG was retrieved on 2026-11-18 from `https://images.pexels.com/photos/<id>/pexels-photo-<id>.jpeg`.

Changes, common to all: the object was cut out of its background with rembg 2.0.61 (MIT licence) and its IS-Net general-use model (Apache 2.0), run locally. Parts smaller than 4% of the largest were dropped, which removed specks and neighbouring objects. The result was trimmed to the object, turned where noted so its most recognisable end faces out of the card, scaled so its longer side is 864px, and saved as WebP with transparency (quality 88, alpha 95) without metadata. The build serves AVIF and WebP versions made from these files.

| File             | Object                                                | Pexels photo, title, and photographer                                                                                                     | Original  | Changes beyond the common ones                           |
| ---------------- | ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | --------- | -------------------------------------------------------- |
| `scissors.webp`  | Hairdressing scissors, Johnny's Exclusive Barbershop  | 8468134, "Top View of a Set of Hairdressers Tools on White Surface", Nataliya Vaitkevich (https://www.pexels.com/@n-voitkevich/)          | 6240×4160 | Cropped to the scissors; turned 180° so the handles rise |
| `comb.webp`      | Black plastic comb, Johnny's Exclusive Barbershop     | 6045181, "Comb placed on white surface", Skylar Kang (https://www.pexels.com/@skylar-kang/)                                               | 3696×2448 | None                                                     |
| `keys.webp`      | Three keys on a ring, The Villas @ Foxbrick           | 31424880, "Real Estate Concept with Key and House Models", Jakub Zerdzicki (https://www.pexels.com/@jakubzerdzicki/)                      | 3000×2001 | Cropped to the keys; the model houses and tag left out   |
| `succulent.webp` | A rosette succulent from above, The Villas @ Foxbrick | 1903978, "Top View Photo of Green Succulent Plant on Wooden Surface", Scott Webb (https://www.pexels.com/@scottwebb/)                     | 6000×4000 | Cropped to the plant; scattered soil left out            |
| `sneakers.webp`  | A pair of plain white sneakers, one0one               | 8032734, "Water Bottle and White Sneakers", MART PRODUCTION (https://www.pexels.com/@mart-production/)                                    | 6000×4000 | Cropped to the shoes; the bottle and ab roller left out  |
| `bottle.webp`    | A matte black water bottle, one0one                   | 38718303, "Minimalist Black Water Bottle on Yellow Background", Valentin Ivantsov (https://www.pexels.com/@valentin-ivantsov-2154772556/) | 4825×3209 | Turned 180° so the cap end drops below the card          |

The photo pages are `https://www.pexels.com/photo/<id>/`. The sneakers' insoles show a size ("39"), not a brand. The props only suggest each industry: never present one as the business's own tools, premises, or products.

## `icons/` (Lucide icons)

- Files: `arrow-right.svg`, `arrow-up-right.svg`, `calendar-check.svg`, `chart-column.svg`, `clipboard-list.svg`, `code-xml.svg`, `file-pen-line.svg`, `globe.svg`, `key-round.svg`, `layout-grid.svg`, `list-filter.svg`, `lock.svg`, `mail-clock.svg`, `messages-square.svg`, `monitor-cog.svg`, `move-right.svg`, `search.svg`, `shopping-bag.svg`, `sliders-horizontal.svg`, `sparkle.svg`, `sparkles.svg`.
- Used in: the home page services strip, services, selected work, and process sections, `src/components/sections/ServiceStrip.astro`, `src/components/sections/Services.astro`, `src/components/ui/ProjectCard.astro`, and `src/components/sections/Process.astro`, through `src/lib/icons.ts` and `src/components/ui/Icon.astro`.
- Source: Lucide, https://lucide.dev, from the `icons/` folder of the npm package `lucide-static` 1.67.0 (published 2026-11-03).
- Licence: ISC, copyright Lucide Icons and Contributors. `arrow-right`, `arrow-up-right`, `lock`, `search`, and `shopping-bag` derive from Feather and are also under the MIT licence, copyright Cole Bemis (the package's `LICENSE` lists them). Both allow use, copying, and changes for any purpose, as long as the copyright and permission notices stay with the copies; both are reproduced below as the package ships them.
- Retrieved: 2026-11-17; `arrow-up-right`, `calendar-check`, `chart-column`, `clipboard-list`, `globe`, `key-round`, `layout-grid`, `list-filter`, `lock`, `messages-square`, `monitor-cog`, `move-right`, `sliders-horizontal`, and `sparkle` on 2026-11-18, from the same release (its `arrow-right.svg` is byte-for-byte the copy already here).
- Changes: none to the files, which are byte-for-byte copies. When Astro inlines an icon it drops `xmlns`, and `Icon.astro` replaces the `class` and adds `aria-hidden` and `focusable`. The services strip draws `sparkle` filled, by attribute, not by editing the file. The process section thins the strokes with CSS (`stroke-width`), also without editing the files.

```text
ISC License

Copyright (c) 2026 Lucide Icons and Contributors

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
```

```text
The MIT License (MIT) (for the icons listed above)

Copyright (c) 2013-present Cole Bemis

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
