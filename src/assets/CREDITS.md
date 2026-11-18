# Asset credits

Every file in `src/assets/` that Auralink Studio did not create has an entry here, added in the same change as the file: where it came from, who made it, the licence it is used under, and what was changed. Original work is not listed: the owner's logo files and the hero's device image, which is rendered from `design/hero-mockup/`. Remove an entry when its file is deleted.

Stock photos only illustrate the site's audience. Never caption one as a client, a team member, or a testimonial, and never name the people in it.

## `about/business-owner-laptop.webp`

- Used in: the home page introduction, `src/components/sections/AboutIntro.astro`.
- Photo: "Woman Using a Laptop" by Mikhail Nilov, Pexels photo 8871889.
- Photo page: https://www.pexels.com/photo/woman-using-a-laptop-8871889/
- Photographer: https://www.pexels.com/@mikhail-nilov/
- Licence: Pexels License, https://www.pexels.com/license/ (read 2026-11-17). Free to use and to modify; attribution is not required; the licence page names websites, e-commerce shops, and marketing campaigns among its uses. Not allowed: implying that the people shown endorse a product, or showing identifiable people in a bad light. The page says nothing about model releases, so keep the photo purely illustrative.
- Retrieved: 2026-11-17, the original 5991×3999 JPEG from https://images.pexels.com/photos/8871889/pexels-photo-8871889.jpeg. The photo page lists a Nikon D750, taken 2021-06-07 and published 2021-07-23.
- Changes: full frame kept; resized to 2000×1335 and saved as WebP at quality 92 without metadata. The build serves AVIF and WebP versions made from this file.

## `icons/` (Lucide icons)

- Files: `arrow-right.svg`, `code-xml.svg`, `file-pen-line.svg`, `mail-clock.svg`, `search.svg`, `shopping-bag.svg`, `sparkles.svg`.
- Used in: the home page services section, `src/components/sections/Services.astro`, through `src/lib/icons.ts` and `src/components/ui/Icon.astro`.
- Source: Lucide, https://lucide.dev, from the `icons/` folder of the npm package `lucide-static` 1.67.0 (published 2026-11-03).
- Licence: ISC, copyright Lucide Icons and Contributors. `arrow-right`, `search`, and `shopping-bag` derive from Feather and are also under the MIT licence, copyright Cole Bemis. Both allow use, copying, and changes for any purpose, as long as the copyright and permission notices stay with the copies; both are reproduced below as the package ships them.
- Retrieved: 2026-11-17.
- Changes: none to the files, which are byte-for-byte copies. When Astro inlines an icon it drops `xmlns`, and `Icon.astro` replaces the `class` and adds `aria-hidden` and `focusable`.

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
