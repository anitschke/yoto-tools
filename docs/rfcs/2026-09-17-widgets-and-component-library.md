# RFC: Design System & Reusable Widget Component Library

- **Date:** 2026-09-17
- **Status:** Accepted
- **Author:** Antigravity Agent & Andrew Nitschke

---

## 1. Summary

This proposal outlines the design and architecture for a foundational, framework-agnostic component library (`src/widgets/`) built using [Lit](https://lit.dev/) custom elements. It defines the core primitives required across `yoto-tools`—including accessible native dialogs (leveraging HTML `<dialog>`), buttons, dropdown menus, text/search inputs, and visual pixel-grid displays—ensuring visual consistency, keyboard accessibility, and reusable encapsulation.

---

## 2. Motivation & Principles

As the application grows to encompass playlist editing, podcast importing, device control, and icon picking, duplicating raw HTML tags (`<button>`, `<select>`, `<input>`) and ad-hoc CSS styles leads to design drift, accessibility bugs, and code duplication.

### Guiding Principles
1. **HTML Standards First:** Favor native browser primitives where available (e.g. native `<dialog>` with `.showModal()`, native form association, and standard focus trapping) rather than reinvention.
2. **Encapsulated Shadow DOM & Design Tokens:** Use Lit's scoped Shadow DOM styling backed by a centralized set of CSS custom properties (colors, typography, radii, spacing, Yoto accent colors).
3. **No External Heavy UI Frameworks:** Keep bundle size minimal by authoring lightweight, purpose-built custom elements instead of pulling in monolithic design libraries.
4. **Strict Component Testing:** Every widget in `src/widgets/` must have automated unit/interaction tests powered by `@web/test-runner` and `@open-wc/testing`.

---

## 3. Core Widget Inventory (`src/widgets/`)

```
src/widgets/
├── yoto-button.ts          # Primary, secondary, danger, and icon button variants
├── yoto-dialog.ts          # Accessible modal dialog wrapper around native <dialog>
├── yoto-dropdown.ts        # Custom selectable dropdown menu with keyboard navigation
├── yoto-text-input.ts      # Text and search inputs with clear buttons and label slots
├── yoto-number-input.ts    # Numeric input with stepper buttons (e.g., episode limits)
├── yoto-badge.ts           # Status pill / badge (online, offline, battery, provider tag)
├── yoto-progress-bar.ts    # Progress indicator for audio uploads and transcode polling
├── yoto-pixel-preview.ts   # Scaled 16x16 pixel display for previewing Yoto icons
└── theme.css.ts            # Shared CSS variables / design tokens
```

---

## 4. Detailed Component Specifications

### A. Modal Dialog (`<yoto-dialog>`)
Implements modal workflows (confirmations, icon picker modals, import settings) using the browser's native `<dialog>` element:
- **Native Modality:** Calls `dialogEl.showModal()` for built-in backdrop dimming, top-layer elevation, and native focus trapping.
- **Escape & Backdrop Handling:** Automatically listens for the native `cancel` event on the `<dialog>` and detects clicks outside the dialog bounds to dismiss.
- **Slots:**
  - `header`: Title and optional close button.
  - `default`: Body content.
  - `footer`: Action buttons (`<yoto-button>`).
- **Usage Example:**
  ```html
  <yoto-dialog id="confirmModal" heading="Delete Track">
    <p>Are you sure you want to remove "Chapter 1"?</p>
    <div slot="footer">
      <yoto-button variant="subtle" @click=${this.close}>Cancel</yoto-button>
      <yoto-button variant="danger" @click=${this.onDelete}>Delete</yoto-button>
    </div>
  </yoto-dialog>
  ```

### B. Action Button (`<yoto-button>`)
Standardized interactive button element:
- **Variants:** `primary` (Yoto orange accent), `secondary`, `subtle` / `ghost`, `danger`.
- **Sizes:** `small`, `medium` (default), `large`.
- **States:** `loading` (shows accessible spinner and disables pointer events), `disabled`.
- **Icon Support:** Slots for leading and trailing icons.

### C. Dropdown Menu (`<yoto-dropdown>`)
Accessible selection menu for filters, playlist selectors, and sort orders:
- Supports rich options (icons, subtitles, custom badges).
- Full WAI-ARIA `combobox` / `listbox` keyboard navigation (`ArrowUp`, `ArrowDown`, `Enter`, `Escape`).

### D. 16×16 Pixel Display (`<yoto-pixel-preview>`)
Specialized widget reflecting the Yoto player's physical 16×16 display matrix:
- Takes an icon URL or 16×16 pixel color array.
- Renders pixelated scaling (`image-rendering: pixelated`) on an authentic retro dark background with subtle rounded LED grid styling.

---

## 5. Design Tokens (`src/widgets/theme.css.ts`)

Widgets inherit centralized CSS custom properties that maintain Yoto's playful, clean design language:

```css
:root {
  /* Brand Accents */
  --yoto-color-primary: #ff5c35;      /* Yoto orange */
  --yoto-color-primary-hover: #e04b25;
  --yoto-color-surface: #ffffff;
  --yoto-color-surface-subtle: #f8f9fa;
  --yoto-color-border: #e2e8f0;
  --yoto-color-text: #1a202c;
  --yoto-color-text-muted: #718096;

  /* Typography & Radii */
  --yoto-font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --yoto-radius-sm: 6px;
  --yoto-radius-md: 10px;
  --yoto-radius-lg: 16px;

  /* Shadows */
  --yoto-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --yoto-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --yoto-shadow-modal: 0 20px 25px -5px rgba(0, 0, 0, 0.15);
}
```

---

## 6. Testing Requirements

To satisfy our core quality guidelines in `AGENTS.md`:
1. Every component under `src/widgets/` must have a corresponding `.test.ts` file run via `@web/test-runner`.
2. Tests must verify:
   - DOM rendering and slot projection.
   - Event firing (custom events emitted on user interactions).
   - Keyboard accessibility (e.g. `Escape` key closes dialogs, `Enter` activates buttons).
   - Accessibility compliance via `axe-core` assertions (`await expect(el).to.be.accessible()`).
