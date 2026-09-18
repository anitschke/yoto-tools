import { defineConfig, Plugin } from 'vite';
import subresourceIntegrity from 'vite-plugin-sri';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { load } from 'cheerio';

// ==============================================================================
// Vite Bundling Configuration
// See: docs/rfcs/002-build-tooling-and-typescript-compilation.md
//      docs/rfcs/004-asset-bundling-and-cache-busting.md
//      docs/rfcs/016-content-security-policy-and-sri.md
// ==============================================================================

/**
 * Custom build plugin to enforce RFC 016 CSP script-src hash pinning.
 * Computes the SHA-384 digest of entry script(s) and updates the <meta http-equiv="Content-Security-Policy">
 * tag in dist/index.html to replace `script-src ...` with `script-src 'sha384-<hash>'`.
 */
function cspHashInjectionPlugin(): Plugin {
  let outDir = 'dist';

  return {
    name: 'yt-csp-hash-injection',
    apply: 'build',
    enforce: 'post',
    configResolved(config) {
      outDir = config.build.outDir || 'dist';
    },
    closeBundle() {
      const htmlPath = resolve(process.cwd(), outDir, 'index.html');
      try {
        const htmlContent = readFileSync(htmlPath, 'utf-8');
        const $ = load(htmlContent);

        // Find all script tags with src
        const scriptHashes: string[] = [];
        $('script[src]').each((_, el) => {
          const integrity = $(el).attr('integrity');
          if (integrity) {
            scriptHashes.push(`'${integrity}'`);
          } else {
            const src = $(el).attr('src');
            if (src) {
              const cleanedPath = src.startsWith('/') ? src.slice(1) : src;
              const scriptPath = resolve(process.cwd(), outDir, cleanedPath);
              try {
                const code = readFileSync(scriptPath);
                const hash = createHash('sha384').update(code).digest('base64');
                scriptHashes.push(`'sha384-${hash}'`);
              } catch (e) {
                console.warn(`[cspHashInjectionPlugin] Could not read script file ${scriptPath}:`, e);
              }
            }
          }
        });

        if (scriptHashes.length > 0) {
          const uniqueHashes = Array.from(new Set(scriptHashes)).join(' ');
          const cspMeta = $('meta[http-equiv="Content-Security-Policy"]');
          if (cspMeta.length > 0) {
            let csp = cspMeta.attr('content') || '';
            // Replace script-src directive with the computed hashes
            csp = csp.replace(/script-src\s+[^;]+;?/, `script-src ${uniqueHashes};`);
            cspMeta.attr('content', csp);
            writeFileSync(htmlPath, $.html(), 'utf-8');
            console.log(`[cspHashInjectionPlugin] Injected CSP script-src hashes: ${uniqueHashes}`);
          }
        }
      } catch (err) {
        console.error('[cspHashInjectionPlugin] Failed to inject CSP hashes:', err);
      }
    },
  };
}

export default defineConfig({
  plugins: [
    subresourceIntegrity(),
    cspHashInjectionPlugin(),
  ],
  build: {
    target: 'es2022',
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
  server: {
    port: 5173,
  },
});

