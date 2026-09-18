# RFC 019: Secrets Management, CI/CD Credentials, & Client-Side Token Security

- **Status:** Proposed
- **Author:** Antigravity Agent
- **Date:** 2026-09-18
- **Area:** Security / DevOps / CI/CD / Architecture

---

## 1. Context & Background

`yoto-tools` is architected as a 100% client-side, serverless Single-Page Application (SPA) deployed to Netlify via GitHub Actions workflows. 

Because there is **no custom backend server or database**, secrets management in `yoto-tools` fundamentally differs from traditional multi-tier web applications:
1. **Zero Runtime Secrets in Client Bundles:** No API master keys, database passwords, or server private keys exist or should ever be embedded in client-side code (`src/` or `dist/`).
2. **Public Identifiers vs. Secrets:** Parameters such as Auth0 OAuth Client IDs and Google Analytics 4 Measurement IDs are designed by their respective providers to be public client identifiers, not secrets.
3. **Automated CI/CD Deployment & Testing Credentials:** The only true confidential credentials in the repository belong to deployment automations (Netlify CLI tokens) and automated integration tests (test account credentials for Playwright E2E suites).

This RFC establishes the definitive catalog of all repository secrets, their storage locations in GitHub Repository Secrets and GitHub Environments, security boundary protections against malicious fork PRs, and clear guidelines on client-side token handling.

---

## 2. Secrets Inventory & Catalog

All production and CI/CD secrets are stored exclusively within **GitHub Secrets** (`Settings` -> `Secrets and variables` -> `Actions`).

| Secret Name | Purpose | Where Used | Sensitivity Level | Environment / Scope |
|---|---|---|---|---|
| `NETLIFY_AUTH_TOKEN` | Personal Access Token (PAT) used by Netlify CLI / GitHub Action to deploy static build artifacts (`dist/`) to Netlify. | GitHub Actions CI/CD (`.github/workflows/ci.yml`) | **Critical** (Grants deploy permissions to the Netlify site) | `production`, `staging-preview` |
| `NETLIFY_SITE_ID` | Netlify API UUID identifying the specific target `yoto-tools` site instance. | GitHub Actions CI/CD (`.github/workflows/ci.yml`) | **Moderate** (Used with `NETLIFY_AUTH_TOKEN` to target the site) | Repository Secret / Environment |
| `YOTO_TEST_ACCOUNT_EMAIL` | Dedicated test Yoto account email address used for headless Playwright end-to-end (E2E) verification against deployed preview URLs. | GitHub Actions E2E test step (`npm run test:e2e`) | **Moderate** (Test harness user, no production user data) | `staging-preview`, `production` |
| `YOTO_TEST_ACCOUNT_PASSWORD` | Password for the dedicated Yoto E2E test harness account. | GitHub Actions E2E test step (`npm run test:e2e`) | **High** (Allows login to the isolated test account) | `staging-preview`, `production` |

---

## 3. GitHub Environments & Fork Security Model

### A. The Fork Pull Request Threat Vector
Public open-source repositories face supply-chain risks where untrusted pull requests from forks could attempt to exfiltrate CI secrets (e.g. by modifying test scripts or workflows to print secrets).

### B. Defense Strategy: Gated GitHub Environments
To mitigate this risk, `yoto-tools` leverages **GitHub Environments** with explicit deployment protection rules:

```
┌─────────────────────────────────────────────────────────────┐
│                      Pull Request Event                     │
└──────────────────────────────┬──────────────────────────────┘
                               │
               Is PR from Fork or Untrusted Author?
                               │
                ┌──────────────┴──────────────┐
               YES                            NO (Maintainer / Internal)
                │                             │
    ┌───────────────────────────┐             │
    │ Requires Maintainer Review│             │
    │  & Manual Approval via    │             │
    │    GitHub Environment     │             │
    │    ("staging-preview")    │             │
    └──────────────┬────────────┘             │
                   │ (Approved)               │
                   ▼                          ▼
    ┌─────────────────────────────────────────────────────────┐
    │       GitHub Action accesses Secrets in Environment     │
    │  - NETLIFY_AUTH_TOKEN                                   │
    │  - NETLIFY_SITE_ID                                      │
    │  - YOTO_TEST_ACCOUNT_EMAIL                              │
    │  - YOTO_TEST_ACCOUNT_PASSWORD                           │
    └──────────────────────────┬──────────────────────────────┘
                               ▼
    ┌─────────────────────────────────────────────────────────┐
    │ 1. Deploy preview: deploy-preview-<PR_NUM>--<SITE>      │
    │ 2. Execute Playwright E2E tests against preview URL     │
    └─────────────────────────────────────────────────────────┘
```

