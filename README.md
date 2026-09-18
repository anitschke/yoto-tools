# Yoto Tools (`yoto-tools`)

A modern, responsive, client-side web application built with [Lit](https://lit.dev/) custom elements and `@lit-labs/router` for managing your [Yoto Player](https://yotoplay.com/) library directly in the browser.

`yoto-tools` brings the power and precision of [`yotocli`](https://github.com/vgaro/yotocli) to anyone with a web browser—with zero installation, zero server infrastructure costs, and complete privacy.

---

## 🌟 Vision & Architecture Principles

1. **100% Client-Side / Serverless Architecture:**
   - Deployed as a static Single-Page Application (SPA) to **Netlify** with automatic PR deploy previews.
   - No backend database, microservices, or runtime servers to maintain, pay for, or keep patched.
2. **Direct Browser-to-API Communication:**
   - Direct OAuth 2.0 PKCE authentication with Yoto's Auth0 identity service.
   - Dynamic ephemeral PR preview login supported via a canonical relay redirect.
   - Browser `fetch` calls directly to Yoto REST APIs (`api.yotoplay.com`) and signed direct-to-S3 audio uploads.
   - Real-time device status and control via browser WebSockets connecting to Yoto's AWS IoT MQTT broker.
3. **Rigorous Defense-in-Depth Security:**
   - Strict Content Security Policy (CSP) with `no-eval` and origin lockdown delivered via `<meta>`.
   - Subresource Integrity (SRI) on all compiled bundles (`integrity="sha384-..."`).
4. **Reactive State & Event-Driven UX:**
   - Powered by `@lit/context` and `@lit-labs/router` for persistent live WebSockets and uninterrupted background transfers.
   - Decoupled toast notifications via bubbling custom DOM events (`<yt-toast-manager>`).
5. **Standardized Reusable Widgets (`yt-` Prefix):**
   - Design system (`src/widgets/`) built with Lit custom elements (`<yt-button>`, `<yt-dialog>`, `<yt-dropdown>`, `<yt-pixel-icon>`) and scoped CSS tokens (`--yt-*`).
   - Self-hosted **Roboto** typography in WOFF2 bundles for offline speed and readability.
   - `<yt-pixel-icon>` standardizes 16×16 icon rendering using standard `<img>` tags with `image-rendering: pixelated` on a display contrast canvas.
6. **Practical Persistence & Privacy:**
   - Session & metadata stored simply in `localStorage`.
   - Large audio uploads and ZIP extractions streamed through the browser's Origin Private File System (OPFS).
   - Zero-cookie, privacy-first telemetry via the lightweight GA4 Measurement Protocol with complete PII redaction, an opt-out toggle, and full transparency page (`/privacy`).
7. **Instant, Zero-Latency Icon Search:**
   - Pre-indexed static catalogs of official Yoto icons and Google Noto Emoji assets served with content-addressable cache busting, delivering instantaneous offline search after the first hit.

---

## ✨ Planned Features

### 🎧 Card & Playlist Management
- **Visual Card Editor:** Inspect, create, and modify Make-Your-Own (MYO) playlist tracks and chapters.
- **Drag-and-Drop Ingestion:** Drop folders of audio files, zip archives (`@zip.js/zip.js`), or individual tracks straight into the browser to assemble or append to cards, with automated ID3 tag extraction (`music-metadata-browser`).
- **Controlled Concurrency:** Upload pipeline limited to max 3–4 parallel S3 streams to prevent network and browser saturation.
- **Card Synchronization:** Reorder tracks, update track titles, change cover art, and adjust card metadata.

### 🎙️ Smart Podcast RSS Importer
- **One-Click Feed Ingestion:** Paste an RSS podcast feed URL to generate or sync a Yoto playlist directly.
- **Feed Filtering Rules:**
  - Limit to the most recent $N$ or oldest $N$ episodes.
  - Exclude short promo/announcement clips (e.g. automatically skip episodes shorter than 2 minutes).
- **Metadata Persistence & Syncing:**
  - Persists import configuration directly into card metadata (e.g., custom description tags), allowing users to return anytime and click a single **"Sync New Episodes"** button to pick up newly released episodes without duplicating existing ones.

### 🎨 Fast, Multi-Provider Icon Picker
- **Interactive 16×16 Pixel Grid:** Preview icons in true Yoto display format.
- **Pre-Indexed Search:**
  - Embedded Google Noto Emoji library (Apache 2.0).
  - Official Yoto public icon library.
  - Future support for community icon integrations (e.g., [yotoicons.com](https://yotoicons.com)) pending maintainer alignment.
- **Automatic Auto-Suggest:** Contextual search based on track title and chapter keywords.
- **Custom Icon Upload:** Direct browser upload of custom 16×16 pixel art.

### 📱 Real-Time Device Status & Remote Control (`/device`)
- **Smart Device Routing:** Access `/device` to view all players; accounts with a single player automatically auto-select and navigate to `/device?id=<deviceId>`.
- **Live Hardware Telemetry:** View real-time battery percentages, charging indicators (⚡), online/offline status badges, volume levels, active card titles, and firmware metadata over AWS IoT WebSockets.
- **Card Playback Remote:** Trigger card playback directly onto your player via a visual card picker modal, with Play, Pause, and Stop transport controls.

---

## 🛠️ Technology Stack

- **UI Framework:** [Lit 3.x](https://lit.dev/) (Lightweight Web Components / Custom Elements)
- **Routing:** [@lit-labs/router](https://www.npmjs.com/package/@lit-labs/router)
- **State Management:** [@lit/context](https://lit.dev/docs/data/context/)
- **Typography:** Self-hosted Roboto (WOFF2)
- **Language & Compiler:** TypeScript (strict mode, experimental decorators, `tsc --noEmit`)
- **Build Tool:** [Vite](https://vitejs.dev/) with `vite-plugin-sri`
- **Audio & Archive Processing:** `@zip.js/zip.js` and `music-metadata-browser`
- **Hosting & Previews:** [Netlify](https://www.netlify.com/) (ephemeral PR deploy previews & edge headers via `netlify.toml`)
- **Testing:**
  - Unit & Component Testing: [@web/test-runner](https://modern-web.dev/docs/test-runner/overview/) with Modern Web test tools.
  - End-to-End Testing: [Playwright](https://playwright.dev/) running against preview and production deployments.
- **Styling & Widgets:** Scoped component styling within a dedicated design system (`src/widgets/`).

---

## 📚 Documentation

- [System Architecture](docs/ARCHITECTURE.md): High-level system design, data flows, sequence diagrams, and Netlify hosting specs.
- [Contributor & Agent Guidelines](AGENTS.md): Coding standards, TypeScript conventions, and testing practices.
- [RFC Proposals](docs/rfcs/): Architectural proposals and decision records:
  - [RFC 001: Hosting Platform, CI/CD Pipeline, & Ephemeral PR Staging Strategy](docs/rfcs/001-hosting-and-staging-strategy.md)
  - [RFC 002: Build Tooling, Bundling, and TypeScript Compilation Pipeline](docs/rfcs/002-build-tooling-and-typescript-compilation.md)
  - [RFC 003: Client-Side Single-Page Application (SPA) & Routing Strategy](docs/rfcs/003-client-spa-and-routing-strategy.md)
  - [RFC 004: Asset Bundling, Content-Addressable Hashing, and Cache Busting](docs/rfcs/004-asset-bundling-and-cache-busting.md)
  - [RFC 005: Design System & Reusable Widget Component Library](docs/rfcs/005-widgets-and-component-library.md)
  - [RFC 006: Error Handling, Console Diagnostics, and Toast Notifications](docs/rfcs/006-error-handling-and-toast-notifications.md)
  - [RFC 007: OAuth Client Registration & Ephemeral PR Preview Redirect Strategy](docs/rfcs/007-oauth-client-id-and-pr-preview-redirects.md)
  - [RFC 008: Audio Ingestion, ZIP Extraction, and Upload Concurrency Pipeline](docs/rfcs/008-audio-ingestion-zip-and-upload-concurrency.md)
  - [RFC 009: CORS Proxy Strategy for External RSS Podcast Feeds](docs/rfcs/009-cors-proxy-for-rss-feeds.md)
  - [RFC 010: Podcast RSS Importer & Card Synchronization Engine](docs/rfcs/010-podcast-rss-importer-and-card-sync.md)
  - [RFC 011: Inverted Icon Indexing & Client-Side Search Engine](docs/rfcs/011-inverted-icon-index-and-search.md)
  - [RFC 012: Google Noto Emoji Icon Provider Integration](docs/rfcs/012-noto-emoji-icon-provider.md)
  - [RFC 013: Official Yoto Icon Provider Integration](docs/rfcs/013-yoto-official-icon-provider.md)
  - [RFC 014: Community Icon Provider Integration (yotoicons.com)](docs/rfcs/014-yotoicons-community-integration.md) *(Proposed — Blocked on Maintainer Approval)*
  - [RFC 015: Privacy-First Telemetry, Anonymization, & GDPR Transparency](docs/rfcs/015-privacy-first-telemetry-and-analytics.md)
  - [RFC 016: Content Security Policy (CSP) & Subresource Integrity (SRI)](docs/rfcs/016-content-security-policy-and-sri.md)
  - [RFC 017: Typography, Self-Hosted Roboto Font, and WOFF2 Bundling](docs/rfcs/017-typography-and-font-selection.md)
  - [RFC 018: Device Management, Status Monitoring, & Card Playback Remote Control](docs/rfcs/018-device-management-and-remote-control.md)
  - [RFC 019: Secrets Management, CI/CD Credentials, & Client-Side Token Security](docs/rfcs/019-secrets-management-and-ci-cd-credentials.md)
  - [RFC 020: Pre-Implementation Maintainer Manual Setup Checklist](docs/rfcs/020-pre-implementation-manual-setup-checklist.md)
