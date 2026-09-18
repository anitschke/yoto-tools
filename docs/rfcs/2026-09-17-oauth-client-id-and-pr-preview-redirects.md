# RFC: OAuth Client Registration & Ephemeral PR Preview Redirect Strategy

- **Date:** 2026-09-17
- **Status:** Accepted
- **Author:** Antigravity Agent & Andrew Nitschke

---

## 1. Summary

This proposal defines how OAuth 2.0 authentication is configured across environments in `yoto-tools`. Specifically, it solves the challenge of dynamic, ephemeral Pull Request deploy preview URLs (e.g. `https://deploy-preview-12--yoto-tools.netlify.app/callback`) when registering allowed redirect URIs with Yoto's Auth0 identity service.

---

## 2. The PR Preview Redirect Challenge

Yoto's developer dashboard requires explicit whitelisting of exact callback URLs:
- **Production Callback URL:** `https://yoto-tools.netlify.app/callback`
- **Localhost Callback URL:** `http://localhost:5173/callback`
- **Dynamic PR Previews:** Netlify generates unique, ephemeral subdomains for every PR (e.g. `https://deploy-preview-42--yoto-tools.netlify.app`). Yoto's developer portal does not allow wildcard redirect URIs (`https://deploy-preview-*...`).

---

## 3. The Relay Redirect Solution: Canonical Callback Forwarding

To support fully functional OAuth login on ephemeral PR deploy previews without registering hundreds of individual URLs in the Yoto developer portal:

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant PRPreview as PR Preview (deploy-preview-42)
    participant Auth0 as Yoto Auth0 (login.yotoplay.com)
    participant Canonical as Production Canonical (yoto-tools.netlify.app/callback)

    User->>PRPreview: Click "Log In" on PR Preview
    PRPreview->>PRPreview: Store verifier in localStorage
    PRPreview->>Auth0: Redirect to /authorize with:<br/>redirect_uri = https://yoto-tools.netlify.app/callback<br/>state = {csrf, returnTo: "https://deploy-preview-42..."}
    Auth0-->>User: Present Login & Consent
    Auth0-->>Canonical: Redirect to Canonical URL with ?code=...&state=...
    Canonical->>Canonical: Parse state.returnTo
    alt returnTo is a verified deploy-preview or localhost origin
        Canonical-->>PRPreview: Forward redirect: returnTo/callback?code=...&state=...
    else returnTo is production
        Canonical->>Canonical: Finish exchange on production
    end
    PRPreview->>Auth0: Exchange code + verifier for tokens
    PRPreview-->>User: Authenticated on PR preview!
```

### A. State Payload Structure
The OAuth `state` parameter is passed as a signed or base64url-encoded JSON object:
```json
{
  "csrf": "random-secure-token",
  "returnTo": "https://deploy-preview-42--yoto-tools.netlify.app/callback"
}
```

### B. Canonical Callback Relay Security
When `https://yoto-tools.netlify.app/callback` receives the redirect:
1. It inspects `state.returnTo`.
2. **Origin Whitelist Verification:** It strictly validates that `returnTo` matches either:
   - `^https:\/\/deploy-preview-[0-9]+--yoto-tools\.netlify\.app\/callback$`
   - `^http:\/\/localhost:[0-9]+\/callback$`
   - Or its own production domain.
3. If valid, the canonical page immediately bounces the browser to the target preview URL with the `code` and `state` parameters intact.
4. The PR preview receives the code, retrieves its local `code_verifier`, and performs the token exchange.

---

## 4. Client ID Configuration (Hybrid Model)

1. **Default Production Client ID:**
   - Bundled in repository configuration. Enables 1-click login for visitors on both production and PR previews without requiring manual registration.
2. **User-Overridable Client ID (BYO-App):**
   - A settings modal allows developers or advanced users to provide a custom Client ID, stored in `localStorage`.
   - If set, the app uses the custom Client ID and registers custom callback URLs directly.
