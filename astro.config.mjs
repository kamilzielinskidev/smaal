// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // ponytail: placeholder domain, swap for the real one before deploy
  site: 'https://www.s-maal.pl',
  // URL-e bez końcowego ukośnika — zgodne z linkami wewnętrznymi, canonical i sitemap
  trailingSlash: 'never',
  build: { format: 'file' },
  integrations: [react(), sitemap()],
});
