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
1. **Netlify** (Hosting & Deploy Target)
2. **GitHub Repository** (Environments, Secrets, & Variables)
3. **Google Analytics 4** (Privacy-First Data Stream)
4. **Dedicated Yoto Test Account** (Headless E2E Verification)

---

## 2. Step 1: Netlify Setup (Site Creation & CLI Token)

`yoto-tools` is deployed as a static site to Netlify with ephemeral PR preview URLs.

### Actions Required:
1. **Create / Log in to Netlify Account:**
   - Go to [https://app.netlify.com](https://app.netlify.com) and sign in (free tier is fully sufficient).
2. **Create New Site:**
   - Click **"Add new site"** ➔ **"Deploy manually"** (or create an empty site without linking a Git repository yet, since GitHub Actions handles our build and push).
   - Set the site name to `yoto-tools` (or your chosen name), which establishes the canonical domain:
     `https://yoto-tools.netlify.app`
3. **Retrieve the Netlify Site ID (`NETLIFY_SITE_ID`):**
   - In the Netlify dashboard, navigate to:
     **Site configuration** ➔ **General** ➔ **Site details** ➔ **Site information**.
   - Copy the **API ID** (a UUID such as `12345678-abcd-ef01-2345-6789abcdef01`).
4. **Generate a Netlify Personal Access Token (`NETLIFY_AUTH_TOKEN`):**
   - Click your profile avatar (top right) ➔ **User settings**.
   - Navigate to **Applications** ➔ **Personal access tokens**.
   - Click **"New access token"**, name it `yoto-tools-github-actions`, set expiration (e.g. 1 year or 180 days), and click **Generate token**.
   - Copy and save this token securely (you will not be able to view it again).

---

## 3. Step 2: Google Analytics 4 Setup (GA4 Web Stream)

Per [RFC 015](015-privacy-first-telemetry-and-analytics.md), we collect cookieless, privacy-anonymized page views and operational metrics. We do **not** need an API secret or server container.

### Actions Required:
1. **Create GA4 Property:**
   - Go to [https://analytics.google.com](https://analytics.google.com).
   - In Admin (`⚙️`), create an Account / Property named `yoto-tools` (Reporting timezone and currency of your choice).
2. **Create Web Data Stream:**
   - In Admin ➔ **Data collection and modification** ➔ **Data streams** ➔ Click **"Add stream"** ➔ **"Web"**.
   - **Website URL:** `https://yoto-tools.netlify.app`
   - **Stream name:** `yoto-tools Production SPA`
   - Click **Create stream**.
3. **Copy the Measurement ID (`VITE_GA_MEASUREMENT_ID`):**
   - Copy the **Measurement ID** (format: `G-XXXXXXXXXX`).
4. **Adjust Data Retention & IP Settings (Privacy Best Practice):**
   - In Admin ➔ **Data settings** ➔ **Data retention**: Set event data retention to **2 months** (recommended for data minimization).
   - In Data streams ➔ Click your web stream ➔ **Configure tag settings** ➔ Ensure Google Signals and ad personalization features are turned **OFF**.

---

## 4. Step 3: Dedicated Yoto Test Account Setup (Playwright E2E)

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

---

## 5. Step 4: GitHub Repository Configuration

Now configure the GitHub repository (`anitschke/yoto-tools`) with the required Environments, Secrets, and Variables.

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

Add the following Repository Secrets (or configure them inside the environments):

| Secret Name | Value to Paste | Source |
|---|---|---|
| `NETLIFY_AUTH_TOKEN` | Your Netlify Personal Access Token | From Step 1.4 |
| `NETLIFY_SITE_ID` | Your Netlify Site API ID (UUID) | From Step 1.3 |
| `YOTO_TEST_ACCOUNT_EMAIL` | Dedicated Yoto test email | From Step 3.1 |
| `YOTO_TEST_ACCOUNT_PASSWORD` | Dedicated Yoto test password | From Step 3.1 |

---

### C. Add GitHub Repository Variables
In the same section, switch to the **Variables** tab (**Settings** ➔ **Secrets and variables** ➔ **Actions** ➔ **Variables**):

Add the following non-confidential build variables:

| Variable Name | Value to Paste | Description |
|---|---|---|
| `VITE_GA_MEASUREMENT_ID` | `G-XXXXXXXXXX` | Your GA4 Measurement ID from Step 2.3 |
| `VITE_YOTO_CLIENT_ID` | `yoto-tools-production-client-id` *(or registered Auth0 Client ID)* | Public OAuth Client ID (can be placeholder initially) |

---

### D. Enable GitHub Secret Scanning & Push Protection
Navigate to: **Settings** ➔ **Code security and analysis**:
- Ensure **Secret scanning** is enabled.
- Ensure **Push protection** is enabled (prevents accidental commits of private tokens or credentials).

---

## 6. Pre-Implementation Verification Checklist

Before giving the agent the green light to start implementing code (`package.json`, Vite configuration, and Lit elements), verify this checklist is complete:

- [ ] Netlify site `yoto-tools` created and canonical URL established (`https://yoto-tools.netlify.app`).
- [ ] `NETLIFY_AUTH_TOKEN` and `NETLIFY_SITE_ID` generated.
- [ ] Google Analytics 4 property created and `G-XXXXXXXXXX` Measurement ID copied.
- [ ] Dedicated test Yoto account created and verified (`YOTO_TEST_ACCOUNT_EMAIL`).
- [ ] GitHub Environment `staging-preview` created with maintainer review requirement.
- [ ] GitHub Environment `production` created restricted to `main`.
- [ ] GitHub Secrets configured (`NETLIFY_AUTH_TOKEN`, `NETLIFY_SITE_ID`, `YOTO_TEST_ACCOUNT_EMAIL`, `YOTO_TEST_ACCOUNT_PASSWORD`).
- [ ] GitHub Variables configured (`VITE_GA_MEASUREMENT_ID`, `VITE_YOTO_CLIENT_ID`).
- [ ] Secret scanning and push protection enabled on GitHub repository.

---

Once these steps are completed, the automated CI/CD pipeline and E2E testing framework have everything required to build, test, and deploy every upcoming pull request cleanly.
