# Asset credits

Every file in `src/assets/` that Auralink Studio did not create has an entry here, added in the same change as the file: where it came from, who made it, the licence it is used under, and what was changed. Original work is not listed: the owner's logo files, and the laptop and phone in the hero, which are rendered from `design/hero-mockup/`. The pages on those screens are a fictional heating and cooling homepage drawn for the mockup, credited under the hero entry below. Remove an entry when its file is deleted.

Stock photos only illustrate: the site's audience, the industry of a featured project, or a kind of business in the home directory. Never caption one as a client, a team member, or a testimonial, never name the people in it, and never present one as a project's own premises, products, or photography.

## Web fonts

Not files in this folder. Astro's font support downloads them at build time and the site serves the woff2 files. No request to a font host from the browser. Latin, upright, `font-display: swap`. Registered in `astro.config.mjs`.

- Catamaran, used for text (`--font-main`), weights 400, 500, and 700. Copyright 2014 The Catamaran Authors (pria.ravichandran@gmail.com). Designed by Pria Ravichandran.
- Mukta, used for headings (`--font-headers` and `--font-subheaders`), weights 300 and 700. Copyright (c) 2014, Girish Dalvi, Ek Type.
- Licence for both: SIL Open Font License 1.1, https://openfontlicense.org/open-font-license-official-text/ (read from the upstream `OFL.txt` on 2026-11-18). The fonts may be used, studied, modified, and redistributed, including embedded in a website, and may not be sold by themselves. A reserved font name stays with the copyright holder.

## `hero/laptop-phone.webp`

- Used in: the home page hero, `src/components/sections/Hero.astro`.
- The laptop and phone are original 3D, rendered from `design/hero-mockup/` (see its README). No maker's logo.
- The pages on the screens are a fictional heating and cooling homepage, Sableline Heating & Air, drawn in `design/hero-mockup/sample-site/` and captured 2026-11-18. Desktop is that page at 1440×900, saved at 2× (2880×1800). Mobile is the same page at 390×844, saved at 3× (1170×2532). Sableline is not a client or a real business. The phone number on the page is in the fictional 555 range. Do not describe the screen as client work.
- The photograph on that page was supplied by the owner on 2026-11-18 for this sample (`Technician_Repairing_Residential_Air_Conditioner`). It shows a man in safety glasses repairing an outdoor air conditioner beside a house. No photographer, stock page, or licence document came with the file. He is not an employee of the fictional company and does not endorse Auralink Studio.
- The file as supplied was 1024×682. It was enlarged to 2880×1918 and saved as `design/hero-mockup/sample-site/hero.jpg` at JPEG quality 90 without metadata, so the screen capture is not blocky.

## `about/business-owner-laptop.webp`

- Used in: the home page introduction, `src/components/sections/AboutIntro.astro`.
- Supplied by the owner on 2026-11-19, replacing "Woman Using a Laptop" by Mikhail Nilov (Pexels photo 8871889). The file used is the PNG named `Retrato de hombre con gafas y portátil`. A JPEG of the same picture at 768×1024 was attached in chat the same day; that copy is what made the portrait look soft, so it was not used. No photographer, stock page, or licence document came with the file.
- It shows a man with glasses at a laptop, hands clasped, with a lamp and a plant behind him. The page does not name him, and the photo is not a client or a testimonial.
- The laptop shows Apple's logo. The photo does not say that Apple endorses Auralink Studio.
- Original: 1086×1448 PNG. Changes: 280px cropped from the top, the empty wall above the plant and his head, leaving 1086×1168; saved as WebP at quality 92 without metadata. The build serves AVIF and WebP at quality 80, at 1086px and three smaller widths, so nothing is enlarged.

## `about/portrait-arms-crossed.webp`

