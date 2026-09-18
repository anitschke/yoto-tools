# RFC 020: Pre-Implementation Maintainer Manual Setup Checklist

- **Status:** Proposed
- **Author:** Antigravity Agent
- **Date:** 2026-09-18
- **Area:** DevOps / Infrastructure / Maintainer Onboarding

---

## 1. Summary

Before application code implementation begins for `yoto-tools`, a small set of foundational third-party accounts, deployment targets, and repository security settings must be established manually by the repository owner/maintainer.

Because `yoto-tools` is a 100% client-side application with zero custom server infrastructure, this external setup is minimal and requires **no credit card or paid services**.

This RFC serves as the step-by-step maintainer guide detailing the exact manual actions needed across:
1. **Netlify** (Project Creation & Deploy Token)
2. **Yoto / Auth0** (Dedicated Single-Page Application Client ID)
3. **Google Analytics 4** (Privacy-First Data Stream)
4. **Dedicated Yoto Test Account** (Headless E2E Verification)
5. **GitHub Repository** (Environments, Secrets, & Hygiene)

---

## 2. Step 1: Netlify Setup (Project Creation & CLI Token)

`yoto-tools` is deployed as a static site to Netlify with ephemeral PR preview URLs.

### A. Create and Name the Netlify Project:
1. Log in to [https://app.netlify.com](https://app.netlify.com) (free tier is fully sufficient).
2. On your Netlify team dashboard, under **"Projects"** / **"Sites"**, start an initial deployment:
   - **Option 1 (Manual Drag-and-Drop):** On your machine create a temporary directory (`mkdir /tmp/dummy && echo "<h1>yoto-tools</h1>" > /tmp/dummy/index.html`) and drag-and-drop it into Netlify's drop zone.
   - **Option 2 (Import Git Repo):** Click **"Import from Git"**, select GitHub repo `anitschke/yoto-tools`, set Publish directory to `dist`, and click deploy.
3. **Rename the Project:**
   - Go to **Project configuration** (or **Site configuration**) ➔ **General** ➔ **Project details**.
   - Click **Change project name** (or **Change site name**), enter `yoto-tools`, and click **Save**.
   - This sets your canonical domain to: `https://yoto-tools.netlify.app`.

### B. Retrieve Project API ID (`NETLIFY_SITE_ID`):
- In that same **Project details** section, locate **"API ID"** (a UUID like `12345678-abcd-ef01-2345-6789abcdef01`).
- Copy this UUID—it will be added to GitHub Secrets as `NETLIFY_SITE_ID`.

### C. Generate Netlify Personal Access Token (`NETLIFY_AUTH_TOKEN`):
1. Click your user profile avatar (top-right corner) ➔ **User settings**.
2. In the left navigation, click **Applications**.
3. Under **Personal access tokens**, click **"New access token"**.
4. Name it `yoto-tools-github-actions`, set an expiration (e.g. 180 days or 1 year), and click **Generate token**.
5. Copy and store this token securely—it will be added to GitHub Secrets as `NETLIFY_AUTH_TOKEN`.

---

## 3. Step 2: Yoto Developer Dashboard Registration (`dashboard.yoto.dev`)

To avoid sharing the CLI tool's client credentials and to support browser-based PKCE authentication, register a dedicated application at [https://dashboard.yoto.dev/](https://dashboard.yoto.dev/):

### Form Fields to Fill:
1. **Name:** `yoto-tools`
2. **Description:**
   `A free and open source web app for managing Yoto players, importing podcasts, adding track icons, and controlling playback.`
3. **Application Type:** Select **Public Client** *(handles authentication on client side)*.
4. **Allowed Callback URLs:**
   ```text
   https://yoto-tools.netlify.app/callback, http://localhost:5173/callback
   ```
   > **Why Staging / PR Preview URLs Don't Need to Be Listed Here:**  
   > Yoto's portal strictly disallows wildcards (like `deploy-preview-*`). Per **[RFC 007](007-oauth-client-id-and-pr-preview-redirects.md)**, `yoto-tools` implements a **Canonical Callback Relay**. When a user logs in from any PR preview (e.g. `https://deploy-preview-42--yoto-tools.netlify.app`), the login request specifies `redirect_uri=https://yoto-tools.netlify.app/callback` with a return destination encoded into the OAuth `state`. The canonical production `/callback` page validates the origin and immediately forwards the browser back to the PR preview, where the PKCE `code_verifier` completes the token exchange. Thus, only the canonical production URL and localhost need to be registered!
5. **Allowed Logout URLs:**
   ```text
   https://yoto-tools.netlify.app, http://localhost:5173
   ```
6. **Application Logo URL:** *(Leave empty)*
7. **Application Privacy Policy URL:**
   ```text
   https://yoto-tools.netlify.app/privacy
   ```
8. **Required Scopes (Check the following):**
   - [x] `family:library:view` (View card library)
   - [x] `family:library:manage` (Manage / delete cards)
   - [x] `user:content:view` (Read playlist & chapter details)
   - [x] `user:content:manage` (Create, edit, and reorder tracks)
   - [x] `user:icons:manage` (Upload and assign pixel icons)
   - [x] `family:devices:view` (View player battery, online status, metadata)
   - [x] `family:devices:control` (Remotely trigger card playback, volume, pause)
   - [x] `offline_access` (Issue refresh tokens for seamless session persistence)
   - *(Optional: `family:devices:manage` if adjusting player nightlight/settings in the future)*
9. **Terms & Data Privacy:**
   - Check the agreement boxes for Terms and Conditions and Developer Security Policy.
10. Click **Create Application**.
11. **Copy the Client ID:**
    - Copy the generated public **Client ID** string.
    - *(Note: As a Public Client with PKCE, there is no Client Secret).*

---

## 4. Step 3: Google Analytics 4 Setup (GA4 Web Stream)

Per [RFC 015](015-privacy-first-telemetry-and-analytics.md), we collect cookieless, privacy-anonymized page views and operational metrics.

### Actions Required:
1. Go to [https://analytics.google.com](https://analytics.google.com).
2. Click the **Admin** gear icon (`⚙️`) in the bottom-left corner and create an Account / Property named `yoto-tools`.
3. Under **Property settings** ➔ **Data collection and modification** ➔ **Data streams**:
   - Click **Add stream** ➔ **Web**.
   - **Website URL:** `https://yoto-tools.netlify.app`
   - **Stream name:** `yoto-tools Production SPA`
   - Click **Create stream**.
4. Copy the **Measurement ID** (`G-XXXXXXXXXX`).
5. *(Optional / Recommended)*: Under **Data collection and modification**:
   - In **Data collection**: Verify Google Signals is not activated (remains in default "Get started" state).
   - In **Data retention**: Keep the default 14 months (or switch to 2 months if preferred; no personal data or cookies are stored).

---

## 5. Step 4: Dedicated Yoto Test Account Setup (Playwright E2E)

Automated end-to-end tests run in CI against deploy previews to verify the OAuth login handshake and library loading without touching real family cards or audio files.

### Actions Required:
1. **Register a Test Yoto Account:**
   - Create a dedicated, throwaway Yoto account at [https://yotoplay.com](https://yotoplay.com) using an alias or disposable email (e.g. `yourname+yototest@example.com`).
   - Choose a secure password.
2. **Verify Account:**
   - Complete the email verification link from Yoto.
3. **Important Safety Guidelines:**
   - **Never** add payment methods, credit cards, or Yoto Club subscriptions to this test account.
   - **Never** pair a primary physical child player to this account.
   - Create 1 or 2 sample empty Make-Your-Own (MYO) playlists on the account so the test suite has cards to list.
4. **Local E2E Test Execution (`.env.test.local`):**
   - For developers wishing to run Playwright E2E tests on their local machine (`npm run test:e2e`), create a strictly git-ignored file named `.env.test.local`:
     ```ini
     # .env.test.local (strictly git-ignored)
     TARGET_URL=http://localhost:5173
     YOTO_TEST_ACCOUNT_EMAIL=yourname+yototest@example.com
     YOTO_TEST_ACCOUNT_PASSWORD=your_secure_test_password
     ```
   - Playwright's test runner (`playwright.config.ts`) automatically loads `.env.test.local` if present, while CI injects `YOTO_TEST_ACCOUNT_*` directly from GitHub Actions Secrets.
   - If this file is absent locally, `npm run test:unit` and standard component tests still run and pass; only live end-to-end integration tests that authenticate against Yoto's server are skipped or require these variables.

---

## 6. Step 5: GitHub Repository Configuration

Configure the repository (`anitschke/yoto-tools`) with the required Environments, Secrets, and Code Hygiene.

### A. Create GitHub Environments
Navigate to: **Settings** ➔ **Environments** ➔ **New environment**:

1. **Create Environment: `staging-preview`**
   - **Deployment protection rules:** Check **Required reviewers** and add yourself (the repository maintainer).
   - *Why:* External pull requests from forks cannot access deployment credentials or execute E2E tests against preview environments without your one-click approval.
2. **Create Environment: `production`**
   - **Deployment branches:** Select **Selected branches** ➔ Add `main`.

---

### B. Add GitHub Repository Secrets
Navigate to: **Settings** ➔ **Secrets and variables** ➔ **Actions** ➔ **Secrets**:

Add the following 4 **Repository Secrets** (usable by both `staging-preview` and `production`):

| Secret Name | Value to Paste | Source |
|---|---|---|
| `NETLIFY_AUTH_TOKEN` | Your Netlify Personal Access Token | Step 2.C |
| `NETLIFY_SITE_ID` | Your Netlify Project API ID (UUID) | Step 2.B |
| `YOTO_TEST_ACCOUNT_EMAIL` | Dedicated Yoto test email | Step 5.1 |
| `YOTO_TEST_ACCOUNT_PASSWORD` | Dedicated Yoto test password | Step 5.1 |

---

### C. Configure Public Constants in Code
Because `VITE_YOTO_CLIENT_ID` and `VITE_GA_MEASUREMENT_ID` are non-sensitive public constants:
- They do **not** need to be GitHub secrets or environment variables.
- We check them directly into `src/config.ts` (or `.env` in the repository root) so that both local development (`npm run dev`) and CI builds run automatically with zero friction.

---

### D. Enable GitHub Secret Scanning & Push Protection
Navigate to: **Settings** ➔ **Code security and analysis**:
- Ensure **Secret scanning** is enabled.
- Ensure **Push protection** is enabled.

---

## 7. Pre-Implementation Verification Checklist

Before giving the agent the green light to start implementing code (`package.json`, Vite configuration, and Lit elements), verify this checklist is complete:

- [x] Netlify project `yoto-tools` created and canonical URL established (`https://yoto-tools.netlify.app`).
- [x] `NETLIFY_AUTH_TOKEN` and `NETLIFY_SITE_ID` generated.
- [x] Dedicated Single-Page Application (SPA) created in Auth0 / Yoto Developer Portal with callback `https://yoto-tools.netlify.app/callback, http://localhost:5173/callback`.
- [x] Public Auth0 Client ID copied.
- [x] Google Analytics 4 property created and `G-XXXXXXXXXX` Measurement ID copied.
- [x] Dedicated test Yoto account created and verified (`YOTO_TEST_ACCOUNT_EMAIL`).
- [x] GitHub Environment `staging-preview` created with maintainer review requirement.
- [x] GitHub Environment `production` created restricted to `main`.
- [x] 4 GitHub Repository Secrets configured (`NETLIFY_AUTH_TOKEN`, `NETLIFY_SITE_ID`, `YOTO_TEST_ACCOUNT_EMAIL`, `YOTO_TEST_ACCOUNT_PASSWORD`).
- [x] Secret scanning and push protection enabled on GitHub repository.

---

Once these steps are completed, we are ready to commit the RFCs and begin Phase 1 of code implementation!
