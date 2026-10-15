# Contributor & Agent Guidelines (AGENTS.md)

Welcome to `yoto-tools`! This document serves as the central guide for human contributors and AI agents working on this codebase. It establishes our architecture conventions, coding standards, code commenting practices, state management, storage policies, and development workflows.

---

## 1. Core Principles

1. **Static / Serverless Simplicity:**
   - Everything must run client-side in the browser. Do not introduce backend servers or compute dependencies.
2. **Strict TypeScript & Type Safety:**
   - Full strict mode is mandatory. Never use `any` unless absolutely forced by external untyped libraries (wrap in safe typed abstractions).
   - Strict null checks, exhaustive union checking, and explicit return types on exported methods are required.
3. **Reactive State via Lit Context (`@lit/context`):**
   - Use `@lit/context` (`@provide` / `@consume`) for app-wide reactive state (auth session, current card, devices, notifications).
   - **Immutable Updates:** Treat context values as immutable. Always assign fresh object references (`this.currentCard = { ...this.currentCard, title: 'New' }`) so consumer components automatically detect updates and re-render.
4. **Widget Library First Policy (`src/widgets/`):**
   - **Always Check `src/widgets/` First:** Before writing or implementing any UI element or interactive component in a view, you **MUST first check `src/widgets/`** to see if a component or primitive already exists to satisfy the requirement.
   - **Widget Directory Guide & Catalog ([`src/widgets/AGENTS.md`](file:///home/anitschk/sandbox/yoto-tools/src/widgets/AGENTS.md)):** Refer directly to `src/widgets/AGENTS.md` for a detailed inventory, architectural rationale, and 3–5 sentence descriptions of all available widgets in the library (buttons, dialogs, dropdowns, inputs, badges, progress bars, pixel icons, toasts).
   - **Create New Widgets in `src/widgets/` When Missing:** If the required component does not exist in `src/widgets/`, **do not write ad-hoc or one-off HTML/CSS inside your view**. Instead, author a clean, reusable component inside `src/widgets/` following our design conventions, write its unit tests, document it in `src/widgets/AGENTS.md`, and then consume it in the view.
   - **Naming & Prefix Standards:**
     - All shared widgets live in `src/widgets/` and MUST be prefixed with **`yt-`** (e.g. `<yt-button>`, `<yt-dialog>`, `<yt-dropdown>`, `<yt-pixel-icon>`).
     - All CSS custom properties and design tokens MUST be prefixed with **`--yt-`** (e.g. `--yt-color-primary`, `--yt-radius-md`, `--yt-color-surface-dark`).
     - Standard pixel icons MUST be rendered via `<yt-pixel-icon src="...">`, which standardizes dimensions, background contrast canvas, and `image-rendering: pixelated`.
5. **Content Hashing Standards (SHA-256 Default):**
   - Whenever we need to generate a content hash for any purpose (content-addressable icon names, bundle fingerprinting, audio deduplication, cache validation), **ALWAYS prefer SHA-256** instead of non-cryptographic hashes like MurmurHash.
   - Modern browsers support SHA-256 natively and with high performance via the Web Crypto API (`crypto.subtle.digest('SHA-256', buffer)`).
   - **Exception:** The only exception is when directly interfacing with external services that mandate a different algorithm—specifically AWS S3 operations requiring **MD5** to match S3 `ETag` headers or `Content-MD5` checksums.
6. **Passthrough & Metadata Preservation:**
   - Yoto card objects contain dynamic and undocumented fields (e.g. ambient lighting, nightlight color, custom cover art). Always preserve unrecognized properties when updating card playlists (`/content`).
7. **Writing Meaningful Code Comments & RFC References:**
   - **Explain the "Why", Not the "What":** Do not write comments that merely rephrase the code in plain English (e.g. avoid `// increment i by 1` or `// set title to new title`). Instead, explain the non-obvious engineering rationale, tradeoffs, hardware constraints, or browser quirks that dictated the implementation choice.
   - **Link to Relevant RFCs:** Our RFCs (`docs/rfcs/001-...` through `015-...`) detail architectural motivations and trade-offs in depth. Code comments and configuration files should explicitly cite the relevant RFC whenever applying a policy or design pattern defined there.
   - **Example:** In configuration files such as `netlify.toml`, the HTTP caching block must reference the asset bundling RFC:
     ```toml
     # ==============================================================================
     # HTTP Cache-Control & Security Headers
     # See: docs/rfcs/004-asset-bundling-and-cache-busting.md
     # ==============================================================================
     [[headers]]
       for = "/*"
       [headers.values]
         Cache-Control = "public, max-age=0, must-revalidate"
     ```
8. **Privacy-First Telemetry & Mandatory `/privacy` Disclosure:**
   - If any new telemetry, metrics, or diagnostic events are ever added to the application, they **MUST be documented on the dedicated Privacy & Transparency Page ([`/privacy`](file:///home/anitschk/sandbox/yoto-tools/src/views/privacy-view.ts))** per [RFC 015: Privacy-First Telemetry, Anonymization, & GDPR Transparency](docs/rfcs/015-privacy-first-telemetry-and-analytics.md).
   - **Page Mandate:** The `/privacy` route must list every single metric collected, explain the technical and product rationale for why it is collected, explicitly reassure what is never collected (no PII, credentials, card IDs, or raw filenames), and provide a prominent one-click toggle to disable all telemetry across the application.
9. **No Clutter in Markdown Documentation:**
   - Keep high-level documentation concise. Prefer rich, in-code TypeScript docstrings and comments for implementation specifics rather than maintaining dozens of small markdown documents that risk becoming stale.

---

## 2. Storage & Persistence Policies

Keep storage mechanisms simple, predictable, and tailored to data size:

1. **Small Metadata & Session State $\rightarrow$ `localStorage`:**
   - **What lives here:** Auth tokens (`access_token`, `refresh_token`), active Client ID, user preferences, and card editing draft backups.
   - **Rationale:** Simplicity. Avoid the complexity and asynchronous boilerplate of IndexedDB for data that only takes a few kilobytes.
2. **Ephemeral Audio & Large Files $\rightarrow$ OPFS (Origin Private File System):**
   - **What lives here:** Extracted MP3s/M4As from dropped folders or unpacked ZIP archives awaiting upload.
   - **Rationale:** Prevents browser heap out-of-memory crashes on large album imports. Fast, direct disk streaming. Clean up temporary files immediately after uploads complete.
3. **Icon Cache & Static Data $\rightarrow$ Browser HTTP Cache / CacheStorage:**
   - Content-addressable assets (`/assets/*`) are cached automatically by the browser via `netlify.toml` immutable headers.

---

## 3. Technology Stack & Key Libraries

- **Language:** TypeScript (`target: ES2022`, `module: ESNext`, strict mode).
- **Compilation & Bundling:** [Vite](https://vitejs.dev/) for fast HMR and tree-shaken static production builds.
- **Component Model:** [Lit 3.x](https://lit.dev/) (`LitElement`, `html`, `css`).
- **Routing:** [`@lit-labs/router`](https://www.npmjs.com/package/@lit-labs/router).
- **State Management:** [`@lit/context`](https://lit.dev/docs/data/context/).
- **ZIP Decompression:** [`@zip.js/zip.js`](https://gildas-lormeau.github.io/zip.js/).
- **Audio Tag Extraction:** [`music-metadata-browser`](https://github.com/Borewit/music-metadata-browser).
- **MQTT over WebSocket:** [`mqtt`](https://github.com/mqttjs/MQTT.js).
- **Testing:**
  - **Unit / Component Tests:** [@web/test-runner](https://modern-web.dev/docs/test-runner/overview/) with `@open-wc/testing`. All unit and component tests **MUST be co-located directly next to their corresponding source file** (e.g. `src/widgets/yt-button.test.ts` lives next to `src/widgets/yt-button.ts`).
  - **End-to-End Tests:** [Playwright](https://playwright.dev/) running against Netlify PR deploy previews and production in `test/e2e/`.
- **Linting & Code Formatting:**
  - [ESLint](https://eslint.org/) with `@typescript-eslint/recommended-requiring-type-checking` and `eslint-plugin-lit`.
  - [Prettier](https://prettier.io/) for deterministic formatting.

---

## 4. Directory Structure

```
yoto-tools/
├── docs/
│   ├── ARCHITECTURE.md    # High-level architecture, diagrams, topology
│   └── rfcs/              # Architectural Proposals & RFCs (001-title.md, 002-title.md)
├── src/
│   ├── api/               # Yoto REST API client & OAuth PKCE engine
│   ├── mqtt/              # MQTT over WebSocket client (AWS IoT connection)
│   ├── context/           # App-wide Lit context definitions (auth, card, player)
│   ├── widgets/           # Core reusable UI custom elements and co-located unit tests
│   │   ├── yt-button.ts
│   │   └── yt-button.test.ts # Unit tests live directly next to corresponding source files
│   ├── views/             # Page-level views (library, editor, importer, status)
│   ├── services/          # Business logic (podcast parsing, zip extraction, OPFS, hashing)
│   ├── models/            # TypeScript interfaces & domain types
│   └── index.ts           # Application entrypoint
├── test/
│   └── e2e/               # Playwright E2E tests
├── AGENTS.md              # Contributor & AI Agent guidelines
└── README.md              # Project overview & roadmap
```

---

## 5. Development & Testing Commands

### Running Unit & Component Tests
```bash
npm run test:unit
```

### Running Playwright End-to-End Tests
```bash
npm run test:e2e
```

### Static Build & Type Check
```bash
npm run typecheck
npm run build
```
