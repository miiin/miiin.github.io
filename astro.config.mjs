// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  srcDir: 'src',
  site: 'https://miiin.github.io',
  integrations: [sitemap()],
});
