# RFC: Podcast RSS Importer & Card Synchronization Engine

- **Date:** 2026-09-17
- **Status:** Proposed
- **Author:** Antigravity Agent & Andrew Nitschke

---

## 1. Summary

This proposal outlines the design for importing podcast RSS feeds into Yoto playlists directly from the browser, applying filtering heuristics (episode count limits and short promo exclusions), and embedding synchronization metadata within Yoto card records so users can re-sync new episodes with a single click.

---

## 2. Motivation & Problem Statement

Listening to episodic audio (podcasts, serialized stories) on Yoto players via Make-Your-Own (MYO) cards is one of the most popular community use cases. However:
1. **Manual Ingestion is Tedious:** Manually downloading MP3s, renaming them, uploading them to Yoto, and assigning icons is labor-intensive.
2. **Promos and Filler Waste Space:** Many podcast feeds include 30-second trailers or promotional cross-posts for other shows that clutter a child's player.
3. **Card Re-Syncing Causes Duplication:** Without tracking what episodes have already been added, re-importing a feed either creates duplicate tracks or requires manual diffing.

---

## 3. Detailed Design

### A. Feed Fetching & CORS Strategy
Fetching arbitrary third-party RSS XML feeds in a client-side web application encounters browser Same-Origin Policy (CORS) blocks. The complete architectural solution, public CORS proxy integration, and multi-tier fallbacks are specified in:
- **[RFC 009: CORS Proxy Strategy for External RSS Podcast Feeds](009-cors-proxy-for-rss-feeds.md)**

In summary, the importer executes a 3-tier resolution sequence:
1. **Direct Fetch:** Attempt direct browser `fetch(feedUrl)`.
2. **Public CORS Proxy:** Route via `https://corsproxy.io/?url=${encodeURIComponent(feedUrl)}`.
3. **Interactive Fallbacks:** Allow raw XML text pasting or `.xml`/`.rss` file drag-and-drop.

### B. Feed Parsing Engine (`podparse`)
Once the raw RSS XML string is obtained, it is parsed client-side using **[`podparse`](https://www.npmjs.com/package/podparse)**:
- **Optimized for the Browser:** Built specifically around `@rgrove/parse-xml` without Node.js polyfills or heavy dependencies (`xml2js`), keeping the browser bundle compact and memory efficient.
- **Podcast-Specific Tag Normalization:** Automatically handles iTunes, Google Podcasts, and standard RSS namespaces:
  - `feed.title`, `feed.description`, `feed.image` (for potential card cover art).
  - `episodes[]`:
    - `title`, `description`, `pubDate`.
    - `enclosure.url`: Direct HTTPS URL to the MP3/M4A audio file.
    - `duration`: Automatically normalized from string formats (`HH:MM:SS` or integer seconds) into numeric seconds, enabling precise filtering.
    - `explicit`: Normalized boolean indicating explicit language or content.
    - `episode` & `season`: Numeric track numbering when available.

### C. Filtering Rules
When configuring an import, users can specify:
- **Episode Window:** Most recent $N$ episodes or oldest $N$ episodes.
- **Minimum Duration Filter:** Automatically drop episodes shorter than a threshold (default: 120 seconds) using `episode.duration` to filter out teaser trailers, promos, and sponsor announcements.
- **Explicit Content Filter:** Honor iTunes `<itunes:explicit>` / `episode.explicit` tags if present.

### D. Persistent Metadata in Card Descriptions
Yoto's API allows arbitrary textual descriptions on card records (`card.metadata.description` or internal passthrough fields). To enable persistent 1-click sync without an external database:
- We serialize a structured, delimited JSON block at the end of the card description (or inside a dedicated metadata property):
  ```json
  <!-- yoto-tools:sync
  {
    "version": 1,
    "sourceType": "podcast-rss",
    "feedUrl": "https://feeds.wgbh.org/2469/feed-rss.xml",
    "filter": {
      "limit": 10,
      "order": "newest",
      "minDurationSeconds": 120
    },
    "lastSynced": "2026-09-17T21:00:00Z"
  }
  -->
  ```
- When `yoto-tools` inspects a card, it detects this sync block and renders a **"Sync New Episodes"** button.

### E. Audio Hashing & Deduplication Workflow
- Before uploading any audio, calculate `SHA-256(audioBytes)` in the browser via `crypto.subtle.digest`.
- Call Yoto's deduplication endpoint `GET /media/transcode/audio/uploadUrl?sha256=...`.
- If Yoto reports the file is already transcoded, skip the upload and immediately link the existing `uploadId` to the card track.
