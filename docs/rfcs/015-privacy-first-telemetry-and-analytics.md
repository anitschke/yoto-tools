# RFC: Privacy-First Telemetry, Anonymization, & GDPR Transparency

- **Date:** 2026-09-17
- **Status:** Accepted
- **Author:** Antigravity Agent & Andrew Nitschke

---

## 1. Summary

This proposal outlines the privacy-first telemetry architecture for `yoto-tools`. Because the application serves parents, educators, and children interacting with Yoto players, data minimization, strict IP anonymization, and complete transparency are mandatory. This RFC specifies our no-cookie GA4 Measurement Protocol integration, our dedicated public privacy disclosure page (`/privacy`), opt-out mechanisms, and GDPR/ePrivacy compliance strategy.

---

## 2. GDPR & ePrivacy Compliance Strategy

### Does a "Cookie Banner" Apply if We Don't Use Cookies?
Under the EU **ePrivacy Directive** and **GDPR**:
- **Technology Agnostic:** The regulation applies to storing or accessing *any* non-essential data on a user's terminal device—whether via HTTP cookies, `localStorage`, `sessionStorage`, or tracking tokens.
- **Third-Party Transmission:** Sending data (even without cookies) to third-party US infrastructure like Google Analytics still touches personal data definitions (such as client IP during transport, even if masked downstream).

### Our Compliance Approach
To be fully compliant and respect our users without annoying, intrusive popups:
1. **Zero Tracking Cookies:** The site stores zero tracking or marketing cookies.
2. **First-Visit Lightweight Privacy Notice (Banner/Snack):** On first visit, a non-blocking footer banner informs the user:
   > *"We collect anonymous, privacy-friendly telemetry to see which icons and feeds are popular. No personal data or cookies are stored. [Learn more & Opt out](/privacy) or [Dismiss]."*
3. **Dedicated Privacy & Transparency Page (`/privacy`):** A dedicated route listing every single metric collected, why it is collected, and offering a one-click toggle to disable all telemetry.

---

## 3. The Dedicated Privacy & Telemetry Page (`/privacy`)

The application will host a permanent `/privacy` route accessible from the footer of every view.

### Page Contents:
1. **Full Transparency Table:** An exhaustive list of every event and parameter our code emits.
2. **What We NEVER Collect:**
   - Usernames, emails, passwords, and Yoto authentication tokens.
   - Exact audio filenames (e.g. personal voice recordings, child bedtime stories).
   - Yoto card IDs or player device serial numbers.
   - Precise IP addresses (IP masking is enforced).
3. **One-Click Opt-Out Toggle:**
   - A prominent switch: **"Enable Anonymous Analytics [ON / OFF]"**.
   - Toggling OFF stores `yoto_telemetry_disabled = "true"` in `localStorage` and immediately cancels all future telemetry dispatch.
   - The UI reflects the change with a confirmation toast: *"Analytics disabled. No further events will be sent."*

---

## 4. What We Track vs. What We Omit

| Event Category | What We Log | What We Omit (Strictly Redacted) |
| :--- | :--- | :--- |
| **Page Views** | Route path (`/`, `/cards`, `/import`, `/icons`, `/players`, `/privacy`), Page title | Query parameters containing private IDs, tokens, or hashes |
| **Icon Usage** | Icon ID (`noto:cat`, `yoto:star`), Search Query (`"bedtime"`) | User ID, Card ID, Playlist Name, Track Title |
| **Podcast RSS Import** | Feed Domain / Hostname (`feeds.wgbh.org`), Episode count ingested | Private tokens, subscriber URLs, specific personal feeds |
| **Custom File Uploads** | Batch track count (e.g. `12`), audio codec (`"mp3"`), duration total | Exact filenames, personal ID3 tags (artist, album, voice note names) |
| **Device Control** | Command action invoked (`play`, `pause`, `set_volume`) | Yoto Device ID, serial number, IP address |

---

## 5. Technical Implementation (Public GA4 Client Collection Endpoint)

Instead of injecting Google's heavy external `gtag.js` script tag (which executes arbitrary remote JavaScript, tracks users across domains, and gets blocked by ad-blockers):
- A minimal, transparent TypeScript service (`src/services/telemetry.ts`) transmits lightweight event pings directly via `fetch()` or `navigator.sendBeacon()` to Google's public client collection endpoint (`https://www.google-analytics.com/g/collect`).
- **No `api_secret` Required:** The client endpoint operates exclusively with the public Measurement ID (`G-XXXXXXXXXX`). This eliminates secret management in client code, avoids edge proxy rewrites in `netlify.toml`, and guarantees that no privileged tokens are exposed.

```typescript
// src/services/telemetry.ts

const MEASUREMENT_ID = 'G-XXXXXXXXXX'; // Public GA4 Measurement ID
const STORAGE_KEY_OPT_OUT = 'yoto_telemetry_disabled';

const PRODUCTION_HOSTNAME = 'yoto-tools.netlify.app';

export function isTelemetryDisabled(): boolean {
  // Automatically disable telemetry on localhost, PR previews, or staging to prevent data pollution
  if (window.location.hostname !== PRODUCTION_HOSTNAME) {
    return true;
  }
  return localStorage.getItem(STORAGE_KEY_OPT_OUT) === 'true';
}

export function setTelemetryDisabled(disabled: boolean): void {
  localStorage.setItem(STORAGE_KEY_OPT_OUT, String(disabled));
}

// Generates an ephemeral session UUID stored only in sessionStorage (zero cookies)
function getEphemeralSessionId(): string {
  let sid = sessionStorage.getItem('yoto_telemetry_sid');
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem('yoto_telemetry_sid', sid);
  }
  return sid;
}

export function trackEvent(name: string, params: Record<string, string | number | boolean> = {}): void {
  if (isTelemetryDisabled()) return;

  const queryParams = new URLSearchParams({
    v: '2',                               // GA4 protocol version
    tid: MEASUREMENT_ID,                  // Target Measurement ID
    cid: getEphemeralSessionId(),         // Ephemeral client session ID (no cookies)
    en: name,                             // Event name (e.g. 'page_view', 'icon_search')
    _p: String(Date.now()),               // Cache buster
  });

  // Attach sanitized custom parameters (prefixed with ep. for GA4 client hits)
  for (const [key, val] of Object.entries(params)) {
    queryParams.set(`ep.${key}`, String(val));
  }

  const endpoint = `https://www.google-analytics.com/g/collect?${queryParams.toString()}`;

  if (navigator.sendBeacon) {
    navigator.sendBeacon(endpoint);
  } else {
    fetch(endpoint, { method: 'POST', keepalive: true, mode: 'no-cors' }).catch(() => {
      // Fail silently without interrupting UI or throwing unhandled rejections
    });
  }
}

export function trackPageView(pagePath: string, pageTitle: string): void {
  trackEvent('page_view', {
    page_location: pagePath,
    page_title: pageTitle,
  });
}
```
