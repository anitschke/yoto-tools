# RFC 021: Project Rebranding & Naming Strategy

- **Date:** 2026-10-15
- **Status:** Accepted
- **Author:** Antigravity Agent & Andrew Nitschke

---

## 1. Summary

The project was originally bootstrapped under the working name `yoto-tools` (`yoto-tools.netlify.app`, GitHub repo `anitschke/yoto-tools`). However, an active open-source community project already exists under the name [**`trywait/YotoTools`**](https://github.com/trywait/YotoTools). To avoid brand confusion, goodwill dilution, or stepping on prior community claims ("trademark" and mindshare), the project is officially rebranded as:

- **Repository, Codebase, & Package Name:** **`yoto-bench`**
- **Public & User-Facing Branding:** **`YotoBench`**
- **Component & Design Token Prefix:** **`yb-`**

This RFC documents the naming criteria, candidate evaluation, web clearance checks, SEO landscape analysis, and the step-by-step implementation plan for migrating the codebase, packages, URLs, and documentation.

---

## 2. Motivation & Problem Statement

1. **Brand & Namespace Collision:** Searching for "Yoto Tools" or "yoto-tools" surfaces `trywait/YotoTools`. Having two separate projects in the Yoto maker/hacker community with virtually identical names causes confusion for users seeking support, reporting bugs, or discovering features.
2. **Third-Party Ecosystem Etiquette:** While "Yoto" is a registered trademark of Yoto Limited, community projects typically use descriptive or compound names (e.g., `yotoicons`, `yoto-tools`). Adopting a unique name prevents inter-project friction within the community.
3. **Official Trademark Boundary:** Yoto Limited owns names like `Yoto`, `Yoto Player`, `Yoto Mini`, `Yoto Club`, `Yoto Space`, and has used names like `Yoto Labs` internally or for pilot initiatives. Our name should clarify that this is an independent, community-driven power-tool suite rather than an official Yoto Limited product.

---

## 3. Naming Criteria & Principles

A strong candidate should satisfy the following criteria:

- **Retains "Yoto" association:** Needs to be immediately recognizable to Yoto owners, parents, and community creators (contains `yoto` either as prefix, suffix, or portmanteau).
- **Short & Punchy:** Preferably 2 syllables or a concise compound word (e.g., `yoto-craft`, `yoto-kit`, `yoto-deck`).
- **Descriptive of Capability:** Reflects the app's identity as a client-side suite for MYO card authoring, track mastering, pixel icon curation, RSS podcast syndication, and device controls.
- **Available Namespace:** Clean or low-collision on GitHub, Netlify subdomains, and optionally npm / domain TLDs.
- **Distinct from Official Services:** Avoids collisions with official Yoto portals (`yoto.space`, `yotoplay.com`, `yoto-labs`).

---

## 4. Candidate Names & Analysis

Here are curated candidate names organized by theme, along with pros, cons, and domain/slug feasibility:

### Category A: The "Workbench / Maker / Utility" Names
*Highlighting creation, tinkering, crafting, and power-user utilities.*

1. **`yoto-craft` / `YotoCraft`**
   - **Vibe:** Creative, tactile, playful; mirrors crafting physical and digital MYO cards.
   - **Pros:** Very intuitive, rolls off the tongue, evokes the physical card-making experience.
   - **Cons:** Slight Minecraft association for younger kids, though distinct in this context.
   - **Subdomain:** `yotocraft.netlify.app` / `yoto-craft.netlify.app`.

2. **`yoto-kit` / `YotoKit`**
   - **Vibe:** Compact, modular toolkit; developer- and maker-friendly.
   - **Pros:** Ultra-short (7 letters), clean, professional, mirrors developer toolkits like `Webkit` or `HomeKit`.
   - **Cons:** "Kit" is sometimes associated with physical hardware boxes.
   - **Subdomain:** `yotokit.netlify.app`.

3. **`yoto-forge` / `YotoForge`**
   - **Vibe:** Heavy-duty creation, building, mastering cards and audio feeds.
   - **Pros:** Strong power-user connotation; sounds robust and capable.
   - **Cons:** Slightly heavier / more industrial tone than the typical cozy Yoto aesthetic.
   - **Subdomain:** `yotoforge.netlify.app`.

4. **`yoto-deck` / `YotoDeck`**
   - **Vibe:** Direct reference to cards ("deck of cards") as well as an audio/DJ tape deck or control deck.
   - **Pros:** Clever double meaning—both a deck of cards and a playback/control deck. Very relevant to Yoto's physical card format.
   - **Cons:** Could be mistaken for a physical hardware accessory (like a Steam Deck or Elgato Stream Deck).
   - **Subdomain:** `yotodeck.netlify.app`.

5. **`yoto-bench` / `YotoBench`**
   - **Vibe:** The maker's workbench for tinkering with cards, audio, and pixel art.
   - **Pros:** Humble, functional, friendly open-source tone.
   - **Cons:** Less playful.
   - **Subdomain:** `yotobench.netlify.app`.

---

### Category B: The "Card / Studio / Hub" Names
*Focusing on the creative studio aspect (audio editing, pixel art, playlists).*

6. **`yoto-studio` / `YotoStudio`**
   - **Vibe:** Complete creative suite for audio, icons, and card production.
   - **Pros:** Broad and comprehensive; encompasses cards, audio tags, icons, and player telemetry.
   - **Cons:** Might sound official or commercial; potentially checked or reserved by Yoto.
   - **Subdomain:** `yotostudio.netlify.app`.

7. **`card-smith` (or `yoto-cardsmith` / `YotoCardSmith`)**
   - **Vibe:** Master craftsman hand-forging custom cards.
   - **Pros:** Evocative, memorable, centers on the card creation workflow.
   - **Cons:** Longer if prefixed with `yoto-`; without `yoto-` it loses instant Yoto brand association.
   - **Subdomain:** `yotocardsmith.netlify.app`.

8. **`yoto-hub` / `YotoHub`**
   - **Vibe:** Central station connecting cards, icons, podcasts, and devices.
   - **Pros:** Short, clear, community-centric.
   - **Cons:** Generic; might have collisions on GitHub.
   - **Subdomain:** `yotohub.netlify.app`.

---

### Category C: The "Pixel / Play / Companion" Names
*Reflecting the 16x16 pixel display, playful nature, and client-side device companion role.*

9. **`yoto-companion` / `YotoCompanion`**
   - **Vibe:** The unofficial power-user companion app to the official Yoto app.
   - **Pros:** Clearly communicates its purpose as an auxiliary companion tool; respectful of official boundaries.
   - **Cons:** Longer word (4 syllables).
   - **Subdomain:** `yotocompanion.netlify.app`.

10. **`yoto-station` / `YotoStation`**
    - **Vibe:** Audio station, broadcast station, docking hub.
    - **Pros:** Friendly, evocative of storytelling and radio/audio broadcasts.
    - **Cons:** Slightly longer.
    - **Subdomain:** `yotostation.netlify.app`.

11. **`yoto-works` / `YotoWorks`**
    - **Vibe:** Workshop / creative works.
    - **Pros:** Classic maker brand styling (like "Smallworks", "Metalworks"). Short and punchy.
    - **Cons:** Might sound slightly corporate.
    - **Subdomain:** `yotoworks.netlify.app`.

12. **`yoto-suite` / `YotoSuite`**
    - **Vibe:** All-in-one software suite.
    - **Pros:** Highlights that this isn't just one script, but a full app containing editor, icon search, podcast sync, and remote control.
    - **Cons:** A bit traditional/formal.
    - **Subdomain:** `yotosuite.netlify.app`.

13. **`pixel-yoto` / `PixelYoto`**
    - **Vibe:** Distinctive nod to the iconic 16x16 display and pixel art.
    - **Pros:** Fun, visual, stands out.
    - **Cons:** Suggests the app is *only* about pixel icons, neglecting the audio and playlist features.

14. **`yoto-maker` / `YotoMaker`**
    - **Vibe:** Specifically for the "Make Your Own" (MYO) community.
    - **Pros:** Directly resonates with the MYO card community.
    - **Cons:** Could be confused with Yoto's own MYO branding or physical card makers.

---

## 5. Web, Registry, & SEO Clearance Analysis for `yoto-bench` / `YotoBench`

A comprehensive clearance and SEO analysis was conducted across search engines and developer registries:

1. **Google Search & SEO Discoverability:**
   - **Virtually Zero Noise:** An exact-match search for `"yoto-bench"` or `"yotobench"` yields essentially zero competing results, software products, or commercial trademarks.
   - **Avoiding False Positives:** Unlike `yoto-kit` (which collides with municipal library loaner packages) or `yotohub` (which collides with existing community dashboards), `yoto-bench` / `YotoBench` is a distinct compound token.
   - **Search Authority:** The project will comfortably rank **#1 on Page 1** of search engines with minimal backlink overhead.
2. **GitHub (`github.com`):**
   - No active, archived, or collision repositories exist for `yoto-bench` or `yotobench`.
   - `github.com/anitschke/yoto-bench` is 100% available to create or rename to.
3. **npm Registry (`npmjs.com`):**
   - The package names `yoto-bench` and `yotobench` are unallocated and free to register.
4. **Netlify Subdomains:**
   - Both `yoto-bench.netlify.app` and `yotobench.netlify.app` return 404 and are available to provision.
5. **Semantic Scope ("Bench" / "Workbench"):**
   - Naturally fits **audio mastering & MYO card editing** (maker's workbench).
   - Naturally fits **device telemetry, finding players, battery monitoring, and diagnostics** (testbench / diagnostic bench).
   - Does not artificially pigeonhole the application into only cards or physical crafts.

---

## 6. Migration & Renaming Implementation Plan

With **`yoto-bench`** as the codebase/repo slug, **`YotoBench`** as the public user-facing brand, and **`yb-`** as the component/token prefix:

1. **Repository & Remotes:**
   - Rename GitHub repository (`anitschke/yoto-tools` $\rightarrow$ `anitschke/yoto-bench`). GitHub provides automatic HTTP redirects for repos, but git remotes, clone URLs, and CI secrets will be updated.
2. **Package & Manifests:**
   - Update `package.json` (`"name": "yoto-bench"`).
   - Update `package-lock.json`.
3. **Domain & Netlify Deployments:**
   - Provision `yoto-bench.netlify.app` (with optional redirect alias for `yotobench.netlify.app`).
   - Update Netlify OAuth callback redirects (per [RFC 007](docs/rfcs/007-oauth-client-id-and-pr-preview-redirects.md)).
4. **HTML Meta & Web App Manifest:**
   - Update title: `<title>YotoBench - Unofficial Yoto Power Tools</title>`.
   - Update OpenGraph tags and meta descriptions in `index.html`.
   - Update Web App Manifest (`manifest.json` / PWA configuration) with display name `"YotoBench"`.
5. **Widget & CSS Prefixes (`yt-` $\rightarrow$ `yb-`):**
   - Migrate custom element tags from `<yt-*>` to `<yb-*>` (e.g. `<yb-button>`, `<yb-pixel-icon>`, `<yb-dialog>`, `<yb-dropdown>`, `<yb-toast>`).
   - Rename widget files in `src/widgets/` (e.g. `src/widgets/yb-button.ts`, `src/widgets/yb-button.test.ts`).
   - Update CSS custom property tokens from `--yt-*` to `--yb-*` (e.g. `--yb-color-primary`, `--yb-radius-md`, `--yb-font-pixel`).
   - Update documentation in [`src/widgets/AGENTS.md`](file:///home/anitschk/sandbox/yoto-tools/src/widgets/AGENTS.md).
6. **Documentation & RFCs:**
   - Update references across `README.md`, `ARCHITECTURE.md`, `AGENTS.md`, and existing RFCs.

---

## 7. Accepted Decisions

1. **Codebase, Package, & Repository Slug:** **`yoto-bench`**
   - GitHub Repository: `github.com/anitschke/yoto-bench`
   - npm package name: `yoto-bench`
   - Netlify host: `yoto-bench.netlify.app`
2. **Public User-Facing Branding:** **`YotoBench`**
   - App headers, page titles, navigation bars, and documentation refer to the application as **`YotoBench`** (CamelCase/PascalCase).
3. **Component & Design Token Prefix:** **`yb-`**
   - Custom elements: `<yb-button>`, `<yb-pixel-icon>`, `<yb-dialog>`, `<yb-dropdown>`, `<yb-toast>`, etc.
   - Design tokens: `--yb-color-primary`, `--yb-radius-md`, `--yb-font-pixel`, etc.
4. **Execution Strategy:**
   - Execute the migration on a dedicated branch once infrastructure review on `anitschke/infrastructureImplementation` is completed.
