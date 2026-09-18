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
3. **Reactive State & Event-Driven UX:**
   - Powered by `@lit/context` and `@lit-labs/router` for persistent live WebSockets and uninterrupted background transfers.
   - Decoupled toast notifications via bubbling custom DOM events (`<yoto-toast-manager>`).
4. **Reusable Design System (`src/widgets/`):**
   - Standardized Lit custom elements for buttons, dropdowns, native `<dialog>` modals, and 16×16 LED pixel displays.
5. **Practical Persistence & Privacy:**
   - Session & metadata stored simply in `localStorage`.
   - Large audio uploads and ZIP extractions streamed through the browser's Origin Private File System (OPFS).
   - Zero-cookie, privacy-first telemetry via the lightweight GA4 Measurement Protocol with complete PII redaction, an opt-out toggle, and full transparency page (`/privacy`).
6. **Instant, Zero-Latency Icon Search:**
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
- **Interactive 16×16 Pixel Grid:** Preview icons in true Yoto LED display format.
- **Pre-Indexed Search:**
  - Embedded Google Noto Emoji library (Apache 2.0).
  - Official Yoto public icon library.
  - Future support for community icon integrations (e.g., [yotoicons.com](https://yotoicons.com)) pending maintainer alignment.
- **Automatic Auto-Suggest:** Contextual search based on track title and chapter keywords.
- **Custom Icon Upload:** Direct browser upload of custom 16×16 pixel art.

### 📱 Real-Time Device Status & Remote
- View battery level, online status, currently playing title, and volume over AWS IoT WebSockets directly from your browser.

---

## 🛠️ Technology Stack

- **UI Framework:** [Lit 3.x](https://lit.dev/) (Lightweight Web Components / Custom Elements)
- **Routing:** [@lit-labs/router](https://www.npmjs.com/package/@lit-labs/router)
- **State Management:** [@lit/context](https://lit.dev/docs/data/context/)
- **Language & Compiler:** TypeScript (strict mode, experimental decorators, `tsc --noEmit`)
- **Build Tool:** [Vite](https://vitejs.dev/)
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
  - [2026-09-17: Build Tooling, Bundling, and TypeScript Compilation Pipeline](docs/rfcs/2026-09-17-build-tooling-and-typescript-compilation.md)
  - [2026-09-17: Reusable Widget Component Library & Design System](docs/rfcs/2026-09-17-widgets-and-component-library.md)
  - [2026-09-17: Error Handling, Console Diagnostics, and Toast Notifications](docs/rfcs/2026-09-17-error-handling-and-toast-notifications.md)
  - [2026-09-17: Privacy-First Telemetry & Analytics Engine](docs/rfcs/2026-09-17-privacy-first-telemetry-and-analytics.md)
  - [2026-09-17: OAuth Client Registration & Ephemeral PR Preview Redirect Strategy](docs/rfcs/2026-09-17-oauth-client-id-and-pr-preview-redirects.md)
  - [2026-09-17: Audio Ingestion, ZIP Extraction, and Upload Concurrency Pipeline](docs/rfcs/2026-09-17-audio-ingestion-zip-and-upload-concurrency.md)
  - [2026-09-17: Podcast RSS Importer & Card Sync](docs/rfcs/2026-09-17-podcast-rss-importer-and-card-sync.md)
  - [2026-09-17: CORS Proxy Strategy for External RSS Podcast Feeds](docs/rfcs/2026-09-17-cors-proxy-for-rss-feeds.md)
  - [2026-09-17: Hosting Platform & Staging Strategy](docs/rfcs/2026-09-17-hosting-and-staging-strategy.md)
  - [2026-09-17: Client-Side SPA & Routing Strategy](docs/rfcs/2026-09-17-client-spa-and-routing-strategy.md)
  - [2026-09-17: Asset Bundling, Content-Addressable Hashing, and Cache Busting](docs/rfcs/2026-09-17-asset-bundling-and-cache-busting.md)
  - [2026-09-17: Inverted Icon Indexing & Client-Side Search Engine](docs/rfcs/2026-09-17-inverted-icon-index-and-search.md)
  - [2026-09-17: Google Noto Emoji Icon Provider Integration](docs/rfcs/2026-09-17-noto-emoji-icon-provider.md)
  - [2026-09-17: Official Yoto Icon Provider Integration](docs/rfcs/2026-09-17-yoto-official-icon-provider.md)
  - [2026-09-17: Community Icon Provider Integration (yotoicons.com)](docs/rfcs/2026-09-17-yotoicons-community-integration.md) *(Proposed — Blocked on Maintainer Approval)*
