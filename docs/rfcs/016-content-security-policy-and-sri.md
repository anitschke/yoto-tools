# RFC 016: Content Security Policy (CSP) & Subresource Integrity (SRI)

- **Date:** 2026-09-18
- **Status:** Accepted
- **Author:** Antigravity Agent & Andrew Nitschke

---

## 1. Summary

This proposal establishes a defense-in-depth security posture for `yoto-tools` by implementing a strict **Content Security Policy (CSP)** delivered via an HTML `<meta>` tag and enforcing **Subresource Integrity (SRI)** on compiled JavaScript and CSS assets. It explicitly prohibits `eval`, restricts external connections to approved Yoto and AWS endpoints, and binds asset loading directly to cryptographic hashes.

---

## 2. Motivation & Threat Model

As a client-side application managing audio credentials and personal Yoto libraries:
1. **Cross-Site Scripting (XSS):** We must guarantee that malicious inline or injected scripts cannot execute.
2. **CDN / Asset Tampering:** We must guarantee that compiled assets (`app-[hash].js`, `fonts-[hash].css`) cannot be altered or substituted in transit.
3. **Restricted Egress:** The browser must be prevented from exfiltrating data, restricting network connections exclusively to Yoto APIs, AWS S3/IoT brokers, and configured proxy relays.

---

## 3. Subresource Integrity (SRI) via Vite

### A. Vite Build Integration
During production compilation in GitHub Actions (`npm run build`), Vite integrates an SRI build plugin (`vite-plugin-sri`):
1. For every emitted bundle (`app-[hash].js`, `fonts-[hash].css`), the plugin computes a cryptographic digest: `sha384-...`.
2. It automatically writes the `integrity` and `crossorigin` attributes onto `<script>` and `<link>` tags within `dist/index.html`:
   ```html
   <link
     rel="stylesheet"
     href="/assets/fonts-a7b6c5d4.css"
     integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC"
     crossorigin="anonymous"
   />
   <script
     type="module"
     src="/assets/app-c8d9e2f1.js"
     integrity="sha384-d+7h0tO9E3Zq1cW3p4T7s2R8K5m9A6N7J1l4D2g5F8H0j3K6L9P2Q5S8U1V4X7Y0"
     crossorigin="anonymous"
   ></script>
   ```

---

## 4. Content Security Policy Specification (`<meta>` Element)

A strict Content Security Policy is injected into the `<head>` of `index.html`:

```html
<meta
  http-equiv="Content-Security-Policy"
  content="
    default-src 'none';
    script-src 'sha384-...';
    style-src 'self';
    font-src 'self';
    img-src 'self' data: https://api.yotoplay.com https://*.prxu.org https://*.podtrac.com;
    media-src 'self' blob: https://*.prxu.org https://*.podtrac.com;
    connect-src 'self'
      https://login.yotoplay.com
      https://api.yotoplay.com
      https://*.s3.amazonaws.com
      https://*.s3.*.amazonaws.com
      wss://*.iot.eu-west-2.amazonaws.com
      https://corsproxy.io
      https://www.google-analytics.com;
    base-uri 'self';
    form-action 'none';
  "
/>
```

### Directives Breakdown:
- **`script-src 'sha384-...'` (Pure Cryptographic Hash Pinning):**
  - **No `'self'` Bypass:** Omits `'self'`. Including `'self'` would allow any arbitrary same-origin script file to execute, negating the hash restriction. Omitting `'self'` enforces that **only** scripts whose cryptographic digest matches the build-time SRI hash can execute.
  - **No `eval`:** Omits `'unsafe-eval'`. The use of `eval()`, `new Function()`, and string-based timers is completely blocked. (Lit 3 uses compiled tagged template literals and natively complies with no-eval environments).
  - **No Unsafe Inline:** Omits `'unsafe-inline'`. Only the hashed and SRI-verified `app-[hash].js` bundle can run.
- **`style-src 'self'`:** Restricts stylesheets to local self-hosted bundles (`fonts-[hash].css`) and component Shadow DOM styles.
- **`font-src 'self'`:** Restricts font files (`.woff2`) strictly to the same origin.
- **`img-src 'self' data: ...`:** Allows local icons, base64 data URIs (< 4 KB Vite inlining), and Yoto/podcast cover art thumbnails.
- **`media-src 'self' blob: ...`:** Allows audio previews from OPFS blob URLs and verified podcast hosts.
- **`connect-src`:** Restricts network requests (`fetch` and WebSockets) strictly to:
  - Same origin (`'self'`)
  - Yoto Auth0 (`https://login.yotoplay.com`)
  - Yoto REST API (`https://api.yotoplay.com`)
  - AWS S3 for direct audio uploads (`https://*.s3.amazonaws.com`)
  - AWS IoT Core MQTT WebSockets (`wss://*.iot.eu-west-2.amazonaws.com`)
  - Free RSS CORS proxy relay (`https://corsproxy.io`) ([RFC 009](009-cors-proxy-for-rss-feeds.md))
  - GA4 Measurement Protocol (`https://www.google-analytics.com`)

---

## 5. Security & Build Validation

1. **Automated CI Check:** Playwright E2E tests executing in GitHub Actions will fail if any CSP violation is reported to the browser console.
2. **No Inlined Executables:** All application logic resides strictly within the hashed ES module bundle.
