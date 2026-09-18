# Widget Library Guidelines & Component Catalog (`src/widgets/AGENTS.md`)

Welcome to `src/widgets/`! This directory contains the reusable, framework-agnostic design system and UI component primitives for `yoto-tools`.

All components in this directory adhere to the architectural specifications defined in [RFC 005: Design System & Reusable Widget Component Library](file:///home/anitschk/sandbox/yoto-tools/docs/rfcs/005-widgets-and-component-library.md).

---

## Core Guidelines for Contributors & Agents

1. **Check Here First:** Before authoring any UI element in views or submodules, inspect this catalog to reuse an existing primitive.
2. **Naming Standard:**
   - All custom elements must be prefixed with `yt-` (e.g., `<yt-button>`, `<yt-dialog>`, `<yt-pixel-icon>`).
   - All CSS custom properties must be prefixed with `--yt-` (defined in [`src/widgets/theme.css.ts`](file:///home/anitschk/sandbox/yoto-tools/src/widgets/theme.css.ts)).
3. **Keep Views Free of Ad-hoc Primitives:** If a component is missing, build it here first, write tests for it, document it in this catalog, and then consume it in the view.
4. **Automated Testing & Co-location:** Every widget must have a companion `.test.ts` file located **directly next to the source file in this directory** (e.g. `src/widgets/yt-button.test.ts` next to `src/widgets/yt-button.ts`), run via `@web/test-runner` verifying slot projection, custom event dispatch, keyboard navigation, and accessibility (`axe-core`).

---

## Component Catalog

### 1. Action Button (`<yt-button>`) — `src/widgets/yt-button.ts`
The `<yt-button>` element is the standard interactive button primitive used across all views, forms, and dialogs. It provides visual style variants including `primary` (Yoto orange), `secondary`, `subtle` (ghost), and `danger`, available in `small`, `medium` (default), and `large` sizing. When its `loading` boolean property is set, it renders an accessible spinning indicator and disables pointer interactions to prevent duplicate form or action submissions. The component provides dedicated slots for optional leading and trailing icons while forwarding standard keyboard activation and click events.

### 2. Modal Dialog (`<yt-dialog>`) — `src/widgets/yt-dialog.ts`
The `<yt-dialog>` element wraps the browser's native `<dialog>` element to provide fully accessible modal workflows for confirmations, settings, and icon selection. It invokes `dialogEl.showModal()` internally to ensure built-in top-layer elevation, background backdrop dimming, and native focus trapping. The element automatically listens for the native `cancel` event when `Escape` is pressed and dismisses when the user clicks the outer backdrop. Named slots for `header`, `default` (body content), and `footer` action buttons make composing modals consistent and straightforward.

### 3. Dropdown Menu (`<yt-dropdown>`) — `src/widgets/yt-dropdown.ts`
The `<yt-dropdown>` element provides an accessible select and combobox dropdown menu for filters, playlist selection, and sorting controls. It supports rich options containing custom pixel icons, descriptive subtitles, and status badges. Full keyboard navigation is implemented according to WAI-ARIA combobox guidelines, allowing users to traverse options with `ArrowUp` and `ArrowDown` and select with `Enter`. When closed, it collapses cleanly and traps interaction events appropriately to avoid unwanted side effects.

### 4. Text Input (`<yt-text-input>`) — `src/widgets/yt-text-input.ts`
The `<yt-text-input>` component encapsulates single-line text and search input fields with standardized styling and integrated labeling. It provides built-in support for clear buttons, prefix/suffix icons, error validation messages, and debounce timers on input events. The element properly links associated label and description elements with `aria-describedby` and `aria-invalid` attributes for screen reader accessibility. It ensures consistent border focus rings, placeholder styling, and disabled states across all forms.

### 5. Number Input (`<yt-number-input>`) — `src/widgets/yt-number-input.ts`
The `<yt-number-input>` component manages numerical value entry, such as podcast episode download limits, chapter track numbers, and playback durations. It features integrated decrement and increment stepper buttons alongside standard keyboard `ArrowUp` / `ArrowDown` stepping. The component enforces minimum, maximum, and step constraints, automatically clamping entered values on blur or change. It prevents non-numeric input and integrates cleanly with form validation states.

### 6. Status Badge (`<yt-badge>`) — `src/widgets/yt-badge.ts`
The `<yt-badge>` component renders compact status pills, category chips, and provider metadata tags across the interface. It supports semantic color variants including `success` (e.g. online player), `warning` (e.g. battery low), `danger` (e.g. sync error), and `neutral` (e.g. icon count or source tag). The badge accepts plain text, numeric counters, or compact leading micro-icons. It is engineered with crisp typography and padding optimized for dense lists and card headers.

### 7. Progress Bar (`<yt-progress-bar>`) — `src/widgets/yt-progress-bar.ts`
The `<yt-progress-bar>` element visualizes multi-step progress, such as audio file unpacking, hashing, and parallel uploads to Yoto's S3 storage. It supports both determinate modes (displaying a numeric 0–100% fill bar with optional label) and indeterminate pulsing animations for pending backend operations. The component conforms to the WAI-ARIA `progressbar` role by publishing `aria-valuenow`, `aria-valuemin`, and `aria-valuemax` attributes. Its accent color defaults to Yoto orange, transitioning smoothly during active uploads.

### 8. Pixel Icon Display (`<yt-pixel-icon>`) — `src/widgets/yt-pixel-icon.ts`
The `<yt-pixel-icon>` element standardizes the presentation of Yoto 16×16 pixel icons throughout the application. It embeds a native `<img>` with `image-rendering: pixelated` to preserve crisp, sharp pixel boundaries without blurry interpolation or artificial rounded LED effects. It exposes standard sizing presets (`sm` 24px, `md` 32px, `lg` 48px/64px) set against a dark, high-contrast canvas (`--yt-color-surface-dark`). It also manages image load failures by displaying an accessible fallback placeholder.

### 9. Toast Notification View (`<yt-toast>`) — `src/widgets/yt-toast.ts`
The `<yt-toast>` component renders an individual ephemeral or persistent notification banner. It displays status icons and styling tailored to `info`, `success`, `warning`, and `error` notification levels. The component optionally renders an interactive action button (such as "Retry" or "Undo") and a manual close button. It uses smooth CSS slide-in and fade-out transitions when entering or leaving the DOM.

### 10. Toast Manager (`<yt-toast-manager>`) — `src/widgets/yt-toast-manager.ts`
The `<yt-toast-manager>` component acts as the global notification orchestrator mounted at the top-level application shell. It listens for custom `yt-toast` DOM bubbling events dispatched from any view, service, or nested component. It maintains the active notification queue, automatically dismissing timed notifications while leaving critical errors persistent until acknowledged. The manager renders an accessible ARIA live region (`aria-live="polite"` or `assertive`) so screen readers announce notifications in real time.
