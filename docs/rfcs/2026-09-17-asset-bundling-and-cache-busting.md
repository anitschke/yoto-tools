# RFC: Asset Bundling, Content-Addressable Hashing, and Cache Busting

- **Date:** 2026-09-17
- **Status:** Accepted
- **Author:** Antigravity Agent & Andrew Nitschke

---

## 1. Summary

This proposal outlines the build pipeline, asset bundling architecture, content-addressable hashing strategy, HTTP caching mechanics, and declarative edge configuration (`netlify.toml`) for `yoto-tools`. The objective is to achieve instantaneous loading, optimal browser caching, zero stale-asset bugs, and a straightforward build output for static edge hosting.

---

## 2. Bundling Model & Asset Breakdown

To keep architecture simple, deterministic, and easily cacheable, the build produces a concise set of targeted assets:

1. **Single JavaScript Bundle (`app.[hash].js`):**
   - Application code, Lit custom elements, `@lit-labs/router`, and third-party libraries (e.g. `mqtt.js`) are bundled into a single primary ES module bundle.
   - Eliminates micro-chunk waterfall requests while keeping bundle size manageable.
2. **Font Bundle (`fonts.[hash].woff2` / `fonts.[hash].css`):**
   - Self-hosted web fonts bundled locally rather than loaded from external Google Fonts CDNs, improving privacy, offline capability, and latency.
3. **Consolidated Icon Catalog (`icons.[hash].json`):**
   - Single pre-indexed JSON database containing all keywords, categories, and image references for Google Noto Emojis and official Yoto icons.
4. **Content-Addressable Icon Images (`assets/icons/[id].[hash].png`):**
   - Each individual 16×16 PNG icon is addressed by its identifier and content hash.
5. **Entrypoint Document (`index.html`):**
   - The root HTML shell referencing the hashed bundles.

---

## 3. Build Process & Hash Injection

We leverage **Vite** as the build engine to automate content-addressable hashing and HTML injection:

### A. Automatic Hash Generation (Rollup / Vite)
During `npm run build`:
1. Vite computes cryptographic content digests (SHA-256 / MurmurHash) for all imported code and stylesheets.
2. It outputs fingerprinted assets in `dist/assets/` (e.g., `app.c8d9e2f1.js`).
3. For the icon database, an indexing build step writes `dist/assets/icons.[hash].json` and writes individual icon PNGs as `dist/assets/icons/[id].[hash].png`.

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
      <link rel="stylesheet" href="/assets/fonts.a7b6c5d4.css" />
      <script type="module" src="/assets/app.c8d9e2f1.js"></script>
    </head>
    <body>
      <yoto-app></yoto-app>
    </body>
  </html>
  ```
- The entrypoint `index.html` itself never contains a hash in its filename so it can be served from the root URL `/`.

### C. Runtime Reference to the Icon Database
The application needs to know the content-hashed URL of `icons.[hash].json` at runtime:
- In TypeScript, the JSON catalog URL is resolved via Vite's asset import syntax:
  ```typescript
  import iconCatalogUrl from './assets/icons.json?url';
  // Resolves at build time to e.g. "/assets/icons.3f8e1a9b.json"
  ```
- The client fetches `iconCatalogUrl` once on startup or when the user first opens the icon picker, storing the parsed catalog in memory or `CacheStorage`.

---

## 4. Netlify Configuration Specification (`netlify.toml`)

Netlify reads `netlify.toml` from the repository root to configure build commands, routing fallbacks for the SPA, edge proxy rewrites, and precise HTTP header caching rules:

```toml
# ==============================================================================
# Build & Publishing Settings
# ==============================================================================
[build]
  command = "npm run build"
  publish = "dist"

# ==============================================================================
# SPA Fallback & Edge Proxy Rewrites
# ==============================================================================
# 1. Edge proxy rewrite for external RSS feeds (CORS relay)
[[redirects]]
  from = "/api/rss-proxy/*"
  to = "https://your-cors-relay-endpoint/:splat"
  status = 200
  force = true

# 2. SPA single-entrypoint fallback for @lit-labs/router
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

# ==============================================================================
# HTTP Cache-Control & Security Headers
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

- **Atomic Deployments:** Netlify deploys assets atomically. All hashed files in a new build become available simultaneously.
- **Instant Invalidation:** Because `index.html` is configured with `Cache-Control: public, max-age=0, must-revalidate`, clients always fetch the latest HTML shell on refresh.
- **Zero Stale Dependencies:** The updated `index.html` references the new asset hashes (`app.[new-hash].js`, `icons.[new-hash].json`). The browser immediately loads the new assets while continuing to pull unchanged assets from its local disk cache.
