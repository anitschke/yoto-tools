# RFC: CORS Proxy Strategy for External RSS Podcast Feeds

- **Date:** 2026-09-17
- **Status:** Accepted
- **Author:** Antigravity Agent & Andrew Nitschke

---

## 1. Summary

This proposal addresses the browser Same-Origin Policy (CORS) restrictions encountered when importing third-party podcast RSS XML feeds from arbitrary internet hosts. It defines the technical problem, why media files work while XML files fail, and establishes a multi-tiered proxy and fallback strategy that maintains zero backend infrastructure.

---

## 2. The Problem: The Asymmetric CORS Barrier

When a client-side web application attempts to ingest a podcast:

1. **Audio Enclosure Files (MP3/M4A) $\rightarrow$ Allow CORS:**
   - Podcast media hosts (e.g. PRX, Podtrac, Megaphone, Libsyn, CloudFront) almost universally emit `Access-Control-Allow-Origin: *` to enable web streaming in browsers and embedded players.
   - The browser can directly `fetch()` the audio binary as an `ArrayBuffer`, compute its SHA-256 hash using Web Crypto, and PUT it directly to Yoto's S3 upload endpoint.
2. **RSS Feed XML Endpoints $\rightarrow$ Blocked by CORS:**
   - RSS feed publishers (e.g., `feeds.wgbh.org`, NPR, Substack, custom WordPress sites) typically host XML files as static assets on S3, Apache, or Nginx **without** CORS headers.
   - Any direct browser request (`fetch("https://feeds.wgbh.org/2469/feed-rss.xml")`) fails immediately due to browser security checks:
     ```
     Access to fetch at 'https://feeds.wgbh.org/...' from origin 'https://yoto-tools.netlify.app'
     has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present.
     ```

---

## 3. Proxy Architecture & Tiered Resolution Strategy

To provide a seamless user experience while adhering to our zero-server-maintenance principle, the application implements a multi-tiered resolution pipeline:

```mermaid
flowchart TD
    Start["User inputs Podcast RSS Feed URL"] --> AttemptDirect["Step 1: Attempt Direct fetch()"]
    
    AttemptDirect -->|CORS Headers Present| ParseXML["Parse XML via DOMParser"]
    
    AttemptDirect -->|CORS Failure / NetworkError| AttemptCorsProxy["Step 2: Fetch via https://corsproxy.io/?url=..."]
    
    AttemptCorsProxy -->|Success| ParseXML
    AttemptCorsProxy -->|Proxy Failed / Unavailable| PromptFallback["Step 3: User Manual Fallback Modal"]
    
    PromptFallback --> OptionPaste["Option A: Paste raw RSS XML text"]
    PromptFallback --> OptionFile["Option B: Drop downloaded .xml/.rss file"]
    PromptFallback --> OptionProxy["Option C: User-provided custom CORS proxy URL"]

    OptionPaste --> ParseXML
    OptionFile --> ParseXML
    OptionProxy --> AttemptDirect
```

---

## 4. Implementation Details

### Tier 1: Direct Browser Fetch
Some modern podcast platforms (e.g., Spotify for Podcasters, Transistor) return `Access-Control-Allow-Origin: *`. The client always attempts a direct `fetch()` first:
```typescript
try {
  const resp = await fetch(feedUrl, { signal: AbortSignal.timeout(4000) });
  if (resp.ok) return await resp.text();
} catch (err) {
  // CORS failure or timeout; proceed to Tier 2
}
```

### Tier 2: Free Public CORS Proxy (`https://corsproxy.io/`)
For feeds blocked by CORS, requests are relayed directly through the free, high-availability [corsproxy.io](https://corsproxy.io/) service by prefixing the target URL:
```typescript
const proxyUrl = `https://corsproxy.io/?url=${encodeURIComponent(feedUrl)}`;
const resp = await fetch(proxyUrl, { signal: AbortSignal.timeout(8000) });
if (!resp.ok) throw new Error(`Proxy fetch failed: ${resp.status}`);
const xmlText = await resp.text();
```
- **Zero Configuration & Zero Maintenance:** Eliminates the need to configure, deploy, or maintain custom edge workers or Netlify redirect rewrite proxies.
- **Lightweight XML Payloads:** Because podcast RSS XML files are tiny text documents (30–80 KB), requests execute in milliseconds and remain well within fair-use limits.
- **CSP Integration:** `https://corsproxy.io` is whitelisted in our Content Security Policy `connect-src` directive ([RFC 016](016-content-security-policy-and-sri.md)).

### Tier 3: Zero-Infrastructure Interactive Fallbacks
If both direct fetch and `corsproxy.io` are unreachable or throttled:
1. **Raw XML Paste:** The user can open the feed URL in their browser tab, copy the raw XML, and paste it into a textarea.
2. **File Drop:** The user can save/download the `.xml` / `.rss` file and drop it into the application, parsed instantly via the browser `FileReader` API.
3. **Custom Proxy URL (BYOK):** Advanced users can configure their own proxy URL in application settings.

---

## 5. Security & Privacy Guardrails

1. **Read-Only Text Transit:** The proxy is strictly used to fetch public RSS XML. No user credentials, authentication tokens, or private metadata are ever sent through the proxy.
2. **Strict MIME / Size Limits:** The proxy endpoint only accepts `GET` requests and rejects responses larger than 5 MB to prevent misuse.
3. **Audio Bypass:** Audio downloads **never** transit through the proxy; only the XML feed does. All multi-megabyte audio tracks stream directly from podcast CDNs to the browser and directly to Yoto S3.