- Used in: the About page, `src/components/sections/AboutStory.astro`.
- Supplied by the owner on 2026-11-20 for the About page, from the owner's Photos library (`IMG_3429.png`, exported unmodified). A JPEG of the same picture at 768×1024, the library's preview, was attached in chat; the owner asked for the full-resolution original, so the export is what is used. No photographer, stock page, or licence document came with the file.
- It shows the same man as the picture above, standing with his arms crossed in a black T-shirt, with the lit lamp on a shelf at the left and the plant at the right. The About page's copy, supplied by the owner the same day, speaks in the first person as the developer and founder and publishes no personal name. The alt text describes the picture. The photo is not a client or a testimonial.
- Original: 1086×1448 PNG. Changes: none to the picture; saved as WebP at quality 92 without metadata. The build serves AVIF and WebP at quality 80, at 1086px and three smaller widths, so nothing is enlarged.

## `work/` (project screenshots)

The homepage of each project on the work page (`src/components/sections/WorkProject.astro`) and in the home page's selected work cards (`src/components/ui/WorkCard.astro`), through `src/lib/project-screenshots.ts`. Each is the owner's own work, captured by Auralink Studio on 2026-11-21 from the project's live address with Playwright's Chromium in a 1440×1080 desktop viewport at 2x, after scrolling the page once so its lazy images had loaded and returning to the top. The barbershop's newsletter pop-up (Kit) was closed with its own close control, and the host's badge (Netlify's "Powered by Netlify") hidden, since neither is part of the site's design. The 2880×2160 captures were resized to 1920×1440 (4:3) and saved as WebP at quality 88 without metadata. The build serves AVIF and WebP versions made from these files. Capture them again when a site changes.

| File                                | Site                                                                                              | What the frame shows                                                                                                                                         |
| ----------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `johnnys-exclusive-barbershop.webp` | https://exclusivecutzz.netlify.app/ (Johnny's Exclusive Barbershop, the owner's work)             | The hero: a barber spraying a client's hair behind "Barber & Hair Cutting", the shop's bar with its phone number and hours, and the top of the services band |
| `freight-solutions.webp`            | https://freightsolutions.netlify.app/ (Freight Solutions LLC, the owner's work)                   | The hero: "To Every Direction" over a night-time photo of pipe on a flatbed trailer, the header with the phone number and email                              |
| `villas-at-foxbrick.webp`           | https://villas-foxbrick-demo.instawp.site/ (The Villas @ Foxbrick, the owner's WordPress website) | The hero: the community's buildings behind "Luxury living, right here in Humble", the "Now leasing" bar, and the top of the facts row                        |

The photographs inside these screenshots belong to the sites shown (the barbershop's and the carrier's own imagery, and the apartment community's buildings). They appear only as part of each website's rendered page, as a record of the work; none is cropped out and used on its own. The one0one Shopify recreation's screenshot was captured the same way and removed the same day, when the owner took that project off the site.

## `icons/` (Lucide icons)

- Files: `activity.svg`, `arrow-right.svg`, `arrow-up-right.svg`, `briefcase.svg`, `calendar-check.svg`, `car.svg`, `check.svg`, `chart-column.svg`, `circle-alert.svg`, `clipboard-list.svg`, `clock.svg`, `code.svg`, `code-xml.svg`, `factory.svg`, `file-pen-line.svg`, `globe.svg`, `graduation-cap.svg`, `handshake.svg`, `hard-hat.svg`, `heart-handshake.svg`, `house.svg`, `key-round.svg`, `layout-grid.svg`, `leaf.svg`, `link.svg`, `list-filter.svg`, `lock.svg`, `mail.svg`, `mail-clock.svg`, `map-pin.svg`, `megaphone.svg`, `message-circle.svg`, `messages-square.svg`, `monitor-cog.svg`, `move-right.svg`, `palette.svg`, `paw-print.svg`, `phone.svg`, `repeat.svg`, `scale.svg`, `search.svg`, `shopping-bag.svg`, `sliders-horizontal.svg`, `sparkles.svg`, `target.svg`, `trending-up.svg`, `user-plus.svg`, `utensils.svg`, `video.svg`, `workflow.svg`.
- Used in: the home hero's benefit chips, services, why Auralink Studio, who we work with, selected work, process, and introduction sections, the work page, and the contact page's tabs, booking panel, form, and side cards, `src/components/ui/ServiceOrbit.astro`, `src/components/sections/Services.astro`, `src/components/sections/WhyAuralink.astro`, `src/components/sections/WhoWeWorkWith.astro`, `src/components/ui/WorkCard.astro`, `src/components/sections/WorkOverview.astro`, `src/components/sections/WorkProject.astro`, `src/components/sections/FeaturedWork.astro`, `src/components/sections/Process.astro`, `src/components/sections/AboutIntro.astro`, `src/components/sections/ContactOptions.astro`, `src/components/sections/BookingCalendar.astro`, `src/components/sections/ProjectInquiryForm.astro`, and `src/components/sections/ContactAside.astro`, through `src/lib/icons.ts` and `src/components/ui/Icon.astro`. The services strip's divider is not one of these: it is drawn in `ServiceStrip.astro`. Nor is `tooth.svg` in the same folder: it was drawn for this site on Lucide's grid (2026-11-19), as Lucide has no tooth, so this entry does not cover it.
- Source: Lucide, https://lucide.dev, from the `icons/` folder of the npm package `lucide-static` 1.67.0 (published 2026-11-03).
- Licence: ISC, copyright Lucide Icons and Contributors. `arrow-right`, `arrow-up-right`, `check`, `circle-alert` (as `alert-circle`, its Feather name), `clock`, `code`, `lock`, `map-pin`, `search`, and `shopping-bag` derive from Feather and are also under the MIT licence, copyright Cole Bemis (the package's `LICENSE` lists them). Both allow use, copying, and changes for any purpose, as long as the copyright and permission notices stay with the copies; both are reproduced below as the package ships them.
- Retrieved: 2026-11-17; `arrow-up-right`, `calendar-check`, `chart-column`, `clipboard-list`, `clock`, `globe`, `key-round`, `layout-grid`, `list-filter`, `lock`, `message-circle`, `messages-square`, `monitor-cog`, `move-right`, `repeat`, `sliders-horizontal`, `trending-up`, and `user-plus` on 2026-11-18, from the same release (its `arrow-right.svg` is byte-for-byte the copy already here). `sparkle` was retrieved the same day and removed on 2026-11-18, when the services strip took the reference's asterisk instead. The fourteen for who we work with, `activity`, `briefcase`, `car`, `code`, `factory`, `graduation-cap`, `hard-hat`, `heart-handshake`, `house`, `leaf`, `palette`, `paw-print`, `scale`, and `utensils`, were retrieved on 2026-11-19 from the same release. `check` was retrieved on 2026-11-19 from the same release, for the marks in Why Auralink Studio. `circle-alert` and `mail` were retrieved on 2026-11-19 from the same release (`npm pack lucide-static@1.67.0`), for the contact form's messages and the side card's address. `map-pin`, `megaphone`, and `workflow` were retrieved on 2026-11-19 from the same release, for the three services-page cards. `handshake`, `link`, and `target` were retrieved on 2026-11-20 from the same release (`npm pack lucide-static@1.67.0`; its `check.svg` is byte-for-byte the copy already here), for the three cards of Why Auralink Studio. `phone` and `video` were retrieved on 2026-11-20 from the same release (`npm pack lucide-static@1.67.0`; its `mail.svg` is byte-for-byte the copy already here), for the contact page's phone link and its booking panel's Google Meet line.
- Changes: none to the files, which are byte-for-byte copies. When Astro inlines an icon it drops `xmlns`, and `Icon.astro` replaces the `class` and adds `aria-hidden` and `focusable`. The process section thins the strokes with CSS (`stroke-width`), and who we work with through `Icon.astro`'s `stroke-width` attribute, both without editing the files.

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

## `contact/workspace.webp`

- Used as the decorative photograph in `ContactBanner.astro` (`alt=""`).
- Generated with OpenAI image generation on 2026-11-19 from the owner's approved contact-banner mockup. The standalone photo was made by removing the mockup's text, panel, and footer and reconstructing the desk scene. It is not a stock photograph or a real client or team member.
- Monochrome scene: hands typing at an unbranded laptop, a mug, and a notebook. No identifiable face or brand endorsement.
- Resized to 1920px wide and saved as WebP at quality 86 without metadata. Astro serves responsive AVIF and WebP versions.
- The footer's simplified dotted world silhouette (`FooterMap.astro`) is original SVG artwork created for this implementation, with no third-party asset.
