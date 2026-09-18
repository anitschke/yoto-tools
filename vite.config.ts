import { defineConfig } from 'vite';
import subresourceIntegrity from 'vite-plugin-sri';

// ==============================================================================
// Vite Bundling Configuration
// See: docs/rfcs/002-build-tooling-and-typescript-compilation.md
//      docs/rfcs/004-asset-bundling-and-cache-busting.md
//      docs/rfcs/016-content-security-policy-and-sri.md
// ==============================================================================

export default defineConfig({
  plugins: [
    subresourceIntegrity(),
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
