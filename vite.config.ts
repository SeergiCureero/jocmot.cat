/// <reference types="vitest/config" />
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';

/**
 * Imatge per compartir de cada joc. WhatsApp, Telegram i les xarxes no executen JavaScript,
 * així que per a /paraula, /connexions... es genera una còpia d'index.html (paraula.html...)
 * amb el títol, la descripció i la imatge del joc. Cloudflare serveix /paraula des de paraula.html.
 */
const SHARE_PAGES = [
  { slug: 'paraula', name: 'Paraula', text: 'Endevina la paraula del dia en 6 intents.' },
  { slug: 'connexions', name: 'Connexions', text: 'Troba els quatre grups de quatre paraules.' },
  { slug: 'fils', name: 'Fils', text: 'Segueix el fil de les lletres i troba el tema del dia.' },
  { slug: 'mini', name: 'Mini', text: 'El minimot de cada dia: un mot encreuat de 5×5.' },
];

function sharePages(): Plugin {
  let outDir = 'dist';
  return {
    name: 'jocmot-share-pages',
    apply: 'build',
    configResolved(config) {
      outDir = config.build.outDir;
    },
    closeBundle() {
      const html = readFileSync(`${outDir}/index.html`, 'utf8');
      const meta = (attr: string, key: string, value: string, src: string) =>
        src.replace(
          new RegExp(`(<meta ${attr}="${key}" content=")[^"]*(")`),
          `$1${value.replace(/\$/g, '$$$$')}$2`,
        );
      for (const page of SHARE_PAGES) {
        const title = `${page.name} · jocmot.cat`;
        let out = html.replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`);
        out = meta('name', 'description', page.text, out);
        out = meta('property', 'og:url', `https://jocmot.cat/${page.slug}`, out);
        out = meta('property', 'og:title', title, out);
        out = meta('property', 'og:description', page.text, out);
        out = meta('property', 'og:image', `https://jocmot.cat/compartir/${page.slug}.png`, out);
        out = meta('property', 'og:image:alt', `${page.name}, a jocmot.cat`, out);
        writeFileSync(`${outDir}/${page.slug}.html`, out);
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), sharePages()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts', 'backend/**/*.test.ts'],
  },
});