1. **Environment `staging-preview`:**
   - Holds `NETLIFY_AUTH_TOKEN`, `NETLIFY_SITE_ID`, `YOTO_TEST_ACCOUNT_EMAIL`, and `YOTO_TEST_ACCOUNT_PASSWORD`.
   - **Protection Rule:** External pull requests cannot trigger jobs targeting this environment without manual approval from a repository maintainer.
2. **Environment `production`:**
   - Scoped strictly to pushes on the `main` branch.
   - Deploys directly to the canonical production domain (`yoto-tools.netlify.app`).
3. **Local Development:**
   - Developers working locally do not need `NETLIFY_AUTH_TOKEN` or `NETLIFY_SITE_ID` because local development runs via `npm run dev` (Vite dev server) with no Netlify interaction.
   - For running E2E tests locally, developers may optionally define `YOTO_TEST_ACCOUNT_EMAIL` and `YOTO_TEST_ACCOUNT_PASSWORD` in a local `.env.local` file (which is git-ignored).

---

## 4. Public Identifiers vs. Secrets: Storage & Build-Time Injection Architecture

Several configuration variables exist in the application that appear in network requests and bundle configurations. It is critical to differentiate between confidential credentials (which belong in GitHub Secrets) and public configuration constants:

| Identifier | Type | Git Tracked? | Source / Storage Location | Injection & Usage Method |
|---|---|---|---|---|
| **Yoto Auth0 Client ID** (`VITE_YOTO_CLIENT_ID`) | Public Identifier (PKCE) | Yes (Default in code) | `src/config.ts` / GitHub Repository Variables (`vars.VITE_YOTO_CLIENT_ID`) | Injected via `import.meta.env.VITE_YOTO_CLIENT_ID` at build time; overridable via user Settings (`localStorage`) |
| **GA4 Measurement ID** (`VITE_GA_MEASUREMENT_ID`) | Public Identifier | Yes (Default in code) | `src/config.ts` / GitHub Repository Variables (`vars.VITE_GA_MEASUREMENT_ID`) | Injected via `import.meta.env.VITE_GA_MEASUREMENT_ID` at build time; noop when absent |
| **CORS Proxy Endpoint** | Public Free Utility | Yes (Default in code) | `src/config.ts` (`https://corsproxy.io/?url=`) | Hardcoded default constant; no API keys needed |

### A. Centralized Configuration Module (`src/config.ts`)
Default values for public identifiers are committed directly to version control in `src/config.ts`, providing safe fallbacks for local development out of the box:

```typescript
// src/config.ts

export const CONFIG = {
  // Public Auth0 Client ID (RFC 007). Injected by Vite or falls back to production default.
  yotoClientId: (import.meta.env.VITE_YOTO_CLIENT_ID as string) || 'yoto-tools-production-client-id',

  // Public GA4 Measurement ID (RFC 015). Injected by Vite; defaults to placeholder.
  gaMeasurementId: (import.meta.env.VITE_GA_MEASUREMENT_ID as string) || 'G-XXXXXXXXXX',

  // Yoto Auth0 & API endpoints
  auth0Domain: 'login.yotoplay.com',
  apiBaseUrl: 'https://api.yotoplay.com',

  // Free public CORS Proxy for RSS podcast feeds (RFC 009)
  corsProxyUrl: 'https://corsproxy.io/?url=',
} as const;
```

### B. Build-Time Injection via GitHub Repository Variables
In GitHub Actions CI/CD, public configuration values do **not** use GitHub Secrets (which mask text in build logs and complicate debugging). Instead, they are stored under **GitHub Actions Variables** (`Settings` -> `Secrets and variables` -> `Actions` -> `Variables` tab):

```yaml
      - name: Build Static Production Assets
        env:
          VITE_YOTO_CLIENT_ID: ${{ vars.VITE_YOTO_CLIENT_ID }}
          VITE_GA_MEASUREMENT_ID: ${{ vars.VITE_GA_MEASUREMENT_ID }}
        run: npm run build
```

During `vite build`, Vite automatically replaces all occurrences of `import.meta.env.VITE_*` with static string literals during Rollup minification.

### C. Zero `.env` Files Principle
`yoto-tools` deliberately avoids relying on `.env` files:
1. **Batteries-Included Source Defaults:** Running `npm run dev` immediately works out of the box without creating or copying any `.env` file because `src/config.ts` includes safe local fallbacks for all endpoints.
2. **In-App Developer Settings:** Developers wanting to test a custom Yoto Client ID do so directly in the UI Settings modal (`localStorage`), eliminating the need for developer-specific local environment files.
3. **No Local Telemetry Needed:** Because telemetry automatically disables itself on `localhost` ([RFC 015](015-privacy-first-telemetry-and-analytics.md)), developers never need a local GA4 Measurement ID.
4. **Defensive `.gitignore`:** As a defense-in-depth precaution, `.gitignore` ignores `.env*` to ensure that if a developer ever accidentally creates a `.env` file on their machine, it is never committed.

