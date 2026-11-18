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
   * Catamaran for text, Mukta for headings (owner, 2026-11-18). Downloaded at build time and
   * served from this site; the browser never requests Google. Latin only, upright only, and only
   * the weights the pages use: 400 and 700 for body, nav, and buttons; 300 and 700 for headings.
   * <Font> in BaseLayout writes --font-main and --font-headers. See src/styles/global.css.
   */
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Catamaran',
      cssVariable: '--font-main',
      weights: [400, 700],
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
