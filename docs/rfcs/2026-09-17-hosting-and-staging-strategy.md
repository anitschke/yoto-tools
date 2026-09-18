# RFC: Hosting Platform & Staging Strategy

- **Date:** 2026-09-17
- **Status:** Accepted
- **Author:** Antigravity Agent & Andrew Nitschke

---

## 1. Summary

This proposal establishes the hosting infrastructure, automated preview/staging environments, and continuous verification pipeline for `yoto-tools`.

---

## 2. Platform Selection: Netlify

The application is deployed as a static frontend bundle hosted on **Netlify** (under a default `.netlify.app` subdomain with optional custom domain support).

### Key Rationale
1. **Automated PR Deploy Previews:**
   - Every Pull Request opened on GitHub automatically creates an isolated, ephemeral preview deployment (e.g. `https://deploy-preview-42--yoto-tools.netlify.app`).
   - Enables manual exploratory testing and automated testing prior to merging into production (`main`).
   - Eliminates the complexity of maintaining separate staging branches or secondary staging repositories.
2. **Dynamic OAuth Redirects via Production Relay:**
   - As specified in [RFC: OAuth Client Registration & Ephemeral PR Preview Redirect Strategy](2026-09-17-oauth-client-id-and-pr-preview-redirects.md), Netlify PR previews participate in seamless OAuth logins by forwarding auth callbacks through the canonical production domain (`yoto-tools.netlify.app/callback`), bypassing Yoto's lack of wildcard redirect URIs.
3. **Zero-Risk Billing Model:**
   - Netlify enforces hard ceiling limits/pauses on free-tier usage rather than silently incurring overage charges on credit cards.
4. **Declarative Edge Rewrites & Headers (`netlify.toml`):**
   - Enables fine-grained `Cache-Control` header rules:
     - Fingerprinted assets (`/assets/*`): `Cache-Control: public, max-age=31536000, immutable`
     - Application entrypoint (`index.html`): `Cache-Control: public, max-age=0, must-revalidate`
   - Supports edge proxy rewrite rules (`status = 200`) to relay external RSS XML feeds and bypass browser CORS restrictions without managing custom backend compute instances.

---

## 3. Automated Post-Deploy Verification (Playwright)

To guarantee software quality across deployments:
- **Ephemeral Preview Validation:** GitHub Actions triggers automated Playwright E2E suites against each PR's Netlify preview URL.
- **Dedicated Test Environment:** Tests run against a dedicated, isolated non-production Yoto account to ensure tests validate real API interactions (card authoring, metadata syncing, icon selection) without risking personal player hardware or library corruption.
