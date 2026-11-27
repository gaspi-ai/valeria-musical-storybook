import { defineConfig, type Plugin } from 'vite';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Automatically stamps a fresh release cache version into dist/sw.js on every build
 * so returning PWA clients always evict stale audio/JS caches after a release.
 */
function stampServiceWorkerVersion(): Plugin {
  let outDir = 'dist';
  return {
    name: 'stamp-sw-version',
    configResolved(resolved) {
      outDir = resolved.build.outDir || 'dist';
    },
    closeBundle() {
      const swPath = path.resolve(import.meta.dirname, outDir, 'sw.js');
      if (!fs.existsSync(swPath)) return;
      const version = `valeria-storybook-${Date.now().toString(36)}`;
      const content = fs.readFileSync(swPath, 'utf8');
      const updated = content.replace(
        /const CACHE_NAME = '[^']+';/,
        `const CACHE_NAME = '${version}';`
      );
      fs.writeFileSync(swPath, updated, 'utf8');
    },
  };
}

export default defineConfig({
  base: './', // Ensures relative assets work on GitHub Pages, custom domains, and subdirectories
  plugins: [stampServiceWorkerVersion()],
});
