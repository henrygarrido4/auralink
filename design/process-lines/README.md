# Steps band: line drawing

Editable source for `src/assets/process/lines.svg`, the faint lines behind the home page's steps (`src/components/sections/Process.astro`, drawn by the `process-lines` utility in `src/styles/global.css`).

The owner named fdicreative.com's "4 Easy Steps to Launch!" band as the reference on 2026-11-18: charcoal, crossed by fine dark lines that sweep across it. That site's lines are its own image, so this drawing is original. It keeps the same character: dark lines about 20px apart on screen, slightly darker than the band, curving across it.

## How it is drawn

`render.mjs` draws concentric arcs around a point beyond the bottom-left corner of a 1920×1200 canvas and bends every arc by the same wave. Neighbouring lines therefore stay the same distance apart and never cross. Each arc is sampled at eight angles and joined with a smooth curve. The lines are black at 16% opacity. `vector-effect: non-scaling-stroke` keeps each one a single pixel wide, however far the band's `background-size: cover` scales the canvas: about 0.75× on a 1440px screen and about 1.6× on a phone, where only the canvas's central strip shows.

## Redraw

```sh
node design/process-lines/render.mjs
```

It needs only Node and writes the SVG in place (about 14 KB, 7 KB compressed). `LAYOUT` at the top of the script holds the canvas, the arcs' centre, the gap between lines, the wave, the number of samples, and the opacity. Fewer samples make a smaller file but change the drawing; at five, one corner of the canvas has no lines.

After a change, look at the section at 390 and 1440px, and run `npx playwright test tests/e2e/process.spec.ts`. It checks that the band's commonest colour stays within 3 of #212121, that the lines are darker than the band but never near black, and that the step numbers keep 3:1 against it.
