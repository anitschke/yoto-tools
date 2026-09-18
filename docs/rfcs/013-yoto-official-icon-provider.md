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

## 3. Provider Implementation & Synchronization Strategy

The Yoto official provider implements the universal `IconProvider` interface defined in [RFC 011: Inverted Icon Indexing & Client-Side Search Engine](011-inverted-icon-index-and-search.md):

```typescript
// tools/icons/yoto-official-provider.ts
import { IconProvider, IconsSyncResult, RawIconItem } from './types.js';

export interface YotoMetadata {
  knownIconIds: string[]; // List of all known displayIconId values
}

export class YotoOfficialProvider implements IconProvider<YotoMetadata> {
  readonly name = 'yoto';

  async fetchIcons(existingMetadata?: YotoMetadata): Promise<IconsSyncResult<YotoMetadata>> {
    // 1. Fetch JSON catalog from GET https://api.yotoplay.com/media/displayIcons/user/yoto
    // 2. Identify new icons: catalog.filter(i => !existingMetadata?.knownIconIds.includes(i.displayIconId))
    // 3. Download raw image assets ONLY for newly discovered icon records
    // 4. Return { icons: newRawIcons, metadata: { knownIconIds: allDiscoveredIds } }
  }
}
```

### Key Workflow Highlights:
1. **Incremental Sync via ID Tracking (`tools/icons/yoto-official-provider.json`):**
   - The provider persists an array of `knownIconIds`.
   - On subsequent runs, it fetches Yoto's lightweight catalog JSON (~50 KB), diffs against `knownIconIds`, and **only downloads images for newly added icons**.
   - If no new icons have been added by Yoto, zero images are downloaded and execution finishes immediately.
2. **Rebuilding from Scratch:**
   - When running `npm run rebuild:icons`, `tools/rebuild-icons.ts` passes `undefined` as the metadata, prompting the provider to re-fetch and re-download all official icons.
3. **Checked-In Git Assets:**
   - Downloaded icons are deduplicated and written to `public/assets/icons/[sha256].png`.
   - The files, `tools/icons/yoto-official-provider.json`, and `src/data/icons.json` are committed to the repository, keeping regular builds completely static and fast.
4. **Integration with Search Index:**
   - Preserves `displayIconId` and `mediaId` in the icon object so user selections can be linked directly to Yoto card tracks.
5. **User Experience Advantage:**
   - Zero roundtrips to Yoto's servers during icon search and selection.
   - Eliminates layout shifts and network lag in the icon picker.
