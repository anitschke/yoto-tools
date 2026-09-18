# RFC: Design System & Reusable Widget Component Library

- **Date:** 2026-09-17
- **Status:** Accepted
- **Author:** Antigravity Agent & Andrew Nitschke

---

## 1. Summary

This proposal outlines the design and architecture for a foundational, framework-agnostic component library (`src/widgets/`) built using [Lit](https://lit.dev/) custom elements. All custom elements are prefixed with **`yt-`** (short for `yoto-tools`), and all CSS custom properties are prefixed with **`--yt-`**.

It defines the core primitives required across the application—including accessible native dialogs (leveraging HTML `<dialog>`), action buttons, dropdown menus, text/search inputs, toast notifications, and standardized pixel icon display elements (`<yt-pixel-icon>`).

---

## 2. Motivation & Principles

As the application grows to encompass playlist editing, podcast importing, device control, and icon picking, duplicating raw HTML tags (`<button>`, `<select>`, `<input>`) and ad-hoc CSS styles leads to design drift, accessibility bugs, and code duplication.

### Guiding Principles
1. **HTML Standards First:** Favor native browser primitives where available (e.g. native `<dialog>` with `.showModal()`, native form association, and standard focus trapping) rather than reinvention.
2. **Encapsulated Shadow DOM & Design Tokens:** Use Lit's scoped Shadow DOM styling backed by centralized CSS custom properties prefixed with `--yt-` (colors, typography, radii, spacing, Yoto accent colors).
3. **Prefixing Standard:** All custom elements are prefixed with `yt-` (e.g., `<yt-button>`, `<yt-dialog>`, `<yt-pixel-icon>`).
4. **No External Heavy UI Frameworks:** Keep bundle size minimal by authoring lightweight, purpose-built custom elements instead of pulling in monolithic design libraries.
5. **Strict Component Testing:** Every widget in `src/widgets/` must have automated unit/interaction tests powered by `@web/test-runner` and `@open-wc/testing`.

---

## 3. Core Widget Inventory (`src/widgets/`)

```
src/widgets/
├── AGENTS.md             # Guidelines for widget contributors & catalog of all available widgets
├── yt-button.ts          # Primary, secondary, danger, and icon button variants
├── yt-dialog.ts          # Accessible modal dialog wrapper around native <dialog>
├── yt-dropdown.ts        # Custom selectable dropdown menu with keyboard navigation
├── yt-text-input.ts      # Text and search inputs with clear buttons and label slots
├── yt-number-input.ts    # Numeric input with stepper buttons (e.g., episode limits)
├── yt-badge.ts           # Status pill / badge (online, offline, battery, provider tag)
├── yt-progress-bar.ts    # Progress indicator for audio uploads and transcode polling
├── yt-pixel-icon.ts      # Standardized 16x16 pixel icon display element (<img> based)
├── yt-toast.ts           # Toast notification view component
├── yt-toast-manager.ts   # Top-level notification queue listener & renderer
└── theme.css.ts          # Shared CSS variables / design tokens (--yt-*)
```

### Component Guidelines & Local `src/widgets/AGENTS.md`
To ensure that autonomous agents and human developers discover existing primitives and maintain design consistency, the `src/widgets/` directory contains its own dedicated [`src/widgets/AGENTS.md`](file:///home/anitschk/sandbox/yoto-tools/src/widgets/AGENTS.md). 
- It points directly back to this RFC ([`docs/rfcs/005-widgets-and-component-library.md`](file:///home/anitschk/sandbox/yoto-tools/docs/rfcs/005-widgets-and-component-library.md)).
- It provides a concise, 3–5 sentence description for each widget in the library, detailing its primary purpose, supported variants or states, key accessibility behaviors, and canonical usage expectations.
- Whenever a new widget is added or modified in `src/widgets/`, its entry in `src/widgets/AGENTS.md` must be updated in tandem.

---

## 4. Detailed Component Specifications & Catalog

Every widget in `src/widgets/` must adhere to these specifications. In addition, `src/widgets/AGENTS.md` maintains a dedicated catalog summarizing each widget in 3–5 sentences for agents and contributors.

### A. Modal Dialog (`<yt-dialog>`)
The `<yt-dialog>` element wraps the browser's native `<dialog>` element to provide accessible modal experiences for confirmations, icon selection, and settings. It invokes `dialogEl.showModal()` internally to ensure built-in top-layer elevation, background backdrop dimming, and native keyboard focus trapping. The component automatically listens for the native `cancel` event when `Escape` is pressed and dismisses when the backdrop is clicked. It exposes named slots for `header`, `default` (body content), and `footer` action buttons.
- **Slots:**
  - `header`: Title and optional close button.
  - `default`: Body content.
  - `footer`: Action buttons (`<yt-button>`).
- **Usage Example:**
  ```html
  <yt-dialog id="confirmModal" heading="Delete Track">
    <p>Are you sure you want to remove "Chapter 1"?</p>
    <div slot="footer">
      <yt-button variant="subtle" @click=${this.close}>Cancel</yt-button>
      <yt-button variant="danger" @click=${this.onDelete}>Delete</yt-button>
    </div>
  </yt-dialog>
  ```

### B. Action Button (`<yt-button>`)
The `<yt-button>` element is the standard interactive button primitive used across all views and modals. It supports visual variants including `primary` (Yoto orange accent), `secondary`, `subtle` (ghost), and `danger` across `small`, `medium` (default), and `large` sizes. When its `loading` boolean property is active, it renders an accessible spinning indicator and disables pointer interactions to prevent duplicate submissions. It also provides dedicated slots for leading and trailing icons while forwarding standard keyboard activation and click events.

### C. Dropdown Menu (`<yt-dropdown>`)
The `<yt-dropdown>` element provides an accessible select and combobox dropdown menu for filters, playlist selectors, and sorting options. It handles rich menu options containing custom icons, descriptive subtitles, and badges. Full keyboard navigation is implemented according to WAI-ARIA combobox guidelines, allowing users to traverse options with `ArrowUp` and `ArrowDown` and select with `Enter`. When closed, it collapses cleanly and traps interaction events appropriately to avoid unwanted side effects.

### D. Text Input (`<yt-text-input>`)
The `<yt-text-input>` component encapsulates single-line text and search input fields with standardized styling and integrated labeling. It provides built-in support for clear buttons, prefix/suffix icons, error validation messages, and debounce timers on input events. The element properly links associated label and description elements with `aria-describedby` and `aria-invalid` attributes for screen reader accessibility. It ensures consistent border focus rings, placeholder styling, and disabled states across all forms.

### E. Number Input (`<yt-number-input>`)
The `<yt-number-input>` component manages numerical value entry, such as podcast episode download limits, chapter track numbers, and playback durations. It features integrated decrement and increment stepper buttons alongside standard keyboard `ArrowUp` / `ArrowDown` stepping. The component enforces minimum, maximum, and step constraints, automatically clamping entered values on blur or change. It prevents non-numeric input and integrates with form validation states.

### F. Status Badge (`<yt-badge>`)
The `<yt-badge>` component renders compact status pills, category chips, and provider metadata tags across the interface. It supports semantic color variants including `success` (e.g. online player), `warning` (e.g. battery low), `danger` (e.g. sync error), and `neutral` (e.g. icon count or source tag). The badge accepts plain text, numeric counters, or compact leading micro-icons. It is engineered with crisp typography and padding optimized for dense lists and card headers.

### G. Progress Bar (`<yt-progress-bar>`)
The `<yt-progress-bar>` element visualizes multi-step progress, such as audio file unpacking, hashing, and parallel uploads to Yoto's S3 storage. It supports both determinate modes (displaying a numeric 0–100% fill bar with optional label) and indeterminate pulsing animations for pending backend operations. The component conforms to the WAI-ARIA `progressbar` role by publishing `aria-valuenow`, `aria-valuemin`, and `aria-valuemax` attributes. Its accent color defaults to Yoto orange, transitioning smoothly during active uploads.

### H. Pixel Icon Display (`<yt-pixel-icon>`)
The `<yt-pixel-icon>` element standardizes the presentation of Yoto 16×16 pixel icons throughout the application. It embeds a native `<img>` with `image-rendering: pixelated` to preserve crisp, sharp pixel boundaries without blurry interpolation or artificial rounded LED effects. It exposes standard sizing presets (`sm` 24px, `md` 32px, `lg` 48px/64px) set against a dark, high-contrast canvas (`--yt-color-surface-dark`). It also manages image load failures by displaying an accessible fallback placeholder.
- **Usage Example:**
  ```html
  <yt-pixel-icon src="/assets/icons/noto/u1f431.png" alt="Cat Face" size="md"></yt-pixel-icon>
  ```

### I. Toast Notification View (`<yt-toast>`)
The `<yt-toast>` component renders an individual ephemeral or persistent notification banner. It displays status icons and styling tailored to `info`, `success`, `warning`, and `error` notification levels. The component optionally renders an interactive action button (such as "Retry" or "Undo") and a manual close button. It uses smooth CSS slide-in and fade-out transitions when entering or leaving the DOM.

### J. Toast Manager (`<yt-toast-manager>`)
The `<yt-toast-manager>` component acts as the global notification orchestrator mounted at the top-level application shell. It listens for custom `yt-toast` DOM bubbling events dispatched from any view, service, or nested component. It maintains the active notification queue, automatically dismissing timed notifications while leaving critical errors persistent until acknowledged. The manager renders an accessible ARIA live region (`aria-live="polite"` or `assertive`) so screen readers announce notifications in real time.

---

## 5. Design Tokens (`src/widgets/theme.css.ts`)

Widgets inherit centralized CSS custom properties prefixed with `--yt-` maintaining Yoto's playful, clean design language:

```css
:root {
  /* Brand Accents */
  --yt-color-primary: #ff5c35;      /* Yoto orange */
  --yt-color-primary-hover: #e04b25;
  --yt-color-surface: #ffffff;
  --yt-color-surface-subtle: #f8f9fa;
  --yt-color-surface-dark: #12161a; /* Dark canvas for pixel icon contrast */
  --yt-color-border: #e2e8f0;
  --yt-color-text: #1a202c;
  --yt-color-text-muted: #718096;

  /* Typography & Radii */
  --yt-font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --yt-radius-sm: 6px;
  --yt-radius-md: 10px;
  --yt-radius-lg: 16px;

  /* Shadows */
  --yt-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --yt-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --yt-shadow-modal: 0 20px 25px -5px rgba(0, 0, 0, 0.15);
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
