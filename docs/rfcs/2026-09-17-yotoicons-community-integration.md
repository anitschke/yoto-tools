# RFC: Community Icon Provider Integration (yotoicons.com)

> [!CAUTION]
> **DO NOT IMPLEMENT UNTIL FORMAL BUY-IN IS RECEIVED FROM THE MAINTAINER.**
> 
> Scraping, mirroring, or republishing assets from `yotoicons.com` without explicit consent from its creator/maintainer risks straining their community infrastructure and creating friction. Implementation of this RFC is strictly on hold until explicit written permission or an approved export mechanism is established with the maintainer (`yotoicons@gmail.com`). Until then, `yoto-tools` must rely exclusively on official Yoto public icons and Apache 2.0-licensed Google Noto Emoji.

- **Date:** 2026-09-17
- **Status:** Proposed (Blocked on Maintainer Approval)
- **Author:** Antigravity Agent & Andrew Nitschke

---

## 1. Summary

This proposal details the architectural design for integrating community pixel art from [yotoicons.com](https://yotoicons.com) into `yoto-tools`. It defines how icons and metadata would be imported, incrementally synced with minimal server load, merged into the client-side search index, and cached.

---

## 2. Motivation & Community Context

`yotoicons.com` is a beloved community project created by parents and kids to share 16×16 pixel art icons for Make-Your-Own Yoto cards. Integrating these icons into `yoto-tools` would provide users with a massive selection of creative artwork directly within the browser icon picker.

Because the service is funded through donations (Ko-fi) and operated as a personal passion project:
1. We must respect their server resources and bandwidth.
2. We must not put recurring real-time load on their web server from client browsers.
3. All data must be imported in bulk during build time or via a lightweight incremental job, never through client-side runtime queries.

---

## 3. Data Ingestion Architecture

### A. One-Time Baseline Ingestion
If authorized by the maintainer, an offline synchronization script will crawl the paginated catalog:
- **Index URL:** `https://yotoicons.com/icons?page={N}` (~25,000 icons, 25 per page, ~1,000 pages).
- **Metadata Extraction:** Each icon's `onclick` attributes contain complete metadata:
  - `id`: Internal icon identifier (e.g. `12583`).
  - `category`: Category classification (e.g. `animals`).
  - `title`: Primary name (e.g. `Grannies Bingo`).
  - `description`: Supplemental tags / keywords (e.g. `Bluey Book Reads`).
  - `artist`: Username of the creator (e.g. `curiouscat`).
  - `downloads`: Community popularity metric.
- **Image Assets:** Images are retrieved from `/static/uploads/{id}.png` and stored locally. Total size for all 25,000 16×16 PNG icons is only ~8–12 MB.

### B. Minimal Incremental Sync Strategy
To keep the index up to date without repeatedly crawling the entire site:
1. The catalog provides a sort-by-newest view: `https://yotoicons.com/icons?sort=new&page=1`.
2. A scheduled build task (e.g. monthly GitHub Actions cron) checks page 1.
3. The scraper compares IDs against our local index.
4. **Early Termination:** The moment an ID is encountered that is $\le$ the highest known ID in our local database, the sync stops immediately.
5. **Server Impact:** Under normal conditions, checking for updates requires only **1 to 2 HTTP requests** (a few kilobytes of HTML) and downloading only newly created icons.

---

## 4. Index Merging & Client-Side Delivery

- **Unified Inverted Index:** The extracted icons and tags will be merged alongside Google Noto Emoji and official Yoto icons into the consolidated `icons.[hash].json` bundle.
- **Provider Attribution & Filtering:**
  - Icons will retain creator credit (`artist`) and provider tags (`provider: "yotoicons.com"`).
  - The UI icon picker will include a provider filter toggle, allowing users to search specifically within Yoto official, Noto Emoji, or community icons.
- **Content-Addressable Asset Serving:**
  - Downloaded icons will be fingerprinted and served from `/assets/icons/community/{id}.[hash].png` under immutable caching rules as defined in the Asset Bundling RFC.

---

## 5. Next Steps to Unblock Implementation

1. Send an introductory email to `yotoicons@gmail.com` detailing the non-commercial, open-source nature of `yoto-tools`.
2. Propose the incremental sync strategy or ask if an API / SQLite / JSON dump is preferred.
3. Only proceed with implementation if explicit approval is granted.