### D. User Runtime Overrides ("Bring Your Own App")
Per [RFC 007 (Section 4)](007-oauth-client-id-and-pr-preview-redirects.md), `yoto-tools` supports a runtime override:
- In the application settings dialog, users can supply a custom Auth0 Client ID.
- When set, the application persists the custom ID to `localStorage.getItem('yoto_custom_client_id')` and prioritizes it over `CONFIG.yotoClientId`.

### E. Why These Public Identifiers Are Secure
1. **Auth0 Client ID with PKCE:** Per [RFC 007](007-oauth-client-id-and-pr-preview-redirects.md), OAuth 2.0 PKCE requires no client secret. The authorization code cannot be exchanged without the ephemeral, locally generated `code_verifier` held only in the user's browser `sessionStorage`.
2. **GA4 Measurement ID:** Per [RFC 015](015-privacy-first-telemetry-and-analytics.md), analytics calls are sent directly via browser `fetch` to Google's public `/g/collect` endpoint. No secret `api_secret` is bundled.
3. **CORS Proxy:** Per [RFC 009](009-cors-proxy-for-rss-feeds.md), public podcast RSS feeds are proxied via `https://corsproxy.io/?url=...` with zero authentication credentials.

---

## 5. Client-Side User Tokens & Ephemeral Secrets

When a user logs in to `yoto-tools`, their browser receives an OAuth `access_token` and `refresh_token` from Yoto's Auth0 identity service.

### Security Boundaries:
1. **Local Storage Isolation:**
   - Tokens are stored in browser `localStorage` under keys `yoto_access_token`, `yoto_refresh_token`, and `yoto_token_expires_at`.
   - They are scoped strictly to the origin by browser Same-Origin Policy (SOP).
2. **No Central Server Access:**
   - User tokens are never sent to any intermediary server or Netlify backend function. All API requests go directly from `window.fetch` to `https://api.yotoplay.com`.
3. **No Leakage via Telemetry or Logs:**
   - Telemetry services ([RFC 015](015-privacy-first-telemetry-and-analytics.md)) and UI logging ([RFC 006](006-error-handling-and-toast-notifications.md)) strictly sanitize and scrub URL parameters, headers, and error objects to ensure bearer tokens and authorization codes are never logged or transmitted.
4. **Content Security Policy (CSP) Protection:**
   - Strict CSP ([RFC 016](016-content-security-policy-and-sri.md)) prevents unauthorized external scripts or XSS attacks from exfiltrating `localStorage` contents.

---

## 6. Secret Rotation & Lifecycle Management

1. **Netlify Auth Token Rotation:**
   - Rotated every 180 days or immediately upon any suspected compromise or maintainer offboarding.
   - Generation: Netlify Dashboard -> User Settings -> Applications -> Personal Access Tokens.
   - Replacement: Updated in GitHub Repository Settings -> Environments -> `staging-preview` & `production`.
2. **Test Account Password Rotation:**
   - The dedicated Yoto test account (`YOTO_TEST_ACCOUNT_EMAIL`) holds no real payment methods, subscription passes, or sensitive family cards.
   - Password is rotated every 90 days and updated in GitHub Secrets.
3. **Secret Leak Detection in CI & Git Hygiene:**
   - A secret scanner (such as GitHub Secret Scanning and Push Protection) is enabled on the repository to prevent accidental commits of tokens or private credentials.
   - `.gitignore` defensively ignores `.env*`, build artifacts (`dist/`), and temporary test artifacts.

---

## 7. Implementation Checklist

- [ ] Create GitHub Environments: `staging-preview` (with maintainer protection rules) and `production`.
- [ ] Add `NETLIFY_AUTH_TOKEN` and `NETLIFY_SITE_ID` to GitHub Secrets / Environments.
- [ ] Add `VITE_YOTO_CLIENT_ID` and `VITE_GA_MEASUREMENT_ID` to GitHub Repository Variables (`vars.*`).
- [ ] Create isolated Yoto test account and add `YOTO_TEST_ACCOUNT_EMAIL` / `YOTO_TEST_ACCOUNT_PASSWORD` to GitHub Secrets.
- [ ] Configure `.github/workflows/ci.yml` to pull credentials from environment contexts.
- [ ] Verify `.gitignore` defensively excludes `.env*` and test/build artifacts.
