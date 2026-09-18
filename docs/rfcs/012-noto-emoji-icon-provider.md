# RFC: Google Noto Emoji Icon Provider Integration

- **Date:** 2026-09-17
- **Status:** Accepted
- **Author:** Antigravity Agent & Andrew Nitschke

---

## 1. Summary

This proposal outlines the integration of Google Noto Emoji assets as a built-in icon provider for `yoto-tools`. Noto Emoji provides thousands of high-quality, legally unencumbered (Apache 2.0) 16×16 icons across animals, food, activities, nature, and objects.

---

## 2. Motivation & Licensing Advantages

1. **Permissive Apache 2.0 License:** Unlike scraped web assets, Google Noto Emoji is formally licensed under Apache 2.0. It can be freely bundled, transformed, and distributed without trademark or copyright complications.
2. **Standardized Unicode Tagging:** Emojis are officially classified with rich Unicode CLDR (Common Locale Data Repository) keywords, synonyms, and categories (e.g., 🐱 = `cat`, `pet`, `feline`, `meow`).
3. **Proven Compatibility:** `yotocli` already embeds Noto Emoji assets using a custom Go code generator (`internal/tools/gennoto/`). We can port this pipeline directly into TypeScript.

---

## 3. Provider Implementation & Generation Workflow

The Noto Emoji provider implements the universal `IconProvider` interface defined in [RFC 011: Inverted Icon Indexing & Client-Side Search Engine](011-inverted-icon-index-and-search.md):

```typescript
// tools/icons/noto-emoji-provider.ts
import { IconProvider, IconsSyncResult, RawIconItem } from './types.js';

export interface NotoMetadata {
  notoCommitHash: string; // Latest googlefonts/noto-emoji commit hash
  cldrCommitHash: string; // Latest unicode-org/cldr commit hash
}

export class NotoEmojiProvider implements IconProvider<NotoMetadata> {
  readonly name = 'noto-emoji';

  async fetchIcons(existingMetadata?: NotoMetadata): Promise<IconsSyncResult<NotoMetadata>> {
    // 1. If running as a rebuild (existingMetadata is undefined):
    //    Perform full fetch/generation: sparse checkout SVG assets + CLDR tags,
    //    return all icons alongside the fresh { notoCommitHash, cldrCommitHash }.
    //
    // 2. If running during routine sync (existingMetadata is present):
    //    Query GitHub API for HEAD commit SHA of googlefonts/noto-emoji and unicode-org/cldr.
    //    If both match existingMetadata:
    //      Return { icons: [], metadata: existingMetadata } immediately.
    //    If a commit hash has changed:
    //      Emit a GitHub Actions warning annotation:
    //      console.log('::warning::Upstream Noto Emoji or CLDR update detected! Consider running "npm run rebuild:icons -- --provider=noto-emoji".');
    //      Return { icons: [], metadata: existingMetadata } to avoid unplanned large-scale file churn.
  }
}
```

### A. Dual Upstream Commit Hash Tracking (`tools/icons/noto-emoji-provider.json`)
- **Tracked Repositories:**
  1. `googlefonts/noto-emoji`: Vector SVGs and color emoji graphics.
  2. `unicode-org/cldr`: Official Unicode CLDR annotations, keywords, and localized metadata.
- **State File:** `tools/icons/noto-emoji-provider.json` stores:
  ```json
  {
    "notoCommitHash": "e8d4a9f...",
    "cldrCommitHash": "7c2b1a0..."
  }
  ```

### B. Upstream Change Detection & CI Warning Notification
- Because Unicode emoji releases happen only once or twice a year and regenerating them touches over 3,600 files, routine cron runs (`npm run sync:icons`) do not automatically churn git history.
- Instead, the provider queries the GitHub REST API for the latest commit hashes of both upstream repos.
- If a change is detected:
  - It outputs a GitHub Actions workflow annotation:
    ```
    ::warning file=tools/icons/noto-emoji-provider.ts::Upstream Noto Emoji or CLDR update detected. Run 'npm run rebuild:icons -- --provider=noto-emoji' to update.
    ```
  - Appends a notice to the GitHub Actions Job Summary (`$GITHUB_STEP_SUMMARY`) alerting maintainers.
  - Returns empty icons so automated runs remain fast, predictable, and noise-free.

### C. On-Demand Rebuild Workflow via Sparse Checkout
When the maintainer chooses to update Noto assets:
- Run:
  ```bash
  npm run rebuild:icons -- --provider=noto-emoji
  ```
- The provider uses a temporary shallow, sparse git clone (`git clone --depth 1 --filter=blob:none --sparse`) to pull only the required SVG/PNG directories and CLDR JSON annotations into a temporary folder.
- Images are automatically normalized to 16×16 PNG by the central RFC 011 engine, hashes are committed to `public/assets/icons/`, and the state file is updated with the new commit hashes.
