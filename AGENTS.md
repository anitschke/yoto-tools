# Contributor & Agent Guidelines (AGENTS.md)

Welcome to `yoto-tools`! This document serves as the central guide for human contributors and AI agents working on this codebase. It establishes our architecture conventions, coding standards, state management practices, storage policies, and development workflows.

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
4. **Reusable Widget Architecture:**
   - Standard UI elements (buttons, dialogs, dropdowns, inputs, pixel displays) live under `src/widgets/`.
   - Never write one-off raw button, select, or modal markup with ad-hoc styling inside views. Always reuse or extend widgets from `src/widgets/`.
5. **Passthrough & Metadata Preservation:**
   - Yoto card objects contain dynamic and undocumented fields (e.g. ambient lighting, nightlight color, custom cover art). Always preserve unrecognized properties when updating card playlists (`/content`).
6. **No Clutter in Markdown Documentation:**
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
  - **Unit / Component Tests:** [@web/test-runner](https://modern-web.dev/docs/test-runner/overview/) with `@open-wc/testing`.
  - **End-to-End Tests:** [Playwright](https://playwright.dev/) running against Netlify PR deploy previews and production.
- **Linting & Code Formatting:**
  - [ESLint](https://eslint.org/) with `@typescript-eslint/recommended-requiring-type-checking` and `eslint-plugin-lit`.
  - [Prettier](https://prettier.io/) for deterministic formatting.

---

## 4. Directory Structure

```
yoto-tools/
├── docs/
│   ├── ARCHITECTURE.md    # High-level architecture, diagrams, topology
│   └── rfcs/              # Architectural Proposals & RFCs (YYYY-MM-DD-title.md)
├── src/
│   ├── api/               # Yoto REST API client & OAuth PKCE engine
│   ├── mqtt/              # MQTT over WebSocket client (AWS IoT connection)
│   ├── context/           # App-wide Lit context definitions (auth, card, player)
│   ├── widgets/           # Core reusable UI custom elements (buttons, modals, inputs)
│   ├── views/             # Page-level views (library, editor, importer, status)
│   ├── services/          # Business logic (podcast parsing, zip extraction, OPFS, hashing)
│   ├── models/            # TypeScript interfaces & domain types
│   └── index.ts           # Application entrypoint
├── test/
│   ├── unit/              # Web Test Runner unit and component tests
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
