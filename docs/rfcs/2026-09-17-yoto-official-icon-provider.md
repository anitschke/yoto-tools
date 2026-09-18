# RFC: Official Yoto Icon Provider Integration

- **Date:** 2026-09-17
- **Status:** Accepted
- **Author:** Antigravity Agent & Andrew Nitschke

---

## 1. Summary

This proposal outlines the integration of official Yoto display icons directly into `yoto-tools`. By querying Yoto's public display icon library API at build time, we pre-index official Yoto artwork and serve it statically from our CDN with content-addressable cache busting, delivering instantaneous offline search without requiring real-time roundtrips to Yoto's servers.

---

## 2. Source API & Authentication

Yoto maintains a public collection of display icons accessible via their REST API:
- **Public Library Endpoint:** `GET /media/displayIcons/user/yoto` on `https://api.yotoplay.com`.
- **Authentication:** Standard Bearer token authentication (or public client token).
- **Data Model:**
  ```json
  {
    "displayIcons": [
      {
        "displayIconId": "yoto_star",
        "title": "Yellow Star",
        "tags": ["star", "space", "astronomy", "yellow", "night"],
        "mediaId": "media-hash-12345",
        "icon16x16": "https://api.yotoplay.com/media/displayIcons/..."
      }
    ]
  }
  ```

---

## 3. Pre-Indexing & Caching Strategy

Rather than having user browsers issue HTTP queries to `api.yotoplay.com` during icon searches:

1. **Build-Time Ingestion Script:**
   - An automated script (`npm run sync:icons:yoto`) fetches the latest official icons list from `/media/displayIcons/user/yoto`.
   - Downloads each 16×16 icon PNG asset and verifies its SHA-256 digest.
2. **Integration into the Universal Inverted Index:**
   - The icon titles and tags are normalized and injected into the shared inverted index defined in [RFC: Inverted Icon Indexing & Client-Side Search Engine](2026-09-17-inverted-icon-index-and-search.md).
   - Marked with `provider: "yoto"`.
3. **Static CDN Delivery:**
   - Image assets are stored as `/assets/icons/yoto/{displayIconId}.[hash].png` and served with immutable HTTP cache headers (`Cache-Control: public, max-age=31536000, immutable`).
4. **User Experience Advantage:**
   - Instant search results even on slow connections or offline.
   - Saves users from consuming Yoto API quotas during visual browsing.
   - Eliminates layout shifts and network lag when scrolling through the icon picker.
