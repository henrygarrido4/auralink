// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import vue from '@astrojs/vue';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
// Static output (default). No Netlify adapter is needed; see docs/architecture.md.
export default defineConfig({
  site: 'https://auralinkstudio.com',
  integrations: [vue(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
  /*
   * The stylesheet goes into every page's head rather than out to a file of its own
   * (2026-11-22). As a file it was the one request that blocked the first paint: after the page
   * arrived the browser had to ask for it and wait a round trip before showing anything, which
   * PageSpeed Insights counted as 110-150 ms of First Contentful Paint on the live site. Inlined,
   * the page paints as soon as it arrives. Each page carries about 17 KB more compressed and the
   * styles are not cached between pages; the sheet is kept small so that holds (the `source` and
   * `exclude` settings in src/styles/global.css). Measured in docs/performance.md.
   */
  build: {
    inlineStylesheets: 'always',
  },
  /*
   * Catamaran for text, Mukta for headings (owner, 2026-11-18). Downloaded at build time and
   * served from this site; the browser never requests Google. Latin only, upright only, and only
   * the weights the pages use: 400 and 700 for body, nav, and buttons, and 500 for the names in
   * the home directory; 300 and 700 for headings. Catamaran's weights share one variable file, so
   * 500 adds no download. <Font> in BaseLayout writes --font-main and --font-headers. See
   * src/styles/global.css.
   */
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Catamaran',
      cssVariable: '--font-main',
      weights: [400, 500, 700],
      styles: ['normal'],
      subsets: ['latin'],
      display: 'swap',
    },
    {
      provider: fontProviders.google(),
      name: 'Mukta',
      cssVariable: '--font-headers',
      weights: [300, 700],
      styles: ['normal'],
      subsets: ['latin'],
      display: 'swap',
    },
  ],
});
