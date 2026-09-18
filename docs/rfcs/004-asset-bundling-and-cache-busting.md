# RFC: Asset Bundling, Content-Addressable Hashing, and Cache Busting

- **Date:** 2026-09-17
- **Status:** Accepted
- **Author:** Antigravity Agent & Andrew Nitschke

---

## 1. Summary

This proposal outlines the build pipeline, asset bundling architecture, content-addressable hashing strategy, and HTTP caching mechanics for `yoto-tools`. Building and asset fingerprinting execute inside GitHub Actions, producing static assets deployed with immutable HTTP cache headers.

---

## 2. Bundling Model & Asset Breakdown

To keep architecture simple, deterministic, and easily cacheable, the build produces a concise set of targeted assets adhering to standard Vite naming conventions (`[name]-[hash].[ext]`):

1. **Single JavaScript Bundle (`app-[hash].js`):**
   - Application code, Lit custom elements, `@lit-labs/router`, and third-party libraries (e.g. `mqtt.js`) are bundled into a single primary ES module bundle.
   - Eliminates micro-chunk waterfall requests while keeping bundle size manageable.
2. **Font Bundle (`fonts-[hash].woff2` / `fonts-[hash].css`):**
   - Self-hosted web fonts bundled locally rather than loaded from external Google Fonts CDNs, improving privacy, offline capability, and latency.
3. **Consolidated Icon Catalog (`icons-[hash].json`):**
   - Single pre-indexed JSON database containing all keywords, categories, and image references for Google Noto Emojis and official Yoto icons.
4. **Pure Content-Addressable Icon Images (`assets/icons/[hash].png`):**
   - Each individual 16×16 PNG icon is addressed purely by the cryptographic SHA-256 hash of its image bytes (e.g., `assets/icons/a1b2c3d4e5f6.png`).
   - Having the filename be just the hash eliminates arbitrary name conflicts across providers, automatically deduplicates identical pixel icons across different datasets, and enables true content-addressable storage.
5. **Entrypoint Document (`index.html`):**
   - The root HTML shell referencing the hashed bundles.

---

## 3. Build Process & Hash Injection (GitHub Actions)

All building is executed inside GitHub Actions using **Vite**:

### A. Automatic Hash Generation (Vite / Rollup)
During `npm run build`:
1. Vite computes cryptographic content digests for all imported code, styles, and assets using standard `[name]-[hash].[ext]` naming.
2. It outputs fingerprinted assets in `dist/assets/` (e.g., `app-c8d9e2f1.js`).
3. Assets under Vite's default inlining threshold (4 KB) may be inlined as data URIs where appropriate.
4. For the icon database, the indexing build step emits `dist/assets/icons-[hash].json` and writes individual icon PNGs purely as `dist/assets/icons/[hash].png`.

### B. HTML Injection
- Vite uses `index.html` as the source template.
- During compilation, Vite automatically injects the compiled, hashed script tags into `<head>` / `<body>`:
  ```html
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Yoto Tools</title>
      <link rel="stylesheet" href="/assets/fonts-a7b6c5d4.css" />
      <script type="module" src="/assets/app-c8d9e2f1.js"></script>
    </head>
    <body>
      <yt-app></yt-app>
    </body>
  </html>
  ```
- The entrypoint `index.html` itself never contains a hash in its filename so it can be served from the root URL `/`.

### C. Runtime Reference to the Icon Database
The application needs to know the content-hashed URL of `icons-[hash].json` at runtime:
- In TypeScript, the JSON catalog URL is resolved via Vite's asset import syntax:
  ```typescript
  import iconCatalogUrl from './assets/icons.json?url';
  // Resolves at build time to e.g. "/assets/icons-3f8e1a9b.json"
  ```
- The client fetches `iconCatalogUrl` once on startup or when the user first opens the icon picker, storing the parsed catalog in memory or `CacheStorage`.

---

## 4. HTTP Cache-Control & Security Headers (`netlify.toml`)

To ensure optimal performance and eliminate stale-cache issues, HTTP cache headers are defined in `netlify.toml`:

```toml
# ==============================================================================
# HTTP Cache-Control & Security Headers
# See: docs/rfcs/004-asset-bundling-and-cache-busting.md
# ==============================================================================

# 1. Root HTML shell: Never cache permanently; always revalidate with origin
[[headers]]
  for = "/*"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

# 2. Fingerprinted immutable assets (JS bundle, fonts, icons, icon JSON):
#    Cache immutably for 1 year in browser and edge CDN
[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

---

## 5. Cache Invalidation & Rollout Guarantees

- **Atomic Deployments:** Netlify deploys the pre-built assets atomically. All hashed files in a new build become available simultaneously.
- **Instant Invalidation:** Because `index.html` is configured with `Cache-Control: public, max-age=0, must-revalidate`, clients always fetch the latest HTML shell on refresh.
- **Zero Stale Dependencies:** The updated `index.html` references the new asset hashes (`app-[new-hash].js`, `icons-[new-hash].json`). The browser immediately loads the new assets while continuing to pull unchanged assets from its local disk cache.
