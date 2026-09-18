# RFC: Client-Side Single-Page Application (SPA) & Routing Strategy

- **Date:** 2026-09-17
- **Status:** Accepted
- **Author:** Antigravity Agent & Andrew Nitschke

---

## 1. Summary

This proposal establishes the client-side architectural paradigm for `yoto-tools`, evaluating Single-Page Application (SPA) vs. Multi-Page Application (MPA) architectures and defining the routing model using **`@lit-labs/router`**.

---

## 2. Evaluation: SPA vs. MPA

### The Multi-Page Application (MPA) Approach
In a traditional MPA, navigating between distinct views (e.g. from `/library` to `/editor` or `/importer`) triggers full browser document reloads.
- *Disadvantage 1 (Connection Teardown):* Yoto player telemetry and remote commands require an active WebSocket connection to AWS IoT Core (`wss://`). An MPA terminates and re-handshakes this connection on every link click.
- *Disadvantage 2 (Interrupted Transfers):* Ingestion of podcast feeds or large batches of local audio files involves multi-step SHA-256 calculation, presigned S3 uploads, and transcode polling. Page reloads abort these active background operations.
- *Disadvantage 3 (Asset Re-Evaluation):* Icon catalog JSON indices and search caches would need to be reloaded into browser memory on every page.

### The Single-Page Application (SPA) Approach
- **Decision:** Build `yoto-tools` as an SPA.
- In-memory state, live WebSockets, background upload tasks, and indexed icon data persist seamlessly across view changes.

---

## 3. Routing Engine: `@lit-labs/router`

Rather than adopting heavy monolithic framework routers, `yoto-tools` uses **`@lit-labs/router`**:
1. **Lightweight & Native:** Designed specifically for Lit components, integrating directly with component lifecycles and reactive properties.
2. **HTML5 History API:** Provides clean URL paths without relying on hash fragments (`#`).
3. **Declarative Route Table:** Maps routes directly to view components (e.g., `/`, `/cards/:id`, `/import/podcast`, `/devices`).
