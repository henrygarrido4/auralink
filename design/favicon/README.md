# Favicon

Editable source for `public/favicon.svg` and `public/favicon.ico`, the site's browser tab icon, linked from the head of `src/layouts/BaseLayout.astro`.

The owner asked for the AURA mark as the favicon on 2026-11-21. The icon is the mark alone, `src/assets/aura-hero.svg`: the full logo is about three times wider than it is tall, so its wordmark would be unreadable in a 16px tab. The mark sits on a near-black tile, as it does in the navbar and on the About section's name card. On its own, its yellow is 1.4:1 against a light tab and its lower pixels fade away at 16px; on the tile it reads in light and dark tabs alike.

## How it is drawn

`render.mjs` reads the mark's one path and places it, unchanged, on a rounded square of daisyUI's `neutral` (`#09090b`, the navbar's colour). The mark is centred, with 100 of its 1500 units between its widest points and the tile's sides. The corners keep the name card's proportion (`rounded-md` on a 44px tile). The ICO holds PNG renders of the same SVG at 16, 32, and 48px for browsers and tools that do not read SVG icons.

## Redraw

```sh
node design/favicon/render.mjs
```

It needs Node and sharp (installed with Astro) and writes both files in place. `LAYOUT` at the top of the script holds the mark's box, the margin, the corner radius, the tile colour, and the ICO's sizes. Run it again whenever the mark changes.

After a change, look at the icon in a light and a dark browser tab at 100% and 200% zoom, and run `npx playwright test tests/e2e/rendering.spec.ts --project=desktop-chromium`, which checks that both files are served. Browsers keep favicons in a cache of their own, so a reload may still show the old icon; open `/favicon.svg` directly or use a private window to see the new one.
